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
var OptionMap = /** @class */ (function (_super) {
    __extends(OptionMap, _super);
    function OptionMap(options) {
        var _this = this;
        var items = [];
        var firstItem;
        var lastItem;
        var previous;
        var index = 0;
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var option = options_1[_i];
            var item = {
                label: option.label,
                value: option.value,
                description: option.description,
                previous: previous,
                next: undefined,
                index: index,
            };
            if (previous) {
                previous.next = item;
            }
            firstItem || (firstItem = item);
            lastItem = item;
            items.push([option.value, item]);
            index++;
            previous = item;
        }
        _this = _super.call(this, items) || this;
        _this.first = firstItem;
        _this.last = lastItem;
        return _this;
    }
    return OptionMap;
}(Map));
exports.default = OptionMap;
