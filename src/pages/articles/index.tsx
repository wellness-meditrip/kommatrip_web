import { css } from '@emotion/react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { AppBar, DesktopAppBar, Empty, Layout, Text } from '@/components';
import { ROUTES } from '@/constants';
import { getLocalizedArticles } from '@/data/articles';
import { I18nLink as Link, useCurrentLocale } from '@/i18n/navigation';
import { resolveI18nLocale, withI18nGssp } from '@/i18n/page-props';
import type { Locale } from '@/i18n/routing';
import type { ArticleListItem } from '@/models/article';
import { Meta, buildArticleListJsonLd, createPageMeta } from '@/seo';
import { theme } from '@/styles';
import { useMediaQuery } from '@/hooks';
import { useTranslations } from 'next-intl';

interface ArticlesPageProps {
  articles: ArticleListItem[];
}

const formatArticleDate = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

export default function ArticlesPage({ articles }: ArticlesPageProps) {
  const t = useTranslations('article');
  const tCommon = useTranslations('common');
  const currentLocale = useCurrentLocale();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const articleListPath = `/${currentLocale}${ROUTES.ARTICLES}`;
  const jsonLd =
    articles.length > 0
      ? buildArticleListJsonLd({
          articles,
          locale: currentLocale,
          pagePath: articleListPath,
          homeLabel: tCommon('app.name'),
          articleListLabel: t('title'),
          pageTitle: t('list.title'),
          description: t('list.description'),
        })
      : undefined;
  const meta = createPageMeta({
    pageTitle: t('title'),
    description: t('list.description'),
    path: articleListPath,
    image: articles[0]?.coverImage || '/og/OG_image.jpg',
    imageAlt: articles[0]?.title,
    locale: currentLocale,
    jsonLd,
  });

  return (
    <>
      <Meta {...meta} />
      <Layout
        isAppBarExist={false}
        title={t('title')}
        style={{ backgroundColor: theme.colors.bg_surface1 }}
      >
        <div css={page}>
          {isDesktop ? (
            <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
          ) : (
            <AppBar logo="dark" backgroundColor="bg_surface1" />
          )}

          <section css={heroSection}>
            <Text typo="body_S" color="primary50">
              {t('list.eyebrow')}
            </Text>
            <Text tag="h1" typo="title_XL" color="text_primary" css={heroTitle}>
              {t('list.title')}
            </Text>
            <Text typo="body_M" color="text_secondary" css={heroDescription}>
              {t('list.description')}
            </Text>
          </section>

          <section css={contentSection}>
            {articles.length === 0 ? (
              <div css={emptyState}>
                <Empty title={t('list.empty')} />
              </div>
            ) : (
              <div css={articleGrid}>
                {articles.map((article, index) => (
                  <Link
                    key={article.slug}
                    href={ROUTES.ARTICLE_DETAIL(article.slug)}
                    css={articleCard}
                  >
                    <div css={cardImageFrame}>
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        priority={index === 0}
                        fetchPriority={index === 0 ? 'high' : undefined}
                        sizes={`(min-width: ${theme.breakpoints.desktop}) 352px, 100vw`}
                        css={cardImage}
                      />
                      <div css={cardImageOverlay} aria-hidden="true" />
                    </div>
                    <div css={cardBody}>
                      <div css={metaRow}>
                        <Text typo="body_S" color="primary50">
                          {article.category}
                        </Text>
                        <Text typo="body_S" color="text_tertiary">
                          {formatArticleDate(article.publishedAt, currentLocale)}
                        </Text>
                      </div>
                      <Text tag="h2" typo="title_M" color="text_primary" css={cardTitle}>
                        {article.title}
                      </Text>
                      <Text typo="body_M" color="text_secondary" css={cardExcerpt}>
                        {article.excerpt}
                      </Text>
                      <div css={cardFooter}>
                        <Text typo="body_S" color="text_tertiary">
                          {t('detail.readingTime', { minutes: article.readingMinutes })}
                        </Text>
                        <Text typo="button_M" color="primary50">
                          {t('list.readMore')}
                        </Text>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </Layout>
    </>
  );
}

const page = css`
  min-height: 100dvh;
  background: ${theme.colors.bg_surface1};
`;

const heroSection = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px 20px 8px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 56px 32px 12px;
  }
`;

const heroTitle = css`
  margin: 0;
`;

const heroDescription = css`
  max-width: 640px;
`;

const contentSection = css`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 12px 20px 64px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 20px 32px 88px;
  }
`;

const emptyState = css`
  padding: 32px 0;
`;

const articleGrid = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const articleCard = css`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 100%;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 24px;
  background: ${theme.colors.white};
  box-shadow: 0 12px 28px ${theme.colors.grayOpacity50};
  text-decoration: none;
`;

const cardImageFrame = css`
  position: relative;
  width: 100%;
  min-height: 188px;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(35, 26, 0, 0.08), rgba(35, 26, 0, 0.18));
`;

const cardImage = css`
  object-fit: cover;
`;

const cardImageOverlay = css`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(35, 26, 0, 0.08), rgba(35, 26, 0, 0.18));
  pointer-events: none;
`;

const cardBody = css`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
`;

const metaRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const cardTitle = css`
  margin: 0;
`;

const cardExcerpt = css`
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 1.7;
`;

const cardFooter = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 6px;
`;

export const getServerSideProps: GetServerSideProps<ArticlesPageProps> =
  withI18nGssp<ArticlesPageProps>(
    async (context) => {
      const locale = resolveI18nLocale(context);

      return {
        props: {
          articles: getLocalizedArticles(locale),
        },
      };
    },
    ['article']
  );
