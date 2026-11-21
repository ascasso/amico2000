'use strict';

// Issue #35: the cassette PROM (IC10) was copied into its socket in file
// order, which put its two halves the wrong way round. Both documented entry
// points then sat in the middle of instructions, and the issue took that for
// a corrupt dump.
//
// The dump was sound. A PROM image is in chip order, and a 512-cell PROM is
// addressed by A0-A8 alone. IC10 occupies $FB00-$FCFF, which starts on an odd
// page: A8 is high across $FB00-$FBFF and low across $FC00-$FCFF, so the
// first half of the image answers at $FC00 and the second half at $FB00.
//
// The checks below hold that mapping to evidence the loader cannot influence:
// what the manual prints, whether the bytes are code, and what the routine
// does when the emulated CPU runs it.

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const { CPU6502 } = require('../cpu6502');
const {
    MONITOR_ROM,
    CASSETTE_ROM,
    MONITOR_RESET,
    bootedMachine
} = require('./helpers/machine');

const SOCKET_START = 0xFB00;
const SOCKET_END = 0xFCFF;
const SAVE_ENTRY = 0xFBBC;
const LOAD_ENTRY = 0xFC54;

const hex = (value, digits = 4) => value.toString(16).toUpperCase().padStart(digits, '0');

function machineWithCassettePROM() {
    const amico = bootedMachine();
    amico.loadCassetteROM(CASSETTE_ROM);
    return amico;
}

// The monitor's digit-to-segment table at $FFEA. The display emulation drops
// bit 7, so the patterns are compared without it.
const SEGMENT_TABLE = Array.from(MONITOR_ROM.slice(0x1EA, 0x1FA), (pattern) => pattern & 0x7F);

/** Read the six digits back the way they are laid out on the board: "AAAA DD". */
function displayed(amico) {
    const digits = amico.getDisplay().map((pattern) => {
        const digit = SEGMENT_TABLE.indexOf(pattern);
        assert.notEqual(digit, -1, `segment pattern $${hex(pattern, 2)} is not a hex digit`);
        return digit.toString(16).toUpperCase();
    });
    return `${digits.slice(0, 4).join('')} ${digits.slice(4).join('')}`;
}

// Instruction length of every documented NMOS 6502 opcode, 0 where the opcode
// is undefined. Row is the high nibble, column the low nibble.
const INSTRUCTION_LENGTHS = [
    '1200022012100330',  // 0x
    '2200022013000330',  // 1x
    '3200222012103330',  // 2x
    '2200022013000330',  // 3x
    '1200022012103330',  // 4x
    '2200022013000330',  // 5x
    '1200022012103330',  // 6x
    '2200022013000330',  // 7x
    '0200222010103330',  // 8x
    '2200222013100300',  // 9x
    '2220222012103330',  // Ax
    '2200222013103330',  // Bx
    '2200222012103330',  // Cx
    '2200022013000330',  // Dx
    '2200222012103330',  // Ex
    '2200022013000330'   // Fx
].join('').split('').map(Number);

/**
 * Follow every path the CPU could take from the entry points, without running
 * anything, and report what would stop it: an opcode the core does not
 * implement, or a transfer into the middle of an instruction.
 *
 * Running the code cannot do this for LOAD, which waits for a tape signal the
 * emulator does not model, so its half of the PROM is checked by reading it.
 */
function trace(memory, entries) {
    const owner = new Map();   // address -> first byte of the instruction covering it
    const faults = [];
    const pending = [...entries];

    while (pending.length > 0) {
        let pc = pending.pop();

        // A path that leaves the socket has reached the monitor (JMP $FE22).
        while (pc >= SOCKET_START && pc <= SOCKET_END) {
            if (owner.has(pc)) {
                if (owner.get(pc) !== pc) {
                    faults.push(`$${hex(pc)} is inside the instruction at $${hex(owner.get(pc))}`);
                }
                break;
            }

            const opcode = memory[pc];
            const length = INSTRUCTION_LENGTHS[opcode];
            if (length === 0) {
                faults.push(`undefined opcode $${hex(opcode, 2)} at $${hex(pc)}`);
                break;
            }
            for (let i = 1; i < length; i++) {
                if (owner.has(pc + i)) {
                    faults.push(`the instruction at $${hex(pc)} runs into the one at $${hex(owner.get(pc + i))}`);
                }
            }
            for (let i = 0; i < length; i++) {
                owner.set(pc + i, pc);
            }

            const target = memory[pc + 1] | (memory[pc + 2] << 8);
            if ((opcode & 0x1F) === 0x10) {
                // The eight conditional branches: taken and not taken.
                const offset = memory[pc + 1];
                pending.push(pc + 2 + (offset < 0x80 ? offset : offset - 0x100));
            } else if (opcode === 0x20) {
                // JSR: the subroutine, then the instruction it returns to.
                pending.push(target);
            } else if (opcode === 0x4C) {
                pending.push(target);
                break;
            } else if (opcode === 0x60 || opcode === 0x40 || opcode === 0x6C || opcode === 0x00) {
                // RTS, RTI, JMP (indirect) and BRK all end the path here.
                break;
            }
            pc += length;
        }
    }

    return { owner, faults };
}

