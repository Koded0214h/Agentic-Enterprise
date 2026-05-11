"use strict";
/**
 * Permission prompts over channels (Telegram, iMessage, Discord).
 *
 * Mirrors `BridgePermissionCallbacks` — when CC hits a permission dialog,
 * it ALSO sends the prompt via active channels and races the reply against
 * local UI / bridge / hooks / classifier. First resolver wins via claim().
 *
 * Inbound is a structured event: the server parses the user's "yes tbxkq"
 * reply and emits notifications/claude/channel/permission with
 * {request_id, behavior}. CC never sees the reply as text — approval
 * requires the server to deliberately emit that specific event, not just
 * relay content. Servers opt in by declaring
 * capabilities.experimental['claude/channel/permission'].
 *
 * Kenneth's "would this let Claude self-approve?": the approving party is
 * the human via the channel, not Claude. But the trust boundary isn't the
 * terminal — it's the allowlist (tengu_harbor_ledger). A compromised
 * channel server CAN fabricate "yes <id>" without the human seeing the
 * prompt. Accepted risk: a compromised channel already has unlimited
 * conversation-injection turns (social-engineer over time, wait for
 * acceptEdits, etc.); inject-then-self-approve is faster, not more
 * capable. The dialog slows a compromised channel; it doesn't stop one.
 * See PR discussion 2956440848.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_REPLY_RE = void 0;
exports.isChannelPermissionRelayEnabled = isChannelPermissionRelayEnabled;
exports.shortRequestId = shortRequestId;
exports.truncateForPreview = truncateForPreview;
exports.filterPermissionRelayClients = filterPermissionRelayClients;
exports.createChannelPermissionCallbacks = createChannelPermissionCallbacks;
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
/**
 * GrowthBook runtime gate — separate from the channels gate (tengu_harbor)
 * so channels can ship without permission-relay riding along (Kenneth: "no
 * bake time if it goes out tomorrow"). Default false; flip without a release.
 * Checked once at useManageMCPConnections mount — mid-session flag changes
 * don't apply until restart.
 */
function isChannelPermissionRelayEnabled() {
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_harbor_permissions', false);
}
/**
 * Reply format spec for channel servers to implement:
 *   /^\s*(y|yes|n|no)\s+([a-km-z]{5})\s*$/i
 *
 * 5 lowercase letters, no 'l' (looks like 1/I). Case-insensitive (phone
 * autocorrect). No bare yes/no (conversational). No prefix/suffix chatter.
 *
 * CC generates the ID and sends the prompt. The SERVER parses the user's
 * reply and emits notifications/claude/channel/permission with {request_id,
 * behavior} — CC doesn't regex-match text anymore. Exported so plugins can
 * import the exact regex rather than hand-copying it.
 */
