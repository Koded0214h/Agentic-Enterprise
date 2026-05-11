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
exports.useAwaySummary = useAwaySummary;
var bun_bundle_1 = require("bun:bundle");
var react_1 = require("react");
var terminal_focus_state_js_1 = require("../ink/terminal-focus-state.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var awaySummary_js_1 = require("../services/awaySummary.js");
var messages_js_1 = require("../utils/messages.js");
var BLUR_DELAY_MS = 5 * 60000;
function hasSummarySinceLastUserTurn(messages) {
    for (var i = messages.length - 1; i >= 0; i--) {
        var m = messages[i];
        if (m.type === 'user' && !m.isMeta && !m.isCompactSummary)
            return false;
        if (m.type === 'system' && m.subtype === 'away_summary')
            return true;
    }
    return false;
}
/**
 * Appends a "while you were away" summary message after the terminal has been
 * blurred for 5 minutes. Fires only when (a) 5min since blur, (b) no turn in
 * progress, and (c) no existing away_summary since the last user message.
 *
 * Focus state 'unknown' (terminal doesn't support DECSET 1004) is a no-op.
 */
function useAwaySummary(messages, setMessages, isLoading) {
    var timerRef = (0, react_1.useRef)(null);
    var abortRef = (0, react_1.useRef)(null);
    var messagesRef = (0, react_1.useRef)(messages);
    var isLoadingRef = (0, react_1.useRef)(isLoading);
    var pendingRef = (0, react_1.useRef)(false);
    var generateRef = (0, react_1.useRef)(null);
    messagesRef.current = messages;
    isLoadingRef.current = isLoading;
    // 3P default: false
    var gbEnabled = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_sedge_lantern', false);
    (0, react_1.useEffect)(function () {
        if (!(0, bun_bundle_1.feature)('AWAY_SUMMARY'))
            return;
        if (!gbEnabled)
            return;
        function clearTimer() {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
        function abortInFlight() {
            var _a;
            (_a = abortRef.current) === null || _a === void 0 ? void 0 : _a.abort();
            abortRef.current = null;
        }
        function generate() {
            return __awaiter(this, void 0, void 0, function () {
                var controller, text;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            pendingRef.current = false;
                            if (hasSummarySinceLastUserTurn(messagesRef.current))
                                return [2 /*return*/];
                            abortInFlight();
                            controller = new AbortController();
                            abortRef.current = controller;
                            return [4 /*yield*/, (0, awaySummary_js_1.generateAwaySummary)(messagesRef.current, controller.signal)];
                        case 1:
                            text = _a.sent();
                            if (controller.signal.aborted || text === null)
                                return [2 /*return*/];
                            setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [(0, messages_js_1.createAwaySummaryMessage)(text)], false); });
                            return [2 /*return*/];
                    }
                });
            });
        }
        function onBlurTimerFire() {
            timerRef.current = null;
            if (isLoadingRef.current) {
                pendingRef.current = true;
                return;
            }
            void generate();
        }
        function onFocusChange() {
            var state = (0, terminal_focus_state_js_1.getTerminalFocusState)();
            if (state === 'blurred') {
                clearTimer();
                timerRef.current = setTimeout(onBlurTimerFire, BLUR_DELAY_MS);
            }
            else if (state === 'focused') {
                clearTimer();
                abortInFlight();
                pendingRef.current = false;
            }
            // 'unknown' → no-op
        }
        var unsubscribe = (0, terminal_focus_state_js_1.subscribeTerminalFocus)(onFocusChange);
        // Handle the case where we're already blurred when the effect mounts
        onFocusChange();
        generateRef.current = generate;
        return function () {
            unsubscribe();
            clearTimer();
            abortInFlight();
            generateRef.current = null;
        };
    }, [gbEnabled, setMessages]);
    // Timer fired mid-turn → fire when turn ends (if still blurred)
    (0, react_1.useEffect)(function () {
        var _a;
        if (isLoading)
            return;
        if (!pendingRef.current)
            return;
        if ((0, terminal_focus_state_js_1.getTerminalFocusState)() !== 'blurred')
            return;
        void ((_a = generateRef.current) === null || _a === void 0 ? void 0 : _a.call(generateRef));
    }, [isLoading]);
}
