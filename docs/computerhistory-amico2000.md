# ComputerHistory.it Amico 2000 Preservation Notes

Source: [ComputerHistory.it - Amico 2000](https://web.archive.org/web/20260113032804/https://computerhistory.it/index.php?option=com_content&view=article&id=85&Itemid=117)

Original URL: `https://computerhistory.it/index.php?option=com_content&view=article&id=85&Itemid=117`

Wayback snapshot: `2026-01-13 03:28:04`

Article metadata:
- Title: `Amico 2000`
- Author: Luigi Serrantoni
- Created: 2008-04-04
- Last modified: 2020-01-07
- Language: Italian

This file preserves the factual content of the archived article in summarized form. It intentionally does not copy the full article verbatim.

## Reconstruction Context

The reconstruction project started from a discussion on the Italian newsgroup `it-alt.comp.folklore`. The goal was to recreate an Italian historical computer, with the AMICO 2000 chosen because it was sought after, apparently no longer commonly owned, and at risk of being forgotten. The article presents the page as a public collection of information for people interested in attempting a reconstruction.

The article includes a photo from an October 1979 advertisement.

## Printed Circuit Board

The printed circuit board was identified as the main difficulty in the reconstruction.

Key PCB facts:
- Schematic and assembly-layout information had been published in `Sperimentare`.
- A clean standalone PCB trace drawing was not published.
- The reconstruction relied on the out-of-scale March 1979 `Sperimentare` mounting-layout drawing, page 287.
- That drawing combined both PCB faces and the silkscreen, making traces hard to decode.
- The reconstruction approach was to create a CAD drawing of the original board and preserve the original dimensions.
- The board dimensions used were `300 x 100 mm`, matching the magazine indication and roughly matching the assembly-layout drawing.
- The author later reported that the prototype PCBs arrived.
- In May 2008 the first reconstructed AMICO 2000 was assembled and working.
- The article includes a comparison between an original AMICO 2000 and the replica; the original-machine photo was supplied by Francesco Messano.

PCB-related images from the page:
- Advertisement photo, October 1979: `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/computer/asel/asel_amico2000_s.jpg`
- CAD power/trace image: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000pw.jpg`
- CAD PCB image: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000pcb.jpg`
- Manufactured PCB photo: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000_real_pcb.jpg`
- First working build photo: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000build1.jpg`
- Original-vs-replica comparison: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/a2000_confronto.jpg`

## Component Availability Notes

The article frames component availability as a major issue for historical-machine reconstruction. It says the reported component information was gathered from recovered datasheets, eBay, surplus boards, and distributor listings, and should be treated as information to verify rather than guaranteed current sourcing data.

Bill of materials reference:
- Component list PDF: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/lista_componenti_amico2000.pdf`

### CPU

The CPU is a 6502. The article notes that 6502 parts were common historically, especially in arcade boards, but difficult to source as new stock.

Reported sourcing detail:
- Distrelec listed a potentially compatible Western Design Center part: `W65C02S6PG-14`
- Distrelec code: `642017`
- Reported price at the time: `12.8 EUR`
- The article says it was not found at RS or Farnell at the time.

### RAM

RAM parts mentioned:
- `TMS4045`
- `2114`

Reported sourcing detail:
- Farnell code: `4790522`
- Reported price at the time: `10.91 EUR`
- The article says this part was believed to be compatible.

### System ROM / PROM

The original system ROM part is described as a Fairchild `93448`.

Reported characteristics:
- Programmable ROM
- `512 byte`
- Tri-state outputs
- Address access time: `35 ns`
- Chip-select access time: `15 ns`
- One-time programmable, so old programmed parts cannot be reused unless they already contain the needed code

Reported equivalent or possibly equivalent 512-byte PROMs:
- Signetics `82S141`
- Texas Instruments `74S474`
- National `87S296`
- Intel `3624`
- Harris/Motorola `7641`
- AMD `27S31` (listed as needing verification)
- Texas Instruments `TBP28S46` (listed as needing verification)
- Raytheon `29625` (listed as needing verification)
- MMI `6341-1` and `63S485` (listed as needing verification)

The article also describes using 1024-byte PROMs, including the Signetics `82S181`, in place of the 512-byte PROM. For 1024-byte PROMs, pin 22 is address `A9`; on the AMICO 2000 PCB that pin is not connected. The article recommends programming the same 512-byte image into both halves of the 1024-byte device.

Reported compatible 1024-byte PROMs:
- MMI `6381`
- MMI `63S881`
- TI `28S86`
- Motorola/Harris `7681`
- AMD `27S181`
- National `87S181`
- Intel `3628A`
- NEC `uPB428`
- Fujitsu `MB7162`
- Fairchild `93451`

### EPROM 2716 / 2732 Adapter Notes

The article describes `2716` and `2732` EPROMs as possible substitutes for the `93448`, with similar pinouts but different enable signals.

Important pinout/enable notes:
- The `93448` has four chip-select inputs: two positive and two inverted.
- AMICO 2000 ties the positive chip-select inputs, pins `18` and `19`, to `+5V`.
- AMICO 2000 uses the inverted chip-select inputs on pins `20` and `21`.
- `2716` and `2732` EPROMs provide inverted enable signals such as chip enable and output enable.
- The article says those signals need verification as substitutes for the PROM chip selects, otherwise an extra logic gate may be required.

The article reports that a `2716` adapter was tested successfully in May 2008. The adapter used two sockets, cut pins, and a soldered jumper so the EPROM itself did not need its pins cut and remained reprogrammable.

Practical warnings from the article:
- Verify that cut pins do not contact the lower socket.
- Insert insulation if necessary.
- Avoid inserting the EPROM so far that pin `21` contacts the lower-socket pin `21`.
- The author tested the approach with `2716` and expected it to also work for `2732`.
- The `2716` was programmed as four consecutive copies of the 512-byte image across the 2 KiB EPROM.
- A later variant grounded unused address pins; the shown example was for `2732`, and was expected to work with `2716` too.

Adapter images:
- `2716` adapter diagram: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/2716_to_rom.jpg`
- `2716` adapter photo: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/2716_to_rom_foto.jpg`
- `2732` adapter diagram: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/2732_to_rom.jpg`

## Address-Decoding PROMs

The address decoder uses two National `74S287` PROMs.

Reported characteristics:
- `1024 bit`
- `3-state`
- Organization: `256 x 4 bit`
- Access time: `30 ns`
- One-time programmable

Reported compatible or likely compatible decoding PROMs:
- Signetics `82S129`
- AMD `27S21`
- Fairchild `93427`
- MMI `6301-1`
- MMI `63S141`
- TI `24S10`
- TI `74S287`
- Intel `3621`
- NEC `uPB423`
- Fujitsu `MB7052`
- Harris `7611-5`
- Raytheon `29661`
- Intersil `5623A`

The article emphasizes that compatible-looking PROMs may need different programming algorithms. It reports an unsuccessful attempt to program TESLA `74S287` devices as National `74S287`, likely because of a different programming algorithm. The article says ELNEC programmers appeared to support those rare TESLA devices.

PROM programmer references mentioned:
- `http://geocities.com/SiliconValley/5857/prom.htm`, archived at `https://web.archive.org/web/20260113032804/http://geocities.com/SiliconValley/5857/prom.htm`
- `http://www.worldofspectrum.org/BackToThePlus3/prommer.html`, archived at `https://web.archive.org/web/20260113032804/http://www.worldofspectrum.org/BackToThePlus3/prommer.html`
- An Elektor PROM programmer article, believed by the page author to have appeared in the original August 1980 edition, but not located.

The article also describes `512 x 4` PROMs such as MMI `63S241` as usable substitutes. In that configuration pin `14`, which is an inverted enable pin on `256 x 4` devices, becomes address `A8`. On the AMICO 2000 PCB pins `13` and `14` are both tied to ground, so the code should be placed in the lower 256 locations.

Reported compatible `512 x 4` PROMs:
- Signetics `82S131`
- MMI `6306-1`
- TI `74S370`
- Motorola/Harris `7621`
- AMD `27S13`
- National `74S571`
- Intel `3622`
- NEC `uPB412`
- Fujitsu `MB7053`
- Fairchild `93446`

The article mentions modern alternatives such as EEPROMs, PALs, or GALs, but says no drop-in pin-compatible memory or programmable logic was known, so a piggyback adapter would be needed.

Other replacement references:
- eBay seller `*rfguys*` sold a kit for replacing Motorola radio channel PROMs `82S129` / `82S131` using an SMD EEPROM on a DIL adapter plus a programmer.
- A `28C16` EEPROM-based adapter was described at `http://www.brinkleyelectronics.com/adp/adp_fr.htm`, archived at `https://web.archive.org/web/20260113032804/http://www.brinkleyelectronics.com/adp/adp_fr.htm`
- The article warns that EEPROM access time may be too slow; the example `28C16` access time is reported as `100-200 ns`.

Decoding PROM image:
- `74S287`: `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/74s287.jpg`

## Other Component Notes

### I/O

The I/O device is an `8255` with three 8-bit ports. It is described as relatively common and recoverable from surplus boards.

Reported sourcing detail:
- RS code: `426-985`
- Reported price at the time: `5.57 EUR`

### Display

Original displays:
- `TIL312`
- `0.3 inch`
- Common-anode
- 14-pin DIL-style pinout

Alternative display mentioned:
- `MAN72`

Other display compatibility notes:
- The AMICO 2000 does not drive the decimal point, so left- or right-decimal variants can be used.
- RS code `587-894A` for `MAN72A`, reported at `19.9 EUR` for 25 pieces.
- HP/Agilent/Avago `5082-7730` and `5082-7731` were listed as likely compatible.
- Kingbright `SA03-12HDB` was listed as an alternative, Farnell code `1318269`, reported at `1.02 EUR`.

Display image:
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/display.jpg`

### Crystal

Original crystal details:
- Frequency: `1 MHz`
- Cases mentioned: `HC33/U` tinned, `HC47/U`, or `HC51/U` welded/resistance-soldered

Compatibility notes:
- `HC6` has the same body dimensions, but its leads are `1.27 mm` diameter.
- The reconstructed PCB used `0.8 mm` holes, so `HC6` crystals are not usable.
- Smaller `HC49U` packages can be used, but `1 MHz` is uncommon.

Reported sourcing detail:
- Distrelec code `644356`
- `1 MHz` in `HC49U`
- Reported price at the time: `4.95 EUR`
- Not available at Farnell or RS at the time.

Crystal image:
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/hc33.jpg`

### Keys

The original keys were believed to be C&K parts, no longer in the C&K catalog at the time, but possibly still made by ITT/Cannon.

Reported sourcing details:
- RS Italia stocked only a grey-key version, code `102-169`, reported at `15.25 EUR` for 5 pieces.
- RS listed C&K references `Y65A00303FPLFS` and `Y651050300P`.
- Digi-Key listed:
  - `401-1934-ND`: key without cap, reported at `2.076 USD`
  - `401-1177-ND`: red cap, reported at `0.29 USD`
  - `401-1178-ND`: blue cap, reported at `0.29 USD`
- The article estimates about `1.6 EUR` per key, excluding shipping, for the Digi-Key route.
- Cedelettronica listed code `INGMDP`, reported at `1.76 EUR` without cap, or `2.75 EUR + VAT` with a blue cap.
- Ready Components listed:
  - `MDPSLFS`: key, reported at `2.83 USD`
  - `BTN MDP 60`: blue cap, reported at `0.33 USD`
  - `BTN MDP 40`: red cap, reported at `0.33 USD`
- Grazia Componenti in Bologna also carried compatible keys but did not sell online.

The article notes that the key pinout is unusual, making alternative parts from other manufacturers difficult to identify.

Key-related references:
- Digi-Key: `https://web.archive.org/web/20260113032804/http://www.digikey.com/`
- Cedelettronica: `https://web.archive.org/web/20260113032804/http://www.cedelettronica.com/`
- Ready Components: `https://web.archive.org/web/20260113032804/http://www.readycomponents.com/`
- Grazia Componenti catalog: `https://web.archive.org/web/20260113032804/http://www.graziacomponenti.it/catalogo/244.pdf`

Key images:
- Key photo: `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/tasto.jpg`
- Key layout image: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/layout_tasto.jpg`
- Key without cap: `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/tasto_nocap.jpg`

### Display Driver

The display driver is `ULN2003`. The article describes it as still common and made by multiple manufacturers.

Reported sourcing detail:
- RS code: `436-8451`
- Reported price at the time: `0.38 EUR`

### Heatsink

The original heatsink appeared to be about `30 mm` tall and `25.4 mm` wide. The article suggests RS code `234-2306`, a `30 x 30 mm` part, reported at `2.05 EUR`.

### Slide Switch

The reconstructed PCB preserved original hole positions measured from the assembly-layout drawing.

Hole details:
- One footprint: `2.54 mm` pitch, `1 mm` holes
- Second footprint: `4.13 mm` spacing, with center pin offset by `2.54 mm`, `1.4 mm` holes

The larger footprint was assumed to match the original switch, but the original part was not identified.

Reported substitutes:
- Distrelec `200180`, reported at `1.25 EUR`
- Distrelec `202560`, reported at `1.55 EUR`
- RS `181-0038`, reported at `4.95 EUR` for 5 pieces
- RS `115-6283`, reported at `6.95 EUR` for 5 pieces

Switch images:
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/200180f.jpg`
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/200180z.jpg`
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/202560f.jpg`
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/202560z.jpg`
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/1156283.jpg`

### 40-Pin Connector

The AMICO 2000 PCB includes holes for a connector used to link to an external motherboard carrying Eurocard expansion cards.

The article identifies the likely connector as:
- 3M flat-cable connector
- Code: `3418-0005PR`

Reported sourcing details:
- RS code `514-6101`, reported at `3.17 EUR`
- Farnell code `9184040`, reported at `3.41 EUR`
- Not needed for the base board.

Connector image:
- `https://web.archive.org/web/20260113032804im_/https://computerhistory.it/images/stories/retrocomputing/amico2000/connettore.jpg`

## Datasheets Linked From The Article

- CPU `6502`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/r6502.pdf`
- Fairchild PROM `93448`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/93448.pdf`
- Signetics PROM `82S141`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/82s141.pdf`
- National PROM `74S287`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/74s287.pdf`
- Signetics PROM cross-reference: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/signetics_cross_reference.pdf`
- EPROM `2716` / `2732`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/2716-32.pdf`
- Texas Instruments `TMS4045`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/tms4045.pdf`
- Fairchild `MAN72` display: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/display_man72.pdf`
- `8255` I/O interface: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/8255.pdf`
- `ULN2003` display driver: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/uln2003.pdf`
- ITT `MDP` key series: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/tasti_itt_mdp.pdf`
- 3M 40-pin flat connector: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/pdf/connettore_3m.pdf`

## PROM Contents And Memory Map

The article says the machine has four PROMs:
- Two address-decoding PROMs
- Two system-software PROMs

Only two PROMs are needed for the base-board version.

### Monitor ROM IC9

The monitor ROM contents were published in the book `Costruiamo un vero microelaboratore elettronico`, and likely also in the magazine. Davide supplied a monitor ROM file that he had manually copied from the magazine.

Download:
- `amico2000_replica_PROM_IC9.bin`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000_replica_PROM_IC9.bin`

### Cassette Software ROM IC10

The second software ROM contained cassette-recorder management code. The article says the contents were not known to have been published. Mario, who owned an original AMICO 2000, read and supplied the ROM contents. The cassette ROM is not required for base-machine operation.

Download:
- `amico2000_replica_PROM_IC10.bin`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000_replica_PROM_IC10.bin`

### Address-Decoding PROMs IC6 / IC7

The address-decoding PROMs generate device-select signals according to address. They do not contain software. The article says their contents were not known to have been published. Without reading an original machine, the contents must be reconstructed from available documentation.

Each PROM generates four chip-select signals:
- IC6: `CS1` through `CS4`
- IC7: `CS5` through `CS8`

All eight chip-select signals feed optional IC8, a `74LS30` 8-input NAND, to create `MEMSEL`, which is brought only to the external bus.

Important schematic correction from the article:
- Optional RAM chips `IC13` and `IC14` are not selected through `CS5` from IC7 pin 9.
- They are selected through `CS3` from IC6 pin 11.

Both decoding PROMs take address lines `A8` through `A15` as inputs.

### IC6 Output Mapping

| Pin | Pin name | Signal | Driven hardware |
| --- | --- | --- | --- |
| 9 | `DO4` / MSB | `CS1` | Pin 8, inverted CS, of standard RAM `IC11` and `IC12` |
| 10 | `DO3` | `CS2` | Pin 6, inverted CS, of `IC15` / `8255` |
| 11 | `DO2` | `CS3` | Pin 8 of optional RAM `IC13` and `IC14` |
| 12 | `DO1` / LSB | `CS4` | Pin 20, inverted CE, of monitor PROM `IC9`; also pin 4 of `IC4` for single-step |

### IC7 Output Mapping

| Pin | Pin name | Signal | Driven hardware |
| --- | --- | --- | --- |
| 9 | `DO4` / MSB | `CS5` | Only to `IC8` |
| 10 | `DO3` | `CS6` | Only to `IC8` |
| 11 | `DO2` | `CS7` | Only to `IC8` |
| 12 | `DO1` / LSB | `CS8` | Pin 20, inverted CE, of cassette software PROM `IC10` |

### Device Address Map

| Device | Address range |
| --- | --- |
| Standard 1 KiB RAM | `0000-03FF` |
| Optional 1 KiB RAM | `0400-07FF` |
| Cassette-program PROM | `FB00-FCFF` |
| `8255` I/O | `FD00-FD03` |
| Monitor-program PROM | `FE00-FFFF` |

### IC6 PROM Patterns

The article says the following 4-bit output patterns define the standard `IC6` decoding PROM. This is enough for the base version plus RAM expansion, without cassette ROM or external interfaces.

| A8-A15 address byte/range | Driven device | Output pattern |
| --- | --- | --- |
| `00-03` | Standard RAM | `0111 = 7` |
| `FD` | `8255` | `1011 = B` |
| `04-07` | Optional RAM | `1101 = D` |
| `FE-FF` | Monitor ROM | `1110 = E` |

Download:
- `amico2000_replica_PROM_IC6.bin`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000_replica_PROM_IC6.bin`

### IC7 PROM Patterns

The article says `IC7` can be generated analogously.

| A8-A15 address byte/range | Driven device | Output pattern |
| --- | --- | --- |
| `FB-FC` | Cassette ROM | `1110 = E` |

Download:
- `amico2000_replica_PROM_IC7.bin`: `https://web.archive.org/web/20260113032804/https://computerhistory.it/images/stories/retrocomputing/amico2000/amico2000_replica_PROM_IC7.bin`

## Documentation Links Listed In The Article

### Book

- `Costruiamo un vero elaboratore elettronico`: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Costruiamo_un_vero_elaboratore_elettronico.pdf`

### Sperimentare Articles

- Part I, `Sperimentare`, December 1978: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte1.pdf`
- Part II, `Sperimentare`, January 1979: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte2.pdf`
- Part III, `Sperimentare`, March 1979, HTML scan: `https://web.archive.org/web/20260113032804/http://www.webalice.it/mrlncrl/sperimentare/sperimentare_MAR79.html`
- Part III, `Sperimentare`, March 1979, PDF scan: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte3.pdf`
- Part IV, `Sperimentare`, May 1979, Webalice scan: `https://web.archive.org/web/20260113032804/http://www.webalice.it/mrlncrl/sperimentare/amico2000-4-mag79.pdf`
- Part IV, `Sperimentare`, May 1979, HP64000 scan: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte4.pdf`
- Part V, `Sperimentare`, June 1979: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte5.pdf`
- Part VI, `Sperimentare`, July/August 1979: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte6.pdf`
- Part VII, `Sperimentare`, September 1979: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte7.pdf`
- Part IIX, `Sperimentare`, October 1979: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte8.pdf`
- Part IX, `Sperimentare`, November 1979: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte9.pdf`
- Part X, `Sperimentare`, issue/date unknown on the source page: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte10.pdf`
- Part XI, `Sperimentare`, March 1980: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte11.pdf`
- Part XII, `Sperimentare`, June 1980: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte12.pdf`
- Part XIII, `Sperimentare`, July/August 1980, ElettroSurplus scan: `https://web.archive.org/web/20260113032804/http://www.elettrosurplus.com/files/AA2000-Sperimentare-7-8.pdf`
- Part XIII, `Sperimentare`, July/August 1980, HP64000 scan: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte13.pdf`
- Part XIV, `Sperimentare`, September 1980: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte14.pdf`
- Part XV, `Sperimentare`, October 1980: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte15.pdf`
- Part XVI, `Sperimentare`, December 1980, ElettroSurplus scan: `https://web.archive.org/web/20260113032804/http://www.elettrosurplus.com/files/AA2000-Sperimentare-12.pdf`
- Part XVI, `Sperimentare`, December 1980, HP64000 scan: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte16.pdf`
- Part XVII, `Sperimentare`, January 1981, Webalice scan: `https://web.archive.org/web/20260113032804/http://www.webalice.it/mrlncrl/sperimentare/amico2000-17-gen81.pdf`
- Part XVII, `Sperimentare`, January 1981, HP64000 scan: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte17.pdf`
- Part XVIII, `Sperimentare`, June 1981: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte18-1.pdf`
- Unnumbered or continuation article, `Sperimentare`, July/August 1982: `https://web.archive.org/web/20260113032804/http://www.hp64000.net/scansioni/Amico2000/Amico2000_Parte18-2.pdf`

Note: the source page labels Part VIII as `IIX`; this file preserves that label as source data.

### Other Magazine Articles

- `A.S.E.L. Amico 2000`, `M&P Computer 11`: `https://web.archive.org/web/20260113032804/http://www.elettrosurplus.com/files/A2000-mep-2.pdf`
- `L'Amico 2000`, `Elettronica 2000`, hosted on ComputerHistory.it: `https://web.archive.org/web/20260113032804/https://computerhistory.it/index.php?option=com_docman&task=doc_download&gid=63&Itemid=96`

## Acknowledgements Listed In The Article

- Carlo: scanned `Sperimentare` 3/79 with schematics and mounting layout, enabling the project start, and supplied other useful information.
- Davide: supplied monitor ROM codes, manually entered one by one, and provided hardware information.
- Mauro `Oracle`: supplied book scans that helped with PCB realization.
- Alberto Rubinelli: provided technical support.
- Massimo and Giuseppe: supplied documentation scans.
