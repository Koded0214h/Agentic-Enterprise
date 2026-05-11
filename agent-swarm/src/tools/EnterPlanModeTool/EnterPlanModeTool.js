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
exports.EnterPlanModeTool = void 0;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var Tool_js_1 = require("../../Tool.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var PermissionUpdate_js_1 = require("../../utils/permissions/PermissionUpdate.js");
var permissionSetup_js_1 = require("../../utils/permissions/permissionSetup.js");
var planModeV2_js_1 = require("../../utils/planModeV2.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
    // No parameters needed
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        message: v4_1.z.string().describe('Confirmation that plan mode was entered'),
    });
});
exports.EnterPlanModeTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.ENTER_PLAN_MODE_TOOL_NAME,
    searchHint: 'switch to plan mode to design an approach before coding',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Requests permission to enter plan mode for complex tasks requiring exploration and design'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getEnterPlanModeToolPrompt)()];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    userFacingName: function () {
        return '';
    },
    shouldDefer: true,
    isEnabled: function () {
        // When --channels is active, ExitPlanMode is disabled (its approval
        // dialog needs the terminal). Disable entry too so plan mode isn't a
        // trap the model can enter but never leave.
        if (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) &&
            (0, state_js_1.getAllowedChannels)().length > 0) {
            return false;
        }
        return true;
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    renderToolUseRejectedMessage: UI_js_1.renderToolUseRejectedMessage,
    call: function (_input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                if (context.agentId) {
                    throw new Error('EnterPlanMode tool cannot be used in agent contexts');
                }
                appState = context.getAppState();
                (0, state_js_1.handlePlanModeTransition)(appState.toolPermissionContext.mode, 'plan');
                // Update the permission mode to 'plan'. prepareContextForPlanMode runs
                // the classifier activation side effects when the user's defaultMode is
                // 'auto' — see permissionSetup.ts for the full lifecycle.
                context.setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: (0, PermissionUpdate_js_1.applyPermissionUpdate)((0, permissionSetup_js_1.prepareContextForPlanMode)(prev.toolPermissionContext), { type: 'setMode', mode: 'plan', destination: 'session' }) })); });
                return [2 /*return*/, {
                        data: {
                            message: 'Entered plan mode. You should now focus on exploring the codebase and designing an implementation approach.',
                        },
                    }];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var message = _a.message;
        var instructions = (0, planModeV2_js_1.isPlanModeInterviewPhaseEnabled)()
            ? "".concat(message, "\n\nDO NOT write or edit any files except the plan file. Detailed workflow instructions will follow.")
            : "".concat(message, "\n\nIn plan mode, you should:\n1. Thoroughly explore the codebase to understand existing patterns\n2. Identify similar features and architectural approaches\n3. Consider multiple approaches and their trade-offs\n4. Use AskUserQuestion if you need to clarify the approach\n5. Design a concrete implementation strategy\n6. When ready, use ExitPlanMode to present your plan for approval\n\nRemember: DO NOT write or edit any files yet. This is a read-only exploration and planning phase.");
        return {
            type: 'tool_result',
            content: instructions,
            tool_use_id: toolUseID,
        };
    },
});
