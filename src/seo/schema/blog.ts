import { ROUTES } from '@/constants';
import type { BlogDetail, BlogFaqItem, BlogListItem, BlogSection } from '@/models/blog';
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

const buildBlogBody = (blog: Pick<BlogDetail, 'excerpt' | 'sections'>) => {
  const content = [
    blog.excerpt,
    ...blog.sections.flatMap((section) => [
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

const buildItemListElement = (blogs: BlogListItem[], locale: string) => {
  const items = blogs
    .map((blog, index) => {
      const name = normalizeSchemaString(blog.title);
      const url = toAbsoluteSchemaUrl(`/${locale}${ROUTES.BLOG_DETAIL(blog.slug)}`);

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

const buildKeywords = (blog: Pick<BlogDetail, 'keywords'>) => {
  const keywords = (blog.keywords ?? []).map((item) => item.trim()).filter(Boolean);
  return keywords.length > 0 ? keywords : undefined;
};

const buildAbout = (sections: BlogSection[]) => {
  const items = Array.from(
    new Set(sections.map((section) => section.heading.trim()).filter(Boolean))
  ).map((name) => ({
    '@type': 'Thing',
    name,
  }));

  return items.length > 0 ? items : undefined;
};

export const createBlogSchema = ({
  blog,
  path,
  locale,
  publisherName,
  publisherLogo,
}: {
  blog: BlogDetail;
  path: string;
  locale: string;
  publisherName?: string;
  publisherLogo?: string;
}): JsonLd | undefined => {
  const url = toAbsoluteSchemaUrl(path);
  const headline = normalizeSchemaString(blog.title);
  const description =
    normalizeSchemaString(blog.seoDescription) || normalizeSchemaString(blog.excerpt);
  const images = normalizeSchemaImages([blog.coverImage]);
  const blogBody = buildBlogBody(blog);
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
    '@id': buildSchemaId(path, 'blog') ?? url,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline,
    description,
    image: images,
    thumbnailUrl: images?.[0],
    datePublished: toIsoMetaDateTime(blog.publishedAt),
    dateModified: toIsoMetaDateTime(blog.modifiedAt ?? blog.publishedAt),
    author: publisher,
    publisher,
    inLanguage: normalizeSchemaString(locale),
    articleSection: normalizeSchemaString(blog.category),
    genre: normalizeSchemaString(blog.category),
    timeRequired: blog.readingMinutes > 0 ? `PT${blog.readingMinutes}M` : undefined,
    wordCount: blogBody ? countWords(blogBody) : undefined,
    isAccessibleForFree: true,
    keywords: buildKeywords(blog),
    about: buildAbout(blog.sections),
    articleBody: blogBody,
  };
};

export const createBlogCollectionSchema = ({
  blogs,
  path,
  locale,
  name,
  description,
}: {
  blogs: BlogListItem[];
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
    mainEntity: buildItemListElement(blogs, locale),
  };
};

export const createFaqPageSchema = (faqItems: BlogFaqItem[]): JsonLd | undefined => {
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
