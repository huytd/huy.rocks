import '../styles/globals.scss'
import '../styles/github-theme.scss'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { Fragment } from 'react';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
    const page = pageProps?.repo ?? "";
    return <Fragment>
        <Head>
            <title>huy.rocks/{page ? "/" + page : ""}</title>
            <link rel="icon" href="/favicon.ico" />
            <script async defer data-domain="huy.rocks" src="https://analytics.huy.rocks/js/plausible.js"></script>
            <script async id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
        </Head>
        <div className="flex justify-center items-center bg-stone-100 h-16 font-serif">
            <div className="container-center center-horizontal text-stone-500 font-bold">
                <Link href="/">
                    <a className="font-bold text-stone-700">huy.rocks</a>
                </Link>
                {page ? "/" + page : ""}
                <span className="text-stone-500 inline-block animate-blink">▮</span>
            </div>
        </div>
        <Component {...pageProps} />
        <footer className="flex font-serif justify-center items-center h-16 bg-stone-100 text-stone-400 text-sm">
            <div className="container-center center-horizontal flex">
                <p><Link href="https://twitter.com/huytd189">{"🐦 @huytd189"}</Link></p>
                <div className='flex-1'></div>
                <div className='font-normal'>
                    <Link href="/rss.xml">{"📮 RSS"}</Link>
                </div>
            </div>
        </footer>
    </Fragment>
}

export default MyApp
