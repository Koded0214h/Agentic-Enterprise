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
exports.checkAndDisableBypassPermissionsIfNeeded = checkAndDisableBypassPermissionsIfNeeded;
exports.resetBypassPermissionsCheck = resetBypassPermissionsCheck;
exports.useKickOffCheckAndDisableBypassPermissionsIfNeeded = useKickOffCheckAndDisableBypassPermissionsIfNeeded;
exports.checkAndDisableAutoModeIfNeeded = checkAndDisableAutoModeIfNeeded;
exports.resetAutoModeGateCheck = resetAutoModeGateCheck;
exports.useKickOffCheckAndDisableAutoModeIfNeeded = useKickOffCheckAndDisableAutoModeIfNeeded;
var bun_bundle_1 = require("bun:bundle");
var react_1 = require("react");
var AppState_js_1 = require("src/state/AppState.js");
var state_js_1 = require("../../bootstrap/state.js");
var permissionSetup_js_1 = require("./permissionSetup.js");
var bypassPermissionsCheckRan = false;
function checkAndDisableBypassPermissionsIfNeeded(toolPermissionContext, setAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var shouldDisable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check if bypassPermissions should be disabled based on Statsig gate
                    // Do this only once, before the first query, to ensure we have the latest gate value
                    if (bypassPermissionsCheckRan) {
                        return [2 /*return*/];
                    }
                    bypassPermissionsCheckRan = true;
                    if (!toolPermissionContext.isBypassPermissionsModeAvailable) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, permissionSetup_js_1.shouldDisableBypassPermissions)()];
                case 1:
                    shouldDisable = _a.sent();
                    if (!shouldDisable) {
                        return [2 /*return*/];
                    }
                    setAppState(function (prev) {
                        return __assign(__assign({}, prev), { toolPermissionContext: (0, permissionSetup_js_1.createDisabledBypassPermissionsContext)(prev.toolPermissionContext) });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Reset the run-once flag for checkAndDisableBypassPermissionsIfNeeded.
 * Call this after /login so the gate check re-runs with the new org.
 */
function resetBypassPermissionsCheck() {
    bypassPermissionsCheckRan = false;
}
function useKickOffCheckAndDisableBypassPermissionsIfNeeded() {
    var toolPermissionContext = (0, AppState_js_1.useAppState)(function (s) { return s.toolPermissionContext; });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    // Run once, when the component mounts
    (0, react_1.useEffect)(function () {
        if ((0, state_js_1.getIsRemoteMode)())
            return;
        void checkAndDisableBypassPermissionsIfNeeded(toolPermissionContext, setAppState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
var autoModeCheckRan = false;
function checkAndDisableAutoModeIfNeeded(toolPermissionContext, setAppState, fastMode) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, updateContext_1, notification_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) return [3 /*break*/, 2];
                    if (autoModeCheckRan) {
                        return [2 /*return*/];
                    }
                    autoModeCheckRan = true;
                    return [4 /*yield*/, (0, permissionSetup_js_1.verifyAutoModeGateAccess)(toolPermissionContext, fastMode)];
                case 1:
                    _a = _b.sent(), updateContext_1 = _a.updateContext, notification_1 = _a.notification;
                    setAppState(function (prev) {
                        // Apply the transform to CURRENT context, not the stale snapshot we
                        // passed to verifyAutoModeGateAccess. The async GrowthBook await inside
                        // can be outrun by a mid-turn shift-tab; spreading a stale context here
                        // would revert the user's mode change.
                        var nextCtx = updateContext_1(prev.toolPermissionContext);
                        var newState = nextCtx === prev.toolPermissionContext
                            ? prev
                            : __assign(__assign({}, prev), { toolPermissionContext: nextCtx });
                        if (!notification_1)
                            return newState;
                        return __assign(__assign({}, newState), { notifications: __assign(__assign({}, newState.notifications), { queue: __spreadArray(__spreadArray([], newState.notifications.queue, true), [
                                    {
                                        key: 'auto-mode-gate-notification',
                                        text: notification_1,
                                        color: 'warning',
                                        priority: 'high',
                                    },
                                ], false) }) });
                    });
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Reset the run-once flag for checkAndDisableAutoModeIfNeeded.
 * Call this after /login so the gate check re-runs with the new org.
 */
function resetAutoModeGateCheck() {
    autoModeCheckRan = false;
}
function useKickOffCheckAndDisableAutoModeIfNeeded() {
    var mainLoopModel = (0, AppState_js_1.useAppState)(function (s) { return s.mainLoopModel; });
    var mainLoopModelForSession = (0, AppState_js_1.useAppState)(function (s) { return s.mainLoopModelForSession; });
    var fastMode = (0, AppState_js_1.useAppState)(function (s) { return s.fastMode; });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var store = (0, AppState_js_1.useAppStateStore)();
    var isFirstRunRef = (0, react_1.useRef)(true);
    // Runs on mount (startup check) AND whenever the model or fast mode changes
    // (kick-out / carousel-restore). Watching both model fields covers /model,
    // Cmd+P picker, /config, and bridge onSetModel paths; fastMode covers
    // /fast on|off for the tengu_auto_mode_config.disableFastMode circuit
    // breaker. The print.ts headless paths are covered by the sync
    // isAutoModeGateEnabled() check.
    (0, react_1.useEffect)(function () {
        if ((0, state_js_1.getIsRemoteMode)())
            return;
        if (isFirstRunRef.current) {
            isFirstRunRef.current = false;
        }
        else {
            resetAutoModeGateCheck();
        }
        void checkAndDisableAutoModeIfNeeded(store.getState().toolPermissionContext, setAppState, fastMode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainLoopModel, mainLoopModelForSession, fastMode]);
}
