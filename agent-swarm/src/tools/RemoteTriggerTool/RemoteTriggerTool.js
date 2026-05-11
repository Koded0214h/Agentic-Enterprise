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
exports.RemoteTriggerTool = void 0;
var axios_1 = require("axios");
var v4_1 = require("zod/v4");
var oauth_js_1 = require("../../constants/oauth.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var client_js_1 = require("../../services/oauth/client.js");
var index_js_1 = require("../../services/policyLimits/index.js");
var Tool_js_1 = require("../../Tool.js");
var auth_js_1 = require("../../utils/auth.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        action: v4_1.z.enum(['list', 'get', 'create', 'update', 'run']),
        trigger_id: v4_1.z
            .string()
            .regex(/^[\w-]+$/)
            .optional()
            .describe('Required for get, update, and run'),
        body: v4_1.z
            .record(v4_1.z.string(), v4_1.z.unknown())
            .optional()
            .describe('JSON body for create and update'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        status: v4_1.z.number(),
        json: v4_1.z.string(),
    });
});
var TRIGGERS_BETA = 'ccr-triggers-2026-01-30';
exports.RemoteTriggerTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.REMOTE_TRIGGER_TOOL_NAME,
    searchHint: 'manage scheduled remote agent triggers',
    maxResultSizeChars: 100000,
    shouldDefer: true,
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    isEnabled: function () {
        return ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_surreal_dali', false) &&
            (0, index_js_1.isPolicyAllowed)('allow_remote_sessions'));
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function (input) {
        return input.action === 'list' || input.action === 'get';
    },
    toAutoClassifierInput: function (input) {
        return "RemoteTrigger ".concat(input.action).concat(input.trigger_id ? " ".concat(input.trigger_id) : '');
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
                return [2 /*return*/, prompt_js_1.PROMPT];
            });
        });
    },
    call: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var accessToken, orgUUID, base, headers, action, trigger_id, body, method, url, data, res;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                    case 1:
                        _b.sent();
                        accessToken = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken;
                        if (!accessToken) {
                            throw new Error('Not authenticated with a claude.ai account. Run /login and try again.');
                        }
                        return [4 /*yield*/, (0, client_js_1.getOrganizationUUID)()];
                    case 2:
                        orgUUID = _b.sent();
                        if (!orgUUID) {
                            throw new Error('Unable to resolve organization UUID.');
                        }
                        base = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/code/triggers");
                        headers = {
                            Authorization: "Bearer ".concat(accessToken),
                            'Content-Type': 'application/json',
                            'anthropic-version': '2023-06-01',
                            'anthropic-beta': TRIGGERS_BETA,
                            'x-organization-uuid': orgUUID,
                        };
                        action = input.action, trigger_id = input.trigger_id, body = input.body;
                        switch (action) {
                            case 'list':
                                method = 'GET';
                                url = base;
                                break;
                            case 'get':
                                if (!trigger_id)
                                    throw new Error('get requires trigger_id');
                                method = 'GET';
                                url = "".concat(base, "/").concat(trigger_id);
                                break;
                            case 'create':
                                if (!body)
                                    throw new Error('create requires body');
                                method = 'POST';
                                url = base;
                                data = body;
                                break;
                            case 'update':
                                if (!trigger_id)
                                    throw new Error('update requires trigger_id');
                                if (!body)
                                    throw new Error('update requires body');
                                method = 'POST';
                                url = "".concat(base, "/").concat(trigger_id);
                                data = body;
                                break;
                            case 'run':
                                if (!trigger_id)
                                    throw new Error('run requires trigger_id');
                                method = 'POST';
                                url = "".concat(base, "/").concat(trigger_id, "/run");
                                data = {};
                                break;
                        }
                        return [4 /*yield*/, axios_1.default.request({
                                method: method,
                                url: url,
                                headers: headers,
                                data: data,
                                timeout: 20000,
                                signal: context.abortController.signal,
                                validateStatus: function () { return true; },
                            })];
                    case 3:
                        res = _b.sent();
                        return [2 /*return*/, {
                                data: {
                                    status: res.status,
                                    json: (0, slowOperations_js_1.jsonStringify)(res.data),
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: "HTTP ".concat(output.status, "\n").concat(output.json),
        };
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
});
