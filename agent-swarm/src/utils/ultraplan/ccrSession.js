"use strict";
// CCR session polling for /ultraplan. Waits for an approved ExitPlanMode
// tool_result, then extracts the plan text. Uses pollRemoteSessionEvents
// (shared with RemoteAgentTask) for pagination + typed SDKMessage[].
// Plan mode is set via set_permission_mode control_request in
// teleportToRemote's CreateSession events array.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.ExitPlanModeScanner = exports.ULTRAPLAN_TELEPORT_SENTINEL = exports.UltraplanPollError = void 0;
exports.pollForApprovedExitPlanMode = pollForApprovedExitPlanMode;
var constants_js_1 = require("../../tools/ExitPlanModeTool/constants.js");
var debug_js_1 = require("../debug.js");
var sleep_js_1 = require("../sleep.js");
var api_js_1 = require("../teleport/api.js");
var teleport_js_1 = require("../teleport.js");
var POLL_INTERVAL_MS = 3000;
// pollRemoteSessionEvents doesn't retry. A 30min poll makes ~600 calls;
// at any nonzero 5xx rate one blip would kill the run.
var MAX_CONSECUTIVE_FAILURES = 5;
var UltraplanPollError = /** @class */ (function (_super) {
    __extends(UltraplanPollError, _super);
    function UltraplanPollError(message, reason, rejectCount, options) {
        var _this = _super.call(this, message, options) || this;
        _this.reason = reason;
        _this.rejectCount = rejectCount;
        _this.name = 'UltraplanPollError';
        return _this;
    }
    return UltraplanPollError;
}(Error));
exports.UltraplanPollError = UltraplanPollError;
// Sentinel string the browser PlanModal includes in the feedback when the user
// clicks "teleport back to terminal". Plan text follows on the next line.
exports.ULTRAPLAN_TELEPORT_SENTINEL = '__ULTRAPLAN_TELEPORT_LOCAL__';
/**
 * Pure stateful classifier for the CCR event stream. Ingests SDKMessage[]
 * batches (as delivered by pollRemoteSessionEvents) and returns the current
 * ExitPlanMode verdict. No I/O, no timers — feed it synthetic or recorded
 * events for unit tests and offline replay.
 *
 * Precedence (approved > terminated > rejected > pending > unchanged):
 * pollRemoteSessionEvents paginates up to 50 pages per call, so one ingest
 * can span seconds of session activity. A batch may contain both an approved
 * tool_result AND a subsequent {type:'result'} (user approved, then remote
 * crashed). The approved plan is real and in threadstore — don't drop it.
 */
