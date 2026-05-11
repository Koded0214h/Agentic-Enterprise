"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalEvent = void 0;
var event_js_1 = require("./event.js");
/**
 * Base class for all terminal events with DOM-style propagation.
 *
 * Extends Event so existing event types (ClickEvent, InputEvent,
 * TerminalFocusEvent) share a common ancestor and can migrate later.
 *
 * Mirrors the browser's Event API: target, currentTarget, eventPhase,
 * stopPropagation(), preventDefault(), timeStamp.
 */
var TerminalEvent = /** @class */ (function (_super) {
    __extends(TerminalEvent, _super);
    function TerminalEvent(type, init) {
        var _a, _b;
        var _this = _super.call(this) || this;
        _this._target = null;
        _this._currentTarget = null;
        _this._eventPhase = 'none';
        _this._propagationStopped = false;
        _this._defaultPrevented = false;
        _this.type = type;
        _this.timeStamp = performance.now();
        _this.bubbles = (_a = init === null || init === void 0 ? void 0 : init.bubbles) !== null && _a !== void 0 ? _a : true;
        _this.cancelable = (_b = init === null || init === void 0 ? void 0 : init.cancelable) !== null && _b !== void 0 ? _b : true;
        return _this;
    }
    Object.defineProperty(TerminalEvent.prototype, "target", {
        get: function () {
            return this._target;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TerminalEvent.prototype, "currentTarget", {
        get: function () {
            return this._currentTarget;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TerminalEvent.prototype, "eventPhase", {
        get: function () {
            return this._eventPhase;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TerminalEvent.prototype, "defaultPrevented", {
        get: function () {
            return this._defaultPrevented;
        },
        enumerable: false,
        configurable: true
    });
    TerminalEvent.prototype.stopPropagation = function () {
        this._propagationStopped = true;
    };
    TerminalEvent.prototype.stopImmediatePropagation = function () {
        _super.prototype.stopImmediatePropagation.call(this);
        this._propagationStopped = true;
    };
    TerminalEvent.prototype.preventDefault = function () {
        if (this.cancelable) {
            this._defaultPrevented = true;
        }
    };
    // -- Internal setters used by the Dispatcher
    /** @internal */
    TerminalEvent.prototype._setTarget = function (target) {
        this._target = target;
    };
    /** @internal */
    TerminalEvent.prototype._setCurrentTarget = function (target) {
        this._currentTarget = target;
    };
    /** @internal */
    TerminalEvent.prototype._setEventPhase = function (phase) {
        this._eventPhase = phase;
    };
    /** @internal */
    TerminalEvent.prototype._isPropagationStopped = function () {
        return this._propagationStopped;
    };
    /** @internal */
    TerminalEvent.prototype._isImmediatePropagationStopped = function () {
        return this.didStopImmediatePropagation();
    };
    /**
     * Hook for subclasses to do per-node setup before each handler fires.
     * Default is a no-op.
     */
    TerminalEvent.prototype._prepareForTarget = function (_target) { };
    return TerminalEvent;
}(event_js_1.Event));
exports.TerminalEvent = TerminalEvent;
