"use strict";
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
exports.findMidInputSlashCommand = findMidInputSlashCommand;
exports.getBestCommandMatch = getBestCommandMatch;
exports.isCommandInput = isCommandInput;
exports.hasCommandArgs = hasCommandArgs;
exports.formatCommand = formatCommand;
exports.generateCommandSuggestions = generateCommandSuggestions;
exports.applyCommandSuggestion = applyCommandSuggestion;
exports.findSlashCommandPositions = findSlashCommandPositions;
var fuse_js_1 = require("fuse.js");
var commands_js_1 = require("../../commands.js");
var skillUsageTracking_js_1 = require("./skillUsageTracking.js");
// Treat these characters as word separators for command search
var SEPARATORS = /[:_-]/g;
// Cache the Fuse index keyed by the commands array identity. The commands
// array is stable (memoized in REPL.tsx), so we only rebuild when it changes
// rather than on every keystroke.
var fuseCache = null;
function getCommandFuse(commands) {
    if ((fuseCache === null || fuseCache === void 0 ? void 0 : fuseCache.commands) === commands) {
        return fuseCache.fuse;
    }
    var commandData = commands
        .filter(function (cmd) { return !cmd.isHidden; })
        .map(function (cmd) {
        var _a;
        var commandName = (0, commands_js_1.getCommandName)(cmd);
        var parts = commandName.split(SEPARATORS).filter(Boolean);
        return {
            descriptionKey: ((_a = cmd.description) !== null && _a !== void 0 ? _a : '')
                .split(' ')
                .map(function (word) { return cleanWord(word); })
                .filter(Boolean),
            partKey: parts.length > 1 ? parts : undefined,
            commandName: commandName,
            command: cmd,
            aliasKey: cmd.aliases,
        };
    });
    var fuse = new fuse_js_1.default(commandData, {
        includeScore: true,
        threshold: 0.3, // relatively strict matching
        location: 0, // prefer matches at the beginning of strings
        distance: 100, // increased to allow matching in descriptions
        keys: [
            {
                name: 'commandName',
                weight: 3, // Highest priority for command names
            },
            {
                name: 'partKey',
                weight: 2, // Next highest priority for command parts
            },
            {
                name: 'aliasKey',
                weight: 2, // Same high priority for aliases
            },
            {
                name: 'descriptionKey',
                weight: 0.5, // Lower priority for descriptions
            },
        ],
    });
    fuseCache = { commands: commands, fuse: fuse };
    return fuse;
}
/**
 * Type guard to check if a suggestion's metadata is a Command.
 * Commands have a name string and a type property.
 */
function isCommandMetadata(metadata) {
    return (typeof metadata === 'object' &&
        metadata !== null &&
        'name' in metadata &&
        typeof metadata.name === 'string' &&
        'type' in metadata);
}
/**
 * Finds a slash command token that appears mid-input (not at position 0).
 * A mid-input slash command is a "/" preceded by whitespace, where the cursor
 * is at or after the "/".
 *
 * @param input The full input string
 * @param cursorOffset The current cursor position
 * @returns The mid-input slash command info, or null if not found
 */
