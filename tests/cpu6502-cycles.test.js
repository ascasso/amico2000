'use strict';

// Instruction timing: base cycles and dynamic penalties (#5, #17).
//
// The core is not cycle-accurate as a whole -- it has no concept of what
// happens *within* an instruction -- but the per-instruction totals are a real
// contract, and #5 was about getting them right. Two properties matter:
//
//   1. every documented opcode charges its documented base cost, exactly once
//   2. the dynamic penalties are applied to the right instructions and only
//      those: page crossings on indexed *reads*, never on stores or read-
//      modify-write, and the taken/page-crossed pair on branches
//
// The Klaus Dormann functional suite cannot help here: it checks results and
// flags and never looks at cycles (docs/6502-conformance.md). This file is the
// only thing standing between the timing contract and a silent regression.

const test = require('node:test');
const assert = require('node:assert/strict');

const { CPU6502 } = require('../cpu6502');

// Documented NMOS 6502 base cycles, keyed by opcode. "Base" means the cost
// before the dynamic penalties tested further down: indexed reads are listed
// at their no-page-cross cost, branches at their not-taken cost of 2.
//
// 151 entries: the documented instruction set, and nothing else. The
// undocumented opcodes are deliberately absent -- this core halts on an
// unknown opcode as a debugging aid rather than executing it.
const BASE_CYCLES = {
    // ADC                                   AND
    0x69: 2, 0x65: 3, 0x75: 4, 0x6D: 4,      0x29: 2, 0x25: 3, 0x35: 4, 0x2D: 4,
    0x7D: 4, 0x79: 4, 0x61: 6, 0x71: 5,      0x3D: 4, 0x39: 4, 0x21: 6, 0x31: 5,
    // ASL                                   BIT
    0x0A: 2, 0x06: 5, 0x16: 6, 0x0E: 6,      0x24: 3, 0x2C: 4,
    0x1E: 7,
    // Branches (not taken)
    0x90: 2, 0xB0: 2, 0xF0: 2, 0x30: 2,
    0xD0: 2, 0x10: 2, 0x50: 2, 0x70: 2,
    // CMP                                   CPX / CPY
    0xC9: 2, 0xC5: 3, 0xD5: 4, 0xCD: 4,      0xE0: 2, 0xE4: 3, 0xEC: 4,
    0xDD: 4, 0xD9: 4, 0xC1: 6, 0xD1: 5,      0xC0: 2, 0xC4: 3, 0xCC: 4,
    // DEC                                   INC
    0xC6: 5, 0xD6: 6, 0xCE: 6, 0xDE: 7,      0xE6: 5, 0xF6: 6, 0xEE: 6, 0xFE: 7,
    // EOR                                   ORA
    0x49: 2, 0x45: 3, 0x55: 4, 0x4D: 4,      0x09: 2, 0x05: 3, 0x15: 4, 0x0D: 4,
    0x5D: 4, 0x59: 4, 0x41: 6, 0x51: 5,      0x1D: 4, 0x19: 4, 0x01: 6, 0x11: 5,
    // LDA                                   LDX / LDY
    0xA9: 2, 0xA5: 3, 0xB5: 4, 0xAD: 4,      0xA2: 2, 0xA6: 3, 0xB6: 4, 0xAE: 4,
    0xBD: 4, 0xB9: 4, 0xA1: 6, 0xB1: 5,      0xBE: 4,
    0xA0: 2, 0xA4: 3, 0xB4: 4, 0xAC: 4,      0xBC: 4,
    // LSR                                   ROL
    0x4A: 2, 0x46: 5, 0x56: 6, 0x4E: 6,      0x2A: 2, 0x26: 5, 0x36: 6, 0x2E: 6,
    0x5E: 7,                                 0x3E: 7,
    // ROR                                   SBC
    0x6A: 2, 0x66: 5, 0x76: 6, 0x6E: 6,      0xE9: 2, 0xE5: 3, 0xF5: 4, 0xED: 4,
    0x7E: 7,                                 0xFD: 4, 0xF9: 4, 0xE1: 6, 0xF1: 5,
    // STA                                   STX / STY
    0x85: 3, 0x95: 4, 0x8D: 4, 0x9D: 5,      0x86: 3, 0x96: 4, 0x8E: 4,
    0x99: 5, 0x81: 6, 0x91: 6,               0x84: 3, 0x94: 4, 0x8C: 4,
    // Stack                                 Transfer
    0x48: 3, 0x08: 3, 0x68: 4, 0x28: 4,      0xAA: 2, 0xA8: 2, 0x8A: 2, 0x98: 2,
                                             0xBA: 2, 0x9A: 2,
    // Increment / decrement registers       Flags
    0xE8: 2, 0xC8: 2, 0xCA: 2, 0x88: 2,      0x18: 2, 0x38: 2, 0x58: 2, 0x78: 2,
                                             0xD8: 2, 0xF8: 2, 0xB8: 2,
    // Jumps and returns                     System
    0x4C: 3, 0x6C: 5, 0x20: 6, 0x60: 6,      0x00: 7, 0xEA: 2,
    0x40: 6,
};

