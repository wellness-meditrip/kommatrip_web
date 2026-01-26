export type TwitterCardType = 'summary' | 'summary_large_image';

export interface MetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
  noindex?: boolean;
  twitterCard?: TwitterCardType;
  imageAlt?: string;
}
