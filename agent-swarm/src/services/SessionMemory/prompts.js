"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.DEFAULT_SESSION_MEMORY_TEMPLATE = void 0;
exports.loadSessionMemoryTemplate = loadSessionMemoryTemplate;
exports.loadSessionMemoryPrompt = loadSessionMemoryPrompt;
exports.isSessionMemoryEmpty = isSessionMemoryEmpty;
exports.buildSessionMemoryUpdatePrompt = buildSessionMemoryUpdatePrompt;
exports.truncateSessionMemoryForCompact = truncateSessionMemoryForCompact;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var tokenEstimation_js_1 = require("../../services/tokenEstimation.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var MAX_SECTION_LENGTH = 2000;
var MAX_TOTAL_SESSION_MEMORY_TOKENS = 12000;
exports.DEFAULT_SESSION_MEMORY_TEMPLATE = "\n# Session Title\n_A short and distinctive 5-10 word descriptive title for the session. Super info dense, no filler_\n\n# Current State\n_What is actively being worked on right now? Pending tasks not yet completed. Immediate next steps._\n\n# Task specification\n_What did the user ask to build? Any design decisions or other explanatory context_\n\n# Files and Functions\n_What are the important files? In short, what do they contain and why are they relevant?_\n\n# Workflow\n_What bash commands are usually run and in what order? How to interpret their output if not obvious?_\n\n# Errors & Corrections\n_Errors encountered and how they were fixed. What did the user correct? What approaches failed and should not be tried again?_\n\n# Codebase and System Documentation\n_What are the important system components? How do they work/fit together?_\n\n# Learnings\n_What has worked well? What has not? What to avoid? Do not duplicate items from other sections_\n\n# Key results\n_If the user asked a specific output such as an answer to a question, a table, or other document, repeat the exact result here_\n\n# Worklog\n_Step by step, what was attempted, done? Very terse summary for each step_\n";
function getDefaultUpdatePrompt() {
    return "IMPORTANT: This message and these instructions are NOT part of the actual user conversation. Do NOT include any references to \"note-taking\", \"session notes extraction\", or these update instructions in the notes content.\n\nBased on the user conversation above (EXCLUDING this note-taking instruction message as well as system prompt, claude.md entries, or any past session summaries), update the session notes file.\n\nThe file {{notesPath}} has already been read for you. Here are its current contents:\n<current_notes_content>\n{{currentNotes}}\n</current_notes_content>\n\nYour ONLY task is to use the Edit tool to update the notes file, then stop. You can make multiple edits (update every section as needed) - make all Edit tool calls in parallel in a single message. Do not call any other tools.\n\nCRITICAL RULES FOR EDITING:\n- The file must maintain its exact structure with all sections, headers, and italic descriptions intact\n-- NEVER modify, delete, or add section headers (the lines starting with '#' like # Task specification)\n-- NEVER modify or delete the italic _section description_ lines (these are the lines in italics immediately following each header - they start and end with underscores)\n-- The italic _section descriptions_ are TEMPLATE INSTRUCTIONS that must be preserved exactly as-is - they guide what content belongs in each section\n-- ONLY update the actual content that appears BELOW the italic _section descriptions_ within each existing section\n-- Do NOT add any new sections, summaries, or information outside the existing structure\n- Do NOT reference this note-taking process or instructions anywhere in the notes\n- It's OK to skip updating a section if there are no substantial new insights to add. Do not add filler content like \"No info yet\", just leave sections blank/unedited if appropriate.\n- Write DETAILED, INFO-DENSE content for each section - include specifics like file paths, function names, error messages, exact commands, technical details, etc.\n- For \"Key results\", include the complete, exact output the user requested (e.g., full table, full answer, etc.)\n- Do not include information that's already in the CLAUDE.md files included in the context\n- Keep each section under ~".concat(MAX_SECTION_LENGTH, " tokens/words - if a section is approaching this limit, condense it by cycling out less important details while preserving the most critical information\n- Focus on actionable, specific information that would help someone understand or recreate the work discussed in the conversation\n- IMPORTANT: Always update \"Current State\" to reflect the most recent work - this is critical for continuity after compaction\n\nUse the Edit tool with file_path: {{notesPath}}\n\nSTRUCTURE PRESERVATION REMINDER:\nEach section has TWO parts that must be preserved exactly as they appear in the current file:\n1. The section header (line starting with #)\n2. The italic description line (the _italicized text_ immediately after the header - this is a template instruction)\n\nYou ONLY update the actual content that comes AFTER these two preserved lines. The italic description lines starting and ending with underscores are part of the template structure, NOT content to be edited or removed.\n\nREMEMBER: Use the Edit tool in parallel and stop. Do not continue after the edits. Only include insights from the actual user conversation, never from these note-taking instructions. Do not delete or change section headers or italic _section descriptions_.");
}
/**
 * Load custom session memory template from file if it exists
 */
function loadSessionMemoryTemplate() {
    return __awaiter(this, void 0, void 0, function () {
        var templatePath, e_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    templatePath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'session-memory', 'config', 'template.md');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(templatePath, { encoding: 'utf-8' })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, exports.DEFAULT_SESSION_MEMORY_TEMPLATE];
                    }
                    (0, log_js_1.logError)((0, errors_js_1.toError)(e_1));
                    return [2 /*return*/, exports.DEFAULT_SESSION_MEMORY_TEMPLATE];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load custom session memory prompt from file if it exists
 * Custom prompts can be placed at ~/.claude/session-memory/prompt.md
 * Use {{variableName}} syntax for variable substitution (e.g., {{currentNotes}}, {{notesPath}})
 */
function loadSessionMemoryPrompt() {
    return __awaiter(this, void 0, void 0, function () {
        var promptPath, e_2, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promptPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'session-memory', 'config', 'prompt.md');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(promptPath, { encoding: 'utf-8' })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    e_2 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, getDefaultUpdatePrompt()];
                    }
                    (0, log_js_1.logError)((0, errors_js_1.toError)(e_2));
                    return [2 /*return*/, getDefaultUpdatePrompt()];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Parse the session memory file and analyze section sizes
 */
function analyzeSectionSizes(content) {
    var sections = {};
    var lines = content.split('\n');
    var currentSection = '';
    var currentContent = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.startsWith('# ')) {
            if (currentSection && currentContent.length > 0) {
                var sectionContent = currentContent.join('\n').trim();
                sections[currentSection] = (0, tokenEstimation_js_1.roughTokenCountEstimation)(sectionContent);
            }
            currentSection = line;
            currentContent = [];
        }
        else {
            currentContent.push(line);
        }
    }
    if (currentSection && currentContent.length > 0) {
        var sectionContent = currentContent.join('\n').trim();
        sections[currentSection] = (0, tokenEstimation_js_1.roughTokenCountEstimation)(sectionContent);
    }
    return sections;
}
/**
 * Generate reminders for sections that are too long
 */
