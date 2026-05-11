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
var React = require("react");
var getOauthProfile_js_1 = require("../../services/oauth/getOauthProfile.js");
var auth_js_1 = require("../../utils/auth.js");
var browser_js_1 = require("../../utils/browser.js");
var log_js_1 = require("../../utils/log.js");
var login_js_1 = require("../login/login.js");
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        var tokens, isMax20x, profile, url, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    if (!(0, auth_js_1.isClaudeAISubscriber)()) return [3 /*break*/, 4];
                    tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                    isMax20x = false;
                    if (!((tokens === null || tokens === void 0 ? void 0 : tokens.subscriptionType) && (tokens === null || tokens === void 0 ? void 0 : tokens.rateLimitTier))) return [3 /*break*/, 1];
                    isMax20x = tokens.subscriptionType === 'max' && tokens.rateLimitTier === 'default_claude_max_20x';
                    return [3 /*break*/, 3];
                case 1:
                    if (!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, getOauthProfile_js_1.getOauthProfileFromOauthToken)(tokens.accessToken)];
                case 2:
                    profile = _c.sent();
                    isMax20x = ((_a = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _a === void 0 ? void 0 : _a.organization_type) === 'claude_max' && ((_b = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _b === void 0 ? void 0 : _b.rate_limit_tier) === 'default_claude_max_20x';
                    _c.label = 3;
                case 3:
                    if (isMax20x) {
                        setTimeout(onDone, 0, 'You are already on the highest Max subscription plan. For additional usage, run /login to switch to an API usage-billed account.');
                        return [2 /*return*/, null];
                    }
                    _c.label = 4;
                case 4:
                    url = 'https://claude.ai/upgrade/max';
                    return [4 /*yield*/, (0, browser_js_1.openBrowser)(url)];
                case 5:
                    _c.sent();
                    return [2 /*return*/, <login_js_1.Login startingMessage={'Starting new login following /upgrade. Exit with Ctrl-C to use existing account.'} onDone={function (success) {
                                context.onChangeAPIKey();
                                onDone(success ? 'Login successful' : 'Login interrupted');
                            }}/>];
                case 6:
                    error_1 = _c.sent();
                    (0, log_js_1.logError)(error_1);
                    setTimeout(onDone, 0, 'Failed to open browser. Please visit https://claude.ai/upgrade/max to upgrade.');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, null];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkxvY2FsSlNYQ29tbWFuZENvbnRleHQiLCJnZXRPYXV0aFByb2ZpbGVGcm9tT2F1dGhUb2tlbiIsIkxvY2FsSlNYQ29tbWFuZE9uRG9uZSIsImdldENsYXVkZUFJT0F1dGhUb2tlbnMiLCJpc0NsYXVkZUFJU3Vic2NyaWJlciIsIm9wZW5Ccm93c2VyIiwibG9nRXJyb3IiLCJMb2dpbiIsImNhbGwiLCJvbkRvbmUiLCJjb250ZXh0IiwiUHJvbWlzZSIsIlJlYWN0Tm9kZSIsInRva2VucyIsImlzTWF4MjB4Iiwic3Vic2NyaXB0aW9uVHlwZSIsInJhdGVMaW1pdFRpZXIiLCJhY2Nlc3NUb2tlbiIsInByb2ZpbGUiLCJvcmdhbml6YXRpb24iLCJvcmdhbml6YXRpb25fdHlwZSIsInJhdGVfbGltaXRfdGllciIsInNldFRpbWVvdXQiLCJ1cmwiLCJzdWNjZXNzIiwib25DaGFuZ2VBUElLZXkiLCJlcnJvciIsIkVycm9yIl0sInNvdXJjZXMiOlsidXBncmFkZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZENvbnRleHQgfSBmcm9tICcuLi8uLi9jb21tYW5kcy5qcydcbmltcG9ydCB7IGdldE9hdXRoUHJvZmlsZUZyb21PYXV0aFRva2VuIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvb2F1dGgvZ2V0T2F1dGhQcm9maWxlLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRPbkRvbmUgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuaW1wb3J0IHtcbiAgZ2V0Q2xhdWRlQUlPQXV0aFRva2VucyxcbiAgaXNDbGF1ZGVBSVN1YnNjcmliZXIsXG59IGZyb20gJy4uLy4uL3V0aWxzL2F1dGguanMnXG5pbXBvcnQgeyBvcGVuQnJvd3NlciB9IGZyb20gJy4uLy4uL3V0aWxzL2Jyb3dzZXIuanMnXG5pbXBvcnQgeyBsb2dFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2xvZy5qcydcbmltcG9ydCB7IExvZ2luIH0gZnJvbSAnLi4vbG9naW4vbG9naW4uanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgY29udGV4dDogTG9jYWxKU1hDb21tYW5kQ29udGV4dCxcbik6IFByb21pc2U8UmVhY3QuUmVhY3ROb2RlIHwgbnVsbD4ge1xuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIHVzZXIgaXMgYWxyZWFkeSBvbiB0aGUgaGlnaGVzdCBNYXggcGxhbiAoMjB4KVxuICAgIGlmIChpc0NsYXVkZUFJU3Vic2NyaWJlcigpKSB7XG4gICAgICBjb25zdCB0b2tlbnMgPSBnZXRDbGF1ZGVBSU9BdXRoVG9rZW5zKClcbiAgICAgIGxldCBpc01heDIweCA9IGZhbHNlXG5cbiAgICAgIGlmICh0b2tlbnM/LnN1YnNjcmlwdGlvblR5cGUgJiYgdG9rZW5zPy5yYXRlTGltaXRUaWVyKSB7XG4gICAgICAgIGlzTWF4MjB4ID1cbiAgICAgICAgICB0b2tlbnMuc3Vic2NyaXB0aW9uVHlwZSA9PT0gJ21heCcgJiZcbiAgICAgICAgICB0b2tlbnMucmF0ZUxpbWl0VGllciA9PT0gJ2RlZmF1bHRfY2xhdWRlX21heF8yMHgnXG4gICAgICB9IGVsc2UgaWYgKHRva2Vucz8uYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGdldE9hdXRoUHJvZmlsZUZyb21PYXV0aFRva2VuKHRva2Vucy5hY2Nlc3NUb2tlbilcbiAgICAgICAgaXNNYXgyMHggPVxuICAgICAgICAgIHByb2ZpbGU/Lm9yZ2FuaXphdGlvbj8ub3JnYW5pemF0aW9uX3R5cGUgPT09ICdjbGF1ZGVfbWF4JyAmJlxuICAgICAgICAgIHByb2ZpbGU/Lm9yZ2FuaXphdGlvbj8ucmF0ZV9saW1pdF90aWVyID09PSAnZGVmYXVsdF9jbGF1ZGVfbWF4XzIweCdcbiAgICAgIH1cblxuICAgICAgaWYgKGlzTWF4MjB4KSB7XG4gICAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICAgb25Eb25lLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgJ1lvdSBhcmUgYWxyZWFkeSBvbiB0aGUgaGlnaGVzdCBNYXggc3Vic2NyaXB0aW9uIHBsYW4uIEZvciBhZGRpdGlvbmFsIHVzYWdlLCBydW4gL2xvZ2luIHRvIHN3aXRjaCB0byBhbiBBUEkgdXNhZ2UtYmlsbGVkIGFjY291bnQuJyxcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHVybCA9ICdodHRwczovL2NsYXVkZS5haS91cGdyYWRlL21heCdcbiAgICBhd2FpdCBvcGVuQnJvd3Nlcih1cmwpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPExvZ2luXG4gICAgICAgIHN0YXJ0aW5nTWVzc2FnZT17XG4gICAgICAgICAgJ1N0YXJ0aW5nIG5ldyBsb2dpbiBmb2xsb3dpbmcgL3VwZ3JhZGUuIEV4aXQgd2l0aCBDdHJsLUMgdG8gdXNlIGV4aXN0aW5nIGFjY291bnQuJ1xuICAgICAgICB9XG4gICAgICAgIG9uRG9uZT17c3VjY2VzcyA9PiB7XG4gICAgICAgICAgY29udGV4dC5vbkNoYW5nZUFQSUtleSgpXG4gICAgICAgICAgb25Eb25lKHN1Y2Nlc3MgPyAnTG9naW4gc3VjY2Vzc2Z1bCcgOiAnTG9naW4gaW50ZXJydXB0ZWQnKVxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICApXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nRXJyb3IoZXJyb3IgYXMgRXJyb3IpXG4gICAgc2V0VGltZW91dChcbiAgICAgIG9uRG9uZSxcbiAgICAgIDAsXG4gICAgICAnRmFpbGVkIHRvIG9wZW4gYnJvd3Nlci4gUGxlYXNlIHZpc2l0IGh0dHBzOi8vY2xhdWRlLmFpL3VwZ3JhZGUvbWF4IHRvIHVwZ3JhZGUuJyxcbiAgICApXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixjQUFjQyxzQkFBc0IsUUFBUSxtQkFBbUI7QUFDL0QsU0FBU0MsNkJBQTZCLFFBQVEseUNBQXlDO0FBQ3ZGLGNBQWNDLHFCQUFxQixRQUFRLHdCQUF3QjtBQUNuRSxTQUNFQyxzQkFBc0IsRUFDdEJDLG9CQUFvQixRQUNmLHFCQUFxQjtBQUM1QixTQUFTQyxXQUFXLFFBQVEsd0JBQXdCO0FBQ3BELFNBQVNDLFFBQVEsUUFBUSxvQkFBb0I7QUFDN0MsU0FBU0MsS0FBSyxRQUFRLG1CQUFtQjtBQUV6QyxPQUFPLGVBQWVDLElBQUlBLENBQ3hCQyxNQUFNLEVBQUVQLHFCQUFxQixFQUM3QlEsT0FBTyxFQUFFVixzQkFBc0IsQ0FDaEMsRUFBRVcsT0FBTyxDQUFDWixLQUFLLENBQUNhLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztFQUNqQyxJQUFJO0lBQ0Y7SUFDQSxJQUFJUixvQkFBb0IsQ0FBQyxDQUFDLEVBQUU7TUFDMUIsTUFBTVMsTUFBTSxHQUFHVixzQkFBc0IsQ0FBQyxDQUFDO01BQ3ZDLElBQUlXLFFBQVEsR0FBRyxLQUFLO01BRXBCLElBQUlELE1BQU0sRUFBRUUsZ0JBQWdCLElBQUlGLE1BQU0sRUFBRUcsYUFBYSxFQUFFO1FBQ3JERixRQUFRLEdBQ05ELE1BQU0sQ0FBQ0UsZ0JBQWdCLEtBQUssS0FBSyxJQUNqQ0YsTUFBTSxDQUFDRyxhQUFhLEtBQUssd0JBQXdCO01BQ3JELENBQUMsTUFBTSxJQUFJSCxNQUFNLEVBQUVJLFdBQVcsRUFBRTtRQUM5QixNQUFNQyxPQUFPLEdBQUcsTUFBTWpCLDZCQUE2QixDQUFDWSxNQUFNLENBQUNJLFdBQVcsQ0FBQztRQUN2RUgsUUFBUSxHQUNOSSxPQUFPLEVBQUVDLFlBQVksRUFBRUMsaUJBQWlCLEtBQUssWUFBWSxJQUN6REYsT0FBTyxFQUFFQyxZQUFZLEVBQUVFLGVBQWUsS0FBSyx3QkFBd0I7TUFDdkU7TUFFQSxJQUFJUCxRQUFRLEVBQUU7UUFDWlEsVUFBVSxDQUNSYixNQUFNLEVBQ04sQ0FBQyxFQUNELGtJQUNGLENBQUM7UUFDRCxPQUFPLElBQUk7TUFDYjtJQUNGO0lBRUEsTUFBTWMsR0FBRyxHQUFHLCtCQUErQjtJQUMzQyxNQUFNbEIsV0FBVyxDQUFDa0IsR0FBRyxDQUFDO0lBRXRCLE9BQ0UsQ0FBQyxLQUFLLENBQ0osZUFBZSxDQUFDLENBQ2Qsa0ZBQ0YsQ0FBQyxDQUNELE1BQU0sQ0FBQyxDQUFDQyxPQUFPLElBQUk7TUFDakJkLE9BQU8sQ0FBQ2UsY0FBYyxDQUFDLENBQUM7TUFDeEJoQixNQUFNLENBQUNlLE9BQU8sR0FBRyxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQztJQUM1RCxDQUFDLENBQUMsR0FDRjtFQUVOLENBQUMsQ0FBQyxPQUFPRSxLQUFLLEVBQUU7SUFDZHBCLFFBQVEsQ0FBQ29CLEtBQUssSUFBSUMsS0FBSyxDQUFDO0lBQ3hCTCxVQUFVLENBQ1JiLE1BQU0sRUFDTixDQUFDLEVBQ0QsZ0ZBQ0YsQ0FBQztFQUNIO0VBQ0EsT0FBTyxJQUFJO0FBQ2IiLCJpZ25vcmVMaXN0IjpbXX0=
