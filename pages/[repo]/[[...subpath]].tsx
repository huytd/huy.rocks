import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { marked } from 'marked';
import hljs from 'highlight.js';
import hljsZig from '../../utils/zig';
import { LineFocusPlugin } from 'highlightjs-focus';
import 'highlight.js/styles/base16/equilibrium-light.css';
import Link from 'next/link';
import { DataService } from '../../utils/data';
import { CommonSEO } from '../../components/SEO';
import { base64_encode } from '../../utils/base64';

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
      markdown = `[<- All posts](/${repo})\n\n# ${matchedDay!.title}\n\n${matchedDay!.tokens.join("")}`;
      const otherStart = Math.max(matchedIndex - 3, 0);
      const otherEnd = otherStart + 6;
      let linkToOthers = days.slice(otherStart, otherEnd).filter(day => day?.slug !== matchedDay?.slug);
      let linkToOthersMarkdown = linkToOthers.map(link => `- [${link?.title}](/${repo}/${link?.slug})`);
      markdown += "\n\n---\n\n" + `## Read more\n\n${linkToOthersMarkdown.join("\n")}`;
      postTitle = matchedDay?.title ?? "";
    } else {
      // Post not found
      markdown = `Hey! Look like you have lost your way, consider [going back](/${repo})?`;
    }
  } else {
    // List all posts
    if (repo === "everyday") {
      type PostEntry = {
        date: string,
        title: string,
        fullTitle: string,
        category: string,
        slug: string
      };

      const posts: PostEntry[] = days.filter(day => day.project === repo).map(day => {
        const [date, fullTitle] = day.title.split(" - ");
        const [category, title] = fullTitle?.split("/");
        return {
          date,
          title,
          fullTitle,
          category,
          slug: day.slug,
        }
      });

      markdown = `### Recently Added\n\n${posts.slice(0, 5).map(post => `<span class="post-date">${post.date}</span> [${post.fullTitle}](/${repo}/${post.slug})`).join("\n")}`;

      const categories = posts.reduce((map: Map<string, PostEntry[]>, post) => {
        const key = post.category.toUpperCase();
        let list = map.get(key);
        if (list !== undefined) {
          list.push(post);
        } else {
          map.set(key, [post]);
        }
        return map;
      }, new Map());

      markdown += "\n\n### Posts by categories\n"
      categories.forEach((posts, key) => {
        markdown += `\n\n**${key}**\n\n${posts.slice(0, 5).map(post => `<span class="post-date">${post.date}</span> [${post.title}](/${repo}/${post.slug})`).join("\n")}`;
      });
    } else {
      markdown = days.filter(day => day.project === repo).map(day => {
        let content = day
          .rawTokens
          .filter(t => t.type === "text" || t.type === "paragraph" || t.type === "link" || t.type === "strong" || t.type === "em" || t.type === "space");
        return {
          title: day.title,
          slug: day.slug,
          content: content.slice(0, 4).map(t => t.raw).join("").trimEnd().replace(/:$/, '') + (content.length > 4 ? "..." : "")
        }
      }).map(post => `# ${post.title}\n\n${post.content}\n\n[Read more ->](/${repo}/${post.slug})`).join("\n\n\n");
    }
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
  hljs.addPlugin(new LineFocusPlugin({
    unfocusedStyle: {
      opacity: "0.35",
      filter: "grayscale(1)"
    }
  }));
  marked.setOptions({
    gfm: true,
    breaks: true,
    smartypants: true,
    renderer: renderer,
    highlight: function (code, lang) {
      const language = lang || 'plaintext';
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

  const socialImage = postTitle ? `https://huy.rocks/api/image?t=${base64_encode(postTitle)}` : 'https://huy.rocks/social-image.png';
  const shouldIgnoreIndex = !subpath.length;

  return (
    <>
      <CommonSEO title={pageTitle} description={description} ogType={'article'} ogImage={socialImage} noIndex={shouldIgnoreIndex} />
      <main className="container-center my-10">
      {!subpath && (
        <>
            <h1 className="font-bold text-4xl mt-10 border-none"><Link href={`/${repo}`}>{repo}</Link>: Development Log</h1>
            <div className="my-2 text-gray-500">-&gt; <Link href={`https://github.com/huytd/${repo}`}><a className="hover:underline">GitHub Repository</a></Link></div>
        </>
      )}
        <div className="github-theme my-10" dangerouslySetInnerHTML={{ __html: content }}></div>
      </main>
      <script dangerouslySetInnerHTML={{ __html: loadScript }}></script>
    </>
  )
}

export default Devlog
