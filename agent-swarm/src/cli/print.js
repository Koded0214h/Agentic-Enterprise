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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.joinPromptValues = joinPromptValues;
exports.canBatchWith = canBatchWith;
exports.runHeadless = runHeadless;
exports.createCanUseToolWithPermissionPrompt = createCanUseToolWithPermissionPrompt;
exports.getCanUseToolFn = getCanUseToolFn;
exports.removeInterruptedMessage = removeInterruptedMessage;
exports.handleOrphanedPermissionResponse = handleOrphanedPermissionResponse;
exports.handleMcpSetServers = handleMcpSetServers;
exports.reconcileMcpServers = reconcileMcpServers;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var index_js_1 = require("src/services/settingsSync/index.js");
var index_js_2 = require("src/services/remoteManagedSettings/index.js");
var structuredIO_js_1 = require("src/cli/structuredIO.js");
var remoteIO_js_1 = require("src/cli/remoteIO.js");
var commands_js_1 = require("src/commands.js");
var streamlinedTransform_js_1 = require("src/utils/streamlinedTransform.js");
var streamJsonStdoutGuard_js_1 = require("src/utils/streamJsonStdoutGuard.js");
var tools_js_1 = require("src/tools.js");
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
var array_js_1 = require("src/utils/array.js");
var toolPool_js_1 = require("src/utils/toolPool.js");
var index_js_3 = require("src/services/analytics/index.js");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var debug_js_1 = require("src/utils/debug.js");
var diagLogs_js_1 = require("src/utils/diagLogs.js");
var Tool_js_1 = require("src/Tool.js");
var loadAgentsDir_js_1 = require("src/tools/AgentTool/loadAgentsDir.js");
var messageQueueManager_js_1 = require("src/utils/messageQueueManager.js");
var commandLifecycle_js_1 = require("src/utils/commandLifecycle.js");
var sessionState_js_1 = require("src/utils/sessionState.js");
var onChangeAppState_js_1 = require("src/state/onChangeAppState.js");
var log_js_1 = require("src/utils/log.js");
var process_js_1 = require("src/utils/process.js");
var logging_js_1 = require("src/services/api/logging.js");
var conversationRecovery_js_1 = require("src/utils/conversationRecovery.js");
var channelNotification_js_1 = require("src/services/mcp/channelNotification.js");
var channelAllowlist_js_1 = require("src/services/mcp/channelAllowlist.js");
var pluginIdentifier_js_1 = require("src/utils/plugins/pluginIdentifier.js");
var uuid_js_1 = require("src/utils/uuid.js");
var generators_js_1 = require("src/utils/generators.js");
var QueryEngine_js_1 = require("src/QueryEngine.js");
var fileStateCache_js_1 = require("src/utils/fileStateCache.js");
var path_js_1 = require("src/utils/path.js");
var queryHelpers_js_1 = require("src/utils/queryHelpers.js");
var hookEvents_js_1 = require("src/utils/hooks/hookEvents.js");
var filePersistence_js_1 = require("src/utils/filePersistence/filePersistence.js");
var AsyncHookRegistry_js_1 = require("src/utils/hooks/AsyncHookRegistry.js");
var gracefulShutdown_js_1 = require("src/utils/gracefulShutdown.js");
var cleanupRegistry_js_1 = require("src/utils/cleanupRegistry.js");
var idleTimeout_js_1 = require("src/utils/idleTimeout.js");
var process_1 = require("process");
var cwd_js_1 = require("src/utils/cwd.js");
var omit_js_1 = require("lodash-es/omit.js");
var reject_js_1 = require("lodash-es/reject.js");
var index_js_4 = require("src/services/policyLimits/index.js");
var product_js_1 = require("src/constants/product.js");
var bridgeStatusUtil_js_1 = require("src/bridge/bridgeStatusUtil.js");
var inboundMessages_js_1 = require("src/bridge/inboundMessages.js");
var inboundAttachments_js_1 = require("src/bridge/inboundAttachments.js");
var permissions_js_1 = require("src/utils/permissions/permissions.js");
var json_js_1 = require("src/utils/json.js");
var PermissionPromptToolResultSchema_js_1 = require("src/utils/permissions/PermissionPromptToolResultSchema.js");
var abortController_js_1 = require("src/utils/abortController.js");
var combinedAbortSignal_js_1 = require("src/utils/combinedAbortSignal.js");
var sessionTitle_js_1 = require("src/utils/sessionTitle.js");
var queryContext_js_1 = require("src/utils/queryContext.js");
var sideQuestion_js_1 = require("src/utils/sideQuestion.js");
var sessionStart_js_1 = require("src/utils/sessionStart.js");
var outputStyles_js_1 = require("src/constants/outputStyles.js");
var xml_js_1 = require("src/constants/xml.js");
var settings_js_1 = require("src/utils/settings/settings.js");
var changeDetector_js_1 = require("src/utils/settings/changeDetector.js");
var applySettingsChange_js_1 = require("src/utils/settings/applySettingsChange.js");
var fastMode_js_1 = require("src/utils/fastMode.js");
var permissionSetup_js_1 = require("src/utils/permissions/permissionSetup.js");
var promptSuggestion_js_1 = require("src/services/PromptSuggestion/promptSuggestion.js");
var forkedAgent_js_1 = require("src/utils/forkedAgent.js");
var auth_js_1 = require("src/utils/auth.js");
var index_js_5 = require("src/services/oauth/index.js");
var auth_js_2 = require("src/cli/handlers/auth.js");
var providers_js_1 = require("src/utils/model/providers.js");
var awsAuthStatusManager_js_1 = require("src/utils/awsAuthStatusManager.js");
var state_js_1 = require("src/bootstrap/state.js");
var SyntheticOutputTool_js_1 = require("src/tools/SyntheticOutputTool/SyntheticOutputTool.js");
var sessionUrl_js_1 = require("src/utils/sessionUrl.js");
var sessionStorage_js_1 = require("src/utils/sessionStorage.js");
var commitAttribution_js_1 = require("src/utils/commitAttribution.js");
var client_js_1 = require("src/services/mcp/client.js");
var config_js_1 = require("src/services/mcp/config.js");
var auth_js_3 = require("src/services/mcp/auth.js");
var elicitationHandler_js_1 = require("src/services/mcp/elicitationHandler.js");
var hooks_js_1 = require("src/utils/hooks.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var mcpStringUtils_js_1 = require("src/services/mcp/mcpStringUtils.js");
var utils_js_1 = require("src/services/mcp/utils.js");
var vscodeSdkMcp_js_1 = require("src/services/mcp/vscodeSdkMcp.js");
var config_js_2 = require("src/services/mcp/config.js");
var grove_js_1 = require("src/services/api/grove.js");
var mappers_js_1 = require("src/utils/messages/mappers.js");
var messages_js_1 = require("src/utils/messages.js");
var context_noninteractive_js_1 = require("src/commands/context/context-noninteractive.js");
var xml_js_2 = require("src/constants/xml.js");
var claudeAiLimits_js_1 = require("src/services/claudeAiLimits.js");
var model_js_1 = require("src/utils/model/model.js");
var modelOptions_js_1 = require("src/utils/model/modelOptions.js");
var effort_js_1 = require("src/utils/effort.js");
var thinking_js_1 = require("src/utils/thinking.js");
var betas_js_1 = require("src/utils/betas.js");
var modelStrings_js_1 = require("src/utils/model/modelStrings.js");
var state_js_2 = require("src/bootstrap/state.js");
var workloadContext_js_1 = require("src/utils/workloadContext.js");
var crypto_1 = require("crypto");
var fileHistory_js_1 = require("src/utils/fileHistory.js");
var sessionRestore_js_1 = require("src/utils/sessionRestore.js");
var sandbox_adapter_js_1 = require("src/utils/sandbox/sandbox-adapter.js");
var headlessProfiler_js_1 = require("src/utils/headlessProfiler.js");
var queryProfiler_js_1 = require("src/utils/queryProfiler.js");
var ids_js_1 = require("src/types/ids.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var skillChangeDetector_js_1 = require("../utils/skills/skillChangeDetector.js");
var commands_js_2 = require("../commands.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var headlessPluginInstall_js_1 = require("../utils/plugins/headlessPluginInstall.js");
var refresh_js_1 = require("../utils/plugins/refresh.js");
var pluginLoader_js_1 = require("../utils/plugins/pluginLoader.js");
var teammate_js_1 = require("../utils/teammate.js");
var teammateMailbox_js_1 = require("../utils/teammateMailbox.js");
var teamHelpers_js_1 = require("../utils/swarm/teamHelpers.js");
var tasks_js_1 = require("../utils/tasks.js");
var framework_js_1 = require("../utils/task/framework.js");
var types_js_2 = require("../tasks/types.js");
var stopTask_js_1 = require("../tasks/stopTask.js");
var sdkEventQueue_js_1 = require("../utils/sdkEventQueue.js");
var growthbook_js_2 = require("../services/analytics/growthbook.js");
var errors_js_1 = require("../utils/errors.js");
var sleep_js_1 = require("../utils/sleep.js");
var paths_js_1 = require("../memdir/paths.js");
// Dead code elimination: conditional imports
/* eslint-disable @typescript-eslint/no-require-imports */
var coordinatorModeModule = (0, bun_bundle_1.feature)('COORDINATOR_MODE')
    ? require('../coordinator/coordinatorMode.js')
    : null;
var proactiveModule = (0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
    ? require('../proactive/index.js')
    : null;
var cronSchedulerModule = (0, bun_bundle_1.feature)('AGENT_TRIGGERS')
    ? require('../utils/cronScheduler.js')
    : null;
var cronJitterConfigModule = (0, bun_bundle_1.feature)('AGENT_TRIGGERS')
    ? require('../utils/cronJitterConfig.js')
    : null;
var cronGate = (0, bun_bundle_1.feature)('AGENT_TRIGGERS')
    ? require('../tools/ScheduleCronTool/prompt.js')
    : null;
var extractMemoriesModule = (0, bun_bundle_1.feature)('EXTRACT_MEMORIES')
    ? require('../services/extractMemories/extractMemories.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var SHUTDOWN_TEAM_PROMPT = "<system-reminder>\nYou are running in non-interactive mode and cannot return a response to the user until your team is shut down.\n\nYou MUST shut down your team before preparing your final response:\n1. Use requestShutdown to ask each team member to shut down gracefully\n2. Wait for shutdown approvals\n3. Use the cleanup operation to clean up the team\n4. Only then provide your final response to the user\n\nThe user cannot receive your response until the team is completely shut down.\n</system-reminder>\n\nShut down your team and prepare your final response for the user.";
// Track message UUIDs received during the current session runtime
var MAX_RECEIVED_UUIDS = 10000;
var receivedMessageUuids = new Set();
var receivedMessageUuidsOrder = [];
function trackReceivedMessageUuid(uuid) {
    if (receivedMessageUuids.has(uuid)) {
        return false; // duplicate
    }
    receivedMessageUuids.add(uuid);
    receivedMessageUuidsOrder.push(uuid);
    // Evict oldest entries when at capacity
    if (receivedMessageUuidsOrder.length > MAX_RECEIVED_UUIDS) {
        var toEvict = receivedMessageUuidsOrder.splice(0, receivedMessageUuidsOrder.length - MAX_RECEIVED_UUIDS);
        for (var _i = 0, toEvict_1 = toEvict; _i < toEvict_1.length; _i++) {
            var old = toEvict_1[_i];
            receivedMessageUuids.delete(old);
        }
    }
    return true; // new UUID
}
function toBlocks(v) {
    return typeof v === 'string' ? [{ type: 'text', text: v }] : v;
}
/**
 * Join prompt values from multiple queued commands into one. Strings are
 * newline-joined; if any value is a block array, all values are normalized
 * to blocks and concatenated.
 */
function joinPromptValues(values) {
    if (values.length === 1)
        return values[0];
    if (values.every(function (v) { return typeof v === 'string'; })) {
        return values.join('\n');
    }
    return values.flatMap(toBlocks);
}
/**
 * Whether `next` can be batched into the same ask() call as `head`. Only
 * prompt-mode commands batch, and only when the workload tag matches (so the
 * combined turn is attributed correctly) and the isMeta flag matches (so a
 * proactive tick can't merge into a user prompt and lose its hidden-in-
 * transcript marking when the head is spread over the merged command).
 */
function canBatchWith(head, next) {
    return (next !== undefined &&
        next.mode === 'prompt' &&
        next.workload === head.workload &&
        next.isMeta === head.isMeta);
}
function runHeadless(inputPrompt, getAppState, setAppState, commands, tools, sdkMcpConfigs, agents, options) {
    return __awaiter(this, void 0, void 0, function () {
        var gcTimer, structuredIO, sandboxUnavailableReason, err_1, appState, _a, initialMessages, turnInterruptionState, resumedAgentSetting, hookInitialUserMessage, restoredAgent_1, agentSystemPrompt, targetMessage, currentAppState, result, hasValidResumeSessionId, isUsingSdkUrl, allowedMcpTools, filteredTools, effectivePermissionPromptToolName, onPermissionPrompt, canUseTool, needsFullArray, messages, lastMessage, transformToStreamlined, _b, _c, _d, message, transformed, e_1_1;
        var _e, e_1, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (process.env.USER_TYPE === 'ant' &&
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EXIT_AFTER_FIRST_RENDER)) {
                        process.stderr.write("\nStartup time: ".concat(Math.round(process.uptime() * 1000), "ms\n"));
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(0);
                    }
                    // Fire user settings download now so it overlaps with the MCP/tool setup
                    // below. Managed settings already started in main.tsx preAction; this gives
                    // user settings a similar head start. The cached promise is joined in
                    // installPluginsAndApplyMcpInBackground before plugin install reads
                    // enabledPlugins.
                    if ((0, bun_bundle_1.feature)('DOWNLOAD_USER_SETTINGS') &&
                        ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) || (0, state_js_2.getIsRemoteMode)())) {
                        void (0, index_js_1.downloadUserSettings)();
                    }
                    // In headless mode there is no React tree, so the useSettingsChange hook
                    // never runs. Subscribe directly so that settings changes (including
                    // managed-settings / policy updates) are fully applied.
                    changeDetector_js_1.settingsChangeDetector.subscribe(function (source) {
                        (0, applySettingsChange_js_1.applySettingsChange)(source, setAppState);
                        // In headless mode, also sync the denormalized fastMode field from
                        // settings. The TUI manages fastMode via the UI so it skips this.
                        if ((0, fastMode_js_1.isFastModeEnabled)()) {
                            setAppState(function (prev) {
                                var s = prev.settings;
                                var fastMode = s.fastMode === true && !s.fastModePerSessionOptIn;
                                return __assign(__assign({}, prev), { fastMode: fastMode });
                            });
                        }
                    });
                    // Proactive activation is now handled in main.tsx before getTools() so
                    // SleepTool passes isEnabled() filtering. This fallback covers the case
                    // where CLAUDE_CODE_PROACTIVE is set but main.tsx's check didn't fire
                    // (e.g. env was injected by the SDK transport after argv parsing).
                    if (((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) &&
                        proactiveModule &&
                        !proactiveModule.isProactiveActive() &&
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PROACTIVE)) {
                        proactiveModule.activateProactive('command');
                    }
                    // Periodically force a full GC to keep memory usage in check
                    if (typeof Bun !== 'undefined') {
                        gcTimer = setInterval(Bun.gc, 1000);
                        gcTimer.unref();
                    }
                    // Start headless profiler for first turn
                    (0, headlessProfiler_js_1.headlessProfilerStartTurn)();
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('runHeadless_entry');
                    return [4 /*yield*/, (0, grove_js_1.isQualifiedForGrove)()];
                case 1:
                    if (!_h.sent()) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, grove_js_1.checkGroveForNonInteractive)()];
                case 2:
                    _h.sent();
                    _h.label = 3;
                case 3:
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('after_grove_check');
                    // Initialize GrowthBook so feature flags take effect in headless mode.
                    // Without this, the disk cache is empty and all flags fall back to defaults.
                    void (0, growthbook_js_2.initializeGrowthBook)();
                    if (options.resumeSessionAt && !options.resume) {
                        process.stderr.write("Error: --resume-session-at requires --resume\n");
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    if (options.rewindFiles && !options.resume) {
                        process.stderr.write("Error: --rewind-files requires --resume\n");
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    if (options.rewindFiles && inputPrompt) {
                        process.stderr.write("Error: --rewind-files is a standalone operation and cannot be used with a prompt\n");
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    structuredIO = getStructuredIO(inputPrompt, options);
                    // When emitting NDJSON for SDK clients, any stray write to stdout (debug
                    // prints, dependency console.log, library banners) breaks the client's
                    // line-by-line JSON parser. Install a guard that diverts non-JSON lines to
                    // stderr so the stream stays clean. Must run before the first
                    // structuredIO.write below.
                    if (options.outputFormat === 'stream-json') {
                        (0, streamJsonStdoutGuard_js_1.installStreamJsonStdoutGuard)();
                    }
                    sandboxUnavailableReason = sandbox_adapter_js_1.SandboxManager.getSandboxUnavailableReason();
                    if (!sandboxUnavailableReason) return [3 /*break*/, 4];
                    if (sandbox_adapter_js_1.SandboxManager.isSandboxRequired()) {
                        process.stderr.write("\nError: sandbox required but unavailable: ".concat(sandboxUnavailableReason, "\n") +
                            "  sandbox.failIfUnavailable is set \u2014 refusing to start without a working sandbox.\n\n");
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    process.stderr.write("\n\u26A0 Sandbox disabled: ".concat(sandboxUnavailableReason, "\n") +
                        "  Commands will run WITHOUT sandboxing. Network and filesystem restrictions will NOT be enforced.\n\n");
                    return [3 /*break*/, 8];
                case 4:
                    if (!sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled()) return [3 /*break*/, 8];
                    _h.label = 5;
                case 5:
                    _h.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, sandbox_adapter_js_1.SandboxManager.initialize(structuredIO.createSandboxAskCallback())];
                case 6:
                    _h.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _h.sent();
                    process.stderr.write("\n\u274C Sandbox Error: ".concat((0, errors_js_1.errorMessage)(err_1), "\n"));
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1, 'other');
                    return [2 /*return*/];
                case 8:
                    if (options.outputFormat === 'stream-json' && options.verbose) {
                        (0, hookEvents_js_1.registerHookEventHandler)(function (event) {
                            var message = (function () {
                                switch (event.type) {
                                    case 'started':
                                        return {
                                            type: 'system',
                                            subtype: 'hook_started',
                                            hook_id: event.hookId,
                                            hook_name: event.hookName,
                                            hook_event: event.hookEvent,
                                            uuid: (0, crypto_1.randomUUID)(),
                                            session_id: (0, state_js_2.getSessionId)(),
                                        };
                                    case 'progress':
                                        return {
                                            type: 'system',
                                            subtype: 'hook_progress',
                                            hook_id: event.hookId,
                                            hook_name: event.hookName,
                                            hook_event: event.hookEvent,
                                            stdout: event.stdout,
                                            stderr: event.stderr,
                                            output: event.output,
                                            uuid: (0, crypto_1.randomUUID)(),
                                            session_id: (0, state_js_2.getSessionId)(),
                                        };
                                    case 'response':
                                        return {
                                            type: 'system',
                                            subtype: 'hook_response',
                                            hook_id: event.hookId,
                                            hook_name: event.hookName,
                                            hook_event: event.hookEvent,
                                            output: event.output,
                                            stdout: event.stdout,
                                            stderr: event.stderr,
                                            exit_code: event.exitCode,
                                            outcome: event.outcome,
                                            uuid: (0, crypto_1.randomUUID)(),
                                            session_id: (0, state_js_2.getSessionId)(),
                                        };
                                }
                            })();
                            void structuredIO.write(message);
                        });
                    }
                    if (!options.setupTrigger) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, sessionStart_js_1.processSetupHooks)(options.setupTrigger)];
                case 9:
                    _h.sent();
                    _h.label = 10;
                case 10:
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('before_loadInitialMessages');
                    appState = getAppState();
                    return [4 /*yield*/, loadInitialMessages(setAppState, {
                            continue: options.continue,
                            teleport: options.teleport,
                            resume: options.resume,
                            resumeSessionAt: options.resumeSessionAt,
                            forkSession: options.forkSession,
                            outputFormat: options.outputFormat,
                            sessionStartHooksPromise: options.sessionStartHooksPromise,
                            restoredWorkerState: structuredIO.restoredWorkerState,
                        })
                        // SessionStart hooks can emit initialUserMessage — the first user turn for
                        // headless orchestrator sessions where stdin is empty and additionalContext
                        // alone (an attachment, not a turn) would leave the REPL with nothing to
                        // respond to. The hook promise is awaited inside loadInitialMessages, so the
                        // module-level pending value is set by the time we get here.
                    ];
                case 11:
                    _a = _h.sent(), initialMessages = _a.messages, turnInterruptionState = _a.turnInterruptionState, resumedAgentSetting = _a.agentSetting;
                    hookInitialUserMessage = (0, sessionStart_js_1.takeInitialUserMessage)();
                    if (hookInitialUserMessage) {
                        structuredIO.prependUserMessage(hookInitialUserMessage);
                    }
                    // Restore agent setting from the resumed session (if not overridden by current --agent flag
                    // or settings-based agent, which would already have set mainThreadAgentType in main.tsx)
                    if (!options.agent && !(0, state_js_2.getMainThreadAgentType)() && resumedAgentSetting) {
                        restoredAgent_1 = (0, sessionRestore_js_1.restoreAgentFromSession)(resumedAgentSetting, undefined, { activeAgents: agents, allAgents: agents }).agentDefinition;
                        if (restoredAgent_1) {
                            setAppState(function (prev) { return (__assign(__assign({}, prev), { agent: restoredAgent_1.agentType })); });
                            // Apply the agent's system prompt for non-built-in agents (mirrors main.tsx initial --agent path)
                            if (!options.systemPrompt && !(0, loadAgentsDir_js_1.isBuiltInAgent)(restoredAgent_1)) {
                                agentSystemPrompt = restoredAgent_1.getSystemPrompt();
                                if (agentSystemPrompt) {
                                    options.systemPrompt = agentSystemPrompt;
                                }
                            }
                            // Re-persist agent setting so future resumes maintain the agent
                            (0, sessionStorage_js_1.saveAgentSetting)(restoredAgent_1.agentType);
                        }
                    }
                    // gracefulShutdownSync schedules an async shutdown and sets process.exitCode.
                    // If a loadInitialMessages error path triggered it, bail early to avoid
                    // unnecessary work while the process winds down.
                    if (initialMessages.length === 0 && process.exitCode !== undefined) {
                        return [2 /*return*/];
                    }
                    if (!options.rewindFiles) return [3 /*break*/, 13];
                    targetMessage = initialMessages.find(function (m) { return m.uuid === options.rewindFiles; });
                    if (!targetMessage || targetMessage.type !== 'user') {
                        process.stderr.write("Error: --rewind-files requires a user message UUID, but ".concat(options.rewindFiles, " is not a user message in this session\n"));
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    currentAppState = getAppState();
                    return [4 /*yield*/, handleRewindFiles(options.rewindFiles, currentAppState, setAppState, false)];
                case 12:
                    result = _h.sent();
                    if (!result.canRewind) {
                        process.stderr.write("Error: ".concat(result.error || 'Unexpected error', "\n"));
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    // Rewind complete - exit successfully
                    process.stdout.write("Files rewound to state at message ".concat(options.rewindFiles, "\n"));
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(0);
                    return [2 /*return*/];
                case 13:
                    hasValidResumeSessionId = typeof options.resume === 'string' &&
                        (Boolean((0, uuid_js_1.validateUuid)(options.resume)) || options.resume.endsWith('.jsonl'));
                    isUsingSdkUrl = Boolean(options.sdkUrl);
                    if (!inputPrompt && !hasValidResumeSessionId && !isUsingSdkUrl) {
                        process.stderr.write("Error: Input must be provided either through stdin or as a prompt argument when using --print\n");
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    if (options.outputFormat === 'stream-json' && !options.verbose) {
                        process.stderr.write('Error: When using --print, --output-format=stream-json requires --verbose\n');
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    allowedMcpTools = (0, tools_js_1.filterToolsByDenyRules)(appState.mcp.tools, appState.toolPermissionContext);
                    filteredTools = __spreadArray(__spreadArray([], tools, true), allowedMcpTools, true);
                    effectivePermissionPromptToolName = options.sdkUrl
                        ? 'stdio'
                        : options.permissionPromptToolName;
                    onPermissionPrompt = function (details) {
                        if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION')) {
                            setAppState(function (prev) { return (__assign(__assign({}, prev), { attribution: __assign(__assign({}, prev.attribution), { permissionPromptCount: prev.attribution.permissionPromptCount + 1 }) })); });
                        }
                        (0, sessionState_js_1.notifySessionStateChanged)('requires_action', details);
                    };
                    canUseTool = getCanUseToolFn(effectivePermissionPromptToolName, structuredIO, function () { return getAppState().mcp.tools; }, onPermissionPrompt);
                    if (options.permissionPromptToolName) {
                        // Remove the permission prompt tool from the list of available tools.
                        filteredTools = filteredTools.filter(function (tool) { return !(0, Tool_js_1.toolMatchesName)(tool, options.permissionPromptToolName); });
                    }
                    // Install errors handlers to gracefully handle broken pipes (e.g., when parent process dies)
                    (0, process_js_1.registerProcessOutputErrorHandlers)();
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('after_loadInitialMessages');
                    // Ensure model strings are initialized before generating model options.
                    // For Bedrock users, this waits for the profile fetch to get correct region strings.
                    return [4 /*yield*/, (0, modelStrings_js_1.ensureModelStringsInitialized)()];
                case 14:
                    // Ensure model strings are initialized before generating model options.
                    // For Bedrock users, this waits for the profile fetch to get correct region strings.
                    _h.sent();
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('after_modelStrings');
                    needsFullArray = options.outputFormat === 'json' && options.verbose;
                    messages = [];
                    transformToStreamlined = (0, bun_bundle_1.feature)('STREAMLINED_OUTPUT') &&
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_STREAMLINED_OUTPUT) &&
                        options.outputFormat === 'stream-json'
                        ? (0, streamlinedTransform_js_1.createStreamlinedTransformer)()
                        : null;
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('before_runHeadlessStreaming');
                    _h.label = 15;
                case 15:
                    _h.trys.push([15, 25, 26, 31]);
                    _b = true, _c = __asyncValues(runHeadlessStreaming(structuredIO, appState.mcp.clients, __spreadArray(__spreadArray([], commands, true), appState.mcp.commands, true), filteredTools, initialMessages, canUseTool, sdkMcpConfigs, getAppState, setAppState, agents, options, turnInterruptionState));
                    _h.label = 16;
                case 16: return [4 /*yield*/, _c.next()];
                case 17:
                    if (!(_d = _h.sent(), _e = _d.done, !_e)) return [3 /*break*/, 24];
                    _g = _d.value;
                    _b = false;
                    message = _g;
                    if (!transformToStreamlined) return [3 /*break*/, 20];
                    transformed = transformToStreamlined(message);
                    if (!transformed) return [3 /*break*/, 19];
                    return [4 /*yield*/, structuredIO.write(transformed)];
                case 18:
                    _h.sent();
                    _h.label = 19;
                case 19: return [3 /*break*/, 22];
                case 20:
                    if (!(options.outputFormat === 'stream-json' && options.verbose)) return [3 /*break*/, 22];
                    return [4 /*yield*/, structuredIO.write(message)];
                case 21:
                    _h.sent();
                    _h.label = 22;
                case 22:
                    // Should not be getting control messages or stream events in non-stream mode.
                    // Also filter out streamlined types since they're only produced by the transformer.
                    // SDK-only system events are excluded so lastMessage stays at the result
                    // (session_state_changed(idle) and any late task_notification drain after
                    // result in the finally block).
                    if (message.type !== 'control_response' &&
                        message.type !== 'control_request' &&
                        message.type !== 'control_cancel_request' &&
                        !(message.type === 'system' &&
                            (message.subtype === 'session_state_changed' ||
                                message.subtype === 'task_notification' ||
                                message.subtype === 'task_started' ||
                                message.subtype === 'task_progress' ||
                                message.subtype === 'post_turn_summary')) &&
                        message.type !== 'stream_event' &&
                        message.type !== 'keep_alive' &&
                        message.type !== 'streamlined_text' &&
                        message.type !== 'streamlined_tool_use_summary' &&
                        message.type !== 'prompt_suggestion') {
                        if (needsFullArray) {
                            messages.push(message);
                        }
                        lastMessage = message;
                    }
                    _h.label = 23;
                case 23:
                    _b = true;
                    return [3 /*break*/, 16];
                case 24: return [3 /*break*/, 31];
                case 25:
                    e_1_1 = _h.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 31];
                case 26:
                    _h.trys.push([26, , 29, 30]);
                    if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 28];
                    return [4 /*yield*/, _f.call(_c)];
                case 27:
                    _h.sent();
                    _h.label = 28;
                case 28: return [3 /*break*/, 30];
                case 29:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 30: return [7 /*endfinally*/];
                case 31:
                    switch (options.outputFormat) {
                        case 'json':
                            if (!lastMessage || lastMessage.type !== 'result') {
                                throw new Error('No messages returned');
                            }
                            if (options.verbose) {
                                (0, process_js_1.writeToStdout)((0, slowOperations_js_1.jsonStringify)(messages) + '\n');
                                break;
                            }
                            (0, process_js_1.writeToStdout)((0, slowOperations_js_1.jsonStringify)(lastMessage) + '\n');
                            break;
                        case 'stream-json':
                            // already logged above
                            break;
                        default:
                            if (!lastMessage || lastMessage.type !== 'result') {
                                throw new Error('No messages returned');
                            }
                            switch (lastMessage.subtype) {
                                case 'success':
                                    (0, process_js_1.writeToStdout)(lastMessage.result.endsWith('\n')
                                        ? lastMessage.result
                                        : lastMessage.result + '\n');
                                    break;
                                case 'error_during_execution':
                                    (0, process_js_1.writeToStdout)("Execution error");
                                    break;
                                case 'error_max_turns':
                                    (0, process_js_1.writeToStdout)("Error: Reached max turns (".concat(options.maxTurns, ")"));
                                    break;
                                case 'error_max_budget_usd':
                                    (0, process_js_1.writeToStdout)("Error: Exceeded USD budget (".concat(options.maxBudgetUsd, ")"));
                                    break;
                                case 'error_max_structured_output_retries':
                                    (0, process_js_1.writeToStdout)("Error: Failed to provide valid structured output after maximum retries");
                            }
                    }
                    // Log headless latency metrics for the final turn
                    (0, headlessProfiler_js_1.logHeadlessProfilerTurn)();
                    if (!((0, bun_bundle_1.feature)('EXTRACT_MEMORIES') && (0, paths_js_1.isExtractModeActive)())) return [3 /*break*/, 33];
                    return [4 /*yield*/, extractMemoriesModule.drainPendingExtraction()];
                case 32:
                    _h.sent();
                    _h.label = 33;
                case 33:
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'result' && (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.is_error) ? 1 : 0);
                    return [2 /*return*/];
            }
        });
    });
}
function runHeadlessStreaming(structuredIO, mcpClients, commands, tools, initialMessages, canUseTool, sdkMcpConfigs, getAppState, setAppState, agents, options, turnInterruptionState) {
    var _this = this;
    var running = false;
    var runPhase;
    var inputClosed = false;
    var shutdownPromptInjected = false;
    var heldBackResult = null;
    var abortController;
    // Same queue sendRequest() enqueues to — one FIFO for everything.
    var output = structuredIO.outbound;
    // Ctrl+C in -p mode: abort the in-flight query, then shut down gracefully.
    // gracefulShutdown persists session state and flushes analytics, with a
    // failsafe timer that force-exits if cleanup hangs.
    var sigintHandler = function () {
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'shutdown_signal', { signal: 'SIGINT' });
        if (abortController && !abortController.signal.aborted) {
            abortController.abort();
        }
        void (0, gracefulShutdown_js_1.gracefulShutdown)(0);
    };
    process.on('SIGINT', sigintHandler);
    // Dump run()'s state at SIGTERM so a stuck session's healthsweep can name
    // the do/while(waitingForAgents) poll without reading the transcript.
    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
        var bg, _i, _a, t;
        var _b;
        return __generator(this, function (_c) {
            bg = {};
            for (_i = 0, _a = (0, framework_js_1.getRunningTasks)(getAppState()); _i < _a.length; _i++) {
                t = _a[_i];
                if ((0, types_js_2.isBackgroundTask)(t))
                    bg[t.type] = ((_b = bg[t.type]) !== null && _b !== void 0 ? _b : 0) + 1;
            }
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'run_state_at_shutdown', {
                run_active: running,
                run_phase: runPhase,
                worker_status: (0, sessionState_js_1.getSessionState)(),
                internal_events_pending: structuredIO.internalEventsPending,
                bg_tasks: bg,
            });
            return [2 /*return*/];
        });
    }); });
    // Wire the central onChangeAppState mode-diff hook to the SDK output stream.
    // This fires whenever ANY code path mutates toolPermissionContext.mode —
    // Shift+Tab, ExitPlanMode dialog, /plan slash command, rewind, bridge
    // set_permission_mode, the query loop, stop_task — rather than the two
    // paths that previously went through a bespoke wrapper.
    // The wrapper's body was fully redundant (it enqueued here AND called
    // notifySessionMetadataChanged, both of which onChangeAppState now covers);
    // keeping it would double-emit status messages.
    (0, sessionState_js_1.setPermissionModeChangedListener)(function (newMode) {
        // Only emit for SDK-exposed modes.
        if (newMode === 'default' ||
            newMode === 'acceptEdits' ||
            newMode === 'bypassPermissions' ||
            newMode === 'plan' ||
            newMode === ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') && 'auto') ||
            newMode === 'dontAsk') {
            output.enqueue({
                type: 'system',
                subtype: 'status',
                status: null,
                permissionMode: newMode,
                uuid: (0, crypto_1.randomUUID)(),
                session_id: (0, state_js_2.getSessionId)(),
            });
        }
    });
    // Prompt suggestion tracking (push model)
    var suggestionState = {
        abortController: null,
        inflightPromise: null,
        lastEmitted: null,
        pendingSuggestion: null,
        pendingLastEmittedEntry: null,
    };
    // Set up AWS auth status listener if enabled
    var unsubscribeAuthStatus;
    if (options.enableAuthStatus) {
        var authStatusManager = awsAuthStatusManager_js_1.AwsAuthStatusManager.getInstance();
        unsubscribeAuthStatus = authStatusManager.subscribe(function (status) {
            output.enqueue({
                type: 'auth_status',
                isAuthenticating: status.isAuthenticating,
                output: status.output,
                error: status.error,
                uuid: (0, crypto_1.randomUUID)(),
                session_id: (0, state_js_2.getSessionId)(),
            });
        });
    }
    // Set up rate limit status listener to emit SDKRateLimitEvent for all status changes.
    // Emitting for all statuses (including 'allowed') ensures consumers can clear warnings
    // when rate limits reset. The upstream emitStatusChange already deduplicates via isEqual.
    var rateLimitListener = function (limits) {
        var rateLimitInfo = (0, mappers_js_1.toSDKRateLimitInfo)(limits);
        if (rateLimitInfo) {
            output.enqueue({
                type: 'rate_limit_event',
                rate_limit_info: rateLimitInfo,
                uuid: (0, crypto_1.randomUUID)(),
                session_id: (0, state_js_2.getSessionId)(),
            });
        }
    };
    claudeAiLimits_js_1.statusListeners.add(rateLimitListener);
    // Messages for internal tracking, directly mutated by ask(). These messages
    // include Assistant, User, Attachment, and Progress messages.
    // TODO: Clean up this code to avoid passing around a mutable array.
    var mutableMessages = initialMessages;
    // Seed the readFileState cache from the transcript (content the model saw,
    // with message timestamps) so getChangedFiles can detect external edits.
    // This cache instance must persist across ask() calls, since the edit tool
    // relies on this as a global state.
    var readFileState = (0, queryHelpers_js_1.extractReadFilesFromMessages)(initialMessages, (0, process_1.cwd)(), fileStateCache_js_1.READ_FILE_STATE_CACHE_SIZE);
    // Client-supplied readFileState seeds (via seed_read_state control request).
    // The stdin IIFE runs concurrently with ask() — a seed arriving mid-turn
    // would be lost to ask()'s clone-then-replace (QueryEngine.ts finally block)
    // if written directly into readFileState. Instead, seeds land here, merge
    // into getReadFileCache's view (readFileState-wins-ties: seeds fill gaps),
    // and are re-applied then CLEARED in setReadFileCache. One-shot: each seed
    // survives exactly one clone-replace cycle, then becomes a regular
    // readFileState entry subject to compact's clear like everything else.
    var pendingSeeds = (0, fileStateCache_js_1.createFileStateCacheWithSizeLimit)(fileStateCache_js_1.READ_FILE_STATE_CACHE_SIZE);
    // Auto-resume interrupted turns on restart so CC continues from where it
    // left off without requiring the SDK to re-send the prompt.
    var resumeInterruptedTurnEnv = process.env.CLAUDE_CODE_RESUME_INTERRUPTED_TURN;
    if (turnInterruptionState &&
        turnInterruptionState.kind !== 'none' &&
        resumeInterruptedTurnEnv) {
        (0, debug_js_1.logForDebugging)("[print.ts] Auto-resuming interrupted turn (kind: ".concat(turnInterruptionState.kind, ")"));
        // Remove the interrupted message and its sentinel, then re-enqueue so
        // the model sees it exactly once. For mid-turn interruptions, the
        // deserialization layer transforms them into interrupted_prompt by
        // appending a synthetic "Continue from where you left off." message.
        removeInterruptedMessage(mutableMessages, turnInterruptionState.message);
        (0, messageQueueManager_js_1.enqueue)({
            mode: 'prompt',
            value: turnInterruptionState.message.message.content,
            uuid: (0, crypto_1.randomUUID)(),
        });
    }
    var modelOptions = (0, modelOptions_js_1.getModelOptions)();
    var modelInfos = modelOptions.map(function (option) {
        var modelId = option.value === null ? 'default' : option.value;
        var resolvedModel = modelId === 'default'
            ? (0, model_js_1.getDefaultMainLoopModel)()
            : (0, model_js_1.parseUserSpecifiedModel)(modelId);
        var hasEffort = (0, effort_js_1.modelSupportsEffort)(resolvedModel);
        var hasAdaptiveThinking = (0, thinking_js_1.modelSupportsAdaptiveThinking)(resolvedModel);
        var hasFastMode = (0, fastMode_js_1.isFastModeSupportedByModel)(option.value);
        var hasAutoMode = (0, betas_js_1.modelSupportsAutoMode)(resolvedModel);
        return __assign(__assign(__assign(__assign({ value: modelId, displayName: option.label, description: option.description }, (hasEffort && {
            supportsEffort: true,
            supportedEffortLevels: (0, effort_js_1.modelSupportsMaxEffort)(resolvedModel)
                ? __spreadArray([], effort_js_1.EFFORT_LEVELS, true) : effort_js_1.EFFORT_LEVELS.filter(function (l) { return l !== 'max'; }),
        })), (hasAdaptiveThinking && { supportsAdaptiveThinking: true })), (hasFastMode && { supportsFastMode: true })), (hasAutoMode && { supportsAutoMode: true }));
    });
    var activeUserSpecifiedModel = options.userSpecifiedModel;
    function injectModelSwitchBreadcrumbs(modelArg, resolvedModel) {
        var breadcrumbs = (0, messages_js_1.createModelSwitchBreadcrumbs)(modelArg, (0, model_js_1.modelDisplayString)(resolvedModel));
        mutableMessages.push.apply(mutableMessages, breadcrumbs);
        for (var _i = 0, breadcrumbs_1 = breadcrumbs; _i < breadcrumbs_1.length; _i++) {
            var crumb = breadcrumbs_1[_i];
            if (typeof crumb.message.content === 'string' &&
                crumb.message.content.includes("<".concat(xml_js_2.LOCAL_COMMAND_STDOUT_TAG, ">"))) {
                output.enqueue({
                    type: 'user',
                    message: crumb.message,
                    session_id: (0, state_js_2.getSessionId)(),
                    parent_tool_use_id: null,
                    uuid: crumb.uuid,
                    timestamp: crumb.timestamp,
                    isReplay: true,
                });
            }
        }
    }
    // Cache SDK MCP clients to avoid reconnecting on each run
    var sdkClients = [];
    var sdkTools = [];
    // Track which MCP clients have had elicitation handlers registered
    var elicitationRegistered = new Set();
    /**
     * Register elicitation request/completion handlers on connected MCP clients
     * that haven't been registered yet. SDK MCP servers are excluded because they
     * route through SdkControlClientTransport. Hooks run first (matching REPL
     * behavior); if no hook responds, the request is forwarded to the SDK
     * consumer via the control protocol.
     */
    function registerElicitationHandlers(clients) {
        var _this = this;
        var _loop_1 = function (connection) {
            if (connection.type !== 'connected' ||
                elicitationRegistered.has(connection.name)) {
                return "continue";
            }
            // Skip SDK MCP servers — elicitation flows through SdkControlClientTransport
            if (connection.config.type === 'sdk') {
                return "continue";
            }
            var serverName = connection.name;
            // Wrapped in try/catch because setRequestHandler throws if the client wasn't
            // created with elicitation capability declared (e.g., SDK-created clients).
            try {
                connection.client.setRequestHandler(types_js_1.ElicitRequestSchema, function (request, extra) { return __awaiter(_this, void 0, void 0, function () {
                    var mode, hookResponse, url, requestedSchema, elicitationId, rawResult, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                (0, log_js_1.logMCPDebug)(serverName, "Elicitation request received in print mode: ".concat((0, slowOperations_js_1.jsonStringify)(request)));
                                mode = request.params.mode === 'url' ? 'url' : 'form';
                                (0, index_js_3.logEvent)('tengu_mcp_elicitation_shown', {
                                    mode: mode,
                                });
                                return [4 /*yield*/, (0, elicitationHandler_js_1.runElicitationHooks)(serverName, request.params, extra.signal)];
                            case 1:
                                hookResponse = _a.sent();
                                if (hookResponse) {
                                    (0, log_js_1.logMCPDebug)(serverName, "Elicitation resolved by hook: ".concat((0, slowOperations_js_1.jsonStringify)(hookResponse)));
                                    (0, index_js_3.logEvent)('tengu_mcp_elicitation_response', {
                                        mode: mode,
                                        action: hookResponse.action,
                                    });
                                    return [2 /*return*/, hookResponse];
                                }
                                url = 'url' in request.params
                                    ? request.params.url
                                    : undefined;
                                requestedSchema = 'requestedSchema' in request.params
                                    ? request.params.requestedSchema
                                    : undefined;
                                elicitationId = 'elicitationId' in request.params
                                    ? request.params.elicitationId
                                    : undefined;
                                return [4 /*yield*/, structuredIO.handleElicitation(serverName, request.params.message, requestedSchema, extra.signal, mode, url, elicitationId)];
                            case 2:
                                rawResult = _a.sent();
                                return [4 /*yield*/, (0, elicitationHandler_js_1.runElicitationResultHooks)(serverName, rawResult, extra.signal, mode, elicitationId)];
                            case 3:
                                result = _a.sent();
                                (0, index_js_3.logEvent)('tengu_mcp_elicitation_response', {
                                    mode: mode,
                                    action: result.action,
                                });
                                return [2 /*return*/, result];
                        }
                    });
                }); });
                // Surface completion notifications to SDK consumers (URL mode)
                connection.client.setNotificationHandler(types_js_1.ElicitationCompleteNotificationSchema, function (notification) {
                    var elicitationId = notification.params.elicitationId;
                    (0, log_js_1.logMCPDebug)(serverName, "Elicitation completion notification: ".concat(elicitationId));
                    void (0, hooks_js_1.executeNotificationHooks)({
                        message: "MCP server \"".concat(serverName, "\" confirmed elicitation ").concat(elicitationId, " complete"),
                        notificationType: 'elicitation_complete',
                    });
                    output.enqueue({
                        type: 'system',
                        subtype: 'elicitation_complete',
                        mcp_server_name: serverName,
                        elicitation_id: elicitationId,
                        uuid: (0, crypto_1.randomUUID)(),
                        session_id: (0, state_js_2.getSessionId)(),
                    });
                });
                elicitationRegistered.add(serverName);
            }
            catch (_a) {
                // setRequestHandler throws if the client wasn't created with
                // elicitation capability — skip silently
            }
        };
        for (var _i = 0, clients_1 = clients; _i < clients_1.length; _i++) {
            var connection = clients_1[_i];
            _loop_1(connection);
        }
    }
    function updateSdkMcp() {
        return __awaiter(this, void 0, void 0, function () {
            var currentServerNames, connectedServerNames, hasNewServers, hasRemovedServers, hasPendingSdkClients, hasFailedSdkClients, haveServersChanged, _i, sdkClients_1, client, sdkSetup, allSdkNames_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentServerNames = new Set(Object.keys(sdkMcpConfigs));
                        connectedServerNames = new Set(sdkClients.map(function (c) { return c.name; }));
                        hasNewServers = Array.from(currentServerNames).some(function (name) { return !connectedServerNames.has(name); });
                        hasRemovedServers = Array.from(connectedServerNames).some(function (name) { return !currentServerNames.has(name); });
                        hasPendingSdkClients = sdkClients.some(function (c) { return c.type === 'pending'; });
                        hasFailedSdkClients = sdkClients.some(function (c) { return c.type === 'failed'; });
                        haveServersChanged = hasNewServers ||
                            hasRemovedServers ||
                            hasPendingSdkClients ||
                            hasFailedSdkClients;
                        if (!haveServersChanged) return [3 /*break*/, 6];
                        _i = 0, sdkClients_1 = sdkClients;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sdkClients_1.length)) return [3 /*break*/, 4];
                        client = sdkClients_1[_i];
                        if (!!currentServerNames.has(client.name)) return [3 /*break*/, 3];
                        if (!(client.type === 'connected')) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.cleanup()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, (0, client_js_1.setupSdkMcpClients)(sdkMcpConfigs, function (serverName, message) {
                            return structuredIO.sendMcpMessage(serverName, message);
                        })];
                    case 5:
                        sdkSetup = _a.sent();
                        sdkClients = sdkSetup.clients;
                        sdkTools = sdkSetup.tools;
                        allSdkNames_1 = (0, array_js_1.uniq)(__spreadArray(__spreadArray([], connectedServerNames, true), currentServerNames, true));
                        setAppState(function (prev) { return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { tools: __spreadArray(__spreadArray([], prev.mcp.tools.filter(function (t) {
                                    return !allSdkNames_1.some(function (name) {
                                        return t.name.startsWith((0, mcpStringUtils_js_1.getMcpPrefix)(name));
                                    });
                                }), true), sdkTools, true) }) })); });
                        // Set up the special internal VSCode MCP server if necessary.
                        (0, vscodeSdkMcp_js_1.setupVscodeSdkMcp)(sdkClients);
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    void updateSdkMcp();
    // State for dynamically added MCP servers (via mcp_set_servers control message)
    // These are separate from SDK MCP servers and support all transport types
    var dynamicMcpState = {
        clients: [],
        tools: [],
        configs: {},
    };
    // Shared tool assembly for ask() and the get_context_usage control request.
    // Closes over the mutable sdkTools/dynamicMcpState bindings so both call
    // sites see late-connecting servers.
    var buildAllTools = function (appState) {
        var assembledTools = (0, tools_js_1.assembleToolPool)(appState.toolPermissionContext, appState.mcp.tools);
        var allTools = (0, uniqBy_js_1.default)((0, toolPool_js_1.mergeAndFilterTools)(__spreadArray(__spreadArray(__spreadArray([], tools, true), sdkTools, true), dynamicMcpState.tools, true), assembledTools, appState.toolPermissionContext.mode), 'name');
        if (options.permissionPromptToolName) {
            allTools = allTools.filter(function (tool) { return !(0, Tool_js_1.toolMatchesName)(tool, options.permissionPromptToolName); });
        }
        var initJsonSchema = (0, state_js_1.getInitJsonSchema)();
        if (initJsonSchema && !options.jsonSchema) {
            var syntheticOutputResult = (0, SyntheticOutputTool_js_1.createSyntheticOutputTool)(initJsonSchema);
            if ('tool' in syntheticOutputResult) {
                allTools = __spreadArray(__spreadArray([], allTools, true), [syntheticOutputResult.tool], false);
            }
        }
        return allTools;
    };
    // Bridge handle for remote-control (SDK control message).
    // Mirrors the REPL's useReplBridge hook: the handle is created when
    // `remote_control` is enabled and torn down when disabled.
    var bridgeHandle = null;
    // Cursor into mutableMessages — tracks how far we've forwarded.
    // Same index-based diff as useReplBridge's lastWrittenIndexRef.
    var bridgeLastForwardedIndex = 0;
    // Forward new messages from mutableMessages to the bridge.
    // Called incrementally during each turn (so claude.ai sees progress
    // and stays alive during permission waits) and again after the turn.
    //
    // writeMessages has its own UUID-based dedup (initialMessageUUIDs,
    // recentPostedUUIDs) — the index cursor here is a pre-filter to avoid
    // O(n) re-scanning of already-sent messages on every call.
    function forwardMessagesToBridge() {
        if (!bridgeHandle)
            return;
        // Guard against mutableMessages shrinking (compaction truncates it).
        var startIndex = Math.min(bridgeLastForwardedIndex, mutableMessages.length);
        var newMessages = mutableMessages
            .slice(startIndex)
            .filter(function (m) { return m.type === 'user' || m.type === 'assistant'; });
        bridgeLastForwardedIndex = mutableMessages.length;
        if (newMessages.length > 0) {
            bridgeHandle.writeMessages(newMessages);
        }
    }
    // Helper to apply MCP server changes - used by both mcp_set_servers control message
    // and background plugin installation.
    // NOTE: Nested function required - mutates closure state (sdkMcpConfigs, sdkClients, etc.)
    var mcpChangesPromise = Promise.resolve({
        response: {
            added: [],
            removed: [],
            errors: {},
        },
        sdkServersChanged: false,
    });
    function applyMcpServerChanges(servers) {
        var _this = this;
        // Serialize calls to prevent race conditions between concurrent callers
        // (background plugin install and mcp_set_servers control messages)
        var doWork = function () { return __awaiter(_this, void 0, void 0, function () {
            var oldSdkClientNames, result, _i, _a, key, newSdkClientNames, allSdkNames_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        oldSdkClientNames = new Set(sdkClients.map(function (c) { return c.name; }));
                        return [4 /*yield*/, handleMcpSetServers(servers, { configs: sdkMcpConfigs, clients: sdkClients, tools: sdkTools }, dynamicMcpState, setAppState)
                            // Update SDK state (need to mutate sdkMcpConfigs since it's shared)
                        ];
                    case 1:
                        result = _b.sent();
                        // Update SDK state (need to mutate sdkMcpConfigs since it's shared)
                        for (_i = 0, _a = Object.keys(sdkMcpConfigs); _i < _a.length; _i++) {
                            key = _a[_i];
                            delete sdkMcpConfigs[key];
                        }
                        Object.assign(sdkMcpConfigs, result.newSdkState.configs);
                        sdkClients = result.newSdkState.clients;
                        sdkTools = result.newSdkState.tools;
                        dynamicMcpState = result.newDynamicState;
                        // Keep appState.mcp.tools in sync so subagents can see SDK MCP tools.
                        // Use both old and new SDK client names to remove stale tools.
                        if (result.sdkServersChanged) {
                            newSdkClientNames = new Set(sdkClients.map(function (c) { return c.name; }));
                            allSdkNames_2 = (0, array_js_1.uniq)(__spreadArray(__spreadArray([], oldSdkClientNames, true), newSdkClientNames, true));
                            setAppState(function (prev) { return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { tools: __spreadArray(__spreadArray([], prev.mcp.tools.filter(function (t) {
                                        return !allSdkNames_2.some(function (name) {
                                            return t.name.startsWith((0, mcpStringUtils_js_1.getMcpPrefix)(name));
                                        });
                                    }), true), sdkTools, true) }) })); });
                        }
                        return [2 /*return*/, {
                                response: result.response,
                                sdkServersChanged: result.sdkServersChanged,
                            }];
                }
            });
        }); };
        mcpChangesPromise = mcpChangesPromise.then(doWork, doWork);
        return mcpChangesPromise;
    }
    // Build McpServerStatus[] for control responses. Shared by mcp_status and
    // reload_plugins handlers. Reads closure state: sdkClients, dynamicMcpState.
    function buildMcpServerStatuses() {
        var currentAppState = getAppState();
        var currentMcpClients = currentAppState.mcp.clients;
        var allMcpTools = (0, uniqBy_js_1.default)(__spreadArray(__spreadArray([], currentAppState.mcp.tools, true), dynamicMcpState.tools, true), 'name');
        var existingNames = new Set(__spreadArray(__spreadArray([], currentMcpClients.map(function (c) { return c.name; }), true), sdkClients.map(function (c) { return c.name; }), true));
        return __spreadArray(__spreadArray(__spreadArray([], currentMcpClients, true), sdkClients, true), dynamicMcpState.clients.filter(function (c) { return !existingNames.has(c.name); }), true).map(function (connection) {
            var config;
            if (connection.config.type === 'sse' ||
                connection.config.type === 'http') {
                config = {
                    type: connection.config.type,
                    url: connection.config.url,
                    headers: connection.config.headers,
                    oauth: connection.config.oauth,
                };
            }
            else if (connection.config.type === 'claudeai-proxy') {
                config = {
                    type: 'claudeai-proxy',
                    url: connection.config.url,
                    id: connection.config.id,
                };
            }
            else if (connection.config.type === 'stdio' ||
                connection.config.type === undefined) {
                config = {
                    type: 'stdio',
                    command: connection.config.command,
                    args: connection.config.args,
                };
            }
            var serverTools = connection.type === 'connected'
                ? (0, utils_js_1.filterToolsByServer)(allMcpTools, connection.name).map(function (tool) {
                    var _a, _b, _c, _d;
                    return ({
                        name: (_b = (_a = tool.mcpInfo) === null || _a === void 0 ? void 0 : _a.toolName) !== null && _b !== void 0 ? _b : tool.name,
                        annotations: {
                            readOnly: tool.isReadOnly({}) || undefined,
                            destructive: ((_c = tool.isDestructive) === null || _c === void 0 ? void 0 : _c.call(tool, {})) || undefined,
                            openWorld: ((_d = tool.isOpenWorld) === null || _d === void 0 ? void 0 : _d.call(tool, {})) || undefined,
                        },
                    });
                })
                : undefined;
            // Capabilities passthrough with allowlist pre-filter. The IDE reads
            // experimental['claude/channel'] to decide whether to show the
            // Enable-channel prompt — only echo it if channel_enable would
            // actually pass the allowlist. Not a security boundary (the
            // handler re-runs the full gate); just avoids dead buttons.
            var capabilities;
            if (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) &&
                connection.type === 'connected' &&
                connection.capabilities.experimental) {
                var exp = __assign({}, connection.capabilities.experimental);
                if (exp['claude/channel'] &&
                    (!(0, channelAllowlist_js_1.isChannelsEnabled)() ||
                        !(0, channelAllowlist_js_1.isChannelAllowlisted)(connection.config.pluginSource))) {
                    delete exp['claude/channel'];
                }
                if (Object.keys(exp).length > 0) {
                    capabilities = { experimental: exp };
                }
            }
            return {
                name: connection.name,
                status: connection.type,
                serverInfo: connection.type === 'connected' ? connection.serverInfo : undefined,
                error: connection.type === 'failed' ? connection.error : undefined,
                config: config,
                scope: connection.config.scope,
                tools: serverTools,
                capabilities: capabilities,
            };
        });
    }
    // NOTE: Nested function required - needs closure access to applyMcpServerChanges and updateSdkMcp
    function installPluginsAndApplyMcpInBackground() {
        return __awaiter(this, void 0, void 0, function () {
            var pluginsInstalled, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        // Join point for user settings (fired at runHeadless entry) and managed
                        // settings (fired in main.tsx preAction). downloadUserSettings() caches
                        // its promise so this awaits the same in-flight request.
                        return [4 /*yield*/, Promise.all([
                                (0, bun_bundle_1.feature)('DOWNLOAD_USER_SETTINGS') &&
                                    ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) || (0, state_js_2.getIsRemoteMode)())
                                    ? (0, diagLogs_js_1.withDiagnosticsTiming)('headless_user_settings_download', function () {
                                        return (0, index_js_1.downloadUserSettings)();
                                    })
                                    : Promise.resolve(),
                                (0, diagLogs_js_1.withDiagnosticsTiming)('headless_managed_settings_wait', function () {
                                    return (0, index_js_2.waitForRemoteManagedSettingsToLoad)();
                                }),
                            ])];
                    case 1:
                        // Join point for user settings (fired at runHeadless entry) and managed
                        // settings (fired in main.tsx preAction). downloadUserSettings() caches
                        // its promise so this awaits the same in-flight request.
                        _a.sent();
                        return [4 /*yield*/, (0, headlessPluginInstall_js_1.installPluginsForHeadless)()];
                    case 2:
                        pluginsInstalled = _a.sent();
                        if (!pluginsInstalled) return [3 /*break*/, 4];
                        return [4 /*yield*/, applyPluginMcpDiff()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        (0, log_js_1.logError)(error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    // Background plugin installation for all headless users
    // Installs marketplaces from extraKnownMarketplaces and missing enabled plugins
    // CLAUDE_CODE_SYNC_PLUGIN_INSTALL=true: resolved in run() before the first
    // query so plugins are guaranteed available on the first ask().
    var pluginInstallPromise = null;
    // --bare / SIMPLE: skip plugin install. Scripted calls don't add plugins
    // mid-session; the next interactive run reconciles.
    if (!(0, envUtils_js_1.isBareMode)()) {
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SYNC_PLUGIN_INSTALL)) {
            pluginInstallPromise = installPluginsAndApplyMcpInBackground();
        }
        else {
            void installPluginsAndApplyMcpInBackground();
        }
    }
    // Idle timeout management
    var idleTimeout = (0, idleTimeout_js_1.createIdleTimeoutManager)(function () { return !running; });
    // Mutable commands and agents for hot reloading
    var currentCommands = commands;
    var currentAgents = agents;
    // Clear all plugin-related caches, reload commands/agents/hooks.
    // Called after CLAUDE_CODE_SYNC_PLUGIN_INSTALL completes (before first query)
    // and after non-sync background install finishes.
    // refreshActivePlugins calls clearAllCaches() which is required because
    // loadAllPlugins() may have run during main.tsx startup BEFORE managed
    // settings were fetched. Without clearing, getCommands() would rebuild
    // from a stale plugin list.
    function refreshPluginState() {
        return __awaiter(this, void 0, void 0, function () {
            var freshAgentDefs, sdkAgents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, refresh_js_1.refreshActivePlugins)(setAppState)
                        // Headless-specific: currentCommands/currentAgents are local mutable refs
                        // captured by the query loop (REPL uses AppState instead). getCommands is
                        // fresh because refreshActivePlugins cleared its cache.
                    ];
                    case 1:
                        freshAgentDefs = (_a.sent()).agentDefinitions;
                        return [4 /*yield*/, (0, commands_js_2.getCommands)((0, process_1.cwd)())
                            // Preserve SDK-provided agents (--agents CLI flag or SDK initialize
                            // control_request) — both inject via parseAgentsFromJson with
                            // source='flagSettings'. loadMarkdownFilesForSubdir never assigns this
                            // source, so it cleanly discriminates "injected, not disk-loadable".
                            //
                            // The previous filter used a negative set-diff (!freshAgentTypes.has(a))
                            // which also matched plugin agents that were in the poisoned initial
                            // currentAgents but correctly excluded from freshAgentDefs after managed
                            // settings applied — leaking policy-blocked agents into the init message.
                            // See gh-23085: isBridgeEnabled() at Commander-definition time poisoned
                            // the settings cache before setEligibility(true) ran.
                        ];
                    case 2:
                        // Headless-specific: currentCommands/currentAgents are local mutable refs
                        // captured by the query loop (REPL uses AppState instead). getCommands is
                        // fresh because refreshActivePlugins cleared its cache.
                        currentCommands = _a.sent();
                        sdkAgents = currentAgents.filter(function (a) { return a.source === 'flagSettings'; });
                        currentAgents = __spreadArray(__spreadArray([], freshAgentDefs.allAgents, true), sdkAgents, true);
                        return [2 /*return*/];
                }
            });
        });
    }
    // Re-diff MCP configs after plugin state changes. Filters to
    // process-transport-supported types and carries SDK-mode servers through
    // so applyMcpServerChanges' diff doesn't close their transports.
    // Nested: needs closure access to sdkMcpConfigs, applyMcpServerChanges,
    // updateSdkMcp.
    function applyPluginMcpDiff() {
        return __awaiter(this, void 0, void 0, function () {
            var newConfigs, supportedConfigs, _i, _a, _b, name_1, config, type, _c, _d, _e, name_2, config, _f, response, sdkServersChanged;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, (0, config_js_2.getAllMcpConfigs)()];
                    case 1:
                        newConfigs = (_g.sent()).servers;
                        supportedConfigs = {};
                        for (_i = 0, _a = Object.entries(newConfigs); _i < _a.length; _i++) {
                            _b = _a[_i], name_1 = _b[0], config = _b[1];
                            type = config.type;
                            if (type === undefined ||
                                type === 'stdio' ||
                                type === 'sse' ||
                                type === 'http' ||
                                type === 'sdk') {
                                supportedConfigs[name_1] = config;
                            }
                        }
                        for (_c = 0, _d = Object.entries(sdkMcpConfigs); _c < _d.length; _c++) {
                            _e = _d[_c], name_2 = _e[0], config = _e[1];
                            if (config.type === 'sdk' && !(name_2 in supportedConfigs)) {
                                supportedConfigs[name_2] = config;
                            }
                        }
                        return [4 /*yield*/, applyMcpServerChanges(supportedConfigs)];
                    case 2:
                        _f = _g.sent(), response = _f.response, sdkServersChanged = _f.sdkServersChanged;
                        if (sdkServersChanged) {
                            void updateSdkMcp();
                        }
                        (0, debug_js_1.logForDebugging)("Headless MCP refresh: added=".concat(response.added.length, ", removed=").concat(response.removed.length));
                        return [2 /*return*/];
                }
            });
        });
    }
    // Subscribe to skill changes for hot reloading
    var unsubscribeSkillChanges = skillChangeDetector_js_1.skillChangeDetector.subscribe(function () {
        (0, commands_js_2.clearCommandsCache)();
        void (0, commands_js_2.getCommands)((0, process_1.cwd)()).then(function (newCommands) {
            currentCommands = newCommands;
        });
    });
    // Proactive mode: schedule a tick to keep the model looping autonomously.
    // setTimeout(0) yields to the event loop so pending stdin messages
    // (interrupts, user messages) are processed before the tick fires.
    var scheduleProactiveTick = (0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
        ? function () {
            setTimeout(function () {
                if (!(proactiveModule === null || proactiveModule === void 0 ? void 0 : proactiveModule.isProactiveActive()) ||
                    proactiveModule.isProactivePaused() ||
                    inputClosed) {
                    return;
                }
                var tickContent = "<".concat(xml_js_1.TICK_TAG, ">").concat(new Date().toLocaleTimeString(), "</").concat(xml_js_1.TICK_TAG, ">");
                (0, messageQueueManager_js_1.enqueue)({
                    mode: 'prompt',
                    value: tickContent,
                    uuid: (0, crypto_1.randomUUID)(),
                    priority: 'later',
                    isMeta: true,
                });
                void run();
            }, 0);
        }
        : undefined;
    // Abort the current operation when a 'now' priority message arrives.
    (0, messageQueueManager_js_1.subscribeToCommandQueue)(function () {
        if (abortController && (0, messageQueueManager_js_1.getCommandsByMaxPriority)('now').length > 0) {
            abortController.abort('interrupt');
        }
    });
    var run = function () { return __awaiter(_this, void 0, void 0, function () {
        var timeoutMs, timeout, result, setupPluginHookHotReload, isMainThread, command_1, waitingForAgents, drainCommandQueue, _i, _a, event_1, state, hasRunningBg, hasMainThreadQueued, error_2, _b, _c, _d, event_2, currentAppState, teamContext, agentName, POLL_INTERVAL_MS, refreshedState, hasActiveTeammates, unread, teamName, _loop_2, _e, unread_1, m, formatted, hasActiveSwarm;
        var _this = this;
        var _f, _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    if (running) {
                        return [2 /*return*/];
                    }
                    running = true;
                    runPhase = undefined;
                    (0, sessionState_js_1.notifySessionStateChanged)('running');
                    idleTimeout.stop();
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('run_entry');
                    // TODO(custom-tool-refactor): Should move to the init message, like browser
                    return [4 /*yield*/, updateSdkMcp()];
                case 1:
                    // TODO(custom-tool-refactor): Should move to the init message, like browser
                    _o.sent();
                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('after_updateSdkMcp');
                    if (!pluginInstallPromise) return [3 /*break*/, 8];
                    timeoutMs = parseInt(process.env.CLAUDE_CODE_SYNC_PLUGIN_INSTALL_TIMEOUT_MS || '', 10);
                    if (!(timeoutMs > 0)) return [3 /*break*/, 3];
                    timeout = (0, sleep_js_1.sleep)(timeoutMs).then(function () { return 'timeout'; });
                    return [4 /*yield*/, Promise.race([pluginInstallPromise, timeout])];
                case 2:
                    result = _o.sent();
                    if (result === 'timeout') {
                        (0, log_js_1.logError)(new Error("CLAUDE_CODE_SYNC_PLUGIN_INSTALL: plugin installation timed out after ".concat(timeoutMs, "ms")));
                        (0, index_js_3.logEvent)('tengu_sync_plugin_install_timeout', {
                            timeout_ms: timeoutMs,
                        });
                    }
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, pluginInstallPromise];
                case 4:
                    _o.sent();
                    _o.label = 5;
                case 5:
                    pluginInstallPromise = null;
                    // Refresh commands, agents, and hooks now that plugins are installed
                    return [4 /*yield*/, refreshPluginState()
                        // Set up hot-reload for plugin hooks now that the initial install is done.
                        // In sync-install mode, setup.ts skips this to avoid racing with the install.
                    ];
                case 6:
                    // Refresh commands, agents, and hooks now that plugins are installed
                    _o.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/plugins/loadPluginHooks.js'); })];
                case 7:
                    setupPluginHookHotReload = (_o.sent()).setupPluginHookHotReload;
                    setupPluginHookHotReload();
                    _o.label = 8;
                case 8:
                    isMainThread = function (cmd) { return cmd.agentId === undefined; };
                    _o.label = 9;
                case 9:
                    _o.trys.push([9, 15, 20, 22]);
                    waitingForAgents = false;
                    drainCommandQueue = function () { return __awaiter(_this, void 0, void 0, function () {
                        var _loop_3;
                        var _this = this;
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        return __generator(this, function (_l) {
                            switch (_l.label) {
                                case 0:
                                    _loop_3 = function () {
                                        var batch, batchUuids, _i, batch_1, c, appState, allMcpClients, _m, allMcpClients_1, client, allTools, _o, batchUuids_1, uuid, notificationText, taskIdMatch, toolUseIdMatch, outputFileMatch, statusMatch, summaryMatch, isValidStatus, rawStatus, status_1, usageMatch, usageContent, totalTokensMatch, toolUsesMatch, durationMsMatch, input, inputText, turnStartTime, cmd, _p, batchUuids_2, uuid, state, localAbort_1, cacheSafeParams_1, ref_1;
                                        return __generator(this, function (_q) {
                                            switch (_q.label) {
                                                case 0:
                                                    if (command_1.mode !== 'prompt' &&
                                                        command_1.mode !== 'orphaned-permission' &&
                                                        command_1.mode !== 'task-notification') {
                                                        throw new Error('only prompt commands are supported in streaming mode');
                                                    }
                                                    batch = [command_1];
                                                    if (command_1.mode === 'prompt') {
                                                        while (canBatchWith(command_1, (0, messageQueueManager_js_1.peek)(isMainThread))) {
                                                            batch.push((0, messageQueueManager_js_1.dequeue)(isMainThread));
                                                        }
                                                        if (batch.length > 1) {
                                                            command_1 = __assign(__assign({}, command_1), { value: joinPromptValues(batch.map(function (c) { return c.value; })), uuid: (_b = (_a = batch.findLast(function (c) { return c.uuid; })) === null || _a === void 0 ? void 0 : _a.uuid) !== null && _b !== void 0 ? _b : command_1.uuid });
                                                        }
                                                    }
                                                    batchUuids = batch.map(function (c) { return c.uuid; }).filter(function (u) { return u !== undefined; });
                                                    // QueryEngine will emit a replay for command.uuid (the last uuid in
                                                    // the batch) via its messagesToAck path. Emit replays here for the
                                                    // rest so consumers that track per-uuid delivery (clank's
                                                    // asyncMessages footer, CCR) see an ack for every message they sent,
                                                    // not just the one that survived the merge.
                                                    if (options.replayUserMessages && batch.length > 1) {
                                                        for (_i = 0, batch_1 = batch; _i < batch_1.length; _i++) {
                                                            c = batch_1[_i];
                                                            if (c.uuid && c.uuid !== command_1.uuid) {
                                                                output.enqueue({
                                                                    type: 'user',
                                                                    message: { role: 'user', content: c.value },
                                                                    session_id: (0, state_js_2.getSessionId)(),
                                                                    parent_tool_use_id: null,
                                                                    uuid: c.uuid,
                                                                    isReplay: true,
                                                                });
                                                            }
                                                        }
                                                    }
                                                    appState = getAppState();
                                                    allMcpClients = __spreadArray(__spreadArray(__spreadArray([], appState.mcp.clients, true), sdkClients, true), dynamicMcpState.clients, true);
                                                    registerElicitationHandlers(allMcpClients);
                                                    // Channel handlers for servers allowlisted via --channels at
                                                    // construction time (or enableChannel() mid-session). Runs every
                                                    // turn like registerElicitationHandlers — idempotent per-client
                                                    // (setNotificationHandler replaces, not stacks) and no-ops for
                                                    // non-allowlisted servers (one feature-flag check).
                                                    for (_m = 0, allMcpClients_1 = allMcpClients; _m < allMcpClients_1.length; _m++) {
                                                        client = allMcpClients_1[_m];
                                                        reregisterChannelHandlerAfterReconnect(client);
                                                    }
                                                    allTools = buildAllTools(appState);
                                                    for (_o = 0, batchUuids_1 = batchUuids; _o < batchUuids_1.length; _o++) {
                                                        uuid = batchUuids_1[_o];
                                                        (0, commandLifecycle_js_1.notifyCommandLifecycle)(uuid, 'started');
                                                    }
                                                    // Task notifications arrive when background agents complete.
                                                    // Emit an SDK system event for SDK consumers, then fall through
                                                    // to ask() so the model sees the agent result and can act on it.
                                                    // This matches TUI behavior where useQueueProcessor always feeds
                                                    // notifications to the model regardless of coordinator mode.
                                                    if (command_1.mode === 'task-notification') {
                                                        notificationText = typeof command_1.value === 'string' ? command_1.value : '';
                                                        taskIdMatch = notificationText.match(/<task-id>([^<]+)<\/task-id>/);
                                                        toolUseIdMatch = notificationText.match(/<tool-use-id>([^<]+)<\/tool-use-id>/);
                                                        outputFileMatch = notificationText.match(/<output-file>([^<]+)<\/output-file>/);
                                                        statusMatch = notificationText.match(/<status>([^<]+)<\/status>/);
                                                        summaryMatch = notificationText.match(/<summary>([^<]+)<\/summary>/);
                                                        isValidStatus = function (s) {
                                                            return s === 'completed' ||
                                                                s === 'failed' ||
                                                                s === 'stopped' ||
                                                                s === 'killed';
                                                        };
                                                        rawStatus = statusMatch === null || statusMatch === void 0 ? void 0 : statusMatch[1];
                                                        status_1 = isValidStatus(rawStatus)
                                                            ? rawStatus === 'killed'
                                                                ? 'stopped'
                                                                : rawStatus
                                                            : 'completed';
                                                        usageMatch = notificationText.match(/<usage>([\s\S]*?)<\/usage>/);
                                                        usageContent = (_c = usageMatch === null || usageMatch === void 0 ? void 0 : usageMatch[1]) !== null && _c !== void 0 ? _c : '';
                                                        totalTokensMatch = usageContent.match(/<total_tokens>(\d+)<\/total_tokens>/);
                                                        toolUsesMatch = usageContent.match(/<tool_uses>(\d+)<\/tool_uses>/);
                                                        durationMsMatch = usageContent.match(/<duration_ms>(\d+)<\/duration_ms>/);
                                                        // Only emit a task_notification SDK event when a <status> tag is
                                                        // present — that means this is a terminal notification (completed/
                                                        // failed/stopped). Stream events from enqueueStreamEvent carry no
                                                        // <status> (they're progress pings); emitting them here would
                                                        // default to 'completed' and falsely close the task for SDK
                                                        // consumers. Terminal bookends are now emitted directly via
                                                        // emitTaskTerminatedSdk, so skipping statusless events is safe.
                                                        if (statusMatch) {
                                                            output.enqueue({
                                                                type: 'system',
                                                                subtype: 'task_notification',
                                                                task_id: (_d = taskIdMatch === null || taskIdMatch === void 0 ? void 0 : taskIdMatch[1]) !== null && _d !== void 0 ? _d : '',
                                                                tool_use_id: toolUseIdMatch === null || toolUseIdMatch === void 0 ? void 0 : toolUseIdMatch[1],
                                                                status: status_1,
                                                                output_file: (_e = outputFileMatch === null || outputFileMatch === void 0 ? void 0 : outputFileMatch[1]) !== null && _e !== void 0 ? _e : '',
                                                                summary: (_f = summaryMatch === null || summaryMatch === void 0 ? void 0 : summaryMatch[1]) !== null && _f !== void 0 ? _f : '',
                                                                usage: totalTokensMatch && toolUsesMatch
                                                                    ? {
                                                                        total_tokens: parseInt(totalTokensMatch[1], 10),
                                                                        tool_uses: parseInt(toolUsesMatch[1], 10),
                                                                        duration_ms: durationMsMatch
                                                                            ? parseInt(durationMsMatch[1], 10)
                                                                            : 0,
                                                                    }
                                                                    : undefined,
                                                                session_id: (0, state_js_2.getSessionId)(),
                                                                uuid: (0, crypto_1.randomUUID)(),
                                                            });
                                                        }
                                                        // No continue -- fall through to ask() so the model processes the result
                                                    }
                                                    input = command_1.value;
                                                    if (structuredIO instanceof remoteIO_js_1.RemoteIO && command_1.mode === 'prompt') {
                                                        (0, index_js_3.logEvent)('tengu_bridge_message_received', {
                                                            is_repl: false,
                                                        });
                                                    }
                                                    // Abort any in-flight suggestion generation and track acceptance
                                                    (_g = suggestionState.abortController) === null || _g === void 0 ? void 0 : _g.abort();
                                                    suggestionState.abortController = null;
                                                    suggestionState.pendingSuggestion = null;
                                                    suggestionState.pendingLastEmittedEntry = null;
                                                    if (suggestionState.lastEmitted) {
                                                        if (command_1.mode === 'prompt') {
                                                            inputText = typeof input === 'string'
                                                                ? input
                                                                : (_h = input.find(function (b) { return b.type === 'text'; })) === null || _h === void 0 ? void 0 : _h.text;
                                                            if (typeof inputText === 'string') {
                                                                (0, promptSuggestion_js_1.logSuggestionOutcome)(suggestionState.lastEmitted.text, inputText, suggestionState.lastEmitted.emittedAt, suggestionState.lastEmitted.promptId, suggestionState.lastEmitted.generationRequestId);
                                                            }
                                                            suggestionState.lastEmitted = null;
                                                        }
                                                    }
                                                    abortController = (0, abortController_js_1.createAbortController)();
                                                    turnStartTime = (0, bun_bundle_1.feature)('FILE_PERSISTENCE')
                                                        ? Date.now()
                                                        : undefined;
                                                    (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('before_ask');
                                                    (0, queryProfiler_js_1.startQueryProfile)();
                                                    cmd = command_1;
                                                    return [4 /*yield*/, (0, workloadContext_js_1.runWithWorkload)((_j = cmd.workload) !== null && _j !== void 0 ? _j : options.workload, function () { return __awaiter(_this, void 0, void 0, function () {
                                                            var _a, _b, _c, message, _i, _d, event_3, currentState, _e, _f, event_4, e_2_1;
                                                            var _g, e_2, _h, _j;
                                                            var _k;
                                                            return __generator(this, function (_l) {
                                                                switch (_l.label) {
                                                                    case 0:
                                                                        _l.trys.push([0, 5, 6, 11]);
                                                                        _a = true, _b = __asyncValues((0, QueryEngine_js_1.ask)({
                                                                            commands: (0, uniqBy_js_1.default)(__spreadArray(__spreadArray([], currentCommands, true), appState.mcp.commands, true), 'name'),
                                                                            prompt: input,
                                                                            promptUuid: cmd.uuid,
                                                                            isMeta: cmd.isMeta,
                                                                            cwd: (0, process_1.cwd)(),
                                                                            tools: allTools,
                                                                            verbose: options.verbose,
                                                                            mcpClients: allMcpClients,
                                                                            thinkingConfig: options.thinkingConfig,
                                                                            maxTurns: options.maxTurns,
                                                                            maxBudgetUsd: options.maxBudgetUsd,
                                                                            taskBudget: options.taskBudget,
                                                                            canUseTool: canUseTool,
                                                                            userSpecifiedModel: activeUserSpecifiedModel,
                                                                            fallbackModel: options.fallbackModel,
                                                                            jsonSchema: (_k = (0, state_js_1.getInitJsonSchema)()) !== null && _k !== void 0 ? _k : options.jsonSchema,
                                                                            mutableMessages: mutableMessages,
                                                                            getReadFileCache: function () {
                                                                                return pendingSeeds.size === 0
                                                                                    ? readFileState
                                                                                    : (0, fileStateCache_js_1.mergeFileStateCaches)(readFileState, pendingSeeds);
                                                                            },
                                                                            setReadFileCache: function (cache) {
                                                                                readFileState = cache;
                                                                                for (var _i = 0, _a = pendingSeeds.entries(); _i < _a.length; _i++) {
                                                                                    var _b = _a[_i], path = _b[0], seed = _b[1];
                                                                                    var existing = readFileState.get(path);
                                                                                    if (!existing || seed.timestamp > existing.timestamp) {
                                                                                        readFileState.set(path, seed);
                                                                                    }
                                                                                }
                                                                                pendingSeeds.clear();
                                                                            },
                                                                            customSystemPrompt: options.systemPrompt,
                                                                            appendSystemPrompt: options.appendSystemPrompt,
                                                                            getAppState: getAppState,
                                                                            setAppState: setAppState,
                                                                            abortController: abortController,
                                                                            replayUserMessages: options.replayUserMessages,
                                                                            includePartialMessages: options.includePartialMessages,
                                                                            handleElicitation: function (serverName, params, elicitSignal) {
                                                                                return structuredIO.handleElicitation(serverName, params.message, undefined, elicitSignal, params.mode, params.url, 'elicitationId' in params ? params.elicitationId : undefined);
                                                                            },
                                                                            agents: currentAgents,
                                                                            orphanedPermission: cmd.orphanedPermission,
                                                                            setSDKStatus: function (status) {
                                                                                output.enqueue({
                                                                                    type: 'system',
                                                                                    subtype: 'status',
                                                                                    status: status,
                                                                                    session_id: (0, state_js_2.getSessionId)(),
                                                                                    uuid: (0, crypto_1.randomUUID)(),
                                                                                });
                                                                            },
                                                                        }));
                                                                        _l.label = 1;
                                                                    case 1: return [4 /*yield*/, _b.next()];
                                                                    case 2:
                                                                        if (!(_c = _l.sent(), _g = _c.done, !_g)) return [3 /*break*/, 4];
                                                                        _j = _c.value;
                                                                        _a = false;
                                                                        message = _j;
                                                                        // Forward messages to bridge incrementally (mid-turn) so
                                                                        // claude.ai sees progress and the connection stays alive
                                                                        // while blocked on permission requests.
                                                                        forwardMessagesToBridge();
                                                                        if (message.type === 'result') {
                                                                            // Flush pending SDK events so they appear before result on the stream.
                                                                            for (_i = 0, _d = (0, sdkEventQueue_js_1.drainSdkEvents)(); _i < _d.length; _i++) {
                                                                                event_3 = _d[_i];
                                                                                output.enqueue(event_3);
                                                                            }
                                                                            currentState = getAppState();
                                                                            if ((0, framework_js_1.getRunningTasks)(currentState).some(function (t) {
                                                                                return (t.type === 'local_agent' ||
                                                                                    t.type === 'local_workflow') &&
                                                                                    (0, types_js_2.isBackgroundTask)(t);
                                                                            })) {
                                                                                heldBackResult = message;
                                                                            }
                                                                            else {
                                                                                heldBackResult = null;
                                                                                output.enqueue(message);
                                                                            }
                                                                        }
                                                                        else {
                                                                            // Flush SDK events (task_started, task_progress) so background
                                                                            // agent progress is streamed in real-time, not batched until result.
                                                                            for (_e = 0, _f = (0, sdkEventQueue_js_1.drainSdkEvents)(); _e < _f.length; _e++) {
                                                                                event_4 = _f[_e];
                                                                                output.enqueue(event_4);
                                                                            }
                                                                            output.enqueue(message);
                                                                        }
                                                                        _l.label = 3;
                                                                    case 3:
                                                                        _a = true;
                                                                        return [3 /*break*/, 1];
                                                                    case 4: return [3 /*break*/, 11];
                                                                    case 5:
                                                                        e_2_1 = _l.sent();
                                                                        e_2 = { error: e_2_1 };
                                                                        return [3 /*break*/, 11];
                                                                    case 6:
                                                                        _l.trys.push([6, , 9, 10]);
                                                                        if (!(!_a && !_g && (_h = _b.return))) return [3 /*break*/, 8];
                                                                        return [4 /*yield*/, _h.call(_b)];
                                                                    case 7:
                                                                        _l.sent();
                                                                        _l.label = 8;
                                                                    case 8: return [3 /*break*/, 10];
                                                                    case 9:
                                                                        if (e_2) throw e_2.error;
                                                                        return [7 /*endfinally*/];
                                                                    case 10: return [7 /*endfinally*/];
                                                                    case 11: return [2 /*return*/];
                                                                }
                                                            });
                                                        }); })]; // end runWithWorkload
                                                case 1:
                                                    _q.sent(); // end runWithWorkload
                                                    for (_p = 0, batchUuids_2 = batchUuids; _p < batchUuids_2.length; _p++) {
                                                        uuid = batchUuids_2[_p];
                                                        (0, commandLifecycle_js_1.notifyCommandLifecycle)(uuid, 'completed');
                                                    }
                                                    // Forward messages to bridge after each turn
                                                    forwardMessagesToBridge();
                                                    bridgeHandle === null || bridgeHandle === void 0 ? void 0 : bridgeHandle.sendResult();
                                                    if ((0, bun_bundle_1.feature)('FILE_PERSISTENCE') && turnStartTime !== undefined) {
                                                        void (0, filePersistence_js_1.executeFilePersistence)(turnStartTime, abortController.signal, function (result) {
                                                            output.enqueue({
                                                                type: 'system',
                                                                subtype: 'files_persisted',
                                                                files: result.files,
                                                                failed: result.failed,
                                                                processed_at: new Date().toISOString(),
                                                                uuid: (0, crypto_1.randomUUID)(),
                                                                session_id: (0, state_js_2.getSessionId)(),
                                                            });
                                                        });
                                                    }
                                                    // Generate and emit prompt suggestion for SDK consumers
                                                    if (options.promptSuggestions &&
                                                        !(0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION)) {
                                                        state = suggestionState;
                                                        (_k = state.abortController) === null || _k === void 0 ? void 0 : _k.abort();
                                                        localAbort_1 = new AbortController();
                                                        suggestionState.abortController = localAbort_1;
                                                        cacheSafeParams_1 = (0, forkedAgent_js_1.getLastCacheSafeParams)();
                                                        if (!cacheSafeParams_1) {
                                                            (0, promptSuggestion_js_1.logSuggestionSuppressed)('sdk_no_params', undefined, undefined, 'sdk');
                                                        }
                                                        else {
                                                            ref_1 = { promise: null };
                                                            ref_1.promise = (function () { return __awaiter(_this, void 0, void 0, function () {
                                                                var result, suggestionMsg, lastEmittedEntry, error_3;
                                                                return __generator(this, function (_a) {
                                                                    switch (_a.label) {
                                                                        case 0:
                                                                            _a.trys.push([0, 2, 3, 4]);
                                                                            return [4 /*yield*/, (0, promptSuggestion_js_1.tryGenerateSuggestion)(localAbort_1, mutableMessages, getAppState, cacheSafeParams_1, 'sdk')];
                                                                        case 1:
                                                                            result = _a.sent();
                                                                            if (!result || localAbort_1.signal.aborted)
                                                                                return [2 /*return*/];
                                                                            suggestionMsg = {
                                                                                type: 'prompt_suggestion',
                                                                                suggestion: result.suggestion,
                                                                                uuid: (0, crypto_1.randomUUID)(),
                                                                                session_id: (0, state_js_2.getSessionId)(),
                                                                            };
                                                                            lastEmittedEntry = {
                                                                                text: result.suggestion,
                                                                                emittedAt: Date.now(),
                                                                                promptId: result.promptId,
                                                                                generationRequestId: result.generationRequestId,
                                                                            };
                                                                            // Defer emission if the result is being held for background agents,
                                                                            // so that prompt_suggestion always arrives after result.
                                                                            // Only set lastEmitted when the suggestion is actually delivered
                                                                            // to the consumer; deferred suggestions may be discarded before
                                                                            // delivery if a new command arrives first.
                                                                            if (heldBackResult) {
                                                                                suggestionState.pendingSuggestion = suggestionMsg;
                                                                                suggestionState.pendingLastEmittedEntry = {
                                                                                    text: lastEmittedEntry.text,
                                                                                    promptId: lastEmittedEntry.promptId,
                                                                                    generationRequestId: lastEmittedEntry.generationRequestId,
                                                                                };
                                                                            }
                                                                            else {
                                                                                suggestionState.lastEmitted = lastEmittedEntry;
                                                                                output.enqueue(suggestionMsg);
                                                                            }
                                                                            return [3 /*break*/, 4];
                                                                        case 2:
                                                                            error_3 = _a.sent();
                                                                            if (error_3 instanceof Error &&
                                                                                (error_3.name === 'AbortError' ||
                                                                                    error_3.name === 'APIUserAbortError')) {
                                                                                (0, promptSuggestion_js_1.logSuggestionSuppressed)('aborted', undefined, undefined, 'sdk');
                                                                                return [2 /*return*/];
                                                                            }
                                                                            (0, log_js_1.logError)((0, errors_js_1.toError)(error_3));
                                                                            return [3 /*break*/, 4];
                                                                        case 3:
                                                                            if (suggestionState.inflightPromise === ref_1.promise) {
                                                                                suggestionState.inflightPromise = null;
                                                                            }
                                                                            return [7 /*endfinally*/];
                                                                        case 4: return [2 /*return*/];
                                                                    }
                                                                });
                                                            }); })();
                                                            suggestionState.inflightPromise = ref_1.promise;
                                                        }
                                                    }
                                                    // Log headless profiler metrics for this turn and start next turn
                                                    (0, headlessProfiler_js_1.logHeadlessProfilerTurn)();
                                                    (0, queryProfiler_js_1.logQueryProfileReport)();
                                                    (0, headlessProfiler_js_1.headlessProfilerStartTurn)();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _l.label = 1;
                                case 1:
                                    if (!(command_1 = (0, messageQueueManager_js_1.dequeue)(isMainThread))) return [3 /*break*/, 3];
                                    return [5 /*yield**/, _loop_3()];
                                case 2:
                                    _l.sent();
                                    return [3 /*break*/, 1];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    _o.label = 10;
                case 10:
                    // Drain SDK events (task_started, task_progress) before command queue
                    // so progress events precede task_notification on the stream.
                    for (_i = 0, _a = (0, sdkEventQueue_js_1.drainSdkEvents)(); _i < _a.length; _i++) {
                        event_1 = _a[_i];
                        output.enqueue(event_1);
                    }
                    runPhase = 'draining_commands';
                    return [4 /*yield*/, drainCommandQueue()
                        // Check for running background tasks before exiting.
                        // Exclude in_process_teammate — teammates are long-lived by design
                        // (status: 'running' for their whole lifetime, cleaned up by the
                        // shutdown protocol, not by transitioning to 'completed'). Waiting
                        // on them here loops forever (gh-30008). Same exclusion already
                        // exists at useBackgroundTaskNavigation.ts:55 for the same reason;
                        // L1839 above is already narrower (type === 'local_agent') so it
                        // doesn't hit this.
                    ];
                case 11:
                    _o.sent();
                    // Check for running background tasks before exiting.
                    // Exclude in_process_teammate — teammates are long-lived by design
                    // (status: 'running' for their whole lifetime, cleaned up by the
                    // shutdown protocol, not by transitioning to 'completed'). Waiting
                    // on them here loops forever (gh-30008). Same exclusion already
                    // exists at useBackgroundTaskNavigation.ts:55 for the same reason;
                    // L1839 above is already narrower (type === 'local_agent') so it
                    // doesn't hit this.
                    waitingForAgents = false;
                    state = getAppState();
                    hasRunningBg = (0, framework_js_1.getRunningTasks)(state).some(function (t) { return (0, types_js_2.isBackgroundTask)(t) && t.type !== 'in_process_teammate'; });
                    hasMainThreadQueued = (0, messageQueueManager_js_1.peek)(isMainThread) !== undefined;
                    if (!(hasRunningBg || hasMainThreadQueued)) return [3 /*break*/, 13];
                    waitingForAgents = true;
                    if (!!hasMainThreadQueued) return [3 /*break*/, 13];
                    runPhase = 'waiting_for_agents';
                    // No commands ready yet, wait for tasks to complete
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(100)];
                case 12:
                    // No commands ready yet, wait for tasks to complete
                    _o.sent();
                    _o.label = 13;
                case 13:
                    if (waitingForAgents) return [3 /*break*/, 10];
                    _o.label = 14;
                case 14:
                    if (heldBackResult) {
                        output.enqueue(heldBackResult);
                        heldBackResult = null;
                        if (suggestionState.pendingSuggestion) {
                            output.enqueue(suggestionState.pendingSuggestion);
                            // Now that the suggestion is actually delivered, record it for acceptance tracking
                            if (suggestionState.pendingLastEmittedEntry) {
                                suggestionState.lastEmitted = __assign(__assign({}, suggestionState.pendingLastEmittedEntry), { emittedAt: Date.now() });
                                suggestionState.pendingLastEmittedEntry = null;
                            }
                            suggestionState.pendingSuggestion = null;
                        }
                    }
                    return [3 /*break*/, 22];
                case 15:
                    error_2 = _o.sent();
                    _o.label = 16;
                case 16:
                    _o.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, structuredIO.write({
                            type: 'result',
                            subtype: 'error_during_execution',
                            duration_ms: 0,
                            duration_api_ms: 0,
                            is_error: true,
                            num_turns: 0,
                            stop_reason: null,
                            session_id: (0, state_js_2.getSessionId)(),
                            total_cost_usd: 0,
                            usage: logging_js_1.EMPTY_USAGE,
                            modelUsage: {},
                            permission_denials: [],
                            uuid: (0, crypto_1.randomUUID)(),
                            errors: __spreadArray([
                                (0, errors_js_1.errorMessage)(error_2)
                            ], (0, log_js_1.getInMemoryErrors)().map(function (_) { return _.error; }), true),
                        })];
                case 17:
                    _o.sent();
                    return [3 /*break*/, 19];
                case 18:
                    _b = _o.sent();
                    return [3 /*break*/, 19];
                case 19:
                    (_f = suggestionState.abortController) === null || _f === void 0 ? void 0 : _f.abort();
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    return [2 /*return*/];
                case 20:
                    runPhase = 'finally_flush';
                    // Flush pending internal events before going idle
                    return [4 /*yield*/, structuredIO.flushInternalEvents()];
                case 21:
                    // Flush pending internal events before going idle
                    _o.sent();
                    runPhase = 'finally_post_flush';
                    if (!(0, gracefulShutdown_js_1.isShuttingDown)()) {
                        (0, sessionState_js_1.notifySessionStateChanged)('idle');
                        // Drain so the idle session_state_changed SDK event (plus any
                        // terminal task_notification bookends emitted during bg-agent
                        // teardown) reach the output stream before we block on the next
                        // command. The do-while drain above only runs while
                        // waitingForAgents; once we're here the next drain would be the
                        // top of the next run(), which won't come if input is idle.
                        for (_c = 0, _d = (0, sdkEventQueue_js_1.drainSdkEvents)(); _c < _d.length; _c++) {
                            event_2 = _d[_c];
                            output.enqueue(event_2);
                        }
                    }
                    running = false;
                    // Start idle timer when we finish processing and are waiting for input
                    idleTimeout.start();
                    return [7 /*endfinally*/];
                case 22:
                    // Proactive tick: if proactive is active and queue is empty, inject a tick
                    if (((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) &&
                        (proactiveModule === null || proactiveModule === void 0 ? void 0 : proactiveModule.isProactiveActive()) &&
                        !proactiveModule.isProactivePaused()) {
                        if ((0, messageQueueManager_js_1.peek)(isMainThread) === undefined && !inputClosed) {
                            scheduleProactiveTick();
                            return [2 /*return*/];
                        }
                    }
                    // Re-check the queue after releasing the mutex. A message may have
                    // arrived (and called run()) between the last dequeue() returning
                    // undefined and `running = false` above. In that case the caller
                    // saw `running === true` and returned immediately, leaving the
                    // message stranded in the queue with no one to process it.
                    if ((0, messageQueueManager_js_1.peek)(isMainThread) !== undefined) {
                        void run();
                        return [2 /*return*/];
                    }
                    currentAppState = getAppState();
                    teamContext = currentAppState.teamContext;
                    if (!(teamContext && (0, teammate_js_1.isTeamLead)(teamContext))) return [3 /*break*/, 32];
                    agentName = 'team-lead';
                    POLL_INTERVAL_MS = 500;
                    _o.label = 23;
                case 23:
                    if (!true) return [3 /*break*/, 32];
                    refreshedState = getAppState();
                    hasActiveTeammates = (0, teammate_js_1.hasActiveInProcessTeammates)(refreshedState) ||
                        (refreshedState.teamContext &&
                            Object.keys(refreshedState.teamContext.teammates).length > 0);
                    if (!hasActiveTeammates) {
                        (0, debug_js_1.logForDebugging)('[print.ts] No more active teammates, stopping poll');
                        return [3 /*break*/, 32];
                    }
                    return [4 /*yield*/, (0, teammateMailbox_js_1.readUnreadMessages)(agentName, (_g = refreshedState.teamContext) === null || _g === void 0 ? void 0 : _g.teamName)];
                case 24:
                    unread = _o.sent();
                    if (!(unread.length > 0)) return [3 /*break*/, 30];
                    (0, debug_js_1.logForDebugging)("[print.ts] Team-lead found ".concat(unread.length, " unread messages"));
                    // Mark as read immediately to avoid duplicate processing
                    return [4 /*yield*/, (0, teammateMailbox_js_1.markMessagesAsRead)(agentName, (_h = refreshedState.teamContext) === null || _h === void 0 ? void 0 : _h.teamName)
                        // Process shutdown_approved messages - remove teammates from team file
                        // This mirrors what useInboxPoller does in interactive mode (lines 546-606)
                    ];
                case 25:
                    // Mark as read immediately to avoid duplicate processing
                    _o.sent();
                    teamName = (_j = refreshedState.teamContext) === null || _j === void 0 ? void 0 : _j.teamName;
                    _loop_2 = function (m) {
                        var shutdownApproval, teammateToRemove_1, teammateId_1;
                        return __generator(this, function (_p) {
                            switch (_p.label) {
                                case 0:
                                    shutdownApproval = (0, teammateMailbox_js_1.isShutdownApproved)(m.text);
                                    if (!(shutdownApproval && teamName)) return [3 /*break*/, 2];
                                    teammateToRemove_1 = shutdownApproval.from;
                                    (0, debug_js_1.logForDebugging)("[print.ts] Processing shutdown_approved from ".concat(teammateToRemove_1));
                                    teammateId_1 = ((_k = refreshedState.teamContext) === null || _k === void 0 ? void 0 : _k.teammates)
                                        ? (_l = Object.entries(refreshedState.teamContext.teammates).find(function (_a) {
                                            var t = _a[1];
                                            return t.name === teammateToRemove_1;
                                        })) === null || _l === void 0 ? void 0 : _l[0]
                                        : undefined;
                                    if (!teammateId_1) return [3 /*break*/, 2];
                                    // Remove from team file
                                    (0, teamHelpers_js_1.removeTeammateFromTeamFile)(teamName, {
                                        agentId: teammateId_1,
                                        name: teammateToRemove_1,
                                    });
                                    (0, debug_js_1.logForDebugging)("[print.ts] Removed ".concat(teammateToRemove_1, " from team file"));
                                    // Unassign tasks owned by this teammate
                                    return [4 /*yield*/, (0, tasks_js_1.unassignTeammateTasks)(teamName, teammateId_1, teammateToRemove_1, 'shutdown')
                                        // Remove from teamContext in AppState
                                    ];
                                case 1:
                                    // Unassign tasks owned by this teammate
                                    _p.sent();
                                    // Remove from teamContext in AppState
                                    setAppState(function (prev) {
                                        var _a;
                                        if (!((_a = prev.teamContext) === null || _a === void 0 ? void 0 : _a.teammates))
                                            return prev;
                                        if (!(teammateId_1 in prev.teamContext.teammates))
                                            return prev;
                                        var _b = prev.teamContext.teammates, _c = teammateId_1, _ = _b[_c], remainingTeammates = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
                                        return __assign(__assign({}, prev), { teamContext: __assign(__assign({}, prev.teamContext), { teammates: remainingTeammates }) });
                                    });
                                    _p.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    };
                    _e = 0, unread_1 = unread;
                    _o.label = 26;
                case 26:
                    if (!(_e < unread_1.length)) return [3 /*break*/, 29];
                    m = unread_1[_e];
                    return [5 /*yield**/, _loop_2(m)];
                case 27:
                    _o.sent();
                    _o.label = 28;
                case 28:
                    _e++;
                    return [3 /*break*/, 26];
                case 29:
                    formatted = unread
                        .map(function (m) {
                        return "<".concat(xml_js_1.TEAMMATE_MESSAGE_TAG, " teammate_id=\"").concat(m.from, "\"").concat(m.color ? " color=\"".concat(m.color, "\"") : '', ">\n").concat(m.text, "\n</").concat(xml_js_1.TEAMMATE_MESSAGE_TAG, ">");
                    })
                        .join('\n\n');
                    // Enqueue and process
                    (0, messageQueueManager_js_1.enqueue)({
                        mode: 'prompt',
                        value: formatted,
                        uuid: (0, crypto_1.randomUUID)(),
                    });
                    void run();
                    return [2 /*return*/]; // run() will come back here after processing
                case 30:
                    // No messages - check if we need to prompt for shutdown
                    // If input is closed and teammates are active, inject shutdown prompt once
                    if (inputClosed && !shutdownPromptInjected) {
                        shutdownPromptInjected = true;
                        (0, debug_js_1.logForDebugging)('[print.ts] Input closed with active teammates, injecting shutdown prompt');
                        (0, messageQueueManager_js_1.enqueue)({
                            mode: 'prompt',
                            value: SHUTDOWN_TEAM_PROMPT,
                            uuid: (0, crypto_1.randomUUID)(),
                        });
                        void run();
                        return [2 /*return*/]; // run() will come back here after processing
                    }
                    // Wait and check again
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(POLL_INTERVAL_MS)];
                case 31:
                    // Wait and check again
                    _o.sent();
                    return [3 /*break*/, 23];
                case 32:
                    if (!inputClosed) return [3 /*break*/, 38];
                    return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                            var currentAppState, refreshedAppState, refreshedTeamContext, hasTeamMembersNotCleanedUp;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        currentAppState = getAppState();
                                        if (!(0, teammate_js_1.hasWorkingInProcessTeammates)(currentAppState)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, (0, teammate_js_1.waitForTeammatesToBecomeIdle)(setAppState, currentAppState)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        refreshedAppState = getAppState();
                                        refreshedTeamContext = refreshedAppState.teamContext;
                                        hasTeamMembersNotCleanedUp = refreshedTeamContext &&
                                            Object.keys(refreshedTeamContext.teammates).length > 0;
                                        return [2 /*return*/, (hasTeamMembersNotCleanedUp ||
                                                (0, teammate_js_1.hasActiveInProcessTeammates)(refreshedAppState))];
                                }
                            });
                        }); })()];
                case 33:
                    hasActiveSwarm = _o.sent();
                    if (!hasActiveSwarm) return [3 /*break*/, 34];
                    // Team members are idle or pane-based - inject prompt to shut down team
                    (0, messageQueueManager_js_1.enqueue)({
                        mode: 'prompt',
                        value: SHUTDOWN_TEAM_PROMPT,
                        uuid: (0, crypto_1.randomUUID)(),
                    });
                    void run();
                    return [3 /*break*/, 38];
                case 34:
                    if (!suggestionState.inflightPromise) return [3 /*break*/, 36];
                    return [4 /*yield*/, Promise.race([suggestionState.inflightPromise, (0, sleep_js_1.sleep)(5000)])];
                case 35:
                    _o.sent();
                    _o.label = 36;
                case 36:
                    (_m = suggestionState.abortController) === null || _m === void 0 ? void 0 : _m.abort();
                    suggestionState.abortController = null;
                    return [4 /*yield*/, (0, AsyncHookRegistry_js_1.finalizePendingAsyncHooks)()];
                case 37:
                    _o.sent();
                    unsubscribeSkillChanges();
                    unsubscribeAuthStatus === null || unsubscribeAuthStatus === void 0 ? void 0 : unsubscribeAuthStatus();
                    claudeAiLimits_js_1.statusListeners.delete(rateLimitListener);
                    output.done();
                    _o.label = 38;
                case 38: return [2 /*return*/];
            }
        });
    }); };
    // Set up UDS inbox callback so the query loop is kicked off
    // when a message arrives via the UDS socket in headless mode.
    if ((0, bun_bundle_1.feature)('UDS_INBOX')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var setOnEnqueue = require('../utils/udsMessaging.js').setOnEnqueue;
        /* eslint-enable @typescript-eslint/no-require-imports */
        setOnEnqueue(function () {
            if (!inputClosed) {
                void run();
            }
        });
    }
    // Cron scheduler: runs scheduled_tasks.json tasks in SDK/-p mode.
    // Mirrors REPL's useScheduledTasks hook. Fired prompts enqueue + kick
    // off run() directly — unlike REPL, there's no queue subscriber here
    // that drains on enqueue while idle. The run() mutex makes this safe
    // during an active turn: the call no-ops and the post-run recheck at
    // the end of run() picks up the queued command.
    var cronScheduler = null;
    if ((0, bun_bundle_1.feature)('AGENT_TRIGGERS') &&
        cronSchedulerModule &&
        (cronGate === null || cronGate === void 0 ? void 0 : cronGate.isKairosCronEnabled())) {
        cronScheduler = cronSchedulerModule.createCronScheduler({
            onFire: function (prompt) {
                if (inputClosed)
                    return;
                (0, messageQueueManager_js_1.enqueue)({
                    mode: 'prompt',
                    value: prompt,
                    uuid: (0, crypto_1.randomUUID)(),
                    priority: 'later',
                    // System-generated — matches useScheduledTasks.ts REPL equivalent.
                    // Without this, messages.ts metaProp eval is {} → prompt leaks
                    // into visible transcript when cron fires mid-turn in -p mode.
                    isMeta: true,
                    // Threaded to cc_workload= in the billing-header attribution block
                    // so the API can serve cron requests at lower QoS. drainCommandQueue
                    // reads this per-iteration and hoists it into bootstrap state for
                    // the ask() call.
                    workload: workloadContext_js_1.WORKLOAD_CRON,
                });
                void run();
            },
            isLoading: function () { return running || inputClosed; },
            getJitterConfig: cronJitterConfigModule === null || cronJitterConfigModule === void 0 ? void 0 : cronJitterConfigModule.getCronJitterConfig,
            isKilled: function () { return !(cronGate === null || cronGate === void 0 ? void 0 : cronGate.isKairosCronEnabled()); },
        });
        cronScheduler.start();
    }
    var sendControlResponseSuccess = function (message, response) {
        output.enqueue({
            type: 'control_response',
            response: {
                subtype: 'success',
                request_id: message.request_id,
                response: response,
            },
        });
    };
    var sendControlResponseError = function (message, errorMessage) {
        output.enqueue({
            type: 'control_response',
            response: {
                subtype: 'error',
                request_id: message.request_id,
                error: errorMessage,
            },
        });
    };
    // Handle unexpected permission responses by looking up the unresolved tool
    // call in the transcript and executing it
    var handledOrphanedToolUseIds = new Set();
    structuredIO.setUnexpectedResponseCallback(function (message) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handleOrphanedPermissionResponse({
                        message: message,
                        setAppState: setAppState,
                        handledToolUseIds: handledOrphanedToolUseIds,
                        onEnqueued: function () {
                            // The first message of a session might be the orphaned permission
                            // check rather than a user prompt, so kick off the loop.
                            void run();
                        },
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Track active OAuth flows per server so we can abort a previous flow
    // when a new mcp_authenticate request arrives for the same server.
    var activeOAuthFlows = new Map();
    // Track manual callback URL submit functions for active OAuth flows.
    // Used when localhost is not reachable (e.g., browser-based IDEs).
    var oauthCallbackSubmitters = new Map();
    // Track servers where the manual callback was actually invoked (so the
    // automatic reconnect path knows to skip — the extension will reconnect).
    var oauthManualCallbackUsed = new Set();
    // Track OAuth auth-only promises so mcp_oauth_callback_url can await
    // token exchange completion. Reconnect is handled separately by the
    // extension via handleAuthDone → mcp_reconnect.
    var oauthAuthPromises = new Map();
    // In-flight Anthropic OAuth flow (claude_authenticate). Single-slot: a
    // second authenticate request cleans up the first. The service holds the
    // PKCE verifier + localhost listener; the promise settles after
    // installOAuthTokens — after it resolves, the in-process memoized token
    // cache is already cleared and the next API call picks up the new creds.
    var claudeOAuth = null;
    // This is essentially spawning a parallel async task- we have two
    // running in parallel- one reading from stdin and adding to the
    // queue to be processed and another reading from the queue,
    // processing and returning the result of the generation.
    // The process is complete when the input stream completes and
    // the last generation of the queue has complete.
    void (function () { return __awaiter(_this, void 0, void 0, function () {
        var initialized, _loop_4, _a, _b, _c, state_1, e_3_1;
        var _this = this;
        var _d, e_3, _e, _f;
        var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22;
        return __generator(this, function (_23) {
            switch (_23.label) {
                case 0:
                    initialized = false;
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_message_loop_started');
                    _23.label = 1;
                case 1:
                    _23.trys.push([1, 7, 8, 13]);
                    _loop_4 = function () {
                        var message, eventId, _i, _24, serverName, m_1, requestedModel, model, appState, data, error_4, mcpRequest_1, sdkClient, appState, result, targetUuid_1, removed, normalizedPath, diskMtime, _25, _26, raw, content, _27, _28, response, sdkServersChanged, applied, r, sdkAgents, plugins, _29, cmdsR, mcpR, pluginsR, error_5, currentAppState, serverName_1, config, result_1, prefix_1, errorMessage_1, currentAppState, _30, serverName_2, enabled, config_1, client, prefix_2, result_2, prefix_3, errorMessage_2, currentAppState, serverName_3, currentAppState, config_2, controller_1, resolveAuthUrl_1, authUrlPromise, oauthPromise, authUrl, fullFlowPromise, error_6, _31, serverName, callbackUrl, submit, hasCodeOrError, parsed, authPromise, error_7, loginWithClaudeAi_1, service_1, urlResolver_1, urlPromise, flow, _32, manualUrl, automaticUrl, error_8, flow, serverName_4, currentAppState, config, result_3, prefix_4, prevModel, existing, incoming, merged, _33, _34, key, newModel, modelArg, currentAppState, model, effort, taskId, error_9, _35, description_1, persist_1, titleSignal_1, question_1, req, bridgeFailureDetail_1, initReplBridge, handle_1, err_2, internalMsgs, sessionId, existsInSession, _36;
                        var _37;
                        return __generator(this, function (_38) {
                            switch (_38.label) {
                                case 0:
                                    _f = _c.value;
                                    _a = false;
                                    message = _f;
                                    eventId = 'uuid' in message ? message.uuid : undefined;
                                    if (eventId &&
                                        message.type !== 'user' &&
                                        message.type !== 'control_response') {
                                        (0, commandLifecycle_js_1.notifyCommandLifecycle)(eventId, 'completed');
                                    }
                                    if (!(message.type === 'control_request')) return [3 /*break*/, 96];
                                    if (!(message.request.subtype === 'interrupt')) return [3 /*break*/, 1];
                                    // Track escapes for attribution (ant-only feature)
                                    if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION')) {
                                        setAppState(function (prev) { return (__assign(__assign({}, prev), { attribution: __assign(__assign({}, prev.attribution), { escapeCount: prev.attribution.escapeCount + 1 }) })); });
                                    }
                                    if (abortController) {
                                        abortController.abort();
                                    }
                                    (_g = suggestionState.abortController) === null || _g === void 0 ? void 0 : _g.abort();
                                    suggestionState.abortController = null;
                                    suggestionState.lastEmitted = null;
                                    suggestionState.pendingSuggestion = null;
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 95];
                                case 1:
                                    if (!(message.request.subtype === 'end_session')) return [3 /*break*/, 2];
                                    (0, debug_js_1.logForDebugging)("[print.ts] end_session received, reason=".concat((_h = message.request.reason) !== null && _h !== void 0 ? _h : 'unspecified'));
                                    if (abortController) {
                                        abortController.abort();
                                    }
                                    (_j = suggestionState.abortController) === null || _j === void 0 ? void 0 : _j.abort();
                                    suggestionState.abortController = null;
                                    suggestionState.lastEmitted = null;
                                    suggestionState.pendingSuggestion = null;
                                    sendControlResponseSuccess(message);
                                    return [2 /*return*/, "break"];
                                case 2:
                                    if (!(message.request.subtype === 'initialize')) return [3 /*break*/, 4];
                                    // SDK MCP server names from the initialize message
                                    // Populated by both browser and ProcessTransport sessions
                                    if (message.request.sdkMcpServers &&
                                        message.request.sdkMcpServers.length > 0) {
                                        for (_i = 0, _24 = message.request.sdkMcpServers; _i < _24.length; _i++) {
                                            serverName = _24[_i];
                                            // Create placeholder config for SDK MCP servers
                                            // The actual server connection is managed by the SDK Query class
                                            sdkMcpConfigs[serverName] = {
                                                type: 'sdk',
                                                name: serverName,
                                            };
                                        }
                                    }
                                    return [4 /*yield*/, handleInitializeRequest(message.request, message.request_id, initialized, output, commands, modelInfos, structuredIO, !!options.enableAuthStatus, options, agents, getAppState)
                                        // Enable prompt suggestions in AppState when SDK consumer opts in.
                                        // shouldEnablePromptSuggestion() returns false for non-interactive
                                        // sessions, but the SDK consumer explicitly requested suggestions.
                                    ];
                                case 3:
                                    _38.sent();
                                    // Enable prompt suggestions in AppState when SDK consumer opts in.
                                    // shouldEnablePromptSuggestion() returns false for non-interactive
                                    // sessions, but the SDK consumer explicitly requested suggestions.
                                    if (message.request.promptSuggestions) {
                                        setAppState(function (prev) {
                                            if (prev.promptSuggestionEnabled)
                                                return prev;
                                            return __assign(__assign({}, prev), { promptSuggestionEnabled: true });
                                        });
                                    }
                                    if (message.request.agentProgressSummaries &&
                                        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_slate_prism', true)) {
                                        (0, state_js_1.setSdkAgentProgressSummariesEnabled)(true);
                                    }
                                    initialized = true;
                                    // If the auto-resume logic pre-enqueued a command, drain it now
                                    // that initialize has set up systemPrompt, agents, hooks, etc.
                                    if ((0, messageQueueManager_js_1.hasCommandsInQueue)()) {
                                        void run();
                                    }
                                    return [3 /*break*/, 95];
                                case 4:
                                    if (!(message.request.subtype === 'set_permission_mode')) return [3 /*break*/, 5];
                                    m_1 = message.request // for typescript (TODO: use readonly types to avoid this)
                                    ;
                                    setAppState(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), { toolPermissionContext: handleSetPermissionMode(m_1, message.request_id, prev.toolPermissionContext, output), isUltraplanMode: (_a = m_1.ultraplan) !== null && _a !== void 0 ? _a : prev.isUltraplanMode }));
                                    });
                                    return [3 /*break*/, 95];
                                case 5:
                                    if (!(message.request.subtype === 'set_model')) return [3 /*break*/, 6];
                                    requestedModel = (_k = message.request.model) !== null && _k !== void 0 ? _k : 'default';
                                    model = requestedModel === 'default'
                                        ? (0, model_js_1.getDefaultMainLoopModel)()
                                        : requestedModel;
                                    activeUserSpecifiedModel = model;
                                    (0, state_js_2.setMainLoopModelOverride)(model);
                                    (0, sessionState_js_1.notifySessionMetadataChanged)({ model: model });
                                    injectModelSwitchBreadcrumbs(requestedModel, model);
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 95];
                                case 6:
                                    if (!(message.request.subtype === 'set_max_thinking_tokens')) return [3 /*break*/, 7];
                                    if (message.request.max_thinking_tokens === null) {
                                        options.thinkingConfig = undefined;
                                    }
                                    else if (message.request.max_thinking_tokens === 0) {
                                        options.thinkingConfig = { type: 'disabled' };
                                    }
                                    else {
                                        options.thinkingConfig = {
                                            type: 'enabled',
                                            budgetTokens: message.request.max_thinking_tokens,
                                        };
                                    }
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 95];
                                case 7:
                                    if (!(message.request.subtype === 'mcp_status')) return [3 /*break*/, 8];
                                    sendControlResponseSuccess(message, {
                                        mcpServers: buildMcpServerStatuses(),
                                    });
                                    return [3 /*break*/, 95];
                                case 8:
                                    if (!(message.request.subtype === 'get_context_usage')) return [3 /*break*/, 13];
                                    _38.label = 9;
                                case 9:
                                    _38.trys.push([9, 11, , 12]);
                                    appState = getAppState();
                                    return [4 /*yield*/, (0, context_noninteractive_js_1.collectContextData)({
                                            messages: mutableMessages,
                                            getAppState: getAppState,
                                            options: {
                                                mainLoopModel: (0, model_js_1.getMainLoopModel)(),
                                                tools: buildAllTools(appState),
                                                agentDefinitions: appState.agentDefinitions,
                                                customSystemPrompt: options.systemPrompt,
                                                appendSystemPrompt: options.appendSystemPrompt,
                                            },
                                        })];
                                case 10:
                                    data = _38.sent();
                                    sendControlResponseSuccess(message, __assign({}, data));
                                    return [3 /*break*/, 12];
                                case 11:
                                    error_4 = _38.sent();
                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(error_4));
                                    return [3 /*break*/, 12];
                                case 12: return [3 /*break*/, 95];
                                case 13:
                                    if (!(message.request.subtype === 'mcp_message')) return [3 /*break*/, 14];
                                    mcpRequest_1 = message.request;
                                    sdkClient = sdkClients.find(function (client) { return client.name === mcpRequest_1.server_name; });
                                    // Check client exists - dynamically added SDK servers may have
                                    // placeholder clients with null client until updateSdkMcp() runs
                                    if (sdkClient &&
                                        sdkClient.type === 'connected' &&
                                        ((_m = (_l = sdkClient.client) === null || _l === void 0 ? void 0 : _l.transport) === null || _m === void 0 ? void 0 : _m.onmessage)) {
                                        sdkClient.client.transport.onmessage(mcpRequest_1.message);
                                    }
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 95];
                                case 14:
                                    if (!(message.request.subtype === 'rewind_files')) return [3 /*break*/, 16];
                                    appState = getAppState();
                                    return [4 /*yield*/, handleRewindFiles(message.request.user_message_id, appState, setAppState, (_o = message.request.dry_run) !== null && _o !== void 0 ? _o : false)];
                                case 15:
                                    result = _38.sent();
                                    if (result.canRewind || message.request.dry_run) {
                                        sendControlResponseSuccess(message, result);
                                    }
                                    else {
                                        sendControlResponseError(message, (_p = result.error) !== null && _p !== void 0 ? _p : 'Unexpected error');
                                    }
                                    return [3 /*break*/, 95];
                                case 16:
                                    if (!(message.request.subtype === 'cancel_async_message')) return [3 /*break*/, 17];
                                    targetUuid_1 = message.request.message_uuid;
                                    removed = (0, messageQueueManager_js_1.dequeueAllMatching)(function (cmd) { return cmd.uuid === targetUuid_1; });
                                    sendControlResponseSuccess(message, {
                                        cancelled: removed.length > 0,
                                    });
                                    return [3 /*break*/, 95];
                                case 17:
                                    if (!(message.request.subtype === 'seed_read_state')) return [3 /*break*/, 24];
                                    _38.label = 18;
                                case 18:
                                    _38.trys.push([18, 22, , 23]);
                                    normalizedPath = (0, path_js_1.expandPath)(message.request.path);
                                    _26 = (_25 = Math).floor;
                                    return [4 /*yield*/, (0, promises_1.stat)(normalizedPath)];
                                case 19:
                                    diskMtime = _26.apply(_25, [(_38.sent()).mtimeMs]);
                                    if (!(diskMtime <= message.request.mtime)) return [3 /*break*/, 21];
                                    return [4 /*yield*/, (0, promises_1.readFile)(normalizedPath, 'utf-8')
                                        // Strip BOM + normalize CRLF→LF to match readFileInRange and
                                        // readFileSyncWithMetadata. FileEditTool's content-compare
                                        // fallback (for Windows mtime bumps without content change)
                                        // compares against LF-normalized disk reads.
                                    ];
                                case 20:
                                    raw = _38.sent();
                                    content = (raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw).replaceAll('\r\n', '\n');
                                    pendingSeeds.set(normalizedPath, {
                                        content: content,
                                        timestamp: diskMtime,
                                        offset: undefined,
                                        limit: undefined,
                                    });
                                    _38.label = 21;
                                case 21: return [3 /*break*/, 23];
                                case 22:
                                    _27 = _38.sent();
                                    return [3 /*break*/, 23];
                                case 23:
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 95];
                                case 24:
                                    if (!(message.request.subtype === 'mcp_set_servers')) return [3 /*break*/, 26];
                                    return [4 /*yield*/, applyMcpServerChanges(message.request.servers)];
                                case 25:
                                    _28 = _38.sent(), response = _28.response, sdkServersChanged = _28.sdkServersChanged;
                                    sendControlResponseSuccess(message, response);
                                    // Connect SDK servers AFTER response to avoid deadlock
                                    if (sdkServersChanged) {
                                        void updateSdkMcp();
                                    }
                                    return [3 /*break*/, 95];
                                case 26:
                                    if (!(message.request.subtype === 'reload_plugins')) return [3 /*break*/, 34];
                                    _38.label = 27;
                                case 27:
                                    _38.trys.push([27, 32, , 33]);
                                    if (!((0, bun_bundle_1.feature)('DOWNLOAD_USER_SETTINGS') &&
                                        ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) || (0, state_js_2.getIsRemoteMode)()))) return [3 /*break*/, 29];
                                    return [4 /*yield*/, (0, index_js_1.redownloadUserSettings)()];
                                case 28:
                                    applied = _38.sent();
                                    if (applied) {
                                        changeDetector_js_1.settingsChangeDetector.notifyChange('userSettings');
                                    }
                                    _38.label = 29;
                                case 29: return [4 /*yield*/, (0, refresh_js_1.refreshActivePlugins)(setAppState)];
                                case 30:
                                    r = _38.sent();
                                    sdkAgents = currentAgents.filter(function (a) { return a.source === 'flagSettings'; });
                                    currentAgents = __spreadArray(__spreadArray([], r.agentDefinitions.allAgents, true), sdkAgents, true);
                                    plugins = [];
                                    return [4 /*yield*/, Promise.allSettled([
                                            (0, commands_js_2.getCommands)((0, process_1.cwd)()),
                                            applyPluginMcpDiff(),
                                            (0, pluginLoader_js_1.loadAllPluginsCacheOnly)(),
                                        ])];
                                case 31:
                                    _29 = _38.sent(), cmdsR = _29[0], mcpR = _29[1], pluginsR = _29[2];
                                    if (cmdsR.status === 'fulfilled') {
                                        currentCommands = cmdsR.value;
                                    }
                                    else {
                                        (0, log_js_1.logError)(cmdsR.reason);
                                    }
                                    if (mcpR.status === 'rejected') {
                                        (0, log_js_1.logError)(mcpR.reason);
                                    }
                                    if (pluginsR.status === 'fulfilled') {
                                        plugins = pluginsR.value.enabled.map(function (p) { return ({
                                            name: p.name,
                                            path: p.path,
                                            source: p.source,
                                        }); });
                                    }
                                    else {
                                        (0, log_js_1.logError)(pluginsR.reason);
                                    }
                                    sendControlResponseSuccess(message, {
                                        commands: currentCommands
                                            .filter(function (cmd) { return cmd.userInvocable !== false; })
                                            .map(function (cmd) { return ({
                                            name: (0, commands_js_1.getCommandName)(cmd),
                                            description: (0, commands_js_1.formatDescriptionWithSource)(cmd),
                                            argumentHint: cmd.argumentHint || '',
                                        }); }),
                                        agents: currentAgents.map(function (a) { return ({
                                            name: a.agentType,
                                            description: a.whenToUse,
                                            model: a.model === 'inherit' ? undefined : a.model,
                                        }); }),
                                        plugins: plugins,
                                        mcpServers: buildMcpServerStatuses(),
                                        error_count: r.error_count,
                                    });
                                    return [3 /*break*/, 33];
                                case 32:
                                    error_5 = _38.sent();
                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(error_5));
                                    return [3 /*break*/, 33];
                                case 33: return [3 /*break*/, 95];
                                case 34:
                                    if (!(message.request.subtype === 'mcp_reconnect')) return [3 /*break*/, 38];
                                    currentAppState = getAppState();
                                    serverName_1 = message.request.serverName;
                                    elicitationRegistered.delete(serverName_1);
                                    config = (_y = (_w = (_u = (_s = (_q = (0, config_js_1.getMcpConfigByName)(serverName_1)) !== null && _q !== void 0 ? _q : (_r = mcpClients.find(function (c) { return c.name === serverName_1; })) === null || _r === void 0 ? void 0 : _r.config) !== null && _s !== void 0 ? _s : (_t = sdkClients.find(function (c) { return c.name === serverName_1; })) === null || _t === void 0 ? void 0 : _t.config) !== null && _u !== void 0 ? _u : (_v = dynamicMcpState.clients.find(function (c) { return c.name === serverName_1; })) === null || _v === void 0 ? void 0 : _v.config) !== null && _w !== void 0 ? _w : (_x = currentAppState.mcp.clients.find(function (c) { return c.name === serverName_1; })) === null || _x === void 0 ? void 0 : _x.config) !== null && _y !== void 0 ? _y : null;
                                    if (!!config) return [3 /*break*/, 35];
                                    sendControlResponseError(message, "Server not found: ".concat(serverName_1));
                                    return [3 /*break*/, 37];
                                case 35: return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(serverName_1, config)
                                    // Update appState.mcp with the new client, tools, commands, and resources
                                ];
                                case 36:
                                    result_1 = _38.sent();
                                    prefix_1 = (0, mcpStringUtils_js_1.getMcpPrefix)(serverName_1);
                                    setAppState(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { clients: prev.mcp.clients.map(function (c) {
                                                    return c.name === serverName_1 ? result_1.client : c;
                                                }), tools: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.tools, function (t) { var _a; return (_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix_1); }), true), result_1.tools, true), commands: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.commands, function (c) {
                                                    return (0, utils_js_1.commandBelongsToServer)(c, serverName_1);
                                                }), true), result_1.commands, true), resources: result_1.resources && result_1.resources.length > 0
                                                    ? __assign(__assign({}, prev.mcp.resources), (_a = {}, _a[serverName_1] = result_1.resources, _a)) : (0, omit_js_1.default)(prev.mcp.resources, serverName_1) }) }));
                                    });
                                    // Also update dynamicMcpState so run() picks up the new tools
                                    // on the next turn (run() reads dynamicMcpState, not appState)
                                    dynamicMcpState = __assign(__assign({}, dynamicMcpState), { clients: __spreadArray(__spreadArray([], dynamicMcpState.clients.filter(function (c) { return c.name !== serverName_1; }), true), [
                                            result_1.client,
                                        ], false), tools: __spreadArray(__spreadArray([], dynamicMcpState.tools.filter(function (t) { var _a; return !((_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix_1)); }), true), result_1.tools, true) });
                                    if (result_1.client.type === 'connected') {
                                        registerElicitationHandlers([result_1.client]);
                                        reregisterChannelHandlerAfterReconnect(result_1.client);
                                        sendControlResponseSuccess(message);
                                    }
                                    else {
                                        errorMessage_1 = result_1.client.type === 'failed'
                                            ? ((_z = result_1.client.error) !== null && _z !== void 0 ? _z : 'Connection failed')
                                            : "Server status: ".concat(result_1.client.type);
                                        sendControlResponseError(message, errorMessage_1);
                                    }
                                    _38.label = 37;
                                case 37: return [3 /*break*/, 95];
                                case 38:
                                    if (!(message.request.subtype === 'mcp_toggle')) return [3 /*break*/, 45];
                                    currentAppState = getAppState();
                                    _30 = message.request, serverName_2 = _30.serverName, enabled = _30.enabled;
                                    elicitationRegistered.delete(serverName_2);
                                    config_1 = (_8 = (_6 = (_4 = (_2 = (_0 = (0, config_js_1.getMcpConfigByName)(serverName_2)) !== null && _0 !== void 0 ? _0 : (_1 = mcpClients.find(function (c) { return c.name === serverName_2; })) === null || _1 === void 0 ? void 0 : _1.config) !== null && _2 !== void 0 ? _2 : (_3 = sdkClients.find(function (c) { return c.name === serverName_2; })) === null || _3 === void 0 ? void 0 : _3.config) !== null && _4 !== void 0 ? _4 : (_5 = dynamicMcpState.clients.find(function (c) { return c.name === serverName_2; })) === null || _5 === void 0 ? void 0 : _5.config) !== null && _6 !== void 0 ? _6 : (_7 = currentAppState.mcp.clients.find(function (c) { return c.name === serverName_2; })) === null || _7 === void 0 ? void 0 : _7.config) !== null && _8 !== void 0 ? _8 : null;
                                    if (!!config_1) return [3 /*break*/, 39];
                                    sendControlResponseError(message, "Server not found: ".concat(serverName_2));
                                    return [3 /*break*/, 44];
                                case 39:
                                    if (!!enabled) return [3 /*break*/, 42];
                                    // Disabling: persist + disconnect (matches TUI toggleMcpServer behavior)
                                    (0, config_js_1.setMcpServerEnabled)(serverName_2, false);
                                    client = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], mcpClients, true), sdkClients, true), dynamicMcpState.clients, true), currentAppState.mcp.clients, true).find(function (c) { return c.name === serverName_2; });
                                    if (!(client && client.type === 'connected')) return [3 /*break*/, 41];
                                    return [4 /*yield*/, (0, client_js_1.clearServerCache)(serverName_2, config_1)];
                                case 40:
                                    _38.sent();
                                    _38.label = 41;
                                case 41:
                                    prefix_2 = (0, mcpStringUtils_js_1.getMcpPrefix)(serverName_2);
                                    setAppState(function (prev) { return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { clients: prev.mcp.clients.map(function (c) {
                                                return c.name === serverName_2
                                                    ? { name: serverName_2, type: 'disabled', config: config_1 }
                                                    : c;
                                            }), tools: (0, reject_js_1.default)(prev.mcp.tools, function (t) { var _a; return (_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix_2); }), commands: (0, reject_js_1.default)(prev.mcp.commands, function (c) {
                                                return (0, utils_js_1.commandBelongsToServer)(c, serverName_2);
                                            }), resources: (0, omit_js_1.default)(prev.mcp.resources, serverName_2) }) })); });
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 44];
                                case 42:
                                    // Enabling: persist + reconnect
                                    (0, config_js_1.setMcpServerEnabled)(serverName_2, true);
                                    return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(serverName_2, config_1)
                                        // Update appState.mcp with the new client, tools, commands, and resources
                                        // This ensures the LLM sees updated tools after enabling the server
                                    ];
                                case 43:
                                    result_2 = _38.sent();
                                    prefix_3 = (0, mcpStringUtils_js_1.getMcpPrefix)(serverName_2);
                                    setAppState(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { clients: prev.mcp.clients.map(function (c) {
                                                    return c.name === serverName_2 ? result_2.client : c;
                                                }), tools: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.tools, function (t) { var _a; return (_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix_3); }), true), result_2.tools, true), commands: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.commands, function (c) {
                                                    return (0, utils_js_1.commandBelongsToServer)(c, serverName_2);
                                                }), true), result_2.commands, true), resources: result_2.resources && result_2.resources.length > 0
                                                    ? __assign(__assign({}, prev.mcp.resources), (_a = {}, _a[serverName_2] = result_2.resources, _a)) : (0, omit_js_1.default)(prev.mcp.resources, serverName_2) }) }));
                                    });
                                    if (result_2.client.type === 'connected') {
                                        registerElicitationHandlers([result_2.client]);
                                        reregisterChannelHandlerAfterReconnect(result_2.client);
                                        sendControlResponseSuccess(message);
                                    }
                                    else {
                                        errorMessage_2 = result_2.client.type === 'failed'
                                            ? ((_9 = result_2.client.error) !== null && _9 !== void 0 ? _9 : 'Connection failed')
                                            : "Server status: ".concat(result_2.client.type);
                                        sendControlResponseError(message, errorMessage_2);
                                    }
                                    _38.label = 44;
                                case 44: return [3 /*break*/, 95];
                                case 45:
                                    if (!(message.request.subtype === 'channel_enable')) return [3 /*break*/, 46];
                                    currentAppState = getAppState();
                                    handleChannelEnable(message.request_id, message.request.serverName, __spreadArray(__spreadArray(__spreadArray([], currentAppState.mcp.clients, true), sdkClients, true), dynamicMcpState.clients, true), output);
                                    return [3 /*break*/, 95];
                                case 46:
                                    if (!(message.request.subtype === 'mcp_authenticate')) return [3 /*break*/, 52];
                                    serverName_3 = message.request.serverName;
                                    currentAppState = getAppState();
                                    config_2 = (_14 = (_12 = (_10 = (0, config_js_1.getMcpConfigByName)(serverName_3)) !== null && _10 !== void 0 ? _10 : (_11 = mcpClients.find(function (c) { return c.name === serverName_3; })) === null || _11 === void 0 ? void 0 : _11.config) !== null && _12 !== void 0 ? _12 : (_13 = currentAppState.mcp.clients.find(function (c) { return c.name === serverName_3; })) === null || _13 === void 0 ? void 0 : _13.config) !== null && _14 !== void 0 ? _14 : null;
                                    if (!!config_2) return [3 /*break*/, 47];
                                    sendControlResponseError(message, "Server not found: ".concat(serverName_3));
                                    return [3 /*break*/, 51];
                                case 47:
                                    if (!(config_2.type !== 'sse' && config_2.type !== 'http')) return [3 /*break*/, 48];
                                    sendControlResponseError(message, "Server type \"".concat(config_2.type, "\" does not support OAuth authentication"));
                                    return [3 /*break*/, 51];
                                case 48:
                                    _38.trys.push([48, 50, , 51]);
                                    // Abort any previous in-flight OAuth flow for this server
                                    (_15 = activeOAuthFlows.get(serverName_3)) === null || _15 === void 0 ? void 0 : _15.abort();
                                    controller_1 = new AbortController();
                                    activeOAuthFlows.set(serverName_3, controller_1);
                                    authUrlPromise = new Promise(function (resolve) {
                                        resolveAuthUrl_1 = resolve;
                                    });
                                    oauthPromise = (0, auth_js_3.performMCPOAuthFlow)(serverName_3, config_2, function (url) { return resolveAuthUrl_1(url); }, controller_1.signal, {
                                        skipBrowserOpen: true,
                                        onWaitingForCallback: function (submit) {
                                            oauthCallbackSubmitters.set(serverName_3, submit);
                                        },
                                    });
                                    return [4 /*yield*/, Promise.race([
                                            authUrlPromise,
                                            oauthPromise.then(function () { return null; }),
                                        ])];
                                case 49:
                                    authUrl = _38.sent();
                                    if (authUrl) {
                                        sendControlResponseSuccess(message, {
                                            authUrl: authUrl,
                                            requiresUserAction: true,
                                        });
                                    }
                                    else {
                                        sendControlResponseSuccess(message, {
                                            requiresUserAction: false,
                                        });
                                    }
                                    // Store auth-only promise for mcp_oauth_callback_url handler.
                                    // Don't swallow errors — the callback handler needs to detect
                                    // auth failures and report them to the caller.
                                    oauthAuthPromises.set(serverName_3, oauthPromise);
                                    fullFlowPromise = oauthPromise
                                        .then(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var result, prefix;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    // Don't reconnect if the server was disabled during the OAuth flow
                                                    if ((0, config_js_1.isMcpServerDisabled)(serverName_3)) {
                                                        return [2 /*return*/];
                                                    }
                                                    // Skip reconnect if the manual callback path was used —
                                                    // handleAuthDone will do it via mcp_reconnect (which
                                                    // updates dynamicMcpState for tool registration).
                                                    if (oauthManualCallbackUsed.has(serverName_3)) {
                                                        return [2 /*return*/];
                                                    }
                                                    return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(serverName_3, config_2)];
                                                case 1:
                                                    result = _a.sent();
                                                    prefix = (0, mcpStringUtils_js_1.getMcpPrefix)(serverName_3);
                                                    setAppState(function (prev) {
                                                        var _a;
                                                        return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { clients: prev.mcp.clients.map(function (c) {
                                                                    return c.name === serverName_3 ? result.client : c;
                                                                }), tools: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.tools, function (t) { var _a; return (_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix); }), true), result.tools, true), commands: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.commands, function (c) {
                                                                    return (0, utils_js_1.commandBelongsToServer)(c, serverName_3);
                                                                }), true), result.commands, true), resources: result.resources && result.resources.length > 0
                                                                    ? __assign(__assign({}, prev.mcp.resources), (_a = {}, _a[serverName_3] = result.resources, _a)) : (0, omit_js_1.default)(prev.mcp.resources, serverName_3) }) }));
                                                    });
                                                    // Also update dynamicMcpState so run() picks up the new tools
                                                    // on the next turn (run() reads dynamicMcpState, not appState)
                                                    dynamicMcpState = __assign(__assign({}, dynamicMcpState), { clients: __spreadArray(__spreadArray([], dynamicMcpState.clients.filter(function (c) { return c.name !== serverName_3; }), true), [
                                                            result.client,
                                                        ], false), tools: __spreadArray(__spreadArray([], dynamicMcpState.tools.filter(function (t) { var _a; return !((_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix)); }), true), result.tools, true) });
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })
                                        .catch(function (error) {
                                        (0, debug_js_1.logForDebugging)("MCP OAuth failed for ".concat(serverName_3, ": ").concat(error), { level: 'error' });
                                    })
                                        .finally(function () {
                                        // Clean up only if this is still the active flow
                                        if (activeOAuthFlows.get(serverName_3) === controller_1) {
                                            activeOAuthFlows.delete(serverName_3);
                                            oauthCallbackSubmitters.delete(serverName_3);
                                            oauthManualCallbackUsed.delete(serverName_3);
                                            oauthAuthPromises.delete(serverName_3);
                                        }
                                    });
                                    void fullFlowPromise;
                                    return [3 /*break*/, 51];
                                case 50:
                                    error_6 = _38.sent();
                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(error_6));
                                    return [3 /*break*/, 51];
                                case 51: return [3 /*break*/, 95];
                                case 52:
                                    if (!(message.request.subtype === 'mcp_oauth_callback_url')) return [3 /*break*/, 62];
                                    _31 = message.request, serverName = _31.serverName, callbackUrl = _31.callbackUrl;
                                    submit = oauthCallbackSubmitters.get(serverName);
                                    if (!submit) return [3 /*break*/, 60];
                                    hasCodeOrError = false;
                                    try {
                                        parsed = new URL(callbackUrl);
                                        hasCodeOrError =
                                            parsed.searchParams.has('code') ||
                                                parsed.searchParams.has('error');
                                    }
                                    catch (_39) {
                                        // Invalid URL
                                    }
                                    if (!!hasCodeOrError) return [3 /*break*/, 53];
                                    sendControlResponseError(message, 'Invalid callback URL: missing authorization code. Please paste the full redirect URL including the code parameter.');
                                    return [3 /*break*/, 59];
                                case 53:
                                    oauthManualCallbackUsed.add(serverName);
                                    submit(callbackUrl);
                                    authPromise = oauthAuthPromises.get(serverName);
                                    if (!authPromise) return [3 /*break*/, 58];
                                    _38.label = 54;
                                case 54:
                                    _38.trys.push([54, 56, , 57]);
                                    return [4 /*yield*/, authPromise];
                                case 55:
                                    _38.sent();
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 57];
                                case 56:
                                    error_7 = _38.sent();
                                    sendControlResponseError(message, error_7 instanceof Error
                                        ? error_7.message
                                        : 'OAuth authentication failed');
                                    return [3 /*break*/, 57];
                                case 57: return [3 /*break*/, 59];
                                case 58:
                                    sendControlResponseSuccess(message);
                                    _38.label = 59;
                                case 59: return [3 /*break*/, 61];
                                case 60:
                                    sendControlResponseError(message, "No active OAuth flow for server: ".concat(serverName));
                                    _38.label = 61;
                                case 61: return [3 /*break*/, 95];
                                case 62:
                                    if (!(message.request.subtype === 'claude_authenticate')) return [3 /*break*/, 67];
                                    loginWithClaudeAi_1 = message.request.loginWithClaudeAi;
                                    // Clean up any prior flow. cleanup() closes the localhost listener
                                    // and nulls the manual resolver. The prior `flow` promise is left
                                    // pending (AuthCodeListener.close() does not reject) but its object
                                    // graph becomes unreachable once the server handle is released and
                                    // is GC'd — no fd or port is held.
                                    claudeOAuth === null || claudeOAuth === void 0 ? void 0 : claudeOAuth.service.cleanup();
                                    (0, index_js_3.logEvent)('tengu_oauth_flow_start', {
                                        loginWithClaudeAi: loginWithClaudeAi_1 !== null && loginWithClaudeAi_1 !== void 0 ? loginWithClaudeAi_1 : true,
                                    });
                                    service_1 = new index_js_5.OAuthService();
                                    urlPromise = new Promise(function (resolve) {
                                        urlResolver_1 = resolve;
                                    });
                                    flow = service_1
                                        .startOAuthFlow(function (manualUrl, automaticUrl) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            // automaticUrl is always defined when skipBrowserOpen is set;
                                            // the signature is optional only for the existing single-arg callers.
                                            urlResolver_1({ manualUrl: manualUrl, automaticUrl: automaticUrl });
                                            return [2 /*return*/];
                                        });
                                    }); }, {
                                        loginWithClaudeAi: loginWithClaudeAi_1 !== null && loginWithClaudeAi_1 !== void 0 ? loginWithClaudeAi_1 : true,
                                        skipBrowserOpen: true,
                                    })
                                        .then(function (tokens) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: 
                                                // installOAuthTokens: performLogout (clear stale state) →
                                                // store profile → saveOAuthTokensIfNeeded → clearOAuthTokenCache
                                                // → clearAuthRelatedCaches. After this resolves, the memoized
                                                // getClaudeAIOAuthTokens in this process is invalidated; the
                                                // next API call re-reads keychain/file and works. No respawn.
                                                return [4 /*yield*/, (0, auth_js_2.installOAuthTokens)(tokens)];
                                                case 1:
                                                    // installOAuthTokens: performLogout (clear stale state) →
                                                    // store profile → saveOAuthTokensIfNeeded → clearOAuthTokenCache
                                                    // → clearAuthRelatedCaches. After this resolves, the memoized
                                                    // getClaudeAIOAuthTokens in this process is invalidated; the
                                                    // next API call re-reads keychain/file and works. No respawn.
                                                    _a.sent();
                                                    (0, index_js_3.logEvent)('tengu_oauth_success', {
                                                        loginWithClaudeAi: loginWithClaudeAi_1 !== null && loginWithClaudeAi_1 !== void 0 ? loginWithClaudeAi_1 : true,
                                                    });
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })
                                        .finally(function () {
                                        service_1.cleanup();
                                        if ((claudeOAuth === null || claudeOAuth === void 0 ? void 0 : claudeOAuth.service) === service_1) {
                                            claudeOAuth = null;
                                        }
                                    });
                                    claudeOAuth = { service: service_1, flow: flow };
                                    // Attach the rejection handler before awaiting so a synchronous
                                    // startOAuthFlow failure doesn't surface as an unhandled rejection.
                                    // The claude_oauth_callback handler re-awaits flow for the manual
                                    // path and surfaces the real error to the client.
                                    void flow.catch(function (err) {
                                        return (0, debug_js_1.logForDebugging)("claude_authenticate flow ended: ".concat(err), {
                                            level: 'info',
                                        });
                                    });
                                    _38.label = 63;
                                case 63:
                                    _38.trys.push([63, 65, , 66]);
                                    return [4 /*yield*/, Promise.race([
                                            urlPromise,
                                            flow.then(function () {
                                                throw new Error('OAuth flow completed without producing auth URLs');
                                            }),
                                        ])];
                                case 64:
                                    _32 = _38.sent(), manualUrl = _32.manualUrl, automaticUrl = _32.automaticUrl;
                                    sendControlResponseSuccess(message, {
                                        manualUrl: manualUrl,
                                        automaticUrl: automaticUrl,
                                    });
                                    return [3 /*break*/, 66];
                                case 65:
                                    error_8 = _38.sent();
                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(error_8));
                                    return [3 /*break*/, 66];
                                case 66: return [3 /*break*/, 95];
                                case 67:
                                    if (!(message.request.subtype === 'claude_oauth_callback' ||
                                        message.request.subtype === 'claude_oauth_wait_for_completion')) return [3 /*break*/, 68];
                                    if (!claudeOAuth) {
                                        sendControlResponseError(message, 'No active claude_authenticate flow');
                                    }
                                    else {
                                        // Inject the manual code synchronously — must happen in stdin
                                        // message order so a subsequent claude_authenticate doesn't
                                        // replace the service before this code lands.
                                        if (message.request.subtype === 'claude_oauth_callback') {
                                            claudeOAuth.service.handleManualAuthCodeInput({
                                                authorizationCode: message.request.authorizationCode,
                                                state: message.request.state,
                                            });
                                        }
                                        flow = claudeOAuth.flow;
                                        void flow.then(function () {
                                            var accountInfo = (0, auth_js_1.getAccountInformation)();
                                            sendControlResponseSuccess(message, {
                                                account: {
                                                    email: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.email,
                                                    organization: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.organization,
                                                    subscriptionType: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.subscription,
                                                    tokenSource: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.tokenSource,
                                                    apiKeySource: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.apiKeySource,
                                                    apiProvider: (0, providers_js_1.getAPIProvider)(),
                                                },
                                            });
                                        }, function (error) {
                                            return sendControlResponseError(message, (0, errors_js_1.errorMessage)(error));
                                        });
                                    }
                                    return [3 /*break*/, 95];
                                case 68:
                                    if (!(message.request.subtype === 'mcp_clear_auth')) return [3 /*break*/, 74];
                                    serverName_4 = message.request.serverName;
                                    currentAppState = getAppState();
                                    config = (_20 = (_18 = (_16 = (0, config_js_1.getMcpConfigByName)(serverName_4)) !== null && _16 !== void 0 ? _16 : (_17 = mcpClients.find(function (c) { return c.name === serverName_4; })) === null || _17 === void 0 ? void 0 : _17.config) !== null && _18 !== void 0 ? _18 : (_19 = currentAppState.mcp.clients.find(function (c) { return c.name === serverName_4; })) === null || _19 === void 0 ? void 0 : _19.config) !== null && _20 !== void 0 ? _20 : null;
                                    if (!!config) return [3 /*break*/, 69];
                                    sendControlResponseError(message, "Server not found: ".concat(serverName_4));
                                    return [3 /*break*/, 73];
                                case 69:
                                    if (!(config.type !== 'sse' && config.type !== 'http')) return [3 /*break*/, 70];
                                    sendControlResponseError(message, "Cannot clear auth for server type \"".concat(config.type, "\""));
                                    return [3 /*break*/, 73];
                                case 70: return [4 /*yield*/, (0, auth_js_3.revokeServerTokens)(serverName_4, config)];
                                case 71:
                                    _38.sent();
                                    return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(serverName_4, config)];
                                case 72:
                                    result_3 = _38.sent();
                                    prefix_4 = (0, mcpStringUtils_js_1.getMcpPrefix)(serverName_4);
                                    setAppState(function (prev) {
                                        var _a;
                                        return (__assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { clients: prev.mcp.clients.map(function (c) {
                                                    return c.name === serverName_4 ? result_3.client : c;
                                                }), tools: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.tools, function (t) { var _a; return (_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix_4); }), true), result_3.tools, true), commands: __spreadArray(__spreadArray([], (0, reject_js_1.default)(prev.mcp.commands, function (c) {
                                                    return (0, utils_js_1.commandBelongsToServer)(c, serverName_4);
                                                }), true), result_3.commands, true), resources: result_3.resources && result_3.resources.length > 0
                                                    ? __assign(__assign({}, prev.mcp.resources), (_a = {}, _a[serverName_4] = result_3.resources, _a)) : (0, omit_js_1.default)(prev.mcp.resources, serverName_4) }) }));
                                    });
                                    sendControlResponseSuccess(message, {});
                                    _38.label = 73;
                                case 73: return [3 /*break*/, 95];
                                case 74:
                                    if (!(message.request.subtype === 'apply_flag_settings')) return [3 /*break*/, 75];
                                    prevModel = (0, model_js_1.getMainLoopModel)();
                                    existing = (_21 = (0, state_js_2.getFlagSettingsInline)()) !== null && _21 !== void 0 ? _21 : {};
                                    incoming = message.request.settings;
                                    merged = __assign(__assign({}, existing), incoming);
                                    for (_33 = 0, _34 = Object.keys(merged); _33 < _34.length; _33++) {
                                        key = _34[_33];
                                        if (merged[key] === null) {
                                            delete merged[key];
                                        }
                                    }
                                    (0, state_js_2.setFlagSettingsInline)(merged);
                                    // Route through notifyChange so fanOut() resets the settings cache
                                    // before listeners run. The subscriber at :392 calls
                                    // applySettingsChange for us. Pre-#20625 this was a direct
                                    // applySettingsChange() call that relied on its own internal reset —
                                    // now that the reset is centralized in fanOut, a direct call here
                                    // would read stale cached settings and silently drop the update.
                                    // Bonus: going through notifyChange also tells the other subscribers
                                    // (loadPluginHooks, sandbox-adapter) about the change, which the
                                    // previous direct call skipped.
                                    changeDetector_js_1.settingsChangeDetector.notifyChange('flagSettings');
                                    // If the incoming settings include a model change, update the
                                    // override so getMainLoopModel() reflects it. The override has
                                    // higher priority than the settings cascade in
                                    // getUserSpecifiedModelSetting(), so without this update,
                                    // getMainLoopModel() returns the stale override and the model
                                    // change is silently ignored (matching set_model at :2811).
                                    if ('model' in incoming) {
                                        if (incoming.model != null) {
                                            (0, state_js_2.setMainLoopModelOverride)(String(incoming.model));
                                        }
                                        else {
                                            (0, state_js_2.setMainLoopModelOverride)(undefined);
                                        }
                                    }
                                    newModel = (0, model_js_1.getMainLoopModel)();
                                    if (newModel !== prevModel) {
                                        activeUserSpecifiedModel = newModel;
                                        modelArg = incoming.model ? String(incoming.model) : 'default';
                                        (0, sessionState_js_1.notifySessionMetadataChanged)({ model: newModel });
                                        injectModelSwitchBreadcrumbs(modelArg, newModel);
                                    }
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 95];
                                case 75:
                                    if (!(message.request.subtype === 'get_settings')) return [3 /*break*/, 76];
                                    currentAppState = getAppState();
                                    model = (0, model_js_1.getMainLoopModel)();
                                    effort = (0, effort_js_1.modelSupportsEffort)(model)
                                        ? (0, effort_js_1.resolveAppliedEffort)(model, currentAppState.effortValue)
                                        : undefined;
                                    sendControlResponseSuccess(message, __assign(__assign({}, (0, settings_js_1.getSettingsWithSources)()), { applied: {
                                            model: model,
                                            // Numeric effort (ant-only) → null; SDK schema is string-level only.
                                            effort: typeof effort === 'string' ? effort : null,
                                        } }));
                                    return [3 /*break*/, 95];
                                case 76:
                                    if (!(message.request.subtype === 'stop_task')) return [3 /*break*/, 81];
                                    taskId = message.request.task_id;
                                    _38.label = 77;
                                case 77:
                                    _38.trys.push([77, 79, , 80]);
                                    return [4 /*yield*/, (0, stopTask_js_1.stopTask)(taskId, {
                                            getAppState: getAppState,
                                            setAppState: setAppState,
                                        })];
                                case 78:
                                    _38.sent();
                                    sendControlResponseSuccess(message, {});
                                    return [3 /*break*/, 80];
                                case 79:
                                    error_9 = _38.sent();
                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(error_9));
                                    return [3 /*break*/, 80];
                                case 80: return [3 /*break*/, 95];
                                case 81:
                                    if (!(message.request.subtype === 'generate_session_title')) return [3 /*break*/, 82];
                                    _35 = message.request, description_1 = _35.description, persist_1 = _35.persist;
                                    titleSignal_1 = (abortController && !abortController.signal.aborted
                                        ? abortController
                                        : (0, abortController_js_1.createAbortController)()).signal;
                                    void (function () { return __awaiter(_this, void 0, void 0, function () {
                                        var title, e_4;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    _a.trys.push([0, 2, , 3]);
                                                    return [4 /*yield*/, (0, sessionTitle_js_1.generateSessionTitle)(description_1, titleSignal_1)];
                                                case 1:
                                                    title = _a.sent();
                                                    if (title && persist_1) {
                                                        try {
                                                            (0, sessionStorage_js_1.saveAiGeneratedTitle)((0, state_js_2.getSessionId)(), title);
                                                        }
                                                        catch (e) {
                                                            (0, log_js_1.logError)(e);
                                                        }
                                                    }
                                                    sendControlResponseSuccess(message, { title: title });
                                                    return [3 /*break*/, 3];
                                                case 2:
                                                    e_4 = _a.sent();
                                                    // Unreachable in practice — generateSessionTitle wraps its
                                                    // own body and returns null, saveAiGeneratedTitle is wrapped
                                                    // above. Propagate (not swallow) so unexpected failures are
                                                    // visible to the SDK caller (hostComms.ts catches and logs).
                                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(e_4));
                                                    return [3 /*break*/, 3];
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); })();
                                    return [3 /*break*/, 95];
                                case 82:
                                    if (!(message.request.subtype === 'side_question')) return [3 /*break*/, 83];
                                    question_1 = message.request.question;
                                    void (function () { return __awaiter(_this, void 0, void 0, function () {
                                        var saved, cacheSafeParams, _a, result, e_5;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    _b.trys.push([0, 5, , 6]);
                                                    saved = (0, forkedAgent_js_1.getLastCacheSafeParams)();
                                                    if (!saved) return [3 /*break*/, 1];
                                                    _a = __assign(__assign({}, saved), { 
                                                        // If the last turn was interrupted, the snapshot holds an
                                                        // already-aborted controller; createChildAbortController in
                                                        // createSubagentContext would propagate it and the fork
                                                        // would die before sending a request. The controller is
                                                        // not part of the cache key — swapping in a fresh one is
                                                        // safe. Same guard as generate_session_title above.
                                                        toolUseContext: __assign(__assign({}, saved.toolUseContext), { abortController: (0, abortController_js_1.createAbortController)() }) });
                                                    return [3 /*break*/, 3];
                                                case 1: return [4 /*yield*/, (0, queryContext_js_1.buildSideQuestionFallbackParams)({
                                                        tools: buildAllTools(getAppState()),
                                                        commands: currentCommands,
                                                        mcpClients: __spreadArray(__spreadArray(__spreadArray([], getAppState().mcp.clients, true), sdkClients, true), dynamicMcpState.clients, true),
                                                        messages: mutableMessages,
                                                        readFileState: readFileState,
                                                        getAppState: getAppState,
                                                        setAppState: setAppState,
                                                        customSystemPrompt: options.systemPrompt,
                                                        appendSystemPrompt: options.appendSystemPrompt,
                                                        thinkingConfig: options.thinkingConfig,
                                                        agents: currentAgents,
                                                    })];
                                                case 2:
                                                    _a = _b.sent();
                                                    _b.label = 3;
                                                case 3:
                                                    cacheSafeParams = _a;
                                                    return [4 /*yield*/, (0, sideQuestion_js_1.runSideQuestion)({
                                                            question: question_1,
                                                            cacheSafeParams: cacheSafeParams,
                                                        })];
                                                case 4:
                                                    result = _b.sent();
                                                    sendControlResponseSuccess(message, { response: result.response });
                                                    return [3 /*break*/, 6];
                                                case 5:
                                                    e_5 = _b.sent();
                                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(e_5));
                                                    return [3 /*break*/, 6];
                                                case 6: return [2 /*return*/];
                                            }
                                        });
                                    }); })();
                                    return [3 /*break*/, 95];
                                case 83:
                                    if (!(((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) &&
                                        message.request.subtype === 'set_proactive')) return [3 /*break*/, 84];
                                    req = message.request;
                                    if (req.enabled) {
                                        if (!proactiveModule.isProactiveActive()) {
                                            proactiveModule.activateProactive('command');
                                            scheduleProactiveTick();
                                        }
                                    }
                                    else {
                                        proactiveModule.deactivateProactive();
                                    }
                                    sendControlResponseSuccess(message);
                                    return [3 /*break*/, 95];
                                case 84:
                                    if (!(message.request.subtype === 'remote_control')) return [3 /*break*/, 94];
                                    if (!message.request.enabled) return [3 /*break*/, 90];
                                    if (!bridgeHandle) return [3 /*break*/, 85];
                                    // Already connected
                                    sendControlResponseSuccess(message, {
                                        session_url: (0, product_js_1.getRemoteSessionUrl)(bridgeHandle.bridgeSessionId, bridgeHandle.sessionIngressUrl),
                                        connect_url: (0, bridgeStatusUtil_js_1.buildBridgeConnectUrl)(bridgeHandle.environmentId, bridgeHandle.sessionIngressUrl),
                                        environment_id: bridgeHandle.environmentId,
                                    });
                                    return [3 /*break*/, 89];
                                case 85:
                                    _38.trys.push([85, 88, , 89]);
                                    return [4 /*yield*/, Promise.resolve().then(function () { return require('src/bridge/initReplBridge.js'); })];
                                case 86:
                                    initReplBridge = (_38.sent()).initReplBridge;
                                    return [4 /*yield*/, initReplBridge({
                                            onInboundMessage: function (msg) {
                                                var fields = (0, inboundMessages_js_1.extractInboundMessageFields)(msg);
                                                if (!fields)
                                                    return;
                                                var content = fields.content, uuid = fields.uuid;
                                                (0, messageQueueManager_js_1.enqueue)({
                                                    value: content,
                                                    mode: 'prompt',
                                                    uuid: uuid,
                                                    skipSlashCommands: true,
                                                });
                                                void run();
                                            },
                                            onPermissionResponse: function (response) {
                                                // Forward bridge permission responses into the
                                                // stdin processing loop so they resolve pending
                                                // permission requests from the SDK consumer.
                                                structuredIO.injectControlResponse(response);
                                            },
                                            onInterrupt: function () {
                                                abortController === null || abortController === void 0 ? void 0 : abortController.abort();
                                            },
                                            onSetModel: function (model) {
                                                var resolved = model === 'default' ? (0, model_js_1.getDefaultMainLoopModel)() : model;
                                                activeUserSpecifiedModel = resolved;
                                                (0, state_js_2.setMainLoopModelOverride)(resolved);
                                            },
                                            onSetMaxThinkingTokens: function (maxTokens) {
                                                if (maxTokens === null) {
                                                    options.thinkingConfig = undefined;
                                                }
                                                else if (maxTokens === 0) {
                                                    options.thinkingConfig = { type: 'disabled' };
                                                }
                                                else {
                                                    options.thinkingConfig = {
                                                        type: 'enabled',
                                                        budgetTokens: maxTokens,
                                                    };
                                                }
                                            },
                                            onStateChange: function (state, detail) {
                                                if (state === 'failed') {
                                                    bridgeFailureDetail_1 = detail;
                                                }
                                                (0, debug_js_1.logForDebugging)("[bridge:sdk] State change: ".concat(state).concat(detail ? " \u2014 ".concat(detail) : ''));
                                                output.enqueue({
                                                    type: 'system',
                                                    subtype: 'bridge_state',
                                                    state: state,
                                                    detail: detail,
                                                    uuid: (0, crypto_1.randomUUID)(),
                                                    session_id: (0, state_js_2.getSessionId)(),
                                                });
                                            },
                                            initialMessages: mutableMessages.length > 0 ? mutableMessages : undefined,
                                        })];
                                case 87:
                                    handle_1 = _38.sent();
                                    if (!handle_1) {
                                        sendControlResponseError(message, bridgeFailureDetail_1 !== null && bridgeFailureDetail_1 !== void 0 ? bridgeFailureDetail_1 : 'Remote Control initialization failed');
                                    }
                                    else {
                                        bridgeHandle = handle_1;
                                        bridgeLastForwardedIndex = mutableMessages.length;
                                        // Forward permission requests to the bridge
                                        structuredIO.setOnControlRequestSent(function (request) {
                                            handle_1.sendControlRequest(request);
                                        });
                                        // Cancel stale bridge permission prompts when the SDK
                                        // consumer resolves a can_use_tool request first.
                                        structuredIO.setOnControlRequestResolved(function (requestId) {
                                            handle_1.sendControlCancelRequest(requestId);
                                        });
                                        sendControlResponseSuccess(message, {
                                            session_url: (0, product_js_1.getRemoteSessionUrl)(handle_1.bridgeSessionId, handle_1.sessionIngressUrl),
                                            connect_url: (0, bridgeStatusUtil_js_1.buildBridgeConnectUrl)(handle_1.environmentId, handle_1.sessionIngressUrl),
                                            environment_id: handle_1.environmentId,
                                        });
                                    }
                                    return [3 /*break*/, 89];
                                case 88:
                                    err_2 = _38.sent();
                                    sendControlResponseError(message, (0, errors_js_1.errorMessage)(err_2));
                                    return [3 /*break*/, 89];
                                case 89: return [3 /*break*/, 93];
                                case 90:
                                    if (!bridgeHandle) return [3 /*break*/, 92];
                                    structuredIO.setOnControlRequestSent(undefined);
                                    structuredIO.setOnControlRequestResolved(undefined);
                                    return [4 /*yield*/, bridgeHandle.teardown()];
                                case 91:
                                    _38.sent();
                                    bridgeHandle = null;
                                    _38.label = 92;
                                case 92:
                                    sendControlResponseSuccess(message);
                                    _38.label = 93;
                                case 93: return [3 /*break*/, 95];
                                case 94:
                                    // Unknown control request subtype — send an error response so
                                    // the caller doesn't hang waiting for a reply that never comes.
                                    sendControlResponseError(message, "Unsupported control request subtype: ".concat(message.request.subtype));
                                    _38.label = 95;
                                case 95: return [2 /*return*/, "continue"];
                                case 96:
                                    if (message.type === 'control_response') {
                                        // Replay control_response messages when replay mode is enabled
                                        if (options.replayUserMessages) {
                                            output.enqueue(message);
                                        }
                                        return [2 /*return*/, "continue"];
                                    }
                                    else if (message.type === 'keep_alive') {
                                        return [2 /*return*/, "continue"];
                                    }
                                    else if (message.type === 'update_environment_variables') {
                                        return [2 /*return*/, "continue"];
                                    }
                                    else if (message.type === 'assistant' || message.type === 'system') {
                                        internalMsgs = (0, mappers_js_1.toInternalMessages)([message]);
                                        mutableMessages.push.apply(mutableMessages, internalMsgs);
                                        // Echo assistant messages back so CCR displays them
                                        if (message.type === 'assistant' && options.replayUserMessages) {
                                            output.enqueue(message);
                                        }
                                        return [2 /*return*/, "continue"];
                                    }
                                    _38.label = 97;
                                case 97:
                                    // After handling control, keep-alive, env-var, assistant, and system
                                    // messages above, only user messages should remain.
                                    if (message.type !== 'user') {
                                        return [2 /*return*/, "continue"];
                                    }
                                    // First prompt message implicitly initializes if not already done.
                                    initialized = true;
                                    if (!message.uuid) return [3 /*break*/, 99];
                                    sessionId = (0, state_js_2.getSessionId)();
                                    return [4 /*yield*/, (0, sessionStorage_js_1.doesMessageExistInSession)(sessionId, message.uuid)
                                        // Check both historical duplicates (from file) and runtime duplicates (this session)
                                    ];
                                case 98:
                                    existsInSession = _38.sent();
                                    // Check both historical duplicates (from file) and runtime duplicates (this session)
                                    if (existsInSession || receivedMessageUuids.has(message.uuid)) {
                                        (0, debug_js_1.logForDebugging)("Skipping duplicate user message: ".concat(message.uuid));
                                        // Send acknowledgment for duplicate message if replay mode is enabled
                                        if (options.replayUserMessages) {
                                            (0, debug_js_1.logForDebugging)("Sending acknowledgment for duplicate user message: ".concat(message.uuid));
                                            output.enqueue({
                                                type: 'user',
                                                message: message.message,
                                                session_id: sessionId,
                                                parent_tool_use_id: null,
                                                uuid: message.uuid,
                                                timestamp: message.timestamp,
                                                isReplay: true,
                                            });
                                        }
                                        // Historical dup = transcript already has this turn's output, so it
                                        // ran but its lifecycle was never closed (interrupted before ack).
                                        // Runtime dups don't need this — the original enqueue path closes them.
                                        if (existsInSession) {
                                            (0, commandLifecycle_js_1.notifyCommandLifecycle)(message.uuid, 'completed');
                                        }
                                        return [2 /*return*/, "continue"];
                                    }
                                    // Track this UUID to prevent runtime duplicates
                                    trackReceivedMessageUuid(message.uuid);
                                    _38.label = 99;
                                case 99:
                                    _36 = messageQueueManager_js_1.enqueue;
                                    _37 = {
                                        mode: 'prompt'
                                    };
                                    return [4 /*yield*/, (0, inboundAttachments_js_1.resolveAndPrepend)(message, message.message.content)];
                                case 100:
                                    _36.apply(void 0, [(
                                        // file_attachments rides the protobuf catchall from the web composer.
                                        // Same-ref no-op when absent (no 'file_attachments' key).
                                        _37.value = _38.sent(),
                                            _37.uuid = message.uuid,
                                            _37.priority = message.priority,
                                            _37)]);
                                    // Increment prompt count for attribution tracking and save snapshot
                                    // The snapshot persists promptCount so it survives compaction
                                    if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION')) {
                                        setAppState(function (prev) { return (__assign(__assign({}, prev), { attribution: (0, commitAttribution_js_1.incrementPromptCount)(prev.attribution, function (snapshot) {
                                                void (0, sessionStorage_js_1.recordAttributionSnapshot)(snapshot).catch(function (error) {
                                                    (0, debug_js_1.logForDebugging)("Attribution: Failed to save snapshot: ".concat(error));
                                                });
                                            }) })); });
                                    }
                                    void run();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a = true, _b = __asyncValues(structuredIO.structuredInput);
                    _23.label = 2;
                case 2: return [4 /*yield*/, _b.next()];
                case 3:
                    if (!(_c = _23.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_4()];
                case 4:
                    state_1 = _23.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 6];
                    _23.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_3_1 = _23.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _23.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _e.call(_b)];
                case 9:
                    _23.sent();
                    _23.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    inputClosed = true;
                    cronScheduler === null || cronScheduler === void 0 ? void 0 : cronScheduler.stop();
                    if (!!running) return [3 /*break*/, 17];
                    if (!suggestionState.inflightPromise) return [3 /*break*/, 15];
                    return [4 /*yield*/, Promise.race([suggestionState.inflightPromise, (0, sleep_js_1.sleep)(5000)])];
                case 14:
                    _23.sent();
                    _23.label = 15;
                case 15:
                    (_22 = suggestionState.abortController) === null || _22 === void 0 ? void 0 : _22.abort();
                    suggestionState.abortController = null;
                    return [4 /*yield*/, (0, AsyncHookRegistry_js_1.finalizePendingAsyncHooks)()];
                case 16:
                    _23.sent();
                    unsubscribeSkillChanges();
                    unsubscribeAuthStatus === null || unsubscribeAuthStatus === void 0 ? void 0 : unsubscribeAuthStatus();
                    claudeAiLimits_js_1.statusListeners.delete(rateLimitListener);
                    output.done();
                    _23.label = 17;
                case 17: return [2 /*return*/];
            }
        });
    }); })();
    return output;
}
/**
 * Creates a CanUseToolFn that incorporates a custom permission prompt tool.
 * This function converts the permissionPromptTool into a CanUseToolFn that can be used in ask.tsx
 */
