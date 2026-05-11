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
exports.walkPluginMarkdown = walkPluginMarkdown;
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var fsOperations_js_1 = require("../fsOperations.js");
var SKILL_MD_RE = /^skill\.md$/i;
/**
 * Recursively walk a plugin directory, invoking onFile for each .md file.
 *
 * The namespace array tracks the subdirectory path relative to the root
 * (e.g., ['foo', 'bar'] for root/foo/bar/file.md). Callers that don't need
 * namespacing can ignore the second argument.
 *
 * When stopAtSkillDir is true and a directory contains SKILL.md, onFile is
 * called for all .md files in that directory but subdirectories are not
 * scanned — skill directories are leaf containers.
 *
 * Readdir errors are swallowed with a debug log so one bad directory doesn't
 * abort a plugin load.
 */
function walkPluginMarkdown(rootDir_1, onFile_1) {
    return __awaiter(this, arguments, void 0, function (rootDir, onFile, opts) {
        function scan(dirPath, namespace) {
            return __awaiter(this, void 0, void 0, function () {
                var entries, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, fs.readdir(dirPath)];
                        case 1:
                            entries = _a.sent();
                            if (!(opts.stopAtSkillDir &&
                                entries.some(function (e) { return e.isFile() && SKILL_MD_RE.test(e.name); }))) return [3 /*break*/, 3];
                            // Skill directory: collect .md files here, don't recurse.
                            return [4 /*yield*/, Promise.all(entries.map(function (entry) {
                                    return entry.isFile() && entry.name.toLowerCase().endsWith('.md')
                                        ? onFile((0, path_1.join)(dirPath, entry.name), namespace)
                                        : undefined;
                                }))];
                        case 2:
                            // Skill directory: collect .md files here, don't recurse.
                            _a.sent();
                            return [2 /*return*/];
                        case 3: return [4 /*yield*/, Promise.all(entries.map(function (entry) {
                                var fullPath = (0, path_1.join)(dirPath, entry.name);
                                if (entry.isDirectory()) {
                                    return scan(fullPath, __spreadArray(__spreadArray([], namespace, true), [entry.name], false));
                                }
                                if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
                                    return onFile(fullPath, namespace);
                                }
                                return undefined;
                            }))];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _a.sent();
                            (0, debug_js_1.logForDebugging)("Failed to scan ".concat(label, " directory ").concat(dirPath, ": ").concat(error_1), { level: 'error' });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }
        var fs, label;
        var _a;
        if (opts === void 0) { opts = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    label = (_a = opts.logLabel) !== null && _a !== void 0 ? _a : 'plugin';
                    return [4 /*yield*/, scan(rootDir, [])];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
