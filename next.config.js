/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    // Multi-word categories used to be cut at their first word, which gave
    // them these URLs. Keep old links working.
    return [
      { source: '/category/data', destination: '/category/data-structures', permanent: true },
      { source: '/category/design', destination: '/category/design-patterns', permanent: true },
      { source: '/category/reading', destination: '/category/reading-notes', permanent: true },
    ];
  },
}
