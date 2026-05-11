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
exports.GenerateStep = GenerateStep;
var sdk_1 = require("@anthropic-ai/sdk");
var react_1 = require("react");
var useMainLoopModel_js_1 = require("../../../../hooks/useMainLoopModel.js");
var ink_js_1 = require("../../../../ink.js");
var useKeybinding_js_1 = require("../../../../keybindings/useKeybinding.js");
var abortController_js_1 = require("../../../../utils/abortController.js");
var promptEditor_js_1 = require("../../../../utils/promptEditor.js");
var ConfigurableShortcutHint_js_1 = require("../../../ConfigurableShortcutHint.js");
var Byline_js_1 = require("../../../design-system/Byline.js");
var Spinner_js_1 = require("../../../Spinner.js");
var TextInput_js_1 = require("../../../TextInput.js");
var index_js_1 = require("../../../wizard/index.js");
var WizardDialogLayout_js_1 = require("../../../wizard/WizardDialogLayout.js");
var generateAgent_js_1 = require("../../generateAgent.js");
function GenerateStep() {
    var _this = this;
    var _a = (0, index_js_1.useWizard)(), updateWizardData = _a.updateWizardData, goBack = _a.goBack, goToStep = _a.goToStep, wizardData = _a.wizardData;
    var _b = (0, react_1.useState)(wizardData.generationPrompt || ''), prompt = _b[0], setPrompt = _b[1];
    var _c = (0, react_1.useState)(false), isGenerating = _c[0], setIsGenerating = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(prompt.length), cursorOffset = _e[0], setCursorOffset = _e[1];
    var model = (0, useMainLoopModel_js_1.useMainLoopModel)();
    var abortControllerRef = (0, react_1.useRef)(null);
    // Cancel generation when escape pressed during generation
    var handleCancelGeneration = (0, react_1.useCallback)(function () {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsGenerating(false);
            setError('Generation cancelled');
        }
    }, []);
    // Use Settings context so 'n' key doesn't cancel (allows typing 'n' in prompt input)
    (0, useKeybinding_js_1.useKeybinding)('confirm:no', handleCancelGeneration, {
        context: 'Settings',
        isActive: isGenerating
    });
    var handleExternalEditor = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promptEditor_js_1.editPromptInEditor)(prompt)];
                case 1:
                    result = _a.sent();
                    if (result.content !== null) {
                        setPrompt(result.content);
                        setCursorOffset(result.content.length);
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [prompt]);
    (0, useKeybinding_js_1.useKeybinding)('chat:externalEditor', handleExternalEditor, {
        context: 'Chat',
        isActive: !isGenerating
    });
    // Go back when escape pressed while not generating
    var handleGoBack = (0, react_1.useCallback)(function () {
        updateWizardData({
            generationPrompt: '',
            agentType: '',
            systemPrompt: '',
            whenToUse: '',
            generatedAgent: undefined,
            wasGenerated: false
        });
        setPrompt('');
        setError(null);
        goBack();
    }, [updateWizardData, goBack]);
    // Use Settings context so 'n' key doesn't cancel (allows typing 'n' in prompt input)
    (0, useKeybinding_js_1.useKeybinding)('confirm:no', handleGoBack, {
        context: 'Settings',
        isActive: !isGenerating
    });
    var handleGenerate = function () { return __awaiter(_this, void 0, void 0, function () {
        var trimmedPrompt, controller, generated, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trimmedPrompt = prompt.trim();
                    if (!trimmedPrompt) {
                        setError('Please describe what the agent should do');
                        return [2 /*return*/];
                    }
                    setError(null);
                    setIsGenerating(true);
                    updateWizardData({
                        generationPrompt: trimmedPrompt,
                        isGenerating: true
                    });
                    controller = (0, abortController_js_1.createAbortController)();
                    abortControllerRef.current = controller;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, generateAgent_js_1.generateAgent)(trimmedPrompt, model, [], controller.signal)];
                case 2:
                    generated = _a.sent();
                    updateWizardData({
                        agentType: generated.identifier,
                        whenToUse: generated.whenToUse,
                        systemPrompt: generated.systemPrompt,
                        generatedAgent: generated,
                        isGenerating: false,
                        wasGenerated: true
                    });
                    // Skip directly to ToolsStep (index 6) - matching original flow
                    goToStep(6);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    // Don't show error if it was cancelled (already set in escape handler)
                    if (err_1 instanceof sdk_1.APIUserAbortError) {
                        // User cancelled - no error to show
                    }
                    else if (err_1 instanceof Error && !err_1.message.includes('No assistant message found')) {
                        setError(err_1.message || 'Failed to generate agent');
                    }
                    updateWizardData({
                        isGenerating: false
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsGenerating(false);
                    abortControllerRef.current = null;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var subtitle = 'Describe what this agent should do and when it should be used (be comprehensive for best results)';
    if (isGenerating) {
        return <WizardDialogLayout_js_1.WizardDialogLayout subtitle={subtitle} footerText={<ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel"/>}>
        <ink_js_1.Box flexDirection="row" alignItems="center">
          <Spinner_js_1.Spinner />
          <ink_js_1.Text color="suggestion"> Generating agent from description...</ink_js_1.Text>
        </ink_js_1.Box>
      </WizardDialogLayout_js_1.WizardDialogLayout>;
    }
    return <WizardDialogLayout_js_1.WizardDialogLayout subtitle={subtitle} footerText={<Byline_js_1.Byline>
          <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:yes" context="Confirmation" fallback="Enter" description="submit"/>
          <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="chat:externalEditor" context="Chat" fallback="ctrl+g" description="open in editor"/>
          <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="go back"/>
        </Byline_js_1.Byline>}>
      <ink_js_1.Box flexDirection="column">
        {error && <ink_js_1.Box marginBottom={1}>
            <ink_js_1.Text color="error">{error}</ink_js_1.Text>
          </ink_js_1.Box>}
        <TextInput_js_1.default value={prompt} onChange={setPrompt} onSubmit={handleGenerate} placeholder="e.g., Help me write unit tests for my code..." columns={80} cursorOffset={cursorOffset} onChangeCursorOffset={setCursorOffset} focus showCursor/>
      </ink_js_1.Box>
    </WizardDialogLayout_js_1.WizardDialogLayout>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBUElVc2VyQWJvcnRFcnJvciIsIlJlYWN0IiwiUmVhY3ROb2RlIiwidXNlQ2FsbGJhY2siLCJ1c2VSZWYiLCJ1c2VTdGF0ZSIsInVzZU1haW5Mb29wTW9kZWwiLCJCb3giLCJUZXh0IiwidXNlS2V5YmluZGluZyIsImNyZWF0ZUFib3J0Q29udHJvbGxlciIsImVkaXRQcm9tcHRJbkVkaXRvciIsIkNvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCIsIkJ5bGluZSIsIlNwaW5uZXIiLCJUZXh0SW5wdXQiLCJ1c2VXaXphcmQiLCJXaXphcmREaWFsb2dMYXlvdXQiLCJnZW5lcmF0ZUFnZW50IiwiQWdlbnRXaXphcmREYXRhIiwiR2VuZXJhdGVTdGVwIiwidXBkYXRlV2l6YXJkRGF0YSIsImdvQmFjayIsImdvVG9TdGVwIiwid2l6YXJkRGF0YSIsInByb21wdCIsInNldFByb21wdCIsImdlbmVyYXRpb25Qcm9tcHQiLCJpc0dlbmVyYXRpbmciLCJzZXRJc0dlbmVyYXRpbmciLCJlcnJvciIsInNldEVycm9yIiwiY3Vyc29yT2Zmc2V0Iiwic2V0Q3Vyc29yT2Zmc2V0IiwibGVuZ3RoIiwibW9kZWwiLCJhYm9ydENvbnRyb2xsZXJSZWYiLCJBYm9ydENvbnRyb2xsZXIiLCJoYW5kbGVDYW5jZWxHZW5lcmF0aW9uIiwiY3VycmVudCIsImFib3J0IiwiY29udGV4dCIsImlzQWN0aXZlIiwiaGFuZGxlRXh0ZXJuYWxFZGl0b3IiLCJyZXN1bHQiLCJjb250ZW50IiwiaGFuZGxlR29CYWNrIiwiYWdlbnRUeXBlIiwic3lzdGVtUHJvbXB0Iiwid2hlblRvVXNlIiwiZ2VuZXJhdGVkQWdlbnQiLCJ1bmRlZmluZWQiLCJ3YXNHZW5lcmF0ZWQiLCJoYW5kbGVHZW5lcmF0ZSIsIlByb21pc2UiLCJ0cmltbWVkUHJvbXB0IiwidHJpbSIsImNvbnRyb2xsZXIiLCJnZW5lcmF0ZWQiLCJzaWduYWwiLCJpZGVudGlmaWVyIiwiZXJyIiwiRXJyb3IiLCJtZXNzYWdlIiwiaW5jbHVkZXMiLCJzdWJ0aXRsZSJdLCJzb3VyY2VzIjpbIkdlbmVyYXRlU3RlcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJVXNlckFib3J0RXJyb3IgfSBmcm9tICdAYW50aHJvcGljLWFpL3NkaydcbmltcG9ydCBSZWFjdCwgeyB0eXBlIFJlYWN0Tm9kZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZU1haW5Mb29wTW9kZWwgfSBmcm9tICcuLi8uLi8uLi8uLi9ob29rcy91c2VNYWluTG9vcE1vZGVsLmpzJ1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vaW5rLmpzJ1xuaW1wb3J0IHsgdXNlS2V5YmluZGluZyB9IGZyb20gJy4uLy4uLy4uLy4uL2tleWJpbmRpbmdzL3VzZUtleWJpbmRpbmcuanMnXG5pbXBvcnQgeyBjcmVhdGVBYm9ydENvbnRyb2xsZXIgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9hYm9ydENvbnRyb2xsZXIuanMnXG5pbXBvcnQgeyBlZGl0UHJvbXB0SW5FZGl0b3IgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9wcm9tcHRFZGl0b3IuanMnXG5pbXBvcnQgeyBDb25maWd1cmFibGVTaG9ydGN1dEhpbnQgfSBmcm9tICcuLi8uLi8uLi9Db25maWd1cmFibGVTaG9ydGN1dEhpbnQuanMnXG5pbXBvcnQgeyBCeWxpbmUgfSBmcm9tICcuLi8uLi8uLi9kZXNpZ24tc3lzdGVtL0J5bGluZS5qcydcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi8uLi8uLi9TcGlubmVyLmpzJ1xuaW1wb3J0IFRleHRJbnB1dCBmcm9tICcuLi8uLi8uLi9UZXh0SW5wdXQuanMnXG5pbXBvcnQgeyB1c2VXaXphcmQgfSBmcm9tICcuLi8uLi8uLi93aXphcmQvaW5kZXguanMnXG5pbXBvcnQgeyBXaXphcmREaWFsb2dMYXlvdXQgfSBmcm9tICcuLi8uLi8uLi93aXphcmQvV2l6YXJkRGlhbG9nTGF5b3V0LmpzJ1xuaW1wb3J0IHsgZ2VuZXJhdGVBZ2VudCB9IGZyb20gJy4uLy4uL2dlbmVyYXRlQWdlbnQuanMnXG5pbXBvcnQgdHlwZSB7IEFnZW50V2l6YXJkRGF0YSB9IGZyb20gJy4uL3R5cGVzLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gR2VuZXJhdGVTdGVwKCk6IFJlYWN0Tm9kZSB7XG4gIGNvbnN0IHsgdXBkYXRlV2l6YXJkRGF0YSwgZ29CYWNrLCBnb1RvU3RlcCwgd2l6YXJkRGF0YSB9ID1cbiAgICB1c2VXaXphcmQ8QWdlbnRXaXphcmREYXRhPigpXG4gIGNvbnN0IFtwcm9tcHQsIHNldFByb21wdF0gPSB1c2VTdGF0ZSh3aXphcmREYXRhLmdlbmVyYXRpb25Qcm9tcHQgfHwgJycpXG4gIGNvbnN0IFtpc0dlbmVyYXRpbmcsIHNldElzR2VuZXJhdGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbY3Vyc29yT2Zmc2V0LCBzZXRDdXJzb3JPZmZzZXRdID0gdXNlU3RhdGUocHJvbXB0Lmxlbmd0aClcbiAgY29uc3QgbW9kZWwgPSB1c2VNYWluTG9vcE1vZGVsKClcbiAgY29uc3QgYWJvcnRDb250cm9sbGVyUmVmID0gdXNlUmVmPEFib3J0Q29udHJvbGxlciB8IG51bGw+KG51bGwpXG5cbiAgLy8gQ2FuY2VsIGdlbmVyYXRpb24gd2hlbiBlc2NhcGUgcHJlc3NlZCBkdXJpbmcgZ2VuZXJhdGlvblxuICBjb25zdCBoYW5kbGVDYW5jZWxHZW5lcmF0aW9uID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChhYm9ydENvbnRyb2xsZXJSZWYuY3VycmVudCkge1xuICAgICAgYWJvcnRDb250cm9sbGVyUmVmLmN1cnJlbnQuYWJvcnQoKVxuICAgICAgYWJvcnRDb250cm9sbGVyUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICBzZXRJc0dlbmVyYXRpbmcoZmFsc2UpXG4gICAgICBzZXRFcnJvcignR2VuZXJhdGlvbiBjYW5jZWxsZWQnKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgLy8gVXNlIFNldHRpbmdzIGNvbnRleHQgc28gJ24nIGtleSBkb2Vzbid0IGNhbmNlbCAoYWxsb3dzIHR5cGluZyAnbicgaW4gcHJvbXB0IGlucHV0KVxuICB1c2VLZXliaW5kaW5nKCdjb25maXJtOm5vJywgaGFuZGxlQ2FuY2VsR2VuZXJhdGlvbiwge1xuICAgIGNvbnRleHQ6ICdTZXR0aW5ncycsXG4gICAgaXNBY3RpdmU6IGlzR2VuZXJhdGluZyxcbiAgfSlcblxuICBjb25zdCBoYW5kbGVFeHRlcm5hbEVkaXRvciA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBlZGl0UHJvbXB0SW5FZGl0b3IocHJvbXB0KVxuICAgIGlmIChyZXN1bHQuY29udGVudCAhPT0gbnVsbCkge1xuICAgICAgc2V0UHJvbXB0KHJlc3VsdC5jb250ZW50KVxuICAgICAgc2V0Q3Vyc29yT2Zmc2V0KHJlc3VsdC5jb250ZW50Lmxlbmd0aClcbiAgICB9XG4gIH0sIFtwcm9tcHRdKVxuXG4gIHVzZUtleWJpbmRpbmcoJ2NoYXQ6ZXh0ZXJuYWxFZGl0b3InLCBoYW5kbGVFeHRlcm5hbEVkaXRvciwge1xuICAgIGNvbnRleHQ6ICdDaGF0JyxcbiAgICBpc0FjdGl2ZTogIWlzR2VuZXJhdGluZyxcbiAgfSlcblxuICAvLyBHbyBiYWNrIHdoZW4gZXNjYXBlIHByZXNzZWQgd2hpbGUgbm90IGdlbmVyYXRpbmdcbiAgY29uc3QgaGFuZGxlR29CYWNrID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHVwZGF0ZVdpemFyZERhdGEoe1xuICAgICAgZ2VuZXJhdGlvblByb21wdDogJycsXG4gICAgICBhZ2VudFR5cGU6ICcnLFxuICAgICAgc3lzdGVtUHJvbXB0OiAnJyxcbiAgICAgIHdoZW5Ub1VzZTogJycsXG4gICAgICBnZW5lcmF0ZWRBZ2VudDogdW5kZWZpbmVkLFxuICAgICAgd2FzR2VuZXJhdGVkOiBmYWxzZSxcbiAgICB9KVxuICAgIHNldFByb21wdCgnJylcbiAgICBzZXRFcnJvcihudWxsKVxuICAgIGdvQmFjaygpXG4gIH0sIFt1cGRhdGVXaXphcmREYXRhLCBnb0JhY2tdKVxuXG4gIC8vIFVzZSBTZXR0aW5ncyBjb250ZXh0IHNvICduJyBrZXkgZG9lc24ndCBjYW5jZWwgKGFsbG93cyB0eXBpbmcgJ24nIGluIHByb21wdCBpbnB1dClcbiAgdXNlS2V5YmluZGluZygnY29uZmlybTpubycsIGhhbmRsZUdvQmFjaywge1xuICAgIGNvbnRleHQ6ICdTZXR0aW5ncycsXG4gICAgaXNBY3RpdmU6ICFpc0dlbmVyYXRpbmcsXG4gIH0pXG5cbiAgY29uc3QgaGFuZGxlR2VuZXJhdGUgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdHJpbW1lZFByb21wdCA9IHByb21wdC50cmltKClcbiAgICBpZiAoIXRyaW1tZWRQcm9tcHQpIHtcbiAgICAgIHNldEVycm9yKCdQbGVhc2UgZGVzY3JpYmUgd2hhdCB0aGUgYWdlbnQgc2hvdWxkIGRvJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHNldEVycm9yKG51bGwpXG4gICAgc2V0SXNHZW5lcmF0aW5nKHRydWUpXG4gICAgdXBkYXRlV2l6YXJkRGF0YSh7XG4gICAgICBnZW5lcmF0aW9uUHJvbXB0OiB0cmltbWVkUHJvbXB0LFxuICAgICAgaXNHZW5lcmF0aW5nOiB0cnVlLFxuICAgIH0pXG5cbiAgICAvLyBDcmVhdGUgYWJvcnQgY29udHJvbGxlciBmb3IgdGhpcyBnZW5lcmF0aW9uXG4gICAgY29uc3QgY29udHJvbGxlciA9IGNyZWF0ZUFib3J0Q29udHJvbGxlcigpXG4gICAgYWJvcnRDb250cm9sbGVyUmVmLmN1cnJlbnQgPSBjb250cm9sbGVyXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZ2VuZXJhdGVkID0gYXdhaXQgZ2VuZXJhdGVBZ2VudChcbiAgICAgICAgdHJpbW1lZFByb21wdCxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIFtdLFxuICAgICAgICBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIClcblxuICAgICAgdXBkYXRlV2l6YXJkRGF0YSh7XG4gICAgICAgIGFnZW50VHlwZTogZ2VuZXJhdGVkLmlkZW50aWZpZXIsXG4gICAgICAgIHdoZW5Ub1VzZTogZ2VuZXJhdGVkLndoZW5Ub1VzZSxcbiAgICAgICAgc3lzdGVtUHJvbXB0OiBnZW5lcmF0ZWQuc3lzdGVtUHJvbXB0LFxuICAgICAgICBnZW5lcmF0ZWRBZ2VudDogZ2VuZXJhdGVkLFxuICAgICAgICBpc0dlbmVyYXRpbmc6IGZhbHNlLFxuICAgICAgICB3YXNHZW5lcmF0ZWQ6IHRydWUsXG4gICAgICB9KVxuXG4gICAgICAvLyBTa2lwIGRpcmVjdGx5IHRvIFRvb2xzU3RlcCAoaW5kZXggNikgLSBtYXRjaGluZyBvcmlnaW5hbCBmbG93XG4gICAgICBnb1RvU3RlcCg2KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gRG9uJ3Qgc2hvdyBlcnJvciBpZiBpdCB3YXMgY2FuY2VsbGVkIChhbHJlYWR5IHNldCBpbiBlc2NhcGUgaGFuZGxlcilcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBUElVc2VyQWJvcnRFcnJvcikge1xuICAgICAgICAvLyBVc2VyIGNhbmNlbGxlZCAtIG5vIGVycm9yIHRvIHNob3dcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGVyciBpbnN0YW5jZW9mIEVycm9yICYmXG4gICAgICAgICFlcnIubWVzc2FnZS5pbmNsdWRlcygnTm8gYXNzaXN0YW50IG1lc3NhZ2UgZm91bmQnKVxuICAgICAgKSB7XG4gICAgICAgIHNldEVycm9yKGVyci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gZ2VuZXJhdGUgYWdlbnQnKVxuICAgICAgfVxuICAgICAgdXBkYXRlV2l6YXJkRGF0YSh7IGlzR2VuZXJhdGluZzogZmFsc2UgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0SXNHZW5lcmF0aW5nKGZhbHNlKVxuICAgICAgYWJvcnRDb250cm9sbGVyUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3VidGl0bGUgPVxuICAgICdEZXNjcmliZSB3aGF0IHRoaXMgYWdlbnQgc2hvdWxkIGRvIGFuZCB3aGVuIGl0IHNob3VsZCBiZSB1c2VkIChiZSBjb21wcmVoZW5zaXZlIGZvciBiZXN0IHJlc3VsdHMpJ1xuXG4gIGlmIChpc0dlbmVyYXRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFdpemFyZERpYWxvZ0xheW91dFxuICAgICAgICBzdWJ0aXRsZT17c3VidGl0bGV9XG4gICAgICAgIGZvb3RlclRleHQ9e1xuICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgIGFjdGlvbj1cImNvbmZpcm06bm9cIlxuICAgICAgICAgICAgY29udGV4dD1cIlNldHRpbmdzXCJcbiAgICAgICAgICAgIGZhbGxiYWNrPVwiRXNjXCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiY2FuY2VsXCJcbiAgICAgICAgICAvPlxuICAgICAgICB9XG4gICAgICA+XG4gICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cInJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwic3VnZ2VzdGlvblwiPiBHZW5lcmF0aW5nIGFnZW50IGZyb20gZGVzY3JpcHRpb24uLi48L1RleHQ+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9XaXphcmREaWFsb2dMYXlvdXQ+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8V2l6YXJkRGlhbG9nTGF5b3V0XG4gICAgICBzdWJ0aXRsZT17c3VidGl0bGV9XG4gICAgICBmb290ZXJUZXh0PXtcbiAgICAgICAgPEJ5bGluZT5cbiAgICAgICAgICA8Q29uZmlndXJhYmxlU2hvcnRjdXRIaW50XG4gICAgICAgICAgICBhY3Rpb249XCJjb25maXJtOnllc1wiXG4gICAgICAgICAgICBjb250ZXh0PVwiQ29uZmlybWF0aW9uXCJcbiAgICAgICAgICAgIGZhbGxiYWNrPVwiRW50ZXJcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJzdWJtaXRcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludFxuICAgICAgICAgICAgYWN0aW9uPVwiY2hhdDpleHRlcm5hbEVkaXRvclwiXG4gICAgICAgICAgICBjb250ZXh0PVwiQ2hhdFwiXG4gICAgICAgICAgICBmYWxsYmFjaz1cImN0cmwrZ1wiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIm9wZW4gaW4gZWRpdG9yXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgIGFjdGlvbj1cImNvbmZpcm06bm9cIlxuICAgICAgICAgICAgY29udGV4dD1cIlNldHRpbmdzXCJcbiAgICAgICAgICAgIGZhbGxiYWNrPVwiRXNjXCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiZ28gYmFja1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9CeWxpbmU+XG4gICAgICB9XG4gICAgPlxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICAgIHtlcnJvciAmJiAoXG4gICAgICAgICAgPEJveCBtYXJnaW5Cb3R0b209ezF9PlxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCJlcnJvclwiPntlcnJvcn08L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG4gICAgICAgIDxUZXh0SW5wdXRcbiAgICAgICAgICB2YWx1ZT17cHJvbXB0fVxuICAgICAgICAgIG9uQ2hhbmdlPXtzZXRQcm9tcHR9XG4gICAgICAgICAgb25TdWJtaXQ9e2hhbmRsZUdlbmVyYXRlfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPVwiZS5nLiwgSGVscCBtZSB3cml0ZSB1bml0IHRlc3RzIGZvciBteSBjb2RlLi4uXCJcbiAgICAgICAgICBjb2x1bW5zPXs4MH1cbiAgICAgICAgICBjdXJzb3JPZmZzZXQ9e2N1cnNvck9mZnNldH1cbiAgICAgICAgICBvbkNoYW5nZUN1cnNvck9mZnNldD17c2V0Q3Vyc29yT2Zmc2V0fVxuICAgICAgICAgIGZvY3VzXG4gICAgICAgICAgc2hvd0N1cnNvclxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG4gICAgPC9XaXphcmREaWFsb2dMYXlvdXQ+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsaUJBQWlCLFFBQVEsbUJBQW1CO0FBQ3JELE9BQU9DLEtBQUssSUFBSSxLQUFLQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsTUFBTSxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUM1RSxTQUFTQyxnQkFBZ0IsUUFBUSx1Q0FBdUM7QUFDeEUsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLFFBQVEsb0JBQW9CO0FBQzlDLFNBQVNDLGFBQWEsUUFBUSwwQ0FBMEM7QUFDeEUsU0FBU0MscUJBQXFCLFFBQVEsc0NBQXNDO0FBQzVFLFNBQVNDLGtCQUFrQixRQUFRLG1DQUFtQztBQUN0RSxTQUFTQyx3QkFBd0IsUUFBUSxzQ0FBc0M7QUFDL0UsU0FBU0MsTUFBTSxRQUFRLGtDQUFrQztBQUN6RCxTQUFTQyxPQUFPLFFBQVEscUJBQXFCO0FBQzdDLE9BQU9DLFNBQVMsTUFBTSx1QkFBdUI7QUFDN0MsU0FBU0MsU0FBUyxRQUFRLDBCQUEwQjtBQUNwRCxTQUFTQyxrQkFBa0IsUUFBUSx1Q0FBdUM7QUFDMUUsU0FBU0MsYUFBYSxRQUFRLHdCQUF3QjtBQUN0RCxjQUFjQyxlQUFlLFFBQVEsYUFBYTtBQUVsRCxPQUFPLFNBQVNDLFlBQVlBLENBQUEsQ0FBRSxFQUFFbEIsU0FBUyxDQUFDO0VBQ3hDLE1BQU07SUFBRW1CLGdCQUFnQjtJQUFFQyxNQUFNO0lBQUVDLFFBQVE7SUFBRUM7RUFBVyxDQUFDLEdBQ3REUixTQUFTLENBQUNHLGVBQWUsQ0FBQyxDQUFDLENBQUM7RUFDOUIsTUFBTSxDQUFD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
