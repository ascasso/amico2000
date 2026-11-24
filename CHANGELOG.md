# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Amico has `display.hold()`, which scans the six digits until RES. A
  program that ended with `stop`, or ran off its end, handed the board to
  the monitor, which shows `0000` and the byte there, so a result put on
  the displays was gone as soon as it was reached. `display.hold()` is
  `loop`, `display.scan()`, `end` in one word and the same six bytes; the
  matchstick example ends with it now, byte for byte as before. The README
  says what `stop` does to the displays. The third of the small fixes
  agreed for Amico.
- Amico has named constants: `const start = 21`. The name stands wherever a
  literal may, as an operand, on the right of a comparison, as a table's
  index or last index and in its formula, and costs nothing: it is gone by
  the time code is made. The keys that are not hex digits have names of the
  same kind, `keypad.ad`, `keypad.da`, `keypad.inc`, `keypad.run`,
  `keypad.reg` and `keypad.none`, so that a program no longer compares a
  key with `$15`. The reference interpreter and the random generator of the
  differential test learned both from the README. The second of the small
  fixes agreed for Amico.
- `amicoc` now warns of a name that is assigned and never read, such as a
  name spelt two ways: `Line 3: lfet is assigned and never read`. The
  compiler keeps no place in memory for such a name, so until now its value
  went nowhere without a word. The program is compiled all the same; the
  warning goes to standard error, and `compile()` returns it in
  `warnings`. The first of the small fixes agreed for Amico.
- Added `tests/compiler-assignment.test.js`, which tries two rules of Amico
  on every small program there is: that a name is assigned on every path
  before it is read, and that every statement can be reached. Some 45,000
  nestings of `if`, `else`, `loop` and `stop` are given to the compiler and
  to an oracle that decides the same questions on a control-flow graph;
  the two have to accept the same programs and refuse the rest at the same
  line. It covers what the random programs cannot, since those are all
  valid. `AMICO_STATEMENTS=7` goes deeper. It too comes from the check of
  the compiler.
- Added `tests/compiler-differential.test.js`, which holds the Amico compiler
  to an interpreter written from the README alone. A thousand random
  programs are compiled, run on the emulated board with registers and
  flags randomised, and compared with it: the display bytes, every
  variable, and that nothing else in RAM was written. Six programs written
  by hand cover the top of a loop, which the random ones cannot. It is the
  net under the compiler's front end before that is reworked;
  `AMICO_PROGRAMS=30000` runs more. It comes from the check of the compiler
  (`NextSession.md`, item 13), where it was one reviewer's harness.
- Added a playable `21 fiammiferi` compiler example. Its 186-byte program
  accepts moves at the keypad and shows both players' moves and the number
  of matches left on the six digits.
- Added `amicoc`, a byte-oriented cross-compiler for the 1 KB AMICO.
  It produces annotated assembly, raw NMOS 6502 code and loadable cassette
  images. Its 40-byte square-table example runs through the original monitor.
  Generated programs clear inherited decimal mode and can wait for a debounced
  keypress while refreshing the six displays.
- Added a picture of the board to the top of the README, at the owner's
  request: `docs/images/amico2000-board.png`, a screenshot of the emulator's
  own drawing with the monitor running and `0000 00` on the displays. It
  links to the live site. It is a drawing and not a photograph; the
  photographs of real boards stay out of the repository.
- Added `google7a632e30a7a507df.html` at the site root, the file Google
  Search Console asks for to verify that the owner controls the site. It is
  Google's own one line, committed as downloaded. It is served once it
  reaches `master`, and has to stay there for the verification to hold.
- Added `docs/monitor-rom-review.md`, a review of the original monitor PROM
  (IC9) for bugs and security issues, at the owner's request. It finds five
  bugs in the ROM as ASEL shipped it. RUN restores the status of the last
  program halted, so an ordinary program can start in decimal mode, even
  after RES; the manual's first program, which has no `CLD`, then adds 09 and
  01 to get 10. In decimal mode the key routine at `$FF57` returns 15 for F
  and for no key alike, where the manual's Tabella 17 promises 21 for no key.
  Entered at `$FE30` in decimal mode, the main loop scrambles the keypad, so
  that D acts as RUN. And the branch calculator at `$FF97` overwrites a halted
  program's saved A and does not debounce its keys. The review also lists
  where the manual describes the ROM wrongly, smaller faults of the design,
  what was checked and found sound, and what a tape could do: take over HLT
  and BRK until the board is switched off, but never start itself. Each
  finding was reproduced by running the ROM, and the document gives the keys
  that show it. Nothing in the emulator was changed. Its IRQ vector seed,
  `$FE30`, is what makes the keypad bug reachable here, which bears on the
  seed AGENTS.md leaves undecided.
