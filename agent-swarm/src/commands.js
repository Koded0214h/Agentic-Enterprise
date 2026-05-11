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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRIDGE_SAFE_COMMANDS = exports.REMOTE_SAFE_COMMANDS = exports.getSlashCommandToolSkills = exports.getSkillToolCommands = exports.builtInCommandNames = exports.INTERNAL_ONLY_COMMANDS = exports.isCommandEnabled = exports.getCommandName = void 0;
exports.meetsAvailabilityRequirement = meetsAvailabilityRequirement;
exports.getCommands = getCommands;
exports.clearCommandMemoizationCaches = clearCommandMemoizationCaches;
exports.clearCommandsCache = clearCommandsCache;
exports.getMcpSkillCommands = getMcpSkillCommands;
exports.isBridgeSafeCommand = isBridgeSafeCommand;
exports.filterCommandsForRemoteMode = filterCommandsForRemoteMode;
exports.findCommand = findCommand;
exports.hasCommand = hasCommand;
exports.getCommand = getCommand;
exports.formatDescriptionWithSource = formatDescriptionWithSource;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var index_js_1 = require("./commands/add-dir/index.js");
var index_js_2 = require("./commands/autofix-pr/index.js");
var index_js_3 = require("./commands/backfill-sessions/index.js");
var index_js_4 = require("./commands/btw/index.js");
var index_js_5 = require("./commands/good-claude/index.js");
var index_js_6 = require("./commands/issue/index.js");
var index_js_7 = require("./commands/feedback/index.js");
var index_js_8 = require("./commands/clear/index.js");
var index_js_9 = require("./commands/color/index.js");
var commit_js_1 = require("./commands/commit.js");
var index_js_10 = require("./commands/copy/index.js");
var index_js_11 = require("./commands/desktop/index.js");
var commit_push_pr_js_1 = require("./commands/commit-push-pr.js");
var index_js_12 = require("./commands/compact/index.js");
var index_js_13 = require("./commands/config/index.js");
var index_js_14 = require("./commands/context/index.js");
var index_js_15 = require("./commands/cost/index.js");
var index_js_16 = require("./commands/diff/index.js");
var index_js_17 = require("./commands/ctx_viz/index.js");
var index_js_18 = require("./commands/doctor/index.js");
var index_js_19 = require("./commands/memory/index.js");
var index_js_20 = require("./commands/help/index.js");
var index_js_21 = require("./commands/ide/index.js");
var init_js_1 = require("./commands/init.js");
var init_verifiers_js_1 = require("./commands/init-verifiers.js");
var index_js_22 = require("./commands/keybindings/index.js");
var index_js_23 = require("./commands/login/index.js");
var index_js_24 = require("./commands/logout/index.js");
var index_js_25 = require("./commands/install-github-app/index.js");
var index_js_26 = require("./commands/install-slack-app/index.js");
var index_js_27 = require("./commands/break-cache/index.js");
var index_js_28 = require("./commands/mcp/index.js");
var index_js_29 = require("./commands/mobile/index.js");
var index_js_30 = require("./commands/onboarding/index.js");
var index_js_31 = require("./commands/pr_comments/index.js");
var index_js_32 = require("./commands/release-notes/index.js");
var index_js_33 = require("./commands/rename/index.js");
var index_js_34 = require("./commands/resume/index.js");
var review_js_1 = require("./commands/review.js");
var index_js_35 = require("./commands/session/index.js");
var index_js_36 = require("./commands/share/index.js");
var index_js_37 = require("./commands/skills/index.js");
var index_js_38 = require("./commands/status/index.js");
var index_js_39 = require("./commands/swarm/index.js");
var index_js_40 = require("./commands/tasks/index.js");
var index_js_41 = require("./commands/teleport/index.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var agentsPlatform = process.env.USER_TYPE === 'ant'
    ? require('./commands/agents-platform/index.js').default
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var security_review_js_1 = require("./commands/security-review.js");
var index_js_42 = require("./commands/bughunter/index.js");
var index_js_43 = require("./commands/terminalSetup/index.js");
var index_js_44 = require("./commands/usage/index.js");
var index_js_45 = require("./commands/theme/index.js");
var index_js_46 = require("./commands/vim/index.js");
var bun_bundle_1 = require("bun:bundle");
// Dead code elimination: conditional imports
/* eslint-disable @typescript-eslint/no-require-imports */
var proactive = (0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
    ? require('./commands/proactive.js').default
    : null;
var briefCommand = (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
    ? require('./commands/brief.js').default
    : null;
var assistantCommand = (0, bun_bundle_1.feature)('KAIROS')
    ? require('./commands/assistant/index.js').default
    : null;
var bridge = (0, bun_bundle_1.feature)('BRIDGE_MODE')
    ? require('./commands/bridge/index.js').default
    : null;
var remoteControlServerCommand = (0, bun_bundle_1.feature)('DAEMON') && (0, bun_bundle_1.feature)('BRIDGE_MODE')
    ? require('./commands/remoteControlServer/index.js').default
    : null;
var voiceCommand = (0, bun_bundle_1.feature)('VOICE_MODE')
    ? require('./commands/voice/index.js').default
    : null;
var forceSnip = (0, bun_bundle_1.feature)('HISTORY_SNIP')
    ? require('./commands/force-snip.js').default
    : null;
var workflowsCmd = (0, bun_bundle_1.feature)('WORKFLOW_SCRIPTS')
    ? require('./commands/workflows/index.js').default
    : null;
var webCmd = (0, bun_bundle_1.feature)('CCR_REMOTE_SETUP')
    ? require('./commands/remote-setup/index.js').default
    : null;
var clearSkillIndexCache = (0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH')
    ? require('./services/skillSearch/localSearch.js').clearSkillIndexCache
    : null;
var subscribePr = (0, bun_bundle_1.feature)('KAIROS_GITHUB_WEBHOOKS')
    ? require('./commands/subscribe-pr.js').default
    : null;
var ultraplan = (0, bun_bundle_1.feature)('ULTRAPLAN')
    ? require('./commands/ultraplan.js').default
    : null;
var torch = (0, bun_bundle_1.feature)('TORCH') ? require('./commands/torch.js').default : null;
var peersCmd = (0, bun_bundle_1.feature)('UDS_INBOX')
    ? require('./commands/peers/index.js').default
    : null;
var forkCmd = (0, bun_bundle_1.feature)('FORK_SUBAGENT')
    ? require('./commands/fork/index.js').default
    : null;
var buddy = (0, bun_bundle_1.feature)('BUDDY')
    ? require('./commands/buddy/index.js').default
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var index_js_47 = require("./commands/thinkback/index.js");
var index_js_48 = require("./commands/thinkback-play/index.js");
var index_js_49 = require("./commands/permissions/index.js");
var index_js_50 = require("./commands/plan/index.js");
var index_js_51 = require("./commands/fast/index.js");
var index_js_52 = require("./commands/passes/index.js");
var index_js_53 = require("./commands/privacy-settings/index.js");
var index_js_54 = require("./commands/hooks/index.js");
var index_js_55 = require("./commands/files/index.js");
var index_js_56 = require("./commands/branch/index.js");
var index_js_57 = require("./commands/agents/index.js");
var index_js_58 = require("./commands/plugin/index.js");
var index_js_59 = require("./commands/reload-plugins/index.js");
var index_js_60 = require("./commands/rewind/index.js");
var index_js_61 = require("./commands/heapdump/index.js");
var index_js_62 = require("./commands/mock-limits/index.js");
var bridge_kick_js_1 = require("./commands/bridge-kick.js");
var version_js_1 = require("./commands/version.js");
var index_js_63 = require("./commands/summary/index.js");
var index_js_64 = require("./commands/reset-limits/index.js");
var index_js_65 = require("./commands/ant-trace/index.js");
var index_js_66 = require("./commands/perf-issue/index.js");
var index_js_67 = require("./commands/sandbox-toggle/index.js");
var index_js_68 = require("./commands/chrome/index.js");
var index_js_69 = require("./commands/stickers/index.js");
var advisor_js_1 = require("./commands/advisor.js");
var log_js_1 = require("./utils/log.js");
var errors_js_1 = require("./utils/errors.js");
var debug_js_1 = require("./utils/debug.js");
var loadSkillsDir_js_1 = require("./skills/loadSkillsDir.js");
var bundledSkills_js_1 = require("./skills/bundledSkills.js");
var builtinPlugins_js_1 = require("./plugins/builtinPlugins.js");
var loadPluginCommands_js_1 = require("./utils/plugins/loadPluginCommands.js");
var memoize_js_1 = require("lodash-es/memoize.js");
var auth_js_1 = require("./utils/auth.js");
var providers_js_1 = require("./utils/model/providers.js");
var index_js_70 = require("./commands/env/index.js");
var index_js_71 = require("./commands/exit/index.js");
var index_js_72 = require("./commands/export/index.js");
var index_js_73 = require("./commands/model/index.js");
var index_js_74 = require("./commands/tag/index.js");
var index_js_75 = require("./commands/output-style/index.js");
var index_js_76 = require("./commands/remote-env/index.js");
var index_js_77 = require("./commands/upgrade/index.js");
var index_js_78 = require("./commands/extra-usage/index.js");
var index_js_79 = require("./commands/rate-limit-options/index.js");
var statusline_js_1 = require("./commands/statusline.js");
var index_js_80 = require("./commands/effort/index.js");
var index_js_81 = require("./commands/stats/index.js");
// insights.ts is 113KB (3200 lines, includes diffLines/html rendering). Lazy
// shim defers the heavy module until /insights is actually invoked.
var usageReport = {
    type: 'prompt',
    name: 'insights',
    description: 'Generate a report analyzing your Claude Code sessions',
    contentLength: 0,
    progressMessage: 'analyzing your sessions',
    source: 'builtin',
    getPromptForCommand: function (args, context) {
        return __awaiter(this, void 0, void 0, function () {
            var real;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./commands/insights.js'); })];
                    case 1:
                        real = (_a.sent()).default;
                        if (real.type !== 'prompt')
                            throw new Error('unreachable');
                        return [2 /*return*/, real.getPromptForCommand(args, context)];
                }
            });
        });
    },
};
var index_js_82 = require("./commands/oauth-refresh/index.js");
var index_js_83 = require("./commands/debug-tool-call/index.js");
var constants_js_1 = require("./utils/settings/constants.js");
var command_js_1 = require("./types/command.js");
var command_js_2 = require("./types/command.js");
Object.defineProperty(exports, "getCommandName", { enumerable: true, get: function () { return command_js_2.getCommandName; } });
Object.defineProperty(exports, "isCommandEnabled", { enumerable: true, get: function () { return command_js_2.isCommandEnabled; } });
// Commands that get eliminated from the external build
exports.INTERNAL_ONLY_COMMANDS = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
    index_js_3.default,
    index_js_27.default,
    index_js_42.default,
    commit_js_1.default,
    commit_push_pr_js_1.default,
    index_js_17.default,
    index_js_5.default,
    index_js_6.default,
    init_verifiers_js_1.default
], (forceSnip ? [forceSnip] : []), true), [
    index_js_62.default,
    bridge_kick_js_1.default,
    version_js_1.default
], false), (ultraplan ? [ultraplan] : []), true), (subscribePr ? [subscribePr] : []), true), [
    index_js_64.resetLimits,
    index_js_64.resetLimitsNonInteractive,
    index_js_30.default,
    index_js_36.default,
    index_js_63.default,
    index_js_41.default,
    index_js_65.default,
    index_js_66.default,
    index_js_70.default,
    index_js_82.default,
    index_js_83.default,
    agentsPlatform,
    index_js_2.default,
], false).filter(Boolean);
// Declared as a function so that we don't run this until getCommands is called,
// since underlying functions read from config, which can't be read at module initialization time
var COMMANDS = (0, memoize_js_1.default)(function () { return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
    index_js_1.default,
    advisor_js_1.default,
    index_js_57.default,
    index_js_56.default,
    index_js_4.default,
    index_js_68.default,
    index_js_8.default,
    index_js_9.default,
    index_js_12.default,
    index_js_13.default,
    index_js_10.default,
    index_js_11.default,
    index_js_14.context,
    index_js_14.contextNonInteractive,
    index_js_15.default,
    index_js_16.default,
    index_js_18.default,
    index_js_80.default,
    index_js_71.default,
    index_js_51.default,
    index_js_55.default,
    index_js_61.default,
    index_js_20.default,
    index_js_21.default,
    init_js_1.default,
    index_js_22.default,
    index_js_25.default,
    index_js_26.default,
    index_js_28.default,
    index_js_19.default,
    index_js_29.default,
    index_js_73.default,
    index_js_75.default,
    index_js_76.default,
    index_js_58.default,
    index_js_31.default,
    index_js_32.default,
    index_js_59.default,
    index_js_33.default,
    index_js_34.default,
    index_js_35.default,
    index_js_37.default,
    index_js_81.default,
    index_js_38.default,
    index_js_39.default,
    statusline_js_1.default,
    index_js_69.default,
    index_js_74.default,
    index_js_45.default,
    index_js_7.default,
    review_js_1.default,
    review_js_1.ultrareview,
    index_js_60.default,
    security_review_js_1.default,
    index_js_43.default,
    index_js_77.default,
    index_js_78.extraUsage,
    index_js_78.extraUsageNonInteractive,
    index_js_79.default,
    index_js_44.default,
    usageReport,
    index_js_46.default
], (webCmd ? [webCmd] : []), true), (forkCmd ? [forkCmd] : []), true), (buddy ? [buddy] : []), true), (proactive ? [proactive] : []), true), (briefCommand ? [briefCommand] : []), true), (assistantCommand ? [assistantCommand] : []), true), (bridge ? [bridge] : []), true), (remoteControlServerCommand ? [remoteControlServerCommand] : []), true), (voiceCommand ? [voiceCommand] : []), true), [
    index_js_47.default,
    index_js_48.default,
    index_js_49.default,
    index_js_50.default,
    index_js_53.default,
    index_js_54.default,
    index_js_72.default,
    index_js_67.default
], false), (!(0, auth_js_1.isUsing3PServices)() ? [index_js_24.default, (0, index_js_23.default)()] : []), true), [
    index_js_52.default
], false), (peersCmd ? [peersCmd] : []), true), [
    index_js_40.default
], false), (workflowsCmd ? [workflowsCmd] : []), true), (torch ? [torch] : []), true), (process.env.USER_TYPE === 'ant' && !process.env.IS_DEMO
    ? exports.INTERNAL_ONLY_COMMANDS
    : []), true); });
