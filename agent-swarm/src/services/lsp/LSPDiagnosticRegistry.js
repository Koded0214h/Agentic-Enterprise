"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPendingLSPDiagnostic = registerPendingLSPDiagnostic;
exports.checkForLSPDiagnostics = checkForLSPDiagnostics;
exports.clearAllLSPDiagnostics = clearAllLSPDiagnostics;
exports.resetAllLSPDiagnosticState = resetAllLSPDiagnosticState;
exports.clearDeliveredDiagnosticsForFile = clearDeliveredDiagnosticsForFile;
exports.getPendingLSPDiagnosticCount = getPendingLSPDiagnosticCount;
var crypto_1 = require("crypto");
var lru_cache_1 = require("lru-cache");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
/**
 * LSP Diagnostic Registry
 *
 * Stores LSP diagnostics received asynchronously from LSP servers via
 * textDocument/publishDiagnostics notifications. Follows the same pattern
 * as AsyncHookRegistry for consistent async attachment delivery.
 *
 * Pattern:
 * 1. LSP server sends publishDiagnostics notification
 * 2. registerPendingLSPDiagnostic() stores diagnostic
 * 3. checkForLSPDiagnostics() retrieves pending diagnostics
 * 4. getLSPDiagnosticAttachments() converts to Attachment[]
 * 5. getAttachments() delivers to conversation automatically
 *
 * Similar to AsyncHookRegistry but simpler since diagnostics arrive
 * synchronously (no need to accumulate output over time).
 */
// Volume limiting constants
var MAX_DIAGNOSTICS_PER_FILE = 10;
var MAX_TOTAL_DIAGNOSTICS = 30;
// Max files to track for deduplication - prevents unbounded memory growth
var MAX_DELIVERED_FILES = 500;
// Global registry state
var pendingDiagnostics = new Map();
// Cross-turn deduplication: tracks diagnostics that have been delivered
// Maps file URI to a set of diagnostic keys (hash of message+severity+range)
// Using LRUCache to prevent unbounded growth in long sessions
var deliveredDiagnostics = new lru_cache_1.LRUCache({
    max: MAX_DELIVERED_FILES,
});
/**
 * Register LSP diagnostics received from a server.
 * These will be delivered as attachments in the next query.
 *
 * @param serverName - Name of LSP server that sent diagnostics
 * @param files - Diagnostic files to deliver
 */
function registerPendingLSPDiagnostic(_a) {
    var serverName = _a.serverName, files = _a.files;
    // Use UUID for guaranteed uniqueness (handles rapid registrations)
    var diagnosticId = (0, crypto_1.randomUUID)();
    (0, debug_js_1.logForDebugging)("LSP Diagnostics: Registering ".concat(files.length, " diagnostic file(s) from ").concat(serverName, " (ID: ").concat(diagnosticId, ")"));
    pendingDiagnostics.set(diagnosticId, {
        serverName: serverName,
        files: files,
        timestamp: Date.now(),
        attachmentSent: false,
    });
}
/**
 * Maps severity string to numeric value for sorting.
 * Error=1, Warning=2, Info=3, Hint=4
 */
function severityToNumber(severity) {
    switch (severity) {
        case 'Error':
            return 1;
        case 'Warning':
            return 2;
        case 'Info':
            return 3;
        case 'Hint':
            return 4;
        default:
            return 4;
    }
}
/**
 * Creates a unique key for a diagnostic based on its content.
 * Used for both within-batch and cross-turn deduplication.
 */
function createDiagnosticKey(diag) {
    return (0, slowOperations_js_1.jsonStringify)({
        message: diag.message,
        severity: diag.severity,
        range: diag.range,
        source: diag.source || null,
        code: diag.code || null,
    });
}
/**
 * Deduplicates diagnostics by file URI and diagnostic content.
 * Also filters out diagnostics that were already delivered in previous turns.
 * Two diagnostics are considered duplicates if they have the same:
 * - File URI
 * - Range (start/end line and character)
 * - Message
 * - Severity
 * - Source and code (if present)
 */