test('the embedded image is the dump ComputerHistory.it publishes (#35)', () => {
    // amico2000_replica_PROM_IC10.bin, read from an original machine. The
    // issue suspected a damaged transcription; the array is the published
    // file byte for byte, compared on 2026-11-21. The hash keeps it that way.
    assert.equal(CASSETTE_ROM.length, 512);
    assert.equal(
        crypto.createHash('sha256').update(CASSETTE_ROM).digest('hex'),
        '0f9d27ffa5520cc22f629e7133b7415e9d6a8227484294f64f8f590a20ae6722'
    );
});

test('each PROM answers with the cell its address pins select (#35)', () => {
    const memory = machineWithCassettePROM().cpu.memory;
    const bytes = (from, to) => Array.from(memory.slice(from, to + 1));

    // IC10: A8 is low on page $FC and high on page $FB.
    assert.deepEqual(bytes(0xFC00, 0xFCFF), Array.from(CASSETTE_ROM.slice(0x000, 0x100)),
        'cells $000-$0FF must answer at $FC00-$FCFF');
    assert.deepEqual(bytes(0xFB00, 0xFBFF), Array.from(CASSETTE_ROM.slice(0x100, 0x200)),
        'cells $100-$1FF must answer at $FB00-$FBFF');

    // IC9 starts where A0-A8 are all low, so its image still reads in order.
    assert.deepEqual(bytes(0xFE00, 0xFFFF), Array.from(MONITOR_ROM),
        'the monitor image must be unaffected');
});

test('an image shorter than the chip fills its first cells only (#35)', () => {
    const amico = bootedMachine();
    const socket = () => Array.from(amico.cpu.memory.slice(SOCKET_START, SOCKET_END + 1));
    const expected = socket();

    amico.loadCassetteROM(Uint8Array.of(0x11, 0x22));

    // Cells 0 and 1 are on page $FC, not at the start of the socket, and the
    // other 510 addresses keep whatever they held.
    expected[0xFC00 - SOCKET_START] = 0x11;
    expected[0xFC01 - SOCKET_START] = 0x22;
    assert.deepEqual(socket(), expected);
});

test('REG shows what the manual prints for both entry points (#35)', () => {
    // Chapter V has the reader store the routine's address at $00F6/$00F7 and
    // press REG, and prints the display that follows: "FBBC D8" for SAVE
    // (page 47) and "FC54 A9" for LOAD (page 46). In file order the PROM
    // showed 0A and FB there instead.
    for (const [entry, shown] of [[SAVE_ENTRY, 'FBBC D8'], [LOAD_ENTRY, 'FC54 A9']]) {
        const amico = machineWithCassettePROM();
        amico.cpu.memory.set([entry & 0xFF, entry >> 8], 0x00F6);

        amico.cpu.run(50000);
        amico.keyDown('r');   // REG
        amico.cpu.run(80000);
        amico.keyUp('r');
        amico.cpu.run(80000);

        assert.equal(displayed(amico), shown);
    }
});

test('both entry points lead through coherent code that fills the PROM (#35)', () => {
    // The length table decides what counts as an instruction here, so it must
    // describe the opcodes the core really implements, no more and no fewer.
    const core = new CPU6502();
    for (let opcode = 0; opcode < 256; opcode++) {
        assert.equal(INSTRUCTION_LENGTHS[opcode] > 0, core.instructions[opcode] !== null,
            `length table and CPU core disagree about opcode $${hex(opcode, 2)}`);
    }

    const memory = machineWithCassettePROM().cpu.memory;
    const { owner, faults } = trace(memory, [SAVE_ENTRY, LOAD_ENTRY]);
    assert.deepEqual(faults, []);

    // Everything the two routines never reach is filler at the end of page
    // $FC. Nothing else in the PROM is unaccounted for.
    const unreached = [];
    for (let address = SOCKET_START; address <= SOCKET_END; address++) {
        if (!owner.has(address)) unreached.push(address);
    }
    assert.deepEqual(unreached.map((address) => hex(address)),
        ['FCF6', 'FCF7', 'FCF8', 'FCF9', 'FCFA', 'FCFB', 'FCFC', 'FCFD', 'FCFE', 'FCFF']);
    assert.ok(unreached.every((address) => memory[address] === 0xFF), 'the filler must be $FF');

    // The same image in file order, as it used to be installed, fails at once:
    // neither entry point is even an opcode.
    const fileOrder = new Uint8Array(0x10000);
    fileOrder.set(CASSETTE_ROM, SOCKET_START);
    assert.deepEqual(trace(fileOrder, [SAVE_ENTRY]).faults, ['undefined opcode $FB at $FBBD']);
    assert.deepEqual(trace(fileOrder, [LOAD_ENTRY]).faults, ['undefined opcode $FB at $FC54']);
});

