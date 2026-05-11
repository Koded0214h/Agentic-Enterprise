"use strict";
/* eslint-disable custom-rules/no-process-exit */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.setup = setup;
var bun_bundle_1 = require("bun:bundle");
var chalk_1 = require("chalk");
var index_js_1 = require("src/services/analytics/index.js");
var cwd_js_1 = require("src/utils/cwd.js");
var releaseNotes_js_1 = require("src/utils/releaseNotes.js");
var Shell_js_1 = require("src/utils/Shell.js");
var sinks_js_1 = require("src/utils/sinks.js");
var state_js_1 = require("./bootstrap/state.js");
var commands_js_1 = require("./commands.js");
var sessionMemory_js_1 = require("./services/SessionMemory/sessionMemory.js");
var ids_js_1 = require("./types/ids.js");
var agentSwarmsEnabled_js_1 = require("./utils/agentSwarmsEnabled.js");
var appleTerminalBackup_js_1 = require("./utils/appleTerminalBackup.js");
var auth_js_1 = require("./utils/auth.js");
var claudemd_js_1 = require("./utils/claudemd.js");
var config_js_1 = require("./utils/config.js");
var diagLogs_js_1 = require("./utils/diagLogs.js");
var env_js_1 = require("./utils/env.js");
var envDynamic_js_1 = require("./utils/envDynamic.js");
var envUtils_js_1 = require("./utils/envUtils.js");
var errors_js_1 = require("./utils/errors.js");
var git_js_1 = require("./utils/git.js");
var fileChangedWatcher_js_1 = require("./utils/hooks/fileChangedWatcher.js");
var hooksConfigSnapshot_js_1 = require("./utils/hooks/hooksConfigSnapshot.js");
var hooks_js_1 = require("./utils/hooks.js");
var iTermBackup_js_1 = require("./utils/iTermBackup.js");
var log_js_1 = require("./utils/log.js");
var logoV2Utils_js_1 = require("./utils/logoV2Utils.js");
var index_js_2 = require("./utils/nativeInstaller/index.js");
var plans_js_1 = require("./utils/plans.js");
var sessionStorage_js_1 = require("./utils/sessionStorage.js");
var startupProfiler_js_1 = require("./utils/startupProfiler.js");
var worktree_js_1 = require("./utils/worktree.js");
function setup(cwd, permissionMode, allowDangerouslySkipPermissions, worktreeEnabled, worktreeName, tmuxEnabled, customSessionId, worktreePRNumber, messagingSocketPath) {
    return __awaiter(this, void 0, void 0, function () {
        var nodeVersion, m, captureTeammateModeSnapshot, restoredIterm2Backup, restoredTerminalBackup, error_1, hooksStart, hasHook, inGit, slug, tmuxSessionName, mainRepoRoot, worktreeSession, error_2, tmuxResult, skipPluginPrefetch, hasReleaseNotes, _a, isDocker, hasInternet, isBubblewrap, isSandbox, isSandboxed, projectConfig;
        var _this = this;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'setup_started');
                    nodeVersion = (_b = process.version.match(/^v(\d+)\./)) === null || _b === void 0 ? void 0 : _b[1];
                    if (!nodeVersion || parseInt(nodeVersion) < 18) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error(chalk_1.default.bold.red('Error: Claude Code requires Node.js version 18 or higher.'));
                        process.exit(1);
                    }
                    // Set custom session ID if provided
                    if (customSessionId) {
                        (0, state_js_1.switchSession)((0, ids_js_1.asSessionId)(customSessionId));
                    }
                    if (!(!(0, envUtils_js_1.isBareMode)() || messagingSocketPath !== undefined)) return [3 /*break*/, 3];
                    if (!(0, bun_bundle_1.feature)('UDS_INBOX')) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./utils/udsMessaging.js'); })];
                case 1:
                    m = _d.sent();
                    return [4 /*yield*/, m.startUdsMessaging(messagingSocketPath !== null && messagingSocketPath !== void 0 ? messagingSocketPath : m.getDefaultUdsSocketPath(), { isExplicit: messagingSocketPath !== undefined })];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    if (!(!(0, envUtils_js_1.isBareMode)() && (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)())) return [3 /*break*/, 5];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./utils/swarm/backends/teammateModeSnapshot.js'); })];
                case 4:
                    captureTeammateModeSnapshot = (_d.sent()).captureTeammateModeSnapshot;
                    captureTeammateModeSnapshot();
                    _d.label = 5;
                case 5:
                    if (!!(0, state_js_1.getIsNonInteractiveSession)()) return [3 /*break*/, 10];
                    if (!(0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, iTermBackup_js_1.checkAndRestoreITerm2Backup)()];
                case 6:
                    restoredIterm2Backup = _d.sent();
                    if (restoredIterm2Backup.status === 'restored') {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log(chalk_1.default.yellow('Detected an interrupted iTerm2 setup. Your original settings have been restored. You may need to restart iTerm2 for the changes to take effect.'));
                    }
                    else if (restoredIterm2Backup.status === 'failed') {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error(chalk_1.default.red("Failed to restore iTerm2 settings. Please manually restore your original settings with: defaults import com.googlecode.iterm2 ".concat(restoredIterm2Backup.backupPath, ".")));
                    }
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, appleTerminalBackup_js_1.checkAndRestoreTerminalBackup)()];
                case 8:
                    restoredTerminalBackup = _d.sent();
                    if (restoredTerminalBackup.status === 'restored') {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log(chalk_1.default.yellow('Detected an interrupted Terminal.app setup. Your original settings have been restored. You may need to restart Terminal.app for the changes to take effect.'));
                    }
                    else if (restoredTerminalBackup.status === 'failed') {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error(chalk_1.default.red("Failed to restore Terminal.app settings. Please manually restore your original settings with: defaults import com.apple.Terminal ".concat(restoredTerminalBackup.backupPath, ".")));
                    }
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _d.sent();
                    // Log but don't crash if Terminal.app backup restoration fails
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 10];
                case 10:
                    // IMPORTANT: setCwd() must be called before any other code that depends on the cwd
                    (0, Shell_js_1.setCwd)(cwd);
                    hooksStart = Date.now();
                    (0, hooksConfigSnapshot_js_1.captureHooksConfigSnapshot)();
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'setup_hooks_captured', {
                        duration_ms: Date.now() - hooksStart,
                    });
                    // Initialize FileChanged hook watcher — sync, reads hook config snapshot
                    (0, fileChangedWatcher_js_1.initializeFileChangedWatcher)(cwd);
                    if (!worktreeEnabled) return [3 /*break*/, 18];
                    hasHook = (0, hooks_js_1.hasWorktreeCreateHook)();
                    return [4 /*yield*/, (0, git_js_1.getIsGit)()];
                case 11:
                    inGit = _d.sent();
                    if (!hasHook && !inGit) {
                        process.stderr.write(chalk_1.default.red("Error: Can only use --worktree in a git repository, but ".concat(chalk_1.default.bold(cwd), " is not a git repository. ") +
                            "Configure a WorktreeCreate hook in settings.json to use --worktree with other VCS systems.\n"));
                        process.exit(1);
                    }
                    slug = worktreePRNumber
                        ? "pr-".concat(worktreePRNumber)
                        : (worktreeName !== null && worktreeName !== void 0 ? worktreeName : (0, plans_js_1.getPlanSlug)());
                    tmuxSessionName = void 0;
                    if (inGit) {
                        mainRepoRoot = (0, git_js_1.findCanonicalGitRoot)((0, cwd_js_1.getCwd)());
                        if (!mainRepoRoot) {
                            process.stderr.write(chalk_1.default.red("Error: Could not determine the main git repository root.\n"));
                            process.exit(1);
                        }
                        // If we're inside a worktree, switch to the main repo for worktree creation
                        if (mainRepoRoot !== ((_c = (0, git_js_1.findGitRoot)((0, cwd_js_1.getCwd)())) !== null && _c !== void 0 ? _c : (0, cwd_js_1.getCwd)())) {
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'worktree_resolved_to_main_repo');
                            process.chdir(mainRepoRoot);
                            (0, Shell_js_1.setCwd)(mainRepoRoot);
                        }
                        tmuxSessionName = tmuxEnabled
                            ? (0, worktree_js_1.generateTmuxSessionName)(mainRepoRoot, (0, worktree_js_1.worktreeBranchName)(slug))
                            : undefined;
                    }
                    else {
                        // Non-git hook mode: no canonical root to resolve, so name the tmux
                        // session from cwd — generateTmuxSessionName only basenames the path.
                        tmuxSessionName = tmuxEnabled
                            ? (0, worktree_js_1.generateTmuxSessionName)((0, cwd_js_1.getCwd)(), (0, worktree_js_1.worktreeBranchName)(slug))
                            : undefined;
                    }
                    worktreeSession = void 0;
                    _d.label = 12;
                case 12:
                    _d.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, (0, worktree_js_1.createWorktreeForSession)((0, state_js_1.getSessionId)(), slug, tmuxSessionName, worktreePRNumber ? { prNumber: worktreePRNumber } : undefined)];
                case 13:
                    worktreeSession = _d.sent();
                    return [3 /*break*/, 15];
                case 14:
                    error_2 = _d.sent();
                    process.stderr.write(chalk_1.default.red("Error creating worktree: ".concat((0, errors_js_1.errorMessage)(error_2), "\n")));
                    process.exit(1);
                    return [3 /*break*/, 15];
                case 15:
                    (0, index_js_1.logEvent)('tengu_worktree_created', { tmux_enabled: tmuxEnabled });
                    if (!(tmuxEnabled && tmuxSessionName)) return [3 /*break*/, 17];
                    return [4 /*yield*/, (0, worktree_js_1.createTmuxSessionForWorktree)(tmuxSessionName, worktreeSession.worktreePath)];
                case 16:
                    tmuxResult = _d.sent();
                    if (tmuxResult.created) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log(chalk_1.default.green("Created tmux session: ".concat(chalk_1.default.bold(tmuxSessionName), "\nTo attach: ").concat(chalk_1.default.bold("tmux attach -t ".concat(tmuxSessionName)))));
                    }
                    else {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error(chalk_1.default.yellow("Warning: Failed to create tmux session: ".concat(tmuxResult.error)));
                    }
                    _d.label = 17;
                case 17:
                    process.chdir(worktreeSession.worktreePath);
                    (0, Shell_js_1.setCwd)(worktreeSession.worktreePath);
                    (0, state_js_1.setOriginalCwd)((0, cwd_js_1.getCwd)());
                    // --worktree means the worktree IS the session's project, so skills/hooks/
                    // cron/etc. should resolve here. (EnterWorktreeTool mid-session does NOT
                    // touch projectRoot — that's a throwaway worktree, project stays stable.)
                    (0, state_js_1.setProjectRoot)((0, cwd_js_1.getCwd)());
                    (0, sessionStorage_js_1.saveWorktreeState)(worktreeSession);
                    // Clear memory files cache since originalCwd has changed
                    (0, claudemd_js_1.clearMemoryFileCaches)();
                    // Settings cache was populated in init() (via applySafeConfigEnvironmentVariables)
                    // and again at captureHooksConfigSnapshot() above, both from the original dir's
                    // .claude/settings.json. Re-read from the worktree and re-capture hooks.
                    (0, hooksConfigSnapshot_js_1.updateHooksConfigSnapshot)();
                    _d.label = 18;
                case 18:
                    // Background jobs - only critical registrations that must happen before first query
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'setup_background_jobs_starting');
                    // Bundled skills/plugins are registered in main.tsx before the parallel
                    // getCommands() kick — see comment there. Moved out of setup() because
                    // the await points above (startUdsMessaging, ~20ms) meant getCommands()
                    // raced ahead and memoized an empty bundledSkills list.
                    if (!(0, envUtils_js_1.isBareMode)()) {
                        (0, sessionMemory_js_1.initSessionMemory)(); // Synchronous - registers hook, gate check happens lazily
                        if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                            /* eslint-disable @typescript-eslint/no-require-imports */
                            ;
                            require('./services/contextCollapse/index.js').initContextCollapse();
                            /* eslint-enable @typescript-eslint/no-require-imports */
                        }
                    }
                    void (0, index_js_2.lockCurrentVersion)(); // Lock current version to prevent deletion by other processes
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'setup_background_jobs_launched');
                    (0, startupProfiler_js_1.profileCheckpoint)('setup_before_prefetch');
                    // Pre-fetch promises - only items needed before render
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'setup_prefetch_starting');
                    skipPluginPrefetch = ((0, state_js_1.getIsNonInteractiveSession)() &&
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SYNC_PLUGIN_INSTALL)) ||
                        // --bare: loadPluginHooks → loadAllPlugins is filesystem work that's
                        // wasted when executeHooks early-returns under --bare anyway.
                        (0, envUtils_js_1.isBareMode)();
                    if (!skipPluginPrefetch) {
                        void (0, commands_js_1.getCommands)((0, state_js_1.getProjectRoot)());
                    }
                    void Promise.resolve().then(function () { return require('./utils/plugins/loadPluginHooks.js'); }).then(function (m) {
                        if (!skipPluginPrefetch) {
                            void m.loadPluginHooks(); // Pre-load plugin hooks (consumed by processSessionStartHooks before render)
                            m.setupPluginHookHotReload(); // Set up hot reload for plugin hooks when settings change
                        }
                    });
                    // --bare: skip attribution hook install + repo classification +
                    // session-file-access analytics + team memory watcher. These are background
                    // bookkeeping for commit attribution + usage metrics — scripted calls don't
                    // commit code, and the 49ms attribution hook stat check (measured) is pure
                    // overhead. NOT an early-return: the --dangerously-skip-permissions safety
                    // gate, tengu_started beacon, and apiKeyHelper prefetch below must still run.
                    if (!(0, envUtils_js_1.isBareMode)()) {
                        if (process.env.USER_TYPE === 'ant') {
                            // Prime repo classification cache for auto-undercover mode. Default is
                            // undercover ON until proven internal; if this resolves to internal, clear
                            // the prompt cache so the next turn picks up the OFF state.
                            void Promise.resolve().then(function () { return require('./utils/commitAttribution.js'); }).then(function (m) { return __awaiter(_this, void 0, void 0, function () {
                                var clearSystemPromptSections;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, m.isInternalModelRepo()];
                                        case 1:
                                            if (!_a.sent()) return [3 /*break*/, 3];
                                            return [4 /*yield*/, Promise.resolve().then(function () { return require('./constants/systemPromptSections.js'); })];
                                        case 2:
                                            clearSystemPromptSections = (_a.sent()).clearSystemPromptSections;
                                            clearSystemPromptSections();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION')) {
                            // Dynamic import to enable dead code elimination (module contains excluded strings).
                            // Defer to next tick so the git subprocess spawn runs after first render
                            // rather than during the setup() microtask window.
                            setImmediate(function () {
                                void Promise.resolve().then(function () { return require('./utils/attributionHooks.js'); }).then(function (_a) {
                                    var registerAttributionHooks = _a.registerAttributionHooks;
                                    registerAttributionHooks(); // Register attribution tracking hooks (ant-only feature)
                                });
                            });
                        }
                        void Promise.resolve().then(function () { return require('./utils/sessionFileAccessHooks.js'); }).then(function (m) {
                            return m.registerSessionFileAccessHooks();
                        }); // Register session file access analytics hooks
                        if ((0, bun_bundle_1.feature)('TEAMMEM')) {
                            void Promise.resolve().then(function () { return require('./services/teamMemorySync/watcher.js'); }).then(function (m) {
                                return m.startTeamMemoryWatcher();
                            }); // Start team memory sync watcher
                        }
                    }
                    (0, sinks_js_1.initSinks)(); // Attach error log + analytics sinks and drain queued events
                    // Session-success-rate denominator. Emit immediately after the analytics
                    // sink is attached — before any parsing, fetching, or I/O that could throw.
                    // inc-3694 (P0 CHANGELOG crash) threw at checkForReleaseNotes below; every
                    // event after this point was dead. This beacon is the earliest reliable
                    // "process started" signal for release health monitoring.
                    (0, index_js_1.logEvent)('tengu_started', {});
                    void (0, auth_js_1.prefetchApiKeyFromApiKeyHelperIfSafe)((0, state_js_1.getIsNonInteractiveSession)()); // Prefetch safely - only executes if trust already confirmed
                    (0, startupProfiler_js_1.profileCheckpoint)('setup_after_prefetch');
                    if (!!(0, envUtils_js_1.isBareMode)()) return [3 /*break*/, 21];
                    return [4 /*yield*/, (0, releaseNotes_js_1.checkForReleaseNotes)((0, config_js_1.getGlobalConfig)().lastReleaseNotesSeen)];
                case 19:
                    hasReleaseNotes = (_d.sent()).hasReleaseNotes;
                    if (!hasReleaseNotes) return [3 /*break*/, 21];
                    return [4 /*yield*/, (0, logoV2Utils_js_1.getRecentActivity)()];
                case 20:
                    _d.sent();
                    _d.label = 21;
                case 21:
                    if (!(permissionMode === 'bypassPermissions' ||
                        allowDangerouslySkipPermissions)) return [3 /*break*/, 23];
                    // Check if running as root/sudo on Unix-like systems
                    // Allow root if in a sandbox (e.g., TPU devspaces that require root)
                    if (process.platform !== 'win32' &&
                        typeof process.getuid === 'function' &&
                        process.getuid() === 0 &&
                        process.env.IS_SANDBOX !== '1' &&
                        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_BUBBLEWRAP)) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error("--dangerously-skip-permissions cannot be used with root/sudo privileges for security reasons");
                        process.exit(1);
                    }
                    if (!(process.env.USER_TYPE === 'ant' &&
                        // Skip for Desktop's local agent mode — same trust model as CCR/BYOC
                        // (trusted Anthropic-managed launcher intentionally pre-approving everything).
                        // Precedent: permissionSetup.ts:861, applySettingsChange.ts:55 (PR #19116)
                        process.env.CLAUDE_CODE_ENTRYPOINT !== 'local-agent' &&
                        // Same for CCD (Claude Code in Desktop) — apps#29127 passes the flag
                        // unconditionally to unlock mid-session bypass switching
                        process.env.CLAUDE_CODE_ENTRYPOINT !== 'claude-desktop')) return [3 /*break*/, 23];
                    return [4 /*yield*/, Promise.all([
                            envDynamic_js_1.envDynamic.getIsDocker(),
                            env_js_1.env.hasInternetAccess(),
                        ])];
                case 22:
                    _a = _d.sent(), isDocker = _a[0], hasInternet = _a[1];
                    isBubblewrap = envDynamic_js_1.envDynamic.getIsBubblewrapSandbox();
                    isSandbox = process.env.IS_SANDBOX === '1';
                    isSandboxed = isDocker || isBubblewrap || isSandbox;
                    if (!isSandboxed || hasInternet) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error("--dangerously-skip-permissions can only be used in Docker/sandbox containers with no internet access but got Docker: ".concat(isDocker, ", Bubblewrap: ").concat(isBubblewrap, ", IS_SANDBOX: ").concat(isSandbox, ", hasInternet: ").concat(hasInternet));
                        process.exit(1);
                    }
                    _d.label = 23;
                case 23:
                    if (process.env.NODE_ENV === 'test') {
                        return [2 /*return*/];
                    }
                    projectConfig = (0, config_js_1.getCurrentProjectConfig)();
                    if (projectConfig.lastCost !== undefined &&
                        projectConfig.lastDuration !== undefined) {
                        (0, index_js_1.logEvent)('tengu_exit', __assign({ last_session_cost: projectConfig.lastCost, last_session_api_duration: projectConfig.lastAPIDuration, last_session_tool_duration: projectConfig.lastToolDuration, last_session_duration: projectConfig.lastDuration, last_session_lines_added: projectConfig.lastLinesAdded, last_session_lines_removed: projectConfig.lastLinesRemoved, last_session_total_input_tokens: projectConfig.lastTotalInputTokens, last_session_total_output_tokens: projectConfig.lastTotalOutputTokens, last_session_total_cache_creation_input_tokens: projectConfig.lastTotalCacheCreationInputTokens, last_session_total_cache_read_input_tokens: projectConfig.lastTotalCacheReadInputTokens, last_session_fps_average: projectConfig.lastFpsAverage, last_session_fps_low_1_pct: projectConfig.lastFpsLow1Pct, last_session_id: projectConfig.lastSessionId }, projectConfig.lastSessionMetrics));
                        // Note: We intentionally don't clear these values after logging.
                        // They're needed for cost restoration when resuming sessions.
                        // The values will be overwritten when the next session exits.
                    }
                    return [2 /*return*/];
            }
        });
    });
}
