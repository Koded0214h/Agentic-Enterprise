"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLayoutShifted = resetLayoutShifted;
exports.didLayoutShift = didLayoutShift;
exports.resetScrollHint = resetScrollHint;
exports.getScrollHint = getScrollHint;
exports.resetScrollDrainNode = resetScrollDrainNode;
exports.getScrollDrainNode = getScrollDrainNode;
exports.consumeFollowScroll = consumeFollowScroll;
exports.buildCharToSegmentMap = buildCharToSegmentMap;
exports.applyStylesToWrappedText = applyStylesToWrappedText;
var indent_string_1 = require("indent-string");
var colorize_js_1 = require("./colorize.js");
var get_max_width_js_1 = require("./get-max-width.js");
var node_js_1 = require("./layout/node.js");
var node_cache_js_1 = require("./node-cache.js");
var render_border_js_1 = require("./render-border.js");
var squash_text_nodes_js_1 = require("./squash-text-nodes.js");
var terminal_js_1 = require("./terminal.js");
var widest_line_js_1 = require("./widest-line.js");
var wrap_text_js_1 = require("./wrap-text.js");
// Matches detectXtermJsWheel() in ScrollKeybindingHandler.tsx — the curve
// and drain must agree on terminal detection. TERM_PROGRAM check is the sync
// fallback; isXtermJs() is the authoritative XTVERSION-probe result.
function isXtermJsHost() {
    return process.env.TERM_PROGRAM === 'vscode' || (0, terminal_js_1.isXtermJs)();
}
// Per-frame scratch: set when any node's yoga position/size differs from
// its cached value, or a child was removed. Read by ink.tsx to decide
// whether the full-damage sledgehammer (PR #20120) is needed this frame.
// Applies on both alt-screen and main-screen. Steady-state frames
// (spinner tick, clock tick, text append into a fixed-height box) don't
// shift layout → narrow damage bounds → O(changed cells) diff instead of
// O(rows×cols).
var layoutShifted = false;
function resetLayoutShifted() {
    layoutShifted = false;
}
function didLayoutShift() {
    return layoutShifted;
}
var scrollHint = null;
// Rects of position:absolute nodes from the PREVIOUS frame, used by
// ScrollBox's blit+shift third-pass repair (see usage site). Recorded at
// three paths — full-render nodeCache.set, node-level blit early-return,
// blitEscapingAbsoluteDescendants — so clean-overlay consecutive scrolls
// still have the rect.
var absoluteRectsPrev = [];
var absoluteRectsCur = [];
function resetScrollHint() {
    scrollHint = null;
    absoluteRectsPrev = absoluteRectsCur;
    absoluteRectsCur = [];
}
function getScrollHint() {
    return scrollHint;
}
// The ScrollBox DOM node (if any) with pendingScrollDelta left after this
// frame's drain. renderer.ts calls markDirty(it) post-render so the NEXT
// frame's root blit check fails and we descend to continue draining.
// Without this, after the scrollbox's dirty flag is cleared (line ~721),
// the next frame blits root and never reaches the scrollbox — drain stalls.
var scrollDrainNode = null;
function resetScrollDrainNode() {
    scrollDrainNode = null;
}
function getScrollDrainNode() {
    return scrollDrainNode;
}
var followScroll = null;
function consumeFollowScroll() {
    var f = followScroll;
    followScroll = null;
    return f;
}
// ── Native terminal drain (iTerm2/Ghostty/etc. — proportional events) ──
// Minimum rows applied per frame. Above this, drain is proportional (~3/4
// of remaining) so big bursts catch up in log₄ frames while the tail
// decelerates smoothly. Hard cap is innerHeight-1 so DECSTBM hint fires.
var SCROLL_MIN_PER_FRAME = 4;
// ── xterm.js (VS Code) smooth drain ──
// Low pending (≤5) drains ALL in one frame — slow wheel clicks should be
// instant (click → visible jump → done), not micro-stutter 1-row frames.
// Higher pending drains at a small fixed step so fast-scroll animation
// stays smooth (no big jumps). Pending >MAX snaps excess.
var SCROLL_INSTANT_THRESHOLD = 5; // ≤ this: drain all at once
var SCROLL_HIGH_PENDING = 12; // threshold for HIGH step
var SCROLL_STEP_MED = 2; // pending (INSTANT, HIGH): catch-up
var SCROLL_STEP_HIGH = 3; // pending ≥ HIGH: fast flick
var SCROLL_MAX_PENDING = 30; // snap excess beyond this
// xterm.js adaptive drain. Returns rows applied; mutates pendingScrollDelta.
function drainAdaptive(node, pending, innerHeight) {
    var sign = pending > 0 ? 1 : -1;
    var abs = Math.abs(pending);
    var applied = 0;
    // Snap excess beyond animation window so big flicks don't coast.
    if (abs > SCROLL_MAX_PENDING) {
        applied += sign * (abs - SCROLL_MAX_PENDING);
        abs = SCROLL_MAX_PENDING;
    }
    // ≤5: drain all (slow click = instant). Above: small fixed step.
    var step = abs <= SCROLL_INSTANT_THRESHOLD
        ? abs
        : abs < SCROLL_HIGH_PENDING
            ? SCROLL_STEP_MED
            : SCROLL_STEP_HIGH;
    applied += sign * step;
    var rem = abs - step;
    // Cap total at innerHeight-1 so DECSTBM blit+shift fast path fires
    // (matches drainProportional). Excess stays in pendingScrollDelta.
    var cap = Math.max(1, innerHeight - 1);
    var totalAbs = Math.abs(applied);
    if (totalAbs > cap) {
        var excess = totalAbs - cap;
        node.pendingScrollDelta = sign * (rem + excess);
        return sign * cap;
    }
    node.pendingScrollDelta = rem > 0 ? sign * rem : undefined;
    return applied;
}
// Native proportional drain. step = max(MIN, floor(abs*3/4)), capped at
// innerHeight-1 so DECSTBM + blit+shift fast path fire.
function drainProportional(node, pending, innerHeight) {
    var abs = Math.abs(pending);
    var cap = Math.max(1, innerHeight - 1);
    var step = Math.min(cap, Math.max(SCROLL_MIN_PER_FRAME, (abs * 3) >> 2));
    if (abs <= step) {
        node.pendingScrollDelta = undefined;
        return pending;
    }
    var applied = pending > 0 ? step : -step;
    node.pendingScrollDelta = pending - applied;
    return applied;
}
// OSC 8 hyperlink escape sequences. Empty params (;;) — ansi-tokenize only
// recognizes this exact prefix. The id= param (for grouping wrapped lines)
// is added at terminal-output time in termio/osc.ts link().
var OSC = '\u001B]';
var BEL = '\u0007';
function wrapWithOsc8Link(text, url) {
    return "".concat(OSC, "8;;").concat(url).concat(BEL).concat(text).concat(OSC, "8;;").concat(BEL);
}
/**
 * Build a mapping from each character position in the plain text to its segment index.
 * Returns an array where charToSegment[i] is the segment index for character i.
 */
function buildCharToSegmentMap(segments) {
    var map = [];
    for (var i = 0; i < segments.length; i++) {
        var len = segments[i].text.length;
        for (var j = 0; j < len; j++) {
            map.push(i);
        }
    }
    return map;
}
/**
 * Apply styles to wrapped text by mapping each character back to its original segment.
 * This preserves per-segment styles even when text wraps across lines.
 *
 * @param trimEnabled - Whether whitespace trimming is enabled (wrap-trim mode).
 *   When true, we skip whitespace in the original that was trimmed from the output.
 *   When false (wrap mode), all whitespace is preserved so no skipping is needed.
 */
