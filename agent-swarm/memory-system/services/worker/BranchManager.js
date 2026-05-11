"use strict";
/**
 * BranchManager: Git branch detection and switching for beta feature toggle
 *
 * Enables users to switch between stable (main) and beta branches via the UI.
 * The installed plugin at ~/.claude/plugins/marketplaces/thedotmack/ is a git repo.
 */
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
exports.getBranchInfo = getBranchInfo;
exports.switchBranch = switchBranch;
exports.pullUpdates = pullUpdates;
exports.getInstalledPluginPath = getInstalledPluginPath;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var logger_js_1 = require("../../utils/logger.js");
var paths_js_1 = require("../../shared/paths.js");
// Alias for code clarity - this is the installed plugin path
var INSTALLED_PLUGIN_PATH = paths_js_1.MARKETPLACE_ROOT;
/**
 * Validate branch name to prevent command injection
 * Only allows alphanumeric, hyphens, underscores, forward slashes, and dots
 */
function isValidBranchName(branchName) {
    if (!branchName || typeof branchName !== 'string') {
        return false;
    }
    // Git branch name validation: alphanumeric, hyphen, underscore, slash, dot
    // Must not start with dot, hyphen, or slash
    // Must not contain double dots (..)
    var validBranchRegex = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;
    return validBranchRegex.test(branchName) && !branchName.includes('..');
}
// Timeout constants (increased for slow systems)
var GIT_COMMAND_TIMEOUT_MS = 300000;
var NPM_INSTALL_TIMEOUT_MS = 600000;
var DEFAULT_SHELL_TIMEOUT_MS = 60000;
/**
 * Execute git command in installed plugin directory using safe array-based arguments
 * SECURITY: Uses spawnSync with argument array to prevent command injection
 */
function execGit(args) {
    var result = (0, child_process_1.spawnSync)('git', args, {
        cwd: INSTALLED_PLUGIN_PATH,
        encoding: 'utf-8',
        timeout: GIT_COMMAND_TIMEOUT_MS,
        windowsHide: true,
        shell: false // CRITICAL: Never use shell with user input
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || 'Git command failed');
    }
    return result.stdout.trim();
}
/**
 * Execute npm command in installed plugin directory using safe array-based arguments
 * SECURITY: Uses spawnSync with argument array to prevent command injection
 */
function execNpm(args, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = NPM_INSTALL_TIMEOUT_MS; }
    var isWindows = process.platform === 'win32';
    var npmCmd = isWindows ? 'npm.cmd' : 'npm';
    var result = (0, child_process_1.spawnSync)(npmCmd, args, {
        cwd: INSTALLED_PLUGIN_PATH,
        encoding: 'utf-8',
        timeout: timeoutMs,
        windowsHide: true,
        shell: false // CRITICAL: Never use shell with user input
    });
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || 'npm command failed');
    }
    return result.stdout.trim();
}
/**
 * Get current branch information
 */
function getBranchInfo() {
    // Check if git repo exists
    var gitDir = (0, path_1.join)(INSTALLED_PLUGIN_PATH, '.git');
    if (!(0, fs_1.existsSync)(gitDir)) {
        return {
            branch: null,
            isBeta: false,
            isGitRepo: false,
            isDirty: false,
            canSwitch: false,
            error: 'Installed plugin is not a git repository'
        };
    }
    try {
        // Get current branch
        var branch = execGit(['rev-parse', '--abbrev-ref', 'HEAD']);
        // Check if dirty (has uncommitted changes)
        var status_1 = execGit(['status', '--porcelain']);
        var isDirty = status_1.length > 0;
        // Determine if on beta branch
        var isBeta = branch.startsWith('beta');
        return {
            branch: branch,
            isBeta: isBeta,
            isGitRepo: true,
            isDirty: isDirty,
            canSwitch: true // We can always switch (will discard local changes)
        };
    }
    catch (error) {
        logger_js_1.logger.error('BRANCH', 'Failed to get branch info', {}, error);
        return {
            branch: null,
            isBeta: false,
            isGitRepo: true,
            isDirty: false,
            canSwitch: false,
            error: error.message
        };
    }
}
/**
 * Switch to a different branch
 *
 * Steps:
 * 1. Discard local changes (from rsync syncs)
 * 2. Fetch latest from origin
 * 3. Checkout target branch
 * 4. Pull latest
 * 5. Clear install marker and run npm install
 * 6. Restart worker (handled by caller after response)
 */
