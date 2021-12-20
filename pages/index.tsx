import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { Fragment } from 'react'

const Home: NextPage = () => {
  return (
    <main className="container-center github-theme my-10 min-h-full flex-1">
      <p>{"Hello! I'm Huy! Look like you've found my space on the internet."}</p>

      <h2>Contact</h2>
      <p>{"In case you're interested:"}</p>
      <ul>
        <li>-&gt; <Link href="https://github.com/huytd">Find me on GitHub</Link></li>
        <li>-&gt; <Link href="https://resume.huy.rocks">My resume (last update: 07/2021)</Link></li>
        <li>-&gt; <Link href="mailto:hey@huy.rocks">Contact me</Link></li>
      </ul>

      <h2>Development Log</h2>
      <p>{"I keep a development log for some of the project I'm working on, you can find them here:"}</p>
      <ul>
        <li>-&gt; <Link href="/ascii-d"><a className="font-bold">ASCII-d</a></Link>: <i>Cross-platform ASCII diagram drawing application</i></li>
        <li>-&gt; <Link href="/snarkyterm"><a className="font-bold">SnarkyTerm</a></Link>: <i>A terminal emulator written in Rust and WGPU</i></li>
        <li>-&gt; <Link href="/web-debugger"><a className="font-bold">Web Debugger</a></Link>: <i>A Web-based JavaScript debugger</i></li>
      </ul>
      <p>{"Most of my other projects doesn't have a DEVLOG, but please feel free to check them on GitHub."}</p>
    </main>
  )
}

export default Home
