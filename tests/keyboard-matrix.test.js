'use strict';

// Keypad checks that run in Node, without a browser.
//
// The key matrix is checked against the monitor ROM itself rather than
// against a restatement of the table: each key is pressed and the ROM's own
// GETKEY routine ($FF57) is run to see which code it decodes. An earlier
// hand-built table put 0 on REG's cell, AD and REG on RUN's, and RUN and HLT on
// DA's; the end-to-end checks below are the keypad workflows that broke.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine } = require('./helpers/machine');

const PORT_A = 0xFD00;
const PORT_B = 0xFD01;
const GETKEY = 0xFF57;
const NO_KEY = 0x15;

// The code the monitor must receive for each keyboard key. $00-$0F are the hex
// digits; the main loop dispatches $10-$14 at $FE5B-$FE6D.
const EXPECTED_CODES = {
    '0': 0x00, '1': 0x01, '2': 0x02, '3': 0x03, '4': 0x04, '5': 0x05, '6': 0x06, '7': 0x07,
    '8': 0x08, '9': 0x09, 'a': 0x0A, 'b': 0x0B, 'c': 0x0C, 'd': 0x0D, 'e': 0x0E, 'f': 0x0F,
    'ArrowUp': 0x10,    // AD: address entry
    'ArrowDown': 0x11,  // DA: data entry
    '+': 0x12, '=': 0x12,  // increment
    'Enter': 0x13, 'g': 0x13,  // RUN
    'r': 0x14           // REG: reload the address from the saved PC
};

/** Run the monitor's GETKEY routine and return the code it decodes. */
function decodedCode(amico) {
    const stub = 0x0300;
    amico.cpu.memory.set([0x20, GETKEY & 0xFF, GETKEY >> 8], stub);  // JSR GETKEY
    amico.cpu.PC = stub;
    amico.cpu.SP = 0xFF;
    for (let i = 0; i < 1000 && amico.cpu.PC !== stub + 3; i++) {
        amico.cpu.step();
    }
    assert.equal(amico.cpu.PC, stub + 3, 'GETKEY must return');
    return amico.cpu.A;
}

/** Type keys on a running monitor, holding each for 80ms and pausing 80ms. */
function type(amico, keys) {
    const ms = (n) => amico.cpu.run(1000 * n);  // ~1MHz
    ms(50);
    for (const key of keys) {
        amico.keyDown(key);
        ms(80);
        amico.keyUp(key);
        ms(80);
    }
}

/** Split "AD 0200 DA A9" into keyboard keys. */
function keys(sequence) {
    const named = { AD: 'ArrowUp', DA: 'ArrowDown', '+': '+', RUN: 'Enter', REG: 'r' };
    return sequence.split(' ').flatMap((word) =>
        named[word] ? [named[word]] : word.toLowerCase().split(''));
}

test('a pressed key can be scanned outside a browser', () => {
    // _scanKeyboard() used to read `window.debugKeyboard` directly, so any
    // scan that found a pressed key threw a ReferenceError in Node.
    assert.equal(typeof window, 'undefined', 'this check needs a window-less runtime');

    const amico = bootedMachine();
    amico.keyDown('5');
    amico.cpu.write(PORT_B, 0x01);  // select row 0, as the monitor does

    // Active-low: the pressed key clears its column bit, every other bit reads high.
    const [row, col] = amico.keyMap['5'];
    assert.equal(row, 0);
    assert.equal(amico.cpu.read(PORT_A), 0xFF & ~(1 << col));
});

test('every key decodes in the monitor to the code its function needs', () => {
    assert.deepEqual(Object.keys(bootedMachine().keyMap).sort(),
        Object.keys(EXPECTED_CODES).sort(), 'keyMap and the expected codes must list the same keys');

    for (const [key, expected] of Object.entries(EXPECTED_CODES)) {
        const amico = bootedMachine();
        amico.keyDown(key);
        assert.equal(decodedCode(amico), expected,
            `${key} must decode to $${expected.toString(16).toUpperCase()}`);
    }
});

test('with no key pressed GETKEY reports no key', () => {
    assert.equal(decodedCode(bootedMachine()), NO_KEY);
});

test('the guide keypad example enters a program and RUN executes it', () => {
    const amico = bootedMachine();
    const program = [0xA9, 0x42, 0x85, 0x20, 0x4C, 0x22, 0xFE];  // LDA #$42 / STA $20 / JMP $FE22

    type(amico, keys('AD 0200 DA A9 + 42 + 85 + 20 + 4C + 22 + FE'));
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x0200, 0x0207)), program);
    assert.equal(amico.cpu.memory[0x0020], 0x00, 'nothing has run yet');

    type(amico, keys('AD 0200 RUN'));
    assert.equal(amico.cpu.memory[0x0020], 0x42, 'RUN must execute the program');
});

test('AD after DA returns to address entry instead of running anything', () => {
    const amico = bootedMachine();
    type(amico, keys('AD 0200 DA EA AD 0300'));

    assert.equal(amico.cpu.memory[0x0200], 0xEA);
    assert.equal(amico.cpu.memory[0xFF], 1, 'the monitor must be in address mode');
    assert.equal(amico.cpu.memory[0xFA] | (amico.cpu.memory[0xFB] << 8), 0x0300);
});

test('REG then RUN restarts the program whose address is at $00F6/$00F7', () => {
    // The manual's sequence: store the start address where REG finds it, then
    // REG recalls it into the address display and RUN executes from there.
    const amico = bootedMachine();
    amico.cpu.memory.set([0xA9, 0x42, 0x85, 0x20, 0x4C, 0x22, 0xFE], 0x0200);

    type(amico, keys('AD 00F6 DA 00 + 02 AD 0000 REG'));
    assert.equal(amico.cpu.memory[0xFA] | (amico.cpu.memory[0xFB] << 8), 0x0200,
        'REG must reload the address from the saved PC');

    type(amico, keys('RUN'));
    assert.equal(amico.cpu.memory[0x0020], 0x42);
});

test('the HLT button does not touch the key matrix', () => {
    const amico = bootedMachine();
    amico.pressKey('pc');
    assert.ok(amico.keyMatrix.every((row) => row.every((cell) => !cell)));
});
