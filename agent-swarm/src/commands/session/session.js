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
exports.call = void 0;
var compiler_runtime_1 = require("react/compiler-runtime");
var qrcode_1 = require("qrcode");
var React = require("react");
var react_1 = require("react");
var Pane_js_1 = require("../../components/design-system/Pane.js");
var ink_js_1 = require("../../ink.js");
var useKeybinding_js_1 = require("../../keybindings/useKeybinding.js");
var AppState_js_1 = require("../../state/AppState.js");
var debug_js_1 = require("../../utils/debug.js");
function SessionInfo(t0) {
    var $ = (0, compiler_runtime_1.c)(19);
    var onDone = t0.onDone;
    var remoteSessionUrl = (0, AppState_js_1.useAppState)(_temp);
    var _a = (0, react_1.useState)(""), qrCode = _a[0], setQrCode = _a[1];
    var t1;
    var t2;
    if ($[0] !== remoteSessionUrl) {
        t1 = function () {
            if (!remoteSessionUrl) {
                return;
            }
            var url = remoteSessionUrl;
            var generateQRCode = function generateQRCode() {
                return __awaiter(this, void 0, void 0, function () {
                    var qr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, qrcode_1.toString)(url, {
                                    type: "utf8",
                                    errorCorrectionLevel: "L"
                                })];
                            case 1:
                                qr = _a.sent();
                                setQrCode(qr);
                                return [2 /*return*/];
                        }
                    });
                });
            };
            generateQRCode().catch(_temp2);
        };
        t2 = [remoteSessionUrl];
        $[0] = remoteSessionUrl;
        $[1] = t1;
        $[2] = t2;
    }
    else {
        t1 = $[1];
        t2 = $[2];
    }
    (0, react_1.useEffect)(t1, t2);
    var t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = {
            context: "Confirmation"
        };
        $[3] = t3;
    }
    else {
        t3 = $[3];
    }
    (0, useKeybinding_js_1.useKeybinding)("confirm:no", onDone, t3);
    if (!remoteSessionUrl) {
        var t4_1;
        if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
            t4_1 = <Pane_js_1.Pane><ink_js_1.Text color="warning">Not in remote mode. Start with `claude --remote` to use this command.</ink_js_1.Text><ink_js_1.Text dimColor={true}>(press esc to close)</ink_js_1.Text></Pane_js_1.Pane>;
            $[4] = t4_1;
        }
        else {
            t4_1 = $[4];
        }
        return t4_1;
    }
    var T0;
    var t4;
    var t5;
    if ($[5] !== qrCode) {
        var lines = qrCode.split("\n").filter(_temp3);
        var isLoading = lines.length === 0;
        T0 = Pane_js_1.Pane;
        if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = <ink_js_1.Box marginBottom={1}><ink_js_1.Text bold={true}>Remote session</ink_js_1.Text></ink_js_1.Box>;
            $[9] = t4;
        }
        else {
            t4 = $[9];
        }
        t5 = isLoading ? <ink_js_1.Text dimColor={true}>Generating QR code…</ink_js_1.Text> : lines.map(_temp4);
        $[5] = qrCode;
        $[6] = T0;
        $[7] = t4;
        $[8] = t5;
    }
    else {
        T0 = $[6];
        t4 = $[7];
        t5 = $[8];
    }
    var t6;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = <ink_js_1.Text dimColor={true}>Open in browser: </ink_js_1.Text>;
        $[10] = t6;
    }
    else {
        t6 = $[10];
    }
    var t7;
    if ($[11] !== remoteSessionUrl) {
        t7 = <ink_js_1.Box marginTop={1}>{t6}<ink_js_1.Text color="ide">{remoteSessionUrl}</ink_js_1.Text></ink_js_1.Box>;
        $[11] = remoteSessionUrl;
        $[12] = t7;
    }
    else {
        t7 = $[12];
    }
    var t8;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = <ink_js_1.Box marginTop={1}><ink_js_1.Text dimColor={true}>(press esc to close)</ink_js_1.Text></ink_js_1.Box>;
        $[13] = t8;
    }
    else {
        t8 = $[13];
    }
    var t9;
    if ($[14] !== T0 || $[15] !== t4 || $[16] !== t5 || $[17] !== t7) {
        t9 = <T0>{t4}{t5}{t7}{t8}</T0>;
        $[14] = T0;
        $[15] = t4;
        $[16] = t5;
        $[17] = t7;
        $[18] = t9;
    }
    else {
        t9 = $[18];
    }
    return t9;
}
function _temp4(line_0, i) {
    return <ink_js_1.Text key={i}>{line_0}</ink_js_1.Text>;
}
function _temp3(line) {
    return line.length > 0;
}
function _temp2(e) {
    (0, debug_js_1.logForDebugging)("QR code generation failed", e);
}
function _temp(s) {
    return s.remoteSessionUrl;
}
var call = function (onDone) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, <SessionInfo onDone={onDone}/>];
    });
}); };
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b1N0cmluZyIsInFyVG9TdHJpbmciLCJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiUGFuZSIsIkJveCIsIlRleHQiLCJ1c2VLZXliaW5kaW5nIiwidXNlQXBwU3RhdGUiLCJMb2NhbEpTWENvbW1hbmRDYWxsIiwibG9nRm9yRGVidWdnaW5nIiwiUHJvcHMiLCJvbkRvbmUiLCJTZXNzaW9uSW5mbyIsInQwIiwiJCIsIl9jIiwicmVtb3RlU2Vzc2lvblVybCIsIl90ZW1wIiwicXJDb2RlIiwic2V0UXJDb2RlIiwidDEiLCJ0MiIsInVybCIsImdlbmVyYXRlUVJDb2RlIiwicXIiLCJ0eXBlIiwiZXJyb3JDb3JyZWN0aW9uTGV2ZWwiLCJjYXRjaCIsIl90ZW1wMiIsInQzIiwiU3ltYm9sIiwiZm9yIiwiY29udGV4dCIsInQ0IiwiVDAiLCJ0NSIsImxpbmVzIiwic3BsaXQiLCJmaWx0ZXIiLCJfdGVtcDMiLCJpc0xvYWRpbmciLCJsZW5ndGgiLCJtYXAiLCJfdGVtcDQiLCJ0NiIsInQ3IiwidDgiLCJ0OSIsImxpbmVfMCIsImkiLCJsaW5lIiwiZSIsInMiLCJjYWxsIl0sInNvdXJjZXMiOlsic2Vzc2lvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9TdHJpbmcgYXMgcXJUb1N0cmluZyB9IGZyb20gJ3FyY29kZSdcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgUGFuZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZGVzaWduLXN5c3RlbS9QYW5lLmpzJ1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnLi4vLi4vaW5rLmpzJ1xuaW1wb3J0IHsgdXNlS2V5YmluZGluZyB9IGZyb20gJy4uLy4uL2tleWJpbmRpbmdzL3VzZUtleWJpbmRpbmcuanMnXG5pbXBvcnQgeyB1c2VBcHBTdGF0ZSB9IGZyb20gJy4uLy4uL3N0YXRlL0FwcFN0YXRlLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDYWxsIH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcbmltcG9ydCB7IGxvZ0ZvckRlYnVnZ2luZyB9IGZyb20gJy4uLy4uL3V0aWxzL2RlYnVnLmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBvbkRvbmU6ICgpID0+IHZvaWRcbn1cblxuZnVuY3Rpb24gU2Vzc2lvbkluZm8oeyBvbkRvbmUgfTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCByZW1vdGVTZXNzaW9uVXJsID0gdXNlQXBwU3RhdGUocyA9PiBzLnJlbW90ZVNlc3Npb25VcmwpXG4gIGNvbnN0IFtxckNvZGUsIHNldFFyQ29kZV0gPSB1c2VTdGF0ZTxzdHJpbmc+KCcnKVxuXG4gIC8vIEdlbmVyYXRlIFFSIGNvZGUgd2hlbiBVUkwgaXMgYXZhaWxhYmxlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZW1vdGVTZXNzaW9uVXJsKSByZXR1cm5cblxuICAgIGNvbnN0IHVybCA9IHJlbW90ZVNlc3Npb25VcmxcbiAgICBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVFSQ29kZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIGNvbnN0IHFyID0gYXdhaXQgcXJUb1N0cmluZyh1cmwsIHtcbiAgICAgICAgdHlwZTogJ3V0ZjgnLFxuICAgICAgICBlcnJvckNvcnJlY3Rpb25MZXZlbDogJ0wnLFxuICAgICAgfSlcbiAgICAgIHNldFFyQ29kZShxcilcbiAgICB9XG4gICAgLy8gSW50ZW50aW9uYWxseSBzaWxlbnQgZmFpbCAtIFVSTCBpcyBzdGlsbCBzaG93biBzbyBRUiBpcyBub24tY3JpdGljYWxcbiAgICBnZW5lcmF0ZVFSQ29kZSgpLmNhdGNoKGUgPT4ge1xuICAgICAgbG9nRm9yRGVidWdnaW5nKCdRUiBjb2RlIGdlbmVyYXRpb24gZmFpbGVkJywgZSlcbiAgICB9KVxuICB9LCBbcmVtb3RlU2Vzc2lvblVybF0pXG5cbiAgLy8gSGFuZGxlIEVTQyB0byBkaXNtaXNzXG4gIHVzZUtleWJpbmRpbmcoJ2NvbmZpcm06bm8nLCBvbkRvbmUsIHsgY29udGV4dDogJ0NvbmZpcm1hdGlvbicgfSlcblxuICAvLyBOb3QgaW4gcmVtb3RlIG1vZGVcbiAgaWYgKCFyZW1vdGVTZXNzaW9uVXJsKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lPlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5cbiAgICAgICAgICBOb3QgaW4gcmVtb3RlIG1vZGUuIFN0YXJ0IHdpdGggYGNsYXVkZSAtLXJlbW90ZWAgdG8gdXNlIHRoaXMgY29tbWFuZC5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8VGV4dCBkaW1Db2xvcj4ocHJlc3MgZXNjIHRvIGNsb3NlKTwvVGV4dD5cbiAgICAgIDwvUGFuZT5cbiAgICApXG4gIH1cblxuICBjb25zdCBsaW5lcyA9IHFyQ29kZS5zcGxpdCgnXFxuJykuZmlsdGVyKGxpbmUgPT4gbGluZS5sZW5ndGggPiAwKVxuICBjb25zdCBpc0xvYWRpbmcgPSBsaW5lcy5sZW5ndGggPT09IDBcblxuICByZXR1cm4gKFxuICAgIDxQYW5lPlxuICAgICAgPEJveCBtYXJnaW5Cb3R0b209ezF9PlxuICAgICAgICA8VGV4dCBib2xkPlJlbW90ZSBzZXNzaW9uPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIHsvKiBRUiBDb2RlIC0gc2lsZW50bHkgZmFpbHMgaWYgZ2VuZXJhdGlvbiBlcnJvcnMsIFVSTCBpcyBzdGlsbCBzaG93biAqL31cbiAgICAgIHtpc0xvYWRpbmcgPyAoXG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPkdlbmVyYXRpbmcgUVIgY29kZeKApjwvVGV4dD5cbiAgICAgICkgOiAoXG4gICAgICAgIGxpbmVzLm1hcCgobGluZSwgaSkgPT4gPFRleHQga2V5PXtpfT57bGluZX08L1RleHQ+KVxuICAgICAgKX1cblxuICAgICAgey8qIFVSTCAqL31cbiAgICAgIDxCb3ggbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgPFRleHQgZGltQ29sb3I+T3BlbiBpbiBicm93c2VyOiA8L1RleHQ+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwiaWRlXCI+e3JlbW90ZVNlc3Npb25Vcmx9PC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgPFRleHQgZGltQ29sb3I+KHByZXNzIGVzYyB0byBjbG9zZSk8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L1BhbmU+XG4gIClcbn1cblxuZXhwb3J0IGNvbnN0IGNhbGw6IExvY2FsSlNYQ29tbWFuZENhbGwgPSBhc3luYyBvbkRvbmUgPT4ge1xuICByZXR1cm4gPFNlc3Npb25JbmZvIG9uRG9uZT17b25Eb25lfSAvPlxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsU0FBU0EsUUFBUSxJQUFJQyxVQUFVLFFBQVEsUUFBUTtBQUMvQyxPQUFPLEtBQUtDLEtBQUssTUFBTSxPQUFPO0FBQzlCLFNBQVNDLFNBQVMsRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDM0MsU0FBU0MsSUFBSSxRQUFRLHdDQUF3QztBQUM3RCxTQUFTQyxHQUFHLEVBQUVDLElBQUksUUFBUSxjQUFjO0FBQ3hDLFNBQVNDLGFBQWEsUUFBUSxvQ0FBb0M7QUFDbEUsU0FBU0MsV0FBVyxRQUFRLHlCQUF5QjtBQUNyRCxjQUFjQyxtQkFBbUIsUUFBUSx3QkFBd0I7QUFDakUsU0FBU0MsZUFBZSxRQUFRLHNCQUFzQjtBQUV0RCxLQUFLQyxLQUFLLEdBQUc7RUFDWEMsTUFBTSxFQUFFLEdBQUcsR0FBRyxJQUFJO0FBQ3BCLENBQUM7QUFFRCxTQUFBQyxZQUFBQyxFQUFBO0VBQUEsTUFBQUMsQ0FBQSxHQUFBQyxFQUFBO0VBQXFCO0lBQUFKO0VBQUEsSUFBQUUsRUFBaUI7RUFDcEMsTUFBQUcsZ0JBQUEsR0FBeUJULFdBQVcsQ0FBQ1UsS0FBdUIsQ0FBQztFQUM3RCxPQUFBQyxNQUFBLEVBQUFDLFNBQUEsSUFBNEJqQixRQUFRLENBQVMsRUFBRSxDQUFDO0VBQUEsSUFB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
