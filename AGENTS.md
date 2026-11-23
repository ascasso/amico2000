# AGENTS.md

This file provides repository guidance for agents working in this repository.

## Agent Operating Contract

- Treat this file and the current source as the repository's source of truth.
  Files under `archived/` are historical context only unless a task explicitly
  asks for archival work.
- Inspect the current Git state and relevant files before changing anything.
  Preserve unrelated worktree changes and keep edits narrowly scoped.
- For implementation work, update `CHANGELOG.md` under `[Unreleased]` and add
  a concise entry to the dated engineering log in `docs/logs/`.
- What the public reads on the site is written in English and in Italian:
  the home page, the two guides, and whatever the page says while it is
  used. Add or change the two together; see Two Languages under Important
  Implementation Notes for where each kind of text lives and which words the
  Italian uses. The changelog, the logs, this file and the other documents
  stay in English, and so does the browser console.
- Fully document every change, including its purpose, scope, and verification;
  commit the complete change and push it before handoff.
- Keep the home page's `build-date` stamp in sync with the committer's calendar
  date of the commit being created: `YYYYMMDD` text and `YYYY-MM-DD` in its
  `datetime` attribute. `git show -s --format=%cs HEAD` shows the existing
  commit date; advance the stamp when making a commit on a later day. The date
  is the committer's local calendar date, in the time zone recorded on the
  commit, which is what `%cs` prints; it is not the UTC date. An evening commit
  in a US time zone is already the next day in UTC, and an automated review
  that compares the stamp with UTC will report a false mismatch. The
  managed GitHub Pages/Jekyll build does not refresh this stamp automatically.
  - To check the stamp, run `node --test tests/build-stamp.test.js`, which
    compares it with `git log -1 --no-merges --format=%cs` and gives the same
    answer in any time zone. Do not work the date out from a timestamp shown
    by GitHub, in its API, its pages or a review tool's summary of them: those
    are in UTC. The review of PR #47 did that, read a commit made at 21:36 on
    21 November, UTC-8, as one of the 22nd, and asked for a stamp that the
    test rejects.
  - A reviewer who finds the test passing has no stamp finding to report.
- Commit in small units. One commit is one unit of work — a single fix, a
  single new test file, a single documented decision, one vendored fixture.
  Prefer several small commits over one large one, and never batch unrelated
  units together just because they happened in the same session.
  - Each commit must stand on its own: its checks pass at that commit, and its
    message says why the change was made, not only what changed.
  - Keep a change's `CHANGELOG.md` and `docs/logs/` entries in the same commit
    as the change they describe, so the history stays self-explanatory. A large
    change may still separate the code from its longer-form documentation, as
    the `fix:` / `docs:` commit pairs in the history do.
  - Subject lines follow Conventional Commits. Prefixes already in use are
    `docs:`, `fix:`, `feat:`, and `ui:`, optionally scoped as `feat(ui):`; add
    another type only when none of these fits. Reference the issue number when
    there is one.
- Run the narrowest relevant checks before handoff. At minimum, use
  `git diff --check`; for JavaScript changes also run `node --check` on the
  affected files and the targeted Node test when applicable.
- Do not add a build system or test framework for a small fix. Prefer the
  existing browser workflow and dependency-free Node checks.
- Push when the work is committed. After any commit, or the series of commits
  that makes up a piece of work, the final step is `git push` of the branch to
  the remote branch it tracks. Work is not handed off while it exists only as
  commits on one machine, and nobody should have to ask for the push.
  - Push the finished series, once its checks pass, not each commit as it is
    made.
  - Never force a push. If a push is rejected, report what the remote has and
    leave the branch as it is.
  - A push is not a release. The live site builds from `master`, and work on
    `develop` reaches it only through a merged pull request; see the next
    rule.
- Do not otherwise publish or alter external GitHub state unless explicitly
  asked: opening, editing or merging a pull request, commenting, and anything
  else beyond the push above. The one further exception is closing an issue:
  Claude on an Opus or Fable model, and Codex on an Astra or Sol model, may
  close an issue without being asked. Any other agent or model still needs an
  explicit request to close one, and so does every other change to GitHub
  state.
- Never publish a link to an agent's session: not in a commit message, not in
  a pull request description, not in a comment, an issue or a file. This
  overrides the attribution a tool asks for. Claude Code asks for a
  `Claude-Session:` line at the end of a commit message and the session's
  `https://claude.ai/code/session_...` address at the end of a pull request
  description; leave both out.
  - Saying that an agent did the work is fine and stays: the
    `Co-Authored-By:` line at the end of a commit message, and the
    "Generated with" line at the end of a pull request description.
  - Commits pushed before 2026-11-22 keep the line they have. Taking it out
    would rewrite history, and a push is never forced. The pull requests that
    carried the link had it removed that day.
- Report browser/manual-test limitations clearly when a check cannot be
  automated.

## Project Overview

This is a browser-based emulator for the **AMICO 2000**, an Italian home computer (ASEL Milano, 1978) that the project owner's father built from a kit. This is a preservation and memorial project recreating a machine that was later discarded.

## Running the Emulator

No build step is required. To run:

```bash
# Open index.html directly in a browser, or use a local server to avoid CORS issues:
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Testing the Emulator

- Run the committed regression checks with `node --test tests/`, or a single
  file, e.g. `node --test tests/cpu6502-decimal-sbc.test.js`
- That includes the Klaus Dormann 6502 functional suite, which the CPU core
  passes. It is vendored and pinned, so it runs offline with no assembler and
  no new dependency, and costs about 0.6s. Run it alone with
  `node --test tests/cpu6502-functional.test.js`. Before concluding it has
  found a CPU defect, read `docs/6502-conformance.md`: it explains how a pass
  is decided, how to map a failing address to the upstream listing, and what
  the suite does not cover
- Open the browser console (F12) to access debug commands
- Use `debug.mem(0x0000, 16)` to dump memory
- Use `debug.state()` to show CPU state
- Access emulator internals directly: `amico.cpu.PC`, `amico.cpu.A`, etc.

## Code Architecture

The project consists of six modular JavaScript files, and `index.html`, which
besides loading them draws the board; see Board Artwork under Important
Implementation Notes. The guide is two more pages with no script,
`guide.html` in English and `guida.html` in Italian.

### 1. cpu6502.js (~1100 lines)
Complete 6502 CPU interpreter implementing:
- All 56 opcodes with 151 instruction variants
- All addressing modes
- BCD arithmetic
- Interrupt handling (IRQ, NMI, BRK)
- Memory-mapped I/O via callbacks (`readCallback`, `writeCallback`)
- Approximate timing (~1 MHz target via cycle counts per instruction; not cycle-accurate — see Known Limitations)

**Key architectural details:**
- Memory is a flat 64KB Uint8Array
- I/O callbacks allow the machine emulator to intercept reads/writes to specific addresses
- Interrupts are polled before each instruction fetch (see `_checkInterrupts()`)
- Stack lives at $0100-$01FF (standard 6502)

### 2. amico2000.js (~1320 lines)
Machine emulation layer that connects CPU to hardware:
- Manages 8255 PIA (Programmable Interface Adapter) for I/O
- Implements display multiplexing (refreshes 6 digits sequentially)
- Keyboard matrix scanning (3 rows × 7 columns)
- ROM/RAM memory mapping
- The cassette: the traps and their store of tape records, and the interface
  circuit the real routines use when the traps are off

**Key architectural details:**
- The 8255 PIA is memory-mapped at $FD00-$FD03:
  - $FD00 (Port A): Display segments and LED patterns (output) / Keyboard
    column data on bits 0-6 and the cassette latch on bit 7 (input)
  - $FD01 (Port B): Digit select bits 0-5 / Keyboard row scan bits 0-3.
    Also bit 0, low to clear the cassette latch; bits 5 and 6, the level sent
    to the recorder; and bit 7, which enables the phase LEDs
  - $FD02 (Port C): Expansion port (unused)
  - $FD03: Control register. Bit 4 of a mode word is Port A's direction,
    which only the phase LEDs depend on
- What is taken from the 8255's data sheet and not from the board, and the
  three places the emulator knowingly differs from the chip, are in
  `docs/8255-data-sheet.md`, with the links. Use the Intel scan named there;
  a retyped copy that turns up first in a search has the sheet wrong
- The cassette interface circuit (#20) is under Cassette Interface Circuit in
  the file: `_settleTapeLatch()`, `_driveTapeOut()`, `_phaseLEDsNow()`, and
  `connectRecorder()` for whatever is on the other end. It keeps time by
  `cpu.cycles`, which `cpu.reset()` restarts, so `res()` restarts its clocks
  too. See Cassette Sound Format
- Display updates are decoupled from PIA writes for performance - buffered and updated once per frame
- The board has no display latch, so neither has the emulator: `getDisplay()`
  shows a digit only if it was driven within `DISPLAY_PERSISTENCE_CYCLES`, a
  tenth of a second of CPU time, or is being driven now. The monitor scans
  each digit every 4 ms and pauses 31 ms at most, while a key bounces. Under a
  program that does not scan, and during the real cassette routines, the
  displays go dark, as on the board. `amico.display` still holds the last
  pattern each digit was given. Covered by `tests/display-persistence.test.js`
- Keyboard scanning matches the ROM's timing expectations (port B values: 1, 3, 5 for rows 0, 1, 2)

### 3. display.js (~440 lines)
SVG-based seven-segment display renderer:
- Six separate TIL312 packages, as on the board: four for the address, a gap
  where the board shows through, then two for the data:
  `[A3][A2][A1][A0]  [D1][D0]`. The board has no colon and no captions
- Slanted segments; an unlit segment stays visible in dusty red, so an idle
  digit reads as a faint 8
- Each digit has two decimal points, one each side of its foot, as a TIL312
  does. Nothing lights them: the board does not appear to wire them, and the
  machine layer drops bit 7 before a pattern reaches the renderer
- Two looks, chosen with `setLook()`: `authentic`, the bloom and halo of a
  powered board as photographed, and `readable`, solid bars with a narrow
  fringe and a dimmer ghost 8 for reading on a screen. A look changes only
  how segments are painted, never which are lit or where. The page starts
  in `readable`; the bench panel's **Displays** buttons switch, and `main.js`
  remembers the choice in `localStorage` under `amico2000.displayLook`
- The machine layer calls `update()` once per frame (60 fps, from its
  `requestAnimationFrame` loop, independent of CPU speed); the renderer compares
  each pattern with the one it last drew and writes to the DOM only for
  segments that changed, so a steady display costs nothing

**Implementation note:** Display updates are intentionally separated from the CPU loop to avoid thousands of DOM updates per second. The geometry is in the single `DISPLAY_LAYOUT` object at the top of the file, measured on a photograph of a real board. `tests/display-renderer.test.js` pins the bit-to-segment mapping, the left-to-right order of the digits, and where each named segment is actually drawn; keep it passing when changing how the display is drawn.

### 4. main.js (~1100 lines)
Application initialization and UI:
- Contains the Monitor ROM data (MONITOR_ROM constant at top of file)
- Puts no words of its own on the page: the Run button's word, the switch's
  tooltip, the tape's status line and the alerts all come from `lang.js`
  through `AmicoLang.t()`, and a reason given by the machine goes through
  `AmicoLang.message()`. What it logs to the console is English, always
- Keyboard event handling (both physical keyboard and on-screen buttons)
- ROM, program and tape loading via file input, including `.wav` recordings
  of a cassette, which it hands to `tape-audio.js`
- The **Cassette** setting, Instant or Real time, remembered in `localStorage`
  under `amico2000.cassetteMode`; the recorder it connects at startup; the
  phase LEDs, drawn from `amico.onPhaseLEDs`; and the recorder's status line
- The NOR/SS slide switch, `#ss-switch`, which it moves on a click and passes
  to `amico.setSingleStep()`; never remembered, so the page opens at NOR
