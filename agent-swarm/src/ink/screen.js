"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSC8_PREFIX = exports.StylePool = exports.HyperlinkPool = exports.CharPool = void 0;
exports.isEmptyCellAt = isEmptyCellAt;
exports.isCellEmpty = isCellEmpty;
exports.createScreen = createScreen;
exports.resetScreen = resetScreen;
exports.migrateScreenPools = migrateScreenPools;
exports.cellAt = cellAt;
exports.cellAtIndex = cellAtIndex;
exports.visibleCellAtIndex = visibleCellAtIndex;
exports.charInCellAt = charInCellAt;
exports.setCellAt = setCellAt;
exports.setCellStyleId = setCellStyleId;
exports.blitRegion = blitRegion;
exports.clearRegion = clearRegion;
exports.shiftRows = shiftRows;
exports.extractHyperlinkFromStyles = extractHyperlinkFromStyles;
exports.filterOutHyperlinkStyles = filterOutHyperlinkStyles;
exports.diff = diff;
exports.diffEach = diffEach;
exports.markNoSelectRegion = markNoSelectRegion;
var ansi_tokenize_1 = require("@alcalzone/ansi-tokenize");
var geometry_js_1 = require("./layout/geometry.js");
var ansi_js_1 = require("./termio/ansi.js");
var warn = require("./warn.js");
// --- Shared Pools (interning for memory efficiency) ---
// Character string pool shared across all screens.
// With a shared pool, interned char IDs are valid across screens,
// so blitRegion can copy IDs directly (no re-interning) and
// diffEach can compare IDs as integers (no string lookup).
var CharPool = /** @class */ (function () {
    function CharPool() {
        this.strings = [' ', '']; // Index 0 = space, 1 = empty (spacer)
        this.stringMap = new Map([
            [' ', 0],
            ['', 1],
        ]);
        this.ascii = initCharAscii(); // charCode → index, -1 = not interned
    }
    CharPool.prototype.intern = function (char) {
        // ASCII fast-path: direct array lookup instead of Map.get
        if (char.length === 1) {
            var code = char.charCodeAt(0);
            if (code < 128) {
                var cached = this.ascii[code];
                if (cached !== -1)
                    return cached;
                var index_1 = this.strings.length;
                this.strings.push(char);
                this.ascii[code] = index_1;
                return index_1;
            }
        }
        var existing = this.stringMap.get(char);
        if (existing !== undefined)
            return existing;
        var index = this.strings.length;
        this.strings.push(char);
        this.stringMap.set(char, index);
        return index;
    };
    CharPool.prototype.get = function (index) {
        var _a;
        return (_a = this.strings[index]) !== null && _a !== void 0 ? _a : ' ';
    };
    return CharPool;
}());
exports.CharPool = CharPool;
// Hyperlink string pool shared across all screens.
// Index 0 = no hyperlink.
var HyperlinkPool = /** @class */ (function () {
    function HyperlinkPool() {
        this.strings = ['']; // Index 0 = no hyperlink
        this.stringMap = new Map();
    }
    HyperlinkPool.prototype.intern = function (hyperlink) {
        if (!hyperlink)
            return 0;
        var id = this.stringMap.get(hyperlink);
        if (id === undefined) {
            id = this.strings.length;
            this.strings.push(hyperlink);
            this.stringMap.set(hyperlink, id);
        }
        return id;
    };
    HyperlinkPool.prototype.get = function (id) {
        return id === 0 ? undefined : this.strings[id];
    };
    return HyperlinkPool;
}());
exports.HyperlinkPool = HyperlinkPool;
// SGR 7 (inverse) as an AnsiCode. endCode '\x1b[27m' flags VISIBLE_ON_SPACE
// so bit 0 of the resulting styleId is set → renderer won't skip inverted
// spaces as invisible.
var INVERSE_CODE = {
    type: 'ansi',
    code: '\x1b[7m',
    endCode: '\x1b[27m',
};
// Bold (SGR 1) — stacks cleanly, no reflow in monospace. endCode 22
// also cancels dim (SGR 2); harmless here since we never add dim.
var BOLD_CODE = {
    type: 'ansi',
    code: '\x1b[1m',
    endCode: '\x1b[22m',
};
// Underline (SGR 4). Kept alongside yellow+bold — the underline is the
// unambiguous visible-on-any-theme marker. Yellow-bg-via-inverse can
// clash with existing bg colors (user-prompt style, tool chrome, syntax
// bg). If you see underline but no yellow, the yellow is being lost in
// the existing cell styling — the overlay IS finding the match.
var UNDERLINE_CODE = {
    type: 'ansi',
    code: '\x1b[4m',
    endCode: '\x1b[24m',
};
// fg→yellow (SGR 33). With inverse already in the stack, the terminal
// swaps fg↔bg at render — so yellow-fg becomes yellow-BG. Original bg
// becomes fg (readable on most themes: dark-bg → dark-text on yellow).
// endCode 39 is 'default fg' — cancels any prior fg color cleanly.
var YELLOW_FG_CODE = {
    type: 'ansi',
    code: '\x1b[33m',
    endCode: '\x1b[39m',
};
var StylePool = /** @class */ (function () {
    function StylePool() {
        this.ids = new Map();
        this.styles = [];
        this.transitionCache = new Map();
        /**
         * Intern a style that is `base + inverse`. Cached by base ID so
         * repeated calls for the same underlying style don't re-scan the
         * AnsiCode[] array. Used by the selection overlay.
         */
        this.inverseCache = new Map();
        /** Inverse + bold + yellow-bg-via-fg-swap for the CURRENT search match.
         *  OTHER matches are plain inverse — bg inherits from the theme. Current
         *  gets a distinct yellow bg (via fg-then-inverse swap) plus bold weight
         *  so it stands out in a sea of inverse. Underline was too subtle. Zero
         *  reflow risk: all pure SGR overlays, per-cell, post-layout. The yellow
         *  overrides any existing fg (syntax highlighting) on those cells — fine,
         *  the "you are here" signal IS the point, syntax color can yield. */
        this.currentMatchCache = new Map();
        /**
         * Selection overlay: REPLACE the cell's background with a solid color
         * while preserving its foreground (color, bold, italic, dim, underline).
         * Matches native terminal selection — a dedicated bg color, not SGR-7
         * inverse. Inverse swaps fg/bg per-cell, which fragments visually over
         * syntax-highlighted text (every fg color becomes a different bg stripe).
         *
         * Strips any existing bg (endCode 49m — REPLACES, so diff-added green
         * etc. don't bleed through) and any existing inverse (endCode 27m —
         * inverse on top of a solid bg would re-swap and look wrong).
         *
         * bg is set via setSelectionBg(); null → fallback to withInverse() so the
         * overlay still works before theme wiring sets a color (tests, first frame).
         * Cache is keyed by baseId only — setSelectionBg() clears it on change.
         */
        this.selectionBgCode = null;
        this.selectionBgCache = new Map();
        this.none = this.intern([]);
    }
    /**
     * Intern a style and return its ID. Bit 0 of the ID encodes whether the
     * style has a visible effect on space characters (background, inverse,
     * underline, etc.). Foreground-only styles get even IDs; styles visible
     * on spaces get odd IDs. This lets the renderer skip invisible spaces
     * with a single bitmask check on the packed word.
     */
    StylePool.prototype.intern = function (styles) {
        var key = styles.length === 0 ? '' : styles.map(function (s) { return s.code; }).join('\0');
        var id = this.ids.get(key);
        if (id === undefined) {
            var rawId = this.styles.length;
            this.styles.push(styles.length === 0 ? [] : styles);
            id =
                (rawId << 1) |
                    (styles.length > 0 && hasVisibleSpaceEffect(styles) ? 1 : 0);
            this.ids.set(key, id);
        }
        return id;
    };
    /** Recover styles from an encoded ID. Strips the bit-0 flag via >>> 1. */
    StylePool.prototype.get = function (id) {
        var _a;
        return (_a = this.styles[id >>> 1]) !== null && _a !== void 0 ? _a : [];
    };
    /**
     * Returns the pre-serialized ANSI string to transition from one style to
     * another. Cached by (fromId, toId) — zero allocations after first call
     * for a given pair.
     */
    StylePool.prototype.transition = function (fromId, toId) {
        if (fromId === toId)
            return '';
        var key = fromId * 0x100000 + toId;
        var str = this.transitionCache.get(key);
        if (str === undefined) {
            str = (0, ansi_tokenize_1.ansiCodesToString)((0, ansi_tokenize_1.diffAnsiCodes)(this.get(fromId), this.get(toId)));
            this.transitionCache.set(key, str);
        }
        return str;
    };
    StylePool.prototype.withInverse = function (baseId) {
        var id = this.inverseCache.get(baseId);
        if (id === undefined) {
            var baseCodes = this.get(baseId);
            // If already inverted, use as-is (avoids SGR 7 stacking)
            var hasInverse = baseCodes.some(function (c) { return c.endCode === '\x1b[27m'; });
            id = hasInverse ? baseId : this.intern(__spreadArray(__spreadArray([], baseCodes, true), [INVERSE_CODE], false));
            this.inverseCache.set(baseId, id);
        }
        return id;
    };
    StylePool.prototype.withCurrentMatch = function (baseId) {
        var id = this.currentMatchCache.get(baseId);
        if (id === undefined) {
            var baseCodes = this.get(baseId);
            // Filter BOTH fg + bg so yellow-via-inverse is unambiguous.
            // User-prompt cells have an explicit bg (grey box); with that bg
            // still set, inverse swaps yellow-fg↔grey-bg → grey-on-yellow on
            // SOME terminals, yellow-on-grey on others (inverse semantics vary
            // when both colors are explicit). Filtering both gives clean
            // yellow-bg + terminal-default-fg everywhere. Bold/dim/italic
            // coexist — keep those.
            var codes = baseCodes.filter(function (c) { return c.endCode !== '\x1b[39m' && c.endCode !== '\x1b[49m'; });
            // fg-yellow FIRST so inverse swaps it to bg. Bold after inverse is
            // fine — SGR 1 is fg-attribute-only, order-independent vs 7.
            codes.push(YELLOW_FG_CODE);
            if (!baseCodes.some(function (c) { return c.endCode === '\x1b[27m'; }))
                codes.push(INVERSE_CODE);
            if (!baseCodes.some(function (c) { return c.endCode === '\x1b[22m'; }))
                codes.push(BOLD_CODE);
            // Underline as the unambiguous marker — yellow-bg can clash with
            // existing bg styling (user-prompt bg, syntax bg). If you see
            // underline but no yellow on a match, the overlay IS finding it;
            // the yellow is just losing a styling fight.
            if (!baseCodes.some(function (c) { return c.endCode === '\x1b[24m'; }))
                codes.push(UNDERLINE_CODE);
            id = this.intern(codes);
            this.currentMatchCache.set(baseId, id);
        }
        return id;
    };
    StylePool.prototype.setSelectionBg = function (bg) {
        var _a;
        if (((_a = this.selectionBgCode) === null || _a === void 0 ? void 0 : _a.code) === (bg === null || bg === void 0 ? void 0 : bg.code))
            return;
        this.selectionBgCode = bg;
        this.selectionBgCache.clear();
    };
    StylePool.prototype.withSelectionBg = function (baseId) {
        var bg = this.selectionBgCode;
        if (bg === null)
            return this.withInverse(baseId);
        var id = this.selectionBgCache.get(baseId);
        if (id === undefined) {
            // Keep everything except bg (49m) and inverse (27m). Fg, bold, dim,
            // italic, underline, strikethrough all preserved.
            var kept = this.get(baseId).filter(function (c) { return c.endCode !== '\x1b[49m' && c.endCode !== '\x1b[27m'; });
            kept.push(bg);
            id = this.intern(kept);
            this.selectionBgCache.set(baseId, id);
        }
        return id;
    };
    return StylePool;
}());
exports.StylePool = StylePool;
// endCodes that produce visible effects on space characters
var VISIBLE_ON_SPACE = new Set([
    '\x1b[49m', // background color
    '\x1b[27m', // inverse
    '\x1b[24m', // underline
    '\x1b[29m', // strikethrough
    '\x1b[55m', // overline
]);
function hasVisibleSpaceEffect(styles) {
    for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
        var style = styles_1[_i];
        if (VISIBLE_ON_SPACE.has(style.endCode))
            return true;
    }
    return false;
}
// Constants for empty/spacer cells to enable fast comparisons
// These are indices into the charStrings table, not codepoints
var EMPTY_CHAR_INDEX = 0; // ' ' (space)
var SPACER_CHAR_INDEX = 1; // '' (empty string for spacer cells)
// Unwritten cells are [EMPTY_CHAR_INDEX=0, packWord1(emptyStyleId=0,0,0)=0].
// Since StylePool.none is always 0 (first intern), unwritten cells are
// indistinguishable from explicitly-cleared cells in the packed array.
// This is intentional: diffEach can compare raw ints with zero normalization.
// isEmptyCellByIndex checks if both words are 0 to identify "never visually written" cells.
function initCharAscii() {
    var table = new Int32Array(128);
    table.fill(-1);
    table[32] = EMPTY_CHAR_INDEX; // ' ' (space)
    return table;
}
// --- Packed cell layout ---
// Each cell is 2 consecutive Int32 elements in the cells array:
//   word0 (cells[ci]):     charId (full 32 bits)
//   word1 (cells[ci + 1]): styleId[31:17] | hyperlinkId[16:2] | width[1:0]
var STYLE_SHIFT = 17;
var HYPERLINK_SHIFT = 2;
var HYPERLINK_MASK = 0x7fff; // 15 bits
var WIDTH_MASK = 3; // 2 bits
// Pack styleId, hyperlinkId, and width into a single Int32
function packWord1(styleId, hyperlinkId, width) {
    return (styleId << STYLE_SHIFT) | (hyperlinkId << HYPERLINK_SHIFT) | width;
}
// Unwritten cell as BigInt64 — both words are 0, so the 64-bit value is 0n.
// Used by BigInt64Array.fill() for bulk clears (resetScreen, clearRegion).
// Not used for comparison — BigInt element reads cause heap allocation.
var EMPTY_CELL_VALUE = 0n;
function isEmptyCellByIndex(screen, index) {
    // An empty/unwritten cell has both words === 0:
    // word0 = EMPTY_CHAR_INDEX (0), word1 = packWord1(emptyStyleId=0, 0, 0) = 0.
    var ci = index << 1;
    return screen.cells[ci] === 0 && screen.cells[ci | 1] === 0;
}
function isEmptyCellAt(screen, x, y) {
    if (x < 0 || y < 0 || x >= screen.width || y >= screen.height)
        return true;
    return isEmptyCellByIndex(screen, y * screen.width + x);
}
/**
 * Check if a Cell (view object) represents an empty cell.
 */
