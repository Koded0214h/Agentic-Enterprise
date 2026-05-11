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
exports.IdeOnboardingDialog = IdeOnboardingDialog;
exports.hasIdeOnboardingDialogBeenShown = hasIdeOnboardingDialogBeenShown;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var envDynamic_js_1 = require("src/utils/envDynamic.js");
var ink_js_1 = require("../ink.js");
var useKeybinding_js_1 = require("../keybindings/useKeybinding.js");
var config_js_1 = require("../utils/config.js");
var env_js_1 = require("../utils/env.js");
var ide_js_1 = require("../utils/ide.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
function IdeOnboardingDialog(t0) {
    var _a;
    var $ = (0, compiler_runtime_1.c)(23);
    var onDone = t0.onDone, installationStatus = t0.installationStatus;
    markDialogAsShown();
    var t1;
    if ($[0] !== onDone) {
        t1 = {
            "confirm:yes": onDone,
            "confirm:no": onDone
        };
        $[0] = onDone;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            context: "Confirmation"
        };
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    (0, useKeybinding_js_1.useKeybindings)(t1, t2);
    var t3;
    if ($[3] !== (installationStatus === null || installationStatus === void 0 ? void 0 : installationStatus.ideType)) {
        t3 = (_a = installationStatus === null || installationStatus === void 0 ? void 0 : installationStatus.ideType) !== null && _a !== void 0 ? _a : (0, ide_js_1.getTerminalIdeType)();
        $[3] = installationStatus === null || installationStatus === void 0 ? void 0 : installationStatus.ideType;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    var ideType = t3;
    var isJetBrains = (0, ide_js_1.isJetBrainsIde)(ideType);
    var t4;
    if ($[5] !== ideType) {
        t4 = (0, ide_js_1.toIDEDisplayName)(ideType);
        $[5] = ideType;
        $[6] = t4;
    }
    else {
        t4 = $[6];
    }
    var ideName = t4;
    var installedVersion = installationStatus === null || installationStatus === void 0 ? void 0 : installationStatus.installedVersion;
    var pluginOrExtension = isJetBrains ? "plugin" : "extension";
    var mentionShortcut = env_js_1.env.platform === "darwin" ? "Cmd+Option+K" : "Ctrl+Alt+K";
    var t5;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = <ink_js_1.Text color="claude">✻ </ink_js_1.Text>;
        $[7] = t5;
    }
    else {
        t5 = $[7];
    }
    var t6;
    if ($[8] !== ideName) {
        t6 = <>{t5}<ink_js_1.Text>Welcome to Claude Code for {ideName}</ink_js_1.Text></>;
        $[8] = ideName;
        $[9] = t6;
    }
    else {
        t6 = $[9];
    }
    var t7 = installedVersion ? "installed ".concat(pluginOrExtension, " v").concat(installedVersion) : undefined;
    var t8;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = <ink_js_1.Text color="suggestion">⧉ open files</ink_js_1.Text>;
        $[10] = t8;
    }
    else {
        t8 = $[10];
    }
    var t9;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = <ink_js_1.Text>• Claude has context of {t8}{" "}and <ink_js_1.Text color="suggestion">⧉ selected lines</ink_js_1.Text></ink_js_1.Text>;
        $[11] = t9;
    }
    else {
        t9 = $[11];
    }
    var t10;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = <ink_js_1.Text color="diffAddedWord">+11</ink_js_1.Text>;
        $[12] = t10;
    }
    else {
        t10 = $[12];
    }
    var t11;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = <ink_js_1.Text>• Review Claude Code's changes{" "}{t10}{" "}<ink_js_1.Text color="diffRemovedWord">-22</ink_js_1.Text> in the comfort of your IDE</ink_js_1.Text>;
        $[13] = t11;
    }
    else {
        t11 = $[13];
    }
    var t12;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = <ink_js_1.Text>• Cmd+Esc<ink_js_1.Text dimColor={true}> for Quick Launch</ink_js_1.Text></ink_js_1.Text>;
        $[14] = t12;
    }
    else {
        t12 = $[14];
    }
    var t13;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = <ink_js_1.Box flexDirection="column" gap={1}>{t9}{t11}{t12}<ink_js_1.Text>• {mentionShortcut}<ink_js_1.Text dimColor={true}> to reference files or lines in your input</ink_js_1.Text></ink_js_1.Text></ink_js_1.Box>;
        $[15] = t13;
    }
    else {
        t13 = $[15];
    }
    var t14;
    if ($[16] !== onDone || $[17] !== t6 || $[18] !== t7) {
        t14 = <Dialog_js_1.Dialog title={t6} subtitle={t7} color="ide" onCancel={onDone} hideInputGuide={true}>{t13}</Dialog_js_1.Dialog>;
        $[16] = onDone;
        $[17] = t6;
        $[18] = t7;
        $[19] = t14;
    }
    else {
        t14 = $[19];
    }
    var t15;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = <ink_js_1.Box paddingX={1}><ink_js_1.Text dimColor={true} italic={true}>Press Enter to continue</ink_js_1.Text></ink_js_1.Box>;
        $[20] = t15;
    }
    else {
        t15 = $[20];
    }
    var t16;
    if ($[21] !== t14) {
        t16 = <>{t14}{t15}</>;
        $[21] = t14;
        $[22] = t16;
    }
    else {
        t16 = $[22];
    }
    return t16;
}
function hasIdeOnboardingDialogBeenShown() {
    var _a;
    var config = (0, config_js_1.getGlobalConfig)();
    var terminal = envDynamic_js_1.envDynamic.terminal || 'unknown';
    return ((_a = config.hasIdeOnboardingBeenShown) === null || _a === void 0 ? void 0 : _a[terminal]) === true;
}
function markDialogAsShown() {
    if (hasIdeOnboardingDialogBeenShown()) {
        return;
    }
    var terminal = envDynamic_js_1.envDynamic.terminal || 'unknown';
    (0, config_js_1.saveGlobalConfig)(function (current) {
        var _a;
        return (__assign(__assign({}, current), { hasIdeOnboardingBeenShown: __assign(__assign({}, current.hasIdeOnboardingBeenShown), (_a = {}, _a[terminal] = true, _a)) }));
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsImVudkR5bmFtaWMiLCJCb3giLCJUZXh0IiwidXNlS2V5YmluZGluZ3MiLCJnZXRHbG9iYWxDb25maWciLCJzYXZlR2xvYmFsQ29uZmlnIiwiZW52IiwiZ2V0VGVybWluYWxJZGVUeXBlIiwiSURFRXh0ZW5zaW9uSW5zdGFsbGF0aW9uU3RhdHVzIiwiaXNKZXRCcmFpbnNJZGUiLCJ0b0lERURpc3BsYXlOYW1lIiwiRGlhbG9nIiwiUHJvcHMiLCJvbkRvbmUiLCJpbnN0YWxsYXRpb25TdGF0dXMiLCJJZGVPbmJvYXJkaW5nRGlhbG9nIiwidDAiLCIkIiwiX2MiLCJtYXJrRGlhbG9nQXNTaG93biIsInQxIiwidDIiLCJTeW1ib2wiLCJmb3IiLCJjb250ZXh0IiwidDMiLCJpZGVUeXBlIiwiaXNKZXRCcmFpbnMiLCJ0NCIsImlkZU5hbWUiLCJpbnN0YWxsZWRWZXJzaW9uIiwicGx1Z2luT3JFeHRlbnNpb24iLCJtZW50aW9uU2hvcnRjdXQiLCJwbGF0Zm9ybSIsInQ1IiwidDYiLCJ0NyIsInVuZGVmaW5lZCIsInQ4IiwidDkiLCJ0MTAiLCJ0MTEiLCJ0MTIiLCJ0MTMiLCJ0MTQiLCJ0MTUiLCJ0MTYiLCJoYXNJZGVPbmJvYXJkaW5nRGlhbG9nQmVlblNob3duIiwiY29uZmlnIiwidGVybWluYWwiLCJoYXNJZGVPbmJvYXJkaW5nQmVlblNob3duIiwiY3VycmVudCJdLCJzb3VyY2VzIjpbIklkZU9uYm9hcmRpbmdEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGVudkR5bmFtaWMgfSBmcm9tICdzcmMvdXRpbHMvZW52RHluYW1pYy5qcydcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uL2luay5qcydcbmltcG9ydCB7IHVzZUtleWJpbmRpbmdzIH0gZnJvbSAnLi4va2V5YmluZGluZ3MvdXNlS2V5YmluZGluZy5qcydcbmltcG9ydCB7IGdldEdsb2JhbENvbmZpZywgc2F2ZUdsb2JhbENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IGVudiB9IGZyb20gJy4uL3V0aWxzL2Vudi5qcydcbmltcG9ydCB7XG4gIGdldFRlcm1pbmFsSWRlVHlwZSxcbiAgdHlwZSBJREVFeHRlbnNpb25JbnN0YWxsYXRpb25TdGF0dXMsXG4gIGlzSmV0QnJhaW5zSWRlLFxuICB0b0lERURpc3BsYXlOYW1lLFxufSBmcm9tICcuLi91dGlscy9pZGUuanMnXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICBvbkRvbmU6ICgpID0+IHZvaWRcbiAgaW5zdGFsbGF0aW9uU3RhdHVzOiBJREVFeHRlbnNpb25JbnN0YWxsYXRpb25TdGF0dXMgfCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJZGVPbmJvYXJkaW5nRGlhbG9nKHtcbiAgb25Eb25lLFxuICBpbnN0YWxsYXRpb25TdGF0dXMsXG59OiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIG1hcmtEaWFsb2dBc1Nob3duKClcblxuICAvLyBIYW5kbGUgRW50ZXIvRXNjYXBlIHRvIGRpc21pc3NcbiAgdXNlS2V5YmluZGluZ3MoXG4gICAge1xuICAgICAgJ2NvbmZpcm06eWVzJzogb25Eb25lLFxuICAgICAgJ2NvbmZpcm06bm8nOiBvbkRvbmUsXG4gICAgfSxcbiAgICB7IGNvbnRleHQ6ICdDb25maXJtYXRpb24nIH0sXG4gIClcblxuICBjb25zdCBpZGVUeXBlID0gaW5zdGFsbGF0aW9uU3RhdHVzPy5pZGVUeXBlID8/IGdldFRlcm1pbmFsSWRlVHlwZSgpXG4gIGNvbnN0IGlzSmV0QnJhaW5zID0gaXNKZXRCcmFpbnNJZGUoaWRlVHlwZSlcblxuICBjb25zdCBpZGVOYW1lID0gdG9JREVEaXNwbGF5TmFtZShpZGVUeXBlKVxuICBjb25zdCBpbnN0YWxsZWRWZXJzaW9uID0gaW5zdGFsbGF0aW9uU3RhdHVzPy5pbnN0YWxsZWRWZXJzaW9uXG4gIGNvbnN0IHBsdWdpbk9yRXh0ZW5zaW9uID0gaXNKZXRCcmFpbnMgPyAncGx1Z2luJyA6ICdleHRlbnNpb24nXG4gIGNvbnN0IG1lbnRpb25TaG9ydGN1dCA9XG4gICAgZW52LnBsYXRmb3JtID09PSAnZGFyd2luJyA/ICdDbWQrT3B0aW9uK0snIDogJ0N0cmwrQWx0K0snXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPERpYWxvZ1xuICAgICAgICB0aXRsZT17XG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiY2xhdWRlXCI+4py7IDwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0PldlbGNvbWUgdG8gQ2xhdWRlIENvZGUgZm9yIHtpZGVOYW1lfTwvVGV4dD5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgfVxuICAgICAgICBzdWJ0aXRsZT17XG4gICAgICAgICAgaW5zdGFsbGVkVmVyc2lvblxuICAgICAgICAgICAgPyBgaW5zdGFsbGVkICR7cGx1Z2luT3JFeHRlbnNpb259IHYke2luc3RhbGxlZFZlcnNpb259YFxuICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgICBjb2xvcj1cImlkZVwiXG4gICAgICAgIG9uQ2FuY2VsPXtvbkRvbmV9XG4gICAgICAgIGhpZGVJbnB1dEd1aWRlXG4gICAgICA+XG4gICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0+XG4gICAgICAgICAgPFRleHQ+XG4gICAgICAgICAgICDigKIgQ2xhdWRlIGhhcyBjb250ZXh0IG9mIDxUZXh0IGNvbG9yPVwic3VnZ2VzdGlvblwiPuKniSBvcGVuIGZpbGVzPC9UZXh0PnsnICd9XG4gICAgICAgICAgICBhbmQgPFRleHQgY29sb3I9XCJzdWdnZXN0aW9uXCI+4qeJIHNlbGVjdGVkIGxpbmVzPC9UZXh0PlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgIOKAoiBSZXZpZXcgQ2xhdWRlIENvZGUmYXBvcztzIGNoYW5nZXN7JyAnfVxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCJkaWZmQWRkZWRXb3JkXCI+KzExPC9UZXh0PnsnICd9XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cImRpZmZSZW1vdmVkV29yZFwiPi0yMjwvVGV4dD4gaW4gdGhlIGNvbWZvcnQgb2YgeW91ciBJREVcbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPFRleHQ+XG4gICAgICAgICAgICDigKIgQ21kK0VzYzxUZXh0IGRpbUNvbG9yPiBmb3IgUXVpY2sgTGF1bmNoPC9UZXh0PlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgIOKAoiB7bWVudGlvblNob3J0Y3V0fVxuICAgICAgICAgICAgPFRleHQgZGltQ29sb3I+IHRvIHJlZmVyZW5jZSBmaWxlcyBvciBsaW5lcyBpbiB5b3VyIGlucHV0PC9UZXh0PlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L0RpYWxvZz5cbiAgICAgIDxCb3ggcGFkZGluZ1g9ezF9PlxuICAgICAgICA8VGV4dCBkaW1Db2xvciBpdGFsaWM+XG4gICAgICAgICAgUHJlc3MgRW50ZXIgdG8gY29udGludWVcbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0lkZU9uYm9hcmRpbmdEaWFsb2dCZWVuU2hvd24oKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldEdsb2JhbENvbmZpZygpXG4gIGNvbnN0IHRlcm1pbmFsID0gZW52RHluYW1pYy50ZXJtaW5hbCB8fCAndW5rbm93bidcbiAgcmV0dXJuIGNvbmZpZy5oYXNJZGVPbmJvYXJkaW5nQmVlblNob3duPy5bdGVybWluYWxdID09PSB0cnVlXG59XG5cbmZ1bmN0aW9uIG1hcmtEaWFsb2dBc1Nob3duKCk6IHZvaWQge1xuICBpZiAoaGFzSWRlT25ib2FyZGluZ0RpYWxvZ0JlZW5TaG93bigpKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgdGVybWluYWwgPSBlbnZEeW5hbWljLnRlcm1pbmFsIHx8ICd1bmtub3duJ1xuICBzYXZlR2xvYmFsQ29uZmlnKGN1cnJlbnQgPT4gKHtcbiAgICAuLi5jdXJyZW50LFxuICAgIGhhc0lkZU9uYm9hcmRpbmdCZWVuU2hvd246IHtcbiAgICAgIC4uLmN1cnJlbnQuaGFzSWRlT25ib2FyZGluZ0JlZW5TaG93bixcbiAgICAgIFt0ZXJtaW5hbF06IHRydWUsXG4gICAgfSxcbiAgfSkpXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxLQUFLLE1BQU0sT0FBTztBQUN6QixTQUFTQyxVQUFVLFFBQVEseUJBQXlCO0FBQ3BELFNBQVNDLEdBQUcsRUFBRUMsSUFBSSxRQUFRLFdBQVc7QUFDckMsU0FBU0MsY0FBYyxRQUFRLGlDQUFpQztBQUNoRSxTQUFTQyxlQUFlLEVBQUVDLGdCQUFnQixRQUFRLG9CQUFvQjtBQUN0RSxTQUFTQyxHQUFHLFFBQVEsaUJBQWlCO0FBQ3JDLFNBQ0VDLGtCQUFrQixFQUNsQixLQUFLQyw4QkFBOEIsRUFDbkNDLGNBQWMsRUFDZEMsZ0JBQWdCLFFBQ1gsaUJBQWlCO0FBQ3hCLFNBQVNDLE1BQU0sUUFBUSwyQkFBMkI7QUFFbEQsVUFBVUMsS0FBSyxDQUFDO0VBQ2RDLE1BQU0sRUFBRSxHQUFHLEdBQUcsSUFBSTtFQUNsQkMsa0JBQWtCLEVBQUVOLDhCQUE4QixHQUFHLElBQUk7QUFDM0Q7QUFFQSxPQUFPLFNBQUFPLG9CQUFBQyxFQUFBO0VBQUEsTUFBQUMsQ0FBQSxHQUFBQyxFQUFBO0VBQTZCO0lBQUFMLE1BQUE7SUFBQUM7RUFBQSxJQUFBRSxFQUc1QjtFQUNORyxpQkFBaUIsQ0FBQyxDQUFDO0VBQUEsSUFBQUMsRUFBQTtFQUFBLElBQUFILENBQUEsUUFBQUosTUFBQTtJQUlqQk8sRUFBQTtNQUFBLGVBQ2lCUCxNQUFNO01BQUEsY0FDUEE7SUFDaEIsQ0FBQztJQUFBSSxDQUFBLE1BQUFK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
