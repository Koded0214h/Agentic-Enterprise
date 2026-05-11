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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryEngine = void 0;
exports.ask = ask;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var last_js_1 = require("lodash-es/last.js");
var state_js_1 = require("src/bootstrap/state.js");
var claude_js_1 = require("src/services/api/claude.js");
var logging_js_1 = require("src/services/api/logging.js");
var strip_ansi_1 = require("strip-ansi");
var commands_js_1 = require("./commands.js");
var xml_js_1 = require("./constants/xml.js");
var cost_tracker_js_1 = require("./cost-tracker.js");
var memdir_js_1 = require("./memdir/memdir.js");
var paths_js_1 = require("./memdir/paths.js");
var query_js_1 = require("./query.js");
var errors_js_1 = require("./services/api/errors.js");
var Tool_js_1 = require("./Tool.js");
var SyntheticOutputTool_js_1 = require("./tools/SyntheticOutputTool/SyntheticOutputTool.js");
var abortController_js_1 = require("./utils/abortController.js");
var config_js_1 = require("./utils/config.js");
var cwd_js_1 = require("./utils/cwd.js");
var envUtils_js_1 = require("./utils/envUtils.js");
var fastMode_js_1 = require("./utils/fastMode.js");
var fileHistory_js_1 = require("./utils/fileHistory.js");
var fileStateCache_js_1 = require("./utils/fileStateCache.js");
var headlessProfiler_js_1 = require("./utils/headlessProfiler.js");
var hookHelpers_js_1 = require("./utils/hooks/hookHelpers.js");
var log_js_1 = require("./utils/log.js");
var messages_js_1 = require("./utils/messages.js");
var model_js_1 = require("./utils/model/model.js");
var pluginLoader_js_1 = require("./utils/plugins/pluginLoader.js");
var processUserInput_js_1 = require("./utils/processUserInput/processUserInput.js");
var queryContext_js_1 = require("./utils/queryContext.js");
var Shell_js_1 = require("./utils/Shell.js");
var sessionStorage_js_1 = require("./utils/sessionStorage.js");
var systemPromptType_js_1 = require("./utils/systemPromptType.js");
var systemTheme_js_1 = require("./utils/systemTheme.js");
var thinking_js_1 = require("./utils/thinking.js");
// Lazy: MessageSelector.tsx pulls React/ink; only needed for message filtering at query time
/* eslint-disable @typescript-eslint/no-require-imports */
var messageSelector = function () {
    return require('src/components/MessageSelector.js');
};
var mappers_js_1 = require("./utils/messages/mappers.js");
var systemInit_js_1 = require("./utils/messages/systemInit.js");
var filesystem_js_1 = require("./utils/permissions/filesystem.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var queryHelpers_js_1 = require("./utils/queryHelpers.js");
// Dead code elimination: conditional import for coordinator mode
/* eslint-disable @typescript-eslint/no-require-imports */
var getCoordinatorUserContext = (0, bun_bundle_1.feature)('COORDINATOR_MODE')
    ? require('./coordinator/coordinatorMode.js').getCoordinatorUserContext
    : function () { return ({}); };
/* eslint-enable @typescript-eslint/no-require-imports */
// Dead code elimination: conditional import for snip compaction
/* eslint-disable @typescript-eslint/no-require-imports */
var snipModule = (0, bun_bundle_1.feature)('HISTORY_SNIP')
    ? require('./services/compact/snipCompact.js')
    : null;
var snipProjection = (0, bun_bundle_1.feature)('HISTORY_SNIP')
    ? require('./services/compact/snipProjection.js')
    : null;
/**
 * QueryEngine owns the query lifecycle and session state for a conversation.
 * It extracts the core logic from ask() into a standalone class that can be
 * used by both the headless/SDK path and (in a future phase) the REPL.
 *
 * One QueryEngine per conversation. Each submitMessage() call starts a new
 * turn within the same conversation. State (messages, file cache, usage, etc.)
 * persists across turns.
 */
var QueryEngine = /** @class */ (function () {
    function QueryEngine(config) {
        var _a, _b;
        this.hasHandledOrphanedPermission = false;
        // Turn-scoped skill discovery tracking (feeds was_discovered on
        // tengu_skill_tool_invocation). Must persist across the two
        // processUserInputContext rebuilds inside submitMessage, but is cleared
        // at the start of each submitMessage to avoid unbounded growth across
        // many turns in SDK mode.
        this.discoveredSkillNames = new Set();
        this.loadedNestedMemoryPaths = new Set();
        this.config = config;
        this.mutableMessages = (_a = config.initialMessages) !== null && _a !== void 0 ? _a : [];
        this.abortController = (_b = config.abortController) !== null && _b !== void 0 ? _b : (0, abortController_js_1.createAbortController)();
        this.permissionDenials = [];
        this.readFileState = config.readFileCache;
        this.totalUsage = logging_js_1.EMPTY_USAGE;
    }
    QueryEngine.prototype.submitMessage = function (prompt, options) {
        return __asyncGenerator(this, arguments, function submitMessage_1() {
            var _a, cwd, commands, tools, mcpClients, _b, verbose, thinkingConfig, maxTurns, maxBudgetUsd, taskBudget, canUseTool, customSystemPrompt, appendSystemPrompt, userSpecifiedModel, fallbackModel, jsonSchema, getAppState, setAppState, _c, replayUserMessages, _d, includePartialMessages, _e, agents, setSDKStatus, orphanedPermission, persistSession, startTime, wrappedCanUseTool, initialAppState, initialMainLoopModel, initialThinkingConfig, customPrompt, _f, defaultSystemPrompt, baseUserContext, systemContext, userContext, memoryMechanicsPrompt, _g, systemPrompt, hasStructuredOutputTool, processUserInputContext, _h, _j, _k, message, e_1_1, _l, messagesFromUserInput, shouldQuery, allowedTools, modelFromUserInput, resultText, messages, transcriptPromise, replayableMessages, messagesToAck, mainLoopModel, _m, skills, enabledPlugins, _i, messagesFromUserInput_1, msg, currentMessageUsage, turnCount, hasAcknowledgedInitialMessages, structuredOutputFromTool, lastStopReason, errorLogWatermark, initialStructuredOutputCalls, _loop_1, this_1, _o, _p, _q, state_1, e_2_1, result, edeResultType, edeLastContentType, textResult, isApiError, lastContent;
            var _r;
            var _this = this;
            var _s, e_1, _t, _u, _v, e_2, _w, _x;
            var _y, _z, _0, _1, _2, _3, _4, _5;
            return __generator(this, function (_6) {
                switch (_6.label) {
                    case 0:
                        _a = this.config, cwd = _a.cwd, commands = _a.commands, tools = _a.tools, mcpClients = _a.mcpClients, _b = _a.verbose, verbose = _b === void 0 ? false : _b, thinkingConfig = _a.thinkingConfig, maxTurns = _a.maxTurns, maxBudgetUsd = _a.maxBudgetUsd, taskBudget = _a.taskBudget, canUseTool = _a.canUseTool, customSystemPrompt = _a.customSystemPrompt, appendSystemPrompt = _a.appendSystemPrompt, userSpecifiedModel = _a.userSpecifiedModel, fallbackModel = _a.fallbackModel, jsonSchema = _a.jsonSchema, getAppState = _a.getAppState, setAppState = _a.setAppState, _c = _a.replayUserMessages, replayUserMessages = _c === void 0 ? false : _c, _d = _a.includePartialMessages, includePartialMessages = _d === void 0 ? false : _d, _e = _a.agents, agents = _e === void 0 ? [] : _e, setSDKStatus = _a.setSDKStatus, orphanedPermission = _a.orphanedPermission;
                        this.discoveredSkillNames.clear();
                        (0, Shell_js_1.setCwd)(cwd);
                        persistSession = !(0, state_js_1.isSessionPersistenceDisabled)();
                        startTime = Date.now();
                        wrappedCanUseTool = function (tool, input, toolUseContext, assistantMessage, toolUseID, forceDecision) { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, canUseTool(tool, input, toolUseContext, assistantMessage, toolUseID, forceDecision)
                                        // Track denials for SDK reporting
                                    ];
                                    case 1:
                                        result = _a.sent();
                                        // Track denials for SDK reporting
                                        if (result.behavior !== 'allow') {
                                            this.permissionDenials.push({
                                                tool_name: (0, systemInit_js_1.sdkCompatToolName)(tool.name),
                                                tool_use_id: toolUseID,
                                                tool_input: input,
                                            });
                                        }
                                        return [2 /*return*/, result];
                                }
                            });
                        }); };
                        initialAppState = getAppState();
                        initialMainLoopModel = userSpecifiedModel
                            ? (0, model_js_1.parseUserSpecifiedModel)(userSpecifiedModel)
                            : (0, model_js_1.getMainLoopModel)();
                        initialThinkingConfig = thinkingConfig
                            ? thinkingConfig
                            : (0, thinking_js_1.shouldEnableThinkingByDefault)() !== false
                                ? { type: 'adaptive' }
                                : { type: 'disabled' };
                        (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('before_getSystemPrompt');
                        customPrompt = typeof customSystemPrompt === 'string' ? customSystemPrompt : undefined;
                        return [4 /*yield*/, __await((0, queryContext_js_1.fetchSystemPromptParts)({
                                tools: tools,
                                mainLoopModel: initialMainLoopModel,
                                additionalWorkingDirectories: Array.from(initialAppState.toolPermissionContext.additionalWorkingDirectories.keys()),
                                mcpClients: mcpClients,
                                customSystemPrompt: customPrompt,
                            }))];
                    case 1:
                        _f = _6.sent(), defaultSystemPrompt = _f.defaultSystemPrompt, baseUserContext = _f.userContext, systemContext = _f.systemContext;
                        (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('after_getSystemPrompt');
                        userContext = __assign(__assign({}, baseUserContext), getCoordinatorUserContext(mcpClients, (0, filesystem_js_1.isScratchpadEnabled)() ? (0, filesystem_js_1.getScratchpadDir)() : undefined));
                        if (!(customPrompt !== undefined && (0, paths_js_1.hasAutoMemPathOverride)())) return [3 /*break*/, 3];
                        return [4 /*yield*/, __await((0, memdir_js_1.loadMemoryPrompt)())];
                    case 2:
                        _g = _6.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _g = null;
                        _6.label = 4;
                    case 4:
                        memoryMechanicsPrompt = _g;
                        systemPrompt = (0, systemPromptType_js_1.asSystemPrompt)(__spreadArray(__spreadArray(__spreadArray([], (customPrompt !== undefined ? [customPrompt] : defaultSystemPrompt), true), (memoryMechanicsPrompt ? [memoryMechanicsPrompt] : []), true), (appendSystemPrompt ? [appendSystemPrompt] : []), true));
                        hasStructuredOutputTool = tools.some(function (t) {
                            return (0, Tool_js_1.toolMatchesName)(t, SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME);
                        });
                        if (jsonSchema && hasStructuredOutputTool) {
                            (0, hookHelpers_js_1.registerStructuredOutputEnforcement)(setAppState, (0, state_js_1.getSessionId)());
                        }
                        processUserInputContext = {
                            messages: this.mutableMessages,
                            // Slash commands that mutate the message array (e.g. /force-snip)
                            // call setMessages(fn).  In interactive mode this writes back to
                            // AppState; in print mode we write back to mutableMessages so the
                            // rest of the query loop (push at :389, snapshot at :392) sees
                            // the result.  The second processUserInputContext below (after
                            // slash-command processing) keeps the no-op — nothing else calls
                            // setMessages past that point.
                            setMessages: function (fn) {
                                _this.mutableMessages = fn(_this.mutableMessages);
                            },
                            onChangeAPIKey: function () { },
                            handleElicitation: this.config.handleElicitation,
                            options: {
                                commands: commands,
                                debug: false, // we use stdout, so don't want to clobber it
                                tools: tools,
                                verbose: verbose,
                                mainLoopModel: initialMainLoopModel,
                                thinkingConfig: initialThinkingConfig,
                                mcpClients: mcpClients,
                                mcpResources: {},
                                ideInstallationStatus: null,
                                isNonInteractiveSession: true,
                                customSystemPrompt: customSystemPrompt,
                                appendSystemPrompt: appendSystemPrompt,
                                agentDefinitions: { activeAgents: agents, allAgents: [] },
                                theme: (0, systemTheme_js_1.resolveThemeSetting)((0, config_js_1.getGlobalConfig)().theme),
                                maxBudgetUsd: maxBudgetUsd,
                            },
                            getAppState: getAppState,
                            setAppState: setAppState,
                            abortController: this.abortController,
                            readFileState: this.readFileState,
                            nestedMemoryAttachmentTriggers: new Set(),
                            loadedNestedMemoryPaths: this.loadedNestedMemoryPaths,
                            dynamicSkillDirTriggers: new Set(),
                            discoveredSkillNames: this.discoveredSkillNames,
                            setInProgressToolUseIDs: function () { },
                            setResponseLength: function () { },
                            updateFileHistoryState: function (updater) {
                                setAppState(function (prev) {
                                    var updated = updater(prev.fileHistory);
                                    if (updated === prev.fileHistory)
                                        return prev;
                                    return __assign(__assign({}, prev), { fileHistory: updated });
                                });
                            },
                            updateAttributionState: function (updater) {
                                setAppState(function (prev) {
                                    var updated = updater(prev.attribution);
                                    if (updated === prev.attribution)
                                        return prev;
                                    return __assign(__assign({}, prev), { attribution: updated });
                                });
                            },
                            setSDKStatus: setSDKStatus,
                        };
                        if (!(orphanedPermission && !this.hasHandledOrphanedPermission)) return [3 /*break*/, 18];
                        this.hasHandledOrphanedPermission = true;
                        _6.label = 5;
                    case 5:
                        _6.trys.push([5, 12, 13, 18]);
                        _h = true, _j = __asyncValues((0, queryHelpers_js_1.handleOrphanedPermission)(orphanedPermission, tools, this.mutableMessages, processUserInputContext));
                        _6.label = 6;
                    case 6: return [4 /*yield*/, __await(_j.next())];
                    case 7:
                        if (!(_k = _6.sent(), _s = _k.done, !_s)) return [3 /*break*/, 11];
                        _u = _k.value;
                        _h = false;
                        message = _u;
                        return [4 /*yield*/, __await(message)];
                    case 8: return [4 /*yield*/, _6.sent()];
                    case 9:
                        _6.sent();
                        _6.label = 10;
                    case 10:
                        _h = true;
                        return [3 /*break*/, 6];
                    case 11: return [3 /*break*/, 18];
                    case 12:
                        e_1_1 = _6.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 18];
                    case 13:
                        _6.trys.push([13, , 16, 17]);
                        if (!(!_h && !_s && (_t = _j.return))) return [3 /*break*/, 15];
                        return [4 /*yield*/, __await(_t.call(_j))];
                    case 14:
                        _6.sent();
                        _6.label = 15;
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 17: return [7 /*endfinally*/];
                    case 18: return [4 /*yield*/, __await((0, processUserInput_js_1.processUserInput)({
                            input: prompt,
                            mode: 'prompt',
                            setToolJSX: function () { },
                            context: __assign(__assign({}, processUserInputContext), { messages: this.mutableMessages }),
                            messages: this.mutableMessages,
                            uuid: options === null || options === void 0 ? void 0 : options.uuid,
                            isMeta: options === null || options === void 0 ? void 0 : options.isMeta,
                            querySource: 'sdk',
                        })
                        // Push new messages, including user input and any attachments
                        )];
                    case 19:
                        _l = _6.sent(), messagesFromUserInput = _l.messages, shouldQuery = _l.shouldQuery, allowedTools = _l.allowedTools, modelFromUserInput = _l.model, resultText = _l.resultText;
                        // Push new messages, including user input and any attachments
                        (_r = this.mutableMessages).push.apply(_r, messagesFromUserInput);
                        messages = __spreadArray([], this.mutableMessages, true);
                        if (!(persistSession && messagesFromUserInput.length > 0)) return [3 /*break*/, 23];
                        transcriptPromise = (0, sessionStorage_js_1.recordTranscript)(messages);
                        if (!(0, envUtils_js_1.isBareMode)()) return [3 /*break*/, 20];
                        void transcriptPromise;
                        return [3 /*break*/, 23];
                    case 20: return [4 /*yield*/, __await(transcriptPromise)];
                    case 21:
                        _6.sent();
                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EAGER_FLUSH) ||
                            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IS_COWORK))) return [3 /*break*/, 23];
                        return [4 /*yield*/, __await((0, sessionStorage_js_1.flushSessionStorage)())];
                    case 22:
                        _6.sent();
                        _6.label = 23;
                    case 23:
                        replayableMessages = messagesFromUserInput.filter(function (msg) {
                            return (msg.type === 'user' &&
                                !msg.isMeta && // Skip synthetic caveat messages
                                !msg.toolUseResult && // Skip tool results (they'll be acked from query)
                                messageSelector().selectableUserMessagesFilter(msg)) || // Skip non-user-authored messages (task notifications, etc.)
                                (msg.type === 'system' && msg.subtype === 'compact_boundary');
                        });
                        messagesToAck = replayUserMessages ? replayableMessages : [];
                        // Update the ToolPermissionContext based on user input processing (as necessary)
                        setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: __assign(__assign({}, prev.toolPermissionContext), { alwaysAllowRules: __assign(__assign({}, prev.toolPermissionContext.alwaysAllowRules), { command: allowedTools }) }) })); });
                        mainLoopModel = modelFromUserInput !== null && modelFromUserInput !== void 0 ? modelFromUserInput : initialMainLoopModel;
                        // Recreate after processing the prompt to pick up updated messages and
                        // model (from slash commands).
                        processUserInputContext = {
                            messages: messages,
                            setMessages: function () { },
                            onChangeAPIKey: function () { },
                            handleElicitation: this.config.handleElicitation,
                            options: {
                                commands: commands,
                                debug: false,
                                tools: tools,
                                verbose: verbose,
                                mainLoopModel: mainLoopModel,
                                thinkingConfig: initialThinkingConfig,
                                mcpClients: mcpClients,
                                mcpResources: {},
                                ideInstallationStatus: null,
                                isNonInteractiveSession: true,
                                customSystemPrompt: customSystemPrompt,
                                appendSystemPrompt: appendSystemPrompt,
                                theme: (0, systemTheme_js_1.resolveThemeSetting)((0, config_js_1.getGlobalConfig)().theme),
                                agentDefinitions: { activeAgents: agents, allAgents: [] },
                                maxBudgetUsd: maxBudgetUsd,
                            },
                            getAppState: getAppState,
                            setAppState: setAppState,
                            abortController: this.abortController,
                            readFileState: this.readFileState,
                            nestedMemoryAttachmentTriggers: new Set(),
                            loadedNestedMemoryPaths: this.loadedNestedMemoryPaths,
                            dynamicSkillDirTriggers: new Set(),
                            discoveredSkillNames: this.discoveredSkillNames,
                            setInProgressToolUseIDs: function () { },
                            setResponseLength: function () { },
                            updateFileHistoryState: processUserInputContext.updateFileHistoryState,
                            updateAttributionState: processUserInputContext.updateAttributionState,
                            setSDKStatus: setSDKStatus,
                        };
                        (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('before_skills_plugins');
                        return [4 /*yield*/, __await(Promise.all([
                                (0, commands_js_1.getSlashCommandToolSkills)((0, cwd_js_1.getCwd)()),
                                (0, pluginLoader_js_1.loadAllPluginsCacheOnly)(),
                            ]))];
                    case 24:
                        _m = _6.sent(), skills = _m[0], enabledPlugins = _m[1].enabled;
                        (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('after_skills_plugins');
                        return [4 /*yield*/, __await((0, systemInit_js_1.buildSystemInitMessage)({
                                tools: tools,
                                mcpClients: mcpClients,
                                model: mainLoopModel,
                                permissionMode: initialAppState.toolPermissionContext
                                    .mode, // TODO: avoid the cast
                                commands: commands,
                                agents: agents,
                                skills: skills,
                                plugins: enabledPlugins,
                                fastMode: initialAppState.fastMode,
                            })
                            // Record when system message is yielded for headless latency tracking
                            )];
                    case 25: return [4 /*yield*/, _6.sent()];
                    case 26:
                        _6.sent();
                        // Record when system message is yielded for headless latency tracking
                        (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('system_message_yielded');
                        if (!!shouldQuery) return [3 /*break*/, 44];
                        _i = 0, messagesFromUserInput_1 = messagesFromUserInput;
                        _6.label = 27;
                    case 27:
                        if (!(_i < messagesFromUserInput_1.length)) return [3 /*break*/, 37];
                        msg = messagesFromUserInput_1[_i];
                        if (!(msg.type === 'user' &&
                            typeof msg.message.content === 'string' &&
                            (msg.message.content.includes("<".concat(xml_js_1.LOCAL_COMMAND_STDOUT_TAG, ">")) ||
                                msg.message.content.includes("<".concat(xml_js_1.LOCAL_COMMAND_STDERR_TAG, ">")) ||
                                msg.isCompactSummary))) return [3 /*break*/, 30];
                        return [4 /*yield*/, __await({
                                type: 'user',
                                message: __assign(__assign({}, msg.message), { content: (0, strip_ansi_1.default)(msg.message.content) }),
                                session_id: (0, state_js_1.getSessionId)(),
                                parent_tool_use_id: null,
                                uuid: msg.uuid,
                                timestamp: msg.timestamp,
                                isReplay: !msg.isCompactSummary,
                                isSynthetic: msg.isMeta || msg.isVisibleInTranscriptOnly,
                            })];
                    case 28: return [4 /*yield*/, _6.sent()];
                    case 29:
                        _6.sent();
                        _6.label = 30;
                    case 30:
                        if (!(msg.type === 'system' &&
                            msg.subtype === 'local_command' &&
                            typeof msg.content === 'string' &&
                            (msg.content.includes("<".concat(xml_js_1.LOCAL_COMMAND_STDOUT_TAG, ">")) ||
                                msg.content.includes("<".concat(xml_js_1.LOCAL_COMMAND_STDERR_TAG, ">"))))) return [3 /*break*/, 33];
                        return [4 /*yield*/, __await((0, mappers_js_1.localCommandOutputToSDKAssistantMessage)(msg.content, msg.uuid))];
                    case 31: return [4 /*yield*/, _6.sent()];
                    case 32:
                        _6.sent();
                        _6.label = 33;
                    case 33:
                        if (!(msg.type === 'system' && msg.subtype === 'compact_boundary')) return [3 /*break*/, 36];
                        return [4 /*yield*/, __await({
                                type: 'system',
                                subtype: 'compact_boundary',
                                session_id: (0, state_js_1.getSessionId)(),
                                uuid: msg.uuid,
                                compact_metadata: (0, mappers_js_1.toSDKCompactMetadata)(msg.compactMetadata),
                            })];
                    case 34: return [4 /*yield*/, _6.sent()];
                    case 35:
                        _6.sent();
                        _6.label = 36;
                    case 36:
                        _i++;
                        return [3 /*break*/, 27];
                    case 37:
                        if (!persistSession) return [3 /*break*/, 40];
                        return [4 /*yield*/, __await((0, sessionStorage_js_1.recordTranscript)(messages))];
                    case 38:
                        _6.sent();
                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EAGER_FLUSH) ||
                            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IS_COWORK))) return [3 /*break*/, 40];
                        return [4 /*yield*/, __await((0, sessionStorage_js_1.flushSessionStorage)())];
                    case 39:
                        _6.sent();
                        _6.label = 40;
                    case 40: return [4 /*yield*/, __await({
                            type: 'result',
                            subtype: 'success',
                            is_error: false,
                            duration_ms: Date.now() - startTime,
                            duration_api_ms: (0, cost_tracker_js_1.getTotalAPIDuration)(),
                            num_turns: messages.length - 1,
                            result: resultText !== null && resultText !== void 0 ? resultText : '',
                            stop_reason: null,
                            session_id: (0, state_js_1.getSessionId)(),
                            total_cost_usd: (0, cost_tracker_js_1.getTotalCost)(),
                            usage: this.totalUsage,
                            modelUsage: (0, cost_tracker_js_1.getModelUsage)(),
                            permission_denials: this.permissionDenials,
                            fast_mode_state: (0, fastMode_js_1.getFastModeState)(mainLoopModel, initialAppState.fastMode),
                            uuid: (0, crypto_1.randomUUID)(),
                        })];
                    case 41: return [4 /*yield*/, _6.sent()];
                    case 42:
                        _6.sent();
                        return [4 /*yield*/, __await(void 0)];
                    case 43: return [2 /*return*/, _6.sent()];
                    case 44:
                        if ((0, fileHistory_js_1.fileHistoryEnabled)() && persistSession) {
                            messagesFromUserInput
                                .filter(messageSelector().selectableUserMessagesFilter)
                                .forEach(function (message) {
                                void (0, fileHistory_js_1.fileHistoryMakeSnapshot)(function (updater) {
                                    setAppState(function (prev) { return (__assign(__assign({}, prev), { fileHistory: updater(prev.fileHistory) })); });
                                }, message.uuid);
                            });
                        }
                        currentMessageUsage = logging_js_1.EMPTY_USAGE;
                        turnCount = 1;
                        hasAcknowledgedInitialMessages = false;
                        lastStopReason = null;
                        errorLogWatermark = (0, log_js_1.getInMemoryErrors)().at(-1);
                        initialStructuredOutputCalls = jsonSchema
                            ? (0, messages_js_1.countToolCalls)(this.mutableMessages, SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME)
                            : 0;
                        _6.label = 45;
                    case 45:
                        _6.trys.push([45, 51, 52, 57]);
                        _loop_1 = function () {
                            var message, tailUuid_1, tailIdx, _7, messagesToAck_1, msgToAck, _8, _9, snipResult, mutableBoundaryIdx, localBoundaryIdx, _10, currentCalls, callsThisQuery, maxRetries, _11;
                            var _12;
                            return __generator(this, function (_13) {
                                switch (_13.label) {
                                    case 0:
                                        _x = _q.value;
                                        _o = false;
                                        message = _x;
                                        if (!(message.type === 'assistant' ||
                                            message.type === 'user' ||
                                            (message.type === 'system' && message.subtype === 'compact_boundary'))) return [3 /*break*/, 10];
                                        if (!(persistSession &&
                                            message.type === 'system' &&
                                            message.subtype === 'compact_boundary')) return [3 /*break*/, 2];
                                        tailUuid_1 = (_z = (_y = message.compactMetadata) === null || _y === void 0 ? void 0 : _y.preservedSegment) === null || _z === void 0 ? void 0 : _z.tailUuid;
                                        if (!tailUuid_1) return [3 /*break*/, 2];
                                        tailIdx = this_1.mutableMessages.findLastIndex(function (m) { return m.uuid === tailUuid_1; });
                                        if (!(tailIdx !== -1)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, __await((0, sessionStorage_js_1.recordTranscript)(this_1.mutableMessages.slice(0, tailIdx + 1)))];
                                    case 1:
                                        _13.sent();
                                        _13.label = 2;
                                    case 2:
                                        messages.push(message);
                                        if (!persistSession) return [3 /*break*/, 5];
                                        if (!(message.type === 'assistant')) return [3 /*break*/, 3];
                                        void (0, sessionStorage_js_1.recordTranscript)(messages);
                                        return [3 /*break*/, 5];
                                    case 3: return [4 /*yield*/, __await((0, sessionStorage_js_1.recordTranscript)(messages))];
                                    case 4:
                                        _13.sent();
                                        _13.label = 5;
                                    case 5:
                                        if (!(!hasAcknowledgedInitialMessages && messagesToAck.length > 0)) return [3 /*break*/, 10];
                                        hasAcknowledgedInitialMessages = true;
                                        _7 = 0, messagesToAck_1 = messagesToAck;
                                        _13.label = 6;
                                    case 6:
                                        if (!(_7 < messagesToAck_1.length)) return [3 /*break*/, 10];
                                        msgToAck = messagesToAck_1[_7];
                                        if (!(msgToAck.type === 'user')) return [3 /*break*/, 9];
                                        return [4 /*yield*/, __await({
                                                type: 'user',
                                                message: msgToAck.message,
                                                session_id: (0, state_js_1.getSessionId)(),
                                                parent_tool_use_id: null,
                                                uuid: msgToAck.uuid,
                                                timestamp: msgToAck.timestamp,
                                                isReplay: true,
                                            })];
                                    case 7: return [4 /*yield*/, _13.sent()];
                                    case 8:
                                        _13.sent();
                                        _13.label = 9;
                                    case 9:
                                        _7++;
                                        return [3 /*break*/, 6];
                                    case 10:
                                        if (message.type === 'user') {
                                            turnCount++;
                                        }
                                        _8 = message.type;
                                        switch (_8) {
                                            case 'tombstone': return [3 /*break*/, 11];
                                            case 'assistant': return [3 /*break*/, 12];
                                            case 'progress': return [3 /*break*/, 15];
                                            case 'user': return [3 /*break*/, 18];
                                            case 'stream_event': return [3 /*break*/, 21];
                                            case 'attachment': return [3 /*break*/, 25];
                                            case 'stream_request_start': return [3 /*break*/, 36];
                                            case 'system': return [3 /*break*/, 37];
                                            case 'tool_use_summary': return [3 /*break*/, 44];
                                        }
                                        return [3 /*break*/, 47];
                                    case 11: 
                                    // Tombstone messages are control signals for removing messages, skip them
                                    return [3 /*break*/, 47];
                                    case 12:
                                        // Capture stop_reason if already set (synthetic messages). For
                                        // streamed responses, this is null at content_block_stop time;
                                        // the real value arrives via message_delta (handled below).
                                        if (message.message.stop_reason != null) {
                                            lastStopReason = message.message.stop_reason;
                                        }
                                        this_1.mutableMessages.push(message);
                                        return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, queryHelpers_js_1.normalizeMessage)(message))))];
                                    case 13: return [4 /*yield*/, __await.apply(void 0, [_13.sent()])];
                                    case 14:
                                        _13.sent();
                                        return [3 /*break*/, 47];
                                    case 15:
                                        this_1.mutableMessages.push(message);
                                        // Record inline so the dedup loop in the next ask() call sees it
                                        // as already-recorded. Without this, deferred progress interleaves
                                        // with already-recorded tool_results in mutableMessages, and the
                                        // dedup walk freezes startingParentUuid at the wrong message —
                                        // forking the chain and orphaning the conversation on resume.
                                        if (persistSession) {
                                            messages.push(message);
                                            void (0, sessionStorage_js_1.recordTranscript)(messages);
                                        }
                                        return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, queryHelpers_js_1.normalizeMessage)(message))))];
                                    case 16: return [4 /*yield*/, __await.apply(void 0, [_13.sent()])];
                                    case 17:
                                        _13.sent();
                                        return [3 /*break*/, 47];
                                    case 18:
                                        this_1.mutableMessages.push(message);
                                        return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, queryHelpers_js_1.normalizeMessage)(message))))];
                                    case 19: return [4 /*yield*/, __await.apply(void 0, [_13.sent()])];
                                    case 20:
                                        _13.sent();
                                        return [3 /*break*/, 47];
                                    case 21:
                                        if (message.event.type === 'message_start') {
                                            // Reset current message usage for new message
                                            currentMessageUsage = logging_js_1.EMPTY_USAGE;
                                            currentMessageUsage = (0, claude_js_1.updateUsage)(currentMessageUsage, message.event.message.usage);
                                        }
                                        if (message.event.type === 'message_delta') {
                                            currentMessageUsage = (0, claude_js_1.updateUsage)(currentMessageUsage, message.event.usage);
                                            // Capture stop_reason from message_delta. The assistant message
                                            // is yielded at content_block_stop with stop_reason=null; the
                                            // real value only arrives here (see claude.ts message_delta
                                            // handler). Without this, result.stop_reason is always null.
                                            if (message.event.delta.stop_reason != null) {
                                                lastStopReason = message.event.delta.stop_reason;
                                            }
                                        }
                                        if (message.event.type === 'message_stop') {
                                            // Accumulate current message usage into total
                                            this_1.totalUsage = (0, claude_js_1.accumulateUsage)(this_1.totalUsage, currentMessageUsage);
                                        }
                                        if (!includePartialMessages) return [3 /*break*/, 24];
                                        return [4 /*yield*/, __await({
                                                type: 'stream_event',
                                                event: message.event,
                                                session_id: (0, state_js_1.getSessionId)(),
                                                parent_tool_use_id: null,
                                                uuid: (0, crypto_1.randomUUID)(),
                                            })];
                                    case 22: return [4 /*yield*/, _13.sent()];
                                    case 23:
                                        _13.sent();
                                        _13.label = 24;
                                    case 24: return [3 /*break*/, 47];
                                    case 25:
                                        this_1.mutableMessages.push(message);
                                        // Record inline (same reason as progress above).
                                        if (persistSession) {
                                            messages.push(message);
                                            void (0, sessionStorage_js_1.recordTranscript)(messages);
                                        }
                                        if (!(message.attachment.type === 'structured_output')) return [3 /*break*/, 26];
                                        structuredOutputFromTool = message.attachment.data;
                                        return [3 /*break*/, 35];
                                    case 26:
                                        if (!(message.attachment.type === 'max_turns_reached')) return [3 /*break*/, 32];
                                        if (!persistSession) return [3 /*break*/, 28];
                                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EAGER_FLUSH) ||
                                            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IS_COWORK))) return [3 /*break*/, 28];
                                        return [4 /*yield*/, __await((0, sessionStorage_js_1.flushSessionStorage)())];
                                    case 27:
                                        _13.sent();
                                        _13.label = 28;
                                    case 28: return [4 /*yield*/, __await({
                                            type: 'result',
                                            subtype: 'error_max_turns',
                                            duration_ms: Date.now() - startTime,
                                            duration_api_ms: (0, cost_tracker_js_1.getTotalAPIDuration)(),
                                            is_error: true,
                                            num_turns: message.attachment.turnCount,
                                            stop_reason: lastStopReason,
                                            session_id: (0, state_js_1.getSessionId)(),
                                            total_cost_usd: (0, cost_tracker_js_1.getTotalCost)(),
                                            usage: this_1.totalUsage,
                                            modelUsage: (0, cost_tracker_js_1.getModelUsage)(),
                                            permission_denials: this_1.permissionDenials,
                                            fast_mode_state: (0, fastMode_js_1.getFastModeState)(mainLoopModel, initialAppState.fastMode),
                                            uuid: (0, crypto_1.randomUUID)(),
                                            errors: [
                                                "Reached maximum number of turns (".concat(message.attachment.maxTurns, ")"),
                                            ],
                                        })];
                                    case 29: return [4 /*yield*/, _13.sent()];
                                    case 30:
                                        _13.sent();
                                        _9 = {};
                                        return [4 /*yield*/, __await(void 0)];
                                    case 31: return [2 /*return*/, (_9.value = _13.sent(), _9)];
                                    case 32:
                                        if (!(replayUserMessages &&
                                            message.attachment.type === 'queued_command')) return [3 /*break*/, 35];
                                        return [4 /*yield*/, __await({
                                                type: 'user',
                                                message: {
                                                    role: 'user',
                                                    content: message.attachment.prompt,
                                                },
                                                session_id: (0, state_js_1.getSessionId)(),
                                                parent_tool_use_id: null,
                                                uuid: message.attachment.source_uuid || message.uuid,
                                                timestamp: message.timestamp,
                                                isReplay: true,
                                            })];
                                    case 33: return [4 /*yield*/, _13.sent()];
                                    case 34:
                                        _13.sent();
                                        _13.label = 35;
                                    case 35: return [3 /*break*/, 47];
                                    case 36: 
                                    // Don't yield stream request start messages
                                    return [3 /*break*/, 47];
                                    case 37:
                                        snipResult = (_1 = (_0 = this_1.config).snipReplay) === null || _1 === void 0 ? void 0 : _1.call(_0, message, this_1.mutableMessages);
                                        if (snipResult !== undefined) {
                                            if (snipResult.executed) {
                                                this_1.mutableMessages.length = 0;
                                                (_12 = this_1.mutableMessages).push.apply(_12, snipResult.messages);
                                            }
                                            return [3 /*break*/, 47];
                                        }
                                        this_1.mutableMessages.push(message);
                                        if (!(message.subtype === 'compact_boundary' &&
                                            message.compactMetadata)) return [3 /*break*/, 40];
                                        mutableBoundaryIdx = this_1.mutableMessages.length - 1;
                                        if (mutableBoundaryIdx > 0) {
                                            this_1.mutableMessages.splice(0, mutableBoundaryIdx);
                                        }
                                        localBoundaryIdx = messages.length - 1;
                                        if (localBoundaryIdx > 0) {
                                            messages.splice(0, localBoundaryIdx);
                                        }
                                        return [4 /*yield*/, __await({
                                                type: 'system',
                                                subtype: 'compact_boundary',
                                                session_id: (0, state_js_1.getSessionId)(),
                                                uuid: message.uuid,
                                                compact_metadata: (0, mappers_js_1.toSDKCompactMetadata)(message.compactMetadata),
                                            })];
                                    case 38: return [4 /*yield*/, _13.sent()];
                                    case 39:
                                        _13.sent();
                                        _13.label = 40;
                                    case 40:
                                        if (!(message.subtype === 'api_error')) return [3 /*break*/, 43];
                                        return [4 /*yield*/, __await({
                                                type: 'system',
                                                subtype: 'api_retry',
                                                attempt: message.retryAttempt,
                                                max_retries: message.maxRetries,
                                                retry_delay_ms: message.retryInMs,
                                                error_status: (_2 = message.error.status) !== null && _2 !== void 0 ? _2 : null,
                                                error: (0, errors_js_1.categorizeRetryableAPIError)(message.error),
                                                session_id: (0, state_js_1.getSessionId)(),
                                                uuid: message.uuid,
                                            })];
                                    case 41: return [4 /*yield*/, _13.sent()];
                                    case 42:
                                        _13.sent();
                                        _13.label = 43;
                                    case 43: 
                                    // Don't yield other system messages in headless mode
                                    return [3 /*break*/, 47];
                                    case 44: return [4 /*yield*/, __await({
                                            type: 'tool_use_summary',
                                            summary: message.summary,
                                            preceding_tool_use_ids: message.precedingToolUseIds,
                                            session_id: (0, state_js_1.getSessionId)(),
                                            uuid: message.uuid,
                                        })];
                                    case 45: 
                                    // Yield tool use summary messages to SDK
                                    return [4 /*yield*/, _13.sent()];
                                    case 46:
                                        // Yield tool use summary messages to SDK
                                        _13.sent();
                                        return [3 /*break*/, 47];
                                    case 47:
                                        if (!(maxBudgetUsd !== undefined && (0, cost_tracker_js_1.getTotalCost)() >= maxBudgetUsd)) return [3 /*break*/, 53];
                                        if (!persistSession) return [3 /*break*/, 49];
                                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EAGER_FLUSH) ||
                                            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IS_COWORK))) return [3 /*break*/, 49];
                                        return [4 /*yield*/, __await((0, sessionStorage_js_1.flushSessionStorage)())];
                                    case 48:
                                        _13.sent();
                                        _13.label = 49;
                                    case 49: return [4 /*yield*/, __await({
                                            type: 'result',
                                            subtype: 'error_max_budget_usd',
                                            duration_ms: Date.now() - startTime,
                                            duration_api_ms: (0, cost_tracker_js_1.getTotalAPIDuration)(),
                                            is_error: true,
                                            num_turns: turnCount,
                                            stop_reason: lastStopReason,
                                            session_id: (0, state_js_1.getSessionId)(),
                                            total_cost_usd: (0, cost_tracker_js_1.getTotalCost)(),
                                            usage: this_1.totalUsage,
                                            modelUsage: (0, cost_tracker_js_1.getModelUsage)(),
                                            permission_denials: this_1.permissionDenials,
                                            fast_mode_state: (0, fastMode_js_1.getFastModeState)(mainLoopModel, initialAppState.fastMode),
                                            uuid: (0, crypto_1.randomUUID)(),
                                            errors: ["Reached maximum budget ($".concat(maxBudgetUsd, ")")],
                                        })];
                                    case 50: return [4 /*yield*/, _13.sent()];
                                    case 51:
                                        _13.sent();
                                        _10 = {};
                                        return [4 /*yield*/, __await(void 0)];
                                    case 52: return [2 /*return*/, (_10.value = _13.sent(), _10)];
                                    case 53:
                                        if (!(message.type === 'user' && jsonSchema)) return [3 /*break*/, 59];
                                        currentCalls = (0, messages_js_1.countToolCalls)(this_1.mutableMessages, SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME);
                                        callsThisQuery = currentCalls - initialStructuredOutputCalls;
                                        maxRetries = parseInt(process.env.MAX_STRUCTURED_OUTPUT_RETRIES || '5', 10);
                                        if (!(callsThisQuery >= maxRetries)) return [3 /*break*/, 59];
                                        if (!persistSession) return [3 /*break*/, 55];
                                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EAGER_FLUSH) ||
                                            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IS_COWORK))) return [3 /*break*/, 55];
                                        return [4 /*yield*/, __await((0, sessionStorage_js_1.flushSessionStorage)())];
                                    case 54:
                                        _13.sent();
                                        _13.label = 55;
                                    case 55: return [4 /*yield*/, __await({
                                            type: 'result',
                                            subtype: 'error_max_structured_output_retries',
                                            duration_ms: Date.now() - startTime,
                                            duration_api_ms: (0, cost_tracker_js_1.getTotalAPIDuration)(),
                                            is_error: true,
                                            num_turns: turnCount,
                                            stop_reason: lastStopReason,
                                            session_id: (0, state_js_1.getSessionId)(),
                                            total_cost_usd: (0, cost_tracker_js_1.getTotalCost)(),
                                            usage: this_1.totalUsage,
                                            modelUsage: (0, cost_tracker_js_1.getModelUsage)(),
                                            permission_denials: this_1.permissionDenials,
                                            fast_mode_state: (0, fastMode_js_1.getFastModeState)(mainLoopModel, initialAppState.fastMode),
                                            uuid: (0, crypto_1.randomUUID)(),
                                            errors: [
                                                "Failed to provide valid structured output after ".concat(maxRetries, " attempts"),
                                            ],
                                        })];
                                    case 56: return [4 /*yield*/, _13.sent()];
                                    case 57:
                                        _13.sent();
                                        _11 = {};
                                        return [4 /*yield*/, __await(void 0)];
                                    case 58: return [2 /*return*/, (_11.value = _13.sent(), _11)];
                                    case 59: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _o = true, _p = __asyncValues((0, query_js_1.query)({
                            messages: messages,
                            systemPrompt: systemPrompt,
                            userContext: userContext,
                            systemContext: systemContext,
                            canUseTool: wrappedCanUseTool,
                            toolUseContext: processUserInputContext,
                            fallbackModel: fallbackModel,
                            querySource: 'sdk',
                            maxTurns: maxTurns,
                            taskBudget: taskBudget,
                        }));
                        _6.label = 46;
                    case 46: return [4 /*yield*/, __await(_p.next())];
                    case 47:
                        if (!(_q = _6.sent(), _v = _q.done, !_v)) return [3 /*break*/, 50];
                        return [5 /*yield**/, _loop_1()];
                    case 48:
                        state_1 = _6.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _6.label = 49;
                    case 49:
                        _o = true;
                        return [3 /*break*/, 46];
                    case 50: return [3 /*break*/, 57];
                    case 51:
                        e_2_1 = _6.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 57];
                    case 52:
                        _6.trys.push([52, , 55, 56]);
                        if (!(!_o && !_v && (_w = _p.return))) return [3 /*break*/, 54];
                        return [4 /*yield*/, __await(_w.call(_p))];
                    case 53:
                        _6.sent();
                        _6.label = 54;
                    case 54: return [3 /*break*/, 56];
                    case 55:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 56: return [7 /*endfinally*/];
                    case 57:
                        result = messages.findLast(function (m) { return m.type === 'assistant' || m.type === 'user'; });
                        edeResultType = (_3 = result === null || result === void 0 ? void 0 : result.type) !== null && _3 !== void 0 ? _3 : 'undefined';
                        edeLastContentType = (result === null || result === void 0 ? void 0 : result.type) === 'assistant'
                            ? ((_5 = (_4 = (0, last_js_1.default)(result.message.content)) === null || _4 === void 0 ? void 0 : _4.type) !== null && _5 !== void 0 ? _5 : 'none')
                            : 'n/a';
                        if (!persistSession) return [3 /*break*/, 59];
                        if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EAGER_FLUSH) ||
                            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_IS_COWORK))) return [3 /*break*/, 59];
                        return [4 /*yield*/, __await((0, sessionStorage_js_1.flushSessionStorage)())];
                    case 58:
                        _6.sent();
                        _6.label = 59;
                    case 59:
                        if (!!(0, queryHelpers_js_1.isResultSuccessful)(result, lastStopReason)) return [3 /*break*/, 63];
                        return [4 /*yield*/, __await({
                                type: 'result',
                                subtype: 'error_during_execution',
                                duration_ms: Date.now() - startTime,
                                duration_api_ms: (0, cost_tracker_js_1.getTotalAPIDuration)(),
                                is_error: true,
                                num_turns: turnCount,
                                stop_reason: lastStopReason,
                                session_id: (0, state_js_1.getSessionId)(),
                                total_cost_usd: (0, cost_tracker_js_1.getTotalCost)(),
                                usage: this.totalUsage,
                                modelUsage: (0, cost_tracker_js_1.getModelUsage)(),
                                permission_denials: this.permissionDenials,
                                fast_mode_state: (0, fastMode_js_1.getFastModeState)(mainLoopModel, initialAppState.fastMode),
                                uuid: (0, crypto_1.randomUUID)(),
                                // Diagnostic prefix: these are what isResultSuccessful() checks — if
                                // the result type isn't assistant-with-text/thinking or user-with-
                                // tool_result, and stop_reason isn't end_turn, that's why this fired.
                                // errors[] is turn-scoped via the watermark; previously it dumped the
                                // entire process's logError buffer (ripgrep timeouts, ENOENT, etc).
                                errors: (function () {
                                    var all = (0, log_js_1.getInMemoryErrors)();
                                    var start = errorLogWatermark
                                        ? all.lastIndexOf(errorLogWatermark) + 1
                                        : 0;
                                    return __spreadArray([
                                        "[ede_diagnostic] result_type=".concat(edeResultType, " last_content_type=").concat(edeLastContentType, " stop_reason=").concat(lastStopReason)
                                    ], all.slice(start).map(function (_) { return _.error; }), true);
                                })(),
                            })];
                    case 60: return [4 /*yield*/, _6.sent()];
                    case 61:
                        _6.sent();
                        return [4 /*yield*/, __await(void 0)];
                    case 62: return [2 /*return*/, _6.sent()];
                    case 63:
                        textResult = '';
                        isApiError = false;
                        if (result.type === 'assistant') {
                            lastContent = (0, last_js_1.default)(result.message.content);
                            if ((lastContent === null || lastContent === void 0 ? void 0 : lastContent.type) === 'text' &&
                                !messages_js_1.SYNTHETIC_MESSAGES.has(lastContent.text)) {
                                textResult = lastContent.text;
                            }
                            isApiError = Boolean(result.isApiErrorMessage);
                        }
                        return [4 /*yield*/, __await({
                                type: 'result',
                                subtype: 'success',
                                is_error: isApiError,
                                duration_ms: Date.now() - startTime,
                                duration_api_ms: (0, cost_tracker_js_1.getTotalAPIDuration)(),
                                num_turns: turnCount,
                                result: textResult,
                                stop_reason: lastStopReason,
                                session_id: (0, state_js_1.getSessionId)(),
                                total_cost_usd: (0, cost_tracker_js_1.getTotalCost)(),
                                usage: this.totalUsage,
                                modelUsage: (0, cost_tracker_js_1.getModelUsage)(),
                                permission_denials: this.permissionDenials,
                                structured_output: structuredOutputFromTool,
                                fast_mode_state: (0, fastMode_js_1.getFastModeState)(mainLoopModel, initialAppState.fastMode),
                                uuid: (0, crypto_1.randomUUID)(),
                            })];
                    case 64: return [4 /*yield*/, _6.sent()];
                    case 65:
                        _6.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    QueryEngine.prototype.interrupt = function () {
        this.abortController.abort();
    };
    QueryEngine.prototype.getMessages = function () {
        return this.mutableMessages;
    };
    QueryEngine.prototype.getReadFileState = function () {
        return this.readFileState;
    };
    QueryEngine.prototype.getSessionId = function () {
        return (0, state_js_1.getSessionId)();
    };
    QueryEngine.prototype.setModel = function (model) {
        this.config.userSpecifiedModel = model;
    };
    return QueryEngine;
}());
exports.QueryEngine = QueryEngine;
/**
 * Sends a single prompt to the Claude API and returns the response.
 * Assumes that claude is being used non-interactively -- will not
 * ask the user for permissions or further input.
 *
 * Convenience wrapper around QueryEngine for one-shot usage.
 */