- Added Italian to the home page. A browser set to Italian now opens the
  page in Italian with nothing to press, and a word in the page's top right
  corner, `Italiano` or `English`, changes it where it stands: nothing is
  reloaded, so the machine and whatever is in its memory are left alone. The
  choice is remembered in this browser, under `amico2000.lang`, and
  `?lang=it` or `?lang=en` in the address sets it, which is how the Italian
  guide links back. In Italian are the bench controls, every tooltip, the
  three notes under the board, the tab's title, the word beside the run lamp,
  the tape's status line and the messages after a file is loaded. The board
  keeps its own legends, and the browser console stays in English.
  - `index.html` carries its text twice, English and then Italian, and a
    style rule shows one; a new script, `lang.js`, loaded in `<head>`,
    chooses which before anything is drawn. `tests/languages.test.js` fails
    if a sentence, a tooltip or a message is added in one language only.
  - In the handheld layout the link is two letters, `IT` or `EN`, in the
    corner the title leaves free. It takes no room: the first screen holds
    what it held.
  - The English page is laid out exactly as before, with the link added.
  - The reasons the machine gives when it refuses a file, a LOAD or a SAVE
    are in Italian as well: "Non registrato: l'indirizzo finale precede
    quello iniziale". `amico2000.js` and `tape-audio.js` go on making them in
    English and know nothing of the page; `lang.js` has the Italian for each,
    found by its shape, and the test makes every one of them for real, 32
    messages of 27 kinds, so a new or reworded one cannot reach an Italian
    reader unnoticed.
  - One address serves both languages, so a search engine or a link preview
    reads the page's English. The Italian guide has an address of its own.
- Added the guide in Italian, `guida.html`: all of `guide.html`, for the
  people who used this board around 1980, many of whom do not read English.
  It uses the manual's own words where the manual has them, "locazione",
  "passo singolo", "coda" for the leader, "lettura" and "registrazione" for
  LOAD and SAVE, and speaks in the manual's voice, its "noi" (at first it
  gave orders to "voi"; see under Changed). Each guide has a link to the
  other at its top and names it to search engines
  with `hreflang`, and `sitemap.xml` lists both. The Italian guide's links
  back to the emulator carry `?lang=it`. `tests/guide-languages.test.js`
  holds the two files to the same sections, anchors, listings and code, so
  that one is not changed without the other.
- Added a description, a canonical address and Open Graph and Twitter tags to
  `index.html` and `guide.html`, plus `SoftwareApplication` data on the home
  page, and gave the home page a longer title naming the 6502 and the 1978
  ASEL Milano machine, so a search result says what the page is. There is no
  preview image: the only pictures of the board are private photographs.