function isCellEmpty(screen, cell) {
    // Check if cell looks like an empty cell (space, empty style, narrow, no link).
    // Note: After cellAt mapping, unwritten cells have emptyStyleId, so this
    // returns true for both unwritten AND cleared cells. Use isEmptyCellAt
    // for the internal distinction.
    return (cell.char === ' ' &&
        cell.styleId === screen.emptyStyleId &&
        cell.width === 0 /* CellWidth.Narrow */ &&
        !cell.hyperlink);
}
// Intern a hyperlink string and return its ID (0 = no hyperlink)
function internHyperlink(screen, hyperlink) {
    return screen.hyperlinkPool.intern(hyperlink);
}
// ---
function createScreen(width, height, styles, charPool, hyperlinkPool) {
    // Warn if dimensions are not valid integers (likely bad yoga layout output)
    warn.ifNotInteger(width, 'createScreen width');
    warn.ifNotInteger(height, 'createScreen height');
    // Ensure width and height are valid integers to prevent crashes
    if (!Number.isInteger(width) || width < 0) {
        width = Math.max(0, Math.floor(width) || 0);
    }
    if (!Number.isInteger(height) || height < 0) {
        height = Math.max(0, Math.floor(height) || 0);
    }
    var size = width * height;
    // Allocate one buffer, two views: Int32Array for per-word access,
    // BigInt64Array for bulk fill in resetScreen/clearRegion.
    // ArrayBuffer is zero-filled, which is exactly the empty cell value:
    // [EMPTY_CHAR_INDEX=0, packWord1(emptyStyleId=0,0,0)=0].
    var buf = new ArrayBuffer(size << 3); // 8 bytes per cell
    var cells = new Int32Array(buf);
    var cells64 = new BigInt64Array(buf);
    return {
        width: width,
        height: height,
        cells: cells,
        cells64: cells64,
        charPool: charPool,
        hyperlinkPool: hyperlinkPool,
        emptyStyleId: styles.none,
        damage: undefined,
        noSelect: new Uint8Array(size),
        softWrap: new Int32Array(height),
    };
}
/**
 * Reset an existing screen for reuse, avoiding allocation of new typed arrays.
 * Resizes if needed and clears all cells to empty/unwritten state.
 *
 * For double-buffering, this allows swapping between front and back buffers
 * without allocating new Screen objects each frame.
 */
