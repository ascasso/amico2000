# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **CRITICAL FIX: Corrected keyboard matrix layout to 3 rows × 7 columns** - Analysis of the original Italian documentation revealed the ROM uses the formula `key_number = (row * 7) + column`, not a 6-column layout. This fixes keys 7 and E which are now mapped to:
  - Key 7: Row 1, Column 0 (position 7)
  - Key E: Row 2, Column 0 (position 14)
- Updated keyboard scanning to read all 7 columns (bits 0-6) instead of only 6
- Reorganized all hex key mappings (0-F) to follow the correct sequential layout based on ROM's key identification algorithm
- Function keys remapped to positions 16-20 in row 2 (requires testing to verify correct positions after matrix restructure)

### Added
- Added authentic cassette ROM data (prom.ic10) as optional constant in main.js for tape loading/saving functionality
- Added keyboard-debug.html - interactive visual grid for testing keyboard matrix positions
- Added keyboard-matrix-test.js - console-based testing helper with commands for systematically finding keys 7 and E (testKey, testUnknownPositions, findKey, etc.)

### Changed
- Updated CLAUDE.md with comprehensive development guidelines including code commenting standards (focus on "why" not "what", document hardware behavior, avoid redundant comments), changelog maintenance requirements, and GitHub issue reference practices
- Updated NEXT_SESSION.md with alternative theories for missing keys 7 and E (mode-dependent entry, shared positions with function keys, original keyboard limitations) and comprehensive testing strategies using new debugging tools
- Replaced placeholder Monitor ROM with authentic ASEL Amico 2000 ROM data from prom.ic9 binary dump for accurate hardware emulation
- Updated seven-segment display patterns in display.js to use authentic ASEL segment table from ROM address $FFEA - ensures digits appear exactly as the original designers intended
- Documented that hardware address decoding PROMs (prom.ic6 and prom.ic7) are not needed in software emulation, as address decoding is handled by CPU memory callbacks

### Fixed
- Fixed display flashing/flickering by implementing proper persistence of vision - the ROM blanks digits between multiplexing updates to prevent ghosting, but the emulator now ignores blank patterns (0x00) to maintain stable display output
- Fixed display multiplexing to correctly decode port B digit selection - bit 0 distinguishes keyboard scan mode (0) from display mode (1), and bits 1-4 encode a counter value (4-10) that maps to digit indices (0-5) after subtracting 4
- Fixed keyboard matrix layout by empirically determining ROM's expected key positions through systematic testing - Row 0: bits 0-5 = keys 6,5,4,3,2,1; Row 1: bits 0-5 = keys D,C,B,A,9,8; Row 2: bits 0,2,5 = keys 0,+,F (14/16 hex keys working; keys 7 and E positions still unknown)
- Fixed seven-segment display to mask off decimal point bit (bit 7) in PIA write handler - original AMICO 2000 hardware did not use decimal points
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