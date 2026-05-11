"use strict";
/**
 * Tagged ID encoding compatible with the API's tagged_id.py format.
 *
 * Produces IDs like "user_01PaGUP2rbg1XDh7Z9W1CEpd" from a UUID string.
 * The format is: {tag}_{version}{base58(uuid_as_128bit_int)}
 *
 * This must stay in sync with api/api/common/utils/tagged_id.py.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTaggedId = toTaggedId;
var BASE_58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var VERSION = '01';
// ceil(128 / log2(58)) = 22
var ENCODED_LENGTH = 22;
/**
 * Encode a 128-bit unsigned integer as a fixed-length base58 string.
 */
function base58Encode(n) {
    var base = BigInt(BASE_58_CHARS.length);
    var result = new Array(ENCODED_LENGTH).fill(BASE_58_CHARS[0]);
    var i = ENCODED_LENGTH - 1;
    var value = n;
    while (value > 0n) {
        var rem = Number(value % base);
        result[i] = BASE_58_CHARS[rem];
        value = value / base;
        i--;
    }
    return result.join('');
}
/**
 * Parse a UUID string (with or without hyphens) into a 128-bit bigint.
 */
function uuidToBigInt(uuid) {
    var hex = uuid.replace(/-/g, '');
    if (hex.length !== 32) {
        throw new Error("Invalid UUID hex length: ".concat(hex.length));
    }
    return BigInt('0x' + hex);
}
/**
 * Convert an account UUID to a tagged ID in the API's format.
 *
 * @param tag - The tag prefix (e.g. "user", "org")
 * @param uuid - A UUID string (with or without hyphens)
 * @returns Tagged ID string like "user_01PaGUP2rbg1XDh7Z9W1CEpd"
 */
function toTaggedId(tag, uuid) {
    var n = uuidToBigInt(uuid);
    return "".concat(tag, "_").concat(VERSION).concat(base58Encode(n));
}
