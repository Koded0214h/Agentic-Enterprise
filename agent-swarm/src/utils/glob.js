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
exports.extractGlobBaseDirectory = extractGlobBaseDirectory;
exports.glob = glob;
var path_1 = require("path");
var envUtils_js_1 = require("./envUtils.js");
var filesystem_js_1 = require("./permissions/filesystem.js");
var platform_js_1 = require("./platform.js");
var orphanedPluginFilter_js_1 = require("./plugins/orphanedPluginFilter.js");
var ripgrep_js_1 = require("./ripgrep.js");
/**
 * Extracts the static base directory from a glob pattern.
 * The base directory is everything before the first glob special character (* ? [ {).
 * Returns the directory portion and the remaining relative pattern.
 */
function extractGlobBaseDirectory(pattern) {
    // Find the first glob special character: *, ?, [, {
    var globChars = /[*?[{]/;
    var match = pattern.match(globChars);
    if (!match || match.index === undefined) {
        // No glob characters - this is a literal path
        // Return the directory portion and filename as pattern
        var dir = (0, path_1.dirname)(pattern);
        var file = (0, path_1.basename)(pattern);
        return { baseDir: dir, relativePattern: file };
    }
    // Get everything before the first glob character
    var staticPrefix = pattern.slice(0, match.index);
    // Find the last path separator in the static prefix
    var lastSepIndex = Math.max(staticPrefix.lastIndexOf('/'), staticPrefix.lastIndexOf(path_1.sep));
    if (lastSepIndex === -1) {
        // No path separator before the glob - pattern is relative to cwd
        return { baseDir: '', relativePattern: pattern };
    }
    var baseDir = staticPrefix.slice(0, lastSepIndex);
    var relativePattern = pattern.slice(lastSepIndex + 1);
    // Handle root directory patterns (e.g., /*.txt on Unix or C:/*.txt on Windows)
    // When lastSepIndex is 0, baseDir is empty but we need to use '/' as the root
    if (baseDir === '' && lastSepIndex === 0) {
        baseDir = '/';
    }
    // Handle Windows drive root paths (e.g., C:/*.txt)
    // 'C:' means "current directory on drive C" (relative), not root
    // We need 'C:/' or 'C:\' for the actual drive root
    if ((0, platform_js_1.getPlatform)() === 'windows' && /^[A-Za-z]:$/.test(baseDir)) {
        baseDir = baseDir + path_1.sep;
    }
    return { baseDir: baseDir, relativePattern: relativePattern };
}
function glob(filePattern_1, cwd_1, _a, abortSignal_1, toolPermissionContext_1) {
    return __awaiter(this, arguments, void 0, function (filePattern, cwd, _b, abortSignal, toolPermissionContext) {
        var searchDir, searchPattern, _c, baseDir, relativePattern, ignorePatterns, noIgnore, hidden, args, _i, ignorePatterns_1, pattern, _d, _e, exclusion, allPaths, absolutePaths, truncated, files;
        var limit = _b.limit, offset = _b.offset;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    searchDir = cwd;
                    searchPattern = filePattern;
                    // Handle absolute paths by extracting the base directory and converting to relative pattern
                    // ripgrep's --glob flag only works with relative patterns
                    if ((0, path_1.isAbsolute)(filePattern)) {
                        _c = extractGlobBaseDirectory(filePattern), baseDir = _c.baseDir, relativePattern = _c.relativePattern;
                        if (baseDir) {
                            searchDir = baseDir;
                            searchPattern = relativePattern;
                        }
                    }
                    ignorePatterns = (0, filesystem_js_1.normalizePatternsToPath)((0, filesystem_js_1.getFileReadIgnorePatterns)(toolPermissionContext), searchDir);
                    noIgnore = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_GLOB_NO_IGNORE || 'true');
                    hidden = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_GLOB_HIDDEN || 'true');
                    args = __spreadArray(__spreadArray([
                        '--files',
                        '--glob',
                        searchPattern,
                        '--sort=modified'
                    ], (noIgnore ? ['--no-ignore'] : []), true), (hidden ? ['--hidden'] : []), true);
                    // Add ignore patterns
                    for (_i = 0, ignorePatterns_1 = ignorePatterns; _i < ignorePatterns_1.length; _i++) {
                        pattern = ignorePatterns_1[_i];
                        args.push('--glob', "!".concat(pattern));
                    }
                    _d = 0;
                    return [4 /*yield*/, (0, orphanedPluginFilter_js_1.getGlobExclusionsForPluginCache)(searchDir)];
                case 1:
                    _e = _f.sent();
                    _f.label = 2;
                case 2:
                    if (!(_d < _e.length)) return [3 /*break*/, 4];
                    exclusion = _e[_d];
                    args.push('--glob', exclusion);
                    _f.label = 3;
                case 3:
                    _d++;
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, (0, ripgrep_js_1.ripGrep)(args, searchDir, abortSignal)
                    // ripgrep returns relative paths, convert to absolute
                ];
                case 5:
                    allPaths = _f.sent();
                    absolutePaths = allPaths.map(function (p) {
                        return (0, path_1.isAbsolute)(p) ? p : (0, path_1.join)(searchDir, p);
                    });
                    truncated = absolutePaths.length > offset + limit;
                    files = absolutePaths.slice(offset, offset + limit);
                    return [2 /*return*/, { files: files, truncated: truncated }];
            }
        });
    });
}