exports.builtInCommandNames = (0, memoize_js_1.default)(function () {
    return new Set(COMMANDS().flatMap(function (_) { var _a; return __spreadArray([_.name], ((_a = _.aliases) !== null && _a !== void 0 ? _a : []), true); }));
});
function getSkills(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, skillDirCommands, pluginSkills, bundledSkills, builtinPluginSkills, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            (0, loadSkillsDir_js_1.getSkillDirCommands)(cwd).catch(function (err) {
                                (0, log_js_1.logError)((0, errors_js_1.toError)(err));
                                (0, debug_js_1.logForDebugging)('Skill directory commands failed to load, continuing without them');
                                return [];
                            }),
                            (0, loadPluginCommands_js_1.getPluginSkills)().catch(function (err) {
                                (0, log_js_1.logError)((0, errors_js_1.toError)(err));
                                (0, debug_js_1.logForDebugging)('Plugin skills failed to load, continuing without them');
                                return [];
                            }),
                        ])
                        // Bundled skills are registered synchronously at startup
                    ];
                case 1:
                    _a = _b.sent(), skillDirCommands = _a[0], pluginSkills = _a[1];
                    bundledSkills = (0, bundledSkills_js_1.getBundledSkills)();
                    builtinPluginSkills = (0, builtinPlugins_js_1.getBuiltinPluginSkillCommands)();
                    (0, debug_js_1.logForDebugging)("getSkills returning: ".concat(skillDirCommands.length, " skill dir commands, ").concat(pluginSkills.length, " plugin skills, ").concat(bundledSkills.length, " bundled skills, ").concat(builtinPluginSkills.length, " builtin plugin skills"));
                    return [2 /*return*/, {
                            skillDirCommands: skillDirCommands,
                            pluginSkills: pluginSkills,
                            bundledSkills: bundledSkills,
                            builtinPluginSkills: builtinPluginSkills,
                        }];
                case 2:
                    err_1 = _b.sent();
                    // This should never happen since we catch at the Promise level, but defensive
                    (0, log_js_1.logError)((0, errors_js_1.toError)(err_1));
                    (0, debug_js_1.logForDebugging)('Unexpected error in getSkills, returning empty');
                    return [2 /*return*/, {
                            skillDirCommands: [],
                            pluginSkills: [],
                            bundledSkills: [],
                            builtinPluginSkills: [],
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/* eslint-disable @typescript-eslint/no-require-imports */
var getWorkflowCommands = (0, bun_bundle_1.feature)('WORKFLOW_SCRIPTS')
    ? require('./tools/WorkflowTool/createWorkflowCommand.js').getWorkflowCommands
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Filters commands by their declared `availability` (auth/provider requirement).
 * Commands without `availability` are treated as universal.
 * This runs before `isEnabled()` so that provider-gated commands are hidden
 * regardless of feature-flag state.
 *
 * Not memoized — auth state can change mid-session (e.g. after /login),
 * so this must be re-evaluated on every getCommands() call.
 */
function meetsAvailabilityRequirement(cmd) {
    if (!cmd.availability)
        return true;
    for (var _i = 0, _a = cmd.availability; _i < _a.length; _i++) {
        var a = _a[_i];
        switch (a) {
            case 'claude-ai':
                if ((0, auth_js_1.isClaudeAISubscriber)())
                    return true;
                break;
            case 'console':
                // Console API key user = direct 1P API customer (not 3P, not claude.ai).
                // Excludes 3P (Bedrock/Vertex/Foundry) who don't set ANTHROPIC_BASE_URL
                // and gateway users who proxy through a custom base URL.
                if (!(0, auth_js_1.isClaudeAISubscriber)() &&
                    !(0, auth_js_1.isUsing3PServices)() &&
                    (0, providers_js_1.isFirstPartyAnthropicBaseUrl)())
                    return true;
                break;
            default: {
                var _exhaustive = a;
                void _exhaustive;
                break;
            }
        }
    }
    return false;
}
/**
 * Loads all command sources (skills, plugins, workflows). Memoized by cwd
 * because loading is expensive (disk I/O, dynamic imports).
 */
var loadAllCommands = (0, memoize_js_1.default)(function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, skillDirCommands, pluginSkills, bundledSkills, builtinPluginSkills, pluginCommands, workflowCommands;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    getSkills(cwd),
                    (0, loadPluginCommands_js_1.getPluginCommands)(),
                    getWorkflowCommands ? getWorkflowCommands(cwd) : Promise.resolve([]),
                ])];
            case 1:
                _a = _c.sent(), _b = _a[0], skillDirCommands = _b.skillDirCommands, pluginSkills = _b.pluginSkills, bundledSkills = _b.bundledSkills, builtinPluginSkills = _b.builtinPluginSkills, pluginCommands = _a[1], workflowCommands = _a[2];
                return [2 /*return*/, __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], bundledSkills, true), builtinPluginSkills, true), skillDirCommands, true), workflowCommands, true), pluginCommands, true), pluginSkills, true), COMMANDS(), true)];
        }
    });
}); });
/**
 * Returns commands available to the current user. The expensive loading is
 * memoized, but availability and isEnabled checks run fresh every call so
 * auth changes (e.g. /login) take effect immediately.
 */
