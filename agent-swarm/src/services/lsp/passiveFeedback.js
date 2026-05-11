"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDiagnosticsForAttachment = formatDiagnosticsForAttachment;
exports.registerLSPNotificationHandlers = registerLSPNotificationHandlers;
var url_1 = require("url");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var LSPDiagnosticRegistry_js_1 = require("./LSPDiagnosticRegistry.js");
/**
 * Map LSP severity to Claude diagnostic severity
 *
 * Maps LSP severity numbers to Claude diagnostic severity strings.
 * Accepts numeric severity values (1=Error, 2=Warning, 3=Information, 4=Hint)
 * or undefined, defaulting to 'Error' for invalid/missing values.
 */
function mapLSPSeverity(lspSeverity) {
    // LSP DiagnosticSeverity enum:
    // 1 = Error, 2 = Warning, 3 = Information, 4 = Hint
    switch (lspSeverity) {
        case 1:
            return 'Error';
        case 2:
            return 'Warning';
        case 3:
            return 'Info';
        case 4:
            return 'Hint';
        default:
            return 'Error';
    }
}
/**
 * Convert LSP diagnostics to Claude diagnostic format
 *
 * Converts LSP PublishDiagnosticsParams to DiagnosticFile[] format
 * used by Claude's attachment system.
 */
function formatDiagnosticsForAttachment(params) {
    // Parse URI (may be file:// or plain path) and normalize to file system path
    var uri;
    try {
        // Handle both file:// URIs and plain paths
        uri = params.uri.startsWith('file://')
            ? (0, url_1.fileURLToPath)(params.uri)
            : params.uri;
    }
    catch (error) {
        var err = (0, errors_js_1.toError)(error);
        (0, log_js_1.logError)(err);
        (0, debug_js_1.logForDebugging)("Failed to convert URI to file path: ".concat(params.uri, ". Error: ").concat(err.message, ". Using original URI as fallback."));
        // Gracefully fallback to original URI - LSP servers may send malformed URIs
        uri = params.uri;
    }
    var diagnostics = params.diagnostics.map(function (diag) { return ({
        message: diag.message,
        severity: mapLSPSeverity(diag.severity),
        range: {
            start: {
                line: diag.range.start.line,
                character: diag.range.start.character,
            },
            end: {
                line: diag.range.end.line,
                character: diag.range.end.character,
            },
        },
        source: diag.source,
        code: diag.code !== undefined && diag.code !== null
            ? String(diag.code)
            : undefined,
    }); });
    return [
        {
            uri: uri,
            diagnostics: diagnostics,
        },
    ];
}
/**
 * Register LSP notification handlers on all servers
 *
 * Sets up handlers to listen for textDocument/publishDiagnostics notifications
 * from all LSP servers and routes them to Claude's diagnostic system.
 * Uses public getAllServers() API for clean access to server instances.
 *
 * @returns Tracking data for registration status and runtime failures
 */
