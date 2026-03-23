export type TwitterCardType = 'summary' | 'summary_large_image';

export interface MetaAlternate {
  href: string;
  hrefLang: string;
}

export type JsonLd = Record<string, unknown>;

export interface MetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
  noindex?: boolean;
  robots?: string;
  twitterCard?: TwitterCardType;
  imageAlt?: string;
  alternates?: MetaAlternate[];
  jsonLd?: JsonLd[];
}
