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

**Who it is for**, named on 2026-11-22. Two kinds of visitor, and one machine
for both:

- **People who had one**, or a 6502 trainer like it, forty and more years
  ago. They know the board on sight and have forgotten the key sequences.
  They read *Sperimentare*, so they are Italian, and many of them do not read
  English.
- **People who program today** and have never worked a processor by hand.
  They do not know what a monitor is, or that a program was once written on
  paper and translated into bytes from a table.

The test for anything meant to help either of them: it may make the machine
easier to approach, and must not make the machine easier than it was. Putting
a program's bytes in memory for a visitor passes that test. A button that
runs the program does not, and neither would an assembler.

That test is about the emulator, the page a visitor works at. The owner said
so again on 2026-11-23, "the emulator itself should not be easier than the
original one", and counted it kept. Amico, the compiled language added that
day, is a tool that runs on another computer and is not on the page, so the
test does not judge it. See item 13 under Outstanding.

The audiences and the test come from a product brief the owner brought on
2026-11-22 and had reviewed against this file. The brief is not in the
repository: most of it restated item 1, and a second statement of direction
would compete with this one. What the review added is written into the items
below, each marked as coming from it.

## Where Things Stand (2026-11-23)

- **Publishing:** agents push `develop` when their commits are done
  (`AGENTS.md`). GitHub Pages builds from `master`; work on `develop` reaches
  the live site only through a merged pull request, which is still opened and
  merged on request. Live as of 2026-11-23, by pull requests 55 and 56:
  everything up to the tablet layout and Google's verification file, the
  Italian's review and its "noi" included. On `develop` and not yet live:
  the sitemap's dates, the rule for them, and `.nojekyll`, which takes the
  repository's documents off the site as pages (item 12).
- **Attribution:** no link to an agent's session in a commit message, a pull
  request or anywhere else published (`AGENTS.md`, Agent Operating Contract).
  The `Co-Authored-By:` and "Generated with" lines stay.
- **CPU:** the core passes the Klaus Dormann functional suite (`#18`) and has a
  regression check for each earlier fix (`#17`). `node --test tests/` runs 246
  checks offline with no dependencies.
- **Board:** the home page draws the board from two private photographs of
  real boards. Read Board Artwork in `AGENTS.md` before touching it, including
  the rule that the photographs and their owners stay out of the repository.
  The displays have a Readable look (the default) and an Authentic one, and
  go dark when nothing is scanning them, as on the board.
- **PROMs:** both are fitted at startup, the monitor (IC9) and the cassette
  PROM (IC10).
- **Phones and tablets:** held upright, the page uses a handheld layout; see item 2.
- **Languages:** English and Italian. A browser set to Italian opens the home
  page in Italian, a link in its top corner changes language without a
  reload, and the guide is two pages, `guide.html` and `guida.html`. Read Two
  Languages in `AGENTS.md` before adding any text: every sentence the public
  reads goes in twice. See item 3 for what is left.
- **Programs:** the site offers none to load. The guide prints a few short
  ones to key in. See item 1.
- **Amico:** `compiler/` holds a small compiled language for the board, named
  Amico, and its compiler `amicoc`, which runs under Node and is no part of
  the page. Codex built it on 2026-11-23 and nothing in it has changed since.
  What the owner settled for it the same day is item 13.
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
- **Search engines:** the site is verified in Google Search Console and has
  a sitemap. See item 12.
- **Open issues:** none.
- **History:** `CHANGELOG.md` and `docs/logs/`. The latest log is 2026-11-23.

## Outstanding

