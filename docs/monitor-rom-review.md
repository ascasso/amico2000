# The Monitor PROM (IC9): A Review

The owner asked on 2026-11-22 whether the original monitor, the 512 bytes of
IC9 at `$FE00-$FFFF`, has bugs or security issues, bearing in mind that the
machine's only connection to anything outside was its cassette recorder. An
agent session made the review that day; this is its write-up. It describes
the ROM as ASEL shipped it, which the emulator runs unchanged. Nothing here
changes the ROM, the emulator or the site.

In short: five bugs, the worst of which makes an ordinary program compute in
decimal; several places where the manual describes the ROM wrongly; some
smaller faults and limits of the design; and no security issue in any useful
sense. A tape can take over the HLT key until the board is switched off, and
that is the most it can do.

## Summary

| # | Finding | Kind | Where |
| --- | --- | --- | --- |
| 1 | RUN starts a program with the status of the last program halted, decimal mode included, or with whatever the RAM held at power-on | Bug | RUNMOD `$FEC7`, SALVA `$FE00` |
| 2 | In decimal mode the key routine returns the same code, 15, for F and for no key; the manual says 21 | Bug and manual error | TASTO `$FF57` |
| 3 | The main loop entered in decimal mode scrambles the keypad until RES | Bug | ATTESA `$FE30` |
| 4 | The branch calculator overwrites the saved A of a halted program | Bug | CJMP `$FF97` |
| 5 | The branch calculator does not debounce its keys | Bug | CJMP `$FF97` |
| - | Routine A's return value and its silence about the 8255, a slip on page 58, five in the printed listing | Manual errors | pages 58, 77, 91-93 |
| - | START leaves a digit lit; a data digit writes its byte four times; a second HLT loses the first; the interrupt vectors start undefined; and more | Smaller faults and limits | see below |

## Sources and Method

- **The ROM.** `MONITOR_ROM` in `main.js`, the image of `prom.ic9`. The
  listing printed in the Sperimentare supplement, chapter X, pages 91 to 93,
  has the same bytes: it was compared with the array line by line on the
  scans. The routine names used here are the listing's own.
- **The manual.** The supplement's description of the routines a program may
  call (pages 77 to 80), of interrupts, the vectors and single step (pages 84
  to 86), of the branch calculator (page 58), and its first program
  (Tabella 7, page 31). Every passage quoted here was checked on the scan,
  not only in the OCR text in `docs/manual-extraction/`.
- **Method.** Both code areas were disassembled and read against the
  listing. Each finding was then reproduced by running the real ROM on the
  emulator's CPU core in Node, through `tests/helpers/machine.js`, pressing
  keys as `tests/keyboard-matrix.test.js` does. Those that can be shown at
  the keypad are given below as keys to press. Times are CPU cycles at the
  board's 1 MHz.
- **Not done.** Nothing was tried on a real board, and how long the board's
  keys bounce (bug 5) is assumed, not measured. No automated test pins these
  behaviours.

## The Monitor in Brief

The monitor is the board's whole operating program: the keypad, the six
displays, RUN and HLT. Its parts, with the listing's names:

