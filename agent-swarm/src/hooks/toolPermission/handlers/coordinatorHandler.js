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
exports.handleCoordinatorPermission = handleCoordinatorPermission;
var bun_bundle_1 = require("bun:bundle");
var log_js_1 = require("../../../utils/log.js");
/**
 * Handles the coordinator worker permission flow.
 *
 * For coordinator workers, automated checks (hooks and classifier) are
 * awaited sequentially before falling through to the interactive dialog.
 *
 * Returns a PermissionDecision if the automated checks resolved the
 * permission, or null if the caller should fall through to the
 * interactive dialog.
 */
function handleCoordinatorPermission(params) {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, updatedInput, suggestions, permissionMode, hookResult, classifierResult, _a, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    ctx = params.ctx, updatedInput = params.updatedInput, suggestions = params.suggestions, permissionMode = params.permissionMode;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, ctx.runHooks(permissionMode, suggestions, updatedInput)];
                case 2:
                    hookResult = _c.sent();
                    if (hookResult)
                        return [2 /*return*/, hookResult
                            // 2. Try classifier (slow, inference -- bash only)
                        ];
                    if (!(0, bun_bundle_1.feature)('BASH_CLASSIFIER')) return [3 /*break*/, 4];
                    return [4 /*yield*/, ((_b = ctx.tryClassifier) === null || _b === void 0 ? void 0 : _b.call(ctx, params.pendingClassifierCheck, updatedInput))];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = null;
                    _c.label = 5;
                case 5:
                    classifierResult = _a;
                    if (classifierResult) {
                        return [2 /*return*/, classifierResult];
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    // If automated checks fail unexpectedly, fall through to show the dialog
                    // so the user can decide manually. Non-Error throws get a context prefix
                    // so the log is traceable — intentionally NOT toError(), which would drop
                    // the prefix.
                    if (error_1 instanceof Error) {
                        (0, log_js_1.logError)(error_1);
                    }
                    else {
                        (0, log_js_1.logError)(new Error("Automated permission check failed: ".concat(String(error_1))));
                    }
                    return [3 /*break*/, 7];
                case 7: 
                // 3. Neither resolved (or checks failed) -- fall through to dialog below.
                // Hooks already ran, classifier already consumed.
                return [2 /*return*/, null];
            }
        });
    });
}