function findMidInputSlashCommand(input, cursorOffset) {
    // If input starts with "/", this is start-of-input case (handled elsewhere)
    if (input.startsWith('/')) {
        return null;
    }
    // Look backwards from cursor to find a "/" preceded by whitespace
    var beforeCursor = input.slice(0, cursorOffset);
    // Find the last "/" in the text before cursor
    // Pattern: whitespace followed by "/" then optional alphanumeric/dash characters.
    // Lookbehind (?<=\s) is avoided — it defeats YARR JIT in JSC, and the
    // interpreter scans O(n) even with the $ anchor. Capture the whitespace
    // instead and offset match.index by 1.
    var match = beforeCursor.match(/\s\/([a-zA-Z0-9_:-]*)$/);
    if (!match || match.index === undefined) {
        return null;
    }
    // Get the full token (may extend past cursor)
    var slashPos = match.index + 1;
    var textAfterSlash = input.slice(slashPos + 1);
    // Extract the command portion (until whitespace or end)
    var commandMatch = textAfterSlash.match(/^[a-zA-Z0-9_:-]*/);
    var fullCommand = commandMatch ? commandMatch[0] : '';
    // If cursor is past the command (after a space), don't show ghost text
    if (cursorOffset > slashPos + 1 + fullCommand.length) {
        return null;
    }
    return {
        token: '/' + fullCommand,
        startPos: slashPos,
        partialCommand: fullCommand,
    };
}
/**
 * Finds the best matching command for a partial command string.
 * Delegates to generateCommandSuggestions and filters to prefix matches.
 *
 * @param partialCommand The partial command typed by the user (without "/")
 * @param commands Available commands
 * @returns The completion suffix (e.g., "mit" for partial "com" matching "commit"), or null
 */
function getBestCommandMatch(partialCommand, commands) {
    if (!partialCommand) {
        return null;
    }
    // Use existing suggestion logic
    var suggestions = generateCommandSuggestions('/' + partialCommand, commands);
    if (suggestions.length === 0) {
        return null;
    }
    // Find first suggestion that is a prefix match (for inline completion)
    var query = partialCommand.toLowerCase();
    for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
        var suggestion = suggestions_1[_i];
        if (!isCommandMetadata(suggestion.metadata)) {
            continue;
        }
        var name_1 = (0, commands_js_1.getCommandName)(suggestion.metadata);
        if (name_1.toLowerCase().startsWith(query)) {
            var suffix = name_1.slice(partialCommand.length);
            // Only return if there's something to complete
            if (suffix) {
                return { suffix: suffix, fullCommand: name_1 };
            }
        }
    }
    return null;
}
/**
 * Checks if input is a command (starts with slash)
 */
function isCommandInput(input) {
    return input.startsWith('/');
}
/**
 * Checks if a command input has arguments
 * A command with just a trailing space is considered to have no arguments
 */
function hasCommandArgs(input) {
    if (!isCommandInput(input))
        return false;
    if (!input.includes(' '))
        return false;
    if (input.endsWith(' '))
        return false;
    return true;
}
/**
 * Formats a command with proper notation
 */
function formatCommand(command) {
    return "/".concat(command, " ");
}
/**
 * Generates a deterministic unique ID for a command suggestion.
 * Commands with the same name from different sources get unique IDs.
 *
 * Only prompt commands can have duplicates (from user settings, project
 * settings, plugins, etc). Built-in commands (local, local-jsx) are
 * defined once in code and can't have duplicates.
 */
function getCommandId(cmd) {
    var _a;
    var commandName = (0, commands_js_1.getCommandName)(cmd);
    if (cmd.type === 'prompt') {
        // For plugin commands, include the repository to disambiguate
        if (cmd.source === 'plugin' && ((_a = cmd.pluginInfo) === null || _a === void 0 ? void 0 : _a.repository)) {
            return "".concat(commandName, ":").concat(cmd.source, ":").concat(cmd.pluginInfo.repository);
        }
        return "".concat(commandName, ":").concat(cmd.source);
    }
    // Built-in commands include type as fallback for future-proofing
    return "".concat(commandName, ":").concat(cmd.type);
}
/**
 * Checks if a query matches any of the command's aliases.
 * Returns the matched alias if found, otherwise undefined.
 */
function findMatchedAlias(query, aliases) {
    if (!aliases || aliases.length === 0 || query === '') {
        return undefined;
    }
    // Check if query is a prefix of any alias (case-insensitive)
    return aliases.find(function (alias) { return alias.toLowerCase().startsWith(query); });
}
/**
 * Creates a suggestion item from a command.
 * Only shows the matched alias in parentheses if the user typed an alias.
 */
