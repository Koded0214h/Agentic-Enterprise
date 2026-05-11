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
exports.sendNotification = sendNotification;
var config_js_1 = require("../utils/config.js");
var env_js_1 = require("../utils/env.js");
var execFileNoThrow_js_1 = require("../utils/execFileNoThrow.js");
var hooks_js_1 = require("../utils/hooks.js");
var log_js_1 = require("../utils/log.js");
var index_js_1 = require("./analytics/index.js");
function sendNotification(notif, terminal) {
    return __awaiter(this, void 0, void 0, function () {
        var config, channel, methodUsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = (0, config_js_1.getGlobalConfig)();
                    channel = config.preferredNotifChannel;
                    return [4 /*yield*/, (0, hooks_js_1.executeNotificationHooks)(notif)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sendToChannel(channel, notif, terminal)];
                case 2:
                    methodUsed = _a.sent();
                    (0, index_js_1.logEvent)('tengu_notification_method_used', {
                        configured_channel: channel,
                        method_used: methodUsed,
                        term: env_js_1.env.terminal,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
var DEFAULT_TITLE = 'Claude Code';
function sendToChannel(channel, opts, terminal) {
    return __awaiter(this, void 0, void 0, function () {
        var title;
        return __generator(this, function (_a) {
            title = opts.title || DEFAULT_TITLE;
            try {
                switch (channel) {
                    case 'auto':
                        return [2 /*return*/, sendAuto(opts, terminal)];
                    case 'iterm2':
                        terminal.notifyITerm2(opts);
                        return [2 /*return*/, 'iterm2'];
                    case 'iterm2_with_bell':
                        terminal.notifyITerm2(opts);
                        terminal.notifyBell();
                        return [2 /*return*/, 'iterm2_with_bell'];
                    case 'kitty':
                        terminal.notifyKitty(__assign(__assign({}, opts), { title: title, id: generateKittyId() }));
                        return [2 /*return*/, 'kitty'];
                    case 'ghostty':
                        terminal.notifyGhostty(__assign(__assign({}, opts), { title: title }));
                        return [2 /*return*/, 'ghostty'];
                    case 'terminal_bell':
                        terminal.notifyBell();
                        return [2 /*return*/, 'terminal_bell'];
                    case 'notifications_disabled':
                        return [2 /*return*/, 'disabled'];
                    default:
                        return [2 /*return*/, 'none'];
                }
            }
            catch (_b) {
                return [2 /*return*/, 'error'];
            }
            return [2 /*return*/];
        });
    });
}
function sendAuto(opts, terminal) {
    return __awaiter(this, void 0, void 0, function () {
        var title, _a, bellDisabled;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    title = opts.title || DEFAULT_TITLE;
                    _a = env_js_1.env.terminal;
                    switch (_a) {
                        case 'Apple_Terminal': return [3 /*break*/, 1];
                        case 'iTerm.app': return [3 /*break*/, 3];
                        case 'kitty': return [3 /*break*/, 4];
                        case 'ghostty': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 6];
                case 1: return [4 /*yield*/, isAppleTerminalBellDisabled()];
                case 2:
                    bellDisabled = _b.sent();
                    if (bellDisabled) {
                        terminal.notifyBell();
                        return [2 /*return*/, 'terminal_bell'];
                    }
                    return [2 /*return*/, 'no_method_available'];
                case 3:
                    terminal.notifyITerm2(opts);
                    return [2 /*return*/, 'iterm2'];
                case 4:
                    terminal.notifyKitty(__assign(__assign({}, opts), { title: title, id: generateKittyId() }));
                    return [2 /*return*/, 'kitty'];
                case 5:
                    terminal.notifyGhostty(__assign(__assign({}, opts), { title: title }));
                    return [2 /*return*/, 'ghostty'];
                case 6: return [2 /*return*/, 'no_method_available'];
            }
        });
    });
}
function generateKittyId() {
    return Math.floor(Math.random() * 10000);
}
function isAppleTerminalBellDisabled() {
    return __awaiter(this, void 0, void 0, function () {
        var osascriptResult, currentProfile, defaultsOutput, plist, parsed, windowSettings, profileSettings, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (env_js_1.env.terminal !== 'Apple_Terminal') {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('osascript', [
                            '-e',
                            'tell application "Terminal" to name of current settings of front window',
                        ])];
                case 1:
                    osascriptResult = _a.sent();
                    currentProfile = osascriptResult.stdout.trim();
                    if (!currentProfile) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('defaults', [
                            'export',
                            'com.apple.Terminal',
                            '-',
                        ])];
                case 2:
                    defaultsOutput = _a.sent();
                    if (defaultsOutput.code !== 0) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('plist'); })];
                case 3:
                    plist = _a.sent();
                    parsed = plist.parse(defaultsOutput.stdout);
                    windowSettings = parsed === null || parsed === void 0 ? void 0 : parsed['Window Settings'];
                    profileSettings = windowSettings === null || windowSettings === void 0 ? void 0 : windowSettings[currentProfile];
                    if (!profileSettings) {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, profileSettings.Bell === false];
                case 4:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
