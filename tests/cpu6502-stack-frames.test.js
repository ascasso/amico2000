'use strict';

// Physical stack-frame layout for JSR/RTS, BRK/RTI, IRQ and NMI (#3, #17).
//
// These pin the *memory layout* of a frame, not just the round trip. A core
// that pushes the two bytes in the wrong order still returns to the right
// place, because its own pull is wrong in the same way; the defect only shows
// when a program reads the frame itself, which the AMICO monitor does when it
// displays the interrupted PC. So every check below asserts the individual
// bytes in page one, not merely that RTS came home.

const test = require('node:test');
const assert = require('node:assert/strict');

const { CPU6502 } = require('../cpu6502');

// Deliberately non-symmetric so a swapped high/low byte cannot pass: the two
// halves of every address used here differ, and so do the vectors.
const IRQ_VECTOR = 0xFFFE;
const NMI_VECTOR = 0xFFFA;

/** A CPU with known vectors, entered at `pc`, with no machine layer attached. */
function cpuAt(pc, bytes) {
    const cpu = new CPU6502();
    cpu.memory.set(Uint8Array.from(bytes), pc);
    cpu.PC = pc;
    // $FFFE/$FFFA hold recognisable, non-symmetric targets.
    cpu.memory[IRQ_VECTOR] = 0x5A;
    cpu.memory[IRQ_VECTOR + 1] = 0xE3;      // IRQ/BRK -> $E35A
    cpu.memory[NMI_VECTOR] = 0x9C;
    cpu.memory[NMI_VECTOR + 1] = 0xC7;      // NMI     -> $C79C
    return cpu;
}

test('JSR pushes the return address high byte first, at the higher stack address (#3)', () => {
    // JSR $ABCD at $1234. Both the caller address and the target have distinct
    // halves, so a byte-swapped push lands somewhere obviously wrong.
    const cpu = cpuAt(0x1234, [0x20, 0xCD, 0xAB]);
    cpu.SP = 0xFD;

    cpu.step();

    assert.equal(cpu.PC, 0xABCD, 'JSR should transfer control to its operand');
    // The 6502 pushes PC-1: the address of the JSR's *last* byte, $1236.
    assert.equal(cpu.memory[0x01FD], 0x12, 'high byte belongs at the higher stack address');
    assert.equal(cpu.memory[0x01FC], 0x36, 'low byte belongs one below it');
    assert.equal(cpu.SP, 0xFB, 'two bytes consumed');
});

test('RTS resumes at the byte after the JSR operand (#3)', () => {
    const cpu = cpuAt(0x1234, [0x20, 0xCD, 0xAB]);
    cpu.SP = 0xFD;
    cpu.memory[0xABCD] = 0x60;              // RTS

    cpu.step();                             // JSR
    cpu.step();                             // RTS

    // PC-1 was pushed, so RTS adds one: $1236 + 1 = $1237, the instruction
    // following the three-byte JSR.
    assert.equal(cpu.PC, 0x1237);
    assert.equal(cpu.SP, 0xFD, 'the frame is fully unwound');
});

test('nested JSR frames unwind in order (#3)', () => {
    const cpu = cpuAt(0x1234, [0x20, 0xCD, 0xAB]);
    cpu.SP = 0xFD;
    cpu.memory.set(Uint8Array.from([0x20, 0x21, 0x43]), 0xABCD);  // JSR $4321
    cpu.memory[0x4321] = 0x60;              // RTS
    cpu.memory[0xABD0] = 0x60;              // RTS

    cpu.step();                             // JSR $ABCD
    cpu.step();                             // JSR $4321
    assert.equal(cpu.SP, 0xF9, 'two frames on the stack');
    assert.equal(cpu.memory[0x01FB], 0xAB, 'inner frame high byte');
    assert.equal(cpu.memory[0x01FA], 0xCF, 'inner frame low byte');

    cpu.step();                             // RTS -> $ABD0
    assert.equal(cpu.PC, 0xABD0);
    cpu.step();                             // RTS -> $1237
    assert.equal(cpu.PC, 0x1237);
    assert.equal(cpu.SP, 0xFD);
});

