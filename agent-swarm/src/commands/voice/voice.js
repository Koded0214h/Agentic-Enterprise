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
exports.call = void 0;
var useVoice_js_1 = require("../../hooks/useVoice.js");
var shortcutFormat_js_1 = require("../../keybindings/shortcutFormat.js");
var index_js_1 = require("../../services/analytics/index.js");
var auth_js_1 = require("../../utils/auth.js");
var config_js_1 = require("../../utils/config.js");
var changeDetector_js_1 = require("../../utils/settings/changeDetector.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var voiceModeEnabled_js_1 = require("../../voice/voiceModeEnabled.js");
var LANG_HINT_MAX_SHOWS = 2;
var call = function () { return __awaiter(void 0, void 0, void 0, function () {
    var currentSettings, isCurrentlyEnabled, result_1, isVoiceStreamAvailable, checkRecordingAvailability, recording, _a, checkVoiceDependencies, requestMicrophonePermission, deps, hint, guidance, result, key, stt, cfg, langChanged, priorCount, showHint, langNote;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // Check auth and kill-switch before allowing voice mode
                if (!(0, voiceModeEnabled_js_1.isVoiceModeEnabled)()) {
                    // Differentiate: OAuth-less users get an auth hint, everyone else
                    // gets nothing (command shouldn't be reachable when the kill-switch is on).
                    if (!(0, auth_js_1.isAnthropicAuthEnabled)()) {
                        return [2 /*return*/, {
                                type: 'text',
                                value: 'Voice mode requires a Claude.ai account. Please run /login to sign in.',
                            }];
                    }
                    return [2 /*return*/, {
                            type: 'text',
                            value: 'Voice mode is not available.',
                        }];
                }
                currentSettings = (0, settings_js_1.getInitialSettings)();
                isCurrentlyEnabled = currentSettings.voiceEnabled === true;
                // Toggle OFF — no checks needed
                if (isCurrentlyEnabled) {
                    result_1 = (0, settings_js_1.updateSettingsForSource)('userSettings', {
                        voiceEnabled: false,
                    });
                    if (result_1.error) {
                        return [2 /*return*/, {
                                type: 'text',
                                value: 'Failed to update settings. Check your settings file for syntax errors.',
                            }];
                    }
                    changeDetector_js_1.settingsChangeDetector.notifyChange('userSettings');
                    (0, index_js_1.logEvent)('tengu_voice_toggled', { enabled: false });
                    return [2 /*return*/, {
                            type: 'text',
                            value: 'Voice mode disabled.',
                        }];
                }
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/voiceStreamSTT.js'); })];
            case 1:
                isVoiceStreamAvailable = (_d.sent()).isVoiceStreamAvailable;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/voice.js'); })];
            case 2:
                checkRecordingAvailability = (_d.sent()).checkRecordingAvailability;
                return [4 /*yield*/, checkRecordingAvailability()];
            case 3:
                recording = _d.sent();
                if (!recording.available) {
                    return [2 /*return*/, {
                            type: 'text',
                            value: (_b = recording.reason) !== null && _b !== void 0 ? _b : 'Voice mode is not available in this environment.',
                        }];
                }
                // Check for API key
                if (!isVoiceStreamAvailable()) {
                    return [2 /*return*/, {
                            type: 'text',
                            value: 'Voice mode requires a Claude.ai account. Please run /login to sign in.',
                        }];
                }
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/voice.js'); })];
            case 4:
                _a = _d.sent(), checkVoiceDependencies = _a.checkVoiceDependencies, requestMicrophonePermission = _a.requestMicrophonePermission;
                return [4 /*yield*/, checkVoiceDependencies()];
            case 5:
                deps = _d.sent();
                if (!deps.available) {
                    hint = deps.installCommand
                        ? "\nInstall audio recording tools? Run: ".concat(deps.installCommand)
                        : '\nInstall SoX manually for audio recording.';
                    return [2 /*return*/, {
                            type: 'text',
                            value: "No audio recording tool found.".concat(hint),
                        }];
                }
                return [4 /*yield*/, requestMicrophonePermission()];
            case 6:
                // Probe mic access so the OS permission dialog fires now rather than
                // on the user's first hold-to-talk activation.
                if (!(_d.sent())) {
                    guidance = void 0;
                    if (process.platform === 'win32') {
                        guidance = 'Settings \u2192 Privacy \u2192 Microphone';
                    }
                    else if (process.platform === 'linux') {
                        guidance = "your system's audio settings";
                    }
                    else {
                        guidance = 'System Settings \u2192 Privacy & Security \u2192 Microphone';
                    }
                    return [2 /*return*/, {
                            type: 'text',
                            value: "Microphone access is denied. To enable it, go to ".concat(guidance, ", then run /voice again."),
                        }];
                }
                result = (0, settings_js_1.updateSettingsForSource)('userSettings', { voiceEnabled: true });
                if (result.error) {
                    return [2 /*return*/, {
                            type: 'text',
                            value: 'Failed to update settings. Check your settings file for syntax errors.',
                        }];
                }
                changeDetector_js_1.settingsChangeDetector.notifyChange('userSettings');
                (0, index_js_1.logEvent)('tengu_voice_toggled', { enabled: true });
                key = (0, shortcutFormat_js_1.getShortcutDisplay)('voice:pushToTalk', 'Chat', 'Space');
                stt = (0, useVoice_js_1.normalizeLanguageForSTT)(currentSettings.language);
                cfg = (0, config_js_1.getGlobalConfig)();
                langChanged = cfg.voiceLangHintLastLanguage !== stt.code;
                priorCount = langChanged ? 0 : ((_c = cfg.voiceLangHintShownCount) !== null && _c !== void 0 ? _c : 0);
                showHint = !stt.fellBackFrom && priorCount < LANG_HINT_MAX_SHOWS;
                langNote = '';
                if (stt.fellBackFrom) {
                    langNote = " Note: \"".concat(stt.fellBackFrom, "\" is not a supported dictation language; using English. Change it via /config.");
                }
                else if (showHint) {
                    langNote = " Dictation language: ".concat(stt.code, " (/config to change).");
                }
                if (langChanged || showHint) {
                    (0, config_js_1.saveGlobalConfig)(function (prev) { return (__assign(__assign({}, prev), { voiceLangHintShownCount: priorCount + (showHint ? 1 : 0), voiceLangHintLastLanguage: stt.code })); });
                }
                return [2 /*return*/, {
                        type: 'text',
                        value: "Voice mode enabled. Hold ".concat(key, " to record.").concat(langNote),
                    }];
        }
    });
}); };
exports.call = call;