function getCommands(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var allCommands, dynamicSkills, baseCommands, baseCommandNames, uniqueDynamicSkills, builtInNames, insertIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadAllCommands(cwd)
                    // Get dynamic skills discovered during file operations
                ];
                case 1:
                    allCommands = _a.sent();
                    dynamicSkills = (0, loadSkillsDir_js_1.getDynamicSkills)();
                    baseCommands = allCommands.filter(function (_) { return meetsAvailabilityRequirement(_) && (0, command_js_1.isCommandEnabled)(_); });
                    if (dynamicSkills.length === 0) {
                        return [2 /*return*/, baseCommands];
                    }
                    baseCommandNames = new Set(baseCommands.map(function (c) { return c.name; }));
                    uniqueDynamicSkills = dynamicSkills.filter(function (s) {
                        return !baseCommandNames.has(s.name) &&
                            meetsAvailabilityRequirement(s) &&
                            (0, command_js_1.isCommandEnabled)(s);
                    });
                    if (uniqueDynamicSkills.length === 0) {
                        return [2 /*return*/, baseCommands];
                    }
                    builtInNames = new Set(COMMANDS().map(function (c) { return c.name; }));
                    insertIndex = baseCommands.findIndex(function (c) { return builtInNames.has(c.name); });
                    if (insertIndex === -1) {
                        return [2 /*return*/, __spreadArray(__spreadArray([], baseCommands, true), uniqueDynamicSkills, true)];
                    }
                    return [2 /*return*/, __spreadArray(__spreadArray(__spreadArray([], baseCommands.slice(0, insertIndex), true), uniqueDynamicSkills, true), baseCommands.slice(insertIndex), true)];
            }
        });
    });
}
/**
 * Clears only the memoization caches for commands, WITHOUT clearing skill caches.
 * Use this when dynamic skills are added to invalidate cached command lists.
 */
