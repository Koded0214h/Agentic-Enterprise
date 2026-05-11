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
exports.hookResponseSchema = void 0;
exports.addArgumentsToPrompt = addArgumentsToPrompt;
exports.createStructuredOutputTool = createStructuredOutputTool;
exports.registerStructuredOutputEnforcement = registerStructuredOutputEnforcement;
var v4_1 = require("zod/v4");
var SyntheticOutputTool_js_1 = require("../../tools/SyntheticOutputTool/SyntheticOutputTool.js");
var argumentSubstitution_js_1 = require("../argumentSubstitution.js");
var lazySchema_js_1 = require("../lazySchema.js");
var messages_js_1 = require("../messages.js");
var sessionHooks_js_1 = require("./sessionHooks.js");
/**
 * Schema for hook responses (shared by prompt and agent hooks)
 */
exports.hookResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        ok: v4_1.z.boolean().describe('Whether the condition was met'),
        reason: v4_1.z
            .string()
            .describe('Reason, if the condition was not met')
            .optional(),
    });
});
/**
 * Add hook input JSON to prompt, either replacing $ARGUMENTS placeholder or appending.
 * Also supports indexed arguments like $ARGUMENTS[0], $ARGUMENTS[1], or shorthand $0, $1, etc.
 */
function addArgumentsToPrompt(prompt, jsonInput) {
    return (0, argumentSubstitution_js_1.substituteArguments)(prompt, jsonInput);
}
/**
 * Create a StructuredOutput tool configured for hook responses.
 * Reusable by agent hooks and background verification.
 */
function createStructuredOutputTool() {
    return __assign(__assign({}, SyntheticOutputTool_js_1.SyntheticOutputTool), { inputSchema: (0, exports.hookResponseSchema)(), inputJSONSchema: {
            type: 'object',
            properties: {
                ok: {
                    type: 'boolean',
                    description: 'Whether the condition was met',
                },
                reason: {
                    type: 'string',
                    description: 'Reason, if the condition was not met',
                },
            },
            required: ['ok'],
            additionalProperties: false,
        }, prompt: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, "Use this tool to return your verification result. You MUST call this tool exactly once at the end of your response."];
                });
            });
        } });
}
/**
 * Register a function hook that enforces structured output via SyntheticOutputTool.
 * Used by ask.tsx, execAgentHook.ts, and background verification.
 */
function registerStructuredOutputEnforcement(setAppState, sessionId) {
    (0, sessionHooks_js_1.addFunctionHook)(setAppState, sessionId, 'Stop', '', // No matcher - applies to all stops
    function (// No matcher - applies to all stops
    messages) { return (0, messages_js_1.hasSuccessfulToolCall)(messages, SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME); }, "You MUST call the ".concat(SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME, " tool to complete this request. Call this tool now."), { timeout: 5000 });
}
