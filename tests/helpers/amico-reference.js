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
// here as on the board. display.scan() changes none of it, so here it does
// nothing. The key routines are not modelled at all; a test that needs them
// drives the real monitor.

// Where the README says the three display fields are.
const FIELDS = { 'display.high': 0xfb, 'display.low': 0xfa, 'display.data': 0xf9 };
// The README's names for the codes of the keys that are not hex digits.
const KEY_NAMES = {
    'keypad.ad': 0x10, 'keypad.da': 0x11, 'keypad.inc': 0x12,
    'keypad.run': 0x13, 'keypad.reg': 0x14, 'keypad.none': 0x15
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

// Reads a program into its declarations and a tree of statements. It is as
// strict as it needs to be for programs the compiler accepts, and no
// stricter: what the compiler should refuse is another test's business.
function parse(source) {
    const tables = new Map();
    const constants = new Map(Object.entries(KEY_NAMES));
    // A name the program gives to a memory location: its address, and for a
    // row of bytes how many there are. `count` is null for a single byte.
    const places = new Map();
    const program = { kind: 'program', body: [] };
    const open = [program];
    let into = program.body;

    for (const raw of source.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim();
        if (!line) continue;
        let match;
        if ((match = /^const\s+([a-z][a-z0-9_]*)\s*=\s*table\s+byte\s*=\s*(.+)$/.exec(line))) {
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
        } else if (line === 'loop') {
            const loop = { kind: 'loop', body: [] };
            into.push(loop);
            open.push(loop);
            into = loop.body;
        } else if ((match = /^if\s+(.+?)\s*(>=|==|!=|<)\s*(\S+)$/.exec(line))) {
            const test = { kind: 'if', left: match[1], compare: match[2], right: match[3], then: [], otherwise: null };
            into.push(test);
            open.push(test);
            into = test.then;
        } else if (line === 'else') {
            const test = open[open.length - 1];
            test.otherwise = [];
            into = test.otherwise;
        } else if (line === 'end') {
            open.pop();
            const outer = open[open.length - 1];
            into = outer.kind === 'if' ? (outer.otherwise || outer.then) : outer.body;
        } else if (line === 'stop' || line === 'display.hold()') {
            // Holding the displays computes nothing more: for what a program
            // leaves behind, it is where the program ends.
            into.push({ kind: 'stop' });
        } else if (line === 'display.scan()') {
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
        if ((match = /^([a-z][a-z0-9_]*)\[\s*(\S+?)\s*\]$/.exec(expression))) {
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
    function holds(test) {
        const left = evaluate(test.left);
        const right = valueOf(test.right);
        switch (test.compare) {
            case '<': return left < right;
            case '>=': return left >= right;
            case '==': return left === right;
            default: return left !== right;
        }
    }
    function execute(statements) {
        for (const statement of statements) {
            if (++steps > maxSteps) throw new Error('The program did not stop within ' + maxSteps + ' statements');
            switch (statement.kind) {
                case 'assign': assign(statement.name, statement.index, evaluate(statement.value)); break;
                case 'stop': throw new Stopped();
                case 'scan': break;
                case 'if':
                    if (holds(statement)) execute(statement.then);
                    else if (statement.otherwise) execute(statement.otherwise);
                    break;
                default:
                    // A loop: only `stop`, somewhere inside, ends it.
                    for (;;) execute(statement.body);
            }
        }
    }

    try {
        execute(body);
    } catch (error) {
        if (!(error instanceof Stopped)) throw error;
    }
    return { variables, memory: cells, places };
}

module.exports = { run, parse, FIELDS };