test('BRK pushes the address past its padding byte, with B set (#3)', () => {
    const cpu = cpuAt(0x2000, [0x00]);      // BRK
    cpu.SP = 0xFD;
    cpu.flags.I = 0;
    cpu.flags.C = 1;                        // a flag to carry through the frame

    cpu.step();

    assert.equal(cpu.PC, 0xE35A, 'BRK vectors through $FFFE');
    // BRK is a one-byte opcode with a padding byte, so the pushed address is
    // BRK + 2, skipping the padding rather than landing on it.
    assert.equal(cpu.memory[0x01FD], 0x20, 'high byte of $2002');
    assert.equal(cpu.memory[0x01FC], 0x02, 'low byte of $2002');
    const pushedStatus = cpu.memory[0x01FB];
    assert.equal(pushedStatus & 0x10, 0x10, 'B is set in a BRK frame');
    assert.equal(pushedStatus & 0x20, 0x20, 'the unused bit is always set');
    assert.equal(pushedStatus & 0x01, 0x01, 'C was carried into the frame');
    assert.equal(cpu.flags.I, 1, 'BRK masks further IRQs');
    assert.equal(cpu.SP, 0xFA);
});

test('RTI restores the status register and returns without incrementing (#3)', () => {
    const cpu = cpuAt(0x2000, [0x00]);      // BRK
    cpu.SP = 0xFD;
    cpu.flags.I = 0;
    cpu.flags.C = 1;
    cpu.memory[0xE35A] = 0x40;              // RTI at the handler

    cpu.step();                             // BRK
    cpu.flags.C = 0;                        // handler clobbers the flags
    cpu.step();                             // RTI

    // Unlike RTS, RTI returns to exactly the pushed address.
    assert.equal(cpu.PC, 0x2002);
    assert.equal(cpu.flags.C, 1, 'the pushed status is restored');
    assert.equal(cpu.flags.I, 0, 'including the interrupt mask as it was');
    assert.equal(cpu.SP, 0xFD, 'the frame is fully unwound');
});

test('IRQ pushes the interrupted PC with B clear (#3)', () => {
    const cpu = cpuAt(0x30EF, [0xEA]);      // NOP that never runs
    cpu.SP = 0xFD;
    cpu.flags.I = 0;
    cpu.irq();

    const cycles = cpu.step();

    assert.equal(cpu.PC, 0xE35A, 'IRQ vectors through $FFFE');
    // An IRQ is taken before the fetch, so the pushed PC is the instruction
    // that has not run yet, stored high byte first like every other frame.
    assert.equal(cpu.memory[0x01FD], 0x30, 'high byte of $30EF');
    assert.equal(cpu.memory[0x01FC], 0xEF, 'low byte of $30EF');
    assert.equal(cpu.memory[0x01FB] & 0x10, 0, 'B is clear: this was not a BRK');
    assert.equal(cpu.flags.I, 1, 'the handler runs with IRQs masked');
    assert.equal(cycles, 7, 'an interrupt sequence costs 7 cycles');
});

test('IRQ is held off while I is set (#3)', () => {
    const cpu = cpuAt(0x30EF, [0xEA]);      // NOP
    cpu.SP = 0xFD;
    cpu.flags.I = 1;
    cpu.irq();

    cpu.step();

    assert.equal(cpu.PC, 0x30F0, 'the NOP ran instead');
    assert.equal(cpu.SP, 0xFD, 'nothing was pushed');
    assert.equal(cpu.irqPending, true, 'the line stays asserted until the source clears it');
});

test('NMI is taken through $FFFA even with I set (#3)', () => {
    const cpu = cpuAt(0x30EF, [0xEA]);      // NOP
    cpu.SP = 0xFD;
    cpu.flags.I = 1;
    cpu.nmi();

    const cycles = cpu.step();

    assert.equal(cpu.PC, 0xC79C, 'NMI vectors through $FFFA, not $FFFE');
    assert.equal(cpu.memory[0x01FD], 0x30, 'high byte of $30EF');
    assert.equal(cpu.memory[0x01FC], 0xEF, 'low byte of $30EF');
    assert.equal(cpu.memory[0x01FB] & 0x10, 0, 'B is clear in an NMI frame');
    assert.equal(cpu.nmiPending, false, 'the edge is consumed');
    assert.equal(cycles, 7);
});

test('a frame wraps within page one rather than leaving the stack (#3)', () => {
    // SP = $00 means the next push lands at $0100 and the one after wraps to
    // $01FF. A core using a plain decrement would write outside page one.
    const cpu = cpuAt(0x1234, [0x20, 0xCD, 0xAB]);
    cpu.SP = 0x00;
    cpu.memory[0xABCD] = 0x60;              // RTS

    cpu.step();                             // JSR
    assert.equal(cpu.memory[0x0100], 0x12, 'high byte at the bottom of page one');
    assert.equal(cpu.memory[0x01FF], 0x36, 'low byte wrapped to the top');
    assert.equal(cpu.SP, 0xFE);

    cpu.step();                             // RTS
    assert.equal(cpu.PC, 0x1237, 'the wrapped frame is pulled back correctly');
    assert.equal(cpu.SP, 0x00);
});
