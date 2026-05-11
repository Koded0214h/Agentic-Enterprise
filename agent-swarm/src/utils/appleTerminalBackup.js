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
exports.markTerminalSetupInProgress = markTerminalSetupInProgress;
exports.markTerminalSetupComplete = markTerminalSetupComplete;
exports.getTerminalPlistPath = getTerminalPlistPath;
exports.backupTerminalPreferences = backupTerminalPreferences;
exports.checkAndRestoreTerminalBackup = checkAndRestoreTerminalBackup;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var config_js_1 = require("./config.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var log_js_1 = require("./log.js");
function markTerminalSetupInProgress(backupPath) {
    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { appleTerminalSetupInProgress: true, appleTerminalBackupPath: backupPath })); });
}
function markTerminalSetupComplete() {
    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { appleTerminalSetupInProgress: false })); });
}
function getTerminalRecoveryInfo() {
    var _a;
    var config = (0, config_js_1.getGlobalConfig)();
    return {
        inProgress: (_a = config.appleTerminalSetupInProgress) !== null && _a !== void 0 ? _a : false,
        backupPath: config.appleTerminalBackupPath || null,
    };
}
function getTerminalPlistPath() {
    return (0, path_1.join)((0, os_1.homedir)(), 'Library', 'Preferences', 'com.apple.Terminal.plist');
}
function backupTerminalPreferences() {
    return __awaiter(this, void 0, void 0, function () {
        var terminalPlistPath, backupPath, code, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    terminalPlistPath = getTerminalPlistPath();
                    backupPath = "".concat(terminalPlistPath, ".bak");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('defaults', [
                            'export',
                            'com.apple.Terminal',
                            terminalPlistPath,
                        ])];
                case 2:
                    code = (_b.sent()).code;
                    if (code !== 0) {
                        return [2 /*return*/, null];
                    }
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.stat)(terminalPlistPath)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 6: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('defaults', [
                        'export',
                        'com.apple.Terminal',
                        backupPath,
                    ])];
                case 7:
                    _b.sent();
                    markTerminalSetupInProgress(backupPath);
                    return [2 /*return*/, backupPath];
                case 8:
                    error_1 = _b.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function checkAndRestoreTerminalBackup() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, inProgress, backupPath, _b, code, restoreError_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = getTerminalRecoveryInfo(), inProgress = _a.inProgress, backupPath = _a.backupPath;
                    if (!inProgress) {
                        return [2 /*return*/, { status: 'no_backup' }];
                    }
                    if (!backupPath) {
                        markTerminalSetupComplete();
                        return [2 /*return*/, { status: 'no_backup' }];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(backupPath)];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _b = _c.sent();
                    markTerminalSetupComplete();
                    return [2 /*return*/, { status: 'no_backup' }];
                case 4:
                    _c.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('defaults', [
                            'import',
                            'com.apple.Terminal',
                            backupPath,
                        ])];
                case 5:
                    code = (_c.sent()).code;
                    if (code !== 0) {
                        return [2 /*return*/, { status: 'failed', backupPath: backupPath }];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('killall', ['cfprefsd'])];
                case 6:
                    _c.sent();
                    markTerminalSetupComplete();
                    return [2 /*return*/, { status: 'restored' }];
                case 7:
                    restoreError_1 = _c.sent();
                    (0, log_js_1.logError)(new Error("Failed to restore Terminal.app settings with: ".concat(restoreError_1)));
                    markTerminalSetupComplete();
                    return [2 /*return*/, { status: 'failed', backupPath: backupPath }];
                case 8: return [2 /*return*/];
            }
        });
    });
}
