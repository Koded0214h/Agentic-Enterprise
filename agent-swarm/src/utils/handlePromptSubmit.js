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
exports.handlePromptSubmit = handlePromptSubmit;
var index_js_1 = require("src/services/analytics/index.js");
var commands_js_1 = require("../commands.js");
var MessageSelector_js_1 = require("../components/MessageSelector.js");
var history_js_1 = require("../history.js");
var textInputTypes_js_1 = require("../types/textInputTypes.js");
var abortController_js_1 = require("./abortController.js");
var debug_js_1 = require("./debug.js");
var fileHistory_js_1 = require("./fileHistory.js");
var gracefulShutdown_js_1 = require("./gracefulShutdown.js");
var messageQueueManager_js_1 = require("./messageQueueManager.js");
var model_js_1 = require("./model/model.js");
var processUserInput_js_1 = require("./processUserInput/processUserInput.js");
var queryProfiler_js_1 = require("./queryProfiler.js");
var workloadContext_js_1 = require("./workloadContext.js");
function exit() {
    (0, gracefulShutdown_js_1.gracefulShutdownSync)(0);
}
function handlePromptSubmit(params) {
    return __awaiter(this, void 0, void 0, function () {
        var helpers, queryGuard, _a, isExternalLoading, commands, onInputChange, setPastedContents, setToolJSX, getToolUseContext, messages, mainLoopModel, ideSelection, setUserInputOnProcessing, setAbortController, onQuery, setAppState, onBeforeQuery, canUseTool, queuedCommands, uuid, skipSlashCommands, setCursorOffset, clearBuffer, resetHistory, input, mode, rawPastedContents, referencedIds, pastedContents, hasImages, exitCommand, finalInput, pastedTextRefs, pastedTextCount, pastedTextBytes, trimmedInput, spaceIndex, commandName_1, commandArgs, immediateCommand_1, context, doneWasCalled_1, onDone, impl, jsx, cmd;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    helpers = params.helpers, queryGuard = params.queryGuard, _a = params.isExternalLoading, isExternalLoading = _a === void 0 ? false : _a, commands = params.commands, onInputChange = params.onInputChange, setPastedContents = params.setPastedContents, setToolJSX = params.setToolJSX, getToolUseContext = params.getToolUseContext, messages = params.messages, mainLoopModel = params.mainLoopModel, ideSelection = params.ideSelection, setUserInputOnProcessing = params.setUserInputOnProcessing, setAbortController = params.setAbortController, onQuery = params.onQuery, setAppState = params.setAppState, onBeforeQuery = params.onBeforeQuery, canUseTool = params.canUseTool, queuedCommands = params.queuedCommands, uuid = params.uuid, skipSlashCommands = params.skipSlashCommands;
                    setCursorOffset = helpers.setCursorOffset, clearBuffer = helpers.clearBuffer, resetHistory = helpers.resetHistory;
                    if (!(queuedCommands === null || queuedCommands === void 0 ? void 0 : queuedCommands.length)) return [3 /*break*/, 2];
                    (0, queryProfiler_js_1.startQueryProfile)();
                    return [4 /*yield*/, executeUserInput({
                            queuedCommands: queuedCommands,
                            messages: messages,
                            mainLoopModel: mainLoopModel,
                            ideSelection: ideSelection,
                            querySource: params.querySource,
                            commands: commands,
                            queryGuard: queryGuard,
                            setToolJSX: setToolJSX,
                            getToolUseContext: getToolUseContext,
                            setUserInputOnProcessing: setUserInputOnProcessing,
                            setAbortController: setAbortController,
                            onQuery: onQuery,
                            setAppState: setAppState,
                            onBeforeQuery: onBeforeQuery,
                            resetHistory: resetHistory,
                            canUseTool: canUseTool,
                            onInputChange: onInputChange,
                        })];
                case 1:
                    _f.sent();
                    return [2 /*return*/];
                case 2:
                    input = (_b = params.input) !== null && _b !== void 0 ? _b : '';
                    mode = (_c = params.mode) !== null && _c !== void 0 ? _c : 'prompt';
                    rawPastedContents = (_d = params.pastedContents) !== null && _d !== void 0 ? _d : {};
                    referencedIds = new Set((0, history_js_1.parseReferences)(input).map(function (r) { return r.id; }));
                    pastedContents = Object.fromEntries(Object.entries(rawPastedContents).filter(function (_a) {
                        var c = _a[1];
                        return c.type !== 'image' || referencedIds.has(c.id);
                    }));
                    hasImages = Object.values(pastedContents).some(textInputTypes_js_1.isValidImagePaste);
                    if (input.trim() === '') {
                        return [2 /*return*/];
                    }
                    // Handle exit commands by triggering the exit command instead of direct process.exit
                    // Skip for remote bridge messages — "exit" typed on iOS shouldn't kill the local session
                    if (!skipSlashCommands &&
                        ['exit', 'quit', ':q', ':q!', ':wq', ':wq!'].includes(input.trim())) {
                        exitCommand = commands.find(function (cmd) { return cmd.name === 'exit'; });
                        if (exitCommand) {
                            // Submit the /exit command instead - recursive call needs to be handled
                            void handlePromptSubmit(__assign(__assign({}, params), { input: '/exit' }));
                        }
                        else {
                            // Fallback to direct exit if exit command not found
                            exit();
                        }
                        return [2 /*return*/];
                    }
                    finalInput = (0, history_js_1.expandPastedTextRefs)(input, pastedContents);
                    pastedTextRefs = (0, history_js_1.parseReferences)(input).filter(function (r) { var _a; return ((_a = pastedContents[r.id]) === null || _a === void 0 ? void 0 : _a.type) === 'text'; });
                    pastedTextCount = pastedTextRefs.length;
                    pastedTextBytes = pastedTextRefs.reduce(function (sum, r) { var _a, _b; return sum + ((_b = (_a = pastedContents[r.id]) === null || _a === void 0 ? void 0 : _a.content.length) !== null && _b !== void 0 ? _b : 0); }, 0);
                    (0, index_js_1.logEvent)('tengu_paste_text', { pastedTextCount: pastedTextCount, pastedTextBytes: pastedTextBytes });
                    if (!(!skipSlashCommands && finalInput.trim().startsWith('/'))) return [3 /*break*/, 5];
                    trimmedInput = finalInput.trim();
                    spaceIndex = trimmedInput.indexOf(' ');
                    commandName_1 = spaceIndex === -1
                        ? trimmedInput.slice(1)
                        : trimmedInput.slice(1, spaceIndex);
                    commandArgs = spaceIndex === -1 ? '' : trimmedInput.slice(spaceIndex + 1).trim();
                    immediateCommand_1 = commands.find(function (cmd) {
                        var _a;
                        return cmd.immediate &&
                            (0, commands_js_1.isCommandEnabled)(cmd) &&
                            (cmd.name === commandName_1 ||
                                ((_a = cmd.aliases) === null || _a === void 0 ? void 0 : _a.includes(commandName_1)) ||
                                (0, commands_js_1.getCommandName)(cmd) === commandName_1);
                    });
                    if (!(immediateCommand_1 &&
                        immediateCommand_1.type === 'local-jsx' &&
                        (queryGuard.isActive || isExternalLoading))) return [3 /*break*/, 5];
                    (0, index_js_1.logEvent)('tengu_immediate_command_executed', {
                        commandName: immediateCommand_1.name,
                    });
                    // Clear input
                    onInputChange('');
                    setCursorOffset(0);
                    setPastedContents({});
                    clearBuffer();
                    context = getToolUseContext(messages, [], (0, abortController_js_1.createAbortController)(), mainLoopModel);
                    doneWasCalled_1 = false;
                    onDone = function (result, options) {
                        doneWasCalled_1 = true;
                        // Use clearLocalJSX to explicitly clear the local JSX command
                        setToolJSX({
                            jsx: null,
                            shouldHidePromptInput: false,
                            clearLocalJSX: true,
                        });
                        if (result && (options === null || options === void 0 ? void 0 : options.display) !== 'skip' && params.addNotification) {
                            params.addNotification({
                                key: "immediate-".concat(immediateCommand_1.name),
                                text: result,
                                priority: 'immediate',
                            });
                        }
                        if (options === null || options === void 0 ? void 0 : options.nextInput) {
                            if (options.submitNextInput) {
                                (0, messageQueueManager_js_1.enqueue)({ value: options.nextInput, mode: 'prompt' });
                            }
                            else {
                                onInputChange(options.nextInput);
                            }
                        }
                    };
                    return [4 /*yield*/, immediateCommand_1.load()];
                case 3:
                    impl = _f.sent();
                    return [4 /*yield*/, impl.call(onDone, context, commandArgs)
                        // Skip if onDone already fired — prevents stuck isLocalJSXCommand
                        // (see processSlashCommand.tsx local-jsx case for full mechanism).
                    ];
                case 4:
                    jsx = _f.sent();
                    // Skip if onDone already fired — prevents stuck isLocalJSXCommand
                    // (see processSlashCommand.tsx local-jsx case for full mechanism).
                    if (jsx && !doneWasCalled_1) {
                        setToolJSX({
                            jsx: jsx,
                            shouldHidePromptInput: false,
                            isLocalJSXCommand: true,
                            isImmediate: true,
                        });
                    }
                    return [2 /*return*/];
                case 5:
                    if (queryGuard.isActive || isExternalLoading) {
                        // Only allow prompt and bash mode commands to be queued
                        if (mode !== 'prompt' && mode !== 'bash') {
                            return [2 /*return*/];
                        }
                        // Interrupt the current turn when all executing tools have
                        // interruptBehavior 'cancel' (e.g. SleepTool).
                        if (params.hasInterruptibleToolInProgress) {
                            (0, debug_js_1.logForDebugging)("[interrupt] Aborting current turn: streamMode=".concat(params.streamMode));
                            (0, index_js_1.logEvent)('tengu_cancel', {
                                source: 'interrupt_on_submit',
                                streamMode: params.streamMode,
                            });
                            (_e = params.abortController) === null || _e === void 0 ? void 0 : _e.abort('interrupt');
                        }
                        // Enqueue with string value + raw pastedContents. Images will be resized
                        // at execution time when processUserInput runs (not baked in here).
                        (0, messageQueueManager_js_1.enqueue)({
                            value: finalInput.trim(),
                            preExpansionValue: input.trim(),
                            mode: mode,
                            pastedContents: hasImages ? pastedContents : undefined,
                            skipSlashCommands: skipSlashCommands,
                            uuid: uuid,
                        });
                        onInputChange('');
                        setCursorOffset(0);
                        setPastedContents({});
                        resetHistory();
                        clearBuffer();
                        return [2 /*return*/];
                    }
                    // Start query profiling for this query
                    (0, queryProfiler_js_1.startQueryProfile)();
                    cmd = {
                        value: finalInput,
                        preExpansionValue: input,
                        mode: mode,
                        pastedContents: hasImages ? pastedContents : undefined,
                        skipSlashCommands: skipSlashCommands,
                        uuid: uuid,
                    };
                    return [4 /*yield*/, executeUserInput({
                            queuedCommands: [cmd],
                            messages: messages,
                            mainLoopModel: mainLoopModel,
                            ideSelection: ideSelection,
                            querySource: params.querySource,
                            commands: commands,
                            queryGuard: queryGuard,
                            setToolJSX: setToolJSX,
                            getToolUseContext: getToolUseContext,
                            setUserInputOnProcessing: setUserInputOnProcessing,
                            setAbortController: setAbortController,
                            onQuery: onQuery,
                            setAppState: setAppState,
                            onBeforeQuery: onBeforeQuery,
                            resetHistory: resetHistory,
                            canUseTool: canUseTool,
                            onInputChange: onInputChange,
                        })];
                case 6:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Core logic for executing user input without UI side effects.
 *
 * All commands arrive as `queuedCommands`. First command gets full treatment
 * (attachments, ideSelection, pastedContents with image resizing). Commands 2-N
 * get `skipAttachments` to avoid duplicating turn-level context.
 */
function executeUserInput(params) {
    return __awaiter(this, void 0, void 0, function () {
        function makeContext() {
            return getToolUseContext(messages, [], abortController, mainLoopModel);
        }
        var messages, mainLoopModel, ideSelection, querySource, queryGuard, setToolJSX, getToolUseContext, setUserInputOnProcessing, setAbortController, onQuery, setAppState, onBeforeQuery, resetHistory, canUseTool, queuedCommands, abortController, newMessages_1, shouldQuery_1, allowedTools_1, model_1, effort_1, nextInput_1, submitNextInput_1, commands_1, firstWorkload_1, turnWorkload;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messages = params.messages, mainLoopModel = params.mainLoopModel, ideSelection = params.ideSelection, querySource = params.querySource, queryGuard = params.queryGuard, setToolJSX = params.setToolJSX, getToolUseContext = params.getToolUseContext, setUserInputOnProcessing = params.setUserInputOnProcessing, setAbortController = params.setAbortController, onQuery = params.onQuery, setAppState = params.setAppState, onBeforeQuery = params.onBeforeQuery, resetHistory = params.resetHistory, canUseTool = params.canUseTool, queuedCommands = params.queuedCommands;
                    abortController = (0, abortController_js_1.createAbortController)();
                    setAbortController(abortController);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 3, 4]);
                    // Reserve the guard BEFORE processUserInput — processBashCommand awaits
                    // BashTool.call() and processSlashCommand awaits getMessagesForSlashCommand,
                    // so the guard must be active during those awaits to ensure concurrent
                    // handlePromptSubmit calls queue (via the isActive check above) instead
                    // of starting a second executeUserInput. This call is a no-op if the
                    // guard is already in dispatching (legacy queue-processor path).
                    queryGuard.reserve();
                    (0, queryProfiler_js_1.queryCheckpoint)('query_process_user_input_start');
                    newMessages_1 = [];
                    shouldQuery_1 = false;
                    commands_1 = queuedCommands !== null && queuedCommands !== void 0 ? queuedCommands : [];
                    firstWorkload_1 = (_a = commands_1[0]) === null || _a === void 0 ? void 0 : _a.workload;
                    turnWorkload = firstWorkload_1 !== undefined &&
                        commands_1.every(function (c) { return c.workload === firstWorkload_1; })
                        ? firstWorkload_1
                        : undefined;
                    // Wrap the entire turn (processUserInput loop + onQuery) in an
                    // AsyncLocalStorage context. This is the ONLY way to correctly
                    // propagate workload across await boundaries: void-detached bg agents
                    // (executeForkedSlashCommand, AgentTool) capture the ALS context at
                    // invocation time, and every await inside them resumes in that
                    // context — isolated from the parent's continuation. A process-global
                    // mutable slot would be clobbered at the detached closure's first
                    // await by this function's synchronous return path. See state.ts.
                    return [4 /*yield*/, (0, workloadContext_js_1.runWithWorkload)(turnWorkload, function () { return __awaiter(_this, void 0, void 0, function () {
                            var i, cmd, isFirst, result, origin_1, _i, _a, m, primaryCmd, primaryMode, primaryInput, shouldCallBeforeQuery;
                            var _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        i = 0;
                                        _d.label = 1;
                                    case 1:
                                        if (!(i < commands_1.length)) return [3 /*break*/, 4];
                                        cmd = commands_1[i];
                                        isFirst = i === 0;
                                        return [4 /*yield*/, (0, processUserInput_js_1.processUserInput)({
                                                input: cmd.value,
                                                preExpansionInput: cmd.preExpansionValue,
                                                mode: cmd.mode,
                                                setToolJSX: setToolJSX,
                                                context: makeContext(),
                                                pastedContents: isFirst ? cmd.pastedContents : undefined,
                                                messages: messages,
                                                setUserInputOnProcessing: isFirst
                                                    ? setUserInputOnProcessing
                                                    : undefined,
                                                isAlreadyProcessing: !isFirst,
                                                querySource: querySource,
                                                canUseTool: canUseTool,
                                                uuid: cmd.uuid,
                                                ideSelection: isFirst ? ideSelection : undefined,
                                                skipSlashCommands: cmd.skipSlashCommands,
                                                bridgeOrigin: cmd.bridgeOrigin,
                                                isMeta: cmd.isMeta,
                                                skipAttachments: !isFirst,
                                            })
                                            // Stamp origin here rather than threading another arg through
                                            // processUserInput → processUserInputBase → processTextPrompt → createUserMessage.
                                            // Derive origin from mode for task-notifications — mirrors the origin
                                            // derivation at messages.ts (case 'queued_command'); intentionally
                                            // does NOT mirror its isMeta:true so idle-dequeued notifications stay
                                            // visible in the transcript via UserAgentNotificationMessage.
                                        ];
                                    case 2:
                                        result = _d.sent();
                                        origin_1 = (_b = cmd.origin) !== null && _b !== void 0 ? _b : (cmd.mode === 'task-notification'
                                            ? { kind: 'task-notification' }
                                            : undefined);
                                        if (origin_1) {
                                            for (_i = 0, _a = result.messages; _i < _a.length; _i++) {
                                                m = _a[_i];
                                                if (m.type === 'user')
                                                    m.origin = origin_1;
                                            }
                                        }
                                        newMessages_1.push.apply(newMessages_1, result.messages);
                                        if (isFirst) {
                                            shouldQuery_1 = result.shouldQuery;
                                            allowedTools_1 = result.allowedTools;
                                            model_1 = result.model;
                                            effort_1 = result.effort;
                                            nextInput_1 = result.nextInput;
                                            submitNextInput_1 = result.submitNextInput;
                                        }
                                        _d.label = 3;
                                    case 3:
                                        i++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        (0, queryProfiler_js_1.queryCheckpoint)('query_process_user_input_end');
                                        if ((0, fileHistory_js_1.fileHistoryEnabled)()) {
                                            (0, queryProfiler_js_1.queryCheckpoint)('query_file_history_snapshot_start');
                                            newMessages_1.filter(MessageSelector_js_1.selectableUserMessagesFilter).forEach(function (message) {
                                                void (0, fileHistory_js_1.fileHistoryMakeSnapshot)(function (updater) {
                                                    setAppState(function (prev) { return (__assign(__assign({}, prev), { fileHistory: updater(prev.fileHistory) })); });
                                                }, message.uuid);
                                            });
                                            (0, queryProfiler_js_1.queryCheckpoint)('query_file_history_snapshot_end');
                                        }
                                        if (!newMessages_1.length) return [3 /*break*/, 6];
                                        // History is now added in the caller (onSubmit) for direct user submissions.
                                        // This ensures queued command processing (notifications, already-queued user input)
                                        // doesn't add to history, since those either shouldn't be in history or were
                                        // already added when originally queued.
                                        resetHistory();
                                        setToolJSX({
                                            jsx: null,
                                            shouldHidePromptInput: false,
                                            clearLocalJSX: true,
                                        });
                                        primaryCmd = commands_1[0];
                                        primaryMode = (_c = primaryCmd === null || primaryCmd === void 0 ? void 0 : primaryCmd.mode) !== null && _c !== void 0 ? _c : 'prompt';
                                        primaryInput = primaryCmd && typeof primaryCmd.value === 'string'
                                            ? primaryCmd.value
                                            : undefined;
                                        shouldCallBeforeQuery = primaryMode === 'prompt';
                                        return [4 /*yield*/, onQuery(newMessages_1, abortController, shouldQuery_1, allowedTools_1 !== null && allowedTools_1 !== void 0 ? allowedTools_1 : [], model_1
                                                ? (0, model_js_1.resolveSkillModelOverride)(model_1, mainLoopModel)
                                                : mainLoopModel, shouldCallBeforeQuery ? onBeforeQuery : undefined, primaryInput, effort_1)];
                                    case 5:
                                        _d.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        // Local slash commands that skip messages (e.g., /model, /theme).
                                        // Release the guard BEFORE clearing toolJSX to prevent spinner flash —
                                        // the spinner formula checks: (!toolJSX || showSpinner) && isLoading.
                                        // If we clear toolJSX while the guard is still reserved, spinner briefly
                                        // shows. The finally below also calls cancelReservation (no-op if idle).
                                        queryGuard.cancelReservation();
                                        setToolJSX({
                                            jsx: null,
                                            shouldHidePromptInput: false,
                                            clearLocalJSX: true,
                                        });
                                        resetHistory();
                                        setAbortController(null);
                                        _d.label = 7;
                                    case 7:
                                        // Handle nextInput from commands that want to chain (e.g., /discover activation)
                                        if (nextInput_1) {
                                            if (submitNextInput_1) {
                                                (0, messageQueueManager_js_1.enqueue)({ value: nextInput_1, mode: 'prompt' });
                                            }
                                            else {
                                                params.onInputChange(nextInput_1);
                                            }
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); })]; // end runWithWorkload — ALS context naturally scoped, no finally needed
                case 2:
                    // Wrap the entire turn (processUserInput loop + onQuery) in an
                    // AsyncLocalStorage context. This is the ONLY way to correctly
                    // propagate workload across await boundaries: void-detached bg agents
                    // (executeForkedSlashCommand, AgentTool) capture the ALS context at
                    // invocation time, and every await inside them resumes in that
                    // context — isolated from the parent's continuation. A process-global
                    // mutable slot would be clobbered at the detached closure's first
                    // await by this function's synchronous return path. See state.ts.
                    _b.sent(); // end runWithWorkload — ALS context naturally scoped, no finally needed
                    return [3 /*break*/, 4];
                case 3:
                    // Safety net: release the guard reservation if processUserInput threw
                    // or onQuery was skipped. No-op if onQuery already ran (guard is idle
                    // via end(), or running — cancelReservation only acts on dispatching).
                    // This is the single source of truth for releasing the reservation;
                    // useQueueProcessor no longer needs its own .finally().
                    queryGuard.cancelReservation();
                    // Safety net: clear the placeholder if processUserInput produced no
                    // messages or threw — otherwise it would stay visible until the next
                    // turn's resetLoadingState. Harmless when onQuery ran: setMessages grew
                    // displayedMessages past the baseline, so REPL.tsx already hid it.
                    setUserInputOnProcessing(undefined);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
