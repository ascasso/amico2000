'use strict';

// A random generator of valid Amico programs, for the differential test.
//
// Every program it makes is one the compiler has to accept and the reference
// interpreter can run to an end: each name is assigned on every path before
// it is read, a table is never read past its end, and a loop always reaches a
// `stop` or a `break`. Given the same seed it makes the same program, so a failure can be
// made again from its seed alone.
//
// What it leans on: nested `if`s with and without `else`, chains of `else if`
// with and without an `else` at their end, conditions of two
// and three comparisons joined by `and` or by `or`, arms long enough to need a
// long branch, `for` loops that count up and down, between numbers and
// between constants, to the edges of a byte, one inside another, with their
// names read inside and afterwards, `break` and `next` in the arms of `if`s
// inside both kinds of loop, statements after a loop that a `break` leaves,
// tables by a formula and written out, read by a literal and by a variable, memory locations and rows of bytes named in page zero
// and above it, the row of segments the language starts with, two names for
// one byte, display
// fields as operands and as targets, constants and the key names standing
// where a literal may, names that begin like words of the language, literals
// spelt several ways, and operators written with and without spaces. And
// `decimal` blocks: sums of bytes that are two decimal digits, kept in names
// that never hold anything else, with `if`s, loops and the other operators
// among them, in and under loops, left by their `end` and by a `break` or a
// `next` to a loop outside, and followed by sums that have to be binary again.
// The differential test counts each of those from the source it is given, and
// holds a floor under it: this file's own counts are not taken on trust.
//
// What it does not make, and what covers that instead:
// - programs the compiler should refuse: tests/compiler-assignment.test.js
//   tries every small one;
// - a `loop` that has one thing in the accumulator on the way in and another
//   on the way back. Its `loop`s count in a variable that is in the
//   accumulator both times, so they cannot show a value wrongly kept across a
//   loop head. The differential test has programs written by hand for that;
// - the key routines, which need the monitor and real time, and `call`, since
//   what a routine does to memory is not the language's to say;
// - `display.hold()`, which never comes back, so that there is no moment at
//   which to read the board. tests/compiler.test.js runs it, and the oracle
//   in tests/compiler-assignment.test.js tries it as the end of a path;
// - a sum in decimal of a byte that is not two decimal digits, which the
//   language leaves to the 6502. Inside a `decimal` block `+` and `-` are
//   given only numbers of two digits and the names kept for them.

const NAMES = ['a', 'b', 'x1', 'left', 'take', 'iffy', 'loops', 'end_x', 'stopped', 'constant',
    'elsewhere', 'display_x', 'n', 'k_9', 'zz', 'v_a_r', 'tmp', 'q', 'decimal_x'];
// Names that hold two decimal digits and nothing else, wherever they are
// assigned: a number of two digits, one another, or a sum made in decimal of
// those. So any of them can be added or subtracted in a `decimal` block.
const DECIMAL_NAMES = ['secs', 'mins', 'tens'];
const FIELDS = ['display.high', 'display.low', 'display.data'];
const OPERATORS = ['+', '-', '&', '|', '^'];
const COMPARISONS = ['<', '<=', '>', '>=', '==', '!='];
const KEY_CODES = { 'keypad.ad': 0x10, 'keypad.da': 0x11, 'keypad.inc': 0x12, 'keypad.run': 0x13, 'keypad.reg': 0x14, 'keypad.none': 0x15 };
const KEY_NAMES = ['keypad.ad', 'keypad.da', 'keypad.inc', 'keypad.run', 'keypad.reg', 'keypad.none'];

// xorshift32: small, and the same on every machine. Seeds are small whole
// numbers, and xorshift's first outputs from a small state are small too, so
// the seed is spread over the 32 bits first and a few rounds thrown away.
// Without that, the first choice a program makes came out the same way for
// nearly every seed.
function randomSource(seed) {
    let state = Math.imul(seed, 0x9e3779b1) >>> 0 || 1;
    const next = () => {
        state ^= state << 13; state >>>= 0;
        state ^= state >>> 17;
        state ^= state << 5; state >>>= 0;
        return state / 4294967296;
    };
    for (let round = 0; round < 8; round++) next();
    return {
        next,
        between: (low, high) => low + Math.floor(next() * (high - low + 1)),
        pick: (list) => list[Math.floor(next() * list.length)],
        chance: (probability) => next() < probability
    };
}