const hex = (value) => '$' + value.toString(16).padStart(2, '0').toUpperCase();

/** Assemble `bytes` at `address`, run one instruction, return cycles consumed. */
function timeOne(cpu, address, bytes) {
    cpu.memory.set(Uint8Array.from(bytes), address);
    cpu.PC = address;
    return cpu.step();
}

test('every documented opcode charges its documented base cost (#5)', () => {
    const cpu = new CPU6502();

    for (const [key, expected] of Object.entries(BASE_CYCLES)) {
        const opcode = Number(key);
        const entry = cpu.instructions[opcode];
        assert.ok(entry, `opcode ${hex(opcode)} is missing from the instruction table`);
        assert.equal(entry.cycles, expected,
            `opcode ${hex(opcode)} should cost ${expected} base cycles`);
    }
});

test('the instruction table holds the documented set and nothing more (#5)', () => {
    const cpu = new CPU6502();
    const implemented = [];

    for (let opcode = 0; opcode <= 0xFF; opcode++) {
        if (cpu.instructions[opcode]) implemented.push(opcode);
    }

    assert.equal(implemented.length, 151, 'the documented NMOS instruction set');
    assert.equal(Object.keys(BASE_CYCLES).length, 151, 'the reference table covers all of them');
    for (const opcode of implemented) {
        assert.ok(opcode in BASE_CYCLES || String(opcode) in BASE_CYCLES,
            `opcode ${hex(opcode)} is implemented but not in the reference table`);
    }
});

test('base cycles are charged once per step, not per addressing-mode call (#5)', () => {
    // The regression #5 guarded against: a core that charges the table cost in
    // step() *and* inside the handler bills everything twice. Measured through
    // step() rather than read off the table, so the two cannot drift apart.
    const cpu = new CPU6502();

    assert.equal(timeOne(cpu, 0x1000, [0xEA]), 2, 'NOP');
    assert.equal(timeOne(cpu, 0x1000, [0xA9, 0x42]), 2, 'LDA #$42');
    assert.equal(timeOne(cpu, 0x1000, [0xAD, 0x00, 0x02]), 4, 'LDA $0200');
    assert.equal(timeOne(cpu, 0x1000, [0x4C, 0x00, 0x20]), 3, 'JMP $2000');
    assert.equal(timeOne(cpu, 0x1000, [0x20, 0x00, 0x20]), 6, 'JSR $2000');
    assert.equal(timeOne(cpu, 0x1000, [0xEE, 0x00, 0x02]), 6, 'INC $0200');
});

