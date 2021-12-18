import '../styles/globals.css'
import '../styles/github-theme.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { Fragment } from 'react';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  const page = pageProps?.repo ?? "";
  return <Fragment>
    <Head>
      <title>/home/huy{page ? "/" + page : ""}</title>
      <link rel="icon" href="/favicon.ico" />
      <script async defer data-domain="huy.rocks" src="https://analytics.huy.rocks/js/plausible.js"></script>
    </Head>
    <div className="flex justify-center items-center bg-gray-100 h-16">
      <div className="container-center center-horizontal text-slate-500 font-bold">
        <Link href="/">
          <a className="font-bold text-gray-700">/home/huy</a>
        </Link>
        {page ? "/" + page : ""}
        <span className="text-slate-500 inline-block animate-blink">▮</span>
      </div>
    </div>
    <Component {...pageProps} />
    <footer className="flex justify-center items-center h-16 bg-gray-100 text-gray-400 text-sm">
      <div className="container-center center-horizontal">
        <p><Link href="https://ko-fi.com/thefullsnack">{"☕ buy me a coffee?"}</Link></p>
      </div>
    </footer>
  </Fragment>
}

export default MyApp
