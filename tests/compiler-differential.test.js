'use strict';

// The compiler against an interpreter that was written without looking at it.
//
// Each program is compiled and run on the emulated board, and separately run
// by the reference interpreter in tests/helpers/amico-reference.js, which
// knows the language only from compiler/README.md. When the program stops,
// the display bytes and every variable have to be what the interpreter says,
// and nothing else in RAM may have changed.
//
// This is the net under the front end. A change to how the compiler reads a
// line, or to what it takes the accumulator to hold, shows up here as a
// program that computes something else. Run more programs than the default
// before and after such a change:
//
//     AMICO_PROGRAMS=30000 node --test tests/compiler-differential.test.js
//
// It began as one reviewer's harness in the check of 2026-11-23 (AGENTS.md,
// A Review by Several Agents). Planted defects showed what it can and cannot
// see; tests/helpers/amico-programs.js lists both.

const test = require('node:test');
const assert = require('node:assert/strict');
const { compile } = require('../compiler/compile');
const { bootedMachine } = require('./helpers/machine');
const reference = require('./helpers/amico-reference');
const { generate } = require('./helpers/amico-programs');

const PROGRAMS = Number(process.env.AMICO_PROGRAMS) || 1000;
// Where a program goes when it stops or runs off its end: the monitor's
// reset entry. The board is read at that moment, before the monitor runs on
// and puts its own address on the displays.
const MONITOR_ENTRY = 0xfe22;
const DISPLAY = { 'display.data': 0xf9, 'display.low': 0xfa, 'display.high': 0xfb };

// The same junk for the same seed, so a failure can be made again.
function junk(seed) {
    let state = (seed * 2654435761) >>> 0 || 7;
    return () => {
        state ^= state << 13; state >>>= 0;
        state ^= state >>> 17;
        state ^= state << 5; state >>>= 0;
        return state & 255;
    };
}

/**
 * Runs one program both ways. Returns null when the board agrees with the
 * interpreter, `{ tooLong }` when the program does not fit the board, and
 * otherwise `{ wrong }`, a sentence saying what differs.
 */
function compare(source, seed) {
    const fields = {
        'display.data': (seed * 7) & 255,
        'display.low': (seed * 13 + 5) & 255,
        'display.high': (seed * 31 + 9) & 255
    };

    let compiled;
    try {
        compiled = compile(source);
    } catch (error) {
        // The generator does not count bytes, so some programs are too long
        // for 508. Any other refusal is of a program that is valid.
        if (/^Program needs \d+ bytes/.test(error.message)) return { tooLong: true };
        return { wrong: 'the compiler refused it: ' + error.message };
    }

    const machine = bootedMachine();
    const memory = machine.cpu.memory;
    machine.loadProgram(compiled.binary, compiled.origin);
    // A program must not count on what RAM or the registers held: variables
    // start as junk, as do A, X, Y and the flags. Decimal mode is set on
    // every other run, because RUN hands a program the status of the last
    // one halted (docs/monitor-rom-review.md, bug 1).
    const byte = junk(seed);
    for (let address = 0x20; address < 0x80; address++) memory[address] = byte();
    for (const [name, address] of Object.entries(DISPLAY)) memory[address] = fields[name];
    const before = memory.slice(0, 0x0800);
    machine.cpu.A = byte();
    machine.cpu.X = byte();
    machine.cpu.Y = byte();
    machine.cpu.setP(byte() | (seed & 1 ? 0x08 : 0));
    machine.cpu.PC = compiled.origin;

    const started = machine.cpu.cycles;
    while (machine.cpu.PC !== MONITOR_ENTRY) {
        if (machine.cpu.halted || machine.cpu.cycles - started > 20e6) {
            return { wrong: 'on the board it never came back to the monitor' };
        }
        machine.cpu.step();
    }

    const expected = reference.run(source, fields);
    const differences = [];
    for (const [name, address] of Object.entries(DISPLAY)) {
        if (memory[address] !== expected.get(name)) {
            differences.push(`${name} is ${memory[address]} on the board and ${expected.get(name)} by the interpreter`);
        }
    }
    // The listing's first lines say where each variable lives. One that is
    // never read from memory has no place and cannot be compared; one that
    // was assigned only on a path not taken has no value to compare with.
    const places = new Set(Object.values(DISPLAY));
    for (const [, name, hex] of compiled.assembly.matchAll(/^var_([a-z0-9_]+) = \$([0-9A-F]{2})$/gm)) {
        const address = parseInt(hex, 16);
        places.add(address);
        if (expected.has(name) && memory[address] !== expected.get(name)) {
            differences.push(`${name} is ${memory[address]} on the board and ${expected.get(name)} by the interpreter`);
        }
    }
    // display.scan() is the monitor's routine: it keeps a byte at $FC and
    // uses the stack. Nothing else may be written by anything.
    const scans = source.includes('display.scan()');
    for (let address = 0; address < 0x0800; address++) {
        if (places.has(address)) continue;
        if (scans && (address === 0xfc || (address >= 0x0100 && address < 0x0200))) continue;
        if (memory[address] !== before[address]) differences.push(`$${address.toString(16)} was written`);
    }
    return differences.length ? { wrong: differences.join('; ') } : null;
}

function failure(seed, source, wrong) {
    return `seed ${seed}: ${wrong}\n${source}`;
}

