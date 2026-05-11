"use strict";
/**
 * Synchronized Permission Prompts for Agent Swarms
 *
 * This module provides infrastructure for coordinating permission prompts across
 * multiple agents in a swarm. When a worker agent needs permission for a tool use,
 * it can forward the request to the team leader, who can then approve or deny it.
 *
 * The system uses the teammate mailbox for message passing:
 * - Workers send permission requests to the leader's mailbox
 * - Leaders send permission responses to the worker's mailbox
 *
 * Flow:
 * 1. Worker agent encounters a permission prompt
 * 2. Worker sends a permission_request message to the leader's mailbox
 * 3. Leader polls for mailbox messages and detects permission requests
 * 4. User approves/denies via the leader's UI
 * 5. Leader sends a permission_response message to the worker's mailbox
 * 6. Worker polls mailbox for responses and continues execution
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPermissionRequest = exports.SwarmPermissionRequestSchema = void 0;
exports.getPermissionDir = getPermissionDir;
exports.generateRequestId = generateRequestId;
exports.createPermissionRequest = createPermissionRequest;
exports.writePermissionRequest = writePermissionRequest;
exports.readPendingPermissions = readPendingPermissions;
exports.readResolvedPermission = readResolvedPermission;
exports.resolvePermission = resolvePermission;
exports.cleanupOldResolutions = cleanupOldResolutions;
exports.pollForResponse = pollForResponse;
exports.removeWorkerResponse = removeWorkerResponse;
exports.isTeamLeader = isTeamLeader;
exports.isSwarmWorker = isSwarmWorker;
exports.deleteResolvedPermission = deleteResolvedPermission;
exports.getLeaderName = getLeaderName;
exports.sendPermissionRequestViaMailbox = sendPermissionRequestViaMailbox;
exports.sendPermissionResponseViaMailbox = sendPermissionResponseViaMailbox;
exports.generateSandboxRequestId = generateSandboxRequestId;
exports.sendSandboxPermissionRequestViaMailbox = sendSandboxPermissionRequestViaMailbox;
exports.sendSandboxPermissionResponseViaMailbox = sendSandboxPermissionResponseViaMailbox;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var lazySchema_js_1 = require("../lazySchema.js");
var lockfile = require("../lockfile.js");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
var teammate_js_1 = require("../teammate.js");
var teammateMailbox_js_1 = require("../teammateMailbox.js");
var teamHelpers_js_1 = require("./teamHelpers.js");
/**
 * Full request schema for a permission request from a worker to the leader
 */
exports.SwarmPermissionRequestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        /** Unique identifier for this request */
        id: v4_1.z.string(),
        /** Worker's CLAUDE_CODE_AGENT_ID */
        workerId: v4_1.z.string(),
        /** Worker's CLAUDE_CODE_AGENT_NAME */
        workerName: v4_1.z.string(),
        /** Worker's CLAUDE_CODE_AGENT_COLOR */
        workerColor: v4_1.z.string().optional(),
        /** Team name for routing */
        teamName: v4_1.z.string(),
        /** Tool name requiring permission (e.g., "Bash", "Edit") */
        toolName: v4_1.z.string(),
        /** Original toolUseID from worker's context */
        toolUseId: v4_1.z.string(),
        /** Human-readable description of the tool use */
        description: v4_1.z.string(),
        /** Serialized tool input */
        input: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
        /** Suggested permission rules from the permission result */
        permissionSuggestions: v4_1.z.array(v4_1.z.unknown()),
        /** Status of the request */
        status: v4_1.z.enum(['pending', 'approved', 'rejected']),
        /** Who resolved the request */
        resolvedBy: v4_1.z.enum(['worker', 'leader']).optional(),
        /** Timestamp when resolved */
        resolvedAt: v4_1.z.number().optional(),
        /** Rejection feedback message */
        feedback: v4_1.z.string().optional(),
        /** Modified input if changed by resolver */
        updatedInput: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(),
        /** "Always allow" rules applied during resolution */
        permissionUpdates: v4_1.z.array(v4_1.z.unknown()).optional(),
        /** Timestamp when request was created */
        createdAt: v4_1.z.number(),
    });
});
/**
 * Get the base directory for a team's permission requests
 * Path: ~/.claude/teams/{teamName}/permissions/
 */
