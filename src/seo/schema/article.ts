import { ROUTES } from '@/constants';
import type {
  ArticleDetail,
  ArticleFaqItem,
  ArticleListItem,
  ArticleSection,
} from '@/models/article';
import { toIsoMetaDateTime } from '../meta.utils';
import type { JsonLd } from '../meta.types';
import {
  buildSchemaId,
  getSchemaContext,
  normalizeSchemaImages,
  normalizeSchemaString,
  toAbsoluteSchemaUrl,
} from './shared';

const countWords = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length;

const buildArticleBody = (
  article: Pick<ArticleDetail, 'excerpt' | 'summaryItems' | 'sections'>
) => {
  const content = [
    article.excerpt,
    ...(article.summaryItems ?? []).flatMap((item) => [item.title, item.description]),
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .join('\n\n');

  return content || undefined;
};

const buildPublisher = ({ name, logo }: { name?: string; logo?: string }): JsonLd | undefined => {
  const normalizedName = normalizeSchemaString(name);
  const resolvedLogo = toAbsoluteSchemaUrl(logo);

  if (!normalizedName && !resolvedLogo) {
    return undefined;
  }

  return {
    '@type': 'Organization',
    name: normalizedName,
    logo: resolvedLogo
      ? {
          '@type': 'ImageObject',
          url: resolvedLogo,
        }
      : undefined,
  };
};

const buildItemListElement = (articles: ArticleListItem[], locale: string) => {
  const items = articles
    .map((article, index) => {
      const name = normalizeSchemaString(article.title);
      const url = toAbsoluteSchemaUrl(`/${locale}${ROUTES.ARTICLE_DETAIL(article.slug)}`);

      if (!name || !url) {
        return undefined;
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        name,
        url,
      };
    })
    .filter(
      (
        item
      ): item is {
        '@type': 'ListItem';
        position: number;
        name: string;
        url: string;
      } => Boolean(item)
    );

  return items.length > 0
    ? {
        '@type': 'ItemList',
        itemListElement: items,
      }
    : undefined;
};

const buildKeywords = (article: Pick<ArticleDetail, 'keywords'>) => {
  const keywords = (article.keywords ?? []).map((item) => item.trim()).filter(Boolean);
  return keywords.length > 0 ? keywords : undefined;
};

const buildAbout = (sections: ArticleSection[]) => {
  const items = Array.from(
    new Set(sections.map((section) => section.heading.trim()).filter(Boolean))
  ).map((name) => ({
    '@type': 'Thing',
    name,
  }));

  return items.length > 0 ? items : undefined;
};

export const createArticleSchema = ({
  article,
  path,
  locale,
  publisherName,
  publisherLogo,
}: {
  article: ArticleDetail;
  path: string;
  locale: string;
  publisherName?: string;
  publisherLogo?: string;
}): JsonLd | undefined => {
  const url = toAbsoluteSchemaUrl(path);
  const headline = normalizeSchemaString(article.title);
  const description =
    normalizeSchemaString(article.seoDescription) || normalizeSchemaString(article.excerpt);
  const images = normalizeSchemaImages([article.coverImage]);
  const articleBody = buildArticleBody(article);
  const publisher = buildPublisher({
    name: publisherName,
    logo: publisherLogo,
  });

  if (!url || !headline || !description) {
    return undefined;
  }

  return {
    '@context': getSchemaContext(),
    '@type': 'BlogPosting',
    '@id': buildSchemaId(path, 'article') ?? url,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline,
    description,
    image: images,
    thumbnailUrl: images?.[0],
    datePublished: toIsoMetaDateTime(article.publishedAt),
    dateModified: toIsoMetaDateTime(article.modifiedAt ?? article.publishedAt),
    author: publisher,
    publisher,
    inLanguage: normalizeSchemaString(locale),
    articleSection: normalizeSchemaString(article.category),
    genre: normalizeSchemaString(article.category),
    timeRequired: article.readingMinutes > 0 ? `PT${article.readingMinutes}M` : undefined,
    wordCount: articleBody ? countWords(articleBody) : undefined,
    isAccessibleForFree: true,
    keywords: buildKeywords(article),
    about: buildAbout(article.sections),
    articleBody,
  };
};

export const createArticleCollectionSchema = ({
  articles,
  path,
  locale,
  name,
  description,
}: {
  articles: ArticleListItem[];
  path: string;
  locale: string;
  name: string;
  description: string;
}): JsonLd | undefined => {
  const url = toAbsoluteSchemaUrl(path);
  const normalizedName = normalizeSchemaString(name);
  const normalizedDescription = normalizeSchemaString(description);

  if (!url || !normalizedName || !normalizedDescription) {
    return undefined;
  }

  return {
    '@context': getSchemaContext(),
    '@type': 'CollectionPage',
    '@id': buildSchemaId(path, 'collection') ?? url,
    url,
    name: normalizedName,
    description: normalizedDescription,
    inLanguage: normalizeSchemaString(locale),
    mainEntity: buildItemListElement(articles, locale),
  };
};

export const createFaqPageSchema = (faqItems: ArticleFaqItem[]): JsonLd | undefined => {
  const mainEntity = faqItems
    .map((item) => {
      const question = normalizeSchemaString(item.question);
      const answer = normalizeSchemaString(item.answer);

      if (!question || !answer) {
        return undefined;
      }

      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      };
    })
    .filter(
      (
        item
      ): item is {
        '@type': 'Question';
        name: string;
        acceptedAnswer: {
          '@type': 'Answer';
          text: string;
        };
      } => Boolean(item)
    );

  if (mainEntity.length === 0) {
    return undefined;
  }

  return {
    '@context': getSchemaContext(),
    '@type': 'FAQPage',
    mainEntity,
  };
};
