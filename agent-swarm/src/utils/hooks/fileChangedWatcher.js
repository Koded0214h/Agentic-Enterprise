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
exports.setEnvHookNotifier = setEnvHookNotifier;
exports.initializeFileChangedWatcher = initializeFileChangedWatcher;
exports.updateWatchPaths = updateWatchPaths;
exports.onCwdChangedForHooks = onCwdChangedForHooks;
exports.resetFileChangedWatcherForTesting = resetFileChangedWatcherForTesting;
var chokidar_1 = require("chokidar");
var path_1 = require("path");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var hooks_js_1 = require("../hooks.js");
var sessionEnvironment_js_1 = require("../sessionEnvironment.js");
var hooksConfigSnapshot_js_1 = require("./hooksConfigSnapshot.js");
var watcher = null;
var currentCwd;
var dynamicWatchPaths = [];
var dynamicWatchPathsSorted = [];
var initialized = false;
var hasEnvHooks = false;
var notifyCallback = null;
function setEnvHookNotifier(cb) {
    notifyCallback = cb;
}
function initializeFileChangedWatcher(cwd) {
    var _this = this;
    var _a, _b, _c, _d;
    if (initialized)
        return;
    initialized = true;
    currentCwd = cwd;
    var config = (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)();
    hasEnvHooks =
        ((_b = (_a = config === null || config === void 0 ? void 0 : config.CwdChanged) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0 ||
            ((_d = (_c = config === null || config === void 0 ? void 0 : config.FileChanged) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0;
    if (hasEnvHooks) {
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, dispose()];
        }); }); });
    }
    var paths = resolveWatchPaths(config);
    if (paths.length === 0)
        return;
    startWatching(paths);
}
function resolveWatchPaths(config) {
    var _a, _b;
    var matchers = (_b = (_a = (config !== null && config !== void 0 ? config : (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)())) === null || _a === void 0 ? void 0 : _a.FileChanged) !== null && _b !== void 0 ? _b : [];
    // Matcher field: filenames to watch in cwd, pipe-separated (e.g. ".envrc|.env")
    var staticPaths = [];
    for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
        var m = matchers_1[_i];
        if (!m.matcher)
            continue;
        for (var _c = 0, _d = m.matcher.split('|').map(function (s) { return s.trim(); }); _c < _d.length; _c++) {
            var name_1 = _d[_c];
            if (!name_1)
                continue;
            staticPaths.push((0, path_1.isAbsolute)(name_1) ? name_1 : (0, path_1.join)(currentCwd, name_1));
        }
    }
    // Combine static matcher paths with dynamic paths from hook output
    return __spreadArray([], new Set(__spreadArray(__spreadArray([], staticPaths, true), dynamicWatchPaths, true)), true);
}
function startWatching(paths) {
    (0, debug_js_1.logForDebugging)("FileChanged: watching ".concat(paths.length, " paths"));
    watcher = chokidar_1.default.watch(paths, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 200 },
        ignorePermissionErrors: true,
    });
    watcher.on('change', function (p) { return handleFileEvent(p, 'change'); });
    watcher.on('add', function (p) { return handleFileEvent(p, 'add'); });
    watcher.on('unlink', function (p) { return handleFileEvent(p, 'unlink'); });
}
function handleFileEvent(path, event) {
    (0, debug_js_1.logForDebugging)("FileChanged: ".concat(event, " ").concat(path));
    void (0, hooks_js_1.executeFileChangedHooks)(path, event)
        .then(function (_a) {
        var results = _a.results, watchPaths = _a.watchPaths, systemMessages = _a.systemMessages;
        if (watchPaths.length > 0) {
            updateWatchPaths(watchPaths);
        }
        for (var _i = 0, systemMessages_1 = systemMessages; _i < systemMessages_1.length; _i++) {
            var msg = systemMessages_1[_i];
            notifyCallback === null || notifyCallback === void 0 ? void 0 : notifyCallback(msg, false);
        }
        for (var _b = 0, results_1 = results; _b < results_1.length; _b++) {
            var r = results_1[_b];
            if (!r.succeeded && r.output) {
                notifyCallback === null || notifyCallback === void 0 ? void 0 : notifyCallback(r.output, true);
            }
        }
    })
        .catch(function (e) {
        var msg = (0, errors_js_1.errorMessage)(e);
        (0, debug_js_1.logForDebugging)("FileChanged hook failed: ".concat(msg), {
            level: 'error',
        });
        notifyCallback === null || notifyCallback === void 0 ? void 0 : notifyCallback(msg, true);
    });
}
function updateWatchPaths(paths) {
    if (!initialized)
        return;
    var sorted = paths.slice().sort();
    if (sorted.length === dynamicWatchPathsSorted.length &&
        sorted.every(function (p, i) { return p === dynamicWatchPathsSorted[i]; })) {
        return;
    }
    dynamicWatchPaths = paths;
    dynamicWatchPathsSorted = sorted;
    restartWatching();
}
function restartWatching() {
    if (watcher) {
        void watcher.close();
        watcher = null;
    }
    var paths = resolveWatchPaths();
    if (paths.length > 0) {
        startWatching(paths);
    }
}
function onCwdChangedForHooks(oldCwd, newCwd) {
    return __awaiter(this, void 0, void 0, function () {
        var config, currentHasEnvHooks, hookResult, _i, _a, msg, _b, _c, r;
        var _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (oldCwd === newCwd)
                        return [2 /*return*/];
                    config = (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)();
                    currentHasEnvHooks = ((_e = (_d = config === null || config === void 0 ? void 0 : config.CwdChanged) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 0 ||
                        ((_g = (_f = config === null || config === void 0 ? void 0 : config.FileChanged) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 0) > 0;
                    if (!currentHasEnvHooks)
                        return [2 /*return*/];
                    currentCwd = newCwd;
                    return [4 /*yield*/, (0, sessionEnvironment_js_1.clearCwdEnvFiles)()];
                case 1:
                    _h.sent();
                    return [4 /*yield*/, (0, hooks_js_1.executeCwdChangedHooks)(oldCwd, newCwd).catch(function (e) {
                            var msg = (0, errors_js_1.errorMessage)(e);
                            (0, debug_js_1.logForDebugging)("CwdChanged hook failed: ".concat(msg), {
                                level: 'error',
                            });
                            notifyCallback === null || notifyCallback === void 0 ? void 0 : notifyCallback(msg, true);
                            return {
                                results: [],
                                watchPaths: [],
                                systemMessages: [],
                            };
                        })];
                case 2:
                    hookResult = _h.sent();
                    dynamicWatchPaths = hookResult.watchPaths;
                    dynamicWatchPathsSorted = hookResult.watchPaths.slice().sort();
                    for (_i = 0, _a = hookResult.systemMessages; _i < _a.length; _i++) {
                        msg = _a[_i];
                        notifyCallback === null || notifyCallback === void 0 ? void 0 : notifyCallback(msg, false);
                    }
                    for (_b = 0, _c = hookResult.results; _b < _c.length; _b++) {
                        r = _c[_b];
                        if (!r.succeeded && r.output) {
                            notifyCallback === null || notifyCallback === void 0 ? void 0 : notifyCallback(r.output, true);
                        }
                    }
                    // Re-resolve matcher paths against the new cwd
                    if (initialized) {
                        restartWatching();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function dispose() {
    if (watcher) {
        void watcher.close();
        watcher = null;
    }
    dynamicWatchPaths = [];
    dynamicWatchPathsSorted = [];
    initialized = false;
    hasEnvHooks = false;
    notifyCallback = null;
}
function resetFileChangedWatcherForTesting() {
    dispose();
}