In rough priority order. None of it is started, apart from item 3, which is
done but for the ends listed there. Item 13 is outside the order: it arrived
on 2026-11-23 and its place is the owner's to give.

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
     as a y too, as its one quirk, unless the owner says otherwise. And its
     G was a capital, `3D`, not a small g drawn like a 9: the owner was not
     sure until shown both on the emulated displays, and then recognised the
     capital at once. The name in it was a private person's. It stays out of the
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
   - **From the review of 2026-11-22**, six additions to the above. None is
     decided beyond what it says.
     - **Two depths of guide.** A step is a sentence and the keys to press.
       Give each step an optional second text, the why: what the bytes are,
       what the instruction does, what the monitor is doing. Someone who had
       the board never opens it; someone new can. And the guide can be put
       away altogether. The field costs nothing if a step has it from the
       first program on, and a rewrite of every entry if it is added later.
     - **Every sentence in two languages.** See item 3. A catalog entry's
       name, its line of description and its steps are public text, so each
       is written in English and in Italian from the start.
     - **The first screen.** A visitor meets `0000 00` and no invitation. The
       plan above puts the catalog's button under Bench controls, below the
       board, which is a quiet place for the only thing that tells a newcomer
       what to do. Nearer the board it would be found, and it would be the
       first thing on the desktop page that is not the board or the bench.
       The owner's call.
     - **A reminder with no program chosen.** Someone who comes back to key
       in a program of their own needs the sequences, not the shelf: AD and
       four digits, DA and two, the increment key, RUN. The home page has the
       table of computer keys and nothing on the sequences; they are in the
       guide, on another page.
     - **The course is already written.** Teaching a newcomer what a
       processor, a register and an address are has no natural end, and the
       project is a memorial before it is a school. The machine was sold
       with its own course: the supplement's chapters I to IX run from
       "Cosa è un microelaboratore" to the last addressing modes, with an
       exercise at each step, and three of the early ones are already
       transcribed (`somma-000a`, `somma-carry-0201`,
       `clear-page-zero-range-0200` in `docs/manual-extraction/listings/`).
       So the newcomer's path can be the 1980 course in its own order, each
       program teaching what its chapter taught and no more. The instruments
       for looking inside are the board's: the NOR/SS switch, REG and HLT.
       The table for translating by hand is the manual's Appendix 1,
       "Sommario istruzioni 6502", printed page 95.
     - **What an old hand would recognise.** Appendix 2 has thirteen programs
       a reader of the supplement may have keyed in, among them Asteroidi,
       Atterraggio lunare, Labirinto and Slot machine
       (`docs/manual-extraction/catalog.md`). Only 21 fiammiferi is
       transcribed, as a candidate, and the order above reaches them last.
       One of them early may matter more to that visitor than a program
       written for this site. The cost is the checking: those listings are
       the worst of the scan, and each byte has to be read off the page.
2. **The phone layout on real phones.** The handheld layout was built on
   2026-11-22 (`AGENTS.md`, Handheld Layout): on an upright touch screen the
   displays, LEDs, switch and keys move into one column above a picture of
   the board. The owner tried it the same day in Safari on an iPhone 17 Pro
   held upright, and on 2026-11-23 in Chrome on a OnePlus 7T: on both it
   looked right and everything worked. On an iPad Pro 11" held upright the
   board as drawn had keys and displays too small, and in landscape it was
   fine, so tablets held upright now get the handheld layout too, up to
   1100 px. The owner then tried it on the iPad Pro 11" held upright: it
   looked as intended, a full pass. Whatever item 1 and item 3 add has to fit the same first
   screen. Known rough edges, none of them blocking:
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
3. **The site in Italian: done, with these ends loose.** The owner asked for
   it on 2026-11-22 and it was built that day: the home page, the guide, and
   what the page says while it is used, down to the reasons the machine
   gives for a refusal (`AGENTS.md`, Two Languages). The changelog, the logs
   and the other documents stay in English, as the owner said. What is left:
   - **No person is known to have read the Italian through.** The sessions
     that wrote it have, and on 2026-11-22 a second agent, Codex, reviewed
     it at the owner's request. Its findings were checked one by one and all
     held: an alert that sent a program to the wrong address, in English as
     much as in Italian, three passages that said something else than the
     English, and three that were English word for word. Reading the rest
     again against the manual found four sentences more and two words that
     are not the manual's: the NOR/SS switch is "interruttore" there and was
     "commutatore" here, and a loop is a "loop", not a "ciclo". All of it is
     put right (the log of that day). The owner asked then that the Italian
     keep the manual's style and tone, not only its words; how is under Two
     Languages in `AGENTS.md`.
   - **The Italian now says "noi", as the manual does.** Asked whether it
     should, the owner answered the same day: "I like the 'noi' of the
     original guide. I want that here too." The whole of `guida.html`, the
     notes under the board, the LEDs' tooltips and the how-to line of the
     alert after a recording were rewritten in it: "premiamo", "non ci resta
     altro che", "il nostro programma". "Voi" was kept on purpose in two
     kinds of place, a prompt on the tape's status line ("Premete RES.") and
     the advice in an error about a file of the reader's own, because the
     manual keeps it there too. If the owner wants those in "noi" as well,
     they are five strings in `lang.js`. A check fails if a "voi" comes back
     into the guide or onto the home page.
   - **What the owner's own reading is still needed for.** The Italian
     follows the manual's vocabulary and voice; whether it sounds right to
     someone who read *Sperimentare* is for the owner to say. The words most
     worth a look are the labels:
     "Comandi dell'emulatore" for Bench controls, "Reset a freddo", "Passo",
     "Display: Leggibili / Autentici", "Cassetta: Immediata / Tempo reale",
     and "in esecuzione", "fermo", "bloccato" beside the run lamp. Changing
     a label means changing it in `index.html` and where `guida.html` quotes
     it; `tests/languages.test.js` names the ones it holds together.
   - **Live.** Pull request 53 put the Italian on the site, and pull request
     55, on 2026-11-23, the review's fixes and the "noi".
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
4. **Ask the people who had one.** From the review of 2026-11-22. The first
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
5. **Keep an afternoon's work.** From the review of 2026-11-22. Someone who
   keys in a program of their own loses it when the page is reloaded: RAM and
   the cassette's records last for the page session, and getting a tape out
   is `debug.saveTape()` in the browser console, which a phone does not have.
   On the board the cassette was where work was kept, and it is the faithful
   answer here too, not a snapshot of RAM: the cassette's records kept in
   `localStorage`, so that the tape is still in the recorder at the next
   visit, and buttons on the page for taking a tape out as a file and
   putting one in. Cassette Work, below, already lists the missing button.
