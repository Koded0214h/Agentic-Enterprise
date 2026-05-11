"use strict";
// Voice service: audio recording for push-to-talk voice input.
//
// Recording uses native audio capture (cpal) on macOS, Linux, and Windows
// for in-process mic access. Falls back to SoX `rec` or arecord (ALSA)
// on Linux if the native module is unavailable.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports._resetArecordProbeForTesting = _resetArecordProbeForTesting;
exports._resetAlsaCardsForTesting = _resetAlsaCardsForTesting;
exports.checkVoiceDependencies = checkVoiceDependencies;
exports.requestMicrophonePermission = requestMicrophonePermission;
exports.checkRecordingAvailability = checkRecordingAvailability;
exports.startRecording = startRecording;
exports.stopRecording = stopRecording;
var child_process_1 = require("child_process");
var promises_1 = require("fs/promises");
var debug_js_1 = require("../utils/debug.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var log_js_1 = require("../utils/log.js");
var platform_js_1 = require("../utils/platform.js");
var audioNapi = null;
var audioNapiPromise = null;
function loadAudioNapi() {
    var _this = this;
    audioNapiPromise !== null && audioNapiPromise !== void 0 ? audioNapiPromise : (audioNapiPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
        var t0, mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    t0 = Date.now();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('audio-capture-napi'); })];
                case 1:
                    mod = _a.sent();
                    // vendor/audio-capture-src/index.ts defers require(...node) until the
                    // first function call — trigger it here so timing reflects real cost.
                    mod.isNativeAudioAvailable();
                    audioNapi = mod;
                    (0, debug_js_1.logForDebugging)("[voice] audio-capture-napi loaded in ".concat(Date.now() - t0, "ms"));
                    return [2 /*return*/, mod];
            }
        });
    }); })());
    return audioNapiPromise;
}
// ─── Constants ───────────────────────────────────────────────────────
var RECORDING_SAMPLE_RATE = 16000;
var RECORDING_CHANNELS = 1;
// SoX silence detection: stop after this duration of silence
var SILENCE_DURATION_SECS = '2.0';
var SILENCE_THRESHOLD = '3%';
// ─── Dependency check ────────────────────────────────────────────────
function hasCommand(cmd) {
    // Spawn the target directly instead of `which cmd`. On Termux/Android
    // `which` is a shell builtin — the external binary is absent or
    // kernel-blocked (EPERM) when spawned from Node. Only reached on
    // non-Windows (win32 returns early from all callers), no PATHEXT issue.
    // result.error is set iff the spawn itself fails (ENOENT/EACCES); exit
    // code is irrelevant — an unrecognized --version still means cmd exists.
    var result = (0, child_process_1.spawnSync)(cmd, ['--version'], {
        stdio: 'ignore',
        timeout: 3000,
    });
    return result.error === undefined;
}
var arecordProbe = null;
function probeArecord() {
    arecordProbe !== null && arecordProbe !== void 0 ? arecordProbe : (arecordProbe = new Promise(function (resolve) {
        var _a;
        var child = (0, child_process_1.spawn)('arecord', [
            '-f',
            'S16_LE',
            '-r',
            String(RECORDING_SAMPLE_RATE),
            '-c',
            String(RECORDING_CHANNELS),
            '-t',
            'raw',
            '/dev/null',
        ], { stdio: ['ignore', 'ignore', 'pipe'] });
        var stderr = '';
        (_a = child.stderr) === null || _a === void 0 ? void 0 : _a.on('data', function (chunk) {
            stderr += chunk.toString();
        });
        var timer = setTimeout(function (c, r) {
            c.kill('SIGTERM');
            r({ ok: true, stderr: '' });
        }, 150, child, resolve);
        child.once('close', function (code) {
            clearTimeout(timer);
            // SIGTERM close (code=null) after timer fired is already resolved.
            // Early close with code=0 is unusual (arecord shouldn't exit on its
            // own) but treat as ok.
            void resolve({ ok: code === 0, stderr: stderr.trim() });
        });
        child.once('error', function () {
            clearTimeout(timer);
            void resolve({ ok: false, stderr: 'arecord: command not found' });
        });
    }));
    return arecordProbe;
}
function _resetArecordProbeForTesting() {
    arecordProbe = null;
}
// cpal's ALSA backend writes to our process stderr when it can't find any
// sound cards (it runs in-process — no subprocess pipe to capture it). The
// spawn fallbacks below pipe stderr correctly, so skip native when ALSA has
// nothing to open. Memoized: card presence doesn't change mid-session.
var linuxAlsaCardsMemo = null;
function linuxHasAlsaCards() {
    linuxAlsaCardsMemo !== null && linuxAlsaCardsMemo !== void 0 ? linuxAlsaCardsMemo : (linuxAlsaCardsMemo = (0, promises_1.readFile)('/proc/asound/cards', 'utf8').then(function (cards) {
        var c = cards.trim();
        return c !== '' && !c.includes('no soundcards');
    }, function () { return false; }));
    return linuxAlsaCardsMemo;
}
function _resetAlsaCardsForTesting() {
    linuxAlsaCardsMemo = null;
}
function detectPackageManager() {
    if (process.platform === 'darwin') {
        if (hasCommand('brew')) {
            return {
                cmd: 'brew',
                args: ['install', 'sox'],
                displayCommand: 'brew install sox',
            };
        }
        return null;
    }
    if (process.platform === 'linux') {
        if (hasCommand('apt-get')) {
            return {
                cmd: 'sudo',
                args: ['apt-get', 'install', '-y', 'sox'],
                displayCommand: 'sudo apt-get install sox',
            };
        }
        if (hasCommand('dnf')) {
            return {
                cmd: 'sudo',
                args: ['dnf', 'install', '-y', 'sox'],
                displayCommand: 'sudo dnf install sox',
            };
        }
        if (hasCommand('pacman')) {
            return {
                cmd: 'sudo',
                args: ['pacman', '-S', '--noconfirm', 'sox'],
                displayCommand: 'sudo pacman -S sox',
            };
        }
    }
    return null;
}
function checkVoiceDependencies() {
    return __awaiter(this, void 0, void 0, function () {
        var napi, missing, pm;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, loadAudioNapi()];
                case 1:
                    napi = _b.sent();
                    if (napi.isNativeAudioAvailable()) {
                        return [2 /*return*/, { available: true, missing: [], installCommand: null }];
                    }
                    // Windows has no supported fallback — native module is required
                    if (process.platform === 'win32') {
                        return [2 /*return*/, {
                                available: false,
                                missing: ['Voice mode requires the native audio module (not loaded)'],
                                installCommand: null,
                            }];
                    }
                    // On Linux, arecord (ALSA utils) is a valid fallback recording backend
                    if (process.platform === 'linux' && hasCommand('arecord')) {
                        return [2 /*return*/, { available: true, missing: [], installCommand: null }];
                    }
                    missing = [];
                    if (!hasCommand('rec')) {
                        missing.push('sox (rec command)');
                    }
                    pm = missing.length > 0 ? detectPackageManager() : null;
                    return [2 /*return*/, {
                            available: missing.length === 0,
                            missing: missing,
                            installCommand: (_a = pm === null || pm === void 0 ? void 0 : pm.displayCommand) !== null && _a !== void 0 ? _a : null,
                        }];
            }
        });
    });
}
// Probe-record through the full fallback chain (native → arecord → SoX)
// to verify that at least one backend can record. On macOS this also
// triggers the TCC permission dialog on first use. We trust the probe
// result over the TCC status API, which can be unreliable for ad-hoc
// signed or cross-architecture binaries (e.g., x64-on-arm64).
function requestMicrophonePermission() {
    return __awaiter(this, void 0, void 0, function () {
        var napi, started;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadAudioNapi()];
                case 1:
                    napi = _a.sent();
                    if (!napi.isNativeAudioAvailable()) {
                        return [2 /*return*/, true]; // non-native platforms skip this check
                    }
                    return [4 /*yield*/, startRecording(function (_chunk) { }, // discard audio data — this is a permission probe only
                        function () { }, // ignore silence-detection end signal
                        { silenceDetection: false })];
                case 2:
                    started = _a.sent();
                    if (started) {
                        stopRecording();
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
function checkRecordingAvailability() {
    return __awaiter(this, void 0, void 0, function () {
        var napi, wslNoAudioReason, probe, pm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Remote environments have no local microphone
                    if ((0, envUtils_js_1.isRunningOnHomespace)() || (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)) {
                        return [2 /*return*/, {
                                available: false,
                                reason: 'Voice mode requires microphone access, but no audio device is available in this environment.\n\nTo use voice mode, run Claude Code locally instead.',
                            }];
                    }
                    return [4 /*yield*/, loadAudioNapi()];
                case 1:
                    napi = _a.sent();
                    if (napi.isNativeAudioAvailable()) {
                        return [2 /*return*/, { available: true, reason: null }];
                    }
                    // Windows has no supported fallback
                    if (process.platform === 'win32') {
                        return [2 /*return*/, {
                                available: false,
                                reason: 'Voice recording requires the native audio module, which could not be loaded.',
                            }];
                    }
                    wslNoAudioReason = 'Voice mode could not access an audio device in WSL.\n\nWSL2 with WSLg (Windows 11) provides audio via PulseAudio — if you are on Windows 10 or WSL1, run Claude Code in native Windows instead.';
                    if (!(process.platform === 'linux' && hasCommand('arecord'))) return [3 /*break*/, 3];
                    return [4 /*yield*/, probeArecord()];
                case 2:
                    probe = _a.sent();
                    if (probe.ok) {
                        return [2 /*return*/, { available: true, reason: null }];
                    }
                    if ((0, platform_js_1.getPlatform)() === 'wsl') {
                        return [2 /*return*/, { available: false, reason: wslNoAudioReason }];
                    }
                    (0, debug_js_1.logForDebugging)("[voice] arecord probe failed: ".concat(probe.stderr));
                    _a.label = 3;
                case 3:
                    // Fallback: check for SoX
                    if (!hasCommand('rec')) {
                        // WSL without arecord AND without SoX: the generic "install SoX"
                        // hint below is misleading on WSL1/Win10 (no audio devices at all),
                        // but correct on WSL2+WSLg (SoX works via PulseAudio). Since we can't
                        // distinguish WSLg-vs-not without a backend to probe, show the WSLg
                        // guidance — it points WSL1 users at native Windows AND tells WSLg
                        // users their setup should work (they can install sox or alsa-utils).
                        // Known gap: WSL with SoX but NO arecord skips both this branch and
                        // the probe above — hasCommand('rec') lies the same way. We optimistically
                        // trust it (WSLg+SoX would work) rather than probeSox() for a near-zero
                        // population (WSL1 × minimal distro × SoX-but-not-alsa-utils).
                        if ((0, platform_js_1.getPlatform)() === 'wsl') {
                            return [2 /*return*/, { available: false, reason: wslNoAudioReason }];
                        }
                        pm = detectPackageManager();
                        return [2 /*return*/, {
                                available: false,
                                reason: pm
                                    ? "Voice mode requires SoX for audio recording. Install it with: ".concat(pm.displayCommand)
                                    : 'Voice mode requires SoX for audio recording. Install SoX manually:\n  macOS: brew install sox\n  Ubuntu/Debian: sudo apt-get install sox\n  Fedora: sudo dnf install sox',
                            }];
                    }
                    return [2 /*return*/, { available: true, reason: null }];
            }
        });
    });
}
// ─── Recording (native audio on macOS/Linux/Windows, SoX/arecord fallback on Linux) ─────────────
var activeRecorder = null;
var nativeRecordingActive = false;
function startRecording(onData, onEnd, options) {
    return __awaiter(this, void 0, void 0, function () {
        var napi, nativeAvailable, _a, _b, useSilenceDetection, started, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("[voice] startRecording called, platform=".concat(process.platform));
                    return [4 /*yield*/, loadAudioNapi()];
                case 1:
                    napi = _d.sent();
                    _a = napi.isNativeAudioAvailable();
                    if (!_a) return [3 /*break*/, 4];
                    _b = process.platform !== 'linux';
                    if (_b) return [3 /*break*/, 3];
                    return [4 /*yield*/, linuxHasAlsaCards()];
                case 2:
                    _b = (_d.sent());
                    _d.label = 3;
                case 3:
                    _a = (_b);
                    _d.label = 4;
                case 4:
                    nativeAvailable = _a;
                    useSilenceDetection = (options === null || options === void 0 ? void 0 : options.silenceDetection) !== false;
                    if (nativeAvailable) {
                        // Ensure any previous recording is fully stopped
                        if (nativeRecordingActive || napi.isNativeRecordingActive()) {
                            napi.stopNativeRecording();
                            nativeRecordingActive = false;
                        }
                        started = napi.startNativeRecording(function (data) {
                            onData(data);
                        }, function () {
                            if (useSilenceDetection) {
                                nativeRecordingActive = false;
                                onEnd();
                            }
                            // In push-to-talk mode, ignore the native module's silence-triggered
                            // onEnd.  Recording continues until the caller explicitly calls
                            // stopRecording() (e.g. when the user presses Ctrl+X).
                        });
                        if (started) {
                            nativeRecordingActive = true;
                            return [2 /*return*/, true];
                        }
                        // Native recording failed — fall through to platform fallbacks
                    }
                    // Windows has no supported fallback
                    if (process.platform === 'win32') {
                        (0, debug_js_1.logForDebugging)('[voice] Windows native recording unavailable, no fallback');
                        return [2 /*return*/, false];
                    }
                    _c = process.platform === 'linux' &&
                        hasCommand('arecord');
                    if (!_c) return [3 /*break*/, 6];
                    return [4 /*yield*/, probeArecord()];
                case 5:
                    _c = (_d.sent()).ok;
                    _d.label = 6;
                case 6:
                    // On Linux, try arecord (ALSA utils) before SoX. Consult the probe so
                    // backend selection matches checkRecordingAvailability() — otherwise
                    // on headless Linux with both alsa-utils and SoX, the availability
                    // check falls through to SoX (probe.ok=false, not WSL) but this path
                    // would still pick broken arecord. Probe is memoized; zero latency.
                    if (_c) {
                        return [2 /*return*/, startArecordRecording(onData, onEnd)];
                    }
                    // Fallback: SoX rec (Linux, or macOS if native module unavailable)
                    return [2 /*return*/, startSoxRecording(onData, onEnd, options)];
            }
        });
    });
}
function startSoxRecording(onData, onEnd, options) {
    var _a, _b;
    var useSilenceDetection = (options === null || options === void 0 ? void 0 : options.silenceDetection) !== false;
    // Record raw PCM: 16 kHz, 16-bit signed, mono, to stdout.
    // --buffer 1024 forces SoX to flush audio in small chunks instead of
    // accumulating data in its internal buffer. Without this, SoX may buffer
    // several seconds of audio before writing anything to stdout when piped,
    // causing zero data flow until the process exits.
    var args = [
        '-q', // quiet
        '--buffer',
        '1024',
        '-t',
        'raw',
        '-r',
        String(RECORDING_SAMPLE_RATE),
        '-e',
        'signed',
        '-b',
        '16',
        '-c',
        String(RECORDING_CHANNELS),
        '-', // stdout
    ];
    // Add silence detection filter (auto-stop on silence).
    // Omit for push-to-talk where the user manually controls start/stop.
    if (useSilenceDetection) {
        args.push('silence', // start/stop on silence
        '1', '0.1', SILENCE_THRESHOLD, '1', SILENCE_DURATION_SECS, SILENCE_THRESHOLD);
    }
    var child = (0, child_process_1.spawn)('rec', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    activeRecorder = child;
    (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (chunk) {
        onData(chunk);
    });
    // Consume stderr to prevent backpressure
    (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function () { });
    child.on('close', function () {
        activeRecorder = null;
        onEnd();
    });
    child.on('error', function (err) {
        (0, log_js_1.logError)(err);
        activeRecorder = null;
        onEnd();
    });
    return true;
}
function startArecordRecording(onData, onEnd) {
    var _a, _b;
    // Record raw PCM: 16 kHz, 16-bit signed little-endian, mono, to stdout.
    // arecord does not support built-in silence detection, so this backend
    // is best suited for push-to-talk (silenceDetection: false).
    var args = [
        '-f',
        'S16_LE', // signed 16-bit little-endian
        '-r',
        String(RECORDING_SAMPLE_RATE),
        '-c',
        String(RECORDING_CHANNELS),
        '-t',
        'raw', // raw PCM, no WAV header
        '-q', // quiet — no progress output
        '-', // write to stdout
    ];
    var child = (0, child_process_1.spawn)('arecord', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    activeRecorder = child;
    (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (chunk) {
        onData(chunk);
    });
    // Consume stderr to prevent backpressure
    (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function () { });
    child.on('close', function () {
        activeRecorder = null;
        onEnd();
    });
    child.on('error', function (err) {
        (0, log_js_1.logError)(err);
        activeRecorder = null;
        onEnd();
    });
    return true;
}
function stopRecording() {
    if (nativeRecordingActive && audioNapi) {
        audioNapi.stopNativeRecording();
        nativeRecordingActive = false;
        return;
    }
    if (activeRecorder) {
        activeRecorder.kill('SIGTERM');
        activeRecorder = null;
    }
}
