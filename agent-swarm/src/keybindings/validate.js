"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDuplicateKeysInJson = checkDuplicateKeysInJson;
exports.validateUserConfig = validateUserConfig;
exports.checkDuplicates = checkDuplicates;
exports.checkReservedShortcuts = checkReservedShortcuts;
exports.validateBindings = validateBindings;
exports.formatWarning = formatWarning;
exports.formatWarnings = formatWarnings;
var stringUtils_js_1 = require("../utils/stringUtils.js");
var parser_js_1 = require("./parser.js");
var reservedShortcuts_js_1 = require("./reservedShortcuts.js");
/**
 * Type guard to check if an object is a valid KeybindingBlock.
 */
function isKeybindingBlock(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    var b = obj;
    return (typeof b.context === 'string' &&
        typeof b.bindings === 'object' &&
        b.bindings !== null);
}
/**
 * Type guard to check if an array contains only valid KeybindingBlocks.
 */
function isKeybindingBlockArray(arr) {
    return Array.isArray(arr) && arr.every(isKeybindingBlock);
}
/**
 * Valid context names for keybindings.
 * Must match KeybindingContextName in types.ts
 */
var VALID_CONTEXTS = [
    'Global',
    'Chat',
    'Autocomplete',
    'Confirmation',
    'Help',
    'Transcript',
    'HistorySearch',
    'Task',
    'ThemePicker',
    'Settings',
    'Tabs',
    'Attachments',
    'Footer',
    'MessageSelector',
    'DiffDialog',
    'ModelPicker',
    'Select',
    'Plugin',
];
/**
 * Type guard to check if a string is a valid context name.
 */
function isValidContext(value) {
    return VALID_CONTEXTS.includes(value);
}
/**
 * Validate a single keystroke string and return any parse errors.
 */
function validateKeystroke(keystroke) {
    var parts = keystroke.toLowerCase().split('+');
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var trimmed = part.trim();
        if (!trimmed) {
            return {
                type: 'parse_error',
                severity: 'error',
                message: "Empty key part in \"".concat(keystroke, "\""),
                key: keystroke,
                suggestion: 'Remove extra "+" characters',
            };
        }
    }
    // Try to parse and see if it fails
    var parsed = (0, parser_js_1.parseKeystroke)(keystroke);
    if (!parsed.key &&
        !parsed.ctrl &&
        !parsed.alt &&
        !parsed.shift &&
        !parsed.meta) {
        return {
            type: 'parse_error',
            severity: 'error',
            message: "Could not parse keystroke \"".concat(keystroke, "\""),
            key: keystroke,
        };
    }
    return null;
}
/**
 * Validate a keybinding block from user config.
 */
function validateBlock(block, blockIndex) {
    var warnings = [];
    if (typeof block !== 'object' || block === null) {
        warnings.push({
            type: 'parse_error',
            severity: 'error',
            message: "Keybinding block ".concat(blockIndex + 1, " is not an object"),
        });
        return warnings;
    }
    var b = block;
    // Validate context - extract to narrowed variable for type safety
    var rawContext = b.context;
    var contextName;
    if (typeof rawContext !== 'string') {
        warnings.push({
            type: 'parse_error',
            severity: 'error',
            message: "Keybinding block ".concat(blockIndex + 1, " missing \"context\" field"),
        });
    }
    else if (!isValidContext(rawContext)) {
        warnings.push({
            type: 'invalid_context',
            severity: 'error',
            message: "Unknown context \"".concat(rawContext, "\""),
            context: rawContext,
            suggestion: "Valid contexts: ".concat(VALID_CONTEXTS.join(', ')),
        });
    }
    else {
        contextName = rawContext;
    }
    // Validate bindings
    if (typeof b.bindings !== 'object' || b.bindings === null) {
        warnings.push({
            type: 'parse_error',
            severity: 'error',
            message: "Keybinding block ".concat(blockIndex + 1, " missing \"bindings\" field"),
        });
        return warnings;
    }
    var bindings = b.bindings;
    for (var _i = 0, _a = Object.entries(bindings); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], action = _b[1];
        // Validate key syntax
        var keyError = validateKeystroke(key);
        if (keyError) {
            keyError.context = contextName;
            warnings.push(keyError);
        }
        // Validate action
        if (action !== null && typeof action !== 'string') {
            warnings.push({
                type: 'invalid_action',
                severity: 'error',
                message: "Invalid action for \"".concat(key, "\": must be a string or null"),
                key: key,
                context: contextName,
            });
        }
        else if (typeof action === 'string' && action.startsWith('command:')) {
            // Validate command binding format
            if (!/^command:[a-zA-Z0-9:\-_]+$/.test(action)) {
                warnings.push({
                    type: 'invalid_action',
                    severity: 'warning',
                    message: "Invalid command binding \"".concat(action, "\" for \"").concat(key, "\": command name may only contain alphanumeric characters, colons, hyphens, and underscores"),
                    key: key,
                    context: contextName,
                    action: action,
                });
            }
            // Command bindings must be in Chat context
            if (contextName && contextName !== 'Chat') {
                warnings.push({
                    type: 'invalid_action',
                    severity: 'warning',
                    message: "Command binding \"".concat(action, "\" must be in \"Chat\" context, not \"").concat(contextName, "\""),
                    key: key,
                    context: contextName,
                    action: action,
                    suggestion: 'Move this binding to a block with "context": "Chat"',
                });
            }
        }
        else if (action === 'voice:pushToTalk') {
            // Hold detection needs OS auto-repeat. Bare letters print into the
            // input during warmup and the activation strip is best-effort —
            // space (default) or a modifier combo like meta+k avoid that.
            var ks = (0, parser_js_1.parseChord)(key)[0];
            if (ks &&
                !ks.ctrl &&
                !ks.alt &&
                !ks.shift &&
                !ks.meta &&
                !ks.super &&
                /^[a-z]$/.test(ks.key)) {
                warnings.push({
                    type: 'invalid_action',
                    severity: 'warning',
                    message: "Binding \"".concat(key, "\" to voice:pushToTalk prints into the input during warmup; use space or a modifier combo like meta+k"),
                    key: key,
                    context: contextName,
                    action: action,
                });
            }
        }
    }
    return warnings;
}
/**
 * Detect duplicate keys within the same bindings block in a JSON string.
 * JSON.parse silently uses the last value for duplicate keys,
 * so we need to check the raw string to warn users.
 *
 * Only warns about duplicates within the same context's bindings object.
 * Duplicates across different contexts are allowed (e.g., "enter" in Chat
 * and "enter" in Confirmation).
 */
