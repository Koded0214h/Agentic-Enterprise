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
exports.WebFetchTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var format_js_1 = require("../../utils/format.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var permissions_js_1 = require("../../utils/permissions/permissions.js");
var preapproved_js_1 = require("./preapproved.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var utils_js_1 = require("./utils.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        url: v4_1.z.string().url().describe('The URL to fetch content from'),
        prompt: v4_1.z.string().describe('The prompt to run on the fetched content'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        bytes: v4_1.z.number().describe('Size of the fetched content in bytes'),
        code: v4_1.z.number().describe('HTTP response code'),
        codeText: v4_1.z.string().describe('HTTP response code text'),
        result: v4_1.z
            .string()
            .describe('Processed result from applying the prompt to the content'),
        durationMs: v4_1.z
            .number()
            .describe('Time taken to fetch and process the content'),
        url: v4_1.z.string().describe('The URL that was fetched'),
    });
});
function webFetchToolInputToPermissionRuleContent(input) {
    try {
        var parsedInput = exports.WebFetchTool.inputSchema.safeParse(input);
        if (!parsedInput.success) {
            return "input:".concat(input.toString());
        }
        var url = parsedInput.data.url;
        var hostname = new URL(url).hostname;
        return "domain:".concat(hostname);
    }
    catch (_a) {
        return "input:".concat(input.toString());
    }
}
exports.WebFetchTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.WEB_FETCH_TOOL_NAME,
    searchHint: 'fetch and extract content from a URL',
    // 100K chars - tool result persistence threshold
    maxResultSizeChars: 100000,
    shouldDefer: true,
    description: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var url, hostname;
            return __generator(this, function (_a) {
                url = input.url;
                try {
                    hostname = new URL(url).hostname;
                    return [2 /*return*/, "Claude wants to fetch content from ".concat(hostname)];
                }
                catch (_b) {
                    return [2 /*return*/, "Claude wants to fetch content from this URL"];
                }
                return [2 /*return*/];
            });
        });
    },
    userFacingName: function () {
        return 'Fetch';
    },
    getToolUseSummary: UI_js_1.getToolUseSummary,
    getActivityDescription: function (input) {
        var summary = (0, UI_js_1.getToolUseSummary)(input);
        return summary ? "Fetching ".concat(summary) : 'Fetching web page';
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        return input.prompt ? "".concat(input.url, ": ").concat(input.prompt) : input.url;
    },
    checkPermissions: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var appState, permissionContext, url, parsedUrl, ruleContent, denyRule, askRule, allowRule;
            return __generator(this, function (_a) {
                appState = context.getAppState();
                permissionContext = appState.toolPermissionContext;
                // Check if the hostname is in the preapproved list
                try {
                    url = input.url;
                    parsedUrl = new URL(url);
                    if ((0, preapproved_js_1.isPreapprovedHost)(parsedUrl.hostname, parsedUrl.pathname)) {
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: input,
                                decisionReason: { type: 'other', reason: 'Preapproved host' },
                            }];
                    }
                }
                catch (_b) {
                    // If URL parsing fails, continue with normal permission checks
                }
                ruleContent = webFetchToolInputToPermissionRuleContent(input);
                denyRule = (0, permissions_js_1.getRuleByContentsForTool)(permissionContext, exports.WebFetchTool, 'deny').get(ruleContent);
                if (denyRule) {
                    return [2 /*return*/, {
                            behavior: 'deny',
                            message: "".concat(exports.WebFetchTool.name, " denied access to ").concat(ruleContent, "."),
                            decisionReason: {
                                type: 'rule',
                                rule: denyRule,
                            },
                        }];
                }
                askRule = (0, permissions_js_1.getRuleByContentsForTool)(permissionContext, exports.WebFetchTool, 'ask').get(ruleContent);
                if (askRule) {
                    return [2 /*return*/, {
                            behavior: 'ask',
                            message: "Claude requested permissions to use ".concat(exports.WebFetchTool.name, ", but you haven't granted it yet."),
                            decisionReason: {
                                type: 'rule',
                                rule: askRule,
                            },
                            suggestions: buildSuggestions(ruleContent),
                        }];
                }
                allowRule = (0, permissions_js_1.getRuleByContentsForTool)(permissionContext, exports.WebFetchTool, 'allow').get(ruleContent);
                if (allowRule) {
                    return [2 /*return*/, {
                            behavior: 'allow',
                            updatedInput: input,
                            decisionReason: {
                                type: 'rule',
                                rule: allowRule,
                            },
                        }];
                }
                return [2 /*return*/, {
                        behavior: 'ask',
                        message: "Claude requested permissions to use ".concat(exports.WebFetchTool.name, ", but you haven't granted it yet."),
                        suggestions: buildSuggestions(ruleContent),
                    }];
            });
        });
    },
    prompt: function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Always include the auth warning regardless of whether ToolSearch is
                // currently in the tools list. Conditionally toggling this prefix based
                // on ToolSearch availability caused the tool description to flicker
                // between SDK query() calls (when ToolSearch enablement varies due to
                // MCP tool count thresholds), invalidating the Anthropic API prompt
                // cache on each toggle — two consecutive cache misses per flicker event.
                return [2 /*return*/, "IMPORTANT: WebFetch WILL FAIL for authenticated or private URLs. Before using this tool, check if the URL points to an authenticated service (e.g. Google Docs, Confluence, Jira, GitHub). If so, look for a specialized MCP tool that provides authenticated access.\n".concat(prompt_js_1.DESCRIPTION)];
            });
        });
    },
    validateInput: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = input.url;
                try {
                    new URL(url);
                }
                catch (_b) {
                    return [2 /*return*/, {
                            result: false,
                            message: "Error: Invalid URL \"".concat(url, "\". The URL provided could not be parsed."),
                            meta: { reason: 'invalid_url' },
                            errorCode: 1,
                        }];
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolUseProgressMessage: UI_js_1.renderToolUseProgressMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    call: function (_a, _b) {
        return __awaiter(this, arguments, void 0, function (_c, _d) {
            var start, response, statusText, message, output_1, _e, content, bytes, code, codeText, contentType, persistedPath, persistedSize, isPreapproved, result, output;
            var url = _c.url, prompt = _c.prompt;
            var abortController = _d.abortController, isNonInteractiveSession = _d.options.isNonInteractiveSession;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        start = Date.now();
                        return [4 /*yield*/, (0, utils_js_1.getURLMarkdownContent)(url, abortController)
                            // Check if we got a redirect to a different host
                        ];
                    case 1:
                        response = _f.sent();
                        // Check if we got a redirect to a different host
                        if ('type' in response && response.type === 'redirect') {
                            statusText = response.statusCode === 301
                                ? 'Moved Permanently'
                                : response.statusCode === 308
                                    ? 'Permanent Redirect'
                                    : response.statusCode === 307
                                        ? 'Temporary Redirect'
                                        : 'Found';
                            message = "REDIRECT DETECTED: The URL redirects to a different host.\n\nOriginal URL: ".concat(response.originalUrl, "\nRedirect URL: ").concat(response.redirectUrl, "\nStatus: ").concat(response.statusCode, " ").concat(statusText, "\n\nTo complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:\n- url: \"").concat(response.redirectUrl, "\"\n- prompt: \"").concat(prompt, "\"");
                            output_1 = {
                                bytes: Buffer.byteLength(message),
                                code: response.statusCode,
                                codeText: statusText,
                                result: message,
                                durationMs: Date.now() - start,
                                url: url,
                            };
                            return [2 /*return*/, {
                                    data: output_1,
                                }];
                        }
                        _e = response, content = _e.content, bytes = _e.bytes, code = _e.code, codeText = _e.codeText, contentType = _e.contentType, persistedPath = _e.persistedPath, persistedSize = _e.persistedSize;
                        isPreapproved = (0, utils_js_1.isPreapprovedUrl)(url);
                        if (!(isPreapproved &&
                            contentType.includes('text/markdown') &&
                            content.length < utils_js_1.MAX_MARKDOWN_LENGTH)) return [3 /*break*/, 2];
                        result = content;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (0, utils_js_1.applyPromptToMarkdown)(prompt, content, abortController.signal, isNonInteractiveSession, isPreapproved)];
                    case 3:
                        result = _f.sent();
                        _f.label = 4;
                    case 4:
                        // Binary content (PDFs, etc.) was additionally saved to disk with a
                        // mime-derived extension. Note it so Claude can inspect the raw file
                        // if the Haiku summary above isn't enough.
                        if (persistedPath) {
                            result += "\n\n[Binary content (".concat(contentType, ", ").concat((0, format_js_1.formatFileSize)(persistedSize !== null && persistedSize !== void 0 ? persistedSize : bytes), ") also saved to ").concat(persistedPath, "]");
                        }
                        output = {
                            bytes: bytes,
                            code: code,
                            codeText: codeText,
                            result: result,
                            durationMs: Date.now() - start,
                            url: url,
                        };
                        return [2 /*return*/, {
                                data: output,
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var result = _a.result;
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: result,
        };
    },
});
function buildSuggestions(ruleContent) {
    return [
        {
            type: 'addRules',
            destination: 'localSettings',
            rules: [{ toolName: prompt_js_1.WEB_FETCH_TOOL_NAME, ruleContent: ruleContent }],
            behavior: 'allow',
        },
    ];
}
