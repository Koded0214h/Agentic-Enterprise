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
exports.launchRepl = launchRepl;
var react_1 = require("react");
function launchRepl(root, appProps, replProps, renderAndRun) {
    return __awaiter(this, void 0, void 0, function () {
        var App, REPL;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./components/App.js'); })];
                case 1:
                    App = (_a.sent()).App;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./screens/REPL.js'); })];
                case 2:
                    REPL = (_a.sent()).REPL;
                    return [4 /*yield*/, renderAndRun(root, <App {...appProps}>
      <REPL {...replProps}/>
    </App>)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIlN0YXRzU3RvcmUiLCJSb290IiwiUHJvcHMiLCJSRVBMUHJvcHMiLCJBcHBTdGF0ZSIsIkZwc01ldHJpY3MiLCJBcHBXcmFwcGVyUHJvcHMiLCJnZXRGcHNNZXRyaWNzIiwic3RhdHMiLCJpbml0aWFsU3RhdGUiLCJsYXVuY2hSZXBsIiwicm9vdCIsImFwcFByb3BzIiwicmVwbFByb3BzIiwicmVuZGVyQW5kUnVuIiwiZWxlbWVudCIsIlJlYWN0Tm9kZSIsIlByb21pc2UiLCJBcHAiLCJSRVBMIl0sInNvdXJjZXMiOlsicmVwbExhdW5jaGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IFN0YXRzU3RvcmUgfSBmcm9tICcuL2NvbnRleHQvc3RhdHMuanMnXG5pbXBvcnQgdHlwZSB7IFJvb3QgfSBmcm9tICcuL2luay5qcydcbmltcG9ydCB0eXBlIHsgUHJvcHMgYXMgUkVQTFByb3BzIH0gZnJvbSAnLi9zY3JlZW5zL1JFUEwuanMnXG5pbXBvcnQgdHlwZSB7IEFwcFN0YXRlIH0gZnJvbSAnLi9zdGF0ZS9BcHBTdGF0ZVN0b3JlLmpzJ1xuaW1wb3J0IHR5cGUgeyBGcHNNZXRyaWNzIH0gZnJvbSAnLi91dGlscy9mcHNUcmFja2VyLmpzJ1xuXG50eXBlIEFwcFdyYXBwZXJQcm9wcyA9IHtcbiAgZ2V0RnBzTWV0cmljczogKCkgPT4gRnBzTWV0cmljcyB8IHVuZGVmaW5lZFxuICBzdGF0cz86IFN0YXRzU3RvcmVcbiAgaW5pdGlhbFN0YXRlOiBBcHBTdGF0ZVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGF1bmNoUmVwbChcbiAgcm9vdDogUm9vdCxcbiAgYXBwUHJvcHM6IEFwcFdyYXBwZXJQcm9wcyxcbiAgcmVwbFByb3BzOiBSRVBMUHJvcHMsXG4gIHJlbmRlckFuZFJ1bjogKHJvb3Q6IFJvb3QsIGVsZW1lbnQ6IFJlYWN0LlJlYWN0Tm9kZSkgPT4gUHJvbWlzZTx2b2lkPixcbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IEFwcCB9ID0gYXdhaXQgaW1wb3J0KCcuL2NvbXBvbmVudHMvQXBwLmpzJylcbiAgY29uc3QgeyBSRVBMIH0gPSBhd2FpdCBpbXBvcnQoJy4vc2NyZWVucy9SRVBMLmpzJylcbiAgYXdhaXQgcmVuZGVyQW5kUnVuKFxuICAgIHJvb3QsXG4gICAgPEFwcCB7Li4uYXBwUHJvcHN9PlxuICAgICAgPFJFUEwgey4uLnJlcGxQcm9wc30gLz5cbiAgICA8L0FwcD4sXG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsS0FBSyxNQUFNLE9BQU87QUFDekIsY0FBY0MsVUFBVSxRQUFRLG9CQUFvQjtBQUNwRCxjQUFjQyxJQUFJLFFBQVEsVUFBVTtBQUNwQyxjQUFjQyxLQUFLLElBQUlDLFNBQVMsUUFBUSxtQkFBbUI7QUFDM0QsY0FBY0MsUUFBUSxRQUFRLDBCQUEwQjtBQUN4RCxjQUFjQyxVQUFVLFFBQVEsdUJBQXVCO0FBRXZELEtBQUtDLGVBQWUsR0FBRztFQUNyQkMsYUFBYSxFQUFFLEdBQUcsR0FBR0YsVUFBVSxHQUFHLFNBQVM7RUFDM0NHLEtBQUssQ0FBQyxFQUFFUixVQUFVO0VBQ2xCUyxZQUFZLEVBQUVMLFFBQVE7QUFDeEIsQ0FBQztBQUVELE9BQU8sZUFBZU0sVUFBVUEsQ0FDOUJDLElBQUksRUFBRVYsSUFBSSxFQUNWVyxRQUFRLEVBQUVOLGVBQWUsRUFDekJPLFNBQVMsRUFBRVYsU0FBUyxFQUNwQlcsWUFBWSxFQUFFLENBQUNILElBQUksRUFBRVYsSUFBSSxFQUFFYyxPQUFPLEVBQUVoQixLQUFLLENBQUNpQixTQUFTLEVBQUUsR0FBR0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUN0RSxFQUFFQSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDZixNQUFNO0lBQUVDO0VBQUksQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLHFCQUFxQixDQUFDO0VBQ25ELE1BQU07SUFBRUM7RUFBSyxDQUFDLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLENBQUM7RUFDbEQsTUFBTUwsWUFBWSxDQUNoQkgsSUFBSSxFQUNKLENBQUMsR0FBRyxDQUFDLElBQUlDLFFBQVEsQ0FBQztBQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUlDLFNBQVMsQ0FBQztBQUMxQixJQUFJLEVBQUUsR0FBRyxDQUNQLENBQUM7QUFDSCIsImlnbm9yZUxpc3QiOltdfQ==
