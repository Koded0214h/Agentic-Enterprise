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
exports.useInstallMessages = useInstallMessages;
var index_js_1 = require("src/utils/nativeInstaller/index.js");
var useStartupNotification_js_1 = require("./useStartupNotification.js");
function useInstallMessages() {
    (0, useStartupNotification_js_1.useStartupNotification)(_temp2);
}
function _temp2() {
    return __awaiter(this, void 0, void 0, function () {
        var messages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, index_js_1.checkInstall)()];
                case 1:
                    messages = _a.sent();
                    return [2 /*return*/, messages.map(_temp)];
            }
        });
    });
}
function _temp(message, index) {
    var priority = "low";
    if (message.type === "error" || message.userActionRequired) {
        priority = "high";
    }
    else {
        if (message.type === "path" || message.type === "alias") {
            priority = "medium";
        }
    }
    return {
        key: "install-message-".concat(index, "-").concat(message.type),
        text: message.message,
        priority: priority,
        color: message.type === "error" ? "error" : "warning"
    };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGVja0luc3RhbGwiLCJ1c2VTdGFydHVwTm90aWZpY2F0aW9uIiwidXNlSW5zdGFsbE1lc3NhZ2VzIiwiX3RlbXAyIiwibWVzc2FnZXMiLCJtYXAiLCJfdGVtcCIsIm1lc3NhZ2UiLCJpbmRleCIsInByaW9yaXR5IiwidHlwZSIsInVzZXJBY3Rpb25SZXF1aXJlZCIsImtleSIsInRleHQiLCJjb2xvciJdLCJzb3VyY2VzIjpbInVzZUluc3RhbGxNZXNzYWdlcy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2hlY2tJbnN0YWxsIH0gZnJvbSAnc3JjL3V0aWxzL25hdGl2ZUluc3RhbGxlci9pbmRleC5qcydcbmltcG9ydCB7IHVzZVN0YXJ0dXBOb3RpZmljYXRpb24gfSBmcm9tICcuL3VzZVN0YXJ0dXBOb3RpZmljYXRpb24uanMnXG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VJbnN0YWxsTWVzc2FnZXMoKTogdm9pZCB7XG4gIHVzZVN0YXJ0dXBOb3RpZmljYXRpb24oYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IG1lc3NhZ2VzID0gYXdhaXQgY2hlY2tJbnN0YWxsKClcbiAgICByZXR1cm4gbWVzc2FnZXMubWFwKChtZXNzYWdlLCBpbmRleCkgPT4ge1xuICAgICAgbGV0IHByaW9yaXR5OiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnIHwgJ2ltbWVkaWF0ZScgPSAnbG93J1xuICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ2Vycm9yJyB8fCBtZXNzYWdlLnVzZXJBY3Rpb25SZXF1aXJlZCkge1xuICAgICAgICBwcmlvcml0eSA9ICdoaWdoJ1xuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnR5cGUgPT09ICdwYXRoJyB8fCBtZXNzYWdlLnR5cGUgPT09ICdhbGlhcycpIHtcbiAgICAgICAgcHJpb3JpdHkgPSAnbWVkaXVtJ1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBgaW5zdGFsbC1tZXNzYWdlLSR7aW5kZXh9LSR7bWVzc2FnZS50eXBlfWAsXG4gICAgICAgIHRleHQ6IG1lc3NhZ2UubWVzc2FnZSxcbiAgICAgICAgcHJpb3JpdHksXG4gICAgICAgIGNvbG9yOiBtZXNzYWdlLnR5cGUgPT09ICdlcnJvcicgPyAnZXJyb3InIDogJ3dhcm5pbmcnLFxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFlBQVksUUFBUSxvQ0FBb0M7QUFDakUsU0FBU0Msc0JBQXNCLFFBQVEsNkJBQTZCO0FBRXBFLE9BQU8sU0FBQUMsbUJBQUE7RUFDTEQsc0JBQXNCLENBQUNFLE1BZ0J0QixDQUFDO0FBQUE7QUFqQkcsZUFBQUEsT0FBQTtFQUVILE1BQUFDLFFBQUEsR0FBaUIsTUFBTUosWUFBWSxDQUFDLENBQUM7RUFBQSxPQUM5QkksUUFBUSxDQUFBQyxHQUFJLENBQUNDLEtBYW5CLENBQUM7QUFBQTtBQWhCQyxTQUFBQSxNQUFBQyxPQUFBLEVBQUFDLEtBQUE7RUFJRCxJQUFBQyxRQUFBLEdBQXdELEtBQUs7RUFDN0QsSUFBSUYsT0FBTyxDQUFBRyxJQUFLLEtBQUssT0FBcUMsSUFBMUJILE9BQU8sQ0FBQUksa0JBQW1CO0lBQ3hERixRQUFBLENBQUFBLENBQUEsQ0FBV0EsTUFBTTtFQUFUO0lBQ0gsSUFBSUYsT0FBTyxDQUFBRyxJQUFLLEtBQUssTUFBa0MsSUFBeEJILE9BQU8sQ0FBQUcsSUFBSyxLQUFLLE9BQU87TUFDNURELFFBQUEsQ0FBQUEsQ0FBQSxDQUFXQSxRQUFRO0lBQVg7RUFDVDtFQUFBLE9BQ007SUFBQUcsR0FBQSxFQUNBLG1CQUFtQkosS0FBSyxJQUFJRCxPQUFPLENBQUFHLElBQUssRUFBRTtJQUFBRyxJQUFBLEVBQ3pDTixPQUFPLENBQUFBLE9BQVE7SUFBQUUsUUFBQTtJQUFBSyxLQUFBLEVBRWRQLE9BQU8sQ0FBQUcsSUFBSyxLQUFLLE9BQTZCLEdBQTlDLE9BQThDLEdBQTlDO0VBQ1QsQ0FBQztBQUFBIiwiaWdub3JlTGlzdCI6W119
