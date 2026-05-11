"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
var Event = /** @class */ (function () {
    function Event() {
        this._didStopImmediatePropagation = false;
    }
    Event.prototype.didStopImmediatePropagation = function () {
        return this._didStopImmediatePropagation;
    };
    Event.prototype.stopImmediatePropagation = function () {
        this._didStopImmediatePropagation = true;
    };
    return Event;
}());
exports.Event = Event;