function getPermissionDir(teamName) {
    return (0, path_1.join)((0, teamHelpers_js_1.getTeamDir)(teamName), 'permissions');
}
/**
 * Get the pending directory for a team
 */
function getPendingDir(teamName) {
    return (0, path_1.join)(getPermissionDir(teamName), 'pending');
}
/**
 * Get the resolved directory for a team
 */
function getResolvedDir(teamName) {
    return (0, path_1.join)(getPermissionDir(teamName), 'resolved');
}
/**
 * Ensure the permissions directory structure exists (async)
 */
function ensurePermissionDirsAsync(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var permDir, pendingDir, resolvedDir, _i, _a, dir;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    permDir = getPermissionDir(teamName);
                    pendingDir = getPendingDir(teamName);
                    resolvedDir = getResolvedDir(teamName);
                    _i = 0, _a = [permDir, pendingDir, resolvedDir];
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    dir = _a[_i];
                    return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the path to a pending request file
 */
function getPendingRequestPath(teamName, requestId) {
    return (0, path_1.join)(getPendingDir(teamName), "".concat(requestId, ".json"));
}
/**
 * Get the path to a resolved request file
 */
function getResolvedRequestPath(teamName, requestId) {
    return (0, path_1.join)(getResolvedDir(teamName), "".concat(requestId, ".json"));
}
/**
 * Generate a unique request ID
 */
function generateRequestId() {
    return "perm-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
}
/**
 * Create a new SwarmPermissionRequest object
 */
function createPermissionRequest(params) {
    var teamName = params.teamName || (0, teammate_js_1.getTeamName)();
    var workerId = params.workerId || (0, teammate_js_1.getAgentId)();
    var workerName = params.workerName || (0, teammate_js_1.getAgentName)();
    var workerColor = params.workerColor || (0, teammate_js_1.getTeammateColor)();
    if (!teamName) {
        throw new Error('Team name is required for permission requests');
    }
    if (!workerId) {
        throw new Error('Worker ID is required for permission requests');
    }
    if (!workerName) {
        throw new Error('Worker name is required for permission requests');
    }
    return {
        id: generateRequestId(),
        workerId: workerId,
        workerName: workerName,
        workerColor: workerColor,
        teamName: teamName,
        toolName: params.toolName,
        toolUseId: params.toolUseId,
        description: params.description,
        input: params.input,
        permissionSuggestions: params.permissionSuggestions || [],
        status: 'pending',
        createdAt: Date.now(),
    };
}
/**
 * Write a permission request to the pending directory with file locking
 * Called by worker agents when they need permission approval from the leader
 *
 * @returns The written request
 */
function writePermissionRequest(request) {
    return __awaiter(this, void 0, void 0, function () {
        var pendingPath, lockDir, lockFilePath, release, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensurePermissionDirsAsync(request.teamName)];
                case 1:
                    _a.sent();
                    pendingPath = getPendingRequestPath(request.teamName, request.id);
                    lockDir = getPendingDir(request.teamName);
                    lockFilePath = (0, path_1.join)(lockDir, '.lock');
                    return [4 /*yield*/, (0, promises_1.writeFile)(lockFilePath, '', 'utf-8')];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, 7, 10]);
                    return [4 /*yield*/, lockfile.lock(lockFilePath)
                        // Write the request file
                    ];
                case 4:
                    release = _a.sent();
                    // Write the request file
                    return [4 /*yield*/, (0, promises_1.writeFile)(pendingPath, (0, slowOperations_js_1.jsonStringify)(request, null, 2), 'utf-8')];
                case 5:
                    // Write the request file
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Wrote pending request ".concat(request.id, " from ").concat(request.workerName, " for ").concat(request.toolName));
                    return [2 /*return*/, request];
                case 6:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to write permission request: ".concat(error_1));
                    (0, log_js_1.logError)(error_1);
                    throw error_1;
                case 7:
                    if (!release) return [3 /*break*/, 9];
                    return [4 /*yield*/, release()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read all pending permission requests for a team
 * Called by the team leader to see what requests need attention
 */
function readPendingPermissions(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, pendingDir, files, e_1, code, jsonFiles, results, requests;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        (0, debug_js_1.logForDebugging)('[PermissionSync] No team name available');
                        return [2 /*return*/, []];
                    }
                    pendingDir = getPendingDir(team);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(pendingDir)];
                case 2:
                    files = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, []];
                    }
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to read pending requests: ".concat(e_1));
                    (0, log_js_1.logError)(e_1);
                    return [2 /*return*/, []];
                case 4:
                    jsonFiles = files.filter(function (f) { return f.endsWith('.json') && f !== '.lock'; });
                    return [4 /*yield*/, Promise.all(jsonFiles.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var filePath, content, parsed, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        filePath = (0, path_1.join)(pendingDir, file);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                                    case 2:
                                        content = _a.sent();
                                        parsed = (0, exports.SwarmPermissionRequestSchema)().safeParse((0, slowOperations_js_1.jsonParse)(content));
                                        if (parsed.success) {
                                            return [2 /*return*/, parsed.data];
                                        }
                                        (0, debug_js_1.logForDebugging)("[PermissionSync] Invalid request file ".concat(file, ": ").concat(parsed.error.message));
                                        return [2 /*return*/, null];
                                    case 3:
                                        err_1 = _a.sent();
                                        (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to read request file ".concat(file, ": ").concat(err_1));
                                        return [2 /*return*/, null];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 5:
                    results = _a.sent();
                    requests = results.filter(function (r) { return r !== null; });
                    // Sort by creation time (oldest first)
                    requests.sort(function (a, b) { return a.createdAt - b.createdAt; });
                    return [2 /*return*/, requests];
            }
        });
    });
}
/**
 * Read a resolved permission request by ID
 * Called by workers to check if their request has been resolved
 *
 * @returns The resolved request, or null if not yet resolved
 */
