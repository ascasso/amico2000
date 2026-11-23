'use strict';

// Issue #20: the cassette routines run for real.
//
// With the traps off and a recorder plugged in, nothing stands in for the
// IC10 PROM any more. SAVE is the real routine putting pulses on a tape, LOAD
// is the real routine reading them back, in the time the board takes, and the
// emulator's part is the wiring between the two. These checks run a machine
// set up as the page sets it up and use it as a user would: parameters in page
// zero, then the routine's entry point.

const test = require('node:test');
const assert = require('node:assert/strict');

const { SAVE_ENTRY, LOAD_ENTRY, realTimeMachine, runRoutine: run } = require('./helpers/cassette-signal');
const { AmicoTapeAudio } = require('../tape-audio');

const { TIMING } = AmicoTapeAudio;
// One program on tape: half a second of blank, then 512 bytes of leader and
// trailer, the start byte, five of header, the text and the checksum.
const secondsOnTape = (bytes) => 0.5 + (512 + 7 + bytes) * (8 * TIMING.bitCell + TIMING.byteGap);

function save(amico, start, end, id) {
    amico.cpu.memory.set([start & 0xFF, start >> 8, end & 0xFF, end >> 8, id], 0x0000);
    return run(amico, SAVE_ENTRY);
}

function load(amico, id, limit) {
    amico.cpu.memory[0x0000] = id;
    amico.cpu.memory[0x0001] = 0x00;
    amico.cpu.memory[0x0002] = 0xFF;   // where the tape says
    return run(amico, LOAD_ENTRY, limit);
}

const pattern = (length, seed) => Uint8Array.from({ length }, (_, i) => (i * seed + 3) & 0xFF);
const bytes = (array) => Array.from(array);

test('the real SAVE routine records a program onto the cassette (#20)', () => {
    const { amico, recorder, recorded } = realTimeMachine();
    const program = pattern(40, 7);
    amico.cpu.memory.set(program, 0x0200);

    const seconds = save(amico, 0x0200, 0x0227, 0x13);

    assert.equal(recorder.state, 'stopped', 'the tape stops when the routine hands back');
    assert.ok(Math.abs(seconds - (secondsOnTape(40) - 0.5)) < 0.1, `it takes the time the board takes, ${seconds.toFixed(1)} s`);
    assert.equal(recorded.length, 1);
    assert.deepEqual(recorded[0].problems, []);
    const saved = amico.findTape();
    assert.equal(saved.id, 0x13);
    assert.equal(saved.start, 0x0200);
    assert.equal(saved.end, 0x0227);
    assert.deepEqual(bytes(saved.data), bytes(program));
    assert.deepEqual(bytes(amico.cpu.memory.slice(0x0000, 0x0005)), [0x00, 0x02, 0x27, 0x02, 0x13],
        'and the routine leaves its parameters as they were');
});

test('the real LOAD routine reads a program off the cassette, passing over the one before it (#20)', () => {
    const { amico, recorder } = realTimeMachine();
    const first = pattern(20, 5);
    const wanted = pattern(60, 11);
    amico.addTapeRecord({ id: 0x07, start: 0x0300, data: first });
    amico.addTapeRecord({ id: 0x13, start: 0x0400, data: wanted });

    const seconds = load(amico, 0x13);

    assert.equal(amico.cpu.PC > 0xFE00, true, 'back in the monitor');
    assert.equal(recorder.state, 'stopped');
    assert.deepEqual(bytes(amico.cpu.memory.slice(0x0400, 0x043C)), bytes(wanted));
    assert.equal(amico.cpu.memory[0x0000], 0x13, 'no error status');
    assert.ok(amico.cpu.memory.slice(0x0300, 0x0314).every((value) => value === 0),
        'the program that was passed over is read but not stored');
    // It has to sit through the whole of the first program and its trailer,
    // then the second up to its checksum.
    const expected = secondsOnTape(20) + secondsOnTape(60) - 256 * (8 * TIMING.bitCell + TIMING.byteGap);
    assert.ok(Math.abs(seconds - expected) < 0.2, `in real time: ${seconds.toFixed(1)} s, expected about ${expected.toFixed(1)}`);
});

