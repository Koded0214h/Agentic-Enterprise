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
exports.setupShellCompletion = setupShellCompletion;
exports.regenerateCompletionCache = regenerateCompletionCache;
var chalk_1 = require("chalk");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var url_1 = require("url");
var color_js_1 = require("../components/design-system/color.js");
var supports_hyperlinks_js_1 = require("../ink/supports-hyperlinks.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var log_js_1 = require("./log.js");
var EOL = '\n';
function detectShell() {
    var shell = process.env.SHELL || '';
    var home = (0, os_1.homedir)();
    var claudeDir = (0, path_1.join)(home, '.claude');
    if (shell.endsWith('/zsh') || shell.endsWith('/zsh.exe')) {
        var cacheFile = (0, path_1.join)(claudeDir, 'completion.zsh');
        return {
            name: 'zsh',
            rcFile: (0, path_1.join)(home, '.zshrc'),
            cacheFile: cacheFile,
            completionLine: "[[ -f \"".concat(cacheFile, "\" ]] && source \"").concat(cacheFile, "\""),
            shellFlag: 'zsh',
        };
    }
    if (shell.endsWith('/bash') || shell.endsWith('/bash.exe')) {
        var cacheFile = (0, path_1.join)(claudeDir, 'completion.bash');
        return {
            name: 'bash',
            rcFile: (0, path_1.join)(home, '.bashrc'),
            cacheFile: cacheFile,
            completionLine: "[ -f \"".concat(cacheFile, "\" ] && source \"").concat(cacheFile, "\""),
            shellFlag: 'bash',
        };
    }
    if (shell.endsWith('/fish') || shell.endsWith('/fish.exe')) {
        var xdg = process.env.XDG_CONFIG_HOME || (0, path_1.join)(home, '.config');
        var cacheFile = (0, path_1.join)(claudeDir, 'completion.fish');
        return {
            name: 'fish',
            rcFile: (0, path_1.join)(xdg, 'fish', 'config.fish'),
            cacheFile: cacheFile,
            completionLine: "[ -f \"".concat(cacheFile, "\" ] && source \"").concat(cacheFile, "\""),
            shellFlag: 'fish',
        };
    }
    return null;
}
function formatPathLink(filePath) {
    if (!(0, supports_hyperlinks_js_1.supportsHyperlinks)()) {
        return filePath;
    }
    var fileUrl = (0, url_1.pathToFileURL)(filePath).href;
    return "\u001B]8;;".concat(fileUrl, "\u0007").concat(filePath, "\u001B]8;;\u0007");
}
/**
 * Generate and cache the completion script, then add a source line to the
 * shell's rc file. Returns a user-facing status message.
 */
function setupShellCompletion(theme) {
    return __awaiter(this, void 0, void 0, function () {
        var shell, e_1, claudeBin, result, existing, e_2, configDir, separator, content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    shell = detectShell();
                    if (!shell) {
                        return [2 /*return*/, ''];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(shell.cacheFile), { recursive: true })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    (0, log_js_1.logError)(e_1);
                    return [2 /*return*/, "".concat(EOL).concat((0, color_js_1.color)('warning', theme)("Could not write ".concat(shell.name, " completion cache"))).concat(EOL).concat(chalk_1.default.dim("Run manually: claude completion ".concat(shell.shellFlag, " > ").concat(shell.cacheFile))).concat(EOL)];
                case 4:
                    claudeBin = process.argv[1] || 'claude';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(claudeBin, [
                            'completion',
                            shell.shellFlag,
                            '--output',
                            shell.cacheFile,
                        ])];
                case 5:
                    result = _a.sent();
                    if (result.code !== 0) {
                        return [2 /*return*/, "".concat(EOL).concat((0, color_js_1.color)('warning', theme)("Could not generate ".concat(shell.name, " shell completions"))).concat(EOL).concat(chalk_1.default.dim("Run manually: claude completion ".concat(shell.shellFlag, " > ").concat(shell.cacheFile))).concat(EOL)];
                    }
                    existing = '';
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.readFile)(shell.rcFile, { encoding: 'utf-8' })];
                case 7:
                    existing = _a.sent();
                    if (existing.includes('claude completion') ||
                        existing.includes(shell.cacheFile)) {
                        return [2 /*return*/, "".concat(EOL).concat((0, color_js_1.color)('success', theme)("Shell completions updated for ".concat(shell.name))).concat(EOL).concat(chalk_1.default.dim("See ".concat(formatPathLink(shell.rcFile)))).concat(EOL)];
                    }
                    return [3 /*break*/, 9];
                case 8:
                    e_2 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(e_2)) {
                        (0, log_js_1.logError)(e_2);
                        return [2 /*return*/, "".concat(EOL).concat((0, color_js_1.color)('warning', theme)("Could not install ".concat(shell.name, " shell completions"))).concat(EOL).concat(chalk_1.default.dim("Add this to ".concat(formatPathLink(shell.rcFile), ":"))).concat(EOL).concat(chalk_1.default.dim(shell.completionLine)).concat(EOL)];
                    }
                    return [3 /*break*/, 9];
                case 9:
                    _a.trys.push([9, 12, , 13]);
                    configDir = (0, path_1.dirname)(shell.rcFile);
                    return [4 /*yield*/, (0, promises_1.mkdir)(configDir, { recursive: true })];
                case 10:
                    _a.sent();
                    separator = existing && !existing.endsWith('\n') ? '\n' : '';
                    content = "".concat(existing).concat(separator, "\n# Claude Code shell completions\n").concat(shell.completionLine, "\n");
                    return [4 /*yield*/, (0, promises_1.writeFile)(shell.rcFile, content, { encoding: 'utf-8' })];
                case 11:
                    _a.sent();
                    return [2 /*return*/, "".concat(EOL).concat((0, color_js_1.color)('success', theme)("Installed ".concat(shell.name, " shell completions"))).concat(EOL).concat(chalk_1.default.dim("Added to ".concat(formatPathLink(shell.rcFile)))).concat(EOL).concat(chalk_1.default.dim("Run: source ".concat(shell.rcFile))).concat(EOL)];
                case 12:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, "".concat(EOL).concat((0, color_js_1.color)('warning', theme)("Could not install ".concat(shell.name, " shell completions"))).concat(EOL).concat(chalk_1.default.dim("Add this to ".concat(formatPathLink(shell.rcFile), ":"))).concat(EOL).concat(chalk_1.default.dim(shell.completionLine)).concat(EOL)];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Regenerate cached shell completion scripts in ~/.claude/.
 * Called after `claude update` so completions stay in sync with the new binary.
 */
function regenerateCompletionCache() {
    return __awaiter(this, void 0, void 0, function () {
        var shell, claudeBin, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    shell = detectShell();
                    if (!shell) {
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("update: Regenerating ".concat(shell.name, " completion cache"));
                    claudeBin = process.argv[1] || 'claude';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(claudeBin, [
                            'completion',
                            shell.shellFlag,
                            '--output',
                            shell.cacheFile,
                        ])];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0) {
                        (0, debug_js_1.logForDebugging)("update: Failed to regenerate ".concat(shell.name, " completion cache"));
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("update: Regenerated ".concat(shell.name, " completion cache at ").concat(shell.cacheFile));
                    return [2 /*return*/];
            }
        });
    });
}
