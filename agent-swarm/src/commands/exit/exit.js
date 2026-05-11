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
exports.call = call;
var bun_bundle_1 = require("bun:bundle");
var child_process_1 = require("child_process");
var sample_js_1 = require("lodash-es/sample.js");
var React = require("react");
var ExitFlow_js_1 = require("../../components/ExitFlow.js");
var concurrentSessions_js_1 = require("../../utils/concurrentSessions.js");
var gracefulShutdown_js_1 = require("../../utils/gracefulShutdown.js");
var worktree_js_1 = require("../../utils/worktree.js");
var GOODBYE_MESSAGES = ['Goodbye!', 'See ya!', 'Bye!', 'Catch you later!'];
function getRandomGoodbyeMessage() {
    var _a;
    return (_a = (0, sample_js_1.default)(GOODBYE_MESSAGES)) !== null && _a !== void 0 ? _a : 'Goodbye!';
}
function call(onDone) {
    return __awaiter(this, void 0, void 0, function () {
        var showWorktree;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Inside a `claude --bg` tmux session: detach instead of kill. The REPL
                    // keeps running; `claude attach` can reconnect. Covers /exit, /quit,
                    // ctrl+c, ctrl+d — all funnel through here via REPL's handleExit.
                    if ((0, bun_bundle_1.feature)('BG_SESSIONS') && (0, concurrentSessions_js_1.isBgSession)()) {
                        onDone();
                        (0, child_process_1.spawnSync)('tmux', ['detach-client'], {
                            stdio: 'ignore'
                        });
                        return [2 /*return*/, null];
                    }
                    showWorktree = (0, worktree_js_1.getCurrentWorktreeSession)() !== null;
                    if (showWorktree) {
                        return [2 /*return*/, <ExitFlow_js_1.ExitFlow showWorktree={showWorktree} onDone={onDone} onCancel={function () { return onDone(); }}/>];
                    }
                    onDone(getRandomGoodbyeMessage());
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0, 'prompt_input_exit')];
                case 1:
                    _a.sent();
                    return [2 /*return*/, null];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmZWF0dXJlIiwic3Bhd25TeW5jIiwic2FtcGxlIiwiUmVhY3QiLCJFeGl0RmxvdyIsIkxvY2FsSlNYQ29tbWFuZE9uRG9uZSIsImlzQmdTZXNzaW9uIiwiZ3JhY2VmdWxTaHV0ZG93biIsImdldEN1cnJlbnRXb3JrdHJlZVNlc3Npb24iLCJHT09EQllFX01FU1NBR0VTIiwiZ2V0UmFuZG9tR29vZGJ5ZU1lc3NhZ2UiLCJjYWxsIiwib25Eb25lIiwiUHJvbWlzZSIsIlJlYWN0Tm9kZSIsInN0ZGlvIiwic2hvd1dvcmt0cmVlIl0sInNvdXJjZXMiOlsiZXhpdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmVhdHVyZSB9IGZyb20gJ2J1bjpidW5kbGUnXG5pbXBvcnQgeyBzcGF3blN5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHNhbXBsZSBmcm9tICdsb2Rhc2gtZXMvc2FtcGxlLmpzJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBFeGl0RmxvdyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRXhpdEZsb3cuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5pbXBvcnQgeyBpc0JnU2Vzc2lvbiB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmN1cnJlbnRTZXNzaW9ucy5qcydcbmltcG9ydCB7IGdyYWNlZnVsU2h1dGRvd24gfSBmcm9tICcuLi8uLi91dGlscy9ncmFjZWZ1bFNodXRkb3duLmpzJ1xuaW1wb3J0IHsgZ2V0Q3VycmVudFdvcmt0cmVlU2Vzc2lvbiB9IGZyb20gJy4uLy4uL3V0aWxzL3dvcmt0cmVlLmpzJ1xuXG5jb25zdCBHT09EQllFX01FU1NBR0VTID0gWydHb29kYnllIScsICdTZWUgeWEhJywgJ0J5ZSEnLCAnQ2F0Y2ggeW91IGxhdGVyISddXG5cbmZ1bmN0aW9uIGdldFJhbmRvbUdvb2RieWVNZXNzYWdlKCk6IHN0cmluZyB7XG4gIHJldHVybiBzYW1wbGUoR09PREJZRV9NRVNTQUdFUykgPz8gJ0dvb2RieWUhJ1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsbChcbiAgb25Eb25lOiBMb2NhbEpTWENvbW1hbmRPbkRvbmUsXG4pOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICAvLyBJbnNpZGUgYSBgY2xhdWRlIC0tYmdgIHRtdXggc2Vzc2lvbjogZGV0YWNoIGluc3RlYWQgb2Yga2lsbC4gVGhlIFJFUExcbiAgLy8ga2VlcHMgcnVubmluZzsgYGNsYXVkZSBhdHRhY2hgIGNhbiByZWNvbm5lY3QuIENvdmVycyAvZXhpdCwgL3F1aXQsXG4gIC8vIGN0cmwrYywgY3RybCtkIOKAlCBhbGwgZnVubmVsIHRocm91Z2ggaGVyZSB2aWEgUkVQTCdzIGhhbmRsZUV4aXQuXG4gIGlmIChmZWF0dXJlKCdCR19TRVNTSU9OUycpICYmIGlzQmdTZXNzaW9uKCkpIHtcbiAgICBvbkRvbmUoKVxuICAgIHNwYXduU3luYygndG11eCcsIFsnZGV0YWNoLWNsaWVudCddLCB7IHN0ZGlvOiAnaWdub3JlJyB9KVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBzaG93V29ya3RyZWUgPSBnZXRDdXJyZW50V29ya3RyZWVTZXNzaW9uKCkgIT09IG51bGxcblxuICBpZiAoc2hvd1dvcmt0cmVlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxFeGl0Rmxvd1xuICAgICAgICBzaG93V29ya3RyZWU9e3Nob3dXb3JrdHJlZX1cbiAgICAgICAgb25Eb25lPXtvbkRvbmV9XG4gICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBvbkRvbmUoKX1cbiAgICAgIC8+XG4gICAgKVxuICB9XG5cbiAgb25Eb25lKGdldFJhbmRvbUdvb2RieWVNZXNzYWdlKCkpXG4gIGF3YWl0IGdyYWNlZnVsU2h1dGRvd24oMCwgJ3Byb21wdF9pbnB1dF9leGl0JylcbiAgcmV0dXJuIG51bGxcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsT0FBTyxRQUFRLFlBQVk7QUFDcEMsU0FBU0MsU0FBUyxRQUFRLGVBQWU7QUFDekMsT0FBT0MsTUFBTSxNQUFNLHFCQUFxQjtBQUN4QyxPQUFPLEtBQUtDLEtBQUssTUFBTSxPQUFPO0FBQzlCLFNBQVNDLFFBQVEsUUFBUSw4QkFBOEI7QUFDdkQsY0FBY0MscUJBQXFCLFFBQVEsd0JBQXdCO0FBQ25FLFNBQVNDLFdBQVcsUUFBUSxtQ0FBbUM7QUFDL0QsU0FBU0MsZ0JBQWdCLFFBQVEsaUNBQWlDO0FBQ2xFLFNBQVNDLHlCQUF5QixRQUFRLHlCQUF5QjtBQUVuRSxNQUFNQyxnQkFBZ0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDO0FBRTVFLFNBQVNDLHVCQUF1QkEsQ0FBQSxDQUFFLEVBQUUsTUFBTSxDQUFDO0VBQ3pDLE9BQU9SLE1BQU0sQ0FBQ08sZ0JBQWdCLENBQUMsSUFBSSxVQUFVO0FBQy9DO0FBRUEsT0FBTyxlQUFlRSxJQUFJQSxDQUN4QkMsTUFBTSxFQUFFUCxxQkFBcUIsQ0FDOUIsRUFBRVEsT0FBTyxDQUFDVixLQUFLLENBQUNXLFNBQVMsQ0FBQyxDQUFDO0VBQzFCO0VBQ0E7RUFDQTtFQUNBLElBQUlkLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSU0sV0FBVyxDQUFDLENBQUMsRUFBRTtJQUMzQ00sTUFBTSxDQUFDLENBQUM7SUFDUlgsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFO01BQUVjLEtBQUssRUFBRTtJQUFTLENBQUMsQ0FBQztJQUN6RCxPQUFPLElBQUk7RUFDYjtFQUVBLE1BQU1DLFlBQVksR0FBR1IseUJBQXlCLENBQUMsQ0FBQyxLQUFLLElBQUk7RUFFekQsSUFBSVEsWUFBWSxFQUFFO0lBQ2hCLE9BQ0UsQ0FBQyxRQUFRLENBQ1AsWUFBWSxDQUFDLENBQUNBLFlBQVksQ0FBQyxDQUMzQixNQUFNLENBQUMsQ0FBQ0osTUFBTSxDQUFDLENBQ2YsUUFBUSxDQUFDLENBQUMsTUFBTUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUN6QjtFQUVOO0VBRUFBLE1BQU0sQ0FBQ0YsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0VBQ2pDLE1BQU1ILGdCQUFnQixDQUFDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQztFQUM5QyxPQUFPLElBQUk7QUFDYiIsImlnbm9yZUxpc3QiOltdfQ==
