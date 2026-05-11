"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorize = exports.CHALK_CLAMPED_FOR_TMUX = exports.CHALK_BOOSTED_FOR_XTERMJS = void 0;
exports.applyTextStyles = applyTextStyles;
exports.applyColor = applyColor;
var chalk_1 = require("chalk");
/**
 * xterm.js (VS Code, Cursor, code-server, Coder) has supported truecolor
 * since 2017, but code-server/Coder containers often don't set
 * COLORTERM=truecolor. chalk's supports-color doesn't recognize
 * TERM_PROGRAM=vscode (it only knows iTerm.app/Apple_Terminal), so it falls
 * through to the -256color regex → level 2. At level 2, chalk.rgb()
 * downgrades to the nearest 6×6×6 cube color: rgb(215,119,87) (Claude
 * orange) → idx 174 rgb(215,135,135) — washed-out salmon.
 *
 * Gated on level === 2 (not < 3) to respect NO_COLOR / FORCE_COLOR=0 —
 * those yield level 0 and are an explicit "no colors" request. Desktop VS
 * Code sets COLORTERM=truecolor itself, so this is a no-op there (already 3).
 *
 * Must run BEFORE the tmux clamp — if tmux is running inside a VS Code
 * terminal, tmux's passthrough limitation wins and we want level 2.
 */
function boostChalkLevelForXtermJs() {
    if (process.env.TERM_PROGRAM === 'vscode' && chalk_1.default.level === 2) {
        chalk_1.default.level = 3;
        return true;
    }
    return false;
}
/**
 * tmux parses truecolor SGR (\e[48;2;r;g;bm) into its cell buffer correctly,
 * but its client-side emitter only re-emits truecolor to the outer terminal if
 * the outer terminal advertises Tc/RGB capability (via terminal-overrides).
 * Default tmux config doesn't set this, so tmux emits the cell to iTerm2/etc
 * WITHOUT the bg sequence — outer terminal's buffer has bg=default → black on
 * dark profiles. Clamping to level 2 makes chalk emit 256-color (\e[48;5;Nm),
 * which tmux passes through cleanly. grey93 (255) is visually identical to
 * rgb(240,240,240).
 *
 * Users who HAVE set `terminal-overrides ,*:Tc` get a technically-unnecessary
 * downgrade, but the visual difference is imperceptible. Querying
 * `tmux show -gv terminal-overrides` to detect this would add a subprocess on
 * startup — not worth it.
 *
 * $TMUX is a pty-lifecycle env var set by tmux itself; it never comes from
 * globalSettings.env, so reading it here is correct. chalk is a singleton, so
 * this clamps ALL truecolor output (fg+bg+hex) across the entire app.
 */
