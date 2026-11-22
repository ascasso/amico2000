# The 8255 Data Sheet: What the Emulator Takes From It

The AMICO 2000's keyboard, displays and cassette interface all hang on one
Intel 8255 at `$FD00-$FD03`. Most of what the emulator does with it is taken
from the board's own ROMs and the supplement's schematic. A few facts are the
chip's and not the board's, and this file records where each was read, with
the links, so that nobody has to take them on trust or look them up again.

Checked on 2026-11-21.

## The Source to Use

Intel, *8255A/8255A-5 Programmable Peripheral Interface*, August 1991, order
number 231308-003, pages 3-100 onward of the data book it was printed in.

- Scan: `https://www.seriss.com/opcs/a800/parts/8255A-5.pdf` (24 pages, images
  with no text layer; it was read page by page)

This is Intel's own sheet. It is a later printing than the board, which dates
from 1978, of the same part.

## What It Says

Quoted as printed, with the page of the data book.

| Fact | Where | The sheet's words |
| --- | --- | --- |
| A reset leaves every port an input | 3-102, "(RESET)" | "A "high" on this input clears the control register and all ports (A, B, C) are set to the input mode." |
| Inputs float | 3-104 | "all 24 lines will be in the high impedance state" |
| A mode word clears the outputs | 3-104 | "All of the output registers, including the status flip-flops, will be reset whenever the mode is changed." |
| Bit 4 of a mode word is Port A's direction | 3-104, Figure 6, Mode Definition Format | "PORT A 1 = INPUT 0 = OUTPUT", on D4, with "MODE SET FLAG 1 = ACTIVE" on D7 |
| Mode 0 outputs hold their value | 3-105, Mode 0 Basic Functional Definitions | "Outputs are latched." "Inputs are not latched." |
| The control register cannot be read | 3-102 | "No Read operation of the Control Word Register is allowed." |
| The pins | 3-103, Pin Configuration | PA7 is pin 37; PB0 to PB7 are pins 18 to 25; RESET is pin 35 |

## What the Emulator Does With Each

- **Reset.** `Amico2000.res()` clears the ports and sets `pia.portAInput`,
  as the sheet has it. The board ties the 8255's RESET to the CPU's.
- **Port A's direction.** Taken from bit 4 of a mode word. The ROMs agreed
  before the sheet was read: they write only `$89` and `$99`, which differ in
  that bit alone. Only the phase LEDs depend on it.
- **The pins.** The supplement's schematic (page 28) labels the 8255 by pin
  number, and these are what turn its pins 37, 18, 23, 24 and 25 into Port A
  bit 7 and Port B bits 0, 5, 6 and 7. See Cassette Sound Format in
  `AGENTS.md`.
- **A mode word clearing the outputs is not modelled.** A write to `$FD03`
  leaves Port A and Port B as they were. Neither ROM can tell: each writes
  the ports afresh after every mode word. A user program that set its ports
  first and its mode word second would behave differently here than on the
  board. On the board it would also clear the cassette latch each time, since
  Port B bit 0 would go low.
- **Reading the control register is allowed.** `$FD03` reads back the last
  value written. Nothing in the ROMs reads it.
- **Reading Port A does not depend on its direction.** It always returns the
  key columns and the cassette latch. The ROMs read it only as an input.

The last three are differences from the chip. None is known to matter to any
program, and each is a small change if one turns up.

## Other Copies, and Why Not to Use Them

These came up first in a search and were cited before the scan above was
found. They are kept here because they were cited.

- `https://lwlin.me.berkeley.edu/me102B/8255.pdf` is a print of a web page
  that retyped the data sheet, not the sheet. It has the reset and mode-word
  sentences word for word, but under Mode 0 it reads "Outputs are not
  latched", which is the opposite of what Intel printed. Do not quote it.
- `https://flex.phys.tohoku.ac.jp/riron/vhdl/up1/altera/ds/ds8255.pdf` was
  listed by the search. It refused the connection when it was fetched, so
  nothing in this file rests on it.
- `https://en.wikipedia.org/wiki/Intel_8255` agrees on the reset and on the
  direction bits and says nothing about a mode word clearing the outputs.