- Debug console commands exposed via global `debug` object

**Memory Map:**
```
$0000-$07FF: 2KB RAM (expandable)
$FB00-$FCFF: Cassette ROM (embedded as CASSETTE_ROM in main.js; main.js fits it at startup)
$FD00-$FD03: 8255 PIA I/O ports
$FE00-$FFFF: Monitor ROM (512 bytes)
```

Both PROM regions are read-only to the running program; see ROM Write
Protection below.

### 5. tape-audio.js (~820 lines)
The cassette as sound (#20): a codec between tape records and WAV files, and
a recorder, exposed as the single global `AmicoTapeAudio`.
- `encodeWav()` writes a record as the sound the board's SAVE routine would
  put on tape; `decodeWav()` reads every block out of a recording
- `createRecorder()` makes a recorder for `amico.connectRecorder()`: it plays
  the cassette's programs as pulses for the real LOAD routine and reads back
  the pulses the real SAVE routine makes
- Plain functions over bytes and samples, and a recorder that is told the
  time. It knows nothing about the page or the machine, and `amico2000.js`
  knows nothing about it beyond the five things it asks of a recorder;
  `main.js` joins them through `amico.addTapeRecord()`, `amico.findTape()`
  and `amico.connectRecorder()`
- `blockOffsets()` is the PROM's own loop for the order of a block's bytes,
  step for step, faults included. Do not tidy it into the obvious order

**Implementation note:** no recording of a real tape was available when this
was written. The format is from the PROM and the schematic, and
`tests/tape-audio.test.js` holds the codec to the real SAVE and LOAD routines
running in the emulator, through `tests/helpers/cassette-signal.js`. The pulse
detector, `detectPulses()`, is the one part that rests on guesses, about what
a cassette deck does to the signal; expect to adjust it, and its simulated
faults in the test, when a real recording turns up. See Cassette Sound Format
below.

### 6. lang.js (~420 lines)
The home page's two languages, exposed as the single global `AmicoLang`.
- Loaded in `<head>`, before the body is read, unlike the other five: it sets
  `<html lang>` before anything is drawn
- `choose()` decides the language; `set()` changes it where the page stands;
  `onChange()` tells `main.js`
- `STRINGS` holds what scripts say on the page, in both languages, and `t()`
  fills in a string's values
- `MESSAGES_IT` holds the Italian for what `amico2000.js` and `tape-audio.js`
  say when they refuse something, and `message()` finds it
- It knows nothing about the machine, and neither machine file knows about
  it. See Two Languages

## Important Implementation Notes

### Performance
The display update system is decoupled from PIA writes. The emulator runs the CPU at ~1MHz, but display updates happen once per frame (60Hz). This prevents performance issues from excessive DOM manipulation.

### Interrupt Handling
The CPU properly polls for pending NMI/IRQ before each instruction fetch. This matches real 6502 behavior and is critical for correct emulation.

On this board the HLT key is what raises NMI; see HLT and the NMI Line below.
Nothing on the board itself raises IRQ: the schematic takes that line, pulled
up, to the expansion connector. A program reaches the IRQ vector with `BRK`.

### Decimal ADC/SBC
The AMICO 2000 uses an NMOS 6502. Decimal-mode ADC/SBC should follow NMOS flag
behavior: the accumulator and carry are BCD-adjusted, while Z/V and ADC's N are
derived from the underlying/intermediate binary ALU state rather than from a
65C02-style simplified decimal result. Decimal mode does **not** add an extra
cycle on NMOS 6502; base cycles are charged in `CPU6502.step()`, with only
dynamic branch/page-crossing penalties added by handlers.

### ROM Write Protection

Issue #31: the PROMs at IC9 ($FE00-$FFFF) and IC10 ($FB00-$FCFF) have no write
line, so a store into their address space is decoded and then lost. The machine
layer models this the same way it models the PIA, by registering write
callbacks over both regions in `Amico2000._protectROM()`; the generic CPU core
keeps its plain writable 64KB array and stays layout-agnostic.
`Amico2000.ROM_REGIONS` is the single place the layout is declared.

The IC10 region is protected whether or not a cassette PROM has been loaded: an
empty socket latches a store no better than a fitted chip does.

Three paths write `cpu.memory[]` directly and therefore bypass those callbacks.
Two are deliberate and must keep working: `loadMonitorROM()` and
`loadCassetteROM()` install an image the way fitting a chip does, bounded to
the size of the socket and placed by the chip's own address pins (see PROM
Image Order below). The others validate their destination against
`_findROMOverlap()`: `loadProgram()` throws, and the trapped IC10 tape LOAD
returns the routine's own `$0000 = $FF` error status because the monitor
expects a status byte, not an exception.

Both of those bound the destination before comparing it against the regions.
`CPU6502.loadBinary()` masks every write with `& 0xFFFF`, so an address above
`$FFFF` or below zero wraps back into the address space -- `$1FE00` and
`-$200` both land on `$FE00` -- while the unmasked value overlaps no region.
`loadProgram()` rejects such an address rather than masking it, because the
board has no address line above A15 and relocating a caller's data silently
would hide the caller's bug. The tape LOAD path was already bounded by its
`loadAddress + length > memory.length` check, and its address comes from two
guest RAM bytes, so it cannot leave the 16-bit space to begin with.

The vectors are the reason this is more than cosmetic. `CPU6502.reset()` reads
its new PC from `$FFFC`, so before the fix a single `STA $FFFC` left the board
with no way back to the monitor, defeating the Reset control as well. Covered
by `tests/rom-write-protection.test.js`.

Note that `amico.writeMemory()` goes through `cpu.write()` and so cannot patch
ROM either; that is intentional, and the ROM loaders remain the way to change a
PROM image from the console.

### PROM Image Order

Issue #35: a PROM image is in chip order, and for IC10 that is not address
order. A 512-cell PROM is addressed by A0-A8 alone, so the cell that answers
at an address is that address's low nine bits, not its distance from the start
of the socket. IC9 starts at `$FE00`, where those bits are all low, and its
image reads out in order. IC10 starts at `$FB00`, an odd page: A8 is high
across `$FB00-$FBFF` and low across `$FC00-$FCFF`, so the first 256 bytes of
the image answer at `$FC00` and the last 256 at `$FB00`.
`Amico2000._installROM()` places both images this way.

Before the fix the image was copied in file order from `$FB00`, which left
both documented entry points in the middle of instructions. The issue read
that as a damaged transcription. It was not: `CASSETTE_ROM` in `main.js` is
byte-identical to `amico2000_replica_PROM_IC10.bin` as ComputerHistory.it
publishes it (`docs/computerhistory-amico2000.md` has the address), and a
test pins its hash. Do not reorder the array, and do not
rearrange a `prom.ic10` file into address order before loading it.

