"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecureStorage = getSecureStorage;
var fallbackStorage_js_1 = require("./fallbackStorage.js");
var macOsKeychainStorage_js_1 = require("./macOsKeychainStorage.js");
var plainTextStorage_js_1 = require("./plainTextStorage.js");
/**
 * Get the appropriate secure storage implementation for the current platform
 */
function getSecureStorage() {
    if (process.platform === 'darwin') {
        return (0, fallbackStorage_js_1.createFallbackStorage)(macOsKeychainStorage_js_1.macOsKeychainStorage, plainTextStorage_js_1.plainTextStorage);
    }
    // TODO: add libsecret support for Linux
    return plainTextStorage_js_1.plainTextStorage;
}
