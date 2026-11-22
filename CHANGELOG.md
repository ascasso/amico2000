# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added the cassette interface circuit to the machine layer (#20), so that
  the real IC10 routines have something to work against when the traps are
  off (`amico.cassette.interceptROM = false`). Port A bit 7 now reads the
  interface's latch, which a pulse from the tape sets and Port B bit 0 low
  clears; Port B bits 5 and 6 are the level sent to the recorder; and the four
  phase LEDs D4-D7 follow Port B bit 7 and Port A's lines 0-3, as the
  supplement's schematic wires them. `amico.connectRecorder()` plugs in
  anything that can say when the tape gave a pulse and take note of the
  output level, and the board works its motor: entering LOAD plays the tape,
  entering SAVE records, and the monitor's reset entry, where both routines
  end and RES leads, stops it. `amico.takePhaseLEDs()` reports how much of
  the time each LED was on, since the routines switch them far faster than a
  screen can show. Run for real, SAVE lights D4 and D6, then D5 and D6, then
  D4 and D6 again, and LOAD flashes D4 and D7, then D5 and D7, as the manual
  describes. Nothing on the page uses this yet, and with the traps on, which
  is the default, LOAD and SAVE behave as before.
- Added a cassette recorder, `AmicoTapeAudio.createRecorder()`, to plug into
  the board's interface (#20). With it connected and the traps off, LOAD and
  SAVE are the real IC10 routines working on a tape, in the time the board
  takes: about 13 seconds for a short program, more for a long one or for one
  further along the tape. Playing, the recorder lays out the programs on the
  emulator's cassette one after another as the pulses SAVE would have made;
  recording, it notes the board's pulses and reads the programs back out of
  them when it stops. Run this way the emulator keeps the PROM's own
  behaviour where the traps differ from it: SAVE leaves its parameters in
  `$0000-$0004` alone, a LOAD for a program that is not on the tape waits
  until RES, and a block one byte longer than whole pages loses its last
  byte. The page does not offer this yet.
- Added `tape-audio.js`, a codec between tape records and the sound the
  board's cassette interface puts on tape (#20). It writes a record as a WAV
  file and reads the records back out of a WAV recording of a tape. No
  recording of a real tape was available, so the format is taken from the
  cassette PROM and the supplement's schematic of the interface, and
  `tests/tape-audio.test.js` holds the codec to the PROM itself: the bytes and
  pulse timing it writes are compared with the real SAVE routine running in
  the emulator, the real LOAD routine has to load a WAV file it wrote, and it
  has to read the signal the real SAVE routine produces. The decoder is also
  run against simulated tape faults: inverted polarity, band-limiting, hum,
  hiss, wow, wrong tape speed, dropouts and cut recordings. Those are guesses
  at what a deck does; the first real recording may still call for tuning.
  This entry adds the codec only; the page does not use it yet.
