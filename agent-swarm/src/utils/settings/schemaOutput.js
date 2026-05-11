"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSettingsJSONSchema = generateSettingsJSONSchema;
var v4_1 = require("zod/v4");
var slowOperations_js_1 = require("../slowOperations.js");
var types_js_1 = require("./types.js");
function generateSettingsJSONSchema() {
    var jsonSchema = (0, v4_1.toJSONSchema)((0, types_js_1.SettingsSchema)(), { unrepresentable: 'any' });
    return (0, slowOperations_js_1.jsonStringify)(jsonSchema, null, 2);
}