function clearCommandMemoizationCaches() {
    var _a, _b, _c, _d, _e, _f;
    (_b = (_a = loadAllCommands.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = exports.getSkillToolCommands.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    (_f = (_e = exports.getSlashCommandToolSkills.cache) === null || _e === void 0 ? void 0 : _e.clear) === null || _f === void 0 ? void 0 : _f.call(_e);
    // getSkillIndex in skillSearch/localSearch.ts is a separate memoization layer
    // built ON TOP of getSkillToolCommands/getCommands. Clearing only the inner
    // caches is a no-op for the outer — lodash memoize returns the cached result
    // without ever reaching the cleared inners. Must clear it explicitly.
    clearSkillIndexCache === null || clearSkillIndexCache === void 0 ? void 0 : clearSkillIndexCache();
}
function clearCommandsCache() {
    clearCommandMemoizationCaches();
    (0, loadPluginCommands_js_1.clearPluginCommandCache)();
    (0, loadPluginCommands_js_1.clearPluginSkillsCache)();
    (0, loadSkillsDir_js_1.clearSkillCaches)();
}
/**
 * Filter AppState.mcp.commands to MCP-provided skills (prompt-type,
 * model-invocable, loaded from MCP). These live outside getCommands() so
 * callers that need MCP skills in their skill index thread them through
 * separately.
 */
function getMcpSkillCommands(mcpCommands) {
    if ((0, bun_bundle_1.feature)('MCP_SKILLS')) {
        return mcpCommands.filter(function (cmd) {
            return cmd.type === 'prompt' &&
                cmd.loadedFrom === 'mcp' &&
                !cmd.disableModelInvocation;
        });
    }
    return [];
}
// SkillTool shows ALL prompt-based commands that the model can invoke
// This includes both skills (from /skills/) and commands (from /commands/)
exports.getSkillToolCommands = (0, memoize_js_1.default)(function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    var allCommands;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getCommands(cwd)];
            case 1:
                allCommands = _a.sent();
                return [2 /*return*/, allCommands.filter(function (cmd) {
                        return cmd.type === 'prompt' &&
                            !cmd.disableModelInvocation &&
                            cmd.source !== 'builtin' &&
                            // Always include skills from /skills/ dirs, bundled skills, and legacy /commands/ entries
                            // (they all get an auto-derived description from the first line if frontmatter is missing).
                            // Plugin/MCP commands still require an explicit description to appear in the listing.
                            (cmd.loadedFrom === 'bundled' ||
                                cmd.loadedFrom === 'skills' ||
                                cmd.loadedFrom === 'commands_DEPRECATED' ||
                                cmd.hasUserSpecifiedDescription ||
                                cmd.whenToUse);
                    })];
        }
    });
}); });
// Filters commands to include only skills. Skills are commands that provide
// specialized capabilities for the model to use. They are identified by
// loadedFrom being 'skills', 'plugin', or 'bundled', or having disableModelInvocation set.
exports.getSlashCommandToolSkills = (0, memoize_js_1.default)(function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    var allCommands, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getCommands(cwd)];
            case 1:
                allCommands = _a.sent();
                return [2 /*return*/, allCommands.filter(function (cmd) {
                        return cmd.type === 'prompt' &&
                            cmd.source !== 'builtin' &&
                            (cmd.hasUserSpecifiedDescription || cmd.whenToUse) &&
                            (cmd.loadedFrom === 'skills' ||
                                cmd.loadedFrom === 'plugin' ||
                                cmd.loadedFrom === 'bundled' ||
                                cmd.disableModelInvocation);
                    })];
            case 2:
                error_1 = _a.sent();
                (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                // Return empty array rather than throwing - skills are non-critical
                // This prevents skill loading failures from breaking the entire system
                (0, debug_js_1.logForDebugging)('Returning empty skills array due to load failure');
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Commands that are safe to use in remote mode (--remote).
 * These only affect local TUI state and don't depend on local filesystem,
 * git, shell, IDE, MCP, or other local execution context.
 *
 * Used in two places:
 * 1. Pre-filtering commands in main.tsx before REPL renders (prevents race with CCR init)
 * 2. Preserving local-only commands in REPL's handleRemoteInit after CCR filters
 */
exports.REMOTE_SAFE_COMMANDS = new Set([
    index_js_35.default, // Shows QR code / URL for remote session
    index_js_71.default, // Exit the TUI
    index_js_8.default, // Clear screen
    index_js_20.default, // Show help
    index_js_45.default, // Change terminal theme
    index_js_9.default, // Change agent color
    index_js_46.default, // Toggle vim mode
    index_js_15.default, // Show session cost (local cost tracking)
    index_js_44.default, // Show usage info
    index_js_10.default, // Copy last message
    index_js_4.default, // Quick note
    index_js_7.default, // Send feedback
    index_js_50.default, // Plan mode toggle
    index_js_22.default, // Keybinding management
    statusline_js_1.default, // Status line toggle
    index_js_69.default, // Stickers
    index_js_29.default, // Mobile QR code
]);
/**
 * Builtin commands of type 'local' that ARE safe to execute when received
 * over the Remote Control bridge. These produce text output that streams
 * back to the mobile/web client and have no terminal-only side effects.
 *
 * 'local-jsx' commands are blocked by type (they render Ink UI) and
 * 'prompt' commands are allowed by type (they expand to text sent to the
 * model) — this set only gates 'local' commands.
 *
 * When adding a new 'local' command that should work from mobile, add it
 * here. Default is blocked.
 */
exports.BRIDGE_SAFE_COMMANDS = new Set([
    index_js_12.default, // Shrink context — useful mid-session from a phone
    index_js_8.default, // Wipe transcript
    index_js_15.default, // Show session cost
    index_js_63.default, // Summarize conversation
    index_js_32.default, // Show changelog
    index_js_55.default, // List tracked files
].filter(function (c) { return c !== null; }));
/**
 * Whether a slash command is safe to execute when its input arrived over the
 * Remote Control bridge (mobile/web client).
 *
 * PR #19134 blanket-blocked all slash commands from bridge inbound because
 * `/model` from iOS was popping the local Ink picker. This predicate relaxes
 * that with an explicit allowlist: 'prompt' commands (skills) expand to text
 * and are safe by construction; 'local' commands need an explicit opt-in via
 * BRIDGE_SAFE_COMMANDS; 'local-jsx' commands render Ink UI and stay blocked.
 */
function isBridgeSafeCommand(cmd) {
    if (cmd.type === 'local-jsx')
        return false;
    if (cmd.type === 'prompt')
        return true;
    return exports.BRIDGE_SAFE_COMMANDS.has(cmd);
}
/**
 * Filter commands to only include those safe for remote mode.
 * Used to pre-filter commands when rendering the REPL in --remote mode,
 * preventing local-only commands from being briefly available before
 * the CCR init message arrives.
 */
function filterCommandsForRemoteMode(commands) {
    return commands.filter(function (cmd) { return exports.REMOTE_SAFE_COMMANDS.has(cmd); });
}
function findCommand(commandName, commands) {
    return commands.find(function (_) {
        var _a;
        return _.name === commandName ||
            (0, command_js_1.getCommandName)(_) === commandName ||
            ((_a = _.aliases) === null || _a === void 0 ? void 0 : _a.includes(commandName));
    });
}
function hasCommand(commandName, commands) {
    return findCommand(commandName, commands) !== undefined;
}
function getCommand(commandName, commands) {
    var command = findCommand(commandName, commands);
    if (!command) {
        throw ReferenceError("Command ".concat(commandName, " not found. Available commands: ").concat(commands
            .map(function (_) {
            var name = (0, command_js_1.getCommandName)(_);
            return _.aliases ? "".concat(name, " (aliases: ").concat(_.aliases.join(', '), ")") : name;
        })
            .sort(function (a, b) { return a.localeCompare(b); })
            .join(', ')));
    }
    return command;
}
/**
 * Formats a command's description with its source annotation for user-facing UI.
 * Use this in typeahead, help screens, and other places where users need to see
 * where a command comes from.
 *
 * For model-facing prompts (like SkillTool), use cmd.description directly.
 */
function formatDescriptionWithSource(cmd) {
    var _a;
    if (cmd.type !== 'prompt') {
        return cmd.description;
    }
    if (cmd.kind === 'workflow') {
        return "".concat(cmd.description, " (workflow)");
    }
    if (cmd.source === 'plugin') {
        var pluginName = (_a = cmd.pluginInfo) === null || _a === void 0 ? void 0 : _a.pluginManifest.name;
        if (pluginName) {
            return "(".concat(pluginName, ") ").concat(cmd.description);
        }
        return "".concat(cmd.description, " (plugin)");
    }
    if (cmd.source === 'builtin' || cmd.source === 'mcp') {
        return cmd.description;
    }
    if (cmd.source === 'bundled') {
        return "".concat(cmd.description, " (bundled)");
    }
    return "".concat(cmd.description, " (").concat((0, constants_js_1.getSettingSourceName)(cmd.source), ")");
}
