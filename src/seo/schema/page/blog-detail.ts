import type { BlogDetail } from '@/models/blog';
import { ROUTES } from '@/constants';
import type { JsonLd } from '../../meta.types';
import { createBreadcrumbSchema } from '../breadcrumb';
import { createBlogSchema, createFaqPageSchema } from '../blog';

interface BuildBlogDetailJsonLdParams {
  blog: BlogDetail;
  locale: string;
  blogPath: string;
  homeLabel: string;
  blogListLabel: string;
}

export const buildBlogDetailJsonLd = ({
  blog,
  locale,
  blogPath,
  homeLabel,
  blogListLabel,
}: BuildBlogDetailJsonLdParams): JsonLd[] => {
  return [
    createBlogSchema({
      blog,
      path: blogPath,
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
        name: blogListLabel,
        path: `/${locale}${ROUTES.BLOG}`,
      },
      {
        name: blog.title,
        path: blogPath,
      },
    ]),
    blog.faqItems ? createFaqPageSchema(blog.faqItems) : undefined,
  ].filter((item): item is JsonLd => Boolean(item));
};
