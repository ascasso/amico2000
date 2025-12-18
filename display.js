/**
 * =============================================================================
 * AMICO 2000 Display Renderer
 * =============================================================================
 * 
 * Renders 6 seven-segment displays using SVG for crisp scaling.
 * Authentic red LED appearance with glow effects.
 * 
 * Author: Andrea Scasso / Claude
 * License: MIT
 * Date: December 2025
 * 
 * =============================================================================
 */

class DisplayRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.digits = [];
        this.segmentPaths = [];
        
        // Colors
        this.colorOn = '#ff2200';      // Bright red LED
        this.colorOff = '#330800';     // Dim red (LED off but visible)
        this.colorGlow = '#ff4400';    // Glow color
        
        this._createDisplay();
    }
    
    /**
     * Create the SVG display structure
     */
    _createDisplay() {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 520 100');
        svg.setAttribute('class', 'amico-display');
        
        // Add glow filter
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
        svg.appendChild(defs);
        
        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', '0');
        bg.setAttribute('y', '0');
        bg.setAttribute('width', '520');
        bg.setAttribute('height', '100');
        bg.setAttribute('fill', '#1a1a1a');
        bg.setAttribute('rx', '8');
        svg.appendChild(bg);
        
        // Create 6 digits
        // Layout: [A3][A2][A1][A0] : [D1][D0]
        // Positions: 4 address digits, gap, colon, 2 data digits
        const positions = [20, 90, 160, 230, 340, 410];
        
        for (let i = 0; i < 6; i++) {
            const digitGroup = this._createDigit(positions[i], 15);
            svg.appendChild(digitGroup);
            this.digits.push(digitGroup);
        }
        
        // Add separator dots between address and data
        const dot1 = this._createDot(305, 35);
        const dot2 = this._createDot(305, 65);
        svg.appendChild(dot1);
        svg.appendChild(dot2);
        
        // Add labels
        const labelAddr = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelAddr.setAttribute('x', '145');
        labelAddr.setAttribute('y', '95');
        labelAddr.setAttribute('fill', '#666');
        labelAddr.setAttribute('font-family', 'monospace');
        labelAddr.setAttribute('font-size', '10');
        labelAddr.setAttribute('text-anchor', 'middle');
        labelAddr.textContent = 'ADDRESS';
        svg.appendChild(labelAddr);
        
        const labelData = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelData.setAttribute('x', '375');
        labelData.setAttribute('y', '95');
        labelData.setAttribute('fill', '#666');
        labelData.setAttribute('font-family', 'monospace');
        labelData.setAttribute('font-size', '10');
        labelData.setAttribute('text-anchor', 'middle');
        labelData.textContent = 'DATA';
        svg.appendChild(labelData);
        
        this.container.appendChild(svg);
    }
    
    /**
     * Create a single 7-segment digit
     */
    _createDigit(x, y) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${x}, ${y})`);
        
        // Segment definitions (relative positions within digit)
        // Standard 7-segment layout:
        //   AAA
        //  F   B
        //   GGG
        //  E   C
        //   DDD  DP
        
        const segmentDefs = {
            a: { path: 'M 8,0 L 52,0 L 46,6 L 14,6 Z', bit: 0 },
            b: { path: 'M 54,2 L 54,32 L 48,38 L 48,8 Z', bit: 1 },
            c: { path: 'M 54,40 L 54,70 L 48,64 L 48,46 Z', bit: 2 },
            d: { path: 'M 8,72 L 52,72 L 46,66 L 14,66 Z', bit: 3 },
            e: { path: 'M 6,40 L 6,70 L 12,64 L 12,46 Z', bit: 4 },
            f: { path: 'M 6,2 L 6,32 L 12,38 L 12,8 Z', bit: 5 },
            g: { path: 'M 8,36 L 52,36 L 48,42 L 12,42 L 8,36 L 12,30 L 48,30 L 52,36 Z', bit: 6 },
            dp: { path: 'M 60,66 A 6,6 0 1,1 60,54 A 6,6 0 1,1 60,66', bit: 7 }
        };
        
        const segments = {};
        
        for (const [name, def] of Object.entries(segmentDefs)) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', def.path);
            path.setAttribute('fill', this.colorOff);
            path.setAttribute('data-bit', def.bit);
            path.classList.add('segment');
            group.appendChild(path);
            segments[name] = path;
        }
        
        group.segments = segments;
        return group;
    }
    
    /**
     * Create a separator dot
     */
    _createDot(x, y) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', this.colorOn);
        circle.setAttribute('filter', 'url(#glow)');
        return circle;
    }
    
    /**
     * Update the display with new segment patterns
     * @param {Array} patterns - Array of 6 bytes, one per digit
     */
    update(patterns) {
        for (let i = 0; i < 6 && i < patterns.length; i++) {
            this._updateDigit(i, patterns[i]);
        }
    }
    
    /**
     * Update a single digit
     */
    _updateDigit(digitIndex, pattern) {
        const digit = this.digits[digitIndex];
        if (!digit || !digit.segments) return;
        
        for (const [name, path] of Object.entries(digit.segments)) {
            const bit = parseInt(path.getAttribute('data-bit'));
            const isOn = (pattern & (1 << bit)) !== 0;
            
            path.setAttribute('fill', isOn ? this.colorOn : this.colorOff);
            
            if (isOn) {
                path.setAttribute('filter', 'url(#glow)');
            } else {
                path.removeAttribute('filter');
            }
        }
    }
    
    /**
     * Clear the display
     */
    clear() {
        this.update([0, 0, 0, 0, 0, 0]);
    }
    
    /**
     * Test pattern - all segments on
     */
    test() {
        this.update([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    }
    
    /**
     * Show a hex value (address + data format)
     * @param {number} address - 16-bit address
     * @param {number} data - 8-bit data
     */
    showHex(address, data) {
        const patterns = [
            this._hexToSegments((address >> 12) & 0xF),
            this._hexToSegments((address >> 8) & 0xF),
            this._hexToSegments((address >> 4) & 0xF),
            this._hexToSegments(address & 0xF),
            this._hexToSegments((data >> 4) & 0xF),
            this._hexToSegments(data & 0xF)
        ];
        this.update(patterns);
    }
    
    /**
     * Convert hex digit to segment pattern
     * Uses authentic ASEL AMICO 2000 ROM segment table from address $FFEA
     */
    _hexToSegments(hex) {
        // Authentic Amico 2000 segment table from ROM address $FFEA
        // These are the exact patterns the original designers intended
        // Note: Bit 7 (decimal point) is masked off as the original hardware
        // didn't use it - all digits display without decimal points
        const patterns = [
            0xBF, 0x86, 0xDB, 0xCF, 0xE6, 0xED, 0xFD, 0x87,
            0xFF, 0xEF, 0xF7, 0xFC, 0xB9, 0xDE, 0xF9, 0xF1
        ];
        return patterns[hex & 0xF] & 0x7F;  // Mask off bit 7 (DP)
    }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DisplayRenderer };
}
