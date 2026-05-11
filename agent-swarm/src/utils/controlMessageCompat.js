"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeControlMessageKeys = normalizeControlMessageKeys;
/**
 * Normalize camelCase `requestId` → snake_case `request_id` on incoming
 * control messages (control_request, control_response).
 *
 * Older iOS app builds send `requestId` due to a missing Swift CodingKeys
 * mapping. Without this shim, `isSDKControlRequest` in replBridge.ts rejects
 * the message (it checks `'request_id' in value`), and structuredIO.ts reads
 * `message.response.request_id` as undefined — both silently drop the message.
 *
 * If both `request_id` and `requestId` are present, snake_case wins.
 * Mutates the object in place.
 */
function normalizeControlMessageKeys(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    var record = obj;
    if ('requestId' in record && !('request_id' in record)) {
        record.request_id = record.requestId;
        delete record.requestId;
    }
    if ('response' in record &&
        record.response !== null &&
        typeof record.response === 'object') {
        var response = record.response;
        if ('requestId' in response && !('request_id' in response)) {
            response.request_id = response.requestId;
            delete response.requestId;
        }
    }
    return obj;
}
