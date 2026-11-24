'use strict';

const { assemble } = require('./emit');

// The hex display scan returns with Port A in input mode. TASTO itself
// assumes that direction. Both calls can destroy A, X, and Y.
const SCAN = 0xff0c;
const READ_KEY = 0xff57;
const FIELDS = new Map([['display.data', 0xf9], ['display.low', 0xfa], ['display.high', 0xfb]]);
const NAME = /^[a-z][a-z0-9_]*$/;
// The monitor's routine D, START, shows the six bytes at $8F-$94 on the six
// digits as they are, one bit to a segment, where the scan at $FF0C shows
// three bytes as hex digits. The language names both the bytes and the
// routine, as it names the three bytes and the routine of the other.
const SHOW = 0xff7e;
const SEGMENTS = { where: 0x8f, count: 6 };
// What the monitor's key routine at $FF57 gives for the keys that are not
// hex digits, and for no key at all. A hex key's code is its own digit.
const KEY_CODES = [['keypad.ad', 0x10], ['keypad.da', 0x11], ['keypad.inc', 0x12],
    ['keypad.run', 0x13], ['keypad.reg', 0x14], ['keypad.none', 0x15]];
// The alphabet for the displays: what `table segments "TEXT"` makes of each
// character, one byte to a digit, bit 0 for segment a round to bit 6 for g.
// It is the manual's own, Tabella 18 of the supplement, "Esempio di alfabeto
// per display a sette segmenti", which has the ten digits, twenty letters, the
// dash and the dark digit, and no K, M, V, W, X or Z. The table prints a
// letter in the case its shape has, A b C d E F, and a text may be written in
// either: there is one shape to a letter. Its `o` is the round of a zero.
// Most of its bytes have bit 7 set as well, as every byte of the monitor's
// own table at $FFEA has, and the manual says of it "il bit 7 non viene
// utilizzato": here it is left clear, as the manual's first ASEL has it,
// 77 6D 79 38.
const ALPHABET = new Map(Object.entries({
    0: 0x3f, 1: 0x06, 2: 0x5b, 3: 0x4f, 4: 0x66, 5: 0x6d, 6: 0x7d, 7: 0x07, 8: 0x7f, 9: 0x6f,
    A: 0x77, B: 0x7c, C: 0x39, D: 0x5e, E: 0x79, F: 0x71, G: 0x3d, H: 0x76, I: 0x06, J: 0x1e,
    L: 0x38, N: 0x54, O: 0x3f, P: 0x73, Q: 0x67, R: 0x50, S: 0x6d, T: 0x78, U: 0x3e, Y: 0x6e,
    '-': 0x40, ' ': 0x00
}));
// A line is read as the pieces it is made of, and there are three kinds.
// - A term is a number or a name: letters, digits, `_` and `$`, and a dot
//   where it has one of those on both its sides. So display.data and
//   keypad.none are one term each, and the two dots of a range are never
//   taken into one.
// - A mark is an operator, a bracket or a comma. Those of two characters are
//   looked for first, so that `==` is never two `=`.
// - Any other character is a piece of its own, for whichever statement meets
//   it to refuse.
// Spaces only part one piece from the next: a call takes them before and
// inside its brackets, as an operator takes them round it, and the dot of a
// name takes none.
const PIECE = /\s*(?:([\w$]+(?:\.[\w$]+)*)|(==|!=|>=|<=|\.\.|[=<>+\-*&|^[\](),])|(\S))/y;
// What is asked of a line as it is read: the term at a place, the mark at a
// place, where a mark first stands, whether a piece stands apart from the
// next, and the line's own text from one piece to another, spaces and all,
// which is what a message quotes.
function pieces(text) {
    const found = [];
    PIECE.lastIndex = 0;
    for (let match; (match = PIECE.exec(text)) !== null;) {
        const written = match[1] ?? match[2] ?? match[3];
        found.push({ text: written, term: match[1] !== undefined, at: PIECE.lastIndex - written.length, end: PIECE.lastIndex });
    }
    return {
        length: found.length,
        term: (i) => (found[i] && found[i].term ? found[i].text : undefined),
        mark: (i) => (found[i] && !found[i].term ? found[i].text : undefined),
        find(marks, from = 0, to = found.length) {
            for (let i = from; i < to; i++) if (!found[i].term && marks.includes(found[i].text)) return i;
            return -1;
        },
        slice: (from, to = found.length) => (from < to ? text.slice(found[from].at, found[to - 1].end) : ''),
        // Whether a piece has a space after it, or is the last of its line.
        apart: (i) => found[i + 1] === undefined || found[i + 1].at > found[i].end,
        // A name and an empty pair of brackets, and nothing else.
        calls(name) { return found.length === 3 && this.term(0) === name && this.mark(1) === '(' && this.mark(2) === ')'; }
    };
}
const RESERVED = new Set(['if', 'else', 'end', 'loop', 'stop', 'const', 'table', 'byte', 'in', 'display', 'keypad', 'call', 'for', 'break', 'next', 'and', 'or', 'decimal']);
const ARITHMETIC = new Map([['+', 'ADC'], ['-', 'SBC'], ['&', 'AND'], ['|', 'ORA'], ['^', 'EOR']]);
// CMP leaves the carry set when A is not below what it was compared with,
// and Z set when the two are equal. Four of the six comparisons are one
// flag, and so one branch. `>` and `<=` are two flags.
const COMPARISONS = ['<', '<=', '>', '>=', '==', '!='];
const TRUE_BRANCH = new Map([['<', 'BCC'], ['>=', 'BCS'], ['==', 'BEQ'], ['!=', 'BNE']]);
const OPPOSITE = new Map([['<', '>='], ['>=', '<'], ['<=', '>'], ['>', '<='], ['==', '!='], ['!=', '==']]);

