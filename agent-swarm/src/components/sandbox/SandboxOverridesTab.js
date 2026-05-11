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
exports.SandboxOverridesTab = SandboxOverridesTab;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var ink_js_1 = require("../../ink.js");
var sandbox_adapter_js_1 = require("../../utils/sandbox/sandbox-adapter.js");
var select_js_1 = require("../CustomSelect/select.js");
var Tabs_js_1 = require("../design-system/Tabs.js");
function SandboxOverridesTab(t0) {
    var $ = (0, compiler_runtime_1.c)(5);
    var onComplete = t0.onComplete;
    var isEnabled = sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled();
    var isLocked = sandbox_adapter_js_1.SandboxManager.areSandboxSettingsLockedByPolicy();
    var currentAllowUnsandboxed = sandbox_adapter_js_1.SandboxManager.areUnsandboxedCommandsAllowed();
    if (!isEnabled) {
        var t1_1;
        if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
            t1_1 = <ink_js_1.Box flexDirection="column" paddingY={1}><ink_js_1.Text color="subtle">Sandbox is not enabled. Enable sandbox to configure override settings.</ink_js_1.Text></ink_js_1.Box>;
            $[0] = t1_1;
        }
        else {
            t1_1 = $[0];
        }
        return t1_1;
    }
    if (isLocked) {
        var t1_2;
        if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
            t1_2 = <ink_js_1.Text color="subtle">Override settings are managed by a higher-priority configuration and cannot be changed locally.</ink_js_1.Text>;
            $[1] = t1_2;
        }
        else {
            t1_2 = $[1];
        }
        var t2 = void 0;
        if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = <ink_js_1.Box flexDirection="column" paddingY={1}>{t1_2}<ink_js_1.Box marginTop={1}><ink_js_1.Text dimColor={true}>Current setting:{" "}{currentAllowUnsandboxed ? "Allow unsandboxed fallback" : "Strict sandbox mode"}</ink_js_1.Text></ink_js_1.Box></ink_js_1.Box>;
            $[2] = t2;
        }
        else {
            t2 = $[2];
        }
        return t2;
    }
    var t1;
    if ($[3] !== onComplete) {
        t1 = <OverridesSelect onComplete={onComplete} currentMode={currentAllowUnsandboxed ? "open" : "closed"}/>;
        $[3] = onComplete;
        $[4] = t1;
    }
    else {
        t1 = $[4];
    }
    return t1;
}
// Split so useTabHeaderFocus() only runs when the Select renders. Calling it
// above the early returns registers a down-arrow opt-in even when we return
// static text — pressing ↓ then blurs the header with no way back.
function OverridesSelect(t0) {
    var $ = (0, compiler_runtime_1.c)(25);
    var onComplete = t0.onComplete, currentMode = t0.currentMode;
    var theme = (0, ink_js_1.useTheme)()[0];
    var _a = (0, Tabs_js_1.useTabHeaderFocus)(), headerFocused = _a.headerFocused, focusHeader = _a.focusHeader;
    var t1;
    if ($[0] !== theme) {
        t1 = (0, ink_js_1.color)("success", theme)("(current)");
        $[0] = theme;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var currentIndicator = t1;
    var t2 = currentMode === "open" ? "Allow unsandboxed fallback ".concat(currentIndicator) : "Allow unsandboxed fallback";
    var t3;
    if ($[2] !== t2) {
        t3 = {
            label: t2,
            value: "open"
        };
        $[2] = t2;
        $[3] = t3;
    }
    else {
        t3 = $[3];
    }
    var t4 = currentMode === "closed" ? "Strict sandbox mode ".concat(currentIndicator) : "Strict sandbox mode";
    var t5;
    if ($[4] !== t4) {
        t5 = {
            label: t4,
            value: "closed"
        };
        $[4] = t4;
        $[5] = t5;
    }
    else {
        t5 = $[5];
    }
    var t6;
    if ($[6] !== t3 || $[7] !== t5) {
        t6 = [t3, t5];
        $[6] = t3;
        $[7] = t5;
        $[8] = t6;
    }
    else {
        t6 = $[8];
    }
    var options = t6;
    var t7;
    if ($[9] !== onComplete) {
        t7 = function handleSelect(value) {
            return __awaiter(this, void 0, void 0, function () {
                var mode, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            mode = value;
                            return [4 /*yield*/, sandbox_adapter_js_1.SandboxManager.setSandboxSettings({
                                    allowUnsandboxedCommands: mode === "open"
                                })];
                        case 1:
                            _a.sent();
                            message = mode === "open" ? "\u2713 Unsandboxed fallback allowed - commands can run outside sandbox when necessary" : "\u2713 Strict sandbox mode - all commands must run in sandbox or be excluded via the `excludedCommands` option";
                            onComplete(message);
                            return [2 /*return*/];
                    }
                });
            });
        };
        $[9] = onComplete;
        $[10] = t7;
    }
    else {
        t7 = $[10];
    }
    var handleSelect = t7;
    var t8;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = <ink_js_1.Box marginBottom={1}><ink_js_1.Text bold={true}>Configure Overrides:</ink_js_1.Text></ink_js_1.Box>;
        $[11] = t8;
    }
    else {
        t8 = $[11];
    }
    var t9;
    if ($[12] !== onComplete) {
        t9 = function () { return onComplete(undefined, {
            display: "skip"
        }); };
        $[12] = onComplete;
        $[13] = t9;
    }
    else {
        t9 = $[13];
    }
    var t10;
    if ($[14] !== focusHeader || $[15] !== handleSelect || $[16] !== headerFocused || $[17] !== options || $[18] !== t9) {
        t10 = <select_js_1.Select options={options} onChange={handleSelect} onCancel={t9} onUpFromFirstItem={focusHeader} isDisabled={headerFocused}/>;
        $[14] = focusHeader;
        $[15] = handleSelect;
        $[16] = headerFocused;
        $[17] = options;
        $[18] = t9;
        $[19] = t10;
    }
    else {
        t10 = $[19];
    }
    var t11;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = <ink_js_1.Text dimColor={true}><ink_js_1.Text bold={true} dimColor={true}>Allow unsandboxed fallback:</ink_js_1.Text>{" "}When a command fails due to sandbox restrictions, Claude can retry with dangerouslyDisableSandbox to run outside the sandbox (falling back to default permissions).</ink_js_1.Text>;
        $[20] = t11;
    }
    else {
        t11 = $[20];
    }
    var t12;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = <ink_js_1.Text dimColor={true}><ink_js_1.Text bold={true} dimColor={true}>Strict sandbox mode:</ink_js_1.Text>{" "}All bash commands invoked by the model must run in the sandbox unless they are explicitly listed in excludedCommands.</ink_js_1.Text>;
        $[21] = t12;
    }
    else {
        t12 = $[21];
    }
    var t13;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = <ink_js_1.Box flexDirection="column" marginTop={1} gap={1}>{t11}{t12}<ink_js_1.Text dimColor={true}>Learn more:{" "}<ink_js_1.Link url="https://code.claude.com/docs/en/sandboxing#configure-sandboxing">code.claude.com/docs/en/sandboxing#configure-sandboxing</ink_js_1.Link></ink_js_1.Text></ink_js_1.Box>;
        $[22] = t13;
    }
    else {
        t13 = $[22];
    }
    var t14;
    if ($[23] !== t10) {
        t14 = <ink_js_1.Box flexDirection="column" paddingY={1}>{t8}{t10}{t13}</ink_js_1.Box>;
        $[23] = t10;
        $[24] = t14;
    }
    else {
        t14 = $[24];
    }
    return t14;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkJveCIsImNvbG9yIiwiTGluayIsIlRleHQiLCJ1c2VUaGVtZSIsIkNvbW1hbmRSZXN1bHREaXNwbGF5IiwiU2FuZGJveE1hbmFnZXIiLCJTZWxlY3QiLCJ1c2VUYWJIZWFkZXJGb2N1cyIsIlByb3BzIiwib25Db21wbGV0ZSIsInJlc3VsdCIsIm9wdGlvbnMiLCJkaXNwbGF5IiwiT3ZlcnJpZGVNb2RlIiwiU2FuZGJveE92ZXJyaWRlc1RhYiIsInQwIiwiJCIsIl9jIiwiaXNFbmFibGVkIiwiaXNTYW5kYm94aW5nRW5hYmxlZCIsImlzTG9ja2VkIiwiYXJlU2FuZGJveFNldHRpbmdzTG9ja2VkQnlQb2xpY3kiLCJjdXJyZW50QWxsb3dVbnNhbmRib3hlZCIsImFyZVVuc2FuZGJveGVkQ29tbWFuZHNBbGxvd2VkIiwidDEiLCJTeW1ib2wiLCJmb3IiLCJ0MiIsIk92ZXJyaWRlc1NlbGVjdCIsImN1cnJlbnRNb2RlIiwidGhlbWUiLCJoZWFkZXJGb2N1c2VkIiwiZm9jdXNIZWFkZXIiLCJjdXJyZW50SW5kaWNhdG9yIiwidDMiLCJsYWJlbCIsInZhbHVlIiwidDQiLCJ0NSIsInQ2IiwidDciLCJoYW5kbGVTZWxlY3QiLCJtb2RlIiwic2V0U2FuZGJveFNldHRpbmdzIiwiYWxsb3dVbnNhbmRib3hlZENvbW1hbmRzIiwibWVzc2FnZSIsInQ4IiwidDkiLCJ1bmRlZmluZWQiLCJ0MTAiLCJ0MTEiLCJ0MTIiLCJ0MTMiLCJ0MTQiXSwic291cmNlcyI6WyJTYW5kYm94T3ZlcnJpZGVzVGFiLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIGNvbG9yLCBMaW5rLCBUZXh0LCB1c2VUaGVtZSB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB0eXBlIHsgQ29tbWFuZFJlc3VsdERpc3BsYXkgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuaW1wb3J0IHsgU2FuZGJveE1hbmFnZXIgfSBmcm9tICcuLi8uLi91dGlscy9zYW5kYm94L3NhbmRib3gtYWRhcHRlci5qcydcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL0N1c3RvbVNlbGVjdC9zZWxlY3QuanMnXG5pbXBvcnQgeyB1c2VUYWJIZWFkZXJGb2N1cyB9IGZyb20gJy4uL2Rlc2lnbi1zeXN0ZW0vVGFicy5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgb25Db21wbGV0ZTogKFxuICAgIHJlc3VsdD86IHN0cmluZyxcbiAgICBvcHRpb25zPzogeyBkaXNwbGF5PzogQ29tbWFuZFJlc3VsdERpc3BsYXkgfSxcbiAgKSA9PiB2b2lkXG59XG5cbnR5cGUgT3ZlcnJpZGVNb2RlID0gJ29wZW4nIHwgJ2Nsb3NlZCdcblxuZXhwb3J0IGZ1bmN0aW9uIFNhbmRib3hPdmVycmlkZXNUYWIoeyBvbkNvbXBsZXRlIH06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgaXNFbmFibGVkID0gU2FuZGJveE1hbmFnZXIuaXNTYW5kYm94aW5nRW5hYmxlZCgpXG4gIGNvbnN0IGlzTG9ja2VkID0gU2FuZGJveE1hbmFnZXIuYXJlU2FuZGJveFNldHRpbmdzTG9ja2VkQnlQb2xpY3koKVxuICBjb25zdCBjdXJyZW50QWxsb3dVbnNhbmRib3hlZCA9IFNhbmRib3hNYW5hZ2VyLmFyZVVuc2FuZGJveGVkQ29tbWFuZHNBbGxvd2VkKClcblxuICBpZiAoIWlzRW5hYmxlZCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBwYWRkaW5nWT17MX0+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwic3VidGxlXCI+XG4gICAgICAgICAgU2FuZGJveCBpcyBub3QgZW5hYmxlZC4gRW5hYmxlIHNhbmRib3ggdG8gY29uZmlndXJlIG92ZXJyaWRlIHNldHRpbmdzLlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICApXG4gIH1cblxuICBpZiAoaXNMb2NrZWQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgcGFkZGluZ1k9ezF9PlxuICAgICAgICA8VGV4dCBjb2xvcj1cInN1YnRsZVwiPlxuICAgICAgICAgIE92ZXJyaWRlIHNldHRpbmdzIGFyZSBtYW5hZ2VkIGJ5IGEgaGlnaGVyLXByaW9yaXR5IGNvbmZpZ3VyYXRpb24gYW5kXG4gICAgICAgICAgY2Fubm90IGJlIGNoYW5nZWQgbG9jYWxseS5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgICAgICBDdXJyZW50IHNldHRpbmc6eycgJ31cbiAgICAgICAgICAgIHtjdXJyZW50QWxsb3dVbnNhbmRib3hlZFxuICAgICAgICAgICAgICA/ICdBbGxvdyB1bnNhbmRib3hlZCBmYWxsYmFjaydcbiAgICAgICAgICAgICAgOiAnU3RyaWN0IHNhbmRib3ggbW9kZSd9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvQm94PlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPE92ZXJyaWRlc1NlbGVjdFxuICAgICAgb25Db21wbGV0ZT17b25Db21wbGV0ZX1cbiAgICAgIGN1cnJlbnRNb2RlPXtjdXJyZW50QWxsb3dVbnNhbmRib3hlZCA/ICdvcGVuJyA6ICdjbG9zZWQnfVxuICAgIC8+XG4gIClcbn1cblxuLy8gU3BsaXQgc28gdXNlVGFiSGVhZGVyRm9jdXMoKSBvbmx5IHJ1bnMgd2hlbiB0aGUgU2VsZWN0IHJlbmRlcnMuIENhbGxpbmcgaXRcbi8vIGFib3ZlIHRoZSBlYXJseSByZXR1cm5zIHJlZ2lzdGVycyBhIGRvd24tYXJyb3cgb3B0LWluIGV2ZW4gd2hlbiB3ZSByZXR1cm5cbi8vIHN0YXRpYyB0ZXh0IOKAlCBwcmVzc2luZyDihpMgdGhlbiBibHVycyB0aGUgaGVhZGVyIHdpdGggbm8gd2F5IGJhY2suXG5mdW5jdGlvbiBPdmVycmlkZXNTZWxlY3Qoe1xuICBvbkNvbXBsZXRlLFxuICBjdXJyZW50TW9kZSxcbn06IFByb3BzICYgeyBjdXJyZW50TW9kZTogT3ZlcnJpZGVNb2RlIH0pOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBbdGhlbWVdID0gdXNlVGhlbWUoKVxuICBjb25zdCB7IGhlYWRlckZvY3VzZWQsIGZvY3VzSGVhZGVyIH0gPSB1c2VUYWJIZWFkZXJGb2N1cygpXG4gIGNvbnN0IGN1cnJlbnRJbmRpY2F0b3IgPSBjb2xvcignc3VjY2VzcycsIHRoZW1lKShgKGN1cnJlbnQpYClcblxuICBjb25zdCBvcHRpb25zID0gW1xuICAgIHtcbiAgICAgIGxhYmVsOlxuICAgICAgICBjdXJyZW50TW9kZSA9PT0gJ29wZW4nXG4gICAgICAgICAgPyBgQWxsb3cgdW5zYW5kYm94ZWQgZmFsbGJhY2sgJHtjdXJyZW50SW5kaWNhdG9yfWBcbiAgICAgICAgICA6ICdBbGxvdyB1bnNhbmRib3hlZCBmYWxsYmFjaycsXG4gICAgICB2YWx1ZTogJ29wZW4nLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6XG4gICAgICAgIGN1cnJlbnRNb2RlID09PSAnY2xvc2VkJ1xuICAgICAgICAgID8gYFN0cmljdCBzYW5kYm94IG1vZGUgJHtjdXJyZW50SW5kaWNhdG9yfWBcbiAgICAgICAgICA6ICdTdHJpY3Qgc2FuZGJveCBtb2RlJyxcbiAgICAgIHZhbHVlOiAnY2xvc2VkJyxcbiAgICB9LFxuICBdXG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2VsZWN0KHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBtb2RlID0gdmFsdWUgYXMgT3ZlcnJpZGVNb2RlXG5cbiAgICBhd2FpdCBTYW5kYm94TWFuYWdlci5zZXRTYW5kYm94U2V0dGluZ3Moe1xuICAgICAgYWxsb3dVbnNhbmRib3hlZENvbW1hbmRzOiBtb2RlID09PSAnb3BlbicsXG4gICAgfSlcblxuICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgbW9kZSA9PT0gJ29wZW4nXG4gICAgICAgID8gJ+KckyBVbnNhbmRib3hlZCBmYWxsYmFjayBhbGxvd2VkIC0gY29tbWFuZHMgY2FuIHJ1biBvdXRzaWRlIHNhbmRib3ggd2hlbiBuZWNlc3NhcnknXG4gICAgICAgIDogJ+KckyBTdHJpY3Qgc2FuZGJveCBtb2RlIC0gYWxsIGNvbW1hbmRzIG11c3QgcnVuIGluIHNhbmRib3ggb3IgYmUgZXhjbHVkZWQgdmlhIHRoZSBgZXhjbHVkZWRDb21tYW5kc2Agb3B0aW9uJ1xuXG4gICAgb25Db21wbGV0ZShtZXNzYWdlKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBwYWRkaW5nWT17MX0+XG4gICAgICA8Qm94IG1hcmdpbkJvdHRvbT17MX0+XG4gICAgICAgIDxUZXh0IGJvbGQ+Q29uZmlndXJlIE92ZXJyaWRlczo8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICAgIDxTZWxlY3RcbiAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVNlbGVjdH1cbiAgICAgICAgb25DYW5jZWw9eygpID0+IG9uQ29tcGxldGUodW5kZWZpbmVkLCB7IGRpc3BsYXk6ICdza2lwJyB9KX1cbiAgICAgICAgb25VcEZyb21GaXJzdEl0ZW09e2ZvY3VzSGVhZGVyfVxuICAgICAgICBpc0Rpc2FibGVkPXtoZWFkZXJGb2N1c2VkfVxuICAgICAgLz5cbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIG1hcmdpblRvcD17MX0gZ2FwPXsxfT5cbiAgICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgICAgPFRleHQgYm9sZCBkaW1Db2xvcj5cbiAgICAgICAgICAgIEFsbG93IHVuc2FuZGJveGVkIGZhbGxiYWNrOlxuICAgICAgICAgIDwvVGV4dD57JyAnfVxuICAgICAgICAgIFdoZW4gYSBjb21tYW5kIGZhaWxzIGR1ZSB0byBzYW5kYm94IHJlc3RyaWN0aW9ucywgQ2xhdWRlIGNhbiByZXRyeVxuICAgICAgICAgIHdpdGggZGFuZ2Vyb3VzbHlEaXNhYmxlU2FuZGJveCB0byBydW4gb3V0c2lkZSB0aGUgc2FuZGJveCAoZmFsbGluZ1xuICAgICAgICAgIGJhY2sgdG8gZGVmYXVsdCBwZXJtaXNzaW9ucykuXG4gICAgICAgIDwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgICAgPFRleHQgYm9sZCBkaW1Db2xvcj5cbiAgICAgICAgICAgIFN0cmljdCBzYW5kYm94IG1vZGU6XG4gICAgICAgICAgPC9UZXh0PnsnICd9XG4gICAgICAgICAgQWxsIGJhc2ggY29tbWFuZHMgaW52b2tlZCBieSB0aGUgbW9kZWwgbXVzdCBydW4gaW4gdGhlIHNhbmRib3ggdW5sZXNzXG4gICAgICAgICAgdGhleSBhcmUgZXhwbGljaXRseSBsaXN0ZWQgaW4gZXhjbHVkZWRDb21tYW5kcy5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8VGV4dCBkaW1Db2xvcj5cbiAgICAgICAgICBMZWFybiBtb3JlOnsnICd9XG4gICAgICAgICAgPExpbmsgdXJsPVwiaHR0cHM6Ly9jb2RlLmNsYXVkZS5jb20vZG9jcy9lbi9zYW5kYm94aW5nI2NvbmZpZ3VyZS1zYW5kYm94aW5nXCI+XG4gICAgICAgICAgICBjb2RlLmNsYXVkZS5jb20vZG9jcy9lbi9zYW5kYm94aW5nI2NvbmZpZ3VyZS1zYW5kYm94aW5nXG4gICAgICAgICAgPC9MaW5rPlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsS0FBSyxNQUFNLE9BQU87QUFDekIsU0FBU0MsR0FBRyxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxRQUFRLFFBQVEsY0FBYztBQUMvRCxjQUFjQyxvQkFBb0IsUUFBUSx3QkFBd0I7QUFDbEUsU0FBU0MsY0FBYyxRQUFRLHdDQUF3QztBQUN2RSxTQUFTQyxNQUFNLFFBQVEsMkJBQTJCO0FBQ2xELFNBQVNDLGlCQUFp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
