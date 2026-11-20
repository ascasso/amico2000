'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const { MONITOR_ROM } = require('./helpers/machine');
const { CPU6502 } = require('../cpu6502');

test('guide checks the program result after a frame, not during start() (PR #39)', () => {
    const root = path.join(__dirname, '..');
    const guide = fs.readFileSync(path.join(root, 'guide.html'), 'utf8');
    const section = guide.match(/<h3 id="console-program">[\s\S]*?<\/section>/);
    assert.ok(section, 'guide must contain its console program example');
    const commands = [...section[0].matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)]
        .map(match => match[1]);

    let now = 0;
    let nextFrame;
    const reads = [];
    // PR #39: coarse clocks can return the same value twice during start().
    // Drive the next animation frame explicitly, without relying on Node timing.
    const context = vm.createContext({
        CPU6502,
        MONITOR_ROM,
        window: { debugKeyboard: false },
        performance: { now: () => now },
        requestAnimationFrame: callback => { nextFrame = callback; return 1; },
        cancelAnimationFrame: () => { nextFrame = null; }
    });
    vm.runInContext(fs.readFileSync(path.join(root, 'amico2000.js'), 'utf8'), context);
    const amico = vm.runInContext('new Amico2000()', context);
    amico.loadMonitorROM(MONITOR_ROM);
    amico.reset();
    context.amico = amico;
    context.debug = { mem: (address, length) => {
        reads.push(Array.from(amico.getMemoryRange(address, length)));
    } };

    // Run the published command itself, so edits to the example are covered.
    vm.runInContext(commands[0], context);
    assert.equal(amico.readMemory(0x0020), 0, 'initial zero-cycle frame must leave the old byte');
    assert.deepEqual(reads, [], 'the startup block must not report the old byte as the result');
    assert.equal(commands.length, 2, 'memory inspection must be a separate console command');
    assert.equal(typeof nextFrame, 'function');

    now = 16.667;
    nextFrame();
    assert.equal(amico.readMemory(0x0020), 0x42, 'the program must execute on the next frame');
    vm.runInContext(commands[1], context);
    assert.deepEqual(reads, [[0x42]], 'the later command must inspect the program result');
});
