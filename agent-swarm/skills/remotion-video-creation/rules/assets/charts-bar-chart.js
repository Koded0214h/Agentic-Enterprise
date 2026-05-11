"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyAnimation = void 0;
var Inter_1 = require("@remotion/google-fonts/Inter");
var remotion_1 = require("remotion");
var fontFamily = (0, Inter_1.loadFont)().fontFamily;
var COLOR_BAR = '#D4AF37';
var COLOR_TEXT = '#ffffff';
var COLOR_MUTED = '#888888';
var COLOR_BG = '#0a0a0a';
var COLOR_AXIS = '#333333';
// Ideal composition size: 1280x720
var Title = function (_a) {
    var children = _a.children;
    return (<div style={{ textAlign: 'center', marginBottom: 40 }}>
		<div style={{ color: COLOR_TEXT, fontSize: 48, fontWeight: 600 }}>
			{children}
		</div>
	</div>);
};
var YAxis = function (_a) {
    var steps = _a.steps, height = _a.height;
    return (<div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: height,
            paddingRight: 16,
        }}>
		{steps
            .slice()
            .reverse()
            .map(function (step) { return (<div key={step} style={{
                color: COLOR_MUTED,
                fontSize: 20,
                textAlign: 'right',
            }}>
					{step.toLocaleString()}
				</div>); })}
	</div>);
};
var Bar = function (_a) {
    var height = _a.height, progress = _a.progress;
    return (<div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
        }}>
		<div style={{
            width: '100%',
            height: height,
            backgroundColor: COLOR_BAR,
            borderRadius: '8px 8px 0 0',
            opacity: progress,
        }}/>
	</div>);
};
var XAxis = function (_a) {
    var children = _a.children, labels = _a.labels, height = _a.height;
    return (<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
		<div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 16,
            height: height,
            borderLeft: "2px solid ".concat(COLOR_AXIS),
            borderBottom: "2px solid ".concat(COLOR_AXIS),
            paddingLeft: 16,
        }}>
			{children}
		</div>
		<div style={{
            display: 'flex',
            gap: 16,
            paddingLeft: 16,
            marginTop: 12,
        }}>
			{labels.map(function (label) { return (<div key={label} style={{
                flex: 1,
                textAlign: 'center',
                color: COLOR_MUTED,
                fontSize: 20,
            }}>
					{label}
				</div>); })}
		</div>
	</div>);
};
var MyAnimation = function () {
    var frame = (0, remotion_1.useCurrentFrame)();
    var _a = (0, remotion_1.useVideoConfig)(), fps = _a.fps, height = _a.height;
    var data = [
        { month: 'Jan', price: 2039 },
        { month: 'Mar', price: 2160 },
        { month: 'May', price: 2327 },
        { month: 'Jul', price: 2426 },
        { month: 'Sep', price: 2634 },
        { month: 'Nov', price: 2672 },
    ];
    var minPrice = 2000;
    var maxPrice = 2800;
    var priceRange = maxPrice - minPrice;
    var chartHeight = height - 280;
    var yAxisSteps = [2000, 2400, 2800];
    return (<remotion_1.AbsoluteFill style={{
            backgroundColor: COLOR_BG,
            padding: 60,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: fontFamily,
        }}>
			<Title>Gold Price 2024</Title>

			<div style={{ display: 'flex', flex: 1 }}>
				<YAxis steps={yAxisSteps} height={chartHeight}/>
				<XAxis height={chartHeight} labels={data.map(function (d) { return d.month; })}>
					{data.map(function (item, i) {
            var progress = (0, remotion_1.spring)({
                frame: frame - i * 5 - 10,
                fps: fps,
                config: { damping: 18, stiffness: 80 },
            });
            var barHeight = ((item.price - minPrice) / priceRange) * chartHeight * progress;
            return (<Bar key={item.month} height={barHeight} progress={progress}/>);
        })}
				</XAxis>
			</div>
		</remotion_1.AbsoluteFill>);
};
exports.MyAnimation = MyAnimation;
