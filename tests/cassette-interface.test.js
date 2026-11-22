'use strict';

// Issue #20: the cassette interface as the board has it, rather than only the
// traps that stand in for the routines.
//
// The supplement's schematic (page 28) puts three things between the 8255 and
// the recorder. The recorder's input hangs on Port B bits 5 and 6. Its output
// sets a latch that Port A bit 7 reads and Port B bit 0 clears. And each of
// the phase LEDs D4-D7 is on while Port B bit 7 and one of Port A's lines 0-3
// are both high. The first half of this file checks those one at a time, by
// writing to the ports. The second half runs the real IC10 routines and looks
// at what the board then shows, against what the manual says a user sees.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine, CASSETTE_ROM, MONITOR_RESET } = require('./helpers/machine');
const { realSave, realLoad } = require('./helpers/cassette-signal');

const PORT_A = 0xFD00;
const PORT_B = 0xFD01;
const CONTROL = 0xFD03;
const PORT_A_OUT = 0x89;   // the mode words the ROMs use
const PORT_A_IN = 0x99;
const SAVE_ENTRY = 0xFBBC;
const LOAD_ENTRY = 0xFC54;

/** A recorder that does nothing but remember what the board did to it. */
function recorderStub(extra = {}) {
    return {
        state: 'stopped',
        calls: [],
        heard() { return false; },
        level(level, time) { this.calls.push(['level', level, time]); },
        play(time, programs) { this.state = 'playing'; this.calls.push(['play', programs]); },
        record() { this.state = 'recording'; this.calls.push(['record']); },
        stop() { this.state = 'stopped'; this.calls.push(['stop']); return null; },
        ...extra
    };
}

/** Let board time pass without running anything. */
const wait = (amico, cycles) => { amico.cpu.cycles += cycles; };

// =============================================================================
// The circuit, one part at a time
// =============================================================================

test('Port A bit 7 is the tape latch: a pulse sets it and Port B bit 0 low clears it (#20)', () => {
    const amico = bootedMachine();
    let pulseAt = null;   // board time of a pulse, in seconds
    amico.connectRecorder(recorderStub({
        heard: (from, to) => pulseAt !== null && pulseAt > from && pulseAt <= to
    }));
    const latch = () => amico.cpu.read(PORT_A) >> 7;

    amico.cpu.write(PORT_B, 0x07);
    assert.equal(latch(), 0, 'nothing heard yet');

    wait(amico, 1000);
    pulseAt = (amico.cpu.cycles - 500) / 1e6;
    wait(amico, 1000);
    assert.equal(latch(), 1, 'a pulse sets it');
    wait(amico, 50000);
    assert.equal(latch(), 1, 'and it stays set, long after the pulse, until it is cleared');

    // The strobe at $FB00: Port B to 0 and back to 1.
    amico.cpu.write(PORT_B, 0x00);
    amico.cpu.write(PORT_B, 0x01);
    assert.equal(latch(), 0, 'Port B bit 0 low clears it');
    wait(amico, 50000);
    assert.equal(latch(), 0, 'and it stays clear with bit 0 high again');

    // The other seven bits are still the key columns, undisturbed.
    amico.keyDown('5');
    const [, column] = amico.keyMap['5'];
    assert.equal(amico.cpu.read(PORT_A) & 0x7F, 0x7F & ~(1 << column));
});

test('with no recorder the latch reads low and the monitor is none the wiser (#20)', () => {
    const amico = bootedMachine();
    amico.cpu.run(200000);
    amico.cpu.write(PORT_B, 0x01);
    assert.equal(amico.cpu.read(PORT_A), 0x7F);
});

