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

That list is about the board. On 2026-11-22, with every part of the board
working as the documents describe it, the owner chose what comes next: the
machine's software. See item 1 under Outstanding.

## Where Things Stand (2026-11-22)

- **Publishing:** agents push `develop` when their commits are done
  (`AGENTS.md`). GitHub Pages builds from `master`; work on `develop` reaches
  the live site only through a merged pull request, which is still opened and
  merged on request. Pull request 51,
  `https://github.com/ascasso/amico2000/pull/51`, took the guide's section on
  the LEDs into `master` on 2026-11-22, the phone layout having gone in
  earlier that day with pull request 50, so both and everything before them
  are live. What was committed after it, the rule in `AGENTS.md` against
  publishing a session link and this file's plan for the shelf of programs,
  changes nothing on the site; it is on `develop` and goes in with the next
  pull request.
- **Attribution:** no link to an agent's session in a commit message, a pull
  request or anywhere else published (`AGENTS.md`, Agent Operating Contract).
  The `Co-Authored-By:` and "Generated with" lines stay.
- **CPU:** the core passes the Klaus Dormann functional suite (`#18`) and has a
  regression check for each earlier fix (`#17`). `node --test tests/` runs 198
  checks offline with no dependencies.
- **Board:** the home page draws the board from two private photographs of
  real boards. Read Board Artwork in `AGENTS.md` before touching it, including
  the rule that the photographs and their owners stay out of the repository.
  The displays have a Readable look (the default) and an Authentic one, and
  go dark when nothing is scanning them, as on the board.
- **PROMs:** both are fitted at startup, the monitor (IC9) and the cassette
  PROM (IC10).
- **Phones:** held upright, the page uses a handheld layout; see item 2.
- **Programs:** the site offers none to load. The guide prints a few short
  ones to key in. See item 1.
- **Keys:** all 23 work. HLT is the NMI line and halts a running program,
  which RUN then resumes. The NOR/SS slide switch works too: at SS each RUN
  executes one instruction.
- **Cassette:** LOAD and SAVE work on the emulator's own tape records, which
  come and go as `.amtape` files or as `.wav` sound files. By default they
  are trapped at `$FC54` and `$FBBC` and instant. With **Cassette: Real
  time** the PROM's own routines run against an emulated recorder, with the
  phase LEDs lit (`#20`, closed).
- **LEDs:** D4-D7 are not the cassette's alone. A program can light them at
  either Cassette setting, and the guide has two that do (`AGENTS.md`, The
  LEDs D4-D7 Under a Program). Read from the schematic, not tried on a real
  board.
- **Open issues:** none.
- **History:** `CHANGELOG.md` and `docs/logs/`. The latest log is 2026-11-22.

## Outstanding

In rough priority order. None of it is started.

1. **Give the machine its software: a shelf of programs and a guide on
   screen.** Agreed with the owner on 2026-11-22 as the next piece of work.
   The site offers no programs: a visitor meets a board showing `0000 00` and
   has to key in hex, and on a phone, where there is no console, nothing runs
   any other way.
   - **What the owner asked for**, as a suggestion and not a specification:
     buttons or menus that are easy to follow, leading to a catalog of
     programs to pick from and load into memory, and a wizard on the screen
     that guides the user.
   - **Load it for them, but leave the keys to them.** Picking a program puts
     its bytes in memory. The guide then has the visitor start it on the
     keypad, AD, the address, RUN, with the next key lit on the board. A
     button that runs the program would skip the part that is this machine.
   - **The guide is a strip beside the keys, not a pop-up**, which would
     cover the keys it is talking about. On a phone the first screen is full,
     with 2 px to spare on the smallest, so the strip takes the title's place
     while a program is active, and the catalog is a sheet over the whole
     screen, opened from one button. On a desktop, a button under Bench
     controls and a card under the board. The board drawing is not touched,
     and the desktop page stays as it is apart from those additions: the
     owner's condition for the phone layout applies here too.
   - **A program is data.** Its name, one line on what it does, where it is
     from (document and page), its bytes and load address, where to start it,
     and its steps, each a sentence and the keys to press. A step is done
     when its keys have been pressed. Then a test can press the guide's own
     keys on the real monitor and check that the program runs, which is the
     standard `tests/user-leds.test.js` holds the guide's listings to. Keep
     the catalog in a script with the bytes in it, as the ROMs are: the page
     has to run from `file://` and under its CSP, so nothing is fetched.
   - **Say what each program is:** an original listing, with its page; a
     reconstruction; or written for this site.
   - **Show a listing as it was on paper:** address, byte and mnemonic side
     by side, the way the manual prints them. The owner programmed the
     original as a schoolboy, writing assembly on paper and translating it by
     hand from the table of opcodes.
   - **First program: a word on the displays**, the owner's choice. The
     supplement has it as an exercise on PDF page 68: `20 7E FF 4C 00 03` at
     `$0300`, which calls the monitor's display routine at `$FF7E` for ever.
     That routine shows the six bytes at `$008F-$0094`, one for each digit
     from the left, bit 0 for segment a up to bit 6 for g. The manual's word
     is ASEL, `77 6D 79 38 00 00`, and it invites the reader to go further
     ("se siete bravi"). Run as printed on 2026-11-22, in Node and on the
     page, the displays read ASEL. It is twelve bytes, short enough for the
     visitor to key in, so here the guide can teach the whole of it: the
     visitor picks a word of up to six letters, sees each letter's code and
     which letters seven segments cannot make, translates the two
     instructions by hand, keys everything in and runs it. The manual gives
     codes for A, S, E and L only on that page, and says the way to control
     single segments is explained in the hardware part of its next chapter;
     look there before drawing letters of our own. A Z can only be given
     the segments of a 2, and the guide should say so.
   - **Second program: text sliding across the displays**, a reconstruction.
     The owner remembers writing one that slid a name of two words, thirteen
     characters, across the six displays, and is fairly sure that it slid
     and did not show one word after the other. No listing survives, so it
     is to be written again as a real program for the board and labelled a
     reconstruction. Whatever waits between steps has to keep calling
     `$FF7E`: nothing else keeps the displays alight, and an idle delay loop
     darkens them, on the board as in the emulator. Two things about its
     letters, from the owner on 2026-11-22. The Z in the name was shown as a
     y: of that the owner is certain, without remembering why, since the
     segments of a 2 would have served. The rebuilt program should show a Z
     as a y too, as its one quirk, unless the owner says otherwise. And the
     capital G may have been a small g, drawn like a 9; of that the owner is
     not sure. The name in it was a private person's. It stays out of the
     repository and off the site; the catalog's version slides the visitor's
     own text, or something neutral such as AMICO 2000.
   - **Then, one at a time:** the LED counter from the guide, written for
     this site; the manual's HLT example, which `tests/hlt-nmi.test.js`
     already runs as printed; the 1979 clock, whose transcription is
     verified, with the values it takes at `$0000-$0002` and the calibration
     address the article appears to misprint; and the listings in
     `docs/manual-extraction/listings/` still marked `candidate`, among them
     Master Mind and the matchstick game 21 fiammiferi. A candidate has to be
     checked byte by byte against the rendered page before it goes on the
     shelf (the README there has the statuses), and every program needs its
     test.
   - **Left for later:** the same programs on the emulated cassette, for
     anyone who wants to LOAD them as in 1980, and a link that opens the
     page with a chosen program.
   - **To settle while building:** what picking a program does to a machine
     that is running something (RES and then the bytes, leaving the rest of
     RAM alone, is the gentle choice), and where the one button goes on a
     phone's first screen without costing a key row.
