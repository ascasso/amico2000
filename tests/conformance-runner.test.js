'use strict';

// Checks of the conformance runner itself (#18).
//
// Run just this file with:
//   node --test tests/conformance-runner.test.js
//
// The functional suite reports by trapping, and every trap -- success and
// failure alike -- is a loop on itself. So the runner's classification of
// *where* a program stopped is the whole result, and a runner that treated any
// stopped program as a pass would report success for every failing test in the
// suite while looking perfectly healthy. These checks exist to make that
// failure mode impossible to ship unnoticed: they drive the runner with small
// synthetic programs whose outcome is known by construction, and assert that
// only the one that reaches the success address is ever marked as passed.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
    OUTCOME,
    runImage,
    runFunctionalSuite,
    loadManifest,
    loadImage,
    formatFailure,
    flagsToString,
    FIXTURE_DIR,
} = require('./helpers/6502-conformance');

const ENTRY = 0x0400;
const SUCCESS = 0x3469;   // same address the real fixture uses, for realism

/** Assemble `bytes` at `address` into a 64KB image. */
function imageWith(...chunks) {
    const image = new Uint8Array(65536);
    image.fill(0xFF);  // matches CPU6502's power-on fill; $FF is an illegal opcode
    for (const [address, bytes] of chunks) {
        image.set(Uint8Array.from(bytes), address);
    }
    return image;
}

/** `JMP here` -- the self-loop shape every trap in the suite uses. */
const selfLoop = (address) => [0x4C, address & 0xFF, address >> 8];

function run(image, options = {}) {
    return runImage({
        image,
        entryAddress: ENTRY,
        successAddress: SUCCESS,
        maxInstructions: 10000,
        ...options,
    });
}

// ---------------------------------------------------------------------------
// Completion handling
// ---------------------------------------------------------------------------

test('a self-loop at the success address is recognised as a pass', () => {
    // JMP $3469 / JMP $3469 -- reach the success trap and loop there.
    const result = run(imageWith(
        [ENTRY, selfLoop(SUCCESS)],
        [SUCCESS, selfLoop(SUCCESS)]));

    assert.strictEqual(result.outcome, OUTCOME.SUCCESS);
    assert.strictEqual(result.pc, SUCCESS);
    assert.ok(result.passed, 'the success trap must be reported as a pass');
});

test('success is decided by the address, not by the instruction shape', () => {
    // The same `JMP *` instruction, three bytes earlier. Nothing about the
    // program distinguishes it from the passing case except where it stopped.
    const decoy = SUCCESS - 3;
    const result = run(imageWith(
        [ENTRY, selfLoop(decoy)],
        [decoy, selfLoop(decoy)]));

    assert.strictEqual(result.outcome, OUTCOME.TRAP);
    assert.strictEqual(result.pc, decoy);
    assert.ok(!result.passed, 'a self-loop three bytes off must not pass');
});

// ---------------------------------------------------------------------------
// Failure handling: the four ways a run can go wrong
// ---------------------------------------------------------------------------

test('a failure trap is reported as a failure, with its address', () => {
    const trapAt = 0x0500;
    const result = run(imageWith(
        [ENTRY, [0xA9, 0x42, 0x4C, trapAt & 0xFF, trapAt >> 8]],  // LDA #$42 / JMP $0500
        [trapAt, selfLoop(trapAt)]));

    assert.strictEqual(result.outcome, OUTCOME.TRAP);
    assert.ok(!result.passed);
    assert.strictEqual(result.pc, trapAt);
    assert.strictEqual(result.A, 0x42, 'registers at the trap must be reported');

    const report = formatFailure(result);
    assert.match(report, /FAILURE TRAP at \$0500/);
    assert.match(report, /\$3469/, 'the report should say what success would have been');
});

test('an illegal opcode is reported as a halt at the faulting address', () => {
    const result = run(imageWith([ENTRY, [0xEA, 0xFF]]));  // NOP then an illegal $FF

    assert.strictEqual(result.outcome, OUTCOME.HALTED);
    assert.ok(!result.passed);
    // PC has already moved past the opcode byte when the core halts, so the
    // runner must report the address of the opcode, not the byte after it.
    assert.strictEqual(result.pc, ENTRY + 1);
    assert.strictEqual(result.opcode, 0xFF);
    assert.match(formatFailure(result), /HALTED on an illegal opcode \$FF at \$0401/);
});

test('a multi-instruction loop exhausts the budget instead of hanging', () => {
    // NOP / JMP $0400 -- never a self-loop, so only the instruction budget can
    // stop it. This is the case that a cycles-based limit would miss if the
    // CPU's cycle accounting were broken.
    const result = run(imageWith([ENTRY, [0xEA, 0x4C, ENTRY & 0xFF, ENTRY >> 8]]),
        { maxInstructions: 500 });

    assert.strictEqual(result.outcome, OUTCOME.BUDGET_EXHAUSTED);
    assert.ok(!result.passed);
    assert.strictEqual(result.instructions, 500, 'the budget must be honoured exactly');
    assert.match(formatFailure(result), /did not stop within 500 instructions/);
});