function readResolvedPermission(requestId, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, resolvedPath, content, parsed, e_2, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        return [2 /*return*/, null];
                    }
                    resolvedPath = getResolvedRequestPath(team, requestId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(resolvedPath, 'utf-8')];
                case 2:
                    content = _a.sent();
                    parsed = (0, exports.SwarmPermissionRequestSchema)().safeParse((0, slowOperations_js_1.jsonParse)(content));
                    if (parsed.success) {
                        return [2 /*return*/, parsed.data];
                    }
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Invalid resolved request ".concat(requestId, ": ").concat(parsed.error.message));
                    return [2 /*return*/, null];
                case 3:
                    e_2 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to read resolved request ".concat(requestId, ": ").concat(e_2));
                    (0, log_js_1.logError)(e_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resolve a permission request
 * Called by the team leader (or worker in self-resolution cases)
 *
 * Writes the resolution to resolved/, removes from pending/
 */
function resolvePermission(requestId, resolution, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, pendingPath, resolvedPath, lockFilePath, release, content, e_3, code, parsed, request, resolvedRequest, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        (0, debug_js_1.logForDebugging)('[PermissionSync] No team name available');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, ensurePermissionDirsAsync(team)];
                case 1:
                    _a.sent();
                    pendingPath = getPendingRequestPath(team, requestId);
                    resolvedPath = getResolvedRequestPath(team, requestId);
                    lockFilePath = (0, path_1.join)(getPendingDir(team), '.lock');
                    return [4 /*yield*/, (0, promises_1.writeFile)(lockFilePath, '', 'utf-8')];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 11, 12, 15]);
                    return [4 /*yield*/, lockfile.lock(lockFilePath)
                        // Read the pending request
                    ];
                case 4:
                    release = _a.sent();
                    content = void 0;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.readFile)(pendingPath, 'utf-8')];
                case 6:
                    content = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_3 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_3);
                    if (code === 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Pending request not found: ".concat(requestId));
                        return [2 /*return*/, false];
                    }
                    throw e_3;
                case 8:
                    parsed = (0, exports.SwarmPermissionRequestSchema)().safeParse((0, slowOperations_js_1.jsonParse)(content));
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Invalid pending request ".concat(requestId, ": ").concat(parsed.error.message));
                        return [2 /*return*/, false];
                    }
                    request = parsed.data;
                    resolvedRequest = __assign(__assign({}, request), { status: resolution.decision === 'approved' ? 'approved' : 'rejected', resolvedBy: resolution.resolvedBy, resolvedAt: Date.now(), feedback: resolution.feedback, updatedInput: resolution.updatedInput, permissionUpdates: resolution.permissionUpdates });
                    // Write to resolved directory
                    return [4 /*yield*/, (0, promises_1.writeFile)(resolvedPath, (0, slowOperations_js_1.jsonStringify)(resolvedRequest, null, 2), 'utf-8')
                        // Remove from pending directory
                    ];
                case 9:
                    // Write to resolved directory
                    _a.sent();
                    // Remove from pending directory
                    return [4 /*yield*/, (0, promises_1.unlink)(pendingPath)];
                case 10:
                    // Remove from pending directory
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Resolved request ".concat(requestId, " with ").concat(resolution.decision));
                    return [2 /*return*/, true];
                case 11:
                    error_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to resolve request: ".concat(error_2));
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, false];
                case 12:
                    if (!release) return [3 /*break*/, 14];
                    return [4 /*yield*/, release()];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up old resolved permission files
 * Called periodically to prevent file accumulation
 *
 * @param teamName - Team name
 * @param maxAgeMs - Maximum age in milliseconds (default: 1 hour)
 */
