import { GetServerSideProps } from "next";
import { marked } from 'marked';
import { ENABLED_PROJECTS, SITE_URL } from "../utils/consts";
import { Feed } from 'feed';
import dayjs from 'dayjs'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    if (res) {
        const feed = new Feed({
            title: "huy.rocks",
            description: "Huy's development blog",
            id: "https://huy.rocks",
            link: "https://huy.rocks",
            copyright: "All rights reserved 2022, Huy Tran",
            language: "en",
        });

        for (let project of ENABLED_PROJECTS) {
            const res = await fetch(`https://raw.githubusercontent.com/huytd/${project}/master/DEVLOG.md`);
            const data = await res.text();
            const tokens = marked.lexer(data);
            for (let token of tokens) {
                if (token.type === "heading" && token.depth === 1) {
                    const postTitle = token.text;
                    const slug = postTitle.toLowerCase().replace(/[^\w]+/g, '-');
                    const postUrl = `${SITE_URL}/${project}/${slug}`;
                    const postDate = dayjs(postTitle.split('-')[0].trim());
                    if (postDate.isValid()) {
                        feed.addItem({
                            title: postTitle,
                            link: postUrl,
                            date: postDate.toDate()
                        });
                    }
                }
            }
        }

        res.setHeader('Content-type', 'application/rss+xml');
        res.write(feed.rss2());
        res.end();
    }

    return {
        props: {}
    }
};

const RSSFeed = () => null;

export default RSSFeed