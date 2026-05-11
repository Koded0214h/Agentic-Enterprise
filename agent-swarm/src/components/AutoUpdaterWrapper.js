"use strict";
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
exports.AutoUpdaterWrapper = AutoUpdaterWrapper;
var compiler_runtime_1 = require("react/compiler-runtime");
var bun_bundle_1 = require("bun:bundle");
var React = require("react");
var config_js_1 = require("../utils/config.js");
var debug_js_1 = require("../utils/debug.js");
var doctorDiagnostic_js_1 = require("../utils/doctorDiagnostic.js");
var AutoUpdater_js_1 = require("./AutoUpdater.js");
var NativeAutoUpdater_js_1 = require("./NativeAutoUpdater.js");
var PackageManagerAutoUpdater_js_1 = require("./PackageManagerAutoUpdater.js");
function AutoUpdaterWrapper(t0) {
    var $ = (0, compiler_runtime_1.c)(17);
    var isUpdating = t0.isUpdating, onChangeIsUpdating = t0.onChangeIsUpdating, onAutoUpdaterResult = t0.onAutoUpdaterResult, autoUpdaterResult = t0.autoUpdaterResult, showSuccessMessage = t0.showSuccessMessage, verbose = t0.verbose;
    var _a = React.useState(null), useNativeInstaller = _a[0], setUseNativeInstaller = _a[1];
    var _b = React.useState(null), isPackageManager = _b[0], setIsPackageManager = _b[1];
    var t1;
    var t2;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = function () {
            var checkInstallation = function checkInstallation() {
                return __awaiter(this, void 0, void 0, function () {
                    var installationType;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if ((0, bun_bundle_1.feature)("SKIP_DETECTION_WHEN_AUTOUPDATES_DISABLED") && (0, config_js_1.isAutoUpdaterDisabled)()) {
                                    (0, debug_js_1.logForDebugging)("AutoUpdaterWrapper: Skipping detection, auto-updates disabled");
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, (0, doctorDiagnostic_js_1.getCurrentInstallationType)()];
                            case 1:
                                installationType = _a.sent();
                                (0, debug_js_1.logForDebugging)("AutoUpdaterWrapper: Installation type: ".concat(installationType));
                                setUseNativeInstaller(installationType === "native");
                                setIsPackageManager(installationType === "package-manager");
                                return [2 /*return*/];
                        }
                    });
                });
            };
            checkInstallation();
        };
        t2 = [];
        $[0] = t1;
        $[1] = t2;
    }
    else {
        t1 = $[0];
        t2 = $[1];
    }
    React.useEffect(t1, t2);
    if (useNativeInstaller === null || isPackageManager === null) {
        return null;
    }
    if (isPackageManager) {
        var t3_1;
        if ($[2] !== autoUpdaterResult || $[3] !== isUpdating || $[4] !== onAutoUpdaterResult || $[5] !== onChangeIsUpdating || $[6] !== showSuccessMessage || $[7] !== verbose) {
            t3_1 = <PackageManagerAutoUpdater_js_1.PackageManagerAutoUpdater verbose={verbose} onAutoUpdaterResult={onAutoUpdaterResult} autoUpdaterResult={autoUpdaterResult} isUpdating={isUpdating} onChangeIsUpdating={onChangeIsUpdating} showSuccessMessage={showSuccessMessage}/>;
            $[2] = autoUpdaterResult;
            $[3] = isUpdating;
            $[4] = onAutoUpdaterResult;
            $[5] = onChangeIsUpdating;
            $[6] = showSuccessMessage;
            $[7] = verbose;
            $[8] = t3_1;
        }
        else {
            t3_1 = $[8];
        }
        return t3_1;
    }
    var Updater = useNativeInstaller ? NativeAutoUpdater_js_1.NativeAutoUpdater : AutoUpdater_js_1.AutoUpdater;
    var t3;
    if ($[9] !== Updater || $[10] !== autoUpdaterResult || $[11] !== isUpdating || $[12] !== onAutoUpdaterResult || $[13] !== onChangeIsUpdating || $[14] !== showSuccessMessage || $[15] !== verbose) {
        t3 = <Updater verbose={verbose} onAutoUpdaterResult={onAutoUpdaterResult} autoUpdaterResult={autoUpdaterResult} isUpdating={isUpdating} onChangeIsUpdating={onChangeIsUpdating} showSuccessMessage={showSuccessMessage}/>;
        $[9] = Updater;
        $[10] = autoUpdaterResult;
        $[11] = isUpdating;
        $[12] = onAutoUpdaterResult;
        $[13] = onChangeIsUpdating;
        $[14] = showSuccessMessage;
        $[15] = verbose;
        $[16] = t3;
    }
    else {
        t3 = $[16];
    }
    return t3;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmZWF0dXJlIiwiUmVhY3QiLCJBdXRvVXBkYXRlclJlc3VsdCIsImlzQXV0b1VwZGF0ZXJEaXNhYmxlZCIsImxvZ0ZvckRlYnVnZ2luZyIsImdldEN1cnJlbnRJbnN0YWxsYXRpb25UeXBlIiwiQXV0b1VwZGF0ZXIiLCJOYXRpdmVBdXRvVXBkYXRlciIsIlBhY2thZ2VNYW5hZ2VyQXV0b1VwZGF0ZXIiLCJQcm9wcyIsImlzVXBkYXRpbmciLCJvbkNoYW5nZUlzVXBkYXRpbmciLCJvbkF1dG9VcGRhdGVyUmVzdWx0IiwiYXV0b1VwZGF0ZXJSZXN1bHQiLCJzaG93U3VjY2Vzc01lc3NhZ2UiLCJ2ZXJib3NlIiwiQXV0b1VwZGF0ZXJXcmFwcGVyIiwidDAiLCIkIiwiX2MiLCJ1c2VOYXRpdmVJbnN0YWxsZXIiLCJzZXRVc2VOYXRpdmVJbnN0YWxsZXIiLCJ1c2VTdGF0ZSIsImlzUGFja2FnZU1hbmFnZXIiLCJzZXRJc1BhY2thZ2VNYW5hZ2VyIiwidDEiLCJ0MiIsIlN5bWJvbCIsImZvciIsImNoZWNrSW5zdGFsbGF0aW9uIiwiaW5zdGFsbGF0aW9uVHlwZSIsInVzZUVmZmVjdCIsInQzIiwiVXBkYXRlciJdLCJzb3VyY2VzIjpbIkF1dG9VcGRhdGVyV3JhcHBlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmVhdHVyZSB9IGZyb20gJ2J1bjpidW5kbGUnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB0eXBlIHsgQXV0b1VwZGF0ZXJSZXN1bHQgfSBmcm9tICcuLi91dGlscy9hdXRvVXBkYXRlci5qcydcbmltcG9ydCB7IGlzQXV0b1VwZGF0ZXJEaXNhYmxlZCB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IGxvZ0ZvckRlYnVnZ2luZyB9IGZyb20gJy4uL3V0aWxzL2RlYnVnLmpzJ1xuaW1wb3J0IHsgZ2V0Q3VycmVudEluc3RhbGxhdGlvblR5cGUgfSBmcm9tICcuLi91dGlscy9kb2N0b3JEaWFnbm9zdGljLmpzJ1xuaW1wb3J0IHsgQXV0b1VwZGF0ZXIgfSBmcm9tICcuL0F1dG9VcGRhdGVyLmpzJ1xuaW1wb3J0IHsgTmF0aXZlQXV0b1VwZGF0ZXIgfSBmcm9tICcuL05hdGl2ZUF1dG9VcGRhdGVyLmpzJ1xuaW1wb3J0IHsgUGFja2FnZU1hbmFnZXJBdXRvVXBkYXRlciB9IGZyb20gJy4vUGFja2FnZU1hbmFnZXJBdXRvVXBkYXRlci5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgaXNVcGRhdGluZzogYm9vbGVhblxuICBvbkNoYW5nZUlzVXBkYXRpbmc6IChpc1VwZGF0aW5nOiBib29sZWFuKSA9PiB2b2lkXG4gIG9uQXV0b1VwZGF0ZXJSZXN1bHQ6IChhdXRvVXBkYXRlclJlc3VsdDogQXV0b1VwZGF0ZXJSZXN1bHQpID0+IHZvaWRcbiAgYXV0b1VwZGF0ZXJSZXN1bHQ6IEF1dG9VcGRhdGVyUmVzdWx0IHwgbnVsbFxuICBzaG93U3VjY2Vzc01lc3NhZ2U6IGJvb2xlYW5cbiAgdmVyYm9zZTogYm9vbGVhblxufVxuXG5leHBvcnQgZnVuY3Rpb24gQXV0b1VwZGF0ZXJXcmFwcGVyKHtcbiAgaXNVcGRhdGluZyxcbiAgb25DaGFuZ2VJc1VwZGF0aW5nLFxuICBvbkF1dG9VcGRhdGVyUmVzdWx0LFxuICBhdXRvVXBkYXRlclJlc3VsdCxcbiAgc2hvd1N1Y2Nlc3NNZXNzYWdlLFxuICB2ZXJib3NlLFxufTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBbdXNlTmF0aXZlSW5zdGFsbGVyLCBzZXRVc2VOYXRpdmVJbnN0YWxsZXJdID0gUmVhY3QudXNlU3RhdGU8XG4gICAgYm9vbGVhbiB8IG51bGxcbiAgPihudWxsKVxuICBjb25zdCBbaXNQYWNrYWdlTWFuYWdlciwgc2V0SXNQYWNrYWdlTWFuYWdlcl0gPSBSZWFjdC51c2VTdGF0ZTxcbiAgICBib29sZWFuIHwgbnVsbFxuICA+KG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBhc3luYyBmdW5jdGlvbiBjaGVja0luc3RhbGxhdGlvbigpIHtcbiAgICAgIC8vIFNraXAgaW5zdGFsbGF0aW9uIHR5cGUgZGV0ZWN0aW9uIGlmIGF1dG8tdXBkYXRlcyBhcmUgZGlzYWJsZWQgKGFudC1vbmx5KVxuICAgICAgLy8gVGhpcyBhdm9pZHMgcG90ZW50aWFsbHkgc2xvdyBwYWNrYWdlIG1hbmFnZXIgZGV0ZWN0aW9uIChzcGF3blN5bmMgY2FsbHMpXG4gICAgICBpZiAoXG4gICAgICAgIGZlYXR1cmUoJ1NLSVBfREVURUNUSU9OX1dIRU5fQVVUT1VQREFURVNfRElTQUJMRUQnKSAmJlxuICAgICAgICBpc0F1dG9VcGRhdGVyRGlzYWJsZWQoKVxuICAgICAgKSB7XG4gICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgICAnQXV0b1VwZGF0ZXJXcmFwcGVyOiBTa2lwcGluZyBkZXRlY3Rpb24sIGF1dG8tdXBkYXRlcyBkaXNhYmxlZCcsXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluc3RhbGxhdGlvblR5cGUgPSBhd2FpdCBnZXRDdXJyZW50SW5zdGFsbGF0aW9uVHlwZSgpXG4gICAgICBsb2dGb3JEZWJ1Z2dpbmcoXG4gICAgICAgIGBBdXRvVXBkYXRlcldyYXBwZXI6IEluc3RhbGxhdGlvbiB0eXBlOiAke2luc3RhbGxhdGlvblR5cGV9YCxcbiAgICAgIClcbiAgICAgIHNldFVzZU5hdGl2ZUluc3RhbGxlcihpbnN0YWxsYXRpb25UeXBlID09PSAnbmF0aXZlJylcbiAgICAgIHNldElzUGFja2FnZU1hbmFnZXIoaW5zdGFsbGF0aW9uVHlwZSA9PT0gJ3BhY2thZ2UtbWFuYWdlcicpXG4gICAgfVxuXG4gICAgdm9pZCBjaGVja0luc3RhbGxhdGlvbigpXG4gIH0sIFtdKVxuXG4gIC8vIERvbid0IHJlbmRlciB1bnRpbCB3ZSBrbm93IHRoZSBpbnN0YWxsYXRpb24gdHlwZVxuICBpZiAodXNlTmF0aXZlSW5zdGFsbGVyID09PSBudWxsIHx8IGlzUGFja2FnZU1hbmFnZXIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGlzUGFja2FnZU1hbmFnZXIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFBhY2thZ2VNYW5hZ2VyQXV0b1VwZGF0ZXJcbiAgICAgICAgdmVyYm9zZT17dmVyYm9zZX1cbiAgICAgICAgb25BdXRvVXBkYXRlclJlc3VsdD17b25BdXRvVXBkYXRlclJlc3VsdH1cbiAgICAgICAgYXV0b1VwZGF0ZXJSZXN1bHQ9e2F1dG9VcGRhdGVyUmVzdWx0fVxuICAgICAgICBpc1VwZGF0aW5nPXtpc1VwZGF0aW5nfVxuICAgICAgICBvbkNoYW5nZUlzVXBkYXRpbmc9e29uQ2hhbmdlSXNVcGRhdGluZ31cbiAgICAgICAgc2hvd1N1Y2Nlc3NNZXNzYWdlPXtzaG93U3VjY2Vzc01lc3NhZ2V9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIGNvbnN0IFVwZGF0ZXIgPSB1c2VOYXRpdmVJbnN0YWxsZXIgPyBOYXRpdmVBdXRvVXBkYXRlciA6IEF1dG9VcGRhdGVyXG5cbiAgcmV0dXJuIChcbiAgICA8VXBkYXRlclxuICAgICAgdmVyYm9zZT17dmVyYm9zZX1cbiAgICAgIG9uQXV0b1VwZGF0ZXJSZXN1bHQ9e29uQXV0b1VwZGF0ZXJSZXN1bHR9XG4gICAgICBhdXRvVXBkYXRlclJlc3VsdD17YXV0b1VwZGF0ZXJSZXN1bHR9XG4gICAgICBpc1VwZGF0aW5nPXtpc1VwZGF0aW5nfVxuICAgICAgb25DaGFuZ2VJc1VwZGF0aW5nPXtvbkNoYW5nZUlzVXBkYXRpbmd9XG4gICAgICBzaG93U3VjY2Vzc01lc3NhZ2U9e3Nob3dTdWNjZXNzTWVzc2FnZX1cbiAgICAvPlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTQSxPQUFPLFFBQVEsWUFBWTtBQUNwQyxPQUFPLEtBQUtDLEtBQUssTUFBTSxPQUFPO0FBQzlCLGNBQWNDLGlCQUFpQixRQUFRLHlCQUF5QjtBQUNoRSxTQUFTQyxxQkFBcUIsUUFBUSxvQkFBb0I7QUFDMUQs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
