import type { BlogListItem } from '@/models/blog';
import type { JsonLd } from '../../meta.types';
import { createBreadcrumbSchema } from '../breadcrumb';
import { createBlogCollectionSchema } from '../blog';

interface BuildBlogListJsonLdParams {
  blogs: BlogListItem[];
  locale: string;
  pagePath: string;
  homeLabel: string;
  blogListLabel: string;
  pageTitle: string;
  description: string;
}

export const buildBlogListJsonLd = ({
  blogs,
  locale,
  pagePath,
  homeLabel,
  blogListLabel,
  pageTitle,
  description,
}: BuildBlogListJsonLdParams): JsonLd[] => {
  return [
    createBlogCollectionSchema({
      blogs,
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
        name: blogListLabel,
        path: pagePath,
      },
    ]),
  ].filter((item): item is JsonLd => Boolean(item));
};
