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
exports.env = exports.detectDeploymentEnvironment = exports.JETBRAINS_IDES = exports.getGlobalClaudeFile = void 0;
exports.getHostPlatformForAnalytics = getHostPlatformForAnalytics;
var memoize_js_1 = require("lodash-es/memoize.js");
var os_1 = require("os");
var path_1 = require("path");
var oauth_js_1 = require("../constants/oauth.js");
var bundledMode_js_1 = require("./bundledMode.js");
var envUtils_js_1 = require("./envUtils.js");
var findExecutable_js_1 = require("./findExecutable.js");
var fsOperations_js_1 = require("./fsOperations.js");
var which_js_1 = require("./which.js");
// Config and data paths
exports.getGlobalClaudeFile = (0, memoize_js_1.default)(function () {
    // Legacy fallback for backwards compatibility
    if ((0, fsOperations_js_1.getFsImplementation)().existsSync((0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), '.config.json'))) {
        return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), '.config.json');
    }
    var filename = ".claude".concat((0, oauth_js_1.fileSuffixForOauthConfig)(), ".json");
    return (0, path_1.join)(process.env.CLAUDE_CONFIG_DIR || (0, os_1.homedir)(), filename);
});
var hasInternetAccess = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var axiosClient, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('axios'); })];
            case 1:
                axiosClient = (_b.sent()).default;
                return [4 /*yield*/, axiosClient.head('http://1.1.1.1', {
                        signal: AbortSignal.timeout(1000),
                    })];
            case 2:
                _b.sent();
                return [2 /*return*/, true];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); });
function isCommandAvailable(command) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, which_js_1.which)(command)];
                case 1: 
                // which does not execute the file.
                return [2 /*return*/, !!(_b.sent())];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var detectPackageManagers = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var packageManagers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                packageManagers = [];
                return [4 /*yield*/, isCommandAvailable('npm')];
            case 1:
                if (_a.sent())
                    packageManagers.push('npm');
                return [4 /*yield*/, isCommandAvailable('yarn')];
            case 2:
                if (_a.sent())
                    packageManagers.push('yarn');
                return [4 /*yield*/, isCommandAvailable('pnpm')];
            case 3:
                if (_a.sent())
                    packageManagers.push('pnpm');
                return [2 /*return*/, packageManagers];
        }
    });
}); });
var detectRuntimes = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var runtimes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                runtimes = [];
                return [4 /*yield*/, isCommandAvailable('bun')];
            case 1:
                if (_a.sent())
                    runtimes.push('bun');
                return [4 /*yield*/, isCommandAvailable('deno')];
            case 2:
                if (_a.sent())
                    runtimes.push('deno');
                return [4 /*yield*/, isCommandAvailable('node')];
            case 3:
                if (_a.sent())
                    runtimes.push('node');
                return [2 /*return*/, runtimes];
        }
    });
}); });
/**
 * Checks if we're running in a WSL environment
 * @returns true if running in WSL, false otherwise
 */
var isWslEnvironment = (0, memoize_js_1.default)(function () {
    try {
        // Check for WSLInterop file which is a reliable indicator of WSL
        return (0, fsOperations_js_1.getFsImplementation)().existsSync('/proc/sys/fs/binfmt_misc/WSLInterop');
    }
    catch (_error) {
        // If there's an error checking, assume not WSL
        return false;
    }
});
/**
 * Checks if the npm executable is located in the Windows filesystem within WSL
 * @returns true if npm is from Windows (starts with /mnt/c/), false otherwise
 */
var isNpmFromWindowsPath = (0, memoize_js_1.default)(function () {
    try {
        // Only relevant in WSL environment
        if (!isWslEnvironment()) {
            return false;
        }
        // Find the actual npm executable path
        var cmd = (0, findExecutable_js_1.findExecutable)('npm', []).cmd;
        // If npm is in Windows path, it will start with /mnt/c/
        return cmd.startsWith('/mnt/c/');
    }
    catch (_error) {
        // If there's an error, assume it's not from Windows
        return false;
    }
});
/**
 * Checks if we're running via Conductor
 * @returns true if running via Conductor, false otherwise
 */
