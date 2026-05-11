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
exports.useHistorySearch = useHistorySearch;
var bun_bundle_1 = require("bun:bundle");
var react_1 = require("react");
var inputModes_js_1 = require("../components/PromptInput/inputModes.js");
var history_js_1 = require("../history.js");
var keyboard_event_js_1 = require("../ink/events/keyboard-event.js");
// eslint-disable-next-line custom-rules/prefer-use-keybindings -- backward-compat bridge until consumers wire handleKeyDown to <Box onKeyDown>
var ink_js_1 = require("../ink.js");
var useKeybinding_js_1 = require("../keybindings/useKeybinding.js");
function useHistorySearch(onAcceptHistory, currentInput, onInputChange, onCursorChange, currentCursorOffset, onModeChange, currentMode, isSearching, setIsSearching, setPastedContents, currentPastedContents) {
    var _this = this;
    var _a = (0, react_1.useState)(''), historyQuery = _a[0], setHistoryQuery = _a[1];
    var _b = (0, react_1.useState)(false), historyFailedMatch = _b[0], setHistoryFailedMatch = _b[1];
    var _c = (0, react_1.useState)(''), originalInput = _c[0], setOriginalInput = _c[1];
    var _d = (0, react_1.useState)(0), originalCursorOffset = _d[0], setOriginalCursorOffset = _d[1];
    var _e = (0, react_1.useState)('prompt'), originalMode = _e[0], setOriginalMode = _e[1];
    var _f = (0, react_1.useState)({}), originalPastedContents = _f[0], setOriginalPastedContents = _f[1];
    var _g = (0, react_1.useState)(undefined), historyMatch = _g[0], setHistoryMatch = _g[1];
    var historyReader = (0, react_1.useRef)(undefined);
    var seenPrompts = (0, react_1.useRef)(new Set());
    var searchAbortController = (0, react_1.useRef)(null);
    var closeHistoryReader = (0, react_1.useCallback)(function () {
        if (historyReader.current) {
            // Must explicitly call .return() to trigger the finally block in readLinesReverse,
            // which closes the file handle. Without this, file descriptors leak.
            void historyReader.current.return(undefined);
            historyReader.current = undefined;
        }
    }, []);
    var reset = (0, react_1.useCallback)(function () {
        setIsSearching(false);
        setHistoryQuery('');
        setHistoryFailedMatch(false);
        setOriginalInput('');
        setOriginalCursorOffset(0);
        setOriginalMode('prompt');
        setOriginalPastedContents({});
        setHistoryMatch(undefined);
        closeHistoryReader();
        seenPrompts.current.clear();
    }, [setIsSearching, closeHistoryReader]);
    var searchHistory = (0, react_1.useCallback)(function (resume, signal) { return __awaiter(_this, void 0, void 0, function () {
        var item, display, matchPosition, mode, value, cleanMatchPosition;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isSearching) {
                        return [2 /*return*/];
                    }
                    if (historyQuery.length === 0) {
                        closeHistoryReader();
                        seenPrompts.current.clear();
                        setHistoryMatch(undefined);
                        setHistoryFailedMatch(false);
                        onInputChange(originalInput);
                        onCursorChange(originalCursorOffset);
                        onModeChange(originalMode);
                        setPastedContents(originalPastedContents);
                        return [2 /*return*/];
                    }
                    if (!resume) {
                        closeHistoryReader();
                        historyReader.current = (0, history_js_1.makeHistoryReader)();
                        seenPrompts.current.clear();
                    }
                    if (!historyReader.current) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, historyReader.current.next()];
                case 2:
                    item = _a.sent();
                    if (item.done) {
                        // No match found - keep last match but mark as failed
                        setHistoryFailedMatch(true);
                        return [2 /*return*/];
                    }
                    display = item.value.display;
                    matchPosition = display.lastIndexOf(historyQuery);
                    if (matchPosition !== -1 && !seenPrompts.current.has(display)) {
                        seenPrompts.current.add(display);
                        setHistoryMatch(item.value);
                        setHistoryFailedMatch(false);
                        mode = (0, inputModes_js_1.getModeFromInput)(display);
                        onModeChange(mode);
                        onInputChange(display);
                        setPastedContents(item.value.pastedContents);
                        value = (0, inputModes_js_1.getValueFromInput)(display);
                        cleanMatchPosition = value.lastIndexOf(historyQuery);
                        onCursorChange(cleanMatchPosition !== -1 ? cleanMatchPosition : matchPosition);
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [
        isSearching,
        historyQuery,
        closeHistoryReader,
        onInputChange,
        onCursorChange,
        onModeChange,
        setPastedContents,
        originalInput,
        originalCursorOffset,
        originalMode,
        originalPastedContents,
    ]);
    // Handler: Start history search (when not searching)
    var handleStartSearch = (0, react_1.useCallback)(function () {
        setIsSearching(true);
        setOriginalInput(currentInput);
        setOriginalCursorOffset(currentCursorOffset);
        setOriginalMode(currentMode);
        setOriginalPastedContents(currentPastedContents);
        historyReader.current = (0, history_js_1.makeHistoryReader)();
        seenPrompts.current.clear();
    }, [
        setIsSearching,
        currentInput,
        currentCursorOffset,
        currentMode,
        currentPastedContents,
    ]);
    // Handler: Find next match (when searching)
    var handleNextMatch = (0, react_1.useCallback)(function () {
        void searchHistory(true);
    }, [searchHistory]);
    // Handler: Accept current match and exit search
    var handleAccept = (0, react_1.useCallback)(function () {
        if (historyMatch) {
            var mode = (0, inputModes_js_1.getModeFromInput)(historyMatch.display);
            var value = (0, inputModes_js_1.getValueFromInput)(historyMatch.display);
            onInputChange(value);
            onModeChange(mode);
            setPastedContents(historyMatch.pastedContents);
        }
        else {
            // No match - restore original pasted contents
            setPastedContents(originalPastedContents);
        }
        reset();
    }, [
        historyMatch,
        onInputChange,
        onModeChange,
        setPastedContents,
        originalPastedContents,
        reset,
    ]);
    // Handler: Cancel search and restore original input
    var handleCancel = (0, react_1.useCallback)(function () {
        onInputChange(originalInput);
        onCursorChange(originalCursorOffset);
        setPastedContents(originalPastedContents);
        reset();
    }, [
        onInputChange,
        onCursorChange,
        setPastedContents,
        originalInput,
        originalCursorOffset,
        originalPastedContents,
        reset,
    ]);
    // Handler: Execute (accept and submit)
    var handleExecute = (0, react_1.useCallback)(function () {
        if (historyQuery.length === 0) {
            onAcceptHistory({
                display: originalInput,
                pastedContents: originalPastedContents,
            });
        }
        else if (historyMatch) {
            var mode = (0, inputModes_js_1.getModeFromInput)(historyMatch.display);
            var value = (0, inputModes_js_1.getValueFromInput)(historyMatch.display);
            onModeChange(mode);
            onAcceptHistory({
                display: value,
                pastedContents: historyMatch.pastedContents,
            });
        }
        reset();
    }, [
        historyQuery,
        historyMatch,
        onAcceptHistory,
        onModeChange,
        originalInput,
        originalPastedContents,
        reset,
    ]);
    // Gated off under HISTORY_PICKER — the modal dialog owns ctrl+r there.
    (0, useKeybinding_js_1.useKeybinding)('history:search', handleStartSearch, {
        context: 'Global',
        isActive: (0, bun_bundle_1.feature)('HISTORY_PICKER') ? false : !isSearching,
    });
    // History search context keybindings (only active when searching)
    var historySearchHandlers = (0, react_1.useMemo)(function () { return ({
        'historySearch:next': handleNextMatch,
        'historySearch:accept': handleAccept,
        'historySearch:cancel': handleCancel,
        'historySearch:execute': handleExecute,
    }); }, [handleNextMatch, handleAccept, handleCancel, handleExecute]);
    (0, useKeybinding_js_1.useKeybindings)(historySearchHandlers, {
        context: 'HistorySearch',
        isActive: isSearching,
    });
    // Handle backspace when query is empty (cancels search)
    // This is a conditional behavior that doesn't fit the keybinding model
    // well (backspace only cancels when query is empty)
    var handleKeyDown = function (e) {
        if (!isSearching)
            return;
        if (e.key === 'backspace' && historyQuery === '') {
            e.preventDefault();
            handleCancel();
        }
    };
    // Backward-compat bridge: PromptInput doesn't yet wire handleKeyDown to
    // <Box onKeyDown>. Subscribe via useInput and adapt InputEvent →
    // KeyboardEvent until the consumer is migrated (separate PR).
    // TODO(onKeyDown-migration): remove once PromptInput passes handleKeyDown.
    (0, ink_js_1.useInput)(function (_input, _key, event) {
        handleKeyDown(new keyboard_event_js_1.KeyboardEvent(event.keypress));
    }, { isActive: isSearching });
    // Keep a ref to searchHistory to avoid it being a dependency of useEffect
    var searchHistoryRef = (0, react_1.useRef)(searchHistory);
    searchHistoryRef.current = searchHistory;
    // Reset history search when query changes
    (0, react_1.useEffect)(function () {
        var _a;
        (_a = searchAbortController.current) === null || _a === void 0 ? void 0 : _a.abort();
        var controller = new AbortController();
        searchAbortController.current = controller;
        void searchHistoryRef.current(false, controller.signal);
        return function () {
            controller.abort();
        };
    }, [historyQuery]);
    return {
        historyQuery: historyQuery,
        setHistoryQuery: setHistoryQuery,
        historyMatch: historyMatch,
        historyFailedMatch: historyFailedMatch,
        handleKeyDown: handleKeyDown,
    };
}