function createCommandSuggestionItem(cmd, matchedAlias) {
    var _a;
    var commandName = (0, commands_js_1.getCommandName)(cmd);
    // Only show the alias if the user typed it
    var aliasText = matchedAlias ? " (".concat(matchedAlias, ")") : '';
    var isWorkflow = cmd.type === 'prompt' && cmd.kind === 'workflow';
    var fullDescription = (isWorkflow ? cmd.description : (0, commands_js_1.formatDescriptionWithSource)(cmd)) +
        (cmd.type === 'prompt' && ((_a = cmd.argNames) === null || _a === void 0 ? void 0 : _a.length)
            ? " (arguments: ".concat(cmd.argNames.join(', '), ")")
            : '');
    return {
        id: getCommandId(cmd),
        displayText: "/".concat(commandName).concat(aliasText),
        tag: isWorkflow ? 'workflow' : undefined,
        description: fullDescription,
        metadata: cmd,
    };
}
/**
 * Generate command suggestions based on input
 */
function generateCommandSuggestions(input, commands) {
    // Only process command input
    if (!isCommandInput(input)) {
        return [];
    }
    // If there are arguments, don't show suggestions
    if (hasCommandArgs(input)) {
        return [];
    }
    var query = input.slice(1).toLowerCase().trim();
    // When just typing '/' without additional text
    if (query === '') {
        var visibleCommands = commands.filter(function (cmd) { return !cmd.isHidden; });
        // Find recently used skills (only prompt commands have usage tracking)
        var recentlyUsed = [];
        var commandsWithScores = visibleCommands
            .filter(function (cmd) { return cmd.type === 'prompt'; })
            .map(function (cmd) { return ({
            cmd: cmd,
            score: (0, skillUsageTracking_js_1.getSkillUsageScore)((0, commands_js_1.getCommandName)(cmd)),
        }); })
            .filter(function (item) { return item.score > 0; })
            .sort(function (a, b) { return b.score - a.score; });
        // Take top 5 recently used skills
        for (var _i = 0, _a = commandsWithScores.slice(0, 5); _i < _a.length; _i++) {
            var item = _a[_i];
            recentlyUsed.push(item.cmd);
        }
        // Create a set of recently used command IDs to avoid duplicates
        var recentlyUsedIds_1 = new Set(recentlyUsed.map(function (cmd) { return getCommandId(cmd); }));
        // Categorize remaining commands (excluding recently used)
        var builtinCommands_1 = [];
        var userCommands_1 = [];
        var projectCommands_1 = [];
        var policyCommands_1 = [];
        var otherCommands_1 = [];
        visibleCommands.forEach(function (cmd) {
            // Skip if already in recently used
            if (recentlyUsedIds_1.has(getCommandId(cmd))) {
                return;
            }
            if (cmd.type === 'local' || cmd.type === 'local-jsx') {
                builtinCommands_1.push(cmd);
            }
            else if (cmd.type === 'prompt' &&
                (cmd.source === 'userSettings' || cmd.source === 'localSettings')) {
                userCommands_1.push(cmd);
            }
            else if (cmd.type === 'prompt' && cmd.source === 'projectSettings') {
                projectCommands_1.push(cmd);
            }
            else if (cmd.type === 'prompt' && cmd.source === 'policySettings') {
                policyCommands_1.push(cmd);
            }
            else {
                otherCommands_1.push(cmd);
            }
        });
        // Sort each category alphabetically
        var sortAlphabetically = function (a, b) {
            return (0, commands_js_1.getCommandName)(a).localeCompare((0, commands_js_1.getCommandName)(b));
        };
        builtinCommands_1.sort(sortAlphabetically);
        userCommands_1.sort(sortAlphabetically);
        projectCommands_1.sort(sortAlphabetically);
        policyCommands_1.sort(sortAlphabetically);
        otherCommands_1.sort(sortAlphabetically);
        // Combine with built-in commands prioritized after recently used,
        // so they remain visible even when many skills are installed
        return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], recentlyUsed, true), builtinCommands_1, true), userCommands_1, true), projectCommands_1, true), policyCommands_1, true), otherCommands_1, true).map(function (cmd) { return createCommandSuggestionItem(cmd); });
    }
    // The Fuse index filters isHidden at build time and is keyed on the
    // (memoized) commands array identity, so a command that is hidden when Fuse
    // first builds stays invisible to Fuse for the whole session. If the user
    // types the exact name of a currently-hidden command, prepend it to the
    // Fuse results so exact-name always wins over weak description fuzzy
    // matches — but only when no visible command shares the name (that would
    // be the user's explicit override and should win). Prepend rather than
    // early-return so visible prefix siblings (e.g. /voice-memo) still appear
    // below, and getBestCommandMatch can still find a non-empty suffix.
    var hiddenExact = commands.find(function (cmd) { return cmd.isHidden && (0, commands_js_1.getCommandName)(cmd).toLowerCase() === query; });
    if (hiddenExact &&
        commands.some(function (cmd) { return !cmd.isHidden && (0, commands_js_1.getCommandName)(cmd).toLowerCase() === query; })) {
        hiddenExact = undefined;
    }
    var fuse = getCommandFuse(commands);
    var searchResults = fuse.search(query);
    // Sort results prioritizing exact/prefix command name matches over fuzzy description matches
    // Priority order:
    // 1. Exact name match (highest)
    // 2. Exact alias match
    // 3. Prefix name match
    // 4. Prefix alias match
    // 5. Fuzzy match (lowest)
    // Precompute per-item values once to avoid O(n log n) recomputation in comparator
    var withMeta = searchResults.map(function (r) {
        var _a, _b;
        var name = r.item.commandName.toLowerCase();
        var aliases = (_b = (_a = r.item.aliasKey) === null || _a === void 0 ? void 0 : _a.map(function (alias) { return alias.toLowerCase(); })) !== null && _b !== void 0 ? _b : [];
        var usage = r.item.command.type === 'prompt'
            ? (0, skillUsageTracking_js_1.getSkillUsageScore)((0, commands_js_1.getCommandName)(r.item.command))
            : 0;
        return { r: r, name: name, aliases: aliases, usage: usage };
    });
    var sortedResults = withMeta.sort(function (a, b) {
        var _a, _b;
        var aName = a.name;
        var bName = b.name;
        var aAliases = a.aliases;
        var bAliases = b.aliases;
        // Check for exact name match (highest priority)
        var aExactName = aName === query;
        var bExactName = bName === query;
        if (aExactName && !bExactName)
            return -1;
        if (bExactName && !aExactName)
            return 1;
        // Check for exact alias match
        var aExactAlias = aAliases.some(function (alias) { return alias === query; });
        var bExactAlias = bAliases.some(function (alias) { return alias === query; });
        if (aExactAlias && !bExactAlias)
            return -1;
        if (bExactAlias && !aExactAlias)
            return 1;
        // Check for prefix name match
        var aPrefixName = aName.startsWith(query);
        var bPrefixName = bName.startsWith(query);
        if (aPrefixName && !bPrefixName)
            return -1;
        if (bPrefixName && !aPrefixName)
            return 1;
        // Among prefix name matches, prefer the shorter name (closer to exact)
        if (aPrefixName && bPrefixName && aName.length !== bName.length) {
            return aName.length - bName.length;
        }
        // Check for prefix alias match
        var aPrefixAlias = aAliases.find(function (alias) { return alias.startsWith(query); });
        var bPrefixAlias = bAliases.find(function (alias) { return alias.startsWith(query); });
        if (aPrefixAlias && !bPrefixAlias)
            return -1;
        if (bPrefixAlias && !aPrefixAlias)
            return 1;
        // Among prefix alias matches, prefer the shorter alias
        if (aPrefixAlias &&
            bPrefixAlias &&
            aPrefixAlias.length !== bPrefixAlias.length) {
            return aPrefixAlias.length - bPrefixAlias.length;
        }
        // For similar match types, use Fuse score with usage as tiebreaker
        var scoreDiff = ((_a = a.r.score) !== null && _a !== void 0 ? _a : 0) - ((_b = b.r.score) !== null && _b !== void 0 ? _b : 0);
        if (Math.abs(scoreDiff) > 0.1) {
            return scoreDiff;
        }
        // For similar Fuse scores, prefer more frequently used skills
        return b.usage - a.usage;
    });
    // Map search results to suggestion items
    // Note: We intentionally don't deduplicate here because commands with the same name
    // from different sources (e.g., projectSettings vs userSettings) may have different
    // implementations and should both be available to the user
    var fuseSuggestions = sortedResults.map(function (result) {
        var cmd = result.r.item.command;
        // Only show alias in parentheses if the user typed an alias
        var matchedAlias = findMatchedAlias(query, cmd.aliases);
        return createCommandSuggestionItem(cmd, matchedAlias);
    });
    // Skip the prepend if hiddenExact is already in fuseSuggestions — this
    // happens when isHidden flips false→true mid-session (OAuth expiry,
    // GrowthBook kill-switch) and the stale Fuse index still holds the
    // command. Fuse already sorts exact-name matches first, so no reorder
    // is needed; we just don't want a duplicate id (duplicate React keys,
    // both rows rendering as selected).
    if (hiddenExact) {
        var hiddenId_1 = getCommandId(hiddenExact);
        if (!fuseSuggestions.some(function (s) { return s.id === hiddenId_1; })) {
            return __spreadArray([createCommandSuggestionItem(hiddenExact)], fuseSuggestions, true);
        }
    }
    return fuseSuggestions;
}
/**
 * Apply selected command to input
 */
