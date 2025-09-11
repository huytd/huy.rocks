import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

export interface BlogPost {
  title: string;
  date: string;
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

    parseBlogPost: (fileName: string): BlogPost => {
        const notesDir = path.join(process.cwd(), 'notes');
        const filePath = path.join(notesDir, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract title from first line (should be # Title format)
        const lines = content.split('\n');
        const titleLine = lines[0];
        const title = titleLine.replace(/^#\s*/, '');
        
        // Parse date and category from filename: "MM.DD.YYYY - Category Title.md"
        const fileNameWithoutExt = fileName.replace('.md', '');
        const [datePart, ...titleParts] = fileNameWithoutExt.split(' - ');
        const fullTitle = titleParts.join(' - ');
        
        // Extract category (first word after the date)
        const category = fullTitle.split(' ')[0] || 'General';
        
        // Create slug from title
        const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        
        // Create excerpt from first few lines of content
        const contentLines = lines.slice(1).filter(line => line.trim() !== '');
        const excerpt = contentLines.slice(0, 3).join(' ').substring(0, 200) + '...';
        
        return {
            title,
            date: datePart,
            category,
            slug,
            content,
            excerpt,
            fileName
        };
    },

    getAllPosts: (): BlogPost[] => {
        const files = DataService.getAllMarkdownFiles();
        return files.map(file => DataService.parseBlogPost(file))
            .sort((a, b) => {
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

    getPostsByCategory: (category: string): BlogPost[] => {
        const posts = DataService.getAllPosts();
        return posts.filter(post => post.category.toLowerCase() === category.toLowerCase());
    },

    getCategories: (): string[] => {
        const posts = DataService.getAllPosts();
        const categories = new Set(posts.map(post => post.category));
        return Array.from(categories).sort();
    }
};