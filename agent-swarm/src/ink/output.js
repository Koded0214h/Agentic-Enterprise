"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ansi_tokenize_1 = require("@alcalzone/ansi-tokenize");
var debug_js_1 = require("../utils/debug.js");
var intl_js_1 = require("../utils/intl.js");
var sliceAnsi_js_1 = require("../utils/sliceAnsi.js");
var bidi_js_1 = require("./bidi.js");
var geometry_js_1 = require("./layout/geometry.js");
var screen_js_1 = require("./screen.js");
var stringWidth_js_1 = require("./stringWidth.js");
var widest_line_js_1 = require("./widest-line.js");
/**
 * Intersect two clips. `undefined` on an axis means unbounded; the other
 * clip's bound wins. If both are bounded, take the tighter constraint
 * (max of mins, min of maxes). If the resulting region is empty
 * (x1 >= x2 or y1 >= y2), writes clipped by it will be dropped.
 */
function intersectClip(parent, child) {
    if (!parent)
        return child;
    return {
        x1: maxDefined(parent.x1, child.x1),
        x2: minDefined(parent.x2, child.x2),
        y1: maxDefined(parent.y1, child.y1),
        y2: minDefined(parent.y2, child.y2),
    };
}
function maxDefined(a, b) {
    if (a === undefined)
        return b;
    if (b === undefined)
        return a;
    return Math.max(a, b);
}
function minDefined(a, b) {
    if (a === undefined)
        return b;
    if (b === undefined)
        return a;
    return Math.min(a, b);
}
var Output = /** @class */ (function () {
    function Output(options) {
        this.operations = [];
        this.charCache = new Map();
        var width = options.width, height = options.height, stylePool = options.stylePool, screen = options.screen;
        this.width = width;
        this.height = height;
        this.stylePool = stylePool;
        this.screen = screen;
        (0, screen_js_1.resetScreen)(screen, width, height);
    }
    /**
     * Reuse this Output for a new frame. Zeroes the screen buffer, clears
     * the operation list (backing storage is retained), and caps charCache
     * growth. Preserving charCache across frames is the main win — most
     * lines don't change between renders, so tokenize + grapheme clustering
     * becomes a cache hit.
     */
    Output.prototype.reset = function (width, height, screen) {
        this.width = width;
        this.height = height;
        this.screen = screen;
        this.operations.length = 0;
        (0, screen_js_1.resetScreen)(screen, width, height);
        if (this.charCache.size > 16384)
            this.charCache.clear();
    };
    /**
     * Copy cells from a source screen region (blit = block image transfer).
     */
    Output.prototype.blit = function (src, x, y, width, height) {
        this.operations.push({ type: 'blit', src: src, x: x, y: y, width: width, height: height });
    };
    /**
     * Shift full-width rows within [top, bottom] by n. n > 0 = up. Mirrors
     * what DECSTBM + SU/SD does to the terminal. Paired with blit() to reuse
     * prevScreen content during pure scroll, avoiding full child re-render.
     */
    Output.prototype.shift = function (top, bottom, n) {
        this.operations.push({ type: 'shift', top: top, bottom: bottom, n: n });
    };
    /**
     * Clear a region by writing empty cells. Used when a node shrinks to
     * ensure stale content from the previous frame is removed.
     */
    Output.prototype.clear = function (region, fromAbsolute) {
        this.operations.push({ type: 'clear', region: region, fromAbsolute: fromAbsolute });
    };
    /**
     * Mark a region as non-selectable (excluded from fullscreen text
     * selection copy + highlight). Used by <NoSelect> to fence off
     * gutters (line numbers, diff sigils). Applied AFTER blit/write so
     * the mark wins regardless of what's blitted into the region.
     */
    Output.prototype.noSelect = function (region) {
        this.operations.push({ type: 'noSelect', region: region });
    };
    Output.prototype.write = function (x, y, text, softWrap) {
        if (!text) {
            return;
        }
        this.operations.push({
            type: 'write',
            x: x,
            y: y,
            text: text,
            softWrap: softWrap,
        });
    };
    Output.prototype.clip = function (clip) {
        this.operations.push({
            type: 'clip',
            clip: clip,
        });
    };
    Output.prototype.unclip = function () {
        this.operations.push({
            type: 'unclip',
        });
    };
    Output.prototype.get = function () {
        var _a, _b, _c, _d;
        var screen = this.screen;
        var screenWidth = this.width;
        var screenHeight = this.height;
        // Track blit vs write cell counts for debugging
        var blitCells = 0;
        var writeCells = 0;
        // Pass 1: expand damage to cover clear regions. The buffer is freshly
        // zeroed by resetScreen, so this pass only marks damage so diff()
        // checks these regions against the previous frame.
        //
        // Also collect clears from absolute-positioned nodes. An absolute
        // node overlays normal-flow siblings; when it shrinks, its clear is
        // pushed AFTER those siblings' clean-subtree blits (DOM order). The
        // blit copies the absolute node's own stale paint from prevScreen,
        // and since clear is damage-only, the ghost survives diff. Normal-
        // flow clears don't need this — a normal-flow node's old position
        // can't have been painted on top of a sibling's current position.
        var absoluteClears = [];
        for (var _i = 0, _e = this.operations; _i < _e.length; _i++) {
            var operation = _e[_i];
            if (operation.type !== 'clear')
                continue;
            var _f = operation.region, x = _f.x, y = _f.y, width = _f.width, height = _f.height;
            var startX = Math.max(0, x);
            var startY = Math.max(0, y);
            var maxX = Math.min(x + width, screenWidth);
            var maxY = Math.min(y + height, screenHeight);
            if (startX >= maxX || startY >= maxY)
                continue;
            var rect = {
                x: startX,
                y: startY,
                width: maxX - startX,
                height: maxY - startY,
            };
            screen.damage = screen.damage ? (0, geometry_js_1.unionRect)(screen.damage, rect) : rect;
            if (operation.fromAbsolute)
                absoluteClears.push(rect);
        }
        var clips = [];
        var _loop_1 = function (operation) {
            switch (operation.type) {
                case 'clear': return "continue";
                case 'clip':
                    // Intersect with the parent clip (if any) so nested
                    // overflow:hidden boxes can't write outside their ancestor's
                    // clip region. Without this, a message with overflow:hidden at
                    // the bottom of a scrollbox pushes its OWN clip (based on its
                    // layout bounds, already translated by -scrollTop) which can
                    // extend below the scrollbox viewport — writes escape into
                    // the sibling bottom section's rows.
                    clips.push(intersectClip(clips.at(-1), operation.clip));
                    return "continue";
                case 'unclip':
                    clips.pop();
                    return "continue";
                case 'blit': {
                    // Bulk-copy cells from source screen region using TypedArray.set().
                    // Tracking damage ensures diff() checks blitted cells for stale content
                    // when a parent blits an area that previously contained child content.
                    var src = operation.src, regionX = operation.x, regionY = operation.y, regionWidth = operation.width, regionHeight = operation.height;
                    // Intersect with active clip — a child's clean-blit passes its full
                    // cached rect, but the parent ScrollBox may have shrunk (pill mount).
                    // Without this, the blit writes past the ScrollBox's new bottom edge
                    // into the pill's row.
                    var clip = clips.at(-1);
                    var startX_1 = Math.max(regionX, (_a = clip === null || clip === void 0 ? void 0 : clip.x1) !== null && _a !== void 0 ? _a : 0);
                    var startY = Math.max(regionY, (_b = clip === null || clip === void 0 ? void 0 : clip.y1) !== null && _b !== void 0 ? _b : 0);
                    var maxY = Math.min(regionY + regionHeight, screenHeight, src.height, (_c = clip === null || clip === void 0 ? void 0 : clip.y2) !== null && _c !== void 0 ? _c : Infinity);
                    var maxX_1 = Math.min(regionX + regionWidth, screenWidth, src.width, (_d = clip === null || clip === void 0 ? void 0 : clip.x2) !== null && _d !== void 0 ? _d : Infinity);
                    if (startX_1 >= maxX_1 || startY >= maxY)
                        return "continue";
                    // Skip rows covered by an absolute-positioned node's clear.
                    // Absolute nodes overlay normal-flow siblings, so prevScreen in
                    // that region holds the absolute node's stale paint — blitting
                    // it back would ghost. See absoluteClears collection above.
                    if (absoluteClears.length === 0) {
                        (0, screen_js_1.blitRegion)(screen, src, startX_1, startY, maxX_1, maxY);
                        blitCells += (maxY - startY) * (maxX_1 - startX_1);
                        return "continue";
                    }
                    var rowStart = startY;
                    var _loop_2 = function (row) {
                        var excluded = row < maxY &&
                            absoluteClears.some(function (r) {
                                return row >= r.y &&
                                    row < r.y + r.height &&
                                    startX_1 >= r.x &&
                                    maxX_1 <= r.x + r.width;
                            });
                        if (excluded || row === maxY) {
                            if (row > rowStart) {
                                (0, screen_js_1.blitRegion)(screen, src, startX_1, rowStart, maxX_1, row);
                                blitCells += (row - rowStart) * (maxX_1 - startX_1);
                            }
                            rowStart = row + 1;
                        }
                    };
                    for (var row = startY; row <= maxY; row++) {
                        _loop_2(row);
                    }
                    return "continue";
                }
                case 'shift': {
                    (0, screen_js_1.shiftRows)(screen, operation.top, operation.bottom, operation.n);
                    return "continue";
                }
                case 'write': {
                    var text = operation.text, softWrap = operation.softWrap;
                    var x_1 = operation.x, y = operation.y;
                    var lines = text.split('\n');
                    var swFrom = 0;
                    var prevContentEnd = 0;
                    var clip_1 = clips.at(-1);
                    if (clip_1) {
                        var clipHorizontally = typeof (clip_1 === null || clip_1 === void 0 ? void 0 : clip_1.x1) === 'number' && typeof (clip_1 === null || clip_1 === void 0 ? void 0 : clip_1.x2) === 'number';
                        var clipVertically = typeof (clip_1 === null || clip_1 === void 0 ? void 0 : clip_1.y1) === 'number' && typeof (clip_1 === null || clip_1 === void 0 ? void 0 : clip_1.y2) === 'number';
                        // If text is positioned outside of clipping area altogether,
                        // skip to the next operation to avoid unnecessary calculations
                        if (clipHorizontally) {
                            var width = (0, widest_line_js_1.widestLine)(text);
                            if (x_1 + width <= clip_1.x1 || x_1 >= clip_1.x2) {
                                return "continue";
                            }
                        }
                        if (clipVertically) {
                            var height = lines.length;
                            if (y + height <= clip_1.y1 || y >= clip_1.y2) {
                                return "continue";
                            }
                        }
                        if (clipHorizontally) {
                            lines = lines.map(function (line) {
                                var from = x_1 < clip_1.x1 ? clip_1.x1 - x_1 : 0;
                                var width = (0, stringWidth_js_1.stringWidth)(line);
                                var to = x_1 + width > clip_1.x2 ? clip_1.x2 - x_1 : width;
                                var sliced = (0, sliceAnsi_js_1.default)(line, from, to);
                                // Wide chars (CJK, emoji) occupy 2 cells. When `to` lands
                                // on the first cell of a wide char, sliceAnsi includes the
                                // entire glyph and the result overflows clip.x2 by one cell,
                                // writing a SpacerTail into the adjacent sibling. Re-slice
                                // one cell earlier; wide chars are exactly 2 cells, so a
                                // single retry always fits.
                                if ((0, stringWidth_js_1.stringWidth)(sliced) > to - from) {
                                    sliced = (0, sliceAnsi_js_1.default)(line, from, to - 1);
                                }
                                return sliced;
                            });
                            if (x_1 < clip_1.x1) {
                                x_1 = clip_1.x1;
                            }
                        }
                        if (clipVertically) {
                            var from = y < clip_1.y1 ? clip_1.y1 - y : 0;
                            var height = lines.length;
                            var to = y + height > clip_1.y2 ? clip_1.y2 - y : height;
                            // If the first visible line is a soft-wrap continuation, we
                            // need the clipped previous line's content end so
                            // screen.softWrap[lineY] correctly records the join point
                            // even though that line's cells were never written.
                            if (softWrap && from > 0 && softWrap[from] === true) {
                                prevContentEnd = x_1 + (0, stringWidth_js_1.stringWidth)(lines[from - 1]);
                            }
                            lines = lines.slice(from, to);
                            swFrom = from;
                            if (y < clip_1.y1) {
                                y = clip_1.y1;
                            }
                        }
                    }
                    var swBits = screen.softWrap;
                    var offsetY = 0;
                    for (var _m = 0, lines_1 = lines; _m < lines_1.length; _m++) {
                        var line = lines_1[_m];
                        var lineY = y + offsetY;
                        // Line can be outside screen if `text` is taller than screen height
                        if (lineY >= screenHeight) {
                            break;
                        }
                        var contentEnd = writeLineToScreen(screen, line, x_1, lineY, screenWidth, this_1.stylePool, this_1.charCache);
                        writeCells += contentEnd - x_1;
                        // See Screen.softWrap docstring for the encoding. contentEnd
                        // from writeLineToScreen is tab-expansion-aware, unlike
                        // x+stringWidth(line) which treats tabs as width 0.
                        if (softWrap) {
                            var isSW = softWrap[swFrom + offsetY] === true;
                            swBits[lineY] = isSW ? prevContentEnd : 0;
                            prevContentEnd = contentEnd;
                        }
                        offsetY++;
                    }
                    return "continue";
                }
            }
        };
        var this_1 = this;
        for (var _g = 0, _h = this.operations; _g < _h.length; _g++) {
            var operation = _h[_g];
            _loop_1(operation);
        }
        // noSelect ops go LAST so they win over blits (which copy noSelect
        // from prevScreen) and writes (which don't touch noSelect). This way
        // a <NoSelect> box correctly fences its region even when the parent
        // blits, and moving a <NoSelect> between frames correctly clears the
        // old region (resetScreen already zeroed the bitmap).
        for (var _j = 0, _k = this.operations; _j < _k.length; _j++) {
            var operation = _k[_j];
            if (operation.type === 'noSelect') {
                var _l = operation.region, x = _l.x, y = _l.y, width = _l.width, height = _l.height;
                (0, screen_js_1.markNoSelectRegion)(screen, x, y, width, height);
            }
        }
        // Log blit/write ratio for debugging - high write count suggests blitting isn't working
        var totalCells = blitCells + writeCells;
        if (totalCells > 1000 && writeCells > blitCells) {
            (0, debug_js_1.logForDebugging)("High write ratio: blit=".concat(blitCells, ", write=").concat(writeCells, " (").concat(((writeCells / totalCells) * 100).toFixed(1), "% writes), screen=").concat(screenHeight, "x").concat(screenWidth));
        }
        return screen;
    };
    return Output;
}());
exports.default = Output;
function stylesEqual(a, b) {
    if (a === b)
        return true; // Reference equality fast path
    var len = a.length;
    if (len !== b.length)
        return false;
    if (len === 0)
        return true; // Both empty
    for (var i = 0; i < len; i++) {
        if (a[i].code !== b[i].code)
            return false;
    }
    return true;
}
/**
 * Convert a string with ANSI codes into styled characters with proper grapheme
 * clustering. Fixes ansi-tokenize splitting grapheme clusters (like family
 * emojis) into individual code points.
 *
 * Also precomputes styleId + hyperlink per style run (not per char) — an
 * 80-char line with 3 style runs does 3 intern calls instead of 80.
 */
