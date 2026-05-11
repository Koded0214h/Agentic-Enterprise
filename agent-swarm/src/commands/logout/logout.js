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
exports.performLogout = performLogout;
exports.clearAuthRelatedCaches = clearAuthRelatedCaches;
exports.call = call;
var React = require("react");
var trustedDevice_js_1 = require("../../bridge/trustedDevice.js");
var ink_js_1 = require("../../ink.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var grove_js_1 = require("../../services/api/grove.js");
var index_js_1 = require("../../services/policyLimits/index.js");
// flushTelemetry is loaded lazily to avoid pulling in ~1.1MB of OpenTelemetry at startup
var index_js_2 = require("../../services/remoteManagedSettings/index.js");
var auth_js_1 = require("../../utils/auth.js");
var betas_js_1 = require("../../utils/betas.js");
var config_js_1 = require("../../utils/config.js");
var gracefulShutdown_js_1 = require("../../utils/gracefulShutdown.js");
var index_js_3 = require("../../utils/secureStorage/index.js");
var toolSchemaCache_js_1 = require("../../utils/toolSchemaCache.js");
var user_js_1 = require("../../utils/user.js");
function performLogout(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var flushTelemetry, secureStorage;
        var _c = _b.clearOnboarding, clearOnboarding = _c === void 0 ? false : _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/telemetry/instrumentation.js'); })];
                case 1:
                    flushTelemetry = (_d.sent()).flushTelemetry;
                    return [4 /*yield*/, flushTelemetry()];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, (0, auth_js_1.removeApiKey)()];
                case 3:
                    _d.sent();
                    secureStorage = (0, index_js_3.getSecureStorage)();
                    secureStorage.delete();
                    return [4 /*yield*/, clearAuthRelatedCaches()];
                case 4:
                    _d.sent();
                    (0, config_js_1.saveGlobalConfig)(function (current) {
                        var _a;
                        var updated = __assign({}, current);
                        if (clearOnboarding) {
                            updated.hasCompletedOnboarding = false;
                            updated.subscriptionNoticeCount = 0;
                            updated.hasAvailableSubscription = false;
                            if ((_a = updated.customApiKeyResponses) === null || _a === void 0 ? void 0 : _a.approved) {
                                updated.customApiKeyResponses = __assign(__assign({}, updated.customApiKeyResponses), { approved: [] });
                            }
                        }
                        updated.oauthAccount = undefined;
                        return updated;
                    });
                    return [2 /*return*/];
            }
        });
    });
}
// clearing anything memoized that must be invalidated when user/session/auth changes
function clearAuthRelatedCaches() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    // Clear the OAuth token cache
                    (_b = (_a = auth_js_1.getClaudeAIOAuthTokens.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    (0, trustedDevice_js_1.clearTrustedDeviceTokenCache)();
                    (0, betas_js_1.clearBetasCaches)();
                    (0, toolSchemaCache_js_1.clearToolSchemaCache)();
                    // Clear user data cache BEFORE GrowthBook refresh so it picks up fresh credentials
                    (0, user_js_1.resetUserCache)();
                    (0, growthbook_js_1.refreshGrowthBookAfterAuthChange)();
                    // Clear Grove config cache
                    (_d = (_c = grove_js_1.getGroveNoticeConfig.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
                    (_f = (_e = grove_js_1.getGroveSettings.cache) === null || _e === void 0 ? void 0 : _e.clear) === null || _f === void 0 ? void 0 : _f.call(_e);
                    // Clear remotely managed settings cache
                    return [4 /*yield*/, (0, index_js_2.clearRemoteManagedSettingsCache)()];
                case 1:
                    // Clear remotely managed settings cache
                    _g.sent();
                    // Clear policy limits cache
                    return [4 /*yield*/, (0, index_js_1.clearPolicyLimitsCache)()];
                case 2:
                    // Clear policy limits cache
                    _g.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function call() {
    return __awaiter(this, void 0, void 0, function () {
        var message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, performLogout({
                        clearOnboarding: true
                    })];
                case 1:
                    _a.sent();
                    message = <ink_js_1.Text>Successfully logged out from your Anthropic account.</ink_js_1.Text>;
                    setTimeout(function () {
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(0, 'logout');
                    }, 200);
                    return [2 /*return*/, message];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsImNsZWFyVHJ1c3RlZERldmljZVRva2VuQ2FjaGUiLCJUZXh0IiwicmVmcmVzaEdyb3d0aEJvb2tBZnRlckF1dGhDaGFuZ2UiLCJnZXRHcm92ZU5vdGljZUNvbmZpZyIsImdldEdyb3ZlU2V0dGluZ3MiLCJjbGVhclBvbGljeUxpbWl0c0NhY2hlIiwiY2xlYXJSZW1vdGVNYW5hZ2VkU2V0dGluZ3NDYWNoZSIsImdldENsYXVkZUFJT0F1dGhUb2tlbnMiLCJyZW1vdmVBcGlLZXkiLCJjbGVhckJldGFzQ2FjaGVzIiwic2F2ZUdsb2JhbENvbmZpZyIsImdyYWNlZnVsU2h1dGRvd25TeW5jIiwiZ2V0U2VjdXJlU3RvcmFnZSIsImNsZWFyVG9vbFNjaGVtYUNhY2hlIiwicmVzZXRVc2VyQ2FjaGUiLCJwZXJmb3JtTG9nb3V0IiwiY2xlYXJPbmJvYXJkaW5nIiwiUHJvbWlzZSIsImZsdXNoVGVsZW1ldHJ5Iiwic2VjdXJlU3RvcmFnZSIsImRlbGV0ZSIsImNsZWFyQXV0aFJlbGF0ZWRDYWNoZXMiLCJjdXJyZW50IiwidXBkYXRlZCIsImhhc0NvbXBsZXRlZE9uYm9hcmRpbmciLCJzdWJzY3JpcHRpb25Ob3RpY2VDb3VudCIsImhhc0F2YWlsYWJsZVN1YnNjcmlwdGlvbiIsImN1c3RvbUFwaUtleVJlc3BvbnNlcyIsImFwcHJvdmVkIiwib2F1dGhBY2NvdW50IiwidW5kZWZpbmVkIiwiY2FjaGUiLCJjbGVhciIsImNhbGwiLCJSZWFjdE5vZGUiLCJtZXNzYWdlIiwic2V0VGltZW91dCJdLCJzb3VyY2VzIjpbImxvZ291dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBjbGVhclRydXN0ZWREZXZpY2VUb2tlbkNhY2hlIH0gZnJvbSAnLi4vLi4vYnJpZGdlL3RydXN0ZWREZXZpY2UuanMnXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vaW5rLmpzJ1xuaW1wb3J0IHsgcmVmcmVzaEdyb3d0aEJvb2tBZnRlckF1dGhDaGFuZ2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hbmFseXRpY3MvZ3Jvd3RoYm9vay5qcydcbmltcG9ydCB7XG4gIGdldEdyb3ZlTm90aWNlQ29uZmlnLFxuICBnZXRHcm92ZVNldHRpbmdzLFxufSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hcGkvZ3JvdmUuanMnXG5pbXBvcnQgeyBjbGVhclBvbGljeUxpbWl0c0NhY2hlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvcG9saWN5TGltaXRzL2luZGV4LmpzJ1xuLy8gZmx1c2hUZWxlbWV0cnkgaXMgbG9hZGVkIGxhemlseSB0byBhdm9pZCBwdWxsaW5nIGluIH4xLjFNQiBvZiBPcGVuVGVsZW1ldHJ5IGF0IHN0YXJ0dXBcbmltcG9ydCB7IGNsZWFyUmVtb3RlTWFuYWdlZFNldHRpbmdzQ2FjaGUgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9yZW1vdGVNYW5hZ2VkU2V0dGluZ3MvaW5kZXguanMnXG5pbXBvcnQgeyBnZXRDbGF1ZGVBSU9BdXRoVG9rZW5zLCByZW1vdmVBcGlLZXkgfSBmcm9tICcuLi8uLi91dGlscy9hdXRoLmpzJ1xuaW1wb3J0IHsgY2xlYXJCZXRhc0NhY2hlcyB9IGZyb20gJy4uLy4uL3V0aWxzL2JldGFzLmpzJ1xuaW1wb3J0IHsgc2F2ZUdsb2JhbENvbmZpZyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IGdyYWNlZnVsU2h1dGRvd25TeW5jIH0gZnJvbSAnLi4vLi4vdXRpbHMvZ3JhY2VmdWxTaHV0ZG93bi5qcydcbmltcG9ydCB7IGdldFNlY3VyZVN0b3JhZ2UgfSBmcm9tICcuLi8uLi91dGlscy9zZWN1cmVTdG9yYWdlL2luZGV4LmpzJ1xuaW1wb3J0IHsgY2xlYXJUb29sU2NoZW1hQ2FjaGUgfSBmcm9tICcuLi8uLi91dGlscy90b29sU2NoZW1hQ2FjaGUuanMnXG5pbXBvcnQgeyByZXNldFVzZXJDYWNoZSB9IGZyb20gJy4uLy4uL3V0aWxzL3VzZXIuanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwZXJmb3JtTG9nb3V0KHtcbiAgY2xlYXJPbmJvYXJkaW5nID0gZmFsc2UsXG59KTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIEZsdXNoIHRlbGVtZXRyeSBCRUZPUkUgY2xlYXJpbmcgY3JlZGVudGlhbHMgdG8gcHJldmVudCBvcmcgZGF0YSBsZWFrYWdlXG4gIGNvbnN0IHsgZmx1c2hUZWxlbWV0cnkgfSA9IGF3YWl0IGltcG9ydChcbiAgICAnLi4vLi4vdXRpbHMvdGVsZW1ldHJ5L2luc3RydW1lbnRhdGlvbi5qcydcbiAgKVxuICBhd2FpdCBmbHVzaFRlbGVtZXRyeSgpXG5cbiAgYXdhaXQgcmVtb3ZlQXBpS2V5KClcblxuICAvLyBXaXBlIGFsbCBzZWN1cmUgc3RvcmFnZSBkYXRhIG9uIGxvZ291dFxuICBjb25zdCBzZWN1cmVTdG9yYWdlID0gZ2V0U2VjdXJlU3RvcmFnZSgpXG4gIHNlY3VyZVN0b3JhZ2UuZGVsZXRlKClcblxuICBhd2FpdCBjbGVhckF1dGhSZWxhdGVkQ2FjaGVzKClcbiAgc2F2ZUdsb2JhbENvbmZpZyhjdXJyZW50ID0+IHtcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi5jdXJyZW50IH1cbiAgICBpZiAoY2xlYXJPbmJvYXJkaW5nKSB7XG4gICAgICB1cGRhdGVkLmhhc0NvbXBsZXRlZE9uYm9hcmRpbmcgPSBmYWxzZVxuICAgICAgdXBkYXRlZC5zdWJzY3JpcHRpb25Ob3RpY2VDb3VudCA9IDBcbiAgICAgIHVwZGF0ZWQuaGFzQXZhaWxhYmxlU3Vic2NyaXB0aW9uID0gZmFsc2VcbiAgICAgIGlmICh1cGRhdGVkLmN1c3RvbUFwaUtleVJlc3BvbnNlcz8uYXBwcm92ZWQpIHtcbiAgICAgICAgdXBkYXRlZC5jdXN0b21BcGlLZXlSZXNwb25zZXMgPSB7XG4gICAgICAgICAgLi4udXBkYXRlZC5jdXN0b21BcGlLZXlSZXNwb25zZXMsXG4gICAgICAgICAgYXBwcm92ZWQ6IFtdLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZWQub2F1dGhBY2NvdW50ID0gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHVwZGF0ZWRcbiAgfSlcbn1cblxuLy8gY2xlYXJpbmcgYW55dGhpbmcgbWVtb2l6ZWQgdGhhdCBtdXN0IGJlIGludmFsaWRhdGVkIHdoZW4gdXNlci9zZXNzaW9uL2F1dGggY2hhbmdlc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQXV0aFJlbGF0ZWRDYWNoZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIENsZWFyIHRoZSBPQXV0aCB0b2tlbiBjYWNoZVxuICBnZXRDbGF1ZGVBSU9BdXRoVG9rZW5zLmNhY2hlPy5jbGVhcj8uKClcbiAgY2xlYXJUcnVzdGVkRGV2aWNlVG9rZW5DYWNoZSgpXG4gIGNsZWFyQmV0YXNDYWNoZXMoKVxuICBjbGVhclRvb2xTY2hlbWFDYWNoZSgpXG5cbiAgLy8gQ2xlYXIgdXNlciBkYXRhIGNhY2hlIEJFRk9SRSBHcm93dGhCb29rIHJlZnJlc2ggc28gaXQgcGlja3MgdXAgZnJlc2ggY3JlZGVudGlhbHNcbiAgcmVzZXRVc2VyQ2FjaGUoKVxuICByZWZyZXNoR3Jvd3RoQm9va0FmdGVyQXV0aENoYW5nZSgpXG5cbiAgLy8gQ2xlYXIgR3JvdmUgY29uZmlnIGNhY2hlXG4gIGdldEdyb3ZlTm90aWNlQ29uZmlnLmNhY2hlPy5jbGVhcj8uKClcbiAgZ2V0R3JvdmVTZXR0aW5ncy5jYWNoZT8uY2xlYXI/LigpXG5cbiAgLy8gQ2xlYXIgcmVtb3RlbHkgbWFuYWdlZCBzZXR0aW5ncyBjYWNoZVxuICBhd2FpdCBjbGVhclJlbW90ZU1hbmFnZWRTZXR0aW5nc0NhY2hlKClcblxuICAvLyBDbGVhciBwb2xpY3kgbGltaXRzIGNhY2hlXG4gIGF3YWl0IGNsZWFyUG9saWN5TGltaXRzQ2FjaGUoKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsbCgpOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICBhd2FpdCBwZXJmb3JtTG9nb3V0KHsgY2xlYXJPbmJvYXJkaW5nOiB0cnVlIH0pXG5cbiAgY29uc3QgbWVzc2FnZSA9IChcbiAgICA8VGV4dD5TdWNjZXNzZnVsbHkgbG9nZ2VkIG91dCBmcm9tIHlvdXIgQW50aHJvcGljIGFjY291bnQuPC9UZXh0PlxuICApXG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZ3JhY2VmdWxTaHV0ZG93blN5bmMoMCwgJ2xvZ291dCcpXG4gIH0sIDIwMClcblxuICByZXR1cm4gbWVzc2FnZVxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUtBLEtBQUssTUFBTSxPQUFPO0FBQzlCLFNBQVNDLDRCQUE0QixRQUFRLCtCQUErQjtBQUM1RSxTQUFTQyxJQUFJLFFBQVEsY0FBYztBQUNuQyxTQUFTQyxnQ0FBZ0MsUUFBUSx3Q0FBd0M7QUFDekYsU0FDRUMsb0JBQW9CLEVBQ3BCQyxnQkFBZ0IsUUFDWCw2QkFBNkI7QUFDcEMsU0FBU0Msc0JBQXNCLFFBQVEsc0NBQXNDO0FBQzdFO0FBQ0EsU0FBU0MsK0JBQStCLFFBQVEsK0NBQStDO0FBQy9GLFNBQVNDLHNCQUFzQixFQUFFQyxZQUFZLFFBQVEscUJBQXFCO0FBQzFFLFNBQVNDLGdCQUFnQixRQUFRLHNCQUFzQjtBQUN2RCxTQUFTQyxnQkFBZ0IsUUFBUSx1QkFBdUI7QUFDeEQsU0FBU0Msb0JBQW9CLFFBQVEsaUNBQWlDO0FBQ3RFLFNBQVNDLGdCQUFnQixRQUFRLG9DQUFvQztBQUNyRSxTQUFTQyxvQkFBb0IsUUFBUSxnQ0FBZ0M7QUFDckUsU0FBU0MsY0FBYyxRQUFRLHFCQUFxQjtBQUVwRCxPQUFPLGVBQWVDLGFBQWFBLENBQUM7RUFDbENDLGVBQWUsR0FBRztBQUNwQixDQUFDLENBQUMsRUFBRUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ2hCO0VBQ0EsTUFBTTtJQUFFQztFQUFlLENBQUMsR0FBRyxNQUFNLE1BQU0sQ0FDckMsMENBQ0YsQ0FBQztFQUNELE1BQU1BLGNBQWMsQ0FBQyxDQUFDO0VBRXRCLE1BQU1WLFlBQVksQ0FBQyxDQUFDOztFQUVwQjtFQUNBLE1BQU1XLGFBQWEsR0FBR1AsZ0JBQWdCLENBQUMsQ0FBQztFQUN4Q08sYUFBYSxDQUFDQyxNQUFNLENBQUMsQ0FBQztFQUV0QixNQUFNQyxzQkFBc0IsQ0FBQyxDQUFDO0VBQzlCWCxnQkFBZ0IsQ0FBQ1ksT0FBTyxJQUFJO0lBQzFCLE1BQU1DLE9BQU8sR0FBRztNQUFFLEdBQUdEO0lBQVEsQ0FBQztJQUM5QixJQUFJTixlQUFlLEVBQUU7TUFDbkJPLE9BQU8sQ0FBQ0Msc0JBQXNCLEdBQUcsS0FBSztNQUN0Q0QsT0FBTyxDQUFDRSx1QkFBdUIsR0FBRyxDQUFDO01BQ25DRixPQUFPLENBQUNHLHdCQUF3QixHQUFHLEtBQUs7TUFDeEMsSUFBSUgsT0FBTyxDQUFDSSxxQkFBcUIsRUFBRUMsUUFBUSxFQUFFO1FBQzNDTCxPQUFPLENBQUNJLHFCQUFxQixHQUFHO1VBQzlCLEdBQUdKLE9BQU8sQ0FBQ0kscUJBQXFCO1VBQ2hDQyxRQUFRLEVBQUU7UUFDWixDQUFDO01BQ0g7SUFDRjtJQUNBTCxPQUFPLENBQUNNLFlBQVksR0FBR0MsU0FBUztJQUNoQyxPQUFPUCxPQUFPO0VBQ2hCLENBQUMsQ0FBQztBQUNKOztBQUVBO0FBQ0EsT0FBTyxlQUFlRixzQkFBc0JBLENBQUEsQ0FBRSxFQUFFSixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDNUQ7RUFDQVYsc0JBQXNCLENBQUN3QixLQUFLLEVBQUVDLEtBQUssR0FBRyxDQUFDO0VBQ3ZDaEMsNEJBQTRCLENBQUMsQ0FBQztFQUM5QlMsZ0JBQWdCLENBQUMsQ0FBQztFQUNsQkksb0JBQW9CLENBQUMsQ0FBQzs7RUFFdEI7RUFDQUMsY0FBYyxDQUFDLENBQUM7RUFDaEJaLGdDQUFnQyxDQUFDLENBQUM7O0VBRWxDO0VBQ0FDLG9CQUFvQixDQUFDNEIsS0FBSyxFQUFFQyxLQUFLLEdBQUcsQ0FBQztFQUNyQzVCLGdCQUFnQixDQUFDMkIsS0FBSyxFQUFFQyxLQUFLLEdBQUcsQ0FBQzs7RUFFakM7RUFDQSxNQUFNMUIsK0JBQStCLENBQUMsQ0FBQzs7RUFFdkM7RUFDQSxNQUFNRCxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2hDO0FBRUEsT0FBTyxlQUFlNEIsSUFBSUEsQ0FBQSxDQUFFLEVBQUVoQixPQUFPLENBQUNsQixLQUFLLENBQUNtQyxTQUFTLENBQUMsQ0FBQztFQUNyRCxNQUFNbkIsYUFBYSxDQUFDO0lBQUVDLGVBQWUsRUFBRTtFQUFLLENBQUMsQ0FBQztFQUU5QyxNQUFNbUIsT0FBTyxHQUNYLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxFQUFFLElBQUksQ0FDakU7RUFFREMsVUFBVSxDQUFDLE1BQU07SUFDZnpCLG9CQUFvQixDQUFDLENBQUMsRUFBRSxRQUFRLENBQUM7RUFDbkMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztFQUVQLE9BQU93QixPQUFPO0FBQ2hCIiwiaWdub3JlTGlzdCI6W119
