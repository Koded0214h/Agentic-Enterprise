"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyAnimation = void 0;
var Inter_1 = require("@remotion/google-fonts/Inter");
var react_1 = require("react");
var remotion_1 = require("remotion");
/*
 * Highlight a word in a sentence with a spring-animated wipe effect.
 */
// Ideal composition size: 1280x720
var COLOR_BG = '#ffffff';
var COLOR_TEXT = '#000000';
var COLOR_HIGHLIGHT = '#A7C7E7';
var FULL_TEXT = 'This is Remotion.';
var HIGHLIGHT_WORD = 'Remotion';
var FONT_SIZE = 72;
var FONT_WEIGHT = 700;
var HIGHLIGHT_START_FRAME = 30;
var HIGHLIGHT_WIPE_DURATION = 18;
var fontFamily = (0, Inter_1.loadFont)().fontFamily;
var Highlight = function (_a) {
    var word = _a.word, color = _a.color, delay = _a.delay, durationInFrames = _a.durationInFrames;
    var frame = (0, remotion_1.useCurrentFrame)();
    var fps = (0, remotion_1.useVideoConfig)().fps;
    var highlightProgress = (0, remotion_1.spring)({
        fps: fps,
        frame: frame,
        config: { damping: 200 },
        delay: delay,
        durationInFrames: durationInFrames,
    });
    var scaleX = Math.max(0, Math.min(1, highlightProgress));
    return (<span style={{ position: 'relative', display: 'inline-block' }}>
			<span style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1.05em',
            transform: "translateY(-50%) scaleX(".concat(scaleX, ")"),
            transformOrigin: 'left center',
            backgroundColor: color,
            borderRadius: '0.18em',
            zIndex: 0,
        }}/>
			<span style={{ position: 'relative', zIndex: 1 }}>{word}</span>
		</span>);
};
var MyAnimation = function () {
    var highlightIndex = FULL_TEXT.indexOf(HIGHLIGHT_WORD);
    var hasHighlight = highlightIndex >= 0;
    var preText = hasHighlight ? FULL_TEXT.slice(0, highlightIndex) : FULL_TEXT;
    var postText = hasHighlight
        ? FULL_TEXT.slice(highlightIndex + HIGHLIGHT_WORD.length)
        : '';
    return (<remotion_1.AbsoluteFill style={{
            backgroundColor: COLOR_BG,
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fontFamily,
        }}>
			<div style={{
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
        }}>
				{hasHighlight ? (<>
						<span>{preText}</span>
						<Highlight word={HIGHLIGHT_WORD} color={COLOR_HIGHLIGHT} delay={HIGHLIGHT_START_FRAME} durationInFrames={HIGHLIGHT_WIPE_DURATION}/>
						<span>{postText}</span>
					</>) : (<span>{FULL_TEXT}</span>)}
			</div>
		</remotion_1.AbsoluteFill>);
};
exports.MyAnimation = MyAnimation;
