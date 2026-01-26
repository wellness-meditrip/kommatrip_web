import type { GetServerSideProps } from 'next';
import { routing } from '@/i18n/routing';

const basePaths = ['/', '/company', '/search', '/packages', '/review', '/interest'];

const buildUrl = (siteUrl: string, locale: string, path: string) => {
  const normalizedPath = path === '/' ? '' : path;
  return `${siteUrl}/${locale}${normalizedPath}`;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  const lastmod = new Date().toISOString();

  const urls = routing.locales.flatMap((locale) =>
    basePaths.map((path) => buildUrl(siteUrl, locale, path))
  );

  const entries = urls
    .map(
      (loc) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(xml.trim());
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
