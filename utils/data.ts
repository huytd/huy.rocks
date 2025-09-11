import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

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
        
        // Extract category (first word after the date)
        const category = fullTitle.split(' ')[0] || 'General';
        
        // Clean up the title by removing the category prefix
        // The filename format is "Category Title" but we want just "Title"
        const cleanTitle = fullTitle.replace(/^[^\/\s]+\s+/, '').trim();
        
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
        
        // Create excerpt from first few lines of content (skip the header line)
        const contentLines = content.split('\n').slice(1).filter(line => line.trim() !== '');
        const excerpt = contentLines.slice(0, 3).join(' ').substring(0, 200) + '...';
        
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