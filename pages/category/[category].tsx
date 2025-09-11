import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import Link from 'next/link';
import { DataService, BlogPost } from '../../utils/data';
import { CommonSEO } from '../../components/SEO';

interface CategoryPageProps {
  category: string;
  posts: BlogPost[];
}

export const getStaticPaths: GetStaticPaths = async () => {
    const categories = DataService.getCategories();
    const paths = categories.map((category) => ({
        params: { category: category.toLowerCase() }
    }));

    return {
        paths,
        fallback: false
    };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const category = context.params?.category as string;
    const posts = DataService.getPostsByCategory(category);

    if (posts.length === 0) {
        return {
            notFound: true
        };
    }

    return {
        props: { 
            category: category.charAt(0).toUpperCase() + category.slice(1),
            posts 
        },
        revalidate: 3600 // Revalidate every hour
    };
};

const CategoryPage: NextPage<CategoryPageProps> = ({ category, posts }) => {
    const pageTitle = `${category} Posts`;
    const description = `All posts in the ${category} category`;
    const ogImage = 'https://huy.rocks/social-image.png';

    return (
        <>
            <CommonSEO title={pageTitle} description={description} ogType={'website'} ogImage={ogImage} />
            <main className="container-center github-theme my-10">
                <div className="mb-8">
                    <Link href="/everyday">
                        <a className="text-blue-600 hover:text-blue-800 font-mono text-sm">← Back to everyday</a>
                    </Link>
                </div>
                
                <header className="mb-8 pb-4 border-b">
                    <h1 className="font-bold text-4xl mb-4">{category} Posts</h1>
                    <p className="text-gray-600">{posts.length} post{posts.length !== 1 ? 's' : ''} in this category</p>
                </header>

                <div className="space-y-6">
                    {posts.map((post) => (
                        <article key={post.slug}>
                            <Link href={`/everyday/${post.slug}`}>
                                <a className="font-bold text-xl hover:text-blue-600">{post.title}</a>
                            </Link>
                            <div className="text-gray-600 mt-2">{post.excerpt}</div>
                        </article>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t">
                    <Link href="/everyday">
                        <a className="text-blue-600 hover:text-blue-800 font-mono text-sm">← Back to everyday</a>
                    </Link>
                </div>
            </main>
        </>
    )
}

export default CategoryPage