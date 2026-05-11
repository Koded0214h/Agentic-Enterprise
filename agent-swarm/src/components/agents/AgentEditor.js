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
exports.AgentEditor = AgentEditor;
var chalk_1 = require("chalk");
var figures_1 = require("figures");
var React = require("react");
var react_1 = require("react");
var AppState_js_1 = require("src/state/AppState.js");
var ink_js_1 = require("../../ink.js");
var useKeybinding_js_1 = require("../../keybindings/useKeybinding.js");
var agentColorManager_js_1 = require("../../tools/AgentTool/agentColorManager.js");
var loadAgentsDir_js_1 = require("../../tools/AgentTool/loadAgentsDir.js");
var promptEditor_js_1 = require("../../utils/promptEditor.js");
var agentFileUtils_js_1 = require("./agentFileUtils.js");
var ColorPicker_js_1 = require("./ColorPicker.js");
var ModelSelector_js_1 = require("./ModelSelector.js");
var ToolSelector_js_1 = require("./ToolSelector.js");
var utils_js_1 = require("./utils.js");
function AgentEditor(_a) {
    var _this = this;
    var agent = _a.agent, tools = _a.tools, onSaved = _a.onSaved, onBack = _a.onBack;
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var _b = (0, react_1.useState)('menu'), editMode = _b[0], setEditMode = _b[1];
    var _c = (0, react_1.useState)(0), selectedMenuIndex = _c[0], setSelectedMenuIndex = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(agent.color), selectedColor = _e[0], setSelectedColor = _e[1];
    var handleOpenInEditor = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var filePath, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = (0, agentFileUtils_js_1.getActualAgentFilePath)(agent);
                    return [4 /*yield*/, (0, promptEditor_js_1.editFileInEditor)(filePath)];
                case 1:
                    result = _a.sent();
                    if (result.error) {
                        setError(result.error);
                    }
                    else {
                        onSaved("Opened ".concat(agent.agentType, " in editor. If you made edits, restart to load the latest version."));
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [agent, onSaved]);
    var handleSave = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (changes) {
            var newTools, newColor, newModel, finalColor, hasToolsChanged, hasModelChanged, hasColorChanged, err_1;
            if (changes === void 0) { changes = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newTools = changes.tools, newColor = changes.color, newModel = changes.model;
                        finalColor = newColor !== null && newColor !== void 0 ? newColor : selectedColor;
                        hasToolsChanged = newTools !== undefined;
                        hasModelChanged = newModel !== undefined;
                        hasColorChanged = finalColor !== agent.color;
                        if (!hasToolsChanged && !hasModelChanged && !hasColorChanged) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Only custom/plugin agents can be edited
                        // this is for type safety; the UI shouldn't allow editing otherwise
                        if (!(0, loadAgentsDir_js_1.isCustomAgent)(agent) && !(0, loadAgentsDir_js_1.isPluginAgent)(agent)) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, (0, agentFileUtils_js_1.updateAgentFile)(agent, agent.whenToUse, newTools !== null && newTools !== void 0 ? newTools : agent.tools, agent.getSystemPrompt(), finalColor, newModel !== null && newModel !== void 0 ? newModel : agent.model)];
                    case 2:
                        _a.sent();
                        if (hasColorChanged && finalColor) {
                            (0, agentColorManager_js_1.setAgentColor)(agent.agentType, finalColor);
                        }
                        setAppState(function (state) {
                            var allAgents = state.agentDefinitions.allAgents.map(function (a) { return a.agentType === agent.agentType ? __assign(__assign({}, a), { tools: newTools !== null && newTools !== void 0 ? newTools : a.tools, color: finalColor, model: newModel !== null && newModel !== void 0 ? newModel : a.model }) : a; });
                            return __assign(__assign({}, state), { agentDefinitions: __assign(__assign({}, state.agentDefinitions), { activeAgents: (0, loadAgentsDir_js_1.getActiveAgentsFromList)(allAgents), allAgents: allAgents }) });
                        });
                        onSaved("Updated agent: ".concat(chalk_1.default.bold(agent.agentType)));
                        return [2 /*return*/, true];
                    case 3:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error ? err_1.message : 'Failed to save agent');
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }, [agent, selectedColor, onSaved, setAppState]);
    var menuItems = (0, react_1.useMemo)(function () { return [{
            label: 'Open in editor',
            action: handleOpenInEditor
        }, {
            label: 'Edit tools',
            action: function () { return setEditMode('edit-tools'); }
        }, {
            label: 'Edit model',
            action: function () { return setEditMode('edit-model'); }
        }, {
            label: 'Edit color',
            action: function () { return setEditMode('edit-color'); }
        }]; }, [handleOpenInEditor]);
    var handleEscape = (0, react_1.useCallback)(function () {
        setError(null);
        if (editMode === 'menu') {
            onBack();
        }
        else {
            setEditMode('menu');
        }
    }, [editMode, onBack]);
    var handleMenuKeyDown = (0, react_1.useCallback)(function (e) {
        if (e.key === 'up') {
            e.preventDefault();
            setSelectedMenuIndex(function (index) { return Math.max(0, index - 1); });
        }
        else if (e.key === 'down') {
            e.preventDefault();
            setSelectedMenuIndex(function (index_0) { return Math.min(menuItems.length - 1, index_0 + 1); });
        }
        else if (e.key === 'return') {
            e.preventDefault();
            var selectedItem = menuItems[selectedMenuIndex];
            if (selectedItem) {
                void selectedItem.action();
            }
        }
    }, [menuItems, selectedMenuIndex]);
    (0, useKeybinding_js_1.useKeybinding)('confirm:no', handleEscape, {
        context: 'Confirmation'
    });
    var renderMenu = function () { return <ink_js_1.Box flexDirection="column" tabIndex={0} autoFocus onKeyDown={handleMenuKeyDown}>
      <ink_js_1.Text dimColor>Source: {(0, utils_js_1.getAgentSourceDisplayName)(agent.source)}</ink_js_1.Text>

      <ink_js_1.Box marginTop={1} flexDirection="column">
        {menuItems.map(function (item, index_1) { return <ink_js_1.Text key={item.label} color={index_1 === selectedMenuIndex ? 'suggestion' : undefined}>
            {index_1 === selectedMenuIndex ? "".concat(figures_1.default.pointer, " ") : '  '}
            {item.label}
          </ink_js_1.Text>; })}
      </ink_js_1.Box>

      {error && <ink_js_1.Box marginTop={1}>
          <ink_js_1.Text color="error">{error}</ink_js_1.Text>
        </ink_js_1.Box>}
    </ink_js_1.Box>; };
    switch (editMode) {
        case 'menu':
            return renderMenu();
        case 'edit-tools':
            return <ToolSelector_js_1.ToolSelector tools={tools} initialTools={agent.tools} onComplete={function (finalTools) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setEditMode('menu');
                                return [4 /*yield*/, handleSave({
                                        tools: finalTools
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }}/>;
        case 'edit-color':
            return <ColorPicker_js_1.ColorPicker agentName={agent.agentType} currentColor={selectedColor || agent.color || 'automatic'} onConfirm={function (color) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setSelectedColor(color);
                                setEditMode('menu');
                                return [4 /*yield*/, handleSave({
                                        color: color
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }}/>;
        case 'edit-model':
            return <ModelSelector_js_1.ModelSelector initialModel={agent.model} onComplete={function (model) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setEditMode('menu');
                                return [4 /*yield*/, handleSave({
                                        model: model
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }}/>;
        default:
            return null;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsImZpZ3VyZXMiLCJSZWFjdCIsInVzZUNhbGxiYWNrIiwidXNlTWVtbyIsInVzZVN0YXRlIiwidXNlU2V0QXBwU3RhdGUiLCJLZXlib2FyZEV2ZW50IiwiQm94IiwiVGV4dCIsInVzZUtleWJpbmRpbmciLCJUb29scyIsIkFnZW50Q29sb3JOYW1lIiwic2V0QWdlbnRDb2xvciIsIkFnZW50RGVmaW5pdGlvbiIsImdldEFjdGl2ZUFnZW50c0Zyb21MaXN0IiwiaXNDdXN0b21BZ2VudCIsImlzUGx1Z2luQWdlbnQiLCJlZGl0RmlsZUluRWRpdG9yIiwiZ2V0QWN0dWFsQWdlbnRGaWxlUGF0aCIsInVwZGF0ZUFnZW50RmlsZSIsIkNvbG9yUGlja2VyIiwiTW9kZWxTZWxlY3RvciIsIlRvb2xTZWxlY3RvciIsImdldEFnZW50U291cmNlRGlzcGxheU5hbWUiLCJQcm9wcyIsImFnZW50IiwidG9vbHMiLCJvblNhdmVkIiwibWVzc2FnZSIsIm9uQmFjayIsIkVkaXRNb2RlIiwiU2F2ZUNoYW5nZXMiLCJjb2xvciIsIm1vZGVsIiwiQWdlbnRFZGl0b3IiLCJSZWFjdE5vZGUiLCJzZXRBcHBTdGF0ZSIsImVkaXRNb2RlIiwic2V0RWRpdE1vZGUiLCJzZWxlY3RlZE1lbnVJbmRleCIsInNldFNlbGVjdGVkTWVudUluZGV4IiwiZXJyb3IiLCJzZXRFcnJvciIsInNlbGVjdGVkQ29sb3IiLCJzZXRTZWxlY3RlZENvbG9yIiwiaGFuZGxlT3BlbkluRWRpdG9yIiwiZmlsZVBhdGgiLCJyZXN1bHQiLCJhZ2VudFR5cGUiLCJoYW5kbGVTYXZlIiwiY2hhbmdlcyIsIm5ld1Rvb2xzIiwibmV3Q29sb3IiLCJuZXdNb2RlbCIsImZpbmFsQ29sb3IiLCJoYXNUb29sc0NoYW5nZWQiLCJ1bmRlZmluZWQiLCJoYXNNb2RlbENoYW5nZWQiLCJoYXNDb2xvckNoYW5nZWQiLCJ3aGVuVG9Vc2UiLCJnZXRTeXN0ZW1Qcm9tcHQiLCJzdGF0ZSIsImFsbEFnZW50cyIsImFnZW50RGVmaW5pdGlvbnMiLCJtYXAiLCJhIiwiYWN0aXZlQWdlbnRzIiwiYm9sZCIsImVyciIsIkVycm9yIiwibWVudUl0ZW1zIiwibGFiZWwiLCJhY3Rpb24iLCJoYW5kbGVFc2NhcGUiLCJoYW5kbGVNZW51S2V5RG93biIsImUiLCJrZXkiLCJwcmV2ZW50RGVmYXVsdCIsImluZGV4IiwiTWF0aCIsIm1heCIsIm1pbiIsImxlbmd0aCIsInNlbGVjdGVkSXRlbSIsImNvbnRleHQiLCJyZW5kZXJNZW51Iiwic291cmNlIiwiaXRlbSIsInBvaW50ZXIiLCJmaW5hbFRvb2xzIl0sInNvdXJjZXMiOlsiQWdlbnRFZGl0b3IudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsaydcbmltcG9ydCBmaWd1cmVzIGZyb20gJ2ZpZ3VyZXMnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VNZW1vLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlU2V0QXBwU3RhdGUgfSBmcm9tICdzcmMvc3RhdGUvQXBwU3RhdGUuanMnXG5pbXBvcnQgdHlwZSB7IEtleWJvYXJkRXZlbnQgfSBmcm9tICcuLi8uLi9pbmsvZXZlbnRzL2tleWJvYXJkLWV2ZW50LmpzJ1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnLi4vLi4vaW5rLmpzJ1xuaW1wb3J0IHsgdXNlS2V5YmluZGluZyB9IGZyb20gJy4uLy4uL2tleWJpbmRpbmdzL3VzZUtleWJpbmRpbmcuanMnXG5pbXBvcnQgdHlwZSB7IFRvb2xzIH0gZnJvbSAnLi4vLi4vVG9vbC5qcydcbmltcG9ydCB7XG4gIHR5cGUgQWdlbnRDb2xvck5hbWUsXG4gIHNldEFnZW50Q29sb3IsXG59IGZyb20gJy4uLy4uL3Rvb2xzL0FnZW50VG9vbC9hZ2VudENvbG9yTWFuYWdlci5qcydcbmltcG9ydCB7XG4gIHR5cGUgQWdlbnREZWZpbml0aW9uLFxuICBnZXRBY3RpdmVBZ2VudHNGcm9tTGlzdCxcbiAgaXNDdXN0b21BZ2VudCxcbiAgaXNQbHVnaW5BZ2VudCxcbn0gZnJvbSAnLi4vLi4vdG9vbHMvQWdlbnRUb29sL2xvYWRBZ2VudHNEaXIuanMnXG5pbXBvcnQgeyBlZGl0RmlsZUluRWRpdG9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvcHJvbXB0RWRpdG9yLmpzJ1xuaW1wb3J0IHsgZ2V0QWN0dWFsQWdlbnRGaWxlUGF0aCwgdXBkYXRlQWdlbnRGaWxlIH0gZnJvbSAnLi9hZ2VudEZpbGVVdGlscy5qcydcbmltcG9ydCB7IENvbG9yUGlja2VyIH0gZnJvbSAnLi9Db2xvclBpY2tlci5qcydcbmltcG9ydCB7IE1vZGVsU2VsZWN0b3IgfSBmcm9tICcuL01vZGVsU2VsZWN0b3IuanMnXG5pbXBvcnQgeyBUb29sU2VsZWN0b3IgfSBmcm9tICcuL1Rvb2xTZWxlY3Rvci5qcydcbmltcG9ydCB7IGdldEFnZW50U291cmNlRGlzcGxheU5hbWUgfSBmcm9tICcuL3V0aWxzLmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBhZ2VudDogQWdlbnREZWZpbml0aW9uXG4gIHRvb2xzOiBUb29sc1xuICBvblNhdmVkOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkXG4gIG9uQmFjazogKCkgPT4gdm9pZFxufVxuXG50eXBlIEVkaXRNb2RlID0gJ21lbnUnIHwgJ2VkaXQtdG9vbHMnIHwgJ2VkaXQtY29sb3InIHwgJ2VkaXQtbW9kZWwnXG5cbnR5cGUgU2F2ZUNoYW5nZXMgPSB7XG4gIHRvb2xzPzogc3RyaW5nW11cbiAgY29sb3I/OiBBZ2VudENvbG9yTmFtZVxuICBtb2RlbD86IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWdlbnRFZGl0b3Ioe1xuICBhZ2VudCxcbiAgdG9vbHMsXG4gIG9uU2F2ZWQsXG4gIG9uQmFjayxcbn06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3Qgc2V0QXBwU3RhdGUgPSB1c2VTZXRBcHBTdGF0ZSgpXG4gIGNvbnN0IFtlZGl0TW9kZSwgc2V0RWRpdE1vZGVdID0gdXNlU3RhdGU8RWRpdE1vZGU+KCdtZW51JylcbiAgY29uc3QgW3NlbGVjdGVkTWVudUluZGV4LCBzZXRTZWxlY3RlZE1lbnVJbmRleF0gPSB1c2VTdGF0ZSgwKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZENvbG9yLCBzZXRTZWxlY3RlZENvbG9yXSA9IHVzZVN0YXRlPFxuICAgIEFnZW50Q29sb3JOYW1lIHwgdW5kZWZpbmVkXG4gID4oYWdlbnQuY29sb3IgYXMgQWdlbnRDb2xvck5hbWUgfCB1bmRlZmluZWQpXG5cbiAgY29uc3QgaGFuZGxlT3BlbkluRWRpdG9yID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0QWN0dWFsQWdlbnRGaWxlUGF0aChhZ2VudClcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBlZGl0RmlsZUluRWRpdG9yKGZpbGVQYXRoKVxuXG4gICAgaWYgKHJlc3VsdC5lcnJvcikge1xuICAgICAgc2V0RXJyb3IocmVzdWx0LmVycm9yKVxuICAgIH0gZWxzZSB7XG4gICAgICBvblNhdmVkKFxuICAgICAgICBgT3BlbmVkICR7YWdlbnQuYWdlbnRUeXBlfSBpbiBlZGl0b3IuIElmIHlvdSBtYWRlIGVkaXRzLCByZXN0YXJ0IHRvIGxvYWQgdGhlIGxhdGVzdCB2ZXJzaW9uLmAsXG4gICAgICApXG4gICAgfVxuICB9LCBbYWdlbnQsIG9uU2F2ZWRdKVxuXG4gIGNvbnN0IGhhbmRsZVNhdmUgPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyAoY2hhbmdlczogU2F2ZUNoYW5nZXMgPSB7fSkgPT4ge1xuICAgICAgY29uc3QgeyB0b29sczogbmV3VG9vbHMsIGNvbG9yOiBuZXdDb2xvciwgbW9kZWw6IG5ld01vZGVsIH0gPSBjaGFuZ2VzXG4gICAgICBjb25zdCBmaW5hbENvbG9yID0gbmV3Q29sb3IgPz8gc2VsZWN0ZWRDb2xvclxuICAgICAgY29uc3QgaGFzVG9vbHNDaGFuZ2VkID0gbmV3VG9vbHMgIT09IHVuZGVmaW5lZFxuICAgICAgY29uc3QgaGFzTW9kZWxDaGFuZ2VkID0gbmV3TW9kZWwgIT09IHVuZGVmaW5lZFxuICAgICAgY29uc3QgaGFzQ29sb3JDaGFuZ2VkID0gZmluYWxDb2xvciAhPT0gYWdlbnQuY29sb3JcblxuICAgICAgaWYgKCFoYXNUb29sc0NoYW5nZWQgJiYgIWhhc01vZGVsQ2hhbmdlZCAmJiAhaGFzQ29sb3JDaGFuZ2VkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBPbmx5IGN1c3RvbS9wbHVnaW4gYWdlbnRzIGNhbiBiZSBlZGl0ZWRcbiAgICAgICAgLy8gdGhpcyBpcyBmb3IgdHlwZSBzYWZldHk7IHRoZSBVSSBzaG91bGRuJ3QgYWxsb3cgZWRpdGluZyBvdGhlcndpc2VcbiAgICAgICAgaWYgKCFpc0N1c3RvbUFnZW50KGFnZW50KSAmJiAhaXNQbHVnaW5BZ2VudChhZ2VudCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHVwZGF0ZUFnZW50RmlsZShcbiAgICAgICAgICBhZ2VudCxcbiAgICAgICAgICBhZ2VudC53aGVuVG9Vc2UsXG4gICAgICAgICAgbmV3VG9vbHMgPz8gYWdlbnQudG9vbHMsXG4gICAgICAgICAgYWdlbnQuZ2V0U3lzdGVtUHJvbXB0KCksXG4gICAgICAgICAgZmluYWxDb2xvcixcbiAgICAgICAgICBuZXdNb2RlbCA/PyBhZ2VudC5tb2RlbCxcbiAgICAgICAgKVxuXG4gICAgICAgIGlmIChoYXNDb2xvckNoYW5nZWQgJiYgZmluYWxDb2xvcikge1xuICAgICAgICAgIHNldEFnZW50Q29sb3IoYWdlbnQuYWdlbnRUeXBlLCBmaW5hbENvbG9yKVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0QXBwU3RhdGUoc3RhdGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGFsbEFnZW50cyA9IHN0YXRlLmFnZW50RGVmaW5pdGlvbnMuYWxsQWdlbnRzLm1hcChhID0+XG4gICAgICAgICAgICBhLmFnZW50VHlwZSA9PT0gYWdlbnQuYWdlbnRUeXBlXG4gICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgLi4uYSxcbiAgICAgICAgICAgICAgICAgIHRvb2xzOiBuZXdUb29scyA/PyBhLnRvb2xzLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IGZpbmFsQ29sb3IsXG4gICAgICAgICAgICAgICAgICBtb2RlbDogbmV3TW9kZWwgPz8gYS5tb2RlbCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIDogYSxcbiAgICAgICAgICApXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgYWdlbnREZWZpbml0aW9uczoge1xuICAgICAgICAgICAgICAuLi5zdGF0ZS5hZ2VudERlZmluaXRpb25zLFxuICAgICAgICAgICAgICBhY3RpdmVBZ2VudHM6IGdldEFjdGl2ZUFnZW50c0Zyb21MaXN0KGFsbEFnZW50cyksXG4gICAgICAgICAgICAgIGFsbEFnZW50cyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIG9uU2F2ZWQoYFVwZGF0ZWQgYWdlbnQ6ICR7Y2hhbGsuYm9sZChhZ2VudC5hZ2VudFR5cGUpfWApXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdGYWlsZWQgdG8gc2F2ZSBhZ2VudCcpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgW2FnZW50LCBzZWxlY3RlZENvbG9yLCBvblNhdmVkLCBzZXRBcHBTdGF0ZV0sXG4gIClcblxuICBjb25zdCBtZW51SXRlbXMgPSB1c2VNZW1vKFxuICAgICgpID0+IFtcbiAgICAgIHsgbGFiZWw6ICdPcGVuIGluIGVkaXRvcicsIGFjdGlvbjogaGFuZGxlT3BlbkluRWRpdG9yIH0sXG4gICAgICB7IGxhYmVsOiAnRWRpdCB0b29scycsIGFjdGlvbjogKCkgPT4gc2V0RWRpdE1vZGUoJ2VkaXQtdG9vbHMnKSB9LFxuICAgICAgeyBsYWJlbDogJ0VkaXQgbW9kZWwnLCBhY3Rpb246ICgpID0+IHNldEVkaXRNb2RlKCdlZGl0LW1vZGVsJykgfSxcbiAgICAgIHsgbGFiZWw6ICdFZGl0IGNvbG9yJywgYWN0aW9uOiAoKSA9PiBzZXRFZGl0TW9kZSgnZWRpdC1jb2xvcicpIH0sXG4gICAgXSxcbiAgICBbaGFuZGxlT3BlbkluRWRpdG9yXSxcbiAgKVxuXG4gIGNvbnN0IGhhbmRsZUVzY2FwZSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRFcnJvcihudWxsKVxuICAgIGlmIChlZGl0TW9kZSA9PT0gJ21lbnUnKSB7XG4gICAgICBvbkJhY2soKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRFZGl0TW9kZSgnbWVudScpXG4gICAgfVxuICB9LCBbZWRpdE1vZGUsIG9uQmFja10pXG5cbiAgY29uc3QgaGFuZGxlTWVudUtleURvd24gPSB1c2VDYWxsYmFjayhcbiAgICAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAndXAnKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBzZXRTZWxlY3RlZE1lbnVJbmRleChpbmRleCA9PiBNYXRoLm1heCgwLCBpbmRleCAtIDEpKVxuICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBzZXRTZWxlY3RlZE1lbnVJbmRleChpbmRleCA9PiBNYXRoLm1pbihtZW51SXRlbXMubGVuZ3RoIC0gMSwgaW5kZXggKyAxKSlcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXkgPT09ICdyZXR1cm4nKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBjb25zdCBzZWxlY3RlZEl0ZW0gPSBtZW51SXRlbXNbc2VsZWN0ZWRNZW51SW5kZXhdXG4gICAgICAgIGlmIChzZWxlY3RlZEl0ZW0pIHtcbiAgICAgICAgICB2b2lkIHNlbGVjdGVkSXRlbS5hY3Rpb24oKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBbbWVudUl0ZW1zLCBzZWxlY3RlZE1lbnVJbmRleF0sXG4gIClcblxuICB1c2VLZXliaW5kaW5nKCdjb25maXJtOm5vJywgaGFuZGxlRXNjYXBlLCB7IGNvbnRleHQ6ICdDb25maXJtYXRpb24nIH0pXG5cbiAgY29uc3QgcmVuZGVyTWVudSA9ICgpOiBSZWFjdC5SZWFjdE5vZGUgPT4gKFxuICAgIDxCb3hcbiAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICBhdXRvRm9jdXNcbiAgICAgIG9uS2V5RG93bj17aGFuZGxlTWVudUtleURvd259XG4gICAgPlxuICAgICAgPFRleHQgZGltQ29sb3I+U291cmNlOiB7Z2V0QWdlbnRTb3VyY2VEaXNwbGF5TmFtZShhZ2VudC5zb3VyY2UpfTwvVGV4dD5cblxuICAgICAgPEJveCBtYXJnaW5Ub3A9ezF9IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj5cbiAgICAgICAge21lbnVJdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgICAgPFRleHRcbiAgICAgICAgICAgIGtleT17aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIGNvbG9yPXtpbmRleCA9PT0gc2VsZWN0ZWRNZW51SW5kZXggPyAnc3VnZ2VzdGlvbicgOiB1bmRlZmluZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2luZGV4ID09PSBzZWxlY3RlZE1lbnVJbmRleCA/IGAke2ZpZ3VyZXMucG9pbnRlcn0gYCA6ICcgICd9XG4gICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG5cbiAgICAgIHtlcnJvciAmJiAoXG4gICAgICAgIDxCb3ggbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgICA8VGV4dCBjb2xvcj1cImVycm9yXCI+e2Vycm9yfTwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApfVxuICAgIDwvQm94PlxuICApXG5cbiAgc3dpdGNoIChlZGl0TW9kZSkge1xuICAgIGNhc2UgJ21lbnUnOlxuICAgICAgcmV0dXJuIHJlbmRlck1lbnUoKVxuXG4gICAgY2FzZSAnZWRpdC10b29scyc6XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8VG9vbFNlbGVjdG9yXG4gICAgICAgICAgdG9vbHM9e3Rvb2xzfVxuICAgICAgICAgIGluaXRpYWxUb29scz17YWdlbnQudG9vbHN9XG4gICAgICAgICAgb25Db21wbGV0ZT17YXN5bmMgZmluYWxUb29scyA9PiB7XG4gICAgICAgICAgICBzZXRFZGl0TW9kZSgnbWVudScpXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVTYXZlKHsgdG9vbHM6IGZpbmFsVG9vbHMgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgKVxuXG4gICAgY2FzZSAnZWRpdC1jb2xvcic6XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Q29sb3JQaWNrZXJcbiAgICAgICAgICBhZ2VudE5hbWU9e2FnZW50LmFnZW50VHlwZX1cbiAgICAgICAgICBjdXJyZW50Q29sb3I9e1xuICAgICAgICAgICAgc2VsZWN0ZWRDb2xvciB8fCAoYWdlbnQuY29sb3IgYXMgQWdlbnRDb2xvck5hbWUpIHx8ICdhdXRvbWF0aWMnXG4gICAgICAgICAgfVxuICAgICAgICAgIG9uQ29uZmlybT17YXN5bmMgY29sb3IgPT4ge1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWRDb2xvcihjb2xvcilcbiAgICAgICAgICAgIHNldEVkaXRNb2RlKCdtZW51JylcbiAgICAgICAgICAgIGF3YWl0IGhhbmRsZVNhdmUoeyBjb2xvciB9KVxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICApXG5cbiAgICBjYXNlICdlZGl0LW1vZGVsJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxNb2RlbFNlbGVjdG9yXG4gICAgICAgICAgaW5pdGlhbE1vZGVsPXthZ2VudC5tb2RlbH1cbiAgICAgICAgICBvbkNvbXBsZXRlPXthc3luYyBtb2RlbCA9PiB7XG4gICAgICAgICAgICBzZXRFZGl0TW9kZSgnbWVudScpXG4gICAgICAgICAgICBhd2FpdCBoYW5kbGVTYXZlKHsgbW9kZWwgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgKVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsS0FBSyxNQUFNLE9BQU87QUFDekIsT0FBT0MsT0FBTyxNQUFNLFNBQVM7QUFDN0IsT0FBTyxLQUFLQyxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxXQUFXLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDdEQsU0FBU0MsY0FBYyxRQUFRLHVCQUF1QjtBQUN0RCxjQUFjQyxhQUFhLFFBQVEsb0NBQW9DO0FBQ3ZFLFNBQVNDLEdBQUcsRUFBRUMsSUFBSSxRQUFRLGNBQWM7QUFDeEMsU0FBU0MsYUFBYSxRQUFRLG9DQUFvQztBQUNsRSxjQUFjQyxLQUFLLFFBQVEsZUFBZTtBQUMxQyxTQUNFLEtBQUtDLGNBQWMsRUFDbkJDLGFBQWEsUUFDUiw0Q0FBNEM7QUFDbkQsU0FDRSxLQUFLQyxlQUFlLEVBQ3BCQyx1QkFBdUIsRUFDdkJDLGFBQWEsRUFDYkMsYUFBYSxRQUNSLHdDQUF3QztBQUMvQyxTQUFTQyxnQkFBZ0IsUUFBUSw2QkFBNkI7QUFDOUQsU0FBU0Msc0JBQXNCLEVBQUVDLGVBQWUsUUFBUSxxQkFBcUI7QUFDN0UsU0FBU0MsV0FBVyxRQUFRLGtCQUFrQjtBQUM5QyxTQUFTQyxhQUFhLFFBQVEsb0JBQW9CO0FBQ2xELFNBQVNDLFlBQVksUUFB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