function createCanUseToolWithPermissionPrompt(permissionPromptTool) {
    var _this = this;
    var canUseTool = function (tool, input, toolUseContext, assistantMessage, toolUseId, forceDecision) { return __awaiter(_this, void 0, void 0, function () {
        var mainPermissionResult, _a, _b, combinedSignal, cleanupAbortListener, abortPromise, toolCallPromise, raceResult, result, permissionToolResultBlockParam;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(forceDecision !== null && forceDecision !== void 0)) return [3 /*break*/, 1];
                    _a = forceDecision;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, permissions_js_1.hasPermissionsToUseTool)(tool, input, toolUseContext, assistantMessage, toolUseId)];
                case 2:
                    _a = (_c.sent());
                    _c.label = 3;
                case 3:
                    mainPermissionResult = _a;
                    // If the tool is allowed or denied, return the result
                    if (mainPermissionResult.behavior === 'allow' ||
                        mainPermissionResult.behavior === 'deny') {
                        return [2 /*return*/, mainPermissionResult];
                    }
                    _b = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(toolUseContext.abortController.signal), combinedSignal = _b.signal, cleanupAbortListener = _b.cleanup;
                    // Check if already aborted before starting the race
                    if (combinedSignal.aborted) {
                        cleanupAbortListener();
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: 'Permission prompt was aborted.',
                                decisionReason: {
                                    type: 'permissionPromptTool',
                                    permissionPromptToolName: tool.name,
                                    toolResult: undefined,
                                },
                            }];
                    }
                    abortPromise = new Promise(function (resolve) {
                        combinedSignal.addEventListener('abort', function () { return resolve('aborted'); }, {
                            once: true,
                        });
                    });
                    toolCallPromise = permissionPromptTool.call({
                        tool_name: tool.name,
                        input: input,
                        tool_use_id: toolUseId,
                    }, toolUseContext, canUseTool, assistantMessage);
                    return [4 /*yield*/, Promise.race([toolCallPromise, abortPromise])];
                case 4:
                    raceResult = _c.sent();
                    cleanupAbortListener();
                    if (raceResult === 'aborted' || combinedSignal.aborted) {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: 'Permission prompt was aborted.',
                                decisionReason: {
                                    type: 'permissionPromptTool',
                                    permissionPromptToolName: tool.name,
                                    toolResult: undefined,
                                },
                            }];
                    }
                    result = raceResult;
                    permissionToolResultBlockParam = permissionPromptTool.mapToolResultToToolResultBlockParam(result.data, '1');
                    if (!permissionToolResultBlockParam.content ||
                        !Array.isArray(permissionToolResultBlockParam.content) ||
                        !permissionToolResultBlockParam.content[0] ||
                        permissionToolResultBlockParam.content[0].type !== 'text' ||
                        typeof permissionToolResultBlockParam.content[0].text !== 'string') {
                        throw new Error('Permission prompt tool returned an invalid result. Expected a single text block param with type="text" and a string text value.');
                    }
                    return [2 /*return*/, (0, PermissionPromptToolResultSchema_js_1.permissionPromptToolResultToPermissionDecision)((0, PermissionPromptToolResultSchema_js_1.outputSchema)().parse((0, json_js_1.safeParseJSON)(permissionToolResultBlockParam.content[0].text)), permissionPromptTool, input, toolUseContext)];
            }
        });
    }); };
    return canUseTool;
}
// Exported for testing — regression: this used to crash at construction when
// getMcpTools() was empty (before per-server connects populated appState).
function getCanUseToolFn(permissionPromptToolName, structuredIO, getMcpTools, onPermissionPrompt) {
    var _this = this;
    if (permissionPromptToolName === 'stdio') {
        return structuredIO.createCanUseTool(onPermissionPrompt);
    }
    if (!permissionPromptToolName) {
        return function (tool, input, toolUseContext, assistantMessage, toolUseId, forceDecision) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(forceDecision !== null && forceDecision !== void 0)) return [3 /*break*/, 1];
                        _a = forceDecision;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, (0, permissions_js_1.hasPermissionsToUseTool)(tool, input, toolUseContext, assistantMessage, toolUseId)];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3: return [2 /*return*/, _a];
                }
            });
        }); };
    }
    // Lazy lookup: MCP connects are per-server incremental in print mode, so
    // the tool may not be in appState yet at init time. Resolve on first call
    // (first permission prompt), by which point connects have had time to finish.
    var resolved = null;
    return function (tool, input, toolUseContext, assistantMessage, toolUseId, forceDecision) { return __awaiter(_this, void 0, void 0, function () {
        var mcpTools, permissionPromptTool, error, error;
        return __generator(this, function (_a) {
            if (!resolved) {
                mcpTools = getMcpTools();
                permissionPromptTool = mcpTools.find(function (t) {
                    return (0, Tool_js_1.toolMatchesName)(t, permissionPromptToolName);
                });
                if (!permissionPromptTool) {
                    error = "Error: MCP tool ".concat(permissionPromptToolName, " (passed via --permission-prompt-tool) not found. Available MCP tools: ").concat(mcpTools.map(function (t) { return t.name; }).join(', ') || 'none');
                    process.stderr.write("".concat(error, "\n"));
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    throw new Error(error);
                }
                if (!permissionPromptTool.inputJSONSchema) {
                    error = "Error: tool ".concat(permissionPromptToolName, " (passed via --permission-prompt-tool) must be an MCP tool");
                    process.stderr.write("".concat(error, "\n"));
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    throw new Error(error);
                }
                resolved = createCanUseToolWithPermissionPrompt(permissionPromptTool);
            }
            return [2 /*return*/, resolved(tool, input, toolUseContext, assistantMessage, toolUseId, forceDecision)];
        });
    }); };
}
function handleInitializeRequest(request, requestId, initialized, output, commands, modelInfos, structuredIO, enableAuthStatus, options, agents, getAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var stdinAgents, alreadyResolved, mainThreadAgent, agentSystemPrompt, agentModel, settings, outputStyle, availableOutputStyles, accountInfo, hooks, _i, _a, _b, event_5, matchers, initResponse, appState, authStatusManager, status_2;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (initialized) {
                        output.enqueue({
                            type: 'control_response',
                            response: {
                                subtype: 'error',
                                error: 'Already initialized',
                                request_id: requestId,
                                pending_permission_requests: structuredIO.getPendingPermissionRequests(),
                            },
                        });
                        return [2 /*return*/];
                    }
                    // Apply systemPrompt/appendSystemPrompt from stdin to avoid ARG_MAX limits
                    if (request.systemPrompt !== undefined) {
                        options.systemPrompt = request.systemPrompt;
                    }
                    if (request.appendSystemPrompt !== undefined) {
                        options.appendSystemPrompt = request.appendSystemPrompt;
                    }
                    if (request.promptSuggestions !== undefined) {
                        options.promptSuggestions = request.promptSuggestions;
                    }
                    // Merge agents from stdin to avoid ARG_MAX limits
                    if (request.agents) {
                        stdinAgents = (0, loadAgentsDir_js_1.parseAgentsFromJson)(request.agents, 'flagSettings');
                        agents.push.apply(agents, stdinAgents);
                    }
                    // Re-evaluate main thread agent after SDK agents are merged
                    // This allows --agent to reference agents defined via SDK
                    if (options.agent) {
                        alreadyResolved = (0, state_js_2.getMainThreadAgentType)() === options.agent;
                        mainThreadAgent = agents.find(function (a) { return a.agentType === options.agent; });
                        if (mainThreadAgent && !alreadyResolved) {
                            // Update the main thread agent type in bootstrap state
                            (0, state_js_2.setMainThreadAgentType)(mainThreadAgent.agentType);
                            // Apply the agent's system prompt if user hasn't specified a custom one
                            // SDK agents are always custom agents (not built-in), so getSystemPrompt() takes no args
                            if (!options.systemPrompt && !(0, loadAgentsDir_js_1.isBuiltInAgent)(mainThreadAgent)) {
                                agentSystemPrompt = mainThreadAgent.getSystemPrompt();
                                if (agentSystemPrompt) {
                                    options.systemPrompt = agentSystemPrompt;
                                }
                            }
                            // Apply the agent's model if user didn't specify one and agent has a model
                            if (!options.userSpecifiedModel &&
                                mainThreadAgent.model &&
                                mainThreadAgent.model !== 'inherit') {
                                agentModel = (0, model_js_1.parseUserSpecifiedModel)(mainThreadAgent.model);
                                (0, state_js_2.setMainLoopModelOverride)(agentModel);
                            }
                            // SDK-defined agents arrive via init, so main.tsx's lookup missed them.
                            if (mainThreadAgent.initialPrompt) {
                                structuredIO.prependUserMessage(mainThreadAgent.initialPrompt);
                            }
                        }
                        else if (mainThreadAgent === null || mainThreadAgent === void 0 ? void 0 : mainThreadAgent.initialPrompt) {
                            // Filesystem-defined agent (alreadyResolved by main.tsx). main.tsx
                            // handles initialPrompt for the string inputPrompt case, but when
                            // inputPrompt is an AsyncIterable (SDK stream-json), it can't
                            // concatenate — fall back to prependUserMessage here.
                            structuredIO.prependUserMessage(mainThreadAgent.initialPrompt);
                        }
                    }
                    settings = (0, settings_js_1.getSettings_DEPRECATED)();
                    outputStyle = (settings === null || settings === void 0 ? void 0 : settings.outputStyle) || outputStyles_js_1.DEFAULT_OUTPUT_STYLE_NAME;
                    return [4 /*yield*/, (0, outputStyles_js_1.getAllOutputStyles)((0, cwd_js_1.getCwd)())
                        // Get account information
                    ];
                case 1:
                    availableOutputStyles = _d.sent();
                    accountInfo = (0, auth_js_1.getAccountInformation)();
                    if (request.hooks) {
                        hooks = {};
                        for (_i = 0, _a = Object.entries(request.hooks); _i < _a.length; _i++) {
                            _b = _a[_i], event_5 = _b[0], matchers = _b[1];
                            hooks[event_5] = matchers.map(function (matcher) {
                                var callbacks = matcher.hookCallbackIds.map(function (callbackId) {
                                    return structuredIO.createHookCallback(callbackId, matcher.timeout);
                                });
                                return {
                                    matcher: matcher.matcher,
                                    hooks: callbacks,
                                };
                            });
                        }
                        (0, state_js_1.registerHookCallbacks)(hooks);
                    }
                    if (request.jsonSchema) {
                        (0, state_js_1.setInitJsonSchema)(request.jsonSchema);
                    }
                    initResponse = {
                        commands: commands
                            .filter(function (cmd) { return cmd.userInvocable !== false; })
                            .map(function (cmd) { return ({
                            name: (0, commands_js_1.getCommandName)(cmd),
                            description: (0, commands_js_1.formatDescriptionWithSource)(cmd),
                            argumentHint: cmd.argumentHint || '',
                        }); }),
                        agents: agents.map(function (agent) { return ({
                            name: agent.agentType,
                            description: agent.whenToUse,
                            // 'inherit' is an internal sentinel; normalize to undefined for the public API
                            model: agent.model === 'inherit' ? undefined : agent.model,
                        }); }),
                        output_style: outputStyle,
                        available_output_styles: Object.keys(availableOutputStyles),
                        models: modelInfos,
                        account: {
                            email: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.email,
                            organization: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.organization,
                            subscriptionType: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.subscription,
                            tokenSource: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.tokenSource,
                            apiKeySource: accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.apiKeySource,
                            // getAccountInformation() returns undefined under 3P providers, so the
                            // other fields are all absent. apiProvider disambiguates "not logged
                            // in" (firstParty + tokenSource:none) from "3P, login not applicable".
                            apiProvider: (0, providers_js_1.getAPIProvider)(),
                        },
                        pid: process.pid,
                    };
                    if ((0, fastMode_js_1.isFastModeEnabled)() && (0, fastMode_js_1.isFastModeAvailable)()) {
                        appState = getAppState();
                        initResponse.fast_mode_state = (0, fastMode_js_1.getFastModeState)((_c = options.userSpecifiedModel) !== null && _c !== void 0 ? _c : null, appState.fastMode);
                    }
                    output.enqueue({
                        type: 'control_response',
                        response: {
                            subtype: 'success',
                            request_id: requestId,
                            response: initResponse,
                        },
                    });
                    // After the initialize message, check the auth status-
                    // This will get notified of changes, but we also want to send the
                    // initial state.
                    if (enableAuthStatus) {
                        authStatusManager = awsAuthStatusManager_js_1.AwsAuthStatusManager.getInstance();
                        status_2 = authStatusManager.getStatus();
                        if (status_2) {
                            output.enqueue({
                                type: 'auth_status',
                                isAuthenticating: status_2.isAuthenticating,
                                output: status_2.output,
                                error: status_2.error,
                                uuid: (0, crypto_1.randomUUID)(),
                                session_id: (0, state_js_2.getSessionId)(),
                            });
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleRewindFiles(userMessageId, appState, setAppState, dryRun) {
    return __awaiter(this, void 0, void 0, function () {
        var diffStats, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(0, fileHistory_js_1.fileHistoryEnabled)()) {
                        return [2 /*return*/, { canRewind: false, error: 'File rewinding is not enabled.' }];
                    }
                    if (!(0, fileHistory_js_1.fileHistoryCanRestore)(appState.fileHistory, userMessageId)) {
                        return [2 /*return*/, {
                                canRewind: false,
                                error: 'No file checkpoint found for this message.',
                            }];
                    }
                    if (!dryRun) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, fileHistory_js_1.fileHistoryGetDiffStats)(appState.fileHistory, userMessageId)];
                case 1:
                    diffStats = _a.sent();
                    return [2 /*return*/, {
                            canRewind: true,
                            filesChanged: diffStats === null || diffStats === void 0 ? void 0 : diffStats.filesChanged,
                            insertions: diffStats === null || diffStats === void 0 ? void 0 : diffStats.insertions,
                            deletions: diffStats === null || diffStats === void 0 ? void 0 : diffStats.deletions,
                        }];
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, fileHistory_js_1.fileHistoryRewind)(function (updater) {
                            return setAppState(function (prev) { return (__assign(__assign({}, prev), { fileHistory: updater(prev.fileHistory) })); });
                        }, userMessageId)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_10 = _a.sent();
                    return [2 /*return*/, {
                            canRewind: false,
                            error: "Failed to rewind: ".concat((0, errors_js_1.errorMessage)(error_10)),
                        }];
                case 5: return [2 /*return*/, { canRewind: true }];
            }
        });
    });
}
function handleSetPermissionMode(request, requestId, toolPermissionContext, output) {
    // Check if trying to switch to bypassPermissions mode
    if (request.mode === 'bypassPermissions') {
        if ((0, permissionSetup_js_1.isBypassPermissionsModeDisabled)()) {
            output.enqueue({
                type: 'control_response',
                response: {
                    subtype: 'error',
                    request_id: requestId,
                    error: 'Cannot set permission mode to bypassPermissions because it is disabled by settings or configuration',
                },
            });
            return toolPermissionContext;
        }
        if (!toolPermissionContext.isBypassPermissionsModeAvailable) {
            output.enqueue({
                type: 'control_response',
                response: {
                    subtype: 'error',
                    request_id: requestId,
                    error: 'Cannot set permission mode to bypassPermissions because the session was not launched with --dangerously-skip-permissions',
                },
            });
            return toolPermissionContext;
        }
    }
    // Check if trying to switch to auto mode without the classifier gate
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') &&
        request.mode === 'auto' &&
        !(0, permissionSetup_js_1.isAutoModeGateEnabled)()) {
        var reason = (0, permissionSetup_js_1.getAutoModeUnavailableReason)();
        output.enqueue({
            type: 'control_response',
            response: {
                subtype: 'error',
                request_id: requestId,
                error: reason
                    ? "Cannot set permission mode to auto: ".concat((0, permissionSetup_js_1.getAutoModeUnavailableNotification)(reason))
                    : 'Cannot set permission mode to auto',
            },
        });
        return toolPermissionContext;
    }
    // Allow the mode switch
    output.enqueue({
        type: 'control_response',
        response: {
            subtype: 'success',
            request_id: requestId,
            response: {
                mode: request.mode,
            },
        },
    });
    return __assign(__assign({}, (0, permissionSetup_js_1.transitionPermissionMode)(toolPermissionContext.mode, request.mode, toolPermissionContext)), { mode: request.mode });
}
/**
 * IDE-triggered channel enable. Derives the ChannelEntry from the connection's
 * pluginSource (IDE can't spoof kind/marketplace — we only take the server
 * name), appends it to session allowedChannels, and runs the full gate. On
 * gate failure, rolls back the append. On success, registers a notification
 * handler that enqueues channel messages at priority:'next' — drainCommandQueue
 * picks them up between turns.
 *
 * Intentionally does NOT register the claude/channel/permission handler that
 * useManageMCPConnections sets up for interactive mode. That handler resolves
 * a pending dialog inside handleInteractivePermission — but print.ts never
 * calls handleInteractivePermission. When SDK permission lands on 'ask', it
 * goes to the consumer's canUseTool callback over stdio; there is no CLI-side
 * dialog for a remote "yes tbxkq" to resolve. If an IDE wants channel-relayed
 * tool approval, that's IDE-side plumbing against its own pending-map. (Also
 * gated separately by tengu_harbor_permissions — not yet shipping on
 * interactive either.)
 */
