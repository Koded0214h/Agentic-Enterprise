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
exports.Usage = Usage;
var compiler_runtime_1 = require("react/compiler-runtime");
var React = require("react");
var react_1 = require("react");
var index_js_1 = require("src/commands/extra-usage/index.js");
var cost_tracker_js_1 = require("src/cost-tracker.js");
var auth_js_1 = require("src/utils/auth.js");
var useTerminalSize_js_1 = require("../../hooks/useTerminalSize.js");
var ink_js_1 = require("../../ink.js");
var useKeybinding_js_1 = require("../../keybindings/useKeybinding.js");
var usage_js_1 = require("../../services/api/usage.js");
var format_js_1 = require("../../utils/format.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var ConfigurableShortcutHint_js_1 = require("../ConfigurableShortcutHint.js");
var Byline_js_1 = require("../design-system/Byline.js");
var ProgressBar_js_1 = require("../design-system/ProgressBar.js");
var OverageCreditUpsell_js_1 = require("../LogoV2/OverageCreditUpsell.js");
function LimitBar(t0) {
    var $ = (0, compiler_runtime_1.c)(34);
    var title = t0.title, limit = t0.limit, maxWidth = t0.maxWidth, t1 = t0.showTimeInReset, extraSubtext = t0.extraSubtext;
    var showTimeInReset = t1 === undefined ? true : t1;
    var utilization = limit.utilization, resets_at = limit.resets_at;
    if (utilization === null) {
        return null;
    }
    var usedText = "".concat(Math.floor(utilization), "% used");
    var subtext;
    if (resets_at) {
        var t2 = void 0;
        if ($[0] !== resets_at || $[1] !== showTimeInReset) {
            t2 = (0, format_js_1.formatResetText)(resets_at, true, showTimeInReset);
            $[0] = resets_at;
            $[1] = showTimeInReset;
            $[2] = t2;
        }
        else {
            t2 = $[2];
        }
        subtext = "Resets ".concat(t2);
    }
    if (extraSubtext) {
        if (subtext) {
            subtext = "".concat(extraSubtext, " \u00B7 ").concat(subtext);
        }
        else {
            subtext = extraSubtext;
        }
    }
    if (maxWidth >= 62) {
        var t2 = void 0;
        if ($[3] !== title) {
            t2 = <ink_js_1.Text bold={true}>{title}</ink_js_1.Text>;
            $[3] = title;
            $[4] = t2;
        }
        else {
            t2 = $[4];
        }
        var t3 = utilization / 100;
        var t4 = void 0;
        if ($[5] !== t3) {
            t4 = <ProgressBar_js_1.ProgressBar ratio={t3} width={50} fillColor="rate_limit_fill" emptyColor="rate_limit_empty"/>;
            $[5] = t3;
            $[6] = t4;
        }
        else {
            t4 = $[6];
        }
        var t5 = void 0;
        if ($[7] !== usedText) {
            t5 = <ink_js_1.Text>{usedText}</ink_js_1.Text>;
            $[7] = usedText;
            $[8] = t5;
        }
        else {
            t5 = $[8];
        }
        var t6 = void 0;
        if ($[9] !== t4 || $[10] !== t5) {
            t6 = <ink_js_1.Box flexDirection="row" gap={1}>{t4}{t5}</ink_js_1.Box>;
            $[9] = t4;
            $[10] = t5;
            $[11] = t6;
        }
        else {
            t6 = $[11];
        }
        var t7 = void 0;
        if ($[12] !== subtext) {
            t7 = subtext && <ink_js_1.Text dimColor={true}>{subtext}</ink_js_1.Text>;
            $[12] = subtext;
            $[13] = t7;
        }
        else {
            t7 = $[13];
        }
        var t8 = void 0;
        if ($[14] !== t2 || $[15] !== t6 || $[16] !== t7) {
            t8 = <ink_js_1.Box flexDirection="column">{t2}{t6}{t7}</ink_js_1.Box>;
            $[14] = t2;
            $[15] = t6;
            $[16] = t7;
            $[17] = t8;
        }
        else {
            t8 = $[17];
        }
        return t8;
    }
    else {
        var t2 = void 0;
        if ($[18] !== title) {
            t2 = <ink_js_1.Text bold={true}>{title}</ink_js_1.Text>;
            $[18] = title;
            $[19] = t2;
        }
        else {
            t2 = $[19];
        }
        var t3 = void 0;
        if ($[20] !== subtext) {
            t3 = subtext && <><ink_js_1.Text> </ink_js_1.Text><ink_js_1.Text dimColor={true}>· {subtext}</ink_js_1.Text></>;
            $[20] = subtext;
            $[21] = t3;
        }
        else {
            t3 = $[21];
        }
        var t4 = void 0;
        if ($[22] !== t2 || $[23] !== t3) {
            t4 = <ink_js_1.Text>{t2}{t3}</ink_js_1.Text>;
            $[22] = t2;
            $[23] = t3;
            $[24] = t4;
        }
        else {
            t4 = $[24];
        }
        var t5 = utilization / 100;
        var t6 = void 0;
        if ($[25] !== maxWidth || $[26] !== t5) {
            t6 = <ProgressBar_js_1.ProgressBar ratio={t5} width={maxWidth} fillColor="rate_limit_fill" emptyColor="rate_limit_empty"/>;
            $[25] = maxWidth;
            $[26] = t5;
            $[27] = t6;
        }
        else {
            t6 = $[27];
        }
        var t7 = void 0;
        if ($[28] !== usedText) {
            t7 = <ink_js_1.Text>{usedText}</ink_js_1.Text>;
            $[28] = usedText;
            $[29] = t7;
        }
        else {
            t7 = $[29];
        }
        var t8 = void 0;
        if ($[30] !== t4 || $[31] !== t6 || $[32] !== t7) {
            t8 = <ink_js_1.Box flexDirection="column">{t4}{t6}{t7}</ink_js_1.Box>;
            $[30] = t4;
            $[31] = t6;
            $[32] = t7;
            $[33] = t8;
        }
        else {
            t8 = $[33];
        }
        return t8;
    }
}
function Usage() {
    var _this = this;
    var _a = (0, react_1.useState)(null), utilization = _a[0], setUtilization = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var _d = (0, react_1.useState)(true), isLoading = _d[0], setIsLoading = _d[1];
    var columns = (0, useTerminalSize_js_1.useTerminalSize)().columns;
    var availableWidth = columns - 2; // 2 for screen padding
    var maxWidth = Math.min(availableWidth, 80);
    var loadUtilization = React.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var data, err_1, axiosError, responseBody;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    setError(null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, usage_js_1.fetchUtilization)()];
                case 2:
                    data = _b.sent();
                    setUtilization(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    (0, log_js_1.logError)(err_1);
                    axiosError = err_1;
                    responseBody = ((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) ? (0, slowOperations_js_1.jsonStringify)(axiosError.response.data) : undefined;
                    setError(responseBody ? "Failed to load usage data: ".concat(responseBody) : 'Failed to load usage data');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void loadUtilization();
    }, [loadUtilization]);
    (0, useKeybinding_js_1.useKeybinding)('settings:retry', function () {
        void loadUtilization();
    }, {
        context: 'Settings',
        isActive: !!error && !isLoading
    });
    if (error) {
        return <ink_js_1.Box flexDirection="column" gap={1}>
        <ink_js_1.Text color="error">Error: {error}</ink_js_1.Text>
        <ink_js_1.Text dimColor>
          <Byline_js_1.Byline>
            <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="settings:retry" context="Settings" fallback="r" description="retry"/>
            <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel"/>
          </Byline_js_1.Byline>
        </ink_js_1.Text>
      </ink_js_1.Box>;
    }
    if (!utilization) {
        return <ink_js_1.Box flexDirection="column" gap={1}>
        <ink_js_1.Text dimColor>Loading usage data…</ink_js_1.Text>
        <ink_js_1.Text dimColor>
          <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel"/>
        </ink_js_1.Text>
      </ink_js_1.Box>;
    }
    // Only Max and Team plans have a Sonnet limit that differs from the weekly
    // limit (see rateLimitMessages.ts). For other plans the bar is redundant.
    // Show for null (unknown plan) to stay consistent with rateLimitMessages.ts,
    // which labels it "Sonnet limit" in that case.
    var subscriptionType = (0, auth_js_1.getSubscriptionType)();
    var showSonnetBar = subscriptionType === 'max' || subscriptionType === 'team' || subscriptionType === null;
    var limits = __spreadArray([{
            title: 'Current session',
            limit: utilization.five_hour
        }, {
            title: 'Current week (all models)',
            limit: utilization.seven_day
        }], (showSonnetBar ? [{
            title: 'Current week (Sonnet only)',
            limit: utilization.seven_day_sonnet
        }] : []), true);
    return <ink_js_1.Box flexDirection="column" gap={1} width="100%">
      {limits.some(function (_a) {
            var limit = _a.limit;
            return limit;
        }) || <ink_js_1.Text dimColor>/usage is only available for subscription plans.</ink_js_1.Text>}

      {limits.map(function (_a) {
            var title = _a.title, limit_0 = _a.limit;
            return limit_0 && <LimitBar key={title} title={title} limit={limit_0} maxWidth={maxWidth}/>;
        })}

      {utilization.extra_usage && <ExtraUsageSection extraUsage={utilization.extra_usage} maxWidth={maxWidth}/>}

      {(0, OverageCreditUpsell_js_1.isEligibleForOverageCreditGrant)() && <OverageCreditUpsell_js_1.OverageCreditUpsell maxWidth={maxWidth}/>}

      <ink_js_1.Text dimColor>
        <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel"/>
      </ink_js_1.Text>
    </ink_js_1.Box>;
}
var EXTRA_USAGE_SECTION_TITLE = 'Extra usage';
function ExtraUsageSection(t0) {
    var $ = (0, compiler_runtime_1.c)(20);
    var extraUsage = t0.extraUsage, maxWidth = t0.maxWidth;
    var subscriptionType = (0, auth_js_1.getSubscriptionType)();
    var isProOrMax = subscriptionType === "pro" || subscriptionType === "max";
    if (!isProOrMax) {
        return false;
    }
    if (!extraUsage.is_enabled) {
        if (index_js_1.extraUsage.isEnabled()) {
            var t1_1;
            if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
                t1_1 = <ink_js_1.Box flexDirection="column"><ink_js_1.Text bold={true}>{EXTRA_USAGE_SECTION_TITLE}</ink_js_1.Text><ink_js_1.Text dimColor={true}>Extra usage not enabled · /extra-usage to enable</ink_js_1.Text></ink_js_1.Box>;
                $[0] = t1_1;
            }
            else {
                t1_1 = $[0];
            }
            return t1_1;
        }
        return null;
    }
    if (extraUsage.monthly_limit === null) {
        var t1_2;
        if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
            t1_2 = <ink_js_1.Box flexDirection="column"><ink_js_1.Text bold={true}>{EXTRA_USAGE_SECTION_TITLE}</ink_js_1.Text><ink_js_1.Text dimColor={true}>Unlimited</ink_js_1.Text></ink_js_1.Box>;
            $[1] = t1_2;
        }
        else {
            t1_2 = $[1];
        }
        return t1_2;
    }
    if (typeof extraUsage.used_credits !== "number" || typeof extraUsage.utilization !== "number") {
        return null;
    }
    var t1 = extraUsage.used_credits / 100;
    var t2;
    if ($[2] !== t1) {
        t2 = (0, cost_tracker_js_1.formatCost)(t1, 2);
        $[2] = t1;
        $[3] = t2;
    }
    else {
        t2 = $[3];
    }
    var formattedUsedCredits = t2;
    var t3 = extraUsage.monthly_limit / 100;
    var t4;
    if ($[4] !== t3) {
        t4 = (0, cost_tracker_js_1.formatCost)(t3, 2);
        $[4] = t3;
        $[5] = t4;
    }
    else {
        t4 = $[5];
    }
    var formattedMonthlyLimit = t4;
    var T0;
    var t5;
    var t6;
    var t7;
    if ($[6] !== extraUsage.utilization) {
        var now = new Date();
        var oneMonthReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        T0 = LimitBar;
        t7 = EXTRA_USAGE_SECTION_TITLE;
        t5 = extraUsage.utilization;
        t6 = oneMonthReset.toISOString();
        $[6] = extraUsage.utilization;
        $[7] = T0;
        $[8] = t5;
        $[9] = t6;
        $[10] = t7;
    }
    else {
        T0 = $[7];
        t5 = $[8];
        t6 = $[9];
        t7 = $[10];
    }
    var t8;
    if ($[11] !== t5 || $[12] !== t6) {
        t8 = {
            utilization: t5,
            resets_at: t6
        };
        $[11] = t5;
        $[12] = t6;
        $[13] = t8;
    }
    else {
        t8 = $[13];
    }
    var t9 = "".concat(formattedUsedCredits, " / ").concat(formattedMonthlyLimit, " spent");
    var t10;
    if ($[14] !== T0 || $[15] !== maxWidth || $[16] !== t7 || $[17] !== t8 || $[18] !== t9) {
        t10 = <T0 title={t7} limit={t8} showTimeInReset={false} extraSubtext={t9} maxWidth={maxWidth}/>;
        $[14] = T0;
        $[15] = maxWidth;
        $[16] = t7;
        $[17] = t8;
        $[18] = t9;
        $[19] = t10;
    }
    else {
        t10 = $[19];
    }
    return t10;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiZXh0cmFVc2FnZSIsImV4dHJhVXNhZ2VDb21tYW5kIiwiZm9ybWF0Q29zdCIsImdldFN1YnNjcmlwdGlvblR5cGUiLCJ1c2VUZXJtaW5hbFNpemUiLCJCb3giLCJUZXh0IiwidXNlS2V5YmluZGluZyIsIkV4dHJhVXNhZ2UiLCJmZXRjaFV0aWxpemF0aW9uIiwiUmF0ZUxpbWl0IiwiVXRpbGl6YXRpb24iLCJmb3JtYXRSZXNldFRleHQiLCJsb2dFcnJvciIsImpzb25TdHJpbmdpZnkiLCJDb25maWd1cmFibGVTaG9ydGN1dEhpbnQiLCJCeWxpbmUiLCJQcm9ncmVzc0JhciIsImlzRWxpZ2libGVGb3JPdmVyYWdlQ3JlZGl0R3JhbnQiLCJPdmVyYWdlQ3JlZGl0VXBzZWxsIiwiTGltaXRCYXJQcm9wcyIsInRpdGxlIiwibGltaXQiLCJtYXhXaWR0aCIsInNob3dUaW1lSW5SZXNldCIsImV4dHJhU3VidGV4dCIsIkxpbWl0QmFyIiwidDAiLCIkIiwiX2MiLCJ0MSIsInVuZGVmaW5lZCIsInV0aWxpemF0aW9uIiwicmVzZXRzX2F0IiwidXNlZFRleHQiLCJNYXRoIiwiZmxvb3IiLCJzdWJ0ZXh0IiwidDIiLCJ0MyIsInQ0IiwibWF4QmFyV2lkdGgiLCJ0NSIsInQ2IiwidDciLCJ0OCIsIlVzYWdlIiwiUmVhY3ROb2RlIiwic2V0VXRpbGl6YXRpb24iLCJlcnJvciIsInNldEVycm9yIiwiaXNMb2FkaW5nIiwic2V0SXNMb2FkaW5nIiwiY29sdW1ucyIsImF2YWlsYWJsZVdpZHRoIiwibWluIiwibG9hZFV0aWxpemF0aW9uIiwidXNlQ2FsbGJhY2siLCJkYXRhIiwiZXJyIiwiRXJyb3IiLCJheGlvc0Vycm9yIiwicmVzcG9uc2UiLCJyZXNwb25zZUJvZHkiLCJjb250ZXh0IiwiaXNBY3RpdmUiLCJzdWJzY3JpcHRpb25UeXBlIiwic2hvd1Nvbm5ldEJhciIsImxpbWl0cyIsImZpdmVfaG91ciIsInNldmVuX2RheSIsInNldmVuX2RheV9zb25uZXQiLCJzb21lIiwibWFwIiwiZXh0cmFfdXNhZ2UiLCJFeHRyYVVzYWdlU2VjdGlvblByb3BzIiwiRVhUUkFfVVNBR0VfU0VDVElPTl9USVRMRSIsIkV4dHJhVXNhZ2VTZWN0aW9uIiwiaXNQcm9Pck1heCIsImlzX2VuYWJsZWQiLCJpc0VuYWJsZWQiLCJTeW1ib2wiLCJmb3IiLCJtb250aGx5X2xpbWl0IiwidXNlZF9jcmVkaXRzIiwiZm9ybWF0dGVkVXNlZENyZWRpdHMiLCJmb3JtYXR0ZWRNb250aGx5TGltaXQiLCJUMCIsIm5vdyIsIkRhdGUiLCJvbmVNb250aFJlc2V0IiwiZ2V0RnVsbFllYXIiLCJnZXRNb250aCIsInRvSVNPU3RyaW5nIiwidDkiLCJ0MTAiXSwic291cmNlcyI6WyJVc2FnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBleHRyYVVzYWdlIGFzIGV4dHJhVXNhZ2VDb21tYW5kIH0gZnJvbSAnc3JjL2NvbW1hbmRzL2V4dHJhLXVzYWdlL2luZGV4LmpzJ1xuaW1wb3J0IHsgZm9ybWF0Q29zdCB9IGZyb20gJ3NyYy9jb3N0LXRyYWNrZXIuanMnXG5pbXBvcnQgeyBnZXRTdWJzY3JpcHRpb25UeXBlIH0gZnJvbSAnc3JjL3V0aWxzL2F1dGguanMnXG5pbXBvcnQgeyB1c2VUZXJtaW5hbFNpemUgfSBmcm9tICcuLi8uLi9ob29rcy91c2VUZXJtaW5hbFNpemUuanMnXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICcuLi8uLi9pbmsuanMnXG5pbXBvcnQgeyB1c2VLZXliaW5kaW5nIH0gZnJvbSAnLi4vLi4va2V5YmluZGluZ3MvdXNlS2V5YmluZGluZy5qcydcbmltcG9ydCB7XG4gIHR5cGUgRXh0cmFVc2FnZSxcbiAgZmV0Y2hVdGlsaXphdGlvbixcbiAgdHlwZSBSYXRlTGltaXQsXG4gIHR5cGUgVXRpbGl6YXRpb24sXG59IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FwaS91c2FnZS5qcydcbmltcG9ydCB7IGZvcm1hdFJlc2V0VGV4dCB9IGZyb20gJy4uLy4uL3V0aWxzL2Zvcm1hdC5qcydcbmltcG9ydCB7IGxvZ0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvbG9nLmpzJ1xuaW1wb3J0IHsganNvblN0cmluZ2lmeSB9IGZyb20gJy4uLy4uL3V0aWxzL3Nsb3dPcGVyYXRpb25zLmpzJ1xuaW1wb3J0IHsgQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50IH0gZnJvbSAnLi4vQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgQnlsaW5lIH0gZnJvbSAnLi4vZGVzaWduLXN5c3RlbS9CeWxpbmUuanMnXG5pbXBvcnQgeyBQcm9ncmVzc0JhciB9IGZyb20gJy4uL2Rlc2lnbi1zeXN0ZW0vUHJvZ3Jlc3NCYXIuanMnXG5pbXBvcnQge1xuICBpc0VsaWdpYmxlRm9yT3ZlcmFnZUNyZWRpdEdyYW50LFxuICBPdmVyYWdlQ3JlZGl0VXBzZWxsLFxufSBmcm9tICcuLi9Mb2dvVjIvT3ZlcmFnZUNyZWRpdFVwc2VsbC5qcydcblxudHlwZSBMaW1pdEJhclByb3BzID0ge1xuICB0aXRsZTogc3RyaW5nXG4gIGxpbWl0OiBSYXRlTGltaXRcbiAgbWF4V2lkdGg6IG51bWJlclxuICBzaG93VGltZUluUmVzZXQ/OiBib29sZWFuXG4gIGV4dHJhU3VidGV4dD86IHN0cmluZ1xufVxuXG5mdW5jdGlvbiBMaW1pdEJhcih7XG4gIHRpdGxlLFxuICBsaW1pdCxcbiAgbWF4V2lkdGgsXG4gIHNob3dUaW1lSW5SZXNldCA9IHRydWUsXG4gIGV4dHJhU3VidGV4dCxcbn06IExpbWl0QmFyUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCB7IHV0aWxpemF0aW9uLCByZXNldHNfYXQgfSA9IGxpbWl0XG4gIGlmICh1dGlsaXphdGlvbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBDYWxjdWxhdGUgdXNhZ2UgcGVyY2VudGFnZVxuICBjb25zdCB1c2VkVGV4dCA9IGAke01hdGguZmxvb3IodXRpbGl6YXRpb24pfSUgdXNlZGBcblxuICBsZXQgc3VidGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gIGlmIChyZXNldHNfYXQpIHtcbiAgICBzdWJ0ZXh0ID0gYFJlc2V0cyAke2Zvcm1hdFJlc2V0VGV4dChyZXNldHNfYXQsIHRydWUsIHNob3dUaW1lSW5SZXNldCl9YFxuICB9XG5cbiAgaWYgKGV4dHJhU3VidGV4dCkge1xuICAgIGlmIChzdWJ0ZXh0KSB7XG4gICAgICBzdWJ0ZXh0ID0gYCR7ZXh0cmFTdWJ0ZXh0fSDCtyAke3N1YnRleHR9YFxuICAgIH0gZWxzZSB7XG4gICAgICBzdWJ0ZXh0ID0gZXh0cmFTdWJ0ZXh0XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWF4QmFyV2lkdGggPSA1MFxuICBjb25zdCB1c2VkTGFiZWxTcGFjZSA9IDEyXG4gIGlmIChtYXhXaWR0aCA+PSBtYXhCYXJXaWR0aCArIHVzZWRMYWJlbFNwYWNlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICA8VGV4dCBib2xkPnt0aXRsZX08L1RleHQ+XG4gICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cInJvd1wiIGdhcD17MX0+XG4gICAgICAgICAgPFByb2dyZXNzQmFyXG4gICAgICAgICAgICByYXRpbz17dXRpbGl6YXRpb24gLyAxMDB9XG4gICAgICAgICAgICB3aWR0aD17bWF4QmFyV2lkdGh9XG4gICAgICAgICAgICBmaWxsQ29sb3I9XCJyYXRlX2xpbWl0X2ZpbGxcIlxuICAgICAgICAgICAgZW1wdHlDb2xvcj1cInJhdGVfbGltaXRfZW1wdHlcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPFRleHQ+e3VzZWRUZXh0fTwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICAgIHtzdWJ0ZXh0ICYmIDxUZXh0IGRpbUNvbG9yPntzdWJ0ZXh0fTwvVGV4dD59XG4gICAgICA8L0JveD5cbiAgICApXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICA8VGV4dD5cbiAgICAgICAgICA8VGV4dCBib2xkPnt0aXRsZX08L1RleHQ+XG4gICAgICAgICAge3N1YnRleHQgJiYgKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFRleHQ+IDwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgZGltQ29sb3I+wrcge3N1YnRleHR9PC9UZXh0PlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8UHJvZ3Jlc3NCYXJcbiAgICAgICAgICByYXRpbz17dXRpbGl6YXRpb24gLyAxMDB9XG4gICAgICAgICAgd2lkdGg9e21heFdpZHRofVxuICAgICAgICAgIGZpbGxDb2xvcj1cInJhdGVfbGltaXRfZmlsbFwiXG4gICAgICAgICAgZW1wdHlDb2xvcj1cInJhdGVfbGltaXRfZW1wdHlcIlxuICAgICAgICAvPlxuICAgICAgICA8VGV4dD57dXNlZFRleHR9PC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVc2FnZSgpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBbdXRpbGl6YXRpb24sIHNldFV0aWxpemF0aW9uXSA9IHVzZVN0YXRlPFV0aWxpemF0aW9uIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgeyBjb2x1bW5zIH0gPSB1c2VUZXJtaW5hbFNpemUoKVxuXG4gIGNvbnN0IGF2YWlsYWJsZVdpZHRoID0gY29sdW1ucyAtIDIgLy8gMiBmb3Igc2NyZWVuIHBhZGRpbmdcbiAgY29uc3QgbWF4V2lkdGggPSBNYXRoLm1pbihhdmFpbGFibGVXaWR0aCwgODApXG5cbiAgY29uc3QgbG9hZFV0aWxpemF0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIHNldElzTG9hZGluZyh0cnVlKVxuICAgIHNldEVycm9yKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBmZXRjaFV0aWxpemF0aW9uKClcbiAgICAgIHNldFV0aWxpemF0aW9uKGRhdGEpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dFcnJvcihlcnIgYXMgRXJyb3IpXG4gICAgICBjb25zdCBheGlvc0Vycm9yID0gZXJyIGFzIHsgcmVzcG9uc2U/OiB7IGRhdGE/OiB1bmtub3duIH0gfVxuICAgICAgY29uc3QgcmVzcG9uc2VCb2R5ID0gYXhpb3NFcnJvci5yZXNwb25zZT8uZGF0YVxuICAgICAgICA/IGpzb25TdHJpbmdpZnkoYXhpb3NFcnJvci5yZXNwb25zZS5kYXRhKVxuICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgc2V0RXJyb3IoXG4gICAgICAgIHJlc3BvbnNlQm9keVxuICAgICAgICAgID8gYEZhaWxlZCB0byBsb2FkIHVzYWdlIGRhdGE6ICR7cmVzcG9uc2VCb2R5fWBcbiAgICAgICAgICA6ICdGYWlsZWQgdG8gbG9hZCB1c2FnZSBkYXRhJyxcbiAgICAgIClcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB2b2lkIGxvYWRVdGlsaXphdGlvbigpXG4gIH0sIFtsb2FkVXRpbGl6YXRpb25dKVxuXG4gIHVzZUtleWJpbmRpbmcoXG4gICAgJ3NldHRpbmdzOnJldHJ5JyxcbiAgICAoKSA9PiB7XG4gICAgICB2b2lkIGxvYWRVdGlsaXphdGlvbigpXG4gICAgfSxcbiAgICB7IGNvbnRleHQ6ICdTZXR0aW5ncycsIGlzQWN0aXZlOiAhIWVycm9yICYmICFpc0xvYWRpbmcgfSxcbiAgKVxuXG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiAoXG4gICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9PlxuICAgICAgICA8VGV4dCBjb2xvcj1cImVycm9yXCI+RXJyb3I6IHtlcnJvcn08L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPlxuICAgICAgICAgIDxCeWxpbmU+XG4gICAgICAgICAgICA8Q29uZmlndXJhYmxlU2hvcnRjdXRIaW50XG4gICAgICAgICAgICAgIGFjdGlvbj1cInNldHRpbmdzOnJldHJ5XCJcbiAgICAgICAgICAgICAgY29udGV4dD1cIlNldHRpbmdzXCJcbiAgICAgICAgICAgICAgZmFsbGJhY2s9XCJyXCJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb249XCJyZXRyeVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludFxuICAgICAgICAgICAgICBhY3Rpb249XCJjb25maXJtOm5vXCJcbiAgICAgICAgICAgICAgY29udGV4dD1cIlNldHRpbmdzXCJcbiAgICAgICAgICAgICAgZmFsbGJhY2s9XCJFc2NcIlxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbj1cImNhbmNlbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQnlsaW5lPlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICApXG4gIH1cblxuICBpZiAoIXV0aWxpemF0aW9uKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPkxvYWRpbmcgdXNhZ2UgZGF0YeKApjwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgICAgPENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludFxuICAgICAgICAgICAgYWN0aW9uPVwiY29uZmlybTpub1wiXG4gICAgICAgICAgICBjb250ZXh0PVwiU2V0dGluZ3NcIlxuICAgICAgICAgICAgZmFsbGJhY2s9XCJFc2NcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJjYW5jZWxcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIClcbiAgfVxuXG4gIC8vIE9ubHkgTWF4IGFuZCBUZWFtIHBsYW5zIGhhdmUgYSBTb25uZXQgbGltaXQgdGhhdCBkaWZmZXJzIGZyb20gdGhlIHdlZWtseVxuICAvLyBsaW1pdCAoc2VlIHJhdGVMaW1pdE1lc3NhZ2VzLnRzKS4gRm9yIG90aGVyIHBsYW5zIHRoZSBiYXIgaXMgcmVkdW5kYW50LlxuICAvLyBTaG93IGZvciBudWxsICh1bmtub3duIHBsYW4pIHRvIHN0YXkgY29uc2lzdGVudCB3aXRoIHJhdGVMaW1pdE1lc3NhZ2VzLnRzLFxuICAvLyB3aGljaCBsYWJlbHMgaXQgXCJTb25uZXQgbGltaXRcIiBpbiB0aGF0IGNhc2UuXG4gIGNvbnN0IHN1YnNjcmlwdGlvblR5cGUgPSBnZXRTdWJzY3JpcHRpb25UeXBlKClcbiAgY29uc3Qgc2hvd1Nvbm5ldEJhciA9XG4gICAgc3Vic2NyaXB0aW9uVHlwZSA9PT0gJ21heCcgfHxcbiAgICBzdWJzY3JpcHRpb25UeXBlID09PSAndGVhbScgfHxcbiAgICBzdWJzY3JpcHRpb25UeXBlID09PSBudWxsXG5cbiAgY29uc3QgbGltaXRzID0gW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnQ3VycmVudCBzZXNzaW9uJyxcbiAgICAgIGxpbWl0OiB1dGlsaXphdGlvbi5maXZlX2hvdXIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ0N1cnJlbnQgd2VlayAoYWxsIG1vZGVscyknLFxuICAgICAgbGltaXQ6IHV0aWxpemF0aW9uLnNldmVuX2RheSxcbiAgICB9LFxuICAgIC4uLihzaG93U29ubmV0QmFyXG4gICAgICA/IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aXRsZTogJ0N1cnJlbnQgd2VlayAoU29ubmV0IG9ubHkpJyxcbiAgICAgICAgICAgIGxpbWl0OiB1dGlsaXphdGlvbi5zZXZlbl9kYXlfc29ubmV0LFxuICAgICAgICAgIH0sXG4gICAgICAgIF1cbiAgICAgIDogW10pLFxuICBdXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9IHdpZHRoPVwiMTAwJVwiPlxuICAgICAge2xpbWl0cy5zb21lKCh7IGxpbWl0IH0pID0+IGxpbWl0KSB8fCAoXG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPi91c2FnZSBpcyBvbmx5IGF2YWlsYWJsZSBmb3Igc3Vic2NyaXB0aW9uIHBsYW5zLjwvVGV4dD5cbiAgICAgICl9XG5cbiAgICAgIHtsaW1pdHMubWFwKFxuICAgICAgICAoeyB0aXRsZSwgbGltaXQgfSkgPT5cbiAgICAgICAgICBsaW1pdCAmJiAoXG4gICAgICAgICAgICA8TGltaXRCYXJcbiAgICAgICAgICAgICAga2V5PXt0aXRsZX1cbiAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgICBsaW1pdD17bGltaXR9XG4gICAgICAgICAgICAgIG1heFdpZHRoPXttYXhXaWR0aH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSxcbiAgICAgICl9XG5cbiAgICAgIHt1dGlsaXphdGlvbi5leHRyYV91c2FnZSAmJiAoXG4gICAgICAgIDxFeHRyYVVzYWdlU2VjdGlvblxuICAgICAgICAgIGV4dHJhVXNhZ2U9e3V0aWxpemF0aW9uLmV4dHJhX3VzYWdlfVxuICAgICAgICAgIG1heFdpZHRoPXttYXhXaWR0aH1cbiAgICAgICAgLz5cbiAgICAgICl9XG5cbiAgICAgIHtpc0VsaWdpYmxlRm9yT3ZlcmFnZUNyZWRpdEdyYW50KCkgJiYgKFxuICAgICAgICA8T3ZlcmFnZUNyZWRpdFVwc2VsbCBtYXhXaWR0aD17bWF4V2lkdGh9IC8+XG4gICAgICApfVxuXG4gICAgICA8VGV4dCBkaW1Db2xvcj5cbiAgICAgICAgPENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludFxuICAgICAgICAgIGFjdGlvbj1cImNvbmZpcm06bm9cIlxuICAgICAgICAgIGNvbnRleHQ9XCJTZXR0aW5nc1wiXG4gICAgICAgICAgZmFsbGJhY2s9XCJFc2NcIlxuICAgICAgICAgIGRlc2NyaXB0aW9uPVwiY2FuY2VsXCJcbiAgICAgICAgLz5cbiAgICAgIDwvVGV4dD5cbiAgICA8L0JveD5cbiAgKVxufVxuXG50eXBlIEV4dHJhVXNhZ2VTZWN0aW9uUHJvcHMgPSB7XG4gIGV4dHJhVXNhZ2U6IEV4dHJhVXNhZ2VcbiAgbWF4V2lkdGg6IG51bWJlclxufVxuXG5jb25zdCBFWFRSQV9VU0FHRV9TRUNUSU9OX1RJVExFID0gJ0V4dHJhIHVzYWdlJ1xuXG5mdW5jdGlvbiBFeHRyYVVzYWdlU2VjdGlvbih7XG4gIGV4dHJhVXNhZ2UsXG4gIG1heFdpZHRoLFxufTogRXh0cmFVc2FnZVNlY3Rpb25Qcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IHN1YnNjcmlwdGlvblR5cGUgPSBnZXRTdWJzY3JpcHRpb25UeXBlKClcbiAgY29uc3QgaXNQcm9Pck1heCA9IHN1YnNjcmlwdGlvblR5cGUgPT09ICdwcm8nIHx8IHN1YnNjcmlwdGlvblR5cGUgPT09ICdtYXgnXG4gIGlmICghaXNQcm9Pck1heCkge1xuICAgIC8vIE9ubHkgc2hvdyB0byBQcm8gYW5kIE1heCwgY29uc2lzdGVudCB3aXRoIGNsYXVkZS5haSBub24tYWRtaW4gdXNhZ2Ugc2V0dGluZ3NcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmICghZXh0cmFVc2FnZS5pc19lbmFibGVkKSB7XG4gICAgaWYgKGV4dHJhVXNhZ2VDb21tYW5kLmlzRW5hYmxlZCgpKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj5cbiAgICAgICAgICA8VGV4dCBib2xkPntFWFRSQV9VU0FHRV9TRUNUSU9OX1RJVExFfTwvVGV4dD5cbiAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5FeHRyYSB1c2FnZSBub3QgZW5hYmxlZCDCtyAvZXh0cmEtdXNhZ2UgdG8gZW5hYmxlPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGV4dHJhVXNhZ2UubW9udGhseV9saW1pdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj5cbiAgICAgICAgPFRleHQgYm9sZD57RVhUUkFfVVNBR0VfU0VDVElPTl9USVRMRX08L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPlVubGltaXRlZDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIClcbiAgfVxuXG4gIGlmIChcbiAgICB0eXBlb2YgZXh0cmFVc2FnZS51c2VkX2NyZWRpdHMgIT09ICdudW1iZXInIHx8XG4gICAgdHlwZW9mIGV4dHJhVXNhZ2UudXRpbGl6YXRpb24gIT09ICdudW1iZXInXG4gICkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBmb3JtYXR0ZWRVc2VkQ3JlZGl0cyA9IGZvcm1hdENvc3QoZXh0cmFVc2FnZS51c2VkX2NyZWRpdHMgLyAxMDAsIDIpXG4gIGNvbnN0IGZvcm1hdHRlZE1vbnRobHlMaW1pdCA9IGZvcm1hdENvc3QoZXh0cmFVc2FnZS5tb250aGx5X2xpbWl0IC8gMTAwLCAyKVxuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gIGNvbnN0IG9uZU1vbnRoUmVzZXQgPSBuZXcgRGF0ZShub3cuZ2V0RnVsbFllYXIoKSwgbm93LmdldE1vbnRoKCkgKyAxLCAxKVxuXG4gIHJldHVybiAoXG4gICAgPExpbWl0QmFyXG4gICAgICB0aXRsZT17RVhUUkFfVVNBR0VfU0VDVElPTl9USVRMRX1cbiAgICAgIGxpbWl0PXt7XG4gICAgICAgIHV0aWxpemF0aW9uOiBleHRyYVVzYWdlLnV0aWxpemF0aW9uLFxuICAgICAgICAvLyBOb3QgYXBwbGljYWJsZSBmb3IgZW50ZXJwcmlzZXMsIGJ1dCBmb3Igbm93IHdlIGRvbid0IHJlbmRlciB0aGlzIGZvciB0aGVtXG4gICAgICAgIHJlc2V0c19hdDogb25lTW9udGhSZXNldC50b0lTT1N0cmluZygpLFxuICAgICAgfX1cbiAgICAgIHNob3dUaW1lSW5SZXNldD17ZmFsc2V9XG4gICAgICBleHRyYVN1YnRleHQ9e2Ake2Zvcm1hdHRlZFVzZWRDcmVkaXRzfSAvICR7Zm9ybWF0dGVkTW9udGhseUxpbWl0fSBzcGVudGB9XG4gICAgICBtYXhXaWR0aD17bWF4V2lkdGh9XG4gICAgLz5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxTQUFTLEVBQUVDLFFBQVEsUUFBUSxPQUFPO0FBQzNDLFNBQVNDLFVBQVUsSUFBSUMsaUJBQWlCLFFBQVEsbUNBQW1DO0FBQ25GLFNBQVNDLFVBQVUsUUFBUSxxQkFBcUI7QUFDaEQsU0FBU0MsbUJBQW1CLFFBQVEsbUJBQW1CO0FBQ3ZELFNBQVNDLGVBQWUsUUFBUSxnQ0FBZ0M7QUFDaEUsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLFFBQVEsY0FBYztBQUN4QyxTQUFTQyxhQUFhLFFBQVEsb0NBQW9DO0FBQ2xFLFNBQ0UsS0FBS0MsVUFBVSxFQUNmQyxnQkFBZ0IsRUFDaEIsS0FBS0MsU0FBUyxFQUNkLEtBQUtDLFdBQVcsUUFDWCw2QkFBNkI7QUFDcEMsU0FBU0MsZUFBZSxRQUFRLHVCQUF1QjtBQUN2RCxTQUFTQyxRQUFRLFFBQVEsb0JBQW9CO0FBQzdDLFNBQVNDLGFBQWEsUUFBUSwrQkFBK0I7QUFDN0QsU0FBU0Msd0JBQXdCLFFBQVEsZ0NBQWdDO0FBQ3pFLFNBQVNDLE1BQU0sUUFBUSw0QkFBNEI7QUFDbkQsU0FBU0MsV0FBVyxRQUFRLGlDQUFpQztBQUM3RCxTQUNFQywrQkFBK0IsRUFDL0JDLG1CQUFtQixRQUNkLGtDQUFrQztBQUV6QyxLQUFLQyxhQUFhLEdB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
