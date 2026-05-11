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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmStepWrapper = ConfirmStepWrapper;
var chalk_1 = require("chalk");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var AppState_js_1 = require("src/state/AppState.js");
var loadAgentsDir_js_1 = require("../../../../tools/AgentTool/loadAgentsDir.js");
var promptEditor_js_1 = require("../../../../utils/promptEditor.js");
var index_js_2 = require("../../../wizard/index.js");
var agentFileUtils_js_1 = require("../../agentFileUtils.js");
var ConfirmStep_js_1 = require("./ConfirmStep.js");
function ConfirmStepWrapper(_a) {
    var _this = this;
    var tools = _a.tools, existingAgents = _a.existingAgents, onComplete = _a.onComplete;
    var wizardData = (0, index_js_2.useWizard)().wizardData;
    var _b = (0, react_1.useState)(null), saveError = _b[0], setSaveError = _b[1];
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var saveAgent = (0, react_1.useCallback)(function (openInEditor) { return __awaiter(_this, void 0, void 0, function () {
        var filePath, message, err_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(wizardData === null || wizardData === void 0 ? void 0 : wizardData.finalAgent))
                        return [2 /*return*/];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, agentFileUtils_js_1.saveAgentToFile)(wizardData.location, wizardData.finalAgent.agentType, wizardData.finalAgent.whenToUse, wizardData.finalAgent.tools, wizardData.finalAgent.getSystemPrompt(), true, wizardData.finalAgent.color, wizardData.finalAgent.model, wizardData.finalAgent.memory)];
                case 2:
                    _d.sent();
                    setAppState(function (state) {
                        if (!wizardData.finalAgent)
                            return state;
                        var allAgents = state.agentDefinitions.allAgents.concat(wizardData.finalAgent);
                        return __assign(__assign({}, state), { agentDefinitions: __assign(__assign({}, state.agentDefinitions), { activeAgents: (0, loadAgentsDir_js_1.getActiveAgentsFromList)(allAgents), allAgents: allAgents }) });
                    });
                    if (!openInEditor) return [3 /*break*/, 4];
                    filePath = (0, agentFileUtils_js_1.getNewAgentFilePath)({
                        source: wizardData.location,
                        agentType: wizardData.finalAgent.agentType
                    });
                    return [4 /*yield*/, (0, promptEditor_js_1.editFileInEditor)(filePath)];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    (0, index_js_1.logEvent)('tengu_agent_created', __assign({ agent_type: wizardData.finalAgent.agentType, generation_method: wizardData.wasGenerated ? 'generated' : 'manual', source: wizardData.location, tool_count: (_b = (_a = wizardData.finalAgent.tools) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 'all', has_custom_model: !!wizardData.finalAgent.model, has_custom_color: !!wizardData.finalAgent.color, has_memory: !!wizardData.finalAgent.memory, memory_scope: (_c = wizardData.finalAgent.memory) !== null && _c !== void 0 ? _c : 'none' }, (openInEditor ? {
                        opened_in_editor: true
                    } : {})));
                    message = openInEditor ? "Created agent: ".concat(chalk_1.default.bold(wizardData.finalAgent.agentType), " and opened in editor. ") + "If you made edits, restart to load the latest version." : "Created agent: ".concat(chalk_1.default.bold(wizardData.finalAgent.agentType));
                    onComplete(message);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _d.sent();
                    setSaveError(err_1 instanceof Error ? err_1.message : 'Failed to save agent');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [wizardData, onComplete, setAppState]);
    var handleSave = (0, react_1.useCallback)(function () { return saveAgent(false); }, [saveAgent]);
    var handleSaveAndEdit = (0, react_1.useCallback)(function () { return saveAgent(true); }, [saveAgent]);
    return <ConfirmStep_js_1.ConfirmStep tools={tools} existingAgents={existingAgents} onSave={handleSave} onSaveAndEdit={handleSaveAndEdit} error={saveError}/>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsIlJlYWN0IiwiUmVhY3ROb2RlIiwidXNlQ2FsbGJhY2siLCJ1c2VTdGF0ZSIsIkFuYWx5dGljc01ldGFkYXRhX0lfVkVSSUZJRURfVEhJU19JU19OT1RfQ09ERV9PUl9GSUxFUEFUSFMiLCJsb2dFdmVudCIsInVzZVNldEFwcFN0YXRlIiwiVG9vbHMiLCJBZ2VudERlZmluaXRpb24iLCJnZXRBY3RpdmVBZ2VudHNGcm9tTGlzdCIsImVkaXRGaWxlSW5FZGl0b3IiLCJ1c2VXaXphcmQiLCJnZXROZXdBZ2VudEZpbGVQYXRoIiwic2F2ZUFnZW50VG9GaWxlIiwiQWdlbnRXaXphcmREYXRhIiwiQ29uZmlybVN0ZXAiLCJQcm9wcyIsInRvb2xzIiwiZXhpc3RpbmdBZ2VudHMiLCJvbkNvbXBsZXRlIiwibWVzc2FnZSIsIkNvbmZpcm1TdGVwV3JhcHBlciIsIndpemFyZERhdGEiLCJzYXZlRXJyb3IiLCJzZXRTYXZlRXJyb3IiLCJzZXRBcHBTdGF0ZSIsInNhdmVBZ2VudCIsIm9wZW5JbkVkaXRvciIsIlByb21pc2UiLCJmaW5hbEFnZW50IiwibG9jYXRpb24iLCJhZ2VudFR5cGUiLCJ3aGVuVG9Vc2UiLCJnZXRTeXN0ZW1Qcm9tcHQiLCJjb2xvciIsIm1vZGVsIiwibWVtb3J5Iiwic3RhdGUiLCJhbGxBZ2VudHMiLCJhZ2VudERlZmluaXRpb25zIiwiY29uY2F0IiwiYWN0aXZlQWdlbnRzIiwiZmlsZVBhdGgiLCJzb3VyY2UiLCJhZ2VudF90eXBlIiwiZ2VuZXJhdGlvbl9tZXRob2QiLCJ3YXNHZW5lcmF0ZWQiLCJ0b29sX2NvdW50IiwibGVuZ3RoIiwiaGFzX2N1c3RvbV9tb2RlbCIsImhhc19jdXN0b21fY29sb3IiLCJoYXNfbWVtb3J5IiwibWVtb3J5X3Njb3BlIiwib3BlbmVkX2luX2VkaXRvciIsImJvbGQiLCJlcnIiLCJFcnJvciIsImhhbmRsZVNhdmUiLCJoYW5kbGVTYXZlQW5kRWRpdCJdLCJzb3VyY2VzIjpbIkNvbmZpcm1TdGVwV3JhcHBlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJ1xuaW1wb3J0IFJlYWN0LCB7IHR5cGUgUmVhY3ROb2RlLCB1c2VDYWxsYmFjaywgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7XG4gIHR5cGUgQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyxcbiAgbG9nRXZlbnQsXG59IGZyb20gJ3NyYy9zZXJ2aWNlcy9hbmFseXRpY3MvaW5kZXguanMnXG5pbXBvcnQgeyB1c2VTZXRBcHBTdGF0ZSB9IGZyb20gJ3NyYy9zdGF0ZS9BcHBTdGF0ZS5qcydcbmltcG9ydCB0eXBlIHsgVG9vbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9Ub29sLmpzJ1xuaW1wb3J0IHR5cGUgeyBBZ2VudERlZmluaXRpb24gfSBmcm9tICcuLi8uLi8uLi8uLi90b29scy9BZ2VudFRvb2wvbG9hZEFnZW50c0Rpci5qcydcbmltcG9ydCB7IGdldEFjdGl2ZUFnZW50c0Zyb21MaXN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdG9vbHMvQWdlbnRUb29sL2xvYWRBZ2VudHNEaXIuanMnXG5pbXBvcnQgeyBlZGl0RmlsZUluRWRpdG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvcHJvbXB0RWRpdG9yLmpzJ1xuaW1wb3J0IHsgdXNlV2l6YXJkIH0gZnJvbSAnLi4vLi4vLi4vd2l6YXJkL2luZGV4LmpzJ1xuaW1wb3J0IHsgZ2V0TmV3QWdlbnRGaWxlUGF0aCwgc2F2ZUFnZW50VG9GaWxlIH0gZnJvbSAnLi4vLi4vYWdlbnRGaWxlVXRpbHMuanMnXG5pbXBvcnQgdHlwZSB7IEFnZW50V2l6YXJkRGF0YSB9IGZyb20gJy4uL3R5cGVzLmpzJ1xuaW1wb3J0IHsgQ29uZmlybVN0ZXAgfSBmcm9tICcuL0NvbmZpcm1TdGVwLmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICB0b29sczogVG9vbHNcbiAgZXhpc3RpbmdBZ2VudHM6IEFnZW50RGVmaW5pdGlvbltdXG4gIG9uQ29tcGxldGU6IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbmZpcm1TdGVwV3JhcHBlcih7XG4gIHRvb2xzLFxuICBleGlzdGluZ0FnZW50cyxcbiAgb25Db21wbGV0ZSxcbn06IFByb3BzKTogUmVhY3ROb2RlIHtcbiAgY29uc3QgeyB3aXphcmREYXRhIH0gPSB1c2VXaXphcmQ8QWdlbnRXaXphcmREYXRhPigpXG4gIGNvbnN0IFtzYXZlRXJyb3IsIHNldFNhdmVFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBzZXRBcHBTdGF0ZSA9IHVzZVNldEFwcFN0YXRlKClcblxuICBjb25zdCBzYXZlQWdlbnQgPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyAob3BlbkluRWRpdG9yOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBpZiAoIXdpemFyZERhdGE/LmZpbmFsQWdlbnQpIHJldHVyblxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBzYXZlQWdlbnRUb0ZpbGUoXG4gICAgICAgICAgd2l6YXJkRGF0YS5sb2NhdGlvbiEsXG4gICAgICAgICAgd2l6YXJkRGF0YS5maW5hbEFnZW50LmFnZW50VHlwZSxcbiAgICAgICAgICB3aXphcmREYXRhLmZpbmFsQWdlbnQud2hlblRvVXNlLFxuICAgICAgICAgIHdpemFyZERhdGEuZmluYWxBZ2VudC50b29scyxcbiAgICAgICAgICB3aXphcmREYXRhLmZpbmFsQWdlbnQuZ2V0U3lzdGVtUHJvbXB0KCksXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICB3aXphcmREYXRhLmZpbmFsQWdlbnQuY29sb3IsXG4gICAgICAgICAgd2l6YXJkRGF0YS5maW5hbEFnZW50Lm1vZGVsLFxuICAgICAgICAgIHdpemFyZERhdGEuZmluYWxBZ2VudC5tZW1vcnksXG4gICAgICAgIClcblxuICAgICAgICBzZXRBcHBTdGF0ZShzdGF0ZSA9PiB7XG4gICAgICAgICAgaWYgKCF3aXphcmREYXRhLmZpbmFsQWdlbnQpIHJldHVybiBzdGF0ZVxuXG4gICAgICAgICAgY29uc3QgYWxsQWdlbnRzID0gc3RhdGUuYWdlbnREZWZpbml0aW9ucy5hbGxBZ2VudHMuY29uY2F0KFxuICAgICAgICAgICAgd2l6YXJkRGF0YS5maW5hbEFnZW50LFxuICAgICAgICAgIClcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICBhZ2VudERlZmluaXRpb25zOiB7XG4gICAgICAgICAgICAgIC4uLnN0YXRlLmFnZW50RGVmaW5pdGlvbnMsXG4gICAgICAgICAgICAgIGFjdGl2ZUFnZW50czogZ2V0QWN0aXZlQWdlbnRzRnJvbUxpc3QoYWxsQWdlbnRzKSxcbiAgICAgICAgICAgICAgYWxsQWdlbnRzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKG9wZW5JbkVkaXRvcikge1xuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0TmV3QWdlbnRGaWxlUGF0aCh7XG4gICAgICAgICAgICBzb3VyY2U6IHdpemFyZERhdGEubG9jYXRpb24hLFxuICAgICAgICAgICAgYWdlbnRUeXBlOiB3aXphcmREYXRhLmZpbmFsQWdlbnQuYWdlbnRUeXBlLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgYXdhaXQgZWRpdEZpbGVJbkVkaXRvcihmaWxlUGF0aClcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ0V2ZW50KCd0ZW5ndV9hZ2VudF9jcmVhdGVkJywge1xuICAgICAgICAgIGFnZW50X3R5cGU6IHdpemFyZERhdGEuZmluYWxBZ2VudC5hZ2VudFR5cGUsXG4gICAgICAgICAgZ2VuZXJhdGlvbl9tZXRob2Q6IHdpemFyZERhdGEud2FzR2VuZXJhdGVkID8gJ2dlbmVyYXRlZCcgOiAnbWFudWFsJyxcbiAgICAgICAgICBzb3VyY2U6IHdpemFyZERhdGEubG9jYXRpb24hLFxuICAgICAgICAgIHRvb2xfY291bnQ6IHdpemFyZERhdGEuZmluYWxBZ2VudC50b29scz8ubGVuZ3RoID8/ICdhbGwnLFxuICAgICAgICAgIGhhc19jdXN0b21fbW9kZWw6ICEhd2l6YXJkRGF0YS5maW5hbEFnZW50Lm1vZGVsLFxuICAgICAgICAgIGhhc19jdXN0b21fY29sb3I6ICEhd2l6YXJkRGF0YS5maW5hbEFnZW50LmNvbG9yLFxuICAgICAgICAgIGhhc19tZW1vcnk6ICEhd2l6YXJkRGF0YS5maW5hbEFnZW50Lm1lbW9yeSxcbiAgICAgICAgICBtZW1vcnlfc2NvcGU6IHdpemFyZERhdGEuZmluYWxBZ2VudC5tZW1vcnkgPz8gJ25vbmUnLFxuICAgICAgICAgIC4uLihvcGVuSW5FZGl0b3IgPyB7IG9wZW5lZF9pbl9lZGl0b3I6IHRydWUgfSA6IHt9KSxcbiAgICAgICAgfSBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTKVxuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBvcGVuSW5FZGl0b3JcbiAgICAgICAgICA/IGBDcmVhdGVkIGFnZW50OiAke2NoYWxrLmJvbGQod2l6YXJkRGF0YS5maW5hbEFnZW50LmFnZW50VHlwZSl9IGFuZCBvcGVuZWQgaW4gZWRpdG9yLiBgICtcbiAgICAgICAgICAgIGBJZiB5b3UgbWFkZSBlZGl0cywgcmVzdGFydCB0byBsb2FkIHRoZSBsYXRlc3QgdmVyc2lvbi5gXG4gICAgICAgICAgOiBgQ3JlYXRlZCBhZ2VudDogJHtjaGFsay5ib2xkKHdpemFyZERhdGEuZmluYWxBZ2VudC5hZ2VudFR5cGUpfWBcbiAgICAgICAgb25Db21wbGV0ZShtZXNzYWdlKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFNhdmVFcnJvcihcbiAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBzYXZlIGFnZW50JyxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0sXG4gICAgW3dpemFyZERhdGEsIG9uQ29tcGxldGUsIHNldEFwcFN0YXRlXSxcbiAgKVxuXG4gIGNvbnN0IGhhbmRsZVNhdmUgPSB1c2VDYWxsYmFjaygoKSA9PiBzYXZlQWdlbnQoZmFsc2UpLCBbc2F2ZUFnZW50XSlcblxuICBjb25zdCBoYW5kbGVTYXZlQW5kRWRpdCA9IHVzZUNhbGxiYWNrKCgpID0+IHNhdmVBZ2VudCh0cnVlKSwgW3NhdmVBZ2VudF0pXG5cbiAgcmV0dXJuIChcbiAgICA8Q29uZmlybVN0ZXBcbiAgICAgIHRvb2xzPXt0b29sc31cbiAgICAgIGV4aXN0aW5nQWdlbnRzPXtleGlzdGluZ0FnZW50c31cbiAgICAgIG9uU2F2ZT17aGFuZGxlU2F2ZX1cbiAgICAgIG9uU2F2ZUFuZEVkaXQ9e2hhbmRsZVNhdmVBbmRFZGl0fVxuICAgICAgZXJyb3I9e3NhdmVFcnJvcn1cbiAgICAvPlxuICApXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLEtBQUssTUFBTSxPQUFPO0FBQ3pCLE9BQU9DLEtBQUssSUFBSSxLQUFLQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDcEUsU0FDRSxLQUFLQywwREFBMEQsRUFDL0RDLFFBQVEsUUFDSCxpQ0FBaUM7QUFDeEMsU0FBU0MsY0FBYyxRQUFRLHVCQUF1QjtBQUN0RCxjQUFjQyxLQUFLLFFBQVEscUJBQXFCO0FBQ2hELGNBQWNDLGVBQWUsUUFBUSw4Q0FBOEM7QUFDbkYsU0FBU0MsdUJBQXVCLFFBQVEsOENBQThDO0FBQ3RGLFNBQVNDLGdCQUFnQixRQUFRLG1DQUFtQztBQUNwRSxTQUFTQyxTQUFTLFFBQVEsMEJBQTBCO0FBQ3BELFNBQVNDLG1CQUFtQixFQUFFQyxlQUFlLFFBQVEseUJBQXlCO0FBQzlFLGNBQWNDLGVBQWUsUUFBUSxhQUFhO0FBQ2xELFNBQVNDLFdBQVcsUUFBUSxrQkFBa0I7QUFFOUMsS0FBS0MsS0FBSyxHQUFHO0VBQ1hDLEtBQUssRUFBRVYsS0FBSztFQUNaVyxjQUFjLEVBQUVW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
