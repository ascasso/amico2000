# AMICO 2000 Next Session

## North Star

Make the emulator behave as closely as practical to the original AMICO 2000.
Prefer evidence from the monitor ROM, the Sperimentare manual and observed
hardware over convenience abstractions. Priority order:

1. Original AMICO 2000 behavior: monitor workflow, keyboard, display, memory
   map, PIA behavior.
2. Original NMOS 6502 behavior: flags, stack frames, interrupts, decimal mode,
   branch/page timing.
3. Small targeted verification that protects the above.
4. Cassette support, useful but secondary.
5. Large conformance or test-framework projects, only after core behavior is
   trustworthy.

## Where Things Stand (2026-11-21)

- **Publishing:** agents push `develop` when their commits are done
  (`AGENTS.md`). GitHub Pages builds from `master`; work on `develop` reaches
  the live site only through a merged pull request, which is still opened and
  merged on request. Pull request 47,
  `https://github.com/ascasso/amico2000/pull/47`, carries the cassette work of
  2026-11-21 and was open when this was written.
- **CPU:** the core passes the Klaus Dormann functional suite (`#18`) and has a
  regression check for each earlier fix (`#17`). `node --test tests/` runs 171
  checks offline with no dependencies.
- **Board:** the home page draws the board from two private photographs of
  real boards. Read Board Artwork in `AGENTS.md` before touching it, including
  the rule that the photographs and their owners stay out of the repository.
  The displays have a Readable look (the default) and an Authentic one, and
  go dark when nothing is scanning them, as on the board.
- **PROMs:** both are fitted at startup, the monitor (IC9) and the cassette
  PROM (IC10).
- **Cassette:** LOAD and SAVE work on the emulator's own tape records, which
  come and go as `.amtape` files or as `.wav` sound files. By default they
  are trapped at `$FC54` and `$FBBC` and instant. With **Cassette: Real
  time** the PROM's own routines run against an emulated recorder, with the
  phase LEDs lit (`#20`, closed).
- **Open issues:** none.
- **History:** `CHANGELOG.md` and `docs/logs/`. The latest log is 2026-11-21.

## Outstanding

In rough priority order. None of it is started.

1. **HLT is not emulated.** The manual says only that HLT "genera una
   interruzione a livello CPU". Establish which line it drives, NMI or IRQ,
   and what the RAM vectors at `$03FC-$03FF` should hold when it fires; the
   emulator's seed of `$FE30` is its own choice, not the ROM's. Lead: the
   supplement's schematic, whose CPU block is on PDF page 25 (render it with
   `pdftoppm -r 400 -f 25 -l 25 -png`; the PDF is too large for the Read tool).
   A second lead, unverified: the routine at `$FE00` saves the registers and
   the interrupted PC (which REG then recalls) and is reachable only through
   those RAM vectors, so HLT with a vector to `$FE00`, then REG and RUN, may be
   the intended halt-and-resume.
2. **Machine-layer checks** for display multiplexing, pattern by pattern (how
   Port A and Port B writes become the six-pattern buffer; when digits go
   dark is covered), and the `$FD00-$FDFF` partial decoding.
   `tests/keyboard-matrix.test.js` shows the pattern: run the real monitor in
   Node and assert on RAM or PIA state.
3. **One phase LED is unexplained.** D4-D7 are modelled as the schematic
   wires them and light when the real cassette routines run. By that wiring
   all four are dark while the monitor idles, yet unit A's photograph shows
   D7 lit at idle. Nothing accounts for it.
4. **Board drawing, unverified ends.**
   - Only Chrome has been used. Safari, Firefox, touch and screen readers
     have not been tried, nor the key legends on systems without the macOS
     DIN faces.
   - On a phone the board pans sideways and the keys start off screen.
     Reflowing it is an owner decision.
   - The measurement table and the browser-check scripts live with the
     private photographs, outside the repository. Whether they belong in it
     is the owner's call.
