# Open Work, in Detail

`NextSession.md` says what to work on next and lists what is open, a line
or two to an item. This document has the detail of each item, under the
same numbers. Until 2026-11-24 all of it was in `NextSession.md`, and the
logs up to that day cite it there by these numbers.

Two items have documents of their own:

- **1, the shelf of programs and the guide on screen:**
  `docs/program-shelf.md`.
- **13, Amico:** `docs/amico-design.md`.

When an item is done, take it out of here and out of `NextSession.md`; the
changelog and the log are where finished work is recorded. An item keeps
its number, and a new one takes the next number.

## 2. The phone layout on real phones

The handheld layout (`AGENTS.md`, Handheld Layout, which has what it was
tried on) has been seen by the owner on one iPhone, one Android phone and
one iPad Pro 11", each held upright, and found right on all three.
Whatever items 1 and 3 add has to fit the same first screen. Known rough
edges, none of them blocking:

- On the smallest common screen, an iPhone SE with Safari's toolbars, the
  last key row ends 2 px from the bottom and the maker's mark is below it.
- Turned to landscape, a phone gets the board as drawn, and the title
  pushes the bottom rows of keys below the fold. The owner keeps rotation
  locked, so this was left; a compact title for short landscape screens
  would be the fix.
- The pictures left in the board drawing are static: they do not light up
  with the real displays and LEDs.
- On a tablet the handheld layout is the phone's, larger: the title stays
  in its compact phone size, the language link in its two letters, and
  the keys fill a column about half the screen's width. It fits the first
  screen, and the owner found it right on the iPad Pro 11".
- An iPad with a trackpad or mouse attached was not tried. If it reports
  a fine pointer it gets the board as drawn.

## 3. The site in Italian: done, with these ends loose

Built on 2026-11-22 and live. `AGENTS.md`, Two Languages, has how it is
made, the manual's words and its "noi". What is left:

- **No person is known to have read the Italian through.** The sessions
  that wrote it have, and a second agent, Codex, reviewed it at the
  owner's request; what it found is put right (the log of 2026-11-22).
- **"Voi" was kept on purpose in two kinds of place,** a prompt on the
  tape's status line ("Premete RES.") and the advice in an error about a
  file of the reader's own, because the manual keeps it there too. If the
  owner wants those in "noi" as well, they are five strings in `lang.js`.
- **What the owner's own reading is still needed for.** The Italian
  follows the manual's vocabulary and voice; whether it sounds right to
  someone who read *Sperimentare* is for the owner to say. The words most
  worth a look are the labels:
  "Comandi dell'emulatore" for Bench controls, "Reset a freddo", "Passo",
  "Display: Leggibili / Autentici", "Cassetta: Immediata / Tempo reale",
  and "in esecuzione", "fermo", "bloccato" beside the run lamp. Changing
  a label means changing it in `index.html` and where `guida.html` quotes
  it; `tests/languages.test.js` names the ones it holds together.
- **The home page has no Italian address.** One address serves both
  languages, so Google and a link pasted into a forum or a chat show the
  English title and description, whatever the reader's language. The
  Italian guide has its own address and Italian head, and links to the
  emulator with `?lang=it`. A home page at an address of its own would
  need the board drawing twice, kept in step by hand. A small page that
  only carries an Italian title and description and passes the visitor on
  to `index.html?lang=it` would give a link to share, but how each search
  engine and preview treats such a page was not looked into.
- **Only Chrome has shown it.** The language link was tried in headless
  Chrome, on the desktop and in the handheld layout by emulation. Safari,
  Firefox and a real phone have not, and neither has a screen reader.
- **The guide is out of date in two places, in both languages:** it tells
  a reader on a narrow screen to scroll the board sideways, which is no
  longer true of a phone held upright; and it sends someone who wants to
  keep a tape to the console (item 5).
- **The README is in English.** It is a document, and the owner's rule
  leaves documents in English, but it is also what a visitor to the
  repository reads first. It now says the site has an Italian version.

## 4. Ask the people who had one

