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
exports.lastX = lastX;
exports.returnValue = returnValue;
exports.all = all;
exports.toArray = toArray;
exports.fromArray = fromArray;
var NO_VALUE = Symbol('NO_VALUE');
function lastX(as) {
    return __awaiter(this, void 0, void 0, function () {
        var lastValue, a, e_1_1;
        var _a, as_1, as_1_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    lastValue = NO_VALUE;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, as_1 = __asyncValues(as);
                    _e.label = 2;
                case 2: return [4 /*yield*/, as_1.next()];
                case 3:
                    if (!(as_1_1 = _e.sent(), _b = as_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = as_1_1.value;
                    _a = false;
                    a = _d;
                    lastValue = a;
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = as_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(as_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12:
                    if (lastValue === NO_VALUE) {
                        throw new Error('No items in generator');
                    }
                    return [2 /*return*/, lastValue];
            }
        });
    });
}
function returnValue(as) {
    return __awaiter(this, void 0, void 0, function () {
        var e;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, as.next()];
                case 1:
                    e = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!e.done) return [3 /*break*/, 0];
                    _a.label = 3;
                case 3: return [2 /*return*/, e.value];
            }
        });
    });
}
// Run all generators concurrently up to a concurrency cap, yielding values as they come in
function all(generators_1) {
    return __asyncGenerator(this, arguments, function all_1(generators, concurrencyCap) {
        var next, waiting, promises, gen, _a, done, value, generator, promise, nextGen;
        if (concurrencyCap === void 0) { concurrencyCap = Infinity; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    next = function (generator) {
                        var promise = generator
                            .next()
                            .then(function (_a) {
                            var done = _a.done, value = _a.value;
                            return ({
                                done: done,
                                value: value,
                                generator: generator,
                                promise: promise,
                            });
                        });
                        return promise;
                    };
                    waiting = __spreadArray([], generators, true);
                    promises = new Set();
                    // Start initial batch up to concurrency cap
                    while (promises.size < concurrencyCap && waiting.length > 0) {
                        gen = waiting.shift();
                        promises.add(next(gen));
                    }
                    _b.label = 1;
                case 1:
                    if (!(promises.size > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, __await(Promise.race(promises))];
                case 2:
                    _a = _b.sent(), done = _a.done, value = _a.value, generator = _a.generator, promise = _a.promise;
                    promises.delete(promise);
                    if (!!done) return [3 /*break*/, 6];
                    promises.add(next(generator));
                    if (!(value !== undefined)) return [3 /*break*/, 5];
                    return [4 /*yield*/, __await(value)];
                case 3: return [4 /*yield*/, _b.sent()];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    if (waiting.length > 0) {
                        nextGen = waiting.shift();
                        promises.add(next(nextGen));
                    }
                    _b.label = 7;
                case 7: return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function toArray(generator) {
    return __awaiter(this, void 0, void 0, function () {
        var result, a, e_2_1;
        var _a, generator_1, generator_1_1;
        var _b, e_2, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    result = [];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, generator_1 = __asyncValues(generator);
                    _e.label = 2;
                case 2: return [4 /*yield*/, generator_1.next()];
                case 3:
                    if (!(generator_1_1 = _e.sent(), _b = generator_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = generator_1_1.value;
                    _a = false;
                    a = _d;
                    result.push(a);
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = generator_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(generator_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, result];
            }
        });
    });
}
function fromArray(values) {
    return __asyncGenerator(this, arguments, function fromArray_1() {
        var _i, values_1, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, values_1 = values;
                    _a.label = 1;
                case 1:
                    if (!(_i < values_1.length)) return [3 /*break*/, 5];
                    value = values_1[_i];
                    return [4 /*yield*/, __await(value)];
                case 2: return [4 /*yield*/, _a.sent()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
