// Post filenames look like "MM.DD.YYYY - <Category> <Title>.md". The category
// is normally the first word; categories made of several words have to be
// listed here so the whole name is treated as the category.
export const MULTI_WORD_CATEGORIES = [
    'Data Structures',
    'Design Patterns',
    'Reading Notes',
];

const DEFAULT_CATEGORY = 'General';

// Split "<Category> <Title>" into its two parts.
export const splitCategoryAndTitle = (fullTitle: string): { category: string; title: string } => {
    const trimmed = fullTitle.trim();
    const multiWord = MULTI_WORD_CATEGORIES.find((name) =>
        trimmed.toLowerCase().startsWith(name.toLowerCase() + ' ')
    );
    if (multiWord) {
        return { category: multiWord, title: trimmed.slice(multiWord.length).trim() };
    }

    const match = trimmed.match(/^(\S+)\s+(.+)$/);
    if (!match) {
        return { category: DEFAULT_CATEGORY, title: trimmed };
    }
    return { category: match[1], title: match[2].trim() };
};

// URL segment for a category page, e.g. "Data Structures" -> "data-structures".
export const categorySlug = (category: string): string =>
    category.toLowerCase().trim().replace(/\s+/g, '-');
