#!/usr/bin/env node
"use strict";
/**
 * Import XML observations back into the database
 * Parses actual_xml_only_with_timestamps.xml and inserts observations via SessionStore
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var SessionStore_js_1 = require("../services/sqlite/SessionStore.js");
var logger_js_1 = require("../utils/logger.js");
/**
 * Build a map of timestamp (rounded to second) -> session metadata by reading all transcript files
 * Since XML timestamps are rounded to seconds, we map by second
 */
function buildTimestampMap() {
    var transcriptDir = (0, path_1.join)((0, os_1.homedir)(), '.claude', 'projects', '-Users-alexnewman-Scripts-claude-mem');
    var map = {};
    console.log("Reading transcript files from ".concat(transcriptDir, "..."));
    var files = (0, fs_1.readdirSync)(transcriptDir).filter(function (f) { return f.endsWith('.jsonl'); });
    console.log("Found ".concat(files.length, " transcript files"));
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var filename = files_1[_i];
        var filepath = (0, path_1.join)(transcriptDir, filename);
        var content = (0, fs_1.readFileSync)(filepath, 'utf-8');
        var lines = content.split('\n').filter(function (l) { return l.trim(); });
        for (var index = 0; index < lines.length; index++) {
            var line = lines[index];
            try {
                var data = JSON.parse(line);
                var timestamp = data.timestamp;
                var sessionId = data.sessionId;
                var project = data.cwd;
                if (timestamp && sessionId) {
                    // Round timestamp to second for matching with XML timestamps
                    var roundedTimestamp = new Date(timestamp);
                    roundedTimestamp.setMilliseconds(0);
                    var key = roundedTimestamp.toISOString();
                    // Only store first occurrence for each second (they're all the same session anyway)
                    if (!map[key]) {
                        map[key] = { sessionId: sessionId, project: project };
                    }
                }
            }
            catch (e) {
                logger_js_1.logger.debug('IMPORT', 'Skipping invalid JSON line', {
                    lineNumber: index + 1,
                    filename: filename,
                    error: e instanceof Error ? e.message : String(e)
                });
            }
        }
    }
    console.log("Built timestamp map with ".concat(Object.keys(map).length, " unique seconds"));
    return map;
}
/**
 * Parse XML text content and extract tag value
 */
function extractTag(xml, tagName) {
    var regex = new RegExp("<".concat(tagName, ">([\\s\\S]*?)</").concat(tagName, ">"), 'i');
    var match = xml.match(regex);
    return match ? match[1].trim() : '';
}
/**
 * Parse XML array tags (facts, concepts, files, etc.)
 */
function extractArrayTags(xml, containerTag, itemTag) {
    var containerRegex = new RegExp("<".concat(containerTag, ">([\\s\\S]*?)</").concat(containerTag, ">"), 'i');
    var containerMatch = xml.match(containerRegex);
    if (!containerMatch) {
        return [];
    }
    var containerContent = containerMatch[1];
    var itemRegex = new RegExp("<".concat(itemTag, ">([\\s\\S]*?)</").concat(itemTag, ">"), 'gi');
    var items = [];
    var match;
    while ((match = itemRegex.exec(containerContent)) !== null) {
        items.push(match[1].trim());
    }
    return items;
}
/**
 * Parse an observation block from XML
 */
function parseObservation(xml) {
    // Must be a complete observation block
    if (!xml.includes('<observation>') || !xml.includes('</observation>')) {
        return null;
    }
    try {
        var observation = {
            type: extractTag(xml, 'type'),
            title: extractTag(xml, 'title'),
            subtitle: extractTag(xml, 'subtitle'),
            facts: extractArrayTags(xml, 'facts', 'fact'),
            narrative: extractTag(xml, 'narrative'),
            concepts: extractArrayTags(xml, 'concepts', 'concept'),
            files_read: extractArrayTags(xml, 'files_read', 'file'),
            files_modified: extractArrayTags(xml, 'files_modified', 'file'),
        };
        // Validate required fields
        if (!observation.type || !observation.title) {
            return null;
        }
        return observation;
    }
    catch (e) {
        console.error('Error parsing observation:', e);
        return null;
    }
}
/**
 * Parse a summary block from XML
 */
function parseSummary(xml) {
    // Must be a complete summary block
    if (!xml.includes('<summary>') || !xml.includes('</summary>')) {
        return null;
    }
    try {
        var summary = {
            request: extractTag(xml, 'request'),
            investigated: extractTag(xml, 'investigated'),
            learned: extractTag(xml, 'learned'),
            completed: extractTag(xml, 'completed'),
            next_steps: extractTag(xml, 'next_steps'),
            notes: extractTag(xml, 'notes') || null,
        };
        // Validate required fields
        if (!summary.request) {
            return null;
        }
        return summary;
    }
    catch (e) {
        console.error('Error parsing summary:', e);
        return null;
    }
}
/**
 * Extract timestamp from XML comment
 * Format: <!-- Block N | 2025-10-19 03:03:23 UTC -->
 */
function extractTimestamp(commentLine) {
    var match = commentLine.match(/<!-- Block \d+ \| (.+?) -->/);
    if (match) {
        // Convert "2025-10-19 03:03:23 UTC" to ISO format
        var dateStr = match[1].replace(' UTC', '').replace(' ', 'T') + 'Z';
        return new Date(dateStr).toISOString();
    }
    return null;
}
/**
 * Main import function
 */