function handleChannelEnable(requestId, serverName, connectionPool, output) {
    var _this = this;
    var respondError = function (error) {
        return output.enqueue({
            type: 'control_response',
            response: { subtype: 'error', request_id: requestId, error: error },
        });
    };
    if (!((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS'))) {
        return respondError('channels feature not available in this build');
    }
    // Only a 'connected' client has .capabilities and .client to register the
    // handler on. The pool spread at the call site matches mcp_status.
    var connection = connectionPool.find(function (c) { return c.name === serverName && c.type === 'connected'; });
    if (!connection || connection.type !== 'connected') {
        return respondError("server ".concat(serverName, " is not connected"));
    }
    var pluginSource = connection.config.pluginSource;
    var parsed = pluginSource ? (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginSource) : undefined;
    if (!(parsed === null || parsed === void 0 ? void 0 : parsed.marketplace)) {
        // No pluginSource or @-less source — can never pass the {plugin,
        // marketplace}-keyed allowlist. Short-circuit with the same reason the
        // gate would produce.
        return respondError("server ".concat(serverName, " is not plugin-sourced; channel_enable requires a marketplace plugin"));
    }
    var entry = {
        kind: 'plugin',
        name: parsed.name,
        marketplace: parsed.marketplace,
    };
    // Idempotency: don't double-append on repeat enable.
    var prior = (0, state_js_2.getAllowedChannels)();
    var already = prior.some(function (e) {
        return e.kind === 'plugin' &&
            e.name === entry.name &&
            e.marketplace === entry.marketplace;
    });
    if (!already)
        (0, state_js_2.setAllowedChannels)(__spreadArray(__spreadArray([], prior, true), [entry], false));
    var gate = (0, channelNotification_js_1.gateChannelServer)(serverName, connection.capabilities, pluginSource);
    if (gate.action === 'skip') {
        // Rollback — only remove the entry we appended.
        if (!already)
            (0, state_js_2.setAllowedChannels)(prior);
        return respondError(gate.reason);
    }
    var pluginId = "".concat(entry.name, "@").concat(entry.marketplace);
    (0, log_js_1.logMCPDebug)(serverName, 'Channel notifications registered');
    (0, index_js_3.logEvent)('tengu_mcp_channel_enable', { plugin: pluginId });
    // Identical enqueue shape to the interactive register block in
    // useManageMCPConnections. drainCommandQueue processes it between turns —
    // channel messages queue at priority 'next' and are seen by the model on
    // the turn after they arrive.
    connection.client.setNotificationHandler((0, channelNotification_js_1.ChannelMessageNotificationSchema)(), function (notification) { return __awaiter(_this, void 0, void 0, function () {
        var _a, content, meta;
        return __generator(this, function (_b) {
            _a = notification.params, content = _a.content, meta = _a.meta;
            (0, log_js_1.logMCPDebug)(serverName, "notifications/claude/channel: ".concat(content.slice(0, 80)));
            (0, index_js_3.logEvent)('tengu_mcp_channel_message', {
                content_length: content.length,
                meta_key_count: Object.keys(meta !== null && meta !== void 0 ? meta : {}).length,
                entry_kind: 'plugin',
                is_dev: false,
                plugin: pluginId,
            });
            (0, messageQueueManager_js_1.enqueue)({
                mode: 'prompt',
                value: (0, channelNotification_js_1.wrapChannelMessage)(serverName, content, meta),
                priority: 'next',
                isMeta: true,
                origin: { kind: 'channel', server: serverName },
                skipSlashCommands: true,
            });
            return [2 /*return*/];
        });
    }); });
    output.enqueue({
        type: 'control_response',
        response: {
            subtype: 'success',
            request_id: requestId,
            response: undefined,
        },
    });
}
/**
 * Re-register the channel notification handler after mcp_reconnect /
 * mcp_toggle creates a new client. handleChannelEnable bound the handler to
 * the OLD client object; allowedChannels survives the reconnect but the
 * handler binding does not. Without this, channel messages silently drop
 * after a reconnect while the IDE still believes the channel is live.
 *
 * Mirrors the interactive CLI's onConnectionAttempt in
 * useManageMCPConnections, which re-gates on every new connection. Paired
 * with registerElicitationHandlers at the same call sites.
 *
 * No-op if the server was never channel-enabled: gateChannelServer calls
 * findChannelEntry internally and returns skip/session for an unlisted
 * server, so reconnecting a non-channel MCP server costs one feature-flag
 * check.
 */
function reregisterChannelHandlerAfterReconnect(connection) {
    var _this = this;
    if (!((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')))
        return;
    if (connection.type !== 'connected')
        return;
    var gate = (0, channelNotification_js_1.gateChannelServer)(connection.name, connection.capabilities, connection.config.pluginSource);
    if (gate.action !== 'register')
        return;
    var entry = (0, channelNotification_js_1.findChannelEntry)(connection.name, (0, state_js_2.getAllowedChannels)());
    var pluginId = (entry === null || entry === void 0 ? void 0 : entry.kind) === 'plugin'
        ? "".concat(entry.name, "@").concat(entry.marketplace)
        : undefined;
    (0, log_js_1.logMCPDebug)(connection.name, 'Channel notifications re-registered after reconnect');
    connection.client.setNotificationHandler((0, channelNotification_js_1.ChannelMessageNotificationSchema)(), function (notification) { return __awaiter(_this, void 0, void 0, function () {
        var _a, content, meta;
        var _b;
        return __generator(this, function (_c) {
            _a = notification.params, content = _a.content, meta = _a.meta;
            (0, log_js_1.logMCPDebug)(connection.name, "notifications/claude/channel: ".concat(content.slice(0, 80)));
            (0, index_js_3.logEvent)('tengu_mcp_channel_message', {
                content_length: content.length,
                meta_key_count: Object.keys(meta !== null && meta !== void 0 ? meta : {}).length,
                entry_kind: entry === null || entry === void 0 ? void 0 : entry.kind,
                is_dev: (_b = entry === null || entry === void 0 ? void 0 : entry.dev) !== null && _b !== void 0 ? _b : false,
                plugin: pluginId,
            });
            (0, messageQueueManager_js_1.enqueue)({
                mode: 'prompt',
                value: (0, channelNotification_js_1.wrapChannelMessage)(connection.name, content, meta),
                priority: 'next',
                isMeta: true,
                origin: { kind: 'channel', server: connection.name },
                skipSlashCommands: true,
            });
            return [2 /*return*/];
        });
    }); });
}
/**
 * Emits an error message in the correct format based on outputFormat.
 * When using stream-json, writes JSON to stdout; otherwise writes plain text to stderr.
 */
function emitLoadError(message, outputFormat) {
    if (outputFormat === 'stream-json') {
        var errorResult = {
            type: 'result',
            subtype: 'error_during_execution',
            duration_ms: 0,
            duration_api_ms: 0,
            is_error: true,
            num_turns: 0,
            stop_reason: null,
            session_id: (0, state_js_2.getSessionId)(),
            total_cost_usd: 0,
            usage: logging_js_1.EMPTY_USAGE,
            modelUsage: {},
            permission_denials: [],
            uuid: (0, crypto_1.randomUUID)(),
            errors: [message],
        };
        process.stdout.write((0, slowOperations_js_1.jsonStringify)(errorResult) + '\n');
    }
    else {
        process.stderr.write(message + '\n');
    }
}
/**
 * Removes an interrupted user message and its synthetic assistant sentinel
 * from the message array. Used during gateway-triggered restarts to clean up
 * the message history before re-enqueuing the interrupted prompt.
 *
 * @internal Exported for testing
 */
function removeInterruptedMessage(messages, interruptedUserMessage) {
    var idx = messages.findIndex(function (m) { return m.uuid === interruptedUserMessage.uuid; });
    if (idx !== -1) {
        // Remove the user message and the sentinel that immediately follows it.
        // splice safely handles the case where idx is the last element.
        messages.splice(idx, 2);
    }
}
function loadInitialMessages(setAppState, options) {
    return __awaiter(this, void 0, void 0, function () {
        var persistSession, result, warning, _a, getAgentDefinitionsWithOverrides, getActiveAgentsFromList_1, freshAgentDefs_1, error_11, _b, checkOutTeleportedSessionBranch, processMessagesForTeleportResume, teleportResumeCodeSession, validateGitState, teleportResult, branchError, error_12, parsedSessionId, errorMessage_3, _c, metadata, result, index, warning, _d, getAgentDefinitionsWithOverrides, getActiveAgentsFromList_2, freshAgentDefs_2, error_13, errorMessage_4;
        var _e, _f;
        var _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    persistSession = !(0, state_js_2.isSessionPersistenceDisabled)();
                    if (!options.continue) return [3 /*break*/, 9];
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 8, , 9]);
                    (0, index_js_3.logEvent)('tengu_continue_print', {});
                    return [4 /*yield*/, (0, conversationRecovery_js_1.loadConversationForResume)(undefined /* sessionId */, undefined /* file path */)];
                case 2:
                    result = _o.sent();
                    if (!result) return [3 /*break*/, 7];
                    if (!((0, bun_bundle_1.feature)('COORDINATOR_MODE') && coordinatorModeModule)) return [3 /*break*/, 4];
                    warning = coordinatorModeModule.matchSessionMode(result.mode);
                    if (!warning) return [3 /*break*/, 4];
                    process.stderr.write(warning + '\n');
                    _a = 
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    require('../tools/AgentTool/loadAgentsDir.js'), getAgentDefinitionsWithOverrides = _a.getAgentDefinitionsWithOverrides, getActiveAgentsFromList_1 = _a.getActiveAgentsFromList;
                    (_h = (_g = getAgentDefinitionsWithOverrides.cache).clear) === null || _h === void 0 ? void 0 : _h.call(_g);
                    return [4 /*yield*/, getAgentDefinitionsWithOverrides((0, cwd_js_1.getCwd)())];
                case 3:
                    freshAgentDefs_1 = _o.sent();
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { agentDefinitions: __assign(__assign({}, freshAgentDefs_1), { allAgents: freshAgentDefs_1.allAgents, activeAgents: getActiveAgentsFromList_1(freshAgentDefs_1.allAgents) }) })); });
                    _o.label = 4;
                case 4:
                    if (!!options.forkSession) return [3 /*break*/, 6];
                    if (!result.sessionId) return [3 /*break*/, 6];
                    (0, state_js_2.switchSession)((0, ids_js_1.asSessionId)(result.sessionId), result.fullPath ? (0, path_1.dirname)(result.fullPath) : null);
                    if (!persistSession) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, sessionStorage_js_1.resetSessionFilePointer)()];
                case 5:
                    _o.sent();
                    _o.label = 6;
                case 6:
                    (0, sessionRestore_js_1.restoreSessionStateFromLog)(result, setAppState);
                    // Restore session metadata so it's re-appended on exit via reAppendSessionMetadata
                    (0, sessionStorage_js_1.restoreSessionMetadata)(options.forkSession
                        ? __assign(__assign({}, result), { worktreeSession: undefined }) : result);
                    // Write mode entry for the resumed session
                    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE') && coordinatorModeModule) {
                        (0, sessionStorage_js_1.saveMode)(coordinatorModeModule.isCoordinatorMode()
                            ? 'coordinator'
                            : 'normal');
                    }
                    return [2 /*return*/, {
                            messages: result.messages,
                            turnInterruptionState: result.turnInterruptionState,
                            agentSetting: result.agentSetting,
                        }];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_11 = _o.sent();
                    (0, log_js_1.logError)(error_11);
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    return [2 /*return*/, { messages: [] }];
                case 9:
                    if (!options.teleport) return [3 /*break*/, 16];
                    _o.label = 10;
                case 10:
                    _o.trys.push([10, 15, , 16]);
                    if (!(0, index_js_4.isPolicyAllowed)('allow_remote_sessions')) {
                        throw new Error("Remote sessions are disabled by your organization's policy.");
                    }
                    (0, index_js_3.logEvent)('tengu_teleport_print', {});
                    if (typeof options.teleport !== 'string') {
                        throw new Error('No session ID provided for teleport');
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('src/utils/teleport.js'); })];
                case 11:
                    _b = _o.sent(), checkOutTeleportedSessionBranch = _b.checkOutTeleportedSessionBranch, processMessagesForTeleportResume = _b.processMessagesForTeleportResume, teleportResumeCodeSession = _b.teleportResumeCodeSession, validateGitState = _b.validateGitState;
                    return [4 /*yield*/, validateGitState()];
                case 12:
                    _o.sent();
                    return [4 /*yield*/, teleportResumeCodeSession(options.teleport)];
                case 13:
                    teleportResult = _o.sent();
                    return [4 /*yield*/, checkOutTeleportedSessionBranch(teleportResult.branch)];
                case 14:
                    branchError = (_o.sent()).branchError;
                    return [2 /*return*/, {
                            messages: processMessagesForTeleportResume(teleportResult.log, branchError),
                        }];
                case 15:
                    error_12 = _o.sent();
                    (0, log_js_1.logError)(error_12);
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    return [2 /*return*/, { messages: [] }];
                case 16:
                    if (!options.resume) return [3 /*break*/, 31];
                    _o.label = 17;
                case 17:
                    _o.trys.push([17, 30, , 31]);
                    (0, index_js_3.logEvent)('tengu_resume_print', {});
                    parsedSessionId = (0, sessionUrl_js_1.parseSessionIdentifier)(typeof options.resume === 'string' ? options.resume : '');
                    if (!parsedSessionId) {
                        errorMessage_3 = 'Error: --resume requires a valid session ID when used with --print. Usage: claude -p --resume <session-id>';
                        if (typeof options.resume === 'string') {
                            errorMessage_3 += ". Session IDs must be in UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000). Provided value \"".concat(options.resume, "\" is not a valid UUID");
                        }
                        emitLoadError(errorMessage_3, options.outputFormat);
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/, { messages: [] }];
                    }
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_CCR_V2)) return [3 /*break*/, 19];
                    return [4 /*yield*/, Promise.all([
                            (0, sessionStorage_js_1.hydrateFromCCRv2InternalEvents)(parsedSessionId.sessionId),
                            options.restoredWorkerState,
                        ])];
                case 18:
                    _c = _o.sent(), metadata = _c[1];
                    if (metadata) {
                        setAppState((0, onChangeAppState_js_1.externalMetadataToAppState)(metadata));
                        if (typeof metadata.model === 'string') {
                            (0, state_js_2.setMainLoopModelOverride)(metadata.model);
                        }
                    }
                    return [3 /*break*/, 21];
                case 19:
                    if (!(parsedSessionId.isUrl &&
                        parsedSessionId.ingressUrl &&
                        (0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_SESSION_PERSISTENCE))) return [3 /*break*/, 21];
                    // v1: fetch session logs from Session Ingress
                    return [4 /*yield*/, (0, sessionStorage_js_1.hydrateRemoteSession)(parsedSessionId.sessionId, parsedSessionId.ingressUrl)];
                case 20:
                    // v1: fetch session logs from Session Ingress
                    _o.sent();
                    _o.label = 21;
                case 21: return [4 /*yield*/, (0, conversationRecovery_js_1.loadConversationForResume)(parsedSessionId.sessionId, parsedSessionId.jsonlFile || undefined)
                    // hydrateFromCCRv2InternalEvents writes an empty transcript file for
                    // fresh sessions (writeFile(sessionFile, '') with zero events), so
                    // loadConversationForResume returns {messages: []} not null. Treat
                    // empty the same as null so SessionStart still fires.
                ];
                case 22:
                    result = _o.sent();
                    if (!(!result || result.messages.length === 0)) return [3 /*break*/, 25];
                    if (!(parsedSessionId.isUrl ||
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_CCR_V2))) return [3 /*break*/, 24];
                    _e = {};
                    return [4 /*yield*/, ((_j = options.sessionStartHooksPromise) !== null && _j !== void 0 ? _j : (0, sessionStart_js_1.processSessionStartHooks)('startup'))];
                case 23: 
                // Execute SessionStart hooks for startup since we're starting a new session
                return [2 /*return*/, (_e.messages = _o.sent(),
                        _e)];
                case 24:
                    emitLoadError("No conversation found with session ID: ".concat(parsedSessionId.sessionId), options.outputFormat);
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    return [2 /*return*/, { messages: [] }];
                case 25:
                    // Handle resumeSessionAt feature
                    if (options.resumeSessionAt) {
                        index = result.messages.findIndex(function (m) { return m.uuid === options.resumeSessionAt; });
                        if (index < 0) {
                            emitLoadError("No message found with message.uuid of: ".concat(options.resumeSessionAt), options.outputFormat);
                            (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                            return [2 /*return*/, { messages: [] }];
                        }
                        result.messages = index >= 0 ? result.messages.slice(0, index + 1) : [];
                    }
                    if (!((0, bun_bundle_1.feature)('COORDINATOR_MODE') && coordinatorModeModule)) return [3 /*break*/, 27];
                    warning = coordinatorModeModule.matchSessionMode(result.mode);
                    if (!warning) return [3 /*break*/, 27];
                    process.stderr.write(warning + '\n');
                    _d = 
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    require('../tools/AgentTool/loadAgentsDir.js'), getAgentDefinitionsWithOverrides = _d.getAgentDefinitionsWithOverrides, getActiveAgentsFromList_2 = _d.getActiveAgentsFromList;
                    (_l = (_k = getAgentDefinitionsWithOverrides.cache).clear) === null || _l === void 0 ? void 0 : _l.call(_k);
                    return [4 /*yield*/, getAgentDefinitionsWithOverrides((0, cwd_js_1.getCwd)())];
                case 26:
                    freshAgentDefs_2 = _o.sent();
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { agentDefinitions: __assign(__assign({}, freshAgentDefs_2), { allAgents: freshAgentDefs_2.allAgents, activeAgents: getActiveAgentsFromList_2(freshAgentDefs_2.allAgents) }) })); });
                    _o.label = 27;
                case 27:
                    if (!(!options.forkSession && result.sessionId)) return [3 /*break*/, 29];
                    (0, state_js_2.switchSession)((0, ids_js_1.asSessionId)(result.sessionId), result.fullPath ? (0, path_1.dirname)(result.fullPath) : null);
                    if (!persistSession) return [3 /*break*/, 29];
                    return [4 /*yield*/, (0, sessionStorage_js_1.resetSessionFilePointer)()];
                case 28:
                    _o.sent();
                    _o.label = 29;
                case 29:
                    (0, sessionRestore_js_1.restoreSessionStateFromLog)(result, setAppState);
                    // Restore session metadata so it's re-appended on exit via reAppendSessionMetadata
                    (0, sessionStorage_js_1.restoreSessionMetadata)(options.forkSession
                        ? __assign(__assign({}, result), { worktreeSession: undefined }) : result);
                    // Write mode entry for the resumed session
                    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE') && coordinatorModeModule) {
                        (0, sessionStorage_js_1.saveMode)(coordinatorModeModule.isCoordinatorMode() ? 'coordinator' : 'normal');
                    }
                    return [2 /*return*/, {
                            messages: result.messages,
                            turnInterruptionState: result.turnInterruptionState,
                            agentSetting: result.agentSetting,
                        }];
                case 30:
                    error_13 = _o.sent();
                    (0, log_js_1.logError)(error_13);
                    errorMessage_4 = error_13 instanceof Error
                        ? "Failed to resume session: ".concat(error_13.message)
                        : 'Failed to resume session with --print mode';
                    emitLoadError(errorMessage_4, options.outputFormat);
                    (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    return [2 /*return*/, { messages: [] }];
                case 31:
                    _f = {};
                    return [4 /*yield*/, ((_m = options.sessionStartHooksPromise) !== null && _m !== void 0 ? _m : (0, sessionStart_js_1.processSessionStartHooks)('startup'))];
                case 32: 
                // Join the SessionStart hooks promise kicked in main.tsx (or run fresh if
                // it wasn't kicked — e.g. --continue with no prior session falls through
                // here with sessionStartHooksPromise undefined because main.tsx guards on continue)
                return [2 /*return*/, (_f.messages = _o.sent(),
                        _f)];
            }
        });
    });
}
function getStructuredIO(inputPrompt, options) {
    var inputStream;
    if (typeof inputPrompt === 'string') {
        if (inputPrompt.trim() !== '') {
            // Normalize to a streaming input.
            inputStream = (0, generators_js_1.fromArray)([
                (0, slowOperations_js_1.jsonStringify)({
                    type: 'user',
                    session_id: '',
                    message: {
                        role: 'user',
                        content: inputPrompt,
                    },
                    parent_tool_use_id: null,
                }),
            ]);
        }
        else {
            // Empty string - create empty stream
            inputStream = (0, generators_js_1.fromArray)([]);
        }
    }
    else {
        inputStream = inputPrompt;
    }
    // Use RemoteIO if sdkUrl is provided, otherwise use regular StructuredIO
    return options.sdkUrl
        ? new remoteIO_js_1.RemoteIO(options.sdkUrl, inputStream, options.replayUserMessages)
        : new structuredIO_js_1.StructuredIO(inputStream, options.replayUserMessages);
}
/**
 * Handles unexpected permission responses by looking up the unresolved tool
 * call in the transcript and enqueuing it for execution.
 *
 * Returns true if a permission was enqueued, false otherwise.
 */
