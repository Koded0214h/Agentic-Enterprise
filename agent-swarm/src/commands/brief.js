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
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var state_js_1 = require("../bootstrap/state.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var index_js_1 = require("../services/analytics/index.js");
var BriefTool_js_1 = require("../tools/BriefTool/BriefTool.js");
var prompt_js_1 = require("../tools/BriefTool/prompt.js");
var lazySchema_js_1 = require("../utils/lazySchema.js");
// Zod guards against fat-fingered GB pushes (same pattern as pollConfig.ts /
// cronScheduler.ts). A malformed config falls back to DEFAULT_BRIEF_CONFIG
// entirely rather than being partially trusted.
var briefConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        enable_slash_command: v4_1.z.boolean(),
    });
});
var DEFAULT_BRIEF_CONFIG = {
    enable_slash_command: false,
};
// No TTL — this gate controls slash-command *visibility*, not a kill switch.
// CACHED_MAY_BE_STALE still has one background-update flip (first call kicks
// off fetch; second call sees fresh value), but no additional flips after that.
// The tool-availability gate (tengu_kairos_brief in isBriefEnabled) keeps its
// 5-min TTL because that one IS a kill switch.
function getBriefConfig() {
    var raw = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_kairos_brief_config', DEFAULT_BRIEF_CONFIG);
    var parsed = briefConfigSchema().safeParse(raw);
    return parsed.success ? parsed.data : DEFAULT_BRIEF_CONFIG;
}
var brief = {
    type: 'local-jsx',
    name: 'brief',
    description: 'Toggle brief-only mode',
    isEnabled: function () {
        if ((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')) {
            return getBriefConfig().enable_slash_command;
        }
        return false;
    },
    immediate: true,
    load: function () {
        return Promise.resolve({
            call: function (onDone, context) {
                return __awaiter(this, void 0, void 0, function () {
                    var current, newState, metaMessages;
                    return __generator(this, function (_a) {
                        current = context.getAppState().isBriefOnly;
                        newState = !current;
                        // Entitlement check only gates the on-transition — off is always
                        // allowed so a user whose GB gate flipped mid-session isn't stuck.
                        if (newState && !(0, BriefTool_js_1.isBriefEntitled)()) {
                            (0, index_js_1.logEvent)('tengu_brief_mode_toggled', {
                                enabled: false,
                                gated: true,
                                source: 'slash_command',
                            });
                            onDone('Brief tool is not enabled for your account', {
                                display: 'system',
                            });
                            return [2 /*return*/, null];
                        }
                        // Two-way: userMsgOptIn tracks isBriefOnly so the tool is available
                        // exactly when brief mode is on. This invalidates prompt cache on
                        // each toggle (tool list changes), but a stale tool list is worse —
                        // when /brief is enabled mid-session the model was previously left
                        // without the tool, emitting plain text the filter hides.
                        (0, state_js_1.setUserMsgOptIn)(newState);
                        context.setAppState(function (prev) {
                            if (prev.isBriefOnly === newState)
                                return prev;
                            return __assign(__assign({}, prev), { isBriefOnly: newState });
                        });
                        (0, index_js_1.logEvent)('tengu_brief_mode_toggled', {
                            enabled: newState,
                            gated: false,
                            source: 'slash_command',
                        });
                        metaMessages = (0, state_js_1.getKairosActive)()
                            ? undefined
                            : [
                                "<system-reminder>\n".concat(newState
                                    ? "Brief mode is now enabled. Use the ".concat(prompt_js_1.BRIEF_TOOL_NAME, " tool for all user-facing output \u2014 plain text outside it is hidden from the user's view.")
                                    : "Brief mode is now disabled. The ".concat(prompt_js_1.BRIEF_TOOL_NAME, " tool is no longer available \u2014 reply with plain text."), "\n</system-reminder>"),
                            ];
                        onDone(newState ? 'Brief-only mode enabled' : 'Brief-only mode disabled', { display: 'system', metaMessages: metaMessages });
                        return [2 /*return*/, null];
                    });
                });
            },
        });
    },
};
exports.default = brief;
