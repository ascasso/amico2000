'use strict';

// The HLT key. For a long time it did nothing here, because the manual's
// description of it, "genera una interruzione a livello CPU", does not say
// which interrupt. The rest of the manual does. Its chapter on interrupts
// (supplement page 85) has: "il tasto di HALT (HLT) quando è premuto genera su
// NMI (piedino 6) un fronte di discesa di tensione", and the CPU schematic
// (page 25) draws the key, debounced, going through two gates onto the NMI
// line.
//
// So HLT is an NMI and nothing more. Where it leads is up to two bytes of RAM,
// $03FC/$03FD, through which the monitor jumps. These checks follow the two
// uses the manual gives: a program's own interrupt routine, with the manual's
// example run as printed, and the monitor's routine at $FE00, which halts a
// program so that it can be looked at and resumed.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine, MONITOR_ROM } = require('./helpers/machine');

const ms = (amico, n) => amico.cpu.run(1000 * n);   // 1 MHz
const word = (amico, address) => amico.cpu.memory[address] | (amico.cpu.memory[address + 1] << 8);

/** Hold each key for 80 ms and pause 80 ms, as a person would. */
function type(amico, keys) {
    ms(amico, 50);
    for (const key of keys) {
        amico.keyDown(key);
        ms(amico, 80);
        amico.keyUp(key);
        ms(amico, 80);
    }
}

/** A press and release of HLT on the keyboard. */
function pressHLT(amico) {
    amico.keyDown('h');
    ms(amico, 80);
    amico.keyUp('h');
}

/** The six digits as hex characters, a space for a dark digit. */
function shown(amico) {
    const table = Array.from(MONITOR_ROM.slice(0x1EA, 0x1FA), (pattern) => pattern & 0x7F);
    return amico.getDisplay().map((pattern) => {
        if (pattern === 0) return ' ';
        const digit = table.indexOf(pattern);
        return digit < 0 ? '?' : digit.toString(16).toUpperCase();
    }).join('');
}

const RUN_FROM_0200 = ['ArrowUp', '0', '2', '0', '0', 'Enter'];

// =============================================================================
// The key and the line
// =============================================================================

test('HLT is the NMI line: the CPU goes through $FFFA and the monitor through $03FC', () => {
    const amico = bootedMachine();
    const cpu = amico.cpu;

    // The monitor's part is one instruction at $FE1C: JMP ($03FC).
    assert.equal(MONITOR_ROM[0x1FA] | (MONITOR_ROM[0x1FB] << 8), 0xFE1C, 'the NMI vector');
    assert.deepEqual(Array.from(MONITOR_ROM.slice(0x01C, 0x01F)), [0x6C, 0xFC, 0x03]);

    // A program going round at $0200, and a place for the interrupt to land.
    cpu.memory.set([0x4C, 0x00, 0x02], 0x0200);     // JMP $0200
    cpu.memory.set([0x40], 0x0300);                 // RTI
    cpu.memory.set([0x00, 0x03], 0x03FC);           // NMI vector: $0300
    cpu.PC = 0x0200;
    cpu.SP = 0xFF;
    cpu.flags.I = 0;
    cpu.step();

    amico.keyDown('h');
    cpu.step();                                     // the interrupt is taken
    assert.equal(cpu.PC, 0xFE1C);
    assert.equal(cpu.SP, 0xFC, 'three bytes pushed');
    assert.equal(word(amico, 0x01FE), 0x0200, 'the address to come back to');
    assert.equal(cpu.memory[0x01FD] & 0x10, 0, 'and the status, with B clear');
    cpu.step();                                     // JMP ($03FC)
    assert.equal(cpu.PC, 0x0300);
    cpu.step();                                     // RTI
    assert.equal(cpu.PC, 0x0200, 'the program goes on where it was');
    assert.equal(cpu.SP, 0xFF);
});

test('one press of HLT is one interrupt, however long the key is held', () => {
    const amico = bootedMachine();
    const cpu = amico.cpu;
    cpu.memory.set([0x4C, 0x00, 0x02], 0x0200);     // JMP $0200
    cpu.memory.set([0xE6, 0x20, 0x40], 0x0300);     // INC $20 / RTI: count the interrupts
    cpu.memory.set([0x00, 0x03], 0x03FC);
    cpu.PC = 0x0200;

    // A held keyboard key repeats its keydown; the line gives one edge.
    for (let i = 0; i < 10; i++) {
        amico.keyDown('h');
        ms(amico, 30);
    }
    assert.equal(cpu.memory[0x20], 1, 'held for 300 ms: one interrupt');
    amico.keyUp('h');
    ms(amico, 30);
    assert.equal(cpu.memory[0x20], 1, 'letting go interrupts nothing');

    pressHLT(amico);
    ms(amico, 30);
    assert.equal(cpu.memory[0x20], 2, 'a second press is a second interrupt');

    // The on-screen key: a click is a press and a release at once.
    amico.pressKey('pc');
    ms(amico, 30);
    amico.pressKey('pc');
    ms(amico, 30);
    assert.equal(cpu.memory[0x20], 4, 'two clicks, two more');
    assert.ok(amico.keyMatrix.every((row) => row.every((cell) => !cell)), 'and the key matrix never sees it');
});