/**
 * One program from one seed.
 *
 * `scans` sprinkles display.scan() among the statements. `long` gives one
 * `if` an arm of two dozen statements or more, which is past the reach of a
 * 6502 branch.
 *
 * Returns the source and a count of what it contains, for the test to check
 * that it is still exercising what it is meant to.
 */
function generate(seed, { scans = false, long = false } = {}) {
    const random = randomSource(seed);
    const { between, pick, chance } = random;
    const made = { longArm: false, loops: 0, fors: 0, breaks: 0, nexts: 0, joined: 0, chains: 0, tableReads: 0, elseArms: 0, depth: 0, scans: 0, constants: 0, writtenTables: 0, places: 0, rowUses: 0, decimals: 0, sums: 0, leftDecimal: 0 };
    const lines = [];
    const counters = new Set();
    let counterNumber = 0;
    // The loops a statement is inside, the innermost last. A `break` or a
    // `next` concerns that one, and leaves with it the names assigned where
    // it stands: `leaves` for each `break`, `rounds` for each `next`. A loop
    // that counts at its foot cannot take a `next`, which would pass over
    // the counting and never end.
    const around = [];
    // Whether the statements being made are inside a `decimal` block, and
    // the depth of the block that the `decimal` line is in.
    let inDecimal = false;
    let decimalAt = 0;
    const onEvery = (paths) => new Set([...paths[0]].filter((name) => paths.every((path) => path.has(name))));

    function spell(value) {
        const roll = random.next();
        if (roll < 0.5) return String(value);
        if (roll < 0.75) return '$' + value.toString(16);
        if (roll < 0.9) return '$' + value.toString(16).toUpperCase().padStart(2, '0');
        return '0' + String(value);
    }
    // Half the programs declare a constant or three, first of all, as the
    // language wants. A constant is given a literal or an earlier constant.
    const constants = [];
    if (chance(0.5)) {
        for (const name of ['c_limit', 'c_step', 'c_mask'].slice(0, between(1, 3))) {
            const earlier = constants.length && chance(0.25) ? pick(constants) : null;
            // Many are small, so that some can be a table's last index without
            // making the table, and the program, too long for the board.
            const value = earlier ? earlier.value
                : chance(0.3) ? pick([0, 1, 127, 128, 255]) : chance(0.4) ? between(0, 20) : between(0, 255);
            lines.push(`const ${name} = ${earlier ? earlier.name : spell(value)}`);
            constants.push({ name, value });
        }
    }
    // A constant whose value is no more than `most`, by name, or null.
    function constantUpTo(most) {
        const fitting = constants.filter((constant) => constant.value <= most);
        if (!fitting.length) return null;
        made.constants++;
        return pick(fitting);
    }
    function literal() {
        if (constants.length && chance(0.2)) return constantUpTo(255).name;
        if (chance(0.04)) {
            made.constants++;
            return pick(KEY_NAMES);
        }
        return spell(chance(0.3) ? pick([0, 1, 127, 128, 255, 254]) : between(0, 255));
    }
    function joined(left, operator, right) {
        return chance(0.15) ? `${left}${operator}${right}` : `${left} ${operator} ${right}`;
    }
    // A byte of two decimal digits: often one at an edge, where a sum carries
    // from the units or wraps at a hundred. Written in hex as a rule, as it
    // would be, and now and then as the same byte in decimal or by a
    // constant that happens to be one.
    const isDigits = (value) => (value & 15) <= 9 && value <= 0x99;
    function twoDigits() {
        const named = constants.filter((constant) => isDigits(constant.value));
        if (named.length && chance(0.15)) {
            made.constants++;
            return pick(named).name;
        }
        const value = chance(0.35) ? pick([0, 1, 9, 0x10, 0x49, 0x50, 0x90, 0x99]) : between(0, 9) * 16 + between(0, 9);
        return chance(0.75) ? '$' + value.toString(16).padStart(2, '0') : spell(value);
    }
    // Something that is certainly two decimal digits: one of the names kept
    // for them, if it is assigned on every path to here, or a number.
    function inDigits(assigned) {
        const kept = DECIMAL_NAMES.filter((name) => assigned.has(name));
        return kept.length && chance(0.65) ? pick(kept) : twoDigits();
    }
    // A sum for a `decimal` block: both its bytes are two decimal digits.
    function decimalSum(assigned) {
        made.sums++;
        return joined(inDigits(assigned), pick(['+', '-']), inDigits(assigned));
    }
    // Inside a `decimal` block the generator's other operations keep to the
    // operators that decimal mode leaves alone: their operands are anything.
    const operator = () => pick(inDecimal ? ['&', '|', '^'] : OPERATORS);

    // Half the programs name memory locations: one in page zero, often one
    // above it, which different instructions reach, and often a third. The
    // third is sometimes a second name for the first one's byte or for a
    // display field's: nothing forbids two names for a byte, and the compiler
    // must not be fooled by it. Every one holds something before the program
    // starts, as a display field does, so they are read from the first line.
    const places = [];
    if (chance(0.5)) {
        places.push({ name: 'm_near', address: between(0x80, 0xdf) });
        if (chance(0.7)) places.push({ name: 'm_far', address: between(0x0400, 0x07ff) });
        if (chance(0.5)) {
            const roll = random.next();
            places.push({ name: 'm_also', address: roll < 0.4 ? places[0].address : roll < 0.6 ? pick([0xf9, 0xfa, 0xfb]) : between(0x80, 0xdf) });
        }
        for (const place of places) {
            const written = chance(0.2) ? String(place.address) : '$' + place.address.toString(16).padStart(chance(0.5) ? 4 : 2, '0');
            lines.push(`byte ${place.name} at ${written}`);
        }
        made.places = places.length;
    }
    // Four programs in ten name a row of bytes or two: one wholly in page
    // zero, where an indexed instruction carries one byte of address, and one
    // above it. They may lie over a named location or over each other; that
    // is allowed, and the bytes are then the same bytes.
    const rows = [];
    if (chance(0.4)) {
        if (chance(0.7)) rows.push({ name: 'r_near', address: between(0x80, 0xd0), length: between(1, 12) });
        if (!rows.length || chance(0.5)) rows.push({ name: 'r_far', address: between(0x0400, 0x07e0), length: between(1, 20) });
        for (const row of rows) {
            const counted = chance(0.25) ? '$' + row.length.toString(16) : String(row.length);
            lines.push(`byte ${row.name}[${counted}] at $${row.address.toString(16)}`);
        }
    }
    // One program in five uses the row the language starts with, which needs
    // no declaring: the six bytes the monitor shows as segments.
    if (chance(0.2)) rows.push({ name: 'display.segment', address: 0x8f, length: 6 });
    // What can be read from the first line and is no variable of the program's.
    const fixed = FIELDS.concat(places.map((place) => place.name));

    const tables = [];
    const tableCount = chance(0.8) ? between(1, 3) : 0;
    for (let number = 0; number < tableCount; number++) {
        // Three tables in ten are written out, a byte at a time.
        if (chance(0.3)) {
            const length = between(1, 12);
            const bytes = Array.from({ length }, () => literal());
            tables.push({ name: 't' + number, length });
            lines.push(`const t${number} = table byte = ${bytes.join(chance(0.5) ? ', ' : ',')}`);
            made.writtenTables++;
            continue;
        }
        // The last index is a number, or a constant small enough to be one.
        const named = chance(0.3) ? constantUpTo(20) : null;
        const last = named ? named.value : chance(0.15) ? between(40, 120) : between(0, 20);
        const index = pick(['n', 'i', 'idx']);
        const term = () => (chance(0.6) ? index : literal());
        const formula = chance(0.25) ? term() : `${term()} ${pick(['*', '+', '-'])} ${term()}`;
        tables.push({ name: 't' + number, length: last + 1 });
        lines.push(`const t${number} = table byte [${index} in 0..${named ? named.name : spell(last)}] = ${formula}`);
    }

    const variablesIn = (assigned) => [...assigned].filter((name) => !fixed.includes(name));

    // Something to compute with: a literal, a display field or a name that
    // is assigned on every path to here.
    function operand(assigned) {
        const variables = variablesIn(assigned);
        const roll = random.next();
        if (roll < 0.3 || (variables.length === 0 && roll < 0.6)) return literal();
        if (roll < 0.5 || variables.length === 0) return pick(fixed);
        return pick(variables);
    }
    function stored(assigned) {
        const variables = variablesIn(assigned);
        return variables.length && chance(0.7) ? pick(variables) : pick(fixed);
    }
    function target(variableOnly) {
        if (!variableOnly && chance(0.25)) return pick(fixed);
        let name;
        do { name = pick(NAMES); } while (counters.has(name));
        return name;
    }

    // A table read into `into`. A literal index is in range by choice. A
    // variable index is kept in range by a mask or by an `if` around the
    // read; in the second case the name counts as assigned afterwards only
    // if an `else` assigns it too.
    function tableRead(indent, assigned, into) {
        const table = pick(tables);
        const roll = random.next();
        made.tableReads++;
        if (roll < 0.25) {
            lines.push(`${indent}${into} = ${table.name}[${spell(between(0, table.length - 1))}]`);
            assigned.add(into);
            return;
        }
        const index = stored(assigned);
        if (roll < 0.6) {
            let mask = 1;
            while (mask * 2 <= table.length) mask *= 2;
            const masked = target(true);
            lines.push(`${indent}${masked} = ${joined(index, '&', spell(mask - 1))}`);
            assigned.add(masked);
            lines.push(`${indent}${into} = ${table.name}[${masked}]`);
            assigned.add(into);
            return;
        }
        lines.push(`${indent}if ${index} < ${spell(table.length)}`);
        lines.push(`${indent}    ${into} = ${table.name}[${chance(0.5) ? '' : ' '}${index}${chance(0.5) ? '' : ' '}]`);
        if (chance(0.5)) {
            made.elseArms++;
            lines.push(`${indent}else`);
            lines.push(`${indent}    ${into} = ${operand(assigned)}`);
            lines.push(`${indent}end`);
            assigned.add(into);
        } else {
            lines.push(`${indent}end`);
        }
    }

    // An index into something `length` long, kept in range the way a table's
    // is: a literal, or a variable masked on the line before.
    function indexInto(indent, assigned, length) {
        if (chance(0.4)) return spell(between(0, length - 1));
        let mask = 1;
        while (mask * 2 <= length) mask *= 2;
        const masked = target(true);
        lines.push(`${indent}${masked} = ${joined(stored(assigned), '&', spell(mask - 1))}`);
        assigned.add(masked);
        return masked;
    }
    // One byte of a row read into a name, or written from an operand.
    function rowUse(indent, assigned) {
        const row = pick(rows);
        made.rowUses++;
        if (chance(0.5)) {
            const into = target(false);
            lines.push(`${indent}${into} = ${row.name}[${indexInto(indent, assigned, row.length)}]`);
            assigned.add(into);
        } else {
            const index = indexInto(indent, assigned, row.length);
            lines.push(`${indent}${row.name}[${chance(0.5) ? '' : ' '}${index}${chance(0.5) ? '' : ' '}] = ${operand(assigned)}`);
        }
    }

    // One of the names kept for decimal digits is given a number or another
    // of them, anywhere; inside a `decimal` block it is more often a sum, and
    // the sum sometimes goes to a display field or to any other name.
    function decimalAssignment(indent, assigned) {
        if (inDecimal && chance(0.8)) {
            const value = decimalSum(assigned);
            const into = chance(0.7) ? pick(DECIMAL_NAMES) : target(false);
            lines.push(`${indent}${into} = ${value}`);
            assigned.add(into);
            return;
        }
        const value = inDigits(assigned);
        const into = pick(DECIMAL_NAMES);
        lines.push(`${indent}${into} = ${value}`);
        assigned.add(into);
    }

    function assignment(indent, assigned) {
        if (chance(inDecimal ? 0.5 : 0.06)) {
            decimalAssignment(indent, assigned);
            return;
        }
        if (rows.length && chance(0.2)) {
            rowUse(indent, assigned);
            return;
        }
        const into = target(false);
        const roll = random.next();
        if (tables.length && roll < 0.15) {
            tableRead(indent, assigned, into);
            return;
        }
        const value = roll < 0.4 ? operand(assigned) : joined(operand(assigned), operator(), operand(assigned));
        lines.push(`${indent}${into} = ${value}`);
        assigned.add(into);
    }

    // What a literal or a constant stands for, however it is spelt; null for
    // anything that is not known until the program runs.
    function numberOf(text) {
        const constant = constants.find((known) => known.name === text);
        if (constant) return constant.value;
        if (text in KEY_CODES) return KEY_CODES[text];
        if (/^\$[0-9a-fA-F]+$/.test(text)) return parseInt(text.slice(1), 16);
        return /^[0-9]+$/.test(text) ? Number(text) : null;
    }
    // The left of a comparison may be an operation or a table read; the
    // right is always a single operand, as the language has it. All six
    // comparisons, against numbers and against names, 0 and 255 among the
    // numbers. `> 255` and `<= 255` the compiler refuses, as saying nothing,
    // so against 255 one of the other four is written.
    function comparison(assigned) {
        const roll = random.next();
        let left;
        if (roll < 0.15) {
            left = inDecimal && chance(0.5) ? decimalSum(assigned) : joined(operand(assigned), operator(), operand(assigned));
        } else if (roll < 0.2 && tables.length) {
            const table = pick(tables);
            left = `${table.name}[${spell(between(0, table.length - 1))}]`;
        } else if (roll < 0.26 && rows.length) {
            const row = pick(rows);
            made.rowUses++;
            left = `${row.name}[${spell(between(0, row.length - 1))}]`;
        } else {
            left = operand(assigned);
        }
        const right = operand(assigned);
        let compare = pick(COMPARISONS);
        if (numberOf(right) === 255 && (compare === '>' || compare === '<=')) compare = pick(['<', '>=', '==', '!=']);
        return chance(0.15) ? `${left}${compare}${right}` : `${left} ${compare} ${right}`;
    }
    // One comparison, or two or three joined by the same word.
    function condition(assigned) {
        if (!chance(0.25)) return comparison(assigned);
        made.joined++;
        const word = chance(0.5) ? ' and ' : ' or ';
        return Array.from({ length: chance(0.7) ? 2 : 3 }, () => comparison(assigned)).join(word);
    }

    // `count` statements at one depth. Returns the names assigned on every
    // path out of the block, and whether any path leaves it at all: a block
    // that ends in `stop` or in a loop has no way out.
    function block(indent, assigned, depth, count, mayLoop) {
        made.depth = Math.max(made.depth, depth);
        for (let i = 0; i < count; i++) {
            if (scans && chance(0.08)) {
                // Either of the monitor's two ways of showing the displays.
                lines.push(`${indent}${chance(0.3) ? 'display.show()' : 'display.scan()'}`);
                made.scans++;
            }
            if (depth < 6 && chance(depth < 3 ? 0.1 : 0.04)) {
                const over = chance(0.65) ? countedLoop(indent, assigned, depth) : leavingLoop(indent, assigned, depth);
                if (over.ends) return { assigned, ends: true };
                assigned = over.assigned;
            } else if (!inDecimal && depth < 6 && chance(0.07)) {
                // A `decimal` block: a few statements, sums among them. It
                // is no branch, so what it assigns is assigned after it, and
                // if its statements cannot be passed nothing follows it.
                lines.push(`${indent}decimal`);
                made.decimals++;
                inDecimal = true;
                decimalAt = depth;
                const inside = block(indent + '    ', assigned, depth + 1, between(1, 4), depth < 3 && chance(0.15));
                inDecimal = false;
                lines.push(`${indent}end`);
                if (inside.ends) return { assigned, ends: true };
                assigned = inside.assigned;
            } else if (depth < 7 && random.next() < (depth < 4 ? 0.36 : 0.15)) {
                lines.push(`${indent}if ${condition(assigned)}`);
                const longArm = !made.longArm && long && chance(0.5);
                if (longArm) made.longArm = true;
                const arms = [block(indent + '    ', new Set(assigned), depth + 1,
                    longArm ? between(24, 34) : between(0, depth < 4 ? 3 : 2), true)];
                // One time in seven the `if` goes on to another condition,
                // and now and then to a third. Their arms are short, or too
                // few of the programs would fit the board.
                const others = chance(0.14) ? (chance(0.3) ? 2 : 1) : 0;
                if (others) made.chains++;
                for (let other = 0; other < others; other++) {
                    lines.push(`${indent}else if ${condition(assigned)}`);
                    arms.push(block(indent + '    ', new Set(assigned), depth + 1, between(0, 2), false));
                }
                // With no `else`, the way past every condition brings what
                // the `if` started with.
                if (chance(0.45)) {
                    made.elseArms++;
                    lines.push(`${indent}else`);
                    arms.push(block(indent + '    ', new Set(assigned), depth + 1, between(0, depth < 4 ? 3 : 2), true));
                } else {
                    arms.push({ assigned: new Set(assigned), ends: false });
                }
                lines.push(`${indent}end`);
                const open = arms.filter((arm) => !arm.ends).map((arm) => arm.assigned);
                if (!open.length) return { assigned, ends: true };
                assigned = onEvery(open);
            } else {
                assignment(indent, assigned);
            }
        }
        if (mayLoop && depth < 5 && chance(depth === 0 ? 0.35 : 0.12)) {
            return countingLoop(indent, assigned, depth);
        }
        // A way out of the loop this block is in, or round it again: often
        // at the end of an `if`'s arm, now and then at the end of the loop's
        // own statements.
        const loop = around[around.length - 1];
        if (loop && chance(depth > loop.depth + 1 ? 0.3 : 0.04)) {
            const word = loop.mayNext && chance(0.5) ? 'next' : 'break';
            lines.push(indent + word);
            (word === 'break' ? loop.leaves : loop.rounds).push(new Set(assigned));
            made[word === 'break' ? 'breaks' : 'nexts']++;
            // A jump to a loop that the `decimal` block is inside leaves the
            // block, and what follows it has to be in binary.
            if (inDecimal && loop.depth < decimalAt) made.leftDecimal++;
            return { assigned, ends: true };
        }
        if (depth > 0 && chance(0.06)) {
            lines.push(`${indent}stop`);
            return { assigned, ends: true };
        }
        return { assigned, ends: false };
    }

    // A `for`: a few rounds, up or down, between literals or constants,
    // sometimes at the edge of a byte, where the count wraps as it leaves.
    // Its name is read like any other, inside and afterwards, and is never
    // assigned inside. What is assigned when the loop is over is what every
    // way out of it has assigned: each `break`, and the foot of the loop,
    // which the end of the statements and each `next` lead to.
    function countedLoop(indent, assigned, depth) {
        made.fors++;
        const name = 'f' + counterNumber++;
        const rounds = chance(0.15) ? 1 : between(2, 6);
        const down = chance(0.4);
        const edge = random.next();
        // The first value: against 0 or 255 a time in three, so that the
        // step past the last value is the wrap.
        const low = edge < 0.2 ? 0 : edge < 0.35 ? 256 - rounds : between(0, 256 - rounds);
        const [first, last] = down ? [low + rounds - 1, low] : [low, low + rounds - 1];
        const written = (value) => {
            const named = chance(0.25) ? constants.filter((constant) => constant.value === value) : [];
            if (!named.length) return spell(value);
            made.constants++;
            return pick(named).name;
        };
        lines.push(`${indent}for ${name} in ${written(first)}${chance(0.2) ? ' .. ' : '..'}${written(last)}`);
        counters.add(name);
        const inside = new Set(assigned);
        inside.add(name);
        const loop = { depth, leaves: [], rounds: [], mayNext: true };
        around.push(loop);
        const body = block(indent + '    ', inside, depth + 1, between(0, 4), depth < 3 && chance(0.3));
        around.pop();
        lines.push(`${indent}end`);
        counters.delete(name);
        const foot = loop.rounds.concat(body.ends ? [] : [body.assigned]);
        const out = loop.leaves.concat(foot.length ? [onEvery(foot)] : []);
        return out.length ? { assigned: onEvery(out), ends: false } : { assigned, ends: true };
    }

    // A `loop` that a `break` leaves: it counts at its top and leaves when
    // the count is reached, so a `next` anywhere below is safe. What follows
    // the loop is reached, and has what every `break` had assigned.
    function leavingLoop(indent, assigned, depth) {
        made.loops++;
        made.breaks++;
        const counter = 'cnt' + counterNumber++;
        counters.add(counter);
        const rounds = between(1, 5);
        lines.push(`${indent}${counter} = 0`);
        lines.push(`${indent}loop`);
        const inside = new Set(assigned);
        inside.add(counter);
        lines.push(`${indent}    ${counter} = ${counter} + 1`);
        lines.push(`${indent}    if ${counter} ${chance(0.5) ? '==' : '>='} ${rounds}`);
        lines.push(`${indent}        break`);
        lines.push(`${indent}    end`);
        const loop = { depth, leaves: [new Set(inside)], rounds: [], mayNext: true };
        around.push(loop);
        block(indent + '    ', inside, depth + 1, between(0, 5), false);
        around.pop();
        lines.push(`${indent}end`);
        counters.delete(counter);
        return { assigned: onEvery(loop.leaves), ends: false };
    }

    // A loop that counts a few rounds in a variable of its own and stops:
    // down to zero, up past a limit, or up to a value tested with `!=` and
    // an `else`.
    function countingLoop(indent, assigned, depth) {
        made.loops++;
        const counter = 'cnt' + counterNumber++;
        counters.add(counter);
        // The third kind counts from 250, which is no two decimal digits, so
        // a loop inside a `decimal` block is one of the first two.
        const style = between(0, inDecimal ? 1 : 2);
        const rounds = between(1, 5);
        lines.push(`${indent}${counter} = ${style === 0 ? rounds : style === 1 ? 0 : 250}`);
        lines.push(`${indent}loop`);
        const inside = new Set(assigned);
        inside.add(counter);
        const loop = { depth, leaves: [], rounds: [], mayNext: false };
        around.push(loop);
        const body = block(indent + '    ', inside, depth + 1, between(0, 6), false);
        around.pop();
        if (!body.ends) {
            if (style === 0) {
                lines.push(`${indent}    ${counter} = ${counter} - 1`);
                lines.push(`${indent}    if ${counter} == 0`);
            } else if (style === 1) {
                lines.push(`${indent}    ${counter} = ${counter} + 2`);
                lines.push(`${indent}    if ${counter} >= ${rounds * 2}`);
            } else {
                lines.push(`${indent}    ${counter} = 1 + ${counter}`);
                lines.push(`${indent}    if ${counter} != ${250 + rounds}`);
                lines.push(`${indent}    else`);
            }
            lines.push(`${indent}        stop`);
            lines.push(`${indent}    end`);
        }
        lines.push(`${indent}end`);
        counters.delete(counter);
        // Nothing follows such a loop unless a `break` inside leaves it.
        return loop.leaves.length ? { assigned: onEvery(loop.leaves), ends: false } : { assigned, ends: true };
    }

    // The display fields hold something before the program starts, so they
    // can be read from the first line.
    const whole = block('', new Set(fixed), 0, between(1, long ? 6 : 10), true);
    if (!whole.ends && chance(0.1)) lines.push('stop');
    return { source: lines.join('\n') + '\n', made };
}

module.exports = { generate };
