import type { GetServerSideProps } from 'next';
import { getCompanyAll, getProgramCompanyList } from '@/apis';
import { routing } from '@/i18n/routing';
import { Company } from '@/models/company';
import { ProgramListItem } from '@/models/program';
import { getLocaleAwarePath } from '@/seo';

const basePaths = ['/', '/company'] as const;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const buildUrl = (siteUrl: string, locale: string, path: string) =>
  `${siteUrl}${getLocaleAwarePath(locale, path)}`;

const extractCompanies = (payload: unknown): Company[] => {
  if (payload && typeof payload === 'object') {
    const companies = (payload as { companies?: unknown }).companies;
    if (Array.isArray(companies)) {
      return companies as Company[];
    }

    const data = (payload as { data?: { companies?: unknown } }).data;
    if (Array.isArray(data?.companies)) {
      return data.companies as Company[];
    }
  }

  return [];
};

const extractPrograms = (payload: unknown): ProgramListItem[] => {
  if (payload && typeof payload === 'object') {
    const programs = (payload as { programs?: unknown }).programs;
    if (Array.isArray(programs)) {
      return programs as ProgramListItem[];
    }
  }

  return [];
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  const lastmod = new Date().toISOString();
  const companies = extractCompanies(await getCompanyAll());

  const programResults = await Promise.allSettled(
    companies.map(({ id }) =>
      getProgramCompanyList({
        company_id: id,
        skip: 0,
        limit: 100,
      })
    )
  );

  const dynamicPaths = companies.flatMap(({ id }) => [`/company/${id}`, `/company/${id}/reviews`]);
  const programPaths = programResults.flatMap((result, index) => {
    if (result.status !== 'fulfilled') {
      return [];
    }

    const companyId = companies[index]?.id;
    if (!companyId) {
      return [];
    }

    return extractPrograms(result.value).map(
      ({ id: programId }) => `/company/${companyId}/program/${programId}`
    );
  });

  const paths = Array.from(new Set([...basePaths, ...dynamicPaths, ...programPaths]));

  const urls = routing.locales.flatMap((locale) =>
    paths.map((path) => buildUrl(siteUrl, locale, path))
  );

  const entries = urls
    .map(
      (loc) => `
  <url>
    <loc>${escapeXml(loc)}</loc>
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
