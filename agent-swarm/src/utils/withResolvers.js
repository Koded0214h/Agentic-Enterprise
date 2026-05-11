"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withResolvers = withResolvers;
/**
 * Polyfill for Promise.withResolvers() (ES2024, Node 22+).
 * package.json declares "engines": { "node": ">=18.0.0" } so we can't use the native one.
 */
function withResolvers() {
    var resolve;
    var reject;
    var promise = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    });
    return { promise: promise, resolve: resolve, reject: reject };
}
