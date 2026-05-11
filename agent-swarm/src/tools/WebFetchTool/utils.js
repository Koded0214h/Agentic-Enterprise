"use strict";
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
exports.MAX_MARKDOWN_LENGTH = void 0;
exports.clearWebFetchCache = clearWebFetchCache;
exports.isPreapprovedUrl = isPreapprovedUrl;
exports.validateURL = validateURL;
exports.checkDomainBlocklist = checkDomainBlocklist;
exports.isPermittedRedirect = isPermittedRedirect;
exports.getWithPermittedRedirects = getWithPermittedRedirects;
exports.getURLMarkdownContent = getURLMarkdownContent;
exports.applyPromptToMarkdown = applyPromptToMarkdown;
var axios_1 = require("axios");
var lru_cache_1 = require("lru-cache");
var index_js_1 = require("../../services/analytics/index.js");
var claude_js_1 = require("../../services/api/claude.js");
var errors_js_1 = require("../../utils/errors.js");
var http_js_1 = require("../../utils/http.js");
var log_js_1 = require("../../utils/log.js");
var mcpOutputStorage_js_1 = require("../../utils/mcpOutputStorage.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var preapproved_js_1 = require("./preapproved.js");
var prompt_js_1 = require("./prompt.js");
// Custom error classes for domain blocking
var DomainBlockedError = /** @class */ (function (_super) {
    __extends(DomainBlockedError, _super);
    function DomainBlockedError(domain) {
        var _this = _super.call(this, "Claude Code is unable to fetch from ".concat(domain)) || this;
        _this.name = 'DomainBlockedError';
        return _this;
    }
    return DomainBlockedError;
}(Error));
var DomainCheckFailedError = /** @class */ (function (_super) {
    __extends(DomainCheckFailedError, _super);
    function DomainCheckFailedError(domain) {
        var _this = _super.call(this, "Unable to verify if domain ".concat(domain, " is safe to fetch. This may be due to network restrictions or enterprise security policies blocking claude.ai.")) || this;
        _this.name = 'DomainCheckFailedError';
        return _this;
    }
    return DomainCheckFailedError;
}(Error));
var EgressBlockedError = /** @class */ (function (_super) {
    __extends(EgressBlockedError, _super);
    function EgressBlockedError(domain) {
        var _this = _super.call(this, JSON.stringify({
            error_type: 'EGRESS_BLOCKED',
            domain: domain,
            message: "Access to ".concat(domain, " is blocked by the network egress proxy."),
        })) || this;
        _this.domain = domain;
        _this.name = 'EgressBlockedError';
        return _this;
    }
    return EgressBlockedError;
}(Error));
// Cache with 15-minute TTL and 50MB size limit
// LRUCache handles automatic expiration and eviction
var CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
var MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
var URL_CACHE = new lru_cache_1.LRUCache({
    maxSize: MAX_CACHE_SIZE_BYTES,
    ttl: CACHE_TTL_MS,
});
// Separate cache for preflight domain checks. URL_CACHE is URL-keyed, so
// fetching two paths on the same domain triggers two identical preflight
// HTTP round-trips to api.anthropic.com. This hostname-keyed cache avoids
// that. Only 'allowed' is cached — blocked/failed re-check on next attempt.
var DOMAIN_CHECK_CACHE = new lru_cache_1.LRUCache({
    max: 128,
    ttl: 5 * 60 * 1000, // 5 minutes — shorter than URL_CACHE TTL
});
function clearWebFetchCache() {
    URL_CACHE.clear();
    DOMAIN_CHECK_CACHE.clear();
}
var turndownServicePromise;
function getTurndownService() {
    return (turndownServicePromise !== null && turndownServicePromise !== void 0 ? turndownServicePromise : (turndownServicePromise = Promise.resolve().then(function () { return require('turndown'); }).then(function (m) {
        var Turndown = m.default;
        return new Turndown();
    })));
}
// PSR requested limiting the length of URLs to 250 to lower the potential
// for a data exfiltration. However, this is too restrictive for some customers'
// legitimate use cases, such as JWT-signed URLs (e.g., cloud service signed URLs)
// that can be much longer. We already require user approval for each domain,
// which provides a primary security boundary. In addition, Claude Code has
// other data exfil channels, and this one does not seem relatively high risk,
// so I'm removing that length restriction. -ab
var MAX_URL_LENGTH = 2000;
// Per PSR:
// "Implement resource consumption controls because setting limits on CPU,
// memory, and network usage for the Web Fetch tool can prevent a single
// request or user from overwhelming the system."
var MAX_HTTP_CONTENT_LENGTH = 10 * 1024 * 1024;
// Timeout for the main HTTP fetch request (60 seconds).
// Prevents hanging indefinitely on slow/unresponsive servers.
var FETCH_TIMEOUT_MS = 60000;
// Timeout for the domain blocklist preflight check (10 seconds).
var DOMAIN_CHECK_TIMEOUT_MS = 10000;
// Cap same-host redirect hops. Without this a malicious server can return
// a redirect loop (/a → /b → /a …) and the per-request FETCH_TIMEOUT_MS
// resets on every hop, hanging the tool until user interrupt. 10 matches
// common client defaults (axios=5, follow-redirects=21, Chrome=20).
var MAX_REDIRECTS = 10;
// Truncate to not spend too many tokens
exports.MAX_MARKDOWN_LENGTH = 100000;
function isPreapprovedUrl(url) {
    try {
        var parsedUrl = new URL(url);
        return (0, preapproved_js_1.isPreapprovedHost)(parsedUrl.hostname, parsedUrl.pathname);
    }
    catch (_a) {
        return false;
    }
}
function validateURL(url) {
    if (url.length > MAX_URL_LENGTH) {
        return false;
    }
    var parsed;
    try {
        parsed = new URL(url);
    }
    catch (_a) {
        return false;
    }
    // We don't need to check protocol here, as we'll upgrade http to https when making the request
    // As long as we aren't supporting aiming to cookies or internal domains,
    // we should block URLs with usernames/passwords too, even though these
    // seem exceedingly unlikely.
    if (parsed.username || parsed.password) {
        return false;
    }
    // Initial filter that this isn't a privileged, company-internal URL
    // by checking that the hostname is publicly resolvable
    var hostname = parsed.hostname;
    var parts = hostname.split('.');
    if (parts.length < 2) {
        return false;
    }
    return true;
}
function checkDomainBlocklist(domain) {
    return __awaiter(this, void 0, void 0, function () {
        var response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (DOMAIN_CHECK_CACHE.has(domain)) {
                        return [2 /*return*/, { status: 'allowed' }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("https://api.anthropic.com/api/web/domain_info?domain=".concat(encodeURIComponent(domain)), { timeout: DOMAIN_CHECK_TIMEOUT_MS })];
                case 2:
                    response = _a.sent();
                    if (response.status === 200) {
                        if (response.data.can_fetch === true) {
                            DOMAIN_CHECK_CACHE.set(domain, true);
                            return [2 /*return*/, { status: 'allowed' }];
                        }
                        return [2 /*return*/, { status: 'blocked' }];
                    }
                    // Non-200 status but didn't throw
                    return [2 /*return*/, {
                            status: 'check_failed',
                            error: new Error("Domain check returned status ".concat(response.status)),
                        }];
                case 3:
                    e_1 = _a.sent();
                    (0, log_js_1.logError)(e_1);
                    return [2 /*return*/, { status: 'check_failed', error: e_1 }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a redirect is safe to follow
 * Allows redirects that:
 * - Add or remove "www." in the hostname
 * - Keep the origin the same but change path/query params
 * - Or both of the above
 */
function isPermittedRedirect(originalUrl, redirectUrl) {
    try {
        var parsedOriginal = new URL(originalUrl);
        var parsedRedirect = new URL(redirectUrl);
        if (parsedRedirect.protocol !== parsedOriginal.protocol) {
            return false;
        }
        if (parsedRedirect.port !== parsedOriginal.port) {
            return false;
        }
        if (parsedRedirect.username || parsedRedirect.password) {
            return false;
        }
        // Now check hostname conditions
        // 1. Adding www. is allowed: example.com -> www.example.com
        // 2. Removing www. is allowed: www.example.com -> example.com
        // 3. Same host (with or without www.) is allowed: paths can change
        var stripWww = function (hostname) { return hostname.replace(/^www\./, ''); };
        var originalHostWithoutWww = stripWww(parsedOriginal.hostname);
        var redirectHostWithoutWww = stripWww(parsedRedirect.hostname);
        return originalHostWithoutWww === redirectHostWithoutWww;
    }
    catch (_error) {
        return false;
    }
}
function getWithPermittedRedirects(url_1, signal_1, redirectChecker_1) {
    return __awaiter(this, arguments, void 0, function (url, signal, redirectChecker, depth) {
        var error_1, redirectLocation, redirectUrl, hostname;
        var _a;
        if (depth === void 0) { depth = 0; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (depth > MAX_REDIRECTS) {
                        throw new Error("Too many redirects (exceeded ".concat(MAX_REDIRECTS, ")"));
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            signal: signal,
                            timeout: FETCH_TIMEOUT_MS,
                            maxRedirects: 0,
                            responseType: 'arraybuffer',
                            maxContentLength: MAX_HTTP_CONTENT_LENGTH,
                            headers: {
                                Accept: 'text/markdown, text/html, */*',
                                'User-Agent': (0, http_js_1.getWebFetchUserAgent)(),
                            },
                        })];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    error_1 = _b.sent();
                    if (axios_1.default.isAxiosError(error_1) &&
                        error_1.response &&
                        [301, 302, 307, 308].includes(error_1.response.status)) {
                        redirectLocation = error_1.response.headers.location;
                        if (!redirectLocation) {
                            throw new Error('Redirect missing Location header');
                        }
                        redirectUrl = new URL(redirectLocation, url).toString();
                        if (redirectChecker(url, redirectUrl)) {
                            // Recursively follow the permitted redirect
                            return [2 /*return*/, getWithPermittedRedirects(redirectUrl, signal, redirectChecker, depth + 1)];
                        }
                        else {
                            // Return redirect information to the caller
                            return [2 /*return*/, {
                                    type: 'redirect',
                                    originalUrl: url,
                                    redirectUrl: redirectUrl,
                                    statusCode: error_1.response.status,
                                }];
                        }
                    }
                    // Detect egress proxy blocks: the proxy returns 403 with
                    // X-Proxy-Error: blocked-by-allowlist when egress is restricted
                    if (axios_1.default.isAxiosError(error_1) &&
                        ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status) === 403 &&
                        error_1.response.headers['x-proxy-error'] === 'blocked-by-allowlist') {
                        hostname = new URL(url).hostname;
                        throw new EgressBlockedError(hostname);
                    }
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function isRedirectInfo(response) {
    return 'type' in response && response.type === 'redirect';
}
function getURLMarkdownContent(url, abortController) {
    return __awaiter(this, void 0, void 0, function () {
        var cachedEntry, parsedUrl, upgradedUrl, hostname, settings, checkResult, e_2, response, rawBuffer, contentType, persistedPath, persistedSize, persistId, result, bytes, htmlContent, markdownContent, contentBytes, entry;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!validateURL(url)) {
                        throw new Error('Invalid URL');
                    }
                    cachedEntry = URL_CACHE.get(url);
                    if (cachedEntry) {
                        return [2 /*return*/, {
                                bytes: cachedEntry.bytes,
                                code: cachedEntry.code,
                                codeText: cachedEntry.codeText,
                                content: cachedEntry.content,
                                contentType: cachedEntry.contentType,
                                persistedPath: cachedEntry.persistedPath,
                                persistedSize: cachedEntry.persistedSize,
                            }];
                    }
                    upgradedUrl = url;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    parsedUrl = new URL(url);
                    // Upgrade http to https if needed
                    if (parsedUrl.protocol === 'http:') {
                        parsedUrl.protocol = 'https:';
                        upgradedUrl = parsedUrl.toString();
                    }
                    hostname = parsedUrl.hostname;
                    settings = (0, settings_js_1.getSettings_DEPRECATED)();
                    if (!!settings.skipWebFetchPreflight) return [3 /*break*/, 3];
                    return [4 /*yield*/, checkDomainBlocklist(hostname)];
                case 2:
                    checkResult = _b.sent();
                    switch (checkResult.status) {
                        case 'allowed':
                            // Continue with the fetch
                            break;
                        case 'blocked':
                            throw new DomainBlockedError(hostname);
                        case 'check_failed':
                            throw new DomainCheckFailedError(hostname);
                    }
                    _b.label = 3;
                case 3:
                    if (process.env.USER_TYPE === 'ant') {
                        (0, index_js_1.logEvent)('tengu_web_fetch_host', {
                            hostname: hostname,
                        });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _b.sent();
                    if (e_2 instanceof DomainBlockedError ||
                        e_2 instanceof DomainCheckFailedError) {
                        // Expected user-facing failures - re-throw without logging as internal error
                        throw e_2;
                    }
                    (0, log_js_1.logError)(e_2);
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, getWithPermittedRedirects(upgradedUrl, abortController.signal, isPermittedRedirect)
                    // Check if we got a redirect response
                ];
                case 6:
                    response = _b.sent();
                    // Check if we got a redirect response
                    if (isRedirectInfo(response)) {
                        return [2 /*return*/, response];
                    }
                    rawBuffer = Buffer.from(response.data);
                    response.data = null;
                    contentType = (_a = response.headers['content-type']) !== null && _a !== void 0 ? _a : '';
                    if (!(0, mcpOutputStorage_js_1.isBinaryContentType)(contentType)) return [3 /*break*/, 8];
                    persistId = "webfetch-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 8));
                    return [4 /*yield*/, (0, mcpOutputStorage_js_1.persistBinaryContent)(rawBuffer, contentType, persistId)];
                case 7:
                    result = _b.sent();
                    if (!('error' in result)) {
                        persistedPath = result.filepath;
                        persistedSize = result.size;
                    }
                    _b.label = 8;
                case 8:
                    bytes = rawBuffer.length;
                    htmlContent = rawBuffer.toString('utf-8');
                    if (!contentType.includes('text/html')) return [3 /*break*/, 10];
                    return [4 /*yield*/, getTurndownService()];
                case 9:
                    markdownContent = (_b.sent()).turndown(htmlContent);
                    contentBytes = Buffer.byteLength(markdownContent);
                    return [3 /*break*/, 11];
                case 10:
                    // It's not HTML - just use it raw. The decoded string's UTF-8 byte
                    // length equals rawBuffer.length (modulo U+FFFD replacement on invalid
                    // bytes — negligible for cache eviction accounting), so skip the O(n)
                    // Buffer.byteLength scan.
                    markdownContent = htmlContent;
                    contentBytes = bytes;
                    _b.label = 11;
                case 11:
                    entry = {
                        bytes: bytes,
                        code: response.status,
                        codeText: response.statusText,
                        content: markdownContent,
                        contentType: contentType,
                        persistedPath: persistedPath,
                        persistedSize: persistedSize,
                    };
                    // lru-cache requires positive integers; clamp to 1 for empty responses.
                    URL_CACHE.set(url, entry, { size: Math.max(1, contentBytes) });
                    return [2 /*return*/, entry];
            }
        });
    });
}
function applyPromptToMarkdown(prompt, markdownContent, signal, isNonInteractiveSession, isPreapprovedDomain) {
    return __awaiter(this, void 0, void 0, function () {
        var truncatedContent, modelPrompt, assistantMessage, content, contentBlock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truncatedContent = markdownContent.length > exports.MAX_MARKDOWN_LENGTH
                        ? markdownContent.slice(0, exports.MAX_MARKDOWN_LENGTH) +
                            '\n\n[Content truncated due to length...]'
                        : markdownContent;
                    modelPrompt = (0, prompt_js_1.makeSecondaryModelPrompt)(truncatedContent, prompt, isPreapprovedDomain);
                    return [4 /*yield*/, (0, claude_js_1.queryHaiku)({
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([]),
                            userPrompt: modelPrompt,
                            signal: signal,
                            options: {
                                querySource: 'web_fetch_apply',
                                agents: [],
                                isNonInteractiveSession: isNonInteractiveSession,
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                            },
                        })
                        // We need to bubble this up, so that the tool call throws, causing us to return
                        // an is_error tool_use block to the server, and render a red dot in the UI.
                    ];
                case 1:
                    assistantMessage = _a.sent();
                    // We need to bubble this up, so that the tool call throws, causing us to return
                    // an is_error tool_use block to the server, and render a red dot in the UI.
                    if (signal.aborted) {
                        throw new errors_js_1.AbortError();
                    }
                    content = assistantMessage.message.content;
                    if (content.length > 0) {
                        contentBlock = content[0];
                        if ('text' in contentBlock) {
                            return [2 /*return*/, contentBlock.text];
                        }
                    }
                    return [2 /*return*/, 'No response from model'];
            }
        });
    });
}
