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
exports.EnterWorktreeTool = void 0;
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var systemPromptSections_js_1 = require("../../constants/systemPromptSections.js");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var claudemd_js_1 = require("../../utils/claudemd.js");
var cwd_js_1 = require("../../utils/cwd.js");
var git_js_1 = require("../../utils/git.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var plans_js_1 = require("../../utils/plans.js");
var Shell_js_1 = require("../../utils/Shell.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var worktree_js_1 = require("../../utils/worktree.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        name: v4_1.z
            .string()
            .superRefine(function (s, ctx) {
            try {
                (0, worktree_js_1.validateWorktreeSlug)(s);
            }
            catch (e) {
                ctx.addIssue({ code: 'custom', message: e.message });
            }
        })
            .optional()
            .describe('Optional name for the worktree. Each "/"-separated segment may contain only letters, digits, dots, underscores, and dashes; max 64 chars total. A random name is generated if not provided.'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        worktreePath: v4_1.z.string(),
        worktreeBranch: v4_1.z.string().optional(),
        message: v4_1.z.string(),
    });
});
exports.EnterWorktreeTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.ENTER_WORKTREE_TOOL_NAME,
    searchHint: 'create an isolated git worktree and switch into it',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Creates an isolated worktree (via git or configured hooks) and switches the session into it'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getEnterWorktreeToolPrompt)()];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    userFacingName: function () {
        return 'Creating worktree';
    },
    shouldDefer: true,
    toAutoClassifierInput: function (input) {
        var _a;
        return (_a = input.name) !== null && _a !== void 0 ? _a : '';
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    call: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var mainRepoRoot, slug, worktreeSession, branchInfo;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // Validate not already in a worktree created by this session
                        if ((0, worktree_js_1.getCurrentWorktreeSession)()) {
                            throw new Error('Already in a worktree session');
                        }
                        mainRepoRoot = (0, git_js_1.findCanonicalGitRoot)((0, cwd_js_1.getCwd)());
                        if (mainRepoRoot && mainRepoRoot !== (0, cwd_js_1.getCwd)()) {
                            process.chdir(mainRepoRoot);
                            (0, Shell_js_1.setCwd)(mainRepoRoot);
                        }
                        slug = (_a = input.name) !== null && _a !== void 0 ? _a : (0, plans_js_1.getPlanSlug)();
                        return [4 /*yield*/, (0, worktree_js_1.createWorktreeForSession)((0, state_js_1.getSessionId)(), slug)];
                    case 1:
                        worktreeSession = _d.sent();
                        process.chdir(worktreeSession.worktreePath);
                        (0, Shell_js_1.setCwd)(worktreeSession.worktreePath);
                        (0, state_js_1.setOriginalCwd)((0, cwd_js_1.getCwd)());
                        (0, sessionStorage_js_1.saveWorktreeState)(worktreeSession);
                        // Clear cached system prompt sections so env_info_simple recomputes with worktree context
                        (0, systemPromptSections_js_1.clearSystemPromptSections)();
                        // Clear memoized caches that depend on CWD
                        (0, claudemd_js_1.clearMemoryFileCaches)();
                        (_c = (_b = plans_js_1.getPlansDirectory.cache).clear) === null || _c === void 0 ? void 0 : _c.call(_b);
                        (0, index_js_1.logEvent)('tengu_worktree_created', {
                            mid_session: true,
                        });
                        branchInfo = worktreeSession.worktreeBranch
                            ? " on branch ".concat(worktreeSession.worktreeBranch)
                            : '';
                        return [2 /*return*/, {
                                data: {
                                    worktreePath: worktreeSession.worktreePath,
                                    worktreeBranch: worktreeSession.worktreeBranch,
                                    message: "Created worktree at ".concat(worktreeSession.worktreePath).concat(branchInfo, ". The session is now working in the worktree. Use ExitWorktree to leave mid-session, or exit the session to be prompted."),
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var message = _a.message;
        return {
            type: 'tool_result',
            content: message,
            tool_use_id: toolUseID,
        };
    },
});
