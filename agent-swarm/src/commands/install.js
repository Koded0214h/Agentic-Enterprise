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
exports.install = void 0;
var compiler_runtime_1 = require("react/compiler-runtime");
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var StatusIcon_js_1 = require("../components/design-system/StatusIcon.js");
var ink_js_1 = require("../ink.js");
var debug_js_1 = require("../utils/debug.js");
var env_js_1 = require("../utils/env.js");
var errors_js_1 = require("../utils/errors.js");
var index_js_2 = require("../utils/nativeInstaller/index.js");
var settings_js_1 = require("../utils/settings/settings.js");
function getInstallationPath() {
    var isWindows = env_js_1.env.platform === 'win32';
    var homeDir = (0, node_os_1.homedir)();
    if (isWindows) {
        // Convert to Windows-style path
        var windowsPath = (0, node_path_1.join)(homeDir, '.local', 'bin', 'claude.exe');
        // Replace forward slashes with backslashes for Windows display
        return windowsPath.replace(/\//g, '\\');
    }
    return '~/.local/bin/claude';
}
function SetupNotes(t0) {
    var $ = (0, compiler_runtime_1.c)(5);
    var messages = t0.messages;
    if (messages.length === 0) {
        return null;
    }
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = <ink_js_1.Box><ink_js_1.Text color="warning"><StatusIcon_js_1.StatusIcon status="warning" withSpace={true}/>Setup notes:</ink_js_1.Text></ink_js_1.Box>;
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var t2;
    if ($[1] !== messages) {
        t2 = messages.map(_temp);
        $[1] = messages;
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var t3;
    if ($[3] !== t2) {
        t3 = <ink_js_1.Box flexDirection="column" gap={0} marginBottom={1}>{t1}{t2}</ink_js_1.Box>;
        $[3] = t2;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    return t3;
}
function _temp(message, index) {
    return <ink_js_1.Box key={index} marginLeft={2}><ink_js_1.Text dimColor={true}>• {message}</ink_js_1.Text></ink_js_1.Box>;
}
function Install(_a) {
    var onDone = _a.onDone, force = _a.force, target = _a.target;
    var _b = (0, react_1.useState)({
        type: 'checking'
    }), state = _b[0], setState = _b[1];
    (0, react_1.useEffect)(function () {
        function run() {
            return __awaiter(this, void 0, void 0, function () {
                var channelOrVersion, result, setupMessages, _a, removed, errors, warnings, aliasMessages, allWarnings, error_1;
                var _b;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 5, , 6]);
                            (0, debug_js_1.logForDebugging)("Install: Starting installation process (force=".concat(force, ", target=").concat(target, ")"));
                            channelOrVersion = target || ((_b = (0, settings_js_1.getInitialSettings)()) === null || _b === void 0 ? void 0 : _b.autoUpdatesChannel) || 'latest';
                            setState({
                                type: 'installing',
                                version: channelOrVersion
                            });
                            // Pass force flag to trigger reinstall even if up to date
                            (0, debug_js_1.logForDebugging)("Install: Calling installLatest(channelOrVersion=".concat(channelOrVersion, ", forceReinstall=").concat(force, ")"));
                            return [4 /*yield*/, (0, index_js_2.installLatest)(channelOrVersion, force)];
                        case 1:
                            result = _d.sent();
                            (0, debug_js_1.logForDebugging)("Install: installLatest returned version=".concat(result.latestVersion, ", wasUpdated=").concat(result.wasUpdated, ", lockFailed=").concat(result.lockFailed));
                            // Check specifically for lock failure
                            if (result.lockFailed) {
                                throw new Error('Could not install - another process is currently installing Claude. Please try again in a moment.');
                            }
                            // If we couldn't get the version, there might be an issue
                            if (!result.latestVersion) {
                                (0, debug_js_1.logForDebugging)('Install: Failed to retrieve version information during install', {
                                    level: 'error'
                                });
                            }
                            if (!result.wasUpdated) {
                                (0, debug_js_1.logForDebugging)('Install: Already up to date');
                            }
                            // Set up launcher and shell integration
                            setState({
                                type: 'setting-up'
                            });
                            return [4 /*yield*/, (0, index_js_2.checkInstall)(true)];
                        case 2:
                            setupMessages = _d.sent();
                            (0, debug_js_1.logForDebugging)("Install: Setup launcher completed with ".concat(setupMessages.length, " messages"));
                            if (setupMessages.length > 0) {
                                setupMessages.forEach(function (msg) { return (0, debug_js_1.logForDebugging)("Install: Setup message: ".concat(msg.message)); });
                            }
                            // Now that native installation succeeded, clean up old npm installations
                            (0, debug_js_1.logForDebugging)('Install: Cleaning up npm installations after successful install');
                            return [4 /*yield*/, (0, index_js_2.cleanupNpmInstallations)()];
                        case 3:
                            _a = _d.sent(), removed = _a.removed, errors = _a.errors, warnings = _a.warnings;
                            if (removed > 0) {
                                (0, debug_js_1.logForDebugging)("Cleaned up ".concat(removed, " npm installation(s)"));
                            }
                            if (errors.length > 0) {
                                (0, debug_js_1.logForDebugging)("Cleanup errors: ".concat(errors.join(', ')));
                                // Continue despite cleanup errors - native install already succeeded
                            }
                            return [4 /*yield*/, (0, index_js_2.cleanupShellAliases)()];
                        case 4:
                            aliasMessages = _d.sent();
                            if (aliasMessages.length > 0) {
                                (0, debug_js_1.logForDebugging)("Shell alias cleanup: ".concat(aliasMessages.map(function (m) { return m.message; }).join('; ')));
                            }
                            // Log success event
                            (0, index_js_1.logEvent)('tengu_claude_install_command', {
                                has_version: result.latestVersion ? 1 : 0,
                                forced: force ? 1 : 0
                            });
                            // If user explicitly specified a channel, save it to settings
                            if (target === 'latest' || target === 'stable') {
                                (0, settings_js_1.updateSettingsForSource)('userSettings', {
                                    autoUpdatesChannel: target
                                });
                                (0, debug_js_1.logForDebugging)("Install: Saved autoUpdatesChannel=".concat(target, " to user settings"));
                            }
                            allWarnings = __spreadArray(__spreadArray([], warnings, true), aliasMessages.map(function (m_0) { return m_0.message; }), true);
                            // Check if there were any setup errors or notes
                            if (setupMessages.length > 0) {
                                setState({
                                    type: 'set-up',
                                    messages: setupMessages.map(function (m_1) { return m_1.message; })
                                });
                                // Still mark as success but show both setup messages and cleanup warnings
                                setTimeout(setState, 2000, {
                                    type: 'success',
                                    version: result.latestVersion || 'current',
                                    setupMessages: __spreadArray(__spreadArray([], setupMessages.map(function (m_2) { return m_2.message; }), true), allWarnings, true)
                                });
                            }
                            else {
                                // No setup messages, go straight to success (but still show cleanup warnings if any)
                                (0, debug_js_1.logForDebugging)('Install: Shell PATH already configured');
                                setState({
                                    type: 'success',
                                    version: result.latestVersion || 'current',
                                    setupMessages: allWarnings.length > 0 ? allWarnings : undefined
                                });
                            }
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _d.sent();
                            (0, debug_js_1.logForDebugging)("Install command failed: ".concat(error_1), {
                                level: 'error'
                            });
                            setState({
                                type: 'error',
                                message: (0, errors_js_1.errorMessage)(error_1)
                            });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }
        void run();
    }, [force, target]);
    (0, react_1.useEffect)(function () {
        if (state.type === 'success') {
            // Give success message time to render before exiting
            setTimeout(onDone, 2000, 'Claude Code installation completed successfully', {
                display: 'system'
            });
        }
        else if (state.type === 'error') {
            // Give error message time to render before exiting
            setTimeout(onDone, 3000, 'Claude Code installation failed', {
                display: 'system'
            });
        }
    }, [state, onDone]);
    return <ink_js_1.Box flexDirection="column" marginTop={1}>
      {state.type === 'checking' && <ink_js_1.Text color="claude">Checking installation status...</ink_js_1.Text>}

      {state.type === 'cleaning-npm' && <ink_js_1.Text color="warning">Cleaning up old npm installations...</ink_js_1.Text>}

      {state.type === 'installing' && <ink_js_1.Text color="claude">
          Installing Claude Code native build {state.version}...
        </ink_js_1.Text>}

      {state.type === 'setting-up' && <ink_js_1.Text color="claude">Setting up launcher and shell integration...</ink_js_1.Text>}

      {state.type === 'set-up' && <SetupNotes messages={state.messages}/>}

      {state.type === 'success' && <ink_js_1.Box flexDirection="column" gap={1}>
          <ink_js_1.Box>
            <StatusIcon_js_1.StatusIcon status="success" withSpace/>
            <ink_js_1.Text color="success" bold>
              Claude Code successfully installed!
            </ink_js_1.Text>
          </ink_js_1.Box>
          <ink_js_1.Box marginLeft={2} flexDirection="column" gap={1}>
            {state.version !== 'current' && <ink_js_1.Box>
                <ink_js_1.Text dimColor>Version: </ink_js_1.Text>
                <ink_js_1.Text color="claude">{state.version}</ink_js_1.Text>
              </ink_js_1.Box>}
            <ink_js_1.Box>
              <ink_js_1.Text dimColor>Location: </ink_js_1.Text>
              <ink_js_1.Text color="text">{getInstallationPath()}</ink_js_1.Text>
            </ink_js_1.Box>
          </ink_js_1.Box>
          <ink_js_1.Box marginLeft={2} flexDirection="column" gap={1}>
            <ink_js_1.Box marginTop={1}>
              <ink_js_1.Text dimColor>Next: Run </ink_js_1.Text>
              <ink_js_1.Text color="claude" bold>
                claude --help
              </ink_js_1.Text>
              <ink_js_1.Text dimColor> to get started</ink_js_1.Text>
            </ink_js_1.Box>
          </ink_js_1.Box>
          {state.setupMessages && <SetupNotes messages={state.setupMessages}/>}
        </ink_js_1.Box>}

      {state.type === 'error' && <ink_js_1.Box flexDirection="column" gap={1}>
          <ink_js_1.Box>
            <StatusIcon_js_1.StatusIcon status="error" withSpace/>
            <ink_js_1.Text color="error">Installation failed</ink_js_1.Text>
          </ink_js_1.Box>
          <ink_js_1.Text color="error">{state.message}</ink_js_1.Text>
          <ink_js_1.Box marginTop={1}>
            <ink_js_1.Text dimColor>Try running with --force to override checks</ink_js_1.Text>
          </ink_js_1.Box>
        </ink_js_1.Box>}
    </ink_js_1.Box>;
}
// This is only used from cli.tsx, not as a slash command
exports.install = {
    type: 'local-jsx',
    name: 'install',
    description: 'Install Claude Code native build',
    argumentHint: '[options]',
    call: function (onDone, _context, args) {
        return __awaiter(this, void 0, void 0, function () {
            var force, nonFlagArgs, target, unmount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        force = args.includes('--force');
                        nonFlagArgs = args.filter(function (arg) { return !arg.startsWith('--'); });
                        target = nonFlagArgs[0];
                        return [4 /*yield*/, (0, ink_js_1.render)(<Install onDone={function (result, options) {
                                    unmount();
                                    onDone(result, options);
                                }} force={force} target={target}/>)];
                    case 1:
                        unmount = (_a.sent()).unmount;
                        return [2 /*return*/];
                }
            });
        });
    }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJob21lZGlyIiwiam9pbiIsIlJlYWN0IiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJDb21tYW5kUmVzdWx0RGlzcGxheSIsImxvZ0V2ZW50IiwiU3RhdHVzSWNvbiIsIkJveCIsInJlbmRlciIsIlRleHQiLCJsb2dGb3JEZWJ1Z2dpbmciLCJlbnYiLCJlcnJvck1lc3NhZ2UiLCJjaGVja0luc3RhbGwiLCJjbGVhbnVwTnBtSW5zdGFsbGF0aW9ucyIsImNsZWFudXBTaGVsbEFsaWFzZXMiLCJpbnN0YWxsTGF0ZXN0IiwiZ2V0SW5pdGlhbFNldHRpbmdzIiwidXBkYXRlU2V0dGluZ3NGb3JTb3VyY2UiLCJJbnN0YWxsUHJvcHMiLCJvbkRvbmUiLCJyZXN1bHQiLCJvcHRpb25zIiwiZGlzcGxheSIsImZvcmNlIiwidGFyZ2V0IiwiSW5zdGFsbFN0YXRlIiwidHlwZSIsInZlcnNpb24iLCJtZXNzYWdlcyIsInNldHVwTWVzc2FnZXMiLCJtZXNzYWdlIiwid2FybmluZ3MiLCJnZXRJbnN0YWxsYXRpb25QYXRoIiwiaXNXaW5kb3dzIiwicGxhdGZvcm0iLCJob21lRGlyIiwid2luZG93c1BhdGgiLCJyZXBsYWNlIiwiU2V0dXBOb3RlcyIsInQwIiwiJCIsIl9jIiwibGVuZ3RoIiwidDEiLCJTeW1ib2wiLCJmb3IiLCJ0MiIsIm1hcCIsIl90ZW1wIiwidDMiLCJpbmRleCIsIkluc3RhbGwiLCJSZWFjdE5vZGUiLCJzdGF0ZSIsInNldFN0YXRlIiwicnVuIiwiY2hhbm5lbE9yVmVyc2lvbiIsImF1dG9VcGRhdGVzQ2hhbm5lbCIsImxhdGVzdFZlcnNpb24iLCJ3YXNVcGRhdGVkIiwibG9ja0ZhaWxlZCIsIkVycm9yIiwibGV2ZWwiLCJmb3JFYWNoIiwibXNnIiwicmVtb3ZlZCIsImVycm9ycyIsImFsaWFzTWVzc2FnZXMiLCJtIiwiaGFzX3ZlcnNpb24iLCJmb3JjZWQiLCJhbGxXYXJuaW5ncyIsInNldFRpbWVvdXQiLCJjb25zdCIsInVuZGVmaW5lZCIsImVycm9yIiwiaW5zdGFsbCIsIm5hbWUiLCJkZXNjcmlwdGlvbiIsImFyZ3VtZW50SGludCIsImNhbGwiLCJfY29udGV4dCIsImFyZ3MiLCJpbmNsdWRlcyIsIm5vbkZsYWdBcmdzIiwiZmlsdGVyIiwiYXJnIiwic3RhcnRzV2l0aCIsInVubW91bnQiXSwic291cmNlcyI6WyJpbnN0YWxsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBob21lZGlyIH0gZnJvbSAnbm9kZTpvcydcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDb21tYW5kUmVzdWx0RGlzcGxheSB9IGZyb20gJ3NyYy9jb21tYW5kcy5qcydcbmltcG9ydCB7IGxvZ0V2ZW50IH0gZnJvbSAnc3JjL3NlcnZpY2VzL2FuYWx5dGljcy9pbmRleC5qcydcbmltcG9ydCB7IFN0YXR1c0ljb24gfSBmcm9tICcuLi9jb21wb25lbnRzL2Rlc2lnbi1zeXN0ZW0vU3RhdHVzSWNvbi5qcydcbmltcG9ydCB7IEJveCwgcmVuZGVyLCBUZXh0IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHsgbG9nRm9yRGVidWdnaW5nIH0gZnJvbSAnLi4vdXRpbHMvZGVidWcuanMnXG5pbXBvcnQgeyBlbnYgfSBmcm9tICcuLi91dGlscy9lbnYuanMnXG5pbXBvcnQgeyBlcnJvck1lc3NhZ2UgfSBmcm9tICcuLi91dGlscy9lcnJvcnMuanMnXG5pbXBvcnQge1xuICBjaGVja0luc3RhbGwsXG4gIGNsZWFudXBOcG1JbnN0YWxsYXRpb25zLFxuICBjbGVhbnVwU2hlbGxBbGlhc2VzLFxuICBpbnN0YWxsTGF0ZXN0LFxufSBmcm9tICcuLi91dGlscy9uYXRpdmVJbnN0YWxsZXIvaW5kZXguanMnXG5pbXBvcnQge1xuICBnZXRJbml0aWFsU2V0dGluZ3MsXG4gIHVwZGF0ZVNldHRpbmdzRm9yU291cmNlLFxufSBmcm9tICcuLi91dGlscy9zZXR0aW5ncy9zZXR0aW5ncy5qcydcblxuaW50ZXJmYWNlIEluc3RhbGxQcm9wcyB7XG4gIG9uRG9uZTogKHJlc3VsdDogc3RyaW5nLCBvcHRpb25zPzogeyBkaXNwbGF5PzogQ29tbWFuZFJlc3VsdERpc3BsYXkgfSkgPT4gdm9pZFxuICBmb3JjZT86IGJvb2xlYW5cbiAgdGFyZ2V0Pzogc3RyaW5nIC8vICdsYXRlc3QnLCAnc3RhYmxlJywgb3IgdmVyc2lvbiBsaWtlICcxLjAuMzQnXG59XG5cbnR5cGUgSW5zdGFsbFN0YXRlID1cbiAgfCB7IHR5cGU6ICdjaGVja2luZycgfVxuICB8IHsgdHlwZTogJ2NsZWFuaW5nLW5wbScgfVxuICB8IHsgdHlwZTogJ2luc3RhbGxpbmcnOyB2ZXJzaW9uOiBzdHJpbmcgfVxuICB8IHsgdHlwZTogJ3NldHRpbmctdXAnIH1cbiAgfCB7IHR5cGU6ICdzZXQtdXAnOyBtZXNzYWdlczogc3RyaW5nW10gfVxuICB8IHsgdHlwZTogJ3N1Y2Nlc3MnOyB2ZXJzaW9uOiBzdHJpbmc7IHNldHVwTWVzc2FnZXM/OiBzdHJpbmdbXSB9XG4gIHwgeyB0eXBlOiAnZXJyb3InOyBtZXNzYWdlOiBzdHJpbmc7IHdhcm5pbmdzPzogc3RyaW5nW10gfVxuXG5mdW5jdGlvbiBnZXRJbnN0YWxsYXRpb25QYXRoKCk6IHN0cmluZyB7XG4gIGNvbnN0IGlzV2luZG93cyA9IGVudi5wbGF0Zm9ybSA9PT0gJ3dpbjMyJ1xuICBjb25zdCBob21lRGlyID0gaG9tZWRpcigpXG5cbiAgaWYgKGlzV2luZG93cykge1xuICAgIC8vIENvbnZlcnQgdG8gV2luZG93cy1zdHlsZSBwYXRoXG4gICAgY29uc3Qgd2luZG93c1BhdGggPSBqb2luKGhvbWVEaXIsICcubG9jYWwnLCAnYmluJywgJ2NsYXVkZS5leGUnKVxuICAgIC8vIFJlcGxhY2UgZm9yd2FyZCBzbGFzaGVzIHdpdGggYmFja3NsYXNoZXMgZm9yIFdpbmRvd3MgZGlzcGxheVxuICAgIHJldHVybiB3aW5kb3dzUGF0aC5yZXBsYWNlKC9cXC8vZywgJ1xcXFwnKVxuICB9XG5cbiAgcmV0dXJuICd+Ly5sb2NhbC9iaW4vY2xhdWRlJ1xufVxuXG5mdW5jdGlvbiBTZXR1cE5vdGVzKHsgbWVzc2FnZXMgfTogeyBtZXNzYWdlczogc3RyaW5nW10gfSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGlmIChtZXNzYWdlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezB9IG1hcmdpbkJvdHRvbT17MX0+XG4gICAgICA8Qm94PlxuICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5cbiAgICAgICAgICA8U3RhdHVzSWNvbiBzdGF0dXM9XCJ3YXJuaW5nXCIgd2l0aFNwYWNlIC8+XG4gICAgICAgICAgU2V0dXAgbm90ZXM6XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgICAge21lc3NhZ2VzLm1hcCgobWVzc2FnZSwgaW5kZXgpID0+IChcbiAgICAgICAgPEJveCBrZXk9e2luZGV4fSBtYXJnaW5MZWZ0PXsyfT5cbiAgICAgICAgICA8VGV4dCBkaW1Db2xvcj7igKIge21lc3NhZ2V9PC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICkpfVxuICAgIDwvQm94PlxuICApXG59XG5cbmZ1bmN0aW9uIEluc3RhbGwoeyBvbkRvbmUsIGZvcmNlLCB0YXJnZXQgfTogSW5zdGFsbFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZTxJbnN0YWxsU3RhdGU+KHsgdHlwZTogJ2NoZWNraW5nJyB9KVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbG9nRm9yRGVidWdnaW5nKFxuICAgICAgICAgIGBJbnN0YWxsOiBTdGFydGluZyBpbnN0YWxsYXRpb24gcHJvY2VzcyAoZm9yY2U9JHtmb3JjZX0sIHRhcmdldD0ke3RhcmdldH0pYCxcbiAgICAgICAgKVxuXG4gICAgICAgIC8vIEluc3RhbGwgbmF0aXZlIGJ1aWxkIGZpcnN0XG4gICAgICAgIGNvbnN0IGNoYW5uZWxPclZlcnNpb24gPVxuICAgICAgICAgIHRhcmdldCB8fCBnZXRJbml0aWFsU2V0dGluZ3MoKT8uYXV0b1VwZGF0ZXNDaGFubmVsIHx8ICdsYXRlc3QnXG4gICAgICAgIHNldFN0YXRlKHsgdHlwZTogJ2luc3RhbGxpbmcnLCB2ZXJzaW9uOiBjaGFubmVsT3JWZXJzaW9uIH0pXG5cbiAgICAgICAgLy8gUGFzcyBmb3JjZSBmbGFnIHRvIHRyaWdnZXIgcmVpbnN0YWxsIGV2ZW4gaWYgdXAgdG8gZGF0ZVxuICAgICAgICBsb2dGb3JEZWJ1Z2dpbmcoXG4gICAgICAgICAgYEluc3RhbGw6IENhbGxpbmcgaW5zdGFsbExhdGVzdChjaGFubmVsT3JWZXJzaW9uPSR7Y2hhbm5lbE9yVmVyc2lvbn0sIGZvcmNlUmVpbnN0YWxsPSR7Zm9yY2V9KWAsXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaW5zdGFsbExhdGVzdChjaGFubmVsT3JWZXJzaW9uLCBmb3JjZSlcbiAgICAgICAgbG9nRm9yRGVidWdnaW5nKFxuICAgICAgICAgIGBJbnN0YWxsOiBpbnN0YWxsTGF0ZXN0IHJldHVybmVkIHZlcnNpb249JHtyZXN1bHQubGF0ZXN0VmVyc2lvbn0sIHdhc1VwZGF0ZWQ9JHtyZXN1bHQud2FzVXBkYXRlZH0sIGxvY2tGYWlsZWQ9JHtyZXN1bHQubG9ja0ZhaWxlZH1gLFxuICAgICAgICApXG5cbiAgICAgICAgLy8gQ2hlY2sgc3BlY2lmaWNhbGx5IGZvciBsb2NrIGZhaWx1cmVcbiAgICAgICAgaWYgKHJlc3VsdC5sb2NrRmFpbGVkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0NvdWxkIG5vdCBpbnN0YWxsIC0gYW5vdGhlciBwcm9jZXNzIGlzIGN1cnJlbnRseSBpbnN0YWxsaW5nIENsYXVkZS4gUGxlYXNlIHRyeSBhZ2FpbiBpbiBhIG1vbWVudC4nLFxuICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGNvdWxkbid0IGdldCB0aGUgdmVyc2lvbiwgdGhlcmUgbWlnaHQgYmUgYW4gaXNzdWVcbiAgICAgICAgaWYgKCFyZXN1bHQubGF0ZXN0VmVyc2lvbikge1xuICAgICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgICAgICdJbnN0YWxsOiBGYWlsZWQgdG8gcmV0cmlldmUgdmVyc2lvbiBpbmZvcm1hdGlvbiBkdXJpbmcgaW5zdGFsbCcsXG4gICAgICAgICAgICB7IGxldmVsOiAnZXJyb3InIH0sXG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXN1bHQud2FzVXBkYXRlZCkge1xuICAgICAgICAgIGxvZ0ZvckRlYnVnZ2luZygnSW5zdGFsbDogQWxyZWFkeSB1cCB0byBkYXRlJylcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB1cCBsYXVuY2hlciBhbmQgc2hlbGwgaW50ZWdyYXRpb25cbiAgICAgICAgc2V0U3RhdGUoeyB0eXBlOiAnc2V0dGluZy11cCcgfSlcbiAgICAgICAgY29uc3Qgc2V0dXBNZXNzYWdlcyA9IGF3YWl0IGNoZWNrSW5zdGFsbCh0cnVlKVxuXG4gICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhcbiAgICAgICAgICBgSW5zdGFsbDogU2V0dXAgbGF1bmNoZXIgY29tcGxldGVkIHdpdGggJHtzZXR1cE1lc3NhZ2VzLmxlbmd0aH0gbWVzc2FnZXNgLFxuICAgICAgICApXG4gICAgICAgIGlmIChzZXR1cE1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBzZXR1cE1lc3NhZ2VzLmZvckVhY2gobXNnID0+XG4gICAgICAgICAgICBsb2dGb3JEZWJ1Z2dpbmcoYEluc3RhbGw6IFNldHVwIG1lc3NhZ2U6ICR7bXNnLm1lc3NhZ2V9YCksXG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHRoYXQgbmF0aXZlIGluc3RhbGxhdGlvbiBzdWNjZWVkZWQsIGNsZWFuIHVwIG9sZCBucG0gaW5zdGFsbGF0aW9uc1xuICAgICAgICBsb2dGb3JEZWJ1Z2dpbmcoXG4gICAgICAgICAgJ0luc3RhbGw6IENsZWFuaW5nIHVwIG5wbSBpbnN0YWxsYXRpb25zIGFmdGVyIHN1Y2Nlc3NmdWwgaW5zdGFsbCcsXG4gICAgICAgIClcbiAgICAgICAgY29uc3QgeyByZW1vdmVkLCBlcnJvcnMsIHdhcm5pbmdzIH0gPSBhd2FpdCBjbGVhbnVwTnBtSW5zdGFsbGF0aW9ucygpXG5cbiAgICAgICAgaWYgKHJlbW92ZWQgPiAwKSB7XG4gICAgICAgICAgbG9nRm9yRGVidWdnaW5nKGBDbGVhbmVkIHVwICR7cmVtb3ZlZH0gbnBtIGluc3RhbGxhdGlvbihzKWApXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsb2dGb3JEZWJ1Z2dpbmcoYENsZWFudXAgZXJyb3JzOiAke2Vycm9ycy5qb2luKCcsICcpfWApXG4gICAgICAgICAgLy8gQ29udGludWUgZGVzcGl0ZSBjbGVhbnVwIGVycm9ycyAtIG5hdGl2ZSBpbnN0YWxsIGFscmVhZHkgc3VjY2VlZGVkXG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhbiB1cCBvbGQgc2hlbGwgYWxpYXNlc1xuICAgICAgICBjb25zdCBhbGlhc01lc3NhZ2VzID0gYXdhaXQgY2xlYW51cFNoZWxsQWxpYXNlcygpXG4gICAgICAgIGlmIChhbGlhc01lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsb2dGb3JEZWJ1Z2dpbmcoXG4gICAgICAgICAgICBgU2hlbGwgYWxpYXMgY2xlYW51cDogJHthbGlhc01lc3NhZ2VzLm1hcChtID0+IG0ubWVzc2FnZSkuam9pbignOyAnKX1gLFxuICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvZyBzdWNjZXNzIGV2ZW50XG4gICAgICAgIGxvZ0V2ZW50KCd0ZW5ndV9jbGF1ZGVfaW5zdGFsbF9jb21tYW5kJywge1xuICAgICAgICAgIGhhc192ZXJzaW9uOiByZXN1bHQubGF0ZXN0VmVyc2lvbiA/IDEgOiAwLFxuICAgICAgICAgIGZvcmNlZDogZm9yY2UgPyAxIDogMCxcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBJZiB1c2VyIGV4cGxpY2l0bHkgc3BlY2lmaWVkIGEgY2hhbm5lbCwgc2F2ZSBpdCB0byBzZXR0aW5nc1xuICAgICAgICBpZiAodGFyZ2V0ID09PSAnbGF0ZXN0JyB8fCB0YXJnZXQgPT09ICdzdGFibGUnKSB7XG4gICAgICAgICAgdXBkYXRlU2V0dGluZ3NGb3JTb3VyY2UoJ3VzZXJTZXR0aW5ncycsIHtcbiAgICAgICAgICAgIGF1dG9VcGRhdGVzQ2hhbm5lbDogdGFyZ2V0LFxuICAgICAgICAgIH0pXG4gICAgICAgICAgbG9nRm9yRGVidWdnaW5nKFxuICAgICAgICAgICAgYEluc3RhbGw6IFNhdmVkIGF1dG9VcGRhdGVzQ2hhbm5lbD0ke3RhcmdldH0gdG8gdXNlciBzZXR0aW5nc2AsXG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29tYmluZSBhbGwgd2FybmluZy9pbmZvIG1lc3NhZ2VzIChjb252ZXJ0IFNldHVwTWVzc2FnZSB0byBzdHJpbmcpXG4gICAgICAgIGNvbnN0IGFsbFdhcm5pbmdzID0gWy4uLndhcm5pbmdzLCAuLi5hbGlhc01lc3NhZ2VzLm1hcChtID0+IG0ubWVzc2FnZSldXG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgd2VyZSBhbnkgc2V0dXAgZXJyb3JzIG9yIG5vdGVzXG4gICAgICAgIGlmIChzZXR1cE1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICB0eXBlOiAnc2V0LXVwJyxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBzZXR1cE1lc3NhZ2VzLm1hcChtID0+IG0ubWVzc2FnZSksXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyBTdGlsbCBtYXJrIGFzIHN1Y2Nlc3MgYnV0IHNob3cgYm90aCBzZXR1cCBtZXNzYWdlcyBhbmQgY2xlYW51cCB3YXJuaW5nc1xuICAgICAgICAgIHNldFRpbWVvdXQoc2V0U3RhdGUsIDIwMDAsIHtcbiAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyBhcyBjb25zdCxcbiAgICAgICAgICAgIHZlcnNpb246IHJlc3VsdC5sYXRlc3RWZXJzaW9uIHx8ICdjdXJyZW50JyxcbiAgICAgICAgICAgIHNldHVwTWVzc2FnZXM6IFtcbiAgICAgICAgICAgICAgLi4uc2V0dXBNZXNzYWdlcy5tYXAobSA9PiBtLm1lc3NhZ2UpLFxuICAgICAgICAgICAgICAuLi5hbGxXYXJuaW5ncyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBObyBzZXR1cCBtZXNzYWdlcywgZ28gc3RyYWlnaHQgdG8gc3VjY2VzcyAoYnV0IHN0aWxsIHNob3cgY2xlYW51cCB3YXJuaW5ncyBpZiBhbnkpXG4gICAgICAgICAgbG9nRm9yRGVidWdnaW5nKCdJbnN0YWxsOiBTaGVsbCBQQVRIIGFscmVhZHkgY29uZmlndXJlZCcpXG4gICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgdmVyc2lvbjogcmVzdWx0LmxhdGVzdFZlcnNpb24gfHwgJ2N1cnJlbnQnLFxuICAgICAgICAgICAgc2V0dXBNZXNzYWdlczogYWxsV2FybmluZ3MubGVuZ3RoID4gMCA/IGFsbFdhcm5pbmdzIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ0ZvckRlYnVnZ2luZyhgSW5zdGFsbCBjb21tYW5kIGZhaWxlZDogJHtlcnJvcn1gLCB7XG4gICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgIH0pXG4gICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZShlcnJvciksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgdm9pZCBydW4oKVxuICB9LCBbZm9yY2UsIHRhcmdldF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3RhdGUudHlwZSA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAvLyBHaXZlIHN1Y2Nlc3MgbWVzc2FnZSB0aW1lIHRvIHJlbmRlciBiZWZvcmUgZXhpdGluZ1xuICAgICAgc2V0VGltZW91dChcbiAgICAgICAgb25Eb25lLFxuICAgICAgICAyMDAwLFxuICAgICAgICAnQ2xhdWRlIENvZGUgaW5zdGFsbGF0aW9uIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICB7XG4gICAgICAgICAgZGlzcGxheTogJ3N5c3RlbScgYXMgY29uc3QsXG4gICAgICAgIH0sXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChzdGF0ZS50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAvLyBHaXZlIGVycm9yIG1lc3NhZ2UgdGltZSB0byByZW5kZXIgYmVmb3JlIGV4aXRpbmdcbiAgICAgIHNldFRpbWVvdXQob25Eb25lLCAzMDAwLCAnQ2xhdWRlIENvZGUgaW5zdGFsbGF0aW9uIGZhaWxlZCcsIHtcbiAgICAgICAgZGlzcGxheTogJ3N5c3RlbScgYXMgY29uc3QsXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW3N0YXRlLCBvbkRvbmVdKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgbWFyZ2luVG9wPXsxfT5cbiAgICAgIHtzdGF0ZS50eXBlID09PSAnY2hlY2tpbmcnICYmIChcbiAgICAgICAgPFRleHQgY29sb3I9XCJjbGF1ZGVcIj5DaGVja2luZyBpbnN0YWxsYXRpb24gc3RhdHVzLi4uPC9UZXh0PlxuICAgICAgKX1cblxuICAgICAge3N0YXRlLnR5cGUgPT09ICdjbGVhbmluZy1ucG0nICYmIChcbiAgICAgICAgPFRleHQgY29sb3I9XCJ3YXJuaW5nXCI+Q2xlYW5pbmcgdXAgb2xkIG5wbSBpbnN0YWxsYXRpb25zLi4uPC9UZXh0PlxuICAgICAgKX1cblxuICAgICAge3N0YXRlLnR5cGUgPT09ICdpbnN0YWxsaW5nJyAmJiAoXG4gICAgICAgIDxUZXh0IGNvbG9yPVwiY2xhdWRlXCI+XG4gICAgICAgICAgSW5zdGFsbGluZyBDbGF1ZGUgQ29kZSBuYXRpdmUgYnVpbGQge3N0YXRlLnZlcnNpb259Li4uXG4gICAgICAgIDwvVGV4dD5cbiAgICAgICl9XG5cbiAgICAgIHtzdGF0ZS50eXBlID09PSAnc2V0dGluZy11cCcgJiYgKFxuICAgICAgICA8VGV4dCBjb2xvcj1cImNsYXVkZVwiPlNldHRpbmcgdXAgbGF1bmNoZXIgYW5kIHNoZWxsIGludGVncmF0aW9uLi4uPC9UZXh0PlxuICAgICAgKX1cblxuICAgICAge3N0YXRlLnR5cGUgPT09ICdzZXQtdXAnICYmIDxTZXR1cE5vdGVzIG1lc3NhZ2VzPXtzdGF0ZS5tZXNzYWdlc30gLz59XG5cbiAgICAgIHtzdGF0ZS50eXBlID09PSAnc3VjY2VzcycgJiYgKFxuICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9PlxuICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8U3RhdHVzSWNvbiBzdGF0dXM9XCJzdWNjZXNzXCIgd2l0aFNwYWNlIC8+XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cInN1Y2Nlc3NcIiBib2xkPlxuICAgICAgICAgICAgICBDbGF1ZGUgQ29kZSBzdWNjZXNzZnVsbHkgaW5zdGFsbGVkIVxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICAgIDxCb3ggbWFyZ2luTGVmdD17Mn0gZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0+XG4gICAgICAgICAgICB7c3RhdGUudmVyc2lvbiAhPT0gJ2N1cnJlbnQnICYmIChcbiAgICAgICAgICAgICAgPEJveD5cbiAgICAgICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5WZXJzaW9uOiA8L1RleHQ+XG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCJjbGF1ZGVcIj57c3RhdGUudmVyc2lvbn08L1RleHQ+XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPkxvY2F0aW9uOiA8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwidGV4dFwiPntnZXRJbnN0YWxsYXRpb25QYXRoKCl9PC9UZXh0PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPEJveCBtYXJnaW5MZWZ0PXsyfSBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfT5cbiAgICAgICAgICAgIDxCb3ggbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgICAgICAgPFRleHQgZGltQ29sb3I+TmV4dDogUnVuIDwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCJjbGF1ZGVcIiBib2xkPlxuICAgICAgICAgICAgICAgIGNsYXVkZSAtLWhlbHBcbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj4gdG8gZ2V0IHN0YXJ0ZWQ8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgICB7c3RhdGUuc2V0dXBNZXNzYWdlcyAmJiA8U2V0dXBOb3RlcyBtZXNzYWdlcz17c3RhdGUuc2V0dXBNZXNzYWdlc30gLz59XG4gICAgICAgIDwvQm94PlxuICAgICAgKX1cblxuICAgICAge3N0YXRlLnR5cGUgPT09ICdlcnJvcicgJiYgKFxuICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9PlxuICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8U3RhdHVzSWNvbiBzdGF0dXM9XCJlcnJvclwiIHdpdGhTcGFjZSAvPlxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCJlcnJvclwiPkluc3RhbGxhdGlvbiBmYWlsZWQ8L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPFRleHQgY29sb3I9XCJlcnJvclwiPntzdGF0ZS5tZXNzYWdlfTwvVGV4dD5cbiAgICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5UcnkgcnVubmluZyB3aXRoIC0tZm9yY2UgdG8gb3ZlcnJpZGUgY2hlY2tzPC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuLy8gVGhpcyBpcyBvbmx5IHVzZWQgZnJvbSBjbGkudHN4LCBub3QgYXMgYSBzbGFzaCBjb21tYW5kXG5leHBvcnQgY29uc3QgaW5zdGFsbCA9IHtcbiAgdHlwZTogJ2xvY2FsLWpzeCcgYXMgY29uc3QsXG4gIG5hbWU6ICdpbnN0YWxsJyxcbiAgZGVzY3JpcHRpb246ICdJbnN0YWxsIENsYXVkZSBDb2RlIG5hdGl2ZSBidWlsZCcsXG4gIGFyZ3VtZW50SGludDogJ1tvcHRpb25zXScsXG4gIGFzeW5jIGNhbGwoXG4gICAgb25Eb25lOiAoXG4gICAgICByZXN1bHQ6IHN0cmluZyxcbiAgICAgIG9wdGlvbnM/OiB7IGRpc3BsYXk/OiBDb21tYW5kUmVzdWx0RGlzcGxheSB9LFxuICAgICkgPT4gdm9pZCxcbiAgICBfY29udGV4dDogdW5rbm93bixcbiAgICBhcmdzOiBzdHJpbmdbXSxcbiAgKSB7XG4gICAgLy8gUGFyc2UgYXJndW1lbnRzXG4gICAgY29uc3QgZm9yY2UgPSBhcmdzLmluY2x1ZGVzKCctLWZvcmNlJylcbiAgICBjb25zdCBub25GbGFnQXJncyA9IGFyZ3MuZmlsdGVyKGFyZyA9PiAhYXJnLnN0YXJ0c1dpdGgoJy0tJykpXG4gICAgY29uc3QgdGFyZ2V0ID0gbm9uRmxhZ0FyZ3NbMF0gLy8gJ2xhdGVzdCcsICdzdGFibGUnLCBvciB2ZXJzaW9uIGxpa2UgJzEuMC4zNCdcblxuICAgIGNvbnN0IHsgdW5tb3VudCB9ID0gYXdhaXQgcmVuZGVyKFxuICAgICAgPEluc3RhbGxcbiAgICAgICAgb25Eb25lPXsocmVzdWx0LCBvcHRpb25zKSA9PiB7XG4gICAgICAgICAgdW5tb3VudCgpXG4gICAgICAgICAgb25Eb25lKHJlc3VsdCwgb3B0aW9ucylcbiAgICAgICAgfX1cbiAgICAgICAgZm9yY2U9e2ZvcmNlfVxuICAgICAgICB0YXJnZXQ9e3RhcmdldH1cbiAgICAgIC8+LFxuICAgIClcbiAgfSxcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLFNBQVNBLE9BQU8sUUFBUSxTQUFTO0FBQ2pDLFNBQVNDLElBQUksUUFBUSxXQUFXO0FBQ2hDLE9BQU9DLEtBQUssSUFBSUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUNsRCxjQUFjQyxvQkFBb0IsUUFBUSxpQkFBaUI7QUFDM0QsU0FBU0MsUUFBUSxRQUFRLGlDQUFpQztBQUMxRCxTQUFTQyxVQUFVLFFBQVEsMkNBQTJDO0FBQ3RFLFNBQVNDLEdBQUcsRUFBRUMsTUFBTSxFQUFFQyxJQUFJLFFBQVEsV0FBVztBQUM3QyxTQUFTQyxlQUFlLFFBQVEsbUJBQW1CO0FBQ25ELFNBQVNDLEdBQUcsUUFBUSxpQkFBaUI7QUFDckMsU0FBU0MsWUFBWSxRQUFRLG9CQUFvQjtBQUNqRCxTQUNFQyxZQUFZLEVBQ1pDLHVCQUF1QixFQUN2QkMsbUJBQW1CLEVBQ25CQyxhQUFhLFFBQ1IsbUNBQW1DO0FBQzFDLFNBQ0VDLGtCQUFrQixFQUNsQkMsdUJBQXVCLFFBQ2xCLCtCQUErQjtBQUV0QyxVQUFVQyxZQUFZLENBQUM7RUFDckJDLE1BQU0sRUFBRSxDQUFDQyxNQUFNLEVBQUUsTUFBTSxFQUFFQyxPQUE0QyxDQUFwQyxFQUFFO0lBQUVDLE9BQU8sQ0FBQyxFQUFFbkIsb0JBQW9CO0VBQUMsQ0FBQyxFQUFFLEdBQUcs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
