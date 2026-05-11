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
exports.wrapText = exports.supportsTabStatus = exports.measureElement = exports.useTerminalViewport = exports.useTerminalTitle = exports.useTerminalFocus = exports.useTabStatus = exports.useStdin = exports.useSelection = exports.useInterval = exports.useAnimationTimer = exports.useInput = exports.useApp = exports.useAnimationFrame = exports.FocusManager = exports.TerminalFocusEvent = exports.InputEvent = exports.Event = exports.EventEmitter = exports.ClickEvent = exports.BaseText = exports.Spacer = exports.RawAnsi = exports.NoSelect = exports.Newline = exports.Link = exports.Button = exports.BaseBox = exports.Ansi = exports.useThemeSetting = exports.useTheme = exports.usePreviewTheme = exports.ThemeProvider = exports.Text = exports.Box = exports.color = void 0;
exports.render = render;
exports.createRoot = createRoot;
var react_1 = require("react");
var ThemeProvider_js_1 = require("./components/design-system/ThemeProvider.js");
var root_js_1 = require("./ink/root.js");
// Wrap all CC render calls with ThemeProvider so ThemedBox/ThemedText work
// without every call site having to mount it. Ink itself is theme-agnostic.
function withTheme(node) {
    return (0, react_1.createElement)(ThemeProvider_js_1.ThemeProvider, null, node);
}
function render(node, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, root_js_1.default)(withTheme(node), options)];
        });
    });
}
function createRoot(options) {
    return __awaiter(this, void 0, void 0, function () {
        var root;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, root_js_1.createRoot)(options)];
                case 1:
                    root = _a.sent();
                    return [2 /*return*/, __assign(__assign({}, root), { render: function (node) { return root.render(withTheme(node)); } })];
            }
        });
    });
}
var color_js_1 = require("./components/design-system/color.js");
Object.defineProperty(exports, "color", { enumerable: true, get: function () { return color_js_1.color; } });
var ThemedBox_js_1 = require("./components/design-system/ThemedBox.js");
Object.defineProperty(exports, "Box", { enumerable: true, get: function () { return ThemedBox_js_1.default; } });
var ThemedText_js_1 = require("./components/design-system/ThemedText.js");
Object.defineProperty(exports, "Text", { enumerable: true, get: function () { return ThemedText_js_1.default; } });
var ThemeProvider_js_2 = require("./components/design-system/ThemeProvider.js");
Object.defineProperty(exports, "ThemeProvider", { enumerable: true, get: function () { return ThemeProvider_js_2.ThemeProvider; } });
Object.defineProperty(exports, "usePreviewTheme", { enumerable: true, get: function () { return ThemeProvider_js_2.usePreviewTheme; } });
Object.defineProperty(exports, "useTheme", { enumerable: true, get: function () { return ThemeProvider_js_2.useTheme; } });
Object.defineProperty(exports, "useThemeSetting", { enumerable: true, get: function () { return ThemeProvider_js_2.useThemeSetting; } });
var Ansi_js_1 = require("./ink/Ansi.js");
Object.defineProperty(exports, "Ansi", { enumerable: true, get: function () { return Ansi_js_1.Ansi; } });
var Box_js_1 = require("./ink/components/Box.js");
Object.defineProperty(exports, "BaseBox", { enumerable: true, get: function () { return Box_js_1.default; } });
var Button_js_1 = require("./ink/components/Button.js");
Object.defineProperty(exports, "Button", { enumerable: true, get: function () { return Button_js_1.default; } });
var Link_js_1 = require("./ink/components/Link.js");
Object.defineProperty(exports, "Link", { enumerable: true, get: function () { return Link_js_1.default; } });
var Newline_js_1 = require("./ink/components/Newline.js");
Object.defineProperty(exports, "Newline", { enumerable: true, get: function () { return Newline_js_1.default; } });
var NoSelect_js_1 = require("./ink/components/NoSelect.js");
Object.defineProperty(exports, "NoSelect", { enumerable: true, get: function () { return NoSelect_js_1.NoSelect; } });
var RawAnsi_js_1 = require("./ink/components/RawAnsi.js");
Object.defineProperty(exports, "RawAnsi", { enumerable: true, get: function () { return RawAnsi_js_1.RawAnsi; } });
var Spacer_js_1 = require("./ink/components/Spacer.js");
Object.defineProperty(exports, "Spacer", { enumerable: true, get: function () { return Spacer_js_1.default; } });
var Text_js_1 = require("./ink/components/Text.js");
Object.defineProperty(exports, "BaseText", { enumerable: true, get: function () { return Text_js_1.default; } });
var click_event_js_1 = require("./ink/events/click-event.js");
Object.defineProperty(exports, "ClickEvent", { enumerable: true, get: function () { return click_event_js_1.ClickEvent; } });
var emitter_js_1 = require("./ink/events/emitter.js");
Object.defineProperty(exports, "EventEmitter", { enumerable: true, get: function () { return emitter_js_1.EventEmitter; } });
var event_js_1 = require("./ink/events/event.js");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return event_js_1.Event; } });
var input_event_js_1 = require("./ink/events/input-event.js");
Object.defineProperty(exports, "InputEvent", { enumerable: true, get: function () { return input_event_js_1.InputEvent; } });
var terminal_focus_event_js_1 = require("./ink/events/terminal-focus-event.js");
Object.defineProperty(exports, "TerminalFocusEvent", { enumerable: true, get: function () { return terminal_focus_event_js_1.TerminalFocusEvent; } });
var focus_js_1 = require("./ink/focus.js");
Object.defineProperty(exports, "FocusManager", { enumerable: true, get: function () { return focus_js_1.FocusManager; } });
var use_animation_frame_js_1 = require("./ink/hooks/use-animation-frame.js");
Object.defineProperty(exports, "useAnimationFrame", { enumerable: true, get: function () { return use_animation_frame_js_1.useAnimationFrame; } });
var use_app_js_1 = require("./ink/hooks/use-app.js");
Object.defineProperty(exports, "useApp", { enumerable: true, get: function () { return use_app_js_1.default; } });
var use_input_js_1 = require("./ink/hooks/use-input.js");
Object.defineProperty(exports, "useInput", { enumerable: true, get: function () { return use_input_js_1.default; } });
var use_interval_js_1 = require("./ink/hooks/use-interval.js");
Object.defineProperty(exports, "useAnimationTimer", { enumerable: true, get: function () { return use_interval_js_1.useAnimationTimer; } });
Object.defineProperty(exports, "useInterval", { enumerable: true, get: function () { return use_interval_js_1.useInterval; } });
var use_selection_js_1 = require("./ink/hooks/use-selection.js");
Object.defineProperty(exports, "useSelection", { enumerable: true, get: function () { return use_selection_js_1.useSelection; } });
var use_stdin_js_1 = require("./ink/hooks/use-stdin.js");
Object.defineProperty(exports, "useStdin", { enumerable: true, get: function () { return use_stdin_js_1.default; } });
var use_tab_status_js_1 = require("./ink/hooks/use-tab-status.js");
Object.defineProperty(exports, "useTabStatus", { enumerable: true, get: function () { return use_tab_status_js_1.useTabStatus; } });
var use_terminal_focus_js_1 = require("./ink/hooks/use-terminal-focus.js");
Object.defineProperty(exports, "useTerminalFocus", { enumerable: true, get: function () { return use_terminal_focus_js_1.useTerminalFocus; } });
var use_terminal_title_js_1 = require("./ink/hooks/use-terminal-title.js");
Object.defineProperty(exports, "useTerminalTitle", { enumerable: true, get: function () { return use_terminal_title_js_1.useTerminalTitle; } });
var use_terminal_viewport_js_1 = require("./ink/hooks/use-terminal-viewport.js");
Object.defineProperty(exports, "useTerminalViewport", { enumerable: true, get: function () { return use_terminal_viewport_js_1.useTerminalViewport; } });
var measure_element_js_1 = require("./ink/measure-element.js");
Object.defineProperty(exports, "measureElement", { enumerable: true, get: function () { return measure_element_js_1.default; } });
var osc_js_1 = require("./ink/termio/osc.js");
Object.defineProperty(exports, "supportsTabStatus", { enumerable: true, get: function () { return osc_js_1.supportsTabStatus; } });
var wrap_text_js_1 = require("./ink/wrap-text.js");
Object.defineProperty(exports, "wrapText", { enumerable: true, get: function () { return wrap_text_js_1.default; } });
