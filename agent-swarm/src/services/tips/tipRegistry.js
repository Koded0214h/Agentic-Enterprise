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
exports.getRelevantTips = getRelevantTips;
var chalk_1 = require("chalk");
var debug_js_1 = require("src/utils/debug.js");
var fileHistory_js_1 = require("src/utils/fileHistory.js");
var settings_js_1 = require("src/utils/settings/settings.js");
var terminalSetup_js_1 = require("../../commands/terminalSetup/terminalSetup.js");
var DesktopUpsellStartup_js_1 = require("../../components/DesktopUpsell/DesktopUpsellStartup.js");
var color_js_1 = require("../../components/design-system/color.js");
var OverageCreditUpsell_js_1 = require("../../components/LogoV2/OverageCreditUpsell.js");
var shortcutFormat_js_1 = require("../../keybindings/shortcutFormat.js");
var prompt_js_1 = require("../../tools/ScheduleCronTool/prompt.js");
var auth_js_1 = require("../../utils/auth.js");
var concurrentSessions_js_1 = require("../../utils/concurrentSessions.js");
var config_js_1 = require("../../utils/config.js");
var effort_js_1 = require("../../utils/effort.js");
var env_js_1 = require("../../utils/env.js");
var fileStateCache_js_1 = require("../../utils/fileStateCache.js");
var git_js_1 = require("../../utils/git.js");
var ide_js_1 = require("../../utils/ide.js");
var model_js_1 = require("../../utils/model/model.js");
var platform_js_1 = require("../../utils/platform.js");
var installedPluginsManager_js_1 = require("../../utils/plugins/installedPluginsManager.js");
var marketplaceManager_js_1 = require("../../utils/plugins/marketplaceManager.js");
var officialMarketplace_js_1 = require("../../utils/plugins/officialMarketplace.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var overageCreditGrant_js_1 = require("../api/overageCreditGrant.js");
var referral_js_1 = require("../api/referral.js");
var tipHistory_js_1 = require("./tipHistory.js");
var _isOfficialMarketplaceInstalledCache;
function isOfficialMarketplaceInstalled() {
    return __awaiter(this, void 0, void 0, function () {
        var config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (_isOfficialMarketplaceInstalledCache !== undefined) {
                        return [2 /*return*/, _isOfficialMarketplaceInstalledCache];
                    }
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfigSafe)()];
                case 1:
                    config = _a.sent();
                    _isOfficialMarketplaceInstalledCache = officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME in config;
                    return [2 /*return*/, _isOfficialMarketplaceInstalledCache];
            }
        });
    });
}
function isMarketplacePluginRelevant(pluginName, context, signals) {
    return __awaiter(this, void 0, void 0, function () {
        var bashTools, readFiles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, isOfficialMarketplaceInstalled()];
                case 1:
                    if (!(_a.sent())) {
                        return [2 /*return*/, false];
                    }
                    if ((0, installedPluginsManager_js_1.isPluginInstalled)("".concat(pluginName, "@").concat(officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME))) {
                        return [2 /*return*/, false];
                    }
                    bashTools = (context !== null && context !== void 0 ? context : {}).bashTools;
                    if (signals.cli && (bashTools === null || bashTools === void 0 ? void 0 : bashTools.size)) {
                        if (signals.cli.some(function (cmd) { return bashTools.has(cmd); })) {
                            return [2 /*return*/, true];
                        }
                    }
                    if (signals.filePath && (context === null || context === void 0 ? void 0 : context.readFileState)) {
                        readFiles = (0, fileStateCache_js_1.cacheKeys)(context.readFileState);
                        if (readFiles.some(function (fp) { return signals.filePath.test(fp); })) {
                            return [2 /*return*/, true];
                        }
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
var externalTips = [
    {
        id: 'new-user-warmup',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, "Start with small features or bug fixes, tell Claude to propose a plan, and verify its suggested edits"];
        }); }); },
        cooldownSessions: 3,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.numStartups < 10];
                });
            });
        },
    },
    {
        id: 'plan-mode-for-complex-tasks',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, "Use Plan Mode to prepare for a complex request before making changes. Press ".concat((0, shortcutFormat_js_1.getShortcutDisplay)('chat:cycleMode', 'Chat', 'shift+tab'), " twice to enable.")];
        }); }); },
        cooldownSessions: 5,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, daysSinceLastUse;
            return __generator(this, function (_a) {
                if (process.env.USER_TYPE === 'ant')
                    return [2 /*return*/, false];
                config = (0, config_js_1.getGlobalConfig)();
                daysSinceLastUse = config.lastPlanModeUse
                    ? (Date.now() - config.lastPlanModeUse) / (1000 * 60 * 60 * 24)
                    : Infinity;
                return [2 /*return*/, daysSinceLastUse > 7];
            });
        }); },
    },
    {
        id: 'default-permission-mode-config',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, "Use /config to change your default permission mode (including Plan Mode)"];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, settings, hasUsedPlanMode, hasDefaultMode;
            var _a;
            return __generator(this, function (_b) {
                try {
                    config = (0, config_js_1.getGlobalConfig)();
                    settings = (0, settings_js_1.getSettings_DEPRECATED)();
                    hasUsedPlanMode = Boolean(config.lastPlanModeUse);
                    hasDefaultMode = Boolean((_a = settings === null || settings === void 0 ? void 0 : settings.permissions) === null || _a === void 0 ? void 0 : _a.defaultMode);
                    return [2 /*return*/, hasUsedPlanMode && !hasDefaultMode];
                }
                catch (error) {
                    (0, debug_js_1.logForDebugging)("Failed to check default-permission-mode-config tip relevance: ".concat(error), { level: 'warn' });
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        }); },
    },
    {
        id: 'git-worktrees',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use git worktrees to run multiple Claude sessions in parallel.'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, worktreeCount, _1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        config = (0, config_js_1.getGlobalConfig)();
                        return [4 /*yield*/, (0, git_js_1.getWorktreeCount)()];
                    case 1:
                        worktreeCount = _a.sent();
                        return [2 /*return*/, worktreeCount <= 1 && config.numStartups > 50];
                    case 2:
                        _1 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        }); },
    },
    {
        id: 'color-when-multi-clauding',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Running multiple Claude sessions? Use /color and /rename to tell them apart at a glance.'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if ((0, sessionStorage_js_1.getCurrentSessionAgentColor)())
                            return [2 /*return*/, false];
                        return [4 /*yield*/, (0, concurrentSessions_js_1.countConcurrentSessions)()];
                    case 1:
                        count = _a.sent();
                        return [2 /*return*/, count >= 2];
                }
            });
        }); },
    },
    {
        id: 'terminal-setup',
        content: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, env_js_1.env.terminal === 'Apple_Terminal'
                        ? 'Run /terminal-setup to enable convenient terminal integration like Option + Enter for new line and more'
                        : 'Run /terminal-setup to enable convenient terminal integration like Shift + Enter for new line and more'];
            });
        }); },
        cooldownSessions: 10,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    if (env_js_1.env.terminal === 'Apple_Terminal') {
                        return [2 /*return*/, !config.optionAsMetaKeyInstalled];
                    }
                    return [2 /*return*/, !config.shiftEnterKeyBindingInstalled];
                });
            });
        },
    },
    {
        id: 'shift-enter',
        content: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, env_js_1.env.terminal === 'Apple_Terminal'
                        ? 'Press Option+Enter to send a multi-line message'
                        : 'Press Shift+Enter to send a multi-line message'];
            });
        }); },
        cooldownSessions: 10,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, Boolean((env_js_1.env.terminal === 'Apple_Terminal'
                            ? config.optionAsMetaKeyInstalled
                            : config.shiftEnterKeyBindingInstalled) && config.numStartups > 3)];
                });
            });
        },
    },
    {
        id: 'shift-enter-setup',
        content: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, env_js_1.env.terminal === 'Apple_Terminal'
                        ? 'Run /terminal-setup to enable Option+Enter for new lines'
                        : 'Run /terminal-setup to enable Shift+Enter for new lines'];
            });
        }); },
        cooldownSessions: 10,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    if (!(0, terminalSetup_js_1.shouldOfferTerminalSetup)()) {
                        return [2 /*return*/, false];
                    }
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, !(env_js_1.env.terminal === 'Apple_Terminal'
                            ? config.optionAsMetaKeyInstalled
                            : config.shiftEnterKeyBindingInstalled)];
                });
            });
        },
    },
    {
        id: 'memory-command',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use /memory to view and manage Claude memory'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.memoryUsageCount <= 0];
                });
            });
        },
    },
    {
        id: 'theme-command',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use /theme to change the color theme'];
        }); }); },
        cooldownSessions: 20,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'colorterm-truecolor',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Try setting environment variable COLORTERM=truecolor for richer colors'];
        }); }); },
        cooldownSessions: 30,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, !process.env.COLORTERM && chalk_1.default.level < 3];
        }); }); },
    },
    {
        id: 'powershell-tool-env',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Set CLAUDE_CODE_USE_POWERSHELL_TOOL=1 to enable the PowerShell tool (preview)'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, platform_js_1.getPlatform)() === 'windows' &&
                        process.env.CLAUDE_CODE_USE_POWERSHELL_TOOL === undefined];
            });
        }); },
    },
    {
        id: 'status-line',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use /statusline to set up a custom status line that will display beneath the input box'];
        }); }); },
        cooldownSessions: 25,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, settings_js_1.getSettings_DEPRECATED)().statusLine === undefined];
        }); }); },
    },
    {
        id: 'prompt-queue',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Hit Enter to queue up additional messages while Claude is working.'];
        }); }); },
        cooldownSessions: 5,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.promptQueueUseCount <= 3];
                });
            });
        },
    },
    {
        id: 'enter-to-steer-in-relatime',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Send messages to Claude while it works to steer Claude in real-time'];
        }); }); },
        cooldownSessions: 20,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'todo-list',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Ask Claude to create a todo list when working on complex tasks to track progress and remain on track'];
        }); }); },
        cooldownSessions: 20,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'vscode-command-install',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, "Open the Command Palette (Cmd+Shift+P) and run \"Shell Command: Install '".concat(env_js_1.env.terminal === 'vscode' ? 'code' : env_js_1.env.terminal, "' command in PATH\" to enable IDE integration")];
        }); }); },
        cooldownSessions: 0,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // Only show this tip if we're in a VS Code-style terminal
                            if (!(0, ide_js_1.isSupportedVSCodeTerminal)()) {
                                return [2 /*return*/, false];
                            }
                            if ((0, platform_js_1.getPlatform)() !== 'macos') {
                                return [2 /*return*/, false];
                            }
                            _a = env_js_1.env.terminal;
                            switch (_a) {
                                case 'vscode': return [3 /*break*/, 1];
                                case 'cursor': return [3 /*break*/, 3];
                                case 'windsurf': return [3 /*break*/, 5];
                            }
                            return [3 /*break*/, 7];
                        case 1: return [4 /*yield*/, (0, ide_js_1.isVSCodeInstalled)()];
                        case 2: return [2 /*return*/, !(_b.sent())];
                        case 3: return [4 /*yield*/, (0, ide_js_1.isCursorInstalled)()];
                        case 4: return [2 /*return*/, !(_b.sent())];
                        case 5: return [4 /*yield*/, (0, ide_js_1.isWindsurfInstalled)()];
                        case 6: return [2 /*return*/, !(_b.sent())];
                        case 7: return [2 /*return*/, false];
                    }
                });
            });
        },
    },
    {
        id: 'ide-upsell-external-terminal',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Connect Claude to your IDE · /ide'];
        }); }); },
        cooldownSessions: 4,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var lockfiles, runningIDEs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if ((0, ide_js_1.isSupportedTerminal)()) {
                                return [2 /*return*/, false];
                            }
                            return [4 /*yield*/, (0, ide_js_1.getSortedIdeLockfiles)()];
                        case 1:
                            lockfiles = _a.sent();
                            if (lockfiles.length !== 0) {
                                return [2 /*return*/, false];
                            }
                            return [4 /*yield*/, (0, ide_js_1.detectRunningIDEsCached)()];
                        case 2:
                            runningIDEs = _a.sent();
                            return [2 /*return*/, runningIDEs.length > 0];
                    }
                });
            });
        },
    },
    {
        id: 'install-github-app',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Run /install-github-app to tag @claude right from your Github issues and PRs'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, !(0, config_js_1.getGlobalConfig)().githubActionSetupCount];
        }); }); },
    },
    {
        id: 'install-slack-app',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Run /install-slack-app to use Claude in Slack'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, !(0, config_js_1.getGlobalConfig)().slackAppInstallCount];
        }); }); },
    },
    {
        id: 'permissions',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use /permissions to pre-approve and pre-deny bash, edit, and MCP tools'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.numStartups > 10];
                });
            });
        },
    },
    {
        id: 'drag-and-drop-images',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Did you know you can drag and drop image files into your terminal?'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, !env_js_1.env.isSSH()];
        }); }); },
    },
    {
        id: 'paste-images-mac',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Paste images into Claude Code using control+v (not cmd+v!)'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, platform_js_1.getPlatform)() === 'macos'];
        }); }); },
    },
    {
        id: 'double-esc',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Double-tap esc to rewind the conversation to a previous point in time'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, !(0, fileHistory_js_1.fileHistoryEnabled)()];
        }); }); },
    },
    {
        id: 'double-esc-code-restore',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Double-tap esc to rewind the code and/or conversation to a previous point in time'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, fileHistory_js_1.fileHistoryEnabled)()];
        }); }); },
    },
    {
        id: 'continue',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Run claude --continue or claude --resume to resume a conversation'];
        }); }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'rename-conversation',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Name your conversations with /rename to find them easily in /resume later'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, sessionStorage_js_1.isCustomTitleEnabled)() && (0, config_js_1.getGlobalConfig)().numStartups > 10];
        }); }); },
    },
    {
        id: 'custom-commands',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Create skills by adding .md files to .claude/skills/ in your project or ~/.claude/skills/ for skills that work in any project'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.numStartups > 10];
                });
            });
        },
    },
    {
        id: 'shift-tab',
        content: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, process.env.USER_TYPE === 'ant'
                        ? "Hit ".concat((0, shortcutFormat_js_1.getShortcutDisplay)('chat:cycleMode', 'Chat', 'shift+tab'), " to cycle between default mode and auto mode")
                        : "Hit ".concat((0, shortcutFormat_js_1.getShortcutDisplay)('chat:cycleMode', 'Chat', 'shift+tab'), " to cycle between default mode, auto-accept edit mode, and plan mode")];
            });
        }); },
        cooldownSessions: 10,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'image-paste',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, "Use ".concat((0, shortcutFormat_js_1.getShortcutDisplay)('chat:imagePaste', 'Chat', 'ctrl+v'), " to paste images from your clipboard")];
        }); }); },
        cooldownSessions: 20,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'custom-agents',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use /agents to optimize specific tasks. Eg. Software Architect, Code Writer, Code Reviewer'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.numStartups > 5];
                });
            });
        },
    },
    {
        id: 'agent-flag',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use --agent <agent_name> to directly start a conversation with a subagent'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.numStartups > 5];
                });
            });
        },
    },
    {
        id: 'desktop-app',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Run Claude Code locally or remotely using the Claude desktop app: clau.de/desktop'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, platform_js_1.getPlatform)() !== 'linux'];
        }); }); },
    },
    {
        id: 'desktop-shortcut',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var blue;
            return __generator(this, function (_a) {
                blue = (0, color_js_1.color)('suggestion', ctx.theme);
                return [2 /*return*/, "Continue your session in Claude Code Desktop with ".concat(blue('/desktop'))];
            });
        }); },
        cooldownSessions: 15,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(0, DesktopUpsellStartup_js_1.getDesktopUpsellConfig)().enable_shortcut_tip)
                    return [2 /*return*/, false];
                return [2 /*return*/, (process.platform === 'darwin' ||
                        (process.platform === 'win32' && process.arch === 'x64'))];
            });
        }); },
    },
    {
        id: 'web-app',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Run tasks in the cloud while you keep coding locally · clau.de/web'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'mobile-app',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, '/mobile to use Claude Code from the Claude app on your phone'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    },
    {
        id: 'opusplan-mode-reminder',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, "Your default model setting is Opus Plan Mode. Press ".concat((0, shortcutFormat_js_1.getShortcutDisplay)('chat:cycleMode', 'Chat', 'shift+tab'), " twice to activate Plan Mode and plan with Claude Opus.")];
        }); }); },
        cooldownSessions: 2,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config, modelSetting, hasOpusPlanMode, daysSinceLastUse;
                return __generator(this, function (_a) {
                    if (process.env.USER_TYPE === 'ant')
                        return [2 /*return*/, false];
                    config = (0, config_js_1.getGlobalConfig)();
                    modelSetting = (0, model_js_1.getUserSpecifiedModelSetting)();
                    hasOpusPlanMode = modelSetting === 'opusplan';
                    daysSinceLastUse = config.lastPlanModeUse
                        ? (Date.now() - config.lastPlanModeUse) / (1000 * 60 * 60 * 24)
                        : Infinity;
                    return [2 /*return*/, hasOpusPlanMode && daysSinceLastUse > 3];
                });
            });
        },
    },
    {
        id: 'frontend-design-plugin',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var blue;
            return __generator(this, function (_a) {
                blue = (0, color_js_1.color)('suggestion', ctx.theme);
                return [2 /*return*/, "Working with HTML/CSS? Install the frontend-design plugin:\n".concat(blue("/plugin install frontend-design@".concat(officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME)))];
            });
        }); },
        cooldownSessions: 3,
        isRelevant: function (context) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, isMarketplacePluginRelevant('frontend-design', context, {
                        filePath: /\.(html|css|htm)$/i,
                    })];
            });
        }); },
    },
    {
        id: 'vercel-plugin',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var blue;
            return __generator(this, function (_a) {
                blue = (0, color_js_1.color)('suggestion', ctx.theme);
                return [2 /*return*/, "Working with Vercel? Install the vercel plugin:\n".concat(blue("/plugin install vercel@".concat(officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME)))];
            });
        }); },
        cooldownSessions: 3,
        isRelevant: function (context) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, isMarketplacePluginRelevant('vercel', context, {
                        filePath: /(?:^|[/\\])vercel\.json$/i,
                        cli: ['vercel'],
                    })];
            });
        }); },
    },
    {
        id: 'effort-high-nudge',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var blue, cmd, variant;
            return __generator(this, function (_a) {
                blue = (0, color_js_1.color)('suggestion', ctx.theme);
                cmd = blue('/effort high');
                variant = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_tide_elm', 'off');
                return [2 /*return*/, variant === 'copy_b'
                        ? "Use ".concat(cmd, " for better one-shot answers. Claude thinks it through first.")
                        : "Working on something tricky? ".concat(cmd, " gives better first answers")];
            });
        }); },
        cooldownSessions: 3,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            var persisted;
            var _a;
            return __generator(this, function (_b) {
                if (!(0, auth_js_1.is1PApiCustomer)())
                    return [2 /*return*/, false];
                if (!(0, effort_js_1.modelSupportsEffort)((0, model_js_1.getMainLoopModel)()))
                    return [2 /*return*/, false];
                if (((_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.effortLevel) !== undefined) {
                    return [2 /*return*/, false];
                }
                if ((0, effort_js_1.getEffortEnvOverride)() !== undefined)
                    return [2 /*return*/, false];
                persisted = (0, settings_js_1.getInitialSettings)().effortLevel;
                if (persisted === 'high' || persisted === 'max')
                    return [2 /*return*/, false];
                return [2 /*return*/, ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_tide_elm', 'off') !== 'off')];
            });
        }); },
    },
    {
        id: 'subagent-fanout-nudge',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var blue, variant;
            return __generator(this, function (_a) {
                blue = (0, color_js_1.color)('suggestion', ctx.theme);
                variant = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_tern_alloy', 'off');
                return [2 /*return*/, variant === 'copy_b'
                        ? "For big tasks, tell Claude to ".concat(blue('use subagents'), ". They work in parallel and keep your main thread clean.")
                        : "Say ".concat(blue('"fan out subagents"'), " and Claude sends a team. Each one digs deep so nothing gets missed.")];
            });
        }); },
        cooldownSessions: 3,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(0, auth_js_1.is1PApiCustomer)())
                    return [2 /*return*/, false];
                return [2 /*return*/, ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_tern_alloy', 'off') !== 'off')];
            });
        }); },
    },
    {
        id: 'loop-command-nudge',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var blue, variant;
            return __generator(this, function (_a) {
                blue = (0, color_js_1.color)('suggestion', ctx.theme);
                variant = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_timber_lark', 'off');
                return [2 /*return*/, variant === 'copy_b'
                        ? "Use ".concat(blue('/loop 5m check the deploy'), " to run any prompt on a schedule. Set it and forget it.")
                        : "".concat(blue('/loop'), " runs any prompt on a recurring schedule. Great for monitoring deploys, babysitting PRs, or polling status.")];
            });
        }); },
        cooldownSessions: 3,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(0, auth_js_1.is1PApiCustomer)())
                    return [2 /*return*/, false];
                if (!(0, prompt_js_1.isKairosCronEnabled)())
                    return [2 /*return*/, false];
                return [2 /*return*/, ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_timber_lark', 'off') !== 'off')];
            });
        }); },
    },
    {
        id: 'guest-passes',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var claude, reward;
            return __generator(this, function (_a) {
                claude = (0, color_js_1.color)('claude', ctx.theme);
                reward = (0, referral_js_1.getCachedReferrerReward)();
                return [2 /*return*/, reward
                        ? "Share Claude Code and earn ".concat(claude((0, referral_js_1.formatCreditAmount)(reward)), " of extra usage \u00B7 ").concat(claude('/passes'))
                        : "You have free guest passes to share \u00B7 ".concat(claude('/passes'))];
            });
        }); },
        cooldownSessions: 3,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, eligible;
            return __generator(this, function (_a) {
                config = (0, config_js_1.getGlobalConfig)();
                if (config.hasVisitedPasses) {
                    return [2 /*return*/, false];
                }
                eligible = (0, referral_js_1.checkCachedPassesEligibility)().eligible;
                return [2 /*return*/, eligible];
            });
        }); },
    },
    {
        id: 'overage-credit',
        content: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var claude, info, amount;
            return __generator(this, function (_a) {
                claude = (0, color_js_1.color)('claude', ctx.theme);
                info = (0, overageCreditGrant_js_1.getCachedOverageCreditGrant)();
                amount = info ? (0, overageCreditGrant_js_1.formatGrantAmount)(info) : null;
                if (!amount)
                    return [2 /*return*/, ''
                        // Copy from "OC & Bulk Overages copy" doc (#5 — CLI Rotating tip)
                    ];
                // Copy from "OC & Bulk Overages copy" doc (#5 — CLI Rotating tip)
                return [2 /*return*/, "".concat(claude("".concat(amount, " in extra usage, on us")), " \u00B7 third-party apps \u00B7 ").concat(claude('/extra-usage'))];
            });
        }); },
        cooldownSessions: 3,
        isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, (0, OverageCreditUpsell_js_1.shouldShowOverageCreditUpsell)()];
        }); }); },
    },
    {
        id: 'feedback-command',
        content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, 'Use /feedback to help us improve!'];
        }); }); },
        cooldownSessions: 15,
        isRelevant: function () {
            return __awaiter(this, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    if (process.env.USER_TYPE === 'ant') {
                        return [2 /*return*/, false];
                    }
                    config = (0, config_js_1.getGlobalConfig)();
                    return [2 /*return*/, config.numStartups > 5];
                });
            });
        },
    },
];
var internalOnlyTips = process.env.USER_TYPE === 'ant'
    ? [
        {
            id: 'important-claudemd',
            content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, '[ANT-ONLY] Use "IMPORTANT:" prefix for must-follow CLAUDE.md rules'];
            }); }); },
            cooldownSessions: 30,
            isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, true];
            }); }); },
        },
        {
            id: 'skillify',
            content: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, '[ANT-ONLY] Use /skillify at the end of a workflow to turn it into a reusable skill'];
            }); }); },
            cooldownSessions: 15,
            isRelevant: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, true];
            }); }); },
        },
    ]
    : [];
