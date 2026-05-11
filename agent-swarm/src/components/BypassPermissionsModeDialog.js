"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BypassPermissionsModeDialog = BypassPermissionsModeDialog;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var ink_js_1 = require("../ink.js");
var gracefulShutdown_js_1 = require("../utils/gracefulShutdown.js");
var settings_js_1 = require("../utils/settings/settings.js");
var index_js_2 = require("./CustomSelect/index.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
function BypassPermissionsModeDialog(t0) {
    var $ = (0, compiler_runtime_1.c)(7);
    var onAccept = t0.onAccept;
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    react_1.default.useEffect(_temp, t1);
    var t2;
    if ($[1] !== onAccept) {
        t2 = function onChange(value) {
            bb3: switch (value) {
                case "accept":
                    {
                        (0, index_js_1.logEvent)("tengu_bypass_permissions_mode_dialog_accept", {});
                        (0, settings_js_1.updateSettingsForSource)("userSettings", {
                            skipDangerousModePermissionPrompt: true
                        });
                        onAccept();
                        break bb3;
                    }
                case "decline":
                    {
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                    }
            }
        };
        $[1] = onAccept;
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var onChange = t2;
    var handleEscape = _temp2;
    var t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = <ink_js_1.Box flexDirection="column" gap={1}><ink_js_1.Text>In Bypass Permissions mode, Claude Code will not ask for your approval before running potentially dangerous commands.<ink_js_1.Newline />This mode should only be used in a sandboxed container/VM that has restricted internet access and can easily be restored if damaged.</ink_js_1.Text><ink_js_1.Text>By proceeding, you accept all responsibility for actions taken while running in Bypass Permissions mode.</ink_js_1.Text><ink_js_1.Link url="https://code.claude.com/docs/en/security"/></ink_js_1.Box>;
        $[3] = t3;
    }
    else {
        t3 = $[3];
    }
    var t4;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = [{
                label: "No, exit",
                value: "decline"
            }, {
                label: "Yes, I accept",
                value: "accept"
            }];
        $[4] = t4;
    }
    else {
        t4 = $[4];
    }
    var t5;
    if ($[5] !== onChange) {
        t5 = <Dialog_js_1.Dialog title="WARNING: Claude Code running in Bypass Permissions mode" color="error" onCancel={handleEscape}>{t3}<index_js_2.Select options={t4} onChange={function (value_0) { return onChange(value_0); }}/></Dialog_js_1.Dialog>;
        $[5] = onChange;
        $[6] = t5;
    }
    else {
        t5 = $[6];
    }
    return t5;
}
function _temp2() {
    (0, gracefulShutdown_js_1.gracefulShutdownSync)(0);
}
function _temp() {
    (0, index_js_1.logEvent)("tengu_bypass_permissions_mode_dialog_shown", {});
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUNhbGxiYWNrIiwibG9nRXZlbnQiLCJCb3giLCJMaW5rIiwiTmV3bGluZSIsIlRleHQiLCJncmFjZWZ1bFNodXRkb3duU3luYyIsInVwZGF0ZVNldHRpbmdzRm9yU291cmNlIiwiU2VsZWN0IiwiRGlhbG9nIiwiUHJvcHMiLCJvbkFjY2VwdCIsIkJ5cGFzc1Blcm1pc3Npb25zTW9kZURpYWxvZyIsInQwIiwiJCIsIl9jIiwidDEiLCJTeW1ib2wiLCJmb3IiLCJ1c2VFZmZlY3QiLCJfdGVtcCIsInQyIiwib25DaGFuZ2UiLCJ2YWx1ZSIsImJiMyIsInNraXBEYW5nZXJvdXNNb2RlUGVybWlzc2lvblByb21wdCIsImhhbmRsZUVzY2FwZSIsIl90ZW1wMiIsInQzIiwidDQiLCJsYWJlbCIsInQ1IiwidmFsdWVfMCJdLCJzb3VyY2VzIjpbIkJ5cGFzc1Blcm1pc3Npb25zTW9kZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBsb2dFdmVudCB9IGZyb20gJ3NyYy9zZXJ2aWNlcy9hbmFseXRpY3MvaW5kZXguanMnXG5pbXBvcnQgeyBCb3gsIExpbmssIE5ld2xpbmUsIFRleHQgfSBmcm9tICcuLi9pbmsuanMnXG5pbXBvcnQgeyBncmFjZWZ1bFNodXRkb3duU3luYyB9IGZyb20gJy4uL3V0aWxzL2dyYWNlZnVsU2h1dGRvd24uanMnXG5pbXBvcnQgeyB1cGRhdGVTZXR0aW5nc0ZvclNvdXJjZSB9IGZyb20gJy4uL3V0aWxzL3NldHRpbmdzL3NldHRpbmdzLmpzJ1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi9DdXN0b21TZWxlY3QvaW5kZXguanMnXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBvbkFjY2VwdCgpOiB2b2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCeXBhc3NQZXJtaXNzaW9uc01vZGVEaWFsb2coe1xuICBvbkFjY2VwdCxcbn06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsb2dFdmVudCgndGVuZ3VfYnlwYXNzX3Blcm1pc3Npb25zX21vZGVfZGlhbG9nX3Nob3duJywge30pXG4gIH0sIFtdKVxuXG4gIGZ1bmN0aW9uIG9uQ2hhbmdlKHZhbHVlOiAnYWNjZXB0JyB8ICdkZWNsaW5lJykge1xuICAgIHN3aXRjaCAodmFsdWUpIHtcbiAgICAgIGNhc2UgJ2FjY2VwdCc6IHtcbiAgICAgICAgbG9nRXZlbnQoJ3Rlbmd1X2J5cGFzc19wZXJtaXNzaW9uc19tb2RlX2RpYWxvZ19hY2NlcHQnLCB7fSlcblxuICAgICAgICB1cGRhdGVTZXR0aW5nc0ZvclNvdXJjZSgndXNlclNldHRpbmdzJywge1xuICAgICAgICAgIHNraXBEYW5nZXJvdXNNb2RlUGVybWlzc2lvblByb21wdDogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgICAgb25BY2NlcHQoKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgY2FzZSAnZGVjbGluZSc6IHtcbiAgICAgICAgZ3JhY2VmdWxTaHV0ZG93blN5bmMoMSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVFc2NhcGUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZ3JhY2VmdWxTaHV0ZG93blN5bmMoMClcbiAgfSwgW10pXG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nXG4gICAgICB0aXRsZT1cIldBUk5JTkc6IENsYXVkZSBDb2RlIHJ1bm5pbmcgaW4gQnlwYXNzIFBlcm1pc3Npb25zIG1vZGVcIlxuICAgICAgY29sb3I9XCJlcnJvclwiXG4gICAgICBvbkNhbmNlbD17aGFuZGxlRXNjYXBlfVxuICAgID5cbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0+XG4gICAgICAgIDxUZXh0PlxuICAgICAgICAgIEluIEJ5cGFzcyBQZXJtaXNzaW9ucyBtb2RlLCBDbGF1ZGUgQ29kZSB3aWxsIG5vdCBhc2sgZm9yIHlvdXIgYXBwcm92YWxcbiAgICAgICAgICBiZWZvcmUgcnVubmluZyBwb3RlbnRpYWxseSBkYW5nZXJvdXMgY29tbWFuZHMuXG4gICAgICAgICAgPE5ld2xpbmUgLz5cbiAgICAgICAgICBUaGlzIG1vZGUgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbiBhIHNhbmRib3hlZCBjb250YWluZXIvVk0gdGhhdCBoYXNcbiAgICAgICAgICByZXN0cmljdGVkIGludGVybmV0IGFjY2VzcyBhbmQgY2FuIGVhc2lseSBiZSByZXN0b3JlZCBpZiBkYW1hZ2VkLlxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIDxUZXh0PlxuICAgICAgICAgIEJ5IHByb2NlZWRpbmcsIHlvdSBhY2NlcHQgYWxsIHJlc3BvbnNpYmlsaXR5IGZvciBhY3Rpb25zIHRha2VuIHdoaWxlXG4gICAgICAgICAgcnVubmluZyBpbiBCeXBhc3MgUGVybWlzc2lvbnMgbW9kZS5cbiAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgIDxMaW5rIHVybD1cImh0dHBzOi8vY29kZS5jbGF1ZGUuY29tL2RvY3MvZW4vc2VjdXJpdHlcIiAvPlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxTZWxlY3RcbiAgICAgICAgb3B0aW9ucz17W1xuICAgICAgICAgIHsgbGFiZWw6ICdObywgZXhpdCcsIHZhbHVlOiAnZGVjbGluZScgfSxcbiAgICAgICAgICB7IGxhYmVsOiAnWWVzLCBJIGFjY2VwdCcsIHZhbHVlOiAnYWNjZXB0JyB9LFxuICAgICAgICBdfVxuICAgICAgICBvbkNoYW5nZT17dmFsdWUgPT4gb25DaGFuZ2UodmFsdWUgYXMgJ2FjY2VwdCcgfCAnZGVjbGluZScpfVxuICAgICAgLz5cbiAgICA8L0RpYWxvZz5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsS0FBSyxJQUFJQyxXQUFXLFFBQVEsT0FB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
