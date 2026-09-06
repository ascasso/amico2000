'use strict';

// Regression coverage for issue #30: Escape, Backspace and the on-screen RES
// button only poked the scanned key matrix, so they could not reach a program
// that never reads the keyboard, nor a CPU halted on an illegal opcode. They
// also sat on shared matrix positions, so Escape typed AD and Backspace typed 5.

const test = require('node:test');
const assert = require('node:assert/strict');

const { MONITOR_RESET, bootedMachine } = require('./helpers/machine');

const MONITOR_BASE = 0xFE00;

/** A machine wedged in `JMP $0200`, the loop from the issue's reproduction. */
function machineInTightLoop() {
    const amico = bootedMachine();
    amico.cpu.memory.set([0x4C, 0x00, 0x02], 0x0200);
    amico.cpu.PC = 0x0200;
    amico.cpu.run(1000);
    assert.equal(amico.cpu.PC, 0x0200, 'fixture: the CPU should be stuck in the loop');
    return amico;
}

const inMonitor = (amico) => amico.cpu.PC >= MONITOR_BASE;

for (const [label, press] of [
    ['Escape', (amico) => amico.keyDown('Escape')],
    ['Backspace', (amico) => amico.keyDown('Backspace')],
    ['the on-screen RES button', (amico) => amico.pressKey('res')],
    ['res() directly', (amico) => amico.res()]
]) {
    test(`${label} breaks a program out of a tight loop (#30)`, () => {
        const amico = machineInTightLoop();

        press(amico);

        assert.equal(amico.cpu.PC, MONITOR_RESET, 'RES must vector through $FFFC to the monitor');
        amico.cpu.run(20000);
        assert.equal(amico.cpu.halted, false);
        assert.ok(inMonitor(amico), `monitor should be running, PC = $${amico.cpu.PC.toString(16)}`);
    });

    test(`${label} recovers a CPU halted on an illegal opcode (#30)`, () => {
        const amico = bootedMachine();
        amico.cpu.memory.set([0xFF], 0x0200);
        amico.cpu.PC = 0x0200;
        amico.cpu.step();
        assert.equal(amico.cpu.halted, true, 'fixture: $FF should halt the CPU');

        press(amico);

        assert.equal(amico.cpu.halted, false, 'RES must unhalt the CPU');
        assert.equal(amico.cpu.PC, MONITOR_RESET);
        amico.cpu.run(20000);
        assert.ok(inMonitor(amico));
    });
}

test('the RES aliases are not matrix keys, so they cannot type AD or 5 (#30)', () => {
    const amico = bootedMachine();

    for (const key of ['Escape', 'Backspace']) {
        assert.equal(amico.keyMap[key], undefined, `${key} must not be in keyMap`);
        assert.equal(amico.altKeyMap[key], undefined, `${key} must not be in altKeyMap`);
        assert.equal(amico.isResetKey(key), true, `${key} must be recognised as a reset key`);
    }

    // The positions the aliases used to share: [2, 1] is AD/REG, [0, 5] is hex 5.
    amico.keyDown('Escape');
    assert.equal(amico.keyMatrix[2][1], false, 'Escape must not press AD');
    amico.keyDown('Backspace');
    assert.equal(amico.keyMatrix[0][5], false, 'Backspace must not press 5');

    assert.equal(amico.isResetKey('a'), false);
    assert.equal(amico.isResetKey('ArrowUp'), false);
});

test('RES clears a held key instead of leaving the matrix stuck (#30)', () => {
    const amico = bootedMachine();

    amico.keyDown('a');
    assert.equal(amico.keyMatrix[1][3], true, 'fixture: A should be held down');

    amico.res();
    assert.ok(
        amico.keyMatrix.every((row) => row.every((cell) => cell === false)),
        'no matrix cell may survive a reset'
    );

    // A release arriving after the reset must not throw or resurrect anything.
    amico.keyUp('a');
    amico.keyUp('Escape');
    assert.ok(amico.keyMatrix.every((row) => row.every((cell) => cell === false)));
});

