import { GetServerSideProps } from "next";
import { SITE_URL } from "../utils/consts";
import { DataService } from "../utils/data";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    if (res) {
        let sitemap = [];

        const posts = await DataService.allPosts();

        for (let {project, slug} of posts) {
            sitemap.push(`${SITE_URL}/${project}/${slug}`);
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
