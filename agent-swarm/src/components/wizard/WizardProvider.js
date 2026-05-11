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
exports.WizardContext = void 0;
exports.WizardProvider = WizardProvider;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var useExitOnCtrlCDWithKeybindings_js_1 = require("../../hooks/useExitOnCtrlCDWithKeybindings.js");
// Use any here for the context since it will be cast properly when used
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.WizardContext = (0, react_1.createContext)(null);
function WizardProvider(t0) {
    var $ = (0, compiler_runtime_1.c)(38);
    var steps = t0.steps, t1 = t0.initialData, onComplete = t0.onComplete, onCancel = t0.onCancel, children = t0.children, title = t0.title, t2 = t0.showStepCounter;
    var t3;
    if ($[0] !== t1) {
        t3 = t1 === undefined ? {} : t1;
        $[0] = t1;
        $[1] = t3;
    }
    else {
        t3 = $[1];
    }
    var initialData = t3;
    var showStepCounter = t2 === undefined ? true : t2;
    var _a = (0, react_1.useState)(0), currentStepIndex = _a[0], setCurrentStepIndex = _a[1];
    var _b = (0, react_1.useState)(initialData), wizardData = _b[0], setWizardData = _b[1];
    var _d = (0, react_1.useState)(false), isCompleted = _d[0], setIsCompleted = _d[1];
    var t4;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = [];
        $[2] = t4;
    }
    else {
        t4 = $[2];
    }
    var _e = (0, react_1.useState)(t4), navigationHistory = _e[0], setNavigationHistory = _e[1];
    (0, useExitOnCtrlCDWithKeybindings_js_1.useExitOnCtrlCDWithKeybindings)();
    var t5;
    var t6;
    if ($[3] !== isCompleted || $[4] !== onComplete || $[5] !== wizardData) {
        t5 = function () {
            if (isCompleted) {
                setNavigationHistory([]);
                onComplete(wizardData);
            }
        };
        t6 = [isCompleted, wizardData, onComplete];
        $[3] = isCompleted;
        $[4] = onComplete;
        $[5] = wizardData;
        $[6] = t5;
        $[7] = t6;
    }
    else {
        t5 = $[6];
        t6 = $[7];
    }
    (0, react_1.useEffect)(t5, t6);
    var t7;
    if ($[8] !== currentStepIndex || $[9] !== navigationHistory || $[10] !== steps.length) {
        t7 = function () {
            if (currentStepIndex < steps.length - 1) {
                if (navigationHistory.length > 0) {
                    setNavigationHistory(function (prev) { return __spreadArray(__spreadArray([], prev, true), [currentStepIndex], false); });
                }
                setCurrentStepIndex(_temp);
            }
            else {
                setIsCompleted(true);
            }
        };
        $[8] = currentStepIndex;
        $[9] = navigationHistory;
        $[10] = steps.length;
        $[11] = t7;
    }
    else {
        t7 = $[11];
    }
    var goNext = t7;
    var t8;
    if ($[12] !== currentStepIndex || $[13] !== navigationHistory || $[14] !== onCancel) {
        t8 = function () {
            if (navigationHistory.length > 0) {
                var previousStep = navigationHistory[navigationHistory.length - 1];
                if (previousStep !== undefined) {
                    setNavigationHistory(_temp2);
                    setCurrentStepIndex(previousStep);
                }
            }
            else {
                if (currentStepIndex > 0) {
                    setCurrentStepIndex(_temp3);
                }
                else {
                    if (onCancel) {
                        onCancel();
                    }
                }
            }
        };
        $[12] = currentStepIndex;
        $[13] = navigationHistory;
        $[14] = onCancel;
        $[15] = t8;
    }
    else {
        t8 = $[15];
    }
    var goBack = t8;
    var t9;
    if ($[16] !== currentStepIndex || $[17] !== steps.length) {
        t9 = function (index) {
            if (index >= 0 && index < steps.length) {
                setNavigationHistory(function (prev_3) { return __spreadArray(__spreadArray([], prev_3, true), [currentStepIndex], false); });
                setCurrentStepIndex(index);
            }
        };
        $[16] = currentStepIndex;
        $[17] = steps.length;
        $[18] = t9;
    }
    else {
        t9 = $[18];
    }
    var goToStep = t9;
    var t10;
    if ($[19] !== onCancel) {
        t10 = function () {
            setNavigationHistory([]);
            if (onCancel) {
                onCancel();
            }
        };
        $[19] = onCancel;
        $[20] = t10;
    }
    else {
        t10 = $[20];
    }
    var cancel = t10;
    var t11;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = function (updates) {
            setWizardData(function (prev_4) { return (__assign(__assign({}, prev_4), updates)); });
        };
        $[21] = t11;
    }
    else {
        t11 = $[21];
    }
    var updateWizardData = t11;
    var t12;
    if ($[22] !== cancel || $[23] !== currentStepIndex || $[24] !== goBack || $[25] !== goNext || $[26] !== goToStep || $[27] !== showStepCounter || $[28] !== steps.length || $[29] !== title || $[30] !== wizardData) {
        t12 = {
            currentStepIndex: currentStepIndex,
            totalSteps: steps.length,
            wizardData: wizardData,
            setWizardData: setWizardData,
            updateWizardData: updateWizardData,
            goNext: goNext,
            goBack: goBack,
            goToStep: goToStep,
            cancel: cancel,
            title: title,
            showStepCounter: showStepCounter
        };
        $[22] = cancel;
        $[23] = currentStepIndex;
        $[24] = goBack;
        $[25] = goNext;
        $[26] = goToStep;
        $[27] = showStepCounter;
        $[28] = steps.length;
        $[29] = title;
        $[30] = wizardData;
        $[31] = t12;
    }
    else {
        t12 = $[31];
    }
    var contextValue = t12;
    var CurrentStepComponent = steps[currentStepIndex];
    if (!CurrentStepComponent || isCompleted) {
        return null;
    }
    var t13;
    if ($[32] !== CurrentStepComponent || $[33] !== children) {
        t13 = children || <CurrentStepComponent />;
        $[32] = CurrentStepComponent;
        $[33] = children;
        $[34] = t13;
    }
    else {
        t13 = $[34];
    }
    var t14;
    if ($[35] !== contextValue || $[36] !== t13) {
        t14 = <exports.WizardContext.Provider value={contextValue}>{t13}</exports.WizardContext.Provider>;
        $[35] = contextValue;
        $[36] = t13;
        $[37] = t14;
    }
    else {
        t14 = $[37];
    }
    return t14;
}
function _temp3(prev_2) {
    return prev_2 - 1;
}
function _temp2(prev_1) {
    return prev_1.slice(0, -1);
}
function _temp(prev_0) {
    return prev_0 + 1;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsImNyZWF0ZUNvbnRleHQiLCJSZWFjdE5vZGUiLCJ1c2VDYWxsYmFjayIsInVzZUVmZmVjdCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsInVzZUV4aXRPbkN0cmxDRFdpdGhLZXliaW5kaW5ncyIsIldpemFyZENvbnRleHRWYWx1ZSIsIldpemFyZFByb3ZpZGVyUHJvcHMiLCJXaXphcmRDb250ZXh0IiwiV2l6YXJkUHJvdmlkZXIiLCJ0MCIsIiQiLCJfYyIsInN0ZXBzIiwiaW5pdGlhbERhdGEiLCJ0MSIsIm9uQ29tcGxldGUiLCJvbkNhbmNlbCIsImNoaWxkcmVuIiwidGl0bGUiLCJzaG93U3RlcENvdW50ZXIiLCJ0MiIsInQzIiwidW5kZWZpbmVkIiwiVCIsImN1cnJlbnRTdGVwSW5kZXgiLCJzZXRDdXJyZW50U3RlcEluZGV4Iiwid2l6YXJkRGF0YSIsInNldFdpemFyZERhdGEiLCJpc0NvbXBsZXRlZCIsInNldElzQ29tcGxldGVkIiwidDQiLCJTeW1ib2wiLCJmb3IiLCJuYXZpZ2F0aW9uSGlzdG9yeSIsInNldE5hdmlnYXRpb25IaXN0b3J5IiwidDUiLCJ0NiIsInQ3IiwibGVuZ3RoIiwicHJldiIsIl90ZW1wIiwiZ29OZXh0IiwidDgiLCJwcmV2aW91c1N0ZXAiLCJfdGVtcDIiLCJfdGVtcDMiLCJnb0JhY2siLCJ0OSIsImluZGV4IiwicHJldl8zIiwiZ29Ub1N0ZXAiLCJ0MTAiLCJjYW5jZWwiLCJ0MTEiLCJ1cGRhdGVzIiwicHJldl80IiwidXBkYXRlV2l6YXJkRGF0YSIsInQxMiIsInRvdGFsU3RlcHMiLCJjb250ZXh0VmFsdWUiLCJDdXJyZW50U3RlcENvbXBvbmVudCIsInQxMyIsInQxNCIsInByZXZfMiIsInByZXZfMSIsInNsaWNlIiwicHJldl8wIl0sInNvdXJjZXMiOlsiV2l6YXJkUHJvdmlkZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwge1xuICBjcmVhdGVDb250ZXh0LFxuICB0eXBlIFJlYWN0Tm9kZSxcbiAgdXNlQ2FsbGJhY2ssXG4gIHVzZUVmZmVjdCxcbiAgdXNlTWVtbyxcbiAgdXNlU3RhdGUsXG59IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRXhpdE9uQ3RybENEV2l0aEtleWJpbmRpbmdzIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlRXhpdE9uQ3RybENEV2l0aEtleWJpbmRpbmdzLmpzJ1xuaW1wb3J0IHR5cGUgeyBXaXphcmRDb250ZXh0VmFsdWUsIFdpemFyZFByb3ZpZGVyUHJvcHMgfSBmcm9tICcuL3R5cGVzLmpzJ1xuXG4vLyBVc2UgYW55IGhlcmUgZm9yIHRoZSBjb250ZXh0IHNpbmNlIGl0IHdpbGwgYmUgY2FzdCBwcm9wZXJseSB3aGVuIHVzZWRcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5leHBvcnQgY29uc3QgV2l6YXJkQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8V2l6YXJkQ29udGV4dFZhbHVlPGFueT4gfCBudWxsPihudWxsKVxuXG5leHBvcnQgZnVuY3Rpb24gV2l6YXJkUHJvdmlkZXI8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+Pih7XG4gIHN0ZXBzLFxuICBpbml0aWFsRGF0YSA9IHt9IGFzIFQsXG4gIG9uQ29tcGxldGUsXG4gIG9uQ2FuY2VsLFxuICBjaGlsZHJlbixcbiAgdGl0bGUsXG4gIHNob3dTdGVwQ291bnRlciA9IHRydWUsXG59OiBXaXphcmRQcm92aWRlclByb3BzPFQ+KTogUmVhY3ROb2RlIHtcbiAgY29uc3QgW2N1cnJlbnRTdGVwSW5kZXgsIHNldEN1cnJlbnRTdGVwSW5kZXhdID0gdXNlU3RhdGUoMClcbiAgY29uc3QgW3dpemFyZERhdGEsIHNldFdpemFyZERhdGFdID0gdXNlU3RhdGU8VD4oaW5pdGlhbERhdGEpXG4gIGNvbnN0IFtpc0NvbXBsZXRlZCwgc2V0SXNDb21wbGV0ZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtuYXZpZ2F0aW9uSGlzdG9yeSwgc2V0TmF2aWdhdGlvbkhpc3RvcnldID0gdXNlU3RhdGU8bnVtYmVyW10+KFtdKVxuXG4gIHVzZUV4aXRPbkN0cmxDRFdpdGhLZXliaW5kaW5ncygpXG5cbiAgLy8gSGFuZGxlIGNvbXBsZXRpb24gaW4gdXNlRWZmZWN0IHRvIGF2b2lkIHVwZGF0aW5nIHBhcmVudCBkdXJpbmcgcmVuZGVyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzQ29tcGxldGVkKSB7XG4gICAgICBzZXROYXZpZ2F0aW9uSGlzdG9yeShbXSlcbiAgICAgIHZvaWQgb25Db21wbGV0ZSh3aXphcmREYXRhKVxuICAgIH1cbiAgfSwgW2lzQ29tcGxldGVkLCB3aXphcmREYXRhLCBvbkNvbXBsZXRlXSlcblxuICBjb25zdCBnb05leHQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGN1cnJlbnRTdGVwSW5kZXggPCBzdGVwcy5sZW5ndGggLSAxKSB7XG4gICAgICAvLyBJZiB3ZSBoYXZlIGhpc3RvcnkgKG5vbi1saW5lYXIgZmxvdyksIGFkZCBjdXJyZW50IHN0ZXAgdG8gaXRcbiAgICAgIGlmIChuYXZpZ2F0aW9uSGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNldE5hdmlnYXRpb25IaXN0b3J5KHByZXYgPT4gWy4uLnByZXYsIGN1cnJlbnRTdGVwSW5kZXhdKVxuICAgICAgfVxuXG4gICAgICBzZXRDdXJyZW50U3RlcEluZGV4KHByZXYgPT4gcHJldiArIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE1hcmsgYXMgY29tcGxldGVkLCB3aGljaCB3aWxsIHRyaWdnZXIgdXNlRWZmZWN0XG4gICAgICBzZXRJc0NvbXBsZXRlZCh0cnVlKVxuICAgIH1cbiAgfSwgW2N1cnJlbnRTdGVwSW5kZXgsIHN0ZXBzLmxlbmd0aCwgbmF2aWdhdGlvbkhpc3RvcnldKVxuXG4gIGNvbnN0IGdvQmFjayA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIG5hdmlnYXRpb24gaGlzdG9yeSB0byB1c2VcbiAgICBpZiAobmF2aWdhdGlvbkhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgcHJldmlvdXNTdGVwID0gbmF2aWdhdGlvbkhpc3RvcnlbbmF2aWdhdGlvbkhpc3RvcnkubGVuZ3RoIC0gMV1cbiAgICAgIGlmIChwcmV2aW91c1N0ZXAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXROYXZpZ2F0aW9uSGlzdG9yeShwcmV2ID0+IHByZXYuc2xpY2UoMCwgLTEpKVxuICAgICAgICBzZXRDdXJyZW50U3RlcEluZGV4KHByZXZpb3VzU3RlcClcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRTdGVwSW5kZXggPiAwKSB7XG4gICAgICAvLyBGYWxsYmFjayB0byBzaW1wbGUgZGVjcmVtZW50IGlmIG5vIGhpc3RvcnlcbiAgICAgIHNldEN1cnJlbnRTdGVwSW5kZXgocHJldiA9PiBwcmV2IC0gMSlcbiAgICB9IGVsc2UgaWYgKG9uQ2FuY2VsKSB7XG4gICAgICBvbkNhbmNlbCgpXG4gICAgfVxuICB9LCBbY3VycmVudFN0ZXBJbmRleCwgbmF2aWdhdGlvbkhpc3RvcnksIG9uQ2FuY2VsXSlcblxuICBjb25zdCBnb1RvU3RlcCA9IHVzZUNhbGxiYWNrKFxuICAgIChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHN0ZXBzLmxlbmd0aCkge1xuICAgICAgICAvLyBQdXNoIGN1cnJlbnQgc3RlcCB0byBoaXN0b3J5IGJlZm9yZSBqdW1waW5nXG4gICAgICAgIHNldE5hdmlnYXRpb25IaXN0b3J5KHByZXYgPT4gWy4uLnByZXYsIGN1cnJlbnRTdGVwSW5kZXhdKVxuICAgICAgICBzZXRDdXJyZW50U3RlcEluZGV4KGluZGV4KVxuICAgICAgfVxuICAgIH0sXG4gICAgW2N1cnJlbnRTdGVwSW5kZXgsIHN0ZXBzLmxlbmd0aF0sXG4gIClcblxuICBjb25zdCBjYW5jZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0TmF2aWdhdGlvbkhpc3RvcnkoW10pXG4gICAgaWYgKG9uQ2FuY2VsKSB7XG4gICAgICBvbkNhbmNlbCgpXG4gICAgfVxuICB9LCBbb25DYW5jZWxdKVxuXG4gIGNvbnN0IHVwZGF0ZVdpemFyZERhdGEgPSB1c2VDYWxsYmFjaygodXBkYXRlczogUGFydGlhbDxUPikgPT4ge1xuICAgIHNldFdpemFyZERhdGEocHJldiA9PiAoeyAuLi5wcmV2LCAuLi51cGRhdGVzIH0pKVxuICB9LCBbXSlcblxuICBjb25zdCBjb250ZXh0VmFsdWUgPSB1c2VNZW1vPFdpemFyZENvbnRleHRWYWx1ZTxUPj4oXG4gICAgKCkgPT4gKHtcbiAgICAgIGN1cnJlbnRTdGVwSW5kZXgsXG4gICAgICB0b3RhbFN0ZXBzOiBzdGVwcy5sZW5ndGgsXG4gICAgICB3aXphcmREYXRhLFxuICAgICAgc2V0V2l6YXJkRGF0YSxcbiAgICAgIHVwZGF0ZVdpemFyZERhdGEsXG4gICAgICBnb05leHQsXG4gICAgICBnb0JhY2ssXG4gICAgICBnb1RvU3RlcCxcbiAgICAgIGNhbmNlbCxcbiAgICAgIHRpdGxlLFxuICAgICAgc2hvd1N0ZXBDb3VudGVyLFxuICAgIH0pLFxuICAgIFtcbiAgICAgIGN1cnJlbnRTdGVwSW5kZXgsXG4gICAgICBzdGVwcy5sZW5ndGgsXG4gICAgICB3aXphcmREYXRhLFxuICAgICAgdXBkYXRlV2l6YXJkRGF0YSxcbiAgICAgIGdvTmV4dCxcbiAgICAgIGdvQmFjayxcbiAgICAgIGdvVG9TdGVwLFxuICAgICAgY2FuY2VsLFxuICAgICAgdGl0bGUsXG4gICAgICBzaG93U3RlcENvdW50ZXIsXG4gICAgXSxcbiAgKVxuXG4gIGNvbnN0IEN1cnJlbnRTdGVwQ29tcG9uZW50ID0gc3RlcHNbY3VycmVudFN0ZXBJbmRleF1cblxuICBpZiAoIUN1cnJlbnRTdGVwQ29tcG9uZW50IHx8IGlzQ29tcGxldGVkKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPFdpemFyZENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e2NvbnRleHRWYWx1ZX0+XG4gICAgICB7Y2hpbGRyZW4gfHwgPEN1cnJlbnRTdGVwQ29tcG9uZW50IC8+fVxuICAgIDwvV2l6YXJkQ29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsS0FBSyxJQUNWQyxhQUFhLEVBQ2IsS0FBS0MsU0FBUyxFQUNkQyxXQUFXLEVBQ1hDLFNBQVMsRUFDVEMsT0FBTyxFQUNQQyxRQUFRLFFBQ0gsT0FBTztBQUNkLFNBQVNDLDhCQUE4QixRQUFRLCtDQUErQztBQUM5RixjQUFjQyxrQkFBa0IsRUFBRUMsbUJBQW1CLFFBQVEsWUFBWTs7QUFFekU7QUFDQTtBQUNBLE9BQU8sTUFBTUMsYUFBYSxHQUFHVCxhQUFhLENBQUNPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztBQUVoRixPQUFPLFNBQUFHLGVBQUFDLEVBQUE7RUFBQSxNQUFBQyxDQUFBLEdBQUFDLEVBQUE7RUFBMkQ7SUFBQUMsS0FBQTtJQUFBQyxXQUFBLEVBQUFDLEVBQUE7SUFBQUMsVUFBQTtJQUFBQyxRQUFBO0lBQUFDLFFBQUE7SUFBQUMsS0FBQTtJQUFBQyxlQUFBLEVBQUFDO0VBQUEsSUFBQVgsRUFRekM7RUFBQSxJQUFBWSxFQUFBO0VBQUEsSUFBQVgsQ0FBQSxRQUFBSSxFQUFBO0lBTnZCTyxFQUFBLEdBQUFQLEVBQXFCLEtBQXJCUSxTQUFxQixHQUFQLENBQUMsQ0FBQyxJQUFJQyxDQUFDLEdBQXJCVCxFQUFxQjtJQUFBSixDQUFBLE1BQUFJLEVBQUE7SUFBQUosQ0FBQSxNQUFBVyxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBWCxDQUFBO0VBQUE7RUFBckIsTUFBQUcsV0FBQSxHQUFBUSxFQUFxQjtFQUtyQixNQUFBRixlQUFBLEdBQUFDLEVBQXNCLEtBQXRCRSxTQUFzQixHQUF0QixJQUFzQixHQUF0QkYsRUFBc0I7RUFFdEIsT0FBQUksZ0JBQUEsRUFBQUMsbUJBQUEs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
