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
  noindex?: boolean;
  policy?: PagePolicyName;
  jsonLd?: JsonLd[];
}

export function createPageMeta({
  keyword,
  pageTitle,
  description,
  path,
  image = '/og/OG_image.jpg',
  noindex = false,
  policy = 'public-discovery',
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
    url: resolvedPath,
    siteName: resolvedSiteName,
    noindex: shouldNoindex,
    robots: shouldNoindex ? 'noindex,nofollow' : undefined,
    alternates: resolvedPolicy.includeAlternates
      ? buildLocaleAlternates(resolvedSiteUrl.replace(/\/$/, ''), normalizedPath)
      : undefined,
    jsonLd,
  };
}
