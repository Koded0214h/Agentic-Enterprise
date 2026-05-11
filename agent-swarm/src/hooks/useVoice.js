"use strict";
// React hook for hold-to-talk voice input using Anthropic voice_stream STT.
//
// Hold the keybinding to record; release to stop and submit.  Auto-repeat
// key events reset an internal timer — when no keypress arrives within
// RELEASE_TIMEOUT_MS the recording stops automatically.  Uses the native
// audio module (macOS) or SoX for recording, and Anthropic's voice_stream
// endpoint (conversation_engine) for STT.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.FIRST_PRESS_FALLBACK_MS = void 0;
exports.normalizeLanguageForSTT = normalizeLanguageForSTT;
exports.computeLevel = computeLevel;
exports.useVoice = useVoice;
var react_1 = require("react");
var voice_js_1 = require("../context/voice.js");
var use_terminal_focus_js_1 = require("../ink/hooks/use-terminal-focus.js");
var index_js_1 = require("../services/analytics/index.js");
var voiceKeyterms_js_1 = require("../services/voiceKeyterms.js");
var voiceStreamSTT_js_1 = require("../services/voiceStreamSTT.js");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var intl_js_1 = require("../utils/intl.js");
var log_js_1 = require("../utils/log.js");
var settings_js_1 = require("../utils/settings/settings.js");
var sleep_js_1 = require("../utils/sleep.js");
// ─── Language normalization ─────────────────────────────────────────────
var DEFAULT_STT_LANGUAGE = 'en';
// Maps language names (English and native) to BCP-47 codes supported by
// the voice_stream Deepgram backend.  Keys must be lowercase.
//
// This list must be a SUBSET of the server-side supported_language_codes
// allowlist (GrowthBook: speech_to_text_voice_stream_config).
// If the CLI sends a code the server rejects, the WebSocket closes with
// 1008 "Unsupported language" and voice breaks.  Unsupported languages
// fall back to DEFAULT_STT_LANGUAGE so recording still works.
var LANGUAGE_NAME_TO_CODE = {
    english: 'en',
    spanish: 'es',
    español: 'es',
    espanol: 'es',
    french: 'fr',
    français: 'fr',
    francais: 'fr',
    japanese: 'ja',
    日本語: 'ja',
    german: 'de',
    deutsch: 'de',
    portuguese: 'pt',
    português: 'pt',
    portugues: 'pt',
    italian: 'it',
    italiano: 'it',
    korean: 'ko',
    한국어: 'ko',
    hindi: 'hi',
    हिन्दी: 'hi',
    हिंदी: 'hi',
    indonesian: 'id',
    'bahasa indonesia': 'id',
    bahasa: 'id',
    russian: 'ru',
    русский: 'ru',
    polish: 'pl',
    polski: 'pl',
    turkish: 'tr',
    türkçe: 'tr',
    turkce: 'tr',
    dutch: 'nl',
    nederlands: 'nl',
    ukrainian: 'uk',
    українська: 'uk',
    greek: 'el',
    ελληνικά: 'el',
    czech: 'cs',
    čeština: 'cs',
    cestina: 'cs',
    danish: 'da',
    dansk: 'da',
    swedish: 'sv',
    svenska: 'sv',
    norwegian: 'no',
    norsk: 'no',
};
// Subset of the GrowthBook speech_to_text_voice_stream_config allowlist.
// Sending a code not in the server allowlist closes the connection.
var SUPPORTED_LANGUAGE_CODES = new Set([
    'en',
    'es',
    'fr',
    'ja',
    'de',
    'pt',
    'it',
    'ko',
    'hi',
    'id',
    'ru',
    'pl',
    'tr',
    'nl',
    'uk',
    'el',
    'cs',
    'da',
    'sv',
    'no',
]);
// Normalize a language preference string (from settings.language) to a
// BCP-47 code supported by the voice_stream endpoint.  Returns the
// default language if the input cannot be resolved.  When the input is
// non-empty but unsupported, fellBackFrom is set to the original input so
// callers can surface a warning.
function normalizeLanguageForSTT(language) {
    if (!language)
        return { code: DEFAULT_STT_LANGUAGE };
    var lower = language.toLowerCase().trim();
    if (!lower)
        return { code: DEFAULT_STT_LANGUAGE };
    if (SUPPORTED_LANGUAGE_CODES.has(lower))
        return { code: lower };
    var fromName = LANGUAGE_NAME_TO_CODE[lower];
    if (fromName)
        return { code: fromName };
    var base = lower.split('-')[0];
    if (base && SUPPORTED_LANGUAGE_CODES.has(base))
        return { code: base };
    return { code: DEFAULT_STT_LANGUAGE, fellBackFrom: language };
}
var voiceModule = null;
// Gap (ms) between auto-repeat key events that signals key release.
// Terminal auto-repeat typically fires every 30-80ms; 200ms comfortably
// covers jitter while still feeling responsive.
var RELEASE_TIMEOUT_MS = 200;
// Fallback (ms) to arm the release timer if no auto-repeat is seen.
// macOS default key repeat delay is ~500ms; 600ms gives headroom.
// If the user tapped and released before auto-repeat started, this
// ensures the release timer gets armed and recording stops.
//
// For modifier-combo first-press activation (handleKeyEvent called at
// t=0, before any auto-repeat), callers should pass FIRST_PRESS_FALLBACK_MS
// instead — the gap to the next keypress is the OS initial repeat *delay*
// (up to ~2s on macOS with slider at "Long"), not the repeat *rate*.
var REPEAT_FALLBACK_MS = 600;
exports.FIRST_PRESS_FALLBACK_MS = 2000;
// How long (ms) to keep a focus-mode session alive without any speech
// before tearing it down to free the WebSocket connection. Re-arms on
// the next focus cycle (blur → refocus).
var FOCUS_SILENCE_TIMEOUT_MS = 5000;
// Number of bars shown in the recording waveform visualizer.
var AUDIO_LEVEL_BARS = 16;
// Compute RMS amplitude from a 16-bit signed PCM buffer and return a
// normalized 0-1 value. A sqrt curve spreads quieter levels across more
// of the visual range so the waveform uses the full set of block heights.
function computeLevel(chunk) {
    var samples = chunk.length >> 1; // 16-bit = 2 bytes per sample
    if (samples === 0)
        return 0;
    var sumSq = 0;
    for (var i = 0; i < chunk.length - 1; i += 2) {
        // Read 16-bit signed little-endian
        var sample = ((chunk[i] | (chunk[i + 1] << 8)) << 16) >> 16;
        sumSq += sample * sample;
    }
    var rms = Math.sqrt(sumSq / samples);
    var normalized = Math.min(rms / 2000, 1);
    return Math.sqrt(normalized);
}
function useVoice(_a) {
    var onTranscript = _a.onTranscript, onError = _a.onError, enabled = _a.enabled, focusMode = _a.focusMode;
    var _b = (0, react_1.useState)('idle'), state = _b[0], setState = _b[1];
    var stateRef = (0, react_1.useRef)('idle');
    var connectionRef = (0, react_1.useRef)(null);
    var accumulatedRef = (0, react_1.useRef)('');
    var onTranscriptRef = (0, react_1.useRef)(onTranscript);
    var onErrorRef = (0, react_1.useRef)(onError);
    var cleanupTimerRef = (0, react_1.useRef)(null);
    var releaseTimerRef = (0, react_1.useRef)(null);
    // True once we've seen a second keypress (auto-repeat) while recording.
    // The OS key repeat delay (~500ms on macOS) means the first keypress is
    // solo — arming the release timer before auto-repeat starts would cause
    // a false release.
    var seenRepeatRef = (0, react_1.useRef)(false);
    var repeatFallbackTimerRef = (0, react_1.useRef)(null);
    // True when the current recording session was started by terminal focus
    // (not by a keypress). Focus-driven sessions end on blur, not key release.
    var focusTriggeredRef = (0, react_1.useRef)(false);
    // Timer that tears down the session after prolonged silence in focus mode.
    var focusSilenceTimerRef = (0, react_1.useRef)(null);
    // Set when a focus-mode session is torn down due to silence. Prevents
    // the focus effect from immediately restarting. Cleared on blur so the
    // next focus cycle re-arms recording.
    var silenceTimedOutRef = (0, react_1.useRef)(false);
    var recordingStartRef = (0, react_1.useRef)(0);
    // Incremented on each startRecordingSession(). Callbacks capture their
    // generation and bail if a newer session has started — prevents a zombie
    // slow-connecting WS from an abandoned session from overwriting
    // connectionRef mid-way through the next session.
    var sessionGenRef = (0, react_1.useRef)(0);
    // True if the early-error retry fired during this session.
    // Tracked for the tengu_voice_recording_completed analytics event.
    var retryUsedRef = (0, react_1.useRef)(false);
    // Full audio captured this session, kept for silent-drop replay. ~1% of
    // sessions get a sticky-broken CE pod that accepts audio but returns zero
    // transcripts (anthropics/anthropic#287008 session-sticky variant); when
    // finalize() resolves via no_data_timeout with hadAudioSignal=true, we
    // replay the buffer on a fresh WS once. Bounded: 32KB/s × ~60s max ≈ 2MB.
    var fullAudioRef = (0, react_1.useRef)([]);
    var silentDropRetriedRef = (0, react_1.useRef)(false);
    // Bumped when the early-error retry is scheduled. Captured per
    // attemptConnect — onError swallows stale-gen events (conn 1's
    // trailing close-error) but surfaces current-gen ones (conn 2's
    // genuine failure). Same shape as sessionGenRef, one level down.
    var attemptGenRef = (0, react_1.useRef)(0);
    // Running total of chars flushed in focus mode (each final transcript is
    // injected immediately and accumulatedRef reset). Added to transcriptChars
    // in the completed event so focus-mode sessions don't false-positive as
    // silent-drops (transcriptChars=0 despite successful transcription).
    var focusFlushedCharsRef = (0, react_1.useRef)(0);
    // True if at least one audio chunk with non-trivial signal was received.
    // Used to distinguish "microphone is silent/inaccessible" from "speech not detected".
    var hasAudioSignalRef = (0, react_1.useRef)(false);
    // True once onReady fired for the current session. Unlike connectionRef
    // (which cleanup() nulls), this survives effect-order races where Effect 3
    // cleanup runs before Effect 2's finishRecording() — e.g. /voice toggled
    // off mid-recording in focus mode. Used for the wsConnected analytics
    // dimension and error-message branching. Reset in startRecordingSession.
    var everConnectedRef = (0, react_1.useRef)(false);
    var audioLevelsRef = (0, react_1.useRef)([]);
    var isFocused = (0, use_terminal_focus_js_1.useTerminalFocus)();
    var setVoiceState = (0, voice_js_1.useSetVoiceState)();
    // Keep callback refs current without triggering re-renders
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
    function updateState(newState) {
        stateRef.current = newState;
        setState(newState);
        setVoiceState(function (prev) {
            if (prev.voiceState === newState)
                return prev;
            return __assign(__assign({}, prev), { voiceState: newState });
        });
    }
    var cleanup = (0, react_1.useCallback)(function () {
        // Stale any in-flight session (main connection isStale(), replay
        // isStale(), finishRecording continuation). Without this, disabling
        // voice during the replay window lets the stale replay open a WS,
        // accumulate transcript, and inject it after voice was torn down.
        sessionGenRef.current++;
        if (cleanupTimerRef.current) {
            clearTimeout(cleanupTimerRef.current);
            cleanupTimerRef.current = null;
        }
        if (releaseTimerRef.current) {
            clearTimeout(releaseTimerRef.current);
            releaseTimerRef.current = null;
        }
        if (repeatFallbackTimerRef.current) {
            clearTimeout(repeatFallbackTimerRef.current);
            repeatFallbackTimerRef.current = null;
        }
        if (focusSilenceTimerRef.current) {
            clearTimeout(focusSilenceTimerRef.current);
            focusSilenceTimerRef.current = null;
        }
        silenceTimedOutRef.current = false;
        voiceModule === null || voiceModule === void 0 ? void 0 : voiceModule.stopRecording();
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        accumulatedRef.current = '';
        audioLevelsRef.current = [];
        fullAudioRef.current = [];
        setVoiceState(function (prev) {
            if (prev.voiceInterimTranscript === '' && !prev.voiceAudioLevels.length)
                return prev;
            return __assign(__assign({}, prev), { voiceInterimTranscript: '', voiceAudioLevels: [] });
        });
    }, [setVoiceState]);
    function finishRecording() {
        var _this = this;
        (0, debug_js_1.logForDebugging)('[voice] finishRecording: stopping recording, transitioning to processing');
        // Session ending — stale any in-flight attempt so its late onError
        // (conn 2 responding after user released key) doesn't double-fire on
        // top of the "check network" message below.
        attemptGenRef.current++;
        // Capture focusTriggered BEFORE clearing it — needed as an event dimension
        // so BigQuery can filter out passive focus-mode auto-recordings (user focused
        // terminal without speaking → ambient noise sets hadAudioSignal=true → false
        // silent-drop signature). focusFlushedCharsRef fixes transcriptChars accuracy
        // for sessions WITH speech; focusTriggered enables filtering sessions WITHOUT.
        var focusTriggered = focusTriggeredRef.current;
        focusTriggeredRef.current = false;
        updateState('processing');
        voiceModule === null || voiceModule === void 0 ? void 0 : voiceModule.stopRecording();
        // Capture duration BEFORE the finalize round-trip so that the WebSocket
        // wait time is not included (otherwise a quick tap looks like > 2s).
        // All ref-backed values are captured here, BEFORE the async boundary —
        // a keypress during the finalize wait can start a new session and reset
        // these refs (e.g. focusFlushedCharsRef = 0 in startRecordingSession),
        // reproducing the silent-drop false-positive this ref exists to prevent.
        var recordingDurationMs = Date.now() - recordingStartRef.current;
        var hadAudioSignal = hasAudioSignalRef.current;
        var retried = retryUsedRef.current;
        var focusFlushedChars = focusFlushedCharsRef.current;
        // wsConnected distinguishes "backend received audio but dropped it" (the
        // bug backend PR #287008 fixes) from "WS handshake never completed" —
        // in the latter case audio is still in audioBuffer, never reached the
        // server, but hasAudioSignalRef is already true from ambient noise.
        var wsConnected = everConnectedRef.current;
        // Capture generation BEFORE the .then() — if a new session starts during
        // the finalize wait, sessionGenRef has already advanced by the time the
        // continuation runs, so capturing inside the .then() would yield the new
        // session's gen and every staleness check would be a no-op.
        var myGen = sessionGenRef.current;
        var isStale = function () { return sessionGenRef.current !== myGen; };
        (0, debug_js_1.logForDebugging)('[voice] Recording stopped');
        // Send finalize and wait for the WebSocket to close before reading the
        // accumulated transcript.  The close handler promotes any unreported
        // interim text to final, so we must wait for it to fire.
        var finalizePromise = connectionRef.current
            ? connectionRef.current.finalize()
            : Promise.resolve(undefined);
        void finalizePromise
            .then(function (finalizeSource) { return __awaiter(_this, void 0, void 0, function () {
            var replayBuffer_1, stt_1, keyterms_1, text;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (isStale())
                            return [2 /*return*/];
                        if (!(finalizeSource === 'no_data_timeout' &&
                            hadAudioSignal &&
                            wsConnected &&
                            !focusTriggered &&
                            focusFlushedChars === 0 &&
                            accumulatedRef.current.trim() === '' &&
                            !silentDropRetriedRef.current &&
                            fullAudioRef.current.length > 0)) return [3 /*break*/, 4];
                        silentDropRetriedRef.current = true;
                        (0, debug_js_1.logForDebugging)("[voice] Silent-drop detected (no_data_timeout, ".concat(String(fullAudioRef.current.length), " chunks); replaying on fresh connection"));
                        (0, index_js_1.logEvent)('tengu_voice_silent_drop_replay', {
                            recordingDurationMs: recordingDurationMs,
                            chunkCount: fullAudioRef.current.length,
                        });
                        if (connectionRef.current) {
                            connectionRef.current.close();
                            connectionRef.current = null;
                        }
                        replayBuffer_1 = fullAudioRef.current;
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(250)];
                    case 1:
                        _d.sent();
                        if (isStale())
                            return [2 /*return*/];
                        stt_1 = normalizeLanguageForSTT((0, settings_js_1.getInitialSettings)().language);
                        return [4 /*yield*/, (0, voiceKeyterms_js_1.getVoiceKeyterms)()];
                    case 2:
                        keyterms_1 = _d.sent();
                        if (isStale())
                            return [2 /*return*/];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                void (0, voiceStreamSTT_js_1.connectVoiceStream)({
                                    onTranscript: function (t, isFinal) {
                                        if (isStale())
                                            return;
                                        if (isFinal && t.trim()) {
                                            if (accumulatedRef.current)
                                                accumulatedRef.current += ' ';
                                            accumulatedRef.current += t.trim();
                                        }
                                    },
                                    onError: function () { return resolve(); },
                                    onClose: function () { },
                                    onReady: function (conn) {
                                        if (isStale()) {
                                            conn.close();
                                            resolve();
                                            return;
                                        }
                                        connectionRef.current = conn;
                                        var SLICE = 32000;
                                        var slice = [];
                                        var bytes = 0;
                                        for (var _i = 0, replayBuffer_2 = replayBuffer_1; _i < replayBuffer_2.length; _i++) {
                                            var c = replayBuffer_2[_i];
                                            if (bytes > 0 && bytes + c.length > SLICE) {
                                                conn.send(Buffer.concat(slice));
                                                slice = [];
                                                bytes = 0;
                                            }
                                            slice.push(c);
                                            bytes += c.length;
                                        }
                                        if (slice.length)
                                            conn.send(Buffer.concat(slice));
                                        void conn.finalize().then(function () {
                                            conn.close();
                                            resolve();
                                        });
                                    },
                                }, { language: stt_1.code, keyterms: keyterms_1 }).then(function (c) {
                                    if (!c)
                                        resolve();
                                }, function () { return resolve(); });
                            })];
                    case 3:
                        _d.sent();
                        if (isStale())
                            return [2 /*return*/];
                        _d.label = 4;
                    case 4:
                        fullAudioRef.current = [];
                        text = accumulatedRef.current.trim();
                        (0, debug_js_1.logForDebugging)("[voice] Final transcript assembled (".concat(String(text.length), " chars): \"").concat(text.slice(0, 200), "\""));
                        // Tracks silent-drop rate: transcriptChars=0 + hadAudioSignal=true
                        // + recordingDurationMs>2000 = the bug backend PR #287008 fixes.
                        // focusFlushedCharsRef makes transcriptChars accurate for focus mode
                        // (where each final is injected immediately and accumulatedRef reset).
                        //
                        // NOTE: this fires only on the finishRecording() path. The onError
                        // fallthrough and !conn (no-OAuth) paths bypass this → don't compute
                        // COUNT(completed)/COUNT(started) as a success rate; the silent-drop
                        // denominator (completed events only) is internally consistent.
                        (0, index_js_1.logEvent)('tengu_voice_recording_completed', {
                            transcriptChars: text.length + focusFlushedChars,
                            recordingDurationMs: recordingDurationMs,
                            hadAudioSignal: hadAudioSignal,
                            retried: retried,
                            silentDropRetried: silentDropRetriedRef.current,
                            wsConnected: wsConnected,
                            focusTriggered: focusTriggered,
                        });
                        if (connectionRef.current) {
                            connectionRef.current.close();
                            connectionRef.current = null;
                        }
                        if (text) {
                            (0, debug_js_1.logForDebugging)("[voice] Injecting transcript (".concat(String(text.length), " chars)"));
                            onTranscriptRef.current(text);
                        }
                        else if (focusFlushedChars === 0 && recordingDurationMs > 2000) {
                            // Only warn about empty transcript if nothing was flushed in focus
                            // mode either, and recording was > 2s (short recordings = accidental
                            // taps → silently return to idle).
                            if (!wsConnected) {
                                // WS never connected → audio never reached backend. Not a silent
                                // drop; a connection failure (slow OAuth refresh, network, etc).
                                (_a = onErrorRef.current) === null || _a === void 0 ? void 0 : _a.call(onErrorRef, 'Voice connection failed. Check your network and try again.');
                            }
                            else if (!hadAudioSignal) {
                                // Distinguish silent mic (capture issue) from speech not recognized.
                                (_b = onErrorRef.current) === null || _b === void 0 ? void 0 : _b.call(onErrorRef, 'No audio detected from microphone. Check that the correct input device is selected and that Claude Code has microphone access.');
                            }
                            else {
                                (_c = onErrorRef.current) === null || _c === void 0 ? void 0 : _c.call(onErrorRef, 'No speech detected.');
                            }
                        }
                        accumulatedRef.current = '';
                        setVoiceState(function (prev) {
                            if (prev.voiceInterimTranscript === '')
                                return prev;
                            return __assign(__assign({}, prev), { voiceInterimTranscript: '' });
                        });
                        updateState('idle');
                        return [2 /*return*/];
                }
            });
        }); })
            .catch(function (err) {
            (0, log_js_1.logError)((0, errors_js_1.toError)(err));
            if (!isStale())
                updateState('idle');
        });
    }
    // When voice is enabled, lazy-import voice.ts so checkRecordingAvailability
    // et al. are ready when the user presses the voice key. Do NOT preload the
    // native module — require('audio-capture.node') is a synchronous dlopen of
    // CoreAudio/AudioUnit that blocks the event loop for ~1s (warm) to ~8s
    // (cold coreaudiod). setImmediate doesn't help: it yields one tick, then the
    // dlopen still blocks. The first voice keypress pays the dlopen cost instead.
    (0, react_1.useEffect)(function () {
        if (enabled && !voiceModule) {
            void Promise.resolve().then(function () { return require('../services/voice.js'); }).then(function (mod) {
                voiceModule = mod;
            });
        }
    }, [enabled]);
    // ── Focus silence timer ────────────────────────────────────────────
    // Arms (or resets) a timer that tears down the focus-mode session
    // after FOCUS_SILENCE_TIMEOUT_MS of no speech. Called when a session
    // starts and after each flushed transcript.
    function armFocusSilenceTimer() {
        if (focusSilenceTimerRef.current) {
            clearTimeout(focusSilenceTimerRef.current);
        }
        focusSilenceTimerRef.current = setTimeout(function (focusSilenceTimerRef, stateRef, focusTriggeredRef, silenceTimedOutRef, finishRecording) {
            focusSilenceTimerRef.current = null;
            if (stateRef.current === 'recording' && focusTriggeredRef.current) {
                (0, debug_js_1.logForDebugging)('[voice] Focus silence timeout — tearing down session');
                silenceTimedOutRef.current = true;
                finishRecording();
            }
        }, FOCUS_SILENCE_TIMEOUT_MS, focusSilenceTimerRef, stateRef, focusTriggeredRef, silenceTimedOutRef, finishRecording);
    }
    // ── Focus-driven recording ──────────────────────────────────────────
    // In focus mode, start recording when the terminal gains focus and
    // stop when it loses focus. This enables a "multi-clauding army"
    // workflow where voice input follows window focus.
    (0, react_1.useEffect)(function () {
        if (!enabled || !focusMode) {
            // Focus mode was disabled while a focus-driven recording was active —
            // stop the recording so it doesn't linger until the silence timer fires.
            if (focusTriggeredRef.current && stateRef.current === 'recording') {
                (0, debug_js_1.logForDebugging)('[voice] Focus mode disabled during recording, finishing');
                finishRecording();
            }
            return;
        }
        var cancelled = false;
        if (isFocused &&
            stateRef.current === 'idle' &&
            !silenceTimedOutRef.current) {
            var beginFocusRecording_1 = function () {
                // Re-check conditions — state or enabled/focusMode may have changed
                // during the await (effect cleanup sets cancelled).
                if (cancelled ||
                    stateRef.current !== 'idle' ||
                    silenceTimedOutRef.current)
                    return;
                (0, debug_js_1.logForDebugging)('[voice] Focus gained, starting recording session');
                focusTriggeredRef.current = true;
                void startRecordingSession();
                armFocusSilenceTimer();
            };
            if (voiceModule) {
                beginFocusRecording_1();
            }
            else {
                // Voice module is loading (async import resolves from cache as a
                // microtask). Wait for it before starting the recording session.
                void Promise.resolve().then(function () { return require('../services/voice.js'); }).then(function (mod) {
                    voiceModule = mod;
                    beginFocusRecording_1();
                });
            }
        }
        else if (!isFocused) {
            // Clear the silence timeout flag on blur so the next focus
            // cycle re-arms recording.
            silenceTimedOutRef.current = false;
            if (stateRef.current === 'recording') {
                (0, debug_js_1.logForDebugging)('[voice] Focus lost, finishing recording');
                finishRecording();
            }
        }
        return function () {
            cancelled = true;
        };
    }, [enabled, focusMode, isFocused]);
    // ── Start a new recording session (voice_stream connect + audio) ──
    function startRecordingSession() {
        return __awaiter(this, void 0, void 0, function () {
            var myGen, availability, audioBuffer, started, rawLanguage, stt, sawTranscript, isStale, attemptConnect;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!voiceModule) {
                            (_a = onErrorRef.current) === null || _a === void 0 ? void 0 : _a.call(onErrorRef, 'Voice module not loaded yet. Try again in a moment.');
                            return [2 /*return*/];
                        }
                        // Transition to 'recording' synchronously, BEFORE any await. Callers
                        // read state synchronously right after `void startRecordingSession()`:
                        // - useVoiceIntegration.tsx space-hold guard reads voiceState from the
                        //   store immediately — if it sees 'idle' it clears isSpaceHoldActiveRef
                        //   and space auto-repeat leaks into the text input (100% repro)
                        // - handleKeyEvent's `currentState === 'idle'` re-entry check below
                        // If an await runs first, both see stale 'idle'. See PR #20873 review.
                        updateState('recording');
                        recordingStartRef.current = Date.now();
                        accumulatedRef.current = '';
                        seenRepeatRef.current = false;
                        hasAudioSignalRef.current = false;
                        retryUsedRef.current = false;
                        silentDropRetriedRef.current = false;
                        fullAudioRef.current = [];
                        focusFlushedCharsRef.current = 0;
                        everConnectedRef.current = false;
                        myGen = ++sessionGenRef.current;
                        return [4 /*yield*/, voiceModule.checkRecordingAvailability()];
                    case 1:
                        availability = _f.sent();
                        if (!availability.available) {
                            (0, debug_js_1.logForDebugging)("[voice] Recording not available: ".concat((_b = availability.reason) !== null && _b !== void 0 ? _b : 'unknown'));
                            (_c = onErrorRef.current) === null || _c === void 0 ? void 0 : _c.call(onErrorRef, (_d = availability.reason) !== null && _d !== void 0 ? _d : 'Audio recording is not available.');
                            cleanup();
                            updateState('idle');
                            return [2 /*return*/];
                        }
                        (0, debug_js_1.logForDebugging)('[voice] Starting recording session, connecting voice stream');
                        // Clear any previous error
                        setVoiceState(function (prev) {
                            if (!prev.voiceError)
                                return prev;
                            return __assign(__assign({}, prev), { voiceError: null });
                        });
                        audioBuffer = [];
                        // Start recording IMMEDIATELY — audio is buffered until the WebSocket
                        // opens, eliminating the 1-2s latency from waiting for OAuth + WS connect.
                        (0, debug_js_1.logForDebugging)('[voice] startRecording: buffering audio while WebSocket connects');
                        audioLevelsRef.current = [];
                        return [4 /*yield*/, voiceModule.startRecording(function (chunk) {
                                // Copy for fullAudioRef replay buffer. send() in voiceStreamSTT
                                // copies again defensively — acceptable overhead at audio rates.
                                // Skip buffering in focus mode — replay is gated on !focusTriggered
                                // so the buffer is dead weight (up to ~20MB for a 10min session).
                                var owned = Buffer.from(chunk);
                                if (!focusTriggeredRef.current) {
                                    fullAudioRef.current.push(owned);
                                }
                                if (connectionRef.current) {
                                    connectionRef.current.send(owned);
                                }
                                else {
                                    audioBuffer.push(owned);
                                }
                                // Update audio level histogram for the recording visualizer
                                var level = computeLevel(chunk);
                                if (!hasAudioSignalRef.current && level > 0.01) {
                                    hasAudioSignalRef.current = true;
                                }
                                var levels = audioLevelsRef.current;
                                if (levels.length >= AUDIO_LEVEL_BARS) {
                                    levels.shift();
                                }
                                levels.push(level);
                                // Copy the array so React sees a new reference
                                var snapshot = __spreadArray([], levels, true);
                                audioLevelsRef.current = snapshot;
                                setVoiceState(function (prev) { return (__assign(__assign({}, prev), { voiceAudioLevels: snapshot })); });
                            }, function () {
                                // External end (e.g. device error) - treat as stop
                                if (stateRef.current === 'recording') {
                                    finishRecording();
                                }
                            }, { silenceDetection: false })];
                    case 2:
                        started = _f.sent();
                        if (!started) {
                            (0, log_js_1.logError)(new Error('[voice] Recording failed — no audio tool found'));
                            (_e = onErrorRef.current) === null || _e === void 0 ? void 0 : _e.call(onErrorRef, 'Failed to start audio capture. Check that your microphone is accessible.');
                            cleanup();
                            updateState('idle');
                            setVoiceState(function (prev) { return (__assign(__assign({}, prev), { voiceError: 'Recording failed — no audio tool found' })); });
                            return [2 /*return*/];
                        }
                        rawLanguage = (0, settings_js_1.getInitialSettings)().language;
                        stt = normalizeLanguageForSTT(rawLanguage);
                        (0, index_js_1.logEvent)('tengu_voice_recording_started', {
                            focusTriggered: focusTriggeredRef.current,
                            sttLanguage: stt.code,
                            sttLanguageIsDefault: !(rawLanguage === null || rawLanguage === void 0 ? void 0 : rawLanguage.trim()),
                            sttLanguageFellBack: stt.fellBackFrom !== undefined,
                            // ISO 639 subtag from Intl (bounded set, never user text). undefined if
                            // Intl failed — omitted from the payload, no retry cost (cached).
                            systemLocaleLanguage: (0, intl_js_1.getSystemLocaleLanguage)(),
                        });
                        sawTranscript = false;
                        isStale = function () { return sessionGenRef.current !== myGen; };
                        attemptConnect = function (keyterms) {
                            var myAttemptGen = attemptGenRef.current;
                            void (0, voiceStreamSTT_js_1.connectVoiceStream)({
                                onTranscript: function (text, isFinal) {
                                    if (isStale())
                                        return;
                                    sawTranscript = true;
                                    (0, debug_js_1.logForDebugging)("[voice] onTranscript: isFinal=".concat(String(isFinal), " text=\"").concat(text, "\""));
                                    if (isFinal && text.trim()) {
                                        if (focusTriggeredRef.current) {
                                            // Focus mode: flush each final transcript immediately and
                                            // keep recording. This gives continuous transcription while
                                            // the terminal is focused.
                                            (0, debug_js_1.logForDebugging)("[voice] Focus mode: flushing final transcript immediately: \"".concat(text.trim(), "\""));
                                            onTranscriptRef.current(text.trim());
                                            focusFlushedCharsRef.current += text.trim().length;
                                            setVoiceState(function (prev) {
                                                if (prev.voiceInterimTranscript === '')
                                                    return prev;
                                                return __assign(__assign({}, prev), { voiceInterimTranscript: '' });
                                            });
                                            accumulatedRef.current = '';
                                            // User is actively speaking — reset the silence timer.
                                            armFocusSilenceTimer();
                                        }
                                        else {
                                            // Hold-to-talk: accumulate final transcripts separated by spaces
                                            if (accumulatedRef.current) {
                                                accumulatedRef.current += ' ';
                                            }
                                            accumulatedRef.current += text.trim();
                                            (0, debug_js_1.logForDebugging)("[voice] Accumulated final transcript: \"".concat(accumulatedRef.current, "\""));
                                            // Clear interim since final supersedes it
                                            setVoiceState(function (prev) {
                                                var preview = accumulatedRef.current;
                                                if (prev.voiceInterimTranscript === preview)
                                                    return prev;
                                                return __assign(__assign({}, prev), { voiceInterimTranscript: preview });
                                            });
                                        }
                                    }
                                    else if (!isFinal) {
                                        // Active interim speech resets the focus silence timer.
                                        // Nova 3 disables auto-finalize so isFinal is never true
                                        // mid-stream — without this, the 5s timer fires during
                                        // active speech and tears down the session.
                                        if (focusTriggeredRef.current) {
                                            armFocusSilenceTimer();
                                        }
                                        // Show accumulated finals + current interim as live preview
                                        var interim = text.trim();
                                        var preview_1 = accumulatedRef.current
                                            ? accumulatedRef.current + (interim ? ' ' + interim : '')
                                            : interim;
                                        setVoiceState(function (prev) {
                                            if (prev.voiceInterimTranscript === preview_1)
                                                return prev;
                                            return __assign(__assign({}, prev), { voiceInterimTranscript: preview_1 });
                                        });
                                    }
                                },
                                onError: function (error, opts) {
                                    var _a;
                                    if (isStale()) {
                                        (0, debug_js_1.logForDebugging)("[voice] ignoring onError from stale session: ".concat(error));
                                        return;
                                    }
                                    // Swallow errors from superseded attempts. Covers conn 1's
                                    // trailing close after retry is scheduled, AND the current
                                    // conn's ws close event after its ws error already surfaced
                                    // below (gen bumped at surface).
                                    if (attemptGenRef.current !== myAttemptGen) {
                                        (0, debug_js_1.logForDebugging)("[voice] ignoring stale onError from superseded attempt: ".concat(error));
                                        return;
                                    }
                                    // Early-failure retry: server error before any transcript =
                                    // likely a transient upstream race (CE rejection, Deepgram
                                    // not ready). Clear connectionRef so audio re-buffers, back
                                    // off, reconnect. Skip if the user has already released the
                                    // key (state left 'recording') — no point retrying a session
                                    // they've ended. Fatal errors (Cloudflare bot challenge, auth
                                    // rejection) are the same failure on every retry attempt, so
                                    // fall through to surface the message.
                                    if (!(opts === null || opts === void 0 ? void 0 : opts.fatal) &&
                                        !sawTranscript &&
                                        stateRef.current === 'recording') {
                                        if (!retryUsedRef.current) {
                                            retryUsedRef.current = true;
                                            (0, debug_js_1.logForDebugging)("[voice] early voice_stream error (pre-transcript), retrying once: ".concat(error));
                                            (0, index_js_1.logEvent)('tengu_voice_stream_early_retry', {});
                                            connectionRef.current = null;
                                            attemptGenRef.current++;
                                            setTimeout(function (stateRef, attemptConnect, keyterms) {
                                                if (stateRef.current === 'recording') {
                                                    attemptConnect(keyterms);
                                                }
                                            }, 250, stateRef, attemptConnect, keyterms);
                                            return;
                                        }
                                    }
                                    // Surfacing — bump gen so this conn's trailing close-error
                                    // (ws fires error then close 1006) is swallowed above.
                                    attemptGenRef.current++;
                                    (0, log_js_1.logError)(new Error("[voice] voice_stream error: ".concat(error)));
                                    (_a = onErrorRef.current) === null || _a === void 0 ? void 0 : _a.call(onErrorRef, "Voice stream error: ".concat(error));
                                    // Clear the audio buffer on error to avoid memory leaks
                                    audioBuffer.length = 0;
                                    focusTriggeredRef.current = false;
                                    cleanup();
                                    updateState('idle');
                                },
                                onClose: function () {
                                    // no-op; lifecycle handled by cleanup()
                                },
                                onReady: function (conn) {
                                    // Only proceed if we're still in recording state AND this is
                                    // still the current session. A zombie late-connecting WS from
                                    // an abandoned session can pass the 'recording' check if the
                                    // user has since started a new session.
                                    if (isStale() || stateRef.current !== 'recording') {
                                        conn.close();
                                        return;
                                    }
                                    // The WebSocket is now truly open — assign connectionRef so
                                    // subsequent audio callbacks send directly instead of buffering.
                                    connectionRef.current = conn;
                                    everConnectedRef.current = true;
                                    // Flush all audio chunks that were buffered while the WebSocket
                                    // was connecting.  This is safe because onReady fires from the
                                    // WebSocket 'open' event, guaranteeing send() will not be dropped.
                                    //
                                    // Coalesce into ~1s slices rather than one ws.send per chunk
                                    // — fewer WS frames means less overhead on both ends.
                                    var SLICE_TARGET_BYTES = 32000; // ~1s at 16kHz/16-bit/mono
                                    if (audioBuffer.length > 0) {
                                        var totalBytes = 0;
                                        for (var _i = 0, audioBuffer_1 = audioBuffer; _i < audioBuffer_1.length; _i++) {
                                            var c = audioBuffer_1[_i];
                                            totalBytes += c.length;
                                        }
                                        var slices = [[]];
                                        var sliceBytes = 0;
                                        for (var _a = 0, audioBuffer_2 = audioBuffer; _a < audioBuffer_2.length; _a++) {
                                            var chunk = audioBuffer_2[_a];
                                            if (sliceBytes > 0 &&
                                                sliceBytes + chunk.length > SLICE_TARGET_BYTES) {
                                                slices.push([]);
                                                sliceBytes = 0;
                                            }
                                            slices[slices.length - 1].push(chunk);
                                            sliceBytes += chunk.length;
                                        }
                                        (0, debug_js_1.logForDebugging)("[voice] onReady: flushing ".concat(String(audioBuffer.length), " buffered chunks (").concat(String(totalBytes), " bytes) as ").concat(String(slices.length), " coalesced frame(s)"));
                                        for (var _b = 0, slices_1 = slices; _b < slices_1.length; _b++) {
                                            var slice = slices_1[_b];
                                            conn.send(Buffer.concat(slice));
                                        }
                                    }
                                    audioBuffer.length = 0;
                                    // Reset the release timer now that the WebSocket is ready.
                                    // Only arm it if auto-repeat has been seen — otherwise the OS
                                    // key repeat delay (~500ms) hasn't elapsed yet and the timer
                                    // would fire prematurely.
                                    if (releaseTimerRef.current) {
                                        clearTimeout(releaseTimerRef.current);
                                    }
                                    if (seenRepeatRef.current) {
                                        releaseTimerRef.current = setTimeout(function (releaseTimerRef, stateRef, finishRecording) {
                                            releaseTimerRef.current = null;
                                            if (stateRef.current === 'recording') {
                                                finishRecording();
                                            }
                                        }, RELEASE_TIMEOUT_MS, releaseTimerRef, stateRef, finishRecording);
                                    }
                                },
                            }, {
                                language: stt.code,
                                keyterms: keyterms,
                            }).then(function (conn) {
                                var _a;
                                if (isStale()) {
                                    conn === null || conn === void 0 ? void 0 : conn.close();
                                    return;
                                }
                                if (!conn) {
                                    (0, debug_js_1.logForDebugging)('[voice] Failed to connect to voice_stream (no OAuth token?)');
                                    (_a = onErrorRef.current) === null || _a === void 0 ? void 0 : _a.call(onErrorRef, 'Voice mode requires a Claude.ai account. Please run /login to sign in.');
                                    // Clear the audio buffer on failure
                                    audioBuffer.length = 0;
                                    cleanup();
                                    updateState('idle');
                                    return;
                                }
                                // Safety check: if the user released the key before connectVoiceStream
                                // resolved (but after onReady already ran), close the connection.
                                if (stateRef.current !== 'recording') {
                                    audioBuffer.length = 0;
                                    conn.close();
                                    return;
                                }
                            });
                        };
                        void (0, voiceKeyterms_js_1.getVoiceKeyterms)().then(attemptConnect);
                        return [2 /*return*/];
                }
            });
        });
    }
    // ── Hold-to-talk handler ────────────────────────────────────────────
    // Called on every keypress (including terminal auto-repeats while
    // the key is held).  A gap longer than RELEASE_TIMEOUT_MS between
    // events is interpreted as key release.
    //
    // Recording starts immediately on the first keypress to eliminate
    // startup delay.  The release timer is only armed after auto-repeat
    // is detected (to avoid false releases during the OS key repeat
    // delay of ~500ms on macOS).
    var handleKeyEvent = (0, react_1.useCallback)(function (fallbackMs) {
        if (fallbackMs === void 0) { fallbackMs = REPEAT_FALLBACK_MS; }
        if (!enabled || !(0, voiceStreamSTT_js_1.isVoiceStreamAvailable)()) {
            return;
        }
        // In focus mode, recording is driven by terminal focus, not keypresses.
        if (focusTriggeredRef.current) {
            // Active focus recording — ignore key events (session ends on blur).
            return;
        }
        if (focusMode && silenceTimedOutRef.current) {
            // Focus session timed out due to silence — keypress re-arms it.
            (0, debug_js_1.logForDebugging)('[voice] Re-arming focus recording after silence timeout');
            silenceTimedOutRef.current = false;
            focusTriggeredRef.current = true;
            void startRecordingSession();
            armFocusSilenceTimer();
            return;
        }
        var currentState = stateRef.current;
        // Ignore keypresses while processing
        if (currentState === 'processing') {
            return;
        }
        if (currentState === 'idle') {
            (0, debug_js_1.logForDebugging)('[voice] handleKeyEvent: idle, starting recording session immediately');
            void startRecordingSession();
            // Fallback: if no auto-repeat arrives within REPEAT_FALLBACK_MS,
            // arm the release timer anyway (the user likely tapped and released).
            repeatFallbackTimerRef.current = setTimeout(function (repeatFallbackTimerRef, stateRef, seenRepeatRef, releaseTimerRef, finishRecording) {
                repeatFallbackTimerRef.current = null;
                if (stateRef.current === 'recording' && !seenRepeatRef.current) {
                    (0, debug_js_1.logForDebugging)('[voice] No auto-repeat seen, arming release timer via fallback');
                    seenRepeatRef.current = true;
                    releaseTimerRef.current = setTimeout(function (releaseTimerRef, stateRef, finishRecording) {
                        releaseTimerRef.current = null;
                        if (stateRef.current === 'recording') {
                            finishRecording();
                        }
                    }, RELEASE_TIMEOUT_MS, releaseTimerRef, stateRef, finishRecording);
                }
            }, fallbackMs, repeatFallbackTimerRef, stateRef, seenRepeatRef, releaseTimerRef, finishRecording);
        }
        else if (currentState === 'recording') {
            // Second+ keypress while recording — auto-repeat has started.
            seenRepeatRef.current = true;
            if (repeatFallbackTimerRef.current) {
                clearTimeout(repeatFallbackTimerRef.current);
                repeatFallbackTimerRef.current = null;
            }
        }
        // Reset the release timer on every keypress (including auto-repeats)
        if (releaseTimerRef.current) {
            clearTimeout(releaseTimerRef.current);
        }
        // Only arm the release timer once auto-repeat has been seen.
        // The OS key repeat delay is ~500ms on macOS; without this gate
        // the 200ms timer fires before repeat starts, causing a false release.
        if (stateRef.current === 'recording' && seenRepeatRef.current) {
            releaseTimerRef.current = setTimeout(function (releaseTimerRef, stateRef, finishRecording) {
                releaseTimerRef.current = null;
                if (stateRef.current === 'recording') {
                    finishRecording();
                }
            }, RELEASE_TIMEOUT_MS, releaseTimerRef, stateRef, finishRecording);
        }
    }, [enabled, focusMode, cleanup]);
    // Cleanup only when disabled or unmounted - NOT on state changes
    (0, react_1.useEffect)(function () {
        if (!enabled && stateRef.current !== 'idle') {
            cleanup();
            updateState('idle');
        }
        return function () {
            cleanup();
        };
    }, [enabled, cleanup]);
    return {
        state: state,
        handleKeyEvent: handleKeyEvent,
    };
}
