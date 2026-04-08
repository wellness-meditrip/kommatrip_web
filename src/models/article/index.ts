import type { Locale } from '@/i18n';

export interface ArticleSectionImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  images?: ArticleSectionImage[];
}

export interface ArticleSummaryItem {
  title: string;
  description: string;
}

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface ArticleTranslation {
  category: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  coverImageAlt?: string;
  keywords?: string[];
  summaryItems?: ArticleSummaryItem[];
  faqItems?: ArticleFaqItem[];
  sections: ArticleSection[];
}

export interface ArticleRecord {
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  readingMinutes: number;
  coverImage: string;
  translations: Record<Locale, ArticleTranslation>;
}

export interface ArticleListItem {
  slug: string;
  publishedAt: string;
  readingMinutes: number;
  coverImage: string;
  category: string;
  title: string;
  excerpt: string;
}

export interface ArticleDetail extends ArticleListItem {
  seoDescription: string;
  modifiedAt?: string;
  coverImageAlt?: string;
  keywords?: string[];
  summaryItems?: ArticleSummaryItem[];
  faqItems?: ArticleFaqItem[];
  sections: ArticleSection[];
}
