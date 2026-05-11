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
exports.PackageManagerAutoUpdater = PackageManagerAutoUpdater;
var compiler_runtime_1 = require("react/compiler-runtime");
var React = require("react");
var react_1 = require("react");
var usehooks_ts_1 = require("usehooks-ts");
var ink_js_1 = require("../ink.js");
var autoUpdater_js_1 = require("../utils/autoUpdater.js");
var config_js_1 = require("../utils/config.js");
var debug_js_1 = require("../utils/debug.js");
var packageManagers_js_1 = require("../utils/nativeInstaller/packageManagers.js");
var semver_js_1 = require("../utils/semver.js");
var settings_js_1 = require("../utils/settings/settings.js");
function PackageManagerAutoUpdater(t0) {
    var _this = this;
    var $ = (0, compiler_runtime_1.c)(10);
    var verbose = t0.verbose;
    var _a = (0, react_1.useState)(false), updateAvailable = _a[0], setUpdateAvailable = _a[1];
    var _b = (0, react_1.useState)("unknown"), packageManager = _b[0], setPackageManager = _b[1];
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, channel, pm, latest, maxVersion, hasUpdate;
            var _b, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        false || false;
                        if ((0, config_js_1.isAutoUpdaterDisabled)()) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all([Promise.resolve((_d = (_b = (0, settings_js_1.getInitialSettings)()) === null || _b === void 0 ? void 0 : _b.autoUpdatesChannel) !== null && _d !== void 0 ? _d : "latest"), (0, packageManagers_js_1.getPackageManager)()])];
                    case 1:
                        _a = _e.sent(), channel = _a[0], pm = _a[1];
                        setPackageManager(pm);
                        return [4 /*yield*/, (0, autoUpdater_js_1.getLatestVersionFromGcs)(channel)];
                    case 2:
                        latest = _e.sent();
                        return [4 /*yield*/, (0, autoUpdater_js_1.getMaxVersion)()];
                    case 3:
                        maxVersion = _e.sent();
                        if (maxVersion && latest && (0, semver_js_1.gt)(latest, maxVersion)) {
                            (0, debug_js_1.logForDebugging)("PackageManagerAutoUpdater: maxVersion ".concat(maxVersion, " is set, capping update from ").concat(latest, " to ").concat(maxVersion));
                            if ((0, semver_js_1.gte)(MACRO.VERSION, maxVersion)) {
                                (0, debug_js_1.logForDebugging)("PackageManagerAutoUpdater: current version ".concat(MACRO.VERSION, " is already at or above maxVersion ").concat(maxVersion, ", skipping update"));
                                setUpdateAvailable(false);
                                return [2 /*return*/];
                            }
                            latest = maxVersion;
                        }
                        hasUpdate = latest && !(0, semver_js_1.gte)(MACRO.VERSION, latest) && !(0, autoUpdater_js_1.shouldSkipVersion)(latest);
                        setUpdateAvailable(!!hasUpdate);
                        if (hasUpdate) {
                            (0, debug_js_1.logForDebugging)("PackageManagerAutoUpdater: Update available ".concat(MACRO.VERSION, " -> ").concat(latest));
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var checkForUpdates = t1;
    var t2;
    var t3;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = function () {
            checkForUpdates();
        };
        t3 = [checkForUpdates];
        $[1] = t2;
        $[2] = t3;
    }
    else {
        t2 = $[1];
        t3 = $[2];
    }
    React.useEffect(t2, t3);
    (0, usehooks_ts_1.useInterval)(checkForUpdates, 1800000);
    if (!updateAvailable) {
        return null;
    }
    var updateCommand = packageManager === "homebrew" ? "brew upgrade claude-code" : packageManager === "winget" ? "winget upgrade Anthropic.ClaudeCode" : packageManager === "apk" ? "apk upgrade claude-code" : "your package manager update command";
    var t4;
    if ($[3] !== verbose) {
        t4 = verbose && <ink_js_1.Text dimColor={true} wrap="truncate">currentVersion: {MACRO.VERSION}</ink_js_1.Text>;
        $[3] = verbose;
        $[4] = t4;
    }
    else {
        t4 = $[4];
    }
    var t5;
    if ($[5] !== updateCommand) {
        t5 = <ink_js_1.Text color="warning" wrap="truncate">Update available! Run: <ink_js_1.Text bold={true}>{updateCommand}</ink_js_1.Text></ink_js_1.Text>;
        $[5] = updateCommand;
        $[6] = t5;
    }
    else {
        t5 = $[6];
    }
    var t6;
    if ($[7] !== t4 || $[8] !== t5) {
        t6 = <>{t4}{t5}</>;
        $[7] = t4;
        $[8] = t5;
        $[9] = t6;
    }
    else {
        t6 = $[9];
    }
    return t6;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZVN0YXRlIiwidXNlSW50ZXJ2YWwiLCJUZXh0IiwiQXV0b1VwZGF0ZXJSZXN1bHQiLCJnZXRMYXRlc3RWZXJzaW9uRnJvbUdjcyIsImdldE1heFZlcnNpb24iLCJzaG91bGRTa2lwVmVyc2lvbiIsImlzQXV0b1VwZGF0ZXJEaXNhYmxlZCIsImxvZ0ZvckRlYnVnZ2luZyIsImdldFBhY2thZ2VNYW5hZ2VyIiwiUGFja2FnZU1hbmFnZXIiLCJndCIsImd0ZSIsImdldEluaXRpYWxTZXR0aW5ncyIsIlByb3BzIiwiaXNVcGRhdGluZyIsIm9uQ2hhbmdlSXNVcGRhdGluZyIsIm9uQXV0b1VwZGF0ZXJSZXN1bHQiLCJhdXRvVXBkYXRlclJlc3VsdCIsInNob3dTdWNjZXNzTWVzc2FnZSIsInZlcmJvc2UiLCJQYWNrYWdlTWFuYWdlckF1dG9VcGRhdGVyIiwidDAiLCIkIiwiX2MiLCJ1cGRhdGVBdmFpbGFibGUiLCJzZXRVcGRhdGVBdmFpbGFibGUiLCJwYWNrYWdlTWFuYWdlciIsInNldFBhY2thZ2VNYW5hZ2VyIiwidDEiLCJTeW1ib2wiLCJmb3IiLCJjaGFubmVsIiwicG0iLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsImF1dG9VcGRhdGVzQ2hhbm5lbCIsImxhdGVzdCIsIm1heFZlcnNpb24iLCJNQUNSTyIsIlZFUlNJT04iLCJoYXNVcGRhdGUiLCJjaGVja0ZvclVwZGF0ZXMiLCJ0MiIsInQzIiwidXNlRWZmZWN0IiwidXBkYXRlQ29tbWFuZCIsInQ0IiwidDUiLCJ0NiJdLCJzb3VyY2VzIjpbIlBhY2thZ2VNYW5hZ2VyQXV0b1VwZGF0ZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUludGVydmFsIH0gZnJvbSAndXNlaG9va3MtdHMnXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHtcbiAgdHlwZSBBdXRvVXBkYXRlclJlc3VsdCxcbiAgZ2V0TGF0ZXN0VmVyc2lvbkZyb21HY3MsXG4gIGdldE1heFZlcnNpb24sXG4gIHNob3VsZFNraXBWZXJzaW9uLFxufSBmcm9tICcuLi91dGlscy9hdXRvVXBkYXRlci5qcydcbmltcG9ydCB7IGlzQXV0b1VwZGF0ZXJEaXNhYmxlZCB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IGxvZ0ZvckRlYnVnZ2luZyB9IGZyb20gJy4uL3V0aWxzL2RlYnVnLmpzJ1xuaW1wb3J0IHtcbiAgZ2V0UGFja2FnZU1hbmFnZXIsXG4gIHR5cGUgUGFja2FnZU1hbmFnZXIsXG59IGZyb20gJy4uL3V0aWxzL25hdGl2ZUluc3RhbGxlci9wYWNrYWdlTWFuYWdlcnMuanMnXG5pbXBvcnQgeyBndCwgZ3RlIH0gZnJvbSAnLi4vdXRpbHMvc2VtdmVyLmpzJ1xuaW1wb3J0IHsgZ2V0SW5pdGlhbFNldHRpbmdzIH0gZnJvbSAnLi4vdXRpbHMvc2V0dGluZ3Mvc2V0dGluZ3MuanMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIGlzVXBkYXRpbmc6IGJvb2xlYW5cbiAgb25DaGFuZ2VJc1VwZGF0aW5nOiAoaXNVcGRhdGluZzogYm9vbGVhbikgPT4gdm9pZFxuICBvbkF1dG9VcGRhdGVyUmVzdWx0OiAoYXV0b1VwZGF0ZXJSZXN1bHQ6IEF1dG9VcGRhdGVyUmVzdWx0KSA9PiB2b2lkXG4gIGF1dG9VcGRhdGVyUmVzdWx0OiBBdXRvVXBkYXRlclJlc3VsdCB8IG51bGxcbiAgc2hvd1N1Y2Nlc3NNZXNzYWdlOiBib29sZWFuXG4gIHZlcmJvc2U6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFBhY2thZ2VNYW5hZ2VyQXV0b1VwZGF0ZXIoeyB2ZXJib3NlIH06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW3VwZGF0ZUF2YWlsYWJsZSwgc2V0VXBkYXRlQXZhaWxhYmxlXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcGFja2FnZU1hbmFnZXIsIHNldFBhY2thZ2VNYW5hZ2VyXSA9XG4gICAgdXNlU3RhdGU8UGFja2FnZU1hbmFnZXI+KCd1bmtub3duJylcblxuICBjb25zdCBjaGVja0ZvclVwZGF0ZXMgPSBSZWFjdC51c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgaWYgKFxuICAgICAgXCJwcm9kdWN0aW9uXCIgPT09ICd0ZXN0JyB8fFxuICAgICAgXCJwcm9kdWN0aW9uXCIgPT09ICdkZXZlbG9wbWVudCdcbiAgICApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChpc0F1dG9VcGRhdGVyRGlzYWJsZWQoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgW2NoYW5uZWwsIHBtXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIFByb21pc2UucmVzb2x2ZShnZXRJbml0aWFsU2V0dGluZ3MoKT8uYXV0b1VwZGF0ZXNDaGFubmVsID8/ICdsYXRlc3QnKSxcbiAgICAgIGdldFBhY2thZ2VNYW5hZ2VyKCksXG4gICAgXSlcbiAgICBzZXRQYWNrYWdlTWFuYWdlcihwbSlcblxuICAgIGxldCBsYXRlc3QgPSBhd2FpdCBnZXRMYXRlc3RWZXJzaW9uRnJvbUdjcyhjaGFubmVsKVxuXG4gICAgLy8gQ2hlY2sgaWYgbWF4IHZlcnNpb24gaXMgc2V0IChzZXJ2ZXItc2lkZSBraWxsIHN3aXRjaCBmb3IgYXV0by11cGRhdGVzKVxuICAgIGNvbnN0IG1heFZlcnNpb24gPSBhd2FpdCBnZXRNYXhWZXJzaW9uKClcblxuICAgIGlmIChtYXhWZXJzaW9uICYmIGxhdGVzdCAmJiBndChsYXRlc3QsIG1heFZlcnNpb24pKSB7XG4gICAgICBsb2dGb3JEZWJ1Z2dpbmcoXG4gICAgICAgIGBQYWNrYWdlTWFuYWdlckF1dG9VcGRhdGVyOiBtYXhWZXJzaW9uICR7bWF4VmVyc2lvbn0gaXMgc2V0LCBjYXBwaW5nIHVwZGF0ZSBmcm9tICR7bGF0ZXN0fSB0byAke21heFZlcnNpb259YCxcbiAgICAgIClcbiAgICAgIGlmIChndGUoTUFDUk8uVkVSU0lPTiwgbWF4VmVyc2lvbikpIHtcbiAgICAgICAgbG9nRm9yRGVidWdnaW5nKFxuICAgICAgICAgIGBQYWNrYWdlTWFuYWdlckF1dG9VcGRhdGVyOiBjdXJyZW50IHZlcnNpb24gJHtNQUNSTy5WRVJTSU9OfSBpcyBhbHJlYWR5IGF0IG9yIGFib3ZlIG1heFZlcnNpb24gJHttYXhWZXJzaW9ufSwgc2tpcHBpbmcgdXBkYXRlYCxcbiAgICAgICAgKVxuICAgICAgICBzZXRVcGRhdGVBdmFpbGFibGUoZmFsc2UpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgbGF0ZXN0ID0gbWF4VmVyc2lvblxuICAgIH1cblxuICAgIGNvbnN0IGhhc1VwZGF0ZSA9XG4gICAgICBsYXRlc3QgJiYgIWd0ZShNQUNSTy5WRVJTSU9OLCBsYXRlc3QpICYmICFzaG91bGRTa2lwVmVyc2lvbihsYXRlc3QpXG5cbiAgICBzZXRVcGRhdGVBdmFpbGFibGUoISFoYXNVcGRhdGUpXG5cbiAgICBpZiAoaGFzVXBkYXRlKSB7XG4gICAgICBsb2dGb3JEZWJ1Z2dpbmcoXG4gICAgICAgIGBQYWNrYWdlTWFuYWdlckF1dG9VcGRhdGVyOiBVcGRhdGUgYXZhaWxhYmxlICR7TUFDUk8uVkVSU0lPTn0gLT4gJHtsYXRlc3R9YCxcbiAgICAgIClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIC8vIEluaXRpYWwgY2hlY2tcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB2b2lkIGNoZWNrRm9yVXBkYXRlcygpXG4gIH0sIFtjaGVja0ZvclVwZGF0ZXNdKVxuXG4gIC8vIENoZWNrIGV2ZXJ5IDMwIG1pbnV0ZXNcbiAgdXNlSW50ZXJ2YWwoY2hlY2tGb3JVcGRhdGVzLCAzMCAqIDYwICogMTAwMClcblxuICBpZiAoIXVwZGF0ZUF2YWlsYWJsZSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBwYWNtYW4sIGRlYiwgYW5kIHJwbSBkb24ndCBnZXQgc3BlY2lmaWMgY29tbWFuZHMgYmVjYXVzZSB0aGV5IGVhY2ggaGF2ZVxuICAvLyBtdWx0aXBsZSBmcm9udGVuZHMgKHBhY21hbjogeWF5L3BhcnUvbWFrZXBrZywgZGViOiBhcHQvYXB0LWdldC9hcHRpdHVkZS9uYWxhLFxuICAvLyBycG06IGRuZi95dW0venlwcGVyKVxuICBjb25zdCB1cGRhdGVDb21tYW5kID1cbiAgICBwYWNrYWdlTWFuYWdlciA9PT0gJ2hvbWVicmV3J1xuICAgICAgPyAnYnJldyB1cGdyYWRlIGNsYXVkZS1jb2RlJ1xuICAgICAgOiBwYWNrYWdlTWFuYWdlciA9PT0gJ3dpbmdldCdcbiAgICAgICAgPyAnd2luZ2V0IHVwZ3JhZGUgQW50aHJvcGljLkNsYXVkZUNvZGUnXG4gICAgICAgIDogcGFja2FnZU1hbmFnZXIgPT09ICdhcGsnXG4gICAgICAgICAgPyAnYXBrIHVwZ3JhZGUgY2xhdWRlLWNvZGUnXG4gICAgICAgICAgOiAneW91ciBwYWNrYWdlIG1hbmFnZXIgdXBkYXRlIGNvbW1hbmQnXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge3ZlcmJvc2UgJiYgKFxuICAgICAgICA8VGV4dCBkaW1Db2xvciB3cmFwPVwidHJ1bmNhdGVcIj5cbiAgICAgICAgICBjdXJyZW50VmVyc2lvbjoge01BQ1JPLlZFUlNJT059XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICl9XG4gICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIiB3cmFwPVwidHJ1bmNhdGVcIj5cbiAgICAgICAgVXBkYXRlIGF2YWlsYWJsZSEgUnVuOiA8VGV4dCBib2xkPnt1cGRhdGVDb21tYW5kfTwvVGV4dD5cbiAgICAgIDwvVGV4dD5cbiAgICA8Lz5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxRQUFRLFFBQVEsT0FBTztBQUNoQyxTQUFTQyxXQUFXLFFBQVEsYUFBYTtBQUN6QyxTQUFTQyxJQUFJLFFBQVEsV0FBVztBQUNoQyxTQUNFLEtBQUtDLGlC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