test('NMI cannot be masked: HLT gets through with interrupts disabled', () => {
    const amico = bootedMachine();
    const cpu = amico.cpu;
    cpu.memory.set([0x78, 0x4C, 0x01, 0x02], 0x0200);   // SEI / JMP $0201
    cpu.memory.set([0xE6, 0x20, 0x40], 0x0300);
    cpu.memory.set([0x00, 0x03], 0x03FC);
    cpu.PC = 0x0200;
    ms(amico, 10);
    assert.equal(cpu.flags.I, 1);
    pressHLT(amico);
    assert.equal(cpu.memory[0x20], 1);
});

// =============================================================================
// The manual's example
// =============================================================================

test('the manual\'s HLT example runs as the manual says (supplement page 85)', () => {
    // Printed with the words: "vedremo il display spegnersi per accendere per
    // circa 16 secondi tutti 8 sul display ogni volta che viene premuto il
    // tasto di HLT". The bytes are the manual's, keyed as it lists them.
    const amico = bootedMachine();
    const cpu = amico.cpu;
    cpu.memory.set([
        0xA9, 0x00, 0x8D, 0xFC, 0x03,   // 0200 LDA #$00 / STA $03FC   the NMI vector,
        0xA9, 0x03, 0x8D, 0xFD, 0x03,   // 0205 LDA #$03 / STA $03FD   pointed at $0300
        0x18, 0x90, 0xFD                // 020A CLC / BCC $020A        go round, displays dark
    ], 0x0200);
    cpu.memory.set([
        0xA9, 0x88, 0x85, 0xFB, 0x85, 0xFA, 0x85, 0xF9,   // 0300 88 on all three display bytes
        0xA9, 0x10, 0x85, 0x00, 0xA9, 0x00, 0x85, 0x01,   // 0308 the delay's two counters
        0x20, 0x0C, 0xFF,                                 // 0310 JSR $FF0C   the monitor's scan
        0xC6, 0x01, 0xD0, 0xF9,                           // 0313 DEC $01 / BNE $0310
        0xC6, 0x00, 0xD0, 0xF5,                           // 0317 DEC $00 / BNE $0310
        0x40                                              // 031B RTI
    ], 0x0300);

    type(amico, RUN_FROM_0200);
    ms(amico, 300);
    assert.equal(word(amico, 0x03FC), 0x0300, 'the program has set its vector');
    assert.equal(shown(amico), '      ', 'and goes round with the displays dark');

    pressHLT(amico);
    ms(amico, 200);
    assert.equal(shown(amico), '888888', 'HLT lights every digit with an 8');

    let lit = 0.2;
    while (shown(amico) === '888888' && lit < 60) {
        ms(amico, 100);
        lit += 0.1;
    }
    assert.ok(lit > 14 && lit < 19, `for about 16 seconds: ${lit.toFixed(1)}`);
    assert.equal(shown(amico), '      ', 'then the displays go dark again');
    assert.ok(cpu.PC >= 0x020A && cpu.PC <= 0x020C, 'with the program back in its loop');

    pressHLT(amico);
    ms(amico, 200);
    assert.equal(shown(amico), '888888', 'and every time the key is pressed');
});

// =============================================================================
// Halting a program with the monitor's own routine
// =============================================================================

/** A program that loads the registers and then counts at $20 for ever. */
function countingProgram(amico) {
    amico.cpu.memory.set([
        0xA9, 0x11, 0xA2, 0x22, 0xA0, 0x33,   // 0200 LDA #$11 / LDX #$22 / LDY #$33
        0xE6, 0x20,                           // 0206 INC $20
        0x4C, 0x06, 0x02                      // 0208 JMP $0206
    ], 0x0200);
}

