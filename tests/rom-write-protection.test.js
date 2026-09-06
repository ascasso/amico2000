'use strict';

// Regression coverage for issue #31: guest CPU writes could corrupt the monitor
// PROM, and the damage survived Reset because reset() restores RAM and CPU
// state but has no pristine ROM to fall back on.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    Amico2000,
    MONITOR_ROM,
    MONITOR_RESET,
    bootedMachine,
    runAt
} = require('./helpers/machine');

const MONITOR_BASE = 0xFE00;
const CASSETTE_BASE = 0xFB00;

// LDA #imm / STA abs, the two-instruction store the issue reports.
const storeTo = (addr, value) => [0xA9, value, 0x8D, addr & 0xFF, addr >> 8];

test('a guest store into the monitor PROM is ignored (#31)', () => {
    const amico = bootedMachine();
    assert.equal(amico.cpu.memory[MONITOR_BASE], MONITOR_ROM[0], 'fixture: monitor is intact at boot');

    runAt(amico, 0x0200, storeTo(MONITOR_BASE, 0x00), 2);

    assert.equal(amico.cpu.memory[MONITOR_BASE], MONITOR_ROM[0], 'store must not reach ROM');
    assert.equal(amico.cpu.read(MONITOR_BASE), MONITOR_ROM[0], 'and must not be visible on read back');
});

test('the whole monitor image survives a guest store to every one of its addresses (#31)', () => {
    const amico = bootedMachine();

    for (let addr = MONITOR_BASE; addr <= 0xFFFF; addr++) {
        amico.cpu.write(addr, 0x00);
    }

    for (let i = 0; i < MONITOR_ROM.length; i++) {
        assert.equal(amico.cpu.memory[MONITOR_BASE + i], MONITOR_ROM[i], `byte $${(MONITOR_BASE + i).toString(16)} changed`);
    }
});

test('the reset vector cannot be overwritten, so Reset still reaches the monitor (#31)', () => {
    const amico = bootedMachine();

    // The escalation that made this more than cosmetic: CPU6502.reset() takes
    // its new PC from $FFFC, so corrupting the vector defeated every reset
    // path, the toolbar Reset control included.
    runAt(amico, 0x0200, [...storeTo(0xFFFC, 0x00), 0x8D, 0xFD, 0xFF], 3);

    assert.equal(amico.cpu.read16(0xFFFC), MONITOR_RESET, 'reset vector must be intact');

    amico.reset();
    assert.equal(amico.cpu.PC, MONITOR_RESET, 'reset must enter the monitor');
    assert.equal(amico.cpu.halted, false);
});

test('the optional cassette PROM region ignores guest stores whether or not it is fitted (#31)', () => {
    // An empty IC10 socket latches a store no better than a PROM does, so the
    // region behaves the same way in both configurations.
    const empty = bootedMachine();
    runAt(empty, 0x0200, storeTo(CASSETTE_BASE, 0x42), 2);
    assert.notEqual(empty.cpu.memory[CASSETTE_BASE], 0x42, 'store must not stick with the socket empty');

    const fitted = bootedMachine();
    const image = Uint8Array.from({ length: 512 }, (unused, i) => i & 0xFF);
    fitted.loadCassetteROM(image);
    runAt(fitted, 0x0200, storeTo(CASSETTE_BASE, 0x42), 2);
    assert.equal(fitted.cpu.memory[CASSETTE_BASE], image[0], 'fitted PROM must be unchanged');
    assert.equal(fitted.cpu.memory[0xFCFF], image[511], 'including the last byte of the socket');
});

test('RAM and the PIA still take writes (#31)', () => {
    const amico = bootedMachine();

    for (const addr of [0x0000, 0x00FF, 0x0100, 0x0300, 0x07FF]) {
        amico.cpu.write(addr, 0x5A);
        assert.equal(amico.cpu.memory[addr], 0x5A, `RAM at $${addr.toString(16)} must stay writable`);
    }

    amico.cpu.write(0xFD02, 0x3C);
    assert.equal(amico.pia.portC, 0x3C, 'Port C write must reach the PIA');

    // $FD00-$FDFF partial decoding: $FD42 aliases to Port C as well.
    amico.cpu.write(0xFD42, 0x5B);
    assert.equal(amico.pia.portC, 0x5B, 'PIA partial address decoding must still work');

    amico.cpu.write(0xFD03, 0x80);
    assert.equal(amico.pia.control, 0x80, 'control register write must reach the PIA');
});

test('explicit PROM installation still replaces the image (#31)', () => {
    const amico = bootedMachine();

    const replacement = new Uint8Array(512).fill(0xEA);
    replacement[0x1FC] = 0x00;   // $FFFC
    replacement[0x1FD] = 0xFE;   // -> $FE00
    amico.loadMonitorROM(replacement);

    assert.equal(amico.cpu.memory[MONITOR_BASE], 0xEA, 'loadMonitorROM must bypass the protection');
    amico.reset();
    assert.equal(amico.cpu.PC, 0xFE00, 'the replacement vector must be in effect');

    amico.loadMonitorROM(MONITOR_ROM);
    assert.equal(amico.cpu.memory[MONITOR_BASE], MONITOR_ROM[0], 'and the real monitor must go back in');
});