function resetScreen(screen, width, height) {
    // Warn if dimensions are not valid integers
    warn.ifNotInteger(width, 'resetScreen width');
    warn.ifNotInteger(height, 'resetScreen height');
    // Ensure width and height are valid integers to prevent crashes
    if (!Number.isInteger(width) || width < 0) {
        width = Math.max(0, Math.floor(width) || 0);
    }
    if (!Number.isInteger(height) || height < 0) {
        height = Math.max(0, Math.floor(height) || 0);
    }
    var size = width * height;
    // Resize if needed (only grow, to avoid reallocations)
    if (screen.cells64.length < size) {
        var buf = new ArrayBuffer(size << 3);
        screen.cells = new Int32Array(buf);
        screen.cells64 = new BigInt64Array(buf);
        screen.noSelect = new Uint8Array(size);
    }
    if (screen.softWrap.length < height) {
        screen.softWrap = new Int32Array(height);
    }
    // Reset all cells — single fill call, no loop
    screen.cells64.fill(EMPTY_CELL_VALUE, 0, size);
    screen.noSelect.fill(0, 0, size);
    screen.softWrap.fill(0, 0, height);
    // Update dimensions
    screen.width = width;
    screen.height = height;
    // Shared pools accumulate — no clearing needed. Unique char/hyperlink sets are bounded.
    // Clear damage tracking
    screen.damage = undefined;
}
/**
 * Re-intern a screen's char and hyperlink IDs into new pools.
 * Used for generational pool reset — after migrating, the screen's
 * typed arrays contain valid IDs for the new pools, and the old pools
 * can be GC'd.
 *
 * O(width * height) but only called occasionally (e.g., between conversation turns).
 */
