import '../styles/globals.css'
import '../styles/github-theme.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'

function MyApp({ Component, pageProps }: AppProps) {
  const page = pageProps?.repo ?? "";
  return <div>
    <div className="flex justify-center items-center bg-gray-100 h-16">
      <div className="w-[600px] mx-auto flex items-center text-slate-500 font-bold">
        <Link href="/">
          <a className="font-bold text-gray-700">/home/huy</a>
        </Link>
        {page ? "/" + page : ""}
        <span className="text-slate-500 inline-block animate-blink">▮</span>
      </div>
    </div>
    <Component {...pageProps} />
  </div>
}

export default MyApp