function checkDuplicateKeysInJson(jsonString) {
    var _a, _b;
    var warnings = [];
    // Find each "bindings" block and check for duplicates within it
    // Pattern: "bindings" : { ... }
    var bindingsBlockPattern = /"bindings"\s*:\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    var blockMatch;
    while ((blockMatch = bindingsBlockPattern.exec(jsonString)) !== null) {
        var blockContent = blockMatch[1];
        if (!blockContent)
            continue;
        // Find the context for this block by looking backwards
        var textBeforeBlock = jsonString.slice(0, blockMatch.index);
        var contextMatch = textBeforeBlock.match(/"context"\s*:\s*"([^"]+)"[^{]*$/);
        var context = (_a = contextMatch === null || contextMatch === void 0 ? void 0 : contextMatch[1]) !== null && _a !== void 0 ? _a : 'unknown';
        // Find all keys within this bindings block
        var keyPattern = /"([^"]+)"\s*:/g;
        var keysByName = new Map();
        var keyMatch = void 0;
        while ((keyMatch = keyPattern.exec(blockContent)) !== null) {
            var key = keyMatch[1];
            if (!key)
                continue;
            var count = ((_b = keysByName.get(key)) !== null && _b !== void 0 ? _b : 0) + 1;
            keysByName.set(key, count);
            if (count === 2) {
                // Only warn on the second occurrence
                warnings.push({
                    type: 'duplicate',
                    severity: 'warning',
                    message: "Duplicate key \"".concat(key, "\" in ").concat(context, " bindings"),
                    key: key,
                    context: context,
                    suggestion: "This key appears multiple times in the same context. JSON uses the last value, earlier values are ignored.",
                });
            }
        }
    }
    return warnings;
}
/**
 * Validate user keybinding config and return all warnings.
 */
function validateUserConfig(userBlocks) {
    var warnings = [];
    if (!Array.isArray(userBlocks)) {
        warnings.push({
            type: 'parse_error',
            severity: 'error',
            message: 'keybindings.json must contain an array',
            suggestion: 'Wrap your bindings in [ ]',
        });
        return warnings;
    }
    for (var i = 0; i < userBlocks.length; i++) {
        warnings.push.apply(warnings, validateBlock(userBlocks[i], i));
    }
    return warnings;
}
/**
 * Check for duplicate bindings within the same context.
 * Only checks user bindings (not default + user merged).
 */