function handleOrphanedPermissionResponse(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var permissionResult, toolUseID, assistantMessage;
        var _c;
        var message = _b.message, setAppState = _b.setAppState, onEnqueued = _b.onEnqueued, handledToolUseIds = _b.handledToolUseIds;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(message.response.subtype === 'success' &&
                        ((_c = message.response.response) === null || _c === void 0 ? void 0 : _c.toolUseID) &&
                        typeof message.response.response.toolUseID === 'string')) return [3 /*break*/, 2];
                    permissionResult = message.response.response;
                    toolUseID = permissionResult.toolUseID;
                    if (!toolUseID) {
                        return [2 /*return*/, false];
                    }
                    (0, debug_js_1.logForDebugging)("handleOrphanedPermissionResponse: received orphaned control_response for toolUseID=".concat(toolUseID, " request_id=").concat(message.response.request_id));
                    // Prevent re-processing the same orphaned tool_use. Without this guard,
                    // duplicate control_response deliveries (e.g. from WebSocket reconnect)
                    // cause the same tool to be executed multiple times, producing duplicate
                    // tool_use IDs in the messages array and a 400 error from the API.
                    // Once corrupted, every retry accumulates more duplicates.
                    if (handledToolUseIds.has(toolUseID)) {
                        (0, debug_js_1.logForDebugging)("handleOrphanedPermissionResponse: skipping duplicate orphaned permission for toolUseID=".concat(toolUseID, " (already handled)"));
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, sessionStorage_js_1.findUnresolvedToolUse)(toolUseID)];
                case 1:
                    assistantMessage = _d.sent();
                    if (!assistantMessage) {
                        (0, debug_js_1.logForDebugging)("handleOrphanedPermissionResponse: no unresolved tool_use found for toolUseID=".concat(toolUseID, " (already resolved in transcript)"));
                        return [2 /*return*/, false];
                    }
                    handledToolUseIds.add(toolUseID);
                    (0, debug_js_1.logForDebugging)("handleOrphanedPermissionResponse: enqueuing orphaned permission for toolUseID=".concat(toolUseID, " messageID=").concat(assistantMessage.message.id));
                    (0, messageQueueManager_js_1.enqueue)({
                        mode: 'orphaned-permission',
                        value: [],
                        orphanedPermission: {
                            permissionResult: permissionResult,
                            assistantMessage: assistantMessage,
                        },
                    });
                    onEnqueued === null || onEnqueued === void 0 ? void 0 : onEnqueued();
                    return [2 /*return*/, true];
                case 2: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Converts a process transport config to a scoped config.
 * The types are structurally compatible, so we just add the scope.
 */
