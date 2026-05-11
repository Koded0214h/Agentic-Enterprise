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
exports.IMAGE_TOKEN_ESTIMATE = exports.MCP_TOKEN_COUNT_THRESHOLD_FACTOR = void 0;
exports.getMaxMcpOutputTokens = getMaxMcpOutputTokens;
exports.getContentSizeEstimate = getContentSizeEstimate;
exports.mcpContentNeedsTruncation = mcpContentNeedsTruncation;
exports.truncateMcpContent = truncateMcpContent;
exports.truncateMcpContentIfNeeded = truncateMcpContentIfNeeded;
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var imageResizer_js_1 = require("./imageResizer.js");
var log_js_1 = require("./log.js");
exports.MCP_TOKEN_COUNT_THRESHOLD_FACTOR = 0.5;
exports.IMAGE_TOKEN_ESTIMATE = 1600;
var DEFAULT_MAX_MCP_OUTPUT_TOKENS = 25000;
/**
 * Resolve the MCP output token cap. Precedence:
 *   1. MAX_MCP_OUTPUT_TOKENS env var (explicit user override)
 *   2. tengu_satin_quoll GrowthBook flag's `mcp_tool` key (tokens, not chars —
 *      unlike the other keys in that map which getPersistenceThreshold reads
 *      as chars; MCP has its own truncation layer upstream of that)
 *   3. Hardcoded default
 */
function getMaxMcpOutputTokens() {
    var envValue = process.env.MAX_MCP_OUTPUT_TOKENS;
    if (envValue) {
        var parsed = parseInt(envValue, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }
    var overrides = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_satin_quoll', {});
    var override = overrides === null || overrides === void 0 ? void 0 : overrides['mcp_tool'];
    if (typeof override === 'number' &&
        Number.isFinite(override) &&
        override > 0) {
        return override;
    }
    return DEFAULT_MAX_MCP_OUTPUT_TOKENS;
}
function isTextBlock(block) {
    return block.type === 'text';
}
function isImageBlock(block) {
    return block.type === 'image';
}
function getContentSizeEstimate(content) {
    if (!content)
        return 0;
    if (typeof content === 'string') {
        return (0, tokenEstimation_js_1.roughTokenCountEstimation)(content);
    }
    return content.reduce(function (total, block) {
        if (isTextBlock(block)) {
            return total + (0, tokenEstimation_js_1.roughTokenCountEstimation)(block.text);
        }
        else if (isImageBlock(block)) {
            // Estimate for image tokens
            return total + exports.IMAGE_TOKEN_ESTIMATE;
        }
        return total;
    }, 0);
}
function getMaxMcpOutputChars() {
    return getMaxMcpOutputTokens() * 4;
}
function getTruncationMessage() {
    return "\n\n[OUTPUT TRUNCATED - exceeded ".concat(getMaxMcpOutputTokens(), " token limit]\n\nThe tool output was truncated. If this MCP server provides pagination or filtering tools, use them to retrieve specific portions of the data. If pagination is not available, inform the user that you are working with truncated output and results may be incomplete.");
}
function truncateString(content, maxChars) {
    if (content.length <= maxChars) {
        return content;
    }
    return content.slice(0, maxChars);
}
function truncateContentBlocks(blocks, maxChars) {
    return __awaiter(this, void 0, void 0, function () {
        var result, currentChars, _i, blocks_1, block, remainingChars, imageChars, remainingChars, remainingBytes, compressedBlock, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    result = [];
                    currentChars = 0;
                    _i = 0, blocks_1 = blocks;
                    _b.label = 1;
                case 1:
                    if (!(_i < blocks_1.length)) return [3 /*break*/, 10];
                    block = blocks_1[_i];
                    if (!isTextBlock(block)) return [3 /*break*/, 2];
                    remainingChars = maxChars - currentChars;
                    if (remainingChars <= 0)
                        return [3 /*break*/, 10];
                    if (block.text.length <= remainingChars) {
                        result.push(block);
                        currentChars += block.text.length;
                    }
                    else {
                        result.push({ type: 'text', text: block.text.slice(0, remainingChars) });
                        return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 9];
                case 2:
                    if (!isImageBlock(block)) return [3 /*break*/, 8];
                    imageChars = exports.IMAGE_TOKEN_ESTIMATE * 4;
                    if (!(currentChars + imageChars <= maxChars)) return [3 /*break*/, 3];
                    result.push(block);
                    currentChars += imageChars;
                    return [3 /*break*/, 7];
                case 3:
                    remainingChars = maxChars - currentChars;
                    if (!(remainingChars > 0)) return [3 /*break*/, 7];
                    remainingBytes = Math.floor(remainingChars * 0.75);
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, imageResizer_js_1.compressImageBlock)(block, remainingBytes)];
                case 5:
                    compressedBlock = _b.sent();
                    result.push(compressedBlock);
                    // Update currentChars based on compressed image size
                    if (compressedBlock.source.type === 'base64') {
                        currentChars += compressedBlock.source.data.length;
                    }
                    else {
                        currentChars += imageChars;
                    }
                    return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    result.push(block);
                    _b.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, result];
            }
        });
    });
}
function mcpContentNeedsTruncation(content) {
    return __awaiter(this, void 0, void 0, function () {
        var contentSizeEstimate, messages, tokenCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!content)
                        return [2 /*return*/, false
                            // Use size check as a heuristic to avoid unnecessary token counting API calls
                        ];
                    contentSizeEstimate = getContentSizeEstimate(content);
                    if (contentSizeEstimate <=
                        getMaxMcpOutputTokens() * exports.MCP_TOKEN_COUNT_THRESHOLD_FACTOR) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    messages = typeof content === 'string'
                        ? [{ role: 'user', content: content }]
                        : [{ role: 'user', content: content }];
                    return [4 /*yield*/, (0, tokenEstimation_js_1.countMessagesTokensWithAPI)(messages, [])];
                case 2:
                    tokenCount = _a.sent();
                    return [2 /*return*/, !!(tokenCount && tokenCount > getMaxMcpOutputTokens())];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    // Assume no truncation needed on error
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function truncateMcpContent(content) {
    return __awaiter(this, void 0, void 0, function () {
        var maxChars, truncationMsg, truncatedBlocks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!content)
                        return [2 /*return*/, content];
                    maxChars = getMaxMcpOutputChars();
                    truncationMsg = getTruncationMessage();
                    if (!(typeof content === 'string')) return [3 /*break*/, 1];
                    return [2 /*return*/, truncateString(content, maxChars) + truncationMsg];
                case 1: return [4 /*yield*/, truncateContentBlocks(content, maxChars)];
                case 2:
                    truncatedBlocks = _a.sent();
                    truncatedBlocks.push({ type: 'text', text: truncationMsg });
                    return [2 /*return*/, truncatedBlocks];
            }
        });
    });
}
function truncateMcpContentIfNeeded(content) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mcpContentNeedsTruncation(content)];
                case 1:
                    if (!(_a.sent())) {
                        return [2 /*return*/, content];
                    }
                    return [4 /*yield*/, truncateMcpContent(content)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
