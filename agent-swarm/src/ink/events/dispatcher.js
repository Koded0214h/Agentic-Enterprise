"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatcher = void 0;
var constants_js_1 = require("react-reconciler/constants.js");
var log_js_1 = require("../../utils/log.js");
var event_handlers_js_1 = require("./event-handlers.js");
function getHandler(node, eventType, capture) {
    var handlers = node._eventHandlers;
    if (!handlers)
        return undefined;
    var mapping = event_handlers_js_1.HANDLER_FOR_EVENT[eventType];
    if (!mapping)
        return undefined;
    var propName = capture ? mapping.capture : mapping.bubble;
    if (!propName)
        return undefined;
    return handlers[propName];
}
/**
 * Collect all listeners for an event in dispatch order.
 *
 * Uses react-dom's two-phase accumulation pattern:
 * - Walk from target to root
 * - Capture handlers are prepended (unshift) → root-first
 * - Bubble handlers are appended (push) → target-first
 *
 * Result: [root-cap, ..., parent-cap, target-cap, target-bub, parent-bub, ..., root-bub]
 */
function collectListeners(target, event) {
    var listeners = [];
    var node = target;
    while (node) {
        var isTarget = node === target;
        var captureHandler = getHandler(node, event.type, true);
        var bubbleHandler = getHandler(node, event.type, false);
        if (captureHandler) {
            listeners.unshift({
                node: node,
                handler: captureHandler,
                phase: isTarget ? 'at_target' : 'capturing',
            });
        }
        if (bubbleHandler && (event.bubbles || isTarget)) {
            listeners.push({
                node: node,
                handler: bubbleHandler,
                phase: isTarget ? 'at_target' : 'bubbling',
            });
        }
        node = node.parentNode;
    }
    return listeners;
}
/**
 * Execute collected listeners with propagation control.
 *
 * Before each handler, calls event._prepareForTarget(node) so event
 * subclasses can do per-node setup.
 */
function processDispatchQueue(listeners, event) {
    var previousNode;
    for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
        var _a = listeners_1[_i], node = _a.node, handler = _a.handler, phase = _a.phase;
        if (event._isImmediatePropagationStopped()) {
            break;
        }
        if (event._isPropagationStopped() && node !== previousNode) {
            break;
        }
        event._setEventPhase(phase);
        event._setCurrentTarget(node);
        event._prepareForTarget(node);
        try {
            handler(event);
        }
        catch (error) {
            (0, log_js_1.logError)(error);
        }
        previousNode = node;
    }
}
// --
/**
 * Map terminal event types to React scheduling priorities.
 * Mirrors react-dom's getEventPriority() switch.
 */
function getEventPriority(eventType) {
    switch (eventType) {
        case 'keydown':
        case 'keyup':
        case 'click':
        case 'focus':
        case 'blur':
        case 'paste':
            return constants_js_1.DiscreteEventPriority;
        case 'resize':
        case 'scroll':
        case 'mousemove':
            return constants_js_1.ContinuousEventPriority;
        default:
            return constants_js_1.DefaultEventPriority;
    }
}
/**
 * Owns event dispatch state and the capture/bubble dispatch loop.
 *
 * The reconciler host config reads currentEvent and currentUpdatePriority
 * to implement resolveUpdatePriority, resolveEventType, and
 * resolveEventTimeStamp — mirroring how react-dom's host config reads
 * ReactDOMSharedInternals and window.event.
 *
 * discreteUpdates is injected after construction (by InkReconciler)
 * to break the import cycle.
 */
var Dispatcher = /** @class */ (function () {
    function Dispatcher() {
        this.currentEvent = null;
        this.currentUpdatePriority = constants_js_1.DefaultEventPriority;
        this.discreteUpdates = null;
    }
    /**
     * Infer event priority from the currently-dispatching event.
     * Called by the reconciler host config's resolveUpdatePriority
     * when no explicit priority has been set.
     */
    Dispatcher.prototype.resolveEventPriority = function () {
        if (this.currentUpdatePriority !== constants_js_1.NoEventPriority) {
            return this.currentUpdatePriority;
        }
        if (this.currentEvent) {
            return getEventPriority(this.currentEvent.type);
        }
        return constants_js_1.DefaultEventPriority;
    };
    /**
     * Dispatch an event through capture and bubble phases.
     * Returns true if preventDefault() was NOT called.
     */
    Dispatcher.prototype.dispatch = function (target, event) {
        var previousEvent = this.currentEvent;
        this.currentEvent = event;
        try {
            event._setTarget(target);
            var listeners = collectListeners(target, event);
            processDispatchQueue(listeners, event);
            event._setEventPhase('none');
            event._setCurrentTarget(null);
            return !event.defaultPrevented;
        }
        finally {
            this.currentEvent = previousEvent;
        }
    };
    /**
     * Dispatch with discrete (sync) priority.
     * For user-initiated events: keyboard, click, focus, paste.
     */
    Dispatcher.prototype.dispatchDiscrete = function (target, event) {
        var _this = this;
        if (!this.discreteUpdates) {
            return this.dispatch(target, event);
        }
        return this.discreteUpdates(function (t, e) { return _this.dispatch(t, e); }, target, event, undefined, undefined);
    };
    /**
     * Dispatch with continuous priority.
     * For high-frequency events: resize, scroll, mouse move.
     */
    Dispatcher.prototype.dispatchContinuous = function (target, event) {
        var previousPriority = this.currentUpdatePriority;
        try {
            this.currentUpdatePriority = constants_js_1.ContinuousEventPriority;
            return this.dispatch(target, event);
        }
        finally {
            this.currentUpdatePriority = previousPriority;
        }
    };
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
