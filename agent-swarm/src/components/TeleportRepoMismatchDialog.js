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
exports.TeleportRepoMismatchDialog = TeleportRepoMismatchDialog;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var file_js_1 = require("../utils/file.js");
var githubRepoPathMapping_js_1 = require("../utils/githubRepoPathMapping.js");
var index_js_1 = require("./CustomSelect/index.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
var Spinner_js_1 = require("./Spinner.js");
function TeleportRepoMismatchDialog(t0) {
    var _this = this;
    var $ = (0, compiler_runtime_1.c)(18);
    var targetRepo = t0.targetRepo, initialPaths = t0.initialPaths, onSelectPath = t0.onSelectPath, onCancel = t0.onCancel;
    var _a = (0, react_1.useState)(initialPaths), availablePaths = _a[0], setAvailablePaths = _a[1];
    var _b = (0, react_1.useState)(null), errorMessage = _b[0], setErrorMessage = _b[1];
    var _d = (0, react_1.useState)(false), validating = _d[0], setValidating = _d[1];
    var t1;
    if ($[0] !== availablePaths || $[1] !== onCancel || $[2] !== onSelectPath || $[3] !== targetRepo) {
        t1 = function (value) { return __awaiter(_this, void 0, void 0, function () {
            var isValid, updatedPaths;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (value === "cancel") {
                            onCancel();
                            return [2 /*return*/];
                        }
                        setValidating(true);
                        setErrorMessage(null);
                        return [4 /*yield*/, (0, githubRepoPathMapping_js_1.validateRepoAtPath)(value, targetRepo)];
                    case 1:
                        isValid = _a.sent();
                        if (isValid) {
                            onSelectPath(value);
                            return [2 /*return*/];
                        }
                        (0, githubRepoPathMapping_js_1.removePathFromRepo)(targetRepo, value);
                        updatedPaths = availablePaths.filter(function (p) { return p !== value; });
                        setAvailablePaths(updatedPaths);
                        setValidating(false);
                        setErrorMessage("".concat((0, file_js_1.getDisplayPath)(value), " no longer contains the correct repository. Select another path."));
                        return [2 /*return*/];
                }
            });
        }); };
        $[0] = availablePaths;
        $[1] = onCancel;
        $[2] = onSelectPath;
        $[3] = targetRepo;
        $[4] = t1;
    }
    else {
        t1 = $[4];
    }
    var handleChange = t1;
    var t2;
    if ($[5] !== availablePaths) {
        var t3_1;
        if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
            t3_1 = {
                label: "Cancel",
                value: "cancel"
            };
            $[7] = t3_1;
        }
        else {
            t3_1 = $[7];
        }
        t2 = __spreadArray(__spreadArray([], availablePaths.map(_temp), true), [t3_1], false);
        $[5] = availablePaths;
        $[6] = t2;
    }
    else {
        t2 = $[6];
    }
    var options = t2;
    var t3;
    if ($[8] !== availablePaths.length || $[9] !== errorMessage || $[10] !== handleChange || $[11] !== options || $[12] !== targetRepo || $[13] !== validating) {
        t3 = availablePaths.length > 0 ? <><ink_js_1.Box flexDirection="column" gap={1}>{errorMessage && <ink_js_1.Text color="error">{errorMessage}</ink_js_1.Text>}<ink_js_1.Text>Open Claude Code in <ink_js_1.Text bold={true}>{targetRepo}</ink_js_1.Text>:</ink_js_1.Text></ink_js_1.Box>{validating ? <ink_js_1.Box><Spinner_js_1.Spinner /><ink_js_1.Text> Validating repository…</ink_js_1.Text></ink_js_1.Box> : <index_js_1.Select options={options} onChange={function (value_0) { return void handleChange(value_0); }}/>}</> : <ink_js_1.Box flexDirection="column" gap={1}>{errorMessage && <ink_js_1.Text color="error">{errorMessage}</ink_js_1.Text>}<ink_js_1.Text dimColor={true}>Run claude --teleport from a checkout of {targetRepo}</ink_js_1.Text></ink_js_1.Box>;
        $[8] = availablePaths.length;
        $[9] = errorMessage;
        $[10] = handleChange;
        $[11] = options;
        $[12] = targetRepo;
        $[13] = validating;
        $[14] = t3;
    }
    else {
        t3 = $[14];
    }
    var t4;
    if ($[15] !== onCancel || $[16] !== t3) {
        t4 = <Dialog_js_1.Dialog title="Teleport to Repo" onCancel={onCancel} color="background">{t3}</Dialog_js_1.Dialog>;
        $[15] = onCancel;
        $[16] = t3;
        $[17] = t4;
    }
    else {
        t4 = $[17];
    }
    return t4;
}
function _temp(path) {
    return {
        label: <ink_js_1.Text>Use <ink_js_1.Text bold={true}>{(0, file_js_1.getDisplayPath)(path)}</ink_js_1.Text></ink_js_1.Text>,
        value: path
    };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUNhbGxiYWNrIiwidXNlU3RhdGUiLCJCb3giLCJUZXh0IiwiZ2V0RGlzcGxheVBhdGgiLCJyZW1vdmVQYXRoRnJvbVJlcG8iLCJ2YWxpZGF0ZVJlcG9BdFBhdGgiLCJTZWxlY3QiLCJEaWFsb2ciLCJTcGlubmVyIiwiUHJvcHMiLCJ0YXJnZXRSZXBvIiwiaW5pdGlhbFBhdGhzIiwib25TZWxlY3RQYXRoIiwicGF0aCIsIm9uQ2FuY2VsIiwiVGVsZXBvcnRSZXBvTWlzbWF0Y2hEaWFsb2ciLCJ0MCIsIiQiLCJfYyIsImF2YWlsYWJsZVBhdGhzIiwic2V0QXZhaWxhYmxlUGF0aHMiLCJlcnJvck1lc3NhZ2UiLCJzZXRFcnJvck1lc3NhZ2UiLCJ2YWxpZGF0aW5nIiwic2V0VmFsaWRhdGluZyIsInQxIiwidmFsdWUiLCJpc1ZhbGlkIiwidXBkYXRlZFBhdGhzIiwiZmlsdGVyIiwicCIsImhhbmRsZUNoYW5nZSIsInQyIiwidDMiLCJTeW1ib2wiLCJmb3IiLCJsYWJlbCIsIm1hcCIsIl90ZW1wIiwib3B0aW9ucyIsImxlbmd0aCIsInZhbHVlXzAiLCJ0NCJdLCJzb3VyY2VzIjpbIlRlbGVwb3J0UmVwb01pc21hdGNoRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICcuLi9pbmsuanMnXG5pbXBvcnQgeyBnZXREaXNwbGF5UGF0aCB9IGZyb20gJy4uL3V0aWxzL2ZpbGUuanMnXG5pbXBvcnQge1xuICByZW1vdmVQYXRoRnJvbVJlcG8sXG4gIHZhbGlkYXRlUmVwb0F0UGF0aCxcbn0gZnJvbSAnLi4vdXRpbHMvZ2l0aHViUmVwb1BhdGhNYXBwaW5nLmpzJ1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi9DdXN0b21TZWxlY3QvaW5kZXguanMnXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4vU3Bpbm5lci5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgdGFyZ2V0UmVwbzogc3RyaW5nXG4gIGluaXRpYWxQYXRoczogc3RyaW5nW11cbiAgb25TZWxlY3RQYXRoOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZWxlcG9ydFJlcG9NaXNtYXRjaERpYWxvZyh7XG4gIHRhcmdldFJlcG8sXG4gIGluaXRpYWxQYXRocyxcbiAgb25TZWxlY3RQYXRoLFxuICBvbkNhbmNlbCxcbn06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW2F2YWlsYWJsZVBhdGhzLCBzZXRBdmFpbGFibGVQYXRoc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oaW5pdGlhbFBhdGhzKVxuICBjb25zdCBbZXJyb3JNZXNzYWdlLCBzZXRFcnJvck1lc3NhZ2VdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3ZhbGlkYXRpbmcsIHNldFZhbGlkYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3QgaGFuZGxlQ2hhbmdlID0gdXNlQ2FsbGJhY2soXG4gICAgYXN5bmMgKHZhbHVlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gJ2NhbmNlbCcpIHtcbiAgICAgICAgb25DYW5jZWwoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgc2V0VmFsaWRhdGluZyh0cnVlKVxuICAgICAgc2V0RXJyb3JNZXNzYWdlKG51bGwpXG5cbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCB2YWxpZGF0ZVJlcG9BdFBhdGgodmFsdWUsIHRhcmdldFJlcG8pXG5cbiAgICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAgIG9uU2VsZWN0UGF0aCh2YWx1ZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIFBhdGggaXMgaW52YWxpZCAtIHJlbW92ZSBpdCBmcm9tIGNvbmZpZyBhbmQgdXBkYXRlIHN0YXRlXG4gICAgICByZW1vdmVQYXRoRnJvbVJlcG8odGFyZ2V0UmVwbywgdmFsdWUpXG4gICAgICBjb25zdCB1cGRhdGVkUGF0aHMgPSBhdmFpbGFibGVQYXRocy5maWx0ZXIocCA9PiBwICE9PSB2YWx1ZSlcbiAgICAgIHNldEF2YWlsYWJsZVBhdGhzKHVwZGF0ZWRQYXRocylcbiAgICAgIHNldFZhbGlkYXRpbmcoZmFsc2UpXG5cbiAgICAgIHNldEVycm9yTWVzc2FnZShcbiAgICAgICAgYCR7Z2V0RGlzcGxheVBhdGgodmFsdWUpfSBubyBsb25nZXIgY29udGFpbnMgdGhlIGNvcnJlY3QgcmVwb3NpdG9yeS4gU2VsZWN0IGFub3RoZXIgcGF0aC5gLFxuICAgICAgKVxuICAgIH0sXG4gICAgW3RhcmdldFJlcG8sIGF2YWlsYWJsZVBhdGhzLCBvblNlbGVjdFBhdGgsIG9uQ2FuY2VsXSxcbiAgKVxuXG4gIGNvbnN0IG9wdGlvbnMgPSBbXG4gICAgLi4uYXZhaWxhYmxlUGF0aHMubWFwKHBhdGggPT4gKHtcbiAgICAgIGxhYmVsOiAoXG4gICAgICAgIDxUZXh0PlxuICAgICAgICAgIFVzZSA8VGV4dCBib2xkPntnZXREaXNwbGF5UGF0aChwYXRoKX08L1RleHQ+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICksXG4gICAgICB2YWx1ZTogcGF0aCxcbiAgICB9KSksXG4gICAgeyBsYWJlbDogJ0NhbmNlbCcsIHZhbHVlOiAnY2FuY2VsJyB9LFxuICBdXG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nIHRpdGxlPVwiVGVsZXBvcnQgdG8gUmVwb1wiIG9uQ2FuY2VsPXtvbkNhbmNlbH0gY29sb3I9XCJiYWNrZ3JvdW5kXCI+XG4gICAgICB7YXZhaWxhYmxlUGF0aHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9PlxuICAgICAgICAgICAge2Vycm9yTWVzc2FnZSAmJiA8VGV4dCBjb2xvcj1cImVycm9yXCI+e2Vycm9yTWVzc2FnZX08L1RleHQ+fVxuICAgICAgICAgICAgPFRleHQ+XG4gICAgICAgICAgICAgIE9wZW4gQ2xhdWRlIENvZGUgaW4gPFRleHQgYm9sZD57dGFyZ2V0UmVwb308L1RleHQ+OlxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAge3ZhbGlkYXRpbmcgPyAoXG4gICAgICAgICAgICA8Qm94PlxuICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgICA8VGV4dD4gVmFsaWRhdGluZyByZXBvc2l0b3J54oCmPC9UZXh0PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxTZWxlY3RcbiAgICAgICAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3ZhbHVlID0+IHZvaWQgaGFuZGxlQ2hhbmdlKHZhbHVlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC8+XG4gICAgICApIDogKFxuICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9PlxuICAgICAgICAgIHtlcnJvck1lc3NhZ2UgJiYgPFRleHQgY29sb3I9XCJlcnJvclwiPntlcnJvck1lc3NhZ2V9PC9UZXh0Pn1cbiAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5cbiAgICAgICAgICAgIFJ1biBjbGF1ZGUgLS10ZWxlcG9ydCBmcm9tIGEgY2hlY2tvdXQgb2Yge3RhcmdldFJlcG99XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgPC9EaWFsb2c+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLEtBQUssSUFBSUMsV0FBVyxFQUFFQyxRQUFRLFFBQVEs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
