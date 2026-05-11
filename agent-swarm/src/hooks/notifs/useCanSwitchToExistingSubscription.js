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
exports.useCanSwitchToExistingSubscription = useCanSwitchToExistingSubscription;
var React = require("react");
var getOauthProfile_js_1 = require("src/services/oauth/getOauthProfile.js");
var auth_js_1 = require("src/utils/auth.js");
var ink_js_1 = require("../../ink.js");
var index_js_1 = require("../../services/analytics/index.js");
var config_js_1 = require("../../utils/config.js");
var useStartupNotification_js_1 = require("./useStartupNotification.js");
var MAX_SHOW_COUNT = 3;
/**
 * Hook to check if the user has a subscription on Console but isn't logged into it.
 */
function useCanSwitchToExistingSubscription() {
    (0, useStartupNotification_js_1.useStartupNotification)(_temp2);
}
/**
 * Checks if the user has a subscription but is not currently logged into it.
 * This helps inform users they should run /login to access their subscription.
 */
function _temp2() {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionType;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (((_a = (0, config_js_1.getGlobalConfig)().subscriptionNoticeCount) !== null && _a !== void 0 ? _a : 0) >= MAX_SHOW_COUNT) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, getExistingClaudeSubscription()];
                case 1:
                    subscriptionType = _b.sent();
                    if (subscriptionType === null) {
                        return [2 /*return*/, null];
                    }
                    (0, config_js_1.saveGlobalConfig)(_temp);
                    (0, index_js_1.logEvent)("tengu_switch_to_subscription_notice_shown", {});
                    return [2 /*return*/, {
                            key: "switch-to-subscription",
                            jsx: <ink_js_1.Text color="suggestion">Use your existing Claude {subscriptionType} plan with Claude Code<ink_js_1.Text color="text" dimColor={true}>{" "}· /login to activate</ink_js_1.Text></ink_js_1.Text>,
                            priority: "low"
                        }];
            }
        });
    });
}
function _temp(current) {
    var _a;
    return __assign(__assign({}, current), { subscriptionNoticeCount: ((_a = current.subscriptionNoticeCount) !== null && _a !== void 0 ? _a : 0) + 1 });
}
function getExistingClaudeSubscription() {
    return __awaiter(this, void 0, void 0, function () {
        var profile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If already using subscription auth, there is nothing to switch to
                    if ((0, auth_js_1.isClaudeAISubscriber)()) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, getOauthProfile_js_1.getOauthProfileFromApiKey)()];
                case 1:
                    profile = _a.sent();
                    if (!profile) {
                        return [2 /*return*/, null];
                    }
                    if (profile.account.has_claude_max) {
                        return [2 /*return*/, 'Max'];
                    }
                    if (profile.account.has_claude_pro) {
                        return [2 /*return*/, 'Pro'];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsImdldE9hdXRoUHJvZmlsZUZyb21BcGlLZXkiLCJpc0NsYXVkZUFJU3Vic2NyaWJlciIsIlRleHQiLCJsb2dFdmVudCIsImdldEdsb2JhbENvbmZpZyIsInNhdmVHbG9iYWxDb25maWciLCJ1c2VTdGFydHVwTm90aWZpY2F0aW9uIiwiTUFYX1NIT1dfQ09VTlQiLCJ1c2VDYW5Td2l0Y2hUb0V4aXN0aW5nU3Vic2NyaXB0aW9uIiwiX3RlbXAyIiwic3Vic2NyaXB0aW9uTm90aWNlQ291bnQiLCJzdWJzY3JpcHRpb25UeXBlIiwiZ2V0RXhpc3RpbmdDbGF1ZGVTdWJzY3JpcHRpb24iLCJfdGVtcCIsImtleSIsImpzeCIsInByaW9yaXR5IiwiY3VycmVudCIsIlByb21pc2UiLCJwcm9maWxlIiwiYWNjb3VudCIsImhhc19jbGF1ZGVfbWF4IiwiaGFzX2NsYXVkZV9wcm8iXSwic291cmNlcyI6WyJ1c2VDYW5Td2l0Y2hUb0V4aXN0aW5nU3Vic2NyaXB0aW9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGdldE9hdXRoUHJvZmlsZUZyb21BcGlLZXkgfSBmcm9tICdzcmMvc2VydmljZXMvb2F1dGgvZ2V0T2F1dGhQcm9maWxlLmpzJ1xuaW1wb3J0IHsgaXNDbGF1ZGVBSVN1YnNjcmliZXIgfSBmcm9tICdzcmMvdXRpbHMvYXV0aC5qcydcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi9pbmsuanMnXG5pbXBvcnQgeyBsb2dFdmVudCB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FuYWx5dGljcy9pbmRleC5qcydcbmltcG9ydCB7IGdldEdsb2JhbENvbmZpZywgc2F2ZUdsb2JhbENvbmZpZyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IHVzZVN0YXJ0dXBOb3RpZmljYXRpb24gfSBmcm9tICcuL3VzZVN0YXJ0dXBOb3RpZmljYXRpb24uanMnXG5cbmNvbnN0IE1BWF9TSE9XX0NPVU5UID0gM1xuXG4vKipcbiAqIEhvb2sgdG8gY2hlY2sgaWYgdGhlIHVzZXIgaGFzIGEgc3Vic2NyaXB0aW9uIG9uIENvbnNvbGUgYnV0IGlzbid0IGxvZ2dlZCBpbnRvIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ2FuU3dpdGNoVG9FeGlzdGluZ1N1YnNjcmlwdGlvbigpOiB2b2lkIHtcbiAgdXNlU3RhcnR1cE5vdGlmaWNhdGlvbihhc3luYyAoKSA9PiB7XG4gICAgaWYgKChnZXRHbG9iYWxDb25maWcoKS5zdWJzY3JpcHRpb25Ob3RpY2VDb3VudCA/PyAwKSA+PSBNQVhfU0hPV19DT1VOVCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uVHlwZSA9IGF3YWl0IGdldEV4aXN0aW5nQ2xhdWRlU3Vic2NyaXB0aW9uKClcbiAgICBpZiAoc3Vic2NyaXB0aW9uVHlwZSA9PT0gbnVsbCkgcmV0dXJuIG51bGxcblxuICAgIHNhdmVHbG9iYWxDb25maWcoY3VycmVudCA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIHN1YnNjcmlwdGlvbk5vdGljZUNvdW50OiAoY3VycmVudC5zdWJzY3JpcHRpb25Ob3RpY2VDb3VudCA/PyAwKSArIDEsXG4gICAgfSkpXG4gICAgbG9nRXZlbnQoJ3Rlbmd1X3N3aXRjaF90b19zdWJzY3JpcHRpb25fbm90aWNlX3Nob3duJywge30pXG5cbiAgICByZXR1cm4ge1xuICAgICAga2V5OiAnc3dpdGNoLXRvLXN1YnNjcmlwdGlvbicsXG4gICAgICBqc3g6IChcbiAgICAgICAgPFRleHQgY29sb3I9XCJzdWdnZXN0aW9uXCI+XG4gICAgICAgICAgVXNlIHlvdXIgZXhpc3RpbmcgQ2xhdWRlIHtzdWJzY3JpcHRpb25UeXBlfSBwbGFuIHdpdGggQ2xhdWRlIENvZGVcbiAgICAgICAgICA8VGV4dCBjb2xvcj1cInRleHRcIiBkaW1Db2xvcj5cbiAgICAgICAgICAgIHsnICd9XG4gICAgICAgICAgICDCtyAvbG9naW4gdG8gYWN0aXZhdGVcbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICksXG4gICAgICBwcmlvcml0eTogJ2xvdycsXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgdXNlciBoYXMgYSBzdWJzY3JpcHRpb24gYnV0IGlzIG5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gaXQuXG4gKiBUaGlzIGhlbHBzIGluZm9ybSB1c2VycyB0aGV5IHNob3VsZCBydW4gL2xvZ2luIHRvIGFjY2VzcyB0aGVpciBzdWJzY3JpcHRpb24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEV4aXN0aW5nQ2xhdWRlU3Vic2NyaXB0aW9uKCk6IFByb21pc2U8J01heCcgfCAnUHJvJyB8IG51bGw+IHtcbiAgLy8gSWYgYWxyZWFkeSB1c2luZyBzdWJzY3JpcHRpb24gYXV0aCwgdGhlcmUgaXMgbm90aGluZyB0byBzd2l0Y2ggdG9cbiAgaWYgKGlzQ2xhdWRlQUlTdWJzY3JpYmVyKCkpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBnZXRPYXV0aFByb2ZpbGVGcm9tQXBpS2V5KClcbiAgaWYgKCFwcm9maWxlKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmIChwcm9maWxlLmFjY291bnQuaGFzX2NsYXVkZV9tYXgpIHtcbiAgICByZXR1cm4gJ01heCdcbiAgfVxuXG4gIGlmIChwcm9maWxlLmFjY291bnQuaGFzX2NsYXVkZV9wcm8pIHtcbiAgICByZXR1cm4gJ1BybydcbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBS0EsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0MseUJBQXlCLFFBQVEsdUNBQXVDO0FBQ2pGLFNBQVNDLG9CQUFvQixRQUFRLG1CQUFtQjtBQUN4RCxTQUFTQyxJQUFJLFFBQVEsY0FBYztBQUNuQyxTQUFTQyxRQUFRLFFBQVEsbUNBQW1DO0FBQzVELFNBQVNDLGVBQWUsRUFBRUMsZ0JBQWdCLFFBQVEsdUJBQXVCO0FBQ3pFLFNBQVNDLHNCQUFzQixRQUFRLDZCQUE2QjtBQUVwRSxNQUFNQyxjQUFjLEdBQUcsQ0FBQzs7QUFFeEI7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFBQyxtQ0FBQTtFQUNMRixzQkFBc0IsQ0FBQ0csTUEwQnRCLENBQUM7QUFBQTs7QUFHSjtBQUNBO0FBQ0E7QUFDQTtBQWpDTyxlQUFBQSxPQUFBO0VBRUgsSUFBSSxDQUFDTCxlQUFlLENBQUMsQ0FBQyxDQUFBTSx1QkFBNkIsSUFBOUMsQ0FBOEMsS0FBS0gsY0FBYztJQUFBLE9BQzdELElBQUk7RUFBQTtFQUViLE1BQUFJLGdCQUFBLEdBQXlCLE1BQU1DLDZCQUE2QixDQUFDLENBQUM7RUFDOUQsSUFBSUQsZ0JBQWdCLEtBQUssSUFBSTtJQUFBLE9BQVMsSUFBSTtFQUFBO0VBRTFDTixnQkFBZ0IsQ0FBQ1EsS0FHZixDQUFDO0VBQ0hWLFFBQVEsQ0FBQywyQ0FBMkMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUFBLE9BRWxEO0lBQUFXLEdBQUEsRUFDQSx3QkFBd0I7SUFBQUMsR0FBQSxFQUUzQixDQUFDLElBQUksQ0FBTyxLQUFZLENBQVosWUFBWSxDQUFDLHlCQUNHSixpQkFBZSxDQUFFLHNCQUMzQyxDQUFDLElBQUksQ0FBTyxLQUFNLENBQU4sTUFBTSxDQUFDLFFBQVEsQ0FBUixLQUFPLENBQUMsQ0FDeEIsSUFBRSxDQUFFLG9CQUVQLEVBSEMsSUFBSSxDQUlQLEVBTkMsSUFBSSxDQU1FO0lBQUFLLFFBQUEsRUFFQztFQUNaLENBQUM7QUFBQTtBQTFCRSxTQUFBSCxNQUFBSSxPQUFBO0VBQUEsT0FRMEI7SUFBQSxHQUN4QkEsT0FBTztJQUFBUCx1QkFBQSxFQUNlLENBQUNPLE9BQU8sQ0FBQVAsdUJBQTZCLElBQXBDLENBQW9DLElBQUk7RUFDcEUsQ0FBQztBQUFBO0FBdUJMLGVBQWVFLDZCQUE2QkEsQ0FBQSxDQUFFLEVBQUVNLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO0VBQzVFO0VBQ0EsSUFBSWpCLG9CQUFvQixDQUFDLENBQUMsRUFBRTtJQUMxQixPQUFPLElBQUk7RUFDYjtFQUNBLE1BQU1rQixPQUFPLEdBQUcsTUFBTW5CLHlCQUF5QixDQUFDLENBQUM7RUFDakQsSUFBSSxDQUFDbUIsT0FBTyxFQUFFO0lBQ1osT0FBTyxJQUFJO0VBQ2I7RUFFQSxJQUFJQSxPQUFPLENBQUNDLE9BQU8sQ0FBQ0MsY0FBYyxFQUFFO0lBQ2xDLE9BQU8sS0FBSztFQUNkO0VBRUEsSUFBSUYsT0FBTyxDQUFDQyxPQUFPLENBQUNFLGNBQWMsRUFBRTtJQUNsQyxPQUFPLEtBQUs7RUFDZDtFQUVBLE9BQU8sSUFBSTtBQUNiIiwiaWdub3JlTGlzdCI6W119
