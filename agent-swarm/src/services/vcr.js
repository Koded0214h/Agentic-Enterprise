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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withVCR = withVCR;
exports.withStreamingVCR = withStreamingVCR;
exports.withTokenCountVCR = withTokenCountVCR;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var isPlainObject_js_1 = require("lodash-es/isPlainObject.js");
var mapValues_js_1 = require("lodash-es/mapValues.js");
var path_1 = require("path");
var cost_tracker_js_1 = require("src/cost-tracker.js");
var modelCost_js_1 = require("src/utils/modelCost.js");
var cwd_js_1 = require("../utils/cwd.js");
var env_js_1 = require("../utils/env.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var messages_js_1 = require("../utils/messages.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
function shouldUseVCR() {
    if (process.env.NODE_ENV === 'test') {
        return true;
    }
    if (process.env.USER_TYPE === 'ant' && (0, envUtils_js_1.isEnvTruthy)(process.env.FORCE_VCR)) {
        return true;
    }
    return false;
}
/**
 * Generic fixture management helper
 * Handles caching, reading, writing fixtures for any data type
 */
function withFixture(input, fixtureName, f) {
    return __awaiter(this, void 0, void 0, function () {
        var hash, filename, cached, _a, e_1, code, result;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!!shouldUseVCR()) return [3 /*break*/, 2];
                    return [4 /*yield*/, f()];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    hash = (0, crypto_1.createHash)('sha1')
                        .update((0, slowOperations_js_1.jsonStringify)(input))
                        .digest('hex')
                        .slice(0, 12);
                    filename = (0, path_1.join)((_b = process.env.CLAUDE_CODE_TEST_FIXTURES_ROOT) !== null && _b !== void 0 ? _b : (0, cwd_js_1.getCwd)(), "fixtures/".concat(fixtureName, "-").concat(hash, ".json"));
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    _a = slowOperations_js_1.jsonParse;
                    return [4 /*yield*/, (0, promises_1.readFile)(filename, { encoding: 'utf8' })];
                case 4:
                    cached = _a.apply(void 0, [_c.sent()]);
                    return [2 /*return*/, cached];
                case 5:
                    e_1 = _c.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code !== 'ENOENT') {
                        throw e_1;
                    }
                    return [3 /*break*/, 6];
                case 6:
                    if ((env_js_1.env.isCI || process.env.CI) && !(0, envUtils_js_1.isEnvTruthy)(process.env.VCR_RECORD)) {
                        throw new Error("Fixture missing: ".concat(filename, ". Re-run tests with VCR_RECORD=1, then commit the result."));
                    }
                    return [4 /*yield*/, f()];
                case 7:
                    result = _c.sent();
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(filename), { recursive: true })];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(filename, (0, slowOperations_js_1.jsonStringify)(result, null, 2), {
                            encoding: 'utf8',
                        })];
                case 9:
                    _c.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function withVCR(messages, f) {
    return __awaiter(this, void 0, void 0, function () {
        var messagesForAPI, dehydratedInput, filename, cached, _a, e_2, code, results;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!!shouldUseVCR()) return [3 /*break*/, 2];
                    return [4 /*yield*/, f()];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    messagesForAPI = (0, messages_js_1.normalizeMessagesForAPI)(messages.filter(function (_) {
                        if (_.type !== 'user') {
                            return true;
                        }
                        if (_.isMeta) {
                            return false;
                        }
                        return true;
                    }));
                    dehydratedInput = mapMessages(messagesForAPI.map(function (_) { return _.message.content; }), dehydrateValue);
                    filename = (0, path_1.join)((_b = process.env.CLAUDE_CODE_TEST_FIXTURES_ROOT) !== null && _b !== void 0 ? _b : (0, cwd_js_1.getCwd)(), "fixtures/".concat(dehydratedInput.map(function (_) { return (0, crypto_1.createHash)('sha1').update((0, slowOperations_js_1.jsonStringify)(_)).digest('hex').slice(0, 6); }).join('-'), ".json"));
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    _a = slowOperations_js_1.jsonParse;
                    return [4 /*yield*/, (0, promises_1.readFile)(filename, { encoding: 'utf8' })];
                case 4:
                    cached = _a.apply(void 0, [_c.sent()]);
                    cached.output.forEach(addCachedCostToTotalSessionCost);
                    return [2 /*return*/, cached.output.map(function (message, index) {
                            return mapMessage(message, hydrateValue, index, (0, crypto_1.randomUUID)());
                        })];
                case 5:
                    e_2 = _c.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code !== 'ENOENT') {
                        throw e_2;
                    }
                    return [3 /*break*/, 6];
                case 6:
                    if (env_js_1.env.isCI && !(0, envUtils_js_1.isEnvTruthy)(process.env.VCR_RECORD)) {
                        throw new Error("Anthropic API fixture missing: ".concat(filename, ". Re-run tests with VCR_RECORD=1, then commit the result. Input messages:\n").concat((0, slowOperations_js_1.jsonStringify)(dehydratedInput, null, 2)));
                    }
                    return [4 /*yield*/, f()];
                case 7:
                    results = _c.sent();
                    if (env_js_1.env.isCI && !(0, envUtils_js_1.isEnvTruthy)(process.env.VCR_RECORD)) {
                        return [2 /*return*/, results];
                    }
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(filename), { recursive: true })];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(filename, (0, slowOperations_js_1.jsonStringify)({
                            input: dehydratedInput,
                            output: results.map(function (message, index) {
                                return mapMessage(message, dehydrateValue, index);
                            }),
                        }, null, 2), { encoding: 'utf8' })];
                case 9:
                    _c.sent();
                    return [2 /*return*/, results];
            }
        });
    });
}
function addCachedCostToTotalSessionCost(message) {
    if (message.type === 'stream_event') {
        return;
    }
    var model = message.message.model;
    var usage = message.message.usage;
    var costUSD = (0, modelCost_js_1.calculateUSDCost)(model, usage);
    (0, cost_tracker_js_1.addToTotalSessionCost)(costUSD, usage, model);
}
function mapMessages(messages, f) {
    return messages.map(function (_) {
        if (typeof _ === 'string') {
            return f(_);
        }
        return _.map(function (_) {
            switch (_.type) {
                case 'tool_result':
                    if (typeof _.content === 'string') {
                        return __assign(__assign({}, _), { content: f(_.content) });
                    }
                    if (Array.isArray(_.content)) {
                        return __assign(__assign({}, _), { content: _.content.map(function (_) {
                                switch (_.type) {
                                    case 'text':
                                        return __assign(__assign({}, _), { text: f(_.text) });
                                    case 'image':
                                        return _;
                                    default:
                                        return undefined;
                                }
                            }) });
                    }
                    return _;
                case 'text':
                    return __assign(__assign({}, _), { text: f(_.text) });
                case 'tool_use':
                    return __assign(__assign({}, _), { input: mapValuesDeep(_.input, f) });
                case 'image':
                    return _;
                default:
                    return undefined;
            }
        });
    });
}
function mapValuesDeep(obj, f) {
    return (0, mapValues_js_1.default)(obj, function (val, key) {
        if (Array.isArray(val)) {
            return val.map(function (_) { return mapValuesDeep(_, f); });
        }
        if ((0, isPlainObject_js_1.default)(val)) {
            return mapValuesDeep(val, f);
        }
        return f(val, key, obj);
    });
}
function mapAssistantMessage(message, f, index, uuid) {
    return {
        // Use provided UUID if given (hydrate path uses randomUUID for globally unique IDs),
        // otherwise fall back to deterministic index-based UUID (dehydrate/fixture path).
        // sessionStorage.ts deduplicates messages by UUID, so without unique UUIDs across
        // VCR calls, resumed sessions would treat different responses as duplicates.
        uuid: uuid !== null && uuid !== void 0 ? uuid : "UUID-".concat(index),
        requestId: 'REQUEST_ID',
        timestamp: message.timestamp,
        message: __assign(__assign({}, message.message), { content: message.message.content
                .map(function (_) {
                switch (_.type) {
                    case 'text':
                        return __assign(__assign({}, _), { text: f(_.text), citations: _.citations || [] }); // Ensure citations
                    case 'tool_use':
                        return __assign(__assign({}, _), { input: mapValuesDeep(_.input, f) });
                    default:
                        return _; // Handle other block types unchanged
                }
            })
                .filter(Boolean) }),
        type: 'assistant',
    };
}
function mapMessage(message, f, index, uuid) {
    if (message.type === 'assistant') {
        return mapAssistantMessage(message, f, index, uuid);
    }
    else {
        return message;
    }
}
function dehydrateValue(s) {
    if (typeof s !== 'string') {
        return s;
    }
    var cwd = (0, cwd_js_1.getCwd)();
    var configHome = (0, envUtils_js_1.getClaudeConfigHomeDir)();
    var s1 = s
        .replace(/num_files="\d+"/g, 'num_files="[NUM]"')
        .replace(/duration_ms="\d+"/g, 'duration_ms="[DURATION]"')
        .replace(/cost_usd="\d+"/g, 'cost_usd="[COST]"')
        // Note: We intentionally don't replace all forward slashes with path.sep here.
        // That would corrupt XML-like tags (e.g., </system-reminder> -> <\system-reminder>).
        // The [CONFIG_HOME] and [CWD] replacements below handle path normalization.
        .replaceAll(configHome, '[CONFIG_HOME]')
        .replaceAll(cwd, '[CWD]')
        .replace(/Available commands:.+/, 'Available commands: [COMMANDS]');
    // On Windows, paths may appear in multiple forms:
    // 1. Forward-slash variants (Git, some Node APIs)
    // 2. JSON-escaped variants (backslashes doubled in serialized JSON within messages)
    if (process.platform === 'win32') {
        var cwdFwd = cwd.replaceAll('\\', '/');
        var configHomeFwd = configHome.replaceAll('\\', '/');
        // jsonStringify escapes \ to \\ - match paths embedded in JSON strings
        var cwdJsonEscaped = (0, slowOperations_js_1.jsonStringify)(cwd).slice(1, -1);
        var configHomeJsonEscaped = (0, slowOperations_js_1.jsonStringify)(configHome).slice(1, -1);
        s1 = s1
            .replaceAll(cwdJsonEscaped, '[CWD]')
            .replaceAll(configHomeJsonEscaped, '[CONFIG_HOME]')
            .replaceAll(cwdFwd, '[CWD]')
            .replaceAll(configHomeFwd, '[CONFIG_HOME]');
    }
    // Normalize backslash path separators after placeholders so VCR fixture
    // hashes match across platforms (e.g., [CWD]\foo\bar -> [CWD]/foo/bar)
    // Handle both single backslashes and JSON-escaped double backslashes (\\)
    s1 = s1
        .replace(/\[CWD\][^\s"'<>]*/g, function (match) {
        return match.replaceAll('\\\\', '/').replaceAll('\\', '/');
    })
        .replace(/\[CONFIG_HOME\][^\s"'<>]*/g, function (match) {
        return match.replaceAll('\\\\', '/').replaceAll('\\', '/');
    });
    if (s1.includes('Files modified by user:')) {
        return 'Files modified by user: [FILES]';
    }
    return s1;
}
function hydrateValue(s) {
    if (typeof s !== 'string') {
        return s;
    }
    return s
        .replaceAll('[NUM]', '1')
        .replaceAll('[DURATION]', '100')
        .replaceAll('[CONFIG_HOME]', (0, envUtils_js_1.getClaudeConfigHomeDir)())
        .replaceAll('[CWD]', (0, cwd_js_1.getCwd)());
}
function withStreamingVCR(messages, f) {
    return __asyncGenerator(this, arguments, function withStreamingVCR_1() {
        var buffer, cachedBuffer;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!shouldUseVCR()) return [3 /*break*/, 4];
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(f())))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    buffer = [];
                    return [4 /*yield*/, __await(withVCR(messages, function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c, message, e_3_1;
                            var _d, e_3, _e, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        _g.trys.push([0, 5, 6, 11]);
                                        _a = true, _b = __asyncValues(f());
                                        _g.label = 1;
                                    case 1: return [4 /*yield*/, _b.next()];
                                    case 2:
                                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 4];
                                        _f = _c.value;
                                        _a = false;
                                        message = _f;
                                        buffer.push(message);
                                        _g.label = 3;
                                    case 3:
                                        _a = true;
                                        return [3 /*break*/, 1];
                                    case 4: return [3 /*break*/, 11];
                                    case 5:
                                        e_3_1 = _g.sent();
                                        e_3 = { error: e_3_1 };
                                        return [3 /*break*/, 11];
                                    case 6:
                                        _g.trys.push([6, , 9, 10]);
                                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 8];
                                        return [4 /*yield*/, _e.call(_b)];
                                    case 7:
                                        _g.sent();
                                        _g.label = 8;
                                    case 8: return [3 /*break*/, 10];
                                    case 9:
                                        if (e_3) throw e_3.error;
                                        return [7 /*endfinally*/];
                                    case 10: return [7 /*endfinally*/];
                                    case 11: return [2 /*return*/, buffer];
                                }
                            });
                        }); }))];
                case 5:
                    cachedBuffer = _a.sent();
                    if (!(cachedBuffer.length > 0)) return [3 /*break*/, 9];
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(cachedBuffer)))];
                case 6: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 8: return [2 /*return*/, _a.sent()];
                case 9: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(buffer)))];
                case 10: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 11:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function withTokenCountVCR(messages, tools, f) {
    return __awaiter(this, void 0, void 0, function () {
        var cwdSlug, dehydrated, result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cwdSlug = (0, cwd_js_1.getCwd)().replace(/[^a-zA-Z0-9]/g, '-');
                    dehydrated = dehydrateValue((0, slowOperations_js_1.jsonStringify)({ messages: messages, tools: tools }))
                        .replaceAll(cwdSlug, '[CWD_SLUG]')
                        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[UUID]')
                        .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g, '[TIMESTAMP]');
                    return [4 /*yield*/, withFixture(dehydrated, 'token-count', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {};
                                        return [4 /*yield*/, f()];
                                    case 1: return [2 /*return*/, (_a.tokenCount = _b.sent(),
                                            _a)];
                                }
                            });
                        }); })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.tokenCount];
            }
        });
    });
}