| Address | Name | What it does |
| --- | --- | --- |
| `$FE00` | SALVA | NMI entry, and BRK's if `$03FE` points here: "routine di entrata da interrupt non mascherabile o da break". Saves A, the status, the PC, Y, X and the stack pointer at `$F3-$FE`, puts the PC on the display and joins the main loop |
| `$FE1C`, `$FE1F` | NMIRIL, IRQRIL | `JMP ($03FC)` and `JMP ($03FE)`: the NMI and IRQ vectors, passed on to RAM |
| `$FE22` | RESET | The reset vector's target, "rientro freddo": address 0000, then RESET1 |
| `$FE28` | RESET1 | "Rientro caldo": stack pointer and its saved copy to `$FF`, INIZIO, main loop. Nothing in either ROM jumps here |
| `$FE30` | ATTESA | The main loop: scan, debounce, read a key, pause, dispatch |
| `$FE6F-$FE97` | DATO, ADDR, ADMODE, DAMODE | A hex digit into the address or into the data; AD and DA set the mode |
| `$FE9A` | NEXT | ↑: the next location, repeating about once a second while held |
| `$FEBC` | DISPC | REG: the saved PC to the address display |
| `$FEC7` | RUNMOD | RUN: stack pointer, PC, status, X, Y and A from the saved values, then `RTI` |
| `$FEDA` | INIZIO | Address mode, 8255 mode word `$99`, Port B `$07`, `CLD`, `SEI` |
| `$FEEB` | TESTAS | Routine A, "tasto attivo": is a key down |
| `$FF06`, `$FF0C` | SCANS, SCAND1 | Routine C: one scan of the six digits from `$F9-$FB`, then TESTAS. SCANS first copies the byte at the address into `$F9` |
| `$FF35`, `$FF3B` | CONDAT, DD | One digit, a hex digit through the table or a raw segment pattern |
| `$FF50` | INCPT | The address plus one |
| `$FF57` | TASTO | Routine B, "identificazione del tasto": the key's code |
| `$FF7E` | START | Routine D: six raw segment patterns from `$8F-$94` |
| `$FF97` | CJMP | The branch calculator, "routine di calcolo dei JMP" |
| `$FFEA` | TAB | The segment patterns for 0 to F |
| `$FFFA` | | The vectors: NMI `$FE1C`, RESET `$FE22`, IRQ `$FE1F` |

`$FF95-$FF96` and `$FFC1-$FFE9`, 43 bytes, are unused and hold `$FF`.

The workspace in page zero, from the listing's map on page 91 and from every
instruction that names it:

| Address | Name | Written by | Read by |
| --- | --- | --- | --- |
| `$F0` | CONT | NEXT | NEXT |
| `$F1` | "NON USATA" | nothing | nothing |
| `$F2` | FLATAS | ATTESA | ATTESA |
| `$F3` | LAST and ACC | SALVA (A), CJMP (last key) | RUNMOD, CJMP |
| `$F4`, `$F5` | REGY, REGX | SALVA | RUNMOD |
| `$F6`, `$F7` | PCL, PCH | SALVA | DISPC |
| `$F8` | INL | nothing | nothing: the display loop stops at `$F9` |
| `$F9` | INH | SCANS, CJMP | the display |
| `$FA`, `$FB` | POINTL, POINTH | SALVA, RESET, ADDR, DISPC, INCPT, CJMP | nearly every routine |
| `$FC` | TEMPO | DATO, CONDAT, START | DATO, CONDAT |
| `$FD` | REGP | SALVA | RUNMOD |
| `$FE` | UTILE | SALVA, RESET1 | RUNMOD |
| `$FF` | MODO | DAMODE and ADMODE, INIZIO | DATO |

Page 86 gives the reader the saved registers by the same addresses: `00F3`
A, `00F4` Y, `00F5` X, `00F6` and `00F7` the PC, `00FD` the status, `00FE`
the stack pointer.

## Bugs

### 1. RUN Starts a Program With the Status of the Last One Halted

RUN does not start a program; it resumes one. RUNMOD (`$FEC7-$FED9`) loads
the stack pointer from `$FE`, pushes the address on the display and the
status from `$FD`, loads X, Y and A from `$F5`, `$F4` and `$F3`, and returns
into the program with `RTI`. That is what lets RUN after HLT continue a
program exactly where it stopped. But nothing else sets those bytes:

- `$FD`, the status, is written only by SALVA (`STA $FD` at `$FE03`), that
  is by HLT or single step with the NMI vector at `$FE00`, or by a BRK with
  the IRQ vector there. RESET sets the address, the stack pointer and its
  saved copy, the mode and the 8255. It clears decimal mode in the CPU
  itself, which RUN then replaces with the saved status.
- So a board just switched on starts its first program with whatever status
  the RAM came up with.
- And once a program that set decimal mode has been stopped with HLT, or
  single-stepped, every later RUN starts in decimal mode, of any program at
  any address, even after RES, until `00FD` is changed by hand or by another
  halt.

Decimal mode is the flag that matters: a program that never asked for it
adds and subtracts in BCD. The interrupt mask comes along too, and matters
only if something on the expansion connector raises IRQ. A, X and Y are
restored the same way, which matters less, since programs load registers
before using them. Only the stack pointer is reset: RES puts `$FF` in its
saved copy.