From the review of 2026-11-22. The first
audience is also where the missing evidence is. Nothing here has been
compared with a real board or a real tape: no recording has been through
the decoder, the look of an LED during LOAD is a guess, D7 lit at idle on
unit A is unexplained, and no program a user wrote survives. The page
links to GitHub and to ComputerHistory.it and never asks the visitor
anything. A few lines under About this board, in both languages, could:
did you have one, do you still have a tape, a listing, a photograph, a
memory of how it behaved. How they would write back is the owner's call,
since an address on the page is public. A tape or a photograph that
arrives belongs to its sender and goes into the repository only with
leave, as the two board photographs did not.

## 5. Keep an afternoon's work

From the review of 2026-11-22. Someone who
keys in a program of their own loses it when the page is reloaded: RAM and
the cassette's records last for the page session, and getting a tape out
is `debug.saveTape()` in the browser console, which a phone does not have.
On the board the cassette was where work was kept, and it is the faithful
answer here too, not a snapshot of RAM: the cassette's records kept in
`localStorage`, so that the tape is still in the recorder at the next
visit, and buttons on the page for taking a tape out as a file and
putting one in. Cassette work, at the end of this document, already lists
the missing button.

## 6. Two interrupt decisions are the owner's to confirm

HLT and the
NOR/SS single-step switch both work now (`AGENTS.md`, HLT and the NMI
Line). Both go through the NMI vector at `$03FC/$03FD`, which the board
leaves to the user and the emulator has to start with something in. It
starts with `$FE00`, the monitor's own routine and the value the manual
has the user key in; it was `$FE30`. The IRQ vector, where a `BRK` goes,
was left at `$FE30`. Making it `$FE00` too would turn a `BRK` into a
breakpoint that shows where it was, and would change what programs that
end in `BRK` do today.

## 7. Machine-layer checks

for display multiplexing, pattern by pattern (how
Port A and Port B writes become the six-pattern buffer; when digits go
dark is covered), and the `$FD00-$FDFF` partial decoding.
`tests/keyboard-matrix.test.js` shows the pattern: run the real monitor in
Node and assert on RAM or PIA state.

## 8. One phase LED is unexplained

D4-D7 are modelled as the schematic
wires them and light when the real cassette routines run or a program
drives them. By that wiring
all four are dark while the monitor idles, yet unit A's photograph shows
D7 lit at idle. Nothing accounts for it.

## 9. Board drawing, unverified ends

- Only Chrome has been used. Safari, Firefox, touch and screen readers
  have not been tried, nor the key legends on systems without the macOS
  DIN faces.
- The measurement table and the browser-check scripts live with the
  private photographs, outside the repository. Whether they belong in it
  is the owner's call. The three checks of the cassette written on
  2026-11-21 are there too, as `cassette-files.mjs`, `cassette-realtime.mjs`
  and `cassette-instant.mjs`; they hold nothing private.

## 10. Speed multiplier, requested by the owner, not started

Three settings:
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

## 11. Ideas, not started

a pass on wear and physical irregularity, sound,
and a desk scene around the board. And one the owner raised on
2026-11-23 as a nice to have, not for now:
- **The cassette through the sound card.** With **Cassette: Real time**,
  SAVE would play out of the speaker or line out, for a real deck to
  record, and LOAD would listen to the microphone or line in while a
  deck plays a tape, as on the board. Feasible, with no change to the
  board side: a live recorder fits the interface `connectRecorder()`
  already has, and `renderPulses()` already makes the sound. The work:
  - **Timing.** `_runFrame()` runs the CPU in bursts and drops cycles
    when a frame is late, which a real tape cannot survive. During a
    live LOAD or SAVE the CPU would follow the audio clock, some
    50-100 ms behind it, with pulses queued. The tab has to stay in
    front.
  - **Input.** The browser's echo cancellation, noise suppression and
    gain control must be off, and `detectPulses()` needs a streaming
    form. A cable from the deck is safe; a microphone in the room may
    not be, because an echo arriving 0.78-2.4 ms after a pulse reads as
    a 1 bit.
  - **Testing.** Headless Chrome can take a WAV file as its microphone
    (`--use-fake-device-for-media-stream` with
    `--use-file-for-fake-audio-capture`), so `encodeWav()` output can go
    through the whole live path.

  Two smaller steps need none of the timing work and could come first: a
  button that plays a program from the cassette as sound, and one that
  records from the microphone until the tape stops and then decodes it.

