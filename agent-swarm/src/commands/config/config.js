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
var Settings_js_1 = require("../../components/Settings/Settings.js");
var call = function (onDone, context) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, <Settings_js_1.Settings onClose={onDone} context={context} defaultTab="Config"/>];
    });
}); };
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIlNldHRpbmdzIiwiTG9jYWxKU1hDb21tYW5kQ2FsbCIsImNhbGwiLCJvbkRvbmUiLCJjb250ZXh0Il0sInNvdXJjZXMiOlsiY29uZmlnLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFNldHRpbmdzIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9TZXR0aW5ncy9TZXR0aW5ncy5qcydcbmltcG9ydCB0eXBlIHsgTG9jYWxKU1hDb21tYW5kQ2FsbCB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5cbmV4cG9ydCBjb25zdCBjYWxsOiBMb2NhbEpTWENvbW1hbmRDYWxsID0gYXN5bmMgKG9uRG9uZSwgY29udGV4dCkgPT4ge1xuICByZXR1cm4gPFNldHRpbmdzIG9uQ2xvc2U9e29uRG9uZX0gY29udGV4dD17Y29udGV4dH0gZGVmYXVsdFRhYj1cIkNvbmZpZ1wiIC8+XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBS0EsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0MsUUFBUSxRQUFRLHVDQUF1QztBQUNoRSxjQUFjQyxtQkFBbUIsUUFBUSx3QkFBd0I7QUFFakUsT0FBTyxNQUFNQyxJQUFJLEVBQUVELG1CQUFtQixHQUFHLE1BQUFDLENBQU9DLE1BQU0sRUFBRUMsT0FBTyxLQUFLO0VBQ2xFLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUNELE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHO0FBQzVFLENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=
