'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { Amico2000, MONITOR_ROM, MONITOR_RESET } = require('./helpers/machine');

const ROM_BASE = 0xFE00;

test('monitor $FE22 is the reset entry and reinitialises the stack pointer (#24)', () => {
    const at = (addr) => MONITOR_ROM[addr - ROM_BASE];

    // The $FFFC reset vector points at $FE22, so it is the cold-start entry.
    assert.equal(at(0xFFFC) | (at(0xFFFD) << 8), MONITOR_RESET);

    // $FE28: LDX #$FF / $FE2A: TXS - this is what discards any stale frame.
    assert.equal(at(0xFE28), 0xA2);
    assert.equal(at(0xFE29), 0xFF);
    assert.equal(at(0xFE2A), 0x9A);
});

for (const [label, entry] of [['SAVE', 0xFBBC], ['LOAD', 0xFC54]]) {
    test(`${label} trap entered by JSR leaves no stack residue after the monitor reset (#24)`, () => {
        const amico = new Amico2000();
        amico.loadMonitorROM(MONITOR_ROM);
        const cpu = amico.cpu;

        // JSR <entry> at $0200, the conventional invocation from the monitor.
        cpu.memory[0x0200] = 0x20;
        cpu.memory[0x0201] = entry & 0xFF;
        cpu.memory[0x0202] = entry >> 8;
        cpu.PC = 0x0200;
        cpu.SP = 0xFD;

        cpu.step();
        assert.equal(cpu.PC, entry);
        assert.equal(cpu.SP, 0xFB, 'JSR should push a two-byte return frame');

        cpu.step();
        assert.equal(cpu.PC, MONITOR_RESET, 'trap should redirect to the monitor');
        assert.equal(cpu.SP, 0xFB, 'trap intentionally leaves the frame in place');

        // Run the monitor's reset preamble; TXS at $FE2A restores SP.
        for (let i = 0; i < 16 && cpu.PC !== 0xFE2B; i++) cpu.step();
        assert.equal(cpu.PC, 0xFE2B, 'monitor should reach the instruction after TXS');
        assert.equal(cpu.SP, 0xFF, 'monitor TXS must reinitialise the stack pointer');
    });
}

test('repeated cassette traps do not drift the stack pointer (#24)', () => {
    const amico = new Amico2000();
    amico.loadMonitorROM(MONITOR_ROM);
    const cpu = amico.cpu;

    for (let n = 0; n < 300; n++) {
        cpu.memory[0x0200] = 0x20;
        cpu.memory[0x0201] = 0x54;
        cpu.memory[0x0202] = 0xFC;
        cpu.PC = 0x0200;

        cpu.step();
        cpu.step();
        for (let i = 0; i < 16 && cpu.PC !== 0xFE2B; i++) cpu.step();
        assert.equal(cpu.SP, 0xFF, `stack pointer drifted on iteration ${n}`);
    }
});
