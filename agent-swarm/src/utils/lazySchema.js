"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazySchema = lazySchema;
/**
 * Returns a memoized factory function that constructs the value on first call.
 * Used to defer Zod schema construction from module init time to first access.
 */
function lazySchema(factory) {
    var cached;
    return function () { return (cached !== null && cached !== void 0 ? cached : (cached = factory())); };
}