function getCustomTips() {
    var _this = this;
    var _a;
    var settings = (0, settings_js_1.getInitialSettings)();
    var override = settings.spinnerTipsOverride;
    if (!((_a = override === null || override === void 0 ? void 0 : override.tips) === null || _a === void 0 ? void 0 : _a.length))
        return [];
    return override.tips.map(function (content, i) { return ({
        id: "custom-tip-".concat(i),
        content: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, content];
        }); }); },
        cooldownSessions: 0,
        isRelevant: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
    }); });
}
function getRelevantTips(context) {
    return __awaiter(this, void 0, void 0, function () {
        var settings, override, customTips, tips, isRelevant, filtered;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    settings = (0, settings_js_1.getInitialSettings)();
                    override = settings.spinnerTipsOverride;
                    customTips = getCustomTips();
                    // If excludeDefault is true and there are custom tips, skip built-in tips entirely
                    if ((override === null || override === void 0 ? void 0 : override.excludeDefault) && customTips.length > 0) {
                        return [2 /*return*/, customTips];
                    }
                    tips = __spreadArray(__spreadArray([], externalTips, true), internalOnlyTips, true);
                    return [4 /*yield*/, Promise.all(tips.map(function (_) { return _.isRelevant(context); }))];
                case 1:
                    isRelevant = _a.sent();
                    filtered = tips
                        .filter(function (_, index) { return isRelevant[index]; })
                        .filter(function (_) { return (0, tipHistory_js_1.getSessionsSinceLastShown)(_.id) >= _.cooldownSessions; });
                    return [2 /*return*/, __spreadArray(__spreadArray([], filtered, true), customTips, true)];
            }
        });
    });
}