function toScopedConfig(config) {
    // McpServerConfigForProcessTransport is a subset of McpServerConfig
    // (it excludes IDE-specific types like sse-ide and ws-ide)
    // Adding scope makes it a valid ScopedMcpServerConfig
    return __assign(__assign({}, config), { scope: 'dynamic' });
}
/**
 * Handles mcp_set_servers requests by processing both SDK and process-based servers.
 * SDK servers run in the SDK process; process-based servers are spawned by the CLI.
 *
 * Applies enterprise allowedMcpServers/deniedMcpServers policy — same filter as
 * --mcp-config (see filterMcpServersByPolicy call in main.tsx). Without this,
 * SDK V2 Query.setMcpServers() was a second policy bypass vector. Blocked servers
 * are reported in response.errors so the SDK consumer knows why they weren't added.
 */
function handleMcpSetServers(servers, sdkState, dynamicState, setAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, allowedServers, blocked, policyErrors, _i, blocked_1, name_3, sdkServers, processServers, _b, _c, _d, name_4, config, currentSdkNames, newSdkNames, sdkAdded, sdkRemoved, newSdkConfigs, newSdkClients, newSdkTools, _loop_5, _e, currentSdkNames_1, name_5, _f, _g, _h, name_6, config, pendingClient, processResult;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _a = (0, config_js_1.filterMcpServersByPolicy)(servers), allowedServers = _a.allowed, blocked = _a.blocked;
                    policyErrors = {};
                    for (_i = 0, blocked_1 = blocked; _i < blocked_1.length; _i++) {
                        name_3 = blocked_1[_i];
                        policyErrors[name_3] =
                            'Blocked by enterprise policy (allowedMcpServers/deniedMcpServers)';
                    }
                    sdkServers = {};
                    processServers = {};
                    for (_b = 0, _c = Object.entries(allowedServers); _b < _c.length; _b++) {
                        _d = _c[_b], name_4 = _d[0], config = _d[1];
                        if (config.type === 'sdk') {
                            sdkServers[name_4] = config;
                        }
                        else {
                            processServers[name_4] = config;
                        }
                    }
                    currentSdkNames = new Set(Object.keys(sdkState.configs));
                    newSdkNames = new Set(Object.keys(sdkServers));
                    sdkAdded = [];
                    sdkRemoved = [];
                    newSdkConfigs = __assign({}, sdkState.configs);
                    newSdkClients = __spreadArray([], sdkState.clients, true);
                    newSdkTools = __spreadArray([], sdkState.tools, true);
                    _loop_5 = function (name_5) {
                        var client, prefix_5;
                        return __generator(this, function (_k) {
                            switch (_k.label) {
                                case 0:
                                    if (!!newSdkNames.has(name_5)) return [3 /*break*/, 3];
                                    client = newSdkClients.find(function (c) { return c.name === name_5; });
                                    if (!(client && client.type === 'connected')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, client.cleanup()];
                                case 1:
                                    _k.sent();
                                    _k.label = 2;
                                case 2:
                                    newSdkClients = newSdkClients.filter(function (c) { return c.name !== name_5; });
                                    prefix_5 = "mcp__".concat(name_5, "__");
                                    newSdkTools = newSdkTools.filter(function (t) { return !t.name.startsWith(prefix_5); });
                                    delete newSdkConfigs[name_5];
                                    sdkRemoved.push(name_5);
                                    _k.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    _e = 0, currentSdkNames_1 = currentSdkNames;
                    _j.label = 1;
                case 1:
                    if (!(_e < currentSdkNames_1.length)) return [3 /*break*/, 4];
                    name_5 = currentSdkNames_1[_e];
                    return [5 /*yield**/, _loop_5(name_5)];
                case 2:
                    _j.sent();
                    _j.label = 3;
                case 3:
                    _e++;
                    return [3 /*break*/, 1];
                case 4:
                    // Add new SDK servers as pending - they'll be upgraded to connected
                    // when updateSdkMcp() runs on the next query
                    for (_f = 0, _g = Object.entries(sdkServers); _f < _g.length; _f++) {
                        _h = _g[_f], name_6 = _h[0], config = _h[1];
                        if (!currentSdkNames.has(name_6)) {
                            newSdkConfigs[name_6] = config;
                            pendingClient = {
                                type: 'pending',
                                name: name_6,
                                config: __assign(__assign({}, config), { scope: 'dynamic' }),
                            };
                            newSdkClients = __spreadArray(__spreadArray([], newSdkClients, true), [pendingClient], false);
                            sdkAdded.push(name_6);
                        }
                    }
                    return [4 /*yield*/, reconcileMcpServers(processServers, dynamicState, setAppState)];
                case 5:
                    processResult = _j.sent();
                    return [2 /*return*/, {
                            response: {
                                added: __spreadArray(__spreadArray([], sdkAdded, true), processResult.response.added, true),
                                removed: __spreadArray(__spreadArray([], sdkRemoved, true), processResult.response.removed, true),
                                errors: __assign(__assign({}, policyErrors), processResult.response.errors),
                            },
                            newSdkState: {
                                configs: newSdkConfigs,
                                clients: newSdkClients,
                                tools: newSdkTools,
                            },
                            newDynamicState: processResult.newState,
                            sdkServersChanged: sdkAdded.length > 0 || sdkRemoved.length > 0,
                        }];
            }
        });
    });
}
/**
 * Reconciles the current set of dynamic MCP servers with a new desired state.
 * Handles additions, removals, and config changes.
 */
