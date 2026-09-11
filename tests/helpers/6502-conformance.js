'use strict';

// Runner for the vendored Klaus Dormann 6502 functional test suite (#18).
//
// This exercises the bare CPU core, not the board: a plain CPU6502 with its
// writable 64KB array, no monitor ROM, no 8255 PIA, no cassette traps. The
// suite is assembled with report = 0, so it needs no I/O channel and reports
// purely by trapping, which is what makes that isolation possible.
//
// The one thing this file must never get wrong is what counts as a pass. Every
// trap in the suite is a loop on itself -- `jmp *` for success, `jmp *` and
// `bne *` and friends for failures -- so "the program stopped making progress"
// is only how a trap is *detected*. The address is the entire pass/fail signal.
// Hence the shape below: a stop is classified by where it happened, `passed` is
// set in exactly one branch, and the success address comes from the fixture
// manifest rather than from a constant typed in here.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const FIXTURE_DIR = path.join(__dirname, '..', 'fixtures', '6502-functional');

// Measured at 30,646,176 instructions for a full pass on the pinned image, so
// this is roughly 3x headroom. The budget counts instructions we have stepped
// ourselves rather than consulting cpu.cycles, because a CPU whose cycle
// accounting is broken is exactly the kind this suite exists to catch, and it
// must not be able to stall the runner. At the measured ~80M instructions/s an
// exhausted budget costs a little over a second.
const DEFAULT_MAX_INSTRUCTIONS = 100000000;

// Enough context to find the failing instruction in the upstream listing
// without making the per-instruction bookkeeping expensive.
const DEFAULT_TRACE_LENGTH = 16;

const OUTCOME = Object.freeze({
    SUCCESS: 'success',              // self-loop at the suite's success address
    TRAP: 'trap',                    // self-loop anywhere else: a failure trap
    HALTED: 'halted',                // CPU6502 gave up on an illegal opcode
    ERROR: 'error',                  // the emulator threw
    BUDGET_EXHAUSTED: 'budget-exhausted',  // never stopped at all
});

/**
 * Read and sanity-check the fixture manifest.
 *
 * The manifest is the single source for the addresses and checksums, so a
 * malformed one has to fail here rather than silently yield undefined
 * addresses that would make every comparison below false.
 */
function loadManifest(fixtureDir = FIXTURE_DIR) {
    const manifestPath = path.join(fixtureDir, 'manifest.json');
    let manifest;
    try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (err) {
        throw new Error(`6502 conformance fixture manifest unusable at ${manifestPath}: ${err.message}`);
    }

    for (const key of ['entry_address', 'success_address', 'size_bytes', 'load_offset']) {
        if (!Number.isInteger(manifest.image?.[key])) {
            throw new Error(`fixture manifest is missing integer image.${key}`);
        }
    }
    if (!manifest.files?.image?.sha256 || !manifest.files.image.vendored_as) {
        throw new Error('fixture manifest is missing files.image.sha256 or files.image.vendored_as');
    }
    return manifest;
}

/**
 * Load the test image, refusing anything that is not byte-for-byte the pinned
 * fixture.
 *
 * Validating before execution matters more here than for a normal fixture: a
 * truncated or swapped image would still run, would still stop somewhere, and
 * would report a CPU defect at an address that means nothing. Checking the
 * digest keeps a fixture problem from being read as an emulator problem.
 */
function loadImage(manifest, fixtureDir = FIXTURE_DIR) {
    const expected = manifest.files.image;
    const imagePath = path.join(fixtureDir, expected.vendored_as);

    let image;
    try {
        image = fs.readFileSync(imagePath);
    } catch (err) {
        throw new Error(`6502 conformance image missing at ${imagePath}: ${err.message}`);
    }

    if (image.length !== expected.bytes) {
        throw new Error(
            `6502 conformance image is ${image.length} bytes, manifest pins ${expected.bytes}`);
    }
    const actual = crypto.createHash('sha256').update(image).digest('hex');
    if (actual !== expected.sha256) {
        throw new Error(
            '6502 conformance image failed its checksum, so it is not the pinned fixture.\n' +
            `  expected sha256 ${expected.sha256}\n` +
            `  actual   sha256 ${actual}\n` +
            `  path            ${imagePath}`);
    }
    return image;
}

/**
 * Run an image on a fresh CPU6502 until it stops, and classify how it stopped.
 *
 * Kept generic in the image, entry and success address so the runner's own
 * checks can drive it with small synthetic programs. That is deliberate: the
 * classification logic below is the part that has to be trustworthy, and it can
 * only be tested against known-failing programs if it is reachable without the
 * 64KB fixture.
 */
