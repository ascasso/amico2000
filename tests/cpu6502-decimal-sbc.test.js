'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { CPU6502 } = require('../cpu6502');

test('decimal SBC derives N from the NMOS binary subtraction result (#22)', () => {
    const cpu = new CPU6502();
    const operandAddress = 0x0200;

    // BCD adjustment changes $80 to $20, so this vector distinguishes the
    // NMOS binary-result N flag from the adjusted accumulator's sign bit.
    cpu.A = 0x00;
    cpu.flags.C = 1;
    cpu.flags.D = 1;
    cpu.memory[operandAddress] = 0x80;

    cpu.opSBC(operandAddress);

    assert.equal(cpu.A, 0x20);
    assert.equal(cpu.flags.N, 1);
    assert.equal(cpu.flags.V, 1);
    assert.equal(cpu.flags.Z, 0);
    assert.equal(cpu.flags.C, 0);
});
