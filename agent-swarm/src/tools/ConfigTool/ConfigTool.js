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
exports.ConfigTool = void 0;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var config_js_1 = require("../../utils/config.js");
var errors_js_1 = require("../../utils/errors.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var supportedSettings_js_1 = require("./supportedSettings.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        setting: v4_1.z
            .string()
            .describe('The setting key (e.g., "theme", "model", "permissions.defaultMode")'),
        value: v4_1.z
            .union([v4_1.z.string(), v4_1.z.boolean(), v4_1.z.number()])
            .optional()
            .describe('The new value. Omit to get current value.'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        success: v4_1.z.boolean(),
        operation: v4_1.z.enum(['get', 'set']).optional(),
        setting: v4_1.z.string().optional(),
        value: v4_1.z.unknown().optional(),
        previousValue: v4_1.z.unknown().optional(),
        newValue: v4_1.z.unknown().optional(),
        error: v4_1.z.string().optional(),
    });
});
exports.ConfigTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.CONFIG_TOOL_NAME,
    searchHint: 'get or set Claude Code settings (theme, model)',
    maxResultSizeChars: 100000,
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
                return [2 /*return*/, (0, prompt_js_1.generatePrompt)()];
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
        return 'Config';
    },
    shouldDefer: true,
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function (input) {
        return input.value === undefined;
    },
    toAutoClassifierInput: function (input) {
        return input.value === undefined
            ? input.setting
            : "".concat(input.setting, " = ").concat(input.value);
    },
    checkPermissions: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Auto-allow reading configs
                if (input.value === undefined) {
                    return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
                }
                return [2 /*return*/, {
                        behavior: 'ask',
                        message: "Set ".concat(input.setting, " to ").concat((0, slowOperations_js_1.jsonStringify)(input.value)),
                    }];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    renderToolUseRejectedMessage: UI_js_1.renderToolUseRejectedMessage,
    call: function (_a, context_1) {
        return __awaiter(this, arguments, void 0, function (_b, context) {
            var isVoiceGrowthBookEnabled, config, path, currentValue, displayValue, resolved_1, finalValue, lower, options, result, isVoiceModeEnabled, isAnthropicAuthEnabled, isVoiceStreamAvailable, _c, checkRecordingAvailability, checkVoiceDependencies, requestMicrophonePermission, recording, deps, guidance, previousValue, key_1, update, result, settingsChangeDetector, appKey_1, resolved_2, error_1;
            var _d;
            var setting = _b.setting, value = _b.value;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!((0, bun_bundle_1.feature)('VOICE_MODE') && setting === 'voiceEnabled')) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../voice/voiceModeEnabled.js'); })];
                    case 1:
                        isVoiceGrowthBookEnabled = (_e.sent()).isVoiceGrowthBookEnabled;
                        if (!isVoiceGrowthBookEnabled()) {
                            return [2 /*return*/, {
                                    data: { success: false, error: "Unknown setting: \"".concat(setting, "\"") },
                                }];
                        }
                        _e.label = 2;
                    case 2:
                        if (!(0, supportedSettings_js_1.isSupported)(setting)) {
                            return [2 /*return*/, {
                                    data: { success: false, error: "Unknown setting: \"".concat(setting, "\"") },
                                }];
                        }
                        config = (0, supportedSettings_js_1.getConfig)(setting);
                        path = (0, supportedSettings_js_1.getPath)(setting);
                        // 2. GET operation
                        if (value === undefined) {
                            currentValue = getValue(config.source, path);
                            displayValue = config.formatOnRead
                                ? config.formatOnRead(currentValue)
                                : currentValue;
                            return [2 /*return*/, {
                                    data: { success: true, operation: 'get', setting: setting, value: displayValue },
                                }];
                        }
                        // 3. SET operation
                        // Handle "default" — unset the config key so it falls back to the
                        // platform-aware default (determined by the bridge feature gate).
                        if (setting === 'remoteControlAtStartup' &&
                            typeof value === 'string' &&
                            value.toLowerCase().trim() === 'default') {
                            (0, config_js_1.saveGlobalConfig)(function (prev) {
                                if (prev.remoteControlAtStartup === undefined)
                                    return prev;
                                var next = __assign({}, prev);
                                delete next.remoteControlAtStartup;
                                return next;
                            });
                            resolved_1 = (0, config_js_1.getRemoteControlAtStartup)();
                            // Sync to AppState so useReplBridge reacts immediately
                            context.setAppState(function (prev) {
                                if (prev.replBridgeEnabled === resolved_1 && !prev.replBridgeOutboundOnly)
                                    return prev;
                                return __assign(__assign({}, prev), { replBridgeEnabled: resolved_1, replBridgeOutboundOnly: false });
                            });
                            return [2 /*return*/, {
                                    data: {
                                        success: true,
                                        operation: 'set',
                                        setting: setting,
                                        value: resolved_1,
                                    },
                                }];
                        }
                        finalValue = value;
                        // Coerce and validate boolean values
                        if (config.type === 'boolean') {
                            if (typeof value === 'string') {
                                lower = value.toLowerCase().trim();
                                if (lower === 'true')
                                    finalValue = true;
                                else if (lower === 'false')
                                    finalValue = false;
                            }
                            if (typeof finalValue !== 'boolean') {
                                return [2 /*return*/, {
                                        data: {
                                            success: false,
                                            operation: 'set',
                                            setting: setting,
                                            error: "".concat(setting, " requires true or false."),
                                        },
                                    }];
                            }
                        }
                        options = (0, supportedSettings_js_1.getOptionsForSetting)(setting);
                        if (options && !options.includes(String(finalValue))) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        operation: 'set',
                                        setting: setting,
                                        error: "Invalid value \"".concat(value, "\". Options: ").concat(options.join(', ')),
                                    },
                                }];
                        }
                        if (!config.validateOnWrite) return [3 /*break*/, 4];
                        return [4 /*yield*/, config.validateOnWrite(finalValue)];
                    case 3:
                        result = _e.sent();
                        if (!result.valid) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        operation: 'set',
                                        setting: setting,
                                        error: result.error,
                                    },
                                }];
                        }
                        _e.label = 4;
                    case 4:
                        if (!((0, bun_bundle_1.feature)('VOICE_MODE') &&
                            setting === 'voiceEnabled' &&
                            finalValue === true)) return [3 /*break*/, 13];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../voice/voiceModeEnabled.js'); })];
                    case 5:
                        isVoiceModeEnabled = (_e.sent()).isVoiceModeEnabled;
                        if (!!isVoiceModeEnabled()) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/auth.js'); })];
                    case 6:
                        isAnthropicAuthEnabled = (_e.sent()).isAnthropicAuthEnabled;
                        return [2 /*return*/, {
                                data: {
                                    success: false,
                                    error: !isAnthropicAuthEnabled()
                                        ? 'Voice mode requires a Claude.ai account. Please run /login to sign in.'
                                        : 'Voice mode is not available.',
                                },
                            }];
                    case 7: return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/voiceStreamSTT.js'); })];
                    case 8:
                        isVoiceStreamAvailable = (_e.sent()).isVoiceStreamAvailable;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/voice.js'); })];
                    case 9:
                        _c = _e.sent(), checkRecordingAvailability = _c.checkRecordingAvailability, checkVoiceDependencies = _c.checkVoiceDependencies, requestMicrophonePermission = _c.requestMicrophonePermission;
                        return [4 /*yield*/, checkRecordingAvailability()];
                    case 10:
                        recording = _e.sent();
                        if (!recording.available) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        error: (_d = recording.reason) !== null && _d !== void 0 ? _d : 'Voice mode is not available in this environment.',
                                    },
                                }];
                        }
                        if (!isVoiceStreamAvailable()) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        error: 'Voice mode requires a Claude.ai account. Please run /login to sign in.',
                                    },
                                }];
                        }
                        return [4 /*yield*/, checkVoiceDependencies()];
                    case 11:
                        deps = _e.sent();
                        if (!deps.available) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        error: 'No audio recording tool found.' +
                                            (deps.installCommand ? " Run: ".concat(deps.installCommand) : ''),
                                    },
                                }];
                        }
                        return [4 /*yield*/, requestMicrophonePermission()];
                    case 12:
                        if (!(_e.sent())) {
                            guidance = void 0;
                            if (process.platform === 'win32') {
                                guidance = 'Settings \u2192 Privacy \u2192 Microphone';
                            }
                            else if (process.platform === 'linux') {
                                guidance = "your system's audio settings";
                            }
                            else {
                                guidance =
                                    'System Settings \u2192 Privacy & Security \u2192 Microphone';
                            }
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        error: "Microphone access is denied. To enable it, go to ".concat(guidance, ", then try again."),
                                    },
                                }];
                        }
                        _e.label = 13;
                    case 13:
                        previousValue = getValue(config.source, path);
                        _e.label = 14;
                    case 14:
                        _e.trys.push([14, 17, , 18]);
                        if (config.source === 'global') {
                            key_1 = path[0];
                            if (!key_1) {
                                return [2 /*return*/, {
                                        data: {
                                            success: false,
                                            operation: 'set',
                                            setting: setting,
                                            error: 'Invalid setting path',
                                        },
                                    }];
                            }
                            (0, config_js_1.saveGlobalConfig)(function (prev) {
                                var _a;
                                if (prev[key_1] === finalValue)
                                    return prev;
                                return __assign(__assign({}, prev), (_a = {}, _a[key_1] = finalValue, _a));
                            });
                        }
                        else {
                            update = buildNestedObject(path, finalValue);
                            result = (0, settings_js_1.updateSettingsForSource)('userSettings', update);
                            if (result.error) {
                                return [2 /*return*/, {
                                        data: {
                                            success: false,
                                            operation: 'set',
                                            setting: setting,
                                            error: result.error.message,
                                        },
                                    }];
                            }
                        }
                        if (!((0, bun_bundle_1.feature)('VOICE_MODE') && setting === 'voiceEnabled')) return [3 /*break*/, 16];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/settings/changeDetector.js'); })];
                    case 15:
                        settingsChangeDetector = (_e.sent()).settingsChangeDetector;
                        settingsChangeDetector.notifyChange('userSettings');
                        _e.label = 16;
                    case 16:
                        // 5b. Sync to AppState if needed for immediate UI effect
                        if (config.appStateKey) {
                            appKey_1 = config.appStateKey;
                            context.setAppState(function (prev) {
                                var _a;
                                if (prev[appKey_1] === finalValue)
                                    return prev;
                                return __assign(__assign({}, prev), (_a = {}, _a[appKey_1] = finalValue, _a));
                            });
                        }
                        // Sync remoteControlAtStartup to AppState so the bridge reacts
                        // immediately (the config key differs from the AppState field name,
                        // so the generic appStateKey mechanism can't handle this).
                        if (setting === 'remoteControlAtStartup') {
                            resolved_2 = (0, config_js_1.getRemoteControlAtStartup)();
                            context.setAppState(function (prev) {
                                if (prev.replBridgeEnabled === resolved_2 &&
                                    !prev.replBridgeOutboundOnly)
                                    return prev;
                                return __assign(__assign({}, prev), { replBridgeEnabled: resolved_2, replBridgeOutboundOnly: false });
                            });
                        }
                        (0, index_js_1.logEvent)('tengu_config_tool_changed', {
                            setting: setting,
                            value: String(finalValue),
                        });
                        return [2 /*return*/, {
                                data: {
                                    success: true,
                                    operation: 'set',
                                    setting: setting,
                                    previousValue: previousValue,
                                    newValue: finalValue,
                                },
                            }];
                    case 17:
                        error_1 = _e.sent();
                        (0, log_js_1.logError)(error_1);
                        return [2 /*return*/, {
                                data: {
                                    success: false,
                                    operation: 'set',
                                    setting: setting,
                                    error: (0, errors_js_1.errorMessage)(error_1),
                                },
                            }];
                    case 18: return [2 /*return*/];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        if (content.success) {
            if (content.operation === 'get') {
                return {
                    tool_use_id: toolUseID,
                    type: 'tool_result',
                    content: "".concat(content.setting, " = ").concat((0, slowOperations_js_1.jsonStringify)(content.value)),
                };
            }
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: "Set ".concat(content.setting, " to ").concat((0, slowOperations_js_1.jsonStringify)(content.newValue)),
            };
        }
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: "Error: ".concat(content.error),
            is_error: true,
        };
    },
});
function getValue(source, path) {
    if (source === 'global') {
        var config = (0, config_js_1.getGlobalConfig)();
        var key = path[0];
        if (!key)
            return undefined;
        return config[key];
    }
    var settings = (0, settings_js_1.getInitialSettings)();
    var current = settings;
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var key = path_1[_i];
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        }
        else {
            return undefined;
        }
    }
    return current;
}
function buildNestedObject(path, value) {
    var _a, _b;
    if (path.length === 0) {
        return {};
    }
    var key = path[0];
    if (path.length === 1) {
        return _a = {}, _a[key] = value, _a;
    }
    return _b = {}, _b[key] = buildNestedObject(path.slice(1), value), _b;
}
