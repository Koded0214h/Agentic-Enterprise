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
exports.isEnumSchema = void 0;
exports.isMultiSelectEnumSchema = isMultiSelectEnumSchema;
exports.getMultiSelectValues = getMultiSelectValues;
exports.getMultiSelectLabels = getMultiSelectLabels;
exports.getMultiSelectLabel = getMultiSelectLabel;
exports.getEnumValues = getEnumValues;
exports.getEnumLabels = getEnumLabels;
exports.getEnumLabel = getEnumLabel;
exports.validateElicitationInput = validateElicitationInput;
exports.getFormatHint = getFormatHint;
exports.isDateTimeSchema = isDateTimeSchema;
exports.validateElicitationInputAsync = validateElicitationInputAsync;
var v4_1 = require("zod/v4");
var slowOperations_js_1 = require("../slowOperations.js");
var stringUtils_js_1 = require("../stringUtils.js");
var dateTimeParser_js_1 = require("./dateTimeParser.js");
var STRING_FORMATS = {
    email: {
        description: 'email address',
        example: 'user@example.com',
    },
    uri: {
        description: 'URI',
        example: 'https://example.com',
    },
    date: {
        description: 'date',
        example: '2024-03-15',
    },
    'date-time': {
        description: 'date-time',
        example: '2024-03-15T14:30:00Z',
    },
};
/**
 * Check if schema is a single-select enum (either legacy `enum` format or new `oneOf` format)
 */
var isEnumSchema = function (schema) {
    return schema.type === 'string' && ('enum' in schema || 'oneOf' in schema);
};
exports.isEnumSchema = isEnumSchema;
/**
 * Check if schema is a multi-select enum (`type: "array"` with `items.enum` or `items.anyOf`)
 */
function isMultiSelectEnumSchema(schema) {
    return (schema.type === 'array' &&
        'items' in schema &&
        typeof schema.items === 'object' &&
        schema.items !== null &&
        ('enum' in schema.items || 'anyOf' in schema.items));
}
/**
 * Get values from a multi-select enum schema
 */
function getMultiSelectValues(schema) {
    if ('anyOf' in schema.items) {
        return schema.items.anyOf.map(function (item) { return item.const; });
    }
    if ('enum' in schema.items) {
        return schema.items.enum;
    }
    return [];
}
/**
 * Get display labels from a multi-select enum schema
 */
function getMultiSelectLabels(schema) {
    if ('anyOf' in schema.items) {
        return schema.items.anyOf.map(function (item) { return item.title; });
    }
    if ('enum' in schema.items) {
        return schema.items.enum;
    }
    return [];
}
/**
 * Get label for a specific value in a multi-select enum
 */
function getMultiSelectLabel(schema, value) {
    var _a;
    var index = getMultiSelectValues(schema).indexOf(value);
    return index >= 0 ? ((_a = getMultiSelectLabels(schema)[index]) !== null && _a !== void 0 ? _a : value) : value;
}
/**
 * Get enum values from EnumSchema (handles both legacy `enum` and new `oneOf` formats)
 */
function getEnumValues(schema) {
    if ('oneOf' in schema) {
        return schema.oneOf.map(function (item) { return item.const; });
    }
    if ('enum' in schema) {
        return schema.enum;
    }
    return [];
}
/**
 * Get enum display labels from EnumSchema
 */
function getEnumLabels(schema) {
    var _a;
    if ('oneOf' in schema) {
        return schema.oneOf.map(function (item) { return item.title; });
    }
    if ('enum' in schema) {
        return (_a = ('enumNames' in schema ? schema.enumNames : undefined)) !== null && _a !== void 0 ? _a : schema.enum;
    }
    return [];
}
/**
 * Get label for a specific enum value
 */