function registerLSPNotificationHandlers(manager) {
    // Register handlers on all configured servers to capture diagnostics from any language
    var servers = manager.getAllServers();
    // Track partial failures - allow successful server registrations even if some fail
    var registrationErrors = [];
    var successCount = 0;
    // Track consecutive failures per server to warn users after 3+ failures
    var diagnosticFailures = new Map();
    var _loop_1 = function (serverName, serverInstance) {
        try {
            // Validate server instance has onNotification method
            if (!serverInstance ||
                typeof serverInstance.onNotification !== 'function') {
                var errorMsg = !serverInstance
                    ? 'Server instance is null/undefined'
                    : 'Server instance has no onNotification method';
                registrationErrors.push({ serverName: serverName, error: errorMsg });
                var err = new Error("".concat(errorMsg, " for ").concat(serverName));
                (0, log_js_1.logError)(err);
                (0, debug_js_1.logForDebugging)("Skipping handler registration for ".concat(serverName, ": ").concat(errorMsg));
                return "continue";
            }
            // Errors are isolated to avoid breaking other servers
            serverInstance.onNotification('textDocument/publishDiagnostics', function (params) {
                (0, debug_js_1.logForDebugging)("[PASSIVE DIAGNOSTICS] Handler invoked for ".concat(serverName, "! Params type: ").concat(typeof params));
                try {
                    // Validate params structure before casting
                    if (!params ||
                        typeof params !== 'object' ||
                        !('uri' in params) ||
                        !('diagnostics' in params)) {
                        var err = new Error("LSP server ".concat(serverName, " sent invalid diagnostic params (missing uri or diagnostics)"));
                        (0, log_js_1.logError)(err);
                        (0, debug_js_1.logForDebugging)("Invalid diagnostic params from ".concat(serverName, ": ").concat((0, slowOperations_js_1.jsonStringify)(params)));
                        return;
                    }
                    var diagnosticParams = params;
                    (0, debug_js_1.logForDebugging)("Received diagnostics from ".concat(serverName, ": ").concat(diagnosticParams.diagnostics.length, " diagnostic(s) for ").concat(diagnosticParams.uri));
                    // Convert LSP diagnostics to Claude format (can throw on invalid URIs)
                    var diagnosticFiles = formatDiagnosticsForAttachment(diagnosticParams);
                    // Only send notification if there are diagnostics
                    var firstFile = diagnosticFiles[0];
                    if (!firstFile ||
                        diagnosticFiles.length === 0 ||
                        firstFile.diagnostics.length === 0) {
                        (0, debug_js_1.logForDebugging)("Skipping empty diagnostics from ".concat(serverName, " for ").concat(diagnosticParams.uri));
                        return;
                    }
                    // Register diagnostics for async delivery via attachment system
                    // Follows same pattern as AsyncHookRegistry for consistent async attachment delivery
                    try {
                        (0, LSPDiagnosticRegistry_js_1.registerPendingLSPDiagnostic)({
                            serverName: serverName,
                            files: diagnosticFiles,
                        });
                        (0, debug_js_1.logForDebugging)("LSP Diagnostics: Registered ".concat(diagnosticFiles.length, " diagnostic file(s) from ").concat(serverName, " for async delivery"));
                        // Success - reset failure counter for this server
                        diagnosticFailures.delete(serverName);
                    }
                    catch (error) {
                        var err = (0, errors_js_1.toError)(error);
                        (0, log_js_1.logError)(err);
                        (0, debug_js_1.logForDebugging)("Error registering LSP diagnostics from ".concat(serverName, ": ") +
                            "URI: ".concat(diagnosticParams.uri, ", ") +
                            "Diagnostic count: ".concat(firstFile.diagnostics.length, ", ") +
                            "Error: ".concat(err.message));
                        // Track consecutive failures and warn after 3+
                        var failures = diagnosticFailures.get(serverName) || {
                            count: 0,
                            lastError: '',
                        };
                        failures.count++;
                        failures.lastError = err.message;
                        diagnosticFailures.set(serverName, failures);
                        if (failures.count >= 3) {
                            (0, debug_js_1.logForDebugging)("WARNING: LSP diagnostic handler for ".concat(serverName, " has failed ").concat(failures.count, " times consecutively. ") +
                                "Last error: ".concat(failures.lastError, ". ") +
                                "This may indicate a problem with the LSP server or diagnostic processing. " +
                                "Check logs for details.");
                        }
                    }
                }
                catch (error) {
                    // Catch any unexpected errors from the entire handler to prevent breaking the notification loop
                    var err = (0, errors_js_1.toError)(error);
                    (0, log_js_1.logError)(err);
                    (0, debug_js_1.logForDebugging)("Unexpected error processing diagnostics from ".concat(serverName, ": ").concat(err.message));
                    // Track consecutive failures and warn after 3+
                    var failures = diagnosticFailures.get(serverName) || {
                        count: 0,
                        lastError: '',
                    };
                    failures.count++;
                    failures.lastError = err.message;
                    diagnosticFailures.set(serverName, failures);
                    if (failures.count >= 3) {
                        (0, debug_js_1.logForDebugging)("WARNING: LSP diagnostic handler for ".concat(serverName, " has failed ").concat(failures.count, " times consecutively. ") +
                            "Last error: ".concat(failures.lastError, ". ") +
                            "This may indicate a problem with the LSP server or diagnostic processing. " +
                            "Check logs for details.");
                    }
                    // Don't re-throw - isolate errors to this server only
                }
            });
            (0, debug_js_1.logForDebugging)("Registered diagnostics handler for ".concat(serverName));
            successCount++;
        }
        catch (error) {
            var err = (0, errors_js_1.toError)(error);
            registrationErrors.push({
                serverName: serverName,
                error: err.message,
            });
            (0, log_js_1.logError)(err);
            (0, debug_js_1.logForDebugging)("Failed to register diagnostics handler for ".concat(serverName, ": ") +
                "Error: ".concat(err.message));
        }
    };
    for (var _i = 0, _a = servers.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], serverName = _b[0], serverInstance = _b[1];
        _loop_1(serverName, serverInstance);
    }
    // Report overall registration status
    var totalServers = servers.size;
    if (registrationErrors.length > 0) {
        var failedServers = registrationErrors
            .map(function (e) { return "".concat(e.serverName, " (").concat(e.error, ")"); })
            .join(', ');
        // Log aggregate failures for tracking
        (0, log_js_1.logError)(new Error("Failed to register diagnostics for ".concat(registrationErrors.length, " LSP server(s): ").concat(failedServers)));
        (0, debug_js_1.logForDebugging)("LSP notification handler registration: ".concat(successCount, "/").concat(totalServers, " succeeded. ") +
            "Failed servers: ".concat(failedServers, ". ") +
            "Diagnostics from failed servers will not be delivered.");
    }
    else {
        (0, debug_js_1.logForDebugging)("LSP notification handlers registered successfully for all ".concat(totalServers, " server(s)"));
    }
    // Return tracking data for monitoring and testing
    return {
        totalServers: totalServers,
        successCount: successCount,
        registrationErrors: registrationErrors,
        diagnosticFailures: diagnosticFailures,
    };
}
