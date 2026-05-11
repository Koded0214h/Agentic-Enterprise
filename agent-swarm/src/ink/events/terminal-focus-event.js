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
exports.TerminalFocusEvent = void 0;
var event_js_1 = require("./event.js");
/**
 * Event fired when the terminal window gains or loses focus.
 *
 * Uses DECSET 1004 focus reporting - the terminal sends:
 * - CSI I (\x1b[I) when the terminal gains focus
 * - CSI O (\x1b[O) when the terminal loses focus
 */
var TerminalFocusEvent = /** @class */ (function (_super) {
    __extends(TerminalFocusEvent, _super);
    function TerminalFocusEvent(type) {
        var _this = _super.call(this) || this;
        _this.type = type;
        return _this;
    }
    return TerminalFocusEvent;
}(event_js_1.Event));
exports.TerminalFocusEvent = TerminalFocusEvent;
