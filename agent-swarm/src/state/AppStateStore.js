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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDLE_SPECULATION_STATE = void 0;
exports.getDefaultAppState = getDefaultAppState;
var promptSuggestion_js_1 = require("../services/PromptSuggestion/promptSuggestion.js");
var Tool_js_1 = require("../Tool.js");
var commitAttribution_js_1 = require("../utils/commitAttribution.js");
var settings_js_1 = require("../utils/settings/settings.js");
var thinking_js_1 = require("../utils/thinking.js");
exports.IDLE_SPECULATION_STATE = { status: 'idle' };
function getDefaultAppState() {
    // Determine initial permission mode for teammates spawned with plan_mode_required
    // Use lazy require to avoid circular dependency with teammate.ts
    /* eslint-disable @typescript-eslint/no-require-imports */
    var teammateUtils = require('../utils/teammate.js');
    /* eslint-enable @typescript-eslint/no-require-imports */
    var initialMode = teammateUtils.isTeammate() && teammateUtils.isPlanModeRequired()
        ? 'plan'
        : 'default';
    return {
        settings: (0, settings_js_1.getInitialSettings)(),
        tasks: {},
        agentNameRegistry: new Map(),
        verbose: false,
        mainLoopModel: null, // alias, full name (as with --model or env var), or null (default)
        mainLoopModelForSession: null,
        statusLineText: undefined,
        expandedView: 'none',
        isBriefOnly: false,
        showTeammateMessagePreview: false,
        selectedIPAgentIndex: -1,
        coordinatorTaskIndex: -1,
        viewSelectionMode: 'none',
        footerSelection: null,
        kairosEnabled: false,
        remoteSessionUrl: undefined,
        remoteConnectionStatus: 'connecting',
        remoteBackgroundTaskCount: 0,
        replBridgeEnabled: false,
        replBridgeExplicit: false,
        replBridgeOutboundOnly: false,
        replBridgeConnected: false,
        replBridgeSessionActive: false,
        replBridgeReconnecting: false,
        replBridgeConnectUrl: undefined,
        replBridgeSessionUrl: undefined,
        replBridgeEnvironmentId: undefined,
        replBridgeSessionId: undefined,
        replBridgeError: undefined,
        replBridgeInitialName: undefined,
        showRemoteCallout: false,
        toolPermissionContext: __assign(__assign({}, (0, Tool_js_1.getEmptyToolPermissionContext)()), { mode: initialMode }),
        agent: undefined,
        agentDefinitions: { activeAgents: [], allAgents: [] },
        fileHistory: {
            snapshots: [],
            trackedFiles: new Set(),
            snapshotSequence: 0,
        },
        attribution: (0, commitAttribution_js_1.createEmptyAttributionState)(),
        mcp: {
            clients: [],
            tools: [],
            commands: [],
            resources: {},
            pluginReconnectKey: 0,
        },
        plugins: {
            enabled: [],
            disabled: [],
            commands: [],
            errors: [],
            installationStatus: {
                marketplaces: [],
                plugins: [],
            },
            needsRefresh: false,
        },
        todos: {},
        remoteAgentTaskSuggestions: [],
        notifications: {
            current: null,
            queue: [],
        },
        elicitation: {
            queue: [],
        },
        thinkingEnabled: (0, thinking_js_1.shouldEnableThinkingByDefault)(),
        promptSuggestionEnabled: (0, promptSuggestion_js_1.shouldEnablePromptSuggestion)(),
        sessionHooks: new Map(),
        inbox: {
            messages: [],
        },
        workerSandboxPermissions: {
            queue: [],
            selectedIndex: 0,
        },
        pendingWorkerRequest: null,
        pendingSandboxRequest: null,
        promptSuggestion: {
            text: null,
            promptId: null,
            shownAt: 0,
            acceptedAt: 0,
            generationRequestId: null,
        },
        speculation: exports.IDLE_SPECULATION_STATE,
        speculationSessionTimeSavedMs: 0,
        skillImprovement: {
            suggestion: null,
        },
        authVersion: 0,
        initialMessage: null,
        effortValue: undefined,
        activeOverlays: new Set(),
        fastMode: false,
    };
}
