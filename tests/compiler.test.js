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
// Runs a program until it hands the board back, and gives the memory it
// leaves. The board is read at the monitor's entry, before the monitor puts
// its own address and data into the display fields.
function finished(source) {
    const m = rawRun(source);
    for (let steps = 0; m.cpu.PC !== 0xfe22; steps++) {
        assert.ok(steps < 2e6, 'the program did not come back to the monitor:\n' + source);
        m.cpu.step();
    }
    return m.cpu.memory;
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

test('a refusal names the mistake that was made', () => {
    const table = 'const t = table byte [n in 0..3] = n\n';
    for (const [source, error] of [
        // The operator is one of the six; it is the right side that is too much.
        ['a = 1\nb = 1\nif a == b + 1\nend', /^Error: Line 3: The right side of a comparison is a single value; write an operation, a read by index or a key read on the left/],
        ['if display.low == keypad.read()\nend', /^Error: Line 1: The right side of a comparison/],
        [table + 'if display.low < t[1]\nend', /^Error: Line 2: The right side of a comparison/],
        // Nothing on the right at all.
        ['if 0 ==', /^Error: Line 1: A comparison needs a value on its right/],
        ['a = 1\nif a <', /^Error: Line 2: A comparison needs/],
        // Here it is the operator, also when a `<` can be found inside it.
        ['a = 1\nif a =< 2\nend', /^Error: Line 2: Expected an unsigned comparison using <, <=, >, >=, == or !=/],
        ['a = 1\nif a <> 2\nend', /^Error: Line 2: Expected an unsigned comparison/],
        ['if 0 =< 1+1', /^Error: Line 1: Expected an unsigned comparison/],
        ['byte = 7', /^Error: Line 1: byte is a word of the language/],
        ['in = keypad.read()', /^Error: Line 1: in is a word of the language/],
        // These two begin like a statement of their own, and are still names misused.
        ['if = 1', /^Error: Line 1: if is a word of the language/],
        ['const = 1', /^Error: Line 1: const is a word of the language/],
        [table + 't = 1', /^Error: Line 2: t is a table, not a variable/],
        [table + table + 'display.data = t[0]', /^Error: Line 2: Table declared twice: t/],
        ['Left = 1', /^Error: Line 1: Invalid byte variable: Left/]
    ]) assert.throws(() => compile(source), error);

    // What the message asks for works: the same three on the left.
    for (const source of ['a = 1\nb = 1\nif b + 1 == a\nend', 'if keypad.read() == display.low\nend', table + 'if t[1] < display.low\nend']) {
        assert.ok(compile(source).binary.length > 4);
    }

    // The README lists the words that cannot be names; hold it to the compiler's own list.
    const words = /const RESERVED = new Set\(\[(.*?)\]\)/.exec(fs.readFileSync(path.join(__dirname, '../compiler/compile.js'), 'utf8'))[1]
        .split(',').map(word => word.trim().replace(/'/g, ''));
    const readme = fs.readFileSync(path.join(__dirname, '../compiler/README.md'), 'utf8');
    const listed = /cannot be names: ([^.]+)\./.exec(readme.replace(/\n/g, ' '))[1];
    assert.equal(words.length, 17);
    for (const word of words) {
        assert.ok(listed.includes('`' + word + '`'), `the README does not list ${word}`);
        assert.throws(() => compile(word + ' = 1'), new RegExp(`^Error: Line 1: ${word} is a word of the language`));
    }
});

test('a line that is no statement is called that, wherever it stands', () => {
    // After `stop` nothing can be reached, and a misspelt `end` there was
    // reported as unreachable: true, and no help in finding the spelling.
    assert.throws(() => compile('a = 1\nif a == 1\nstop\nennd\nend'), /^Error: Line 4: Unknown statement: ennd/);
    assert.throws(() => compile('loop\ndisplay.scan()\nend\nend if'), /^Error: Line 4: Unknown statement: end if/);
    // Two that look like statements and are none: a comparison with no `if`,
    // which has the `=` of an assignment in it, and a line that only begins
    // with `if`.
    for (const line of ['x == 1', 'if.scan()']) {
        assert.throws(() => compile(line), new RegExp('^Error: Line 1: Unknown statement: ' + line.replace(/[.()]/g, '\\$&')));
        assert.throws(() => compile('stop\n' + line), /^Error: Line 2: Unknown statement/);
    }
    // A real statement in the same place is still unreachable.
    assert.throws(() => compile('a = 1\nif a == 1\nstop\na = 2\nend'), /^Error: Line 4: Unreachable statement/);
    assert.throws(() => compile('stop\ndisplay.scan()'), /^Error: Line 2: Unreachable statement/);
});

test('a call may have spaces at its brackets, and a table may start at zero however zero is written', () => {
    const same = (spaced, plain) => assert.deepEqual(compile(spaced).binary, compile(plain).binary);
    same('display.scan ()\ndisplay.scan( )', 'display.scan()\ndisplay.scan()');
    same('x = keypad.read ()\ndisplay.data = x', 'x = keypad.read()\ndisplay.data = x');
    same('display.data = keypad.press ( )', 'display.data = keypad.press()');
    same('if keypad.read () == 5\nstop\nend', 'if keypad.read() == 5\nstop\nend');
    // The dot is part of the name, and a call takes nothing in its brackets.
    assert.throws(() => compile('display . scan()'), /^Error: Line 1: Unknown statement/);
    assert.throws(() => compile('x = keypad.read(1)'), /^Error: Line 1: Expected a byte literal/);

    const table = (first) => `const t = table byte [i in ${first}..3] = i * 5\nk = display.low\ndisplay.data = t[k]`;
    for (const zero of ['$0', '00', '$00']) same(table(zero), table('0'));
    assert.throws(() => compile(table('1')), /^Error: Line 1: A table's index starts at 0, not at 1/);
    assert.throws(() => compile(table('k')), /^Error: Line 1: A table's index starts at 0, not at k/);
});

test('a program with nothing to run is refused as a whole, not at a line', () => {
    // Empty, comments only, and tables with nothing that reads them.
    for (const source of ['', '\n\n', '# only a comment\n', 'const t = table byte [n in 0..3] = n\n']) {
        assert.throws(() => compile(source), /^Error: The program has no statement to run$/);
    }
    const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'amico-'));
    const file = path.join(dir, 'empty.amico');
    fs.writeFileSync(file, '# only a comment\n');
    try {
        execFileSync(process.execPath, [cli, '--bin', file], { stdio: 'pipe' });
        assert.fail('the command line accepted a program with no statement');
    } catch (error) {
        assert.equal(error.status, 1);
        assert.equal(String(error.stderr), file + ': The program has no statement to run\n');
    } finally {
        fs.rmSync(dir, { recursive: true });
    }
});

// A limit, not a wish: compiler/README.md warns of it under Display and keys.
// If the helper is ever made to wait for release after a halt, this test and
// that paragraph change together.
test('after HLT, the RUN that resumes a program comes back from keypad.press() as a key', () => {
    const m = bootedMachine();
    const { origin, binary } = compile('display.low = $ee\nloop\nkey = keypad.press()\ndisplay.low = key\nend');
    m.loadProgram(binary, origin);
    monitorRun(m, '0200');
    tick(m, 200000);
    assert.equal(m.cpu.memory[0xfa], 0xee); // The RUN that started it is not a key.
    press(m, '5');
    assert.equal(m.cpu.memory[0xfa], 0x05);
    m.hlt();
    tick(m, 200000);
    assert.ok(m.cpu.PC >= 0xfe00); // Halted: the monitor is running.
    press(m, 'Enter');
    tick(m, 200000);
    assert.equal(m.cpu.memory[0xfa], 0x13); // The RUN that resumed it is.
    press(m, '7');
    assert.equal(m.cpu.memory[0xfa], 0x07);
});

test('a number may have leading zeros, and hex digits of either case', () => {
    // The value a literal is given, read back from the LDA # it becomes.
    const valueOf = (text) => compile('display.data = ' + text).binary[2];
    for (const [text, value] of [
        ['21', 21], ['021', 21], ['0021', 21], ['$15', 21],
        ['$0f', 15], ['$0F', 15], ['$f', 15], ['$F', 15], ['15', 15],
        ['0255', 255], ['$00ff', 255], ['$FF', 255]
    ]) assert.equal(valueOf(text), value, text);
    for (const text of ['256', '0256', '$100']) {
        assert.throws(() => valueOf(text), /^Error: Line 1: Byte literal out of range/, text);
    }
    // Neither of the two usual other ways of writing hex or a power of ten.
    for (const text of ['0x15', '1e2', '$']) assert.throws(() => valueOf(text), /^Error: Line 1: Expected a byte literal/, text);
    // The README says so; the reference interpreter was written from it.
    const readme = fs.readFileSync(path.join(__dirname, '../compiler/README.md'), 'utf8').replace(/\n/g, ' ');
    assert.match(readme, /Leading zeros change nothing, so `021` is 21 and not an octal number/);
    assert.match(readme, /`\$0f`, `\$0F` and `15` are one value/);
});

test('a name that is assigned and never read is warned of, and compiled all the same', () => {
    // One name spelt two ways: the subtraction is worked out and goes nowhere.
    const misspelt = compile('left = 21\nloop\nlfet = left - 1\ndisplay.data = left\ndisplay.scan()\nend');
    assert.deepEqual(misspelt.warnings, ['Line 3: lfet is assigned and never read']);
    assert.ok(misspelt.binary.length > 4);
    assert.doesNotMatch(misspelt.assembly, /lfet/); // It has no place in memory.
    // The manual's first program, as one would first write it.
    assert.deepEqual(compile('a = 9\nb = 1\nsum = a + b').warnings, ['Line 3: sum is assigned and never read']);
    // Once for a name, at the line that first assigns it.
    assert.deepEqual(compile('a = 1\nb = 2\na = 3\ndisplay.data = b').warnings, ['Line 1: a is assigned and never read']);

    // No warning for a name that is read without ever having a place in memory
    // (`key` in the squares program stays in A), nor for a display field, which
    // the board reads.
    for (const file of [squares, path.join(__dirname, '../compiler/examples/matches.amico')]) {
        assert.deepEqual(compile(fs.readFileSync(file, 'utf8')).warnings, [], file);
    }
    assert.doesNotMatch(compile(fs.readFileSync(squares, 'utf8')).assembly, /^var_key/m);
    assert.deepEqual(compile('display.data = 1\ndisplay.low = 2').warnings, []);

    // The command line: the warning on standard error, the output untouched, exit 0.
    const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'amico-'));
    const file = path.join(dir, 'spelt.amico');
    fs.writeFileSync(file, 'left = 21\nlfet = left - 1\ndisplay.data = left\n');
    try {
        const run = require('node:child_process').spawnSync(process.execPath, [cli, '--bin', file]);
        assert.equal(run.status, 0);
        assert.equal(String(run.stderr), file + ': warning: Line 2: lfet is assigned and never read\n');
        assert.deepEqual(new Uint8Array(run.stdout), compile(fs.readFileSync(file, 'utf8')).binary);
    } finally {
        fs.rmSync(dir, { recursive: true });
    }
});

test('a constant stands wherever a literal may, and the keys that are not digits have names', () => {
    const same = (named, plain) => assert.deepEqual(compile(named).binary, compile(plain).binary, named);
    // As an operand, on either side of an operation, and on the right of a comparison.
    same('const start = 21\nleft = start - 1\nif left < start\ndisplay.data = left\nend',
        'left = 21 - 1\nif left < 21\ndisplay.data = left\nend');
    // Given as another constant, in hex or with leading zeros.
    same('const a = $15\nconst b = a\ndisplay.data = b', 'display.data = 021');
    // In a table: its last index, a term of its formula, and a literal index, which is folded.
    const table = 'const t = table byte [n in 0..3] = n * 5\n';
    same('const last = 3\nconst step = 5\nconst t = table byte [n in 0..last] = n * step\nk = display.low\ndisplay.data = t[k]',
        table + 'k = display.low\ndisplay.data = t[k]');
    same('const which = 2\n' + table + 'display.data = t[which]', 'display.data = 10');

    // The six names, by what the monitor's key routine gives.
    const codes = { 'keypad.ad': 0x10, 'keypad.da': 0x11, 'keypad.inc': 0x12, 'keypad.run': 0x13, 'keypad.reg': 0x14, 'keypad.none': 0x15 };
    for (const [name, code] of Object.entries(codes)) same('display.data = ' + name, 'display.data = ' + code);
    const m = bootedMachine();
    const { origin, binary } = compile('loop\nk = keypad.press()\nif k == keypad.run\ndisplay.data = $aa\nend\nif k == keypad.reg\ndisplay.data = $bb\nend\nend');
    m.loadProgram(binary, origin);
    m.cpu.PC = origin;
    tick(m, 200000);
    press(m, 'Enter');
    assert.equal(m.cpu.memory[0xf9], 0xaa);
    press(m, 'r');
    assert.equal(m.cpu.memory[0xf9], 0xbb);
    // And a table's formula takes them, dot and all.
    same('const t = table byte [n in 0..3] = keypad.none - n\nk = display.low\ndisplay.data = t[k]',
        'const t = table byte [n in 0..3] = 21 - n\nk = display.low\ndisplay.data = t[k]');

    for (const [source, error] of [
        ['const a = 1\nconst a = 2\ndisplay.data = a', /^Error: Line 2: Constant declared twice: a/],
        ['const a = 1\na = 2', /^Error: Line 2: a is a constant, not a variable/],
        ['keypad.none = 1', /^Error: Line 1: keypad.none is a constant, not a variable/],
        ['display.data = 1\nconst a = 1', /^Error: Line 2: Declare constants, tables and memory names before the first statement/],
        ['const a = b\ndisplay.data = a', /^Error: Line 1: A constant is a byte literal or another constant, not b/],
        ['const a = 256\ndisplay.data = a', /^Error: Line 1: Byte literal out of range: 256/],
        ['const byte = 1\ndisplay.data = 1', /^Error: Line 1: byte is a word of the language/],
        ['const a = 1 + 2\ndisplay.data = a', /^Error: Line 1: Expected const name = byte, or const name = table/],
        ['const t = table\ndisplay.data = 1', /^Error: Line 1: Expected const name = table byte/],
        // A name taken twice is told what has it, not that it is no variable.
        [table + 'const t = 4\ndisplay.data = 1', /^Error: Line 2: t is already a table$/],
        ['const t = 4\n' + table + 'display.data = 1', /^Error: Line 2: t is already a constant$/],
        // A last index that is neither a number nor a constant is shown, and constants are allowed for.
        ['const t = table byte [n in 0..keypad.non] = n\nstop', /^Error: Line 1: Expected a byte literal or a constant for the last table index, got keypad.non$/],
        ['x = y', /^Error: Line 1: Expected a byte literal, a constant or an assigned variable, got y$/],
        // The dots of the range are the range's: a third one is not part of a term.
        ['const t = table byte [n in 0... 3] = n\nstop', /^Error: Line 1: Expected const name = table byte \[n in 0\.\.last\] = formula/],
        ['const t = table byte [n in 0..3.] = n\nstop', /^Error: Line 1: Expected const name = table byte/],
        ['const t = table byte [n in 0..3] = n.\nstop', /^Error: Line 1: Expected const name = table byte/]
    ]) assert.throws(() => compile(source), error);
    // A constant nobody uses is no fault, and is not a name that was never read.
    assert.deepEqual(compile('const spare = 9\ndisplay.data = 1').warnings, []);
});

test('display.hold() keeps a result on the displays until RES, where stop loses it', () => {
    const shown = (m) => m.getDisplay().map(pattern => {
        const digit = [...m.cpu.memory.slice(0xffea, 0xfffa)].findIndex(entry => (entry & 127) === pattern);
        return digit < 0 ? '?' : digit.toString(16);
    }).join('');
    const result = 'display.high = $12\ndisplay.low = $34\ndisplay.data = $56\n';

    // With stop, the monitor takes the displays back for its own address and data.
    const stopped = bootedMachine();
    let program = compile(result + 'stop');
    stopped.loadProgram(program.binary, program.origin);
    monitorRun(stopped, '0200');
    tick(stopped, 200000);
    assert.equal(shown(stopped), '000000');

    // With display.hold(), the result stays, whatever is pressed, until RES.
    const held = bootedMachine();
    program = compile(result + 'display.hold()');
    held.loadProgram(program.binary, program.origin);
    monitorRun(held, '0200');
    tick(held, 200000);
    assert.equal(shown(held), '123456');
    for (const key of ['5', 'ArrowUp', 'Enter', 'r']) press(held, key);
    tick(held, 1000000);
    assert.equal(shown(held), '123456');
    held.res();
    tick(held, 200000);
    assert.equal(shown(held), '000000');

    // It is `loop`, `display.scan()`, `end` in one word: the same six bytes, and
    // nothing after it is reached.
    assert.deepEqual(compile('display.data = 1\ndisplay.hold()').binary, compile('display.data = 1\nloop\ndisplay.scan()\nend').binary);
    assert.deepEqual([...compile('display.data = 1\ndisplay.hold ( )').binary.slice(5)], [0x20, 0x0c, 0xff, 0x4c, 0x05, 0x02]);
    assert.throws(() => compile('display.hold()\ndisplay.data = 1'), /^Error: Line 2: Unreachable statement/);
    assert.throws(() => compile('x = display.hold()'), /^Error: Line 1: Expected a byte literal/);
    // In one arm of an `if`, the program goes on by the other.
    assert.ok(compile('k = display.low\nif k == 1\ndisplay.hold()\nend\ndisplay.data = 2').binary.length > 8);
});

// Another limit the README warns of, under Display and keys. The display
// fields are the monitor's own workspace, and HLT is the monitor.
test('HLT gives the display fields to the monitor, and RUN does not give them back', () => {
    const fields = (m) => [...m.cpu.memory.slice(0xf9, 0xfc)];
    const haltAndResume = (source) => {
        const m = bootedMachine();
        const { origin, binary } = compile(source);
        m.loadProgram(binary, origin);
        monitorRun(m, '0200');
        tick(m, 200000);
        const before = fields(m);
        m.hlt();
        tick(m, 200000);
        const halted = fields(m);
        press(m, 'Enter');
        tick(m, 200000);
        return { before, halted, after: fields(m), m };
    };

    // State kept in the fields themselves: gone.
    const kept = haltAndResume('display.high = $12\ndisplay.low = $34\ndisplay.data = $56\ndisplay.hold()');
    assert.deepEqual(kept.before, [0x56, 0x34, 0x12]);
    assert.notDeepEqual(kept.halted.slice(1), [0x34, 0x12]); // The halted address is there instead.
    assert.deepEqual(kept.after.slice(1), kept.halted.slice(1)); // And RUN leaves it there.

    // State kept in a variable and written to the fields each round: back at once.
    const written = haltAndResume('a = $12\nloop\ndisplay.high = a\ndisplay.low = a\ndisplay.data = a\ndisplay.scan()\nend');
    assert.deepEqual(written.before, [0x12, 0x12, 0x12]);
    assert.notDeepEqual(written.halted.slice(1), [0x12, 0x12]);
    assert.deepEqual(written.after, [0x12, 0x12, 0x12]);
});

test('a constant costs what the number it stands for costs', () => {
    // The compiler skips a load when A already holds the value. It knew A by
    // the spelling of what was loaded, so a constant, or the same number
    // written another way, was loaded twice where the plain literal was not.
    const literal = compile('if 21 == display.low\ndisplay.data = 21\nend').binary;
    assert.equal(literal.length, 12);
    for (const [first, second] of [['keypad.none', '21'], ['21', 'keypad.none'], ['$15', '21'], ['021', '$15'], ['keypad.none', 'keypad.none']]) {
        assert.deepEqual(compile(`if ${first} == display.low\ndisplay.data = ${second}\nend`).binary, literal, `${first} then ${second}`);
    }
    assert.deepEqual(compile('const start = 21\nif start == display.low\ndisplay.data = 21\nend').binary, literal);
    // Two bytes are what decide whether a full program fits.
    const full = (value) => compile(`if ${value} == display.low\ndisplay.data = 21\nend\n` + 'display.scan()\n'.repeat(165)).binary;
    assert.equal(full('21').length, 507);
    assert.equal(full('keypad.none').length, 507);
    // A different value is still loaded, and so is a variable, though it
    // happens to hold the value that is in A.
    assert.equal(compile('if 21 == display.low\ndisplay.data = 22\nend').binary.length, 14);
    assert.match(compile('y = 21\nif 21 == display.low\ndisplay.data = y\nend').assembly, /CMP \$FA .*\n.*\n +LDA var_y/);
});

test('a table may be written out, byte by byte', () => {
    // The same bytes by a formula and written out are the same program.
    const reading = '\nk = display.low\ndisplay.data = t[k]';
    const written = compile('const t = table byte = 0, 3, 6, 9' + reading);
    assert.deepEqual(written.binary, compile('const t = table byte [n in 0..3] = n * 3' + reading).binary);
    assert.deepEqual([...written.binary.slice(-4)], [0, 3, 6, 9]);
    // Each byte is a literal, however spelt, or a constant; spaces are free.
    assert.deepEqual([...compile('const a = 5\nconst t = table byte=a ,keypad.none, 021,$f' + reading).binary.slice(-4)], [5, 0x15, 21, 15]);
    // A literal index is checked against the bytes there are, and folded.
    assert.deepEqual([...compile('const t = table byte = $77, $6d, $79, $38\ndisplay.data = t[2]').binary], [0xd8, 0xa9, 0x79, 0x85, 0xf9, 0x4c, 0x22, 0xfe]);
    assert.throws(() => compile('const t = table byte = 1, 2\ndisplay.data = t[2]'), /^Error: Line 2: Table index out of range/);
    // The six patterns of the manual's own word, read on the board.
    const m = bootedMachine();
    const word = compile('const word = table byte = $77, $6d, $79, $38, 0, 0\nk = display.low\ndisplay.data = word[k]');
    m.loadProgram(word.binary, word.origin);
    for (const [index, pattern] of [[0, 0x77], [3, 0x38], [5, 0]]) {
        m.cpu.memory[0xfa] = index;
        m.cpu.PC = word.origin;
        while (m.cpu.PC !== 0xfe22) m.cpu.step();
        assert.equal(m.cpu.memory[0xf9], pattern);
    }
    // 256 bytes are the most a byte can index.
    const many = (count) => 'const t = table byte = ' + Array.from({ length: count }, (_, i) => i & 255).join(', ') + reading;
    assert.equal(compile(many(256)).binary.length, 12 + 256);
    for (const [source, error] of [
        [many(257), /^Error: Line 1: A table holds 256 bytes at most, and this one has 257/],
        ['const t = table byte =' + reading, /^Error: Line 1: A table that is written out needs at least one byte/],
        ['const t = table byte = 1,, 2' + reading, /^Error: Line 1: A comma in a table needs a byte on both its sides/],
        ['const t = table byte = 1, 2,' + reading, /^Error: Line 1: A comma in a table needs a byte on both its sides/],
        ['const t = table byte = 1, x' + reading, /^Error: Line 1: A table is written as bytes with commas between them, and this is not a byte: x/],
        ['const t = table byte = 1 2' + reading, /^Error: Line 1: .*this is not a byte: 1 2/],
        ['const t = table byte = 1, 256' + reading, /^Error: Line 1: Byte literal out of range: 256/],
        ['const t = table byte = 1\nconst t = table byte = 2' + reading, /^Error: Line 2: Table declared twice: t/],
        ['const t = table byte' + reading, /^Error: Line 1: Expected const name = table byte \[n in 0\.\.last\] = formula, or const name = table byte = byte, byte/]
    ]) assert.throws(() => compile(source), error);
});

test('a memory location can be given a name, and the manual\'s first program written', () => {
    // Tabella 7 of the supplement: add the bytes at $06 and $07 into $04. The
    // manual keys 18 A5 06 65 07 85 04 4C 22 FE; this is those ten bytes with
    // the CLC after the load, and a CLD in front.
    const sum = compile('byte a at $06\nbyte b at $07\nbyte sum at $04\nsum = a + b');
    assert.deepEqual([...sum.binary], [0xd8, 0xa5, 0x06, 0x18, 0x65, 0x07, 0x85, 0x04, 0x4c, 0x22, 0xfe]);
    assert.deepEqual(sum.warnings, []); // A named location is not a name that goes unread.
    const add = (first, second, status) => {
        const m = bootedMachine();
        m.loadProgram(sum.binary, sum.origin);
        m.cpu.memory.set([first, second], 0x06);
        m.cpu.setP(status);
        m.cpu.PC = sum.origin;
        while (m.cpu.PC !== 0xfe22) m.cpu.step();
        return m.cpu.memory[0x04];
    };
    assert.equal(add(9, 1, 0x00), 0x0a);
    // The manual's own bytes give 10 here, in decimal: docs/monitor-rom-review.md, bug 1.
    assert.equal(add(9, 1, 0x08), 0x0a);

    // Above page zero an instruction carries both bytes of the address.
    const far = compile('byte far at $0400\nx = far\nx = x + far\nif x < far\nfar = x\nend\ndisplay.data = far');
    assert.match(far.assembly, /LDA \$0400 .*AD 00 04/);
    assert.match(far.assembly, /ADC \$0400 .*6D 00 04/);
    assert.match(far.assembly, /CMP \$0400 .*CD 00 04/);
    assert.match(far.assembly, /STA \$0400 .*8D 00 04/);
    assert.deepEqual(compile('byte p at 128\ndisplay.data = p').binary, compile('byte p at $0080\ndisplay.data = p').binary);

    // The LEDs D4-D7, by the three ports that light them (AGENTS.md, The LEDs
    // D4-D7 Under a Program): the mode word first, then the two ports.
    const leds = compile('byte port_a at $fd00\nbyte port_b at $fd01\nbyte control at $fd03\ncontrol = $89\nport_b = $87\nport_a = 5\nloop\nend');
    const board = bootedMachine();
    board.loadProgram(leds.binary, leds.origin);
    board.cpu.PC = leds.origin;
    tick(board, 20000);
    assert.equal(board.phaseLEDs.on, 5);
});

test('a named location is read and written every time it is named, never remembered', () => {
    const count = (assembly, instruction) => assembly.split('\n').filter(line => line.includes(instruction)).length;
    // Two readings are two readings: it may be a port, and say something else.
    const twice = compile('byte port at $fd00\nx = port\ny = port\ndisplay.data = x\ndisplay.low = y');
    assert.equal(count(twice.assembly, 'LDA $FD00'), 2);
    // Also straight after a comparison that has just read it.
    assert.equal(count(compile('byte port at $fd00\nif port < 5\nx = port\ndisplay.data = x\nend').assembly, 'LDA $FD00'), 2);
    // Written and then read is a store and then a load, where a variable
    // of the program's own would still be in A and need neither.
    assert.equal(count(compile('byte port at $fd00\nport = display.high\nx = port\ndisplay.data = x').assembly, 'LDA $FD00'), 1);
    assert.doesNotMatch(compile('p = display.high\nx = p\ndisplay.data = x').assembly, /var_p/);
    // And what was written is not taken to be what is there. A PROM takes no
    // writes: the board shows the monitor's first byte, not the 0 just stored.
    const rom = compile('byte first at $fe00\nfirst = 0\ndisplay.data = first');
    assert.equal(count(rom.assembly, 'LDA $FE00'), 1);
    const m = bootedMachine();
    m.loadProgram(rom.binary, rom.origin);
    m.cpu.PC = rom.origin;
    while (m.cpu.PC !== 0xfe22) m.cpu.step();
    assert.equal(m.cpu.memory[0xf9], m.cpu.memory[0xfe00]);
    assert.notEqual(m.cpu.memory[0xfe00], 0);
    // After a store, A is still known by the value stored, so the same
    // number is not loaded again for the next store.
    assert.equal(count(compile('byte p at $80\nbyte q at $81\np = 7\nq = 7').assembly, 'LDA #$07'), 1);

    for (const [source, error] of [
        ['byte p at $20\ndisplay.data = p', /^Error: Line 1: \$20-\$7F is where the compiler keeps the program's own variables; \$20 is inside it/],
        ['byte p at $7f\ndisplay.data = p', /^Error: Line 1: \$20-\$7F is where/],
        ['byte p at $10000\ndisplay.data = p', /^Error: Line 1: An address is \$FFFF at most, not \$10000/],
        ['byte p at here\ndisplay.data = p', /^Error: Line 1: An address is a number, such as \$04 or \$FD01, not here/],
        ['byte p\ndisplay.data = 1', /^Error: Line 1: Expected byte name at address/],
        ['byte p at $80\nbyte p at $81\ndisplay.data = p', /^Error: Line 2: Memory name declared twice: p/],
        ['const p = 1\nbyte p at $80\ndisplay.data = p', /^Error: Line 2: p is already a constant/],
        ['byte p at $80\nconst p = 1\ndisplay.data = p', /^Error: Line 2: p is already a memory name/],
        ['byte p at $80\nconst p = table byte = 1\ndisplay.data = 1', /^Error: Line 2: p is already a memory name/],
        ['display.data = 1\nbyte p at $80', /^Error: Line 2: Declare constants, tables and memory names before the first statement/],
        ['byte if at $80\ndisplay.data = 1', /^Error: Line 1: if is a word of the language/]
    ]) assert.throws(() => compile(source), error);
    // Two names for one byte are allowed, and a name for a display field's byte.
    assert.ok(compile('byte seconds at $f9\nbyte again at $f9\nseconds = 5\ndisplay.low = again').binary.length > 4);
});

test('a routine can be called by its address, and the manual\'s word shown', () => {
    // The supplement's exercise (PDF page 68): the monitor's routine at $FF7E
    // shows the six bytes at $8F-$94, one bit to a segment, and the manual's
    // word is ASEL, 77 6D 79 38 00 00.
    const word = ['$77', '$6d', '$79', '$38', '0', '0'];
    const source = word.map((_, i) => 'byte d' + i + ' at $' + (0x8f + i).toString(16)).join('\n') + '\n' +
        word.map((pattern, i) => 'd' + i + ' = ' + pattern).join('\n') + '\nloop\n    call $ff7e\nend';
    const program = compile(source);
    const m = bootedMachine();
    m.loadProgram(program.binary, program.origin);
    monitorRun(m, '0200');
    tick(m, 200000);
    assert.deepEqual(m.getDisplay(), [0x77, 0x6d, 0x79, 0x38, 0, 0]);
    assert.deepEqual([...program.binary.slice(-7)], [0x20, 0x7e, 0xff, 0xd8, 0x4c, program.binary.length - 7, 0x02]);

    // After a call nothing is known. A value is loaded again, and a key read
    // sets Port A's direction again, which after display.scan() it need not.
    assert.match(compile('x = 5\ncall $ff0c\ndisplay.data = x').assembly, /JSR \$FF0C .*\n +CLD .*\n +LDA var_x/);
    const scanned = compile('display.scan()\nk = keypad.read()\ndisplay.data = k').binary;
    const called = compile('call $ff0c\nk = keypad.read()\ndisplay.data = k').binary;
    assert.equal(called.length, scanned.length + 6);
    assert.deepEqual([...called.slice(4, 10)], [0xd8, 0xa9, 0x99, 0x8d, 0x03, 0xfd]);
    // The README's own example: an A on the leftmost digit.
    const first = compile('byte first at $8f\nfirst = $77\nloop\n    call $ff7e\nend');
    const board = bootedMachine();
    board.loadProgram(first.binary, first.origin);
    board.cpu.PC = first.origin;
    tick(board, 200000);
    assert.equal(board.getDisplay()[0], 0x77);
    // In decimal, and with spaces, it is the same call.
    assert.deepEqual(compile('call 65406').binary, compile('call   $FF7E').binary);

    for (const [source, error] of [
        ['call', /^Error: Line 1: Expected call and an address, such as call \$FF7E/],
        ['call $ff7e $ff0c', /^Error: Line 1: Expected call and an address/],
        ['call here', /^Error: Line 1: An address is a number, such as \$04 or \$FD01, not here/],
        ['call $10000', /^Error: Line 1: An address is \$FFFF at most/],
        ['x = call $ff7e', /^Error: Line 1: Expected a byte literal/],
        ['call = 1', /^Error: Line 1: call is a word of the language/],
        ['stop\ncall $ff7e', /^Error: Line 2: Unreachable statement/]
    ]) assert.throws(() => compile(source), error);
});

test('a row of bytes is named once and indexed', () => {
    const bytes = (source) => [...compile(source).binary];
    const row = 'byte segment[6] at $8f\n';
    // A literal index is a plain address: no X, nothing more than a single byte costs.
    assert.deepEqual(bytes(row + 'segment[0] = $77\nsegment[5] = 0'), [0xd8, 0xa9, 0x77, 0x85, 0x8f, 0xa9, 0x00, 0x85, 0x94, 0x4c, 0x22, 0xfe]);
    assert.deepEqual(bytes(row + 'display.data = segment[2]'), [0xd8, 0xa5, 0x91, 0x85, 0xf9, 0x4c, 0x22, 0xfe]);
    // A variable index goes to X. To store, the value is in A first and X is
    // loaded on its own; to read, the index is moved over from A.
    assert.deepEqual(bytes(row + 'i = display.low\nsegment[i] = $77').slice(5, 11), [0xa9, 0x77, 0xa6, 0x20, 0x95, 0x8f]);
    assert.deepEqual(bytes(row + 'i = display.low\nx = segment[i]\ndisplay.data = x').slice(3, 6), [0xaa, 0xb5, 0x8f]);
    // Above page zero the row's address is two bytes.
    const far = compile('byte far[4] at $0400\ni = display.low\nfar[i] = i\ndisplay.data = far[i]\ndisplay.high = far[3]').assembly;
    assert.match(far, /STA \$0400,X .*9D 00 04/);
    assert.match(far, /LDA \$0400,X .*BD 00 04/);
    assert.match(far, /LDA \$0403 .*AD 03 04/);
    // A row that runs out of page zero cannot use the short form: indexed
    // there, an address wraps round inside the page and would never reach $0100.
    const edge = compile('byte edge[16] at $f8\ni = display.low\nedge[i] = 1\ndisplay.data = edge[8]').assembly;
    assert.match(edge, /STA \$00F8,X .*9D F8 00/);
    assert.match(edge, /LDA \$0100 .*AD 00 01/);
    // The count may be a constant, and a row may be as long as a byte can index.
    assert.deepEqual(bytes('const n = 6\nbyte segment[n] at $8f\nsegment[5] = 1'), bytes(row + 'segment[5] = 1'));
    assert.deepEqual(bytes('byte big[256] at $0400\nbig[255] = 1').slice(3, 6), [0x8d, 0xff, 0x04]);
    assert.deepEqual(compile(row + 'segment[0] = 1').warnings, []);

    // The manual's word copied out of a table, a byte at a time, and shown.
    const word = compile(['const word = table byte = $77, $6d, $79, $38, 0, 0', 'byte segment[6] at $8f', 'i = 0', 'loop',
        '    segment[i] = word[i]', '    i = i + 1', '    if i == 6', '        loop', '            call $ff7e', '        end', '    end', 'end'].join('\n'));
    const m = bootedMachine();
    m.loadProgram(word.binary, word.origin);
    monitorRun(m, '0200');
    tick(m, 200000);
    assert.deepEqual(m.getDisplay(), [0x77, 0x6d, 0x79, 0x38, 0, 0]);
    // A byte of a row may be read into another, and compared.
    assert.deepEqual(bytes('byte r[4] at $80\nr[1] = r[2]'), [0xd8, 0xa5, 0x82, 0x85, 0x81, 0x4c, 0x22, 0xfe]);
    assert.ok(compile('byte r[4] at $80\nif r[1] == 3\nr[0] = 9\nend').binary.length > 8);
    // The index may be a display field or a named location.
    assert.deepEqual(bytes('byte r[4] at $80\nr[display.low] = display.high').slice(1, 7), [0xa5, 0xfb, 0xa6, 0xfa, 0x95, 0x80]);
    assert.deepEqual(bytes('byte r[4] at $80\nbyte p at $0400\nr[p] = 9').slice(3, 8), [0xae, 0x00, 0x04, 0x95, 0x80]);

    for (const [source, error] of [
        [row + 'segment[6] = 1', /^Error: Line 2: Index out of range: segment\[6\], and segment has 6 bytes/],
        [row + 'display.data = segment[6]', /^Error: Line 2: Index out of range: segment\[6\]/],
        [row + 'display.data = segment', /^Error: Line 2: segment is a row of bytes: say which one, as segment\[0\]/],
        [row + 'segment = 1', /^Error: Line 2: segment is a row of bytes/],
        ['byte one at $8f\none[0] = 1', /^Error: Line 2: one is a single byte and takes no index/],
        ['byte one at $8f\ndisplay.data = one[0]', /^Error: Line 2: one is a single byte and takes no index/],
        ['byte r[0] at $80\ndisplay.data = 1', /^Error: Line 1: A row has 1 to 256 bytes, not 0/],
        ['byte r[257] at $0400\ndisplay.data = 1', /^Error: Line 1: A row has 1 to 256 bytes, not 257/],
        ['byte r[] at $80\ndisplay.data = 1', /^Error: Line 1: A row is so many bytes: a number or a constant, not nothing/],
        ['byte r[x] at $80\ndisplay.data = 1', /^Error: Line 1: A row is so many bytes: a number or a constant, not x/],
        ['byte r[4] at $1e\ndisplay.data = 1', /^Error: Line 1: \$20-\$7F is where the compiler keeps the program's own variables; r would overlap it/],
        ['byte r[4] at $7e\ndisplay.data = 1', /^Error: Line 1: \$20-\$7F is where/],
        ['byte r[4] at $fffe\ndisplay.data = 1', /^Error: Line 1: r would run past \$FFFF/],
        ['const t = table byte = 1, 2\nt[0] = 5', /^Error: Line 2: t is a table, and a table is not written to/],
        ['x = 1\nx[0] = 5', /^Error: Line 2: Only a row of bytes takes an index on the left of =, and x is not one/],
        ['byte r[4] at $80\ni = 1\nr[i + 1] = 5', /^Error: Line 3: Expected a byte literal, a constant or an assigned variable, got i \+ 1/]
    ]) assert.throws(() => compile(source), error);
});

test('the six digits have a name as raw segments, and three more examples run', () => {
    const example = (name) => compile(fs.readFileSync(path.join(__dirname, '../compiler/examples', name + '.amico'), 'utf8'));
    // display.segment is the row at $8F-$94, and display.show() the call that shows it.
    assert.deepEqual([...compile('display.segment[2] = $79\ndisplay.show()').binary], [0xd8, 0xa9, 0x79, 0x85, 0x91, 0x20, 0x7e, 0xff, 0x4c, 0x22, 0xfe]);
    assert.deepEqual(compile('display.segment[2] = $79').binary, compile('byte s[6] at $8f\ns[2] = $79').binary);
    assert.deepEqual(compile('i = display.low\ndisplay.data = display.segment[i]').binary, compile('byte s[6] at $8f\ni = display.low\ndisplay.data = s[i]').binary);
    // The routine leaves Port A an output, so a key read after it sets the direction again.
    assert.equal(compile('display.show()\nk = keypad.read()\ndisplay.data = k').binary.length,
        compile('display.scan()\nk = keypad.read()\ndisplay.data = k').binary.length + 5);
    for (const [source, error] of [
        ['display.segment[6] = 1', /^Error: Line 1: Index out of range: display.segment\[6\], and display.segment has 6 bytes/],
        ['display.segment = 1', /^Error: Line 1: display.segment is a row of bytes/],
        ['x = display.show()', /^Error: Line 1: Expected a byte literal/],
        ['display.hold()\ndisplay.show()', /^Error: Line 2: Unreachable statement/]
    ]) assert.throws(() => compile(source), error);

    // The manual's sum (Tabella 7): its own ten bytes, the CLC after the load, and a CLD in front.
    const sum = example('sum');
    assert.deepEqual([...sum.binary], [0xd8, 0xa5, 0x06, 0x18, 0x65, 0x07, 0x85, 0x04, 0x4c, 0x22, 0xfe]);
    // Keyed as its first lines say: the two numbers, RUN at 0200, and the sum at 0004.
    let m = bootedMachine();
    m.loadProgram(sum.binary, sum.origin);
    tick(m);
    for (const key of ['ArrowUp', '0', '0', '0', '6', 'ArrowDown', '0', '9', '+', '0', '1']) press(m, key);
    monitorRun(m, '0200');
    tick(m, 200000);
    for (const key of ['ArrowUp', '0', '0', '0', '4']) press(m, key);
    assert.equal(m.cpu.memory[0x04], 0x0a);
    assert.equal(m.cpu.memory[0xf9], 0x0a); // The monitor shows the byte at the address keyed.

    // The manual's word.
    const word = example('word');
    assert.equal(word.binary.length, 29);
    m = bootedMachine();
    m.loadProgram(word.binary, word.origin);
    monitorRun(m, '0200');
    tick(m, 200000);
    assert.deepEqual(m.getDisplay(), [0x77, 0x6d, 0x79, 0x38, 0, 0]);

    // The LEDs count, twice a second, and the displays stay dark.
    const leds = example('leds');
    m = bootedMachine();
    m.loadProgram(leds.binary, leds.origin);
    monitorRun(m, '0200');
    const seen = [];
    const at = [];
    const started = m.cpu.cycles;
    while (seen.length < 5 && m.cpu.cycles - started < 10e6) {
        m.cpu.run(2000);
        if (m.phaseLEDs.on !== seen[seen.length - 1]) {
            seen.push(m.phaseLEDs.on);
            at.push(m.cpu.cycles);
        }
    }
    assert.deepEqual(seen, [0, 1, 2, 3, 4]);
    const step = (at[4] - at[1]) / 3;
    assert.ok(step > 450000 && step < 550000, 'a step takes ' + step + ' cycles');
    assert.deepEqual(m.getDisplay(), [0, 0, 0, 0, 0, 0]);
    for (const program of [sum, word, leds]) assert.deepEqual(program.warnings, []);
});

test('decimal mode is cleared after a call, whatever the routine left', () => {
    // SED, RTS: a routine that counts in decimal and does not put the flag back.
    const after = (source, key) => {
        const program = compile(source);
        const m = bootedMachine();
        m.loadProgram(program.binary, program.origin);
        m.cpu.memory.set([0xf8, 0x60], 0x0300);
        if (key) m.keyDown(key);
        m.cpu.PC = program.origin;
        while (m.cpu.PC !== 0xfe22) m.cpu.step();
        return m.cpu.memory[0xf9];
    };
    // In decimal 9 + 1 is $10, and F and no key are both $15 to the key routine
    // (docs/monitor-rom-review.md, bugs 1 and 2).
    assert.equal(after('call $0300\ndisplay.data = 9 + 1'), 0x0a);
    assert.equal(after('call $0300\ndisplay.data = keypad.read()', 'f'), 0x0f);
    assert.deepEqual([...compile('call $0300').binary], [0xd8, 0x20, 0x00, 0x03, 0xd8, 0x4c, 0x22, 0xfe]);
    // The monitor's own routines, which the language names, leave the flag alone, and are not followed by a CLD.
    for (const known of ['display.scan()', 'display.show()', 'k = keypad.read()\ndisplay.data = k']) {
        assert.equal(compile(known).assembly.split('\n').filter(line => / CLD /.test(line)).length, 1, known);
    }
});

test('a store that reaches the 8255 makes the next key read set Port A again', () => {
    // Which way Port A faces when the monitor's key routine is entered. It has
    // to be an input: on the board an output would be driving the key lines.
    const facingInAtTheKeyRoutine = (source) => {
        const program = compile(source);
        const m = bootedMachine();
        m.loadProgram(program.binary, program.origin);
        m.cpu.PC = program.origin;
        let facing = null;
        for (let steps = 0; m.cpu.PC !== 0xfe22 && steps < 200000; steps++) {
            if (m.cpu.PC === 0xff57 && facing === null) facing = m.pia.portAInput;
            m.cpu.step();
        }
        return facing;
    };
    // The scan leaves Port A an input and the compiler knows it; then the
    // program writes a mode word that turns it round. By a name, by the
    // register's last echo in the page, and by a row with either kind of index.
    for (const source of [
        'byte control at $fd03\ndisplay.scan()\ncontrol = $89\ndisplay.data = keypad.read()',
        'byte control at $fdff\ndisplay.scan()\ncontrol = $89\ndisplay.data = keypad.read()',
        'byte io[4] at $fd00\ndisplay.scan()\nio[3] = $89\ndisplay.data = keypad.read()',
        'byte io[4] at $fd00\ni = 3\ndisplay.scan()\nio[i] = $89\ndisplay.data = keypad.read()'
    ]) assert.equal(facingInAtTheKeyRoutine(source), true, source);
    // The emulator reads keys whichever way the port faces, so the value read
    // would not have shown this; the direction does.

    // A store anywhere else leaves what the compiler knew: no second mode word.
    const modeWords = (source) => compile(source).assembly.split('\n').filter(line => line.includes('LDA #$99')).length;
    assert.equal(modeWords('byte p at $0400\ndisplay.scan()\np = 1\ndisplay.data = keypad.read()'), 0);
    assert.equal(modeWords('byte r[4] at $fcfc\ndisplay.scan()\nr[3] = 1\ndisplay.data = keypad.read()'), 0);
    // A row that only touches the page by its last byte does reach it by a variable index.
    assert.equal(modeWords('byte r[5] at $fcfc\ni = 4\ndisplay.scan()\nr[i] = 1\ndisplay.data = keypad.read()'), 1);
    assert.equal(modeWords('byte r[5] at $fcfc\ndisplay.scan()\nr[3] = 1\ndisplay.data = keypad.read()'), 0);
    assert.equal(modeWords('byte p at $fe00\ndisplay.scan()\np = 1\ndisplay.data = keypad.read()'), 0);
});

test('a space may stand before an index, on a read as on a store', () => {
    const same = (spaced, plain) => assert.deepEqual(compile(spaced).binary, compile(plain).binary, spaced);
    same('byte r[1] at 0\nr [0] = 7\ndisplay.data = r [0]', 'byte r[1] at 0\nr[0] = 7\ndisplay.data = r[0]');
    same('const t = table byte = 1, 2\nk = display.low\ndisplay.data = t [k]', 'const t = table byte = 1, 2\nk = display.low\ndisplay.data = t[k]');
    same('const t = table byte = 1, 2\nif t  [ 1 ] == 2\nstop\nend', 'const t = table byte = 1, 2\nif t[1] == 2\nstop\nend');
    same('display.data = display.segment [2]', 'display.data = display.segment[2]');
    // On the board: stored and read back.
    const program = compile('byte r[2] at $80\nr [1] = 7\ndisplay.data = r [1]');
    const m = bootedMachine();
    m.loadProgram(program.binary, program.origin);
    m.cpu.PC = program.origin;
    while (m.cpu.PC !== 0xfe22) m.cpu.step();
    assert.equal(m.cpu.memory[0xf9], 7);
});

test('nothing is taken as known after a call or after display.show()', () => {
    const lines = (source) => compile(source).assembly.split('\n');
    const modeWords = (source) => lines(source).filter(line => line.includes('LDA #$99')).length;
    // Port A's direction. The scan before it matters: at the very start of a
    // program the direction is unknown anyway, and a key read sets it whatever
    // the compiler thinks of the call.
    assert.equal(modeWords('display.scan()\nk = keypad.read()\ndisplay.data = k'), 0);
    assert.equal(modeWords('display.scan()\ncall $ff0c\nk = keypad.read()\ndisplay.data = k'), 1);
    assert.equal(modeWords('display.scan()\ndisplay.show()\nk = keypad.read()\ndisplay.data = k'), 1);
    // The accumulator: a value assigned before is loaded again after.
    for (const [routine, address] of [['call $ff7e', '$FF7E'], ['display.show()', '$FF7E'], ['call $ff0c', '$FF0C']]) {
        const listing = lines('x = 5\n' + routine + '\ndisplay.data = x');
        const called = listing.findIndex(line => line.includes('JSR ' + address));
        assert.ok(listing.slice(called).some(line => line.includes('LDA var_x')), routine);
    }
    // And on the board: the routine at $FF7E does change A, and the 5 still arrives.
    const program = compile('x = 5\ndisplay.show()\ndisplay.data = x');
    const m = bootedMachine();
    m.loadProgram(program.binary, program.origin);
    m.cpu.PC = program.origin;
    while (m.cpu.PC !== 0xfe22) m.cpu.step();
    assert.equal(m.cpu.memory[0xf9], 5);
});

test('the edges of where a name may be: $1F and $80 yes, $20 and $7F no, and $FFFF the last byte', () => {
    const accepted = (source) => assert.ok(compile(source + '\ndisplay.data = 1').binary.length > 4, source);
    const refused = (source, error) => assert.throws(() => compile(source + '\ndisplay.data = 1'), error, source);
    accepted('byte p at $1f');
    accepted('byte p at $80');
    refused('byte p at $20', /^Error: Line 1: \$20-\$7F is where/);
    refused('byte p at $7f', /^Error: Line 1: \$20-\$7F is where/);
    // A row up to $1F, and one from $80.
    accepted('byte r[2] at $1e');
    accepted('byte r[4] at $80');
    refused('byte r[3] at $1e', /^Error: Line 1: \$20-\$7F is where .* r would overlap it/);
    refused('byte r[2] at $7f', /^Error: Line 1: \$20-\$7F is where/);
    // One that spans the whole range from outside it.
    refused('byte r[200] at $10', /^Error: Line 1: \$20-\$7F is where/);
    // The last byte of memory may be the last byte of a row, and no further.
    accepted('byte p at $ffff');
    accepted('byte r[2] at $fffe');
    refused('byte r[3] at $fffe', /^Error: Line 1: r would run past \$FFFF/);
    accepted('byte r[256] at $ff00');
    refused('byte r[256] at $ff01', /^Error: Line 1: r would run past \$FFFF/);
});

test('a named location is a value like any other: an operand, and the right side of a comparison', () => {
    // The README's rows for an operation and for a comparison say so.
    const program = compile('byte limit at $80\nbyte seen at $0400\nx = seen - limit\nif x >= limit\nseen = x | limit\nend\nif limit < seen\ndisplay.data = seen\nend');
    const m = bootedMachine();
    m.loadProgram(program.binary, program.origin);
    m.cpu.memory[0x80] = 3;
    m.cpu.memory[0x0400] = 10;
    m.cpu.PC = program.origin;
    while (m.cpu.PC !== 0xfe22) m.cpu.step();
    assert.equal(m.cpu.memory[0x0400], 7);  // 10 - 3 is 7, 7 >= 3, and 7 | 3 is 7
    assert.equal(m.cpu.memory[0xf9], 7);    // 3 < 7
    const readme = fs.readFileSync(path.join(__dirname, '../compiler/README.md'), 'utf8');
    assert.match(readme, /Both operands are literals, constants, variables, display fields or named\s+locations/);
    assert.match(readme, /the right side is one value: a literal, a constant, a variable, a display field or a named location/);
});

test('for counts through a range, up or down, and leaves its name one step past the end', () => {
    const bytes = (source) => [...compile(source).binary];
    const fields = (source) => { const memory = finished(source); return [memory[0xfb], memory[0xfa], memory[0xf9]]; };
    // Twelve bytes round the statements, as the README says: the count
    // started, and at the foot a step, a load, a compare and a branch. The
    // count is in A at the top, so the first statement does not load it.
    assert.deepEqual(bytes('for i in 0..5\ndisplay.data = i\nend'),
        [0xd8, 0xa9, 0x00, 0x85, 0x20, 0x85, 0xf9, 0xe6, 0x20, 0xa5, 0x20, 0xc9, 0x06, 0xd0, 0xf6, 0x4c, 0x22, 0xfe]);
    assert.equal(bytes('for i in 0..5\ndisplay.data = 1\nend').length, bytes('display.data = 1').length + 12);
    // Downwards it is a DEC, and the compare is with one below the last value.
    assert.deepEqual(bytes('for i in 5..1\ndisplay.data = i\nend').slice(7, 13), [0xc6, 0x20, 0xa5, 0x20, 0xc9, 0x00]);
    // A first value that A is known to hold already is not loaded again.
    assert.equal(bytes('byte p at $80\np = 0\nfor i in 0..5\ndisplay.data = i\nend').length,
        bytes('byte p at $80\np = 1\nfor i in 0..5\ndisplay.data = i\nend').length - 2);

    // high, low, data: a sum over the values, how many rounds, and the name afterwards.
    const counted = (range) => fields(`sum = 0\nrounds = 0\nfor i in ${range}\nsum = sum + i\nrounds = rounds + 1\nend\ndisplay.high = sum\ndisplay.low = rounds\ndisplay.data = i`);
    assert.deepEqual(counted('0..5'), [15, 6, 6]);
    assert.deepEqual(counted('5..0'), [15, 6, 255]);
    assert.deepEqual(counted('2..4'), [9, 3, 5]);
    assert.deepEqual(counted('4..2'), [9, 3, 1]);
    // One value is once round, wherever it is.
    assert.deepEqual(counted('3..3'), [3, 1, 4]);
    assert.deepEqual(counted('0..0'), [0, 1, 1]);
    assert.deepEqual(counted('255..255'), [255, 1, 0]);
    // The whole of a byte is 256 rounds, which the round count wraps on, and
    // the name wraps as it leaves: to 0 going up and to 255 going down.
    assert.deepEqual(counted('0..255'), [(255 * 256 / 2) & 255, 0, 0]);
    assert.deepEqual(counted('255..0'), [(255 * 256 / 2) & 255, 0, 255]);
    assert.deepEqual(counted('250..255'), [(250 + 251 + 252 + 253 + 254 + 255) & 255, 6, 0]);
    assert.deepEqual(counted('3..0'), [6, 4, 255]);
    // The order of the values, kept in a row of bytes.
    const order = finished('byte seen[4] at $80\nn = 0\nfor i in 5..2\nseen[n] = i\nn = n + 1\nend');
    assert.deepEqual([...order.slice(0x80, 0x84)], [5, 4, 3, 2]);
    // Constants for the ends are the same program as the numbers.
    assert.deepEqual(bytes('const first = 2\nconst last = 4\nfor i in first..last\ndisplay.data = i\nend'), bytes('for i in 2..4\ndisplay.data = i\nend'));
    assert.deepEqual(bytes('for i in $0 .. 05\ndisplay.data = i\nend'), bytes('for i in 0..5\ndisplay.data = i\nend'));
    // One inside another, and inside a loop that the program leaves by stop.
    assert.deepEqual(fields('n = 0\nfor i in 0..2\nfor j in 0..3\nn = n + 1\nend\nend\ndisplay.high = n\ndisplay.low = i\ndisplay.data = j'), [12, 3, 4]);
    assert.deepEqual(fields('n = 0\nloop\nfor i in 1..3\nn = n + i\nend\nif n >= 18\ndisplay.high = n\ndisplay.low = i\ndisplay.data = 0\nstop\nend\nend'), [18, 4, 0]);
    // With nothing inside it a for is a pause, and its name is no name that
    // is assigned and never read: the loop reads it.
    assert.deepEqual(compile('for wait in 0..200\nend\ndisplay.data = 1').warnings, []);
    assert.deepEqual(compile('i = 9\nfor i in 0..3\nend\ndisplay.data = 1').warnings, []);
    // A loop that never goes round has no step at its foot: nothing would run it.
    assert.deepEqual(bytes('for i in 0..5\nstop\nend'), [0xd8, 0xa9, 0x00, 0x4c, 0x22, 0xfe]);
    assert.deepEqual(fields('display.high = 0\ndisplay.low = 0\nfor wait in 0..200\nend\ndisplay.data = wait'), [0, 0, 201]);
    // Which way Port A faces is not known at the top of a for: a store in
    // the loop may have turned it since the scan before the loop. So a key
    // read inside sets it, which straight after a scan it need not.
    const turned = 'byte control at $fd03\ndisplay.scan()\nfor i in 0..1\nk = keypad.read()\ndisplay.data = k\ncontrol = $89\nend';
    assert.match(compile(turned).assembly, /flow_1:\n +LDA #\$99 .*\n +STA \$FD03 .*\n +JSR \$FF57/);
    // After its loop the name is a variable again and may be assigned.
    assert.deepEqual(fields('display.high = 0\ndisplay.low = 0\nfor i in 0..5\nend\ni = i + 1\ndisplay.data = i'), [0, 0, 7]);

    // The README's own loop: the manual's word, copied to the displays.
    const m = rawRun('const word = table byte = $77, $6d, $79, $38, 0, 0\nfor i in 0..5\n    display.segment[i] = word[i]\nend\nloop\n    display.show()\nend');
    tick(m, 200000);
    assert.deepEqual(m.getDisplay(), [0x77, 0x6d, 0x79, 0x38, 0, 0]);

    for (const [source, error] of [
        ['for i in 0..5\ni = 2\nend', /^Error: Line 2: i is the count of the for it is in, and only the for changes it/],
        ['for i in 0..5\nif i == 2\ni = keypad.read()\nend\nend', /^Error: Line 3: i is the count of the for it is in/],
        ['for i in 0..5\nfor i in 0..2\nend\nend', /^Error: Line 2: i is already counting the for that this one is inside/],
        ['n = 3\nfor i in 0..n\nend', /^Error: Line 2: A for runs from one number or constant to another, and n is neither; for an end that varies, count in a loop/],
        ['for i in display.low..5\nend', /^Error: Line 1: A for runs from one number or constant to another, and display.low is neither/],
        ['for display.data in 0..5\nend', /^Error: Line 1: A for counts in a variable of the program's own, not in display.data/],
        ['byte p at $80\nfor p in 0..5\nend', /^Error: Line 2: p is a memory name, not a variable/],
        ['const c = 1\nfor c in 0..5\nend', /^Error: Line 2: c is a constant, not a variable/],
        ['for I in 0..5\nend', /^Error: Line 1: Invalid byte variable: I/],
        ['for i in 0..256\nend', /^Error: Line 1: Byte literal out of range: 256/],
        ['for i in 0..5\ndisplay.data = i', /^Error: Line 1: Missing end: this for is never closed/],
        ['stop\nfor i in 0..5\nend', /^Error: Line 2: Unreachable statement/],
        ['display.data = i\nfor i in 0..5\nend', /^Error: Line 1: Expected a byte literal, a constant or an assigned variable, got i/]
    ]) assert.throws(() => compile(source), error, source);
    for (const line of ['for', 'for i', 'for i 0..5', 'for i in 0...5', 'for i in 0 5', 'for in 0..5', 'for i in 0..', 'for i in ..5', 'for i in 0..5 loop', 'for i, j in 0..5']) {
        assert.throws(() => compile(line + '\nend'), /^Error: Line 1: Expected for name in first\.\.last, such as for i in 0\.\.5/, line);
    }
});

test('break leaves the loop it is in, and next goes round it again', () => {
    const bytes = (source) => [...compile(source).binary];
    const fields = (source) => { const memory = finished(source); return [memory[0xfb], memory[0xfa], memory[0xf9]]; };
    const zero = 'display.high = 0\ndisplay.low = 0\n';
    // A loop that a break leaves, and what follows it runs.
    assert.deepEqual(fields(zero + 'n = 0\nloop\nn = n + 1\nif n == 5\nbreak\nend\nend\ndisplay.data = n'), [0, 0, 5]);
    // next passes over the rest of the round: 3 is not added.
    assert.deepEqual(fields('n = 0\nsum = 0\nloop\nn = n + 1\nif n == 6\nbreak\nend\nif n == 3\nnext\nend\nsum = sum + n\nend\ndisplay.high = sum\ndisplay.low = n\ndisplay.data = 0'), [12, 6, 0]);
    // In a for, next goes on to the next value, and break leaves the name where it was.
    assert.deepEqual(fields(zero + 'sum = 0\nfor i in 0..9\nif i == 2\nnext\nend\nif i == 7\nbreak\nend\nsum = sum + i\nend\ndisplay.high = sum\ndisplay.data = i'), [19, 0, 7]);
    assert.deepEqual(fields(zero + 'for i in 9..0\nif i == 4\nbreak\nend\nend\ndisplay.data = i'), [0, 0, 4]);
    // A next at the last value leaves the for, its name one step past as ever.
    assert.deepEqual(fields(zero + 'sum = 0\nfor i in 0..3\nif i == 3\nnext\nend\nsum = sum + i\nend\ndisplay.high = sum\ndisplay.data = i'), [3, 0, 4]);
    // With one loop inside another they concern the inner one.
    assert.deepEqual(fields('n = 0\nfor i in 0..2\nfor j in 0..9\nif j == 2\nbreak\nend\nn = n + 1\nend\nend\ndisplay.high = n\ndisplay.low = i\ndisplay.data = j'), [6, 3, 2]);
    assert.deepEqual(fields('n = 0\nfor i in 0..2\nloop\nn = n + 1\nif n >= 2\nbreak\nend\nend\nend\ndisplay.high = n\ndisplay.low = i\ndisplay.data = 0'), [4, 3, 0]);
    assert.deepEqual(fields('n = 0\nm = 0\nj = 0\nloop\nm = m + 1\nif m == 4\nbreak\nend\nfor j in 0..9\nif j < 8\nnext\nend\nn = n + 1\nend\nend\ndisplay.high = n\ndisplay.low = m\ndisplay.data = j'), [6, 4, 10]);
    // A break that nothing guards: once round, and no jump back is made.
    assert.deepEqual(fields(zero + 'n = 0\nloop\nn = n + 1\nbreak\nend\ndisplay.data = n'), [0, 0, 1]);
    assert.doesNotMatch(compile('loop\ndisplay.scan()\nbreak\nend').assembly, /JMP flow_1\b/);
    // Each is one jump, three bytes, as the README says.
    const guarded = (word) => bytes(`loop\ndisplay.scan()\nif display.low == 0\n${word}\nend\nif display.low == 1\nbreak\nend\nend`).length;
    assert.equal(guarded('break'), guarded('') + 3);
    assert.equal(guarded('next'), guarded('') + 3);

    // The README's search: where the loop was left says where the code is, and 6 that it is not there.
    const search = (key) => fields('const codes = table byte = 3, 9, 4, 1, 5, 2\n' + zero + `key = ${key}\nfor i in 0..5\n    if codes[i] == key\n        break\n    end\nend\ndisplay.data = i`)[2];
    assert.deepEqual([search(3), search(4), search(2), search(8)], [0, 2, 5, 6]);
    // The README's keys: a digit is shown, another key is passed over, and RUN ends it with the digit showing.
    const m = rawRun('loop\n    key = keypad.press()\n    if key == keypad.run\n        break\n    end\n    if key >= 10\n        next\n    end\n    display.data = key\nend\ndisplay.hold()');
    tick(m, 200000);
    press(m, '7');
    assert.equal(m.cpu.memory[0xf9], 7);
    press(m, 'a');
    assert.equal(m.cpu.memory[0xf9], 7);
    press(m, '2');
    assert.equal(m.cpu.memory[0xf9], 2);
    press(m, 'Enter');
    tick(m, 200000);
    press(m, '5');
    assert.equal(m.cpu.memory[0xf9], 2);
    assert.deepEqual(m.getDisplay().slice(4), [0x3f, 0x5b]);

    // A name can be read after a loop if every way out of it had assigned it.
    assert.ok(compile('loop\nx = 1\nif display.low == 0\nbreak\nend\nend\ndisplay.data = x'));
    assert.ok(compile('for i in 0..3\nx = 1\nif i == 1\nnext\nend\nend\ndisplay.data = x'));
    assert.ok(compile('for i in 0..3\nif i == 1\nx = 2\nbreak\nend\nx = 1\nend\ndisplay.data = x'));
    for (const [source, error] of [
        ['loop\nif display.low == 0\nbreak\nend\nx = 1\nend\ndisplay.data = x', /^Error: Line 7: Expected a byte literal, a constant or an assigned variable, got x/],
        ['for i in 0..3\nif i == 1\nnext\nend\nx = 1\nend\ndisplay.data = x', /^Error: Line 7: Expected a byte literal, a constant or an assigned variable, got x/],
        ['for i in 0..3\nif i == 1\nbreak\nend\nx = 1\nend\ndisplay.data = x', /^Error: Line 7: Expected a byte literal, a constant or an assigned variable, got x/],
        // Two ways out, and only the second has assigned the name.
        ['loop\nif display.low == 0\nbreak\nend\nx = 1\nbreak\nend\ndisplay.data = x', /^Error: Line 8: Expected a byte literal, a constant or an assigned variable, got x/],
        ['break', /^Error: Line 1: break leaves a loop or a for, and there is none round it/],
        ['next', /^Error: Line 1: next goes round a loop or a for again, and there is none round it/],
        ['if display.low == 0\nbreak\nend', /^Error: Line 2: break leaves a loop or a for, and there is none round it/],
        ['loop\ndisplay.scan()\nend\nnext', /^Error: Line 4: next goes round a loop or a for again, and there is none round it/],
        // Wrong wherever it stands, so that is said before that it cannot be reached.
        ['stop\nbreak', /^Error: Line 2: break leaves a loop or a for, and there is none round it/],
        ['loop\nbreak\ndisplay.data = 1\nend', /^Error: Line 3: Unreachable statement/],
        ['loop\nnext\ndisplay.data = 1\nend', /^Error: Line 3: Unreachable statement/],
        ['for i in 0..3\nnext\nbreak\nend', /^Error: Line 3: Unreachable statement/],
        ['loop\nstop\nbreak\nend', /^Error: Line 3: Unreachable statement/],
        // A loop with no break never ends, and one that only a stop ends has nothing after it either.
        ['loop\ndisplay.scan()\nend\ndisplay.data = 1', /^Error: Line 4: Unreachable statement/],
        ['for i in 0..3\nstop\nend\ndisplay.data = 1', /^Error: Line 4: Unreachable statement/],
        ['loop\nbreak 2\nend', /^Error: Line 2: Unknown statement: break 2/],
        ['loop\nnext i\nend', /^Error: Line 2: Unknown statement: next i/]
    ]) assert.throws(() => compile(source), error, source);
});

test('all six comparisons, against a number and against a name, to the edges of a byte', () => {
    const bytes = (source) => [...compile(source).binary];
    const edges = [0, 1, 2, 127, 128, 254, 255];
    const holds = {
        '<': (a, b) => a < b, '<=': (a, b) => a <= b, '>': (a, b) => a > b,
        '>=': (a, b) => a >= b, '==': (a, b) => a === b, '!=': (a, b) => a !== b
    };
    // One program compares each edge value with one other value and notes
    // in a row of bytes which arm it took: 1 where the comparison held, 2
    // where it did not. The other value is a number, a variable in page
    // zero, or a named location above it, which are three ways to compare.
    const forms = {
        number: (b) => ['', String(b)],
        variable: (b) => [`b = ${b}\n`, 'b'],
        location: (b) => [`far = ${b}\n`, 'far']
    };
    let tried = 0;
    for (const [compare, truth] of Object.entries(holds)) {
        for (const [form, written] of Object.entries(forms)) {
            for (const b of edges) {
                const [before, right] = written(b);
                const source = 'const edges = table byte = 0, 1, 2, 127, 128, 254, 255\nbyte took[7] at $80\nbyte far at $0400\n' + before +
                    `for i in 0..6\n    a = edges[i]\n    if a ${compare} ${right}\n        took[i] = 1\n    else\n        took[i] = 2\n    end\nend`;
                // Against the number 255 two of them say nothing, and are refused.
                if (form === 'number' && b === 255 && (compare === '>' || compare === '<=')) {
                    assert.throws(() => compile(source), compare === '>'
                        ? /^Error: Line 6: No byte is greater than 255, so this is never so/
                        : /^Error: Line 6: Every byte is 255 or less, so this is always so/);
                    continue;
                }
                const memory = finished(source);
                assert.deepEqual([...memory.slice(0x80, 0x87)], edges.map((a) => (truth(a, b) ? 1 : 2)), `a ${compare} ${b}, against a ${form}`);
                tried++;
            }
        }
    }
    assert.equal(tried, 6 * 3 * 7 - 2);

    // `>` and `<=` are two flags and two branches, two bytes more than the others.
    const against = (compare, right) => `x = display.low\ny = display.high\nif x ${compare} ${right}\ndisplay.data = 1\nend`;
    assert.match(compile(against('>', 'y')).assembly, /CMP var_y .*\n +BCC flow_1 .*\n +BEQ flow_1 /);
    assert.match(compile(against('<=', 'y')).assembly, /CMP var_y .*\n +BEQ flow_2 .*\n +BCS flow_1 .*\nflow_2:/);
    assert.equal(bytes(against('>', 'y')).length, bytes(against('>=', 'y')).length + 2);
    assert.equal(bytes(against('<=', 'y')).length, bytes(against('<', 'y')).length + 2);
    // Against a number they are the next number's `>=` and `<`, and cost nothing more.
    assert.deepEqual(bytes(against('>', '5')), bytes(against('>=', '6')));
    assert.deepEqual(bytes(against('<=', '5')), bytes(against('<', '6')));
    assert.deepEqual(bytes(against('>', '254')), bytes(against('>=', '255')));
    assert.deepEqual(bytes(against('<=', '0')), bytes(against('<', '1')));
    assert.deepEqual(bytes('const five = 5\n' + against('>', 'five')), bytes(against('>=', '6')));
    assert.deepEqual(bytes(against('<=', 'keypad.none')), bytes(against('<', '22')));
    // The left side may still be anything an expression may.
    const m = finished('const t = table byte = 9, 3\ndisplay.high = 0\ndisplay.low = 0\ndisplay.data = 0\nx = 4\nif t[1] <= x\ndisplay.high = 1\nend\nif x + 250 > 253\ndisplay.low = 1\nend\nif t[0] > x\ndisplay.data = 1\nend');
    assert.deepEqual([m[0xfb], m[0xfa], m[0xf9]], [1, 1, 1]);

    for (const [source, error] of [
        ['const top = 255\nif display.low > top\nend', /^Error: Line 2: No byte is greater than 255/],
        ['if display.low <= $ff\nend', /^Error: Line 1: Every byte is 255 or less/],
        ['if == 1\nend', /^Error: Line 1: A comparison needs a value on its left/],
        ['if <= display.low\nend', /^Error: Line 1: A comparison needs a value on its left/],
        ['if display.low >\nend', /^Error: Line 1: A comparison needs a value on its right/]
    ]) assert.throws(() => compile(source), error, source);
    for (const wrong of ['=<', '=>', '=', '<>', '>>', '<<', '===', '!==', '!']) {
        assert.throws(() => compile(`if display.low ${wrong} 2\nend`), /^Error: Line 1: Expected an unsigned comparison using <, <=, >, >=, == or !=/, wrong);
    }
});

test('comparisons joined by and or by or, tried in order and no further than it takes', () => {
    const bytes = (source) => [...compile(source).binary];
    const fields = (source) => { const memory = finished(source); return [memory[0xfb], memory[0xfa], memory[0xf9]]; };
    // Three comparisons of three kinds, each so or not so as a bit of the
    // count says: equal to a number, greater than a name, and not greater
    // than a name. All eight cases of each joining are run in one program,
    // which notes in a row of bytes which arm it took.
    // Each comparison is tried in each place, since the last of a chain
    // joined by or is compiled as the others are not.
    const kinds = [['p == 1', (i) => (i & 1) === 1], ['q > zero', (i) => (i & 2) > 0], ['r <= zero', (i) => (i & 4) <= 0]];
    for (const word of ['and', 'or']) {
        for (const order of [[0, 1, 2], [2, 1, 0], [1, 2, 0], [0, 1], [1, 0], [2, 0]]) {
            const tests = order.map((which) => kinds[which]);
            const source = `byte took[8] at $80\nzero = 0\nfor i in 0..7\n    p = i & 1\n    q = i & 2\n    r = i & 4\n    if ${tests.map(([written]) => written).join(` ${word} `)}\n        took[i] = 1\n    else\n        took[i] = 2\n    end\nend`;
            const expected = Array.from({ length: 8 }, (_, i) => {
                const each = tests.map(([, truth]) => truth(i));
                return (word === 'and' ? each.every(Boolean) : each.some(Boolean)) ? 1 : 2;
            });
            assert.deepEqual([...finished(source).slice(0x80, 0x88)], expected, tests.map(([written]) => written).join(` ${word} `));
        }
    }
    // Joined by and, a condition is the same bytes as one if inside another.
    assert.deepEqual(bytes('x = display.low\nif x >= 1 and x < 4 and x != display.high\ndisplay.data = x\nend'),
        bytes('x = display.low\nif x >= 1\nif x < 4\nif x != display.high\ndisplay.data = x\nend\nend\nend'));
    // Joined by or, the first comparison that holds goes straight to the statements.
    assert.match(compile('x = display.low\ny = display.high\nif x == 1 or y == 2\ndisplay.data = 1\nend').assembly,
        /CMP #\$01 .*\n +BEQ flow_2 .*\n +LDA var_y .*\n +CMP #\$02 .*\n +BNE flow_1 .*\nflow_2:\n/);
    // With an else, each arm is taken when it should be.
    const arms = (low, high) => fields(`display.low = ${low}\ndisplay.high = ${high}\nif display.low == 1 or display.high == 2\ndisplay.data = $aa\nelse\ndisplay.data = $bb\nend`)[2];
    assert.deepEqual([arms(1, 2), arms(1, 0), arms(0, 2), arms(0, 0)], [0xaa, 0xaa, 0xaa, 0xbb]);

    // No further than it takes: a key wait in a later comparison is not
    // come to when an earlier one has settled the matter. Were it come to,
    // these two would wait for a key for ever.
    assert.equal(fields('display.high = 0\ndisplay.low = 1\ndisplay.data = 0\nif display.low == 1 or keypad.press() == 5\ndisplay.data = 7\nend')[2], 7);
    assert.equal(fields('display.high = 0\ndisplay.low = 1\ndisplay.data = 0\nif display.low == 2 and keypad.press() == 5\ndisplay.data = 7\nend')[2], 0);
    // And it is come to when the earlier ones leave the matter open: with no key down the read gives keypad.none.
    assert.equal(fields('display.high = 0\ndisplay.low = 1\ndisplay.data = 0\nif display.low == 1 and keypad.read() == keypad.none\ndisplay.data = 7\nend')[2], 7);
    assert.equal(fields('display.high = 0\ndisplay.low = 1\ndisplay.data = 0\nif display.low == 2 or keypad.read() == keypad.none\ndisplay.data = 7\nend')[2], 7);

    // After an or, the statements are reached from each comparison with a
    // different left side in A, so nothing is taken to be there: here the
    // first comparison holds, with display.low in A, and the statement
    // reads display.high.
    assert.deepEqual(fields('display.low = 0\ndisplay.high = 7\nif display.low == 0 or display.high == 9\ndisplay.data = display.high\nend'), [7, 0, 7]);
    // Nor is Port A taken to face inwards because a key read in a later
    // comparison would have turned it: that read may not have been come to.
    const turned = compile('if display.low == 0 or keypad.read() == 5\nk = keypad.read()\ndisplay.data = k\nend').assembly;
    assert.equal(turned.split('STA $FD03').length - 1, 2);
    // After an and it is known: the statements are reached one way only.
    const straight = compile('if display.low == 0 and keypad.read() == 5\nk = keypad.read()\ndisplay.data = k\nend').assembly;
    assert.equal(straight.split('STA $FD03').length - 1, 1);

    for (const [source, error] of [
        ['if display.low == 1 and display.high == 2 or display.data == 3\nend', /^Error: Line 1: A condition is joined by and or by or, not by both: there are no brackets to say which comes first/],
        ['if display.low == 1 or display.high == 2 and display.data == 3\nend', /^Error: Line 1: A condition is joined by and or by or, not by both/],
        ['if display.low == 1 and\nend', /^Error: Line 1: and joins two comparisons, and one of them is missing/],
        ['if or display.low == 1\nend', /^Error: Line 1: or joins two comparisons, and one of them is missing/],
        ['if display.low == 1 and and display.high == 2\nend', /^Error: Line 1: and joins two comparisons, and one of them is missing/],
        ['if display.low and display.high\nend', /^Error: Line 1: Expected an unsigned comparison using <, <=, >, >=, == or !=/],
        ['if display.low == 1 and display.high\nend', /^Error: Line 1: Expected an unsigned comparison/],
        ['if display.low == 1 and display.high == a + 1\nend', /^Error: Line 1: The right side of a comparison is a single value/],
        ['if display.low == 1 or y == 2\nend', /^Error: Line 1: Expected a byte literal, a constant or an assigned variable, got y/],
        // The words join comparisons; the bits of a byte have their own operators.
        ['x = display.low and 3', /^Error: Line 1: Expected a byte literal, a constant or an assigned variable, got display.low and 3/]
    ]) assert.throws(() => compile(source), error, source);
    // A name may have the letters of the two words in it.
    assert.ok(compile('band = 1\nore = 2\nif band == 1 and ore == 2\ndisplay.data = band\nend'));
});

test('else if tries another condition, and one end closes the chain', () => {
    const bytes = (source) => [...compile(source).binary];
    const fields = (source) => { const memory = finished(source); return [memory[0xfb], memory[0xfa], memory[0xf9]]; };
    // The README's chain, and the nest it stands for: the same bytes.
    const chain = 'key = display.low\nif key < 10\n    display.data = key\nelse if key == keypad.run\n    display.data = $aa\nelse\n    display.data = $ee\nend';
    const nest = 'key = display.low\nif key < 10\n    display.data = key\nelse\n    if key == keypad.run\n        display.data = $aa\n    else\n        display.data = $ee\n    end\nend';
    assert.deepEqual(bytes(chain), bytes(nest));
    const shown = (key) => fields(chain.replace('display.low', String(key)))[2];
    assert.deepEqual([shown(7), shown(0x13), shown(12)], [7, 0xaa, 0xee]);

    // Four conditions and an else: the first that holds is the one taken,
    // though a later one holds too. Each value's arm is noted in a row.
    const which = finished('byte took[6] at $80\nfor i in 0..5\n    if i == 0\n        took[i] = 10\n    else if i == 1\n        took[i] = 11\n    else if i >= 4\n        took[i] = 14\n    else if i >= 3\n        took[i] = 13\n    else\n        took[i] = 12\n    end\nend');
    assert.deepEqual([...which.slice(0x80, 0x86)], [10, 11, 12, 13, 14, 14]);
    // With no else, a value that no condition takes is left as it was.
    const none = finished('byte took[4] at $80\nfor i in 0..3\n    took[i] = 9\n    if i == 0\n        took[i] = 10\n    else if i == 2\n        took[i] = 12\n    end\nend');
    assert.deepEqual([...none.slice(0x80, 0x84)], [10, 9, 12, 9]);
    // A condition of a chain may be joined, like any other.
    const joined = finished('byte took[6] at $80\nfor i in 0..5\n    if i == 0 or i == 5\n        took[i] = 1\n    else if i >= 2 and i < 4\n        took[i] = 2\n    else\n        took[i] = 3\n    end\nend');
    assert.deepEqual([...joined.slice(0x80, 0x86)], [1, 3, 2, 2, 3, 1]);
    // Inside a loop, an arm may leave it or go round.
    assert.deepEqual(fields('display.low = 0\nsum = 0\nfor i in 0..9\n    if i == 2\n        next\n    else if i == 6\n        break\n    else\n        sum = sum + i\n    end\nend\ndisplay.high = sum\ndisplay.data = i'), [0 + 1 + 3 + 4 + 5, 0, 6]);

    // Where an else if begins is reached from a comparison that failed,
    // with that comparison's left side in A, whatever the arm above left
    // there. Here the arm above ends with x in A, and x is what the next
    // condition asks about.
    assert.deepEqual(fields('byte p at $80\ndisplay.high = 0\ndisplay.low = 0\ndisplay.data = 0\nx = 5\nif display.low == 1\n    p = x\nelse if x == 5\n    display.data = 1\nend'), [0, 0, 1]);
    // And what a condition joined by and leaves is known to its arm: the
    // key read has turned Port A, so the next one does not turn it again.
    const turned = compile('if display.low == 9\n    display.data = 0\nelse if display.low == 0 and keypad.read() == 5\n    k = keypad.read()\n    display.data = k\nend').assembly;
    assert.equal(turned.split('STA $FD03').length - 1, 1);

    // A name is assigned after the chain if every arm assigns it and there
    // is an else; an arm that never reaches the end does not count.
    assert.ok(compile('if display.low == 0\nx = 1\nelse if display.low == 1\nx = 2\nelse\nx = 3\nend\ndisplay.data = x'));
    assert.ok(compile('if display.low == 0\nx = 1\nelse if display.low == 1\nstop\nelse\nx = 3\nend\ndisplay.data = x'));
    for (const [source, error] of [
        // No else: the way past both conditions has not assigned it.
        ['if display.low == 0\nx = 1\nelse if display.low == 1\nx = 2\nend\ndisplay.data = x', /^Error: Line 6: Expected a byte literal, a constant or an assigned variable, got x/],
        ['if display.low == 0\nx = 1\nelse if display.low == 1\ny = 2\nelse\nx = 3\nend\ndisplay.data = x', /^Error: Line 8: Expected a byte literal, a constant or an assigned variable, got x/],
        // What an arm assigns is not assigned for the condition after it.
        ['if display.low == 0\nx = 1\nelse if x == 1\nend', /^Error: Line 3: Expected a byte literal, a constant or an assigned variable, got x/],
        ['if display.low == 0\nstop\nelse if display.low == 1\nstop\nelse\nstop\nend\ndisplay.data = 1', /^Error: Line 8: Unreachable statement/],
        ['else if display.low == 0\nend', /^Error: Line 1: Unexpected else/],
        ['loop\nelse if display.low == 0\nend', /^Error: Line 2: Unexpected else/],
        ['if display.low == 0\nelse\nelse if display.low == 1\nend', /^Error: Line 3: Unexpected else/],
        ['if display.low == 0\nelse\nelse\nend', /^Error: Line 3: Unexpected else/],
        ['if display.low == 0\nelse if\nend', /^Error: Line 2: Expected an unsigned comparison/],
        ['if display.low == 0\nelse if display.low\nend', /^Error: Line 2: Expected an unsigned comparison/],
        ['if display.low == 0\nelse if display.low == 1 and\nend', /^Error: Line 2: and joins two comparisons, and one of them is missing/],
        ['if display.low == 0\nelseif display.low == 1\nend', /^Error: Line 2: Unknown statement: elseif display.low == 1/],
        ['if display.low == 0\nelse display.data = 1\nend', /^Error: Line 2: Unknown statement: else display.data = 1/],
        ['if display.low == 0\nelse if display.low == 1', /^Error: Line 1: Missing end: this if is never closed/]
    ]) assert.throws(() => compile(source), error, source);
});
