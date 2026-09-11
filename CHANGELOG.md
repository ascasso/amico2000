# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added `tests/fixtures/6502-functional/`, the Klaus Dormann 6502 functional
  test suite pinned at upstream revision `7954e2d` (2020-01-05) as a vendored,
  offline fixture: the 64KB test image, its corresponding assembler source, the
  upstream GPL-3.0 license, and a `manifest.json` recording the revision,
  download URLs, SHA-256 checksums, load and trap addresses, assembly-time
  configuration, and coverage limits. The suite itself is not wired up yet;
  this commit only pins and documents the fixture (#17).
- Added `Amico2000.res()`, the board's RES key as a distinct operation from the
  power-on reset (#30). `reset()` keeps its existing cold-start behavior and
  now delegates the CPU/PIA/display half to `res()`.
- Added `tests/res-reset.test.js`, dependency-free regression coverage for
  issue #30: Escape, Backspace, the on-screen RES button and `res()` each break
  a tight loop and clear an illegal-opcode halt, RES preserves RAM while the
  power-on reset clears it, and no reset alias leaves a matrix key stuck or
  types AD or 5.
- Added `tests/rom-write-protection.test.js`, dependency-free regression
  coverage for issue #31: guest stores into either PROM region are ignored, the
  reset vector survives, the monitor still boots and runs afterwards, and RAM,
  the PIA, and the explicit ROM loaders all keep working.
- Added `tests/helpers/machine.js`, shared dependency-free test scaffolding so
  the monitor ROM image is scraped out of `main.js` in one place instead of
  once per test file.
- Added `tests/cassette-trap-stack.test.js`, a regression check for issue #24
  confirming the cassette ROM traps leave no stack residue: the monitor's
  reset entry at $FE22 reinitialises SP with `TXS`, so 300 consecutive
  `JSR $FC54` traps never drift the stack pointer.
- Added preservation notes for the archived ComputerHistory.it AMICO 2000
  reconstruction article under `docs/`.
- Added the December 1978 Sperimentare AMICO 2000 Archive.org source link to
  `original-documentation.html`.
- Added the MePC page 44 Archive.org source link to
  `original-documentation.html`.
- Added file-backed mock cassette tape support for issue #2, including IC10 ROM
  entry-point traps for SAVE ($FBBC) and LOAD ($FC54), `.amtape` import, and
  `debug.saveTape()` export.
- Added `AGENTS.md` to direct Codex and other agents to the existing
  repository guidance in `CLAUDE.md`.
- Added `.gitignore` entries for the local scanned manual PDF and generated
  manual-extraction artifacts in `docs/`.
- Added initial manual extraction process notes and a first-pass content catalog
  for the Sperimentare AMICO 2000 supplement.
- Added a Markdown extraction of the Sperimentare supplement text in the
  original Italian for local search and future verification work.
- Added an initial manual code-listing workspace with candidate transcriptions
  for short tutorial programs and the first Appendix 2 game from the
  Sperimentare supplement.
- Added candidate transcriptions for the two page 62 listings and marked the
  page 59 clear-range listing as verified from project-owner review.

### Changed
- Tightened the `AGENTS.md` commit guidance to require small commits: one
  commit per unit of work, each standing on its own with its changelog and
  engineering-log entries alongside it, and Conventional Commits subject lines.
  The previous wording allowed "one or more focused logical commits", which did
  not rule out batching a whole session into a single commit.
- Recorded completed re-verification and closure of #30 and #31 on
  `develop` at `8f1fa3d`, matching the remote branch. Reviewed all four fix/docs
  commits, their engineering-log sections, and every issue acceptance criterion
  against the current code and tests; no additional implementation was needed.
  `node --test tests/` passed all 32 tests (16 for #30, 11 for #31, five existing
  regressions); individual syntax checks passed for `amico2000.js`, `main.js`,
  `cpu6502.js`, and `display.js`, and `git diff --check` passed. Git status
  showed only the pre-existing untracked `docs/.DS_Store`, left untouched.
  Chrome checks against a local Python server confirmed Escape, Backspace, and
  mouse RES recover a running loop, and Escape recovers an illegal-opcode halt;
  Backspace prevents browser navigation, reset aliases inject no matrix input,
  and Escape/Backspace/Arrow Up/Arrow Down/Enter depress and release the correct
  keycaps. Screenshot and computed-style checks confirmed the rendered 3px
  depression and its release. Keypad-entered `$AB` survived RES and Backspace,
  then **Cold reset** cleared it; the control label and both reset tooltips were
  checked. ROM write attempts preserved `$FE00 = $85`, `$FFFC = $22`, and the
  `$FE22` reset vector. Loading a 513-byte monitor file through the native picker
  produced the expected size-error alert without changing any monitor byte or
  `$0000`; a normal eight-byte `.bin` loaded at `$0000` and executed, storing
  `$42` at `$0300` and looping at `$0005` without halting. Both issues were
  closed with item-by-item evidence and browser results. Browser coverage was
  limited to Chrome on this machine; touch input and other browsers were not
  exercised. See [the complete verification record](docs/logs/2026-09-06.md#verification-and-closure-of-30-and-31).
- Renamed the bench **Reset** control to **Cold reset** and described both
  resets in the on-page help (#30). Two controls named "Reset" with different
  RAM behavior was the confusion the issue reported; the bench control is the
  emulator's power-on reset, the board's RES key is the reset line.
- Documented in `amico2000.js`, `AGENTS.md`, and `README.md` why the IC10
  cassette traps redirect to $FE22 without unwinding the JSR frame (issue #24).
  $FE22 is the monitor reset entry ($FFFC vector target) and its `TXS` restores
  SP to $FF, so no stack leak is possible; pulling the frame would instead
  corrupt the stack on the ROM's own `JMP $FC54` re-entry path. No behavioural
  change.
- Corrected the `AGENTS.md` testing instructions, which named only the single
  decimal-SBC test file; the committed checks now run with `node --test tests/`.
- Recorded the resolution of #24 and the newly filed #35 (`CASSETTE_ROM` is not
  a valid `prom.ic10` dump) in `NextSession.md`.
- Let the bottom "About this board" text use the full panel width and added
  a GitHub repository link alongside the page credits.
- Reworked the emulator front end in `index.html` so the interface recreates the
  appearance of the real ASEL board instead of presenting generic display and
  keypad panels. The layout, silkscreen legends, keycap colours, and component
  placement follow the board photographs archived on ComputerHistory.it.
- Renamed the on-screen `GO` and `PC` keys to `RUN` and `HLT` to match the
  legends silkscreened on the original board. The keyboard shortcuts and the
  underlying key matrix positions are unchanged, so only the labels differ.
- Replaced the glyph-prefixed run/stop button labels in `main.js` with plain
  text to match the reworked control panel.
- Updated the manual-extraction checklist to reference the active `AGENTS.md`
  guidance file instead of the removed `CLAUDE.md`.
- Clarified that all changes must be fully documented, logged, and committed
  in one or more focused logical commits.
- Reworked `AGENTS.md` into an agent-first repository contract with explicit
  source-of-truth, scope, verification, changelog, and external-state rules.
- Consolidated the repository guidance from `CLAUDE.md` into `AGENTS.md` so
  agents use a single active guidance file.
- Corrected the README project-structure diagram to match the repository's
  root-level JavaScript files and test directory.
- Renamed the original documentation mounting-instructions link label to
  "Istruzioni per il montaggio".
- Documented Sperimentare-derived cassette operation details, including IC10
  entry points, zero-page LOAD/SAVE parameters, tape record layout, approximate
  300 bit/s rate, and recorder wiring (#2).
- Documented that the 8255 PIA uses partial address decoding, with
  $FD00-$FDFF aliasing to the four PIA registers ($FD00-$FD03) (#1).
- Documented CPU cycle-counting behavior: base instruction cycles are added in
  `step()`, dynamic penalties are added by handlers, and NMOS 6502 decimal
  ADC/SBC does not incur a 65C02-style extra cycle (#5).
- Added a Codex first-pass project review to `archived/REVIEW.md` with architecture
  impressions, verification gaps, and concrete cleanup findings.
- Appended Codex freshness notes to `CLAUDE.md` so a future Claude pass can
  reconcile stale agent guidance without losing the original text.
- Expanded the pending cleanup guidance in `CLAUDE.md` with agreed findings
  from the Gemini and Opus review notes, including documentation drift,
  keyboard-matrix caveats, and CPU verification work.
- Moved the Gemini and Opus review notes into `archived/` so root-level
  documentation stays focused on active project guidance.
- Clarified that loading a raw `.bin` program at $0000 via the file loader
  preserves machine state and intentionally does not call `amico.reset()`,
  because `Amico2000.reset()` clears all 2KB of RAM ($0000-$07FF) and would
  erase the program just loaded. The other load paths (monitor ROM, cassette
  ROM, 512-byte fallback) write to ROM regions unaffected by reset, so they
  continue to reset after loading. This documents the asymmetry introduced
  in #21 and resolves #25.

### Fixed
- Fixed RES not resetting a running or halted CPU (#30). Escape, Backspace and
  the on-screen RES button only set a bit in the scanned key matrix, so they
  could not reach a program that never reads the keyboard, nor a CPU stopped on
  an illegal opcode. All three now drive the processor's reset line, as RES
  does on the real board, and vector through $FFFC to the monitor.
- Fixed Escape typing AD and Backspace typing 5 (#30). Both aliases sat at
  matrix positions shared with other keys; RES is no longer a matrix key at
  all, and a reset also clears any key being held.
- Fixed the on-screen key highlight for named keys, which indexed a lowercase
  lookup table with a cased key name, so pressing Escape, Arrow Up, Arrow Down
  or Enter never animated the matching cap (#30).
- Fixed `Amico2000.keyDown()` throwing a `ReferenceError` outside a browser by
  guarding its bare `window.debugKeyboard` reference, which had made the
  keyboard path untestable from Node (#30). The unconditional key-press logging
  it sits next to is now gated behind the same flag, as the rest of the file
  already does.
- Fixed `loadProgram()` accepting a load address outside the 6502's 16-bit
  address space, which defeated its own PROM check (#31). `CPU6502.loadBinary()`
  masks every write with `& 0xFFFF`, so `loadProgram(data, 0x1FE00)` and
  `loadProgram(data, -0x200)` both landed on `$FE00` and overwrote the monitor
  while the unmasked address overlapped no region. The destination is now
  bounded before it is compared against the PROM regions, and an out-of-range
  address is rejected rather than masked.
- Fixed guest CPU writes corrupting the monitor PROM and surviving Reset (#31).
  The IC9 ($FE00-$FFFF) and IC10 ($FB00-$FCFF) regions are now read-only to the
  running program, as chips with no write line are on the real board. This
  covers the $FFFA-$FFFF vectors, which matters because `CPU6502.reset()` takes
  its new PC from $FFFC: a single `STA $FFFC` previously left the machine with
  no way back to the monitor, defeating the Reset control too. Deliberate PROM
  installation through `loadMonitorROM()` / `loadCassetteROM()` is unchanged,
  and is now bounded to the size of the socket instead of wrapping past $FFFF.
- Fixed two direct-memory paths that bypassed the new protection (#31):
  `loadProgram()` now refuses a destination overlapping a PROM, and the trapped
  IC10 tape LOAD refuses a guest-supplied load address that would land on one,
  reporting the routine's own `$0000 = $FF` error status.
- Corrected the recreated board's I/O package from MCS 6532 to the documented
  8255 PIA (IC15), with a 40-pin depiction.
- Fixed decimal-mode SBC to derive the negative flag from the NMOS 6502 binary
  subtraction result, with a dependency-free regression test for the edge case
  where BCD adjustment changes bit 7 (#22).
- Fixed `original-documentation.html` markup by replacing loose text and
  placeholder metadata with a titled source list of valid links.
- Fixed decimal-mode ADC/SBC flag behavior so binary-derived flags and BCD carry
  adjustment are handled consistently with NMOS 6502 behavior (#4).
- Fixed 6502 16-bit stack byte order so JSR, BRK, IRQ, and NMI stack frames
  match real hardware while preserving RTS/RTI behavior (#3).

## [1.0.0] - 2026-01-12

### 🎉 Major Milestone: Emulator Fully Functional

This release marks the completion of the core AMICO 2000 emulator. All critical functionality is working correctly.

### Added
- Added comprehensive debugging tools in main.js console: `debug.trackPC()` to monitor PC register over time and detect tight loops, `debug.enableKeyboardDebug()` to log keyboard scans when keys are detected
- Added keyboard scan debugging in amico2000.js `_scanKeyboard()` that logs portB value, row, and result when keys are pressed (controlled by window.debugKeyboard flag)
- Added display state logging in keyDown() showing hex values, CPU halted status, and PC after each key press when debugging is enabled

### Fixed
- Fixed critical ROM initialization crash - ALL RAM ($0000-$07FF) now initializes to $00 on reset (not just zero page), and IRQ/NMI vectors at $03FC-$03FF initialize to $FE30 (main monitor loop) to provide valid indirect jump targets. Also unhalts CPU on reset to allow recovery from errors. This matches real AMICO 2000 power-up behavior where RAM is cleared and the ROM expects zero-filled RAM for its indirect jumps and function pointers
- Fixed memory initialization - RAM now initializes to $FF instead of $00 to match real hardware behavior where RAM typically powers up with bits high. Using $FF prevents issues with indirect jumps reading uninitialized RAM as $FF interpreted as address points to $FFFF (ROM space) and $FF as opcode produces clear invalid opcode error
- **All 16 hex keys now working!** - Keyboard matrix expanded to 7 columns (3 rows × 7 columns):
  - **Key 7 at [1, 6]** (Row 1, Column 6) - CONFIRMED working!
  - **Key E at [2, 6]** (Row 2, Column 6) - CONFIRMED working!
  - All hex keys 0-F now fully functional
  - Function keys (AD, DA, +, GO, REG, PC, RES) also working correctly
- Updated keyboard scanning to read all 7 columns (bits 0-6) instead of 6
- Added console debug logging to keyDown/keyUp functions showing key name and matrix position
- Note: Final keyboard layout determined through systematic empirical testing

### Added
- Added authentic cassette ROM data (prom.ic10) as optional constant in main.js for tape loading/saving functionality
- Added keyboard-debug.html - interactive visual grid for testing keyboard matrix positions
- Added keyboard-matrix-test.js - console-based testing helper with commands for systematically finding keys 7 and E (testKey, testUnknownPositions, findKey, etc.)

### Changed
- Updated CLAUDE.md with comprehensive development guidelines including code commenting standards (focus on "why" not "what", document hardware behavior, avoid redundant comments), changelog maintenance requirements, and GitHub issue reference practices
- Updated NEXT_SESSION.md with alternative theories for missing keys 7 and E (mode-dependent entry, shared positions with function keys, original keyboard limitations) and comprehensive testing strategies using new debugging tools
- Replaced placeholder Monitor ROM with authentic ASEL Amico 2000 ROM data from prom.ic9 binary dump for accurate hardware emulation
- Updated seven-segment display patterns in display.js to use authentic ASEL segment table from ROM address $FFEA - ensures digits appear exactly as the original designers intended
- Documented that hardware address decoding PROMs (prom.ic6 and prom.ic7) are not needed in software emulation, as address decoding is handled by CPU memory callbacks

### Fixed
- Fixed display flashing/flickering by implementing proper persistence of vision - the ROM blanks digits between multiplexing updates to prevent ghosting, but the emulator now ignores blank patterns (0x00) to maintain stable display output
- Fixed display multiplexing to correctly decode port B digit selection - bit 0 distinguishes keyboard scan mode (0) from display mode (1), and bits 1-4 encode a counter value (4-10) that maps to digit indices (0-5) after subtracting 4
- Fixed keyboard matrix layout by empirically determining ROM's expected key positions through systematic testing - Row 0: bits 0-5 = keys 6,5,4,3,2,1; Row 1: bits 0-5 = keys D,C,B,A,9,8; Row 2: bits 0,2,5 = keys 0,+,F (14/16 hex keys working; keys 7 and E positions still unknown)
- Fixed seven-segment display to mask off decimal point bit (bit 7) in PIA write handler - original AMICO 2000 hardware did not use decimal points
- Fixed emulator initialization to ensure CPU starts at correct reset vector ($FE22) - browser cache issues could cause CPU to start at wrong address, preventing proper monitor ROM initialization
- Fixed keyboard matrix mapping to match actual AMICO 2000 hardware layout determined through systematic testing and schematic analysis - all keys (0-F, AD, DA, PC, REG, +, GO, RES) now map to correct row/column positions
- Fixed keyboard matrix layout to use only 3 rows (portB values 1, 3, 5) instead of 4 rows, matching the ROM's keyboard scanning routine which only scans 3 rows
- Fixed keyboard event handler in main.js to preserve case for special keys (ArrowUp, Enter, Escape) while lowercasing only single-character hex keys - this was preventing ArrowUp (AD) and ArrowDown (DA) from being recognized
- Fixed emulator to auto-start on initialization (main.js) - CPU now runs continuously like real hardware, allowing keyboard input to be processed by the monitor ROM
- Fixed keyboard scanning logic in amico2000.js to match exact port B values (1, 3, 5, 7) to specific keyboard rows instead of checking individual bits - this was causing multiple rows to scan simultaneously and preventing proper key input detection
- Fixed JavaScript file paths in index.html (changed from `js/` subdirectory to root level) to correctly load cpu6502.js, amico2000.js, display.js, and main.js - this was preventing the emulator from initializing
- Implemented partial address decoding for 8255 PIA ($FD00-$FDFF now aliases to $FD00-$FD03) to match real 6502 hardware behavior and prevent incompatibility with software that relies on common partial decoding practices

## [0.1.0] - 2025-12-13

### Added
- Initial release of AMICO 2000 emulator
- Complete 6502 CPU emulation with all 56 opcodes and 151 instruction variants
- 8255 PIA emulation for display and keyboard I/O
- SVG-based seven-segment display rendering with authentic LED appearance
- Hexadecimal keyboard support with PC keyboard mapping
- Monitor ROM support (512 bytes at $FE00-$FFFF)
- Browser-based emulation running at authentic 1MHz speed
- Debug console commands for memory inspection and CPU state monitoring