- Added `amico.addTapeRecord()` and `amico.findTape()` (#20). The mock
  cassette could be filled only by a SAVE or by an `.amtape` image; a program
  decoded from a sound recording is neither. `addTapeRecord()` takes a program
  identifier, a start address and the bytes, checks that the block fits the
  address space and the `.amtape` byte count, and puts it where the trapped
  LOAD will find it. `findTape()` returns the record an export should use,
  by the rule `exportTape()` already followed. `exportTape()` itself is
  unchanged.
- Added reading and writing of cassette tapes as sound on the page (#20).
  **Load ROM or tape** now takes a `.wav` recording of an AMICO 2000 cassette
  and imports every program it finds, ready for LOAD at `$FC54`; the message
  lists each program's identifier, addresses and place in the recording, and
  names any that could not be read and why. `debug.saveTapeAudio()` in the
  browser console downloads the most recent SAVE, or a program chosen by
  identifier, as the sound the board would have sent to the recorder. The
  recording must be uncompressed WAV and at most 64 MB. The user guide has a
  new section, Tapes as sound. The format has not yet been tried on a
  recording of a real tape or played to a real board; see the codec's entry
  above. The trapped LOAD and SAVE are unchanged and still instant.
- Added a choice of how the six displays are drawn, under Bench controls:
  **Readable**, now the default, keeps each segment solid with only a narrow
  glow and dims the unlit segments, so digits read easily at the size a page
  draws them; **Authentic** is the blooming look of a real powered board that
  the displays had before. Only the drawing changes, never which segments are
  lit. The page remembers the choice in the browser.
- Added `tests/display-renderer.test.js`, the first check of the seven-segment
  renderer. `display.js` draws into the DOM, so nothing in Node could see it;
  the test stands it on a small stand-in for the handful of DOM calls it makes.
  Fifteen checks pin which pattern bit lights which segment, that each of the
  six patterns reaches its own digit, that the digits are drawn left to right
  as four address digits and then two data digits, that the monitor's own
  table at `$FFEA` draws 0 to F, and that a booted monitor's display reaches
  the renderer as `0000 00`. Two of them read the geometry rather than the
  names: every lit segment has to be drawn over its own package, on top of
  its unlit window, and the named segments have to sit where a seven-segment
  digit has them, leaning the right way, with two decimal points at the foot,
  one each side.
  It was first written against the renderer as it stood, ahead of redrawing
  the displays, so the redraw had something to hold it.
- Added a link to the published emulator, `https://ascasso.github.io/amico2000/`,
  near the top of the README, so a visitor to the repository can run it
  without downloading anything.
- Added a build date beneath the home page credits (`Build YYYYMMDD`) so the
  emulator revision's date is visible, including when used offline.
- Added a linked AMICO 2000 user guide covering controls, memory entry, raw
  binary ROM/program formats, file routing, and cassette LOAD/SAVE. The home
  page now explains the accepted formats beside the loader, and the file
  picker includes `.ic9` and `.ic10` PROM dumps.
- Added a visually checked text transcription of the May 1979 clock program,
  including its hex bytes, assembly, loading steps, use, and a note on the
  printed calibration-address discrepancy.
- Added the May 1979 Sperimentare AMICO 2000 article scan under `docs/` so
  its clock program and operating instructions have a stable, reviewable source.
- Added `tests/cpu6502-cycles.test.js`, the timing contract from #5 (#17). It
  checks all 151 documented opcodes against a reference table of NMOS base
  cycles and asserts the instruction table holds that set and nothing more, so
  a typo or an accidentally added undocumented opcode fails the run. Dynamic
  penalties are then measured through `step()` rather than read off the table:
  indexed reads pay one extra cycle only when the page changes; stores and
  read-modify-write never pay it, because their extra address cycle is already
  in the base cost; branches cost 2, 3 or 4 by outcome, with the page test
  taken against the address after the operand. A sweep over all eight
  addressing modes confirms decimal `ADC`/`SBC` costs exactly what binary does,
  since the extra decimal cycle is 65C02 behaviour and the AMICO 2000 is NMOS.
- Added `tests/cpu6502-decimal-flags.test.js`, which checks decimal-mode
  `ADC`/`SBC` against an independent restatement of the documented NMOS
  algorithm (#4, #22, #17). It sweeps all 20,000 valid-BCD operand pairs with
  both carry inputs per instruction — 40,000 comparisons of result, `N`, `V`,
  `Z` and `C`, in about 3ms — and the core agrees on every one. Because the
  emulator reaches those answers by a visibly different route, agreement is a
  real cross-check rather than a restatement of the implementation. Named
  vectors then pin the specific regressions #4 and #22 fixed: `N`/`V` taken
  from before the high-nibble correction, `Z` taken from the binary sum rather
  than the wrapped BCD accumulator, and `N` taken from the binary difference
  rather than the adjusted result. A final check marks the boundary: invalid
  BCD operands diverge from real silicon here, and that is asserted explicitly
  so it cannot be mistaken for coverage.
- Added `tests/cpu6502-stack-frames.test.js`, nine checks that pin the physical
  layout of every 6502 stack frame (#3, #17). They assert the individual bytes
  in page one rather than only the round trip, because a core that pushes the
  two halves in the wrong order still returns to the right place — its own pull
  is wrong in the same way — and the defect only surfaces when a program reads
  the frame, as the AMICO monitor does when it displays the interrupted PC.
  Covered: `JSR` return-address order and `RTS` resumption, nested frames,
  `BRK` pushing the address past its padding byte with `B` set, `RTI` returning
  without the `RTS` increment, `IRQ` and `NMI` frames with `B` clear and the
  correct vector, `IRQ` masking, and a frame that wraps within page one.
- Added `docs/6502-conformance.md`, the reference for the conformance workflow
  (#18): the current result, the single-suite command and its relationship to
  `node --test tests/`, provenance, how a pass is decided and why it is
  trustworthy, how to diagnose a failure against the upstream listing, and an
  explicit table of what the suite does **not** cover — external interrupts,
  NMOS decimal flags, instruction timing, undocumented opcodes, and AMICO 2000
  hardware integration.
- Added `tests/conformance-runner.test.js`, 18 checks that the conformance
  runner itself reports correctly (#18). They drive it with small synthetic
  programs whose outcome is known by construction and assert that only a
  self-loop at the verified success address is ever a pass: a failure trap, an
  illegal-opcode halt, an exception, and a multi-instruction loop that exhausts
  the budget must all report as failures. Also covers rejection of a missing,
  truncated or corrupted fixture, the entry-without-reset behaviour, and the
  contents of the diagnostic report and instruction trace.
- Added `tests/helpers/6502-conformance.js` and
  `tests/cpu6502-functional.test.js`, which run the pinned Klaus Dormann 6502
  functional suite against the CPU core (#18). **The core passes**, reaching the
  suite's success trap at $3469 after 30,646,177 instructions and 96,241,367
  cycles in about 0.6s. The runner validates the fixture's checksum before
  executing it, enters at $0400 without vectoring through reset, treats only a
  self-loop at the verified success address as a pass, and bounds execution with
  an instruction budget independent of the CPU's own cycle counter. On failure it
  reports the address, opcode, registers, decoded status flags, instruction and
  cycle counts, and a trace of the last 16 instructions. Run it alone with
  `node --test tests/cpu6502-functional.test.js`.
- Added `tests/fixtures/6502-functional/`, the Klaus Dormann 6502 functional
  test suite pinned at upstream revision `7954e2d` (2020-01-05) as a vendored,
  offline fixture: the 64KB test image, its corresponding assembler source, the
  upstream GPL-3.0 license, and a `manifest.json` recording the revision,
  download URLs, SHA-256 checksums, load and trap addresses, assembly-time
  configuration, and coverage limits. The suite itself is not wired up yet;
  this commit only pins and documents the fixture (#18).
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
- The home page's "board photographs on ComputerHistory.it" link points at
  the live article again, `https://computerhistory.it/computer/asel/amico-2000`,
  instead of a Wayback Machine snapshot taken while the site was down.
- The guide's "What files can I load?" section and the README now say first
  that nothing needs loading: both ROMs are built in and fitted when the page
  opens, and loading a ROM file only replaces one. The home page's **File
  formats** link jumps straight to that section, past the guide's Getting
  started, and its table, which led with the ROM rows, read as if a monitor
  had to be loaded. `AGENTS.md` no longer calls `prom.ic9` "required".
- The cassette PROM (IC10) is now fitted when the page opens, beside the
  monitor, as on a board built with the cassette interface, which is the board
  the page draws. AD now shows `FBBC D8` and `FC54 A9`, as the manual prints
  them, where the empty socket showed `FF`, and programs can call its routines.
  Cassette LOAD and SAVE behave exactly as before: the emulator still
  intercepts both entry points and uses `.amtape` files. On the real machine
  IC10 was part of the optional cassette interface; to present a board
  without it, run `amico.loadCassetteROM(new Uint8Array(512).fill(0xFF))` in
  the browser console.
- `AGENTS.md` now records how the four LEDs D4-D7 are wired, read from the
  schematic on page 28 of the supplement and checked against the cassette
  PROM: each is lit while Port B bit 7 and its own Port A bit are both high.
  The assignment of the LEDs to Port A bits 0-3 had been an inference. The
  monitor never sets that bit, so the LEDs are dark on an idle board, as the
  home page draws them. No behaviour changed.
- `AGENTS.md` has a Board Artwork section: how the board drawing in
  `index.html` is organised, what in it is measured, read or guessed, what
  the scripts depend on, and the rule that the photographs it was drawn from
  are private and their owners are never named. `NextSession.md` records the
  redraw and what is left unverified, and notes a way to check the page in a
  browser without the workarounds it described before.
- The two part drawings the board reuses, the resistor and the ceramic bead,
  have the ids `part-resistor` and `part-bead` instead of `res` and `bead`.
  An element's id becomes a property of the page's `window`, and `res` is too
  close to the documented console command `amico.res()`. No visible change.
- The whole board now carries the parts a real one does, each where a
  photograph of a surviving board has it. On the left: the 6502
  standing upright at the edge beside the 40-pad bus field, the four
  glue-logic chips along the top, the crystal can, the monitor and cassette
  PROMs with the orange and yellow stickers of that board, the two decode
  PROMs, and the 5 V regulator on its black finned heatsink over an aluminium
  plate, with the power tabs and the two electrolytic capacitors. In the
  middle: the four 2114 RAMs, the 8255 standing upright, the 10-pin expansion
  header, the 3-pin RECORD header with its IN, OUT and GND legends, the
  cassette interface chips, and the rows of resistors along the top edge. On
  the right: the display driver and decoder, the ladder of seven segment
  resistors, and above the displays the six digit transistors, each with its
  two resistors and its printed `TR`. The four LEDs are in their real place,
  in a row under the resistors at the top edge. The NOR/SS slide switch is
  the white and pale blue part the board has. All of it replaces an invented
  arrangement that included a transformer the board never had, a 6502 lying
  on its side, a 2716 EPROM and gold pins.
- The board itself is redrawn from a photograph of a real one. It is the deep,
  slightly blue green of the real solder mask instead of a bright grass green,
  and it has the real proportions, 300 x 100 mm, where it was a little too
  tall. The copper under the mask follows the runs visible on the real board:
  the bus off the processor, the comb between the memory chips, the fan from
  the 8255, the six lines up to the display transistors and the lines into the
  keys, with their vias. The six mounting holes are where the board has them,
  the four corners and the middle of each long edge, in place of five plated
  ones.
- The board's printed legends are now the mustard yellow of a real board's
  silkscreen instead of white, and the maker's mark is the real one: the boxed
  monogram, `A.S.EL` and `AMICO 2000` running up the right-hand edge and
  reading from the bottom, with `1 79` further along and a bar of ink in the
  corner. It had read `A.S.E.L.` from the top down. `NOR` and `SS` and the
  printed box around the slide switch sit where the board has them. Four
  legends that the board never carried are gone: BUS, J1 EXP, MONITOR ROM and
  7805.
- The board now carries the four LEDs the real one has, D4 to D7, drawn as
  5 mm red LEDs with their designators beneath, in place of five invented
  ones labelled PWR, RUN, IRQ, NMI and RW. They belong to the cassette
  interface and stay dark, because the emulator's file-backed cassette never
  runs the routines that light them. Whether the processor is running, which
  the invented RUN LED used to show, is now a small lamp beside the registers
  under Processor state; it still follows the Run/Stop button and a console
  `amico.start()` or `amico.stop()`. It also turns amber and reads "halted"
  when the processor meets an opcode the emulator does not implement, where
  the RUN LED went on showing a running machine; RES or a cold reset clears
  it. The decorative power LED is gone.
- Lit display segments are now the deep red of the real displays instead of
  an orange-red, and they bloom: a lit segment swells past its window, the
  hairlines between segments close, and a faint red halo lies on the package
  around the digit, as in a photograph of a powered board. The indicator LEDs
  take the same red.
- The display is now drawn as the board has it: six separate display packages,
  four for the address and two for the data with a gap between the groups,
  hard against the top right corner. The digits lean by the 10 degrees of
  the part's data sheet, and an unlit segment stays faintly visible in dusty
  red, so a blank digit shows a ghost 8 as the real parts do. Each package
  shows its two decimal points, which the board never lights. The colon and
  the ADDRESS and DATA captions are gone; the board has neither. A steady display no longer touches the page at all: the
  renderer redraws only the segments that change.
- The on-screen keys now look like the caps on a real board. The legends are
  printed in white on the caps, where earlier they sat beneath blank caps; the
  caps are square and sculpted, in the red and blue sampled from a photograph
  of a surviving board; and the hex keys and function keys share one tight
  switch pitch with their bottom rows in line. A pressed key darkens whether
  it was pressed with the mouse, a finger or the computer keyboard. The keys
  themselves, their `data-key` values and the keyboard handling are unchanged.
- The README and two `main.js` comments now call the loader button by its
  on-screen name, **Load ROM or tape**, instead of "Load ROM/Tape" and
  "Load ROM".
- `main.js` keeps one key-to-button table for the on-screen key animation
  instead of identical copies in `highlightButton()` and
  `unhighlightButton()`, so press and release cannot drift apart. No visible
  change.
- Cross-referenced the two memory initializations in comments: `CPU6502`
  fills all 64KB with `$FF`, and `Amico2000.reset()` then clears the board's
  2KB of RAM to `$00` for the monitor; each comment now points at the other.
  The same block in `reset()` had the RAM vectors swapped: `$03FC` is the NMI
  vector (`$FFFA` -> `$FE1C`: `JMP ($03FC)`) and `$03FE` the IRQ/BRK vector, not
  the reverse. Comments only; behavior is unchanged.
- `main.js` now has a single startup sequence: `window.amico` is published as
  soon as the emulator is created, instead of being set to `null` and filled
  in by a second `DOMContentLoaded` handler. The console commands behave as
  before.
- Clarified that GitHub Pages runs a managed Jekyll build; the footer's
  committed date still needs to be maintained because that build does not
  generate the stamp.
- Reconciled the guidance that recorded #17 as open and unsatisfied. `AGENTS.md`,
  `README.md`, `NextSession.md` and `docs/6502-conformance.md` now state that
  the per-fix harness is done and, more usefully, draw the line the two pieces
  of work fall on either side of: the conformance suite proves the instruction
  set, while the #17 checks cover what it structurally cannot see — cycles, and
  the layout of a stack frame in memory. The remaining CPU gaps are narrowed to
  external interrupt *delivery*, invalid BCD operands and undocumented opcodes,
  and the machine layer is named as the clearest gap overall.
- Reconciled guidance that predated the conformance suite (#18). `README.md`
  gains a Testing section and records that the CPU core passes the functional
  suite; `AGENTS.md` documents the command, rewrites Known Limitations #5, and
  narrows Pending Verification Work to what the suite genuinely settles;
  `NextSession.md` no longer defers the suite as future work. All three now
  state the same remaining gaps — external interrupts, NMOS decimal flags,
  instruction timing, undocumented opcodes, and the machine layer — so that a
  passing run is not read as broader assurance than it is.
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

### Removed
- Removed `original-documentation.html`, a bare page of Internet Archive links
  that nothing linked to. The links, each with a note on what it is, are now
  under History in `README.md`.
- Removed the keyboard-discovery scaffolding: `keyboard-test.html`,
  `keyboard-debug.html`, `keyboard-matrix-test.js` and
  `KEYBOARD_TESTING_GUIDE.md`. They found matrix positions by trial and error,
  the method that produced the wrong keypad map, and the key positions are now
  derived from the monitor ROM and checked by `tests/keyboard-matrix.test.js`.
  The two pages were also published on GitHub Pages and wrote typed input
  into the page as HTML (a self-XSS, harmless to other visitors), and could
  not take the site's Content Security Policy because their scripts are
  inline. They remain in git history.

### Fixed
- Fixed the displays staying lit when nothing was refreshing them (#20). The
  board has no display latch: a digit is alight only while it is driven, and
  the monitor keeps all six visible by scanning them every few milliseconds.
  The emulator kept the last pattern each digit was ever given, so under a
  program that does not scan the displays, or during the cassette routines,
  the page showed a frozen readout where the real board is dark. A digit is
  now shown only if it was driven within the last tenth of a second of
  processor time, or is being driven at that moment. With the monitor
  running nothing looks different. Pausing with **Stop** still freezes the
  picture, since the processor's clock stops with it.
- Fixed the keypad map, which sent the wrong codes to the monitor for `0`, AD,
  RUN and REG. Typing `0` reset the address instead of entering a zero; AD ran
  the program at the displayed address; RUN and HLT acted as DA; and REG ran
  code. Each matrix position is now derived from the monitor's own GETKEY
  routine (`$FF57`), which decodes code = 7 x row + (6 - bit), so all 21
  positions hold distinct keys and the keypad sequences in the manual and the
  user guide work: entering bytes with AD/DA/+, AD then RUN, and REG then RUN.
  The guide's warning that the keypad might not work is removed. REG is
  described as what the ROM and manual say it is, recalling the saved program
  counter at `$00F6/$00F7`, rather than "show registers". HLT is not part of
  the matrix (on the board it raises a CPU interrupt, line undocumented), so it
  is no longer mapped to `P`, where it typed DA; it is documented as not
  emulated. Covered by `tests/keyboard-matrix.test.js`, which checks every key
  against the ROM decode and drives the keypad workflows end to end.
- Fixed the keyboard scan throwing `ReferenceError: window is not defined`
  outside a browser whenever it found a pressed key. `_scanKeyboard()` read
  `window.debugKeyboard` directly instead of through the existing
  `_keyboardDebug()` guard, so keypad behavior could not be tested in Node.
  The browser was unaffected. Covered by `tests/keyboard-matrix.test.js`.
- Fixed the bench Run/Stop label and RUN LED falling out of step when the
  machine was started or stopped from the browser console, as the user guide's
  own examples do. `main.js` kept a separate copy of the run state that only
  the bench button updated, so after a console `amico.stop()` the label still
  read Stop and the Step button refused to step a paused machine. The machine
  now reports run-state changes through `Amico2000.onRunStateChange`, the bench
  controls read `amico.running`, and the guide no longer warns about the
  mismatch. Covered by `tests/run-state.test.js`.
- Fixed cassette SAVE of the whole `$0000-$FFFF` range reporting success while
  exporting a tape that could never be loaded back. The `.amtape` header holds
  the byte count in 16 bits, so 65,536 bytes was recorded as 0 and `loadTape()`
  rejected the image. SAVE now refuses that range with the routine's `$0000 =
  $FF` error status, as it does for an end address before the start; every
  smaller range, up to 65,535 bytes, saves and loads as before. The user guide
  lists both failure cases. Covered by `tests/cassette-tape-length.test.js`.
- Fixed the cassette PROM (IC10) being installed with its two halves the wrong
  way round (#35). A PROM image is in chip order, and a 512-byte PROM is
  addressed by A0-A8 alone. The IC10 socket at `$FB00-$FCFF` starts on an odd
  page, so the first 256 bytes of the image belong at `$FC00` and the last 256
  at `$FB00`. The loader copied the image in file order from `$FB00` instead,
  which left both documented entry points, `$FBBC` and `$FC54`, in the middle
  of instructions: a fitted cassette ROM could not run, and REG showed the
  wrong byte at each address. `loadCassetteROM()` and a `prom.ic10` file chosen
  with **Load ROM or tape** now place the image by the chip's address pins, so
  REG shows `FBBC D8` and `FC54 A9` as the manual prints them. The embedded
  `CASSETTE_ROM` bytes are unchanged. They were never at fault: they are
  byte-identical to the dump ComputerHistory.it publishes. File-backed cassette
  LOAD and SAVE are unaffected, because the traps act before any ROM byte
  executes, and the PROM is still not fitted by default. Covered by
  `tests/cassette-rom-mapping.test.js`.
- Fixed the four PROM image links in `docs/computerhistory-amico2000.md`. They
  pointed at a Wayback Machine snapshot that never held the files, and
  returned 404. The files were captured from the live site on 2026-11-21, and
  the links now point at those captures, with each file's size and SHA-256
  recorded beside them.
- Fixed an uncaught console error when releasing the `"` key. The on-screen
  key highlight built its CSS selector from the raw key name, so a double quote
  produced an invalid selector; the name is now escaped with `CSS.escape()`. The emulator itself was unaffected, because the key had
  already been released in the machine before the error was thrown.
- Fixed the user guide's console example so memory is inspected in a separate
  command after execution. Pasting the original block could report the old
  byte before the first animation frame ran (PR #39).
- Corrected the clock transcription and reset documentation's calibration
  guidance: the May 1979 article prints `$0312`, which is an opcode, while
  `$030E` is the adjustment byte that matches its stated speed direction.
- Added `.gitattributes`, exempting the vendored
  `tests/fixtures/6502-functional/6502_functional_test.a65` from `git diff
  --check`'s whitespace checks. The file is pinned byte-for-byte identical to
  upstream and verified against its git blob SHA-1 (see the fixture README);
  its trailing whitespace and missing final newline are upstream's formatting,
  not a defect to "fix" by editing vendored bytes. `git diff --check
  master...develop` now passes cleanly; previously it reported 565 whitespace
  errors in that one file, which had gone unnoticed because `git diff --check`
  with no range only inspects uncommitted changes, not historical commits.

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

### Security
- Added a Content Security Policy to `index.html` and `guide.html` as a
  `<meta>` tag, since GitHub Pages cannot send response headers. Scripts may
  load only from the site's own files; plugins, form submissions and `<base>`
  changes are refused; inline styles stay allowed for the board layout. A security
  review found no injection bug for it to stop; it is there so a future one
  could not run code. The emulator runs unchanged from a web server and from
  a file opened directly.
- The ROM and tape loader now refuses a file over 128KB before reading it.
  Every loader already rejected such a file, but only after reading all of it
  into memory, so a very large file picked by mistake could stall the tab.
  128KB is twice the 6502's address space, so no file a loader would accept is
  turned away.

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
