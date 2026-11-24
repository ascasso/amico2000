'use strict';

const { assemble } = require('./emit');

// The hex display scan returns with Port A in input mode. TASTO itself
// assumes that direction. Both calls can destroy A, X, and Y.
const SCAN = 0xff0c;
const READ_KEY = 0xff57;
const FIELDS = new Map([['display.data', 0xf9], ['display.low', 0xfa], ['display.high', 0xfb]]);
const NAME = /^[a-z][a-z0-9_]*$/;
// A call takes spaces before and inside its brackets, as an operator takes
// them round it. The dot is part of the name and takes none.
const SCAN_CALL = /^display\.scan\s*\(\s*\)$/;
const HOLD_CALL = /^display\.hold\s*\(\s*\)$/;
const SHOW_CALL = /^display\.show\s*\(\s*\)$/;
// The monitor's routine D, START, shows the six bytes at $8F-$94 on the six
// digits as they are, one bit to a segment, where the scan at $FF0C shows
// three bytes as hex digits. The language names both the bytes and the
// routine, as it names the three bytes and the routine of the other.
const SHOW = 0xff7e;
const SEGMENTS = { where: 0x8f, count: 6 };
const KEY_CALL = /^keypad\.(read|press)\s*\(\s*\)$/;
// What the monitor's key routine at $FF57 gives for the keys that are not
// hex digits, and for no key at all. A hex key's code is its own digit.
const KEY_CODES = [['keypad.ad', 0x10], ['keypad.da', 0x11], ['keypad.inc', 0x12],
    ['keypad.run', 0x13], ['keypad.reg', 0x14], ['keypad.none', 0x15]];
// A term of a table's declaration: a number or a name, and a name may have
// dots in it, as keypad.none has. A dot needs something on both its sides,
// so that the two dots of the range are never taken into a term.
const TERM = '[\\w$]+(?:\\.[\\w$]+)*';
const TABLE = new RegExp('^const\\s+(\\w+)\\s*=\\s*table\\s+byte\\s*\\[\\s*(\\w+)\\s+in\\s+(' + TERM +
    ')\\s*\\.\\.\\s*(' + TERM + ')\\s*\\]\\s*=\\s*(' + TERM + ')(?:\\s*([*+-])\\s*(' + TERM + '))?$');
