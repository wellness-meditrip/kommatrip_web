import { routing } from '@/i18n/routing';

export type PagePolicyName =
  | 'public-discovery'
  | 'public-utility'
  | 'private-app'
  | 'admin'
  | 'system';

export interface PagePolicy {
  name: PagePolicyName;
  cacheControl?: string;
  includeAlternates: boolean;
  includeInSitemap: boolean;
  noindex: boolean;
}

export const PAGE_POLICIES: Record<PagePolicyName, PagePolicy> = {
  'public-discovery': {
    name: 'public-discovery',
    cacheControl: 'public, s-maxage=300, stale-while-revalidate=86400',
    includeAlternates: true,
    includeInSitemap: true,
    noindex: false,
  },
  'public-utility': {
    name: 'public-utility',
    cacheControl: 'public, s-maxage=60, stale-while-revalidate=600',
    includeAlternates: false,
    includeInSitemap: false,
    noindex: true,
  },
  'private-app': {
    name: 'private-app',
    cacheControl: 'private, no-store, max-age=0',
    includeAlternates: false,
    includeInSitemap: false,
    noindex: true,
  },
  admin: {
    name: 'admin',
    cacheControl: 'private, no-store, max-age=0',
    includeAlternates: false,
    includeInSitemap: false,
    noindex: true,
  },
  system: {
    name: 'system',
    cacheControl: 'public, s-maxage=3600, stale-while-revalidate=86400',
    includeAlternates: false,
    includeInSitemap: false,
    noindex: true,
  },
};

export const PRIVATE_ROBOTS_PATHS = [
  '/admin',
  '/login',
  '/signup',
  '/interest',
  '/auth/social/callback',
  '/mypage',
  '/reservations',
  '/bookings',
  '/review',
] as const;

const SYSTEM_PATHS = new Set(['/404', '/500', '/_error', '/robots.txt', '/sitemap.xml']);

const normalizePath = (path?: string) => {
  if (!path) return '/';

  const withoutOrigin = path.replace(/^https?:\/\/[^/]+/i, '');
  const withoutHash = withoutOrigin.split('#')[0] ?? withoutOrigin;
  const withoutQuery = withoutHash.split('?')[0] ?? withoutHash;
  const normalized = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const segments = normalized.split('/').filter(Boolean);

  if (segments[0] && routing.locales.includes(segments[0] as (typeof routing.locales)[number])) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '/';
};

const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

const isPrivatePath = (path: string) =>
  PRIVATE_ROBOTS_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const isPublicUtilityPath = (path: string) =>
  path === '/search' || path === '/packages' || /^\/company\/.+\/program$/.test(path);

export const resolvePagePolicy = (path?: string): PagePolicy => {
  const normalizedPath = normalizePath(path);

  if (SYSTEM_PATHS.has(normalizedPath)) {
    return PAGE_POLICIES.system;
  }

  if (isAdminPath(normalizedPath)) {
    return PAGE_POLICIES.admin;
  }

  if (isPrivatePath(normalizedPath)) {
    return PAGE_POLICIES['private-app'];
  }

  if (isPublicUtilityPath(normalizedPath)) {
    return PAGE_POLICIES['public-utility'];
  }

  return PAGE_POLICIES['public-discovery'];
};

export const getLocaleAwarePath = (locale: string, path: string) => {
  const normalized = normalizePath(path);
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
};

export const isIndexablePagePolicy = (pagePolicy: PagePolicy) =>
  !pagePolicy.noindex && pagePolicy.includeInSitemap;
