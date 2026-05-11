"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePluginArgs = parsePluginArgs;
function parsePluginArgs(args) {
    var _a, _b;
    if (!args) {
        return { type: 'menu' };
    }
    var parts = args.trim().split(/\s+/);
    var command = (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    switch (command) {
        case 'help':
        case '--help':
        case '-h':
            return { type: 'help' };
        case 'install':
        case 'i': {
            var target = parts[1];
            if (!target) {
                return { type: 'install' };
            }
            // Check if it's in format plugin@marketplace
            if (target.includes('@')) {
                var _c = target.split('@'), plugin = _c[0], marketplace = _c[1];
                return { type: 'install', plugin: plugin, marketplace: marketplace };
            }
            // Check if the target looks like a marketplace (URL or path)
            var isMarketplace = target.startsWith('http://') ||
                target.startsWith('https://') ||
                target.startsWith('file://') ||
                target.includes('/') ||
                target.includes('\\');
            if (isMarketplace) {
                // This is a marketplace URL/path, no plugin specified
                return { type: 'install', marketplace: target };
            }
            // Otherwise treat it as a plugin name
            return { type: 'install', plugin: target };
        }
        case 'manage':
            return { type: 'manage' };
        case 'uninstall':
            return { type: 'uninstall', plugin: parts[1] };
        case 'enable':
            return { type: 'enable', plugin: parts[1] };
        case 'disable':
            return { type: 'disable', plugin: parts[1] };
        case 'validate': {
            var target = parts.slice(1).join(' ').trim();
            return { type: 'validate', path: target || undefined };
        }
        case 'marketplace':
        case 'market': {
            var action = (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            var target = parts.slice(2).join(' ');
            switch (action) {
                case 'add':
                    return { type: 'marketplace', action: 'add', target: target };
                case 'remove':
                case 'rm':
                    return { type: 'marketplace', action: 'remove', target: target };
                case 'update':
                    return { type: 'marketplace', action: 'update', target: target };
                case 'list':
                    return { type: 'marketplace', action: 'list' };
                default:
                    // No action specified, show marketplace menu
                    return { type: 'marketplace' };
            }
        }
        default:
            // Unknown command, show menu
            return { type: 'menu' };
    }
}
