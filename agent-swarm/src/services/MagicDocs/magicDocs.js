"use strict";
/**
 * Magic Docs automatically maintains markdown documentation files marked with special headers.
 * When a file with "# MAGIC DOC: [title]" is read, it runs periodically in the background
 * using a forked subagent to update the document with new learnings from the conversation.
 *
 * See docs/magic-docs.md for more information.
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTrackedMagicDocs = clearTrackedMagicDocs;
exports.detectMagicDocHeader = detectMagicDocHeader;
exports.registerMagicDoc = registerMagicDoc;
exports.initMagicDocs = initMagicDocs;
var runAgent_js_1 = require("../../tools/AgentTool/runAgent.js");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var FileReadTool_js_1 = require("../../tools/FileReadTool/FileReadTool.js");
var errors_js_1 = require("../../utils/errors.js");
var fileStateCache_js_1 = require("../../utils/fileStateCache.js");
var postSamplingHooks_js_1 = require("../../utils/hooks/postSamplingHooks.js");
var messages_js_1 = require("../../utils/messages.js");
var sequential_js_1 = require("../../utils/sequential.js");
var prompts_js_1 = require("./prompts.js");
// Magic Doc header pattern: # MAGIC DOC: [title]
// Matches at the start of the file (first line)
var MAGIC_DOC_HEADER_PATTERN = /^#\s*MAGIC\s+DOC:\s*(.+)$/im;
// Pattern to match italics on the line immediately after the header
var ITALICS_PATTERN = /^[_*](.+?)[_*]\s*$/m;
var trackedMagicDocs = new Map();
function clearTrackedMagicDocs() {
    trackedMagicDocs.clear();
}
/**
 * Detect if a file content contains a Magic Doc header
 * Returns an object with title and optional instructions, or null if not a magic doc
 */
function detectMagicDocHeader(content) {
    var match = content.match(MAGIC_DOC_HEADER_PATTERN);
    if (!match || !match[1]) {
        return null;
    }
    var title = match[1].trim();
    // Look for italics on the next line after the header (allow one optional blank line)
    var headerEndIndex = match.index + match[0].length;
    var afterHeader = content.slice(headerEndIndex);
    // Match: newline, optional blank line, then content line
    var nextLineMatch = afterHeader.match(/^\s*\n(?:\s*\n)?(.+?)(?:\n|$)/);
    if (nextLineMatch && nextLineMatch[1]) {
        var nextLine = nextLineMatch[1];
        var italicsMatch = nextLine.match(ITALICS_PATTERN);
        if (italicsMatch && italicsMatch[1]) {
            var instructions = italicsMatch[1].trim();
            return {
                title: title,
                instructions: instructions,
            };
        }
    }
    return { title: title };
}
/**
 * Register a file as a Magic Doc when it's read
 * Only registers once per file path - the hook always reads latest content
 */
function registerMagicDoc(filePath) {
    // Only register if not already tracked
    if (!trackedMagicDocs.has(filePath)) {
        trackedMagicDocs.set(filePath, {
            path: filePath,
        });
    }
}
/**
 * Create Magic Docs agent definition
 */
function getMagicDocsAgent() {
    return {
        agentType: 'magic-docs',
        whenToUse: 'Update Magic Docs',
        tools: [constants_js_1.FILE_EDIT_TOOL_NAME], // Only allow Edit
        model: 'sonnet',
        source: 'built-in',
        baseDir: 'built-in',
        getSystemPrompt: function () { return ''; }, // Will use override systemPrompt
    };
}
/**
 * Update a single Magic Doc
 */
