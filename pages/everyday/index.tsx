import type { NextPage, GetStaticProps } from 'next'
import Head from "next/head";
import Link from 'next/link'
import { DataService, BlogPost } from '../../utils/data'

interface EverydayProps {
  posts: BlogPost[];
  categories: string[];
}

const Everyday: NextPage<EverydayProps> = ({ posts, categories }) => {
    return (
        <>
            <Head>
                <title>Everyday - huy.rocks</title>
                <meta name="description" content="My daily thoughts, learnings, and experiences" />
            </Head>
            <main className="container-center github-theme no-list my-10 min-h-full flex-1">
                <div className="mb-8">
                    <Link href="/">
                        <a className="text-blue-600 hover:text-blue-800 font-mono text-sm">← Back to home</a>
                    </Link>
                </div>
                
                <h1>Everyday</h1>
                <p>My daily thoughts, learnings, and experiences.</p>
                
                <div className="posts my-8">
                    <h2>All Posts</h2>
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <article key={post.slug} className="border-b border-stone-200 pb-4">
                                <Link href={`/everyday/${post.slug}`}>
                                    <a className="font-bold text-xl hover:text-blue-600">{post.title}</a>
                                </Link>
                                <div className="text-gray-600 mt-1">{post.excerpt}</div>
                                <div className="mt-2 flex items-center gap-3">
                                    <span className="inline-block px-3 py-1 text-sm font-medium text-stone-600 bg-stone-100 rounded-full font-mono">
                                        {post.category}
                                    </span>
                                    <time className="text-gray-600 text-sm font-mono" dateTime={post.date}>
                                        {post.formattedDate}
                                    </time>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <div className="categories my-8">
                    <h2>Categories</h2>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {categories.map((category) => (
                            <Link key={category} href={`/category/${category.toLowerCase()}`}>
                                <a className="text-blue-600 hover:text-blue-800 font-mono text-sm">
                                    {category}
                                </a>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const allPosts = DataService.getAllPosts();
    const categories = DataService.getCategories();
    
    return {
        props: {
            posts: allPosts,
            categories
        },
        revalidate: 3600 // Revalidate every hour
    };
};

export default Everyday