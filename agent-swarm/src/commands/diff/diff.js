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
exports.call = void 0;
var React = require("react");
var call = function (onDone, context) { return __awaiter(void 0, void 0, void 0, function () {
    var DiffDialog;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../../components/diff/DiffDialog.js'); })];
            case 1:
                DiffDialog = (_a.sent()).DiffDialog;
                return [2 /*return*/, <DiffDialog messages={context.messages} onDone={onDone}/>];
        }
    });
}); };
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkxvY2FsSlNYQ29tbWFuZENhbGwiLCJjYWxsIiwib25Eb25lIiwiY29udGV4dCIsIkRpZmZEaWFsb2ciLCJtZXNzYWdlcyJdLCJzb3VyY2VzIjpbImRpZmYudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDYWxsIH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcblxuZXhwb3J0IGNvbnN0IGNhbGw6IExvY2FsSlNYQ29tbWFuZENhbGwgPSBhc3luYyAob25Eb25lLCBjb250ZXh0KSA9PiB7XG4gIGNvbnN0IHsgRGlmZkRpYWxvZyB9ID0gYXdhaXQgaW1wb3J0KCcuLi8uLi9jb21wb25lbnRzL2RpZmYvRGlmZkRpYWxvZy5qcycpXG4gIHJldHVybiA8RGlmZkRpYWxvZyBtZXNzYWdlcz17Y29udGV4dC5tZXNzYWdlc30gb25Eb25lPXtvbkRvbmV9IC8+XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBS0EsS0FBSyxNQUFNLE9BQU87QUFDOUIsY0FBY0MsbUJBQW1CLFFBQVEsd0JBQXdCO0FBRWpFLE9BQU8sTUFBTUMsSUFBSSxFQUFFRCxtQkFBbUIsR0FBRyxNQUFBQyxDQUFPQyxNQUFNLEVBQUVDLE9BQU8sS0FBSztFQUNsRSxNQUFNO0lBQUVDO0VBQVcsQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLHFDQUFxQyxDQUFDO0VBQzFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUNELE9BQU8sQ0FBQ0UsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUNILE1BQU0sQ0FBQyxHQUFHO0FBQ25FLENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=