test('the recorder is told the level on Port B bits 5 and 6, and only when it changes (#20)', () => {
    const amico = bootedMachine();
    const recorder = amico.connectRecorder(recorderStub());

    // The monitor never sets either bit, so an idling board sends nothing.
    amico.cpu.run(200000);
    assert.deepEqual(recorder.calls, []);

    // The three values SAVE's pulse routine at $FB5A writes, and its rest
    // value: both lines low, both high, one high.
    for (const value of [0xA1, 0x00, 0xE1, 0xA1, 0xA1, 0x21, 0x41]) amico.cpu.write(PORT_B, value);
    assert.deepEqual(recorder.calls.map(([, level]) => level), [1, 0, 2, 1],
        '$21 and $41 are the same level as $A1: one line high');
    assert.equal(recorder.calls[0][2], amico.cpu.cycles / 1e6, 'the time is board time in seconds');
});

test('a phase LED is on while Port B bit 7 and its own Port A line are both high (#20)', () => {
    const amico = bootedMachine();
    const on = () => amico.takePhaseLEDs();

    amico.cpu.write(CONTROL, PORT_A_OUT);
    amico.cpu.write(PORT_A, 0x05);
    amico.cpu.write(PORT_B, 0x06);
    assert.deepEqual(on(), [0, 0, 0, 0], 'bit 7 low: none, whatever Port A holds');

    // SAVE's two patterns, and LOAD's two.
    for (const [pattern, leds, names] of [
        [0x05, [1, 0, 1, 0], 'D4 leader and D6 recording'],
        [0x06, [0, 1, 1, 0], 'D5 text and D6 recording'],
        [0x89, [1, 0, 0, 1], 'D4 leader and D7 reading'],
        [0x8A, [0, 1, 0, 1], 'D5 text and D7 reading']
    ]) {
        amico.cpu.write(PORT_A, pattern);
        amico.cpu.write(PORT_B, 0x87);
        assert.deepEqual(on(), leds, names);
    }

    // As an input, Port A does not drive its lines. They are key columns,
    // pulled high, so all four LEDs would light if bit 7 were still high;
    // LOAD lowers it six cycles after switching the port.
    amico.cpu.write(CONTROL, PORT_A_IN);
    assert.deepEqual(on(), [1, 1, 1, 1]);
    amico.keyDown('6');                    // row 0, the column on Port A line 0
    amico.cpu.write(PORT_B, 0x81);         // bit 7 high and row 0 selected
    assert.deepEqual(on(), [0, 1, 1, 1], 'a pressed key pulls its own line down');
    amico.cpu.write(PORT_B, 0x07);
    assert.deepEqual(on(), [0, 0, 0, 0]);
});

test('the phase LEDs report how long they were on, not just whether (#20)', () => {
    const amico = bootedMachine();
    amico.cpu.write(CONTROL, PORT_A_OUT);
    amico.cpu.write(PORT_A, 0x09);         // D4 and D7
    amico.cpu.write(PORT_B, 0x07);
    amico.takePhaseLEDs();

    wait(amico, 750);
    amico.cpu.write(PORT_B, 0x87);
    wait(amico, 250);
    amico.cpu.write(PORT_B, 0x07);
    assert.deepEqual(amico.takePhaseLEDs(), [0.25, 0, 0, 0.25], 'on for 250 cycles of 1000');
    wait(amico, 1000);
    assert.deepEqual(amico.takePhaseLEDs(), [0, 0, 0, 0], 'each call starts a fresh account');
});

test('the monitor leaves the phase LEDs dark, and RES puts them out (#20)', () => {
    const amico = bootedMachine();
    amico.takePhaseLEDs();
    amico.cpu.run(300000);
    assert.deepEqual(amico.takePhaseLEDs(), [0, 0, 0, 0]);

    amico.cpu.write(CONTROL, PORT_A_OUT);
    amico.cpu.write(PORT_A, 0x0F);
    amico.cpu.write(PORT_B, 0x80);
    assert.deepEqual(amico.takePhaseLEDs(), [1, 1, 1, 1]);
    const reports = [];
    amico.onPhaseLEDs = (share) => reports.push(share);
    amico.res();
    assert.deepEqual(amico.takePhaseLEDs(), [0, 0, 0, 0], 'the 8255 is reset with the CPU');
    assert.equal(reports.length, 1, 'and the page is told at once');
});

