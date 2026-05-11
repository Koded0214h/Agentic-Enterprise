"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearYogaNodeReferences = exports.setTextNodeValue = exports.scheduleRenderFrom = exports.markDirty = exports.createTextNode = exports.setTextStyles = exports.setStyle = exports.setAttribute = exports.removeChildNode = exports.insertBeforeNode = exports.appendChildNode = exports.createNode = void 0;
exports.findOwnerChainAtRow = findOwnerChainAtRow;
var engine_js_1 = require("./layout/engine.js");
var node_js_1 = require("./layout/node.js");
var measure_text_js_1 = require("./measure-text.js");
var node_cache_js_1 = require("./node-cache.js");
var squash_text_nodes_js_1 = require("./squash-text-nodes.js");
var tabstops_js_1 = require("./tabstops.js");
var wrap_text_js_1 = require("./wrap-text.js");
var createNode = function (nodeName) {
    var _a, _b;
    var needsYogaNode = nodeName !== 'ink-virtual-text' &&
        nodeName !== 'ink-link' &&
        nodeName !== 'ink-progress';
    var node = {
        nodeName: nodeName,
        style: {},
        attributes: {},
        childNodes: [],
        parentNode: undefined,
        yogaNode: needsYogaNode ? (0, engine_js_1.createLayoutNode)() : undefined,
        dirty: false,
    };
    if (nodeName === 'ink-text') {
        (_a = node.yogaNode) === null || _a === void 0 ? void 0 : _a.setMeasureFunc(measureTextNode.bind(null, node));
    }
    else if (nodeName === 'ink-raw-ansi') {
        (_b = node.yogaNode) === null || _b === void 0 ? void 0 : _b.setMeasureFunc(measureRawAnsiNode.bind(null, node));
    }
    return node;
};
exports.createNode = createNode;
var appendChildNode = function (node, childNode) {
    var _a;
    if (childNode.parentNode) {
        (0, exports.removeChildNode)(childNode.parentNode, childNode);
    }
    childNode.parentNode = node;
    node.childNodes.push(childNode);
    if (childNode.yogaNode) {
        (_a = node.yogaNode) === null || _a === void 0 ? void 0 : _a.insertChild(childNode.yogaNode, node.yogaNode.getChildCount());
    }
    (0, exports.markDirty)(node);
};
exports.appendChildNode = appendChildNode;
var insertBeforeNode = function (node, newChildNode, beforeChildNode) {
    var _a, _b;
    if (newChildNode.parentNode) {
        (0, exports.removeChildNode)(newChildNode.parentNode, newChildNode);
    }
    newChildNode.parentNode = node;
    var index = node.childNodes.indexOf(beforeChildNode);
    if (index >= 0) {
        // Calculate yoga index BEFORE modifying childNodes.
        // We can't use DOM index directly because some children (like ink-progress,
        // ink-link, ink-virtual-text) don't have yogaNodes, so DOM indices don't
        // match yoga indices.
        var yogaIndex = 0;
        if (newChildNode.yogaNode && node.yogaNode) {
            for (var i = 0; i < index; i++) {
                if ((_a = node.childNodes[i]) === null || _a === void 0 ? void 0 : _a.yogaNode) {
                    yogaIndex++;
                }
            }
        }
        node.childNodes.splice(index, 0, newChildNode);
        if (newChildNode.yogaNode && node.yogaNode) {
            node.yogaNode.insertChild(newChildNode.yogaNode, yogaIndex);
        }
        (0, exports.markDirty)(node);
        return;
    }
    node.childNodes.push(newChildNode);
    if (newChildNode.yogaNode) {
        (_b = node.yogaNode) === null || _b === void 0 ? void 0 : _b.insertChild(newChildNode.yogaNode, node.yogaNode.getChildCount());
    }
    (0, exports.markDirty)(node);
};
exports.insertBeforeNode = insertBeforeNode;
var removeChildNode = function (node, removeNode) {
    var _a, _b;
    if (removeNode.yogaNode) {
        (_b = (_a = removeNode.parentNode) === null || _a === void 0 ? void 0 : _a.yogaNode) === null || _b === void 0 ? void 0 : _b.removeChild(removeNode.yogaNode);
    }
    // Collect cached rects from the removed subtree so they can be cleared
    collectRemovedRects(node, removeNode);
    removeNode.parentNode = undefined;
    var index = node.childNodes.indexOf(removeNode);
    if (index >= 0) {
        node.childNodes.splice(index, 1);
    }
    (0, exports.markDirty)(node);
};
exports.removeChildNode = removeChildNode;
function collectRemovedRects(parent, removed, underAbsolute) {
    if (underAbsolute === void 0) { underAbsolute = false; }
    if (removed.nodeName === '#text')
        return;
    var elem = removed;
    // If this node or any ancestor in the removed subtree was absolute,
    // its painted pixels may overlap non-siblings — flag for global blit
    // disable. Normal-flow removals only affect direct siblings, which
    // hasRemovedChild already handles.
    var isAbsolute = underAbsolute || elem.style.position === 'absolute';
    var cached = node_cache_js_1.nodeCache.get(elem);
    if (cached) {
        (0, node_cache_js_1.addPendingClear)(parent, cached, isAbsolute);
        node_cache_js_1.nodeCache.delete(elem);
    }
    for (var _i = 0, _a = elem.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        collectRemovedRects(parent, child, isAbsolute);
    }
}
var setAttribute = function (node, key, value) {
    // Skip 'children' - React handles children via appendChild/removeChild,
    // not attributes. React always passes a new children reference, so
    // tracking it as an attribute would mark everything dirty every render.
    if (key === 'children') {
        return;
    }
    // Skip if unchanged
    if (node.attributes[key] === value) {
        return;
    }
    node.attributes[key] = value;
    (0, exports.markDirty)(node);
};
exports.setAttribute = setAttribute;
var setStyle = function (node, style) {
    // Compare style properties to avoid marking dirty unnecessarily.
    // React creates new style objects on every render even when unchanged.
    if (stylesEqual(node.style, style)) {
        return;
    }
    node.style = style;
    (0, exports.markDirty)(node);
};
exports.setStyle = setStyle;
var setTextStyles = function (node, textStyles) {
    // Same dirty-check guard as setStyle: React (and buildTextStyles in Text.tsx)
    // allocate a new textStyles object on every render even when values are
    // unchanged, so compare by value to avoid markDirty -> yoga re-measurement
    // on every Text re-render.
    if (shallowEqual(node.textStyles, textStyles)) {
        return;
    }
    node.textStyles = textStyles;
    (0, exports.markDirty)(node);
};
exports.setTextStyles = setTextStyles;
function stylesEqual(a, b) {
    return shallowEqual(a, b);
}
function shallowEqual(a, b) {
    // Fast path: same object reference (or both undefined)
    if (a === b)
        return true;
    if (a === undefined || b === undefined)
        return false;
    // Get all keys from both objects
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    // Different number of properties
    if (aKeys.length !== bKeys.length)
        return false;
    // Compare each property
    for (var _i = 0, aKeys_1 = aKeys; _i < aKeys_1.length; _i++) {
        var key = aKeys_1[_i];
        if (a[key] !== b[key])
            return false;
    }
    return true;
}
var createTextNode = function (text) {
    var node = {
        nodeName: '#text',
        nodeValue: text,
        yogaNode: undefined,
        parentNode: undefined,
        style: {},
    };
    (0, exports.setTextNodeValue)(node, text);
    return node;
};
exports.createTextNode = createTextNode;
var measureTextNode = function (node, width, widthMode) {
    var _a, _b;
    var rawText = node.nodeName === '#text' ? node.nodeValue : (0, squash_text_nodes_js_1.default)(node);
    // Expand tabs for measurement (worst case: 8 spaces each).
    // Actual tab expansion happens in output.ts based on screen position.
    var text = (0, tabstops_js_1.expandTabs)(rawText);
    var dimensions = (0, measure_text_js_1.default)(text, width);
    // Text fits into container, no need to wrap
    if (dimensions.width <= width) {
        return dimensions;
    }
    // This is happening when <Box> is shrinking child nodes and layout asks
    // if we can fit this text node in a <1px space, so we just say "no"
    if (dimensions.width >= 1 && width > 0 && width < 1) {
        return dimensions;
    }
    // For text with embedded newlines (pre-wrapped content), avoid re-wrapping
    // at measurement width when layout is asking for intrinsic size (Undefined mode).
    // This prevents height inflation during min/max size checks.
    //
    // However, when layout provides an actual constraint (Exactly or AtMost mode),
    // we must respect it and measure at that width. Otherwise, if the actual
    // rendering width is smaller than the natural width, the text will wrap to
    // more lines than layout expects, causing content to be truncated.
    if (text.includes('\n') && widthMode === node_js_1.LayoutMeasureMode.Undefined) {
        var effectiveWidth = Math.max(width, dimensions.width);
        return (0, measure_text_js_1.default)(text, effectiveWidth);
    }
    var textWrap = (_b = (_a = node.style) === null || _a === void 0 ? void 0 : _a.textWrap) !== null && _b !== void 0 ? _b : 'wrap';
    var wrappedText = (0, wrap_text_js_1.default)(text, width, textWrap);
    return (0, measure_text_js_1.default)(wrappedText, width);
};
// ink-raw-ansi nodes hold pre-rendered ANSI strings with known dimensions.
// No stringWidth, no wrapping, no tab expansion — the producer (e.g. ColorDiff)
// already wrapped to the target width and each line is exactly one terminal row.
var measureRawAnsiNode = function (node) {
    return {
        width: node.attributes['rawWidth'],
        height: node.attributes['rawHeight'],
    };
};
/**
 * Mark a node and all its ancestors as dirty for re-rendering.
 * Also marks yoga dirty for text remeasurement if this is a text node.
 */
