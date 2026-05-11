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
exports.call = void 0;
var compiler_runtime_1 = require("react/compiler-runtime");
var chalk_1 = require("chalk");
var React = require("react");
var ModelPicker_js_1 = require("../../components/ModelPicker.js");
var xml_js_1 = require("../../constants/xml.js");
var index_js_1 = require("../../services/analytics/index.js");
var AppState_js_1 = require("../../state/AppState.js");
var extraUsage_js_1 = require("../../utils/extraUsage.js");
var fastMode_js_1 = require("../../utils/fastMode.js");
var aliases_js_1 = require("../../utils/model/aliases.js");
var check1mAccess_js_1 = require("../../utils/model/check1mAccess.js");
var model_js_1 = require("../../utils/model/model.js");
var modelAllowlist_js_1 = require("../../utils/model/modelAllowlist.js");
var validateModel_js_1 = require("../../utils/model/validateModel.js");
function ModelPickerWrapper(t0) {
    var $ = (0, compiler_runtime_1.c)(17);
    var onDone = t0.onDone;
    var mainLoopModel = (0, AppState_js_1.useAppState)(_temp);
    var mainLoopModelForSession = (0, AppState_js_1.useAppState)(_temp2);
    var isFastMode = (0, AppState_js_1.useAppState)(_temp3);
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var t1;
    if ($[0] !== mainLoopModel || $[1] !== onDone) {
        t1 = function handleCancel() {
            (0, index_js_1.logEvent)("tengu_model_command_menu", {
                action: "cancel"
            });
            var displayModel = renderModelLabel(mainLoopModel);
            onDone("Kept model as ".concat(chalk_1.default.bold(displayModel)), {
                display: "system"
            });
        };
        $[0] = mainLoopModel;
        $[1] = onDone;
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var handleCancel = t1;
    var t2;
    if ($[3] !== isFastMode || $[4] !== mainLoopModel || $[5] !== onDone || $[6] !== setAppState) {
        t2 = function handleSelect(model, effort) {
            (0, index_js_1.logEvent)("tengu_model_command_menu", {
                action: model,
                from_model: mainLoopModel,
                to_model: model
            });
            setAppState(function (prev) { return (__assign(__assign({}, prev), { mainLoopModel: model, mainLoopModelForSession: null })); });
            var message = "Set model to ".concat(chalk_1.default.bold(renderModelLabel(model)));
            if (effort !== undefined) {
                message = message + " with ".concat(chalk_1.default.bold(effort), " effort");
            }
            var wasFastModeToggledOn = undefined;
            if ((0, fastMode_js_1.isFastModeEnabled)()) {
                (0, fastMode_js_1.clearFastModeCooldown)();
                if (!(0, fastMode_js_1.isFastModeSupportedByModel)(model) && isFastMode) {
                    setAppState(_temp4);
                    wasFastModeToggledOn = false;
                }
                else {
                    if ((0, fastMode_js_1.isFastModeSupportedByModel)(model) && (0, fastMode_js_1.isFastModeAvailable)() && isFastMode) {
                        message = message + " \xB7 Fast mode ON";
                        wasFastModeToggledOn = true;
                    }
                }
            }
            if ((0, extraUsage_js_1.isBilledAsExtraUsage)(model, wasFastModeToggledOn === true, (0, model_js_1.isOpus1mMergeEnabled)())) {
                message = message + " \xB7 Billed as extra usage";
            }
            if (wasFastModeToggledOn === false) {
                message = message + " \xB7 Fast mode OFF";
            }
            onDone(message);
        };
        $[3] = isFastMode;
        $[4] = mainLoopModel;
        $[5] = onDone;
        $[6] = setAppState;
        $[7] = t2;
    }
    else {
        t2 = $[7];
    }
    var handleSelect = t2;
    var t3;
    if ($[8] !== isFastMode || $[9] !== mainLoopModel) {
        t3 = (0, fastMode_js_1.isFastModeEnabled)() && isFastMode && (0, fastMode_js_1.isFastModeSupportedByModel)(mainLoopModel) && (0, fastMode_js_1.isFastModeAvailable)();
        $[8] = isFastMode;
        $[9] = mainLoopModel;
        $[10] = t3;
    }
    else {
        t3 = $[10];
    }
    var t4;
    if ($[11] !== handleCancel || $[12] !== handleSelect || $[13] !== mainLoopModel || $[14] !== mainLoopModelForSession || $[15] !== t3) {
        t4 = <ModelPicker_js_1.ModelPicker initial={mainLoopModel} sessionModel={mainLoopModelForSession} onSelect={handleSelect} onCancel={handleCancel} isStandaloneCommand={true} showFastModeNotice={t3}/>;
        $[11] = handleCancel;
        $[12] = handleSelect;
        $[13] = mainLoopModel;
        $[14] = mainLoopModelForSession;
        $[15] = t3;
        $[16] = t4;
    }
    else {
        t4 = $[16];
    }
    return t4;
}
function _temp4(prev_0) {
    return __assign(__assign({}, prev_0), { fastMode: false });
}
function _temp3(s_1) {
    return s_1.fastMode;
}
function _temp2(s_0) {
    return s_0.mainLoopModelForSession;
}
function _temp(s) {
    return s.mainLoopModel;
}
function SetModelAndClose(_a) {
    var args = _a.args, onDone = _a.onDone;
    var isFastMode = (0, AppState_js_1.useAppState)(function (s) { return s.fastMode; });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var model = args === 'default' ? null : args;
    React.useEffect(function () {
        function handleModelChange() {
            return __awaiter(this, void 0, void 0, function () {
                var _a, valid, error_0, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (model && !(0, modelAllowlist_js_1.isModelAllowed)(model)) {
                                onDone("Model '".concat(model, "' is not available. Your organization restricts model selection."), {
                                    display: 'system'
                                });
                                return [2 /*return*/];
                            }
                            // @[MODEL LAUNCH]: Update check for 1M access.
                            if (model && isOpus1mUnavailable(model)) {
                                onDone("Opus 4.6 with 1M context is not available for your account. Learn more: https://code.claude.com/docs/en/model-config#extended-context-with-1m", {
                                    display: 'system'
                                });
                                return [2 /*return*/];
                            }
                            if (model && isSonnet1mUnavailable(model)) {
                                onDone("Sonnet 4.6 with 1M context is not available for your account. Learn more: https://code.claude.com/docs/en/model-config#extended-context-with-1m", {
                                    display: 'system'
                                });
                                return [2 /*return*/];
                            }
                            // Skip validation for default model
                            if (!model) {
                                setModel(null);
                                return [2 /*return*/];
                            }
                            // Skip validation for known aliases - they're predefined and should work
                            if (isKnownAlias(model)) {
                                setModel(model);
                                return [2 /*return*/];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, validateModel_js_1.validateModel)(model)];
                        case 2:
                            _a = _b.sent(), valid = _a.valid, error_0 = _a.error;
                            if (valid) {
                                setModel(model);
                            }
                            else {
                                onDone(error_0 || "Model '".concat(model, "' not found"), {
                                    display: 'system'
                                });
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _b.sent();
                            onDone("Failed to validate model: ".concat(error_1.message), {
                                display: 'system'
                            });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        function setModel(modelValue) {
            setAppState(function (prev) { return (__assign(__assign({}, prev), { mainLoopModel: modelValue, mainLoopModelForSession: null })); });
            var message = "Set model to ".concat(chalk_1.default.bold(renderModelLabel(modelValue)));
            var wasFastModeToggledOn = undefined;
            if ((0, fastMode_js_1.isFastModeEnabled)()) {
                (0, fastMode_js_1.clearFastModeCooldown)();
                if (!(0, fastMode_js_1.isFastModeSupportedByModel)(modelValue) && isFastMode) {
                    setAppState(function (prev_0) { return (__assign(__assign({}, prev_0), { fastMode: false })); });
                    wasFastModeToggledOn = false;
                    // Do not update fast mode in settings since this is an automatic downgrade
                }
                else if ((0, fastMode_js_1.isFastModeSupportedByModel)(modelValue) && isFastMode) {
                    message += " \u00B7 Fast mode ON";
                    wasFastModeToggledOn = true;
                }
            }
            if ((0, extraUsage_js_1.isBilledAsExtraUsage)(modelValue, wasFastModeToggledOn === true, (0, model_js_1.isOpus1mMergeEnabled)())) {
                message += " \u00B7 Billed as extra usage";
            }
            if (wasFastModeToggledOn === false) {
                // Fast mode was toggled off, show suffix after extra usage billing
                message += " \u00B7 Fast mode OFF";
            }
            onDone(message);
        }
        void handleModelChange();
    }, [model, onDone, setAppState]);
    return null;
}
function isKnownAlias(model) {
    return aliases_js_1.MODEL_ALIASES.includes(model.toLowerCase().trim());
}
function isOpus1mUnavailable(model) {
    var m = model.toLowerCase();
    return !(0, check1mAccess_js_1.checkOpus1mAccess)() && !(0, model_js_1.isOpus1mMergeEnabled)() && m.includes('opus') && m.includes('[1m]');
}
function isSonnet1mUnavailable(model) {
    var m = model.toLowerCase();
    // Warn about Sonnet and Sonnet 4.6, but not Sonnet 4.5 since that had
    // a different access criteria.
    return !(0, check1mAccess_js_1.checkSonnet1mAccess)() && (m.includes('sonnet[1m]') || m.includes('sonnet-4-6[1m]'));
}
function ShowModelAndClose(t0) {
    var onDone = t0.onDone;
    var mainLoopModel = (0, AppState_js_1.useAppState)(_temp7);
    var mainLoopModelForSession = (0, AppState_js_1.useAppState)(_temp8);
    var effortValue = (0, AppState_js_1.useAppState)(_temp9);
    var displayModel = renderModelLabel(mainLoopModel);
    var effortInfo = effortValue !== undefined ? " (effort: ".concat(effortValue, ")") : "";
    if (mainLoopModelForSession) {
        onDone("Current model: ".concat(chalk_1.default.bold(renderModelLabel(mainLoopModelForSession)), " (session override from plan mode)\nBase model: ").concat(displayModel).concat(effortInfo));
    }
    else {
        onDone("Current model: ".concat(displayModel).concat(effortInfo));
    }
    return null;
}
function _temp9(s_1) {
    return s_1.effortValue;
}
function _temp8(s_0) {
    return s_0.mainLoopModelForSession;
}
function _temp7(s) {
    return s.mainLoopModel;
}
var call = function (onDone, _context, args) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        args = (args === null || args === void 0 ? void 0 : args.trim()) || '';
        if (xml_js_1.COMMON_INFO_ARGS.includes(args)) {
            (0, index_js_1.logEvent)('tengu_model_command_inline_help', {
                args: args
            });
            return [2 /*return*/, <ShowModelAndClose onDone={onDone}/>];
        }
        if (xml_js_1.COMMON_HELP_ARGS.includes(args)) {
            onDone('Run /model to open the model selection menu, or /model [modelName] to set the model.', {
                display: 'system'
            });
            return [2 /*return*/];
        }
        if (args) {
            (0, index_js_1.logEvent)('tengu_model_command_inline', {
                args: args
            });
            return [2 /*return*/, <SetModelAndClose args={args} onDone={onDone}/>];
        }
        return [2 /*return*/, <ModelPickerWrapper onDone={onDone}/>];
    });
}); };
exports.call = call;
function renderModelLabel(model) {
    var rendered = (0, model_js_1.renderDefaultModelSetting)(model !== null && model !== void 0 ? model : (0, model_js_1.getDefaultMainLoopModelSetting)());
    return model === null ? "".concat(rendered, " (default)") : rendered;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsIlJlYWN0IiwiQ29tbWFuZFJlc3VsdERpc3BsYXkiLCJNb2RlbFBpY2tlciIsIkNPTU1PTl9IRUxQX0FSR1MiLCJDT01NT05fSU5GT19BUkdTIiwiQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyIsImxvZ0V2ZW50IiwidXNlQXBwU3RhdGUiLCJ1c2VTZXRBcHBTdGF0ZSIsIkxvY2FsSlNYQ29tbWFuZENhbGwiLCJFZmZvcnRMZXZlbCIsImlzQmlsbGVkQXNFeHRyYVVzYWdlIiwiY2xlYXJGYXN0TW9kZUNvb2xkb3duIiwiaXNGYXN0TW9kZUF2YWlsYWJsZSIsImlzRmFzdE1vZGVFbmFibGVkIiwiaXNGYXN0TW9kZVN1cHBvcnRlZEJ5TW9kZWwiLCJNT0RFTF9BTElBU0VTIiwiY2hlY2tPcHVzMW1BY2Nlc3MiLCJjaGVja1Nvbm5ldDFtQWNjZXNzIiwiZ2V0RGVmYXVsdE1haW5Mb29wTW9kZWxTZXR0aW5nIiwiaXNPcHVzMW1NZXJnZUVuYWJsZWQiLCJyZW5kZXJEZWZhdWx0TW9kZWxTZXR0aW5nIiwiaXNNb2RlbEFsbG93ZWQiLCJ2YWxpZGF0ZU1vZGVsIiwiTW9kZWxQaWNrZXJXcmFwcGVyIiwidDAiLCIkIiwiX2MiLCJvbkRvbmUiLCJtYWluTG9vcE1vZGVsIiwiX3RlbXAiLCJtYWluTG9vcE1vZGVsRm9yU2Vzc2lvbiIsIl90ZW1wMiIsImlzRmFzdE1vZGUiLCJfdGVtcDMiLCJzZXRBcHBTdGF0ZSIsInQxIiwiaGFuZGxlQ2FuY2VsIiwiYWN0aW9uIiwiZGlzcGxheU1vZGVsIiwicmVuZGVyTW9kZWxMYWJlbCIsImJvbGQiLCJkaXNwbGF5IiwidDIiLCJoYW5kbGVTZWxlY3QiLCJtb2RlbCIsImVmZm9ydCIsImZyb21fbW9kZWwiLCJ0b19tb2RlbCIsInByZXYiLCJtZXNzYWdlIiwidW5kZWZpbmVkIiwid2FzRmFzdE1vZGVUb2dnbGVkT24iLCJfdGVtcDQiLCJ0MyIsInQ0IiwicHJldl8wIiwiZmFzdE1vZGUiLCJzXzEiLCJzIiwic18wIiwiU2V0TW9kZWxBbmRDbG9zZSIsImFyZ3MiLCJyZXN1bHQiLCJvcHRpb25zIiwiUmVhY3ROb2RlIiwidXNlRWZmZWN0IiwiaGFuZGxlTW9kZWxDaGFuZ2UiLCJQcm9taXNlIiwiaXNPcHVzMW1VbmF2YWlsYWJsZSIsImlzU29ubmV0MW1VbmF2YWlsYWJsZSIsInNldE1vZGVsIiwiaXNLbm93bkFsaWFzIiwidmFsaWQiLCJlcnJvciIsIkVycm9yIiwibW9kZWxWYWx1ZSIsImluY2x1ZGVzIiwidG9Mb3dlckNhc2UiLCJ0cmltIiwibSIsIlNob3dNb2RlbEFuZENsb3NlIiwiX3RlbXA3IiwiX3RlbXA4IiwiZWZmb3J0VmFsdWUiLCJfdGVtcDkiLCJlZmZvcnRJbmZvIiwiY2FsbCIsIl9jb250ZXh0IiwicmVuZGVyZWQiXSwic291cmNlcyI6WyJtb2RlbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENvbW1hbmRSZXN1bHREaXNwbGF5IH0gZnJvbSAnLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQgeyBNb2RlbFBpY2tlciB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvTW9kZWxQaWNrZXIuanMnXG5pbXBvcnQgeyBDT01NT05fSEVMUF9BUkdTLCBDT01NT05fSU5GT19BUkdTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3htbC5qcydcbmltcG9ydCB7XG4gIHR5cGUgQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyxcbiAgbG9nRXZlbnQsXG59IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FuYWx5dGljcy9pbmRleC5qcydcbmltcG9ydCB7IHVzZUFwcFN0YXRlLCB1c2VTZXRBcHBTdGF0ZSB9IGZyb20gJy4uLy4uL3N0YXRlL0FwcFN0YXRlLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDYWxsIH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcbmltcG9ydCB0eXBlIHsgRWZmb3J0TGV2ZWwgfSBmcm9tICcuLi8uLi91dGlscy9lZmZvcnQuanMnXG5pbXBvcnQgeyBpc0JpbGxlZEFzRXh0cmFVc2FnZSB9IGZyb20gJy4uLy4uL3V0aWxzL2V4dHJhVXNhZ2UuanMnXG5pbXBvcnQge1xuICBjbGVhckZhc3RNb2RlQ29vbGRvd24sXG4gIGlzRmFzdE1vZGVBdmFpbGFibGUsXG4gIGlzRmFzdE1vZGVFbmFibGVkLFxuICBpc0Zhc3RNb2RlU3VwcG9ydGVkQnlNb2RlbCxcbn0gZnJvbSAnLi4vLi4vdXRpbHMvZmFzdE1vZGUuanMnXG5pbXBvcnQgeyBNT0RFTF9BTElBU0VTIH0gZnJvbSAnLi4vLi4vdXRpbHMvbW9kZWwvYWxpYXNlcy5qcydcbmltcG9ydCB7XG4gIGNoZWNrT3B1czFtQWNjZXNzLFxuICBjaGVja1Nvbm5ldDFtQWNjZXNzLFxufSBmcm9tICcuLi8uLi91dGlscy9tb2RlbC9jaGVjazFtQWNjZXNzLmpzJ1xuaW1wb3J0IHtcbiAgZ2V0RGVmYXVsdE1haW5Mb29wTW9kZWxTZXR0aW5nLFxuICBpc09wdXMxbU1lcmdlRW5hYmxlZCxcbiAgcmVuZGVyRGVmYXVsdE1vZGVsU2V0dGluZyxcbn0gZnJvbSAnLi4vLi4vdXRpbHMvbW9kZWwvbW9kZWwuanMnXG5pbXBvcnQgeyBpc01vZGVsQWxsb3dlZCB9IGZyb20gJy4uLy4uL3V0aWxzL21vZGVsL21vZGVsQWxsb3dsaXN0LmpzJ1xuaW1wb3J0IHsgdmFsaWRhdGVNb2RlbCB9IGZyb20gJy4uLy4uL3V0aWxzL21vZGVsL3ZhbGlkYXRlTW9kZWwuanMnXG5cbmZ1bmN0aW9uIE1vZGVsUGlja2VyV3JhcHBlcih7XG4gIG9uRG9uZSxcbn06IHtcbiAgb25Eb25lOiAoXG4gICAgcmVzdWx0Pzogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7IGRpc3BsYXk/OiBDb21tYW5kUmVzdWx0RGlzcGxheSB9LFxuICApID0+IHZvaWRcbn0pOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBtYWluTG9vcE1vZGVsID0gdXNlQXBwU3RhdGUocyA9PiBzLm1haW5Mb29wTW9kZWwpXG4gIGNvbnN0IG1haW5Mb29wTW9kZWxGb3JTZXNzaW9uID0gdXNlQXBwU3RhdGUocyA9PiBzLm1haW5Mb29wTW9kZWxGb3JTZXNzaW9uKVxuICBjb25zdCBpc0Zhc3RNb2RlID0gdXNlQXBwU3RhdGUocyA9PiBzLmZhc3RNb2RlKVxuICBjb25zdCBzZXRBcHBTdGF0ZSA9IHVzZVNldEFwcFN0YXRlKClcblxuICBmdW5jdGlvbiBoYW5kbGVDYW5jZWwoKTogdm9pZCB7XG4gICAgbG9nRXZlbnQoJ3Rlbmd1X21vZGVsX2NvbW1hbmRfbWVudScsIHtcbiAgICAgIGFjdGlvbjpcbiAgICAgICAgJ2NhbmNlbCcgYXMgQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyxcbiAgICB9KVxuICAgIGNvbnN0IGRpc3BsYXlNb2RlbCA9IHJlbmRlck1vZGVsTGFiZWwobWFpbkxvb3BNb2RlbClcbiAgICBvbkRvbmUoYEtlcHQgbW9kZWwgYXMgJHtjaGFsay5ib2xkKGRpc3BsYXlNb2RlbCl9YCwge1xuICAgICAgZGlzcGxheTogJ3N5c3RlbScsXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVNlbGVjdChcbiAgICBtb2RlbDogc3RyaW5nIHwgbnVsbCxcbiAgICBlZmZvcnQ6IEVmZm9ydExldmVsIHwgdW5kZWZpbmVkLFxuICApOiB2b2lkIHtcbiAgICBsb2dFdmVudCgndGVuZ3VfbW9kZWxfY29tbWFuZF9tZW51Jywge1xuICAgICAgYWN0aW9uOlxuICAgICAgICBtb2RlbCBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICAgICAgZnJvbV9tb2RlbDpcbiAgICAgICAgbWFpbkxvb3BNb2RlbCBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICAgICAgdG9fbW9kZWw6XG4gICAgICAgIG1vZGVsIGFzIEFuYWx5dGljc01ldGFkYXRhX0lfVkVSSUZJRURfVEhJU19JU19OT1RfQ09ERV9PUl9GSUxFUEFUSFMsXG4gICAgfSlcbiAgICBzZXRBcHBTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAuLi5wcmV2LFxuICAgICAgbWFpbkxvb3BNb2RlbDogbW9kZWwsXG4gICAgICBtYWluTG9vcE1vZGVsRm9yU2Vzc2lvbjogbnVsbCxcbiAgICB9KSlcblxuICAgIGxldCBtZXNzYWdlID0gYFNldCBtb2RlbCB0byAke2NoYWxrLmJvbGQocmVuZGVyTW9kZWxMYWJlbChtb2RlbCkpfWBcbiAgICBpZiAoZWZmb3J0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1lc3NhZ2UgKz0gYCB3aXRoICR7Y2hhbGsuYm9sZChlZmZvcnQpfSBlZmZvcnRgXG4gICAgfVxuXG4gICAgLy8gVHVybiBvZmYgZmFzdCBtb2RlIGlmIHN3aXRjaGluZyB0byB1bnN1cHBvcnRlZCBtb2RlbFxuICAgIGxldCB3YXNGYXN0TW9kZVRvZ2dsZWRPbiA9IHVuZGVmaW5lZFxuICAgIGlmIChpc0Zhc3RNb2RlRW5hYmxlZCgpKSB7XG4gICAgICBjbGVhckZhc3RNb2RlQ29vbGRvd24oKVxuICAgICAgaWYgKCFpc0Zhc3RNb2RlU3VwcG9ydGVkQnlNb2RlbChtb2RlbCkgJiYgaXNGYXN0TW9kZSkge1xuICAgICAgICBzZXRBcHBTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICBmYXN0TW9kZTogZmFsc2UsXG4gICAgICAgIH0pKVxuICAgICAgICB3YXNGYXN0TW9kZVRvZ2dsZWRPbiA9IGZhbHNlXG4gICAgICAgIC8vIERvIG5vdCB1cGRhdGUgZmFzdCBtb2RlIGluIHNldHRpbmdzIHNpbmNlIHRoaXMgaXMgYW4gYXV0b21hdGljIGRvd25ncmFkZVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgaXNGYXN0TW9kZVN1cHBvcnRlZEJ5TW9kZWwobW9kZWwpICYmXG4gICAgICAgIGlzRmFzdE1vZGVBdmFpbGFibGUoKSAmJlxuICAgICAgICBpc0Zhc3RNb2RlXG4gICAgICApIHtcbiAgICAgICAgbWVzc2FnZSArPSBgIMK3IEZhc3QgbW9kZSBPTmBcbiAgICAgICAgd2FzRmFzdE1vZGVUb2dnbGVkT24gPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgaXNCaWxsZWRBc0V4dHJhVXNhZ2UoXG4gICAgICAgIG1vZGVsLFxuICAgICAgICB3YXNGYXN0TW9kZVRvZ2dsZWRPbiA9PT0gdHJ1ZSxcbiAgICAgICAgaXNPcHVzMW1NZXJnZUVuYWJsZWQoKSxcbiAgICAgIClcbiAgICApIHtcbiAgICAgIG1lc3NhZ2UgKz0gYCDCtyBCaWxsZWQgYXMgZXh0cmEgdXNhZ2VgXG4gICAgfVxuXG4gICAgaWYgKHdhc0Zhc3RNb2RlVG9nZ2xlZE9uID09PSBmYWxzZSkge1xuICAgICAgLy8gRmFzdCBtb2RlIHdhcyB0b2dnbGVkIG9mZiwgc2hvdyBzdWZmaXggYWZ0ZXIgZXh0cmEgdXNhZ2UgYmlsbGluZ1xuICAgICAgbWVzc2FnZSArPSBgIMK3IEZhc3QgbW9kZSBPRkZgXG4gICAgfVxuXG4gICAgb25Eb25lKG1lc3NhZ2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxNb2RlbFBpY2tlclxuICAgICAgaW5pdGlhbD17bWFpbkxvb3BNb2RlbH1cbiAgICAgIHNlc3Npb25Nb2RlbD17bWFpbkxvb3BNb2RlbEZvclNlc3Npb259XG4gICAgICBvblNlbGVjdD17aGFuZGxlU2VsZWN0fVxuICAgICAgb25DYW5jZWw9e2hhbmRsZUNhbmNlbH1cbiAgICAgIGlzU3RhbmRhbG9uZUNvbW1hbmRcbiAgICAgIHNob3dGYXN0TW9kZU5vdGljZT17XG4gICAgICAgIGlzRmFzdE1vZGVFbmFibGVkKCkgJiZcbiAgICAgICAgaXNGYXN0TW9kZSAmJlxuICAgICAgICBpc0Zhc3RNb2RlU3VwcG9ydGVkQnlNb2RlbChtYWluTG9vcE1vZGVsKSAmJlxuICAgICAgICBpc0Zhc3RNb2RlQXZhaWxhYmxlKClcbiAgICAgIH1cbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIFNldE1vZGVsQW5kQ2xvc2Uoe1xuICBhcmdzLFxuICBvbkRvbmUsXG59OiB7XG4gIGFyZ3M6IHN0cmluZ1xuICBvbkRvbmU6IChcbiAgICByZXN1bHQ/OiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IHsgZGlzcGxheT86IENvbW1hbmRSZXN1bHREaXNwbGF5IH0sXG4gICkgPT4gdm9pZFxufSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IGlzRmFzdE1vZGUgPSB1c2VBcHBTdGF0ZShzID0+IHMuZmFzdE1vZGUpXG4gIGNvbnN0IHNldEFwcFN0YXRlID0gdXNlU2V0QXBwU3RhdGUoKVxuICBjb25zdCBtb2RlbCA9IGFyZ3MgPT09ICdkZWZhdWx0JyA/IG51bGwgOiBhcmdzXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVNb2RlbENoYW5nZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIGlmIChtb2RlbCAmJiAhaXNNb2RlbEFsbG93ZWQobW9kZWwpKSB7XG4gICAgICAgIG9uRG9uZShcbiAgICAgICAgICBgTW9kZWwgJyR7bW9kZWx9JyBpcyBub3QgYXZhaWxhYmxlLiBZb3VyIG9yZ2FuaXphdGlvbiByZXN0cmljdHMgbW9kZWwgc2VsZWN0aW9uLmAsXG4gICAgICAgICAgeyBkaXNwbGF5OiAnc3lzdGVtJyB9LFxuICAgICAgICApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBAW01PREVMIExBVU5DSF06IFVwZGF0ZSBjaGVjayBmb3IgMU0gYWNjZXNzLlxuICAgICAgaWYgKG1vZGVsICYmIGlzT3B1czFtVW5hdmFpbGFibGUobW9kZWwpKSB7XG4gICAgICAgIG9uRG9uZShcbiAgICAgICAgICBgT3B1cyA0LjYgd2l0aCAxTSBjb250ZXh0IGlzIG5vdCBhdmFpbGFibGUgZm9yIHlvdXIgYWNjb3VudC4gTGVhcm4gbW9yZTogaHR0cHM6Ly9jb2RlLmNsYXVkZS5jb20vZG9jcy9lbi9tb2RlbC1jb25maWcjZXh0ZW5kZWQtY29udGV4dC13aXRoLTFtYCxcbiAgICAgICAgICB7IGRpc3BsYXk6ICdzeXN0ZW0nIH0sXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChtb2RlbCAmJiBpc1Nvbm5ldDFtVW5hdmFpbGFibGUobW9kZWwpKSB7XG4gICAgICAgIG9uRG9uZShcbiAgICAgICAgICBgU29ubmV0IDQuNiB3aXRoIDFNIGNvbnRleHQgaXMgbm90IGF2YWlsYWJsZSBmb3IgeW91ciBhY2NvdW50LiBMZWFybiBtb3JlOiBodHRwczovL2NvZGUuY2xhdWRlLmNvbS9kb2NzL2VuL21vZGVsLWNvbmZpZyNleHRlbmRlZC1jb250ZXh0LXdpdGgtMW1gLFxuICAgICAgICAgIHsgZGlzcGxheTogJ3N5c3RlbScgfSxcbiAgICAgICAgKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCB2YWxpZGF0aW9uIGZvciBkZWZhdWx0IG1vZGVsXG4gICAgICBpZiAoIW1vZGVsKSB7XG4gICAgICAgIHNldE1vZGVsKG51bGwpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIHZhbGlkYXRpb24gZm9yIGtub3duIGFsaWFzZXMgLSB0aGV5J3JlIHByZWRlZmluZWQgYW5kIHNob3VsZCB3b3JrXG4gICAgICBpZiAoaXNLbm93bkFsaWFzKG1vZGVsKSkge1xuICAgICAgICBzZXRNb2RlbChtb2RlbClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIFZhbGlkYXRlIGFuZCBzZXQgY3VzdG9tIG1vZGVsXG4gICAgICB0cnkge1xuICAgICAgICAvLyBEb24ndCB1c2UgcGFyc2VVc2VyU3BlY2lmaWVkTW9kZWwgZm9yIG5vbi1hbGlhc2VzIHNpbmNlIGl0IGxvd2VyY2FzZXMgdGhlIGlucHV0XG4gICAgICAgIC8vIGFuZCBtb2RlbCBuYW1lcyBhcmUgY2FzZS1zZW5zaXRpdmVcbiAgICAgICAgY29uc3QgeyB2YWxpZCwgZXJyb3IgfSA9IGF3YWl0IHZhbGlkYXRlTW9kZWwobW9kZWwpXG5cbiAgICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgICAgc2V0TW9kZWwobW9kZWwpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb25Eb25lKGVycm9yIHx8IGBNb2RlbCAnJHttb2RlbH0nIG5vdCBmb3VuZGAsIHtcbiAgICAgICAgICAgIGRpc3BsYXk6ICdzeXN0ZW0nLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIG9uRG9uZShgRmFpbGVkIHRvIHZhbGlkYXRlIG1vZGVsOiAkeyhlcnJvciBhcyBFcnJvcikubWVzc2FnZX1gLCB7XG4gICAgICAgICAgZGlzcGxheTogJ3N5c3RlbScsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0TW9kZWwobW9kZWxWYWx1ZTogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICAgICAgc2V0QXBwU3RhdGUocHJldiA9PiAoe1xuICAgICAgICAuLi5wcmV2LFxuICAgICAgICBtYWluTG9vcE1vZGVsOiBtb2RlbFZhbHVlLFxuICAgICAgICBtYWluTG9vcE1vZGVsRm9yU2Vzc2lvbjogbnVsbCxcbiAgICAgIH0pKVxuICAgICAgbGV0IG1lc3NhZ2UgPSBgU2V0IG1vZGVsIHRvICR7Y2hhbGsuYm9sZChyZW5kZXJNb2RlbExhYmVsKG1vZGVsVmFsdWUpKX1gXG5cbiAgICAgIGxldCB3YXNGYXN0TW9kZVRvZ2dsZWRPbiA9IHVuZGVmaW5lZFxuICAgICAgaWYgKGlzRmFzdE1vZGVFbmFibGVkKCkpIHtcbiAgICAgICAgY2xlYXJGYXN0TW9kZUNvb2xkb3duKClcbiAgICAgICAgaWYgKCFpc0Zhc3RNb2RlU3VwcG9ydGVkQnlNb2RlbChtb2RlbFZhbHVlKSAmJiBpc0Zhc3RNb2RlKSB7XG4gICAgICAgICAgc2V0QXBwU3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGZhc3RNb2RlOiBmYWxzZSxcbiAgICAgICAgICB9KSlcbiAgICAgICAgICB3YXNGYXN0TW9kZVRvZ2dsZWRPbiA9IGZhbHNlXG4gICAgICAgICAgLy8gRG8gbm90IHVwZGF0ZSBmYXN0IG1vZGUgaW4gc2V0dGluZ3Mgc2luY2UgdGhpcyBpcyBhbiBhdXRvbWF0aWMgZG93bmdyYWRlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNGYXN0TW9kZVN1cHBvcnRlZEJ5TW9kZWwobW9kZWxWYWx1ZSkgJiYgaXNGYXN0TW9kZSkge1xuICAgICAgICAgIG1lc3NhZ2UgKz0gYCDCtyBGYXN0IG1vZGUgT05gXG4gICAgICAgICAgd2FzRmFzdE1vZGVUb2dnbGVkT24gPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICBpc0JpbGxlZEFzRXh0cmFVc2FnZShcbiAgICAgICAgICBtb2RlbFZhbHVlLFxuICAgICAgICAgIHdhc0Zhc3RNb2RlVG9nZ2xlZE9uID09PSB0cnVlLFxuICAgICAgICAgIGlzT3B1czFtTWVyZ2VFbmFibGVkKCksXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICBtZXNzYWdlICs9IGAgwrcgQmlsbGVkIGFzIGV4dHJhIHVzYWdlYFxuICAgICAgfVxuXG4gICAgICBpZiAod2FzRmFzdE1vZGVUb2dnbGVkT24gPT09IGZhbHNlKSB7XG4gICAgICAgIC8vIEZhc3QgbW9kZSB3YXMgdG9nZ2xlZCBvZmYsIHNob3cgc3VmZml4IGFmdGVyIGV4dHJhIHVzYWdlIGJpbGxpbmdcbiAgICAgICAgbWVzc2FnZSArPSBgIMK3IEZhc3QgbW9kZSBPRkZgXG4gICAgICB9XG5cbiAgICAgIG9uRG9uZShtZXNzYWdlKVxuICAgIH1cblxuICAgIHZvaWQgaGFuZGxlTW9kZWxDaGFuZ2UoKVxuICB9LCBbbW9kZWwsIG9uRG9uZSwgc2V0QXBwU3RhdGVdKVxuXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGlzS25vd25BbGlhcyhtb2RlbDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAoTU9ERUxfQUxJQVNFUyBhcyByZWFkb25seSBzdHJpbmdbXSkuaW5jbHVkZXMoXG4gICAgbW9kZWwudG9Mb3dlckNhc2UoKS50cmltKCksXG4gIClcbn1cblxuZnVuY3Rpb24gaXNPcHVzMW1VbmF2YWlsYWJsZShtb2RlbDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IG0gPSBtb2RlbC50b0xvd2VyQ2FzZSgpXG4gIHJldHVybiAoXG4gICAgIWNoZWNrT3B1czFtQWNjZXNzKCkgJiZcbiAgICAhaXNPcHVzMW1NZXJnZUVuYWJsZWQoKSAmJlxuICAgIG0uaW5jbHVkZXMoJ29wdXMnKSAmJlxuICAgIG0uaW5jbHVkZXMoJ1sxbV0nKVxuICApXG59XG5cbmZ1bmN0aW9uIGlzU29ubmV0MW1VbmF2YWlsYWJsZShtb2RlbDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IG0gPSBtb2RlbC50b0xvd2VyQ2FzZSgpXG4gIC8vIFdhcm4gYWJvdXQgU29ubmV0IGFuZCBTb25uZXQgNC42LCBidXQgbm90IFNvbm5ldCA0LjUgc2luY2UgdGhhdCBoYWRcbiAgLy8gYSBkaWZmZXJlbnQgYWNjZXNzIGNyaXRlcmlhLlxuICByZXR1cm4gKFxuICAgICFjaGVja1Nvbm5ldDFtQWNjZXNzKCkgJiZcbiAgICAobS5pbmNsdWRlcygnc29ubmV0WzFtXScpIHx8IG0uaW5jbHVkZXMoJ3Nvbm5ldC00LTZbMW1dJykpXG4gIClcbn1cblxuZnVuY3Rpb24gU2hvd01vZGVsQW5kQ2xvc2Uoe1xuICBvbkRvbmUsXG59OiB7XG4gIG9uRG9uZTogKHJlc3VsdD86IHN0cmluZykgPT4gdm9pZFxufSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IG1haW5Mb29wTW9kZWwgPSB1c2VBcHBTdGF0ZShzID0+IHMubWFpbkxvb3BNb2RlbClcbiAgY29uc3QgbWFpbkxvb3BNb2RlbEZvclNlc3Npb24gPSB1c2VBcHBTdGF0ZShzID0+IHMubWFpbkxvb3BNb2RlbEZvclNlc3Npb24pXG4gIGNvbnN0IGVmZm9ydFZhbHVlID0gdXNlQXBwU3RhdGUocyA9PiBzLmVmZm9ydFZhbHVlKVxuICBjb25zdCBkaXNwbGF5TW9kZWwgPSByZW5kZXJNb2RlbExhYmVsKG1haW5Mb29wTW9kZWwpXG4gIGNvbnN0IGVmZm9ydEluZm8gPVxuICAgIGVmZm9ydFZhbHVlICE9PSB1bmRlZmluZWQgPyBgIChlZmZvcnQ6ICR7ZWZmb3J0VmFsdWV9KWAgOiAnJ1xuXG4gIGlmIChtYWluTG9vcE1vZGVsRm9yU2Vzc2lvbikge1xuICAgIG9uRG9uZShcbiAgICAgIGBDdXJyZW50IG1vZGVsOiAke2NoYWxrLmJvbGQocmVuZGVyTW9kZWxMYWJlbChtYWluTG9vcE1vZGVsRm9yU2Vzc2lvbikpfSAoc2Vzc2lvbiBvdmVycmlkZSBmcm9tIHBsYW4gbW9kZSlcXG5CYXNlIG1vZGVsOiAke2Rpc3BsYXlNb2RlbH0ke2VmZm9ydEluZm99YCxcbiAgICApXG4gIH0gZWxzZSB7XG4gICAgb25Eb25lKGBDdXJyZW50IG1vZGVsOiAke2Rpc3BsYXlNb2RlbH0ke2VmZm9ydEluZm99YClcbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBjb25zdCBjYWxsOiBMb2NhbEpTWENvbW1hbmRDYWxsID0gYXN5bmMgKG9uRG9uZSwgX2NvbnRleHQsIGFyZ3MpID0+IHtcbiAgYXJncyA9IGFyZ3M/LnRyaW0oKSB8fCAnJ1xuICBpZiAoQ09NTU9OX0lORk9fQVJHUy5pbmNsdWRlcyhhcmdzKSkge1xuICAgIGxvZ0V2ZW50KCd0ZW5ndV9tb2RlbF9jb21tYW5kX2lubGluZV9oZWxwJywge1xuICAgICAgYXJnczogYXJncyBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICAgIH0pXG4gICAgcmV0dXJuIDxTaG93TW9kZWxBbmRDbG9zZSBvbkRvbmU9e29uRG9uZX0gLz5cbiAgfVxuICBpZiAoQ09NTU9OX0hFTFBfQVJHUy5pbmNsdWRlcyhhcmdzKSkge1xuICAgIG9uRG9uZShcbiAgICAgICdSdW4gL21vZGVsIHRvIG9wZW4gdGhlIG1vZGVsIHNlbGVjdGlvbiBtZW51LCBvciAvbW9kZWwgW21vZGVsTmFtZV0gdG8gc2V0IHRoZSBtb2RlbC4nLFxuICAgICAgeyBkaXNwbGF5OiAnc3lzdGVtJyB9LFxuICAgIClcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChhcmdzKSB7XG4gICAgbG9nRXZlbnQoJ3Rlbmd1X21vZGVsX2NvbW1hbmRfaW5saW5lJywge1xuICAgICAgYXJnczogYXJncyBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICAgIH0pXG4gICAgcmV0dXJuIDxTZXRNb2RlbEFuZENsb3NlIGFyZ3M9e2FyZ3N9IG9uRG9uZT17b25Eb25lfSAvPlxuICB9XG5cbiAgcmV0dXJuIDxNb2RlbFBpY2tlcldyYXBwZXIgb25Eb25lPXtvbkRvbmV9IC8+XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1vZGVsTGFiZWwobW9kZWw6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlZCA9IHJlbmRlckRlZmF1bHRNb2RlbFNldHRpbmcoXG4gICAgbW9kZWwgPz8gZ2V0RGVmYXVsdE1haW5Mb29wTW9kZWxTZXR0aW5nKCksXG4gIClcbiAgcmV0dXJuIG1vZGVsID09PSBudWxsID8gYCR7cmVuZGVyZWR9IChkZWZhdWx0KWAgOiByZW5kZXJlZFxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsS0FBSyxNQUFNLE9BQU87QUFDekIsT0FBTyxLQUFLQyxLQUFLLE1BQU0sT0FBTztBQUM5QixjQUFjQyxvQkFBb0IsUUFBUSxtQkFBbUI7QUFDN0QsU0FBU0MsV0FBVyxRQUFRLGlDQUFpQztBQUM3RCxTQUFT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
