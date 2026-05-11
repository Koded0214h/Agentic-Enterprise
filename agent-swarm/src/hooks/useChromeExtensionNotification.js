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
exports.useChromeExtensionNotification = useChromeExtensionNotification;
var React = require("react");
var ink_js_1 = require("../ink.js");
var auth_js_1 = require("../utils/auth.js");
var setup_js_1 = require("../utils/claudeInChrome/setup.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var useStartupNotification_js_1 = require("./notifs/useStartupNotification.js");
function getChromeFlag() {
    if (process.argv.includes('--chrome')) {
        return true;
    }
    if (process.argv.includes('--no-chrome')) {
        return false;
    }
    return undefined;
}
function useChromeExtensionNotification() {
    (0, useStartupNotification_js_1.useStartupNotification)(_temp);
}
function _temp() {
    return __awaiter(this, void 0, void 0, function () {
        var chromeFlag, installed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chromeFlag = getChromeFlag();
                    if (!(0, setup_js_1.shouldEnableClaudeInChrome)(chromeFlag)) {
                        return [2 /*return*/, null];
                    }
                    if (true && !(0, auth_js_1.isClaudeAISubscriber)()) {
                        return [2 /*return*/, {
                                key: "chrome-requires-subscription",
                                jsx: <ink_js_1.Text color="error">Claude in Chrome requires a claude.ai subscription</ink_js_1.Text>,
                                priority: "immediate",
                                timeoutMs: 5000
                            }];
                    }
                    return [4 /*yield*/, (0, setup_js_1.isChromeExtensionInstalled)()];
                case 1:
                    installed = _a.sent();
                    if (!installed && !(0, envUtils_js_1.isRunningOnHomespace)()) {
                        return [2 /*return*/, {
                                key: "chrome-extension-not-detected",
                                jsx: <ink_js_1.Text color="warning">Chrome extension not detected · https://claude.ai/chrome to install</ink_js_1.Text>,
                                priority: "immediate",
                                timeoutMs: 3000
                            }];
                    }
                    if (chromeFlag === undefined) {
                        return [2 /*return*/, {
                                key: "claude-in-chrome-default-enabled",
                                text: "Claude in Chrome enabled \xB7 /chrome",
                                priority: "low"
                            }];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIlRleHQiLCJpc0NsYXVkZUFJU3Vic2NyaWJlciIsImlzQ2hyb21lRXh0ZW5zaW9uSW5zdGFsbGVkIiwic2hvdWxkRW5hYmxlQ2xhdWRlSW5DaHJvbWUiLCJpc1J1bm5pbmdPbkhvbWVzcGFjZSIsInVzZVN0YXJ0dXBOb3RpZmljYXRpb24iLCJnZXRDaHJvbWVGbGFnIiwicHJvY2VzcyIsImFyZ3YiLCJpbmNsdWRlcyIsInVuZGVmaW5lZCIsInVzZUNocm9tZUV4dGVuc2lvbk5vdGlmaWNhdGlvbiIsIl90ZW1wIiwiY2hyb21lRmxhZyIsImtleSIsImpzeCIsInByaW9yaXR5IiwidGltZW91dE1zIiwiaW5zdGFsbGVkIiwidGV4dCJdLCJzb3VyY2VzIjpbInVzZUNocm9tZUV4dGVuc2lvbk5vdGlmaWNhdGlvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHsgaXNDbGF1ZGVBSVN1YnNjcmliZXIgfSBmcm9tICcuLi91dGlscy9hdXRoLmpzJ1xuaW1wb3J0IHtcbiAgaXNDaHJvbWVFeHRlbnNpb25JbnN0YWxsZWQsXG4gIHNob3VsZEVuYWJsZUNsYXVkZUluQ2hyb21lLFxufSBmcm9tICcuLi91dGlscy9jbGF1ZGVJbkNocm9tZS9zZXR1cC5qcydcbmltcG9ydCB7IGlzUnVubmluZ09uSG9tZXNwYWNlIH0gZnJvbSAnLi4vdXRpbHMvZW52VXRpbHMuanMnXG5pbXBvcnQgeyB1c2VTdGFydHVwTm90aWZpY2F0aW9uIH0gZnJvbSAnLi9ub3RpZnMvdXNlU3RhcnR1cE5vdGlmaWNhdGlvbi5qcydcblxuZnVuY3Rpb24gZ2V0Q2hyb21lRmxhZygpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHByb2Nlc3MuYXJndi5pbmNsdWRlcygnLS1jaHJvbWUnKSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaWYgKHByb2Nlc3MuYXJndi5pbmNsdWRlcygnLS1uby1jaHJvbWUnKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUNocm9tZUV4dGVuc2lvbk5vdGlmaWNhdGlvbigpOiB2b2lkIHtcbiAgdXNlU3RhcnR1cE5vdGlmaWNhdGlvbihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgY2hyb21lRmxhZyA9IGdldENocm9tZUZsYWcoKVxuICAgIGlmICghc2hvdWxkRW5hYmxlQ2xhdWRlSW5DaHJvbWUoY2hyb21lRmxhZykpIHJldHVybiBudWxsXG5cbiAgICAvLyBDbGF1ZGUgaW4gQ2hyb21lIGlzIG9ubHkgc3VwcG9ydGVkIGZvciBjbGF1ZGUuYWkgc3Vic2NyaWJlcnMgKHVubGVzcyB1c2VyIGlzIGFudClcbiAgICBpZiAoXCJleHRlcm5hbFwiICE9PSAnYW50JyAmJiAhaXNDbGF1ZGVBSVN1YnNjcmliZXIoKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiAnY2hyb21lLXJlcXVpcmVzLXN1YnNjcmlwdGlvbicsXG4gICAgICAgIGpzeDogKFxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZXJyb3JcIj5cbiAgICAgICAgICAgIENsYXVkZSBpbiBDaHJvbWUgcmVxdWlyZXMgYSBjbGF1ZGUuYWkgc3Vic2NyaXB0aW9uXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICApLFxuICAgICAgICBwcmlvcml0eTogJ2ltbWVkaWF0ZScsXG4gICAgICAgIHRpbWVvdXRNczogNTAwMCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YWxsZWQgPSBhd2FpdCBpc0Nocm9tZUV4dGVuc2lvbkluc3RhbGxlZCgpXG4gICAgaWYgKCFpbnN0YWxsZWQgJiYgIWlzUnVubmluZ09uSG9tZXNwYWNlKCkpIHtcbiAgICAgIC8vIFNraXAgbm90aWZpY2F0aW9uIG9uIEhvbWVzcGFjZSBzaW5jZSBDaHJvbWUgc2V0dXAgcmVxdWlyZXMgZGlmZmVyZW50IHN0ZXBzIChzZWUgZ28vaHNwcm94eSlcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtleTogJ2Nocm9tZS1leHRlbnNpb24tbm90LWRldGVjdGVkJyxcbiAgICAgICAganN4OiAoXG4gICAgICAgICAgPFRleHQgY29sb3I9XCJ3YXJuaW5nXCI+XG4gICAgICAgICAgICBDaHJvbWUgZXh0ZW5zaW9uIG5vdCBkZXRlY3RlZCDCtyBodHRwczovL2NsYXVkZS5haS9jaHJvbWUgdG8gaW5zdGFsbFxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgKSxcbiAgICAgICAgLy8gVE9ETyhoYWNreW9uKTogTG93ZXIgdGhlIHByaW9yaXR5IGlmIHRoZSBjbGF1ZGUtaW4tY2hyb21lIGludGVncmF0aW9uIGlzIG5vIGxvbmdlciBvcHQtaW5cbiAgICAgICAgcHJpb3JpdHk6ICdpbW1lZGlhdGUnLFxuICAgICAgICB0aW1lb3V0TXM6IDMwMDAsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjaHJvbWVGbGFnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFNob3cgbG93IHByaW9yaXR5IG5vdGlmaWNhdGlvbiBvbmx5IHdoZW4gQ2hyb21lIGlzIGVuYWJsZWQgYnkgZGVmYXVsdFxuICAgICAgLy8gKG5vdCBleHBsaWNpdGx5IGVuYWJsZWQgd2l0aCAtLWNocm9tZSBvciBkaXNhYmxlZCB3aXRoIC0tbm8tY2hyb21lKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiAnY2xhdWRlLWluLWNocm9tZS1kZWZhdWx0LWVuYWJsZWQnLFxuICAgICAgICB0ZXh0OiBgQ2xhdWRlIGluIENocm9tZSBlbmFibGVkIMK3IC9jaHJvbWVgLFxuICAgICAgICBwcmlvcml0eTogJ2xvdycsXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH0pXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBS0EsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0MsSUFBSSxRQUFRLFdBQVc7QUFDaEMsU0FBU0Msb0JBQW9CLFFBQVEsa0JBQWtCO0FBQ3ZELFNBQ0VDLDBCQUEwQixFQUMxQkMsMEJBQTBCLFFBQ3JCLGtDQUFrQztBQUN6QyxTQUFTQyxvQkFBb0IsUUFBUSxzQkFBc0I7QUFDM0QsU0FBU0Msc0JBQXNCLFFBQVEsb0NBQW9DO0FBRTNFLFNBQVNDLGFBQWFBLENBQUEsQ0FBRSxFQUFFLE9BQU8sR0FBRyxTQUFTLENBQUM7RUFDNUMsSUFBSUMsT0FBTyxDQUFDQyxJQUFJLENBQUNDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtJQUNyQyxPQUFPLElBQUk7RUFDYjtFQUNBLElBQUlGLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7SUFDeEMsT0FBTyxLQUFLO0VBQ2Q7RUFDQSxPQUFPQyxTQUFTO0FBQ2xCO0FBRUEsT0FBTyxTQUFBQywrQkFBQTtFQUNMTixzQkFBc0IsQ0FBQ08sS0EyQ3RCLENBQUM7QUFBQTtBQTVDRyxlQUFBQSxNQUFBO0VBRUgsTUFBQUMsVUFBQSxHQUFtQlAsYUFBYSxDQUFDLENBQUM7RUFDbEMsSUFBSSxDQUFDSCwwQkFBMEIsQ0FBQ1UsVUFBVSxDQUFDO0lBQUEsT0FBUyxJQUFJO0VBQUE7RUFHeEQsSUFBSSxJQUErQyxJQUEvQyxDQUF5Qlosb0JBQW9CLENBQUMsQ0FBQztJQUFBLE9BQzFDO01BQUFhLEdBQUEsRUFDQSw4QkFBOEI7TUFBQUMsR0FBQSxFQUVqQyxDQUFDLElBQUksQ0FBTyxLQUFPLENBQVAsT0FBTyxDQUFDLGtEQUVwQixFQUZDLElBQUksQ0FFRTtNQUFBQyxRQUFBLEVBRUMsV0FBVztNQUFBQyxTQUFBLEVBQ1Y7SUFDYixDQUFDO0VBQUE7RUFHSCxNQUFBQyxTQUFBLEdBQWtCLE1BQU1oQiwwQkFBMEIsQ0FBQyxDQUFDO0VBQ3BELElBQUksQ0FBQ2dCLFNBQW9DLElBQXJDLENBQWVkLG9CQUFvQixDQUFDLENBQUM7SUFBQSxPQUVoQztNQUFBVSxHQUFBLEVBQ0EsK0JBQStCO01BQUFDLEdBQUEsRUFFbEMsQ0FBQyxJQUFJLENBQU8sS0FBUyxDQUFULFNBQVMsQ0FBQyxtRUFFdEIsRUFGQyxJQUFJLENBRUU7TUFBQUMsUUFBQSxFQUdDLFdBQVc7TUFBQUMsU0FBQSxFQUNWO0lBQ2IsQ0FBQztFQUFBO0VBRUgsSUFBSUosVUFBVSxLQUFLSCxTQUFTO0lBQUEsT0FHbkI7TUFBQUksR0FBQSxFQUNBLGtDQUFrQztNQUFBSyxJQUFBLEVBQ2pDLHVDQUFvQztNQUFBSCxRQUFBLEVBQ2hDO0lBQ1osQ0FBQztFQUFBO0VBQ0YsT0FDTSxJQUFJO0FBQUEiLCJpZ25vcmVMaXN0IjpbXX0=
