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
exports.call = call;
var React = require("react");
var Grove_js_1 = require("../../components/grove/Grove.js");
var index_js_1 = require("../../services/analytics/index.js");
var grove_js_1 = require("../../services/api/grove.js");
var FALLBACK_MESSAGE = 'Review and manage your privacy settings at https://claude.ai/settings/data-privacy-controls';
function call(onDone) {
    return __awaiter(this, void 0, void 0, function () {
        function onDoneWithDecision(decision) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (decision === 'escape' || decision === 'defer') {
                                onDone('Privacy settings dialog dismissed', {
                                    display: 'system'
                                });
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, onDoneWithSettingsCheck()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function onDoneWithSettingsCheck() {
            return __awaiter(this, void 0, void 0, function () {
                var updatedSettingsResult, updatedSettings, groveStatus;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, grove_js_1.getGroveSettings)()];
                        case 1:
                            updatedSettingsResult = _a.sent();
                            if (!updatedSettingsResult.success) {
                                onDone('Unable to retrieve updated privacy settings', {
                                    display: 'system'
                                });
                                return [2 /*return*/];
                            }
                            updatedSettings = updatedSettingsResult.data;
                            groveStatus = updatedSettings.grove_enabled ? 'true' : 'false';
                            onDone("\"Help improve Claude\" set to ".concat(groveStatus, "."));
                            if (settings.grove_enabled !== null && settings.grove_enabled !== updatedSettings.grove_enabled) {
                                (0, index_js_1.logEvent)('tengu_grove_policy_toggled', {
                                    state: updatedSettings.grove_enabled,
                                    location: 'settings'
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var qualified, _a, settingsResult, configResult, settings, config;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, grove_js_1.isQualifiedForGrove)()];
                case 1:
                    qualified = _b.sent();
                    if (!qualified) {
                        onDone(FALLBACK_MESSAGE);
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, Promise.all([(0, grove_js_1.getGroveSettings)(), (0, grove_js_1.getGroveNoticeConfig)()])];
                case 2:
                    _a = _b.sent(), settingsResult = _a[0], configResult = _a[1];
                    // Hide dialog on API failure (after retry)
                    if (!settingsResult.success) {
                        onDone(FALLBACK_MESSAGE);
                        return [2 /*return*/, null];
                    }
                    settings = settingsResult.data;
                    config = configResult.success ? configResult.data : null;
                    // Show privacy settings directly if the user has already accepted the
                    // terms.
                    if (settings.grove_enabled !== null) {
                        return [2 /*return*/, <Grove_js_1.PrivacySettingsDialog settings={settings} domainExcluded={config === null || config === void 0 ? void 0 : config.domain_excluded} onDone={onDoneWithSettingsCheck}></Grove_js_1.PrivacySettingsDialog>];
                    }
                    // Show the GroveDialog for users who haven't accepted terms yet
                    return [2 /*return*/, <Grove_js_1.GroveDialog showIfAlreadyViewed={true} onDone={onDoneWithDecision} location={'settings'}/>];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkdyb3ZlRGVjaXNpb24iLCJHcm92ZURpYWxvZyIsIlByaXZhY3lTZXR0aW5nc0RpYWxvZyIsIkFuYWx5dGljc01ldGFkYXRhX0lfVkVSSUZJRURfVEhJU19JU19OT1RfQ09ERV9PUl9GSUxFUEFUSFMiLCJsb2dFdmVudCIsImdldEdyb3ZlTm90aWNlQ29uZmlnIiwiZ2V0R3JvdmVTZXR0aW5ncyIsImlzUXVhbGlmaWVkRm9yR3JvdmUiLCJMb2NhbEpTWENvbW1hbmRPbkRvbmUiLCJGQUxMQkFDS19NRVNTQUdFIiwiY2FsbCIsIm9uRG9uZSIsIlByb21pc2UiLCJSZWFjdE5vZGUiLCJxdWFsaWZpZWQiLCJzZXR0aW5nc1Jlc3VsdCIsImNvbmZpZ1Jlc3VsdCIsImFsbCIsInN1Y2Nlc3MiLCJzZXR0aW5ncyIsImRhdGEiLCJjb25maWciLCJvbkRvbmVXaXRoRGVjaXNpb24iLCJkZWNpc2lvbiIsImRpc3BsYXkiLCJvbkRvbmVXaXRoU2V0dGluZ3NDaGVjayIsInVwZGF0ZWRTZXR0aW5nc1Jlc3VsdCIsInVwZGF0ZWRTZXR0aW5ncyIsImdyb3ZlU3RhdHVzIiwiZ3JvdmVfZW5hYmxlZCIsInN0YXRlIiwibG9jYXRpb24iLCJkb21haW5fZXhjbHVkZWQiXSwic291cmNlcyI6WyJwcml2YWN5LXNldHRpbmdzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7XG4gIHR5cGUgR3JvdmVEZWNpc2lvbixcbiAgR3JvdmVEaWFsb2csXG4gIFByaXZhY3lTZXR0aW5nc0RpYWxvZyxcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9ncm92ZS9Hcm92ZS5qcydcbmltcG9ydCB7XG4gIHR5cGUgQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyxcbiAgbG9nRXZlbnQsXG59IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FuYWx5dGljcy9pbmRleC5qcydcbmltcG9ydCB7XG4gIGdldEdyb3ZlTm90aWNlQ29uZmlnLFxuICBnZXRHcm92ZVNldHRpbmdzLFxuICBpc1F1YWxpZmllZEZvckdyb3ZlLFxufSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hcGkvZ3JvdmUuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5cbmNvbnN0IEZBTExCQUNLX01FU1NBR0UgPVxuICAnUmV2aWV3IGFuZCBtYW5hZ2UgeW91ciBwcml2YWN5IHNldHRpbmdzIGF0IGh0dHBzOi8vY2xhdWRlLmFpL3NldHRpbmdzL2RhdGEtcHJpdmFjeS1jb250cm9scydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGwoXG4gIG9uRG9uZTogTG9jYWxKU1hDb21tYW5kT25Eb25lLFxuKTogUHJvbWlzZTxSZWFjdC5SZWFjdE5vZGUgfCBudWxsPiB7XG4gIGNvbnN0IHF1YWxpZmllZCA9IGF3YWl0IGlzUXVhbGlmaWVkRm9yR3JvdmUoKVxuICBpZiAoIXF1YWxpZmllZCkge1xuICAgIG9uRG9uZShGQUxMQkFDS19NRVNTQUdFKVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBbc2V0dGluZ3NSZXN1bHQsIGNvbmZpZ1Jlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgZ2V0R3JvdmVTZXR0aW5ncygpLFxuICAgIGdldEdyb3ZlTm90aWNlQ29uZmlnKCksXG4gIF0pXG4gIC8vIEhpZGUgZGlhbG9nIG9uIEFQSSBmYWlsdXJlIChhZnRlciByZXRyeSlcbiAgaWYgKCFzZXR0aW5nc1Jlc3VsdC5zdWNjZXNzKSB7XG4gICAgb25Eb25lKEZBTExCQUNLX01FU1NBR0UpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBjb25zdCBzZXR0aW5ncyA9IHNldHRpbmdzUmVzdWx0LmRhdGFcbiAgY29uc3QgY29uZmlnID0gY29uZmlnUmVzdWx0LnN1Y2Nlc3MgPyBjb25maWdSZXN1bHQuZGF0YSA6IG51bGxcblxuICBhc3luYyBmdW5jdGlvbiBvbkRvbmVXaXRoRGVjaXNpb24oZGVjaXNpb246IEdyb3ZlRGVjaXNpb24pIHtcbiAgICBpZiAoZGVjaXNpb24gPT09ICdlc2NhcGUnIHx8IGRlY2lzaW9uID09PSAnZGVmZXInKSB7XG4gICAgICBvbkRvbmUoJ1ByaXZhY3kgc2V0dGluZ3MgZGlhbG9nIGRpc21pc3NlZCcsIHtcbiAgICAgICAgZGlzcGxheTogJ3N5c3RlbScsXG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGF3YWl0IG9uRG9uZVdpdGhTZXR0aW5nc0NoZWNrKClcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIG9uRG9uZVdpdGhTZXR0aW5nc0NoZWNrKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRTZXR0aW5nc1Jlc3VsdCA9IGF3YWl0IGdldEdyb3ZlU2V0dGluZ3MoKVxuICAgIGlmICghdXBkYXRlZFNldHRpbmdzUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgIG9uRG9uZSgnVW5hYmxlIHRvIHJldHJpZXZlIHVwZGF0ZWQgcHJpdmFjeSBzZXR0aW5ncycsIHtcbiAgICAgICAgZGlzcGxheTogJ3N5c3RlbScsXG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHVwZGF0ZWRTZXR0aW5ncyA9IHVwZGF0ZWRTZXR0aW5nc1Jlc3VsdC5kYXRhXG4gICAgY29uc3QgZ3JvdmVTdGF0dXMgPSB1cGRhdGVkU2V0dGluZ3MuZ3JvdmVfZW5hYmxlZCA/ICd0cnVlJyA6ICdmYWxzZSdcbiAgICBvbkRvbmUoYFwiSGVscCBpbXByb3ZlIENsYXVkZVwiIHNldCB0byAke2dyb3ZlU3RhdHVzfS5gKVxuICAgIGlmIChcbiAgICAgIHNldHRpbmdzLmdyb3ZlX2VuYWJsZWQgIT09IG51bGwgJiZcbiAgICAgIHNldHRpbmdzLmdyb3ZlX2VuYWJsZWQgIT09IHVwZGF0ZWRTZXR0aW5ncy5ncm92ZV9lbmFibGVkXG4gICAgKSB7XG4gICAgICBsb2dFdmVudCgndGVuZ3VfZ3JvdmVfcG9saWN5X3RvZ2dsZWQnLCB7XG4gICAgICAgIHN0YXRlOlxuICAgICAgICAgIHVwZGF0ZWRTZXR0aW5ncy5ncm92ZV9lbmFibGVkIGFzIEFuYWx5dGljc01ldGFkYXRhX0lfVkVSSUZJRURfVEhJU19JU19OT1RfQ09ERV9PUl9GSUxFUEFUSFMsXG4gICAgICAgIGxvY2F0aW9uOlxuICAgICAgICAgICdzZXR0aW5ncycgYXMgQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLy8gU2hvdyBwcml2YWN5IHNldHRpbmdzIGRpcmVjdGx5IGlmIHRoZSB1c2VyIGhhcyBhbHJlYWR5IGFjY2VwdGVkIHRoZVxuICAvLyB0ZXJtcy5cbiAgaWYgKHNldHRpbmdzLmdyb3ZlX2VuYWJsZWQgIT09IG51bGwpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFByaXZhY3lTZXR0aW5nc0RpYWxvZ1xuICAgICAgICBzZXR0aW5ncz17c2V0dGluZ3N9XG4gICAgICAgIGRvbWFpbkV4Y2x1ZGVkPXtjb25maWc/LmRvbWFpbl9leGNsdWRlZH1cbiAgICAgICAgb25Eb25lPXtvbkRvbmVXaXRoU2V0dGluZ3NDaGVja31cbiAgICAgID48L1ByaXZhY3lTZXR0aW5nc0RpYWxvZz5cbiAgICApXG4gIH1cblxuICAvLyBTaG93IHRoZSBHcm92ZURpYWxvZyBmb3IgdXNlcnMgd2hvIGhhdmVuJ3QgYWNjZXB0ZWQgdGVybXMgeWV0XG4gIHJldHVybiAoXG4gICAgPEdyb3ZlRGlhbG9nXG4gICAgICBzaG93SWZBbHJlYWR5Vmlld2VkPXt0cnVlfVxuICAgICAgb25Eb25lPXtvbkRvbmVXaXRoRGVjaXNpb259XG4gICAgICBsb2NhdGlvbj17J3NldHRpbmdzJ31cbiAgICAvPlxuICApXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBS0EsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FDRSxLQUFLQyxhQUFhLEVBQ2xCQyxXQUFX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
