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
exports.TeleportStash = TeleportStash;
var figures_1 = require("figures");
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var debug_js_1 = require("../utils/debug.js");
var git_js_1 = require("../utils/git.js");
var index_js_1 = require("./CustomSelect/index.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
var Spinner_js_1 = require("./Spinner.js");
function TeleportStash(_a) {
    var _this = this;
    var onStashAndContinue = _a.onStashAndContinue, onCancel = _a.onCancel;
    var _b = (0, react_1.useState)(null), gitFileStatus = _b[0], setGitFileStatus = _b[1];
    var changedFiles = gitFileStatus !== null ? __spreadArray(__spreadArray([], gitFileStatus.tracked, true), gitFileStatus.untracked, true) : [];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), stashing = _d[0], setStashing = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    // Load changed files on mount
    (0, react_1.useEffect)(function () {
        var loadChangedFiles = function () { return __awaiter(_this, void 0, void 0, function () {
            var fileStatus, err_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, (0, git_js_1.getFileStatus)()];
                    case 1:
                        fileStatus = _a.sent();
                        setGitFileStatus(fileStatus);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        errorMessage = err_1 instanceof Error ? err_1.message : String(err_1);
                        (0, debug_js_1.logForDebugging)("Error getting changed files: ".concat(errorMessage), {
                            level: 'error'
                        });
                        setError('Failed to get changed files');
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        void loadChangedFiles();
    }, []);
    var handleStash = function () { return __awaiter(_this, void 0, void 0, function () {
        var success, err_0_1, errorMessage_0;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setStashing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    (0, debug_js_1.logForDebugging)('Stashing changes before teleport...');
                    return [4 /*yield*/, (0, git_js_1.stashToCleanState)('Teleport auto-stash')];
                case 2:
                    success = _a.sent();
                    if (success) {
                        (0, debug_js_1.logForDebugging)('Successfully stashed changes');
                        onStashAndContinue();
                    }
                    else {
                        setError('Failed to stash changes');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_0_1 = _a.sent();
                    errorMessage_0 = err_0_1 instanceof Error ? err_0_1.message : String(err_0_1);
                    (0, debug_js_1.logForDebugging)("Error stashing changes: ".concat(errorMessage_0), {
                        level: 'error'
                    });
                    setError('Failed to stash changes');
                    return [3 /*break*/, 5];
                case 4:
                    setStashing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSelectChange = function (value) {
        if (value === 'stash') {
            void handleStash();
        }
        else {
            onCancel();
        }
    };
    if (loading) {
        return <ink_js_1.Box flexDirection="column" padding={1}>
        <ink_js_1.Box marginBottom={1}>
          <Spinner_js_1.Spinner />
          <ink_js_1.Text> Checking git status{figures_1.default.ellipsis}</ink_js_1.Text>
        </ink_js_1.Box>
      </ink_js_1.Box>;
    }
    if (error) {
        return <ink_js_1.Box flexDirection="column" padding={1}>
        <ink_js_1.Text bold color="error">
          Error: {error}
        </ink_js_1.Text>
        <ink_js_1.Box marginTop={1}>
          <ink_js_1.Text dimColor>Press </ink_js_1.Text>
          <ink_js_1.Text bold>Escape</ink_js_1.Text>
          <ink_js_1.Text dimColor> to cancel</ink_js_1.Text>
        </ink_js_1.Box>
      </ink_js_1.Box>;
    }
    var showFileCount = changedFiles.length > 8;
    return <Dialog_js_1.Dialog title="Working Directory Has Changes" onCancel={onCancel}>
      <ink_js_1.Text>
        Teleport will switch git branches. The following changes were found:
      </ink_js_1.Text>

      <ink_js_1.Box flexDirection="column" paddingLeft={2}>
        {changedFiles.length > 0 ? showFileCount ? <ink_js_1.Text>{changedFiles.length} files changed</ink_js_1.Text> : changedFiles.map(function (file, index) { return <ink_js_1.Text key={index}>{file}</ink_js_1.Text>; }) : <ink_js_1.Text dimColor>No changes detected</ink_js_1.Text>}
      </ink_js_1.Box>

      <ink_js_1.Text>
        Would you like to stash these changes and continue with teleport?
      </ink_js_1.Text>

      {stashing ? <ink_js_1.Box>
          <Spinner_js_1.Spinner />
          <ink_js_1.Text> Stashing changes...</ink_js_1.Text>
        </ink_js_1.Box> : <index_js_1.Select options={[{
                    label: 'Stash changes and continue',
                    value: 'stash'
                }, {
                    label: 'Exit',
                    value: 'exit'
                }]} onChange={handleSelectChange}/>}
    </Dialog_js_1.Dialog>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIkJveCIsIlRleHQiLCJsb2dGb3JEZWJ1Z2dpbmciLCJHaXRGaWxlU3RhdHVzIiwiZ2V0RmlsZVN0YXR1cyIsInN0YXNoVG9DbGVhblN0YXRlIiwiU2VsZWN0IiwiRGlhbG9nIiwiU3Bpbm5lciIsIlRlbGVwb3J0U3Rhc2hQcm9wcyIsIm9uU3Rhc2hBbmRDb250aW51ZSIsIm9uQ2FuY2VsIiwiVGVsZXBvcnRTdGFzaCIsIlJlYWN0Tm9kZSIsImdpdEZpbGVTdGF0dXMiLCJzZXRHaXRGaWxlU3RhdHVzIiwiY2hhbmdlZEZpbGVzIiwidHJhY2tlZCIsInVudHJhY2tlZCIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwic3Rhc2hpbmciLCJzZXRTdGFzaGluZyIsImVycm9yIiwic2V0RXJyb3IiLCJsb2FkQ2hhbmdlZEZpbGVzIiwiZmlsZVN0YXR1cyIsImVyciIsImVycm9yTWVzc2FnZSIsIkVycm9yIiwibWVzc2FnZSIsIlN0cmluZyIsImxldmVsIiwiaGFuZGxlU3Rhc2giLCJzdWNjZXNzIiwiaGFuZGxlU2VsZWN0Q2hhbmdlIiwidmFsdWUiLCJlbGxpcHNpcyIsInNob3dGaWxlQ291bnQiLCJsZW5ndGgiLCJtYXAiLCJmaWxlIiwiaW5kZXgiLCJsYWJlbCJdLCJzb3VyY2VzIjpbIlRlbGVwb3J0U3Rhc2gudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmaWd1cmVzIGZyb20gJ2ZpZ3VyZXMnXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHsgbG9nRm9yRGVidWdnaW5nIH0gZnJvbSAnLi4vdXRpbHMvZGVidWcuanMnXG5pbXBvcnQgdHlwZSB7IEdpdEZpbGVTdGF0dXMgfSBmcm9tICcuLi91dGlscy9naXQuanMnXG5pbXBvcnQgeyBnZXRGaWxlU3RhdHVzLCBzdGFzaFRvQ2xlYW5TdGF0ZSB9IGZyb20gJy4uL3V0aWxzL2dpdC5qcydcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4vQ3VzdG9tU2VsZWN0L2luZGV4LmpzJ1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnLi9kZXNpZ24tc3lzdGVtL0RpYWxvZy5qcydcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuL1NwaW5uZXIuanMnXG5cbnR5cGUgVGVsZXBvcnRTdGFzaFByb3BzID0ge1xuICBvblN0YXNoQW5kQ29udGludWU6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRlbGVwb3J0U3Rhc2goe1xuICBvblN0YXNoQW5kQ29udGludWUsXG4gIG9uQ2FuY2VsLFxufTogVGVsZXBvcnRTdGFzaFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW2dpdEZpbGVTdGF0dXMsIHNldEdpdEZpbGVTdGF0dXNdID0gdXNlU3RhdGU8R2l0RmlsZVN0YXR1cyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGNoYW5nZWRGaWxlcyA9XG4gICAgZ2l0RmlsZVN0YXR1cyAhPT0gbnVsbFxuICAgICAgPyBbLi4uZ2l0RmlsZVN0YXR1cy50cmFja2VkLCAuLi5naXRGaWxlU3RhdHVzLnVudHJhY2tlZF1cbiAgICAgIDogW11cbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3N0YXNoaW5nLCBzZXRTdGFzaGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuXG4gIC8vIExvYWQgY2hhbmdlZCBmaWxlcyBvbiBtb3VudFxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGxvYWRDaGFuZ2VkRmlsZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlU3RhdHVzID0gYXdhaXQgZ2V0RmlsZVN0YXR1cygpXG4gICAgICAgIHNldEdpdEZpbGVTdGF0dXMoZmlsZVN0YXR1cylcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycilcbiAgICAgICAgbG9nRm9yRGVidWdnaW5nKGBFcnJvciBnZXR0aW5nIGNoYW5nZWQgZmlsZXM6ICR7ZXJyb3JNZXNzYWdlfWAsIHtcbiAgICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgfSlcbiAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBnZXQgY2hhbmdlZCBmaWxlcycpXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHZvaWQgbG9hZENoYW5nZWRGaWxlcygpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZVN0YXNoID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldFN0YXNoaW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGxvZ0ZvckRlYnVnZ2luZygnU3Rhc2hpbmcgY2hhbmdlcyBiZWZvcmUgdGVsZXBvcnQuLi4nKVxuICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHN0YXNoVG9DbGVhblN0YXRlKCdUZWxlcG9ydCBhdXRvLXN0YXNoJylcblxuICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgbG9nRm9yRGVidWdnaW5nKCdTdWNjZXNzZnVsbHkgc3Rhc2hlZCBjaGFuZ2VzJylcbiAgICAgICAgb25TdGFzaEFuZENvbnRpbnVlKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gc3Rhc2ggY2hhbmdlcycpXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogU3RyaW5nKGVycilcbiAgICAgIGxvZ0ZvckRlYnVnZ2luZyhgRXJyb3Igc3Rhc2hpbmcgY2hhbmdlczogJHtlcnJvck1lc3NhZ2V9YCwge1xuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgIH0pXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIHN0YXNoIGNoYW5nZXMnKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRTdGFzaGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVTZWxlY3RDaGFuZ2UgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gJ3N0YXNoJykge1xuICAgICAgdm9pZCBoYW5kbGVTdGFzaCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIG9uQ2FuY2VsKClcbiAgICB9XG4gIH1cblxuICBpZiAobG9hZGluZykge1xuICAgIHJldHVybiAoXG4gICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBwYWRkaW5nPXsxfT5cbiAgICAgICAgPEJveCBtYXJnaW5Cb3R0b209ezF9PlxuICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgPFRleHQ+IENoZWNraW5nIGdpdCBzdGF0dXN7ZmlndXJlcy5lbGxpcHNpc308L1RleHQ+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9Cb3g+XG4gICAgKVxuICB9XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHBhZGRpbmc9ezF9PlxuICAgICAgICA8VGV4dCBib2xkIGNvbG9yPVwiZXJyb3JcIj5cbiAgICAgICAgICBFcnJvcjoge2Vycm9yfVxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIDxCb3ggbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5QcmVzcyA8L1RleHQ+XG4gICAgICAgICAgPFRleHQgYm9sZD5Fc2NhcGU8L1RleHQ+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+IHRvIGNhbmNlbDwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L0JveD5cbiAgICApXG4gIH1cblxuICBjb25zdCBzaG93RmlsZUNvdW50ID0gY2hhbmdlZEZpbGVzLmxlbmd0aCA+IDhcblxuICByZXR1cm4gKFxuICAgIDxEaWFsb2cgdGl0bGU9XCJXb3JraW5nIERpcmVjdG9yeSBIYXMgQ2hhbmdlc1wiIG9uQ2FuY2VsPXtvbkNhbmNlbH0+XG4gICAgICA8VGV4dD5cbiAgICAgICAgVGVsZXBvcnQgd2lsbCBzd2l0Y2ggZ2l0IGJyYW5jaGVzLiBUaGUgZm9sbG93aW5nIGNoYW5nZXMgd2VyZSBmb3VuZDpcbiAgICAgIDwvVGV4dD5cblxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgcGFkZGluZ0xlZnQ9ezJ9PlxuICAgICAgICB7Y2hhbmdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgc2hvd0ZpbGVDb3VudCA/IChcbiAgICAgICAgICAgIDxUZXh0PntjaGFuZ2VkRmlsZXMubGVuZ3RofSBmaWxlcyBjaGFuZ2VkPC9UZXh0PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICBjaGFuZ2VkRmlsZXMubWFwKChmaWxlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgPFRleHQga2V5PXtpbmRleH0+e2ZpbGV9PC9UZXh0PlxuICAgICAgICAgICAgKSlcbiAgICAgICAgICApXG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+Tm8gY2hhbmdlcyBkZXRlY3RlZDwvVGV4dD5cbiAgICAgICAgKX1cbiAgICAgIDwvQm94PlxuXG4gICAgICA8VGV4dD5cbiAgICAgICAgV291bGQgeW91IGxpa2UgdG8gc3Rhc2ggdGhlc2UgY2hhbmdlcyBhbmQgY29udGludWUgd2l0aCB0ZWxlcG9ydD9cbiAgICAgIDwvVGV4dD5cblxuICAgICAge3N0YXNoaW5nID8gKFxuICAgICAgICA8Qm94PlxuICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgPFRleHQ+IFN0YXNoaW5nIGNoYW5nZXMuLi48L1RleHQ+XG4gICAgICAgIDwvQm94PlxuICAgICAgKSA6IChcbiAgICAgICAgPFNlbGVjdFxuICAgICAgICAgIG9wdGlvbnM9e1tcbiAgICAgICAgICAgIHsgbGFiZWw6ICdTdGFzaCBjaGFuZ2VzIGFuZCBjb250aW51ZScsIHZhbHVlOiAnc3Rhc2gnIH0sXG4gICAgICAgICAgICB7IGxhYmVsOiAnRXhpdCcsIHZhbHVlOiAnZXhpdCcgfSxcbiAgICAgICAgICBdfVxuICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVTZWxlY3RDaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvRGlhbG9nPlxuICApXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLE9BQU8sTUFBTSxTQUFTO0FBQzdCLE9BQU9DLEtBQUssSUFBSUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUNsRCxTQUFTQyxHQUFHLEVBQUVDLElBQUksUUFBUSxXQUFXO0FBQ3JDLFNBQVNDLGVBQWUsUUFBUSxtQkFBbUI7QUFDbkQsY0FBY0MsYUFBYSxRQUFRLGlCQUFpQjtBQUNwRCxTQUFTQyxhQUFhLEVBQUVDLGlCQUFpQixRQUFRLGlCQUFpQjtBQUNsRSxTQUFTQyxNQUFNLFFBQVEseUJBQXlCO0FBQ2hELFNBQVNDLE1BQU0sUUFBUSwyQkFBMkI7QUFDbEQsU0FBU0MsT0FBTyxRQUFRLGNBQWM7QUFFdEMsS0FBS0Msa0JBQWtCLEdBQUc7RUFDeEJDLGtCQUFrQixFQUFFLEdBQUcsR0FBRyxJQUFJO0VBQzlCQyxRQUFRLEVBQUUsR0FBRyxHQUFHLElBQUk7QUFDdEIsQ0FBQztBQUVELE9BQU8sU0FBU0MsYUFBYUEsQ0FBQztFQUM1QkYsa0JBQWtCO0VBQ2xCQztBQUNrQixDQUFuQixFQUFFRixrQkFBa0IsQ0FBQyxFQUFFWixLQUFLLENBQUNnQixTQUFTLENBQUM7RUFDdEMsTUFBTSxDQUFDQyxhQUFhLEVBQUVDLGdC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
