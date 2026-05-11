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
exports.useAssistantHistory = useAssistantHistory;
var crypto_1 = require("crypto");
var react_1 = require("react");
var sessionHistory_js_1 = require("../assistant/sessionHistory.js");
var sdkMessageAdapter_js_1 = require("../remote/sdkMessageAdapter.js");
var debug_js_1 = require("../utils/debug.js");
/** Fire loadOlder when scrolled within this many rows of the top. */
var PREFETCH_THRESHOLD_ROWS = 40;
/** Max chained page loads to fill the viewport on mount. Bounds the loop if
 *  events convert to zero visible messages (everything filtered). */
var MAX_FILL_PAGES = 10;
var SENTINEL_LOADING = 'loading older messages…';
var SENTINEL_LOADING_FAILED = 'failed to load older messages — scroll up to retry';
var SENTINEL_START = 'start of session';
/** Convert a HistoryPage to REPL Message[] using the same opts as viewer mode. */
function pageToMessages(page) {
    var out = [];
    for (var _i = 0, _a = page.events; _i < _a.length; _i++) {
        var ev = _a[_i];
        var c = (0, sdkMessageAdapter_js_1.convertSDKMessage)(ev, {
            convertUserTextMessages: true,
            convertToolResults: true,
        });
        if (c.type === 'message')
            out.push(c.message);
    }
    return out;
}
/**
 * Lazy-load `claude assistant` history on scroll-up.
 *
 * On mount: fetch newest page via anchor_to_latest, prepend to messages.
 * On scroll-up near top: fetch next-older page via before_id, prepend with
 * scroll anchoring (viewport stays put).
 *
 * No-op unless config.viewerOnly. REPL only calls this hook inside a
 * feature('KAIROS') gate, so build-time elimination is handled there.
 */
