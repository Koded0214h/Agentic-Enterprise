"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownMarketplacesFileSchema = exports.KnownMarketplaceSchema = exports.InstalledPluginsFileSchema = exports.InstalledPluginsFileSchemaV2 = exports.PluginInstallationEntrySchema = exports.PluginScopeSchema = exports.InstalledPluginsFileSchemaV1 = exports.InstalledPluginSchema = exports.SettingsPluginEntrySchema = exports.DependencyRefSchema = exports.PluginIdSchema = exports.PluginMarketplaceSchema = exports.PluginMarketplaceEntrySchema = exports.PluginSourceSchema = exports.gitSha = exports.MarketplaceSourceSchema = exports.PluginManifestSchema = exports.LspServerConfigSchema = exports.CommandMetadataSchema = exports.PluginHooksSchema = exports.PluginAuthorSchema = exports.OFFICIAL_GITHUB_ORG = exports.BLOCKED_OFFICIAL_NAME_PATTERN = exports.ALLOWED_OFFICIAL_MARKETPLACE_NAMES = void 0;
exports.isMarketplaceAutoUpdate = isMarketplaceAutoUpdate;
exports.isBlockedOfficialName = isBlockedOfficialName;
exports.validateOfficialNameSource = validateOfficialNameSource;
exports.isLocalPluginSource = isLocalPluginSource;
exports.isLocalMarketplaceSource = isLocalMarketplaceSource;
var v4_1 = require("zod/v4");
var hooks_js_1 = require("../../schemas/hooks.js");
var types_js_1 = require("../../services/mcp/types.js");
var lazySchema_js_1 = require("../lazySchema.js");
/**
 * First-layer defense against official marketplace impersonation.
 *
 * This validation blocks direct impersonation attempts like "anthropic-official",
 * "claude-marketplace", etc. Indirect variations (e.g., "my-claude-marketplace")
 * are not blocked intentionally to avoid false positives on legitimate names.
 * Source org verification provides additional protection at registration/install time.
 */
/**
 * Official marketplace names that are reserved for Anthropic/Claude official use.
 * These names are allowed ONLY for official marketplaces and blocked for third parties.
 */
exports.ALLOWED_OFFICIAL_MARKETPLACE_NAMES = new Set([
    'claude-code-marketplace',
    'claude-code-plugins',
    'claude-plugins-official',
    'anthropic-marketplace',
    'anthropic-plugins',
    'agent-skills',
    'life-sciences',
    'knowledge-work-plugins',
]);
/**
 * Official marketplaces that should NOT auto-update by default.
 * These are still reserved/allowed names, but opt out of the auto-update
 * default that other official marketplaces receive.
 */
var NO_AUTO_UPDATE_OFFICIAL_MARKETPLACES = new Set(['knowledge-work-plugins']);
/**
 * Check if auto-update is enabled for a marketplace.
 * Uses the stored value if set, otherwise defaults based on whether
 * it's an official Anthropic marketplace (true) or not (false).
 * Official marketplaces in NO_AUTO_UPDATE_OFFICIAL_MARKETPLACES are excluded
 * from the auto-update default.
 *
 * @param marketplaceName - The name of the marketplace
 * @param entry - The marketplace entry (may have autoUpdate set)
 * @returns Whether auto-update is enabled for this marketplace
 */
function isMarketplaceAutoUpdate(marketplaceName, entry) {
    var _a;
    var normalizedName = marketplaceName.toLowerCase();
    return ((_a = entry.autoUpdate) !== null && _a !== void 0 ? _a : (exports.ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(normalizedName) &&
        !NO_AUTO_UPDATE_OFFICIAL_MARKETPLACES.has(normalizedName)));
}
/**
 * Pattern to detect names that impersonate official Anthropic/Claude marketplaces.
 *
 * Matches names containing variations like:
 * - "official" combined with "anthropic" or "claude" (e.g., "official-claude-plugins")
 * - "anthropic" or "claude" combined with "official" (e.g., "claude-official")
 * - Names starting with "anthropic" or "claude" followed by official-sounding terms
 *   like "marketplace", "plugins" (e.g., "anthropic-marketplace-new", "claude-plugins-v2")
 *
 * The pattern is case-insensitive.
 */
exports.BLOCKED_OFFICIAL_NAME_PATTERN = /(?:official[^a-z0-9]*(anthropic|claude)|(?:anthropic|claude)[^a-z0-9]*official|^(?:anthropic|claude)[^a-z0-9]*(marketplace|plugins|official))/i;
/**
 * Pattern to detect non-ASCII characters that could be used for homograph attacks.
 * Marketplace names should only contain ASCII characters to prevent impersonation
 * via lookalike Unicode characters (e.g., Cyrillic 'а' instead of Latin 'a').
 */
var NON_ASCII_PATTERN = /[^\u0020-\u007E]/;
/**
 * Check if a marketplace name impersonates an official Anthropic/Claude marketplace.
 *
 * @param name - The marketplace name to check
 * @returns true if the name is blocked (impersonates official), false if allowed
 */
function isBlockedOfficialName(name) {
    // If it's in the allowed list, it's not blocked
    if (exports.ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(name.toLowerCase())) {
        return false;
    }
    // Block names with non-ASCII characters to prevent homograph attacks
    // (e.g., using Cyrillic 'а' to impersonate 'anthropic')
    if (NON_ASCII_PATTERN.test(name)) {
        return true;
    }
    // Check if it matches the blocked pattern
    return exports.BLOCKED_OFFICIAL_NAME_PATTERN.test(name);
}
/**
 * The official GitHub organization for Anthropic marketplaces.
 * Reserved names must come from this org.
 */
exports.OFFICIAL_GITHUB_ORG = 'anthropics';
/**
 * Validate that a marketplace with a reserved name comes from the official source.
 *
 * Reserved names (in ALLOWED_OFFICIAL_MARKETPLACE_NAMES) can only be used by
 * marketplaces from the official Anthropic GitHub organization.
 *
 * @param name - The marketplace name
 * @param source - The marketplace source configuration
 * @returns An error message if validation fails, or null if valid
 */