function generateSectionReminders(sectionSizes, totalTokens) {
    var overBudget = totalTokens > MAX_TOTAL_SESSION_MEMORY_TOKENS;
    var oversizedSections = Object.entries(sectionSizes)
        .filter(function (_a) {
        var _ = _a[0], tokens = _a[1];
        return tokens > MAX_SECTION_LENGTH;
    })
        .sort(function (_a, _b) {
        var a = _a[1];
        var b = _b[1];
        return b - a;
    })
        .map(function (_a) {
        var section = _a[0], tokens = _a[1];
        return "- \"".concat(section, "\" is ~").concat(tokens, " tokens (limit: ").concat(MAX_SECTION_LENGTH, ")");
    });
    if (oversizedSections.length === 0 && !overBudget) {
        return '';
    }
    var parts = [];
    if (overBudget) {
        parts.push("\n\nCRITICAL: The session memory file is currently ~".concat(totalTokens, " tokens, which exceeds the maximum of ").concat(MAX_TOTAL_SESSION_MEMORY_TOKENS, " tokens. You MUST condense the file to fit within this budget. Aggressively shorten oversized sections by removing less important details, merging related items, and summarizing older entries. Prioritize keeping \"Current State\" and \"Errors & Corrections\" accurate and detailed."));
    }
    if (oversizedSections.length > 0) {
        parts.push("\n\n".concat(overBudget ? 'Oversized sections to condense' : 'IMPORTANT: The following sections exceed the per-section limit and MUST be condensed', ":\n").concat(oversizedSections.join('\n')));
    }
    return parts.join('');
}
/**
 * Substitute variables in the prompt template using {{variable}} syntax
 */