var ExitPlanModeScanner = /** @class */ (function () {
    function ExitPlanModeScanner() {
        this.exitPlanCalls = [];
        this.results = new Map();
        this.rejectedIds = new Set();
        this.terminated = null;
        this.rescanAfterRejection = false;
        this.everSeenPending = false;
    }
    Object.defineProperty(ExitPlanModeScanner.prototype, "rejectCount", {
        get: function () {
            return this.rejectedIds.size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExitPlanModeScanner.prototype, "hasPendingPlan", {
        /**
         * True when an ExitPlanMode tool_use exists with no tool_result yet —
         * the remote is showing the approval dialog in the browser.
         */
        get: function () {
            var _this = this;
            var id = this.exitPlanCalls.findLast(function (c) { return !_this.rejectedIds.has(c); });
            return id !== undefined && !this.results.has(id);
        },
        enumerable: false,
        configurable: true
    });
    ExitPlanModeScanner.prototype.ingest = function (newEvents) {
        for (var _i = 0, newEvents_1 = newEvents; _i < newEvents_1.length; _i++) {
            var m = newEvents_1[_i];
            if (m.type === 'assistant') {
                for (var _a = 0, _b = m.message.content; _a < _b.length; _a++) {
                    var block = _b[_a];
                    if (block.type !== 'tool_use')
                        continue;
                    var tu = block;
                    if (tu.name === constants_js_1.EXIT_PLAN_MODE_V2_TOOL_NAME) {
                        this.exitPlanCalls.push(tu.id);
                    }
                }
            }
            else if (m.type === 'user') {
                var content = m.message.content;
                if (!Array.isArray(content))
                    continue;
                for (var _c = 0, content_1 = content; _c < content_1.length; _c++) {
                    var block = content_1[_c];
                    if (block.type === 'tool_result') {
                        this.results.set(block.tool_use_id, block);
                    }
                }
            }
            else if (m.type === 'result' && m.subtype !== 'success') {
                // result(success) fires after EVERY CCR turn
                // If the remote asks a clarifying question (turn ends without
                // ExitPlanMode), we must keep polling — the user can reply in
                // the browser and reach ExitPlanMode in a later turn.
                // Only error subtypes (error_during_execution, error_max_turns,
                // etc.) mean the session is actually dead.
                this.terminated = { subtype: m.subtype };
            }
        }
        // Skip-scan when nothing could have moved the target: no new events, no
        // rejection last tick. A rejection moves the newest-non-rejected target.
        var shouldScan = newEvents.length > 0 || this.rescanAfterRejection;
        this.rescanAfterRejection = false;
        var found = null;
        if (shouldScan) {
            for (var i = this.exitPlanCalls.length - 1; i >= 0; i--) {
                var id = this.exitPlanCalls[i];
                if (this.rejectedIds.has(id))
                    continue;
                var tr = this.results.get(id);
                if (!tr) {
                    found = { kind: 'pending' };
                }
                else if (tr.is_error === true) {
                    var teleportPlan = extractTeleportPlan(tr.content);
                    found =
                        teleportPlan !== null
                            ? { kind: 'teleport', plan: teleportPlan }
                            : { kind: 'rejected', id: id };
                }
                else {
                    found = { kind: 'approved', plan: extractApprovedPlan(tr.content) };
                }
                break;
            }
            if ((found === null || found === void 0 ? void 0 : found.kind) === 'approved' || (found === null || found === void 0 ? void 0 : found.kind) === 'teleport')
                return found;
        }
        // Bookkeeping before the terminated check — a batch can contain BOTH a
        // rejected tool_result and a {type:'result'}; rejectCount must reflect
        // the rejection even though terminated takes return precedence.
        if ((found === null || found === void 0 ? void 0 : found.kind) === 'rejected') {
            this.rejectedIds.add(found.id);
            this.rescanAfterRejection = true;
        }
        if (this.terminated) {
            return { kind: 'terminated', subtype: this.terminated.subtype };
        }
        if ((found === null || found === void 0 ? void 0 : found.kind) === 'rejected') {
            return found;
        }
        if ((found === null || found === void 0 ? void 0 : found.kind) === 'pending') {
            this.everSeenPending = true;
            return found;
        }
        return { kind: 'unchanged' };
    };
    return ExitPlanModeScanner;
}());
exports.ExitPlanModeScanner = ExitPlanModeScanner;
// Returns the approved plan text and where the user wants it executed.
// 'approved' scrapes from the "## Approved Plan:" marker (ExitPlanModeV2Tool
// default branch) — the model writes plan to a file inside CCR and calls
// ExitPlanMode({allowedPrompts}), so input.plan is never in threadstore.
// 'teleport' scrapes from the ULTRAPLAN_TELEPORT_SENTINEL in a deny tool_result —
// browser sends a rejection so the remote stays in plan mode, with the plan
// text embedded in the feedback. Normal rejections (is_error === true, no
// sentinel) are tracked and skipped so the user can iterate in the browser.
function pollForApprovedExitPlanMode(sessionId, timeoutMs, onPhaseChange, shouldStop) {
    return __awaiter(this, void 0, void 0, function () {
        var deadline, scanner, cursor, failures, lastPhase, newEvents, sessionStatus, resp, e_1, transient, result, quietIdle, phase;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deadline = Date.now() + timeoutMs;
                    scanner = new ExitPlanModeScanner();
                    cursor = null;
                    failures = 0;
                    lastPhase = 'running';
                    _a.label = 1;
                case 1:
                    if (!(Date.now() < deadline)) return [3 /*break*/, 8];
                    if (shouldStop === null || shouldStop === void 0 ? void 0 : shouldStop()) {
                        throw new UltraplanPollError('poll stopped by caller', 'stopped', scanner.rejectCount);
                    }
                    newEvents = void 0;
                    sessionStatus = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, (0, teleport_js_1.pollRemoteSessionEvents)(sessionId, cursor)];
                case 3:
                    resp = _a.sent();
                    newEvents = resp.newEvents;
                    cursor = resp.lastEventId;
                    sessionStatus = resp.sessionStatus;
                    failures = 0;
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    transient = (0, api_js_1.isTransientNetworkError)(e_1);
                    if (!transient || ++failures >= MAX_CONSECUTIVE_FAILURES) {
                        throw new UltraplanPollError(e_1 instanceof Error ? e_1.message : String(e_1), 'network_or_unknown', scanner.rejectCount, { cause: e_1 });
                    }
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(POLL_INTERVAL_MS)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 6:
                    result = void 0;
                    try {
                        result = scanner.ingest(newEvents);
                    }
                    catch (e) {
                        throw new UltraplanPollError(e instanceof Error ? e.message : String(e), 'extract_marker_missing', scanner.rejectCount);
                    }
                    if (result.kind === 'approved') {
                        return [2 /*return*/, {
                                plan: result.plan,
                                rejectCount: scanner.rejectCount,
                                executionTarget: 'remote',
                            }];
                    }
                    if (result.kind === 'teleport') {
                        return [2 /*return*/, {
                                plan: result.plan,
                                rejectCount: scanner.rejectCount,
                                executionTarget: 'local',
                            }];
                    }
                    if (result.kind === 'terminated') {
                        throw new UltraplanPollError("remote session ended (".concat(result.subtype, ") before plan approval"), 'terminated', scanner.rejectCount);
                    }
                    quietIdle = (sessionStatus === 'idle' || sessionStatus === 'requires_action') &&
                        newEvents.length === 0;
                    phase = scanner.hasPendingPlan
                        ? 'plan_ready'
                        : quietIdle
                            ? 'needs_input'
                            : 'running';
                    if (phase !== lastPhase) {
                        (0, debug_js_1.logForDebugging)("[ultraplan] phase ".concat(lastPhase, " \u2192 ").concat(phase));
                        lastPhase = phase;
                        onPhaseChange === null || onPhaseChange === void 0 ? void 0 : onPhaseChange(phase);
                    }
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(POLL_INTERVAL_MS)];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 8: throw new UltraplanPollError(scanner.everSeenPending
                    ? "no approval after ".concat(timeoutMs / 1000, "s")
                    : "ExitPlanMode never reached after ".concat(timeoutMs / 1000, "s (the remote container failed to start, or session ID mismatch?)"), scanner.everSeenPending ? 'timeout_pending' : 'timeout_no_plan', scanner.rejectCount);
            }
        });
    });
}
// tool_result content may be string or [{type:'text',text}] depending on
// threadstore encoding.
function contentToText(content) {
    return typeof content === 'string'
        ? content
        : Array.isArray(content)
            ? content.map(function (b) { return ('text' in b ? b.text : ''); }).join('')
            : '';
}
// Extracts the plan text after the ULTRAPLAN_TELEPORT_SENTINEL marker.
// Returns null when the sentinel is absent — callers treat null as a normal
// user rejection (scanner falls through to { kind: 'rejected' }).
function extractTeleportPlan(content) {
    var text = contentToText(content);
    var marker = "".concat(exports.ULTRAPLAN_TELEPORT_SENTINEL, "\n");
    var idx = text.indexOf(marker);
    if (idx === -1)
        return null;
    return text.slice(idx + marker.length).trimEnd();
}
// Plan is echoed in tool_result content as "## Approved Plan:\n<text>" or
// "## Approved Plan (edited by user):\n<text>" (ExitPlanModeV2Tool).
function extractApprovedPlan(content) {
    var text = contentToText(content);
    // Try both markers — edited plans use a different label.
    var markers = [
        '## Approved Plan (edited by user):\n',
        '## Approved Plan:\n',
    ];
    for (var _i = 0, markers_1 = markers; _i < markers_1.length; _i++) {
        var marker = markers_1[_i];
        var idx = text.indexOf(marker);
        if (idx !== -1) {
            return text.slice(idx + marker.length).trimEnd();
        }
    }
    throw new Error("ExitPlanMode approved but tool_result has no \"## Approved Plan:\" marker \u2014 remote may have hit the empty-plan or isAgent branch. Content preview: ".concat(text.slice(0, 200)));
}
