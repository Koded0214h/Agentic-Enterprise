"use strict";
/**
 * Shared helpers for building the API cache-key prefix (systemPrompt,
 * userContext, systemContext) for query() calls.
 *
 * Lives in its own file because it imports from context.ts and
 * constants/prompts.ts, which are high in the dependency graph. Putting
 * these imports in systemPrompt.ts or sideQuestion.ts (both reachable
 * from commands.ts) would create cycles. Only entrypoint-layer files
 * import from here (QueryEngine.ts, cli/print.ts).
 */
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
exports.fetchSystemPromptParts = fetchSystemPromptParts;
exports.buildSideQuestionFallbackParams = buildSideQuestionFallbackParams;
var prompts_js_1 = require("../constants/prompts.js");
var context_js_1 = require("../context.js");
var abortController_js_1 = require("./abortController.js");
var model_js_1 = require("./model/model.js");
var systemPromptType_js_1 = require("./systemPromptType.js");
var thinking_js_1 = require("./thinking.js");
/**
 * Fetch the three context pieces that form the API cache-key prefix:
 * systemPrompt parts, userContext, systemContext.
 *
 * When customSystemPrompt is set, the default getSystemPrompt build and
 * getSystemContext are skipped — the custom prompt replaces the default
 * entirely, and systemContext would be appended to a default that isn't
 * being used.
 *
 * Callers assemble the final systemPrompt from defaultSystemPrompt (or
 * customSystemPrompt) + optional extras + appendSystemPrompt. QueryEngine
 * injects coordinator userContext and memory-mechanics prompt on top;
 * sideQuestion's fallback uses the base result directly.
 */
function fetchSystemPromptParts(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var _c, defaultSystemPrompt, userContext, systemContext;
        var tools = _b.tools, mainLoopModel = _b.mainLoopModel, additionalWorkingDirectories = _b.additionalWorkingDirectories, mcpClients = _b.mcpClients, customSystemPrompt = _b.customSystemPrompt;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        customSystemPrompt !== undefined
                            ? Promise.resolve([])
                            : (0, prompts_js_1.getSystemPrompt)(tools, mainLoopModel, additionalWorkingDirectories, mcpClients),
                        (0, context_js_1.getUserContext)(),
                        customSystemPrompt !== undefined ? Promise.resolve({}) : (0, context_js_1.getSystemContext)(),
                    ])];
                case 1:
                    _c = _d.sent(), defaultSystemPrompt = _c[0], userContext = _c[1], systemContext = _c[2];
                    return [2 /*return*/, { defaultSystemPrompt: defaultSystemPrompt, userContext: userContext, systemContext: systemContext }];
            }
        });
    });
}
/**
 * Build CacheSafeParams from raw inputs when getLastCacheSafeParams() is null.
 *
 * Used by the SDK side_question handler (print.ts) on resume before a turn
 * completes — there's no stopHooks snapshot yet. Mirrors the system prompt
 * assembly in QueryEngine.ts:ask() so the rebuilt prefix matches what the
 * main loop will send, preserving the cache hit in the common case.
 *
 * May still miss the cache if the main loop applies extras this path doesn't
 * know about (coordinator mode, memory-mechanics prompt). That's acceptable —
 * the alternative is returning null and failing the side question entirely.
 */
function buildSideQuestionFallbackParams(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var mainLoopModel, appState, _c, defaultSystemPrompt, userContext, systemContext, systemPrompt, last, forkContextMessages, toolUseContext;
        var tools = _b.tools, commands = _b.commands, mcpClients = _b.mcpClients, messages = _b.messages, readFileState = _b.readFileState, getAppState = _b.getAppState, setAppState = _b.setAppState, customSystemPrompt = _b.customSystemPrompt, appendSystemPrompt = _b.appendSystemPrompt, thinkingConfig = _b.thinkingConfig, agents = _b.agents;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    mainLoopModel = (0, model_js_1.getMainLoopModel)();
                    appState = getAppState();
                    return [4 /*yield*/, fetchSystemPromptParts({
                            tools: tools,
                            mainLoopModel: mainLoopModel,
                            additionalWorkingDirectories: Array.from(appState.toolPermissionContext.additionalWorkingDirectories.keys()),
                            mcpClients: mcpClients,
                            customSystemPrompt: customSystemPrompt,
                        })];
                case 1:
                    _c = _d.sent(), defaultSystemPrompt = _c.defaultSystemPrompt, userContext = _c.userContext, systemContext = _c.systemContext;
                    systemPrompt = (0, systemPromptType_js_1.asSystemPrompt)(__spreadArray(__spreadArray([], (customSystemPrompt !== undefined
                        ? [customSystemPrompt]
                        : defaultSystemPrompt), true), (appendSystemPrompt ? [appendSystemPrompt] : []), true));
                    last = messages.at(-1);
                    forkContextMessages = (last === null || last === void 0 ? void 0 : last.type) === 'assistant' && last.message.stop_reason === null
                        ? messages.slice(0, -1)
                        : messages;
                    toolUseContext = {
                        options: {
                            commands: commands,
                            debug: false,
                            mainLoopModel: mainLoopModel,
                            tools: tools,
                            verbose: false,
                            thinkingConfig: thinkingConfig !== null && thinkingConfig !== void 0 ? thinkingConfig : ((0, thinking_js_1.shouldEnableThinkingByDefault)() !== false
                                ? { type: 'adaptive' }
                                : { type: 'disabled' }),
                            mcpClients: mcpClients,
                            mcpResources: {},
                            isNonInteractiveSession: true,
                            agentDefinitions: { activeAgents: agents, allAgents: [] },
                            customSystemPrompt: customSystemPrompt,
                            appendSystemPrompt: appendSystemPrompt,
                        },
                        abortController: (0, abortController_js_1.createAbortController)(),
                        readFileState: readFileState,
                        getAppState: getAppState,
                        setAppState: setAppState,
                        messages: forkContextMessages,
                        setInProgressToolUseIDs: function () { },
                        setResponseLength: function () { },
                        updateFileHistoryState: function () { },
                        updateAttributionState: function () { },
                    };
                    return [2 /*return*/, {
                            systemPrompt: systemPrompt,
                            userContext: userContext,
                            systemContext: systemContext,
                            toolUseContext: toolUseContext,
                            forkContextMessages: forkContextMessages,
                        }];
            }
        });
    });
}