function cleanupOldResolutions(teamName_1) {
    return __awaiter(this, arguments, void 0, function (teamName, maxAgeMs) {
        var team, resolvedDir, files, e_4, code, now, jsonFiles, cleanupResults, cleanedCount;
        var _this = this;
        if (maxAgeMs === void 0) { maxAgeMs = 3600000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        return [2 /*return*/, 0];
                    }
                    resolvedDir = getResolvedDir(team);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(resolvedDir)];
                case 2:
                    files = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_4);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, 0];
                    }
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to cleanup resolutions: ".concat(e_4));
                    (0, log_js_1.logError)(e_4);
                    return [2 /*return*/, 0];
                case 4:
                    now = Date.now();
                    jsonFiles = files.filter(function (f) { return f.endsWith('.json'); });
                    return [4 /*yield*/, Promise.all(jsonFiles.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var filePath, content, request, resolvedAt, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        filePath = (0, path_1.join)(resolvedDir, file);
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 5, , 10]);
                                        return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                                    case 2:
                                        content = _c.sent();
                                        request = (0, slowOperations_js_1.jsonParse)(content);
                                        resolvedAt = request.resolvedAt || request.createdAt;
                                        if (!(now - resolvedAt >= maxAgeMs)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                                    case 3:
                                        _c.sent();
                                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cleaned up old resolution: ".concat(file));
                                        return [2 /*return*/, 1];
                                    case 4: return [2 /*return*/, 0];
                                    case 5:
                                        _a = _c.sent();
                                        _c.label = 6;
                                    case 6:
                                        _c.trys.push([6, 8, , 9]);
                                        return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                                    case 7:
                                        _c.sent();
                                        return [2 /*return*/, 1];
                                    case 8:
                                        _b = _c.sent();
                                        // Ignore deletion errors
                                        return [2 /*return*/, 0];
                                    case 9: return [3 /*break*/, 10];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 5:
                    cleanupResults = _a.sent();
                    cleanedCount = cleanupResults.reduce(function (sum, n) { return sum + n; }, 0);
                    if (cleanedCount > 0) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cleaned up ".concat(cleanedCount, " old resolutions"));
                    }
                    return [2 /*return*/, cleanedCount];
            }
        });
    });
}
/**
 * Poll for a permission response (worker-side convenience function)
 * Converts the resolved request into a simpler response format
 *
 * @returns The permission response, or null if not yet resolved
 */
function pollForResponse(requestId, _agentName, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var resolved;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readResolvedPermission(requestId, teamName)];
                case 1:
                    resolved = _a.sent();
                    if (!resolved) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            requestId: resolved.id,
                            decision: resolved.status === 'approved' ? 'approved' : 'denied',
                            timestamp: resolved.resolvedAt
                                ? new Date(resolved.resolvedAt).toISOString()
                                : new Date(resolved.createdAt).toISOString(),
                            feedback: resolved.feedback,
                            updatedInput: resolved.updatedInput,
                            permissionUpdates: resolved.permissionUpdates,
                        }];
            }
        });
    });
}
/**
 * Remove a worker's response after processing
 * This is an alias for deleteResolvedPermission for backward compatibility
 */
