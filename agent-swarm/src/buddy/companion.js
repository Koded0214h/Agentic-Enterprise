"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.roll = roll;
exports.rollWithSeed = rollWithSeed;
exports.companionUserId = companionUserId;
exports.getCompanion = getCompanion;
var config_js_1 = require("../utils/config.js");
var types_js_1 = require("./types.js");
// Mulberry32 — tiny seeded PRNG, good enough for picking ducks
function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function hashString(s) {
    if (typeof Bun !== 'undefined') {
        return Number(BigInt(Bun.hash(s)) & 0xffffffffn);
    }
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
}
function rollRarity(rng) {
    var total = Object.values(types_js_1.RARITY_WEIGHTS).reduce(function (a, b) { return a + b; }, 0);
    var roll = rng() * total;
    for (var _i = 0, RARITIES_1 = types_js_1.RARITIES; _i < RARITIES_1.length; _i++) {
        var rarity = RARITIES_1[_i];
        roll -= types_js_1.RARITY_WEIGHTS[rarity];
        if (roll < 0)
            return rarity;
    }
    return 'common';
}
var RARITY_FLOOR = {
    common: 5,
    uncommon: 15,
    rare: 25,
    epic: 35,
    legendary: 50,
};
// One peak stat, one dump stat, rest scattered. Rarity bumps the floor.
function rollStats(rng, rarity) {
    var floor = RARITY_FLOOR[rarity];
    var peak = pick(rng, types_js_1.STAT_NAMES);
    var dump = pick(rng, types_js_1.STAT_NAMES);
    while (dump === peak)
        dump = pick(rng, types_js_1.STAT_NAMES);
    var stats = {};
    for (var _i = 0, STAT_NAMES_1 = types_js_1.STAT_NAMES; _i < STAT_NAMES_1.length; _i++) {
        var name_1 = STAT_NAMES_1[_i];
        if (name_1 === peak) {
            stats[name_1] = Math.min(100, floor + 50 + Math.floor(rng() * 30));
        }
        else if (name_1 === dump) {
            stats[name_1] = Math.max(1, floor - 10 + Math.floor(rng() * 15));
        }
        else {
            stats[name_1] = floor + Math.floor(rng() * 40);
        }
    }
    return stats;
}
var SALT = 'friend-2026-401';
function rollFrom(rng) {
    var rarity = rollRarity(rng);
    var bones = {
        rarity: rarity,
        species: pick(rng, types_js_1.SPECIES),
        eye: pick(rng, types_js_1.EYES),
        hat: rarity === 'common' ? 'none' : pick(rng, types_js_1.HATS),
        shiny: rng() < 0.01,
        stats: rollStats(rng, rarity),
    };
    return { bones: bones, inspirationSeed: Math.floor(rng() * 1e9) };
}
// Called from three hot paths (500ms sprite tick, per-keystroke PromptInput,
// per-turn observer) with the same userId → cache the deterministic result.
var rollCache;
function roll(userId) {
    var key = userId + SALT;
    if ((rollCache === null || rollCache === void 0 ? void 0 : rollCache.key) === key)
        return rollCache.value;
    var value = rollFrom(mulberry32(hashString(key)));
    rollCache = { key: key, value: value };
    return value;
}
function rollWithSeed(seed) {
    return rollFrom(mulberry32(hashString(seed)));
}
function companionUserId() {
    var _a, _b, _c;
    var config = (0, config_js_1.getGlobalConfig)();
    return (_c = (_b = (_a = config.oauthAccount) === null || _a === void 0 ? void 0 : _a.accountUuid) !== null && _b !== void 0 ? _b : config.userID) !== null && _c !== void 0 ? _c : 'anon';
}
// Regenerate bones from userId, merge with stored soul. Bones never persist
// so species renames and SPECIES-array edits can't break stored companions,
// and editing config.companion can't fake a rarity.
function getCompanion() {
    var stored = (0, config_js_1.getGlobalConfig)().companion;
    if (!stored)
        return undefined;
    var bones = roll(companionUserId()).bones;
    // bones last so stale bones fields in old-format configs get overridden
    return __assign(__assign({}, stored), bones);
}
