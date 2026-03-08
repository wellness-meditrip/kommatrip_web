import type { MetaProps } from './meta.types';
import { buildTitle } from './meta.utils';

interface CreateMetaParams {
  keyword?: string;
  pageTitle: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

export function createPageMeta({
  keyword,
  pageTitle,
  description,
  path,
  image = '/og/OG_image.jpg',
  noindex = false,
}: CreateMetaParams): MetaProps {
  const resolvedSiteName = process.env.NEXT_PUBLIC_SITE_NAME ?? '';
  const resolvedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const title = buildTitle({ keyword, pageTitle, appName: resolvedSiteName });
  const normalizedPath = path?.split('?')[0] || '';
  const resolvedPath =
    normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')
      ? normalizedPath
      : normalizedPath && resolvedSiteUrl
        ? `${resolvedSiteUrl.replace(/\/$/, '')}${normalizedPath}`
        : normalizedPath || undefined;

  return {
    title,
    description,
    image,
    url: resolvedPath,
    siteName: resolvedSiteName,
    noindex,
  };
}
