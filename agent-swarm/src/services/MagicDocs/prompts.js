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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMagicDocsUpdatePrompt = buildMagicDocsUpdatePrompt;
var path_1 = require("path");
var envUtils_js_1 = require("../../utils/envUtils.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
/**
 * Get the Magic Docs update prompt template
 */
function getUpdatePromptTemplate() {
    return "IMPORTANT: This message and these instructions are NOT part of the actual user conversation. Do NOT include any references to \"documentation updates\", \"magic docs\", or these update instructions in the document content.\n\nBased on the user conversation above (EXCLUDING this documentation update instruction message), update the Magic Doc file to incorporate any NEW learnings, insights, or information that would be valuable to preserve.\n\nThe file {{docPath}} has already been read for you. Here are its current contents:\n<current_doc_content>\n{{docContents}}\n</current_doc_content>\n\nDocument title: {{docTitle}}\n{{customInstructions}}\n\nYour ONLY task is to use the Edit tool to update the documentation file if there is substantial new information to add, then stop. You can make multiple edits (update multiple sections as needed) - make all Edit tool calls in parallel in a single message. If there's nothing substantial to add, simply respond with a brief explanation and do not call any tools.\n\nCRITICAL RULES FOR EDITING:\n- Preserve the Magic Doc header exactly as-is: # MAGIC DOC: {{docTitle}}\n- If there's an italicized line immediately after the header, preserve it exactly as-is\n- Keep the document CURRENT with the latest state of the codebase - this is NOT a changelog or history\n- Update information IN-PLACE to reflect the current state - do NOT append historical notes or track changes over time\n- Remove or replace outdated information rather than adding \"Previously...\" or \"Updated to...\" notes\n- Clean up or DELETE sections that are no longer relevant or don't align with the document's purpose\n- Fix obvious errors: typos, grammar mistakes, broken formatting, incorrect information, or confusing statements\n- Keep the document well organized: use clear headings, logical section order, consistent formatting, and proper nesting\n\nDOCUMENTATION PHILOSOPHY - READ CAREFULLY:\n- BE TERSE. High signal only. No filler words or unnecessary elaboration.\n- Documentation is for OVERVIEWS, ARCHITECTURE, and ENTRY POINTS - not detailed code walkthroughs\n- Do NOT duplicate information that's already obvious from reading the source code\n- Do NOT document every function, parameter, or line number reference\n- Focus on: WHY things exist, HOW components connect, WHERE to start reading, WHAT patterns are used\n- Skip: detailed implementation steps, exhaustive API docs, play-by-play narratives\n\nWhat TO document:\n- High-level architecture and system design\n- Non-obvious patterns, conventions, or gotchas\n- Key entry points and where to start reading code\n- Important design decisions and their rationale\n- Critical dependencies or integration points\n- References to related files, docs, or code (like a wiki) - help readers navigate to relevant context\n\nWhat NOT to document:\n- Anything obvious from reading the code itself\n- Exhaustive lists of files, functions, or parameters\n- Step-by-step implementation details\n- Low-level code mechanics\n- Information already in CLAUDE.md or other project docs\n\nUse the Edit tool with file_path: {{docPath}}\n\nREMEMBER: Only update if there is substantial new information. The Magic Doc header (# MAGIC DOC: {{docTitle}}) must remain unchanged.";
}
/**
 * Load custom Magic Docs prompt from file if it exists
 * Custom prompts can be placed at ~/.claude/magic-docs/prompt.md
 * Use {{variableName}} syntax for variable substitution (e.g., {{docContents}}, {{docPath}}, {{docTitle}})
 */
function loadMagicDocsPrompt() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, promptPath, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    promptPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'magic-docs', 'prompt.md');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(promptPath, { encoding: 'utf-8' })];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    _a = _b.sent();
                    // Silently fall back to default if custom prompt doesn't exist or fails to load
                    return [2 /*return*/, getUpdatePromptTemplate()];
                case 4: return [2 /*return*/];
            }
        });
    });
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
 * Build the Magic Docs update prompt with variable substitution
 */
function buildMagicDocsUpdatePrompt(docContents, docPath, docTitle, instructions) {
    return __awaiter(this, void 0, void 0, function () {
        var promptTemplate, customInstructions, variables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadMagicDocsPrompt()
                    // Build custom instructions section if provided
                ];
                case 1:
                    promptTemplate = _a.sent();
                    customInstructions = instructions
                        ? "\n\nDOCUMENT-SPECIFIC UPDATE INSTRUCTIONS:\nThe document author has provided specific instructions for how this file should be updated. Pay extra attention to these instructions and follow them carefully:\n\n\"".concat(instructions, "\"\n\nThese instructions take priority over the general rules below. Make sure your updates align with these specific guidelines.")
                        : '';
                    variables = {
                        docContents: docContents,
                        docPath: docPath,
                        docTitle: docTitle,
                        customInstructions: customInstructions,
                    };
                    return [2 /*return*/, substituteVariables(promptTemplate, variables)];
            }
        });
    });
}
