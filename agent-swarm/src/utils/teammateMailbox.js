"use strict";
/**
 * Teammate Mailbox - File-based messaging system for agent swarms
 *
 * Each teammate has an inbox file at .claude/teams/{team_name}/inboxes/{agent_name}.json
 * Other teammates can write messages to it, and the recipient sees them as attachments.
 *
 * Note: Inboxes are keyed by agent name within a team.
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
exports.ModeSetRequestMessageSchema = exports.ShutdownRejectedMessageSchema = exports.ShutdownApprovedMessageSchema = exports.ShutdownRequestMessageSchema = exports.PlanApprovalResponseMessageSchema = exports.PlanApprovalRequestMessageSchema = void 0;
exports.getInboxPath = getInboxPath;
exports.readMailbox = readMailbox;
exports.readUnreadMessages = readUnreadMessages;
exports.writeToMailbox = writeToMailbox;
exports.markMessageAsReadByIndex = markMessageAsReadByIndex;
exports.markMessagesAsRead = markMessagesAsRead;
exports.clearMailbox = clearMailbox;
exports.formatTeammateMessages = formatTeammateMessages;
exports.createIdleNotification = createIdleNotification;
exports.isIdleNotification = isIdleNotification;
exports.createPermissionRequestMessage = createPermissionRequestMessage;
exports.createPermissionResponseMessage = createPermissionResponseMessage;
exports.isPermissionRequest = isPermissionRequest;
exports.isPermissionResponse = isPermissionResponse;
exports.createSandboxPermissionRequestMessage = createSandboxPermissionRequestMessage;
exports.createSandboxPermissionResponseMessage = createSandboxPermissionResponseMessage;
exports.isSandboxPermissionRequest = isSandboxPermissionRequest;
exports.isSandboxPermissionResponse = isSandboxPermissionResponse;
exports.createShutdownRequestMessage = createShutdownRequestMessage;
exports.createShutdownApprovedMessage = createShutdownApprovedMessage;
exports.createShutdownRejectedMessage = createShutdownRejectedMessage;
exports.sendShutdownRequestToMailbox = sendShutdownRequestToMailbox;
exports.isShutdownRequest = isShutdownRequest;
exports.isPlanApprovalRequest = isPlanApprovalRequest;
exports.isShutdownApproved = isShutdownApproved;
exports.isShutdownRejected = isShutdownRejected;
exports.isPlanApprovalResponse = isPlanApprovalResponse;
exports.isTaskAssignment = isTaskAssignment;
exports.isTeamPermissionUpdate = isTeamPermissionUpdate;
exports.createModeSetRequestMessage = createModeSetRequestMessage;
exports.isModeSetRequest = isModeSetRequest;
exports.isStructuredProtocolMessage = isStructuredProtocolMessage;
exports.markMessagesAsReadByPredicate = markMessagesAsReadByPredicate;
exports.getLastPeerDmSummary = getLastPeerDmSummary;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var xml_js_1 = require("../constants/xml.js");
var coreSchemas_js_1 = require("../entrypoints/sdk/coreSchemas.js");
var constants_js_1 = require("../tools/SendMessageTool/constants.js");
var agentId_js_1 = require("./agentId.js");
var array_js_1 = require("./array.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var lazySchema_js_1 = require("./lazySchema.js");
var lockfile = require("./lockfile.js");
var log_js_1 = require("./log.js");
var slowOperations_js_1 = require("./slowOperations.js");
var constants_js_2 = require("./swarm/constants.js");
var tasks_js_1 = require("./tasks.js");
var teammate_js_1 = require("./teammate.js");
// Lock options: retry with backoff so concurrent callers (multiple Claudes
// in a swarm) wait for the lock instead of failing immediately. The sync
// lockSync API blocked the event loop; the async API needs explicit retries
// to achieve the same serialization semantics.
var LOCK_OPTIONS = {
    retries: {
        retries: 10,
        minTimeout: 5,
        maxTimeout: 100,
    },
};
/**
 * Get the path to a teammate's inbox file
 * Structure: ~/.claude/teams/{team_name}/inboxes/{agent_name}.json
 */
