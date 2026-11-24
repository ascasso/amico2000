# AMICO 2000 Next Session

What to work on next, and what else is open, a line or two to an item.
Nothing more belongs here; `AGENTS.md`, Agent Operating Contract, says
where the rest goes.

## Next

**Tighter code for Amico.** The owner's word on 2026-11-23: "implement the
table segments and then tighter code". It changes no word of the language.
`docs/amico-design.md`, under Tighter code, has what is known to tighten,
what must be left alone inside a `decimal` block, and how to show that no
program got longer or computes otherwise. The steps after it are asked for
one at a time.

## Waiting for the Owner

- **Amico's small print**, settled by the agent and not yet seen by the
  owner: the ends of a `for` are constants only; inside `decimal`, ten is
  written `$10`; `table segments` has the manual's alphabet and no more, so
  no K, M, V, W, X or Z (`docs/amico-design.md`, Built).
- **The Italian** has been read through by no person. The labels are the
  words most worth a look (item 3).
- **The IRQ vector's value at power-on**, `$FE30` as now or `$FE00`
  (item 6).
- **Smaller calls:** how visitors could write back (item 4); a picture for
  link previews and the repository's About box on GitHub (item 12); where
  the catalog's button goes (item 1).
- **A pull request to `master`.** The live site is `master`. On `develop`
  and not live: Amico, the sitemap's dates, and `.nojekyll`, which takes
  the repository's documents off the site as pages.

## North Star

Make the emulator behave as closely as practical to the original
AMICO 2000. Prefer evidence from the monitor ROM, the Sperimentare manual
and observed hardware over convenience. In order: the board's behaviour;
the NMOS 6502's; small targeted checks of both; the cassette; large
conformance projects last.

It is for two kinds of visitor: people who had one forty and more years
ago, Italian and often without English, and people who program today and
have never worked a processor by hand. The test for anything meant to help
either: it may make the machine easier to approach, and must not make the
machine easier than it was. Putting a program's bytes in memory for a
visitor passes. A button that runs the program does not, and neither would
an assembler. The test is about the emulator, the page a visitor works at;
Amico is a tool beside the board and is not judged by it.

## Open Work

In rough priority order, after what is under Next. The detail of each is in
`docs/open-work.md` under the same number, unless another document is
named. No issue is open on GitHub.

- **14. A blanked digit keeps its letter.** The emulator's displays take no
  notice of a blank sent to a digit, so a sliding text leaves ghosts. A
  mend is proposed and not tried. It comes before the sliding text of
  item 1.
- **1. A shelf of programs and a guide on screen**
  (`docs/program-shelf.md`). Agreed with the owner on 2026-11-22 as the
  site's next piece of work. Not started. First a word on the displays,
  then a text that slides.
- **2. The phone layout:** built and tried on three devices. Small rough
  edges, none blocking.
- **3. The site in Italian:** built and live. Loose ends, the first of them
  that no person has read it through.
- **4. Ask the people who had one** for a tape, a listing, a photograph, a
  memory: a few lines under About this board.
- **5. Keep a visitor's work** between visits: the cassette in
  `localStorage`, and buttons for taking a tape out and putting one in.
- **6. Two interrupt decisions** for the owner to confirm: the NMI vector's
  value at power-on, now `$FE00`, and the IRQ vector's.
- **7. Machine-layer tests:** display multiplexing pattern by pattern, and
  the 8255's partial decoding at `$FD00-$FDFF`.
- **8. D7 lit at idle** in unit A's photograph. Nothing accounts for it.
- **9. The board drawing** has been seen in Chrome only, and its table of
  measurements and check scripts live outside the repository.
- **10. A speed multiplier,** 1x, 10x and Max. The owner asked for it. Not
  started.
- **11. Ideas, not started:** wear, sound, a desk scene, the cassette
  through the sound card.
- **12. Being found:** links to the site, Search Console, a picture for
  link previews, a favicon.
- **13. Amico after tighter code** (`docs/amico-design.md`): subroutines, a
  routine for HLT, shifts, a key read or a table read as an operand, the
  listing as the manual's Tavola A.
- **Cassette, secondary:** no real recording has been through the decoder,
  and there is no button for saving a tape.
