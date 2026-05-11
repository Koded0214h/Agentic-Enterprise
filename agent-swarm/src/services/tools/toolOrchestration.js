"use strict";
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
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
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
exports.runTools = runTools;
var Tool_js_1 = require("../../Tool.js");
var generators_js_1 = require("../../utils/generators.js");
var toolExecution_js_1 = require("./toolExecution.js");
function getMaxToolUseConcurrency() {
    return (parseInt(process.env.CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY || '', 10) || 10);
}
function runTools(toolUseMessages, assistantMessages, canUseTool, toolUseContext) {
    return __asyncGenerator(this, arguments, function runTools_1() {
        var currentContext, _i, _a, _b, isConcurrencySafe, blocks, queuedContextModifiers, _c, _d, _e, update, _f, toolUseID, modifyContext, e_1_1, _g, blocks_1, block, modifiers, _h, modifiers_1, modifier, _j, _k, _l, update, e_2_1;
        var _m, e_1, _o, _p, _q, e_2, _r, _s;
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    currentContext = toolUseContext;
                    _i = 0, _a = partitionToolCalls(toolUseMessages, currentContext);
                    _t.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 32];
                    _b = _a[_i], isConcurrencySafe = _b.isConcurrencySafe, blocks = _b.blocks;
                    if (!isConcurrencySafe) return [3 /*break*/, 18];
                    queuedContextModifiers = {};
                    _t.label = 2;
                case 2:
                    _t.trys.push([2, 9, 10, 15]);
                    _c = true, _d = (e_1 = void 0, __asyncValues(runToolsConcurrently(blocks, assistantMessages, canUseTool, currentContext)));
                    _t.label = 3;
                case 3: return [4 /*yield*/, __await(_d.next())];
                case 4:
                    if (!(_e = _t.sent(), _m = _e.done, !_m)) return [3 /*break*/, 8];
                    _p = _e.value;
                    _c = false;
                    update = _p;
                    if (update.contextModifier) {
                        _f = update.contextModifier, toolUseID = _f.toolUseID, modifyContext = _f.modifyContext;
                        if (!queuedContextModifiers[toolUseID]) {
                            queuedContextModifiers[toolUseID] = [];
                        }
                        queuedContextModifiers[toolUseID].push(modifyContext);
                    }
                    return [4 /*yield*/, __await({
                            message: update.message,
                            newContext: currentContext,
                        })];
                case 5: return [4 /*yield*/, _t.sent()];
                case 6:
                    _t.sent();
                    _t.label = 7;
                case 7:
                    _c = true;
                    return [3 /*break*/, 3];
                case 8: return [3 /*break*/, 15];
                case 9:
                    e_1_1 = _t.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 15];
                case 10:
                    _t.trys.push([10, , 13, 14]);
                    if (!(!_c && !_m && (_o = _d.return))) return [3 /*break*/, 12];
                    return [4 /*yield*/, __await(_o.call(_d))];
                case 11:
                    _t.sent();
                    _t.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 14: return [7 /*endfinally*/];
                case 15:
                    for (_g = 0, blocks_1 = blocks; _g < blocks_1.length; _g++) {
                        block = blocks_1[_g];
                        modifiers = queuedContextModifiers[block.id];
                        if (!modifiers) {
                            continue;
                        }
                        for (_h = 0, modifiers_1 = modifiers; _h < modifiers_1.length; _h++) {
                            modifier = modifiers_1[_h];
                            currentContext = modifier(currentContext);
                        }
                    }
                    return [4 /*yield*/, __await({ newContext: currentContext })];
                case 16: return [4 /*yield*/, _t.sent()];
                case 17:
                    _t.sent();
                    return [3 /*break*/, 31];
                case 18:
                    _t.trys.push([18, 25, 26, 31]);
                    _j = true, _k = (e_2 = void 0, __asyncValues(runToolsSerially(blocks, assistantMessages, canUseTool, currentContext)));
                    _t.label = 19;
                case 19: return [4 /*yield*/, __await(_k.next())];
                case 20:
                    if (!(_l = _t.sent(), _q = _l.done, !_q)) return [3 /*break*/, 24];
                    _s = _l.value;
                    _j = false;
                    update = _s;
                    if (update.newContext) {
                        currentContext = update.newContext;
                    }
                    return [4 /*yield*/, __await({
                            message: update.message,
                            newContext: currentContext,
                        })];
                case 21: return [4 /*yield*/, _t.sent()];
                case 22:
                    _t.sent();
                    _t.label = 23;
                case 23:
                    _j = true;
                    return [3 /*break*/, 19];
                case 24: return [3 /*break*/, 31];
                case 25:
                    e_2_1 = _t.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 31];
                case 26:
                    _t.trys.push([26, , 29, 30]);
                    if (!(!_j && !_q && (_r = _k.return))) return [3 /*break*/, 28];
                    return [4 /*yield*/, __await(_r.call(_k))];
                case 27:
                    _t.sent();
                    _t.label = 28;
                case 28: return [3 /*break*/, 30];
                case 29:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 30: return [7 /*endfinally*/];
                case 31:
                    _i++;
                    return [3 /*break*/, 1];
                case 32: return [2 /*return*/];
            }
        });
    });
}
/**
 * Partition tool calls into batches where each batch is either:
 * 1. A single non-read-only tool, or
 * 2. Multiple consecutive read-only tools
 */
