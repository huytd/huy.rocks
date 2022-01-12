import { GetServerSideProps } from "next";
import { marked } from 'marked';
import { ENABLED_PROJECTS, SITE_URL } from "../utils/consts";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    if (res) {
        let sitemap = [`${SITE_URL}/`];

        for (let project of ENABLED_PROJECTS) {
            sitemap.push(`${SITE_URL}/${project}`);
            const res = await fetch(`https://raw.githubusercontent.com/huytd/${project}/master/DEVLOG.md`);
            const data = await res.text();
            const tokens = marked.lexer(data);
            for (let token of tokens) {
                if (token.type === "heading" && token.depth === 1) {
                    const slug = token.text.toLowerCase().replace(/[^\w]+/g, '-');
                    sitemap.push(`${SITE_URL}/${project}/${slug}`);
                }
            }
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