"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeify = treeify;
var figures_1 = require("figures");
var color_js_1 = require("../components/design-system/color.js");
var DEFAULT_TREE_CHARS = {
    branch: figures_1.default.lineUpDownRight, // '├'
    lastBranch: figures_1.default.lineUpRight, // '└'
    line: figures_1.default.lineVertical, // '│'
    empty: ' ',
};
/**
 * Custom treeify implementation with Ink theme color support
 * Based on https://github.com/notatestuser/treeify
 */
function treeify(obj, options) {
    if (options === void 0) { options = {}; }
    var _a = options.showValues, showValues = _a === void 0 ? true : _a, _b = options.hideFunctions, hideFunctions = _b === void 0 ? false : _b, _c = options.themeName, themeName = _c === void 0 ? 'dark' : _c, _d = options.treeCharColors, treeCharColors = _d === void 0 ? {} : _d;
    var lines = [];
    var visited = new WeakSet();
    function colorize(text, colorKey) {
        if (!colorKey)
            return text;
        return (0, color_js_1.color)(colorKey, themeName)(text);
    }
    function growBranch(node, prefix, _isLast, depth) {
        if (depth === void 0) { depth = 0; }
        if (typeof node === 'string') {
            lines.push(prefix + colorize(node, treeCharColors.value));
            return;
        }
        if (typeof node !== 'object' || node === null) {
            if (showValues) {
                var valueStr = String(node);
                lines.push(prefix + colorize(valueStr, treeCharColors.value));
            }
            return;
        }
        // Check for circular references
        if (visited.has(node)) {
            lines.push(prefix + colorize('[Circular]', treeCharColors.value));
            return;
        }
        visited.add(node);
        var keys = Object.keys(node).filter(function (key) {
            var value = node[key];
            if (hideFunctions && typeof value === 'function')
                return false;
            return true;
        });
        keys.forEach(function (key, index) {
            var value = node[key];
            var isLastKey = index === keys.length - 1;
            var nodePrefix = depth === 0 && index === 0 ? '' : prefix;
            // Determine which tree character to use
            var treeChar = isLastKey
                ? DEFAULT_TREE_CHARS.lastBranch
                : DEFAULT_TREE_CHARS.branch;
            var coloredTreeChar = colorize(treeChar, treeCharColors.treeChar);
            var coloredKey = key.trim() === '' ? '' : colorize(key, treeCharColors.key);
            var line = nodePrefix + coloredTreeChar + (coloredKey ? ' ' + coloredKey : '');
            // Check if we should add a colon (not for empty/whitespace keys)
            var shouldAddColon = key.trim() !== '';
            // Check for circular reference before recursing
            if (value && typeof value === 'object' && visited.has(value)) {
                var coloredValue = colorize('[Circular]', treeCharColors.value);
                lines.push(line + (shouldAddColon ? ': ' : line ? ' ' : '') + coloredValue);
            }
            else if (value && typeof value === 'object' && !Array.isArray(value)) {
                lines.push(line);
                // Calculate the continuation prefix for nested items
                var continuationChar = isLastKey
                    ? DEFAULT_TREE_CHARS.empty
                    : DEFAULT_TREE_CHARS.line;
                var coloredContinuation = colorize(continuationChar, treeCharColors.treeChar);
                var nextPrefix = nodePrefix + coloredContinuation + ' ';
                growBranch(value, nextPrefix, isLastKey, depth + 1);
            }
            else if (Array.isArray(value)) {
                // Handle arrays
                lines.push(line +
                    (shouldAddColon ? ': ' : line ? ' ' : '') +
                    '[Array(' +
                    value.length +
                    ')]');
            }
            else if (showValues) {
                // Add value if showValues is true
                var valueStr = typeof value === 'function' ? '[Function]' : String(value);
                var coloredValue = colorize(valueStr, treeCharColors.value);
                line += (shouldAddColon ? ': ' : line ? ' ' : '') + coloredValue;
                lines.push(line);
            }
            else {
                lines.push(line);
            }
        });
    }
    // Start growing the tree
    var keys = Object.keys(obj);
    if (keys.length === 0) {
        return colorize('(empty)', treeCharColors.value);
    }
    // Special case for single empty/whitespace string key
    if (keys.length === 1 &&
        keys[0] !== undefined &&
        keys[0].trim() === '' &&
        typeof obj[keys[0]] === 'string') {
        var firstKey = keys[0];
        var coloredTreeChar = colorize(DEFAULT_TREE_CHARS.lastBranch, treeCharColors.treeChar);
        var coloredValue = colorize(obj[firstKey], treeCharColors.value);
        return coloredTreeChar + ' ' + coloredValue;
    }
    growBranch(obj, '', true);
    return lines.join('\n');
}
