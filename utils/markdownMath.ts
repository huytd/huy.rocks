import type { marked } from 'marked';

// Marked extension that keeps LaTeX math away from the Markdown parser.
//
// Without it, marked treats the inside of `$...$` / `$$...$$` as Markdown:
// `\|` and `\\` lose their backslash (escape rules), `_a_` becomes <em>,
// smartypants rewrites quotes, etc. By the time MathJax sees the page the TeX
// is already corrupted.
//
// The math tokens are emitted verbatim (only HTML-escaped) wrapped in
// `\( ... \)` for inline math and `\[ ... \]` for display math, which are the
// delimiters MathJax is configured to look for.

const escapeHtml = (text: string): string =>
    text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const renderInline = (tex: string) => `\\(${escapeHtml(tex)}\\)`;
const renderDisplay = (tex: string) => `\\[${escapeHtml(tex)}\\]`;

// `$$ ... $$` starting a block (may span several lines).
const blockMathRule = /^ {0,3}\$\$([\s\S]+?)\$\$[ \t]*(?:\n+|$)/;
// `$$ ... $$` inside a paragraph.
const inlineDisplayRule = /^\$\$([\s\S]+?)\$\$/;
// `$ ... $` with backslash escapes allowed inside (e.g. `\$`). Backticks are
// excluded so an inline math span never swallows a code span.
const inlineMathRule = /^\$((?:\\[\s\S]|[^\\$`])+?)\$/;

const blockMath: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'blockMath',
    level: 'block',
    // `start` returns -1 when there is nothing to find; marked ignores it.
    start(src: string) {
        // Only a `$$` at the beginning of a line can open a block; marked
        // calls this with the source minus its first character.
        const match = src.match(/\n {0,3}\$\$/);
        return match && match.index !== undefined ? match.index + 1 : -1;
    },
    tokenizer(src: string) {
        const match = blockMathRule.exec(src);
        if (!match) return undefined;
        return { type: 'blockMath', raw: match[0], text: match[1].trim() };
    },
    renderer(token) {
        return `<div class="math-display">${renderDisplay(token.text)}</div>\n`;
    },
};

const inlineMath: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'inlineMath',
    level: 'inline',
    start(src: string) {
        return src.indexOf('$');
    },
    tokenizer(src: string) {
        const display = inlineDisplayRule.exec(src);
        if (display) {
            return { type: 'inlineMath', raw: display[0], text: display[1].trim(), display: true };
        }

        const match = inlineMathRule.exec(src);
        if (!match) return undefined;

        // Same heuristics as Pandoc's tex_math_dollars so that plain-text
        // dollar amounts ("costs $5 and $10") are left alone: the opening `$`
        // must not be followed by whitespace, the closing `$` must not be
        // preceded by whitespace nor followed by a digit.
        const tex = match[1];
        const next = src.charAt(match[0].length);
        if (/^\s/.test(tex) || /\s$/.test(tex) || /\d/.test(next)) return undefined;

        return { type: 'inlineMath', raw: match[0], text: tex, display: false };
    },
    renderer(token) {
        return token.display ? renderDisplay(token.text) : renderInline(token.text);
    },
};

export const mathExtension: marked.MarkedExtension = {
    extensions: [blockMath, inlineMath],
};