function getEnumLabel(schema, value) {
    var _a;
    var index = getEnumValues(schema).indexOf(value);
    return index >= 0 ? ((_a = getEnumLabels(schema)[index]) !== null && _a !== void 0 ? _a : value) : value;
}
function getZodSchema(schema) {
    if ((0, exports.isEnumSchema)(schema)) {
        var _a = getEnumValues(schema), first = _a[0], rest = _a.slice(1);
        if (!first) {
            return v4_1.z.never();
        }
        return v4_1.z.enum(__spreadArray([first], rest, true));
    }
    if (schema.type === 'string') {
        var stringSchema = v4_1.z.string();
        if (schema.minLength !== undefined) {
            stringSchema = stringSchema.min(schema.minLength, {
                message: "Must be at least ".concat(schema.minLength, " ").concat((0, stringUtils_js_1.plural)(schema.minLength, 'character')),
            });
        }
        if (schema.maxLength !== undefined) {
            stringSchema = stringSchema.max(schema.maxLength, {
                message: "Must be at most ".concat(schema.maxLength, " ").concat((0, stringUtils_js_1.plural)(schema.maxLength, 'character')),
            });
        }
        switch (schema.format) {
            case 'email':
                stringSchema = stringSchema.email({
                    message: 'Must be a valid email address, e.g. user@example.com',
                });
                break;
            case 'uri':
                stringSchema = stringSchema.url({
                    message: 'Must be a valid URI, e.g. https://example.com',
                });
                break;
            case 'date':
                stringSchema = stringSchema.date('Must be a valid date, e.g. 2024-03-15, today, next Monday');
                break;
            case 'date-time':
                stringSchema = stringSchema.datetime({
                    offset: true,
                    message: 'Must be a valid date-time, e.g. 2024-03-15T14:30:00Z, tomorrow at 3pm',
                });
                break;
            default:
                // No specific format validation
                break;
        }
        return stringSchema;
    }
    if (schema.type === 'number' || schema.type === 'integer') {
        var typeLabel = schema.type === 'integer' ? 'an integer' : 'a number';
        var isInteger_1 = schema.type === 'integer';
        var formatNum = function (n) {
            return Number.isInteger(n) && !isInteger_1 ? "".concat(n, ".0") : String(n);
        };
        // Build a single descriptive error message for range violations
        var rangeMsg = schema.minimum !== undefined && schema.maximum !== undefined
            ? "Must be ".concat(typeLabel, " between ").concat(formatNum(schema.minimum), " and ").concat(formatNum(schema.maximum))
            : schema.minimum !== undefined
                ? "Must be ".concat(typeLabel, " >= ").concat(formatNum(schema.minimum))
                : schema.maximum !== undefined
                    ? "Must be ".concat(typeLabel, " <= ").concat(formatNum(schema.maximum))
                    : "Must be ".concat(typeLabel);
        var numberSchema = v4_1.z.coerce.number({
            error: rangeMsg,
        });
        if (schema.type === 'integer') {
            numberSchema = numberSchema.int({ message: rangeMsg });
        }
        if (schema.minimum !== undefined) {
            numberSchema = numberSchema.min(schema.minimum, {
                message: rangeMsg,
            });
        }
        if (schema.maximum !== undefined) {
            numberSchema = numberSchema.max(schema.maximum, {
                message: rangeMsg,
            });
        }
        return numberSchema;
    }
    if (schema.type === 'boolean') {
        return v4_1.z.coerce.boolean();
    }
    throw new Error("Unsupported schema: ".concat((0, slowOperations_js_1.jsonStringify)(schema)));
}
function validateElicitationInput(stringValue, schema) {
    var zodSchema = getZodSchema(schema);
    var parseResult = zodSchema.safeParse(stringValue);
    if (parseResult.success) {
        // zodSchema always produces primitive types for elicitation
        return {
            value: parseResult.data,
            isValid: true,
        };
    }
    return {
        isValid: false,
        error: parseResult.error.issues.map(function (e) { return e.message; }).join('; '),
    };
}
var hasStringFormat = function (schema) {
    return (schema.type === 'string' &&
        'format' in schema &&
        typeof schema.format === 'string');
};
/**
 * Returns a helpful placeholder/hint for a given format
 */
function getFormatHint(schema) {
    if (schema.type === 'string') {
        if (!hasStringFormat(schema)) {
            return undefined;
        }
        var _a = STRING_FORMATS[schema.format] || {}, description = _a.description, example = _a.example;
        return "".concat(description, ", e.g. ").concat(example);
    }
    if (schema.type === 'number' || schema.type === 'integer') {
        var isInteger_2 = schema.type === 'integer';
        var formatNum = function (n) {
            return Number.isInteger(n) && !isInteger_2 ? "".concat(n, ".0") : String(n);
        };
        if (schema.minimum !== undefined && schema.maximum !== undefined) {
            return "(".concat(schema.type, " between ").concat(formatNum(schema.minimum), " and ").concat(formatNum(schema.maximum), ")");
        }
        else if (schema.minimum !== undefined) {
            return "(".concat(schema.type, " >= ").concat(formatNum(schema.minimum), ")");
        }
        else if (schema.maximum !== undefined) {
            return "(".concat(schema.type, " <= ").concat(formatNum(schema.maximum), ")");
        }
        else {
            var example = schema.type === 'integer' ? '42' : '3.14';
            return "(".concat(schema.type, ", e.g. ").concat(example, ")");
        }
    }
    return undefined;
}
/**
 * Check if a schema is a date or date-time format that supports NL parsing
 */
function isDateTimeSchema(schema) {
    return (schema.type === 'string' &&
        'format' in schema &&
        (schema.format === 'date' || schema.format === 'date-time'));
}
/**
 * Async validation that attempts NL date/time parsing via Haiku
 * when the input doesn't look like ISO 8601.
 */
function validateElicitationInputAsync(stringValue, schema, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var syncResult, parseResult, validatedParsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    syncResult = validateElicitationInput(stringValue, schema);
                    if (syncResult.isValid) {
                        return [2 /*return*/, syncResult];
                    }
                    if (!(isDateTimeSchema(schema) && !(0, dateTimeParser_js_1.looksLikeISO8601)(stringValue))) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, dateTimeParser_js_1.parseNaturalLanguageDateTime)(stringValue, schema.format, signal)];
                case 1:
                    parseResult = _a.sent();
                    if (parseResult.success) {
                        validatedParsed = validateElicitationInput(parseResult.value, schema);
                        if (validatedParsed.isValid) {
                            return [2 /*return*/, validatedParsed];
                        }
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/, syncResult];
            }
        });
    });
}