function applyStylesToWrappedText(wrappedPlain, segments, charToSegment, originalPlain, trimEnabled) {
    var _a, _b;
    if (trimEnabled === void 0) { trimEnabled = false; }
    var lines = wrappedPlain.split('\n');
    var resultLines = [];
    var charIndex = 0;
    for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        var line = lines[lineIdx];
        // In trim mode, skip leading whitespace that was trimmed from this line.
        // Only skip if the original has whitespace but the output line doesn't start
        // with whitespace (meaning it was trimmed). If both have whitespace, the
        // whitespace was preserved and we shouldn't skip.
        if (trimEnabled && line.length > 0) {
            var lineStartsWithWhitespace = /\s/.test(line[0]);
            var originalHasWhitespace = charIndex < originalPlain.length && /\s/.test(originalPlain[charIndex]);
            // Only skip if original has whitespace but line doesn't
            if (originalHasWhitespace && !lineStartsWithWhitespace) {
                while (charIndex < originalPlain.length &&
                    /\s/.test(originalPlain[charIndex])) {
                    charIndex++;
                }
            }
        }
        var styledLine = '';
        var runStart = 0;
        var runSegmentIndex = (_a = charToSegment[charIndex]) !== null && _a !== void 0 ? _a : 0;
        for (var i = 0; i < line.length; i++) {
            var currentSegmentIndex = (_b = charToSegment[charIndex]) !== null && _b !== void 0 ? _b : runSegmentIndex;
            if (currentSegmentIndex !== runSegmentIndex) {
                // Flush the current run
                var runText_1 = line.slice(runStart, i);
                var segment_1 = segments[runSegmentIndex];
                if (segment_1) {
                    var styled = (0, colorize_js_1.applyTextStyles)(runText_1, segment_1.styles);
                    if (segment_1.hyperlink) {
                        styled = wrapWithOsc8Link(styled, segment_1.hyperlink);
                    }
                    styledLine += styled;
                }
                else {
                    styledLine += runText_1;
                }
                runStart = i;
                runSegmentIndex = currentSegmentIndex;
            }
            charIndex++;
        }
        // Flush the final run
        var runText = line.slice(runStart);
        var segment = segments[runSegmentIndex];
        if (segment) {
            var styled = (0, colorize_js_1.applyTextStyles)(runText, segment.styles);
            if (segment.hyperlink) {
                styled = wrapWithOsc8Link(styled, segment.hyperlink);
            }
            styledLine += styled;
        }
        else {
            styledLine += runText;
        }
        resultLines.push(styledLine);
        // Skip newline character in original that corresponds to this line break.
        // This is needed when the original text contains actual newlines (not just
        // wrapping-inserted newlines). Without this, charIndex gets out of sync
        // because the newline is in originalPlain/charToSegment but not in the
        // split lines.
        if (charIndex < originalPlain.length && originalPlain[charIndex] === '\n') {
            charIndex++;
        }
        // In trim mode, skip whitespace that was replaced by newline when wrapping.
        // We skip whitespace in the original until we reach a character that matches
        // the first character of the next line. This handles cases like:
        // - "AB   \tD" wrapped to "AB\n\tD" - skip spaces until we hit the tab
        // In non-trim mode, whitespace is preserved so no skipping is needed.
        if (trimEnabled && lineIdx < lines.length - 1) {
            var nextLine = lines[lineIdx + 1];
            var nextLineFirstChar = nextLine.length > 0 ? nextLine[0] : null;
            // Skip whitespace until we hit a char that matches the next line's first char
            while (charIndex < originalPlain.length &&
                /\s/.test(originalPlain[charIndex])) {
                // Stop if we found the character that starts the next line
                if (nextLineFirstChar !== null &&
                    originalPlain[charIndex] === nextLineFirstChar) {
                    break;
                }
                charIndex++;
            }
        }
    }
    return resultLines.join('\n');
}
/**
 * Wrap text and record which output lines are soft-wrap continuations
 * (i.e. the `\n` before them was inserted by word-wrap, not in the
 * source). wrapAnsi already processes each input line independently, so
 * wrapping per-input-line here gives identical output to a single
 * whole-string wrap while letting us mark per-piece provenance.
 * Truncate modes never add newlines (cli-truncate is whole-string) so
 * they fall through with softWrap undefined — no tracking, no behavior
 * change from the pre-softWrap path.
 */