function validateOfficialNameSource(name, source) {
    var normalizedName = name.toLowerCase();
    // Only validate reserved names
    if (!exports.ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(normalizedName)) {
        return null; // Not a reserved name, no source validation needed
    }
    // Check for GitHub source type
    if (source.source === 'github') {
        // Verify the repo is from the official org
        var repo = source.repo || '';
        if (!repo.toLowerCase().startsWith("".concat(exports.OFFICIAL_GITHUB_ORG, "/"))) {
            return "The name '".concat(name, "' is reserved for official Anthropic marketplaces. Only repositories from 'github.com/").concat(exports.OFFICIAL_GITHUB_ORG, "/' can use this name.");
        }
        return null; // Valid: reserved name from official GitHub source
    }
    // Check for git URL source type
    if (source.source === 'git' && source.url) {
        var url = source.url.toLowerCase();
        // Check for HTTPS URL format: https://github.com/anthropics/...
        // or SSH format: git@github.com:anthropics/...
        var isHttpsAnthropics = url.includes('github.com/anthropics/');
        var isSshAnthropics = url.includes('git@github.com:anthropics/');
        if (isHttpsAnthropics || isSshAnthropics) {
            return null; // Valid: reserved name from official git URL
        }
        return "The name '".concat(name, "' is reserved for official Anthropic marketplaces. Only repositories from 'github.com/").concat(exports.OFFICIAL_GITHUB_ORG, "/' can use this name.");
    }
    // Reserved names must come from GitHub (either 'github' or 'git' source)
    return "The name '".concat(name, "' is reserved for official Anthropic marketplaces and can only be used with GitHub sources from the '").concat(exports.OFFICIAL_GITHUB_ORG, "' organization.");
}
/**
 * Schema for relative file paths that must start with './'
 */
var RelativePath = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.string().startsWith('./'); });
/**
 * Schema for relative paths to JSON files
 */
var RelativeJSONPath = (0, lazySchema_js_1.lazySchema)(function () { return RelativePath().endsWith('.json'); });
/**
 * Schema for MCPB (MCP Bundle) file paths
 * Supports both local relative paths and remote URLs
 */
var McpbPath = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        RelativePath()
            .refine(function (path) { return path.endsWith('.mcpb') || path.endsWith('.dxt'); }, {
            message: 'MCPB file path must end with .mcpb or .dxt',
        })
            .describe('Path to MCPB file relative to plugin root'),
        v4_1.z
            .string()
            .url()
            .refine(function (url) { return url.endsWith('.mcpb') || url.endsWith('.dxt'); }, {
            message: 'MCPB URL must end with .mcpb or .dxt',
        })
            .describe('URL to MCPB file'),
    ]);
});
/**
 * Schema for relative paths to Markdown files
 */
var RelativeMarkdownPath = (0, lazySchema_js_1.lazySchema)(function () { return RelativePath().endsWith('.md'); });
/**
 * Schema for relative paths to command sources (markdown files or directories containing SKILL.md)
 */
var RelativeCommandPath = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        RelativeMarkdownPath(),
        RelativePath(), // Allow any relative path, including directories
    ]);
});
/**
 * Shared marketplace-name validation. Used by both PluginMarketplaceSchema
 * (validates fetched marketplace.json) and the settings arm of
 * MarketplaceSourceSchema (validates inline names in settings.json).
 *
 * The two must stay in sync: loadAndCacheMarketplace's case 'settings' writes
 * to join(cacheDir, source.name) BEFORE the post-write PluginMarketplaceSchema
 * validation runs. Any name that passes the settings arm but fails
 * PluginMarketplaceSchema leaves orphaned files in the cache (cleanupNeeded=false).
 * A single shared schema makes drift impossible.
 */
var MarketplaceNameSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .string()
        .min(1, 'Marketplace must have a name')
        .refine(function (name) { return !name.includes(' '); }, {
        message: 'Marketplace name cannot contain spaces. Use kebab-case (e.g., "my-marketplace")',
    })
        .refine(function (name) {
        return !name.includes('/') &&
            !name.includes('\\') &&
            !name.includes('..') &&
            name !== '.';
    }, {
        message: 'Marketplace name cannot contain path separators (/ or \\), ".." sequences, or be "."',
    })
        .refine(function (name) { return !isBlockedOfficialName(name); }, {
        message: 'Marketplace name impersonates an official Anthropic/Claude marketplace',
    })
        .refine(function (name) { return name.toLowerCase() !== 'inline'; }, {
        message: 'Marketplace name "inline" is reserved for --plugin-dir session plugins',
    })
        .refine(function (name) { return name.toLowerCase() !== 'builtin'; }, {
        message: 'Marketplace name "builtin" is reserved for built-in plugins',
    });
});
/**
 * Schema for plugin author information
 */
exports.PluginAuthorSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        name: v4_1.z
            .string()
            .min(1, 'Author name cannot be empty')
            .describe('Display name of the plugin author or organization'),
        email: v4_1.z
            .string()
            .optional()
            .describe('Contact email for support or feedback'),
        url: v4_1.z
            .string()
            .optional()
            .describe('Website, GitHub profile, or organization URL'),
    });
});
/**
 * Metadata part of the plugin manifest file (plugin.json)
 *
 * This schema validates the structure of plugin manifests and provides
 * runtime type checking when loading plugins from disk.
 */
var PluginManifestMetadataSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        name: v4_1.z
            .string()
            .min(1, 'Plugin name cannot be empty')
            .refine(function (name) { return !name.includes(' '); }, {
            message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")',
        })
            .describe('Unique identifier for the plugin, used for namespacing (prefer kebab-case)'),
        version: v4_1.z
            .string()
            .optional()
            .describe('Semantic version (e.g., 1.2.3) following semver.org specification'),
        description: v4_1.z
            .string()
            .optional()
            .describe('Brief, user-facing explanation of what the plugin provides'),
        author: (0, exports.PluginAuthorSchema)()
            .optional()
            .describe('Information about the plugin creator or maintainer'),
        homepage: v4_1.z
            .string()
            .url()
            .optional()
            .describe('Plugin homepage or documentation URL'),
        repository: v4_1.z.string().optional().describe('Source code repository URL'),
        license: v4_1.z
            .string()
            .optional()
            .describe('SPDX license identifier (e.g., MIT, Apache-2.0)'),
        keywords: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Tags for plugin discovery and categorization'),
        dependencies: v4_1.z
            .array((0, exports.DependencyRefSchema)())
            .optional()
            .describe('Plugins that must be enabled for this plugin to function. Bare names (no "@marketplace") are resolved against the declaring plugin\'s own marketplace.'),
    });
});
/**
 * Schema for plugin hooks configuration (hooks.json)
 *
 * Defines the hooks that a plugin can provide to intercept and modify
 * Claude Code behavior at various lifecycle events.
 */
exports.PluginHooksSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        description: v4_1.z
            .string()
            .optional()
            .describe('Brief, user-facing explanation of what these hooks provide'),
        hooks: v4_1.z
            .lazy(function () { return (0, hooks_js_1.HooksSchema)(); })
            .describe('The hooks provided by the plugin, in the same format as the one used for settings'),
    });
});
/**
 * Schema for additional hooks configuration in plugin manifest
 *
 * Allows plugins to specify hooks either inline or via external files,
 * supplementing any hooks defined in the standard hooks/hooks.json location.
 */
var PluginManifestHooksSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        hooks: v4_1.z.union([
            RelativeJSONPath().describe('Path to file with additional hooks (in addition to those in hooks/hooks.json, if it exists), relative to the plugin root'),
            v4_1.z
                .lazy(function () { return (0, hooks_js_1.HooksSchema)(); })
                .describe('Additional hooks (in addition to those in hooks/hooks.json, if it exists)'),
            v4_1.z.array(v4_1.z.union([
                RelativeJSONPath().describe('Path to file with additional hooks (in addition to those in hooks/hooks.json, if it exists), relative to the plugin root'),
                v4_1.z
                    .lazy(function () { return (0, hooks_js_1.HooksSchema)(); })
                    .describe('Additional hooks (in addition to those in hooks/hooks.json, if it exists)'),
            ])),
        ]),
    });
});
/**
 * Schema for command metadata when using object-mapping format
 *
 * Allows marketplace entries to provide rich metadata for commands including
 * custom descriptions and frontmatter overrides.
 *
 * Commands can be defined with either:
 * - source: Path to a markdown file
 * - content: Inline markdown content
 */
exports.CommandMetadataSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        source: RelativeCommandPath()
            .optional()
            .describe('Path to command markdown file, relative to plugin root'),
        content: v4_1.z
            .string()
            .optional()
            .describe('Inline markdown content for the command'),
        description: v4_1.z
            .string()
            .optional()
            .describe('Command description override'),
        argumentHint: v4_1.z
            .string()
            .optional()
            .describe('Hint for command arguments (e.g., "[file]")'),
        model: v4_1.z.string().optional().describe('Default model for this command'),
        allowedTools: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Tools allowed when command runs'),
    })
        .refine(function (data) { return (data.source && !data.content) || (!data.source && data.content); }, {
        message: 'Command must have either "source" (file path) or "content" (inline markdown), but not both',
    });
});
/**
 * Schema for additional command definitions in plugin manifest
 *
 * Allows plugins to specify extra command files or skill directories beyond those
 * in the standard commands/ directory.
 *
 * Supports three formats:
 * 1. Single path: "./README.md"
 * 2. Array of paths: ["./README.md", "./docs/guide.md"]
 * 3. Object mapping: { "about": { "source": "./README.md", "description": "..." } }
 */
var PluginManifestCommandsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        commands: v4_1.z.union([
            // TODO (future work): allow globs?
            RelativeCommandPath().describe('Path to additional command file or skill directory (in addition to those in the commands/ directory, if it exists), relative to the plugin root'),
            v4_1.z
                .array(RelativeCommandPath().describe('Path to additional command file or skill directory (in addition to those in the commands/ directory, if it exists), relative to the plugin root'))
                .describe('List of paths to additional command files or skill directories'),
            v4_1.z
                .record(v4_1.z.string(), (0, exports.CommandMetadataSchema)())
                .describe('Object mapping of command names to their metadata and source files. Command name becomes the slash command name (e.g., "about" → "/plugin:about")'),
        ]),
    });
});
/**
 * Schema for additional agent definitions in plugin manifest
 *
 * Allows plugins to specify extra agent files beyond those in the
 * standard agents/ directory.
 */
var PluginManifestAgentsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        agents: v4_1.z.union([
            // TODO (future work): allow globs?
            RelativeMarkdownPath().describe('Path to additional agent file (in addition to those in the agents/ directory, if it exists), relative to the plugin root'),
            v4_1.z
                .array(RelativeMarkdownPath().describe('Path to additional agent file (in addition to those in the agents/ directory, if it exists), relative to the plugin root'))
                .describe('List of paths to additional agent files'),
        ]),
    });
});
/**
 * Schema for additional skill definitions in plugin manifest
 *
 * Allows plugins to specify extra skill directories beyond those in the
 * standard skills/ directory.
 */
var PluginManifestSkillsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        skills: v4_1.z.union([
            RelativePath().describe('Path to additional skill directory (in addition to those in the skills/ directory, if it exists), relative to the plugin root'),
            v4_1.z
                .array(RelativePath().describe('Path to additional skill directory (in addition to those in the skills/ directory, if it exists), relative to the plugin root'))
                .describe('List of paths to additional skill directories'),
        ]),
    });
});
/**
 * Schema for additional output style definitions in plugin manifest
 *
 * Allows plugins to specify extra output style files or directories beyond those in the
 * standard output-styles/ directory.
 */
var PluginManifestOutputStylesSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        outputStyles: v4_1.z.union([
            RelativePath().describe('Path to additional output styles directory or file (in addition to those in the output-styles/ directory, if it exists), relative to the plugin root'),
            v4_1.z
                .array(RelativePath().describe('Path to additional output styles directory or file (in addition to those in the output-styles/ directory, if it exists), relative to the plugin root'))
                .describe('List of paths to additional output styles directories or files'),
        ]),
    });
});
// Helper validators for LSP config
var nonEmptyString = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.string().min(1); });
var fileExtension = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .string()
        .min(2)
        .refine(function (ext) { return ext.startsWith('.'); }, {
        message: 'File extensions must start with dot (e.g., ".ts", not "ts")',
    });
});
/**
 * Schema for MCP server configurations in plugin manifest
 *
 * Allows plugins to provide MCP servers either inline or via external
 * configuration files, supplementing any servers in .mcp.json.
 */
var PluginManifestMcpServerSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        mcpServers: v4_1.z.union([
            RelativeJSONPath().describe('MCP servers to include in the plugin (in addition to those in the .mcp.json file, if it exists)'),
            McpbPath().describe('Path or URL to MCPB file containing MCP server configuration'),
            v4_1.z
                .record(v4_1.z.string(), (0, types_js_1.McpServerConfigSchema)())
                .describe('MCP server configurations keyed by server name'),
            v4_1.z
                .array(v4_1.z.union([
                RelativeJSONPath().describe('Path to MCP servers configuration file'),
                McpbPath().describe('Path or URL to MCPB file'),
                v4_1.z
                    .record(v4_1.z.string(), (0, types_js_1.McpServerConfigSchema)())
                    .describe('Inline MCP server configurations'),
            ]))
                .describe('Array of MCP server configurations (paths, MCPB files, or inline definitions)'),
        ]),
    });
});
/**
 * Schema for a single user-configurable option in plugin manifest userConfig.
 *
 * Shape intentionally matches `McpbUserConfigurationOption` from
 * `@anthropic-ai/mcpb` so the parsed result is structurally assignable to
 * `UserConfigSchema` in mcpbHandler.ts — this lets us reuse
 * `validateUserConfig` and the config dialog without modification.
 * `title` and `description` are required (not optional) because the upstream
 * type requires them and the config dialog renders them.
 *
 * Used by both the top-level manifest.userConfig and the per-channel
 * channels[].userConfig (assistant-mode channels).
 */
var PluginUserConfigOptionSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        type: v4_1.z
            .enum(['string', 'number', 'boolean', 'directory', 'file'])
            .describe('Type of the configuration value'),
        title: v4_1.z
            .string()
            .describe('Human-readable label shown in the config dialog'),
        description: v4_1.z
            .string()
            .describe('Help text shown beneath the field in the config dialog'),
        required: v4_1.z
            .boolean()
            .optional()
            .describe('If true, validation fails when this field is empty'),
        default: v4_1.z
            .union([v4_1.z.string(), v4_1.z.number(), v4_1.z.boolean(), v4_1.z.array(v4_1.z.string())])
            .optional()
            .describe('Default value used when the user provides nothing'),
        multiple: v4_1.z
            .boolean()
            .optional()
            .describe('For string type: allow an array of strings'),
        sensitive: v4_1.z
            .boolean()
            .optional()
            .describe('If true, masks dialog input and stores value in secure storage (keychain/credentials file) instead of settings.json'),
        min: v4_1.z.number().optional().describe('Minimum value (number type only)'),
        max: v4_1.z.number().optional().describe('Maximum value (number type only)'),
    })
        .strict();
});
/**
 * Schema for the top-level userConfig field in plugin manifest.
 *
 * Declares user-configurable values the plugin needs. Users are prompted at
 * enable time. Non-sensitive values go to settings.json
 * pluginConfigs[pluginId].options; sensitive values go to secure storage.
 * Values are available as ${user_config.KEY} in MCP/LSP server config, hook
 * commands, and (non-sensitive only) skill/agent content.
 */
var PluginManifestUserConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        userConfig: v4_1.z
            .record(v4_1.z
            .string()
            .regex(/^[A-Za-z_]\w*$/, 'Option keys must be valid identifiers (letters, digits, underscore; no leading digit) — they become CLAUDE_PLUGIN_OPTION_<KEY> env vars in hooks'), PluginUserConfigOptionSchema())
            .optional()
            .describe('User-configurable values this plugin needs. Prompted at enable time. ' +
            'Non-sensitive values saved to settings.json; sensitive values to secure storage ' +
            '(macOS keychain or .credentials.json). Available as ${user_config.KEY} in ' +
            'MCP/LSP server config, hook commands, and (non-sensitive only) skill/agent content. ' +
            'Note: sensitive values share a single keychain entry with OAuth tokens — keep ' +
            'secret counts small to stay under the ~2KB stdin-safe limit (see INC-3028).'),
    });
});
/**
 * Schema for channel declarations in plugin manifest.
 *
 * A channel is an MCP server that emits `notifications/claude/channel` to
 * inject messages into the conversation (Telegram, Slack, Discord, etc.).
 * Declaring it here lets the plugin prompt for user config (bot tokens,
 * owner IDs) at install time via the PluginOptionsFlow prompt,
 * rather than requiring users to hand-edit settings.json.
 *
 * The `server` field must match a key in the plugin's `mcpServers` — this is
 * not cross-validated at schema parse time (the mcpServers field can be a
 * path to a JSON file we haven't read yet), so the check happens at load
 * time in mcpPluginIntegration.ts instead.
 */
var PluginManifestChannelsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        channels: v4_1.z
            .array(v4_1.z
            .object({
            server: v4_1.z
                .string()
                .min(1)
                .describe("Name of the MCP server this channel binds to. Must match a key in this plugin's mcpServers."),
            displayName: v4_1.z
                .string()
                .optional()
                .describe('Human-readable name shown in the config dialog title (e.g., "Telegram"). Defaults to the server name.'),
            userConfig: v4_1.z
                .record(v4_1.z.string(), PluginUserConfigOptionSchema())
                .optional()
                .describe('Fields to prompt the user for when enabling this plugin in assistant mode. ' +
                'Saved values are substituted into ${user_config.KEY} references in the mcpServers env.'),
        })
            .strict())
            .describe('Channels this plugin provides. Each entry declares an MCP server as a message channel ' +
            'and optionally specifies user configuration to prompt for at enable time.'),
    });
});
/**
 * Schema for individual LSP server configuration.
 */
exports.LspServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        command: v4_1.z
            .string()
            .min(1)
            .refine(function (cmd) {
            // Commands with spaces should use args array instead
            if (cmd.includes(' ') && !cmd.startsWith('/')) {
                return false;
            }
            return true;
        }, {
            message: 'Command should not contain spaces. Use args array for arguments.',
        })
            .describe('Command to execute the LSP server (e.g., "typescript-language-server")'),
        args: v4_1.z
            .array(nonEmptyString())
            .optional()
            .describe('Command-line arguments to pass to the server'),
        extensionToLanguage: v4_1.z
            .record(fileExtension(), nonEmptyString())
            .refine(function (record) { return Object.keys(record).length > 0; }, {
            message: 'extensionToLanguage must have at least one mapping',
        })
            .describe('Mapping from file extension to LSP language ID. File extensions and languages are derived from this mapping.'),
        transport: v4_1.z
            .enum(['stdio', 'socket'])
            .default('stdio')
            .describe('Communication transport mechanism'),
        env: v4_1.z
            .record(v4_1.z.string(), v4_1.z.string())
            .optional()
            .describe('Environment variables to set when starting the server'),
        initializationOptions: v4_1.z
            .unknown()
            .optional()
            .describe('Initialization options passed to the server during initialization'),
        settings: v4_1.z
            .unknown()
            .optional()
            .describe('Settings passed to the server via workspace/didChangeConfiguration'),
        workspaceFolder: v4_1.z
            .string()
            .optional()
            .describe('Workspace folder path to use for the server'),
        startupTimeout: v4_1.z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Maximum time to wait for server startup (milliseconds)'),
        shutdownTimeout: v4_1.z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Maximum time to wait for graceful shutdown (milliseconds)'),
        restartOnCrash: v4_1.z
            .boolean()
            .optional()
            .describe('Whether to restart the server if it crashes'),
        maxRestarts: v4_1.z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe('Maximum number of restart attempts before giving up'),
    });
});
/**
 * Schema for LSP server declarations in plugin manifest.
 * Supports multiple formats:
 * - String: path to .lsp.json file
 * - Object: inline server configs { "serverName": {...} }
 * - Array: mix of strings and objects
 */
var PluginManifestLspServerSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        lspServers: v4_1.z.union([
            RelativeJSONPath().describe('Path to .lsp.json configuration file relative to plugin root'),
            v4_1.z
                .record(v4_1.z.string(), (0, exports.LspServerConfigSchema)())
                .describe('LSP server configurations keyed by server name'),
            v4_1.z
                .array(v4_1.z.union([
                RelativeJSONPath().describe('Path to LSP configuration file'),
                v4_1.z
                    .record(v4_1.z.string(), (0, exports.LspServerConfigSchema)())
                    .describe('Inline LSP server configurations'),
            ]))
                .describe('Array of LSP server configurations (paths or inline definitions)'),
        ]),
    });
});
/**
 * Schema for npm package names
 *
 * Validates npm package names including scoped packages.
 * Prevents path traversal attacks by disallowing '..' and '//'.
 *
 * Valid examples:
 * - "express"
 * - "@babel/core"
 * - "lodash.debounce"
 *
 * Invalid examples:
 * - "../../../etc/passwd"
 * - "package//name"
 */
var NpmPackageNameSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .string()
        .refine(function (name) { return !name.includes('..') && !name.includes('//'); }, 'Package name cannot contain path traversal patterns')
        .refine(function (name) {
        // Allow scoped packages (@org/package) and regular packages
        var scopedPackageRegex = /^@[a-z0-9][a-z0-9-._]*\/[a-z0-9][a-z0-9-._]*$/;
        var regularPackageRegex = /^[a-z0-9][a-z0-9-._]*$/;
        return scopedPackageRegex.test(name) || regularPackageRegex.test(name);
    }, 'Invalid npm package name format');
});
/**
 * Schema for plugin settings that get merged into the settings cascade.
 * Accepts any record here; filtering to allowlisted keys happens at load time
 * in pluginLoader.ts via PluginSettingsSchema (derived from SettingsSchema).
 */
var PluginManifestSettingsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        settings: v4_1.z
            .record(v4_1.z.string(), v4_1.z.unknown())
            .optional()
            .describe('Settings to merge when plugin is enabled. ' +
            'Only allowlisted keys are kept (currently: agent)'),
    });
});
/**
 * Plugin manifest file (plugin.json)
 *
 * This schema validates the structure of plugin manifests and provides
 * runtime type checking when loading plugins from disk.
 *
 * Unknown top-level fields are silently stripped (zod default) rather than
 * rejected. This keeps plugin loading resilient to custom/future top-level
 * fields that plugin authors may add. Nested config objects (userConfig
 * options, channels, lspServers) remain strict — unknown keys inside those
 * still fail, since a typo there is more likely to be an author mistake
 * than a vendor extension. Type mismatches and other validation errors
 * still fail at all levels. For developer feedback on unknown top-level
 * fields, use `claude plugin validate`.
 */
exports.PluginManifestSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, PluginManifestMetadataSchema().shape), PluginManifestHooksSchema().partial().shape), PluginManifestCommandsSchema().partial().shape), PluginManifestAgentsSchema().partial().shape), PluginManifestSkillsSchema().partial().shape), PluginManifestOutputStylesSchema().partial().shape), PluginManifestChannelsSchema().partial().shape), PluginManifestMcpServerSchema().partial().shape), PluginManifestLspServerSchema().partial().shape), PluginManifestSettingsSchema().partial().shape), PluginManifestUserConfigSchema().partial().shape));
});
/**
 * Schema for marketplace source locations
 *
 * Defines various ways to reference marketplace manifests including
 * direct URLs, GitHub repos, git URLs, npm packages, and local paths.
 */
