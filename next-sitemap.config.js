/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://quick-menu.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 50000, // Google allows up to 50k URLs per sitemap
  generateIndexSitemap: false, // 🚀 force it to NOT split
};

export default config;
