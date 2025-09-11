The source code of my personal blog at https://huy.rocks

## Site Structure

This is a Next.js blog that renders content from markdown files in the `notes/` folder.

- `/`: Home page with introduction
- `/everyday`: Blog posts index page
- `/everyday/[slug]`: Individual blog post pages
- `/category/[category]`: Posts filtered by category
- `/rss.xml`: RSS feed
- `/sitemap.txt`: Sitemap for search engines

## Blog Post Format

Blog posts are markdown files in the `notes/` folder with the following naming convention:
- `MM.DD.YYYY - Category/Title.md`

The first line should be a markdown heading (`# Title`) which becomes the post title.

## Features

- Static site generation with ISR (Incremental Static Regeneration)
- Syntax highlighting with highlight.js
- MathJax support for mathematical expressions
- RSS feed generation
- SEO optimization with Open Graph and Twitter cards
- Category-based organization
- Responsive design with Tailwind CSS

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
```