function getInboxPath(agentName, teamName) {
    var team = teamName || (0, teammate_js_1.getTeamName)() || 'default';
    var safeTeam = (0, tasks_js_1.sanitizePathComponent)(team);
    var safeAgentName = (0, tasks_js_1.sanitizePathComponent)(agentName);
    var inboxDir = (0, path_1.join)((0, envUtils_js_1.getTeamsDir)(), safeTeam, 'inboxes');
    var fullPath = (0, path_1.join)(inboxDir, "".concat(safeAgentName, ".json"));
    (0, debug_js_1.logForDebugging)("[TeammateMailbox] getInboxPath: agent=".concat(agentName, ", team=").concat(team, ", fullPath=").concat(fullPath));
    return fullPath;
}
/**
 * Ensure the inbox directory exists for a team
 */
function ensureInboxDir(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var team, safeTeam, inboxDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    team = teamName || (0, teammate_js_1.getTeamName)() || 'default';
                    safeTeam = (0, tasks_js_1.sanitizePathComponent)(team);
                    inboxDir = (0, path_1.join)((0, envUtils_js_1.getTeamsDir)(), safeTeam, 'inboxes');
                    return [4 /*yield*/, (0, promises_1.mkdir)(inboxDir, { recursive: true })];
                case 1:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] Ensured inbox directory: ".concat(inboxDir));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Read all messages from a teammate's inbox
 * @param agentName - The agent name (not UUID) to read inbox for
 * @param teamName - Optional team name (defaults to CLAUDE_CODE_TEAM_NAME env var or 'default')
 */
function readMailbox(agentName, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var inboxPath, content, messages, error_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inboxPath = getInboxPath(agentName, teamName);
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] readMailbox: path=".concat(inboxPath));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(inboxPath, 'utf-8')];
                case 2:
                    content = _a.sent();
                    messages = (0, slowOperations_js_1.jsonParse)(content);
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] readMailbox: read ".concat(messages.length, " message(s)"));
                    return [2 /*return*/, messages];
                case 3:
                    error_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_1);
                    if (code === 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("[TeammateMailbox] readMailbox: file does not exist");
                        return [2 /*return*/, []];
                    }
                    (0, debug_js_1.logForDebugging)("Failed to read inbox for ".concat(agentName, ": ").concat(error_1));
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read only unread messages from a teammate's inbox
 * @param agentName - The agent name (not UUID) to read inbox for
 * @param teamName - Optional team name
 */
function readUnreadMessages(agentName, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, unread;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readMailbox(agentName, teamName)];
                case 1:
                    messages = _a.sent();
                    unread = messages.filter(function (m) { return !m.read; });
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] readUnreadMessages: ".concat(unread.length, " unread of ").concat(messages.length, " total"));
                    return [2 /*return*/, unread];
            }
        });
    });
}
/**
 * Write a message to a teammate's inbox
 * Uses file locking to prevent race conditions when multiple agents write concurrently
 * @param recipientName - The recipient's agent name (not UUID)
 * @param message - The message to write
 * @param teamName - Optional team name
 */
function writeToMailbox(recipientName, message, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var inboxPath, lockFilePath, error_2, code, release, messages, newMessage, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureInboxDir(teamName)];
                case 1:
                    _a.sent();
                    inboxPath = getInboxPath(recipientName, teamName);
                    lockFilePath = "".concat(inboxPath, ".lock");
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] writeToMailbox: recipient=".concat(recipientName, ", from=").concat(message.from, ", path=").concat(inboxPath));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(inboxPath, '[]', { encoding: 'utf-8', flag: 'wx' })];
                case 3:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] writeToMailbox: created new inbox file");
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_2);
                    if (code !== 'EEXIST') {
                        (0, debug_js_1.logForDebugging)("[TeammateMailbox] writeToMailbox: failed to create inbox file: ".concat(error_2));
                        (0, log_js_1.logError)(error_2);
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 5:
                    _a.trys.push([5, 9, 10, 13]);
                    return [4 /*yield*/, lockfile.lock(inboxPath, __assign({ lockfilePath: lockFilePath }, LOCK_OPTIONS))
                        // Re-read messages after acquiring lock to get the latest state
                    ];
                case 6:
                    release = _a.sent();
                    return [4 /*yield*/, readMailbox(recipientName, teamName)];
                case 7:
                    messages = _a.sent();
                    newMessage = __assign(__assign({}, message), { read: false });
                    messages.push(newMessage);
                    return [4 /*yield*/, (0, promises_1.writeFile)(inboxPath, (0, slowOperations_js_1.jsonStringify)(messages, null, 2), 'utf-8')];
                case 8:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] Wrote message to ".concat(recipientName, "'s inbox from ").concat(message.from));
                    return [3 /*break*/, 13];
                case 9:
                    error_3 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to write to inbox for ".concat(recipientName, ": ").concat(error_3));
                    (0, log_js_1.logError)(error_3);
                    return [3 /*break*/, 13];
                case 10:
                    if (!release) return [3 /*break*/, 12];
                    return [4 /*yield*/, release()];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Mark a specific message in a teammate's inbox as read by index
 * Uses file locking to prevent race conditions
 * @param agentName - The agent name to mark message as read for
 * @param teamName - Optional team name
 * @param messageIndex - Index of the message to mark as read
 */
