import { GetServerSideProps } from "next";
import { SITE_URL } from "../utils/consts";
import { DataService } from "../utils/data";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    if (res) {
        let sitemap = [];

        // Add homepage
        sitemap.push(SITE_URL);
        
        // Add everyday index page
        sitemap.push(`${SITE_URL}/everyday`);

        // Add all blog posts
        const posts = DataService.getAllPosts();
        for (let post of posts) {
            sitemap.push(`${SITE_URL}/everyday/${post.slug}`);
        }

        // Add category pages
        const categories = DataService.getCategories();
        for (let category of categories) {
            sitemap.push(`${SITE_URL}/category/${category.toLowerCase()}`);
        }

        res.setHeader('Content-type', 'text/plain');
        res.write(sitemap.join("\n"));
        res.end();
    }

    return {
        props: { }
    }
};

const Sitemap = () => null;

export default Sitemap