test('at power-on the NMI vector is the monitor\'s own routine, the one the manual gives', () => {
    // "È necessario caricare i dati 00 e FE rispettivamente alle locazioni
    // 03FC e 03FD." On the board those bytes are whatever the RAM came up
    // with; the emulator starts with the manual's.
    const amico = bootedMachine();
    assert.equal(word(amico, 0x03FC), 0xFE00);

    // The routine there: STA $F3 / PLA / STA $FD / PLA / STA $F6 / STA $FA ...
    assert.deepEqual(Array.from(MONITOR_ROM.slice(0x000, 0x00A)),
        [0x85, 0xF3, 0x68, 0x85, 0xFD, 0x68, 0x85, 0xF6, 0x85, 0xFA]);

    // RES leaves a vector the user has stored; only a cold start puts it back.
    amico.cpu.memory.set([0x00, 0x03], 0x03FC);
    amico.res();
    assert.equal(word(amico, 0x03FC), 0x0300);
    amico.reset();
    assert.equal(word(amico, 0x03FC), 0xFE00);
});

test('HLT halts a running program: the monitor shows where, with the registers saved', () => {
    const amico = bootedMachine();
    const cpu = amico.cpu;
    countingProgram(amico);
    type(amico, RUN_FROM_0200);
    ms(amico, 100);
    assert.equal(shown(amico), '      ', 'the program is running: displays dark');
    const earlier = cpu.memory[0x20];
    ms(amico, 1);
    assert.notEqual(cpu.memory[0x20], earlier, 'and counting');

    pressHLT(amico);
    ms(amico, 100);

    // The registers, where the manual says they are kept (page 86).
    assert.equal(cpu.memory[0xF3], 0x11, 'accumulator at $F3');
    assert.equal(cpu.memory[0xF4], 0x33, 'Y at $F4');
    assert.equal(cpu.memory[0xF5], 0x22, 'X at $F5');
    assert.equal(cpu.memory[0xFE], 0xFF, 'stack pointer at $FE');
    const stopped = word(amico, 0xF6);
    assert.ok([0x0206, 0x0208].includes(stopped), `program counter at $F6/$F7: $${stopped.toString(16)}`);

    // The monitor is running again, showing that address and the byte there.
    const expected = stopped.toString(16).toUpperCase().padStart(4, '0') +
        cpu.memory[stopped].toString(16).toUpperCase().padStart(2, '0');
    assert.equal(shown(amico), expected);

    // And the program is stopped: its counter no longer moves.
    const count = cpu.memory[0x20];
    ms(amico, 200);
    assert.equal(cpu.memory[0x20], count);
});

test('RUN takes a halted program up again where it stopped, registers and all', () => {
    const amico = bootedMachine();
    const cpu = amico.cpu;
    countingProgram(amico);
    type(amico, RUN_FROM_0200);
    ms(amico, 100);
    pressHLT(amico);
    ms(amico, 100);
    const count = cpu.memory[0x20];

    // The displays already show the address it stopped at, so RUN is enough.
    type(amico, ['Enter']);
    ms(amico, 50);
    assert.equal(shown(amico), '      ', 'running again');
    assert.notEqual(cpu.memory[0x20], count, 'the counter moves on');
    assert.ok(cpu.PC >= 0x0206 && cpu.PC <= 0x020A, 'inside the loop, not from the top');
    assert.deepEqual([cpu.A, cpu.X, cpu.Y], [0x11, 0x22, 0x33], 'with the registers it had');

    // Halt it again, look somewhere else, and come back with REG then RUN,
    // as the manual describes for stepping.
    pressHLT(amico);
    ms(amico, 100);
    const stopped = word(amico, 0xF6);
    type(amico, ['ArrowUp', '0', '0', '2', '0']);        // AD 0020: look at the counter
    assert.equal(shown(amico).slice(0, 4), '0020');
    type(amico, ['r']);                                  // REG: back to the saved address
    assert.equal(word(amico, 0xFA), stopped);
    const before = cpu.memory[0x20];
    type(amico, ['Enter']);
    ms(amico, 50);
    assert.notEqual(cpu.memory[0x20], before, 'and it runs on from there');
});

test('HLT at the monitor\'s own prompt halts the monitor, which carries on', () => {
    // Nothing is running but the monitor, so the address shown is one of its
    // own. It is harmless: the monitor is back in its loop and takes keys.
    const amico = bootedMachine();
    ms(amico, 100);
    pressHLT(amico);
    ms(amico, 100);
    assert.match(shown(amico), /^F[EF][0-9A-F]{4}$/, `an address in the monitor ROM: ${shown(amico)}`);

    type(amico, ['ArrowUp', '0', '2', '0', '0']);
    assert.equal(shown(amico).slice(0, 4), '0200', 'the keypad still works');
    assert.equal(amico.cpu.halted, false);
});
