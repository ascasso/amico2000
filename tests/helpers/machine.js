'use strict';

// Shared, dependency-free scaffolding for the Node regression checks.
//
// amico2000.js is a browser script that expects CPU6502 as a global, and
// main.js touches the DOM, so the ROM image is scraped out of its source
// rather than required. Testing against the real bytes keeps the checks honest
// if the image ever changes.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');

global.CPU6502 = require(path.join(ROOT, 'cpu6502')).CPU6502;
const { Amico2000 } = require(path.join(ROOT, 'amico2000'));

function romFromMainJs(name, expectedLength) {
    const src = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
    const body = src.match(new RegExp(`const ${name} = new Uint8Array\\(\\[([\\s\\S]*?)\\]\\);`));
    if (!body) {
        throw new Error(`${name} literal not found in main.js`);
    }
    const bytes = body[1].match(/0x[0-9a-fA-F]{2}/g).map((b) => parseInt(b, 16));
    if (bytes.length !== expectedLength) {
        throw new Error(`${name} should be ${expectedLength} bytes, found ${bytes.length}`);
    }
    return Uint8Array.from(bytes);
}

const MONITOR_ROM = romFromMainJs('MONITOR_ROM', 512);

// $FE22 is the monitor's cold-start entry and the target of the $FFFC vector,
// so it is what a healthy reset must land on (#24).
const MONITOR_RESET = 0xFE22;

/**
 * A machine with the real monitor PROM fitted and reset: the state the board
 * is in a moment after power-on.
 */
function bootedMachine() {
    const amico = new Amico2000();
    amico.loadMonitorROM(MONITOR_ROM);
    amico.reset();
    return amico;
}

/** Assemble bytes at `address` and run them, bypassing loadProgram()'s checks. */
function runAt(amico, address, bytes, instructionCount) {
    amico.cpu.memory.set(Uint8Array.from(bytes), address);
    amico.cpu.PC = address;
    for (let i = 0; i < instructionCount; i++) {
        amico.cpu.step();
    }
}

module.exports = { Amico2000, MONITOR_ROM, MONITOR_RESET, bootedMachine, runAt };
