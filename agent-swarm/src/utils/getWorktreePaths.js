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
exports.getWorktreePaths = getWorktreePaths;
var path_1 = require("path");
var index_js_1 = require("../services/analytics/index.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var git_js_1 = require("./git.js");
/**
 * Returns the paths of all worktrees for the current git repository.
 * If git is not available, not in a git repo, or only has one worktree,
 * returns an empty array.
 *
 * This version includes analytics tracking and uses the CLI's gitExe()
 * resolver. For a portable version without CLI deps, use
 * getWorktreePathsPortable().
 *
 * @param cwd Directory to run the command from
 * @returns Array of absolute worktree paths
 */
function getWorktreePaths(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, _a, stdout, code, durationMs, worktreePaths, currentWorktree, otherWorktrees;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startTime = Date.now();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['worktree', 'list', '--porcelain'], {
                            cwd: cwd,
                            preserveOutputOnError: false,
                        })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    durationMs = Date.now() - startTime;
                    if (code !== 0) {
                        (0, index_js_1.logEvent)('tengu_worktree_detection', {
                            duration_ms: durationMs,
                            worktree_count: 0,
                            success: false,
                        });
                        return [2 /*return*/, []];
                    }
                    worktreePaths = stdout
                        .split('\n')
                        .filter(function (line) { return line.startsWith('worktree '); })
                        .map(function (line) { return line.slice('worktree '.length).normalize('NFC'); });
                    (0, index_js_1.logEvent)('tengu_worktree_detection', {
                        duration_ms: durationMs,
                        worktree_count: worktreePaths.length,
                        success: true,
                    });
                    currentWorktree = worktreePaths.find(function (path) { return cwd === path || cwd.startsWith(path + path_1.sep); });
                    otherWorktrees = worktreePaths
                        .filter(function (path) { return path !== currentWorktree; })
                        .sort(function (a, b) { return a.localeCompare(b); });
                    return [2 /*return*/, currentWorktree ? __spreadArray([currentWorktree], otherWorktrees, true) : otherWorktrees];
            }
        });
    });
}
