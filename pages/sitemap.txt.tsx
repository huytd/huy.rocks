import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType, InferGetStaticPropsType, NextPage } from "next";
import { marked } from 'marked';

const projects = ['everyday', 'ascii-d', 'snarkyterm', 'web-debugger'];
const site_url = 'https://huy.rocks';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    if (res) {
        let sitemap = [`${site_url}/`];

        for (let project of projects) {
            sitemap.push(`${site_url}/${project}`);
            const res = await fetch(`https://raw.githubusercontent.com/huytd/${project}/master/DEVLOG.md`);
            const data = await res.text();
            const tokens = marked.lexer(data);
            for (let token of tokens) {
                if (token.type === "heading" && token.depth === 1) {
                    const slug = token.text.toLowerCase().replace(/[^\w]+/g, '-');
                    sitemap.push(`${site_url}/${project}/${slug}`);
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