function styledCharsWithGraphemeClustering(chars, stylePool) {
    var charCount = chars.length;
    if (charCount === 0)
        return [];
    var result = [];
    var bufferChars = [];
    var bufferStyles = chars[0].styles;
    for (var i = 0; i < charCount; i++) {
        var char = chars[i];
        var styles = char.styles;
        // Different styles means we need to flush and start new buffer
        if (bufferChars.length > 0 && !stylesEqual(styles, bufferStyles)) {
            flushBuffer(bufferChars.join(''), bufferStyles, stylePool, result);
            bufferChars.length = 0;
        }
        bufferChars.push(char.value);
        bufferStyles = styles;
    }
    // Final flush
    if (bufferChars.length > 0) {
        flushBuffer(bufferChars.join(''), bufferStyles, stylePool, result);
    }
    return result;
}
function flushBuffer(buffer, styles, stylePool, out) {
    var _a;
    // Compute styleId + hyperlink ONCE for the whole style run.
    // Every grapheme in this buffer shares the same styles.
    //
    // Extract and track hyperlinks separately, filter from styles.
    // Always check for OSC 8 codes to filter, not just when a URL is
    // extracted. The tokenizer treats OSC 8 close codes (empty URL) as
    // active styles, so they must be filtered even when no hyperlink
    // URL is present.
    var hyperlink = (_a = (0, screen_js_1.extractHyperlinkFromStyles)(styles)) !== null && _a !== void 0 ? _a : undefined;
    var hasOsc8Styles = hyperlink !== undefined ||
        styles.some(function (s) {
            return s.code.length >= screen_js_1.OSC8_PREFIX.length && s.code.startsWith(screen_js_1.OSC8_PREFIX);
        });
    var filteredStyles = hasOsc8Styles
        ? (0, screen_js_1.filterOutHyperlinkStyles)(styles)
        : styles;
    var styleId = stylePool.intern(filteredStyles);
    for (var _i = 0, _b = (0, intl_js_1.getGraphemeSegmenter)().segment(buffer); _i < _b.length; _i++) {
        var grapheme = _b[_i].segment;
        out.push({
            value: grapheme,
            width: (0, stringWidth_js_1.stringWidth)(grapheme),
            styleId: styleId,
            hyperlink: hyperlink,
        });
    }
}
/**
 * Write a single line's characters into the screen buffer.
 * Extracted from Output.get() so JSC can optimize this tight,
 * monomorphic loop independently — better register allocation,
 * setCellAt inlining, and type feedback than when buried inside
 * a 300-line dispatch function.
 *
 * Returns the end column (x + visual width, including tab expansion) so
 * the caller can record it in screen.softWrap without re-walking the
 * line via stringWidth(). Caller computes the debug cell-count as end-x.
 */