test('the budget is counted in instructions, not in the CPU\'s own cycle counter', () => {
    // A core that never advances `cycles` must still be stopped by the budget.
    // Otherwise a CPU with broken cycle accounting -- exactly what this suite
    // exists to detect -- could hang the test run instead of failing it.
    const { CPU6502 } = require('../cpu6502');
    class StuckCycleCPU extends CPU6502 {
        step() {
            const cycles = this.cycles;
            const result = super.step();
            this.cycles = cycles;  // frozen
            return result;
        }
    }

    const result = run(imageWith([ENTRY, [0xEA, 0x4C, ENTRY & 0xFF, ENTRY >> 8]]),
        { maxInstructions: 300, CPU: StuckCycleCPU });

    assert.strictEqual(result.outcome, OUTCOME.BUDGET_EXHAUSTED);
    assert.strictEqual(result.cycles, 0, 'the stub should have frozen the cycle counter');
    assert.strictEqual(result.instructions, 300);
});

test('an exception from the emulator is caught and reported, not thrown', () => {
    class ThrowingCPU extends require('../cpu6502').CPU6502 {
        step() { throw new Error('synthetic core explosion'); }
    }

    const result = run(imageWith([ENTRY, [0xEA]]), { CPU: ThrowingCPU });

    assert.strictEqual(result.outcome, OUTCOME.ERROR);
    assert.ok(!result.passed);
    assert.strictEqual(result.pc, ENTRY, 'the address that threw must be reported');
    assert.match(formatFailure(result), /THREW at \$0400: synthetic core explosion/);
});

test('no outcome other than reaching the success address is ever a pass', () => {
    // The property the whole runner rests on, asserted over every outcome the
    // runner can produce.
    const outcomes = [
        run(imageWith([ENTRY, selfLoop(ENTRY)])),                        // trap
        run(imageWith([ENTRY, [0xFF]])),                                 // halt
        run(imageWith([ENTRY, [0xEA, 0x4C, ENTRY & 0xFF, ENTRY >> 8]]),
            { maxInstructions: 50 }),                                    // budget
    ];

    for (const result of outcomes) {
        assert.notStrictEqual(result.outcome, OUTCOME.SUCCESS);
        assert.ok(!result.passed, `${result.outcome} must not be a pass`);
        assert.notStrictEqual(result.pc, SUCCESS);
    }
});

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

test('the runner enters at the entry address and does not vector through reset', () => {
    // The real image points $FFFC at res_trap, a *failure* trap, because an
    // unexpected RESET mid-run is an error. A runner that called cpu.reset()
    // would land there and report a CPU defect that is not there, so this
    // pins the behaviour: $FFFC points somewhere fatal and must be ignored.
    const resetTrap = 0x37A3;
    const result = run(imageWith(
        [ENTRY, selfLoop(SUCCESS)],
        [SUCCESS, selfLoop(SUCCESS)],
        [resetTrap, selfLoop(resetTrap)],
        [0xFFFC, [resetTrap & 0xFF, resetTrap >> 8]]));

    assert.strictEqual(result.outcome, OUTCOME.SUCCESS,
        'the runner must start at the entry address, not at the $FFFC vector');
    assert.notStrictEqual(result.pc, resetTrap);
});

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

test('the failure report carries the state needed to find the fault', () => {
    const trapAt = 0x0600;
    const result = run(imageWith(
        [ENTRY, [0xA9, 0x80,               // LDA #$80   -> N set
                 0xA2, 0x11,               // LDX #$11
                 0xA0, 0x22,               // LDY #$22
                 0x4C, trapAt & 0xFF, trapAt >> 8]],
        [trapAt, selfLoop(trapAt)]));

    const report = formatFailure(result);
    // Five instructions, not four: the trap's own `JMP *` has to execute once
    // before the runner can see that PC did not move.
    for (const expected of [/PC\s+\$0600/, /opcode\s+\$4C/, /bytes at PC: 4C 00 06/,
                            /A X Y SP\s+80 11 22 FD/, /instructions\s+5 of/, /cycles\s+\d/]) {
        assert.match(report, expected);
    }
    assert.match(report, /P\s+24\s+--U--I--/, 'the status register must be decoded');
    assert.match(report, /cycles.*diagnostic only/,
        'cycle counts must not be presented as timing-conformance evidence');
});

