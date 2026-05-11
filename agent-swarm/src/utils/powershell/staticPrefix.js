"use strict";
/**
 * PowerShell static command prefix extraction.
 *
 * Mirrors bash's getCommandPrefixStatic / getCompoundCommandPrefixesStatic
 * (src/utils/bash/prefix.ts) but uses the PowerShell AST parser instead of
 * tree-sitter. The AST gives us cmd.name and cmd.args already split; for
 * external commands we feed those into the same fig-spec walker bash uses
 * (src/utils/shell/specPrefix.ts) — git/npm/kubectl CLIs are shell-agnostic.
 *
 * Feeds the "Yes, and don't ask again for: ___" editable input in the
 * permission dialog — static extractor provides a best-guess prefix, user
 * edits it down if needed.
 */
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
exports.getCommandPrefixStatic = getCommandPrefixStatic;
exports.getCompoundCommandPrefixesStatic = getCompoundCommandPrefixesStatic;
var registry_js_1 = require("../bash/registry.js");
var specPrefix_js_1 = require("../shell/specPrefix.js");
var stringUtils_js_1 = require("../stringUtils.js");
var dangerousCmdlets_js_1 = require("./dangerousCmdlets.js");
var parser_js_1 = require("./parser.js");
/**
 * Extract a static prefix from a single parsed command element.
 * Returns null for commands we won't suggest (shells, eval cmdlets, path-like
 * invocations) or can't extract a meaningful prefix from.
 */