The evidence does not rest on the loader:

- The manual prints what REG shows at each entry point, `FBBC D8` (supplement
  page 47) and `FC54 A9` (page 46). The mapped PROM shows exactly those; in
  file order it showed `0A` and `FB`.
- Followed from the two entry points, every byte of the PROM is coherent 6502
  code except ten `$FF` filler bytes at `$FCF6-$FCFF`.
- With the trap off (`amico.cassette.interceptROM = false`) the real SAVE
  routine runs to completion and writes the record drawn in the manual's
  Fig. 27, lighting the phase LEDs in the order the manual describes.
- The published dump of decoder PROM IC7 enables the IC10 socket on pages
  `$FB` and `$FC` and nowhere else.

Covered by `tests/cassette-rom-mapping.test.js`.

### Reset Semantics

Issue #30: the board has two different resets, and the emulator keeps them
apart deliberately.

`Amico2000.res()` is the RES key, and RES on the real board drives the 6502
reset line rather than being a key in the scanned matrix. The CPU vectors
through `$FFFC` to the monitor's cold-start entry at `$FE22`, so it recovers a
tight loop and an illegal-opcode halt alike with no cooperation from the
running code. The manual's own description is the evidence: RES "permette di
arrestare l'esecuzione di un programma utente in qualsiasi momento passando il
controllo del sistema al monitor". The 8255's RESET pin is on the same line, so
`res()` also clears the PIA and blanks the display.

`Amico2000.reset()` is the power-on reset: clear all 2KB of RAM, seed the
monitor's RAM-resident NMI and IRQ vectors at `$03FC-$03FF`, then call
`res()`. The seed is the emulator's own, since the board's RAM powers up with
anything: `$FE00` for NMI and `$FE30` for IRQ; see HLT and the NMI Line. It
is what `main.js` runs at startup and what the bench **Cold reset** control
invokes.

**RES preserves RAM.** This is a deliberate fidelity decision, not an
oversight. The May 1979 Sperimentare clock article has the reader press RES to
stop the program at `$0300`, then re-enter values at `$0000-$0002` and calibrate
the clock; the program is plainly still in memory afterwards. The article
prints `$0312` as the calibration address, but the listing makes it an opcode;
`$030E` is the likely intended operand (see the clock transcription). Two
consequences follow, both matching the hardware: `$03FC-$03FF` keep whatever a
program left in them,
because `$FE22` reinitialises `$FA`, `$FB` and `$FE` but not those, so the
power-on reset is the only way back from a program that trashed them; and RES
does not touch `this.running`, because pausing is a debugging facility with no
counterpart on the board.

Escape and Backspace are listed in `Amico2000.resetKeys`, checked by
`keyDown()` before the matrix and exposed through `isResetKey()` so `main.js`
can still call `preventDefault()` for them. They previously sat at shared
matrix positions, so Escape also typed AD and Backspace also typed 5. Covered
by `tests/res-reset.test.js`.

### HLT and the NMI Line

The HLT key drives the 6502's NMI line, and that is all it does.
`Amico2000.hlt()` calls `cpu.nmi()`, once for each press.

The evidence, since the key's own description in the manual says only that it
"genera una interruzione a livello CPU":

- The chapter on interrupts, supplement page 85: "il tasto di HALT (HLT)
  quando è premuto genera su NMI (piedino 6) un fronte di discesa di
  tensione".
- The CPU schematic, page 25. The HALT key closes to ground against R3, with
  C4 across it for the bounce, and goes through an inverter of IC3, a 74LS14,
  and one gate of IC4, a 74LS38 with open-collector outputs, onto the NMI
  line, which R4 pulls up. Pressed, the line falls.
- The monitor. Its NMI vector at `$FFFA` is `$FE1C`, where there is one
  instruction, `JMP ($03FC)`. IRQ and BRK go the same way through `$FE1F`,
  `JMP ($03FE)`. The ROM never writes those four bytes of RAM; the two jumps
  are its only mention of them.

So where an NMI lands is the user's business, and the manual shows two uses:

- **A program's own routine.** Store its address at `$03FC/$03FD` and end it
  with `RTI`. The manual's example on page 85 lights every digit with an 8
  for about sixteen seconds each time HLT is pressed;
  `tests/hlt-nmi.test.js` runs it as printed.
- **The monitor's routine at `$FE00`**, for which the manual has the user key
  "00 e FE rispettivamente alle locazioni 03FC e 03FD". It saves the
  registers where page 86 lists them, `$F3` A, `$F4` Y, `$F5` X, `$F6/$F7`
  the program counter, `$FD` the status and `$FE` the stack pointer, copies
  the program counter to the address display and joins the main loop. RUN
  then restores all of them and returns with `RTI`, so a halted program
  resumes exactly where it stopped. REG brings the saved address back to the
  display if the user has moved away from it.

**The power-on seed is the emulator's choice.** On the board `$03FC-$03FF`
hold whatever the RAM came up with, and HLT on a machine nobody has prepared
jumps to nowhere in particular. `reset()` seeds the NMI vector with `$FE00`,
the address the manual gives, so that HLT halts a program without the user
keying the vector first. It was `$FE30`, the monitor's main loop, chosen
before HLT did anything; that returned to the monitor and saved nothing. The
IRQ vector is still `$FE30`, so a program that runs into a `BRK` lands in the
monitor as before. Whether it should be `$FE00` too, which would make `BRK` a
breakpoint that shows where it was, has not been decided. RES preserves all
four bytes, as it preserves the rest of RAM.

One press is one interrupt: the line gives one falling edge however long the
key is held, and `haltKeyDown` keeps a repeating keyboard key from giving
more. NMI is taken at the next instruction boundary, also when interrupts
are disabled.

Two things HLT is not. It is not the page's *halted* lamp, which marks a CPU
core stopped on an opcode it does not implement; after HLT the CPU is
running the monitor and the lamp says running. And it does not stop the
emulated recorder: pressed during a real cassette routine it brings the
monitor back, as it would from any program, but the recorder is stopped only
at `$FE22`, so the tape runs on until RES.

**Single step is the same line.** The schematic has a second gate of IC4 on
NMI, through the NOR/SS slide switch: a NAND of the 6502's SYNC output, high
while an opcode is fetched, and `CS4`, the monitor PROM's chip select, low
only for `$FE00-$FFFF`. With the switch at SS, every instruction fetched
from outside the monitor pulls NMI low, so the CPU executes that one
instruction and takes the interrupt. With `$FE00` in the vector the monitor
then shows the address of the next instruction, which is what the manual
describes on page 85: RUN, and "sul display appare l'indirizzo della seconda
istruzione del programma". Each RUN after that executes one more.

`Amico2000.setSingleStep()` is the switch and `_beforeInstruction()` the
gate: before each instruction whose address is below `$FE00` it calls
`cpu.nmi()`, and the CPU core takes a pending NMI before it fetches the next
one. Things that follow from the circuit and are kept:

- The monitor is never stepped, or it could not run to show anything.
- Everything else is, the cassette PROM included, since `CS4` is the monitor
  PROM's select and no other's.
- With some other routine in the vector, that routine is stepped too, each
  of its instructions interrupting it again. The manual has the user store
  `$FE00` first.
- Moving the switch to SS under a running program stops it, as HLT does.

One thing is the emulator's: a trapped cassette LOAD or SAVE is done before
anything is fetched, so it is not stepped. And SS is not the bench **Step**
button, which advances a paused CPU by one instruction of whatever is
running, the monitor included.

The page's switch is `#ss-switch`, a button with `role="switch"`; `main.js`
puts the class `ss` on its cell, which moves it and the printed slot. The
page always opens at NOR.

Covered by `tests/hlt-nmi.test.js` and `tests/single-step.test.js`, the
second of which follows the manual's walk-through on pages 85 and 86.

### Keyboard Scanning
The ROM's TESTAS routine expects specific I/O patterns. The keyboard matrix scanning in amico2000.js matches port B values (1, 3, 5) that the ROM uses to scan rows.
Keyboard input is active-low: unpressed columns read high, and a pressed key clears the corresponding Port A bit.

The key positions in `Amico2000.keyMap` are derived from the monitor's GETKEY
routine at `$FF57-$FF7D`, which returns code = 7 x row + (6 - bit). The 21
cells therefore hold 21 distinct codes: the hex digits `$00-$0F` and the five
function codes the main loop dispatches at `$FE5B-$FE6D` (`$10` AD, `$11` DA,
`$12` increment, `$13` RUN, `$14` REG). No two keys share a cell. An earlier
hand-built table did share cells and was wrong for `0`, AD, RUN and REG;
`tests/keyboard-matrix.test.js` checks every key against the ROM decode and
drives the keypad workflows end to end, so change the table only with that
test passing.

The `archived/` directory is kept for historical safekeeping only. Its review
notes and handoff files can provide context, but they are not ongoing project
guidance. Treat `AGENTS.md` and the current source files as authoritative; in
particular, `archived/GEMINI3.md` contains a keyboard matrix table that matches
neither the current implementation nor the ROM's decode.

