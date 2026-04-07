import type { Locale } from '@/i18n';

export interface BlogSectionImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  images?: BlogSectionImage[];
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogTranslation {
  category: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  coverImageAlt?: string;
  keywords?: string[];
  faqItems?: BlogFaqItem[];
  sections: BlogSection[];
}

export interface BlogRecord {
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  readingMinutes: number;
  coverImage: string;
  translations: Record<Locale, BlogTranslation>;
}

export interface BlogListItem {
  slug: string;
  publishedAt: string;
  readingMinutes: number;
  coverImage: string;
  category: string;
  title: string;
  excerpt: string;
}

export interface BlogDetail extends BlogListItem {
  seoDescription: string;
  modifiedAt?: string;
  coverImageAlt?: string;
  keywords?: string[];
  faqItems?: BlogFaqItem[];
  sections: BlogSection[];
}
