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
exports.handleMcpjsonServerApprovals = handleMcpjsonServerApprovals;
var react_1 = require("react");
var MCPServerApprovalDialog_js_1 = require("../components/MCPServerApprovalDialog.js");
var MCPServerMultiselectDialog_js_1 = require("../components/MCPServerMultiselectDialog.js");
var KeybindingProviderSetup_js_1 = require("../keybindings/KeybindingProviderSetup.js");
var AppState_js_1 = require("../state/AppState.js");
var config_js_1 = require("./mcp/config.js");
var utils_js_1 = require("./mcp/utils.js");
/**
 * Show MCP server approval dialogs for pending project servers.
 * Uses the provided Ink root to render (reusing the existing instance
 * from main.tsx instead of creating a separate one).
 */
function handleMcpjsonServerApprovals(root) {
    return __awaiter(this, void 0, void 0, function () {
        var projectServers, pendingServers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectServers = (0, config_js_1.getMcpConfigsByScope)('project').servers;
                    pendingServers = Object.keys(projectServers).filter(function (serverName) { return (0, utils_js_1.getProjectMcpServerStatus)(serverName) === 'pending'; });
                    if (pendingServers.length === 0) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var done = function () { return void resolve(); };
                            if (pendingServers.length === 1 && pendingServers[0] !== undefined) {
                                var serverName = pendingServers[0];
                                root.render(<AppState_js_1.AppStateProvider>
          <KeybindingProviderSetup_js_1.KeybindingSetup>
            <MCPServerApprovalDialog_js_1.MCPServerApprovalDialog serverName={serverName} onDone={done}/>
          </KeybindingProviderSetup_js_1.KeybindingSetup>
        </AppState_js_1.AppStateProvider>);
                            }
                            else {
                                root.render(<AppState_js_1.AppStateProvider>
          <KeybindingProviderSetup_js_1.KeybindingSetup>
            <MCPServerMultiselectDialog_js_1.MCPServerMultiselectDialog serverNames={pendingServers} onDone={done}/>
          </KeybindingProviderSetup_js_1.KeybindingSetup>
        </AppState_js_1.AppStateProvider>);
                            }
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIk1DUFNlcnZlckFwcHJvdmFsRGlhbG9nIiwiTUNQU2VydmVyTXVsdGlzZWxlY3REaWFsb2ciLCJSb290IiwiS2V5YmluZGluZ1NldHVwIiwiQXBwU3RhdGVQcm92aWRlciIsImdldE1jcENvbmZpZ3NCeVNjb3BlIiwiZ2V0UHJvamVjdE1jcFNlcnZlclN0YXR1cyIsImhhbmRsZU1jcGpzb25TZXJ2ZXJBcHByb3ZhbHMiLCJyb290IiwiUHJvbWlzZSIsInNlcnZlcnMiLCJwcm9qZWN0U2VydmVycyIsInBlbmRpbmdTZXJ2ZXJzIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsInNlcnZlck5hbWUiLCJsZW5ndGgiLCJyZXNvbHZlIiwiZG9uZSIsInVuZGVmaW5lZCIsInJlbmRlciJdLCJzb3VyY2VzIjpbIm1jcFNlcnZlckFwcHJvdmFsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBNQ1BTZXJ2ZXJBcHByb3ZhbERpYWxvZyB9IGZyb20gJy4uL2NvbXBvbmVudHMvTUNQU2VydmVyQXBwcm92YWxEaWFsb2cuanMnXG5pbXBvcnQgeyBNQ1BTZXJ2ZXJNdWx0aXNlbGVjdERpYWxvZyB9IGZyb20gJy4uL2NvbXBvbmVudHMvTUNQU2VydmVyTXVsdGlzZWxlY3REaWFsb2cuanMnXG5pbXBvcnQgdHlwZSB7IFJvb3QgfSBmcm9tICcuLi9pbmsuanMnXG5pbXBvcnQgeyBLZXliaW5kaW5nU2V0dXAgfSBmcm9tICcuLi9rZXliaW5kaW5ncy9LZXliaW5kaW5nUHJvdmlkZXJTZXR1cC5qcydcbmltcG9ydCB7IEFwcFN0YXRlUHJvdmlkZXIgfSBmcm9tICcuLi9zdGF0ZS9BcHBTdGF0ZS5qcydcbmltcG9ydCB7IGdldE1jcENvbmZpZ3NCeVNjb3BlIH0gZnJvbSAnLi9tY3AvY29uZmlnLmpzJ1xuaW1wb3J0IHsgZ2V0UHJvamVjdE1jcFNlcnZlclN0YXR1cyB9IGZyb20gJy4vbWNwL3V0aWxzLmpzJ1xuXG4vKipcbiAqIFNob3cgTUNQIHNlcnZlciBhcHByb3ZhbCBkaWFsb2dzIGZvciBwZW5kaW5nIHByb2plY3Qgc2VydmVycy5cbiAqIFVzZXMgdGhlIHByb3ZpZGVkIEluayByb290IHRvIHJlbmRlciAocmV1c2luZyB0aGUgZXhpc3RpbmcgaW5zdGFuY2VcbiAqIGZyb20gbWFpbi50c3ggaW5zdGVhZCBvZiBjcmVhdGluZyBhIHNlcGFyYXRlIG9uZSkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVNY3Bqc29uU2VydmVyQXBwcm92YWxzKHJvb3Q6IFJvb3QpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBzZXJ2ZXJzOiBwcm9qZWN0U2VydmVycyB9ID0gZ2V0TWNwQ29uZmlnc0J5U2NvcGUoJ3Byb2plY3QnKVxuICBjb25zdCBwZW5kaW5nU2VydmVycyA9IE9iamVjdC5rZXlzKHByb2plY3RTZXJ2ZXJzKS5maWx0ZXIoXG4gICAgc2VydmVyTmFtZSA9PiBnZXRQcm9qZWN0TWNwU2VydmVyU3RhdHVzKHNlcnZlck5hbWUpID09PSAncGVuZGluZycsXG4gIClcblxuICBpZiAocGVuZGluZ1NlcnZlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcbiAgICBjb25zdCBkb25lID0gKCk6IHZvaWQgPT4gdm9pZCByZXNvbHZlKClcbiAgICBpZiAocGVuZGluZ1NlcnZlcnMubGVuZ3RoID09PSAxICYmIHBlbmRpbmdTZXJ2ZXJzWzBdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHNlcnZlck5hbWUgPSBwZW5kaW5nU2VydmVyc1swXVxuICAgICAgcm9vdC5yZW5kZXIoXG4gICAgICAgIDxBcHBTdGF0ZVByb3ZpZGVyPlxuICAgICAgICAgIDxLZXliaW5kaW5nU2V0dXA+XG4gICAgICAgICAgICA8TUNQU2VydmVyQXBwcm92YWxEaWFsb2cgc2VydmVyTmFtZT17c2VydmVyTmFtZX0gb25Eb25lPXtkb25lfSAvPlxuICAgICAgICAgIDwvS2V5YmluZGluZ1NldHVwPlxuICAgICAgICA8L0FwcFN0YXRlUHJvdmlkZXI+LFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICByb290LnJlbmRlcihcbiAgICAgICAgPEFwcFN0YXRlUHJvdmlkZXI+XG4gICAgICAgICAgPEtleWJpbmRpbmdTZXR1cD5cbiAgICAgICAgICAgIDxNQ1BTZXJ2ZXJNdWx0aXNlbGVjdERpYWxvZ1xuICAgICAgICAgICAgICBzZXJ2ZXJOYW1lcz17cGVuZGluZ1NlcnZlcnN9XG4gICAgICAgICAgICAgIG9uRG9uZT17ZG9uZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9LZXliaW5kaW5nU2V0dXA+XG4gICAgICAgIDwvQXBwU3RhdGVQcm92aWRlcj4sXG4gICAgICApXG4gICAgfVxuICB9KVxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxLQUFLLE1BQU0sT0FBTztBQUN6QixTQUFTQyx1QkFBdUIsUUFBUSwwQ0FBMEM7QUFDbEYsU0FBU0MsMEJBQTBCLFFBQVEsNkNBQTZDO0FBQ3hGLGNBQWNDLElBQUksUUFBUSxXQUFXO0FBQ3JDLFNBQVNDLGVBQWUsUUFBUSwyQ0FBMkM7QUFDM0UsU0FBU0MsZ0JBQWdCLFFBQVEsc0JBQXNCO0FBQ3ZELFNBQVNDLG9CQUFvQixRQUFRLGlCQUFpQjtBQUN0RCxTQUFTQyx5QkFBeUIsUUFBUSxnQkFBZ0I7O0FBRTFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLGVBQWVDLDRCQUE0QkEsQ0FBQ0MsSUFBSSxFQUFFTixJQUFJLENBQUMsRUFBRU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzVFLE1BQU07SUFBRUMsT0FBTyxFQUFFQztFQUFlLENBQUMsR0FBR04sb0JBQW9CLENBQUMsU0FBUyxDQUFDO0VBQ25FLE1BQU1PLGNBQWMsR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUNILGNBQWMsQ0FBQyxDQUFDSSxNQUFNLENBQ3ZEQyxVQUFVLElBQUlWLHlCQUF5QixDQUFDVSxVQUFVLENBQUMsS0FBSyxTQUMxRCxDQUFDO0VBRUQsSUFBSUosY0FBYyxDQUFDSyxNQUFNLEtBQUssQ0FBQyxFQUFFO0lBQy9CO0VBQ0Y7RUFFQSxNQUFNLElBQUlSLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQ1MsT0FBTyxJQUFJO0lBQ2pDLE1BQU1DLElBQUksR0FBR0EsQ0FBQSxDQUFFLEVBQUUsSUFBSSxJQUFJLEtBQUtELE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLElBQUlOLGNBQWMsQ0FBQ0ssTUFBTSxLQUFLLENBQUMsSUFBSUwsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLUSxTQUFTLEVBQUU7TUFDbEUsTUFBTUosVUFBVSxHQUFHSixjQUFjLENBQUMsQ0FBQyxDQUFDO01BQ3BDSixJQUFJLENBQUNhLE1BQU0sQ0FDVCxDQUFDLGdCQUFnQjtBQUN6QixVQUFVLENBQUMsZUFBZTtBQUMxQixZQUFZLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUNMLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDRyxJQUFJLENBQUM7QUFDMUUsVUFBVSxFQUFFLGVBQWU7QUFDM0IsUUFBUSxFQUFFLGdCQUFnQixDQUNwQixDQUFDO0lBQ0gsQ0FBQyxNQUFNO01BQ0xYLElBQUksQ0FBQ2EsTUFBTSxDQUNULENBQUMsZ0JBQWdCO0FBQ3pCLFVBQVUsQ0FBQyxlQUFlO0FBQzFCLFlBQVksQ0FBQywwQkFBMEIsQ0FDekIsV0FBVyxDQUFDLENBQUNULGNBQWMsQ0FBQyxDQUM1QixNQUFNLENBQUMsQ0FBQ08sSUFBSSxDQUFDO0FBRTNCLFVBQVUsRUFBRSxlQUFlO0FBQzNCLFFBQVEsRUFBRSxnQkFBZ0IsQ0FDcEIsQ0FBQztJQUNIO0VBQ0YsQ0FBQyxDQUFDO0FBQ0oiLCJpZ25vcmVMaXN0IjpbXX0=