test('a SAVE and a LOAD take as long as the guides say they do', () => {
    // Both guides tell their reader how long to wait: about thirteen seconds
    // to SAVE a short program, about seven to LOAD the first one on the tape,
    // and a second more for every 41 bytes. The LOAD is the shorter because
    // the routine leaves for the monitor once the checksum is read, where a
    // SAVE still has the closing leader to write. The page and the guides
    // once gave thirteen seconds for either.
    const fs = require('node:fs');
    const path = require('node:path');
    const said = (file, opening) => {
        const page = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
        const item = page.match(new RegExp(`<li>${opening}[\\s\\S]*?</li>`));
        assert.ok(item, `${file} says how long the cassette takes`);
        return item[0].replace(/\s+/g, ' ');
    };
    const english = said('guide.html', 'It takes time');
    assert.match(english, /A SAVE is about thirteen seconds for a short program, plus a second for every 41 bytes/);
    assert.match(english, /A LOAD of the first program on the tape is quicker, about seven seconds/);
    const italian = said('guida.html', 'Ci vuole tempo');
    assert.match(italian, /SAVE dura circa tredici secondi per un programma breve, più un secondo ogni 41 byte/);
    assert.match(italian, /LOAD del primo programma del nastro è più rapido, circa sette secondi/);

    const timed = (length) => {
        const program = pattern(length, 7);
        const saver = realTimeMachine().amico;
        saver.cpu.memory.set(program, 0x0200);
        const saving = save(saver, 0x0200, 0x0200 + length - 1, 0x13);
        const loader = realTimeMachine().amico;
        loader.addTapeRecord({ id: 0x13, start: 0x0200, data: program });
        const loading = load(loader, 0x13);
        assert.deepEqual(bytes(loader.cpu.memory.slice(0x0200, 0x0200 + length)), bytes(program), 'the LOAD was a whole one');
        return { saving, loading };
    };
    const short = timed(16);
    assert.ok(Math.abs(short.saving - 13) < 0.5, `a short SAVE is about thirteen seconds: ${short.saving.toFixed(2)}`);
    assert.ok(Math.abs(short.loading - 7) < 0.5, `a short LOAD is about seven: ${short.loading.toFixed(2)}`);
    // The difference is the closing leader, 256 bytes, less the half second
    // of blank tape that a LOAD waits through and a SAVE does not.
    const closingLeader = 256 * (8 * TIMING.bitCell + TIMING.byteGap);
    assert.ok(Math.abs(short.saving - short.loading - (closingLeader - 0.5)) < 0.1, 'a LOAD does not wait for the closing leader');

    const longer = timed(16 + 41);
    assert.ok(Math.abs(longer.saving - short.saving - 1) < 0.05, `41 bytes more are a second more of SAVE: ${(longer.saving - short.saving).toFixed(3)}`);
    assert.ok(Math.abs(longer.loading - short.loading - 1) < 0.05, `and of LOAD: ${(longer.loading - short.loading).toFixed(3)}`);
});

test('a program saved for real loads back for real, on another board (#20)', () => {
    const one = realTimeMachine();
    const program = pattern(300, 13);
    one.amico.cpu.memory.set(program, 0x0200);
    save(one.amico, 0x0200, 0x032B, 0x2A);

    const two = realTimeMachine();
    two.amico.addTapeRecord(one.amico.findTape(0x2A));
    load(two.amico, 0x2A);
    assert.deepEqual(bytes(two.amico.cpu.memory.slice(0x0200, 0x032C)), bytes(program));
});

test('run for real, SAVE loses the last byte of a 257-byte block, as the board does (#20)', () => {
    // The trap keeps all 257. The PROM does not, and here the PROM does the
    // saving: what comes back is what the real LOAD would store.
    const { amico, recorded } = realTimeMachine();
    const program = pattern(257, 3);
    amico.cpu.memory.set(program, 0x0200);
    save(amico, 0x0200, 0x0300, 0x05);

    const saved = amico.findTape(0x05);
    assert.equal(saved.data.length, 256);
    assert.equal(saved.end, 0x02FF);
    assert.deepEqual(bytes(saved.data), bytes(program.subarray(0, 256)));
    assert.match(recorded[0].records[0].note, /do not record the last byte/);
});

