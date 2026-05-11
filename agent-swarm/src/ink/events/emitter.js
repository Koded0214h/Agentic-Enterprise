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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
var events_1 = require("events");
var event_js_1 = require("./event.js");
// Similar to node's builtin EventEmitter, but is also aware of our `Event`
// class, and so `emit` respects `stopImmediatePropagation()`.
var EventEmitter = /** @class */ (function (_super) {
    __extends(EventEmitter, _super);
    function EventEmitter() {
        var _this = _super.call(this) || this;
        // Disable the default maxListeners warning. In React, many components
        // can legitimately listen to the same event (e.g., useInput hooks).
        // The default limit of 10 causes spurious warnings.
        _this.setMaxListeners(0);
        return _this;
    }
    EventEmitter.prototype.emit = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // Delegate to node for `error`, since it's not treated like a normal event
        if (type === 'error') {
            return _super.prototype.emit.apply(this, __spreadArray([type], args, false));
        }
        var listeners = this.rawListeners(type);
        if (listeners.length === 0) {
            return false;
        }
        var ccEvent = args[0] instanceof event_js_1.Event ? args[0] : null;
        for (var _a = 0, listeners_1 = listeners; _a < listeners_1.length; _a++) {
            var listener = listeners_1[_a];
            listener.apply(this, args);
            if (ccEvent === null || ccEvent === void 0 ? void 0 : ccEvent.didStopImmediatePropagation()) {
                break;
            }
        }
        return true;
    };
    return EventEmitter;
}(events_1.EventEmitter));
exports.EventEmitter = EventEmitter;
