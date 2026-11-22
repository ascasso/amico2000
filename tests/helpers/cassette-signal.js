'use strict';

// Runs the real cassette routines of the IC10 PROM against a signal, for the
// checks that hold the sound codec to the board (#20).
//
// SAVE needs nothing but the PIA: what it would put on tape is read off Port B.
// LOAD needs the tape to answer, so this file stands in for the input circuit
// of the supplement's schematic (page 28): the recorder's output sets a latch
// made of two gates of IC20, the routine reads the latch on Port A bit 7, and
// it clears it by taking Port B bit 0 low. The stand-in is as small as that
// description. It knows when the signal is strong enough to set the latch and
// nothing about what the signal means; all the decoding is done by the PROM.

const { CASSETTE_ROM, MONITOR_RESET, bootedMachine } = require('./machine');

const SAVE_ENTRY = 0xFBBC;
const LOAD_ENTRY = 0xFC54;
// $FB95 shifts one byte out to tape, taking it from $F1.
const WRITE_BYTE = 0xFB95;
// $FC4E is the JSR that sends the trailer, after the checksum has gone out.
const SEND_TRAILER = 0xFC4E;

function machineWithCassettePROM() {
    const amico = bootedMachine();
    amico.loadCassetteROM(CASSETTE_ROM);
    amico.cassette.interceptROM = false;
    return amico;
}

// The recorder's input hangs on Port B bits 5 and 6 through equal resistors,
// so the level is how many of the two are high: 1 at rest, 0 and 2 in a pulse.
const tapeLevel = (portB) => ((portB >> 5) & 1) + ((portB >> 6) & 1);

/**
 * Run the real SAVE routine and return what it did.
 *
 * `edges` is the tape level as [cycle, level], with cycle 0 at the routine's
 * entry: the level it starts at, then every change. `bytes` is every byte
 * handed to the bit-shifting routine. `memory` may hold `[address, bytes]` pairs to place besides the
 * block itself. With `trailer: false` the run stops once the checksum is out,
 * which saves the six seconds of trailer where a check does not need them.
 */
function realSave({ id, start, data, memory = [], trailer = true }) {
    const amico = machineWithCassettePROM();
    const cpu = amico.cpu;
    for (const [address, bytes] of memory) cpu.memory.set(bytes, address);
    cpu.memory.set(data, start);
    const end = start + data.length - 1;
    cpu.memory.set([start & 0xFF, start >> 8, end & 0xFF, end >> 8, id], 0x0000);

    cpu.PC = SAVE_ENTRY;
    const origin = cpu.cycles;
    // The line does not start at rest. Nothing before the first pulse sets
    // bit 5, so it sits at level 0 until that pulse's high half, and the
    // pulse's own low half does not show as a change.
    let level = tapeLevel(amico.pia.portB);
    const edges = [[0, level]];
    const bytes = [];
    while (cpu.PC !== MONITOR_RESET && !cpu.halted) {
        if (cpu.PC === WRITE_BYTE) bytes.push(cpu.memory[0xF1]);
        if (!trailer && cpu.PC === SEND_TRAILER) break;
        cpu.step();
        const now = tapeLevel(amico.pia.portB);
        if (now !== level) {
            level = now;
            edges.push([cpu.cycles - origin, level]);
        }
    }
    return { edges, bytes, cycles: cpu.cycles - origin, halted: cpu.halted };
}

/**
 * Run the real LOAD routine against a signal.
 *
 * `fire` lists, as sorted [fromCycle, toCycle] pairs, when the signal is
 * strong enough to set the latch. The routine is given `id` in $0000 and, if
 * `at` is a number, that address in $0001/$0002; otherwise $0002 is $FF and
 * it loads where the tape says. RAM from $0200 up is first filled with
 * `filler`, so a check can tell which bytes the routine stored.
 *
 * Returns `done`, whether the routine left through the monitor's reset entry
 * before the signal ran out; `status`, what it left in $0000; and `memory`.
 */
function realLoad(fire, { id, at = null, filler = 0xEE }) {
    const amico = machineWithCassettePROM();
    const cpu = amico.cpu;
    cpu.memory.fill(filler, 0x0200, 0x0800);
    cpu.memory[0x0000] = id;
    if (at === null) {
        cpu.memory[0x0002] = 0xFF;
    } else {
        cpu.memory[0x0001] = at & 0xFF;
        cpu.memory[0x0002] = at >> 8;
    }

    const origin = cpu.cycles;
    let latch = 0;
    let clearLine = 1;      // Port B bit 0: low clears the latch
    let next = 0;           // first interval not yet wholly in the past
    let seen = 0;           // the cycle the latch was last brought up to date
    // Bring the latch up to the present. A set wins over a clear, as it does
    // in a latch of two NAND gates whose set input is the one being driven.
    const settle = () => {
        const now = cpu.cycles - origin;
        while (next < fire.length && fire[next][1] <= seen) next++;
        if (next < fire.length && fire[next][0] < now) {
            latch = 1;
        } else if (!clearLine) {
            latch = 0;
        }
        seen = now;
    };
    // Port A's other seven lines are the key columns, pulled up.
    cpu.readCallbacks.set(0xFD00, () => {
        settle();
        return (latch << 7) | 0x7F;
    });
    cpu.writeCallbacks.set(0xFD01, (address, value) => {
        settle();
        amico.pia.portB = value;
        clearLine = value & 1;
        settle();
    });

    cpu.PC = LOAD_ENTRY;
    const limit = (fire.length ? fire[fire.length - 1][1] : 0) + 1000000;
    while (cpu.PC !== MONITOR_RESET && !cpu.halted && cpu.cycles - origin < limit) {
        settle();
        cpu.step();
    }
    return { done: cpu.PC === MONITOR_RESET, status: cpu.memory[0x0000], memory: cpu.memory };
}

module.exports = { machineWithCassettePROM, realSave, realLoad, tapeLevel };