function partitionToolCalls(toolUseMessages, toolUseContext) {
    return toolUseMessages.reduce(function (acc, toolUse) {
        var _a;
        var tool = (0, Tool_js_1.findToolByName)(toolUseContext.options.tools, toolUse.name);
        var parsedInput = tool === null || tool === void 0 ? void 0 : tool.inputSchema.safeParse(toolUse.input);
        var isConcurrencySafe = (parsedInput === null || parsedInput === void 0 ? void 0 : parsedInput.success)
            ? (function () {
                try {
                    return Boolean(tool === null || tool === void 0 ? void 0 : tool.isConcurrencySafe(parsedInput.data));
                }
                catch (_a) {
                    // If isConcurrencySafe throws (e.g., due to shell-quote parse failure),
                    // treat as not concurrency-safe to be conservative
                    return false;
                }
            })()
            : false;
        if (isConcurrencySafe && ((_a = acc[acc.length - 1]) === null || _a === void 0 ? void 0 : _a.isConcurrencySafe)) {
            acc[acc.length - 1].blocks.push(toolUse);
        }
        else {
            acc.push({ isConcurrencySafe: isConcurrencySafe, blocks: [toolUse] });
        }
        return acc;
    }, []);
}
function runToolsSerially(toolUseMessages, assistantMessages, canUseTool, toolUseContext) {
    return __asyncGenerator(this, arguments, function runToolsSerially_1() {
        var currentContext, _loop_1, _i, toolUseMessages_1, toolUse;
        var _a, e_3, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    currentContext = toolUseContext;
                    _loop_1 = function (toolUse) {
                        var _e, _f, _g, update, e_3_1;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    toolUseContext.setInProgressToolUseIDs(function (prev) {
                                        return new Set(prev).add(toolUse.id);
                                    });
                                    _h.label = 1;
                                case 1:
                                    _h.trys.push([1, 8, 9, 14]);
                                    _e = true, _f = (e_3 = void 0, __asyncValues((0, toolExecution_js_1.runToolUse)(toolUse, assistantMessages.find(function (_) {
                                        return _.message.content.some(function (_) { return _.type === 'tool_use' && _.id === toolUse.id; });
                                    }), canUseTool, currentContext)));
                                    _h.label = 2;
                                case 2: return [4 /*yield*/, __await(_f.next())];
                                case 3:
                                    if (!(_g = _h.sent(), _a = _g.done, !_a)) return [3 /*break*/, 7];
                                    _c = _g.value;
                                    _e = false;
                                    update = _c;
                                    if (update.contextModifier) {
                                        currentContext = update.contextModifier.modifyContext(currentContext);
                                    }
                                    return [4 /*yield*/, __await({
                                            message: update.message,
                                            newContext: currentContext,
                                        })];
                                case 4: return [4 /*yield*/, _h.sent()];
                                case 5:
                                    _h.sent();
                                    _h.label = 6;
                                case 6:
                                    _e = true;
                                    return [3 /*break*/, 2];
                                case 7: return [3 /*break*/, 14];
                                case 8:
                                    e_3_1 = _h.sent();
                                    e_3 = { error: e_3_1 };
                                    return [3 /*break*/, 14];
                                case 9:
                                    _h.trys.push([9, , 12, 13]);
                                    if (!(!_e && !_a && (_b = _f.return))) return [3 /*break*/, 11];
                                    return [4 /*yield*/, __await(_b.call(_f))];
                                case 10:
                                    _h.sent();
                                    _h.label = 11;
                                case 11: return [3 /*break*/, 13];
                                case 12:
                                    if (e_3) throw e_3.error;
                                    return [7 /*endfinally*/];
                                case 13: return [7 /*endfinally*/];
                                case 14:
                                    markToolUseAsComplete(toolUseContext, toolUse.id);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, toolUseMessages_1 = toolUseMessages;
                    _d.label = 1;
                case 1:
                    if (!(_i < toolUseMessages_1.length)) return [3 /*break*/, 4];
                    toolUse = toolUseMessages_1[_i];
                    return [5 /*yield**/, _loop_1(toolUse)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function runToolsConcurrently(toolUseMessages, assistantMessages, canUseTool, toolUseContext) {
    return __asyncGenerator(this, arguments, function runToolsConcurrently_1() {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, generators_js_1.all)(toolUseMessages.map(function (toolUse) {
                        return __asyncGenerator(this, arguments, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        toolUseContext.setInProgressToolUseIDs(function (prev) {
                                            return new Set(prev).add(toolUse.id);
                                        });
                                        return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, toolExecution_js_1.runToolUse)(toolUse, assistantMessages.find(function (_) {
                                                return _.message.content.some(function (_) { return _.type === 'tool_use' && _.id === toolUse.id; });
                                            }), canUseTool, toolUseContext))))];
                                    case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                                    case 2:
                                        _a.sent();
                                        markToolUseAsComplete(toolUseContext, toolUse.id);
                                        return [2 /*return*/];
                                }
                            });
                        });
                    }), getMaxToolUseConcurrency()))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function markToolUseAsComplete(toolUseContext, toolUseID) {
    toolUseContext.setInProgressToolUseIDs(function (prev) {
        var next = new Set(prev);
        next.delete(toolUseID);
        return next;
    });
}