test('a recent-instruction trace is retained and ends at the fault', () => {
    const trapAt = 0x0700;
    const result = run(imageWith(
        [ENTRY, [0xEA, 0xEA, 0xEA, 0x4C, trapAt & 0xFF, trapAt >> 8]],  // NOP x3 / JMP
        [trapAt, selfLoop(trapAt)]), { traceLength: 8 });

    // Four instructions executed before the trap, plus the trap itself.
    assert.strictEqual(result.trace.length, 5);
    assert.deepStrictEqual(result.trace.map((t) => t.pc),
        [0x0400, 0x0401, 0x0402, 0x0403, trapAt]);
    assert.deepStrictEqual(result.trace.map((t) => t.opcode),
        [0xEA, 0xEA, 0xEA, 0x4C, 0x4C]);
    assert.match(formatFailure(result), /last 5 instructions/);
});

test('the trace is bounded, keeping the most recent instructions', () => {
    const trapAt = 0x0800;
    const nops = new Array(200).fill(0xEA);
    const result = run(imageWith(
        [ENTRY, [...nops, 0x4C, trapAt & 0xFF, trapAt >> 8]],
        [trapAt, selfLoop(trapAt)]), { traceLength: 4 });

    assert.strictEqual(result.trace.length, 4, 'the ring buffer must not grow');
    assert.strictEqual(result.trace[3].pc, trapAt, 'the newest entry is the fault');
    assert.strictEqual(result.trace[0].pc, ENTRY + 198, 'older entries are dropped');
});

test('the status register is rendered as readable flag letters', () => {
    // Bit 7 to bit 0 is N V U B D I Z C, matching CPU6502.stateToString().
    assert.strictEqual(flagsToString(0x24), '--U--I--');   // U and I set: the usual idle state
    assert.strictEqual(flagsToString(0xFF), 'NVUBDIZC');
    assert.strictEqual(flagsToString(0x00), '--------');
    assert.strictEqual(flagsToString(0x81), 'N------C');
});

// ---------------------------------------------------------------------------
// Fixture validation
// ---------------------------------------------------------------------------

/** A scratch copy of the fixture that a test may damage. */
function withTemporaryFixture(mutate) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amico-conformance-'));
    try {
        const manifest = loadManifest();
        fs.copyFileSync(path.join(FIXTURE_DIR, 'manifest.json'), path.join(dir, 'manifest.json'));
        fs.copyFileSync(path.join(FIXTURE_DIR, manifest.files.image.vendored_as),
            path.join(dir, manifest.files.image.vendored_as));
        mutate(dir, manifest);
        return () => runFunctionalSuite({ fixtureDir: dir });
    } finally {
        process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }));
    }
}

test('a corrupted image is rejected instead of being run', () => {
    // A single flipped byte. It would still run, still stop somewhere, and
    // still report an address -- one that means nothing. Catching it here is
    // what keeps a fixture problem from being read as an emulator defect.
    const attempt = withTemporaryFixture((dir, manifest) => {
        const file = path.join(dir, manifest.files.image.vendored_as);
        const image = fs.readFileSync(file);
        image[0x1234] ^= 0xFF;
        fs.writeFileSync(file, image);
    });

    assert.throws(attempt, /failed its checksum/);
});

test('a truncated image is rejected', () => {
    const attempt = withTemporaryFixture((dir, manifest) => {
        const file = path.join(dir, manifest.files.image.vendored_as);
        fs.writeFileSync(file, fs.readFileSync(file).subarray(0, 1024));
    });

    assert.throws(attempt, /is 1024 bytes, manifest pins 65536/);
});

test('a missing image is rejected', () => {
    const attempt = withTemporaryFixture((dir, manifest) => {
        fs.rmSync(path.join(dir, manifest.files.image.vendored_as));
    });

    assert.throws(attempt, /image missing at/);
});

test('a missing or malformed manifest is rejected', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'amico-conformance-'));
    assert.throws(() => loadManifest(empty), /manifest unusable/);

    fs.writeFileSync(path.join(empty, 'manifest.json'), '{"image":{"entry_address":1024}}');
    assert.throws(() => loadManifest(empty), /missing integer image\.success_address/);

    fs.rmSync(empty, { recursive: true, force: true });
});

test('the pinned fixture itself validates', () => {
    const manifest = loadManifest();
    const image = loadImage(manifest);

    assert.strictEqual(image.length, 65536);
    assert.strictEqual(manifest.image.entry_address, 0x0400);
    assert.strictEqual(manifest.image.success_address, 0x3469);
    // Cross-check the manifest against the bytes it describes, so a manifest
    // edited without re-deriving the addresses cannot go unnoticed.
    assert.deepStrictEqual([...image.subarray(0x3469, 0x346C)], [0x4C, 0x69, 0x34],
        'the success address must hold a jump to itself');
    assert.strictEqual(image[0x0400], 0xD8, 'the entry point must be the CLD at `start`');
});