function markMessageAsReadByIndex(agentName, teamName, messageIndex) {
    return __awaiter(this, void 0, void 0, function () {
        var inboxPath, lockFilePath, release, messages, message, error_4, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inboxPath = getInboxPath(agentName, teamName);
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex called: agentName=".concat(agentName, ", teamName=").concat(teamName, ", index=").concat(messageIndex, ", path=").concat(inboxPath));
                    lockFilePath = "".concat(inboxPath, ".lock");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 9]);
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: acquiring lock...");
                    return [4 /*yield*/, lockfile.lock(inboxPath, __assign({ lockfilePath: lockFilePath }, LOCK_OPTIONS))];
                case 2:
                    release = _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: lock acquired");
                    return [4 /*yield*/, readMailbox(agentName, teamName)];
                case 3:
                    messages = _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: read ".concat(messages.length, " messages after lock"));
                    if (messageIndex < 0 || messageIndex >= messages.length) {
                        (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: index ".concat(messageIndex, " out of bounds (").concat(messages.length, " messages)"));
                        return [2 /*return*/];
                    }
                    message = messages[messageIndex];
                    if (!message || message.read) {
                        (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: message already read or missing");
                        return [2 /*return*/];
                    }
                    messages[messageIndex] = __assign(__assign({}, message), { read: true });
                    return [4 /*yield*/, (0, promises_1.writeFile)(inboxPath, (0, slowOperations_js_1.jsonStringify)(messages, null, 2), 'utf-8')];
                case 4:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: marked message at index ".concat(messageIndex, " as read"));
                    return [3 /*break*/, 9];
                case 5:
                    error_4 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_4);
                    if (code === 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: file does not exist at ".concat(inboxPath));
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex FAILED for ".concat(agentName, ": ").concat(error_4));
                    (0, log_js_1.logError)(error_4);
                    return [3 /*break*/, 9];
                case 6:
                    if (!release) return [3 /*break*/, 8];
                    return [4 /*yield*/, release()];
                case 7:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessageAsReadByIndex: lock released");
                    _a.label = 8;
                case 8: return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Mark all messages in a teammate's inbox as read
 * Uses file locking to prevent race conditions
 * @param agentName - The agent name to mark messages as read for
 * @param teamName - Optional team name
 */
function markMessagesAsRead(agentName, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var inboxPath, lockFilePath, release, messages, unreadCount, _i, messages_1, m, error_5, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inboxPath = getInboxPath(agentName, teamName);
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead called: agentName=".concat(agentName, ", teamName=").concat(teamName, ", path=").concat(inboxPath));
                    lockFilePath = "".concat(inboxPath, ".lock");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 9]);
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: acquiring lock...");
                    return [4 /*yield*/, lockfile.lock(inboxPath, __assign({ lockfilePath: lockFilePath }, LOCK_OPTIONS))];
                case 2:
                    release = _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: lock acquired");
                    return [4 /*yield*/, readMailbox(agentName, teamName)];
                case 3:
                    messages = _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: read ".concat(messages.length, " messages after lock"));
                    if (messages.length === 0) {
                        (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: no messages to mark");
                        return [2 /*return*/];
                    }
                    unreadCount = (0, array_js_1.count)(messages, function (m) { return !m.read; });
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: ".concat(unreadCount, " unread of ").concat(messages.length, " total"));
                    // messages comes from jsonParse — fresh, unshared objects safe to mutate
                    for (_i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                        m = messages_1[_i];
                        m.read = true;
                    }
                    return [4 /*yield*/, (0, promises_1.writeFile)(inboxPath, (0, slowOperations_js_1.jsonStringify)(messages, null, 2), 'utf-8')];
                case 4:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: WROTE ".concat(unreadCount, " message(s) as read to ").concat(inboxPath));
                    return [3 /*break*/, 9];
                case 5:
                    error_5 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_5);
                    if (code === 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: file does not exist at ".concat(inboxPath));
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead FAILED for ".concat(agentName, ": ").concat(error_5));
                    (0, log_js_1.logError)(error_5);
                    return [3 /*break*/, 9];
                case 6:
                    if (!release) return [3 /*break*/, 8];
                    return [4 /*yield*/, release()];
                case 7:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] markMessagesAsRead: lock released");
                    _a.label = 8;
                case 8: return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clear a teammate's inbox (delete all messages)
 * @param agentName - The agent name to clear inbox for
 * @param teamName - Optional team name
 */
function clearMailbox(agentName, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var inboxPath, error_6, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inboxPath = getInboxPath(agentName, teamName);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // flag 'r+' throws ENOENT if the file doesn't exist, so we don't
                    // accidentally create an inbox file that wasn't there.
                    return [4 /*yield*/, (0, promises_1.writeFile)(inboxPath, '[]', { encoding: 'utf-8', flag: 'r+' })];
                case 2:
                    // flag 'r+' throws ENOENT if the file doesn't exist, so we don't
                    // accidentally create an inbox file that wasn't there.
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateMailbox] Cleared inbox for ".concat(agentName));
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_6);
                    if (code === 'ENOENT') {
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("Failed to clear inbox for ".concat(agentName, ": ").concat(error_6));
                    (0, log_js_1.logError)(error_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Format teammate messages as XML for attachment display
 */
function formatTeammateMessages(messages) {
    return messages
        .map(function (m) {
        var colorAttr = m.color ? " color=\"".concat(m.color, "\"") : '';
        var summaryAttr = m.summary ? " summary=\"".concat(m.summary, "\"") : '';
        return "<".concat(xml_js_1.TEAMMATE_MESSAGE_TAG, " teammate_id=\"").concat(m.from, "\"").concat(colorAttr).concat(summaryAttr, ">\n").concat(m.text, "\n</").concat(xml_js_1.TEAMMATE_MESSAGE_TAG, ">");
    })
        .join('\n\n');
}
/**
 * Creates an idle notification message to send to the team leader
 */
function createIdleNotification(agentId, options) {
    return {
        type: 'idle_notification',
        from: agentId,
        timestamp: new Date().toISOString(),
        idleReason: options === null || options === void 0 ? void 0 : options.idleReason,
        summary: options === null || options === void 0 ? void 0 : options.summary,
        completedTaskId: options === null || options === void 0 ? void 0 : options.completedTaskId,
        completedStatus: options === null || options === void 0 ? void 0 : options.completedStatus,
        failureReason: options === null || options === void 0 ? void 0 : options.failureReason,
    };
}
/**
 * Checks if a message text contains an idle notification
 */
function isIdleNotification(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (parsed && parsed.type === 'idle_notification') {
            return parsed;
        }
    }
    catch (_a) {
        // Not JSON or not a valid idle notification
    }
    return null;
}
/**
 * Creates a permission request message to send to the team leader
 */
function createPermissionRequestMessage(params) {
    return {
        type: 'permission_request',
        request_id: params.request_id,
        agent_id: params.agent_id,
        tool_name: params.tool_name,
        tool_use_id: params.tool_use_id,
        description: params.description,
        input: params.input,
        permission_suggestions: params.permission_suggestions || [],
    };
}
/**
 * Creates a permission response message to send back to a worker
 */
function createPermissionResponseMessage(params) {
    if (params.subtype === 'error') {
        return {
            type: 'permission_response',
            request_id: params.request_id,
            subtype: 'error',
            error: params.error || 'Permission denied',
        };
    }
    return {
        type: 'permission_response',
        request_id: params.request_id,
        subtype: 'success',
        response: {
            updated_input: params.updated_input,
            permission_updates: params.permission_updates,
        },
    };
}
/**
 * Checks if a message text contains a permission request
 */
function isPermissionRequest(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (parsed && parsed.type === 'permission_request') {
            return parsed;
        }
    }
    catch (_a) {
        // Not JSON or not a valid permission request
    }
    return null;
}
/**
 * Checks if a message text contains a permission response
 */
function isPermissionResponse(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (parsed && parsed.type === 'permission_response') {
            return parsed;
        }
    }
    catch (_a) {
        // Not JSON or not a valid permission response
    }
    return null;
}
/**
 * Creates a sandbox permission request message to send to the team leader
 */
