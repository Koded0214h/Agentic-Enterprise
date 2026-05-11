"use strict";
/**
 * Pure-TypeScript port of yoga-layout (Meta's flexbox engine).
 *
 * This matches the `yoga-layout/load` API surface used by src/ink/layout/yoga.ts.
 * The upstream C++ source is ~2500 lines in CalculateLayout.cpp alone; this port
 * is a simplified single-pass flexbox implementation that covers the subset of
 * features Ink actually uses:
 *   - flex-direction (row/column + reverse)
 *   - flex-grow / flex-shrink / flex-basis
 *   - align-items / align-self (stretch, flex-start, center, flex-end)
 *   - justify-content (all six values)
 *   - margin / padding / border / gap
 *   - width / height / min / max (point, percent, auto)
 *   - position: relative / absolute
 *   - display: flex / none
 *   - measure functions (for text nodes)
 *
 * Also implemented for spec parity (not used by Ink):
 *   - margin: auto (main + cross axis, overrides justify/align)
 *   - multi-pass flex clamping when children hit min/max constraints
 *   - flex-grow/shrink against container min/max when size is indefinite
 *
 * Also implemented for spec parity (not used by Ink):
 *   - flex-wrap: wrap / wrap-reverse (multi-line flex)
 *   - align-content (positions wrapped lines on cross axis)
 *
 * Also implemented for spec parity (not used by Ink):
 *   - display: contents (children lifted to grandparent, box removed)
 *
 * Also implemented for spec parity (not used by Ink):
 *   - baseline alignment (align-items/align-self: baseline)
 *
 * Not implemented (not used by Ink):
 *   - aspect-ratio
 *   - box-sizing: content-box
 *   - RTL direction (Ink always passes Direction.LTR)
 *
 * Upstream: https://github.com/facebook/yoga
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.Wrap = exports.Unit = exports.PositionType = exports.Overflow = exports.MeasureMode = exports.Justify = exports.Gutter = exports.FlexDirection = exports.ExperimentalFeature = exports.Errata = exports.Edge = exports.Display = exports.Direction = exports.Dimension = exports.BoxSizing = exports.Align = void 0;
exports.getYogaCounters = getYogaCounters;
exports.loadYoga = loadYoga;
var enums_js_1 = require("./enums.js");
Object.defineProperty(exports, "Align", { enumerable: true, get: function () { return enums_js_1.Align; } });
Object.defineProperty(exports, "BoxSizing", { enumerable: true, get: function () { return enums_js_1.BoxSizing; } });
Object.defineProperty(exports, "Dimension", { enumerable: true, get: function () { return enums_js_1.Dimension; } });
Object.defineProperty(exports, "Direction", { enumerable: true, get: function () { return enums_js_1.Direction; } });
Object.defineProperty(exports, "Display", { enumerable: true, get: function () { return enums_js_1.Display; } });
Object.defineProperty(exports, "Edge", { enumerable: true, get: function () { return enums_js_1.Edge; } });
Object.defineProperty(exports, "Errata", { enumerable: true, get: function () { return enums_js_1.Errata; } });
Object.defineProperty(exports, "ExperimentalFeature", { enumerable: true, get: function () { return enums_js_1.ExperimentalFeature; } });
Object.defineProperty(exports, "FlexDirection", { enumerable: true, get: function () { return enums_js_1.FlexDirection; } });
Object.defineProperty(exports, "Gutter", { enumerable: true, get: function () { return enums_js_1.Gutter; } });
Object.defineProperty(exports, "Justify", { enumerable: true, get: function () { return enums_js_1.Justify; } });
Object.defineProperty(exports, "MeasureMode", { enumerable: true, get: function () { return enums_js_1.MeasureMode; } });
Object.defineProperty(exports, "Overflow", { enumerable: true, get: function () { return enums_js_1.Overflow; } });
Object.defineProperty(exports, "PositionType", { enumerable: true, get: function () { return enums_js_1.PositionType; } });
Object.defineProperty(exports, "Unit", { enumerable: true, get: function () { return enums_js_1.Unit; } });
Object.defineProperty(exports, "Wrap", { enumerable: true, get: function () { return enums_js_1.Wrap; } });
var UNDEFINED_VALUE = { unit: enums_js_1.Unit.Undefined, value: NaN };
var AUTO_VALUE = { unit: enums_js_1.Unit.Auto, value: NaN };
function pointValue(v) {
    return { unit: enums_js_1.Unit.Point, value: v };
}
function percentValue(v) {
    return { unit: enums_js_1.Unit.Percent, value: v };
}
function resolveValue(v, ownerSize) {
    switch (v.unit) {
        case enums_js_1.Unit.Point:
            return v.value;
        case enums_js_1.Unit.Percent:
            return isNaN(ownerSize) ? NaN : (v.value * ownerSize) / 100;
        default:
            return NaN;
    }
}
function isDefined(n) {
    return !isNaN(n);
}
// NaN-safe equality for layout-cache input comparison
function sameFloat(a, b) {
    return a === b || (a !== a && b !== b);
}
function defaultStyle() {
    return {
        direction: enums_js_1.Direction.Inherit,
        flexDirection: enums_js_1.FlexDirection.Column,
        justifyContent: enums_js_1.Justify.FlexStart,
        alignItems: enums_js_1.Align.Stretch,
        alignSelf: enums_js_1.Align.Auto,
        alignContent: enums_js_1.Align.FlexStart,
        flexWrap: enums_js_1.Wrap.NoWrap,
        overflow: enums_js_1.Overflow.Visible,
        display: enums_js_1.Display.Flex,
        positionType: enums_js_1.PositionType.Relative,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: AUTO_VALUE,
        margin: new Array(9).fill(UNDEFINED_VALUE),
        padding: new Array(9).fill(UNDEFINED_VALUE),
        border: new Array(9).fill(UNDEFINED_VALUE),
        position: new Array(9).fill(UNDEFINED_VALUE),
        gap: new Array(3).fill(UNDEFINED_VALUE),
        width: AUTO_VALUE,
        height: AUTO_VALUE,
        minWidth: UNDEFINED_VALUE,
        minHeight: UNDEFINED_VALUE,
        maxWidth: UNDEFINED_VALUE,
        maxHeight: UNDEFINED_VALUE,
    };
}
// --
// Edge resolution — yoga's 9-edge model collapsed to 4 physical edges
var EDGE_LEFT = 0;
var EDGE_TOP = 1;
var EDGE_RIGHT = 2;
var EDGE_BOTTOM = 3;
function resolveEdge(edges, physicalEdge, ownerSize, 
// For margin/position we allow auto; for padding/border auto resolves to 0
allowAuto) {
    if (allowAuto === void 0) { allowAuto = false; }
    // Precedence: specific edge > horizontal/vertical > all
    var v = edges[physicalEdge];
    if (v.unit === enums_js_1.Unit.Undefined) {
        if (physicalEdge === EDGE_LEFT || physicalEdge === EDGE_RIGHT) {
            v = edges[enums_js_1.Edge.Horizontal];
        }
        else {
            v = edges[enums_js_1.Edge.Vertical];
        }
    }
    if (v.unit === enums_js_1.Unit.Undefined) {
        v = edges[enums_js_1.Edge.All];
    }
    // Start/End map to Left/Right for LTR (Ink is always LTR)
    if (v.unit === enums_js_1.Unit.Undefined) {
        if (physicalEdge === EDGE_LEFT)
            v = edges[enums_js_1.Edge.Start];
        if (physicalEdge === EDGE_RIGHT)
            v = edges[enums_js_1.Edge.End];
    }
    if (v.unit === enums_js_1.Unit.Undefined)
        return 0;
    if (v.unit === enums_js_1.Unit.Auto)
        return allowAuto ? NaN : 0;
    return resolveValue(v, ownerSize);
}
function resolveEdgeRaw(edges, physicalEdge) {
    var v = edges[physicalEdge];
    if (v.unit === enums_js_1.Unit.Undefined) {
        if (physicalEdge === EDGE_LEFT || physicalEdge === EDGE_RIGHT) {
            v = edges[enums_js_1.Edge.Horizontal];
        }
        else {
            v = edges[enums_js_1.Edge.Vertical];
        }
    }
    if (v.unit === enums_js_1.Unit.Undefined)
        v = edges[enums_js_1.Edge.All];
    if (v.unit === enums_js_1.Unit.Undefined) {
        if (physicalEdge === EDGE_LEFT)
            v = edges[enums_js_1.Edge.Start];
        if (physicalEdge === EDGE_RIGHT)
            v = edges[enums_js_1.Edge.End];
    }
    return v;
}
function isMarginAuto(edges, physicalEdge) {
    return resolveEdgeRaw(edges, physicalEdge).unit === enums_js_1.Unit.Auto;
}
// Setter helpers for the _hasAutoMargin / _hasPosition fast-path flags.
// Unit.Undefined = 0, Unit.Auto = 3.
function hasAnyAutoEdge(edges) {
    for (var i = 0; i < 9; i++)
        if (edges[i].unit === 3)
            return true;
    return false;
}
function hasAnyDefinedEdge(edges) {
    for (var i = 0; i < 9; i++)
        if (edges[i].unit !== 0)
            return true;
    return false;
}
// Hot path: resolve all 4 physical edges in one pass, writing into `out`.
// Equivalent to calling resolveEdge() 4× with allowAuto=false, but hoists the
// shared fallback lookups (Horizontal/Vertical/All/Start/End) and avoids
// allocating a fresh 4-array on every layoutNode() call.
function resolveEdges4Into(edges, ownerSize, out) {
    // Hoist fallbacks once — the 4 per-edge chains share these reads.
    var eH = edges[6]; // Edge.Horizontal
    var eV = edges[7]; // Edge.Vertical
    var eA = edges[8]; // Edge.All
    var eS = edges[4]; // Edge.Start
    var eE = edges[5]; // Edge.End
    var pctDenom = isNaN(ownerSize) ? NaN : ownerSize / 100;
    // Left: edges[0] → Horizontal → All → Start
    var v = edges[0];
    if (v.unit === 0)
        v = eH;
    if (v.unit === 0)
        v = eA;
    if (v.unit === 0)
        v = eS;
    out[0] = v.unit === 1 ? v.value : v.unit === 2 ? v.value * pctDenom : 0;
    // Top: edges[1] → Vertical → All
    v = edges[1];
    if (v.unit === 0)
        v = eV;
    if (v.unit === 0)
        v = eA;
    out[1] = v.unit === 1 ? v.value : v.unit === 2 ? v.value * pctDenom : 0;
    // Right: edges[2] → Horizontal → All → End
    v = edges[2];
    if (v.unit === 0)
        v = eH;
    if (v.unit === 0)
        v = eA;
    if (v.unit === 0)
        v = eE;
    out[2] = v.unit === 1 ? v.value : v.unit === 2 ? v.value * pctDenom : 0;
    // Bottom: edges[3] → Vertical → All
    v = edges[3];
    if (v.unit === 0)
        v = eV;
    if (v.unit === 0)
        v = eA;
    out[3] = v.unit === 1 ? v.value : v.unit === 2 ? v.value * pctDenom : 0;
}
// --
// Axis helpers
function isRow(dir) {
    return dir === enums_js_1.FlexDirection.Row || dir === enums_js_1.FlexDirection.RowReverse;
}
function isReverse(dir) {
    return dir === enums_js_1.FlexDirection.RowReverse || dir === enums_js_1.FlexDirection.ColumnReverse;
}
function crossAxis(dir) {
    return isRow(dir) ? enums_js_1.FlexDirection.Column : enums_js_1.FlexDirection.Row;
}
function leadingEdge(dir) {
    switch (dir) {
        case enums_js_1.FlexDirection.Row:
            return EDGE_LEFT;
        case enums_js_1.FlexDirection.RowReverse:
            return EDGE_RIGHT;
        case enums_js_1.FlexDirection.Column:
            return EDGE_TOP;
        case enums_js_1.FlexDirection.ColumnReverse:
            return EDGE_BOTTOM;
    }
}
function trailingEdge(dir) {
    switch (dir) {
        case enums_js_1.FlexDirection.Row:
            return EDGE_RIGHT;
        case enums_js_1.FlexDirection.RowReverse:
            return EDGE_LEFT;
        case enums_js_1.FlexDirection.Column:
            return EDGE_BOTTOM;
        case enums_js_1.FlexDirection.ColumnReverse:
            return EDGE_TOP;
    }
}
function createConfig() {
    var config = {
        pointScaleFactor: 1,
        errata: enums_js_1.Errata.None,
        useWebDefaults: false,
        free: function () { },
        isExperimentalFeatureEnabled: function () {
            return false;
        },
        setExperimentalFeatureEnabled: function () { },
        setPointScaleFactor: function (f) {
            config.pointScaleFactor = f;
        },
        getErrata: function () {
            return config.errata;
        },
        setErrata: function (e) {
            config.errata = e;
        },
        setUseWebDefaults: function (v) {
            config.useWebDefaults = v;
        },
    };
    return config;
}
// --
// Node implementation
var Node = /** @class */ (function () {
    function Node(config) {
        // Per-layout scratch (not public API)
        this._flexBasis = 0;
        this._mainSize = 0;
        this._crossSize = 0;
        this._lineIndex = 0;
        // Fast-path flags maintained by style setters. Per CPU profile, the
        // positioning loop calls isMarginAuto 6× and resolveEdgeRaw(position) 4×
        // per child per layout pass — ~11k calls for the 1000-node bench, nearly
        // all of which return false/undefined since most nodes have no auto
        // margins and no position insets. These flags let us skip straight to
        // the common case with a single branch.
        this._hasAutoMargin = false;
        this._hasPosition = false;
        // Same pattern for the 3× resolveEdges4Into calls at the top of every
        // layoutNode(). In the 1000-node bench ~67% of those calls operate on
        // all-undefined edge arrays (most nodes have no border; only cols have
        // padding; only leaf cells have margin) — a single-branch skip beats
        // ~20 property reads + ~15 compares + 4 writes of zeros.
        this._hasPadding = false;
        this._hasBorder = false;
        this._hasMargin = false;
        // -- Dirty-flag layout cache. Mirrors upstream CalculateLayout.cpp's
        // layoutNodeInternal: skip a subtree entirely when it's clean and we're
        // asking the same question we cached the answer to. Two slots since
        // each node typically sees a measure call (performLayout=false, from
        // computeFlexBasis) followed by a layout call (performLayout=true) with
        // different inputs per parent pass — a single slot thrashes. Re-layout
        // bench (dirty one leaf, recompute root) went 2.7x→1.1x with this:
        // clean siblings skip straight through, only the dirty chain recomputes.
        this._lW = NaN;
        this._lH = NaN;
        this._lWM = 0;
        this._lHM = 0;
        this._lOW = NaN;
        this._lOH = NaN;
        this._lFW = false;
        this._lFH = false;
        // _hasL stores INPUTS early (before compute) but layout.width/height are
        // mutated by the multi-entry cache and by subsequent compute calls with
        // different inputs. Without storing OUTPUTS, a _hasL hit returns whatever
        // layout.width/height happened to be left by the last call — the scrollbox
        // vpH=33→2624 bug. Store + restore outputs like the multi-entry cache does.
        this._lOutW = NaN;
        this._lOutH = NaN;
        this._hasL = false;
        this._mW = NaN;
        this._mH = NaN;
        this._mWM = 0;
        this._mHM = 0;
        this._mOW = NaN;
        this._mOH = NaN;
        this._mOutW = NaN;
        this._mOutH = NaN;
        this._hasM = false;
        // Cached computeFlexBasis result. For clean children, basis only depends
        // on the container's inner dimensions — if those haven't changed, skip the
        // layoutNode(performLayout=false) recursion entirely. This is the hot path
        // for scroll: 500-message content container is dirty, its 499 clean
        // children each get measured ~20× as the dirty chain's measure/layout
        // passes cascade. Basis cache short-circuits at the child boundary.
        this._fbBasis = NaN;
        this._fbOwnerW = NaN;
        this._fbOwnerH = NaN;
        this._fbAvailMain = NaN;
        this._fbAvailCross = NaN;
        this._fbCrossMode = 0;
        // Generation at which _fbBasis was written. Dirty nodes from a PREVIOUS
        // generation have stale cache (subtree changed), but within the SAME
        // generation the cache is fresh — the dirty chain's measure→layout
        // cascade invokes computeFlexBasis ≥2^depth times per calculateLayout on
        // fresh-mounted items, and the subtree doesn't change between calls.
        // Gating on generation instead of isDirty_ lets fresh mounts (virtual
        // scroll) cache-hit after first compute: 105k visits → ~10k.
        this._fbGen = -1;
        // Multi-entry layout cache — stores (inputs → computed w,h) so hits with
        // different inputs than _hasL can restore the right dimensions. Upstream
        // yoga uses 16; 4 covers Ink's dirty-chain depth. Packed as flat arrays
        // to avoid per-entry object allocs. Slot i uses indices [i*8, i*8+8) in
        // _cIn (aW,aH,wM,hM,oW,oH,fW,fH) and [i*2, i*2+2) in _cOut (w,h).
        this._cIn = null;
        this._cOut = null;
        this._cGen = -1;
        this._cN = 0;
        this._cWr = 0;
        this.style = defaultStyle();
        this.layout = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            border: [0, 0, 0, 0],
            padding: [0, 0, 0, 0],
            margin: [0, 0, 0, 0],
        };
        this.parent = null;
        this.children = [];
        this.measureFunc = null;
        this.config = config !== null && config !== void 0 ? config : DEFAULT_CONFIG;
        this.isDirty_ = true;
        this.isReferenceBaseline_ = false;
        _yogaLiveNodes++;
    }
    // -- Tree
    Node.prototype.insertChild = function (child, index) {
        child.parent = this;
        this.children.splice(index, 0, child);
        this.markDirty();
    };
    Node.prototype.removeChild = function (child) {
        var idx = this.children.indexOf(child);
        if (idx >= 0) {
            this.children.splice(idx, 1);
            child.parent = null;
            this.markDirty();
        }
    };
    Node.prototype.getChild = function (index) {
        return this.children[index];
    };
    Node.prototype.getChildCount = function () {
        return this.children.length;
    };
    Node.prototype.getParent = function () {
        return this.parent;
    };
    // -- Lifecycle
    Node.prototype.free = function () {
        this.parent = null;
        this.children = [];
        this.measureFunc = null;
        this._cIn = null;
        this._cOut = null;
        _yogaLiveNodes--;
    };
    Node.prototype.freeRecursive = function () {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var c = _a[_i];
            c.freeRecursive();
        }
        this.free();
    };
    Node.prototype.reset = function () {
        this.style = defaultStyle();
        this.children = [];
        this.parent = null;
        this.measureFunc = null;
        this.isDirty_ = true;
        this._hasAutoMargin = false;
        this._hasPosition = false;
        this._hasPadding = false;
        this._hasBorder = false;
        this._hasMargin = false;
        this._hasL = false;
        this._hasM = false;
        this._cN = 0;
        this._cWr = 0;
        this._fbBasis = NaN;
    };
    // -- Dirty tracking
    Node.prototype.markDirty = function () {
        this.isDirty_ = true;
        if (this.parent && !this.parent.isDirty_)
            this.parent.markDirty();
    };
    Node.prototype.isDirty = function () {
        return this.isDirty_;
    };
    Node.prototype.hasNewLayout = function () {
        return true;
    };
    Node.prototype.markLayoutSeen = function () { };
    // -- Measure function
    Node.prototype.setMeasureFunc = function (fn) {
        this.measureFunc = fn;
        this.markDirty();
    };
    Node.prototype.unsetMeasureFunc = function () {
        this.measureFunc = null;
        this.markDirty();
    };
    // -- Computed layout getters
    Node.prototype.getComputedLeft = function () {
        return this.layout.left;
    };
    Node.prototype.getComputedTop = function () {
        return this.layout.top;
    };
    Node.prototype.getComputedWidth = function () {
        return this.layout.width;
    };
    Node.prototype.getComputedHeight = function () {
        return this.layout.height;
    };
    Node.prototype.getComputedRight = function () {
        var p = this.parent;
        return p ? p.layout.width - this.layout.left - this.layout.width : 0;
    };
    Node.prototype.getComputedBottom = function () {
        var p = this.parent;
        return p ? p.layout.height - this.layout.top - this.layout.height : 0;
    };
    Node.prototype.getComputedLayout = function () {
        return {
            left: this.layout.left,
            top: this.layout.top,
            right: this.getComputedRight(),
            bottom: this.getComputedBottom(),
            width: this.layout.width,
            height: this.layout.height,
        };
    };
    Node.prototype.getComputedBorder = function (edge) {
        return this.layout.border[physicalEdge(edge)];
    };
    Node.prototype.getComputedPadding = function (edge) {
        return this.layout.padding[physicalEdge(edge)];
    };
    Node.prototype.getComputedMargin = function (edge) {
        return this.layout.margin[physicalEdge(edge)];
    };
    // -- Style setters: dimensions
    Node.prototype.setWidth = function (v) {
        this.style.width = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setWidthPercent = function (v) {
        this.style.width = percentValue(v);
        this.markDirty();
    };
    Node.prototype.setWidthAuto = function () {
        this.style.width = AUTO_VALUE;
        this.markDirty();
    };
    Node.prototype.setHeight = function (v) {
        this.style.height = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setHeightPercent = function (v) {
        this.style.height = percentValue(v);
        this.markDirty();
    };
    Node.prototype.setHeightAuto = function () {
        this.style.height = AUTO_VALUE;
        this.markDirty();
    };
    Node.prototype.setMinWidth = function (v) {
        this.style.minWidth = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setMinWidthPercent = function (v) {
        this.style.minWidth = percentValue(v);
        this.markDirty();
    };
    Node.prototype.setMinHeight = function (v) {
        this.style.minHeight = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setMinHeightPercent = function (v) {
        this.style.minHeight = percentValue(v);
        this.markDirty();
    };
    Node.prototype.setMaxWidth = function (v) {
        this.style.maxWidth = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setMaxWidthPercent = function (v) {
        this.style.maxWidth = percentValue(v);
        this.markDirty();
    };
    Node.prototype.setMaxHeight = function (v) {
        this.style.maxHeight = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setMaxHeightPercent = function (v) {
        this.style.maxHeight = percentValue(v);
        this.markDirty();
    };
    // -- Style setters: flex
    Node.prototype.setFlexDirection = function (dir) {
        this.style.flexDirection = dir;
        this.markDirty();
    };
    Node.prototype.setFlexGrow = function (v) {
        this.style.flexGrow = v !== null && v !== void 0 ? v : 0;
        this.markDirty();
    };
    Node.prototype.setFlexShrink = function (v) {
        this.style.flexShrink = v !== null && v !== void 0 ? v : 0;
        this.markDirty();
    };
    Node.prototype.setFlex = function (v) {
        if (v === undefined || isNaN(v)) {
            this.style.flexGrow = 0;
            this.style.flexShrink = 0;
        }
        else if (v > 0) {
            this.style.flexGrow = v;
            this.style.flexShrink = 1;
            this.style.flexBasis = pointValue(0);
        }
        else if (v < 0) {
            this.style.flexGrow = 0;
            this.style.flexShrink = -v;
        }
        else {
            this.style.flexGrow = 0;
            this.style.flexShrink = 0;
        }
        this.markDirty();
    };
    Node.prototype.setFlexBasis = function (v) {
        this.style.flexBasis = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setFlexBasisPercent = function (v) {
        this.style.flexBasis = percentValue(v);
        this.markDirty();
    };
    Node.prototype.setFlexBasisAuto = function () {
        this.style.flexBasis = AUTO_VALUE;
        this.markDirty();
    };
    Node.prototype.setFlexWrap = function (wrap) {
        this.style.flexWrap = wrap;
        this.markDirty();
    };
    // -- Style setters: alignment
    Node.prototype.setAlignItems = function (a) {
        this.style.alignItems = a;
        this.markDirty();
    };
    Node.prototype.setAlignSelf = function (a) {
        this.style.alignSelf = a;
        this.markDirty();
    };
    Node.prototype.setAlignContent = function (a) {
        this.style.alignContent = a;
        this.markDirty();
    };
    Node.prototype.setJustifyContent = function (j) {
        this.style.justifyContent = j;
        this.markDirty();
    };
    // -- Style setters: display / position / overflow
    Node.prototype.setDisplay = function (d) {
        this.style.display = d;
        this.markDirty();
    };
    Node.prototype.getDisplay = function () {
        return this.style.display;
    };
    Node.prototype.setPositionType = function (t) {
        this.style.positionType = t;
        this.markDirty();
    };
    Node.prototype.setPosition = function (edge, v) {
        this.style.position[edge] = parseDimension(v);
        this._hasPosition = hasAnyDefinedEdge(this.style.position);
        this.markDirty();
    };
    Node.prototype.setPositionPercent = function (edge, v) {
        this.style.position[edge] = percentValue(v);
        this._hasPosition = true;
        this.markDirty();
    };
    Node.prototype.setPositionAuto = function (edge) {
        this.style.position[edge] = AUTO_VALUE;
        this._hasPosition = true;
        this.markDirty();
    };
    Node.prototype.setOverflow = function (o) {
        this.style.overflow = o;
        this.markDirty();
    };
    Node.prototype.setDirection = function (d) {
        this.style.direction = d;
        this.markDirty();
    };
    Node.prototype.setBoxSizing = function (_) {
        // Not implemented — Ink doesn't use content-box
    };
    // -- Style setters: spacing
    Node.prototype.setMargin = function (edge, v) {
        var val = parseDimension(v);
        this.style.margin[edge] = val;
        if (val.unit === enums_js_1.Unit.Auto)
            this._hasAutoMargin = true;
        else
            this._hasAutoMargin = hasAnyAutoEdge(this.style.margin);
        this._hasMargin =
            this._hasAutoMargin || hasAnyDefinedEdge(this.style.margin);
        this.markDirty();
    };
    Node.prototype.setMarginPercent = function (edge, v) {
        this.style.margin[edge] = percentValue(v);
        this._hasAutoMargin = hasAnyAutoEdge(this.style.margin);
        this._hasMargin = true;
        this.markDirty();
    };
    Node.prototype.setMarginAuto = function (edge) {
        this.style.margin[edge] = AUTO_VALUE;
        this._hasAutoMargin = true;
        this._hasMargin = true;
        this.markDirty();
    };
    Node.prototype.setPadding = function (edge, v) {
        this.style.padding[edge] = parseDimension(v);
        this._hasPadding = hasAnyDefinedEdge(this.style.padding);
        this.markDirty();
    };
    Node.prototype.setPaddingPercent = function (edge, v) {
        this.style.padding[edge] = percentValue(v);
        this._hasPadding = true;
        this.markDirty();
    };
    Node.prototype.setBorder = function (edge, v) {
        this.style.border[edge] = v === undefined ? UNDEFINED_VALUE : pointValue(v);
        this._hasBorder = hasAnyDefinedEdge(this.style.border);
        this.markDirty();
    };
    Node.prototype.setGap = function (gutter, v) {
        this.style.gap[gutter] = parseDimension(v);
        this.markDirty();
    };
    Node.prototype.setGapPercent = function (gutter, v) {
        this.style.gap[gutter] = percentValue(v);
        this.markDirty();
    };
    // -- Style getters (partial — only what tests need)
    Node.prototype.getFlexDirection = function () {
        return this.style.flexDirection;
    };
    Node.prototype.getJustifyContent = function () {
        return this.style.justifyContent;
    };
    Node.prototype.getAlignItems = function () {
        return this.style.alignItems;
    };
    Node.prototype.getAlignSelf = function () {
        return this.style.alignSelf;
    };
    Node.prototype.getAlignContent = function () {
        return this.style.alignContent;
    };
    Node.prototype.getFlexGrow = function () {
        return this.style.flexGrow;
    };
    Node.prototype.getFlexShrink = function () {
        return this.style.flexShrink;
    };
    Node.prototype.getFlexBasis = function () {
        return this.style.flexBasis;
    };
    Node.prototype.getFlexWrap = function () {
        return this.style.flexWrap;
    };
    Node.prototype.getWidth = function () {
        return this.style.width;
    };
    Node.prototype.getHeight = function () {
        return this.style.height;
    };
    Node.prototype.getOverflow = function () {
        return this.style.overflow;
    };
    Node.prototype.getPositionType = function () {
        return this.style.positionType;
    };
    Node.prototype.getDirection = function () {
        return this.style.direction;
    };
    // -- Unused API stubs (present for API parity)
    Node.prototype.copyStyle = function (_) { };
    Node.prototype.setDirtiedFunc = function (_) { };
    Node.prototype.unsetDirtiedFunc = function () { };
    Node.prototype.setIsReferenceBaseline = function (v) {
        this.isReferenceBaseline_ = v;
        this.markDirty();
    };
    Node.prototype.isReferenceBaseline = function () {
        return this.isReferenceBaseline_;
    };
    Node.prototype.setAspectRatio = function (_) { };
    Node.prototype.getAspectRatio = function () {
        return NaN;
    };
    Node.prototype.setAlwaysFormsContainingBlock = function (_) { };
    // -- Layout entry point
    Node.prototype.calculateLayout = function (ownerWidth, ownerHeight, _direction) {
        _yogaNodesVisited = 0;
        _yogaMeasureCalls = 0;
        _yogaCacheHits = 0;
        _generation++;
        var w = ownerWidth === undefined ? NaN : ownerWidth;
        var h = ownerHeight === undefined ? NaN : ownerHeight;
        layoutNode(this, w, h, isDefined(w) ? enums_js_1.MeasureMode.Exactly : enums_js_1.MeasureMode.Undefined, isDefined(h) ? enums_js_1.MeasureMode.Exactly : enums_js_1.MeasureMode.Undefined, w, h, true);
        // Root's own position = margin + position insets (yoga applies position
        // to the root even without a parent container; this matters for rounding
        // since the root's abs top/left seeds the pixel-grid walk).
        var mar = this.layout.margin;
        var posL = resolveValue(resolveEdgeRaw(this.style.position, EDGE_LEFT), isDefined(w) ? w : 0);
        var posT = resolveValue(resolveEdgeRaw(this.style.position, EDGE_TOP), isDefined(w) ? w : 0);
        this.layout.left = mar[EDGE_LEFT] + (isDefined(posL) ? posL : 0);
        this.layout.top = mar[EDGE_TOP] + (isDefined(posT) ? posT : 0);
        roundLayout(this, this.config.pointScaleFactor, 0, 0);
    };
    return Node;
}());
exports.Node = Node;
var DEFAULT_CONFIG = createConfig();
var CACHE_SLOTS = 4;
function cacheWrite(node, aW, aH, wM, hM, oW, oH, fW, fH, wasDirty) {
    if (!node._cIn) {
        node._cIn = new Float64Array(CACHE_SLOTS * 8);
        node._cOut = new Float64Array(CACHE_SLOTS * 2);
    }
    // First write after a dirty clears stale entries from before the dirty.
    // _cGen < _generation means entries are from a previous calculateLayout;
    // if wasDirty, the subtree changed since then → old dimensions invalid.
    // Clean nodes' old entries stay — same subtree → same result for same
    // inputs, so cross-generation caching works (the scroll hot path where
    // 499 clean messages cache-hit while one dirty leaf recomputes).
    if (wasDirty && node._cGen !== _generation) {
        node._cN = 0;
        node._cWr = 0;
    }
    // LRU write index wraps; _cN stays at CACHE_SLOTS so the read scan always
    // checks all populated slots (not just those since last wrap).
    var i = node._cWr++ % CACHE_SLOTS;
    if (node._cN < CACHE_SLOTS)
        node._cN = node._cWr;
    var o = i * 8;
    var cIn = node._cIn;
    cIn[o] = aW;
    cIn[o + 1] = aH;
    cIn[o + 2] = wM;
    cIn[o + 3] = hM;
    cIn[o + 4] = oW;
    cIn[o + 5] = oH;
    cIn[o + 6] = fW ? 1 : 0;
    cIn[o + 7] = fH ? 1 : 0;
    node._cOut[i * 2] = node.layout.width;
    node._cOut[i * 2 + 1] = node.layout.height;
    node._cGen = _generation;
}
// Store computed layout.width/height into the single-slot cache output fields.
// _hasL/_hasM inputs are committed at the TOP of layoutNode (before compute);
// outputs must be committed HERE (after compute) so a cache hit can restore
// the correct dimensions. Without this, a _hasL hit returns whatever
// layout.width/height was left by the last call — which may be the intrinsic
// content height from a heightMode=Undefined measure pass rather than the
// constrained viewport height from the layout pass. That's the scrollbox
// vpH=33→2624 bug: scrollTop clamps to 0, viewport goes blank.
function commitCacheOutputs(node, performLayout) {
    if (performLayout) {
        node._lOutW = node.layout.width;
        node._lOutH = node.layout.height;
    }
    else {
        node._mOutW = node.layout.width;
        node._mOutH = node.layout.height;
    }
}
// --
// Core flexbox algorithm
// Profiling counters — reset per calculateLayout, read via getYogaCounters.
// Incremented on each calculateLayout(). Nodes stamp _fbGen/_cGen when
// their cache is written; a cache entry with gen === _generation was
// computed THIS pass and is fresh regardless of isDirty_ state.
var _generation = 0;
var _yogaNodesVisited = 0;
var _yogaMeasureCalls = 0;
var _yogaCacheHits = 0;
var _yogaLiveNodes = 0;
function getYogaCounters() {
    return {
        visited: _yogaNodesVisited,
        measured: _yogaMeasureCalls,
        cacheHits: _yogaCacheHits,
        live: _yogaLiveNodes,
    };
}
function layoutNode(node, availableWidth, availableHeight, widthMode, heightMode, ownerWidth, ownerHeight, performLayout, 
// When true, ignore style dimension on this axis — the flex container
// has already determined the main size (flex-basis + grow/shrink result).
forceWidth, forceHeight) {
    var _a, _b;
    if (forceWidth === void 0) { forceWidth = false; }
    if (forceHeight === void 0) { forceHeight = false; }
    _yogaNodesVisited++;
    var style = node.style;
    var layout = node.layout;
    // Dirty-flag skip: clean subtree + matching inputs → layout object already
    // holds the answer. A cached layout result also satisfies a measure request
    // (positions are a superset of dimensions); the reverse does not hold.
    // Same-generation entries are fresh regardless of isDirty_ — they were
    // computed THIS calculateLayout, the subtree hasn't changed since.
    // Previous-generation entries need !isDirty_ (a dirty node's cache from
    // before the dirty is stale).
    // sameGen bypass only for MEASURE calls — a layout-pass cache hit would
    // skip the child-positioning recursion (STEP 5), leaving children at
    // stale positions. Measure calls only need w/h which the cache stores.
    var sameGen = node._cGen === _generation && !performLayout;
    if (!node.isDirty_ || sameGen) {
        if (!node.isDirty_ &&
            node._hasL &&
            node._lWM === widthMode &&
            node._lHM === heightMode &&
            node._lFW === forceWidth &&
            node._lFH === forceHeight &&
            sameFloat(node._lW, availableWidth) &&
            sameFloat(node._lH, availableHeight) &&
            sameFloat(node._lOW, ownerWidth) &&
            sameFloat(node._lOH, ownerHeight)) {
            _yogaCacheHits++;
            layout.width = node._lOutW;
            layout.height = node._lOutH;
            return;
        }
        // Multi-entry cache: scan for matching inputs, restore cached w/h on hit.
        // Covers the scroll case where a dirty ancestor's measure→layout cascade
        // produces N>1 distinct input combos per clean child — the single _hasL
        // slot thrashed, forcing full subtree recursion. With 500-message
        // scrollbox and one dirty leaf, this took dirty-leaf relayout from
        // 76k layoutNode calls (21.7×nodes) to 4k (1.2×nodes), 6.86ms → 550µs.
        // Same-generation check covers fresh-mounted (dirty) nodes during
        // virtual scroll — the dirty chain invokes them ≥2^depth times, first
        // call writes cache, rest hit: 105k visits → ~10k for 1593-node tree.
        if (node._cN > 0 && (sameGen || !node.isDirty_)) {
            var cIn = node._cIn;
            for (var i = 0; i < node._cN; i++) {
                var o = i * 8;
                if (cIn[o + 2] === widthMode &&
                    cIn[o + 3] === heightMode &&
                    cIn[o + 6] === (forceWidth ? 1 : 0) &&
                    cIn[o + 7] === (forceHeight ? 1 : 0) &&
                    sameFloat(cIn[o], availableWidth) &&
                    sameFloat(cIn[o + 1], availableHeight) &&
                    sameFloat(cIn[o + 4], ownerWidth) &&
                    sameFloat(cIn[o + 5], ownerHeight)) {
                    layout.width = node._cOut[i * 2];
                    layout.height = node._cOut[i * 2 + 1];
                    _yogaCacheHits++;
                    return;
                }
            }
        }
        if (!node.isDirty_ &&
            !performLayout &&
            node._hasM &&
            node._mWM === widthMode &&
            node._mHM === heightMode &&
            sameFloat(node._mW, availableWidth) &&
            sameFloat(node._mH, availableHeight) &&
            sameFloat(node._mOW, ownerWidth) &&
            sameFloat(node._mOH, ownerHeight)) {
            layout.width = node._mOutW;
            layout.height = node._mOutH;
            _yogaCacheHits++;
            return;
        }
    }
    // Commit cache inputs up front so every return path leaves a valid entry.
    // Only clear isDirty_ on the LAYOUT pass — the measure pass (computeFlexBasis
    // → layoutNode(performLayout=false)) runs before the layout pass in the same
    // calculateLayout call. Clearing dirty during measure lets the subsequent
    // layout pass hit the STALE _hasL cache from the previous calculateLayout
    // (before children were inserted), so ScrollBox content height never grows
    // and sticky-scroll never follows new content. A dirty node's _hasL entry is
    // stale by definition — invalidate it so the layout pass recomputes.
    var wasDirty = node.isDirty_;
    if (performLayout) {
        node._lW = availableWidth;
        node._lH = availableHeight;
        node._lWM = widthMode;
        node._lHM = heightMode;
        node._lOW = ownerWidth;
        node._lOH = ownerHeight;
        node._lFW = forceWidth;
        node._lFH = forceHeight;
        node._hasL = true;
        node.isDirty_ = false;
        // Previous approach cleared _cN here to prevent stale pre-dirty entries
        // from hitting (long-continuous blank-screen bug). Now replaced by
        // generation stamping: the cache check requires sameGen || !isDirty_, so
        // previous-generation entries from a dirty node can't hit. Clearing here
        // would wipe fresh same-generation entries from an earlier measure call,
        // forcing recompute on the layout call.
        if (wasDirty)
            node._hasM = false;
    }
    else {
        node._mW = availableWidth;
        node._mH = availableHeight;
        node._mWM = widthMode;
        node._mHM = heightMode;
        node._mOW = ownerWidth;
        node._mOH = ownerHeight;
        node._hasM = true;
        // Don't clear isDirty_. For DIRTY nodes, invalidate _hasL so the upcoming
        // performLayout=true call recomputes with the new child set (otherwise
        // sticky-scroll never follows new content — the bug from 4557bc9f9c).
        // Clean nodes keep _hasL: their layout from the previous generation is
        // still valid, they're only here because an ancestor is dirty and called
        // with different inputs than cached.
        if (wasDirty)
            node._hasL = false;
    }
    // Resolve padding/border/margin against ownerWidth (yoga uses ownerWidth for %)
    // Write directly into the pre-allocated layout arrays — avoids 3 allocs per
    // layoutNode call and 12 resolveEdge calls (was the #1 hotspot per CPU profile).
    // Skip entirely when no edges are set — the 4-write zero is cheaper than
    // the ~20 reads + ~15 compares resolveEdges4Into does to produce zeros.
    var pad = layout.padding;
    var bor = layout.border;
    var mar = layout.margin;
    if (node._hasPadding)
        resolveEdges4Into(style.padding, ownerWidth, pad);
    else
        pad[0] = pad[1] = pad[2] = pad[3] = 0;
    if (node._hasBorder)
        resolveEdges4Into(style.border, ownerWidth, bor);
    else
        bor[0] = bor[1] = bor[2] = bor[3] = 0;
    if (node._hasMargin)
        resolveEdges4Into(style.margin, ownerWidth, mar);
    else
        mar[0] = mar[1] = mar[2] = mar[3] = 0;
    var paddingBorderWidth = pad[0] + pad[2] + bor[0] + bor[2];
    var paddingBorderHeight = pad[1] + pad[3] + bor[1] + bor[3];
    // Resolve style dimensions
    var styleWidth = forceWidth ? NaN : resolveValue(style.width, ownerWidth);
    var styleHeight = forceHeight
        ? NaN
        : resolveValue(style.height, ownerHeight);
    // If style dimension is defined, it overrides the available size
    var width = availableWidth;
    var height = availableHeight;
    var wMode = widthMode;
    var hMode = heightMode;
    if (isDefined(styleWidth)) {
        width = styleWidth;
        wMode = enums_js_1.MeasureMode.Exactly;
    }
    if (isDefined(styleHeight)) {
        height = styleHeight;
        hMode = enums_js_1.MeasureMode.Exactly;
    }
    // Apply min/max constraints to the node's own dimensions
    width = boundAxis(style, true, width, ownerWidth, ownerHeight);
    height = boundAxis(style, false, height, ownerWidth, ownerHeight);
    // Measure-func leaf node
    if (node.measureFunc && node.children.length === 0) {
        var innerW = wMode === enums_js_1.MeasureMode.Undefined
            ? NaN
            : Math.max(0, width - paddingBorderWidth);
        var innerH = hMode === enums_js_1.MeasureMode.Undefined
            ? NaN
            : Math.max(0, height - paddingBorderHeight);
        _yogaMeasureCalls++;
        var measured = node.measureFunc(innerW, wMode, innerH, hMode);
        node.layout.width =
            wMode === enums_js_1.MeasureMode.Exactly
                ? width
                : boundAxis(style, true, ((_a = measured.width) !== null && _a !== void 0 ? _a : 0) + paddingBorderWidth, ownerWidth, ownerHeight);
        node.layout.height =
            hMode === enums_js_1.MeasureMode.Exactly
                ? height
                : boundAxis(style, false, ((_b = measured.height) !== null && _b !== void 0 ? _b : 0) + paddingBorderHeight, ownerWidth, ownerHeight);
        commitCacheOutputs(node, performLayout);
        // Write cache even for dirty nodes — fresh-mounted items during virtual
        // scroll are dirty on first layout, but the dirty chain's measure→layout
        // cascade invokes them ≥2^depth times per calculateLayout. Writing here
        // lets the 2nd+ calls hit cache (isDirty_ was cleared in the layout pass
        // above). Measured: 105k visits → 10k for a 1593-node fresh-mount tree.
        cacheWrite(node, availableWidth, availableHeight, widthMode, heightMode, ownerWidth, ownerHeight, forceWidth, forceHeight, wasDirty);
        return;
    }
    // Leaf node with no children and no measure func
    if (node.children.length === 0) {
        node.layout.width =
            wMode === enums_js_1.MeasureMode.Exactly
                ? width
                : boundAxis(style, true, paddingBorderWidth, ownerWidth, ownerHeight);
        node.layout.height =
            hMode === enums_js_1.MeasureMode.Exactly
                ? height
                : boundAxis(style, false, paddingBorderHeight, ownerWidth, ownerHeight);
        commitCacheOutputs(node, performLayout);
        // Write cache even for dirty nodes — fresh-mounted items during virtual
        // scroll are dirty on first layout, but the dirty chain's measure→layout
        // cascade invokes them ≥2^depth times per calculateLayout. Writing here
        // lets the 2nd+ calls hit cache (isDirty_ was cleared in the layout pass
        // above). Measured: 105k visits → 10k for a 1593-node fresh-mount tree.
        cacheWrite(node, availableWidth, availableHeight, widthMode, heightMode, ownerWidth, ownerHeight, forceWidth, forceHeight, wasDirty);
        return;
    }
    // Container with children — run flexbox algorithm
    var mainAxis = style.flexDirection;
    var crossAx = crossAxis(mainAxis);
    var isMainRow = isRow(mainAxis);
    var mainSize = isMainRow ? width : height;
    var crossSize = isMainRow ? height : width;
    var mainMode = isMainRow ? wMode : hMode;
    var crossMode = isMainRow ? hMode : wMode;
    var mainPadBorder = isMainRow ? paddingBorderWidth : paddingBorderHeight;
    var crossPadBorder = isMainRow ? paddingBorderHeight : paddingBorderWidth;
    var innerMainSize = isDefined(mainSize)
        ? Math.max(0, mainSize - mainPadBorder)
        : NaN;
    var innerCrossSize = isDefined(crossSize)
        ? Math.max(0, crossSize - crossPadBorder)
        : NaN;
    // Resolve gap
    var gapMain = resolveGap(style, isMainRow ? enums_js_1.Gutter.Column : enums_js_1.Gutter.Row, innerMainSize);
    // Partition children into flow vs absolute. display:contents nodes are
    // transparent — their children are lifted into the grandparent's child list
    // (recursively), and the contents node itself gets zero layout.
    var flowChildren = [];
    var absChildren = [];
    collectLayoutChildren(node, flowChildren, absChildren);
    // ownerW/H are the reference sizes for resolving children's percentage
    // values. Per CSS, a % width resolves against the parent's content-box
    // width. If this node's width is indefinite, children's % widths are also
    // indefinite — do NOT fall through to the grandparent's size.
    var ownerW = isDefined(width) ? width : NaN;
    var ownerH = isDefined(height) ? height : NaN;
    var isWrap = style.flexWrap !== enums_js_1.Wrap.NoWrap;
    var gapCross = resolveGap(style, isMainRow ? enums_js_1.Gutter.Row : enums_js_1.Gutter.Column, innerCrossSize);
    // STEP 1: Compute flex-basis for each flow child and break into lines.
    // Single-line (NoWrap) containers always get one line; multi-line containers
    // break when accumulated basis+margin+gap exceeds innerMainSize.
    for (var _i = 0, flowChildren_1 = flowChildren; _i < flowChildren_1.length; _i++) {
        var c = flowChildren_1[_i];
        c._flexBasis = computeFlexBasis(c, mainAxis, innerMainSize, innerCrossSize, crossMode, ownerW, ownerH);
    }
    var lines = [];
    if (!isWrap || !isDefined(innerMainSize) || flowChildren.length === 0) {
        for (var _c = 0, flowChildren_2 = flowChildren; _c < flowChildren_2.length; _c++) {
            var c = flowChildren_2[_c];
            c._lineIndex = 0;
        }
        lines.push(flowChildren);
    }
    else {
        // Line-break decisions use the min/max-clamped basis (flexbox spec §9.3.5:
        // "hypothetical main size"), not the raw flex-basis.
        var lineStart = 0;
        var lineLen = 0;
        for (var i = 0; i < flowChildren.length; i++) {
            var c = flowChildren[i];
            var hypo = boundAxis(c.style, isMainRow, c._flexBasis, ownerW, ownerH);
            var outer = Math.max(0, hypo) + childMarginForAxis(c, mainAxis, ownerW);
            var withGap = i > lineStart ? gapMain : 0;
            if (i > lineStart && lineLen + withGap + outer > innerMainSize) {
                lines.push(flowChildren.slice(lineStart, i));
                lineStart = i;
                lineLen = outer;
            }
            else {
                lineLen += withGap + outer;
            }
            c._lineIndex = lines.length;
        }
        lines.push(flowChildren.slice(lineStart));
    }
    var lineCount = lines.length;
    var isBaseline = isBaselineLayout(node, flowChildren);
    // STEP 2+3: For each line, resolve flexible lengths and lay out children to
    // measure cross sizes. Track per-line consumed main and max cross.
    var lineConsumedMain = new Array(lineCount);
    var lineCrossSizes = new Array(lineCount);
    // Baseline layout tracks max ascent (baseline + leading margin) per line so
    // baseline-aligned items can be positioned at maxAscent - childBaseline.
    var lineMaxAscent = isBaseline ? new Array(lineCount).fill(0) : [];
    var maxLineMain = 0;
    var totalLinesCross = 0;
    for (var li = 0; li < lineCount; li++) {
        var line = lines[li];
        var lineGap = line.length > 1 ? gapMain * (line.length - 1) : 0;
        var lineBasis = lineGap;
        for (var _d = 0, line_1 = line; _d < line_1.length; _d++) {
            var c = line_1[_d];
            lineBasis += c._flexBasis + childMarginForAxis(c, mainAxis, ownerW);
        }
        // Resolve flexible lengths against available inner main. For indefinite
        // containers with min/max, flex against the clamped size.
        var availMain = innerMainSize;
        if (!isDefined(availMain)) {
            var mainOwner = isMainRow ? ownerWidth : ownerHeight;
            var minM = resolveValue(isMainRow ? style.minWidth : style.minHeight, mainOwner);
            var maxM = resolveValue(isMainRow ? style.maxWidth : style.maxHeight, mainOwner);
            if (isDefined(maxM) && lineBasis > maxM - mainPadBorder) {
                availMain = Math.max(0, maxM - mainPadBorder);
            }
            else if (isDefined(minM) && lineBasis < minM - mainPadBorder) {
                availMain = Math.max(0, minM - mainPadBorder);
            }
        }
        resolveFlexibleLengths(line, availMain, lineBasis, isMainRow, ownerW, ownerH);
        // Lay out each child in this line to measure cross
        var lineCross = 0;
        for (var _e = 0, line_2 = line; _e < line_2.length; _e++) {
            var c = line_2[_e];
            var cStyle = c.style;
            var childAlign = cStyle.alignSelf === enums_js_1.Align.Auto ? style.alignItems : cStyle.alignSelf;
            var cMarginCross = childMarginForAxis(c, crossAx, ownerW);
            var childCrossSize = NaN;
            var childCrossMode = enums_js_1.MeasureMode.Undefined;
            var resolvedCrossStyle = resolveValue(isMainRow ? cStyle.height : cStyle.width, isMainRow ? ownerH : ownerW);
            var crossLeadE = isMainRow ? EDGE_TOP : EDGE_LEFT;
            var crossTrailE = isMainRow ? EDGE_BOTTOM : EDGE_RIGHT;
            var hasCrossAutoMargin = c._hasAutoMargin &&
                (isMarginAuto(cStyle.margin, crossLeadE) ||
                    isMarginAuto(cStyle.margin, crossTrailE));
            // Single-line stretch goes directly to the container cross size.
            // Multi-line wrap measures intrinsic cross (Undefined mode) so
            // flex-grow grandchildren don't expand to the container — the line
            // cross size is determined first, then items are re-stretched.
            if (isDefined(resolvedCrossStyle)) {
                childCrossSize = resolvedCrossStyle;
                childCrossMode = enums_js_1.MeasureMode.Exactly;
            }
            else if (childAlign === enums_js_1.Align.Stretch &&
                !hasCrossAutoMargin &&
                !isWrap &&
                isDefined(innerCrossSize) &&
                crossMode === enums_js_1.MeasureMode.Exactly) {
                childCrossSize = Math.max(0, innerCrossSize - cMarginCross);
                childCrossMode = enums_js_1.MeasureMode.Exactly;
            }
            else if (!isWrap && isDefined(innerCrossSize)) {
                childCrossSize = Math.max(0, innerCrossSize - cMarginCross);
                childCrossMode = enums_js_1.MeasureMode.AtMost;
            }
            var cw = isMainRow ? c._mainSize : childCrossSize;
            var ch = isMainRow ? childCrossSize : c._mainSize;
            layoutNode(c, cw, ch, isMainRow ? enums_js_1.MeasureMode.Exactly : childCrossMode, isMainRow ? childCrossMode : enums_js_1.MeasureMode.Exactly, ownerW, ownerH, performLayout, isMainRow, !isMainRow);
            c._crossSize = isMainRow ? c.layout.height : c.layout.width;
            lineCross = Math.max(lineCross, c._crossSize + cMarginCross);
        }
        // Baseline layout: line cross size must fit maxAscent + maxDescent of
        // baseline-aligned children (yoga STEP 8). Only applies to row direction.
        if (isBaseline) {
            var maxAscent = 0;
            var maxDescent = 0;
            for (var _f = 0, line_3 = line; _f < line_3.length; _f++) {
                var c = line_3[_f];
                if (resolveChildAlign(node, c) !== enums_js_1.Align.Baseline)
                    continue;
                var mTop = resolveEdge(c.style.margin, EDGE_TOP, ownerW);
                var mBot = resolveEdge(c.style.margin, EDGE_BOTTOM, ownerW);
                var ascent = calculateBaseline(c) + mTop;
                var descent = c.layout.height + mTop + mBot - ascent;
                if (ascent > maxAscent)
                    maxAscent = ascent;
                if (descent > maxDescent)
                    maxDescent = descent;
            }
            lineMaxAscent[li] = maxAscent;
            if (maxAscent + maxDescent > lineCross) {
                lineCross = maxAscent + maxDescent;
            }
        }
        // layoutNode(c) at line ~1117 above already resolved c.layout.margin[] via
        // resolveEdges4Into with the same ownerW — read directly instead of
        // re-resolving through childMarginForAxis → 2× resolveEdge.
        var mainLead = leadingEdge(mainAxis);
        var mainTrail = trailingEdge(mainAxis);
        var consumed = lineGap;
        for (var _g = 0, line_4 = line; _g < line_4.length; _g++) {
            var c = line_4[_g];
            var cm = c.layout.margin;
            consumed += c._mainSize + cm[mainLead] + cm[mainTrail];
        }
        lineConsumedMain[li] = consumed;
        lineCrossSizes[li] = lineCross;
        maxLineMain = Math.max(maxLineMain, consumed);
        totalLinesCross += lineCross;
    }
    var totalCrossGap = lineCount > 1 ? gapCross * (lineCount - 1) : 0;
    totalLinesCross += totalCrossGap;
    // STEP 4: Determine container dimensions. Per yoga's STEP 9, for both
    // AtMost (FitContent) and Undefined (MaxContent) the node sizes to its
    // content — AtMost is NOT a hard clamp, items may overflow the available
    // space (CSS "fit-content" behavior). Only Scroll overflow clamps to the
    // available size. Wrap containers that broke into multiple lines under
    // AtMost fill the available main size since they wrapped at that boundary.
    var isScroll = style.overflow === enums_js_1.Overflow.Scroll;
    var contentMain = maxLineMain + mainPadBorder;
    var finalMainSize = mainMode === enums_js_1.MeasureMode.Exactly
        ? mainSize
        : mainMode === enums_js_1.MeasureMode.AtMost && isScroll
            ? Math.max(Math.min(mainSize, contentMain), mainPadBorder)
            : isWrap && lineCount > 1 && mainMode === enums_js_1.MeasureMode.AtMost
                ? mainSize
                : contentMain;
    var contentCross = totalLinesCross + crossPadBorder;
    var finalCrossSize = crossMode === enums_js_1.MeasureMode.Exactly
        ? crossSize
        : crossMode === enums_js_1.MeasureMode.AtMost && isScroll
            ? Math.max(Math.min(crossSize, contentCross), crossPadBorder)
            : contentCross;
    node.layout.width = boundAxis(style, true, isMainRow ? finalMainSize : finalCrossSize, ownerWidth, ownerHeight);
    node.layout.height = boundAxis(style, false, isMainRow ? finalCrossSize : finalMainSize, ownerWidth, ownerHeight);
    commitCacheOutputs(node, performLayout);
    // Write cache even for dirty nodes — fresh-mounted items during virtual scroll
    cacheWrite(node, availableWidth, availableHeight, widthMode, heightMode, ownerWidth, ownerHeight, forceWidth, forceHeight, wasDirty);
    if (!performLayout)
        return;
    // STEP 5: Position lines (align-content) and children (justify-content +
    // align-items + auto margins).
    var actualInnerMain = (isMainRow ? node.layout.width : node.layout.height) - mainPadBorder;
    var actualInnerCross = (isMainRow ? node.layout.height : node.layout.width) - crossPadBorder;
    var mainLeadEdgePhys = leadingEdge(mainAxis);
    var mainTrailEdgePhys = trailingEdge(mainAxis);
    var crossLeadEdgePhys = isMainRow ? EDGE_TOP : EDGE_LEFT;
    var crossTrailEdgePhys = isMainRow ? EDGE_BOTTOM : EDGE_RIGHT;
    var reversed = isReverse(mainAxis);
    var mainContainerSize = isMainRow ? node.layout.width : node.layout.height;
    var crossLead = pad[crossLeadEdgePhys] + bor[crossLeadEdgePhys];
    // Align-content: distribute free cross space among lines. Single-line
    // containers use the full cross size for the one line (align-items handles
    // positioning within it).
    var lineCrossOffset = crossLead;
    var betweenLines = gapCross;
    var freeCross = actualInnerCross - totalLinesCross;
    if (lineCount === 1 && !isWrap && !isBaseline) {
        lineCrossSizes[0] = actualInnerCross;
    }
    else {
        var remCross = Math.max(0, freeCross);
        switch (style.alignContent) {
            case enums_js_1.Align.FlexStart:
                break;
            case enums_js_1.Align.Center:
                lineCrossOffset += freeCross / 2;
                break;
            case enums_js_1.Align.FlexEnd:
                lineCrossOffset += freeCross;
                break;
            case enums_js_1.Align.Stretch:
                if (lineCount > 0 && remCross > 0) {
                    var add = remCross / lineCount;
                    for (var i = 0; i < lineCount; i++)
                        lineCrossSizes[i] += add;
                }
                break;
            case enums_js_1.Align.SpaceBetween:
                if (lineCount > 1)
                    betweenLines += remCross / (lineCount - 1);
                break;
            case enums_js_1.Align.SpaceAround:
                if (lineCount > 0) {
                    betweenLines += remCross / lineCount;
                    lineCrossOffset += remCross / lineCount / 2;
                }
                break;
            case enums_js_1.Align.SpaceEvenly:
                if (lineCount > 0) {
                    betweenLines += remCross / (lineCount + 1);
                    lineCrossOffset += remCross / (lineCount + 1);
                }
                break;
            default:
                break;
        }
    }
    // For wrap-reverse, lines stack from the trailing cross edge. Walk lines in
    // order but flip the cross position within the container.
    var wrapReverse = style.flexWrap === enums_js_1.Wrap.WrapReverse;
    var crossContainerSize = isMainRow ? node.layout.height : node.layout.width;
    var lineCrossPos = lineCrossOffset;
    for (var li = 0; li < lineCount; li++) {
        var line = lines[li];
        var lineCross = lineCrossSizes[li];
        var consumedMain = lineConsumedMain[li];
        var n = line.length;
        // Re-stretch children whose cross is auto and align is stretch, now that
        // the line cross size is known. Needed for multi-line wrap (line cross
        // wasn't known during initial measure) AND single-line when the container
        // cross was not Exactly (initial stretch at ~line 1250 was skipped because
        // innerCrossSize wasn't defined — the container sized to max child cross).
        if (isWrap || crossMode !== enums_js_1.MeasureMode.Exactly) {
            for (var _h = 0, line_5 = line; _h < line_5.length; _h++) {
                var c = line_5[_h];
                var cStyle = c.style;
                var childAlign = cStyle.alignSelf === enums_js_1.Align.Auto ? style.alignItems : cStyle.alignSelf;
                var crossStyleDef = isDefined(resolveValue(isMainRow ? cStyle.height : cStyle.width, isMainRow ? ownerH : ownerW));
                var hasCrossAutoMargin = c._hasAutoMargin &&
                    (isMarginAuto(cStyle.margin, crossLeadEdgePhys) ||
                        isMarginAuto(cStyle.margin, crossTrailEdgePhys));
                if (childAlign === enums_js_1.Align.Stretch &&
                    !crossStyleDef &&
                    !hasCrossAutoMargin) {
                    var cMarginCross = childMarginForAxis(c, crossAx, ownerW);
                    var target = Math.max(0, lineCross - cMarginCross);
                    if (c._crossSize !== target) {
                        var cw = isMainRow ? c._mainSize : target;
                        var ch = isMainRow ? target : c._mainSize;
                        layoutNode(c, cw, ch, enums_js_1.MeasureMode.Exactly, enums_js_1.MeasureMode.Exactly, ownerW, ownerH, performLayout, isMainRow, !isMainRow);
                        c._crossSize = target;
                    }
                }
            }
        }
        // Justify-content + auto margins for this line
        var mainOffset = pad[mainLeadEdgePhys] + bor[mainLeadEdgePhys];
        var betweenMain = gapMain;
        var numAutoMarginsMain = 0;
        for (var _j = 0, line_6 = line; _j < line_6.length; _j++) {
            var c = line_6[_j];
            if (!c._hasAutoMargin)
                continue;
            if (isMarginAuto(c.style.margin, mainLeadEdgePhys))
                numAutoMarginsMain++;
            if (isMarginAuto(c.style.margin, mainTrailEdgePhys))
                numAutoMarginsMain++;
        }
        var freeMain = actualInnerMain - consumedMain;
        var remainingMain = Math.max(0, freeMain);
        var autoMarginMainSize = numAutoMarginsMain > 0 && remainingMain > 0
            ? remainingMain / numAutoMarginsMain
            : 0;
        if (numAutoMarginsMain === 0) {
            switch (style.justifyContent) {
                case enums_js_1.Justify.FlexStart:
                    break;
                case enums_js_1.Justify.Center:
                    mainOffset += freeMain / 2;
                    break;
                case enums_js_1.Justify.FlexEnd:
                    mainOffset += freeMain;
                    break;
                case enums_js_1.Justify.SpaceBetween:
                    if (n > 1)
                        betweenMain += remainingMain / (n - 1);
                    break;
                case enums_js_1.Justify.SpaceAround:
                    if (n > 0) {
                        betweenMain += remainingMain / n;
                        mainOffset += remainingMain / n / 2;
                    }
                    break;
                case enums_js_1.Justify.SpaceEvenly:
                    if (n > 0) {
                        betweenMain += remainingMain / (n + 1);
                        mainOffset += remainingMain / (n + 1);
                    }
                    break;
            }
        }
        var effectiveLineCrossPos = wrapReverse
            ? crossContainerSize - lineCrossPos - lineCross
            : lineCrossPos;
        var pos = mainOffset;
        for (var _k = 0, line_7 = line; _k < line_7.length; _k++) {
            var c = line_7[_k];
            var cMargin = c.style.margin;
            // c.layout.margin[] was populated by resolveEdges4Into inside the
            // layoutNode(c) call above (same ownerW). Read resolved values directly
            // instead of re-running the edge fallback chain 4× via resolveEdge.
            // Auto margins resolve to 0 in layout.margin, so autoMarginMainSize
            // substitution still uses the isMarginAuto check against style.
            var cLayoutMargin = c.layout.margin;
            var autoMainLead = false;
            var autoMainTrail = false;
            var autoCrossLead = false;
            var autoCrossTrail = false;
            var mMainLead = void 0;
            var mMainTrail = void 0;
            var mCrossLead = void 0;
            var mCrossTrail = void 0;
            if (c._hasAutoMargin) {
                autoMainLead = isMarginAuto(cMargin, mainLeadEdgePhys);
                autoMainTrail = isMarginAuto(cMargin, mainTrailEdgePhys);
                autoCrossLead = isMarginAuto(cMargin, crossLeadEdgePhys);
                autoCrossTrail = isMarginAuto(cMargin, crossTrailEdgePhys);
                mMainLead = autoMainLead
                    ? autoMarginMainSize
                    : cLayoutMargin[mainLeadEdgePhys];
                mMainTrail = autoMainTrail
                    ? autoMarginMainSize
                    : cLayoutMargin[mainTrailEdgePhys];
                mCrossLead = autoCrossLead ? 0 : cLayoutMargin[crossLeadEdgePhys];
                mCrossTrail = autoCrossTrail ? 0 : cLayoutMargin[crossTrailEdgePhys];
            }
            else {
                // Fast path: no auto margins — read resolved values directly.
                mMainLead = cLayoutMargin[mainLeadEdgePhys];
                mMainTrail = cLayoutMargin[mainTrailEdgePhys];
                mCrossLead = cLayoutMargin[crossLeadEdgePhys];
                mCrossTrail = cLayoutMargin[crossTrailEdgePhys];
            }
            var mainPos = reversed
                ? mainContainerSize - (pos + mMainLead) - c._mainSize
                : pos + mMainLead;
            var childAlign = c.style.alignSelf === enums_js_1.Align.Auto ? style.alignItems : c.style.alignSelf;
            var crossPos = effectiveLineCrossPos + mCrossLead;
            var crossFree = lineCross - c._crossSize - mCrossLead - mCrossTrail;
            if (autoCrossLead && autoCrossTrail) {
                crossPos += Math.max(0, crossFree) / 2;
            }
            else if (autoCrossLead) {
                crossPos += Math.max(0, crossFree);
            }
            else if (autoCrossTrail) {
                // stays at leading
            }
            else {
                switch (childAlign) {
                    case enums_js_1.Align.FlexStart:
                    case enums_js_1.Align.Stretch:
                        if (wrapReverse)
                            crossPos += crossFree;
                        break;
                    case enums_js_1.Align.Center:
                        crossPos += crossFree / 2;
                        break;
                    case enums_js_1.Align.FlexEnd:
                        if (!wrapReverse)
                            crossPos += crossFree;
                        break;
                    case enums_js_1.Align.Baseline:
                        // Row direction only (isBaselineLayout checked this). Position so
                        // the child's baseline aligns with the line's max ascent. Per
                        // yoga: top = currentLead + maxAscent - childBaseline + leadingPosition.
                        if (isBaseline) {
                            crossPos =
                                effectiveLineCrossPos +
                                    lineMaxAscent[li] -
                                    calculateBaseline(c);
                        }
                        break;
                    default:
                        break;
                }
            }
            // Relative position offsets. Fast path: no position insets set →
            // skip 4× resolveEdgeRaw + 4× resolveValue + 4× isDefined.
            var relX = 0;
            var relY = 0;
            if (c._hasPosition) {
                var relLeft = resolveValue(resolveEdgeRaw(c.style.position, EDGE_LEFT), ownerW);
                var relRight = resolveValue(resolveEdgeRaw(c.style.position, EDGE_RIGHT), ownerW);
                var relTop = resolveValue(resolveEdgeRaw(c.style.position, EDGE_TOP), ownerW);
                var relBottom = resolveValue(resolveEdgeRaw(c.style.position, EDGE_BOTTOM), ownerW);
                relX = isDefined(relLeft)
                    ? relLeft
                    : isDefined(relRight)
                        ? -relRight
                        : 0;
                relY = isDefined(relTop)
                    ? relTop
                    : isDefined(relBottom)
                        ? -relBottom
                        : 0;
            }
            if (isMainRow) {
                c.layout.left = mainPos + relX;
                c.layout.top = crossPos + relY;
            }
            else {
                c.layout.left = crossPos + relX;
                c.layout.top = mainPos + relY;
            }
            pos += c._mainSize + mMainLead + mMainTrail + betweenMain;
        }
        lineCrossPos += lineCross + betweenLines;
    }
    // STEP 6: Absolute-positioned children
    for (var _l = 0, absChildren_1 = absChildren; _l < absChildren_1.length; _l++) {
        var c = absChildren_1[_l];
        layoutAbsoluteChild(node, c, node.layout.width, node.layout.height, pad, bor);
    }
}
function layoutAbsoluteChild(parent, child, parentWidth, parentHeight, pad, bor) {
    var cs = child.style;
    var posLeft = resolveEdgeRaw(cs.position, EDGE_LEFT);
    var posRight = resolveEdgeRaw(cs.position, EDGE_RIGHT);
    var posTop = resolveEdgeRaw(cs.position, EDGE_TOP);
    var posBottom = resolveEdgeRaw(cs.position, EDGE_BOTTOM);
    var rLeft = resolveValue(posLeft, parentWidth);
    var rRight = resolveValue(posRight, parentWidth);
    var rTop = resolveValue(posTop, parentHeight);
    var rBottom = resolveValue(posBottom, parentHeight);
    // Absolute children's percentage dimensions resolve against the containing
    // block's padding-box (parent size minus border), per CSS §10.1.
    var paddingBoxW = parentWidth - bor[0] - bor[2];
    var paddingBoxH = parentHeight - bor[1] - bor[3];
    var cw = resolveValue(cs.width, paddingBoxW);
    var ch = resolveValue(cs.height, paddingBoxH);
    // If both left+right defined and width not, derive width
    if (!isDefined(cw) && isDefined(rLeft) && isDefined(rRight)) {
        cw = paddingBoxW - rLeft - rRight;
    }
    if (!isDefined(ch) && isDefined(rTop) && isDefined(rBottom)) {
        ch = paddingBoxH - rTop - rBottom;
    }
    layoutNode(child, cw, ch, isDefined(cw) ? enums_js_1.MeasureMode.Exactly : enums_js_1.MeasureMode.Undefined, isDefined(ch) ? enums_js_1.MeasureMode.Exactly : enums_js_1.MeasureMode.Undefined, paddingBoxW, paddingBoxH, true);
    // Margin of absolute child (applied in addition to insets)
    var mL = resolveEdge(cs.margin, EDGE_LEFT, parentWidth);
    var mT = resolveEdge(cs.margin, EDGE_TOP, parentWidth);
    var mR = resolveEdge(cs.margin, EDGE_RIGHT, parentWidth);
    var mB = resolveEdge(cs.margin, EDGE_BOTTOM, parentWidth);
    var mainAxis = parent.style.flexDirection;
    var reversed = isReverse(mainAxis);
    var mainRow = isRow(mainAxis);
    var wrapReverse = parent.style.flexWrap === enums_js_1.Wrap.WrapReverse;
    // alignSelf overrides alignItems for absolute children (same as flow items)
    var alignment = cs.alignSelf === enums_js_1.Align.Auto ? parent.style.alignItems : cs.alignSelf;
    // Position
    var left;
    if (isDefined(rLeft)) {
        left = bor[0] + rLeft + mL;
    }
    else if (isDefined(rRight)) {
        left = parentWidth - bor[2] - rRight - child.layout.width - mR;
    }
    else if (mainRow) {
        // Main axis — justify-content, flipped for reversed
        var lead = pad[0] + bor[0];
        var trail = parentWidth - pad[2] - bor[2];
        left = reversed
            ? trail - child.layout.width - mR
            : justifyAbsolute(parent.style.justifyContent, lead, trail, child.layout.width) + mL;
    }
    else {
        left =
            alignAbsolute(alignment, pad[0] + bor[0], parentWidth - pad[2] - bor[2], child.layout.width, wrapReverse) + mL;
    }
    var top;
    if (isDefined(rTop)) {
        top = bor[1] + rTop + mT;
    }
    else if (isDefined(rBottom)) {
        top = parentHeight - bor[3] - rBottom - child.layout.height - mB;
    }
    else if (mainRow) {
        top =
            alignAbsolute(alignment, pad[1] + bor[1], parentHeight - pad[3] - bor[3], child.layout.height, wrapReverse) + mT;
    }
    else {
        var lead = pad[1] + bor[1];
        var trail = parentHeight - pad[3] - bor[3];
        top = reversed
            ? trail - child.layout.height - mB
            : justifyAbsolute(parent.style.justifyContent, lead, trail, child.layout.height) + mT;
    }
    child.layout.left = left;
    child.layout.top = top;
}
function justifyAbsolute(justify, leadEdge, trailEdge, childSize) {
    switch (justify) {
        case enums_js_1.Justify.Center:
            return leadEdge + (trailEdge - leadEdge - childSize) / 2;
        case enums_js_1.Justify.FlexEnd:
            return trailEdge - childSize;
        default:
            return leadEdge;
    }
}
function alignAbsolute(align, leadEdge, trailEdge, childSize, wrapReverse) {
    // Wrap-reverse flips the cross axis: flex-start/stretch go to trailing,
    // flex-end goes to leading (yoga's absoluteLayoutChild flips the align value
    // when the containing block has wrap-reverse).
    switch (align) {
        case enums_js_1.Align.Center:
            return leadEdge + (trailEdge - leadEdge - childSize) / 2;
        case enums_js_1.Align.FlexEnd:
            return wrapReverse ? leadEdge : trailEdge - childSize;
        default:
            return wrapReverse ? trailEdge - childSize : leadEdge;
    }
}
function computeFlexBasis(child, mainAxis, availableMain, availableCross, crossMode, ownerWidth, ownerHeight) {
    // Same-generation cache hit: basis was computed THIS calculateLayout, so
    // it's fresh regardless of isDirty_. Covers both clean children (scrolling
    // past unchanged messages) AND fresh-mounted dirty children (virtual
    // scroll mounts new items — the dirty chain's measure→layout cascade
    // invokes this ≥2^depth times, but the child's subtree doesn't change
    // between calls within one calculateLayout). For clean children with
    // cache from a PREVIOUS generation, also hit if inputs match — isDirty_
    // gates since a dirty child's previous-gen cache is stale.
    var sameGen = child._fbGen === _generation;
    if ((sameGen || !child.isDirty_) &&
        child._fbCrossMode === crossMode &&
        sameFloat(child._fbOwnerW, ownerWidth) &&
        sameFloat(child._fbOwnerH, ownerHeight) &&
        sameFloat(child._fbAvailMain, availableMain) &&
        sameFloat(child._fbAvailCross, availableCross)) {
        return child._fbBasis;
    }
    var cs = child.style;
    var isMainRow = isRow(mainAxis);
    // Explicit flex-basis
    var basis = resolveValue(cs.flexBasis, availableMain);
    if (isDefined(basis)) {
        var b_1 = Math.max(0, basis);
        child._fbBasis = b_1;
        child._fbOwnerW = ownerWidth;
        child._fbOwnerH = ownerHeight;
        child._fbAvailMain = availableMain;
        child._fbAvailCross = availableCross;
        child._fbCrossMode = crossMode;
        child._fbGen = _generation;
        return b_1;
    }
    // Style dimension on main axis
    var mainStyleDim = isMainRow ? cs.width : cs.height;
    var mainOwner = isMainRow ? ownerWidth : ownerHeight;
    var resolved = resolveValue(mainStyleDim, mainOwner);
    if (isDefined(resolved)) {
        var b_2 = Math.max(0, resolved);
        child._fbBasis = b_2;
        child._fbOwnerW = ownerWidth;
        child._fbOwnerH = ownerHeight;
        child._fbAvailMain = availableMain;
        child._fbAvailCross = availableCross;
        child._fbCrossMode = crossMode;
        child._fbGen = _generation;
        return b_2;
    }
    // Need to measure the child to get its natural size
    var crossStyleDim = isMainRow ? cs.height : cs.width;
    var crossOwner = isMainRow ? ownerHeight : ownerWidth;
    var crossConstraint = resolveValue(crossStyleDim, crossOwner);
    var crossConstraintMode = isDefined(crossConstraint)
        ? enums_js_1.MeasureMode.Exactly
        : enums_js_1.MeasureMode.Undefined;
    if (!isDefined(crossConstraint) && isDefined(availableCross)) {
        crossConstraint = availableCross;
        crossConstraintMode =
            crossMode === enums_js_1.MeasureMode.Exactly && isStretchAlign(child)
                ? enums_js_1.MeasureMode.Exactly
                : enums_js_1.MeasureMode.AtMost;
    }
    // Upstream yoga (YGNodeComputeFlexBasisForChild) passes the available inner
    // width with mode AtMost when the subtree will call a measure-func — so text
    // nodes don't report unconstrained intrinsic width as flex-basis, which
    // would force siblings to shrink and the text to wrap at the wrong width.
    // Passing Undefined here made Ink's <Text> inside <Box flexGrow={1}> get
    // width = intrinsic instead of available, dropping chars at wrap boundaries.
    //
    // Two constraints on when this applies:
    //   - Width only. Height is never constrained during basis measurement —
    //     column containers must measure children at natural height so
    //     scrollable content can overflow (constraining height clips ScrollBox).
    //   - Subtree has a measure-func. Pure layout subtrees (no measure-func)
    //     with flex-grow children would grow into the AtMost constraint,
    //     inflating the basis (breaks YGMinMaxDimensionTest flex_grow_in_at_most
    //     where a flexGrow:1 child should stay at basis 0, not grow to 100).
    var mainConstraint = NaN;
    var mainConstraintMode = enums_js_1.MeasureMode.Undefined;
    if (isMainRow && isDefined(availableMain) && hasMeasureFuncInSubtree(child)) {
        mainConstraint = availableMain;
        mainConstraintMode = enums_js_1.MeasureMode.AtMost;
    }
    var mw = isMainRow ? mainConstraint : crossConstraint;
    var mh = isMainRow ? crossConstraint : mainConstraint;
    var mwMode = isMainRow ? mainConstraintMode : crossConstraintMode;
    var mhMode = isMainRow ? crossConstraintMode : mainConstraintMode;
    layoutNode(child, mw, mh, mwMode, mhMode, ownerWidth, ownerHeight, false);
    var b = isMainRow ? child.layout.width : child.layout.height;
    child._fbBasis = b;
    child._fbOwnerW = ownerWidth;
    child._fbOwnerH = ownerHeight;
    child._fbAvailMain = availableMain;
    child._fbAvailCross = availableCross;
    child._fbCrossMode = crossMode;
    child._fbGen = _generation;
    return b;
}
function hasMeasureFuncInSubtree(node) {
    if (node.measureFunc)
        return true;
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var c = _a[_i];
        if (hasMeasureFuncInSubtree(c))
            return true;
    }
    return false;
}
function resolveFlexibleLengths(children, availableInnerMain, totalFlexBasis, isMainRow, ownerW, ownerH) {
    // Multi-pass flex distribution per CSS flexbox spec §9.7 "Resolving Flexible
    // Lengths": distribute free space, detect min/max violations, freeze all
    // violators, redistribute among unfrozen children. Repeat until stable.
    var n = children.length;
    var frozen = new Array(n).fill(false);
    var initialFree = isDefined(availableInnerMain)
        ? availableInnerMain - totalFlexBasis
        : 0;
    // Freeze inflexible items at their clamped basis
    for (var i = 0; i < n; i++) {
        var c = children[i];
        var clamped = boundAxis(c.style, isMainRow, c._flexBasis, ownerW, ownerH);
        var inflexible = !isDefined(availableInnerMain) ||
            (initialFree >= 0 ? c.style.flexGrow === 0 : c.style.flexShrink === 0);
        if (inflexible) {
            c._mainSize = Math.max(0, clamped);
            frozen[i] = true;
        }
        else {
            c._mainSize = c._flexBasis;
        }
    }
    // Iteratively distribute until no violations. Free space is recomputed each
    // pass: initial free space minus the delta frozen children consumed beyond
    // (or below) their basis.
    var unclamped = new Array(n);
    for (var iter = 0; iter <= n; iter++) {
        var frozenDelta = 0;
        var totalGrow = 0;
        var totalShrinkScaled = 0;
        var unfrozenCount = 0;
        for (var i = 0; i < n; i++) {
            var c = children[i];
            if (frozen[i]) {
                frozenDelta += c._mainSize - c._flexBasis;
            }
            else {
                totalGrow += c.style.flexGrow;
                totalShrinkScaled += c.style.flexShrink * c._flexBasis;
                unfrozenCount++;
            }
        }
        if (unfrozenCount === 0)
            break;
        var remaining = initialFree - frozenDelta;
        // Spec §9.7 step 4c: if sum of flex factors < 1, only distribute
        // initialFree × sum, not the full remaining space (partial flex).
        if (remaining > 0 && totalGrow > 0 && totalGrow < 1) {
            var scaled = initialFree * totalGrow;
            if (scaled < remaining)
                remaining = scaled;
        }
        else if (remaining < 0 && totalShrinkScaled > 0) {
            var totalShrink = 0;
            for (var i = 0; i < n; i++) {
                if (!frozen[i])
                    totalShrink += children[i].style.flexShrink;
            }
            if (totalShrink < 1) {
                var scaled = initialFree * totalShrink;
                if (scaled > remaining)
                    remaining = scaled;
            }
        }
        // Compute targets + violations for all unfrozen children
        var totalViolation = 0;
        for (var i = 0; i < n; i++) {
            if (frozen[i])
                continue;
            var c = children[i];
            var t = c._flexBasis;
            if (remaining > 0 && totalGrow > 0) {
                t += (remaining * c.style.flexGrow) / totalGrow;
            }
            else if (remaining < 0 && totalShrinkScaled > 0) {
                t +=
                    (remaining * (c.style.flexShrink * c._flexBasis)) / totalShrinkScaled;
            }
            unclamped[i] = t;
            var clamped = Math.max(0, boundAxis(c.style, isMainRow, t, ownerW, ownerH));
            c._mainSize = clamped;
            totalViolation += clamped - t;
        }
        // Freeze per spec §9.7 step 5: if totalViolation is zero freeze all; if
        // positive freeze min-violators; if negative freeze max-violators.
        if (totalViolation === 0)
            break;
        var anyFrozen = false;
        for (var i = 0; i < n; i++) {
            if (frozen[i])
                continue;
            var v = children[i]._mainSize - unclamped[i];
            if ((totalViolation > 0 && v > 0) || (totalViolation < 0 && v < 0)) {
                frozen[i] = true;
                anyFrozen = true;
            }
        }
        if (!anyFrozen)
            break;
    }
}
function isStretchAlign(child) {
    var p = child.parent;
    if (!p)
        return false;
    var align = child.style.alignSelf === enums_js_1.Align.Auto
        ? p.style.alignItems
        : child.style.alignSelf;
    return align === enums_js_1.Align.Stretch;
}
function resolveChildAlign(parent, child) {
    return child.style.alignSelf === enums_js_1.Align.Auto
        ? parent.style.alignItems
        : child.style.alignSelf;
}
// Baseline of a node per CSS Flexbox §8.5 / yoga's YGBaseline. Leaf nodes
// (no children) use their own height. Containers recurse into the first
// baseline-aligned child on the first line (or the first flow child if none
// are baseline-aligned), returning that child's baseline + its top offset.
function calculateBaseline(node) {
    var baselineChild = null;
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var c = _a[_i];
        if (c._lineIndex > 0)
            break;
        if (c.style.positionType === enums_js_1.PositionType.Absolute)
            continue;
        if (c.style.display === enums_js_1.Display.None)
            continue;
        if (resolveChildAlign(node, c) === enums_js_1.Align.Baseline ||
            c.isReferenceBaseline_) {
            baselineChild = c;
            break;
        }
        if (baselineChild === null)
            baselineChild = c;
    }
    if (baselineChild === null)
        return node.layout.height;
    return calculateBaseline(baselineChild) + baselineChild.layout.top;
}
// A container uses baseline layout only for row direction, when either
// align-items is baseline or any flow child has align-self: baseline.
function isBaselineLayout(node, flowChildren) {
    if (!isRow(node.style.flexDirection))
        return false;
    if (node.style.alignItems === enums_js_1.Align.Baseline)
        return true;
    for (var _i = 0, flowChildren_3 = flowChildren; _i < flowChildren_3.length; _i++) {
        var c = flowChildren_3[_i];
        if (c.style.alignSelf === enums_js_1.Align.Baseline)
            return true;
    }
    return false;
}
function childMarginForAxis(child, axis, ownerWidth) {
    if (!child._hasMargin)
        return 0;
    var lead = resolveEdge(child.style.margin, leadingEdge(axis), ownerWidth);
    var trail = resolveEdge(child.style.margin, trailingEdge(axis), ownerWidth);
    return lead + trail;
}
function resolveGap(style, gutter, ownerSize) {
    var v = style.gap[gutter];
    if (v.unit === enums_js_1.Unit.Undefined)
        v = style.gap[enums_js_1.Gutter.All];
    var r = resolveValue(v, ownerSize);
    return isDefined(r) ? Math.max(0, r) : 0;
}
function boundAxis(style, isWidth, value, ownerWidth, ownerHeight) {
    var minV = isWidth ? style.minWidth : style.minHeight;
    var maxV = isWidth ? style.maxWidth : style.maxHeight;
    var minU = minV.unit;
    var maxU = maxV.unit;
    // Fast path: no min/max constraints set. Per CPU profile this is the
    // overwhelmingly common case (~32k calls/layout on the 1000-node bench,
    // nearly all with undefined min/max) — skipping 2× resolveValue + 2× isNaN
    // that always no-op. Unit.Undefined = 0.
    if (minU === 0 && maxU === 0)
        return value;
    var owner = isWidth ? ownerWidth : ownerHeight;
    var v = value;
    // Inlined resolveValue: Unit.Point=1, Unit.Percent=2. `m === m` is !isNaN.
    if (maxU === 1) {
        if (v > maxV.value)
            v = maxV.value;
    }
    else if (maxU === 2) {
        var m = (maxV.value * owner) / 100;
        if (m === m && v > m)
            v = m;
    }
    if (minU === 1) {
        if (v < minV.value)
            v = minV.value;
    }
    else if (minU === 2) {
        var m = (minV.value * owner) / 100;
        if (m === m && v < m)
            v = m;
    }
    return v;
}
function zeroLayoutRecursive(node) {
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var c = _a[_i];
        c.layout.left = 0;
        c.layout.top = 0;
        c.layout.width = 0;
        c.layout.height = 0;
        // Invalidate layout cache — without this, unhide → calculateLayout finds
        // the child clean (!isDirty_) with _hasL intact, hits the cache at line
        // ~1086, restores stale _lOutW/_lOutH, and returns early — skipping the
        // child-positioning recursion. Grandchildren stay at (0,0,0,0) from the
        // zeroing above and render invisible. isDirty_=true also gates _cN and
        // _fbBasis via their (sameGen || !isDirty_) checks — _cGen/_fbGen freeze
        // during hide so sameGen is false on unhide.
        c.isDirty_ = true;
        c._hasL = false;
        c._hasM = false;
        zeroLayoutRecursive(c);
    }
}
function collectLayoutChildren(node, flow, abs) {
    // Partition a node's children into flow and absolute lists, flattening
    // display:contents subtrees so their children are laid out as direct
    // children of this node (per CSS display:contents spec — the box is removed
    // from the layout tree but its children remain, lifted to the grandparent).
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var c = _a[_i];
        var disp = c.style.display;
        if (disp === enums_js_1.Display.None) {
            c.layout.left = 0;
            c.layout.top = 0;
            c.layout.width = 0;
            c.layout.height = 0;
            zeroLayoutRecursive(c);
        }
        else if (disp === enums_js_1.Display.Contents) {
            c.layout.left = 0;
            c.layout.top = 0;
            c.layout.width = 0;
            c.layout.height = 0;
            // Recurse — nested display:contents lifts all the way up. The contents
            // node's own margin/padding/position/dimensions are ignored.
            collectLayoutChildren(c, flow, abs);
        }
        else if (c.style.positionType === enums_js_1.PositionType.Absolute) {
            abs.push(c);
        }
        else {
            flow.push(c);
        }
    }
}
function roundLayout(node, scale, absLeft, absTop) {
    if (scale === 0)
        return;
    var l = node.layout;
    var nodeLeft = l.left;
    var nodeTop = l.top;
    var nodeWidth = l.width;
    var nodeHeight = l.height;
    var absNodeLeft = absLeft + nodeLeft;
    var absNodeTop = absTop + nodeTop;
    // Upstream YGRoundValueToPixelGrid: text nodes (has measureFunc) floor their
    // positions so wrapped text never starts past its allocated column. Width
    // uses ceil-if-fractional to avoid clipping the last glyph. Non-text nodes
    // use standard round. Matches yoga's PixelGrid.cpp — without this, justify
    // center/space-evenly positions are off-by-one vs WASM and flex-shrink
    // overflow places siblings at the wrong column.
    var isText = node.measureFunc !== null;
    l.left = roundValue(nodeLeft, scale, false, isText);
    l.top = roundValue(nodeTop, scale, false, isText);
    // Width/height rounded via absolute edges to avoid cumulative drift
    var absRight = absNodeLeft + nodeWidth;
    var absBottom = absNodeTop + nodeHeight;
    var hasFracW = !isWholeNumber(nodeWidth * scale);
    var hasFracH = !isWholeNumber(nodeHeight * scale);
    l.width =
        roundValue(absRight, scale, isText && hasFracW, isText && !hasFracW) -
            roundValue(absNodeLeft, scale, false, isText);
    l.height =
        roundValue(absBottom, scale, isText && hasFracH, isText && !hasFracH) -
            roundValue(absNodeTop, scale, false, isText);
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var c = _a[_i];
        roundLayout(c, scale, absNodeLeft, absNodeTop);
    }
}
function isWholeNumber(v) {
    var frac = v - Math.floor(v);
    return frac < 0.0001 || frac > 0.9999;
}
function roundValue(v, scale, forceCeil, forceFloor) {
    var scaled = v * scale;
    var frac = scaled - Math.floor(scaled);
    if (frac < 0)
        frac += 1;
    // Float-epsilon tolerance matches upstream YGDoubleEqual (1e-4)
    if (frac < 0.0001) {
        scaled = Math.floor(scaled);
    }
    else if (frac > 0.9999) {
        scaled = Math.ceil(scaled);
    }
    else if (forceCeil) {
        scaled = Math.ceil(scaled);
    }
    else if (forceFloor) {
        scaled = Math.floor(scaled);
    }
    else {
        // Round half-up (>= 0.5 goes up), per upstream
        scaled = Math.floor(scaled) + (frac >= 0.4999 ? 1 : 0);
    }
    return scaled / scale;
}
// --
// Helpers
function parseDimension(v) {
    if (v === undefined)
        return UNDEFINED_VALUE;
    if (v === 'auto')
        return AUTO_VALUE;
    if (typeof v === 'number') {
        // WASM yoga's YGFloatIsUndefined treats NaN and ±Infinity as undefined.
        // Ink passes height={Infinity} (e.g. LogSelector maxHeight default) and
        // expects it to mean "unconstrained" — storing it as a literal point value
        // makes the node height Infinity and breaks all downstream layout.
        return Number.isFinite(v) ? pointValue(v) : UNDEFINED_VALUE;
    }
    if (typeof v === 'string' && v.endsWith('%')) {
        return percentValue(parseFloat(v));
    }
    var n = parseFloat(v);
    return isNaN(n) ? UNDEFINED_VALUE : pointValue(n);
}
function physicalEdge(edge) {
    switch (edge) {
        case enums_js_1.Edge.Left:
        case enums_js_1.Edge.Start:
            return EDGE_LEFT;
        case enums_js_1.Edge.Top:
            return EDGE_TOP;
        case enums_js_1.Edge.Right:
        case enums_js_1.Edge.End:
            return EDGE_RIGHT;
        case enums_js_1.Edge.Bottom:
            return EDGE_BOTTOM;
        default:
            return EDGE_LEFT;
    }
}
var YOGA_INSTANCE = {
    Config: {
        create: createConfig,
        destroy: function () { },
    },
    Node: {
        create: function (config) { return new Node(config); },
        createDefault: function () { return new Node(); },
        createWithConfig: function (config) { return new Node(config); },
        destroy: function () { },
    },
};
function loadYoga() {
    return Promise.resolve(YOGA_INSTANCE);
}
exports.default = YOGA_INSTANCE;
