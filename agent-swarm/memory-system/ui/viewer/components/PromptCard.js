"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptCard = PromptCard;
var react_1 = require("react");
var formatters_1 = require("../utils/formatters");
function PromptCard(_a) {
    var prompt = _a.prompt;
    var date = (0, formatters_1.formatDate)(prompt.created_at_epoch);
    return (<div className="card prompt-card">
      <div className="card-header">
        <div className="card-header-left">
          <span className="card-type">Prompt</span>
          <span className="card-project">{prompt.project}</span>
        </div>
      </div>
      <div className="card-content">
        {prompt.prompt_text}
      </div>
      <div className="card-meta">
        <span className="meta-date">#{prompt.id} • {date}</span>
      </div>
    </div>);
}