function substituteVariables(template, variables) {
    // Single-pass replacement avoids two bugs: (1) $ backreference corruption
    // (replacer fn treats $ literally), and (2) double-substitution when user
    // content happens to contain {{varName}} matching a later variable.
    return template.replace(/\{\{(\w+)\}\}/g, function (match, key) {
        return Object.prototype.hasOwnProperty.call(variables, key)
            ? variables[key]
            : match;
    });
}
/**
 * Check if the session memory content is essentially empty (matches the template).
 * This is used to detect if no actual content has been extracted yet,
 * which means we should fall back to legacy compact behavior.
 */
function isSessionMemoryEmpty(content) {
    return __awaiter(this, void 0, void 0, function () {
        var template;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSessionMemoryTemplate()
                    // Compare trimmed content to detect if it's just the template
                ];
                case 1:
                    template = _a.sent();
                    // Compare trimmed content to detect if it's just the template
                    return [2 /*return*/, content.trim() === template.trim()];
            }
        });
    });
}
function buildSessionMemoryUpdatePrompt(currentNotes, notesPath) {
    return __awaiter(this, void 0, void 0, function () {
        var promptTemplate, sectionSizes, totalTokens, sectionReminders, variables, basePrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSessionMemoryPrompt()
                    // Analyze section sizes and generate reminders if needed
                ];
                case 1:
                    promptTemplate = _a.sent();
                    sectionSizes = analyzeSectionSizes(currentNotes);
                    totalTokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)(currentNotes);
                    sectionReminders = generateSectionReminders(sectionSizes, totalTokens);
                    variables = {
                        currentNotes: currentNotes,
                        notesPath: notesPath,
                    };
                    basePrompt = substituteVariables(promptTemplate, variables);
                    // Add section size reminders and/or total budget warnings
                    return [2 /*return*/, basePrompt + sectionReminders];
            }
        });
    });
}
/**
 * Truncate session memory sections that exceed the per-section token limit.
 * Used when inserting session memory into compact messages to prevent
 * oversized session memory from consuming the entire post-compact token budget.
 *
 * Returns the truncated content and whether any truncation occurred.
 */
function truncateSessionMemoryForCompact(content) {
    var lines = content.split('\n');
    var maxCharsPerSection = MAX_SECTION_LENGTH * 4; // roughTokenCountEstimation uses length/4
    var outputLines = [];
    var currentSectionLines = [];
    var currentSectionHeader = '';
    var wasTruncated = false;
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        if (line.startsWith('# ')) {
            var result_1 = flushSessionSection(currentSectionHeader, currentSectionLines, maxCharsPerSection);
            outputLines.push.apply(outputLines, result_1.lines);
            wasTruncated = wasTruncated || result_1.wasTruncated;
            currentSectionHeader = line;
            currentSectionLines = [];
        }
        else {
            currentSectionLines.push(line);
        }
    }
    // Flush the last section
    var result = flushSessionSection(currentSectionHeader, currentSectionLines, maxCharsPerSection);
    outputLines.push.apply(outputLines, result.lines);
    wasTruncated = wasTruncated || result.wasTruncated;
    return {
        truncatedContent: outputLines.join('\n'),
        wasTruncated: wasTruncated,
    };
}
function flushSessionSection(sectionHeader, sectionLines, maxCharsPerSection) {
    if (!sectionHeader) {
        return { lines: sectionLines, wasTruncated: false };
    }
    var sectionContent = sectionLines.join('\n');
    if (sectionContent.length <= maxCharsPerSection) {
        return { lines: __spreadArray([sectionHeader], sectionLines, true), wasTruncated: false };
    }
    // Truncate at a line boundary near the limit
    var charCount = 0;
    var keptLines = [sectionHeader];
    for (var _i = 0, sectionLines_1 = sectionLines; _i < sectionLines_1.length; _i++) {
        var line = sectionLines_1[_i];
        if (charCount + line.length + 1 > maxCharsPerSection) {
            break;
        }
        keptLines.push(line);
        charCount += line.length + 1;
    }
    keptLines.push('\n[... section truncated for length ...]');
    return { lines: keptLines, wasTruncated: true };
}