exports.MarketplaceSourceSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.discriminatedUnion('source', [
        v4_1.z.object({
            source: v4_1.z.literal('url'),
            url: v4_1.z.string().url().describe('Direct URL to marketplace.json file'),
            headers: v4_1.z
                .record(v4_1.z.string(), v4_1.z.string())
                .optional()
                .describe('Custom HTTP headers (e.g., for authentication)'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('github'),
            repo: v4_1.z.string().describe('GitHub repository in owner/repo format'),
            ref: v4_1.z
                .string()
                .optional()
                .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            path: v4_1.z
                .string()
                .optional()
                .describe('Path to marketplace.json within repo (defaults to .claude-plugin/marketplace.json)'),
            sparsePaths: v4_1.z
                .array(v4_1.z.string())
                .optional()
                .describe('Directories to include via git sparse-checkout (cone mode). ' +
                'Use for monorepos where the marketplace lives in a subdirectory. ' +
                'Example: [".claude-plugin", "plugins"]. ' +
                'If omitted, the full repository is cloned.'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('git'),
            // No .endsWith('.git') here — that's a GitHub/GitLab/Bitbucket
            // convention, not a git requirement. Azure DevOps uses
            // https://dev.azure.com/{org}/{proj}/_git/{repo} with no suffix, and
            // appending .git makes ADO look for a repo literally named {repo}.git
            // (TF401019). AWS CodeCommit also omits the suffix. If the user
            // explicitly wrote source:'git', they know it's a git repo; a typo'd
            // URL fails at `git clone` with a clearer error anyway. (gh-31256)
            url: v4_1.z.string().describe('Full git repository URL'),
            ref: v4_1.z
                .string()
                .optional()
                .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            path: v4_1.z
                .string()
                .optional()
                .describe('Path to marketplace.json within repo (defaults to .claude-plugin/marketplace.json)'),
            sparsePaths: v4_1.z
                .array(v4_1.z.string())
                .optional()
                .describe('Directories to include via git sparse-checkout (cone mode). ' +
                'Use for monorepos where the marketplace lives in a subdirectory. ' +
                'Example: [".claude-plugin", "plugins"]. ' +
                'If omitted, the full repository is cloned.'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('npm'),
            package: NpmPackageNameSchema().describe('NPM package containing marketplace.json'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('file'),
            path: v4_1.z.string().describe('Local file path to marketplace.json'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('directory'),
            path: v4_1.z
                .string()
                .describe('Local directory containing .claude-plugin/marketplace.json'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('hostPattern'),
            hostPattern: v4_1.z
                .string()
                .describe('Regex pattern to match the host/domain extracted from any marketplace source type. ' +
                'For github sources, matches against "github.com". For git sources (SSH or HTTPS), ' +
                'extracts the hostname from the URL. Use in strictKnownMarketplaces to allow all ' +
                'marketplaces from a specific host (e.g., "^github\\.mycompany\\.com$").'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('pathPattern'),
            pathPattern: v4_1.z
                .string()
                .describe('Regex pattern matched against the .path field of file and directory sources. ' +
                'Use in strictKnownMarketplaces to allow filesystem-based marketplaces alongside ' +
                'hostPattern restrictions for network sources. Use ".*" to allow all filesystem ' +
                'paths, or a narrower pattern (e.g., "^/opt/approved/") to restrict to specific ' +
                'directories.'),
        }),
        v4_1.z
            .object({
            source: v4_1.z.literal('settings'),
            name: MarketplaceNameSchema()
                .refine(function (name) { return !exports.ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(name.toLowerCase()); }, {
                message: 'Reserved official marketplace names cannot be used with settings sources. ' +
                    'validateOfficialNameSource only accepts github/git sources from anthropics/* ' +
                    'for these names; a settings source would be rejected after ' +
                    'loadAndCacheMarketplace has already written to disk with cleanupNeeded=false.',
            })
                .describe('Marketplace name. Must match the extraKnownMarketplaces key (enforced); ' +
                'the synthetic manifest is written under this name. Same validation ' +
                'as PluginMarketplaceSchema plus reserved-name rejection \u2014 ' +
                'validateOfficialNameSource runs after the disk write, too late to clean up.'),
            plugins: v4_1.z
                .array(SettingsMarketplacePluginSchema())
                .describe('Plugin entries declared inline in settings.json'),
            owner: (0, exports.PluginAuthorSchema)().optional(),
        })
            .describe('Inline marketplace manifest defined directly in settings.json. ' +
            'The reconciler writes a synthetic marketplace.json to the cache; ' +
            'diffMarketplaces detects edits via isEqual on the stored source ' +
            '(the plugins array is inside this object, so edits surface as sourceChanged).'),
    ]);
});
exports.gitSha = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .string()
        .length(40)
        .regex(/^[a-f0-9]{40}$/, 'Must be a full 40-character lowercase git commit SHA');
});
/**
 * Schema for plugin source locations
 *
 * Defines various ways to reference and install plugins including
 * local paths, npm packages, Python packages, git URLs, and GitHub repos.
 */
exports.PluginSourceSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        RelativePath().describe('Path to the plugin root, relative to the marketplace root (the directory containing .claude-plugin/, not .claude-plugin/ itself)'),
        v4_1.z
            .object({
            source: v4_1.z.literal('npm'),
            package: NpmPackageNameSchema()
                .or(v4_1.z.string()) // Allow URLs and local paths as well
                .describe('Package name (or url, or local path, or anything else that can be passed to `npm` as a package)'),
            version: v4_1.z
                .string()
                .optional()
                .describe('Specific version or version range (e.g., ^1.0.0, ~2.1.0)'),
            registry: v4_1.z
                .string()
                .url()
                .optional()
                .describe('Custom NPM registry URL (defaults to using system default, likely npmjs.org)'),
        })
            .describe('NPM package as plugin source'),
        v4_1.z
            .object({
            source: v4_1.z.literal('pip'),
            package: v4_1.z
                .string()
                .describe('Python package name as it appears on PyPI'),
            version: v4_1.z
                .string()
                .optional()
                .describe('Version specifier (e.g., ==1.0.0, >=2.0.0, <3.0.0)'),
            registry: v4_1.z
                .string()
                .url()
                .optional()
                .describe('Custom PyPI registry URL (defaults to using system default, likely pypi.org)'),
        })
            .describe('Python package as plugin source'),
        v4_1.z.object({
            source: v4_1.z.literal('url'),
            // See note on MarketplaceSourceSchema source:'git' re: .endsWith('.git')
            // — dropped to support Azure DevOps / CodeCommit URLs (gh-31256).
            url: v4_1.z.string().describe('Full git repository URL (https:// or git@)'),
            ref: v4_1.z
                .string()
                .optional()
                .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            sha: (0, exports.gitSha)().optional().describe('Specific commit SHA to use'),
        }),
        v4_1.z.object({
            source: v4_1.z.literal('github'),
            repo: v4_1.z.string().describe('GitHub repository in owner/repo format'),
            ref: v4_1.z
                .string()
                .optional()
                .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            sha: (0, exports.gitSha)().optional().describe('Specific commit SHA to use'),
        }),
        v4_1.z
            .object({
            source: v4_1.z.literal('git-subdir'),
            url: v4_1.z
                .string()
                .describe('Git repository: GitHub owner/repo shorthand, https://, or git@ URL'),
            path: v4_1.z
                .string()
                .min(1)
                .describe('Subdirectory within the repo containing the plugin (e.g., "tools/claude-plugin"). ' +
                'Cloned sparsely using partial clone (--filter=tree:0) to minimize bandwidth for monorepos.'),
            ref: v4_1.z
                .string()
                .optional()
                .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            sha: (0, exports.gitSha)().optional().describe('Specific commit SHA to use'),
        })
            .describe('Plugin located in a subdirectory of a larger repository (monorepo). ' +
            'Only the specified subdirectory is materialized; the rest of the repo is not downloaded.'),
        // TODO (future work) gist
        // TODO (future work) single file?
    ]);
});
/**
 * Narrow plugin entry for settings-sourced marketplaces.
 *
 * Settings-sourced marketplaces point at remote plugins that have their own
 * plugin.json — there is no reason to inline commands/agents/hooks/mcp/lsp in
 * settings.json. This schema carries only what loadPluginFromMarketplaceEntry
 * reads (name, source, version, strict) plus description for discoverability.
 *
 * The synthetic marketplace.json written by loadAndCacheMarketplace is re-parsed
 * with the full PluginMarketplaceSchema, which widens these entries back to
 * PluginMarketplaceEntry (strict gets its .default(true), everything else stays
 * undefined). So this narrowness is settings-surface-only; downstream code sees
 * the same shape it would from any sparse marketplace.json entry.
 *
 * Keeping this narrow prevents PluginManifestSchema().partial() from expanding
 * inline in settingsTypes.generated.ts — that expansion is ~870 lines per
 * occurrence, and MarketplaceSource appears three times in the settings schema
 * (extraKnownMarketplaces, strictKnownMarketplaces, blockedMarketplaces).
 */
var SettingsMarketplacePluginSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        name: v4_1.z
            .string()
            .min(1, 'Plugin name cannot be empty')
            .refine(function (name) { return !name.includes(' '); }, {
            message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")',
        })
            .describe('Plugin name as it appears in the target repository'),
        source: (0, exports.PluginSourceSchema)().describe('Where to fetch the plugin from. Must be a remote source — relative ' +
            'paths have no marketplace repository to resolve against.'),
        description: v4_1.z.string().optional(),
        version: v4_1.z.string().optional(),
        strict: v4_1.z.boolean().optional(),
    })
        .refine(function (p) { return typeof p.source !== 'string'; }, {
        message: 'Plugins in a settings-sourced marketplace must use remote sources ' +
            '(github, git-subdir, npm, url, pip). Relative-path sources like "./foo" ' +
            'have no marketplace repository to resolve against.',
    });
});
/**
 * Check if a plugin source is a local path (stored in marketplace directory).
 *
 * Local plugins have their source as a string starting with './' (relative to marketplace).
 * External plugins have their source as an object (npm, pip, git, github, etc.).
 *
 * This function provides a semantic wrapper around the './' prefix check, making
 * the intent clear and centralizing the logic for determining plugin source type.
 *
 * @param source The plugin source from PluginMarketplaceEntry
 * @returns true if the source is a local path, false if it's an external source
 */
