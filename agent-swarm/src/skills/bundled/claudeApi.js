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
exports.registerClaudeApiSkill = registerClaudeApiSkill;
var promises_1 = require("fs/promises");
var cwd_js_1 = require("../../utils/cwd.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
var LANGUAGE_INDICATORS = {
    python: ['.py', 'requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
    typescript: ['.ts', '.tsx', 'tsconfig.json', 'package.json'],
    java: ['.java', 'pom.xml', 'build.gradle'],
    go: ['.go', 'go.mod'],
    ruby: ['.rb', 'Gemfile'],
    csharp: ['.cs', '.csproj'],
    php: ['.php', 'composer.json'],
    curl: [],
};
function detectLanguage() {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, entries, _a, _i, _b, _c, lang, indicators, _loop_1, _d, indicators_1, indicator, state_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    cwd = (0, cwd_js_1.getCwd)();
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(cwd)];
                case 2:
                    entries = _e.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _e.sent();
                    return [2 /*return*/, null];
                case 4:
                    for (_i = 0, _b = Object.entries(LANGUAGE_INDICATORS); _i < _b.length; _i++) {
                        _c = _b[_i], lang = _c[0], indicators = _c[1];
                        if (indicators.length === 0)
                            continue;
                        _loop_1 = function (indicator) {
                            if (indicator.startsWith('.')) {
                                if (entries.some(function (e) { return e.endsWith(indicator); }))
                                    return { value: lang };
                            }
                            else {
                                if (entries.includes(indicator))
                                    return { value: lang };
                            }
                        };
                        for (_d = 0, indicators_1 = indicators; _d < indicators_1.length; _d++) {
                            indicator = indicators_1[_d];
                            state_1 = _loop_1(indicator);
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                        }
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function getFilesForLanguage(lang, content) {
    return Object.keys(content.SKILL_FILES).filter(function (path) { return path.startsWith("".concat(lang, "/")) || path.startsWith('shared/'); });
}
function processContent(md, content) {
    // Strip HTML comments. Loop to handle nested comments.
    var out = md;
    var prev;
    do {
        prev = out;
        out = out.replace(/<!--[\s\S]*?-->\n?/g, '');
    } while (out !== prev);
    out = out.replace(/\{\{(\w+)\}\}/g, function (match, key) { var _a; return (_a = content.SKILL_MODEL_VARS[key]) !== null && _a !== void 0 ? _a : match; });
    return out;
}
function buildInlineReference(filePaths, content) {
    var sections = [];
    for (var _i = 0, _a = filePaths.sort(); _i < _a.length; _i++) {
        var filePath = _a[_i];
        var md = content.SKILL_FILES[filePath];
        if (!md)
            continue;
        sections.push("<doc path=\"".concat(filePath, "\">\n").concat(processContent(md, content).trim(), "\n</doc>"));
    }
    return sections.join('\n\n');
}
var INLINE_READING_GUIDE = "## Reference Documentation\n\nThe relevant documentation for your detected language is included below in `<doc>` tags. Each tag has a `path` attribute showing its original file path. Use this to find the right section:\n\n### Quick Task Reference\n\n**Single text classification/summarization/extraction/Q&A:**\n\u2192 Refer to `{lang}/claude-api/README.md`\n\n**Chat UI or real-time response display:**\n\u2192 Refer to `{lang}/claude-api/README.md` + `{lang}/claude-api/streaming.md`\n\n**Long-running conversations (may exceed context window):**\n\u2192 Refer to `{lang}/claude-api/README.md` \u2014 see Compaction section\n\n**Prompt caching / optimize caching / \"why is my cache hit rate low\":**\n\u2192 Refer to `shared/prompt-caching.md` + `{lang}/claude-api/README.md` (Prompt Caching section)\n\n**Function calling / tool use / agents:**\n\u2192 Refer to `{lang}/claude-api/README.md` + `shared/tool-use-concepts.md` + `{lang}/claude-api/tool-use.md`\n\n**Batch processing (non-latency-sensitive):**\n\u2192 Refer to `{lang}/claude-api/README.md` + `{lang}/claude-api/batches.md`\n\n**File uploads across multiple requests:**\n\u2192 Refer to `{lang}/claude-api/README.md` + `{lang}/claude-api/files-api.md`\n\n**Agent with built-in tools (file/web/terminal) (Python & TypeScript only):**\n\u2192 Refer to `{lang}/agent-sdk/README.md` + `{lang}/agent-sdk/patterns.md`\n\n**Error handling:**\n\u2192 Refer to `shared/error-codes.md`\n\n**Latest docs via WebFetch:**\n\u2192 Refer to `shared/live-sources.md` for URLs";
function buildPrompt(lang, args, content) {
    // Take the SKILL.md content up to the "Reading Guide" section
    var cleanPrompt = processContent(content.SKILL_PROMPT, content);
    var readingGuideIdx = cleanPrompt.indexOf('## Reading Guide');
    var basePrompt = readingGuideIdx !== -1
        ? cleanPrompt.slice(0, readingGuideIdx).trimEnd()
        : cleanPrompt;
    var parts = [basePrompt];
    if (lang) {
        var filePaths = getFilesForLanguage(lang, content);
        var readingGuide = INLINE_READING_GUIDE.replace(/\{lang\}/g, lang);
        parts.push(readingGuide);
        parts.push('---\n\n## Included Documentation\n\n' +
            buildInlineReference(filePaths, content));
    }
    else {
        // No language detected — include all docs and let the model ask
        parts.push(INLINE_READING_GUIDE.replace(/\{lang\}/g, 'unknown'));
        parts.push('No project language was auto-detected. Ask the user which language they are using, then refer to the matching docs below.');
        parts.push('---\n\n## Included Documentation\n\n' +
            buildInlineReference(Object.keys(content.SKILL_FILES), content));
    }
    // Preserve the "When to Use WebFetch" and "Common Pitfalls" sections
    var webFetchIdx = cleanPrompt.indexOf('## When to Use WebFetch');
    if (webFetchIdx !== -1) {
        parts.push(cleanPrompt.slice(webFetchIdx).trimEnd());
    }
    if (args) {
        parts.push("## User Request\n\n".concat(args));
    }
    return parts.join('\n\n');
}
function registerClaudeApiSkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'claude-api',
        description: 'Build apps with the Claude API or Anthropic SDK.\n' +
            'TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`/`claude_agent_sdk`, or user asks to use Claude API, Anthropic SDKs, or Agent SDK.\n' +
            'DO NOT TRIGGER when: code imports `openai`/other AI SDK, general programming, or ML/data-science tasks.',
        allowedTools: ['Read', 'Grep', 'Glob', 'WebFetch'],
        userInvocable: true,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var content, lang, prompt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./claudeApiContent.js'); })];
                        case 1:
                            content = _a.sent();
                            return [4 /*yield*/, detectLanguage()];
                        case 2:
                            lang = _a.sent();
                            prompt = buildPrompt(lang, args, content);
                            return [2 /*return*/, [{ type: 'text', text: prompt }]];
                    }
                });
            });
        },
    });
}
