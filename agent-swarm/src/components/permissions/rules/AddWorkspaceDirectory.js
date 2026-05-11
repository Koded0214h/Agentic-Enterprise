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
exports.AddWorkspaceDirectory = AddWorkspaceDirectory;
var compiler_runtime_1 = require("react/compiler-runtime");
var figures_1 = require("figures");
var React = require("react");
var react_1 = require("react");
var usehooks_ts_1 = require("usehooks-ts");
var validation_js_1 = require("../../../commands/add-dir/validation.js");
var TextInput_js_1 = require("../../../components/TextInput.js");
var ink_js_1 = require("../../../ink.js");
var useKeybinding_js_1 = require("../../../keybindings/useKeybinding.js");
var directoryCompletion_js_1 = require("../../../utils/suggestions/directoryCompletion.js");
var ConfigurableShortcutHint_js_1 = require("../../ConfigurableShortcutHint.js");
var select_js_1 = require("../../CustomSelect/select.js");
var Byline_js_1 = require("../../design-system/Byline.js");
var Dialog_js_1 = require("../../design-system/Dialog.js");
var KeyboardShortcutHint_js_1 = require("../../design-system/KeyboardShortcutHint.js");
var PromptInputFooterSuggestions_js_1 = require("../../PromptInput/PromptInputFooterSuggestions.js");
var REMEMBER_DIRECTORY_OPTIONS = [{
        value: 'yes-session',
        label: 'Yes, for this session'
    }, {
        value: 'yes-remember',
        label: 'Yes, and remember this directory'
    }, {
        value: 'no',
        label: 'No'
    }];
