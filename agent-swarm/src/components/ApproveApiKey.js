"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ApproveApiKey = ApproveApiKey;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var config_js_1 = require("../utils/config.js");
var index_js_1 = require("./CustomSelect/index.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
function ApproveApiKey(t0) {
    var $ = (0, compiler_runtime_1.c)(17);
    var customApiKeyTruncated = t0.customApiKeyTruncated, onDone = t0.onDone;
    var t1;
    if ($[0] !== customApiKeyTruncated || $[1] !== onDone) {
        t1 = function onChange(value) {
            bb2: switch (value) {
                case "yes":
                    {
                        (0, config_js_1.saveGlobalConfig)(function (current_0) {
                            var _a, _b;
                            return (__assign(__assign({}, current_0), { customApiKeyResponses: __assign(__assign({}, current_0.customApiKeyResponses), { approved: __spreadArray(__spreadArray([], ((_b = (_a = current_0.customApiKeyResponses) === null || _a === void 0 ? void 0 : _a.approved) !== null && _b !== void 0 ? _b : []), true), [customApiKeyTruncated], false) }) }));
                        });
                        onDone(true);
                        break bb2;
                    }
                case "no":
                    {
                        (0, config_js_1.saveGlobalConfig)(function (current) {
                            var _a, _b;
                            return (__assign(__assign({}, current), { customApiKeyResponses: __assign(__assign({}, current.customApiKeyResponses), { rejected: __spreadArray(__spreadArray([], ((_b = (_a = current.customApiKeyResponses) === null || _a === void 0 ? void 0 : _a.rejected) !== null && _b !== void 0 ? _b : []), true), [customApiKeyTruncated], false) }) }));
                        });
                        onDone(false);
                    }
            }
        };
        $[0] = customApiKeyTruncated;
        $[1] = onDone;
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var onChange = t1;
    var t2;
    if ($[3] !== onChange) {
        t2 = function () { return onChange("no"); };
        $[3] = onChange;
        $[4] = t2;
    }
    else {
        t2 = $[4];
    }
    var t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = <ink_js_1.Text bold={true}>ANTHROPIC_API_KEY</ink_js_1.Text>;
        $[5] = t3;
    }
    else {
        t3 = $[5];
    }
    var t4;
    if ($[6] !== customApiKeyTruncated) {
        t4 = <ink_js_1.Text>{t3}<ink_js_1.Text>: sk-ant-...{customApiKeyTruncated}</ink_js_1.Text></ink_js_1.Text>;
        $[6] = customApiKeyTruncated;
        $[7] = t4;
    }
    else {
        t4 = $[7];
    }
    var t5;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = <ink_js_1.Text>Do you want to use this API key?</ink_js_1.Text>;
        $[8] = t5;
    }
    else {
        t5 = $[8];
    }
    var t6;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = {
            label: "Yes",
            value: "yes"
        };
        $[9] = t6;
    }
    else {
        t6 = $[9];
    }
    var t7;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = [t6, {
                label: <ink_js_1.Text>No (<ink_js_1.Text bold={true}>recommended</ink_js_1.Text>)</ink_js_1.Text>,
                value: "no"
            }];
        $[10] = t7;
    }
    else {
        t7 = $[10];
    }
    var t8;
    if ($[11] !== onChange) {
        t8 = <index_js_1.Select defaultValue="no" defaultFocusValue="no" options={t7} onChange={function (value_0) { return onChange(value_0); }} onCancel={function () { return onChange("no"); }}/>;
        $[11] = onChange;
        $[12] = t8;
    }
    else {
        t8 = $[12];
    }
    var t9;
    if ($[13] !== t2 || $[14] !== t4 || $[15] !== t8) {
        t9 = <Dialog_js_1.Dialog title="Detected a custom API key in your environment" color="warning" onCancel={t2}>{t4}{t5}{t8}</Dialog_js_1.Dialog>;
        $[13] = t2;
        $[14] = t4;
        $[15] = t8;
        $[16] = t9;
    }
    else {
        t9 = $[16];
    }
    return t9;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIlRleHQiLCJzYXZlR2xvYmFsQ29uZmlnIiwiU2VsZWN0IiwiRGlhbG9nIiwiUHJvcHMiLCJjdXN0b21BcGlLZXlUcnVuY2F0ZWQiLCJvbkRvbmUiLCJhcHByb3ZlZCIsIkFwcHJvdmVBcGlLZXkiLCJ0MCIsIiQiLCJfYyIsInQxIiwib25DaGFuZ2UiLCJ2YWx1ZSIsImJiMiIsImN1cnJlbnRfMCIsImN1cnJlbnQiLCJjdXN0b21BcGlLZXlSZXNwb25zZXMiLCJyZWplY3RlZCIsInQyIiwidDMiLCJTeW1ib2wiLCJmb3IiLCJ0NCIsInQ1IiwidDYiLCJsYWJlbCIsInQ3IiwidDgiLCJ2YWx1ZV8wIiwidDkiXSwic291cmNlcyI6WyJBcHByb3ZlQXBpS2V5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHsgc2F2ZUdsb2JhbENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4vQ3VzdG9tU2VsZWN0L2luZGV4LmpzJ1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnLi9kZXNpZ24tc3lzdGVtL0RpYWxvZy5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgY3VzdG9tQXBpS2V5VHJ1bmNhdGVkOiBzdHJpbmdcbiAgb25Eb25lKGFwcHJvdmVkOiBib29sZWFuKTogdm9pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gQXBwcm92ZUFwaUtleSh7XG4gIGN1c3RvbUFwaUtleVRydW5jYXRlZCxcbiAgb25Eb25lLFxufTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBmdW5jdGlvbiBvbkNoYW5nZSh2YWx1ZTogJ3llcycgfCAnbm8nKSB7XG4gICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgY2FzZSAneWVzJzoge1xuICAgICAgICBzYXZlR2xvYmFsQ29uZmlnKGN1cnJlbnQgPT4gKHtcbiAgICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICAgIGN1c3RvbUFwaUtleVJlc3BvbnNlczoge1xuICAgICAgICAgICAgLi4uY3VycmVudC5jdXN0b21BcGlLZXlSZXNwb25zZXMsXG4gICAgICAgICAgICBhcHByb3ZlZDogW1xuICAgICAgICAgICAgICAuLi4oY3VycmVudC5jdXN0b21BcGlLZXlSZXNwb25zZXM/LmFwcHJvdmVkID8/IFtdKSxcbiAgICAgICAgICAgICAgY3VzdG9tQXBpS2V5VHJ1bmNhdGVkLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSlcbiAgICAgICAgb25Eb25lKHRydWUpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlICdubyc6IHtcbiAgICAgICAgc2F2ZUdsb2JhbENvbmZpZyhjdXJyZW50ID0+ICh7XG4gICAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgICBjdXN0b21BcGlLZXlSZXNwb25zZXM6IHtcbiAgICAgICAgICAgIC4uLmN1cnJlbnQuY3VzdG9tQXBpS2V5UmVzcG9uc2VzLFxuICAgICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgICAgLi4uKGN1cnJlbnQuY3VzdG9tQXBpS2V5UmVzcG9uc2VzPy5yZWplY3RlZCA/PyBbXSksXG4gICAgICAgICAgICAgIGN1c3RvbUFwaUtleVRydW5jYXRlZCxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSkpXG4gICAgICAgIG9uRG9uZShmYWxzZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxEaWFsb2dcbiAgICAgIHRpdGxlPVwiRGV0ZWN0ZWQgYSBjdXN0b20gQVBJIGtleSBpbiB5b3VyIGVudmlyb25tZW50XCJcbiAgICAgIGNvbG9yPVwid2FybmluZ1wiXG4gICAgICBvbkNhbmNlbD17KCkgPT4gb25DaGFuZ2UoJ25vJyl9XG4gICAgPlxuICAgICAgPFRleHQ+XG4gICAgICAgIDxUZXh0IGJvbGQ+QU5USFJPUElDX0FQSV9LRVk8L1RleHQ+XG4gICAgICAgIDxUZXh0Pjogc2stYW50LS4uLntjdXN0b21BcGlLZXlUcnVuY2F0ZWR9PC9UZXh0PlxuICAgICAgPC9UZXh0PlxuICAgICAgPFRleHQ+RG8geW91IHdhbnQgdG8gdXNlIHRoaXMgQVBJIGtleT88L1RleHQ+XG4gICAgICA8U2VsZWN0XG4gICAgICAgIGRlZmF1bHRWYWx1ZT1cIm5vXCJcbiAgICAgICAgZGVmYXVsdEZvY3VzVmFsdWU9XCJub1wiXG4gICAgICAgIG9wdGlvbnM9e1tcbiAgICAgICAgICB7IGxhYmVsOiAnWWVzJywgdmFsdWU6ICd5ZXMnIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IChcbiAgICAgICAgICAgICAgPFRleHQ+XG4gICAgICAgICAgICAgICAgTm8gKDxUZXh0IGJvbGQ+cmVjb21tZW5kZWQ8L1RleHQ+KVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdmFsdWU6ICdubycsXG4gICAgICAgICAgfSxcbiAgICAgICAgXX1cbiAgICAgICAgb25DaGFuZ2U9e3ZhbHVlID0+IG9uQ2hhbmdlKHZhbHVlIGFzICd5ZXMnIHwgJ25vJyl9XG4gICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBvbkNoYW5nZSgnbm8nKX1cbiAgICAgIC8+XG4gICAgPC9EaWFsb2c+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLEtBQUssTUFBTSxPQUFPO0FBQ3pCLFNBQVNDLElBQUksUUFBUSxXQUFXO0FBQ2hDLFNBQVNDLGdCQUFnQixRQUFRLG9CQUFvQjtBQUNyRCxTQUFTQyxNQUFNLFFBQVEseUJBQXlCO0FBQ2hELFNBQVNDLE1BQU0sUUFBUSwyQkFBMkI7QUFFbEQsS0FBS0MsS0FBSyxHQUFHO0VBQ1hDLHFCQUFxQixFQUFFLE1BQU07RUFDN0JDLE1BQU0sQ0FBQ0MsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUk7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RUFBQSxJQUFBa0IsRUFBQTtFQUFBLElBQUFsQixDQUFBLFNBQUFZLE1BQUEsQ0FBQUMsR0FBQTtJQUR2QkssRUFBQSxJQUNQRixFQUE4QixFQUM5QjtNQUFBQyxLQUFBLEVBRUksQ0FBQyxJQUFJLENBQUMsSUFDQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUosS0FBRyxDQUFDLENBQUMsV0FBVyxFQUFyQixJQUFJLENBQXdCLENBQ25DLEVBRkMsSUFBSSxDQUVFO01BQUFiLEtBQUEsRUFFRjtJQUNULENBQUMsQ0FDRjtJQUFBSixDQUFBLE9BQUFrQixFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBbEIsQ0FBQTtFQUFBO0VBQUEsSUFBQW1CLEVBQUE7RUFBQSxJQUFBbkIsQ0FBQSxTQUFBRyxRQUFBO0lBYkhnQixFQUFBLElBQUMsTUFBTSxDQUNRLFlBQUksQ0FBSixJQUFJLENBQ0MsaUJBQUksQ0FBSixJQUFJLENBQ2IsT0FVUixDQVZRLENBQUFELEVBVVQsQ0FBQyxDQUNTLFFBQXdDLENBQXhDLENBQUFFLE9BQUEsSUFBU2pCLFFBQVEsQ0FBQ0MsT0FBSyxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUMsQ0FDeEMsUUFBb0IsQ0FBcEIsT0FBTUQsUUFBUSxDQUFDLElBQUksRUFBQyxHQUM5QjtJQUFBSCxDQUFBLE9BQUFHLFFBQUE7SUFBQUgsQ0FBQSxPQUFBbUIsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQW5CLENBQUE7RUFBQTtFQUFBLElBQUFxQixFQUFBO0VBQUEsSUFBQXJCLENBQUEsU0FBQVUsRUFBQSxJQUFBVixDQUFBLFNBQUFjLEVBQUEsSUFBQWQsQ0FBQSxTQUFBbUIsRUFBQTtJQTFCSkUsRUFBQSxJQUFDLE1BQU0sQ0FDQyxLQUErQyxDQUEvQywrQ0FBK0MsQ0FDL0MsS0FBUyxDQUFULFNBQVMsQ0FDTCxRQUFvQixDQUFwQixDQUFBWCxFQUFtQixDQUFDLENBRTlCLENBQUFJLEVBR00sQ0FDTixDQUFBQyxFQUE0QyxDQUM1QyxDQUFBSSxFQWdCQyxDQUNILEVBM0JDLE1BQU0sQ0EyQkU7SUFBQW5CLENBQUEsT0FBQVUsRUFBQTtJQUFBVixDQUFBLE9BQUFjLEVBQUE7SUFBQWQsQ0FBQSxPQUFBbUIsRUFBQTtJQUFBbkIsQ0FBQSxPQUFBcUIsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQXJCLENBQUE7RUFBQTtFQUFBLE9BM0JUcUIsRUEyQlM7QUFBQSIsImlnbm9yZUxpc3QiOltdfQ==