function reconcileMcpServers(desiredConfigs, currentState, setAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var currentNames, desiredNames, toRemove, toAdd, toCheck, toReplace, removed, added, errors, newClients, newTools, _loop_6, _i, _a, name_7, _b, _c, name_8, config, scopedConfig, client, serverTools, e_6, err, newConfigs, _d, desiredNames_1, name_9, config, newState;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    currentNames = new Set(Object.keys(currentState.configs));
                    desiredNames = new Set(Object.keys(desiredConfigs));
                    toRemove = __spreadArray([], currentNames, true).filter(function (n) { return !desiredNames.has(n); });
                    toAdd = __spreadArray([], desiredNames, true).filter(function (n) { return !currentNames.has(n); });
                    toCheck = __spreadArray([], currentNames, true).filter(function (n) { return desiredNames.has(n); });
                    toReplace = toCheck.filter(function (name) {
                        var currentConfig = currentState.configs[name];
                        var desiredConfigRaw = desiredConfigs[name];
                        if (!currentConfig || !desiredConfigRaw)
                            return true;
                        var desiredConfig = toScopedConfig(desiredConfigRaw);
                        return !(0, client_js_1.areMcpConfigsEqual)(currentConfig, desiredConfig);
                    });
                    removed = [];
                    added = [];
                    errors = {};
                    newClients = __spreadArray([], currentState.clients, true);
                    newTools = __spreadArray([], currentState.tools, true);
                    _loop_6 = function (name_7) {
                        var client, config, e_7, prefix;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    client = newClients.find(function (c) { return c.name === name_7; });
                                    config = currentState.configs[name_7];
                                    if (!(client && config)) return [3 /*break*/, 6];
                                    if (!(client.type === 'connected')) return [3 /*break*/, 4];
                                    _f.label = 1;
                                case 1:
                                    _f.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, client.cleanup()];
                                case 2:
                                    _f.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_7 = _f.sent();
                                    (0, log_js_1.logError)(e_7);
                                    return [3 /*break*/, 4];
                                case 4: 
                                // Clear the memoization cache
                                return [4 /*yield*/, (0, client_js_1.clearServerCache)(name_7, config)];
                                case 5:
                                    // Clear the memoization cache
                                    _f.sent();
                                    _f.label = 6;
                                case 6:
                                    prefix = "mcp__".concat(name_7, "__");
                                    newTools = newTools.filter(function (t) { return !t.name.startsWith(prefix); });
                                    // Remove from clients list
                                    newClients = newClients.filter(function (c) { return c.name !== name_7; });
                                    // Track removal (only for actually removed, not replaced)
                                    if (toRemove.includes(name_7)) {
                                        removed.push(name_7);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = __spreadArray(__spreadArray([], toRemove, true), toReplace, true);
                    _e.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    name_7 = _a[_i];
                    return [5 /*yield**/, _loop_6(name_7)];
                case 2:
                    _e.sent();
                    _e.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    _b = 0, _c = __spreadArray(__spreadArray([], toAdd, true), toReplace, true);
                    _e.label = 5;
                case 5:
                    if (!(_b < _c.length)) return [3 /*break*/, 13];
                    name_8 = _c[_b];
                    config = desiredConfigs[name_8];
                    if (!config)
                        return [3 /*break*/, 12];
                    scopedConfig = toScopedConfig(config);
                    // SDK servers are managed by the SDK process, not the CLI.
                    // Just track them without trying to connect.
                    if (config.type === 'sdk') {
                        added.push(name_8);
                        return [3 /*break*/, 12];
                    }
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 11, , 12]);
                    return [4 /*yield*/, (0, client_js_1.connectToServer)(name_8, scopedConfig)];
                case 7:
                    client = _e.sent();
                    newClients.push(client);
                    if (!(client.type === 'connected')) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, client_js_1.fetchToolsForClient)(client)];
                case 8:
                    serverTools = _e.sent();
                    newTools.push.apply(newTools, serverTools);
                    return [3 /*break*/, 10];
                case 9:
                    if (client.type === 'failed') {
                        errors[name_8] = client.error || 'Connection failed';
                    }
                    _e.label = 10;
                case 10:
                    added.push(name_8);
                    return [3 /*break*/, 12];
                case 11:
                    e_6 = _e.sent();
                    err = (0, errors_js_1.toError)(e_6);
                    errors[name_8] = err.message;
                    (0, log_js_1.logError)(err);
                    return [3 /*break*/, 12];
                case 12:
                    _b++;
                    return [3 /*break*/, 5];
                case 13:
                    newConfigs = {};
                    for (_d = 0, desiredNames_1 = desiredNames; _d < desiredNames_1.length; _d++) {
                        name_9 = desiredNames_1[_d];
                        config = desiredConfigs[name_9];
                        if (config) {
                            newConfigs[name_9] = toScopedConfig(config);
                        }
                    }
                    newState = {
                        clients: newClients,
                        tools: newTools,
                        configs: newConfigs,
                    };
                    // Update AppState with the new tools
                    setAppState(function (prev) {
                        // Get all dynamic server names (current + new)
                        var allDynamicServerNames = new Set(__spreadArray(__spreadArray([], Object.keys(currentState.configs), true), Object.keys(newConfigs), true));
                        // Remove old dynamic tools
                        var nonDynamicTools = prev.mcp.tools.filter(function (t) {
                            for (var _i = 0, allDynamicServerNames_1 = allDynamicServerNames; _i < allDynamicServerNames_1.length; _i++) {
                                var serverName = allDynamicServerNames_1[_i];
                                if (t.name.startsWith("mcp__".concat(serverName, "__"))) {
                                    return false;
                                }
                            }
                            return true;
                        });
                        // Remove old dynamic clients
                        var nonDynamicClients = prev.mcp.clients.filter(function (c) {
                            return !allDynamicServerNames.has(c.name);
                        });
                        return __assign(__assign({}, prev), { mcp: __assign(__assign({}, prev.mcp), { tools: __spreadArray(__spreadArray([], nonDynamicTools, true), newTools, true), clients: __spreadArray(__spreadArray([], nonDynamicClients, true), newClients, true) }) });
                    });
                    return [2 /*return*/, {
                            response: { added: added, removed: removed, errors: errors },
                            newState: newState,
                        }];
            }
        });
    });
}
