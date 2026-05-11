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
exports.selectTipWithLongestTimeSinceShown = selectTipWithLongestTimeSinceShown;
exports.getTipToShowOnSpinner = getTipToShowOnSpinner;
exports.recordShownTip = recordShownTip;
var settings_js_1 = require("../../utils/settings/settings.js");
var index_js_1 = require("../analytics/index.js");
var tipHistory_js_1 = require("./tipHistory.js");
var tipRegistry_js_1 = require("./tipRegistry.js");
function selectTipWithLongestTimeSinceShown(availableTips) {
    var _a;
    if (availableTips.length === 0) {
        return undefined;
    }
    if (availableTips.length === 1) {
        return availableTips[0];
    }
    // Sort tips by sessions since last shown (descending) and take the first one
    // This is the tip that hasn't been shown for the longest time
    var tipsWithSessions = availableTips.map(function (tip) { return ({
        tip: tip,
        sessions: (0, tipHistory_js_1.getSessionsSinceLastShown)(tip.id),
    }); });
    tipsWithSessions.sort(function (a, b) { return b.sessions - a.sessions; });
    return (_a = tipsWithSessions[0]) === null || _a === void 0 ? void 0 : _a.tip;
}
function getTipToShowOnSpinner(context) {
    return __awaiter(this, void 0, void 0, function () {
        var tips;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check if tips are disabled (default to true if not set)
                    if ((0, settings_js_1.getSettings_DEPRECATED)().spinnerTipsEnabled === false) {
                        return [2 /*return*/, undefined];
                    }
                    return [4 /*yield*/, (0, tipRegistry_js_1.getRelevantTips)(context)];
                case 1:
                    tips = _a.sent();
                    if (tips.length === 0) {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, selectTipWithLongestTimeSinceShown(tips)];
            }
        });
    });
}
function recordShownTip(tip) {
    // Record in history
    (0, tipHistory_js_1.recordTipShown)(tip.id);
    // Log event for analytics
    (0, index_js_1.logEvent)('tengu_tip_shown', {
        tipIdLength: tip.id,
        cooldownSessions: tip.cooldownSessions,
    });
}
