import { marked } from 'marked';
import hljs from 'highlight.js';
import hljsZig from './zig';
import { LineFocusPlugin } from 'highlightjs-focus';
import { SITE_URL } from './consts';
import { mathExtension } from './markdownMath';

// marked and highlight.js keep global state, so they are configured exactly
// once here and every caller goes through this module.

hljs.registerLanguage("zig", hljsZig);

hljs.addPlugin(new LineFocusPlugin({
    unfocusedStyle: {
        opacity: "0.35",
        filter: "grayscale(1)"
    }
}));

marked.setOptions({
    gfm: true,
    breaks: true,
    smartypants: true,
    highlight: function (code, lang) {
        const language = lang || 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

const customRenderer = {
    heading: function (
        text: string,
        level: 1 | 2 | 3 | 4 | 5 | 6,
    ) {
        var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        return '<h' + level + '><a class="font-bold" name="' +
            escapedText +
            '" href="#' +
            escapedText +
            '">' + text + '</a></h' + level + '>';
    },
    link(href: string, title: string, text: string) {
        if (href.startsWith("http") && href.indexOf(SITE_URL) === -1) {
            return `<a class="external-link" href='${href}' target="_blank" rel="noopener">${text}</a><sup class="arrow link">&urtri;</sup>`;
        }
        return false;
    },
    image(href: string, title: string, text: string) {
        // Transform relative _meta paths to use our API endpoint
        if (href.startsWith('_meta/')) {
            const imagePath = href.replace('_meta/', '');
            return `<img src="/api/meta-image/${imagePath}" alt="${text}" title="${title || ''}" />`;
        }
        return false; // Use default rendering for other images
    }
};

marked.use({ renderer: customRenderer });
marked.use(mathExtension);

export const renderMarkdown = (markdown: string): string => marked.parse(markdown);

const decodeEntities = (text: string): string =>
    text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

// Plain-text rendering of inline tokens: keep the visible text of links,
// emphasis, code spans, etc. and drop the Markdown syntax around it.
const inlineToText = (tokens: marked.Token[] = []): string =>
    tokens
        .map((token: any) => {
            switch (token.type) {
                case 'image':
                case 'html':
                    return '';
                case 'br':
                    return ' ';
                case 'inlineMath':
                    return token.text;
                case 'codespan':
                    return decodeEntities(token.text);
                default:
                    return token.tokens ? inlineToText(token.tokens) : decodeEntities(token.text ?? '');
            }
        })
        .join('');

// Collect the prose of a document (paragraphs, list items, quotes), skipping
// code blocks, display math, tables, images and raw HTML.
const blocksToText = (tokens: marked.Token[]): string[] =>
    tokens.flatMap((token: any): string[] => {
        switch (token.type) {
            case 'paragraph':
            case 'text':
                return [token.tokens ? inlineToText(token.tokens) : decodeEntities(token.text)];
            case 'list':
                return token.items.flatMap((item: any) => blocksToText(item.tokens));
            case 'blockquote':
                return blocksToText(token.tokens);
            default:
                return [];
        }
    });

// A short plain-text summary of a Markdown document, for post listings, RSS
// descriptions and meta tags. Cut at a word boundary.
export const markdownToExcerpt = (markdown: string, maxLength = 200): string => {
    const text = blocksToText(marked.lexer(markdown))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (text.length <= maxLength) return text;
    const cut = text.slice(0, maxLength + 1);
    const lastSpace = cut.lastIndexOf(' ');
    const truncated = lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : text.slice(0, maxLength);
    return truncated.replace(/[\s.,;:!?(\[{\-–—]+$/, '') + '…';
};
