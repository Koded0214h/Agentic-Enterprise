"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyAnimation = void 0;
var remotion_1 = require("remotion");
var COLOR_BG = '#ffffff';
var COLOR_TEXT = '#000000';
var FULL_TEXT = 'From prompt to motion graphics. This is Remotion.';
var PAUSE_AFTER = 'From prompt to motion graphics.';
var FONT_SIZE = 72;
var FONT_WEIGHT = 700;
var CHAR_FRAMES = 2;
var CURSOR_BLINK_FRAMES = 16;
var PAUSE_SECONDS = 1;
// Ideal composition size: 1280x720
var getTypedText = function (_a) {
    var frame = _a.frame, fullText = _a.fullText, pauseAfter = _a.pauseAfter, charFrames = _a.charFrames, pauseFrames = _a.pauseFrames;
    var pauseIndex = fullText.indexOf(pauseAfter);
    var preLen = pauseIndex >= 0 ? pauseIndex + pauseAfter.length : fullText.length;
    var typedChars = 0;
    if (frame < preLen * charFrames) {
        typedChars = Math.floor(frame / charFrames);
    }
    else if (frame < preLen * charFrames + pauseFrames) {
        typedChars = preLen;
    }
    else {
        var postPhase = frame - preLen * charFrames - pauseFrames;
        typedChars = Math.min(fullText.length, preLen + Math.floor(postPhase / charFrames));
    }
    return fullText.slice(0, typedChars);
};
var Cursor = function (_a) {
    var frame = _a.frame, blinkFrames = _a.blinkFrames, _b = _a.symbol, symbol = _b === void 0 ? '\u258C' : _b;
    var opacity = (0, remotion_1.interpolate)(frame % blinkFrames, [0, blinkFrames / 2, blinkFrames], [1, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <span style={{ opacity: opacity }}>{symbol}</span>;
};
var MyAnimation = function () {
    var frame = (0, remotion_1.useCurrentFrame)();
    var fps = (0, remotion_1.useVideoConfig)().fps;
    var pauseFrames = Math.round(fps * PAUSE_SECONDS);
    var typedText = getTypedText({
        frame: frame,
        fullText: FULL_TEXT,
        pauseAfter: PAUSE_AFTER,
        charFrames: CHAR_FRAMES,
        pauseFrames: pauseFrames,
    });
    return (<remotion_1.AbsoluteFill style={{
            backgroundColor: COLOR_BG,
        }}>
			<div style={{
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            fontFamily: 'sans-serif',
        }}>
				<span>{typedText}</span>
				<Cursor frame={frame} blinkFrames={CURSOR_BLINK_FRAMES}/>
			</div>
		</remotion_1.AbsoluteFill>);
};
exports.MyAnimation = MyAnimation;
