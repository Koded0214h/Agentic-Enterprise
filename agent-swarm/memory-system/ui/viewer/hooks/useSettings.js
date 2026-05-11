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
exports.useSettings = useSettings;
var react_1 = require("react");
var settings_1 = require("../constants/settings");
var api_1 = require("../constants/api");
var timing_1 = require("../constants/timing");
function useSettings() {
    var _this = this;
    var _a = (0, react_1.useState)(settings_1.DEFAULT_SETTINGS), settings = _a[0], setSettings = _a[1];
    var _b = (0, react_1.useState)(false), isSaving = _b[0], setIsSaving = _b[1];
    var _c = (0, react_1.useState)(''), saveStatus = _c[0], setSaveStatus = _c[1];
    (0, react_1.useEffect)(function () {
        // Load initial settings
        fetch(api_1.API_ENDPOINTS.SETTINGS)
            .then(function (res) { return res.json(); })
            .then(function (data) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
            // Use ?? (nullish coalescing) instead of || so that falsy values
            // like '0', 'false', and '' from the backend are preserved.
            // Using || would silently replace them with the UI defaults.
            setSettings({
                CLAUDE_MEM_MODEL: (_a = data.CLAUDE_MEM_MODEL) !== null && _a !== void 0 ? _a : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_MODEL,
                CLAUDE_MEM_CONTEXT_OBSERVATIONS: (_b = data.CLAUDE_MEM_CONTEXT_OBSERVATIONS) !== null && _b !== void 0 ? _b : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_OBSERVATIONS,
                CLAUDE_MEM_WORKER_PORT: (_c = data.CLAUDE_MEM_WORKER_PORT) !== null && _c !== void 0 ? _c : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_WORKER_PORT,
                CLAUDE_MEM_WORKER_HOST: (_d = data.CLAUDE_MEM_WORKER_HOST) !== null && _d !== void 0 ? _d : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_WORKER_HOST,
                // AI Provider Configuration
                CLAUDE_MEM_PROVIDER: (_e = data.CLAUDE_MEM_PROVIDER) !== null && _e !== void 0 ? _e : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_PROVIDER,
                CLAUDE_MEM_GEMINI_API_KEY: (_f = data.CLAUDE_MEM_GEMINI_API_KEY) !== null && _f !== void 0 ? _f : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_GEMINI_API_KEY,
                CLAUDE_MEM_GEMINI_MODEL: (_g = data.CLAUDE_MEM_GEMINI_MODEL) !== null && _g !== void 0 ? _g : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_GEMINI_MODEL,
                CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED: (_h = data.CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED) !== null && _h !== void 0 ? _h : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED,
                // OpenRouter Configuration
                CLAUDE_MEM_OPENROUTER_API_KEY: (_j = data.CLAUDE_MEM_OPENROUTER_API_KEY) !== null && _j !== void 0 ? _j : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_OPENROUTER_API_KEY,
                CLAUDE_MEM_OPENROUTER_MODEL: (_k = data.CLAUDE_MEM_OPENROUTER_MODEL) !== null && _k !== void 0 ? _k : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_OPENROUTER_MODEL,
                CLAUDE_MEM_OPENROUTER_SITE_URL: (_l = data.CLAUDE_MEM_OPENROUTER_SITE_URL) !== null && _l !== void 0 ? _l : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_OPENROUTER_SITE_URL,
                CLAUDE_MEM_OPENROUTER_APP_NAME: (_m = data.CLAUDE_MEM_OPENROUTER_APP_NAME) !== null && _m !== void 0 ? _m : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_OPENROUTER_APP_NAME,
                // Token Economics Display
                CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS: (_o = data.CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS) !== null && _o !== void 0 ? _o : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS,
                CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS: (_p = data.CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS) !== null && _p !== void 0 ? _p : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS,
                CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT: (_q = data.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT) !== null && _q !== void 0 ? _q : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT,
                CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT: (_r = data.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT) !== null && _r !== void 0 ? _r : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT,
                // Display Configuration
                CLAUDE_MEM_CONTEXT_FULL_COUNT: (_s = data.CLAUDE_MEM_CONTEXT_FULL_COUNT) !== null && _s !== void 0 ? _s : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_FULL_COUNT,
                CLAUDE_MEM_CONTEXT_FULL_FIELD: (_t = data.CLAUDE_MEM_CONTEXT_FULL_FIELD) !== null && _t !== void 0 ? _t : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_FULL_FIELD,
                CLAUDE_MEM_CONTEXT_SESSION_COUNT: (_u = data.CLAUDE_MEM_CONTEXT_SESSION_COUNT) !== null && _u !== void 0 ? _u : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_SESSION_COUNT,
                // Feature Toggles
                CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY: (_v = data.CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY) !== null && _v !== void 0 ? _v : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY,
                CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE: (_w = data.CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE) !== null && _w !== void 0 ? _w : settings_1.DEFAULT_SETTINGS.CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE,
            });
        })
            .catch(function (error) {
            console.error('Failed to load settings:', error);
        });
    }, []);
    var saveSettings = function (newSettings) { return __awaiter(_this, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSaving(true);
                    setSaveStatus('Saving...');
                    return [4 /*yield*/, fetch(api_1.API_ENDPOINTS.SETTINGS, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newSettings)
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        setSettings(newSettings);
                        setSaveStatus('✓ Saved');
                        setTimeout(function () { return setSaveStatus(''); }, timing_1.TIMING.SAVE_STATUS_DISPLAY_DURATION_MS);
                    }
                    else {
                        setSaveStatus("\u2717 Error: ".concat(result.error));
                    }
                    setIsSaving(false);
                    return [2 /*return*/];
            }
        });
    }); };
    return { settings: settings, saveSettings: saveSettings, isSaving: isSaving, saveStatus: saveStatus };
}