function runImage({
    image,
    entryAddress,
    successAddress,
    loadOffset = 0,
    maxInstructions = DEFAULT_MAX_INSTRUCTIONS,
    traceLength = DEFAULT_TRACE_LENGTH,
    CPU = require(path.join(__dirname, '..', '..', 'cpu6502')).CPU6502,
} = {}) {
    const cpu = new CPU(); // bare core: no machine layer, no ROM, no I/O callbacks
    cpu.memory.set(image, loadOffset);

    // The image sets $FFFC to res_trap, a *failure* trap, because an unexpected
    // RESET during the run is an error the suite wants to catch. So the entry
    // point is assigned directly and cpu.reset() is deliberately not called --
    // vectoring through reset would land in that trap and read as a CPU defect
    // that is not there. Upstream says the same: "alter PC to 400 hex
    // (code_segment) and enter a go command".
    cpu.PC = entryAddress;

    // Ring buffer of the instructions leading up to the stop. Typed arrays and
    // a fixed size keep this cheap enough to leave on for all 30M instructions.
    const trace = {
        pc: new Uint16Array(traceLength),
        opcode: new Uint8Array(traceLength),
        a: new Uint8Array(traceLength),
        x: new Uint8Array(traceLength),
        y: new Uint8Array(traceLength),
        sp: new Uint8Array(traceLength),
        p: new Uint8Array(traceLength),
        next: 0,
        filled: 0,
    };

    let instructions = 0;
    let outcome = OUTCOME.BUDGET_EXHAUSTED;
    let stopPC = entryAddress;
    let error = null;

    while (instructions < maxInstructions) {
        const pc = cpu.PC;

        if (traceLength > 0) {
            const i = trace.next;
            trace.pc[i] = pc;
            trace.opcode[i] = cpu.memory[pc];
            trace.a[i] = cpu.A;
            trace.x[i] = cpu.X;
            trace.y[i] = cpu.Y;
            trace.sp[i] = cpu.SP;
            trace.p[i] = cpu.getP();
            trace.next = (i + 1) % traceLength;
            if (trace.filled < traceLength) trace.filled++;
        }

        try {
            cpu.step();
        } catch (err) {
            error = err;
            outcome = OUTCOME.ERROR;
            stopPC = pc;
            instructions++;
            break;
        }
        instructions++;

        // Checked before the self-loop test: a halted CPU6502 leaves PC where it
        // is, so it would otherwise be misread as a trap. PC has already moved
        // past the opcode byte by then, so `pc` is the faulting address.
        if (cpu.halted) {
            outcome = OUTCOME.HALTED;
            stopPC = pc;
            break;
        }

        // An instruction that leaves PC where it started can only be a jump or
        // branch to itself, which is how every trap in the suite is written.
        if (cpu.PC === pc) {
            outcome = pc === successAddress ? OUTCOME.SUCCESS : OUTCOME.TRAP;
            stopPC = pc;
            break;
        }
    }

    if (outcome === OUTCOME.BUDGET_EXHAUSTED) {
        stopPC = cpu.PC;
    }

    return {
        outcome,
        // The single place `passed` is decided. Landing in a trap, halting,
        // throwing or running out of budget all leave it false, so no stopped
        // program can be mistaken for a passing suite.
        passed: outcome === OUTCOME.SUCCESS && stopPC === successAddress,
        pc: stopPC,
        successAddress,
        entryAddress,
        opcode: cpu.memory[stopPC],
        bytesAtPC: [cpu.memory[stopPC], cpu.memory[(stopPC + 1) & 0xFFFF], cpu.memory[(stopPC + 2) & 0xFFFF]],
        A: cpu.A,
        X: cpu.X,
        Y: cpu.Y,
        SP: cpu.SP,
        P: cpu.getP(),
        flags: { ...cpu.flags },
        instructions,
        cycles: cpu.cycles,
        maxInstructions,
        error,
        trace: readTrace(trace),
        cpu,
    };
}

/** Unwrap the ring buffer into oldest-to-newest plain records. */
function readTrace(trace) {
    const out = [];
    const start = trace.filled < trace.pc.length ? 0 : trace.next;
    for (let n = 0; n < trace.filled; n++) {
        const i = (start + n) % trace.pc.length;
        out.push({
            pc: trace.pc[i],
            opcode: trace.opcode[i],
            A: trace.a[i],
            X: trace.x[i],
            Y: trace.y[i],
            SP: trace.sp[i],
            P: trace.p[i],
        });
    }
    return out;
}

/** Run the real pinned suite. Validates the fixture before executing it. */
function runFunctionalSuite(options = {}) {
    const fixtureDir = options.fixtureDir ?? FIXTURE_DIR;
    const manifest = loadManifest(fixtureDir);
    const image = loadImage(manifest, fixtureDir);

    const result = runImage({
        image,
        entryAddress: manifest.image.entry_address,
        successAddress: manifest.image.success_address,
        loadOffset: manifest.image.load_offset,
        maxInstructions: options.maxInstructions ?? DEFAULT_MAX_INSTRUCTIONS,
        traceLength: options.traceLength ?? DEFAULT_TRACE_LENGTH,
    });
    result.manifest = manifest;
    return result;
}

