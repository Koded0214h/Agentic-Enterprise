"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLogMessages = useLogMessages;
var react_1 = require("react");
var AppState_js_1 = require("../state/AppState.js");
var agentSwarmsEnabled_js_1 = require("../utils/agentSwarmsEnabled.js");
var sessionStorage_js_1 = require("../utils/sessionStorage.js");
/**
 * Hook that logs messages to the transcript
 * conversation ID that only changes when a new conversation is started.
 *
 * @param messages The current conversation messages
 * @param ignore When true, messages will not be recorded to the transcript
 */
function useLogMessages(messages, ignore) {
    if (ignore === void 0) { ignore = false; }
    var teamContext = (0, AppState_js_1.useAppState)(function (s) { return s.teamContext; });
    // messages is append-only between compactions, so track where we left off
    // and only pass the new tail to recordTranscript. Avoids O(n) filter+scan
    // on every setMessages (~20x/turn, so n=3000 was ~120k wasted iterations).
    var lastRecordedLengthRef = (0, react_1.useRef)(0);
    var lastParentUuidRef = (0, react_1.useRef)(undefined);
    // First-uuid change = compaction or /clear rebuilt the array; length alone
    // can't detect this since post-compact [CB,summary,...keep,new] may be longer.
    var firstMessageUuidRef = (0, react_1.useRef)(undefined);
    // Guard against stale async .then() overwriting a fresher sync update when
    // an incremental render fires before the compaction .then() resolves.
    var callSeqRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        var _a;
        if (ignore)
            return;
        var currentFirstUuid = (_a = messages[0]) === null || _a === void 0 ? void 0 : _a.uuid;
        var prevLength = lastRecordedLengthRef.current;
        // First-render: firstMessageUuidRef is undefined. Compaction: first uuid changes.
        // Both are !isIncremental, but first-render sync-walk is safe (no messagesToKeep).
        var wasFirstRender = firstMessageUuidRef.current === undefined;
        var isIncremental = currentFirstUuid !== undefined &&
            !wasFirstRender &&
            currentFirstUuid === firstMessageUuidRef.current &&
            prevLength <= messages.length;
        // Same-head shrink: tombstone filter, rewind, snip, partial-compact.
        // Distinguished from compaction (first uuid changes) because the tail
        // is either an existing on-disk message or a fresh message that this
        // same effect's recordTranscript(fullArray) will write — see sync-walk
        // guard below.
        var isSameHeadShrink = currentFirstUuid !== undefined &&
            !wasFirstRender &&
            currentFirstUuid === firstMessageUuidRef.current &&
            prevLength > messages.length;
        var startIndex = isIncremental ? prevLength : 0;
        if (startIndex === messages.length)
            return;
        // Full array on first call + after compaction: recordTranscript's own
        // O(n) dedup loop handles messagesToKeep interleaving correctly there.
        var slice = startIndex === 0 ? messages : messages.slice(startIndex);
        var parentHint = isIncremental ? lastParentUuidRef.current : undefined;
        // Fire and forget - we don't want to block the UI.
        var seq = ++callSeqRef.current;
        void (0, sessionStorage_js_1.recordTranscript)(slice, (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()
            ? {
                teamName: teamContext === null || teamContext === void 0 ? void 0 : teamContext.teamName,
                agentName: teamContext === null || teamContext === void 0 ? void 0 : teamContext.selfAgentName,
            }
            : {}, parentHint, messages).then(function (lastRecordedUuid) {
            // For compaction/full array case (!isIncremental): use the async return
            // value. After compaction, messagesToKeep in the array are skipped
            // (already in transcript), so the sync loop would find a wrong UUID.
            // Skip if a newer effect already ran (stale closure would overwrite the
            // fresher sync update from the subsequent incremental render).
            if (seq !== callSeqRef.current)
                return;
            if (lastRecordedUuid && !isIncremental) {
                lastParentUuidRef.current = lastRecordedUuid;
            }
        });
        // Sync-walk safe for: incremental (pure new-tail slice), first-render
        // (no messagesToKeep interleaving), and same-head shrink. Shrink is the
        // subtle one: the picked uuid is either already on disk (tombstone/rewind
        // — survivors were written before) or is being written by THIS effect's
        // recordTranscript(fullArray) call (snip boundary / partial-compact tail
        // — enqueueWrite ordering guarantees it lands before any later write that
        // chains to it). Without this, the ref stays stale at a tombstoned uuid:
        // the async .then() correction is raced out by the next effect's seq bump
        // on large sessions where recordTranscript(fullArray) is slow. Only the
        // compaction case (first uuid changed) remains unsafe — tail may be
        // messagesToKeep whose last-actually-recorded uuid differs.
        if (isIncremental || wasFirstRender || isSameHeadShrink) {
            // Match EXACTLY what recordTranscript persists: cleanMessagesForLogging
            // applies both the isLoggableMessage filter and (for external users) the
            // REPL-strip + isVirtual-promote transform. Using the raw predicate here
            // would pick a UUID that the transform drops, leaving the parent hint
            // pointing at a message that never reached disk. Pass full messages as
            // replId context — REPL tool_use and its tool_result land in separate
            // render cycles, so the slice alone can't pair them.
            var last = (0, sessionStorage_js_1.cleanMessagesForLogging)(slice, messages).findLast(sessionStorage_js_1.isChainParticipant);
            if (last)
                lastParentUuidRef.current = last.uuid;
        }
        lastRecordedLengthRef.current = messages.length;
        firstMessageUuidRef.current = currentFirstUuid;
    }, [messages, ignore, teamContext === null || teamContext === void 0 ? void 0 : teamContext.teamName, teamContext === null || teamContext === void 0 ? void 0 : teamContext.selfAgentName]);
}
