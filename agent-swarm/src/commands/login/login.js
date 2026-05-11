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
exports.call = call;
exports.Login = Login;
var compiler_runtime_1 = require("react/compiler-runtime");
var bun_bundle_1 = require("bun:bundle");
var React = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var trustedDevice_js_1 = require("../../bridge/trustedDevice.js");
var ConfigurableShortcutHint_js_1 = require("../../components/ConfigurableShortcutHint.js");
var ConsoleOAuthFlow_js_1 = require("../../components/ConsoleOAuthFlow.js");
var Dialog_js_1 = require("../../components/design-system/Dialog.js");
var useMainLoopModel_js_1 = require("../../hooks/useMainLoopModel.js");
var ink_js_1 = require("../../ink.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/policyLimits/index.js");
var index_js_2 = require("../../services/remoteManagedSettings/index.js");
var messages_js_1 = require("../../utils/messages.js");
var bypassPermissionsKillswitch_js_1 = require("../../utils/permissions/bypassPermissionsKillswitch.js");
var user_js_1 = require("../../utils/user.js");
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, <Login onDone={function (success) { return __awaiter(_this, void 0, void 0, function () {
                        var appState;
                        return __generator(this, function (_a) {
                            context.onChangeAPIKey();
                            // Signature-bearing blocks (thinking, connector_text) are bound to the API key —
                            // strip them so the new key doesn't reject stale signatures.
                            context.setMessages(messages_js_1.stripSignatureBlocks);
                            if (success) {
                                // Post-login refresh logic. Keep in sync with onboarding in src/interactiveHelpers.tsx
                                // Reset cost state when switching accounts
                                (0, state_js_1.resetCostState)();
                                // Refresh remotely managed settings after login (non-blocking)
                                void (0, index_js_2.refreshRemoteManagedSettings)();
                                // Refresh policy limits after login (non-blocking)
                                void (0, index_js_1.refreshPolicyLimits)();
                                // Clear user data cache BEFORE GrowthBook refresh so it picks up fresh credentials
                                (0, user_js_1.resetUserCache)();
                                // Refresh GrowthBook after login to get updated feature flags (e.g., for claude.ai MCPs)
                                (0, growthbook_js_1.refreshGrowthBookAfterAuthChange)();
                                // Clear any stale trusted device token from a previous account before
                                // re-enrolling — prevents sending the old token on bridge calls while
                                // the async enrollTrustedDevice() is in-flight.
                                (0, trustedDevice_js_1.clearTrustedDeviceToken)();
                                // Enroll as a trusted device for Remote Control (10-min fresh-session window)
                                void (0, trustedDevice_js_1.enrollTrustedDevice)();
                                // Reset killswitch gate checks and re-run with new org
                                (0, bypassPermissionsKillswitch_js_1.resetBypassPermissionsCheck)();
                                appState = context.getAppState();
                                void (0, bypassPermissionsKillswitch_js_1.checkAndDisableBypassPermissionsIfNeeded)(appState.toolPermissionContext, context.setAppState);
                                if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
                                    (0, bypassPermissionsKillswitch_js_1.resetAutoModeGateCheck)();
                                    void (0, bypassPermissionsKillswitch_js_1.checkAndDisableAutoModeIfNeeded)(appState.toolPermissionContext, context.setAppState, appState.fastMode);
                                }
                                // Increment authVersion to trigger re-fetching of auth-dependent data in hooks (e.g., MCP servers)
                                context.setAppState(function (prev) { return (__assign(__assign({}, prev), { authVersion: prev.authVersion + 1 })); });
                            }
                            onDone(success ? 'Login successful' : 'Login interrupted');
                            return [2 /*return*/];
                        });
                    }); }}/>];
        });
    });
}
function Login(props) {
    var $ = (0, compiler_runtime_1.c)(12);
    var mainLoopModel = (0, useMainLoopModel_js_1.useMainLoopModel)();
    var t0;
    if ($[0] !== mainLoopModel || $[1] !== props) {
        t0 = function () { return props.onDone(false, mainLoopModel); };
        $[0] = mainLoopModel;
        $[1] = props;
        $[2] = t0;
    }
    else {
        t0 = $[2];
    }
    var t1;
    if ($[3] !== mainLoopModel || $[4] !== props) {
        t1 = function () { return props.onDone(true, mainLoopModel); };
        $[3] = mainLoopModel;
        $[4] = props;
        $[5] = t1;
    }
    else {
        t1 = $[5];
    }
    var t2;
    if ($[6] !== props.startingMessage || $[7] !== t1) {
        t2 = <ConsoleOAuthFlow_js_1.ConsoleOAuthFlow onDone={t1} startingMessage={props.startingMessage}/>;
        $[6] = props.startingMessage;
        $[7] = t1;
        $[8] = t2;
    }
    else {
        t2 = $[8];
    }
    var t3;
    if ($[9] !== t0 || $[10] !== t2) {
        t3 = <Dialog_js_1.Dialog title="Login" onCancel={t0} color="permission" inputGuide={_temp}>{t2}</Dialog_js_1.Dialog>;
        $[9] = t0;
        $[10] = t2;
        $[11] = t3;
    }
    else {
        t3 = $[11];
    }
    return t3;
}
function _temp(exitState) {
    return exitState.pending ? <ink_js_1.Text>Press {exitState.keyName} again to exit</ink_js_1.Text> : <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="cancel"/>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmZWF0dXJlIiwiUmVhY3QiLCJyZXNldENvc3RTdGF0ZSIsImNsZWFyVHJ1c3RlZERldmljZVRva2VuIiwiZW5yb2xsVHJ1c3RlZERldmljZSIsIkxvY2FsSlNYQ29tbWFuZENvbnRleHQiLCJDb25maWd1cmFibGVTaG9ydGN1dEhpbnQiLCJDb25zb2xlT0F1dGhGbG93IiwiRGlhbG9nIiwidXNlTWFpbkxvb3BNb2RlbCIsIlRleHQiLCJyZWZyZXNoR3Jvd3RoQm9va0FmdGVyQXV0aENoYW5nZSIsInJlZnJlc2hQb2xpY3lMaW1pdHMiLCJyZWZyZXNoUmVtb3RlTWFuYWdlZFNldHRpbmdzIiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwic3RyaXBTaWduYXR1cmVCbG9ja3MiLCJjaGVja0FuZERpc2FibGVBdXRvTW9kZUlmTmVlZGVkIiwiY2hlY2tBbmREaXNhYmxlQnlwYXNzUGVybWlzc2lvbnNJZk5lZWRlZCIsInJlc2V0QXV0b01vZGVHYXRlQ2hlY2siLCJyZXNldEJ5cGFzc1Blcm1pc3Npb25zQ2hlY2siLCJyZXNldFVzZXJDYWNoZSIsImNhbGwiLCJvbkRvbmUiLCJjb250ZXh0IiwiUHJvbWlzZSIsIlJlYWN0Tm9kZSIsInN1Y2Nlc3MiLCJvbkNoYW5nZUFQSUtleSIsInNldE1lc3NhZ2VzIiwiYXBwU3RhdGUiLCJnZXRBcHBTdGF0ZSIsInRvb2xQZXJtaXNzaW9uQ29udGV4dCIsInNldEFwcFN0YXRlIiwiZmFzdE1vZGUiLCJwcmV2IiwiYXV0aFZlcnNpb24iLCJMb2dpbiIsInByb3BzIiwiJCIsIl9jIiwibWFpbkxvb3BNb2RlbCIsInQwIiwidDEiLCJ0MiIsInN0YXJ0aW5nTWVzc2FnZSIsInQzIiwiX3RlbXAiLCJleGl0U3RhdGUiLCJwZW5kaW5nIiwia2V5TmFtZSJdLCJzb3VyY2VzIjpbImxvZ2luLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmZWF0dXJlIH0gZnJvbSAnYnVuOmJ1bmRsZSdcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgcmVzZXRDb3N0U3RhdGUgfSBmcm9tICcuLi8uLi9ib290c3RyYXAvc3RhdGUuanMnXG5pbXBvcnQge1xuICBjbGVhclRydXN0ZWREZXZpY2VUb2tlbixcbiAgZW5yb2xsVHJ1c3RlZERldmljZSxcbn0gZnJvbSAnLi4vLi4vYnJpZGdlL3RydXN0ZWREZXZpY2UuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZENvbnRleHQgfSBmcm9tICcuLi8uLi9jb21tYW5kcy5qcydcbmltcG9ydCB7IENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgQ29uc29sZU9BdXRoRmxvdyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvQ29uc29sZU9BdXRoRmxvdy5qcydcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZGVzaWduLXN5c3RlbS9EaWFsb2cuanMnXG5pbXBvcnQgeyB1c2VNYWluTG9vcE1vZGVsIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlTWFpbkxvb3BNb2RlbC5qcydcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi9pbmsuanMnXG5pbXBvcnQgeyByZWZyZXNoR3Jvd3RoQm9va0FmdGVyQXV0aENoYW5nZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FuYWx5dGljcy9ncm93dGhib29rLmpzJ1xuaW1wb3J0IHsgcmVmcmVzaFBvbGljeUxpbWl0cyB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL3BvbGljeUxpbWl0cy9pbmRleC5qcydcbmltcG9ydCB7IHJlZnJlc2hSZW1vdGVNYW5hZ2VkU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9yZW1vdGVNYW5hZ2VkU2V0dGluZ3MvaW5kZXguanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5pbXBvcnQgeyBzdHJpcFNpZ25hdHVyZUJsb2NrcyB9IGZyb20gJy4uLy4uL3V0aWxzL21lc3NhZ2VzLmpzJ1xuaW1wb3J0IHtcbiAgY2hlY2tBbmREaXNhYmxlQXV0b01vZGVJZk5lZWRlZCxcbiAgY2hlY2tBbmREaXNhYmxlQnlwYXNzUGVybWlzc2lvbnNJZk5lZWRlZCxcbiAgcmVzZXRBdXRvTW9kZUdhdGVDaGVjayxcbiAgcmVzZXRCeXBhc3NQZXJtaXNzaW9uc0NoZWNrLFxufSBmcm9tICcuLi8uLi91dGlscy9wZXJtaXNzaW9ucy9ieXBhc3NQZXJtaXNzaW9uc0tpbGxzd2l0Y2guanMnXG5pbXBvcnQgeyByZXNldFVzZXJDYWNoZSB9IGZyb20gJy4uLy4uL3V0aWxzL3VzZXIuanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgY29udGV4dDogTG9jYWxKU1hDb21tYW5kQ29udGV4dCxcbik6IFByb21pc2U8UmVhY3QuUmVhY3ROb2RlPiB7XG4gIHJldHVybiAoXG4gICAgPExvZ2luXG4gICAgICBvbkRvbmU9e2FzeW5jIHN1Y2Nlc3MgPT4ge1xuICAgICAgICBjb250ZXh0Lm9uQ2hhbmdlQVBJS2V5KClcbiAgICAgICAgLy8gU2lnbmF0dXJlLWJlYXJpbmcgYmxvY2tzICh0aGlua2luZywgY29ubmVjdG9yX3RleHQpIGFyZSBib3VuZCB0byB0aGUgQVBJIGtleSDigJRcbiAgICAgICAgLy8gc3RyaXAgdGhlbSBzbyB0aGUgbmV3IGtleSBkb2Vzbid0IHJlamVjdCBzdGFsZSBzaWduYXR1cmVzLlxuICAgICAgICBjb250ZXh0LnNldE1lc3NhZ2VzKHN0cmlwU2lnbmF0dXJlQmxvY2tzKVxuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgIC8vIFBvc3QtbG9naW4gcmVmcmVzaCBsb2dpYy4gS2VlcCBpbiBzeW5jIHdpdGggb25ib2FyZGluZyBpbiBzcmMvaW50ZXJhY3RpdmVIZWxwZXJzLnRzeFxuICAgICAgICAgIC8vIFJlc2V0IGNvc3Qgc3RhdGUgd2hlbiBzd2l0Y2hpbmcgYWNjb3VudHNcbiAgICAgICAgICByZXNldENvc3RTdGF0ZSgpXG4gICAgICAgICAgLy8gUmVmcmVzaCByZW1vdGVseSBtYW5hZ2VkIHNldHRpbmdzIGFmdGVyIGxvZ2luIChub24tYmxvY2tpbmcpXG4gICAgICAgICAgdm9pZCByZWZyZXNoUmVtb3RlTWFuYWdlZFNldHRpbmdzKClcbiAgICAgICAgICAvLyBSZWZyZXNoIHBvbGljeSBsaW1pdHMgYWZ0ZXIgbG9naW4gKG5vbi1ibG9ja2luZylcbiAgICAgICAgICB2b2lkIHJlZnJlc2hQb2xpY3lMaW1pdHMoKVxuICAgICAgICAgIC8vIENsZWFyIHVzZXIgZGF0YSBjYWNoZSBCRUZPUkUgR3Jvd3RoQm9vayByZWZyZXNoIHNvIGl0IHBpY2tzIHVwIGZyZXNoIGNyZWRlbnRpYWxzXG4gICAgICAgICAgcmVzZXRVc2VyQ2FjaGUoKVxuICAgICAgICAgIC8vIFJlZnJlc2ggR3Jvd3RoQm9vayBhZnRlciBsb2dpbiB0byBnZXQgdXBkYXRlZCBmZWF0dXJlIGZsYWdzIChlLmcuLCBmb3IgY2xhdWRlLmFpIE1DUHMpXG4gICAgICAgICAgcmVmcmVzaEdyb3d0aEJvb2tBZnRlckF1dGhDaGFuZ2UoKVxuICAgICAgICAgIC8vIENsZWFyIGFueSBzdGFsZSB0cnVzdGVkIGRldmljZSB0b2tlbiBmcm9tIGEgcHJldmlvdXMgYWNjb3VudCBiZWZvcmVcbiAgICAgICAgICAvLyByZS1lbnJvbGxpbmcg4oCUIHByZXZlbnRzIHNlbmRpbmcgdGhlIG9sZCB0b2tlbiBvbiBicmlkZ2UgY2FsbHMgd2hpbGVcbiAgICAgICAgICAvLyB0aGUgYXN5bmMgZW5yb2xsVHJ1c3RlZERldmljZSgpIGlzIGluLWZsaWdodC5cbiAgICAgICAgICBjbGVhclRydXN0ZWREZXZpY2VUb2tlbigpXG4gICAgICAgICAgLy8gRW5yb2xsIGFzIGEgdHJ1c3RlZCBkZXZpY2UgZm9yIFJlbW90ZSBDb250cm9sICgxMC1taW4gZnJlc2gtc2Vzc2lvbiB3aW5kb3cpXG4gICAgICAgICAgdm9pZCBlbnJvbGxUcnVzdGVkRGV2aWNlKClcbiAgICAgICAgICAvLyBSZXNldCBraWxsc3dpdGNoIGdhdGUgY2hlY2tzIGFuZCByZS1ydW4gd2l0aCBuZXcgb3JnXG4gICAgICAgICAgcmVzZXRCeXBhc3NQZXJtaXNzaW9uc0NoZWNrKClcbiAgICAgICAgICBjb25zdCBhcHBTdGF0ZSA9IGNvbnRleHQuZ2V0QXBwU3RhdGUoKVxuICAgICAgICAgIHZvaWQgY2hlY2tBbmREaXNhYmxlQnlwYXNzUGVybWlzc2lvbnNJZk5lZWRlZChcbiAgICAgICAgICAgIGFwcFN0YXRlLnRvb2xQZXJtaXNzaW9uQ29udGV4dCxcbiAgICAgICAgICAgIGNvbnRleHQuc2V0QXBwU3RhdGUsXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmIChmZWF0dXJlKCdUUkFOU0NSSVBUX0NMQVNTSUZJRVInKSkge1xuICAgICAgICAgICAgcmVzZXRBdXRvTW9kZUdhdGVDaGVjaygpXG4gICAgICAgICAgICB2b2lkIGNoZWNrQW5kRGlzYWJsZUF1dG9Nb2RlSWZOZWVkZWQoXG4gICAgICAgICAgICAgIGFwcFN0YXRlLnRvb2xQZXJtaXNzaW9uQ29udGV4dCxcbiAgICAgICAgICAgICAgY29udGV4dC5zZXRBcHBTdGF0ZSxcbiAgICAgICAgICAgICAgYXBwU3RhdGUuZmFzdE1vZGUsXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEluY3JlbWVudCBhdXRoVmVyc2lvbiB0byB0cmlnZ2VyIHJlLWZldGNoaW5nIG9mIGF1dGgtZGVwZW5kZW50IGRhdGEgaW4gaG9va3MgKGUuZy4sIE1DUCBzZXJ2ZXJzKVxuICAgICAgICAgIGNvbnRleHQuc2V0QXBwU3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGF1dGhWZXJzaW9uOiBwcmV2LmF1dGhWZXJzaW9uICsgMSxcbiAgICAgICAgICB9KSlcbiAgICAgICAgfVxuICAgICAgICBvbkRvbmUoc3VjY2VzcyA/ICdMb2dpbiBzdWNjZXNzZnVsJyA6ICdMb2dpbiBpbnRlcnJ1cHRlZCcpXG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIExvZ2luKHByb3BzOiB7XG4gIG9uRG9uZTogKHN1Y2Nlc3M6IGJvb2xlYW4sIG1haW5Mb29wTW9kZWw6IHN0cmluZykgPT4gdm9pZFxuICBzdGFydGluZ01lc3NhZ2U/OiBzdHJpbmdcbn0pOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBtYWluTG9vcE1vZGVsID0gdXNlTWFpbkxvb3BNb2RlbCgpXG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nXG4gICAgICB0aXRsZT1cIkxvZ2luXCJcbiAgICAgIG9uQ2FuY2VsPXsoKSA9PiBwcm9wcy5vbkRvbmUoZmFsc2UsIG1haW5Mb29wTW9kZWwpfVxuICAgICAgY29sb3I9XCJwZXJtaXNzaW9uXCJcbiAgICAgIGlucHV0R3VpZGU9e2V4aXRTdGF0ZSA9PlxuICAgICAgICBleGl0U3RhdGUucGVuZGluZyA/IChcbiAgICAgICAgICA8VGV4dD5QcmVzcyB7ZXhpdFN0YXRlLmtleU5hbWV9IGFnYWluIHRvIGV4aXQ8L1RleHQ+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludFxuICAgICAgICAgICAgYWN0aW9uPVwiY29uZmlybTpub1wiXG4gICAgICAgICAgICBjb250ZXh0PVwiQ29uZmlybWF0aW9uXCJcbiAgICAgICAgICAgIGZhbGxiYWNrPVwiRXNjXCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiY2FuY2VsXCJcbiAgICAgICAgICAvPlxuICAgICAgICApXG4gICAgICB9XG4gICAgPlxuICAgICAgPENvbnNvbGVPQXV0aEZsb3dcbiAgICAgICAgb25Eb25lPXsoKSA9PiBwcm9wcy5vbkRvbmUodHJ1ZSwgbWFpbkxvb3BNb2RlbCl9XG4gICAgICAgIHN0YXJ0aW5nTWVzc2FnZT17cHJvcHMu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
