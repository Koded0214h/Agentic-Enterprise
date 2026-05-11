"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatGoToDefinitionResult = formatGoToDefinitionResult;
exports.formatFindReferencesResult = formatFindReferencesResult;
exports.formatHoverResult = formatHoverResult;
exports.formatDocumentSymbolResult = formatDocumentSymbolResult;
exports.formatWorkspaceSymbolResult = formatWorkspaceSymbolResult;
exports.formatPrepareCallHierarchyResult = formatPrepareCallHierarchyResult;
exports.formatIncomingCallsResult = formatIncomingCallsResult;
exports.formatOutgoingCallsResult = formatOutgoingCallsResult;
var path_1 = require("path");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
/**
 * Formats a URI by converting it to a relative path if possible.
 * Handles URI decoding and gracefully falls back to un-decoded path if malformed.
 * Only uses relative paths when shorter and not starting with ../../
 */
function formatUri(uri, cwd) {
    // Handle undefined/null URIs - this indicates malformed LSP data
    if (!uri) {
        // NOTE: This should ideally be caught earlier with proper error logging
        // This is a defensive backstop in the formatting layer
        (0, debug_js_1.logForDebugging)('formatUri called with undefined URI - indicates malformed LSP server response', { level: 'warn' });
        return '<unknown location>';
    }
    // Remove file:// protocol if present
    // On Windows, file:///C:/path becomes /C:/path after replacing file://
    // We need to strip the leading slash for Windows drive-letter paths
    var filePath = uri.replace(/^file:\/\//, '');
    if (/^\/[A-Za-z]:/.test(filePath)) {
        filePath = filePath.slice(1);
    }
    // Decode URI encoding - handle malformed URIs gracefully
    try {
        filePath = decodeURIComponent(filePath);
    }
    catch (error) {
        // Log for debugging but continue with un-decoded path
        var errorMsg = (0, errors_js_1.errorMessage)(error);
        (0, debug_js_1.logForDebugging)("Failed to decode LSP URI '".concat(uri, "': ").concat(errorMsg, ". Using un-decoded path: ").concat(filePath), { level: 'warn' });
        // filePath already contains the un-decoded path, which is still usable
    }
    // Convert to relative path if cwd is provided
    if (cwd) {
        // Normalize separators to forward slashes for consistent display output
        var relativePath = (0, path_1.relative)(cwd, filePath).replaceAll('\\', '/');
        // Only use relative path if it's shorter and doesn't start with ../..
        if (relativePath.length < filePath.length &&
            !relativePath.startsWith('../../')) {
            return relativePath;
        }
    }
    // Normalize separators to forward slashes for consistent display output
    return filePath.replaceAll('\\', '/');
}
/**
 * Groups items by their file URI.
 * Generic helper that works with both Location[] and SymbolInformation[]
 */
function groupByFile(items, cwd) {
    var byFile = new Map();
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var uri = 'uri' in item ? item.uri : item.location.uri;
        var filePath = formatUri(uri, cwd);
        var existingItems = byFile.get(filePath);
        if (existingItems) {
            existingItems.push(item);
        }
        else {
            byFile.set(filePath, [item]);
        }
    }
    return byFile;
}
/**
 * Formats a Location with file path and line/character position
 */
function formatLocation(location, cwd) {
    var filePath = formatUri(location.uri, cwd);
    var line = location.range.start.line + 1; // Convert to 1-based
    var character = location.range.start.character + 1; // Convert to 1-based
    return "".concat(filePath, ":").concat(line, ":").concat(character);
}
/**
 * Converts LocationLink to Location format for consistent handling
 */
function locationLinkToLocation(link) {
    return {
        uri: link.targetUri,
        range: link.targetSelectionRange || link.targetRange,
    };
}
/**
 * Checks if an object is a LocationLink (has targetUri) vs Location (has uri)
 */
function isLocationLink(item) {
    return 'targetUri' in item;
}
/**
 * Formats goToDefinition result
 * Can return Location, LocationLink, or arrays of either
 */
