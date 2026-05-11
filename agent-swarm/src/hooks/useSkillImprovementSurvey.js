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
exports.useSkillImprovementSurvey = useSkillImprovementSurvey;
var react_1 = require("react");
var index_js_1 = require("../services/analytics/index.js");
var AppState_js_1 = require("../state/AppState.js");
var skillImprovement_js_1 = require("../utils/hooks/skillImprovement.js");
var messages_js_1 = require("../utils/messages.js");
function useSkillImprovementSurvey(setMessages) {
    var _a;
    var suggestion = (0, AppState_js_1.useAppState)(function (s) { return s.skillImprovement.suggestion; });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var _b = (0, react_1.useState)(false), isOpen = _b[0], setIsOpen = _b[1];
    var lastSuggestionRef = (0, react_1.useRef)(suggestion);
    var loggedAppearanceRef = (0, react_1.useRef)(false);
    // Track the suggestion for display even after clearing AppState
    if (suggestion) {
        lastSuggestionRef.current = suggestion;
    }
    // Open when a new suggestion arrives
    if (suggestion && !isOpen) {
        setIsOpen(true);
        if (!loggedAppearanceRef.current) {
            loggedAppearanceRef.current = true;
            (0, index_js_1.logEvent)('tengu_skill_improvement_survey', {
                event_type: 'appeared',
                // _PROTO_skill_name routes to the privileged skill_name BQ column.
                // Unredacted names don't go in additional_metadata.
                _PROTO_skill_name: ((_a = suggestion.skillName) !== null && _a !== void 0 ? _a : 'unknown'),
            });
        }
    }
    var handleSelect = (0, react_1.useCallback)(function (selected) {
        var current = lastSuggestionRef.current;
        if (!current)
            return;
        var applied = selected !== 'dismissed';
        (0, index_js_1.logEvent)('tengu_skill_improvement_survey', {
            event_type: 'responded',
            response: (applied
                ? 'applied'
                : 'dismissed'),
            // _PROTO_skill_name routes to the privileged skill_name BQ column.
            // Unredacted names don't go in additional_metadata.
            _PROTO_skill_name: current.skillName,
        });
        if (applied) {
            void (0, skillImprovement_js_1.applySkillImprovement)(current.skillName, current.updates).then(function () {
                setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [
                    (0, messages_js_1.createSystemMessage)("Skill \"".concat(current.skillName, "\" updated with improvements."), 'suggestion'),
                ], false); });
            });
        }
        // Close and clear
        setIsOpen(false);
        loggedAppearanceRef.current = false;
        setAppState(function (prev) {
            if (!prev.skillImprovement.suggestion)
                return prev;
            return __assign(__assign({}, prev), { skillImprovement: { suggestion: null } });
        });
    }, [setAppState, setMessages]);
    return {
        isOpen: isOpen,
        suggestion: lastSuggestionRef.current,
        handleSelect: handleSelect,
    };
}
