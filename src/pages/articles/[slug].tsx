import { css } from '@emotion/react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { AppBar, DesktopAppBar, Layout, Text } from '@/components';
import { ROUTES } from '@/constants';
import { getLocalizedArticleBySlug } from '@/data/articles';
import { I18nLink as Link, useCurrentLocale } from '@/i18n/navigation';
import { withI18nGssp } from '@/i18n/page-props';
import { defaultLocale, locales, type Locale } from '@/i18n/routing';
import type { ArticleDetail } from '@/models/article';
import { Meta, buildArticleDetailJsonLd, createPageMeta, toIsoMetaDateTime } from '@/seo';
import { theme } from '@/styles';
import { useMediaQuery } from '@/hooks';
import { useTranslations } from 'next-intl';

interface ArticleDetailPageProps {
  article: ArticleDetail;
}

const ARTICLE_CONTENT_MAX_WIDTH = '980px';
const ARTICLE_FAQ_SECTION_ID = 'section-faq';

const resolveLocale = (localeHeader: string | string[] | undefined): Locale => {
  const candidate = Array.isArray(localeHeader) ? localeHeader[0] : localeHeader;

  if (candidate && locales.includes(candidate as Locale)) {
    return candidate as Locale;
  }

  return defaultLocale;
};

const formatArticleDate = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));

