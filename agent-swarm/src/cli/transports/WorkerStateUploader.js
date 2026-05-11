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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerStateUploader = void 0;
var sleep_js_1 = require("../../utils/sleep.js");
var WorkerStateUploader = /** @class */ (function () {
    function WorkerStateUploader(config) {
        this.inflight = null;
        this.pending = null;
        this.closed = false;
        this.config = config;
    }
    /**
     * Enqueue a patch to PUT /worker. Coalesces with any existing pending
     * patch. Fire-and-forget — callers don't need to await.
     */
    WorkerStateUploader.prototype.enqueue = function (patch) {
        if (this.closed)
            return;
        this.pending = this.pending ? coalescePatches(this.pending, patch) : patch;
        void this.drain();
    };
    WorkerStateUploader.prototype.close = function () {
        this.closed = true;
        this.pending = null;
    };
    WorkerStateUploader.prototype.drain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.inflight || this.closed)
                    return [2 /*return*/];
                if (!this.pending)
                    return [2 /*return*/];
                payload = this.pending;
                this.pending = null;
                this.inflight = this.sendWithRetry(payload).then(function () {
                    _this.inflight = null;
                    if (_this.pending && !_this.closed) {
                        void _this.drain();
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    /** Retries indefinitely with exponential backoff until success or close(). */
    WorkerStateUploader.prototype.sendWithRetry = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var current, failures, ok;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        current = payload;
                        failures = 0;
                        _a.label = 1;
                    case 1:
                        if (!!this.closed) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.config.send(current)];
                    case 2:
                        ok = _a.sent();
                        if (ok)
                            return [2 /*return*/];
                        failures++;
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(this.retryDelay(failures))
                            // Absorb any patches that arrived during the retry
                        ];
                    case 3:
                        _a.sent();
                        // Absorb any patches that arrived during the retry
                        if (this.pending && !this.closed) {
                            current = coalescePatches(current, this.pending);
                            this.pending = null;
                        }
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WorkerStateUploader.prototype.retryDelay = function (failures) {
        var exponential = Math.min(this.config.baseDelayMs * Math.pow(2, (failures - 1)), this.config.maxDelayMs);
        var jitter = Math.random() * this.config.jitterMs;
        return exponential + jitter;
    };
    return WorkerStateUploader;
}());
exports.WorkerStateUploader = WorkerStateUploader;
/**
 * Coalesce two patches for PUT /worker.
 *
 * Top-level keys: overlay replaces base (last value wins).
 * Metadata keys (external_metadata, internal_metadata): RFC 7396 merge
 * one level deep — overlay keys are added/overwritten, null values
 * preserved for server-side delete.
 */
function coalescePatches(base, overlay) {
    var merged = __assign({}, base);
    for (var _i = 0, _a = Object.entries(overlay); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if ((key === 'external_metadata' || key === 'internal_metadata') &&
            merged[key] &&
            typeof merged[key] === 'object' &&
            typeof value === 'object' &&
            value !== null) {
            // RFC 7396 merge — overlay keys win, nulls preserved for server
            merged[key] = __assign(__assign({}, merged[key]), value);
        }
        else {
            merged[key] = value;
        }
    }
    return merged;
}