6. **Two interrupt decisions are the owner's to confirm.** HLT and the
   NOR/SS single-step switch both work now (`AGENTS.md`, HLT and the NMI
   Line). Both go through the NMI vector at `$03FC/$03FD`, which the board
   leaves to the user and the emulator has to start with something in. It
   starts with `$FE00`, the monitor's own routine and the value the manual
   has the user key in; it was `$FE30`. The IRQ vector, where a `BRK` goes,
   was left at `$FE30`. Making it `$FE00` too would turn a `BRK` into a
   breakpoint that shows where it was, and would change what programs that
   end in `BRK` do today.
7. **Machine-layer checks** for display multiplexing, pattern by pattern (how
   Port A and Port B writes become the six-pattern buffer; when digits go
   dark is covered), and the `$FD00-$FDFF` partial decoding.
   `tests/keyboard-matrix.test.js` shows the pattern: run the real monitor in
   Node and assert on RAM or PIA state.
8. **One phase LED is unexplained.** D4-D7 are modelled as the schematic
   wires them and light when the real cassette routines run or a program
   drives them. By that wiring
   all four are dark while the monitor idles, yet unit A's photograph shows
   D7 lit at idle. Nothing accounts for it.
9. **Board drawing, unverified ends.**
   - Only Chrome has been used. Safari, Firefox, touch and screen readers
     have not been tried, nor the key legends on systems without the macOS
     DIN faces.
   - The measurement table and the browser-check scripts live with the
     private photographs, outside the repository. Whether they belong in it
     is the owner's call. The three checks of the cassette written on
     2026-11-21 are there too, as `cassette-files.mjs`, `cassette-realtime.mjs`
     and `cassette-instant.mjs`; they hold nothing private.
10. **Speed multiplier, requested by the owner, not started.** Three settings:
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
11. **Ideas, not started:** a pass on wear and physical irregularity, sound,
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

12. **Being found.** The owner asked on 2026-11-23 for the site to be
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

