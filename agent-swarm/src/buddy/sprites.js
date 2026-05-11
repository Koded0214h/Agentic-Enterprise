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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSprite = renderSprite;
exports.spriteFrameCount = spriteFrameCount;
exports.renderFace = renderFace;
var types_js_1 = require("./types.js");
// Each sprite is 5 lines tall, 12 wide (after {E}→1char substitution).
// Multiple frames per species for idle fidget animation.
// Line 0 is the hat slot — must be blank in frames 0-1; frame 2 may use it.
var BODIES = (_a = {},
    _a[types_js_1.duck] = [
        [
            '            ',
            '    __      ',
            '  <({E} )___  ',
            '   (  ._>   ',
            '    `--´    ',
        ],
        [
            '            ',
            '    __      ',
            '  <({E} )___  ',
            '   (  ._>   ',
            '    `--´~   ',
        ],
        [
            '            ',
            '    __      ',
            '  <({E} )___  ',
            '   (  .__>  ',
            '    `--´    ',
        ],
    ],
    _a[types_js_1.goose] = [
        [
            '            ',
            '     ({E}>    ',
            '     ||     ',
            '   _(__)_   ',
            '    ^^^^    ',
        ],
        [
            '            ',
            '    ({E}>     ',
            '     ||     ',
            '   _(__)_   ',
            '    ^^^^    ',
        ],
        [
            '            ',
            '     ({E}>>   ',
            '     ||     ',
            '   _(__)_   ',
            '    ^^^^    ',
        ],
    ],
    _a[types_js_1.blob] = [
        [
            '            ',
            '   .----.   ',
            '  ( {E}  {E} )  ',
            '  (      )  ',
            '   `----´   ',
        ],
        [
            '            ',
            '  .------.  ',
            ' (  {E}  {E}  ) ',
            ' (        ) ',
            '  `------´  ',
        ],
        [
            '            ',
            '    .--.    ',
            '   ({E}  {E})   ',
            '   (    )   ',
            '    `--´    ',
        ],
    ],
    _a[types_js_1.cat] = [
        [
            '            ',
            '   /\\_/\\    ',
            '  ( {E}   {E})  ',
            '  (  ω  )   ',
            '  (")_(")   ',
        ],
        [
            '            ',
            '   /\\_/\\    ',
            '  ( {E}   {E})  ',
            '  (  ω  )   ',
            '  (")_(")~  ',
        ],
        [
            '            ',
            '   /\\-/\\    ',
            '  ( {E}   {E})  ',
            '  (  ω  )   ',
            '  (")_(")   ',
        ],
    ],
    _a[types_js_1.dragon] = [
        [
            '            ',
            '  /^\\  /^\\  ',
            ' <  {E}  {E}  > ',
            ' (   ~~   ) ',
            '  `-vvvv-´  ',
        ],
        [
            '            ',
            '  /^\\  /^\\  ',
            ' <  {E}  {E}  > ',
            ' (        ) ',
            '  `-vvvv-´  ',
        ],
        [
            '   ~    ~   ',
            '  /^\\  /^\\  ',
            ' <  {E}  {E}  > ',
            ' (   ~~   ) ',
            '  `-vvvv-´  ',
        ],
    ],
    _a[types_js_1.octopus] = [
        [
            '            ',
            '   .----.   ',
            '  ( {E}  {E} )  ',
            '  (______)  ',
            '  /\\/\\/\\/\\  ',
        ],
        [
            '            ',
            '   .----.   ',
            '  ( {E}  {E} )  ',
            '  (______)  ',
            '  \\/\\/\\/\\/  ',
        ],
        [
            '     o      ',
            '   .----.   ',
            '  ( {E}  {E} )  ',
            '  (______)  ',
            '  /\\/\\/\\/\\  ',
        ],
    ],
    _a[types_js_1.owl] = [
        [
            '            ',
            '   /\\  /\\   ',
            '  (({E})({E}))  ',
            '  (  ><  )  ',
            '   `----´   ',
        ],
        [
            '            ',
            '   /\\  /\\   ',
            '  (({E})({E}))  ',
            '  (  ><  )  ',
            '   .----.   ',
        ],
        [
            '            ',
            '   /\\  /\\   ',
            '  (({E})(-))  ',
            '  (  ><  )  ',
            '   `----´   ',
        ],
    ],
    _a[types_js_1.penguin] = [
        [
            '            ',
            '  .---.     ',
            '  ({E}>{E})     ',
            ' /(   )\\    ',
            '  `---´     ',
        ],
        [
            '            ',
            '  .---.     ',
            '  ({E}>{E})     ',
            ' |(   )|    ',
            '  `---´     ',
        ],
        [
            '  .---.     ',
            '  ({E}>{E})     ',
            ' /(   )\\    ',
            '  `---´     ',
            '   ~ ~      ',
        ],
    ],
    _a[types_js_1.turtle] = [
        [
            '            ',
            '   _,--._   ',
            '  ( {E}  {E} )  ',
            ' /[______]\\ ',
            '  ``    ``  ',
        ],
        [
            '            ',
            '   _,--._   ',
            '  ( {E}  {E} )  ',
            ' /[______]\\ ',
            '   ``  ``   ',
        ],
        [
            '            ',
            '   _,--._   ',
            '  ( {E}  {E} )  ',
            ' /[======]\\ ',
            '  ``    ``  ',
        ],
    ],
    _a[types_js_1.snail] = [
        [
            '            ',
            ' {E}    .--.  ',
            '  \\  ( @ )  ',
            '   \\_`--´   ',
            '  ~~~~~~~   ',
        ],
        [
            '            ',
            '  {E}   .--.  ',
            '  |  ( @ )  ',
            '   \\_`--´   ',
            '  ~~~~~~~   ',
        ],
        [
            '            ',
            ' {E}    .--.  ',
            '  \\  ( @  ) ',
            '   \\_`--´   ',
            '   ~~~~~~   ',
        ],
    ],
    _a[types_js_1.ghost] = [
        [
            '            ',
            '   .----.   ',
            '  / {E}  {E} \\  ',
            '  |      |  ',
            '  ~`~``~`~  ',
        ],
        [
            '            ',
            '   .----.   ',
            '  / {E}  {E} \\  ',
            '  |      |  ',
            '  `~`~~`~`  ',
        ],
        [
            '    ~  ~    ',
            '   .----.   ',
            '  / {E}  {E} \\  ',
            '  |      |  ',
            '  ~~`~~`~~  ',
        ],
    ],
    _a[types_js_1.axolotl] = [
        [
            '            ',
            '}~(______)~{',
            '}~({E} .. {E})~{',
            '  ( .--. )  ',
            '  (_/  \\_)  ',
        ],
        [
            '            ',
            '~}(______){~',
            '~}({E} .. {E}){~',
            '  ( .--. )  ',
            '  (_/  \\_)  ',
        ],
        [
            '            ',
            '}~(______)~{',
            '}~({E} .. {E})~{',
            '  (  --  )  ',
            '  ~_/  \\_~  ',
        ],
    ],
    _a[types_js_1.capybara] = [
        [
            '            ',
            '  n______n  ',
            ' ( {E}    {E} ) ',
            ' (   oo   ) ',
            '  `------´  ',
        ],
        [
            '            ',
            '  n______n  ',
            ' ( {E}    {E} ) ',
            ' (   Oo   ) ',
            '  `------´  ',
        ],
        [
            '    ~  ~    ',
            '  u______n  ',
            ' ( {E}    {E} ) ',
            ' (   oo   ) ',
            '  `------´  ',
        ],
    ],
    _a[types_js_1.cactus] = [
        [
            '            ',
            ' n  ____  n ',
            ' | |{E}  {E}| | ',
            ' |_|    |_| ',
            '   |    |   ',
        ],
        [
            '            ',
            '    ____    ',
            ' n |{E}  {E}| n ',
            ' |_|    |_| ',
            '   |    |   ',
        ],
        [
            ' n        n ',
            ' |  ____  | ',
            ' | |{E}  {E}| | ',
            ' |_|    |_| ',
            '   |    |   ',
        ],
    ],
    _a[types_js_1.robot] = [
        [
            '            ',
            '   .[||].   ',
            '  [ {E}  {E} ]  ',
            '  [ ==== ]  ',
            '  `------´  ',
        ],
        [
            '            ',
            '   .[||].   ',
            '  [ {E}  {E} ]  ',
            '  [ -==- ]  ',
            '  `------´  ',
        ],
        [
            '     *      ',
            '   .[||].   ',
            '  [ {E}  {E} ]  ',
            '  [ ==== ]  ',
            '  `------´  ',
        ],
    ],
    _a[types_js_1.rabbit] = [
        [
            '            ',
            '   (\\__/)   ',
            '  ( {E}  {E} )  ',
            ' =(  ..  )= ',
            '  (")__(")  ',
        ],
        [
            '            ',
            '   (|__/)   ',
            '  ( {E}  {E} )  ',
            ' =(  ..  )= ',
            '  (")__(")  ',
        ],
        [
            '            ',
            '   (\\__/)   ',
            '  ( {E}  {E} )  ',
            ' =( .  . )= ',
            '  (")__(")  ',
        ],
    ],
    _a[types_js_1.mushroom] = [
        [
            '            ',
            ' .-o-OO-o-. ',
            '(__________)',
            '   |{E}  {E}|   ',
            '   |____|   ',
        ],
        [
            '            ',
            ' .-O-oo-O-. ',
            '(__________)',
            '   |{E}  {E}|   ',
            '   |____|   ',
        ],
        [
            '   . o  .   ',
            ' .-o-OO-o-. ',
            '(__________)',
            '   |{E}  {E}|   ',
            '   |____|   ',
        ],
    ],
    _a[types_js_1.chonk] = [
        [
            '            ',
            '  /\\    /\\  ',
            ' ( {E}    {E} ) ',
            ' (   ..   ) ',
            '  `------´  ',
        ],
        [
            '            ',
            '  /\\    /|  ',
            ' ( {E}    {E} ) ',
            ' (   ..   ) ',
            '  `------´  ',
        ],
        [
            '            ',
            '  /\\    /\\  ',
            ' ( {E}    {E} ) ',
            ' (   ..   ) ',
            '  `------´~ ',
        ],
    ],
    _a);
