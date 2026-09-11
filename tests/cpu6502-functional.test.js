'use strict';

// The real Klaus Dormann 6502 functional suite, run against the CPU core (#17).
//
// Run just this file with:
//   node --test tests/cpu6502-functional.test.js
//
// What it proves and what it does not: the suite exercises every documented
// NMOS opcode in every addressing mode with heavy emphasis on the status flags.
// It does not cover undocumented opcodes, external interrupts, instruction
// timing, NMOS decimal *flag* behaviour (decimal ADC/SBC run with valid BCD
// operands only, N/V/Z ignored), or any AMICO 2000 hardware. See
// docs/6502-conformance.md and the fixture README for the full list.

const test = require('node:test');
const assert = require('node:assert');

const {
    runFunctionalSuite,
    describeResult,
    formatFailure,
    OUTCOME,
} = require('./helpers/6502-conformance');

test('the CPU core passes the Klaus Dormann 6502 functional suite (#17)', () => {
    const result = runFunctionalSuite();

    // Assert on the outcome before `passed`, so a failure reports *how* it
    // failed rather than just that a boolean was false.
    assert.strictEqual(
        result.outcome,
        OUTCOME.SUCCESS,
        '\n\n' + formatFailure(result) + '\n');

    // Belt and braces: `passed` is only ever set by landing on the manifest's
    // success address, and the suite is worthless if that ever drifts.
    assert.strictEqual(result.pc, result.manifest.image.success_address);
    assert.ok(result.passed, 'reached the success trap but was not marked as passed');

    console.log(`    6502 functional suite: ${describeResult(result)}`);
});
