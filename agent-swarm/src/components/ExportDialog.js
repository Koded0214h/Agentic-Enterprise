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
exports.ExportDialog = ExportDialog;
var path_1 = require("path");
var react_1 = require("react");
var useTerminalSize_js_1 = require("../hooks/useTerminalSize.js");
var osc_js_1 = require("../ink/termio/osc.js");
var ink_js_1 = require("../ink.js");
var useKeybinding_js_1 = require("../keybindings/useKeybinding.js");
var cwd_js_1 = require("../utils/cwd.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var ConfigurableShortcutHint_js_1 = require("./ConfigurableShortcutHint.js");
var select_js_1 = require("./CustomSelect/select.js");
var Byline_js_1 = require("./design-system/Byline.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
var KeyboardShortcutHint_js_1 = require("./design-system/KeyboardShortcutHint.js");
var TextInput_js_1 = require("./TextInput.js");
function ExportDialog(_a) {
    var _this = this;
    var content = _a.content, defaultFilename = _a.defaultFilename, onDone = _a.onDone;
    var _b = (0, react_1.useState)(null), setSelectedOption = _b[1];
    var _c = (0, react_1.useState)(defaultFilename), filename = _c[0], setFilename = _c[1];
    var _d = (0, react_1.useState)(defaultFilename.length), cursorOffset = _d[0], setCursorOffset = _d[1];
    var _e = (0, react_1.useState)(false), showFilenameInput = _e[0], setShowFilenameInput = _e[1];
    var columns = (0, useTerminalSize_js_1.useTerminalSize)().columns;
    // Handle going back from filename input to option selection
    var handleGoBack = (0, react_1.useCallback)(function () {
        setShowFilenameInput(false);
        setSelectedOption(null);
    }, []);
    var handleSelectOption = function (value) { return __awaiter(_this, void 0, void 0, function () {
        var raw;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(value === 'clipboard')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, osc_js_1.setClipboard)(content)];
                case 1:
                    raw = _a.sent();
                    if (raw)
                        process.stdout.write(raw);
                    onDone({
                        success: true,
                        message: 'Conversation copied to clipboard'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    if (value === 'file') {
                        setSelectedOption('file');
                        setShowFilenameInput(true);
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleFilenameSubmit = function () {
        var finalFilename = filename.endsWith('.txt') ? filename : filename.replace(/\.[^.]+$/, '') + '.txt';
        var filepath = (0, path_1.join)((0, cwd_js_1.getCwd)(), finalFilename);
        try {
            (0, slowOperations_js_1.writeFileSync_DEPRECATED)(filepath, content, {
                encoding: 'utf-8',
                flush: true
            });
            onDone({
                success: true,
                message: "Conversation exported to: ".concat(filepath)
            });
        }
        catch (error) {
            onDone({
                success: false,
                message: "Failed to export conversation: ".concat(error instanceof Error ? error.message : 'Unknown error')
            });
        }
    };
    // Dialog calls onCancel when Escape is pressed. If we are in the filename
    // input sub-screen, go back to the option list instead of closing entirely.
    var handleCancel = (0, react_1.useCallback)(function () {
        if (showFilenameInput) {
            handleGoBack();
        }
        else {
            onDone({
                success: false,
                message: 'Export cancelled'
            });
        }
    }, [showFilenameInput, handleGoBack, onDone]);
    var options = [{
            label: 'Copy to clipboard',
            value: 'clipboard',
            description: 'Copy the conversation to your system clipboard'
        }, {
            label: 'Save to file',
            value: 'file',
            description: 'Save the conversation to a file in the current directory'
        }];
    // Custom input guide that changes based on dialog state
    function renderInputGuide(exitState) {
        if (showFilenameInput) {
            return <Byline_js_1.Byline>
          <KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Enter" action="save"/>
          <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="go back"/>
        </Byline_js_1.Byline>;
        }
        if (exitState.pending) {
            return <ink_js_1.Text>Press {exitState.keyName} again to exit</ink_js_1.Text>;
        }
        return <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="cancel"/>;
    }
    // Use Settings context so 'n' key doesn't cancel (allows typing 'n' in filename input)
    (0, useKeybinding_js_1.useKeybinding)('confirm:no', handleCancel, {
        context: 'Settings',
        isActive: showFilenameInput
    });
    return <Dialog_js_1.Dialog title="Export Conversation" subtitle="Select export method:" color="permission" onCancel={handleCancel} inputGuide={renderInputGuide} isCancelActive={!showFilenameInput}>
      {!showFilenameInput ? <select_js_1.Select options={options} onChange={handleSelectOption} onCancel={handleCancel}/> : <ink_js_1.Box flexDirection="column">
          <ink_js_1.Text>Enter filename:</ink_js_1.Text>
          <ink_js_1.Box flexDirection="row" gap={1} marginTop={1}>
            <ink_js_1.Text>&gt;</ink_js_1.Text>
            <TextInput_js_1.default value={filename} onChange={setFilename} onSubmit={handleFilenameSubmit} focus={true} showCursor={true} columns={columns} cursorOffset={cursorOffset} onChangeCursorOffset={setCursorOffset}/>
          </ink_js_1.Box>
        </ink_js_1.Box>}
    </Dialog_js_1.Dialog>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJqb2luIiwiUmVhY3QiLCJ1c2VDYWxsYmFjayIsInVzZVN0YXRlIiwiRXhpdFN0YXRlIiwidXNlVGVybWluYWxTaXplIiwic2V0Q2xpcGJvYXJkIiwiQm94IiwiVGV4dCIsInVzZUtleWJpbmRpbmciLCJnZXRDd2QiLCJ3cml0ZUZpbGVTeW5jX0RFUFJFQ0FURUQiLCJDb25maWd1cmFibGVTaG9ydGN1dEhpbnQiLCJTZWxlY3QiLCJCeWxpbmUiLCJEaWFsb2ciLCJLZXlib2FyZFNob3J0Y3V0SGludCIsIlRleHRJbnB1dCIsIkV4cG9ydERpYWxvZ1Byb3BzIiwiY29udGVudCIsImRlZmF1bHRGaWxlbmFtZSIsIm9uRG9uZSIsInJlc3VsdCIsInN1Y2Nlc3MiLCJtZXNzYWdlIiwiRXhwb3J0T3B0aW9uIiwiRXhwb3J0RGlhbG9nIiwiUmVhY3ROb2RlIiwic2V0U2VsZWN0ZWRPcHRpb24iLCJmaWxlbmFtZSIsInNldEZpbGVuYW1lIiwiY3Vyc29yT2Zmc2V0Iiwic2V0Q3Vyc29yT2Zmc2V0IiwibGVuZ3RoIiwic2hvd0ZpbGVuYW1lSW5wdXQiLCJzZXRTaG93RmlsZW5hbWVJbnB1dCIsImNvbHVtbnMiLCJoYW5kbGVHb0JhY2siLCJoYW5kbGVTZWxlY3RPcHRpb24iLCJ2YWx1ZSIsIlByb21pc2UiLCJyYXciLCJwcm9jZXNzIiwic3Rkb3V0Iiwid3JpdGUiLCJoYW5kbGVGaWxlbmFtZVN1Ym1pdCIsImZpbmFsRmlsZW5hbWUiLCJlbmRzV2l0aCIsInJlcGxhY2UiLCJmaWxlcGF0aCIsImVuY29kaW5nIiwiZmx1c2giLCJlcnJvciIsIkVycm9yIiwiaGFuZGxlQ2FuY2VsIiwib3B0aW9ucyIsImxhYmVsIiwiZGVzY3JpcHRpb24iLCJyZW5kZXJJbnB1dEd1aWRlIiwiZXhpdFN0YXRlIiwicGVuZGluZyIsImtleU5hbWUiLCJjb250ZXh0IiwiaXNBY3RpdmUiXSwic291cmNlcyI6WyJFeHBvcnREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuaW1wb3J0IFJlYWN0LCB7IHVzZUNhbGxiYWNrLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBFeGl0U3RhdGUgfSBmcm9tICcuLi9ob29rcy91c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MuanMnXG5pbXBvcnQgeyB1c2VUZXJtaW5hbFNpemUgfSBmcm9tICcuLi9ob29rcy91c2VUZXJtaW5hbFNpemUuanMnXG5pbXBvcnQgeyBzZXRDbGlwYm9hcmQgfSBmcm9tICcuLi9pbmsvdGVybWlvL29zYy5qcydcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uL2luay5qcydcbmltcG9ydCB7IHVzZUtleWJpbmRpbmcgfSBmcm9tICcuLi9rZXliaW5kaW5ncy91c2VLZXliaW5kaW5nLmpzJ1xuaW1wb3J0IHsgZ2V0Q3dkIH0gZnJvbSAnLi4vdXRpbHMvY3dkLmpzJ1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luY19ERVBSRUNBVEVEIH0gZnJvbSAnLi4vdXRpbHMvc2xvd09wZXJhdGlvbnMuanMnXG5pbXBvcnQgeyBDb25maWd1cmFibGVTaG9ydGN1dEhpbnQgfSBmcm9tICcuL0NvbmZpZ3VyYWJsZVNob3J0Y3V0SGludC5qcydcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4vQ3VzdG9tU2VsZWN0L3NlbGVjdC5qcydcbmltcG9ydCB7IEJ5bGluZSB9IGZyb20gJy4vZGVzaWduLXN5c3RlbS9CeWxpbmUuanMnXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuaW1wb3J0IHsgS2V5Ym9hcmRTaG9ydGN1dEhpbnQgfSBmcm9tICcuL2Rlc2lnbi1zeXN0ZW0vS2V5Ym9hcmRTaG9ydGN1dEhpbnQuanMnXG5pbXBvcnQgVGV4dElucHV0IGZyb20gJy4vVGV4dElucHV0LmpzJ1xuXG50eXBlIEV4cG9ydERpYWxvZ1Byb3BzID0ge1xuICBjb250ZW50OiBzdHJpbmdcbiAgZGVmYXVsdEZpbGVuYW1lOiBzdHJpbmdcbiAgb25Eb25lOiAocmVzdWx0OiB7IHN1Y2Nlc3M6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluZyB9KSA9PiB2b2lkXG59XG5cbnR5cGUgRXhwb3J0T3B0aW9uID0gJ2NsaXBib2FyZCcgfCAnZmlsZSdcblxuZXhwb3J0IGZ1bmN0aW9uIEV4cG9ydERpYWxvZyh7XG4gIGNvbnRlbnQsXG4gIGRlZmF1bHRGaWxlbmFtZSxcbiAgb25Eb25lLFxufTogRXhwb3J0RGlhbG9nUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBbLCBzZXRTZWxlY3RlZE9wdGlvbl0gPSB1c2VTdGF0ZTxFeHBvcnRPcHRpb24gfCBudWxsPihudWxsKVxuICBjb25zdCBbZmlsZW5hbWUsIHNldEZpbGVuYW1lXSA9IHVzZVN0YXRlPHN0cmluZz4oZGVmYXVsdEZpbGVuYW1lKVxuICBjb25zdCBbY3Vyc29yT2Zmc2V0LCBzZXRDdXJzb3JPZmZzZXRdID0gdXNlU3RhdGU8bnVtYmVyPihcbiAgICBkZWZhdWx0RmlsZW5hbWUubGVuZ3RoLFxuICApXG4gIGNvbnN0IFtzaG93RmlsZW5hbWVJbnB1dCwgc2V0U2hvd0ZpbGVuYW1lSW5wdXRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgY29sdW1ucyB9ID0gdXNlVGVybWluYWxTaXplKClcblxuICAvLyBIYW5kbGUgZ29pbmcgYmFjayBmcm9tIGZpbGVuYW1lIGlucHV0IHRvIG9wdGlvbiBzZWxlY3Rpb25cbiAgY29uc3QgaGFuZGxlR29CYWNrID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFNob3dGaWxlbmFtZUlucHV0KGZhbHNlKVxuICAgIHNldFNlbGVjdGVkT3B0aW9uKG51bGwpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZVNlbGVjdE9wdGlvbiA9IGFzeW5jICh2YWx1ZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgaWYgKHZhbHVlID09PSAnY2xpcGJvYXJkJykge1xuICAgICAgLy8gQ29weSB0byBjbGlwYm9hcmQgaW1tZWRpYXRlbHlcbiAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IHNldENsaXBib2FyZChjb250ZW50KVxuICAgICAgaWYgKHJhdykgcHJvY2Vzcy5zdGRvdXQud3JpdGUocmF3KVxuICAgICAgb25Eb25lKHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ0NvbnZlcnNhdGlvbiBjb3BpZWQgdG8gY2xpcGJvYXJkJyB9KVxuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICdmaWxlJykge1xuICAgICAgc2V0U2VsZWN0ZWRPcHRpb24oJ2ZpbGUnKVxuICAgICAgc2V0U2hvd0ZpbGVuYW1lSW5wdXQodHJ1ZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVGaWxlbmFtZVN1Ym1pdCA9ICgpID0+IHtcbiAgICBjb25zdCBmaW5hbEZpbGVuYW1lID0gZmlsZW5hbWUuZW5kc1dpdGgoJy50eHQnKVxuICAgICAgPyBmaWxlbmFtZVxuICAgICAgOiBmaWxlbmFtZS5yZXBsYWNlKC9cXC5bXi5dKyQvLCAnJykgKyAnLnR4dCdcbiAgICBjb25zdCBmaWxlcGF0aCA9IGpvaW4oZ2V0Q3dkKCksIGZpbmFsRmlsZW5hbWUpXG5cbiAgICB0cnkge1xuICAgICAgd3JpdGVGaWxlU3luY19ERVBSRUNBVEVEKGZpbGVwYXRoLCBjb250ZW50LCB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmLTgnLFxuICAgICAgICBmbHVzaDogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICBvbkRvbmUoe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBtZXNzYWdlOiBgQ29udmVyc2F0aW9uIGV4cG9ydGVkIHRvOiAke2ZpbGVwYXRofWAsXG4gICAgICB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvbkRvbmUoe1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgbWVzc2FnZTogYEZhaWxlZCB0byBleHBvcnQgY29udmVyc2F0aW9uOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWAsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIERpYWxvZyBjYWxscyBvbkNhbmNlbCB3aGVuIEVzY2FwZSBpcyBwcmVzc2VkLiBJZiB3ZSBhcmUgaW4gdGhlIGZpbGVuYW1lXG4gIC8vIGlucHV0IHN1Yi1zY3JlZW4sIGdvIGJhY2sgdG8gdGhlIG9wdGlvbiBsaXN0IGluc3RlYWQgb2YgY2xvc2luZyBlbnRpcmVseS5cbiAgY29uc3QgaGFuZGxlQ2FuY2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChzaG93RmlsZW5hbWVJbnB1dCkge1xuICAgICAgaGFuZGxlR29CYWNrKClcbiAgICB9IGVsc2Uge1xuICAgICAgb25Eb25lKHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdFeHBvcnQgY2FuY2VsbGVkJyB9KVxuICAgIH1cbiAgfSwgW3Nob3dGaWxlbmFtZUlucHV0LCBoYW5kbGVHb0JhY2ssIG9uRG9uZV0pXG5cbiAgY29uc3Qgb3B0aW9ucyA9IFtcbiAgICB7XG4gICAgICBsYWJlbDogJ0NvcHkgdG8gY2xpcGJvYXJkJyxcbiAgICAgIHZhbHVlOiAnY2xpcGJvYXJkJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29weSB0aGUgY29udmVyc2F0aW9uIHRvIHlvdXIgc3lzdGVtIGNsaXBib2FyZCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ1NhdmUgdG8gZmlsZScsXG4gICAgICB2YWx1ZTogJ2ZpbGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdTYXZlIHRoZSBjb252ZXJzYXRpb24gdG8gYSBmaWxlIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeScsXG4gICAgfSxcbiAgXVxuXG4gIC8vIEN1c3RvbSBpbnB1dCBndWlkZSB0aGF0IGNoYW5nZXMgYmFzZWQgb24gZGlhbG9nIHN0YXRlXG4gIGZ1bmN0aW9uIHJlbmRlcklucHV0R3VpZGUoZXhpdFN0YXRlOiBFeGl0U3RhdGUpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgIGlmIChzaG93RmlsZW5hbWVJbnB1dCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEJ5bGluZT5cbiAgICAgICAgICA8S2V5Ym9hcmRTaG9ydGN1dEhpbnQgc2hvcnRjdXQ9XCJFbnRlclwiIGFjdGlvbj1cInNhdmVcIiAvPlxuICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgIGFjdGlvbj1cImNvbmZpcm06bm9cIlxuICAgICAgICAgICAgY29udGV4dD1cIkNvbmZpcm1hdGlvblwiXG4gICAgICAgICAgICBmYWxsYmFjaz1cIkVzY1wiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cImdvIGJhY2tcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQnlsaW5lPlxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChleGl0U3RhdGUucGVuZGluZykge1xuICAgICAgcmV0dXJuIDxUZXh0PlByZXNzIHtleGl0U3RhdGUua2V5TmFtZX0gYWdhaW4gdG8gZXhpdDwvVGV4dD5cbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludFxuICAgICAgICBhY3Rpb249XCJjb25maXJtOm5vXCJcbiAgICAgICAgY29udGV4dD1cIkNvbmZpcm1hdGlvblwiXG4gICAgICAgIGZhbGxiYWNrPVwiRXNjXCJcbiAgICAgICAgZGVzY3JpcHRpb249XCJjYW5jZWxcIlxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICAvLyBVc2UgU2V0dGluZ3MgY29udGV4dCBzbyAnbicga2V5IGRvZXNuJ3QgY2FuY2VsIChhbGxvd3MgdHlwaW5nICduJyBpbiBmaWxlbmFtZSBpbnB1dClcbiAgdXNlS2V5YmluZGluZygnY29uZmlybTpubycsIGhhbmRsZUNhbmNlbCwge1xuICAgIGNvbnRleHQ6ICdTZXR0aW5ncycsXG4gICAgaXNBY3RpdmU6IHNob3dGaWxlbmFtZUlucHV0LFxuICB9KVxuXG4gIHJldHVybiAoXG4gICAgPERpYWxvZ1xuICAgICAgdGl0bGU9XCJFeHBvcnQgQ29udmVyc2F0aW9uXCJcbiAgICAgIHN1YnRpdGxlPVwiU2VsZWN0IGV4cG9ydCBtZXRob2Q6XCJcbiAgICAgIGNvbG9yPVwicGVybWlzc2lvblwiXG4gICAgICBvbkNhbmNlbD17aGFuZGxlQ2FuY2VsfVxuICAgICAgaW5wdXRHdWlkZT17cmVuZGVySW5wdXRHdWlkZX1cbiAgICAgIGlzQ2FuY2VsQWN0aXZlPXshc2hvd0ZpbGVuYW1lSW5wdXR9XG4gICAgPlxuICAgICAgeyFzaG93RmlsZW5hbWVJbnB1dCA/IChcbiAgICAgICAgPFNlbGVjdFxuICAgICAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVNlbGVjdE9wdGlvbn1cbiAgICAgICAgICBvbkNhbmNlbD17aGFuZGxlQ2FuY2VsfVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICAgICAgPFRleHQ+RW50ZXIgZmlsZW5hbWU6PC9UZXh0PlxuICAgICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cInJvd1wiIGdhcD17MX0gbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgICAgIDxUZXh0PiZndDs8L1RleHQ+XG4gICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgIHZhbHVlPXtmaWxlbmFtZX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldEZpbGVuYW1lfVxuICAgICAgICAgICAgICBvblN1Ym1pdD17aGFuZGxlRmlsZW5hbWVTdWJtaXR9XG4gICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICBzaG93Q3Vyc29yPXt0cnVlfVxuICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICBjdXJzb3JPZmZzZXQ9e2N1cnNvck9mZnNldH1cbiAgICAgICAgICAgICAgb25DaGFuZ2VDdXJzb3JPZmZzZXQ9e3NldEN1cnNvck9mZnNldH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgIDwvQm94PlxuICAgICAgKX1cbiAgICA8L0RpYWxvZz5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxJQUFJLFFBQVEsTUFBTTtBQUMzQixPQUFPQyxLQUFLLElBQUlDLFdBQVcsRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDcEQsY0FBY0MsU0FBUyxRQUFRLDRDQUE0QztBQUMzRSxTQUFTQyxlQUFlLFFBQVEsNkJBQTZCO0FBQzdELFNBQVNDLFlBQVksUUFBUSxzQkFBc0I7QUFDbkQsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLFFBQVEsV0FBVztBQUNyQyxTQUFTQyxhQUFhLFFBQVEsaUNBQWlDO0FBQy9ELFNBQVNDLE1BQU0sUUFBUSxpQkFBaUI7QUFDeEMsU0FBU0Msd0JBQXdCLFFBQVEsNEJBQTRCO0FBQ3JFLFNBQVNDLHdCQUF3QixRQUFRLCtCQUErQjtBQUN4RSxTQUFTQyxNQUFNLFFBQVEsMEJBQTBCO0FBQ2pELFNBQVNDLE1BQU0sUUFBUSwyQkFBMkI7QUFDbEQsU0FBU0MsTUFBTSxRQUFRLDJCQUEyQjtBQUNsRCxTQUFTQyxvQkFBb0IsUUFBUSx5Q0FBeUM7QUFDOUUsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUV0QyxLQUFLQyxpQkFBaUIsR0FBRztFQUN2QkMsT0FBTyxFQUFFLE1BQU07RUFDZkMsZUFBZSxFQUFFLE1BQU07RUFDdkJDLE1BQU0sRUFBRSxDQUFDQyxNQUFNLEVBQUU7SUFBRUMsT0FBTyxFQUFFLE9BQU87SUFBRUMsT0FBTyxFQUFFLE1BQU07RUFBQyxDQUFDLEVBQUUsR0FBRyxJQUFJO0FBQ2pFLENBQUM7QUFFRCxLQUFLQyxZQUFZLEdBQUcsV0FBVyxHQUFHLE1BQU07QUFFeEMsT0FBTyxTQUFTQyxZQUFZQSxDQUFDO0VBQzNCUCxPQUFPO0VBQ1BDLGVBQWU7RUFDZkM7QUFDaUIsQ0FBbEIsRUFBRUgsaUJBQWlCLENBQUMsRUFBRWpCLEtBQUssQ0FBQzBCLFNBQVMsQ0FBQztFQUNyQyxNQUFNLEdB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