function removeWorkerResponse(requestId, _agentName, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, deleteResolvedPermission(requestId, teamName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if the current agent is a team leader
 */
function isTeamLeader(teamName) {
    var team = teamName || (0, teammate_js_1.getTeamName)();
    if (!team) {
        return false;
    }
    // Team leaders don't have an agent ID set, or their ID is 'team-lead'
    var agentId = (0, teammate_js_1.getAgentId)();
    return !agentId || agentId === 'team-lead';
}
/**
 * Check if the current agent is a worker in a swarm
 */
function isSwarmWorker() {
    var teamName = (0, teammate_js_1.getTeamName)();
    var agentId = (0, teammate_js_1.getAgentId)();
    return !!teamName && !!agentId && !isTeamLeader();
}
/**
 * Delete a resolved permission file
 * Called after a worker has processed the resolution
 */
function deleteResolvedPermission(requestId, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, resolvedPath, e_5, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        return [2 /*return*/, false];
                    }
                    resolvedPath = getResolvedRequestPath(team, requestId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(resolvedPath)];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Deleted resolved permission: ".concat(requestId));
                    return [2 /*return*/, true];
                case 3:
                    e_5 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_5);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, false];
                    }
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to delete resolved permission: ".concat(e_5));
                    (0, log_js_1.logError)(e_5);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Submit a permission request (alias for writePermissionRequest)
 * Provided for backward compatibility with worker integration code
 */
exports.submitPermissionRequest = writePermissionRequest;
// ============================================================================
// Mailbox-Based Permission System
// ============================================================================
/**
 * Get the leader's name from the team file
 * This is needed to send permission requests to the leader's mailbox
 */
function getLeaderName(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, teamFile, leadMember;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, teamHelpers_js_1.readTeamFileAsync)(team)];
                case 1:
                    teamFile = _a.sent();
                    if (!teamFile) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Team file not found for team: ".concat(team));
                        return [2 /*return*/, null];
                    }
                    leadMember = teamFile.members.find(function (m) { return m.agentId === teamFile.leadAgentId; });
                    return [2 /*return*/, (leadMember === null || leadMember === void 0 ? void 0 : leadMember.name) || 'team-lead'];
            }
        });
    });
}
/**
 * Send a permission request to the leader via mailbox.
 * This is the new mailbox-based approach that replaces the file-based pending directory.
 *
 * @param request - The permission request to send
 * @returns true if the message was sent successfully
 */
