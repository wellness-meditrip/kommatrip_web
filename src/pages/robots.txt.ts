import type { GetServerSideProps } from 'next';
import { routing } from '@/i18n/routing';
import { getLocaleAwarePath, PRIVATE_ROBOTS_PATHS } from '@/seo';

const buildDisallowPaths = () => {
  const localizedPaths = routing.locales.flatMap((locale) =>
    PRIVATE_ROBOTS_PATHS.map((path) => getLocaleAwarePath(locale, path))
  );

  return Array.from(new Set([...PRIVATE_ROBOTS_PATHS, ...localizedPaths])).sort();
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  const disallowPaths = buildDisallowPaths();
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...disallowPaths.map((path) => `Disallow: ${path}`),
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ];

  res.setHeader('Content-Type', 'text/plain');
  res.write(lines.join('\n'));
  res.end();

  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