function migrateScreenPools(screen, charPool, hyperlinkPool) {
    var oldCharPool = screen.charPool;
    var oldHyperlinkPool = screen.hyperlinkPool;
    if (oldCharPool === charPool && oldHyperlinkPool === hyperlinkPool)
        return;
    var size = screen.width * screen.height;
    var cells = screen.cells;
    // Re-intern chars and hyperlinks in a single pass, stride by 2
    for (var ci = 0; ci < size << 1; ci += 2) {
        // Re-intern charId (word0)
        var oldCharId = cells[ci];
        cells[ci] = charPool.intern(oldCharPool.get(oldCharId));
        // Re-intern hyperlinkId (packed in word1)
        var word1 = cells[ci + 1];
        var oldHyperlinkId = (word1 >>> HYPERLINK_SHIFT) & HYPERLINK_MASK;
        if (oldHyperlinkId !== 0) {
            var oldStr = oldHyperlinkPool.get(oldHyperlinkId);
            var newHyperlinkId = hyperlinkPool.intern(oldStr);
            // Repack word1 with new hyperlinkId, preserving styleId and width
            var styleId = word1 >>> STYLE_SHIFT;
            var width = word1 & WIDTH_MASK;
            cells[ci + 1] = packWord1(styleId, newHyperlinkId, width);
        }
    }
    screen.charPool = charPool;
    screen.hyperlinkPool = hyperlinkPool;
}
/**
 * Get a Cell view at the given position. Returns a new object each call -
 * this is intentional as cells are stored packed, not as objects.
 */
function cellAt(screen, x, y) {
    if (x < 0 || y < 0 || x >= screen.width || y >= screen.height)
        return undefined;
    return cellAtIndex(screen, y * screen.width + x);
}
/**
 * Get a Cell view by pre-computed array index. Skips bounds checks and
 * index computation — caller must ensure index is valid.
 */
function cellAtIndex(screen, index) {
    var ci = index << 1;
    var word1 = screen.cells[ci + 1];
    var hid = (word1 >>> HYPERLINK_SHIFT) & HYPERLINK_MASK;
    return {
        // Unwritten cells have charIndex=0 (EMPTY_CHAR_INDEX); charPool.get(0) returns ' '
        char: screen.charPool.get(screen.cells[ci]),
        styleId: word1 >>> STYLE_SHIFT,
        width: word1 & WIDTH_MASK,
        hyperlink: hid === 0 ? undefined : screen.hyperlinkPool.get(hid),
    };
}
/**
 * Get a Cell at the given index, or undefined if it has no visible content.
 * Returns undefined for spacer cells (charId 1), empty unstyled spaces, and
 * fg-only styled spaces that match lastRenderedStyleId (cursor-forward
 * produces an identical visual result, avoiding a Cell allocation).
 *
 * @param lastRenderedStyleId - styleId of the last rendered cell on this
 *   line, or -1 if none yet.
 */
function visibleCellAtIndex(cells, charPool, hyperlinkPool, index, lastRenderedStyleId) {
    var ci = index << 1;
    var charId = cells[ci];
    if (charId === 1)
        return undefined; // spacer
    var word1 = cells[ci + 1];
    // For spaces: 0x3fffc masks bits 2-17 (hyperlinkId + styleId visibility
    // bit). If zero, the space has no hyperlink and at most a fg-only style.
    // Then word1 >>> STYLE_SHIFT is the foreground style — skip if it's zero
    // (truly invisible) or matches the last rendered style on this line.
    if (charId === 0 && (word1 & 0x3fffc) === 0) {
        var fgStyle = word1 >>> STYLE_SHIFT;
        if (fgStyle === 0 || fgStyle === lastRenderedStyleId)
            return undefined;
    }
    var hid = (word1 >>> HYPERLINK_SHIFT) & HYPERLINK_MASK;
    return {
        char: charPool.get(charId),
        styleId: word1 >>> STYLE_SHIFT,
        width: word1 & WIDTH_MASK,
        hyperlink: hid === 0 ? undefined : hyperlinkPool.get(hid),
    };
}
/**
 * Write cell data into an existing Cell object to avoid allocation.
 * Caller must ensure index is valid.
 */
function cellAtCI(screen, ci, out) {
    var w1 = ci | 1;
    var word1 = screen.cells[w1];
    out.char = screen.charPool.get(screen.cells[ci]);
    out.styleId = word1 >>> STYLE_SHIFT;
    out.width = word1 & WIDTH_MASK;
    var hid = (word1 >>> HYPERLINK_SHIFT) & HYPERLINK_MASK;
    out.hyperlink = hid === 0 ? undefined : screen.hyperlinkPool.get(hid);
}
function charInCellAt(screen, x, y) {
    if (x < 0 || y < 0 || x >= screen.width || y >= screen.height)
        return undefined;
    var ci = (y * screen.width + x) << 1;
    return screen.charPool.get(screen.cells[ci]);
}
/**
 * Set a cell, optionally creating a spacer for wide characters.
 *
 * Wide characters (CJK, emoji) occupy 2 cells in the buffer:
 * 1. First cell: Contains the actual character with width = Wide
 * 2. Second cell: Spacer cell with width = SpacerTail (empty, not rendered)
 *
 * If the cell has width = Wide, this function automatically creates the
 * corresponding SpacerTail in the next column. This two-cell model keeps
 * the buffer aligned to visual columns, making cursor positioning
 * straightforward.
 *
 * TODO: When soft-wrapping is implemented, SpacerHead cells will be explicitly
 * placed by the wrapping logic at line-end positions where wide characters
 * wrap to the next line. This function doesn't need to handle SpacerHead
 * automatically - it will be set directly by the wrapping code.
 */