function deduplicateDiagnosticFiles(allFiles) {
    var _a;
    // Group diagnostics by file URI
    var fileMap = new Map();
    var dedupedFiles = [];
    var _loop_1 = function (file) {
        if (!fileMap.has(file.uri)) {
            fileMap.set(file.uri, new Set());
            dedupedFiles.push({ uri: file.uri, diagnostics: [] });
        }
        var seenDiagnostics = fileMap.get(file.uri);
        var dedupedFile = dedupedFiles.find(function (f) { return f.uri === file.uri; });
        // Get previously delivered diagnostics for this file (for cross-turn dedup)
        var previouslyDelivered = deliveredDiagnostics.get(file.uri) || new Set();
        for (var _b = 0, _c = file.diagnostics; _b < _c.length; _b++) {
            var diag = _c[_b];
            try {
                var key = createDiagnosticKey(diag);
                // Skip if already seen in this batch OR already delivered in previous turns
                if (seenDiagnostics.has(key) || previouslyDelivered.has(key)) {
                    continue;
                }
                seenDiagnostics.add(key);
                dedupedFile.diagnostics.push(diag);
            }
            catch (error) {
                var err = (0, errors_js_1.toError)(error);
                var truncatedMessage = ((_a = diag.message) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) || '<no message>';
                (0, log_js_1.logError)(new Error("Failed to deduplicate diagnostic in ".concat(file.uri, ": ").concat(err.message, ". ") +
                    "Diagnostic message: ".concat(truncatedMessage)));
                // Include the diagnostic anyway to avoid losing information
                dedupedFile.diagnostics.push(diag);
            }
        }
    };
    for (var _i = 0, allFiles_1 = allFiles; _i < allFiles_1.length; _i++) {
        var file = allFiles_1[_i];
        _loop_1(file);
    }
    // Filter out files with no diagnostics after deduplication
    return dedupedFiles.filter(function (f) { return f.diagnostics.length > 0; });
}
/**
 * Get all pending LSP diagnostics that haven't been delivered yet.
 * Deduplicates diagnostics to prevent sending the same diagnostic multiple times.
 * Marks diagnostics as sent to prevent duplicate delivery.
 *
 * @returns Array of pending diagnostics ready for delivery (deduplicated)
 */