test('LOAD of a program that is not on the tape waits at its end until RES (#20)', () => {
    const { amico, recorder } = realTimeMachine();
    amico.addTapeRecord({ id: 0x07, start: 0x0300, data: pattern(20, 5) });

    const seconds = load(amico, 0x55, 20);
    assert.ok(seconds >= 20, 'the routine never gives up by itself');
    assert.ok(amico.cpu.PC >= 0xFB00 && amico.cpu.PC <= 0xFCFF, 'it is still in the PROM, listening');
    assert.equal(recorder.state, 'playing');
    assert.ok(recorder.position(amico.cpu.cycles / 1e6) > recorder.length, 'though the tape has run out');
    assert.ok(Math.abs(recorder.length - secondsOnTape(20)) < 0.01);

    amico.res();
    amico.cpu.step();
    assert.equal(recorder.state, 'stopped', 'RES stops the tape');
    amico.cpu.run(100000);
    assert.equal(amico.getDisplay().filter((digit) => digit !== 0).length, 6, 'and the monitor is back');
});

test('RES in the middle of a real SAVE leaves nothing on the cassette (#20)', () => {
    const { amico, recorder, recorded } = realTimeMachine();
    amico.cpu.memory.set(pattern(40, 7), 0x0200);
    amico.cpu.memory.set([0x00, 0x02, 0x27, 0x02, 0x13], 0x0000);
    amico.cpu.PC = SAVE_ENTRY;
    amico.cpu.run(6500000);            // into the header, past the leader
    assert.equal(recorder.state, 'recording');

    amico.res();
    amico.cpu.step();
    assert.equal(recorder.state, 'stopped');
    assert.deepEqual(amico.cassette.tapes, []);
    assert.equal(recorded.length, 1, 'the page is still told that a recording ended');
    assert.deepEqual(recorded[0].records, []);
    assert.equal(recorded[0].problems.length, 1);
    assert.match(recorded[0].problems[0], /the recording breaks off/);
});

test('a SAVE the routine refuses records nothing (#20)', () => {
    // End before start: the real routine goes straight back to the monitor.
    const { amico, recorded } = realTimeMachine();
    const seconds = save(amico, 0x0300, 0x0200, 0x13);
    assert.ok(seconds < 0.001);
    assert.deepEqual(recorded, [{ records: [], problems: [] }]);
    assert.deepEqual(amico.cassette.tapes, []);
});

test('the recorder by itself: a tape is laid out program after program (#20)', () => {
    const recorder = AmicoTapeAudio.createRecorder();
    assert.equal(recorder.state, 'stopped');
    assert.equal(recorder.heard(0, 100), false, 'a stopped recorder gives no signal');

    recorder.play(10, [
        { id: 0x01, start: 0x0200, data: [1, 2, 3] },
        { id: 0x02, start: 0x0300, data: [9] },          // SAVE cannot write one byte
        { id: 0x03, start: 0x0400, data: [4, 5] }
    ]);
    assert.equal(recorder.state, 'playing');
    assert.deepEqual(recorder.skipped.map(({ id }) => id), [0x02]);
    assert.match(recorder.skipped[0].reason, /cannot record a block of 1 byte/);
    assert.ok(Math.abs(recorder.length - (secondsOnTape(3) + secondsOnTape(2))) < 0.01);
    assert.equal(recorder.position(12.5), 2.5);

    // Half a second of blank tape, then a pulse every bit cell of the leader.
    assert.equal(recorder.heard(10, 10.499), false);
    assert.equal(recorder.heard(10.499, 10.5001), true);
    assert.equal(recorder.heard(10.5005, 10.503), false, 'between two pulses there is nothing');
    assert.equal(recorder.heard(10.503, 10.504), true);
    assert.equal(recorder.heard(10 + recorder.length + 1, 10 + recorder.length + 2), false, 'nor after the end');

    assert.equal(recorder.stop(), null, 'stopping a tape that was playing returns nothing');
    assert.equal(recorder.state, 'stopped');

    // An empty cassette is a blank tape.
    recorder.play(0, []);
    assert.equal(recorder.length, 0);
    assert.equal(recorder.heard(0, 60), false);
});
