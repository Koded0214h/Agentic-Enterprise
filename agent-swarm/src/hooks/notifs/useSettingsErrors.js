"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSettingsErrors = useSettingsErrors;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var notifications_js_1 = require("src/context/notifications.js");
var state_js_1 = require("../../bootstrap/state.js");
var allErrors_js_1 = require("../../utils/settings/allErrors.js");
var useSettingsChange_js_1 = require("../useSettingsChange.js");
var SETTINGS_ERRORS_NOTIFICATION_KEY = 'settings-errors';
function useSettingsErrors() {
    var $ = (0, compiler_runtime_1.c)(6);
    var _a = (0, notifications_js_1.useNotifications)(), addNotification = _a.addNotification, removeNotification = _a.removeNotification;
    var _b = (0, react_1.useState)(_temp), errors_0 = _b[0], setErrors = _b[1];
    var t0;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = function () {
            var errors_1 = (0, allErrors_js_1.getSettingsWithAllErrors)().errors;
            setErrors(errors_1);
        };
        $[0] = t0;
    }
    else {
        t0 = $[0];
    }
    var handleSettingsChange = t0;
    (0, useSettingsChange_js_1.useSettingsChange)(handleSettingsChange);
    var t1;
    var t2;
    if ($[1] !== addNotification || $[2] !== errors_0 || $[3] !== removeNotification) {
        t1 = function () {
            if ((0, state_js_1.getIsRemoteMode)()) {
                return;
            }
            if (errors_0.length > 0) {
                var message = "Found ".concat(errors_0.length, " settings ").concat(errors_0.length === 1 ? "issue" : "issues", " \u00B7 /doctor for details");
                addNotification({
                    key: SETTINGS_ERRORS_NOTIFICATION_KEY,
                    text: message,
                    color: "warning",
                    priority: "high",
                    timeoutMs: 60000
                });
            }
            else {
                removeNotification(SETTINGS_ERRORS_NOTIFICATION_KEY);
            }
        };
        t2 = [errors_0, addNotification, removeNotification];
        $[1] = addNotification;
        $[2] = errors_0;
        $[3] = removeNotification;
        $[4] = t1;
        $[5] = t2;
    }
    else {
        t1 = $[4];
        t2 = $[5];
    }
    (0, react_1.useEffect)(t1, t2);
    return errors_0;
}
function _temp() {
    var errors = (0, allErrors_js_1.getSettingsWithAllErrors)().errors;
    return errors;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VDYWxsYmFjayIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwidXNlTm90aWZpY2F0aW9ucyIsImdldElzUmVtb3RlTW9kZSIsImdldFNldHRpbmdzV2l0aEFsbEVycm9ycyIsIlZhbGlkYXRpb25FcnJvciIsInVzZVNldHRpbmdzQ2hhbmdlIiwiU0VUVElOR1NfRVJST1JTX05PVElGSUNBVElPTl9LRVkiLCJ1c2VTZXR0aW5nc0Vycm9ycyIsIiQiLCJfYyIsImFkZE5vdGlmaWNhdGlvbiIsInJlbW92ZU5vdGlmaWNhdGlvbiIsImVycm9yc18wIiwic2V0RXJyb3JzIiwiX3RlbXAiLCJ0MCIsIlN5bWJvbCIsImZvciIsImVycm9ycyIsImVycm9yc18xIiwiaGFuZGxlU2V0dGluZ3NDaGFuZ2UiLCJ0MSIsInQyIiwibGVuZ3RoIiwibWVzc2FnZSIsImtleSIsInRleHQiLCJjb2xvciIsInByaW9yaXR5IiwidGltZW91dE1zIl0sInNvdXJjZXMiOlsidXNlU2V0dGluZ3NFcnJvcnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VOb3RpZmljYXRpb25zIH0gZnJvbSAnc3JjL2NvbnRleHQvbm90aWZpY2F0aW9ucy5qcydcbmltcG9ydCB7IGdldElzUmVtb3RlTW9kZSB9IGZyb20gJy4uLy4uL2Jvb3RzdHJhcC9zdGF0ZS5qcydcbmltcG9ydCB7IGdldFNldHRpbmdzV2l0aEFsbEVycm9ycyB9IGZyb20gJy4uLy4uL3V0aWxzL3NldHRpbmdzL2FsbEVycm9ycy5qcydcbmltcG9ydCB0eXBlIHsgVmFsaWRhdGlvbkVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2V0dGluZ3MvdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IHVzZVNldHRpbmdzQ2hhbmdlIH0gZnJvbSAnLi4vdXNlU2V0dGluZ3NDaGFuZ2UuanMnXG5cbmNvbnN0IFNFVFRJTkdTX0VSUk9SU19OT1RJRklDQVRJT05fS0VZID0gJ3NldHRpbmdzLWVycm9ycydcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVNldHRpbmdzRXJyb3JzKCk6IFZhbGlkYXRpb25FcnJvcltdIHtcbiAgY29uc3QgeyBhZGROb3RpZmljYXRpb24sIHJlbW92ZU5vdGlmaWNhdGlvbiB9ID0gdXNlTm90aWZpY2F0aW9ucygpXG4gIGNvbnN0IFtlcnJvcnMsIHNldEVycm9yc10gPSB1c2VTdGF0ZTxWYWxpZGF0aW9uRXJyb3JbXT4oKCkgPT4ge1xuICAgIGNvbnN0IHsgZXJyb3JzIH0gPSBnZXRTZXR0aW5nc1dpdGhBbGxFcnJvcnMoKVxuICAgIHJldHVybiBlcnJvcnNcbiAgfSlcblxuICBjb25zdCBoYW5kbGVTZXR0aW5nc0NoYW5nZSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCB7IGVycm9ycyB9ID0gZ2V0U2V0dGluZ3NXaXRoQWxsRXJyb3JzKClcbiAgICBzZXRFcnJvcnMoZXJyb3JzKVxuICB9LCBbXSlcblxuICB1c2VTZXR0aW5nc0NoYW5nZShoYW5kbGVTZXR0aW5nc0NoYW5nZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChnZXRJc1JlbW90ZU1vZGUoKSkgcmV0dXJuXG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYEZvdW5kICR7ZXJyb3JzLmxlbmd0aH0gc2V0dGluZ3MgJHtlcnJvcnMubGVuZ3RoID09PSAxID8gJ2lzc3VlJyA6ICdpc3N1ZXMnfSDCtyAvZG9jdG9yIGZvciBkZXRhaWxzYFxuICAgICAgYWRkTm90aWZpY2F0aW9uKHtcbiAgICAgICAga2V5OiBTRVRUSU5HU19FUlJPUlNfTk9USUZJQ0FUSU9OX0tFWSxcbiAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgY29sb3I6ICd3YXJuaW5nJyxcbiAgICAgICAgcHJpb3JpdHk6ICdoaWdoJyxcbiAgICAgICAgdGltZW91dE1zOiA2MDAwMCxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZU5vdGlmaWNhdGlvbihTRVRUSU5HU19FUlJPUlNfTk9USUZJQ0FUSU9OX0tFWSlcbiAgICB9XG4gIH0sIFtlcnJvcnMsIGFkZE5vdGlmaWNhdGlvbiwgcmVtb3ZlTm90aWZpY2F0aW9uXSlcblxuICByZXR1cm4gZXJyb3JzXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTQSxXQUFXLEVBQUVDLFNBQVMsRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDeEQsU0FBU0MsZ0JBQWdCLFFBQVEsOEJBQThCO0FBQy9ELFNBQVNDLGVBQWUsUUFBUSwwQkFBMEI7QUFDMUQsU0FBU0Msd0JBQXdCLFFBQVEsbUNBQW1DO0FBQzVFLGNBQWNDLGVBQWUsUUFBUSxvQ0FBb0M7QUFDekUsU0FBU0MsaUJBQWlCLFFBQVEseUJBQXlCO0FBRTNELE1BQU1DLGdDQUFnQyxHQUFHLGlCQUFpQjtBQUUxRCxPQUFPLFNBQUFDLGtCQUFBO0VBQUEsTUFBQUMsQ0FBQSxHQUFBQyxFQUFBO0VBQ0w7SUFBQUMsZUFBQTtJQUFBQztFQUFBLElBQWdEVixnQkFBZ0IsQ0FBQyxDQUFDO0VBQ2xFLE9BQUFXLFFBQUEsRUFBQUMsU0FBQSxJQUE0QmIsUUFBUSxDQUFvQmMsS0FHdkQsQ0FBQztFQUFBLElBQUFDLEVBQUE7RUFBQSxJQUFBUCxDQUFBLFFBQUFRLE1BQUEsQ0FBQUMsR0FBQTtJQUV1Q0YsRUFBQSxHQUFBQSxDQUFBO01BQ3ZDO1FBQUFHLE1BQUEsRUFBQUM7TUFBQSxJQUFtQmhCLHdCQUF3QixDQUFDLENBQUM7TUFDN0NVLFNBQVMsQ0FBQ0ssUUFBTSxDQUFDO0lBQUEsQ0FDbEI7SUFBQVYsQ0FBQSxNQUFBTyxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBUCxDQUFBO0VBQUE7RUFIRCxNQUFBWSxvQkFBQSxHQUE2QkwsRUFHdkI7RUFFTlYsaUJBQWlCLENBQUNlLG9CQUFvQixDQUFDO0VBQUEsSUFBQUMsRUFBQTtFQUFBLElBQUFDLEVBQUE7RUFBQSxJQUFBZCxDQUFBLFFBQUFFLGVBQUEsSUFBQUYsQ0FBQSxRQUFBSSxRQUFBLElBQUFKLENBQUEsUUFBQUcsa0JBQUE7SUFFN0JVLEVBQUEsR0FBQUEsQ0FBQTtNQUNSLElBQUluQixlQUFlLENBQUMsQ0FBQztRQUFBO01BQUE7TUFDckIsSUFBSWdCLFFBQU0sQ0FBQUssTUFBTyxHQUFHLENBQUM7UUFDbkIsTUFBQUMsT0FBQSxHQUFnQixTQUFTTixRQUFNLENBQUFLLE1BQU8sYUFBYUwsUUFBTSxDQUFBSyxNQUFPLEtBQUssQ0FBc0IsR0FBeEMsT0FBd0MsR0FBeEMsUUFBd0Msd0JBQXdCO1FBQ25IYixlQUFlLENBQUM7VUFBQWUsR0FBQSxFQUNUbkIsZ0NBQWdDO1VBQUFvQixJQUFBLEVBQy9CRixPQUFPO1VBQUFHLEtBQUEsRUFDTixTQUFTO1VBQUFDLFFBQUEsRUFDTixNQUFNO1VBQUFDLFNBQUEsRUFDTDtRQUNiLENBQUMsQ0FBQztNQUFBO1FBRUZsQixrQkFBa0IsQ0FBQ0wsZ0NBQWdDLENBQUM7TUFBQTtJQUNyRCxDQUNGO0lBQUVnQixFQUFBLElBQUNKLFFBQU0sRUFBRVIsZUFBZSxFQUFFQyxrQkFBa0IsQ0FBQztJQUFBSCxDQUFBLE1BQUFFLGVBQUE7SUFBQUYsQ0FBQSxNQUFBSSxRQUFBO0lBQUFKLENBQUEsTUFBQUcsa0JBQUE7SUFBQUgsQ0FBQSxNQUFBYSxFQUFBO0lBQUFiLENBQUEsTUFBQWMsRUFBQTtFQUFBO0lBQUFELEVBQUEsR0FBQWIsQ0FBQTtJQUFBYyxFQUFBLEdBQUFkLENBQUE7RUFBQTtFQWRoRFQsU0FBUyxDQUFDc0IsRUFjVCxFQUFFQyxFQUE2QyxDQUFDO0VBQUEsT0FFMUNKLFFBQU07QUFBQTtBQTlCUixTQUFBSixNQUFBO0VBR0g7SUFBQUk7RUFBQSxJQUFtQmYsd0JBQXdCLENBQUMsQ0FBQztFQUFBLE9BQ3RDZSxNQUFNO0FBQUEiLCJpZ25vcmVMaXN0IjpbXX0=
