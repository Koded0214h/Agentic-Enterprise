"use strict";
/**
 * Session Memory utility functions that can be imported without circular dependencies.
 * These are separate from the main sessionMemory.ts to avoid importing runAgent.
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
exports.DEFAULT_SESSION_MEMORY_CONFIG = void 0;
exports.getLastSummarizedMessageId = getLastSummarizedMessageId;
exports.setLastSummarizedMessageId = setLastSummarizedMessageId;
exports.markExtractionStarted = markExtractionStarted;
exports.markExtractionCompleted = markExtractionCompleted;
exports.waitForSessionMemoryExtraction = waitForSessionMemoryExtraction;
exports.getSessionMemoryContent = getSessionMemoryContent;
exports.setSessionMemoryConfig = setSessionMemoryConfig;
exports.getSessionMemoryConfig = getSessionMemoryConfig;
exports.recordExtractionTokenCount = recordExtractionTokenCount;
exports.isSessionMemoryInitialized = isSessionMemoryInitialized;
exports.markSessionMemoryInitialized = markSessionMemoryInitialized;
exports.hasMetInitializationThreshold = hasMetInitializationThreshold;
exports.hasMetUpdateThreshold = hasMetUpdateThreshold;
exports.getToolCallsBetweenUpdates = getToolCallsBetweenUpdates;
exports.resetSessionMemoryState = resetSessionMemoryState;
var errors_js_1 = require("../../utils/errors.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var sleep_js_1 = require("../../utils/sleep.js");
var index_js_1 = require("../analytics/index.js");
var EXTRACTION_WAIT_TIMEOUT_MS = 15000;
var EXTRACTION_STALE_THRESHOLD_MS = 60000; // 1 minute
// Default configuration values
exports.DEFAULT_SESSION_MEMORY_CONFIG = {
    minimumMessageTokensToInit: 10000,
    minimumTokensBetweenUpdate: 5000,
    toolCallsBetweenUpdates: 3,
};
// Current session memory configuration
var sessionMemoryConfig = __assign({}, exports.DEFAULT_SESSION_MEMORY_CONFIG);
// Track the last summarized message ID (shared state)
var lastSummarizedMessageId;
// Track extraction state with timestamp (set by sessionMemory.ts)
var extractionStartedAt;
// Track context size at last memory extraction (for minimumTokensBetweenUpdate)
var tokensAtLastExtraction = 0;
// Track whether session memory has been initialized (met minimumMessageTokensToInit)
var sessionMemoryInitialized = false;
/**
 * Get the message ID up to which the session memory is current
 */
function getLastSummarizedMessageId() {
    return lastSummarizedMessageId;
}
/**
 * Set the last summarized message ID (called from sessionMemory.ts)
 */
function setLastSummarizedMessageId(messageId) {
    lastSummarizedMessageId = messageId;
}
/**
 * Mark extraction as started (called from sessionMemory.ts)
 */
function markExtractionStarted() {
    extractionStartedAt = Date.now();
}
/**
 * Mark extraction as completed (called from sessionMemory.ts)
 */
function markExtractionCompleted() {
    extractionStartedAt = undefined;
}
/**
 * Wait for any in-progress session memory extraction to complete (with 15s timeout)
 * Returns immediately if no extraction is in progress or if extraction is stale (>1min old).
 */
function waitForSessionMemoryExtraction() {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, extractionAge;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    if (!extractionStartedAt) return [3 /*break*/, 3];
                    extractionAge = Date.now() - extractionStartedAt;
                    if (extractionAge > EXTRACTION_STALE_THRESHOLD_MS) {
                        // Extraction is stale, don't wait
                        return [2 /*return*/];
                    }
                    if (Date.now() - startTime > EXTRACTION_WAIT_TIMEOUT_MS) {
                        // Timeout - continue anyway
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(1000)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the current session memory content
 */
function getSessionMemoryContent() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, memoryPath, content, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    memoryPath = (0, filesystem_js_1.getSessionMemoryPath)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(memoryPath, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    (0, index_js_1.logEvent)('tengu_session_memory_loaded', {
                        content_length: content.length,
                    });
                    return [2 /*return*/, content];
                case 3:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_1))
                        return [2 /*return*/, null];
                    throw e_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Set the session memory configuration
 */
function setSessionMemoryConfig(config) {
    sessionMemoryConfig = __assign(__assign({}, sessionMemoryConfig), config);
}
/**
 * Get the current session memory configuration
 */
function getSessionMemoryConfig() {
    return __assign({}, sessionMemoryConfig);
}
/**
 * Record the context size at the time of extraction.
 * Used to measure context growth for minimumTokensBetweenUpdate threshold.
 */
function recordExtractionTokenCount(currentTokenCount) {
    tokensAtLastExtraction = currentTokenCount;
}
/**
 * Check if session memory has been initialized (met minimumTokensToInit threshold)
 */
function isSessionMemoryInitialized() {
    return sessionMemoryInitialized;
}
/**
 * Mark session memory as initialized
 */
function markSessionMemoryInitialized() {
    sessionMemoryInitialized = true;
}
/**
 * Check if we've met the threshold to initialize session memory.
 * Uses total context window tokens (same as autocompact) for consistent behavior.
 */
function hasMetInitializationThreshold(currentTokenCount) {
    return currentTokenCount >= sessionMemoryConfig.minimumMessageTokensToInit;
}
/**
 * Check if we've met the threshold for the next update.
 * Measures actual context window growth since last extraction
 * (same metric as autocompact and initialization threshold).
 */
function hasMetUpdateThreshold(currentTokenCount) {
    var tokensSinceLastExtraction = currentTokenCount - tokensAtLastExtraction;
    return (tokensSinceLastExtraction >= sessionMemoryConfig.minimumTokensBetweenUpdate);
}
/**
 * Get the configured number of tool calls between updates
 */
function getToolCallsBetweenUpdates() {
    return sessionMemoryConfig.toolCallsBetweenUpdates;
}
/**
 * Reset session memory state (useful for testing)
 */
function resetSessionMemoryState() {
    sessionMemoryConfig = __assign({}, exports.DEFAULT_SESSION_MEMORY_CONFIG);
    tokensAtLastExtraction = 0;
    sessionMemoryInitialized = false;
    lastSummarizedMessageId = undefined;
    extractionStartedAt = undefined;
}