exports.PERMISSION_REPLY_RE = /^\s*(y|yes|n|no)\s+([a-km-z]{5})\s*$/i;
// 25-letter alphabet: a-z minus 'l' (looks like 1/I). 25^5 ≈ 9.8M space.
var ID_ALPHABET = 'abcdefghijkmnopqrstuvwxyz';
// Substring blocklist — 5 random letters can spell things (Kenneth, in the
// launch thread: "this is why i bias to numbers, hard to have anything worse
// than 80085"). Non-exhaustive, covers the send-to-your-boss-by-accident
// tier. If a generated ID contains any of these, re-hash with a salt.
// prettier-ignore
var ID_AVOID_SUBSTRINGS = [
    'fuck',
    'shit',
    'cunt',
    'cock',
    'dick',
    'twat',
    'piss',
    'crap',
    'bitch',
    'whore',
    'ass',
    'tit',
    'cum',
    'fag',
    'dyke',
    'nig',
    'kike',
    'rape',
    'nazi',
    'damn',
    'poo',
    'pee',
    'wank',
    'anus',
];
function hashToId(input) {
    // FNV-1a → uint32, then base-25 encode. Not crypto, just a stable
    // short letters-only ID. 32 bits / log2(25) ≈ 6.9 letters of entropy;
    // taking 5 wastes a little, plenty for this.
    var h = 0x811c9dc5;
    for (var i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    h = h >>> 0;
    var s = '';
    for (var i = 0; i < 5; i++) {
        s += ID_ALPHABET[h % 25];
        h = Math.floor(h / 25);
    }
    return s;
}
/**
 * Short ID from a toolUseID. 5 letters from a 25-char alphabet (a-z minus
 * 'l' — looks like 1/I in many fonts). 25^5 ≈ 9.8M space, birthday
 * collision at 50% needs ~3K simultaneous pending prompts, absurd for a
 * single interactive session. Letters-only so phone users don't switch
 * keyboard modes (hex alternates a-f/0-9 → mode toggles). Re-hashes with
 * a salt suffix if the result contains a blocklisted substring — 5 random
 * letters can spell things you don't want in a text message to your phone.
 * toolUseIDs are `toolu_` + base64-ish; we hash rather than slice.
 */
function shortRequestId(toolUseID) {
    // 7 length-3 × 3 positions × 25² + 15 length-4 × 2 × 25 + 2 length-5
    // ≈ 13,877 blocked IDs out of 9.8M — roughly 1 in 700 hits the blocklist.
    // Cap at 10 retries; (1/700)^10 is negligible.
    var candidate = hashToId(toolUseID);
    for (var salt = 0; salt < 10; salt++) {
        if (!ID_AVOID_SUBSTRINGS.some(function (bad) { return candidate.includes(bad); })) {
            return candidate;
        }
        candidate = hashToId("".concat(toolUseID, ":").concat(salt));
    }
    return candidate;
}
/**
 * Truncate tool input to a phone-sized JSON preview. 200 chars is
 * roughly 3 lines on a narrow phone screen. Full input is in the local
 * terminal dialog; the channel gets a summary so Write(5KB-file) doesn't
 * flood your texts. Server decides whether/how to show it.
 */
function truncateForPreview(input) {
    try {
        var s = (0, slowOperations_js_1.jsonStringify)(input);
        return s.length > 200 ? s.slice(0, 200) + '…' : s;
    }
    catch (_a) {
        return '(unserializable)';
    }
}
/**
 * Filter MCP clients down to those that can relay permission prompts.
 * Three conditions, ALL required: connected + in the session's --channels
 * allowlist + declares BOTH capabilities. The second capability is the
 * server's explicit opt-in — a relay-only channel never becomes a
 * permission surface by accident (Kenneth's "users may be unpleasantly
 * surprised"). Centralized here so a future fourth condition lands once.
 */
function filterPermissionRelayClients(clients, isInAllowlist) {
    return clients.filter(function (c) {
        var _a, _b, _c, _d;
        return c.type === 'connected' &&
            isInAllowlist(c.name) &&
            ((_b = (_a = c.capabilities) === null || _a === void 0 ? void 0 : _a.experimental) === null || _b === void 0 ? void 0 : _b['claude/channel']) !== undefined &&
            ((_d = (_c = c.capabilities) === null || _c === void 0 ? void 0 : _c.experimental) === null || _d === void 0 ? void 0 : _d['claude/channel/permission']) !== undefined;
    });
}
/**
 * Factory for the callbacks object. The pending Map is closed over — NOT
 * module-level (per src/CLAUDE.md), NOT in AppState (functions-in-state
 * causes issues with equality/serialization). Same lifetime pattern as
 * `replBridgePermissionCallbacks`: constructed once per session inside
 * a React hook, stable reference stored in AppState.
 *
 * resolve() is called from the dedicated notification handler
 * (notifications/claude/channel/permission) with the structured payload.
 * The server already parsed "yes tbxkq" → {request_id, behavior}; we just
 * match against the pending map. No regex on CC's side — text in the
 * general channel can't accidentally approve anything.
 */
function createChannelPermissionCallbacks() {
    var pending = new Map();
    return {
        onResponse: function (requestId, handler) {
            // Lowercase here too — resolve() already does; asymmetry means a
            // future caller passing a mixed-case ID would silently never match.
            // shortRequestId always emits lowercase so this is a noop today,
            // but the symmetry makes the contract explicit.
            var key = requestId.toLowerCase();
            pending.set(key, handler);
            return function () {
                pending.delete(key);
            };
        },
        resolve: function (requestId, behavior, fromServer) {
            var key = requestId.toLowerCase();
            var resolver = pending.get(key);
            if (!resolver)
                return false;
            // Delete BEFORE calling — if resolver throws or re-enters, the
            // entry is already gone. Also handles duplicate events (second
            // emission falls through — server bug or network dup, ignore).
            pending.delete(key);
            resolver({ behavior: behavior, fromServer: fromServer });
            return true;
        },
    };
}
