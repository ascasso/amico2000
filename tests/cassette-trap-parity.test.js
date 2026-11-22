'use strict';

// Issue #41: the traps that do LOAD and SAVE at once left other things in page
// zero than the IC10 routines they stand in for. A trapped SAVE cleared the
// start address the user had keyed and a trapped LOAD overwrote the address
// asked for, and SAVE reported failures with a status byte the real routine
// does not have.
//
// The emulator can now run the real routines too, so the two are compared
// directly: the same keys on two boards, one with the traps on and one with
// them off, and then what each board holds. The first half is where they must
// agree. The second half is where they still differ, each case stated and
// pinned so that it cannot change by accident.

const test = require('node:test');
const assert = require('node:assert/strict');

const { MONITOR_RESET } = require('./helpers/machine');
const { SAVE_ENTRY, LOAD_ENTRY, machineWithCassettePROM, realTimeMachine, runRoutine } =
    require('./helpers/cassette-signal');

const PROGRAM = Uint8Array.from({ length: 40 }, (_, i) => (i * 7 + 3) & 0xFF);
const bytes = (array) => Array.from(array);
const hex = (value) => value.toString(16).toUpperCase().padStart(4, '0');

/** A board with the traps on: the page's Cassette: Instant. */
function instantMachine() {
    const amico = machineWithCassettePROM();
    amico.cassette.interceptROM = true;
    const told = [];
    amico.onCassetteTrap = (outcome) => told.push(outcome);
    return { amico, told };
}

/** Two boards given the same start, one of each kind. */
function pair(prepare) {
    const instant = instantMachine();
    const real = realTimeMachine();
    for (const { amico } of [instant, real]) prepare(amico);
    return { instant, real };
}

const parameters = (amico) => bytes(amico.cpu.memory.slice(0x0000, 0x0005));
const tape = (amico, id) => {
    const found = amico.cassette.tapes.find((record) => record.id === id);
    return found ? { id: found.id, start: found.start, end: found.end, data: bytes(found.data) } : null;
};

// =============================================================================
// Where the traps must do as the routines do
// =============================================================================

test('SAVE: trap and real routine leave the same parameters and the same program on tape (#41)', () => {
    const keyed = [0x00, 0x02, 0x27, 0x02, 0x13];   // $0200-$0227 as program 13
    const { instant, real } = pair((amico) => {
        amico.cpu.memory.set(PROGRAM, 0x0200);
        amico.cpu.memory.set(keyed, 0x0000);
    });
    runRoutine(instant.amico, SAVE_ENTRY);
    runRoutine(real.amico, SAVE_ENTRY);

    assert.deepEqual(parameters(real.amico), keyed, 'the real routine writes nothing to $0000-$0004');
    assert.deepEqual(parameters(instant.amico), keyed, 'and nor does the trap');
    assert.deepEqual(tape(instant.amico, 0x13), tape(real.amico, 0x13), 'the same record either way');
    assert.deepEqual(tape(instant.amico, 0x13).data, bytes(PROGRAM));
    assert.equal(instant.told.length, 1);
    assert.equal(instant.told[0].operation, 'save');
    assert.equal(instant.told[0].record, instant.amico.findTape(0x13), 'the page is told what was saved');

    // The point of leaving the parameters: SAVE again, with nothing keyed.
    instant.amico.cpu.memory[0x0200] ^= 0xFF;
    runRoutine(instant.amico, SAVE_ENTRY);
    assert.equal(tape(instant.amico, 0x13).data[0], PROGRAM[0] ^ 0xFF, 'a second SAVE saves the same range again');
});

test('SAVE with the end before the start: both go back to the monitor and do nothing (#41)', () => {
    const keyed = [0x00, 0x03, 0x00, 0x02, 0x13];   // $0300 down to $0200
    const { instant, real } = pair((amico) => amico.cpu.memory.set(keyed, 0x0000));
    const seconds = runRoutine(real.amico, SAVE_ENTRY);
    runRoutine(instant.amico, SAVE_ENTRY);

    assert.ok(seconds < 0.001, 'the real routine returns at once');
    assert.deepEqual(parameters(real.amico), keyed, 'with no status: $0000 still holds what was keyed');
    assert.deepEqual(parameters(instant.amico), keyed, 'and the trap leaves none either');
    assert.deepEqual(real.amico.cassette.tapes, []);
    assert.deepEqual(instant.amico.cassette.tapes, []);
    assert.deepEqual(instant.told, [{ operation: 'save', error: 'the end address is before the start address' }],
        'the trap tells the page instead');
});

