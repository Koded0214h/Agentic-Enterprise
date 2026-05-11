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
exports.useSSE = useSSE;
var react_1 = require("react");
var api_1 = require("../constants/api");
var timing_1 = require("../constants/timing");
function useSSE() {
    var _a = (0, react_1.useState)([]), observations = _a[0], setObservations = _a[1];
    var _b = (0, react_1.useState)([]), summaries = _b[0], setSummaries = _b[1];
    var _c = (0, react_1.useState)([]), prompts = _c[0], setPrompts = _c[1];
    var _d = (0, react_1.useState)([]), projects = _d[0], setProjects = _d[1];
    var _e = (0, react_1.useState)(false), isConnected = _e[0], setIsConnected = _e[1];
    var _f = (0, react_1.useState)(false), isProcessing = _f[0], setIsProcessing = _f[1];
    var _g = (0, react_1.useState)(0), queueDepth = _g[0], setQueueDepth = _g[1];
    var eventSourceRef = (0, react_1.useRef)(null);
    var reconnectTimeoutRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        var connect = function () {
            // Clean up existing connection
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            var eventSource = new EventSource(api_1.API_ENDPOINTS.STREAM);
            eventSourceRef.current = eventSource;
            eventSource.onopen = function () {
                console.log('[SSE] Connected');
                setIsConnected(true);
                // Clear any pending reconnect
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
            };
            eventSource.onerror = function (error) {
                console.error('[SSE] Connection error:', error);
                setIsConnected(false);
                eventSource.close();
                // Reconnect after delay
                reconnectTimeoutRef.current = setTimeout(function () {
                    reconnectTimeoutRef.current = undefined; // Clear before reconnecting
                    console.log('[SSE] Attempting to reconnect...');
                    connect();
                }, timing_1.TIMING.SSE_RECONNECT_DELAY_MS);
            };
            eventSource.onmessage = function (event) {
                var _a;
                var data = JSON.parse(event.data);
                switch (data.type) {
                    case 'initial_load':
                        console.log('[SSE] Initial load:', {
                            projects: ((_a = data.projects) === null || _a === void 0 ? void 0 : _a.length) || 0
                        });
                        // Only load projects list - data will come via pagination
                        setProjects(data.projects || []);
                        break;
                    case 'new_observation':
                        if (data.observation) {
                            console.log('[SSE] New observation:', data.observation.id);
                            setObservations(function (prev) { return __spreadArray([data.observation], prev, true); });
                        }
                        break;
                    case 'new_summary':
                        if (data.summary) {
                            var summary_1 = data.summary;
                            console.log('[SSE] New summary:', summary_1.id);
                            setSummaries(function (prev) { return __spreadArray([summary_1], prev, true); });
                        }
                        break;
                    case 'new_prompt':
                        if (data.prompt) {
                            var prompt_1 = data.prompt;
                            console.log('[SSE] New prompt:', prompt_1.id);
                            setPrompts(function (prev) { return __spreadArray([prompt_1], prev, true); });
                        }
                        break;
                    case 'processing_status':
                        if (typeof data.isProcessing === 'boolean') {
                            console.log('[SSE] Processing status:', data.isProcessing, 'Queue depth:', data.queueDepth);
                            setIsProcessing(data.isProcessing);
                            setQueueDepth(data.queueDepth || 0);
                        }
                        break;
                }
            };
        };
        connect();
        // Cleanup on unmount
        return function () {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);
    return { observations: observations, summaries: summaries, prompts: prompts, projects: projects, isProcessing: isProcessing, queueDepth: queueDepth, isConnected: isConnected };
}
