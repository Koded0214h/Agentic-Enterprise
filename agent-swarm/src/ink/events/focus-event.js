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
exports.FocusEvent = void 0;
var terminal_event_js_1 = require("./terminal-event.js");
/**
 * Focus event for component focus changes.
 *
 * Dispatched when focus moves between elements. 'focus' fires on the
 * newly focused element, 'blur' fires on the previously focused one.
 * Both bubble, matching react-dom's use of focusin/focusout semantics
 * so parent components can observe descendant focus changes.
 */
var FocusEvent = /** @class */ (function (_super) {
    __extends(FocusEvent, _super);
    function FocusEvent(type, relatedTarget) {
        if (relatedTarget === void 0) { relatedTarget = null; }
        var _this = _super.call(this, type, { bubbles: true, cancelable: false }) || this;
        _this.relatedTarget = relatedTarget;
        return _this;
    }
    return FocusEvent;
}(terminal_event_js_1.TerminalEvent));
exports.FocusEvent = FocusEvent;