for (const [where, keyed, address] of [
    ['where the tape says', [0x13, 0x00, 0xFF], 0x0200],
    ['where the user asks', [0x13, 0x00, 0x05], 0x0500]
]) {
    test(`LOAD ${where}: trap and real routine leave the same parameters and the same memory (#41)`, () => {
        const { instant, real } = pair((amico) => {
            amico.addTapeRecord({ id: 0x13, start: 0x0200, data: PROGRAM });
            amico.cpu.memory.set(keyed, 0x0000);
        });
        runRoutine(instant.amico, LOAD_ENTRY);
        runRoutine(real.amico, LOAD_ENTRY);

        const loaded = (amico) => bytes(amico.cpu.memory.slice(0x0200, 0x0600));
        assert.deepEqual(bytes(real.amico.cpu.memory.slice(0x0000, 0x0003)), keyed,
            'the real routine leaves $0000-$0002 as keyed');
        assert.deepEqual(bytes(instant.amico.cpu.memory.slice(0x0000, 0x0003)), keyed, 'and so does the trap');
        assert.deepEqual(loaded(instant.amico), loaded(real.amico), 'RAM is the same either way');
        assert.deepEqual(bytes(instant.amico.cpu.memory.slice(address, address + 40)), bytes(PROGRAM));
        assert.equal(instant.told.length, 1);
        assert.equal(instant.told[0].operation, 'load');
        assert.equal(instant.told[0].address, address, 'the page is told where it went');
        assert.equal(instant.told[0].record.id, 0x13);
    });
}

// =============================================================================
// Where they still differ, on purpose
// =============================================================================

test('difference kept: a trapped LOAD that cannot be done answers at once with $FF (#41)', () => {
    // The real routine has nothing to say here. Asked for a program that is
    // not on the tape it searches until RES, which tests/tape-recorder.test.js
    // shows. A trap has no tape running and must come back with something, so
    // it uses the one status the real routine does write, for a checksum that
    // does not match.
    const { amico, told } = instantMachine();
    amico.addTapeRecord({ id: 0x13, start: 0x0200, data: PROGRAM });
    amico.cpu.memory.set([0x55, 0x00, 0xFF], 0x0000);
    const seconds = runRoutine(amico, LOAD_ENTRY);

    assert.ok(seconds < 0.001, 'at once');
    assert.ok(amico.cpu.PC >= 0xFE00, 'back in the monitor');
    assert.deepEqual(bytes(amico.cpu.memory.slice(0x0000, 0x0003)), [0xFF, 0x00, 0xFF]);
    assert.deepEqual(told, [{ operation: 'load', error: 'program 55 is not on the cassette' }]);
});

test('difference kept: a trapped LOAD refuses to write over a ROM, where the real one loses the bytes (#31, #41)', () => {
    // Two bytes below the cassette PROM and two inside it.
    const data = [0xA1, 0xA2, 0xA3, 0xA4];
    const { instant, real } = pair((amico) => {
        amico.addTapeRecord({ id: 0x13, start: 0x0200, data });
        amico.cpu.memory.set([0x13, 0xFE, 0xFA], 0x0000);   // load at $FAFE
    });
    const before = bytes(real.amico.cpu.memory.slice(0xFB00, 0xFB02));
    runRoutine(instant.amico, LOAD_ENTRY);
    runRoutine(real.amico, LOAD_ENTRY);

    // The real routine stores every byte. The PROM has no write line, so two
    // of them go nowhere, and it reports nothing.
    assert.deepEqual(bytes(real.amico.cpu.memory.slice(0xFAFE, 0xFB00)), [0xA1, 0xA2]);
    assert.deepEqual(bytes(real.amico.cpu.memory.slice(0xFB00, 0xFB02)), before, 'the PROM is unchanged');
    assert.equal(real.amico.cpu.memory[0x0000], 0x13, 'and there is no error status');

    // The trap stores none of them and says so.
    assert.deepEqual(bytes(instant.amico.cpu.memory.slice(0xFAFE, 0xFB00)), [0xFF, 0xFF], 'nothing below the PROM either');
    assert.equal(instant.amico.cpu.memory[0x0000], 0xFF);
    assert.match(instant.told[0].error, /^program 13 at \$FAFE would overlap the cassette ROM \(IC10\)$/);
});