function PermissionDescription() {
    var $ = (0, compiler_runtime_1.c)(1);
    var t0;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = <ink_js_1.Text dimColor={true}>Claude Code will be able to read files in this directory and make edits when auto-accept edits is on.</ink_js_1.Text>;
        $[0] = t0;
    }
    else {
        t0 = $[0];
    }
    return t0;
}
function DirectoryDisplay(t0) {
    var $ = (0, compiler_runtime_1.c)(5);
    var path = t0.path;
    var t1;
    if ($[0] !== path) {
        t1 = <ink_js_1.Text color="permission">{path}</ink_js_1.Text>;
        $[0] = path;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = <PermissionDescription />;
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var t3;
    if ($[3] !== t1) {
        t3 = <ink_js_1.Box flexDirection="column" paddingX={2} gap={1}>{t1}{t2}</ink_js_1.Box>;
        $[3] = t1;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    return t3;
}
function DirectoryInput(t0) {
    var $ = (0, compiler_runtime_1.c)(14);
    var value = t0.value, onChange = t0.onChange, onSubmit = t0.onSubmit, error = t0.error, suggestions = t0.suggestions, selectedSuggestion = t0.selectedSuggestion;
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = <ink_js_1.Text>Enter the path to the directory:</ink_js_1.Text>;
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var t2;
    if ($[1] !== onChange || $[2] !== onSubmit || $[3] !== value) {
        t2 = <ink_js_1.Box borderDimColor={true} borderStyle="round" marginY={1} paddingLeft={1}><TextInput_js_1.default showCursor={true} placeholder={"Directory path".concat(figures_1.default.ellipsis)} value={value} onChange={onChange} onSubmit={onSubmit} columns={80} cursorOffset={value.length} onChangeCursorOffset={_temp}/></ink_js_1.Box>;
        $[1] = onChange;
        $[2] = onSubmit;
        $[3] = value;
        $[4] = t2;
    }
    else {
        t2 = $[4];
    }
    var t3;
    if ($[5] !== selectedSuggestion || $[6] !== suggestions) {
        t3 = suggestions.length > 0 && <ink_js_1.Box marginBottom={1}><PromptInputFooterSuggestions_js_1.PromptInputFooterSuggestions suggestions={suggestions} selectedSuggestion={selectedSuggestion}/></ink_js_1.Box>;
        $[5] = selectedSuggestion;
        $[6] = suggestions;
        $[7] = t3;
    }
    else {
        t3 = $[7];
    }
    var t4;
    if ($[8] !== error) {
        t4 = error && <ink_js_1.Text color="error">{error}</ink_js_1.Text>;
        $[8] = error;
        $[9] = t4;
    }
    else {
        t4 = $[9];
    }
    var t5;
    if ($[10] !== t2 || $[11] !== t3 || $[12] !== t4) {
        t5 = <ink_js_1.Box flexDirection="column">{t1}{t2}{t3}{t4}</ink_js_1.Box>;
        $[10] = t2;
        $[11] = t3;
        $[12] = t4;
        $[13] = t5;
    }
    else {
        t5 = $[13];
    }
    return t5;
}
function _temp() { }
function AddWorkspaceDirectory(t0) {
    var _this = this;
    var $ = (0, compiler_runtime_1.c)(34);
    var onAddDirectory = t0.onAddDirectory, onCancel = t0.onCancel, permissionContext = t0.permissionContext, directoryPath = t0.directoryPath;
    var _a = (0, react_1.useState)(""), directoryInput = _a[0], setDirectoryInput = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [];
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var _d = (0, react_1.useState)(t1), suggestions = _d[0], setSuggestions = _d[1];
    var _e = (0, react_1.useState)(0), selectedSuggestion = _e[0], setSelectedSuggestion = _e[1];
    var t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = function (path) { return __awaiter(_this, void 0, void 0, function () {
            var completions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!path) {
                            setSuggestions([]);
                            setSelectedSuggestion(0);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, directoryCompletion_js_1.getDirectoryCompletions)(path)];
                    case 1:
                        completions = _a.sent();
                        setSuggestions(completions);
                        setSelectedSuggestion(0);
                        return [2 /*return*/];
                }
            });
        }); };
        $[1] = t2;
    }
    else {
        t2 = $[1];
    }
    var fetchSuggestions = t2;
    var debouncedFetchSuggestions = (0, usehooks_ts_1.useDebounceCallback)(fetchSuggestions, 100);
    var t3;
    var t4;
    if ($[2] !== debouncedFetchSuggestions || $[3] !== directoryInput) {
        t3 = function () {
            debouncedFetchSuggestions(directoryInput);
        };
        t4 = [directoryInput, debouncedFetchSuggestions];
        $[2] = debouncedFetchSuggestions;
        $[3] = directoryInput;
        $[4] = t3;
        $[5] = t4;
    }
    else {
        t3 = $[4];
        t4 = $[5];
    }
    (0, react_1.useEffect)(t3, t4);
    var t5;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = function (suggestion) {
            var newPath = suggestion.id + "/";
            setDirectoryInput(newPath);
            setError(null);
        };
        $[6] = t5;
    }
    else {
        t5 = $[6];
    }
    var applySuggestion = t5;
    var t6;
    if ($[7] !== onAddDirectory || $[8] !== permissionContext) {
        t6 = function (newPath_0) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, validation_js_1.validateDirectoryForWorkspace)(newPath_0, permissionContext)];
                    case 1:
                        result = _a.sent();
                        if (result.resultType === "success") {
                            onAddDirectory(result.absolutePath, false);
                        }
                        else {
                            setError((0, validation_js_1.addDirHelpMessage)(result));
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        $[7] = onAddDirectory;
        $[8] = permissionContext;
        $[9] = t6;
    }
    else {
        t6 = $[9];
    }
    var handleSubmit = t6;
    var t7;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = {
            context: "Settings"
        };
        $[10] = t7;
    }
    else {
        t7 = $[10];
    }
    (0, useKeybinding_js_1.useKeybinding)("confirm:no", onCancel, t7);
    var t8;
    if ($[11] !== handleSubmit || $[12] !== selectedSuggestion || $[13] !== suggestions) {
        t8 = function (e) {
            if (suggestions.length > 0) {
                if (e.key === "tab") {
                    e.preventDefault();
                    var suggestion_0 = suggestions[selectedSuggestion];
                    if (suggestion_0) {
                        applySuggestion(suggestion_0);
                    }
                    return;
                }
                if (e.key === "return") {
                    e.preventDefault();
                    var suggestion_1 = suggestions[selectedSuggestion];
                    if (suggestion_1) {
                        handleSubmit(suggestion_1.id + "/");
                    }
                    return;
                }
                if (e.key === "up" || e.ctrl && e.key === "p") {
                    e.preventDefault();
                    setSelectedSuggestion(function (prev) { return prev <= 0 ? suggestions.length - 1 : prev - 1; });
                    return;
                }
                if (e.key === "down" || e.ctrl && e.key === "n") {
                    e.preventDefault();
                    setSelectedSuggestion(function (prev_0) { return prev_0 >= suggestions.length - 1 ? 0 : prev_0 + 1; });
                    return;
                }
            }
        };
        $[11] = handleSubmit;
        $[12] = selectedSuggestion;
        $[13] = suggestions;
        $[14] = t8;
    }
    else {
        t8 = $[14];
    }
    var handleKeyDown = t8;
    var t9;
    if ($[15] !== directoryPath || $[16] !== onAddDirectory || $[17] !== onCancel) {
        t9 = function (value) {
            if (!directoryPath) {
                return;
            }
            var selectionValue = value;
            bb64: switch (selectionValue) {
                case "yes-session":
                    {
                        onAddDirectory(directoryPath, false);
                        break bb64;
                    }
                case "yes-remember":
                    {
                        onAddDirectory(directoryPath, true);
                        break bb64;
                    }
                case "no":
                    {
                        onCancel();
                    }
            }
        };
        $[15] = directoryPath;
        $[16] = onAddDirectory;
        $[17] = onCancel;
        $[18] = t9;
    }
    else {
        t9 = $[18];
    }
    var handleSelect = t9;
    var t10 = directoryPath ? undefined : _temp2;
    var t11;
    if ($[19] !== directoryInput || $[20] !== directoryPath || $[21] !== error || $[22] !== handleSelect || $[23] !== handleSubmit || $[24] !== selectedSuggestion || $[25] !== suggestions) {
        t11 = directoryPath ? <ink_js_1.Box flexDirection="column" gap={1}><DirectoryDisplay path={directoryPath}/><select_js_1.Select options={REMEMBER_DIRECTORY_OPTIONS} onChange={handleSelect} onCancel={function () { return handleSelect("no"); }}/></ink_js_1.Box> : <ink_js_1.Box flexDirection="column" gap={1} marginX={2}><PermissionDescription /><DirectoryInput value={directoryInput} onChange={setDirectoryInput} onSubmit={handleSubmit} error={error} suggestions={suggestions} selectedSuggestion={selectedSuggestion}/></ink_js_1.Box>;
        $[19] = directoryInput;
        $[20] = directoryPath;
        $[21] = error;
        $[22] = handleSelect;
        $[23] = handleSubmit;
        $[24] = selectedSuggestion;
        $[25] = suggestions;
        $[26] = t11;
    }
    else {
        t11 = $[26];
    }
    var t12;
    if ($[27] !== onCancel || $[28] !== t10 || $[29] !== t11) {
        t12 = <Dialog_js_1.Dialog title="Add directory to workspace" onCancel={onCancel} color="permission" isCancelActive={false} inputGuide={t10}>{t11}</Dialog_js_1.Dialog>;
        $[27] = onCancel;
        $[28] = t10;
        $[29] = t11;
        $[30] = t12;
    }
    else {
        t12 = $[30];
    }
    var t13;
    if ($[31] !== handleKeyDown || $[32] !== t12) {
        t13 = <ink_js_1.Box flexDirection="column" tabIndex={0} autoFocus={true} onKeyDown={handleKeyDown}>{t12}</ink_js_1.Box>;
        $[31] = handleKeyDown;
        $[32] = t12;
        $[33] = t13;
    }
    else {
        t13 = $[33];
    }
    return t13;
}
function _temp2(exitState) {
    return exitState.pending ? <ink_js_1.Text>Press {exitState.keyName} again to exit</ink_js_1.Text> : <Byline_js_1.Byline><KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Tab" action="complete"/><KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Enter" action="add"/><ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel"/></Byline_js_1.Byline>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VDYWxsYmFjayIsInVzZUVmZmVjdCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsInVzZURlYm91bmNlQ2FsbGJhY2siLCJhZGREaXJIZWxwTWVzc2FnZSIsInZhbGlkYXRlRGlyZWN0b3J5Rm9yV29ya3NwYWNlIiwiVGV4dElucHV0IiwiS2V5Ym9hcmRFdmVudCIsIkJveCIsIlRleHQiLCJ1c2VLZXliaW5kaW5nIiwiVG9vbFBlcm1pc3Npb25Db250ZXh0IiwiZ2V0RGlyZWN0b3J5Q29tcGxldGlvbnMiLCJDb25maWd1cmFibGVTaG9ydGN1dEhpbnQiLCJTZWxlY3QiLCJCeWxpbmUiLCJEaWFsb2ciLCJLZXlib2FyZFNob3J0Y3V0SGludCIsIlByb21wdElucHV0Rm9vdGVyU3VnZ2VzdGlvbnMiLCJTdWdnZXN0aW9uSXRlbSIsIlByb3BzIiwib25BZGREaXJlY3RvcnkiLCJwYXRoIiwicmVtZW1iZXIiLCJvbkNhbmNlbCIsInBlcm1pc3Npb25Db250ZXh0IiwiZGlyZWN0b3J5UGF0aCIsIlJlbWVtYmVyRGlyZWN0b3J5T3B0aW9uIiwiUkVNRU1CRVJfRElSRUNUT1JZX09QVElPTlMiLCJBcnJheSIsInZhbHVlIiwibGFiZWwiLCJQZXJtaXNzaW9uRGVzY3JpcHRpb24iLCIkIiwiX2MiLCJ0MCIsIlN5bWJvbCIsImZvciIsIkRpcmVjdG9yeURpc3BsYXkiLCJ0MSIsInQyIiwidDMiLCJEaXJlY3RvcnlJbnB1dCIsIm9uQ2hhbmdlIiwib25TdWJtaXQiLCJlcnJvciIsInN1Z2dlc3Rpb25zIiwic2VsZWN0ZWRTdWdnZXN0aW9uIiwiZWxsaXBzaXMiLCJsZW5ndGgiLCJfdGVtcCIsInQ0IiwidDUiLCJBZGRXb3Jrc3BhY2VEaXJlY3RvcnkiLCJkaXJlY3RvcnlJbnB1dCIsInNldERpcmVjdG9yeUlucHV0Iiwic2V0RXJyb3IiLCJzZXRTdWdnZXN0aW9ucyIsInNldFNlbGVjdGVkU3VnZ2VzdGlvbiIsImNvbXBsZXRpb25zIiwiZmV0Y2hTdWdnZXN0aW9ucyIsImRlYm91bmNlZEZldGNoU3VnZ2VzdGlvbnMiLCJzdWdnZXN0aW9uIiwibmV3UGF0aCIsImlkIiwiYXBwbHlTdWdnZXN0aW9uIiwidDYiLCJuZXdQYXRoXzAiLCJyZXN1bHQiLCJyZXN1bHRUeXBlIiwiYWJzb2x1dGVQYXRoIiwiaGFuZGxlU3VibWl0IiwidDciLCJjb250ZXh0IiwidDgiLCJlIiwia2V5IiwicHJldmVudERlZmF1bHQiLCJzdWdnZXN0aW9uXzAiLCJzdWdnZXN0aW9uXzEiLCJjdHJsIiwicHJldiIsInByZXZfMCIsImhhbmRsZUtleURvd24iLCJ0OSIsInNlbGVjdGlvblZhbHVlIiwiYmI2NCIsImhhbmRsZVNlbGVjdCIsInQxMCIsInVuZGVmaW5lZCIsIl90ZW1wMiIsInQxMSIsIm9wdGlvbnMiLCJ0MTIiLCJ0MTMiLCJleGl0U3RhdGUiLCJwZW5kaW5nIiwia2V5TmFtZSJdLCJzb3VyY2VzIjpbIkFkZFdvcmtzcGFjZURpcmVjdG9yeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZpZ3VyZXMgZnJvbSAnZmlndXJlcydcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZURlYm91bmNlQ2FsbGJhY2sgfSBmcm9tICd1c2Vob29rcy10cydcbmltcG9ydCB7XG4gIGFkZERpckhlbHBNZXNzYWdlLFxuICB2YWxpZGF0ZURpcmVjdG9yeUZvcldvcmtzcGFjZSxcbn0gZnJvbSAnLi4vLi4vLi4vY29tbWFuZHMvYWRkLWRpci92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IFRleHRJbnB1dCBmcm9tICcuLi8uLi8uLi9jb21wb25lbnRzL1RleHRJbnB1dC5qcydcbmltcG9ydCB0eXBlIHsgS2V5Ym9hcmRFdmVudCB9IGZyb20gJy4uLy4uLy4uL2luay9ldmVudHMva2V5Ym9hcmQtZXZlbnQuanMnXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9pbmsuanMnXG5pbXBvcnQgeyB1c2VLZXliaW5kaW5nIH0gZnJvbSAnLi4vLi4vLi4va2V5YmluZGluZ3MvdXNlS2V5YmluZGluZy5qcydcbmltcG9ydCB0eXBlIHsgVG9vbFBlcm1pc3Npb25Db250ZXh0IH0gZnJvbSAnLi4vLi4vLi4vVG9vbC5qcydcbmltcG9ydCB7IGdldERpcmVjdG9yeUNvbXBsZXRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvc3VnZ2VzdGlvbnMvZGlyZWN0b3J5Q29tcGxldGlvbi5qcydcbmltcG9ydCB7IENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCB9IGZyb20gJy4uLy4uL0NvbmZpZ3VyYWJsZVNob3J0Y3V0SGludC5qcydcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uLy4uL0N1c3RvbVNlbGVjdC9zZWxlY3QuanMnXG5pbXBvcnQgeyBCeWxpbmUgfSBmcm9tICcuLi8uLi9kZXNpZ24tc3lzdGVtL0J5bGluZS5qcydcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4uLy4uL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuaW1wb3J0IHsgS2V5Ym9hcmRTaG9ydGN1dEhpbnQgfSBmcm9tICcuLi8uLi9kZXNpZ24tc3lzdGVtL0tleWJvYXJkU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHtcbiAgUHJvbXB0SW5wdXRGb290ZXJTdWdnZXN0aW9ucyxcbiAgdHlwZSBTdWdnZXN0aW9uSXRlbSxcbn0gZnJvbSAnLi4vLi4vUHJvbXB0SW5wdXQvUHJvbXB0SW5wdXRGb290ZXJTdWdnZXN0aW9ucy5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgb25BZGREaXJlY3Rvcnk6IChwYXRoOiBzdHJpbmcsIHJlbWVtYmVyPzogYm9vbGVhbikgPT4gdm9pZFxuICBvbkNhbmNlbDogKCkgPT4gdm9pZFxuICBwZXJtaXNzaW9uQ29udGV4dDogVG9vbFBlcm1pc3Npb25Db250ZXh0XG4gIGRpcmVjdG9yeVBhdGg/OiBzdHJpbmcgLy8gV2hlbiBkaXJlY3RvcnlQYXRoIGlzIHByb3ZpZGVkLCBzaG93IHNlbGVjdGlvbiBvcHRpb25zIGluc3RlYWQgb2YgaW5wdXRcbn1cblxudHlwZSBSZW1lbWJlckRpcmVjdG9yeU9wdGlvbiA9ICd5ZXMtc2Vzc2lvbicgfCAneWVzLXJlbWVtYmVyJyB8ICdubydcblxuY29uc3QgUkVNRU1CRVJfRElSRUNUT1JZX09QVElPTlM6IEFycmF5PHtcbiAgdmFsdWU6IFJlbWVtYmVyRGlyZWN0b3J5T3B0aW9uXG4gIGxhYmVsOiBzdHJpbmdcbn0+ID0gW1xuICB7XG4gICAgdmFsdWU6ICd5ZXMtc2Vzc2lvbicsXG4gICAgbGFiZWw6ICdZZXMsIGZvciB0aGlzIHNlc3Npb24nLFxuICB9LFxuICB7XG4gICAgdmFsdWU6ICd5ZXMtcmVtZW1iZXInLFxuICAgIGxhYmVsOiAnWWVzLCBhbmQgcmVtZW1iZXIgdGhpcyBkaXJlY3RvcnknLFxuICB9LFxuICB7XG4gICAgdmFsdWU6ICdubycsXG4gICAgbGFiZWw6ICdObycsXG4gIH0sXG5dXG5cbmZ1bmN0aW9uIFBlcm1pc3Npb25EZXNjcmlwdGlvbigpOiBSZWFjdC5SZWFjdE5vZGUge1xuICByZXR1cm4gKFxuICAgIDxUZXh0IGRpbUNvbG9yPlxuICAgICAgQ2xhdWRlIENvZGUgd2lsbCBiZSBhYmxlIHRvIHJlYWQgZmlsZXMgaW4gdGhpcyBkaXJlY3RvcnkgYW5kIG1ha2UgZWRpdHNcbiAgICAgIHdoZW4gYXV0by1hY2NlcHQgZWRpdHMgaXMgb24uXG4gICAgPC9UZXh0PlxuICApXG59XG5cbmZ1bmN0aW9uIERpcmVjdG9yeURpc3BsYXkoeyBwYXRoIH06IHsgcGF0aDogc3RyaW5nIH0pOiBSZWFjdC5SZWFjdE5vZGUge1xuICByZXR1cm4gKFxuICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHBhZGRpbmdYPXsyfSBnYXA9ezF9PlxuICAgICAgPFRleHQgY29sb3I9XCJwZXJtaXNzaW9uXCI+e3BhdGh9PC9UZXh0PlxuICAgICAgPFBlcm1pc3Npb25EZXNjcmlwdGlvbiAvPlxuICAgIDwvQm94PlxuICApXG59XG5cbmZ1bmN0aW9uIERpcmVjdG9yeUlucHV0KHtcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlLFxuICBvblN1Ym1pdCxcbiAgZXJyb3IsXG4gIHN1Z2dlc3Rpb25zLFxuICBzZWxlY3RlZFN1Z2dlc3Rpb24sXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkXG4gIG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gdm9pZFxuICBlcnJvcjogc3RyaW5nIHwgbnVsbFxuICBzdWdnZXN0aW9uczogU3VnZ2VzdGlvbkl0ZW1bXVxuICBzZWxlY3RlZFN1Z2dlc3Rpb246IG51bWJlclxufSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICA8VGV4dD5FbnRlciB0aGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5OjwvVGV4dD5cbiAgICAgIDxCb3ggYm9yZGVyRGltQ29sb3IgYm9yZGVyU3R5bGU9XCJyb3VuZFwiIG1hcmdpblk9ezF9IHBhZGRpbmdMZWZ0PXsxfT5cbiAgICAgICAgPFRleHRJbnB1dFxuICAgICAgICAgIHNob3dDdXJzb3JcbiAgICAgICAgICBwbGFjZWhvbGRlcj17YERpcmVjdG9yeSBwYXRoJHtmaWd1cmVzLmVsbGlwc2lzfWB9XG4gICAgICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgICBvblN1Ym1pdD17b25TdWJtaXR9XG4gICAgICAgICAgY29sdW1ucz17ODB9XG4gICAgICAgICAgY3Vyc29yT2Zmc2V0PXt2YWx1ZS5sZW5ndGh9XG4gICAgICAgICAgb25DaGFuZ2VDdXJzb3JPZmZzZXQ9eygpID0+IHt9fVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG4gICAgICB7c3VnZ2VzdGlvbnMubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgIDxCb3ggbWFyZ2luQm90dG9tPXsxfT5cbiAgICAgICAgICA8UHJvbXB0SW5wdXRGb290ZXJTdWdnZXN0aW9uc1xuICAgICAgICAgICAgc3VnZ2VzdGlvbnM9e3N1Z2dlc3Rpb25zfVxuICAgICAgICAgICAgc2VsZWN0ZWRTdWdnZXN0aW9uPXtzZWxlY3RlZFN1Z2dlc3Rpb259XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgICAge2Vycm9yICYmIDxUZXh0IGNvbG9yPVwiZXJyb3JcIj57ZXJyb3J9PC9UZXh0Pn1cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkV29ya3NwYWNlRGlyZWN0b3J5KHtcbiAgb25BZGREaXJlY3RvcnksXG4gIG9uQ2FuY2VsLFxuICBwZXJtaXNzaW9uQ29udGV4dCxcbiAgZGlyZWN0b3J5UGF0aCxcbn06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW2RpcmVjdG9yeUlucHV0LCBzZXREaXJlY3RvcnlJbnB1dF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbc3VnZ2VzdGlvbnMsIHNldFN1Z2dlc3Rpb25zXSA9IHVzZVN0YXRlPFN1Z2dlc3Rpb25JdGVtW10+KFtdKVxuICBjb25zdCBbc2VsZWN0ZWRTdWdnZXN0aW9uLCBzZXRTZWxlY3RlZFN1Z2dlc3Rpb25dID0gdXNlU3RhdGUoMClcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gUkVNRU1CRVJfRElSRUNUT1JZX09QVElPTlMsIFtdKVxuXG4gIC8vIEZldGNoIGRpcmVjdG9yeSBjb21wbGV0aW9uc1xuICBjb25zdCBmZXRjaFN1Z2dlc3Rpb25zID0gdXNlQ2FsbGJhY2soYXN5bmMgKHBhdGg6IHN0cmluZykgPT4ge1xuICAgIGlmICghcGF0aCkge1xuICAgICAgc2V0U3VnZ2VzdGlvbnMoW10pXG4gICAgICBzZXRTZWxlY3RlZFN1Z2dlc3Rpb24oMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBjb21wbGV0aW9ucyA9IGF3YWl0IGdldERpcmVjdG9yeUNvbXBsZXRpb25zKHBhdGgpXG4gICAgc2V0U3VnZ2VzdGlvbnMoY29tcGxldGlvbnMpXG4gICAgc2V0U2VsZWN0ZWRTdWdnZXN0aW9uKDApXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGRlYm91bmNlZEZldGNoU3VnZ2VzdGlvbnMgPSB1c2VEZWJvdW5jZUNhbGxiYWNrKGZldGNoU3VnZ2VzdGlvbnMsIDEwMClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZvaWQgZGVib3VuY2VkRmV0Y2hTdWdnZXN0aW9ucyhkaXJlY3RvcnlJbnB1dClcbiAgfSwgW2RpcmVjdG9yeUlucHV0LCBkZWJvdW5jZWRGZXRjaFN1Z2dlc3Rpb25zXSlcblxuICBjb25zdCBhcHBseVN1Z2dlc3Rpb24gPSB1c2VDYWxsYmFjaygoc3VnZ2VzdGlvbjogU3VnZ2VzdGlvbkl0ZW0pID0+IHtcbiAgICBjb25zdCBuZXdQYXRoID0gc3VnZ2VzdGlvbi5pZCArICcvJ1xuICAgIHNldERpcmVjdG9yeUlucHV0KG5ld1BhdGgpXG4gICAgc2V0RXJyb3IobnVsbClcbiAgICAvLyBTdWdnZXN0aW9ucyB3aWxsIHVwZGF0ZSB2aWEgdGhlIHVzZUVmZmVjdFxuICB9LCBbXSlcblxuICAvLyBIYW5kbGUgZGlyZWN0b3J5IHN1Ym1pc3Npb24gZnJvbSBpbnB1dFxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyAobmV3UGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB2YWxpZGF0ZURpcmVjdG9yeUZvcldvcmtzcGFjZShcbiAgICAgICAgbmV3UGF0aCxcbiAgICAgICAgcGVybWlzc2lvbkNvbnRleHQsXG4gICAgICApXG5cbiAgICAgIGlmIChyZXN1bHQucmVzdWx0VHlwZSA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgIG9uQWRkRGlyZWN0b3J5KHJlc3VsdC5hYnNvbHV0ZVBhdGgsIGZhbHNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0RXJyb3IoYWRkRGlySGVscE1lc3NhZ2UocmVzdWx0KSlcbiAgICAgIH1cbiAgICB9LFxuICAgIFtwZXJtaXNzaW9uQ29udGV4dCwgb25BZGREaXJlY3RvcnldLFxuICApXG5cbiAgLy8gSGFuZGxlIEVzYyB0byBjYW5jZWwgKEN0cmwrQyBoYW5kbGVkIGJ5IGdsb2JhbCBrZXliaW5kaW5ncylcbiAgLy8gVXNlIFNldHRpbmdzIGNvbnRleHQgc28gJ24nIGtleSBkb2Vzbid0IGNhbmNlbCAoYWxsb3dzIHR5cGluZyAnbicgaW4gaW5wdXQpXG4gIHVzZUtleWJpbmRpbmcoJ2NvbmZpcm06bm8nLCBvbkNhbmNlbCwgeyBjb250ZXh0OiAnU2V0dGluZ3MnIH0pXG5cbiAgY29uc3QgaGFuZGxlS2V5RG93biA9IHVzZUNhbGxiYWNrKFxuICAgIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBUYWI6IGFjY2VwdCBzZWxlY3RlZCBzdWdnZXN0aW9uIGFuZCBjb250aW51ZSAoZm9yIGRyaWxsaW5nIGludG8gc3ViZGlycylcbiAgICAgICAgaWYgKGUua2V5ID09PSAndGFiJykge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBzdWdnZXN0aW9uc1tzZWxlY3RlZFN1Z2dlc3Rpb25dXG4gICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIGFwcGx5U3VnZ2VzdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVudGVyOiBhcHBseSBzZWxlY3RlZCBzdWdnZXN0aW9uIGFuZCBzdWJtaXRcbiAgICAgICAgaWYgKGUua2V5ID09PSAncmV0dXJuJykge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBzdWdnZXN0aW9uc1tzZWxlY3RlZFN1Z2dlc3Rpb25dXG4gICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIHZvaWQgaGFuZGxlU3VibWl0KHN1Z2dlc3Rpb24uaWQgKyAnLycpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUua2V5ID09PSAndXAnIHx8IChlLmN0cmwgJiYgZS5rZXkgPT09ICdwJykpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBzZXRTZWxlY3RlZFN1Z2dlc3Rpb24ocHJldiA9PlxuICAgICAgICAgICAgcHJldiA8PSAwID8gc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSA6IHByZXYgLSAxLFxuICAgICAgICAgIClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLmtleSA9PT0gJ2Rvd24nIHx8IChlLmN0cmwgJiYgZS5rZXkgPT09ICduJykpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBzZXRTZWxlY3RlZFN1Z2dlc3Rpb24ocHJldiA9PlxuICAgICAgICAgICAgcHJldiA+PSBzdWdnZXN0aW9ucy5sZW5ndGggLSAxID8gMCA6IHByZXYgKyAxLFxuICAgICAgICAgIClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgW3N1Z2dlc3Rpb25zLCBzZWxlY3RlZFN1Z2dlc3Rpb24sIGFwcGx5U3VnZ2VzdGlvbiwgaGFuZGxlU3VibWl0XSxcbiAgKVxuXG4gIGNvbnN0IGhhbmRsZVNlbGVjdCA9IHVzZUNhbGxiYWNrKFxuICAgICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoIWRpcmVjdG9yeVBhdGgpIHJldHVyblxuXG4gICAgICBjb25zdCBzZWxlY3Rpb25WYWx1ZSA9IHZhbHVlIGFzIFJlbWVtYmVyRGlyZWN0b3J5T3B0aW9uXG5cbiAgICAgIHN3aXRjaCAoc2VsZWN0aW9uVmFsdWUpIHtcbiAgICAgICAgY2FzZSAneWVzLXNlc3Npb24nOlxuICAgICAgICAgIG9uQWRkRGlyZWN0b3J5KGRpcmVjdG9yeVBhdGgsIGZhbHNlKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3llcy1yZW1lbWJlcic6XG4gICAgICAgICAgb25BZGREaXJlY3RvcnkoZGlyZWN0b3J5UGF0aCwgdHJ1ZSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdubyc6XG4gICAgICAgICAgb25DYW5jZWwoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSxcbiAgICBbZGlyZWN0b3J5UGF0aCwgb25BZGREaXJlY3RvcnksIG9uQ2FuY2VsXSxcbiAgKVxuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICB0YWJJbmRleD17MH1cbiAgICAgIGF1dG9Gb2N1c1xuICAgICAgb25LZXlEb3duPXtoYW5kbGVLZXlEb3dufVxuICAgID5cbiAgICAgIDxEaWFsb2dcbiAgICAgICAgdGl0bGU9XCJBZGQgZGlyZWN0b3J5IHRvIHdvcmtzcGFjZVwiXG4gICAgICAgIG9uQ2FuY2VsPXtvbkNhbmNlbH1cbiAgICAgICAgY29sb3I9XCJwZXJtaXNzaW9uXCJcbiAgICAgICAgaXNDYW5jZWxBY3RpdmU9e2ZhbHNlfVxuICAgICAgICBpbnB1dEd1aWRlPXtcbiAgICAgICAgICBkaXJlY3RvcnlQYXRoXG4gICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgOiBleGl0U3RhdGUgPT5cbiAgICAgICAgICAgICAgICBleGl0U3RhdGUucGVuZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxUZXh0PlByZXNzIHtleGl0U3RhdGUua2V5TmFtZX0gYWdhaW4gdG8gZXhpdDwvVGV4dD5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPEJ5bGluZT5cbiAgICAgICAgICAgICAgICAgICAgPEtleWJvYXJkU2hvcnRjdXRIaW50IHNob3J0Y3V0PVwiVGFiXCIgYWN0aW9uPVwiY29tcGxldGVcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8S2V5Ym9hcmRTaG9ydGN1dEhpbnQgc2hvcnRjdXQ9XCJFbnRlclwiIGFjdGlvbj1cImFkZFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgICAgICAgICAgICBhY3Rpb249XCJjb25maXJtOm5vXCJcbiAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0PVwiU2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrPVwiRXNjXCJcbiAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbj1cImNhbmNlbFwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L0J5bGluZT5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgID5cbiAgICAgICAge2RpcmVjdG9yeVBhdGggPyAoXG4gICAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfT5cbiAgICAgICAgICAgIDxEaXJlY3RvcnlEaXNwbGF5IHBhdGg9e2RpcmVjdG9yeVBhdGh9IC8+XG4gICAgICAgICAgICA8U2VsZWN0XG4gICAgICAgICAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVTZWxlY3R9XG4gICAgICAgICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBoYW5kbGVTZWxlY3QoJ25vJyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0gbWFyZ2luWD17Mn0+XG4gICAgICAgICAgICA8UGVybWlzc2lvbkRlc2NyaXB0aW9uIC8+XG4gICAgICAgICAgICA8RGlyZWN0b3J5SW5wdXRcbiAgICAgICAgICAgICAgdmFsdWU9e2RpcmVjdG9yeUlucHV0fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0RGlyZWN0b3J5SW5wdXR9XG4gICAgICAgICAgICAgIG9uU3VibWl0PXtoYW5kbGVTdWJtaXR9XG4gICAgICAgICAgICAgIGVycm9yPXtlcnJvcn1cbiAgICAgICAgICAgICAgc3VnZ2VzdGlvbnM9e3N1Z2dlc3Rpb25zfVxuICAgICAgICAgICAgICBzZWxlY3RlZFN1Z2dlc3Rpb249e3NlbGVjdGVkU3VnZ2VzdGlvbn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG4gICAgICA8L0RpYWxvZz5cbiAgICA8L0JveD5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsT0FBTyxNQUFNLFNBQVM7QUFDN0IsT0FBTyxLQUFLQyxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxXQUFXLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUNqRSxTQUFTQyxtQkFBbUIsUUFBUSxhQUFhO0FBQ2pELFNBQ0VDLGlCQUFpQixFQUNqQkMsNkJBQTZCLFFBQ3hCLHlDQUF5QztBQUNoRCxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELGNBQWNDLGFBQWEsUUFBUSx1Q0FBdUM7QUFDMUUsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLFFBQVEsaUJBQWlCO0FBQzNDLFNBQVNDLGFBQWEsUUFBUSx1Q0FBdUM7QUFDckUsY0FBY0MscUJBQXFCLFFBQVEsa0JBQWtCO0FBQzdELFNBQVNDLHVCQUF1QixRQUFRLG1EQUFtRDtBQUMzRixTQUFTQyx3QkFBd0IsUUFBUSxtQ0FBbUM7QUFDNUUsU0FBU0MsTUFBTSxRQUFRLDhCQUE4QjtBQUNyRCxTQUFTQyxNQUFNLFFBQVEsK0JBQStCO0FBQ3RELFNBQVNDLE1BQU0sUUFBUSwrQkFBK0I7QUFDdEQsU0FBU0Msb0JBQW9CLFFBQVEsNkNBQTZDO0FBQ2xGLFNBQ0VDLDRCQUE0QixFQUM1QixLQUFLQyxjQUFjLFFBQ2QsbURBQW1EO0FBRTFELEtBQUtDLEtBQUssR0FBRztFQUNYQyxjQUFjLEVBQUUsQ0FBQ0MsSUFBSSxFQUFFLE1BQU0sRUFBRUMsUUFBa0IsQ0FBVCxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUk7RUFDMURDLFFBQVEsRUFBRSxHQUFHLEdBQUcsSUFBSTtFQUNwQkMsaUJBQWlCLEVBQUVkLHFCQUFxQjtFQUN4Q2UsYUFBYSxDQUFDLEVBQUUsTUFBTSxFQUFDO0FBQ3pCLENBQUM7QUFFRCxLQUFLQyx1QkFBdUIsR0FBRyxhQUFhLEdBQUcsY0FBYyxHQUFHLElBQUk7QUFFcEUsTUFBTUMsMEJBQTBCLEVBQUVDLEtBQUssQ0FBQztFQUN0Q0MsS0FBSyxFQUFFSCx1QkFBdUI7RUFDOUJJLEtBQUssRUFBRSxNQUFNO0FBQ2YsQ0FBQyxDQUFDLEdBQUcsQ0FDSDtFQUNFRCxLQUFLLEVBQUUsYUFBYTtFQUNwQkMsS0FBSyxFQUFFO0FBQ1QsQ0FBQyxFQUNEO0VBQ0VELEtBQUssRUFBRSxjQUFjO0VBQ3JCQyxLQUFLLEVBQUU7QUFDVCxDQUFDLEVBQ0Q7RUFDRUQsS0FBSyxFQUFFLElBQUk7RUFDWEMsS0FBSyxFQUFFO0FBQ1QsQ0FBQyxDQUNGO0FBRUQsU0FBQUMsc0JBQUE7RUFBQSxNQUFBQyxDQUFBLEdBQUFDLEVBQUE7RUFBQSxJQUFBQyxFQUFBO0VBQUEsSUFBQUYsQ0FBQSxRQUFBRyxNQUFBLENBQUFDLEdBQUE7SUFFSUYsRUFBQSxJQUFDLElBQUksQ0FBQyxRQUFRLENBQVIsS0FBTyxDQUFDLENBQUMscUdBR2YsRUFIQyxJQUFJLENBR0U7SUFBQUYsQ0FBQSxNQUFBRSxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBRixDQUFBO0VBQUE7RUFBQSxPQUhQRSxFQUdPO0FBQUE7QUFJWCxTQUFBRyxpQkFBQUgsRUFBQTtFQUFBLE1BQUFGLENBQUEsR0FBQUMsRUFBQTtFQUEwQjtJQUFBWjtFQUFBLElBQUFhLEVBQTBCO0VBQUEsSUFBQUksRUFBQTtFQUFBLElBQUFOLENBQUEsUUFBQVgsSUFBQTtJQUc5Q2lCLEVBQUEsSUFBQyxJQUFJLENBQU8sS0FBWSxDQUFaLFlBQVksQ0FBRWpCLEtBQUcsQ0FBRSxFQUE5QixJQUFJLENBQWlDO0lBQUFXLENBQUEsTUFBQVgsSUFBQTtJQUFBVyxDQUFBLE1BQUFNLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUFOLENBQUE7RUFBQTtFQUFBLElBQUFPLEVBQUE7RUFBQSxJQUFBUCxDQUFBLFFBQUFHLE1BQUEsQ0FBQUMsR0FBQTtJQUN0Q0csRUFBQSxJQUFDLHFCQUFxQixHQUFHO0lBQUFQLENBQUEsTUFBQU8sRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQVAsQ0FBQTtFQUFBO0VBQUEsSUFBQVEsRUFBQTtFQUFBLElBQUFSLENBQUEsUUFBQU0sRUFBQTtJQUYzQkUsRUFBQSxJQUFDLEdBQUcsQ0FBZSxhQUFRLENBQVIsUUFBUSxDQUFXLFFBQUMsQ0FBRCxHQUFDLENBQU8sR0FBQyxDQUFELEdBQUMsQ0FDN0MsQ0FBQUYsRUFBcUMsQ0FDckMsQ0FBQUMsRUFBd0IsQ0FDMUIsRUFIQyxHQUFHLENBR0U7SUFBQVAsQ0FBQSxNQUFBTSxFQUFBO0lBQUFOLENBQUEsTUFBQVEsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQVIsQ0FBQTtFQUFBO0VBQUEsT0FITlEsRUFHTTtBQUFBO0FBSVYsU0FBQUMsZUFBQVAsRUFBQTtFQUFBLE1BQUFGLENBQUEsR0FBQUMsRUFBQTtFQUF3QjtJQUFBSixLQUFBO0lBQUFhLFFBQUE7SUFBQUMsUUFBQTtJQUFBQyxLQUFBO0lBQUFDLFdBQUE7SUFBQUM7RUFBQSxJQUFBWixFQWN2QjtFQUFBLElBQUFJLEVBQUE7RUFBQSxJQUFBTixDQUFBLFFBQUFHLE1BQUEsQ0FBQUMsR0FBQTtJQUdLRSxFQUFBLElBQUMsSUFBSSxDQUFDLGdDQUFnQyxFQUFyQyxJQUFJLENBQXdDO0lBQUFOLENBQUEsTUFBQU0sRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQU4sQ0FBQTtFQUFBO0VBQUEsSUFBQU8sRUFBQTtFQUFBLElBQUFQLENBQUEsUUFBQVUsUUFBQSxJQUFBVixDQUFBLFFBQUFXLFFBQUEsSUFBQVgsQ0FBQSxRQUFBSCxLQUFBO0lBQzdDVSxFQUFBLElBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBZCxLQUFhLENBQUMsQ0FBYSxXQUFPLENBQVAsT0FBTyxDQUFVLE9BQUMsQ0FBRCxHQUFDLENBQWUsV0FBQyxDQUFELEdBQUMsQ0FDaEUsQ0FBQyxTQUFTLENBQ1IsVUFBVSxDQUFWLEtBQVMsQ0FBQyxDQUNHLFdBQW1DLENBQW5DLGtCQUFpQjNDLE9BQU8sQ0FBQW1ELFFBQVMsRUFBQyxDQUFDLENBQ3pDbEIsS0FBSyxDQUFMQSxNQUFJLENBQUMsQ0FDRmEsUUFBUSxDQUFSQSxTQUFPLENBQUMsQ0FDUkMsUUFBUSxDQUFSQSxTQUFPLENBQUMsQ0FDVCxPQUFFLENBQUYsR0FBQyxDQUFDLENBQ0csWUFBWSxDQUFaLENBQUFkLEtBQUssQ0FBQW1CLE1BQU0sQ0FBQyxDQUNKLG9CQUFRLENBQVIsQ0FBQUMsS0FBTyxDQUFDLEdBRWxDLEVBWEMsR0FBRyxDQVdFO0lBQUFqQixDQUFBLE1BQUFVLFFBQUE7SUFBQVYsQ0FBQSxNQUFBVyxRQUFBO0lBQUFYLENBQUEsTUFBQUgsS0FBQTtJQUFBRyxDQUFBLE1BQUFPLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUFQLENBQUE7RUFBQTtFQUFBLElBQUFRLEVBQUE7RUFBQSxJQUFBUixDQUFBLFFBQUFjLGtCQUFBLElBQUFkLENBQUEsUUFBQWEsV0FBQTtJQUNMTCxFQUFBLEdBQUFLLFdBQVcsQ0FBQUcsTUFBTyxHQUFHLENBT3JCLElBTkMsQ0FBQyxHQUFHLENBQWUsWUFBQyxDQUFELEdBQUMsQ0FDbEIsQ0FBQyw0QkFBNEIsQ0FDZEgsV0FBVyxDQUFYQSxZQUFVLENBQUMsQ0FDSkMsa0JBQWtCLENBQWxCQSxtQkFBaUIsQ0FBQyxHQUUxQyxFQUxDLEdBQUcsQ0FNTDtJQUFBZCxDQUFBLE1BQUFjLGtCQUFBO0lBQUFkLENBQUEsTUFBQWEsV0FBQTtJQUFBYixDQUFBLE1BQUFRLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUFSLENBQUE7RUFBQTtFQUFBLElBQUFrQixFQUFBO0VBQUEsSUFBQWxCLENBQUEsUUFBQVksS0FBQTtJQUNBTSxFQUFBLEdBQUFOLEtBQTJDLElBQWxDLENBQUMsSUFBSSxDQUFPLEtBQU8sQ0FBUCxPQUFPLENBQUVBLE1BQUksQ0FBRSxFQUExQixJQUFJLENBQTZCO0lBQUFaLENBQUEsTUFBQVksS0FBQTtJQUFBWixDQUFBLE1BQUFrQixFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBbEIsQ0FBQTtFQUFBO0VBQUEsSUFBQW1CLEVBQUE7RUFBQSxJQUFBbkIsQ0FBQSxTQUFBTyxFQUFBLElBQUFQLENBQUEsU0FBQVEsRUFBQSxJQUFBUixDQUFBLFNBQUFrQixFQUFBO0lBdEI5Q0MsRUFBQSxJQUFDLEdBQUcsQ0FBZSxhQUFRLENBQVIsUUFBUSxDQUN6QixDQUFBYixFQUE0QyxDQUM1QyxDQUFBQyxFQVdLLENBQ0osQ0FBQUMsRUFPRCxDQUNDLENBQUFVLEVBQTBDLENBQzdDLEVBdkJDLEdBQUcsQ0F1QkU7SUFBQWxCLENBQUEsT0FBQU8sRUFBQTtJQUFBUCxDQUFBLE9BQUFRLEVBQUE7SUFBQVIsQ0FBQSxPQUFBa0IsRUFBQTtJQUFBbEIsQ0FBQSxPQUFBbUIsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQW5CLENBQUE7RUFBQTtFQUFBLE9BdkJObUIsRUF1Qk07QUFBQTtBQXZDVixTQUFBRixNQUFBO0FBMkNBLE9BQU8sU0FBQUcsc0JBQUFsQixFQUFBO0VBQUEsTUFBQUYsQ0FBQSxHQUFBQyxFQUFBO0VBQStCO0lBQUFiLGNBQUE7SUFBQUcsUUFBQTtJQUFBQyxpQkFBQTtJQUFBQztFQUFBLElBQUFTLEVBSzlCO0VBQ04sT0FBQW1CLGNBQUEsRUFBQUMsaUJBQUEsSUFBNENyRCxRQUFRLENBQUMsRUFBRSxDQUFDO0VBQ3hELE9BQUEyQyxLQUFBLEVBQUFXLFFBQUEsSUFBMEJ0RCxRQUFRLENBQWdCLElBQUksQ0FBQztFQUFBLElBQUFxQyxFQUFBO0VBQUEsSUFBQU4sQ0FBQSxRQUFBRyxNQUFBLENBQUFDLEdBQUE7SUFDVUUsRUFBQSxLQUFFO0lBQUFOLENBQUEsTUFBQU0sRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQU4sQ0FBQTtFQUFBO0VBQW5FLE9BQUFhLFdBQUEsRUFBQVcsY0FBQSxJQUFzQ3ZELFFBQVEsQ0FBbUJxQyxFQUFFLENBQUM7RUFDcEUsT0FBQVEsa0JBQUEsRUFBQVcscUJBQUEsSUFBb0R4RCxRQUFRLENBQUMsQ0FBQyxDQUFDO0VBQUEsSUFBQXNDLEVBQUE7RUFBQSxJQUFBUCxDQUFBLFFBQUFHLE1BQUEsQ0FBQUMsR0FBQTtJQUkxQkcsRUFBQSxTQUFBbEIsSUFBQTtNQUNuQyxJQUFJLENBQUNBLElBQUk7UUFDUG1DLGNBQWMsQ0FBQyxFQUFFLENBQUM7UUFDbEJDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUFBO01BQUE7TUFHMUIsTUFBQUMsV0FBQSxHQUFvQixNQUFNL0MsdUJBQXVCLENBQUNVLElBQUksQ0FBQztNQUN2RG1DLGNBQWMsQ0FBQ0UsV0FBVyxDQUFDO01BQzNCRCxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUN6QjtJQUFBekIsQ0FBQSxNQUFBTyxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBUCxDQUFBO0VBQUE7RUFURCxNQUFBMkIsZ0JBQUEsR0FBeUJwQixFQVNuQjtFQUVOLE1BQUFxQix5QkFBQSxHQUFrQzFELG1CQUFtQixDQUFDeUQsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDO0VBQUEsSUFBQW5CLEVBQUE7RUFBQSxJQUFBVSxFQUFBO0VBQUEsSUFBQWxCLENBQUEsUUFBQTRCLHlCQUFBLElBQUE1QixDQUFBLFFBQUFxQixjQUFBO0lBRWxFYixFQUFBLEdBQUFBLENBQUE7TUFDSG9CLHlCQUF5QixDQUFDUCxjQUFjLENBQUM7SUFBQSxDQUMvQztJQUFFSCxFQUFBLElBQUNHLGNBQWMsRUFBRU8seUJBQXlCLENBQUM7SUFBQTVCLENBQUEsTUFBQTRCLHlCQUFBO0lBQUE1QixDQUFBLE1BQUFxQixjQUFBO0lBQUFyQixDQUFBLE1BQUFRLEVBQUE7SUFBQVIsQ0FBQSxNQUFBa0IsRUFBQTtFQUFBO0lBQUFWLEVBQUEsR0FBQVIsQ0FBQTtJQUFBa0IsRUFBQSxHQUFBbEIsQ0FBQTtFQUFBO0VBRjlDakMsU0FBUyxDQUFDeUMsRUFFVCxFQUFFVSxFQUEyQyxDQUFDO0VBQUEsSUFBQUMsRUFBQTtFQUFBLElBQUFuQixDQUFBLFFBQUFHLE1BQUEsQ0FBQUMsR0FBQTtJQUVYZSxFQUFBLEdBQUFVLFVBQUE7TUFDbEMsTUFBQUMsT0FBQSxHQUFnQkQsVUFBVSxDQUFBRSxFQUFHLEdBQUcsR0FBRztNQUNuQ1QsaUJBQWlCLENBQUNRLE9BQU8sQ0FBQztNQUMxQlAsUUFBUSxDQUFDLElBQUksQ0FBQztJQUFBLENBRWY7SUFBQXZCLENBQUEsTUFBQW1CLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUFuQixDQUFBO0VBQUE7RUFMRCxNQUFBZ0MsZUFBQSxHQUF3QmIsRUFLbEI7RUFBQSxJQUFBYyxFQUFBO0VBQUEsSUFBQWpDLENBQUEsUUFBQVosY0FBQSxJQUFBWSxDQUFBLFFBQUFSLGlCQUFBO0lBSUp5QyxFQUFBLFNBQUFDLFNBQUE7TUFDRSxNQUFBQyxNQUFBLEdBQWUsTUFBTS9ELDZCQUE2QixDQUNoRDBELFNBQU8sRUFDUHRDLGlCQUNGLENBQUM7TUFFRCxJQUFJMkMsTUFBTSxDQUFBQyxVQUFXLEtBQUssU0FBUztRQUNqQ2hELGNBQWMsQ0FBQytDLE1BQU0sQ0FBQUUsWUFBYSxFQUFFLEtBQUssQ0FBQztNQUFBO1FBRTFDZCxRQUFRLENBQUNwRCxpQkFBaUIsQ0FBQ2dFLE1BQU0sQ0FBQyxDQUFDO01BQUE7SUFDcEMsQ0FDRjtJQUFBbkMsQ0FBQSxNQUFBWixjQUFBO0lBQUFZLENBQUEsTUFBQVIsaUJBQUE7SUFBQVEsQ0FBQSxNQUFBaUMsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQWpDLENBQUE7RUFBQTtFQVpILE1BQUFzQyxZQUFBLEdBQXFCTCxFQWNwQjtFQUFBLElBQUFNLEVBQUE7RUFBQSxJQUFBdkMsQ0FBQSxTQUFBRyxNQUFBLENBQUFDLEdBQUE7SUFJcUNtQyxFQUFBO01BQUFDLE9BQUEsRUFBVztJQUFXLENBQUM7SUFBQXhDLENBQUEsT0FBQXVDLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUF2QyxDQUFBO0VBQUE7RUFBN0R2QixhQUFhLENBQUMsWUFBWSxFQUFFYyxRQUFRLEVBQUVnRCxFQUF1QixDQUFDO0VBQUEsSUFBQUUsRUFBQTtFQUFBLElBQUF6QyxDQUFBLFNBQUFzQyxZQUFBLElBQUF0QyxDQUFBLFNBQUFjLGtCQUFBLElBQUFkLENBQUEsU0FBQWEsV0FBQTtJQUc1RDRCLEVBQUEsR0FBQUMsQ0FBQTtNQUNFLElBQUk3QixXQUFXLENBQUFHLE1BQU8sR0FBRyxDQUFDO1FBRXhCLElBQUkwQixDQUFDLENBQUFDLEdBQUksS0FBSyxLQUFLO1VBQ2pCRCxDQUFDLENBQUFFLGNBQWUsQ0FBQyxDQUFDO1VBQ2xCLE1BQUFDLFlBQUEsR0FBbUJoQyxXQUFXLENBQUNDLGtCQUFrQixDQUFDO1VBQ2xELElBQUllLFlBQVU7WUFDWkcsZUFBZSxDQUFDSCxZQUFVLENBQUM7VUFBQTtVQUM1QjtRQUFBO1FBS0gsSUFBSWEsQ0FBQyxDQUFBQyxHQUFJLEtBQUssUUFBUTtVQUNwQkQsQ0FBQyxDQUFBRSxjQUFlLENBQUMsQ0FBQztVQUNsQixNQUFBRSxZQUFBLEdBQW1CakMsV0FBVyxDQUFDQyxrQkFBa0IsQ0FBQztVQUNsRCxJQUFJZSxZQUFVO1lBQ1BTLFlBQVksQ0FBQ1QsWUFBVSxDQUFBRSxFQUFHLEdBQUcsR0FBRyxDQUFDO1VBQUE7VUFDdkM7UUFBQTtRQUlILElBQUlXLENBQUMsQ0FBQUMsR0FBSSxLQUFLLElBQWlDLElBQXhCRCxDQUFDLENBQUFLLElBQXNCLElBQWJMLENBQUMsQ0FBQUMsR0FBSSxLQUFLLEdBQUk7VUFDN0NELENBQUMsQ0FBQUUsY0FBZSxDQUFDLENBQUM7VUFDbEJuQixxQkFBcUIsQ0FBQ3VCLElBQUEsSUFDcEJBLElBQUksSUFBSSxDQUFxQyxHQUFqQ25DLFdBQVcsQ0FBQUcsTUFBTyxHQUFHLENBQVksR0FBUmdDLElBQUksR0FBRyxDQUM5QyxDQUFDO1VBQUE7UUFBQTtRQUlILElBQUlOLENBQUMsQ0FBQUMsR0FBSSxLQUFLLE1BQW1DLElBQXhCRCxDQUFDLENBQUFLLElBQXNCLElBQWJMLENBQUMsQ0FBQUMsR0FBSSxLQUFLLEdBQUk7VUFDL0NELENBQUMsQ0FBQUUsY0FBZSxDQUFDLENBQUM7VUFDbEJuQixxQkFBcUIsQ0FBQ3dCLE1BQUEsSUFDcEJELE1BQUksSUFBSW5DLFdBQVcsQ0FBQUcsTUFBTyxHQUFHLENBQWdCLEdBQTdDLENBQTZDLEdBQVJnQyxNQUFJLEdBQUcsQ0FDOUMsQ0FBQztVQUFBO1FBQUE7TUFFRjtJQUNGLENBQ0Y7SUFBQWhELENBQUEsT0FBQXNDLFlBQUE7SUFBQXRDLENBQUEsT0FBQWMsa0JBQUE7SUFBQWQsQ0FBQSxPQUFBYSxXQUFBO0lBQUFiLENBQUEsT0FBQXlDLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUF6QyxDQUFBO0VBQUE7RUF2Q0gsTUFBQWtELGFBQUEsR0FBc0JULEVBeUNyQjtFQUFBLElBQUFVLEVBQUE7RUFBQSxJQUFBbkQsQ0FBQSxTQUFBUCxhQUFBLElBQUFPLENBQUEsU0FBQVosY0FBQSxJQUFBWSxDQUFBLFNBQUFULFFBQUE7SUFHQzRELEVBQUEsR0FBQXRELEtBQUE7TUFDRSxJQUFJLENBQUNKLGFBQWE7UUFBQTtNQUFBO01BRWxCLE1BQUEyRCxjQUFBLEdBQXVCdkQsS0FBSyxJQUFJSCx1QkFBdUI7TUFBQTJELElBQUEsRUFFdkQsUUFBUUQsY0FBYztRQUFBLEtBQ2YsYUFBYTtVQUFBO1lBQ2hCaEUsY0FBYyxDQUFDSyxhQUFhLEVBQUUsS0FBSyxDQUFDO1lBQ3BDLE1BQUE0RCxJQUFBO1VBQUs7UUFBQSxLQUNGLGNBQWM7VUFBQTtZQUNqQmpFLGNBQWMsQ0FBQ0ssYUFBYSxFQUFFLElBQUksQ0FBQztZQUNuQyxNQUFBNEQsSUFBQTtVQUFLO1FBQUEsS0FDRixJQUFJO1VBQUE7WUFDUDlELFFBQVEsQ0FBQyxDQUFDO1VBQUE7TUFFZDtJQUFDLENBQ0Y7SUFBQVMsQ0FBQSxPQUFBUCxhQUFBO0lBQUFPLENBQUEsT0FBQVosY0FBQTtJQUFBWSxDQUFBLE9BQUFULFFBQUE7SUFBQVMsQ0FBQSxPQUFBbUQsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQW5ELENBQUE7RUFBQTtFQWpCSCxNQUFBc0QsWUFBQSxHQUFxQkgsRUFtQnBCO0VBZU8sTUFBQUksR0FBQSxHQUFBOUQsYUFBYSxHQUFiK0QsU0FnQk8sR0FoQlBDLE1BZ0JPO0VBQUEsSUFBQUMsR0FBQTtFQUFBLElBQUExRCxDQUFBLFNBQUFxQixjQUFBLElBQUFyQixDQUFBLFNBQUFQLGFBQUEsSUFBQU8sQ0FBQSxTQUFBWSxLQUFBLElBQUFaLENBQUEsU0FBQXNELFlBQUEsSUFBQXRELENBQUEsU0FBQXNDLFlBQUEsSUFBQXRDLENBQUEsU0FBQWMsa0JBQUEsSUFBQWQsQ0FBQSxTQUFBYSxXQUFBO0lBR1I2QyxHQUFBLEdBQUFqRSxhQUFhLEdBQ1osQ0FBQyxHQUFHLENBQWUsYUFBUSxDQUFSLFFBQVEsQ0FBTSxHQUFDLENBQUQsR0FBQyxDQUNoQyxDQUFDLGdCQUFnQixDQUFPQSxJQUFhLENBQWJBLGNBQVksQ0FBQyxHQUNyQyxDQUFDLE1BQU0sQ0FDSWtFLE9BQU8sQ0FBUEEsQ0FwSlNoRSwwQkFvSkgsQ0FBQyxDQUNOMkQsUUFBWSxDQUFaQSxhQUFXLENBQUMsQ0FDWixRQUF3QixDQUF4QixPQUFNQSxZQUFZLENBQUMsSUFBSSxFQUFDLEdBRXRDLEVBUEMsR0FBRyxDQW9CTCxHQVhDLENBQUMsR0FBRyxDQUFlLGFBQVEsQ0FBUixRQUFRLENBQU0sR0FBQyxDQUFELEdBQUMsQ0FBVyxPQUFDLENBQUQsR0FBQyxDQUM1QyxDQUFDLHFCQUFxQixHQUN0QixDQUFDLGNBQWMsQ0FDTmpDLEtBQWMsQ0FBZEEsZUFBYSxDQUFDLENBQ1hDLFFBQWlCLENBQWpCQSxrQkFBZ0IsQ0FBQyxDQUNqQmdCLFFBQVksQ0FBWkEsYUFBVyxDQUFDLENBQ2YxQixLQUFLLENBQUxBLE1BQUksQ0FBQyxDQUNDQyxXQUFXLENBQVhBLFlBQVUsQ0FBQyxDQUNKQyxrQkFBa0IsQ0FBbEJBLG1CQUFpQixDQUFDLEdBRTFDLEVBVkMsR0FBRyxDQVdMO0lBQUFkLENBQUEsT0FBQXFCLGNBQUE7SUFBQXJCLENBQUEsT0FBQVAsYUFBQTtJQUFBTyxDQUFBLE9BQUFZLEtBQUE7SUFBQVosQ0FBQSxPQUFBc0QsWUFBQTtJQUFBdEQsQ0FBQSxPQUFBc0MsWUFBQTtJQUFBdEMsQ0FBQSxPQUFBYyxrQkFBQTtJQUFBZCxDQUFBLE9BQUFhLFdBQUE7SUFBQWIsQ0FBQSxPQUFBMEQsR0FBQTtFQUFBO0lBQUFBLEdBQUEsR0FBQTFELENBQUE7RUFBQTtFQUFBLElBQUE0RCxHQUFBO0VBQUEsSUFBQTVELENBQUEsU0FBQVQsUUFBQSxJQUFBUyxDQUFBLFNBQUF1RCxHQUFBLElBQUF2RCxDQUFBLFNBQUEwRCxHQUFBO0lBOUNIRSxHQUFBLElBQUMsTUFBTSxDQUNDLEtBQTRCLENBQTVCLDRCQUE0QixDQUN4QnJFLFFBQVEsQ0FBUkEsU0FBTyxDQUFDLENBQ1osS0FBWSxDQUFaLFlBQVksQ0FDRixjQUFLLENBQUwsTUFBSSxDQUFDLENBRW5CLFVBZ0JPLENBaEJQLENBQUFnRSxHQWdCTSxDQUFDLENBR1IsQ0FBQUcsR0FxQkQsQ0FDRixFQS9DQyxNQUFNLENBK0NFO0lBQUExRCxDQUFBLE9BQUFULFFBQUE7SUFBQVMsQ0FBQSxPQUFBdUQsR0FBQTtJQUFBdkQsQ0FBQSxPQUFBMEQsR0FBQTtJQUFBMUQsQ0FBQSxPQUFBNEQsR0FBQTtFQUFBO0lBQUFBLEdBQUEsR0FBQTVELENBQUE7RUFBQTtFQUFBLElBQUE2RCxHQUFBO0VBQUEsSUFBQTdELENBQUEsU0FBQWtELGFBQUEsSUFBQWxELENBQUEsU0FBQTRELEdBQUE7SUFyRFhDLEdBQUEsSUFBQyxHQUFHLENBQ1ksYUFBUSxDQUFSLFFBQVEsQ0FDWixRQUFDLENBQUQsR0FBQyxDQUNYLFNBQVMsQ0FBVCxLQUFRLENBQUMsQ0FDRVgsU0FBYSxDQUFiQSxjQUFZLENBQUMsQ0FFeEIsQ0FBQVUsR0ErQ1EsQ0FDVixFQXREQyxHQUFHLENBc0RFO0lBQUE1RCxDQUFBLE9BQUFrRCxhQUFBO0lBQUFsRCxDQUFBLE9BQUE0RCxHQUFBO0lBQUE1RCxDQUFBLE9BQUE2RCxHQUFBO0VBQUE7SUFBQUEsR0FBQSxHQUFBN0QsQ0FBQTtFQUFBO0VBQUEsT0F0RE42RCxHQXNETTtBQUFBO0FBakxILFNBQUFKLE9BQUFLLFNBQUE7RUFBQSxPQTBJU0EsU0FBUyxDQUFBQyxPQWFSLEdBWkMsQ0FBQyxJQUFJLENBQUMsTUFBTyxDQUFBRCxTQUFTLENBQUFFLE9BQU8sQ0FBRSxjQUFjLEVBQTVDLElBQUksQ0FZTixHQVZDLENBQUMsTUFBTSxDQUNMLENBQUMsb0JBQW9CLENBQVUsUUFBSyxDQUFMLEtBQUssQ0FBUSxNQUFVLENBQVYsVUFBVSxHQUN0RCxDQUFDLG9CQUFvQixDQUFVLFFBQU8sQ0FBUCxPQUFPLENBQVEsTUFBSyxDQUFMLEtBQUssR0FDbkQsQ0FBQyx3QkFBd0IsQ0FDaEIsTUFBWSxDQUFaLFlBQVksQ0FDWCxPQUFVLENBQVYsVUFBVSxDQUNULFFBQUssQ0FBTCxLQUFLLENBQ0YsV0FBUSxDQUFSLFFBQVEsR0FFeEIsRUFUQyxNQUFNLENBVVI7QUFBQSIsImlnbm9yZUxpc3QiOltdfQ==