The manual's first program shows it. Tabella 7 (page 31) has the reader
press RES and key in `18 A5 06 65 07 85 04 4C 22 FE` at `000A`: `CLC`,
`LDA $06`, `ADC $07`, `STA $04`, `JMP $FE22`. There is no `CLD`. With 09 at
`0006` and 01 at `0007`:

- on a board just switched on with `00FD` at 00, it stores 0A at `0004`;
- after a program that sets decimal mode has been halted with HLT and RES
  pressed, it stores 10;
- with `00FD` at 08, as RAM might come up, it stores 10.

**Reproduce.** On the emulator, or on a board with the NMI vector keyed to
`$FE00` first (`AD 03FC DA 00 + FE`):

1. `AD 000A DA 18 + A5 + 06 + 65 + 07 + 85 + 04 + 4C + 22 + FE`, then
   `AD 0006 DA 09 + 01`.
2. `AD 0200 DA F8 + 4C + 01 + 02`: `SED`, then a loop.
3. `AD 0200 RUN`, HLT, RES.
4. `AD 000A RUN`, then `AD 0004`: the display reads `0004 10`.

**Avoiding it.** Begin every program with `CLD` (`D8`), or key 00 into
`00FD` before RUN. The cassette PROM already does the first: SAVE begins
with `CLD` at `$FBBC`, and LOAD clears decimal mode at `$FC77` before its
first addition, so tapes are not affected.

### 2. In Decimal Mode the Key Routine Gives F and No Key the Same Code

TASTO, routine B at `$FF57`, finds the row and the column of the key that is
down and builds its code as the column plus seven for each row, with
`CLC / ADC #$07` at `$FF77`. It does not clear decimal mode, so a program in
decimal mode gets the code in BCD. The manual presents that as a feature:
Tabella 17 (page 79) has a column for each mode, and in decimal mode A to F
are 10 to 15 and AD, DA, ↑, RUN and REG are 16 to 20.

The code for no key is not computed, though. It is a constant, `LDA #$15` at
`$FF64`, which the listing itself comments "15=NESSUN TASTO":

| Key | Hex mode | Decimal mode, ROM | Decimal mode, Tabella 17 |
| --- | --- | --- | --- |
| 0 to 9 | 00 to 09 | 00 to 09 | 00 to 09 |
| A to E | 0A to 0E | 10 to 14 | 10 to 14 |
| F | 0F | 15 | 15 |
| AD, DA, ↑, RUN, REG | 10 to 14 | 16 to 20 | 16 to 20 |
| none | 15 | **15** | **21** |

In decimal mode F and no key are both 15, and the ROM never returns 21. The
text on page 78 agrees with the table: "Se non vi è alcun tasto premuto o
più di un tasto premuto il contenuto dell'accumulatore vale 21 se in
funzionamento decimale o 15 se in funzionamento esadecimale." A program
written from it that waits for 21 never sees the key released; one that
tests for 15 cannot tell F from no key. 21 is three sevens added in BCD, the
code the routine's own arithmetic would give a fourth row, which may be how
the table came by it.

The same sentence is wrong about two keys at once. TASTO does not report no
key then: it returns the key with the lowest code in the first row that has
one down. With 1 and F held together it returns 01.

**Reproduce.** This program shows the code on the data displays for as long
as a key is held. It writes `$99` to the 8255 first, as page 78 asks before
routine B is called:

```
0200  F8         SED
0201  A9 99      LDA #$99      Port A to input
0203  8D 03 FD   STA $FD03
0206  20 57 FF   JSR $FF57     TASTO
0209  85 F9      STA $F9       to the data displays
020B  20 0C FF   JSR $FF0C     SCAND1: show $FB, $FA and $F9
020E  4C 01 02   JMP $0201
```

Key `AD 0200 DA F8 + A9 + 99 + 8D + 03 + FD + 20 + 57 + FF + 85 + F9 + 20 +
0C + FF + 4C + 01 + 02`, then `AD 0200 RUN`. The displays read `0200 15`
with no key and `0200 15` with F held; A gives 10, AD 16, REG 20. With
`D8` (`CLD`) at `0200` instead they show the hex codes, and F gives 0F. With
`EB FE` at `0207-0208` they show routine A's result instead (see Errors in
the Manual).

