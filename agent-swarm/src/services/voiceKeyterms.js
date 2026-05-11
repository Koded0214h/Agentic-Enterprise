"use strict";
// Voice keyterms for improving STT accuracy in the voice_stream endpoint.
//
// Provides domain-specific vocabulary hints (Deepgram "keywords") so the STT
// engine correctly recognises coding terminology, project names, and branch
// names that would otherwise be misheard.
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
exports.splitIdentifier = splitIdentifier;
exports.getVoiceKeyterms = getVoiceKeyterms;
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var git_js_1 = require("../utils/git.js");
// ─── Global keyterms ────────────────────────────────────────────────
var GLOBAL_KEYTERMS = [
    // Terms Deepgram consistently mangles without keyword hints.
    // Note: "Claude" and "Anthropic" are already server-side base keyterms.
    // Avoid terms nobody speaks aloud as-spelled (stdout → "standard out").
    'MCP',
    'symlink',
    'grep',
    'regex',
    'localhost',
    'codebase',
    'TypeScript',
    'JSON',
    'OAuth',
    'webhook',
    'gRPC',
    'dotfiles',
    'subagent',
    'worktree',
];
// ─── Helpers ────────────────────────────────────────────────────────
/**
 * Split an identifier (camelCase, PascalCase, kebab-case, snake_case, or
 * path segments) into individual words.  Fragments of 2 chars or fewer are
 * discarded to avoid noise.
 */
function splitIdentifier(name) {
    return name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[-_./\s]+/)
        .map(function (w) { return w.trim(); })
        .filter(function (w) { return w.length > 2 && w.length <= 20; });
}
function fileNameWords(filePath) {
    var stem = (0, path_1.basename)(filePath).replace(/\.[^.]+$/, '');
    return splitIdentifier(stem);
}
// ─── Public API ─────────────────────────────────────────────────────
var MAX_KEYTERMS = 50;
/**
 * Build a list of keyterms for the voice_stream STT endpoint.
 *
 * Combines hardcoded global coding terms with session context (project name,
 * git branch, recent files) without any model calls.
 */
function getVoiceKeyterms(recentFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var terms, projectRoot, name_1, branch, _i, _a, word, _b, _c, recentFiles_1, filePath, _d, _e, word;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    terms = new Set(GLOBAL_KEYTERMS);
                    // Project root basename as a single term — users say "claude CLI internal"
                    // as a phrase, not isolated words. Keeping the whole basename lets the
                    // STT's keyterm boosting match the phrase regardless of separator.
                    try {
                        projectRoot = (0, state_js_1.getProjectRoot)();
                        if (projectRoot) {
                            name_1 = (0, path_1.basename)(projectRoot);
                            if (name_1.length > 2 && name_1.length <= 50) {
                                terms.add(name_1);
                            }
                        }
                    }
                    catch (_g) {
                        // getProjectRoot() may throw if not initialised yet — ignore
                    }
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, git_js_1.getBranch)()];
                case 2:
                    branch = _f.sent();
                    if (branch) {
                        for (_i = 0, _a = splitIdentifier(branch); _i < _a.length; _i++) {
                            word = _a[_i];
                            terms.add(word);
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _b = _f.sent();
                    return [3 /*break*/, 4];
                case 4:
                    // Recent file names — only scan enough to fill remaining slots
                    if (recentFiles) {
                        for (_c = 0, recentFiles_1 = recentFiles; _c < recentFiles_1.length; _c++) {
                            filePath = recentFiles_1[_c];
                            if (terms.size >= MAX_KEYTERMS)
                                break;
                            for (_d = 0, _e = fileNameWords(filePath); _d < _e.length; _d++) {
                                word = _e[_d];
                                terms.add(word);
                            }
                        }
                    }
                    return [2 /*return*/, __spreadArray([], terms, true).slice(0, MAX_KEYTERMS)];
            }
        });
    });
}
