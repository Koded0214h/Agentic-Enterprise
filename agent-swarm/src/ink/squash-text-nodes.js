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
Object.defineProperty(exports, "__esModule", { value: true });
exports.squashTextNodesToSegments = squashTextNodesToSegments;
/**
 * Squash text nodes into styled segments, propagating styles down through the tree.
 * This allows structured styling without relying on ANSI string transforms.
 */
function squashTextNodesToSegments(node, inheritedStyles, inheritedHyperlink, out) {
    if (inheritedStyles === void 0) { inheritedStyles = {}; }
    if (out === void 0) { out = []; }
    var mergedStyles = node.textStyles
        ? __assign(__assign({}, inheritedStyles), node.textStyles) : inheritedStyles;
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var childNode = _a[_i];
        if (childNode === undefined) {
            continue;
        }
        if (childNode.nodeName === '#text') {
            if (childNode.nodeValue.length > 0) {
                out.push({
                    text: childNode.nodeValue,
                    styles: mergedStyles,
                    hyperlink: inheritedHyperlink,
                });
            }
        }
        else if (childNode.nodeName === 'ink-text' ||
            childNode.nodeName === 'ink-virtual-text') {
            squashTextNodesToSegments(childNode, mergedStyles, inheritedHyperlink, out);
        }
        else if (childNode.nodeName === 'ink-link') {
            var href = childNode.attributes['href'];
            squashTextNodesToSegments(childNode, mergedStyles, href || inheritedHyperlink, out);
        }
    }
    return out;
}
/**
 * Squash text nodes into a plain string (without styles).
 * Used for text measurement in layout calculations.
 */
function squashTextNodes(node) {
    var text = '';
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var childNode = _a[_i];
        if (childNode === undefined) {
            continue;
        }
        if (childNode.nodeName === '#text') {
            text += childNode.nodeValue;
        }
        else if (childNode.nodeName === 'ink-text' ||
            childNode.nodeName === 'ink-virtual-text') {
            text += squashTextNodes(childNode);
        }
        else if (childNode.nodeName === 'ink-link') {
            text += squashTextNodes(childNode);
        }
    }
    return text;
}
exports.default = squashTextNodes;
