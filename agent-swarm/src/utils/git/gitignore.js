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
exports.isPathGitignored = isPathGitignored;
exports.getGlobalGitignorePath = getGlobalGitignorePath;
exports.addFileGlobRuleToGitignore = addFileGlobRuleToGitignore;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var cwd_js_1 = require("../cwd.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var git_js_1 = require("../git.js");
var log_js_1 = require("../log.js");
/**
 * Checks if a path is ignored by git (via `git check-ignore`).
 *
 * This consults all applicable gitignore sources: repo `.gitignore` files
 * (nested), `.git/info/exclude`, and the global gitignore — with correct
 * precedence, because git itself resolves it.
 *
 * Exit codes: 0 = ignored, 1 = not ignored, 128 = not in a git repo.
 * Returns `false` for 128, so callers outside a git repo fail open.
 *
 * @param filePath The path to check (absolute or relative to cwd)
 * @param cwd The working directory to run git from
 */
function isPathGitignored(filePath, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('git', ['check-ignore', filePath], {
                        preserveOutputOnError: false,
                        cwd: cwd,
                    })];
                case 1:
                    code = (_a.sent()).code;
                    return [2 /*return*/, code === 0];
            }
        });
    });
}
/**
 * Gets the path to the global gitignore file (.config/git/ignore)
 * @returns The path to the global gitignore file
 */
function getGlobalGitignorePath() {
    return (0, path_1.join)((0, os_1.homedir)(), '.config', 'git', 'ignore');
}
/**
 * Adds a file pattern to the global gitignore file (.config/git/ignore)
 * if it's not already ignored by existing patterns in any gitignore file
 * @param filename The filename to add to gitignore
 * @param cwd The current working directory (optional)
 */
function addFileGlobRuleToGitignore(filename_1) {
    return __awaiter(this, arguments, void 0, function (filename, cwd) {
        var gitignoreEntry, testPath, globalGitignorePath, configGitDir, content, e_1, code, error_1;
        if (cwd === void 0) { cwd = (0, cwd_js_1.getCwd)(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, (0, git_js_1.dirIsInGitRepo)(cwd)];
                case 1:
                    if (!(_a.sent())) {
                        return [2 /*return*/];
                    }
                    gitignoreEntry = "**/".concat(filename);
                    testPath = filename.endsWith('/')
                        ? "".concat(filename, "sample-file.txt")
                        : filename;
                    return [4 /*yield*/, isPathGitignored(testPath, cwd)];
                case 2:
                    if (_a.sent()) {
                        // File is already ignored by existing patterns (local or global)
                        return [2 /*return*/];
                    }
                    globalGitignorePath = getGlobalGitignorePath();
                    configGitDir = (0, path_1.dirname)(globalGitignorePath);
                    return [4 /*yield*/, (0, promises_1.mkdir)(configGitDir, { recursive: true })
                        // Add the entry to the global gitignore
                    ];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 7, , 11]);
                    return [4 /*yield*/, (0, promises_1.readFile)(globalGitignorePath, { encoding: 'utf-8' })];
                case 5:
                    content = _a.sent();
                    if (content.includes(gitignoreEntry)) {
                        return [2 /*return*/]; // Pattern already exists, don't add again
                    }
                    return [4 /*yield*/, (0, promises_1.appendFile)(globalGitignorePath, "\n".concat(gitignoreEntry, "\n"))];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 7:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (!(code === 'ENOENT')) return [3 /*break*/, 9];
                    // Create global gitignore with entry
                    return [4 /*yield*/, (0, promises_1.writeFile)(globalGitignorePath, "".concat(gitignoreEntry, "\n"), 'utf-8')];
                case 8:
                    // Create global gitignore with entry
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9: throw e_1;
                case 10: return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
