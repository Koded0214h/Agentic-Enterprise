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
exports.call = call;
var react_1 = require("react");
var login_js_1 = require("../login/login.js");
var extra_usage_core_js_1 = require("./extra-usage-core.js");
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, extra_usage_core_js_1.runExtraUsage)()];
                case 1:
                    result = _a.sent();
                    if (result.type === 'message') {
                        onDone(result.value);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, <login_js_1.Login startingMessage={'Starting new login following /extra-usage. Exit with Ctrl-C to use existing account.'} onDone={function (success) {
                                context.onChangeAPIKey();
                                onDone(success ? 'Login successful' : 'Login interrupted');
                            }}/>];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkxvY2FsSlNYQ29tbWFuZENvbnRleHQiLCJMb2NhbEpTWENvbW1hbmRPbkRvbmUiLCJMb2dpbiIsInJ1bkV4dHJhVXNhZ2UiLCJjYWxsIiwib25Eb25lIiwiY29udGV4dCIsIlByb21pc2UiLCJSZWFjdE5vZGUiLCJyZXN1bHQiLCJ0eXBlIiwidmFsdWUiLCJzdWNjZXNzIiwib25DaGFuZ2VBUElLZXkiXSwic291cmNlcyI6WyJleHRyYS11c2FnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5pbXBvcnQgeyBMb2dpbiB9IGZyb20gJy4uL2xvZ2luL2xvZ2luLmpzJ1xuaW1wb3J0IHsgcnVuRXh0cmFVc2FnZSB9IGZyb20gJy4vZXh0cmEtdXNhZ2UtY29yZS5qcydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGwoXG4gIG9uRG9uZTogTG9jYWxKU1hDb21tYW5kT25Eb25lLFxuICBjb250ZXh0OiBMb2NhbEpTWENvbW1hbmRDb250ZXh0LFxuKTogUHJvbWlzZTxSZWFjdC5SZWFjdE5vZGUgfCBudWxsPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkV4dHJhVXNhZ2UoKVxuXG4gIGlmIChyZXN1bHQudHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgb25Eb25lKHJlc3VsdC52YWx1ZSlcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8TG9naW5cbiAgICAgIHN0YXJ0aW5nTWVzc2FnZT17XG4gICAgICAgICdTdGFydGluZyBuZXcgbG9naW4gZm9sbG93aW5nIC9leHRyYS11c2FnZS4gRXhpdCB3aXRoIEN0cmwtQyB0byB1c2UgZXhpc3RpbmcgYWNjb3VudC4nXG4gICAgICB9XG4gICAgICBvbkRvbmU9e3N1Y2Nlc3MgPT4ge1xuICAgICAgICBjb250ZXh0Lm9uQ2hhbmdlQVBJS2V5KClcbiAgICAgICAgb25Eb25lKHN1Y2Nlc3MgPyAnTG9naW4gc3VjY2Vzc2Z1bCcgOiAnTG9naW4gaW50ZXJydXB0ZWQnKVxuICAgICAgfX1cbiAgICAvPlxuICApXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLEtBQUssTUFBTSxPQUFPO0FBQ3pCLGNBQWNDLHNCQUFzQixRQUFRLG1CQUFtQjtBQUMvRCxjQUFjQyxxQkFBcUIsUUFBUSx3QkFBd0I7QUFDbkUsU0FBU0MsS0FBSyxRQUFRLG1CQUFtQjtBQUN6QyxTQUFTQyxhQUFhLFFBQVEsdUJBQXVCO0FBRXJELE9BQU8sZUFBZUMsSUFBSUEsQ0FDeEJDLE1BQU0sRUFBRUoscUJBQXFCLEVBQzdCSyxPQUFPLEVBQUVOLHNCQUFzQixDQUNoQyxFQUFFTyxPQUFPLENBQUNSLEtBQUssQ0FBQ1MsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0VBQ2pDLE1BQU1DLE1BQU0sR0FBRyxNQUFNTixhQUFhLENBQUMsQ0FBQztFQUVwQyxJQUFJTSxNQUFNLENBQUNDLElBQUksS0FBSyxTQUFTLEVBQUU7SUFDN0JMLE1BQU0sQ0FBQ0ksTUFBTSxDQUFDRSxLQUFLLENBQUM7SUFDcEIsT0FBTyxJQUFJO0VBQ2I7RUFFQSxPQUNFLENBQUMsS0FBSyxDQUNKLGVBQWUsQ0FBQyxDQUNkLHNGQUNGLENBQUMsQ0FDRCxNQUFNLENBQUMsQ0FBQ0MsT0FBTyxJQUFJO0lBQ2pCTixPQUFPLENBQUNPLGNBQWMsQ0FBQyxDQUFDO0lBQ3hCUixNQUFNLENBQUNPLE9BQU8sR0FBRyxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztFQUM1RCxDQUFDLENBQUMsR0FDRjtBQUVOIiwiaWdub3JlTGlzdCI6W119
