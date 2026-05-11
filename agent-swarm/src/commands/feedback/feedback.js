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
exports.renderFeedbackComponent = renderFeedbackComponent;
exports.call = call;
var React = require("react");
var Feedback_js_1 = require("../../components/Feedback.js");
// Shared function to render the Feedback component
function renderFeedbackComponent(onDone, abortSignal, messages, initialDescription, backgroundTasks) {
    if (initialDescription === void 0) { initialDescription = ''; }
    if (backgroundTasks === void 0) { backgroundTasks = {}; }
    return <Feedback_js_1.Feedback abortSignal={abortSignal} messages={messages} initialDescription={initialDescription} onDone={onDone} backgroundTasks={backgroundTasks}/>;
}
function call(onDone, context, args) {
    return __awaiter(this, void 0, void 0, function () {
        var initialDescription;
        return __generator(this, function (_a) {
            initialDescription = args || '';
            return [2 /*return*/, renderFeedbackComponent(onDone, context.abortController.signal, context.messages, initialDescription)];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkNvbW1hbmRSZXN1bHREaXNwbGF5IiwiTG9jYWxKU1hDb21tYW5kQ29udGV4dCIsIkZlZWRiYWNrIiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiTWVzc2FnZSIsInJlbmRlckZlZWRiYWNrQ29tcG9uZW50Iiwib25Eb25lIiwicmVzdWx0Iiwib3B0aW9ucyIsImRpc3BsYXkiLCJhYm9ydFNpZ25hbCIsIkFib3J0U2lnbmFsIiwibWVzc2FnZXMiLCJpbml0aWFsRGVzY3JpcHRpb24iLCJiYWNrZ3JvdW5kVGFza3MiLCJ0YXNrSWQiLCJ0eXBlIiwiaWRlbnRpdHkiLCJhZ2VudElkIiwiUmVhY3ROb2RlIiwiY2FsbCIsImNvbnRleHQiLCJhcmdzIiwiUHJvbWlzZSIsImFib3J0Q29udHJvbGxlciIsInNpZ25hbCJdLCJzb3VyY2VzIjpbImZlZWRiYWNrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB0eXBlIHtcbiAgQ29tbWFuZFJlc3VsdERpc3BsYXksXG4gIExvY2FsSlNYQ29tbWFuZENvbnRleHQsXG59IGZyb20gJy4uLy4uL2NvbW1hbmRzLmpzJ1xuaW1wb3J0IHsgRmVlZGJhY2sgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0ZlZWRiYWNrLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRPbkRvbmUgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlIH0gZnJvbSAnLi4vLi4vdHlwZXMvbWVzc2FnZS5qcydcblxuLy8gU2hhcmVkIGZ1bmN0aW9uIHRvIHJlbmRlciB0aGUgRmVlZGJhY2sgY29tcG9uZW50XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRmVlZGJhY2tDb21wb25lbnQoXG4gIG9uRG9uZTogKFxuICAgIHJlc3VsdD86IHN0cmluZyxcbiAgICBvcHRpb25zPzogeyBkaXNwbGF5PzogQ29tbWFuZFJlc3VsdERpc3BsYXkgfSxcbiAgKSA9PiB2b2lkLFxuICBhYm9ydFNpZ25hbDogQWJvcnRTaWduYWwsXG4gIG1lc3NhZ2VzOiBNZXNzYWdlW10sXG4gIGluaXRpYWxEZXNjcmlwdGlvbjogc3RyaW5nID0gJycsXG4gIGJhY2tncm91bmRUYXNrczoge1xuICAgIFt0YXNrSWQ6IHN0cmluZ106IHtcbiAgICAgIHR5cGU6IHN0cmluZ1xuICAgICAgaWRlbnRpdHk/OiB7IGFnZW50SWQ6IHN0cmluZyB9XG4gICAgICBtZXNzYWdlcz86IE1lc3NhZ2VbXVxuICAgIH1cbiAgfSA9IHt9LFxuKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgcmV0dXJuIChcbiAgICA8RmVlZGJhY2tcbiAgICAgIGFib3J0U2lnbmFsPXthYm9ydFNpZ25hbH1cbiAgICAgIG1lc3NhZ2VzPXttZXNzYWdlc31cbiAgICAgIGluaXRpYWxEZXNjcmlwdGlvbj17aW5pdGlhbERlc2NyaXB0aW9ufVxuICAgICAgb25Eb25lPXtvbkRvbmV9XG4gICAgICBiYWNrZ3JvdW5kVGFza3M9e2JhY2tncm91bmRUYXNrc31cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgY29udGV4dDogTG9jYWxKU1hDb21tYW5kQ29udGV4dCxcbiAgYXJncz86IHN0cmluZyxcbik6IFByb21pc2U8UmVhY3QuUmVhY3ROb2RlPiB7XG4gIGNvbnN0IGluaXRpYWxEZXNjcmlwdGlvbiA9IGFyZ3MgfHwgJydcbiAgcmV0dXJuIHJlbmRlckZlZWRiYWNrQ29tcG9uZW50KFxuICAgIG9uRG9uZSxcbiAgICBjb250ZXh0LmFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgY29udGV4dC5tZXNzYWdlcyxcbiAgICBpbml0aWFsRGVzY3JpcHRpb24sXG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixjQUNFQyxvQkFBb0IsRUFDcEJDLHNCQUFzQixRQUNqQixtQkFBbUI7QUFDMUIsU0FBU0MsUUFBUSxRQUFRLDhCQUE4QjtBQUN2RCxjQUFjQyxxQkFBcUIsUUFBUSx3QkFBd0I7QUFDbkUsY0FBY0MsT0FBTyxRQUFRLHdCQUF3Qjs7QUFFckQ7QUFDQSxPQUFPLFNBQVNDLHVCQUF1QkEsQ0FDckNDLE1BQU0sRUFBRSxDQUNOQyxNQUFlLENBQVIsRUFBRSxNQUFNLEVBQ2ZDLE9BQTRDLENBQXBDLEVBQUU7RUFBRUMsT0FBTyxDQUFDLEVBQUVULG9CQUFvQjtBQUFDLENBQUMsRUFDNUMsR0FBRyxJQUFJLEVBQ1RVLFdBQVcsRUFBRUMsV0FBVyxFQUN4QkMsUUFBUSxFQUFFUixPQUFPLEVBQUUsRUFDbkJTLGtCQUFrQixFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQy9CQyxlQUFlLEVBQUU7RUFDZixDQUFDQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7SUFDaEJDLElBQUksRUFBRSxNQUFNO0lBQ1pDLFFBQVEsQ0FBQyxFQUFFO01BQUVDLE9BQU8sRUFBRSxNQUFNO0lBQUMsQ0FBQztJQUM5Qk4sUUFBUSxDQUFDLEVBQUVSLE9BQU8sRUFBRTtFQUN0QixDQUFDO0FBQ0gsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUNQLEVBQUVMLEtBQUssQ0FBQ29CLFNBQVMsQ0FBQztFQUNqQixPQUNFLENBQUMsUUFBUSxDQUNQLFdBQVcsQ0FBQyxDQUFDVCxXQUFXLENBQUMsQ0FDekIsUUFBUSxDQUFDLENBQUNFLFFBQVEsQ0FBQyxDQUNuQixrQkFBa0IsQ0FBQyxDQUFDQyxrQkFBa0IsQ0FBQyxDQUN2QyxNQUFNLENBQUMsQ0FBQ1AsTUFBTSxDQUFDLENBQ2YsZUFBZSxDQUFDLENBQUNRLGVBQWUsQ0FBQyxHQUNqQztBQUVOO0FBRUEsT0FBTyxlQUFlTSxJQUFJQSxDQUN4QmQsTUFBTSxFQUFFSCxxQkFBcUIsRUFDN0JrQixPQUFPLEVBQUVwQixzQkFBc0IsRUFDL0JxQixJQUFhLENBQVIsRUFBRSxNQUFNLENBQ2QsRUFBRUMsT0FBTyxDQUFDeEIsS0FBSyxDQUFDb0IsU0FBUyxDQUFDLENBQUM7RUFDMUIsTUFBTU4sa0JBQWtCLEdBQUdTLElBQUksSUFBSSxFQUFFO0VBQ3JDLE9BQU9qQix1QkFBdUIsQ0FDNUJDLE1BQU0sRUFDTmUsT0FBTyxDQUFDRyxlQUFlLENBQUNDLE1BQU0sRUFDOUJKLE9BQU8sQ0FBQ1QsUUFBUSxFQUNoQkMsa0JBQ0YsQ0FBQztBQUNIIiwiaWdub3JlTGlzdCI6W119
