import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { DehydratedState } from '@tanstack/react-query';
import { getI18nConfig } from './request';
import { routing, type Locale } from './routing';
import { MESSAGE_NAMESPACES, type MessageNamespace } from './namespaces';
import { PAGE_POLICIES, resolvePagePolicy, type PagePolicyName } from '@/seo/page-policy';

export interface I18nPageProps {
  locale: Locale;
  messages: Record<string, unknown>;
  dehydratedState?: DehydratedState;
  pagePolicy: PagePolicyName;
}

export interface I18nPageOptions {
  pagePolicy?: PagePolicyName;
}

export const GLOBAL_I18N_NAMESPACES: readonly MessageNamespace[] = [
  'common',
  'error',
  'chatbot',
  'header',
  'footer',
  'auth',
  'validation',
];

const MESSAGE_NAMESPACE_SET = new Set<string>(MESSAGE_NAMESPACES as readonly string[]);

const toRootNamespace = (namespace: string): string => {
  const [root] = namespace.split('.');
  return root ?? namespace;
};

export const normalizeI18nNamespaces = (namespaces?: readonly string[]): MessageNamespace[] => {
  const required = new Set<MessageNamespace>(GLOBAL_I18N_NAMESPACES);

  if (!namespaces || namespaces.length === 0) {
    return [...required];
  }

  for (const namespace of namespaces) {
    const normalized = toRootNamespace(namespace.trim());
    if (!normalized) continue;
    if (MESSAGE_NAMESPACE_SET.has(normalized)) {
      required.add(normalized as MessageNamespace);
    }
  }

  return [...required];
};

const pickMessages = (
  allMessages: Record<string, unknown>,
  namespaces: readonly MessageNamespace[]
): Record<string, unknown> => {
  const picked: Record<string, unknown> = {};

  for (const namespace of namespaces) {
    const message = allMessages[namespace];
    if (message) {
      picked[namespace] = message;
    }
  }

  return picked;
};

const resolveLocaleFromPath = (path?: string): Locale => {
  const firstSegment = path?.split('/').filter(Boolean)[0];
  if (firstSegment && routing.locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return routing.defaultLocale;
};

const resolveLocaleFromHeader = (context: GetServerSidePropsContext): Locale | null => {
  const headerValue = context.req.headers['x-locale'];
  const localeFromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (localeFromHeader && routing.locales.includes(localeFromHeader as Locale)) {
    return localeFromHeader as Locale;
  }

  return null;
};

export const resolveI18nLocale = (
  context: GetServerSidePropsContext | GetStaticPropsContext
): Locale => {
  if ('req' in context) {
    const localeFromHeader = resolveLocaleFromHeader(context);
    if (localeFromHeader) {
      return localeFromHeader;
    }
  }

  const localeFromContext = context.locale;
  if (localeFromContext && routing.locales.includes(localeFromContext as Locale)) {
    return localeFromContext as Locale;
  }

  if ('resolvedUrl' in context && typeof context.resolvedUrl === 'string') {
    return resolveLocaleFromPath(context.resolvedUrl);
  }

  return routing.defaultLocale;
};

const applyCacheControl = (
  context: GetServerSidePropsContext | GetStaticPropsContext,
  pagePolicyName: PagePolicyName
) => {
  if (!('res' in context)) return;
  const finalCacheControl = PAGE_POLICIES[pagePolicyName].cacheControl;
  if (!finalCacheControl) return;
  context.res.setHeader('Cache-Control', finalCacheControl);
};

const resolveContextPolicy = (
  context: GetServerSidePropsContext | GetStaticPropsContext
): PagePolicyName => {
  if ('resolvedUrl' in context && typeof context.resolvedUrl === 'string') {
    return resolvePagePolicy(context.resolvedUrl).name;
  }

  return 'public-discovery';
};

export const withI18nGssp = <P extends object>(
  handler: (
    context: GetServerSidePropsContext
  ) => Promise<GetServerSidePropsResult<P>> | GetServerSidePropsResult<P>,
  namespaces?: readonly string[],
  options?: I18nPageOptions
): GetServerSideProps<P & I18nPageProps> => {
  return async (context) => {
    const result = await handler(context);
    if (!('props' in result)) return result;

    const pagePolicy = options?.pagePolicy ?? resolveContextPolicy(context);
    applyCacheControl(context, pagePolicy);
    const locale = resolveI18nLocale(context);
    const requiredNamespaces = normalizeI18nNamespaces(namespaces);
    const { messages: allMessages } = await getI18nConfig(locale, requiredNamespaces);
    const messages = pickMessages(allMessages as Record<string, unknown>, requiredNamespaces);
    const resolvedProps = await result.props;

    return {
      ...result,
      props: {
        ...resolvedProps,
        locale,
        messages,
        pagePolicy,
      },
    };
  };
};

export const withI18nGsp = <P extends object>(
  handler: (
    context: GetStaticPropsContext
  ) => Promise<GetStaticPropsResult<P>> | GetStaticPropsResult<P>,
  namespaces?: readonly string[],
  options?: I18nPageOptions
): GetStaticProps<P & I18nPageProps> => {
  return async (context) => {
    const result = await handler(context);
    if (!('props' in result)) return result;

    const pagePolicy = options?.pagePolicy ?? resolveContextPolicy(context);
    const locale = resolveI18nLocale(context);
    const requiredNamespaces = normalizeI18nNamespaces(namespaces);
    const { messages: allMessages } = await getI18nConfig(locale, requiredNamespaces);
    const messages = pickMessages(allMessages as Record<string, unknown>, requiredNamespaces);
    const resolvedProps = await result.props;

    return {
      ...result,
      props: {
        ...resolvedProps,
        locale,
        messages,
        pagePolicy,
      },
    };
  };
};

/**
 * 번역 리소스만 필요한 정적 페이지용 기본 getStaticProps
 */
export const getI18nStaticProps = (namespaces?: readonly string[], options?: I18nPageOptions) =>
  withI18nGsp(
    async () => {
      return {
        props: {},
      };
    },
    namespaces,
    options
  );

/**
 * 번역 리소스만 필요한 동적 페이지용 기본 getServerSideProps
 */
export const getI18nServerSideProps = (namespaces?: readonly string[], options?: I18nPageOptions) =>
  withI18nGssp(
    async () => {
      return {
        props: {},
      };
    },
    namespaces,
    options
  );

export const getPrivateI18nStaticProps = (namespaces?: readonly string[]) =>
  getI18nStaticProps(namespaces, { pagePolicy: 'private-app' });

export const getPrivateI18nServerSideProps = (namespaces?: readonly string[]) =>
  getI18nServerSideProps(namespaces, { pagePolicy: 'private-app' });

export const getSystemI18nStaticProps = (namespaces?: readonly string[]) =>
  getI18nStaticProps(namespaces, { pagePolicy: 'system' });

export const getAdminI18nStaticProps = (namespaces?: readonly string[]) =>
  getI18nStaticProps(namespaces, { pagePolicy: 'admin' });

export const getPublicUtilityI18nStaticProps = (namespaces?: readonly string[]) =>
  getI18nStaticProps(namespaces, { pagePolicy: 'public-utility' });

export const getPublicUtilityI18nServerSideProps = (namespaces?: readonly string[]) =>
  getI18nServerSideProps(namespaces, { pagePolicy: 'public-utility' });
