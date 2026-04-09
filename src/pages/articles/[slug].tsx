import { css } from '@emotion/react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { AppBar, DesktopAppBar, Layout, Text } from '@/components';
import { ROUTES } from '@/constants';
import { getLocalizedArticleBySlug } from '@/data/articles';
import { ArrowDown } from '@/icons';
import { I18nLink as Link, useCurrentLocale } from '@/i18n/navigation';
import { resolveI18nLocale, withI18nGssp } from '@/i18n/page-props';
import type { Locale } from '@/i18n/routing';
import type { ArticleDetail, ArticleSummaryItem } from '@/models/article';
import { Meta, buildArticleDetailJsonLd, createPageMeta, toIsoMetaDateTime } from '@/seo';
import { theme } from '@/styles';
import { useMediaQuery } from '@/hooks';
import { useTranslations } from 'next-intl';

interface ArticleDetailPageProps {
  article: ArticleDetail;
}

const ARTICLE_CONTENT_MAX_WIDTH = '900px';
const ARTICLE_SIDE_RAIL_WIDTH = '220px';
const ARTICLE_SIDE_RAIL_GAP = '40px';
const ARTICLE_LAYOUT_MAX_WIDTH = '1240px';
const ARTICLE_SUMMARY_SECTION_ID = 'section-summary';
const ARTICLE_FAQ_SECTION_ID = 'section-faq';
const SUMMARY_ITEM_FALLBACK_LIMIT = 3;

const formatArticleDate = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));

const formatSectionIndex = (value: number) => String(value).padStart(2, '0');
const formatSectionLabel = (value: number) => `${formatSectionIndex(value)}.`;

const buildSummaryItems = (article: ArticleDetail): ArticleSummaryItem[] => {
  if (article.summaryItems && article.summaryItems.length > 0) {
    return article.summaryItems;
  }

  return article.sections
    .slice(0, SUMMARY_ITEM_FALLBACK_LIMIT)
    .map((section) => ({
      title: section.heading,
      description: section.bullets?.[0] ?? section.paragraphs[0] ?? '',
    }))
    .filter((item) => item.title.trim() && item.description.trim());
};

