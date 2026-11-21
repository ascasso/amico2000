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
- Fully document every change, including its purpose, scope, and verification;
  commit the complete change before handoff.
- Keep the home page's `build-date` stamp in sync with the committer's calendar
  date of the commit being created: `YYYYMMDD` text and `YYYY-MM-DD` in its
  `datetime` attribute. `git show -s --format=%cs HEAD` shows the existing
  commit date; advance the stamp when making a commit on a later day. The date
  is the committer's local calendar date, in the time zone recorded on the
  commit, which is what `%cs` prints; it is not the UTC date. An evening commit
  in a US time zone is already the next day in UTC, and an automated review
  that compares the stamp with UTC will report a false mismatch. The
  managed GitHub Pages/Jekyll build does not refresh this stamp automatically.
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
- Do not push, publish, or alter external GitHub state unless explicitly asked.
  The one exception is closing an issue: Claude on an Opus or Fable model, and
  Codex on an Astra or Sol model, may close an issue without being asked. Any
  other agent or model still needs an explicit request, and so does every
  other change to GitHub state.
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

The project consists of four modular JavaScript files:

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

### 2. amico2000.js (~500 lines)
Machine emulation layer that connects CPU to hardware:
- Manages 8255 PIA (Programmable Interface Adapter) for I/O
- Implements display multiplexing (refreshes 6 digits sequentially)
- Keyboard matrix scanning (3 rows × 7 columns)
- ROM/RAM memory mapping

**Key architectural details:**
- The 8255 PIA is memory-mapped at $FD00-$FD03:
  - $FD00 (Port A): Display segments (output) / Keyboard column data (input)
  - $FD01 (Port B): Digit select bits 0-5 / Keyboard row scan bits 0-3
  - $FD02 (Port C): Expansion port (unused)
  - $FD03: Control register
- Display updates are decoupled from PIA writes for performance - buffered and updated once per frame
- Keyboard scanning matches the ROM's timing expectations (port B values: 1, 3, 5 for rows 0, 1, 2)

### 3. display.js (~240 lines)
SVG-based seven-segment display renderer:
- 6 displays arranged as: [A3][A2][A1][A0] : [D1][D0]
- Authentic red LED appearance with glow effects
- Runs at 60fps via `requestAnimationFrame`, independent of CPU speed

**Implementation note:** Display updates are intentionally separated from the CPU loop to avoid thousands of DOM updates per second.

### 4. main.js (~490 lines)
Application initialization and UI:
- Contains the Monitor ROM data (MONITOR_ROM constant at top of file)
- Keyboard event handling (both physical keyboard and on-screen buttons)
- ROM file loading via file input
- Debug console commands exposed via global `debug` object

**Memory Map:**
```
$0000-$07FF: 2KB RAM (expandable)
$FB00-$FCFF: Cassette ROM (embedded as CASSETTE_ROM in main.js; opt-in via amico.loadCassetteROM)
$FD00-$FD03: 8255 PIA I/O ports
$FE00-$FFFF: Monitor ROM (512 bytes)
```

Both PROM regions are read-only to the running program; see ROM Write
Protection below.

## Important Implementation Notes

### Performance
The display update system is decoupled from PIA writes. The emulator runs the CPU at ~1MHz, but display updates happen once per frame (60Hz). This prevents performance issues from excessive DOM manipulation.

### Interrupt Handling
The CPU properly polls for pending NMI/IRQ before each instruction fetch. This matches real 6502 behavior and is critical for correct emulation.

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
publishes it, and a test pins its hash. Do not reorder the array, and do not
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

`Amico2000.reset()` is the power-on reset and keeps exactly the behavior it
always had: clear all 2KB of RAM, seed the monitor's RAM-resident IRQ/NMI
vectors at `$03FC-$03FF` to `$FE30`, then call `res()`. It is what `main.js`
runs at startup and what the bench **Cold reset** control invokes.

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
The MONITOR_ROM array in main.js contains the actual monitor ROM bytes. When loading ROM files:
- `prom.ic9` goes at $FE00 (Monitor ROM, 512 bytes) - **required**
- `prom.ic10` fits the socket at $FB00-$FCFF (Cassette ROM, 512 bytes) -
  optional. The file is in chip order, so its first half answers at $FC00 and
  its second half at $FB00; see PROM Image Order above
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
  D5 text, D6 recording, D7 reading. That assignment is inferred: it is the
  one that makes the values the routines write match the LEDs the manual says
  light in each phase.
- Tape input is sampled on Port A bit 7. LOAD switches Port A between output,
  to set the LEDs, and input, to read the tape, with 8255 control words `$89`
  and `$99`.

The emulator's current cassette support is intentionally file-backed: it traps
the IC10 entry points and reads/writes `.amtape` images instead of emulating the
analog signal path or exact Port A/B timing.

Return convention (issue #24): the IC10 routines do not end in `RTS`. They exit
with `JMP $FE22`, the monitor's reset entry and the `$FFFC` vector target, whose
preamble runs `LDX #$FF / TXS` at `$FE28-$FE2A` and reinitialises `SP` to `$FF`.
The traps therefore set `PC = $FE22` without unwinding any `JSR` frame, which
matches the original ROM and cannot leak stack space. Do not add a `pull16()`
there: the ROM also re-enters LOAD with `JMP $FC54` (no frame pushed), so an
unconditional pull would corrupt the stack on that path. Protected by
`tests/cassette-trap-stack.test.js`.

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
2. **Cassette I/O**: File-backed mock cassette LOAD/SAVE is implemented by
   trapping the IC10 ROM entry points ($FBBC and $FC54), but the analog
   300-bit/s tape waveform and Port A/B signal timing are not cycle-emulated.
   The traps also differ from the real routines in what they leave in
   `$0000-$0004`; `NextSession.md` lists the differences
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
6. **HLT**: the HLT key is not emulated. On the board it raises a CPU
   interrupt, but the manual does not say which line; see Keyboard Mappings

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
| HLT       | none (not emulated) |

RES is not a matrix key; see Reset Semantics above. Neither is HLT: the manual
says it "genera una interruzione a livello CPU" but not which line, so it is not
emulated, and its on-screen key does nothing. Implementing it means settling
NMI versus IRQ from evidence, and what the RAM vectors at `$03FC-$03FF` should
hold when it fires.

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
  reporting (`tests/run-state.test.js`) are now covered; display multiplexing,
  the segment patterns and the PIA's `$FD00-$FDFF` partial decoding are not.
  `tests/keyboard-matrix.test.js` shows the pattern: run the real monitor in
  Node and assert on RAM or PIA state.
- HLT is not emulated (see Keyboard Mappings). `NextSession.md` records what
  has to be established first and a lead from the ROM.
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
