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

        const posts = await DataService.allPosts();

        for (let post of posts) {
            const postUrl = `${SITE_URL}/${post.project}/${post.slug}`;
            const postDate = dayjs(post.title.split('-')[0].trim());
            if (postDate.isValid()) {
                feed.addItem({
                    title: post.title,
                    link: postUrl,
                    date: postDate.toDate()
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