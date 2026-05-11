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
exports.LogEventNotificationSchema = void 0;
exports.notifyVscodeFileUpdated = notifyVscodeFileUpdated;
exports.setupVscodeSdkMcp = setupVscodeSdkMcp;
var debug_js_1 = require("src/utils/debug.js");
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var index_js_1 = require("../analytics/index.js");
function readAutoModeEnabledState() {
    var _a;
    var v = (_a = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_auto_mode_config', {})) === null || _a === void 0 ? void 0 : _a.enabled;
    return v === 'enabled' || v === 'disabled' || v === 'opt-in' ? v : undefined;
}
exports.LogEventNotificationSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        method: v4_1.z.literal('log_event'),
        params: v4_1.z.object({
            eventName: v4_1.z.string(),
            eventData: v4_1.z.object({}).passthrough(),
        }),
    });
});
// Store the VSCode MCP client reference for sending notifications
var vscodeMcpClient = null;
/**
 * Sends a file_updated notification to the VSCode MCP server. This is used to
 * notify VSCode when files are edited or written by Claude.
 */
function notifyVscodeFileUpdated(filePath, oldContent, newContent) {
    if (process.env.USER_TYPE !== 'ant' || !vscodeMcpClient) {
        return;
    }
    void vscodeMcpClient.client
        .notification({
        method: 'file_updated',
        params: { filePath: filePath, oldContent: oldContent, newContent: newContent },
    })
        .catch(function (error) {
        // Do not throw if the notification failed
        (0, debug_js_1.logForDebugging)("[VSCode] Failed to send file_updated notification: ".concat(error.message));
    });
}
/**
 * Sets up the speicial internal VSCode MCP for bidirectional communication using notifications.
 */
function setupVscodeSdkMcp(sdkClients) {
    var _this = this;
    var client = sdkClients.find(function (client) { return client.name === 'claude-vscode'; });
    if (client && client.type === 'connected') {
        // Store the client reference for later use
        vscodeMcpClient = client;
        client.client.setNotificationHandler((0, exports.LogEventNotificationSchema)(), function (notification) { return __awaiter(_this, void 0, void 0, function () {
            var _a, eventName, eventData;
            return __generator(this, function (_b) {
                _a = notification.params, eventName = _a.eventName, eventData = _a.eventData;
                (0, index_js_1.logEvent)("tengu_vscode_".concat(eventName), eventData);
                return [2 /*return*/];
            });
        }); });
        // Send necessary experiment gates to VSCode immediately.
        var gates = {
            tengu_vscode_review_upsell: (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_vscode_review_upsell'),
            tengu_vscode_onboarding: (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_vscode_onboarding'),
            // Browser support.
            tengu_quiet_fern: (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_quiet_fern', false),
            // In-band OAuth via claude_authenticate (vs. extension-native PKCE).
            tengu_vscode_cc_auth: (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_vscode_cc_auth', false),
        };
        // Tri-state: 'enabled' | 'disabled' | 'opt-in'. Omit if unknown so VSCode
        // fails closed (treats absent as 'disabled').
        var autoModeState = readAutoModeEnabledState();
        if (autoModeState !== undefined) {
            gates.tengu_auto_mode_state = autoModeState;
        }
        void client.client.notification({
            method: 'experiment_gates',
            params: { gates: gates },
        });
    }
}
