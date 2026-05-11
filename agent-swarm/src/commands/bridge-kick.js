"use strict";
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
var bridgeDebug_js_1 = require("../bridge/bridgeDebug.js");
/**
 * Ant-only: inject bridge failure states to manually test recovery paths.
 *
 *   /bridge-kick close 1002            — fire ws_closed with code 1002
 *   /bridge-kick close 1006            — fire ws_closed with code 1006
 *   /bridge-kick poll 404              — next poll throws 404/not_found_error
 *   /bridge-kick poll 404 <type>       — next poll throws 404 with error_type
 *   /bridge-kick poll 401              — next poll throws 401 (auth)
 *   /bridge-kick poll transient        — next poll throws axios-style rejection
 *   /bridge-kick register fail         — next register (inside doReconnect) transient-fails
 *   /bridge-kick register fail 3       — next 3 registers transient-fail
 *   /bridge-kick register fatal        — next register 403s (terminal)
 *   /bridge-kick reconnect-session fail — POST /bridge/reconnect fails (→ Strategy 2)
 *   /bridge-kick heartbeat 401         — next heartbeat 401s (JWT expired)
 *   /bridge-kick reconnect             — call doReconnect directly (= SIGUSR2)
 *   /bridge-kick status                — print current bridge state
 *
 * Workflow: connect Remote Control, run a subcommand, `tail -f debug.log`
 * and watch [bridge:repl] / [bridge:debug] lines for the recovery reaction.
 *
 * Composite sequences — the failure modes in the BQ data are chains, not
 * single events. Queue faults then fire the trigger:
 *
 *   # #22148 residual: ws_closed → register transient-blips → teardown?
 *   /bridge-kick register fail 2
 *   /bridge-kick close 1002
 *   → expect: doReconnect tries register, fails, returns false → teardown
 *     (demonstrates the retry gap that needs fixing)
 *
 *   # Dead gate: poll 404/not_found_error → does onEnvironmentLost fire?
 *   /bridge-kick poll 404
 *   → expect: tengu_bridge_repl_fatal_error (gate is dead — 147K/wk)
 *     after fix: tengu_bridge_repl_env_lost → doReconnect
 */
var USAGE = "/bridge-kick <subcommand>\n  close <code>              fire ws_closed with the given code (e.g. 1002)\n  poll <status> [type]      next poll throws BridgeFatalError(status, type)\n  poll transient            next poll throws axios-style rejection (5xx/net)\n  register fail [N]         next N registers transient-fail (default 1)\n  register fatal            next register 403s (terminal)\n  reconnect-session fail    next POST /bridge/reconnect fails\n  heartbeat <status>        next heartbeat throws BridgeFatalError(status)\n  reconnect                 call reconnectEnvironmentWithSession directly\n  status                    print bridge state";
var call = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var h, _a, sub, a, b, code, status_1, errorType, n, status_2;
    return __generator(this, function (_b) {
        h = (0, bridgeDebug_js_1.getBridgeDebugHandle)();
        if (!h) {
            return [2 /*return*/, {
                    type: 'text',
                    value: 'No bridge debug handle registered. Remote Control must be connected (USER_TYPE=ant).',
                }];
        }
        _a = args.trim().split(/\s+/), sub = _a[0], a = _a[1], b = _a[2];
        switch (sub) {
            case 'close': {
                code = Number(a);
                if (!Number.isFinite(code)) {
                    return [2 /*return*/, { type: 'text', value: "close: need a numeric code\n".concat(USAGE) }];
                }
                h.fireClose(code);
                return [2 /*return*/, {
                        type: 'text',
                        value: "Fired transport close(".concat(code, "). Watch debug.log for [bridge:repl] recovery."),
                    }];
            }
            case 'poll': {
                if (a === 'transient') {
                    h.injectFault({
                        method: 'pollForWork',
                        kind: 'transient',
                        status: 503,
                        count: 1,
                    });
                    h.wakePollLoop();
                    return [2 /*return*/, {
                            type: 'text',
                            value: 'Next poll will throw a transient (axios rejection). Poll loop woken.',
                        }];
                }
                status_1 = Number(a);
                if (!Number.isFinite(status_1)) {
                    return [2 /*return*/, {
                            type: 'text',
                            value: "poll: need 'transient' or a status code\n".concat(USAGE),
                        }];
                }
                errorType = b !== null && b !== void 0 ? b : (status_1 === 404 ? 'not_found_error' : 'authentication_error');
                h.injectFault({
                    method: 'pollForWork',
                    kind: 'fatal',
                    status: status_1,
                    errorType: errorType,
                    count: 1,
                });
                h.wakePollLoop();
                return [2 /*return*/, {
                        type: 'text',
                        value: "Next poll will throw BridgeFatalError(".concat(status_1, ", ").concat(errorType, "). Poll loop woken."),
                    }];
            }
            case 'register': {
                if (a === 'fatal') {
                    h.injectFault({
                        method: 'registerBridgeEnvironment',
                        kind: 'fatal',
                        status: 403,
                        errorType: 'permission_error',
                        count: 1,
                    });
                    return [2 /*return*/, {
                            type: 'text',
                            value: 'Next registerBridgeEnvironment will 403. Trigger with close/reconnect.',
                        }];
                }
                n = Number(b) || 1;
                h.injectFault({
                    method: 'registerBridgeEnvironment',
                    kind: 'transient',
                    status: 503,
                    count: n,
                });
                return [2 /*return*/, {
                        type: 'text',
                        value: "Next ".concat(n, " registerBridgeEnvironment call(s) will transient-fail. Trigger with close/reconnect."),
                    }];
            }
            case 'reconnect-session': {
                h.injectFault({
                    method: 'reconnectSession',
                    kind: 'fatal',
                    status: 404,
                    errorType: 'not_found_error',
                    count: 2,
                });
                return [2 /*return*/, {
                        type: 'text',
                        value: 'Next 2 POST /bridge/reconnect calls will 404. doReconnect Strategy 1 falls through to Strategy 2.',
                    }];
            }
            case 'heartbeat': {
                status_2 = Number(a) || 401;
                h.injectFault({
                    method: 'heartbeatWork',
                    kind: 'fatal',
                    status: status_2,
                    errorType: status_2 === 401 ? 'authentication_error' : 'not_found_error',
                    count: 1,
                });
                return [2 /*return*/, {
                        type: 'text',
                        value: "Next heartbeat will ".concat(status_2, ". Watch for onHeartbeatFatal \u2192 work-state teardown."),
                    }];
            }
            case 'reconnect': {
                h.forceReconnect();
                return [2 /*return*/, {
                        type: 'text',
                        value: 'Called reconnectEnvironmentWithSession(). Watch debug.log.',
                    }];
            }
            case 'status': {
                return [2 /*return*/, { type: 'text', value: h.describe() }];
            }
            default:
                return [2 /*return*/, { type: 'text', value: USAGE }];
        }
        return [2 /*return*/];
    });
}); };
var bridgeKick = {
    type: 'local',
    name: 'bridge-kick',
    description: 'Inject bridge failure states for manual recovery testing',
    isEnabled: function () { return process.env.USER_TYPE === 'ant'; },
    supportsNonInteractive: false,
    load: function () { return Promise.resolve({ call: call }); },
};
exports.default = bridgeKick;
