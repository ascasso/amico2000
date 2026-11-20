'use strict';

// The .amtape header stores the byte count in 16 bits. Saving the whole
// $0000-$FFFF range (65,536 bytes) used to wrap that count to 0, report
// success, and export an image that loadTape() then rejected.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine, MONITOR_RESET } = require('./helpers/machine');

const SAVE_ENTRY = 0xFBBC;

/** Set the IC10 SAVE parameters: $0000/$0001 start, $0002/$0003 end, $0004 id. */
function setSaveParams(amico, start, end, id) {
    amico.cpu.memory.set([start & 0xFF, start >> 8, end & 0xFF, end >> 8, id], 0x0000);
}

test('saving the whole address space fails with the routine error status', () => {
    const amico = bootedMachine();

    // A successful save first, so the test can show a refused one leaves it alone.
    setSaveParams(amico, 0x0200, 0x020F, 0x01);
    amico.saveTapeFromMonitorParams();
    const earlier = amico.exportTape();

    // Go through the trapped IC10 entry, the path a user takes from the keypad.
    setSaveParams(amico, 0x0000, 0xFFFF, 0x02);
    amico.cpu.PC = SAVE_ENTRY;
    amico.cpu.step();

    assert.equal(amico.cpu.PC, MONITOR_RESET, 'the trap must still return to the monitor');
    assert.equal(amico.cpu.memory[0x0000], 0xFF, 'the routine must report failure in $0000');
    assert.equal(amico.cassette.tapes.some((tape) => tape.id === 0x02), false,
        'a refused save must not store a record');
    assert.deepEqual(amico.exportTape(), earlier, 'the last good save must stay the export target');
});

test('the largest range the format can hold still saves and loads back', () => {
    const amico = bootedMachine();
    setSaveParams(amico, 0x0000, 0xFFFE, 0x03);

    const image = amico.saveTapeFromMonitorParams();
    assert.equal(amico.cpu.memory[0x0000], 0x00, 'the routine must report success in $0000');

    const record = bootedMachine().loadTape(image);
    assert.equal(record.data.length, 0xFFFF);
    assert.equal(record.start, 0x0000);
    assert.equal(record.end, 0xFFFE);
});
