"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScheduledTasks = useScheduledTasks;
var react_1 = require("react");
var AppState_js_1 = require("../state/AppState.js");
var Task_js_1 = require("../Task.js");
var InProcessTeammateTask_js_1 = require("../tasks/InProcessTeammateTask/InProcessTeammateTask.js");
var prompt_js_1 = require("../tools/ScheduleCronTool/prompt.js");
var cronJitterConfig_js_1 = require("../utils/cronJitterConfig.js");
var cronScheduler_js_1 = require("../utils/cronScheduler.js");
var cronTasks_js_1 = require("../utils/cronTasks.js");
var debug_js_1 = require("../utils/debug.js");
var messageQueueManager_js_1 = require("../utils/messageQueueManager.js");
var messages_js_1 = require("../utils/messages.js");
var workloadContext_js_1 = require("../utils/workloadContext.js");
/**
 * REPL wrapper for the cron scheduler. Mounts the scheduler once and tears
 * it down on unmount. Fired prompts go into the command queue as 'later'
 * priority, which the REPL drains via useCommandQueue between turns.
 *
 * Scheduler core (timer, file watcher, fire logic) lives in cronScheduler.ts
 * so SDK/-p mode can share it — see print.ts for the headless wiring.
 */
function useScheduledTasks(_a) {
    var isLoading = _a.isLoading, _b = _a.assistantMode, assistantMode = _b === void 0 ? false : _b, setMessages = _a.setMessages;
    // Latest-value ref so the scheduler's isLoading() getter doesn't capture
    // a stale closure. The effect mounts once; isLoading changes every turn.
    var isLoadingRef = (0, react_1.useRef)(isLoading);
    isLoadingRef.current = isLoading;
    var store = (0, AppState_js_1.useAppStateStore)();
    var setAppState = (0, AppState_js_1.useSetAppState)();
    (0, react_1.useEffect)(function () {
        // Runtime gate checked here (not at the hook call site) so the hook
        // stays unconditionally mounted — rules-of-hooks forbid wrapping the
        // call in a dynamic condition. getFeatureValue_CACHED_WITH_REFRESH
        // reads from disk; the 5-min TTL fires a background refetch but the
        // effect won't re-run on value flip (assistantMode is the only dep),
        // so this guard alone is launch-grain. The mid-session killswitch is
        // the isKilled option below — check() polls it every tick.
        if (!(0, prompt_js_1.isKairosCronEnabled)())
            return;
        // System-generated — hidden from queue preview and transcript UI.
        // In brief mode, executeForkedSlashCommand runs as a background
        // subagent and returns no visible messages. In normal mode,
        // isMeta is only propagated for plain-text prompts (via
        // processTextPrompt); slash commands like /context:fork do not
        // forward isMeta, so their messages remain visible in the
        // transcript. This is acceptable since normal mode is not the
        // primary use case for scheduled tasks.
        var enqueueForLead = function (prompt) {
            return (0, messageQueueManager_js_1.enqueuePendingNotification)({
                value: prompt,
                mode: 'prompt',
                priority: 'later',
                isMeta: true,
                // Threaded through to cc_workload= in the billing-header
                // attribution block so the API can serve cron-initiated requests
                // at lower QoS when capacity is tight. No human is actively
                // waiting on this response.
                workload: workloadContext_js_1.WORKLOAD_CRON,
            });
        };
        var scheduler = (0, cronScheduler_js_1.createCronScheduler)({
            // Missed-task surfacing (onFire fallback). Teammate crons are always
            // session-only (durable:false) so they never appear in the missed list,
            // which is populated from disk at scheduler startup — this path only
            // handles team-lead durable crons.
            onFire: enqueueForLead,
            // Normal fires receive the full CronTask so we can route by agentId.
            onFireTask: function (task) {
                if (task.agentId) {
                    var teammate = (0, InProcessTeammateTask_js_1.findTeammateTaskByAgentId)(task.agentId, store.getState().tasks);
                    if (teammate && !(0, Task_js_1.isTerminalTaskStatus)(teammate.status)) {
                        (0, InProcessTeammateTask_js_1.injectUserMessageToTeammate)(teammate.id, task.prompt, setAppState);
                        return;
                    }
                    // Teammate is gone — clean up the orphaned cron so it doesn't keep
                    // firing into nowhere every tick. One-shots would auto-delete on
                    // fire anyway, but recurring crons would loop until auto-expiry.
                    (0, debug_js_1.logForDebugging)("[ScheduledTasks] teammate ".concat(task.agentId, " gone, removing orphaned cron ").concat(task.id));
                    void (0, cronTasks_js_1.removeCronTasks)([task.id]);
                    return;
                }
                var msg = (0, messages_js_1.createScheduledTaskFireMessage)("Running scheduled task (".concat(formatCronFireTime(new Date()), ")"));
                setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [msg], false); });
                enqueueForLead(task.prompt);
            },
            isLoading: function () { return isLoadingRef.current; },
            assistantMode: assistantMode,
            getJitterConfig: cronJitterConfig_js_1.getCronJitterConfig,
            isKilled: function () { return !(0, prompt_js_1.isKairosCronEnabled)(); },
        });
        scheduler.start();
        return function () { return scheduler.stop(); };
        // assistantMode is stable for the session lifetime; store/setAppState are
        // stable refs from useSyncExternalStore; setMessages is a stable useCallback.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assistantMode]);
}
function formatCronFireTime(d) {
    return d
        .toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
        .replace(/,? at |, /, ' ')
        .replace(/ ([AP]M)/, function (_, ampm) { return ampm.toLowerCase(); });
}
