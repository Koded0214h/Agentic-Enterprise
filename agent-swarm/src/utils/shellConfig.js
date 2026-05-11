"use strict";
/**
 * Utilities for managing shell configuration files (like .bashrc, .zshrc)
 * Used for managing claude aliases and PATH entries
 */
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
exports.CLAUDE_ALIAS_REGEX = void 0;
exports.getShellConfigPaths = getShellConfigPaths;
exports.filterClaudeAliases = filterClaudeAliases;
exports.readFileLines = readFileLines;
exports.writeFileLines = writeFileLines;
exports.findClaudeAlias = findClaudeAlias;
exports.findValidClaudeAlias = findValidClaudeAlias;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var errors_js_1 = require("./errors.js");
var localInstaller_js_1 = require("./localInstaller.js");
exports.CLAUDE_ALIAS_REGEX = /^\s*alias\s+claude\s*=/;
/**
 * Get the paths to shell configuration files
 * Respects ZDOTDIR for zsh users
 * @param options Optional overrides for testing (env, homedir)
 */
function getShellConfigPaths(options) {
    var _a, _b;
    var home = (_a = options === null || options === void 0 ? void 0 : options.homedir) !== null && _a !== void 0 ? _a : (0, os_1.homedir)();
    var env = (_b = options === null || options === void 0 ? void 0 : options.env) !== null && _b !== void 0 ? _b : process.env;
    var zshConfigDir = env.ZDOTDIR || home;
    return {
        zsh: (0, path_1.join)(zshConfigDir, '.zshrc'),
        bash: (0, path_1.join)(home, '.bashrc'),
        fish: (0, path_1.join)(home, '.config/fish/config.fish'),
    };
}
/**
 * Filter out installer-created claude aliases from an array of lines
 * Only removes aliases pointing to $HOME/.claude/local/claude
 * Preserves custom user aliases that point to other locations
 * Returns the filtered lines and whether our default installer alias was found
 */
function filterClaudeAliases(lines) {
    var hadAlias = false;
    var filtered = lines.filter(function (line) {
        // Check if this is a claude alias
        if (exports.CLAUDE_ALIAS_REGEX.test(line)) {
            // Extract the alias target - handle spaces, quotes, and various formats
            // First try with quotes
            var match = line.match(/alias\s+claude\s*=\s*["']([^"']+)["']/);
            if (!match) {
                // Try without quotes (capturing until end of line or comment)
                match = line.match(/alias\s+claude\s*=\s*([^#\n]+)/);
            }
            if (match && match[1]) {
                var target = match[1].trim();
                // Only remove if it points to the installer location
                // The installer always creates aliases with the full expanded path
                if (target === (0, localInstaller_js_1.getLocalClaudePath)()) {
                    hadAlias = true;
                    return false; // Remove this line
                }
            }
            // Keep custom aliases that don't point to the installer location
        }
        return true;
    });
    return { filtered: filtered, hadAlias: hadAlias };
}
/**
 * Read a file and split it into lines
 * Returns null if file doesn't exist or can't be read
 */
function readFileLines(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var content, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, { encoding: 'utf8' })];
                case 1:
                    content = _a.sent();
                    return [2 /*return*/, content.split('\n')];
                case 2:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_1))
                        return [2 /*return*/, null];
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write lines back to a file
 */
function writeFileLines(filePath, lines) {
    return __awaiter(this, void 0, void 0, function () {
        var fh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.open)(filePath, 'w')];
                case 1:
                    fh = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 5, 7]);
                    return [4 /*yield*/, fh.writeFile(lines.join('\n'), { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fh.datasync()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, fh.close()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a claude alias exists in any shell config file
 * Returns the alias target if found, null otherwise
 * @param options Optional overrides for testing (env, homedir)
 */
function findClaudeAlias(options) {
    return __awaiter(this, void 0, void 0, function () {
        var configs, _i, _a, configPath, lines, _b, lines_1, line, match;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    configs = getShellConfigPaths(options);
                    _i = 0, _a = Object.values(configs);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    configPath = _a[_i];
                    return [4 /*yield*/, readFileLines(configPath)];
                case 2:
                    lines = _c.sent();
                    if (!lines)
                        return [3 /*break*/, 3];
                    for (_b = 0, lines_1 = lines; _b < lines_1.length; _b++) {
                        line = lines_1[_b];
                        if (exports.CLAUDE_ALIAS_REGEX.test(line)) {
                            match = line.match(/alias\s+claude=["']?([^"'\s]+)/);
                            if (match && match[1]) {
                                return [2 /*return*/, match[1]];
                            }
                        }
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Check if a claude alias exists and points to a valid executable
 * Returns the alias target if valid, null otherwise
 * @param options Optional overrides for testing (env, homedir)
 */
function findValidClaudeAlias(options) {
    return __awaiter(this, void 0, void 0, function () {
        var aliasTarget, home, expandedPath, stats, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, findClaudeAlias(options)];
                case 1:
                    aliasTarget = _c.sent();
                    if (!aliasTarget)
                        return [2 /*return*/, null];
                    home = (_b = options === null || options === void 0 ? void 0 : options.homedir) !== null && _b !== void 0 ? _b : (0, os_1.homedir)();
                    expandedPath = aliasTarget.startsWith('~')
                        ? aliasTarget.replace('~', home)
                        : aliasTarget;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.stat)(expandedPath)
                        // Check if it's a file (could be executable or symlink)
                    ];
                case 3:
                    stats = _c.sent();
                    // Check if it's a file (could be executable or symlink)
                    if (stats.isFile() || stats.isSymbolicLink()) {
                        return [2 /*return*/, aliasTarget];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, null];
            }
        });
    });
}