test('indexed reads pay one extra cycle only when the page changes (#5)', () => {
    const cpu = new CPU6502();
    cpu.X = 0x01;
    cpu.Y = 0x01;

    // LDA $1200,X -> $1201: same page, no penalty.
    assert.equal(timeOne(cpu, 0x1000, [0xBD, 0x00, 0x12]), 4, 'LDA abs,X within a page');
    // LDA $12FF,X -> $1300: the high byte changed, so the CPU needs a second
    // address cycle.
    assert.equal(timeOne(cpu, 0x1000, [0xBD, 0xFF, 0x12]), 5, 'LDA abs,X across a page');

    assert.equal(timeOne(cpu, 0x1000, [0xB9, 0x00, 0x12]), 4, 'LDA abs,Y within a page');
    assert.equal(timeOne(cpu, 0x1000, [0xB9, 0xFF, 0x12]), 5, 'LDA abs,Y across a page');

    assert.equal(timeOne(cpu, 0x1000, [0xBE, 0x00, 0x12]), 4, 'LDX abs,Y within a page');
    assert.equal(timeOne(cpu, 0x1000, [0xBE, 0xFF, 0x12]), 5, 'LDX abs,Y across a page');

    assert.equal(timeOne(cpu, 0x1000, [0xBC, 0x00, 0x12]), 4, 'LDY abs,X within a page');
    assert.equal(timeOne(cpu, 0x1000, [0xBC, 0xFF, 0x12]), 5, 'LDY abs,X across a page');

    // (zp),Y indexes *after* the indirection, so the penalty depends on the
    // pointer's contents rather than on anything in the instruction.
    cpu.memory[0x10] = 0x00;
    cpu.memory[0x11] = 0x12;                 // -> $1200
    assert.equal(timeOne(cpu, 0x1000, [0xB1, 0x10]), 5, 'LDA (zp),Y within a page');
    cpu.memory[0x10] = 0xFF;                 // -> $12FF
    assert.equal(timeOne(cpu, 0x1000, [0xB1, 0x10]), 6, 'LDA (zp),Y across a page');

    // ($nn,X) indexes the pointer inside zero page, so it has a fixed cost.
    cpu.memory[0x21] = 0xFF;
    cpu.memory[0x22] = 0x12;
    assert.equal(timeOne(cpu, 0x1000, [0xA1, 0x20]), 6, 'LDA (zp,X) is always 6');
});

test('stores and read-modify-write never pay the page penalty (#5)', () => {
    // These always take the extra address cycle, so it is already in the base
    // cost and must not be charged twice. A core that reuses the read-indexed
    // addressing helper for them overcharges on exactly the crossing case.
    const cpu = new CPU6502();
    cpu.X = 0x01;
    cpu.Y = 0x01;

    assert.equal(timeOne(cpu, 0x1000, [0x9D, 0x00, 0x02]), 5, 'STA abs,X within a page');
    assert.equal(timeOne(cpu, 0x1000, [0x9D, 0xFF, 0x02]), 5, 'STA abs,X across a page');

    assert.equal(timeOne(cpu, 0x1000, [0x99, 0x00, 0x02]), 5, 'STA abs,Y within a page');
    assert.equal(timeOne(cpu, 0x1000, [0x99, 0xFF, 0x02]), 5, 'STA abs,Y across a page');

    cpu.memory[0x10] = 0xFF;
    cpu.memory[0x11] = 0x02;                 // -> $02FF, crossing with Y=1
    assert.equal(timeOne(cpu, 0x1000, [0x91, 0x10]), 6, 'STA (zp),Y is always 6');

    assert.equal(timeOne(cpu, 0x1000, [0xFE, 0x00, 0x02]), 7, 'INC abs,X within a page');
    assert.equal(timeOne(cpu, 0x1000, [0xFE, 0xFF, 0x02]), 7, 'INC abs,X across a page');
    assert.equal(timeOne(cpu, 0x1000, [0x1E, 0xFF, 0x02]), 7, 'ASL abs,X across a page');
    assert.equal(timeOne(cpu, 0x1000, [0x5E, 0xFF, 0x02]), 7, 'LSR abs,X across a page');
    assert.equal(timeOne(cpu, 0x1000, [0x3E, 0xFF, 0x02]), 7, 'ROL abs,X across a page');
    assert.equal(timeOne(cpu, 0x1000, [0x7E, 0xFF, 0x02]), 7, 'ROR abs,X across a page');
    assert.equal(timeOne(cpu, 0x1000, [0xDE, 0xFF, 0x02]), 7, 'DEC abs,X across a page');
});