// =============================================================================
// The recorder's motor
// =============================================================================

function machineWithRecorder(recorder) {
    const amico = bootedMachine();
    amico.loadCassetteROM(CASSETTE_ROM);
    amico.connectRecorder(recorder);
    return amico;
}

test('entering the real routines starts the recorder, and the monitor stops it (#20)', () => {
    const recorder = recorderStub();
    const amico = machineWithRecorder(recorder);
    amico.cassette.interceptROM = false;
    amico.addTapeRecord({ id: 0x13, start: 0x0200, data: [1, 2, 3] });

    amico.cpu.PC = LOAD_ENTRY;
    amico.cpu.step();
    assert.deepEqual(recorder.calls, [['play', amico.cassette.tapes]], 'LOAD plays the programs on the cassette');
    assert.notEqual(amico.cpu.PC, MONITOR_RESET, 'and the routine itself runs, untrapped');

    // LOAD jumps back to its own entry when a program is not the one wanted.
    amico.cpu.PC = LOAD_ENTRY;
    amico.cpu.step();
    assert.equal(recorder.calls.length, 1, 'a tape that is already playing is left to run on');

    amico.res();
    amico.cpu.step();
    assert.deepEqual(recorder.calls.at(-1), ['stop'], 'RES stops the tape');

    amico.cpu.memory.set([0x00, 0x02, 0x02, 0x02, 0x13], 0x0000);
    amico.cpu.PC = SAVE_ENTRY;
    amico.cpu.step();
    assert.deepEqual(recorder.calls.at(-1), ['record'], 'SAVE starts a recording');
    amico.cpu.PC = MONITOR_RESET;
    amico.cpu.step();
    assert.deepEqual(recorder.calls.at(-1), ['stop']);
    assert.equal(recorder.state, 'stopped');
});

test('with the traps on the recorder is left alone, except that RES still stops it (#20)', () => {
    const recorder = recorderStub();
    const amico = machineWithRecorder(recorder);
    amico.addTapeRecord({ id: 0x13, start: 0x0200, data: [1, 2, 3] });

    amico.cpu.memory[0x0000] = 0x13;
    amico.cpu.memory[0x0002] = 0xFF;
    amico.cpu.PC = LOAD_ENTRY;
    amico.cpu.step();
    assert.equal(amico.cpu.PC, MONITOR_RESET, 'LOAD is trapped');
    amico.cpu.step();
    assert.deepEqual(recorder.calls, [], 'and the recorder never moved');

    // A tape left running when the traps were switched back on.
    recorder.state = 'playing';
    amico.res();
    amico.cpu.step();
    assert.deepEqual(recorder.calls, [['stop']]);
});

test('what a recording turns out to hold goes onto the cassette as the latest save (#20)', () => {
    const found = {
        records: [
            { id: 0x13, start: 0x0200, data: Uint8Array.from([0xDE, 0xAD]), time: 6.7 },
            { id: 0x14, start: 0xFFFF, data: Uint8Array.from([1, 2]), time: 20 }   // does not fit
        ],
        problems: []
    };
    const recorder = recorderStub({ stop() { this.state = 'stopped'; return found; } });
    const amico = machineWithRecorder(recorder);
    amico.cassette.interceptROM = false;
    const told = [];
    amico.onTapeRecorded = (result) => told.push(result);

    amico.cpu.memory.set([0x00, 0x02, 0x01, 0x02, 0x13], 0x0000);
    amico.cpu.PC = SAVE_ENTRY;
    amico.cpu.step();
    amico.cpu.PC = MONITOR_RESET;
    amico.cpu.step();

    assert.deepEqual(amico.cassette.tapes.map((tape) => tape.id), [0x13]);
    assert.equal(amico.cassette.lastSavedTape, amico.findTape(0x13), 'so an export with no identifier picks it');
    assert.deepEqual(Array.from(amico.findTape().data), [0xDE, 0xAD]);
    assert.deepEqual(told, [found]);
    assert.deepEqual(found.problems, ['Tape record does not fit in the address space'],
        'a record the cassette cannot hold is reported, not dropped in silence');
});

