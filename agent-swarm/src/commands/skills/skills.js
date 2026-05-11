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
var SkillsMenu_js_1 = require("../../components/skills/SkillsMenu.js");
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, <SkillsMenu_js_1.SkillsMenu onExit={onDone} commands={context.options.commands}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkxvY2FsSlNYQ29tbWFuZENvbnRleHQiLCJTa2lsbHNNZW51IiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiY2FsbCIsIm9uRG9uZSIsImNvbnRleHQiLCJQcm9taXNlIiwiUmVhY3ROb2RlIiwib3B0aW9ucyIsImNvbW1hbmRzIl0sInNvdXJjZXMiOlsic2tpbGxzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB0eXBlIHsgTG9jYWxKU1hDb21tYW5kQ29udGV4dCB9IGZyb20gJy4uLy4uL2NvbW1hbmRzLmpzJ1xuaW1wb3J0IHsgU2tpbGxzTWVudSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvc2tpbGxzL1NraWxsc01lbnUuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgY29udGV4dDogTG9jYWxKU1hDb21tYW5kQ29udGV4dCxcbik6IFByb21pc2U8UmVhY3QuUmVhY3ROb2RlPiB7XG4gIHJldHVybiA8U2tpbGxzTWVudSBvbkV4aXQ9e29uRG9uZX0gY29tbWFuZHM9e2NvbnRleHQub3B0aW9ucy5jb21tYW5kc30gLz5cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixjQUFjQyxzQkFBc0IsUUFBUSxtQkFBbUI7QUFDL0QsU0FBU0MsVUFBVSxRQUFRLHVDQUF1QztBQUNsRSxjQUFjQyxxQkFBcUIsUUFBUSx3QkFBd0I7QUFFbkUsT0FBTyxlQUFlQyxJQUFJQSxDQUN4QkMsTUFBTSxFQUFFRixxQkFBcUIsRUFDN0JHLE9BQU8sRUFBRUwsc0JBQXNCLENBQ2hDLEVBQUVNLE9BQU8sQ0FBQ1AsS0FBSyxDQUFDUSxTQUFTLENBQUMsQ0FBQztFQUMxQixPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDSCxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQ0MsT0FBTyxDQUFDRyxPQUFPLENBQUNDLFFBQVEsQ0FBQyxHQUFHO0FBQzNFIiwiaWdub3JlTGlzdCI6W119
