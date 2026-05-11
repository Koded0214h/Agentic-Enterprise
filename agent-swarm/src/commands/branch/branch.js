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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveFirstPrompt = deriveFirstPrompt;
exports.call = call;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
var json_js_1 = require("../../utils/json.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
/**
 * Derive a single-line title base from the first user message.
 * Collapses whitespace — multiline first messages (pasted stacks, code)
 * otherwise flow into the saved title and break the resume hint.
 */
function deriveFirstPrompt(firstUserMessage) {
    var _a, _b;
    var content = (_a = firstUserMessage === null || firstUserMessage === void 0 ? void 0 : firstUserMessage.message) === null || _a === void 0 ? void 0 : _a.content;
    if (!content)
        return 'Branched conversation';
    var raw = typeof content === 'string'
        ? content
        : (_b = content.find(function (block) {
            return block.type === 'text';
        })) === null || _b === void 0 ? void 0 : _b.text;
    if (!raw)
        return 'Branched conversation';
    return (raw.replace(/\s+/g, ' ').trim().slice(0, 100) || 'Branched conversation');
}
/**
 * Creates a fork of the current conversation by copying from the transcript file.
 * Preserves all original metadata (timestamps, gitBranch, etc.) while updating
 * sessionId and adding forkedFrom traceability.
 */
function createFork(customTitle) {
    return __awaiter(this, void 0, void 0, function () {
        var forkSessionId, originalSessionId, projectDir, forkSessionPath, currentTranscriptPath, transcriptContent, _a, entries, mainConversationEntries, contentReplacementRecords, parentUuid, lines, serializedMessages, _i, mainConversationEntries_1, entry, forkedEntry, serialized, forkedReplacementEntry;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    forkSessionId = (0, crypto_1.randomUUID)();
                    originalSessionId = (0, state_js_1.getSessionId)();
                    projectDir = (0, sessionStorage_js_1.getProjectDir)((0, state_js_1.getOriginalCwd)());
                    forkSessionPath = (0, sessionStorage_js_1.getTranscriptPathForSession)(forkSessionId);
                    currentTranscriptPath = (0, sessionStorage_js_1.getTranscriptPath)();
                    // Ensure project directory exists
                    return [4 /*yield*/, (0, promises_1.mkdir)(projectDir, { recursive: true, mode: 448 })
                        // Read current transcript file
                    ];
                case 1:
                    // Ensure project directory exists
                    _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readFile)(currentTranscriptPath)];
                case 3:
                    transcriptContent = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    throw new Error('No conversation to branch');
                case 5:
                    if (transcriptContent.length === 0) {
                        throw new Error('No conversation to branch');
                    }
                    entries = (0, json_js_1.parseJSONL)(transcriptContent);
                    mainConversationEntries = entries.filter(function (entry) {
                        return (0, sessionStorage_js_1.isTranscriptMessage)(entry) && !entry.isSidechain;
                    });
                    contentReplacementRecords = entries
                        .filter(function (entry) {
                        return entry.type === 'content-replacement' &&
                            entry.sessionId === originalSessionId;
                    })
                        .flatMap(function (entry) { return entry.replacements; });
                    if (mainConversationEntries.length === 0) {
                        throw new Error('No messages to branch');
                    }
                    parentUuid = null;
                    lines = [];
                    serializedMessages = [];
                    for (_i = 0, mainConversationEntries_1 = mainConversationEntries; _i < mainConversationEntries_1.length; _i++) {
                        entry = mainConversationEntries_1[_i];
                        forkedEntry = __assign(__assign({}, entry), { sessionId: forkSessionId, parentUuid: parentUuid, isSidechain: false, forkedFrom: {
                                sessionId: originalSessionId,
                                messageUuid: entry.uuid,
                            } });
                        serialized = __assign(__assign({}, entry), { sessionId: forkSessionId });
                        serializedMessages.push(serialized);
                        lines.push((0, slowOperations_js_1.jsonStringify)(forkedEntry));
                        if (entry.type !== 'progress') {
                            parentUuid = entry.uuid;
                        }
                    }
                    // Append content-replacement entry (if any) with the fork's sessionId.
                    // Written as a SINGLE entry (same shape as insertContentReplacement) so
                    // loadTranscriptFile's content-replacement branch picks it up.
                    if (contentReplacementRecords.length > 0) {
                        forkedReplacementEntry = {
                            type: 'content-replacement',
                            sessionId: forkSessionId,
                            replacements: contentReplacementRecords,
                        };
                        lines.push((0, slowOperations_js_1.jsonStringify)(forkedReplacementEntry));
                    }
                    // Write the fork session file
                    return [4 /*yield*/, (0, promises_1.writeFile)(forkSessionPath, lines.join('\n') + '\n', {
                            encoding: 'utf8',
                            mode: 384,
                        })];
                case 6:
                    // Write the fork session file
                    _b.sent();
                    return [2 /*return*/, {
                            sessionId: forkSessionId,
                            title: customTitle,
                            forkPath: forkSessionPath,
                            serializedMessages: serializedMessages,
                            contentReplacementRecords: contentReplacementRecords,
                        }];
            }
        });
    });
}
/**
 * Generates a unique fork name by checking for collisions with existing session names.
 * If "baseName (Branch)" already exists, tries "baseName (Branch 2)", "baseName (Branch 3)", etc.
 */