// =============================================================================
// The real routines, and what the board shows while they run
// =============================================================================

/** Sample the LEDs and the displays every tenth of a second of board time. */
function observer() {
    const samples = [];
    let next = 0;
    return {
        samples,
        watch(amico) {
            if (amico.cpu.cycles < next) return;
            next = amico.cpu.cycles + 100000;
            samples.push({
                leds: amico.takePhaseLEDs().map((share) => Math.round(share * 100)),
                digits: amico.getDisplay().filter((pattern) => pattern !== 0).length
            });
        }
    };
}

/** The distinct LED states seen, in order, ignoring the samples that straddle a change. */
function phases(samples, on) {
    const seen = [];
    for (const { leds } of samples) {
        const state = leds.map((percent) => (percent >= on ? 1 : percent === 0 ? 0 : null));
        if (state.includes(null)) continue;
        const name = state.join('');
        if (seen[seen.length - 1] !== name) seen.push(name);
    }
    return seen;
}

test('during the real SAVE the displays are dark and the LEDs show the phases the manual gives (#20)', () => {
    const data = Uint8Array.from({ length: 40 }, (_, i) => (i * 7 + 3) & 0xFF);
    const { samples, watch } = observer();
    const saved = realSave({ id: 0x13, start: 0x0200, data, watch });
    assert.equal(saved.halted, false);

    // The manual, page 47: D6 lights with D4, after about six seconds D5
    // takes over from D4 while the text goes out, then D4 comes back for the
    // trailer. In the order D4 D5 D6 D7, and on for all but the low half of
    // each pulse:
    assert.deepEqual(phases(samples.slice(1), 95), ['1010', '0110', '1010']);
    assert.ok(samples.slice(2).every(({ digits }) => digits === 0),
        'the routine never scans the displays, so they are dark throughout');

    // The text phase is the 47 bytes between the leader and the trailer.
    const text = samples.filter(({ leds }) => leds[1] >= 95).length / 10;
    assert.ok(Math.abs(text - 47 * 0.0241) < 0.25, `about 1.1 seconds of text, saw ${text}`);
});

test('during the real LOAD the LEDs flash, dimmer, in the phases the manual gives (#20)', () => {
    const data = Uint8Array.from({ length: 40 }, (_, i) => (i * 7 + 3) & 0xFF);
    const saved = realSave({ id: 0x13, start: 0x0200, data, trailer: false });
    // Play it from four seconds in: two seconds of leader are plenty.
    const fire = [];
    for (let i = 0; i + 1 < saved.edges.length; i++) {
        if (saved.edges[i][1] === 0 && saved.edges[i][0] > 4000000) {
            fire.push([saved.edges[i][0] - 4000000, saved.edges[i + 1][0] - 4000000]);
        }
    }
    const { samples, watch } = observer();
    const loaded = realLoad(fire, { id: 0x13, watch });
    assert.ok(loaded.done);
    assert.deepEqual(Array.from(loaded.memory.slice(0x0200, 0x0228)), Array.from(data));

    // The manual, page 46: D4 and D7 while the leader is read, then D5 and
    // D7 for the program. LOAD only flashes them, once a bit, between spells
    // of listening with Port A as an input: about a quarter of the time.
    assert.deepEqual(phases(samples.slice(1), 20), ['1001', '0101']);
    const lit = samples.slice(1).flatMap(({ leds }) => leds).filter((percent) => percent >= 20);
    assert.ok(lit.every((percent) => percent >= 22 && percent <= 26), 'each lit LED is on about 24% of the time');
    assert.ok(samples.slice(2).every(({ digits }) => digits === 0), 'and the displays are dark');
});
