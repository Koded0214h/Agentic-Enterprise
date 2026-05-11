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
exports.getSnapshotDirForAgent = getSnapshotDirForAgent;
exports.checkAgentMemorySnapshot = checkAgentMemorySnapshot;
exports.initializeFromSnapshot = initializeFromSnapshot;
exports.replaceFromSnapshot = replaceFromSnapshot;
exports.markSnapshotSynced = markSnapshotSynced;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var agentMemory_js_1 = require("./agentMemory.js");
var SNAPSHOT_BASE = 'agent-memory-snapshots';
var SNAPSHOT_JSON = 'snapshot.json';
var SYNCED_JSON = '.snapshot-synced.json';
var snapshotMetaSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        updatedAt: v4_1.z.string().min(1),
    });
});
var syncedMetaSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        syncedFrom: v4_1.z.string().min(1),
    });
});
/**
 * Returns the path to the snapshot directory for an agent in the current project.
 * e.g., <cwd>/.claude/agent-memory-snapshots/<agentType>/
 */
function getSnapshotDirForAgent(agentType) {
    return (0, path_1.join)((0, cwd_js_1.getCwd)(), '.claude', SNAPSHOT_BASE, agentType);
}
function getSnapshotJsonPath(agentType) {
    return (0, path_1.join)(getSnapshotDirForAgent(agentType), SNAPSHOT_JSON);
}
function getSyncedJsonPath(agentType, scope) {
    return (0, path_1.join)((0, agentMemory_js_1.getAgentMemoryDir)(agentType, scope), SYNCED_JSON);
}
function readJsonFile(path, schema) {
    return __awaiter(this, void 0, void 0, function () {
        var content, result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, { encoding: 'utf-8' })];
                case 1:
                    content = _b.sent();
                    result = schema.safeParse((0, slowOperations_js_1.jsonParse)(content));
                    return [2 /*return*/, result.success ? result.data : null];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function copySnapshotToLocal(agentType, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshotMemDir, localMemDir, files, _i, files_1, dirent, content, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    snapshotMemDir = getSnapshotDirForAgent(agentType);
                    localMemDir = (0, agentMemory_js_1.getAgentMemoryDir)(agentType, scope);
                    return [4 /*yield*/, (0, promises_1.mkdir)(localMemDir, { recursive: true })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.readdir)(snapshotMemDir, { withFileTypes: true })];
                case 3:
                    files = _a.sent();
                    _i = 0, files_1 = files;
                    _a.label = 4;
                case 4:
                    if (!(_i < files_1.length)) return [3 /*break*/, 8];
                    dirent = files_1[_i];
                    if (!dirent.isFile() || dirent.name === SNAPSHOT_JSON)
                        return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(snapshotMemDir, dirent.name), {
                            encoding: 'utf-8',
                        })];
                case 5:
                    content = _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)((0, path_1.join)(localMemDir, dirent.name), content)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 4];
                case 8: return [3 /*break*/, 10];
                case 9:
                    e_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to copy snapshot to local agent memory: ".concat(e_1));
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function saveSyncedMeta(agentType, scope, snapshotTimestamp) {
    return __awaiter(this, void 0, void 0, function () {
        var syncedPath, localMemDir, meta, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    syncedPath = getSyncedJsonPath(agentType, scope);
                    localMemDir = (0, agentMemory_js_1.getAgentMemoryDir)(agentType, scope);
                    return [4 /*yield*/, (0, promises_1.mkdir)(localMemDir, { recursive: true })];
                case 1:
                    _a.sent();
                    meta = { syncedFrom: snapshotTimestamp };
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(syncedPath, (0, slowOperations_js_1.jsonStringify)(meta))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to save snapshot sync metadata: ".concat(e_2));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a snapshot exists and whether it's newer than what we last synced.
 */
function checkAgentMemorySnapshot(agentType, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshotMeta, localMemDir, hasLocalMemory, dirents, _a, syncedMeta;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, readJsonFile(getSnapshotJsonPath(agentType), snapshotMetaSchema())];
                case 1:
                    snapshotMeta = _b.sent();
                    if (!snapshotMeta) {
                        return [2 /*return*/, { action: 'none' }];
                    }
                    localMemDir = (0, agentMemory_js_1.getAgentMemoryDir)(agentType, scope);
                    hasLocalMemory = false;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readdir)(localMemDir, { withFileTypes: true })];
                case 3:
                    dirents = _b.sent();
                    hasLocalMemory = dirents.some(function (d) { return d.isFile() && d.name.endsWith('.md'); });
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5:
                    if (!hasLocalMemory) {
                        return [2 /*return*/, { action: 'initialize', snapshotTimestamp: snapshotMeta.updatedAt }];
                    }
                    return [4 /*yield*/, readJsonFile(getSyncedJsonPath(agentType, scope), syncedMetaSchema())];
                case 6:
                    syncedMeta = _b.sent();
                    if (!syncedMeta ||
                        new Date(snapshotMeta.updatedAt) > new Date(syncedMeta.syncedFrom)) {
                        return [2 /*return*/, {
                                action: 'prompt-update',
                                snapshotTimestamp: snapshotMeta.updatedAt,
                            }];
                    }
                    return [2 /*return*/, { action: 'none' }];
            }
        });
    });
}
/**
 * Initialize local agent memory from a snapshot (first-time setup).
 */
function initializeFromSnapshot(agentType, scope, snapshotTimestamp) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("Initializing agent memory for ".concat(agentType, " from project snapshot"));
                    return [4 /*yield*/, copySnapshotToLocal(agentType, scope)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, saveSyncedMeta(agentType, scope, snapshotTimestamp)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Replace local agent memory with the snapshot.
 */
function replaceFromSnapshot(agentType, scope, snapshotTimestamp) {
    return __awaiter(this, void 0, void 0, function () {
        var localMemDir, existing, _i, existing_1, dirent, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("Replacing agent memory for ".concat(agentType, " with project snapshot"));
                    localMemDir = (0, agentMemory_js_1.getAgentMemoryDir)(agentType, scope);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.readdir)(localMemDir, { withFileTypes: true })];
                case 2:
                    existing = _b.sent();
                    _i = 0, existing_1 = existing;
                    _b.label = 3;
                case 3:
                    if (!(_i < existing_1.length)) return [3 /*break*/, 6];
                    dirent = existing_1[_i];
                    if (!(dirent.isFile() && dirent.name.endsWith('.md'))) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, promises_1.unlink)((0, path_1.join)(localMemDir, dirent.name))];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    _a = _b.sent();
                    return [3 /*break*/, 8];
                case 8: return [4 /*yield*/, copySnapshotToLocal(agentType, scope)];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, saveSyncedMeta(agentType, scope, snapshotTimestamp)];
                case 10:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Mark the current snapshot as synced without changing local memory.
 */
function markSnapshotSynced(agentType, scope, snapshotTimestamp) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, saveSyncedMeta(agentType, scope, snapshotTimestamp)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