5. **Speed multiplier, requested by the owner, not started.** Three settings:
   **1x**, the default, which is today's behaviour and stays as close to the
   real board as the emulator can manage; **10x**; and **Max**, as fast as
   the browser can run it.
   - The speed is set in one place: `_runFrame()` in `amico2000.js` hands the
     CPU `cyclesPerFrame` (16667) cycles for each 16.667 ms of real time, and
     caps the catch-up at two frames' worth. 10x multiplies both. Max needs a
     time budget in place of a cycle budget: run the CPU in chunks until most
     of the frame is spent, then yield so the page can draw and take input.
   - It is an emulator control, not part of the board, so it belongs under
     Bench controls beside **Displays**, remembered in `localStorage` the way
     the display look is.
   - Check first how the monitor treats a held key. `pressKey()` releases an
     on-screen key after 100 ms of real time, which at 10x is a full second
     to the monitor, and longer at Max. That is harmless if the monitor waits
     for release and wrong if it repeats; the ROM was not read to find out.
   - Not measured: how fast Max is. The monitor never sleeps, it idles in its
     scan loop, so Max keeps a processor core busy while the page is open.
   - Unaffected: the trapped cassette LOAD and SAVE, which are instant at any
     speed. The real-time cassette keeps time by CPU cycles, so it would run
     faster with the processor, which is probably what a user wants from it. The display is still drawn once per frame, so a program that
     animates the digits shows only some of its steps.
6. **Ideas, not started:** a pass on wear and physical irregularity, sound,
   and a desk scene around the board.

## Cassette Work (Secondary)

- `#19`, document the `.amtape` format, is closed: `docs/amtape-format.md`.
  Writing it down showed two things the parser lets through, which the
  reference states and nothing has changed: an end address that disagrees
  with the start and the length, and a length of zero. Tightening either
  would refuse files the present reader accepts, so it is a decision, not a
  tidy-up.
- `#20`, analog fidelity, is closed. `AGENTS.md` has it under Cassette Sound
  Format. What it did not settle:
  - **No real recording has been through the decoder.** The owner is asking
    owners of the machine for one. When one arrives, try it first; if it does
    not read, `detectPulses()` in `tape-audio.js` is where to look, and the
    recording's own pulse shape should replace the guesses in the test's
    simulated faults. A recording must not be committed without its owner's
    leave.
  - Nor has a real board been played a WAV file written here.
  - The emulated recorder plays the emulator's list of programs, laid out as
    SAVE would have written them. It cannot play a recording as it was made:
    a `.wav` is decoded to programs on import and what does not decode is
    lost. Keeping an imported recording's own pulse times as the tape, so
    that the real LOAD routine is the one to read it, would be the faithful
    way, and the pieces are there: `detectPulses()` gives the times and
    `createRecorder()` plays times.
  - The recorder has no keys, no rewind and no sound. The board starts and
    stops it, and every LOAD begins at the start of the tape.
  - The look of an LED during LOAD, `.led.on.dim`, is a guess.
  - A mode word does not clear the 8255's output latches, which the data
    sheet says it does. Nothing in the ROMs depends on it. A user program
    that set its ports before its mode word would behave differently here.
    `docs/8255-data-sheet.md` has the sheet's words, the link to Intel's own
    copy, and two smaller differences: the control register reads back, and
    reading Port A ignores its direction.
  - There is no button for saving a tape, as sound or as `.amtape`; both are
    console commands.
- `#41`, the traps against the real routines, is closed. The traps now leave
  in `$0000-$0004` what the routines leave, and SAVE has no status byte.
  Four differences were kept on purpose and are listed in `AGENTS.md` under
  Cassette Interface Reference, each pinned by
  `tests/cassette-trap-parity.test.js`. The one a later session might
  revisit is the last byte of a block one byte longer than whole pages,
  which the PROM loses and an instant SAVE keeps: making Instant lose it too
  would be truer to the board and would lose a user's byte by default. It
  needs `blockOffsets()`, which lives in `tape-audio.js`, on the machine's
  side of the line.

## How to Verify

- `node --check` on changed scripts, `node --test tests/`, `git diff --check`.
  No build system and no test framework (`AGENTS.md`).
- Browser: `python3 -m http.server 8000`. Headless Chrome driven over the
  DevTools protocol in real time checks the page as served: scripts evaluated
  through the protocol are not subject to the page's CSP, and
  `requestAnimationFrame` runs at 60 Hz. Avoid `--virtual-time-budget`, which
  stops `requestAnimationFrame` and so the emulator. The page also runs from
  `file://`.
- If behavior and documents disagree, trust the ROM, the manual and verified
  behavior, and fix the documents.
