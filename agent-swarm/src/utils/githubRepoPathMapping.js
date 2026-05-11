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
exports.updateGithubRepoPathMapping = updateGithubRepoPathMapping;
exports.getKnownPathsForRepo = getKnownPathsForRepo;
exports.filterExistingPaths = filterExistingPaths;
exports.validateRepoAtPath = validateRepoAtPath;
exports.removePathFromRepo = removePathFromRepo;
var promises_1 = require("fs/promises");
var state_js_1 = require("../bootstrap/state.js");
var config_js_1 = require("./config.js");
var debug_js_1 = require("./debug.js");
var detectRepository_js_1 = require("./detectRepository.js");
var file_js_1 = require("./file.js");
var gitFilesystem_js_1 = require("./git/gitFilesystem.js");
var git_js_1 = require("./git.js");
/**
 * Updates the GitHub repository path mapping in global config.
 * Called at startup (fire-and-forget) to track known local paths for repos.
 * This is non-blocking and errors are logged silently.
 *
 * Stores the git root (not cwd) so the mapping always points to the
 * repository root regardless of which subdirectory the user launched from.
 * If the path is already tracked, it is promoted to the front of the list
 * so the most recently used clone appears first.
 */
function updateGithubRepoPathMapping() {
    return __awaiter(this, void 0, void 0, function () {
        var repo, cwd, gitRoot, basePath, currentPath_1, _a, repoKey_1, config, existingPaths, withoutCurrent, updatedPaths_1, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, detectRepository_js_1.detectCurrentRepository)()];
                case 1:
                    repo = _d.sent();
                    if (!repo) {
                        (0, debug_js_1.logForDebugging)('Not in a GitHub repository, skipping path mapping update');
                        return [2 /*return*/];
                    }
                    cwd = (0, state_js_1.getOriginalCwd)();
                    gitRoot = (0, git_js_1.findGitRoot)(cwd);
                    basePath = gitRoot !== null && gitRoot !== void 0 ? gitRoot : cwd;
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.realpath)(basePath)];
                case 3:
                    currentPath_1 = (_d.sent()).normalize('NFC');
                    return [3 /*break*/, 5];
                case 4:
                    _a = _d.sent();
                    currentPath_1 = basePath;
                    return [3 /*break*/, 5];
                case 5:
                    repoKey_1 = repo.toLowerCase();
                    config = (0, config_js_1.getGlobalConfig)();
                    existingPaths = (_c = (_b = config.githubRepoPaths) === null || _b === void 0 ? void 0 : _b[repoKey_1]) !== null && _c !== void 0 ? _c : [];
                    if (existingPaths[0] === currentPath_1) {
                        // Already at the front — nothing to do
                        (0, debug_js_1.logForDebugging)("Path ".concat(currentPath_1, " already tracked for repo ").concat(repoKey_1));
                        return [2 /*return*/];
                    }
                    withoutCurrent = existingPaths.filter(function (p) { return p !== currentPath_1; });
                    updatedPaths_1 = __spreadArray([currentPath_1], withoutCurrent, true);
                    (0, config_js_1.saveGlobalConfig)(function (current) {
                        var _a;
                        return (__assign(__assign({}, current), { githubRepoPaths: __assign(__assign({}, current.githubRepoPaths), (_a = {}, _a[repoKey_1] = updatedPaths_1, _a)) }));
                    });
                    (0, debug_js_1.logForDebugging)("Added ".concat(currentPath_1, " to tracked paths for repo ").concat(repoKey_1));
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _d.sent();
                    (0, debug_js_1.logForDebugging)("Error updating repo path mapping: ".concat(error_1));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets known local paths for a given GitHub repository.
 * @param repo The repository in "owner/repo" format
 * @returns Array of known absolute paths, or empty array if none
 */
function getKnownPathsForRepo(repo) {
    var _a, _b;
    var config = (0, config_js_1.getGlobalConfig)();
    var repoKey = repo.toLowerCase();
    return (_b = (_a = config.githubRepoPaths) === null || _a === void 0 ? void 0 : _a[repoKey]) !== null && _b !== void 0 ? _b : [];
}
/**
 * Filters paths to only those that exist on the filesystem.
 * @param paths Array of absolute paths to check
 * @returns Array of paths that exist
 */
function filterExistingPaths(paths) {
    return __awaiter(this, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(paths.map(file_js_1.pathExists))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, paths.filter(function (_, i) { return results[i]; })];
            }
        });
    });
}
/**
 * Validates that a path contains the expected GitHub repository.
 * @param path Absolute path to check
 * @param expectedRepo Expected repository in "owner/repo" format
 * @returns true if the path contains the expected repo, false otherwise
 */
function validateRepoAtPath(path, expectedRepo) {
    return __awaiter(this, void 0, void 0, function () {
        var remoteUrl, actualRepo, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, gitFilesystem_js_1.getRemoteUrlForDir)(path)];
                case 1:
                    remoteUrl = _b.sent();
                    if (!remoteUrl) {
                        return [2 /*return*/, false];
                    }
                    actualRepo = (0, detectRepository_js_1.parseGitHubRepository)(remoteUrl);
                    if (!actualRepo) {
                        return [2 /*return*/, false];
                    }
                    // Case-insensitive comparison
                    return [2 /*return*/, actualRepo.toLowerCase() === expectedRepo.toLowerCase()];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Removes a path from the tracked paths for a given repository.
 * Used when a path is found to be invalid during selection.
 * @param repo The repository in "owner/repo" format
 * @param pathToRemove The path to remove from tracking
 */
function removePathFromRepo(repo, pathToRemove) {
    var _a, _b;
    var config = (0, config_js_1.getGlobalConfig)();
    var repoKey = repo.toLowerCase();
    var existingPaths = (_b = (_a = config.githubRepoPaths) === null || _a === void 0 ? void 0 : _a[repoKey]) !== null && _b !== void 0 ? _b : [];
    var updatedPaths = existingPaths.filter(function (path) { return path !== pathToRemove; });
    if (updatedPaths.length === existingPaths.length) {
        // Path wasn't in the list, nothing to do
        return;
    }
    var updatedMapping = __assign({}, config.githubRepoPaths);
    if (updatedPaths.length === 0) {
        // Remove the repo key entirely if no paths remain
        delete updatedMapping[repoKey];
    }
    else {
        updatedMapping[repoKey] = updatedPaths;
    }
    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { githubRepoPaths: updatedMapping })); });
    (0, debug_js_1.logForDebugging)("Removed ".concat(pathToRemove, " from tracked paths for repo ").concat(repoKey));
}
