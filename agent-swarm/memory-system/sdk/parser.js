"use strict";
/**
 * XML Parser Module
 * Parses observation and summary XML blocks from SDK responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseObservations = parseObservations;
exports.parseSummary = parseSummary;
var logger_js_1 = require("../utils/logger.js");
var ModeManager_js_1 = require("../services/domain/ModeManager.js");
/**
 * Parse observation XML blocks from SDK response
 * Returns all observations found in the response
 */
function parseObservations(text, correlationId) {
    var observations = [];
    // Match <observation>...</observation> blocks (non-greedy)
    var observationRegex = /<observation>([\s\S]*?)<\/observation>/g;
    var match;
    var _loop_1 = function () {
        var obsContent = match[1];
        // Extract all fields
        var type = extractField(obsContent, 'type');
        var title = extractField(obsContent, 'title');
        var subtitle = extractField(obsContent, 'subtitle');
        var narrative = extractField(obsContent, 'narrative');
        var facts = extractArrayElements(obsContent, 'facts', 'fact');
        var concepts = extractArrayElements(obsContent, 'concepts', 'concept');
        var files_read = extractArrayElements(obsContent, 'files_read', 'file');
        var files_modified = extractArrayElements(obsContent, 'files_modified', 'file');
        // NOTE FROM THEDOTMACK: ALWAYS save observations - never skip. 10/24/2025
        // All fields except type are nullable in schema
        // If type is missing or invalid, use first type from mode as fallback
        // Determine final type using active mode's valid types
        var mode = ModeManager_js_1.ModeManager.getInstance().getActiveMode();
        var validTypes = mode.observation_types.map(function (t) { return t.id; });
        var fallbackType = validTypes[0]; // First type in mode's list is the fallback
        var finalType = fallbackType;
        if (type) {
            if (validTypes.includes(type.trim())) {
                finalType = type.trim();
            }
            else {
                logger_js_1.logger.error('PARSER', "Invalid observation type: ".concat(type, ", using \"").concat(fallbackType, "\""), { correlationId: correlationId });
            }
        }
        else {
            logger_js_1.logger.error('PARSER', "Observation missing type field, using \"".concat(fallbackType, "\""), { correlationId: correlationId });
        }
        // All other fields are optional - save whatever we have
        // Filter out type from concepts array (types and concepts are separate dimensions)
        var cleanedConcepts = concepts.filter(function (c) { return c !== finalType; });
        if (cleanedConcepts.length !== concepts.length) {
            logger_js_1.logger.error('PARSER', 'Removed observation type from concepts array', {
                correlationId: correlationId,
                type: finalType,
                originalConcepts: concepts,
                cleanedConcepts: cleanedConcepts
            });
        }
        observations.push({
            type: finalType,
            title: title,
            subtitle: subtitle,
            facts: facts,
            narrative: narrative,
            concepts: cleanedConcepts,
            files_read: files_read,
            files_modified: files_modified
        });
    };
    while ((match = observationRegex.exec(text)) !== null) {
        _loop_1();
    }
    return observations;
}
/**
 * Parse summary XML block from SDK response
 * Returns null if no valid summary found or if summary was skipped
 */
function parseSummary(text, sessionId) {
    // Check for skip_summary first
    var skipRegex = /<skip_summary\s+reason="([^"]+)"\s*\/>/;
    var skipMatch = skipRegex.exec(text);
    if (skipMatch) {
        logger_js_1.logger.info('PARSER', 'Summary skipped', {
            sessionId: sessionId,
            reason: skipMatch[1]
        });
        return null;
    }
    // Match <summary>...</summary> block (non-greedy)
    var summaryRegex = /<summary>([\s\S]*?)<\/summary>/;
    var summaryMatch = summaryRegex.exec(text);
    if (!summaryMatch) {
        // Log when the response contains <observation> instead of <summary>
        // to help diagnose prompt conditioning issues (see #1312)
        if (/<observation>/.test(text)) {
            logger_js_1.logger.warn('PARSER', 'Summary response contained <observation> tags instead of <summary> — prompt conditioning may need strengthening', { sessionId: sessionId });
        }
        return null;
    }
    var summaryContent = summaryMatch[1];
    // Extract fields
    var request = extractField(summaryContent, 'request');
    var investigated = extractField(summaryContent, 'investigated');
    var learned = extractField(summaryContent, 'learned');
    var completed = extractField(summaryContent, 'completed');
    var next_steps = extractField(summaryContent, 'next_steps');
    var notes = extractField(summaryContent, 'notes'); // Optional
    // NOTE FROM THEDOTMACK: 100% of the time we must SAVE the summary, even if fields are missing. 10/24/2025 
    // NEVER DO THIS NONSENSE AGAIN.
    // Validate required fields are present (notes is optional)
    // if (!request || !investigated || !learned || !completed || !next_steps) {
    //   logger.warn('PARSER', 'Summary missing required fields', {
    //     sessionId,
    //     hasRequest: !!request,
    //     hasInvestigated: !!investigated,
    //     hasLearned: !!learned,
    //     hasCompleted: !!completed,
    //     hasNextSteps: !!next_steps
    //   });
    //   return null;
    // }
    return {
        request: request,
        investigated: investigated,
        learned: learned,
        completed: completed,
        next_steps: next_steps,
        notes: notes
    };
}
/**
 * Extract a simple field value from XML content
 * Returns null for missing or empty/whitespace-only fields
 *
 * Uses non-greedy match to handle nested tags and code snippets (Issue #798)
 */
function extractField(content, fieldName) {
    // Use [\s\S]*? to match any character including newlines, non-greedily
    // This handles nested XML tags like <item>...</item> inside the field
    var regex = new RegExp("<".concat(fieldName, ">([\\s\\S]*?)</").concat(fieldName, ">"));
    var match = regex.exec(content);
    if (!match)
        return null;
    var trimmed = match[1].trim();
    return trimmed === '' ? null : trimmed;
}
/**
 * Extract array of elements from XML content
 * Handles nested tags and code snippets (Issue #798)
 */
function extractArrayElements(content, arrayName, elementName) {
    var elements = [];
    // Match the array block using [\s\S]*? for nested content
    var arrayRegex = new RegExp("<".concat(arrayName, ">([\\s\\S]*?)</").concat(arrayName, ">"));
    var arrayMatch = arrayRegex.exec(content);
    if (!arrayMatch) {
        return elements;
    }
    var arrayContent = arrayMatch[1];
    // Extract individual elements using [\s\S]*? for nested content
    var elementRegex = new RegExp("<".concat(elementName, ">([\\s\\S]*?)</").concat(elementName, ">"), 'g');
    var elementMatch;
    while ((elementMatch = elementRegex.exec(arrayContent)) !== null) {
        var trimmed = elementMatch[1].trim();
        if (trimmed) {
            elements.push(trimmed);
        }
    }
    return elements;
}
