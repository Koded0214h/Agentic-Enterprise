"use strict";
/**
 * Outputs directory scanner for file persistence
 *
 * This module provides utilities to:
 * - Detect the session type from environment variables
 * - Capture turn start timestamp
 * - Find modified files by comparing file mtimes against turn start time
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = logDebug;
exports.getEnvironmentKind = getEnvironmentKind;
exports.findModifiedFiles = findModifiedFiles;
var fs = require("fs/promises");
var path = require("path");
var debug_js_1 = require("../debug.js");
/** Shared debug logger for file persistence modules */
function logDebug(message) {
    (0, debug_js_1.logForDebugging)("[file-persistence] ".concat(message));
}
/**
 * Get the environment kind from CLAUDE_CODE_ENVIRONMENT_KIND.
 * Returns null if not set or not a recognized value.
 */
function getEnvironmentKind() {
    var kind = process.env.CLAUDE_CODE_ENVIRONMENT_KIND;
    if (kind === 'byoc' || kind === 'anthropic_cloud') {
        return kind;
    }
    return null;
}
function hasParentPath(entry) {
    return 'parentPath' in entry && typeof entry.parentPath === 'string';
}
function hasPath(entry) {
    return 'path' in entry && typeof entry.path === 'string';
}
function getEntryParentPath(entry, fallback) {
    if (hasParentPath(entry)) {
        return entry.parentPath;
    }
    if (hasPath(entry)) {
        return entry.path;
    }
    return fallback;
}
/**
 * Find files that have been modified since the turn started.
 * Returns paths of files with mtime >= turnStartTime.
 *
 * Uses recursive directory listing and parallelized stat calls for efficiency.
 *
 * @param turnStartTime - The timestamp when the turn started
 * @param outputsDir - The directory to scan for modified files
 */
function findModifiedFiles(turnStartTime, outputsDir) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, _a, filePaths, _i, entries_1, entry, parentPath, statResults, modifiedFiles, _b, statResults_1, result;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.readdir(outputsDir, {
                            withFileTypes: true,
                            recursive: true,
                        })];
                case 1:
                    entries = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _c.sent();
                    // Directory doesn't exist or is not accessible
                    return [2 /*return*/, []];
                case 3:
                    filePaths = [];
                    for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                        entry = entries_1[_i];
                        if (entry.isSymbolicLink()) {
                            continue;
                        }
                        if (entry.isFile()) {
                            parentPath = getEntryParentPath(entry, outputsDir);
                            filePaths.push(path.join(parentPath, entry.name));
                        }
                    }
                    if (filePaths.length === 0) {
                        logDebug('No files found in outputs directory');
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, Promise.all(filePaths.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var stat, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, fs.lstat(filePath)
                                            // Skip if it became a symlink between readdir and stat (race condition)
                                        ];
                                    case 1:
                                        stat = _b.sent();
                                        // Skip if it became a symlink between readdir and stat (race condition)
                                        if (stat.isSymbolicLink()) {
                                            return [2 /*return*/, null];
                                        }
                                        return [2 /*return*/, { filePath: filePath, mtimeMs: stat.mtimeMs }];
                                    case 2:
                                        _a = _b.sent();
                                        // File may have been deleted between readdir and stat
                                        return [2 /*return*/, null];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))
                        // Filter to files modified since turn start
                    ];
                case 4:
                    statResults = _c.sent();
                    modifiedFiles = [];
                    for (_b = 0, statResults_1 = statResults; _b < statResults_1.length; _b++) {
                        result = statResults_1[_b];
                        if (result && result.mtimeMs >= turnStartTime) {
                            modifiedFiles.push(result.filePath);
                        }
                    }
                    logDebug("Found ".concat(modifiedFiles.length, " modified files since turn start (scanned ").concat(filePaths.length, " total)"));
                    return [2 /*return*/, modifiedFiles];
            }
        });
    });
}