const hex = (value, digits) => '$' + value.toString(16).toUpperCase().padStart(digits, '0');
const byte = (value) => value.toString(16).toUpperCase().padStart(2, '0');

/** Status register as the familiar NV-BDIZC letter row. */
function flagsToString(p) {
    const names = ['N', 'V', 'U', 'B', 'D', 'I', 'Z', 'C'];
    return names.map((name, bit) => ((p >> (7 - bit)) & 1 ? name : '-')).join('');
}

/** One-line result for a passing run. */
function describeResult(result) {
    return `${result.passed ? 'PASS' : 'FAIL'} at ${hex(result.pc, 4)} after ` +
        `${result.instructions.toLocaleString()} instructions, ` +
        `${result.cycles.toLocaleString()} cycles`;
}

/**
 * Full diagnostic report for a failure.
 *
 * Deliberately verbose: the point of failure is an address in a 13KB listing,
 * and whoever reads this is about to go looking for it. Cycle counts are
 * included as a diagnostic only -- this suite checks results and flags, never
 * timing, so the cycle total is not evidence about cycle accuracy.
 */
function formatFailure(result) {
    const lines = [];

    switch (result.outcome) {
        case OUTCOME.SUCCESS:
            lines.push('The suite reached its success trap.');
            break;
        case OUTCOME.TRAP:
            lines.push(`The suite hit a FAILURE TRAP at ${hex(result.pc, 4)}.`);
            lines.push(`Success would have been ${hex(result.successAddress, 4)}; every other`);
            lines.push('self-loop is a failed check. Look up this address in the upstream');
            lines.push('listing -- the instruction just above it is the one being tested.');
            break;
        case OUTCOME.HALTED:
            lines.push(`The CPU HALTED on an illegal opcode ${hex(result.opcode, 2)} at ${hex(result.pc, 4)}.`);
            lines.push('The suite uses documented NMOS opcodes only, so this means execution');
            lines.push('left the intended path, or an opcode is missing from the core.');
            break;
        case OUTCOME.ERROR:
            lines.push(`The emulator THREW at ${hex(result.pc, 4)}: ${result.error?.message}`);
            break;
        case OUTCOME.BUDGET_EXHAUSTED:
            lines.push(`The suite did not stop within ${result.maxInstructions.toLocaleString()} instructions.`);
            lines.push(`It was at ${hex(result.pc, 4)}. This is a loop that is not a self-loop,`);
            lines.push('so it is either a hung emulator or a budget set too low.');
            break;
        default:
            lines.push(`Unrecognised outcome: ${result.outcome}`);
    }

    lines.push('');
    lines.push(`  outcome      ${result.outcome}`);
    lines.push(`  PC           ${hex(result.pc, 4)}`);
    lines.push(`  opcode       ${hex(result.opcode, 2)}   bytes at PC: ${result.bytesAtPC.map(byte).join(' ')}`);
    lines.push(`  A X Y SP     ${byte(result.A)} ${byte(result.X)} ${byte(result.Y)} ${byte(result.SP)}`);
    lines.push(`  P            ${byte(result.P)}   ${flagsToString(result.P)}`);
    lines.push(`  instructions ${result.instructions.toLocaleString()} of ${result.maxInstructions.toLocaleString()}`);
    lines.push(`  cycles       ${result.cycles.toLocaleString()} (diagnostic only; this suite does not check timing)`);

    if (result.trace.length > 0) {
        lines.push('');
        lines.push(`  last ${result.trace.length} instructions (oldest first), state before each:`);
        lines.push('     PC    op   A  X  Y  SP  P  flags');
        for (const t of result.trace) {
            lines.push(`    ${hex(t.pc, 4)}  ${byte(t.opcode)}   ` +
                `${byte(t.A)} ${byte(t.X)} ${byte(t.Y)} ${byte(t.SP)}  ${byte(t.P)} ${flagsToString(t.P)}`);
        }
    }

    if (result.error?.stack) {
        lines.push('');
        lines.push('  thrown:');
        lines.push(result.error.stack.split('\n').map((l) => '    ' + l).join('\n'));
    }

    return lines.join('\n');
}

module.exports = {
    FIXTURE_DIR,
    DEFAULT_MAX_INSTRUCTIONS,
    DEFAULT_TRACE_LENGTH,
    OUTCOME,
    loadManifest,
    loadImage,
    runImage,
    runFunctionalSuite,
    describeResult,
    formatFailure,
    flagsToString,
};
