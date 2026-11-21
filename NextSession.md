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

- **Publishing:** GitHub Pages builds from `master`; work on `develop` reaches
  the live site only through a merged pull request.
- **CPU:** the core passes the Klaus Dormann functional suite (`#18`) and has a
  regression check for each earlier fix (`#17`). `node --test tests/` runs 115
  checks offline with no dependencies.
- **Board:** the home page draws the board from two private photographs of
  real boards. Read Board Artwork in `AGENTS.md` before touching it, including
  the rule that the photographs and their owners stay out of the repository.
  The displays have a Readable look (the default) and an Authentic one.
- **PROMs:** both are fitted at startup, the monitor (IC9) and the cassette
  PROM (IC10). Cassette LOAD and SAVE are trapped at `$FC54` and `$FBBC` and
  use `.amtape` files.
- **Open issues:** `#19`, `#20`, `#41`.
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
2. **Machine-layer checks** for display multiplexing (how Port A and Port B
   writes become the six-pattern buffer) and the `$FD00-$FDFF` partial
   decoding. `tests/keyboard-matrix.test.js` shows the pattern: run the real
   monitor in Node and assert on RAM or PIA state.
3. **`#41`: the cassette traps differ from the real routines** in what they
   leave in `$0000-$0004`: SAVE writes a status the real routine never writes,
   LOAD overwrites `$0001/$0002`, and LOAD of a missing identifier returns
   `$FF` where the real routine keeps searching until RES. Decide which to
   bring into line; the issue lists the cases and the tests that assert them.
4. **The phase LEDs D4-D7 are drawn but never lit.** The wiring is settled
   (`AGENTS.md`, Cassette Interface Reference): an LED is lit while Port B
   bit 7 and its own Port A bit are both high, and the monitor never sets
   bit 7. Lighting them needs a per-frame duty model in the machine layer,
   because LOAD only pulses them. Before building it, confirm the recollection
   that an 8255 clears its outputs when a mode word is written (`_writePIA`
   does not). Unexplained: unit A's photograph shows D7 lit at idle.
5. **Board drawing, unverified ends.**
   - Only Chrome has been used. Safari, Firefox, touch and screen readers
     have not been tried, nor the key legends on systems without the macOS
     DIN faces.
   - On a phone the board pans sideways and the keys start off screen.
     Reflowing it is an owner decision.
   - The measurement table and the browser-check scripts live with the
     private photographs, outside the repository. Whether they belong in it
     is the owner's call.
6. **Archive links:** in `docs/computerhistory-amico2000.md`, every link other
   than the four PROM images is untested.
7. **Ideas, not started:** a pass on wear and physical irregularity, sound,
   and a desk scene around the board.

## Cassette Work (Secondary)

- `#19`, document the `.amtape` format: a 9-byte `AMICOTAPE` magic, version
  `1`, identifier, start, end, checksum and length, then the bytes. The parser
  does not check that start, end and length agree. `.amtape` is the
  emulator's container, not the tape record, whose layout is in `AGENTS.md`.
- `#20`, analog fidelity: with `amico.cassette.interceptROM = false` the real
  SAVE runs to completion (332 bit/s, a 6.2 s leader; the manual says about
  300 and about six). LOAD cannot yet: it reads tape input on Port A bit 7,
  which nothing drives, and switches Port A's direction with the 8255 control
  word, which the PIA emulation ignores.

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
