"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolSchemaCache = getToolSchemaCache;
exports.clearToolSchemaCache = clearToolSchemaCache;
var TOOL_SCHEMA_CACHE = new Map();
function getToolSchemaCache() {
    return TOOL_SCHEMA_CACHE;
}
function clearToolSchemaCache() {
    TOOL_SCHEMA_CACHE.clear();
}