function formatGoToDefinitionResult(result, cwd) {
    if (!result) {
        return 'No definition found. This may occur if the cursor is not on a symbol, or if the definition is in an external library not indexed by the LSP server.';
    }
    if (Array.isArray(result)) {
        // Convert LocationLinks to Locations for uniform handling
        var locations = result.map(function (item) {
            return isLocationLink(item) ? locationLinkToLocation(item) : item;
        });
        // Log and filter out any locations with undefined uris
        var invalidLocations = locations.filter(function (loc) { return !loc || !loc.uri; });
        if (invalidLocations.length > 0) {
            (0, debug_js_1.logForDebugging)("formatGoToDefinitionResult: Filtering out ".concat(invalidLocations.length, " invalid location(s) - this should have been caught earlier"), { level: 'warn' });
        }
        var validLocations = locations.filter(function (loc) { return loc && loc.uri; });
        if (validLocations.length === 0) {
            return 'No definition found. This may occur if the cursor is not on a symbol, or if the definition is in an external library not indexed by the LSP server.';
        }
        if (validLocations.length === 1) {
            return "Defined in ".concat(formatLocation(validLocations[0], cwd));
        }
        var locationList = validLocations
            .map(function (loc) { return "  ".concat(formatLocation(loc, cwd)); })
            .join('\n');
        return "Found ".concat(validLocations.length, " definitions:\n").concat(locationList);
    }
    // Single result - convert LocationLink if needed
    var location = isLocationLink(result)
        ? locationLinkToLocation(result)
        : result;
    return "Defined in ".concat(formatLocation(location, cwd));
}
/**
 * Formats findReferences result
 */
function formatFindReferencesResult(result, cwd) {
    if (!result || result.length === 0) {
        return 'No references found. This may occur if the symbol has no usages, or if the LSP server has not fully indexed the workspace.';
    }
    // Log and filter out any locations with undefined uris
    var invalidLocations = result.filter(function (loc) { return !loc || !loc.uri; });
    if (invalidLocations.length > 0) {
        (0, debug_js_1.logForDebugging)("formatFindReferencesResult: Filtering out ".concat(invalidLocations.length, " invalid location(s) - this should have been caught earlier"), { level: 'warn' });
    }
    var validLocations = result.filter(function (loc) { return loc && loc.uri; });
    if (validLocations.length === 0) {
        return 'No references found. This may occur if the symbol has no usages, or if the LSP server has not fully indexed the workspace.';
    }
    if (validLocations.length === 1) {
        return "Found 1 reference:\n  ".concat(formatLocation(validLocations[0], cwd));
    }
    // Group references by file
    var byFile = groupByFile(validLocations, cwd);
    var lines = [
        "Found ".concat(validLocations.length, " references across ").concat(byFile.size, " files:"),
    ];
    for (var _i = 0, byFile_1 = byFile; _i < byFile_1.length; _i++) {
        var _a = byFile_1[_i], filePath = _a[0], locations = _a[1];
        lines.push("\n".concat(filePath, ":"));
        for (var _b = 0, locations_1 = locations; _b < locations_1.length; _b++) {
            var loc = locations_1[_b];
            var line = loc.range.start.line + 1;
            var character = loc.range.start.character + 1;
            lines.push("  Line ".concat(line, ":").concat(character));
        }
    }
    return lines.join('\n');
}
/**
 * Extracts text content from MarkupContent or MarkedString
 */
function extractMarkupText(contents) {
    if (Array.isArray(contents)) {
        return contents
            .map(function (item) {
            if (typeof item === 'string') {
                return item;
            }
            return item.value;
        })
            .join('\n\n');
    }
    if (typeof contents === 'string') {
        return contents;
    }
    if ('kind' in contents) {
        // MarkupContent
        return contents.value;
    }
    // MarkedString object
    return contents.value;
}
/**
 * Formats hover result
 */
function formatHoverResult(result, _cwd) {
    if (!result) {
        return 'No hover information available. This may occur if the cursor is not on a symbol, or if the LSP server has not fully indexed the file.';
    }
    var content = extractMarkupText(result.contents);
    if (result.range) {
        var line = result.range.start.line + 1;
        var character = result.range.start.character + 1;
        return "Hover info at ".concat(line, ":").concat(character, ":\n\n").concat(content);
    }
    return content;
}
/**
 * Maps SymbolKind enum to readable string
 */
function symbolKindToString(kind) {
    var _a;
    var kinds = (_a = {},
        _a[1] = 'File',
        _a[2] = 'Module',
        _a[3] = 'Namespace',
        _a[4] = 'Package',
        _a[5] = 'Class',
        _a[6] = 'Method',
        _a[7] = 'Property',
        _a[8] = 'Field',
        _a[9] = 'Constructor',
        _a[10] = 'Enum',
        _a[11] = 'Interface',
        _a[12] = 'Function',
        _a[13] = 'Variable',
        _a[14] = 'Constant',
        _a[15] = 'String',
        _a[16] = 'Number',
        _a[17] = 'Boolean',
        _a[18] = 'Array',
        _a[19] = 'Object',
        _a[20] = 'Key',
        _a[21] = 'Null',
        _a[22] = 'EnumMember',
        _a[23] = 'Struct',
        _a[24] = 'Event',
        _a[25] = 'Operator',
        _a[26] = 'TypeParameter',
        _a);
    return kinds[kind] || 'Unknown';
}
/**
 * Formats a single DocumentSymbol with indentation
 */