function setCellAt(screen, x, y, cell) {
    if (x < 0 || y < 0 || x >= screen.width || y >= screen.height)
        return;
    var ci = (y * screen.width + x) << 1;
    var cells = screen.cells;
    // When a Wide char is overwritten by a Narrow char, its SpacerTail remains
    // as a ghost cell that the diff/render pipeline skips, causing stale content
    // to leak through from previous frames.
    var prevWidth = cells[ci + 1] & WIDTH_MASK;
    if (prevWidth === 1 /* CellWidth.Wide */ && cell.width !== 1 /* CellWidth.Wide */) {
        var spacerX = x + 1;
        if (spacerX < screen.width) {
            var spacerCI = ci + 2;
            if ((cells[spacerCI + 1] & WIDTH_MASK) === 2 /* CellWidth.SpacerTail */) {
                cells[spacerCI] = EMPTY_CHAR_INDEX;
                cells[spacerCI + 1] = packWord1(screen.emptyStyleId, 0, 0 /* CellWidth.Narrow */);
            }
        }
    }
    // Track cleared Wide position for damage expansion below
    var clearedWideX = -1;
    if (prevWidth === 2 /* CellWidth.SpacerTail */ &&
        cell.width !== 2 /* CellWidth.SpacerTail */) {
        // Overwriting a SpacerTail: clear the orphaned Wide char at (x-1).
        // Keeping the wide character with Narrow width would cause the terminal
        // to still render it with width 2, desyncing the cursor model.
        if (x > 0) {
            var wideCI = ci - 2;
            if ((cells[wideCI + 1] & WIDTH_MASK) === 1 /* CellWidth.Wide */) {
                cells[wideCI] = EMPTY_CHAR_INDEX;
                cells[wideCI + 1] = packWord1(screen.emptyStyleId, 0, 0 /* CellWidth.Narrow */);
                clearedWideX = x - 1;
            }
        }
    }
    // Pack cell data into cells array
    cells[ci] = internCharString(screen, cell.char);
    cells[ci + 1] = packWord1(cell.styleId, internHyperlink(screen, cell.hyperlink), cell.width);
    // Track damage - expand bounds in place instead of allocating new objects
    // Include the main cell position and any cleared orphan cells
    var minX = clearedWideX >= 0 ? Math.min(x, clearedWideX) : x;
    var damage = screen.damage;
    if (damage) {
        var right = damage.x + damage.width;
        var bottom = damage.y + damage.height;
        if (minX < damage.x) {
            damage.width += damage.x - minX;
            damage.x = minX;
        }
        else if (x >= right) {
            damage.width = x - damage.x + 1;
        }
        if (y < damage.y) {
            damage.height += damage.y - y;
            damage.y = y;
        }
        else if (y >= bottom) {
            damage.height = y - damage.y + 1;
        }
    }
    else {
        screen.damage = { x: minX, y: y, width: x - minX + 1, height: 1 };
    }
    // If this is a wide character, create a spacer in the next column
    if (cell.width === 1 /* CellWidth.Wide */) {
        var spacerX = x + 1;
        if (spacerX < screen.width) {
            var spacerCI = ci + 2;
            // If the cell we're overwriting with our SpacerTail is itself Wide,
            // clear ITS SpacerTail at x+2 too. Otherwise the orphan SpacerTail
            // makes diffEach report it as `added` and log-update's skip-spacer
            // rule prevents clearing whatever prev content was at that column.
            // Scenario: [a, 💻, spacer] → [本, spacer, ORPHAN spacer] when
            // yoga squishes a💻 to height 0 and 本 renders at the same y.
            if ((cells[spacerCI + 1] & WIDTH_MASK) === 1 /* CellWidth.Wide */) {
                var orphanCI = spacerCI + 2;
                if (spacerX + 1 < screen.width &&
                    (cells[orphanCI + 1] & WIDTH_MASK) === 2 /* CellWidth.SpacerTail */) {
                    cells[orphanCI] = EMPTY_CHAR_INDEX;
                    cells[orphanCI + 1] = packWord1(screen.emptyStyleId, 0, 0 /* CellWidth.Narrow */);
                }
            }
            cells[spacerCI] = SPACER_CHAR_INDEX;
            cells[spacerCI + 1] = packWord1(screen.emptyStyleId, 0, 2 /* CellWidth.SpacerTail */);
            // Expand damage to include SpacerTail so diff() scans it
            var d = screen.damage;
            if (d && spacerX >= d.x + d.width) {
                d.width = spacerX - d.x + 1;
            }
        }
    }
}
/**
 * Replace the styleId of a cell in-place without disturbing char, width,
 * or hyperlink. Preserves empty cells as-is (char stays ' '). Tracks damage
 * for the cell so diffEach picks up the change.
 */
function setCellStyleId(screen, x, y, styleId) {
    if (x < 0 || y < 0 || x >= screen.width || y >= screen.height)
        return;
    var ci = (y * screen.width + x) << 1;
    var cells = screen.cells;
    var word1 = cells[ci + 1];
    var width = word1 & WIDTH_MASK;
    // Skip spacer cells — inverse on the head cell visually covers both columns
    if (width === 2 /* CellWidth.SpacerTail */ || width === 3 /* CellWidth.SpacerHead */)
        return;
    var hid = (word1 >>> HYPERLINK_SHIFT) & HYPERLINK_MASK;
    cells[ci + 1] = packWord1(styleId, hid, width);
    // Expand damage so diffEach scans this cell
    var d = screen.damage;
    if (d) {
        screen.damage = (0, geometry_js_1.unionRect)(d, { x: x, y: y, width: 1, height: 1 });
    }
    else {
        screen.damage = { x: x, y: y, width: 1, height: 1 };
    }
}
/**
 * Intern a character string via the screen's shared CharPool.
 * Supports grapheme clusters like family emoji.
 */
function internCharString(screen, char) {
    return screen.charPool.intern(char);
}
/**
 * Bulk-copy a rectangular region from src to dst using TypedArray.set().
 * Single cells.set() call per row (or one call for contiguous blocks).
 * Damage is computed once for the whole region.
 *
 * Clamps negative regionX/regionY to 0 (matching clearRegion) — absolute-
 * positioned overlays in tiny terminals can compute negative screen coords.
 * maxX/maxY should already be clamped to both screen bounds by the caller.
 */
