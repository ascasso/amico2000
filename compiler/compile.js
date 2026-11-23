'use strict';

const { assemble } = require('./emit');

// The hex display scan returns with Port A in input mode. TASTO itself
// assumes that direction. Both calls can destroy A, X, and Y.
const SCAN = 0xff0c;
const READ_KEY = 0xff57;
const FIELDS = new Map([['display.data', 0xf9], ['display.low', 0xfa], ['display.high', 0xfb]]);
const NAME = /^[a-z][a-z0-9_]*$/;
const RESERVED = new Set(['if', 'else', 'end', 'loop', 'stop', 'const', 'table', 'byte', 'in', 'display', 'keypad']);
const ARITHMETIC = new Map([['+', 'ADC'], ['-', 'SBC'], ['&', 'AND'], ['|', 'ORA'], ['^', 'EOR']]);
const FALSE_BRANCH = new Map([['<', 'BCS'], ['>=', 'BCC'], ['==', 'BNE'], ['!=', 'BEQ']]);

function compile(source) {
    const items = [];
    const tables = new Map();
    const blocks = [];
    let defined = new Set();
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
        if (!/^(?:[0-9]+|\$[a-fA-F0-9]+)$/.test(text)) return null;
        const value = text.startsWith('$') ? parseInt(text.slice(1), 16) : Number(text);
        if (value > 255) fail('Byte literal out of range: ' + text);
        return value;
    }
    function variable(name) {
        if (!NAME.test(name) || RESERVED.has(name) || tables.has(name)) fail('Invalid byte variable: ' + name);
        return 'var_' + name;
    }
    function operand(text) {
        const value = number(text);
        if (value !== null) return ['imm', value];
        if (FIELDS.has(text)) return ['zp', FIELDS.get(text)];
        if (!defined.has(text)) fail('Expected a byte literal or an assigned variable, got ' + text);
        return ['zp', variable(text)];
    }
    function load(text) {
        const arg = operand(text);
        if (inA !== text) emit('LDA', ...arg);
        inA = text;
    }
    function scan() {
        emit('JSR', 'abs', SCAN);
        inputReady = true;
        inA = null;
    }
    function expression(text) {
        if (text === 'keypad.read()' || text === 'keypad.press()') {
            if (text === 'keypad.press()') {
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
        const lookup = /^([a-z][a-z0-9_]*)\[\s*([^\]]+?)\s*\]$/.exec(text);
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
    function declareTable(text) {
        const match = /^const\s+(\w+)\s*=\s*table\s+byte\s*\[\s*(\w+)\s+in\s+0\s*\.\.\s*([\w$]+)\s*\]\s*=\s*([\w$]+)(?:\s*([*+-])\s*([\w$]+))?$/.exec(text);
        if (!match) fail('Expected const name = table byte [n in 0..last] = formula');
        const [, name, index, limit, lhs, op, rhs] = match;
        variable(name);
        if (!NAME.test(index) || RESERVED.has(index)) fail('Invalid table index name: ' + index);
        const last = number(limit);
        if (last === null) fail('Expected a byte literal for the last table index');
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
        if (!reachable) fail('Unreachable statement');
        if (/^const\b/.test(text)) {
            if (started) fail('Declare tables before the first statement');
            declareTable(text);
            return;
        }
        started = true;
        if (text === 'loop') {
            const start = label();
            blocks.push({ kind: 'loop', start, line });
            mark(start);
            forget();
        } else if (/^if\b/.test(text)) {
            const test = /^if\s+(.+?)\s*(>=|==|!=|<)\s*([\w.$]+)$/.exec(text);
            if (!test) fail('Expected an unsigned comparison using <, >=, == or !=');
            expression(test[1].trim());
            emit('CMP', ...operand(test[3]));
            const otherwise = label();
            emit(FALSE_BRANCH.get(test[2]), 'rel', otherwise);
            blocks.push({ kind: 'if', entry: new Set(defined), otherwise, end: label(), line });
        } else if (text === 'stop') {
            emit('JMP', 'abs', 0xfe22);
            reachable = false;
        } else if (text === 'display.scan()') {
            scan();
        } else {
            const assign = /^([\w.]+)\s*=\s*(.+)$/.exec(text);
            if (!assign) fail('Unknown statement: ' + text);
            const [, name, value] = assign;
            const address = FIELDS.get(name) ?? variable(name);
            expression(value.trim());
            emit('STA', 'zp', address);
            defined.add(name);
            inA = name;
        }
    }

    emit('CLD'); // RUN restores the saved status, including the previous program's D flag.
    for (const raw of source.split(/\r?\n/)) {
        line++;
        const text = raw.split('#', 1)[0].trim();
        if (text) statement(text);
    }
    if (blocks.length) { line = blocks.at(-1).line; fail('Missing end for ' + blocks.at(-1).kind); }
    if (!started) fail('Expected an executable statement');
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
    return assemble(items);
}

module.exports = { compile };
