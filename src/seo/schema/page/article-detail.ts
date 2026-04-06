import type { ArticleDetail } from '@/models/article';
import type { JsonLd } from '../../meta.types';
import { createBreadcrumbSchema } from '../breadcrumb';
import { createArticleSchema, createFaqPageSchema } from '../article';

interface BuildArticleDetailJsonLdParams {
  article: ArticleDetail;
  locale: string;
  articlePath: string;
  homeLabel: string;
  articleListLabel: string;
}

export const buildArticleDetailJsonLd = ({
  article,
  locale,
  articlePath,
  homeLabel,
  articleListLabel,
}: BuildArticleDetailJsonLdParams): JsonLd[] => {
  return [
    createArticleSchema({
      article,
      path: articlePath,
      locale,
      publisherName: process.env.NEXT_PUBLIC_SITE_NAME,
      publisherLogo: process.env.NEXT_PUBLIC_SITE_LOGO_URL || '/android-chrome-512x512.png',
    }),
    createBreadcrumbSchema([
      {
        name: homeLabel,
        path: `/${locale}`,
      },
      {
        name: articleListLabel,
        path: `/${locale}/articles`,
      },
      {
        name: article.title,
        path: articlePath,
      },
    ]),
    article.faqItems ? createFaqPageSchema(article.faqItems) : undefined,
  ].filter((item): item is JsonLd => Boolean(item));
};