test('a branch costs 2, 3 or 4 cycles by outcome (#5)', () => {
    const cpu = new CPU6502();

    // Not taken: the operand is still fetched, but nothing else happens.
    cpu.flags.Z = 0;
    assert.equal(timeOne(cpu, 0x1200, [0xF0, 0x10]), 2, 'BEQ not taken');

    // Taken within the page: one extra cycle to reload the low byte of PC.
    cpu.flags.Z = 1;
    assert.equal(timeOne(cpu, 0x1200, [0xF0, 0x10]), 3, 'BEQ taken, same page');
    assert.equal(cpu.PC, 0x1212, 'target is relative to the byte after the operand');

    // Taken across a page: a second extra cycle to fix up the high byte.
    // $12F2 + $10 = $1302.
    assert.equal(timeOne(cpu, 0x12F0, [0xF0, 0x10]), 4, 'BEQ taken, page crossed');
    assert.equal(cpu.PC, 0x1302);

    // Backwards across a page: $1303 - $10 = $12F3.
    assert.equal(timeOne(cpu, 0x1301, [0xF0, 0xF0]), 4, 'BEQ taken backwards, page crossed');
    assert.equal(cpu.PC, 0x12F3);

    // The page test is against the address after the operand, not the address
    // of the branch: $12FE + 2 = $1300, so this stays within page $13.
    cpu.flags.Z = 1;
    assert.equal(timeOne(cpu, 0x12FE, [0xF0, 0x10]), 3, 'no penalty when only the operand crossed');
    assert.equal(cpu.PC, 0x1310);

    // Every branch instruction, not just BEQ, on its not-taken path.
    const branches = { 0x90: 'BCC', 0xB0: 'BCS', 0xF0: 'BEQ', 0xD0: 'BNE',
                       0x30: 'BMI', 0x10: 'BPL', 0x50: 'BVC', 0x70: 'BVS' };
    for (const [key, name] of Object.entries(branches)) {
        cpu.flags.C = 0; cpu.flags.Z = 0; cpu.flags.N = 0; cpu.flags.V = 0;
        const taken = [0x90, 0xD0, 0x10, 0x50].includes(Number(key));
        assert.equal(timeOne(cpu, 0x1200, [Number(key), 0x10]), taken ? 3 : 2,
            `${name} with all flags clear`);
    }
});

test('NMOS decimal mode adds no cycles to ADC or SBC (#5)', () => {
    // The AMICO 2000 has an NMOS 6502. The extra decimal-mode cycle is a
    // 65C02 behaviour and must not appear here -- that was the second half of
    // issue #5. Checked across every addressing mode rather than one, since a
    // penalty could be introduced in the shared handler or in one mode.
    const cpu = new CPU6502();
    cpu.X = 0x01;
    cpu.Y = 0x01;
    cpu.memory[0x10] = 0x00;
    cpu.memory[0x11] = 0x02;                 // (zp),Y and (zp,X) -> $0200
    cpu.memory[0x11 + 0x00] = 0x02;

    const forms = [
        [[0x69, 0x11], [0xE9, 0x11], 'immediate'],
        [[0x65, 0x40], [0xE5, 0x40], 'zero page'],
        [[0x75, 0x40], [0xF5, 0x40], 'zero page,X'],
        [[0x6D, 0x00, 0x02], [0xED, 0x00, 0x02], 'absolute'],
        [[0x7D, 0x00, 0x02], [0xFD, 0x00, 0x02], 'absolute,X'],
        [[0x79, 0x00, 0x02], [0xF9, 0x00, 0x02], 'absolute,Y'],
        [[0x61, 0x10], [0xE1, 0x10], '(zp,X)'],
        [[0x71, 0x10], [0xF1, 0x10], '(zp),Y'],
    ];

    for (const [adc, sbc, mode] of forms) {
        for (const [bytes, name] of [[adc, 'ADC'], [sbc, 'SBC']]) {
            cpu.A = 0x11;
            cpu.flags.C = 0;
            cpu.flags.D = 0;
            const binary = timeOne(cpu, 0x1000, bytes);

            cpu.A = 0x11;
            cpu.flags.C = 0;
            cpu.flags.D = 1;
            const decimal = timeOne(cpu, 0x1000, bytes);

            assert.equal(decimal, binary,
                `${name} ${mode} must cost the same with D set as with D clear`);
        }
    }
});

test('an unknown opcode halts without charging cycles (#5)', () => {
    // $FF is undocumented. This core stops rather than guessing, which is a
    // debugging choice and not NMOS behaviour -- real silicon executes the
    // undocumented opcodes. Recorded here so the cost of that choice is
    // visible: a halted core bills nothing and makes no progress.
    const cpu = new CPU6502();
    const before = cpu.cycles;

    // The core warns on the console when it halts, which is helpful in the
    // browser and noise here: this test halts it on purpose.
    const warn = console.warn;
    console.warn = () => {};
    let consumed;
    try {
        consumed = timeOne(cpu, 0x1000, [0xFF]);
    } finally {
        console.warn = warn;
    }

    assert.equal(consumed, 0);
    assert.equal(cpu.cycles, before, 'no cycles charged for an instruction never executed');
    assert.equal(cpu.halted, true);
    assert.equal(cpu.step(), 0, 'and it stays halted');
});
