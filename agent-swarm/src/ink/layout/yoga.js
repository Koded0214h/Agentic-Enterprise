"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YogaLayoutNode = void 0;
exports.createYogaLayoutNode = createYogaLayoutNode;
var index_js_1 = require("src/native-ts/yoga-layout/index.js");
var node_js_1 = require("./node.js");
// --
// Edge/Gutter mapping
var EDGE_MAP = {
    all: index_js_1.Edge.All,
    horizontal: index_js_1.Edge.Horizontal,
    vertical: index_js_1.Edge.Vertical,
    left: index_js_1.Edge.Left,
    right: index_js_1.Edge.Right,
    top: index_js_1.Edge.Top,
    bottom: index_js_1.Edge.Bottom,
    start: index_js_1.Edge.Start,
    end: index_js_1.Edge.End,
};
var GUTTER_MAP = {
    all: index_js_1.Gutter.All,
    column: index_js_1.Gutter.Column,
    row: index_js_1.Gutter.Row,
};
// --
// Yoga adapter
var YogaLayoutNode = /** @class */ (function () {
    function YogaLayoutNode(yoga) {
        this.yoga = yoga;
    }
    // Tree
    YogaLayoutNode.prototype.insertChild = function (child, index) {
        this.yoga.insertChild(child.yoga, index);
    };
    YogaLayoutNode.prototype.removeChild = function (child) {
        this.yoga.removeChild(child.yoga);
    };
    YogaLayoutNode.prototype.getChildCount = function () {
        return this.yoga.getChildCount();
    };
    YogaLayoutNode.prototype.getParent = function () {
        var p = this.yoga.getParent();
        return p ? new YogaLayoutNode(p) : null;
    };
    // Layout
    YogaLayoutNode.prototype.calculateLayout = function (width, _height) {
        this.yoga.calculateLayout(width, undefined, index_js_1.Direction.LTR);
    };
    YogaLayoutNode.prototype.setMeasureFunc = function (fn) {
        this.yoga.setMeasureFunc(function (w, wMode) {
            var mode = wMode === index_js_1.MeasureMode.Exactly
                ? node_js_1.LayoutMeasureMode.Exactly
                : wMode === index_js_1.MeasureMode.AtMost
                    ? node_js_1.LayoutMeasureMode.AtMost
                    : node_js_1.LayoutMeasureMode.Undefined;
            return fn(w, mode);
        });
    };
    YogaLayoutNode.prototype.unsetMeasureFunc = function () {
        this.yoga.unsetMeasureFunc();
    };
    YogaLayoutNode.prototype.markDirty = function () {
        this.yoga.markDirty();
    };
    // Computed layout
    YogaLayoutNode.prototype.getComputedLeft = function () {
        return this.yoga.getComputedLeft();
    };
    YogaLayoutNode.prototype.getComputedTop = function () {
        return this.yoga.getComputedTop();
    };
    YogaLayoutNode.prototype.getComputedWidth = function () {
        return this.yoga.getComputedWidth();
    };
    YogaLayoutNode.prototype.getComputedHeight = function () {
        return this.yoga.getComputedHeight();
    };
    YogaLayoutNode.prototype.getComputedBorder = function (edge) {
        return this.yoga.getComputedBorder(EDGE_MAP[edge]);
    };
    YogaLayoutNode.prototype.getComputedPadding = function (edge) {
        return this.yoga.getComputedPadding(EDGE_MAP[edge]);
    };
    // Style setters
    YogaLayoutNode.prototype.setWidth = function (value) {
        this.yoga.setWidth(value);
    };
    YogaLayoutNode.prototype.setWidthPercent = function (value) {
        this.yoga.setWidthPercent(value);
    };
    YogaLayoutNode.prototype.setWidthAuto = function () {
        this.yoga.setWidthAuto();
    };
    YogaLayoutNode.prototype.setHeight = function (value) {
        this.yoga.setHeight(value);
    };
    YogaLayoutNode.prototype.setHeightPercent = function (value) {
        this.yoga.setHeightPercent(value);
    };
    YogaLayoutNode.prototype.setHeightAuto = function () {
        this.yoga.setHeightAuto();
    };
    YogaLayoutNode.prototype.setMinWidth = function (value) {
        this.yoga.setMinWidth(value);
    };
    YogaLayoutNode.prototype.setMinWidthPercent = function (value) {
        this.yoga.setMinWidthPercent(value);
    };
    YogaLayoutNode.prototype.setMinHeight = function (value) {
        this.yoga.setMinHeight(value);
    };
    YogaLayoutNode.prototype.setMinHeightPercent = function (value) {
        this.yoga.setMinHeightPercent(value);
    };
    YogaLayoutNode.prototype.setMaxWidth = function (value) {
        this.yoga.setMaxWidth(value);
    };
    YogaLayoutNode.prototype.setMaxWidthPercent = function (value) {
        this.yoga.setMaxWidthPercent(value);
    };
    YogaLayoutNode.prototype.setMaxHeight = function (value) {
        this.yoga.setMaxHeight(value);
    };
    YogaLayoutNode.prototype.setMaxHeightPercent = function (value) {
        this.yoga.setMaxHeightPercent(value);
    };
    YogaLayoutNode.prototype.setFlexDirection = function (dir) {
        var map = {
            row: index_js_1.FlexDirection.Row,
            'row-reverse': index_js_1.FlexDirection.RowReverse,
            column: index_js_1.FlexDirection.Column,
            'column-reverse': index_js_1.FlexDirection.ColumnReverse,
        };
        this.yoga.setFlexDirection(map[dir]);
    };
    YogaLayoutNode.prototype.setFlexGrow = function (value) {
        this.yoga.setFlexGrow(value);
    };
    YogaLayoutNode.prototype.setFlexShrink = function (value) {
        this.yoga.setFlexShrink(value);
    };
    YogaLayoutNode.prototype.setFlexBasis = function (value) {
        this.yoga.setFlexBasis(value);
    };
    YogaLayoutNode.prototype.setFlexBasisPercent = function (value) {
        this.yoga.setFlexBasisPercent(value);
    };
    YogaLayoutNode.prototype.setFlexWrap = function (wrap) {
        var map = {
            nowrap: index_js_1.Wrap.NoWrap,
            wrap: index_js_1.Wrap.Wrap,
            'wrap-reverse': index_js_1.Wrap.WrapReverse,
        };
        this.yoga.setFlexWrap(map[wrap]);
    };
    YogaLayoutNode.prototype.setAlignItems = function (align) {
        var map = {
            auto: index_js_1.Align.Auto,
            stretch: index_js_1.Align.Stretch,
            'flex-start': index_js_1.Align.FlexStart,
            center: index_js_1.Align.Center,
            'flex-end': index_js_1.Align.FlexEnd,
        };
        this.yoga.setAlignItems(map[align]);
    };
    YogaLayoutNode.prototype.setAlignSelf = function (align) {
        var map = {
            auto: index_js_1.Align.Auto,
            stretch: index_js_1.Align.Stretch,
            'flex-start': index_js_1.Align.FlexStart,
            center: index_js_1.Align.Center,
            'flex-end': index_js_1.Align.FlexEnd,
        };
        this.yoga.setAlignSelf(map[align]);
    };
    YogaLayoutNode.prototype.setJustifyContent = function (justify) {
        var map = {
            'flex-start': index_js_1.Justify.FlexStart,
            center: index_js_1.Justify.Center,
            'flex-end': index_js_1.Justify.FlexEnd,
            'space-between': index_js_1.Justify.SpaceBetween,
            'space-around': index_js_1.Justify.SpaceAround,
            'space-evenly': index_js_1.Justify.SpaceEvenly,
        };
        this.yoga.setJustifyContent(map[justify]);
    };
    YogaLayoutNode.prototype.setDisplay = function (display) {
        this.yoga.setDisplay(display === 'flex' ? index_js_1.Display.Flex : index_js_1.Display.None);
    };
    YogaLayoutNode.prototype.getDisplay = function () {
        return this.yoga.getDisplay() === index_js_1.Display.None
            ? node_js_1.LayoutDisplay.None
            : node_js_1.LayoutDisplay.Flex;
    };
    YogaLayoutNode.prototype.setPositionType = function (type) {
        this.yoga.setPositionType(type === 'absolute' ? index_js_1.PositionType.Absolute : index_js_1.PositionType.Relative);
    };
    YogaLayoutNode.prototype.setPosition = function (edge, value) {
        this.yoga.setPosition(EDGE_MAP[edge], value);
    };
    YogaLayoutNode.prototype.setPositionPercent = function (edge, value) {
        this.yoga.setPositionPercent(EDGE_MAP[edge], value);
    };
    YogaLayoutNode.prototype.setOverflow = function (overflow) {
        var map = {
            visible: index_js_1.Overflow.Visible,
            hidden: index_js_1.Overflow.Hidden,
            scroll: index_js_1.Overflow.Scroll,
        };
        this.yoga.setOverflow(map[overflow]);
    };
    YogaLayoutNode.prototype.setMargin = function (edge, value) {
        this.yoga.setMargin(EDGE_MAP[edge], value);
    };
    YogaLayoutNode.prototype.setPadding = function (edge, value) {
        this.yoga.setPadding(EDGE_MAP[edge], value);
    };
    YogaLayoutNode.prototype.setBorder = function (edge, value) {
        this.yoga.setBorder(EDGE_MAP[edge], value);
    };
    YogaLayoutNode.prototype.setGap = function (gutter, value) {
        this.yoga.setGap(GUTTER_MAP[gutter], value);
    };
    // Lifecycle
    YogaLayoutNode.prototype.free = function () {
        this.yoga.free();
    };
    YogaLayoutNode.prototype.freeRecursive = function () {
        this.yoga.freeRecursive();
    };
    return YogaLayoutNode;
}());
exports.YogaLayoutNode = YogaLayoutNode;
// --
// Instance management
//
// The TS yoga-layout port is synchronous — no WASM loading, no linear memory
// growth, so no preload/swap/reset machinery is needed. The Yoga instance is
// just a plain JS object available at import time.
function createYogaLayoutNode() {
    return new YogaLayoutNode(index_js_1.default.Node.create());
}
