import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import 'highlight.js/styles/base16/equilibrium-light.css';
import Link from 'next/link';
import { DataService, BlogPost } from '../../utils/data';
import { CommonSEO } from '../../components/SEO';
import { base64_encode } from '../../utils/base64';
import { useEffect } from 'react';
import { renderMarkdown } from '../../utils/markdown';

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = DataService.getAllPosts();
    const paths = posts.map((post) => ({
        params: { slug: post.slug }
    }));

    return {
        paths,
        fallback: false
    };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const slug = context.params?.slug as string;
    const post = DataService.getPostBySlug(slug);

    if (!post) {
        return {
            notFound: true
        };
    }

    return {
        props: { post },
        revalidate: 3600 // Revalidate every hour
    };
};

const BlogPost: NextPage<{ post: BlogPost }> = ({ post }) => {
    useEffect(() => {
        // Typeset math after mount and whenever we navigate to another post
        // client-side. On a full page load MathJax typesets on its own once
        // the script finishes loading, so it may not be available yet here.
        const mathJax = window.MathJax;
        if (mathJax?.typesetPromise) {
            mathJax.typesetClear?.();
            mathJax.typesetPromise();
        }
    }, [post.slug]);

    // Remove the first line (header with date/tag) from content
    const contentLines = post.content.split('\n');
    const contentWithoutHeader = contentLines.slice(1).join('\n');
    const content = renderMarkdown(contentWithoutHeader);

    const pageTitle = post.title;
    const description = post.excerpt;
    const socialImage = `https://huy.rocks/api/image?t=${base64_encode(post.title)}`;

    return (
        <>
            <CommonSEO title={pageTitle} description={description} ogType={'article'} ogImage={socialImage} />
            <main className="container-center my-10">
                <div className="mb-8">
                    <Link href="/everyday">
                        <a className="text-blue-600 hover:text-blue-800 font-mono text-sm">← Back to everyday</a>
                    </Link>
                </div>
                
                {/* Post Header */}
                <header className="mb-8 pb-6 border-b border-stone-200">
                    <div className="mb-3">
                        <span className="inline-block px-3 py-1 text-sm font-medium text-stone-600 bg-stone-100 rounded-full font-mono">
                            {post.category}
                        </span>
                    </div>
                    <h1 className="font-title text-4xl text-stone-700 mb-3 leading-tight">
                        {post.title}
                    </h1>
                    <time className="text-stone-500 text-sm font-mono" dateTime={post.date}>
                        {post.formattedDate}
                    </time>
                </header>
                
                <article className="github-theme post-content">
                    <div dangerouslySetInnerHTML={{ __html: content }}></div>
                </article>

                <div className="mt-12 pt-8 border-t">
                    <div className="flex justify-between items-center">
                        <Link href="/everyday">
                            <a className="text-blue-600 hover:text-blue-800 font-mono text-sm">← All posts</a>
                        </Link>
                        <Link href={`/category/${post.category.toLowerCase()}`}>
                            <a className="text-blue-600 hover:text-blue-800 font-mono text-sm">More in {post.category} →</a>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}

export default BlogPost