- Added `robots.txt` and `sitemap.xml` at the site root, so search engines are
  told plainly that the page may be crawled and where its two pages are
  (`index.html`'s address and `guide.html`). Nothing on the site blocked
  crawlers before; the files make that explicit and give Google Search Console
  a sitemap to take. They reach the live site only when `master` does.
- Added a section to the guide, The four LEDs in your own program, with two
  short programs to key in: one lights any of D4 to D7, the other counts in
  binary on them. The manual gives the four LEDs to the cassette, but on its
  schematic nothing ties them to it: each is lit while Port B bit 7 and one
  of Port A's lines 0-3 are both high, and a program can set those. The
  emulator has modelled them that way since the cassette interface was
  added, so this needed no change to the machine; what it adds is the
  programs, a test that runs them as the guide prints them
  (`tests/user-leds.test.js`), and the account in `AGENTS.md`. It follows
  from the schematic and the cassette PROM and has not been tried on a real
  board.
- Added a layout for phones held upright. The board is drawn three times as
  wide as it is tall, so on a phone in portrait the page showed its left half
  and left the displays and the whole keypad off screen to the right, behind
  a sideways scroll. On such a screen the page now brings the six displays,
  the four LEDs, the NOR/SS switch and all 23 keys together in one column at
  the top, the function keys above the hex keys, with keys between 45 and 65
  px across depending on the phone, and the board's maker's mark at the
  foot. A picture of the whole board, the width of the screen, follows
  beneath. Everything works as before, by touch. Turning the phone sideways
  gives the board as drawn again. Desktop computers are not affected: the
  layout needs a touch screen, and the desktop page was checked to be
  identical pixel for pixel at five window sizes.
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
- Added single step: the NOR/SS slide switch on the board drawing now works.
  It was drawn and did nothing. On the board it sits on the same NMI line as
  HLT, through a gate that fires for every instruction fetched from outside
  the monitor, so at SS the processor executes one instruction of a program
  and hands back to the monitor. Click the switch across to SS and each RUN
  executes one instruction and shows the address of the next, with the
  registers at `$F3-$FE` to be read or changed; click it back to NOR and RUN
  lets the program go. The monitor itself is never stepped. This is the
  board's own single step, apart from the bench **Step** button, which is the
  emulator's. The page always opens with the switch at NOR. The user guide
  has the manual's procedure under Step through a program.
- Added the HLT key. It did nothing here, because its description in the
  manual says only that it raises an interrupt and not which. The manual's
  chapter on interrupts and the CPU schematic settle it: HLT puts a falling
  edge on the 6502's NMI line, and the monitor sends an NMI wherever the two
  bytes of RAM at `$03FC/$03FD` point. The key now does that, on the board
  drawing and as **H** on the keyboard. With the vector the emulator starts
  with, a running program stops, the monitor shows the address it had
  reached with the registers saved at `$F3-$FE`, and RUN takes it up again.
  A program can also store its own routine's address there and take the
  interrupt for itself; the manual's example of that, which lights every
  digit with an 8 for about sixteen seconds at each press, runs as printed.
  The user guide has a new section, HLT and interrupts.
- Added `tests/build-stamp.test.js`, which checks the home page's build date
  against the date of the latest commit as git records it, in the time zone
  the commit was made in (review of PR #47). The rule was written down in
  `AGENTS.md` but could only be checked by hand, and checking it from a time
  that GitHub shows, which is in UTC, gives the wrong day for an evening
  commit made west of Greenwich.
- Added `docs/amtape-format.md`, a reference for the `.amtape` file the
  emulator saves programs in (#19): the magic, the version byte, the
  identifier, the start and end addresses, the checksum and what it covers,
  the length, the data, a worked example, what a reader refuses and what it
  lets through, the limits, and what a future version must keep. Until now
  the format was defined only by the code that reads and writes it.
  `tests/amtape-format-doc.test.js` reads the document and checks its example
  and its table against what the emulator writes. The README links to it.
- Added a **Cassette** setting under Bench controls: **Instant**, the
  default, is LOAD and SAVE as they have always been here, done at once by
  the emulator; **Real time** runs the board's own routines from the cassette
  PROM against an emulated recorder (#20). In real time the page shows what
  the manual describes: the six displays go dark, the phase LEDs D4-D7 light
  in turn, D6 with D4 then D5 then D4 during SAVE and D7, dimmer, with D4
  then D5 during LOAD, and the routine takes about thirteen seconds for a
  short program. LOAD starts from the beginning of the tape and passes over
  the programs before the one asked for. A status line beside the buttons
  says what the recorder is doing. The page remembers the choice. The user
  guide has a new section, The cassette in real time, which also lists where
  the real routines behave differently from the instant ones.
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
- `compiler/README.md` now warns that HLT gives the three display fields to
  the monitor: it writes the halted address into `display.high` and
  `display.low` and the byte there into `display.data`, and RUN does not
  put back what the program had in them. A program that keeps its state
  in a display field loses it at a halt or under single step; the advice
  is to keep it in a variable. A test pins the behaviour. The last of the
  four small fixes agreed for Amico.
- Mended the random program generator behind
  `tests/compiler-differential.test.js`. Its seeds are small numbers, and
  the first choice it made from one came out the same way for nearly every
  seed, so that nearly every program had tables, by accident. The seed is
  now spread before use, tables are in four programs of five by choice, and
  the test's floors are measured again. Four programs written by hand now
  hold what the accumulator contains after the left side of a comparison,
  which the random programs caught only now and then.
- Recorded the owner's choice of words for leaving a loop in Amico, in
  `NextSession.md`, item 13: `for i in 0..5`, `break` and `next`, with
  `loop ... end` staying the endless loop. Nothing is built yet.
- `compiler/README.md` now says how a number may be spelt: leading zeros
  change nothing, so `021` is 21 and not octal, and hex digits may be of
  either case. The compiler already read them so, and so did the reference
  interpreter the tests hold it to, but the README, which that interpreter
  is meant to be written from, said nothing, so the two could have been
  wrong together. A test holds the spellings and the sentence.
- Raised the floors in `tests/compiler-differential.test.js` to what its
  comment says they are, about half of what the generator makes; the one
  for table reads was under a third. Corrected the header of
  `tests/compiler-assignment.test.js`, which gave its deeper run as 4.1
  million programs when it is 5.6 million. Both were found by a review of
  the tests. `AGENTS.md`, A Review by Several Agents, now says how the
  fixes themselves were reviewed and what that was good for.
- Corrected `compiler/README.md` where the check of the compiler found it
  wrong or silent. "The square table occupies 40 bytes" was the size of
  the whole program, 16 bytes of it the table. `squares` runs for ever, and
  nothing said to press RES before keying the LOAD for the next program:
  until then the keys go to `squares`. And after HLT, the RUN that resumes
  a program is returned by `keypad.press()` as key `$13`; the README now
  warns of it, and a test holds the README to the behaviour.
- Recorded what a check of the compiler found, in `NextSession.md`, item 13:
  no ordinary program compiles to wrong code, and a short list of faults at
  the edges, each reproduced. The owner had it run by five reviewers on
  five models, four Claude subagents and one Codex instance. `AGENTS.md`
  has a new section, A Review by Several Agents, on how that was done,
  what made it work and how to run the next one, which the owner asked
  for. Nothing in the compiler changed.
- Named the compiler's language Amico, the owner's decision, and said in both
  READMEs that it is new: written for this project in 2026, not ASEL's
  software and never part of the machine. They called it "the AMICO's
  byte-oriented language", which read as something that came with the board.
  `NextSession.md`, item 13, now records the design the owner settled the
  same day: what the language is to gain, what stays out of it, how programs
  longer than 508 bytes will use the second kilobyte, and what is still open.
  `AGENTS.md` has a section on the compiler, which it did not mention. The
  compiler itself is unchanged.
- Tablets held upright now get the handheld layout that phones have: the
  displays, LEDs, switch and keys in one column, with a picture of the board
  beneath. The owner found the board as drawn too small on an iPad Pro 11"
  held upright, with keys of 32 px and displays 188 px across; in the
  handheld layout they are 99 px and 480 px. The layout now applies up to
  1100 px wide instead of 640, which takes in every iPad held upright. A
  tablet or phone in landscape, and every desktop, keep the board as drawn.
  The guides and the README say "phone or tablet". Checked in emulation, and
  tried by the owner on a real iPad Pro 11" and, for the phone layout, a
  OnePlus 7T in Chrome: both passed.
- Corrected `NextSession.md`, which still said the Italian was not live after
  pull request 53 had put it on the site. Documentation only.
- The Italian now speaks as the manual does, in "noi". The supplement does
  at the keys what it describes, together with its reader: "Premiamo quindi i
  tasti", "non ci resta altro che indicare al nostro Amico 2000 l'indirizzo
  nel quale inizia il programma". The site gave orders to "voi", which the
  manual also does, but less. The owner asked for the "noi", and wherever
  the site teaches or walks through something it is now that:
  - All of `guida.html`: "Premiamo RES, poi AD e le quattro cifre
    dell'indirizzo", "A questo punto possiamo esaminare il contenuto di
    qualsiasi registro", "il nostro programma". Cautions are the author's
    "Avvertiamo che", "Consigliamo", "Attenzione:" or an impersonal "va
    lasciato", as in the manual. Five headings follow, among them
    "Introduciamo un piccolo programma", after the manual's "Introduciamo
    un primo programma". Every address, listing, key and link is where it
    was; only the prose changed.
  - On the home page, the notes under the board ("quello che abbiamo scritto
    in RAM", "Portiamolo su SS con un clic") and the tooltips of the LEDs
    ("può accenderlo anche un nostro programma").
  - The line at the end of the alert after a recording is read: "scriviamo
    il suo numero in $0000 e FF in $0002, poi facciamo partire il programma
    di lettura da $FC54", which is the manual's own sentence.
  - "Voi" stays in two kinds of place, as it does in the manual: a prompt at
    the moment something has to be done, "Premete RES." on the tape's status
    line, and the advice in an error about a file of the reader's own.
  - The English is unchanged. `tests/languages.test.js` fails if a "voi"
    comes back into the guide or onto the home page, and `AGENTS.md` has the
    rule under Two Languages.
- Wrote down in `AGENTS.md` how the Italian is to be written, after the owner
  asked that it keep the style and tone of the original documentation and
  not only its words: build each sentence on the manual's own sentence for
  the same thing, how the manual sounds, the kinds of English carried across
  word for word that a second agent's review found on the site, and that a
  reviewer's Italian points at a passage without being the text to use. The
  table of the Italian's words gains the program's number, the two cassette
  routines and the halves of an address, each with its page. `NextSession.md`
  records the review, a question it leaves for the owner, and something
  noticed on the way and left alone: a LOAD takes about seven seconds where
  the page says thirteen, in both languages. Documentation only.
- Recorded that the handheld layout for phones held upright was opened by the
  owner in Safari on an iPhone 17 Pro and looked right, with everything
  working. It had been checked only in headless Chrome emulation before. No
  other phone or browser has been tried on a real device. Documentation only.
- Changed the `AGENTS.md` guidance on attribution: an agent no longer puts a
  link to its session anywhere it is published. Commit messages ended with a
  `Claude-Session:` line and pull request descriptions with the session's
  address, both at the tool's own prompting. The owner asked for neither. The
  line saying an agent did the work stays, `Co-Authored-By:` on a commit and
  "Generated with" on a pull request. The three pull requests that still
  carried the link, 44, 45 and 50, had it removed; commits already pushed
  keep theirs, since removing it would rewrite history.
- Changed the NMI vector the emulator starts with, at `$03FC/$03FD`, from
  `$FE30` to `$FE00`. On the board those bytes hold whatever the RAM powered
  up with, the monitor never writes them, and the manual has the user key in
  `00` and `FE` to use the monitor's own interrupt routine; the emulator now
  starts with that, so that HLT halts a program without the step. `$FE30`,
  the monitor's main loop, was chosen before anything could raise an NMI and
  saved nothing of the program it interrupted. The IRQ vector, where a `BRK`
  goes, is unchanged at `$FE30`. RES leaves both alone, as before.
- Changed the links to ComputerHistory.it from Wayback Machine snapshots to
  the live site, which is back. The README's credit now links the site's
  main page on the machine,
  `https://computerhistory.it/computer/asel/amico-2000`, and its account of
  rebuilding one,
  `https://computerhistory.it/retrocomputing/retro-ricostruzioni/amico-2000`.
  `docs/computerhistory-amico2000.md` names both, and each of its 73 links
  was checked: the 39 that still answer are given as they are, 26 that do
  not are given as the Wayback Machine's real capture of them instead of a
  link built from one snapshot's date, and two that are gone with no copy
  say so. Most of the magazine scans on other sites are among the 26.
- Changed the `AGENTS.md` guidance on pushing. An agent used to need an
  explicit request before every `git push`, so finished work sat as commits
  on one machine until somebody asked. The final step after any commit, or
  the series of commits that makes up a piece of work, is now a push of the
  branch to the remote branch it tracks. Forcing a push is ruled out, and a
  rejected one is reported. Opening or merging a pull request, and every
  other change to GitHub state except closing an issue, still needs a request.
- Changed what an instant cassette LOAD or SAVE leaves in memory, to match
  the real routines in the cassette PROM (#41). SAVE no longer writes
  anything: it used to clear the start address at `$0000/$0001` when it
  worked and put `$FF` in `$0000` when it did not, and the real routine does
  neither. The addresses and identifier you keyed are still there afterwards,
  so a program can be changed and saved again without keying them a second
  time. A range that cannot be saved, an end address before the start or the
  whole `$0000-$FFFF`, now returns to the monitor with memory untouched, as
  the real routine does for the first of those. LOAD no longer overwrites
  `$0001/$0002` with the address it loaded at. What happened is shown beside
  the **Cassette** buttons and in the browser console instead: "Saved
  program 13", "Loaded program 13 at $0200", or "Not saved" and why.
  A LOAD that cannot be done still answers at once with `$FF` in `$0000`;
  that is the emulator's own convention and is kept, since the real routine
  would search for the program until RES. `amico.onCassetteTrap` is the hook
  the page uses. Anything that read `$FF` at `$0000` after a refused SAVE
  will no longer find it.
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
- Fixed three of `amicoc`'s messages that a review of the fixes above found
  still pointing the wrong way. `if 0 ==`, with nothing on the right, was
  told which operators exist; `if 0 =< 1+1` was told its right side was
  too much, when its operator is wrong. `x == 1` and `if.scan()` after a
  `stop` were unreachable statements, and are no statements at all. And
  `if = 1` and `const = 1` were read as a comparison and a declaration
  gone wrong, where `byte = 1` was already told that `byte` is a word of
  the language.
- Fixed `amicoc` reporting a file with no statement in it at a line past
  the file's end: a one-line file holding only a comment was wrong at
  "Line 2". It is now refused as a whole, "The program has no statement
  to run", as a program that is too long is. Found by the check of the
  compiler.
- Fixed two things `amicoc` refused that it should take. `keypad.read ()`
  and `display.scan ()`, with a space before the brackets or inside them,
  were refused, where spaces are free round an operator. And a table's
  first index had to be the character `0`: `$0` and `00`, which are the
  same byte, were refused with the general message for a table. A table
  that starts anywhere else is now told "A table's index starts at 0".
  Found by the check of the compiler.
- Fixed `amicoc` calling a misspelt line unreachable when it followed a
  `stop` or a loop: `ennd` after `stop` was "Unreachable statement". A line
  that is no statement is now "Unknown statement" wherever it stands.
  Found by the check of the compiler.
- Fixed three of `amicoc`'s messages that named the wrong mistake. A
  comparison with an operation on its right, `if a == b + 1`, was told
  which operators exist; it is now told that the right side is a single
  value and the operation goes on the left. A word of the language used as
  a name, such as `byte` or `in`, and a table declared twice were both
  "Invalid byte variable"; each now says what it is. The README gives the
  rule for a comparison's two sides and lists the eleven words. Found by
  the check of the compiler.
- Fixed `amicoc` reading a source file with CR-only line endings, as old
  Macs wrote them, as a single line. With a `#` comment in it, every
  statement after the comment was dropped and the compile succeeded;
  without one the error quoted the whole file. A line now ends at LF, at
  CR LF or at a CR alone. Found by the check of the compiler.
- Fixed a compiled program of exactly 257 bytes that the board's own LOAD
  routine could not load. The cassette PROM loses the last byte of a block
  one byte longer than a whole number of pages, so the program's closing
  `JMP $FE22` arrived as `JMP $0022`; the cassette's Instant setting hid
  it. `amicoc` now ends such an image with one byte of filler, and says so
  in the listing. Found by the check of the compiler (`NextSession.md`,
  item 13).
- The site no longer publishes the repository's documents as web pages. A
  check of the live site for search engines found that GitHub Pages was
  running Jekyll over the repository and serving every Markdown document as
  a page of its own, each with a title such as "AGENTS.md | amico2000" and a
  canonical address: 22 pages, among them the guidance for agents, the
  session handover, the engineering logs and the text of the 1980
  supplement, beside the three pages the site means to have. An empty
  `.nojekyll` at the root turns the Jekyll build off. The home page and the
  guides were never touched by it and are served as before; the documents
  stay readable on GitHub and as plain files. `robots.txt` said the rest of
  the repository "is not served as pages", which is now true.
  `tests/site-files.test.js` holds `.nojekyll`, Google's verification file,
  the sitemap's addresses and the guides' `hreflang` pairs.
- `sitemap.xml` gave 2026-11-22 as the last change to all three pages; the
  tablet layout changed the guides and the home page on 2026-11-23, and
  their `lastmod` now says so. The file was checked against the
  sitemaps.org schema and each address answers on the live site.
- `robots.txt` no longer implies that search engines find the sitemap
  through it. They read `robots.txt` only at the root of a host, and the
  site is served from `/amico2000/` on `ascasso.github.io`, so its Sitemap
  line is never read. A comment in the file says so; the sitemap is given
  to Google in Search Console.
- Corrected how long the page says a LOAD takes with **Cassette: Real
  time**, in English and in Italian. The tooltip of **Real time** promised
  "thirteen seconds or more" and both guides "about thirteen seconds for a
  short program", for LOAD and SAVE alike. Thirteen is a SAVE. A LOAD of the
  first program on the tape is done in about seven, because the routine
  returns to the monitor once the program has been read and does not wait
  for the leader that closes it, as the manual says: "Quando la lettura del
  testo è finita sul display appare 0000 01". The tooltip, the two guides
  and the README now give both figures, and `tests/tape-recorder.test.js`
  holds the guides to what the routines take: about 12.5 s for a SAVE and
  6.8 s for a LOAD, each plus a second for every 41 bytes.
- Fixed the message shown after a sound recording is read, which told its
  reader how to LOAD a program in a way that put it at the wrong address, in
  English and in Italian alike. It said to put the program's number in
  `$0000` and run from `$FC54`. The LOAD routine loads at the address in
  `$0001/$0002` unless `$0002` holds `FF`, and after a cold reset both are
  zero, so a program recorded at `$0200` went to `$0000`, on top of the
  number just keyed. The message now says to put `FF` in `$0002` as well,
  which loads the program where it was recorded, as the manual has it and as
  the guide already said. Found by a second agent's review of the Italian.
  `tests/languages.test.js` now follows the message's own keys on a board
  just switched on.
- Corrected three passages of the Italian that said something the English
  beside them does not, found by the same review:
  - The tooltip of **Tempo reale** promised "i quattro LED accesi", all four
    lit. They are never lit together: two at a time, as the guide describes.
    It now says that the LEDs show the phase.
  - The Italian guide said a ROM file shorter than 512 bytes is "scritto in
    parte", written in part, as if some of the file were dropped. Every byte
    of it is copied; it is the ROM that is only partly replaced, and the
    guide now says that.
  - A WAV file without its data was said to "contain no sound", which reads
    as a silent recording. A silent recording is read like any other. The
    message now says the file has no audio data.
- Reworded Italian that was correct in what it meant but did not read as
  Italian, most of it English carried across word for word. Three passages
  are the review's and four turned up when the rest was read again for the
  same faults:
  - The tooltips of the LEDs D4-D7 joined "si accende durante..." to "oppure
    da un vostro programma", which Italian grammar does not allow. Each now
    ends "può accenderlo anche un vostro programma".
  - In the guide, "Guardatevi intorno" for "Look around" is now the manual's
    own way of saying it, "A questo punto potete esaminare il contenuto di
    qualsiasi registro o locazione di memoria"; and "Comprendete il
    ticchettio", which reads first as "understand the ticking", is
    "Conservate il ticchettio".
  - Also in the guide: "RES vi rimedia" and "reintroducetevi", where "vi"
    can be read as "you"; and two sentences that had the reader "start an
    address" with RUN.
- The Italian now calls the NOR/SS switch "interruttore", the manual's word
  for it, on the home page, in its tooltip and in the guide. It said
  "commutatore", which is a fair name for a two-way slide switch but appears
  nowhere in the manual: the parts list has "SS, interruttore unipolare",
  the assembly instructions "l'interruttore SS", and the chapter on single
  step "l'interruttore del single step". Likewise a program on the home page
  "gira in un loop", as the manual and the guide say, and is no longer
  "chiuso in un ciclo". The table of the Italian's words in `AGENTS.md` has
  both.
- Corrected what the page and the documentation said about the LEDs D4-D7:
  that they light only with **Cassette: Real time**. They light for any
  program that drives them, at either setting. What is true is that the
  monitor and the instant cassette never do. The LEDs' tooltips, the README,
  `AGENTS.md` and `NextSession.md` now say so.
- Fixed the sound decoder returning nothing from a recording in which one
  program's length was damaged (review of PR #47). A block is as long as its
  own byte count says, and a spoiled count can claim thousands of bytes the
  block does not have. The decoder read on through the programs that
  followed, found the recording short, and then carried on searching from
  where that had left it, which was the end. It now looks again from just
  past the damaged block's start byte, as it already did after a checksum
  mismatch, so the programs after the damage are still read.
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