var HAT_LINES = {
    none: '',
    crown: '   \\^^^/    ',
    tophat: '   [___]    ',
    propeller: '    -+-     ',
    halo: '   (   )    ',
    wizard: '    /^\\     ',
    beanie: '   (___)    ',
    tinyduck: '    ,>      ',
};
function renderSprite(bones, frame) {
    if (frame === void 0) { frame = 0; }
    var frames = BODIES[bones.species];
    var body = frames[frame % frames.length].map(function (line) {
        return line.replaceAll('{E}', bones.eye);
    });
    var lines = __spreadArray([], body, true);
    // Only replace with hat if line 0 is empty (some fidget frames use it for smoke etc)
    if (bones.hat !== 'none' && !lines[0].trim()) {
        lines[0] = HAT_LINES[bones.hat];
    }
    // Drop blank hat slot — wastes a row in the Card and ambient sprite when
    // there's no hat and the frame isn't using it for smoke/antenna/etc.
    // Only safe when ALL frames have blank line 0; otherwise heights oscillate.
    if (!lines[0].trim() && frames.every(function (f) { return !f[0].trim(); }))
        lines.shift();
    return lines;
}
function spriteFrameCount(species) {
    return BODIES[species].length;
}
function renderFace(bones) {
    var eye = bones.eye;
    switch (bones.species) {
        case types_js_1.duck:
        case types_js_1.goose:
            return "(".concat(eye, ">");
        case types_js_1.blob:
            return "(".concat(eye).concat(eye, ")");
        case types_js_1.cat:
            return "=".concat(eye, "\u03C9").concat(eye, "=");
        case types_js_1.dragon:
            return "<".concat(eye, "~").concat(eye, ">");
        case types_js_1.octopus:
            return "~(".concat(eye).concat(eye, ")~");
        case types_js_1.owl:
            return "(".concat(eye, ")(").concat(eye, ")");
        case types_js_1.penguin:
            return "(".concat(eye, ">)");
        case types_js_1.turtle:
            return "[".concat(eye, "_").concat(eye, "]");
        case types_js_1.snail:
            return "".concat(eye, "(@)");
        case types_js_1.ghost:
            return "/".concat(eye).concat(eye, "\\");
        case types_js_1.axolotl:
            return "}".concat(eye, ".").concat(eye, "{");
        case types_js_1.capybara:
            return "(".concat(eye, "oo").concat(eye, ")");
        case types_js_1.cactus:
            return "|".concat(eye, "  ").concat(eye, "|");
        case types_js_1.robot:
            return "[".concat(eye).concat(eye, "]");
        case types_js_1.rabbit:
            return "(".concat(eye, "..").concat(eye, ")");
        case types_js_1.mushroom:
            return "|".concat(eye, "  ").concat(eye, "|");
        case types_js_1.chonk:
            return "(".concat(eye, ".").concat(eye, ")");
    }
}