test('a PROM image larger than its socket is refused instead of wrapping (#31)', () => {
    const amico = bootedMachine();

    // Without the size check loadBinary()'s `& 0xFFFF` masking wrapped the tail
    // of an oversized monitor image into zero page, silently.
    assert.throws(
        () => amico.loadMonitorROM(new Uint8Array(2048)),
        /monitor ROM \(IC9\) image is 2048 bytes/
    );
    assert.equal(amico.cpu.memory[MONITOR_BASE], MONITOR_ROM[0], 'the fitted monitor must be untouched');
    assert.equal(amico.cpu.memory[0x0000], 0x00, 'and nothing may have wrapped into zero page');

    assert.throws(() => amico.loadCassetteROM(new Uint8Array(513)), /cassette ROM \(IC10\) image is 513 bytes/);
});

test('loadProgram refuses a destination that would overwrite a PROM (#31)', () => {
    const amico = bootedMachine();

    assert.throws(
        () => amico.loadProgram(new Uint8Array(4), MONITOR_BASE),
        /would overwrite the monitor ROM \(IC9\)/
    );
    assert.throws(
        () => amico.loadProgram(new Uint8Array(4), CASSETTE_BASE),
        /would overwrite the cassette ROM \(IC10\)/
    );

    // A program that starts below a PROM but runs into it is refused too.
    // $FD00 sits in the gap between the two sockets; 512 bytes from there run
    // to $FEFF, into the monitor, without overrunning the address space.
    assert.throws(() => amico.loadProgram(new Uint8Array(0x0200), 0xFD00), /would overwrite/);
    assert.equal(amico.cpu.memory[MONITOR_BASE], MONITOR_ROM[0]);

    // The ordinary case is unaffected.
    amico.loadProgram(Uint8Array.from([0x01, 0x02, 0x03]), 0x0300);
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x0300, 0x0303)), [0x01, 0x02, 0x03]);
});

test('loadProgram refuses a destination outside the 16-bit address space (#31)', () => {
    const amico = bootedMachine();

    // CPU6502.loadBinary() masks its destination with & 0xFFFF, so each of
    // these lands on $FE00 even though the unmasked address overlaps no
    // region. Before the fix they rewrote the monitor PROM.
    for (const bad of [0x1FE00, -0x200, 768.5, '0x0300', NaN]) {
        assert.throws(
            () => amico.loadProgram(Uint8Array.of(0x55), bad),
            /outside the 6502/,
            `${bad} must be rejected`
        );
    }
    assert.equal(amico.cpu.memory[MONITOR_BASE], MONITOR_ROM[0], 'the monitor must be untouched');

    // A span that starts in range but runs off the top of memory is refused
    // as well: loadBinary() would wrap the tail back into zero page.
    assert.throws(() => amico.loadProgram(new Uint8Array(0x20), 0xFFF8), /runs past the end/);
    assert.equal(amico.cpu.memory[0x0000], 0x00, 'and nothing may have wrapped into zero page');

    // In-range destinations still load, including the very last RAM byte.
    amico.loadProgram(Uint8Array.of(0x7E), 0x07FF);
    assert.equal(amico.cpu.memory[0x07FF], 0x7E);
});

test('a tape LOAD cannot drop its program on top of a PROM (#31)', () => {
    const amico = bootedMachine();
    amico.loadProgram(Uint8Array.from([0xDE, 0xAD, 0xBE, 0xEF]), 0x0300);

    // SAVE: $0000/$0001 = start, $0002/$0003 = end, $0004 = program id.
    amico.cpu.memory.set([0x00, 0x03, 0x03, 0x03, 0x01], 0x0000);
    amico.saveTapeFromMonitorParams();

    // LOAD: $0000 = id, $0001/$0002 = load address, high byte $FF = use the
    // address recorded on tape. The destination comes from guest RAM, so it is
    // guest-controlled input.
    amico.cpu.memory.set([0x01, 0x00, 0xFE], 0x0000);
    assert.equal(amico.loadTapeFromMonitorParams(), false, 'LOAD into ROM must fail');
    assert.equal(amico.cpu.memory[0x0000], 0xFF, 'and report the IC10 error convention');
    assert.equal(amico.cpu.memory[MONITOR_BASE], MONITOR_ROM[0], 'monitor must be intact');

    // A legitimate LOAD into RAM still works.
    amico.cpu.memory.set([0x01, 0x00, 0x05], 0x0000);
    assert.equal(amico.loadTapeFromMonitorParams(), true);
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x0500, 0x0504)), [0xDE, 0xAD, 0xBE, 0xEF]);
});

test('the monitor still boots and runs after a guest tries to corrupt it (#31)', () => {
    const amico = bootedMachine();

    runAt(amico, 0x0200, [...storeTo(MONITOR_BASE, 0x00), ...storeTo(0xFFFC, 0x00)], 4);
    amico.reset();

    assert.equal(amico.cpu.PC, MONITOR_RESET);
    amico.cpu.run(200000);

    assert.equal(amico.cpu.halted, false, 'monitor must not have hit an illegal opcode');
    assert.ok(
        amico.cpu.PC >= MONITOR_BASE,
        `monitor loop should still be executing in ROM, PC = $${amico.cpu.PC.toString(16)}`
    );
});

test('the protected regions are exactly the two PROM sockets (#31)', () => {
    assert.deepEqual(
        Amico2000.ROM_REGIONS.map((r) => [r.start, r.end]),
        [[0xFE00, 0xFFFF], [0xFB00, 0xFCFF]]
    );
});
