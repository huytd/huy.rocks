import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (context) => {
  let repo = context.params?.repo ?? null;
  let data = "";
  if (repo) {
    const req = await fetch(`https://api.github.com/repos/huytd/${repo}/contents/DEVLOG.md`);
    const result = await req.json();
    if (result?.content) {
      const buffer = new Buffer(result.content, 'base64');
      const content = buffer.toString('utf-8');
      data = content;
    }
  }
  if (data && repo) {
    return {
      props: { data, repo }
    }
  } else {
    return {
      notFound: true
    }
  }
}

const Devlog: NextPage = ({ data, repo }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const renderer = new marked.Renderer();
  marked.setOptions({
    gfm: true,
    renderer: renderer,
    highlight: function(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  });
  renderer.heading = function(text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return '<h' + level + '><a class="font-bold" name="' +
      escapedText +
      '" href="#' +
      escapedText +
      '">' +
      text + '</a></h' + level + '>';
  };

  const content = repo ? marked.parse(data).replace(/src=\"(.\/)?/g, `src="https://github.com/huytd/${repo}/raw/master/`) : `Uh oh!`;
  return (
    <main className="container-center my-10">
      <h1 className="font-bold text-4xl mt-10 border-none">{repo}: Development Log</h1>
      <div className="my-2 text-gray-500">-&gt; <Link href={`https://github.com/huytd/${repo}`}><a className="hover:underline">GitHub Repository</a></Link></div>
      <div className="github-theme my-10" dangerouslySetInnerHTML={{ __html: content }}></div>
    </main>
  )
}

export default Devlog