function switchBranch(targetBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var info, installMarker;
        return __generator(this, function (_a) {
            // SECURITY: Validate branch name to prevent command injection
            if (!isValidBranchName(targetBranch)) {
                return [2 /*return*/, {
                        success: false,
                        error: "Invalid branch name: ".concat(targetBranch, ". Branch names must be alphanumeric with hyphens, underscores, slashes, or dots.")
                    }];
            }
            info = getBranchInfo();
            if (!info.isGitRepo) {
                return [2 /*return*/, {
                        success: false,
                        error: 'Installed plugin is not a git repository. Please reinstall.'
                    }];
            }
            if (info.branch === targetBranch) {
                return [2 /*return*/, {
                        success: true,
                        branch: targetBranch,
                        message: "Already on branch ".concat(targetBranch)
                    }];
            }
            try {
                logger_js_1.logger.info('BRANCH', 'Starting branch switch', {
                    from: info.branch,
                    to: targetBranch
                });
                // 1. Discard local changes (safe - user data is at ~/.claude-mem/)
                logger_js_1.logger.debug('BRANCH', 'Discarding local changes');
                execGit(['checkout', '--', '.']);
                execGit(['clean', '-fd']); // Remove untracked files too
                // 2. Fetch latest
                logger_js_1.logger.debug('BRANCH', 'Fetching from origin');
                execGit(['fetch', 'origin']);
                // 3. Checkout target branch
                logger_js_1.logger.debug('BRANCH', 'Checking out branch', { branch: targetBranch });
                try {
                    execGit(['checkout', targetBranch]);
                }
                catch (error) {
                    // Branch might not exist locally, try tracking remote
                    logger_js_1.logger.debug('BRANCH', 'Branch not local, tracking remote', { branch: targetBranch, error: error instanceof Error ? error.message : String(error) });
                    execGit(['checkout', '-b', targetBranch, "origin/".concat(targetBranch)]);
                }
                // 4. Pull latest
                logger_js_1.logger.debug('BRANCH', 'Pulling latest');
                execGit(['pull', 'origin', targetBranch]);
                installMarker = (0, path_1.join)(INSTALLED_PLUGIN_PATH, '.install-version');
                if ((0, fs_1.existsSync)(installMarker)) {
                    (0, fs_1.unlinkSync)(installMarker);
                }
                logger_js_1.logger.debug('BRANCH', 'Running npm install');
                execNpm(['install'], NPM_INSTALL_TIMEOUT_MS);
                logger_js_1.logger.success('BRANCH', 'Branch switch complete', {
                    branch: targetBranch
                });
                return [2 /*return*/, {
                        success: true,
                        branch: targetBranch,
                        message: "Switched to ".concat(targetBranch, ". Worker will restart automatically.")
                    }];
            }
            catch (error) {
                logger_js_1.logger.error('BRANCH', 'Branch switch failed', { targetBranch: targetBranch }, error);
                // Try to recover by checking out original branch
                try {
                    if (info.branch && isValidBranchName(info.branch)) {
                        execGit(['checkout', info.branch]);
                    }
                }
                catch (recoveryError) {
                    // [POSSIBLY RELEVANT]: Recovery checkout failed, user needs manual intervention - already logging main error above
                    logger_js_1.logger.error('BRANCH', 'Recovery checkout also failed', { originalBranch: info.branch }, recoveryError);
                }
                return [2 /*return*/, {
                        success: false,
                        error: "Branch switch failed: ".concat(error.message)
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Pull latest updates for current branch
 */
function pullUpdates() {
    return __awaiter(this, void 0, void 0, function () {
        var info, installMarker;
        return __generator(this, function (_a) {
            info = getBranchInfo();
            if (!info.isGitRepo || !info.branch) {
                return [2 /*return*/, {
                        success: false,
                        error: 'Cannot pull updates: not a git repository'
                    }];
            }
            try {
                // SECURITY: Validate branch name before use
                if (!isValidBranchName(info.branch)) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Invalid current branch name: ".concat(info.branch)
                        }];
                }
                logger_js_1.logger.info('BRANCH', 'Pulling updates', { branch: info.branch });
                // Discard local changes first
                execGit(['checkout', '--', '.']);
                // Fetch and pull
                execGit(['fetch', 'origin']);
                execGit(['pull', 'origin', info.branch]);
                installMarker = (0, path_1.join)(INSTALLED_PLUGIN_PATH, '.install-version');
                if ((0, fs_1.existsSync)(installMarker)) {
                    (0, fs_1.unlinkSync)(installMarker);
                }
                execNpm(['install'], NPM_INSTALL_TIMEOUT_MS);
                logger_js_1.logger.success('BRANCH', 'Updates pulled', { branch: info.branch });
                return [2 /*return*/, {
                        success: true,
                        branch: info.branch,
                        message: "Updated ".concat(info.branch, ". Worker will restart automatically.")
                    }];
            }
            catch (error) {
                logger_js_1.logger.error('BRANCH', 'Pull failed', {}, error);
                return [2 /*return*/, {
                        success: false,
                        error: "Pull failed: ".concat(error.message)
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Get installed plugin path (for external use)
 */
function getInstalledPluginPath() {
    return INSTALLED_PLUGIN_PATH;
}
