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
exports.SUPPORTED_SETTINGS = void 0;
exports.isSupported = isSupported;
exports.getConfig = getConfig;
exports.getAllKeys = getAllKeys;
exports.getOptionsForSetting = getOptionsForSetting;
exports.getPath = getPath;
var bun_bundle_1 = require("bun:bundle");
var config_js_1 = require("../../utils/config.js");
var configConstants_js_1 = require("../../utils/configConstants.js");
var modelOptions_js_1 = require("../../utils/model/modelOptions.js");
var validateModel_js_1 = require("../../utils/model/validateModel.js");
var theme_js_1 = require("../../utils/theme.js");
exports.SUPPORTED_SETTINGS = __assign(__assign(__assign(__assign({ theme: {
        source: 'global',
        type: 'string',
        description: 'Color theme for the UI',
        options: (0, bun_bundle_1.feature)('AUTO_THEME') ? theme_js_1.THEME_SETTINGS : theme_js_1.THEME_NAMES,
    }, editorMode: {
        source: 'global',
        type: 'string',
        description: 'Key binding mode',
        options: configConstants_js_1.EDITOR_MODES,
    }, verbose: {
        source: 'global',
        type: 'boolean',
        description: 'Show detailed debug output',
        appStateKey: 'verbose',
    }, preferredNotifChannel: {
        source: 'global',
        type: 'string',
        description: 'Preferred notification channel',
        options: configConstants_js_1.NOTIFICATION_CHANNELS,
    }, autoCompactEnabled: {
        source: 'global',
        type: 'boolean',
        description: 'Auto-compact when context is full',
    }, autoMemoryEnabled: {
        source: 'settings',
        type: 'boolean',
        description: 'Enable auto-memory',
    }, autoDreamEnabled: {
        source: 'settings',
        type: 'boolean',
        description: 'Enable background memory consolidation',
    }, fileCheckpointingEnabled: {
        source: 'global',
        type: 'boolean',
        description: 'Enable file checkpointing for code rewind',
    }, showTurnDuration: {
        source: 'global',
        type: 'boolean',
        description: 'Show turn duration message after responses (e.g., "Cooked for 1m 6s")',
    }, terminalProgressBarEnabled: {
        source: 'global',
        type: 'boolean',
        description: 'Show OSC 9;4 progress indicator in supported terminals',
    }, todoFeatureEnabled: {
        source: 'global',
        type: 'boolean',
        description: 'Enable todo/task tracking',
    }, model: {
        source: 'settings',
        type: 'string',
        description: 'Override the default model',
        appStateKey: 'mainLoopModel',
        getOptions: function () {
            try {
                return (0, modelOptions_js_1.getModelOptions)()
                    .filter(function (o) { return o.value !== null; })
                    .map(function (o) { return o.value; });
            }
            catch (_a) {
                return ['sonnet', 'opus', 'haiku'];
            }
        },
        validateOnWrite: function (v) { return (0, validateModel_js_1.validateModel)(String(v)); },
        formatOnRead: function (v) { return (v === null ? 'default' : v); },
    }, alwaysThinkingEnabled: {
        source: 'settings',
        type: 'boolean',
        description: 'Enable extended thinking (false to disable)',
        appStateKey: 'thinkingEnabled',
    }, 'permissions.defaultMode': {
        source: 'settings',
        type: 'string',
        description: 'Default permission mode for tool usage',
        options: (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
            ? ['default', 'plan', 'acceptEdits', 'dontAsk', 'auto']
            : ['default', 'plan', 'acceptEdits', 'dontAsk'],
    }, language: {
        source: 'settings',
        type: 'string',
        description: 'Preferred language for Claude responses and voice dictation (e.g., "japanese", "spanish")',
    }, teammateMode: {
        source: 'global',
        type: 'string',
        description: 'How to spawn teammates: "tmux" for traditional tmux, "in-process" for same process, "auto" to choose automatically',
        options: configConstants_js_1.TEAMMATE_MODES,
    } }, (process.env.USER_TYPE === 'ant'
    ? {
        classifierPermissionsEnabled: {
            source: 'settings',
            type: 'boolean',
            description: 'Enable AI-based classification for Bash(prompt:...) permission rules',
        },
    }
    : {})), ((0, bun_bundle_1.feature)('VOICE_MODE')
    ? {
        voiceEnabled: {
            source: 'settings',
            type: 'boolean',
            description: 'Enable voice dictation (hold-to-talk)',
        },
    }
    : {})), ((0, bun_bundle_1.feature)('BRIDGE_MODE')
    ? {
        remoteControlAtStartup: {
            source: 'global',
            type: 'boolean',
            description: 'Enable Remote Control for all sessions (true | false | default)',
            formatOnRead: function () { return (0, config_js_1.getRemoteControlAtStartup)(); },
        },
    }
    : {})), ((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_PUSH_NOTIFICATION')
    ? {
        taskCompleteNotifEnabled: {
            source: 'global',
            type: 'boolean',
            description: 'Push to your mobile device when idle after Claude finishes (requires Remote Control)',
        },
        inputNeededNotifEnabled: {
            source: 'global',
            type: 'boolean',
            description: 'Push to your mobile device when a permission prompt or question is waiting (requires Remote Control)',
        },
        agentPushNotifEnabled: {
            source: 'global',
            type: 'boolean',
            description: 'Allow Claude to push to your mobile device when it deems it appropriate (requires Remote Control)',
        },
    }
    : {}));
function isSupported(key) {
    return key in exports.SUPPORTED_SETTINGS;
}
function getConfig(key) {
    return exports.SUPPORTED_SETTINGS[key];
}
function getAllKeys() {
    return Object.keys(exports.SUPPORTED_SETTINGS);
}
function getOptionsForSetting(key) {
    var config = exports.SUPPORTED_SETTINGS[key];
    if (!config)
        return undefined;
    if (config.options)
        return __spreadArray([], config.options, true);
    if (config.getOptions)
        return config.getOptions();
    return undefined;
}
function getPath(key) {
    var _a;
    var config = exports.SUPPORTED_SETTINGS[key];
    return (_a = config === null || config === void 0 ? void 0 : config.path) !== null && _a !== void 0 ? _a : key.split('.');
}
