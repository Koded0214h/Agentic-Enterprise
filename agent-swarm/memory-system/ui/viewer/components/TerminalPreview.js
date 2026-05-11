"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalPreview = TerminalPreview;
var react_1 = require("react");
var ansi_to_html_1 = require("ansi-to-html");
var dompurify_1 = require("dompurify");
var ansiConverter = new ansi_to_html_1.default({
    fg: '#dcd6cc',
    bg: '#252320',
    newline: false,
    escapeXML: true,
    stream: false
});
function TerminalPreview(_a) {
    var content = _a.content, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    var preRef = (0, react_1.useRef)(null);
    var scrollTopRef = (0, react_1.useRef)(0);
    var _d = (0, react_1.useState)(true), wordWrap = _d[0], setWordWrap = _d[1];
    var html = (0, react_1.useMemo)(function () {
        // Save scroll position before content changes
        if (preRef.current) {
            scrollTopRef.current = preRef.current.scrollTop;
        }
        if (!content)
            return '';
        var convertedHtml = ansiConverter.toHtml(content);
        return dompurify_1.default.sanitize(convertedHtml, {
            ALLOWED_TAGS: ['span', 'div', 'br'],
            ALLOWED_ATTR: ['style', 'class'],
            ALLOW_DATA_ATTR: false
        });
    }, [content]);
    // Restore scroll position after render
    (0, react_1.useLayoutEffect)(function () {
        if (preRef.current && scrollTopRef.current > 0) {
            preRef.current.scrollTop = scrollTopRef.current;
        }
    }, [html]);
    var preStyle = {
        padding: '16px',
        margin: 0,
        fontFamily: 'var(--font-terminal)',
        fontSize: '12px',
        lineHeight: '1.6',
        overflow: 'auto',
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-bg-card)',
        whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
        wordBreak: wordWrap ? 'break-word' : 'normal',
        position: 'absolute',
        inset: 0,
    };
    return (<div className={className} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
      {/* Window chrome */}
      <div style={{
            padding: '12px',
            borderBottom: '1px solid var(--color-border-primary)',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            backgroundColor: 'var(--color-bg-header)'
        }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }}/>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}/>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28c840' }}/>

        <button onClick={function () { return setWordWrap(!wordWrap); }} style={{
            marginLeft: 'auto',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 500,
            color: wordWrap ? 'var(--color-text-secondary)' : 'var(--color-accent-primary)',
            backgroundColor: 'transparent',
            border: '1px solid',
            borderColor: wordWrap ? 'var(--color-border-primary)' : 'var(--color-accent-primary)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        }} onMouseEnter={function (e) {
            e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
            e.currentTarget.style.color = 'var(--color-accent-primary)';
        }} onMouseLeave={function (e) {
            e.currentTarget.style.borderColor = wordWrap ? 'var(--color-border-primary)' : 'var(--color-accent-primary)';
            e.currentTarget.style.color = wordWrap ? 'var(--color-text-secondary)' : 'var(--color-accent-primary)';
        }} title={wordWrap ? 'Disable word wrap (scroll horizontally)' : 'Enable word wrap'}>
          {wordWrap ? '⤢ Wrap' : '⇄ Scroll'}
        </button>
      </div>

      {/* Content area */}
      {isLoading ? (<div style={{
                padding: '16px',
                fontFamily: 'var(--font-terminal)',
                fontSize: '12px',
                color: 'var(--color-text-secondary)'
            }}>
          Loading preview...
        </div>) : (<div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <pre ref={preRef} style={preStyle} dangerouslySetInnerHTML={{ __html: html }}/>
        </div>)}
    </div>);
}
