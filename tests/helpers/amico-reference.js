'use strict';

// A reference interpreter for Amico, for the tests to hold the compiler to.
//
// It is written from the language as compiler/README.md describes it and
// shares no code with compiler/: a mistake made in both places would hide
// itself. Keep it that way. When the language gains a construct, describe it
// in the README first and add it here from that description, not from the
// compiler.
//
// It knows what a program computes: its own names, its tables, and the bytes
// of the board's memory that it reaches by name, which are the three display
// fields and whatever locations and rows it has named with `byte ... at`.
// Those are
// kept as memory, by address, so that two names for one byte are one byte
// here as on the board. display.scan() and display.show() change none of it,
// so here they do nothing. The key routines are not modelled at all; a test
// that needs them drives the real monitor.

// Where the README says the three display fields are.
const FIELDS = { 'display.high': 0xfb, 'display.low': 0xfa, 'display.data': 0xf9 };
// The six digits as raw segments: the README has them at $8F-$94, a row.
const SEGMENTS = { address: 0x8f, count: 6 };
// The README's names for the codes of the keys that are not hex digits.
const KEY_NAMES = {
    'keypad.ad': 0x10, 'keypad.da': 0x11, 'keypad.inc': 0x12,
    'keypad.run': 0x13, 'keypad.reg': 0x14, 'keypad.none': 0x15
};

// The alphabet for the displays, as the README has it from the manual's
// Tabella 18: the segments that draw each character, a letter in either case.
const SEGMENTS_OF = {
    '0': 0x3f, '1': 0x06, '2': 0x5b, '3': 0x4f, '4': 0x66, '5': 0x6d, '6': 0x7d, '7': 0x07, '8': 0x7f, '9': 0x6f,
    a: 0x77, b: 0x7c, c: 0x39, d: 0x5e, e: 0x79, f: 0x71, g: 0x3d, h: 0x76, i: 0x06, j: 0x1e,
    l: 0x38, n: 0x54, o: 0x3f, p: 0x73, q: 0x67, r: 0x50, s: 0x6d, t: 0x78, u: 0x3e, y: 0x6e,
    '-': 0x40, ' ': 0x00
};

// A byte written in decimal or as $hex, or the name of a constant, which
// stands wherever a literal may. Null if the text is some other name.
function literal(text, constants) {
    if (constants.has(text)) return constants.get(text);
    if (/^\$[0-9a-fA-F]+$/.test(text)) return parseInt(text.slice(1), 16);
    if (/^[0-9]+$/.test(text)) return parseInt(text, 10);
    return null;
}

// The table a declaration describes: one byte for each index from 0 to the
// last, the formula worked out for that index and kept modulo 256.
function tableBytes(indexName, last, formula, constants) {
    const parts = formula.trim().split(/\s*([*+-])\s*/);
    const term = (text, index) => (text === indexName ? index : literal(text, constants));
    const bytes = [];
    for (let index = 0; index <= literal(last, constants); index++) {
        let value = term(parts[0], index);
        if (parts.length === 3) {
            const other = term(parts[2], index);
            value = parts[1] === '*' ? value * other : parts[1] === '+' ? value + other : value - other;
        }
        bytes.push(((value % 256) + 256) % 256);
    }
    return bytes;
}

// Inside a `decimal` block a byte is two decimal digits, one in each half:
// $59 is fifty-nine. The README says what a sum is only when both its bytes
// are that, so a sum of any other byte is an error here, and no test may
// depend on one.
function digits(byte, expression) {
    if ((byte & 15) > 9 || (byte >> 4) > 9) {
        throw new Error('A sum in decimal of a byte that is not two decimal digits: ' + expression);
    }
    return (byte >> 4) * 10 + (byte & 15);
}
// A number from 0 to 99 as such a byte.
const asDigits = (number) => (Math.floor(number / 10) << 4) | (number % 10);

// A condition: one comparison, or several joined all by `and` or all by `or`.
function conditionOf(written) {
    const joined = written.split(/\s+(and|or)\s+/);
    const tests = joined.filter((_, at) => at % 2 === 0).map((comparison) => {
        const [, left, compare, right] = /^(.+?)\s*(>=|<=|==|!=|<|>)\s*(\S+)$/.exec(comparison);
        return { left, compare, right };
    });
    return { tests, join: joined[1] || 'and' };
}

