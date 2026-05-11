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
exports.SendMessageTool = void 0;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var replBridgeHandle_js_1 = require("../../bridge/replBridgeHandle.js");
var Tool_js_1 = require("../../Tool.js");
var InProcessTeammateTask_js_1 = require("../../tasks/InProcessTeammateTask/InProcessTeammateTask.js");
var LocalAgentTask_js_1 = require("../../tasks/LocalAgentTask/LocalAgentTask.js");
var LocalMainSessionTask_js_1 = require("../../tasks/LocalMainSessionTask.js");
var ids_js_1 = require("../../types/ids.js");
var agentId_js_1 = require("../../utils/agentId.js");
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var format_js_1 = require("../../utils/format.js");
var gracefulShutdown_js_1 = require("../../utils/gracefulShutdown.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var peerAddress_js_1 = require("../../utils/peerAddress.js");
var semanticBoolean_js_1 = require("../../utils/semanticBoolean.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var constants_js_1 = require("../../utils/swarm/constants.js");
var teamHelpers_js_1 = require("../../utils/swarm/teamHelpers.js");
var teammate_js_1 = require("../../utils/teammate.js");
var teammateMailbox_js_1 = require("../../utils/teammateMailbox.js");
var resumeAgent_js_1 = require("../AgentTool/resumeAgent.js");
var constants_js_2 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var StructuredMessage = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.discriminatedUnion('type', [
        v4_1.z.object({
            type: v4_1.z.literal('shutdown_request'),
            reason: v4_1.z.string().optional(),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('shutdown_response'),
            request_id: v4_1.z.string(),
            approve: (0, semanticBoolean_js_1.semanticBoolean)(),
            reason: v4_1.z.string().optional(),
        }),
        v4_1.z.object({
            type: v4_1.z.literal('plan_approval_response'),
            request_id: v4_1.z.string(),
            approve: (0, semanticBoolean_js_1.semanticBoolean)(),
            feedback: v4_1.z.string().optional(),
        }),
    ]);
});
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        to: v4_1.z
            .string()
            .describe((0, bun_bundle_1.feature)('UDS_INBOX')
            ? 'Recipient: teammate name, "*" for broadcast, "uds:<socket-path>" for a local peer, or "bridge:<session-id>" for a Remote Control peer (use ListPeers to discover)'
            : 'Recipient: teammate name, or "*" for broadcast to all teammates'),
        summary: v4_1.z
            .string()
            .optional()
            .describe('A 5-10 word summary shown as a preview in the UI (required when message is a string)'),
        message: v4_1.z.union([
            v4_1.z.string().describe('Plain text message content'),
            StructuredMessage(),
        ]),
    });
});
function findTeammateColor(appState, name) {
    var _a;
    var teammates = (_a = appState.teamContext) === null || _a === void 0 ? void 0 : _a.teammates;
    if (!teammates)
        return undefined;
    for (var _i = 0, _b = Object.values(teammates); _i < _b.length; _i++) {
        var teammate = _b[_i];
        if ('name' in teammate && teammate.name === name) {
            return teammate.color;
        }
    }
    return undefined;
}
function handleMessage(recipientName, content, summary, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, teamName, senderName, senderColor, recipientColor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appState = context.getAppState();
                    teamName = (0, teammate_js_1.getTeamName)(appState.teamContext);
                    senderName = (0, teammate_js_1.getAgentName)() || ((0, teammate_js_1.isTeammate)() ? 'teammate' : constants_js_1.TEAM_LEAD_NAME);
                    senderColor = (0, teammate_js_1.getTeammateColor)();
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(recipientName, {
                            from: senderName,
                            text: content,
                            summary: summary,
                            timestamp: new Date().toISOString(),
                            color: senderColor,
                        }, teamName)];
                case 1:
                    _a.sent();
                    recipientColor = findTeammateColor(appState, recipientName);
                    return [2 /*return*/, {
                            data: {
                                success: true,
                                message: "Message sent to ".concat(recipientName, "'s inbox"),
                                routing: {
                                    sender: senderName,
                                    senderColor: senderColor,
                                    target: "@".concat(recipientName),
                                    targetColor: recipientColor,
                                    summary: summary,
                                    content: content,
                                },
                            },
                        }];
            }
        });
    });
}
function handleBroadcast(content, summary, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, teamName, teamFile, senderName, senderColor, recipients, _i, _a, member, _b, recipients_1, recipientName;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    appState = context.getAppState();
                    teamName = (0, teammate_js_1.getTeamName)(appState.teamContext);
                    if (!teamName) {
                        throw new Error('Not in a team context. Create a team with Teammate spawnTeam first, or set CLAUDE_CODE_TEAM_NAME.');
                    }
                    return [4 /*yield*/, (0, teamHelpers_js_1.readTeamFileAsync)(teamName)];
                case 1:
                    teamFile = _c.sent();
                    if (!teamFile) {
                        throw new Error("Team \"".concat(teamName, "\" does not exist"));
                    }
                    senderName = (0, teammate_js_1.getAgentName)() || ((0, teammate_js_1.isTeammate)() ? 'teammate' : constants_js_1.TEAM_LEAD_NAME);
                    if (!senderName) {
                        throw new Error('Cannot broadcast: sender name is required. Set CLAUDE_CODE_AGENT_NAME.');
                    }
                    senderColor = (0, teammate_js_1.getTeammateColor)();
                    recipients = [];
                    for (_i = 0, _a = teamFile.members; _i < _a.length; _i++) {
                        member = _a[_i];
                        if (member.name.toLowerCase() === senderName.toLowerCase()) {
                            continue;
                        }
                        recipients.push(member.name);
                    }
                    if (recipients.length === 0) {
                        return [2 /*return*/, {
                                data: {
                                    success: true,
                                    message: 'No teammates to broadcast to (you are the only team member)',
                                    recipients: [],
                                },
                            }];
                    }
                    _b = 0, recipients_1 = recipients;
                    _c.label = 2;
                case 2:
                    if (!(_b < recipients_1.length)) return [3 /*break*/, 5];
                    recipientName = recipients_1[_b];
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(recipientName, {
                            from: senderName,
                            text: content,
                            summary: summary,
                            timestamp: new Date().toISOString(),
                            color: senderColor,
                        }, teamName)];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    _b++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, {
                        data: {
                            success: true,
                            message: "Message broadcast to ".concat(recipients.length, " teammate(s): ").concat(recipients.join(', ')),
                            recipients: recipients,
                            routing: {
                                sender: senderName,
                                senderColor: senderColor,
                                target: '@team',
                                summary: summary,
                                content: content,
                            },
                        },
                    }];
            }
        });
    });
}
function handleShutdownRequest(targetName, reason, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, teamName, senderName, requestId, shutdownMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appState = context.getAppState();
                    teamName = (0, teammate_js_1.getTeamName)(appState.teamContext);
                    senderName = (0, teammate_js_1.getAgentName)() || constants_js_1.TEAM_LEAD_NAME;
                    requestId = (0, agentId_js_1.generateRequestId)('shutdown', targetName);
                    shutdownMessage = (0, teammateMailbox_js_1.createShutdownRequestMessage)({
                        requestId: requestId,
                        from: senderName,
                        reason: reason,
                    });
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(targetName, {
                            from: senderName,
                            text: (0, slowOperations_js_1.jsonStringify)(shutdownMessage),
                            timestamp: new Date().toISOString(),
                            color: (0, teammate_js_1.getTeammateColor)(),
                        }, teamName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, {
                            data: {
                                success: true,
                                message: "Shutdown request sent to ".concat(targetName, ". Request ID: ").concat(requestId),
                                request_id: requestId,
                                target: targetName,
                            },
                        }];
            }
        });
    });
}
function handleShutdownApproval(requestId, context) {
    return __awaiter(this, void 0, void 0, function () {
        var teamName, agentId, agentName, ownPaneId, ownBackendType, teamFile, selfMember, approvedMessage, appState, task, appState, task;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teamName = (0, teammate_js_1.getTeamName)();
                    agentId = (0, teammate_js_1.getAgentId)();
                    agentName = (0, teammate_js_1.getAgentName)() || 'teammate';
                    (0, debug_js_1.logForDebugging)("[SendMessageTool] handleShutdownApproval: teamName=".concat(teamName, ", agentId=").concat(agentId, ", agentName=").concat(agentName));
                    if (!teamName) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, teamHelpers_js_1.readTeamFileAsync)(teamName)];
                case 1:
                    teamFile = _a.sent();
                    if (teamFile && agentId) {
                        selfMember = teamFile.members.find(function (m) { return m.agentId === agentId; });
                        if (selfMember) {
                            ownPaneId = selfMember.tmuxPaneId;
                            ownBackendType = selfMember.backendType;
                        }
                    }
                    _a.label = 2;
                case 2:
                    approvedMessage = (0, teammateMailbox_js_1.createShutdownApprovedMessage)({
                        requestId: requestId,
                        from: agentName,
                        paneId: ownPaneId,
                        backendType: ownBackendType,
                    });
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(constants_js_1.TEAM_LEAD_NAME, {
                            from: agentName,
                            text: (0, slowOperations_js_1.jsonStringify)(approvedMessage),
                            timestamp: new Date().toISOString(),
                            color: (0, teammate_js_1.getTeammateColor)(),
                        }, teamName)];
                case 3:
                    _a.sent();
                    if (ownBackendType === 'in-process') {
                        (0, debug_js_1.logForDebugging)("[SendMessageTool] In-process teammate ".concat(agentName, " approving shutdown - signaling abort"));
                        if (agentId) {
                            appState = context.getAppState();
                            task = (0, InProcessTeammateTask_js_1.findTeammateTaskByAgentId)(agentId, appState.tasks);
                            if (task === null || task === void 0 ? void 0 : task.abortController) {
                                task.abortController.abort();
                                (0, debug_js_1.logForDebugging)("[SendMessageTool] Aborted controller for in-process teammate ".concat(agentName));
                            }
                            else {
                                (0, debug_js_1.logForDebugging)("[SendMessageTool] Warning: Could not find task/abortController for ".concat(agentName));
                            }
                        }
                    }
                    else {
                        if (agentId) {
                            appState = context.getAppState();
                            task = (0, InProcessTeammateTask_js_1.findTeammateTaskByAgentId)(agentId, appState.tasks);
                            if (task === null || task === void 0 ? void 0 : task.abortController) {
                                (0, debug_js_1.logForDebugging)("[SendMessageTool] Fallback: Found in-process task for ".concat(agentName, " via AppState, aborting"));
                                task.abortController.abort();
                                return [2 /*return*/, {
                                        data: {
                                            success: true,
                                            message: "Shutdown approved (fallback path). Agent ".concat(agentName, " is now exiting."),
                                            request_id: requestId,
                                        },
                                    }];
                            }
                        }
                        setImmediate(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0, 'other')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                    return [2 /*return*/, {
                            data: {
                                success: true,
                                message: "Shutdown approved. Sent confirmation to team-lead. Agent ".concat(agentName, " is now exiting."),
                                request_id: requestId,
                            },
                        }];
            }
        });
    });
}
function handleShutdownRejection(requestId, reason) {
    return __awaiter(this, void 0, void 0, function () {
        var teamName, agentName, rejectedMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teamName = (0, teammate_js_1.getTeamName)();
                    agentName = (0, teammate_js_1.getAgentName)() || 'teammate';
                    rejectedMessage = (0, teammateMailbox_js_1.createShutdownRejectedMessage)({
                        requestId: requestId,
                        from: agentName,
                        reason: reason,
                    });
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(constants_js_1.TEAM_LEAD_NAME, {
                            from: agentName,
                            text: (0, slowOperations_js_1.jsonStringify)(rejectedMessage),
                            timestamp: new Date().toISOString(),
                            color: (0, teammate_js_1.getTeammateColor)(),
                        }, teamName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, {
                            data: {
                                success: true,
                                message: "Shutdown rejected. Reason: \"".concat(reason, "\". Continuing to work."),
                                request_id: requestId,
                            },
                        }];
            }
        });
    });
}
function handlePlanApproval(recipientName, requestId, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, teamName, leaderMode, modeToInherit, approvalResponse;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = context.getAppState();
                    teamName = (_a = appState.teamContext) === null || _a === void 0 ? void 0 : _a.teamName;
                    if (!(0, teammate_js_1.isTeamLead)(appState.teamContext)) {
                        throw new Error('Only the team lead can approve plans. Teammates cannot approve their own or other plans.');
                    }
                    leaderMode = appState.toolPermissionContext.mode;
                    modeToInherit = leaderMode === 'plan' ? 'default' : leaderMode;
                    approvalResponse = {
                        type: 'plan_approval_response',
                        requestId: requestId,
                        approved: true,
                        timestamp: new Date().toISOString(),
                        permissionMode: modeToInherit,
                    };
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(recipientName, {
                            from: constants_js_1.TEAM_LEAD_NAME,
                            text: (0, slowOperations_js_1.jsonStringify)(approvalResponse),
                            timestamp: new Date().toISOString(),
                        }, teamName)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, {
                            data: {
                                success: true,
                                message: "Plan approved for ".concat(recipientName, ". They will receive the approval and can proceed with implementation."),
                                request_id: requestId,
                            },
                        }];
            }
        });
    });
}
function handlePlanRejection(recipientName, requestId, feedback, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, teamName, rejectionResponse;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = context.getAppState();
                    teamName = (_a = appState.teamContext) === null || _a === void 0 ? void 0 : _a.teamName;
                    if (!(0, teammate_js_1.isTeamLead)(appState.teamContext)) {
                        throw new Error('Only the team lead can reject plans. Teammates cannot reject their own or other plans.');
                    }
                    rejectionResponse = {
                        type: 'plan_approval_response',
                        requestId: requestId,
                        approved: false,
                        feedback: feedback,
                        timestamp: new Date().toISOString(),
                    };
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(recipientName, {
                            from: constants_js_1.TEAM_LEAD_NAME,
                            text: (0, slowOperations_js_1.jsonStringify)(rejectionResponse),
                            timestamp: new Date().toISOString(),
                        }, teamName)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, {
                            data: {
                                success: true,
                                message: "Plan rejected for ".concat(recipientName, " with feedback: \"").concat(feedback, "\""),
                                request_id: requestId,
                            },
                        }];
            }
        });
    });
}
exports.SendMessageTool = (0, Tool_js_1.buildTool)({
    name: constants_js_2.SEND_MESSAGE_TOOL_NAME,
    searchHint: 'send messages to agent teammates (swarm protocol)',
    maxResultSizeChars: 100000,
    userFacingName: function () {
        return 'SendMessage';
    },
    get inputSchema() {
        return inputSchema();
    },
    shouldDefer: true,
    isEnabled: function () {
        return (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)();
    },
    isReadOnly: function (input) {
        return typeof input.message === 'string';
    },
    backfillObservableInput: function (input) {
        var _a;
        if ('type' in input)
            return;
        if (typeof input.to !== 'string')
            return;
        if (input.to === '*') {
            input.type = 'broadcast';
            if (typeof input.message === 'string')
                input.content = input.message;
        }
        else if (typeof input.message === 'string') {
            input.type = 'message';
            input.recipient = input.to;
            input.content = input.message;
        }
        else if (typeof input.message === 'object' && input.message !== null) {
            var msg = input.message;
            input.type = msg.type;
            input.recipient = input.to;
            if (msg.request_id !== undefined)
                input.request_id = msg.request_id;
            if (msg.approve !== undefined)
                input.approve = msg.approve;
            var content = (_a = msg.reason) !== null && _a !== void 0 ? _a : msg.feedback;
            if (content !== undefined)
                input.content = content;
        }
    },
    toAutoClassifierInput: function (input) {
        if (typeof input.message === 'string') {
            return "to ".concat(input.to, ": ").concat(input.message);
        }
        switch (input.message.type) {
            case 'shutdown_request':
                return "shutdown_request to ".concat(input.to);
            case 'shutdown_response':
                return "shutdown_response ".concat(input.message.approve ? 'approve' : 'reject', " ").concat(input.message.request_id);
            case 'plan_approval_response':
                return "plan_approval ".concat(input.message.approve ? 'approve' : 'reject', " to ").concat(input.to);
        }
    },
    checkPermissions: function (input, _context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if ((0, bun_bundle_1.feature)('UDS_INBOX') && (0, peerAddress_js_1.parseAddress)(input.to).scheme === 'bridge') {
                    return [2 /*return*/, {
                            behavior: 'ask',
                            message: "Send a message to Remote Control session ".concat(input.to, "? It arrives as a user prompt on the receiving Claude (possibly another machine) via Anthropic's servers."),
                            // safetyCheck (not mode) — permissions.ts guards this before both
                            // bypassPermissions (step 1g) and auto-mode's allowlist/classifier.
                            // Cross-machine prompt injection must stay bypass-immune.
                            decisionReason: {
                                type: 'safetyCheck',
                                reason: 'Cross-machine bridge message requires explicit user consent',
                                classifierApprovable: false,
                            },
                        }];
                }
                return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
            });
        });
    },
    validateInput: function (input, _context) {
        return __awaiter(this, void 0, void 0, function () {
            var addr;
            return __generator(this, function (_a) {
                if (input.to.trim().length === 0) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'to must not be empty',
                            errorCode: 9,
                        }];
                }
                addr = (0, peerAddress_js_1.parseAddress)(input.to);
                if ((addr.scheme === 'bridge' || addr.scheme === 'uds') &&
                    addr.target.trim().length === 0) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'address target must not be empty',
                            errorCode: 9,
                        }];
                }
                if (input.to.includes('@')) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'to must be a bare teammate name or "*" — there is only one team per session',
                            errorCode: 9,
                        }];
                }
                if ((0, bun_bundle_1.feature)('UDS_INBOX') && (0, peerAddress_js_1.parseAddress)(input.to).scheme === 'bridge') {
                    // Structured-message rejection first — it's the permanent constraint.
                    // Showing "not connected" first would make the user reconnect only to
                    // hit this error on retry.
                    if (typeof input.message !== 'string') {
                        return [2 /*return*/, {
                                result: false,
                                message: 'structured messages cannot be sent cross-session — only plain text',
                                errorCode: 9,
                            }];
                    }
                    // postInterClaudeMessage derives from= via getReplBridgeHandle() —
                    // check handle directly for the init-timing window. Also check
                    // isReplBridgeActive() to reject outbound-only (CCR mirror) mode
                    // where the bridge is write-only and peer messaging is unsupported.
                    if (!(0, replBridgeHandle_js_1.getReplBridgeHandle)() || !(0, state_js_1.isReplBridgeActive)()) {
                        return [2 /*return*/, {
                                result: false,
                                message: 'Remote Control is not connected — cannot send to a bridge: target. Reconnect with /remote-control first.',
                                errorCode: 9,
                            }];
                    }
                    return [2 /*return*/, { result: true }];
                }
                if ((0, bun_bundle_1.feature)('UDS_INBOX') &&
                    (0, peerAddress_js_1.parseAddress)(input.to).scheme === 'uds' &&
                    typeof input.message === 'string') {
                    // UDS cross-session send: summary isn't rendered (UI.tsx returns null
                    // for string messages), so don't require it. Structured messages fall
                    // through to the rejection below.
                    return [2 /*return*/, { result: true }];
                }
                if (typeof input.message === 'string') {
                    if (!input.summary || input.summary.trim().length === 0) {
                        return [2 /*return*/, {
                                result: false,
                                message: 'summary is required when message is a string',
                                errorCode: 9,
                            }];
                    }
                    return [2 /*return*/, { result: true }];
                }
                if (input.to === '*') {
                    return [2 /*return*/, {
                            result: false,
                            message: 'structured messages cannot be broadcast (to: "*")',
                            errorCode: 9,
                        }];
                }
                if ((0, bun_bundle_1.feature)('UDS_INBOX') && (0, peerAddress_js_1.parseAddress)(input.to).scheme !== 'other') {
                    return [2 /*return*/, {
                            result: false,
                            message: 'structured messages cannot be sent cross-session — only plain text',
                            errorCode: 9,
                        }];
                }
                if (input.message.type === 'shutdown_response' &&
                    input.to !== constants_js_1.TEAM_LEAD_NAME) {
                    return [2 /*return*/, {
                            result: false,
                            message: "shutdown_response must be sent to \"".concat(constants_js_1.TEAM_LEAD_NAME, "\""),
                            errorCode: 9,
                        }];
                }
                if (input.message.type === 'shutdown_response' &&
                    !input.message.approve &&
                    (!input.message.reason || input.message.reason.trim().length === 0)) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'reason is required when rejecting a shutdown request',
                            errorCode: 9,
                        }];
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getPrompt)()];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (data, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: [
                {
                    type: 'text',
                    text: (0, slowOperations_js_1.jsonStringify)(data),
                },
            ],
        };
    },
    call: function (input, context, canUseTool, assistantMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var addr, postInterClaudeMessage, result, preview, sendToUdsSocket, preview, e_1, appState, registered, agentId, task, result, e_2, result, e_3;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!((0, bun_bundle_1.feature)('UDS_INBOX') && typeof input.message === 'string')) return [3 /*break*/, 6];
                        addr = (0, peerAddress_js_1.parseAddress)(input.to);
                        if (!(addr.scheme === 'bridge')) return [3 /*break*/, 2];
                        // Re-check handle — checkPermissions blocks on user approval (can be
                        // minutes). validateInput's check is stale if the bridge dropped
                        // during the prompt wait; without this, from="unknown" ships.
                        // Also re-check isReplBridgeActive for outbound-only mode.
                        if (!(0, replBridgeHandle_js_1.getReplBridgeHandle)() || !(0, state_js_1.isReplBridgeActive)()) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        message: "Remote Control disconnected before send \u2014 cannot deliver to ".concat(input.to),
                                    },
                                }];
                        }
                        postInterClaudeMessage = require('../../bridge/peerSessions.js').postInterClaudeMessage;
                        return [4 /*yield*/, postInterClaudeMessage(addr.target, input.message)];
                    case 1:
                        result = _d.sent();
                        preview = input.summary || (0, format_js_1.truncate)(input.message, 50);
                        return [2 /*return*/, {
                                data: {
                                    success: result.ok,
                                    message: result.ok
                                        ? "\u201C".concat(preview, "\u201D \u2192 ").concat(input.to)
                                        : "Failed to send to ".concat(input.to, ": ").concat((_a = result.error) !== null && _a !== void 0 ? _a : 'unknown'),
                                },
                            }];
                    case 2:
                        if (!(addr.scheme === 'uds')) return [3 /*break*/, 6];
                        sendToUdsSocket = require('../../utils/udsClient.js').sendToUdsSocket;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, sendToUdsSocket(addr.target, input.message)];
                    case 4:
                        _d.sent();
                        preview = input.summary || (0, format_js_1.truncate)(input.message, 50);
                        return [2 /*return*/, {
                                data: {
                                    success: true,
                                    message: "\u201C".concat(preview, "\u201D \u2192 ").concat(input.to),
                                },
                            }];
                    case 5:
                        e_1 = _d.sent();
                        return [2 /*return*/, {
                                data: {
                                    success: false,
                                    message: "Failed to send to ".concat(input.to, ": ").concat((0, errors_js_1.errorMessage)(e_1)),
                                },
                            }];
                    case 6:
                        if (!(typeof input.message === 'string' && input.to !== '*')) return [3 /*break*/, 14];
                        appState = context.getAppState();
                        registered = appState.agentNameRegistry.get(input.to);
                        agentId = registered !== null && registered !== void 0 ? registered : (0, ids_js_1.toAgentId)(input.to);
                        if (!agentId) return [3 /*break*/, 14];
                        task = appState.tasks[agentId];
                        if (!((0, LocalAgentTask_js_1.isLocalAgentTask)(task) && !(0, LocalMainSessionTask_js_1.isMainSessionTask)(task))) return [3 /*break*/, 11];
                        if (task.status === 'running') {
                            (0, LocalAgentTask_js_1.queuePendingMessage)(agentId, input.message, (_b = context.setAppStateForTasks) !== null && _b !== void 0 ? _b : context.setAppState);
                            return [2 /*return*/, {
                                    data: {
                                        success: true,
                                        message: "Message queued for delivery to ".concat(input.to, " at its next tool round."),
                                    },
                                }];
                        }
                        _d.label = 7;
                    case 7:
                        _d.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, (0, resumeAgent_js_1.resumeAgentBackground)({
                                agentId: agentId,
                                prompt: input.message,
                                toolUseContext: context,
                                canUseTool: canUseTool,
                                invokingRequestId: assistantMessage === null || assistantMessage === void 0 ? void 0 : assistantMessage.requestId,
                            })];
                    case 8:
                        result = _d.sent();
                        return [2 /*return*/, {
                                data: {
                                    success: true,
                                    message: "Agent \"".concat(input.to, "\" was stopped (").concat(task.status, "); resumed it in the background with your message. You'll be notified when it finishes. Output: ").concat(result.outputFile),
                                },
                            }];
                    case 9:
                        e_2 = _d.sent();
                        return [2 /*return*/, {
                                data: {
                                    success: false,
                                    message: "Agent \"".concat(input.to, "\" is stopped (").concat(task.status, ") and could not be resumed: ").concat((0, errors_js_1.errorMessage)(e_2)),
                                },
                            }];
                    case 10: return [3 /*break*/, 14];
                    case 11:
                        _d.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, (0, resumeAgent_js_1.resumeAgentBackground)({
                                agentId: agentId,
                                prompt: input.message,
                                toolUseContext: context,
                                canUseTool: canUseTool,
                                invokingRequestId: assistantMessage === null || assistantMessage === void 0 ? void 0 : assistantMessage.requestId,
                            })];
                    case 12:
                        result = _d.sent();
                        return [2 /*return*/, {
                                data: {
                                    success: true,
                                    message: "Agent \"".concat(input.to, "\" had no active task; resumed from transcript in the background with your message. You'll be notified when it finishes. Output: ").concat(result.outputFile),
                                },
                            }];
                    case 13:
                        e_3 = _d.sent();
                        return [2 /*return*/, {
                                data: {
                                    success: false,
                                    message: "Agent \"".concat(input.to, "\" is registered but has no transcript to resume. It may have been cleaned up. (").concat((0, errors_js_1.errorMessage)(e_3), ")"),
                                },
                            }];
                    case 14:
                        if (typeof input.message === 'string') {
                            if (input.to === '*') {
                                return [2 /*return*/, handleBroadcast(input.message, input.summary, context)];
                            }
                            return [2 /*return*/, handleMessage(input.to, input.message, input.summary, context)];
                        }
                        if (input.to === '*') {
                            throw new Error('structured messages cannot be broadcast');
                        }
                        switch (input.message.type) {
                            case 'shutdown_request':
                                return [2 /*return*/, handleShutdownRequest(input.to, input.message.reason, context)];
                            case 'shutdown_response':
                                if (input.message.approve) {
                                    return [2 /*return*/, handleShutdownApproval(input.message.request_id, context)];
                                }
                                return [2 /*return*/, handleShutdownRejection(input.message.request_id, input.message.reason)];
                            case 'plan_approval_response':
                                if (input.message.approve) {
                                    return [2 /*return*/, handlePlanApproval(input.to, input.message.request_id, context)];
                                }
                                return [2 /*return*/, handlePlanRejection(input.to, input.message.request_id, (_c = input.message.feedback) !== null && _c !== void 0 ? _c : 'Plan needs revision', context)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
});
