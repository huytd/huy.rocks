import type { GetServerSideProps, GetStaticPaths, GetStaticProps, InferGetServerSidePropsType, InferGetStaticPropsType, NextPage } from 'next'
import { marked } from 'marked';
import hljs from 'highlight.js';
import hljsZig from '../../utils/zig';
import 'highlight.js/styles/github.css';
import Link from 'next/link';
import Head from 'next/head';
import { cachedFetch } from '../../utils/fetch';

hljs.registerLanguage("zig", hljsZig);

interface Day {
  title: string;
  slug: string;
  tokens: string[]
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let repo = context.params?.repo ?? null;
  let subpath = context.params?.subpath ?? null;
  let data = "";
  if (repo) {
    data = await cachedFetch(`https://raw.githubusercontent.com/huytd/${repo}/master/DEVLOG.md`);
  }
  if (data && repo) {
    return {
      revalidate: false,
      props: { data, repo, subpath }
    }
  } else {
    return {
      notFound: true
    }
  }
}

const Devlog: NextPage = ({ data, repo, subpath }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const renderer = new marked.Renderer();
  marked.setOptions({
    gfm: true,
    renderer: renderer,
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  });
  renderer.heading = function (text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    if (level === 1) {
      return '<h' + level + '><a class="font-bold" name="' +
        escapedText +
        '" href="/' + repo + '/' +
        escapedText +
        '">' +
        text + '</a></h' + level + '>';
    } else {
      return '<h' + level + '><a class="font-bold" name="' +
        escapedText +
        '" href="#' +
        escapedText +
        '">' +
        text + '</a></h' + level + '>';
    }
  };

  let content = "";
  let postTitle = "";

  if (subpath) {
    const tokens = marked.lexer(data);
    const days = [];
    let currentDay = null;
    for (let token of tokens) {
      if (token.type === "heading" && token.depth === 1) {
        if (currentDay !== null) {
          days.push(currentDay);
        }
        currentDay = {
          title: token.text,
          slug: token.text.toLowerCase().replace(/[^\w]+/g, '-'),
          tokens: []
        } as Day;
      } else {
        if (currentDay !== null) {
          currentDay.tokens.push(token.raw);
        }
      }
    }
    days.push(currentDay);

    const matchedIndex = days.findIndex(day => day?.slug.match(subpath));
    if (matchedIndex !== -1) {
      const matchedDay = days[matchedIndex];
      postTitle = matchedDay?.title ?? "";
      let markdown = `# ${matchedDay!.title}\n\n${matchedDay!.tokens.join("")}`;
      const otherStart = Math.max(matchedIndex - 3, 0);
      const otherEnd = otherStart + 6;
      let linkToOthers = days.slice(otherStart, otherEnd).filter(day => day?.slug !== matchedDay?.slug);
      let linkToOthersMarkdown = linkToOthers.map(link => `- [${link?.title}](/${repo}/${link?.slug})`);
      markdown += "\n\n" + `## Read more\n\n${linkToOthersMarkdown.join("\n")}`;
      content = marked.parse(markdown);
    } else {
      content = marked.parse(`Hey! Look like you have lost your way, consider [going back](/${repo})?`);
    }
  } else {
    content = marked.parse(data);
  }

  content = content.replace(/src=\"(.\/)?/g, `src="https://github.com/huytd/${repo}/raw/master/`);

  return (
    <>
      <Head>
        <title>/home/huy/{repo}{postTitle ? ` | ${postTitle}` : ''}</title>
      </Head>
      <main className="container-center my-10">
        <h1 className="font-bold text-4xl mt-10 border-none"><Link href={`/${repo}`}>{repo}</Link>: Development Log</h1>
        <div className="my-2 text-gray-500">-&gt; <Link href={`https://github.com/huytd/${repo}`}><a className="hover:underline">GitHub Repository</a></Link></div>
        <div className="github-theme my-10" dangerouslySetInnerHTML={{ __html: content }}></div>
      </main>
    </>
  )
}

export default Devlog
