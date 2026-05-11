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
exports.usePrStatus = usePrStatus;
var react_1 = require("react");
var state_js_1 = require("../bootstrap/state.js");
var ghPrStatus_js_1 = require("../utils/ghPrStatus.js");
var POLL_INTERVAL_MS = 60000;
var SLOW_GH_THRESHOLD_MS = 4000;
var IDLE_STOP_MS = 60 * 60000; // stop polling after 60 min idle
var INITIAL_STATE = {
    number: null,
    url: null,
    reviewState: null,
    lastUpdated: 0,
};
/**
 * Polls PR review status every 60s while the session is active.
 * When no interaction is detected for 60 minutes, the loop stops — no
 * timers remain. React re-runs the effect when isLoading changes
 * (turn starts/ends), restarting the loop. Effect setup schedules
 * the next poll relative to the last fetch time so turn boundaries
 * don't spawn `gh` more than once per interval. Disables permanently
 * if a fetch exceeds 4s.
 *
 * Pass `enabled: false` to skip polling entirely (hook still must be
 * called unconditionally to satisfy the rules of hooks).
 */
function usePrStatus(isLoading, enabled) {
    if (enabled === void 0) { enabled = true; }
    var _a = (0, react_1.useState)(INITIAL_STATE), prStatus = _a[0], setPrStatus = _a[1];
    var timeoutRef = (0, react_1.useRef)(null);
    var disabledRef = (0, react_1.useRef)(false);
    var lastFetchRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        if (disabledRef.current)
            return;
        var cancelled = false;
        var lastSeenInteractionTime = -1;
        var lastActivityTimestamp = Date.now();
        function poll() {
            return __awaiter(this, void 0, void 0, function () {
                var currentInteractionTime, start, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (cancelled)
                                return [2 /*return*/];
                            currentInteractionTime = (0, state_js_1.getLastInteractionTime)();
                            if (lastSeenInteractionTime !== currentInteractionTime) {
                                lastSeenInteractionTime = currentInteractionTime;
                                lastActivityTimestamp = Date.now();
                            }
                            else if (Date.now() - lastActivityTimestamp >= IDLE_STOP_MS) {
                                return [2 /*return*/];
                            }
                            start = Date.now();
                            return [4 /*yield*/, (0, ghPrStatus_js_1.fetchPrStatus)()];
                        case 1:
                            result = _a.sent();
                            if (cancelled)
                                return [2 /*return*/];
                            lastFetchRef.current = start;
                            setPrStatus(function (prev) {
                                var _a, _b, _c;
                                var newNumber = (_a = result === null || result === void 0 ? void 0 : result.number) !== null && _a !== void 0 ? _a : null;
                                var newReviewState = (_b = result === null || result === void 0 ? void 0 : result.reviewState) !== null && _b !== void 0 ? _b : null;
                                if (prev.number === newNumber && prev.reviewState === newReviewState) {
                                    return prev;
                                }
                                return {
                                    number: newNumber,
                                    url: (_c = result === null || result === void 0 ? void 0 : result.url) !== null && _c !== void 0 ? _c : null,
                                    reviewState: newReviewState,
                                    lastUpdated: Date.now(),
                                };
                            });
                            if (Date.now() - start > SLOW_GH_THRESHOLD_MS) {
                                disabledRef.current = true;
                                return [2 /*return*/];
                            }
                            if (!cancelled) {
                                timeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var elapsed = Date.now() - lastFetchRef.current;
        if (elapsed >= POLL_INTERVAL_MS) {
            void poll();
        }
        else {
            timeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS - elapsed);
        }
        return function () {
            cancelled = true;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [isLoading, enabled]);
    return prStatus;
}
