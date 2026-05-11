"use strict";
/**
 * Peer address parsing — kept separate from peerRegistry.ts so that
 * SendMessageTool can import parseAddress without transitively loading
 * the bridge (axios) and UDS (fs, net) modules at tool-enumeration time.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAddress = parseAddress;
/** Parse a URI-style address into scheme + target. */
function parseAddress(to) {
    if (to.startsWith('uds:'))
        return { scheme: 'uds', target: to.slice(4) };
    if (to.startsWith('bridge:'))
        return { scheme: 'bridge', target: to.slice(7) };
    // Legacy: old-code UDS senders emit bare socket paths in from=; route them
    // through the UDS branch so replies aren't silently dropped into teammate
    // routing. (No bare-session-ID fallback — bridge messaging is new enough
    // that no old senders exist, and the prefix would hijack teammate names
    // like session_manager.)
    if (to.startsWith('/'))
        return { scheme: 'uds', target: to };
    return { scheme: 'other', target: to };
}
