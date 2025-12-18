# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added authentic cassette ROM data (prom.ic10) as optional constant in main.js for tape loading/saving functionality

### Changed
- Updated CLAUDE.md with comprehensive development guidelines including code commenting standards (focus on "why" not "what", document hardware behavior, avoid redundant comments), changelog maintenance requirements, and GitHub issue reference practices
- Replaced placeholder Monitor ROM with authentic ASEL Amico 2000 ROM data from prom.ic9 binary dump for accurate hardware emulation
- Updated seven-segment display patterns in display.js to use authentic ASEL segment table from ROM address $FFEA - ensures digits appear exactly as the original designers intended
- Documented that hardware address decoding PROMs (prom.ic6 and prom.ic7) are not needed in software emulation, as address decoding is handled by CPU memory callbacks

### Fixed
- Fixed seven-segment display to mask off decimal point bit (bit 7) - original AMICO 2000 hardware did not use decimal points
- Fixed digit multiplexing mapping in amico2000.js - hardware numbers digits right-to-left (bit 0=D0, bit 5=A3), now correctly mapped to display positions to show all 6 digits
- Fixed emulator initialization to ensure CPU starts at correct reset vector ($FE22) - browser cache issues could cause CPU to start at wrong address, preventing proper monitor ROM initialization
- Fixed keyboard matrix mapping to match actual AMICO 2000 hardware layout determined through systematic testing and schematic analysis - all keys (0-F, AD, DA, PC, REG, +, GO, RES) now map to correct row/column positions
- Fixed keyboard matrix layout to use only 3 rows (portB values 1, 3, 5) instead of 4 rows, matching the ROM's keyboard scanning routine which only scans 3 rows
- Fixed keyboard event handler in main.js to preserve case for special keys (ArrowUp, Enter, Escape) while lowercasing only single-character hex keys - this was preventing ArrowUp (AD) and ArrowDown (DA) from being recognized
- Fixed emulator to auto-start on initialization (main.js) - CPU now runs continuously like real hardware, allowing keyboard input to be processed by the monitor ROM
- Fixed keyboard scanning logic in amico2000.js to match exact port B values (1, 3, 5, 7) to specific keyboard rows instead of checking individual bits - this was causing multiple rows to scan simultaneously and preventing proper key input detection
- Fixed JavaScript file paths in index.html (changed from `js/` subdirectory to root level) to correctly load cpu6502.js, amico2000.js, display.js, and main.js - this was preventing the emulator from initializing
- Implemented partial address decoding for 8255 PIA ($FD00-$FDFF now aliases to $FD00-$FD03) to match real 6502 hardware behavior and prevent incompatibility with software that relies on common partial decoding practices

## [0.1.0] - 2025-12-13

### Added
- Initial release of AMICO 2000 emulator
- Complete 6502 CPU emulation with all 56 opcodes and 151 instruction variants
- 8255 PIA emulation for display and keyboard I/O
- SVG-based seven-segment display rendering with authentic LED appearance
- Hexadecimal keyboard support with PC keyboard mapping
- Monitor ROM support (512 bytes at $FE00-$FFFF)
- Browser-based emulation running at authentic 1MHz speed
- Debug console commands for memory inspection and CPU state monitoring