function isLocalPluginSource(source) {
    return typeof source === 'string' && source.startsWith('./');
}
/**
 * Whether a marketplace source points at a user-controlled local filesystem path.
 *
 * For local sources (`file`/`directory`), `installLocation` IS the user's path —
 * it lives outside the plugins cache dir and marketplace operations on it are
 * read-only. For remote sources (`github`/`git`/`url`/`npm`), `installLocation`
 * is a cache-dir entry managed by Claude Code and subject to rm/re-clone.
 *
 * Contrast with isLocalPluginSource, which operates on PluginSource (the
 * per-plugin source inside a marketplace entry) and checks for `./` prefix.
 */
function isLocalMarketplaceSource(source) {
    return source.source === 'file' || source.source === 'directory';
}
/**
 * Schema for individual plugin entries in a marketplace
 *
 * When strict=true (default): Plugin.json is required, marketplace fields supplement it
 * When strict=false: Plugin.json is optional, marketplace provides full manifest
 *
 * Unknown fields are silently stripped (zod default) rather than rejected.
 * Marketplace entries are validated as an array — if one entry rejected
 * unknown keys, the whole marketplace.json would fail to parse and ALL
 * plugins from that marketplace would become unavailable. Stripping keeps
 * the blast radius to zero for custom/future fields.
 */
exports.PluginMarketplaceEntrySchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, exports.PluginManifestSchema)()
        .partial()
        .extend({
        name: v4_1.z
            .string()
            .min(1, 'Plugin name cannot be empty')
            .refine(function (name) { return !name.includes(' '); }, {
            message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")',
        })
            .describe('Unique identifier matching the plugin name'),
        source: (0, exports.PluginSourceSchema)().describe('Where to fetch the plugin from'),
        category: v4_1.z
            .string()
            .optional()
            .describe('Category for organizing plugins (e.g., "productivity", "development")'),
        tags: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Tags for searchability and discovery'),
        strict: v4_1.z
            .boolean()
            .optional()
            .default(true)
            .describe('Require the plugin manifest to be present in the plugin folder. If false, the marketplace entry provides the manifest.'),
    });
});
/**
 * Schema for plugin marketplace configuration
 *
 * Defines the structure for curated collections of plugins that can
 * be discovered and installed from a central repository.
 */
exports.PluginMarketplaceSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        name: MarketplaceNameSchema(),
        owner: (0, exports.PluginAuthorSchema)().describe('Marketplace maintainer or curator information'),
        plugins: v4_1.z
            .array((0, exports.PluginMarketplaceEntrySchema)())
            .describe('Collection of available plugins in this marketplace'),
        forceRemoveDeletedPlugins: v4_1.z
            .boolean()
            .optional()
            .describe('When true, plugins removed from this marketplace will be automatically uninstalled and flagged for users'),
        metadata: v4_1.z
            .object({
            pluginRoot: v4_1.z
                .string()
                .optional()
                .describe('Base path for relative plugin sources'),
            version: v4_1.z.string().optional().describe('Marketplace version'),
            description: v4_1.z.string().optional().describe('Marketplace description'),
        })
            .optional()
            .describe('Optional marketplace metadata'),
        allowCrossMarketplaceDependenciesOn: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe("Marketplace names whose plugins may be auto-installed as dependencies. Only the root marketplace's allowlist applies \u2014 no transitive trust."),
    });
});
/**
 * Schema for plugin ID format
 *
 * Plugin IDs follow the format: "plugin-name@marketplace-name"
 * Both parts allow alphanumeric characters, hyphens, dots, and underscores.
 *
 * Examples:
 * - "code-formatter@anthropic-tools"
 * - "db_assistant@company-internal"
 * - "my.plugin@personal-marketplace"
 */
exports.PluginIdSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .string()
        .regex(/^[a-z0-9][-a-z0-9._]*@[a-z0-9][-a-z0-9._]*$/i, 'Plugin ID must be in format: plugin@marketplace');
});
var DEP_REF_REGEX = /^[a-z0-9][-a-z0-9._]*(@[a-z0-9][-a-z0-9._]*)?(@\^[^@]*)?$/i;
/**
 * Schema for entries in a plugin's `dependencies` array.
 *
 * Accepts three forms, all normalized to a plain "name" or "name@mkt" string
 * by the transform — downstream code (qualifyDependency, resolveDependencyClosure,
 * verifyAndDemote) never sees versions or objects:
 *
 *   "plugin"                → bare, resolved against declaring plugin's marketplace
 *   "plugin@marketplace"    → qualified
 *   "plugin@mkt@^1.2"       → trailing @^version silently stripped (forwards-compat)
 *   {name, marketplace?, …} → object form, version etc. stripped (forwards-compat)
 *
 * The latter two are permitted-but-ignored so future clients adding version
 * constraints don't cause old clients to fail schema validation and reject
 * the whole plugin. See CC-993 for the eventual version-range design.
 */
exports.DependencyRefSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        v4_1.z
            .string()
            .regex(DEP_REF_REGEX, 'Dependency must be a plugin name, optionally qualified with @marketplace')
            .transform(function (s) { return s.replace(/@\^[^@]*$/, ''); }),
        v4_1.z
            .object({
            name: v4_1.z
                .string()
                .min(1)
                .regex(/^[a-z0-9][-a-z0-9._]*$/i),
            marketplace: v4_1.z
                .string()
                .min(1)
                .regex(/^[a-z0-9][-a-z0-9._]*$/i)
                .optional(),
        })
            .loose()
            .transform(function (o) { return (o.marketplace ? "".concat(o.name, "@").concat(o.marketplace) : o.name); }),
    ]);
});
/**
 * Schema for plugin reference in settings (repo or user level)
 *
 * Can be either:
 * - Simple string: "plugin-name@marketplace-name"
 * - Object with additional configuration
 *
 * The plugin source (npm, git, local) is defined in the marketplace entry itself,
 * not in the plugin reference.
 *
 * Examples:
 * - "code-formatter@anthropic-tools"
 * - "db-assistant@company-internal"
 * - { id: "formatter@tools", version: "^2.0.0", required: true }
 */
