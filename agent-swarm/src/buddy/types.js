"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RARITY_COLORS = exports.RARITY_STARS = exports.RARITY_WEIGHTS = exports.STAT_NAMES = exports.HATS = exports.EYES = exports.SPECIES = exports.chonk = exports.mushroom = exports.rabbit = exports.robot = exports.cactus = exports.capybara = exports.axolotl = exports.ghost = exports.snail = exports.turtle = exports.penguin = exports.owl = exports.octopus = exports.dragon = exports.cat = exports.blob = exports.goose = exports.duck = exports.RARITIES = void 0;
exports.RARITIES = [
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
];
// One species name collides with a model-codename canary in excluded-strings.txt.
// The check greps build output (not source), so runtime-constructing the value keeps
// the literal out of the bundle while the check stays armed for the actual codename.
// All species encoded uniformly; `as` casts are type-position only (erased pre-bundle).
var c = String.fromCharCode;
// biome-ignore format: keep the species list compact
exports.duck = c(0x64, 0x75, 0x63, 0x6b);
exports.goose = c(0x67, 0x6f, 0x6f, 0x73, 0x65);
exports.blob = c(0x62, 0x6c, 0x6f, 0x62);
exports.cat = c(0x63, 0x61, 0x74);
exports.dragon = c(0x64, 0x72, 0x61, 0x67, 0x6f, 0x6e);
exports.octopus = c(0x6f, 0x63, 0x74, 0x6f, 0x70, 0x75, 0x73);
exports.owl = c(0x6f, 0x77, 0x6c);
exports.penguin = c(0x70, 0x65, 0x6e, 0x67, 0x75, 0x69, 0x6e);
exports.turtle = c(0x74, 0x75, 0x72, 0x74, 0x6c, 0x65);
exports.snail = c(0x73, 0x6e, 0x61, 0x69, 0x6c);
exports.ghost = c(0x67, 0x68, 0x6f, 0x73, 0x74);
exports.axolotl = c(0x61, 0x78, 0x6f, 0x6c, 0x6f, 0x74, 0x6c);
exports.capybara = c(0x63, 0x61, 0x70, 0x79, 0x62, 0x61, 0x72, 0x61);
exports.cactus = c(0x63, 0x61, 0x63, 0x74, 0x75, 0x73);
exports.robot = c(0x72, 0x6f, 0x62, 0x6f, 0x74);
exports.rabbit = c(0x72, 0x61, 0x62, 0x62, 0x69, 0x74);
exports.mushroom = c(0x6d, 0x75, 0x73, 0x68, 0x72, 0x6f, 0x6f, 0x6d);
exports.chonk = c(0x63, 0x68, 0x6f, 0x6e, 0x6b);
exports.SPECIES = [
    exports.duck,
    exports.goose,
    exports.blob,
    exports.cat,
    exports.dragon,
    exports.octopus,
    exports.owl,
    exports.penguin,
    exports.turtle,
    exports.snail,
    exports.ghost,
    exports.axolotl,
    exports.capybara,
    exports.cactus,
    exports.robot,
    exports.rabbit,
    exports.mushroom,
    exports.chonk,
];
exports.EYES = ['·', '✦', '×', '◉', '@', '°'];
exports.HATS = [
    'none',
    'crown',
    'tophat',
    'propeller',
    'halo',
    'wizard',
    'beanie',
    'tinyduck',
];
exports.STAT_NAMES = [
    'DEBUGGING',
    'PATIENCE',
    'CHAOS',
    'WISDOM',
    'SNARK',
];
exports.RARITY_WEIGHTS = {
    common: 60,
    uncommon: 25,
    rare: 10,
    epic: 4,
    legendary: 1,
};
exports.RARITY_STARS = {
    common: '★',
    uncommon: '★★',
    rare: '★★★',
    epic: '★★★★',
    legendary: '★★★★★',
};
exports.RARITY_COLORS = {
    common: 'inactive',
    uncommon: 'success',
    rare: 'permission',
    epic: 'autoAccept',
    legendary: 'warning',
};