var markDirty = function (node) {
    var current = node;
    var markedYoga = false;
    while (current) {
        if (current.nodeName !== '#text') {
            ;
            current.dirty = true;
            // Only mark yoga dirty on leaf nodes that have measure functions
            if (!markedYoga &&
                (current.nodeName === 'ink-text' ||
                    current.nodeName === 'ink-raw-ansi') &&
                current.yogaNode) {
                current.yogaNode.markDirty();
                markedYoga = true;
            }
        }
        current = current.parentNode;
    }
};
exports.markDirty = markDirty;
// Walk to root and call its onRender (the throttled scheduleRender). Use for
// DOM-level mutations (scrollTop changes) that should trigger an Ink frame
// without going through React's reconciler. Pair with markDirty() so the
// renderer knows which subtree to re-evaluate.
var scheduleRenderFrom = function (node) {
    var _a, _b;
    var cur = node;
    while (cur === null || cur === void 0 ? void 0 : cur.parentNode)
        cur = cur.parentNode;
    if (cur && cur.nodeName !== '#text')
        (_b = (_a = cur).onRender) === null || _b === void 0 ? void 0 : _b.call(_a);
};
exports.scheduleRenderFrom = scheduleRenderFrom;
var setTextNodeValue = function (node, text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    // Skip if unchanged
    if (node.nodeValue === text) {
        return;
    }
    node.nodeValue = text;
    (0, exports.markDirty)(node);
};
exports.setTextNodeValue = setTextNodeValue;
function isDOMElement(node) {
    return node.nodeName !== '#text';
}
// Clear yogaNode references recursively before freeing.
// freeRecursive() frees the node and ALL its children, so we must clear
// all yogaNode references to prevent dangling pointers.
var clearYogaNodeReferences = function (node) {
    if ('childNodes' in node) {
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var child = _a[_i];
            (0, exports.clearYogaNodeReferences)(child);
        }
    }
    node.yogaNode = undefined;
};
exports.clearYogaNodeReferences = clearYogaNodeReferences;
/**
 * Find the React component stack responsible for content at screen row `y`.
 *
 * DFS the DOM tree accumulating yoga offsets. Returns the debugOwnerChain of
 * the deepest node whose bounding box contains `y`. Called from ink.tsx when
 * log-update triggers a full reset, to attribute the flicker to its source.
 *
 * Only useful when CLAUDE_CODE_DEBUG_REPAINTS is set (otherwise chains are
 * undefined and this returns []).
 */
function findOwnerChainAtRow(root, y) {
    var best = [];
    walk(root, 0);
    return best;
    function walk(node, offsetY) {
        var yoga = node.yogaNode;
        if (!yoga || yoga.getDisplay() === node_js_1.LayoutDisplay.None)
            return;
        var top = offsetY + yoga.getComputedTop();
        var height = yoga.getComputedHeight();
        if (y < top || y >= top + height)
            return;
        if (node.debugOwnerChain)
            best = node.debugOwnerChain;
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var child = _a[_i];
            if (isDOMElement(child))
                walk(child, top);
        }
    }
}
