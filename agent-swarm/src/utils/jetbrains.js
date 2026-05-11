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
exports.isJetBrainsPluginInstalled = isJetBrainsPluginInstalled;
exports.isJetBrainsPluginInstalledCached = isJetBrainsPluginInstalledCached;
exports.isJetBrainsPluginInstalledCachedSync = isJetBrainsPluginInstalledCachedSync;
var os_1 = require("os");
var path_1 = require("path");
var fsOperations_js_1 = require("../utils/fsOperations.js");
var PLUGIN_PREFIX = 'claude-code-jetbrains-plugin';
// Map of IDE names to their directory patterns
var ideNameToDirMap = {
    pycharm: ['PyCharm'],
    intellij: ['IntelliJIdea', 'IdeaIC'],
    webstorm: ['WebStorm'],
    phpstorm: ['PhpStorm'],
    rubymine: ['RubyMine'],
    clion: ['CLion'],
    goland: ['GoLand'],
    rider: ['Rider'],
    datagrip: ['DataGrip'],
    appcode: ['AppCode'],
    dataspell: ['DataSpell'],
    aqua: ['Aqua'],
    gateway: ['Gateway'],
    fleet: ['Fleet'],
    androidstudio: ['AndroidStudio'],
};
// Build plugin directory paths
// https://www.jetbrains.com/help/pycharm/directories-used-by-the-ide-to-store-settings-caches-plugins-and-logs.html#plugins-directory
function buildCommonPluginDirectoryPaths(ideName) {
    var homeDir = (0, os_1.homedir)();
    var directories = [];
    var idePatterns = ideNameToDirMap[ideName.toLowerCase()];
    if (!idePatterns) {
        return directories;
    }
    var appData = process.env.APPDATA || (0, path_1.join)(homeDir, 'AppData', 'Roaming');
    var localAppData = process.env.LOCALAPPDATA || (0, path_1.join)(homeDir, 'AppData', 'Local');
    switch ((0, os_1.platform)()) {
        case 'darwin':
            directories.push((0, path_1.join)(homeDir, 'Library', 'Application Support', 'JetBrains'), (0, path_1.join)(homeDir, 'Library', 'Application Support'));
            if (ideName.toLowerCase() === 'androidstudio') {
                directories.push((0, path_1.join)(homeDir, 'Library', 'Application Support', 'Google'));
            }
            break;
        case 'win32':
            directories.push((0, path_1.join)(appData, 'JetBrains'), (0, path_1.join)(localAppData, 'JetBrains'), (0, path_1.join)(appData));
            if (ideName.toLowerCase() === 'androidstudio') {
                directories.push((0, path_1.join)(localAppData, 'Google'));
            }
            break;
        case 'linux':
            directories.push((0, path_1.join)(homeDir, '.config', 'JetBrains'), (0, path_1.join)(homeDir, '.local', 'share', 'JetBrains'));
            for (var _i = 0, idePatterns_1 = idePatterns; _i < idePatterns_1.length; _i++) {
                var pattern = idePatterns_1[_i];
                directories.push((0, path_1.join)(homeDir, '.' + pattern));
            }
            if (ideName.toLowerCase() === 'androidstudio') {
                directories.push((0, path_1.join)(homeDir, '.config', 'Google'));
            }
            break;
        default:
            break;
    }
    return directories;
}
// Find all actual plugin directories that exist
function detectPluginDirectories(ideName) {
    return __awaiter(this, void 0, void 0, function () {
        var foundDirectories, fs, pluginDirPaths, idePatterns, regexes, _i, pluginDirPaths_1, baseDir, entries, _a, regexes_1, regex, _b, entries_1, entry, dir, pluginDir, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    foundDirectories = [];
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    pluginDirPaths = buildCommonPluginDirectoryPaths(ideName);
                    idePatterns = ideNameToDirMap[ideName.toLowerCase()];
                    if (!idePatterns) {
                        return [2 /*return*/, foundDirectories];
                    }
                    regexes = idePatterns.map(function (p) { return new RegExp('^' + p); });
                    _i = 0, pluginDirPaths_1 = pluginDirPaths;
                    _e.label = 1;
                case 1:
                    if (!(_i < pluginDirPaths_1.length)) return [3 /*break*/, 14];
                    baseDir = pluginDirPaths_1[_i];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 12, , 13]);
                    return [4 /*yield*/, fs.readdir(baseDir)];
                case 3:
                    entries = _e.sent();
                    _a = 0, regexes_1 = regexes;
                    _e.label = 4;
                case 4:
                    if (!(_a < regexes_1.length)) return [3 /*break*/, 11];
                    regex = regexes_1[_a];
                    _b = 0, entries_1 = entries;
                    _e.label = 5;
                case 5:
                    if (!(_b < entries_1.length)) return [3 /*break*/, 10];
                    entry = entries_1[_b];
                    if (!regex.test(entry.name))
                        return [3 /*break*/, 9];
                    // Accept symlinks too — dirent.isDirectory() is false for symlinks,
                    // but GNU stow users symlink their JetBrains config dirs. Downstream
                    // fs.stat() calls will filter out symlinks that don't point to dirs.
                    if (!entry.isDirectory() && !entry.isSymbolicLink())
                        return [3 /*break*/, 9];
                    dir = (0, path_1.join)(baseDir, entry.name);
                    // Linux is the only OS to not have a plugins directory
                    if ((0, os_1.platform)() === 'linux') {
                        foundDirectories.push(dir);
                        return [3 /*break*/, 9];
                    }
                    pluginDir = (0, path_1.join)(dir, 'plugins');
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, fs.stat(pluginDir)];
                case 7:
                    _e.sent();
                    foundDirectories.push(pluginDir);
                    return [3 /*break*/, 9];
                case 8:
                    _c = _e.sent();
                    return [3 /*break*/, 9];
                case 9:
                    _b++;
                    return [3 /*break*/, 5];
                case 10:
                    _a++;
                    return [3 /*break*/, 4];
                case 11: return [3 /*break*/, 13];
                case 12:
                    _d = _e.sent();
                    // Ignore errors from stale IDE directories (ENOENT, EACCES, etc.)
                    return [3 /*break*/, 13];
                case 13:
                    _i++;
                    return [3 /*break*/, 1];
                case 14: return [2 /*return*/, foundDirectories.filter(function (dir, index) { return foundDirectories.indexOf(dir) === index; })];
            }
        });
    });
}
function isJetBrainsPluginInstalled(ideType) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginDirs, _i, pluginDirs_1, dir, pluginPath, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, detectPluginDirectories(ideType)];
                case 1:
                    pluginDirs = _b.sent();
                    _i = 0, pluginDirs_1 = pluginDirs;
                    _b.label = 2;
                case 2:
                    if (!(_i < pluginDirs_1.length)) return [3 /*break*/, 7];
                    dir = pluginDirs_1[_i];
                    pluginPath = (0, path_1.join)(dir, PLUGIN_PREFIX);
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().stat(pluginPath)];
                case 4:
                    _b.sent();
                    return [2 /*return*/, true];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, false];
            }
        });
    });
}
var pluginInstalledCache = new Map();
var pluginInstalledPromiseCache = new Map();
function isJetBrainsPluginInstalledMemoized(ideType_1) {
    return __awaiter(this, arguments, void 0, function (ideType, forceRefresh) {
        var existing, promise;
        if (forceRefresh === void 0) { forceRefresh = false; }
        return __generator(this, function (_a) {
            if (!forceRefresh) {
                existing = pluginInstalledPromiseCache.get(ideType);
                if (existing) {
                    return [2 /*return*/, existing];
                }
            }
            promise = isJetBrainsPluginInstalled(ideType).then(function (result) {
                pluginInstalledCache.set(ideType, result);
                return result;
            });
            pluginInstalledPromiseCache.set(ideType, promise);
            return [2 /*return*/, promise];
        });
    });
}
function isJetBrainsPluginInstalledCached(ideType_1) {
    return __awaiter(this, arguments, void 0, function (ideType, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        return __generator(this, function (_a) {
            if (forceRefresh) {
                pluginInstalledCache.delete(ideType);
                pluginInstalledPromiseCache.delete(ideType);
            }
            return [2 /*return*/, isJetBrainsPluginInstalledMemoized(ideType, forceRefresh)];
        });
    });
}
/**
 * Returns the cached result of isJetBrainsPluginInstalled synchronously.
 * Returns false if the result hasn't been resolved yet.
 * Use this only in sync contexts (e.g., status notice isActive checks).
 */
function isJetBrainsPluginInstalledCachedSync(ideType) {
    var _a;
    return (_a = pluginInstalledCache.get(ideType)) !== null && _a !== void 0 ? _a : false;
}
