'use strict';

// The bench Run/Stop label and RUN LED used to follow a copy of the run state
// kept in main.js, which only the bench button updated, so a console start()
// or stop() left them showing the wrong state. The machine now reports every
// change through onRunStateChange; these checks pin that contract.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine } = require('./helpers/machine');

// start() runs one frame synchronously and schedules the next. Node has no
// requestAnimationFrame, and these checks need no second frame.
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};

function watchedMachine() {
    const amico = bootedMachine();
    const calls = [];
    amico.onRunStateChange = (running) => calls.push(running);
    return { amico, calls };
}

test('start() and stop() each report the new run state once', () => {
    const { amico, calls } = watchedMachine();

    amico.start();
    assert.equal(amico.running, true);
    amico.stop();
    assert.equal(amico.running, false);

    assert.deepEqual(calls, [true, false]);
});

test('starting a running machine or stopping a stopped one reports nothing', () => {
    const { amico, calls } = watchedMachine();

    amico.stop();
    amico.start();
    amico.start();
    amico.stop();
    amico.stop();

    assert.deepEqual(calls, [true, false]);
});

test('toggle() reports through the same callback', () => {
    const { amico, calls } = watchedMachine();

    amico.toggle();
    amico.toggle();

    assert.deepEqual(calls, [true, false]);
});

test('RES leaves the run state alone and reports nothing (#30)', () => {
    const { amico, calls } = watchedMachine();

    amico.start();
    amico.res();
    assert.equal(amico.running, true);

    assert.deepEqual(calls, [true]);
});
