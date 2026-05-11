"use strict";
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
exports.getSessionEnvDirPath = getSessionEnvDirPath;
exports.getHookEnvFilePath = getHookEnvFilePath;
exports.clearCwdEnvFiles = clearCwdEnvFiles;
exports.invalidateSessionEnvCache = invalidateSessionEnvCache;
exports.getSessionEnvironmentScript = getSessionEnvironmentScript;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var platform_js_1 = require("./platform.js");
// Cache states:
// undefined = not yet loaded (need to check disk)
// null = checked disk, no files exist (don't check again)
// string = loaded and cached (use cached value)
var sessionEnvScript = undefined;
function getSessionEnvDirPath() {
    return __awaiter(this, void 0, void 0, function () {
        var sessionEnvDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionEnvDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'session-env', (0, state_js_1.getSessionId)());
                    return [4 /*yield*/, (0, promises_1.mkdir)(sessionEnvDir, { recursive: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, sessionEnvDir];
            }
        });
    });
}
function getHookEnvFilePath(hookEvent, hookIndex) {
    return __awaiter(this, void 0, void 0, function () {
        var prefix, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    prefix = hookEvent.toLowerCase();
                    _a = path_1.join;
                    return [4 /*yield*/, getSessionEnvDirPath()];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent(), "".concat(prefix, "-hook-").concat(hookIndex, ".sh")])];
            }
        });
    });
}
function clearCwdEnvFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var dir_1, files, e_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getSessionEnvDirPath()];
                case 1:
                    dir_1 = _a.sent();
                    return [4 /*yield*/, (0, promises_1.readdir)(dir_1)];
                case 2:
                    files = _a.sent();
                    return [4 /*yield*/, Promise.all(files
                            .filter(function (f) {
                            return (f.startsWith('filechanged-hook-') ||
                                f.startsWith('cwdchanged-hook-')) &&
                                HOOK_ENV_REGEX.test(f);
                        })
                            .map(function (f) { return (0, promises_1.writeFile)((0, path_1.join)(dir_1, f), ''); }))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Failed to clear cwd env files: ".concat((0, errors_js_1.errorMessage)(e_1)));
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function invalidateSessionEnvCache() {
    (0, debug_js_1.logForDebugging)('Invalidating session environment cache');
    sessionEnvScript = undefined;
}
function getSessionEnvironmentScript() {
    return __awaiter(this, void 0, void 0, function () {
        var scripts, envFile, envScript, e_2, code, sessionEnvDir, files, hookFiles, _i, hookFiles_1, file, filePath, content, e_3, code, e_4, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, platform_js_1.getPlatform)() === 'windows') {
                        (0, debug_js_1.logForDebugging)('Session environment not yet supported on Windows');
                        return [2 /*return*/, null];
                    }
                    if (sessionEnvScript !== undefined) {
                        return [2 /*return*/, sessionEnvScript];
                    }
                    scripts = [];
                    envFile = process.env.CLAUDE_ENV_FILE;
                    if (!envFile) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(envFile, 'utf8')];
                case 2:
                    envScript = (_a.sent()).trim();
                    if (envScript) {
                        scripts.push(envScript);
                        (0, debug_js_1.logForDebugging)("Session environment loaded from CLAUDE_ENV_FILE: ".concat(envFile, " (").concat(envScript.length, " chars)"));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Failed to read CLAUDE_ENV_FILE: ".concat((0, errors_js_1.errorMessage)(e_2)));
                    }
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, getSessionEnvDirPath()];
                case 5:
                    sessionEnvDir = _a.sent();
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 14, , 15]);
                    return [4 /*yield*/, (0, promises_1.readdir)(sessionEnvDir)
                        // We are sorting the hook env files by the order in which they are listed
                        // in the settings.json file so that the resulting env is deterministic
                    ];
                case 7:
                    files = _a.sent();
                    hookFiles = files
                        .filter(function (f) { return HOOK_ENV_REGEX.test(f); })
                        .sort(sortHookEnvFiles);
                    _i = 0, hookFiles_1 = hookFiles;
                    _a.label = 8;
                case 8:
                    if (!(_i < hookFiles_1.length)) return [3 /*break*/, 13];
                    file = hookFiles_1[_i];
                    filePath = (0, path_1.join)(sessionEnvDir, file);
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf8')];
                case 10:
                    content = (_a.sent()).trim();
                    if (content) {
                        scripts.push(content);
                    }
                    return [3 /*break*/, 12];
                case 11:
                    e_3 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_3);
                    if (code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Failed to read hook file ".concat(filePath, ": ").concat((0, errors_js_1.errorMessage)(e_3)));
                    }
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 8];
                case 13:
                    if (hookFiles.length > 0) {
                        (0, debug_js_1.logForDebugging)("Session environment loaded from ".concat(hookFiles.length, " hook file(s)"));
                    }
                    return [3 /*break*/, 15];
                case 14:
                    e_4 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_4);
                    if (code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Failed to load session environment from hooks: ".concat((0, errors_js_1.errorMessage)(e_4)));
                    }
                    return [3 /*break*/, 15];
                case 15:
                    if (scripts.length === 0) {
                        (0, debug_js_1.logForDebugging)('No session environment scripts found');
                        sessionEnvScript = null;
                        return [2 /*return*/, sessionEnvScript];
                    }
                    sessionEnvScript = scripts.join('\n');
                    (0, debug_js_1.logForDebugging)("Session environment script ready (".concat(sessionEnvScript.length, " chars total)"));
                    return [2 /*return*/, sessionEnvScript];
            }
        });
    });
}
var HOOK_ENV_PRIORITY = {
    setup: 0,
    sessionstart: 1,
    cwdchanged: 2,
    filechanged: 3,
};
var HOOK_ENV_REGEX = /^(setup|sessionstart|cwdchanged|filechanged)-hook-(\d+)\.sh$/;
function sortHookEnvFiles(a, b) {
    var _a, _b;
    var aMatch = a.match(HOOK_ENV_REGEX);
    var bMatch = b.match(HOOK_ENV_REGEX);
    var aType = (aMatch === null || aMatch === void 0 ? void 0 : aMatch[1]) || '';
    var bType = (bMatch === null || bMatch === void 0 ? void 0 : bMatch[1]) || '';
    if (aType !== bType) {
        return ((_a = HOOK_ENV_PRIORITY[aType]) !== null && _a !== void 0 ? _a : 99) - ((_b = HOOK_ENV_PRIORITY[bType]) !== null && _b !== void 0 ? _b : 99);
    }
    var aIndex = parseInt((aMatch === null || aMatch === void 0 ? void 0 : aMatch[2]) || '0', 10);
    var bIndex = parseInt((bMatch === null || bMatch === void 0 ? void 0 : bMatch[2]) || '0', 10);
    return aIndex - bIndex;
}