function extractPrefixFromElement(cmd) {
    return __awaiter(this, void 0, void 0, function () {
        var name, i, t, nameLower, spec, prefix, argIdx, _i, _a, word, _loop_1, state_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // nameType === 'application' means the raw name had path chars (./x, x\y,
                    // x.exe) — PowerShell will run a file, not a named cmdlet. Don't suggest.
                    // Same reasoning as the permission engine's nameType gate (PR #20096).
                    if (cmd.nameType === 'application') {
                        return [2 /*return*/, null];
                    }
                    name = cmd.name;
                    if (!name) {
                        return [2 /*return*/, null];
                    }
                    if (dangerousCmdlets_js_1.NEVER_SUGGEST.has(name.toLowerCase())) {
                        return [2 /*return*/, null];
                    }
                    // Cmdlets (Verb-Noun): the name alone is the right prefix granularity.
                    // Get-Process -Name pwsh → Get-Process. There's no subcommand concept.
                    if (cmd.nameType === 'cmdlet') {
                        return [2 /*return*/, name];
                    }
                    // External command. Guard the argv before feeding it to buildPrefix.
                    //
                    // elementTypes[0] (command name) must be a literal. `& $cmd status` has
                    // elementTypes[0]='Variable', name='$cmd' — classifies as 'unknown' (no path
                    // chars), passes NEVER_SUGGEST, getCommandSpec('$cmd')=null → returns bare
                    // '$cmd' → dead rule. Cheap to gate here.
                    //
                    // elementTypes[1..] (args) must all be StringConstant or Parameter. Anything
                    // dynamic (Variable/SubExpression/ScriptBlock/ExpandableString) would embed
                    // `$foo`/`$(...)` in the prefix → dead rule.
                    if (((_b = cmd.elementTypes) === null || _b === void 0 ? void 0 : _b[0]) !== 'StringConstant') {
                        return [2 /*return*/, null];
                    }
                    for (i = 0; i < cmd.args.length; i++) {
                        t = cmd.elementTypes[i + 1];
                        if (t !== 'StringConstant' && t !== 'Parameter') {
                            return [2 /*return*/, null];
                        }
                    }
                    nameLower = name.toLowerCase();
                    return [4 /*yield*/, (0, registry_js_1.getCommandSpec)(nameLower)];
                case 1:
                    spec = _d.sent();
                    return [4 /*yield*/, (0, specPrefix_js_1.buildPrefix)(name, cmd.args, spec)
                        // Post-buildPrefix word integrity: buildPrefix space-joins consumed args
                        // into the prefix string. parser.ts:685 stores .value (quote-stripped) for
                        // single-quoted literals: git 'push origin' → args=['push origin']. If
                        // that arg is consumed, buildPrefix emits 'git push origin' — silently
                        // promoting 1 argv element to 3 prefix words. Rule PowerShell(git push
                        // origin:*) then matches `git push origin --force` (3-element argv) — not
                        // what the user approved.
                        //
                        // The old set-membership check (`!cmd.args.includes(word)`) was defeated
                        // by decoy args: `git 'push origin' push origin` → args=['push origin',
                        // 'push', 'origin'], prefix='git push origin'. Each word ∈ args (decoys at
                        // indices 1,2 satisfy .includes()) → passed. Now POSITIONAL: walk args in
                        // order; each prefix word must exactly match the next non-flag arg. A
                        // positional that doesn't match means buildPrefix split it. Flags and
                        // their values are skipped (buildPrefix skips them too) so
                        // `git -C '/my repo' status` and `git commit -m 'fix typo'` still pass.
                        // Backslash (C:\repo) rejected: dead over-specific rule.
                    ];
                case 2:
                    prefix = _d.sent();
                    argIdx = 0;
                    for (_i = 0, _a = prefix.split(' ').slice(1); _i < _a.length; _i++) {
                        word = _a[_i];
                        if (word.includes('\\'))
                            return [2 /*return*/, null];
                        _loop_1 = function () {
                            var a = cmd.args[argIdx];
                            if (a === word)
                                return "break";
                            if (a.startsWith('-')) {
                                argIdx++;
                                // Only skip the flag's value if the spec says this flag takes a
                                // value argument. Without spec info, treat as a switch (no value)
                                // — fail-safe avoids over-skipping positional args. (bug #16)
                                if ((spec === null || spec === void 0 ? void 0 : spec.options) &&
                                    argIdx < cmd.args.length &&
                                    cmd.args[argIdx] !== word &&
                                    !cmd.args[argIdx].startsWith('-')) {
                                    var flagLower_1 = a.toLowerCase();
                                    var opt = spec.options.find(function (o) {
                                        return Array.isArray(o.name)
                                            ? o.name.includes(flagLower_1)
                                            : o.name === flagLower_1;
                                    });
                                    if (opt === null || opt === void 0 ? void 0 : opt.args) {
                                        argIdx++;
                                    }
                                }
                                return "continue";
                            }
                            return { value: null };
                        };
                        while (argIdx < cmd.args.length) {
                            state_1 = _loop_1();
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                            if (state_1 === "break")
                                break;
                        }
                        if (argIdx >= cmd.args.length)
                            return [2 /*return*/, null];
                        argIdx++;
                    }
                    // Bare-root guard: buildPrefix returns 'git' for `git` with no subcommand
                    // found (empty args, or only global flags). That's too broad — would
                    // auto-allow `git push --force` forever. Bash's extractor doesn't gate this
                    // (bash/prefix.ts:363, separate fix). Reject single-word results for
                    // commands whose spec declares subcommands OR that have DEPTH_RULES entries
                    // (gcloud, aws, kubectl, etc.) which implies subcommand structure even
                    // without a loaded spec. (bug #17)
                    if (!prefix.includes(' ') &&
                        (((_c = spec === null || spec === void 0 ? void 0 : spec.subcommands) === null || _c === void 0 ? void 0 : _c.length) || specPrefix_js_1.DEPTH_RULES[nameLower])) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, prefix];
            }
        });
    });
}
/**
 * Extract a prefix suggestion for a PowerShell command.
 *
 * Parses the command, takes the first CommandAst, returns a prefix suitable
 * for the permission dialog's "don't ask again for: ___" editable input.
 * Returns null when no safe prefix can be extracted (parse failure, shell
 * invocation, path-like name, bare subcommand-aware command).
 */
function getCommandPrefixStatic(command) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, firstCommand;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, parser_js_1.parsePowerShellCommand)(command)];
                case 1:
                    parsed = _b.sent();
                    if (!parsed.valid) {
                        return [2 /*return*/, null];
                    }
                    firstCommand = (0, parser_js_1.getAllCommands)(parsed).find(function (cmd) { return cmd.elementType === 'CommandAst'; });
                    if (!firstCommand) {
                        return [2 /*return*/, { commandPrefix: null }];
                    }
                    _a = {};
                    return [4 /*yield*/, extractPrefixFromElement(firstCommand)];
                case 2: return [2 /*return*/, (_a.commandPrefix = _b.sent(), _a)];
            }
        });
    });
}
/**
 * Extract prefixes for all subcommands in a compound PowerShell command.
 *
 * For `Get-Process; git status && npm test`, returns per-subcommand prefixes.
 * Subcommands for which `excludeSubcommand` returns true (e.g. already
 * read-only/auto-allowed) are skipped — no point suggesting a rule for them.
 * Prefixes sharing a root are collapsed via word-aligned LCP:
 * `npm run test && npm run lint` → `npm run`.
 *
 * The filter receives the ParsedCommandElement (not cmd.text) because
 * PowerShell's read-only check (isAllowlistedCommand) needs the element's
 * structured fields (nameType, args). Passing text would require reparsing,
 * which spawns pwsh.exe per subcommand — expensive and wasteful since we
 * already have the parsed elements here. Bash's equivalent passes text
 * because BashTool.isReadOnly works from regex/patterns, not parsed AST.
 */
