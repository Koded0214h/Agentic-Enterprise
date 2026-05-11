"use strict";
// --
// Adapter interface for the layout engine (Yoga)
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutMeasureMode = exports.LayoutOverflow = exports.LayoutPositionType = exports.LayoutWrap = exports.LayoutJustify = exports.LayoutAlign = exports.LayoutFlexDirection = exports.LayoutDisplay = exports.LayoutGutter = exports.LayoutEdge = void 0;
exports.LayoutEdge = {
    All: 'all',
    Horizontal: 'horizontal',
    Vertical: 'vertical',
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
    Start: 'start',
    End: 'end',
};
exports.LayoutGutter = {
    All: 'all',
    Column: 'column',
    Row: 'row',
};
exports.LayoutDisplay = {
    Flex: 'flex',
    None: 'none',
};
exports.LayoutFlexDirection = {
    Row: 'row',
    RowReverse: 'row-reverse',
    Column: 'column',
    ColumnReverse: 'column-reverse',
};
exports.LayoutAlign = {
    Auto: 'auto',
    Stretch: 'stretch',
    FlexStart: 'flex-start',
    Center: 'center',
    FlexEnd: 'flex-end',
};
exports.LayoutJustify = {
    FlexStart: 'flex-start',
    Center: 'center',
    FlexEnd: 'flex-end',
    SpaceBetween: 'space-between',
    SpaceAround: 'space-around',
    SpaceEvenly: 'space-evenly',
};
exports.LayoutWrap = {
    NoWrap: 'nowrap',
    Wrap: 'wrap',
    WrapReverse: 'wrap-reverse',
};
exports.LayoutPositionType = {
    Relative: 'relative',
    Absolute: 'absolute',
};
exports.LayoutOverflow = {
    Visible: 'visible',
    Hidden: 'hidden',
    Scroll: 'scroll',
};
exports.LayoutMeasureMode = {
    Undefined: 'undefined',
    Exactly: 'exactly',
    AtMost: 'at-most',
};
