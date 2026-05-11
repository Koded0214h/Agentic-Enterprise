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
exports.ClickEvent = void 0;
var event_js_1 = require("./event.js");
/**
 * Mouse click event. Fired on left-button release without drag, only when
 * mouse tracking is enabled (i.e. inside <AlternateScreen>).
 *
 * Bubbles from the deepest hit node up through parentNode. Call
 * stopImmediatePropagation() to prevent ancestors' onClick from firing.
 */
var ClickEvent = /** @class */ (function (_super) {
    __extends(ClickEvent, _super);
    function ClickEvent(col, row, cellIsBlank) {
        var _this = _super.call(this) || this;
        /**
         * Click column relative to the current handler's Box (col - box.x).
         * Recomputed by dispatchClick before each handler fires, so an onClick
         * on a container sees coords relative to that container, not to any
         * child the click landed on.
         */
        _this.localCol = 0;
        /** Click row relative to the current handler's Box (row - box.y). */
        _this.localRow = 0;
        _this.col = col;
        _this.row = row;
        _this.cellIsBlank = cellIsBlank;
        return _this;
    }
    return ClickEvent;
}(event_js_1.Event));
exports.ClickEvent = ClickEvent;