function ask(_a) {
    return __asyncGenerator(this, arguments, function ask_1(_b) {
        var engine;
        var commands = _b.commands, prompt = _b.prompt, promptUuid = _b.promptUuid, isMeta = _b.isMeta, cwd = _b.cwd, tools = _b.tools, mcpClients = _b.mcpClients, _c = _b.verbose, verbose = _c === void 0 ? false : _c, thinkingConfig = _b.thinkingConfig, maxTurns = _b.maxTurns, maxBudgetUsd = _b.maxBudgetUsd, taskBudget = _b.taskBudget, canUseTool = _b.canUseTool, _d = _b.mutableMessages, mutableMessages = _d === void 0 ? [] : _d, getReadFileCache = _b.getReadFileCache, setReadFileCache = _b.setReadFileCache, customSystemPrompt = _b.customSystemPrompt, appendSystemPrompt = _b.appendSystemPrompt, userSpecifiedModel = _b.userSpecifiedModel, fallbackModel = _b.fallbackModel, jsonSchema = _b.jsonSchema, getAppState = _b.getAppState, setAppState = _b.setAppState, abortController = _b.abortController, _e = _b.replayUserMessages, replayUserMessages = _e === void 0 ? false : _e, _f = _b.includePartialMessages, includePartialMessages = _f === void 0 ? false : _f, handleElicitation = _b.handleElicitation, _g = _b.agents, agents = _g === void 0 ? [] : _g, setSDKStatus = _b.setSDKStatus, orphanedPermission = _b.orphanedPermission;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    engine = new QueryEngine(__assign({ cwd: cwd, tools: tools, commands: commands, mcpClients: mcpClients, agents: agents, canUseTool: canUseTool, getAppState: getAppState, setAppState: setAppState, initialMessages: mutableMessages, readFileCache: (0, fileStateCache_js_1.cloneFileStateCache)(getReadFileCache()), customSystemPrompt: customSystemPrompt, appendSystemPrompt: appendSystemPrompt, userSpecifiedModel: userSpecifiedModel, fallbackModel: fallbackModel, thinkingConfig: thinkingConfig, maxTurns: maxTurns, maxBudgetUsd: maxBudgetUsd, taskBudget: taskBudget, jsonSchema: jsonSchema, verbose: verbose, handleElicitation: handleElicitation, replayUserMessages: replayUserMessages, includePartialMessages: includePartialMessages, setSDKStatus: setSDKStatus, abortController: abortController, orphanedPermission: orphanedPermission }, ((0, bun_bundle_1.feature)('HISTORY_SNIP')
                        ? {
                            snipReplay: function (yielded, store) {
                                if (!snipProjection.isSnipBoundaryMessage(yielded))
                                    return undefined;
                                return snipModule.snipCompactIfNeeded(store, { force: true });
                            },
                        }
                        : {})));
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, , 4, 5]);
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(engine.submitMessage(prompt, {
                            uuid: promptUuid,
                            isMeta: isMeta,
                        }))))];
                case 2: return [4 /*yield*/, __await.apply(void 0, [_h.sent()])];
                case 3:
                    _h.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setReadFileCache(engine.getReadFileState());
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
