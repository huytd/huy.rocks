import fs from 'fs';
import path from 'path';
import { markdownToExcerpt } from './markdown';
import { categorySlug, splitCategoryAndTitle } from './category';

export interface BlogPost {
  title: string;
  date: string;
  formattedDate: string;
  category: string;
  slug: string;
  content: string;
  excerpt: string;
  fileName: string;
};

export const DataService = {
    getAllMarkdownFiles: (): string[] => {
        const notesDir = path.join(process.cwd(), 'notes');
        const files = fs.readdirSync(notesDir);
        return files.filter(file => file.endsWith('.md'));
    },

    formatDate: (dateString: string): string => {
        // Convert MM.DD.YYYY to a proper date format
        const [month, day, year] = dateString.split('.');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    parseBlogPost: (fileName: string): BlogPost => {
        const notesDir = path.join(process.cwd(), 'notes');
        const filePath = path.join(notesDir, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Parse date and category from filename: "MM.DD.YYYY - Category Title.md"
        const fileNameWithoutExt = fileName.replace('.md', '');
        const [datePart, ...titleParts] = fileNameWithoutExt.split(' - ');
        const fullTitle = titleParts.join(' - ');

        // Split "Category Title" into the category and the actual title
        const { category, title: cleanTitle } = splitCategoryAndTitle(fullTitle);
        
        // Format the date nicely
        const formattedDate = DataService.formatDate(datePart);
        
        // Create slug from filename (not title) to keep URLs stable when titles change
        // Use the entire filename without extension, including the date part
        const slug = fileNameWithoutExt.toLowerCase()
            .replace(/\./g, '-')       // Convert dots to dashes (for date format)
            .replace(/[^\w\s-]/g, '')  // Remove special characters except spaces and dashes
            .replace(/\s+/g, '-')      // Replace spaces with dashes
            .replace(/-+/g, '-')       // Replace multiple consecutive dashes with single dash
            .trim();
        
        // Plain-text excerpt of the post body (skip the header line)
        const excerpt = markdownToExcerpt(content.split('\n').slice(1).join('\n'));
        
        return {
            title: cleanTitle,
            date: datePart,
            formattedDate,
            category,
            slug,
            content,
            excerpt,
            fileName
        };
    },

    getAllPosts: (): BlogPost[] => {
        const files = DataService.getAllMarkdownFiles();
        const posts = files.map(file => DataService.parseBlogPost(file));

        // Categories that differ only in case ("Typescript" vs "TypeScript")
        // are the same category: use its most common spelling everywhere.
        const spellings = new Map<string, Map<string, number>>();
        for (const post of posts) {
            const slug = categorySlug(post.category);
            const counts = spellings.get(slug) ?? new Map<string, number>();
            counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
            spellings.set(slug, counts);
        }
        const canonical = new Map<string, string>();
        spellings.forEach((counts, slug) => {
            const [name] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
            canonical.set(slug, name);
        });
        for (const post of posts) {
            post.category = canonical.get(categorySlug(post.category)) ?? post.category;
        }

        return posts.sort((a, b) => {
            // Sort by date (newest first)
            const dateA = new Date(a.date.replace(/\./g, '/'));
            const dateB = new Date(b.date.replace(/\./g, '/'));
            return dateB.getTime() - dateA.getTime();
        });
    },

    getPostBySlug: (slug: string): BlogPost | null => {
        const posts = DataService.getAllPosts();
        return posts.find(post => post.slug === slug) || null;
    },

    // `category` is the category's URL slug (see categorySlug)
    getPostsByCategory: (category: string): BlogPost[] => {
        const slug = categorySlug(category);
        const posts = DataService.getAllPosts();
        return posts.filter(post => categorySlug(post.category) === slug);
    },

    getCategories: (): string[] => {
        const posts = DataService.getAllPosts();
        const categories = new Set(posts.map(post => post.category));
        return Array.from(categories).sort();
    }
};