function checkDuplicates(blocks) {
    var _a;
    var warnings = [];
    var seenByContext = new Map();
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var block = blocks_1[_i];
        var contextMap = (_a = seenByContext.get(block.context)) !== null && _a !== void 0 ? _a : new Map();
        seenByContext.set(block.context, contextMap);
        for (var _b = 0, _c = Object.entries(block.bindings); _b < _c.length; _b++) {
            var _d = _c[_b], key = _d[0], action = _d[1];
            var normalizedKey = (0, reservedShortcuts_js_1.normalizeKeyForComparison)(key);
            var existingAction = contextMap.get(normalizedKey);
            if (existingAction && existingAction !== action) {
                warnings.push({
                    type: 'duplicate',
                    severity: 'warning',
                    message: "Duplicate binding \"".concat(key, "\" in ").concat(block.context, " context"),
                    key: key,
                    context: block.context,
                    action: action !== null && action !== void 0 ? action : 'null (unbind)',
                    suggestion: "Previously bound to \"".concat(existingAction, "\". Only the last binding will be used."),
                });
            }
            contextMap.set(normalizedKey, action !== null && action !== void 0 ? action : 'null');
        }
    }
    return warnings;
}
/**
 * Check for reserved shortcuts that may not work.
 */
function checkReservedShortcuts(bindings) {
    var _a;
    var warnings = [];
    var reserved = (0, reservedShortcuts_js_1.getReservedShortcuts)();
    for (var _i = 0, bindings_1 = bindings; _i < bindings_1.length; _i++) {
        var binding = bindings_1[_i];
        var keyDisplay = (0, parser_js_1.chordToString)(binding.chord);
        var normalizedKey = (0, reservedShortcuts_js_1.normalizeKeyForComparison)(keyDisplay);
        // Check against reserved shortcuts
        for (var _b = 0, reserved_1 = reserved; _b < reserved_1.length; _b++) {
            var res = reserved_1[_b];
            if ((0, reservedShortcuts_js_1.normalizeKeyForComparison)(res.key) === normalizedKey) {
                warnings.push({
                    type: 'reserved',
                    severity: res.severity,
                    message: "\"".concat(keyDisplay, "\" may not work: ").concat(res.reason),
                    key: keyDisplay,
                    context: binding.context,
                    action: (_a = binding.action) !== null && _a !== void 0 ? _a : undefined,
                });
            }
        }
    }
    return warnings;
}
/**
 * Parse user blocks into bindings for validation.
 * This is separate from the main parser to avoid importing it.
 */
function getUserBindingsForValidation(userBlocks) {
    var bindings = [];
    for (var _i = 0, userBlocks_1 = userBlocks; _i < userBlocks_1.length; _i++) {
        var block = userBlocks_1[_i];
        for (var _a = 0, _b = Object.entries(block.bindings); _a < _b.length; _a++) {
            var _c = _b[_a], key = _c[0], action = _c[1];
            var chord = key.split(' ').map(function (k) { return (0, parser_js_1.parseKeystroke)(k); });
            bindings.push({
                chord: chord,
                action: action,
                context: block.context,
            });
        }
    }
    return bindings;
}
/**
 * Run all validations and return combined warnings.
 */
function validateBindings(userBlocks, _parsedBindings) {
    var warnings = [];
    // Validate user config structure
    warnings.push.apply(warnings, validateUserConfig(userBlocks));
    // Check for duplicates in user config
    if (isKeybindingBlockArray(userBlocks)) {
        warnings.push.apply(warnings, checkDuplicates(userBlocks));
        // Check for reserved/conflicting shortcuts - only check USER bindings
        var userBindings = getUserBindingsForValidation(userBlocks);
        warnings.push.apply(warnings, checkReservedShortcuts(userBindings));
    }
    // Deduplicate warnings (same key+context+type)
    var seen = new Set();
    return warnings.filter(function (w) {
        var key = "".concat(w.type, ":").concat(w.key, ":").concat(w.context);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
/**
 * Format a warning for display to the user.
 */
function formatWarning(warning) {
    var icon = warning.severity === 'error' ? '✗' : '⚠';
    var msg = "".concat(icon, " Keybinding ").concat(warning.severity, ": ").concat(warning.message);
    if (warning.suggestion) {
        msg += "\n  ".concat(warning.suggestion);
    }
    return msg;
}
/**
 * Format multiple warnings for display.
 */
function formatWarnings(warnings) {
    if (warnings.length === 0)
        return '';
    var errors = warnings.filter(function (w) { return w.severity === 'error'; });
    var warns = warnings.filter(function (w) { return w.severity === 'warning'; });
    var lines = [];
    if (errors.length > 0) {
        lines.push("Found ".concat(errors.length, " keybinding ").concat((0, stringUtils_js_1.plural)(errors.length, 'error'), ":"));
        for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
            var e = errors_1[_i];
            lines.push(formatWarning(e));
        }
    }
    if (warns.length > 0) {
        if (lines.length > 0)
            lines.push('');
        lines.push("Found ".concat(warns.length, " keybinding ").concat((0, stringUtils_js_1.plural)(warns.length, 'warning'), ":"));
        for (var _a = 0, warns_1 = warns; _a < warns_1.length; _a++) {
            var w = warns_1[_a];
            lines.push(formatWarning(w));
        }
    }
    return lines.join('\n');
}
