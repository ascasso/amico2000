# Manual Content Catalog

This catalog is a first-pass inventory from the embedded OCR layer. Italian
headings are kept in the original language; English notes explain why each
section matters to the emulator project.

## Main Contents

| Manual heading | Printed page | Project relevance |
| --- | ---: | --- |
| `CAPITOLO I - Cosa è un microelaboratore` | 9 | General introduction and AMICO 2000 overview. |
| `CAPITOLO II - Il linguaggio del microelaboratore` | 15 | Programming model, 6502 instruction introduction, program counter. |
| `CAPITOLO III - Montaggio e collaudo del microelaboratore` | 21 | Hardware architecture, assembly, first programs, key descriptions. |
| `CAPITOLO IV - Il sistema di indirizzamento` | 35 | Addressing, zero page, memory map, early AMICO exercises. |
| `CAPITOLO V - L'uso del registratore a cassette` | 43 | Cassette interface and software behavior: IC10 at $FB00-$FCFF, LOAD at $FC54, SAVE at $FBBC, zero-page parameters, 300 bit/s tape rate, GND/IN/OUT wiring, and the tape record layout. |
| `CAPITOLO VI - I numeri negativi` | 53 | Arithmetic, status flags, branching, indexed addressing, games. |
| `CAPITOLO VII - Registro indice Y e Stack Pointer` | 63 | Y register, stack pointer, subroutines, shift/rotate, multiplication. |
| `CAPITOLO VIII - Uso della porta utente` | 75 | 8255 usage, display and keyboard monitor routines, interrupts, single step. |
| `CAPITOLO IX - Ultime istruzioni di indirizzamento` | 87 | Remaining addressing modes and target-practice example. |
| `CAPITOLO X - Il Listing del monitor` | 91 | Monitor listing, labels, vectors, display/key routines. High-value emulator reference. |
| `APPENDICE 1 - Sommario istruzioni 6502` | 95 | Italian 6502 instruction summary. Useful for historical documentation, less important than external CPU conformance tests. |
| `APPENDICE 2 - Programmi applicativi per il microcomputer AMICO 2000` | 97 | Main source of runnable example programs for emulator validation. |

## Appendix 2 Program Targets

These titles are extracted from the manual and should be verified visually before
creating runnable program assets.

| Italian title | Printed page | Start address observed | Notes |
| --- | ---: | --- | --- |
| `Calcolatrice elettronica` | 97 | `04DC` entry point, listing begins at `0200` | Large calculator program with fixed decimal behavior and error messages. |
| `Operazioni aritmetico-logiche` | 100 | `0200` | Drill program for `add`, `sott`, `and`, `or`, `eor` operations. |
| `Traduzione da notazione binaria in esadecimale e viceversa` | 101 | `0200` | Binary/hex conversion exercise; OCR is noisy in the listing. |
| `Asteroidi` | 102 | `0200` | Game using display segments for an asteroid field. |
| `21 fiammiferi` | 103 | `0200` | Matchstick game against AMICO 2000. |
| `Carte` / blackjack-style card game | 104 | `0200` | Describes a true deck model and betting with tokens. Title needs visual confirmation. |
| `Labirinto` | 105 | `0200` | Maze game using keypad movement. |
| `Due sette` | 106 | `0200` | Seven-segment display game; likely useful for display behavior testing. |
| `Caccia al numero` | 107 | relocatable, first instruction | Uses the user port and an external speaker; useful for 8255 Port C behavior. |
| `Atterraggio lunare` | 108 | `0200` | Lunar landing game with altitude, velocity, fuel, and keypad thrust. |
| `Filetto` | 109 | `0100` and `0200` sections | Tic-tac-toe style game against the computer. |
| `Battaglia navale` | 110 | `0200` | Battleship-style game; OCR title is noisy and needs visual confirmation. |
| `Slot machine` | 111 | `0200` | Slot machine game with token counter and segment combinations. |

## High-Value Technical Extraction Targets

- `Tabella 6 - DESCRIZIONE DEI TASTI FUNZIONALI DELL'AMICO 2000`: compare with current keyboard handling and comments.
- `Tabella 7 - PROGRAMMA PER ESEGUIRE UNA OPERAZIONE DI SOMMA`: first small program candidate.
- `Mappa della memoria dell'AMICO 2000/A`: compare with `CLAUDE.md` and emulator memory map.
- Cassette chapter: identify monitor/cassette routines and expected user workflow.
- Monitor listing pages 91-93: compare labels, vectors, display routines, and keyboard routines against embedded ROM data.
- Appendix 2 listings: convert each verified listing into a machine-readable local format and document expected display/key behavior.

## Listing Extraction Status

Initial candidate listing files live in `docs/manual-extraction/listings/`.
They are intentionally marked `candidate` until byte values are checked against
rendered page images.

| Listing file | Source page | Status |
| --- | ---: | --- |
| `somma-000a.hex` | 31 | candidate |
| `somma-carry-0201.hex` | 36 | candidate |
| `clear-page-zero-range-0200.hex` | 59 | verified |
| `trasformazione-complemento-due-0200.hex` | 62 | candidate |
| `master-mind-0200.hex` | 62 | candidate |
| `21-fiammiferi-0200.hex` | 103 | candidate |
