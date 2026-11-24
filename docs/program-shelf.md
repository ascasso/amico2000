# The Shelf of Programs and the Guide on Screen

The plan for giving the machine its software, agreed with the owner on
2026-11-22 as the next piece of work on the site. None of it is built. It
was the first item of Outstanding in `NextSession.md` until 2026-11-24, and
the logs up to that day call it "`NextSession.md`, item 1".

The site offers no programs: a visitor meets a board showing `0000 00` and
has to key in hex, and on a phone, where there is no console, nothing runs
any other way.

Whatever is built has to pass the North Star's test (`NextSession.md`): it
may make the machine easier to approach, and must not make the machine
easier than it was.

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
  single segments is explained in the hardware part of its next chapter.
  **It is there, and it is a whole alphabet**, found on 2026-11-23:
  Tabella 18 on PDF page 80, "Esempio di alfabeto per display a sette
  segmenti e dati relativi per generare quel carattere", beside Fig. 58,
  which draws which bit is which segment. Read it off the scan and not
  off the extracted text, which has three of its bytes wrong.
  - It has the ten digits, the dash, the dark digit `00`, and twenty
    letters, each printed in the case its shape has:
    A b C d E F G H I J L n o P q r S t U Y. `compiler/README.md` has
    them with their bytes, under Words on the displays, and a test holds
    that list to the page as transcribed.
  - It has no K, M, V, W, X or Z. So the guide's "which letters seven
    segments cannot make" has the manual's own answer, and the machine
    cannot spell AMICO in it. A Z can be given the segments of a 2, but
    that is a letter of our own, and the guide should say so.
  - It prints most bytes with bit 7 set, `F7` for A where page 68 has
    `77`, and says "il bit 7 non viene utilizzato". The monitor's table
    of hex digits at `$FFEA` has it set on all sixteen, so the two
    tables agree on those digits but for bit 7 of b and d. That a set
    bit 7 changes nothing on a board is the manual's word, not tried.
  - Its G is `BD`, the capital the owner recognised, and its Y is `EE`,
    the shape the owner remembers standing for a Z (the next program).
- **Second program: text sliding across the displays**, a reconstruction.
  The owner remembers writing one that slid a name of two words, thirteen
  characters, across the six displays, and is fairly sure that it slid
  and did not show one word after the other. No listing survives, so it
  is to be written again as a real program for the board and labelled a
  reconstruction. Whatever waits between steps has to keep calling
  `$FF7E`: nothing else keeps the displays alight, and an idle delay loop
  darkens them, on the board as in the emulator. Two things about its
  letters, from the owner on 2026-11-22. (Amico has a sliding text of
  its own since 2026-11-23, `compiler/examples/slide.amico`, which is
  not this reconstruction: it is compiled, not written by hand, and its
  text is in the manual's alphabet. Writing it showed a fault of the
  emulator's displays (`docs/open-work.md`, item 14), which spoils any
  sliding text on the emulated displays until it is mended.) The Z in
  the name was shown as a y: of that the owner is certain, without remembering why, since the
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
  - **Every sentence in two languages.** A catalog entry's
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
