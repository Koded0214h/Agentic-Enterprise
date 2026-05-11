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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeAutoConnectDialog = IdeAutoConnectDialog;
exports.shouldShowAutoConnectDialog = shouldShowAutoConnectDialog;
exports.IdeDisableAutoConnectDialog = IdeDisableAutoConnectDialog;
exports.shouldShowDisableAutoConnectDialog = shouldShowDisableAutoConnectDialog;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var config_js_1 = require("../utils/config.js");
var ide_js_1 = require("../utils/ide.js");
var index_js_1 = require("./CustomSelect/index.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
function IdeAutoConnectDialog(t0) {
    var _this = this;
    var $ = (0, compiler_runtime_1.c)(9);
    var onComplete = t0.onComplete;
    var t1;
    if ($[0] !== onComplete) {
        t1 = function (value) { return __awaiter(_this, void 0, void 0, function () {
            var autoConnect;
            return __generator(this, function (_a) {
                autoConnect = value === "yes";
                (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { autoConnectIde: autoConnect, hasIdeAutoConnectDialogBeenShown: true })); });
                onComplete();
                return [2 /*return*/];
            });
        }); };
        $[0] = onComplete;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var handleSelect = t1;
    var t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = [{
                label: "Yes",
                value: "yes"
            }, {
                label: "No",
                value: "no"
            }];
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var options = t2;
    var t3;
    if ($[3] !== handleSelect) {
        t3 = <index_js_1.Select options={options} onChange={handleSelect} defaultValue="yes"/>;
        $[3] = handleSelect;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    var t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = <ink_js_1.Text dimColor={true}>You can also configure this in /config or with the --ide flag</ink_js_1.Text>;
        $[5] = t4;
    }
    else {
        t4 = $[5];
    }
    var t5;
    if ($[6] !== onComplete || $[7] !== t3) {
        t5 = <Dialog_js_1.Dialog title="Do you wish to enable auto-connect to IDE?" color="ide" onCancel={onComplete}>{t3}{t4}</Dialog_js_1.Dialog>;
        $[6] = onComplete;
        $[7] = t3;
        $[8] = t5;
    }
    else {
        t5 = $[8];
    }
    return t5;
}
function shouldShowAutoConnectDialog() {
    var config = (0, config_js_1.getGlobalConfig)();
    return !(0, ide_js_1.isSupportedTerminal)() && config.autoConnectIde !== true && config.hasIdeAutoConnectDialogBeenShown !== true;
}
function IdeDisableAutoConnectDialog(t0) {
    var $ = (0, compiler_runtime_1.c)(10);
    var onComplete = t0.onComplete;
    var t1;
    if ($[0] !== onComplete) {
        t1 = function (value) {
            var disableAutoConnect = value === "yes";
            if (disableAutoConnect) {
                (0, config_js_1.saveGlobalConfig)(_temp);
            }
            onComplete(disableAutoConnect);
        };
        $[0] = onComplete;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var handleSelect = t1;
    var t2;
    if ($[2] !== onComplete) {
        t2 = function () {
            onComplete(false);
        };
        $[2] = onComplete;
        $[3] = t2;
    }
    else {
        t2 = $[3];
    }
    var handleCancel = t2;
    var t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = [{
                label: "No",
                value: "no"
            }, {
                label: "Yes",
                value: "yes"
            }];
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    var options = t3;
    var t4;
    if ($[5] !== handleSelect) {
        t4 = <index_js_1.Select options={options} onChange={handleSelect} defaultValue="no"/>;
        $[5] = handleSelect;
        $[6] = t4;
    }
    else {
        t4 = $[6];
    }
    var t5;
    if ($[7] !== handleCancel || $[8] !== t4) {
        t5 = <Dialog_js_1.Dialog title="Do you wish to disable auto-connect to IDE?" subtitle="You can also configure this in /config" onCancel={handleCancel} color="ide">{t4}</Dialog_js_1.Dialog>;
        $[7] = handleCancel;
        $[8] = t4;
        $[9] = t5;
    }
    else {
        t5 = $[9];
    }
    return t5;
}
function _temp(current) {
    return __assign(__assign({}, current), { autoConnectIde: false });
}
function shouldShowDisableAutoConnectDialog() {
    var config = (0, config_js_1.getGlobalConfig)();
    return !(0, ide_js_1.isSupportedTerminal)() && config.autoConnectIde === true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUNhbGxiYWNrIiwiVGV4dCIsImdldEdsb2JhbENvbmZpZyIsInNhdmVHbG9iYWxDb25maWciLCJpc1N1cHBvcnRlZFRlcm1pbmFsIiwiU2VsZWN0IiwiRGlhbG9nIiwiSWRlQXV0b0Nvbm5lY3REaWFsb2dQcm9wcyIsIm9uQ29tcGxldGUiLCJJZGVBdXRvQ29ubmVjdERpYWxvZyIsInQwIiwiJCIsIl9jIiwidDEiLCJ2YWx1ZSIsImF1dG9Db25uZWN0IiwiY3VycmVudCIsImF1dG9Db25uZWN0SWRlIiwiaGFzSWRlQXV0b0Nvbm5lY3REaWFsb2dCZWVuU2hvd24iLCJoYW5kbGVTZWxlY3QiLCJ0MiIsIlN5bWJvbCIsImZvciIsImxhYmVsIiwib3B0aW9ucyIsInQzIiwidDQiLCJ0NSIsInNob3VsZFNob3dBdXRvQ29ubmVjdERpYWxvZyIsImNvbmZpZyIsIklkZURpc2FibGVBdXRvQ29ubmVjdERpYWxvZ1Byb3BzIiwiZGlzYWJsZUF1dG9Db25uZWN0IiwiSWRlRGlzYWJsZUF1dG9Db25uZWN0RGlhbG9nIiwiX3RlbXAiLCJoYW5kbGVDYW5jZWwiLCJzaG91bGRTaG93RGlzYWJsZUF1dG9Db25uZWN0RGlhbG9nIl0sInNvdXJjZXMiOlsiSWRlQXV0b0Nvbm5lY3REaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgVGV4dCB9IGZyb20gJy4uL2luay5qcydcbmltcG9ydCB7IGdldEdsb2JhbENvbmZpZywgc2F2ZUdsb2JhbENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IGlzU3VwcG9ydGVkVGVybWluYWwgfSBmcm9tICcuLi91dGlscy9pZGUuanMnXG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuL0N1c3RvbVNlbGVjdC9pbmRleC5qcydcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4vZGVzaWduLXN5c3RlbS9EaWFsb2cuanMnXG5cbnR5cGUgSWRlQXV0b0Nvbm5lY3REaWFsb2dQcm9wcyA9IHtcbiAgb25Db21wbGV0ZTogKCkgPT4gdm9pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gSWRlQXV0b0Nvbm5lY3REaWFsb2coe1xuICBvbkNvbXBsZXRlLFxufTogSWRlQXV0b0Nvbm5lY3REaWFsb2dQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IGhhbmRsZVNlbGVjdCA9IHVzZUNhbGxiYWNrKFxuICAgIGFzeW5jICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBhdXRvQ29ubmVjdCA9IHZhbHVlID09PSAneWVzJ1xuXG4gICAgICAvLyBTYXZlIHRoZSBwcmVmZXJlbmNlIGFuZCBtYXJrIGRpYWxvZyBhcyBzaG93blxuICAgICAgc2F2ZUdsb2JhbENvbmZpZyhjdXJyZW50ID0+ICh7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGF1dG9Db25uZWN0SWRlOiBhdXRvQ29ubmVjdCxcbiAgICAgICAgaGFzSWRlQXV0b0Nvbm5lY3REaWFsb2dCZWVuU2hvd246IHRydWUsXG4gICAgICB9KSlcblxuICAgICAgb25Db21wbGV0ZSgpXG4gICAgfSxcbiAgICBbb25Db21wbGV0ZV0sXG4gIClcblxuICBjb25zdCBvcHRpb25zID0gW1xuICAgIHsgbGFiZWw6ICdZZXMnLCB2YWx1ZTogJ3llcycgfSxcbiAgICB7IGxhYmVsOiAnTm8nLCB2YWx1ZTogJ25vJyB9LFxuICBdXG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nXG4gICAgICB0aXRsZT1cIkRvIHlvdSB3aXNoIHRvIGVuYWJsZSBhdXRvLWNvbm5lY3QgdG8gSURFP1wiXG4gICAgICBjb2xvcj1cImlkZVwiXG4gICAgICBvbkNhbmNlbD17b25Db21wbGV0ZX1cbiAgICA+XG4gICAgICA8U2VsZWN0IG9wdGlvbnM9e29wdGlvbnN9IG9uQ2hhbmdlPXtoYW5kbGVTZWxlY3R9IGRlZmF1bHRWYWx1ZT17J3llcyd9IC8+XG4gICAgICA8VGV4dCBkaW1Db2xvcj5cbiAgICAgICAgWW91IGNhbiBhbHNvIGNvbmZpZ3VyZSB0aGlzIGluIC9jb25maWcgb3Igd2l0aCB0aGUgLS1pZGUgZmxhZ1xuICAgICAgPC9UZXh0PlxuICAgIDwvRGlhbG9nPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRTaG93QXV0b0Nvbm5lY3REaWFsb2coKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldEdsb2JhbENvbmZpZygpXG4gIHJldHVybiAoXG4gICAgIWlzU3VwcG9ydGVkVGVybWluYWwoKSAmJlxuICAgIGNvbmZpZy5hdXRvQ29ubmVjdElkZSAhPT0gdHJ1ZSAmJlxuICAgIGNvbmZpZy5oYXNJZGVBdXRvQ29ubmVjdERpYWxvZ0JlZW5TaG93biAhPT0gdHJ1ZVxuICApXG59XG5cbnR5cGUgSWRlRGlzYWJsZUF1dG9Db25uZWN0RGlhbG9nUHJvcHMgPSB7XG4gIG9uQ29tcGxldGU6IChkaXNhYmxlQXV0b0Nvbm5lY3Q6IGJvb2xlYW4pID0+IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIElkZURpc2FibGVBdXRvQ29ubmVjdERpYWxvZyh7XG4gIG9uQ29tcGxldGUsXG59OiBJZGVEaXNhYmxlQXV0b0Nvbm5lY3REaWFsb2dQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IGhhbmRsZVNlbGVjdCA9IHVzZUNhbGxiYWNrKFxuICAgICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBkaXNhYmxlQXV0b0Nvbm5lY3QgPSB2YWx1ZSA9PT0gJ3llcydcblxuICAgICAgaWYgKGRpc2FibGVBdXRvQ29ubmVjdCkge1xuICAgICAgICBzYXZlR2xvYmFsQ29uZmlnKGN1cnJlbnQgPT4gKHtcbiAgICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICAgIGF1dG9Db25uZWN0SWRlOiBmYWxzZSxcbiAgICAgICAgfSkpXG4gICAgICB9XG5cbiAgICAgIG9uQ29tcGxldGUoZGlzYWJsZUF1dG9Db25uZWN0KVxuICAgIH0sXG4gICAgW29uQ29tcGxldGVdLFxuICApXG5cbiAgY29uc3QgaGFuZGxlQ2FuY2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIG9uQ29tcGxldGUoZmFsc2UpXG4gIH0sIFtvbkNvbXBsZXRlXSlcblxuICBjb25zdCBvcHRpb25zID0gW1xuICAgIHsgbGFiZWw6ICdObycsIHZhbHVlOiAnbm8nIH0sXG4gICAgeyBsYWJlbDogJ1llcycsIHZhbHVlOiAneWVzJyB9LFxuICBdXG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nXG4gICAgICB0aXRsZT1cIkRvIHlvdSB3aXNoIHRvIGRpc2FibGUgYXV0by1jb25uZWN0IHRvIElERT9cIlxuICAgICAgc3VidGl0bGU9XCJZb3UgY2FuIGFsc28gY29uZmlndXJlIHRoaXMgaW4gL2NvbmZpZ1wiXG4gICAgICBvbkNhbmNlbD17aGFuZGxlQ2FuY2VsfVxuICAgICAgY29sb3I9XCJpZGVcIlxuICAgID5cbiAgICAgIDxTZWxlY3Qgb3B0aW9ucz17b3B0aW9uc30gb25DaGFuZ2U9e2hhbmRsZVNlbGVjdH0gZGVmYXVsdFZhbHVlPXsnbm8nfSAvPlxuICAgIDwvRGlhbG9nPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRTaG93RGlzYWJsZUF1dG9Db25uZWN0RGlhbG9nKCk6IGJvb2xlYW4ge1xuICBjb25zdCBjb25maWcgPSBnZXRHbG9iYWxDb25maWcoKVxuICByZXR1cm4gIWlzU3VwcG9ydGVkVGVybWluYWwoKSAmJiBjb25maWcuYXV0b0Nvbm5lY3RJZGUgPT09IHRydWVcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLEtBQUssSUFBSUMsV0FBVyxRQUFRLE9BQU87QUFDMUMsU0FBU0MsSUFBSSxRQUFRLFdBQVc7QUFDaEMsU0FBU0MsZUFBZSxFQUFFQyxnQkFBZ0IsUUFBUSxvQkFBb0I7QUFDdEUsU0FBU0MsbUJBQW1CLFFBQVEsaUJBQWlCO0FBQ3JELFNBQVNDLE1BQU0sUUFBUSx5QkFBeUI7QUFDaEQsU0FBU0MsTUFBTSxRQUFR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
