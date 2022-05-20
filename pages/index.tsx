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

                <p>{"I keep a development log for some of the project I'm working on, you can find them here:"}</p>
                <ol>
                    <li><Link href="/everyday"><a className="font-bold">Everyday Learning</a></Link>: <i>Writing about what I learned everyday</i></li>
                    <li><Link href="/gust-lang"><a className="font-bold">Gust-lang</a></Link>: <i>My journey to build a toy programming language</i></li>
                    <li><Link href="/toylisp"><a className="font-bold">ToyLISP</a></Link>: <i>A toy LISP-alike language, focusing on building a bytecode interpreter.</i></li>
                    <li><Link href="/ascii-d"><a className="font-bold">ASCII-d</a></Link>: <i>Cross-platform ASCII diagram drawing application</i></li>
                    <li><Link href="/snarkyterm"><a className="font-bold">SnarkyTerm</a></Link>: <i>A terminal emulator written in Rust and WGPU</i></li>
                    <li><Link href="/web-debugger"><a className="font-bold">Web Debugger</a></Link>: <i>A Web-based JavaScript debugger</i></li>
                </ol>
                <p>{"Most of my other projects doesn't have a DEVLOG, but please feel free to check them on GitHub."}</p>

                <p>{"In case you're interested, you can reach me "}<b><Link href="mailto:hey@huy.rocks">via email</Link></b> or <b><Link href="https://github.com/huytd">visit my GitHub</Link></b></p>
                <div className="mb-20">&nbsp;</div>
            </main>
        </>
    )
}

export default Home
