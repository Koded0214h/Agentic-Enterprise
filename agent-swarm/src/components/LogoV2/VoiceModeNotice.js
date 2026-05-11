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
exports.VoiceModeNotice = VoiceModeNotice;
var compiler_runtime_1 = require("react/compiler-runtime");
var bun_bundle_1 = require("bun:bundle");
var React = require("react");
var react_1 = require("react");
var ink_js_1 = require("../../ink.js");
var config_js_1 = require("../../utils/config.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var voiceModeEnabled_js_1 = require("../../voice/voiceModeEnabled.js");
var AnimatedAsterisk_js_1 = require("./AnimatedAsterisk.js");
var Opus1mMergeNotice_js_1 = require("./Opus1mMergeNotice.js");
var MAX_SHOW_COUNT = 3;
function VoiceModeNotice() {
    var $ = (0, compiler_runtime_1.c)(1);
    var t0;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = (0, bun_bundle_1.feature)("VOICE_MODE") ? <VoiceModeNoticeInner /> : null;
        $[0] = t0;
    }
    else {
        t0 = $[0];
    }
    return t0;
}
function VoiceModeNoticeInner() {
    var $ = (0, compiler_runtime_1.c)(4);
    var show = (0, react_1.useState)(_temp)[0];
    var t0;
    var t1;
    if ($[0] !== show) {
        t0 = function () {
            var _a;
            if (!show) {
                return;
            }
            var newCount = ((_a = (0, config_js_1.getGlobalConfig)().voiceNoticeSeenCount) !== null && _a !== void 0 ? _a : 0) + 1;
            (0, config_js_1.saveGlobalConfig)(function (prev) {
                var _a;
                if (((_a = prev.voiceNoticeSeenCount) !== null && _a !== void 0 ? _a : 0) >= newCount) {
                    return prev;
                }
                return __assign(__assign({}, prev), { voiceNoticeSeenCount: newCount });
            });
        };
        t1 = [show];
        $[0] = show;
        $[1] = t0;
        $[2] = t1;
    }
    else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, react_1.useEffect)(t0, t1);
    if (!show) {
        return null;
    }
    var t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = <ink_js_1.Box paddingLeft={2}><AnimatedAsterisk_js_1.AnimatedAsterisk /><ink_js_1.Text dimColor={true}> Voice mode is now available · /voice to enable</ink_js_1.Text></ink_js_1.Box>;
        $[3] = t2;
    }
    else {
        t2 = $[3];
    }
    return t2;
}
function _temp() {
    var _a;
    return (0, voiceModeEnabled_js_1.isVoiceModeEnabled)() && (0, settings_js_1.getInitialSettings)().voiceEnabled !== true && ((_a = (0, config_js_1.getGlobalConfig)().voiceNoticeSeenCount) !== null && _a !== void 0 ? _a : 0) < MAX_SHOW_COUNT && !(0, Opus1mMergeNotice_js_1.shouldShowOpus1mMergeNotice)();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmZWF0dXJlIiwiUmVhY3QiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIkJveCIsIlRleHQiLCJnZXRHbG9iYWxDb25maWciLCJzYXZlR2xvYmFsQ29uZmlnIiwiZ2V0SW5pdGlhbFNldHRpbmdzIiwiaXNWb2ljZU1vZGVFbmFibGVkIiwiQW5pbWF0ZWRBc3RlcmlzayIsInNob3VsZFNob3dPcHVzMW1NZXJnZU5vdGljZSIsIk1BWF9TSE9XX0NPVU5UIiwiVm9pY2VNb2RlTm90aWNlIiwiJCIsIl9jIiwidDAiLCJTeW1ib2wiLCJmb3IiLCJWb2ljZU1vZGVOb3RpY2VJbm5lciIsInNob3ciLCJfdGVtcCIsInQxIiwibmV3Q291bnQiLCJ2b2ljZU5vdGljZVNlZW5Db3VudCIsInByZXYiLCJ0MiIsInZvaWNlRW5hYmxlZCJdLCJzb3VyY2VzIjpbIlZvaWNlTW9kZU5vdGljZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmVhdHVyZSB9IGZyb20gJ2J1bjpidW5kbGUnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7IGdldEdsb2JhbENvbmZpZywgc2F2ZUdsb2JhbENvbmZpZyB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZy5qcydcbmltcG9ydCB7IGdldEluaXRpYWxTZXR0aW5ncyB9IGZyb20gJy4uLy4uL3V0aWxzL3NldHRpbmdzL3NldHRpbmdzLmpzJ1xuaW1wb3J0IHsgaXNWb2ljZU1vZGVFbmFibGVkIH0gZnJvbSAnLi4vLi4vdm9pY2Uvdm9pY2VNb2RlRW5hYmxlZC5qcydcbmltcG9ydCB7IEFuaW1hdGVkQXN0ZXJpc2sgfSBmcm9tICcuL0FuaW1hdGVkQXN0ZXJpc2suanMnXG5pbXBvcnQgeyBzaG91bGRTaG93T3B1czFtTWVyZ2VOb3RpY2UgfSBmcm9tICcuL09wdXMxbU1lcmdlTm90aWNlLmpzJ1xuXG5jb25zdCBNQVhfU0hPV19DT1VOVCA9IDNcblxuZXhwb3J0IGZ1bmN0aW9uIFZvaWNlTW9kZU5vdGljZSgpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAvLyBQb3NpdGl2ZSB0ZXJuYXJ5IHBhdHRlcm4g4oCUIHNlZSBkb2NzL2ZlYXR1cmUtZ2F0aW5nLm1kLlxuICAvLyBBbGwgc3RyaW5ncyBtdXN0IGJlIGluc2lkZSB0aGUgZ3VhcmRlZCBicmFuY2ggZm9yIGRlYWQtY29kZSBlbGltaW5hdGlvbi5cbiAgcmV0dXJuIGZlYXR1cmUoJ1ZPSUNFX01PREUnKSA/IDxWb2ljZU1vZGVOb3RpY2VJbm5lciAvPiA6IG51bGxcbn1cblxuZnVuY3Rpb24gVm9pY2VNb2RlTm90aWNlSW5uZXIoKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgLy8gQ2FwdHVyZSBlbGlnaWJpbGl0eSBvbmNlIGF0IG1vdW50IOKAlCBubyByZWFjdGl2ZSBzdWJzY3JpcHRpb25zLiBUaGlzIHNpdHNcbiAgLy8gYXQgdGhlIHRvcCBvZiB0aGUgbWVzc2FnZSBsaXN0IGFuZCBlbnRlcnMgc2Nyb2xsYmFjayBxdWlja2x5OyBhbnlcbiAgLy8gcmUtcmVuZGVyIGFmdGVyIGl0J3MgaW4gc2Nyb2xsYmFjayB3b3VsZCBmb3JjZSBhIGZ1bGwgdGVybWluYWwgcmVzZXQuXG4gIC8vIElmIHRoZSB1c2VyIHJ1bnMgL3ZvaWNlIHRoaXMgc2Vzc2lvbiwgdGhlIG5vdGljZSBzdGF5cyB2aXNpYmxlOyBpdCB3b24ndFxuICAvLyBzaG93IG5leHQgc2Vzc2lvbiBzaW5jZSB2b2ljZUVuYWJsZWQgd2lsbCBiZSB0cnVlIG9uIGRpc2suXG4gIGNvbnN0IFtzaG93XSA9IHVzZVN0YXRlKFxuICAgICgpID0+XG4gICAgICBpc1ZvaWNlTW9kZUVuYWJsZWQoKSAmJlxuICAgICAgZ2V0SW5pdGlhbFNldHRpbmdzKCkudm9pY2VFbmFibGVkICE9PSB0cnVlICYmXG4gICAgICAoZ2V0R2xvYmFsQ29uZmlnKCkudm9pY2VOb3RpY2VTZWVuQ291bnQgPz8gMCkgPCBNQVhfU0hPV19DT1VOVCAmJlxuICAgICAgIXNob3VsZFNob3dPcHVzMW1NZXJnZU5vdGljZSgpLFxuICApXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXNob3cpIHJldHVyblxuICAgIC8vIENhcHR1cmUgb3V0c2lkZSB0aGUgdXBkYXRlciBzbyBTdHJpY3RNb2RlJ3Mgc2Vjb25kIGludm9jYXRpb24gaXMgYSBuby1vcC5cbiAgICBjb25zdCBuZXdDb3VudCA9IChnZXRHbG9iYWxDb25maWcoKS52b2ljZU5vdGljZVNlZW5Db3VudCA/PyAwKSArIDFcbiAgICBzYXZlR2xvYmFsQ29uZmlnKHByZXYgPT4ge1xuICAgICAgaWYgKChwcmV2LnZvaWNlTm90aWNlU2VlbkNvdW50ID8/IDApID49IG5ld0NvdW50KSByZXR1cm4gcHJldlxuICAgICAgcmV0dXJuIHsgLi4ucHJldiwgdm9pY2VOb3RpY2VTZWVuQ291bnQ6IG5ld0NvdW50IH1cbiAgICB9KVxuICB9LCBbc2hvd10pXG5cbiAgaWYgKCFzaG93KSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPEJveCBwYWRkaW5nTGVmdD17Mn0+XG4gICAgICA8QW5pbWF0ZWRBc3RlcmlzayAvPlxuICAgICAgPFRleHQgZGltQ29sb3I+IFZvaWNlIG1vZGUgaXMgbm93IGF2YWlsYWJsZSDCtyAvdm9pY2UgdG8gZW5hYmxlPC9UZXh0PlxuICAgIDwvQm94PlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTQSxPQUFPLFFBQVEsWUFBWTtBQUNwQyxPQUFPLEtBQUtDLEtBQUssTUFBTSxPQUFPO0FBQzlCLFNBQVNDLFNBQVMsRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDM0MsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLFFBQVEsY0FBYztBQUN4QyxTQUFTQyxlQUFlLEVBQUVDLGdCQUFnQixRQUFRLHVCQUF1QjtBQUN6RSxTQUFTQyxrQkFBa0IsUUFBUSxrQ0FBa0M7QUFDckUsU0FBU0Ms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