test('difference kept: a trapped SAVE keeps the last byte of a block the real routine loses (#41)', () => {
    // 257 bytes. Run for real, SAVE stores 256, which tests/tape-recorder.test.js
    // shows; the fault is in the PROM and is described in AGENTS.md under
    // Cassette Sound Format. The trap saves the range it was asked for.
    const { amico } = instantMachine();
    const block = Uint8Array.from({ length: 257 }, (_, i) => (i * 3 + 3) & 0xFF);
    amico.cpu.memory.set(block, 0x0200);
    amico.cpu.memory.set([0x00, 0x02, 0x00, 0x03, 0x05], 0x0000);
    runRoutine(amico, SAVE_ENTRY);
    assert.deepEqual(tape(amico, 0x05).data, bytes(block));
    assert.equal(tape(amico, 0x05).end, 0x0300);
});

test('difference kept: the trap refuses the whole address space, where the real routine saves one page of it (#23, #41)', () => {
    const keyed = [0x00, 0x00, 0xFF, 0xFF, 0x02];   // $0000-$FFFF as program 02
    const { instant, real } = pair((amico) => amico.cpu.memory.set(keyed, 0x0000));
    runRoutine(instant.amico, SAVE_ENTRY);
    runRoutine(real.amico, SAVE_ENTRY);

    // The PROM's second fault, until now only read from the listing: its page
    // counter is tested with BMI, so a count of $81 pages or more reads as
    // finished after the first. 65536 bytes asked for, 256 saved.
    const saved = tape(real.amico, 0x02);
    assert.equal(saved.start, 0x0000);
    assert.equal(saved.data.length, 256, `the real routine saved $0000-$${hex(saved.end)}`);
    assert.deepEqual(parameters(real.amico), keyed);

    // The trap would save all of it if a tape image could hold it. It cannot,
    // so the trap saves nothing, leaves the parameters alone and says why.
    assert.deepEqual(instant.amico.cassette.tapes, []);
    assert.deepEqual(parameters(instant.amico), keyed);
    assert.match(instant.told[0].error, /^65536 bytes is more than a tape image can hold/);
});

test('difference kept: the traps do not use the routines\' workspace in page zero (#41)', () => {
    // The real routines keep their counters and the byte in hand at $E7-$F1.
    // A program has no business relying on what they leave there, and the
    // traps leave those bytes as they found them.
    const { instant, real } = pair((amico) => {
        amico.cpu.memory.set(PROGRAM, 0x0200);
        amico.cpu.memory.set([0x00, 0x02, 0x27, 0x02, 0x13], 0x0000);
        amico.cpu.memory.fill(0xEE, 0x00E0, 0x00F2);
    });
    runRoutine(instant.amico, SAVE_ENTRY);
    runRoutine(real.amico, SAVE_ENTRY);

    const changed = (amico) => {
        const addresses = [];
        for (let address = 0x00E0; address < 0x00F2; address++) {
            if (amico.cpu.memory[address] !== 0xEE) addresses.push(hex(address));
        }
        return addresses;
    };
    assert.deepEqual(changed(instant.amico), []);
    const used = changed(real.amico);
    assert.ok(used.length > 0, 'the real routine does use it');
    assert.ok(used.every((address) => address >= '00E7' && address <= '00F1'),
        `and only $E7-$F1: ${used.join(' ')}`);
    assert.equal(real.amico.cpu.PC >= 0xFE00 || real.amico.cpu.PC === MONITOR_RESET, true);
});
