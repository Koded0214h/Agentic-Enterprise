"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Link;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var supports_hyperlinks_js_1 = require("../supports-hyperlinks.js");
var Text_js_1 = require("./Text.js");
function Link(t0) {
    var $ = (0, compiler_runtime_1.c)(5);
    var children = t0.children, url = t0.url, fallback = t0.fallback;
    var content = children !== null && children !== void 0 ? children : url;
    if ((0, supports_hyperlinks_js_1.supportsHyperlinks)()) {
        var t1_1;
        if ($[0] !== content || $[1] !== url) {
            t1_1 = <Text_js_1.default><ink-link href={url}>{content}</ink-link></Text_js_1.default>;
            $[0] = content;
            $[1] = url;
            $[2] = t1_1;
        }
        else {
            t1_1 = $[2];
        }
        return t1_1;
    }
    var t1 = fallback !== null && fallback !== void 0 ? fallback : content;
    var t2;
    if ($[3] !== t1) {
        t2 = <Text_js_1.default>{t1}</Text_js_1.default>;
        $[3] = t1;
        $[4] = t2;
    }
    else {
        t2 = $[4];
    }
    return t2;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdE5vZGUiLCJSZWFjdCIsInN1cHBvcnRzSHlwZXJsaW5rcyIsIlRleHQiLCJQcm9wcyIsImNoaWxkcmVuIiwidXJsIiwiZmFsbGJhY2siLCJMaW5rIiwidDAiLCIkIiwiX2MiLCJjb250ZW50IiwidDEiLCJ0MiJdLCJzb3VyY2VzIjpbIkxpbmsudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBzdXBwb3J0c0h5cGVybGlua3MgfSBmcm9tICcuLi9zdXBwb3J0cy1oeXBlcmxpbmtzLmpzJ1xuaW1wb3J0IFRleHQgZnJvbSAnLi9UZXh0LmpzJ1xuXG5leHBvcnQgdHlwZSBQcm9wcyA9IHtcbiAgcmVhZG9ubHkgY2hpbGRyZW4/OiBSZWFjdE5vZGVcbiAgcmVhZG9ubHkgdXJsOiBzdHJpbmdcbiAgcmVhZG9ubHkgZmFsbGJhY2s/OiBSZWFjdE5vZGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGluayh7XG4gIGNoaWxkcmVuLFxuICB1cmwsXG4gIGZhbGxiYWNrLFxufTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAvLyBVc2UgY2hpbGRyZW4gaWYgcHJvdmlkZWQsIG90aGVyd2lzZSBkaXNwbGF5IHRoZSBVUkxcbiAgY29uc3QgY29udGVudCA9IGNoaWxkcmVuID8/IHVybFxuXG4gIGlmIChzdXBwb3J0c0h5cGVybGlua3MoKSkge1xuICAgIC8vIFdyYXAgaW4gVGV4dCB0byBlbnN1cmUgd2UncmUgaW4gYSB0ZXh0IGNvbnRleHRcbiAgICAvLyAoaW5rLWxpbmsgaXMgYSB0ZXh0IGVsZW1lbnQgbGlrZSBpbmstdGV4dClcbiAgICByZXR1cm4gKFxuICAgICAgPFRleHQ+XG4gICAgICAgIDxpbmstbGluayBocmVmPXt1cmx9Pntjb250ZW50fTwvaW5rLWxpbms+XG4gICAgICA8L1RleHQ+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIDxUZXh0PntmYWxsYmFjayA/PyBjb250ZW50fTwvVGV4dD5cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLGNBQWNBLFNBQVMsUUFBUSxPQUFPO0FBQ3RDLE9BQU9DLEtBQUssTUFBTSxPQUFPO0FBQ3pCLFNBQVNDLGtCQUFrQixRQUFRLDJCQUEyQjtBQUM5RCxPQUFPQyxJQUFJLE1BQU0sV0FBVztBQUU1QixPQUFPLEtBQUtDLEtBQUssR0FBRztFQUNsQixTQUFTQyxRQUFRLENBQUMsRUFBRUwsU0FBUztFQUM3QixTQUFTTSxHQUFHLEVBQUUsTUFBTTtFQUNwQixTQUFTQyxRQUFRLENBQUMsRUFBRVAsU0FBUztBQUMvQixDQUFDO0FBRUQsZUFBZSxTQUFBUSxLQUFBQyxFQUFBO0VBQUEsTUFBQUMsQ0FBQSxHQUFBQyxFQUFBO0VBQWM7SUFBQU4sUUFBQTtJQUFBQyxHQUFBO0lBQUFDO0VBQUEsSUFBQUUsRUFJckI7RUFFTixNQUFBRyxPQUFBLEdBQWdCUCxRQUFlLElBQWZDLEdBQWU7RUFFL0IsSUFBSUosa0JBQWtCLENBQUMsQ0FBQztJQUFBLElBQUFXLEVBQUE7SUFBQSxJQUFBSCxDQUFBLFFBQUFFLE9BQUEsSUFBQUYsQ0FBQSxRQUFBSixHQUFBO01BSXBCTyxFQUFBLElBQUMsSUFBSSxDQUNILFNBQXlDLENBQXpCUCxJQUFHLENBQUhBLElBQUUsQ0FBQyxDQUFHTSxRQUFNLENBQUUsRUFBOUIsUUFBeUMsQ0FDM0MsRUFGQyxJQUFJLENBRUU7TUFBQUYsQ0FBQSxNQUFBRSxPQUFBO01BQUFGLENBQUEsTUFBQUosR0FBQTtNQUFBSSxDQUFBLE1BQUFHLEVBQUE7SUFBQTtNQUFBQSxFQUFBLEdBQUFILENBQUE7SUFBQTtJQUFBLE9BRlBHLEVBRU87RUFBQTtFQUlHLE1BQUFBLEVBQUEsR0FBQU4sUUFBbUIsSUFBbkJLLE9BQW1CO0VBQUEsSUFBQUUsRUFBQTtFQUFBLElBQUFKLENBQUEsUUFBQUcsRUFBQTtJQUExQkMsRUFBQSxJQUFDLElBQUksQ0FBRSxDQUFBRCxFQUFrQixDQUFFLEVBQTFCLElBQUksQ0FBNkI7SUFBQUgsQ0FBQSxNQUFBRyxFQUFBO0lBQUFILENBQUEsTUFBQUksRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQUosQ0FBQTtFQUFBO0VBQUEsT0FBbENJLEVBQWtDO0FBQUEiLCJpZ25vcmVMaXN0IjpbXX0=
