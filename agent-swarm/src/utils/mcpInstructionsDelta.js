"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMcpInstructionsDeltaEnabled = isMcpInstructionsDeltaEnabled;
exports.getMcpInstructionsDelta = getMcpInstructionsDelta;
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var index_js_1 = require("../services/analytics/index.js");
var envUtils_js_1 = require("./envUtils.js");
/**
 * True → announce MCP server instructions via persisted delta attachments.
 * False → prompts.ts keeps its DANGEROUS_uncachedSystemPromptSection
 * (rebuilt every turn; cache-busts on late connect).
 *
 * Env override for local testing: CLAUDE_CODE_MCP_INSTR_DELTA=true/false
 * wins over both ant bypass and the GrowthBook gate.
 */
function isMcpInstructionsDeltaEnabled() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_MCP_INSTR_DELTA))
        return true;
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_MCP_INSTR_DELTA))
        return false;
    return (process.env.USER_TYPE === 'ant' ||
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_basalt_3kr', false));
}
/**
 * Diff the current set of connected MCP servers that have instructions
 * (server-authored via InitializeResult, or client-side synthesized)
 * against what's already been announced in this conversation. Null if
 * nothing changed.
 *
 * Instructions are immutable for the life of a connection (set once at
 * handshake), so the scan diffs on server NAME, not on content.
 */
function getMcpInstructionsDelta(mcpClients, messages, clientSideInstructions) {
    var announced = new Set();
    var attachmentCount = 0;
    var midCount = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        if (msg.type !== 'attachment')
            continue;
        attachmentCount++;
        if (msg.attachment.type !== 'mcp_instructions_delta')
            continue;
        midCount++;
        for (var _a = 0, _b = msg.attachment.addedNames; _a < _b.length; _a++) {
            var n = _b[_a];
            announced.add(n);
        }
        for (var _c = 0, _d = msg.attachment.removedNames; _c < _d.length; _c++) {
            var n = _d[_c];
            announced.delete(n);
        }
    }
    var connected = mcpClients.filter(function (c) { return c.type === 'connected'; });
    var connectedNames = new Set(connected.map(function (c) { return c.name; }));
    // Servers with instructions to announce (either channel). A server can
    // have both: server-authored instructions + a client-side block appended.
    var blocks = new Map();
    for (var _e = 0, connected_1 = connected; _e < connected_1.length; _e++) {
        var c = connected_1[_e];
        if (c.instructions)
            blocks.set(c.name, "## ".concat(c.name, "\n").concat(c.instructions));
    }
    for (var _f = 0, clientSideInstructions_1 = clientSideInstructions; _f < clientSideInstructions_1.length; _f++) {
        var ci = clientSideInstructions_1[_f];
        if (!connectedNames.has(ci.serverName))
            continue;
        var existing = blocks.get(ci.serverName);
        blocks.set(ci.serverName, existing
            ? "".concat(existing, "\n\n").concat(ci.block)
            : "## ".concat(ci.serverName, "\n").concat(ci.block));
    }
    var added = [];
    for (var _g = 0, blocks_1 = blocks; _g < blocks_1.length; _g++) {
        var _h = blocks_1[_g], name_1 = _h[0], block = _h[1];
        if (!announced.has(name_1))
            added.push({ name: name_1, block: block });
    }
    // A previously-announced server that is no longer connected → removed.
    // There is no "announced but now has no instructions" case for a still-
    // connected server: InitializeResult is immutable, and client-side
    // instruction gates are session-stable in practice. (/model can flip
    // the model gate, but deferred_tools_delta has the same property and
    // we treat history as historical — no retroactive retractions.)
    var removed = [];
    for (var _j = 0, announced_1 = announced; _j < announced_1.length; _j++) {
        var n = announced_1[_j];
        if (!connectedNames.has(n))
            removed.push(n);
    }
    if (added.length === 0 && removed.length === 0)
        return null;
    // Same diagnostic fields as tengu_deferred_tools_pool_change — same
    // scan-fails-in-prod bug, same attachment persistence path.
    (0, index_js_1.logEvent)('tengu_mcp_instructions_pool_change', {
        addedCount: added.length,
        removedCount: removed.length,
        priorAnnouncedCount: announced.size,
        clientSideCount: clientSideInstructions.length,
        messagesLength: messages.length,
        attachmentCount: attachmentCount,
        midCount: midCount,
    });
    added.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return {
        addedNames: added.map(function (a) { return a.name; }),
        addedBlocks: added.map(function (a) { return a.block; }),
        removedNames: removed.sort(),
    };
}
