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
var React = require("react");
var BackgroundTasksDialog_js_1 = require("../../components/tasks/BackgroundTasksDialog.js");
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, <BackgroundTasksDialog_js_1.BackgroundTasksDialog toolUseContext={context} onDone={onDone}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkxvY2FsSlNYQ29tbWFuZENvbnRleHQiLCJCYWNrZ3JvdW5kVGFza3NEaWFsb2ciLCJMb2NhbEpTWENvbW1hbmRPbkRvbmUiLCJjYWxsIiwib25Eb25lIiwiY29udGV4dCIsIlByb21pc2UiLCJSZWFjdE5vZGUiXSwic291cmNlcyI6WyJ0YXNrcy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZENvbnRleHQgfSBmcm9tICcuLi8uLi9jb21tYW5kcy5qcydcbmltcG9ydCB7IEJhY2tncm91bmRUYXNrc0RpYWxvZyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvdGFza3MvQmFja2dyb3VuZFRhc2tzRGlhbG9nLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRPbkRvbmUgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsbChcbiAgb25Eb25lOiBMb2NhbEpTWENvbW1hbmRPbkRvbmUsXG4gIGNvbnRleHQ6IExvY2FsSlNYQ29tbWFuZENvbnRleHQsXG4pOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICByZXR1cm4gPEJhY2tncm91bmRUYXNrc0RpYWxvZyB0b29sVXNlQ29udGV4dD17Y29udGV4dH0gb25Eb25lPXtvbkRvbmV9IC8+XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBS0EsS0FBSyxNQUFNLE9BQU87QUFDOUIsY0FBY0Msc0JBQXNCLFFBQVEsbUJBQW1CO0FBQy9ELFNBQVNDLHFCQUFxQixRQUFRLGlEQUFpRDtBQUN2RixjQUFjQyxxQkFBcUIsUUFBUSx3QkFBd0I7QUFFbkUsT0FBTyxlQUFlQyxJQUFJQSxDQUN4QkMsTUFBTSxFQUFFRixxQkFBcUIsRUFDN0JHLE9BQU8sRUFBRUwsc0JBQXNCLENBQ2hDLEVBQUVNLE9BQU8sQ0FBQ1AsS0FBSyxDQUFDUSxTQUFTLENBQUMsQ0FBQztFQUMxQixPQUFPLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLENBQUNGLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDRCxNQUFNLENBQUMsR0FBRztBQUMzRSIsImlnbm9yZUxpc3QiOltdfQ==