function useAssistantHistory(_a) {
    var _this = this;
    var config = _a.config, setMessages = _a.setMessages, scrollRef = _a.scrollRef, onPrepend = _a.onPrepend;
    var enabled = (config === null || config === void 0 ? void 0 : config.viewerOnly) === true;
    // Cursor state: ref-only (no re-render on cursor change). `null` = no
    // older pages. `undefined` = initial page not fetched yet.
    var cursorRef = (0, react_1.useRef)(undefined);
    var ctxRef = (0, react_1.useRef)(null);
    var inflightRef = (0, react_1.useRef)(false);
    // Scroll-anchor: snapshot height + prepended count before setMessages;
    // compensate in useLayoutEffect after React commits. getFreshScrollHeight
    // reads Yoga directly so the value is correct post-commit.
    var anchorRef = (0, react_1.useRef)(null);
    // Fill-viewport chaining: after the initial page commits, if content doesn't
    // fill the viewport yet, load another page. Self-chains via the layout effect
    // until filled or the budget runs out. Budget set once on initial load; user
    // scroll-ups don't need it (maybeLoadOlder re-fires on next wheel event).
    var fillBudgetRef = (0, react_1.useRef)(0);
    // Stable sentinel UUID — reused across swaps so virtual-scroll treats it
    // as one item (text-only mutation, not remove+insert).
    var sentinelUuidRef = (0, react_1.useRef)((0, crypto_1.randomUUID)());
    function mkSentinel(text) {
        return {
            type: 'system',
            subtype: 'informational',
            content: text,
            isMeta: false,
            timestamp: new Date().toISOString(),
            uuid: sentinelUuidRef.current,
            level: 'info',
        };
    }
    /** Prepend a page at the front, with scroll-anchor snapshot for non-initial.
     *  Replaces the sentinel (always at index 0 when present) in-place. */
    var prepend = (0, react_1.useCallback)(function (page, isInitial) {
        var msgs = pageToMessages(page);
        cursorRef.current = page.hasMore ? page.firstId : null;
        if (!isInitial) {
            var s = scrollRef.current;
            anchorRef.current = s
                ? { beforeHeight: s.getFreshScrollHeight(), count: msgs.length }
                : null;
        }
        var sentinel = page.hasMore ? null : mkSentinel(SENTINEL_START);
        setMessages(function (prev) {
            var _a;
            // Drop existing sentinel (index 0, known stable UUID — O(1)).
            var base = ((_a = prev[0]) === null || _a === void 0 ? void 0 : _a.uuid) === sentinelUuidRef.current ? prev.slice(1) : prev;
            return sentinel ? __spreadArray(__spreadArray([sentinel], msgs, true), base, true) : __spreadArray(__spreadArray([], msgs, true), base, true);
        });
        (0, debug_js_1.logForDebugging)("[useAssistantHistory] ".concat(isInitial ? 'initial' : 'older', " page: ").concat(msgs.length, " msgs (raw ").concat(page.events.length, "), hasMore=").concat(page.hasMore));
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scrollRef is a stable ref; mkSentinel reads refs only
    [setMessages]);
    // Initial fetch on mount — best-effort.
    (0, react_1.useEffect)(function () {
        if (!enabled || !config)
            return;
        var cancelled = false;
        void (function () { return __awaiter(_this, void 0, void 0, function () {
            var ctx, page;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sessionHistory_js_1.createHistoryAuthCtx)(config.sessionId).catch(function () { return null; })];
                    case 1:
                        ctx = _a.sent();
                        if (!ctx || cancelled)
                            return [2 /*return*/];
                        ctxRef.current = ctx;
                        return [4 /*yield*/, (0, sessionHistory_js_1.fetchLatestEvents)(ctx)];
                    case 2:
                        page = _a.sent();
                        if (cancelled || !page)
                            return [2 /*return*/];
                        fillBudgetRef.current = MAX_FILL_PAGES;
                        prepend(page, true);
                        return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            cancelled = true;
        };
        // config identity is stable (created once in main.tsx, never recreated)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);
    var loadOlder = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var cursor, ctx, page;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!enabled || inflightRef.current)
                        return [2 /*return*/];
                    cursor = cursorRef.current;
                    ctx = ctxRef.current;
                    if (!cursor || !ctx)
                        return [2 /*return*/]; // null=exhausted, undefined=initial pending
                    inflightRef.current = true;
                    // Swap sentinel to "loading…" — O(1) slice since sentinel is at index 0.
                    setMessages(function (prev) {
                        var _a;
                        var base = ((_a = prev[0]) === null || _a === void 0 ? void 0 : _a.uuid) === sentinelUuidRef.current ? prev.slice(1) : prev;
                        return __spreadArray([mkSentinel(SENTINEL_LOADING)], base, true);
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, (0, sessionHistory_js_1.fetchOlderEvents)(ctx, cursor)];
                case 2:
                    page = _a.sent();
                    if (!page) {
                        // Fetch failed — revert sentinel back to "start" placeholder so the user
                        // can retry on next scroll-up. Cursor is preserved (not nulled out).
                        setMessages(function (prev) {
                            var _a;
                            var base = ((_a = prev[0]) === null || _a === void 0 ? void 0 : _a.uuid) === sentinelUuidRef.current ? prev.slice(1) : prev;
                            return __spreadArray([mkSentinel(SENTINEL_LOADING_FAILED)], base, true);
                        });
                        return [2 /*return*/];
                    }
                    prepend(page, false);
                    return [3 /*break*/, 4];
                case 3:
                    inflightRef.current = false;
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [enabled, prepend, setMessages]);
    // Scroll-anchor compensation — after React commits the prepended items,
    // shift scrollTop by the height delta so the viewport stays put. Also
    // fire onPrepend here (not in prepend()) so dividerIndex + baseline ref
    // are shifted with the ACTUAL height delta, not an estimate.
    // No deps: runs every render; cheap no-op when anchorRef is null.
    (0, react_1.useLayoutEffect)(function () {
        var anchor = anchorRef.current;
        if (anchor === null)
            return;
        anchorRef.current = null;
        var s = scrollRef.current;
        if (!s || s.isSticky())
            return; // sticky = pinned bottom; prepend is invisible
        var delta = s.getFreshScrollHeight() - anchor.beforeHeight;
        if (delta > 0)
            s.scrollBy(delta);
        onPrepend === null || onPrepend === void 0 ? void 0 : onPrepend(anchor.count, delta);
    });
    // Fill-viewport chain: after paint, if content doesn't exceed the viewport,
    // load another page. Runs as useEffect (not layout effect) so Ink has
    // painted and scrollViewportHeight is populated. Self-chains via next
    // render's effect; budget caps the chain.
    //
    // The ScrollBox content wrapper has flexGrow:1 flexShrink:0 — it's clamped
    // to ≥ viewport. So `content < viewport` is never true; `<=` detects "no
    // overflow yet" correctly. Stops once there's at least something to scroll.
    (0, react_1.useEffect)(function () {
        if (fillBudgetRef.current <= 0 ||
            !cursorRef.current ||
            inflightRef.current) {
            return;
        }
        var s = scrollRef.current;
        if (!s)
            return;
        var contentH = s.getFreshScrollHeight();
        var viewH = s.getViewportHeight();
        (0, debug_js_1.logForDebugging)("[useAssistantHistory] fill-check: content=".concat(contentH, " viewport=").concat(viewH, " budget=").concat(fillBudgetRef.current));
        if (contentH <= viewH) {
            fillBudgetRef.current--;
            void loadOlder();
        }
        else {
            fillBudgetRef.current = 0;
        }
    });
    // Trigger wrapper for onScroll composition in REPL.
    var maybeLoadOlder = (0, react_1.useCallback)(function (handle) {
        if (handle.getScrollTop() < PREFETCH_THRESHOLD_ROWS)
            void loadOlder();
    }, [loadOlder]);
    return { maybeLoadOlder: maybeLoadOlder };
}