function createSandboxPermissionRequestMessage(params) {
    return {
        type: 'sandbox_permission_request',
        requestId: params.requestId,
        workerId: params.workerId,
        workerName: params.workerName,
        workerColor: params.workerColor,
        hostPattern: { host: params.host },
        createdAt: Date.now(),
    };
}
/**
 * Creates a sandbox permission response message to send back to a worker
 */
function createSandboxPermissionResponseMessage(params) {
    return {
        type: 'sandbox_permission_response',
        requestId: params.requestId,
        host: params.host,
        allow: params.allow,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Checks if a message text contains a sandbox permission request
 */
function isSandboxPermissionRequest(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (parsed && parsed.type === 'sandbox_permission_request') {
            return parsed;
        }
    }
    catch (_a) {
        // Not JSON or not a valid sandbox permission request
    }
    return null;
}
/**
 * Checks if a message text contains a sandbox permission response
 */
function isSandboxPermissionResponse(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (parsed && parsed.type === 'sandbox_permission_response') {
            return parsed;
        }
    }
    catch (_a) {
        // Not JSON or not a valid sandbox permission response
    }
    return null;
}
/**
 * Message sent when a teammate requests plan approval from the team leader
 */
exports.PlanApprovalRequestMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('plan_approval_request'),
        from: v4_1.z.string(),
        timestamp: v4_1.z.string(),
        planFilePath: v4_1.z.string(),
        planContent: v4_1.z.string(),
        requestId: v4_1.z.string(),
    });
});
/**
 * Message sent by the team leader in response to a plan approval request
 */
