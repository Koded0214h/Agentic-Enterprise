"use strict";
// Complete implementation of condition-based waiting utilities
// From: Lace test infrastructure improvements (2025-10-03)
// Context: Fixed 15 flaky tests by replacing arbitrary timeouts
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForEvent = waitForEvent;
exports.waitForEventCount = waitForEventCount;
exports.waitForEventMatch = waitForEventMatch;
/**
 * Wait for a specific event type to appear in thread
 *
 * @param threadManager - The thread manager to query
 * @param threadId - Thread to check for events
 * @param eventType - Type of event to wait for
 * @param timeoutMs - Maximum time to wait (default 5000ms)
 * @returns Promise resolving to the first matching event
 *
 * Example:
 *   await waitForEvent(threadManager, agentThreadId, 'TOOL_RESULT');
 */
function waitForEvent(threadManager, threadId, eventType, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 5000; }
    return new Promise(function (resolve, reject) {
        var startTime = Date.now();
        var check = function () {
            var events = threadManager.getEvents(threadId);
            var event = events.find(function (e) { return e.type === eventType; });
            if (event) {
                resolve(event);
            }
            else if (Date.now() - startTime > timeoutMs) {
                reject(new Error("Timeout waiting for ".concat(eventType, " event after ").concat(timeoutMs, "ms")));
            }
            else {
                setTimeout(check, 10); // Poll every 10ms for efficiency
            }
        };
        check();
    });
}
/**
 * Wait for a specific number of events of a given type
 *
 * @param threadManager - The thread manager to query
 * @param threadId - Thread to check for events
 * @param eventType - Type of event to wait for
 * @param count - Number of events to wait for
 * @param timeoutMs - Maximum time to wait (default 5000ms)
 * @returns Promise resolving to all matching events once count is reached
 *
 * Example:
 *   // Wait for 2 AGENT_MESSAGE events (initial response + continuation)
 *   await waitForEventCount(threadManager, agentThreadId, 'AGENT_MESSAGE', 2);
 */
function waitForEventCount(threadManager, threadId, eventType, count, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 5000; }
    return new Promise(function (resolve, reject) {
        var startTime = Date.now();
        var check = function () {
            var events = threadManager.getEvents(threadId);
            var matchingEvents = events.filter(function (e) { return e.type === eventType; });
            if (matchingEvents.length >= count) {
                resolve(matchingEvents);
            }
            else if (Date.now() - startTime > timeoutMs) {
                reject(new Error("Timeout waiting for ".concat(count, " ").concat(eventType, " events after ").concat(timeoutMs, "ms (got ").concat(matchingEvents.length, ")")));
            }
            else {
                setTimeout(check, 10);
            }
        };
        check();
    });
}
/**
 * Wait for an event matching a custom predicate
 * Useful when you need to check event data, not just type
 *
 * @param threadManager - The thread manager to query
 * @param threadId - Thread to check for events
 * @param predicate - Function that returns true when event matches
 * @param description - Human-readable description for error messages
 * @param timeoutMs - Maximum time to wait (default 5000ms)
 * @returns Promise resolving to the first matching event
 *
 * Example:
 *   // Wait for TOOL_RESULT with specific ID
 *   await waitForEventMatch(
 *     threadManager,
 *     agentThreadId,
 *     (e) => e.type === 'TOOL_RESULT' && e.data.id === 'call_123',
 *     'TOOL_RESULT with id=call_123'
 *   );
 */
function waitForEventMatch(threadManager, threadId, predicate, description, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 5000; }
    return new Promise(function (resolve, reject) {
        var startTime = Date.now();
        var check = function () {
            var events = threadManager.getEvents(threadId);
            var event = events.find(predicate);
            if (event) {
                resolve(event);
            }
            else if (Date.now() - startTime > timeoutMs) {
                reject(new Error("Timeout waiting for ".concat(description, " after ").concat(timeoutMs, "ms")));
            }
            else {
                setTimeout(check, 10);
            }
        };
        check();
    });
}
// Usage example from actual debugging session:
//
// BEFORE (flaky):
// ---------------
// const messagePromise = agent.sendMessage('Execute tools');
// await new Promise(r => setTimeout(r, 300)); // Hope tools start in 300ms
// agent.abort();
// await messagePromise;
// await new Promise(r => setTimeout(r, 50));  // Hope results arrive in 50ms
// expect(toolResults.length).toBe(2);         // Fails randomly
//
// AFTER (reliable):
// ----------------
// const messagePromise = agent.sendMessage('Execute tools');
// await waitForEventCount(threadManager, threadId, 'TOOL_CALL', 2); // Wait for tools to start
// agent.abort();
// await messagePromise;
// await waitForEventCount(threadManager, threadId, 'TOOL_RESULT', 2); // Wait for results
// expect(toolResults.length).toBe(2); // Always succeeds
//
// Result: 60% pass rate → 100%, 40% faster execution
