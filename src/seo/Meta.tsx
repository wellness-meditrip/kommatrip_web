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
  locale,
  noindex = false,
  robots,
  twitterCard = 'summary_large_image',
  imageAlt,
  publishedTime,
  modifiedTime,
  articleSection,
  alternates,
  jsonLd,
}: MetaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
  const resolvedUrl = toAbsoluteUrl(siteUrl, url);
  const resolvedImage = toAbsoluteUrl(siteUrl, image);
  const robotsContent = robots ?? (noindex ? 'noindex,nofollow' : undefined);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {robotsContent ? <meta name="robots" content={robotsContent} /> : null}
      {resolvedUrl ? <link rel="canonical" href={resolvedUrl} /> : null}
      {alternates?.map((alternate) => (
        <link
          key={`${alternate.hrefLang}:${alternate.href}`}
          rel="alternate"
          hrefLang={alternate.hrefLang}
          href={alternate.href}
        />
      ))}
      <meta property="og:type" content={type} />
      {locale ? <meta property="og:locale" content={locale} /> : null}
      {siteName ? <meta property="og:site_name" content={siteName} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {resolvedUrl ? <meta property="og:url" content={resolvedUrl} /> : null}
      {resolvedImage ? <meta property="og:image" content={resolvedImage} /> : null}
      {imageAlt ? <meta property="og:image:alt" content={imageAlt} /> : null}
      {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
      {articleSection ? <meta property="article:section" content={articleSection} /> : null}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {resolvedImage ? <meta name="twitter:image" content={resolvedImage} /> : null}
      {imageAlt ? <meta name="twitter:image:alt" content={imageAlt} /> : null}
      {jsonLd?.map((item, index) => (
        <script
          key={`jsonld:${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Head>
  );
}