13. **Amico, the language beside the board.** `compiler/` holds a small
    language in which every value is a byte, and `amicoc`, which compiles it
    under Node into 6502 code for `$0200`, as a listing, a binary or a tape
    (`compiler/README.md`). It began, in the owner's words, as "a thought
    experiment": asked whether such a language was feasible, Codex built all
    of it in one prompt, on 2026-11-23. The same day the owner had an agent
    look it over, named it, and settled in conversation what follows. None of
    it is built, and nothing in the compiler has changed since Codex wrote it.
    - **The name is Amico**, the owner's decision: "I'm gonna stick with
      Amico, .amico. It's the obvious choice." Source files end in `.amico`,
      all lowercase, and the compiler is `amicoc`. Write the language Amico
      and the machine AMICO 2000. Adda, Otto and Caro were offered and
      refused, Adda because search engines and people would take it for Ada.
      The name is settled.
    - **The North Star's test does not judge it.** That test is about the
      emulator, and Amico runs on another computer. It stays off the page
      unless the owner asks. It is new, and both READMEs say so, so that
      nobody takes it for ASEL's.
    - **The owner's direction:** "the language should be fairly simple and be
      optimized for this board, not a generic portable language."
    - **What a first look found**, on 2026-11-23, by reading the compiler,
      running its tests and writing three programs in it, a clock, a die and
      a hex entry, each of which ran correctly on the emulated board the
      first time:
      - It is honest about cost. A line is a load, one operation and a
        store, and `squares` comes out at 40 bytes, within a byte of
        hand-written code.
      - It knows the monitor: `CLD` first, Port A set to input before the
        key routine, the way out through `$FE22`, a program that would reach
        the vectors refused, and a key wait that begins by waiting for
        release, so that the RUN which started the program is not a move.
      - It has no delay statement, so a program waits by scanning and cannot
        darken the displays by idling.
      - It reaches the hex digits and the keypad and nothing else: no memory
        address, no port, no call, and a table only from a formula. It
        cannot write the word on the displays or the sliding text of item 1,
        the guide's two LED programs, or the manual's first program, the
        sum, whose result it works out and stores nowhere.
      - Nothing leaves a `loop`, and there is no `and` or `else if`: the
        matchstick game needs three nested `if`s to accept a move.
      - It hides what the 6502 is good at: decimal mode, indexing, carry. A
        24-hour clock written in it is 140 bytes; the May 1979 article's is
        63, and three in page zero.
      - Quiet surprises. A value assigned to a name nobody reads is dropped
        without a word, a misspelt name on the left of `=` included. `stop`
        hands the board back showing `0000 00`. HLT overwrites the display
        fields, which the examples use as variables. Key codes are bare
        numbers.
    - **To be added**, agreed with the owner. The spellings are the agent's
      proposals, and each is settled when it is built:
      - Names for memory, `byte sum at $04`, and for a row of bytes,
        `byte segment[6] at $8f`. A call to an address, `call $ff7e`. On top
        of those, friendly names for what the board and its monitor have.
        Whether a program should show addresses the owner left to the agent,
        which chose both.
      - A table written out, beside the formula:
        `const word = table byte = $77, $6d, $79, $38, 0, 0`.
      - Words for the displays as a table the compiler works out,
        `const hello = table segments "CIAO"`, with the bytes shown in the
        listing. It needs an agreed alphabet first; item 1 has what is known
        of the letters seven segments can and cannot make.
      - A `decimal ... end` block, inside which `+` and `-` count in
        decimal. The compiler clears decimal mode around the key routine,
        where the monitor goes wrong (`docs/monitor-rom-review.md`, bug 2).
      - A routine for the HLT key. The owner said in. The agent had voted to
        leave it for now, as the hardest thing on the list: registers to
        save, and the monitor's routines shared with the program it
        interrupts. Its form is not designed.
      - Subroutines with no parameters: `sub tick ... end`, called as
        `tick()`.
      - From the agent's recap, which the owner liked as a whole and did not
        take one by one: a warning for a name assigned and never read; named
        constants (`const start = 21`) and names for the key codes
        (`key.none`, `key.run`); `display.hold()`, which scans until RES, so
        that a program can end with its result showing; `and`, `or`,
        `else if`, `>` and `<=`; shifts, `a << 1` and `a >> 1`; a key read
        or a table read as an operand (`k = keypad.read() & 15`); and
        tighter code, `INC` and `DEC` for `x = x + 1` and no `CMP #0` after
        an operation that set the flags.
    - **Stays out**, a list the owner approved:
      - anything wider than a byte, carry, pointers;
      - more than one operation on a line, parentheses, precedence;
      - multiplying or dividing at run time, which a table does;
      - strings and records;
      - a run-time library, beyond a helper that is asked for and shows in
        the listing, and run-time checks;
      - parameters, local variables and recursion;
      - any other machine, and the expansion boards;
      - include, modules and macros;
      - `goto`, and inline assembly, since the listing is assembler source
        to carry on from;
      - random numbers: a program counts while it waits for a key, as
        programs did then.

      And **no Italian words in the language**, the owner's decision:
      "Italians prefer English for programming (Nuova Elettronica around the
      time of the Amico 2000 tried BASIC in Italian and it was hated)". The
      compiler itself stays small, with no dependencies.
    - **The second kilobyte: decided, and built when a program first needs
      it.** No new word in the language. A program that fits in 508 bytes is
      laid out as today and runs on any board. A longer one starts at `$0200`
      all the same and steps over the vectors at `$03FC-$03FF`, with the NMI
      vector set to `$FE00`, and the listing says that it needs the RAM
      expansion. RUN is always from `0200`. The owner chose this over leaving
      the limit where it is and over starting long programs at `$0400`. What
      the supplement has on the matter, each read on the scan on 2026-11-23:
      - The second kilobyte is in one parts list with the cassette
        interface, Tabella 10 on page 44: IC13 and IC14. The same page says
        the expanded board has "circa 1,5 kbyte di RAM nella quale possono
        essere scritti i programmi". Page 47 has its test: from `0400` to
        `07FF` "deve essere possibile scrivere dei dati". The board the home
        page draws has all four RAMs.
      - Two programs of Appendix 2 run across the vectors, and both print
        `00 FE 6F F5` at `$03FC`. The calculator's row on page 99 is
        `03F0 =85 23 8A 60 E6 20 20 1F 06 60 EA EA 00 FE 6F F5`: a routine
        ends, two `NOP`s, the vectors, and the code goes on at `$0400`. The
        row of "Il gioco del 21" on page 104 is
        `03F0 =95 65 96 85 91 A2 04 B5 91 95 92 CA 00 FE 6F F5`, followed by
        `0400 =00 60`: the same four bytes straight after a `DEX`, in what
        reads as the middle of a loop. Whether that routine works as printed
        was not tried.
    - **Open.** The words for ending a loop, which the owner will decide
      later; the agent proposed `while`, `break`, `next` for going round
      again, and a counted `repeat 6`. The alphabet for `table segments`.
      The form of the HLT routine. And what the image of a long program puts
      in the IRQ vector (item 6).
    - **How to steer it:** by the project's own programs. The manual's sum
      (Tabella 7), the word on the displays, the guide's LED counter, the
      sliding text, the 1979 clock and 21 fiammiferi. Amico is good enough
      when each reads well and comes out close to its hand-written size.
    - **The listing as the manual's Tavola A.** The supplement's page 15 has
      a program written first "nel nostro linguaggio", and Tavola A on page
      16 sets three columns side by side: "linguaggio discorsivo (il nostro,
      non comprensibile dal microelaboratore)", "linguaggio simbolico" and
      "linguaggio macchina". Amico is that first column made exact, and its
      listing is nearly the table: it has the mnemonics, the addresses and
      the bytes, and of the source only a line number. The agent proposed
      printing each source line above its instructions, with address and
      bytes first, as the manual prints a listing. The manual's word for a
      program that translates is "traduttore" (page 15), should the site
      ever need an Italian one for the compiler.
    - **Order of work**, the agent's proposal. The small fixes first: the
      warning, the names for constants and keys, `display.hold()`, and the
      README saying what `stop` and HLT do to the displays. Then memory
      names, calls and written-out tables. Then the ways out of a loop and
      the richer conditions, once the owner has chosen the words. Then
      decimal. The compiler reads a line with one regular expression for
      each kind of statement, which will not stretch to `and` or to rows of
      bytes, so a small tokenizer comes before the loops. One unit to a
      commit, each with its test.
    - **A check of the compiler as it stands**, read only, which the owner
      asked for on 2026-11-23 before anything was built on it. Five
      reviewers, each with its own angle and its own model: four Claude
      subagents, on Opus, Sonnet, Haiku and Fable, and one Codex instance on
      Astra. `AGENTS.md`, A Review by Several Agents, has how it was run.
      The session that ran them reproduced every finding below. **No
      ordinary program was found to compile to wrong code.** What turned up
      is at the edges:
      1. **A program of exactly 257 bytes cannot be loaded by the board's
         own LOAD routine.** The PROM loses the last byte of a block one
         byte longer than whole pages (`AGENTS.md`, Cassette Sound Format),
         so `$0300` keeps what it had and the closing `JMP $FE22` becomes
         `JMP $0022`. The trap, Cassette: Instant, hides it.
      2. **A source file with CR-only line endings**, as old Macs wrote
         them, is read as one line. With a `#` comment in it, everything
         after the comment is dropped and the compile succeeds. Without one
         the error is "Unknown statement", with the whole file in it.
      3. **After HLT, the RUN that resumes the program comes back from
         `keypad.press()` as a key**, `$13`. The helper waits for release
         only when it is called, and a halted program is nearly always
         inside it. The RUN that starts a program is ignored, as designed.
         The matchstick game is safe because it discards codes above 3.
      4. **When one key directly replaces another**, with no scan between
         them that shows no key, `keypad.press()` wants four samples of the
         new key where the README says three: the sample that showed the
         change is thrown away. About 4 ms.
      5. **Messages and gaps in the README.**
         - The right side of a comparison must be a single value. `if a ==
           b + 1` is refused with a message naming the operator that is
           already there, and the README does not give the rule.
         - The words of the language cannot be names: `byte`, `in`, `table`,
           `display`, `keypad` and the rest. The README does not list them,
           and the message is "Invalid byte variable".
         - A table declared twice gets that same message. A misspelt `end`
           after `stop` is called unreachable. `keypad.read ()` with a space
           is refused, where spacing is free everywhere else. A table's
           first index must be the character `0`, and `$0` is refused.
         - A file with no statement in it is reported at a line past its
           end.
         - The README says "The square table occupies 40 bytes", which is
           the whole program, 16 of them the table. It never says to press
           RES to leave `squares`, which runs for ever.

      Found sound, by the reviewers' own counts:
      - Some 26,000 random programs, each run on the emulated board with its
        registers and flags randomised, decimal mode among them, and
        compared with an interpreter written from the README alone: no
        mismatch, and no write outside the program's variables and the
        display bytes.
      - The rule that a name is assigned on every path before it is read,
        against an independent control-flow oracle over 5.7 million small
        programs.
      - What the accumulator is taken to hold: 116,000 programs against a
        copy of the compiler with that shortcut off, and a program halted
        at every instruction and resumed.
      - Port A's direction at every key read, in 402,000 programs.
      - 700,000 malformed sources, none of which made the compiler throw
        anything but a "Line N:" error.
      - The opcodes, the 127 and 128-byte edge of a branch, the 508-byte
        limit, the 96 variables, and the listing against the binary on
        1,102 programs.
      - Every checkable claim in the README but the one above.
      - The README's own instructions on the page as served, in headless
        Chrome: the tape through the file picker, the LOAD and the RUN
        keyed on the board, 64 for A and E1 for F, and the game played
        through to `DEAD 01`. The log had this down as not tried.

      Not verified: that 64tass accepts the listing, since it is not
      installed. Codex reports that a copy it had built assembled three
      listings to the compiler's bytes; the session that ran the check did
      not run it. Nor a real board, and with it a real 8255A, which clears
      its output latches when a mode word is written, where the emulator
      does not.

      The owner's decisions on it, the same day: record this; bring the
      random-program tester and the oracle into `tests/`, as a net under
      the front end before it is reworked; fix findings 1, 2 and 5, each in
      its own commit with a test; and give finding 3 a note in the README.
      Finding 4 is left as it is.

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
  stops `requestAnimationFrame` and so the emulator. To see the page as an
  Italian browser does, give `Emulation.setUserAgentOverride` an
  `acceptLanguage` of `it-IT` before loading it; `?lang=it` forces it. The page also runs from
  `file://`. The cassette in real time has to be watched in real time: a
  SAVE and a LOAD are over twenty seconds between them.
- A pull request gets an automated review when it is opened. Its findings
  are worth reading and are not always right: of the two on pull request 47,
  one was a real bug and one misread a commit's date. `AGENTS.md` now has a
  test for the date.
- If behavior and documents disagree, trust the ROM, the manual and verified
  behavior, and fix the documents.
