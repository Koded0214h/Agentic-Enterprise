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
exports.QuestionView = QuestionView;
var compiler_runtime_1 = require("react/compiler-runtime");
var figures_1 = require("figures");
var react_1 = require("react");
var ink_js_1 = require("../../../ink.js");
var AppState_js_1 = require("../../../state/AppState.js");
var editor_js_1 = require("../../../utils/editor.js");
var ide_js_1 = require("../../../utils/ide.js");
var promptEditor_js_1 = require("../../../utils/promptEditor.js");
var index_js_1 = require("../../CustomSelect/index.js");
var Divider_js_1 = require("../../design-system/Divider.js");
var FilePathLink_js_1 = require("../../FilePathLink.js");
var PermissionRequestTitle_js_1 = require("../PermissionRequestTitle.js");
var PreviewQuestionView_js_1 = require("./PreviewQuestionView.js");
var QuestionNavigationBar_js_1 = require("./QuestionNavigationBar.js");
function QuestionView(t0) {
    var _this = this;
    var _a, _b, _d;
    var $ = (0, compiler_runtime_1.c)(114);
    var question = t0.question, questions = t0.questions, currentQuestionIndex = t0.currentQuestionIndex, answers = t0.answers, questionStates = t0.questionStates, t1 = t0.hideSubmitTab, planFilePath = t0.planFilePath, minContentHeight = t0.minContentHeight, minContentWidth = t0.minContentWidth, onUpdateQuestionState = t0.onUpdateQuestionState, onAnswer = t0.onAnswer, onTextInputFocus = t0.onTextInputFocus, onCancel = t0.onCancel, onSubmit = t0.onSubmit, onTabPrev = t0.onTabPrev, onTabNext = t0.onTabNext, onRespondToClaude = t0.onRespondToClaude, onFinishPlanInterview = t0.onFinishPlanInterview, onImagePaste = t0.onImagePaste, pastedContents = t0.pastedContents, onRemoveImage = t0.onRemoveImage;
    var hideSubmitTab = t1 === undefined ? false : t1;
    var isInPlanMode = (0, AppState_js_1.useAppState)(_temp) === "plan";
    var _e = (0, react_1.useState)(false), isFooterFocused = _e[0], setIsFooterFocused = _e[1];
    var _f = (0, react_1.useState)(0), footerIndex = _f[0], setFooterIndex = _f[1];
    var _g = (0, react_1.useState)(false), isOtherFocused = _g[0], setIsOtherFocused = _g[1];
    var t2;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        var editor = (0, editor_js_1.getExternalEditor)();
        t2 = editor ? (0, ide_js_1.toIDEDisplayName)(editor) : null;
        $[0] = t2;
    }
    else {
        t2 = $[0];
    }
    var editorName = t2;
    var t3;
    if ($[1] !== onTextInputFocus) {
        t3 = function (value) {
            var isOther = value === "__other__";
            setIsOtherFocused(isOther);
            onTextInputFocus(isOther);
        };
        $[1] = onTextInputFocus;
        $[2] = t3;
    }
    else {
        t3 = $[2];
    }
    var handleFocus = t3;
    var t4;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = function () {
            setIsFooterFocused(true);
        };
        $[3] = t4;
    }
    else {
        t4 = $[3];
    }
    var handleDownFromLastItem = t4;
    var t5;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = function () {
            setIsFooterFocused(false);
        };
        $[4] = t5;
    }
    else {
        t5 = $[4];
    }
    var handleUpFromFooter = t5;
    var t6;
    if ($[5] !== footerIndex || $[6] !== isFooterFocused || $[7] !== isInPlanMode || $[8] !== onCancel || $[9] !== onFinishPlanInterview || $[10] !== onRespondToClaude) {
        t6 = function (e) {
            if (!isFooterFocused) {
                return;
            }
            if (e.key === "up" || e.ctrl && e.key === "p") {
                e.preventDefault();
                if (footerIndex === 0) {
                    handleUpFromFooter();
                }
                else {
                    setFooterIndex(0);
                }
                return;
            }
            if (e.key === "down" || e.ctrl && e.key === "n") {
                e.preventDefault();
                if (isInPlanMode && footerIndex === 0) {
                    setFooterIndex(1);
                }
                return;
            }
            if (e.key === "return") {
                e.preventDefault();
                if (footerIndex === 0) {
                    onRespondToClaude();
                }
                else {
                    onFinishPlanInterview();
                }
                return;
            }
            if (e.key === "escape") {
                e.preventDefault();
                onCancel();
            }
        };
        $[5] = footerIndex;
        $[6] = isFooterFocused;
        $[7] = isInPlanMode;
        $[8] = onCancel;
        $[9] = onFinishPlanInterview;
        $[10] = onRespondToClaude;
        $[11] = t6;
    }
    else {
        t6 = $[11];
    }
    var handleKeyDown = t6;
    var handleOpenEditor;
    var questionText;
    var t7;
    if ($[12] !== onUpdateQuestionState || $[13] !== question || $[14] !== questionStates) {
        var textOptions = question.options.map(_temp2);
        questionText = question.question;
        var questionState = questionStates[questionText];
        var t8_1;
        if ($[18] !== onUpdateQuestionState || $[19] !== question.multiSelect || $[20] !== questionText) {
            t8_1 = function (currentValue, setValue) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, promptEditor_js_1.editPromptInEditor)(currentValue)];
                        case 1:
                            result = _b.sent();
                            if (result.content !== null && result.content !== currentValue) {
                                setValue(result.content);
                                onUpdateQuestionState(questionText, {
                                    textInputValue: result.content
                                }, (_a = question.multiSelect) !== null && _a !== void 0 ? _a : false);
                            }
                            return [2 /*return*/];
                    }
                });
            }); };
            $[18] = onUpdateQuestionState;
            $[19] = question.multiSelect;
            $[20] = questionText;
            $[21] = t8_1;
        }
        else {
            t8_1 = $[21];
        }
        handleOpenEditor = t8_1;
        var t9_1 = question.multiSelect ? "Type something" : "Type something.";
        var t10_1 = (_a = questionState === null || questionState === void 0 ? void 0 : questionState.textInputValue) !== null && _a !== void 0 ? _a : "";
        var t11_1;
        if ($[22] !== onUpdateQuestionState || $[23] !== question.multiSelect || $[24] !== questionText) {
            t11_1 = function (value_0) {
                var _a;
                onUpdateQuestionState(questionText, {
                    textInputValue: value_0
                }, (_a = question.multiSelect) !== null && _a !== void 0 ? _a : false);
            };
            $[22] = onUpdateQuestionState;
            $[23] = question.multiSelect;
            $[24] = questionText;
            $[25] = t11_1;
        }
        else {
            t11_1 = $[25];
        }
        var t12_1;
        if ($[26] !== t10_1 || $[27] !== t11_1 || $[28] !== t9_1) {
            t12_1 = {
                type: "input",
                value: "__other__",
                label: "Other",
                placeholder: t9_1,
                initialValue: t10_1,
                onChange: t11_1
            };
            $[26] = t10_1;
            $[27] = t11_1;
            $[28] = t9_1;
            $[29] = t12_1;
        }
        else {
            t12_1 = $[29];
        }
        var otherOption = t12_1;
        t7 = __spreadArray(__spreadArray([], textOptions, true), [otherOption], false);
        $[12] = onUpdateQuestionState;
        $[13] = question;
        $[14] = questionStates;
        $[15] = handleOpenEditor;
        $[16] = questionText;
        $[17] = t7;
    }
    else {
        handleOpenEditor = $[15];
        questionText = $[16];
        t7 = $[17];
    }
    var options = t7;
    var hasAnyPreview = !question.multiSelect && question.options.some(_temp3);
    if (hasAnyPreview) {
        var t8_2;
        if ($[30] !== answers || $[31] !== currentQuestionIndex || $[32] !== hideSubmitTab || $[33] !== minContentHeight || $[34] !== minContentWidth || $[35] !== onAnswer || $[36] !== onCancel || $[37] !== onFinishPlanInterview || $[38] !== onRespondToClaude || $[39] !== onTabNext || $[40] !== onTabPrev || $[41] !== onTextInputFocus || $[42] !== onUpdateQuestionState || $[43] !== question || $[44] !== questionStates || $[45] !== questions) {
            t8_2 = <PreviewQuestionView_js_1.PreviewQuestionView question={question} questions={questions} currentQuestionIndex={currentQuestionIndex} answers={answers} questionStates={questionStates} hideSubmitTab={hideSubmitTab} minContentHeight={minContentHeight} minContentWidth={minContentWidth} onUpdateQuestionState={onUpdateQuestionState} onAnswer={onAnswer} onTextInputFocus={onTextInputFocus} onCancel={onCancel} onTabPrev={onTabPrev} onTabNext={onTabNext} onRespondToClaude={onRespondToClaude} onFinishPlanInterview={onFinishPlanInterview}/>;
            $[30] = answers;
            $[31] = currentQuestionIndex;
            $[32] = hideSubmitTab;
            $[33] = minContentHeight;
            $[34] = minContentWidth;
            $[35] = onAnswer;
            $[36] = onCancel;
            $[37] = onFinishPlanInterview;
            $[38] = onRespondToClaude;
            $[39] = onTabNext;
            $[40] = onTabPrev;
            $[41] = onTextInputFocus;
            $[42] = onUpdateQuestionState;
            $[43] = question;
            $[44] = questionStates;
            $[45] = questions;
            $[46] = t8_2;
        }
        else {
            t8_2 = $[46];
        }
        return t8_2;
    }
    var t8;
    if ($[47] !== isInPlanMode || $[48] !== planFilePath) {
        t8 = isInPlanMode && planFilePath && <ink_js_1.Box flexDirection="column" gap={0}><Divider_js_1.Divider color="inactive"/><ink_js_1.Text color="inactive">Planning: <FilePathLink_js_1.FilePathLink filePath={planFilePath}/></ink_js_1.Text></ink_js_1.Box>;
        $[47] = isInPlanMode;
        $[48] = planFilePath;
        $[49] = t8;
    }
    else {
        t8 = $[49];
    }
    var t9;
    if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = <ink_js_1.Box marginTop={-1}><Divider_js_1.Divider color="inactive"/></ink_js_1.Box>;
        $[50] = t9;
    }
    else {
        t9 = $[50];
    }
    var t10;
    if ($[51] !== answers || $[52] !== currentQuestionIndex || $[53] !== hideSubmitTab || $[54] !== questions) {
        t10 = <QuestionNavigationBar_js_1.QuestionNavigationBar questions={questions} currentQuestionIndex={currentQuestionIndex} answers={answers} hideSubmitTab={hideSubmitTab}/>;
        $[51] = answers;
        $[52] = currentQuestionIndex;
        $[53] = hideSubmitTab;
        $[54] = questions;
        $[55] = t10;
    }
    else {
        t10 = $[55];
    }
    var t11;
    if ($[56] !== question.question) {
        t11 = <PermissionRequestTitle_js_1.PermissionRequestTitle title={question.question} color="text"/>;
        $[56] = question.question;
        $[57] = t11;
    }
    else {
        t11 = $[57];
    }
    var t12;
    if ($[58] !== currentQuestionIndex || $[59] !== handleFocus || $[60] !== handleOpenEditor || $[61] !== isFooterFocused || $[62] !== onAnswer || $[63] !== onCancel || $[64] !== onImagePaste || $[65] !== onRemoveImage || $[66] !== onSubmit || $[67] !== onUpdateQuestionState || $[68] !== options || $[69] !== pastedContents || $[70] !== question.multiSelect || $[71] !== question.question || $[72] !== questionStates || $[73] !== questionText || $[74] !== questions.length) {
        t12 = <ink_js_1.Box marginTop={1}>{question.multiSelect ? <index_js_1.SelectMulti key={question.question} options={options} defaultValue={(_b = questionStates[question.question]) === null || _b === void 0 ? void 0 : _b.selectedValue} onChange={function (values) {
                    var _a;
                    onUpdateQuestionState(questionText, {
                        selectedValue: values
                    }, true);
                    var textInput = values.includes("__other__") ? (_a = questionStates[questionText]) === null || _a === void 0 ? void 0 : _a.textInputValue : undefined;
                    var finalValues = values.filter(_temp4).concat(textInput ? [textInput] : []);
                    onAnswer(questionText, finalValues, undefined, false);
                }} onFocus={handleFocus} onCancel={onCancel} submitButtonText={currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"} onSubmit={onSubmit} onDownFromLastItem={handleDownFromLastItem} isDisabled={isFooterFocused} onOpenEditor={handleOpenEditor} onImagePaste={onImagePaste} pastedContents={pastedContents} onRemoveImage={onRemoveImage}/> : <index_js_1.Select key={question.question} options={options} defaultValue={(_d = questionStates[question.question]) === null || _d === void 0 ? void 0 : _d.selectedValue} onChange={function (value_1) {
                    var _a;
                    onUpdateQuestionState(questionText, {
                        selectedValue: value_1
                    }, false);
                    var textInput_0 = value_1 === "__other__" ? (_a = questionStates[questionText]) === null || _a === void 0 ? void 0 : _a.textInputValue : undefined;
                    onAnswer(questionText, value_1, textInput_0);
                }} onFocus={handleFocus} onCancel={onCancel} onDownFromLastItem={handleDownFromLastItem} isDisabled={isFooterFocused} layout="compact-vertical" onOpenEditor={handleOpenEditor} onImagePaste={onImagePaste} pastedContents={pastedContents} onRemoveImage={onRemoveImage}/>}</ink_js_1.Box>;
        $[58] = currentQuestionIndex;
        $[59] = handleFocus;
        $[60] = handleOpenEditor;
        $[61] = isFooterFocused;
        $[62] = onAnswer;
        $[63] = onCancel;
        $[64] = onImagePaste;
        $[65] = onRemoveImage;
        $[66] = onSubmit;
        $[67] = onUpdateQuestionState;
        $[68] = options;
        $[69] = pastedContents;
        $[70] = question.multiSelect;
        $[71] = question.question;
        $[72] = questionStates;
        $[73] = questionText;
        $[74] = questions.length;
        $[75] = t12;
    }
    else {
        t12 = $[75];
    }
    var t13;
    if ($[76] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = <Divider_js_1.Divider color="inactive"/>;
        $[76] = t13;
    }
    else {
        t13 = $[76];
    }
    var t14;
    if ($[77] !== footerIndex || $[78] !== isFooterFocused) {
        t14 = isFooterFocused && footerIndex === 0 ? <ink_js_1.Text color="suggestion">{figures_1.default.pointer}</ink_js_1.Text> : <ink_js_1.Text> </ink_js_1.Text>;
        $[77] = footerIndex;
        $[78] = isFooterFocused;
        $[79] = t14;
    }
    else {
        t14 = $[79];
    }
    var t15 = isFooterFocused && footerIndex === 0 ? "suggestion" : undefined;
    var t16 = options.length + 1;
    var t17;
    if ($[80] !== t15 || $[81] !== t16) {
        t17 = <ink_js_1.Text color={t15}>{t16}. Chat about this</ink_js_1.Text>;
        $[80] = t15;
        $[81] = t16;
        $[82] = t17;
    }
    else {
        t17 = $[82];
    }
    var t18;
    if ($[83] !== t14 || $[84] !== t17) {
        t18 = <ink_js_1.Box flexDirection="row" gap={1}>{t14}{t17}</ink_js_1.Box>;
        $[83] = t14;
        $[84] = t17;
        $[85] = t18;
    }
    else {
        t18 = $[85];
    }
    var t19;
    if ($[86] !== footerIndex || $[87] !== isFooterFocused || $[88] !== isInPlanMode || $[89] !== options.length) {
        t19 = isInPlanMode && <ink_js_1.Box flexDirection="row" gap={1}>{isFooterFocused && footerIndex === 1 ? <ink_js_1.Text color="suggestion">{figures_1.default.pointer}</ink_js_1.Text> : <ink_js_1.Text> </ink_js_1.Text>}<ink_js_1.Text color={isFooterFocused && footerIndex === 1 ? "suggestion" : undefined}>{options.length + 2}. Skip interview and plan immediately</ink_js_1.Text></ink_js_1.Box>;
        $[86] = footerIndex;
        $[87] = isFooterFocused;
        $[88] = isInPlanMode;
        $[89] = options.length;
        $[90] = t19;
    }
    else {
        t19 = $[90];
    }
    var t20;
    if ($[91] !== t18 || $[92] !== t19) {
        t20 = <ink_js_1.Box flexDirection="column">{t13}{t18}{t19}</ink_js_1.Box>;
        $[91] = t18;
        $[92] = t19;
        $[93] = t20;
    }
    else {
        t20 = $[93];
    }
    var t21;
    if ($[94] !== questions.length) {
        t21 = questions.length === 1 ? <>{figures_1.default.arrowUp}/{figures_1.default.arrowDown} to navigate</> : "Tab/Arrow keys to navigate";
        $[94] = questions.length;
        $[95] = t21;
    }
    else {
        t21 = $[95];
    }
    var t22;
    if ($[96] !== isOtherFocused) {
        t22 = isOtherFocused && editorName && <> · ctrl+g to edit in {editorName}</>;
        $[96] = isOtherFocused;
        $[97] = t22;
    }
    else {
        t22 = $[97];
    }
    var t23;
    if ($[98] !== t21 || $[99] !== t22) {
        t23 = <ink_js_1.Box marginTop={1}><ink_js_1.Text color="inactive" dimColor={true}>Enter to select ·{" "}{t21}{t22}{" "}· Esc to cancel</ink_js_1.Text></ink_js_1.Box>;
        $[98] = t21;
        $[99] = t22;
        $[100] = t23;
    }
    else {
        t23 = $[100];
    }
    var t24;
    if ($[101] !== minContentHeight || $[102] !== t12 || $[103] !== t20 || $[104] !== t23) {
        t24 = <ink_js_1.Box flexDirection="column" minHeight={minContentHeight}>{t12}{t20}{t23}</ink_js_1.Box>;
        $[101] = minContentHeight;
        $[102] = t12;
        $[103] = t20;
        $[104] = t23;
        $[105] = t24;
    }
    else {
        t24 = $[105];
    }
    var t25;
    if ($[106] !== t10 || $[107] !== t11 || $[108] !== t24) {
        t25 = <ink_js_1.Box flexDirection="column" paddingTop={0}>{t10}{t11}{t24}</ink_js_1.Box>;
        $[106] = t10;
        $[107] = t11;
        $[108] = t24;
        $[109] = t25;
    }
    else {
        t25 = $[109];
    }
    var t26;
    if ($[110] !== handleKeyDown || $[111] !== t25 || $[112] !== t8) {
        t26 = <ink_js_1.Box flexDirection="column" marginTop={0} tabIndex={0} autoFocus={true} onKeyDown={handleKeyDown}>{t8}{t9}{t25}</ink_js_1.Box>;
        $[110] = handleKeyDown;
        $[111] = t25;
        $[112] = t8;
        $[113] = t26;
    }
    else {
        t26 = $[113];
    }
    return t26;
}
function _temp4(v) {
    return v !== "__other__";
}
function _temp3(opt_0) {
    return opt_0.preview;
}
function _temp2(opt) {
    return {
        type: "text",
        value: opt.label,
        label: opt.label,
        description: opt.description
    };
}
function _temp(s) {
    return s.toolPermissionContext.mode;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VDYWxsYmFjayIsInVzZVN0YXRlIiwiS2V5Ym9hcmRFdmVudCIsIkJveCIsIlRleHQiLCJ1c2VBcHBTdGF0ZSIsIlF1ZXN0aW9uIiwiUXVlc3Rpb25PcHRpb24iLCJQYXN0ZWRDb250ZW50IiwiZ2V0RXh0ZXJuYWxFZGl0b3IiLCJ0b0lERURpc3BsYXlOYW1lIiwiSW1hZ2VEaW1lbnNpb25zIiwiZWRpdFByb21wdEluRWRpdG9yIiwiT3B0aW9uV2l0aERlc2NyaXB0aW9uIiwiU2VsZWN0IiwiU2VsZWN0TXVsdGkiLCJEaXZpZGVyIiwiRmlsZVBhdGhMaW5rIiwiUGVybWlzc2lvblJlcXVlc3RUaXRsZSIsIlByZXZpZXdRdWVzdGlvblZpZXciLCJRdWVzdGlvbk5hdmlnYXRpb25CYXIiLCJRdWVzdGlvblN0YXRlIiwiUHJvcHMiLCJxdWVzdGlvbiIsInF1ZXN0aW9ucyIsImN1cnJlbnRRdWVzdGlvbkluZGV4IiwiYW5zd2VycyIsIlJlY29yZCIsInF1ZXN0aW9uU3RhdGVzIiwiaGlkZVN1Ym1pdFRhYiIsInBsYW5GaWxlUGF0aCIsInBhc3RlZENvbnRlbnRzIiwibWluQ29udGVudEhlaWdodCIsIm1pbkNvbnRlbnRXaWR0aCIsIm9uVXBkYXRlUXVlc3Rpb25TdGF0ZSIsInF1ZXN0aW9uVGV4dCIsInVwZGF0ZXMiLCJQYXJ0aWFsIiwiaXNNdWx0aVNlbGVjdCIsIm9uQW5zd2VyIiwibGFiZWwiLCJ0ZXh0SW5wdXQiLCJzaG91bGRBZHZhbmNlIiwib25UZXh0SW5wdXRGb2N1cyIsImlzSW5JbnB1dCIsIm9uQ2FuY2VsIiwib25TdWJtaXQiLCJvblRhYlByZXYiLCJvblRhYk5leHQiLCJvblJlc3BvbmRUb0NsYXVkZSIsIm9uRmluaXNoUGxhbkludGVydmlldyIsIm9uSW1hZ2VQYXN0ZSIsImJhc2U2NEltYWdlIiwibWVkaWFUeXBlIiwiZmlsZW5hbWUiLCJkaW1lbnNpb25zIiwic291cmNlUGF0aCIsIm9uUmVtb3ZlSW1hZ2UiLCJpZCIsIlF1ZXN0aW9uVmlldyIsInQwIiwiJCIsIl9jIiwidDEiLCJ1bmRlZmluZWQiLCJpc0luUGxhbk1vZGUiLCJfdGVtcCIsImlzRm9vdGVyRm9jdXNlZCIsInNldElzRm9vdGVyRm9jdXNlZCIsImZvb3RlckluZGV4Iiwic2V0Rm9vdGVySW5kZXgiLCJpc090aGVyRm9jdXNlZCIsInNldElzT3RoZXJGb2N1c2VkIiwidDIiLCJTeW1ib2wiLCJmb3IiLCJlZGl0b3IiLCJlZGl0b3JOYW1lIiwidDMiLCJ2YWx1ZSIsImlzT3RoZXIiLCJoYW5kbGVGb2N1cyIsInQ0IiwiaGFuZGxlRG93bkZyb21MYXN0SXRlbSIsInQ1IiwiaGFuZGxlVXBGcm9tRm9vdGVyIiwidDYiLCJlIiwia2V5IiwiY3RybCIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlS2V5RG93biIsImhhbmRsZU9wZW5FZGl0b3IiLCJ0NyIsInRleHRPcHRpb25zIiwib3B0aW9ucyIsIm1hcCIsIl90ZW1wMiIsInF1ZXN0aW9uU3RhdGUiLCJ0OCIsIm11bHRpU2VsZWN0IiwiY3VycmVudFZhbHVlIiwic2V0VmFsdWUiLCJyZXN1bHQiLCJjb250ZW50IiwidGV4dElucHV0VmFsdWUiLCJ0OSIsInQxMCIsInQxMSIsInZhbHVlXzAiLCJ0MTIiLCJ0eXBlIiwiY29uc3QiLCJwbGFjZWhvbGRlciIsImluaXRpYWxWYWx1ZSIsIm9uQ2hhbmdlIiwib3RoZXJPcHRpb24iLCJoYXNBbnlQcmV2aWV3Iiwic29tZSIsIl90ZW1wMyIsImxlbmd0aCIsInNlbGVjdGVkVmFsdWUiLCJ2YWx1ZXMiLCJpbmNsdWRlcyIsImZpbmFsVmFsdWVzIiwiZmlsdGVyIiwiX3RlbXA0IiwiY29uY2F0IiwidmFsdWVfMSIsInRleHRJbnB1dF8wIiwidDEzIiwidDE0IiwicG9pbnRlciIsInQxNSIsInQxNiIsInQxNyIsInQxOCIsInQxOSIsInQyMCIsInQyMSIsImFycm93VXAiLCJhcnJvd0Rvd24iLCJ0MjIiLCJ0MjMiLCJ0MjQiLCJ0MjUiLCJ0MjYiLCJ2Iiwib3B0XzAiLCJvcHQiLCJwcmV2aWV3IiwiZGVzY3JpcHRpb24iLCJzIiwidG9vbFBlcm1pc3Npb25Db250ZXh0IiwibW9kZSJdLCJzb3VyY2VzIjpbIlF1ZXN0aW9uVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZpZ3VyZXMgZnJvbSAnZmlndXJlcydcbmltcG9ydCBSZWFjdCwgeyB1c2VDYWxsYmFjaywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB0eXBlIHsgS2V5Ym9hcmRFdmVudCB9IGZyb20gJy4uLy4uLy4uL2luay9ldmVudHMva2V5Ym9hcmQtZXZlbnQuanMnXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9pbmsuanMnXG5pbXBvcnQgeyB1c2VBcHBTdGF0ZSB9IGZyb20gJy4uLy4uLy4uL3N0YXRlL0FwcFN0YXRlLmpzJ1xuaW1wb3J0IHR5cGUge1xuICBRdWVzdGlvbixcbiAgUXVlc3Rpb25PcHRpb24sXG59IGZyb20gJy4uLy4uLy4uL3Rvb2xzL0Fza1VzZXJRdWVzdGlvblRvb2wvQXNrVXNlclF1ZXN0aW9uVG9vbC5qcydcbmltcG9ydCB0eXBlIHsgUGFzdGVkQ29udGVudCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IGdldEV4dGVybmFsRWRpdG9yIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZWRpdG9yLmpzJ1xuaW1wb3J0IHsgdG9JREVEaXNwbGF5TmFtZSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2lkZS5qcydcbmltcG9ydCB0eXBlIHsgSW1hZ2VEaW1lbnNpb25zIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvaW1hZ2VSZXNpemVyLmpzJ1xuaW1wb3J0IHsgZWRpdFByb21wdEluRWRpdG9yIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvcHJvbXB0RWRpdG9yLmpzJ1xuaW1wb3J0IHtcbiAgdHlwZSBPcHRpb25XaXRoRGVzY3JpcHRpb24sXG4gIFNlbGVjdCxcbiAgU2VsZWN0TXVsdGksXG59IGZyb20gJy4uLy4uL0N1c3RvbVNlbGVjdC9pbmRleC5qcydcbmltcG9ydCB7IERpdmlkZXIgfSBmcm9tICcuLi8uLi9kZXNpZ24tc3lzdGVtL0RpdmlkZXIuanMnXG5pbXBvcnQgeyBGaWxlUGF0aExpbmsgfSBmcm9tICcuLi8uLi9GaWxlUGF0aExpbmsuanMnXG5pbXBvcnQgeyBQZXJtaXNzaW9uUmVxdWVzdFRpdGxlIH0gZnJvbSAnLi4vUGVybWlzc2lvblJlcXVlc3RUaXRsZS5qcydcbmltcG9ydCB7IFByZXZpZXdRdWVzdGlvblZpZXcgfSBmcm9tICcuL1ByZXZpZXdRdWVzdGlvblZpZXcuanMnXG5pbXBvcnQgeyBRdWVzdGlvbk5hdmlnYXRpb25CYXIgfSBmcm9tICcuL1F1ZXN0aW9uTmF2aWdhdGlvbkJhci5qcydcbmltcG9ydCB0eXBlIHsgUXVlc3Rpb25TdGF0ZSB9IGZyb20gJy4vdXNlLW11bHRpcGxlLWNob2ljZS1zdGF0ZS5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgcXVlc3Rpb246IFF1ZXN0aW9uXG4gIHF1ZXN0aW9uczogUXVlc3Rpb25bXVxuICBjdXJyZW50UXVlc3Rpb25JbmRleDogbnVtYmVyXG4gIGFuc3dlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgcXVlc3Rpb25TdGF0ZXM6IFJlY29yZDxzdHJpbmcsIFF1ZXN0aW9uU3RhdGU+XG4gIGhpZGVTdWJtaXRUYWI/OiBib29sZWFuXG4gIHBsYW5GaWxlUGF0aD86IHN0cmluZ1xuICBwYXN0ZWRDb250ZW50cz86IFJlY29yZDxudW1iZXIsIFBhc3RlZENvbnRlbnQ+XG4gIG1pbkNvbnRlbnRIZWlnaHQ/OiBudW1iZXJcbiAgbWluQ29udGVudFdpZHRoPzogbnVtYmVyXG4gIG9uVXBkYXRlUXVlc3Rpb25TdGF0ZTogKFxuICAgIHF1ZXN0aW9uVGV4dDogc3RyaW5nLFxuICAgIHVwZGF0ZXM6IFBhcnRpYWw8UXVlc3Rpb25TdGF0ZT4sXG4gICAgaXNNdWx0aVNlbGVjdDogYm9vbGVhbixcbiAgKSA9PiB2b2lkXG4gIG9uQW5zd2VyOiAoXG4gICAgcXVlc3Rpb25UZXh0OiBzdHJpbmcsXG4gICAgbGFiZWw6IHN0cmluZyB8IHN0cmluZ1tdLFxuICAgIHRleHRJbnB1dD86IHN0cmluZyxcbiAgICBzaG91bGRBZHZhbmNlPzogYm9vbGVhbixcbiAgKSA9PiB2b2lkXG4gIG9uVGV4dElucHV0Rm9jdXM6IChpc0luSW5wdXQ6IGJvb2xlYW4pID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgb25TdWJtaXQ6ICgpID0+IHZvaWRcbiAgb25UYWJQcmV2PzogKCkgPT4gdm9pZFxuICBvblRhYk5leHQ/OiAoKSA9PiB2b2lkXG4gIG9uUmVzcG9uZFRvQ2xhdWRlOiAoKSA9PiB2b2lkXG4gIG9uRmluaXNoUGxhbkludGVydmlldzogKCkgPT4gdm9pZFxuICBvbkltYWdlUGFzdGU/OiAoXG4gICAgYmFzZTY0SW1hZ2U6IHN0cmluZyxcbiAgICBtZWRpYVR5cGU/OiBzdHJpbmcsXG4gICAgZmlsZW5hbWU/OiBzdHJpbmcsXG4gICAgZGltZW5zaW9ucz86IEltYWdlRGltZW5zaW9ucyxcbiAgICBzb3VyY2VQYXRoPzogc3RyaW5nLFxuICApID0+IHZvaWRcbiAgb25SZW1vdmVJbWFnZT86IChpZDogbnVtYmVyKSA9PiB2b2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBRdWVzdGlvblZpZXcoe1xuICBxdWVzdGlvbixcbiAgcXVlc3Rpb25zLFxuICBjdXJyZW50UXVlc3Rpb25JbmRleCxcbiAgYW5zd2VycyxcbiAgcXVlc3Rpb25TdGF0ZXMsXG4gIGhpZGVTdWJtaXRUYWIgPSBmYWxzZSxcbiAgcGxhbkZpbGVQYXRoLFxuICBtaW5Db250ZW50SGVpZ2h0LFxuICBtaW5Db250ZW50V2lkdGgsXG4gIG9uVXBkYXRlUXVlc3Rpb25TdGF0ZSxcbiAgb25BbnN3ZXIsXG4gIG9uVGV4dElucHV0Rm9jdXMsXG4gIG9uQ2FuY2VsLFxuICBvblN1Ym1pdCxcbiAgb25UYWJQcmV2LFxuICBvblRhYk5leHQsXG4gIG9uUmVzcG9uZFRvQ2xhdWRlLFxuICBvbkZpbmlzaFBsYW5JbnRlcnZpZXcsXG4gIG9uSW1hZ2VQYXN0ZSxcbiAgcGFzdGVkQ29udGVudHMsXG4gIG9uUmVtb3ZlSW1hZ2UsXG59OiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IGlzSW5QbGFuTW9kZSA9IHVzZUFwcFN0YXRlKHMgPT4gcy50b29sUGVybWlzc2lvbkNvbnRleHQubW9kZSkgPT09ICdwbGFuJ1xuICBjb25zdCBbaXNGb290ZXJGb2N1c2VkLCBzZXRJc0Zvb3RlckZvY3VzZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtmb290ZXJJbmRleCwgc2V0Rm9vdGVySW5kZXhdID0gdXNlU3RhdGUoMClcbiAgY29uc3QgW2lzT3RoZXJGb2N1c2VkLCBzZXRJc090aGVyRm9jdXNlZF0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBlZGl0b3IgPSBnZXRFeHRlcm5hbEVkaXRvcigpXG4gIGNvbnN0IGVkaXRvck5hbWUgPSBlZGl0b3IgPyB0b0lERURpc3BsYXlOYW1lKGVkaXRvcikgOiBudWxsXG5cbiAgY29uc3QgaGFuZGxlRm9jdXMgPSB1c2VDYWxsYmFjayhcbiAgICAodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgaXNPdGhlciA9IHZhbHVlID09PSAnX19vdGhlcl9fJ1xuICAgICAgc2V0SXNPdGhlckZvY3VzZWQoaXNPdGhlcilcbiAgICAgIG9uVGV4dElucHV0Rm9jdXMoaXNPdGhlcilcbiAgICB9LFxuICAgIFtvblRleHRJbnB1dEZvY3VzXSxcbiAgKVxuXG4gIGNvbnN0IGhhbmRsZURvd25Gcm9tTGFzdEl0ZW0gPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SXNGb290ZXJGb2N1c2VkKHRydWUpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZVVwRnJvbUZvb3RlciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRJc0Zvb3RlckZvY3VzZWQoZmFsc2UpXG4gIH0sIFtdKVxuXG4gIC8vIEhhbmRsZSBrZXlib2FyZCBpbnB1dCB3aGVuIGZvb3RlciBpcyBmb2N1c2VkXG4gIGNvbnN0IGhhbmRsZUtleURvd24gPSB1c2VDYWxsYmFjayhcbiAgICAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKCFpc0Zvb3RlckZvY3VzZWQpIHJldHVyblxuXG4gICAgICBpZiAoZS5rZXkgPT09ICd1cCcgfHwgKGUuY3RybCAmJiBlLmtleSA9PT0gJ3AnKSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgaWYgKGZvb3RlckluZGV4ID09PSAwKSB7XG4gICAgICAgICAgaGFuZGxlVXBGcm9tRm9vdGVyKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRGb290ZXJJbmRleCgwKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoZS5rZXkgPT09ICdkb3duJyB8fCAoZS5jdHJsICYmIGUua2V5ID09PSAnbicpKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBpZiAoaXNJblBsYW5Nb2RlICYmIGZvb3RlckluZGV4ID09PSAwKSB7XG4gICAgICAgICAgc2V0Rm9vdGVySW5kZXgoMSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGUua2V5ID09PSAncmV0dXJuJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgaWYgKGZvb3RlckluZGV4ID09PSAwKSB7XG4gICAgICAgICAgb25SZXNwb25kVG9DbGF1ZGUoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9uRmluaXNoUGxhbkludGVydmlldygpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChlLmtleSA9PT0gJ2VzY2FwZScpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIG9uQ2FuY2VsKClcbiAgICAgIH1cbiAgICB9LFxuICAgIFtcbiAgICAgIGlzRm9vdGVyRm9jdXNlZCxcbiAgICAgIGZvb3RlckluZGV4LFxuICAgICAgaXNJblBsYW5Nb2RlLFxuICAgICAgaGFuZGxlVXBGcm9tRm9vdGVyLFxuICAgICAgb25SZXNwb25kVG9DbGF1ZGUsXG4gICAgICBvbkZpbmlzaFBsYW5JbnRlcnZpZXcsXG4gICAgICBvbkNhbmNlbCxcbiAgICBdLFxuICApXG5cbiAgY29uc3QgdGV4dE9wdGlvbnM6IE9wdGlvbldpdGhEZXNjcmlwdGlvbjxzdHJpbmc+W10gPSBxdWVzdGlvbi5vcHRpb25zLm1hcChcbiAgICAob3B0OiBRdWVzdGlvbk9wdGlvbikgPT4gKHtcbiAgICAgIHR5cGU6ICd0ZXh0JyBhcyBjb25zdCxcbiAgICAgIHZhbHVlOiBvcHQubGFiZWwsXG4gICAgICBsYWJlbDogb3B0LmxhYmVsLFxuICAgICAgZGVzY3JpcHRpb246IG9wdC5kZXNjcmlwdGlvbixcbiAgICB9KSxcbiAgKVxuXG4gIGNvbnN0IHF1ZXN0aW9uVGV4dCA9IHF1ZXN0aW9uLnF1ZXN0aW9uXG4gIGNvbnN0IHF1ZXN0aW9uU3RhdGUgPSBxdWVzdGlvblN0YXRlc1txdWVzdGlvblRleHRdXG5cbiAgY29uc3QgaGFuZGxlT3BlbkVkaXRvciA9IHVzZUNhbGxiYWNrKFxuICAgIGFzeW5jIChjdXJyZW50VmFsdWU6IHN0cmluZywgc2V0VmFsdWU6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBlZGl0UHJvbXB0SW5FZGl0b3IoY3VycmVudFZhbHVlKVxuXG4gICAgICBpZiAocmVzdWx0LmNvbnRlbnQgIT09IG51bGwgJiYgcmVzdWx0LmNvbnRlbnQgIT09IGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIFNlbGVjdCdzIGludGVybmFsIHN0YXRlIGZvciBpbW1lZGlhdGUgVUkgdXBkYXRlXG4gICAgICAgIHNldFZhbHVlKHJlc3VsdC5jb250ZW50KVxuICAgICAgICAvLyBBbHNvIHVwZGF0ZSB0aGUgcXVlc3Rpb24gc3RhdGUgZm9yIHBlcnNpc3RlbmNlXG4gICAgICAgIG9uVXBkYXRlUXVlc3Rpb25TdGF0ZShcbiAgICAgICAgICBxdWVzdGlvblRleHQsXG4gICAgICAgICAgeyB0ZXh0SW5wdXRWYWx1ZTogcmVzdWx0LmNvbnRlbnQgfSxcbiAgICAgICAgICBxdWVzdGlvbi5tdWx0aVNlbGVjdCA/PyBmYWxzZSxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0sXG4gICAgW3F1ZXN0aW9uVGV4dCwgb25VcGRhdGVRdWVzdGlvblN0YXRlLCBxdWVzdGlvbi5tdWx0aVNlbGVjdF0sXG4gIClcblxuICBjb25zdCBvdGhlck9wdGlvbjogT3B0aW9uV2l0aERlc2NyaXB0aW9uPHN0cmluZz4gPSB7XG4gICAgdHlwZTogJ2lucHV0JyBhcyBjb25zdCxcbiAgICB2YWx1ZTogJ19fb3RoZXJfXycsXG4gICAgbGFiZWw6ICdPdGhlcicsXG4gICAgcGxhY2Vob2xkZXI6IHF1ZXN0aW9uLm11bHRpU2VsZWN0ID8gJ1R5cGUgc29tZXRoaW5nJyA6ICdUeXBlIHNvbWV0aGluZy4nLFxuICAgIGluaXRpYWxWYWx1ZTogcXVlc3Rpb25TdGF0ZT8udGV4dElucHV0VmFsdWUgPz8gJycsXG4gICAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICBvblVwZGF0ZVF1ZXN0aW9uU3RhdGUoXG4gICAgICAgIHF1ZXN0aW9uVGV4dCxcbiAgICAgICAgeyB0ZXh0SW5wdXRWYWx1ZTogdmFsdWUgfSxcbiAgICAgICAgcXVlc3Rpb24ubXVsdGlTZWxlY3QgPz8gZmFsc2UsXG4gICAgICApXG4gICAgfSxcbiAgfVxuXG4gIGNvbnN0IG9wdGlvbnMgPSBbLi4udGV4dE9wdGlvbnMsIG90aGVyT3B0aW9uXVxuXG4gIC8vIENoZWNrIGlmIGFueSBvcHRpb24gaGFzIGEgcHJldmlldyBhbmQgaXQncyBub3QgbXVsdGktc2VsZWN0XG4gIC8vIFByZXZpZXdzIG9ubHkgc3VwcG9ydGVkIGZvciBzaW5nbGUtc2VsZWN0IHF1ZXN0aW9uc1xuICBjb25zdCBoYXNBbnlQcmV2aWV3ID1cbiAgICAhcXVlc3Rpb24ubXVsdGlTZWxlY3QgJiYgcXVlc3Rpb24ub3B0aW9ucy5zb21lKG9wdCA9PiBvcHQucHJldmlldylcblxuICAvLyBEZWxlZ2F0ZSB0byBQcmV2aWV3UXVlc3Rpb25WaWV3IGZvciBjYXJvdXNlbC1zdHlsZSBwcmV2aWV3IG1vZGVcbiAgaWYgKGhhc0FueVByZXZpZXcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFByZXZpZXdRdWVzdGlvblZpZXdcbiAgICAgICAgcXVlc3Rpb249e3F1ZXN0aW9ufVxuICAgICAgICBxdWVzdGlvbnM9e3F1ZXN0aW9uc31cbiAgICAgICAgY3VycmVudFF1ZXN0aW9uSW5kZXg9e2N1cnJlbnRRdWVzdGlvbkluZGV4fVxuICAgICAgICBhbnN3ZXJzPXthbnN3ZXJzfVxuICAgICAgICBxdWVzdGlvblN0YXRlcz17cXVlc3Rpb25TdGF0ZXN9XG4gICAgICAgIGhpZGVTdWJtaXRUYWI9e2hpZGVTdWJtaXRUYWJ9XG4gICAgICAgIG1pbkNvbnRlbnRIZWlnaHQ9e21pbkNvbnRlbnRIZWlnaHR9XG4gICAgICAgIG1pbkNvbnRlbnRXaWR0aD17bWluQ29udGVudFdpZHRofVxuICAgICAgICBvblVwZGF0ZVF1ZXN0aW9uU3RhdGU9e29uVXBkYXRlUXVlc3Rpb25TdGF0ZX1cbiAgICAgICAgb25BbnN3ZXI9e29uQW5zd2VyfVxuICAgICAgICBvblRleHRJbnB1dEZvY3VzPXtvblRleHRJbnB1dEZvY3VzfVxuICAgICAgICBvbkNhbmNlbD17b25DYW5jZWx9XG4gICAgICAgIG9uVGFiUHJldj17b25UYWJQcmV2fVxuICAgICAgICBvblRhYk5leHQ9e29uVGFiTmV4dH1cbiAgICAgICAgb25SZXNwb25kVG9DbGF1ZGU9e29uUmVzcG9uZFRvQ2xhdWRlfVxuICAgICAgICBvbkZpbmlzaFBsYW5JbnRlcnZpZXc9e29uRmluaXNoUGxhbkludGVydmlld31cbiAgICAgIC8+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgIG1hcmdpblRvcD17MH1cbiAgICAgIHRhYkluZGV4PXswfVxuICAgICAgYXV0b0ZvY3VzXG4gICAgICBvbktleURvd249e2hhbmRsZUtleURvd259XG4gICAgPlxuICAgICAge2lzSW5QbGFuTW9kZSAmJiBwbGFuRmlsZVBhdGggJiYgKFxuICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezB9PlxuICAgICAgICAgIDxEaXZpZGVyIGNvbG9yPVwiaW5hY3RpdmVcIiAvPlxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwiaW5hY3RpdmVcIj5cbiAgICAgICAgICAgIFBsYW5uaW5nOiA8RmlsZVBhdGhMaW5rIGZpbGVQYXRoPXtwbGFuRmlsZVBhdGh9IC8+XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgICA8Qm94IG1hcmdpblRvcD17LTF9PlxuICAgICAgICA8RGl2aWRlciBjb2xvcj1cImluYWN0aXZlXCIgLz5cbiAgICAgIDwvQm94PlxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgcGFkZGluZ1RvcD17MH0+XG4gICAgICAgIDxRdWVzdGlvbk5hdmlnYXRpb25CYXJcbiAgICAgICAgICBxdWVzdGlvbnM9e3F1ZXN0aW9uc31cbiAgICAgICAgICBjdXJyZW50UXVlc3Rpb25JbmRleD17Y3VycmVudFF1ZXN0aW9uSW5kZXh9XG4gICAgICAgICAgYW5zd2Vycz17YW5zd2Vyc31cbiAgICAgICAgICBoaWRlU3VibWl0VGFiPXtoaWRlU3VibWl0VGFifVxuICAgICAgICAvPlxuICAgICAgICA8UGVybWlzc2lvblJlcXVlc3RUaXRsZSB0aXRsZT17cXVlc3Rpb24ucXVlc3Rpb259IGNvbG9yPXsndGV4dCd9IC8+XG5cbiAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgbWluSGVpZ2h0PXttaW5Db250ZW50SGVpZ2h0fT5cbiAgICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgICB7cXVlc3Rpb24ubXVsdGlTZWxlY3QgPyAoXG4gICAgICAgICAgICAgIDxTZWxlY3RNdWx0aVxuICAgICAgICAgICAgICAgIGtleT17cXVlc3Rpb24ucXVlc3Rpb259XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e1xuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25TdGF0ZXNbcXVlc3Rpb24ucXVlc3Rpb25dPy5zZWxlY3RlZFZhbHVlIGFzXG4gICAgICAgICAgICAgICAgICAgIHwgc3RyaW5nW11cbiAgICAgICAgICAgICAgICAgICAgfCB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZXM6IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgICAgICAgICAgICBvblVwZGF0ZVF1ZXN0aW9uU3RhdGUoXG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgeyBzZWxlY3RlZFZhbHVlOiB2YWx1ZXMgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRJbnB1dCA9IHZhbHVlcy5pbmNsdWRlcygnX19vdGhlcl9fJylcbiAgICAgICAgICAgICAgICAgICAgPyBxdWVzdGlvblN0YXRlc1txdWVzdGlvblRleHRdPy50ZXh0SW5wdXRWYWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgY29uc3QgZmluYWxWYWx1ZXMgPSB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcih2ID0+IHYgIT09ICdfX290aGVyX18nKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KHRleHRJbnB1dCA/IFt0ZXh0SW5wdXRdIDogW10pXG4gICAgICAgICAgICAgICAgICBvbkFuc3dlcihxdWVzdGlvblRleHQsIGZpbmFsVmFsdWVzLCB1bmRlZmluZWQsIGZhbHNlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17aGFuZGxlRm9jdXN9XG4gICAgICAgICAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgIHN1Ym1pdEJ1dHRvblRleHQ9e1xuICAgICAgICAgICAgICAgICAgY3VycmVudFF1ZXN0aW9uSW5kZXggPT09IHF1ZXN0aW9ucy5sZW5ndGggLSAxXG4gICAgICAgICAgICAgICAgICAgID8gJ1N1Ym1pdCdcbiAgICAgICAgICAgICAgICAgICAgOiAnTmV4dCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb25TdWJtaXQ9e29uU3VibWl0fVxuICAgICAgICAgICAgICAgIG9uRG93bkZyb21MYXN0SXRlbT17aGFuZGxlRG93bkZyb21MYXN0SXRlbX1cbiAgICAgICAgICAgICAgICBpc0Rpc2FibGVkPXtpc0Zvb3RlckZvY3VzZWR9XG4gICAgICAgICAgICAgICAgb25PcGVuRWRpdG9yPXtoYW5kbGVPcGVuRWRpdG9yfVxuICAgICAgICAgICAgICAgIG9uSW1hZ2VQYXN0ZT17b25JbWFnZVBhc3RlfVxuICAgICAgICAgICAgICAgIHBhc3RlZENvbnRlbnRzPXtwYXN0ZWRDb250ZW50c31cbiAgICAgICAgICAgICAgICBvblJlbW92ZUltYWdlPXtvblJlbW92ZUltYWdlfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPFNlbGVjdFxuICAgICAgICAgICAgICAgIGtleT17cXVlc3Rpb24ucXVlc3Rpb259XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e1xuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25TdGF0ZXNbcXVlc3Rpb24ucXVlc3Rpb25dPy5zZWxlY3RlZFZhbHVlIGFzXG4gICAgICAgICAgICAgICAgICAgIHwgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIHwgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgb25VcGRhdGVRdWVzdGlvblN0YXRlKFxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvblRleHQsXG4gICAgICAgICAgICAgICAgICAgIHsgc2VsZWN0ZWRWYWx1ZTogdmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0SW5wdXQgPVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9PT0gJ19fb3RoZXJfXydcbiAgICAgICAgICAgICAgICAgICAgICA/IHF1ZXN0aW9uU3RhdGVzW3F1ZXN0aW9uVGV4dF0/LnRleHRJbnB1dFZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgIG9uQW5zd2VyKHF1ZXN0aW9uVGV4dCwgdmFsdWUsIHRleHRJbnB1dClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9e2hhbmRsZUZvY3VzfVxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXtvbkNhbmNlbH1cbiAgICAgICAgICAgICAgICBvbkRvd25Gcm9tTGFzdEl0ZW09e2hhbmRsZURvd25Gcm9tTGFzdEl0ZW19XG4gICAgICAgICAgICAgICAgaXNEaXNhYmxlZD17aXNGb290ZXJGb2N1c2VkfVxuICAgICAgICAgICAgICAgIGxheW91dD1cImNvbXBhY3QtdmVydGljYWxcIlxuICAgICAgICAgICAgICAgIG9uT3BlbkVkaXRvcj17aGFuZGxlT3BlbkVkaXRvcn1cbiAgICAgICAgICAgICAgICBvbkltYWdlUGFzdGU9e29uSW1hZ2VQYXN0ZX1cbiAgICAgICAgICAgICAgICBwYXN0ZWRDb250ZW50cz17cGFzdGVkQ29udGVudHN9XG4gICAgICAgICAgICAgICAgb25SZW1vdmVJbWFnZT17b25SZW1vdmVJbWFnZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgey8qIEZvb3RlciBzZWN0aW9uIC0gYWx3YXlzIHZpc2libGUsIHNlcGFyYXRlIGZyb20gU2VsZWN0ICovfVxuICAgICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICAgICAgPERpdmlkZXIgY29sb3I9XCJpbmFjdGl2ZVwiIC8+XG4gICAgICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJyb3dcIiBnYXA9ezF9PlxuICAgICAgICAgICAgICB7aXNGb290ZXJGb2N1c2VkICYmIGZvb3RlckluZGV4ID09PSAwID8gKFxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwic3VnZ2VzdGlvblwiPntmaWd1cmVzLnBvaW50ZXJ9PC9UZXh0PlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxUZXh0PiA8L1RleHQ+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDxUZXh0XG4gICAgICAgICAgICAgICAgY29sb3I9e1xuICAgICAgICAgICAgICAgICAgaXNGb290ZXJGb2N1c2VkICYmIGZvb3RlckluZGV4ID09PSAwXG4gICAgICAgICAgICAgICAgICAgID8gJ3N1Z2dlc3Rpb24nXG4gICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge29wdGlvbnMubGVuZ3RoICsgMX0uIENoYXQgYWJvdXQgdGhpc1xuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgIHtpc0luUGxhbk1vZGUgJiYgKFxuICAgICAgICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJyb3dcIiBnYXA9ezF9PlxuICAgICAgICAgICAgICAgIHtpc0Zvb3RlckZvY3VzZWQgJiYgZm9vdGVySW5kZXggPT09IDEgPyAoXG4gICAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cInN1Z2dlc3Rpb25cIj57ZmlndXJlcy5wb2ludGVyfTwvVGV4dD5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPFRleHQ+IDwvVGV4dD5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDxUZXh0XG4gICAgICAgICAgICAgICAgICBjb2xvcj17XG4gICAgICAgICAgICAgICAgICAgIGlzRm9vdGVyRm9jdXNlZCAmJiBmb290ZXJJbmRleCA9PT0gMVxuICAgICAgICAgICAgICAgICAgICAgID8gJ3N1Z2dlc3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7b3B0aW9ucy5sZW5ndGggKyAyfS4gU2tpcCBpbnRlcnZpZXcgYW5kIHBsYW4gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cImluYWN0aXZlXCIgZGltQ29sb3I+XG4gICAgICAgICAgICAgIEVudGVyIHRvIHNlbGVjdCDCt3snICd9XG4gICAgICAgICAgICAgIHtxdWVzdGlvbnMubGVuZ3RoID09PSAxID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7ZmlndXJlcy5hcnJvd1VwfS97ZmlndXJlcy5hcnJvd0Rvd259IHRvIG5hdmlnYXRlXG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgJ1RhYi9BcnJvdyBrZXlzIHRvIG5hdmlnYXRlJ1xuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7aXNPdGhlckZvY3VzZWQgJiYgZWRpdG9yTmFtZSAmJiAoXG4gICAgICAgICAgICAgICAgPD4gwrcgY3RybCtnIHRvIGVkaXQgaW4ge2VkaXRvck5hbWV9PC8+XG4gICAgICAgICAgICAgICl9eycgJ31cbiAgICAgICAgICAgICAgwrcgRXNjIHRvIGNhbmNlbFxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxPQUFPLE1BQU0sU0FBUztBQUM3QixPQUFPQyxLQUFLLElBQUlDLFdBQVcsRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDcEQsY0FBY0MsYUFBYSxRQUFRLHVDQUF1QztBQUMxRSxTQUFTQyxHQUFHLEVBQUVDLElBQUksUUFBUSxpQkFBaUI7QUFDM0MsU0FBU0MsV0FBVyxRQUFRLDRCQUE0QjtBQUN4RCxjQUNFQyxRQUFRLEVBQ1JDLGNBQWMsUUFDVCwyREFBMkQ7QUFDbEUsY0FBY0MsYUFBYSxRQUFRLDBCQUEwQjtBQUM3RCxTQUFTQyxpQkFBaUIsUUFBUSwwQkFBMEI7QUFDNUQsU0FBU0MsZ0JBQWdCLFFBQVEsdUJBQXVCO0FBQ3hELGNBQWNDLGVBQWUsUUFBUSxnQ0FBZ0M7QUFDckUsU0FBU0Msa0JBQWtCLFFBQVEsZ0NBQWdDO0FBQ25FLFNBQ0UsS0FBS0MscUJBQXFCLEVBQzFCQyxNQUFNLEVBQ05DLFdBQVcsUUFDTiw2QkFBNkI7QUFDcEMsU0FBU0MsT0FBTyxRQUFRLGdDQUFnQztBQUN4RCxTQUFTQyxZQUFZLFFBQVEsdUJBQXVCO0FBQ3BELFNBQVNDLHNCQUFzQixRQUFRLDhCQUE4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
