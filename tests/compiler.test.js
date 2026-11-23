'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { compile } = require('../compiler/compile');
const { bootedMachine } = require('./helpers/machine');
const { LOAD_ENTRY, realTimeMachine, runRoutine } = require('./helpers/cassette-signal');

const squares = path.join(__dirname, '../compiler/examples/squares.amico');
const cli = path.join(__dirname, '../compiler/amicoc.js');
const tick = (m, cycles = 60000) => m.cpu.run(cycles);
function press(m, key) {
    m.keyDown(key);
    tick(m);
    m.keyUp(key);
    tick(m);
}
function monitorRun(m, digits) {
    tick(m);
    for (const key of ['ArrowUp', ...digits, 'Enter']) press(m, key);
}
function rawRun(source) {
    const m = bootedMachine();
    const { origin, binary } = compile(source);
    m.loadProgram(binary, origin);
    m.cpu.PC = origin;
    return m;
}

test('CLI assembly and binary describe the same 40-byte square program', () => {
    const bin = execFileSync(process.execPath, [cli, '--bin', squares]);
    const asm = execFileSync(process.execPath, [cli, '--asm', squares], { encoding: 'utf8' });
    assert.equal(bin.length, 40);
    let pc = 0x0200;
    const fromListing = [];
    for (const match of asm.matchAll(/; \$([0-9A-F]{4})  ([0-9A-F]{2}(?: [0-9A-F]{2})*)/g)) {
        assert.equal(parseInt(match[1], 16), pc);
        const bytes = match[2].split(' ').map(b => parseInt(b, 16));
        fromListing.push(...bytes);
        pc += bytes.length;
    }
    assert.deepEqual(Buffer.from(fromListing), bin);
    assert.doesNotMatch(asm, /^var_/m); // 'key' stays in A and X.
});

test('the generated tape loads at $0200 and RUN distinguishes F from release in inherited decimal mode', () => {
    const m = bootedMachine();
    m.loadTape(execFileSync(process.execPath, [cli, '--tape', squares]));
    const vectors = m.cpu.memory.slice(0x03fc, 0x0400);
    m.cpu.memory.set([1, 0, 0xff], 0);
    monitorRun(m, 'fc54');
    assert.deepEqual(m.cpu.memory.slice(0x200, 0x228), compile(fs.readFileSync(squares, 'utf8')).binary);
    m.cpu.memory[0xfd] = 0x08; // RUN's RTI will set D from this saved status.
    monitorRun(m, '0200');
    for (let key = 0; key < 16; key++) {
        press(m, key.toString(16));
        const square = key * key;
        assert.equal(m.cpu.memory[0xf9], square);
        const segments = n => m.cpu.memory[0xffea + n] & 127;
        assert.deepEqual(m.getDisplay().slice(-2), [segments(square >> 4), segments(square & 15)]);
    }
    press(m, 'r'); // Function keys should leave the last square on screen.
    assert.equal(m.cpu.memory[0xf9], 0xe1);
    assert.deepEqual(m.cpu.memory.slice(0x03fc, 0x0400), vectors);
});

test('release, contact bounce, and a held key give one debounced press', () => {
    const m = rawRun('loop\nkey = keypad.press()\ndisplay.data = display.data + 1\ndisplay.low = key\nend');
    m.keyDown('Enter');
    tick(m);
    assert.equal(m.cpu.memory[0xf9], 0);
    m.keyUp('Enter');
    tick(m);
    m.keyDown('a');
    tick(m, 5500); // Long enough for one display scan, too short for three.
    m.keyUp('a');
    tick(m);
    assert.equal(m.cpu.memory[0xf9], 0);
    m.keyDown('a');
    tick(m, 180000);
    assert.equal(m.cpu.memory[0xf9], 1);
    assert.equal(m.cpu.memory[0xfa], 10);
    m.keyUp('a');
    tick(m);
    press(m, 'a');
    assert.equal(m.cpu.memory[0xf9], 2);
});

test('reads configure Port A even before the first display scan', () => {
    const m = rawRun('display.data = keypad.read()\nloop\ndisplay.scan()\nend');
    m.cpu.write(0xfd03, 0x89);
    tick(m);
    assert.equal(m.cpu.memory[0xf9], 0x15);
    // The emulator tolerates a read in output mode. Pin the hardware setup too.
    assert.deepEqual([...m.cpu.memory.slice(0x201, 0x206)], [0xa9, 0x99, 0x8d, 0x03, 0xfd]);
});

test('byte arithmetic wraps, branches meet, and a finished program vectors back to the monitor', () => {
    const src = ['a = 255', 'b = a + 2', 'if b == 1', 'c = b - 2', 'else', 'c = 0', 'end',
        'd = c ^ $f0', 'd = d & 3', 'display.data = d | $80'];
    const m = rawRun(src.join('\n'));
    for (let i = 0; i < 100 && m.cpu.PC !== 0xfe22; i++) m.cpu.step();
    assert.equal(m.cpu.PC, 0xfe22);
    assert.equal(m.cpu.memory[0xf9], 0x83);
});

test('a distant conditional destination uses an inverted branch around a full JMP', () => {
    const src = 'if display.low != 0\n' + 'display.data = 3\n'.repeat(40) + 'else\ndisplay.data = 4\nend\nloop\ndisplay.scan()\nend';
    assert.match(compile(src).assembly, /BNE \*\+5/);
    for (const low of [0, 1]) {
        const m = rawRun(src);
        m.cpu.memory[0xfa] = low;
        tick(m);
        assert.equal(m.cpu.memory[0xf9], low ? 3 : 4);
    }
});