// Reads a program into its declarations and a tree of statements. It is as
// strict as it needs to be for programs the compiler accepts, and no
// stricter: what the compiler should refuse is another test's business.
function parse(source) {
    const tables = new Map();
    const constants = new Map(Object.entries(KEY_NAMES));
    // A name the program gives to a memory location: its address, and for a
    // row of bytes how many there are. `count` is null for a single byte.
    const places = new Map([['display.segment', SEGMENTS]]);
    const program = { kind: 'program', body: [] };
    const open = [program];
    let into = program.body;

    for (const raw of source.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim();
        if (!line) continue;
        let match;
        if ((match = /^const\s+([a-z][a-z0-9_]*)\s*=\s*table\s+segments\s*"([^"]*)"$/.exec(line))) {
            // A table from a text: a byte of segments to each character,
            // spaces included wherever they stand.
            tables.set(match[1], [...match[2]].map((character) => {
                const segments = SEGMENTS_OF[character.toLowerCase()];
                if (segments === undefined) throw new Error('Not in the alphabet for the displays: ' + character);
                return segments;
            }));
        } else if ((match = /^const\s+([a-z][a-z0-9_]*)\s*=\s*table\s+byte\s*=\s*(.+)$/.exec(line))) {
            // A table written out: its bytes, with commas between them.
            tables.set(match[1], match[2].split(',').map((piece) => literal(piece.trim(), constants)));
        } else if ((match = /^const\s+([a-z][a-z0-9_]*)\s*=\s*table\s+byte\s*\[\s*([a-z][a-z0-9_]*)\s+in\s+0\s*\.\.\s*(\S+?)\s*\]\s*=\s*(.+)$/.exec(line))) {
            tables.set(match[1], tableBytes(match[2], match[3], match[4], constants));
        } else if ((match = /^const\s+([a-z][a-z0-9_]*)\s*=\s*(\S+)$/.exec(line))) {
            constants.set(match[1], literal(match[2], constants));
        } else if ((match = /^byte\s+([a-z][a-z0-9_]*)(?:\s*\[\s*(\S+?)\s*\])?\s+at\s+(\S+)$/.exec(line))) {
            // An address is written as a byte is, and may be up to $FFFF. The
            // count of a row may be a constant.
            places.set(match[1], {
                address: literal(match[3], new Map()),
                count: match[2] === undefined ? null : literal(match[2], constants)
            });
        } else if (line === 'loop' || line === 'decimal') {
            const loop = { kind: line, body: [] };
            into.push(loop);
            open.push(loop);
            into = loop.body;
        } else if ((match = /^for\s+([a-z][a-z0-9_]*)\s+in\s+(\S+?)\s*\.\.\s*(\S+)$/.exec(line))) {
            // Both ends are literals or constants.
            const loop = { kind: 'for', name: match[1], first: literal(match[2], constants), last: literal(match[3], constants), body: [] };
            into.push(loop);
            open.push(loop);
            into = loop.body;
        } else if ((match = /^if\s+(.+)$/.exec(line))) {
            const test = { kind: 'if', ...conditionOf(match[1]), then: [], otherwise: null };
            into.push(test);
            open.push(test);
            into = test.then;
        } else if ((match = /^else\s+if\s+(.+)$/.exec(line))) {
            // An `else` with a condition: what follows is an `if` inside
            // this `else`, and the one `end` to come closes both.
            const test = { kind: 'if', ...conditionOf(match[1]), then: [], otherwise: null, chained: true };
            open[open.length - 1].otherwise = [test];
            open.push(test);
            into = test.then;
        } else if (line === 'else') {
            const test = open[open.length - 1];
            test.otherwise = [];
            into = test.otherwise;
        } else if (line === 'end') {
            // One `end` closes a whole chain of `else if`.
            while (open.pop().chained);
            const outer = open[open.length - 1];
            into = outer.kind === 'if' ? (outer.otherwise || outer.then) : outer.body;
        } else if (line === 'break' || line === 'next') {
            into.push({ kind: line });
        } else if (line === 'stop' || line === 'display.hold()') {
            // Holding the displays computes nothing more: for what a program
            // leaves behind, it is where the program ends.
            into.push({ kind: 'stop' });
        } else if (line === 'display.scan()' || line === 'display.show()') {
            into.push({ kind: 'scan' });
        } else if ((match = /^([a-z][a-z0-9_.]*)(?:\s*\[\s*(\S+?)\s*\])?\s*=\s*(.+)$/.exec(line))) {
            into.push({ kind: 'assign', name: match[1], index: match[2], value: match[3].trim() });
        } else {
            throw new Error('The reference interpreter does not know this line: ' + line);
        }
    }
    return { tables, constants, places, body: program.body };
}

class Stopped extends Error {}

/**
 * Runs a program. `memory` is the board's memory as the program finds it; a
 * copy is worked on. Returns the program's own names with what each holds
 * when it stops, the memory as it leaves it, and the locations it named.
 * A program that never stops is cut off at `maxSteps` statements.
 */