2. **Try the phone layout on a real phone.** It comes before the guide of
   item 1 is built, which has to fit the same screen. The owner asked for the
   page to work on a phone held upright, the way the owner uses one, and left
   the choice of how to the agent. The handheld layout was built on 2026-11-22
   (`AGENTS.md`, Handheld Layout): on an upright touch screen the displays,
   LEDs, switch and keys move into one column above a picture of the board.
   It was checked only in headless Chrome with touch emulation. Ask the owner
   how it is on the owner's own phone, and fix what that shows. Known rough
   edges, none of them blocking:
   - On the smallest common screen, an iPhone SE with Safari's toolbars, the
     last key row ends 2 px from the bottom and the maker's mark is below it.
   - Turned to landscape, a phone gets the board as drawn, and the title
     pushes the bottom rows of keys below the fold. The owner keeps rotation
     locked, so this was left; a compact title for short landscape screens
     would be the fix.
   - The pictures left in the board drawing are static: they do not light up
     with the real displays and LEDs.
   - Tablets in portrait wider than 640 px keep the board as drawn, at about
     the size a desktop window shows it.
3. **Two interrupt decisions are the owner's to confirm.** HLT and the
   NOR/SS single-step switch both work now (`AGENTS.md`, HLT and the NMI
   Line). Both go through the NMI vector at `$03FC/$03FD`, which the board
   leaves to the user and the emulator has to start with something in. It
   starts with `$FE00`, the monitor's own routine and the value the manual
   has the user key in; it was `$FE30`. The IRQ vector, where a `BRK` goes,
   was left at `$FE30`. Making it `$FE00` too would turn a `BRK` into a
   breakpoint that shows where it was, and would change what programs that
   end in `BRK` do today.
4. **Machine-layer checks** for display multiplexing, pattern by pattern (how
   Port A and Port B writes become the six-pattern buffer; when digits go
   dark is covered), and the `$FD00-$FDFF` partial decoding.
   `tests/keyboard-matrix.test.js` shows the pattern: run the real monitor in
   Node and assert on RAM or PIA state.
5. **One phase LED is unexplained.** D4-D7 are modelled as the schematic
   wires them and light when the real cassette routines run or a program
   drives them. By that wiring
   all four are dark while the monitor idles, yet unit A's photograph shows
   D7 lit at idle. Nothing accounts for it.
6. **Board drawing, unverified ends.**
   - Only Chrome has been used. Safari, Firefox, touch and screen readers
     have not been tried, nor the key legends on systems without the macOS
     DIN faces.
   - The measurement table and the browser-check scripts live with the
     private photographs, outside the repository. Whether they belong in it
     is the owner's call. The three checks of the cassette written on
     2026-11-21 are there too, as `cassette-files.mjs`, `cassette-realtime.mjs`
     and `cassette-instant.mjs`; they hold nothing private.
7. **Speed multiplier, requested by the owner, not started.** Three settings:
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
     faster with the processor, which is probably what a user wants from it.
   - The display is still drawn once per frame, so a program that animates
     the digits shows only some of its steps.
8. **Ideas, not started:** a pass on wear and physical irregularity, sound,
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
  `file://`. The cassette in real time has to be watched in real time: a
  SAVE and a LOAD are over twenty seconds between them.
- A pull request gets an automated review when it is opened. Its findings
  are worth reading and are not always right: of the two on pull request 47,
  one was a real bug and one misread a commit's date. `AGENTS.md` now has a
  test for the date.
- If behavior and documents disagree, trust the ROM, the manual and verified
  behavior, and fix the documents.