**Avoiding it.** Call TASTO with decimal mode clear, and set it again after
the call if the program needs it.

### 3. The Main Loop Entered in Decimal Mode Scrambles the Keypad

The main loop, ATTESA at `$FE30`, acts on TASTO's hex codes: below `$10` a
digit, `$10` AD, `$11` DA, `$12` ↑, `$13` RUN, `$14` REG, and from `$15` up
nothing (`CMP #$15 / BPL` at `$FE4D`). Only INIZIO clears decimal mode
(`CLD` at `$FEE8`), and INIZIO runs on the way in from RESET and from SALVA,
not at `$FE30`. Entered there in decimal mode, the keypad becomes:

| Key | Acts as |
| --- | --- |
| 0 to 9 | itself |
| A | AD |
| B | DA |
| C | ↑ |
| D | RUN |
| E | REG |
| F, AD, DA, ↑, RUN, REG | nothing |

until RES, whose way in passes through INIZIO. Every key in the table was
checked by running the ROM.

On the board nothing documented enters at `$FE30`. The manual's programs end
with `JMP $FE22`, and its interrupt vectors point at `$FE00` or at the
program's own routine. A program has to jump there itself, or a user has to
put `$FE30` into `$03FE`. In the emulator it happens more easily; see What
This Means for the Emulator.

**Reproduce.** On the emulator; on a board key `AD 03FE DA 30 + FE` first.
`AD 0200 DA F8 + 00`, a `SED` and a `BRK`, then `AD 0200 RUN`. Now `0300`
sets the address, AD does nothing, and D runs whatever is at `0300`.

### 4. The Branch Calculator Overwrites a Halted Program's A

The branch calculator, CJMP at `$FF97`, is started with `AD FF97 RUN`
(page 58). The reader keys the low byte of a branch instruction's address
and the low byte of its target, and the data displays show the offset:
`222B` gives `07`. To tell a new key from one still held, CJMP keeps the last
code it read in `$F3`, which the listing calls LAST. `$F3` is also ACC, where
SALVA keeps a halted program's A: the listing's own map on page 91 gives the
one location both names, two lines below `00F1 =NON USATA`. CJMP writes
`$F3` on its first pass: the code it reads, the RUN key still held or 15 for
none, replaces the saved A unless the two happen to be equal.

So using the calculator while a program is halted loses that program's A.
Halt a program with A at 5A, work out an offset, press RES, then REG and RUN:
the program resumes with A at 15. That is a natural sequence while
single-stepping as page 86 describes it: find a wrong branch, work out its
offset, correct the byte, then REG and RUN to carry on. `$F1` was free, and
nothing in the ROM reads or writes it.

**Reproduce.** On the emulator, or on a board with the NMI vector at
`$FE00`: `AD 0200 DA A9 + 5A + 4C + 02 + 02`, `AD 0200 RUN`, HLT. `AD 00F3`
shows 5A. Then `AD FF97 RUN`, `2 2 2 B` (the displays read `222B 07`), RES,
`AD 00F3`: it shows 15.

### 5. The Branch Calculator Does Not Debounce