function sendPermissionRequestViaMailbox(request) {
    return __awaiter(this, void 0, void 0, function () {
        var leaderName, message, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getLeaderName(request.teamName)];
                case 1:
                    leaderName = _a.sent();
                    if (!leaderName) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cannot send permission request: leader name not found");
                        return [2 /*return*/, false];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    message = (0, teammateMailbox_js_1.createPermissionRequestMessage)({
                        request_id: request.id,
                        agent_id: request.workerName,
                        tool_name: request.toolName,
                        tool_use_id: request.toolUseId,
                        description: request.description,
                        input: request.input,
                        permission_suggestions: request.permissionSuggestions,
                    });
                    // Send to leader's mailbox (routes to in-process or file-based based on recipient)
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(leaderName, {
                            from: request.workerName,
                            text: (0, slowOperations_js_1.jsonStringify)(message),
                            timestamp: new Date().toISOString(),
                            color: request.workerColor,
                        }, request.teamName)];
                case 3:
                    // Send to leader's mailbox (routes to in-process or file-based based on recipient)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Sent permission request ".concat(request.id, " to leader ").concat(leaderName, " via mailbox"));
                    return [2 /*return*/, true];
                case 4:
                    error_3 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to send permission request via mailbox: ".concat(error_3));
                    (0, log_js_1.logError)(error_3);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send a permission response to a worker via mailbox.
 * This is the new mailbox-based approach that replaces the file-based resolved directory.
 *
 * @param workerName - The worker's name to send the response to
 * @param resolution - The permission resolution
 * @param requestId - The original request ID
 * @param teamName - The team name
 * @returns true if the message was sent successfully
 */
function sendPermissionResponseViaMailbox(workerName, resolution, requestId, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, message, senderName, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cannot send permission response: team name not found");
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    message = (0, teammateMailbox_js_1.createPermissionResponseMessage)({
                        request_id: requestId,
                        subtype: resolution.decision === 'approved' ? 'success' : 'error',
                        error: resolution.feedback,
                        updated_input: resolution.updatedInput,
                        permission_updates: resolution.permissionUpdates,
                    });
                    senderName = (0, teammate_js_1.getAgentName)() || 'team-lead';
                    // Send to worker's mailbox (routes to in-process or file-based based on recipient)
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(workerName, {
                            from: senderName,
                            text: (0, slowOperations_js_1.jsonStringify)(message),
                            timestamp: new Date().toISOString(),
                        }, team)];
                case 2:
                    // Send to worker's mailbox (routes to in-process or file-based based on recipient)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Sent permission response for ".concat(requestId, " to worker ").concat(workerName, " via mailbox"));
                    return [2 /*return*/, true];
                case 3:
                    error_4 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to send permission response via mailbox: ".concat(error_4));
                    (0, log_js_1.logError)(error_4);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// Sandbox Permission Mailbox System
// ============================================================================
/**
 * Generate a unique sandbox permission request ID
 */
function generateSandboxRequestId() {
    return "sandbox-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
}
/**
 * Send a sandbox permission request to the leader via mailbox.
 * Called by workers when sandbox runtime needs network access approval.
 *
 * @param host - The host requesting network access
 * @param requestId - Unique ID for this request
 * @param teamName - Optional team name
 * @returns true if the message was sent successfully
 */
function sendSandboxPermissionRequestViaMailbox(host, requestId, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, leaderName, workerId, workerName, workerColor, message, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cannot send sandbox permission request: team name not found");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, getLeaderName(team)];
                case 1:
                    leaderName = _a.sent();
                    if (!leaderName) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cannot send sandbox permission request: leader name not found");
                        return [2 /*return*/, false];
                    }
                    workerId = (0, teammate_js_1.getAgentId)();
                    workerName = (0, teammate_js_1.getAgentName)();
                    workerColor = (0, teammate_js_1.getTeammateColor)();
                    if (!workerId || !workerName) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cannot send sandbox permission request: worker ID or name not found");
                        return [2 /*return*/, false];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    message = (0, teammateMailbox_js_1.createSandboxPermissionRequestMessage)({
                        requestId: requestId,
                        workerId: workerId,
                        workerName: workerName,
                        workerColor: workerColor,
                        host: host,
                    });
                    // Send to leader's mailbox (routes to in-process or file-based based on recipient)
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(leaderName, {
                            from: workerName,
                            text: (0, slowOperations_js_1.jsonStringify)(message),
                            timestamp: new Date().toISOString(),
                            color: workerColor,
                        }, team)];
                case 3:
                    // Send to leader's mailbox (routes to in-process or file-based based on recipient)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Sent sandbox permission request ".concat(requestId, " for host ").concat(host, " to leader ").concat(leaderName, " via mailbox"));
                    return [2 /*return*/, true];
                case 4:
                    error_5 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to send sandbox permission request via mailbox: ".concat(error_5));
                    (0, log_js_1.logError)(error_5);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send a sandbox permission response to a worker via mailbox.
 * Called by the leader when approving/denying a sandbox network access request.
 *
 * @param workerName - The worker's name to send the response to
 * @param requestId - The original request ID
 * @param host - The host that was approved/denied
 * @param allow - Whether the connection is allowed
 * @param teamName - Optional team name
 * @returns true if the message was sent successfully
 */
function sendSandboxPermissionResponseViaMailbox(workerName, requestId, host, allow, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, message, senderName, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)();
                    if (!team) {
                        (0, debug_js_1.logForDebugging)("[PermissionSync] Cannot send sandbox permission response: team name not found");
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    message = (0, teammateMailbox_js_1.createSandboxPermissionResponseMessage)({
                        requestId: requestId,
                        host: host,
                        allow: allow,
                    });
                    senderName = (0, teammate_js_1.getAgentName)() || 'team-lead';
                    // Send to worker's mailbox (routes to in-process or file-based based on recipient)
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(workerName, {
                            from: senderName,
                            text: (0, slowOperations_js_1.jsonStringify)(message),
                            timestamp: new Date().toISOString(),
                        }, team)];
                case 2:
                    // Send to worker's mailbox (routes to in-process or file-based based on recipient)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Sent sandbox permission response for ".concat(requestId, " (host: ").concat(host, ", allow: ").concat(allow, ") to worker ").concat(workerName, " via mailbox"));
                    return [2 /*return*/, true];
                case 3:
                    error_6 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[PermissionSync] Failed to send sandbox permission response via mailbox: ".concat(error_6));
                    (0, log_js_1.logError)(error_6);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