function isConductor() {
    return process.env.__CFBundleIdentifier === 'com.conductor.app';
}
exports.JETBRAINS_IDES = [
    'pycharm',
    'intellij',
    'webstorm',
    'phpstorm',
    'rubymine',
    'clion',
    'goland',
    'rider',
    'datagrip',
    'appcode',
    'dataspell',
    'aqua',
    'gateway',
    'fleet',
    'jetbrains',
    'androidstudio',
];
// Detect terminal type with fallbacks for all platforms
function detectTerminal() {
    var _a, _b, _c, _d, _e;
    if (process.env.CURSOR_TRACE_ID)
        return 'cursor';
    // Cursor and Windsurf under WSL have TERM_PROGRAM=vscode
    if ((_a = process.env.VSCODE_GIT_ASKPASS_MAIN) === null || _a === void 0 ? void 0 : _a.includes('cursor')) {
        return 'cursor';
    }
    if ((_b = process.env.VSCODE_GIT_ASKPASS_MAIN) === null || _b === void 0 ? void 0 : _b.includes('windsurf')) {
        return 'windsurf';
    }
    if ((_c = process.env.VSCODE_GIT_ASKPASS_MAIN) === null || _c === void 0 ? void 0 : _c.includes('antigravity')) {
        return 'antigravity';
    }
    var bundleId = (_d = process.env.__CFBundleIdentifier) === null || _d === void 0 ? void 0 : _d.toLowerCase();
    if (bundleId === null || bundleId === void 0 ? void 0 : bundleId.includes('vscodium'))
        return 'codium';
    if (bundleId === null || bundleId === void 0 ? void 0 : bundleId.includes('windsurf'))
        return 'windsurf';
    if (bundleId === null || bundleId === void 0 ? void 0 : bundleId.includes('com.google.android.studio'))
        return 'androidstudio';
    // Check for JetBrains IDEs in bundle ID
    if (bundleId) {
        for (var _i = 0, JETBRAINS_IDES_1 = exports.JETBRAINS_IDES; _i < JETBRAINS_IDES_1.length; _i++) {
            var ide = JETBRAINS_IDES_1[_i];
            if (bundleId.includes(ide))
                return ide;
        }
    }
    if (process.env.VisualStudioVersion) {
        // This is desktop Visual Studio, not VS Code
        return 'visualstudio';
    }
    // Check for JetBrains terminal on Linux/Windows
    if (process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm') {
        // For macOS, bundle ID detection above already handles JetBrains IDEs
        if (process.platform === 'darwin')
            return 'pycharm';
        // For finegrained detection on Linux/Windows use envDynamic.getTerminalWithJetBrainsDetection()
        return 'pycharm';
    }
    // Check for specific terminals by TERM before TERM_PROGRAM
    // This handles cases where TERM and TERM_PROGRAM might be inconsistent
    if (process.env.TERM === 'xterm-ghostty') {
        return 'ghostty';
    }
    if ((_e = process.env.TERM) === null || _e === void 0 ? void 0 : _e.includes('kitty')) {
        return 'kitty';
    }
    if (process.env.TERM_PROGRAM) {
        return process.env.TERM_PROGRAM;
    }
    if (process.env.TMUX)
        return 'tmux';
    if (process.env.STY)
        return 'screen';
    // Check for terminal-specific environment variables (common on Linux)
    if (process.env.KONSOLE_VERSION)
        return 'konsole';
    if (process.env.GNOME_TERMINAL_SERVICE)
        return 'gnome-terminal';
    if (process.env.XTERM_VERSION)
        return 'xterm';
    if (process.env.VTE_VERSION)
        return 'vte-based';
    if (process.env.TERMINATOR_UUID)
        return 'terminator';
    if (process.env.KITTY_WINDOW_ID) {
        return 'kitty';
    }
    if (process.env.ALACRITTY_LOG)
        return 'alacritty';
    if (process.env.TILIX_ID)
        return 'tilix';
    // Windows-specific detection
    if (process.env.WT_SESSION)
        return 'windows-terminal';
    if (process.env.SESSIONNAME && process.env.TERM === 'cygwin')
        return 'cygwin';
    if (process.env.MSYSTEM)
        return process.env.MSYSTEM.toLowerCase(); // MINGW64, MSYS2, etc.
    if (process.env.ConEmuANSI ||
        process.env.ConEmuPID ||
        process.env.ConEmuTask) {
        return 'conemu';
    }
    // WSL detection
    if (process.env.WSL_DISTRO_NAME)
        return "wsl-".concat(process.env.WSL_DISTRO_NAME);
    // SSH session detection
    if (isSSHSession()) {
        return 'ssh-session';
    }
    // Fall back to TERM which is more universally available
    // Special case for common terminal identifiers in TERM
    if (process.env.TERM) {
        var term = process.env.TERM;
        if (term.includes('alacritty'))
            return 'alacritty';
        if (term.includes('rxvt'))
            return 'rxvt';
        if (term.includes('termite'))
            return 'termite';
        return process.env.TERM;
    }
    // Detect non-interactive environment
    if (!process.stdout.isTTY)
        return 'non-interactive';
    return null;
}
/**
 * Detects the deployment environment/platform based on environment variables
 * @returns The deployment platform name, or 'unknown' if not detected
 */