function blitRegion(dst, src, regionX, regionY, maxX, maxY) {
    regionX = Math.max(0, regionX);
    regionY = Math.max(0, regionY);
    if (regionX >= maxX || regionY >= maxY)
        return;
    var rowLen = maxX - regionX;
    var srcStride = src.width << 1;
    var dstStride = dst.width << 1;
    var rowBytes = rowLen << 1; // 2 Int32s per cell
    var srcCells = src.cells;
    var dstCells = dst.cells;
    var srcNoSel = src.noSelect;
    var dstNoSel = dst.noSelect;
    // softWrap is per-row — copy the row range regardless of stride/width.
    // Partial-width blits still carry the row's wrap provenance since the
    // blitted content (a cached ink-text node) is what set the bit.
    dst.softWrap.set(src.softWrap.subarray(regionY, maxY), regionY);
    // Fast path: contiguous memory when copying full-width rows at same stride
    if (regionX === 0 && maxX === src.width && src.width === dst.width) {
        var srcStart = regionY * srcStride;
        var totalBytes = (maxY - regionY) * srcStride;
        dstCells.set(srcCells.subarray(srcStart, srcStart + totalBytes), srcStart);
        // noSelect is 1 byte/cell vs cells' 8 — same region, different scale
        var nsStart = regionY * src.width;
        var nsLen = (maxY - regionY) * src.width;
        dstNoSel.set(srcNoSel.subarray(nsStart, nsStart + nsLen), nsStart);
    }
    else {
        // Per-row copy for partial-width or mismatched-stride regions
        var srcRowCI = regionY * srcStride + (regionX << 1);
        var dstRowCI = regionY * dstStride + (regionX << 1);
        var srcRowNS = regionY * src.width + regionX;
        var dstRowNS = regionY * dst.width + regionX;
        for (var y = regionY; y < maxY; y++) {
            dstCells.set(srcCells.subarray(srcRowCI, srcRowCI + rowBytes), dstRowCI);
            dstNoSel.set(srcNoSel.subarray(srcRowNS, srcRowNS + rowLen), dstRowNS);
            srcRowCI += srcStride;
            dstRowCI += dstStride;
            srcRowNS += src.width;
            dstRowNS += dst.width;
        }
    }
    // Compute damage once for the whole region
    var regionRect = {
        x: regionX,
        y: regionY,
        width: rowLen,
        height: maxY - regionY,
    };
    if (dst.damage) {
        dst.damage = (0, geometry_js_1.unionRect)(dst.damage, regionRect);
    }
    else {
        dst.damage = regionRect;
    }
    // Handle wide char at right edge: spacer might be outside blit region
    // but still within dst bounds. Per-row check only at the boundary column.
    if (maxX < dst.width) {
        var srcLastCI = (regionY * src.width + (maxX - 1)) << 1;
        var dstSpacerCI = (regionY * dst.width + maxX) << 1;
        var wroteSpacerOutsideRegion = false;
        for (var y = regionY; y < maxY; y++) {
            if ((srcCells[srcLastCI + 1] & WIDTH_MASK) === 1 /* CellWidth.Wide */) {
                dstCells[dstSpacerCI] = SPACER_CHAR_INDEX;
                dstCells[dstSpacerCI + 1] = packWord1(dst.emptyStyleId, 0, 2 /* CellWidth.SpacerTail */);
                wroteSpacerOutsideRegion = true;
            }
            srcLastCI += srcStride;
            dstSpacerCI += dstStride;
        }
        // Expand damage to include SpacerTail column if we wrote any
        if (wroteSpacerOutsideRegion && dst.damage) {
            var rightEdge = dst.damage.x + dst.damage.width;
            if (rightEdge === maxX) {
                dst.damage = __assign(__assign({}, dst.damage), { width: dst.damage.width + 1 });
            }
        }
    }
}
/**
 * Bulk-clear a rectangular region of the screen.
 * Uses BigInt64Array.fill() for fast row clears.
 * Handles wide character boundary cleanup at region edges.
 */
function clearRegion(screen, regionX, regionY, regionWidth, regionHeight) {
    var startX = Math.max(0, regionX);
    var startY = Math.max(0, regionY);
    var maxX = Math.min(regionX + regionWidth, screen.width);
    var maxY = Math.min(regionY + regionHeight, screen.height);
    if (startX >= maxX || startY >= maxY)
        return;
    var cells = screen.cells;
    var cells64 = screen.cells64;
    var screenWidth = screen.width;
    var rowBase = startY * screenWidth;
    var damageMinX = startX;
    var damageMaxX = maxX;
    // EMPTY_CELL_VALUE (0n) matches the zero-initialized state:
    // word0=EMPTY_CHAR_INDEX(0), word1=packWord1(0,0,0)=0
    if (startX === 0 && maxX === screenWidth) {
        // Full-width: single fill, no boundary checks needed
        cells64.fill(EMPTY_CELL_VALUE, rowBase, rowBase + (maxY - startY) * screenWidth);
    }
    else {
        // Partial-width: single loop handles boundary cleanup and fill per row.
        var stride = screenWidth << 1; // 2 Int32s per cell
        var rowLen = maxX - startX;
        var checkLeft = startX > 0;
        var checkRight = maxX < screenWidth;
        var leftEdge = (rowBase + startX) << 1;
        var rightEdge = (rowBase + maxX - 1) << 1;
        var fillStart = rowBase + startX;
        for (var y = startY; y < maxY; y++) {
            // Left boundary: if cell at startX is a SpacerTail, the Wide char
            // at startX-1 (outside the region) will be orphaned. Clear it.
            if (checkLeft) {
                // leftEdge points to word0 of cell at startX; +1 is its word1
                if ((cells[leftEdge + 1] & WIDTH_MASK) === 2 /* CellWidth.SpacerTail */) {
                    // word1 of cell at startX-1 is leftEdge-1; word0 is leftEdge-2
                    var prevW1 = leftEdge - 1;
                    if ((cells[prevW1] & WIDTH_MASK) === 1 /* CellWidth.Wide */) {
                        cells[prevW1 - 1] = EMPTY_CHAR_INDEX;
                        cells[prevW1] = packWord1(screen.emptyStyleId, 0, 0 /* CellWidth.Narrow */);
                        damageMinX = startX - 1;
                    }
                }
            }
            // Right boundary: if cell at maxX-1 is Wide, its SpacerTail at maxX
            // (outside the region) will be orphaned. Clear it.
            if (checkRight) {
                // rightEdge points to word0 of cell at maxX-1; +1 is its word1
                if ((cells[rightEdge + 1] & WIDTH_MASK) === 1 /* CellWidth.Wide */) {
                    // word1 of cell at maxX is rightEdge+3 (+2 to next word0, +1 to word1)
                    var nextW1 = rightEdge + 3;
                    if ((cells[nextW1] & WIDTH_MASK) === 2 /* CellWidth.SpacerTail */) {
                        cells[nextW1 - 1] = EMPTY_CHAR_INDEX;
                        cells[nextW1] = packWord1(screen.emptyStyleId, 0, 0 /* CellWidth.Narrow */);
                        damageMaxX = maxX + 1;
                    }
                }
            }
            cells64.fill(EMPTY_CELL_VALUE, fillStart, fillStart + rowLen);
            leftEdge += stride;
            rightEdge += stride;
            fillStart += screenWidth;
        }
    }
    // Update damage once for the whole region
    var regionRect = {
        x: damageMinX,
        y: startY,
        width: damageMaxX - damageMinX,
        height: maxY - startY,
    };
    if (screen.damage) {
        screen.damage = (0, geometry_js_1.unionRect)(screen.damage, regionRect);
    }
    else {
        screen.damage = regionRect;
    }
}
/**
 * Shift full-width rows within [top, bottom] (inclusive, 0-indexed) by n.
 * n > 0 shifts UP (simulating CSI n S); n < 0 shifts DOWN (CSI n T).
 * Vacated rows are cleared. Does NOT update damage. Both cells and the
 * noSelect bitmap are shifted so text-selection markers stay aligned when
 * this is applied to next.screen during scroll fast path.
 */
