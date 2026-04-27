# Technical Specifications for AMICO 2000 Emulator Development

This document synthesizes technical findings regarding the AMICO 2000 (Sperimentare, 1980) based on ROM disassembly and hardware documentation analysis.

## 1. Hardware Architecture Overview

### CPU & Memory Map

* **CPU:** MOS Technology 6502.
* **RAM:** Base system typically features 1KB - 2KB (expandable). Page Zero is heavily utilized by the Monitor.
* **ROM:** Monitor ROM resides at the top of memory (typically `$F800`–`$FFFF`).
* **I/O Controller:** Intel 8255 PPI (Programmable Peripheral Interface) mapped at `$FD00–$FD03`.
* `$FD00`: Port A (Keyboard Column Input / Display Data)
* `$FD01`: Port B (Keyboard Row Select / Digit Select)
* `$FD02`: Port C (Control signals)
* `$FD03`: Control Register (Initialization value `0x90` for Port A Input, Port B Output).

## 2. Keyboard Matrix & Input Logic

The keyboard uses a non-standard 3x7 matrix. Identifying the correct mapping is critical for emulating user input.

### Physical Matrix Layout

The scanning routine (starting at `FF57`) selects a row via Port B and reads columns via Port A.

| Port B (Row) | Bit 0 | Bit 1 | Bit 2 | Bit 3 | Bit 4 | Bit 5 | Bit 6 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **01** (Row 0) | 6 | 7 | 8 | 9 | A | B | C |
| **03** (Row 1) | D | E | F | AD | DA | + | RUN |
| **05** (Row 2) | 0 | 1 | 2 | 3 | 4 | 5 | REG |

### ROM Key Identification Algorithm

The ROM identifies keys by combining row-skipping with bit-shifting:

1. **Row Scan:** It iterates through rows. For every row that *doesn't* contain the pressed key, it adds **7** to the accumulator (`ADC #$07`).
2. **Bit Scan:** Once the correct row is found, it performs a Right Shift (`LSR`) on the Port A value. Each shift increments the accumulator until the Carry bit is cleared (indicating the active low key).
3. **Result:** The final index (0–20) points to a translation table in ROM that converts the index to the hex value or function code.

## 3. Display Subsystem

The AMICO 2000 features a 6-digit 7-segment LED display.

* **Multiplexing:** The display is not static. The Monitor must cycle through digits rapidly to maintain the image.
* **Buffer Addresses:**
* `$F9`: Digit 1 & 2 (Leftmost)
* `$FA`: Digit 3 & 4
* `$FB`: Digit 5 & 6 (Rightmost)


* **Display Routine (`FF06`):** This is the standard refresh loop. It reads the hex values in the buffers and converts them to 7-segment patterns using a lookup table.
* **Direct Access (`FF7E`):** This entry point allows software to bypass hex conversion and output custom segments (e.g., for characters like 'L' or 'P').

## 4. Critical Monitor Entry Points

For emulation hooks or HLE (High-Level Emulation), watch these vectors:

* **`FEEB` (TESTAS):** Main keyboard scan loop. Checks if any key is currently pressed.
* **`FF57` (GETKEY):** Key identification routine. Converts physical matrix coordinates to internal key codes.
* **`FF2D`:** Likely handles the "Address" mode (AD), allowing memory navigation.
* **`FF42`:** Likely handles "Data" mode (DA), allowing memory modification.
* **`FF06`:** The display refresh driver.

## 5. Emulation Implementation Notes

1. **Interrupts:** Ensure the 6502 NMI and IRQ vectors (at `$FFFA-$FFFF`) point to the correct ROM entry points.
2. **Timing:** The display multiplexing relies on the CPU clock speed (usually 1MHz). If the emulator runs too fast without a delay in the display loop, the "refresh" may appear static or corrupted in high-level observers.
3. **Active Low Logic:** Note that the keyboard columns are pulled high; a pressed key pulls the bit to **0**. Your input handler must reflect this inverted logic.