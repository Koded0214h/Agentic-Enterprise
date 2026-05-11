"use strict";
/**
 * Minimal module for firing MDM subprocess reads without blocking the event loop.
 * Has minimal imports — only child_process, fs, and mdmConstants (which only imports os).
 *
 * Two usage patterns:
 * 1. Startup: startMdmRawRead() fires at main.tsx module evaluation, results consumed later via getMdmRawReadPromise()
 * 2. Poll/fallback: fireRawRead() creates a fresh read on demand (used by changeDetector and SDK entrypoint)
 *
 * Raw stdout is consumed by mdmSettings.ts via consumeRawReadResult().
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
exports.fireRawRead = fireRawRead;
exports.startMdmRawRead = startMdmRawRead;
exports.getMdmRawReadPromise = getMdmRawReadPromise;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var constants_js_1 = require("./constants.js");
var rawReadPromise = null;
function execFilePromise(cmd, args) {
    return new Promise(function (resolve) {
        (0, child_process_1.execFile)(cmd, args, { encoding: 'utf-8', timeout: constants_js_1.MDM_SUBPROCESS_TIMEOUT_MS }, function (err, stdout) {
            // biome-ignore lint/nursery/noFloatingPromises: resolve() is not a floating promise
            resolve({ stdout: stdout !== null && stdout !== void 0 ? stdout : '', code: err ? 1 : 0 });
        });
    });
}
/**
 * Fire fresh subprocess reads for MDM settings and return raw stdout.
 * On macOS: spawns plutil for each plist path in parallel, picks first winner.
 * On Windows: spawns reg query for HKLM and HKCU in parallel.
 * On Linux: returns empty (no MDM equivalent).
 */
function fireRawRead() {
    var _this = this;
    return (function () { return __awaiter(_this, void 0, void 0, function () {
        var plistPaths, allResults, winner, _a, hklm, hkcu;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(process.platform === 'darwin')) return [3 /*break*/, 2];
                    plistPaths = (0, constants_js_1.getMacOSPlistPaths)();
                    return [4 /*yield*/, Promise.all(plistPaths.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var _c, stdout, code;
                            var path = _b.path, label = _b.label;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        // Fast-path: skip the plutil subprocess if the plist file does not
                                        // exist. Spawning plutil takes ~5ms even for an immediate ENOENT,
                                        // and non-MDM machines never have these files.
                                        // Uses synchronous existsSync to preserve the spawn-during-imports
                                        // invariant: execFilePromise must be the first await so plutil
                                        // spawns before the event loop polls (see main.tsx:3-4).
                                        if (!(0, fs_1.existsSync)(path)) {
                                            return [2 /*return*/, { stdout: '', label: label, ok: false }];
                                        }
                                        return [4 /*yield*/, execFilePromise(constants_js_1.PLUTIL_PATH, __spreadArray(__spreadArray([], constants_js_1.PLUTIL_ARGS_PREFIX, true), [
                                                path,
                                            ], false))];
                                    case 1:
                                        _c = _d.sent(), stdout = _c.stdout, code = _c.code;
                                        return [2 /*return*/, { stdout: stdout, label: label, ok: code === 0 && !!stdout }];
                                }
                            });
                        }); }))
                        // First source wins (array is in priority order)
                    ];
                case 1:
                    allResults = _b.sent();
                    winner = allResults.find(function (r) { return r.ok; });
                    return [2 /*return*/, {
                            plistStdouts: winner
                                ? [{ stdout: winner.stdout, label: winner.label }]
                                : [],
                            hklmStdout: null,
                            hkcuStdout: null,
                        }];
                case 2:
                    if (!(process.platform === 'win32')) return [3 /*break*/, 4];
                    return [4 /*yield*/, Promise.all([
                            execFilePromise('reg', [
                                'query',
                                constants_js_1.WINDOWS_REGISTRY_KEY_PATH_HKLM,
                                '/v',
                                constants_js_1.WINDOWS_REGISTRY_VALUE_NAME,
                            ]),
                            execFilePromise('reg', [
                                'query',
                                constants_js_1.WINDOWS_REGISTRY_KEY_PATH_HKCU,
                                '/v',
                                constants_js_1.WINDOWS_REGISTRY_VALUE_NAME,
                            ]),
                        ])];
                case 3:
                    _a = _b.sent(), hklm = _a[0], hkcu = _a[1];
                    return [2 /*return*/, {
                            plistStdouts: null,
                            hklmStdout: hklm.code === 0 ? hklm.stdout : null,
                            hkcuStdout: hkcu.code === 0 ? hkcu.stdout : null,
                        }];
                case 4: return [2 /*return*/, { plistStdouts: null, hklmStdout: null, hkcuStdout: null }];
            }
        });
    }); })();
}
/**
 * Fire raw subprocess reads once for startup. Called at main.tsx module evaluation.
 * Results are consumed via getMdmRawReadPromise().
 */
function startMdmRawRead() {
    if (rawReadPromise)
        return;
    rawReadPromise = fireRawRead();
}
/**
 * Get the startup promise. Returns null if startMdmRawRead() wasn't called.
 */
function getMdmRawReadPromise() {
    return rawReadPromise;
}