exports.PlanApprovalResponseMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('plan_approval_response'),
        requestId: v4_1.z.string(),
        approved: v4_1.z.boolean(),
        feedback: v4_1.z.string().optional(),
        timestamp: v4_1.z.string(),
        permissionMode: (0, coreSchemas_js_1.PermissionModeSchema)().optional(),
    });
});
/**
 * Shutdown request message sent from leader to teammate via mailbox
 */
exports.ShutdownRequestMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('shutdown_request'),
        requestId: v4_1.z.string(),
        from: v4_1.z.string(),
        reason: v4_1.z.string().optional(),
        timestamp: v4_1.z.string(),
    });
});
/**
 * Shutdown approved message sent from teammate to leader via mailbox
 */
exports.ShutdownApprovedMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('shutdown_approved'),
        requestId: v4_1.z.string(),
        from: v4_1.z.string(),
        timestamp: v4_1.z.string(),
        paneId: v4_1.z.string().optional(),
        backendType: v4_1.z.string().optional(),
    });
});
/**
 * Shutdown rejected message sent from teammate to leader via mailbox
 */
exports.ShutdownRejectedMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('shutdown_rejected'),
        requestId: v4_1.z.string(),
        from: v4_1.z.string(),
        reason: v4_1.z.string(),
        timestamp: v4_1.z.string(),
    });
});
/**
 * Creates a shutdown request message to send to a teammate
 */