function getUniqueForkName(baseName) {
    return __awaiter(this, void 0, void 0, function () {
        var candidateName, existingWithExactName, existingForks, usedNumbers, forkNumberPattern, _i, existingForks_1, session, match, nextNumber;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    candidateName = "".concat(baseName, " (Branch)");
                    return [4 /*yield*/, (0, sessionStorage_js_1.searchSessionsByCustomTitle)(candidateName, { exact: true })];
                case 1:
                    existingWithExactName = _b.sent();
                    if (existingWithExactName.length === 0) {
                        return [2 /*return*/, candidateName];
                    }
                    return [4 /*yield*/, (0, sessionStorage_js_1.searchSessionsByCustomTitle)("".concat(baseName, " (Branch"))
                        // Extract existing fork numbers to find the next available
                    ];
                case 2:
                    existingForks = _b.sent();
                    usedNumbers = new Set([1]) // Consider " (Branch)" as number 1
                    ;
                    forkNumberPattern = new RegExp("^".concat((0, stringUtils_js_1.escapeRegExp)(baseName), " \\(Branch(?: (\\d+))?\\)$"));
                    for (_i = 0, existingForks_1 = existingForks; _i < existingForks_1.length; _i++) {
                        session = existingForks_1[_i];
                        match = (_a = session.customTitle) === null || _a === void 0 ? void 0 : _a.match(forkNumberPattern);
                        if (match) {
                            if (match[1]) {
                                usedNumbers.add(parseInt(match[1], 10));
                            }
                            else {
                                usedNumbers.add(1); // " (Branch)" without number is treated as 1
                            }
                        }
                    }
                    nextNumber = 2;
                    while (usedNumbers.has(nextNumber)) {
                        nextNumber++;
                    }
                    return [2 /*return*/, "".concat(baseName, " (Branch ").concat(nextNumber, ")")];
            }
        });
    });
}
function call(onDone, context, args) {
    return __awaiter(this, void 0, void 0, function () {
        var customTitle, originalSessionId, _a, sessionId, title, forkPath, serializedMessages, contentReplacementRecords, now, firstPrompt, baseName, effectiveTitle, forkLog, titleInfo, resumeHint, successMessage, error_1, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    customTitle = (args === null || args === void 0 ? void 0 : args.trim()) || undefined;
                    originalSessionId = (0, state_js_1.getSessionId)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, createFork(customTitle)
                        // Build LogOption for resume
                    ];
                case 2:
                    _a = _b.sent(), sessionId = _a.sessionId, title = _a.title, forkPath = _a.forkPath, serializedMessages = _a.serializedMessages, contentReplacementRecords = _a.contentReplacementRecords;
                    now = new Date();
                    firstPrompt = deriveFirstPrompt(serializedMessages.find(function (m) { return m.type === 'user'; }));
                    baseName = title !== null && title !== void 0 ? title : firstPrompt;
                    return [4 /*yield*/, getUniqueForkName(baseName)];
                case 3:
                    effectiveTitle = _b.sent();
                    return [4 /*yield*/, (0, sessionStorage_js_1.saveCustomTitle)(sessionId, effectiveTitle, forkPath)];
                case 4:
                    _b.sent();
                    (0, index_js_1.logEvent)('tengu_conversation_forked', {
                        message_count: serializedMessages.length,
                        has_custom_title: !!title,
                    });
                    forkLog = {
                        date: now.toISOString().split('T')[0],
                        messages: serializedMessages,
                        fullPath: forkPath,
                        value: now.getTime(),
                        created: now,
                        modified: now,
                        firstPrompt: firstPrompt,
                        messageCount: serializedMessages.length,
                        isSidechain: false,
                        sessionId: sessionId,
                        customTitle: effectiveTitle,
                        contentReplacements: contentReplacementRecords,
                    };
                    titleInfo = title ? " \"".concat(title, "\"") : '';
                    resumeHint = "\nTo resume the original: claude -r ".concat(originalSessionId);
                    successMessage = "Branched conversation".concat(titleInfo, ". You are now in the branch.").concat(resumeHint);
                    if (!context.resume) return [3 /*break*/, 6];
                    return [4 /*yield*/, context.resume(sessionId, forkLog, 'fork')];
                case 5:
                    _b.sent();
                    onDone(successMessage, { display: 'system' });
                    return [3 /*break*/, 7];
                case 6:
                    // Fallback if resume not available
                    onDone("Branched conversation".concat(titleInfo, ". Resume with: /resume ").concat(sessionId));
                    _b.label = 7;
                case 7: return [2 /*return*/, null];
                case 8:
                    error_1 = _b.sent();
                    message = error_1 instanceof Error ? error_1.message : 'Unknown error occurred';
                    onDone("Failed to branch conversation: ".concat(message));
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    });
}
