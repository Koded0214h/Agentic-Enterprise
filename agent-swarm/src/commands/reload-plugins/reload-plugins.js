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
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/settingsSync/index.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var refresh_js_1 = require("../../utils/plugins/refresh.js");
var changeDetector_js_1 = require("../../utils/settings/changeDetector.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var call = function (_args, context) { return __awaiter(void 0, void 0, void 0, function () {
    var applied, r, parts, msg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!((0, bun_bundle_1.feature)('DOWNLOAD_USER_SETTINGS') &&
                    ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) || (0, state_js_1.getIsRemoteMode)()))) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, index_js_1.redownloadUserSettings)()
                    // applyRemoteEntriesToLocal uses markInternalWrite to suppress the
                    // file watcher (correct for startup, nothing listening yet); fire
                    // notifyChange here so mid-session applySettingsChange runs.
                ];
            case 1:
                applied = _a.sent();
                // applyRemoteEntriesToLocal uses markInternalWrite to suppress the
                // file watcher (correct for startup, nothing listening yet); fire
                // notifyChange here so mid-session applySettingsChange runs.
                if (applied) {
                    changeDetector_js_1.settingsChangeDetector.notifyChange('userSettings');
                }
                _a.label = 2;
            case 2: return [4 /*yield*/, (0, refresh_js_1.refreshActivePlugins)(context.setAppState)];
            case 3:
                r = _a.sent();
                parts = [
                    n(r.enabled_count, 'plugin'),
                    n(r.command_count, 'skill'),
                    n(r.agent_count, 'agent'),
                    n(r.hook_count, 'hook'),
                    // "plugin MCP/LSP" disambiguates from user-config/built-in servers,
                    // which /reload-plugins doesn't touch. Commands/hooks are plugin-only;
                    // agent_count is total agents (incl. built-ins). (gh-31321)
                    n(r.mcp_count, 'plugin MCP server'),
                    n(r.lsp_count, 'plugin LSP server'),
                ];
                msg = "Reloaded: ".concat(parts.join(' · '));
                if (r.error_count > 0) {
                    msg += "\n".concat(n(r.error_count, 'error'), " during load. Run /doctor for details.");
                }
                return [2 /*return*/, { type: 'text', value: msg }];
        }
    });
}); };
exports.call = call;
function n(count, noun) {
    return "".concat(count, " ").concat((0, stringUtils_js_1.plural)(count, noun));
}
