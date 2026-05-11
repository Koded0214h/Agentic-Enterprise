"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebouncedDigitInput = useDebouncedDigitInput;
var react_1 = require("react");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
// Delay before accepting a digit as a response, to prevent accidental
// submissions when users start messages with numbers (e.g., numbered lists).
// Short enough to feel instant for intentional presses, long enough to
// cancel when the user types more characters.
var DEFAULT_DEBOUNCE_MS = 400;
/**
 * Detects when the user types a single valid digit into the prompt input,
 * debounces to avoid accidental submissions (e.g., "1. First item"),
 * trims the digit from the input, and fires a callback.
 *
 * Used by survey components that accept numeric responses typed directly
 * into the main prompt input.
 */
function useDebouncedDigitInput(_a) {
    var inputValue = _a.inputValue, setInputValue = _a.setInputValue, isValidDigit = _a.isValidDigit, onDigit = _a.onDigit, _b = _a.enabled, enabled = _b === void 0 ? true : _b, _c = _a.once, once = _c === void 0 ? false : _c, _d = _a.debounceMs, debounceMs = _d === void 0 ? DEFAULT_DEBOUNCE_MS : _d;
    var initialInputValue = (0, react_1.useRef)(inputValue);
    var hasTriggeredRef = (0, react_1.useRef)(false);
    var debounceRef = (0, react_1.useRef)(null);
    // Latest-ref pattern so callers can pass inline callbacks without causing
    // the effect to re-run (which would reset the debounce timer every render).
    var callbacksRef = (0, react_1.useRef)({ setInputValue: setInputValue, isValidDigit: isValidDigit, onDigit: onDigit });
    callbacksRef.current = { setInputValue: setInputValue, isValidDigit: isValidDigit, onDigit: onDigit };
    (0, react_1.useEffect)(function () {
        if (!enabled || (once && hasTriggeredRef.current)) {
            return;
        }
        if (debounceRef.current !== null) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        if (inputValue !== initialInputValue.current) {
            var lastChar = (0, stringUtils_js_1.normalizeFullWidthDigits)(inputValue.slice(-1));
            if (callbacksRef.current.isValidDigit(lastChar)) {
                var trimmed = inputValue.slice(0, -1);
                debounceRef.current = setTimeout(function (debounceRef, hasTriggeredRef, callbacksRef, trimmed, lastChar) {
                    debounceRef.current = null;
                    hasTriggeredRef.current = true;
                    callbacksRef.current.setInputValue(trimmed);
                    callbacksRef.current.onDigit(lastChar);
                }, debounceMs, debounceRef, hasTriggeredRef, callbacksRef, trimmed, lastChar);
            }
        }
        return function () {
            if (debounceRef.current !== null) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [inputValue, enabled, once, debounceMs]);
}
