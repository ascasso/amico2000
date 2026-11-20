'use strict';

// Keypad checks that run in Node, without a browser.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine } = require('./helpers/machine');

const PORT_A = 0xFD00;
const PORT_B = 0xFD01;

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
