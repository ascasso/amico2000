'use strict';

// A random generator of valid Amico programs, for the differential test.
//
// Every program it makes is one the compiler has to accept and the reference
// interpreter can run to an end: each name is assigned on every path before
// it is read, a table is never read past its end, and a loop always reaches a
// `stop`. Given the same seed it makes the same program, so a failure can be
// made again from its seed alone.
//
// What it leans on: nested `if`s with and without `else`, arms long enough to
// need a long branch, tables by a formula and written out, read by a literal
// and by a variable, memory locations named in page zero and above it, two
// names for one byte, display
// fields as operands and as targets, constants and the key names standing
// where a literal may, names that begin like words of the language, literals
// spelt several ways, and operators written with and without spaces.
//
// What it does not make, and what covers that instead:
// - programs the compiler should refuse: tests/compiler-assignment.test.js
//   tries every small one;
// - a loop that has one thing in the accumulator on the way in and another on
//   the way back. Its loops count in a variable that is in the accumulator
//   both times, so they cannot show a value wrongly kept across a loop head.
//   The differential test has programs written by hand for that;
// - the key routines, which need the monitor and real time, and `call`, since
//   what a routine does to memory is not the language's to say;
// - `display.hold()`, which never comes back, so that there is no moment at
//   which to read the board. tests/compiler.test.js runs it, and the oracle
//   in tests/compiler-assignment.test.js tries it as the end of a path.

const NAMES = ['a', 'b', 'x1', 'left', 'take', 'iffy', 'loops', 'end_x', 'stopped', 'constant',
    'elsewhere', 'display_x', 'n', 'k_9', 'zz', 'v_a_r', 'tmp', 'q'];
const FIELDS = ['display.high', 'display.low', 'display.data'];
const OPERATORS = ['+', '-', '&', '|', '^'];
const COMPARISONS = ['<', '>=', '==', '!='];
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
    const made = { longArm: false, loops: 0, tableReads: 0, elseArms: 0, depth: 0, scans: 0, constants: 0, writtenTables: 0, places: 0 };
    const lines = [];
    const counters = new Set();
    let counterNumber = 0;

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

    function assignment(indent, assigned) {
        const into = target(false);
        const roll = random.next();
        if (tables.length && roll < 0.15) {
            tableRead(indent, assigned, into);
            return;
        }
        const value = roll < 0.4 ? operand(assigned) : joined(operand(assigned), pick(OPERATORS), operand(assigned));
        lines.push(`${indent}${into} = ${value}`);
        assigned.add(into);
    }

    // The left of a comparison may be an operation or a table read; the
    // right is always a single operand, as the language has it.
    function condition(assigned) {
        const roll = random.next();
        let left;
        if (roll < 0.15) {
            left = joined(operand(assigned), pick(OPERATORS), operand(assigned));
        } else if (roll < 0.2 && tables.length) {
            const table = pick(tables);
            left = `${table.name}[${spell(between(0, table.length - 1))}]`;
        } else {
            left = operand(assigned);
        }
        return `${left} ${pick(COMPARISONS)} ${operand(assigned)}`;
    }

    // `count` statements at one depth. Returns the names assigned on every
    // path out of the block, and whether any path leaves it at all: a block
    // that ends in `stop` or in a loop has no way out.
    function block(indent, assigned, depth, count, mayLoop) {
        made.depth = Math.max(made.depth, depth);
        for (let i = 0; i < count; i++) {
            if (scans && chance(0.08)) {
                lines.push(`${indent}display.scan()`);
                made.scans++;
            }
            if (depth < 7 && random.next() < (depth < 4 ? 0.36 : 0.15)) {
                lines.push(`${indent}if ${condition(assigned)}`);
                const longArm = !made.longArm && long && chance(0.5);
                if (longArm) made.longArm = true;
                const then = block(indent + '    ', new Set(assigned), depth + 1,
                    longArm ? between(24, 34) : between(0, depth < 4 ? 3 : 2), true);
                let otherwise = { assigned: new Set(assigned), ends: false };
                if (chance(0.45)) {
                    made.elseArms++;
                    lines.push(`${indent}else`);
                    otherwise = block(indent + '    ', new Set(assigned), depth + 1, between(0, depth < 4 ? 3 : 2), true);
                }
                lines.push(`${indent}end`);
                if (then.ends && otherwise.ends) return { assigned, ends: true };
                if (then.ends) assigned = otherwise.assigned;
                else if (otherwise.ends) assigned = then.assigned;
                else assigned = new Set([...then.assigned].filter((name) => otherwise.assigned.has(name)));
            } else {
                assignment(indent, assigned);
            }
        }
        if (mayLoop && depth < 5 && chance(depth === 0 ? 0.35 : 0.12)) {
            countingLoop(indent, assigned, depth);
            return { assigned, ends: true };
        }
        if (depth > 0 && chance(0.06)) {
            lines.push(`${indent}stop`);
            return { assigned, ends: true };
        }
        return { assigned, ends: false };
    }

    // A loop that counts a few rounds in a variable of its own and stops:
    // down to zero, up past a limit, or up to a value tested with `!=` and
    // an `else`.
    function countingLoop(indent, assigned, depth) {
        made.loops++;
        const counter = 'cnt' + counterNumber++;
        counters.add(counter);
        const style = between(0, 2);
        const rounds = between(1, 5);
        lines.push(`${indent}${counter} = ${style === 0 ? rounds : style === 1 ? 0 : 250}`);
        lines.push(`${indent}loop`);
        const inside = new Set(assigned);
        inside.add(counter);
        const body = block(indent + '    ', inside, depth + 1, between(0, 6), false);
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
    }

    // The display fields hold something before the program starts, so they
    // can be read from the first line.
    const whole = block('', new Set(fixed), 0, between(1, long ? 6 : 10), true);
    if (!whole.ends && chance(0.1)) lines.push('stop');
    return { source: lines.join('\n') + '\n', made };
}

module.exports = { generate };