test('random programs compute on the board what the reference interpreter computes', () => {
    const seen = { ran: 0, tooLong: 0, longBranch: 0, loops: 0, tables: 0, elseArms: 0, deep: 0 };
    for (let seed = 1; seed <= PROGRAMS; seed++) {
        const { source, made } = generate(seed, { long: seed % 3 === 0 });
        const result = compare(source, seed);
        if (result && result.tooLong) {
            seen.tooLong++;
            continue;
        }
        assert.equal(result, null, result && failure(seed, source, result.wrong));
        seen.ran++;
        if (/\*\+5/.test(compile(source).assembly)) seen.longBranch++;
        if (made.loops) seen.loops++;
        if (made.tableReads) seen.tables++;
        if (made.elseArms) seen.elseArms++;
        if (made.depth >= 4) seen.deep++;
    }

    // A generator can stop making what it was written to make and the test
    // would go on passing. Measured over 20,000 programs, of those that ran 20%
    // had a long branch, 58% a loop, 56% a table read, 67% an else and 44% ifs
    // four deep, and 74% of those generated fitted the board. The floors are
    // about half of each: there to notice a collapse, not a drift.
    const share = (count) => count / seen.ran;
    assert.ok(seen.ran / PROGRAMS > 0.37, `only ${seen.ran} of ${PROGRAMS} programs fitted the board`);
    assert.ok(share(seen.longBranch) > 0.10, `a long branch in only ${seen.longBranch} of ${seen.ran}`);
    assert.ok(share(seen.loops) > 0.29, `a loop in only ${seen.loops} of ${seen.ran}`);
    assert.ok(share(seen.tables) > 0.28, `a table read in only ${seen.tables} of ${seen.ran}`);
    assert.ok(share(seen.elseArms) > 0.33, `an else in only ${seen.elseArms} of ${seen.ran}`);
    assert.ok(share(seen.deep) > 0.22, `ifs four deep in only ${seen.deep} of ${seen.ran}`);
});

test('display.scan() among the statements changes nothing a program can see', () => {
    const programs = Math.max(150, Math.round(PROGRAMS / 10));
    let scans = 0;
    for (let seed = 100001; seed < 100001 + programs; seed++) {
        const { source, made } = generate(seed, { scans: true, long: seed % 3 === 0 });
        const result = compare(source, seed);
        if (result && result.tooLong) continue;
        assert.equal(result, null, result && failure(seed, source, result.wrong));
        scans += made.scans;
    }
    assert.ok(scans > programs / 2, `only ${scans} scans in ${programs} programs`);
});

// The generator's loops cannot show a value wrongly kept in the accumulator
// across the top of a loop: they count in a variable that is in A on the way
// in and on the way back alike. In each of these the last thing assigned
// before the loop is the first thing read inside it, and the way back leaves
// something else in A. A compiler that did not forget A at a loop head fails
// five of the six; that was tried on a copy with the forgetting taken out.
const LOOP_HEADS = {
    'a variable in A on the way in': `
n = 0
x = 5
loop
    y = x
    n = n + 1
    if n == 3
        display.data = y
        display.low = n
        stop
    end
    x = x + 7
    z = 9
    display.high = z
end`,
    'a variable holding a literal': `
n = 0
display.high = 4
t = 4
loop
    u = t
    n = n + u
    if n >= 20
        display.data = n
        stop
    end
    w = 200
end`,
    'a display field in A on the way in': `
n = 0
display.low = 3
loop
    k = display.low
    n = n + k
    if n >= 30
        display.data = n
        stop
    end
    w = 77
    display.high = w
end`,
    'a comparison first in the loop': `
n = 0
c = 4
loop
    if c == 0
        display.data = n
        stop
    end
    n = n + 5
    c = c - 1
    q = 99
    display.high = q
end`,
    'a loop inside a loop': `
total = 0
i = 0
loop
    i = i + 1
    j = i
    loop
        total = total + j
        if total >= 100
            display.data = total
            display.low = i
            stop
        end
        s = 250
        display.high = s
    end
end`,
    'a table index in A on the way in': `
const t = table byte [n in 0..15] = n * 3
sum = 0
i = 2
loop
    v = t[i]
    sum = sum + v
    if sum >= 40
        display.data = sum
        stop
    end
    e = 5
    display.high = e
end`
};

test('nothing is taken to be in the accumulator across the top of a loop', () => {
    for (const [name, source] of Object.entries(LOOP_HEADS)) {
        for (const seed of [1, 2, 3, 4]) {
            const result = compare(source.trim() + '\n', seed);
            assert.equal(result, null, result && `${name}: ${result.wrong}`);
        }
    }
});

// The same care for the left side of a comparison, which may be an operation
// or a table read: it leaves its own value in A, and the name that was there
// before is there no longer. In each of these the arm's first line reads the
// name A held before the `if`. The random programs meet this seldom, a table
// read on the left least of all, so a compiler that kept the old name was
// caught by them only now and then; these catch it every time. Tried on
// copies with the forgetting taken out after an operation and after a table
// read.
const AFTER_A_LEFT_SIDE = {
    'an operation on the left': `
y = 7
x = 3
if x + 250 >= 9
    display.data = x
    display.low = y
else
    display.data = y
end`,
    'a table read by a literal on the left': `
const t = table byte [n in 0..7] = n * 3
y = 7
if t[2] == 6
    display.data = y
else
    display.low = y
end`,
    'a table read by a variable on the left': `
const t = table byte [n in 0..7] = n * 3
k = 2
if t[k] == 6
    display.data = k
else
    display.low = k
end`,
    'a table read by a display field on the left': `
const t = table byte [n in 0..7] = n * 3
display.low = 5
if t[display.low] >= 15
    display.data = display.low
else
    display.high = display.low
end`
};

test('the left side of a comparison leaves its own value in the accumulator', () => {
    for (const [name, source] of Object.entries(AFTER_A_LEFT_SIDE)) {
        for (const seed of [1, 2, 3, 4]) {
            const result = compare(source.trim() + '\n', seed);
            assert.equal(result, null, result && `${name}: ${result.wrong}`);
        }
    }
});
