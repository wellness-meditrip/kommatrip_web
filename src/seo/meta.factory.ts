import type { JsonLd, MetaProps } from './meta.types';
import { buildLocaleAlternates, buildTitle, normalizeMetaPath } from './meta.utils';
import type { PagePolicyName } from './page-policy';
import { PAGE_POLICIES } from './page-policy';

interface CreateMetaParams {
  keyword?: string;
  pageTitle: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  locale?: string;
  noindex?: boolean;
  policy?: PagePolicyName;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  jsonLd?: JsonLd[];
}

export function createPageMeta({
  keyword,
  pageTitle,
  description,
  path,
  image = '/og/OG_image.jpg',
  imageAlt,
  type,
  locale,
  noindex = false,
  policy = 'public-discovery',
  publishedTime,
  modifiedTime,
  articleSection,
  jsonLd,
}: CreateMetaParams): MetaProps {
  const resolvedSiteName = process.env.NEXT_PUBLIC_SITE_NAME ?? '';
  const resolvedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const resolvedPolicy = PAGE_POLICIES[policy];
  const title = buildTitle({ keyword, pageTitle, appName: resolvedSiteName });
  const normalizedPath = normalizeMetaPath(path);
  const resolvedPath =
    normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')
      ? normalizedPath
      : normalizedPath && resolvedSiteUrl
        ? `${resolvedSiteUrl.replace(/\/$/, '')}${normalizedPath}`
        : normalizedPath || undefined;
  const shouldNoindex = noindex || resolvedPolicy.noindex;

  return {
    title,
    description,
    image,
    imageAlt,
    url: resolvedPath,
    siteName: resolvedSiteName,
    type,
    locale,
    noindex: shouldNoindex,
    robots: shouldNoindex ? 'noindex,nofollow' : undefined,
    publishedTime,
    modifiedTime,
    articleSection,
    alternates: resolvedPolicy.includeAlternates
      ? buildLocaleAlternates(resolvedSiteUrl.replace(/\/$/, ''), normalizedPath)
      : undefined,
    jsonLd,
  };
}
