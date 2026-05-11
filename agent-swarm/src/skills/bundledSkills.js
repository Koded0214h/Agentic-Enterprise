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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBundledSkill = registerBundledSkill;
exports.getBundledSkills = getBundledSkills;
exports.clearBundledSkills = clearBundledSkills;
exports.getBundledSkillExtractDir = getBundledSkillExtractDir;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("../utils/debug.js");
var filesystem_js_1 = require("../utils/permissions/filesystem.js");
// Internal registry for bundled skills
var bundledSkills = [];
/**
 * Register a bundled skill that will be available to the model.
 * Call this at module initialization or in an init function.
 *
 * Bundled skills are compiled into the CLI binary and available to all users.
 * They follow the same pattern as registerPostSamplingHook() for internal features.
 */
function registerBundledSkill(definition) {
    var _this = this;
    var _a, _b, _c, _d;
    var files = definition.files;
    var skillRoot;
    var getPromptForCommand = definition.getPromptForCommand;
    if (files && Object.keys(files).length > 0) {
        skillRoot = getBundledSkillExtractDir(definition.name);
        // Closure-local memoization: extract once per process.
        // Memoize the promise (not the result) so concurrent callers await
        // the same extraction instead of racing into separate writes.
        var extractionPromise_1;
        var inner_1 = definition.getPromptForCommand;
        getPromptForCommand = function (args, ctx) { return __awaiter(_this, void 0, void 0, function () {
            var extractedDir, blocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        extractionPromise_1 !== null && extractionPromise_1 !== void 0 ? extractionPromise_1 : (extractionPromise_1 = extractBundledSkillFiles(definition.name, files));
                        return [4 /*yield*/, extractionPromise_1];
                    case 1:
                        extractedDir = _a.sent();
                        return [4 /*yield*/, inner_1(args, ctx)];
                    case 2:
                        blocks = _a.sent();
                        if (extractedDir === null)
                            return [2 /*return*/, blocks];
                        return [2 /*return*/, prependBaseDir(blocks, extractedDir)];
                }
            });
        }); };
    }
    var command = {
        type: 'prompt',
        name: definition.name,
        description: definition.description,
        aliases: definition.aliases,
        hasUserSpecifiedDescription: true,
        allowedTools: (_a = definition.allowedTools) !== null && _a !== void 0 ? _a : [],
        argumentHint: definition.argumentHint,
        whenToUse: definition.whenToUse,
        model: definition.model,
        disableModelInvocation: (_b = definition.disableModelInvocation) !== null && _b !== void 0 ? _b : false,
        userInvocable: (_c = definition.userInvocable) !== null && _c !== void 0 ? _c : true,
        contentLength: 0, // Not applicable for bundled skills
        source: 'bundled',
        loadedFrom: 'bundled',
        hooks: definition.hooks,
        skillRoot: skillRoot,
        context: definition.context,
        agent: definition.agent,
        isEnabled: definition.isEnabled,
        isHidden: !((_d = definition.userInvocable) !== null && _d !== void 0 ? _d : true),
        progressMessage: 'running',
        getPromptForCommand: getPromptForCommand,
    };
    bundledSkills.push(command);
}
/**
 * Get all registered bundled skills.
 * Returns a copy to prevent external mutation.
 */
function getBundledSkills() {
    return __spreadArray([], bundledSkills, true);
}
/**
 * Clear bundled skills registry (for testing).
 */
function clearBundledSkills() {
    bundledSkills.length = 0;
}
/**
 * Deterministic extraction directory for a bundled skill's reference files.
 */
function getBundledSkillExtractDir(skillName) {
    return (0, path_1.join)((0, filesystem_js_1.getBundledSkillsRoot)(), skillName);
}
/**
 * Extract a bundled skill's reference files to disk so the model can
 * Read/Grep them on demand. Called lazily on first skill invocation.
 *
 * Returns the directory written to, or null if write failed (skill
 * continues to work, just without the base-directory prefix).
 */
function extractBundledSkillFiles(skillName, files) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = getBundledSkillExtractDir(skillName);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, writeSkillFiles(dir, files)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, dir];
                case 3:
                    e_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to extract bundled skill '".concat(skillName, "' to ").concat(dir, ": ").concat(e_1 instanceof Error ? e_1.message : String(e_1)));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function writeSkillFiles(dir, files) {
    return __awaiter(this, void 0, void 0, function () {
        var byParent, _i, _a, _b, relPath, content, target, parent_1, entry, group;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    byParent = new Map();
                    for (_i = 0, _a = Object.entries(files); _i < _a.length; _i++) {
                        _b = _a[_i], relPath = _b[0], content = _b[1];
                        target = resolveSkillFilePath(dir, relPath);
                        parent_1 = (0, path_1.dirname)(target);
                        entry = [target, content];
                        group = byParent.get(parent_1);
                        if (group)
                            group.push(entry);
                        else
                            byParent.set(parent_1, [entry]);
                    }
                    return [4 /*yield*/, Promise.all(__spreadArray([], byParent, true).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var parent = _b[0], entries = _b[1];
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, (0, promises_1.mkdir)(parent, { recursive: true, mode: 448 })];
                                    case 1:
                                        _c.sent();
                                        return [4 /*yield*/, Promise.all(entries.map(function (_a) {
                                                var p = _a[0], c = _a[1];
                                                return safeWriteFile(p, c);
                                            }))];
                                    case 2:
                                        _c.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// The per-process nonce in getBundledSkillsRoot() is the primary defense
// against pre-created symlinks/dirs. Explicit 0o700/0o600 modes keep the
// nonce subtree owner-only even on umask=0, so an attacker who learns the
// nonce via inotify on the predictable parent still can't write into it.
// O_NOFOLLOW|O_EXCL is belt-and-suspenders (O_NOFOLLOW only protects the
// final component); we deliberately do NOT unlink+retry on EEXIST — unlink()
// follows intermediate symlinks too.
var O_NOFOLLOW = (_a = fs_1.constants.O_NOFOLLOW) !== null && _a !== void 0 ? _a : 0;
// On Windows, use string flags — numeric O_EXCL can produce EINVAL through libuv.
var SAFE_WRITE_FLAGS = process.platform === 'win32'
    ? 'wx'
    : fs_1.constants.O_WRONLY |
        fs_1.constants.O_CREAT |
        fs_1.constants.O_EXCL |
        O_NOFOLLOW;
function safeWriteFile(p, content) {
    return __awaiter(this, void 0, void 0, function () {
        var fh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.open)(p, SAFE_WRITE_FLAGS, 384)];
                case 1:
                    fh = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 6]);
                    return [4 /*yield*/, fh.writeFile(content, 'utf8')];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, fh.close()];
                case 5:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/** Normalize and validate a skill-relative path; throws on traversal. */
function resolveSkillFilePath(baseDir, relPath) {
    var normalized = (0, path_1.normalize)(relPath);
    if ((0, path_1.isAbsolute)(normalized) ||
        normalized.split(path_1.sep).includes('..') ||
        normalized.split('/').includes('..')) {
        throw new Error("bundled skill file path escapes skill dir: ".concat(relPath));
    }
    return (0, path_1.join)(baseDir, normalized);
}
function prependBaseDir(blocks, baseDir) {
    var prefix = "Base directory for this skill: ".concat(baseDir, "\n\n");
    if (blocks.length > 0 && blocks[0].type === 'text') {
        return __spreadArray([
            { type: 'text', text: prefix + blocks[0].text }
        ], blocks.slice(1), true);
    }
    return __spreadArray([{ type: 'text', text: prefix }], blocks, true);
}
