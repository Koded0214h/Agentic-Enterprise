"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastIcon = FastIcon;
exports.getFastIconString = getFastIconString;
var compiler_runtime_1 = require("react/compiler-runtime");
var chalk_1 = require("chalk");
var React = require("react");
var figures_js_1 = require("../constants/figures.js");
var ink_js_1 = require("../ink.js");
var config_js_1 = require("../utils/config.js");
var systemTheme_js_1 = require("../utils/systemTheme.js");
var color_js_1 = require("./design-system/color.js");
function FastIcon(t0) {
    var $ = (0, compiler_runtime_1.c)(2);
    var cooldown = t0.cooldown;
    if (cooldown) {
        var t1_1;
        if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
            t1_1 = <ink_js_1.Text color="promptBorder" dimColor={true}>{figures_js_1.LIGHTNING_BOLT}</ink_js_1.Text>;
            $[0] = t1_1;
        }
        else {
            t1_1 = $[0];
        }
        return t1_1;
    }
    var t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = <ink_js_1.Text color="fastMode">{figures_js_1.LIGHTNING_BOLT}</ink_js_1.Text>;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    return t1;
}
function getFastIconString(applyColor, cooldown) {
    if (applyColor === void 0) { applyColor = true; }
    if (cooldown === void 0) { cooldown = false; }
    if (!applyColor) {
        return figures_js_1.LIGHTNING_BOLT;
    }
    var themeName = (0, systemTheme_js_1.resolveThemeSetting)((0, config_js_1.getGlobalConfig)().theme);
    if (cooldown) {
        return chalk_1.default.dim((0, color_js_1.color)('promptBorder', themeName)(figures_js_1.LIGHTNING_BOLT));
    }
    return (0, color_js_1.color)('fastMode', themeName)(figures_js_1.LIGHTNING_BOLT);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsIlJlYWN0IiwiTElHSFROSU5HX0JPTFQiLCJUZXh0IiwiZ2V0R2xvYmFsQ29uZmlnIiwicmVzb2x2ZVRoZW1lU2V0dGluZyIsImNvbG9yIiwiUHJvcHMiLCJjb29sZG93biIsIkZhc3RJY29uIiwidDAiLCIkIiwiX2MiLCJ0MSIsIlN5bWJvbCIsImZvciIsImdldEZhc3RJY29uU3RyaW5nIiwiYXBwbHlDb2xvciIsInRoZW1lTmFtZSIsInRoZW1lIiwiZGltIl0sInNvdXJjZXMiOlsiRmFzdEljb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsaydcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTElHSFROSU5HX0JPTFQgfSBmcm9tICcuLi9jb25zdGFudHMvZmlndXJlcy5qcydcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi9pbmsuanMnXG5pbXBvcnQgeyBnZXRHbG9iYWxDb25maWcgfSBmcm9tICcuLi91dGlscy9jb25maWcuanMnXG5pbXBvcnQgeyByZXNvbHZlVGhlbWVTZXR0aW5nIH0gZnJvbSAnLi4vdXRpbHMvc3lzdGVtVGhlbWUuanMnXG5pbXBvcnQgeyBjb2xvciB9IGZyb20gJy4vZGVzaWduLXN5c3RlbS9jb2xvci5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgY29vbGRvd24/OiBib29sZWFuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGYXN0SWNvbih7IGNvb2xkb3duIH06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgaWYgKGNvb2xkb3duKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUZXh0IGNvbG9yPVwicHJvbXB0Qm9yZGVyXCIgZGltQ29sb3I+XG4gICAgICAgIHtMSUdIVE5JTkdfQk9MVH1cbiAgICAgIDwvVGV4dD5cbiAgICApXG4gIH1cbiAgcmV0dXJuIDxUZXh0IGNvbG9yPVwiZmFzdE1vZGVcIj57TElHSFROSU5HX0JPTFR9PC9UZXh0PlxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmFzdEljb25TdHJpbmcoYXBwbHlDb2xvciA9IHRydWUsIGNvb2xkb3duID0gZmFsc2UpOiBzdHJpbmcge1xuICBpZiAoIWFwcGx5Q29sb3IpIHtcbiAgICByZXR1cm4gTElHSFROSU5HX0JPTFRcbiAgfVxuICBjb25zdCB0aGVtZU5hbWUgPSByZXNvbHZlVGhlbWVTZXR0aW5nKGdldEdsb2JhbENvbmZpZygpLnRoZW1lKVxuICBpZiAoY29vbGRvd24pIHtcbiAgICByZXR1cm4gY2hhbGsuZGltKGNvbG9yKCdwcm9tcHRCb3JkZXInLCB0aGVtZU5hbWUpKExJR0hUTklOR19CT0xUKSlcbiAgfVxuICByZXR1cm4gY29sb3IoJ2Zhc3RNb2RlJywgdGhlbWVOYW1lKShMSUdIVE5JTkdfQk9MVClcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLEtBQUssTUFBTSxPQUFPO0FBQ3pCLE9BQU8sS0FBS0MsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0MsY0FBYyxRQUFRLHlCQUF5QjtBQUN4RCxTQUFTQyxJQUFJLFFBQVEsV0FBVztBQUNoQyxTQUFTQyxlQUFlLFFBQVEsb0JBQW9CO0FBQ3BELFNBQVNDLG1CQUFtQixRQUFRLHlCQUF5QjtBQUM3RCxTQUFTQyxLQUFLLFFBQVEsMEJBQTBCO0FBRWhELEtBQUtDLEtBQUssR0FBRztFQUNYQyxRQUFRLENBQUMsRUFBRSxPQUFPO0FBQ3BCLENBQUM7QUFFRCxPQUFPLFNBQUFDLFNBQUFDLEVBQUE7RUFBQSxNQUFBQyxDQUFBLEdBQUFDLEVBQUE7RUFBa0I7SUFBQUo7RUFBQSxJQUFBRSxFQUFtQjtFQUMxQyxJQUFJRixRQUFRO0lBQUEsSUFBQUssRUFBQTtJQUFBLElBQUFGLENBQUEsUUFBQUcsTUFBQSxDQUFBQyxHQUFBO01BRVJGLEVBQUEsSUFBQyxJQUFJLENBQU8sS0FBYyxDQUFkLGNBQWMsQ0FBQyxRQUFRLENBQVIsS0FBTyxDQUFDLENBQ2hDWCxlQUFhLENBQ2hCLEVBRkMsSUFBSSxDQUVFO01BQUFTLENBQUEsTUFBQUUsRUFBQTtJQUFBO01BQUFBLEVBQUEsR0FBQUYsQ0FBQTtJQUFBO0lBQUEsT0FGUEUsRUFFTztFQUFBO0VBRVYsSUFBQUEsRUFBQTtFQUFBLElBQUFGLENBQUEsUUFBQUcsTUFBQSxDQUFBQyxHQUFBO0lBQ01GLEVBQUEsSUFBQyxJQUFJLENBQU8sS0FBVSxDQUFWLFVBQVUsQ0FBRVgsZUFBYSxDQUFFLEVBQXRDLElBQUksQ0FBeUM7SUFBQVMsQ0FBQSxNQUFBRSxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBRixDQUFBO0VBQUE7RUFBQSxPQUE5Q0UsRUFBOEM7QUFBQTtBQUd2RCxPQUFPLFNBQVNHLGlCQUFpQkEsQ0FBQ0MsVUFBVSxHQUFHLElBQUksRUFBRVQsUUFBUSxHQUFHLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQztFQUM3RSxJQUFJLENBQUNTLFVBQVUsRUFBRTtJQUNmLE9BQU9mLGNBQWM7RUFDdkI7RUFDQSxNQUFNZ0IsU0FBUyxHQUFHYixtQkFBbUIsQ0FBQ0QsZUFBZSxDQUFDLENBQUMsQ0FBQ2UsS0FBSyxDQUFDO0VBQzlELElBQUlYLFFBQVEsRUFBRTtJQUNaLE9BQU9SLEtBQUssQ0FBQ29CLEdBQUcsQ0FBQ2QsS0FBSyxDQUFDLGNBQWMsRUFBRVksU0FBUyxDQUFDLENBQUNoQixjQUFjLENBQUMsQ0FBQztFQUNwRTtFQUNBLE9BQU9JLEtBQUssQ0FBQyxVQUFVLEVBQUVZLFNBQVMsQ0FBQyxDQUFDaEIsY0FBYyxDQUFDO0FBQ3JEIiwiaWdub3JlTGlzdCI6W119