function compile(source) {
    const items = [];
    const tables = new Map();
    // A constant is a name for a byte literal and is gone by the time code is
    // made: wherever number() takes a literal it takes one of these.
    const constants = new Map(KEY_CODES);
    // A memory location the program has given a name: where it is, and for a
    // row of bytes how many there are; `count` is null for a single byte.
    // Reading the name reads the byte there and assigning to it writes it,
    // every time, so that it can stand for a port, or for a byte that the
    // monitor or the person at the keys changes. Nothing is ever taken to be
    // in the accumulator under such a name.
    const places = new Map([['display.segment', SEGMENTS]]);
    const blocks = [];
    // The names that are counting a `for` not yet closed. The loop keeps its
    // own count, so nothing inside it may assign to the name.
    const counting = new Set();
    let defined = new Set();
    // For the warning at the end: where each name was first assigned, and
    // which names any line reads.
    const assignedAt = new Map();
    const read = new Set();
    let inA = null;
    let inputReady = false;
    // Whether the 6502's decimal flag is set where the code now being written
    // runs. It is set from a `decimal` to its `end` and nowhere else, so the
    // source says which it is at every instruction, and nothing has to be
    // found out when the program runs. Two things inside a block run with it clear,
    // each after a CLD of its own: a routine that may add, and the JMP of a
    // `break` or a `next` that leaves the block.
    let decimal = false;
    let reachable = true;
    let started = false;
    let needsPress = false;
    let nextLabel = 0;
    let line = 0;

    const label = () => 'flow_' + ++nextLabel;
    function fail(message) { throw new Error(`Line ${line}: ${message}`); }
    function emit(op, mode = 'implied', arg) { items.push({ op, mode, arg, line }); }
    function mark(name) { items.push({ label: name }); }
    function forget() { inA = null; inputReady = false; }
    // Where several paths meet, a name can be read only if it was assigned
    // on every one of them. Each path brings the names it has.
    function onEvery(paths) { return new Set([...paths[0]].filter((name) => paths.every((path) => path.has(name)))); }

    function number(text) {
        if (constants.has(text)) return constants.get(text);
        if (!/^(?:[0-9]+|\$[a-fA-F0-9]+)$/.test(text)) return null;
        const value = text.startsWith('$') ? parseInt(text.slice(1), 16) : Number(text);
        if (value > 255) fail('Byte literal out of range: ' + text);
        return value;
    }
    // An address is the one thing here wider than a byte, and is written only
    // where a location is named or called: $04, $FD01, or in decimal.
    function address(text) {
        if (!/^(?:[0-9]+|\$[a-fA-F0-9]+)$/.test(text)) fail('An address is a number, such as $04 or $FD01, not ' + text);
        const where = text.startsWith('$') ? parseInt(text.slice(1), 16) : Number(text);
        if (where > 0xffff) fail('An address is $FFFF at most, not ' + text);
        return where;
    }
    // How an instruction reaches a named location: by one byte of address in
    // page zero, by two anywhere else.
    function place(name) {
        const { where, count } = places.get(name);
        if (count !== null) fail(name + ' is a row of bytes: say which one, as ' + name + '[0]');
        return [where < 0x100 ? 'zp' : 'abs', where];
    }
    // One byte of a row. A literal index is checked and becomes a plain
    // address. Any other is left for X, and the instruction takes the row's
    // first address: with one byte of it if the whole row is in page zero,
    // where an indexed address wraps round inside the page, and with two
    // otherwise.
    function element(name, written) {
        const { where, count } = places.get(name);
        if (count === null) fail(name + ' is a single byte and takes no index');
        const index = number(written);
        if (index === null) return { mode: where + count <= 0x100 ? 'zpX' : 'absX', where, index: written };
        if (index >= count) fail('Index out of range: ' + name + '[' + written + '], and ' + name + ' has ' + count + (count === 1 ? ' byte' : ' bytes'));
        return { mode: where + index < 0x100 ? 'zp' : 'abs', where: where + index };
    }
    // The 8255 answers at $FD00-$FDFF, its four registers repeated through the
    // page. A store anywhere in it may be a mode word, which decides which
    // way Port A faces, so after one the direction is not known and the next
    // key read has to set it. Takes the first address a store can reach and
    // how many it can reach.
    function mayTurnPortA(where, count) {
        if (where <= 0xfdff && where + count - 1 >= 0xfd00) inputReady = false;
    }
    function variable(name) {
        // Three different mistakes, and the reader can only mend the one named.
        if (RESERVED.has(name)) fail(name + ' is a word of the language and cannot be a name');
        if (tables.has(name)) fail(name + ' is a table, not a variable');
        if (constants.has(name)) fail(name + ' is a constant, not a variable');
        if (places.has(name)) fail(name + ' is a memory name, not a variable');
        if (!NAME.test(name)) fail('Invalid byte variable: ' + name);
        return 'var_' + name;
    }
    function operand(text) {
        const value = number(text);
        if (value !== null) return ['imm', value];
        if (FIELDS.has(text)) return ['zp', FIELDS.get(text)];
        if (places.has(text)) return place(text);
        if (!defined.has(text)) fail('Expected a byte literal, a constant or an assigned variable, got ' + text);
        read.add(text);
        return ['zp', variable(text)];
    }
    function load(text) {
        const arg = operand(text);
        if (places.has(text)) {
            emit('LDA', ...arg);
            inA = null;
            return;
        }
        // What A holds is known by its value when that is a literal, however
        // the literal was written: 21, $15 and a constant set to either are
        // one thing to have in A. Known by its spelling, a constant cost a
        // load that the number it stands for did not. A name can never begin
        // with `#`, so the two kinds cannot be taken for each other.
        const holds = arg[0] === 'imm' ? '#' + arg[1] : text;
        if (inA !== holds) emit('LDA', ...arg);
        inA = holds;
    }
    // The monitor's two routines that show the displays do no sums, and the
    // decimal flag is nothing to them: the clock in Sperimentare of May 1979
    // calls this one with the flag set from its first instruction to its
    // last. So inside a `decimal` block they are called as anywhere.
    function scan() {
        emit('JSR', 'abs', SCAN);
        inputReady = true;
        inA = null;
    }
    // A routine that may add is another matter. The monitor's key routine
    // builds a key's code with ADC, and with the decimal flag set gives A to
    // F and the function keys their codes in decimal, and F the code of no
    // key at all (docs/monitor-rom-review.md, bug 2). A routine called by its
    // address is somebody else's, and was written to be called from the keys,
    // where the flag is clear. So inside a `decimal` block the flag is cleared
    // for either and set again when it comes back: SED and CLD change no
    // other flag and no register, so what the routine returned is untouched.
    function inBinary(call) {
        if (decimal) emit('CLD');
        call();
        if (decimal) emit('SED');
    }
    // Inside a `decimal` block a byte is two decimal digits, one to each half,
    // and the 6502 adds and subtracts them so only if both bytes are. What a
    // variable holds is not known here, but a number is: 10 is $0A, which is
    // no two digits, and the sum would be whatever the 6502 makes of it.
    function twoDigits(written) {
        const value = number(written);
        if (value !== null && ((value & 15) > 9 || value > 0x99)) {
            fail(written + ' is the byte $' + value.toString(16).toUpperCase().padStart(2, '0') +
                ', which is not two decimal digits: inside decimal, ten is written $10');
        }
    }
    function expression(text) {
        const E = pieces(text);
        if (E.calls('keypad.press') || E.calls('keypad.read')) {
            if (E.calls('keypad.press')) {
                needsPress = true;
                inBinary(() => emit('JSR', 'abs', 'wait_press'));
            } else {
                if (!inputReady) {
                    emit('LDA', 'imm', 0x99);
                    emit('STA', 'abs', 0xfd03);
                }
                inBinary(() => emit('JSR', 'abs', READ_KEY));
            }
            inputReady = true;
            inA = null;
            return;
        }
        // A read by index: a name, and between brackets that close the
        // expression whatever says which byte. A space may stand before the
        // index, as it may when the same byte is on the left of an `=`.
        const close = E.find([']']);
        const lookup = /^[a-z][a-z0-9_.]*$/.test(E.term(0) ?? '') && E.mark(1) === '[' && close > 2 && close === E.length - 1
            ? [text, E.term(0), E.slice(2, close)] : null;
        if (lookup && places.has(lookup[1])) {
            const at = element(lookup[1], lookup[2]);
            if (at.index !== undefined) {
                load(at.index);
                emit('TAX');
            }
            emit('LDA', at.mode, at.where);
            inA = null;
            return;
        }
        if (lookup) {
            const table = tables.get(lookup[1]);
            if (!table) fail('Unknown table: ' + lookup[1]);
            const index = number(lookup[2]);
            if (index !== null) {
                if (index >= table.bytes.length) fail('Table index out of range: ' + text);
                emit('LDA', 'imm', table.bytes[index]);
            } else {
                load(lookup[2]);
                emit('TAX');
                emit('LDA', 'absX', table.label);
                table.used = true;
            }
            inA = null;
            return;
        }
        // One operation: a term, an operator, a term.
        const pair = E.length === 3 && E.term(0) !== undefined && ARITHMETIC.has(E.mark(1)) && E.term(2) !== undefined;
        if (!pair) { load(text); return; }
        if (decimal && (E.mark(1) === '+' || E.mark(1) === '-')) {
            twoDigits(E.term(0));
            twoDigits(E.term(2));
        }
        load(E.term(0));
        if (E.mark(1) === '+') emit('CLC');
        if (E.mark(1) === '-') emit('SEC');
        emit(ARITHMETIC.get(E.mark(1)), ...operand(E.term(2)));
        inA = null;
    }
    // byte name at address, or byte name[count] at address.
    function declarePlace(L) {
        const row = L.mark(2) === '[';
        const close = row ? L.find([']'], 3) : 1;
        // The address is whatever follows `at`, and is one run of characters.
        const written = close > 0 && L.term(close + 1) === 'at' ? L.slice(close + 2) : '';
        if (L.term(1) === undefined || !written || /\s/.test(written)) fail('Expected byte name at address, or byte name[count] at address');
        const name = L.term(1);
        const counted = row ? L.slice(3, close) : undefined;
        if (places.has(name)) fail('Memory name declared twice: ' + name);
        if (tables.has(name)) fail(name + ' is already a table');
        if (constants.has(name)) fail(name + ' is already a constant');
        variable(name);
        const where = address(written);
        // A row is as long as a byte can index: 256 at most, which is one
        // more than a byte can say, so the count is read as an address is.
        let count = null;
        if (counted !== undefined) {
            if (constants.has(counted)) count = constants.get(counted);
            else if (/^(?:[0-9]+|\$[a-fA-F0-9]+)$/.test(counted)) count = counted.startsWith('$') ? parseInt(counted.slice(1), 16) : Number(counted);
            if (count === null) fail('A row is so many bytes: a number or a constant, not ' + (counted || 'nothing'));
            if (count < 1 || count > 256) fail('A row has 1 to 256 bytes, not ' + counted);
            if (where + count > 0x10000) fail(name + ' would run past $FFFF');
        }
        // The compiler puts the program's own variables there, in the order
        // it meets them, and a name fixed among them would share a byte with
        // one of them without either knowing.
        const last = where + (count || 1) - 1;
        if (where <= 0x7f && last >= 0x20) {
            fail('$20-$7F is where the compiler keeps the program\'s own variables; ' +
                (count === null ? written + ' is inside it' : name + ' would overlap it'));
        }
        places.set(name, { where, count });
    }
    // const name = byte.
    function declareConstant(L) {
        if (L.length !== 4 || L.term(1) === undefined || L.mark(2) !== '=' || L.term(3) === undefined) {
            fail('Expected const name = byte, or const name = table byte with a formula or with its bytes, or const name = table segments "TEXT"');
        }
        const name = L.term(1);
        const written = L.term(3);
        if (constants.has(name)) fail('Constant declared twice: ' + name);
        if (tables.has(name)) fail(name + ' is already a table');
        if (places.has(name)) fail(name + ' is already a memory name');
        variable(name);
        const value = number(written);
        if (value === null) fail('A constant is a byte literal or another constant, not ' + written);
        constants.set(name, value);
    }
    // The name of a new table: not one that a table or a constant has, and
    // otherwise by the rules for any name.
    function tableName(name) {
        if (tables.has(name)) fail('Table declared twice: ' + name);
        if (constants.has(name)) fail(name + ' is already a constant');
        if (places.has(name)) fail(name + ' is already a memory name');
        variable(name);
    }
    // A table written out: its bytes, with commas between them. Each is a
    // literal or a constant, as anywhere a byte is written.
    function declareWrittenTable(name, written) {
        tableName(name);
        if (!written.trim()) fail('A table that is written out needs at least one byte');
        const bytes = written.split(',').map((piece) => {
            const text = piece.trim();
            if (!text) fail('A comma in a table needs a byte on both its sides');
            const value = number(text);
            if (value === null) fail('A table is written as bytes with commas between them, and this is not a byte: ' + text);
            return value;
        });
        // X reaches no further, and neither does a byte used as an index.
        if (bytes.length > 256) fail('A table holds 256 bytes at most, and this one has ' + bytes.length);
        tables.set(name, { label: 'data_' + name, bytes, line, used: false });
    }
    // A table worked out from a text: a byte of segments to each character,
    // for the row the monitor shows on the six digits. The text is the line's
    // own, from one double quote to the other, spaces and all.
    function declareSegments(name, written) {
        const quoted = /^"([^"]*)"(.*)$/.exec(written);
        if (!quoted) fail('Expected const name = table segments "TEXT", the text between two double quotes');
        // The quotes are right, and it is what comes after them that is not.
        if (quoted[2]) fail('A text for the displays ends the line at its closing quote, and this goes on: ' + quoted[2].trim());
        tableName(name);
        const characters = [...quoted[1]];
        if (!characters.length) fail('A text for the displays needs at least one character');
        if (characters.length > 256) fail('A table holds 256 bytes at most, and this text has ' + characters.length + ' characters');
        const bytes = characters.map((character) => {
            // The twenty-six small letters are the capitals, and nothing
            // else is: toUpperCase() alone would make an I of a dotless i
            // and an S of a long s, which are no letters of the alphabet.
            const segments = ALPHABET.get(/^[a-z]$/.test(character) ? character.toUpperCase() : character);
            if (segments === undefined) {
                fail('Seven segments have no ' + character + " in the manual's alphabet, which is 0 to 9, A b C d E F G H I J L n o P q r S t U Y, " +
                    'the dash and the space; a table written out can hold any pattern');
            }
            return segments;
        });
        tables.set(name, { label: 'data_' + name, bytes, line, used: false, text: written + ' on the displays' });
    }
    // const name = table byte = byte, byte, ... or
    // const name = table byte [n in 0..last] = term, or term operator term, or
    // const name = table segments "TEXT".
    // The caller has found `const name = table` already.
    function declareTable(L) {
        const name = L.term(1);
        if (L.term(4) === 'segments') {
            declareSegments(name, L.slice(5));
            return;
        }
        if (L.term(4) === 'byte' && L.mark(5) === '=') {
            declareWrittenTable(name, L.slice(6));
            return;
        }
        const one = L.length === 14;
        const two = L.length === 16 && ['*', '+', '-'].includes(L.mark(14)) && L.term(15) !== undefined;
        if (!(one || two) || L.term(4) !== 'byte' || L.mark(5) !== '[' || L.term(6) === undefined || L.term(7) !== 'in' ||
            L.term(8) === undefined || L.mark(9) !== '..' || L.term(10) === undefined || L.mark(11) !== ']' ||
            L.mark(12) !== '=' || L.term(13) === undefined) {
            fail('Expected const name = table byte [n in 0..last] = formula, const name = table byte = byte, byte, ... or const name = table segments "TEXT"');
        }
        const [index, first, limit, lhs, op, rhs] = [L.term(6), L.term(8), L.term(10), L.term(13), L.mark(14), L.term(15)];
        // Zero however it is written: $0 and 00 are the byte the README means.
        if (number(first) !== 0) fail("A table's index starts at 0, not at " + first);
        tableName(name);
        if (!NAME.test(index) || RESERVED.has(index)) fail('Invalid table index name: ' + index);
        const last = number(limit);
        if (last === null) fail('Expected a byte literal or a constant for the last table index, got ' + limit);
        function term(token, i) {
            if (token === index) return i;
            const value = number(token);
            if (value === null) fail('Unknown table formula term: ' + token);
            return value;
        }
        const bytes = [];
        for (let i = 0; i <= last; i++) {
            let value = term(lhs, i);
            if (op === '*') value *= term(rhs, i);
            if (op === '+') value += term(rhs, i);
            if (op === '-') value -= term(rhs, i);
            bytes.push(value & 255);
        }
        tables.set(name, { label: 'data_' + name, bytes, line, used: false });
    }
    // A comparison: what is compared, how, and with what, from one place in a
    // line to another. CMP wants the left side in A and the right side as one
    // operand, so the left may be anything an expression may and the right is
    // one term.
    function comparison(L, from, to) {
        const at = L.find(COMPARISONS, from, to);
        const clean = (written) => !/[<>=!]/.test(written);
        // When the operator is one of the six and only one side is wrong,
        // say that: naming the operators again sends the reader to look at
        // the one thing that is right. That holds only if what stands before
        // the operator is clean: in `if 0 =< 2` the `<` is found, and it is
        // the operator that is wrong.
        if (at === from) fail('A comparison needs a value on its left');
        if (at > from && clean(L.slice(from, at))) {
            if (at + 1 === to) fail('A comparison needs a value on its right');
            // One run of letters, digits, dots and `$` is meant as one value,
            // whatever it turns out to be: `.0` is refused as a value is.
            const right = L.slice(at + 1, to);
            if (/^[\w.$]+$/.test(right)) return { left: L.slice(from, at), op: L.mark(at), right };
            if (clean(right)) {
                fail('The right side of a comparison is a single value; write an operation, a read by index or a key read on the left');
            }
        }
        fail('Expected an unsigned comparison using <, <=, >, >=, == or !=');
    }
    // The code for one comparison, with a branch to `target`: taken when the
    // comparison holds if `when` is true, and when it does not if `when` is
    // false. The other outcome goes on to the next instruction.
    function branch(test, target, when) {
        expression(test.left);
        let [mode, value] = operand(test.right);
        let op = test.op;
        // Against a number, `>` and `<=` are `>=` and `<` against the next
        // number, which is one branch, and what a hand would write. Only 255
        // has no next number, and there the comparison says nothing: no byte
        // is greater, and every byte is as small.
        if ((op === '>' || op === '<=') && mode === 'imm') {
            if (value === 255) fail(op === '>' ? 'No byte is greater than 255, so this is never so' : 'Every byte is 255 or less, so this is always so');
            value += 1;
            op = op === '>' ? '>=' : '<';
        }
        emit('CMP', mode, value);
        // To branch when a comparison does not hold is to branch when its
        // opposite does.
        if (!when) op = OPPOSITE.get(op);
        if (op === '>') {
            // Greater is not equal and not below: equal steps over the
            // branch that not below takes.
            const no = label();
            emit('BEQ', 'rel', no);
            emit('BCS', 'rel', target);
            mark(no);
        } else if (op === '<=') {
            // Below or equal: either flag takes it.
            emit('BCC', 'rel', target);
            emit('BEQ', 'rel', target);
        } else {
            emit(TRUE_BRANCH.get(op), 'rel', target);
        }
    }
    // A condition is one comparison, or several joined all by `and` or all
    // by `or`. Its code goes on to the next instruction when the condition
    // holds and away to `otherwise` when it does not. The comparisons are
    // tried in the order written and no further than it takes: with `and`
    // the first that fails settles it, with `or` the first that holds.
    function condition(L, from, to, otherwise) {
        const joins = [];
        for (let i = from; i < to; i++) if (L.term(i) === 'and' || L.term(i) === 'or') joins.push(i);
        const word = joins.length ? L.term(joins[0]) : null;
        // Which of the two goes first is a rule of precedence or a pair of
        // brackets, and the language has neither.
        if (joins.some((at) => L.term(at) !== word)) {
            fail('A condition is joined by and or by or, not by both: there are no brackets to say which comes first');
        }
        const edges = [from - 1, ...joins, to];
        const tests = joins.map((_, k) => k).concat(joins.length).map((k) => {
            if (word && edges[k] + 1 === edges[k + 1]) fail(word + ' joins two comparisons, and one of them is missing');
            return comparison(L, edges[k] + 1, edges[k + 1]);
        });
        if (word !== 'or') {
            for (const test of tests) branch(test, otherwise, false);
            return;
        }
        // Each comparison but the last goes straight to the statements when
        // it holds; the last goes away when it does not.
        const statements = label();
        tests.forEach((test, k) => (k < tests.length - 1 ? branch(test, statements, true) : branch(test, otherwise, false)));
        mark(statements);
        // The statements are reached from every comparison, each with its
        // own left side in A, and with Port A as far as the key reads that
        // were got to have set it.
        forget();
    }
    function statement(text) {
        const L = pieces(text);
        const first = L.term(0);
        const alone = (word) => L.length === 1 && first === word;
        // `else if` is an `else` with a condition of its own. It leaves the
        // `if` open, and one `end` closes the whole chain.
        const elseIf = first === 'else' && L.term(1) === 'if' && L.apart(1);
        if (alone('else') || alone('end') || elseIf) {
            const block = blocks.at(-1);
            if (!block) fail('Unexpected ' + (elseIf ? 'else' : text));
            if (first === 'else') {
                // After a plain `else` nothing is left for another to take.
                if (block.kind !== 'if' || block.otherwise === null) fail('Unexpected else');
                // The arm above is over. What it had assigned is what it
                // brings to the `end`, if it gets there.
                if (reachable) {
                    block.arms.push(defined);
                    emit('JMP', 'abs', block.end);
                }
                block.chained = true;
                mark(block.otherwise);
                defined = new Set(block.entry);
                reachable = true;
                // This is reached from the comparisons that failed, so
                // nothing is known here, and a condition that follows starts
                // from that. What the condition leaves is known to its arm.
                forget();
                if (elseIf) {
                    block.otherwise = label();
                    condition(L, 2, L.length, block.otherwise);
                } else {
                    block.otherwise = null;
                }
                return;
            }
            {
                blocks.pop();
                if (block.kind === 'decimal') {
                    // Back to binary. The block is no branch and no loop: its
                    // `end` is reached only from its last statement, so what
                    // is known there is known here, and CLD changes none of
                    // it. If the last statement cannot be passed, nothing
                    // comes this way to need the flag cleared.
                    if (reachable) emit('CLD');
                    decimal = false;
                    return;
                }
                if (block.kind === 'loop') {
                    if (reachable) emit('JMP', 'abs', block.start);
                    // A loop ends only where a `break` leaves it, and what
                    // follows it is reached only from those.
                    reachable = block.leaves.length > 0;
                    if (reachable) {
                        mark(block.done);
                        defined = onEvery(block.leaves);
                    }
                } else if (block.kind === 'for') {
                    counting.delete(block.name);
                    // The foot of the loop is reached by running off the end
                    // of the statements and from each `next`.
                    const round = block.rounds.concat(reachable ? [defined] : []);
                    const out = block.leaves.slice();
                    if (round.length) {
                        // One step, and round again unless that was the last
                        // value. The count is left one step past it, which is
                        // what the compare looks for: after 0..5 it is 6, and
                        // after 0..255 it is 0, where a byte wraps. A is left
                        // holding the count, as it is on the way in. INC and
                        // DEC take no notice of the decimal flag, so a `for`
                        // counts the same inside a `decimal` block as out.
                        if (block.step) mark(block.step);
                        emit(block.down ? 'DEC' : 'INC', 'zp', block.count);
                        emit('LDA', 'zp', block.count);
                        emit('CMP', 'imm', block.past);
                        emit('BNE', 'rel', block.top);
                        out.push(onEvery(round));
                    }
                    // What follows is reached when the count is done, and
                    // from each `break`.
                    if (block.done) mark(block.done);
                    reachable = out.length > 0;
                    if (reachable) defined = onEvery(out);
                } else {
                    if (reachable) block.arms.push(defined);
                    // With no plain `else`, a condition that fails comes
                    // here with what the `if` started with.
                    if (block.otherwise !== null) {
                        mark(block.otherwise);
                        block.arms.push(block.entry);
                    }
                    if (block.chained) mark(block.end);
                    // Only names assigned on every path reaching the join can be read.
                    reachable = block.arms.length > 0;
                    if (reachable) defined = onEvery(block.arms);
                }
            }
            forget();
            return;
        }
        // What a line is goes by its shape alone, and is settled before
        // anything else is asked of it. An assignment is a name, perhaps an
        // index in brackets, one `=`, which is not the `==` of a comparison,
        // and something after it, so `x == 1` is none. `if` and `const` are
        // whole terms with a space after them, so `if.scan()` is neither and
        // `if()` is neither. A line that is no statement is told so wherever
        // it stands: a misspelt `end` after `stop` was once called
        // unreachable, which it is, and which is not what is wrong with it.
        const indexed = L.mark(1) === '[';
        const close = indexed ? L.find([']'], 2) : 0;
        const assign = first !== undefined && close >= 0 && L.mark(close + 1) === '=' && L.length > close + 2
            ? [text, first, indexed ? L.slice(2, close) : undefined, L.slice(close + 2)] : null;
        const begins = (word) => first === word && L.apart(0);
        const isIf = begins('if');
        const isConst = begins('const');
        const isByte = begins('byte');
        const isCall = begins('call');
        const isFor = begins('for');
        // `break` and `next` concern the loop they are in: the innermost.
        const jumps = alone('break') || alone('next');
        const around = jumps ? blocks.findLast((block) => block.kind === 'loop' || block.kind === 'for') : undefined;
        // A jump from inside a `decimal` block to a loop that the block is
        // inside leaves the block, by another way than its `end`, and has to
        // leave decimal mode behind as the `end` does. A loop that is itself
        // inside the block is left with the flag as it is.
        const leavesDecimal = around !== undefined && blocks.indexOf(around) < blocks.findIndex((block) => block.kind === 'decimal');
        const scans = L.calls('display.scan');
        const holds = L.calls('display.hold');
        const shows = L.calls('display.show');
        // `if = 1` and `const = 1` assign to a word of the language. Say so
        // before the line is read as a comparison or a declaration gone wrong.
        if (assign && RESERVED.has(assign[1])) variable(assign[1]);
        if (!assign && !isIf && !isConst && !isByte && !isCall && !isFor && !jumps && !alone('loop') && !alone('stop') && !alone('decimal') && !scans && !holds && !shows) {
            fail('Unknown statement: ' + text);
        }
        // Wrong wherever it stands, like a line that is no statement.
        if (alone('break') && !around) fail('break leaves a loop or a for, and there is none round it');
        if (alone('next') && !around) fail('next goes round a loop or a for again, and there is none round it');
        if (!reachable) fail('Unreachable statement');
        if (isByte) {
            if (started) fail('Declare constants, tables and memory names before the first statement');
            declarePlace(L);
            return;
        }
        if (isConst) {
            if (started) fail('Declare constants, tables and memory names before the first statement');
            // The word after the `=` says which it is, so that a table
            // written wrongly is told about tables.
            if (L.term(1) !== undefined && L.mark(2) === '=' && L.term(3) === 'table') declareTable(L);
            else declareConstant(L);
            return;
        }
        started = true;
        if (alone('loop')) {
            const start = label();
            blocks.push({ kind: 'loop', start, leaves: [], line });
            mark(start);
            forget();
        } else if (isFor) {
            // for name in first..last. Both ends are numbers the compiler
            // has, so it knows the count: at least once round, 256 at most,
            // and downwards when the first is the greater.
            if (L.length !== 6 || L.term(1) === undefined || L.term(2) !== 'in' || L.term(3) === undefined ||
                L.mark(4) !== '..' || L.term(5) === undefined) {
                fail('Expected for name in first..last, such as for i in 0..5');
            }
            const name = L.term(1);
            if (FIELDS.has(name)) fail('A for counts in a variable of the program\'s own, not in ' + name);
            const count = variable(name);
            if (counting.has(name)) fail(name + ' is already counting the for that this one is inside');
            const [from, to] = [L.term(3), L.term(5)].map((written) => {
                const value = number(written);
                if (value === null) fail('A for runs from one number or constant to another, and ' + written + ' is neither; for an end that varies, count in a loop');
                return value;
            });
            load(L.term(3));
            emit('STA', 'zp', count);
            defined.add(name);
            // The loop reads its own count, so the name is not one that is
            // assigned and never read, whatever the statements inside do.
            read.add(name);
            counting.add(name);
            const top = label();
            mark(top);
            const down = from > to;
            blocks.push({ kind: 'for', name, count, top, down, past: (to + (down ? -1 : 1)) & 255, leaves: [], rounds: [], line });
            // The count is in A at the top whichever way the top is reached:
            // it was loaded to be stored, and the step at the foot loads it
            // to compare it. Of Port A nothing is known, as at any loop's top.
            inA = name;
            inputReady = false;
        } else if (isIf) {
            const otherwise = label();
            condition(L, 1, L.length, otherwise);
            blocks.push({ kind: 'if', entry: new Set(defined), otherwise, end: label(), arms: [], line });
        } else if (alone('decimal')) {
            // From here to the block's `end` the 6502 adds and subtracts in
            // decimal: the same ADC and SBC, with its D flag set. One flag
            // cannot be set twice, and a second block inside the first would
            // end by clearing it for the rest of the first.
            if (decimal) fail('The sums here are in decimal already: this decimal is inside another');
            emit('SED');
            decimal = true;
            blocks.push({ kind: 'decimal', line });
        } else if (alone('stop')) {
            // Also from inside a `decimal` block, with no CLD: the monitor's
            // entry at $FE22 clears decimal mode itself, at $FEE8, before it
            // adds anything.
            emit('JMP', 'abs', 0xfe22);
            reachable = false;
        } else if (alone('break')) {
            // Out to what follows the loop's `end`. The names assigned by
            // here are what this way out brings there.
            around.done ??= label();
            if (leavesDecimal) emit('CLD');
            emit('JMP', 'abs', around.done);
            around.leaves.push(new Set(defined));
            reachable = false;
        } else if (alone('next')) {
            // Round again: to the top of a `loop`, and in a `for` to its
            // foot, where the count is stepped and tried.
            if (leavesDecimal) emit('CLD');
            if (around.kind === 'loop') {
                emit('JMP', 'abs', around.start);
            } else {
                around.step ??= label();
                emit('JMP', 'abs', around.step);
                around.rounds.push(new Set(defined));
            }
            reachable = false;
        } else if (scans) {
            scan();
        } else if (shows) {
            // A call like any other: START leaves Port A an output, and the
            // last digit lit, so nothing is known when it comes back.
            emit('JSR', 'abs', SHOW);
            forget();
        } else if (isCall) {
            // The address is whatever follows, and is one run of characters.
            const written = L.slice(1);
            if (!written || /\s/.test(written)) fail('Expected call and an address, such as call $FF7E');
            const where = address(written);
            // The routine is somebody else's. Nothing is known when it comes
            // back: not A, and not which way it has left Port A, so the next
            // key read sets that again. Nor the decimal flag: RTS brings the
            // routine's flags back with it, and a routine that counts in
            // decimal would leave every sum after it in decimal, and F and no
            // key the same code. So it is cleared, as at the program's start.
            // Inside a `decimal` block the routine is still called with the
            // flag clear, as from anywhere else, and the flag is set again
            // when it comes back, whatever the routine left.
            if (decimal) emit('CLD');
            emit('JSR', 'abs', where);
            emit(decimal ? 'SED' : 'CLD');
            forget();
        } else if (holds) {
            // Scan until RES. `stop` hands the board to the monitor, which puts
            // its own address and data on the displays; this keeps what the
            // program put there. It is `loop`, `display.scan()`, `end` in one
            // word and the same six bytes, and nothing after it is reached.
            const again = label();
            mark(again);
            scan();
            emit('JMP', 'abs', again);
            reachable = false;
        } else {
            const [, name, indexed, value] = assign;
            if (indexed !== undefined) {
                // One byte of a row. The value is worked out first and stays in
                // A while X is given the index, which a load into A would cost.
                if (tables.has(name)) fail(name + ' is a table, and a table is not written to');
                if (!places.has(name)) fail('Only a row of bytes takes an index on the left of =, and ' + name + ' is not one');
                const at = element(name, indexed);
                expression(value.trim());
                if (at.index !== undefined) emit('LDX', ...operand(at.index));
                emit('STA', at.mode, at.where);
                // By a variable index, the store may be to any byte of the row.
                mayTurnPortA(at.where, at.index === undefined ? 1 : places.get(name).count);
                return;
            }
            if (places.has(name)) {
                // Written there and then. A is left as the value's own name or
                // number, which the store has not changed, and never as this
                // name: the next reading of it has to be a reading.
                expression(value.trim());
                emit('STA', ...place(name));
                mayTurnPortA(places.get(name).where, 1);
                return;
            }
            if (counting.has(name)) fail(name + ' is the count of the for it is in, and only the for changes it');
            const zeroPage = FIELDS.get(name) ?? variable(name);
            expression(value.trim());
            emit('STA', 'zp', zeroPage);
            if (!FIELDS.has(name) && !assignedAt.has(name)) assignedAt.set(name, line);
            defined.add(name);
            inA = name;
        }
    }

    emit('CLD'); // RUN restores the saved status, including the previous program's D flag.
    // A line ends at LF, at CR LF or at a CR alone, as old Macs wrote it. Split
    // at LF only, a CR-only file is one line, and a `#` in it comments out
    // every statement after it without a word. It ends as well at either of
    // Unicode's two separators, U+2028 and U+2029, which an editor shows as
    // the end of a line and which are otherwise spaces: two statements with
    // one between them would be read as one line.
    for (const raw of source.split(/\r\n|[\r\n\u2028\u2029]/)) {
        line++;
        const text = raw.split('#', 1)[0].trim();
        if (text) statement(text);
    }
    if (blocks.length) { line = blocks.at(-1).line; fail('Missing end: this ' + blocks.at(-1).kind + ' is never closed'); }
    // No line can be named: none of them is a statement. `line` here is the
    // number of lines read, which is one past the end of a file that finishes
    // with a newline, so the message used to point at a line that is not there.
    if (!started) throw new Error('The program has no statement to run');
    line = 0;
    if (reachable) emit('JMP', 'abs', 0xfe22);

    if (needsPress) {
        // Sample at full-display-scan intervals. Confirm release first, so the
        // RUN that started the program is ignored and a held key cannot
        // repeat. SCAND1 returns Z set when no key is down.
        mark('wait_press');
        emit('LDA', 'imm', 3);
        emit('STA', 'zp', 'press_count');
        mark('wait_release');
        scan();
        emit('BNE', 'rel', 'wait_press');
        emit('DEC', 'zp', 'press_count');
        emit('BNE', 'rel', 'wait_release');
        mark('wait_key');
        scan();
        emit('JSR', 'abs', READ_KEY);
        emit('CMP', 'imm', 0x15);
        emit('BEQ', 'rel', 'wait_key');
        emit('STA', 'zp', 'press_key');
        emit('LDA', 'imm', 2);
        emit('STA', 'zp', 'press_count');
        mark('confirm_key');
        scan();
        emit('JSR', 'abs', READ_KEY);
        emit('CMP', 'zp', 'press_key');
        emit('BNE', 'rel', 'wait_key');
        emit('DEC', 'zp', 'press_count');
        emit('BNE', 'rel', 'confirm_key');
        emit('LDA', 'zp', 'press_key');
        emit('RTS');
    }
    for (const table of tables.values()) {
        if (!table.used) continue;
        mark(table.label);
        items.push({ bytes: table.bytes, line: table.line, comment: table.text });
    }
    const result = assemble(items);
    // A name that is assigned and that no line reads has no place in memory:
    // the assembler drops a store that nothing reads. Its value goes nowhere,
    // and the program is still a program, so this is a warning and not an
    // error. The usual cause is one name spelt two ways.
    result.warnings = [...assignedAt].filter(([name]) => !read.has(name))
        .map(([name, at]) => `Line ${at}: ${name} is assigned and never read`);
    return result;
}

module.exports = { compile };
