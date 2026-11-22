'use strict';

// The NOR/SS slide switch: single step.
//
// The CPU schematic (supplement page 25) wires it onto the same NMI line as
// HLT, through a gate whose inputs are the 6502's SYNC output and the monitor
// PROM's chip select. At SS every instruction fetched from outside the monitor
// is followed by an NMI, and the monitor's routine at $FE00 shows where the
// program has got to.
//
// The manual walks a user through it on pages 85 and 86, and these checks
// follow that walk-through with the keys it names: store 00 and FE at $03FC
// and $03FD, show the program's first address, move the switch to the right,
// and press RUN once for each instruction.

const test = require('node:test');
const assert = require('node:assert/strict');

const { bootedMachine, MONITOR_ROM, CASSETTE_ROM, MONITOR_RESET } = require('./helpers/machine');

const ms = (amico, n) => amico.cpu.run(1000 * n);   // 1 MHz

function type(amico, keys) {
    ms(amico, 50);
    for (const key of keys) {
        amico.keyDown(key);
        ms(amico, 80);
        amico.keyUp(key);
        ms(amico, 80);
    }
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

const RUN = ['Enter'];
const REG = ['r'];
const saved = (amico) => ({
    a: amico.cpu.memory[0xF3],
    y: amico.cpu.memory[0xF4],
    x: amico.cpu.memory[0xF5],
    pc: amico.cpu.memory[0xF6] | (amico.cpu.memory[0xF7] << 8),
    sp: amico.cpu.memory[0xFE]
});

// A program with something of everything the manual says stepping shows:
// "lo sviluppo del programma, i vari salti o condizionamenti".
const PROGRAM = [
    0xA9, 0x11,         // 0200 LDA #$11
    0xA2, 0x02,         // 0202 LDX #$02
    0x20, 0x10, 0x02,   // 0204 JSR $0210
    0xCA,               // 0207 DEX
    0xD0, 0xFA,         // 0208 BNE $0204
    0x85, 0x20,         // 020A STA $20
    0x4C, 0x0C, 0x02    // 020C JMP $020C
];
const SUBROUTINE = [
    0x69, 0x01,         // 0210 ADC #$01
    0x60                // 0212 RTS
];

/** The board as the manual prepares it: vector keyed in, program in, first address shown. */
function prepared() {
    const amico = bootedMachine();
    amico.cpu.memory.set(PROGRAM, 0x0200);
    amico.cpu.memory.set(SUBROUTINE, 0x0210);
    // "È necessario caricare i dati 00 e FE rispettivamente alle locazioni 03FC e 03FD."
    type(amico, ['ArrowUp', '0', '3', 'f', 'c', 'ArrowDown', '0', '0', '+', 'f', 'e']);
    // "Si porta ora sul display indirizzi la locazione di partenza del programma..."
    type(amico, ['ArrowUp', '0', '2', '0', '0']);
    return amico;
}

test('at SS, RUN executes one instruction and the monitor shows the next (supplement page 85)', () => {
    const amico = prepared();
    assert.equal(amico.cpu.memory[0x03FC] | (amico.cpu.memory[0x03FD] << 8), 0xFE00);
    assert.equal(shown(amico), '0200A9');

    // "...quindi si sposta a destra l'interruttore del single step."
    amico.setSingleStep(true);
    ms(amico, 200);
    assert.equal(shown(amico), '0200A9', 'the monitor is not stepped: it runs on as before');

    // "A questo punto premendo il tasto RUN vediamo che sul display appare
    // l'indirizzo della seconda istruzione del programma e, sui due digit dei
    // dati, il contenuto esadecimale della locazione di memoria corrispondente."
    type(amico, RUN);
    assert.equal(shown(amico), '0202A2');
    assert.equal(saved(amico).a, 0x11, 'LDA #$11 has been executed, and nothing after it');
    assert.equal(saved(amico).x, 0x00);
});

test('each RUN executes one more instruction, through calls, returns and branches (page 85)', () => {
    const amico = prepared();
    amico.setSingleStep(true);

    // What the displays must show after each RUN, and the registers the
    // manual says are kept at $F3-$FE (page 86).
    const steps = [
        ['0202A2', { a: 0x11, x: 0x00, sp: 0xFF }],   // LDA #$11
        ['020420', { a: 0x11, x: 0x02, sp: 0xFF }],   // LDX #$02
        ['021069', { a: 0x11, x: 0x02, sp: 0xFD }],   // JSR $0210: into the subroutine
        ['021260', { a: 0x12, x: 0x02, sp: 0xFD }],   // ADC #$01
        ['0207CA', { a: 0x12, x: 0x02, sp: 0xFF }],   // RTS: back after the call
        ['0208D0', { a: 0x12, x: 0x01, sp: 0xFF }],   // DEX
        ['020420', { a: 0x12, x: 0x01, sp: 0xFF }],   // BNE taken
        ['021069', { a: 0x12, x: 0x01, sp: 0xFD }],   // JSR
        ['021260', { a: 0x13, x: 0x01, sp: 0xFD }],   // ADC
        ['0207CA', { a: 0x13, x: 0x01, sp: 0xFF }],   // RTS
        ['0208D0', { a: 0x13, x: 0x00, sp: 0xFF }],   // DEX
        ['020A85', { a: 0x13, x: 0x00, sp: 0xFF }],   // BNE not taken
        ['020C4C', { a: 0x13, x: 0x00, sp: 0xFF }]    // STA $20
    ];
    steps.forEach(([display, registers], i) => {
        type(amico, RUN);
        assert.equal(shown(amico), display, `after RUN number ${i + 1}`);
        const now = saved(amico);
        assert.deepEqual({ a: now.a, x: now.x, sp: now.sp }, registers, `registers after RUN number ${i + 1}`);
        assert.equal(now.pc, parseInt(display.slice(0, 4), 16), 'the saved program counter is the address shown');
    });
    assert.equal(amico.cpu.memory[0x20], 0x13, 'and the program has done what it does');
});

test('after looking at a register, REG then RUN goes on with the next instruction (page 86)', () => {
    const amico = prepared();
    amico.setSingleStep(true);
    type(amico, RUN);
    type(amico, RUN);
    assert.equal(shown(amico), '020420');

    // "Sarà sufficiente portarsi all'indirizzo corrispondente al registro":
    // 00F5 is X, which the second instruction loaded with 02.
    type(amico, ['ArrowUp', '0', '0', 'f', '5']);
    assert.equal(shown(amico), '00F502');

    // "Per riprendere l'esecuzione in single step del programma è sufficiente
    // richiamare il Program Counter premendo il tasto REG e di seguito il
    // tasto RUN passando così alla prossima istruzione."
    type(amico, REG);
    assert.equal(shown(amico), '020420');
    type(amico, RUN);
    assert.equal(shown(amico), '021069');
});

test('a register changed while the program is stopped is the one it goes on with (page 86)', () => {
    // "Nel caso si desideri modificare uno qualsiasi di questi registri si
    // procede al solito modo."
    const amico = prepared();
    amico.setSingleStep(true);
    type(amico, RUN);                                     // LDA #$11
    type(amico, ['ArrowUp', '0', '0', 'f', '3', 'ArrowDown', '4', '0']);   // A := $40
    type(amico, [...REG, ...RUN, ...RUN, ...RUN]);        // LDX, JSR, ADC #$01
    assert.equal(saved(amico).a, 0x41, 'the ADC added to the value keyed in');
});

test('stepping gives the same result as running: only the pace differs', () => {
    const stepped = prepared();
    stepped.setSingleStep(true);
    for (let i = 0; i < 13; i++) type(stepped, RUN);

    const free = prepared();
    type(free, RUN);
    ms(free, 50);

    assert.equal(stepped.cpu.memory[0x20], 0x13);
    assert.equal(free.cpu.memory[0x20], 0x13);
    assert.equal(shown(free), '      ', 'run free, the program is in its last loop with the displays dark');
});

test('back at NOR, RUN lets the program go', () => {
    const amico = prepared();
    amico.setSingleStep(true);
    type(amico, RUN);
    type(amico, RUN);
    assert.equal(shown(amico), '020420');

    amico.setSingleStep(false);
    type(amico, RUN);
    ms(amico, 50);
    assert.equal(amico.cpu.memory[0x20], 0x13, 'it ran to the end from where stepping had left it');
    assert.equal(amico.cpu.PC >= 0x020C && amico.cpu.PC <= 0x020E, true);
});

test('moving the switch to SS while a program runs stops it at once', () => {
    const amico = bootedMachine();
    amico.cpu.memory.set([0xE6, 0x20, 0x4C, 0x00, 0x02], 0x0200);   // INC $20 / JMP $0200
    type(amico, ['ArrowUp', '0', '2', '0', '0', 'Enter']);
    ms(amico, 50);
    assert.equal(shown(amico), '      ');

    amico.setSingleStep(true);
    ms(amico, 100);
    assert.match(shown(amico), /^020[02]/, `the monitor is back, showing where: ${shown(amico)}`);
    const count = amico.cpu.memory[0x20];
    ms(amico, 100);
    assert.equal(amico.cpu.memory[0x20], count, 'and the program is no longer running');

    type(amico, RUN);
    assert.notEqual(shown(amico).slice(0, 4), '    ');
    assert.ok([count, count + 1].includes(amico.cpu.memory[0x20]), 'each RUN now moves it one instruction');
});

test('the monitor is never stepped, whatever the switch says', () => {
    // The circuit leaves alone every instruction fetched from $FE00-$FFFF. If
    // it did not, the monitor could not run to show anything.
    const amico = bootedMachine();
    amico.setSingleStep(true);
    const before = amico.cpu.memory.slice(0xF3, 0xFF);
    ms(amico, 300);
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0xF3, 0xF8)), Array.from(before.slice(0, 5)),
        'nothing has been saved: no interrupt was taken');
    type(amico, ['ArrowUp', '0', '2', '0', '0', 'ArrowDown', 'e', 'a']);
    assert.equal(shown(amico), '0200EA', 'and the keypad works as ever');
});

test('an instant cassette LOAD is not stepped: it is over in one step', () => {
    // The trap stands in for the whole routine before anything is fetched.
    const amico = bootedMachine();
    amico.loadCassetteROM(CASSETTE_ROM);
    amico.addTapeRecord({ id: 0x13, start: 0x0300, data: [0xDE, 0xAD] });
    amico.setSingleStep(true);
    amico.cpu.memory.set([0x13, 0x00, 0xFF], 0x0000);
    amico.cpu.PC = 0xFC54;
    amico.cpu.step();
    assert.equal(amico.cpu.PC, MONITOR_RESET);
    assert.deepEqual(Array.from(amico.cpu.memory.slice(0x0300, 0x0302)), [0xDE, 0xAD]);
});
