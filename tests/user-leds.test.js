'use strict';

// The LEDs D4-D7 under a user's own program.
//
// The manual gives the four LEDs to the cassette, but on its schematic
// (supplement, page 28) nothing ties them to it: each is lit while Port B
// bit 7 and one of Port A's lines 0-3 are both high, and any program can set
// those. tests/cassette-interface.test.js checks that circuit line by line.
// These checks run the two programs the guide prints for it, as printed, so
// that what the guide tells a reader stays true: with the cassette traps on,
// which is the page's Cassette: Instant setting, and nothing connected to the
// cassette interface.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { bootedMachine } = require('./helpers/machine');

const guide = fs.readFileSync(path.join(__dirname, '..', 'guide.html'), 'utf8');

/** The guide's listings in its section on the LEDs, each as {address, bytes}. */
function guideListings() {
    const section = guide.match(/<section id="leds">[\s\S]*?<\/section>/);
    assert.ok(section, 'the guide has a section on the LEDs');
    return [...section[0].matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(([, text]) => {
        const lines = text.trim().split('\n').map((line) => line.trim().match(/^([0-9A-F]{4}):((?: [0-9A-F]{2})+)$/));
        assert.ok(lines.every(Boolean), `a listing is lines of "ADDR: BYTES": ${text}`);
        const bytes = lines.flatMap((line) => line[2].trim().split(' ').map((b) => parseInt(b, 16)));
        // The lines of one listing follow on from each other.
        let next = parseInt(lines[0][1], 16);
        for (const line of lines) {
            assert.equal(parseInt(line[1], 16), next, 'each line starts where the last ended');
            next += line[2].trim().split(' ').length;
        }
        return { address: parseInt(lines[0][1], 16), bytes };
    });
}

/** Key a listing into RAM and start it, as RUN from its first address would. */
function start(amico, listing) {
    listing.bytes.forEach((byte, i) => amico.cpu.write(listing.address + i, byte));
    amico.cpu.PC = listing.address;
}

/** Which LEDs were fully on since the last look, as bits 0-3. */
function lit(amico) {
    return amico.takePhaseLEDs().reduce((bits, share, n) => bits | (share > 0.99 ? 1 << n : 0), 0);
}

const dark = (amico) => amico.getDisplay().every((pattern) => pattern === 0);

const [STEADY, COUNTER] = guideListings();

test('the guide has two programs for the LEDs, both at $0200', () => {
    assert.equal(guideListings().length, 2);
    assert.equal(STEADY.address, 0x0200);
    assert.equal(COUNTER.address, 0x0200);
});

test('the guide\'s first program lights all four LEDs with the cassette traps on', () => {
    const amico = bootedMachine();
    assert.equal(amico.cassette.interceptROM, true, 'the traps are on: this is not the real cassette routines');
    assert.equal(amico.tape.recorder, null, 'and no recorder is connected');
    amico.cpu.run(300000);
    assert.equal(lit(amico), 0, 'the monitor leaves them dark');

    start(amico, STEADY);
    amico.cpu.run(1000);
    amico.takePhaseLEDs();
    // Longer than the displays' persistence, so what the monitor last showed is gone.
    amico.cpu.run(300000);
    assert.deepEqual(amico.takePhaseLEDs(), [1, 1, 1, 1], 'D4 to D7 are on the whole time');
    assert.ok(dark(amico), 'and Port B at $87 selects none of the six digits');
    assert.equal(amico.cpu.PC, 0x020F, 'while the program goes round its loop');

    amico.res();
    amico.cpu.run(300000);
    assert.equal(lit(amico), 0, 'RES puts them out');
    assert.ok(!dark(amico), 'and the monitor has its displays back');
});

test('the byte at $0206 chooses which LEDs, as the guide says', () => {
    for (const [pattern, name] of [[0x01, 'D4'], [0x02, 'D5'], [0x04, 'D6'], [0x08, 'D7'], [0x0A, 'D5 and D7']]) {
        const amico = bootedMachine();
        start(amico, STEADY);
        assert.equal(amico.cpu.read(0x0206), 0x0F, 'the pattern is the byte at $0206');
        amico.cpu.write(0x0206, pattern);
        amico.cpu.run(1000);
        amico.takePhaseLEDs();
        amico.cpu.run(50000);
        assert.equal(lit(amico), pattern, `${pattern.toString(16)} lights ${name}`);
    }
});

test('the guide\'s second program counts in binary, about three steps a second', () => {
    const amico = bootedMachine();
    start(amico, COUNTER);

    // Follow it for two seconds of the board's time, a hundredth at a time,
    // noting the cycle at which each new count appears on the LEDs.
    const steps = [];
    let last = -1;
    for (let slice = 0; slice < 200; slice++) {
        amico.cpu.run(10000);
        const shown = amico.phaseLEDs.on;
        if (shown !== last) {
            assert.equal(shown, amico.cpu.read(0x0020) & 0x0F, 'the LEDs show the low four bits of the count at $0020');
            if (last >= 0) assert.equal(shown, (last + 1) & 0x0F, 'one more than before');
            steps.push(amico.cpu.cycles);
            last = shown;
        }
    }
    // One step is 256 x 256 turns of the delay loop, about 0.33 s at 1 MHz.
    const taken = steps.length - 1;
    assert.ok(taken >= 5 && taken <= 7, `about six steps in two seconds, saw ${taken}`);
    assert.ok(dark(amico), 'with the displays dark');
});

test('HLT gives the ports to the monitor, and RUN lets the count carry on', () => {
    const amico = bootedMachine();
    start(amico, COUNTER);
    amico.cpu.run(1000000);
    const count = amico.cpu.read(0x0020);
    assert.ok(count >= 2, 'it has counted');

    amico.hlt();
    amico.cpu.run(300000);
    assert.equal(amico.cpu.read(0x0020), count, 'HLT stops the count');
    amico.takePhaseLEDs();
    amico.cpu.run(100000);
    assert.equal(lit(amico), 0, 'and the LEDs are out: the monitor never sets Port B bit 7');
    assert.ok(!dark(amico), 'while it shows where the program stopped');

    // RUN: the monitor reads the key over several scans, so hold it a while.
    amico.keyDown('Enter');
    amico.cpu.run(100000);
    amico.keyUp('Enter');
    amico.cpu.run(1000000);
    assert.ok(amico.cpu.read(0x0020) > count, 'RUN takes the count up again');
    assert.equal(amico.phaseLEDs.on, amico.cpu.read(0x0020) & 0x0F, 'and the LEDs are showing it');
});
