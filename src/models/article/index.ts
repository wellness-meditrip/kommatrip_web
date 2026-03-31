import type { Locale } from '@/i18n';

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ArticleTranslation {
  category: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  sections: ArticleSection[];
}

export interface ArticleRecord {
  slug: string;
  publishedAt: string;
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
  sections: ArticleSection[];
}
