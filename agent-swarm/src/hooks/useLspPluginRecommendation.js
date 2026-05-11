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
exports.useLspPluginRecommendation = useLspPluginRecommendation;
var compiler_runtime_1 = require("react/compiler-runtime");
/**
 * Hook for LSP plugin recommendations
 *
 * Detects file edits and recommends LSP plugins when:
 * - File extension matches an LSP plugin
 * - LSP binary is already installed on the system
 * - Plugin is not already installed
 * - User hasn't disabled recommendations
 *
 * Only shows one recommendation per session.
 */
var path_1 = require("path");
var React = require("react");
var state_js_1 = require("../bootstrap/state.js");
var notifications_js_1 = require("../context/notifications.js");
var AppState_js_1 = require("../state/AppState.js");
var config_js_1 = require("../utils/config.js");
var debug_js_1 = require("../utils/debug.js");
var log_js_1 = require("../utils/log.js");
var lspRecommendation_js_1 = require("../utils/plugins/lspRecommendation.js");
var pluginInstallationHelpers_js_1 = require("../utils/plugins/pluginInstallationHelpers.js");
var settings_js_1 = require("../utils/settings/settings.js");
var usePluginRecommendationBase_js_1 = require("./usePluginRecommendationBase.js");
// Threshold for detecting timeout vs explicit dismiss (ms)
// Menu auto-dismisses at 30s, so anything over 28s is likely timeout
var TIMEOUT_THRESHOLD_MS = 28000;
function useLspPluginRecommendation() {
    var _this = this;
    var $ = (0, compiler_runtime_1.c)(12);
    var trackedFiles = (0, AppState_js_1.useAppState)(_temp);
    var addNotification = (0, notifications_js_1.useNotifications)().addNotification;
    var t0;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = new Set();
        $[0] = t0;
    }
    else {
        t0 = $[0];
    }
    var checkedFilesRef = React.useRef(t0);
    var _a = (0, usePluginRecommendationBase_js_1.usePluginRecommendationBase)(), recommendation = _a.recommendation, clearRecommendation = _a.clearRecommendation, tryResolve = _a.tryResolve;
    var t1;
    var t2;
    if ($[1] !== trackedFiles || $[2] !== tryResolve) {
        t1 = function () {
            tryResolve(function () { return __awaiter(_this, void 0, void 0, function () {
                var newFiles, _i, trackedFiles_1, file, _a, newFiles_1, filePath, matches, match, t3_1, error;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if ((0, state_js_1.hasShownLspRecommendationThisSession)()) {
                                return [2 /*return*/, null];
                            }
                            newFiles = [];
                            for (_i = 0, trackedFiles_1 = trackedFiles; _i < trackedFiles_1.length; _i++) {
                                file = trackedFiles_1[_i];
                                if (!checkedFilesRef.current.has(file)) {
                                    checkedFilesRef.current.add(file);
                                    newFiles.push(file);
                                }
                            }
                            _a = 0, newFiles_1 = newFiles;
                            _b.label = 1;
                        case 1:
                            if (!(_a < newFiles_1.length)) return [3 /*break*/, 6];
                            filePath = newFiles_1[_a];
                            ;
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, (0, lspRecommendation_js_1.getMatchingLspPlugins)(filePath)];
                        case 3:
                            matches = _b.sent();
                            match = matches[0];
                            if (match) {
                                (0, debug_js_1.logForDebugging)("[useLspPluginRecommendation] Found match: ".concat(match.pluginName, " for ").concat(filePath));
                                (0, state_js_1.setLspRecommendationShownThisSession)(true);
                                return [2 /*return*/, {
                                        pluginId: match.pluginId,
                                        pluginName: match.pluginName,
                                        pluginDescription: match.description,
                                        fileExtension: (0, path_1.extname)(filePath),
                                        shownAt: Date.now()
                                    }];
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            t3_1 = _b.sent();
                            error = t3_1;
                            (0, log_js_1.logError)(error);
                            return [3 /*break*/, 5];
                        case 5:
                            _a++;
                            return [3 /*break*/, 1];
                        case 6: return [2 /*return*/, null];
                    }
                });
            }); });
        };
        t2 = [trackedFiles, tryResolve];
        $[1] = trackedFiles;
        $[2] = tryResolve;
        $[3] = t1;
        $[4] = t2;
    }
    else {
        t1 = $[3];
        t2 = $[4];
    }
    React.useEffect(t1, t2);
    var t3;
    if ($[5] !== addNotification || $[6] !== clearRecommendation || $[7] !== recommendation) {
        t3 = function (response) {
            if (!recommendation) {
                return;
            }
            var pluginId = recommendation.pluginId, pluginName = recommendation.pluginName, shownAt = recommendation.shownAt;
            (0, debug_js_1.logForDebugging)("[useLspPluginRecommendation] User response: ".concat(response, " for ").concat(pluginName));
            bb60: switch (response) {
                case "yes":
                    {
                        (0, usePluginRecommendationBase_js_1.installPluginAndNotify)(pluginId, pluginName, "lsp-plugin", addNotification, function (pluginData) { return __awaiter(_this, void 0, void 0, function () {
                            var localSourcePath, settings;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        (0, debug_js_1.logForDebugging)("[useLspPluginRecommendation] Installing plugin: ".concat(pluginId));
                                        localSourcePath = typeof pluginData.entry.source === "string" ? (0, path_1.join)(pluginData.marketplaceInstallLocation, pluginData.entry.source) : undefined;
                                        return [4 /*yield*/, (0, pluginInstallationHelpers_js_1.cacheAndRegisterPlugin)(pluginId, pluginData.entry, "user", undefined, localSourcePath)];
                                    case 1:
                                        _b.sent();
                                        settings = (0, settings_js_1.getSettingsForSource)("userSettings");
                                        (0, settings_js_1.updateSettingsForSource)("userSettings", {
                                            enabledPlugins: __assign(__assign({}, settings === null || settings === void 0 ? void 0 : settings.enabledPlugins), (_a = {}, _a[pluginId] = true, _a))
                                        });
                                        (0, debug_js_1.logForDebugging)("[useLspPluginRecommendation] Plugin installed: ".concat(pluginId));
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        break bb60;
                    }
                case "no":
                    {
                        var elapsed = Date.now() - shownAt;
                        if (elapsed >= TIMEOUT_THRESHOLD_MS) {
                            (0, debug_js_1.logForDebugging)("[useLspPluginRecommendation] Timeout detected (".concat(elapsed, "ms), incrementing ignored count"));
                            (0, lspRecommendation_js_1.incrementIgnoredCount)();
                        }
                        break bb60;
                    }
                case "never":
                    {
                        (0, lspRecommendation_js_1.addToNeverSuggest)(pluginId);
                        break bb60;
                    }
                case "disable":
                    {
                        (0, config_js_1.saveGlobalConfig)(_temp2);
                    }
            }
            clearRecommendation();
        };
        $[5] = addNotification;
        $[6] = clearRecommendation;
        $[7] = recommendation;
        $[8] = t3;
    }
    else {
        t3 = $[8];
    }
    var handleResponse = t3;
    var t4;
    if ($[9] !== handleResponse || $[10] !== recommendation) {
        t4 = {
            recommendation: recommendation,
            handleResponse: handleResponse
        };
        $[9] = handleResponse;
        $[10] = recommendation;
        $[11] = t4;
    }
    else {
        t4 = $[11];
    }
    return t4;
}
function _temp2(current) {
    if (current.lspRecommendationDisabled) {
        return current;
    }
    return __assign(__assign({}, current), { lspRecommendationDisabled: true });
}
function _temp(s) {
    return s.fileHistory.trackedFiles;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleHRuYW1lIiwiam9pbiIsIlJlYWN0IiwiaGFzU2hvd25Mc3BSZWNvbW1lbmRhdGlvblRoaXNTZXNzaW9uIiwic2V0THNwUmVjb21tZW5kYXRpb25TaG93blRoaXNTZXNzaW9uIiwidXNlTm90aWZpY2F0aW9ucyIsInVzZUFwcFN0YXRlIiwic2F2ZUdsb2JhbENvbmZpZyIsImxvZ0ZvckRlYnVnZ2luZyIsImxvZ0Vycm9yIiwiYWRkVG9OZXZlclN1Z2dlc3QiLCJnZXRNYXRjaGluZ0xzcFBsdWdpbnMiLCJpbmNyZW1lbnRJZ25vcmVkQ291bnQiLCJjYWNoZUFuZFJlZ2lzdGVyUGx1Z2luIiwiZ2V0U2V0dGluZ3NGb3JTb3VyY2UiLCJ1cGRhdGVTZXR0aW5nc0ZvclNvdXJjZSIsImluc3RhbGxQbHVnaW5BbmROb3RpZnkiLCJ1c2VQbHVnaW5SZWNvbW1lbmRhdGlvbkJhc2UiLCJUSU1FT1VUX1RIUkVTSE9MRF9NUyIsIkxzcFJlY29tbWVuZGF0aW9uU3RhdGUiLCJwbHVnaW5JZCIsInBsdWdpbk5hbWUiLCJwbHVnaW5EZXNjcmlwdGlvbiIsImZpbGVFeHRlbnNpb24iLCJzaG93bkF0IiwiVXNlTHNwUGx1Z2luUmVjb21tZW5kYXRpb25SZXN1bHQiLCJyZWNvbW1lbmRhdGlvbiIsImhhbmRsZVJlc3BvbnNlIiwicmVzcG9uc2UiLCJ1c2VMc3BQbHVnaW5SZWNvbW1lbmRhdGlvbiIsIiQiLCJfYyIsInRyYWNrZWRGaWxlcyIsIl90ZW1wIiwiYWRkTm90aWZpY2F0aW9uIiwidDAiLCJTeW1ib2wiLCJmb3IiLCJTZXQiLCJjaGVja2VkRmlsZXNSZWYiLCJ1c2VSZWYiLCJjbGVhclJlY29tbWVuZGF0aW9uIiwidHJ5UmVzb2x2ZSIsInQxIiwidDIiLCJuZXdGaWxlcyIsImZpbGUiLCJjdXJyZW50IiwiaGFzIiwiYWRkIiwicHVzaCIsImZpbGVQYXRoIiwibWF0Y2hlcyIsIm1hdGNoIiwiZGVzY3JpcHRpb24iLCJEYXRlIiwibm93IiwidDMiLCJlcnJvciIsInVzZUVmZmVjdCIsImJiNjAiLCJwbHVnaW5EYXRhIiwibG9jYWxTb3VyY2VQYXRoIiwiZW50cnkiLCJzb3VyY2UiLCJtYXJrZXRwbGFjZUluc3RhbGxMb2NhdGlvbiIsInVuZGVmaW5lZCIsInNldHRpbmdzIiwiZW5hYmxlZFBsdWdpbnMiLCJlbGFwc2VkIiwiX3RlbXAyIiwidDQiLCJsc3BSZWNvbW1lbmRhdGlvbkRpc2FibGVkIiwicyIsImZpbGVIaXN0b3J5Il0sInNvdXJjZXMiOlsidXNlTHNwUGx1Z2luUmVjb21tZW5kYXRpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogSG9vayBmb3IgTFNQIHBsdWdpbiByZWNvbW1lbmRhdGlvbnNcbiAqXG4gKiBEZXRlY3RzIGZpbGUgZWRpdHMgYW5kIHJlY29tbWVuZHMgTFNQIHBsdWdpbnMgd2hlbjpcbiAqIC0gRmlsZSBleHRlbnNpb24gbWF0Y2hlcyBhbiBMU1AgcGx1Z2luXG4gKiAtIExTUCBiaW5hcnkgaXMgYWxyZWFkeSBpbnN0YWxsZWQgb24gdGhlIHN5c3RlbVxuICogLSBQbHVnaW4gaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkXG4gKiAtIFVzZXIgaGFzbid0IGRpc2FibGVkIHJlY29tbWVuZGF0aW9uc1xuICpcbiAqIE9ubHkgc2hvd3Mgb25lIHJlY29tbWVuZGF0aW9uIHBlciBzZXNzaW9uLlxuICovXG5cbmltcG9ydCB7IGV4dG5hbWUsIGpvaW4gfSBmcm9tICdwYXRoJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQge1xuICBoYXNTaG93bkxzcFJlY29tbWVuZGF0aW9uVGhpc1Nlc3Npb24sXG4gIHNldExzcFJlY29tbWVuZGF0aW9uU2hvd25UaGlzU2Vzc2lvbixcbn0gZnJvbSAnLi4vYm9vdHN0cmFwL3N0YXRlLmpzJ1xuaW1wb3J0IHsgdXNlTm90aWZpY2F0aW9ucyB9IGZyb20gJy4uL2NvbnRleHQvbm90aWZpY2F0aW9ucy5qcydcbmltcG9ydCB7IHVzZUFwcFN0YXRlIH0gZnJvbSAnLi4vc3RhdGUvQXBwU3RhdGUuanMnXG5pbXBvcnQgeyBzYXZlR2xvYmFsQ29uZmlnIH0gZnJvbSAnLi4vdXRpbHMvY29uZmlnLmpzJ1xuaW1wb3J0IHsgbG9nRm9yRGVidWdnaW5nIH0gZnJvbSAnLi4vdXRpbHMvZGVidWcuanMnXG5pbXBvcnQgeyBsb2dFcnJvciB9IGZyb20gJy4uL3V0aWxzL2xvZy5qcydcbmltcG9ydCB7XG4gIGFkZFRvTmV2ZXJTdWdnZXN0LFxuICBnZXRNYXRjaGluZ0xzcFBsdWdpbnMsXG4gIGluY3JlbWVudElnbm9yZWRDb3VudCxcbn0gZnJvbSAnLi4vdXRpbHMvcGx1Z2lucy9sc3BSZWNvbW1lbmRhdGlvbi5qcydcbmltcG9ydCB7IGNhY2hlQW5kUmVnaXN0ZXJQbHVnaW4gfSBmcm9tICcuLi91dGlscy9wbHVnaW5zL3BsdWdpbkluc3RhbGxhdGlvbkhlbHBlcnMuanMnXG5pbXBvcnQge1xuICBnZXRTZXR0aW5nc0ZvclNvdXJjZSxcbiAgdXBkYXRlU2V0dGluZ3NGb3JTb3VyY2UsXG59IGZyb20gJy4uL3V0aWxzL3NldHRpbmdzL3NldHRpbmdzLmpzJ1xuaW1wb3J0IHtcbiAgaW5zdGFsbFBsdWdpbkFuZE5vdGlmeSxcbiAgdXNlUGx1Z2luUmVjb21tZW5kYXRpb25CYXNlLFxufSBmcm9tICcuL3VzZVBsdWdpblJlY29tbWVuZGF0aW9uQmFzZS5qcydcblxuLy8gVGhyZXNob2xkIGZvciBkZXRlY3RpbmcgdGltZW91dCB2cyBleHBsaWNpdCBkaXNtaXNzIChtcylcbi8vIE1lbnUgYXV0by1kaXNtaXNzZXMgYXQgMzBzLCBzbyBhbnl0aGluZyBvdmVyIDI4cyBpcyBsaWtlbHkgdGltZW91dFxuY29uc3QgVElNRU9VVF9USFJFU0hPTERfTVMgPSAyOF8wMDBcblxuZXhwb3J0IHR5cGUgTHNwUmVjb21tZW5kYXRpb25TdGF0ZSA9IHtcbiAgcGx1Z2luSWQ6IHN0cmluZ1xuICBwbHVnaW5OYW1lOiBzdHJpbmdcbiAgcGx1Z2luRGVzY3JpcHRpb24/OiBzdHJpbmdcbiAgZmlsZUV4dGVuc2lvbjogc3RyaW5nXG4gIHNob3duQXQ6IG51bWJlciAvLyBUaW1lc3RhbXAgZm9yIHRpbWVvdXQgZGV0ZWN0aW9uXG59IHwgbnVsbFxuXG50eXBlIFVzZUxzcFBsdWdpblJlY29tbWVuZGF0aW9uUmVzdWx0ID0ge1xuICByZWNvbW1lbmRhdGlvbjogTHNwUmVjb21tZW5kYXRpb25TdGF0ZVxuICBoYW5kbGVSZXNwb25zZTogKHJlc3BvbnNlOiAneWVzJyB8ICdubycgfCAnbmV2ZXInIHwgJ2Rpc2FibGUnKSA9PiB2b2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VMc3BQbHVnaW5SZWNvbW1lbmRhdGlvbigpOiBVc2VMc3BQbHVnaW5SZWNvbW1lbmRhdGlvblJlc3VsdCB7XG4gIGNvbnN0IHRyYWNrZWRGaWxlcyA9IHVzZUFwcFN0YXRlKHMgPT4gcy5maWxlSGlzdG9yeS50cmFja2VkRmlsZXMpXG4gIGNvbnN0IHsgYWRkTm90aWZpY2F0aW9uIH0gPSB1c2VOb3RpZmljYXRpb25zKClcbiAgY29uc3QgY2hlY2tlZEZpbGVzUmVmID0gUmVhY3QudXNlUmVmPFNldDxzdHJpbmc+PihuZXcgU2V0KCkpXG4gIGNvbnN0IHsgcmVjb21tZW5kYXRpb24sIGNsZWFyUmVjb21tZW5kYXRpb24sIHRyeVJlc29sdmUgfSA9XG4gICAgdXNlUGx1Z2luUmVjb21tZW5kYXRpb25CYXNlPE5vbk51bGxhYmxlPExzcFJlY29tbWVuZGF0aW9uU3RhdGU+PigpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB0cnlSZXNvbHZlKGFzeW5jICgpID0+IHtcbiAgICAgIGlmIChoYXNTaG93bkxzcFJlY29tbWVuZGF0aW9uVGhpc1Nlc3Npb24oKSkgcmV0dXJuIG51bGxcblxuICAgICAgY29uc3QgbmV3RmlsZXM6IHN0cmluZ1tdID0gW11cbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiB0cmFja2VkRmlsZXMpIHtcbiAgICAgICAgaWYgKCFjaGVja2VkRmlsZXNSZWYuY3VycmVudC5oYXMoZmlsZSkpIHtcbiAgICAgICAgICBjaGVja2VkRmlsZXNSZWYuY3VycmVudC5hZGQoZmlsZSlcbiAgICAgICAgICBuZXdGaWxlcy5wdXNoKGZpbGUpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBuZXdGaWxlcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhd2FpdCBnZXRNYXRjaGluZ0xzcFBsdWdpbnMoZmlsZVBhdGgpXG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBtYXRjaGVzWzBdIC8vIG9mZmljaWFsIHBsdWdpbnMgcHJpb3JpdGl6ZWRcbiAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgICAgICAgYFt1c2VMc3BQbHVnaW5SZWNvbW1lbmRhdGlvbl0gRm91bmQgbWF0Y2g6ICR7bWF0Y2gucGx1Z2luTmFtZX0gZm9yICR7ZmlsZVBhdGh9YCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHNldExzcFJlY29tbWVuZGF0aW9uU2hvd25UaGlzU2Vzc2lvbih0cnVlKVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgcGx1Z2luSWQ6IG1hdGNoLnBsdWdpbklkLFxuICAgICAgICAgICAgICBwbHVnaW5OYW1lOiBtYXRjaC5wbHVnaW5OYW1lLFxuICAgICAgICAgICAgICBwbHVnaW5EZXNjcmlwdGlvbjogbWF0Y2guZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgIGZpbGVFeHRlbnNpb246IGV4dG5hbWUoZmlsZVBhdGgpLFxuICAgICAgICAgICAgICBzaG93bkF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBsb2dFcnJvcihlcnJvcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9KVxuICB9LCBbdHJhY2tlZEZpbGVzLCB0cnlSZXNvbHZlXSlcblxuICBjb25zdCBoYW5kbGVSZXNwb25zZSA9IFJlYWN0LnVzZUNhbGxiYWNrKFxuICAgIChyZXNwb25zZTogJ3llcycgfCAnbm8nIHwgJ25ldmVyJyB8ICdkaXNhYmxlJykgPT4ge1xuICAgICAgaWYgKCFyZWNvbW1lbmRhdGlvbikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHsgcGx1Z2luSWQsIHBsdWdpbk5hbWUsIHNob3duQXQgfSA9IHJlY29tbWVuZGF0aW9uXG5cbiAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgYFt1c2VMc3BQbHVnaW5SZWNvbW1lbmRhdGlvbl0gVXNlciByZXNwb25zZTogJHtyZXNwb25zZX0gZm9yICR7cGx1Z2luTmFtZX1gLFxuICAgICAgKVxuXG4gICAgICBzd2l0Y2ggKHJlc3BvbnNlKSB7XG4gICAgICAgIGNhc2UgJ3llcyc6XG4gICAgICAgICAgdm9pZCBpbnN0YWxsUGx1Z2luQW5kTm90aWZ5KFxuICAgICAgICAgICAgcGx1Z2luSWQsXG4gICAgICAgICAgICBwbHVnaW5OYW1lLFxuICAgICAgICAgICAgJ2xzcC1wbHVnaW4nLFxuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uLFxuICAgICAgICAgICAgYXN5bmMgcGx1Z2luRGF0YSA9PiB7XG4gICAgICAgICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgICAgICAgICBgW3VzZUxzcFBsdWdpblJlY29tbWVuZGF0aW9uXSBJbnN0YWxsaW5nIHBsdWdpbjogJHtwbHVnaW5JZH1gLFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIGNvbnN0IGxvY2FsU291cmNlUGF0aCA9XG4gICAgICAgICAgICAgICAgdHlwZW9mIHBsdWdpbkRhdGEuZW50cnkuc291cmNlID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgPyBqb2luKFxuICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbkRhdGEubWFya2V0cGxhY2VJbnN0YWxsTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgcGx1Z2luRGF0YS5lbnRyeS5zb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgIGF3YWl0IGNhY2hlQW5kUmVnaXN0ZXJQbHVnaW4oXG4gICAgICAgICAgICAgICAgcGx1Z2luSWQsXG4gICAgICAgICAgICAgICAgcGx1Z2luRGF0YS5lbnRyeSxcbiAgICAgICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvLyBwcm9qZWN0UGF0aCAtIG5vdCBuZWVkZWQgZm9yIHVzZXIgc2NvcGVcbiAgICAgICAgICAgICAgICBsb2NhbFNvdXJjZVBhdGgsXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLy8gRW5hYmxlIGluIHVzZXIgc2V0dGluZ3Mgc28gaXQgbG9hZHMgb24gcmVzdGFydFxuICAgICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGdldFNldHRpbmdzRm9yU291cmNlKCd1c2VyU2V0dGluZ3MnKVxuICAgICAgICAgICAgICB1cGRhdGVTZXR0aW5nc0ZvclNvdXJjZSgndXNlclNldHRpbmdzJywge1xuICAgICAgICAgICAgICAgIGVuYWJsZWRQbHVnaW5zOiB7XG4gICAgICAgICAgICAgICAgICAuLi5zZXR0aW5ncz8uZW5hYmxlZFBsdWdpbnMsXG4gICAgICAgICAgICAgICAgICBbcGx1Z2luSWRdOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgICAgICAgICBgW3VzZUxzcFBsdWdpblJlY29tbWVuZGF0aW9uXSBQbHVnaW4gaW5zdGFsbGVkOiAke3BsdWdpbklkfWAsXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnbm8nOiB7XG4gICAgICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSBzaG93bkF0XG4gICAgICAgICAgaWYgKGVsYXBzZWQgPj0gVElNRU9VVF9USFJFU0hPTERfTVMpIHtcbiAgICAgICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgICAgICAgYFt1c2VMc3BQbHVnaW5SZWNvbW1lbmRhdGlvbl0gVGltZW91dCBkZXRlY3RlZCAoJHtlbGFwc2VkfW1zKSwgaW5jcmVtZW50aW5nIGlnbm9yZWQgY291bnRgLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaW5jcmVtZW50SWdub3JlZENvdW50KClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgJ25ldmVyJzpcbiAgICAgICAgICBhZGRUb05ldmVyU3VnZ2VzdChwbHVnaW5JZClcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgJ2Rpc2FibGUnOlxuICAgICAgICAgIHNhdmVHbG9iYWxDb25maWcoY3VycmVudCA9PiB7XG4gICAgICAgICAgICBpZiAoY3VycmVudC5sc3BSZWNvbW1lbmRhdGlvbkRpc2FibGVkKSByZXR1cm4gY3VycmVudFxuICAgICAgICAgICAgcmV0dXJuIHsgLi4uY3VycmVudCwgbHNwUmVjb21tZW5kYXRpb25EaXNhYmxlZDogdHJ1ZSB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBjbGVhclJlY29tbWVuZGF0aW9uKClcbiAgICB9LFxuICAgIFtyZWNvbW1lbmRhdGlvbiwgYWRkTm90aWZpY2F0aW9uLCBjbGVhclJlY29tbWVuZGF0aW9uXSxcbiAgKVxuXG4gIHJldHVybiB7IHJlY29tbWVuZGF0aW9uLCBoYW5kbGVSZXNwb25zZSB9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLE9BQU8sRUFBRUMsSUFBSSxRQUFR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