function getCompoundCommandPrefixesStatic(command, excludeSubcommand) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, commands, prefix, _a, prefixes, _i, commands_1, cmd, prefix, groups, _b, prefixes_1, prefix, root, key, group, collapsed, _c, groups_1, _d, rootLower, group, lcp, lcpWordCount, rootSpec;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, parser_js_1.parsePowerShellCommand)(command)];
                case 1:
                    parsed = _f.sent();
                    if (!parsed.valid) {
                        return [2 /*return*/, []];
                    }
                    commands = (0, parser_js_1.getAllCommands)(parsed).filter(function (cmd) { return cmd.elementType === 'CommandAst'; });
                    if (!(commands.length <= 1)) return [3 /*break*/, 5];
                    if (!commands[0]) return [3 /*break*/, 3];
                    return [4 /*yield*/, extractPrefixFromElement(commands[0])];
                case 2:
                    _a = _f.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = null;
                    _f.label = 4;
                case 4:
                    prefix = _a;
                    return [2 /*return*/, prefix ? [prefix] : []];
                case 5:
                    prefixes = [];
                    _i = 0, commands_1 = commands;
                    _f.label = 6;
                case 6:
                    if (!(_i < commands_1.length)) return [3 /*break*/, 9];
                    cmd = commands_1[_i];
                    if (excludeSubcommand === null || excludeSubcommand === void 0 ? void 0 : excludeSubcommand(cmd)) {
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, extractPrefixFromElement(cmd)];
                case 7:
                    prefix = _f.sent();
                    if (prefix) {
                        prefixes.push(prefix);
                    }
                    _f.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    if (prefixes.length === 0) {
                        return [2 /*return*/, []];
                    }
                    groups = new Map();
                    for (_b = 0, prefixes_1 = prefixes; _b < prefixes_1.length; _b++) {
                        prefix = prefixes_1[_b];
                        root = prefix.split(' ')[0];
                        key = root.toLowerCase();
                        group = groups.get(key);
                        if (group) {
                            group.push(prefix);
                        }
                        else {
                            groups.set(key, [prefix]);
                        }
                    }
                    collapsed = [];
                    _c = 0, groups_1 = groups;
                    _f.label = 10;
                case 10:
                    if (!(_c < groups_1.length)) return [3 /*break*/, 14];
                    _d = groups_1[_c], rootLower = _d[0], group = _d[1];
                    lcp = wordAlignedLCP(group);
                    lcpWordCount = lcp === '' ? 0 : (0, stringUtils_js_1.countCharInString)(lcp, ' ') + 1;
                    if (!(lcpWordCount <= 1)) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, registry_js_1.getCommandSpec)(rootLower)];
                case 11:
                    rootSpec = _f.sent();
                    if (((_e = rootSpec === null || rootSpec === void 0 ? void 0 : rootSpec.subcommands) === null || _e === void 0 ? void 0 : _e.length) || specPrefix_js_1.DEPTH_RULES[rootLower]) {
                        return [3 /*break*/, 13];
                    }
                    _f.label = 12;
                case 12:
                    collapsed.push(lcp);
                    _f.label = 13;
                case 13:
                    _c++;
                    return [3 /*break*/, 10];
                case 14: return [2 /*return*/, collapsed];
            }
        });
    });
}
/**
 * Word-aligned longest common prefix. Doesn't chop mid-word.
 * Case-insensitive comparison (PowerShell: Git === git), emits first
 * string's casing.
 * ["npm run test", "npm run lint"] → "npm run"
 * ["Git status", "git log"] → "Git" (first-seen casing)
 * ["Get-Process"] → "Get-Process"
 */
function wordAlignedLCP(strings) {
    if (strings.length === 0)
        return '';
    if (strings.length === 1)
        return strings[0];
    var firstWords = strings[0].split(' ');
    var commonWordCount = firstWords.length;
    for (var i = 1; i < strings.length; i++) {
        var words = strings[i].split(' ');
        var matchCount = 0;
        while (matchCount < commonWordCount &&
            matchCount < words.length &&
            words[matchCount].toLowerCase() === firstWords[matchCount].toLowerCase()) {
            matchCount++;
        }
        commonWordCount = matchCount;
        if (commonWordCount === 0)
            break;
    }
    return firstWords.slice(0, commonWordCount).join(' ');
}
