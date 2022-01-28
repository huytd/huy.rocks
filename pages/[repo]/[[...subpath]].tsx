import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { marked } from 'marked';
import hljs from 'highlight.js';
import hljsZig from '../../utils/zig';
import 'highlight.js/styles/googlecode.css';
import Link from 'next/link';
import { DataService } from '../../utils/data';
import { CommonSEO } from '../../components/SEO';

hljs.registerLanguage("zig", hljsZig);

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let repo = context.params?.repo ?? null;
  let rest = context.params?.subpath ?? null;
  let subpath = "";
  let reload = false;
  if (rest?.length) {
    subpath = rest[0];
    reload = !!rest[1];
  }

  let markdown = "";
  let postTitle = "";

  const days = await DataService.allPosts();
  if (subpath) {
    // Subpath is requested
    const matchedIndex = days.findIndex(day => day?.slug.match(subpath));
    if (matchedIndex !== -1) {
      // Found the matched post
      const matchedDay = days[matchedIndex];
      markdown = `# ${matchedDay!.title}\n\n${matchedDay!.tokens.join("")}`;
      const otherStart = Math.max(matchedIndex - 3, 0);
      const otherEnd = otherStart + 6;
      let linkToOthers = days.slice(otherStart, otherEnd).filter(day => day?.slug !== matchedDay?.slug);
      let linkToOthersMarkdown = linkToOthers.map(link => `- [${link?.title}](/${repo}/${link?.slug})`);
      markdown += "\n\n" + `## Read more\n\n${linkToOthersMarkdown.join("\n")}`;
      postTitle = matchedDay?.title ?? "";
    } else {
      // Post not found
      markdown = `Hey! Look like you have lost your way, consider [going back](/${repo})?`;
    }
  } else {
    // List all posts
    markdown = days.filter(day => day.project === repo).map(day => {
      let content = day
        .rawTokens
        .filter(t => t.type === "text" || t.type === "paragraph" || t.type === "link" || t.type === "strong" || t.type === "em" || t.type === "space");
      return {
        title: day.title,
        slug: day.slug,
        content: content.slice(0, 4).map(t => t.raw).join("").trimEnd().replace(/:$/, '') + (content.length > 4 ? "..." : "")
      }
    })
    .map(post => `# ${post.title}\n\n${post.content}\n\n[Read more ->](/${repo}/${post.slug})`).join("\n\n\n");
  }

  const isDevEnv = process.env.NODE_ENV === 'development';
  if (markdown && repo) {
    return {
      revalidate: (reload || isDevEnv) ? 1 : 60 * 60,
      props: { markdown, postTitle, repo, subpath }
    }
  } else {
    return {
      notFound: true
    }
  }
}

const Devlog: NextPage = ({ markdown, postTitle, repo, subpath }: InferGetStaticPropsType<typeof getStaticProps>) => {
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

  let content = marked.parse(markdown);
  content = content.replace(/src=\"(.\/)?/g, `src="https://raw.githubusercontent.com/huytd/${repo}/master/`);

  const loadScript = `
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$']]
      },
      svg: {
        fontCache: 'global'
      }
    };
  `;

  const pageTitle = "/home/huy/" + repo + (postTitle ? ` | ${postTitle}` : "");
  const description = markdown
    .split('\n')
    .filter((line: string) => !line.startsWith("# ") && !line.startsWith("\n") && line.length >= 5)
    .slice(0, 3)
    .join(" ")
    .substr(0, 157) + "...";

  return (
    <>
      <CommonSEO title={pageTitle} description={description} ogType={'article'} ogImage={'https://huy.rocks/social-image.png'}/>
      <main className="container-center my-10">
        <h1 className="font-bold text-4xl mt-10 border-none"><Link href={`/${repo}`}>{repo}</Link>: Development Log</h1>
        <div className="my-2 text-gray-500">-&gt; <Link href={`https://github.com/huytd/${repo}`}><a className="hover:underline">GitHub Repository</a></Link></div>
        <div className="github-theme my-10" dangerouslySetInnerHTML={{ __html: content }}></div>
      </main>
      <script dangerouslySetInnerHTML={{__html: loadScript}}></script>
    </>
  )
}

export default Devlog
