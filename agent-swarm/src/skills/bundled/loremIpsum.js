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
exports.registerLoremIpsumSkill = registerLoremIpsumSkill;
var bundledSkills_js_1 = require("../bundledSkills.js");
// Verified 1-token words (tested via API token counting)
// All common English words confirmed to tokenize as single tokens
var ONE_TOKEN_WORDS = [
    // Articles & pronouns
    'the',
    'a',
    'an',
    'I',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'its',
    'our',
    'this',
    'that',
    'what',
    'who',
    // Common verbs
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'can',
    'could',
    'may',
    'might',
    'must',
    'shall',
    'should',
    'make',
    'made',
    'get',
    'got',
    'go',
    'went',
    'come',
    'came',
    'see',
    'saw',
    'know',
    'take',
    'think',
    'look',
    'want',
    'use',
    'find',
    'give',
    'tell',
    'work',
    'call',
    'try',
    'ask',
    'need',
    'feel',
    'seem',
    'leave',
    'put',
    // Common nouns & adjectives
    'time',
    'year',
    'day',
    'way',
    'man',
    'thing',
    'life',
    'hand',
    'part',
    'place',
    'case',
    'point',
    'fact',
    'good',
    'new',
    'first',
    'last',
    'long',
    'great',
    'little',
    'own',
    'other',
    'old',
    'right',
    'big',
    'high',
    'small',
    'large',
    'next',
    'early',
    'young',
    'few',
    'public',
    'bad',
    'same',
    'able',
    // Prepositions & conjunctions
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'from',
    'by',
    'about',
    'like',
    'through',
    'over',
    'before',
    'between',
    'under',
    'since',
    'without',
    'and',
    'or',
    'but',
    'if',
    'than',
    'because',
    'as',
    'until',
    'while',
    'so',
    'though',
    'both',
    'each',
    'when',
    'where',
    'why',
    'how',
    // Common adverbs
    'not',
    'now',
    'just',
    'more',
    'also',
    'here',
    'there',
    'then',
    'only',
    'very',
    'well',
    'back',
    'still',
    'even',
    'much',
    'too',
    'such',
    'never',
    'again',
    'most',
    'once',
    'off',
    'away',
    'down',
    'out',
    'up',
    // Tech/common words
    'test',
    'code',
    'data',
    'file',
    'line',
    'text',
    'word',
    'number',
    'system',
    'program',
    'set',
    'run',
    'value',
    'name',
    'type',
    'state',
    'end',
    'start',
];
function generateLoremIpsum(targetTokens) {
    var tokens = 0;
    var result = '';
    while (tokens < targetTokens) {
        // Sentence: 10-20 words
        var sentenceLength = 10 + Math.floor(Math.random() * 11);
        var wordsInSentence = 0;
        for (var i = 0; i < sentenceLength && tokens < targetTokens; i++) {
            var word = ONE_TOKEN_WORDS[Math.floor(Math.random() * ONE_TOKEN_WORDS.length)];
            result += word;
            tokens++;
            wordsInSentence++;
            if (i === sentenceLength - 1 || tokens >= targetTokens) {
                result += '. ';
            }
            else {
                result += ' ';
            }
        }
        // Paragraph break every 5-8 sentences (roughly 20% chance per sentence)
        if (wordsInSentence > 0 && Math.random() < 0.2 && tokens < targetTokens) {
            result += '\n\n';
        }
    }
    return result.trim();
}
function registerLoremIpsumSkill() {
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'lorem-ipsum',
        description: 'Generate filler text for long context testing. Specify token count as argument (e.g., /lorem-ipsum 50000). Outputs approximately the requested number of tokens. Ant-only.',
        argumentHint: '[token_count]',
        userInvocable: true,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var parsed, targetTokens, cappedTokens, loremText;
                return __generator(this, function (_a) {
                    parsed = parseInt(args);
                    if (args && (isNaN(parsed) || parsed <= 0)) {
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: 'Invalid token count. Please provide a positive number (e.g., /lorem-ipsum 10000).',
                                },
                            ]];
                    }
                    targetTokens = parsed || 10000;
                    cappedTokens = Math.min(targetTokens, 500000);
                    if (cappedTokens < targetTokens) {
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: "Requested ".concat(targetTokens, " tokens, but capped at 500,000 for safety.\n\n").concat(generateLoremIpsum(cappedTokens)),
                                },
                            ]];
                    }
                    loremText = generateLoremIpsum(cappedTokens);
                    // Just dump the lorem ipsum text into the conversation
                    return [2 /*return*/, [
                            {
                                type: 'text',
                                text: loremText,
                            },
                        ]];
                });
            });
        },
    });
}
