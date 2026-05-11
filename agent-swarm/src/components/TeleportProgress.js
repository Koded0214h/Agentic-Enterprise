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
exports.TeleportProgress = TeleportProgress;
exports.teleportWithProgress = teleportWithProgress;
var compiler_runtime_1 = require("react/compiler-runtime");
var figures_1 = require("figures");
var React = require("react");
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var AppState_js_1 = require("../state/AppState.js");
var teleport_js_1 = require("../utils/teleport.js");
var SPINNER_FRAMES = ['◐', '◓', '◑', '◒'];
var STEPS = [{
        key: 'validating',
        label: 'Validating session'
    }, {
        key: 'fetching_logs',
        label: 'Fetching session logs'
    }, {
        key: 'fetching_branch',
        label: 'Getting branch info'
    }, {
        key: 'checking_out',
        label: 'Checking out branch'
    }];
function TeleportProgress(t0) {
    var $ = (0, compiler_runtime_1.c)(16);
    var currentStep = t0.currentStep, sessionId = t0.sessionId;
    var _a = (0, ink_js_1.useAnimationFrame)(100), ref = _a[0], time = _a[1];
    var frame = Math.floor(time / 100) % SPINNER_FRAMES.length;
    var t1;
    if ($[0] !== currentStep) {
        t1 = function (s) { return s.key === currentStep; };
        $[0] = currentStep;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var currentStepIndex = STEPS.findIndex(t1);
    var t2 = SPINNER_FRAMES[frame];
    var t3;
    if ($[2] !== t2) {
        t3 = <ink_js_1.Box marginBottom={1}><ink_js_1.Text bold={true} color="claude">{t2} Teleporting session…</ink_js_1.Text></ink_js_1.Box>;
        $[2] = t2;
        $[3] = t3;
    }
    else {
        t3 = $[3];
    }
    var t4;
    if ($[4] !== sessionId) {
        t4 = sessionId && <ink_js_1.Box marginBottom={1}><ink_js_1.Text dimColor={true}>{sessionId}</ink_js_1.Text></ink_js_1.Box>;
        $[4] = sessionId;
        $[5] = t4;
    }
    else {
        t4 = $[5];
    }
    var t5;
    if ($[6] !== currentStepIndex || $[7] !== frame) {
        t5 = STEPS.map(function (step, index) {
            var isComplete = index < currentStepIndex;
            var isCurrent = index === currentStepIndex;
            var isPending = index > currentStepIndex;
            var icon;
            var color;
            if (isComplete) {
                icon = figures_1.default.tick;
                color = "green";
            }
            else {
                if (isCurrent) {
                    icon = SPINNER_FRAMES[frame];
                    color = "claude";
                }
                else {
                    icon = figures_1.default.circle;
                    color = undefined;
                }
            }
            return <ink_js_1.Box key={step.key} flexDirection="row"><ink_js_1.Box width={2}><ink_js_1.Text color={color} dimColor={isPending}>{icon}</ink_js_1.Text></ink_js_1.Box><ink_js_1.Text dimColor={isPending} bold={isCurrent}>{step.label}</ink_js_1.Text></ink_js_1.Box>;
        });
        $[6] = currentStepIndex;
        $[7] = frame;
        $[8] = t5;
    }
    else {
        t5 = $[8];
    }
    var t6;
    if ($[9] !== t5) {
        t6 = <ink_js_1.Box flexDirection="column" marginLeft={2}>{t5}</ink_js_1.Box>;
        $[9] = t5;
        $[10] = t6;
    }
    else {
        t6 = $[10];
    }
    var t7;
    if ($[11] !== ref || $[12] !== t3 || $[13] !== t4 || $[14] !== t6) {
        t7 = <ink_js_1.Box ref={ref} flexDirection="column" paddingX={1} paddingY={1}>{t3}{t4}{t6}</ink_js_1.Box>;
        $[11] = ref;
        $[12] = t3;
        $[13] = t4;
        $[14] = t6;
        $[15] = t7;
    }
    else {
        t7 = $[15];
    }
    return t7;
}
/**
 * Teleports to a remote session with progress UI rendered into the existing root.
 * Fetches the session, checks out the branch, and returns the result.
 */
function teleportWithProgress(root, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        function TeleportProgressWrapper() {
            var _a = (0, react_1.useState)('validating'), step = _a[0], _setStep = _a[1];
            setStep = _setStep;
            return <TeleportProgress currentStep={step} sessionId={sessionId}/>;
        }
        var setStep, result, _a, branchName, branchError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setStep = function () { };
                    root.render(<AppState_js_1.AppStateProvider>
      <TeleportProgressWrapper />
    </AppState_js_1.AppStateProvider>);
                    return [4 /*yield*/, (0, teleport_js_1.teleportResumeCodeSession)(sessionId, setStep)];
                case 1:
                    result = _b.sent();
                    setStep('checking_out');
                    return [4 /*yield*/, (0, teleport_js_1.checkOutTeleportedSessionBranch)(result.branch)];
                case 2:
                    _a = _b.sent(), branchName = _a.branchName, branchError = _a.branchError;
                    return [2 /*return*/, {
                            messages: (0, teleport_js_1.processMessagesForTeleportResume)(result.log, branchError),
                            branchName: branchName
                        }];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VTdGF0ZSIsIlJvb3QiLCJCb3giLCJUZXh0IiwidXNlQW5pbWF0aW9uRnJhbWUiLCJBcHBTdGF0ZVByb3ZpZGVyIiwiY2hlY2tPdXRUZWxlcG9ydGVkU2Vzc2lvbkJyYW5jaCIsInByb2Nlc3NNZXNzYWdlc0ZvclRlbGVwb3J0UmVzdW1lIiwiVGVsZXBvcnRQcm9ncmVzc1N0ZXAiLCJUZWxlcG9ydFJlc3VsdCIsInRlbGVwb3J0UmVzdW1lQ29kZVNlc3Npb24iLCJQcm9wcyIsImN1cnJlbnRTdGVwIiwic2Vzc2lvbklkIiwiU1BJTk5FUl9GUkFNRVMiLCJTVEVQUyIsImtleSIsImxhYmVsIiwiVGVsZXBvcnRQcm9ncmVzcyIsInQwIiwiJCIsIl9jIiwicmVmIiwidGltZSIsImZyYW1lIiwiTWF0aCIsImZsb29yIiwibGVuZ3RoIiwidDEiLCJzIiwiY3VycmVudFN0ZXBJbmRleCIsImZpbmRJbmRleCIsInQyIiwidDMiLCJ0NCIsInQ1IiwibWFwIiwic3RlcCIsImluZGV4IiwiaXNDb21wbGV0ZSIsImlzQ3VycmVudCIsImlzUGVuZGluZyIsImljb24iLCJjb2xvciIsInRpY2siLCJjaXJjbGUiLCJ1bmRlZmluZWQiLCJ0NiIsInQ3IiwidGVsZXBvcnRXaXRoUHJvZ3Jlc3MiLCJyb290IiwiUHJvbWlzZSIsInNldFN0ZXAiLCJUZWxlcG9ydFByb2dyZXNzV3JhcHBlciIsIlJlYWN0Tm9kZSIsIl9zZXRTdGVwIiwicmVuZGVyIiwicmVzdWx0IiwiYnJhbmNoTmFtZSIsImJyYW5jaEVycm9yIiwiYnJhbmNoIiwibWVzc2FnZXMiLCJsb2ciXSwic291cmNlcyI6WyJUZWxlcG9ydFByb2dyZXNzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmlndXJlcyBmcm9tICdmaWd1cmVzJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBSb290IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHsgQm94LCBUZXh0LCB1c2VBbmltYXRpb25GcmFtZSB9IGZyb20gJy4uL2luay5qcydcbmltcG9ydCB7IEFwcFN0YXRlUHJvdmlkZXIgfSBmcm9tICcuLi9zdGF0ZS9BcHBTdGF0ZS5qcydcbmltcG9ydCB7XG4gIGNoZWNrT3V0VGVsZXBvcnRlZFNlc3Npb25CcmFuY2gsXG4gIHByb2Nlc3NNZXNzYWdlc0ZvclRlbGVwb3J0UmVzdW1lLFxuICB0eXBlIFRlbGVwb3J0UHJvZ3Jlc3NTdGVwLFxuICB0eXBlIFRlbGVwb3J0UmVzdWx0LFxuICB0ZWxlcG9ydFJlc3VtZUNvZGVTZXNzaW9uLFxufSBmcm9tICcuLi91dGlscy90ZWxlcG9ydC5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgY3VycmVudFN0ZXA6IFRlbGVwb3J0UHJvZ3Jlc3NTdGVwXG4gIHNlc3Npb25JZD86IHN0cmluZ1xufVxuXG5jb25zdCBTUElOTkVSX0ZSQU1FUyA9IFsn4peQJywgJ+KXkycsICfil5EnLCAn4peSJ11cblxuY29uc3QgU1RFUFM6IHsga2V5OiBUZWxlcG9ydFByb2dyZXNzU3RlcDsgbGFiZWw6IHN0cmluZyB9W10gPSBbXG4gIHsga2V5OiAndmFsaWRhdGluZycsIGxhYmVsOiAnVmFsaWRhdGluZyBzZXNzaW9uJyB9LFxuICB7IGtleTogJ2ZldGNoaW5nX2xvZ3MnLCBsYWJlbDogJ0ZldGNoaW5nIHNlc3Npb24gbG9ncycgfSxcbiAgeyBrZXk6ICdmZXRjaGluZ19icmFuY2gnLCBsYWJlbDogJ0dldHRpbmcgYnJhbmNoIGluZm8nIH0sXG4gIHsga2V5OiAnY2hlY2tpbmdfb3V0JywgbGFiZWw6ICdDaGVja2luZyBvdXQgYnJhbmNoJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gVGVsZXBvcnRQcm9ncmVzcyh7XG4gIGN1cnJlbnRTdGVwLFxuICBzZXNzaW9uSWQsXG59OiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IFtyZWYsIHRpbWVdID0gdXNlQW5pbWF0aW9uRnJhbWUoMTAwKVxuICBjb25zdCBmcmFtZSA9IE1hdGguZmxvb3IodGltZSAvIDEwMCkgJSBTUElOTkVSX0ZSQU1FUy5sZW5ndGhcblxuICBjb25zdCBjdXJyZW50U3RlcEluZGV4ID0gU1RFUFMuZmluZEluZGV4KHMgPT4gcy5rZXkgPT09IGN1cnJlbnRTdGVwKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCByZWY9e3JlZn0gZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHBhZGRpbmdYPXsxfSBwYWRkaW5nWT17MX0+XG4gICAgICA8Qm94IG1hcmdpbkJvdHRvbT17MX0+XG4gICAgICAgIDxUZXh0IGJvbGQgY29sb3I9XCJjbGF1ZGVcIj5cbiAgICAgICAgICB7U1BJTk5FUl9GUkFNRVNbZnJhbWVdfSBUZWxlcG9ydGluZyBzZXNzaW9u4oCmXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuXG4gICAgICB7c2Vzc2lvbklkICYmIChcbiAgICAgICAgPEJveCBtYXJnaW5Cb3R0b209ezF9PlxuICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPntzZXNzaW9uSWR9PC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG5cbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIG1hcmdpbkxlZnQ9ezJ9PlxuICAgICAgICB7U1RFUFMubWFwKChzdGVwLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGUgPSBpbmRleCA8IGN1cnJlbnRTdGVwSW5kZXhcbiAgICAgICAgICBjb25zdCBpc0N1cnJlbnQgPSBpbmRleCA9PT0gY3VycmVudFN0ZXBJbmRleFxuICAgICAgICAgIGNvbnN0IGlzUGVuZGluZyA9IGluZGV4ID4gY3VycmVudFN0ZXBJbmRleFxuXG4gICAgICAgICAgbGV0IGljb246IHN0cmluZ1xuICAgICAgICAgIGxldCBjb2xvcjogc3RyaW5nIHwgdW5kZWZpbmVkXG5cbiAgICAgICAgICBpZiAoaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgaWNvbiA9IGZpZ3VyZXMudGlja1xuICAgICAgICAgICAgY29sb3IgPSAnZ3JlZW4nXG4gICAgICAgICAgfSBlbHNlIGlmIChpc0N1cnJlbnQpIHtcbiAgICAgICAgICAgIGljb24gPSBTUElOTkVSX0ZSQU1FU1tmcmFtZV0hXG4gICAgICAgICAgICBjb2xvciA9ICdjbGF1ZGUnXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGljb24gPSBmaWd1cmVzLmNpcmNsZVxuICAgICAgICAgICAgY29sb3IgPSB1bmRlZmluZWRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJveCBrZXk9e3N0ZXAua2V5fSBmbGV4RGlyZWN0aW9uPVwicm93XCI+XG4gICAgICAgICAgICAgIDxCb3ggd2lkdGg9ezJ9PlxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPXtjb2xvciBhcyBuZXZlcn0gZGltQ29sb3I9e2lzUGVuZGluZ30+XG4gICAgICAgICAgICAgICAgICB7aWNvbn1cbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj17aXNQZW5kaW5nfSBib2xkPXtpc0N1cnJlbnR9PlxuICAgICAgICAgICAgICAgIHtzdGVwLmxhYmVsfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuLyoqXG4gKiBUZWxlcG9ydHMgdG8gYSByZW1vdGUgc2Vzc2lvbiB3aXRoIHByb2dyZXNzIFVJIHJlbmRlcmVkIGludG8gdGhlIGV4aXN0aW5nIHJvb3QuXG4gKiBGZXRjaGVzIHRoZSBzZXNzaW9uLCBjaGVja3Mgb3V0IHRoZSBicmFuY2gsIGFuZCByZXR1cm5zIHRoZSByZXN1bHQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0ZWxlcG9ydFdpdGhQcm9ncmVzcyhcbiAgcm9vdDogUm9vdCxcbiAgc2Vzc2lvbklkOiBzdHJpbmcsXG4pOiBQcm9taXNlPFRlbGVwb3J0UmVzdWx0PiB7XG4gIC8vIENhcHR1cmUgdGhlIHNldFN0YXRlIGZ1bmN0aW9uIGZyb20gdGhlIHJlbmRlcmVkIGNvbXBvbmVudFxuICBsZXQgc2V0U3RlcDogKHN0ZXA6IFRlbGVwb3J0UHJvZ3Jlc3NTdGVwKSA9PiB2b2lkID0gKCkgPT4ge31cblxuICBmdW5jdGlvbiBUZWxlcG9ydFByb2dyZXNzV3JhcHBlcigpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgIGNvbnN0IFtzdGVwLCBfc2V0U3RlcF0gPSB1c2VTdGF0ZTxUZWxlcG9ydFByb2dyZXNzU3RlcD4oJ3ZhbGlkYXRpbmcnKVxuICAgIHNldFN0ZXAgPSBfc2V0U3RlcFxuICAgIHJldHVybiA8VGVsZXBvcnRQcm9ncmVzcyBjdXJyZW50U3RlcD17c3RlcH0gc2Vzc2lvbklkPXtzZXNzaW9uSWR9IC8+XG4gIH1cblxuICByb290LnJlbmRlcihcbiAgICA8QXBwU3RhdGVQcm92aWRlcj5cbiAgICAgIDxUZWxlcG9ydFByb2dyZXNzV3JhcHBlciAvPlxuICAgIDwvQXBwU3RhdGVQcm92aWRlcj4sXG4gIClcblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCB0ZWxlcG9ydFJlc3VtZUNvZGVTZXNzaW9uKHNlc3Npb25JZCwgc2V0U3RlcClcbiAgc2V0U3RlcCgnY2hlY2tpbmdfb3V0JylcbiAgY29uc3QgeyBicmFuY2hOYW1lLCBicmFuY2hFcnJvciB9ID0gYXdhaXQgY2hlY2tPdXRUZWxlcG9ydGVkU2Vzc2lvbkJyYW5jaChcbiAgICByZXN1bHQuYnJhbmNoLFxuICApXG4gIHJldHVybiB7XG4gICAgbWVzc2FnZXM6IHByb2Nlc3NNZXNzYWdlc0ZvclRlbGVwb3J0UmVzdW1lKHJlc3VsdC5sb2csIGJyYW5jaEVycm9yKSxcbiAgICBicmFuY2hOYW1lLFxuICB9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFP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