## 12. Being found

The owner asked on 2026-11-23 for the site to be
checked for search engines (`AGENTS.md`, What the Site Serves and What a
Search Engine Reads; the log of that day). What was wrong is fixed: the
repository's documents were being published as 22 web pages, which
`.nojekyll` stops once it reaches `master`. The pages' own tags, their
speed and their phone layout were in order. What is left, none of it
started, and the first three matter most:
- **Links to the site.** None is known. A new site that nothing links to
  is found late and ranked low whatever its tags say. A link from
  ComputerHistory.it's page on the machine, or from a forum where the
  people of item 4 are, would do more than everything else here. The
  repository's own About box on GitHub has no website address and no
  topics; filling it in is a change to GitHub, so it waits for the
  owner's word.
- **Search Console.** Submit `sitemap.xml` there, since `robots.txt`
  cannot announce it, and ask for the three addresses to be indexed with
  URL Inspection. Whether Google has indexed anything was not looked at
  from here: Search Console is where that is shown.
- **No picture for a link preview.** The pages have no `og:image`, so a
  link pasted into WhatsApp, Facebook or a forum shows text only, and
  that is how the people of item 4 would pass it on. The head says there
  is no picture because the photographs are private. A screenshot of the
  page's own drawing, displays lit, 1200 x 630, is not a photograph and
  is already public as the page. The owner's call.
- **No Italian address for the home page** (item 3). An Italian
  searching in Italian gets the English title and description. The
  Italian text of the page is in the HTML Google reads, hidden by the
  style rule, so the page can still match Italian words.
- **The guides' titles are short.** "How to use the AMICO 2000" and
  "Come si usa l'AMICO 2000" say neither emulator nor guide. A longer
  `<title>`, the heading left as it is, would say what the page is in a
  result: the wording is the owner's, in both languages.
- **No favicon.** The tab and a bookmark show a blank, and every visit
  asks for `/favicon.ico` and gets a 404. An SVG file would pass the
  CSP. Google's results show one icon for a whole host, so a site under
  `ascasso.github.io/amico2000/` cannot set its own there.
- **Not run:** Lighthouse, which needs a download the session was not
  allowed. Load times were measured by hand instead, in headless Chrome
  throttled to a slow phone.

## 14. A digit given a blank goes on showing what it had

A fault of the
emulator's displays, found on 2026-11-23 by the test of Amico's sliding
text. Not mended: the owner had asked for that session to keep to the
language.
- **What happens.** `_updateDisplay()` in `amico2000.js` takes no
  notice of a blank pattern sent to a digit ("Ignore blank patterns
  (0x00)"), because the monitor's own routines put the segments out
  between one digit and the next. So when a program changes a digit
  from a letter to a space, nothing records it: `display[]` keeps the
  letter, and `getDisplay()` shows it until
  `DISPLAY_PERSISTENCE_CYCLES`, a tenth of a second, has gone by since
  the digit was last lit. A board has no latch and would be dark at
  the next scan, 4 ms later.
- **How it shows.** A text sliding four places a second: in every
  place that becomes a space the letter before stays for a tenth of a
  second, beside the same letter in its new place, four tenths of each
  step. A static word with spaces in it is right, and so is the
  monitor, which never shows a blank digit. `compiler/examples/
  slide.amico` shows it on the page; its test in
  `tests/compiler.test.js` waits 120,000 cycles after each step before
  it reads the digits, and says why.
- **A way to mend it**, not tried. A digit's turn begins when Port B
  selects it and ends when Port B selects something else. If Port A
  was never anything but blank through a whole turn, the digit was
  scanned dark: record a blank for it and the time, as a lit pattern
  is recorded. The blanking between digits is then no longer a
  special case, since it lasts only until the pattern is written in
  the same turn. `tests/display-persistence.test.js` and
  `tests/display-renderer.test.js` are the checks to keep passing, and
  the monitor's own blink of 31 ms while a key bounces (`AGENTS.md`,
  Known Limitations 7) is the thing to look at afterwards.
- It changes what a visitor sees, so its commit dates the home page
  in `sitemap.xml`.

## Cassette work, secondary

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
