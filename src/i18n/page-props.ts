import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { getI18nConfig } from './request';
import { routing, type Locale } from './routing';

export interface I18nPageProps {
  locale: Locale;
  messages: Record<string, unknown>;
}

const resolveLocaleFromPath = (path?: string): Locale => {
  const firstSegment = path?.split('/').filter(Boolean)[0];
  if (firstSegment && routing.locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return routing.defaultLocale;
};

const resolveLocale = (context: GetServerSidePropsContext | GetStaticPropsContext): Locale => {
  const localeFromContext = context.locale;
  if (localeFromContext && routing.locales.includes(localeFromContext as Locale)) {
    return localeFromContext as Locale;
  }

  if ('resolvedUrl' in context && typeof context.resolvedUrl === 'string') {
    return resolveLocaleFromPath(context.resolvedUrl);
  }

  return routing.defaultLocale;
};

export const withI18nGssp = <P extends Record<string, unknown>>(
  handler: (
    context: GetServerSidePropsContext
  ) => Promise<GetServerSidePropsResult<P>> | GetServerSidePropsResult<P>
): GetServerSideProps<P & I18nPageProps> => {
  return async (context) => {
    const result = await handler(context);
    if (!('props' in result)) return result;

    const locale = resolveLocale(context);
    const { messages } = await getI18nConfig(locale);
    const resolvedProps = await result.props;

    return {
      ...result,
      props: {
        ...resolvedProps,
        locale,
        messages,
      },
    };
  };
};

export const withI18nGsp = <P extends Record<string, unknown>>(
  handler: (
    context: GetStaticPropsContext
  ) => Promise<GetStaticPropsResult<P>> | GetStaticPropsResult<P>
): GetStaticProps<P & I18nPageProps> => {
  return async (context) => {
    const result = await handler(context);
    if (!('props' in result)) return result;

    const locale = resolveLocale(context);
    const { messages } = await getI18nConfig(locale);
    const resolvedProps = await result.props;

    return {
      ...result,
      props: {
        ...resolvedProps,
        locale,
        messages,
      },
    };
  };
};
