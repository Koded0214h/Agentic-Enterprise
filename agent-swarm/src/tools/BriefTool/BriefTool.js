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
exports.BriefTool = void 0;
exports.isBriefEntitled = isBriefEntitled;
exports.isBriefEnabled = isBriefEnabled;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var attachments_js_1 = require("./attachments.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        message: v4_1.z
            .string()
            .describe('The message for the user. Supports markdown formatting.'),
        attachments: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Optional file paths (absolute or relative to cwd) to attach. Use for photos, screenshots, diffs, logs, or any file the user should see alongside your message.'),
        status: v4_1.z
            .enum(['normal', 'proactive'])
            .describe("Use 'proactive' when you're surfacing something the user hasn't asked for and needs to see now — task completion while they're away, a blocker you hit, an unsolicited status update. Use 'normal' when replying to something the user just said."),
    });
});
// attachments MUST remain optional — resumed sessions replay pre-attachment
// outputs verbatim and a required field would crash the UI renderer on resume.
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        message: v4_1.z.string().describe('The message'),
        attachments: v4_1.z
            .array(v4_1.z.object({
            path: v4_1.z.string(),
            size: v4_1.z.number(),
            isImage: v4_1.z.boolean(),
            file_uuid: v4_1.z.string().optional(),
        }))
            .optional()
            .describe('Resolved attachment metadata'),
        sentAt: v4_1.z
            .string()
            .optional()
            .describe('ISO timestamp captured at tool execution on the emitting process. Optional — resumed sessions replay pre-sentAt outputs verbatim.'),
    });
});
var KAIROS_BRIEF_REFRESH_MS = 5 * 60 * 1000;
/**
 * Entitlement check — is the user ALLOWED to use Brief? Combines build-time
 * flags with runtime GB gate + assistant-mode passthrough. No opt-in check
 * here — this decides whether opt-in should be HONORED, not whether the user
 * has opted in.
 *
 * Build-time OR-gated on KAIROS || KAIROS_BRIEF (same pattern as
 * PROACTIVE || KAIROS): assistant mode depends on Brief, so KAIROS alone
 * must bundle it. KAIROS_BRIEF lets Brief ship independently.
 *
 * Use this to decide whether `--brief` / `defaultView: 'chat'` / `--tools`
 * listing should be honored. Use `isBriefEnabled()` to decide whether the
 * tool is actually active in the current session.
 *
 * CLAUDE_CODE_BRIEF env var force-grants entitlement for dev/testing —
 * bypasses the GB gate so you can test without being enrolled. Still
 * requires an opt-in action to activate (--brief, defaultView, etc.), but
 * the env var alone also sets userMsgOptIn via maybeActivateBrief().
 */
function isBriefEntitled() {
    // Positive ternary — see docs/feature-gating.md. Negative early-return
    // would not eliminate the GB gate string from external builds.
    return (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
        ? (0, state_js_1.getKairosActive)() ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_BRIEF) ||
            (0, growthbook_js_1.getFeatureValue_CACHED_WITH_REFRESH)('tengu_kairos_brief', false, KAIROS_BRIEF_REFRESH_MS)
        : false;
}
/**
 * Unified activation gate for the Brief tool. Governs model-facing behavior
 * as a unit: tool availability, system prompt section (getBriefSection),
 * tool-deferral bypass (isDeferredTool), and todo-nag suppression.
 *
 * Activation requires explicit opt-in (userMsgOptIn) set by one of:
 *   - `--brief` CLI flag (maybeActivateBrief in main.tsx)
 *   - `defaultView: 'chat'` in settings (main.tsx init)
 *   - `/brief` slash command (brief.ts)
 *   - `/config` defaultView picker (Config.tsx)
 *   - SendUserMessage in `--tools` / SDK `tools` option (main.tsx)
 *   - CLAUDE_CODE_BRIEF env var (maybeActivateBrief — dev/testing bypass)
 * Assistant mode (kairosActive) bypasses opt-in since its system prompt
 * hard-codes "you MUST use SendUserMessage" (systemPrompt.md:14).
 *
 * The GB gate is re-checked here as a kill-switch AND — flipping
 * tengu_kairos_brief off mid-session disables the tool on the next 5-min
 * refresh even for opted-in sessions. No opt-in → always false regardless
 * of GB (this is the fix for "brief defaults on for enrolled ants").
 *
 * Called from Tool.isEnabled() (lazy, post-init), never at module scope.
 * getKairosActive() and getUserMsgOptIn() are set in main.tsx before any
 * caller reaches here.
 */
function isBriefEnabled() {
    // Top-level feature() guard is load-bearing for DCE: Bun can constant-fold
    // the ternary to `false` in external builds and then dead-code the BriefTool
    // object. Composing isBriefEntitled() alone (which has its own guard) is
    // semantically equivalent but defeats constant-folding across the boundary.
    return (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
        ? ((0, state_js_1.getKairosActive)() || (0, state_js_1.getUserMsgOptIn)()) && isBriefEntitled()
        : false;
}
exports.BriefTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.BRIEF_TOOL_NAME,
    aliases: [prompt_js_1.LEGACY_BRIEF_TOOL_NAME],
    searchHint: 'send a message to the user — your primary visible output channel',
    maxResultSizeChars: 100000,
    userFacingName: function () {
        return '';
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    isEnabled: function () {
        return isBriefEnabled();
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        return input.message;
    },
    validateInput: function (_a, _context_1) {
        return __awaiter(this, arguments, void 0, function (_b, _context) {
            var attachments = _b.attachments;
            return __generator(this, function (_c) {
                if (!attachments || attachments.length === 0) {
                    return [2 /*return*/, { result: true }];
                }
                return [2 /*return*/, (0, attachments_js_1.validateAttachmentPaths)(attachments)];
            });
        });
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.BRIEF_TOOL_PROMPT];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        var _a, _b;
        var n = (_b = (_a = output.attachments) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        var suffix = n === 0 ? '' : " (".concat(n, " ").concat((0, stringUtils_js_1.plural)(n, 'attachment'), " included)");
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: "Message delivered to user.".concat(suffix),
        };
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    call: function (_a, context_1) {
        return __awaiter(this, arguments, void 0, function (_b, context) {
            var sentAt, appState, resolved;
            var _c;
            var message = _b.message, attachments = _b.attachments, status = _b.status;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        sentAt = new Date().toISOString();
                        (0, index_js_1.logEvent)('tengu_brief_send', {
                            proactive: status === 'proactive',
                            attachment_count: (_c = attachments === null || attachments === void 0 ? void 0 : attachments.length) !== null && _c !== void 0 ? _c : 0,
                        });
                        if (!attachments || attachments.length === 0) {
                            return [2 /*return*/, { data: { message: message, sentAt: sentAt } }];
                        }
                        appState = context.getAppState();
                        return [4 /*yield*/, (0, attachments_js_1.resolveAttachments)(attachments, {
                                replBridgeEnabled: appState.replBridgeEnabled,
                                signal: context.abortController.signal,
                            })];
                    case 1:
                        resolved = _d.sent();
                        return [2 /*return*/, {
                                data: { message: message, attachments: resolved, sentAt: sentAt },
                            }];
                }
            });
        });
    },
});
