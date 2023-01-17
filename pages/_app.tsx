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
            <script async id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={""}/>
			<link href="https://fonts.googleapis.com/css2?family=Overpass+Mono&family=Rozha+One&family=Spectral:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet"/>
			<link rel="stylesheet" href="https://use.typekit.net/nme2fxj.css"/>
			<script defer data-domain="huy.rocks" src="https://analytics.huy.rocks/js/script.js"></script>
        </Head>
        <div className="flex justify-center items-center bg-stone-100 h-16 font-serif">
            <div className="container-center center-horizontal text-stone-500 font-bold font-mono text-sm">
                <Link href="/">
                    <a className="font-bold text-stone-700">huy.rocks</a>
                </Link>
                {page ? "/" + page : ""}
                <span className="text-stone-500 inline-block animate-blink">▮</span>
            </div>
        </div>
        <Component {...pageProps} />
        <footer className="flex font-mono justify-center items-center h-16 bg-stone-100 text-stone-500 text-sm">
            <div className="container-center center-horizontal flex">
                <p><a rel="me" href="https://masto.ai/@huy">🐘 @huy</a></p>
                <div className='flex-1'></div>
                <div className='font-normal'>
                    <Link href="/rss.xml">{"📮 RSS"}</Link>
                </div>
            </div>
        </footer>
    </Fragment>
}

export default MyApp
