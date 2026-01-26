import Head from 'next/head';
import type { MetaProps } from './meta.types';
import { toAbsoluteUrl } from './meta.utils';

export function Meta({
  title,
  description,
  image,
  url,
  siteName,
  type = 'website',
  noindex = false,
  twitterCard = 'summary_large_image',
  imageAlt,
}: MetaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
  const resolvedUrl = toAbsoluteUrl(siteUrl, url);
  const resolvedImage = toAbsoluteUrl(siteUrl, image);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}
      {resolvedUrl ? <link rel="canonical" href={resolvedUrl} /> : null}
      <meta property="og:type" content={type} />
      {siteName ? <meta property="og:site_name" content={siteName} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {resolvedUrl ? <meta property="og:url" content={resolvedUrl} /> : null}
      {resolvedImage ? <meta property="og:image" content={resolvedImage} /> : null}
      {imageAlt ? <meta property="og:image:alt" content={imageAlt} /> : null}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {resolvedImage ? <meta name="twitter:image" content={resolvedImage} /> : null}
    </Head>
  );
}