function clampChalkLevelForTmux() {
    // bg.ts sets terminal-overrides :Tc before attach, so truecolor passes
    // through — skip the clamp. General escape hatch for anyone who's
    // configured their tmux correctly.
    if (process.env.CLAUDE_CODE_TMUX_TRUECOLOR)
        return false;
    if (process.env.TMUX && chalk_1.default.level > 2) {
        chalk_1.default.level = 2;
        return true;
    }
    return false;
}
// Computed once at module load — terminal/tmux environment doesn't change mid-session.
// Order matters: boost first so the tmux clamp can re-clamp if tmux is running
// inside a VS Code terminal. Exported for debugging — tree-shaken if unused.
exports.CHALK_BOOSTED_FOR_XTERMJS = boostChalkLevelForXtermJs();
exports.CHALK_CLAMPED_FOR_TMUX = clampChalkLevelForTmux();
var RGB_REGEX = /^rgb\(\s?(\d+),\s?(\d+),\s?(\d+)\s?\)$/;
var ANSI_REGEX = /^ansi256\(\s?(\d+)\s?\)$/;
var colorize = function (str, color, type) {
    if (!color) {
        return str;
    }
    if (color.startsWith('ansi:')) {
        var value = color.substring('ansi:'.length);
        switch (value) {
            case 'black':
                return type === 'foreground' ? chalk_1.default.black(str) : chalk_1.default.bgBlack(str);
            case 'red':
                return type === 'foreground' ? chalk_1.default.red(str) : chalk_1.default.bgRed(str);
            case 'green':
                return type === 'foreground' ? chalk_1.default.green(str) : chalk_1.default.bgGreen(str);
            case 'yellow':
                return type === 'foreground' ? chalk_1.default.yellow(str) : chalk_1.default.bgYellow(str);
            case 'blue':
                return type === 'foreground' ? chalk_1.default.blue(str) : chalk_1.default.bgBlue(str);
            case 'magenta':
                return type === 'foreground' ? chalk_1.default.magenta(str) : chalk_1.default.bgMagenta(str);
            case 'cyan':
                return type === 'foreground' ? chalk_1.default.cyan(str) : chalk_1.default.bgCyan(str);
            case 'white':
                return type === 'foreground' ? chalk_1.default.white(str) : chalk_1.default.bgWhite(str);
            case 'blackBright':
                return type === 'foreground'
                    ? chalk_1.default.blackBright(str)
                    : chalk_1.default.bgBlackBright(str);
            case 'redBright':
                return type === 'foreground'
                    ? chalk_1.default.redBright(str)
                    : chalk_1.default.bgRedBright(str);
            case 'greenBright':
                return type === 'foreground'
                    ? chalk_1.default.greenBright(str)
                    : chalk_1.default.bgGreenBright(str);
            case 'yellowBright':
                return type === 'foreground'
                    ? chalk_1.default.yellowBright(str)
                    : chalk_1.default.bgYellowBright(str);
            case 'blueBright':
                return type === 'foreground'
                    ? chalk_1.default.blueBright(str)
                    : chalk_1.default.bgBlueBright(str);
            case 'magentaBright':
                return type === 'foreground'
                    ? chalk_1.default.magentaBright(str)
                    : chalk_1.default.bgMagentaBright(str);
            case 'cyanBright':
                return type === 'foreground'
                    ? chalk_1.default.cyanBright(str)
                    : chalk_1.default.bgCyanBright(str);
            case 'whiteBright':
                return type === 'foreground'
                    ? chalk_1.default.whiteBright(str)
                    : chalk_1.default.bgWhiteBright(str);
        }
    }
    if (color.startsWith('#')) {
        return type === 'foreground'
            ? chalk_1.default.hex(color)(str)
            : chalk_1.default.bgHex(color)(str);
    }
    if (color.startsWith('ansi256')) {
        var matches = ANSI_REGEX.exec(color);
        if (!matches) {
            return str;
        }
        var value = Number(matches[1]);
        return type === 'foreground'
            ? chalk_1.default.ansi256(value)(str)
            : chalk_1.default.bgAnsi256(value)(str);
    }
    if (color.startsWith('rgb')) {
        var matches = RGB_REGEX.exec(color);
        if (!matches) {
            return str;
        }
        var firstValue = Number(matches[1]);
        var secondValue = Number(matches[2]);
        var thirdValue = Number(matches[3]);
        return type === 'foreground'
            ? chalk_1.default.rgb(firstValue, secondValue, thirdValue)(str)
            : chalk_1.default.bgRgb(firstValue, secondValue, thirdValue)(str);
    }
    return str;
};
exports.colorize = colorize;
/**
 * Apply TextStyles to a string using chalk.
 * This is the inverse of parsing ANSI codes - we generate them from structured styles.
 * Theme resolution happens at component layer, not here.
 */
function applyTextStyles(text, styles) {
    var result = text;
    // Apply styles in reverse order of desired nesting.
    // chalk wraps text so later calls become outer wrappers.
    // Desired order (outermost to innermost):
    //   background > foreground > text modifiers
    // So we apply: text modifiers first, then foreground, then background last.
    if (styles.inverse) {
        result = chalk_1.default.inverse(result);
    }
    if (styles.strikethrough) {
        result = chalk_1.default.strikethrough(result);
    }
    if (styles.underline) {
        result = chalk_1.default.underline(result);
    }
    if (styles.italic) {
        result = chalk_1.default.italic(result);
    }
    if (styles.bold) {
        result = chalk_1.default.bold(result);
    }
    if (styles.dim) {
        result = chalk_1.default.dim(result);
    }
    if (styles.color) {
        // Color is now always a raw color value (theme resolution happens at component layer)
        result = (0, exports.colorize)(result, styles.color, 'foreground');
    }
    if (styles.backgroundColor) {
        // backgroundColor is now always a raw color value
        result = (0, exports.colorize)(result, styles.backgroundColor, 'background');
    }
    return result;
}
/**
 * Apply a raw color value to text.
 * Theme resolution should happen at component layer, not here.
 */
function applyColor(text, color) {
    if (!color) {
        return text;
    }
    return (0, exports.colorize)(text, color, 'foreground');
}
