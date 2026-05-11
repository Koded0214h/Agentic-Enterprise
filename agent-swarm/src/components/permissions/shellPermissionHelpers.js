"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShellSuggestionsLabel = generateShellSuggestionsLabel;
var path_1 = require("path");
var react_1 = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var ink_js_1 = require("../../ink.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
function commandListDisplay(commands) {
    switch (commands.length) {
        case 0:
            return '';
        case 1:
            return <ink_js_1.Text bold>{commands[0]}</ink_js_1.Text>;
        case 2:
            return <ink_js_1.Text>
          <ink_js_1.Text bold>{commands[0]}</ink_js_1.Text> and <ink_js_1.Text bold>{commands[1]}</ink_js_1.Text>
        </ink_js_1.Text>;
        default:
            return <ink_js_1.Text>
          <ink_js_1.Text bold>{commands.slice(0, -1).join(', ')}</ink_js_1.Text>, and{' '}
          <ink_js_1.Text bold>{commands.slice(-1)[0]}</ink_js_1.Text>
        </ink_js_1.Text>;
    }
}
function commandListDisplayTruncated(commands) {
    // Check if the plain text representation would be too long
    var plainText = commands.join(', ');
    if (plainText.length > 50) {
        return 'similar';
    }
    return commandListDisplay(commands);
}
function formatPathList(paths) {
    if (paths.length === 0)
        return '';
    // Extract directory names from paths
    var names = paths.map(function (p) { return (0, path_1.basename)(p) || p; });
    if (names.length === 1) {
        return <ink_js_1.Text>
        <ink_js_1.Text bold>{names[0]}</ink_js_1.Text>
        {path_1.sep}
      </ink_js_1.Text>;
    }
    if (names.length === 2) {
        return <ink_js_1.Text>
        <ink_js_1.Text bold>{names[0]}</ink_js_1.Text>
        {path_1.sep} and <ink_js_1.Text bold>{names[1]}</ink_js_1.Text>
        {path_1.sep}
      </ink_js_1.Text>;
    }
    // For 3+, show first two with "and N more"
    return <ink_js_1.Text>
      <ink_js_1.Text bold>{names[0]}</ink_js_1.Text>
      {path_1.sep}, <ink_js_1.Text bold>{names[1]}</ink_js_1.Text>
      {path_1.sep} and {paths.length - 2} more
    </ink_js_1.Text>;
}
/**
 * Generate the label for the "Yes, and apply suggestions" option in shell
 * permission dialogs (Bash, PowerShell). Parametrized by the shell tool name
 * and an optional command transform (e.g., Bash strips output redirections so
 * filenames don't show as commands).
 */
function generateShellSuggestionsLabel(suggestions, shellToolName, commandTransform) {
    // Collect all rules for display
    var allRules = suggestions.filter(function (s) { return s.type === 'addRules'; }).flatMap(function (s) { return s.rules || []; });
    // Separate Read rules from shell rules
    var readRules = allRules.filter(function (r) { return r.toolName === 'Read'; });
    var shellRules = allRules.filter(function (r) { return r.toolName === shellToolName; });
    // Get directory info
    var directories = suggestions.filter(function (s) { return s.type === 'addDirectories'; }).flatMap(function (s) { return s.directories || []; });
    // Extract paths from Read rules (keep separate from directories)
    var readPaths = readRules.map(function (r) { var _a; return ((_a = r.ruleContent) === null || _a === void 0 ? void 0 : _a.replace('/**', '')) || ''; }).filter(function (p) { return p; });
    // Extract shell command prefixes, optionally transforming for display
    var shellCommands = __spreadArray([], new Set(shellRules.flatMap(function (rule) {
        var _a;
        if (!rule.ruleContent)
            return [];
        var command = (_a = (0, shellRuleMatching_js_1.permissionRuleExtractPrefix)(rule.ruleContent)) !== null && _a !== void 0 ? _a : rule.ruleContent;
        return commandTransform ? commandTransform(command) : command;
    })), true);
    // Check what we have
    var hasDirectories = directories.length > 0;
    var hasReadPaths = readPaths.length > 0;
    var hasCommands = shellCommands.length > 0;
    // Handle single type cases
    if (hasReadPaths && !hasDirectories && !hasCommands) {
        // Only Read rules - use "reading from" language
        if (readPaths.length === 1) {
            var firstPath = readPaths[0];
            var dirName = (0, path_1.basename)(firstPath) || firstPath;
            return <ink_js_1.Text>
          Yes, allow reading from <ink_js_1.Text bold>{dirName}</ink_js_1.Text>
          {path_1.sep} from this project
        </ink_js_1.Text>;
        }
        // Multiple read paths
        return <ink_js_1.Text>
        Yes, allow reading from {formatPathList(readPaths)} from this project
      </ink_js_1.Text>;
    }
    if (hasDirectories && !hasReadPaths && !hasCommands) {
        // Only directory permissions - use "access to" language
        if (directories.length === 1) {
            var firstDir = directories[0];
            var dirName = (0, path_1.basename)(firstDir) || firstDir;
            return <ink_js_1.Text>
          Yes, and always allow access to <ink_js_1.Text bold>{dirName}</ink_js_1.Text>
          {path_1.sep} from this project
        </ink_js_1.Text>;
        }
        // Multiple directories
        return <ink_js_1.Text>
        Yes, and always allow access to {formatPathList(directories)} from this
        project
      </ink_js_1.Text>;
    }
    if (hasCommands && !hasDirectories && !hasReadPaths) {
        // Only shell command permissions
        return <ink_js_1.Text>
        {"Yes, and don't ask again for "}
        {commandListDisplayTruncated(shellCommands)} commands in{' '}
        <ink_js_1.Text bold>{(0, state_js_1.getOriginalCwd)()}</ink_js_1.Text>
      </ink_js_1.Text>;
    }
    // Handle mixed cases
    if ((hasDirectories || hasReadPaths) && !hasCommands) {
        // Combine directories and read paths since they're both path access
        var allPaths = __spreadArray(__spreadArray([], directories, true), readPaths, true);
        if (hasDirectories && hasReadPaths) {
            // Mixed - use generic "access to"
            return <ink_js_1.Text>
          Yes, and always allow access to {formatPathList(allPaths)} from this
          project
        </ink_js_1.Text>;
        }
    }
    if ((hasDirectories || hasReadPaths) && hasCommands) {
        // Build descriptive message for both types
        var allPaths = __spreadArray(__spreadArray([], directories, true), readPaths, true);
        // Keep it concise but informative
        if (allPaths.length === 1 && shellCommands.length === 1) {
            return <ink_js_1.Text>
          Yes, and allow access to {formatPathList(allPaths)} and{' '}
          {commandListDisplayTruncated(shellCommands)} commands
        </ink_js_1.Text>;
        }
        return <ink_js_1.Text>
        Yes, and allow {formatPathList(allPaths)} access and{' '}
        {commandListDisplayTruncated(shellCommands)} commands
      </ink_js_1.Text>;
    }
    return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJiYXNlbmFtZSIsInNlcCIsIlJlYWN0IiwiUmVhY3ROb2RlIiwiZ2V0T3JpZ2luYWxDd2QiLCJUZXh0IiwiUGVybWlzc2lvblVwZGF0ZSIsInBlcm1pc3Npb25SdWxlRXh0cmFjdFByZWZpeCIsImNvbW1hbmRMaXN0RGlzcGxheSIsImNvbW1hbmRzIiwibGVuZ3RoIiwic2xpY2UiLCJqb2luIiwiY29tbWFuZExpc3REaXNwbGF5VHJ1bmNhdGVkIiwicGxhaW5UZXh0IiwiZm9ybWF0UGF0aExpc3QiLCJwYXRocyIsIm5hbWVzIiwibWFwIiwicCIsImdlbmVyYXRlU2hlbGxTdWdnZXN0aW9uc0xhYmVsIiwic3VnZ2VzdGlvbnMiLCJzaGVsbFRvb2xOYW1lIiwiY29tbWFuZFRyYW5zZm9ybSIsImNvbW1hbmQiLCJhbGxSdWxlcyIsImZpbHRlciIsInMiLCJ0eXBlIiwiZmxhdE1hcCIsInJ1bGVzIiwicmVhZFJ1bGVzIiwiciIsInRvb2xOYW1lIiwic2hlbGxSdWxlcyIsImRpcmVjdG9yaWVzIiwicmVhZFBhdGhzIiwicnVsZUNvbnRlbnQiLCJyZXBsYWNlIiwic2hlbGxDb21tYW5kcyIsIlNldCIsInJ1bGUiLCJoYXNEaXJlY3RvcmllcyIsImhhc1JlYWRQYXRocyIsImhhc0NvbW1hbmRzIiwiZmlyc3RQYXRoIiwiZGlyTmFtZSIsImZpcnN0RGlyIiwiYWxsUGF0aHMiXSwic291cmNlcyI6WyJzaGVsbFBlcm1pc3Npb25IZWxwZXJzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYXNlbmFtZSwgc2VwIH0gZnJvbSAncGF0aCdcbmltcG9ydCBSZWFjdCwgeyB0eXBlIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgZ2V0T3JpZ2luYWxDd2QgfSBmcm9tICcuLi8uLi9ib290c3RyYXAvc3RhdGUuanMnXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vaW5rLmpzJ1xuaW1wb3J0IHR5cGUgeyBQZXJtaXNzaW9uVXBkYXRlIH0gZnJvbSAnLi4vLi4vdXRpbHMvcGVybWlzc2lvbnMvUGVybWlzc2lvblVwZGF0ZVNjaGVtYS5qcydcbmltcG9ydCB7IHBlcm1pc3Npb25SdWxlRXh0cmFjdFByZWZpeCB9IGZyb20gJy4uLy4uL3V0aWxzL3Blcm1pc3Npb25zL3NoZWxsUnVsZU1hdGNoaW5nLmpzJ1xuXG5mdW5jdGlvbiBjb21tYW5kTGlzdERpc3BsYXkoY29tbWFuZHM6IHN0cmluZ1tdKTogUmVhY3ROb2RlIHtcbiAgc3dpdGNoIChjb21tYW5kcy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gJydcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gPFRleHQgYm9sZD57Y29tbWFuZHNbMF19PC9UZXh0PlxuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUZXh0PlxuICAgICAgICAgIDxUZXh0IGJvbGQ+e2NvbW1hbmRzWzBdfTwvVGV4dD4gYW5kIDxUZXh0IGJvbGQ+e2NvbW1hbmRzWzFdfTwvVGV4dD5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgKVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8VGV4dD5cbiAgICAgICAgICA8VGV4dCBib2xkPntjb21tYW5kcy5zbGljZSgwLCAtMSkuam9pbignLCAnKX08L1RleHQ+LCBhbmR7JyAnfVxuICAgICAgICAgIDxUZXh0IGJvbGQ+e2NvbW1hbmRzLnNsaWNlKC0xKVswXX08L1RleHQ+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIClcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21tYW5kTGlzdERpc3BsYXlUcnVuY2F0ZWQoY29tbWFuZHM6IHN0cmluZ1tdKTogUmVhY3ROb2RlIHtcbiAgLy8gQ2hlY2sgaWYgdGhlIHBsYWluIHRleHQgcmVwcmVzZW50YXRpb24gd291bGQgYmUgdG9vIGxvbmdcbiAgY29uc3QgcGxhaW5UZXh0ID0gY29tbWFuZHMuam9pbignLCAnKVxuICBpZiAocGxhaW5UZXh0Lmxlbmd0aCA+IDUwKSB7XG4gICAgcmV0dXJuICdzaW1pbGFyJ1xuICB9XG4gIHJldHVybiBjb21tYW5kTGlzdERpc3BsYXkoY29tbWFuZHMpXG59XG5cbmZ1bmN0aW9uIGZvcm1hdFBhdGhMaXN0KHBhdGhzOiBzdHJpbmdbXSk6IFJlYWN0Tm9kZSB7XG4gIGlmIChwYXRocy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuXG4gIC8vIEV4dHJhY3QgZGlyZWN0b3J5IG5hbWVzIGZyb20gcGF0aHNcbiAgY29uc3QgbmFtZXMgPSBwYXRocy5tYXAocCA9PiBiYXNlbmFtZShwKSB8fCBwKVxuXG4gIGlmIChuYW1lcy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFRleHQ+XG4gICAgICAgIDxUZXh0IGJvbGQ+e25hbWVzWzBdfTwvVGV4dD5cbiAgICAgICAge3NlcH1cbiAgICAgIDwvVGV4dD5cbiAgICApXG4gIH1cbiAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiAoXG4gICAgICA8VGV4dD5cbiAgICAgICAgPFRleHQgYm9sZD57bmFtZXNbMF19PC9UZXh0PlxuICAgICAgICB7c2VwfSBhbmQgPFRleHQgYm9sZD57bmFtZXNbMV19PC9UZXh0PlxuICAgICAgICB7c2VwfVxuICAgICAgPC9UZXh0PlxuICAgIClcbiAgfVxuXG4gIC8vIEZvciAzKywgc2hvdyBmaXJzdCB0d28gd2l0aCBcImFuZCBOIG1vcmVcIlxuICByZXR1cm4gKFxuICAgIDxUZXh0PlxuICAgICAgPFRleHQgYm9sZD57bmFtZXNbMF19PC9UZXh0PlxuICAgICAge3NlcH0sIDxUZXh0IGJvbGQ+e25hbWVzWzFdfTwvVGV4dD5cbiAgICAgIHtzZXB9IGFuZCB7cGF0aHMubGVuZ3RoIC0gMn0gbW9yZVxuICAgIDwvVGV4dD5cbiAgKVxufVxuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBsYWJlbCBmb3IgdGhlIFwiWWVzLCBhbmQgYXBwbHkgc3VnZ2VzdGlvbnNcIiBvcHRpb24gaW4gc2hlbGxcbiAqIHBlcm1pc3Npb24gZGlhbG9ncyAoQmFzaCwgUG93ZXJTaGVsbCkuIFBhcmFtZXRyaXplZCBieSB0aGUgc2hlbGwgdG9vbCBuYW1lXG4gKiBhbmQgYW4gb3B0aW9uYWwgY29tbWFuZCB0cmFuc2Zvcm0gKGUuZy4sIEJhc2ggc3RyaXBzIG91dHB1dCByZWRpcmVjdGlvbnMgc29cbiAqIGZpbGVuYW1lcyBkb24ndCBzaG93IGFzIGNvbW1hbmRzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2hlbGxTdWdnZXN0aW9uc0xhYmVsKFxuICBzdWdnZXN0aW9uczogUGVybWlzc2lvblVwZGF0ZVtdLFxuICBzaGVsbFRvb2xOYW1lOiBzdHJpbmcsXG4gIGNvbW1hbmRUcmFuc2Zvcm0/OiAoY29tbWFuZDogc3RyaW5nKSA9PiBzdHJpbmcsXG4pOiBSZWFjdE5vZGUgfCBudWxsIHtcbiAgLy8gQ29sbGVjdCBhbGwgcnVsZXMgZm9yIGRpc3BsYXlcbiAgY29uc3QgYWxsUnVsZXMgPSBzdWdnZXN0aW9uc1xuICAgIC5maWx0ZXIocyA9PiBzLnR5cGUgPT09ICdhZGRSdWxlcycpXG4gICAgLmZsYXRNYXAocyA9PiBzLnJ1bGVzIHx8IFtdKVxuXG4gIC8vIFNlcGFyYXRlIFJlYWQgcnVsZXMgZnJvbSBzaGVsbCBydWxlc1xuICBjb25zdCByZWFkUnVsZXMgPSBhbGxSdWxlcy5maWx0ZXIociA9PiByLnRvb2xOYW1lID09PSAnUmVhZCcpXG4gIGNvbnN0IHNoZWxsUnVsZXMgPSBhbGxSdWxlcy5maWx0ZXIociA9PiByLnRvb2xOYW1lID09PSBzaGVsbFRvb2xOYW1lKVxuXG4gIC8vIEdldCBkaXJlY3RvcnkgaW5mb1xuICBjb25zdCBkaXJlY3RvcmllcyA9IHN1Z2dlc3Rpb25zXG4gICAgLmZpbHRlcihzID0+IHMudHlwZSA9PT0gJ2FkZERpcmVjdG9yaWVzJylcbiAgICAuZmxhdE1hcChzID0+IHMuZGlyZWN0b3JpZXMgfHwgW10pXG5cbiAgLy8gRXh0cmFjdCBwYXRocyBmcm9tIFJlYWQgcnVsZXMgKGtlZXAgc2VwYXJhdGUgZnJvbSBkaXJlY3RvcmllcylcbiAgY29uc3QgcmVhZFBhdGhzID0gcmVhZFJ1bGVzXG4gICAgLm1hcChyID0+IHIucnVsZUNvbnRlbnQ/LnJlcGxhY2UoJy8qKicsICcnKSB8fCAnJylcbiAgICAuZmlsdGVyKHAgPT4gcClcblxuICAvLyBFeHRyYWN0IHNoZWxsIGNvbW1hbmQgcHJlZml4ZXMsIG9wdGlvbmFsbHkgdHJhbnNmb3JtaW5nIGZvciBkaXNwbGF5XG4gIGNvbnN0IHNoZWxsQ29tbWFuZHMgPSBbXG4gICAgLi4ubmV3IFNldChcbiAgICAgIHNoZWxsUnVsZXMuZmxhdE1hcChydWxlID0+IHtcbiAgICAgICAgaWYgKCFydWxlLnJ1bGVDb250ZW50KSByZXR1cm4gW11cbiAgICAgICAgY29uc3QgY29tbWFuZCA9XG4gICAgICAgICAgcGVybWlzc2lvblJ1bGVFeHRyYWN0UHJlZml4KHJ1bGUucnVsZUNvbnRlbnQpID8/IHJ1bGUucnVsZUNvbnRlbnRcbiAgICAgICAgcmV0dXJuIGNvbW1hbmRUcmFuc2Zvcm0gPyBjb21tYW5kVHJhbnNmb3JtKGNvbW1hbmQpIDogY29tbWFuZFxuICAgICAgfSksXG4gICAgKSxcbiAgXVxuXG4gIC8vIENoZWNrIHdoYXQgd2UgaGF2ZVxuICBjb25zdCBoYXNEaXJlY3RvcmllcyA9IGRpcmVjdG9yaWVzLmxlbmd0aCA+IDBcbiAgY29uc3QgaGFzUmVhZFBhdGhzID0gcmVhZFBhdGhzLmxlbmd0aCA+IDBcbiAgY29uc3QgaGFzQ29tbWFuZHMgPSBzaGVsbENvbW1hbmRzLmxlbmd0aCA+IDBcblxuICAvLyBIYW5kbGUgc2luZ2xlIHR5cGUgY2FzZXNcbiAgaWYgKGhhc1JlYWRQYXRocyAmJiAhaGFzRGlyZWN0b3JpZXMgJiYgIWhhc0NvbW1hbmRzKSB7XG4gICAgLy8gT25seSBSZWFkIHJ1bGVzIC0gdXNlIFwicmVhZGluZyBmcm9tXCIgbGFuZ3VhZ2VcbiAgICBpZiAocmVhZFBhdGhzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgZmlyc3RQYXRoID0gcmVhZFBhdGhzWzBdIVxuICAgICAgY29uc3QgZGlyTmFtZSA9IGJhc2VuYW1lKGZpcnN0UGF0aCkgfHwgZmlyc3RQYXRoXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8VGV4dD5cbiAgICAgICAgICBZZXMsIGFsbG93IHJlYWRpbmcgZnJvbSA8VGV4dCBib2xkPntkaXJOYW1lfTwvVGV4dD5cbiAgICAgICAgICB7c2VwfSBmcm9tIHRoaXMgcHJvamVjdFxuICAgICAgICA8L1RleHQ+XG4gICAgICApXG4gICAgfVxuXG4gICAgLy8gTXVsdGlwbGUgcmVhZCBwYXRoc1xuICAgIHJldHVybiAoXG4gICAgICA8VGV4dD5cbiAgICAgICAgWWVzLCBhbGxvdyByZWFkaW5nIGZyb20ge2Zvcm1hdFBhdGhMaXN0KHJlYWRQYXRocyl9IGZyb20gdGhpcyBwcm9qZWN0XG4gICAgICA8L1RleHQ+XG4gICAgKVxuICB9XG5cbiAgaWYgKGhhc0RpcmVjdG9yaWVzICYmICFoYXNSZWFkUGF0aHMgJiYgIWhhc0NvbW1hbmRzKSB7XG4gICAgLy8gT25seSBkaXJlY3RvcnkgcGVybWlzc2lvbnMgLSB1c2UgXCJhY2Nlc3MgdG9cIiBsYW5ndWFnZVxuICAgIGlmIChkaXJlY3Rvcmllcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGZpcnN0RGlyID0gZGlyZWN0b3JpZXNbMF0hXG4gICAgICBjb25zdCBkaXJOYW1lID0gYmFzZW5hbWUoZmlyc3REaXIpIHx8IGZpcnN0RGlyXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8VGV4dD5cbiAgICAgICAgICBZZXMsIGFuZCBhbHdheXMgYWxsb3cgYWNjZXNzIHRvIDxUZXh0IGJvbGQ+e2Rpck5hbWV9PC9UZXh0PlxuICAgICAgICAgIHtzZXB9IGZyb20gdGhpcyBwcm9qZWN0XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBNdWx0aXBsZSBkaXJlY3Rvcmllc1xuICAgIHJldHVybiAoXG4gICAgICA8VGV4dD5cbiAgICAgICAgWWVzLCBhbmQgYWx3YXlzIGFsbG93IGFjY2VzcyB0byB7Zm9ybWF0UGF0aExpc3QoZGlyZWN0b3JpZXMpfSBmcm9tIHRoaXNcbiAgICAgICAgcHJvamVjdFxuICAgICAgPC9UZXh0PlxuICAgIClcbiAgfVxuXG4gIGlmIChoYXNDb21tYW5kcyAmJiAhaGFzRGlyZWN0b3JpZXMgJiYgIWhhc1JlYWRQYXRocykge1xuICAgIC8vIE9ubHkgc2hlbGwgY29tbWFuZCBwZXJtaXNzaW9uc1xuICAgIHJldHVybiAoXG4gICAgICA8VGV4dD5cbiAgICAgICAge1wiWWVzLCBhbmQgZG9uJ3QgYXNrIGFnYWluIGZvciBcIn1cbiAgICAgICAge2NvbW1hbmRMaXN0RGlzcGxheVRydW5jYXRlZChzaGVsbENvbW1hbmRzKX0gY29tbWFuZHMgaW57JyAnfVxuICAgICAgICA8VGV4dCBib2xkPntnZXRPcmlnaW5hbEN3ZCgpfTwvVGV4dD5cbiAgICAgIDwvVGV4dD5cbiAgICApXG4gIH1cblxuICAvLyBIYW5kbGUgbWl4ZWQgY2FzZXNcbiAgaWYgKChoYXNEaXJlY3RvcmllcyB8fCBoYXNSZWFkUGF0aHMpICYmICFoYXNDb21tYW5kcykge1xuICAgIC8vIENvbWJpbmUgZGlyZWN0b3JpZXMgYW5kIHJlYWQgcGF0aHMgc2luY2UgdGhleSdyZSBib3RoIHBhdGggYWNjZXNzXG4gICAgY29uc3QgYWxsUGF0aHMgPSBbLi4uZGlyZWN0b3JpZXMsIC4uLnJlYWRQYXRoc11cbiAgICBpZiAoaGFzRGlyZWN0b3JpZXMgJiYgaGFzUmVhZFBhdGhzKSB7XG4gICAgICAvLyBNaXhlZCAtIHVzZSBnZW5lcmljIFwiYWNjZXNzIHRvXCJcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUZXh0PlxuICAgICAgICAgIFllcywgYW5kIGFsd2F5cyBhbGxvdyBhY2Nlc3MgdG8ge2Zvcm1hdFBhdGhMaXN0KGFsbFBhdGhzKX0gZnJvbSB0aGlzXG4gICAgICAgICAgcHJvamVjdFxuICAgICAgICA8L1RleHQ+XG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgaWYgKChoYXNEaXJlY3RvcmllcyB8fCBoYXNSZWFkUGF0aHMpICYmIGhhc0NvbW1hbmRzKSB7XG4gICAgLy8gQnVpbGQgZGVzY3JpcHRpdmUgbWVzc2FnZSBmb3IgYm90aCB0eXBlc1xuICAgIGNvbnN0IGFsbFBhdGhzID0gWy4uLmRpcmVjdG9yaWVzLCAuLi5yZWFkUGF0aHNdXG5cbiAgICAvLyBLZWVwIGl0IGNvbmNpc2UgYnV0IGluZm9ybWF0aXZlXG4gICAgaWYgKGFsbFBhdGhzLmxlbmd0aCA9PT0gMSAmJiBzaGVsbENvbW1hbmRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRleHQ+XG4gICAgICAgICAgWWVzLCBhbmQgYWxsb3cgYWNjZXNzIHRvIHtmb3JtYXRQYXRoTGlzdChhbGxQYXRocyl9IGFuZHsnICd9XG4gICAgICAgICAge2NvbW1hbmRMaXN0RGlzcGxheVRydW5jYXRlZChzaGVsbENvbW1hbmRzKX0gY29tbWFuZHNcbiAgICAgICAgPC9UZXh0PlxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8VGV4dD5cbiAgICAgICAgWWVzLCBhbmQgYWxsb3cge2Zvcm1hdFBhdGhMaXN0KGFsbFBhdGhzKX0gYWNjZXNzIGFuZHsnICd9XG4gICAgICAgIHtjb21tYW5kTGlzdERpc3BsYXlUcnVuY2F0ZWQoc2hlbGxDb21tYW5kcyl9IGNvbW1hbmRzXG4gICAgICA8L1RleHQ+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxFQUFFQyxHQUFHLFFBQVEsTUFBTTtBQUNwQyxPQUFPQyxLQUFLLElBQUksS0FBS0MsU0FBUyxRQUFRLE9BQU87QUFDN0MsU0FBU0MsY0FBYyxRQUFRLDBCQUEwQjtBQUN6RCxTQUFTQyxJQUFJLFFBQVEsY0FBYztBQUNuQyxjQUFjQyxnQkFBZ0IsUUFBUSxtREFBbUQ7QUFDekYsU0FBU0MsMkJBQTJCLFFBQVEsOENBQThDO0FBRTFGLFNBQVNDLGtCQUFrQkEsQ0FBQ0MsUUFB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