function checkForLSPDiagnostics() {
    var _a;
    (0, debug_js_1.logForDebugging)("LSP Diagnostics: Checking registry - ".concat(pendingDiagnostics.size, " pending"));
    // Collect all diagnostic files from all pending notifications
    var allFiles = [];
    var serverNames = new Set();
    var diagnosticsToMark = [];
    for (var _i = 0, _b = pendingDiagnostics.values(); _i < _b.length; _i++) {
        var diagnostic = _b[_i];
        if (!diagnostic.attachmentSent) {
            allFiles.push.apply(allFiles, diagnostic.files);
            serverNames.add(diagnostic.serverName);
            diagnosticsToMark.push(diagnostic);
        }
    }
    if (allFiles.length === 0) {
        return [];
    }
    // Deduplicate diagnostics across all files
    var dedupedFiles;
    try {
        dedupedFiles = deduplicateDiagnosticFiles(allFiles);
    }
    catch (error) {
        var err = (0, errors_js_1.toError)(error);
        (0, log_js_1.logError)(new Error("Failed to deduplicate LSP diagnostics: ".concat(err.message)));
        // Fall back to undedup'd files to avoid losing diagnostics
        dedupedFiles = allFiles;
    }
    // Only mark as sent AFTER successful deduplication, then delete from map.
    // Entries are tracked in deliveredDiagnostics LRU for dedup, so we don't
    // need to keep them in pendingDiagnostics after delivery.
    for (var _c = 0, diagnosticsToMark_1 = diagnosticsToMark; _c < diagnosticsToMark_1.length; _c++) {
        var diagnostic = diagnosticsToMark_1[_c];
        diagnostic.attachmentSent = true;
    }
    for (var _d = 0, pendingDiagnostics_1 = pendingDiagnostics; _d < pendingDiagnostics_1.length; _d++) {
        var _e = pendingDiagnostics_1[_d], id = _e[0], diagnostic = _e[1];
        if (diagnostic.attachmentSent) {
            pendingDiagnostics.delete(id);
        }
    }
    var originalCount = allFiles.reduce(function (sum, f) { return sum + f.diagnostics.length; }, 0);
    var dedupedCount = dedupedFiles.reduce(function (sum, f) { return sum + f.diagnostics.length; }, 0);
    if (originalCount > dedupedCount) {
        (0, debug_js_1.logForDebugging)("LSP Diagnostics: Deduplication removed ".concat(originalCount - dedupedCount, " duplicate diagnostic(s)"));
    }
    // Apply volume limiting: cap per file and total
    var totalDiagnostics = 0;
    var truncatedCount = 0;
    for (var _f = 0, dedupedFiles_1 = dedupedFiles; _f < dedupedFiles_1.length; _f++) {
        var file = dedupedFiles_1[_f];
        // Sort by severity (Error=1 < Warning=2 < Info=3 < Hint=4) to prioritize errors
        file.diagnostics.sort(function (a, b) { return severityToNumber(a.severity) - severityToNumber(b.severity); });
        // Cap per file
        if (file.diagnostics.length > MAX_DIAGNOSTICS_PER_FILE) {
            truncatedCount += file.diagnostics.length - MAX_DIAGNOSTICS_PER_FILE;
            file.diagnostics = file.diagnostics.slice(0, MAX_DIAGNOSTICS_PER_FILE);
        }
        // Cap total
        var remainingCapacity = MAX_TOTAL_DIAGNOSTICS - totalDiagnostics;
        if (file.diagnostics.length > remainingCapacity) {
            truncatedCount += file.diagnostics.length - remainingCapacity;
            file.diagnostics = file.diagnostics.slice(0, remainingCapacity);
        }
        totalDiagnostics += file.diagnostics.length;
    }
    // Filter out files that ended up with no diagnostics after limiting
    dedupedFiles = dedupedFiles.filter(function (f) { return f.diagnostics.length > 0; });
    if (truncatedCount > 0) {
        (0, debug_js_1.logForDebugging)("LSP Diagnostics: Volume limiting removed ".concat(truncatedCount, " diagnostic(s) (max ").concat(MAX_DIAGNOSTICS_PER_FILE, "/file, ").concat(MAX_TOTAL_DIAGNOSTICS, " total)"));
    }
    // Track delivered diagnostics for cross-turn deduplication
    for (var _g = 0, dedupedFiles_2 = dedupedFiles; _g < dedupedFiles_2.length; _g++) {
        var file = dedupedFiles_2[_g];
        if (!deliveredDiagnostics.has(file.uri)) {
            deliveredDiagnostics.set(file.uri, new Set());
        }
        var delivered = deliveredDiagnostics.get(file.uri);
        for (var _h = 0, _j = file.diagnostics; _h < _j.length; _h++) {
            var diag = _j[_h];
            try {
                delivered.add(createDiagnosticKey(diag));
            }
            catch (error) {
                // Log but continue - failure to track shouldn't prevent delivery
                var err = (0, errors_js_1.toError)(error);
                var truncatedMessage = ((_a = diag.message) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) || '<no message>';
                (0, log_js_1.logError)(new Error("Failed to track delivered diagnostic in ".concat(file.uri, ": ").concat(err.message, ". ") +
                    "Diagnostic message: ".concat(truncatedMessage)));
            }
        }
    }
    var finalCount = dedupedFiles.reduce(function (sum, f) { return sum + f.diagnostics.length; }, 0);
    // Return empty if no diagnostics to deliver (all filtered by deduplication)
    if (finalCount === 0) {
        (0, debug_js_1.logForDebugging)("LSP Diagnostics: No new diagnostics to deliver (all filtered by deduplication)");
        return [];
    }
    (0, debug_js_1.logForDebugging)("LSP Diagnostics: Delivering ".concat(dedupedFiles.length, " file(s) with ").concat(finalCount, " diagnostic(s) from ").concat(serverNames.size, " server(s)"));
    // Return single result with all deduplicated diagnostics
    return [
        {
            serverName: Array.from(serverNames).join(', '),
            files: dedupedFiles,
        },
    ];
}
/**
 * Clear all pending diagnostics.
 * Used during cleanup/shutdown or for testing.
 * Note: Does NOT clear deliveredDiagnostics - that's for cross-turn deduplication
 * and should only be cleared when files are edited or on session reset.
 */
function clearAllLSPDiagnostics() {
    (0, debug_js_1.logForDebugging)("LSP Diagnostics: Clearing ".concat(pendingDiagnostics.size, " pending diagnostic(s)"));
    pendingDiagnostics.clear();
}
/**
 * Reset all diagnostic state including cross-turn tracking.
 * Used on session reset or for testing.
 */
function resetAllLSPDiagnosticState() {
    (0, debug_js_1.logForDebugging)("LSP Diagnostics: Resetting all state (".concat(pendingDiagnostics.size, " pending, ").concat(deliveredDiagnostics.size, " files tracked)"));
    pendingDiagnostics.clear();
    deliveredDiagnostics.clear();
}
/**
 * Clear delivered diagnostics for a specific file.
 * Should be called when a file is edited so that new diagnostics for that file
 * will be shown even if they match previously delivered ones.
 *
 * @param fileUri - URI of the file that was edited
 */
function clearDeliveredDiagnosticsForFile(fileUri) {
    if (deliveredDiagnostics.has(fileUri)) {
        (0, debug_js_1.logForDebugging)("LSP Diagnostics: Clearing delivered diagnostics for ".concat(fileUri));
        deliveredDiagnostics.delete(fileUri);
    }
}
/**
 * Get count of pending diagnostics (for monitoring)
 */
function getPendingLSPDiagnosticCount() {
    return pendingDiagnostics.size;
}