function shiftRows(screen, top, bottom, n) {
    if (n === 0 || top < 0 || bottom >= screen.height || top > bottom)
        return;
    var w = screen.width;
    var cells64 = screen.cells64;
    var noSel = screen.noSelect;
    var sw = screen.softWrap;
    var absN = Math.abs(n);
    if (absN > bottom - top) {
        cells64.fill(EMPTY_CELL_VALUE, top * w, (bottom + 1) * w);
        noSel.fill(0, top * w, (bottom + 1) * w);
        sw.fill(0, top, bottom + 1);
        return;
    }
    if (n > 0) {
        // SU: row top+n..bottom → top..bottom-n; clear bottom-n+1..bottom
        cells64.copyWithin(top * w, (top + n) * w, (bottom + 1) * w);
        noSel.copyWithin(top * w, (top + n) * w, (bottom + 1) * w);
        sw.copyWithin(top, top + n, bottom + 1);
        cells64.fill(EMPTY_CELL_VALUE, (bottom - n + 1) * w, (bottom + 1) * w);
        noSel.fill(0, (bottom - n + 1) * w, (bottom + 1) * w);
        sw.fill(0, bottom - n + 1, bottom + 1);
    }
    else {
        // SD: row top..bottom+n → top-n..bottom; clear top..top-n-1
        cells64.copyWithin((top - n) * w, top * w, (bottom + n + 1) * w);
        noSel.copyWithin((top - n) * w, top * w, (bottom + n + 1) * w);
        sw.copyWithin(top - n, top, bottom + n + 1);
        cells64.fill(EMPTY_CELL_VALUE, top * w, (top - n) * w);
        noSel.fill(0, top * w, (top - n) * w);
        sw.fill(0, top, top - n);
    }
}
// Matches OSC 8 ; ; URI BEL
var OSC8_REGEX = new RegExp("^".concat(ansi_js_1.ESC, "\\]8").concat(ansi_js_1.SEP).concat(ansi_js_1.SEP, "([^").concat(ansi_js_1.BEL, "]*)").concat(ansi_js_1.BEL, "$"));
// OSC8 prefix: ESC ] 8 ; — cheap check to skip regex for the vast majority of styles (SGR = ESC [)
exports.OSC8_PREFIX = "".concat(ansi_js_1.ESC, "]8").concat(ansi_js_1.SEP);
function extractHyperlinkFromStyles(styles) {
    for (var _i = 0, styles_2 = styles; _i < styles_2.length; _i++) {
        var style = styles_2[_i];
        var code = style.code;
        if (code.length < 5 || !code.startsWith(exports.OSC8_PREFIX))
            continue;
        var match = code.match(OSC8_REGEX);
        if (match) {
            return match[1] || null;
        }
    }
    return null;
}
function filterOutHyperlinkStyles(styles) {
    return styles.filter(function (style) {
        return !style.code.startsWith(exports.OSC8_PREFIX) || !OSC8_REGEX.test(style.code);
    });
}
// ---
/**
 * Returns an array of all changes between two screens. Used by tests.
 * Production code should use diffEach() to avoid allocations.
 */
function diff(prev, next) {
    var output = [];
    diffEach(prev, next, function (x, y, removed, added) {
        // Copy cells since diffEach reuses the objects
        output.push([
            { x: x, y: y },
            removed ? __assign({}, removed) : undefined,
            added ? __assign({}, added) : undefined,
        ]);
    });
    return output;
}
/**
 * Like diff(), but calls a callback for each change instead of building an array.
 * Reuses two Cell objects to avoid per-change allocations. The callback must not
 * retain references to the Cell objects — their contents are overwritten each call.
 *
 * Returns true if the callback ever returned true (early exit signal).
 */
function diffEach(prev, next, cb) {
    var prevWidth = prev.width;
    var nextWidth = next.width;
    var prevHeight = prev.height;
    var nextHeight = next.height;
    var region;
    if (prevWidth === 0 && prevHeight === 0) {
        region = { x: 0, y: 0, width: nextWidth, height: nextHeight };
    }
    else if (next.damage) {
        region = next.damage;
        if (prev.damage) {
            region = (0, geometry_js_1.unionRect)(region, prev.damage);
        }
    }
    else if (prev.damage) {
        region = prev.damage;
    }
    else {
        region = { x: 0, y: 0, width: 0, height: 0 };
    }
    if (prevHeight > nextHeight) {
        region = (0, geometry_js_1.unionRect)(region, {
            x: 0,
            y: nextHeight,
            width: prevWidth,
            height: prevHeight - nextHeight,
        });
    }
    if (prevWidth > nextWidth) {
        region = (0, geometry_js_1.unionRect)(region, {
            x: nextWidth,
            y: 0,
            width: prevWidth - nextWidth,
            height: prevHeight,
        });
    }
    var maxHeight = Math.max(prevHeight, nextHeight);
    var maxWidth = Math.max(prevWidth, nextWidth);
    var endY = Math.min(region.y + region.height, maxHeight);
    var endX = Math.min(region.x + region.width, maxWidth);
    if (prevWidth === nextWidth) {
        return diffSameWidth(prev, next, region.x, endX, region.y, endY, cb);
    }
    return diffDifferentWidth(prev, next, region.x, endX, region.y, endY, cb);
}
/**
 * Scan for the next cell that differs between two Int32Arrays.
 * Returns the number of matching cells before the first difference,
 * or `count` if all cells match. Tiny and pure for JIT inlining.
 */
function findNextDiff(a, b, w0, count) {
    for (var i = 0; i < count; i++, w0 += 2) {
        var w1 = w0 | 1;
        if (a[w0] !== b[w0] || a[w1] !== b[w1])
            return i;
    }
    return count;
}
/**
 * Diff one row where both screens are in bounds.
 * Scans for differences with findNextDiff, unpacks and calls cb for each.
 */
