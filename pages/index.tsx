import type { NextPage } from 'next'
import Head from "next/head";
import Link from 'next/link'

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <meta name="google-site-verification" content="pSprDjtnAmX3XLxQpyoQ8lOTIpXXr9qqVsbl4A4KL4M" />
            </Head>
            <main className="container-center github-theme no-list my-10 min-h-full flex-1">
                <p></p>
                <h1>{"Hello! I'm Huy!"}</h1>
                <p>{"Look like you've found my space on the internet."}</p>

                <p>{"I write about programming, technology, and things I learn along the way."}</p>
                
                <div className="my-8">
                    <p>{"You can find my thoughts and learnings in my "}<Link href="/everyday"><a className="text-blue-600 hover:text-blue-800 font-bold">everyday blog</a></Link>{"."}</p>
                </div>

                <p>{"In case you're interested, you can reach me "}<b><Link href="mailto:hey@huy.rocks">via email</Link></b> or <b><Link href="https://github.com/huytd">visit my GitHub</Link></b></p>
                <div className="mb-20">&nbsp;</div>
            </main>
        </>
    )
}

export default Home
