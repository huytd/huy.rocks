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
			<script>
    			!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    			posthog.init('phc_Rt3AgBZEPEd7wSsUSgXK1MQWS4rqVeFgW3x3T9uNZhu',{api_host:'https://app.posthog.com'})
			</script>
            <script async id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={""}/>
			<link href="https://fonts.googleapis.com/css2?family=Overpass+Mono&family=Rozha+One&family=Spectral:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet"/>
			<link rel="stylesheet" href="https://use.typekit.net/nme2fxj.css"/>
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