function createShutdownRequestMessage(params) {
    return {
        type: 'shutdown_request',
        requestId: params.requestId,
        from: params.from,
        reason: params.reason,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Creates a shutdown approved message to send to the team leader
 */
function createShutdownApprovedMessage(params) {
    return {
        type: 'shutdown_approved',
        requestId: params.requestId,
        from: params.from,
        timestamp: new Date().toISOString(),
        paneId: params.paneId,
        backendType: params.backendType,
    };
}
/**
 * Creates a shutdown rejected message to send to the team leader
 */
function createShutdownRejectedMessage(params) {
    return {
        type: 'shutdown_rejected',
        requestId: params.requestId,
        from: params.from,
        reason: params.reason,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Sends a shutdown request to a teammate's mailbox.
 * This is the core logic extracted for reuse by both the tool and UI components.
 *
 * @param targetName - Name of the teammate to send shutdown request to
 * @param teamName - Optional team name (defaults to CLAUDE_CODE_TEAM_NAME env var)
 * @param reason - Optional reason for the shutdown request
 * @returns The request ID and target name
 */
function sendShutdownRequestToMailbox(targetName, teamName, reason) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedTeamName, senderName, requestId, shutdownMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resolvedTeamName = teamName || (0, teammate_js_1.getTeamName)();
                    senderName = (0, teammate_js_1.getAgentName)() || constants_js_2.TEAM_LEAD_NAME;
                    requestId = (0, agentId_js_1.generateRequestId)('shutdown', targetName);
                    shutdownMessage = createShutdownRequestMessage({
                        requestId: requestId,
                        from: senderName,
                        reason: reason,
                    });
                    return [4 /*yield*/, writeToMailbox(targetName, {
                            from: senderName,
                            text: (0, slowOperations_js_1.jsonStringify)(shutdownMessage),
                            timestamp: new Date().toISOString(),
                            color: (0, teammate_js_1.getTeammateColor)(),
                        }, resolvedTeamName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { requestId: requestId, target: targetName }];
            }
        });
    });
}
/**
 * Checks if a message text contains a shutdown request
 */
function isShutdownRequest(messageText) {
    try {
        var result = (0, exports.ShutdownRequestMessageSchema)().safeParse((0, slowOperations_js_1.jsonParse)(messageText));
        if (result.success)
            return result.data;
    }
    catch (_a) {
        // Not JSON
    }
    return null;
}
/**
 * Checks if a message text contains a plan approval request
 */
function isPlanApprovalRequest(messageText) {
    try {
        var result = (0, exports.PlanApprovalRequestMessageSchema)().safeParse((0, slowOperations_js_1.jsonParse)(messageText));
        if (result.success)
            return result.data;
    }
    catch (_a) {
        // Not JSON
    }
    return null;
}
/**
 * Checks if a message text contains a shutdown approved message
 */
function isShutdownApproved(messageText) {
    try {
        var result = (0, exports.ShutdownApprovedMessageSchema)().safeParse((0, slowOperations_js_1.jsonParse)(messageText));
        if (result.success)
            return result.data;
    }
    catch (_a) {
        // Not JSON
    }
    return null;
}
/**
 * Checks if a message text contains a shutdown rejected message
 */
function isShutdownRejected(messageText) {
    try {
        var result = (0, exports.ShutdownRejectedMessageSchema)().safeParse((0, slowOperations_js_1.jsonParse)(messageText));
        if (result.success)
            return result.data;
    }
    catch (_a) {
        // Not JSON
    }
    return null;
}
/**
 * Checks if a message text contains a plan approval response
 */
function isPlanApprovalResponse(messageText) {
    try {
        var result = (0, exports.PlanApprovalResponseMessageSchema)().safeParse((0, slowOperations_js_1.jsonParse)(messageText));
        if (result.success)
            return result.data;
    }
    catch (_a) {
        // Not JSON
    }
    return null;
}
/**
 * Checks if a message text contains a task assignment
 */
function isTaskAssignment(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (parsed && parsed.type === 'task_assignment') {
            return parsed;
        }
    }
    catch (_a) {
        // Not JSON or not a valid task assignment
    }
    return null;
}
/**
 * Checks if a message text contains a team permission update
 */
function isTeamPermissionUpdate(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (parsed && parsed.type === 'team_permission_update') {
            return parsed;
        }
    }
    catch (_a) {
        // Not JSON or not a valid team permission update
    }
    return null;
}
/**
 * Mode set request message sent from leader to teammate via mailbox
 * Uses SDK PermissionModeSchema for validated mode values
 */
exports.ModeSetRequestMessageSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('mode_set_request'),
        mode: (0, coreSchemas_js_1.PermissionModeSchema)(),
        from: v4_1.z.string(),
    });
});
/**
 * Creates a mode set request message to send to a teammate
 */
function createModeSetRequestMessage(params) {
    return {
        type: 'mode_set_request',
        mode: params.mode,
        from: params.from,
    };
}
/**
 * Checks if a message text contains a mode set request
 */
