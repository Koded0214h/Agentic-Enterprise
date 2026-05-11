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
exports.call = call;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var select_js_1 = require("../../components/CustomSelect/select.js");
var Dialog_js_1 = require("../../components/design-system/Dialog.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var claudeAiLimitsHook_js_1 = require("../../services/claudeAiLimitsHook.js");
var auth_js_1 = require("../../utils/auth.js");
var billing_js_1 = require("../../utils/billing.js");
var extra_usage_js_1 = require("../extra-usage/extra-usage.js");
var index_js_2 = require("../extra-usage/index.js");
var index_js_3 = require("../upgrade/index.js");
var upgrade_js_1 = require("../upgrade/upgrade.js");
function RateLimitOptionsMenu(t0) {
    var _a;
    var $ = (0, compiler_runtime_1.c)(25);
    var onDone = t0.onDone, context = t0.context;
    var _b = (0, react_1.useState)(null), subCommandJSX = _b[0], setSubCommandJSX = _b[1];
    var claudeAiLimits = (0, claudeAiLimitsHook_js_1.useClaudeAiLimits)();
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = (0, auth_js_1.getSubscriptionType)();
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var subscriptionType = t1;
    var t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = (0, auth_js_1.getRateLimitTier)();
        $[1] = t2;
    }
    else {
        t2 = $[1];
    }
    var rateLimitTier = t2;
    var hasExtraUsageEnabled = ((_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.hasExtraUsageEnabled) === true;
    var isMax = subscriptionType === "max";
    var isMax20x = isMax && rateLimitTier === "default_claude_max_20x";
    var isTeamOrEnterprise = subscriptionType === "team" || subscriptionType === "enterprise";
    var buyFirst = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)("tengu_jade_anvil_4", false);
    var t3;
    bb0: {
        var actionOptions = void 0;
        if ($[2] !== claudeAiLimits.overageDisabledReason || $[3] !== claudeAiLimits.overageStatus) {
            actionOptions = [];
            if (index_js_2.extraUsage.isEnabled()) {
                var hasBillingAccess = (0, billing_js_1.hasClaudeAiBillingAccess)();
                var needsToRequestFromAdmin = isTeamOrEnterprise && !hasBillingAccess;
                var isOrgSpendCapDepleted = claudeAiLimits.overageDisabledReason === "out_of_credits" || claudeAiLimits.overageDisabledReason === "org_level_disabled_until" || claudeAiLimits.overageDisabledReason === "org_service_zero_credit_limit";
                if (needsToRequestFromAdmin && isOrgSpendCapDepleted) { }
                else {
                    var isOverageState = claudeAiLimits.overageStatus === "rejected" || claudeAiLimits.overageStatus === "allowed_warning";
                    var label = void 0;
                    if (needsToRequestFromAdmin) {
                        label = isOverageState ? "Request more" : "Request extra usage";
                    }
                    else {
                        label = hasExtraUsageEnabled ? "Add funds to continue with extra usage" : "Switch to extra usage";
                    }
                    var t4_1;
                    if ($[5] !== label) {
                        t4_1 = {
                            label: label,
                            value: "extra-usage"
                        };
                        $[5] = label;
                        $[6] = t4_1;
                    }
                    else {
                        t4_1 = $[6];
                    }
                    actionOptions.push(t4_1);
                }
            }
            if (!isMax20x && !isTeamOrEnterprise && index_js_3.default.isEnabled()) {
                var t4_2;
                if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
                    t4_2 = {
                        label: "Upgrade your plan",
                        value: "upgrade"
                    };
                    $[7] = t4_2;
                }
                else {
                    t4_2 = $[7];
                }
                actionOptions.push(t4_2);
            }
            $[2] = claudeAiLimits.overageDisabledReason;
            $[3] = claudeAiLimits.overageStatus;
            $[4] = actionOptions;
        }
        else {
            actionOptions = $[4];
        }
        var t4_3;
        if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
            t4_3 = {
                label: "Stop and wait for limit to reset",
                value: "cancel"
            };
            $[8] = t4_3;
        }
        else {
            t4_3 = $[8];
        }
        var cancelOption = t4_3;
        if (buyFirst) {
            var t5_1;
            if ($[9] !== actionOptions) {
                t5_1 = __spreadArray(__spreadArray([], actionOptions, true), [cancelOption], false);
                $[9] = actionOptions;
                $[10] = t5_1;
            }
            else {
                t5_1 = $[10];
            }
            t3 = t5_1;
            break bb0;
        }
        var t5_2;
        if ($[11] !== actionOptions) {
            t5_2 = __spreadArray([cancelOption], actionOptions, true);
            $[11] = actionOptions;
            $[12] = t5_2;
        }
        else {
            t5_2 = $[12];
        }
        t3 = t5_2;
    }
    var options = t3;
    var t4;
    if ($[13] !== onDone) {
        t4 = function handleCancel() {
            (0, index_js_1.logEvent)("tengu_rate_limit_options_menu_cancel", {});
            onDone(undefined, {
                display: "skip"
            });
        };
        $[13] = onDone;
        $[14] = t4;
    }
    else {
        t4 = $[14];
    }
    var handleCancel = t4;
    var t5;
    if ($[15] !== context || $[16] !== handleCancel || $[17] !== onDone) {
        t5 = function handleSelect(value) {
            if (value === "upgrade") {
                (0, index_js_1.logEvent)("tengu_rate_limit_options_menu_select_upgrade", {});
                (0, upgrade_js_1.call)(onDone, context).then(function (jsx) {
                    if (jsx) {
                        setSubCommandJSX(jsx);
                    }
                });
            }
            else {
                if (value === "extra-usage") {
                    (0, index_js_1.logEvent)("tengu_rate_limit_options_menu_select_extra_usage", {});
                    (0, extra_usage_js_1.call)(onDone, context).then(function (jsx_0) {
                        if (jsx_0) {
                            setSubCommandJSX(jsx_0);
                        }
                    });
                }
                else {
                    if (value === "cancel") {
                        handleCancel();
                    }
                }
            }
        };
        $[15] = context;
        $[16] = handleCancel;
        $[17] = onDone;
        $[18] = t5;
    }
    else {
        t5 = $[18];
    }
    var handleSelect = t5;
    if (subCommandJSX) {
        return subCommandJSX;
    }
    var t6;
    if ($[19] !== handleSelect || $[20] !== options) {
        t6 = <select_js_1.Select options={options} onChange={handleSelect} visibleOptionCount={options.length}/>;
        $[19] = handleSelect;
        $[20] = options;
        $[21] = t6;
    }
    else {
        t6 = $[21];
    }
    var t7;
    if ($[22] !== handleCancel || $[23] !== t6) {
        t7 = <Dialog_js_1.Dialog title="What do you want to do?" onCancel={handleCancel} color="suggestion">{t6}</Dialog_js_1.Dialog>;
        $[22] = handleCancel;
        $[23] = t6;
        $[24] = t7;
    }
    else {
        t7 = $[24];
    }
    return t7;
}
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, <RateLimitOptionsMenu onDone={onDone} context={context}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsIkNvbW1hbmRSZXN1bHREaXNwbGF5IiwiTG9jYWxKU1hDb21tYW5kQ29udGV4dCIsIk9wdGlvbldpdGhEZXNjcmlwdGlvbiIsIlNlbGVjdCIsIkRpYWxvZyIsImdldEZlYXR1cmVWYWx1ZV9DQUNIRURfTUFZX0JFX1NUQUxFIiwibG9nRXZlbnQiLCJ1c2VDbGF1ZGVBaUxpbWl0cyIsIlRvb2xVc2VDb250ZXh0IiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiZ2V0T2F1dGhBY2NvdW50SW5mbyIsImdldFJhdGVMaW1pdFRpZXIiLCJnZXRTdWJzY3JpcHRpb25UeXBlIiwiaGFzQ2xhdWRlQWlCaWxsaW5nQWNjZXNzIiwiY2FsbCIsImV4dHJhVXNhZ2VDYWxsIiwiZXh0cmFVc2FnZSIsInVwZ3JhZGUiLCJ1cGdyYWRlQ2FsbCIsIlJhdGVMaW1pdE9wdGlvbnNNZW51T3B0aW9uVHlwZSIsIlJhdGVMaW1pdE9wdGlvbnNNZW51UHJvcHMiLCJvbkRvbmUiLCJyZXN1bHQiLCJvcHRpb25zIiwiZGlzcGxheSIsImNvbnRleHQiLCJSYXRlTGltaXRPcHRpb25zTWVudSIsInQwIiwiJCIsIl9jIiwic3ViQ29tbWFuZEpTWCIsInNldFN1YkNvbW1hbmRKU1giLCJjbGF1ZGVBaUxpbWl0cyIsInQxIiwiU3ltYm9sIiwiZm9yIiwic3Vic2NyaXB0aW9uVHlwZSIsInQyIiwicmF0ZUxpbWl0VGllciIsImhhc0V4dHJhVXNhZ2VFbmFibGVkIiwiaXNNYXgiLCJpc01heDIweCIsImlzVGVhbU9yRW50ZXJwcmlzZSIsImJ1eUZpcnN0IiwidDMiLCJiYjAiLCJhY3Rpb25PcHRpb25zIiwib3ZlcmFnZURpc2FibGVkUmVhc29uIiwib3ZlcmFnZVN0YXR1cyIsImlzRW5hYmxlZCIsImhhc0JpbGxpbmdBY2Nlc3MiLCJuZWVkc1RvUmVxdWVzdEZyb21BZG1pbiIsImlzT3JnU3BlbmRDYXBEZXBsZXRlZCIsImlzT3ZlcmFnZVN0YXRlIiwibGFiZWwiLCJ0NCIsInZhbHVlIiwicHVzaCIsImNhbmNlbE9wdGlvbiIsInQ1IiwiaGFuZGxlQ2FuY2VsIiwidW5kZWZpbmVkIiwiaGFuZGxlU2VsZWN0IiwidGhlbiIsImpzeCIsImpzeF8wIiwidDYiLCJsZW5ndGgiLCJ0NyIsIlByb21pc2UiLCJSZWFjdE5vZGUiXSwic291cmNlcyI6WyJyYXRlLWxpbWl0LW9wdGlvbnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUge1xuICBDb21tYW5kUmVzdWx0RGlzcGxheSxcbiAgTG9jYWxKU1hDb21tYW5kQ29udGV4dCxcbn0gZnJvbSAnLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQge1xuICB0eXBlIE9wdGlvbldpdGhEZXNjcmlwdGlvbixcbiAgU2VsZWN0LFxufSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0N1c3RvbVNlbGVjdC9zZWxlY3QuanMnXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuaW1wb3J0IHsgZ2V0RmVhdHVyZVZhbHVlX0NBQ0hFRF9NQVlfQkVfU1RBTEUgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hbmFseXRpY3MvZ3Jvd3RoYm9vay5qcydcbmltcG9ydCB7IGxvZ0V2ZW50IH0gZnJvbSAnLi4vLi4vc2VydmljZXMvYW5hbHl0aWNzL2luZGV4LmpzJ1xuaW1wb3J0IHsgdXNlQ2xhdWRlQWlMaW1pdHMgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9jbGF1ZGVBaUxpbWl0c0hvb2suanMnXG5pbXBvcnQgdHlwZSB7IFRvb2xVc2VDb250ZXh0IH0gZnJvbSAnLi4vLi4vVG9vbC5qcydcbmltcG9ydCB0eXBlIHsgTG9jYWxKU1hDb21tYW5kT25Eb25lIH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcbmltcG9ydCB7XG4gIGdldE9hdXRoQWNjb3VudEluZm8sXG4gIGdldFJhdGVMaW1pdFRpZXIsXG4gIGdldFN1YnNjcmlwdGlvblR5cGUsXG59IGZyb20gJy4uLy4uL3V0aWxzL2F1dGguanMnXG5pbXBvcnQgeyBoYXNDbGF1ZGVBaUJpbGxpbmdBY2Nlc3MgfSBmcm9tICcuLi8uLi91dGlscy9iaWxsaW5nLmpzJ1xuaW1wb3J0IHsgY2FsbCBhcyBleHRyYVVzYWdlQ2FsbCB9IGZyb20gJy4uL2V4dHJhLXVzYWdlL2V4dHJhLXVzYWdlLmpzJ1xuaW1wb3J0IHsgZXh0cmFVc2FnZSB9IGZyb20gJy4uL2V4dHJhLXVzYWdlL2luZGV4LmpzJ1xuaW1wb3J0IHVwZ3JhZGUgZnJvbSAnLi4vdXBncmFkZS9pbmRleC5qcydcbmltcG9ydCB7IGNhbGwgYXMgdXBncmFkZUNhbGwgfSBmcm9tICcuLi91cGdyYWRlL3VwZ3JhZGUuanMnXG5cbnR5cGUgUmF0ZUxpbWl0T3B0aW9uc01lbnVPcHRpb25UeXBlID0gJ3VwZ3JhZGUnIHwgJ2V4dHJhLXVzYWdlJyB8ICdjYW5jZWwnXG5cbnR5cGUgUmF0ZUxpbWl0T3B0aW9uc01lbnVQcm9wcyA9IHtcbiAgb25Eb25lOiAoXG4gICAgcmVzdWx0Pzogc3RyaW5nLFxuICAgIG9wdGlvbnM/OlxuICAgICAgfCB7XG4gICAgICAgICAgZGlzcGxheT86IENvbW1hbmRSZXN1bHREaXNwbGF5IHwgdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgIHwgdW5kZWZpbmVkLFxuICApID0+IHZvaWRcbiAgY29udGV4dDogVG9vbFVzZUNvbnRleHQgJiBMb2NhbEpTWENvbW1hbmRDb250ZXh0XG59XG5cbmZ1bmN0aW9uIFJhdGVMaW1pdE9wdGlvbnNNZW51KHtcbiAgb25Eb25lLFxuICBjb250ZXh0LFxufTogUmF0ZUxpbWl0T3B0aW9uc01lbnVQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IFtzdWJDb21tYW5kSlNYLCBzZXRTdWJDb21tYW5kSlNYXSA9IHVzZVN0YXRlPFJlYWN0LlJlYWN0Tm9kZT4obnVsbClcbiAgY29uc3QgY2xhdWRlQWlMaW1pdHMgPSB1c2VDbGF1ZGVBaUxpbWl0cygpXG4gIGNvbnN0IHN1YnNjcmlwdGlvblR5cGUgPSBnZXRTdWJzY3JpcHRpb25UeXBlKClcbiAgY29uc3QgcmF0ZUxpbWl0VGllciA9IGdldFJhdGVMaW1pdFRpZXIoKVxuICBjb25zdCBoYXNFeHRyYVVzYWdlRW5hYmxlZCA9XG4gICAgZ2V0T2F1dGhBY2NvdW50SW5mbygpPy5oYXNFeHRyYVVzYWdlRW5hYmxlZCA9PT0gdHJ1ZVxuICBjb25zdCBpc01heCA9IHN1YnNjcmlwdGlvblR5cGUgPT09ICdtYXgnXG4gIGNvbnN0IGlzTWF4MjB4ID0gaXNNYXggJiYgcmF0ZUxpbWl0VGllciA9PT0gJ2RlZmF1bHRfY2xhdWRlX21heF8yMHgnXG4gIGNvbnN0IGlzVGVhbU9yRW50ZXJwcmlzZSA9XG4gICAgc3Vic2NyaXB0aW9uVHlwZSA9PT0gJ3RlYW0nIHx8IHN1YnNjcmlwdGlvblR5cGUgPT09ICdlbnRlcnByaXNlJ1xuICBjb25zdCBidXlGaXJzdCA9IGdldEZlYXR1cmVWYWx1ZV9DQUNIRURfTUFZX0JFX1NUQUxFKFxuICAgICd0ZW5ndV9qYWRlX2FudmlsXzQnLFxuICAgIGZhbHNlLFxuICApXG5cbiAgY29uc3Qgb3B0aW9ucyA9IHVzZU1lbW88XG4gICAgT3B0aW9uV2l0aERlc2NyaXB0aW9uPFJhdGVMaW1pdE9wdGlvbnNNZW51T3B0aW9uVHlwZT5bXVxuICA+KCgpID0+IHtcbiAgICBjb25zdCBhY3Rpb25PcHRpb25zOiBPcHRpb25XaXRoRGVzY3JpcHRpb248UmF0ZUxpbWl0T3B0aW9uc01lbnVPcHRpb25UeXBlPltdID1cbiAgICAgIFtdXG5cbiAgICBpZiAoZXh0cmFVc2FnZS5pc0VuYWJsZWQoKSkge1xuICAgICAgY29uc3QgaGFzQmlsbGluZ0FjY2VzcyA9IGhhc0NsYXVkZUFpQmlsbGluZ0FjY2VzcygpXG4gICAgICBjb25zdCBuZWVkc1RvUmVxdWVzdEZyb21BZG1pbiA9IGlzVGVhbU9yRW50ZXJwcmlzZSAmJiAhaGFzQmlsbGluZ0FjY2Vzc1xuICAgICAgLy8gT3JnIHNwZW5kIGNhcCBkZXBsZXRlZCAtIG5vbi1hZG1pbnMgY2FuJ3QgcmVxdWVzdCBtb3JlIHNpbmNlIHRoZXJlJ3Mgbm90aGluZyB0byBhbGxvY2F0ZVxuICAgICAgLy8gLSBvdXRfb2ZfY3JlZGl0czogd2FsbGV0IGVtcHR5XG4gICAgICAvLyAtIG9yZ19sZXZlbF9kaXNhYmxlZF91bnRpbDogb3JnIHNwZW5kIGNhcCBoaXQgZm9yIHRoZSBtb250aFxuICAgICAgLy8gLSBvcmdfc2VydmljZV96ZXJvX2NyZWRpdF9saW1pdDogb3JnIHNlcnZpY2UgaGFzIHplcm8gY3JlZGl0IGxpbWl0XG4gICAgICBjb25zdCBpc09yZ1NwZW5kQ2FwRGVwbGV0ZWQgPVxuICAgICAgICBjbGF1ZGVBaUxpbWl0cy5vdmVyYWdlRGlzYWJsZWRSZWFzb24gPT09ICdvdXRfb2ZfY3JlZGl0cycgfHxcbiAgICAgICAgY2xhdWRlQWlMaW1pdHMub3ZlcmFnZURpc2FibGVkUmVhc29uID09PSAnb3JnX2xldmVsX2Rpc2FibGVkX3VudGlsJyB8fFxuICAgICAgICBjbGF1ZGVBaUxpbWl0cy5vdmVyYWdlRGlzYWJsZWRSZWFzb24gPT09ICdvcmdfc2VydmljZV96ZXJvX2NyZWRpdF9saW1pdCdcblxuICAgICAgLy8gSGlkZSBmb3Igbm9uLWFkbWluIFRlYW0vRW50ZXJwcmlzZSB1c2VycyB3aGVuIG9yZyBzcGVuZCBjYXAgaXMgZGVwbGV0ZWRcbiAgICAgIGlmIChuZWVkc1RvUmVxdWVzdEZyb21BZG1pbiAmJiBpc09yZ1NwZW5kQ2FwRGVwbGV0ZWQpIHtcbiAgICAgICAgLy8gRG9uJ3Qgc2hvdyBleHRyYS11c2FnZSBvcHRpb25cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGlzT3ZlcmFnZVN0YXRlID1cbiAgICAgICAgICBjbGF1ZGVBaUxpbWl0cy5vdmVyYWdlU3RhdHVzID09PSAncmVqZWN0ZWQnIHx8XG4gICAgICAgICAgY2xhdWRlQWlMaW1pdHMub3ZlcmFnZVN0YXR1cyA9PT0gJ2FsbG93ZWRfd2FybmluZydcblxuICAgICAgICBsZXQgbGFiZWw6IHN0cmluZ1xuICAgICAgICBpZiAobmVlZHNUb1JlcXVlc3RGcm9tQWRtaW4pIHtcbiAgICAgICAgICBsYWJlbCA9IGlzT3ZlcmFnZVN0YXRlID8gJ1JlcXVlc3QgbW9yZScgOiAnUmVxdWVzdCBleHRyYSB1c2FnZSdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsYWJlbCA9IGhhc0V4dHJhVXNhZ2VFbmFibGVkXG4gICAgICAgICAgICA/ICdBZGQgZnVuZHMgdG8gY29udGludWUgd2l0aCBleHRyYSB1c2FnZSdcbiAgICAgICAgICAgIDogJ1N3aXRjaCB0byBleHRyYSB1c2FnZSdcbiAgICAgICAgfVxuXG4gICAgICAgIGFjdGlvbk9wdGlvbnMucHVzaCh7XG4gICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgdmFsdWU6ICdleHRyYS11c2FnZScsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpc01heDIweCAmJiAhaXNUZWFtT3JFbnRlcnByaXNlICYmIHVwZ3JhZGUuaXNFbmFibGVkKCkpIHtcbiAgICAgIGFjdGlvbk9wdGlvbnMucHVzaCh7XG4gICAgICAgIGxhYmVsOiAnVXBncmFkZSB5b3VyIHBsYW4nLFxuICAgICAgICB2YWx1ZTogJ3VwZ3JhZGUnLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBjYW5jZWxPcHRpb246IE9wdGlvbldpdGhEZXNjcmlwdGlvbjxSYXRlTGltaXRPcHRpb25zTWVudU9wdGlvblR5cGU+ID1cbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTdG9wIGFuZCB3YWl0IGZvciBsaW1pdCB0byByZXNldCcsXG4gICAgICAgIHZhbHVlOiAnY2FuY2VsJyxcbiAgICAgIH1cblxuICAgIGlmIChidXlGaXJzdCkge1xuICAgICAgcmV0dXJuIFsuLi5hY3Rpb25PcHRpb25zLCBjYW5jZWxPcHRpb25dXG4gICAgfVxuICAgIHJldHVybiBbY2FuY2VsT3B0aW9uLCAuLi5hY3Rpb25PcHRpb25zXVxuICB9LCBbXG4gICAgYnV5Rmlyc3QsXG4gICAgaXNNYXgyMHgsXG4gICAgaXNUZWFtT3JFbnRlcnByaXNlLFxuICAgIGhhc0V4dHJhVXNhZ2VFbmFibGVkLFxuICAgIGNsYXVkZUFpTGltaXRzLm92ZXJhZ2VTdGF0dXMsXG4gICAgY2xhdWRlQWlMaW1pdHMub3ZlcmFnZURpc2FibGVkUmVhc29uLFxuICBdKVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUNhbmNlbCgpOiB2b2lkIHtcbiAgICBsb2dFdmVudCgndGVuZ3VfcmF0ZV9saW1pdF9vcHRpb25zX21lbnVfY2FuY2VsJywge30pXG4gICAgb25Eb25lKHVuZGVmaW5lZCwgeyBkaXNwbGF5OiAnc2tpcCcgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVNlbGVjdCh2YWx1ZTogUmF0ZUxpbWl0T3B0aW9uc01lbnVPcHRpb25UeXBlKTogdm9pZCB7XG4gICAgaWYgKHZhbHVlID09PSAndXBncmFkZScpIHtcbiAgICAgIGxvZ0V2ZW50KCd0ZW5ndV9yYXRlX2xpbWl0X29wdGlvbnNfbWVudV9zZWxlY3RfdXBncmFkZScsIHt9KVxuICAgICAgdm9pZCB1cGdyYWRlQ2FsbChvbkRvbmUsIGNvbnRleHQpLnRoZW4oanN4ID0+IHtcbiAgICAgICAgaWYgKGpzeCkge1xuICAgICAgICAgIHNldFN1YkNvbW1hbmRKU1goanN4KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICdleHRyYS11c2FnZScpIHtcbiAgICAgIGxvZ0V2ZW50KCd0ZW5ndV9yYXRlX2xpbWl0X29wdGlvbnNfbWVudV9zZWxlY3RfZXh0cmFfdXNhZ2UnLCB7fSlcbiAgICAgIHZvaWQgZXh0cmFVc2FnZUNhbGwob25Eb25lLCBjb250ZXh0KS50aGVuKGpzeCA9PiB7XG4gICAgICAgIGlmIChqc3gpIHtcbiAgICAgICAgICBzZXRTdWJDb21tYW5kSlNYKGpzeClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnY2FuY2VsJykge1xuICAgICAgaGFuZGxlQ2FuY2VsKClcbiAgICB9XG4gIH1cblxuICBpZiAoc3ViQ29tbWFuZEpTWCkge1xuICAgIHJldHVybiBzdWJDb21tYW5kSlNYXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxEaWFsb2dcbiAgICAgIHRpdGxlPVwiV2hhdCBkbyB5b3Ugd2FudCB0byBkbz9cIlxuICAgICAgb25DYW5jZWw9e2hhbmRsZUNhbmNlbH1cbiAgICAgIGNvbG9yPVwic3VnZ2VzdGlvblwiXG4gICAgPlxuICAgICAgPFNlbGVjdDxSYXRlTGltaXRPcHRpb25zTWVudU9wdGlvblR5cGU+XG4gICAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVTZWxlY3R9XG4gICAgICAgIHZpc2libGVPcHRpb25Db3VudD17b3B0aW9ucy5sZW5ndGh9XG4gICAgICAvPlxuICAgIDwvRGlhbG9nPlxuICApXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgY29udGV4dDogVG9vbFVzZUNvbnRleHQgJiBMb2NhbEpTWENvbW1hbmRDb250ZXh0LFxuKTogUHJvbWlzZTxSZWFjdC5SZWFjdE5vZGU+IHtcbiAgcmV0dXJuIDxSYXRlTGltaXRPcHRpb25zTWVudSBvbkRvbmU9e29uRG9uZX0gY29udGV4dD17Y29udGV4dH0gLz5cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLEtBQUssSUFBSUMsT0FBTyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUNoRCxjQUNFQyxvQkFBb0IsRUFDcEJDLHNCQUFzQixRQUNqQixtQkFBbUI7QUFDMUIsU0FDRSxLQUFLQyxxQkFBcUIsRUFDMUJDLE1BQU0sUUFDRCx5Q0FBeUM7QUFDaEQsU0FBU0MsTUFBTSxRQUFRLDBDQUEwQztBQUNqRSxTQUFTQyxtQ0FBbUMsUUFBUSx3Q0FBd0M7QUFDNUYsU0FBU0MsUUFBUSxR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