function formatDocumentSymbolNode(symbol, indent) {
    if (indent === void 0) { indent = 0; }
    var lines = [];
    var prefix = '  '.repeat(indent);
    var kind = symbolKindToString(symbol.kind);
    var line = "".concat(prefix).concat(symbol.name, " (").concat(kind, ")");
    if (symbol.detail) {
        line += " ".concat(symbol.detail);
    }
    var symbolLine = symbol.range.start.line + 1;
    line += " - Line ".concat(symbolLine);
    lines.push(line);
    // Recursively format children
    if (symbol.children && symbol.children.length > 0) {
        for (var _i = 0, _a = symbol.children; _i < _a.length; _i++) {
            var child = _a[_i];
            lines.push.apply(lines, formatDocumentSymbolNode(child, indent + 1));
        }
    }
    return lines;
}
/**
 * Formats documentSymbol result (hierarchical outline)
 * Handles both DocumentSymbol[] (hierarchical, with range) and SymbolInformation[] (flat, with location.range)
 * per LSP spec which allows textDocument/documentSymbol to return either format
 */
function formatDocumentSymbolResult(result, cwd) {
    if (!result || result.length === 0) {
        return 'No symbols found in document. This may occur if the file is empty, not supported by the LSP server, or if the server has not fully indexed the file.';
    }
    // Detect format: DocumentSymbol has 'range' directly, SymbolInformation has 'location.range'
    // Check the first valid element to determine format
    var firstSymbol = result[0];
    var isSymbolInformation = firstSymbol && 'location' in firstSymbol;
    if (isSymbolInformation) {
        // Delegate to workspace symbol formatter which handles SymbolInformation[]
        return formatWorkspaceSymbolResult(result, cwd);
    }
    // Handle DocumentSymbol[] format (hierarchical)
    var lines = ['Document symbols:'];
    for (var _i = 0, _a = result; _i < _a.length; _i++) {
        var symbol = _a[_i];
        lines.push.apply(lines, formatDocumentSymbolNode(symbol));
    }
    return lines.join('\n');
}
/**
 * Formats workspaceSymbol result (flat list of symbols)
 */
function formatWorkspaceSymbolResult(result, cwd) {
    if (!result || result.length === 0) {
        return 'No symbols found in workspace. This may occur if the workspace is empty, or if the LSP server has not finished indexing the project.';
    }
    // Log and filter out any symbols with undefined location.uri
    var invalidSymbols = result.filter(function (sym) { return !sym || !sym.location || !sym.location.uri; });
    if (invalidSymbols.length > 0) {
        (0, debug_js_1.logForDebugging)("formatWorkspaceSymbolResult: Filtering out ".concat(invalidSymbols.length, " invalid symbol(s) - this should have been caught earlier"), { level: 'warn' });
    }
    var validSymbols = result.filter(function (sym) { return sym && sym.location && sym.location.uri; });
    if (validSymbols.length === 0) {
        return 'No symbols found in workspace. This may occur if the workspace is empty, or if the LSP server has not finished indexing the project.';
    }
    var lines = [
        "Found ".concat(validSymbols.length, " ").concat((0, stringUtils_js_1.plural)(validSymbols.length, 'symbol'), " in workspace:"),
    ];
    // Group by file
    var byFile = groupByFile(validSymbols, cwd);
    for (var _i = 0, byFile_2 = byFile; _i < byFile_2.length; _i++) {
        var _a = byFile_2[_i], filePath = _a[0], symbols = _a[1];
        lines.push("\n".concat(filePath, ":"));
        for (var _b = 0, symbols_1 = symbols; _b < symbols_1.length; _b++) {
            var symbol = symbols_1[_b];
            var kind = symbolKindToString(symbol.kind);
            var line = symbol.location.range.start.line + 1;
            var symbolLine = "  ".concat(symbol.name, " (").concat(kind, ") - Line ").concat(line);
            // Add container name if available
            if (symbol.containerName) {
                symbolLine += " in ".concat(symbol.containerName);
            }
            lines.push(symbolLine);
        }
    }
    return lines.join('\n');
}
/**
 * Formats a CallHierarchyItem with its location
 * Validates URI before formatting to handle malformed LSP data
 */
function formatCallHierarchyItem(item, cwd) {
    // Validate URI - handle undefined/null gracefully
    if (!item.uri) {
        (0, debug_js_1.logForDebugging)('formatCallHierarchyItem: CallHierarchyItem has undefined URI', { level: 'warn' });
        return "".concat(item.name, " (").concat(symbolKindToString(item.kind), ") - <unknown location>");
    }
    var filePath = formatUri(item.uri, cwd);
    var line = item.range.start.line + 1;
    var kind = symbolKindToString(item.kind);
    var result = "".concat(item.name, " (").concat(kind, ") - ").concat(filePath, ":").concat(line);
    if (item.detail) {
        result += " [".concat(item.detail, "]");
    }
    return result;
}
/**
 * Formats prepareCallHierarchy result
 * Returns the call hierarchy item(s) at the given position
 */