function run(source, memory, maxSteps = 200000) {
    const { tables, constants, places, body } = parse(source);
    const cells = Uint8Array.from(memory);
    const variables = new Map();
    let steps = 0;
    // Whether the statement being run is inside a `decimal` block.
    let decimal = false;

    // The address a name stands for, if it stands for one: a display field or
    // a single location the program has named.
    function addressOf(name) {
        if (name in FIELDS) return FIELDS[name];
        return places.has(name) && places.get(name).count === null ? places.get(name).address : null;
    }
    // The address of one byte of a row. An index past the row's end reaches
    // whatever the instruction then addresses, which no test may depend on,
    // so here it is an error, as it is for a table.
    function elementOf(name, written) {
        const row = places.get(name);
        const index = valueOf(written);
        if (index >= row.count) throw new Error('Index past the end of its row: ' + name + '[' + written + ']');
        return row.address + index;
    }
    function valueOf(text) {
        const number = literal(text, constants);
        if (number !== null) return number;
        const address = addressOf(text);
        // A byte of memory is read as it is, whether or not this program
        // has written it: it may have been keyed in.
        if (address !== null) return cells[address];
        if (!variables.has(text)) throw new Error('Read before any assignment: ' + text);
        return variables.get(text);
    }
    function evaluate(expression) {
        let match;
        if ((match = /^([a-z][a-z0-9_.]*)\[\s*(\S+?)\s*\]$/.exec(expression))) {
            if (places.has(match[1])) return cells[elementOf(match[1], match[2])];
            const bytes = tables.get(match[1]);
            const index = valueOf(match[2]);
            // The README leaves an index past the end to read whatever byte
            // is there. No test may depend on that, so here it is an error.
            if (index >= bytes.length) throw new Error('Index past the end of its table: ' + expression);
            return bytes[index];
        }
        if ((match = /^(\S+?)\s*([-+&|^])\s*(\S+)$/.exec(expression))) {
            const left = valueOf(match[1]);
            const right = valueOf(match[3]);
            // In decimal a byte holds 00 to 99 and wraps there.
            if (decimal && (match[2] === '+' || match[2] === '-')) {
                const [a, b] = [digits(left, expression), digits(right, expression)];
                return asDigits(match[2] === '+' ? (a + b) % 100 : (a - b + 100) % 100);
            }
            switch (match[2]) {
                case '+': return (left + right) & 255;
                case '-': return (left - right) & 255;
                case '&': return left & right;
                case '|': return left | right;
                default: return left ^ right;
            }
        }
        return valueOf(expression);
    }
    function assign(name, index, value) {
        const address = index === undefined ? addressOf(name) : elementOf(name, index);
        if (address !== null) cells[address] = value;
        else variables.set(name, value);
    }
    // With `and` every comparison has to hold, with `or` any one, and they
    // are tried in the order written and no further than it takes.
    function holds(condition) {
        return condition.join === 'or' ? condition.tests.some(compares) : condition.tests.every(compares);
    }
    function compares(test) {
        const left = evaluate(test.left);
        const right = valueOf(test.right);
        // Both sides are bytes, and are compared as unsigned numbers.
        switch (test.compare) {
            case '<': return left < right;
            case '<=': return left <= right;
            case '>': return left > right;
            case '>=': return left >= right;
            case '==': return left === right;
            default: return left !== right;
        }
    }
    // Runs a list of statements. Returns 'break' or 'next' if one of those
    // cut the list short, for the loop round it to act on, and nothing if
    // the list ran to its end.
    function execute(statements) {
        for (const statement of statements) {
            if (++steps > maxSteps) throw new Error('The program did not stop within ' + maxSteps + ' statements');
            switch (statement.kind) {
                case 'assign': assign(statement.name, statement.index, evaluate(statement.value)); break;
                case 'stop': throw new Stopped();
                case 'scan': break;
                case 'break':
                case 'next':
                    return statement.kind;
                case 'if': {
                    // A `break` or a `next` in an arm is not the `if`'s to
                    // act on: it goes out to the loop.
                    const cut = holds(statement) ? execute(statement.then) : statement.otherwise ? execute(statement.otherwise) : undefined;
                    if (cut) return cut;
                    break;
                }
                case 'decimal': {
                    // The statements as they are, with `+` and `-` counting
                    // in decimal. A `break` or a `next` inside goes out to
                    // the loop, and leaves the block as its `end` does. A
                    // block is never inside another.
                    decimal = true;
                    const cut = execute(statement.body);
                    decimal = false;
                    if (cut) return cut;
                    break;
                }
                case 'for': {
                    // Once for each value from the first to the last, both
                    // included, downwards when the first is the greater. In
                    // a `decimal` block too: a `for` counts by one in binary.
                    const step = statement.first <= statement.last ? 1 : -1;
                    let left = false;
                    for (let value = statement.first; ; value += step) {
                        variables.set(statement.name, value);
                        // Left by `break`, the name keeps the value it had.
                        if (execute(statement.body) === 'break') {
                            left = true;
                            break;
                        }
                        // After the statements, or a `next`: the next value,
                        // or out if that was the last.
                        if (value === statement.last) break;
                    }
                    // Run its course: the name is one step past the last
                    // value, and a byte wraps.
                    if (!left) variables.set(statement.name, (statement.last + step) & 255);
                    break;
                }
                default:
                    // A loop: round and round until a `break` leaves it. A
                    // `next` goes to the top, which the end does anyway.
                    while (execute(statement.body) !== 'break');
            }
        }
        return undefined;
    }

    try {
        execute(body);
    } catch (error) {
        if (!(error instanceof Stopped)) throw error;
    }
    return { variables, memory: cells, places };
}

module.exports = { run, parse, FIELDS };
