"use strict";
/**
 * Sandbox types for the Claude Code Agent SDK
 *
 * This file is the single source of truth for sandbox configuration types.
 * Both the SDK and the settings validation import from here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxSettingsSchema = exports.SandboxFilesystemConfigSchema = exports.SandboxNetworkConfigSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../utils/lazySchema.js");
/**
 * Network configuration schema for sandbox.
 */
exports.SandboxNetworkConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        allowedDomains: v4_1.z.array(v4_1.z.string()).optional(),
        allowManagedDomainsOnly: v4_1.z
            .boolean()
            .optional()
            .describe('When true (and set in managed settings), only allowedDomains and WebFetch(domain:...) allow rules from managed settings are respected. ' +
            'User, project, local, and flag settings domains are ignored. Denied domains are still respected from all sources.'),
        allowUnixSockets: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('macOS only: Unix socket paths to allow. Ignored on Linux (seccomp cannot filter by path).'),
        allowAllUnixSockets: v4_1.z
            .boolean()
            .optional()
            .describe('If true, allow all Unix sockets (disables blocking on both platforms).'),
        allowLocalBinding: v4_1.z.boolean().optional(),
        httpProxyPort: v4_1.z.number().optional(),
        socksProxyPort: v4_1.z.number().optional(),
    })
        .optional();
});
/**
 * Filesystem configuration schema for sandbox.
 */
exports.SandboxFilesystemConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        allowWrite: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Additional paths to allow writing within the sandbox. ' +
            'Merged with paths from Edit(...) allow permission rules.'),
        denyWrite: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Additional paths to deny writing within the sandbox. ' +
            'Merged with paths from Edit(...) deny permission rules.'),
        denyRead: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Additional paths to deny reading within the sandbox. ' +
            'Merged with paths from Read(...) deny permission rules.'),
        allowRead: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Paths to re-allow reading within denyRead regions. ' +
            'Takes precedence over denyRead for matching paths.'),
        allowManagedReadPathsOnly: v4_1.z
            .boolean()
            .optional()
            .describe('When true (set in managed settings), only allowRead paths from policySettings are used.'),
    })
        .optional();
});
/**
 * Sandbox settings schema.
 */
exports.SandboxSettingsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        enabled: v4_1.z.boolean().optional(),
        failIfUnavailable: v4_1.z
            .boolean()
            .optional()
            .describe('Exit with an error at startup if sandbox.enabled is true but the sandbox cannot start ' +
            '(missing dependencies, unsupported platform, or platform not in enabledPlatforms). ' +
            'When false (default), a warning is shown and commands run unsandboxed. ' +
            'Intended for managed-settings deployments that require sandboxing as a hard gate.'),
        // Note: enabledPlatforms is an undocumented setting read via .passthrough()
        // It restricts sandboxing to specific platforms (e.g., ["macos"]).
        //
        // Added to unblock NVIDIA enterprise rollout: they want to enable
        // autoAllowBashIfSandboxed but only on macOS initially, since Linux/WSL
        // sandbox support is newer and less battle-tested. This allows them to
        // set enabledPlatforms: ["macos"] to disable sandbox (and auto-allow)
        // on other platforms until they're ready to expand.
        autoAllowBashIfSandboxed: v4_1.z.boolean().optional(),
        allowUnsandboxedCommands: v4_1.z
            .boolean()
            .optional()
            .describe('Allow commands to run outside the sandbox via the dangerouslyDisableSandbox parameter. ' +
            'When false, the dangerouslyDisableSandbox parameter is completely ignored and all commands must run sandboxed. ' +
            'Default: true.'),
        network: (0, exports.SandboxNetworkConfigSchema)(),
        filesystem: (0, exports.SandboxFilesystemConfigSchema)(),
        ignoreViolations: v4_1.z.record(v4_1.z.string(), v4_1.z.array(v4_1.z.string())).optional(),
        enableWeakerNestedSandbox: v4_1.z.boolean().optional(),
        enableWeakerNetworkIsolation: v4_1.z
            .boolean()
            .optional()
            .describe('macOS only: Allow access to com.apple.trustd.agent in the sandbox. ' +
            'Needed for Go-based CLI tools (gh, gcloud, terraform, etc.) to verify TLS certificates ' +
            'when using httpProxyPort with a MITM proxy and custom CA. ' +
            '**Reduces security** — opens a potential data exfiltration vector through the trustd service. Default: false'),
        excludedCommands: v4_1.z.array(v4_1.z.string()).optional(),
        ripgrep: v4_1.z
            .object({
            command: v4_1.z.string(),
            args: v4_1.z.array(v4_1.z.string()).optional(),
        })
            .optional()
            .describe('Custom ripgrep configuration for bundled ripgrep support'),
    })
        .passthrough();
});