function formatPrepareCallHierarchyResult(result, cwd) {
    if (!result || result.length === 0) {
        return 'No call hierarchy item found at this position';
    }
    if (result.length === 1) {
        return "Call hierarchy item: ".concat(formatCallHierarchyItem(result[0], cwd));
    }
    var lines = ["Found ".concat(result.length, " call hierarchy items:")];
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var item = result_1[_i];
        lines.push("  ".concat(formatCallHierarchyItem(item, cwd)));
    }
    return lines.join('\n');
}
/**
 * Formats incomingCalls result
 * Shows all functions/methods that call the target
 */
function formatIncomingCallsResult(result, cwd) {
    if (!result || result.length === 0) {
        return 'No incoming calls found (nothing calls this function)';
    }
    var lines = [
        "Found ".concat(result.length, " incoming ").concat((0, stringUtils_js_1.plural)(result.length, 'call'), ":"),
    ];
    // Group by file
    var byFile = new Map();
    for (var _i = 0, result_2 = result; _i < result_2.length; _i++) {
        var call = result_2[_i];
        if (!call.from) {
            (0, debug_js_1.logForDebugging)('formatIncomingCallsResult: CallHierarchyIncomingCall has undefined from field', { level: 'warn' });
            continue;
        }
        var filePath = formatUri(call.from.uri, cwd);
        var existing = byFile.get(filePath);
        if (existing) {
            existing.push(call);
        }
        else {
            byFile.set(filePath, [call]);
        }
    }
    for (var _a = 0, byFile_3 = byFile; _a < byFile_3.length; _a++) {
        var _b = byFile_3[_a], filePath = _b[0], calls = _b[1];
        lines.push("\n".concat(filePath, ":"));
        for (var _c = 0, calls_1 = calls; _c < calls_1.length; _c++) {
            var call = calls_1[_c];
            if (!call.from) {
                continue; // Already logged above
            }
            var kind = symbolKindToString(call.from.kind);
            var line = call.from.range.start.line + 1;
            var callLine = "  ".concat(call.from.name, " (").concat(kind, ") - Line ").concat(line);
            // Show call sites within the caller
            if (call.fromRanges && call.fromRanges.length > 0) {
                var callSites = call.fromRanges
                    .map(function (r) { return "".concat(r.start.line + 1, ":").concat(r.start.character + 1); })
                    .join(', ');
                callLine += " [calls at: ".concat(callSites, "]");
            }
            lines.push(callLine);
        }
    }
    return lines.join('\n');
}
/**
 * Formats outgoingCalls result
 * Shows all functions/methods called by the target
 */
function formatOutgoingCallsResult(result, cwd) {
    if (!result || result.length === 0) {
        return 'No outgoing calls found (this function calls nothing)';
    }
    var lines = [
        "Found ".concat(result.length, " outgoing ").concat((0, stringUtils_js_1.plural)(result.length, 'call'), ":"),
    ];
    // Group by file
    var byFile = new Map();
    for (var _i = 0, result_3 = result; _i < result_3.length; _i++) {
        var call = result_3[_i];
        if (!call.to) {
            (0, debug_js_1.logForDebugging)('formatOutgoingCallsResult: CallHierarchyOutgoingCall has undefined to field', { level: 'warn' });
            continue;
        }
        var filePath = formatUri(call.to.uri, cwd);
        var existing = byFile.get(filePath);
        if (existing) {
            existing.push(call);
        }
        else {
            byFile.set(filePath, [call]);
        }
    }
    for (var _a = 0, byFile_4 = byFile; _a < byFile_4.length; _a++) {
        var _b = byFile_4[_a], filePath = _b[0], calls = _b[1];
        lines.push("\n".concat(filePath, ":"));
        for (var _c = 0, calls_2 = calls; _c < calls_2.length; _c++) {
            var call = calls_2[_c];
            if (!call.to) {
                continue; // Already logged above
            }
            var kind = symbolKindToString(call.to.kind);
            var line = call.to.range.start.line + 1;
            var callLine = "  ".concat(call.to.name, " (").concat(kind, ") - Line ").concat(line);
            // Show call sites within the current function
            if (call.fromRanges && call.fromRanges.length > 0) {
                var callSites = call.fromRanges
                    .map(function (r) { return "".concat(r.start.line + 1, ":").concat(r.start.character + 1); })
                    .join(', ');
                callLine += " [called from: ".concat(callSites, "]");
            }
            lines.push(callLine);
        }
    }
    return lines.join('\n');
}
