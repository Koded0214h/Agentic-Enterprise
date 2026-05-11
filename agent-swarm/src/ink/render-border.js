"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOM_BORDER_STYLES = void 0;
var chalk_1 = require("chalk");
var cli_boxes_1 = require("cli-boxes");
var colorize_js_1 = require("./colorize.js");
var stringWidth_js_1 = require("./stringWidth.js");
exports.CUSTOM_BORDER_STYLES = {
    dashed: {
        top: '╌',
        left: '╎',
        right: '╎',
        bottom: '╌',
        // there aren't any line-drawing characters for dashes unfortunately
        topLeft: ' ',
        topRight: ' ',
        bottomLeft: ' ',
        bottomRight: ' ',
    },
};
function embedTextInBorder(borderLine, text, align, offset, borderChar) {
    if (offset === void 0) { offset = 0; }
    var textLength = (0, stringWidth_js_1.stringWidth)(text);
    var borderLength = borderLine.length;
    if (textLength >= borderLength - 2) {
        return ['', text.substring(0, borderLength), ''];
    }
    var position;
    if (align === 'center') {
        position = Math.floor((borderLength - textLength) / 2);
    }
    else if (align === 'start') {
        position = offset + 1; // +1 to account for corner character
    }
    else {
        // align === 'end'
        position = borderLength - textLength - offset - 1; // -1 for corner character
    }
    // Ensure position is valid
    position = Math.max(1, Math.min(position, borderLength - textLength - 1));
    var before = borderLine.substring(0, 1) + borderChar.repeat(position - 1);
    var after = borderChar.repeat(borderLength - position - textLength - 1) +
        borderLine.substring(borderLength - 1);
    return [before, text, after];
}
function styleBorderLine(line, color, dim) {
    var styled = (0, colorize_js_1.applyColor)(line, color);
    if (dim) {
        styled = chalk_1.default.dim(styled);
    }
    return styled;
}
var renderBorder = function (x, y, node, output) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    if (node.style.borderStyle) {
        var width = Math.floor(node.yogaNode.getComputedWidth());
        var height = Math.floor(node.yogaNode.getComputedHeight());
        var box = typeof node.style.borderStyle === 'string'
            ? ((_a = exports.CUSTOM_BORDER_STYLES[node.style.borderStyle]) !== null && _a !== void 0 ? _a : cli_boxes_1.default[node.style.borderStyle])
            : node.style.borderStyle;
        var topBorderColor = (_b = node.style.borderTopColor) !== null && _b !== void 0 ? _b : node.style.borderColor;
        var bottomBorderColor = (_c = node.style.borderBottomColor) !== null && _c !== void 0 ? _c : node.style.borderColor;
        var leftBorderColor = (_d = node.style.borderLeftColor) !== null && _d !== void 0 ? _d : node.style.borderColor;
        var rightBorderColor = (_e = node.style.borderRightColor) !== null && _e !== void 0 ? _e : node.style.borderColor;
        var dimTopBorderColor = (_f = node.style.borderTopDimColor) !== null && _f !== void 0 ? _f : node.style.borderDimColor;
        var dimBottomBorderColor = (_g = node.style.borderBottomDimColor) !== null && _g !== void 0 ? _g : node.style.borderDimColor;
        var dimLeftBorderColor = (_h = node.style.borderLeftDimColor) !== null && _h !== void 0 ? _h : node.style.borderDimColor;
        var dimRightBorderColor = (_j = node.style.borderRightDimColor) !== null && _j !== void 0 ? _j : node.style.borderDimColor;
        var showTopBorder = node.style.borderTop !== false;
        var showBottomBorder = node.style.borderBottom !== false;
        var showLeftBorder = node.style.borderLeft !== false;
        var showRightBorder = node.style.borderRight !== false;
        var contentWidth = Math.max(0, width - (showLeftBorder ? 1 : 0) - (showRightBorder ? 1 : 0));
        var topBorderLine = showTopBorder
            ? (showLeftBorder ? box.topLeft : '') +
                box.top.repeat(contentWidth) +
                (showRightBorder ? box.topRight : '')
            : '';
        // Handle text in top border
        var topBorder = void 0;
        if (showTopBorder && ((_k = node.style.borderText) === null || _k === void 0 ? void 0 : _k.position) === 'top') {
            var _m = embedTextInBorder(topBorderLine, node.style.borderText.content, node.style.borderText.align, node.style.borderText.offset, box.top), before = _m[0], text = _m[1], after = _m[2];
            topBorder =
                styleBorderLine(before, topBorderColor, dimTopBorderColor) +
                    text +
                    styleBorderLine(after, topBorderColor, dimTopBorderColor);
        }
        else if (showTopBorder) {
            topBorder = styleBorderLine(topBorderLine, topBorderColor, dimTopBorderColor);
        }
        var verticalBorderHeight = height;
        if (showTopBorder) {
            verticalBorderHeight -= 1;
        }
        if (showBottomBorder) {
            verticalBorderHeight -= 1;
        }
        verticalBorderHeight = Math.max(0, verticalBorderHeight);
        var leftBorder = ((0, colorize_js_1.applyColor)(box.left, leftBorderColor) + '\n').repeat(verticalBorderHeight);
        if (dimLeftBorderColor) {
            leftBorder = chalk_1.default.dim(leftBorder);
        }
        var rightBorder = ((0, colorize_js_1.applyColor)(box.right, rightBorderColor) + '\n').repeat(verticalBorderHeight);
        if (dimRightBorderColor) {
            rightBorder = chalk_1.default.dim(rightBorder);
        }
        var bottomBorderLine = showBottomBorder
            ? (showLeftBorder ? box.bottomLeft : '') +
                box.bottom.repeat(contentWidth) +
                (showRightBorder ? box.bottomRight : '')
            : '';
        // Handle text in bottom border
        var bottomBorder = void 0;
        if (showBottomBorder && ((_l = node.style.borderText) === null || _l === void 0 ? void 0 : _l.position) === 'bottom') {
            var _o = embedTextInBorder(bottomBorderLine, node.style.borderText.content, node.style.borderText.align, node.style.borderText.offset, box.bottom), before = _o[0], text = _o[1], after = _o[2];
            bottomBorder =
                styleBorderLine(before, bottomBorderColor, dimBottomBorderColor) +
                    text +
                    styleBorderLine(after, bottomBorderColor, dimBottomBorderColor);
        }
        else if (showBottomBorder) {
            bottomBorder = styleBorderLine(bottomBorderLine, bottomBorderColor, dimBottomBorderColor);
        }
        var offsetY = showTopBorder ? 1 : 0;
        if (topBorder) {
            output.write(x, y, topBorder);
        }
        if (showLeftBorder) {
            output.write(x, y + offsetY, leftBorder);
        }
        if (showRightBorder) {
            output.write(x + width - 1, y + offsetY, rightBorder);
        }
        if (bottomBorder) {
            output.write(x, y + height - 1, bottomBorder);
        }
    }
};
exports.default = renderBorder;
