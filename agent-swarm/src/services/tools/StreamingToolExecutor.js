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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingToolExecutor = void 0;
var messages_js_1 = require("src/utils/messages.js");
var Tool_js_1 = require("../../Tool.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var abortController_js_1 = require("../../utils/abortController.js");
var toolExecution_js_1 = require("./toolExecution.js");
/**
 * Executes tools as they stream in with concurrency control.
 * - Concurrent-safe tools can execute in parallel with other concurrent-safe tools
 * - Non-concurrent tools must execute alone (exclusive access)
 * - Results are buffered and emitted in the order tools were received
 */
var StreamingToolExecutor = /** @class */ (function () {
    function StreamingToolExecutor(toolDefinitions, canUseTool, toolUseContext) {
        this.toolDefinitions = toolDefinitions;
        this.canUseTool = canUseTool;
        this.tools = [];
        this.hasErrored = false;
        this.erroredToolDescription = '';
        this.discarded = false;
        this.toolUseContext = toolUseContext;
        this.siblingAbortController = (0, abortController_js_1.createChildAbortController)(toolUseContext.abortController);
    }
    /**
     * Discards all pending and in-progress tools. Called when streaming fallback
     * occurs and results from the failed attempt should be abandoned.
     * Queued tools won't start, and in-progress tools will receive synthetic errors.
     */
    StreamingToolExecutor.prototype.discard = function () {
        this.discarded = true;
    };
    /**
     * Add a tool to the execution queue. Will start executing immediately if conditions allow.
     */
    StreamingToolExecutor.prototype.addTool = function (block, assistantMessage) {
        var toolDefinition = (0, Tool_js_1.findToolByName)(this.toolDefinitions, block.name);
        if (!toolDefinition) {
            this.tools.push({
                id: block.id,
                block: block,
                assistantMessage: assistantMessage,
                status: 'completed',
                isConcurrencySafe: true,
                pendingProgress: [],
                results: [
                    (0, messages_js_1.createUserMessage)({
                        content: [
                            {
                                type: 'tool_result',
                                content: "<tool_use_error>Error: No such tool available: ".concat(block.name, "</tool_use_error>"),
                                is_error: true,
                                tool_use_id: block.id,
                            },
                        ],
                        toolUseResult: "Error: No such tool available: ".concat(block.name),
                        sourceToolAssistantUUID: assistantMessage.uuid,
                    }),
                ],
            });
            return;
        }
        var parsedInput = toolDefinition.inputSchema.safeParse(block.input);
        var isConcurrencySafe = (parsedInput === null || parsedInput === void 0 ? void 0 : parsedInput.success)
            ? (function () {
                try {
                    return Boolean(toolDefinition.isConcurrencySafe(parsedInput.data));
                }
                catch (_a) {
                    return false;
                }
            })()
            : false;
        this.tools.push({
            id: block.id,
            block: block,
            assistantMessage: assistantMessage,
            status: 'queued',
            isConcurrencySafe: isConcurrencySafe,
            pendingProgress: [],
        });
        void this.processQueue();
    };
    /**
     * Check if a tool can execute based on current concurrency state
     */
    StreamingToolExecutor.prototype.canExecuteTool = function (isConcurrencySafe) {
        var executingTools = this.tools.filter(function (t) { return t.status === 'executing'; });
        return (executingTools.length === 0 ||
            (isConcurrencySafe && executingTools.every(function (t) { return t.isConcurrencySafe; })));
    };
    /**
     * Process the queue, starting tools when concurrency conditions allow
     */
    StreamingToolExecutor.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, tool;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.tools;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        tool = _a[_i];
                        if (tool.status !== 'queued')
                            return [3 /*break*/, 4];
                        if (!this.canExecuteTool(tool.isConcurrencySafe)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.executeTool(tool)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        // Can't execute this tool yet, and since we need to maintain order for non-concurrent tools, stop here
                        if (!tool.isConcurrencySafe)
                            return [3 /*break*/, 5];
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    StreamingToolExecutor.prototype.createSyntheticErrorMessage = function (toolUseId, reason, assistantMessage) {
        // For user interruptions (ESC to reject), use REJECT_MESSAGE so the UI shows
        // "User rejected edit" instead of "Error editing file"
        if (reason === 'user_interrupted') {
            return (0, messages_js_1.createUserMessage)({
                content: [
                    {
                        type: 'tool_result',
                        content: (0, messages_js_1.withMemoryCorrectionHint)(messages_js_1.REJECT_MESSAGE),
                        is_error: true,
                        tool_use_id: toolUseId,
                    },
                ],
                toolUseResult: 'User rejected tool use',
                sourceToolAssistantUUID: assistantMessage.uuid,
            });
        }
        if (reason === 'streaming_fallback') {
            return (0, messages_js_1.createUserMessage)({
                content: [
                    {
                        type: 'tool_result',
                        content: '<tool_use_error>Error: Streaming fallback - tool execution discarded</tool_use_error>',
                        is_error: true,
                        tool_use_id: toolUseId,
                    },
                ],
                toolUseResult: 'Streaming fallback - tool execution discarded',
                sourceToolAssistantUUID: assistantMessage.uuid,
            });
        }
        var desc = this.erroredToolDescription;
        var msg = desc
            ? "Cancelled: parallel tool call ".concat(desc, " errored")
            : 'Cancelled: parallel tool call errored';
        return (0, messages_js_1.createUserMessage)({
            content: [
                {
                    type: 'tool_result',
                    content: "<tool_use_error>".concat(msg, "</tool_use_error>"),
                    is_error: true,
                    tool_use_id: toolUseId,
                },
            ],
            toolUseResult: msg,
            sourceToolAssistantUUID: assistantMessage.uuid,
        });
    };
    /**
     * Determine why a tool should be cancelled.
     */
    StreamingToolExecutor.prototype.getAbortReason = function (tool) {
        if (this.discarded) {
            return 'streaming_fallback';
        }
        if (this.hasErrored) {
            return 'sibling_error';
        }
        if (this.toolUseContext.abortController.signal.aborted) {
            // 'interrupt' means the user typed a new message while tools were
            // running. Only cancel tools whose interruptBehavior is 'cancel';
            // 'block' tools shouldn't reach here (abort isn't fired).
            if (this.toolUseContext.abortController.signal.reason === 'interrupt') {
                return this.getToolInterruptBehavior(tool) === 'cancel'
                    ? 'user_interrupted'
                    : null;
            }
            return 'user_interrupted';
        }
        return null;
    };
    StreamingToolExecutor.prototype.getToolInterruptBehavior = function (tool) {
        var definition = (0, Tool_js_1.findToolByName)(this.toolDefinitions, tool.block.name);
        if (!(definition === null || definition === void 0 ? void 0 : definition.interruptBehavior))
            return 'block';
        try {
            return definition.interruptBehavior();
        }
        catch (_a) {
            return 'block';
        }
    };
    StreamingToolExecutor.prototype.getToolDescription = function (tool) {
        var _a, _b, _c;
        var input = tool.block.input;
        var summary = (_c = (_b = (_a = input === null || input === void 0 ? void 0 : input.command) !== null && _a !== void 0 ? _a : input === null || input === void 0 ? void 0 : input.file_path) !== null && _b !== void 0 ? _b : input === null || input === void 0 ? void 0 : input.pattern) !== null && _c !== void 0 ? _c : '';
        if (typeof summary === 'string' && summary.length > 0) {
            var truncated = summary.length > 40 ? summary.slice(0, 40) + '\u2026' : summary;
            return "".concat(tool.block.name, "(").concat(truncated, ")");
        }
        return tool.block.name;
    };
    StreamingToolExecutor.prototype.updateInterruptibleState = function () {
        var _this = this;
        var _a, _b;
        var executing = this.tools.filter(function (t) { return t.status === 'executing'; });
        (_b = (_a = this.toolUseContext).setHasInterruptibleToolInProgress) === null || _b === void 0 ? void 0 : _b.call(_a, executing.length > 0 &&
            executing.every(function (t) { return _this.getToolInterruptBehavior(t) === 'cancel'; }));
    };
    /**
     * Execute a tool and collect its results
     */
    StreamingToolExecutor.prototype.executeTool = function (tool) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, contextModifiers, collectResults, promise;
            var _this = this;
            return __generator(this, function (_a) {
                tool.status = 'executing';
                this.toolUseContext.setInProgressToolUseIDs(function (prev) {
                    return new Set(prev).add(tool.id);
                });
                this.updateInterruptibleState();
                messages = [];
                contextModifiers = [];
                collectResults = function () { return __awaiter(_this, void 0, void 0, function () {
                    var initialAbortReason, toolAbortController, generator, thisToolErrored, _a, generator_1, generator_1_1, update, abortReason, isErrorResult, e_1_1, _i, contextModifiers_1, modifier;
                    var _this = this;
                    var _b, e_1, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                initialAbortReason = this.getAbortReason(tool);
                                if (initialAbortReason) {
                                    messages.push(this.createSyntheticErrorMessage(tool.id, initialAbortReason, tool.assistantMessage));
                                    tool.results = messages;
                                    tool.contextModifiers = contextModifiers;
                                    tool.status = 'completed';
                                    this.updateInterruptibleState();
                                    return [2 /*return*/];
                                }
                                toolAbortController = (0, abortController_js_1.createChildAbortController)(this.siblingAbortController);
                                toolAbortController.signal.addEventListener('abort', function () {
                                    if (toolAbortController.signal.reason !== 'sibling_error' &&
                                        !_this.toolUseContext.abortController.signal.aborted &&
                                        !_this.discarded) {
                                        _this.toolUseContext.abortController.abort(toolAbortController.signal.reason);
                                    }
                                }, { once: true });
                                generator = (0, toolExecution_js_1.runToolUse)(tool.block, tool.assistantMessage, this.canUseTool, __assign(__assign({}, this.toolUseContext), { abortController: toolAbortController }));
                                thisToolErrored = false;
                                _e.label = 1;
                            case 1:
                                _e.trys.push([1, 6, 7, 12]);
                                _a = true, generator_1 = __asyncValues(generator);
                                _e.label = 2;
                            case 2: return [4 /*yield*/, generator_1.next()];
                            case 3:
                                if (!(generator_1_1 = _e.sent(), _b = generator_1_1.done, !_b)) return [3 /*break*/, 5];
                                _d = generator_1_1.value;
                                _a = false;
                                update = _d;
                                abortReason = this.getAbortReason(tool);
                                if (abortReason && !thisToolErrored) {
                                    messages.push(this.createSyntheticErrorMessage(tool.id, abortReason, tool.assistantMessage));
                                    return [3 /*break*/, 5];
                                }
                                isErrorResult = update.message.type === 'user' &&
                                    Array.isArray(update.message.message.content) &&
                                    update.message.message.content.some(function (_) { return _.type === 'tool_result' && _.is_error === true; });
                                if (isErrorResult) {
                                    thisToolErrored = true;
                                    // Only Bash errors cancel siblings. Bash commands often have implicit
                                    // dependency chains (e.g. mkdir fails → subsequent commands pointless).
                                    // Read/WebFetch/etc are independent — one failure shouldn't nuke the rest.
                                    if (tool.block.name === toolName_js_1.BASH_TOOL_NAME) {
                                        this.hasErrored = true;
                                        this.erroredToolDescription = this.getToolDescription(tool);
                                        this.siblingAbortController.abort('sibling_error');
                                    }
                                }
                                if (update.message) {
                                    // Progress messages go to pendingProgress for immediate yielding
                                    if (update.message.type === 'progress') {
                                        tool.pendingProgress.push(update.message);
                                        // Signal that progress is available
                                        if (this.progressAvailableResolve) {
                                            this.progressAvailableResolve();
                                            this.progressAvailableResolve = undefined;
                                        }
                                    }
                                    else {
                                        messages.push(update.message);
                                    }
                                }
                                if (update.contextModifier) {
                                    contextModifiers.push(update.contextModifier.modifyContext);
                                }
                                _e.label = 4;
                            case 4:
                                _a = true;
                                return [3 /*break*/, 2];
                            case 5: return [3 /*break*/, 12];
                            case 6:
                                e_1_1 = _e.sent();
                                e_1 = { error: e_1_1 };
                                return [3 /*break*/, 12];
                            case 7:
                                _e.trys.push([7, , 10, 11]);
                                if (!(!_a && !_b && (_c = generator_1.return))) return [3 /*break*/, 9];
                                return [4 /*yield*/, _c.call(generator_1)];
                            case 8:
                                _e.sent();
                                _e.label = 9;
                            case 9: return [3 /*break*/, 11];
                            case 10:
                                if (e_1) throw e_1.error;
                                return [7 /*endfinally*/];
                            case 11: return [7 /*endfinally*/];
                            case 12:
                                tool.results = messages;
                                tool.contextModifiers = contextModifiers;
                                tool.status = 'completed';
                                this.updateInterruptibleState();
                                // NOTE: we currently don't support context modifiers for concurrent
                                //       tools. None are actively being used, but if we want to use
                                //       them in concurrent tools, we need to support that here.
                                if (!tool.isConcurrencySafe && contextModifiers.length > 0) {
                                    for (_i = 0, contextModifiers_1 = contextModifiers; _i < contextModifiers_1.length; _i++) {
                                        modifier = contextModifiers_1[_i];
                                        this.toolUseContext = modifier(this.toolUseContext);
                                    }
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                promise = collectResults();
                tool.promise = promise;
                // Process more queue when done
                void promise.finally(function () {
                    void _this.processQueue();
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get any completed results that haven't been yielded yet (non-blocking)
     * Maintains order where necessary
     * Also yields any pending progress messages immediately
     */
    StreamingToolExecutor.prototype.getCompletedResults = function () {
        var _i, _a, tool, progressMessage, _b, _c, message;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (this.discarded) {
                        return [2 /*return*/];
                    }
                    _i = 0, _a = this.tools;
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    tool = _a[_i];
                    _d.label = 2;
                case 2:
                    if (!(tool.pendingProgress.length > 0)) return [3 /*break*/, 4];
                    progressMessage = tool.pendingProgress.shift();
                    return [4 /*yield*/, { message: progressMessage, newContext: this.toolUseContext }];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 2];
                case 4:
                    if (tool.status === 'yielded') {
                        return [3 /*break*/, 10];
                    }
                    if (!(tool.status === 'completed' && tool.results)) return [3 /*break*/, 9];
                    tool.status = 'yielded';
                    _b = 0, _c = tool.results;
                    _d.label = 5;
                case 5:
                    if (!(_b < _c.length)) return [3 /*break*/, 8];
                    message = _c[_b];
                    return [4 /*yield*/, { message: message, newContext: this.toolUseContext }];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    _b++;
                    return [3 /*break*/, 5];
                case 8:
                    markToolUseAsComplete(this.toolUseContext, tool.id);
                    return [3 /*break*/, 10];
                case 9:
                    if (tool.status === 'executing' && !tool.isConcurrencySafe) {
                        return [3 /*break*/, 11];
                    }
                    _d.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 1];
                case 11: return [2 /*return*/];
            }
        });
    };
    /**
     * Check if any tool has pending progress messages
     */
    StreamingToolExecutor.prototype.hasPendingProgress = function () {
        return this.tools.some(function (t) { return t.pendingProgress.length > 0; });
    };
    /**
     * Wait for remaining tools and yield their results as they complete
     * Also yields progress messages as they become available
     */
    StreamingToolExecutor.prototype.getRemainingResults = function () {
        return __asyncGenerator(this, arguments, function getRemainingResults_1() {
            var _i, _a, result, executingPromises, progressPromise, _b, _c, result;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.discarded) return [3 /*break*/, 2];
                        return [4 /*yield*/, __await(void 0)];
                    case 1: return [2 /*return*/, _d.sent()];
                    case 2:
                        if (!this.hasUnfinishedTools()) return [3 /*break*/, 11];
                        return [4 /*yield*/, __await(this.processQueue())];
                    case 3:
                        _d.sent();
                        _i = 0, _a = this.getCompletedResults();
                        _d.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        result = _a[_i];
                        return [4 /*yield*/, __await(result)];
                    case 5: return [4 /*yield*/, _d.sent()];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 4];
                    case 8:
                        if (!(this.hasExecutingTools() &&
                            !this.hasCompletedResults() &&
                            !this.hasPendingProgress())) return [3 /*break*/, 10];
                        executingPromises = this.tools
                            .filter(function (t) { return t.status === 'executing' && t.promise; })
                            .map(function (t) { return t.promise; });
                        progressPromise = new Promise(function (resolve) {
                            _this.progressAvailableResolve = resolve;
                        });
                        if (!(executingPromises.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, __await(Promise.race(__spreadArray(__spreadArray([], executingPromises, true), [progressPromise], false)))];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10: return [3 /*break*/, 2];
                    case 11:
                        _b = 0, _c = this.getCompletedResults();
                        _d.label = 12;
                    case 12:
                        if (!(_b < _c.length)) return [3 /*break*/, 16];
                        result = _c[_b];
                        return [4 /*yield*/, __await(result)];
                    case 13: return [4 /*yield*/, _d.sent()];
                    case 14:
                        _d.sent();
                        _d.label = 15;
                    case 15:
                        _b++;
                        return [3 /*break*/, 12];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if there are any completed results ready to yield
     */
    StreamingToolExecutor.prototype.hasCompletedResults = function () {
        return this.tools.some(function (t) { return t.status === 'completed'; });
    };
    /**
     * Check if there are any tools still executing
     */
    StreamingToolExecutor.prototype.hasExecutingTools = function () {
        return this.tools.some(function (t) { return t.status === 'executing'; });
    };
    /**
     * Check if there are any unfinished tools
     */
    StreamingToolExecutor.prototype.hasUnfinishedTools = function () {
        return this.tools.some(function (t) { return t.status !== 'yielded'; });
    };
    /**
     * Get the current tool use context (may have been modified by context modifiers)
     */
    StreamingToolExecutor.prototype.getUpdatedContext = function () {
        return this.toolUseContext;
    };
    return StreamingToolExecutor;
}());
exports.StreamingToolExecutor = StreamingToolExecutor;
function markToolUseAsComplete(toolUseContext, toolUseID) {
    toolUseContext.setInProgressToolUseIDs(function (prev) {
        var next = new Set(prev);
        next.delete(toolUseID);
        return next;
    });
}
