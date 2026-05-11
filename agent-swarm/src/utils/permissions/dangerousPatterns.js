"use strict";
/**
 * Pattern lists for dangerous shell-tool allow-rule prefixes.
 *
 * An allow rule like `Bash(python:*)` or `PowerShell(node:*)` lets the model
 * run arbitrary code via that interpreter, bypassing the auto-mode classifier.
 * These lists feed the isDangerous{Bash,PowerShell}Permission predicates in
 * permissionSetup.ts, which strip such rules at auto-mode entry.
 *
 * The matcher in each predicate handles the rule-shape variants (exact, `:*`,
 * trailing `*`, ` *`, ` -…*`). PS-specific cmdlet strings live in
 * isDangerousPowerShellPermission (permissionSetup.ts).
 */
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
exports.DANGEROUS_BASH_PATTERNS = exports.CROSS_PLATFORM_CODE_EXEC = void 0;
/**
 * Cross-platform code-execution entry points present on both Unix and Windows.
 * Shared to prevent the two lists drifting apart on interpreter additions.
 */
exports.CROSS_PLATFORM_CODE_EXEC = [
    // Interpreters
    'python',
    'python3',
    'python2',
    'node',
    'deno',
    'tsx',
    'ruby',
    'perl',
    'php',
    'lua',
    // Package runners
    'npx',
    'bunx',
    'npm run',
    'yarn run',
    'pnpm run',
    'bun run',
    // Shells reachable from both (Git Bash / WSL on Windows, native on Unix)
    'bash',
    'sh',
    // Remote arbitrary-command wrapper (native OpenSSH on Win10+)
    'ssh',
];
exports.DANGEROUS_BASH_PATTERNS = __spreadArray(__spreadArray(__spreadArray([], exports.CROSS_PLATFORM_CODE_EXEC, true), [
    'zsh',
    'fish',
    'eval',
    'exec',
    'env',
    'xargs',
    'sudo'
], false), (process.env.USER_TYPE === 'ant'
    ? [
        'fa run',
        // Cluster code launcher — arbitrary code on the cluster
        'coo',
        // Network/exfil: gh gist create --public, gh api arbitrary HTTP,
        // curl/wget POST. gh api needs its own entry — the matcher is
        // exact-shape, not prefix, so pattern 'gh' alone does not catch
        // rule 'gh api:*' (same reason 'npm run' is separate from 'npm').
        'gh',
        'gh api',
        'curl',
        'wget',
        // git config core.sshCommand / hooks install = arbitrary code
        'git',
        // Cloud resource writes (s3 public buckets, k8s mutations)
        'kubectl',
        'aws',
        'gcloud',
        'gsutil',
    ]
    : []), true);
