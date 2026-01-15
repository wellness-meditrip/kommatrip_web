import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { css } from '@emotion/react';
import { AppBar, Loading, Text, Empty } from '@/components';
import { Layout } from '@/components/layout';
import { Check, ReviewAi } from '@/icons';
import { theme } from '@/styles';
import { useIntersectionLoad } from '@/hooks/review';
import { useGetGuestCompanyReviewsInfiniteQuery } from '@/queries/review';
import { Card } from '@/components/reviews/card';
import { TagFilterButton } from '@/components/reviews';
import { useTranslations } from 'next-intl';

export default function CompanyReviewListPage() {
  const router = useRouter();
  const t = useTranslations('review-list');
  const { data: session } = useSession();
  const companyId = Number(router.query.companyId);

  const [withPhotos, setWithPhotos] = useState(false);
  const [myCountryOnly, setMyCountryOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const country = session?.user?.country || '';

  const queryParams = useMemo(
    () => ({
      companyId,
      limit: 20,
      with_photos: withPhotos || undefined,
      my_country_only: myCountryOnly && country ? true : undefined,
      country: myCountryOnly && country ? country : undefined,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
    }),
    [companyId, withPhotos, myCountryOnly, country, selectedTags]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetGuestCompanyReviewsInfiniteQuery(queryParams);

  const { loadMoreRef } = useIntersectionLoad({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
  });

  const reviewList = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.reviews || []);
  }, [data]);

  const reviewCount = data?.pages?.[0]?.total ?? 0;

  const TAG_CATEGORIES = useMemo(
    () => [
      {
        title: t('tagCategories.transport'),
        tags: [
          { value: 'Near Subway', label: t('tags.nearSubway') },
          { value: 'Easy to find', label: t('tags.easyToFind') },
          { value: 'Easy by bus', label: t('tags.easyByBus') },
          { value: 'Offering Pick-up Service', label: t('tags.pickupService') },
          { value: 'Convenient parking', label: t('tags.convenientParking') },
        ],
      },
      {
        title: t('tagCategories.service'),
        tags: [
          { value: 'English Support', label: t('tags.englishSupport') },
          { value: 'Japanese Support', label: t('tags.japaneseSupport') },
          { value: 'Chinese Support', label: t('tags.chineseSupport') },
          { value: 'Friendly staff Highly skilled', label: t('tags.friendlySkilled') },
          { value: 'No hard sell', label: t('tags.noHardSell') },
          { value: 'Reasonable price', label: t('tags.reasonablePrice') },
          { value: 'Pricey but worth it', label: t('tags.priceyWorthIt') },
        ],
      },
      {
        title: t('tagCategories.space'),
        tags: [
          { value: 'Great atmosphere', label: t('tags.greatAtmosphere') },
          { value: 'Very clean', label: t('tags.veryClean') },
          { value: 'Traditional Korean Style', label: t('tags.traditionalKorean') },
          { value: 'Will visit again', label: t('tags.willVisitAgain') },
        ],
      },
    ],
    [t]
  );

  const filteredReviews = useMemo(() => {
    let list = reviewList;

    if (withPhotos) {
      list = list.filter((review) => (review.image_urls?.length ?? 0) > 0);
    }

    if (myCountryOnly && country) {
      list = list.filter((review) => review.customer_country === country);
    }

    // TODO: 내 나라 기준 처리 방식 검토
    return list;
  }, [reviewList, withPhotos, myCountryOnly, country]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  return (
    <Layout isAppBarExist={false} title={t('title')}>
      <AppBar onBackClick={router.back} leftButton={true} buttonType={'dark'} title={t('title')} />

      <div css={pageWrapper}>
        <div css={summaryCard}>
          <div css={summaryHeader}>
            <div css={summaryTitle}>
              <ReviewAi width={16} height={16} />
              <Text typo="button_S" color="text_primary">
                {t('aiSummaryTitle')}
              </Text>
            </div>
            {/* <Text typo="button_S" color="text_secondary">
              by ChatGPT
            </Text> */}
          </div>
          <Text typo="body_M" color="text_secondary">
            {t('aiSummaryEmpty')}
          </Text>
        </div>

        <div css={filterCard}>
          <Text typo="title_M" color="text_primary">
            {t('reviewCount', { count: reviewCount })}
          </Text>
          <div css={filterRow}>
            <button
              css={[filterToggle, withPhotos && filterToggleActive]}
              onClick={() => setWithPhotos((prev) => !prev)}
            >
              <Check width={14} height={14} />
              <Text typo="button_S" color={withPhotos ? 'primary50' : 'text_secondary'}>
                {t('withPhotos')}
              </Text>
            </button>
            <button
              css={[filterToggle, myCountryOnly && filterToggleActive]}
              onClick={() => setMyCountryOnly((prev) => !prev)}
            >
              <Check width={14} height={14} />
              <Text typo="button_S" color={myCountryOnly ? 'primary50' : 'text_secondary'}>
                {t('myCountryOnly')}
              </Text>
            </button>
          </div>
        </div>

        <div css={tagCard}>
          {TAG_CATEGORIES.map((category) => (
            <div key={category.title} css={tagGroup}>
              <Text typo="title_S" color="text_primary">
                {category.title}
              </Text>
              <div css={tagList}>
                {category.tags.map((tag) => (
                  <TagFilterButton
                    key={tag.value}
                    isSelected={selectedTags.includes(tag.value)}
                    onClick={() => handleTagToggle(tag.value)}
                  >
                    {tag.label}
                  </TagFilterButton>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div css={reviewListWrapper}>
          {isLoading ? (
            <Loading title={t('loading')} />
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <Card
                key={review.id}
                reviewId={review.id}
                reviewerName={review.reviewer_username || t('anonymous')}
                reviewerImageUrl={review.reviewer_profile_image_url}
                keywordReviewList={review.tags || []}
                content={review.content || ''}
                imageUrlList={review.image_urls || []}
                createdAt={review.created_at}
                programId={review.program_id}
                companyId={review.company_id}
                programName={review.program_name}
                programPrice={review.program_price}
                programDurationMinutes={review.duration_minutes}
                programImageUrl={review.primary_image_url}
              />
            ))
          ) : (
            <Empty title={t('emptyFilter')} css={emptyState} />
          )}
        </div>

        <div ref={loadMoreRef} />
      </div>
    </Layout>
  );
}

const pageWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 20px 16px 120px;
  background: ${theme.colors.bg_surface1};
`;

const summaryCard = css`
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 14px 16px;
  border-radius: 12px;
  background: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

const summaryHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const summaryTitle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const filterCard = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  padding: 16px;
  border-radius: 12px;
  background: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

const filterRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const filterToggle = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${theme.colors.border_default};

  background: ${theme.colors.white};
`;

const filterToggleActive = css`
  border-color: ${theme.colors.primary50};
  background: ${theme.colors.primary10Opacity40};
`;

const tagCard = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  padding: 16px;
  border-radius: 12px;
  background: ${theme.colors.bg_default};
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

const tagGroup = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const tagList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const reviewListWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const emptyState = css`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  text-align: center;
`;
