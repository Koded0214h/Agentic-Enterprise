"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_js_1 = require("./layout/node.js");
var applyPositionStyles = function (node, style) {
    if ('position' in style) {
        node.setPositionType(style.position === 'absolute'
            ? node_js_1.LayoutPositionType.Absolute
            : node_js_1.LayoutPositionType.Relative);
    }
    if ('top' in style)
        applyPositionEdge(node, 'top', style.top);
    if ('bottom' in style)
        applyPositionEdge(node, 'bottom', style.bottom);
    if ('left' in style)
        applyPositionEdge(node, 'left', style.left);
    if ('right' in style)
        applyPositionEdge(node, 'right', style.right);
};
function applyPositionEdge(node, edge, v) {
    if (typeof v === 'string') {
        node.setPositionPercent(edge, Number.parseInt(v, 10));
    }
    else if (typeof v === 'number') {
        node.setPosition(edge, v);
    }
    else {
        node.setPosition(edge, Number.NaN);
    }
}
var applyOverflowStyles = function (node, style) {
    var _a, _b;
    // Yoga's Overflow controls whether children expand the container.
    // 'hidden' and 'scroll' both prevent expansion; 'scroll' additionally
    // signals that the renderer should apply scrollTop translation.
    // overflowX/Y are render-time concerns; for layout we use the union.
    var y = (_a = style.overflowY) !== null && _a !== void 0 ? _a : style.overflow;
    var x = (_b = style.overflowX) !== null && _b !== void 0 ? _b : style.overflow;
    if (y === 'scroll' || x === 'scroll') {
        node.setOverflow(node_js_1.LayoutOverflow.Scroll);
    }
    else if (y === 'hidden' || x === 'hidden') {
        node.setOverflow(node_js_1.LayoutOverflow.Hidden);
    }
    else if ('overflow' in style ||
        'overflowX' in style ||
        'overflowY' in style) {
        node.setOverflow(node_js_1.LayoutOverflow.Visible);
    }
};
var applyMarginStyles = function (node, style) {
    var _a, _b, _c;
    if ('margin' in style) {
        node.setMargin(node_js_1.LayoutEdge.All, (_a = style.margin) !== null && _a !== void 0 ? _a : 0);
    }
    if ('marginX' in style) {
        node.setMargin(node_js_1.LayoutEdge.Horizontal, (_b = style.marginX) !== null && _b !== void 0 ? _b : 0);
    }
    if ('marginY' in style) {
        node.setMargin(node_js_1.LayoutEdge.Vertical, (_c = style.marginY) !== null && _c !== void 0 ? _c : 0);
    }
    if ('marginLeft' in style) {
        node.setMargin(node_js_1.LayoutEdge.Start, style.marginLeft || 0);
    }
    if ('marginRight' in style) {
        node.setMargin(node_js_1.LayoutEdge.End, style.marginRight || 0);
    }
    if ('marginTop' in style) {
        node.setMargin(node_js_1.LayoutEdge.Top, style.marginTop || 0);
    }
    if ('marginBottom' in style) {
        node.setMargin(node_js_1.LayoutEdge.Bottom, style.marginBottom || 0);
    }
};
var applyPaddingStyles = function (node, style) {
    var _a, _b, _c;
    if ('padding' in style) {
        node.setPadding(node_js_1.LayoutEdge.All, (_a = style.padding) !== null && _a !== void 0 ? _a : 0);
    }
    if ('paddingX' in style) {
        node.setPadding(node_js_1.LayoutEdge.Horizontal, (_b = style.paddingX) !== null && _b !== void 0 ? _b : 0);
    }
    if ('paddingY' in style) {
        node.setPadding(node_js_1.LayoutEdge.Vertical, (_c = style.paddingY) !== null && _c !== void 0 ? _c : 0);
    }
    if ('paddingLeft' in style) {
        node.setPadding(node_js_1.LayoutEdge.Left, style.paddingLeft || 0);
    }
    if ('paddingRight' in style) {
        node.setPadding(node_js_1.LayoutEdge.Right, style.paddingRight || 0);
    }
    if ('paddingTop' in style) {
        node.setPadding(node_js_1.LayoutEdge.Top, style.paddingTop || 0);
    }
    if ('paddingBottom' in style) {
        node.setPadding(node_js_1.LayoutEdge.Bottom, style.paddingBottom || 0);
    }
};
var applyFlexStyles = function (node, style) {
    var _a;
    if ('flexGrow' in style) {
        node.setFlexGrow((_a = style.flexGrow) !== null && _a !== void 0 ? _a : 0);
    }
    if ('flexShrink' in style) {
        node.setFlexShrink(typeof style.flexShrink === 'number' ? style.flexShrink : 1);
    }
    if ('flexWrap' in style) {
        if (style.flexWrap === 'nowrap') {
            node.setFlexWrap(node_js_1.LayoutWrap.NoWrap);
        }
        if (style.flexWrap === 'wrap') {
            node.setFlexWrap(node_js_1.LayoutWrap.Wrap);
        }
        if (style.flexWrap === 'wrap-reverse') {
            node.setFlexWrap(node_js_1.LayoutWrap.WrapReverse);
        }
    }
    if ('flexDirection' in style) {
        if (style.flexDirection === 'row') {
            node.setFlexDirection(node_js_1.LayoutFlexDirection.Row);
        }
        if (style.flexDirection === 'row-reverse') {
            node.setFlexDirection(node_js_1.LayoutFlexDirection.RowReverse);
        }
        if (style.flexDirection === 'column') {
            node.setFlexDirection(node_js_1.LayoutFlexDirection.Column);
        }
        if (style.flexDirection === 'column-reverse') {
            node.setFlexDirection(node_js_1.LayoutFlexDirection.ColumnReverse);
        }
    }
    if ('flexBasis' in style) {
        if (typeof style.flexBasis === 'number') {
            node.setFlexBasis(style.flexBasis);
        }
        else if (typeof style.flexBasis === 'string') {
            node.setFlexBasisPercent(Number.parseInt(style.flexBasis, 10));
        }
        else {
            node.setFlexBasis(Number.NaN);
        }
    }
    if ('alignItems' in style) {
        if (style.alignItems === 'stretch' || !style.alignItems) {
            node.setAlignItems(node_js_1.LayoutAlign.Stretch);
        }
        if (style.alignItems === 'flex-start') {
            node.setAlignItems(node_js_1.LayoutAlign.FlexStart);
        }
        if (style.alignItems === 'center') {
            node.setAlignItems(node_js_1.LayoutAlign.Center);
        }
        if (style.alignItems === 'flex-end') {
            node.setAlignItems(node_js_1.LayoutAlign.FlexEnd);
        }
    }
    if ('alignSelf' in style) {
        if (style.alignSelf === 'auto' || !style.alignSelf) {
            node.setAlignSelf(node_js_1.LayoutAlign.Auto);
        }
        if (style.alignSelf === 'flex-start') {
            node.setAlignSelf(node_js_1.LayoutAlign.FlexStart);
        }
        if (style.alignSelf === 'center') {
            node.setAlignSelf(node_js_1.LayoutAlign.Center);
        }
        if (style.alignSelf === 'flex-end') {
            node.setAlignSelf(node_js_1.LayoutAlign.FlexEnd);
        }
    }
    if ('justifyContent' in style) {
        if (style.justifyContent === 'flex-start' || !style.justifyContent) {
            node.setJustifyContent(node_js_1.LayoutJustify.FlexStart);
        }
        if (style.justifyContent === 'center') {
            node.setJustifyContent(node_js_1.LayoutJustify.Center);
        }
        if (style.justifyContent === 'flex-end') {
            node.setJustifyContent(node_js_1.LayoutJustify.FlexEnd);
        }
        if (style.justifyContent === 'space-between') {
            node.setJustifyContent(node_js_1.LayoutJustify.SpaceBetween);
        }
        if (style.justifyContent === 'space-around') {
            node.setJustifyContent(node_js_1.LayoutJustify.SpaceAround);
        }
        if (style.justifyContent === 'space-evenly') {
            node.setJustifyContent(node_js_1.LayoutJustify.SpaceEvenly);
        }
    }
};
var applyDimensionStyles = function (node, style) {
    var _a, _b, _c, _d;
    if ('width' in style) {
        if (typeof style.width === 'number') {
            node.setWidth(style.width);
        }
        else if (typeof style.width === 'string') {
            node.setWidthPercent(Number.parseInt(style.width, 10));
        }
        else {
            node.setWidthAuto();
        }
    }
    if ('height' in style) {
        if (typeof style.height === 'number') {
            node.setHeight(style.height);
        }
        else if (typeof style.height === 'string') {
            node.setHeightPercent(Number.parseInt(style.height, 10));
        }
        else {
            node.setHeightAuto();
        }
    }
    if ('minWidth' in style) {
        if (typeof style.minWidth === 'string') {
            node.setMinWidthPercent(Number.parseInt(style.minWidth, 10));
        }
        else {
            node.setMinWidth((_a = style.minWidth) !== null && _a !== void 0 ? _a : 0);
        }
    }
    if ('minHeight' in style) {
        if (typeof style.minHeight === 'string') {
            node.setMinHeightPercent(Number.parseInt(style.minHeight, 10));
        }
        else {
            node.setMinHeight((_b = style.minHeight) !== null && _b !== void 0 ? _b : 0);
        }
    }
    if ('maxWidth' in style) {
        if (typeof style.maxWidth === 'string') {
            node.setMaxWidthPercent(Number.parseInt(style.maxWidth, 10));
        }
        else {
            node.setMaxWidth((_c = style.maxWidth) !== null && _c !== void 0 ? _c : 0);
        }
    }
    if ('maxHeight' in style) {
        if (typeof style.maxHeight === 'string') {
            node.setMaxHeightPercent(Number.parseInt(style.maxHeight, 10));
        }
        else {
            node.setMaxHeight((_d = style.maxHeight) !== null && _d !== void 0 ? _d : 0);
        }
    }
};
var applyDisplayStyles = function (node, style) {
    if ('display' in style) {
        node.setDisplay(style.display === 'flex' ? node_js_1.LayoutDisplay.Flex : node_js_1.LayoutDisplay.None);
    }
};
var applyBorderStyles = function (node, style, resolvedStyle) {
    // resolvedStyle is the full current style (already set on the DOM node).
    // style may be a diff with only changed properties. For border side props,
    // we need the resolved value because `borderStyle` in a diff may not include
    // unchanged border side values (e.g. borderTop stays false but isn't in the diff).
    var resolved = resolvedStyle !== null && resolvedStyle !== void 0 ? resolvedStyle : style;
    if ('borderStyle' in style) {
        var borderWidth = style.borderStyle ? 1 : 0;
        node.setBorder(node_js_1.LayoutEdge.Top, resolved.borderTop !== false ? borderWidth : 0);
        node.setBorder(node_js_1.LayoutEdge.Bottom, resolved.borderBottom !== false ? borderWidth : 0);
        node.setBorder(node_js_1.LayoutEdge.Left, resolved.borderLeft !== false ? borderWidth : 0);
        node.setBorder(node_js_1.LayoutEdge.Right, resolved.borderRight !== false ? borderWidth : 0);
    }
    else {
        // Handle individual border property changes (when only borderX changes without borderStyle).
        // Skip undefined values — they mean the prop was removed or never set,
        // not that a border should be enabled.
        if ('borderTop' in style && style.borderTop !== undefined) {
            node.setBorder(node_js_1.LayoutEdge.Top, style.borderTop === false ? 0 : 1);
        }
        if ('borderBottom' in style && style.borderBottom !== undefined) {
            node.setBorder(node_js_1.LayoutEdge.Bottom, style.borderBottom === false ? 0 : 1);
        }
        if ('borderLeft' in style && style.borderLeft !== undefined) {
            node.setBorder(node_js_1.LayoutEdge.Left, style.borderLeft === false ? 0 : 1);
        }
        if ('borderRight' in style && style.borderRight !== undefined) {
            node.setBorder(node_js_1.LayoutEdge.Right, style.borderRight === false ? 0 : 1);
        }
    }
};
var applyGapStyles = function (node, style) {
    var _a, _b, _c;
    if ('gap' in style) {
        node.setGap(node_js_1.LayoutGutter.All, (_a = style.gap) !== null && _a !== void 0 ? _a : 0);
    }
    if ('columnGap' in style) {
        node.setGap(node_js_1.LayoutGutter.Column, (_b = style.columnGap) !== null && _b !== void 0 ? _b : 0);
    }
    if ('rowGap' in style) {
        node.setGap(node_js_1.LayoutGutter.Row, (_c = style.rowGap) !== null && _c !== void 0 ? _c : 0);
    }
};
var styles = function (node, style, resolvedStyle) {
    if (style === void 0) { style = {}; }
    applyPositionStyles(node, style);
    applyOverflowStyles(node, style);
    applyMarginStyles(node, style);
    applyPaddingStyles(node, style);
    applyFlexStyles(node, style);
    applyDimensionStyles(node, style);
    applyDisplayStyles(node, style);
    applyBorderStyles(node, style, resolvedStyle);
    applyGapStyles(node, style);
};
exports.default = styles;
