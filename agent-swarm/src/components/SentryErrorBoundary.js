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
exports.SentryErrorBoundary = void 0;
var React = require("react");
var SentryErrorBoundary = /** @class */ (function (_super) {
    __extends(SentryErrorBoundary, _super);
    function SentryErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { hasError: false };
        return _this;
    }
    SentryErrorBoundary.getDerivedStateFromError = function () {
        return { hasError: true };
    };
    SentryErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    };
    return SentryErrorBoundary;
}(React.Component));
exports.SentryErrorBoundary = SentryErrorBoundary;