exports.SettingsPluginEntrySchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        // Simple format: "plugin@marketplace"
        (0, exports.PluginIdSchema)(),
        // Extended format with configuration
        v4_1.z.object({
            id: (0, exports.PluginIdSchema)().describe('Plugin identifier (e.g., "formatter@tools")'),
            version: v4_1.z
                .string()
                .optional()
                .describe('Version constraint (e.g., "^2.0.0")'),
            required: v4_1.z.boolean().optional().describe('If true, cannot be disabled'),
            config: v4_1.z
                .record(v4_1.z.string(), v4_1.z.unknown())
                .optional()
                .describe('Plugin-specific configuration'),
        }),
    ]);
});
/**
 * Schema for installed plugin metadata (V1 format)
 *
 * Tracks the actual installation state of a plugin. All plugins are
 * installed from marketplaces, which contain the actual source details
 * (npm, git, local, etc.). The plugin ID is the key in the plugins record,
 * so it's not duplicated here.
 *
 * Example entry for key "code-formatter@anthropic-tools":
 * {
 *   "version": "1.2.0",
 *   "installedAt": "2024-01-15T10:30:00Z",
 *   "marketplace": "anthropic-tools",
 *   "installPath": "/home/user/.claude/plugins/installed/anthropic-tools/code-formatter"
 * }
 */
exports.InstalledPluginSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        version: v4_1.z.string().describe('Currently installed version'),
        installedAt: v4_1.z.string().describe('ISO 8601 timestamp of installation'),
        lastUpdated: v4_1.z
            .string()
            .optional()
            .describe('ISO 8601 timestamp of last update'),
        installPath: v4_1.z
            .string()
            .describe('Absolute path to the installed plugin directory'),
        gitCommitSha: v4_1.z
            .string()
            .optional()
            .describe('Git commit SHA for git-based plugins (for version tracking)'),
    });
});
/**
 * Schema for the installed_plugins.json file (V1 format)
 *
 * Contains a version number and maps plugin IDs to their installation metadata.
 * Maintained automatically by Claude Code, not edited by users.
 *
 * The version field tracks schema changes. When the version doesn't match
 * the current schema version, Claude Code will update the file on next startup.
 *
 * Example file:
 * {
 *   "version": 1,
 *   "plugins": {
 *     "code-formatter@anthropic-tools": { ... },
 *     "db-assistant@company-internal": { ... }
 *   }
 * }
 */
exports.InstalledPluginsFileSchemaV1 = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        version: v4_1.z.literal(1).describe('Schema version 1'),
        plugins: v4_1.z
            .record((0, exports.PluginIdSchema)(), // Validated plugin ID key (e.g., "formatter@tools")
        (0, exports.InstalledPluginSchema)())
            .describe('Map of plugin IDs to their installation metadata'),
    });
});
/**
 * Scope types for plugin installation (V2)
 *
 * Plugins can be installed at different scopes:
 * - managed: Enterprise/system-wide (read-only, platform-specific paths)
 * - user: User's global settings (~/.claude/settings.json)
 * - project: Shared project settings ($project/.claude/settings.json)
 * - local: Personal project overrides ($project/.claude/settings.local.json)
 *
 * Note: 'flag' scope plugins (from --settings) are session-only and
 * are NOT persisted to installed_plugins.json.
 */
exports.PluginScopeSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum(['managed', 'user', 'project', 'local']);
});
/**
 * Schema for a single plugin installation entry (V2)
 *
 * Each plugin can have multiple installations at different scopes.
 * For example, the same plugin could be installed at user scope with v1.0
 * and at project scope with v1.1.
 */
exports.PluginInstallationEntrySchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        scope: (0, exports.PluginScopeSchema)().describe('Installation scope'),
        projectPath: v4_1.z
            .string()
            .optional()
            .describe('Project path (required for project/local scopes)'),
        installPath: v4_1.z
            .string()
            .describe('Absolute path to the versioned plugin directory'),
        // Preserved from V1:
        version: v4_1.z.string().optional().describe('Currently installed version'),
        installedAt: v4_1.z
            .string()
            .optional()
            .describe('ISO 8601 timestamp of installation'),
        lastUpdated: v4_1.z
            .string()
            .optional()
            .describe('ISO 8601 timestamp of last update'),
        gitCommitSha: v4_1.z
            .string()
            .optional()
            .describe('Git commit SHA for git-based plugins'),
    });
});
/**
 * Schema for the installed_plugins.json file (V2 format)
 *
 * V2 changes from V1:
 * - Each plugin ID maps to an ARRAY of installations (one per scope)
 * - Supports multi-scope installation (same plugin at different scopes/versions)
 *
 * Example file:
 * {
 *   "version": 2,
 *   "plugins": {
 *     "code-formatter@anthropic-tools": [
 *       { "scope": "user", "installPath": "...", "version": "1.0.0" },
 *       { "scope": "project", "projectPath": "/path/to/project", "installPath": "...", "version": "1.1.0" }
 *     ]
 *   }
 * }
 */
exports.InstalledPluginsFileSchemaV2 = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        version: v4_1.z.literal(2).describe('Schema version 2'),
        plugins: v4_1.z
            .record((0, exports.PluginIdSchema)(), v4_1.z.array((0, exports.PluginInstallationEntrySchema)()))
            .describe('Map of plugin IDs to arrays of installation entries'),
    });
});
/**
 * Combined schema that accepts both V1 and V2 formats
 * Used for reading existing files before migration
 */
exports.InstalledPluginsFileSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([(0, exports.InstalledPluginsFileSchemaV1)(), (0, exports.InstalledPluginsFileSchemaV2)()]);
});
/**
 * Schema for a known marketplace entry
 *
 * Tracks metadata about a registered marketplace in the user's configuration.
 * Each entry contains the source location, cache path, and last update time.
 *
 * Example entry:
 * {
 *   "source": { "source": "github", "repo": "anthropic/claude-plugins" },
 *   "installLocation": "/home/user/.claude/plugins/cached/marketplaces/anthropic-tools",
 *   "lastUpdated": "2024-01-15T10:30:00Z"
 * }
 */
exports.KnownMarketplaceSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        source: (0, exports.MarketplaceSourceSchema)().describe('Where to fetch the marketplace from'),
        installLocation: v4_1.z
            .string()
            .describe('Local cache path where marketplace manifest is stored'),
        lastUpdated: v4_1.z
            .string()
            .describe('ISO 8601 timestamp of last marketplace refresh'),
        autoUpdate: v4_1.z
            .boolean()
            .optional()
            .describe('Whether to automatically update this marketplace and its installed plugins on startup'),
    });
});
/**
 * Schema for the known_marketplaces.json file
 *
 * Maps marketplace names to their source and cache metadata.
 * Used to track which marketplaces are registered and where to find them.
 *
 * Example file:
 * {
 *   "anthropic-tools": { "source": { ... }, "installLocation": "...", "lastUpdated": "..." },
 *   "company-internal": { "source": { ... }, "installLocation": "...", "lastUpdated": "..." }
 * }
 */
exports.KnownMarketplacesFileSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.record(v4_1.z.string(), // Marketplace name as key
    (0, exports.KnownMarketplaceSchema)());
});