export default function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  const router = useRouter();
  const t = useTranslations('article');
  const tCommon = useTranslations('common');
  const currentLocale = useCurrentLocale();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const articlePath = `/${currentLocale}${ROUTES.ARTICLE_DETAIL(article.slug)}`;
  const jsonLd = buildArticleDetailJsonLd({
    article,
    locale: currentLocale,
    articlePath,
    homeLabel: tCommon('app.name'),
    articleListLabel: t('title'),
  });
  const meta = createPageMeta({
    pageTitle: article.title,
    description: article.seoDescription,
    path: articlePath,
    image: article.coverImage,
    imageAlt: article.coverImageAlt || article.title,
    type: 'article',
    locale: currentLocale,
    publishedTime: toIsoMetaDateTime(article.publishedAt),
    modifiedTime: toIsoMetaDateTime(article.modifiedAt ?? article.publishedAt),
    articleSection: article.category,
    jsonLd,
  });
  const tocEntries = article.faqItems?.length
    ? [...article.sections.map((section) => section.heading), t('detail.faqTitle')]
    : article.sections.map((section) => section.heading);

  return (
    <>
      <Meta {...meta} />
      <Layout
        isAppBarExist={false}
        title={article.title}
        scrollMode="page"
        style={{ backgroundColor: theme.colors.bg_surface1 }}
      >
        <div css={page}>
          {isDesktop ? (
            <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
          ) : (
            <AppBar
              leftButton
              buttonType="dark"
              onBackClick={() => router.push(`/${currentLocale}${ROUTES.ARTICLES}`)}
              backgroundColor="bg_surface1"
            />
          )}

          <article css={articleLayout}>
            <div css={topBar}>
              <Link href={ROUTES.ARTICLES} css={backLink}>
                <Text typo="button_M" color="primary50">
                  {t('detail.backToList')}
                </Text>
              </Link>
            </div>

            <header css={heroHeader}>
              <div css={categoryBadge}>
                <Text typo="body_S" color="primary50">
                  {article.category}
                </Text>
              </div>

              <Text tag="h1" typo="title_XL" color="text_primary" css={heroTitle}>
                {article.title}
              </Text>

              <Text typo="body_L" color="text_secondary" css={heroExcerpt}>
                {article.excerpt}
              </Text>

              <div css={heroMeta}>
                <div css={authorBlock}>
                  <div css={authorAvatar}>O</div>
                  <div css={authorCopy}>
                    <Text typo="body_S" color="text_primary">
                      {t('detail.editor')}
                    </Text>
                    <Text typo="body_S" color="text_tertiary">
                      {t('detail.published', {
                        date: formatArticleDate(article.publishedAt, currentLocale),
                      })}
                    </Text>
                  </div>
                </div>

                <div css={readingPill}>
                  <Text typo="body_S" color="text_tertiary">
                    {t('detail.readingTime', { minutes: article.readingMinutes })}
                  </Text>
                </div>
              </div>
            </header>

            <div css={heroFigure}>
              <div css={heroImage(article.coverImage)} aria-hidden="true" />
            </div>

            <div css={articleBodyLayout}>
              <aside css={sideRail}>
                <div css={sideRailInner}>
                  <Text typo="body_S" color="primary50">
                    {t('detail.onThisPage')}
                  </Text>
                  <ol css={tocList}>
                    {tocEntries.map((label, index) => (
                      <li key={label}>
                        <a
                          href={
                            index < article.sections.length
                              ? `#section-${index + 1}`
                              : `#${ARTICLE_FAQ_SECTION_ID}`
                          }
                          css={tocLink}
                        >
                          <span css={tocNumber}>{String(index + 1).padStart(2, '0')}</span>
                          <span>{label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>

              <div css={bodyContent}>
                {article.sections.map((section, index) => (
                  <section key={section.heading} id={`section-${index + 1}`} css={sectionBlock}>
                    <div css={sectionMarker}>
                      <span css={sectionNumber}>{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <div css={sectionMain}>
                      <Text tag="h2" typo="title_L" color="text_primary" css={sectionHeading}>
                        {section.heading}
                      </Text>
                      {section.images && section.images.length > 0 && (
                        <div css={sectionImageGrid}>
                          {section.images.map((image) => (
                            <figure
                              key={`${section.heading}-${image.src}`}
                              css={sectionImageFigure}
                            >
                              <img
                                src={image.src}
                                alt={image.alt}
                                loading="lazy"
                                css={sectionImage}
                              />
                              {image.caption ? (
                                <figcaption css={sectionImageCaption}>
                                  <Text typo="body_S" color="text_tertiary">
                                    {image.caption}
                                  </Text>
                                </figcaption>
                              ) : null}
                            </figure>
                          ))}
                        </div>
                      )}
                      <div css={paragraphGroup}>
                        {section.paragraphs.map((paragraph) => (
                          <Text
                            key={paragraph}
                            tag="p"
                            typo="body_M"
                            color="text_secondary"
                            css={paragraphText}
                          >
                            {paragraph}
                          </Text>
                        ))}
                      </div>
                      {section.bullets && section.bullets.length > 0 && (
                        <ul css={bulletList}>
                          {section.bullets.map((bullet) => (
                            <li key={bullet}>
                              <Text typo="body_M" color="text_secondary">
                                {bullet}
                              </Text>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                ))}
                {article.faqItems && article.faqItems.length > 0 && (
                  <section id={ARTICLE_FAQ_SECTION_ID} css={sectionBlock}>
                    <div css={sectionMarker}>
                      <span css={sectionNumber}>
                        {String(article.sections.length + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div css={sectionMain}>
                      <Text tag="h2" typo="title_L" color="text_primary" css={sectionHeading}>
                        {t('detail.faqTitle')}
                      </Text>
                      <div css={faqList}>
                        {article.faqItems.map((item) => (
                          <div key={item.question} css={faqCard}>
                            <Text tag="h3" typo="title_S" color="text_primary" css={faqQuestion}>
                              {item.question}
                            </Text>
                            <Text tag="p" typo="body_M" color="text_secondary" css={faqAnswer}>
                              {item.answer}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>

            <footer css={articleFooter}>
              <div css={footerCard}>
                <Text typo="body_S" color="primary50">
                  {t('detail.footerEyebrow')}
                </Text>
                <Text typo="title_M" color="text_primary">
                  {t('detail.footerTitle')}
                </Text>
                <Text typo="body_M" color="text_secondary" css={footerDescription}>
                  {t('detail.footerDescription')}
                </Text>
                <Link href={ROUTES.ARTICLES} css={footerLink}>
                  <Text typo="button_M" color="white">
                    {t('detail.backToList')}
                  </Text>
                </Link>
              </div>
            </footer>
          </article>
        </div>
      </Layout>
    </>
  );
}

const page = css`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  background:
    radial-gradient(circle at top, rgba(208, 230, 219, 0.38), transparent 32%),
    linear-gradient(180deg, #fbfaf6 0%, ${theme.colors.bg_surface1} 28%, #f6f4ee 100%);
`;

const articleLayout = css`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 88px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 42px 32px 120px;
  }
`;

const topBar = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: flex;
    margin-bottom: 22px;
  }
`;

const backLink = css`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
`;

const heroHeader = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: ${ARTICLE_CONTENT_MAX_WIDTH};
  margin: 0 auto;

  @media (min-width: ${theme.breakpoints.desktop}) {
    gap: 20px;
  }
`;

const categoryBadge = css`
  display: inline-flex;
  align-self: flex-start;
  padding: 8px 14px;
  border: 1px solid rgba(71, 97, 85, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
`;

const heroTitle = css`
  margin: 0;
  font-size: 34px;
  line-height: 1.18;
  letter-spacing: -0.02em;

  @media (min-width: ${theme.breakpoints.desktop}) {
    font-size: 52px;
  }
`;

const heroExcerpt = css`
  max-width: 100%;
  line-height: 1.82;
  font-size: 17px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    font-size: 20px;
  }
`;

const heroMeta = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 6px;
  border-top: 1px solid rgba(71, 97, 85, 0.12);
`;

const authorBlock = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const authorAvatar = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary50}, #6d8d80);
  color: ${theme.colors.white};
  ${theme.typo.body8};
  font-weight: 600;
`;

const authorCopy = css`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const readingPill = css`
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
`;

const heroFigure = css`
  width: 100%;
  max-width: ${ARTICLE_CONTENT_MAX_WIDTH};
  margin: 28px auto 0;
`;

const heroImage = (imageUrl: string) => css`
  min-height: 260px;
  border-radius: 36px;
  background:
    linear-gradient(180deg, rgba(35, 26, 0, 0.02), rgba(35, 26, 0, 0.18)),
    url(${imageUrl}) center / cover no-repeat;
  box-shadow: 0 24px 50px rgba(73, 69, 58, 0.12);

  @media (min-width: ${theme.breakpoints.desktop}) {
    min-height: 520px;
  }
`;

const articleBodyLayout = css`
  display: block;
  width: 100%;
  max-width: ${ARTICLE_CONTENT_MAX_WIDTH};
  margin: 34px auto 0;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: grid;
    grid-template-columns: 220px minmax(0, 720px);
    justify-content: space-between;
    gap: 40px;
    align-items: start;
  }
`;

const sideRail = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
    position: sticky;
    top: 110px;
  }
`;

const sideRailInner = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 0 0;
`;

const tocList = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const tocLink = css`
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 10px;
  color: ${theme.colors.text_tertiary};
  text-decoration: none;
  ${theme.typo.body10};

  &:hover {
    color: ${theme.colors.primary50};
  }
`;

const tocNumber = css`
  color: rgba(71, 97, 85, 0.64);
`;

const bodyContent = css`
  display: flex;
  flex-direction: column;
  gap: 44px;
`;

const sectionBlock = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  scroll-margin-top: 100px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 22px;
  }
`;

const sectionMarker = css`
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
`;

const sectionNumber = css`
  color: rgba(71, 97, 85, 0.48);
  ${theme.typo.body8};
  font-size: 18px;
  line-height: 1;
`;

const sectionMain = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const sectionHeading = css`
  margin: 0;
  line-height: 1.34;
`;

const sectionImageGrid = css`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const sectionImageFigure = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
`;

const sectionImage = css`
  display: block;
  width: 100%;
  height: auto;
  border-radius: 24px;
  border: 1px solid rgba(71, 97, 85, 0.1);
  background: ${theme.colors.white};
  box-shadow: 0 14px 32px rgba(73, 69, 58, 0.08);
`;

const sectionImageCaption = css`
  line-height: 1.7;
`;

const paragraphGroup = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const paragraphText = css`
  line-height: 2;
  font-size: 16px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    font-size: 17px;
  }
`;

const bulletList = css`
  display: grid;
  gap: 12px;
  padding: 20px 0 0 22px;
  margin: 0;
  border-top: 1px solid rgba(71, 97, 85, 0.1);

  li {
    color: ${theme.colors.text_secondary};
    line-height: 1.9;
  }
`;

const faqList = css`
  display: grid;
  gap: 14px;
`;

const faqCard = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 22px;
  border: 1px solid rgba(71, 97, 85, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
`;

const faqQuestion = css`
  margin: 0;
  line-height: 1.45;
`;

const faqAnswer = css`
  line-height: 1.9;
`;

const articleFooter = css`
  width: 100%;
  max-width: ${ARTICLE_CONTENT_MAX_WIDTH};
  margin: 64px auto 0;
`;

const footerCard = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid rgba(71, 97, 85, 0.12);
  border-radius: 30px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(240, 245, 241, 0.92)),
    ${theme.colors.white};
  box-shadow: 0 18px 40px rgba(73, 69, 58, 0.08);
`;

const footerDescription = css`
  line-height: 1.8;
`;

const footerLink = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: ${theme.colors.primary50};
  text-decoration: none;
`;

export const getServerSideProps: GetServerSideProps<ArticleDetailPageProps> =
  withI18nGssp<ArticleDetailPageProps>(
    async ({ params, req }) => {
      const slugParam = params?.slug;
      const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

      if (!slug) {
        return { notFound: true };
      }

      const locale = resolveLocale(req.headers['x-locale']);
      const article = getLocalizedArticleBySlug(slug, locale);

      if (!article) {
        return { notFound: true };
      }

      return {
        props: {
          article,
        },
      };
    },
    ['article']
  );
