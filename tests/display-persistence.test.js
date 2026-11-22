'use strict';

// The board has no display latch: a digit is alight only while it is being
// driven, and the six stay visible because the monitor scans them every few
// milliseconds. The emulator used to keep the last pattern each digit was
// given for ever, so a display that is dark on the board, under a program
// that does not scan it or during the cassette routines (#20), stayed frozen
// on the page.

const test = require('node:test');
const assert = require('node:assert/strict');

const { Amico2000, bootedMachine } = require('./helpers/machine');

const ms = (amico, n) => amico.cpu.run(1000 * n);  // 1 MHz
const lit = (amico) => amico.getDisplay().filter((pattern) => pattern !== 0).length;

/** Start the program at $0200 from the keypad, as a user does: AD 0200 RUN. */
function runFromKeypad(amico) {
    ms(amico, 50);
    for (const key of ['ArrowUp', '0', '2', '0', '0', 'Enter']) {
        amico.keyDown(key);
        ms(amico, 80);
        amico.keyUp(key);
        ms(amico, 80);
    }
}

test('an idling monitor keeps all six digits lit', () => {
    const amico = bootedMachine();
    ms(amico, 100);
    assert.equal(lit(amico), 6);
    assert.deepEqual(amico.getDisplay(), amico.display, 'and what is lit is what was driven');
});

test('the displays go dark under a program that does not scan them', () => {
    const amico = bootedMachine();
    amico.cpu.memory.set([0x4C, 0x00, 0x02], 0x0200);   // JMP $0200
    runFromKeypad(amico);
    assert.ok(amico.cpu.PC >= 0x0200 && amico.cpu.PC <= 0x0202, 'the program must be running');

    ms(amico, 2 * Amico2000.DISPLAY_PERSISTENCE_CYCLES / 1000);
    assert.equal(lit(amico), 0, 'nothing has driven a digit for two tenths of a second');
    assert.equal(amico.getDisplayHex(), '00 00 00 00 00 00');
    assert.ok(amico.display.some((pattern) => pattern !== 0), 'the last patterns driven are still on record');

    // RES hands the board back to the monitor, which starts scanning again.
    amico.res();
    assert.equal(lit(amico), 0, 'RES itself blanks the displays');
    ms(amico, 50);
    assert.equal(lit(amico), 6);
});

test('a digit that a program selects and leaves on stays lit', () => {
    const amico = bootedMachine();
    amico.cpu.memory.set([
        0xA9, 0x89, 0x8D, 0x03, 0xFD,   // LDA #$89 / STA $FD03   Port A as an output
        0xA9, 0x06, 0x8D, 0x00, 0xFD,   // LDA #$06 / STA $FD00   segments b and c: a 1
        0xA9, 0x09, 0x8D, 0x01, 0xFD,   // LDA #$09 / STA $FD01   the leftmost digit
        0x4C, 0x0F, 0x02                // JMP $020F
    ], 0x0200);
    runFromKeypad(amico);

    ms(amico, 5 * Amico2000.DISPLAY_PERSISTENCE_CYCLES / 1000);
    assert.deepEqual(amico.getDisplay(), [0x06, 0x00, 0x00, 0x00, 0x00, 0x00],
        'driven without a pause, it never goes dark; the other five do');
});

test('a held key does not blank the displays', () => {
    // While it waits out a key's bounce the monitor stops scanning for about
    // 31 ms, its longest pause. That is well inside the persistence, so the
    // displays must read as lit at every moment of a long press.
    const amico = bootedMachine();
    ms(amico, 50);
    for (const key of ['5', 'ArrowUp', '+', 'r']) {
        amico.keyDown(key);
        for (let t = 0; t < 400; t += 5) {
            ms(amico, 5);
            assert.equal(lit(amico), 6, `all six lit ${t} ms into holding ${key}`);
        }
        amico.keyUp(key);
        ms(amico, 100);
    }
});
