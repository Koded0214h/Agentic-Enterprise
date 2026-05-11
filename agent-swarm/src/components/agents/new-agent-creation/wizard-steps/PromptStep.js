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
exports.PromptStep = PromptStep;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var ink_js_1 = require("../../../../ink.js");
var useKeybinding_js_1 = require("../../../../keybindings/useKeybinding.js");
var promptEditor_js_1 = require("../../../../utils/promptEditor.js");
var ConfigurableShortcutHint_js_1 = require("../../../ConfigurableShortcutHint.js");
var Byline_js_1 = require("../../../design-system/Byline.js");
var KeyboardShortcutHint_js_1 = require("../../../design-system/KeyboardShortcutHint.js");
var TextInput_js_1 = require("../../../TextInput.js");
var index_js_1 = require("../../../wizard/index.js");
var WizardDialogLayout_js_1 = require("../../../wizard/WizardDialogLayout.js");
function PromptStep() {
    var _this = this;
    var $ = (0, compiler_runtime_1.c)(20);
    var _a = (0, index_js_1.useWizard)(), goNext = _a.goNext, goBack = _a.goBack, updateWizardData = _a.updateWizardData, wizardData = _a.wizardData;
    var _b = (0, react_1.useState)(wizardData.systemPrompt || ""), systemPrompt = _b[0], setSystemPrompt = _b[1];
    var _d = (0, react_1.useState)(systemPrompt.length), cursorOffset = _d[0], setCursorOffset = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var t0;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = {
            context: "Settings"
        };
        $[0] = t0;
    }
    else {
        t0 = $[0];
    }
    (0, useKeybinding_js_1.useKeybinding)("confirm:no", goBack, t0);
    var t1;
    if ($[1] !== systemPrompt) {
        t1 = function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, promptEditor_js_1.editPromptInEditor)(systemPrompt)];
                    case 1:
                        result = _a.sent();
                        if (result.content !== null) {
                            setSystemPrompt(result.content);
                            setCursorOffset(result.content.length);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        $[1] = systemPrompt;
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var handleExternalEditor = t1;
    var t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            context: "Chat"
        };
        $[3] = t2;
    }
    else {
        t2 = $[3];
    }
    (0, useKeybinding_js_1.useKeybinding)("chat:externalEditor", handleExternalEditor, t2);
    var t3;
    if ($[4] !== goNext || $[5] !== systemPrompt || $[6] !== updateWizardData) {
        t3 = function () {
            var trimmedPrompt = systemPrompt.trim();
            if (!trimmedPrompt) {
                setError("System prompt is required");
                return;
            }
            setError(null);
            updateWizardData({
                systemPrompt: trimmedPrompt
            });
            goNext();
        };
        $[4] = goNext;
        $[5] = systemPrompt;
        $[6] = updateWizardData;
        $[7] = t3;
    }
    else {
        t3 = $[7];
    }
    var handleSubmit = t3;
    var t4;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = <Byline_js_1.Byline><KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Type" action="enter text"/><KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Enter" action="continue"/><ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="chat:externalEditor" context="Chat" fallback="ctrl+g" description="open in editor"/><ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="go back"/></Byline_js_1.Byline>;
        $[8] = t4;
    }
    else {
        t4 = $[8];
    }
    var t5;
    var t6;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = <ink_js_1.Text>Enter the system prompt for your agent:</ink_js_1.Text>;
        t6 = <ink_js_1.Text dimColor={true}>Be comprehensive for best results</ink_js_1.Text>;
        $[9] = t5;
        $[10] = t6;
    }
    else {
        t5 = $[9];
        t6 = $[10];
    }
    var t7;
    if ($[11] !== cursorOffset || $[12] !== handleSubmit || $[13] !== systemPrompt) {
        t7 = <ink_js_1.Box marginTop={1}><TextInput_js_1.default value={systemPrompt} onChange={setSystemPrompt} onSubmit={handleSubmit} placeholder="You are a helpful code reviewer who..." columns={80} cursorOffset={cursorOffset} onChangeCursorOffset={setCursorOffset} focus={true} showCursor={true}/></ink_js_1.Box>;
        $[11] = cursorOffset;
        $[12] = handleSubmit;
        $[13] = systemPrompt;
        $[14] = t7;
    }
    else {
        t7 = $[14];
    }
    var t8;
    if ($[15] !== error) {
        t8 = error && <ink_js_1.Box marginTop={1}><ink_js_1.Text color="error">{error}</ink_js_1.Text></ink_js_1.Box>;
        $[15] = error;
        $[16] = t8;
    }
    else {
        t8 = $[16];
    }
    var t9;
    if ($[17] !== t7 || $[18] !== t8) {
        t9 = <WizardDialogLayout_js_1.WizardDialogLayout subtitle="System prompt" footerText={t4}><ink_js_1.Box flexDirection="column">{t5}{t6}{t7}{t8}</ink_js_1.Box></WizardDialogLayout_js_1.WizardDialogLayout>;
        $[17] = t7;
        $[18] = t8;
        $[19] = t9;
    }
    else {
        t9 = $[19];
    }
    return t9;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIlJlYWN0Tm9kZSIsInVzZUNhbGxiYWNrIiwidXNlU3RhdGUiLCJCb3giLCJUZXh0IiwidXNlS2V5YmluZGluZyIsImVkaXRQcm9tcHRJbkVkaXRvciIsIkNvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCIsIkJ5bGluZSIsIktleWJvYXJkU2hvcnRjdXRIaW50IiwiVGV4dElucHV0IiwidXNlV2l6YXJkIiwiV2l6YXJkRGlhbG9nTGF5b3V0IiwiQWdlbnRXaXphcmREYXRhIiwiUHJvbXB0U3RlcCIsIiQiLCJfYyIsImdvTmV4dCIsImdvQmFjayIsInVwZGF0ZVdpemFyZERhdGEiLCJ3aXphcmREYXRhIiwic3lzdGVtUHJvbXB0Iiwic2V0U3lzdGVtUHJvbXB0IiwiY3Vyc29yT2Zmc2V0Iiwic2V0Q3Vyc29yT2Zmc2V0IiwibGVuZ3RoIiwiZXJyb3IiLCJzZXRFcnJvciIsInQwIiwiU3ltYm9sIiwiZm9yIiwiY29udGV4dCIsInQxIiwicmVzdWx0IiwiY29udGVudCIsImhhbmRsZUV4dGVybmFsRWRpdG9yIiwidDIiLCJ0MyIsInRyaW1tZWRQcm9tcHQiLCJ0cmltIiwiaGFuZGxlU3VibWl0IiwidDQiLCJ0NSIsInQ2IiwidDciLCJ0OCIsInQ5Il0sInNvdXJjZXMiOlsiUHJvbXB0U3RlcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHR5cGUgUmVhY3ROb2RlLCB1c2VDYWxsYmFjaywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL2luay5qcydcbmltcG9ydCB7IHVzZUtleWJpbmRpbmcgfSBmcm9tICcuLi8uLi8uLi8uLi9rZXliaW5kaW5ncy91c2VLZXliaW5kaW5nLmpzJ1xuaW1wb3J0IHsgZWRpdFByb21wdEluRWRpdG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvcHJvbXB0RWRpdG9yLmpzJ1xuaW1wb3J0IHsgQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50IH0gZnJvbSAnLi4vLi4vLi4vQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgQnlsaW5lIH0gZnJvbSAnLi4vLi4vLi4vZGVzaWduLXN5c3RlbS9CeWxpbmUuanMnXG5pbXBvcnQgeyBLZXlib2FyZFNob3J0Y3V0SGludCB9IGZyb20gJy4uLy4uLy4uL2Rlc2lnbi1zeXN0ZW0vS2V5Ym9hcmRTaG9ydGN1dEhpbnQuanMnXG5pbXBvcnQgVGV4dElucHV0IGZyb20gJy4uLy4uLy4uL1RleHRJbnB1dC5qcydcbmltcG9ydCB7IHVzZVdpemFyZCB9IGZyb20gJy4uLy4uLy4uL3dpemFyZC9pbmRleC5qcydcbmltcG9ydCB7IFdpemFyZERpYWxvZ0xheW91dCB9IGZyb20gJy4uLy4uLy4uL3dpemFyZC9XaXphcmREaWFsb2dMYXlvdXQuanMnXG5pbXBvcnQgdHlwZSB7IEFnZW50V2l6YXJkRGF0YSB9IGZyb20gJy4uL3R5cGVzLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvbXB0U3RlcCgpOiBSZWFjdE5vZGUge1xuICBjb25zdCB7IGdvTmV4dCwgZ29CYWNrLCB1cGRhdGVXaXphcmREYXRhLCB3aXphcmREYXRhIH0gPVxuICAgIHVzZVdpemFyZDxBZ2VudFdpemFyZERhdGE+KClcbiAgY29uc3QgW3N5c3RlbVByb21wdCwgc2V0U3lzdGVtUHJvbXB0XSA9IHVzZVN0YXRlKFxuICAgIHdpemFyZERhdGEuc3lzdGVtUHJvbXB0IHx8ICcnLFxuICApXG4gIGNvbnN0IFtjdXJzb3JPZmZzZXQsIHNldEN1cnNvck9mZnNldF0gPSB1c2VTdGF0ZShzeXN0ZW1Qcm9tcHQubGVuZ3RoKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG5cbiAgLy8gSGFuZGxlIGVzY2FwZSBrZXkgLSB1c2UgU2V0dGluZ3MgY29udGV4dCBzbyAnbicga2V5IGRvZXNuJ3QgY2FuY2VsIChhbGxvd3MgdHlwaW5nICduJyBpbiBpbnB1dClcbiAgdXNlS2V5YmluZGluZygnY29uZmlybTpubycsIGdvQmFjaywgeyBjb250ZXh0OiAnU2V0dGluZ3MnIH0pXG5cbiAgY29uc3QgaGFuZGxlRXh0ZXJuYWxFZGl0b3IgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZWRpdFByb21wdEluRWRpdG9yKHN5c3RlbVByb21wdClcbiAgICBpZiAocmVzdWx0LmNvbnRlbnQgIT09IG51bGwpIHtcbiAgICAgIHNldFN5c3RlbVByb21wdChyZXN1bHQuY29udGVudClcbiAgICAgIHNldEN1cnNvck9mZnNldChyZXN1bHQuY29udGVudC5sZW5ndGgpXG4gICAgfVxuICB9LCBbc3lzdGVtUHJvbXB0XSlcblxuICB1c2VLZXliaW5kaW5nKCdjaGF0OmV4dGVybmFsRWRpdG9yJywgaGFuZGxlRXh0ZXJuYWxFZGl0b3IsIHtcbiAgICBjb250ZXh0OiAnQ2hhdCcsXG4gIH0pXG5cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHRyaW1tZWRQcm9tcHQgPSBzeXN0ZW1Qcm9tcHQudHJpbSgpXG4gICAgaWYgKCF0cmltbWVkUHJvbXB0KSB7XG4gICAgICBzZXRFcnJvcignU3lzdGVtIHByb21wdCBpcyByZXF1aXJlZCcpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBzZXRFcnJvcihudWxsKVxuICAgIHVwZGF0ZVdpemFyZERhdGEoeyBzeXN0ZW1Qcm9tcHQ6IHRyaW1tZWRQcm9tcHQgfSlcbiAgICBnb05leHQoKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8V2l6YXJkRGlhbG9nTGF5b3V0XG4gICAgICBzdWJ0aXRsZT1cIlN5c3RlbSBwcm9tcHRcIlxuICAgICAgZm9vdGVyVGV4dD17XG4gICAgICAgIDxCeWxpbmU+XG4gICAgICAgICAgPEtleWJvYXJkU2hvcnRjdXRIaW50IHNob3J0Y3V0PVwiVHlwZVwiIGFjdGlvbj1cImVudGVyIHRleHRcIiAvPlxuICAgICAgICAgIDxLZXlib2FyZFNob3J0Y3V0SGludCBzaG9ydGN1dD1cIkVudGVyXCIgYWN0aW9uPVwiY29udGludWVcIiAvPlxuICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgIGFjdGlvbj1cImNoYXQ6ZXh0ZXJuYWxFZGl0b3JcIlxuICAgICAgICAgICAgY29udGV4dD1cIkNoYXRcIlxuICAgICAgICAgICAgZmFsbGJhY2s9XCJjdHJsK2dcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJvcGVuIGluIGVkaXRvclwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Q29uZmlndXJhYmxlU2hvcnRjdXRIaW50XG4gICAgICAgICAgICBhY3Rpb249XCJjb25maXJtOm5vXCJcbiAgICAgICAgICAgIGNvbnRleHQ9XCJTZXR0aW5nc1wiXG4gICAgICAgICAgICBmYWxsYmFjaz1cIkVzY1wiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cImdvIGJhY2tcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQnlsaW5lPlxuICAgICAgfVxuICAgID5cbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICA8VGV4dD5FbnRlciB0aGUgc3lzdGVtIHByb21wdCBmb3IgeW91ciBhZ2VudDo8L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPkJlIGNvbXByZWhlbnNpdmUgZm9yIGJlc3QgcmVzdWx0czwvVGV4dD5cblxuICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgPFRleHRJbnB1dFxuICAgICAgICAgICAgdmFsdWU9e3N5c3RlbVByb21wdH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTeXN0ZW1Qcm9tcHR9XG4gICAgICAgICAgICBvblN1Ym1pdD17aGFuZGxlU3VibWl0fVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJZb3UgYXJlIGEgaGVscGZ1bCBjb2RlIHJldmlld2VyIHdoby4uLlwiXG4gICAgICAgICAgICBjb2x1bW5zPXs4MH1cbiAgICAgICAgICAgIGN1cnNvck9mZnNldD17Y3Vyc29yT2Zmc2V0fVxuICAgICAgICAgICAgb25DaGFuZ2VDdXJzb3JPZmZzZXQ9e3NldEN1cnNvck9mZnNldH1cbiAgICAgICAgICAgIGZvY3VzXG4gICAgICAgICAgICBzaG93Q3Vyc29yXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAge2Vycm9yICYmIChcbiAgICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cImVycm9yXCI+e2Vycm9yfTwvVGV4dD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgKX1cbiAgICAgIDwvQm94PlxuICAgIDwvV2l6YXJkRGlhbG9nTGF5b3V0PlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxLQUFLLElBQUksS0FBS0MsU0FBUyxFQUFFQyxXQUFXLEVBQUVDLFFBQVEsUUFBUSxPQUFPO0FBQ3BFLFNBQVNDLEdBQUcsRUFBRUMsSUFBSSxRQUFRLG9CQUFvQjtBQUM5QyxTQUFTQyxhQUFhLFFBQVEsMENBQTBDO0FBQ3hFLFNBQVNDLGtCQUFrQixRQUFRLG1DQUFtQztBQUN0RSxTQUFTQyx3QkFBd0IsUUFBUSxzQ0FBc0M7QUFDL0UsU0FBU0MsTUFBTSxRQUFRLGtDQUFrQztBQUN6RCxTQUFTQyxvQkFBb0IsUUFBUSxnREFBZ0Q7QUFDckYsT0FBT0MsU0FBUyxNQUFNLHVCQUF1QjtBQUM3QyxTQUFTQyxTQUFTLFFBQVEsMEJBQTBCO0FBQ3BELFNBQVNDLGtCQUFrQixRQUFRLHVDQUF1QztBQUMxRSxjQUFjQyxlQUFlLFFBQVEsYUFBYTtBQUVsRCxPQUFPLFNBQUFDLFdBQUE7RUFBQSxNQUFBQyxDQUFBLEdBQUFDLEVBQUE7RUFDTDtJQUFBQyxNQUFBO0lBQUFDLE1BQUE7SUFBQUMsZ0JBQUE7SUFBQUM7RUFBQSxJQUNFVCxTQUFTLENBQWtCLENBQUM7RUFDOUIsT0FBQVUsWUFBQSxFQUFBQyxlQUFBLElBQXdD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
