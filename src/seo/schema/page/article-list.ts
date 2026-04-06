import type { ArticleListItem } from '@/models/article';
import type { JsonLd } from '../../meta.types';
import { createBreadcrumbSchema } from '../breadcrumb';
import { createArticleCollectionSchema } from '../article';

interface BuildArticleListJsonLdParams {
  articles: ArticleListItem[];
  locale: string;
  pagePath: string;
  homeLabel: string;
  articleListLabel: string;
  pageTitle: string;
  description: string;
}

export const buildArticleListJsonLd = ({
  articles,
  locale,
  pagePath,
  homeLabel,
  articleListLabel,
  pageTitle,
  description,
}: BuildArticleListJsonLdParams): JsonLd[] => {
  return [
    createArticleCollectionSchema({
      articles,
      path: pagePath,
      locale,
      name: pageTitle,
      description,
    }),
    createBreadcrumbSchema([
      {
        name: homeLabel,
        path: `/${locale}`,
      },
      {
        name: articleListLabel,
        path: pagePath,
      },
    ]),
  ].filter((item): item is JsonLd => Boolean(item));
};
