"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SyntheticOutputTool = exports.SYNTHETIC_OUTPUT_TOOL_NAME = void 0;
exports.isSyntheticOutputToolEnabled = isSyntheticOutputToolEnabled;
exports.createSyntheticOutputTool = createSyntheticOutputTool;
var ajv_1 = require("ajv");
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var errors_js_1 = require("../../utils/errors.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
// Allow any input object since the schema is provided dynamically
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.object({}).passthrough(); });
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.string().describe('Structured output tool result');
});
exports.SYNTHETIC_OUTPUT_TOOL_NAME = 'StructuredOutput';
function isSyntheticOutputToolEnabled(opts) {
    return opts.isNonInteractiveSession;
}
exports.SyntheticOutputTool = (0, Tool_js_1.buildTool)({
    isMcp: false,
    isEnabled: function () {
        // This tool is only created when conditions are met (see main.tsx where
        // isSyntheticOutputToolEnabled() gates tool creation). Once created, always enabled.
        return true;
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    isOpenWorld: function () {
        return false;
    },
    name: exports.SYNTHETIC_OUTPUT_TOOL_NAME,
    searchHint: 'return the final response as structured JSON',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Return structured output in the requested format'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, "Use this tool to return your final response in the requested structured format. You MUST call this tool exactly once at the end of your response to provide the structured output."];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    call: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // The tool just validates and returns the input as the structured output
                return [2 /*return*/, {
                        data: 'Structured output provided successfully',
                        structured_output: input,
                    }];
            });
        });
    },
    checkPermissions: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Always allow this tool - it's just returning data
                return [2 /*return*/, {
                        behavior: 'allow',
                        updatedInput: input,
                    }];
            });
        });
    },
    // Minimal UI implementations - this tool is for non-interactive SDK/CLI use
    renderToolUseMessage: function (input) {
        var keys = Object.keys(input);
        if (keys.length === 0)
            return null;
        if (keys.length <= 3) {
            return keys.map(function (k) { return "".concat(k, ": ").concat((0, slowOperations_js_1.jsonStringify)(input[k])); }).join(', ');
        }
        return "".concat(keys.length, " fields: ").concat(keys.slice(0, 3).join(', '), "\u2026");
    },
    renderToolUseRejectedMessage: function () {
        return 'Structured output rejected';
    },
    renderToolUseErrorMessage: function () {
        return 'Structured output error';
    },
    renderToolUseProgressMessage: function () {
        return null;
    },
    renderToolResultMessage: function (output) {
        return output;
    },
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: content,
        };
    },
});
// Workflow scripts call agent({schema: BUGS_SCHEMA}) 30-80 times per run with
// the same schema object reference. Without caching, each call does
// new Ajv() + validateSchema() + compile() (~1.4ms of JIT codegen). Identity
// cache brings 80-call workflows from ~110ms to ~4ms Ajv overhead.
var toolCache = new WeakMap();
/**
 * Create a SyntheticOutputTool configured with the given JSON schema.
 * Returns {tool} on success or {error} with Ajv's diagnostic message
 * (e.g. "data/properties/bugs should be object") on invalid schema.
 */
function createSyntheticOutputTool(jsonSchema) {
    var cached = toolCache.get(jsonSchema);
    if (cached)
        return cached;
    var result = buildSyntheticOutputTool(jsonSchema);
    toolCache.set(jsonSchema, result);
    return result;
}
function buildSyntheticOutputTool(jsonSchema) {
    try {
        var ajv = new ajv_1.Ajv({ allErrors: true });
        var isValidSchema = ajv.validateSchema(jsonSchema);
        if (!isValidSchema) {
            return { error: ajv.errorsText(ajv.errors) };
        }
        var validateSchema_1 = ajv.compile(jsonSchema);
        return {
            tool: __assign(__assign({}, exports.SyntheticOutputTool), { inputJSONSchema: jsonSchema, call: function (input) {
                    return __awaiter(this, void 0, void 0, function () {
                        var isValid, errors;
                        var _a;
                        return __generator(this, function (_b) {
                            isValid = validateSchema_1(input);
                            if (!isValid) {
                                errors = (_a = validateSchema_1.errors) === null || _a === void 0 ? void 0 : _a.map(function (e) { return "".concat(e.instancePath || 'root', ": ").concat(e.message); }).join(', ');
                                throw new errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS("Output does not match required schema: ".concat(errors), "StructuredOutput schema mismatch: ".concat((errors !== null && errors !== void 0 ? errors : '').slice(0, 150)));
                            }
                            return [2 /*return*/, {
                                    data: 'Structured output provided successfully',
                                    structured_output: input,
                                }];
                        });
                    });
                } }),
        };
    }
    catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
    }
}
