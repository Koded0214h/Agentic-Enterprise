"use strict";
/**
 * CLI `ComputerExecutor` implementation. Wraps two native modules:
 *   - `@ant/computer-use-input` (Rust/enigo) — mouse, keyboard, frontmost app
 *   - `@ant/computer-use-swift` — SCContentFilter screenshots, NSWorkspace apps, TCC
 *
 * Contract: `packages/desktop/computer-use-mcp/src/executor.ts` in the apps
 * repo. The reference impl is Cowork's `apps/desktop/src/main/nest-only/
 * computer-use/executor.ts` — see notable deviations under "CLI deltas" below.
 *
 * ── CLI deltas from Cowork ─────────────────────────────────────────────────
 *
 * No `withClickThrough`. Cowork wraps every mouse op in
 *   `BrowserWindow.setIgnoreMouseEvents(true)` so clicks fall through the
 *   overlay. We're a terminal — no window — so the click-through bracket is
 *   a no-op. The sentinel `CLI_HOST_BUNDLE_ID` never matches frontmost.
 *
 * Terminal as surrogate host. `getTerminalBundleId()` detects the emulator
 *   we're running inside. It's passed as `hostBundleId` to `prepareDisplay`/
 *   `resolvePrepareCapture` so the Swift side exempts it from hide AND skips
 *   it in the activate z-order walk (so the terminal being frontmost doesn't
 *   eat clicks meant for the target app). Also stripped from `allowedBundleIds`
 *   via `withoutTerminal()` so screenshots don't capture it (Swift 0.2.1's
 *   captureExcluding takes an allow-list despite the name — apps#30355).
 *   `capabilities.hostBundleId` stays as the sentinel — the package's
 *   frontmost gate uses that, and the terminal being frontmost is fine.
 *
 * Clipboard via `pbcopy`/`pbpaste`. No Electron `clipboard` module.
 */
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
exports.createCliExecutor = createCliExecutor;
exports.unhideComputerUseApps = unhideComputerUseApps;
var API_RESIZE_PARAMS = { max_width: 1024, max_height: 768 };
var targetImageSize = function (w, h) { return [w, h]; };
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var sleep_js_1 = require("../sleep.js");
var common_js_1 = require("./common.js");
var drainRunLoop_js_1 = require("./drainRunLoop.js");
var escHotkey_js_1 = require("./escHotkey.js");
var inputLoader_js_1 = require("./inputLoader.js");
var swiftLoader_js_1 = require("./swiftLoader.js");
// ── Helpers ───────────────────────────────────────────────────────────────────
var SCREENSHOT_JPEG_QUALITY = 0.75;
/** Logical → physical → API target dims. See `targetImageSize` + COORDINATES.md. */
function computeTargetDims(logicalW, logicalH, scaleFactor) {
    var physW = Math.round(logicalW * scaleFactor);
    var physH = Math.round(logicalH * scaleFactor);
    return targetImageSize(physW, physH, API_RESIZE_PARAMS);
}
function readClipboardViaPbpaste() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, stdout, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('pbpaste', [], {
                        useCwd: false,
                    })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    if (code !== 0) {
                        throw new Error("pbpaste exited with code ".concat(code));
                    }
                    return [2 /*return*/, stdout];
            }
        });
    });
}
function writeClipboardViaPbcopy(text) {
    return __awaiter(this, void 0, void 0, function () {
        var code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('pbcopy', [], {
                        input: text,
                        useCwd: false,
                    })];
                case 1:
                    code = (_a.sent()).code;
                    if (code !== 0) {
                        throw new Error("pbcopy exited with code ".concat(code));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Single-element key sequence matching "escape" or "esc" (case-insensitive).
 * Used to hole-punch the CGEventTap abort for model-synthesized Escape — enigo
 * accepts both spellings, so the tap must too.
 */
function isBareEscape(parts) {
    if (parts.length !== 1)
        return false;
    var lower = parts[0].toLowerCase();
    return lower === 'escape' || lower === 'esc';
}
/**
 * Instant move, then 50ms — an input→HID→AppKit→NSEvent round-trip before the
 * caller reads `NSEvent.mouseLocation` or dispatches a click. Used for click,
 * scroll, and drag-from; `animatedMove` is reserved for drag-to only. The
 * intermediate animation frames were triggering hover states and, on the
 * decomposed mouseDown/moveMouse path, emitting stray `.leftMouseDragged`
 * events (toolCalls.ts handleScroll's mouse_full workaround).
 */
var MOVE_SETTLE_MS = 50;
function moveAndSettle(input, x, y) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, input.moveMouse(x, y, false)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(MOVE_SETTLE_MS)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Release `pressed` in reverse (last pressed = first released). Errors are
 * swallowed so a release failure never masks the real error.
 *
 * Drains via pop() rather than snapshotting length: if a drainRunLoop-
 * orphaned press lambda resolves an in-flight input.key() AFTER finally
 * calls us, that late push is still released on the next iteration. The
 * orphaned flag stops the lambda at its NEXT check, not the current await.
 */
function releasePressed(input, pressed) {
    return __awaiter(this, void 0, void 0, function () {
        var k, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!((k = pressed.pop()) !== undefined)) return [3 /*break*/, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, input.key(k, 'release')];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 0];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Bracket `fn()` with modifier press/release. `pressed` tracks which presses
 * actually landed, so a mid-press throw only releases what was pressed — no
 * stuck modifiers. The finally covers both press-phase and fn() throws.
 *
 * Caller must already be inside drainRunLoop() — key() dispatches to the
 * main queue and needs the pump to resolve.
 */
function withModifiers(input, mods, fn) {
    return __awaiter(this, void 0, void 0, function () {
        var pressed, _i, mods_1, m;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pressed = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 7, 9]);
                    _i = 0, mods_1 = mods;
                    _a.label = 2;
                case 2:
                    if (!(_i < mods_1.length)) return [3 /*break*/, 5];
                    m = mods_1[_i];
                    return [4 /*yield*/, input.key(m, 'press')];
                case 3:
                    _a.sent();
                    pressed.push(m);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, fn()];
                case 6: return [2 /*return*/, _a.sent()];
                case 7: return [4 /*yield*/, releasePressed(input, pressed)];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Port of Cowork's `typeViaClipboard`. Sequence:
 *   1. Save the user's clipboard.
 *   2. Write our text.
 *   3. READ-BACK VERIFY — clipboard writes can silently fail. If the
 *      read-back doesn't match, never press Cmd+V (would paste junk).
 *   4. Cmd+V via keys().
 *   5. Sleep 100ms — battle-tested threshold for the paste-effect vs
 *      clipboard-restore race. Restoring too soon means the target app
 *      pastes the RESTORED content.
 *   6. Restore — in a `finally`, so a throw between 2-5 never leaves the
 *      user's clipboard clobbered. Restore failures are swallowed.
 */
function typeViaClipboard(input, text) {
    return __awaiter(this, void 0, void 0, function () {
        var saved, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, readClipboardViaPbpaste()];
                case 1:
                    saved = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _c.sent();
                    (0, debug_js_1.logForDebugging)('[computer-use] pbpaste before paste failed; proceeding without restore');
                    return [3 /*break*/, 3];
                case 3:
                    _c.trys.push([3, , 8, 13]);
                    return [4 /*yield*/, writeClipboardViaPbcopy(text)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, readClipboardViaPbpaste()];
                case 5:
                    if ((_c.sent()) !== text) {
                        throw new Error('Clipboard write did not round-trip.');
                    }
                    return [4 /*yield*/, input.keys(['command', 'v'])];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(100)];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 13];
                case 8:
                    if (!(typeof saved === 'string')) return [3 /*break*/, 12];
                    _c.label = 9;
                case 9:
                    _c.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, writeClipboardViaPbcopy(saved)];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _b = _c.sent();
                    (0, debug_js_1.logForDebugging)('[computer-use] clipboard restore after paste failed');
                    return [3 /*break*/, 12];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Port of Cowork's `animateMouseMovement` + `animatedMove`. Ease-out-cubic at
 * 60fps; distance-proportional duration at 2000 px/sec, capped at 0.5s. When
 * the sub-gate is off (or distance < ~2 frames), falls through to
 * `moveAndSettle`. Called only from `drag` for the press→to motion — target
 * apps may watch for `.leftMouseDragged` specifically (not just "button down +
 * position changed") and the slow motion gives them time to process
 * intermediate positions (scrollbars, window resizes).
 */
function animatedMove(input, targetX, targetY, mouseAnimationEnabled) {
    return __awaiter(this, void 0, void 0, function () {
        var start, deltaX, deltaY, distance, durationSec, frameRate, frameIntervalMs, totalFrames, frame, t, eased;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!mouseAnimationEnabled) return [3 /*break*/, 2];
                    return [4 /*yield*/, moveAndSettle(input, targetX, targetY)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2: return [4 /*yield*/, input.mouseLocation()];
                case 3:
                    start = _a.sent();
                    deltaX = targetX - start.x;
                    deltaY = targetY - start.y;
                    distance = Math.hypot(deltaX, deltaY);
                    if (distance < 1)
                        return [2 /*return*/];
                    durationSec = Math.min(distance / 2000, 0.5);
                    if (!(durationSec < 0.03)) return [3 /*break*/, 5];
                    return [4 /*yield*/, moveAndSettle(input, targetX, targetY)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
                case 5:
                    frameRate = 60;
                    frameIntervalMs = 1000 / frameRate;
                    totalFrames = Math.floor(durationSec * frameRate);
                    frame = 1;
                    _a.label = 6;
                case 6:
                    if (!(frame <= totalFrames)) return [3 /*break*/, 10];
                    t = frame / totalFrames;
                    eased = 1 - Math.pow(1 - t, 3);
                    return [4 /*yield*/, input.moveMouse(Math.round(start.x + deltaX * eased), Math.round(start.y + deltaY * eased), false)];
                case 7:
                    _a.sent();
                    if (!(frame < totalFrames)) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(frameIntervalMs)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    frame++;
                    return [3 /*break*/, 6];
                case 10: 
                // Last frame has no trailing sleep — same HID round-trip before the
                // caller's mouseButton reads NSEvent.mouseLocation.
                return [4 /*yield*/, (0, sleep_js_1.sleep)(MOVE_SETTLE_MS)];
                case 11:
                    // Last frame has no trailing sleep — same HID round-trip before the
                    // caller's mouseButton reads NSEvent.mouseLocation.
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ── Factory ───────────────────────────────────────────────────────────────
function createCliExecutor(opts) {
    if (process.platform !== 'darwin') {
        throw new Error("createCliExecutor called on ".concat(process.platform, ". Computer control is macOS-only."));
    }
    // Swift loaded once at factory time — every executor method needs it.
    // Input loaded lazily via requireComputerUseInput() on first mouse/keyboard
    // call — it caches internally, so screenshot-only flows never pull the
    // enigo .node.
    var cu = (0, swiftLoader_js_1.requireComputerUseSwift)();
    var getMouseAnimationEnabled = opts.getMouseAnimationEnabled, getHideBeforeActionEnabled = opts.getHideBeforeActionEnabled;
    var terminalBundleId = (0, common_js_1.getTerminalBundleId)();
    var surrogateHost = terminalBundleId !== null && terminalBundleId !== void 0 ? terminalBundleId : common_js_1.CLI_HOST_BUNDLE_ID;
    // Swift 0.2.1's captureExcluding/captureRegion take an ALLOW list despite the
    // name (apps#30355 — complement computed Swift-side against running apps).
    // The terminal isn't in the user's grants so it's naturally excluded, but if
    // the package ever passes it through we strip it here so the terminal never
    // photobombs a screenshot.
    var withoutTerminal = function (allowed) {
        return terminalBundleId === null
            ? __spreadArray([], allowed, true) : allowed.filter(function (id) { return id !== terminalBundleId; });
    };
    (0, debug_js_1.logForDebugging)(terminalBundleId
        ? "[computer-use] terminal ".concat(terminalBundleId, " \u2192 surrogate host (hide-exempt, activate-skip, screenshot-excluded)")
        : '[computer-use] terminal not detected; falling back to sentinel host');
    return {
        capabilities: __assign(__assign({}, common_js_1.CLI_CU_CAPABILITIES), { hostBundleId: common_js_1.CLI_HOST_BUNDLE_ID }),
        // ── Pre-action sequence (hide + defocus) ────────────────────────────
        prepareForAction: function (allowlistBundleIds, displayId) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    if (!getHideBeforeActionEnabled()) {
                        return [2 /*return*/, []];
                    }
                    // prepareDisplay isn't @MainActor (plain Task{}), but its .hide() calls
                    // trigger window-manager events that queue on CFRunLoop. Without the
                    // pump, those pile up during Swift's ~1s of usleeps and flush all at
                    // once when the next pumped call runs — visible window flashing.
                    // Electron drains CFRunLoop continuously so Cowork doesn't see this.
                    // Worst-case 100ms + 5×200ms safety-net ≈ 1.1s, well under the 30s
                    // drainRunLoop ceiling.
                    //
                    // "Continue with action execution even if switching fails" — the
                    // frontmost gate in toolCalls.ts catches any actual unsafe state.
                    return [2 /*return*/, (0, drainRunLoop_js_1.drainRunLoop)(function () { return __awaiter(_this, void 0, void 0, function () {
                            var result, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, cu.apps.prepareDisplay(allowlistBundleIds, surrogateHost, displayId)];
                                    case 1:
                                        result = _a.sent();
                                        if (result.activated) {
                                            (0, debug_js_1.logForDebugging)("[computer-use] prepareForAction: activated ".concat(result.activated));
                                        }
                                        return [2 /*return*/, result.hidden];
                                    case 2:
                                        err_1 = _a.sent();
                                        (0, debug_js_1.logForDebugging)("[computer-use] prepareForAction failed; continuing to action: ".concat((0, errors_js_1.errorMessage)(err_1)), { level: 'warn' });
                                        return [2 /*return*/, []];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                });
            });
        },
        previewHideSet: function (allowlistBundleIds, displayId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, cu.apps.previewHideSet(__spreadArray(__spreadArray([], allowlistBundleIds, true), [surrogateHost], false), displayId)];
                });
            });
        },
        // ── Display ──────────────────────────────────────────────────────────
        getDisplaySize: function (displayId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, cu.display.getSize(displayId)];
                });
            });
        },
        listDisplays: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, cu.display.listAll()];
                });
            });
        },
        findWindowDisplays: function (bundleIds) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, cu.apps.findWindowDisplays(bundleIds)];
                });
            });
        },
        resolvePrepareCapture: function (opts) {
            return __awaiter(this, void 0, void 0, function () {
                var d, _a, targetW, targetH;
                return __generator(this, function (_b) {
                    d = cu.display.getSize(opts.preferredDisplayId);
                    _a = computeTargetDims(d.width, d.height, d.scaleFactor), targetW = _a[0], targetH = _a[1];
                    return [2 /*return*/, (0, drainRunLoop_js_1.drainRunLoop)(function () {
                            return cu.resolvePrepareCapture(withoutTerminal(opts.allowedBundleIds), surrogateHost, SCREENSHOT_JPEG_QUALITY, targetW, targetH, opts.preferredDisplayId, opts.autoResolve, opts.doHide);
                        })];
                });
            });
        },
        /**
         * Pre-size to `targetImageSize` output so the API transcoder's early-return
         * fires — no server-side resize, `scaleCoord` stays coherent. See
         * packages/desktop/computer-use-mcp/COORDINATES.md.
         */
        screenshot: function (opts) {
            return __awaiter(this, void 0, void 0, function () {
                var d, _a, targetW, targetH;
                return __generator(this, function (_b) {
                    d = cu.display.getSize(opts.displayId);
                    _a = computeTargetDims(d.width, d.height, d.scaleFactor), targetW = _a[0], targetH = _a[1];
                    return [2 /*return*/, (0, drainRunLoop_js_1.drainRunLoop)(function () {
                            return cu.screenshot.captureExcluding(withoutTerminal(opts.allowedBundleIds), SCREENSHOT_JPEG_QUALITY, targetW, targetH, opts.displayId);
                        })];
                });
            });
        },
        zoom: function (regionLogical, allowedBundleIds, displayId) {
            return __awaiter(this, void 0, void 0, function () {
                var d, _a, outW, outH;
                return __generator(this, function (_b) {
                    d = cu.display.getSize(displayId);
                    _a = computeTargetDims(regionLogical.w, regionLogical.h, d.scaleFactor), outW = _a[0], outH = _a[1];
                    return [2 /*return*/, (0, drainRunLoop_js_1.drainRunLoop)(function () {
                            return cu.screenshot.captureRegion(withoutTerminal(allowedBundleIds), regionLogical.x, regionLogical.y, regionLogical.w, regionLogical.h, outW, outH, SCREENSHOT_JPEG_QUALITY, displayId);
                        })];
                });
            });
        },
        // ── Keyboard ─────────────────────────────────────────────────────────
        /**
         * xdotool-style sequence e.g. "ctrl+shift+a" → split on '+' and pass to
         * keys(). keys() dispatches to DispatchQueue.main — drainRunLoop pumps
         * CFRunLoop so it resolves. Rust's error-path cleanup (enigo_wrap.rs)
         * releases modifiers on each invocation, so a mid-loop throw leaves
         * nothing stuck. 8ms between iterations — 125Hz USB polling cadence.
         */
        key: function (keySequence, repeat) {
            return __awaiter(this, void 0, void 0, function () {
                var input, parts, isEsc, n;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            input = (0, inputLoader_js_1.requireComputerUseInput)();
                            parts = keySequence.split('+').filter(function (p) { return p.length > 0; });
                            isEsc = isBareEscape(parts);
                            n = repeat !== null && repeat !== void 0 ? repeat : 1;
                            return [4 /*yield*/, (0, drainRunLoop_js_1.drainRunLoop)(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var i;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                i = 0;
                                                _a.label = 1;
                                            case 1:
                                                if (!(i < n)) return [3 /*break*/, 6];
                                                if (!(i > 0)) return [3 /*break*/, 3];
                                                return [4 /*yield*/, (0, sleep_js_1.sleep)(8)];
                                            case 2:
                                                _a.sent();
                                                _a.label = 3;
                                            case 3:
                                                if (isEsc) {
                                                    (0, escHotkey_js_1.notifyExpectedEscape)();
                                                }
                                                return [4 /*yield*/, input.keys(parts)];
                                            case 4:
                                                _a.sent();
                                                _a.label = 5;
                                            case 5:
                                                i++;
                                                return [3 /*break*/, 1];
                                            case 6: return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        holdKey: function (keyNames, durationMs) {
            return __awaiter(this, void 0, void 0, function () {
                var input, pressed, orphaned;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            input = (0, inputLoader_js_1.requireComputerUseInput)();
                            pressed = [];
                            orphaned = false;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, , 4, 6]);
                            return [4 /*yield*/, (0, drainRunLoop_js_1.drainRunLoop)(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _i, keyNames_1, k;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _i = 0, keyNames_1 = keyNames;
                                                _a.label = 1;
                                            case 1:
                                                if (!(_i < keyNames_1.length)) return [3 /*break*/, 4];
                                                k = keyNames_1[_i];
                                                if (orphaned)
                                                    return [2 /*return*/];
                                                // Bare Escape: notify the CGEventTap so it doesn't fire the
                                                // abort callback for a model-synthesized press. Same as key().
                                                if (isBareEscape([k])) {
                                                    (0, escHotkey_js_1.notifyExpectedEscape)();
                                                }
                                                return [4 /*yield*/, input.key(k, 'press')];
                                            case 2:
                                                _a.sent();
                                                pressed.push(k);
                                                _a.label = 3;
                                            case 3:
                                                _i++;
                                                return [3 /*break*/, 1];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, (0, sleep_js_1.sleep)(durationMs)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            orphaned = true;
                            return [4 /*yield*/, (0, drainRunLoop_js_1.drainRunLoop)(function () { return releasePressed(input, pressed); })];
                        case 5:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        type: function (text, opts) {
            return __awaiter(this, void 0, void 0, function () {
                var input;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            input = (0, inputLoader_js_1.requireComputerUseInput)();
                            if (!opts.viaClipboard) return [3 /*break*/, 2];
                            // keys(['command','v']) inside needs the pump.
                            return [4 /*yield*/, (0, drainRunLoop_js_1.drainRunLoop)(function () { return typeViaClipboard(input, text); })];
                        case 1:
                            // keys(['command','v']) inside needs the pump.
                            _a.sent();
                            return [2 /*return*/];
                        case 2: 
                        // `toolCalls.ts` handles the grapheme loop + 8ms sleeps and calls this
                        // once per grapheme. typeText doesn't dispatch to the main queue.
                        return [4 /*yield*/, input.typeText(text)];
                        case 3:
                            // `toolCalls.ts` handles the grapheme loop + 8ms sleeps and calls this
                            // once per grapheme. typeText doesn't dispatch to the main queue.
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        readClipboard: readClipboardViaPbpaste,
        writeClipboard: writeClipboardViaPbcopy,
        // ── Mouse ────────────────────────────────────────────────────────────
        moveMouse: function (x, y) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, moveAndSettle((0, inputLoader_js_1.requireComputerUseInput)(), x, y)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Move, then click. Modifiers are press/release bracketed via withModifiers
         * — same pattern as Cowork. AppKit computes NSEvent.clickCount from timing
         * + position proximity, so double/triple click work without setting the
         * CGEvent clickState field. key() inside withModifiers needs the pump;
         * the modifier-less path doesn't.
         */
        click: function (x, y, button, count, modifiers) {
            return __awaiter(this, void 0, void 0, function () {
                var input;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            input = (0, inputLoader_js_1.requireComputerUseInput)();
                            return [4 /*yield*/, moveAndSettle(input, x, y)];
                        case 1:
                            _a.sent();
                            if (!(modifiers && modifiers.length > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, (0, drainRunLoop_js_1.drainRunLoop)(function () {
                                    return withModifiers(input, modifiers, function () {
                                        return input.mouseButton(button, 'click', count);
                                    });
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, input.mouseButton(button, 'click', count)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        mouseDown: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, inputLoader_js_1.requireComputerUseInput)().mouseButton('left', 'press')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        mouseUp: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, inputLoader_js_1.requireComputerUseInput)().mouseButton('left', 'release')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        getCursorPosition: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, (0, inputLoader_js_1.requireComputerUseInput)().mouseLocation()];
                });
            });
        },
        /**
         * `from === undefined` → drag from current cursor (training's
         * left_click_drag with start_coordinate omitted). Inner `finally`: the
         * button is ALWAYS released even if the move throws — otherwise the
         * user's left button is stuck-pressed until they physically click.
         * 50ms sleep after press: enigo's move_mouse reads NSEvent.pressedMouseButtons
         * to decide .leftMouseDragged vs .mouseMoved; the synthetic leftMouseDown
         * needs a HID-tap round-trip to show up there.
         */
        drag: function (from, to) {
            return __awaiter(this, void 0, void 0, function () {
                var input;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            input = (0, inputLoader_js_1.requireComputerUseInput)();
                            if (!(from !== undefined)) return [3 /*break*/, 2];
                            return [4 /*yield*/, moveAndSettle(input, from.x, from.y)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [4 /*yield*/, input.mouseButton('left', 'press')];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, (0, sleep_js_1.sleep)(MOVE_SETTLE_MS)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, , 7, 9]);
                            return [4 /*yield*/, animatedMove(input, to.x, to.y, getMouseAnimationEnabled())];
                        case 6:
                            _a.sent();
                            return [3 /*break*/, 9];
                        case 7: return [4 /*yield*/, input.mouseButton('left', 'release')];
                        case 8:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Move first, then scroll each axis. Vertical-first — it's the common
         * axis; a horizontal failure shouldn't lose the vertical.
         */
        scroll: function (x, y, dx, dy) {
            return __awaiter(this, void 0, void 0, function () {
                var input;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            input = (0, inputLoader_js_1.requireComputerUseInput)();
                            return [4 /*yield*/, moveAndSettle(input, x, y)];
                        case 1:
                            _a.sent();
                            if (!(dy !== 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, input.mouseScroll(dy, 'vertical')];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            if (!(dx !== 0)) return [3 /*break*/, 5];
                            return [4 /*yield*/, input.mouseScroll(dx, 'horizontal')];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        // ── App management ───────────────────────────────────────────────────
        getFrontmostApp: function () {
            return __awaiter(this, void 0, void 0, function () {
                var info;
                return __generator(this, function (_a) {
                    info = (0, inputLoader_js_1.requireComputerUseInput)().getFrontmostAppInfo();
                    if (!info || !info.bundleId)
                        return [2 /*return*/, null];
                    return [2 /*return*/, { bundleId: info.bundleId, displayName: info.appName }];
                });
            });
        },
        appUnderPoint: function (x, y) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, cu.apps.appUnderPoint(x, y)];
                });
            });
        },
        listInstalledApps: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // `ComputerUseInstalledApp` is `{bundleId, displayName, path}`.
                    // `InstalledApp` adds optional `iconDataUrl` — left unpopulated;
                    // the approval dialog fetches lazily via getAppIcon() below.
                    return [2 /*return*/, (0, drainRunLoop_js_1.drainRunLoop)(function () { return cu.apps.listInstalled(); })];
                });
            });
        },
        getAppIcon: function (path) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    return [2 /*return*/, (_a = cu.apps.iconDataUrl(path)) !== null && _a !== void 0 ? _a : undefined];
                });
            });
        },
        listRunningApps: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, cu.apps.listRunning()];
                });
            });
        },
        openApp: function (bundleId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, cu.apps.open(bundleId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
/**
 * Module-level export (not on the executor object) — called at turn-end from
 * `stopHooks.ts` / `query.ts`, outside the executor lifecycle. Fire-and-forget
 * at the call site; the caller `.catch()`es.
 */
function unhideComputerUseApps(bundleIds) {
    return __awaiter(this, void 0, void 0, function () {
        var cu;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (bundleIds.length === 0)
                        return [2 /*return*/];
                    cu = (0, swiftLoader_js_1.requireComputerUseSwift)();
                    return [4 /*yield*/, cu.apps.unhide(__spreadArray([], bundleIds, true))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