test('a table with a constant index folds to a byte, a dynamic lookup includes its table', () => {
    const decl = 'const t = table byte [i in 0..3] = i - 1\n';
    assert.deepEqual([...compile(decl + 'display.data = t[0]').binary], [0xd8, 0xa9, 255, 0x85, 0xf9, 0x4c, 0x22, 0xfe]);
    const prog = compile(decl + 'k = display.low\ndisplay.data = t[k]');
    assert.deepEqual([...prog.binary.slice(-4)], [255, 0, 1, 2]);
    assert.throws(() => compile(decl + 'display.data = t[4]'), /Line 2.*out of range/);
});

test('diagnostics identify mistakes and the linker protects the interrupt vectors', () => {
    const full = 'display.data = 1\n'.repeat(126); // 504 bytes plus CLD and JMP.
    assert.equal(compile(full).binary.length, 508);
    assert.throws(() => compile(full + 'display.scan()'), /511 bytes/);
    for (const [source, error] of [
        ['if 0 == 0\nz = 1\nend\ndisplay.data = z', /Line 4.*assigned variable/],
        ['if display.data == 0\nstop', /Line 1.*Missing end/],
        ['end', /Line 1.*Unexpected end/],
        ['v = 256', /Line 1.*out of range/],
        ['const a = table byte [n in 0..15] = m', /Line 1.*Unknown table formula/],
        ['stop\nv = 2', /Line 2.*Unreachable/],
        ['display.data = 1\n'.repeat(140), /508.*interrupt vectors/]
    ]) assert.throws(() => compile(source), error);
});

test('the matchstick game plays to both endings on the original board memory map', () => {
    const source = fs.readFileSync(path.join(__dirname, '../compiler/examples/matches.amico'), 'utf8');
    const program = compile(source);
    assert.equal(program.binary.length, 186);
    for (const [moves, totals, ending] of [
        ['123333', [0x19, 0x16, 0x12, 0x08, 0x04, 0x01], '5afe01'],
        ['33333', [0x17, 0x13, 0x09, 0x05, 0x01], 'dead01']
    ]) {
        const m = bootedMachine();
        m.loadProgram(program.binary, program.origin);
        monitorRun(m, '0200');
        press(m, '0');
        press(m, 'f');
        assert.equal(m.cpu.memory[0xf9], 0x21);
        for (const [i, key] of [...moves].entries()) {
            press(m, key);
            assert.equal(m.cpu.memory[0xf9], totals[i]);
        }
        const segments = [...ending].map(n => m.cpu.memory[0xffea + parseInt(n, 16)] & 127);
        assert.deepEqual(m.getDisplay(), segments);
        press(m, '1');
        assert.deepEqual(m.getDisplay(), segments);
    }
});

test('an image that would be 257 bytes gets a filler byte, and the board\'s own LOAD then reads all of it', () => {
    // CLD, three scans, sixty-one assignments and the closing JMP: 1 + 9 + 244 + 3 = 257.
    const source = 'display.scan()\n'.repeat(3) + Array.from({ length: 61 }, (_, i) => `display.data = ${i + 1}`).join('\n');
    const { binary, origin, assembly } = compile(source);
    assert.equal(binary.length, 258);
    assert.deepEqual([...binary.slice(254)], [0x4c, 0x22, 0xfe, 0xea]);
    assert.match(assembly, /^; filler: .*\n {4}\.byte \$EA +; \$0301 {2}EA$/m);
    // An image a byte shorter or longer is left as it is: 4 scans and 60
    // assignments make 256 bytes, 2 scans and 62 assignments 258.
    const sized = (scans, assignments) => compile('display.scan()\n'.repeat(scans) + 'display.data = 1\n'.repeat(assignments)).binary;
    assert.equal(sized(4, 60).length, 256);
    assert.equal(sized(2, 62).length, 258);
    assert.equal(sized(2, 62)[257], 0xfe);

    // The PROM's own routine, traps off, against the emulated recorder.
    const load = (data) => {
        const { amico } = realTimeMachine();
        amico.addTapeRecord({ id: 1, start: origin, data });
        amico.cpu.memory.set([1, 0, 0xff], 0);
        runRoutine(amico, LOAD_ENTRY);
        return amico.cpu.memory.slice(origin, origin + data.length);
    };
    assert.deepEqual(load(binary), binary);
    // Without the filler the last byte never arrives: the JMP would go to $0022.
    const bare = binary.slice(0, 257);
    assert.deepEqual([...load(bare).slice(254)], [0x4c, 0x22, 0x00]);
});

test('a line may end with LF, CR LF or a CR alone, and a comment ends with its line', () => {
    const lines = fs.readFileSync(squares, 'utf8').split('\n');
    const expected = compile(lines.join('\n')).binary;
    assert.equal(expected.length, 40);
    for (const ending of ['\r\n', '\r']) assert.deepEqual(compile(lines.join(ending)).binary, expected);
    // Read as one line, everything after the first # would be comment: the
    // second assignment would vanish and the program would still compile.
    const commented = (ending) => compile(['display.data = 1 # one', 'display.data = 2', ''].join(ending)).binary;
    assert.deepEqual(commented('\r'), commented('\n'));
    assert.deepEqual([...commented('\r').slice(1, 9)], [0xa9, 1, 0x85, 0xf9, 0xa9, 2, 0x85, 0xf9]);
    assert.throws(() => compile('v = 1\rw = 256\r'), /^Error: Line 2: Byte literal out of range/);
});
