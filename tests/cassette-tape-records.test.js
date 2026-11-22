'use strict';

// Issue #20: the mock cassette could only be filled by a SAVE or by an
// .amtape image. A program decoded from a sound recording is neither, so the
// machine layer takes a record directly, and gives one back for an export in
// another format. The page joins these to the sound codec; the last check
// here does the same without the page.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine, MONITOR_RESET } = require('./helpers/machine');
const { AmicoTapeAudio } = require('../tape-audio');

const SAVE_ENTRY = 0xFBBC;
const LOAD_ENTRY = 0xFC54;

/** Run the trapped LOAD the way the keypad does: parameters, then the entry point. */
function load(amico, id, at = null) {
    amico.cpu.memory[0x0000] = id;
    amico.cpu.memory[0x0001] = at === null ? 0x00 : at & 0xFF;
    amico.cpu.memory[0x0002] = at === null ? 0xFF : at >> 8;
    amico.cpu.PC = LOAD_ENTRY;
    amico.cpu.step();
    assert.equal(amico.cpu.PC, MONITOR_RESET, 'the trap must return to the monitor');
}

test('a record added directly is loaded by the trapped LOAD routine (#20)', () => {
    const amico = bootedMachine();
    const stored = amico.addTapeRecord({ id: 0x13, start: 0x0200, data: [0xA9, 0x42, 0x60] });
    assert.equal(stored.end, 0x0202);

    load(amico, 0x13);
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x0200, 0x0203)), [0xA9, 0x42, 0x60]);

    load(amico, 0x13, 0x0400);
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x0400, 0x0403)), [0xA9, 0x42, 0x60]);
});

test('a record added directly replaces an earlier one with the same identifier (#20)', () => {
    const amico = bootedMachine();
    amico.addTapeRecord({ id: 0x13, start: 0x0200, data: [0x01, 0x02] });
    amico.addTapeRecord({ id: 0x14, start: 0x0300, data: [0x03] });
    amico.addTapeRecord({ id: 0x13, start: 0x0200, data: [0x09] });

    assert.deepEqual(amico.cassette.tapes.map((tape) => tape.id), [0x14, 0x13]);
    assert.deepEqual(Array.from(amico.findTape(0x13).data), [0x09]);
});

test('a record that could not be loaded or exported is refused (#20)', () => {
    const amico = bootedMachine();
    assert.throws(() => amico.addTapeRecord({ id: 0x100, start: 0x0200, data: [1] }), /must be a byte/);
    assert.throws(() => amico.addTapeRecord({ id: 1, start: 0x0200, data: [] }), /1 to 65535 bytes/);
    assert.throws(() => amico.addTapeRecord({ id: 1, start: 0, data: new Uint8Array(0x10000) }), /1 to 65535 bytes/);
    assert.throws(() => amico.addTapeRecord({ id: 1, start: 0xFFFF, data: [1, 2] }), /does not fit in the address space/);
    assert.throws(() => amico.addTapeRecord({ id: 1, start: -1, data: [1] }), /does not fit in the address space/);
    assert.deepEqual(amico.cassette.tapes, []);
});

test('an added record exports as an .amtape image that loads back (#20)', () => {
    const amico = bootedMachine();
    assert.throws(() => amico.findTape(), /No matching tape record/);

    amico.addTapeRecord({ id: 0x13, start: 0x0200, data: [0xDE, 0xAD] });
    amico.addTapeRecord({ id: 0x14, start: 0x0300, data: [0xBE, 0xEF] });
    assert.equal(amico.findTape().id, 0x14, 'with no identifier, the record added last');
    assert.throws(() => amico.findTape(0x15), /No matching tape record/);

    const record = bootedMachine().loadTape(amico.exportTape(0x13));
    assert.equal(record.start, 0x0200);
    assert.equal(record.end, 0x0201);
    assert.deepEqual(Array.from(record.data), [0xDE, 0xAD]);
});

test('a program goes from one machine to another as sound (#20)', () => {
    // SAVE on one machine, through the trap, as a user does from the keypad.
    const program = [0xA9, 0x42, 0x85, 0x20, 0x4C, 0x22, 0xFE];
    const first = bootedMachine();
    first.cpu.memory.set(program, 0x0200);
    first.cpu.memory.set([0x00, 0x02, 0x06, 0x02, 0x01], 0x0000);
    first.cpu.PC = SAVE_ENTRY;
    first.cpu.step();

    // What the page does to save it as sound, and to read a recording.
    const wav = AmicoTapeAudio.encodeWav(first.findTape());
    const { records, problems } = AmicoTapeAudio.decodeWav(wav);
    assert.deepEqual(problems, []);
    assert.equal(records.length, 1);

    const second = bootedMachine();
    records.forEach((record) => second.addTapeRecord(record));
    load(second, 0x01);
    assert.equal(second.cpu.memory[0x0000], 0x01, 'the identifier is still there, and not the $FF of a failed LOAD');
    assert.deepEqual(Array.from(second.cpu.memory.slice(0x0200, 0x0207)), program);
});
