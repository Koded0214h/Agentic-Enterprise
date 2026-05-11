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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMultipleChoiceState = useMultipleChoiceState;
var react_1 = require("react");
function reducer(state, action) {
    var _a, _b;
    var _c, _d, _e, _f;
    switch (action.type) {
        case 'next-question':
            return __assign(__assign({}, state), { currentQuestionIndex: state.currentQuestionIndex + 1, isInTextInput: false });
        case 'prev-question':
            return __assign(__assign({}, state), { currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1), isInTextInput: false });
        case 'update-question-state': {
            var existing = state.questionStates[action.questionText];
            var newState = {
                selectedValue: (_d = (_c = action.updates.selectedValue) !== null && _c !== void 0 ? _c : existing === null || existing === void 0 ? void 0 : existing.selectedValue) !== null && _d !== void 0 ? _d : (action.isMultiSelect ? [] : undefined),
                textInputValue: (_f = (_e = action.updates.textInputValue) !== null && _e !== void 0 ? _e : existing === null || existing === void 0 ? void 0 : existing.textInputValue) !== null && _f !== void 0 ? _f : '',
            };
            return __assign(__assign({}, state), { questionStates: __assign(__assign({}, state.questionStates), (_a = {}, _a[action.questionText] = newState, _a)) });
        }
        case 'set-answer': {
            var newState = __assign(__assign({}, state), { answers: __assign(__assign({}, state.answers), (_b = {}, _b[action.questionText] = action.answer, _b)) });
            if (action.shouldAdvance) {
                return __assign(__assign({}, newState), { currentQuestionIndex: newState.currentQuestionIndex + 1, isInTextInput: false });
            }
            return newState;
        }
        case 'set-text-input-mode':
            return __assign(__assign({}, state), { isInTextInput: action.isInInput });
    }
}
var INITIAL_STATE = {
    currentQuestionIndex: 0,
    answers: {},
    questionStates: {},
    isInTextInput: false,
};
function useMultipleChoiceState() {
    var _a = (0, react_1.useReducer)(reducer, INITIAL_STATE), state = _a[0], dispatch = _a[1];
    var nextQuestion = (0, react_1.useCallback)(function () {
        dispatch({ type: 'next-question' });
    }, []);
    var prevQuestion = (0, react_1.useCallback)(function () {
        dispatch({ type: 'prev-question' });
    }, []);
    var updateQuestionState = (0, react_1.useCallback)(function (questionText, updates, isMultiSelect) {
        dispatch({
            type: 'update-question-state',
            questionText: questionText,
            updates: updates,
            isMultiSelect: isMultiSelect,
        });
    }, []);
    var setAnswer = (0, react_1.useCallback)(function (questionText, answer, shouldAdvance) {
        if (shouldAdvance === void 0) { shouldAdvance = true; }
        dispatch({
            type: 'set-answer',
            questionText: questionText,
            answer: answer,
            shouldAdvance: shouldAdvance,
        });
    }, []);
    var setTextInputMode = (0, react_1.useCallback)(function (isInInput) {
        dispatch({ type: 'set-text-input-mode', isInInput: isInInput });
    }, []);
    return {
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        questionStates: state.questionStates,
        isInTextInput: state.isInTextInput,
        nextQuestion: nextQuestion,
        prevQuestion: prevQuestion,
        updateQuestionState: updateQuestionState,
        setAnswer: setAnswer,
        setTextInputMode: setTextInputMode,
    };
}