function writeLineToScreen(screen, line, x, y, screenWidth, stylePool, charCache) {
    var _a, _b, _c, _d;
    var characters = charCache.get(line);
    if (!characters) {
        characters = (0, bidi_js_1.reorderBidi)(styledCharsWithGraphemeClustering((0, ansi_tokenize_1.styledCharsFromTokens)((0, ansi_tokenize_1.tokenize)(line)), stylePool));
        charCache.set(line, characters);
    }
    var offsetX = x;
    for (var charIdx = 0; charIdx < characters.length; charIdx++) {
        var character = characters[charIdx];
        var codePoint = character.value.codePointAt(0);
        // Handle C0 control characters (0x00-0x1F) that cause cursor movement
        // mismatches. stringWidth treats these as width 0, but terminals may
        // move the cursor differently.
        if (codePoint !== undefined && codePoint <= 0x1f) {
            // Tab (0x09): expand to spaces to reach next tab stop
            if (codePoint === 0x09) {
                var tabWidth = 8;
                var spacesToNextStop = tabWidth - (offsetX % tabWidth);
                for (var i = 0; i < spacesToNextStop && offsetX < screenWidth; i++) {
                    (0, screen_js_1.setCellAt)(screen, offsetX, y, {
                        char: ' ',
                        styleId: stylePool.none,
                        width: 0 /* CellWidth.Narrow */,
                        hyperlink: undefined,
                    });
                    offsetX++;
                }
            }
            // ESC (0x1B): skip incomplete escape sequences that ansi-tokenize
            // didn't recognize. ansi-tokenize only parses SGR sequences (ESC[...m)
            // and OSC 8 hyperlinks (ESC]8;;url BEL). Other sequences like cursor
            // movement, screen clearing, or terminal title become individual char
            // tokens that we need to skip here.
            else if (codePoint === 0x1b) {
                var nextChar = (_a = characters[charIdx + 1]) === null || _a === void 0 ? void 0 : _a.value;
                var nextCode = nextChar === null || nextChar === void 0 ? void 0 : nextChar.codePointAt(0);
                if (nextChar === '(' ||
                    nextChar === ')' ||
                    nextChar === '*' ||
                    nextChar === '+') {
                    // Charset selection: ESC ( X, ESC ) X, etc.
                    // Skip the intermediate char and the charset designator
                    charIdx += 2;
                }
                else if (nextChar === '[') {
                    // CSI sequence: ESC [ ... final-byte
                    // Final byte is in range 0x40-0x7E (@, A-Z, [\]^_`, a-z, {|}~)
                    // Examples: ESC[2J (clear), ESC[?25l (cursor hide), ESC[H (home)
                    charIdx++; // skip the [
                    while (charIdx < characters.length - 1) {
                        charIdx++;
                        var c = (_b = characters[charIdx]) === null || _b === void 0 ? void 0 : _b.value.codePointAt(0);
                        // Final byte terminates the sequence
                        if (c !== undefined && c >= 0x40 && c <= 0x7e) {
                            break;
                        }
                    }
                }
                else if (nextChar === ']' ||
                    nextChar === 'P' ||
                    nextChar === '_' ||
                    nextChar === '^' ||
                    nextChar === 'X') {
                    // String-based sequences terminated by BEL (0x07) or ST (ESC \):
                    // - OSC: ESC ] ... (Operating System Command)
                    // - DCS: ESC P ... (Device Control String)
                    // - APC: ESC _ ... (Application Program Command)
                    // - PM:  ESC ^ ... (Privacy Message)
                    // - SOS: ESC X ... (Start of String)
                    charIdx++; // skip the introducer char
                    while (charIdx < characters.length - 1) {
                        charIdx++;
                        var c = (_c = characters[charIdx]) === null || _c === void 0 ? void 0 : _c.value;
                        // BEL (0x07) terminates the sequence
                        if (c === '\x07') {
                            break;
                        }
                        // ST (String Terminator) is ESC \
                        // When we see ESC, check if next char is backslash
                        if (c === '\x1b') {
                            var nextC = (_d = characters[charIdx + 1]) === null || _d === void 0 ? void 0 : _d.value;
                            if (nextC === '\\') {
                                charIdx++; // skip the backslash too
                                break;
                            }
                        }
                    }
                }
                else if (nextCode !== undefined &&
                    nextCode >= 0x30 &&
                    nextCode <= 0x7e) {
                    // Single-character escape sequences: ESC followed by 0x30-0x7E
                    // (excluding the multi-char introducers already handled above)
                    // - Fp range (0x30-0x3F): ESC 7 (save cursor), ESC 8 (restore)
                    // - Fe range (0x40-0x5F): ESC D (index), ESC M (reverse index)
                    // - Fs range (0x60-0x7E): ESC c (reset)
                    charIdx++; // skip the command char
                }
            }
            // Carriage return (0x0D): would move cursor to column 0, skip it
            // Backspace (0x08): would move cursor left, skip it
            // Bell (0x07), vertical tab (0x0B), form feed (0x0C): skip
            // All other control chars (0x00-0x06, 0x0E-0x1F): skip
            // Note: newline (0x0A) is already handled by line splitting
            continue;
        }
        // Zero-width characters (combining marks, ZWNJ, ZWS, etc.)
        // don't occupy terminal cells — storing them as Narrow cells
        // desyncs the virtual cursor from the real terminal cursor.
        // Width was computed once during clustering (cached via charCache).
        var charWidth = character.width;
        if (charWidth === 0) {
            continue;
        }
        var isWideCharacter = charWidth >= 2;
        // Wide char at last column can't fit — terminal would wrap it to
        // the next line, desyncing our cursor model. Place a SpacerHead
        // to mark the blank column, matching terminal behavior.
        if (isWideCharacter && offsetX + 2 > screenWidth) {
            (0, screen_js_1.setCellAt)(screen, offsetX, y, {
                char: ' ',
                styleId: stylePool.none,
                width: 3 /* CellWidth.SpacerHead */,
                hyperlink: undefined,
            });
            offsetX++;
            continue;
        }
        // styleId + hyperlink were precomputed during clustering (once per
        // style run, cached via charCache). Hot loop is now just property
        // reads — no intern, no extract, no filter per frame.
        (0, screen_js_1.setCellAt)(screen, offsetX, y, {
            char: character.value,
            styleId: character.styleId,
            width: isWideCharacter ? 1 /* CellWidth.Wide */ : 0 /* CellWidth.Narrow */,
            hyperlink: character.hyperlink,
        });
        offsetX += isWideCharacter ? 2 : 1;
    }
    return offsetX;
}
