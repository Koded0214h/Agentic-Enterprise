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
exports.ExitFlow = ExitFlow;
var compiler_runtime_1 = require("react/compiler-runtime");
var sample_js_1 = require("lodash-es/sample.js");
var react_1 = require("react");
var gracefulShutdown_js_1 = require("../utils/gracefulShutdown.js");
var WorktreeExitDialog_js_1 = require("./WorktreeExitDialog.js");
var GOODBYE_MESSAGES = ['Goodbye!', 'See ya!', 'Bye!', 'Catch you later!'];
function getRandomGoodbyeMessage() {
    var _a;
    return (_a = (0, sample_js_1.default)(GOODBYE_MESSAGES)) !== null && _a !== void 0 ? _a : 'Goodbye!';
}
function ExitFlow(t0) {
    var $ = (0, compiler_runtime_1.c)(5);
    var showWorktree = t0.showWorktree, onDone = t0.onDone, onCancel = t0.onCancel;
    var t1;
    if ($[0] !== onDone) {
        t1 = function onExit(resultMessage) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            onDone(resultMessage !== null && resultMessage !== void 0 ? resultMessage : getRandomGoodbyeMessage());
                            return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0, "prompt_input_exit")];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        $[0] = onDone;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var onExit = t1;
    if (showWorktree) {
        var t2 = void 0;
        if ($[2] !== onCancel || $[3] !== onExit) {
            t2 = <WorktreeExitDialog_js_1.WorktreeExitDialog onDone={onExit} onCancel={onCancel}/>;
            $[2] = onCancel;
            $[3] = onExit;
            $[4] = t2;
        }
        else {
            t2 = $[4];
        }
        return t2;
    }
    return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzYW1wbGUiLCJSZWFjdCIsImdyYWNlZnVsU2h1dGRvd24iLCJXb3JrdHJlZUV4aXREaWFsb2ciLCJHT09EQllFX01FU1NBR0VTIiwiZ2V0UmFuZG9tR29vZGJ5ZU1lc3NhZ2UiLCJQcm9wcyIsIm9uRG9uZSIsIm1lc3NhZ2UiLCJvbkNhbmNlbCIsInNob3dXb3JrdHJlZSIsIkV4aXRGbG93IiwidDAiLCIkIiwiX2MiLCJ0MSIsIm9uRXhpdCIsInJlc3VsdE1lc3NhZ2UiLCJ0MiJdLCJzb3VyY2VzIjpbIkV4aXRGbG93LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc2FtcGxlIGZyb20gJ2xvZGFzaC1lcy9zYW1wbGUuanMnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBncmFjZWZ1bFNodXRkb3duIH0gZnJvbSAnLi4vdXRpbHMvZ3JhY2VmdWxTaHV0ZG93bi5qcydcbmltcG9ydCB7IFdvcmt0cmVlRXhpdERpYWxvZyB9IGZyb20gJy4vV29ya3RyZWVFeGl0RGlhbG9nLmpzJ1xuXG5jb25zdCBHT09EQllFX01FU1NBR0VTID0gWydHb29kYnllIScsICdTZWUgeWEhJywgJ0J5ZSEnLCAnQ2F0Y2ggeW91IGxhdGVyISddXG5cbmZ1bmN0aW9uIGdldFJhbmRvbUdvb2RieWVNZXNzYWdlKCk6IHN0cmluZyB7XG4gIHJldHVybiBzYW1wbGUoR09PREJZRV9NRVNTQUdFUykgPz8gJ0dvb2RieWUhJ1xufVxuXG50eXBlIFByb3BzID0ge1xuICBvbkRvbmU6IChtZXNzYWdlPzogc3RyaW5nKSA9PiB2b2lkXG4gIG9uQ2FuY2VsPzogKCkgPT4gdm9pZFxuICBzaG93V29ya3RyZWU6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEV4aXRGbG93KHtcbiAgc2hvd1dvcmt0cmVlLFxuICBvbkRvbmUsXG4gIG9uQ2FuY2VsLFxufTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBhc3luYyBmdW5jdGlvbiBvbkV4aXQocmVzdWx0TWVzc2FnZT86IHN0cmluZykge1xuICAgIG9uRG9uZShyZXN1bHRNZXNzYWdlID8/IGdldFJhbmRvbUdvb2RieWVNZXNzYWdlKCkpXG4gICAgYXdhaXQgZ3JhY2VmdWxTaHV0ZG93bigwLCAncHJvbXB0X2lucHV0X2V4aXQnKVxuICB9XG5cbiAgaWYgKHNob3dXb3JrdHJlZSkge1xuICAgIHJldHVybiA8V29ya3RyZWVFeGl0RGlhbG9nIG9uRG9uZT17b25FeGl0fSBvbkNhbmNlbD17b25DYW5jZWx9IC8+XG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsTUFBTSxNQUFNLHFCQUFxQjtBQUN4QyxPQUFPQyxLQUFLLE1BQU0sT0FBTztBQUN6QixTQUFTQyxnQkFBZ0IsUUFBUSw4QkFBOEI7QUFDL0QsU0FBU0Msa0JBQWtCLFFBQVEseUJBQXlCO0FBRTVELE1BQU1DLGdCQUFnQixHQUFHLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUM7QUFFNUUsU0FBU0MsdUJBQXVCQSxDQUFBLENBQUUsRUFBRSxNQUFNLENBQUM7RUFDekMsT0FBT0wsTUFBTSxDQUFDSSxnQkFBZ0IsQ0FBQyxJQUFJLFVBQVU7QUFDL0M7QUFFQSxLQUFLRSxLQUFLLEdBQUc7RUFDWEMsTUFBTSxFQUFFLENBQUNDLE9BQWdCLENBQVIsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJO0VBQ2xDQyxRQUFRLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSTtFQUNyQkMsWUFBWSxFQUFFLE9BQU87QUFDdkIsQ0FBQztBQUVELE9BQU8sU0FBQUMsU0FBQUMsRUFBQTtFQUFBLE1BQUFDLENBQUEsR0FBQUMsRUFBQTtFQUFrQjtJQUFBSixZQUFBO0lBQUFILE1BQUE7SUFBQUU7RUFBQSxJQUFBRyxFQUlqQjtFQUFBLElBQUFHLEVBQUE7RUFBQSxJQUFBRixDQUFBLFFBQUFOLE1BQUE7SUFDTlEsRUFBQSxrQkFBQUMsT0FBQUMsYUFBQTtNQUNFVixNQUFNLENBQUNVLGFBQTBDLElBQXpCWix1QkFBdUIsQ0FBQyxDQUFDLENBQUM7TUFDbEQsTUFBTUgsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLG1CQUFtQixDQUFDO0lBQUEsQ0FDL0M7SUFBQVcsQ0FBQSxNQUFBTixNQUFBO0lBQUFNLENBQUEsTUFBQUUsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQUYsQ0FBQTtFQUFBO0VBSEQsTUFBQUcsTUFBQSxHQUFBRCxFQUdDO0VBRUQsSUFBSUwsWUFBWTtJQUFBLElBQUFRLEVBQUE7SUFBQSxJQUFBTCxDQUFBLFFBQUFKLFFBQUEsSUFBQUksQ0FBQSxRQUFBRyxNQUFBO01BQ1BFLEVBQUEsSUFBQyxrQkFBa0IsQ0FBU0YsTUFBTSxDQUFOQSxPQUFLLENBQUMsQ0FBWVAsUUFBUSxDQUFSQSxTQUFPLENBQUMsR0FBSTtNQUFBSSxDQUFBLE1BQUFKLFFBQUE7TUFBQUksQ0FBQSxNQUFBRyxNQUFBO01BQUFILENBQUEsTUFBQUssRUFBQTtJQUFBO01BQUFBLEVBQUEsR0FBQUwsQ0FBQTtJQUFBO0lBQUEsT0FBMURLLEVBQTBEO0VBQUE7RUFDbEUsT0FFTSxJQUFJO0FBQUEiLCJpZ25vcmVMaXN0IjpbXX0=