function diffRowBoth(prevCells, nextCells, prev, next, ci, y, startX, endX, prevCell, nextCell, cb) {
    var x = startX;
    while (x < endX) {
        var skip = findNextDiff(prevCells, nextCells, ci, endX - x);
        x += skip;
        ci += skip << 1;
        if (x >= endX)
            break;
        cellAtCI(prev, ci, prevCell);
        cellAtCI(next, ci, nextCell);
        if (cb(x, y, prevCell, nextCell))
            return true;
        x++;
        ci += 2;
    }
    return false;
}
/**
 * Emit removals for a row that only exists in prev (height shrank).
 * Cannot skip empty cells — the terminal still has content from the
 * previous frame that needs to be cleared.
 */
function diffRowRemoved(prev, ci, y, startX, endX, prevCell, cb) {
    for (var x = startX; x < endX; x++, ci += 2) {
        cellAtCI(prev, ci, prevCell);
        if (cb(x, y, prevCell, undefined))
            return true;
    }
    return false;
}
/**
 * Emit additions for a row that only exists in next (height grew).
 * Skips empty/unwritten cells.
 */
function diffRowAdded(nextCells, next, ci, y, startX, endX, nextCell, cb) {
    for (var x = startX; x < endX; x++, ci += 2) {
        if (nextCells[ci] === 0 && nextCells[ci | 1] === 0)
            continue;
        cellAtCI(next, ci, nextCell);
        if (cb(x, y, undefined, nextCell))
            return true;
    }
    return false;
}
/**
 * Diff two screens with identical width.
 * Dispatches each row to a small, JIT-friendly function.
 */
function diffSameWidth(prev, next, startX, endX, startY, endY, cb) {
    var prevCells = prev.cells;
    var nextCells = next.cells;
    var width = prev.width;
    var prevHeight = prev.height;
    var nextHeight = next.height;
    var stride = width << 1;
    var prevCell = {
        char: ' ',
        styleId: 0,
        width: 0 /* CellWidth.Narrow */,
        hyperlink: undefined,
    };
    var nextCell = {
        char: ' ',
        styleId: 0,
        width: 0 /* CellWidth.Narrow */,
        hyperlink: undefined,
    };
    var rowEndX = Math.min(endX, width);
    var rowCI = (startY * width + startX) << 1;
    for (var y = startY; y < endY; y++) {
        var prevIn = y < prevHeight;
        var nextIn = y < nextHeight;
        if (prevIn && nextIn) {
            if (diffRowBoth(prevCells, nextCells, prev, next, rowCI, y, startX, rowEndX, prevCell, nextCell, cb))
                return true;
        }
        else if (prevIn) {
            if (diffRowRemoved(prev, rowCI, y, startX, rowEndX, prevCell, cb))
                return true;
        }
        else if (nextIn) {
            if (diffRowAdded(nextCells, next, rowCI, y, startX, rowEndX, nextCell, cb))
                return true;
        }
        rowCI += stride;
    }
    return false;
}
/**
 * Fallback: diff two screens with different widths (resize).
 * Separate indices for prev and next cells arrays.
 */
function diffDifferentWidth(prev, next, startX, endX, startY, endY, cb) {
    var prevWidth = prev.width;
    var nextWidth = next.width;
    var prevCells = prev.cells;
    var nextCells = next.cells;
    var prevCell = {
        char: ' ',
        styleId: 0,
        width: 0 /* CellWidth.Narrow */,
        hyperlink: undefined,
    };
    var nextCell = {
        char: ' ',
        styleId: 0,
        width: 0 /* CellWidth.Narrow */,
        hyperlink: undefined,
    };
    var prevStride = prevWidth << 1;
    var nextStride = nextWidth << 1;
    var prevRowCI = (startY * prevWidth + startX) << 1;
    var nextRowCI = (startY * nextWidth + startX) << 1;
    for (var y = startY; y < endY; y++) {
        var prevIn = y < prev.height;
        var nextIn = y < next.height;
        var prevEndX = prevIn ? Math.min(endX, prevWidth) : startX;
        var nextEndX = nextIn ? Math.min(endX, nextWidth) : startX;
        var bothEndX = Math.min(prevEndX, nextEndX);
        var prevCI = prevRowCI;
        var nextCI = nextRowCI;
        for (var x = startX; x < bothEndX; x++) {
            if (prevCells[prevCI] === nextCells[nextCI] &&
                prevCells[prevCI + 1] === nextCells[nextCI + 1]) {
                prevCI += 2;
                nextCI += 2;
                continue;
            }
            cellAtCI(prev, prevCI, prevCell);
            cellAtCI(next, nextCI, nextCell);
            prevCI += 2;
            nextCI += 2;
            if (cb(x, y, prevCell, nextCell))
                return true;
        }
        if (prevEndX > bothEndX) {
            prevCI = prevRowCI + ((bothEndX - startX) << 1);
            for (var x = bothEndX; x < prevEndX; x++) {
                cellAtCI(prev, prevCI, prevCell);
                prevCI += 2;
                if (cb(x, y, prevCell, undefined))
                    return true;
            }
        }
        if (nextEndX > bothEndX) {
            nextCI = nextRowCI + ((bothEndX - startX) << 1);
            for (var x = bothEndX; x < nextEndX; x++) {
                if (nextCells[nextCI] === 0 && nextCells[nextCI | 1] === 0) {
                    nextCI += 2;
                    continue;
                }
                cellAtCI(next, nextCI, nextCell);
                nextCI += 2;
                if (cb(x, y, undefined, nextCell))
                    return true;
            }
        }
        prevRowCI += prevStride;
        nextRowCI += nextStride;
    }
    return false;
}
/**
 * Mark a rectangular region as noSelect (exclude from text selection).
 * Clamps to screen bounds. Called from output.ts when a <NoSelect> box
 * renders. No damage tracking — noSelect doesn't affect terminal output,
 * only getSelectedText/applySelectionOverlay which read it directly.
 */
function markNoSelectRegion(screen, x, y, width, height) {
    var maxX = Math.min(x + width, screen.width);
    var maxY = Math.min(y + height, screen.height);
    var noSel = screen.noSelect;
    var stride = screen.width;
    for (var row = Math.max(0, y); row < maxY; row++) {
        var rowStart = row * stride;
        noSel.fill(1, rowStart + Math.max(0, x), rowStart + maxX);
    }
}
