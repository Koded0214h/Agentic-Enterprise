"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedInstalledCell = UnifiedInstalledCell;
var compiler_runtime_1 = require("react/compiler-runtime");
var figures_1 = require("figures");
var React = require("react");
var ink_js_1 = require("../../ink.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
function UnifiedInstalledCell(t0) {
    var $ = (0, compiler_runtime_1.c)(142);
    var item = t0.item, isSelected = t0.isSelected;
    var theme = (0, ink_js_1.useTheme)()[0];
    if (item.type === "plugin") {
        var statusIcon = void 0;
        var statusText = void 0;
        if (item.pendingToggle) {
            var t1_1;
            if ($[0] !== theme) {
                t1_1 = (0, ink_js_1.color)("suggestion", theme)(figures_1.default.arrowRight);
                $[0] = theme;
                $[1] = t1_1;
            }
            else {
                t1_1 = $[1];
            }
            statusIcon = t1_1;
            statusText = item.pendingToggle === "will-enable" ? "will enable" : "will disable";
        }
        else {
            if (item.errorCount > 0) {
                var t1_2;
                if ($[2] !== theme) {
                    t1_2 = (0, ink_js_1.color)("error", theme)(figures_1.default.cross);
                    $[2] = theme;
                    $[3] = t1_2;
                }
                else {
                    t1_2 = $[3];
                }
                statusIcon = t1_2;
                var t2_1 = item.errorCount;
                var t3_1;
                if ($[4] !== item.errorCount) {
                    t3_1 = (0, stringUtils_js_1.plural)(item.errorCount, "error");
                    $[4] = item.errorCount;
                    $[5] = t3_1;
                }
                else {
                    t3_1 = $[5];
                }
                statusText = "".concat(t2_1, " ").concat(t3_1);
            }
            else {
                if (!item.isEnabled) {
                    var t1_3;
                    if ($[6] !== theme) {
                        t1_3 = (0, ink_js_1.color)("inactive", theme)(figures_1.default.radioOff);
                        $[6] = theme;
                        $[7] = t1_3;
                    }
                    else {
                        t1_3 = $[7];
                    }
                    statusIcon = t1_3;
                    statusText = "disabled";
                }
                else {
                    var t1_4;
                    if ($[8] !== theme) {
                        t1_4 = (0, ink_js_1.color)("success", theme)(figures_1.default.tick);
                        $[8] = theme;
                        $[9] = t1_4;
                    }
                    else {
                        t1_4 = $[9];
                    }
                    statusIcon = t1_4;
                    statusText = "enabled";
                }
            }
        }
        var t1_5 = isSelected ? "suggestion" : undefined;
        var t2_2 = isSelected ? "".concat(figures_1.default.pointer, " ") : "  ";
        var t3_2;
        if ($[10] !== t1_5 || $[11] !== t2_2) {
            t3_2 = <ink_js_1.Text color={t1_5}>{t2_2}</ink_js_1.Text>;
            $[10] = t1_5;
            $[11] = t2_2;
            $[12] = t3_2;
        }
        else {
            t3_2 = $[12];
        }
        var t4_1 = isSelected ? "suggestion" : undefined;
        var t5_1;
        if ($[13] !== item.name || $[14] !== t4_1) {
            t5_1 = <ink_js_1.Text color={t4_1}>{item.name}</ink_js_1.Text>;
            $[13] = item.name;
            $[14] = t4_1;
            $[15] = t5_1;
        }
        else {
            t5_1 = $[15];
        }
        var t6_1 = !isSelected;
        var t7_1;
        if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
            t7_1 = <ink_js_1.Text backgroundColor="userMessageBackground">Plugin</ink_js_1.Text>;
            $[16] = t7_1;
        }
        else {
            t7_1 = $[16];
        }
        var t8_1;
        if ($[17] !== t6_1) {
            t8_1 = <ink_js_1.Text dimColor={t6_1}>{" "}{t7_1}</ink_js_1.Text>;
            $[17] = t6_1;
            $[18] = t8_1;
        }
        else {
            t8_1 = $[18];
        }
        var t9_1;
        if ($[19] !== item.marketplace) {
            t9_1 = <ink_js_1.Text dimColor={true}> · {item.marketplace}</ink_js_1.Text>;
            $[19] = item.marketplace;
            $[20] = t9_1;
        }
        else {
            t9_1 = $[20];
        }
        var t10_1 = !isSelected;
        var t11_1;
        if ($[21] !== statusIcon || $[22] !== t10_1) {
            t11_1 = <ink_js_1.Text dimColor={t10_1}> · {statusIcon} </ink_js_1.Text>;
            $[21] = statusIcon;
            $[22] = t10_1;
            $[23] = t11_1;
        }
        else {
            t11_1 = $[23];
        }
        var t12_1 = !isSelected;
        var t13_1;
        if ($[24] !== statusText || $[25] !== t12_1) {
            t13_1 = <ink_js_1.Text dimColor={t12_1}>{statusText}</ink_js_1.Text>;
            $[24] = statusText;
            $[25] = t12_1;
            $[26] = t13_1;
        }
        else {
            t13_1 = $[26];
        }
        var t14 = void 0;
        if ($[27] !== t11_1 || $[28] !== t13_1 || $[29] !== t3_2 || $[30] !== t5_1 || $[31] !== t8_1 || $[32] !== t9_1) {
            t14 = <ink_js_1.Box>{t3_2}{t5_1}{t8_1}{t9_1}{t11_1}{t13_1}</ink_js_1.Box>;
            $[27] = t11_1;
            $[28] = t13_1;
            $[29] = t3_2;
            $[30] = t5_1;
            $[31] = t8_1;
            $[32] = t9_1;
            $[33] = t14;
        }
        else {
            t14 = $[33];
        }
        return t14;
    }
    if (item.type === "flagged-plugin") {
        var t1_6;
        if ($[34] !== theme) {
            t1_6 = (0, ink_js_1.color)("warning", theme)(figures_1.default.warning);
            $[34] = theme;
            $[35] = t1_6;
        }
        else {
            t1_6 = $[35];
        }
        var statusIcon_0 = t1_6;
        var t2_3 = isSelected ? "suggestion" : undefined;
        var t3_3 = isSelected ? "".concat(figures_1.default.pointer, " ") : "  ";
        var t4_2;
        if ($[36] !== t2_3 || $[37] !== t3_3) {
            t4_2 = <ink_js_1.Text color={t2_3}>{t3_3}</ink_js_1.Text>;
            $[36] = t2_3;
            $[37] = t3_3;
            $[38] = t4_2;
        }
        else {
            t4_2 = $[38];
        }
        var t5_2 = isSelected ? "suggestion" : undefined;
        var t6_2;
        if ($[39] !== item.name || $[40] !== t5_2) {
            t6_2 = <ink_js_1.Text color={t5_2}>{item.name}</ink_js_1.Text>;
            $[39] = item.name;
            $[40] = t5_2;
            $[41] = t6_2;
        }
        else {
            t6_2 = $[41];
        }
        var t7_2 = !isSelected;
        var t8_2;
        if ($[42] === Symbol.for("react.memo_cache_sentinel")) {
            t8_2 = <ink_js_1.Text backgroundColor="userMessageBackground">Plugin</ink_js_1.Text>;
            $[42] = t8_2;
        }
        else {
            t8_2 = $[42];
        }
        var t9_2;
        if ($[43] !== t7_2) {
            t9_2 = <ink_js_1.Text dimColor={t7_2}>{" "}{t8_2}</ink_js_1.Text>;
            $[43] = t7_2;
            $[44] = t9_2;
        }
        else {
            t9_2 = $[44];
        }
        var t10_2;
        if ($[45] !== item.marketplace) {
            t10_2 = <ink_js_1.Text dimColor={true}> · {item.marketplace}</ink_js_1.Text>;
            $[45] = item.marketplace;
            $[46] = t10_2;
        }
        else {
            t10_2 = $[46];
        }
        var t11_2 = !isSelected;
        var t12_2;
        if ($[47] !== statusIcon_0 || $[48] !== t11_2) {
            t12_2 = <ink_js_1.Text dimColor={t11_2}> · {statusIcon_0} </ink_js_1.Text>;
            $[47] = statusIcon_0;
            $[48] = t11_2;
            $[49] = t12_2;
        }
        else {
            t12_2 = $[49];
        }
        var t13_2 = !isSelected;
        var t14 = void 0;
        if ($[50] !== t13_2) {
            t14 = <ink_js_1.Text dimColor={t13_2}>removed</ink_js_1.Text>;
            $[50] = t13_2;
            $[51] = t14;
        }
        else {
            t14 = $[51];
        }
        var t15 = void 0;
        if ($[52] !== t10_2 || $[53] !== t12_2 || $[54] !== t14 || $[55] !== t4_2 || $[56] !== t6_2 || $[57] !== t9_2) {
            t15 = <ink_js_1.Box>{t4_2}{t6_2}{t9_2}{t10_2}{t12_2}{t14}</ink_js_1.Box>;
            $[52] = t10_2;
            $[53] = t12_2;
            $[54] = t14;
            $[55] = t4_2;
            $[56] = t6_2;
            $[57] = t9_2;
            $[58] = t15;
        }
        else {
            t15 = $[58];
        }
        return t15;
    }
    if (item.type === "failed-plugin") {
        var t1_7;
        if ($[59] !== theme) {
            t1_7 = (0, ink_js_1.color)("error", theme)(figures_1.default.cross);
            $[59] = theme;
            $[60] = t1_7;
        }
        else {
            t1_7 = $[60];
        }
        var statusIcon_1 = t1_7;
        var t2_4 = item.errorCount;
        var t3_4;
        if ($[61] !== item.errorCount) {
            t3_4 = (0, stringUtils_js_1.plural)(item.errorCount, "error");
            $[61] = item.errorCount;
            $[62] = t3_4;
        }
        else {
            t3_4 = $[62];
        }
        var statusText_0 = "failed to load \u00B7 ".concat(t2_4, " ").concat(t3_4);
        var t4_3 = isSelected ? "suggestion" : undefined;
        var t5_3 = isSelected ? "".concat(figures_1.default.pointer, " ") : "  ";
        var t6_3;
        if ($[63] !== t4_3 || $[64] !== t5_3) {
            t6_3 = <ink_js_1.Text color={t4_3}>{t5_3}</ink_js_1.Text>;
            $[63] = t4_3;
            $[64] = t5_3;
            $[65] = t6_3;
        }
        else {
            t6_3 = $[65];
        }
        var t7_3 = isSelected ? "suggestion" : undefined;
        var t8_3;
        if ($[66] !== item.name || $[67] !== t7_3) {
            t8_3 = <ink_js_1.Text color={t7_3}>{item.name}</ink_js_1.Text>;
            $[66] = item.name;
            $[67] = t7_3;
            $[68] = t8_3;
        }
        else {
            t8_3 = $[68];
        }
        var t9_3 = !isSelected;
        var t10_3;
        if ($[69] === Symbol.for("react.memo_cache_sentinel")) {
            t10_3 = <ink_js_1.Text backgroundColor="userMessageBackground">Plugin</ink_js_1.Text>;
            $[69] = t10_3;
        }
        else {
            t10_3 = $[69];
        }
        var t11_3;
        if ($[70] !== t9_3) {
            t11_3 = <ink_js_1.Text dimColor={t9_3}>{" "}{t10_3}</ink_js_1.Text>;
            $[70] = t9_3;
            $[71] = t11_3;
        }
        else {
            t11_3 = $[71];
        }
        var t12_3;
        if ($[72] !== item.marketplace) {
            t12_3 = <ink_js_1.Text dimColor={true}> · {item.marketplace}</ink_js_1.Text>;
            $[72] = item.marketplace;
            $[73] = t12_3;
        }
        else {
            t12_3 = $[73];
        }
        var t13_3 = !isSelected;
        var t14 = void 0;
        if ($[74] !== statusIcon_1 || $[75] !== t13_3) {
            t14 = <ink_js_1.Text dimColor={t13_3}> · {statusIcon_1} </ink_js_1.Text>;
            $[74] = statusIcon_1;
            $[75] = t13_3;
            $[76] = t14;
        }
        else {
            t14 = $[76];
        }
        var t15 = !isSelected;
        var t16 = void 0;
        if ($[77] !== statusText_0 || $[78] !== t15) {
            t16 = <ink_js_1.Text dimColor={t15}>{statusText_0}</ink_js_1.Text>;
            $[77] = statusText_0;
            $[78] = t15;
            $[79] = t16;
        }
        else {
            t16 = $[79];
        }
        var t17 = void 0;
        if ($[80] !== t11_3 || $[81] !== t12_3 || $[82] !== t14 || $[83] !== t16 || $[84] !== t6_3 || $[85] !== t8_3) {
            t17 = <ink_js_1.Box>{t6_3}{t8_3}{t11_3}{t12_3}{t14}{t16}</ink_js_1.Box>;
            $[80] = t11_3;
            $[81] = t12_3;
            $[82] = t14;
            $[83] = t16;
            $[84] = t6_3;
            $[85] = t8_3;
            $[86] = t17;
        }
        else {
            t17 = $[86];
        }
        return t17;
    }
    var statusIcon_2;
    var statusText_1;
    if (item.status === "connected") {
        var t1_8;
        if ($[87] !== theme) {
            t1_8 = (0, ink_js_1.color)("success", theme)(figures_1.default.tick);
            $[87] = theme;
            $[88] = t1_8;
        }
        else {
            t1_8 = $[88];
        }
        statusIcon_2 = t1_8;
        statusText_1 = "connected";
    }
    else {
        if (item.status === "disabled") {
            var t1_9;
            if ($[89] !== theme) {
                t1_9 = (0, ink_js_1.color)("inactive", theme)(figures_1.default.radioOff);
                $[89] = theme;
                $[90] = t1_9;
            }
            else {
                t1_9 = $[90];
            }
            statusIcon_2 = t1_9;
            statusText_1 = "disabled";
        }
        else {
            if (item.status === "pending") {
                var t1_10;
                if ($[91] !== theme) {
                    t1_10 = (0, ink_js_1.color)("inactive", theme)(figures_1.default.radioOff);
                    $[91] = theme;
                    $[92] = t1_10;
                }
                else {
                    t1_10 = $[92];
                }
                statusIcon_2 = t1_10;
                statusText_1 = "connecting\u2026";
            }
            else {
                if (item.status === "needs-auth") {
                    var t1_11;
                    if ($[93] !== theme) {
                        t1_11 = (0, ink_js_1.color)("warning", theme)(figures_1.default.triangleUpOutline);
                        $[93] = theme;
                        $[94] = t1_11;
                    }
                    else {
                        t1_11 = $[94];
                    }
                    statusIcon_2 = t1_11;
                    statusText_1 = "Enter to auth";
                }
                else {
                    var t1_12;
                    if ($[95] !== theme) {
                        t1_12 = (0, ink_js_1.color)("error", theme)(figures_1.default.cross);
                        $[95] = theme;
                        $[96] = t1_12;
                    }
                    else {
                        t1_12 = $[96];
                    }
                    statusIcon_2 = t1_12;
                    statusText_1 = "failed";
                }
            }
        }
    }
    if (item.indented) {
        var t1_13 = isSelected ? "suggestion" : undefined;
        var t2_5 = isSelected ? "".concat(figures_1.default.pointer, " ") : "  ";
        var t3_5;
        if ($[97] !== t1_13 || $[98] !== t2_5) {
            t3_5 = <ink_js_1.Text color={t1_13}>{t2_5}</ink_js_1.Text>;
            $[97] = t1_13;
            $[98] = t2_5;
            $[99] = t3_5;
        }
        else {
            t3_5 = $[99];
        }
        var t4_4 = !isSelected;
        var t5_4;
        if ($[100] !== t4_4) {
            t5_4 = <ink_js_1.Text dimColor={t4_4}>└ </ink_js_1.Text>;
            $[100] = t4_4;
            $[101] = t5_4;
        }
        else {
            t5_4 = $[101];
        }
        var t6_4 = isSelected ? "suggestion" : undefined;
        var t7_4;
        if ($[102] !== item.name || $[103] !== t6_4) {
            t7_4 = <ink_js_1.Text color={t6_4}>{item.name}</ink_js_1.Text>;
            $[102] = item.name;
            $[103] = t6_4;
            $[104] = t7_4;
        }
        else {
            t7_4 = $[104];
        }
        var t8_4 = !isSelected;
        var t9_4;
        if ($[105] === Symbol.for("react.memo_cache_sentinel")) {
            t9_4 = <ink_js_1.Text backgroundColor="userMessageBackground">MCP</ink_js_1.Text>;
            $[105] = t9_4;
        }
        else {
            t9_4 = $[105];
        }
        var t10_4;
        if ($[106] !== t8_4) {
            t10_4 = <ink_js_1.Text dimColor={t8_4}>{" "}{t9_4}</ink_js_1.Text>;
            $[106] = t8_4;
            $[107] = t10_4;
        }
        else {
            t10_4 = $[107];
        }
        var t11_4 = !isSelected;
        var t12_4;
        if ($[108] !== statusIcon_2 || $[109] !== t11_4) {
            t12_4 = <ink_js_1.Text dimColor={t11_4}> · {statusIcon_2} </ink_js_1.Text>;
            $[108] = statusIcon_2;
            $[109] = t11_4;
            $[110] = t12_4;
        }
        else {
            t12_4 = $[110];
        }
        var t13_4 = !isSelected;
        var t14 = void 0;
        if ($[111] !== statusText_1 || $[112] !== t13_4) {
            t14 = <ink_js_1.Text dimColor={t13_4}>{statusText_1}</ink_js_1.Text>;
            $[111] = statusText_1;
            $[112] = t13_4;
            $[113] = t14;
        }
        else {
            t14 = $[113];
        }
        var t15 = void 0;
        if ($[114] !== t10_4 || $[115] !== t12_4 || $[116] !== t14 || $[117] !== t3_5 || $[118] !== t5_4 || $[119] !== t7_4) {
            t15 = <ink_js_1.Box>{t3_5}{t5_4}{t7_4}{t10_4}{t12_4}{t14}</ink_js_1.Box>;
            $[114] = t10_4;
            $[115] = t12_4;
            $[116] = t14;
            $[117] = t3_5;
            $[118] = t5_4;
            $[119] = t7_4;
            $[120] = t15;
        }
        else {
            t15 = $[120];
        }
        return t15;
    }
    var t1 = isSelected ? "suggestion" : undefined;
    var t2 = isSelected ? "".concat(figures_1.default.pointer, " ") : "  ";
    var t3;
    if ($[121] !== t1 || $[122] !== t2) {
        t3 = <ink_js_1.Text color={t1}>{t2}</ink_js_1.Text>;
        $[121] = t1;
        $[122] = t2;
        $[123] = t3;
    }
    else {
        t3 = $[123];
    }
    var t4 = isSelected ? "suggestion" : undefined;
    var t5;
    if ($[124] !== item.name || $[125] !== t4) {
        t5 = <ink_js_1.Text color={t4}>{item.name}</ink_js_1.Text>;
        $[124] = item.name;
        $[125] = t4;
        $[126] = t5;
    }
    else {
        t5 = $[126];
    }
    var t6 = !isSelected;
    var t7;
    if ($[127] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = <ink_js_1.Text backgroundColor="userMessageBackground">MCP</ink_js_1.Text>;
        $[127] = t7;
    }
    else {
        t7 = $[127];
    }
    var t8;
    if ($[128] !== t6) {
        t8 = <ink_js_1.Text dimColor={t6}>{" "}{t7}</ink_js_1.Text>;
        $[128] = t6;
        $[129] = t8;
    }
    else {
        t8 = $[129];
    }
    var t9 = !isSelected;
    var t10;
    if ($[130] !== statusIcon_2 || $[131] !== t9) {
        t10 = <ink_js_1.Text dimColor={t9}> · {statusIcon_2} </ink_js_1.Text>;
        $[130] = statusIcon_2;
        $[131] = t9;
        $[132] = t10;
    }
    else {
        t10 = $[132];
    }
    var t11 = !isSelected;
    var t12;
    if ($[133] !== statusText_1 || $[134] !== t11) {
        t12 = <ink_js_1.Text dimColor={t11}>{statusText_1}</ink_js_1.Text>;
        $[133] = statusText_1;
        $[134] = t11;
        $[135] = t12;
    }
    else {
        t12 = $[135];
    }
    var t13;
    if ($[136] !== t10 || $[137] !== t12 || $[138] !== t3 || $[139] !== t5 || $[140] !== t8) {
        t13 = <ink_js_1.Box>{t3}{t5}{t8}{t10}{t12}</ink_js_1.Box>;
        $[136] = t10;
        $[137] = t12;
        $[138] = t3;
        $[139] = t5;
        $[140] = t8;
        $[141] = t13;
    }
    else {
        t13 = $[141];
    }
    return t13;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJCb3giLCJjb2xvciIsIlRleHQiLCJ1c2VUaGVtZSIsInBsdXJhbCIsIlVuaWZpZWRJbnN0YWxsZWRJdGVtIiwiUHJvcHMiLCJpdGVtIiwiaXNTZWxlY3RlZCIsIlVuaWZpZWRJbnN0YWxsZWRDZWxsIiwidDAiLCIkIiwiX2MiLCJ0aGVtZSIsInR5cGUiLCJzdGF0dXNJY29uIiwic3RhdHVzVGV4dCIsInBlbmRpbmdUb2dnbGUiLCJ0MSIsImFycm93UmlnaHQiLCJlcnJvckNvdW50IiwiY3Jvc3MiLCJ0MiIsInQzIiwiaXNFbmFibGVkIiwicmFkaW9PZmYiLCJ0aWNrIiwidW5kZWZpbmVkIiwicG9pbnRlciIsInQ0IiwidDUiLCJuYW1lIiwidDYiLCJ0NyIsIlN5bWJvbCIsImZvciIsInQ4IiwidDkiLCJtYXJrZXRwbGFjZSIsInQxMCIsInQxMSIsInQxMiIsInQxMyIsInQxNCIsIndhcm5pbmciLCJzdGF0dXNJY29uXzAiLCJ0MTUiLCJzdGF0dXNJY29uXzEiLCJzdGF0dXNUZXh0XzAiLCJ0MTYiLCJ0MTciLCJzdGF0dXMiLCJ0cmlhbmdsZVVwT3V0bGluZSIsImluZGVudGVkIiwic3RhdHVzSWNvbl8yIiwic3RhdHVzVGV4dF8xIl0sInNvdXJjZXMiOlsiVW5pZmllZEluc3RhbGxlZENlbGwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmaWd1cmVzIGZyb20gJ2ZpZ3VyZXMnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgY29sb3IsIFRleHQsIHVzZVRoZW1lIH0gZnJvbSAnLi4vLi4vaW5rLmpzJ1xuaW1wb3J0IHsgcGx1cmFsIH0gZnJvbSAnLi4vLi4vdXRpbHMvc3RyaW5nVXRpbHMuanMnXG5pbXBvcnQgdHlwZSB7IFVuaWZpZWRJbnN0YWxsZWRJdGVtIH0gZnJvbSAnLi91bmlmaWVkVHlwZXMuanMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIGl0ZW06IFVuaWZpZWRJbnN0YWxsZWRJdGVtXG4gIGlzU2VsZWN0ZWQ6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVuaWZpZWRJbnN0YWxsZWRDZWxsKHtcbiAgaXRlbSxcbiAgaXNTZWxlY3RlZCxcbn06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW3RoZW1lXSA9IHVzZVRoZW1lKClcblxuICBpZiAoaXRlbS50eXBlID09PSAncGx1Z2luJykge1xuICAgIC8vIFN0YXR1cyBpY29uIGFuZCB0ZXh0XG4gICAgbGV0IHN0YXR1c0ljb246IHN0cmluZ1xuICAgIGxldCBzdGF0dXNUZXh0OiBzdHJpbmdcblxuICAgIC8vIFNob3cgcGVuZGluZyB0b2dnbGUgc3RhdHVzIGlmIHNldCwgb3RoZXJ3aXNlIHNob3cgY3VycmVudCBzdGF0dXNcbiAgICBpZiAoaXRlbS5wZW5kaW5nVG9nZ2xlKSB7XG4gICAgICBzdGF0dXNJY29uID0gY29sb3IoJ3N1Z2dlc3Rpb24nLCB0aGVtZSkoZmlndXJlcy5hcnJvd1JpZ2h0KVxuICAgICAgc3RhdHVzVGV4dCA9XG4gICAgICAgIGl0ZW0ucGVuZGluZ1RvZ2dsZSA9PT0gJ3dpbGwtZW5hYmxlJyA/ICd3aWxsIGVuYWJsZScgOiAnd2lsbCBkaXNhYmxlJ1xuICAgIH0gZWxzZSBpZiAoaXRlbS5lcnJvckNvdW50ID4gMCkge1xuICAgICAgc3RhdHVzSWNvbiA9IGNvbG9yKCdlcnJvcicsIHRoZW1lKShmaWd1cmVzLmNyb3NzKVxuICAgICAgc3RhdHVzVGV4dCA9IGAke2l0ZW0uZXJyb3JDb3VudH0gJHtwbHVyYWwoaXRlbS5lcnJvckNvdW50LCAnZXJyb3InKX1gXG4gICAgfSBlbHNlIGlmICghaXRlbS5pc0VuYWJsZWQpIHtcbiAgICAgIHN0YXR1c0ljb24gPSBjb2xvcignaW5hY3RpdmUnLCB0aGVtZSkoZmlndXJlcy5yYWRpb09mZilcbiAgICAgIHN0YXR1c1RleHQgPSAnZGlzYWJsZWQnXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1c0ljb24gPSBjb2xvcignc3VjY2VzcycsIHRoZW1lKShmaWd1cmVzLnRpY2spXG4gICAgICBzdGF0dXNUZXh0ID0gJ2VuYWJsZWQnXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3g+XG4gICAgICAgIDxUZXh0IGNvbG9yPXtpc1NlbGVjdGVkID8gJ3N1Z2dlc3Rpb24nIDogdW5kZWZpbmVkfT5cbiAgICAgICAgICB7aXNTZWxlY3RlZCA/IGAke2ZpZ3VyZXMucG9pbnRlcn0gYCA6ICcgICd9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICAgPFRleHQgY29sb3I9e2lzU2VsZWN0ZWQgPyAnc3VnZ2VzdGlvbicgOiB1bmRlZmluZWR9PntpdGVtLm5hbWV9PC9UZXh0PlxuICAgICAgICA8VGV4dCBkaW1Db2xvcj17IWlzU2VsZWN0ZWR9PlxuICAgICAgICAgIHsnICd9XG4gICAgICAgICAgPFRleHQgYmFja2dyb3VuZENvbG9yPVwidXNlck1lc3NhZ2VCYWNrZ3JvdW5kXCI+UGx1Z2luPC9UZXh0PlxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPiDCtyB7aXRlbS5tYXJrZXRwbGFjZX08L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+IMK3IHtzdGF0dXNJY29ufSA8L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+e3N0YXR1c1RleHR9PC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgKVxuICB9XG5cbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ2ZsYWdnZWQtcGx1Z2luJykge1xuICAgIGNvbnN0IHN0YXR1c0ljb24gPSBjb2xvcignd2FybmluZycsIHRoZW1lKShmaWd1cmVzLndhcm5pbmcpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEJveD5cbiAgICAgICAgPFRleHQgY29sb3I9e2lzU2VsZWN0ZWQgPyAnc3VnZ2VzdGlvbicgOiB1bmRlZmluZWR9PlxuICAgICAgICAgIHtpc1NlbGVjdGVkID8gYCR7ZmlndXJlcy5wb2ludGVyfSBgIDogJyAgJ31cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8VGV4dCBjb2xvcj17aXNTZWxlY3RlZCA/ICdzdWdnZXN0aW9uJyA6IHVuZGVmaW5lZH0+e2l0ZW0ubmFtZX08L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+XG4gICAgICAgICAgeycgJ31cbiAgICAgICAgICA8VGV4dCBiYWNrZ3JvdW5kQ29sb3I9XCJ1c2VyTWVzc2FnZUJhY2tncm91bmRcIj5QbHVnaW48L1RleHQ+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I+IMK3IHtpdGVtLm1hcmtldHBsYWNlfTwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I9eyFpc1NlbGVjdGVkfT4gwrcge3N0YXR1c0ljb259IDwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I9eyFpc1NlbGVjdGVkfT5yZW1vdmVkPC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgKVxuICB9XG5cbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ2ZhaWxlZC1wbHVnaW4nKSB7XG4gICAgY29uc3Qgc3RhdHVzSWNvbiA9IGNvbG9yKCdlcnJvcicsIHRoZW1lKShmaWd1cmVzLmNyb3NzKVxuICAgIGNvbnN0IHN0YXR1c1RleHQgPSBgZmFpbGVkIHRvIGxvYWQgwrcgJHtpdGVtLmVycm9yQ291bnR9ICR7cGx1cmFsKGl0ZW0uZXJyb3JDb3VudCwgJ2Vycm9yJyl9YFxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3g+XG4gICAgICAgIDxUZXh0IGNvbG9yPXtpc1NlbGVjdGVkID8gJ3N1Z2dlc3Rpb24nIDogdW5kZWZpbmVkfT5cbiAgICAgICAgICB7aXNTZWxlY3RlZCA/IGAke2ZpZ3VyZXMucG9pbnRlcn0gYCA6ICcgICd9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICAgPFRleHQgY29sb3I9e2lzU2VsZWN0ZWQgPyAnc3VnZ2VzdGlvbicgOiB1bmRlZmluZWR9PntpdGVtLm5hbWV9PC9UZXh0PlxuICAgICAgICA8VGV4dCBkaW1Db2xvcj17IWlzU2VsZWN0ZWR9PlxuICAgICAgICAgIHsnICd9XG4gICAgICAgICAgPFRleHQgYmFja2dyb3VuZENvbG9yPVwidXNlck1lc3NhZ2VCYWNrZ3JvdW5kXCI+UGx1Z2luPC9UZXh0PlxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPiDCtyB7aXRlbS5tYXJrZXRwbGFjZX08L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+IMK3IHtzdGF0dXNJY29ufSA8L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+e3N0YXR1c1RleHR9PC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgKVxuICB9XG5cbiAgLy8gTUNQIHNlcnZlclxuICBsZXQgc3RhdHVzSWNvbjogc3RyaW5nXG4gIGxldCBzdGF0dXNUZXh0OiBzdHJpbmdcblxuICBpZiAoaXRlbS5zdGF0dXMgPT09ICdjb25uZWN0ZWQnKSB7XG4gICAgc3RhdHVzSWNvbiA9IGNvbG9yKCdzdWNjZXNzJywgdGhlbWUpKGZpZ3VyZXMudGljaylcbiAgICBzdGF0dXNUZXh0ID0gJ2Nvbm5lY3RlZCdcbiAgfSBlbHNlIGlmIChpdGVtLnN0YXR1cyA9PT0gJ2Rpc2FibGVkJykge1xuICAgIHN0YXR1c0ljb24gPSBjb2xvcignaW5hY3RpdmUnLCB0aGVtZSkoZmlndXJlcy5yYWRpb09mZilcbiAgICBzdGF0dXNUZXh0ID0gJ2Rpc2FibGVkJ1xuICB9IGVsc2UgaWYgKGl0ZW0uc3RhdHVzID09PSAncGVuZGluZycpIHtcbiAgICBzdGF0dXNJY29uID0gY29sb3IoJ2luYWN0aXZlJywgdGhlbWUpKGZpZ3VyZXMucmFkaW9PZmYpXG4gICAgc3RhdHVzVGV4dCA9ICdjb25uZWN0aW5n4oCmJ1xuICB9IGVsc2UgaWYgKGl0ZW0uc3RhdHVzID09PSAnbmVlZHMtYXV0aCcpIHtcbiAgICBzdGF0dXNJY29uID0gY29sb3IoJ3dhcm5pbmcnLCB0aGVtZSkoZmlndXJlcy50cmlhbmdsZVVwT3V0bGluZSlcbiAgICBzdGF0dXNUZXh0ID0gJ0VudGVyIHRvIGF1dGgnXG4gIH0gZWxzZSB7XG4gICAgc3RhdHVzSWNvbiA9IGNvbG9yKCdlcnJvcicsIHRoZW1lKShmaWd1cmVzLmNyb3NzKVxuICAgIHN0YXR1c1RleHQgPSAnZmFpbGVkJ1xuICB9XG5cbiAgLy8gSW5kZW50ZWQgTUNQcyAoY2hpbGQgb2YgYSBwbHVnaW4pXG4gIGlmIChpdGVtLmluZGVudGVkKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3g+XG4gICAgICAgIDxUZXh0IGNvbG9yPXtpc1NlbGVjdGVkID8gJ3N1Z2dlc3Rpb24nIDogdW5kZWZpbmVkfT5cbiAgICAgICAgICB7aXNTZWxlY3RlZCA/IGAke2ZpZ3VyZXMucG9pbnRlcn0gYCA6ICcgICd9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I9eyFpc1NlbGVjdGVkfT7ilJQgPC9UZXh0PlxuICAgICAgICA8VGV4dCBjb2xvcj17aXNTZWxlY3RlZCA/ICdzdWdnZXN0aW9uJyA6IHVuZGVmaW5lZH0+e2l0ZW0ubmFtZX08L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+XG4gICAgICAgICAgeycgJ31cbiAgICAgICAgICA8VGV4dCBiYWNrZ3JvdW5kQ29sb3I9XCJ1c2VyTWVzc2FnZUJhY2tncm91bmRcIj5NQ1A8L1RleHQ+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I9eyFpc1NlbGVjdGVkfT4gwrcge3N0YXR1c0ljb259IDwvVGV4dD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I9eyFpc1NlbGVjdGVkfT57c3RhdHVzVGV4dH08L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICApXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3g+XG4gICAgICA8VGV4dCBjb2xvcj17aXNTZWxlY3RlZCA/ICdzdWdnZXN0aW9uJyA6IHVuZGVmaW5lZH0+XG4gICAgICAgIHtpc1NlbGVjdGVkID8gYCR7ZmlndXJlcy5wb2ludGVyfSBgIDogJyAgJ31cbiAgICAgIDwvVGV4dD5cbiAgICAgIDxUZXh0IGNvbG9yPXtpc1NlbGVjdGVkID8gJ3N1Z2dlc3Rpb24nIDogdW5kZWZpbmVkfT57aXRlbS5uYW1lfTwvVGV4dD5cbiAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+XG4gICAgICAgIHsnICd9XG4gICAgICAgIDxUZXh0IGJhY2tncm91bmRDb2xvcj1cInVzZXJNZXNzYWdlQmFja2dyb3VuZFwiPk1DUDwvVGV4dD5cbiAgICAgIDwvVGV4dD5cbiAgICAgIDxUZXh0IGRpbUNvbG9yPXshaXNTZWxlY3RlZH0+IMK3IHtzdGF0dXNJY29ufSA8L1RleHQ+XG4gICAgICA8VGV4dCBkaW1Db2xvcj17IWlzU2VsZWN0ZWR9PntzdGF0dXNUZXh0fTwvVGV4dD5cbiAgICA8L0JveD5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsT0FBTyxNQUFNLFNBQVM7QUFDN0IsT0FBTyxLQUFLQyxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxHQUFHLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxRQUFRLFFBQVEsY0FBYztBQUN6RCxTQUFTQyxNQUFNLFFBQVEsNEJBQTRCO0FBQ25ELGNBQWNDLG9CQUFvQixRQUFRLG1CQUFtQjtBQUU3RCxLQUFLQyxLQUFLLEdBQUc7RUFDWEMsSUFBSSxFQUFFRixvQkFBb0I7RUFDMUJHLFVBQVUsRUFBRSxPQUFPO0FBQ3JCLENBQUM7QUFFRCxPQUFPLFNBQUFDLHFCQUFBQyxFQUFBO0VBQUEsTUFBQUMsQ0FBQSxHQUFBQyxFQUFBO0VBQThCO0lBQUFMLElBQUE7SUFBQUM7RUFBQSxJQUFBRSxFQUc3QjtFQUNOLE9BQUFHLEtBQUEsSUFBZ0JWLFFBQVEsQ0FBQyxDQUFDO0VBRTFCLElBQUlJLElBQUksQ0FBQU8sSUFBSyxLQUFLLFFBQVE7SUFFcEJDLEdBQUEsQ0FBQUEsVUFBQTtJQUNBQyxHQUFBLENBQUFBLFVBQUE7SUFH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LEVBQUEsR0FBQXpCLENBQUE7RUFBQTtFQUNTLE1BQUEwQixFQUFBLElBQUM3QixVQUFVO0VBQUEsSUFBQStCLEdBQUE7RUFBQSxJQUFBNUIsQ0FBQSxVQUFBMkMsWUFBQSxJQUFBM0MsQ0FBQSxVQUFBMEIsRUFBQTtJQUEzQkUsR0FBQSxJQUFDLElBQUksQ0FBVyxRQUFXLENBQVgsQ0FBQUYsRUFBVSxDQUFDLENBQUUsR0FBSXRCLGFBQVMsQ0FBRSxDQUFDLEVBQTVDLElBQUksQ0FBK0M7SUFBQUosQ0FBQSxRQUFBMkMsWUFBQTtJQUFBM0MsQ0FBQSxRQUFBMEIsRUFBQTtJQUFBMUIsQ0FBQSxRQUFBNEIsR0FBQTtFQUFBO0lBQUFBLEdBQUEsR0FBQTVCLENBQUE7RUFBQTtFQUNwQyxNQUFBNkIsR0FBQSxJQUFDaEMsVUFBVTtFQUFBLElBQUFpQyxHQUFBO0VBQUEsSUFBQTlCLENBQUEsVUFBQTRDLFlBQUEsSUFBQTVDLENBQUEsVUFBQTZCLEdBQUE7SUFBM0JDLEdBQUEsSUFBQyxJQUFJLENBQVcsUUFBVyxDQUFYLENBQUFELEdBQVUsQ0FBQyxDQUFHeEIsYUFBUyxDQUFFLEVBQXhDLElBQUksQ0FBMkM7SUFBQUwsQ0FBQSxRQUFBNEMsWUFBQTtJQUFBNUMsQ0FBQSxRQUFBNkIsR0FBQTtJQUFBN0IsQ0FBQSxRQUFBOEIsR0FBQTtFQUFBO0lBQUFBLEdBQUEsR0FBQTlCLENBQUE7RUFBQTtFQUFBLElBQUErQixHQUFBO0VBQUEsSUFBQS9CLENBQUEsVUFBQTRCLEdBQUEsSUFBQTVCLENBQUEsVUFBQThCLEdBQUEsSUFBQTlCLENBQUEsVUFBQVksRUFBQSxJQUFBWixDQUFBLFVBQUFtQixFQUFBLElBQUFuQixDQUFBLFVBQUF5QixFQUFBO0lBVmxETSxHQUFBLElBQUMsR0FBRyxDQUNGLENBQUFuQixFQUVNLENBQ04sQ0FBQU8sRUFBcUUsQ0FDckUsQ0FBQU0sRUFHTSxDQUNOLENBQUFHLEdBQW1ELENBQ25ELENBQUFFLEdBQStDLENBQ2pELEVBWEMsR0FBRyxDQVdFO0lBQUE5QixDQUFBLFFBQUE0QixHQUFBO0lBQUE1QixDQUFBLFFBQUE4QixHQUFBO0lBQUE5QixDQUFBLFFBQUFZLEVBQUE7SUFBQVosQ0FBQSxRQUFBbUIsRUFBQTtJQUFBbkIsQ0FBQSxRQUFBeUIsRUFBQTtJQUFBekIsQ0FBQSxRQUFBK0IsR0FBQTtFQUFBO0lBQUFBLEdBQUEsR0FBQS9CLENBQUE7RUFBQTtFQUFBLE9BWE4rQixHQVdNO0FBQUEiLCJpZ25vcmVMaXN0IjpbXX0=
