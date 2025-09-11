import { GetServerSideProps } from "next";
import { SITE_URL } from "../utils/consts";
import { Feed } from 'feed';
import dayjs from 'dayjs'
import { DataService } from "../utils/data";

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

        const posts = DataService.getAllPosts();

        for (let post of posts) {
            const postUrl = `${SITE_URL}/everyday/${post.slug}`;
            const postDate = dayjs(post.date.replace(/\./g, '/'));
            if (postDate.isValid()) {
                feed.addItem({
                    title: post.title,
                    link: postUrl,
                    description: post.excerpt,
                    date: postDate.toDate(),
                    category: [{
                        name: post.category
                    }]
                });
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