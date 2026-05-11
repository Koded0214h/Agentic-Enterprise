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
exports.getLayoutMode = getLayoutMode;
exports.calculateLayoutDimensions = calculateLayoutDimensions;
exports.calculateOptimalLeftWidth = calculateOptimalLeftWidth;
exports.formatWelcomeMessage = formatWelcomeMessage;
exports.truncatePath = truncatePath;
exports.getRecentActivity = getRecentActivity;
exports.getRecentActivitySync = getRecentActivitySync;
exports.formatReleaseNoteForDisplay = formatReleaseNoteForDisplay;
exports.getLogoDisplayData = getLogoDisplayData;
exports.formatModelAndBilling = formatModelAndBilling;
exports.getRecentReleaseNotesSync = getRecentReleaseNotesSync;
var state_js_1 = require("../bootstrap/state.js");
var stringWidth_js_1 = require("../ink/stringWidth.js");
var auth_js_1 = require("./auth.js");
var cwd_js_1 = require("./cwd.js");
var file_js_1 = require("./file.js");
var format_js_1 = require("./format.js");
var releaseNotes_js_1 = require("./releaseNotes.js");
var semver_js_1 = require("./semver.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var settings_js_1 = require("./settings/settings.js");
// Layout constants
var MAX_LEFT_WIDTH = 50;
var MAX_USERNAME_LENGTH = 20;
var BORDER_PADDING = 4;
var DIVIDER_WIDTH = 1;
var CONTENT_PADDING = 2;
/**
 * Determines the layout mode based on terminal width
 */
function getLayoutMode(columns) {
    if (columns >= 70)
        return 'horizontal';
    return 'compact';
}
/**
 * Calculates layout dimensions for the LogoV2 component
 */
function calculateLayoutDimensions(columns, layoutMode, optimalLeftWidth) {
    if (layoutMode === 'horizontal') {
        var leftWidth = optimalLeftWidth;
        var usedSpace = BORDER_PADDING + CONTENT_PADDING + DIVIDER_WIDTH + leftWidth;
        var availableForRight = columns - usedSpace;
        var rightWidth = Math.max(30, availableForRight);
        var totalWidth_1 = Math.min(leftWidth + rightWidth + DIVIDER_WIDTH + CONTENT_PADDING, columns - BORDER_PADDING);
        // Recalculate right width if we had to cap the total
        if (totalWidth_1 < leftWidth + rightWidth + DIVIDER_WIDTH + CONTENT_PADDING) {
            rightWidth = totalWidth_1 - leftWidth - DIVIDER_WIDTH - CONTENT_PADDING;
        }
        return { leftWidth: leftWidth, rightWidth: rightWidth, totalWidth: totalWidth_1 };
    }
    // Vertical mode
    var totalWidth = Math.min(columns - BORDER_PADDING, MAX_LEFT_WIDTH + 20);
    return {
        leftWidth: totalWidth,
        rightWidth: totalWidth,
        totalWidth: totalWidth,
    };
}
/**
 * Calculates optimal left panel width based on content
 */
function calculateOptimalLeftWidth(welcomeMessage, truncatedCwd, modelLine) {
    var contentWidth = Math.max((0, stringWidth_js_1.stringWidth)(welcomeMessage), (0, stringWidth_js_1.stringWidth)(truncatedCwd), (0, stringWidth_js_1.stringWidth)(modelLine), 20);
    return Math.min(contentWidth + 4, MAX_LEFT_WIDTH); // +4 for padding
}
/**
 * Formats the welcome message based on username
 */
function formatWelcomeMessage(username) {
    if (!username || username.length > MAX_USERNAME_LENGTH) {
        return 'Welcome back!';
    }
    return "Welcome back ".concat(username, "!");
}
/**
 * Truncates a path in the middle if it's too long.
 * Width-aware: uses stringWidth() for correct CJK/emoji measurement.
 */
function truncatePath(path, maxLength) {
    if ((0, stringWidth_js_1.stringWidth)(path) <= maxLength)
        return path;
    var separator = '/';
    var ellipsis = '…';
    var ellipsisWidth = 1; // '…' is always 1 column
    var separatorWidth = 1;
    var parts = path.split(separator);
    var first = parts[0] || '';
    var last = parts[parts.length - 1] || '';
    var firstWidth = (0, stringWidth_js_1.stringWidth)(first);
    var lastWidth = (0, stringWidth_js_1.stringWidth)(last);
    // Only one part, so show as much of it as we can
    if (parts.length === 1) {
        return (0, format_js_1.truncateToWidth)(path, maxLength);
    }
    // We don't have enough space to show the last part, so truncate it
    // But since firstPart is empty (unix) we don't want the extra ellipsis
    if (first === '' && ellipsisWidth + separatorWidth + lastWidth >= maxLength) {
        return "".concat(separator).concat((0, format_js_1.truncateToWidth)(last, Math.max(1, maxLength - separatorWidth)));
    }
    // We have a first part so let's show the ellipsis and truncate last part
    if (first !== '' &&
        ellipsisWidth * 2 + separatorWidth + lastWidth >= maxLength) {
        return "".concat(ellipsis).concat(separator).concat((0, format_js_1.truncateToWidth)(last, Math.max(1, maxLength - ellipsisWidth - separatorWidth)));
    }
    // Truncate first and leave last
    if (parts.length === 2) {
        var availableForFirst = maxLength - ellipsisWidth - separatorWidth - lastWidth;
        return "".concat((0, format_js_1.truncateToWidthNoEllipsis)(first, availableForFirst)).concat(ellipsis).concat(separator).concat(last);
    }
    // Now we start removing middle parts
    var available = maxLength - firstWidth - lastWidth - ellipsisWidth - 2 * separatorWidth;
    // Just the first and last are too long, so truncate first
    if (available <= 0) {
        var availableForFirst = Math.max(0, maxLength - lastWidth - ellipsisWidth - 2 * separatorWidth);
        var truncatedFirst = (0, format_js_1.truncateToWidthNoEllipsis)(first, availableForFirst);
        return "".concat(truncatedFirst).concat(separator).concat(ellipsis).concat(separator).concat(last);
    }
    // Try to keep as many middle parts as possible
    var middleParts = [];
    for (var i = parts.length - 2; i > 0; i--) {
        var part = parts[i];
        if (part && (0, stringWidth_js_1.stringWidth)(part) + separatorWidth <= available) {
            middleParts.unshift(part);
            available -= (0, stringWidth_js_1.stringWidth)(part) + separatorWidth;
        }
        else {
            break;
        }
    }
    if (middleParts.length === 0) {
        return "".concat(first).concat(separator).concat(ellipsis).concat(separator).concat(last);
    }
    return "".concat(first).concat(separator).concat(ellipsis).concat(separator).concat(middleParts.join(separator)).concat(separator).concat(last);
}
// Simple cache for preloaded activity
var cachedActivity = [];
var cachePromise = null;
/**
 * Preloads recent conversations for display in Logo v2
 */
function getRecentActivity() {
    return __awaiter(this, void 0, void 0, function () {
        var currentSessionId;
        return __generator(this, function (_a) {
            // Return existing promise if already loading
            if (cachePromise) {
                return [2 /*return*/, cachePromise];
            }
            currentSessionId = (0, state_js_1.getSessionId)();
            cachePromise = (0, sessionStorage_js_1.loadMessageLogs)(10)
                .then(function (logs) {
                cachedActivity = logs
                    .filter(function (log) {
                    var _a;
                    if (log.isSidechain)
                        return false;
                    if (log.sessionId === currentSessionId)
                        return false;
                    if ((_a = log.summary) === null || _a === void 0 ? void 0 : _a.includes('I apologize'))
                        return false;
                    // Filter out sessions where both summary and firstPrompt are "No prompt" or missing
                    var hasSummary = log.summary && log.summary !== 'No prompt';
                    var hasFirstPrompt = log.firstPrompt && log.firstPrompt !== 'No prompt';
                    return hasSummary || hasFirstPrompt;
                })
                    .slice(0, 3);
                return cachedActivity;
            })
                .catch(function () {
                cachedActivity = [];
                return cachedActivity;
            });
            return [2 /*return*/, cachePromise];
        });
    });
}
/**
 * Gets cached activity synchronously
 */
function getRecentActivitySync() {
    return cachedActivity;
}
/**
 * Formats release notes for display, with smart truncation
 */
function formatReleaseNoteForDisplay(note, maxWidth) {
    // Simply truncate at the max width, same as Recent Activity descriptions
    return (0, format_js_1.truncate)(note, maxWidth);
}
/**
 * Gets the common logo display data used by both LogoV2 and CondensedLogo
 */
function getLogoDisplayData() {
    var _a;
    var version = (_a = process.env.DEMO_VERSION) !== null && _a !== void 0 ? _a : MACRO.VERSION;
    var serverUrl = (0, state_js_1.getDirectConnectServerUrl)();
    var displayPath = process.env.DEMO_VERSION
        ? '/code/claude'
        : (0, file_js_1.getDisplayPath)((0, cwd_js_1.getCwd)());
    var cwd = serverUrl
        ? "".concat(displayPath, " in ").concat(serverUrl.replace(/^https?:\/\//, ''))
        : displayPath;
    var billingType = (0, auth_js_1.isClaudeAISubscriber)()
        ? (0, auth_js_1.getSubscriptionName)()
        : 'API Usage Billing';
    var agentName = (0, settings_js_1.getInitialSettings)().agent;
    return {
        version: version,
        cwd: cwd,
        billingType: billingType,
        agentName: agentName,
    };
}
/**
 * Determines how to display model and billing information based on available width
 */
function formatModelAndBilling(modelName, billingType, availableWidth) {
    var separator = ' · ';
    var combinedWidth = (0, stringWidth_js_1.stringWidth)(modelName) + separator.length + (0, stringWidth_js_1.stringWidth)(billingType);
    var shouldSplit = combinedWidth > availableWidth;
    if (shouldSplit) {
        return {
            shouldSplit: true,
            truncatedModel: (0, format_js_1.truncate)(modelName, availableWidth),
            truncatedBilling: (0, format_js_1.truncate)(billingType, availableWidth),
        };
    }
    return {
        shouldSplit: false,
        truncatedModel: (0, format_js_1.truncate)(modelName, Math.max(availableWidth - (0, stringWidth_js_1.stringWidth)(billingType) - separator.length, 10)),
        truncatedBilling: billingType,
    };
}
/**
 * Gets recent release notes for Logo v2 display
 * For ants, uses commits bundled at build time
 * For external users, uses public changelog
 */
function getRecentReleaseNotesSync(maxItems) {
    // For ants, use bundled changelog
    if (process.env.USER_TYPE === 'ant') {
        var changelog_1 = MACRO.VERSION_CHANGELOG;
        if (changelog_1) {
            var commits = changelog_1.trim().split('\n').filter(Boolean);
            return commits.slice(0, maxItems);
        }
        return [];
    }
    var changelog = (0, releaseNotes_js_1.getStoredChangelogFromMemory)();
    if (!changelog) {
        return [];
    }
    var parsed;
    try {
        parsed = (0, releaseNotes_js_1.parseChangelog)(changelog);
    }
    catch (_a) {
        return [];
    }
    // Get notes from recent versions
    var allNotes = [];
    var versions = Object.keys(parsed)
        .sort(function (a, b) { return ((0, semver_js_1.gt)(a, b) ? -1 : 1); })
        .slice(0, 3); // Look at top 3 recent versions
    for (var _i = 0, versions_1 = versions; _i < versions_1.length; _i++) {
        var version = versions_1[_i];
        var notes = parsed[version];
        if (notes) {
            allNotes.push.apply(allNotes, notes);
        }
    }
    // Return raw notes without filtering or premature truncation
    return allNotes.slice(0, maxItems);
}