function wrapWithSoftWrap(plainText, maxWidth, textWrap) {
    if (textWrap !== 'wrap' && textWrap !== 'wrap-trim') {
        return {
            wrapped: (0, wrap_text_js_1.default)(plainText, maxWidth, textWrap),
            softWrap: undefined,
        };
    }
    var origLines = plainText.split('\n');
    var outLines = [];
    var softWrap = [];
    for (var _i = 0, origLines_1 = origLines; _i < origLines_1.length; _i++) {
        var orig = origLines_1[_i];
        var pieces = (0, wrap_text_js_1.default)(orig, maxWidth, textWrap).split('\n');
        for (var i = 0; i < pieces.length; i++) {
            outLines.push(pieces[i]);
            softWrap.push(i > 0);
        }
    }
    return { wrapped: outLines.join('\n'), softWrap: softWrap };
}
// If parent container is `<Box>`, text nodes will be treated as separate nodes in
// the tree and will have their own coordinates in the layout.
// To ensure text nodes are aligned correctly, take X and Y of the first text node
// and use it as offset for the rest of the nodes
// Only first node is taken into account, because other text nodes can't have margin or padding,
// so their coordinates will be relative to the first node anyway
function applyPaddingToText(node, text, softWrap) {
    var _a;
    var yogaNode = (_a = node.childNodes[0]) === null || _a === void 0 ? void 0 : _a.yogaNode;
    if (yogaNode) {
        var offsetX = yogaNode.getComputedLeft();
        var offsetY = yogaNode.getComputedTop();
        text = '\n'.repeat(offsetY) + (0, indent_string_1.default)(text, offsetX);
        if (softWrap && offsetY > 0) {
            // Prepend `false` for each padding line so indices stay aligned
            // with text.split('\n'). Mutate in place — caller owns the array.
            softWrap.unshift.apply(softWrap, Array(offsetY).fill(false));
        }
    }
    return text;
}
// After nodes are laid out, render each to output object, which later gets rendered to terminal
function renderNodeToOutput(node, output, _a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var _s = _a.offsetX, offsetX = _s === void 0 ? 0 : _s, _t = _a.offsetY, offsetY = _t === void 0 ? 0 : _t, prevScreen = _a.prevScreen, _u = _a.skipSelfBlit, skipSelfBlit = _u === void 0 ? false : _u, inheritedBackgroundColor = _a.inheritedBackgroundColor;
    var yogaNode = node.yogaNode;
    if (yogaNode) {
        if (yogaNode.getDisplay() === node_js_1.LayoutDisplay.None) {
            // Clear old position if node was visible before becoming hidden
            if (node.dirty) {
                var cached_1 = node_cache_js_1.nodeCache.get(node);
                if (cached_1) {
                    output.clear({
                        x: Math.floor(cached_1.x),
                        y: Math.floor(cached_1.y),
                        width: Math.floor(cached_1.width),
                        height: Math.floor(cached_1.height),
                    });
                    // Drop descendants' cache too — hideInstance's markDirty walks UP
                    // only, so descendants' .dirty stays false. Their nodeCache entries
                    // survive with pre-hide rects. On unhide, if position didn't shift,
                    // the blit check at line ~432 passes and copies EMPTY cells from
                    // prevScreen (cleared here) → content vanishes.
                    dropSubtreeCache(node);
                    layoutShifted = true;
                }
            }
            return;
        }
        // Left and top positions in Yoga are relative to their parent node
        var x = offsetX + yogaNode.getComputedLeft();
        var yogaTop = yogaNode.getComputedTop();
        var y = offsetY + yogaTop;
        var width = yogaNode.getComputedWidth();
        var height = yogaNode.getComputedHeight();
        // Absolute-positioned overlays (e.g. autocomplete menus with bottom='100%')
        // can compute negative screen y when they extend above the viewport. Without
        // clamping, setCellAt drops cells at y<0, clipping the TOP of the content
        // (best matches in an autocomplete). By clamping to 0, we shift the element
        // down so the top rows are visible and the bottom overflows below — the
        // opaque prop ensures it paints over whatever is underneath.
        if (y < 0 && node.style.position === 'absolute') {
            y = 0;
        }
        // Check if we can skip this subtree (clean node with unchanged layout).
        // Blit cells from previous screen instead of re-rendering.
        var cached = node_cache_js_1.nodeCache.get(node);
        if (!node.dirty &&
            !skipSelfBlit &&
            node.pendingScrollDelta === undefined &&
            cached &&
            cached.x === x &&
            cached.y === y &&
            cached.width === width &&
            cached.height === height &&
            prevScreen) {
            var fx = Math.floor(x);
            var fy = Math.floor(y);
            var fw = Math.floor(width);
            var fh = Math.floor(height);
            output.blit(prevScreen, fx, fy, fw, fh);
            if (node.style.position === 'absolute') {
                absoluteRectsCur.push(cached);
            }
            // Absolute descendants can paint outside this node's layout bounds
            // (e.g. a slash menu with position='absolute' bottom='100%' floats
            // above). If a dirty clipped sibling re-rendered and overwrote those
            // cells, the blit above only restored this node's own rect — the
            // absolute descendants' cells are lost. Re-blit them from prevScreen
            // so the overlays survive.
            blitEscapingAbsoluteDescendants(node, output, prevScreen, fx, fy, fw, fh);
            return;
        }
        // Clear stale content from the old position when re-rendering.
        // Dirty: content changed. Moved: position/size changed (e.g., sibling
        // above changed height), old cells still on the terminal.
        var positionChanged = cached !== undefined &&
            (cached.x !== x ||
                cached.y !== y ||
                cached.width !== width ||
                cached.height !== height);
        if (positionChanged) {
            layoutShifted = true;
        }
        if (cached && (node.dirty || positionChanged)) {
            output.clear({
                x: Math.floor(cached.x),
                y: Math.floor(cached.y),
                width: Math.floor(cached.width),
                height: Math.floor(cached.height),
            }, node.style.position === 'absolute');
        }
        // Read before deleting — hasRemovedChild disables prevScreen blitting
        // for siblings to prevent stale overflow content from being restored.
        var clears = node_cache_js_1.pendingClears.get(node);
        var hasRemovedChild = clears !== undefined;
        if (hasRemovedChild) {
            layoutShifted = true;
            for (var _i = 0, clears_1 = clears; _i < clears_1.length; _i++) {
                var rect_1 = clears_1[_i];
                output.clear({
                    x: Math.floor(rect_1.x),
                    y: Math.floor(rect_1.y),
                    width: Math.floor(rect_1.width),
                    height: Math.floor(rect_1.height),
                });
            }
            node_cache_js_1.pendingClears.delete(node);
        }
        // Yoga squeezed this node to zero height (overflow in a height-constrained
        // parent) AND a sibling lands at the same y. Skip rendering — both would
        // write to the same row; if the sibling's content is shorter, this node's
        // tail chars ghost (e.g. "false" + "true" = "truee"). The clear above
        // already handled the visible→squeezed transition.
        //
        // The sibling-overlap check is load-bearing: Yoga's pixel-grid rounding
        // can give a box h=0 while still leaving a row for it (next sibling at
        // y+1, not y). HelpV2's third shortcuts column hits this — skipping
        // unconditionally drops "ctrl + z to suspend" from /help output.
        if (height === 0 && siblingSharesY(node, yogaNode)) {
            node_cache_js_1.nodeCache.set(node, { x: x, y: y, width: width, height: height, top: yogaTop });
            node.dirty = false;
            return;
        }
        if (node.nodeName === 'ink-raw-ansi') {
            // Pre-rendered ANSI content. The producer already wrapped to width and
            // emitted terminal-ready escape codes. Skip squash, measure, wrap, and
            // style re-application — output.write() parses ANSI directly into cells.
            var text = node.attributes['rawText'];
            if (text) {
                output.write(x, y, text);
            }
        }
        else if (node.nodeName === 'ink-text') {
            var segments = (0, squash_text_nodes_js_1.squashTextNodesToSegments)(node, inheritedBackgroundColor
                ? { backgroundColor: inheritedBackgroundColor }
                : undefined);
            // First, get plain text to check if wrapping is needed
            var plainText = segments.map(function (s) { return s.text; }).join('');
            if (plainText.length > 0) {
                // Upstream Ink uses getMaxWidth(yogaNode) unclamped here. That
                // width comes from Yoga's AtMost pass and can exceed the actual
                // screen space (see getMaxWidth docstring). Yoga's height for this
                // node already reflects the constrained Exactly pass, so clamping
                // the wrap width here keeps line count consistent with layout.
                // Without this, characters past the screen edge are dropped by
                // setCellAt's bounds check.
                var maxWidth = Math.min((0, get_max_width_js_1.default)(yogaNode), output.width - x);
                var textWrap = (_b = node.style.textWrap) !== null && _b !== void 0 ? _b : 'wrap';
                // Check if wrapping is needed
                var needsWrapping = (0, widest_line_js_1.widestLine)(plainText) > maxWidth;
                var text = void 0;
                var softWrap = void 0;
                if (needsWrapping && segments.length === 1) {
                    // Single segment: wrap plain text first, then apply styles to each line
                    var segment_2 = segments[0];
                    var w = wrapWithSoftWrap(plainText, maxWidth, textWrap);
                    softWrap = w.softWrap;
                    text = w.wrapped
                        .split('\n')
                        .map(function (line) {
                        var styled = (0, colorize_js_1.applyTextStyles)(line, segment_2.styles);
                        // Apply OSC 8 hyperlink per-line so each line is independently
                        // clickable. output.ts splits on newlines and tokenizes each
                        // line separately, so a single wrapper around the whole block
                        // would only apply the hyperlink to the first line.
                        if (segment_2.hyperlink) {
                            styled = wrapWithOsc8Link(styled, segment_2.hyperlink);
                        }
                        return styled;
                    })
                        .join('\n');
                }
                else if (needsWrapping) {
                    // Multiple segments with wrapping: wrap plain text first, then re-apply
                    // each segment's styles based on character positions. This preserves
                    // per-segment styles even when text wraps across lines.
                    var w = wrapWithSoftWrap(plainText, maxWidth, textWrap);
                    softWrap = w.softWrap;
                    var charToSegment = buildCharToSegmentMap(segments);
                    text = applyStylesToWrappedText(w.wrapped, segments, charToSegment, plainText, textWrap === 'wrap-trim');
                    // Hyperlinks are handled per-run in applyStylesToWrappedText via
                    // wrapWithOsc8Link, similar to how styles are applied per-run.
                }
                else {
                    // No wrapping needed: apply styles directly
                    text = segments
                        .map(function (segment) {
                        var styledText = (0, colorize_js_1.applyTextStyles)(segment.text, segment.styles);
                        if (segment.hyperlink) {
                            styledText = wrapWithOsc8Link(styledText, segment.hyperlink);
                        }
                        return styledText;
                    })
                        .join('');
                }
                text = applyPaddingToText(node, text, softWrap);
                output.write(x, y, text, softWrap);
            }
        }
        else if (node.nodeName === 'ink-box') {
            var boxBackgroundColor = (_c = node.style.backgroundColor) !== null && _c !== void 0 ? _c : inheritedBackgroundColor;
            // Mark this box's region as non-selectable (fullscreen text
            // selection). noSelect ops are applied AFTER blits/writes in
            // output.get(), so this wins regardless of what's rendered into
            // the region — including blits from prevScreen when the box is
            // clean (the op is emitted on both the dirty-render path here
            // AND on the blit fast-path at line ~235 since blitRegion copies
            // the noSelect bitmap alongside cells).
            //
            // 'from-left-edge' extends the exclusion from col 0 so any
            // upstream indentation (tool prefix, tree lines) is covered too
            // — a multi-row drag over a diff gutter shouldn't pick up the
            // `  ⎿  ` prefix on row 0 or the blank cells under it on row 1+.
            if (node.style.noSelect) {
                var boxX = Math.floor(x);
                var fromEdge = node.style.noSelect === 'from-left-edge';
                output.noSelect({
                    x: fromEdge ? 0 : boxX,
                    y: Math.floor(y),
                    width: fromEdge ? boxX + Math.floor(width) : Math.floor(width),
                    height: Math.floor(height),
                });
            }
            var overflowX = (_d = node.style.overflowX) !== null && _d !== void 0 ? _d : node.style.overflow;
            var overflowY = (_e = node.style.overflowY) !== null && _e !== void 0 ? _e : node.style.overflow;
            var clipHorizontally = overflowX === 'hidden' || overflowX === 'scroll';
            var clipVertically = overflowY === 'hidden' || overflowY === 'scroll';
            var isScrollY = overflowY === 'scroll';
            var needsClip = clipHorizontally || clipVertically;
            var y1 = void 0;
            var y2 = void 0;
            if (needsClip) {
                var x1 = clipHorizontally
                    ? x + yogaNode.getComputedBorder(node_js_1.LayoutEdge.Left)
                    : undefined;
                var x2 = clipHorizontally
                    ? x +
                        yogaNode.getComputedWidth() -
                        yogaNode.getComputedBorder(node_js_1.LayoutEdge.Right)
                    : undefined;
                y1 = clipVertically
                    ? y + yogaNode.getComputedBorder(node_js_1.LayoutEdge.Top)
                    : undefined;
                y2 = clipVertically
                    ? y +
                        yogaNode.getComputedHeight() -
                        yogaNode.getComputedBorder(node_js_1.LayoutEdge.Bottom)
                    : undefined;
                output.clip({ x1: x1, x2: x2, y1: y1, y2: y2 });
            }
            if (isScrollY) {
                // Scroll containers follow the ScrollBox component structure:
                // a single content-wrapper child with flexShrink:0 (doesn't shrink
                // to fit), whose children are the scrollable items. scrollHeight
                // comes from the wrapper's intrinsic Yoga height. The wrapper is
                // rendered with its Y translated by -scrollTop; its children are
                // culled against the visible window.
                var padTop = yogaNode.getComputedPadding(node_js_1.LayoutEdge.Top);
                var innerHeight_1 = Math.max(0, (y2 !== null && y2 !== void 0 ? y2 : y + height) -
                    (y1 !== null && y1 !== void 0 ? y1 : y) -
                    padTop -
                    yogaNode.getComputedPadding(node_js_1.LayoutEdge.Bottom));
                var content = node.childNodes.find(function (c) { return c.yogaNode; });
                var contentYoga = content === null || content === void 0 ? void 0 : content.yogaNode;
                // scrollHeight is the intrinsic height of the content wrapper.
                // Do NOT add getComputedTop() — that's the wrapper's offset
                // within the viewport (equal to the scroll container's
                // paddingTop), and innerHeight already subtracts padding, so
                // including it double-counts padding and inflates maxScroll.
                var scrollHeight = (_f = contentYoga === null || contentYoga === void 0 ? void 0 : contentYoga.getComputedHeight()) !== null && _f !== void 0 ? _f : 0;
                // Capture previous scroll bounds BEFORE overwriting — the at-bottom
                // follow check compares against last frame's max.
                var prevScrollHeight = (_g = node.scrollHeight) !== null && _g !== void 0 ? _g : scrollHeight;
                var prevInnerHeight = (_h = node.scrollViewportHeight) !== null && _h !== void 0 ? _h : innerHeight_1;
                node.scrollHeight = scrollHeight;
                node.scrollViewportHeight = innerHeight_1;
                // Absolute screen-buffer row where the scrollable area (inside
                // padding) begins. Exposed via ScrollBoxHandle.getViewportTop() so
                // drag-to-scroll can detect when the drag leaves the scroll viewport.
                node.scrollViewportTop = (y1 !== null && y1 !== void 0 ? y1 : y) + padTop;
                var maxScroll = Math.max(0, scrollHeight - innerHeight_1);
                // scrollAnchor: scroll so the anchored element's top is at the
                // viewport top (plus offset). Yoga is FRESH — same calculateLayout
                // pass that just produced scrollHeight. Deterministic alternative
                // to scrollTo(N) which bakes a number that's stale by the throttled
                // render; the element ref defers the read to now. One-shot snap.
                // A prior eased-seek version (proportional drain over ~5 frames)
                // moved scrollTop without firing React's notify → parent's quantized
                // store snapshot never updated → StickyTracker got stale range props
                // → firstVisible wrong. Also: SCROLL_MIN_PER_FRAME=4 with snap-at-1
                // ping-ponged forever at delta=2. Smooth needs drain-end notify
                // plumbing; shipping instant first. stickyScroll overrides.
                if (node.scrollAnchor) {
                    var anchorTop = (_j = node.scrollAnchor.el.yogaNode) === null || _j === void 0 ? void 0 : _j.getComputedTop();
                    if (anchorTop != null) {
                        node.scrollTop = anchorTop + node.scrollAnchor.offset;
                        node.pendingScrollDelta = undefined;
                    }
                    node.scrollAnchor = undefined;
                }
                // At-bottom follow. Positional: if scrollTop was at (or past) the
                // previous max, pin to the new max. Scroll away → stop following;
                // scroll back (or scrollToBottom/sticky attr) → resume. The sticky
                // flag is OR'd in for cold start (scrollTop=0 before first layout)
                // and scrollToBottom-from-far-away (flag set before scrollTop moves)
                // — the imperative field takes precedence over the attribute so
                // scrollTo/scrollBy can break stickiness. pendingDelta<0 guard:
                // don't cancel an in-flight scroll-up when content races in.
                // Capture scrollTop before follow so ink.tsx can translate any
                // active text selection by the same delta (native terminal behavior:
                // view keeps scrolling, highlight walks up with the text).
                var scrollTopBeforeFollow = (_k = node.scrollTop) !== null && _k !== void 0 ? _k : 0;
                var sticky = (_l = node.stickyScroll) !== null && _l !== void 0 ? _l : Boolean(node.attributes['stickyScroll']);
                var prevMaxScroll = Math.max(0, prevScrollHeight - prevInnerHeight);
                // Positional check only valid when content grew — virtualization can
                // transiently SHRINK scrollHeight (tail unmount + stale heightCache
                // spacer) making scrollTop >= prevMaxScroll true by artifact, not
                // because the user was at bottom.
                var grew = scrollHeight >= prevScrollHeight;
                var atBottom = sticky || (grew && scrollTopBeforeFollow >= prevMaxScroll);
                if (atBottom && ((_m = node.pendingScrollDelta) !== null && _m !== void 0 ? _m : 0) >= 0) {
                    node.scrollTop = maxScroll;
                    node.pendingScrollDelta = undefined;
                    // Sync flag so useVirtualScroll's isSticky() agrees with positional
                    // state — sticky-broken-but-at-bottom (wheel tremor, click-select
                    // at max) otherwise leaves useVirtualScroll's clamp holding the
                    // viewport short of new streaming content. scrollTo/scrollBy set
                    // false; this restores true, same as scrollToBottom() would.
                    // Only restore when (a) positionally at bottom and (b) the flag
                    // was explicitly broken (===false) by scrollTo/scrollBy. When
                    // undefined (never set by user action) leave it alone — setting it
                    // would make the sticky flag sticky-by-default and lock out
                    // direct scrollTop writes (e.g. the alt-screen-perf test).
                    if (node.stickyScroll === false &&
                        scrollTopBeforeFollow >= prevMaxScroll) {
                        node.stickyScroll = true;
                    }
                }
                var followDelta = ((_o = node.scrollTop) !== null && _o !== void 0 ? _o : 0) - scrollTopBeforeFollow;
                if (followDelta > 0) {
                    var vpTop = (_p = node.scrollViewportTop) !== null && _p !== void 0 ? _p : 0;
                    followScroll = {
                        delta: followDelta,
                        viewportTop: vpTop,
                        viewportBottom: vpTop + innerHeight_1 - 1,
                    };
                }
                // Drain pendingScrollDelta. Native terminals (proportional burst
                // events) use proportional drain; xterm.js (VS Code, sparse events +
                // app-side accel curve) uses adaptive small-step drain. isXtermJs()
                // depends on the async XTVERSION probe, but by the time this runs
                // (pendingScrollDelta is only set by wheel events, >>50ms after
                // startup) the probe has resolved — same timing guarantee the
                // wheel-accel curve relies on.
                var cur = (_q = node.scrollTop) !== null && _q !== void 0 ? _q : 0;
                var pending = node.pendingScrollDelta;
                var cMin = node.scrollClampMin;
                var cMax = node.scrollClampMax;
                var haveClamp = cMin !== undefined && cMax !== undefined;
                if (pending !== undefined && pending !== 0) {
                    // Drain continues even past the clamp — the render-clamp below
                    // holds the VISUAL at the mounted edge regardless. Hard-stopping
                    // here caused stop-start jutter: drain hits edge → pause → React
                    // commits → clamp widens → drain resumes → edge again. Letting
                    // scrollTop advance smoothly while the clamp lags gives continuous
                    // visual scroll at React's commit rate (the clamp catches up each
                    // commit). But THROTTLE the drain when already past the clamp so
                    // scrollTop doesn't race 5000 rows ahead of the mounted range
                    // (slide-cap would then take 200 commits to catch up = long
                    // perceived stall at the edge). Past-clamp drain caps at ~4 rows/
                    // frame, roughly matching React's slide rate so the gap stays
                    // bounded and catch-up is quick once input stops.
                    var pastClamp = haveClamp &&
                        ((pending < 0 && cur < cMin) || (pending > 0 && cur > cMax));
                    var eff = pastClamp ? Math.min(4, innerHeight_1 >> 3) : innerHeight_1;
                    cur += isXtermJsHost()
                        ? drainAdaptive(node, pending, eff)
                        : drainProportional(node, pending, eff);
                }
                else if (pending === 0) {
                    // Opposite scrollBy calls cancelled to zero — clear so we don't
                    // schedule an infinite loop of no-op drain frames.
                    node.pendingScrollDelta = undefined;
                }
                var scrollTop = Math.max(0, Math.min(cur, maxScroll));
                // Virtual-scroll clamp: if scrollTop raced past the currently-mounted
                // range (burst PageUp before React re-renders), render at the EDGE of
                // the mounted children instead of blank spacer. Do NOT write back to
                // node.scrollTop — the clamped value is for this paint only; the real
                // scrollTop stays so React's next commit sees the target and mounts
                // the right range. Not scheduling scrollDrainNode here keeps the
                // clamp passive — React's commit → resetAfterCommit → onRender will
                // paint again with fresh bounds.
                var clamped = haveClamp
                    ? Math.max(cMin, Math.min(scrollTop, cMax))
                    : scrollTop;
                node.scrollTop = scrollTop;
                // Clamp hitting top/bottom consumes any remainder. Set drainPending
                // only after clamp so a wasted no-op frame isn't scheduled.
                if (scrollTop !== cur)
                    node.pendingScrollDelta = undefined;
                if (node.pendingScrollDelta !== undefined)
                    scrollDrainNode = node;
                scrollTop = clamped;
                if (content && contentYoga) {
                    // Compute content wrapper's absolute render position with scroll
                    // offset applied, then render its children with culling.
                    var contentX = x + contentYoga.getComputedLeft();
                    var contentY = y + contentYoga.getComputedTop() - scrollTop;
                    // layoutShifted detection gap: when scrollTop moves by >= viewport
                    // height (batched PageUps, fast wheel), every visible child gets
                    // culled (cache dropped) and every newly-visible child has no
                    // cache — so the children's positionChanged check can't fire.
                    // The content wrapper's cached y (which encodes -scrollTop) is
                    // the only node that survives to witness the scroll.
                    var contentCached = node_cache_js_1.nodeCache.get(content);
                    var hint = null;
                    if (contentCached && contentCached.y !== contentY) {
                        // delta = newScrollTop - oldScrollTop (positive = scrolled down).
                        // Capture a DECSTBM hint if the container itself didn't move
                        // and the shift fits within the viewport — otherwise the full
                        // rewrite is needed anyway, and layoutShifted stays the fallback.
                        var delta = contentCached.y - contentY;
                        var regionTop = Math.floor(y + contentYoga.getComputedTop());
                        var regionBottom = regionTop + innerHeight_1 - 1;
                        if ((cached === null || cached === void 0 ? void 0 : cached.y) === y &&
                            cached.height === height &&
                            innerHeight_1 > 0 &&
                            Math.abs(delta) < innerHeight_1) {
                            hint = { top: regionTop, bottom: regionBottom, delta: delta };
                            scrollHint = hint;
                        }
                        else {
                            layoutShifted = true;
                        }
                    }
                    // Fast path: scroll (hint captured) with usable prevScreen.
                    // Blit prevScreen's scroll region into next.screen, shift in-place
                    // by delta (mirrors DECSTBM), then render ONLY the edge rows. The
                    // nested clip keeps child writes out of stable rows — a tall child
                    // that spans edge+stable still renders but stable cells are
                    // clipped, preserving the blit. Avoids re-rendering every visible
                    // child (expensive for long syntax-highlighted transcripts).
                    //
                    // When content.dirty (e.g. streaming text at the bottom of the
                    // scroll), we still use the fast path — the dirty child is almost
                    // always in the edge rows (the bottom, where new content appears).
                    // After edge rendering, any dirty children in stable rows are
                    // re-rendered in a second pass to avoid showing stale blitted
                    // content.
                    //
                    // Guard: the fast path only handles pure scroll or bottom-append.
                    // Child removal/insertion changes the content height in a way that
                    // doesn't match the scroll delta — fall back to the full path so
                    // removed children don't leave stale cells and shifted siblings
                    // render at their new positions.
                    var scrollHeight_1 = contentYoga.getComputedHeight();
                    var prevHeight = (_r = contentCached === null || contentCached === void 0 ? void 0 : contentCached.height) !== null && _r !== void 0 ? _r : scrollHeight_1;
                    var heightDelta = scrollHeight_1 - prevHeight;
                    var safeForFastPath = !hint ||
                        heightDelta === 0 ||
                        (hint.delta > 0 && heightDelta === hint.delta);
                    // scrollHint is set above when hint is captured. If safeForFastPath
                    // is false the full path renders a next.screen that doesn't match
                    // the DECSTBM shift — emitting DECSTBM leaves stale rows (seen as
                    // content bleeding through during scroll-up + streaming). Clear it.
                    if (!safeForFastPath)
                        scrollHint = null;
                    if (hint && prevScreen && safeForFastPath) {
                        var top_1 = hint.top, bottom = hint.bottom, delta = hint.delta;
                        var w = Math.floor(width);
                        output.blit(prevScreen, Math.floor(x), top_1, w, bottom - top_1 + 1);
                        output.shift(top_1, bottom, delta);
                        // Edge rows: new content entering the viewport.
                        var edgeTop = delta > 0 ? bottom - delta + 1 : top_1;
                        var edgeBottom = delta > 0 ? bottom : top_1 - delta - 1;
                        output.clear({
                            x: Math.floor(x),
                            y: edgeTop,
                            width: w,
                            height: edgeBottom - edgeTop + 1,
                        });
                        output.clip({
                            x1: undefined,
                            x2: undefined,
                            y1: edgeTop,
                            y2: edgeBottom + 1,
                        });
                        // Snapshot dirty children before the first pass — the first
                        // pass clears dirty flags, and edge-spanning children would be
                        // missed by the second pass without this snapshot.
                        var dirtyChildren = content.dirty
                            ? new Set(content.childNodes.filter(function (c) { return c.dirty; }))
                            : null;
                        renderScrolledChildren(content, output, contentX, contentY, hasRemovedChild, undefined, 
                        // Cull to edge in child-local coords (inverse of contentY offset).
                        edgeTop - contentY, edgeBottom + 1 - contentY, boxBackgroundColor, true);
                        output.unclip();
                        // Second pass: re-render children in stable rows whose screen
                        // position doesn't match where the shift put their old pixels.
                        // Covers TWO cases:
                        //   1. Dirty children — their content changed, blitted pixels are
                        //      stale regardless of position.
                        //   2. Clean children BELOW a middle-growth point — when a dirty
                        //      sibling above them grows, their yogaTop increases but
                        //      scrollTop increases by the same amount (sticky), so their
                        //      screenY is CONSTANT. The shift moved their old pixels to
                        //      screenY-delta (wrong); they should stay at screenY. Without
                        //      this, the spinner/tmux-monitor ghost at shifted positions
                        //      during streaming (e.g. triple spinner, pill duplication).
                        //   For bottom-append (the common case), all clean children are
                        //   ABOVE the growth point; their screenY decreased by delta and
                        //   the shift put them at the right place — skipped here, fast
                        //   path preserved.
                        if (dirtyChildren) {
                            var edgeTopLocal = edgeTop - contentY;
                            var edgeBottomLocal = edgeBottom + 1 - contentY;
                            var spaces_1 = ' '.repeat(w);
                            // Track cumulative height change of children iterated so far.
                            // A clean child's yogaTop is unchanged iff this is zero (no
                            // sibling above it grew/shrank/mounted). When zero, the skip
                            // check cached.y−delta === screenY reduces to delta === delta
                            // (tautology) → skip without yoga reads. Restores O(dirty)
                            // that #24536 traded away: for bottom-append the dirty child
                            // is last (all clean children skip); for virtual-scroll range
                            // shift the topSpacer shrink + new-item heights self-balance
                            // to zero before reaching the clean block. Middle-growth
                            // leaves shift non-zero → clean children after the growth
                            // point fall through to yoga + the fine-grained check below,
                            // preserving the ghost-box fix.
                            var cumHeightShift = 0;
                            for (var _v = 0, _w = content.childNodes; _v < _w.length; _v++) {
                                var childNode = _w[_v];
                                var childElem = childNode;
                                var isDirty = dirtyChildren.has(childNode);
                                if (!isDirty && cumHeightShift === 0) {
                                    if (node_cache_js_1.nodeCache.has(childElem))
                                        continue;
                                    // Uncached = culled last frame, now re-entering. blit
                                    // never painted it → fall through to yoga + render.
                                    // Height unchanged (clean), so cumHeightShift stays 0.
                                }
                                var cy = childElem.yogaNode;
                                if (!cy)
                                    continue;
                                var childTop = cy.getComputedTop();
                                var childH = cy.getComputedHeight();
                                var childBottom = childTop + childH;
                                if (isDirty) {
                                    var prev = node_cache_js_1.nodeCache.get(childElem);
                                    cumHeightShift += childH - (prev ? prev.height : 0);
                                }
                                // Skip culled children (outside viewport)
                                if (childBottom <= scrollTop ||
                                    childTop >= scrollTop + innerHeight_1)
                                    continue;
                                // Skip children entirely within edge rows (already rendered)
                                if (childTop >= edgeTopLocal && childBottom <= edgeBottomLocal)
                                    continue;
                                var screenY_1 = Math.floor(contentY + childTop);
                                // Clean children reaching here have cumHeightShift ≠ 0 OR
                                // no cache. Re-check precisely: cached.y − delta is where
                                // the shift left old pixels; if it equals new screenY the
                                // blit is correct (shift re-balanced at this child, or
                                // yogaTop happens to net out). No cache → blit never
                                // painted it → render.
                                if (!isDirty) {
                                    var childCached = node_cache_js_1.nodeCache.get(childElem);
                                    if (childCached &&
                                        Math.floor(childCached.y) - delta === screenY_1) {
                                        continue;
                                    }
                                }
                                // Wipe this child's region with spaces to overwrite stale
                                // blitted content — output.clear() only expands damage and
                                // cannot zero cells that the blit already wrote.
                                var screenBottom = Math.min(Math.floor(contentY + childBottom), Math.floor((y1 !== null && y1 !== void 0 ? y1 : y) + padTop + innerHeight_1));
                                if (screenY_1 < screenBottom) {
                                    var fill = Array(screenBottom - screenY_1)
                                        .fill(spaces_1)
                                        .join('\n');
                                    output.write(Math.floor(x), screenY_1, fill);
                                    output.clip({
                                        x1: undefined,
                                        x2: undefined,
                                        y1: screenY_1,
                                        y2: screenBottom,
                                    });
                                    renderNodeToOutput(childElem, output, {
                                        offsetX: contentX,
                                        offsetY: contentY,
                                        prevScreen: undefined,
                                        inheritedBackgroundColor: boxBackgroundColor,
                                    });
                                    output.unclip();
                                }
                            }
                        }
                        // Third pass: repair rows where shifted copies of absolute
                        // overlays landed. The blit copied prevScreen cells INCLUDING
                        // overlay pixels (overlays render AFTER this ScrollBox so they
                        // painted into prevScreen's scroll region). After shift, those
                        // pixels sit at (rect.y - delta) — neither edge render nor the
                        // overlay's own re-render covers them. Wipe and re-render
                        // ScrollBox content so the diff writes correct cells.
                        var spaces = absoluteRectsPrev.length ? ' '.repeat(w) : '';
                        for (var _x = 0, absoluteRectsPrev_1 = absoluteRectsPrev; _x < absoluteRectsPrev_1.length; _x++) {
                            var r = absoluteRectsPrev_1[_x];
                            if (r.y >= bottom + 1 || r.y + r.height <= top_1)
                                continue;
                            var shiftedTop = Math.max(top_1, Math.floor(r.y) - delta);
                            var shiftedBottom = Math.min(bottom + 1, Math.floor(r.y + r.height) - delta);
                            // Skip if entirely within edge rows (already rendered).
                            if (shiftedTop >= edgeTop && shiftedBottom <= edgeBottom + 1)
                                continue;
                            if (shiftedTop >= shiftedBottom)
                                continue;
                            var fill = Array(shiftedBottom - shiftedTop)
                                .fill(spaces)
                                .join('\n');
                            output.write(Math.floor(x), shiftedTop, fill);
                            output.clip({
                                x1: undefined,
                                x2: undefined,
                                y1: shiftedTop,
                                y2: shiftedBottom,
                            });
                            renderScrolledChildren(content, output, contentX, contentY, hasRemovedChild, undefined, shiftedTop - contentY, shiftedBottom - contentY, boxBackgroundColor, true);
                            output.unclip();
                        }
                    }
                    else {
                        // Full path. Two sub-cases:
                        //
                        // Scrolled without a usable hint (big jump, container moved):
                        // child positions in prevScreen are stale. Clear the viewport
                        // and disable blit so children don't restore shifted content.
                        //
                        // No scroll (spinner tick, content edit): child positions in
                        // prevScreen are still valid. Skip the viewport clear and pass
                        // prevScreen so unchanged children blit. Dirty children already
                        // self-clear via their own cached-rect clear. Without this, a
                        // spinner inside ScrollBox forces a full-content rewrite every
                        // frame — on wide terminals over tmux (no BSU/ESU) the
                        // bandwidth crosses the chunk boundary and the frame tears.
                        var scrolled = contentCached && contentCached.y !== contentY;
                        if (scrolled && y1 !== undefined && y2 !== undefined) {
                            output.clear({
                                x: Math.floor(x),
                                y: Math.floor(y1),
                                width: Math.floor(width),
                                height: Math.floor(y2 - y1),
                            });
                        }
                        // positionChanged (ScrollBox height shrunk — pill mount) means a
                        // child spanning the old bottom edge would blit its full cached
                        // rect past the new clip. output.ts clips blits now, but also
                        // disable prevScreen here so the partial-row child re-renders at
                        // correct bounds instead of blitting a clipped (truncated) old
                        // rect.
                        renderScrolledChildren(content, output, contentX, contentY, hasRemovedChild, scrolled || positionChanged ? undefined : prevScreen, scrollTop, scrollTop + innerHeight_1, boxBackgroundColor);
                    }
                    node_cache_js_1.nodeCache.set(content, {
                        x: contentX,
                        y: contentY,
                        width: contentYoga.getComputedWidth(),
                        height: contentYoga.getComputedHeight(),
                    });
                    content.dirty = false;
                }
            }
            else {
                // Fill interior with background color before rendering children.
                // This covers padding areas and empty space; child text inherits
                // the color via inheritedBackgroundColor so written cells also
                // get the background.
                // Disable prevScreen for children: the fill overwrites the entire
                // interior each render, so child blits from prevScreen would restore
                // stale cells (wrong bg if it changed) on top of the fresh fill.
                var ownBackgroundColor = node.style.backgroundColor;
                if (ownBackgroundColor || node.style.opaque) {
                    var borderLeft = yogaNode.getComputedBorder(node_js_1.LayoutEdge.Left);
                    var borderRight = yogaNode.getComputedBorder(node_js_1.LayoutEdge.Right);
                    var borderTop = yogaNode.getComputedBorder(node_js_1.LayoutEdge.Top);
                    var borderBottom = yogaNode.getComputedBorder(node_js_1.LayoutEdge.Bottom);
                    var innerWidth_1 = Math.floor(width) - borderLeft - borderRight;
                    var innerHeight_2 = Math.floor(height) - borderTop - borderBottom;
                    if (innerWidth_1 > 0 && innerHeight_2 > 0) {
                        var spaces = ' '.repeat(innerWidth_1);
                        var fillLine = ownBackgroundColor
                            ? (0, colorize_js_1.applyTextStyles)(spaces, { backgroundColor: ownBackgroundColor })
                            : spaces;
                        var fill = Array(innerHeight_2).fill(fillLine).join('\n');
                        output.write(x + borderLeft, y + borderTop, fill);
                    }
                }
                renderChildren(node, output, x, y, hasRemovedChild, 
                // backgroundColor and opaque both disable child blit: the fill
                // overwrites the entire interior each render, so any child whose
                // layout position shifted would blit stale cells from prevScreen
                // on top of the fresh fill. Previously opaque kept blit enabled
                // on the assumption that plain-space fill + unchanged children =
                // valid composite, but children CAN reposition (ScrollBox remeasure
                // on re-render → /permissions body blanked on Down arrow, #25436).
                ownBackgroundColor || node.style.opaque ? undefined : prevScreen, boxBackgroundColor);
            }
            if (needsClip) {
                output.unclip();
            }
            // Render border AFTER children to ensure it's not overwritten by child
            // clearing operations. When a child shrinks, it clears its old area,
            // which may overlap with where the parent's border now is.
            (0, render_border_js_1.default)(x, y, node, output);
        }
        else if (node.nodeName === 'ink-root') {
            renderChildren(node, output, x, y, hasRemovedChild, prevScreen, inheritedBackgroundColor);
        }
        // Cache layout bounds for dirty tracking
        var rect = { x: x, y: y, width: width, height: height, top: yogaTop };
        node_cache_js_1.nodeCache.set(node, rect);
        if (node.style.position === 'absolute') {
            absoluteRectsCur.push(rect);
        }
        node.dirty = false;
    }
}
// Overflow contamination: content overflows right/down, so clean siblings
// AFTER a dirty/removed sibling can contain stale overflow in prevScreen.
// Disable blit for siblings after a dirty child — but still pass prevScreen
// TO the dirty child itself so its clean descendants can blit. The dirty
// child's own blit check already fails (node.dirty=true at line 216), so
// passing prevScreen only benefits its subtree.
// For removed children we don't know their original position, so
// conservatively disable blit for all.
//
// Clipped children (overflow hidden/scroll on both axes) cannot overflow
// onto later siblings — their content is confined to their layout bounds.
// Skip the contamination guard for them so later siblings can still blit.
// Without this, a spinner inside a ScrollBox dirties the wrapper on every
// tick and the bottom prompt section never blits → 100% writes every frame.
//
// Exception: absolute-positioned clipped children may have layout bounds
// that overlap arbitrary siblings, so the clipping does not help.
//
// Overlap contamination (seenDirtyClipped): a later ABSOLUTE sibling whose
// rect sits inside a dirty clipped child's bounds would blit stale cells
// from prevScreen — the clipped child just rewrote those cells this frame.
// The clipsBothAxes skip only protects against OVERFLOW (clipped child
// painting outside its bounds), not overlap (absolute sibling painting
// inside them). For non-opaque absolute siblings, skipSelfBlit forces
// descent (the full-width rect has transparent gaps → stale blit) while
// still passing prevScreen so opaque descendants can blit their narrower
// rects (NewMessagesPill's inner Text with backgroundColor). Opaque
// absolute siblings fill their entire rect — direct blit is safe.
function renderChildren(node, output, offsetX, offsetY, hasRemovedChild, prevScreen, inheritedBackgroundColor) {
    var seenDirtyChild = false;
    var seenDirtyClipped = false;
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var childNode = _a[_i];
        var childElem = childNode;
        // Capture dirty before rendering — renderNodeToOutput clears the flag
        var wasDirty = childElem.dirty;
        var isAbsolute = childElem.style.position === 'absolute';
        renderNodeToOutput(childElem, output, {
            offsetX: offsetX,
            offsetY: offsetY,
            prevScreen: hasRemovedChild || seenDirtyChild ? undefined : prevScreen,
            // Short-circuits on seenDirtyClipped (false in the common case) so
            // the opaque/bg reads don't happen per-child per-frame.
            skipSelfBlit: seenDirtyClipped &&
                isAbsolute &&
                !childElem.style.opaque &&
                childElem.style.backgroundColor === undefined,
            inheritedBackgroundColor: inheritedBackgroundColor,
        });
        if (wasDirty && !seenDirtyChild) {
            if (!clipsBothAxes(childElem) || isAbsolute) {
                seenDirtyChild = true;
            }
            else {
                seenDirtyClipped = true;
            }
        }
    }
}
function clipsBothAxes(node) {
    var _a, _b;
    var ox = (_a = node.style.overflowX) !== null && _a !== void 0 ? _a : node.style.overflow;
    var oy = (_b = node.style.overflowY) !== null && _b !== void 0 ? _b : node.style.overflow;
    return ((ox === 'hidden' || ox === 'scroll') && (oy === 'hidden' || oy === 'scroll'));
}
// When Yoga squeezes a box to h=0, the ghost only happens if a sibling
// lands at the same computed top — then both write to that row and the
// shorter content leaves the longer's tail visible. Yoga's pixel-grid
// rounding can give h=0 while still advancing the next sibling's top
// (HelpV2's third shortcuts column), so h=0 alone isn't sufficient.
function siblingSharesY(node, yogaNode) {
    var parent = node.parentNode;
    if (!parent)
        return false;
    var myTop = yogaNode.getComputedTop();
    var siblings = parent.childNodes;
    var idx = siblings.indexOf(node);
    for (var i = idx + 1; i < siblings.length; i++) {
        var sib = siblings[i].yogaNode;
        if (!sib)
            continue;
        return sib.getComputedTop() === myTop;
    }
    // No next sibling with a yoga node — check previous. A run of h=0 boxes
    // at the tail would all share y with each other.
    for (var i = idx - 1; i >= 0; i--) {
        var sib = siblings[i].yogaNode;
        if (!sib)
            continue;
        return sib.getComputedTop() === myTop;
    }
    return false;
}
// When a node blits, its absolute-positioned descendants that paint outside
// the node's layout bounds are NOT covered by the blit (which only copies
// the node's own rect). If a dirty sibling re-rendered and overwrote those
// cells, we must re-blit them from prevScreen so the overlays survive.
// Example: PromptInputFooter's slash menu uses position='absolute' bottom='100%'
// to float above the prompt; a spinner tick in the ScrollBox above re-renders
// and overwrites those cells. Without this, the menu vanishes on the next frame.
function blitEscapingAbsoluteDescendants(node, output, prevScreen, px, py, pw, ph) {
    var pr = px + pw;
    var pb = py + ph;
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName === '#text')
            continue;
        var elem = child;
        if (elem.style.position === 'absolute') {
            var cached = node_cache_js_1.nodeCache.get(elem);
            if (cached) {
                absoluteRectsCur.push(cached);
                var cx = Math.floor(cached.x);
                var cy = Math.floor(cached.y);
                var cw = Math.floor(cached.width);
                var ch = Math.floor(cached.height);
                // Only blit rects that extend outside the parent's layout bounds —
                // cells within the parent rect are already covered by the parent blit.
                if (cx < px || cy < py || cx + cw > pr || cy + ch > pb) {
                    output.blit(prevScreen, cx, cy, cw, ch);
                }
            }
        }
        // Recurse — absolute descendants can be nested arbitrarily deep
        blitEscapingAbsoluteDescendants(elem, output, prevScreen, px, py, pw, ph);
    }
}
// Render children of a scroll container with viewport culling.
// scrollTopY..scrollBottomY are the visible window in CHILD-LOCAL Yoga coords
// (i.e. what getComputedTop() returns). Children entirely outside this window
// are skipped; their nodeCache entry is deleted so if they re-enter the
// viewport later they don't emit a stale clear for a position now occupied
// by a sibling.
function renderScrolledChildren(node, output, offsetX, offsetY, hasRemovedChild, prevScreen, scrollTopY, scrollBottomY, inheritedBackgroundColor, 
// When true (DECSTBM fast path), culled children keep their cache —
// the blit+shift put stable rows in next.screen so stale cache is
// never read. Avoids walking O(total_children * subtree_depth) per frame.
preserveCulledCache) {
    if (preserveCulledCache === void 0) { preserveCulledCache = false; }
    var seenDirtyChild = false;
    // Track cumulative height shift of dirty children iterated so far. When
    // zero, a clean child's yogaTop is unchanged (no sibling above it grew),
    // so cached.top is fresh and the cull check skips yoga. Bottom-append
    // has the dirty child last → all prior clean children hit cache →
    // O(dirty) not O(mounted). Middle-growth leaves shift non-zero after
    // the dirty child → subsequent children yoga-read (needed for correct
    // culling since their yogaTop shifted).
    var cumHeightShift = 0;
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var childNode = _a[_i];
        var childElem = childNode;
        var cy = childElem.yogaNode;
        if (cy) {
            var cached = node_cache_js_1.nodeCache.get(childElem);
            var top_2 = void 0;
            var height = void 0;
            if ((cached === null || cached === void 0 ? void 0 : cached.top) !== undefined &&
                !childElem.dirty &&
                cumHeightShift === 0) {
                top_2 = cached.top;
                height = cached.height;
            }
            else {
                top_2 = cy.getComputedTop();
                height = cy.getComputedHeight();
                if (childElem.dirty) {
                    cumHeightShift += height - (cached ? cached.height : 0);
                }
                // Refresh cached top so next frame's cumShift===0 path stays
                // correct. For culled children with preserveCulledCache=true this
                // is the ONLY refresh point — without it, a middle-growth frame
                // leaves stale tops that misfire next frame.
                if (cached)
                    cached.top = top_2;
            }
            var bottom = top_2 + height;
            if (bottom <= scrollTopY || top_2 >= scrollBottomY) {
                // Culled — outside visible window. Drop stale cache entries from
                // the subtree so when this child re-enters it doesn't fire clears
                // at positions now occupied by siblings. The viewport-clear on
                // scroll-change handles the visible-area repaint.
                if (!preserveCulledCache)
                    dropSubtreeCache(childElem);
                continue;
            }
        }
        var wasDirty = childElem.dirty;
        renderNodeToOutput(childElem, output, {
            offsetX: offsetX,
            offsetY: offsetY,
            prevScreen: hasRemovedChild || seenDirtyChild ? undefined : prevScreen,
            inheritedBackgroundColor: inheritedBackgroundColor,
        });
        if (wasDirty) {
            seenDirtyChild = true;
        }
    }
}
function dropSubtreeCache(node) {
    node_cache_js_1.nodeCache.delete(node);
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName !== '#text') {
            dropSubtreeCache(child);
        }
    }
}
exports.default = renderNodeToOutput;