The main loop takes a key only after seeing it down on three successive
scans of the display, each 4247 cycles, about 4.2 ms. It then reads the key,
leaves the display dark for 26.9 ms (`LDX #$15` at `$FE51`, commented "PULSO
IL DISPLAY") and ignores the keypad until every key is up (FLATAS). A key
whose contacts bounce is read once.

CJMP's loop, one scan and one read, takes 4423 cycles, and it takes a key as
soon as the code read differs from the one before. A contact that opens for
longer than one scan while it bounces, then closes again, gives two keys, and
the digit is entered twice. With a bounce assumed at 10 ms closed, 10 ms
open, then closed, the main loop entered a `1` once and CJMP entered it
twice. How long the board's keys really bounce is not known here; the
display shows the doubled digit, and the reader can key the four digits
again.

## Errors in the Manual

These do not change what the board does; they change what a reader of the
manual expects of it.

- **Tabella 17 and page 78.** In decimal mode the code for no key is 15, not
  21, and two keys at once give one of them, not the code for no key. See
  bug 2.
- **Routine A, page 77.** TESTAS at `$FEEB` is said to leave "01 in
  Accumulatore se c'é qualche tasto premuto". It returns the column bits of
  the keys that are down, in any row: `40` for 0, `20` for F, `10` for 9 and
  for AD, `08` for A, `01` for 6 and for REG. The `BEQ` or `BNE` the manual
  says to follow it with works; `CMP #$01` would not.
- **Routine A says nothing about the 8255.** It reads Port A just as
  routine B does, without setting its direction. Only routine B's
  description tells the reader to write 99 to `FD03` first, and START,
  routine D, leaves Port A an output.
- **Page 58.** The backward-branch example says "l'istruzione BEQ IND1 è
  infatti all'indirizzo 032B" and has the reader key 2D. The keys and the
  answer, F7, fit an instruction at 032D, and so does the page's own earlier
  sentence, which puts the PC after it at 032F.
- **The printed listing**, pages 91 to 93, has the right bytes and a few
  slips in its text. The comments on `$FE03` and `$FE14` are swapped: "STA
  REGP  SALVO STACK" and "STX UTILE  SALVO STATUS", where page 86 has them
  right. The label at `$FEEF` is printed RETASR, though TASTO calls it
  RETAST. Three addresses are printed `F072`, `F073` and `F075` for `FE72`,
  `FE73` and `FE75`. `$F0` is CONT in the map and COUNT at two of its three
  uses, and `$FD03` is DEF in the map and CONTR in START.

## Smaller Faults and Limits of the Design

- **START leaves the last digit lit.** Routine D (`$FF7E`) returns with Port B
  still selecting the sixth digit and its segments still driven, where SCANS
  turns every digit off and Port A back to input before it returns
  (`$FF2A-$FF2F`). A program that does other work between calls shows a
  rightmost digit brighter than the rest, lit until the program next writes
  the 8255.
- **A data digit writes its byte four times.** DATO shifts the digit in a bit
  at a time, reading and writing the location on each pass (`$FE7B-$FE82`).
  RAM ends up right, but an I/O register receives three intermediate values.
  The monitor's own workspace goes wrong, because the pointer it writes
  through is among the bytes it changes: on a board just switched on,
  `AD 00FA DA 5` leaves the display at `00F4 05`. The address has moved and
  the digit has gone into the saved Y.
- **A second HLT loses the first.** SALVA saves whatever is running. Pressed
  again while the monitor shows a halted program, HLT replaces that
  program's registers with the monitor's own, for instance PC `FF48`, in the
  display routine's delay loop, and stack pointer `FB`.
- **The interrupt vectors start undefined.** `$03FC-$03FF` are in RAM and the
  monitor never writes them, so HLT, single step or a `BRK` on a board nobody
  has prepared jumps wherever the RAM points. Page 85 has the reader key
  "00 e FE rispettivamente alle locazioni 03FC e 03FD" first. They are also
  the last four bytes of the 1 KB of RAM, so a program at `0200` longer than
  508 bytes overwrites them, which page 85 warns of too: "badando che il
  programma stesso non vada ad interessare le locazioni 03FC e 03FD".
- **After HLT the monitor runs on the halted program's stack.** SALVA does
  not reset the stack pointer, and the monitor uses at most four bytes below
  the program's. Those hold nothing of the program's unless it keeps data
  under its stack pointer, or has fewer than four bytes of stack left, when
  the monitor's use wraps round to `$01FF`.
- **The branch calculator cannot check range.** It has only the two low
  bytes, so a branch too long for an offset gets a plausible wrong one: from
  `10` to `00` it shows `EE`, where `+238` would be needed. Page 58 gives the
  limits, +129 and -126 from the branch instruction. It computes the page's
  two examples correctly.

## Checked and Sound

- The bytes are those of the printed listing, line for line.
- Both code areas, `$FE00-$FF94` and `$FF97-$FFC0`, are made of documented
  NMOS 6502 instructions only.
- The indirect jumps at `$FE1C` and `$FE1F` read their pointers at `$03FC`
  and `$03FE`, so they are clear of the 6502's fault with a pointer at
  `$xxFF`.
- The digit table at `$FFEA` is right for all sixteen digits.
- Every path keeps the stack balanced: HLT and RUN can follow each other
  indefinitely without using up the stack.
- The main loop's debounce, its lockout until every key is up, and its
  handling of a key released during the confirming scans are sound.
- The monitor leaves the cassette circuit alone. Its keypad reads mask Port A
  bit 7, the tape latch (`ORA #$80` at `$FF01`), and every value it writes to
  Port B has bit 0 high and bits 5 to 7 low, so it never clears the latch,
  drives the recorder or lights the LEDs D4-D7.
- The cassette routines are safe from bug 1, as described under it.

## Security

The machine had no connection to anything but a cassette recorder, so the
question is what a tape can do. Very little, and nothing that lasts.

- **The monitor reads no outside data.** Its inputs are the keypad and the
  NMI and IRQ lines. It has no buffer, no length field and nothing that
  parses, so there is nothing for crafted data to overflow. On a 6502, with
  no privileged mode and no memory protection, whoever is at the keypad
  already controls the machine. The monitor protects nothing, and was not
  meant to.
- **The tape is read by IC10, not by the monitor.** LOAD at `$FC54` reads a
  record and stores it in RAM, at the address recorded on the tape if `0002`
  holds FF, or at the user's address otherwise, for as many bytes as the
  tape's header says.
- **A tape cannot start itself.** Both LOAD paths, the routine and the
  emulator's trap, end at `$FE22`. The routine stores each byte from its top
  level (`STA ($E8),Y` at `$FCB9`), between subroutine calls, so no return
  address is waiting on the stack when a byte lands, and loading over page
  one redirects nothing. The monitor runs code in RAM only on RUN, through
  `$03FC` (HLT, single step) and through `$03FE` (BRK, IRQ).
- **A tape can take over HLT and BRK.** A record that covers `$03FC-$03FF`,
  loaded at its own address or long enough to reach them from the user's,
  points the vectors at its own code. RES does not restore them, so HLT runs
  that code until the board is switched off or the vectors are keyed again.
  Tried on the emulator: after such a LOAD nothing ran; after RES the NMI
  vector still pointed at the tape's code; HLT ran it.
- **A tape can choose the next program's status**, by covering `$00FD`
  (bug 1).
- **Nothing survives switching off.** The PROMs have no write line, and the
  RAM forgets.

## What This Means for the Emulator

The emulator runs the ROM unchanged, so every bug above is in it. Three of
its own choices change how they show:

- **Power-on clears RAM.** `Amico2000.reset()` fills `$0000-$07FF` with
  zero, so `00FD` starts at 00 and the power-on half of bug 1 never shows.
  It also seeds the NMI vector with `$FE00`, so HLT always goes through
  SALVA, and the other half is easy to meet: stop a decimal-mode program with
  HLT, and the next program RUN computes in decimal until `00FD` is cleared.
- **The IRQ and BRK vector is seeded with `$FE30`**, the main loop, which
  bypasses INIZIO. A program in decimal mode that runs into a `BRK`, which is
  what a runaway program finds in cleared RAM, lands in the main loop with
  the keypad of bug 3, on which D runs whatever is at the displayed address.
  AGENTS.md records that this seed has not been decided (HLT and the NMI
  Line). `$FE00` would avoid the problem, since SALVA calls INIZIO; it is the
  routine the listing names for the purpose, "da interrupt non mascherabile
  o da break", and it would show where the `BRK` stopped. `$FE22` would
  avoid it too. This review does not change the seed.
- **A read of Port A gives the keys whatever the port's direction**
  (`docs/8255-data-sheet.md`). A program that calls TASTO or TESTAS without
  writing `$99` first still reads keys here; on a board, Port A would still
  be driving its lines as an output.

## Checking in Node

The keys given above work on the page as served. In Node the same can be
done with the project's helper, as `tests/keyboard-matrix.test.js` does:

```js
const { bootedMachine } = require('./tests/helpers/machine');

const amico = bootedMachine();
const ms = (n) => amico.cpu.run(1000 * n);  // about 1 MHz
const press = (key) => { amico.keyDown(key); ms(80); amico.keyUp(key); ms(80); };

ms(50);  // let RESET run first: it clears $FA/$FB, so set nothing before it
// AD is 'ArrowUp', DA 'ArrowDown', the increment '+', RUN 'Enter', REG 'r';
// HLT is amico.hlt() and RES amico.res().
```

None of these checks is in the test suite yet.
