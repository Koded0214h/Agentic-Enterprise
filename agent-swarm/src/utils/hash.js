"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.djb2Hash = djb2Hash;
exports.hashContent = hashContent;
exports.hashPair = hashPair;
/**
 * djb2 string hash — fast non-cryptographic hash returning a signed 32-bit int.
 * Deterministic across runtimes (unlike Bun.hash which uses wyhash). Use as a
 * fallback when Bun.hash isn't available, or when you need on-disk-stable
 * output (e.g. cache directory names that must survive runtime upgrades).
 */
function djb2Hash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return hash;
}
/**
 * Hash arbitrary content for change detection. Bun.hash is ~100x faster than
 * sha256 and collision-resistant enough for diff detection (not crypto-safe).
 */
function hashContent(content) {
    if (typeof Bun !== 'undefined') {
        return Bun.hash(content).toString();
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    var crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
}
/**
 * Hash two strings without allocating a concatenated temp string. Bun path
 * seed-chains wyhash (hash(a) feeds as seed to hash(b)); Node path uses
 * incremental SHA-256 update. Seed-chaining naturally disambiguates
 * ("ts","code") vs ("tsc","ode") so no separator is needed under Bun.
 */
function hashPair(a, b) {
    if (typeof Bun !== 'undefined') {
        return Bun.hash(b, Bun.hash(a)).toString();
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    var crypto = require('crypto');
    return crypto
        .createHash('sha256')
        .update(a)
        .update('\0')
        .update(b)
        .digest('hex');
}
