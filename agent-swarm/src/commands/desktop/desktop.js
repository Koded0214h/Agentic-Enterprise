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
var react_1 = require("react");
var DesktopHandoff_js_1 = require("../../components/DesktopHandoff.js");
function call(onDone) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, <DesktopHandoff_js_1.DesktopHandoff onDone={onDone}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkNvbW1hbmRSZXN1bHREaXNwbGF5IiwiRGVza3RvcEhhbmRvZmYiLCJjYWxsIiwib25Eb25lIiwicmVzdWx0Iiwib3B0aW9ucyIsImRpc3BsYXkiLCJQcm9taXNlIiwiUmVhY3ROb2RlIl0sInNvdXJjZXMiOlsiZGVza3RvcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDb21tYW5kUmVzdWx0RGlzcGxheSB9IGZyb20gJy4uLy4uL2NvbW1hbmRzLmpzJ1xuaW1wb3J0IHsgRGVza3RvcEhhbmRvZmYgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0Rlc2t0b3BIYW5kb2ZmLmpzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsbChcbiAgb25Eb25lOiAoXG4gICAgcmVzdWx0Pzogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7IGRpc3BsYXk/OiBDb21tYW5kUmVzdWx0RGlzcGxheSB9LFxuICApID0+IHZvaWQsXG4pOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICByZXR1cm4gPERlc2t0b3BIYW5kb2ZmIG9uRG9uZT17b25Eb25lfSAvPlxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxLQUFLLE1BQU0sT0FBTztBQUN6QixjQUFjQyxvQkFBb0IsUUFBUSxtQkFBbUI7QUFDN0QsU0FBU0MsY0FBYyxRQUFRLG9DQUFvQztBQUVuRSxPQUFPLGVBQWVDLElBQUlBLENBQ3hCQyxNQUFNLEVBQUUsQ0FDTkMsTUFBZSxDQUFSLEVBQUUsTUFBTSxFQUNmQyxPQUE0QyxDQUFwQyxFQUFFO0VBQUVDLE9BQU8sQ0FBQyxFQUFFTixvQkFBb0I7QUFBQyxDQUFDLEVBQzVDLEdBQUcsSUFBSSxDQUNWLEVBQUVPLE9BQU8sQ0FBQ1IsS0FBSyxDQUFDUyxTQUFTLENBQUMsQ0FBQztFQUMxQixPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDTCxNQUFNLENBQUMsR0FBRztBQUMzQyIsImlnbm9yZUxpc3QiOltdfQ==