export default function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  const router = useRouter();
  const t = useTranslations('article');
  const tCommon = useTranslations('common');
  const currentLocale = useCurrentLocale();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const summaryItems = buildSummaryItems(article);
  const summaryLines = summaryItems
    .slice(0, 3)
    .map((item) => item.description.trim())
    .filter(Boolean);
  const leadingSectionCount = summaryItems.length > 0 ? 1 : 0;
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
  const tocEntries = [
    ...(summaryItems.length > 0
      ? [
          {
            id: ARTICLE_SUMMARY_SECTION_ID,
            label: t('detail.summaryTitle'),
          },
        ]
      : []),
    ...article.sections.map((section, index) => ({
      id: `section-${index + 1}`,
      label: section.heading,
    })),
    ...(article.faqItems?.length
      ? [
          {
            id: ARTICLE_FAQ_SECTION_ID,
            label: t('detail.faqTitle'),
          },
        ]
      : []),
  ];

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
              <div css={heroImageFrame}>
                <Image
                  src={article.coverImage}
                  alt={article.coverImageAlt || article.title}
                  fill
                  priority
                  fetchPriority="high"
                  sizes={`(min-width: ${theme.breakpoints.desktop}) ${ARTICLE_CONTENT_MAX_WIDTH}, 100vw`}
                  css={heroImage}
                />
                <div css={heroImageOverlay} aria-hidden="true" />
              </div>
            </div>

            <div css={articleBodyLayout}>
              <aside css={sideRail}>
                <div css={sideRailInner}>
                  <Text typo="body_S" color="primary50">
                    {t('detail.onThisPage')}
                  </Text>
                  <ol css={tocList}>
                    {tocEntries.map((entry, index) => (
                      <li key={entry.id}>
                        <a href={`#${entry.id}`} css={tocLink}>
                          <span css={tocNumber}>{formatSectionIndex(index + 1)}</span>
                          <span>{entry.label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>

              <div css={bodyContent}>
                {summaryItems.length > 0 && (
                  <section id={ARTICLE_SUMMARY_SECTION_ID} css={sectionBlock}>
                    <div css={sectionMain}>
                      <div css={summaryHeaderCopy}>
                        <Text typo="body_S" color="primary50">
                          {t('detail.summaryEyebrow')}
                        </Text>
                        <div css={sectionTitleRow}>
                          <span css={sectionNumber}>{formatSectionLabel(1)}</span>
                          <Text tag="h2" typo="title_L" color="text_primary" css={summaryHeading}>
                            {t('detail.summaryTitle')}
                          </Text>
                        </div>
                      </div>
                      <div css={summaryPanel}>
                        <div css={summaryLineList}>
                          {summaryLines.map((line, index) => (
                            <Text
                              key={`${line}-${index}`}
                              tag="p"
                              typo="body_M"
                              color="text_primary"
                              css={summaryLine}
                            >
                              {line}
                            </Text>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
                {article.sections.map((section, index) => (
                  <section key={section.heading} id={`section-${index + 1}`} css={sectionBlock}>
                    <div css={sectionMain}>
                      <div css={sectionTitleRow}>
                        <span css={sectionNumber}>
                          {formatSectionLabel(index + leadingSectionCount + 1)}
                        </span>
                        <Text tag="h2" typo="title_L" color="text_primary" css={sectionHeading}>
                          {section.heading}
                        </Text>
                      </div>
                      {section.images && section.images.length > 0 && (
                        <div css={sectionImageGrid}>
                          {section.images.map((image) => (
                            <figure
                              key={`${section.heading}-${image.src}`}
                              css={sectionImageFigure}
                            >
                              {image.width && image.height ? (
                                <Image
                                  src={image.src}
                                  alt={image.alt}
                                  width={image.width}
                                  height={image.height}
                                  sizes={`(min-width: ${theme.breakpoints.desktop}) 340px, 100vw`}
                                  css={sectionImage}
                                />
                              ) : (
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  loading="lazy"
                                  css={sectionImage}
                                />
                              )}
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
                    <div css={sectionMain}>
                      <div css={faqSectionHeader}>
                        <Text typo="body_S" color="primary50">
                          {t('detail.faqEyebrow')}
                        </Text>
                        <div css={sectionTitleRow}>
                          <span css={sectionNumber}>
                            {formatSectionLabel(article.sections.length + leadingSectionCount + 1)}
                          </span>
                          <Text tag="h2" typo="title_L" color="text_primary" css={sectionHeading}>
                            {t('detail.faqTitle')}
                          </Text>
                        </div>
                        <Text tag="p" typo="body_M" color="text_secondary" css={faqIntro}>
                          {t('detail.faqDescription')}
                        </Text>
                      </div>
                      <div css={faqList}>
                        {article.faqItems.map((item, index) => (
                          <article
                            key={item.question}
                            id={`faq-item-${index + 1}`}
                            css={[faqCard, openFaqIndex === index && faqCardActive]}
                          >
                            <button
                              type="button"
                              id={`faq-question-${index + 1}`}
                              aria-expanded={openFaqIndex === index}
                              aria-controls={`faq-answer-${index + 1}`}
                              css={[
                                faqQuestionButton,
                                openFaqIndex === index && faqQuestionButtonActive,
                              ]}
                              onClick={() =>
                                setOpenFaqIndex((currentIndex) =>
                                  currentIndex === index ? null : index
                                )
                              }
                            >
                              <span css={faqQuestionRow}>
                                <span css={faqRow}>
                                  <span css={faqInlineLabel}>Q</span>
                                  <Text
                                    tag="span"
                                    typo="title_S"
                                    color="text_primary"
                                    css={faqQuestion}
                                  >
                                    {item.question}
                                  </Text>
                                </span>
                                <span css={faqChevron(openFaqIndex === index)} aria-hidden="true">
                                  <ArrowDown width={20} height={20} />
                                </span>
                              </span>
                            </button>
                            <div
                              id={`faq-answer-${index + 1}`}
                              role="region"
                              aria-labelledby={`faq-question-${index + 1}`}
                              css={[faqAnswerWrap, openFaqIndex === index && faqAnswerWrapOpen]}
                            >
                              <div
                                css={[faqAnswerInner, openFaqIndex === index && faqAnswerInnerOpen]}
                              >
                                <div css={faqRow}>
                                  <span css={faqInlineLabel}>A</span>
                                  <Text
                                    tag="p"
                                    typo="body_M"
                                    color="text_secondary"
                                    css={faqAnswer}
                                  >
                                    {item.answer}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </article>
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
  max-width: ${ARTICLE_LAYOUT_MAX_WIDTH};
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

const heroImageFrame = css`
  position: relative;
  min-height: 260px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 36px;
  background: linear-gradient(180deg, rgba(35, 26, 0, 0.02), rgba(35, 26, 0, 0.18));
  box-shadow: 0 24px 50px rgba(73, 69, 58, 0.12);

  @media (min-width: ${theme.breakpoints.desktop}) {
    min-height: 520px;
  }
`;

const heroImage = css`
  object-fit: cover;
`;

const heroImageOverlay = css`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(35, 26, 0, 0.02), rgba(35, 26, 0, 0.18));
  pointer-events: none;
`;

const articleBodyLayout = css`
  display: block;
  position: relative;
  width: 100%;
  max-width: ${ARTICLE_CONTENT_MAX_WIDTH};
  margin: 34px auto 0;
`;

const sideRail = css`
  display: none;

  @media (min-width: ${theme.breakpoints.wide}) {
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(-${ARTICLE_SIDE_RAIL_WIDTH} - ${ARTICLE_SIDE_RAIL_GAP});
    width: ${ARTICLE_SIDE_RAIL_WIDTH};
  }
`;

const sideRailInner = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.wide}) {
    position: sticky;
    top: 110px;
    padding-top: 18px;
  }
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
  display: block;
  scroll-margin-top: 100px;
`;

const sectionNumber = css`
  display: inline-block;
  align-items: center;
  flex-shrink: 0;
  margin-top: 2px;
  color: rgba(71, 97, 85, 0.48);
  ${theme.typo.body8};
  font-size: 20px;
  line-height: 1;
`;

const sectionMain = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const sectionTitleRow = css`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
`;

const sectionHeading = css`
  margin: 0;
  line-height: 1.34;
`;

const summaryPanel = css`
  position: relative;
  display: block;
  overflow: hidden;
  padding: 24px 24px 24px 28px;
  border: 1px solid rgba(71, 97, 85, 0.12);
  border-radius: 24px;
  background:
    rgba(208, 230, 219, 0.24),
    radial-gradient(circle at top right, rgba(208, 230, 219, 0.24), transparent 34%),
    linear-gradient(145deg, rgba(251, 253, 250, 0.98), rgba(241, 246, 242, 0.96));
  box-shadow: 0 20px 40px rgba(73, 69, 58, 0.08);

  &::before {
    content: '';
    position: absolute;
    top: 18px;
    bottom: 18px;
    left: 0;
    width: 5px;
    border-radius: 0 999px 999px 0;
    background: ${theme.colors.primary50};
  }

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 28px 30px 28px 34px;
  }
`;

const summaryHeaderCopy = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const summaryHeading = css`
  margin: 0;
`;

const summaryLineList = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const summaryLine = css`
  margin: 0;
  line-height: 1.9;
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
  gap: 18px;
`;

const faqSectionHeader = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const faqIntro = css`
  line-height: 1.8;
`;

const faqCard = css`
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  border: 1px solid rgba(71, 97, 85, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 20px rgba(73, 69, 58, 0.06);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
`;

const faqCardActive = css`
  border-color: rgba(71, 97, 85, 0.2);
  box-shadow: 0 12px 28px rgba(73, 69, 58, 0.08);
`;

const faqQuestionButton = css`
  width: 100%;
  padding: 18px 22px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: rgba(61, 58, 53, 0.03);
  }
`;

const faqQuestionButtonActive = css`
  background: rgba(71, 97, 85, 0.05);
`;

const faqAnswerWrap = css`
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  opacity: 0;
  transition:
    grid-template-rows 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.24s ease;
  will-change: grid-template-rows, opacity;
`;

const faqAnswerWrapOpen = css`
  grid-template-rows: 1fr;
  opacity: 1;
`;

const faqAnswerInner = css`
  overflow: hidden;
  min-height: 0;
  padding: 0 22px;
  border-top: 1px solid transparent;
  opacity: 0;
  transform: translateY(-8px);
  transition:
    padding 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    border-top-color 0.24s ease,
    opacity 0.2s ease,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
`;

const faqAnswerInnerOpen = css`
  padding: 18px 22px 22px;
  border-top-color: rgba(71, 97, 85, 0.1);
  opacity: 1;
  transform: translateY(0);
`;

const faqQuestionRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`;

const faqRow = css`
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  min-width: 0;
`;

const faqInlineLabel = css`
  color: ${theme.colors.text_secondary};
  ${theme.typo.body8};
  font-size: 20px;
  line-height: 1.4;
`;

const faqQuestion = css`
  margin: 0;
  line-height: 1.8;
  font-weight: 500;
`;

const faqAnswer = css`
  line-height: 1.9;
  margin: 0;
`;

const faqChevron = (isOpen: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  color: ${theme.colors.text_primary};
  transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
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
    async (context) => {
      const { params } = context;
      const slugParam = params?.slug;
      const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

      if (!slug) {
        return { notFound: true };
      }

      const locale = resolveI18nLocale(context);
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