function updateMagicDoc(docInfo, context) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, systemPrompt, userContext, systemContext, toolUseContext, clonedReadFileState, clonedToolUseContext, currentDoc, result, output, e_1, detected, userPrompt, canUseTool, _a, _b, _c, _message, e_2_1;
        var _this = this;
        var _d, e_2, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    messages = context.messages, systemPrompt = context.systemPrompt, userContext = context.userContext, systemContext = context.systemContext, toolUseContext = context.toolUseContext;
                    clonedReadFileState = (0, fileStateCache_js_1.cloneFileStateCache)(toolUseContext.readFileState);
                    clonedReadFileState.delete(docInfo.path);
                    clonedToolUseContext = __assign(__assign({}, toolUseContext), { readFileState: clonedReadFileState });
                    currentDoc = '';
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, FileReadTool_js_1.FileReadTool.call({ file_path: docInfo.path }, clonedToolUseContext)];
                case 2:
                    result = _g.sent();
                    output = result.data;
                    if (output.type === 'text') {
                        currentDoc = output.file.content;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _g.sent();
                    // FileReadTool wraps ENOENT in a plain Error("File does not exist...") with
                    // no .code, so check the message in addition to isFsInaccessible (EACCES/EPERM).
                    if ((0, errors_js_1.isFsInaccessible)(e_1) ||
                        (e_1 instanceof Error && e_1.message.startsWith('File does not exist'))) {
                        trackedMagicDocs.delete(docInfo.path);
                        return [2 /*return*/];
                    }
                    throw e_1;
                case 4:
                    detected = detectMagicDocHeader(currentDoc);
                    if (!detected) {
                        // File no longer has magic doc header, remove from tracking
                        trackedMagicDocs.delete(docInfo.path);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, prompts_js_1.buildMagicDocsUpdatePrompt)(currentDoc, docInfo.path, detected.title, detected.instructions)
                        // Create a custom canUseTool that only allows Edit for magic doc files
                    ];
                case 5:
                    userPrompt = _g.sent();
                    canUseTool = function (tool, input) { return __awaiter(_this, void 0, void 0, function () {
                        var filePath;
                        return __generator(this, function (_a) {
                            if (tool.name === constants_js_1.FILE_EDIT_TOOL_NAME &&
                                typeof input === 'object' &&
                                input !== null &&
                                'file_path' in input) {
                                filePath = input.file_path;
                                if (typeof filePath === 'string' && filePath === docInfo.path) {
                                    return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
                                }
                            }
                            return [2 /*return*/, {
                                    behavior: 'deny',
                                    message: "only ".concat(constants_js_1.FILE_EDIT_TOOL_NAME, " is allowed for ").concat(docInfo.path),
                                    decisionReason: {
                                        type: 'other',
                                        reason: "only ".concat(constants_js_1.FILE_EDIT_TOOL_NAME, " is allowed"),
                                    },
                                }];
                        });
                    }); };
                    _g.label = 6;
                case 6:
                    _g.trys.push([6, 11, 12, 17]);
                    _a = true, _b = __asyncValues((0, runAgent_js_1.runAgent)({
                        agentDefinition: getMagicDocsAgent(),
                        promptMessages: [(0, messages_js_1.createUserMessage)({ content: userPrompt })],
                        toolUseContext: clonedToolUseContext,
                        canUseTool: canUseTool,
                        isAsync: true,
                        forkContextMessages: messages,
                        querySource: 'magic_docs',
                        override: {
                            systemPrompt: systemPrompt,
                            userContext: userContext,
                            systemContext: systemContext,
                        },
                        availableTools: clonedToolUseContext.options.tools,
                    }));
                    _g.label = 7;
                case 7: return [4 /*yield*/, _b.next()];
                case 8:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 10];
                    _f = _c.value;
                    _a = false;
                    _message = _f;
                    _g.label = 9;
                case 9:
                    _a = true;
                    return [3 /*break*/, 7];
                case 10: return [3 /*break*/, 17];
                case 11:
                    e_2_1 = _g.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 17];
                case 12:
                    _g.trys.push([12, , 15, 16]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 14];
                    return [4 /*yield*/, _e.call(_b)];
                case 13:
                    _g.sent();
                    _g.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 16: return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
/**
 * Magic Docs post-sampling hook that updates all tracked Magic Docs
 */
var updateMagicDocs = (0, sequential_js_1.sequential)(function (context) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, querySource, hasToolCalls, docCount, _i, _a, docInfo;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messages = context.messages, querySource = context.querySource;
                    if (querySource !== 'repl_main_thread') {
                        return [2 /*return*/];
                    }
                    hasToolCalls = (0, messages_js_1.hasToolCallsInLastAssistantTurn)(messages);
                    if (hasToolCalls) {
                        return [2 /*return*/];
                    }
                    docCount = trackedMagicDocs.size;
                    if (docCount === 0) {
                        return [2 /*return*/];
                    }
                    _i = 0, _a = Array.from(trackedMagicDocs.values());
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    docInfo = _a[_i];
                    return [4 /*yield*/, updateMagicDoc(docInfo, context)];
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
});
function initMagicDocs() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (process.env.USER_TYPE === 'ant') {
                // Register listener to detect magic docs when files are read
                (0, FileReadTool_js_1.registerFileReadListener)(function (filePath, content) {
                    var result = detectMagicDocHeader(content);
                    if (result) {
                        registerMagicDoc(filePath);
                    }
                });
                (0, postSamplingHooks_js_1.registerPostSamplingHook)(updateMagicDocs);
            }
            return [2 /*return*/];
        });
    });
}