const RESERVED = new Set(['if', 'else', 'end', 'loop', 'stop', 'const', 'table', 'byte', 'in', 'display', 'keypad', 'call']);
const ARITHMETIC = new Map([['+', 'ADC'], ['-', 'SBC'], ['&', 'AND'], ['|', 'ORA'], ['^', 'EOR']]);
const FALSE_BRANCH = new Map([['<', 'BCS'], ['>=', 'BCC'], ['==', 'BNE'], ['!=', 'BEQ']]);

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
    let defined = new Set();
    // For the warning at the end: where each name was first assigned, and
    // which names any line reads.
    const assignedAt = new Map();
    const read = new Set();
    let inA = null;
    let inputReady = false;
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
    function scan() {
        emit('JSR', 'abs', SCAN);
        inputReady = true;
        inA = null;
    }
    function expression(text) {
        const call = KEY_CALL.exec(text);
        if (call) {
            if (call[1] === 'press') {
                needsPress = true;
                emit('JSR', 'abs', 'wait_press');
            } else {
                if (!inputReady) {
                    emit('LDA', 'imm', 0x99);
                    emit('STA', 'abs', 0xfd03);
                }
                emit('JSR', 'abs', READ_KEY);
            }
            inputReady = true;
            inA = null;
            return;
        }
        const lookup = /^([a-z][a-z0-9_.]*)\[\s*([^\]]+?)\s*\]$/.exec(text);
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
        const pair = /^([\w.$]+)\s*([+&|^-])\s*([\w.$]+)$/.exec(text);
        if (!pair) { load(text); return; }
        load(pair[1]);
        if (pair[2] === '+') emit('CLC');
        if (pair[2] === '-') emit('SEC');
        emit(ARITHMETIC.get(pair[2]), ...operand(pair[3]));
        inA = null;
    }
    function declarePlace(text) {
        const match = /^byte\s+(\w+)(?:\s*\[\s*([^\]]*?)\s*\])?\s+at\s+(\S+)$/.exec(text);
        if (!match) fail('Expected byte name at address, or byte name[count] at address');
        const [, name, counted, written] = match;
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
    function declareConstant(text) {
        const match = /^const\s+(\w+)\s*=\s*([\w.$]+)$/.exec(text);
        if (!match) fail('Expected const name = byte, or const name = table byte with a formula or with its bytes');
        const [, name, written] = match;
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
    function declareTable(text) {
        const list = /^const\s+(\w+)\s*=\s*table\s+byte\s*=\s*(.*)$/.exec(text);
        if (list) {
            declareWrittenTable(list[1], list[2]);
            return;
        }
        const match = TABLE.exec(text);
        if (!match) fail('Expected const name = table byte [n in 0..last] = formula, or const name = table byte = byte, byte, ...');
        const [, name, index, first, limit, lhs, op, rhs] = match;
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
    function statement(text) {
        if (text === 'else' || text === 'end') {
            const block = blocks.at(-1);
            if (!block) fail('Unexpected ' + text);
            if (text === 'else') {
                if (block.kind !== 'if' || block.then) fail('Unexpected else');
                block.then = { defined, reachable };
                if (reachable) emit('JMP', 'abs', block.end);
                mark(block.otherwise);
                defined = new Set(block.entry);
                reachable = true;
            } else {
                blocks.pop();
                if (block.kind === 'loop') {
                    if (reachable) emit('JMP', 'abs', block.start);
                    reachable = false;
                } else {
                    const other = block.then || { defined: block.entry, reachable: true };
                    mark(block.then ? block.end : block.otherwise);
                    // Only names assigned on every path reaching the join can be read.
                    if (!reachable) defined = other.defined;
                    else if (other.reachable) defined = new Set([...defined].filter(v => other.defined.has(v)));
                    reachable ||= other.reachable;
                }
            }
            forget();
            return;
        }
        // What a line is goes by its shape alone, and is settled before
        // anything else is asked of it. An assignment has one `=` after its
        // name, not the two of a comparison, so `x == 1` is none; `if` and
        // `const` are whole words with a space after them, so `if.scan()` is
        // neither. A line that is no statement is told so wherever it stands:
        // a misspelt `end` after `stop` was once called unreachable, which it
        // is, and which is not what is wrong with it.
        const assign = /^([\w.]+)(?:\s*\[\s*([^\]]*?)\s*\])?\s*=(?!=)\s*(.+)$/.exec(text);
        const isIf = /^if(?:\s|$)/.test(text);
        const isConst = /^const(?:\s|$)/.test(text);
        const isByte = /^byte(?:\s|$)/.test(text);
        const isCall = /^call(?:\s|$)/.test(text);
        // `if = 1` and `const = 1` assign to a word of the language. Say so
        // before the line is read as a comparison or a declaration gone wrong.
        if (assign && RESERVED.has(assign[1])) variable(assign[1]);
        if (!assign && !isIf && !isConst && !isByte && !isCall && text !== 'loop' && text !== 'stop' && !SCAN_CALL.test(text) && !HOLD_CALL.test(text) && !SHOW_CALL.test(text)) {
            fail('Unknown statement: ' + text);
        }
        if (!reachable) fail('Unreachable statement');
        if (isByte) {
            if (started) fail('Declare constants, tables and memory names before the first statement');
            declarePlace(text);
            return;
        }
        if (isConst) {
            if (started) fail('Declare constants, tables and memory names before the first statement');
            // The word after the `=` says which it is, so that a table
            // written wrongly is told about tables.
            if (/^const\s+\w+\s*=\s*table\b/.test(text)) declareTable(text);
            else declareConstant(text);
            return;
        }
        started = true;
        if (text === 'loop') {
            const start = label();
            blocks.push({ kind: 'loop', start, line });
            mark(start);
            forget();
        } else if (isIf) {
            const test = /^if\s+(.+?)\s*(>=|==|!=|<)\s*([\w.$]+)$/.exec(text);
            if (!test) {
                // CMP wants the left side in A and the right side as one operand.
                // When the operator is one of the four and only the right side
                // is too much, say that: naming the operators again sends the
                // reader to look at the one thing that is right.
                // That holds only if what stands before the operator is clean:
                // in `if 0 =< 2` the `<` is found, and it is the operator that
                // is wrong.
                const loose = /^if\s+(.+?)\s*(>=|==|!=|<(?!=))\s*(.*)$/.exec(text);
                if (loose && !/[<>=!]/.test(loose[1])) {
                    if (!loose[3]) fail('A comparison needs a literal, variable or display field on its right');
                    if (!/[<>=!]/.test(loose[3])) {
                        fail('The right side of a comparison is one literal, variable or display field; write an operation, a table read or a key read on the left');
                    }
                }
                fail('Expected an unsigned comparison using <, >=, == or !=');
            }
            expression(test[1].trim());
            emit('CMP', ...operand(test[3]));
            const otherwise = label();
            emit(FALSE_BRANCH.get(test[2]), 'rel', otherwise);
            blocks.push({ kind: 'if', entry: new Set(defined), otherwise, end: label(), line });
        } else if (text === 'stop') {
            emit('JMP', 'abs', 0xfe22);
            reachable = false;
        } else if (SCAN_CALL.test(text)) {
            scan();
        } else if (SHOW_CALL.test(text)) {
            // A call like any other: START leaves Port A an output, and the
            // last digit lit, so nothing is known when it comes back.
            emit('JSR', 'abs', SHOW);
            forget();
        } else if (isCall) {
            const match = /^call\s+(\S+)$/.exec(text);
            if (!match) fail('Expected call and an address, such as call $FF7E');
            emit('JSR', 'abs', address(match[1]));
            // The routine is somebody else's. Nothing is known when it comes
            // back: not A, and not which way it has left Port A, so the next
            // key read sets that again.
            forget();
        } else if (HOLD_CALL.test(text)) {
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
                return;
            }
            if (places.has(name)) {
                // Written there and then. A is left as the value's own name or
                // number, which the store has not changed, and never as this
                // name: the next reading of it has to be a reading.
                expression(value.trim());
                emit('STA', ...place(name));
                return;
            }
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
    // every statement after it without a word.
    for (const raw of source.split(/\r\n|\r|\n/)) {
        line++;
        const text = raw.split('#', 1)[0].trim();
        if (text) statement(text);
    }
    if (blocks.length) { line = blocks.at(-1).line; fail('Missing end for ' + blocks.at(-1).kind); }
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
        items.push({ bytes: table.bytes, line: table.line });
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
