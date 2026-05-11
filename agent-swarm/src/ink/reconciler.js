"use strict";
/* eslint-disable custom-rules/no-top-level-side-effects */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatcher = void 0;
exports.getOwnerChain = getOwnerChain;
exports.isDebugRepaintsEnabled = isDebugRepaintsEnabled;
exports.recordYogaMs = recordYogaMs;
exports.getLastYogaMs = getLastYogaMs;
exports.markCommitStart = markCommitStart;
exports.getLastCommitMs = getLastCommitMs;
exports.resetProfileCounters = resetProfileCounters;
var fs_1 = require("fs");
var react_reconciler_1 = require("react-reconciler");
var index_js_1 = require("src/native-ts/yoga-layout/index.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var dom_js_1 = require("./dom.js");
var dispatcher_js_1 = require("./events/dispatcher.js");
var event_handlers_js_1 = require("./events/event-handlers.js");
var focus_js_1 = require("./focus.js");
var node_js_1 = require("./layout/node.js");
var styles_js_1 = require("./styles.js");
// We need to conditionally perform devtools connection to avoid
// accidentally breaking other third-party code.
// See https://github.com/vadimdemedes/ink/issues/384
if (process.env.NODE_ENV === 'development') {
    try {
        // eslint-disable-next-line custom-rules/no-top-level-dynamic-import -- dev-only; NODE_ENV check is DCE'd in production
        void Promise.resolve().then(function () { return require('./devtools.js'); });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        if (error.code === 'ERR_MODULE_NOT_FOUND') {
            // biome-ignore lint/suspicious/noConsole: intentional warning
            console.warn("\nThe environment variable DEV is set to true, so Ink tried to import `react-devtools-core`,\nbut this failed as it was not installed. Debugging with React Devtools requires it.\n\nTo install use this command:\n\n$ npm install --save-dev react-devtools-core\n\t\t\t\t".trim() + '\n');
        }
        else {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw error;
        }
    }
}
var diff = function (before, after) {
    if (before === after) {
        return;
    }
    if (!before) {
        return after;
    }
    var changed = {};
    var isChanged = false;
    for (var _i = 0, _a = Object.keys(before); _i < _a.length; _i++) {
        var key = _a[_i];
        var isDeleted = after ? !Object.hasOwn(after, key) : true;
        if (isDeleted) {
            changed[key] = undefined;
            isChanged = true;
        }
    }
    if (after) {
        for (var _b = 0, _c = Object.keys(after); _b < _c.length; _b++) {
            var key = _c[_b];
            if (after[key] !== before[key]) {
                changed[key] = after[key];
                isChanged = true;
            }
        }
    }
    return isChanged ? changed : undefined;
};
var cleanupYogaNode = function (node) {
    var yogaNode = node.yogaNode;
    if (yogaNode) {
        yogaNode.unsetMeasureFunc();
        // Clear all references BEFORE freeing to prevent other code from
        // accessing freed WASM memory during concurrent operations
        (0, dom_js_1.clearYogaNodeReferences)(node);
        yogaNode.freeRecursive();
    }
};
function setEventHandler(node, key, value) {
    if (!node._eventHandlers) {
        node._eventHandlers = {};
    }
    node._eventHandlers[key] = value;
}
function applyProp(node, key, value) {
    if (key === 'children')
        return;
    if (key === 'style') {
        (0, dom_js_1.setStyle)(node, value);
        if (node.yogaNode) {
            (0, styles_js_1.default)(node.yogaNode, value);
        }
        return;
    }
    if (key === 'textStyles') {
        node.textStyles = value;
        return;
    }
    if (event_handlers_js_1.EVENT_HANDLER_PROPS.has(key)) {
        setEventHandler(node, key, value);
        return;
    }
    (0, dom_js_1.setAttribute)(node, key, value);
}
function getOwnerChain(fiber) {
    var _a;
    var chain = [];
    var seen = new Set();
    var cur = fiber;
    for (var i = 0; cur && i < 50; i++) {
        if (seen.has(cur))
            break;
        seen.add(cur);
        var t = cur.elementType;
        var name_1 = typeof t === 'function'
            ? t.displayName ||
                t.name
            : typeof t === 'string'
                ? undefined // host element (ink-box etc) — skip
                : (t === null || t === void 0 ? void 0 : t.displayName) || (t === null || t === void 0 ? void 0 : t.name);
        if (name_1 && name_1 !== chain[chain.length - 1])
            chain.push(name_1);
        cur = (_a = cur._debugOwner) !== null && _a !== void 0 ? _a : cur.return;
    }
    return chain;
}
var debugRepaints;
function isDebugRepaintsEnabled() {
    if (debugRepaints === undefined) {
        debugRepaints = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DEBUG_REPAINTS);
    }
    return debugRepaints;
}
exports.dispatcher = new dispatcher_js_1.Dispatcher();
// --- COMMIT INSTRUMENTATION (temp debugging) ---
// eslint-disable-next-line custom-rules/no-process-env-top-level -- debug instrumentation, read-once is fine
var COMMIT_LOG = process.env.CLAUDE_CODE_COMMIT_LOG;
var _commits = 0;
var _lastLog = 0;
var _lastCommitAt = 0;
var _maxGapMs = 0;
var _createCount = 0;
var _prepareAt = 0;
// --- END ---
// --- SCROLL PROFILING (bench/scroll-e2e.sh reads via getLastYogaMs) ---
// Set by onComputeLayout wrapper in ink.tsx; read by onRender for phases.
var _lastYogaMs = 0;
var _lastCommitMs = 0;
var _commitStart = 0;
function recordYogaMs(ms) {
    _lastYogaMs = ms;
}
function getLastYogaMs() {
    return _lastYogaMs;
}
function markCommitStart() {
    _commitStart = performance.now();
}
function getLastCommitMs() {
    return _lastCommitMs;
}
function resetProfileCounters() {
    _lastYogaMs = 0;
    _lastCommitMs = 0;
    _commitStart = 0;
}
// --- END ---
var reconciler = (0, react_reconciler_1.default)({
    getRootHostContext: function () { return ({ isInsideText: false }); },
    prepareForCommit: function () {
        if (COMMIT_LOG)
            _prepareAt = performance.now();
        return null;
    },
    preparePortalMount: function () { return null; },
    clearContainer: function () { return false; },
    resetAfterCommit: function (rootNode) {
        var _a, _b;
        _lastCommitMs = _commitStart > 0 ? performance.now() - _commitStart : 0;
        _commitStart = 0;
        if (COMMIT_LOG) {
            var now = performance.now();
            _commits++;
            var gap = _lastCommitAt > 0 ? now - _lastCommitAt : 0;
            if (gap > _maxGapMs)
                _maxGapMs = gap;
            _lastCommitAt = now;
            var reconcileMs = _prepareAt > 0 ? now - _prepareAt : 0;
            if (gap > 30 || reconcileMs > 20 || _createCount > 50) {
                // eslint-disable-next-line custom-rules/no-sync-fs -- debug instrumentation
                (0, fs_1.appendFileSync)(COMMIT_LOG, "".concat(now.toFixed(1), " gap=").concat(gap.toFixed(1), "ms reconcile=").concat(reconcileMs.toFixed(1), "ms creates=").concat(_createCount, "\n"));
            }
            _createCount = 0;
            if (now - _lastLog > 1000) {
                // eslint-disable-next-line custom-rules/no-sync-fs -- debug instrumentation
                (0, fs_1.appendFileSync)(COMMIT_LOG, "".concat(now.toFixed(1), " commits=").concat(_commits, "/s maxGap=").concat(_maxGapMs.toFixed(1), "ms\n"));
                _commits = 0;
                _maxGapMs = 0;
                _lastLog = now;
            }
        }
        var _t0 = COMMIT_LOG ? performance.now() : 0;
        if (typeof rootNode.onComputeLayout === 'function') {
            rootNode.onComputeLayout();
        }
        if (COMMIT_LOG) {
            var layoutMs = performance.now() - _t0;
            if (layoutMs > 20) {
                var c = (0, index_js_1.getYogaCounters)();
                // eslint-disable-next-line custom-rules/no-sync-fs -- debug instrumentation
                (0, fs_1.appendFileSync)(COMMIT_LOG, "".concat(_t0.toFixed(1), " SLOW_YOGA ").concat(layoutMs.toFixed(1), "ms visited=").concat(c.visited, " measured=").concat(c.measured, " hits=").concat(c.cacheHits, " live=").concat(c.live, "\n"));
            }
        }
        if (process.env.NODE_ENV === 'test') {
            if (rootNode.childNodes.length === 0 && rootNode.hasRenderedContent) {
                return;
            }
            if (rootNode.childNodes.length > 0) {
                rootNode.hasRenderedContent = true;
            }
            (_a = rootNode.onImmediateRender) === null || _a === void 0 ? void 0 : _a.call(rootNode);
            return;
        }
        var _tr = COMMIT_LOG ? performance.now() : 0;
        (_b = rootNode.onRender) === null || _b === void 0 ? void 0 : _b.call(rootNode);
        if (COMMIT_LOG) {
            var renderMs = performance.now() - _tr;
            if (renderMs > 10) {
                // eslint-disable-next-line custom-rules/no-sync-fs -- debug instrumentation
                (0, fs_1.appendFileSync)(COMMIT_LOG, "".concat(_tr.toFixed(1), " SLOW_PAINT ").concat(renderMs.toFixed(1), "ms\n"));
            }
        }
    },
    getChildHostContext: function (parentHostContext, type) {
        var previousIsInsideText = parentHostContext.isInsideText;
        var isInsideText = type === 'ink-text' || type === 'ink-virtual-text' || type === 'ink-link';
        if (previousIsInsideText === isInsideText) {
            return parentHostContext;
        }
        return { isInsideText: isInsideText };
    },
    shouldSetTextContent: function () { return false; },
    createInstance: function (originalType, newProps, _root, hostContext, internalHandle) {
        if (hostContext.isInsideText && originalType === 'ink-box') {
            throw new Error("<Box> can't be nested inside <Text> component");
        }
        var type = originalType === 'ink-text' && hostContext.isInsideText
            ? 'ink-virtual-text'
            : originalType;
        var node = (0, dom_js_1.createNode)(type);
        if (COMMIT_LOG)
            _createCount++;
        for (var _i = 0, _a = Object.entries(newProps); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            applyProp(node, key, value);
        }
        if (isDebugRepaintsEnabled()) {
            node.debugOwnerChain = getOwnerChain(internalHandle);
        }
        return node;
    },
    createTextInstance: function (text, _root, hostContext) {
        if (!hostContext.isInsideText) {
            throw new Error("Text string \"".concat(text, "\" must be rendered inside <Text> component"));
        }
        return (0, dom_js_1.createTextNode)(text);
    },
    resetTextContent: function () { },
    hideTextInstance: function (node) {
        (0, dom_js_1.setTextNodeValue)(node, '');
    },
    unhideTextInstance: function (node, text) {
        (0, dom_js_1.setTextNodeValue)(node, text);
    },
    getPublicInstance: function (instance) { return instance; },
    hideInstance: function (node) {
        var _a;
        node.isHidden = true;
        (_a = node.yogaNode) === null || _a === void 0 ? void 0 : _a.setDisplay(node_js_1.LayoutDisplay.None);
        (0, dom_js_1.markDirty)(node);
    },
    unhideInstance: function (node) {
        var _a;
        node.isHidden = false;
        (_a = node.yogaNode) === null || _a === void 0 ? void 0 : _a.setDisplay(node_js_1.LayoutDisplay.Flex);
        (0, dom_js_1.markDirty)(node);
    },
    appendInitialChild: dom_js_1.appendChildNode,
    appendChild: dom_js_1.appendChildNode,
    insertBefore: dom_js_1.insertBeforeNode,
    finalizeInitialChildren: function (_node, _type, props) {
        return props['autoFocus'] === true;
    },
    commitMount: function (node) {
        (0, focus_js_1.getFocusManager)(node).handleAutoFocus(node);
    },
    isPrimaryRenderer: true,
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    getCurrentUpdatePriority: function () { return exports.dispatcher.currentUpdatePriority; },
    beforeActiveInstanceBlur: function () { },
    afterActiveInstanceBlur: function () { },
    detachDeletedInstance: function () { },
    getInstanceFromNode: function () { return null; },
    prepareScopeUpdate: function () { },
    getInstanceFromScope: function () { return null; },
    appendChildToContainer: dom_js_1.appendChildNode,
    insertInContainerBefore: dom_js_1.insertBeforeNode,
    removeChildFromContainer: function (node, removeNode) {
        (0, dom_js_1.removeChildNode)(node, removeNode);
        cleanupYogaNode(removeNode);
        (0, focus_js_1.getFocusManager)(node).handleNodeRemoved(removeNode, node);
    },
    // React 19 commitUpdate receives old and new props directly instead of an updatePayload
    commitUpdate: function (node, _type, oldProps, newProps) {
        var props = diff(oldProps, newProps);
        var style = diff(oldProps['style'], newProps['style']);
        if (props) {
            for (var _i = 0, _a = Object.entries(props); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (key === 'style') {
                    (0, dom_js_1.setStyle)(node, value);
                    continue;
                }
                if (key === 'textStyles') {
                    (0, dom_js_1.setTextStyles)(node, value);
                    continue;
                }
                if (event_handlers_js_1.EVENT_HANDLER_PROPS.has(key)) {
                    setEventHandler(node, key, value);
                    continue;
                }
                (0, dom_js_1.setAttribute)(node, key, value);
            }
        }
        if (style && node.yogaNode) {
            (0, styles_js_1.default)(node.yogaNode, style, newProps['style']);
        }
    },
    commitTextUpdate: function (node, _oldText, newText) {
        (0, dom_js_1.setTextNodeValue)(node, newText);
    },
    removeChild: function (node, removeNode) {
        (0, dom_js_1.removeChildNode)(node, removeNode);
        cleanupYogaNode(removeNode);
        if (removeNode.nodeName !== '#text') {
            var root = (0, focus_js_1.getRootNode)(node);
            root.focusManager.handleNodeRemoved(removeNode, root);
        }
    },
    // React 19 required methods
    maySuspendCommit: function () {
        return false;
    },
    preloadInstance: function () {
        return true;
    },
    startSuspendingCommit: function () { },
    suspendInstance: function () { },
    waitForCommitToBeReady: function () {
        return null;
    },
    NotPendingTransition: null,
    HostTransitionContext: {
        $$typeof: Symbol.for('react.context'),
        _currentValue: null,
    },
    setCurrentUpdatePriority: function (newPriority) {
        exports.dispatcher.currentUpdatePriority = newPriority;
    },
    resolveUpdatePriority: function () {
        return exports.dispatcher.resolveEventPriority();
    },
    resetFormInstance: function () { },
    requestPostPaintCallback: function () { },
    shouldAttemptEagerTransition: function () {
        return false;
    },
    trackSchedulerEvent: function () { },
    resolveEventType: function () {
        var _a, _b;
        return (_b = (_a = exports.dispatcher.currentEvent) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : null;
    },
    resolveEventTimeStamp: function () {
        var _a, _b;
        return (_b = (_a = exports.dispatcher.currentEvent) === null || _a === void 0 ? void 0 : _a.timeStamp) !== null && _b !== void 0 ? _b : -1.1;
    },
});
// Wire the reconciler's discreteUpdates into the dispatcher.
// This breaks the import cycle: dispatcher.ts doesn't import reconciler.ts.
exports.dispatcher.discreteUpdates = reconciler.discreteUpdates.bind(reconciler);
exports.default = reconciler;
