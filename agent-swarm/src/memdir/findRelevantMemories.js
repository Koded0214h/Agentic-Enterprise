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
exports.findRelevantMemories = findRelevantMemories;
var bun_bundle_1 = require("bun:bundle");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var model_js_1 = require("../utils/model/model.js");
var sideQuery_js_1 = require("../utils/sideQuery.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var memoryScan_js_1 = require("./memoryScan.js");
var SELECT_MEMORIES_SYSTEM_PROMPT = "You are selecting memories that will be useful to Claude Code as it processes a user's query. You will be given the user's query and a list of available memory files with their filenames and descriptions.\n\nReturn a list of filenames for the memories that will clearly be useful to Claude Code as it processes the user's query (up to 5). Only include memories that you are certain will be helpful based on their name and description.\n- If you are unsure if a memory will be useful in processing the user's query, then do not include it in your list. Be selective and discerning.\n- If there are no memories in the list that would clearly be useful, feel free to return an empty list.\n- If a list of recently-used tools is provided, do not select memories that are usage reference or API documentation for those tools (Claude Code is already exercising them). DO still select memories containing warnings, gotchas, or known issues about those tools \u2014 active use is exactly when those matter.\n";
/**
 * Find memory files relevant to a query by scanning memory file headers
 * and asking Sonnet to select the most relevant ones.
 *
 * Returns absolute file paths + mtime of the most relevant memories
 * (up to 5). Excludes MEMORY.md (already loaded in system prompt).
 * mtime is threaded through so callers can surface freshness to the
 * main model without a second stat.
 *
 * `alreadySurfaced` filters paths shown in prior turns before the
 * Sonnet call, so the selector spends its 5-slot budget on fresh
 * candidates instead of re-picking files the caller will discard.
 */
function findRelevantMemories(query_1, memoryDir_1, signal_1) {
    return __awaiter(this, arguments, void 0, function (query, memoryDir, signal, recentTools, alreadySurfaced) {
        var memories, selectedFilenames, byFilename, selected, logMemoryRecallShape;
        if (recentTools === void 0) { recentTools = []; }
        if (alreadySurfaced === void 0) { alreadySurfaced = new Set(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, memoryScan_js_1.scanMemoryFiles)(memoryDir, signal)];
                case 1:
                    memories = (_a.sent()).filter(function (m) { return !alreadySurfaced.has(m.filePath); });
                    if (memories.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, selectRelevantMemories(query, memories, signal, recentTools)];
                case 2:
                    selectedFilenames = _a.sent();
                    byFilename = new Map(memories.map(function (m) { return [m.filename, m]; }));
                    selected = selectedFilenames
                        .map(function (filename) { return byFilename.get(filename); })
                        .filter(function (m) { return m !== undefined; });
                    // Fires even on empty selection: selection-rate needs the denominator,
                    // and -1 ages distinguish "ran, picked nothing" from "never ran".
                    if ((0, bun_bundle_1.feature)('MEMORY_SHAPE_TELEMETRY')) {
                        logMemoryRecallShape = require('./memoryShapeTelemetry.js').logMemoryRecallShape;
                        /* eslint-enable @typescript-eslint/no-require-imports */
                        logMemoryRecallShape(memories, selected);
                    }
                    return [2 /*return*/, selected.map(function (m) { return ({ path: m.filePath, mtimeMs: m.mtimeMs }); })];
            }
        });
    });
}
function selectRelevantMemories(query, memories, signal, recentTools) {
    return __awaiter(this, void 0, void 0, function () {
        var validFilenames, manifest, toolsSection, result, textBlock, parsed, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validFilenames = new Set(memories.map(function (m) { return m.filename; }));
                    manifest = (0, memoryScan_js_1.formatMemoryManifest)(memories);
                    toolsSection = recentTools.length > 0
                        ? "\n\nRecently used tools: ".concat(recentTools.join(', '))
                        : '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, sideQuery_js_1.sideQuery)({
                            model: (0, model_js_1.getDefaultSonnetModel)(),
                            system: SELECT_MEMORIES_SYSTEM_PROMPT,
                            skipSystemPromptPrefix: true,
                            messages: [
                                {
                                    role: 'user',
                                    content: "Query: ".concat(query, "\n\nAvailable memories:\n").concat(manifest).concat(toolsSection),
                                },
                            ],
                            max_tokens: 256,
                            output_format: {
                                type: 'json_schema',
                                schema: {
                                    type: 'object',
                                    properties: {
                                        selected_memories: { type: 'array', items: { type: 'string' } },
                                    },
                                    required: ['selected_memories'],
                                    additionalProperties: false,
                                },
                            },
                            signal: signal,
                            querySource: 'memdir_relevance',
                        })];
                case 2:
                    result = _a.sent();
                    textBlock = result.content.find(function (block) { return block.type === 'text'; });
                    if (!textBlock || textBlock.type !== 'text') {
                        return [2 /*return*/, []];
                    }
                    parsed = (0, slowOperations_js_1.jsonParse)(textBlock.text);
                    return [2 /*return*/, parsed.selected_memories.filter(function (f) { return validFilenames.has(f); })];
                case 3:
                    e_1 = _a.sent();
                    if (signal.aborted) {
                        return [2 /*return*/, []];
                    }
                    (0, debug_js_1.logForDebugging)("[memdir] selectRelevantMemories failed: ".concat((0, errors_js_1.errorMessage)(e_1)), { level: 'warn' });
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
