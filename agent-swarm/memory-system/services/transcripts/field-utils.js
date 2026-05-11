"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueByPath = getValueByPath;
exports.resolveFieldSpec = resolveFieldSpec;
exports.resolveFields = resolveFields;
exports.matchesRule = matchesRule;
function parsePath(path) {
    var cleaned = path.trim().replace(/^\$\.?/, '');
    if (!cleaned)
        return [];
    var tokens = [];
    var parts = cleaned.split('.');
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var regex = /([^[\]]+)|\[(\d+)\]/g;
        var match = void 0;
        while ((match = regex.exec(part)) !== null) {
            if (match[1]) {
                tokens.push(match[1]);
            }
            else if (match[2]) {
                tokens.push(parseInt(match[2], 10));
            }
        }
    }
    return tokens;
}
function getValueByPath(input, path) {
    if (!path)
        return undefined;
    var tokens = parsePath(path);
    var current = input;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (current === null || current === undefined)
            return undefined;
        current = current[token];
    }
    return current;
}
function isEmptyValue(value) {
    return value === undefined || value === null || value === '';
}
function resolveFromContext(path, ctx) {
    if (path.startsWith('$watch.')) {
        var key = path.slice('$watch.'.length);
        return ctx.watch[key];
    }
    if (path.startsWith('$schema.')) {
        var key = path.slice('$schema.'.length);
        return ctx.schema[key];
    }
    if (path.startsWith('$session.')) {
        var key = path.slice('$session.'.length);
        return ctx.session ? ctx.session[key] : undefined;
    }
    if (path === '$cwd')
        return ctx.watch.workspace;
    if (path === '$project')
        return ctx.watch.project;
    return undefined;
}
function resolveFieldSpec(spec, entry, ctx) {
    if (spec === undefined)
        return undefined;
    if (typeof spec === 'string') {
        var fromContext = resolveFromContext(spec, ctx);
        if (fromContext !== undefined)
            return fromContext;
        return getValueByPath(entry, spec);
    }
    if (spec.coalesce && Array.isArray(spec.coalesce)) {
        for (var _i = 0, _a = spec.coalesce; _i < _a.length; _i++) {
            var candidate = _a[_i];
            var value = resolveFieldSpec(candidate, entry, ctx);
            if (!isEmptyValue(value))
                return value;
        }
    }
    if (spec.path) {
        var fromContext = resolveFromContext(spec.path, ctx);
        if (fromContext !== undefined)
            return fromContext;
        var value = getValueByPath(entry, spec.path);
        if (!isEmptyValue(value))
            return value;
    }
    if (spec.value !== undefined)
        return spec.value;
    if (spec.default !== undefined)
        return spec.default;
    return undefined;
}
function resolveFields(fields, entry, ctx) {
    var resolved = {};
    if (!fields)
        return resolved;
    for (var _i = 0, _a = Object.entries(fields); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], spec = _b[1];
        resolved[key] = resolveFieldSpec(spec, entry, ctx);
    }
    return resolved;
}
function matchesRule(entry, rule, schema) {
    if (!rule)
        return true;
    var path = rule.path || schema.eventTypePath || 'type';
    var value = path ? getValueByPath(entry, path) : undefined;
    if (rule.exists) {
        if (value === undefined || value === null || value === '')
            return false;
    }
    if (rule.equals !== undefined) {
        return value === rule.equals;
    }
    if (rule.in && Array.isArray(rule.in)) {
        return rule.in.includes(value);
    }
    if (rule.contains !== undefined) {
        return typeof value === 'string' && value.includes(rule.contains);
    }
    if (rule.regex) {
        try {
            var regex = new RegExp(rule.regex);
            return regex.test(String(value !== null && value !== void 0 ? value : ''));
        }
        catch (_a) {
            return false;
        }
    }
    return true;
}