function main() {
    console.log('Starting XML observation import...\n');
    // Build timestamp map
    var timestampMap = buildTimestampMap();
    // Open database connection
    var db = new SessionStore_js_1.SessionStore();
    // Create SDK sessions for all unique Claude Code sessions
    console.log('\nCreating SDK sessions for imported data...');
    var claudeSessionToSdkSession = new Map();
    for (var _i = 0, _a = Object.values(timestampMap); _i < _a.length; _i++) {
        var sessionMeta = _a[_i];
        if (!claudeSessionToSdkSession.has(sessionMeta.sessionId)) {
            var syntheticSdkSessionId = "imported-".concat(sessionMeta.sessionId);
            // Try to find existing session first
            var existingQuery = db['db'].prepare("\n        SELECT memory_session_id\n        FROM sdk_sessions\n        WHERE content_session_id = ?\n      ");
            var existing = existingQuery.get(sessionMeta.sessionId);
            if (existing && existing.memory_session_id) {
                // Use existing SDK session ID
                claudeSessionToSdkSession.set(sessionMeta.sessionId, existing.memory_session_id);
            }
            else if (existing && !existing.memory_session_id) {
                // Session exists but memory_session_id is NULL, update it
                db['db'].prepare('UPDATE sdk_sessions SET memory_session_id = ? WHERE content_session_id = ?')
                    .run(syntheticSdkSessionId, sessionMeta.sessionId);
                claudeSessionToSdkSession.set(sessionMeta.sessionId, syntheticSdkSessionId);
            }
            else {
                // Create new SDK session
                db.createSDKSession(sessionMeta.sessionId, sessionMeta.project, 'Imported from transcript XML');
                // Update with synthetic SDK session ID
                db['db'].prepare('UPDATE sdk_sessions SET memory_session_id = ? WHERE content_session_id = ?')
                    .run(syntheticSdkSessionId, sessionMeta.sessionId);
                claudeSessionToSdkSession.set(sessionMeta.sessionId, syntheticSdkSessionId);
            }
        }
    }
    console.log("Prepared ".concat(claudeSessionToSdkSession.size, " SDK sessions\n"));
    // Read XML file
    var xmlPath = (0, path_1.join)(process.cwd(), 'actual_xml_only_with_timestamps.xml');
    console.log("Reading XML file: ".concat(xmlPath));
    var xmlContent = (0, fs_1.readFileSync)(xmlPath, 'utf-8');
    // Split into blocks by comment markers
    var blocks = xmlContent.split(/(?=<!-- Block \d+)/);
    console.log("Found ".concat(blocks.length, " blocks in XML file\n"));
    var importedObs = 0;
    var importedSum = 0;
    var skipped = 0;
    var duplicateObs = 0;
    var duplicateSum = 0;
    var noSession = 0;
    for (var _b = 0, blocks_1 = blocks; _b < blocks_1.length; _b++) {
        var block = blocks_1[_b];
        if (!block.trim() || block.startsWith('<?xml') || block.startsWith('<transcript_extracts')) {
            continue;
        }
        // Extract timestamp from comment
        var timestampIso = extractTimestamp(block);
        if (!timestampIso) {
            skipped++;
            continue;
        }
        // Look up session metadata
        var sessionMeta = timestampMap[timestampIso];
        if (!sessionMeta) {
            noSession++;
            if (noSession <= 5) {
                console.log("\u26A0\uFE0F  No session found for timestamp: ".concat(timestampIso));
            }
            skipped++;
            continue;
        }
        // Get SDK session ID
        var memorySessionId = claudeSessionToSdkSession.get(sessionMeta.sessionId);
        if (!memorySessionId) {
            skipped++;
            continue;
        }
        // Try parsing as observation first
        var observation = parseObservation(block);
        if (observation) {
            // Check for duplicate
            var existingObs = db['db'].prepare("\n        SELECT id FROM observations\n        WHERE memory_session_id = ? AND title = ? AND subtitle = ? AND type = ?\n      ").get(memorySessionId, observation.title, observation.subtitle, observation.type);
            if (existingObs) {
                duplicateObs++;
                continue;
            }
            try {
                db.storeObservation(memorySessionId, sessionMeta.project, observation);
                importedObs++;
                if (importedObs % 50 === 0) {
                    console.log("Imported ".concat(importedObs, " observations..."));
                }
            }
            catch (e) {
                console.error("Error storing observation:", e);
                skipped++;
            }
            continue;
        }
        // Try parsing as summary
        var summary = parseSummary(block);
        if (summary) {
            // Check for duplicate
            var existingSum = db['db'].prepare("\n        SELECT id FROM session_summaries\n        WHERE memory_session_id = ? AND request = ? AND completed = ? AND learned = ?\n      ").get(memorySessionId, summary.request, summary.completed, summary.learned);
            if (existingSum) {
                duplicateSum++;
                continue;
            }
            try {
                db.storeSummary(memorySessionId, sessionMeta.project, summary);
                importedSum++;
                if (importedSum % 10 === 0) {
                    console.log("Imported ".concat(importedSum, " summaries..."));
                }
            }
            catch (e) {
                console.error("Error storing summary:", e);
                skipped++;
            }
            continue;
        }
        // Neither observation nor summary - skip
        skipped++;
    }
    db.close();
    console.log('\n' + '='.repeat(60));
    console.log('Import Complete!');
    console.log('='.repeat(60));
    console.log("\u2713 Imported: ".concat(importedObs, " observations"));
    console.log("\u2713 Imported: ".concat(importedSum, " summaries"));
    console.log("\u2713 Total: ".concat(importedObs + importedSum, " items"));
    console.log("\u2298 Skipped: ".concat(skipped, " blocks (not full observations or summaries)"));
    console.log("\u2298 Duplicates skipped: ".concat(duplicateObs, " observations, ").concat(duplicateSum, " summaries"));
    console.log("\u26A0\uFE0F  No session: ".concat(noSession, " blocks (timestamp not in transcripts)"));
    console.log('='.repeat(60));
}
// Run if executed directly
if (import.meta.url === "file://".concat(process.argv[1])) {
    main();
}
