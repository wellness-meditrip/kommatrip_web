export { routing, defaultLocale, locales, type Locale, type ContentLocale } from './routing';
export { getMergedMessages } from './getMergedMessages';
export { getI18nConfig, detectLocale } from './request';
export { I18nLink as Link, useChangeLocale, useCurrentLocale } from './navigation';
export {
  getAdminI18nStaticProps,
  getPrivateI18nServerSideProps,
  getPublicUtilityI18nStaticProps,
  getSystemI18nStaticProps,
  withI18nGsp,
  withI18nGssp,
  type I18nPageProps,
} from './page-props';
