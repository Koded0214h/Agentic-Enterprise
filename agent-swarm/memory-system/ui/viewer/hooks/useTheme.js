"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = useTheme;
var react_1 = require("react");
var STORAGE_KEY = 'claude-mem-theme';
function getSystemTheme() {
    if (typeof window === 'undefined')
        return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function getStoredPreference() {
    try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'system' || stored === 'light' || stored === 'dark') {
            return stored;
        }
    }
    catch (e) {
        console.warn('Failed to read theme preference from localStorage:', e);
    }
    return 'system';
}
function resolveTheme(preference) {
    if (preference === 'system') {
        return getSystemTheme();
    }
    return preference;
}
function useTheme() {
    var _a = (0, react_1.useState)(getStoredPreference), preference = _a[0], setPreference = _a[1];
    var _b = (0, react_1.useState)(function () {
        return resolveTheme(getStoredPreference());
    }), resolvedTheme = _b[0], setResolvedTheme = _b[1];
    // Update resolved theme when preference changes
    (0, react_1.useEffect)(function () {
        var newResolvedTheme = resolveTheme(preference);
        setResolvedTheme(newResolvedTheme);
        document.documentElement.setAttribute('data-theme', newResolvedTheme);
    }, [preference]);
    // Listen for system theme changes when preference is 'system'
    (0, react_1.useEffect)(function () {
        if (preference !== 'system')
            return;
        var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        var handleChange = function (e) {
            var newTheme = e.matches ? 'dark' : 'light';
            setResolvedTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
        };
        mediaQuery.addEventListener('change', handleChange);
        return function () { return mediaQuery.removeEventListener('change', handleChange); };
    }, [preference]);
    var setThemePreference = function (newPreference) {
        try {
            localStorage.setItem(STORAGE_KEY, newPreference);
            setPreference(newPreference);
        }
        catch (e) {
            console.warn('Failed to save theme preference to localStorage:', e);
            // Still update the theme even if localStorage fails
            setPreference(newPreference);
        }
    };
    return {
        preference: preference,
        resolvedTheme: resolvedTheme,
        setThemePreference: setThemePreference
    };
}
