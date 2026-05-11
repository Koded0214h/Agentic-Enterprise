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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.PermissionRuleList = PermissionRuleList;
var compiler_runtime_1 = require("react/compiler-runtime");
var chalk_1 = require("chalk");
var figures_1 = require("figures");
var React = require("react");
var react_1 = require("react");
var AppState_js_1 = require("src/state/AppState.js");
var PermissionUpdate_js_1 = require("src/utils/permissions/PermissionUpdate.js");
var select_js_1 = require("../../../components/CustomSelect/select.js");
var useExitOnCtrlCDWithKeybindings_js_1 = require("../../../hooks/useExitOnCtrlCDWithKeybindings.js");
var useSearchInput_js_1 = require("../../../hooks/useSearchInput.js");
var ink_js_1 = require("../../../ink.js");
var useKeybinding_js_1 = require("../../../keybindings/useKeybinding.js");
var autoModeDenials_js_1 = require("../../../utils/autoModeDenials.js");
var permissionRuleParser_js_1 = require("../../../utils/permissions/permissionRuleParser.js");
var permissions_js_1 = require("../../../utils/permissions/permissions.js");
var slowOperations_js_1 = require("../../../utils/slowOperations.js");
var Pane_js_1 = require("../../design-system/Pane.js");
var Tabs_js_1 = require("../../design-system/Tabs.js");
var SearchBox_js_1 = require("../../SearchBox.js");
var AddPermissionRules_js_1 = require("./AddPermissionRules.js");
var AddWorkspaceDirectory_js_1 = require("./AddWorkspaceDirectory.js");
var PermissionRuleDescription_js_1 = require("./PermissionRuleDescription.js");
var PermissionRuleInput_js_1 = require("./PermissionRuleInput.js");
var RecentDenialsTab_js_1 = require("./RecentDenialsTab.js");
var RemoveWorkspaceDirectory_js_1 = require("./RemoveWorkspaceDirectory.js");
var WorkspaceTab_js_1 = require("./WorkspaceTab.js");
function RuleSourceText(t0) {
    var $ = (0, compiler_runtime_1.c)(4);
    var rule = t0.rule;
    var t1;
    if ($[0] !== rule.source) {
        t1 = (0, permissions_js_1.permissionRuleSourceDisplayString)(rule.source);
        $[0] = rule.source;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var t2 = "From ".concat(t1);
    var t3;
    if ($[2] !== t2) {
        t3 = <ink_js_1.Text dimColor={true}>{t2}</ink_js_1.Text>;
        $[2] = t2;
        $[3] = t3;
    }
    else {
        t3 = $[3];
    }
    return t3;
}
// Helper function to get the appropriate label for rule behavior
function getRuleBehaviorLabel(ruleBehavior) {
    switch (ruleBehavior) {
        case 'allow':
            return 'allowed';
        case 'deny':
            return 'denied';
        case 'ask':
            return 'ask';
    }
}
// Component for showing tool details and managing the interactive deletion workflow
function RuleDetails(t0) {
    var $ = (0, compiler_runtime_1.c)(42);
    var rule = t0.rule, onDelete = t0.onDelete, onCancel = t0.onCancel;
    var exitState = (0, useExitOnCtrlCDWithKeybindings_js_1.useExitOnCtrlCDWithKeybindings)();
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            context: "Confirmation"
        };
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    (0, useKeybinding_js_1.useKeybinding)("confirm:no", onCancel, t1);
    var t2;
    if ($[1] !== rule.ruleValue) {
        t2 = (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule.ruleValue);
        $[1] = rule.ruleValue;
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var t3;
    if ($[3] !== t2) {
        t3 = <ink_js_1.Text bold={true}>{t2}</ink_js_1.Text>;
        $[3] = t2;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    var t4;
    if ($[5] !== rule.ruleValue) {
        t4 = <PermissionRuleDescription_js_1.PermissionRuleDescription ruleValue={rule.ruleValue}/>;
        $[5] = rule.ruleValue;
        $[6] = t4;
    }
    else {
        t4 = $[6];
    }
    var t5;
    if ($[7] !== rule) {
        t5 = <RuleSourceText rule={rule}/>;
        $[7] = rule;
        $[8] = t5;
    }
    else {
        t5 = $[8];
    }
    var t6;
    if ($[9] !== t3 || $[10] !== t4 || $[11] !== t5) {
        t6 = <ink_js_1.Box flexDirection="column" marginX={2}>{t3}{t4}{t5}</ink_js_1.Box>;
        $[9] = t3;
        $[10] = t4;
        $[11] = t5;
        $[12] = t6;
    }
    else {
        t6 = $[12];
    }
    var ruleDescription = t6;
    var t7;
    if ($[13] !== exitState.keyName || $[14] !== exitState.pending) {
        t7 = <ink_js_1.Box marginLeft={3}>{exitState.pending ? <ink_js_1.Text dimColor={true}>Press {exitState.keyName} again to exit</ink_js_1.Text> : <ink_js_1.Text dimColor={true}>Esc to cancel</ink_js_1.Text>}</ink_js_1.Box>;
        $[13] = exitState.keyName;
        $[14] = exitState.pending;
        $[15] = t7;
    }
    else {
        t7 = $[15];
    }
    var footer = t7;
    if (rule.source === "policySettings") {
        var t8_1;
        if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
            t8_1 = <ink_js_1.Text bold={true} color="permission">Rule details</ink_js_1.Text>;
            $[16] = t8_1;
        }
        else {
            t8_1 = $[16];
        }
        var t9_1;
        if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
            t9_1 = <ink_js_1.Text italic={true}>This rule is configured by managed settings and cannot be modified.{"\n"}Contact your system administrator for more information.</ink_js_1.Text>;
            $[17] = t9_1;
        }
        else {
            t9_1 = $[17];
        }
        var t10_1;
        if ($[18] !== ruleDescription) {
            t10_1 = <ink_js_1.Box flexDirection="column" gap={1} borderStyle="round" paddingLeft={1} paddingRight={1} borderColor="permission">{t8_1}{ruleDescription}{t9_1}</ink_js_1.Box>;
            $[18] = ruleDescription;
            $[19] = t10_1;
        }
        else {
            t10_1 = $[19];
        }
        var t11_1;
        if ($[20] !== footer || $[21] !== t10_1) {
            t11_1 = <>{t10_1}{footer}</>;
            $[20] = footer;
            $[21] = t10_1;
            $[22] = t11_1;
        }
        else {
            t11_1 = $[22];
        }
        return t11_1;
    }
    var t8;
    if ($[23] !== rule.ruleBehavior) {
        t8 = getRuleBehaviorLabel(rule.ruleBehavior);
        $[23] = rule.ruleBehavior;
        $[24] = t8;
    }
    else {
        t8 = $[24];
    }
    var t9;
    if ($[25] !== t8) {
        t9 = <ink_js_1.Text bold={true} color="error">Delete {t8} tool?</ink_js_1.Text>;
        $[25] = t8;
        $[26] = t9;
    }
    else {
        t9 = $[26];
    }
    var t10;
    if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = <ink_js_1.Text>Are you sure you want to delete this permission rule?</ink_js_1.Text>;
        $[27] = t10;
    }
    else {
        t10 = $[27];
    }
    var t11;
    if ($[28] !== onCancel || $[29] !== onDelete) {
        t11 = function (_) { return _ === "yes" ? onDelete() : onCancel(); };
        $[28] = onCancel;
        $[29] = onDelete;
        $[30] = t11;
    }
    else {
        t11 = $[30];
    }
    var t12;
    if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = [{
                label: "Yes",
                value: "yes"
            }, {
                label: "No",
                value: "no"
            }];
        $[31] = t12;
    }
    else {
        t12 = $[31];
    }
    var t13;
    if ($[32] !== onCancel || $[33] !== t11) {
        t13 = <select_js_1.Select onChange={t11} onCancel={onCancel} options={t12}/>;
        $[32] = onCancel;
        $[33] = t11;
        $[34] = t13;
    }
    else {
        t13 = $[34];
    }
    var t14;
    if ($[35] !== ruleDescription || $[36] !== t13 || $[37] !== t9) {
        t14 = <ink_js_1.Box flexDirection="column" gap={1} borderStyle="round" paddingLeft={1} paddingRight={1} borderColor="error">{t9}{ruleDescription}{t10}{t13}</ink_js_1.Box>;
        $[35] = ruleDescription;
        $[36] = t13;
        $[37] = t9;
        $[38] = t14;
    }
    else {
        t14 = $[38];
    }
    var t15;
    if ($[39] !== footer || $[40] !== t14) {
        t15 = <>{t14}{footer}</>;
        $[39] = footer;
        $[40] = t14;
        $[41] = t15;
    }
    else {
        t15 = $[41];
    }
    return t15;
}
// Component for rendering rules tab content with full width support
function RulesTabContent(props) {
    var $ = (0, compiler_runtime_1.c)(26);
    var options = props.options, searchQuery = props.searchQuery, isSearchMode = props.isSearchMode, isFocused = props.isFocused, onSelect = props.onSelect, onCancel = props.onCancel, lastFocusedRuleKey = props.lastFocusedRuleKey, cursorOffset = props.cursorOffset, onHeaderFocusChange = props.onHeaderFocusChange;
    var tabWidth = (0, Tabs_js_1.useTabsWidth)();
    var _a = (0, Tabs_js_1.useTabHeaderFocus)(), headerFocused = _a.headerFocused, focusHeader = _a.focusHeader, blurHeader = _a.blurHeader;
    var t0;
    var t1;
    if ($[0] !== blurHeader || $[1] !== headerFocused || $[2] !== isSearchMode) {
        t0 = function () {
            if (isSearchMode && headerFocused) {
                blurHeader();
            }
        };
        t1 = [isSearchMode, headerFocused, blurHeader];
        $[0] = blurHeader;
        $[1] = headerFocused;
        $[2] = isSearchMode;
        $[3] = t0;
        $[4] = t1;
    }
    else {
        t0 = $[3];
        t1 = $[4];
    }
    (0, react_1.useEffect)(t0, t1);
    var t2;
    var t3;
    if ($[5] !== headerFocused || $[6] !== onHeaderFocusChange) {
        t2 = function () {
            onHeaderFocusChange === null || onHeaderFocusChange === void 0 ? void 0 : onHeaderFocusChange(headerFocused);
        };
        t3 = [headerFocused, onHeaderFocusChange];
        $[5] = headerFocused;
        $[6] = onHeaderFocusChange;
        $[7] = t2;
        $[8] = t3;
    }
    else {
        t2 = $[7];
        t3 = $[8];
    }
    (0, react_1.useEffect)(t2, t3);
    var t4 = isSearchMode && !headerFocused;
    var t5;
    if ($[9] !== cursorOffset || $[10] !== isFocused || $[11] !== searchQuery || $[12] !== t4 || $[13] !== tabWidth) {
        t5 = <ink_js_1.Box marginBottom={1} flexDirection="column"><SearchBox_js_1.SearchBox query={searchQuery} isFocused={t4} isTerminalFocused={isFocused} width={tabWidth} cursorOffset={cursorOffset}/></ink_js_1.Box>;
        $[9] = cursorOffset;
        $[10] = isFocused;
        $[11] = searchQuery;
        $[12] = t4;
        $[13] = tabWidth;
        $[14] = t5;
    }
    else {
        t5 = $[14];
    }
    var t6 = Math.min(10, options.length);
    var t7 = isSearchMode || headerFocused;
    var t8;
    if ($[15] !== focusHeader || $[16] !== lastFocusedRuleKey || $[17] !== onCancel || $[18] !== onSelect || $[19] !== options || $[20] !== t6 || $[21] !== t7) {
        t8 = <select_js_1.Select options={options} onChange={onSelect} onCancel={onCancel} visibleOptionCount={t6} isDisabled={t7} defaultFocusValue={lastFocusedRuleKey} onUpFromFirstItem={focusHeader}/>;
        $[15] = focusHeader;
        $[16] = lastFocusedRuleKey;
        $[17] = onCancel;
        $[18] = onSelect;
        $[19] = options;
        $[20] = t6;
        $[21] = t7;
        $[22] = t8;
    }
    else {
        t8 = $[22];
    }
    var t9;
    if ($[23] !== t5 || $[24] !== t8) {
        t9 = <ink_js_1.Box flexDirection="column">{t5}{t8}</ink_js_1.Box>;
        $[23] = t5;
        $[24] = t8;
        $[25] = t9;
    }
    else {
        t9 = $[25];
    }
    return t9;
}
// Composes the subtitle + search + Select for a single allow/ask/deny tab.
function PermissionRulesTab(t0) {
    var $ = (0, compiler_runtime_1.c)(27);
    var T0;
    var T1;
    var handleToolSelect;
    var rulesProps;
    var t1;
    var t2;
    var t3;
    var t4;
    var tab;
    if ($[0] !== t0) {
        var t5_1 = t0.tab, getRulesOptions = t0.getRulesOptions, t6_1 = t0.handleToolSelect, t7_1 = __rest(t0, ["tab", "getRulesOptions", "handleToolSelect"]);
        tab = t5_1;
        handleToolSelect = t6_1;
        rulesProps = t7_1;
        T1 = ink_js_1.Box;
        t2 = "column";
        t3 = tab === "allow" ? 0 : undefined;
        var t8 = void 0;
        if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
            t8 = {
                allow: "Claude Code won't ask before using allowed tools.",
                ask: "Claude Code will always ask for confirmation before using these tools.",
                deny: "Claude Code will always reject requests to use denied tools."
            };
            $[10] = t8;
        }
        else {
            t8 = $[10];
        }
        var t9 = t8[tab];
        if ($[11] !== t9) {
            t4 = <ink_js_1.Text>{t9}</ink_js_1.Text>;
            $[11] = t9;
            $[12] = t4;
        }
        else {
            t4 = $[12];
        }
        T0 = RulesTabContent;
        t1 = getRulesOptions(tab, rulesProps.searchQuery);
        $[0] = t0;
        $[1] = T0;
        $[2] = T1;
        $[3] = handleToolSelect;
        $[4] = rulesProps;
        $[5] = t1;
        $[6] = t2;
        $[7] = t3;
        $[8] = t4;
        $[9] = tab;
    }
    else {
        T0 = $[1];
        T1 = $[2];
        handleToolSelect = $[3];
        rulesProps = $[4];
        t1 = $[5];
        t2 = $[6];
        t3 = $[7];
        t4 = $[8];
        tab = $[9];
    }
    var t5;
    if ($[13] !== handleToolSelect || $[14] !== tab) {
        t5 = function (v) { return handleToolSelect(v, tab); };
        $[13] = handleToolSelect;
        $[14] = tab;
        $[15] = t5;
    }
    else {
        t5 = $[15];
    }
    var t6;
    if ($[16] !== T0 || $[17] !== rulesProps || $[18] !== t1.options || $[19] !== t5) {
        t6 = <T0 options={t1.options} onSelect={t5} {...rulesProps}/>;
        $[16] = T0;
        $[17] = rulesProps;
        $[18] = t1.options;
        $[19] = t5;
        $[20] = t6;
    }
    else {
        t6 = $[20];
    }
    var t7;
    if ($[21] !== T1 || $[22] !== t2 || $[23] !== t3 || $[24] !== t4 || $[25] !== t6) {
        t7 = <T1 flexDirection={t2} flexShrink={t3}>{t4}{t6}</T1>;
        $[21] = T1;
        $[22] = t2;
        $[23] = t3;
        $[24] = t4;
        $[25] = t6;
        $[26] = t7;
    }
    else {
        t7 = $[26];
    }
    return t7;
}
function PermissionRuleList(t0) {
    var $ = (0, compiler_runtime_1.c)(113);
    var onExit = t0.onExit, initialTab = t0.initialTab, onRetryDenials = t0.onRetryDenials;
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = (0, autoModeDenials_js_1.getAutoModeDenials)();
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var hasDenials = t1.length > 0;
    var defaultTab = initialTab !== null && initialTab !== void 0 ? initialTab : (hasDenials ? "recent" : "allow");
    var t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = [];
        $[1] = t2;
    }
    else {
        t2 = $[1];
    }
    var _a = (0, react_1.useState)(t2), changes = _a[0], setChanges = _a[1];
    var toolPermissionContext = (0, AppState_js_1.useAppState)(_temp);
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var isTerminalFocused = (0, ink_js_1.useTerminalFocus)();
    var t3;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = {
            approved: new Set(),
            retry: new Set(),
            denials: []
        };
        $[2] = t3;
    }
    else {
        t3 = $[2];
    }
    var denialStateRef = (0, react_1.useRef)(t3);
    var t4;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = function (s_0) {
            denialStateRef.current = s_0;
        };
        $[3] = t4;
    }
    else {
        t4 = $[3];
    }
    var handleDenialStateChange = t4;
    var _b = (0, react_1.useState)(), selectedRule = _b[0], setSelectedRule = _b[1];
    var _d = (0, react_1.useState)(), lastFocusedRuleKey = _d[0], setLastFocusedRuleKey = _d[1];
    var _e = (0, react_1.useState)(null), addingRuleToTab = _e[0], setAddingRuleToTab = _e[1];
    var _f = (0, react_1.useState)(null), validatedRule = _f[0], setValidatedRule = _f[1];
    var _g = (0, react_1.useState)(false), isAddingWorkspaceDirectory = _g[0], setIsAddingWorkspaceDirectory = _g[1];
    var _h = (0, react_1.useState)(null), removingDirectory = _h[0], setRemovingDirectory = _h[1];
    var _j = (0, react_1.useState)(false), isSearchMode = _j[0], setIsSearchMode = _j[1];
    var _k = (0, react_1.useState)(true), headerFocused = _k[0], setHeaderFocused = _k[1];
    var t5;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = function (focused) {
            setHeaderFocused(focused);
        };
        $[4] = t5;
    }
    else {
        t5 = $[4];
    }
    var handleHeaderFocusChange = t5;
    var map;
    if ($[5] !== toolPermissionContext) {
        map = new Map();
        (0, permissions_js_1.getAllowRules)(toolPermissionContext).forEach(function (rule) {
            map.set((0, slowOperations_js_1.jsonStringify)(rule), rule);
        });
        $[5] = toolPermissionContext;
        $[6] = map;
    }
    else {
        map = $[6];
    }
    var allowRulesByKey = map;
    var map_0;
    if ($[7] !== toolPermissionContext) {
        map_0 = new Map();
        (0, permissions_js_1.getDenyRules)(toolPermissionContext).forEach(function (rule_0) {
            map_0.set((0, slowOperations_js_1.jsonStringify)(rule_0), rule_0);
        });
        $[7] = toolPermissionContext;
        $[8] = map_0;
    }
    else {
        map_0 = $[8];
    }
    var denyRulesByKey = map_0;
    var map_1;
    if ($[9] !== toolPermissionContext) {
        map_1 = new Map();
        (0, permissions_js_1.getAskRules)(toolPermissionContext).forEach(function (rule_1) {
            map_1.set((0, slowOperations_js_1.jsonStringify)(rule_1), rule_1);
        });
        $[9] = toolPermissionContext;
        $[10] = map_1;
    }
    else {
        map_1 = $[10];
    }
    var askRulesByKey = map_1;
    var t6;
    if ($[11] !== allowRulesByKey || $[12] !== askRulesByKey || $[13] !== denyRulesByKey) {
        t6 = function (tab, t7) {
            var query = t7 === undefined ? "" : t7;
            var rulesByKey = (function () {
                switch (tab) {
                    case "allow":
                        {
                            return allowRulesByKey;
                        }
                    case "deny":
                        {
                            return denyRulesByKey;
                        }
                    case "ask":
                        {
                            return askRulesByKey;
                        }
                    case "workspace":
                    case "recent":
                        {
                            return new Map();
                        }
                }
            })();
            var options = [];
            if (tab !== "workspace" && tab !== "recent" && !query) {
                options.push({
                    label: "Add a new rule".concat(figures_1.default.ellipsis),
                    value: "add-new-rule"
                });
            }
            var sortedRuleKeys = Array.from(rulesByKey.keys()).sort(function (a, b) {
                var ruleA = rulesByKey.get(a);
                var ruleB = rulesByKey.get(b);
                if (ruleA && ruleB) {
                    var ruleAString = (0, permissionRuleParser_js_1.permissionRuleValueToString)(ruleA.ruleValue).toLowerCase();
                    var ruleBString = (0, permissionRuleParser_js_1.permissionRuleValueToString)(ruleB.ruleValue).toLowerCase();
                    return ruleAString.localeCompare(ruleBString);
                }
                return 0;
            });
            var lowerQuery = query.toLowerCase();
            for (var _i = 0, sortedRuleKeys_1 = sortedRuleKeys; _i < sortedRuleKeys_1.length; _i++) {
                var ruleKey = sortedRuleKeys_1[_i];
                var rule_2 = rulesByKey.get(ruleKey);
                if (rule_2) {
                    var ruleString = (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule_2.ruleValue);
                    if (query && !ruleString.toLowerCase().includes(lowerQuery)) {
                        continue;
                    }
                    options.push({
                        label: ruleString,
                        value: ruleKey
                    });
                }
            }
            return {
                options: options,
                rulesByKey: rulesByKey
            };
        };
        $[11] = allowRulesByKey;
        $[12] = askRulesByKey;
        $[13] = denyRulesByKey;
        $[14] = t6;
    }
    else {
        t6 = $[14];
    }
    var getRulesOptions = t6;
    var exitState = (0, useExitOnCtrlCDWithKeybindings_js_1.useExitOnCtrlCDWithKeybindings)();
    var isSearchModeActive = !selectedRule && !addingRuleToTab && !validatedRule && !isAddingWorkspaceDirectory && !removingDirectory;
    var t7 = isSearchModeActive && isSearchMode;
    var t8;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = function () {
            setIsSearchMode(false);
        };
        $[15] = t8;
    }
    else {
        t8 = $[15];
    }
    var t9;
    if ($[16] !== t7) {
        t9 = {
            isActive: t7,
            onExit: t8
        };
        $[16] = t7;
        $[17] = t9;
    }
    else {
        t9 = $[17];
    }
    var _l = (0, useSearchInput_js_1.useSearchInput)(t9), searchQuery = _l.query, setSearchQuery = _l.setQuery, searchCursorOffset = _l.cursorOffset;
    var t10;
    if ($[18] !== isSearchMode || $[19] !== isSearchModeActive || $[20] !== setSearchQuery) {
        t10 = function (e) {
            if (!isSearchModeActive) {
                return;
            }
            if (isSearchMode) {
                return;
            }
            if (e.ctrl || e.meta) {
                return;
            }
            if (e.key === "/") {
                e.preventDefault();
                setIsSearchMode(true);
                setSearchQuery("");
            }
            else {
                if (e.key.length === 1 && e.key !== "j" && e.key !== "k" && e.key !== "m" && e.key !== "i" && e.key !== "r" && e.key !== " ") {
                    e.preventDefault();
                    setIsSearchMode(true);
                    setSearchQuery(e.key);
                }
            }
        };
        $[18] = isSearchMode;
        $[19] = isSearchModeActive;
        $[20] = setSearchQuery;
        $[21] = t10;
    }
    else {
        t10 = $[21];
    }
    var handleKeyDown = t10;
    var t11;
    if ($[22] !== getRulesOptions) {
        t11 = function (selectedValue, tab_0) {
            var rulesByKey_0 = getRulesOptions(tab_0).rulesByKey;
            if (selectedValue === "add-new-rule") {
                setAddingRuleToTab(tab_0);
                return;
            }
            else {
                setSelectedRule(rulesByKey_0.get(selectedValue));
                return;
            }
        };
        $[22] = getRulesOptions;
        $[23] = t11;
    }
    else {
        t11 = $[23];
    }
    var handleToolSelect = t11;
    var t12;
    if ($[24] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = function () {
            setAddingRuleToTab(null);
        };
        $[24] = t12;
    }
    else {
        t12 = $[24];
    }
    var handleRuleInputCancel = t12;
    var t13;
    if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = function (ruleValue, ruleBehavior) {
            setValidatedRule({
                ruleValue: ruleValue,
                ruleBehavior: ruleBehavior
            });
            setAddingRuleToTab(null);
        };
        $[25] = t13;
    }
    else {
        t13 = $[25];
    }
    var handleRuleInputSubmit = t13;
    var t14;
    if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = function (rules, unreachable) {
            setValidatedRule(null);
            var _loop_1 = function (rule_3) {
                setChanges(function (prev) { return __spreadArray(__spreadArray([], prev, true), ["Added ".concat(rule_3.ruleBehavior, " rule ").concat(chalk_1.default.bold((0, permissionRuleParser_js_1.permissionRuleValueToString)(rule_3.ruleValue)))], false); });
            };
            for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
                var rule_3 = rules_1[_i];
                _loop_1(rule_3);
            }
            if (unreachable && unreachable.length > 0) {
                var _loop_2 = function (u) {
                    var severity = u.shadowType === "deny" ? "blocked" : "shadowed";
                    setChanges(function (prev_0) { return __spreadArray(__spreadArray([], prev_0, true), [chalk_1.default.yellow("".concat(figures_1.default.warning, " Warning: ").concat((0, permissionRuleParser_js_1.permissionRuleValueToString)(u.rule.ruleValue), " is ").concat(severity)), chalk_1.default.dim("  ".concat(u.reason)), chalk_1.default.dim("  Fix: ".concat(u.fix))], false); });
                };
                for (var _a = 0, unreachable_1 = unreachable; _a < unreachable_1.length; _a++) {
                    var u = unreachable_1[_a];
                    _loop_2(u);
                }
            }
        };
        $[26] = t14;
    }
    else {
        t14 = $[26];
    }
    var handleAddRulesSuccess = t14;
    var t15;
    if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = function () {
            setValidatedRule(null);
        };
        $[27] = t15;
    }
    else {
        t15 = $[27];
    }
    var handleAddRuleCancel = t15;
    var t16;
    if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = function () { return setIsAddingWorkspaceDirectory(true); };
        $[28] = t16;
    }
    else {
        t16 = $[28];
    }
    var handleRequestAddDirectory = t16;
    var t17;
    if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = function (path) { return setRemovingDirectory(path); };
        $[29] = t17;
    }
    else {
        t17 = $[29];
    }
    var handleRequestRemoveDirectory = t17;
    var t18;
    if ($[30] !== changes || $[31] !== onExit || $[32] !== onRetryDenials) {
        t18 = function () {
            var s_1 = denialStateRef.current;
            var denialsFor = function (set) { return Array.from(set).map(function (idx) { return s_1.denials[idx]; }).filter(_temp2); };
            var retryDenials = denialsFor(s_1.retry);
            if (retryDenials.length > 0) {
                var commands = retryDenials.map(_temp3);
                onRetryDenials === null || onRetryDenials === void 0 ? void 0 : onRetryDenials(commands);
                onExit(undefined, {
                    shouldQuery: true,
                    metaMessages: ["Permission granted for: ".concat(commands.join(", "), ". You may now retry ").concat(commands.length === 1 ? "this command" : "these commands", " if you would like.")]
                });
                return;
            }
            var approvedDenials = denialsFor(s_1.approved);
            if (approvedDenials.length > 0 || changes.length > 0) {
                var approvedMsg = approvedDenials.length > 0 ? ["Approved ".concat(approvedDenials.map(_temp4).join(", "))] : [];
                onExit(__spreadArray(__spreadArray([], approvedMsg, true), changes, true).join("\n"));
            }
            else {
                onExit("Permissions dialog dismissed", {
                    display: "system"
                });
            }
        };
        $[30] = changes;
        $[31] = onExit;
        $[32] = onRetryDenials;
        $[33] = t18;
    }
    else {
        t18 = $[33];
    }
    var handleRulesCancel = t18;
    var t19 = isSearchModeActive && !isSearchMode;
    var t20;
    if ($[34] !== t19) {
        t20 = {
            context: "Settings",
            isActive: t19
        };
        $[34] = t19;
        $[35] = t20;
    }
    else {
        t20 = $[35];
    }
    (0, useKeybinding_js_1.useKeybinding)("confirm:no", handleRulesCancel, t20);
    var t21;
    if ($[36] !== getRulesOptions || $[37] !== selectedRule || $[38] !== setAppState || $[39] !== toolPermissionContext) {
        t21 = function () {
            if (!selectedRule) {
                return;
            }
            var options_0 = getRulesOptions(selectedRule.ruleBehavior).options;
            var selectedKey = (0, slowOperations_js_1.jsonStringify)(selectedRule);
            var ruleKeys = options_0.filter(_temp5).map(_temp6);
            var currentIndex = ruleKeys.indexOf(selectedKey);
            var nextFocusKey;
            if (currentIndex !== -1) {
                if (currentIndex < ruleKeys.length - 1) {
                    nextFocusKey = ruleKeys[currentIndex + 1];
                }
                else {
                    if (currentIndex > 0) {
                        nextFocusKey = ruleKeys[currentIndex - 1];
                    }
                }
            }
            setLastFocusedRuleKey(nextFocusKey);
            (0, permissions_js_1.deletePermissionRule)({
                rule: selectedRule,
                initialContext: toolPermissionContext,
                setToolPermissionContext: function (toolPermissionContext_0) {
                    setAppState(function (prev_1) { return (__assign(__assign({}, prev_1), { toolPermissionContext: toolPermissionContext_0 })); });
                }
            });
            setChanges(function (prev_2) { return __spreadArray(__spreadArray([], prev_2, true), ["Deleted ".concat(selectedRule.ruleBehavior, " rule ").concat(chalk_1.default.bold((0, permissionRuleParser_js_1.permissionRuleValueToString)(selectedRule.ruleValue)))], false); });
            setSelectedRule(undefined);
        };
        $[36] = getRulesOptions;
        $[37] = selectedRule;
        $[38] = setAppState;
        $[39] = toolPermissionContext;
        $[40] = t21;
    }
    else {
        t21 = $[40];
    }
    var handleDeleteRule = t21;
    if (selectedRule) {
        var t22_1;
        if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
            t22_1 = function () { return setSelectedRule(undefined); };
            $[41] = t22_1;
        }
        else {
            t22_1 = $[41];
        }
        var t23_1;
        if ($[42] !== handleDeleteRule || $[43] !== selectedRule) {
            t23_1 = <RuleDetails rule={selectedRule} onDelete={handleDeleteRule} onCancel={t22_1}/>;
            $[42] = handleDeleteRule;
            $[43] = selectedRule;
            $[44] = t23_1;
        }
        else {
            t23_1 = $[44];
        }
        return t23_1;
    }
    if (addingRuleToTab && addingRuleToTab !== "workspace" && addingRuleToTab !== "recent") {
        var t22_2;
        if ($[45] !== addingRuleToTab) {
            t22_2 = <PermissionRuleInput_js_1.PermissionRuleInput onCancel={handleRuleInputCancel} onSubmit={handleRuleInputSubmit} ruleBehavior={addingRuleToTab}/>;
            $[45] = addingRuleToTab;
            $[46] = t22_2;
        }
        else {
            t22_2 = $[46];
        }
        return t22_2;
    }
    if (validatedRule) {
        var t22_3;
        if ($[47] !== validatedRule.ruleValue) {
            t22_3 = [validatedRule.ruleValue];
            $[47] = validatedRule.ruleValue;
            $[48] = t22_3;
        }
        else {
            t22_3 = $[48];
        }
        var t23_2;
        if ($[49] !== setAppState) {
            t23_2 = function (toolPermissionContext_1) {
                setAppState(function (prev_3) { return (__assign(__assign({}, prev_3), { toolPermissionContext: toolPermissionContext_1 })); });
            };
            $[49] = setAppState;
            $[50] = t23_2;
        }
        else {
            t23_2 = $[50];
        }
        var t24_1;
        if ($[51] !== t22_3 || $[52] !== t23_2 || $[53] !== toolPermissionContext || $[54] !== validatedRule.ruleBehavior) {
            t24_1 = <AddPermissionRules_js_1.AddPermissionRules onAddRules={handleAddRulesSuccess} onCancel={handleAddRuleCancel} ruleValues={t22_3} ruleBehavior={validatedRule.ruleBehavior} initialContext={toolPermissionContext} setToolPermissionContext={t23_2}/>;
            $[51] = t22_3;
            $[52] = t23_2;
            $[53] = toolPermissionContext;
            $[54] = validatedRule.ruleBehavior;
            $[55] = t24_1;
        }
        else {
            t24_1 = $[55];
        }
        return t24_1;
    }
    if (isAddingWorkspaceDirectory) {
        var t22_4;
        if ($[56] !== setAppState || $[57] !== toolPermissionContext) {
            t22_4 = function (path_0, remember) {
                var destination = remember ? "localSettings" : "session";
                var permissionUpdate = {
                    type: "addDirectories",
                    directories: [path_0],
                    destination: destination
                };
                var updatedContext = (0, PermissionUpdate_js_1.applyPermissionUpdate)(toolPermissionContext, permissionUpdate);
                setAppState(function (prev_4) { return (__assign(__assign({}, prev_4), { toolPermissionContext: updatedContext })); });
                if (remember) {
                    (0, PermissionUpdate_js_1.persistPermissionUpdate)(permissionUpdate);
                }
                setChanges(function (prev_5) { return __spreadArray(__spreadArray([], prev_5, true), ["Added directory ".concat(chalk_1.default.bold(path_0), " to workspace").concat(remember ? " and saved to local settings" : " for this session")], false); });
                setIsAddingWorkspaceDirectory(false);
            };
            $[56] = setAppState;
            $[57] = toolPermissionContext;
            $[58] = t22_4;
        }
        else {
            t22_4 = $[58];
        }
        var t23_3;
        if ($[59] === Symbol.for("react.memo_cache_sentinel")) {
            t23_3 = function () { return setIsAddingWorkspaceDirectory(false); };
            $[59] = t23_3;
        }
        else {
            t23_3 = $[59];
        }
        var t24_2;
        if ($[60] !== t22_4 || $[61] !== toolPermissionContext) {
            t24_2 = <AddWorkspaceDirectory_js_1.AddWorkspaceDirectory onAddDirectory={t22_4} onCancel={t23_3} permissionContext={toolPermissionContext}/>;
            $[60] = t22_4;
            $[61] = toolPermissionContext;
            $[62] = t24_2;
        }
        else {
            t24_2 = $[62];
        }
        return t24_2;
    }
    if (removingDirectory) {
        var t22_5;
        if ($[63] !== removingDirectory) {
            t22_5 = function () {
                setChanges(function (prev_6) { return __spreadArray(__spreadArray([], prev_6, true), ["Removed directory ".concat(chalk_1.default.bold(removingDirectory), " from workspace")], false); });
                setRemovingDirectory(null);
            };
            $[63] = removingDirectory;
            $[64] = t22_5;
        }
        else {
            t22_5 = $[64];
        }
        var t23_4;
        if ($[65] === Symbol.for("react.memo_cache_sentinel")) {
            t23_4 = function () { return setRemovingDirectory(null); };
            $[65] = t23_4;
        }
        else {
            t23_4 = $[65];
        }
        var t24_3;
        if ($[66] !== setAppState) {
            t24_3 = function (toolPermissionContext_2) {
                setAppState(function (prev_7) { return (__assign(__assign({}, prev_7), { toolPermissionContext: toolPermissionContext_2 })); });
            };
            $[66] = setAppState;
            $[67] = t24_3;
        }
        else {
            t24_3 = $[67];
        }
        var t25_1;
        if ($[68] !== removingDirectory || $[69] !== t22_5 || $[70] !== t24_3 || $[71] !== toolPermissionContext) {
            t25_1 = <RemoveWorkspaceDirectory_js_1.RemoveWorkspaceDirectory directoryPath={removingDirectory} onRemove={t22_5} onCancel={t23_4} permissionContext={toolPermissionContext} setPermissionContext={t24_3}/>;
            $[68] = removingDirectory;
            $[69] = t22_5;
            $[70] = t24_3;
            $[71] = toolPermissionContext;
            $[72] = t25_1;
        }
        else {
            t25_1 = $[72];
        }
        return t25_1;
    }
    var t22;
    if ($[73] !== getRulesOptions || $[74] !== handleRulesCancel || $[75] !== handleToolSelect || $[76] !== isSearchMode || $[77] !== isTerminalFocused || $[78] !== lastFocusedRuleKey || $[79] !== searchCursorOffset || $[80] !== searchQuery) {
        t22 = {
            searchQuery: searchQuery,
            isSearchMode: isSearchMode,
            isFocused: isTerminalFocused,
            onCancel: handleRulesCancel,
            lastFocusedRuleKey: lastFocusedRuleKey,
            cursorOffset: searchCursorOffset,
            getRulesOptions: getRulesOptions,
            handleToolSelect: handleToolSelect,
            onHeaderFocusChange: handleHeaderFocusChange
        };
        $[73] = getRulesOptions;
        $[74] = handleRulesCancel;
        $[75] = handleToolSelect;
        $[76] = isSearchMode;
        $[77] = isTerminalFocused;
        $[78] = lastFocusedRuleKey;
        $[79] = searchCursorOffset;
        $[80] = searchQuery;
        $[81] = t22;
    }
    else {
        t22 = $[81];
    }
    var sharedRulesProps = t22;
    var isHidden = !!selectedRule || !!addingRuleToTab || !!validatedRule || isAddingWorkspaceDirectory || !!removingDirectory;
    var t23 = !isSearchMode;
    var t24;
    if ($[82] === Symbol.for("react.memo_cache_sentinel")) {
        t24 = <Tabs_js_1.Tab id="recent" title="Recently denied"><RecentDenialsTab_js_1.RecentDenialsTab onHeaderFocusChange={handleHeaderFocusChange} onStateChange={handleDenialStateChange}/></Tabs_js_1.Tab>;
        $[82] = t24;
    }
    else {
        t24 = $[82];
    }
    var t25;
    if ($[83] !== sharedRulesProps) {
        t25 = <Tabs_js_1.Tab id="allow" title="Allow"><PermissionRulesTab tab="allow" {...sharedRulesProps}/></Tabs_js_1.Tab>;
        $[83] = sharedRulesProps;
        $[84] = t25;
    }
    else {
        t25 = $[84];
    }
    var t26;
    if ($[85] !== sharedRulesProps) {
        t26 = <Tabs_js_1.Tab id="ask" title="Ask"><PermissionRulesTab tab="ask" {...sharedRulesProps}/></Tabs_js_1.Tab>;
        $[85] = sharedRulesProps;
        $[86] = t26;
    }
    else {
        t26 = $[86];
    }
    var t27;
    if ($[87] !== sharedRulesProps) {
        t27 = <Tabs_js_1.Tab id="deny" title="Deny"><PermissionRulesTab tab="deny" {...sharedRulesProps}/></Tabs_js_1.Tab>;
        $[87] = sharedRulesProps;
        $[88] = t27;
    }
    else {
        t27 = $[88];
    }
    var t28;
    if ($[89] === Symbol.for("react.memo_cache_sentinel")) {
        t28 = <ink_js_1.Text>Claude Code can read files in the workspace, and make edits when auto-accept edits is on.</ink_js_1.Text>;
        $[89] = t28;
    }
    else {
        t28 = $[89];
    }
    var t29;
    if ($[90] !== onExit || $[91] !== toolPermissionContext) {
        t29 = <Tabs_js_1.Tab id="workspace" title="Workspace"><ink_js_1.Box flexDirection="column">{t28}<WorkspaceTab_js_1.WorkspaceTab onExit={onExit} toolPermissionContext={toolPermissionContext} onRequestAddDirectory={handleRequestAddDirectory} onRequestRemoveDirectory={handleRequestRemoveDirectory} onHeaderFocusChange={handleHeaderFocusChange}/></ink_js_1.Box></Tabs_js_1.Tab>;
        $[90] = onExit;
        $[91] = toolPermissionContext;
        $[92] = t29;
    }
    else {
        t29 = $[92];
    }
    var t30;
    if ($[93] !== defaultTab || $[94] !== isHidden || $[95] !== t23 || $[96] !== t25 || $[97] !== t26 || $[98] !== t27 || $[99] !== t29) {
        t30 = <Tabs_js_1.Tabs title="Permissions:" color="permission" defaultTab={defaultTab} hidden={isHidden} initialHeaderFocused={!hasDenials} navFromContent={t23}>{t24}{t25}{t26}{t27}{t29}</Tabs_js_1.Tabs>;
        $[93] = defaultTab;
        $[94] = isHidden;
        $[95] = t23;
        $[96] = t25;
        $[97] = t26;
        $[98] = t27;
        $[99] = t29;
        $[100] = t30;
    }
    else {
        t30 = $[100];
    }
    var t31;
    if ($[101] !== defaultTab || $[102] !== exitState.keyName || $[103] !== exitState.pending || $[104] !== headerFocused || $[105] !== isSearchMode) {
        t31 = <ink_js_1.Box marginTop={1} paddingLeft={1}><ink_js_1.Text dimColor={true}>{exitState.pending ? <>Press {exitState.keyName} again to exit</> : headerFocused ? <>←/→ tab switch · ↓ return · Esc cancel</> : isSearchMode ? <>Type to filter · Enter/↓ select · ↑ tabs · Esc clear</> : hasDenials && defaultTab === "recent" ? <>Enter approve · r retry · ↑↓ navigate · ←/→ switch · Esc cancel</> : <>↑↓ navigate · Enter select · Type to search · ←/→ switch · Esc cancel</>}</ink_js_1.Text></ink_js_1.Box>;
        $[101] = defaultTab;
        $[102] = exitState.keyName;
        $[103] = exitState.pending;
        $[104] = headerFocused;
        $[105] = isSearchMode;
        $[106] = t31;
    }
    else {
        t31 = $[106];
    }
    var t32;
    if ($[107] !== t30 || $[108] !== t31) {
        t32 = <Pane_js_1.Pane color="permission">{t30}{t31}</Pane_js_1.Pane>;
        $[107] = t30;
        $[108] = t31;
        $[109] = t32;
    }
    else {
        t32 = $[109];
    }
    var t33;
    if ($[110] !== handleKeyDown || $[111] !== t32) {
        t33 = <ink_js_1.Box flexDirection="column" onKeyDown={handleKeyDown}>{t32}</ink_js_1.Box>;
        $[110] = handleKeyDown;
        $[111] = t32;
        $[112] = t33;
    }
    else {
        t33 = $[112];
    }
    return t33;
}
function _temp6(opt_0) {
    return opt_0.value;
}
function _temp5(opt) {
    return opt.value !== "add-new-rule";
}
function _temp4(d_1) {
    return chalk_1.default.bold(d_1.display);
}
function _temp3(d_0) {
    return d_0.display;
}
function _temp2(d) {
    return d !== undefined;
}
function _temp(s) {
    return s.toolPermissionContext;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsImZpZ3VyZXMiLCJSZWFjdCIsInVzZUNhbGxiYWNrIiwidXNlRWZmZWN0IiwidXNlTWVtbyIsInVzZVJlZiIsInVzZVN0YXRlIiwidXNlQXBwU3RhdGUiLCJ1c2VTZXRBcHBTdGF0ZSIsImFwcGx5UGVybWlzc2lvblVwZGF0ZSIsInBlcnNpc3RQZXJtaXNzaW9uVXBkYXRlIiwiUGVybWlzc2lvblVwZGF0ZURlc3RpbmF0aW9uIiwiQ29tbWFuZFJlc3VsdERpc3BsYXkiLCJTZWxlY3QiLCJ1c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MiLCJ1c2VTZWFyY2hJbnB1dCIsIktleWJvYXJkRXZlbnQiLCJCb3giLCJUZXh0IiwidXNlVGVybWluYWxGb2N1cyIsInVzZUtleWJpbmRpbmciLCJBdXRvTW9kZURlbmlhbCIsImdldEF1dG9Nb2RlRGVuaWFscyIsIlBlcm1pc3Npb25CZWhhdmlvciIsIlBlcm1pc3Npb25SdWxlIiwiUGVybWlzc2lvblJ1bGVWYWx1ZSIsInBlcm1pc3Npb25SdWxlVmFsdWVUb1N0cmluZyIsImRlbGV0ZVBlcm1pc3Npb25SdWxlIiwiZ2V0QWxsb3dSdWxlcyIsImdldEFza1J1bGVzIiwiZ2V0RGVueVJ1bGVzIiwicGVybWlzc2lvblJ1bGVTb3VyY2VEaXNwbGF5U3RyaW5nIiwiVW5yZWFjaGFibGVSdWxlIiwianNvblN0cmluZ2lmeSIsIlBhbmUiLCJUYWIiLCJUYWJzIiwidXNlVGFiSGVhZGVyRm9jdXMiLCJ1c2VUYWJzV2lkdGgiLCJTZWFyY2hCb3giLCJPcHRpb24iLCJBZGRQZXJtaXNzaW9uUnVsZXMiLCJBZGRXb3Jrc3BhY2VEaXJlY3RvcnkiLCJQZXJtaXNzaW9uUnVsZURlc2NyaXB0aW9uIiwiUGVybWlzc2lvblJ1bGVJbnB1dCIsIlJlY2VudERlbmlhbHNUYWIiLCJSZW1vdmVXb3Jrc3BhY2VEaXJlY3RvcnkiLCJXb3Jrc3BhY2VUYWIiLCJUYWJUeXBlIiwiUnVsZVNvdXJjZVRleHRQcm9wcyIsInJ1bGUiLCJSdWxlU291cmNlVGV4dCIsInQwIiwiJCIsIl9jIiwidDEiLCJzb3VyY2UiLCJ0MiIsInQzIiwiZ2V0UnVsZUJlaGF2aW9yTGFiZWwiLCJydWxlQmVoYXZpb3IiLCJSdWxlRGV0YWlscyIsIm9uRGVsZXRlIiwib25DYW5jZWwiLCJleGl0U3RhdGUiLCJTeW1ib2wiLCJmb3IiLCJjb250ZXh0IiwicnVsZVZhbHVlIiwidDQiLCJ0NSIsInQ2IiwicnVsZURlc2NyaXB0aW9uIiwidDciLCJrZXlOYW1lIiwicGVuZGluZyIsImZvb3RlciIsInQ4IiwidDkiLCJ0MTAiLCJ0MTEiLCJfIiwidDEyIiwibGFiZWwiLCJ2YWx1ZSIsInQxMyIsInQxNCIsInQxNSIsIlJ1bGVzVGFiQ29udGVudFByb3BzIiwib3B0aW9ucyIsInNlYXJjaFF1ZXJ5IiwiaXNTZWFyY2hNb2RlIiwiaXNGb2N1c2VkIiwib25TZWxlY3QiLCJsYXN0Rm9jdXNlZFJ1bGVLZXkiLCJjdXJzb3JPZmZzZXQiLCJvbkhlYWRlckZvY3VzQ2hhbmdlIiwiZm9jdXNlZCIsIlJ1bGVzVGFiQ29udGVudCIsInByb3BzIiwidGFiV2lkdGgiLCJoZWFkZXJGb2N1c2VkIiwiZm9jdXNIZWFkZXIiLCJibHVySGVhZGVyIiwiTWF0aCIsIm1pbiIsImxlbmd0aCIsIlBlcm1pc3Npb25SdWxlc1RhYiIsIlQwIiwiVDEiLCJoYW5kbGVUb29sU2VsZWN0IiwicnVsZXNQcm9wcyIsInRhYiIsImdldFJ1bGVzT3B0aW9ucyIsInVuZGVmaW5lZCIsImFsbG93IiwiYXNrIiwiZGVueSIsInYiLCJQcm9wcyIsIm9uRXhpdCIsInJlc3VsdCIsImRpc3BsYXkiLCJzaG91bGRRdWVyeSIsIm1ldGFNZXNzYWdlcyIsImluaXRpYWxUYWIiLCJvblJldHJ5RGVuaWFscyIsImNvbW1hbmRzIiwiUGVybWlzc2lvblJ1bGVMaXN0IiwiaGFzRGVuaWFscyIsImRlZmF1bHRUYWIiLCJjaGFuZ2VzIiwic2V0Q2hhbmdlcyIsInRvb2xQZXJtaXNzaW9uQ29udGV4dCIsIl90ZW1wIiwic2V0QXBwU3RhdGUiLCJpc1Rlcm1pbmFsRm9jdXNlZCIsImFwcHJvdmVkIiwiU2V0IiwicmV0cnkiLCJkZW5pYWxzIiwiZGVuaWFsU3RhdGVSZWYiLCJzXzAiLCJjdXJyZW50IiwicyIsImhhbmRsZURlbmlhbFN0YXRlQ2hhbmdlIiwic2VsZWN0ZWRSdWxlIiwic2V0U2VsZWN0ZWRSdWxlIiwic2V0TGFzdEZvY3VzZWRSdWxlS2V5IiwiYWRkaW5nUnVsZVRvVGFiIiwic2V0QWRkaW5nUnVsZVRvVGFiIiwidmFsaWRhdGVkUnVsZSIsInNldFZhbGlkYXRlZFJ1bGUiLCJpc0FkZGluZ1dvcmtzcGFjZURpcmVjdG9yeSIsInNldElzQWRkaW5nV29ya3NwYWNlRGlyZWN0b3J5IiwicmVtb3ZpbmdEaXJlY3RvcnkiLCJzZXRSZW1vdmluZ0RpcmVjdG9yeSIsInNldElzU2VhcmNoTW9kZSIsInNldEhlYWRlckZvY3VzZWQiLCJoYW5kbGVIZWFkZXJGb2N1c0NoYW5nZSIsIm1hcCIsIk1hcCIsImZvckVhY2giLCJzZXQiLCJhbGxvd1J1bGVzQnlLZXkiLCJtYXBfMCIsInJ1bGVfMCIsImRlbnlSdWxlc0J5S2V5IiwibWFwXzEiLCJydWxlXzEiLCJhc2tSdWxlc0J5S2V5IiwicXVlcnkiLCJydWxlc0J5S2V5IiwicHVzaCIsImVsbGlwc2lzIiwic29ydGVkUnVsZUtleXMiLCJBcnJheSIsImZyb20iLCJrZXlzIiwic29ydCIsImEiLCJiIiwicnVsZUEiLCJnZXQiLCJydWxlQiIsInJ1bGVBU3RyaW5nIiwidG9Mb3dlckNhc2UiLCJydWxlQlN0cmluZyIsImxvY2FsZUNvbXBhcmUiLCJsb3dlclF1ZXJ5IiwicnVsZUtleSIsInJ1bGVfMiIsInJ1bGVTdHJpbmciLCJpbmNsdWRlcyIsImlzU2VhcmNoTW9kZUFjdGl2ZSIsImlzQWN0aXZlIiwic2V0UXVlcnkiLCJzZXRTZWFyY2hRdWVyeSIsInNlYXJjaEN1cnNvck9mZnNldCIsImUiLCJjdHJsIiwibWV0YSIsImtleSIsInByZXZlbnREZWZhdWx0IiwiaGFuZGxlS2V5RG93biIsInNlbGVjdGVkVmFsdWUiLCJ0YWJfMCIsInJ1bGVzQnlLZXlfMCIsImhhbmRsZVJ1bGVJbnB1dENhbmNlbCIsImhhbmRsZVJ1bGVJbnB1dFN1Ym1pdCIsInJ1bGVzIiwidW5yZWFjaGFibGUiLCJydWxlXzMiLCJwcmV2IiwiYm9sZCIsInUiLCJzZXZlcml0eSIsInNoYWRvd1R5cGUiLCJwcmV2XzAiLCJ5ZWxsb3ciLCJ3YXJuaW5nIiwiZGltIiwicmVhc29uIiwiZml4IiwiaGFuZGxlQWRkUnVsZXNTdWNjZXNzIiwiaGFuZGxlQWRkUnVsZUNhbmNlbCIsInQxNiIsImhhbmRsZVJlcXVlc3RBZGREaXJlY3RvcnkiLCJ0MTciLCJwYXRoIiwiaGFuZGxlUmVxdWVzdFJlbW92ZURpcmVjdG9yeSIsInQxOCIsInNfMSIsImRlbmlhbHNGb3IiLCJpZHgiLCJmaWx0ZXIiLCJfdGVtcDIiLCJyZXRyeURlbmlhbHMiLCJfdGVtcDMiLCJqb2luIiwiYXBwcm92ZWREZW5pYWxzIiwiYXBwcm92ZWRNc2ciLCJfdGVtcDQiLCJoYW5kbGVSdWxlc0NhbmNlbCIsInQxOSIsInQyMCIsInQyMSIsIm9wdGlvbnNfMCIsInNlbGVjdGVkS2V5IiwicnVsZUtleXMiLCJfdGVtcDUiLCJfdGVtcDYiLCJjdXJyZW50SW5kZXgiLCJpbmRleE9mIiwibmV4dEZvY3VzS2V5IiwiaW5pdGlhbENvbnRleHQiLCJzZXRUb29sUGVybWlzc2lvbkNvbnRleHQiLCJ0b29sUGVybWlzc2lvbkNvbnRleHRfMCIsInByZXZfMSIsInByZXZfMiIsImhhbmRsZURlbGV0ZVJ1bGUiLCJ0MjIiLCJ0MjMiLCJ0b29sUGVybWlzc2lvbkNvbnRleHRfMSIsInByZXZfMyIsInQyNCIsInBhdGhfMCIsInJlbWVtYmVyIiwiZGVzdGluYXRpb24iLCJwZXJtaXNzaW9uVXBkYXRlIiwidHlwZSIsImNvbnN0IiwiZGlyZWN0b3JpZXMiLCJ1cGRhdGVkQ29udGV4dCIsInByZXZfNCIsInByZXZfNSIsInByZXZfNiIsInRvb2xQZXJtaXNzaW9uQ29udGV4dF8yIiwicHJldl83IiwidDI1Iiwic2hhcmVkUnVsZXNQcm9wcyIsImlzSGlkZGVuIiwidDI2IiwidDI3IiwidDI4IiwidDI5IiwidDMwIiwidDMxIiwidDMyIiwidDMzIiwib3B0XzAiLCJvcHQiLCJkXzEiLCJkIiwiZF8wIl0sInNvdXJjZXMiOlsiUGVybWlzc2lvblJ1bGVMaXN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnXG5pbXBvcnQgZmlndXJlcyBmcm9tICdmaWd1cmVzJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VBcHBTdGF0ZSwgdXNlU2V0QXBwU3RhdGUgfSBmcm9tICdzcmMvc3RhdGUvQXBwU3RhdGUuanMnXG5pbXBvcnQge1xuICBhcHBseVBlcm1pc3Npb25VcGRhdGUsXG4gIHBlcnNpc3RQZXJtaXNzaW9uVXBkYXRlLFxufSBmcm9tICdzcmMvdXRpbHMvcGVybWlzc2lvbnMvUGVybWlzc2lvblVwZGF0ZS5qcydcbmltcG9ydCB0eXBlIHsgUGVybWlzc2lvblVwZGF0ZURlc3RpbmF0aW9uIH0gZnJvbSAnc3JjL3V0aWxzL3Blcm1pc3Npb25zL1Blcm1pc3Npb25VcGRhdGVTY2hlbWEuanMnXG5pbXBvcnQgdHlwZSB7IENvbW1hbmRSZXN1bHREaXNwbGF5IH0gZnJvbSAnLi4vLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnRzL0N1c3RvbVNlbGVjdC9zZWxlY3QuanMnXG5pbXBvcnQgeyB1c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MgfSBmcm9tICcuLi8uLi8uLi9ob29rcy91c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MuanMnXG5pbXBvcnQgeyB1c2VTZWFyY2hJbnB1dCB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZVNlYXJjaElucHV0LmpzJ1xuaW1wb3J0IHR5cGUgeyBLZXlib2FyZEV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vaW5rL2V2ZW50cy9rZXlib2FyZC1ldmVudC5qcydcbmltcG9ydCB7IEJveCwgVGV4dCwgdXNlVGVybWluYWxGb2N1cyB9IGZyb20gJy4uLy4uLy4uL2luay5qcydcbmltcG9ydCB7IHVzZUtleWJpbmRpbmcgfSBmcm9tICcuLi8uLi8uLi9rZXliaW5kaW5ncy91c2VLZXliaW5kaW5nLmpzJ1xuaW1wb3J0IHtcbiAgdHlwZSBBdXRvTW9kZURlbmlhbCxcbiAgZ2V0QXV0b01vZGVEZW5pYWxzLFxufSBmcm9tICcuLi8uLi8uLi91dGlscy9hdXRvTW9kZURlbmlhbHMuanMnXG5pbXBvcnQgdHlwZSB7XG4gIFBlcm1pc3Npb25CZWhhdmlvcixcbiAgUGVybWlzc2lvblJ1bGUsXG4gIFBlcm1pc3Npb25SdWxlVmFsdWUsXG59IGZyb20gJy4uLy4uLy4uL3V0aWxzL3Blcm1pc3Npb25zL1Blcm1pc3Npb25SdWxlLmpzJ1xuaW1wb3J0IHsgcGVybWlzc2lvblJ1bGVWYWx1ZVRvU3RyaW5nIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvcGVybWlzc2lvbnMvcGVybWlzc2lvblJ1bGVQYXJzZXIuanMnXG5pbXBvcnQge1xuICBkZWxldGVQZXJtaXNzaW9uUnVsZSxcbiAgZ2V0QWxsb3dSdWxlcyxcbiAgZ2V0QXNrUnVsZXMsXG4gIGdldERlbnlSdWxlcyxcbiAgcGVybWlzc2lvblJ1bGVTb3VyY2VEaXNwbGF5U3RyaW5nLFxufSBmcm9tICcuLi8uLi8uLi91dGlscy9wZXJtaXNzaW9ucy9wZXJtaXNzaW9ucy5qcydcbmltcG9ydCB0eXBlIHsgVW5yZWFjaGFibGVSdWxlIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvcGVybWlzc2lvbnMvc2hhZG93ZWRSdWxlRGV0ZWN0aW9uLmpzJ1xuaW1wb3J0IHsganNvblN0cmluZ2lmeSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3Nsb3dPcGVyYXRpb25zLmpzJ1xuaW1wb3J0IHsgUGFuZSB9IGZyb20gJy4uLy4uL2Rlc2lnbi1zeXN0ZW0vUGFuZS5qcydcbmltcG9ydCB7XG4gIFRhYixcbiAgVGFicyxcbiAgdXNlVGFiSGVhZGVyRm9jdXMsXG4gIHVzZVRhYnNXaWR0aCxcbn0gZnJvbSAnLi4vLi4vZGVzaWduLXN5c3RlbS9UYWJzLmpzJ1xuaW1wb3J0IHsgU2VhcmNoQm94IH0gZnJvbSAnLi4vLi4vU2VhcmNoQm94LmpzJ1xuaW1wb3J0IHR5cGUgeyBPcHRpb24gfSBmcm9tICcuLi8uLi91aS9vcHRpb24uanMnXG5pbXBvcnQgeyBBZGRQZXJtaXNzaW9uUnVsZXMgfSBmcm9tICcuL0FkZFBlcm1pc3Npb25SdWxlcy5qcydcbmltcG9ydCB7IEFkZFdvcmtzcGFjZURpcmVjdG9yeSB9IGZyb20gJy4vQWRkV29ya3NwYWNlRGlyZWN0b3J5LmpzJ1xuaW1wb3J0IHsgUGVybWlzc2lvblJ1bGVEZXNjcmlwdGlvbiB9IGZyb20gJy4vUGVybWlzc2lvblJ1bGVEZXNjcmlwdGlvbi5qcydcbmltcG9ydCB7IFBlcm1pc3Npb25SdWxlSW5wdXQgfSBmcm9tICcuL1Blcm1pc3Npb25SdWxlSW5wdXQuanMnXG5pbXBvcnQgeyBSZWNlbnREZW5pYWxzVGFiIH0gZnJvbSAnLi9SZWNlbnREZW5pYWxzVGFiLmpzJ1xuaW1wb3J0IHsgUmVtb3ZlV29ya3NwYWNlRGlyZWN0b3J5IH0gZnJvbSAnLi9SZW1vdmVXb3Jrc3BhY2VEaXJlY3RvcnkuanMnXG5pbXBvcnQgeyBXb3Jrc3BhY2VUYWIgfSBmcm9tICcuL1dvcmtzcGFjZVRhYi5qcydcblxudHlwZSBUYWJUeXBlID0gJ3JlY2VudCcgfCAnYWxsb3cnIHwgJ2FzaycgfCAnZGVueScgfCAnd29ya3NwYWNlJ1xuXG50eXBlIFJ1bGVTb3VyY2VUZXh0UHJvcHMgPSB7XG4gIHJ1bGU6IFBlcm1pc3Npb25SdWxlXG59XG5mdW5jdGlvbiBSdWxlU291cmNlVGV4dCh7IHJ1bGUgfTogUnVsZVNvdXJjZVRleHRQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIHJldHVybiAoXG4gICAgPFRleHRcbiAgICAgIGRpbUNvbG9yXG4gICAgPntgRnJvbSAke3Blcm1pc3Npb25SdWxlU291cmNlRGlzcGxheVN0cmluZyhydWxlLnNvdXJjZSl9YH08L1RleHQ+XG4gIClcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGdldCB0aGUgYXBwcm9wcmlhdGUgbGFiZWwgZm9yIHJ1bGUgYmVoYXZpb3JcbmZ1bmN0aW9uIGdldFJ1bGVCZWhhdmlvckxhYmVsKHJ1bGVCZWhhdmlvcjogUGVybWlzc2lvbkJlaGF2aW9yKTogc3RyaW5nIHtcbiAgc3dpdGNoIChydWxlQmVoYXZpb3IpIHtcbiAgICBjYXNlICdhbGxvdyc6XG4gICAgICByZXR1cm4gJ2FsbG93ZWQnXG4gICAgY2FzZSAnZGVueSc6XG4gICAgICByZXR1cm4gJ2RlbmllZCdcbiAgICBjYXNlICdhc2snOlxuICAgICAgcmV0dXJuICdhc2snXG4gIH1cbn1cblxuLy8gQ29tcG9uZW50IGZvciBzaG93aW5nIHRvb2wgZGV0YWlscyBhbmQgbWFuYWdpbmcgdGhlIGludGVyYWN0aXZlIGRlbGV0aW9uIHdvcmtmbG93XG5mdW5jdGlvbiBSdWxlRGV0YWlscyh7XG4gIHJ1bGUsXG4gIG9uRGVsZXRlLFxuICBvbkNhbmNlbCxcbn06IHtcbiAgcnVsZTogUGVybWlzc2lvblJ1bGVcbiAgb25EZWxldGU6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbn0pOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBleGl0U3RhdGUgPSB1c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MoKVxuICAvLyBVc2UgY29uZmlndXJhYmxlIGtleWJpbmRpbmcgZm9yIEVTQyB0byBjYW5jZWxcbiAgdXNlS2V5YmluZGluZygnY29uZmlybTpubycsIG9uQ2FuY2VsLCB7IGNvbnRleHQ6ICdDb25maXJtYXRpb24nIH0pXG5cbiAgY29uc3QgcnVsZURlc2NyaXB0aW9uID0gKFxuICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIG1hcmdpblg9ezJ9PlxuICAgICAgPFRleHQgYm9sZD57cGVybWlzc2lvblJ1bGVWYWx1ZVRvU3RyaW5nKHJ1bGUucnVsZVZhbHVlKX08L1RleHQ+XG4gICAgICA8UGVybWlzc2lvblJ1bGVEZXNjcmlwdGlvbiBydWxlVmFsdWU9e3J1bGUucnVsZVZhbHVlfSAvPlxuICAgICAgPFJ1bGVTb3VyY2VUZXh0IHJ1bGU9e3J1bGV9IC8+XG4gICAgPC9Cb3g+XG4gIClcblxuICBjb25zdCBmb290ZXIgPSAoXG4gICAgPEJveCBtYXJnaW5MZWZ0PXszfT5cbiAgICAgIHtleGl0U3RhdGUucGVuZGluZyA/IChcbiAgICAgICAgPFRleHQgZGltQ29sb3I+UHJlc3Mge2V4aXRTdGF0ZS5rZXlOYW1lfSBhZ2FpbiB0byBleGl0PC9UZXh0PlxuICAgICAgKSA6IChcbiAgICAgICAgPFRleHQgZGltQ29sb3I+RXNjIHRvIGNhbmNlbDwvVGV4dD5cbiAgICAgICl9XG4gICAgPC9Cb3g+XG4gIClcblxuICAvLyBNYW5hZ2VkIHNldHRpbmdzIGNhbid0IGJlIGVkaXRlZFxuICBpZiAocnVsZS5zb3VyY2UgPT09ICdwb2xpY3lTZXR0aW5ncycpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPD5cbiAgICAgICAgPEJveFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgICAgIGdhcD17MX1cbiAgICAgICAgICBib3JkZXJTdHlsZT1cInJvdW5kXCJcbiAgICAgICAgICBwYWRkaW5nTGVmdD17MX1cbiAgICAgICAgICBwYWRkaW5nUmlnaHQ9ezF9XG4gICAgICAgICAgYm9yZGVyQ29sb3I9XCJwZXJtaXNzaW9uXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxUZXh0IGJvbGQgY29sb3I9XCJwZXJtaXNzaW9uXCI+XG4gICAgICAgICAgICBSdWxlIGRldGFpbHNcbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAge3J1bGVEZXNjcmlwdGlvbn1cbiAgICAgICAgICA8VGV4dCBpdGFsaWM+XG4gICAgICAgICAgICBUaGlzIHJ1bGUgaXMgY29uZmlndXJlZCBieSBtYW5hZ2VkIHNldHRpbmdzIGFuZCBjYW5ub3QgYmUgbW9kaWZpZWQuXG4gICAgICAgICAgICB7J1xcbid9XG4gICAgICAgICAgICBDb250YWN0IHlvdXIgc3lzdGVtIGFkbWluaXN0cmF0b3IgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICAge2Zvb3Rlcn1cbiAgICAgIDwvPlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxCb3hcbiAgICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgIGdhcD17MX1cbiAgICAgICAgYm9yZGVyU3R5bGU9XCJyb3VuZFwiXG4gICAgICAgIHBhZGRpbmdMZWZ0PXsxfVxuICAgICAgICBwYWRkaW5nUmlnaHQ9ezF9XG4gICAgICAgIGJvcmRlckNvbG9yPVwiZXJyb3JcIlxuICAgICAgPlxuICAgICAgICA8VGV4dCBib2xkIGNvbG9yPVwiZXJyb3JcIj5cbiAgICAgICAgICBEZWxldGUge2dldFJ1bGVCZWhhdmlvckxhYmVsKHJ1bGUucnVsZUJlaGF2aW9yKX0gdG9vbD9cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICB7cnVsZURlc2NyaXB0aW9ufVxuICAgICAgICA8VGV4dD5BcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgcGVybWlzc2lvbiBydWxlPzwvVGV4dD5cbiAgICAgICAgPFNlbGVjdFxuICAgICAgICAgIG9uQ2hhbmdlPXtfID0+IChfID09PSAneWVzJyA/IG9uRGVsZXRlKCkgOiBvbkNhbmNlbCgpKX1cbiAgICAgICAgICBvbkNhbmNlbD17b25DYW5jZWx9XG4gICAgICAgICAgb3B0aW9ucz17W1xuICAgICAgICAgICAgeyBsYWJlbDogJ1llcycsIHZhbHVlOiAneWVzJyB9LFxuICAgICAgICAgICAgeyBsYWJlbDogJ05vJywgdmFsdWU6ICdubycgfSxcbiAgICAgICAgICBdfVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG4gICAgICB7Zm9vdGVyfVxuICAgIDwvPlxuICApXG59XG5cbnR5cGUgUnVsZXNUYWJDb250ZW50UHJvcHMgPSB7XG4gIG9wdGlvbnM6IE9wdGlvbltdXG4gIHNlYXJjaFF1ZXJ5OiBzdHJpbmdcbiAgaXNTZWFyY2hNb2RlOiBib29sZWFuXG4gIGlzRm9jdXNlZDogYm9vbGVhblxuICBvblNlbGVjdDogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgbGFzdEZvY3VzZWRSdWxlS2V5OiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgY3Vyc29yT2Zmc2V0PzogbnVtYmVyXG4gIG9uSGVhZGVyRm9jdXNDaGFuZ2U/OiAoZm9jdXNlZDogYm9vbGVhbikgPT4gdm9pZFxufVxuXG4vLyBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBydWxlcyB0YWIgY29udGVudCB3aXRoIGZ1bGwgd2lkdGggc3VwcG9ydFxuZnVuY3Rpb24gUnVsZXNUYWJDb250ZW50KHByb3BzOiBSdWxlc1RhYkNvbnRlbnRQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IHtcbiAgICBvcHRpb25zLFxuICAgIHNlYXJjaFF1ZXJ5LFxuICAgIGlzU2VhcmNoTW9kZSxcbiAgICBpc0ZvY3VzZWQsXG4gICAgb25TZWxlY3QsXG4gICAgb25DYW5jZWwsXG4gICAgbGFzdEZvY3VzZWRSdWxlS2V5LFxuICAgIGN1cnNvck9mZnNldCxcbiAgICBvbkhlYWRlckZvY3VzQ2hhbmdlLFxuICB9ID0gcHJvcHNcbiAgY29uc3QgdGFiV2lkdGggPSB1c2VUYWJzV2lkdGgoKVxuICBjb25zdCB7IGhlYWRlckZvY3VzZWQsIGZvY3VzSGVhZGVyLCBibHVySGVhZGVyIH0gPSB1c2VUYWJIZWFkZXJGb2N1cygpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzU2VhcmNoTW9kZSAmJiBoZWFkZXJGb2N1c2VkKSBibHVySGVhZGVyKClcbiAgfSwgW2lzU2VhcmNoTW9kZSwgaGVhZGVyRm9jdXNlZCwgYmx1ckhlYWRlcl0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgb25IZWFkZXJGb2N1c0NoYW5nZT8uKGhlYWRlckZvY3VzZWQpXG4gIH0sIFtoZWFkZXJGb2N1c2VkLCBvbkhlYWRlckZvY3VzQ2hhbmdlXSlcbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj5cbiAgICAgIDxCb3ggbWFyZ2luQm90dG9tPXsxfSBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICAgIDxTZWFyY2hCb3hcbiAgICAgICAgICBxdWVyeT17c2VhcmNoUXVlcnl9XG4gICAgICAgICAgaXNGb2N1c2VkPXtpc1NlYXJjaE1vZGUgJiYgIWhlYWRlckZvY3VzZWR9XG4gICAgICAgICAgaXNUZXJtaW5hbEZvY3VzZWQ9e2lzRm9jdXNlZH1cbiAgICAgICAgICB3aWR0aD17dGFiV2lkdGh9XG4gICAgICAgICAgY3Vyc29yT2Zmc2V0PXtjdXJzb3JPZmZzZXR9XG4gICAgICAgIC8+XG4gICAgICA8L0JveD5cbiAgICAgIDxTZWxlY3RcbiAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgb25DaGFuZ2U9e29uU2VsZWN0fVxuICAgICAgICBvbkNhbmNlbD17b25DYW5jZWx9XG4gICAgICAgIHZpc2libGVPcHRpb25Db3VudD17TWF0aC5taW4oMTAsIG9wdGlvbnMubGVuZ3RoKX1cbiAgICAgICAgaXNEaXNhYmxlZD17aXNTZWFyY2hNb2RlIHx8IGhlYWRlckZvY3VzZWR9XG4gICAgICAgIGRlZmF1bHRGb2N1c1ZhbHVlPXtsYXN0Rm9jdXNlZFJ1bGVLZXl9XG4gICAgICAgIG9uVXBGcm9tRmlyc3RJdGVtPXtmb2N1c0hlYWRlcn1cbiAgICAgIC8+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuLy8gQ29tcG9zZXMgdGhlIHN1YnRpdGxlICsgc2VhcmNoICsgU2VsZWN0IGZvciBhIHNpbmdsZSBhbGxvdy9hc2svZGVueSB0YWIuXG5mdW5jdGlvbiBQZXJtaXNzaW9uUnVsZXNUYWIoe1xuICB0YWIsXG4gIGdldFJ1bGVzT3B0aW9ucyxcbiAgaGFuZGxlVG9vbFNlbGVjdCxcbiAgLi4ucnVsZXNQcm9wc1xufToge1xuICB0YWI6ICdhbGxvdycgfCAnYXNrJyB8ICdkZW55J1xuICBnZXRSdWxlc09wdGlvbnM6ICh0YWI6IFRhYlR5cGUsIHF1ZXJ5Pzogc3RyaW5nKSA9PiB7IG9wdGlvbnM6IE9wdGlvbltdIH1cbiAgaGFuZGxlVG9vbFNlbGVjdDogKHZhbHVlOiBzdHJpbmcsIHRhYjogVGFiVHlwZSkgPT4gdm9pZFxufSAmIE9taXQ8UnVsZXNUYWJDb250ZW50UHJvcHMsICdvcHRpb25zJyB8ICdvblNlbGVjdCc+KTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBmbGV4U2hyaW5rPXt0YWIgPT09ICdhbGxvdycgPyAwIDogdW5kZWZpbmVkfT5cbiAgICAgIDxUZXh0PlxuICAgICAgICB7XG4gICAgICAgICAge1xuICAgICAgICAgICAgYWxsb3c6IFwiQ2xhdWRlIENvZGUgd29uJ3QgYXNrIGJlZm9yZSB1c2luZyBhbGxvd2VkIHRvb2xzLlwiLFxuICAgICAgICAgICAgYXNrOiAnQ2xhdWRlIENvZGUgd2lsbCBhbHdheXMgYXNrIGZvciBjb25maXJtYXRpb24gYmVmb3JlIHVzaW5nIHRoZXNlIHRvb2xzLicsXG4gICAgICAgICAgICBkZW55OiAnQ2xhdWRlIENvZGUgd2lsbCBhbHdheXMgcmVqZWN0IHJlcXVlc3RzIHRvIHVzZSBkZW5pZWQgdG9vbHMuJyxcbiAgICAgICAgICB9W3RhYl1cbiAgICAgICAgfVxuICAgICAgPC9UZXh0PlxuICAgICAgPFJ1bGVzVGFiQ29udGVudFxuICAgICAgICBvcHRpb25zPXtnZXRSdWxlc09wdGlvbnModGFiLCBydWxlc1Byb3BzLnNlYXJjaFF1ZXJ5KS5vcHRpb25zfVxuICAgICAgICBvblNlbGVjdD17diA9PiBoYW5kbGVUb29sU2VsZWN0KHYsIHRhYil9XG4gICAgICAgIHsuLi5ydWxlc1Byb3BzfVxuICAgICAgLz5cbiAgICA8L0JveD5cbiAgKVxufVxuXG50eXBlIFByb3BzID0ge1xuICBvbkV4aXQ6IChcbiAgICByZXN1bHQ/OiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IHtcbiAgICAgIGRpc3BsYXk/OiBDb21tYW5kUmVzdWx0RGlzcGxheVxuICAgICAgc2hvdWxkUXVlcnk/OiBib29sZWFuXG4gICAgICBtZXRhTWVzc2FnZXM/OiBzdHJpbmdbXVxuICAgIH0sXG4gICkgPT4gdm9pZFxuICBpbml0aWFsVGFiPzogVGFiVHlwZVxuICBvblJldHJ5RGVuaWFscz86IChjb21tYW5kczogc3RyaW5nW10pID0+IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFBlcm1pc3Npb25SdWxlTGlzdCh7XG4gIG9uRXhpdCxcbiAgaW5pdGlhbFRhYixcbiAgb25SZXRyeURlbmlhbHMsXG59OiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IGhhc0RlbmlhbHMgPSBnZXRBdXRvTW9kZURlbmlhbHMoKS5sZW5ndGggPiAwXG4gIGNvbnN0IGRlZmF1bHRUYWI6IFRhYlR5cGUgPSBpbml0aWFsVGFiID8/IChoYXNEZW5pYWxzID8gJ3JlY2VudCcgOiAnYWxsb3cnKVxuICBjb25zdCBbY2hhbmdlcywgc2V0Q2hhbmdlc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oW10pXG4gIGNvbnN0IHRvb2xQZXJtaXNzaW9uQ29udGV4dCA9IHVzZUFwcFN0YXRlKHMgPT4gcy50b29sUGVybWlzc2lvbkNvbnRleHQpXG4gIGNvbnN0IHNldEFwcFN0YXRlID0gdXNlU2V0QXBwU3RhdGUoKVxuICBjb25zdCBpc1Rlcm1pbmFsRm9jdXNlZCA9IHVzZVRlcm1pbmFsRm9jdXMoKVxuXG4gIC8vIFJlZiBub3Qgc3RhdGU6IFJlY2VudERlbmlhbHNUYWIgdXBkYXRlcyBkb24ndCBuZWVkIHRvIHRyaWdnZXIgcGFyZW50XG4gIC8vIHJlLXJlbmRlciAob25seSByZWFkIG9uIGV4aXQpLCBhbmQgcmUtcmVuZGVycyB0cmlwIHRoZSBtb2RhbCBTY3JvbGxCb3hcbiAgLy8gY29sbGFwc2UgYnVnIGZyb20gIzIzNTkyIGluIGZ1bGxzY3JlZW4uXG4gIGNvbnN0IGRlbmlhbFN0YXRlUmVmID0gdXNlUmVmPHtcbiAgICBhcHByb3ZlZDogU2V0PG51bWJlcj5cbiAgICByZXRyeTogU2V0PG51bWJlcj5cbiAgICBkZW5pYWxzOiByZWFkb25seSBBdXRvTW9kZURlbmlhbFtdXG4gIH0+KHsgYXBwcm92ZWQ6IG5ldyBTZXQoKSwgcmV0cnk6IG5ldyBTZXQoKSwgZGVuaWFsczogW10gfSlcbiAgY29uc3QgaGFuZGxlRGVuaWFsU3RhdGVDaGFuZ2UgPSB1c2VDYWxsYmFjayhcbiAgICAoczogdHlwZW9mIGRlbmlhbFN0YXRlUmVmLmN1cnJlbnQpID0+IHtcbiAgICAgIGRlbmlhbFN0YXRlUmVmLmN1cnJlbnQgPSBzXG4gICAgfSxcbiAgICBbXSxcbiAgKVxuXG4gIGNvbnN0IFtzZWxlY3RlZFJ1bGUsIHNldFNlbGVjdGVkUnVsZV0gPSB1c2VTdGF0ZTxQZXJtaXNzaW9uUnVsZSB8IHVuZGVmaW5lZD4oKVxuICAvLyBUcmFjayB0aGUga2V5IG9mIHRoZSBsYXN0IGZvY3VzZWQgcnVsZSB0byByZXN0b3JlIHBvc2l0aW9uIGFmdGVyIGRlbGV0aW9uXG4gIGNvbnN0IFtsYXN0Rm9jdXNlZFJ1bGVLZXksIHNldExhc3RGb2N1c2VkUnVsZUtleV0gPSB1c2VTdGF0ZTxcbiAgICBzdHJpbmcgfCB1bmRlZmluZWRcbiAgPigpXG4gIGNvbnN0IFthZGRpbmdSdWxlVG9UYWIsIHNldEFkZGluZ1J1bGVUb1RhYl0gPSB1c2VTdGF0ZTxUYWJUeXBlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3ZhbGlkYXRlZFJ1bGUsIHNldFZhbGlkYXRlZFJ1bGVdID0gdXNlU3RhdGU8e1xuICAgIHJ1bGVCZWhhdmlvcjogUGVybWlzc2lvbkJlaGF2aW9yXG4gICAgcnVsZVZhbHVlOiBQZXJtaXNzaW9uUnVsZVZhbHVlXG4gIH0gfCBudWxsPihudWxsKVxuICBjb25zdCBbaXNBZGRpbmdXb3Jrc3BhY2VEaXJlY3RvcnksIHNldElzQWRkaW5nV29ya3NwYWNlRGlyZWN0b3J5XSA9XG4gICAgdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZW1vdmluZ0RpcmVjdG9yeSwgc2V0UmVtb3ZpbmdEaXJlY3RvcnldID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4oXG4gICAgbnVsbCxcbiAgKVxuICBjb25zdCBbaXNTZWFyY2hNb2RlLCBzZXRJc1NlYXJjaE1vZGVdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtoZWFkZXJGb2N1c2VkLCBzZXRIZWFkZXJGb2N1c2VkXSA9IHVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IGhhbmRsZUhlYWRlckZvY3VzQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGZvY3VzZWQ6IGJvb2xlYW4pID0+IHtcbiAgICBzZXRIZWFkZXJGb2N1c2VkKGZvY3VzZWQpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGFsbG93UnVsZXNCeUtleSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBQZXJtaXNzaW9uUnVsZT4oKVxuICAgIGdldEFsbG93UnVsZXModG9vbFBlcm1pc3Npb25Db250ZXh0KS5mb3JFYWNoKHJ1bGUgPT4ge1xuICAgICAgbWFwLnNldChqc29uU3RyaW5naWZ5KHJ1bGUpLCBydWxlKVxuICAgIH0pXG4gICAgcmV0dXJuIG1hcFxuICB9LCBbdG9vbFBlcm1pc3Npb25Db250ZXh0XSlcblxuICBjb25zdCBkZW55UnVsZXNCeUtleSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBQZXJtaXNzaW9uUnVsZT4oKVxuICAgIGdldERlbnlSdWxlcyh0b29sUGVybWlzc2lvbkNvbnRleHQpLmZvckVhY2gocnVsZSA9PiB7XG4gICAgICBtYXAuc2V0KGpzb25TdHJpbmdpZnkocnVsZSksIHJ1bGUpXG4gICAgfSlcbiAgICByZXR1cm4gbWFwXG4gIH0sIFt0b29sUGVybWlzc2lvbkNvbnRleHRdKVxuXG4gIGNvbnN0IGFza1J1bGVzQnlLZXkgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgUGVybWlzc2lvblJ1bGU+KClcbiAgICBnZXRBc2tSdWxlcyh0b29sUGVybWlzc2lvbkNvbnRleHQpLmZvckVhY2gocnVsZSA9PiB7XG4gICAgICBtYXAuc2V0KGpzb25TdHJpbmdpZnkocnVsZSksIHJ1bGUpXG4gICAgfSlcbiAgICByZXR1cm4gbWFwXG4gIH0sIFt0b29sUGVybWlzc2lvbkNvbnRleHRdKVxuXG4gIGNvbnN0IGdldFJ1bGVzT3B0aW9ucyA9IHVzZUNhbGxiYWNrKFxuICAgICh0YWI6IFRhYlR5cGUsIHF1ZXJ5OiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgY29uc3QgcnVsZXNCeUtleSA9ICgoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodGFiKSB7XG4gICAgICAgICAgY2FzZSAnYWxsb3cnOlxuICAgICAgICAgICAgcmV0dXJuIGFsbG93UnVsZXNCeUtleVxuICAgICAgICAgIGNhc2UgJ2RlbnknOlxuICAgICAgICAgICAgcmV0dXJuIGRlbnlSdWxlc0J5S2V5XG4gICAgICAgICAgY2FzZSAnYXNrJzpcbiAgICAgICAgICAgIHJldHVybiBhc2tSdWxlc0J5S2V5XG4gICAgICAgICAgY2FzZSAnd29ya3NwYWNlJzpcbiAgICAgICAgICBjYXNlICdyZWNlbnQnOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXA8c3RyaW5nLCBQZXJtaXNzaW9uUnVsZT4oKVxuICAgICAgICB9XG4gICAgICB9KSgpXG5cbiAgICAgIGNvbnN0IG9wdGlvbnM6IE9wdGlvbltdID0gW11cblxuICAgICAgLy8gT25seSBzaG93IFwiQWRkIGEgbmV3IHJ1bGVcIiBmb3IgYWxsb3cgYW5kIGRlbnkgdGFicyAoYW5kIG5vdCB3aGVuIHNlYXJjaGluZylcbiAgICAgIGlmICh0YWIgIT09ICd3b3Jrc3BhY2UnICYmIHRhYiAhPT0gJ3JlY2VudCcgJiYgIXF1ZXJ5KSB7XG4gICAgICAgIG9wdGlvbnMucHVzaCh7XG4gICAgICAgICAgbGFiZWw6IGBBZGQgYSBuZXcgcnVsZSR7ZmlndXJlcy5lbGxpcHNpc31gLFxuICAgICAgICAgIHZhbHVlOiAnYWRkLW5ldy1ydWxlJyxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IGFsbCBydWxlIGtleXMgYW5kIHNvcnQgdGhlbSBhbHBoYWJldGljYWxseSBiYXNlZCBvbiBydWxlJ3MgZm9ybWF0dGVkIHZhbHVlXG4gICAgICBjb25zdCBzb3J0ZWRSdWxlS2V5cyA9IEFycmF5LmZyb20ocnVsZXNCeUtleS5rZXlzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgY29uc3QgcnVsZUEgPSBydWxlc0J5S2V5LmdldChhKVxuICAgICAgICBjb25zdCBydWxlQiA9IHJ1bGVzQnlLZXkuZ2V0KGIpXG4gICAgICAgIGlmIChydWxlQSAmJiBydWxlQikge1xuICAgICAgICAgIGNvbnN0IHJ1bGVBU3RyaW5nID0gcGVybWlzc2lvblJ1bGVWYWx1ZVRvU3RyaW5nKFxuICAgICAgICAgICAgcnVsZUEucnVsZVZhbHVlLFxuICAgICAgICAgICkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGNvbnN0IHJ1bGVCU3RyaW5nID0gcGVybWlzc2lvblJ1bGVWYWx1ZVRvU3RyaW5nKFxuICAgICAgICAgICAgcnVsZUIucnVsZVZhbHVlLFxuICAgICAgICAgICkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIHJldHVybiBydWxlQVN0cmluZy5sb2NhbGVDb21wYXJlKHJ1bGVCU3RyaW5nKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9KVxuXG4gICAgICAvLyBCdWlsZCBvcHRpb25zIGZyb20gc29ydGVkIGtleXMsIGZpbHRlcmluZyBieSBzZWFyY2ggcXVlcnlcbiAgICAgIGNvbnN0IGxvd2VyUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpXG4gICAgICBmb3IgKGNvbnN0IHJ1bGVLZXkgb2Ygc29ydGVkUnVsZUtleXMpIHtcbiAgICAgICAgY29uc3QgcnVsZSA9IHJ1bGVzQnlLZXkuZ2V0KHJ1bGVLZXkpXG4gICAgICAgIGlmIChydWxlKSB7XG4gICAgICAgICAgY29uc3QgcnVsZVN0cmluZyA9IHBlcm1pc3Npb25SdWxlVmFsdWVUb1N0cmluZyhydWxlLnJ1bGVWYWx1ZSlcbiAgICAgICAgICAvLyBGaWx0ZXIgYnkgc2VhcmNoIHF1ZXJ5IGlmIHByb3ZpZGVkXG4gICAgICAgICAgaWYgKHF1ZXJ5ICYmICFydWxlU3RyaW5nLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJRdWVyeSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIG9wdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBsYWJlbDogcnVsZVN0cmluZyxcbiAgICAgICAgICAgIHZhbHVlOiBydWxlS2V5LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgb3B0aW9ucywgcnVsZXNCeUtleSB9XG4gICAgfSxcbiAgICBbYWxsb3dSdWxlc0J5S2V5LCBkZW55UnVsZXNCeUtleSwgYXNrUnVsZXNCeUtleV0sXG4gIClcblxuICBjb25zdCBleGl0U3RhdGUgPSB1c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MoKVxuXG4gIGNvbnN0IGlzU2VhcmNoTW9kZUFjdGl2ZSA9XG4gICAgIXNlbGVjdGVkUnVsZSAmJlxuICAgICFhZGRpbmdSdWxlVG9UYWIgJiZcbiAgICAhdmFsaWRhdGVkUnVsZSAmJlxuICAgICFpc0FkZGluZ1dvcmtzcGFjZURpcmVjdG9yeSAmJlxuICAgICFyZW1vdmluZ0RpcmVjdG9yeVxuXG4gIGNvbnN0IHtcbiAgICBxdWVyeTogc2VhcmNoUXVlcnksXG4gICAgc2V0UXVlcnk6IHNldFNlYXJjaFF1ZXJ5LFxuICAgIGN1cnNvck9mZnNldDogc2VhcmNoQ3Vyc29yT2Zmc2V0LFxuICB9ID0gdXNlU2VhcmNoSW5wdXQoe1xuICAgIGlzQWN0aXZlOiBpc1NlYXJjaE1vZGVBY3RpdmUgJiYgaXNTZWFyY2hNb2RlLFxuICAgIG9uRXhpdDogKCkgPT4ge1xuICAgICAgc2V0SXNTZWFyY2hNb2RlKGZhbHNlKVxuICAgIH0sXG4gIH0pXG5cbiAgLy8gSGFuZGxlIGVudGVyaW5nIHNlYXJjaCBtb2RlXG4gIGNvbnN0IGhhbmRsZUtleURvd24gPSB1c2VDYWxsYmFjayhcbiAgICAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKCFpc1NlYXJjaE1vZGVBY3RpdmUpIHJldHVyblxuICAgICAgaWYgKGlzU2VhcmNoTW9kZSkgcmV0dXJuXG4gICAgICBpZiAoZS5jdHJsIHx8IGUubWV0YSkgcmV0dXJuXG5cbiAgICAgIC8vIEVudGVyIHNlYXJjaCBtb2RlIHdpdGggJy8nIG9yIGFueSBwcmludGFibGUgY2hhcmFjdGVyLlxuICAgICAgLy8gZS5rZXkubGVuZ3RoID09PSAxIGZpbHRlcnMgb3V0IHNwZWNpYWwga2V5cyAoZG93biwgcmV0dXJuLCBlc2NhcGUsXG4gICAgICAvLyBldGMuKSDigJQgcHJldmlvdXNseSB0aGUgcmF3IGVzY2FwZSBzZXF1ZW5jZSBsZWFrZWQgdGhyb3VnaCBhbmRcbiAgICAgIC8vIHRyaWdnZXJlZCBzZWFyY2ggbW9kZSB3aXRoIGdhcmJhZ2Ugb24gYXJyb3cta2V5IHByZXNzLlxuICAgICAgaWYgKGUua2V5ID09PSAnLycpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHNldElzU2VhcmNoTW9kZSh0cnVlKVxuICAgICAgICBzZXRTZWFyY2hRdWVyeSgnJylcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGUua2V5Lmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAvLyBEb24ndCBlbnRlciBzZWFyY2ggbW9kZSBmb3IgdmltLW5hdiAvIHNwYWNlIC8gcmV0cnkga2V5XG4gICAgICAgIGUua2V5ICE9PSAnaicgJiZcbiAgICAgICAgZS5rZXkgIT09ICdrJyAmJlxuICAgICAgICBlLmtleSAhPT0gJ20nICYmXG4gICAgICAgIGUua2V5ICE9PSAnaScgJiZcbiAgICAgICAgZS5rZXkgIT09ICdyJyAmJlxuICAgICAgICBlLmtleSAhPT0gJyAnXG4gICAgICApIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHNldElzU2VhcmNoTW9kZSh0cnVlKVxuICAgICAgICBzZXRTZWFyY2hRdWVyeShlLmtleSlcbiAgICAgIH1cbiAgICB9LFxuICAgIFtpc1NlYXJjaE1vZGVBY3RpdmUsIGlzU2VhcmNoTW9kZSwgc2V0U2VhcmNoUXVlcnldLFxuICApXG5cbiAgY29uc3QgaGFuZGxlVG9vbFNlbGVjdCA9IHVzZUNhbGxiYWNrKFxuICAgIChzZWxlY3RlZFZhbHVlOiBzdHJpbmcsIHRhYjogVGFiVHlwZSkgPT4ge1xuICAgICAgY29uc3QgeyBydWxlc0J5S2V5IH0gPSBnZXRSdWxlc09wdGlvbnModGFiKVxuICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgPT09ICdhZGQtbmV3LXJ1bGUnKSB7XG4gICAgICAgIHNldEFkZGluZ1J1bGVUb1RhYih0YWIpXG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0U2VsZWN0ZWRSdWxlKHJ1bGVzQnlLZXkuZ2V0KHNlbGVjdGVkVmFsdWUpKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9LFxuICAgIFtnZXRSdWxlc09wdGlvbnNdLFxuICApXG5cbiAgY29uc3QgaGFuZGxlUnVsZUlucHV0Q2FuY2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldEFkZGluZ1J1bGVUb1RhYihudWxsKVxuICB9LCBbXSlcblxuICBjb25zdCBoYW5kbGVSdWxlSW5wdXRTdWJtaXQgPSB1c2VDYWxsYmFjayhcbiAgICAocnVsZVZhbHVlOiBQZXJtaXNzaW9uUnVsZVZhbHVlLCBydWxlQmVoYXZpb3I6IFBlcm1pc3Npb25CZWhhdmlvcikgPT4ge1xuICAgICAgc2V0VmFsaWRhdGVkUnVsZSh7IHJ1bGVWYWx1ZSwgcnVsZUJlaGF2aW9yIH0pXG4gICAgICBzZXRBZGRpbmdSdWxlVG9UYWIobnVsbClcbiAgICB9LFxuICAgIFtdLFxuICApXG5cbiAgY29uc3QgaGFuZGxlQWRkUnVsZXNTdWNjZXNzID0gdXNlQ2FsbGJhY2soXG4gICAgKHJ1bGVzOiBQZXJtaXNzaW9uUnVsZVtdLCB1bnJlYWNoYWJsZT86IFVucmVhY2hhYmxlUnVsZVtdKSA9PiB7XG4gICAgICBzZXRWYWxpZGF0ZWRSdWxlKG51bGwpXG4gICAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgcnVsZXMpIHtcbiAgICAgICAgc2V0Q2hhbmdlcyhwcmV2ID0+IFtcbiAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgIGBBZGRlZCAke3J1bGUucnVsZUJlaGF2aW9yfSBydWxlICR7Y2hhbGsuYm9sZChwZXJtaXNzaW9uUnVsZVZhbHVlVG9TdHJpbmcocnVsZS5ydWxlVmFsdWUpKX1gLFxuICAgICAgICBdKVxuICAgICAgfVxuXG4gICAgICAvLyBTaG93IHdhcm5pbmdzIGZvciBhbnkgdW5yZWFjaGFibGUgcnVsZXMgd2UganVzdCBhZGRlZFxuICAgICAgaWYgKHVucmVhY2hhYmxlICYmIHVucmVhY2hhYmxlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yIChjb25zdCB1IG9mIHVucmVhY2hhYmxlKSB7XG4gICAgICAgICAgY29uc3Qgc2V2ZXJpdHkgPSB1LnNoYWRvd1R5cGUgPT09ICdkZW55JyA/ICdibG9ja2VkJyA6ICdzaGFkb3dlZCdcbiAgICAgICAgICBzZXRDaGFuZ2VzKHByZXYgPT4gW1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGNoYWxrLnllbGxvdyhcbiAgICAgICAgICAgICAgYCR7ZmlndXJlcy53YXJuaW5nfSBXYXJuaW5nOiAke3Blcm1pc3Npb25SdWxlVmFsdWVUb1N0cmluZyh1LnJ1bGUucnVsZVZhbHVlKX0gaXMgJHtzZXZlcml0eX1gLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGNoYWxrLmRpbShgICAke3UucmVhc29ufWApLFxuICAgICAgICAgICAgY2hhbGsuZGltKGAgIEZpeDogJHt1LmZpeH1gKSxcbiAgICAgICAgICBdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBbXSxcbiAgKVxuXG4gIGNvbnN0IGhhbmRsZUFkZFJ1bGVDYW5jZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0VmFsaWRhdGVkUnVsZShudWxsKVxuICB9LCBbXSlcblxuICBjb25zdCBoYW5kbGVSZXF1ZXN0QWRkRGlyZWN0b3J5ID0gdXNlQ2FsbGJhY2soXG4gICAgKCkgPT4gc2V0SXNBZGRpbmdXb3Jrc3BhY2VEaXJlY3RvcnkodHJ1ZSksXG4gICAgW10sXG4gIClcbiAgY29uc3QgaGFuZGxlUmVxdWVzdFJlbW92ZURpcmVjdG9yeSA9IHVzZUNhbGxiYWNrKFxuICAgIChwYXRoOiBzdHJpbmcpID0+IHNldFJlbW92aW5nRGlyZWN0b3J5KHBhdGgpLFxuICAgIFtdLFxuICApXG4gIGNvbnN0IGhhbmRsZVJ1bGVzQ2FuY2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IHMgPSBkZW5pYWxTdGF0ZVJlZi5jdXJyZW50XG4gICAgY29uc3QgZGVuaWFsc0ZvciA9IChzZXQ6IFNldDxudW1iZXI+KSA9PlxuICAgICAgQXJyYXkuZnJvbShzZXQpXG4gICAgICAgIC5tYXAoaWR4ID0+IHMuZGVuaWFsc1tpZHhdKVxuICAgICAgICAuZmlsdGVyKChkKTogZCBpcyBBdXRvTW9kZURlbmlhbCA9PiBkICE9PSB1bmRlZmluZWQpXG5cbiAgICBjb25zdCByZXRyeURlbmlhbHMgPSBkZW5pYWxzRm9yKHMucmV0cnkpXG4gICAgaWYgKHJldHJ5RGVuaWFscy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjb21tYW5kcyA9IHJldHJ5RGVuaWFscy5tYXAoZCA9PiBkLmRpc3BsYXkpXG4gICAgICBvblJldHJ5RGVuaWFscz8uKGNvbW1hbmRzKVxuICAgICAgb25FeGl0KHVuZGVmaW5lZCwge1xuICAgICAgICBzaG91bGRRdWVyeTogdHJ1ZSxcbiAgICAgICAgbWV0YU1lc3NhZ2VzOiBbXG4gICAgICAgICAgYFBlcm1pc3Npb24gZ3JhbnRlZCBmb3I6ICR7Y29tbWFuZHMuam9pbignLCAnKX0uIFlvdSBtYXkgbm93IHJldHJ5ICR7Y29tbWFuZHMubGVuZ3RoID09PSAxID8gJ3RoaXMgY29tbWFuZCcgOiAndGhlc2UgY29tbWFuZHMnfSBpZiB5b3Ugd291bGQgbGlrZS5gLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGFwcHJvdmVkRGVuaWFscyA9IGRlbmlhbHNGb3Iocy5hcHByb3ZlZClcbiAgICBpZiAoYXBwcm92ZWREZW5pYWxzLmxlbmd0aCA+IDAgfHwgY2hhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBhcHByb3ZlZE1zZyA9XG4gICAgICAgIGFwcHJvdmVkRGVuaWFscy5sZW5ndGggPiAwXG4gICAgICAgICAgPyBbXG4gICAgICAgICAgICAgIGBBcHByb3ZlZCAke2FwcHJvdmVkRGVuaWFscy5tYXAoZCA9PiBjaGFsay5ib2xkKGQuZGlzcGxheSkpLmpvaW4oJywgJyl9YCxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICA6IFtdXG4gICAgICBvbkV4aXQoWy4uLmFwcHJvdmVkTXNnLCAuLi5jaGFuZ2VzXS5qb2luKCdcXG4nKSlcbiAgICB9IGVsc2Uge1xuICAgICAgb25FeGl0KCdQZXJtaXNzaW9ucyBkaWFsb2cgZGlzbWlzc2VkJywge1xuICAgICAgICBkaXNwbGF5OiAnc3lzdGVtJyxcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbY2hhbmdlcywgb25FeGl0LCBvblJldHJ5RGVuaWFsc10pXG5cbiAgLy8gSGFuZGxlIEVzY2FwZSBhdCB0aGUgdG9wIGxldmVsIHNvIGl0IHdvcmtzIGV2ZW4gd2hlbiBoZWFkZXIgaXMgZm9jdXNlZFxuICAvLyAod2hpY2ggZGlzYWJsZXMgdGhlIFNlbGVjdCBjb21wb25lbnQgYW5kIGl0cyBzZWxlY3Q6Y2FuY2VsIGtleWJpbmRpbmcpLlxuICAvLyBNaXJyb3JzIHRoZSBwYXR0ZXJuIGluIFNldHRpbmdzLnRzeC5cbiAgdXNlS2V5YmluZGluZygnY29uZmlybTpubycsIGhhbmRsZVJ1bGVzQ2FuY2VsLCB7XG4gICAgY29udGV4dDogJ1NldHRpbmdzJyxcbiAgICBpc0FjdGl2ZTogaXNTZWFyY2hNb2RlQWN0aXZlICYmICFpc1NlYXJjaE1vZGUsXG4gIH0pXG5cbiAgY29uc3QgaGFuZGxlRGVsZXRlUnVsZSA9ICgpID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkUnVsZSkgcmV0dXJuXG5cbiAgICAvLyBGaW5kIHRoZSBhZGphY2VudCBydWxlIHRvIGZvY3VzIG9uIGFmdGVyIGRlbGV0aW9uXG4gICAgY29uc3QgeyBvcHRpb25zIH0gPSBnZXRSdWxlc09wdGlvbnMoc2VsZWN0ZWRSdWxlLnJ1bGVCZWhhdmlvciBhcyBUYWJUeXBlKVxuICAgIGNvbnN0IHNlbGVjdGVkS2V5ID0ganNvblN0cmluZ2lmeShzZWxlY3RlZFJ1bGUpXG4gICAgY29uc3QgcnVsZUtleXMgPSBvcHRpb25zXG4gICAgICAuZmlsdGVyKG9wdCA9PiBvcHQudmFsdWUgIT09ICdhZGQtbmV3LXJ1bGUnKVxuICAgICAgLm1hcChvcHQgPT4gb3B0LnZhbHVlKVxuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHJ1bGVLZXlzLmluZGV4T2Yoc2VsZWN0ZWRLZXkpXG5cbiAgICAvLyBUcnkgdG8gZm9jdXMgb24gdGhlIG5leHQgcnVsZSwgb3IgdGhlIHByZXZpb3VzIGlmIGRlbGV0aW5nIHRoZSBsYXN0IG9uZVxuICAgIGxldCBuZXh0Rm9jdXNLZXk6IHN0cmluZyB8IHVuZGVmaW5lZFxuICAgIGlmIChjdXJyZW50SW5kZXggIT09IC0xKSB7XG4gICAgICBpZiAoY3VycmVudEluZGV4IDwgcnVsZUtleXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAvLyBGb2N1cyBvbiB0aGUgbmV4dCBydWxlXG4gICAgICAgIG5leHRGb2N1c0tleSA9IHJ1bGVLZXlzW2N1cnJlbnRJbmRleCArIDFdXG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA+IDApIHtcbiAgICAgICAgLy8gRm9jdXMgb24gdGhlIHByZXZpb3VzIHJ1bGUgKHdlJ3JlIGRlbGV0aW5nIHRoZSBsYXN0IG9uZSlcbiAgICAgICAgbmV4dEZvY3VzS2V5ID0gcnVsZUtleXNbY3VycmVudEluZGV4IC0gMV1cbiAgICAgIH1cbiAgICB9XG4gICAgc2V0TGFzdEZvY3VzZWRSdWxlS2V5KG5leHRGb2N1c0tleSlcblxuICAgIHZvaWQgZGVsZXRlUGVybWlzc2lvblJ1bGUoe1xuICAgICAgcnVsZTogc2VsZWN0ZWRSdWxlLFxuICAgICAgaW5pdGlhbENvbnRleHQ6IHRvb2xQZXJtaXNzaW9uQ29udGV4dCxcbiAgICAgIHNldFRvb2xQZXJtaXNzaW9uQ29udGV4dCh0b29sUGVybWlzc2lvbkNvbnRleHQpIHtcbiAgICAgICAgc2V0QXBwU3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgdG9vbFBlcm1pc3Npb25Db250ZXh0LFxuICAgICAgICB9KSlcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIHNldENoYW5nZXMocHJldiA9PiBbXG4gICAgICAuLi5wcmV2LFxuICAgICAgYERlbGV0ZWQgJHtzZWxlY3RlZFJ1bGUucnVsZUJlaGF2aW9yfSBydWxlICR7Y2hhbGsuYm9sZChwZXJtaXNzaW9uUnVsZVZhbHVlVG9TdHJpbmcoc2VsZWN0ZWRSdWxlLnJ1bGVWYWx1ZSkpfWAsXG4gICAgXSlcbiAgICBzZXRTZWxlY3RlZFJ1bGUodW5kZWZpbmVkKVxuICB9XG5cbiAgaWYgKHNlbGVjdGVkUnVsZSkge1xuICAgIHJldHVybiAoXG4gICAgICA8UnVsZURldGFpbHNcbiAgICAgICAgcnVsZT17c2VsZWN0ZWRSdWxlfVxuICAgICAgICBvbkRlbGV0ZT17aGFuZGxlRGVsZXRlUnVsZX1cbiAgICAgICAgb25DYW5jZWw9eygpID0+IHNldFNlbGVjdGVkUnVsZSh1bmRlZmluZWQpfVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICBpZiAoXG4gICAgYWRkaW5nUnVsZVRvVGFiICYmXG4gICAgYWRkaW5nUnVsZVRvVGFiICE9PSAnd29ya3NwYWNlJyAmJlxuICAgIGFkZGluZ1J1bGVUb1RhYiAhPT0gJ3JlY2VudCdcbiAgKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxQZXJtaXNzaW9uUnVsZUlucHV0XG4gICAgICAgIG9uQ2FuY2VsPXtoYW5kbGVSdWxlSW5wdXRDYW5jZWx9XG4gICAgICAgIG9uU3VibWl0PXtoYW5kbGVSdWxlSW5wdXRTdWJtaXR9XG4gICAgICAgIHJ1bGVCZWhhdmlvcj17YWRkaW5nUnVsZVRvVGFifVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICBpZiAodmFsaWRhdGVkUnVsZSkge1xuICAgIHJldHVybiAoXG4gICAgICA8QWRkUGVybWlzc2lvblJ1bGVzXG4gICAgICAgIG9uQWRkUnVsZXM9e2hhbmRsZUFkZFJ1bGVzU3VjY2Vzc31cbiAgICAgICAgb25DYW5jZWw9e2hhbmRsZUFkZFJ1bGVDYW5jZWx9XG4gICAgICAgIHJ1bGVWYWx1ZXM9e1t2YWxpZGF0ZWRSdWxlLnJ1bGVWYWx1ZV19XG4gICAgICAgIHJ1bGVCZWhhdmlvcj17dmFsaWRhdGVkUnVsZS5ydWxlQmVoYXZpb3J9XG4gICAgICAgIGluaXRpYWxDb250ZXh0PXt0b29sUGVybWlzc2lvbkNvbnRleHR9XG4gICAgICAgIHNldFRvb2xQZXJtaXNzaW9uQ29udGV4dD17dG9vbFBlcm1pc3Npb25Db250ZXh0ID0+IHtcbiAgICAgICAgICBzZXRBcHBTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgdG9vbFBlcm1pc3Npb25Db250ZXh0LFxuICAgICAgICAgIH0pKVxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICBpZiAoaXNBZGRpbmdXb3Jrc3BhY2VEaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEFkZFdvcmtzcGFjZURpcmVjdG9yeVxuICAgICAgICBvbkFkZERpcmVjdG9yeT17KHBhdGgsIHJlbWVtYmVyKSA9PiB7XG4gICAgICAgICAgLy8gQXBwbHkgdGhlIHBlcm1pc3Npb24gdXBkYXRlIHRvIGFkZCB0aGUgZGlyZWN0b3J5XG4gICAgICAgICAgY29uc3QgZGVzdGluYXRpb246IFBlcm1pc3Npb25VcGRhdGVEZXN0aW5hdGlvbiA9IHJlbWVtYmVyXG4gICAgICAgICAgICA/ICdsb2NhbFNldHRpbmdzJ1xuICAgICAgICAgICAgOiAnc2Vzc2lvbidcblxuICAgICAgICAgIGNvbnN0IHBlcm1pc3Npb25VcGRhdGUgPSB7XG4gICAgICAgICAgICB0eXBlOiAnYWRkRGlyZWN0b3JpZXMnIGFzIGNvbnN0LFxuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IFtwYXRoXSxcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHVwZGF0ZWRDb250ZXh0ID0gYXBwbHlQZXJtaXNzaW9uVXBkYXRlKFxuICAgICAgICAgICAgdG9vbFBlcm1pc3Npb25Db250ZXh0LFxuICAgICAgICAgICAgcGVybWlzc2lvblVwZGF0ZSxcbiAgICAgICAgICApXG4gICAgICAgICAgc2V0QXBwU3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIHRvb2xQZXJtaXNzaW9uQ29udGV4dDogdXBkYXRlZENvbnRleHQsXG4gICAgICAgICAgfSkpXG5cbiAgICAgICAgICAvLyBQZXJzaXN0IGlmIHJlbWVtYmVyIGlzIHRydWVcbiAgICAgICAgICBpZiAocmVtZW1iZXIpIHtcbiAgICAgICAgICAgIHBlcnNpc3RQZXJtaXNzaW9uVXBkYXRlKHBlcm1pc3Npb25VcGRhdGUpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2V0Q2hhbmdlcyhwcmV2ID0+IFtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBgQWRkZWQgZGlyZWN0b3J5ICR7Y2hhbGsuYm9sZChwYXRoKX0gdG8gd29ya3NwYWNlJHtyZW1lbWJlciA/ICcgYW5kIHNhdmVkIHRvIGxvY2FsIHNldHRpbmdzJyA6ICcgZm9yIHRoaXMgc2Vzc2lvbid9YCxcbiAgICAgICAgICBdKVxuICAgICAgICAgIHNldElzQWRkaW5nV29ya3NwYWNlRGlyZWN0b3J5KGZhbHNlKVxuICAgICAgICB9fVxuICAgICAgICBvbkNhbmNlbD17KCkgPT4gc2V0SXNBZGRpbmdXb3Jrc3BhY2VEaXJlY3RvcnkoZmFsc2UpfVxuICAgICAgICBwZXJtaXNzaW9uQ29udGV4dD17dG9vbFBlcm1pc3Npb25Db250ZXh0fVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICBpZiAocmVtb3ZpbmdEaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFJlbW92ZVdvcmtzcGFjZURpcmVjdG9yeVxuICAgICAgICBkaXJlY3RvcnlQYXRoPXtyZW1vdmluZ0RpcmVjdG9yeX1cbiAgICAgICAgb25SZW1vdmU9eygpID0+IHtcbiAgICAgICAgICBzZXRDaGFuZ2VzKHByZXYgPT4gW1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGBSZW1vdmVkIGRpcmVjdG9yeSAke2NoYWxrLmJvbGQocmVtb3ZpbmdEaXJlY3RvcnkpfSBmcm9tIHdvcmtzcGFjZWAsXG4gICAgICAgICAgXSlcbiAgICAgICAgICBzZXRSZW1vdmluZ0RpcmVjdG9yeShudWxsKVxuICAgICAgICB9fVxuICAgICAgICBvbkNhbmNlbD17KCkgPT4gc2V0UmVtb3ZpbmdEaXJlY3RvcnkobnVsbCl9XG4gICAgICAgIHBlcm1pc3Npb25Db250ZXh0PXt0b29sUGVybWlzc2lvbkNvbnRleHR9XG4gICAgICAgIHNldFBlcm1pc3Npb25Db250ZXh0PXt0b29sUGVybWlzc2lvbkNvbnRleHQgPT4ge1xuICAgICAgICAgIHNldEFwcFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICB0b29sUGVybWlzc2lvbkNvbnRleHQsXG4gICAgICAgICAgfSkpXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIGNvbnN0IHNoYXJlZFJ1bGVzUHJvcHMgPSB7XG4gICAgc2VhcmNoUXVlcnksXG4gICAgaXNTZWFyY2hNb2RlLFxuICAgIGlzRm9jdXNlZDogaXNUZXJtaW5hbEZvY3VzZWQsXG4gICAgb25DYW5jZWw6IGhhbmRsZVJ1bGVzQ2FuY2VsLFxuICAgIGxhc3RGb2N1c2VkUnVsZUtleSxcbiAgICBjdXJzb3JPZmZzZXQ6IHNlYXJjaEN1cnNvck9mZnNldCxcbiAgICBnZXRSdWxlc09wdGlvbnMsXG4gICAgaGFuZGxlVG9vbFNlbGVjdCxcbiAgICBvbkhlYWRlckZvY3VzQ2hhbmdlOiBoYW5kbGVIZWFkZXJGb2N1c0NoYW5nZSxcbiAgfVxuXG4gIGNvbnN0IGlzSGlkZGVuID1cbiAgICAhIXNlbGVjdGVkUnVsZSB8fFxuICAgICEhYWRkaW5nUnVsZVRvVGFiIHx8XG4gICAgISF2YWxpZGF0ZWRSdWxlIHx8XG4gICAgaXNBZGRpbmdXb3Jrc3BhY2VEaXJlY3RvcnkgfHxcbiAgICAhIXJlbW92aW5nRGlyZWN0b3J5XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBvbktleURvd249e2hhbmRsZUtleURvd259PlxuICAgICAgPFBhbmUgY29sb3I9XCJwZXJtaXNzaW9uXCI+XG4gICAgICAgIDxUYWJzXG4gICAgICAgICAgdGl0bGU9XCJQZXJtaXNzaW9uczpcIlxuICAgICAgICAgIGNvbG9yPVwicGVybWlzc2lvblwiXG4gICAgICAgICAgZGVmYXVsdFRhYj17ZGVmYXVsdFRhYn1cbiAgICAgICAgICBoaWRkZW49e2lzSGlkZGVufVxuICAgICAgICAgIGluaXRpYWxIZWFkZXJGb2N1c2VkPXshaGFzRGVuaWFsc31cbiAgICAgICAgICBuYXZGcm9tQ29udGVudD17IWlzU2VhcmNoTW9kZX1cbiAgICAgICAgPlxuICAgICAgICAgIDxUYWIgaWQ9XCJyZWNlbnRcIiB0aXRsZT1cIlJlY2VudGx5IGRlbmllZFwiPlxuICAgICAgICAgICAgPFJlY2VudERlbmlhbHNUYWJcbiAgICAgICAgICAgICAgb25IZWFkZXJGb2N1c0NoYW5nZT17aGFuZGxlSGVhZGVyRm9jdXNDaGFuZ2V9XG4gICAgICAgICAgICAgIG9uU3RhdGVDaGFuZ2U9e2hhbmRsZURlbmlhbFN0YXRlQ2hhbmdlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L1RhYj5cbiAgICAgICAgICA8VGFiIGlkPVwiYWxsb3dcIiB0aXRsZT1cIkFsbG93XCI+XG4gICAgICAgICAgICA8UGVybWlzc2lvblJ1bGVzVGFiIHRhYj1cImFsbG93XCIgey4uLnNoYXJlZFJ1bGVzUHJvcHN9IC8+XG4gICAgICAgICAgPC9UYWI+XG4gICAgICAgICAgPFRhYiBpZD1cImFza1wiIHRpdGxlPVwiQXNrXCI+XG4gICAgICAgICAgICA8UGVybWlzc2lvblJ1bGVzVGFiIHRhYj1cImFza1wiIHsuLi5zaGFyZWRSdWxlc1Byb3BzfSAvPlxuICAgICAgICAgIDwvVGFiPlxuICAgICAgICAgIDxUYWIgaWQ9XCJkZW55XCIgdGl0bGU9XCJEZW55XCI+XG4gICAgICAgICAgICA8UGVybWlzc2lvblJ1bGVzVGFiIHRhYj1cImRlbnlcIiB7Li4uc2hhcmVkUnVsZXNQcm9wc30gLz5cbiAgICAgICAgICA8L1RhYj5cbiAgICAgICAgICA8VGFiIGlkPVwid29ya3NwYWNlXCIgdGl0bGU9XCJXb3Jrc3BhY2VcIj5cbiAgICAgICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgICAgICBDbGF1ZGUgQ29kZSBjYW4gcmVhZCBmaWxlcyBpbiB0aGUgd29ya3NwYWNlLCBhbmQgbWFrZSBlZGl0cyB3aGVuXG4gICAgICAgICAgICAgICAgYXV0by1hY2NlcHQgZWRpdHMgaXMgb24uXG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgPFdvcmtzcGFjZVRhYlxuICAgICAgICAgICAgICAgIG9uRXhpdD17b25FeGl0fVxuICAgICAgICAgICAgICAgIHRvb2xQZXJtaXNzaW9uQ29udGV4dD17dG9vbFBlcm1pc3Npb25Db250ZXh0fVxuICAgICAgICAgICAgICAgIG9uUmVxdWVzdEFkZERpcmVjdG9yeT17aGFuZGxlUmVxdWVzdEFkZERpcmVjdG9yeX1cbiAgICAgICAgICAgICAgICBvblJlcXVlc3RSZW1vdmVEaXJlY3Rvcnk9e2hhbmRsZVJlcXVlc3RSZW1vdmVEaXJlY3Rvcnl9XG4gICAgICAgICAgICAgICAgb25IZWFkZXJGb2N1c0NoYW5nZT17aGFuZGxlSGVhZGVyRm9jdXNDaGFuZ2V9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L1RhYj5cbiAgICAgICAgPC9UYWJzPlxuICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0gcGFkZGluZ0xlZnQ9ezF9PlxuICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPlxuICAgICAgICAgICAge2V4aXRTdGF0ZS5wZW5kaW5nID8gKFxuICAgICAgICAgICAgICA8PlByZXNzIHtleGl0U3RhdGUua2V5TmFtZX0gYWdhaW4gdG8gZXhpdDwvPlxuICAgICAgICAgICAgKSA6IGhlYWRlckZvY3VzZWQgPyAoXG4gICAgICAgICAgICAgIDw+4oaQL+KGkiB0YWIgc3dpdGNoIMK3IOKGkyByZXR1cm4gwrcgRXNjIGNhbmNlbDwvPlxuICAgICAgICAgICAgKSA6IGlzU2VhcmNoTW9kZSA/IChcbiAgICAgICAgICAgICAgPD5UeXBlIHRvIGZpbHRlciDCtyBFbnRlci/ihpMgc2VsZWN0IMK3IOKGkSB0YWJzIMK3IEVzYyBjbGVhcjwvPlxuICAgICAgICAgICAgKSA6IGhhc0RlbmlhbHMgJiYgZGVmYXVsdFRhYiA9PT0gJ3JlY2VudCcgPyAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgRW50ZXIgYXBwcm92ZSDCtyByIHJldHJ5IMK3IOKGkeKGkyBuYXZpZ2F0ZSDCtyDihpAv4oaSIHN3aXRjaCDCtyBFc2MgY2FuY2VsXG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICDihpHihpMgbmF2aWdhdGUgwrcgRW50ZXIgc2VsZWN0IMK3IFR5cGUgdG8gc2VhcmNoIMK3IOKGkC/ihpIgc3dpdGNoIMK3IEVzY1xuICAgICAgICAgICAgICAgIGNhbmNlbFxuICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvUGFuZT5cbiAgICA8L0JveD5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsS0FBSyxNQUFNLE9BQU87QUFDekIsT0FBT0MsT0FBTyxNQUFNLFNBQVM7QUFDN0IsT0FBTyxLQUFLQyxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxXQUFXLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFQyxNQUFNLEVBQUVDLFFBQVEsUUFBUSxPQUFPO0FBQ3pFLFNBQVNDLFdBQVcsRUFBRUMsY0FBYyxRQUFRLHVCQUF1QjtBQUNuRSxTQUNFQyxxQkFBcUIsRUFDckJDLHVCQUF1QixRQUNsQiwyQ0FBMkM7QUFDbEQsY0FBY0MsMkJBQTJCLFFBQVEsaURBQWlEO0FBQ2xHLGNBQWNDLG9CQUFvQixRQUFRLHNCQUFzQjtBQUNoRSxTQUFTQyxNQUFNLFFBQVEsNENBQTRDO0FBQ25FLFNBQVNDLDhCQUE4QixRQUFRLGtEQUFrRDtBQUNqRyxTQUFTQyxjQUFjLFFBQVEsa0NBQWtDO0FBQ2pFLGNBQWNDLGFBQWEsUUFBUSx1Q0FBdUM7QUFDMUUsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLEVBQUVDLGdCQUFnQixRQUFRLGlCQUFpQjtBQUM3RCxTQUFTQyxhQUFhLFFBQVEsdUNBQXVDO0FBQ3JF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
