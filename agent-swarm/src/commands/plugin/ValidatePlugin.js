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
exports.ValidatePlugin = ValidatePlugin;
var compiler_runtime_1 = require("react/compiler-runtime");
var figures_1 = require("figures");
var React = require("react");
var react_1 = require("react");
var ink_js_1 = require("../../ink.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var validatePlugin_js_1 = require("../../utils/plugins/validatePlugin.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
function ValidatePlugin(t0) {
    var $ = (0, compiler_runtime_1.c)(5);
    var onComplete = t0.onComplete, path = t0.path;
    var t1;
    var t2;
    if ($[0] !== onComplete || $[1] !== path) {
        t1 = function () {
            var runValidation = function runValidation() {
                return __awaiter(this, void 0, void 0, function () {
                    var result, output_1, t3_1, error;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!path) {
                                    onComplete("Usage: /plugin validate <path>\n\nValidate a plugin or marketplace manifest file or directory.\n\nExamples:\n  /plugin validate .claude-plugin/plugin.json\n  /plugin validate /path/to/plugin-directory\n  /plugin validate .\n\nWhen given a directory, automatically validates .claude-plugin/marketplace.json\nor .claude-plugin/plugin.json (prefers marketplace if both exist).\n\nOr from the command line:\n  claude plugin validate <path>");
                                    return [2 /*return*/];
                                }
                                ;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, (0, validatePlugin_js_1.validateManifest)(path)];
                            case 2:
                                result = _a.sent();
                                output_1 = "";
                                output_1 = output_1 + "Validating ".concat(result.fileType, " manifest: ").concat(result.filePath, "\n\n");
                                output_1;
                                if (result.errors.length > 0) {
                                    output_1 = output_1 + "".concat(figures_1.default.cross, " Found ").concat(result.errors.length, " ").concat((0, stringUtils_js_1.plural)(result.errors.length, "error"), ":\n\n");
                                    output_1;
                                    result.errors.forEach(function (error_0) {
                                        output_1 = output_1 + "  ".concat(figures_1.default.pointer, " ").concat(error_0.path, ": ").concat(error_0.message, "\n");
                                        output_1;
                                    });
                                    output_1 = output_1 + "\n";
                                    output_1;
                                }
                                if (result.warnings.length > 0) {
                                    output_1 = output_1 + "".concat(figures_1.default.warning, " Found ").concat(result.warnings.length, " ").concat((0, stringUtils_js_1.plural)(result.warnings.length, "warning"), ":\n\n");
                                    output_1;
                                    result.warnings.forEach(function (warning) {
                                        output_1 = output_1 + "  ".concat(figures_1.default.pointer, " ").concat(warning.path, ": ").concat(warning.message, "\n");
                                        output_1;
                                    });
                                    output_1 = output_1 + "\n";
                                    output_1;
                                }
                                if (result.success) {
                                    if (result.warnings.length > 0) {
                                        output_1 = output_1 + "".concat(figures_1.default.tick, " Validation passed with warnings\n");
                                        output_1;
                                    }
                                    else {
                                        output_1 = output_1 + "".concat(figures_1.default.tick, " Validation passed\n");
                                        output_1;
                                    }
                                    process.exitCode = 0;
                                }
                                else {
                                    output_1 = output_1 + "".concat(figures_1.default.cross, " Validation failed\n");
                                    output_1;
                                    process.exitCode = 1;
                                }
                                onComplete(output_1);
                                return [3 /*break*/, 4];
                            case 3:
                                t3_1 = _a.sent();
                                error = t3_1;
                                process.exitCode = 2;
                                (0, log_js_1.logError)(error);
                                onComplete("".concat(figures_1.default.cross, " Unexpected error during validation: ").concat((0, errors_js_1.errorMessage)(error)));
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            };
            runValidation();
        };
        t2 = [onComplete, path];
        $[0] = onComplete;
        $[1] = path;
        $[2] = t1;
        $[3] = t2;
    }
    else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, react_1.useEffect)(t1, t2);
    var t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = <ink_js_1.Box flexDirection="column"><ink_js_1.Text>Running validation...</ink_js_1.Text></ink_js_1.Box>;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    return t3;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VFZmZlY3QiLCJCb3giLCJUZXh0IiwiZXJyb3JNZXNzYWdlIiwibG9nRXJyb3IiLCJ2YWxpZGF0ZU1hbmlmZXN0IiwicGx1cmFsIiwiUHJvcHMiLCJvbkNvbXBsZXRlIiwicmVzdWx0IiwicGF0aCIsIlZhbGlkYXRlUGx1Z2luIiwidDAiLCIkIiwiX2MiLCJ0MSIsInQyIiwicnVuVmFsaWRhdGlvbiIsIm91dHB1dCIsImZpbGVUeXBlIiwiZmlsZVBhdGgiLCJlcnJvcnMiLCJsZW5ndGgiLCJjcm9zcyIsImZvckVhY2giLCJlcnJvcl8wIiwicG9pbnRlciIsImVycm9yIiwibWVzc2FnZSIsIndhcm5pbmdzIiwid2FybmluZyIsInN1Y2Nlc3MiLCJ0aWNrIiwicHJvY2VzcyIsImV4aXRDb2RlIiwidDMiLCJTeW1ib2wiLCJmb3IiXSwic291cmNlcyI6WyJWYWxpZGF0ZVBsdWdpbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZpZ3VyZXMgZnJvbSAnZmlndXJlcydcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICcuLi8uLi9pbmsuanMnXG5pbXBvcnQgeyBlcnJvck1lc3NhZ2UgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcnMuanMnXG5pbXBvcnQgeyBsb2dFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2xvZy5qcydcbmltcG9ydCB7IHZhbGlkYXRlTWFuaWZlc3QgfSBmcm9tICcuLi8uLi91dGlscy9wbHVnaW5zL3ZhbGlkYXRlUGx1Z2luLmpzJ1xuaW1wb3J0IHsgcGx1cmFsIH0gZnJvbSAnLi4vLi4vdXRpbHMvc3RyaW5nVXRpbHMuanMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIG9uQ29tcGxldGU6IChyZXN1bHQ/OiBzdHJpbmcpID0+IHZvaWRcbiAgcGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVQbHVnaW4oeyBvbkNvbXBsZXRlLCBwYXRoIH06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBhc3luYyBmdW5jdGlvbiBydW5WYWxpZGF0aW9uKCkge1xuICAgICAgLy8gSWYgbm8gcGF0aCBwcm92aWRlZCwgc2hvdyB1c2FnZVxuICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgIG9uQ29tcGxldGUoXG4gICAgICAgICAgJ1VzYWdlOiAvcGx1Z2luIHZhbGlkYXRlIDxwYXRoPlxcblxcbicgK1xuICAgICAgICAgICAgJ1ZhbGlkYXRlIGEgcGx1Z2luIG9yIG1hcmtldHBsYWNlIG1hbmlmZXN0IGZpbGUgb3IgZGlyZWN0b3J5LlxcblxcbicgK1xuICAgICAgICAgICAgJ0V4YW1wbGVzOlxcbicgK1xuICAgICAgICAgICAgJyAgL3BsdWdpbiB2YWxpZGF0ZSAuY2xhdWRlLXBsdWdpbi9wbHVnaW4uanNvblxcbicgK1xuICAgICAgICAgICAgJyAgL3BsdWdpbiB2YWxpZGF0ZSAvcGF0aC90by9wbHVnaW4tZGlyZWN0b3J5XFxuJyArXG4gICAgICAgICAgICAnICAvcGx1Z2luIHZhbGlkYXRlIC5cXG5cXG4nICtcbiAgICAgICAgICAgICdXaGVuIGdpdmVuIGEgZGlyZWN0b3J5LCBhdXRvbWF0aWNhbGx5IHZhbGlkYXRlcyAuY2xhdWRlLXBsdWdpbi9tYXJrZXRwbGFjZS5qc29uXFxuJyArXG4gICAgICAgICAgICAnb3IgLmNsYXVkZS1wbHVnaW4vcGx1Z2luLmpzb24gKHByZWZlcnMgbWFya2V0cGxhY2UgaWYgYm90aCBleGlzdCkuXFxuXFxuJyArXG4gICAgICAgICAgICAnT3IgZnJvbSB0aGUgY29tbWFuZCBsaW5lOlxcbicgK1xuICAgICAgICAgICAgJyAgY2xhdWRlIHBsdWdpbiB2YWxpZGF0ZSA8cGF0aD4nLFxuICAgICAgICApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB2YWxpZGF0ZU1hbmlmZXN0KHBhdGgpXG5cbiAgICAgICAgbGV0IG91dHB1dCA9ICcnXG5cbiAgICAgICAgLy8gQWRkIGhlYWRlclxuICAgICAgICBvdXRwdXQgKz0gYFZhbGlkYXRpbmcgJHtyZXN1bHQuZmlsZVR5cGV9IG1hbmlmZXN0OiAke3Jlc3VsdC5maWxlUGF0aH1cXG5cXG5gXG5cbiAgICAgICAgLy8gU2hvdyBlcnJvcnNcbiAgICAgICAgaWYgKHJlc3VsdC5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIG91dHB1dCArPSBgJHtmaWd1cmVzLmNyb3NzfSBGb3VuZCAke3Jlc3VsdC5lcnJvcnMubGVuZ3RofSAke3BsdXJhbChyZXN1bHQuZXJyb3JzLmxlbmd0aCwgJ2Vycm9yJyl9OlxcblxcbmBcblxuICAgICAgICAgIHJlc3VsdC5lcnJvcnMuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gYCAgJHtmaWd1cmVzLnBvaW50ZXJ9ICR7ZXJyb3IucGF0aH06ICR7ZXJyb3IubWVzc2FnZX1cXG5gXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIG91dHB1dCArPSAnXFxuJ1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2hvdyB3YXJuaW5nc1xuICAgICAgICBpZiAocmVzdWx0Lndhcm5pbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBvdXRwdXQgKz0gYCR7ZmlndXJlcy53YXJuaW5nfSBGb3VuZCAke3Jlc3VsdC53YXJuaW5ncy5sZW5ndGh9ICR7cGx1cmFsKHJlc3VsdC53YXJuaW5ncy5sZW5ndGgsICd3YXJuaW5nJyl9OlxcblxcbmBcblxuICAgICAgICAgIHJlc3VsdC53YXJuaW5ncy5mb3JFYWNoKHdhcm5pbmcgPT4ge1xuICAgICAgICAgICAgb3V0cHV0ICs9IGAgICR7ZmlndXJlcy5wb2ludGVyfSAke3dhcm5pbmcucGF0aH06ICR7d2FybmluZy5tZXNzYWdlfVxcbmBcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgb3V0cHV0ICs9ICdcXG4nXG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaG93IHN1Y2Nlc3Mgb3IgZmFpbHVyZVxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICBpZiAocmVzdWx0Lndhcm5pbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG91dHB1dCArPSBgJHtmaWd1cmVzLnRpY2t9IFZhbGlkYXRpb24gcGFzc2VkIHdpdGggd2FybmluZ3NcXG5gXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dHB1dCArPSBgJHtmaWd1cmVzLnRpY2t9IFZhbGlkYXRpb24gcGFzc2VkXFxuYFxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEV4aXQgd2l0aCBjb2RlIDAgKHN1Y2Nlc3MpXG4gICAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXRwdXQgKz0gYCR7ZmlndXJlcy5jcm9zc30gVmFsaWRhdGlvbiBmYWlsZWRcXG5gXG5cbiAgICAgICAgICAvLyBFeGl0IHdpdGggY29kZSAxICh2YWxpZGF0aW9uIGZhaWx1cmUpXG4gICAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDFcbiAgICAgICAgfVxuXG4gICAgICAgIG9uQ29tcGxldGUob3V0cHV0KVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gRXhpdCB3aXRoIGNvZGUgMiAodW5leHBlY3RlZCBlcnJvcilcbiAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDJcblxuICAgICAgICBsb2dFcnJvcihlcnJvcilcblxuICAgICAgICBvbkNvbXBsZXRlKFxuICAgICAgICAgIGAke2ZpZ3VyZXMuY3Jvc3N9IFVuZXhwZWN0ZWQgZXJyb3IgZHVyaW5nIHZhbGlkYXRpb246ICR7ZXJyb3JNZXNzYWdlKGVycm9yKX1gLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgdm9pZCBydW5WYWxpZGF0aW9uKClcbiAgfSwgW29uQ29tcGxldGUsIHBhdGhdKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICA8VGV4dD5SdW5uaW5nIHZhbGlkYXRpb24uLi48L1RleHQ+XG4gICAgPC9Cb3g+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLE9BQU8sTUFBTSxTQUFTO0FBQzdCLE9BQU8sS0FBS0MsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0MsU0FBUyxRQUFRLE9BQU87QUFDakMsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLFFBQVEsY0FBYztBQUN4QyxTQUFTQyxZQUFZLFFBQVEsdUJBQXVCO0FBQ3BELFNBQVNDLFFBQVEsUUFBUSxvQkFBb0I7QUFDN0MsU0FBU0MsZ0JBQWdCLFFBQVEsdUNBQXVDO0FBQ3hFLFNBQVNDLE1BQU0sUUFBUSw0QkFBNEI7QUFFbkQsS0FBS0MsS0FBSyxHQUFHO0VBQ1hDLFVBQVUsRUFBRSxDQUFDQyxNQUFlLENBQVIsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJO0VBQ3JDQyxJQUFJLENBQUMsRUFBRSxNQUFNO0FBQ2YsQ0FBQztBQUVELE9BQU8sU0FBQUMsZUFBQUMsRUFBQTtFQUFBLE1BQUFDLENBQUEsR0FBQUMsRUFBQTtFQUF3QjtJQUFBTixVQUFBO0lBQUFFO0VBQUEsSUFBQUUsRUFBMkI7RUFBQSxJQUFBRyxFQUFBO0VBQUEsSUFBQUMsRUFBQTtFQUFBLElBQUFILENBQUEsUUFBQUwsVUFBQSxJQUFBSyxDQUFBLFFBQUFILElBQUE7SUFDOUNLLEVBQUEsR0FBQUEsQ0FBQTtNQUNSLE1BQUFFLGFBQUEsa0JBQUFBLGNBQUE7UUFFRSxJQUFJLENBQUNQLElBQUk7VUFDUEYsVUFBVSxDQUNSLHFiQVVGLENBQUM7VUFBQTtRQUFBO1FBRUY7UUFFRDtVQUNFLE1BQUFDLE1BQUEsR0FBZSxNQUFNSixnQkFBZ0IsQ0FBQ0ssSUFBSSxDQUFDO1VBRTNDLElBQUFRLE1BQUEsR0FBYSxFQUFFO1VBR2ZBLE1BQUEsR0FBQUEsTUFBTSxHQUFJLGNBQWNULE1BQU0sQ0FBQVUsUUFBUyxjQUFjVixNQUFNLENBQUFXLFFBQVMsTUFBTTtVQUExRUYsTUFBMEU7VUFHMUUsSUFBSVQsTUFBTSxDQUFBWSxNQUFPLENBQUFDLE1BQU8sR0FBRyxDQUFDO1lBQzFCSixNQUFBLEdBQUFBLE1BQU0sR0FBSSxHQUFHcEIsT0FBTyxDQUFBeUIsS0FBTSxVQUFVZCxNQUFNLENBQUFZLE1BQU8sQ0FBQUMsTUFBTyxJQUFJaEIsTUFBTSxDQUFDRyxNQUFNLENBQUFZLE1BQU8sQ0FBQUMsTUFBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQXhHSixNQUF3RztZQUV4R1QsTUFBTSxDQUFBWSxNQUFPLENBQUFHLE9BQVEsQ0FBQ0MsT0FBQTtjQUNwQlAsTUFBQSxHQUFBQSxNQUFNLEdBQUksS0FBS3BCLE9BQU8sQ0FBQTRCLE9BQVEsSUFBSUMsT0FBSyxDQUFBakIsSUFBSyxLQUFLaUIsT0FBSyxDQUFBQyxPQUFRLElBQUk7Y0FBbEVWLE1BQWtFO1lBQUEsQ0FDbkUsQ0FBQztZQUVGQSxNQUFBLEdBQUFBLE1BQU0sR0FBSSxJQUFJO1lBQWRBLE1BQWM7VUFBQTtVQUloQixJQUFJVCxNQUFNLENBQUFvQixRQUFTLENBQUFQLE1BQU8sR0FBRyxDQUFDO1lBQzVCSixNQUFBLEdBQUFBLE1BQU0sR0FBSSxHQUFHcEIsT0FBTyxDQUFBZ0MsT0FBUSxVQUFVckIsTUFBTSxDQUFBb0IsUUFBUyxDQUFBUCxNQUFPLElBQUloQixNQUFNLENBQUNHLE1BQU0sQ0FBQW9CLFFBQVMsQ0FBQVAsTUFBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPO1lBQWhISixNQUFnSDtZQUVoSFQsTUFBTSxDQUFBb0IsUUFBUyxDQUFBTCxPQUFRLENBQUNNLE9BQUE7Y0FDdEJaLE1BQUEsR0FBQUEsTUFBTSxHQUFJLEtBQUtwQixPQUFPLENBQUE0QixPQUFRLElBQUlJLE9BQU8sQ0FBQXBCLElBQUssS0FBS29CLE9BQU8sQ0FBQUYsT0FBUSxJQUFJO2NBQXRFVixNQUFzRTtZQUFBLENBQ3ZFLENBQUM7WUFFRkEsTUFBQSxHQUFBQSxNQUFNLEdBQUksSUFBSTtZQUFkQSxNQUFjO1VBQUE7VUFJaEIsSUFBSVQsTUFBTSxDQUFBc0IsT0FBUTtZQUNoQixJQUFJdEIsTUFBTSxDQUFBb0IsUUFBUyxDQUFBUCxNQUFPLEdBQUcsQ0FBQztjQUM1QkosTUFBQSxHQUFBQSxNQUFNLEdBQUksR0FBR3BCLE9BQU8sQ0FBQWtDLElBQUssb0NBQW9DO2NBQTdEZCxNQUE2RDtZQUFBO2NBRTdEQSxNQUFBLEdBQUFBLE1BQU0sR0FBSSxHQUFHcEIsT0FBTyxDQUFBa0MsSUFBSyxzQkFBc0I7Y0FBL0NkLE1BQStDO1lBQUE7WUFJakRlLE9BQU8sQ0FBQUMsUUFBQSxHQUFZLENBQUg7VUFBQTtZQUVoQmhCLE1BQUEsR0FBQUEsTUFBTSxHQUFJLEdBQUdwQixPQUFPLENBQUF5QixLQUFNLHNCQUFzQjtZQUFoREwsTUFBZ0Q7WUFHaERlLE9BQU8sQ0FBQUMsUUFBQSxHQUFZLENBQUg7VUFBQTtVQUdsQjFCLFVBQVUsQ0FBQ1UsTUFBTSxDQUFDO1FBQUEsU0FBQWlCLEVBQUE7VUFDWFIsS0FBQSxDQUFBQSxLQUFBLENBQUFBLENBQUEsQ0FBQUEsRUFBSztVQUVaTSxPQUFPLENBQUFDLFFBQUEsR0FBWSxDQUFIO1VBRWhCOUIsUUFBUSxDQUFDdUIsS0FBSyxDQUFDO1VBRWZuQixVQUFVLENBQ1IsR0FBR1YsT0FBTyxDQUFBeUIsS0FBTSx3Q0FBd0NwQixZQUFZLENBQUN3QixLQUFLLENBQUMsRUFDN0UsQ0FBQztRQUFBO01BQ0YsQ0FDRjtNQUVJVixhQUFhLENBQUMsQ0FBQztJQUFBLENBQ3JCO0lBQUVELEVBQUEsSUFBQ1IsVUFBVSxFQUFFRSxJQUFJLENBQUM7SUFBQUcsQ0FBQSxNQUFBTCxVQUFBO0lBQUFLLENBQUEsTUFBQUgsSUFBQTtJQUFBRyxDQUFBLE1BQUFFLEVBQUE7SUFBQUYsQ0FBQSxNQUFBRyxFQUFBO0VBQUE7SUFBQUQsRUFBQSxHQUFBRixDQUFBO0lBQUFHLEVBQUEsR0FBQUgsQ0FBQTtFQUFBO0VBaEZyQmIsU0FBUyxDQUFDZSxFQWdGVCxFQUFFQyxFQUFrQixDQUFDO0VBQUEsSUFBQW1CLEVBQUE7RUFBQSxJQUFBdEIsQ0FBQSxRQUFBdUIsTUFBQSxDQUFBQyxHQUFBO0lBR3BCRixFQUFBLElBQUMsR0FBRyxDQUFlLGFBQVEsQ0FBUixRQUFRLENBQ3pCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUExQixJQUFJLENBQ1AsRUFGQyxHQUFHLENBRUU7SUFBQXRCLENBQUEsTUFBQXNCLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUF0QixDQUFBO0VBQUE7RUFBQSxPQUZOc0IsRUFFTTtBQUFBIiwiaWdub3JlTGlzdCI6W119
