"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionSettingsCache = getSessionSettingsCache;
exports.setSessionSettingsCache = setSessionSettingsCache;
exports.getCachedSettingsForSource = getCachedSettingsForSource;
exports.setCachedSettingsForSource = setCachedSettingsForSource;
exports.getCachedParsedFile = getCachedParsedFile;
exports.setCachedParsedFile = setCachedParsedFile;
exports.resetSettingsCache = resetSettingsCache;
exports.getPluginSettingsBase = getPluginSettingsBase;
exports.setPluginSettingsBase = setPluginSettingsBase;
exports.clearPluginSettingsBase = clearPluginSettingsBase;
var sessionSettingsCache = null;
function getSessionSettingsCache() {
    return sessionSettingsCache;
}
function setSessionSettingsCache(value) {
    sessionSettingsCache = value;
}
/**
 * Per-source cache for getSettingsForSource. Invalidated alongside the
 * merged sessionSettingsCache — same resetSettingsCache() triggers
 * (settings write, --add-dir, plugin init, hooks refresh).
 */
var perSourceCache = new Map();
function getCachedSettingsForSource(source) {
    // undefined = cache miss; null = cached "no settings for this source"
    return perSourceCache.has(source) ? perSourceCache.get(source) : undefined;
}
function setCachedSettingsForSource(source, value) {
    perSourceCache.set(source, value);
}
var parseFileCache = new Map();
function getCachedParsedFile(path) {
    return parseFileCache.get(path);
}
function setCachedParsedFile(path, value) {
    parseFileCache.set(path, value);
}
function resetSettingsCache() {
    sessionSettingsCache = null;
    perSourceCache.clear();
    parseFileCache.clear();
}
/**
 * Plugin settings base layer for the settings cascade.
 * pluginLoader writes here after loading plugins;
 * loadSettingsFromDisk reads it as the lowest-priority base.
 */
var pluginSettingsBase;
function getPluginSettingsBase() {
    return pluginSettingsBase;
}
function setPluginSettingsBase(settings) {
    pluginSettingsBase = settings;
}
function clearPluginSettingsBase() {
    pluginSettingsBase = undefined;
}