test('the real SAVE routine runs from the PROM and writes the record the manual draws (#35)', () => {
    // With the trap off the CPU executes IC10 itself. SAVE only drives the
    // PIA, so it needs no tape signal and runs to the end: in at $FBBC on
    // page $FB, across $FBFF into page $FC, back into page $FB for every bit,
    // and out through JMP $FE22.
    const amico = machineWithCassettePROM();
    amico.cassette.interceptROM = false;
    const cpu = amico.cpu;

    // The manual's own example (page 47): the numbers 00 to 15 keyed into
    // $0010-$001F, saved as program 13.
    const text = [
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15
    ];
    cpu.memory.set(text, 0x0010);
    cpu.memory.set([0x10, 0x00, 0x1F, 0x00, 0x13], 0x0000);

    // $FB95 shifts one byte out to tape, taking it from $F1. Sampling $F1 on
    // each entry reads the record back without decoding a waveform, which the
    // emulator does not model (#20).
    const WRITE_BYTE = 0xFB95;
    const written = [];
    const phaseLEDs = [];
    cpu.PC = SAVE_ENTRY;
    for (let steps = 0; cpu.PC !== MONITOR_RESET && !cpu.halted && steps < 10000000; steps++) {
        if (cpu.PC === WRITE_BYTE) {
            written.push(cpu.memory[0xF1]);
            if (phaseLEDs[phaseLEDs.length - 1] !== amico.pia.portA) phaseLEDs.push(amico.pia.portA);
        }
        cpu.step();
    }
    assert.equal(cpu.halted, false, 'the routine must not reach an undefined opcode');
    assert.equal(cpu.PC, MONITOR_RESET, 'and must leave through JMP $FE22');

    // Fig. 27 (page 46): leader, start byte, identifier, load address, number
    // of bytes, text, checksum, trailer. What the PROM adds to the drawing:
    // leader and trailer are 256 zero bytes, the start byte is $A5, the count
    // is end minus start, and the text is not in ascending order. The routine
    // counts Y down to zero, so these sixteen bytes go out from offset $0F
    // down to 1, and offset 0 last.
    const leader = new Array(256).fill(0x00);
    const header = [0x13, 0x10, 0x00, 0x0F, 0x00];
    const onTape = [...text.slice(1).reverse(), text[0]];
    const checksum = [0xA5, ...header, ...text].reduce((sum, byte) => (sum + byte) & 0xFF, 0);
    assert.deepEqual(written, [...leader, 0xA5, ...header, ...onTape, checksum, ...leader]);

    // The manual also says which LEDs light while this runs: D6 with D4, then
    // briefly D6 with D5, then D6 with D4 again. Fig. 26 names D4-D7 leader,
    // text, recording and reading. The values Port A takes are exactly that
    // sequence if it carries those four LEDs on bits 0-3.
    assert.deepEqual(phaseLEDs, [0x05, 0x06, 0x05]);
});

test('the cassette traps still take both entry points with the PROM fitted (#35)', () => {
    // Fitting the chip must not change the file-backed cassette: the traps
    // act before the CPU fetches anything from the socket.
    const amico = machineWithCassettePROM();
    const cpu = amico.cpu;

    cpu.memory.set([0xDE, 0xAD], 0x0300);
    cpu.memory.set([0x00, 0x03, 0x01, 0x03, 0x07], 0x0000);   // SAVE $0300-$0301 as program 07
    cpu.PC = SAVE_ENTRY;
    cpu.step();
    assert.equal(cpu.PC, MONITOR_RESET, 'SAVE must be trapped, not executed');
    assert.deepEqual(Array.from(amico.cassette.lastSavedTape.data), [0xDE, 0xAD]);

    cpu.memory.set([0x00, 0x00], 0x0300);
    cpu.memory.set([0x07, 0x00, 0xFF], 0x0000);               // LOAD program 07 where it was recorded
    cpu.PC = LOAD_ENTRY;
    cpu.step();
    assert.equal(cpu.PC, MONITOR_RESET, 'LOAD must be trapped, not executed');
    assert.deepEqual(Array.from(cpu.memory.slice(0x0300, 0x0302)), [0xDE, 0xAD]);
});
