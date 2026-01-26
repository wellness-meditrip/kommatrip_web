import type { GetServerSideProps } from 'next';

const disallowPaths = ['/login', '/signup', '/mypage', '/reservations', '/bookings'];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
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
