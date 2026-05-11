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
exports.useClipboardImageHint = useClipboardImageHint;
var react_1 = require("react");
var notifications_js_1 = require("../context/notifications.js");
var shortcutFormat_js_1 = require("../keybindings/shortcutFormat.js");
var imagePaste_js_1 = require("../utils/imagePaste.js");
var NOTIFICATION_KEY = 'clipboard-image-hint';
// Small debounce to batch rapid focus changes
var FOCUS_CHECK_DEBOUNCE_MS = 1000;
// Don't show the hint more than once per this interval
var HINT_COOLDOWN_MS = 30000;
/**
 * Hook that shows a notification when the terminal regains focus
 * and the clipboard contains an image.
 *
 * @param isFocused - Whether the terminal is currently focused
 * @param enabled - Whether image paste is enabled (onImagePaste is defined)
 */
function useClipboardImageHint(isFocused, enabled) {
    var _this = this;
    var addNotification = (0, notifications_js_1.useNotifications)().addNotification;
    var lastFocusedRef = (0, react_1.useRef)(isFocused);
    var lastHintTimeRef = (0, react_1.useRef)(0);
    var checkTimeoutRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Only trigger on focus regain (was unfocused, now focused)
        var wasFocused = lastFocusedRef.current;
        lastFocusedRef.current = isFocused;
        if (!enabled || !isFocused || wasFocused) {
            return;
        }
        // Clear any pending check
        if (checkTimeoutRef.current) {
            clearTimeout(checkTimeoutRef.current);
        }
        // Small debounce to batch rapid focus changes
        checkTimeoutRef.current = setTimeout(function (checkTimeoutRef, lastHintTimeRef, addNotification) { return __awaiter(_this, void 0, void 0, function () {
            var now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkTimeoutRef.current = null;
                        now = Date.now();
                        if (now - lastHintTimeRef.current < HINT_COOLDOWN_MS) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, imagePaste_js_1.hasImageInClipboard)()];
                    case 1:
                        // Check if clipboard has an image (async osascript call)
                        if (_a.sent()) {
                            lastHintTimeRef.current = now;
                            addNotification({
                                key: NOTIFICATION_KEY,
                                text: "Image in clipboard \u00B7 ".concat((0, shortcutFormat_js_1.getShortcutDisplay)('chat:imagePaste', 'Chat', 'ctrl+v'), " to paste"),
                                priority: 'immediate',
                                timeoutMs: 8000,
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); }, FOCUS_CHECK_DEBOUNCE_MS, checkTimeoutRef, lastHintTimeRef, addNotification);
        return function () {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
                checkTimeoutRef.current = null;
            }
        };
    }, [isFocused, enabled, addNotification]);
}