test('RES keeps RAM, so a program survives being stopped (#30)', () => {
    // The Sperimentare clock tutorial: press RES to stop the program at $0300,
    // then re-enter values at $0000-$0002 and adjust $0312. That only works if
    // the program is still in memory afterwards.
    const amico = bootedMachine();
    const program = Uint8Array.from({ length: 0x20 }, (unused, i) => 0xA0 + i);
    amico.loadProgram(program, 0x0300);
    amico.cpu.memory.set([0x11, 0x22, 0x33], 0x0000);

    const before = amico.cpu.memory.slice(0x0000, 0x0800);
    amico.res();
    assert.deepEqual(
        Array.from(amico.cpu.memory.slice(0x0000, 0x0800)),
        Array.from(before),
        'RES must not disturb a single byte of RAM'
    );

    // And it is still there once the monitor has been running for a while.
    amico.cpu.run(200000);
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x0300, 0x0320)), Array.from(program));
});

test('the power-on reset still clears RAM, which is the difference from RES (#30)', () => {
    const amico = bootedMachine();
    amico.loadProgram(new Uint8Array(0x20).fill(0x5A), 0x0300);

    amico.reset();

    assert.equal(amico.cpu.memory[0x0300], 0x00, 'cold start must clear RAM');
    assert.ok(
        amico.cpu.memory.slice(0x0000, 0x03FC).every((byte) => byte === 0x00),
        'all of RAM below the vectors must be cleared'
    );
    // $03FC-$03FF are the monitor's RAM-resident IRQ/NMI vectors, seeded to $FE30.
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x03FC, 0x0400)), [0x30, 0xFE, 0x30, 0xFE]);
    assert.equal(amico.cpu.PC, MONITOR_RESET, 'cold start must also enter the monitor');
});

test('the power-on reset recovers a halted CPU too (#30)', () => {
    // The bench Cold reset control is the documented way back from a program
    // that trashed the RAM-resident vectors, so it must clear a halt as well.
    const amico = bootedMachine();
    amico.cpu.memory.set([0xFF], 0x0200);
    amico.cpu.PC = 0x0200;
    amico.cpu.step();
    assert.equal(amico.cpu.halted, true);

    amico.reset();

    assert.equal(amico.cpu.halted, false);
    assert.equal(amico.cpu.PC, MONITOR_RESET);
});

test('RES leaves the emulator run/pause state alone (#30)', () => {
    // Pausing is a debugging facility with no counterpart on the board, so RES
    // must not silently start or stop the machine: a paused board stays paused
    // and can be single-stepped from $FE22.
    const amico = bootedMachine();

    amico.running = false;
    amico.res();
    assert.equal(amico.running, false, 'RES must not start a paused machine');

    amico.running = true;
    amico.res();
    assert.equal(amico.running, true, 'RES must not stop a running machine');
});

test('RES resets the PIA and blanks the display, and reports both to the UI (#30)', () => {
    const amico = bootedMachine();
    amico.cpu.run(200000);
    amico.pia.portC = 0x3C;

    let displayUpdates = 0;
    let stateUpdates = 0;
    amico.onDisplayUpdate = () => { displayUpdates++; };
    amico.onStateUpdate = () => { stateUpdates++; };

    amico.res();

    // The 8255's RESET pin sits on the same line as the CPU's.
    assert.deepEqual(amico.pia, { portA: 0, portB: 0, portC: 0, control: 0 });
    assert.deepEqual(amico.display, [0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    assert.equal(displayUpdates, 1, 'the UI needs immediate feedback that RES landed');
    assert.equal(stateUpdates, 1);
});

test('the monitor drives the display again after RES (#30)', () => {
    const amico = machineInTightLoop();

    amico.res();
    amico.cpu.run(200000);

    assert.ok(
        amico.display.some((digit) => digit !== 0x00),
        'the monitor should be refreshing the display after a reset'
    );
});