### ROM Data
The MONITOR_ROM array in main.js contains the actual monitor ROM bytes, and
`main.js` fits it at startup, so a user never has to load one. When loading ROM
files:
- `prom.ic9` replaces the monitor at $FE00 (Monitor ROM, 512 bytes). A board
  cannot run without a monitor, which is why one is always fitted; a file is
  only for trying a different image
- `prom.ic10` fits the socket at $FB00-$FCFF (Cassette ROM, 512 bytes). It
  was optional on the real machine, part of the cassette interface, and
  `main.js` fits the embedded `CASSETTE_ROM` at startup because the board the
  page draws has that interface. The file is in chip order, so its first half
  answers at $FC00 and its second half at $FB00; see PROM Image Order above.
  Node tests built on `tests/helpers/machine.js` start with the socket empty,
  as before, and fit it themselves where they need it
- A `.wav` file is read as a sound recording of a cassette, and the programs
  on it are imported for the trapped LOAD; see Cassette Sound Format below.
  The extension is tested first, because any other name containing `tape` is
  taken for an `.amtape` image
- Other .bin files load as programs at $0000

**Note on hardware PROMs**: The original AMICO 2000 used `prom.ic6` and `prom.ic7` for address decoding logic (generating chip-select signals). These are **not needed** in the emulator as address decoding is implemented in software through the CPU's memory read/write callbacks.

### Cassette Interface Reference

The Sperimentare supplement, Chapter V ("L'uso del registratore a cassette"),
documents the original cassette workflow:

- `IC10` is the cassette management PROM at $FB00-$FCFF.
- The user jumps to PC $FC54 for cassette LOAD and PC $FBBC for cassette SAVE.
- LOAD parameters: $0000 = program identifier, $0001 = desired load address low
  byte, $0002 = desired load address high byte. If $0002 is $FF, the routine
  loads at the address recorded on tape.
- SAVE parameters: $0000/$0001 = start address, $0002/$0003 = end address,
  $0004 = program identifier.
- The documented tape record structure is leader, start byte, identifier, load
  address, byte count, program data, checksum, trailing leader.
- The original analog tape rate is about 300 bit/s, with a 1KB program taking
  roughly 45 seconds including leader/trailer sections.
- Physical recorder wiring uses `GND`, `IN` to the microphone input, and `OUT`
  from the speaker output.