exports.detectDeploymentEnvironment = (0, memoize_js_1.default)(function () {
    var _a;
    // Cloud development environments
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CODESPACES))
        return 'codespaces';
    if (process.env.GITPOD_WORKSPACE_ID)
        return 'gitpod';
    if (process.env.REPL_ID || process.env.REPL_SLUG)
        return 'replit';
    if (process.env.PROJECT_DOMAIN)
        return 'glitch';
    // Cloud platforms
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.VERCEL))
        return 'vercel';
    if (process.env.RAILWAY_ENVIRONMENT_NAME ||
        process.env.RAILWAY_SERVICE_NAME) {
        return 'railway';
    }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.RENDER))
        return 'render';
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.NETLIFY))
        return 'netlify';
    if (process.env.DYNO)
        return 'heroku';
    if (process.env.FLY_APP_NAME || process.env.FLY_MACHINE_ID)
        return 'fly.io';
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CF_PAGES))
        return 'cloudflare-pages';
    if (process.env.DENO_DEPLOYMENT_ID)
        return 'deno-deploy';
    if (process.env.AWS_LAMBDA_FUNCTION_NAME)
        return 'aws-lambda';
    if (process.env.AWS_EXECUTION_ENV === 'AWS_ECS_FARGATE')
        return 'aws-fargate';
    if (process.env.AWS_EXECUTION_ENV === 'AWS_ECS_EC2')
        return 'aws-ecs';
    // Check for EC2 via hypervisor UUID
    try {
        var uuid = (0, fsOperations_js_1.getFsImplementation)()
            .readFileSync('/sys/hypervisor/uuid', { encoding: 'utf8' })
            .trim()
            .toLowerCase();
        if (uuid.startsWith('ec2'))
            return 'aws-ec2';
    }
    catch (_b) {
        // Ignore errors reading hypervisor UUID (ENOENT on non-EC2, etc.)
    }
    if (process.env.K_SERVICE)
        return 'gcp-cloud-run';
    if (process.env.GOOGLE_CLOUD_PROJECT)
        return 'gcp';
    if (process.env.WEBSITE_SITE_NAME || process.env.WEBSITE_SKU)
        return 'azure-app-service';
    if (process.env.AZURE_FUNCTIONS_ENVIRONMENT)
        return 'azure-functions';
    if ((_a = process.env.APP_URL) === null || _a === void 0 ? void 0 : _a.includes('ondigitalocean.app')) {
        return 'digitalocean-app-platform';
    }
    if (process.env.SPACE_CREATOR_USER_ID)
        return 'huggingface-spaces';
    // CI/CD platforms
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.GITHUB_ACTIONS))
        return 'github-actions';
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.GITLAB_CI))
        return 'gitlab-ci';
    if (process.env.CIRCLECI)
        return 'circleci';
    if (process.env.BUILDKITE)
        return 'buildkite';
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CI))
        return 'ci';
    // Container orchestration
    if (process.env.KUBERNETES_SERVICE_HOST)
        return 'kubernetes';
    try {
        if ((0, fsOperations_js_1.getFsImplementation)().existsSync('/.dockerenv'))
            return 'docker';
    }
    catch (_c) {
        // Ignore errors checking for Docker
    }
    // Platform-specific fallback for undetected environments
    if (exports.env.platform === 'darwin')
        return 'unknown-darwin';
    if (exports.env.platform === 'linux')
        return 'unknown-linux';
    if (exports.env.platform === 'win32')
        return 'unknown-win32';
    return 'unknown';
});
// all of these should be immutable
function isSSHSession() {
    return !!(process.env.SSH_CONNECTION ||
        process.env.SSH_CLIENT ||
        process.env.SSH_TTY);
}
exports.env = {
    hasInternetAccess: hasInternetAccess,
    isCI: (0, envUtils_js_1.isEnvTruthy)(process.env.CI),
    platform: (['win32', 'darwin'].includes(process.platform)
        ? process.platform
        : 'linux'),
    arch: process.arch,
    nodeVersion: process.version,
    terminal: detectTerminal(),
    isSSH: isSSHSession,
    getPackageManagers: detectPackageManagers,
    getRuntimes: detectRuntimes,
    isRunningWithBun: (0, memoize_js_1.default)(bundledMode_js_1.isRunningWithBun),
    isWslEnvironment: isWslEnvironment,
    isNpmFromWindowsPath: isNpmFromWindowsPath,
    isConductor: isConductor,
    detectDeploymentEnvironment: exports.detectDeploymentEnvironment,
};
/**
 * Returns the host platform for analytics reporting.
 * If CLAUDE_CODE_HOST_PLATFORM is set to a valid platform value, that overrides
 * the detected platform. This is useful for container/remote environments where
 * process.platform reports the container OS but the actual host platform differs.
 */
function getHostPlatformForAnalytics() {
    var override = process.env.CLAUDE_CODE_HOST_PLATFORM;
    if (override === 'win32' || override === 'darwin' || override === 'linux') {
        return override;
    }
    return exports.env.platform;
}
