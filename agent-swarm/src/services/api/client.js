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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_REQUEST_ID_HEADER = void 0;
exports.getAnthropicClient = getAnthropicClient;
var sdk_1 = require("@anthropic-ai/sdk");
var crypto_1 = require("crypto");
var auth_js_1 = require("src/utils/auth.js");
var http_js_1 = require("src/utils/http.js");
var model_js_1 = require("src/utils/model/model.js");
var providers_js_1 = require("src/utils/model/providers.js");
var proxy_js_1 = require("src/utils/proxy.js");
var state_js_1 = require("../../bootstrap/state.js");
var oauth_js_1 = require("../../constants/oauth.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
/**
 * Environment variables for different client types:
 *
 * Direct API:
 * - ANTHROPIC_API_KEY: Required for direct API access
 *
 * AWS Bedrock:
 * - AWS credentials configured via aws-sdk defaults
 * - AWS_REGION or AWS_DEFAULT_REGION: Sets the AWS region for all models (default: us-east-1)
 * - ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION: Optional. Override AWS region specifically for the small fast model (Haiku)
 *
 * Foundry (Azure):
 * - ANTHROPIC_FOUNDRY_RESOURCE: Your Azure resource name (e.g., 'my-resource')
 *   For the full endpoint: https://{resource}.services.ai.azure.com/anthropic/v1/messages
 * - ANTHROPIC_FOUNDRY_BASE_URL: Optional. Alternative to resource - provide full base URL directly
 *   (e.g., 'https://my-resource.services.ai.azure.com')
 *
 * Authentication (one of the following):
 * - ANTHROPIC_FOUNDRY_API_KEY: Your Microsoft Foundry API key (if using API key auth)
 * - Azure AD authentication: If no API key is provided, uses DefaultAzureCredential
 *   which supports multiple auth methods (environment variables, managed identity,
 *   Azure CLI, etc.). See: https://docs.microsoft.com/en-us/javascript/api/@azure/identity
 *
 * Vertex AI:
 * - Model-specific region variables (highest priority):
 *   - VERTEX_REGION_CLAUDE_3_5_HAIKU: Region for Claude 3.5 Haiku model
 *   - VERTEX_REGION_CLAUDE_HAIKU_4_5: Region for Claude Haiku 4.5 model
 *   - VERTEX_REGION_CLAUDE_3_5_SONNET: Region for Claude 3.5 Sonnet model
 *   - VERTEX_REGION_CLAUDE_3_7_SONNET: Region for Claude 3.7 Sonnet model
 * - CLOUD_ML_REGION: Optional. The default GCP region to use for all models
 *   If specific model region not specified above
 * - ANTHROPIC_VERTEX_PROJECT_ID: Required. Your GCP project ID
 * - Standard GCP credentials configured via google-auth-library
 *
 * Priority for determining region:
 * 1. Hardcoded model-specific environment variables
 * 2. Global CLOUD_ML_REGION variable
 * 3. Default region from config
 * 4. Fallback region (us-east5)
 */
function createStderrLogger() {
    return {
        error: function (msg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            // biome-ignore lint/suspicious/noConsole:: intentional console output -- SDK logger must use console
            return console.error.apply(console, __spreadArray(['[Anthropic SDK ERROR]', msg], args, false));
        },
        // biome-ignore lint/suspicious/noConsole:: intentional console output -- SDK logger must use console
        warn: function (msg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return console.error.apply(console, __spreadArray(['[Anthropic SDK WARN]', msg], args, false));
        },
        // biome-ignore lint/suspicious/noConsole:: intentional console output -- SDK logger must use console
        info: function (msg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return console.error.apply(console, __spreadArray(['[Anthropic SDK INFO]', msg], args, false));
        },
        debug: function (msg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            // biome-ignore lint/suspicious/noConsole:: intentional console output -- SDK logger must use console
            return console.error.apply(console, __spreadArray(['[Anthropic SDK DEBUG]', msg], args, false));
        },
    };
}
function getAnthropicClient(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var containerId, remoteSessionId, clientApp, customHeaders, defaultHeaders, additionalProtectionEnabled, resolvedFetch, ARGS, AnthropicBedrock, awsRegion, bedrockArgs, cachedCredentials, AnthropicFoundry, azureADTokenProvider, _c, AzureCredential, getBearerTokenProvider, foundryArgs, _d, AnthropicVertex, GoogleAuth_1, hasProjectEnvVar, hasKeyFile, googleAuth, vertexArgs, clientConfig;
        var _e;
        var apiKey = _b.apiKey, maxRetries = _b.maxRetries, model = _b.model, fetchOverride = _b.fetchOverride, source = _b.source;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    containerId = process.env.CLAUDE_CODE_CONTAINER_ID;
                    remoteSessionId = process.env.CLAUDE_CODE_REMOTE_SESSION_ID;
                    clientApp = process.env.CLAUDE_AGENT_SDK_CLIENT_APP;
                    customHeaders = getCustomHeaders();
                    defaultHeaders = __assign(__assign(__assign(__assign({ 'x-app': 'cli', 'User-Agent': (0, http_js_1.getUserAgent)(), 'X-Claude-Code-Session-Id': (0, state_js_1.getSessionId)() }, customHeaders), (containerId ? { 'x-claude-remote-container-id': containerId } : {})), (remoteSessionId
                        ? { 'x-claude-remote-session-id': remoteSessionId }
                        : {})), (clientApp ? { 'x-client-app': clientApp } : {}));
                    // Log API client configuration for HFI debugging
                    (0, debug_js_1.logForDebugging)("[API:request] Creating client, ANTHROPIC_CUSTOM_HEADERS present: ".concat(!!process.env.ANTHROPIC_CUSTOM_HEADERS, ", has Authorization header: ").concat(!!customHeaders['Authorization']));
                    additionalProtectionEnabled = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ADDITIONAL_PROTECTION);
                    if (additionalProtectionEnabled) {
                        defaultHeaders['x-anthropic-additional-protection'] = 'true';
                    }
                    (0, debug_js_1.logForDebugging)('[API:auth] OAuth token check starting');
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    _f.sent();
                    (0, debug_js_1.logForDebugging)('[API:auth] OAuth token check complete');
                    if (!!(0, auth_js_1.isClaudeAISubscriber)()) return [3 /*break*/, 3];
                    return [4 /*yield*/, configureApiKeyHeaders(defaultHeaders, (0, state_js_1.getIsNonInteractiveSession)())];
                case 2:
                    _f.sent();
                    _f.label = 3;
                case 3:
                    resolvedFetch = buildFetch(fetchOverride, source);
                    ARGS = __assign({ defaultHeaders: defaultHeaders, maxRetries: maxRetries, timeout: parseInt(process.env.API_TIMEOUT_MS || String(600 * 1000), 10), dangerouslyAllowBrowser: true, fetchOptions: (0, proxy_js_1.getProxyFetchOptions)({
                            forAnthropicAPI: true,
                        }) }, (resolvedFetch && {
                        fetch: resolvedFetch,
                    }));
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK)) return [3 /*break*/, 8];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@anthropic-ai/bedrock-sdk'); })];
                case 4:
                    AnthropicBedrock = (_f.sent()).AnthropicBedrock;
                    awsRegion = model === (0, model_js_1.getSmallFastModel)() &&
                        process.env.ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION
                        ? process.env.ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION
                        : (0, envUtils_js_1.getAWSRegion)();
                    bedrockArgs = __assign(__assign(__assign(__assign({}, ARGS), { awsRegion: awsRegion }), ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_BEDROCK_AUTH) && {
                        skipAuth: true,
                    })), ((0, debug_js_1.isDebugToStdErr)() && { logger: createStderrLogger() }));
                    if (!process.env.AWS_BEARER_TOKEN_BEDROCK) return [3 /*break*/, 5];
                    bedrockArgs.skipAuth = true;
                    // Add the Bearer token for Bedrock API key authentication
                    bedrockArgs.defaultHeaders = __assign(__assign({}, bedrockArgs.defaultHeaders), { Authorization: "Bearer ".concat(process.env.AWS_BEARER_TOKEN_BEDROCK) });
                    return [3 /*break*/, 7];
                case 5:
                    if (!!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_BEDROCK_AUTH)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, auth_js_1.refreshAndGetAwsCredentials)()];
                case 6:
                    cachedCredentials = _f.sent();
                    if (cachedCredentials) {
                        bedrockArgs.awsAccessKey = cachedCredentials.accessKeyId;
                        bedrockArgs.awsSecretKey = cachedCredentials.secretAccessKey;
                        bedrockArgs.awsSessionToken = cachedCredentials.sessionToken;
                    }
                    _f.label = 7;
                case 7: 
                // we have always been lying about the return type - this doesn't support batching or models
                return [2 /*return*/, new AnthropicBedrock(bedrockArgs)];
                case 8:
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY)) return [3 /*break*/, 13];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@anthropic-ai/foundry-sdk'); })];
                case 9:
                    AnthropicFoundry = (_f.sent()).AnthropicFoundry;
                    azureADTokenProvider = void 0;
                    if (!!process.env.ANTHROPIC_FOUNDRY_API_KEY) return [3 /*break*/, 12];
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_FOUNDRY_AUTH)) return [3 /*break*/, 10];
                    // Mock token provider for testing/proxy scenarios (similar to Vertex mock GoogleAuth)
                    azureADTokenProvider = function () { return Promise.resolve(''); };
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, Promise.resolve().then(function () { return require('@azure/identity'); })];
                case 11:
                    _c = _f.sent(), AzureCredential = _c.DefaultAzureCredential, getBearerTokenProvider = _c.getBearerTokenProvider;
                    azureADTokenProvider = getBearerTokenProvider(new AzureCredential(), 'https://cognitiveservices.azure.com/.default');
                    _f.label = 12;
                case 12:
                    foundryArgs = __assign(__assign(__assign({}, ARGS), (azureADTokenProvider && { azureADTokenProvider: azureADTokenProvider })), ((0, debug_js_1.isDebugToStdErr)() && { logger: createStderrLogger() }));
                    // we have always been lying about the return type - this doesn't support batching or models
                    return [2 /*return*/, new AnthropicFoundry(foundryArgs)];
                case 13:
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX)) return [3 /*break*/, 17];
                    if (!!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_VERTEX_AUTH)) return [3 /*break*/, 15];
                    return [4 /*yield*/, (0, auth_js_1.refreshGcpCredentialsIfNeeded)()];
                case 14:
                    _f.sent();
                    _f.label = 15;
                case 15: return [4 /*yield*/, Promise.all([
                        Promise.resolve().then(function () { return require('@anthropic-ai/vertex-sdk'); }),
                        Promise.resolve().then(function () { return require('google-auth-library'); }),
                    ])
                    // TODO: Cache either GoogleAuth instance or AuthClient to improve performance
                    // Currently we create a new GoogleAuth instance for every getAnthropicClient() call
                    // This could cause repeated authentication flows and metadata server checks
                    // However, caching needs careful handling of:
                    // - Credential refresh/expiration
                    // - Environment variable changes (GOOGLE_APPLICATION_CREDENTIALS, project vars)
                    // - Cross-request auth state management
                    // See: https://github.com/googleapis/google-auth-library-nodejs/issues/390 for caching challenges
                    // Prevent metadata server timeout by providing projectId as fallback
                    // google-auth-library checks project ID in this order:
                    // 1. Environment variables (GCLOUD_PROJECT, GOOGLE_CLOUD_PROJECT, etc.)
                    // 2. Credential files (service account JSON, ADC file)
                    // 3. gcloud config
                    // 4. GCE metadata server (causes 12s timeout outside GCP)
                    //
                    // We only set projectId if user hasn't configured other discovery methods
                    // to avoid interfering with their existing auth setup
                    // Check project environment variables in same order as google-auth-library
                    // See: https://github.com/googleapis/google-auth-library-nodejs/blob/main/src/auth/googleauth.ts
                ];
                case 16:
                    _d = _f.sent(), AnthropicVertex = _d[0].AnthropicVertex, GoogleAuth_1 = _d[1].GoogleAuth;
                    hasProjectEnvVar = process.env['GCLOUD_PROJECT'] ||
                        process.env['GOOGLE_CLOUD_PROJECT'] ||
                        process.env['gcloud_project'] ||
                        process.env['google_cloud_project'];
                    hasKeyFile = process.env['GOOGLE_APPLICATION_CREDENTIALS'] ||
                        process.env['google_application_credentials'];
                    googleAuth = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_VERTEX_AUTH)
                        ? {
                            // Mock GoogleAuth for testing/proxy scenarios
                            getClient: function () { return ({
                                getRequestHeaders: function () { return ({}); },
                            }); },
                        }
                        : new GoogleAuth_1(__assign({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] }, (hasProjectEnvVar || hasKeyFile
                            ? {}
                            : {
                                projectId: process.env.ANTHROPIC_VERTEX_PROJECT_ID,
                            })));
                    vertexArgs = __assign(__assign(__assign({}, ARGS), { region: (0, envUtils_js_1.getVertexRegionForModel)(model), googleAuth: googleAuth }), ((0, debug_js_1.isDebugToStdErr)() && { logger: createStderrLogger() }));
                    // we have always been lying about the return type - this doesn't support batching or models
                    return [2 /*return*/, new AnthropicVertex(vertexArgs)];
                case 17:
                    clientConfig = __assign(__assign(__assign({ apiKey: (0, auth_js_1.isClaudeAISubscriber)() ? null : apiKey || (0, auth_js_1.getAnthropicApiKey)(), authToken: (0, auth_js_1.isClaudeAISubscriber)()
                            ? (_e = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _e === void 0 ? void 0 : _e.accessToken
                            : undefined }, (process.env.USER_TYPE === 'ant' &&
                        (0, envUtils_js_1.isEnvTruthy)(process.env.USE_STAGING_OAUTH)
                        ? { baseURL: (0, oauth_js_1.getOauthConfig)().BASE_API_URL }
                        : {})), ARGS), ((0, debug_js_1.isDebugToStdErr)() && { logger: createStderrLogger() }));
                    return [2 /*return*/, new sdk_1.default(clientConfig)];
            }
        });
    });
}
function configureApiKeyHeaders(headers, isNonInteractiveSession) {
    return __awaiter(this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = process.env.ANTHROPIC_AUTH_TOKEN;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, auth_js_1.getApiKeyFromApiKeyHelper)(isNonInteractiveSession)];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    token = _a;
                    if (token) {
                        headers['Authorization'] = "Bearer ".concat(token);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getCustomHeaders() {
    var customHeaders = {};
    var customHeadersEnv = process.env.ANTHROPIC_CUSTOM_HEADERS;
    if (!customHeadersEnv)
        return customHeaders;
    // Split by newlines to support multiple headers
    var headerStrings = customHeadersEnv.split(/\n|\r\n/);
    for (var _i = 0, headerStrings_1 = headerStrings; _i < headerStrings_1.length; _i++) {
        var headerString = headerStrings_1[_i];
        if (!headerString.trim())
            continue;
        // Parse header in format "Name: Value" (curl style). Split on first `:`
        // then trim — avoids regex backtracking on malformed long header lines.
        var colonIdx = headerString.indexOf(':');
        if (colonIdx === -1)
            continue;
        var name_1 = headerString.slice(0, colonIdx).trim();
        var value = headerString.slice(colonIdx + 1).trim();
        if (name_1) {
            customHeaders[name_1] = value;
        }
    }
    return customHeaders;
}
exports.CLIENT_REQUEST_ID_HEADER = 'x-client-request-id';
function buildFetch(fetchOverride, source) {
    // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
    var inner = fetchOverride !== null && fetchOverride !== void 0 ? fetchOverride : globalThis.fetch;
    // Only send to the first-party API — Bedrock/Vertex/Foundry don't log it
    // and unknown headers risk rejection by strict proxies (inc-4029 class).
    var injectClientRequestId = (0, providers_js_1.getAPIProvider)() === 'firstParty' && (0, providers_js_1.isFirstPartyAnthropicBaseUrl)();
    return function (input, init) {
        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
        var headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
        // Generate a client-side request ID so timeouts (which return no server
        // request ID) can still be correlated with server logs by the API team.
        // Callers that want to track the ID themselves can pre-set the header.
        if (injectClientRequestId && !headers.has(exports.CLIENT_REQUEST_ID_HEADER)) {
            headers.set(exports.CLIENT_REQUEST_ID_HEADER, (0, crypto_1.randomUUID)());
        }
        try {
            // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
            var url = input instanceof Request ? input.url : String(input);
            var id = headers.get(exports.CLIENT_REQUEST_ID_HEADER);
            (0, debug_js_1.logForDebugging)("[API REQUEST] ".concat(new URL(url).pathname).concat(id ? " ".concat(exports.CLIENT_REQUEST_ID_HEADER, "=").concat(id) : '', " source=").concat(source !== null && source !== void 0 ? source : 'unknown'));
        }
        catch (_a) {
            // never let logging crash the fetch
        }
        return inner(input, __assign(__assign({}, init), { headers: headers }));
    };
}
