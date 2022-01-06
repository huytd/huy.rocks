const fetch = require('node-fetch');
const marked = require('marked');
const fs = require('fs');

const projects = ['everyday', 'ascii-d', 'snarkyterm', 'web-debugger'];
const site_url = 'https://huy.rocks';

const run = async () => {
  let sitemap = `${site_url}/\n`;

  for (let project of projects) {
    sitemap += `${site_url}/${project}\n`;
    const res = await fetch(`https://raw.githubusercontent.com/huytd/${project}/master/DEVLOG.md`);
    const data = await res.text();
    const tokens = marked.lexer(data);
    for (let token of tokens) {
      if (token.type === "heading" && token.depth === 1) {
        const slug = token.text.toLowerCase().replace(/[^\w]+/g, '-');
        sitemap += `${site_url}/${project}/${slug}\n`;
      }
    }
  }

  fs.writeFileSync('./public/sitemap.txt', sitemap);
};

run();