function applyCommandSuggestion(suggestion, shouldExecute, commands, onInputChange, setCursorOffset, onSubmit) {
    var _a;
    // Extract command name and object from string or SuggestionItem metadata
    var commandName;
    var commandObj;
    if (typeof suggestion === 'string') {
        commandName = suggestion;
        commandObj = shouldExecute ? (0, commands_js_1.getCommand)(commandName, commands) : undefined;
    }
    else {
        if (!isCommandMetadata(suggestion.metadata)) {
            return; // Invalid suggestion, nothing to apply
        }
        commandName = (0, commands_js_1.getCommandName)(suggestion.metadata);
        commandObj = suggestion.metadata;
    }
    // Format the command input with trailing space
    var newInput = formatCommand(commandName);
    onInputChange(newInput);
    setCursorOffset(newInput.length);
    // Execute command if requested and it takes no arguments
    if (shouldExecute && commandObj) {
        if (commandObj.type !== 'prompt' ||
            ((_a = commandObj.argNames) !== null && _a !== void 0 ? _a : []).length === 0) {
            onSubmit(newInput, /* isSubmittingSlashCommand */ true);
        }
    }
}
// Helper function at bottom of file per CLAUDE.md
function cleanWord(word) {
    return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}
/**
 * Find all /command patterns in text for highlighting.
 * Returns array of {start, end} positions.
 * Requires whitespace or start-of-string before the slash to avoid
 * matching paths like /usr/bin.
 */
function findSlashCommandPositions(text) {
    var _a, _b;
    var positions = [];
    // Match /command patterns preceded by whitespace or start-of-string
    var regex = /(^|[\s])(\/[a-zA-Z][a-zA-Z0-9:\-_]*)/g;
    var match = null;
    while ((match = regex.exec(text)) !== null) {
        var precedingChar = (_a = match[1]) !== null && _a !== void 0 ? _a : '';
        var commandName = (_b = match[2]) !== null && _b !== void 0 ? _b : '';
        // Start position is after the whitespace (if any)
        var start = match.index + precedingChar.length;
        positions.push({ start: start, end: start + commandName.length });
    }
    return positions;
}