function isModeSetRequest(messageText) {
    try {
        var parsed = (0, exports.ModeSetRequestMessageSchema)().safeParse((0, slowOperations_js_1.jsonParse)(messageText));
        if (parsed.success) {
            return parsed.data;
        }
    }
    catch (_a) {
        // Not JSON or not a valid mode set request
    }
    return null;
}
/**
 * Checks if a message text is a structured protocol message that should be
 * routed by useInboxPoller rather than consumed as raw LLM context.
 *
 * These message types have specific handlers in useInboxPoller that route them
 * to the correct queues (workerPermissions, workerSandboxPermissions, etc.).
 * If getTeammateMailboxAttachments consumes them first, they get bundled as
 * raw text in attachments and never reach their intended handlers.
 */
function isStructuredProtocolMessage(messageText) {
    try {
        var parsed = (0, slowOperations_js_1.jsonParse)(messageText);
        if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) {
            return false;
        }
        var type = parsed.type;
        return (type === 'permission_request' ||
            type === 'permission_response' ||
            type === 'sandbox_permission_request' ||
            type === 'sandbox_permission_response' ||
            type === 'shutdown_request' ||
            type === 'shutdown_approved' ||
            type === 'team_permission_update' ||
            type === 'mode_set_request' ||
            type === 'plan_approval_request' ||
            type === 'plan_approval_response');
    }
    catch (_a) {
        return false;
    }
}
/**
 * Marks only messages matching a predicate as read, leaving others unread.
 * Uses the same file-locking mechanism as markMessagesAsRead.
 */
function markMessagesAsReadByPredicate(agentName, predicate, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var inboxPath, lockFilePath, release, messages, updatedMessages, error_7, code, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    inboxPath = getInboxPath(agentName, teamName);
                    lockFilePath = "".concat(inboxPath, ".lock");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 11]);
                    return [4 /*yield*/, lockfile.lock(inboxPath, __assign({ lockfilePath: lockFilePath }, LOCK_OPTIONS))];
                case 2:
                    release = _b.sent();
                    return [4 /*yield*/, readMailbox(agentName, teamName)];
                case 3:
                    messages = _b.sent();
                    if (messages.length === 0) {
                        return [2 /*return*/];
                    }
                    updatedMessages = messages.map(function (m) {
                        return !m.read && predicate(m) ? __assign(__assign({}, m), { read: true }) : m;
                    });
                    return [4 /*yield*/, (0, promises_1.writeFile)(inboxPath, (0, slowOperations_js_1.jsonStringify)(updatedMessages, null, 2), 'utf-8')];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 5:
                    error_7 = _b.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_7);
                    if (code === 'ENOENT') {
                        return [2 /*return*/];
                    }
                    (0, log_js_1.logError)(error_7);
                    return [3 /*break*/, 11];
                case 6:
                    if (!release) return [3 /*break*/, 10];
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, release()];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _a = _b.sent();
                    return [3 /*break*/, 10];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extracts a "[to {name}] {summary}" string from the last assistant message
 * if it ended with a SendMessage tool_use targeting a peer (not the team lead).
 * Returns undefined when the turn didn't end with a peer DM.
 */
function getLastPeerDmSummary(messages) {
    for (var i = messages.length - 1; i >= 0; i--) {
        var msg = messages[i];
        if (!msg)
            continue;
        // Stop at wake-up boundary: a user prompt (string content), not tool results (array content)
        if (msg.type === 'user' && typeof msg.message.content === 'string') {
            break;
        }
        if (msg.type !== 'assistant')
            continue;
        for (var _i = 0, _a = msg.message.content; _i < _a.length; _i++) {
            var block = _a[_i];
            if (block.type === 'tool_use' &&
                block.name === constants_js_1.SEND_MESSAGE_TOOL_NAME &&
                typeof block.input === 'object' &&
                block.input !== null &&
                'to' in block.input &&
                typeof block.input.to === 'string' &&
                block.input.to !== '*' &&
                block.input.to.toLowerCase() !== constants_js_2.TEAM_LEAD_NAME.toLowerCase() &&
                'message' in block.input &&
                typeof block.input.message === 'string') {
                var to = block.input.to;
                var summary = 'summary' in block.input && typeof block.input.summary === 'string'
                    ? block.input.summary
                    : block.input.message.slice(0, 80);
                return "[to ".concat(to, "] ").concat(summary);
            }
        }
    }
    return undefined;
}