The PROM itself fills in what the manual leaves out. These were read from the
IC10 listing once the image was mapped correctly (#35), and the SAVE half is
checked by running the real routine in `tests/cassette-rom-mapping.test.js`:

- Leader and trailer are 256 zero bytes each, and the start byte is `$A5`.
- The header is the identifier, the load address low then high, and a 16-bit
  count low then high. The count is the end address minus the start address,
  one less than the number of data bytes.
- Data is not in ascending order, because the routines count `Y` down to
  zero. A full 256-byte page goes out as offset 0 followed by offsets `$FF`
  down to 1; the last, partial page goes out from its highest offset down to
  1 and then offset 0. LOAD stores the bytes the same way round.
- The checksum is the 8-bit sum of the start byte, the header and the data.
- The four phase LEDs of the manual's Fig. 26 are Port A bits 0-3: D4 leader,
  D5 text, D6 recording, D7 reading. The supplement's schematic of the
  display, keyboard and cassette interface (page 28) shows the wiring. Each
  LED runs from +5 V through a resistor, R34 to R37, to an open-collector NAND
  gate of IC21, a 74LS38. Each gate has one Port A line, PA0 to PA3 for D4 to
  D7, on one input and Port B bit 7 on the other, which all four share. An LED
  is lit while both are high.
- The PROM agrees with that schematic. Every LED pattern it puts on Port A
  goes out with Port B bit 7 set: `$87` in LOAD, `$86` and the `$E1`/`$A1`
  waveform values in SAVE. The patterns are `$89` and `$8A` in LOAD, leader or
  text together with reading, and `$05` and `$06` in SAVE, leader or text
  together with recording. LOAD only pulses the LEDs, for about 0.7 ms at
  each refresh, between spells of reading the tape with Port A as an input.
- The monitor never sets Port B bit 7, so by that schematic all four LEDs are
  dark while it idles, which is how the home page draws them. The machine
  layer models them as wired (#20) and the page lights them, so they show
  whenever the real routines run; a trapped LOAD or SAVE never touches them.
  A user's program can light them as well; see The LEDs D4-D7 Under a
  Program.
  One photograph of a powered board shows D7 lit with the monitor idle. The
  schematic does not account for that, and it is not modelled.
- The same schematic has the 74LS145's inputs on PB1-PB4, its outputs 0-2 on
  the three key rows and its outputs 4-9 on the six digit transistors, as the
  display and keyboard code assume. Output 3 goes nowhere, which is why the
  monitor can park Port B at `$07` after each keyboard scan. The key matrix
  is drawn with its columns on PA0-PA6, pulled up by R8-R14, and its keys
  where `keyMap` has them; the schematic calls REG's key `PC`.
- Tape input is sampled on Port A bit 7. LOAD switches Port A between output,
  to set the LEDs, and input, to read the tape, with 8255 control words `$89`
  and `$99`.

The emulator has the cassette twice over, and
`amico.cassette.interceptROM` chooses. Set, which is the default and the
page's **Cassette: Instant**, it traps the IC10 entry points and reads or
writes its own store of tape records at once. Clear, the page's **Real
time**, the routines themselves run, against the interface circuit and a
recorder, in the time the board takes; see Cassette Sound Format below. Both
work on the same store, `amico.cassette.tapes`, and a record enters or leaves
it as an `.amtape` image or as sound. `docs/amtape-format.md` is the
reference for the `.amtape` file (#19), and `tests/amtape-format-doc.test.js`
holds its example and its table to the code; change the two together.

What the traps leave behind (issue #41): what the routines leave behind. The
real SAVE never writes to page zero and has no error status, so a trapped
SAVE writes nothing to the machine's memory either, whether it saves or not;
its parameters at `$0000-$0004` survive, and a second SAVE needs nothing keyed
again. A trapped LOAD that works writes the program and leaves `$0000-$0002`
alone. The outcome of either goes to the page through `amico.onCassetteTrap`,
which is how a refused SAVE is made known.
`tests/cassette-trap-parity.test.js` runs the same keys through a trap and
through the real routine and compares the two boards. It also pins the
differences that remain, each on purpose:

- A trapped LOAD that cannot be done returns at once with `$FF` in `$0000`.
  That is the emulator's convention. `$FF` there is the only status either
  real routine writes, for a checksum that does not match; asked for a
  program that is not on the tape, the real LOAD searches until RES, and a
  trap has no tape running.
- A trapped LOAD refuses a destination that overlaps a ROM (#31). The real
  one stores every byte, the ROM takes none, and nothing is reported.
- A trapped SAVE keeps the last byte of a block the PROM's fault loses, and
  refuses the whole `$0000-$FFFF` range (#23), of which the real routine
  saves the first page. See Cassette Sound Format.
- The traps do not touch the routines' workspace at `$E7-$F1`.

Return convention (issue #24): the IC10 routines do not end in `RTS`. They exit
with `JMP $FE22`, the monitor's reset entry and the `$FFFC` vector target, whose
preamble runs `LDX #$FF / TXS` at `$FE28-$FE2A` and reinitialises `SP` to `$FF`.
The traps therefore set `PC = $FE22` without unwinding any `JSR` frame, which
matches the original ROM and cannot leak stack space. Do not add a `pull16()`
there: the ROM also re-enters LOAD with `JMP $FC54` (no frame pushed), so an
unconditional pull would corrupt the stack on that path. Protected by
`tests/cassette-trap-stack.test.js`.

### Cassette Sound Format

Issue #20: what the cassette interface puts on tape, as far as the PROM and
the supplement's schematic (page 28) fix it. `tape-audio.js` implements it.

**No recording of a real tape has been seen.** Everything here is read from
the PROM listing and the schematic, or measured by running the real routines
in the emulator. What a cassette deck does to the signal is not known and is
not described here.

Output, from SAVE:

- `REG IN`, the recorder's microphone input, hangs on Port B bits 5 and 6
  (8255 pins 23 and 24) through R39 and R40, 1.8 kOhm each, with R41, 100 Ohm,
  to ground. Equal resistors make three levels: both lines low, one high,
  both high.
- `$FB5A` makes one pulse: `$00` to Port B, a delay, `$E1`, the same delay,
  `$A1`. That is low for 87 cycles, high for 87, then back to the middle
  level, where the line rests between pulses.
- `$FB95` sends a byte, most significant bit first, with no start or stop
  bits. Every bit cell begins with a pulse. A 1 has a second pulse 1491
  cycles after the first; a 0 has none. A cell is 3008 to 3010 cycles, so
  about 332 bit/s, and bytes are 28 cycles further apart in the leader and 56
  in the header and text.
- Before the first pulse the line is at the low level, not the middle one:
  nothing sets bit 5 until then. The monitor leaves it low as well.

Input, to LOAD:

- `REG OUT`, the recorder's speaker output, goes through IC19, an LM358, and
  one gate of IC20, a 74LS132 wired as an inverter, to a latch made of two
  more gates of IC20. Port A bit 7 (pin 37) reads the latch. Port B bit 0
  (pin 18) low clears it, which is what `$FB00` does.
- `$FB38` reads a byte. For each bit it waits for the latch to set, flashes
  the LEDs, clears the latch about 0.78 ms after the pulse, waits until about
  2.4 ms after it, and takes the latch as the bit. `$FC54` shifts bits in the
  same way until the last eight are `$A5`.
- So only when pulses arrive matters, not their height or shape. Against the
  real SAVE routine's own signal, the real LOAD routine still loads with the
  tape's timing scaled by anything from 0.82 to 1.54.
- Which half of a pulse sets the latch depends on the recorder's polarity.
  A pulse has both halves, so either works, and the tests run both.

**The PROM loses the last byte of some blocks.** When the header's count has
a low byte of zero, that is when the block is one byte longer than a whole
number of pages, SAVE takes the last byte from one page too low, and LOAD
stores it one page too low: `DEC $E9` at `$FC36`, and at `$FCD6`, undoes an
`INC $E9` that on this path never happened. A 257-byte block sends its first
byte twice and its last never. A 1-byte block sends the byte 256 below it.
The checksum agrees on both sides, so nothing reports it. Confirmed by
running the routines. A second fault: `DEC $EB` / `BMI` at `$FC2C` ends a
block of more than `$8100` bytes after its first page. No block on a 2KB
board is that long, but the routine can be asked: run for real, a SAVE of
`$0000-$FFFF` records `$0000-$00FF` and nothing more.

How the emulator treats that:

- The sound codec follows the PROM. A recording decodes to what the real LOAD
  routine would have left in memory, 256 bytes for a 257-byte block, with a
  `note` on the record. `encodeWav()` writes what the real SAVE routine would
  send, and refuses a 1-byte block, whose byte on tape is not in the record.
- The traps do not. A trapped SAVE and LOAD keep every byte, and so does an
  `.amtape` file. It is one of the differences between the traps and the
  real routines that were kept on purpose; the list is under Cassette
  Interface Reference.

What the page does with it: **Load ROM or tape** reads a `.wav` recording,
uncompressed and at most 64 MB, and `debug.saveTapeAudio()` writes one. The
decoder takes tape speed from the leader, accepting 0.6 to 1.6 times the
board's own, and needs 64 zero bits before the `$A5`.

**Running the routines for real.** With `interceptROM` clear and a recorder
connected, nothing stands in for the PROM:

- The board side is in `amico2000.js`: the latch on Port A bit 7, the output
  level, and the LEDs, each as the schematic has it. `takePhaseLEDs()` gives
  the share of time each LED was on, because the routines switch them faster
  than a frame: 97% for SAVE's pair, 24% for LOAD's.
- The recorder is `AmicoTapeAudio.createRecorder()`. Its tape is pulse times,
  not sound: when a pulse arrives is all the latch responds to. Playing, it
  lays out the cassette's programs in order, each as SAVE would have written
  it, after half a second of blank tape. Recording, it notes the board's
  pulses and, when stopped, reads the programs out of them with
  `decodePulses()`; they go onto the cassette as the latest save.
- The board works the recorder's motor, which on the real machine is the
  user's job: `$FC54` rewinds and plays, `$FBBC` records, and `$FE22`, where
  both routines end and RES leads, stops. That is an emulator convenience.
  Every LOAD therefore starts at the beginning of the tape.
- How long they take, measured with the routines themselves. A SAVE is about
  12.5 s plus a second for every 41 bytes: the two leaders are 256 bytes
  each, and a byte is some 24 ms. A LOAD of the first program on the tape is
  about 6.8 s plus the same second for every 41 bytes. It is the shorter
  because `$FC54` leaves for the monitor when the checksum is read, and does
  not sit through the closing leader, as the manual has it: "Quando la
  lettura del testo è finita sul display appare 0000 01" (page 46). Each
  program ahead of the one asked for adds the whole of its length on the
  tape, its half second of blank included. The page and the guide once gave
  thirteen seconds for LOAD and SAVE alike; `tests/tape-recorder.test.js`
  now holds what the guides say to what the routines take.
- Run this way the emulator has the PROM's behaviour where the traps differ:
  a LOAD for a program that is not on the tape waits until RES, a LOAD over a
  ROM loses bytes without a word, and the last byte of a block one byte
  longer than whole pages is lost.
- A real 8255A clears its output latches when a mode word is written,
  according to its data sheet (`docs/8255-data-sheet.md`). The emulator does
  not. Nothing in either ROM depends on it: each writes the ports afresh
  after every mode word.

Covered by `tests/tape-audio.test.js`, `tests/cassette-tape-records.test.js`,
`tests/cassette-interface.test.js` and `tests/tape-recorder.test.js`.

### The LEDs D4-D7 Under a Program

The four LEDs are not the cassette's alone. Any program can light them, on
the board as far as the schematic shows and in the emulator as a fact, with
**Cassette** at either setting.

- **What the manual says.** Only the cassette use. The assembly instructions
  for the interface, supplement page 43: the LEDs "servono a sapere cosa sta
  accadendo quando è in funzione il registratore". Fig. 26, page 45: they
  "servono a controllare le operazioni di lettura e scrittura del nastro".
  No other use was found in the supplement's text.
- **What the wiring allows.** The schematic on page 28 connects them to
  nothing of the cassette circuit: an LED is lit while Port B bit 7 and its
  own Port A line are both high (the wiring is under Cassette Interface
  Reference), and Port B bit 7 does nothing else on the board.
- **In the emulator.** `_phaseLEDsNow()` is worked out after every write to
  the 8255, whatever `interceptROM` is, and the page draws the result every
  frame. Earlier versions of this file and of the page's tooltips said the
  LEDs light only with **Cassette: Real time**. That was wrong. What is true
  is narrower: the monitor never sets Port B bit 7 and neither do the traps,
  so with **Instant** nothing lights them unless a program does.
- **Keeping the displays dark.** Port A's lines are the displays' segments
  too, so a program sets Port B to `$87`: bit 7, and PB1-PB4 at 3, the
  74LS145 output that goes nowhere, so no digit and no key row is selected.
  It is the value the PROM's LOAD routine uses. Bit 0 high leaves the tape
  latch alone, and bits 5 and 6 low leave `REG IN` where the monitor leaves
  it. To show digits and LEDs together a program has to take turns between
  them, as the monitor does between digits.
- **Port A's direction.** While Port A is an input its lines are held high
  by the key columns' pull-ups, so with Port B at `$87` all four LEDs light
  whatever was written. A program therefore writes the mode word `$89`
  first. A real 8255A clears its output latches at a mode word
  (`docs/8255-data-sheet.md`), which the emulator does not, so the order
  that works on both is the mode word and then the two ports.
- **The monitor takes the ports back.** After HLT, or single step, the
  monitor is scanning the displays and keys, never with bit 7 set, so the
  LEDs are out. RUN resumes the program but does not restore the ports: a
  program that set them once stays dark, and one that sets them each time
  round lights again.

The guide prints two programs for it, one that lights a chosen pattern and
one that counts in binary. `tests/user-leds.test.js` runs both as printed,
read out of `guide.html`, with the traps on; it fails if the LEDs are ever
made to depend on the cassette setting. They were also keyed in on the page
in headless Chrome, on the board as drawn and in the handheld layout.

Not tried on a real board. That the lines are free is read from the
schematic and from what the PROM does with them, not observed.

### Board Artwork

The home page draws the board as it is, not as a diagram: every part in
`index.html` stands where a photograph of a surviving board has it.

**The photographs are private.** Two were used: *unit A*, powered and taken
at an angle, for how lit things look; and *unit B*, unpowered and taken from
straight above, for layout, colours and legends. They belong to private
individuals and are kept outside the repository. Never add them, or crops of
them, to the repository, and never write an owner's name anywhere: not in a
file, a commit message, the changelog, a log or a comment. Refer to them only
as unit A and unit B. Measurements and colour samples taken from them are
fine, and are what the comments cite.

**Geometry.** The board is 300 x 100 mm, which the pin pitch of the two
40-pin packages on unit B confirms. `.pcb` is therefore 3 to 1, and inside it
one SVG, `.board-art`, has a `viewBox` of `0 0 300 100`, so its coordinates
are millimetres: 1% of the board's width is 3 mm and 1% of its height is
1 mm. Its groups stack in this order:

- `.copper`: the traces, vias, pads and one pour that show through the mask.
  The runs are in the right places and of the right number; the routing
  inside them is simplified and what lies under a part is guessed.
- `.holes`: the six unplated mounting holes.
- `.silk`: the printed legends and outlines, in the board's yellow ink.
- `.parts`: every component, one commented group per part.

What a person operates or watches change is HTML laid over that drawing and
placed in percent of the board: the keys (`.keyfield`), the displays
(`#display`, drawn by `display.js`), the LEDs (`.led-bank`) and the slide
switch. The two key blocks are placed from the bottom edge.

The path data in `.copper` and `.parts` was generated once, from a table of
measurements kept with the photographs, and pasted in. There is no build
step: the SVG in `index.html` is the source, and it is edited by hand.

**What is measured, what is read and what is guessed.** Positions and sizes
are measured on unit B. Part identities are from the manual's parts list, and
markings are given only where they can be read on unit B. The comments beside
the parts say where neither was possible: IC2 and IC5 are taken as the two
74LS00 from their place in the list; the 14-pin parts drawn as IC8 and IC21
are guesses; which RAM is IC11 and which IC14 is not known; and the 6502's
marking is not copied, because unit B's cannot be read. The coloured stickers
on IC9, IC10 and IC7 and the paper label on IC6 are unit B's own labelling,
not the factory's. The silkscreen is yellow on unit B and looks white on
unit A; the page follows unit B.

**What the scripts depend on.** `main.js` looks up `btn-run`, `btn-step`,
`btn-reset`, `btn-load`, `led-run`, `reg-pc`, `reg-a`, `reg-x`, `reg-y`,
`reg-sp`, `reg-flags`, `rom-file`, `display`, `led-d4` to `led-d7`,
`tape-status`, `ss-switch` and `handheld-panel`, every `.key` by its
`data-key`, and every `.look-btn` and `.tape-btn`. For the handheld layout it
also finds the four parts it moves as direct children of `.pcb`:
`.part.display-block`, `.part.led-bank`, `.part.keyfield.func` and
`.part.keyfield.hex`. Keep those when redrawing. A pressed key is styled through the
inline `translateY` that `main.js` sets on its button, for mouse, touch and
keyboard alike, so the keyboard handling does not need to know about the
artwork. `main.js` also finds the drawing of the displays as `#display svg`,
to give it its label in the page's language. `lang.js` finds every element
with a `data-set-lang`, a `data-it-title`, a `data-it-aria-label`, a
`data-it-content` or a `data-it-text`; see Two Languages.

**Lettering.** The page's CSP allows no downloaded font and no `data:` URI,
so every legend uses a stack of system faces. Each legend's `textLength` pins
its width, so a substitute face fills the same space; letter shapes still
vary between systems.

**What is drawn but does nothing.** Of the things a person operates,
nothing: the NOR/SS switch is single step (see HLT and the NMI Line). The
four LEDs D4-D7 work: the real cassette routines light them, which is the
**Cassette: Real time** setting, and so can a program of the user's own, at
either setting (see The LEDs D4-D7 Under a Program). `main.js` gives
an LED the class `on`, the lit look taken from unit A, or `on dim` for
LOAD's quarter-time flashing, a look that is a guess, since no photograph
shows a board during LOAD. The lamp beside the registers is the emulator's own and has
three states: running, stopped, and halted, the last when the CPU core has
stopped itself on an opcode it does not implement.

**Checking a change.** Nothing automated looks at the drawing. It was checked
by serving the page, screenshotting it in headless Chrome and putting the
same window of the photograph beside it at the same scale, driving Chrome
over the DevTools protocol in real time (How to Verify in `NextSession.md`):
scripts evaluated through the protocol are not subject to the page's CSP, and
`requestAnimationFrame` fires normally, so the page is checked as served. `tests/display-renderer.test.js` covers the display's
geometry and nothing else on the board.

### Handheld Layout

On a phone held upright the board cannot be both whole and usable: it is
three times as wide as it is tall, and at 390 px its keys would be 16 px. On
a tablet held upright it is whole but small: at 834 px, an iPad Pro 11", its
keys are 32 px and its displays 188 px across. So on such a screen, and only
there, the page rearranges itself.

- **When.** `HANDHELD_QUERY` in `main.js`:
  `(max-width: 1100px) and (orientation: portrait) and (pointer: coarse)`. The
  coarse pointer is what keeps it off every desktop: a mouse is a fine
  pointer, so a desktop window of any shape keeps the board as drawn. A phone
  or tablet turned to landscape keeps it too, since the board then fits the
  width with keys of 45 px or more.
  - The width was 640 px at first, which left tablets out on the reasoning
    that any screen the board fits should keep it. On 2026-11-23 the owner
    found the keys and displays too small on an iPad Pro 11" held upright,
    and the same iPad in landscape fine. 1100 px takes in every iPad held
    upright, the widest being the 13" Pro at 1032. In the panel the keys are
    then 94-114 px, held to 9% of the screen's height by the key pitch, and
    the displays stop at their `max-width` of 30rem.
- **What.** `setupHandheldLayout()` moves the four parts a person works, the
  displays, the four LEDs, the function keys with the NOR/SS switch and the
  hex keys, out of `.pcb` into `#handheld-panel`, in that order, above the
  maker's mark at the panel's foot, and sets `handheld` on `<html>`. Each
  block keeps its own arrangement from the board; the function keys sit above
  the hex keys, which are at the bottom, nearest the thumb. In the drawing
  each part is replaced by `pictureOf()` it, a clone with no id, `data-key`
  or `title`, marked `inert` and `aria-hidden`, so lookups by id and by
  `data-key` still find only the live part and the clones never get
  handlers. The drawing then shrinks to the screen's width as a picture of
  the whole board, with a caption. Turning the phone back moves every part to
  exactly where it came from. The live elements are the same throughout, so
  their handlers and the references `display.js` holds stay valid.
- **Pictures are static.** They are taken at startup, whatever the screen,
  so they show the board unlit with every key up, and any inline press style
  is stripped from them. Only the switch follows the real one:
  `setupSingleStepSwitch()` sets its class on every `.switch-cell`. Focus is
  given back to a moved element that had it.
- **Touch.** In the handheld layout a key presses when the finger lifts
  having moved less than `TAP_SLOP_PX`, not when it lands, because the keypad
  fills most of the screen and a swipe that starts on it has to scroll the
  page. On the board as drawn a key still presses on touch, as before.
- **Browsers.** It needs container query units and `svh`: Safari 16, Chrome
  108. Older ones get a broken keypad in the handheld layout only.
- **Styles.** One block in `index.html` between `/* handheld:begin */` and
  `/* handheld:end */`. Every rule in it is under `html.handheld`, apart from
  the one that hides the panel and the caption everywhere else, and
  `tests/handheld-layout.test.js` fails if a rule escapes. The parts were
  sized in `cqw` of the board; in the panel `cqw` means the panel's width, so
  every such length is restated in `--u`, the length one board `cqw` has to
  stand for to keep the parts in proportion to the larger keys. Key pitch is
  `min(19.5cqw, 9svh)`: four keys across the panel, and short enough that the
  title, displays and every key fit on the first screen with the browser's
  toolbars showing. The block also holds the language link's two-letter form
  (see Two Languages), which sits in the corner the title leaves free and
  adds nothing to the height of the first screen.
- **The desktop is untouched**, and was checked to be: screenshots of the
  page at 1400, 1024, 800, 700 and 600 px wide, the last two in portrait,
  were identical pixel for pixel before and after the change.
- **Checking it.** In headless Chrome with
  `Emulation.setDeviceMetricsOverride` (`mobile: true`) and
  `Emulation.setTouchEmulationEnabled`, which makes `(pointer: coarse)`
  match; without touch emulation the layout stays off. Tap keys with
  `Input.dispatchTouchEvent` and read the display, and change the metrics to
  landscape and back to check the move both ways. Then on a real phone: a
  headless browser is not one. The owner has done so: on 2026-11-22 the page
  was opened in Safari on an iPhone 17 Pro held upright and looked right,
  with everything working, and on 2026-11-23 in Chrome on a OnePlus 7T, an
  Android phone, with the same result. Tablets held upright were checked in
  emulation only, at 744, 834 and 1032 px, when they were brought into the
  layout; no tablet has been tried on a real device since.

### Two Languages

The site is in English and in Italian. The owner asked for it on 2026-11-22:
a large part of the people who would come to it worked on these boards
around 1980, and many of them do not read English. The rule is in the Agent
Operating Contract: what the public reads is in both, and the documents are
in English only.

**Which language a visitor gets.** `AmicoLang.choose()`, in this order: the
one the address asks for, `?lang=it` or `?lang=en`; the one chosen before,
kept in `localStorage` under `amico2000.lang`; the first of the browser's
languages that the page has; English. So an Italian browser opens the page in
Italian with nothing to press. A language that came only from the browser is
not stored. One that came from the address is, because someone sent a link
that names a language wants it next time too.

**Where the words are.** Five places, and a new piece of text belongs in
exactly one:

- **Text of the home page**: in `index.html`, twice. An element marked
  `data-lang="en"` and, straight after it, the same thing marked
  `data-lang="it" lang="it"`. One style rule, under "Two languages", hides
  whichever is not the language of `<html lang>`. Nothing is swapped by
  script, so the page never draws in one language and then the other. A
  short label is two `<span>`s inside its element; a paragraph is two `<p>`s.
- **Tooltips and labels for a screen reader**: attributes cannot be doubled,
  so the English is the attribute and the Italian is beside it as
  `data-it-title`, `data-it-aria-label` or, on a `<meta>`, `data-it-content`.
  `lang.js` puts the right one in place and keeps the English as
  `data-en-...` so that it can come back. `data-it-text` does the same for an
  element's whole text, which is how `<title>` is done.
- **What a script says on the page**: `STRINGS` in `lang.js`, both languages
  in one entry, `{name}` for a value. `main.js` asks with `AmicoLang.t()`.
  Something that stays on the page, such as the tape's status line, is kept
  as a function and worded when it is read, so a change of language changes
  it too.
- **What the machine says when it refuses something**: `amico2000.js` and
  `tape-audio.js` make these in English, in an `Error`'s message or in a
  decoded recording's `problems` and `note`, and their tests pin the words.
  They are not given a language. `MESSAGES_IT` in `lang.js` has, for each, a
  pattern that matches it whole and a function to the Italian, and
  `AmicoLang.message()` applies it. A message it does not know is shown in
  English. When adding or rewording a message in either machine file, add or
  change its entry, and make the message in `machineMessages()` in
  `tests/languages.test.js`.
- **The guide**: two files, `guide.html` and `guida.html`, with the same
  sections, the same ids and the same listings. Change them together.

**Changing language reloads nothing**, because a reload would clear the
machine's memory. `AmicoLang.set()` changes `<html lang>`, swaps the
attributes and calls the listeners; `main.js` listens to reword the Run
button, the switch's tooltip and the displays' label.

**The link** is `.lang-switch`, one word in the page's top right corner, in
the language it leads to. It is positioned against the page and takes no
room. In the handheld layout it is two letters, `IT` or `EN`, from its
`data-code`, because the title leaves no room for a word; that rule is in the
handheld block. The guides link to each other with an ordinary link, and the
Italian guide's links back to the emulator carry `?lang=it`.

**The Italian.** It uses the words of the Sperimentare supplement where the
supplement has them. Look a term up in
`docs/manual-extraction/sperimentare-1980-05-supplemento-text.md` before
choosing one of your own:

| English | Italian | Where the manual has it |
| --- | --- | --- |
| board | scheda | also "piastra" |
| key, hex keys, function keys | tasto, tasti esadecimali, tasti funzionali | Tabella 6 |
| the displays; the address digits | i display; display indirizzi | Tabella 6; "display dati" for the other two is ours, by analogy |
| memory location | locazione di memoria | throughout |
| single step | passo singolo | 'in "Single Step" o passo singolo' |
| the NOR/SS switch | interruttore | "l'interruttore SS" (page 25), "l'interruttore del single step" (page 85), "interruttore unipolare" in the parts list (page 33); once "deviatore" (page 14); never "commutatore", which the site had at first |
| loop | loop | "in questo Loop il programma gira su se stesso" (page 85); "ciclo" is not the manual's word for it |
| interrupt | interruzione | "genera una interruzione a livello CPU" |
| cassette recorder; tape | registratore a cassette; nastro | Chapter V |
| leader; text | coda; testo | Fig. 27, and "i LED relativi alla coda" |
| LOAD; SAVE | lettura; registrazione | "lettura del nastro", "registrazione sul nastro" |
| identifier; load address | identificatore; indirizzo di caricamento | Fig. 27 |
| the program's number | numero del programma | "Numero del programma da caricare" (page 46); the identifier by its other name, "Identificatore (N. del programma)" in Tabella 12 |
| the LOAD routine; the SAVE routine | programma di lettura; programma di registrazione | "indirizzo di partenza del programma di lettura (indirizzo FC54)" (page 46); "l'inizio del programma di registrazione" (page 47) |
| low byte, high byte of an address | parte bassa, parte alta | the table of LOAD's parameters (page 46) |
| checksum | checksum | "parola di controllo (checksum)" |
| microcomputer | microelaboratore | throughout |

Key names stay as printed on the caps, and LOAD and SAVE stay as names. The
voice is the manual's "noi", described below: "premiamo RES", "il nostro
programma". Never "tu" or "Lei"; a button's own label is the usual
imperative ("Avvia", "Carica"). The emulator's controls are "pulsanti", so
that "tasto" stays a key of the board, and the panel that holds them is
"Comandi dell'emulatore". The Italian guide quotes the page's labels and
status words; `tests/languages.test.js` holds the ones it quotes to what the
page says.

**The manual's style and tone, not only its words.** The owner asked on
2026-11-22 for the Italian to be "written in the same style and tone of the
original documentation". No reason was given; the one that fits is that the
people the Italian is for learned the machine from the supplement.

- **Write from the manual's sentence.** For most of what the site says about
  the board the supplement has a sentence of its own: keying a byte, running
  a program, LOAD's and SAVE's parameters (pages 46 and 47), what RES
  recovers from, reading the registers after a halt (pages 85 and 86). Find
  it and build on it. The alert after a recording is read was made that way,
  from "scriviamo 04 nella locazione di memoria 0000 e FF [...] nella
  locazione di memoria 0002", and so was the step after HLT in the guide.
- **How it sounds.** Plain and patient, a teacher beside the reader. Its
  turns of phrase are "A questo punto", "basta premere", "per far partire il
  programma". It keeps the English it already has, such as loop, routine,
  byte and Program Counter, and adds none.
- **It says "noi".** The manual does at the keys what it describes, with
  its reader: "Premiamo quindi i tasti", "Per eseguire il programma non ci
  resta altro che indicare al nostro Amico 2000 l'indirizzo nel quale
  inizia" (page 29), "scriviamo 04 nella locazione di memoria 0000" (page
  46). Asked whether the site should, the owner answered on 2026-11-22: "I
  like the 'noi' of the original guide. I want that here too." So wherever
  the site teaches or walks through something it is "noi": the whole of
  `guida.html`, the notes under the board, the LEDs' tooltips, and the
  how-to line of the alert after a recording is read. In practice:
  - A step is "premiamo", "introduciamo", "selezioniamo"; what follows it
    is "vediamo che", "appare", "apparirà"; the reader's program is "il
    nostro programma", and the machine once or twice "il nostro AMICO 2000".
  - A caution is the author's "noi" or no person at all, as in the manual:
    "Avvertiamo che" ("Avvertiamo infine che se carichiamo un numero di
    programma non previsto sul nastro..."), "Consigliamo", "Attenzione:",
    "Si badi che", or "va lasciato", "non va fatto".
  - The manual mixes in the impersonal "si" ("Si porta ora sul display
    indirizzi la locazione di partenza") and so may the site.
  - "Voi" is kept for the two places where the page turns to the reader at
    the moment something has to be done: a prompt on the tape's status line
    ("Premete RES.") and the advice in an error about a file of the
    reader's own ("Tagliatela in pezzi più corti"). The manual does the
    same about the reader's own recorder and cassettes: "spegnete il
    registratore", "Cambiate ora cassetta mettendone una delle vostre".
  - The English is "you" throughout and is not changed by this.

  `tests/languages.test.js` fails if a "voi" comes back into the guide or
  onto the home page.
- **English carried across word for word** is what a review of 2026-11-22
  found, and each of these was on the site. A passive participle turned
  into "si" with its "da" left hanging: "si accende [...] da un vostro
  programma". "Vi" for "there" or "to it", in a text that then said "voi" to
  its reader: "RES vi rimedia". A verb whose first meaning is another:
  "comprendete" for
  "include". An idiom word for word: "Guardatevi intorno". A loose English
  made exact and false: "the phase LEDs lit" as "i quattro LED accesi".
  Read the Italian on its own, as a reader with no English beside it does.
- **A reviewer's Italian points at the passage; it is not the text to
  use.** Check what it says is wrong against the code or the page, then
  write the replacement from the manual.

**Not translated, on purpose:** the masthead, which is the machine's name;
the legends on the board and on the keys; register names; and everything in
the browser console.

**Two things to watch when adding text.**

- Italian is longer. "in esecuzione" for "running" ran into the program
  counter beside it, and the CPU line has two columns in Italian for that
  reason. Look at a new label in both languages.
- A paragraph and its twin are siblings, so `:first-child`, `:last-child`
  and `p + p` no longer mean the first, last or next paragraph a reader
  sees. The last English paragraph of About this board is the one before
  the last child; a rule beside `.about p:last-child` says so. The English
  page grew 13 px before that rule was added.

**One address serves both languages.** A search engine and a link preview
read the page as written, which is English; `lang.js` changes the title and
the description for a visitor, not for them. The Italian guide has its own
address and its own Italian head. A home page in Italian at an address of
its own would need a second copy of the board drawing, kept in step by hand,
and was not done.

**Checking it.** `tests/languages.test.js` fails if a sentence, a tooltip,
a script's string or a machine's message exists in one language only, and
runs `lang.js` against a stand-in for the page. `tests/guide-languages.test.js`
holds the two guides to one skeleton. Neither can tell whether the Italian
says what the English says; that has to be read. In headless Chrome,
`Emulation.setUserAgentOverride` with an `acceptLanguage` of `it-IT` makes a
browser Italian. When a change touches the page's layout, compare the English
page with the page before the change: same boxes, same height.

The Italian was written on 2026-11-22 and read by the sessions that wrote
it. The same day a second agent, Codex, reviewed it at the owner's request;
what it found was checked and put right, and the whole was read again
against the manual, which found the switch's name and a few sentences more
(the log of that day, A Second Agent's Review of the Italian). No person is
known to have read it through when this was written, the owner included.

## Development Guidelines

### Code Comments
All new code and code changes should include clear, meaningful comments:

**What to comment:**
- **Why, not what**: Explain the reasoning behind implementation choices, not what the code obviously does
- **Hardware behavior**: Document how the code maps to real AMICO 2000 or 6502 hardware behavior
- **Non-obvious logic**: Clarify complex algorithms, bit manipulations, or timing-critical code
- **Edge cases**: Explain handling of special cases or boundary conditions
- **Performance choices**: Note why a particular approach was chosen for efficiency

**What NOT to comment:**
- Self-explanatory code (e.g., `i++; // increment i`)
- Redundant descriptions that just restate the code
- Commented-out code (remove it; git preserves history)

**Examples of good comments:**
```javascript
// The 8255 PIA uses partial address decoding, so $FD00-$FDFF all map to $FD00-$FD03
// This matches real hardware behavior where not all address lines are decoded

// Decouple display updates from PIA writes to avoid thousands of DOM updates per second
// Real hardware updates at ~500Hz, but we batch updates at 60fps

// Scan keyboard matrix using port B values 1, 3, 5 to match ROM's TESTAS routine expectations
```

### Changelog Maintenance
**IMPORTANT**: Whenever you make any changes to the codebase, you MUST update CHANGELOG.md:
- Add entries under the `[Unreleased]` section
- Use the appropriate category: `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, or `Security`
- Write clear, user-facing descriptions of what changed and why

### GitHub Issue References
When implementing changes based on a GitHub issue:
- Reference the issue number in the CHANGELOG.md entry (e.g., "Fixed display flickering (#42)")
- Include the issue reference in relevant code comments (e.g., `// Fix for #42: Handle edge case when...`)
- This maintains traceability between issues, code changes, and release notes

## Known Limitations

1. **Browser Tab Throttling**: Modern browsers throttle `requestAnimationFrame` when tabs are backgrounded, causing the emulator to pause/slow down
2. **Cassette I/O**: By default LOAD and SAVE are trapped at the IC10 entry
   points ($FBBC and $FC54) and done at once. With **Cassette: Real time**
   the routines themselves run against an emulated recorder, but that
   recorder has no keys and no sound: the board starts and stops it, every
   LOAD begins at the start of the tape, and its tape is the emulator's list
   of programs laid out as SAVE would have written them, not a recording.
   Tapes can be read from and written to `.wav` sound files, but that format
   is taken from the PROM and the schematic and has never been tried on a
   recording of a real tape or on a real board; the part most likely to need
   adjusting is the pulse detector. Only uncompressed WAV is read. The traps
   leave in `$0000-$0004` what the real routines leave (#41) but still differ
   from them in four ways, each kept on purpose and listed under Cassette
   Interface Reference
3. **Keyboard Matrix**: Does not simulate ghosting that occurs on real hardware when multiple keys are pressed
4. **Timing**: The CPU runs at approximately 1MHz but is not cycle-accurate;
   sufficient for the monitor ROM and simple programs. The functional suite the
   core passes checks results and flags, never cycles, so a passing run is not
   evidence about timing in either direction
5. **Automated Tests**: The CPU core passes the Klaus Dormann 6502 functional
   suite (#18), which covers every documented NMOS opcode in every addressing
   mode, and targeted checks now protect each earlier CPU fix (#17): stack
   frame layout, decimal flag semantics, and instruction timing. Still
   uncovered: external interrupt *delivery* under load, decimal arithmetic with
   invalid BCD operands, undocumented opcodes, and most of the machine layer,
   which beyond the keypad, resets, ROM protection, PROM image order and
   cassette traps is covered only by browser testing. See
   `docs/6502-conformance.md`
6. **Interrupts**: nothing raises IRQ, which on the board comes only from
   the expansion connector, and the vectors at `$03FC-$03FF` start with
   values of the emulator's choosing where the board has none; see HLT and
   the NMI Line
7. **Board drawing**: the cassette lights the LEDs D4-D7 only with
   **Cassette: Real time**, though a program can light them at either
   setting. The NOR/SS switch was photographed only at NOR, so its SS position is
   the same drawing moved across. The displays do not show the 31 ms blink a
   real board gives when a key is pressed. On a phone or tablet held upright the parts
   a person works are rearranged into one column (see Handheld Layout); in a
   desktop window narrower than about 800 pixels the board keeps its size and
   pans sideways, as before. The drawing has been looked at in Chrome only,
   and the handheld layout in emulation, in Safari on one iPhone 17 Pro and
   in Chrome on one OnePlus 7T, held upright. See Board Artwork
8. **Languages**: the site is in English and Italian and no other. The home
   page has one address for both, so a search engine or a link preview shows
   its English; only the guide has an Italian address. The Italian of a
   machine's refusal is found by the shape of the English message, so a
   message nobody listed is shown in English. The browser console is English
   only. The Italian has been read by the sessions that wrote it and
   reviewed by a second agent, and by no person that is known; and the
   language link has been tried in Chrome only. See Two Languages

## Keyboard Mappings

| Amico Key | PC Key |
|-----------|--------|
| 0-9, A-F  | 0-9, A-F |
| AD        | ↑ (Arrow Up) |
| DA        | ↓ (Arrow Down) |
| REG       | R |
| ↑ (increment) | + or = |
| RUN       | Enter or G |
| RES       | Escape or Backspace |
| HLT       | H |

RES is not a matrix key; see Reset Semantics above. Neither is HLT, which is
the NMI line; see HLT and the NMI Line.

The on-screen keys carry the legends of the original board, printed in white on
the caps themselves, as photographs of two surviving boards show. An earlier
version of the page drew blank caps with the legend silkscreened underneath;
that was a misreading of low-resolution photographs. Two of the legends were
previously named after their emulator identity rather than the hardware: `RUN`
was shown as `GO`, and `HLT` was shown as `PC`. The `data-key` values in
`index.html` still read `go` and `pc`; only the labels changed.

## Historical Context

The AMICO 2000 was published in "Sperimentare" magazine starting December 1978, designed by ASEL (Milano) and sold as a kit. Features included:
- MOS 6502 CPU @ 1MHz
- 1KB RAM (expandable to 2KB)
- 512 bytes Monitor ROM
- 6 seven-segment LED displays
- Hexadecimal keypad (23 keys)

ComputerHistory.it has two pages on the machine, and they are not the same
thing:

- `https://computerhistory.it/computer/asel/amico-2000` is its main page on
  the AMICO 2000: history, advertisements, manuals. The home page's footer
  links to it.
- `https://computerhistory.it/retrocomputing/retro-ricostruzioni/amico-2000`
  is the account of rebuilding one, with the board drawings, the parts and
  the four PROM images. `docs/computerhistory-amico2000.md` summarises this
  one and lists its links, each checked on 2026-11-21.

Link to the live pages. The site was down for a time and the project pointed
at Wayback Machine snapshots instead; it is back, and a snapshot is now only
for something that no longer answers at its own address.

## Pending Source-Level Cleanups

These are small code-hygiene items, tracked here so future agents pick them up
opportunistically rather than treating them as required for any specific task.

None are open at the moment.

## Pending Documentation Cleanups

None are open at the moment.

## Pending Verification Work

- Expand the small Node-compatible regression coverage so the machine layer
  can be smoke-tested without opening a browser. The CPU core is now well
  covered — broadly by the functional suite (#18) and per-fix by the targeted
  checks (#17) — and the machine layer is the remaining gap. The keyboard
  matrix and keypad workflow (`tests/keyboard-matrix.test.js`) and run-state
  reporting (`tests/run-state.test.js`) are now covered. So is the display
  renderer's bit-to-segment mapping, checked against the monitor's digit table
  at `$FFEA` by `tests/display-renderer.test.js`, which stands `display.js` on
  a small stand-in for the DOM. The machine layer's display multiplexing, how
  Port A and Port B writes become the six-pattern buffer, is covered by a
  check that a booted monitor reads `0000 00` and by
  `tests/display-persistence.test.js`, which checks when digits go dark, but
  not pattern by pattern. The cassette interface circuit and the real
  routines are covered (`tests/cassette-interface.test.js`,
  `tests/tape-recorder.test.js`). The PIA's `$FD00-$FDFF` partial decoding is
  not covered at all.
  `tests/keyboard-matrix.test.js` shows the pattern: run the real monitor in
  Node and assert on RAM or PIA state.
- Running a known 6502 functional suite is **done** (#18): the core passes Klaus
  Dormann's functional test, pinned in `tests/fixtures/6502-functional/`. Of the
  four areas that motivated it, stack behavior and BCD arithmetic with valid
  operands are now settled, and page-crossing *address arithmetic* is settled —
  but page-crossing *timing* is not, because the suite does not check cycles,
  and **interrupt handling is not**, because external IRQ/NMI delivery is a
  separate upstream suite needing a feedback register. Do not treat those two as
  settled on the strength of the functional suite. Both are now covered
  separately by the #17 checks — `tests/cpu6502-cycles.test.js` for the timing
  contract and `tests/cpu6502-stack-frames.test.js` for interrupt frame layout
  — but those are per-fix checks, not a conformance suite.
- The obvious next suites, both from the same pinned upstream repository, are
  `6502_interrupt_test` (needs machine-layer support to inject IRQ/NMI) and
  Bruce Clark's `6502_decimal_test` (checks decimal flags properly, including
  invalid BCD operands). Neither is integrated.
- Issue #17, a targeted per-fix regression harness, is **done**: every fix it
  named is protected by `tests/cpu6502-stack-frames.test.js`,
  `tests/cpu6502-decimal-flags.test.js` and `tests/cpu6502-cycles.test.js`. It
  was satisfied on its own terms, not by the conformance suite (#18), which
  never looks at cycles or at frame layout in memory.
