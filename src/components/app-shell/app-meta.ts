import { createPageMeta, type MetaProps } from '@/seo';
import { PAGE_POLICIES, type PagePolicyName } from '@/seo/page-policy';

const DEFAULT_APP_META = {
  name: 'kommatrip',
  title: 'Korean Wellness & K-beauty Tours in Seoul',
  description: 'kommatrip is your guide to Korean Wellness & K-beauty tours in Seoul',
} as const;

export function buildResolvedMeta({
  messages,
  routePolicyName,
  path,
  pageMeta,
}: {
  messages: Record<string, unknown>;
  routePolicyName: PagePolicyName;
  path: string;
  pageMeta?: MetaProps;
}): MetaProps {
  const routePolicy = PAGE_POLICIES[routePolicyName];
  const commonMessages = messages.common as
    | {
        app?: {
          name?: string;
          title?: string;
          description?: string;
        };
      }
    | undefined;

  const pageTitle = `${commonMessages?.app?.name || DEFAULT_APP_META.name} | ${commonMessages?.app?.title || DEFAULT_APP_META.title}`;
  const pageDescription = commonMessages?.app?.description || DEFAULT_APP_META.description;
  const baseMeta = createPageMeta({
    pageTitle,
    description: pageDescription,
    path,
    image: '/og/OG_image.jpg',
    policy: routePolicyName,
    noindex: routePolicy.noindex,
  });

  if (!pageMeta) {
    return baseMeta;
  }

  return {
    ...baseMeta,
    ...pageMeta,
    noindex: routePolicy.noindex || pageMeta.noindex,
    robots:
      routePolicy.noindex || pageMeta.noindex
        ? 'noindex,nofollow'
        : (pageMeta.robots ?? baseMeta.robots),
    alternates: pageMeta.alternates ?? baseMeta.alternates,
  };
}
