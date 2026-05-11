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
exports.call = call;
var compiler_runtime_1 = require("react/compiler-runtime");
var React = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var ink_js_1 = require("../../ink.js");
var editor_js_1 = require("../../utils/editor.js");
var ide_js_1 = require("../../utils/ide.js");
var PermissionUpdate_js_1 = require("../../utils/permissions/PermissionUpdate.js");
var permissionSetup_js_1 = require("../../utils/permissions/permissionSetup.js");
var plans_js_1 = require("../../utils/plans.js");
var promptEditor_js_1 = require("../../utils/promptEditor.js");
var staticRender_js_1 = require("../../utils/staticRender.js");
function PlanDisplay(t0) {
    var $ = (0, compiler_runtime_1.c)(11);
    var planContent = t0.planContent, planPath = t0.planPath, editorName = t0.editorName;
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = <ink_js_1.Text bold={true}>Current Plan</ink_js_1.Text>;
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var t2;
    if ($[1] !== planPath) {
        t2 = <ink_js_1.Text dimColor={true}>{planPath}</ink_js_1.Text>;
        $[1] = planPath;
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var t3;
    if ($[3] !== planContent) {
        t3 = <ink_js_1.Box marginTop={1}><ink_js_1.Text>{planContent}</ink_js_1.Text></ink_js_1.Box>;
        $[3] = planContent;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    var t4;
    if ($[5] !== editorName) {
        t4 = editorName && <ink_js_1.Box marginTop={1}><ink_js_1.Text dimColor={true}>"/plan open"</ink_js_1.Text><ink_js_1.Text dimColor={true}> to edit this plan in </ink_js_1.Text><ink_js_1.Text bold={true} dimColor={true}>{editorName}</ink_js_1.Text></ink_js_1.Box>;
        $[5] = editorName;
        $[6] = t4;
    }
    else {
        t4 = $[6];
    }
    var t5;
    if ($[7] !== t2 || $[8] !== t3 || $[9] !== t4) {
        t5 = <ink_js_1.Box flexDirection="column">{t1}{t2}{t3}{t4}</ink_js_1.Box>;
        $[7] = t2;
        $[8] = t3;
        $[9] = t4;
        $[10] = t5;
    }
    else {
        t5 = $[10];
    }
    return t5;
}
function call(onDone, context, args) {
    return __awaiter(this, void 0, void 0, function () {
        var getAppState, setAppState, appState, currentMode, description, planContent, planPath, argList, result, editor, editorName, display, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getAppState = context.getAppState, setAppState = context.setAppState;
                    appState = getAppState();
                    currentMode = appState.toolPermissionContext.mode;
                    // If not in plan mode, enable it
                    if (currentMode !== 'plan') {
                        (0, state_js_1.handlePlanModeTransition)(currentMode, 'plan');
                        setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: (0, PermissionUpdate_js_1.applyPermissionUpdate)((0, permissionSetup_js_1.prepareContextForPlanMode)(prev.toolPermissionContext), {
                                type: 'setMode',
                                mode: 'plan',
                                destination: 'session'
                            }) })); });
                        description = args.trim();
                        if (description && description !== 'open') {
                            onDone('Enabled plan mode', {
                                shouldQuery: true
                            });
                        }
                        else {
                            onDone('Enabled plan mode');
                        }
                        return [2 /*return*/, null];
                    }
                    planContent = (0, plans_js_1.getPlan)();
                    planPath = (0, plans_js_1.getPlanFilePath)();
                    if (!planContent) {
                        onDone('Already in plan mode. No plan written yet.');
                        return [2 /*return*/, null];
                    }
                    argList = args.trim().split(/\s+/);
                    if (!(argList[0] === 'open')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, promptEditor_js_1.editFileInEditor)(planPath)];
                case 1:
                    result = _a.sent();
                    if (result.error) {
                        onDone("Failed to open plan in editor: ".concat(result.error));
                    }
                    else {
                        onDone("Opened plan in editor: ".concat(planPath));
                    }
                    return [2 /*return*/, null];
                case 2:
                    editor = (0, editor_js_1.getExternalEditor)();
                    editorName = editor ? (0, ide_js_1.toIDEDisplayName)(editor) : undefined;
                    display = <PlanDisplay planContent={planContent} planPath={planPath} editorName={editorName}/>;
                    return [4 /*yield*/, (0, staticRender_js_1.renderToString)(display)];
                case 3:
                    output = _a.sent();
                    onDone(output);
                    return [2 /*return*/, null];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsImhhbmRsZVBsYW5Nb2RlVHJhbnNpdGlvbiIsIkxvY2FsSlNYQ29tbWFuZENvbnRleHQiLCJCb3giLCJUZXh0IiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiZ2V0RXh0ZXJuYWxFZGl0b3IiLCJ0b0lERURpc3BsYXlOYW1lIiwiYXBwbHlQZXJtaXNzaW9uVXBkYXRlIiwicHJlcGFyZUNvbnRleHRGb3JQbGFuTW9kZSIsImdldFBsYW4iLCJnZXRQbGFuRmlsZVBhdGgiLCJlZGl0RmlsZUluRWRpdG9yIiwicmVuZGVyVG9TdHJpbmciLCJQbGFuRGlzcGxheSIsInQwIiwiJCIsIl9jIiwicGxhbkNvbnRlbnQiLCJwbGFuUGF0aCIsImVkaXRvck5hbWUiLCJ0MSIsIlN5bWJvbCIsImZvciIsInQyIiwidDMiLCJ0NCIsInQ1IiwiY2FsbCIsIm9uRG9uZSIsImNvbnRleHQiLCJhcmdzIiwiUHJvbWlzZSIsIlJlYWN0Tm9kZSIsImdldEFwcFN0YXRlIiwic2V0QXBwU3RhdGUiLCJhcHBTdGF0ZSIsImN1cnJlbnRNb2RlIiwidG9vbFBlcm1pc3Npb25Db250ZXh0IiwibW9kZSIsInByZXYiLCJ0eXBlIiwiZGVzdGluYXRpb24iLCJkZXNjcmlwdGlvbiIsInRyaW0iLCJzaG91bGRRdWVyeSIsImFyZ0xpc3QiLCJzcGxpdCIsInJlc3VsdCIsImVycm9yIiwiZWRpdG9yIiwidW5kZWZpbmVkIiwiZGlzcGxheSIsIm91dHB1dCJdLCJzb3VyY2VzIjpbInBsYW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaGFuZGxlUGxhbk1vZGVUcmFuc2l0aW9uIH0gZnJvbSAnLi4vLi4vYm9vdHN0cmFwL3N0YXRlLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICcuLi8uLi9pbmsuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5pbXBvcnQgeyBnZXRFeHRlcm5hbEVkaXRvciB9IGZyb20gJy4uLy4uL3V0aWxzL2VkaXRvci5qcydcbmltcG9ydCB7IHRvSURFRGlzcGxheU5hbWUgfSBmcm9tICcuLi8uLi91dGlscy9pZGUuanMnXG5pbXBvcnQgeyBhcHBseVBlcm1pc3Npb25VcGRhdGUgfSBmcm9tICcuLi8uLi91dGlscy9wZXJtaXNzaW9ucy9QZXJtaXNzaW9uVXBkYXRlLmpzJ1xuaW1wb3J0IHsgcHJlcGFyZUNvbnRleHRGb3JQbGFuTW9kZSB9IGZyb20gJy4uLy4uL3V0aWxzL3Blcm1pc3Npb25zL3Blcm1pc3Npb25TZXR1cC5qcydcbmltcG9ydCB7IGdldFBsYW4sIGdldFBsYW5GaWxlUGF0aCB9IGZyb20gJy4uLy4uL3V0aWxzL3BsYW5zLmpzJ1xuaW1wb3J0IHsgZWRpdEZpbGVJbkVkaXRvciB9IGZyb20gJy4uLy4uL3V0aWxzL3Byb21wdEVkaXRvci5qcydcbmltcG9ydCB7IHJlbmRlclRvU3RyaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc3RhdGljUmVuZGVyLmpzJ1xuXG5mdW5jdGlvbiBQbGFuRGlzcGxheSh7XG4gIHBsYW5Db250ZW50LFxuICBwbGFuUGF0aCxcbiAgZWRpdG9yTmFtZSxcbn06IHtcbiAgcGxhbkNvbnRlbnQ6IHN0cmluZ1xuICBwbGFuUGF0aDogc3RyaW5nXG4gIGVkaXRvck5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZFxufSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICA8VGV4dCBib2xkPkN1cnJlbnQgUGxhbjwvVGV4dD5cbiAgICAgIDxUZXh0IGRpbUNvbG9yPntwbGFuUGF0aH08L1RleHQ+XG4gICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgIDxUZXh0PntwbGFuQ29udGVudH08L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICAgIHtlZGl0b3JOYW1lICYmIChcbiAgICAgICAgPEJveCBtYXJnaW5Ub3A9ezF9PlxuICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPiZxdW90Oy9wbGFuIG9wZW4mcXVvdDs8L1RleHQ+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+IHRvIGVkaXQgdGhpcyBwbGFuIGluIDwvVGV4dD5cbiAgICAgICAgICA8VGV4dCBib2xkIGRpbUNvbG9yPlxuICAgICAgICAgICAge2VkaXRvck5hbWV9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGwoXG4gIG9uRG9uZTogTG9jYWxKU1hDb21tYW5kT25Eb25lLFxuICBjb250ZXh0OiBMb2NhbEpTWENvbW1hbmRDb250ZXh0LFxuICBhcmdzOiBzdHJpbmcsXG4pOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICBjb25zdCB7IGdldEFwcFN0YXRlLCBzZXRBcHBTdGF0ZSB9ID0gY29udGV4dFxuICBjb25zdCBhcHBTdGF0ZSA9IGdldEFwcFN0YXRlKClcbiAgY29uc3QgY3VycmVudE1vZGUgPSBhcHBTdGF0ZS50b29sUGVybWlzc2lvbkNvbnRleHQubW9kZVxuXG4gIC8vIElmIG5vdCBpbiBwbGFuIG1vZGUsIGVuYWJsZSBpdFxuICBpZiAoY3VycmVudE1vZGUgIT09ICdwbGFuJykge1xuICAgIGhhbmRsZVBsYW5Nb2RlVHJhbnNpdGlvbihjdXJyZW50TW9kZSwgJ3BsYW4nKVxuICAgIHNldEFwcFN0YXRlKHByZXYgPT4gKHtcbiAgICAgIC4uLnByZXYsXG4gICAgICB0b29sUGVybWlzc2lvbkNvbnRleHQ6IGFwcGx5UGVybWlzc2lvblVwZGF0ZShcbiAgICAgICAgcHJlcGFyZUNvbnRleHRGb3JQbGFuTW9kZShwcmV2LnRvb2xQZXJtaXNzaW9uQ29udGV4dCksXG4gICAgICAgIHsgdHlwZTogJ3NldE1vZGUnLCBtb2RlOiAncGxhbicsIGRlc3RpbmF0aW9uOiAnc2Vzc2lvbicgfSxcbiAgICAgICksXG4gICAgfSkpXG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBhcmdzLnRyaW0oKVxuICAgIGlmIChkZXNjcmlwdGlvbiAmJiBkZXNjcmlwdGlvbiAhPT0gJ29wZW4nKSB7XG4gICAgICBvbkRvbmUoJ0VuYWJsZWQgcGxhbiBtb2RlJywgeyBzaG91bGRRdWVyeTogdHJ1ZSB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBvbkRvbmUoJ0VuYWJsZWQgcGxhbiBtb2RlJylcbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIC8vIEFscmVhZHkgaW4gcGxhbiBtb2RlIC0gc2hvdyB0aGUgY3VycmVudCBwbGFuXG4gIGNvbnN0IHBsYW5Db250ZW50ID0gZ2V0UGxhbigpXG4gIGNvbnN0IHBsYW5QYXRoID0gZ2V0UGxhbkZpbGVQYXRoKClcblxuICBpZiAoIXBsYW5Db250ZW50KSB7XG4gICAgb25Eb25lKCdBbHJlYWR5IGluIHBsYW4gbW9kZS4gTm8gcGxhbiB3cml0dGVuIHlldC4nKVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBJZiB1c2VyIHR5cGVkIFwiL3BsYW4gb3BlblwiLCBvcGVuIGluIGVkaXRvclxuICBjb25zdCBhcmdMaXN0ID0gYXJncy50cmltKCkuc3BsaXQoL1xccysvKVxuICBpZiAoYXJnTGlzdFswXSA9PT0gJ29wZW4nKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZWRpdEZpbGVJbkVkaXRvcihwbGFuUGF0aClcbiAgICBpZiAocmVzdWx0LmVycm9yKSB7XG4gICAgICBvbkRvbmUoYEZhaWxlZCB0byBvcGVuIHBsYW4gaW4gZWRpdG9yOiAke3Jlc3VsdC5lcnJvcn1gKVxuICAgIH0gZWxzZSB7XG4gICAgICBvbkRvbmUoYE9wZW5lZCBwbGFuIGluIGVkaXRvcjogJHtwbGFuUGF0aH1gKVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgZWRpdG9yID0gZ2V0RXh0ZXJuYWxFZGl0b3IoKVxuICBjb25zdCBlZGl0b3JOYW1lID0gZWRpdG9yID8gdG9JREVEaXNwbGF5TmFtZShlZGl0b3IpIDogdW5kZWZpbmVkXG5cbiAgY29uc3QgZGlzcGxheSA9IChcbiAgICA8UGxhbkRpc3BsYXlcbiAgICAgIHBsYW5Db250ZW50PXtwbGFuQ29udGVudH1cbiAgICAgIHBsYW5QYXRoPXtwbGFuUGF0aH1cbiAgICAgIGVkaXRvck5hbWU9e2VkaXRvck5hbWV9XG4gICAgLz5cbiAgKVxuXG4gIC8vIFJlbmRlciB0byBzdHJpbmcgYW5kIHBhc3MgdG8gb25Eb25lIGxpa2UgbG9jYWwgY29tbWFuZHMgZG9cbiAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgcmVuZGVyVG9TdHJpbmcoZGlzcGxheSlcbiAgb25Eb25lKG91dHB1dClcbiAgcmV0dXJuIG51bGxcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBS0EsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0Msd0JBQXdCLFFBQVEsMEJBQTBCO0FBQ25FLGNBQWNDLHNCQUFzQixRQUFRLG1CQUFtQjtBQUMvRCxTQUFTQyxHQUFHLEVBQUVDLElBQUksUUFBUSxjQUFjO0FBQ3hDLGNBQWNDLHFCQUFxQixRQUFRLHdCQUF3QjtBQUNuRSxTQUFTQyxpQkFBaUIsUUFBUSx1QkFBdUI7QUFDekQsU0FBU0MsZ0JBQWdCLFFBQVEsb0JBQW9CO0FBQ3JELFNBQVNDLHFCQUFxQixRQUFRLDZDQUE2QztBQUNuRixTQUFTQyx5QkFBeUIsUUFBUSw0Q0FBNEM7QUFDdEYsU0FBU0MsT0FBTyxFQUFFQyxlQUFlLFFBQVEsc0JBQXNCO0FBQy9ELFNBQVNDLGdCQUFnQixRQUFRLDZCQUE2QjtBQUM5RCxTQUFTQyxjQUFjLFFBQVEsNkJBQTZCO0FBRTVELFNBQUFDLFlBQUFDLEVBQUE7RUFBQSxNQUFBQyxDQUFBLEdBQUFDLEVBQUE7RUFBcUI7SUFBQUMsV0FBQTtJQUFBQyxRQUFBO0lBQUFDO0VBQUEsSUFB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
