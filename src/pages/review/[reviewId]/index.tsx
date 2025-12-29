import { useEffect, useMemo, useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog } from '@/hooks';
import { useRouter } from 'next/router';
import Image from 'next/image';
import 'dayjs/locale/ko';
import { useTranslations } from 'next-intl';
import {
  pageWrapper,
  contentContainer,
  submitButtonContainer,
  programInfoCard,
  programInfoRow,
  programInfoCol,
  programInfoMetaGroup,
  programInfoMetaRow,
  programImageWrapper,
  programImage,
  keywordCard,
  keywordHeaderGroup,
  keywordTitleRow,
  keywordGroup,
  tagList,
  tagChip,
  requiredMark,
  aiConsentCard,
  aiConsentHeaderRow,
  aiConsentDescription,
  aiConsentRow,
  aiConsentCheckbox,
  aiConsentLabel,
} from '@/styles/pages/review.styles';
import { ReviewInputCard } from '@/components/reviews';
import {
  useGetMyReviewsQuery,
  useReplaceReviewImagesMutation,
  useUpdateMyReviewMutation,
} from '@/queries';
import { Loading } from '@/components/common';
import { useCurrentLocale } from '@/i18n/navigation';
import { ROUTES } from '@/constants';

export default function ReviewEditPage() {
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [aiConsentChecked, setAiConsentChecked] = useState(false);
  const router = useRouter();
  const t = useTranslations('review');
  const tTags = useTranslations('review-list');
  const tCommon = useTranslations('common');
  const { showToast } = useToast();
  const { open } = useDialog();
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : currentLocale === 'ja' ? 'ja-JP' : 'en-US';

  // URL에서 review_id 가져오기
  const reviewId = Number(router.query.reviewId);

  const { data: myReviewsResponse, isLoading: isLoadingReview } = useGetMyReviewsQuery({
    skip: 0,
    limit: 50,
  });
  const reviewData = useMemo(
    () => myReviewsResponse?.reviews?.find((review) => review.id === reviewId),
    [myReviewsResponse, reviewId]
  );

  // 리뷰 수정 mutation
  const { mutateAsync: updateReview, isPending: isUpdating } = useUpdateMyReviewMutation();
  const { mutateAsync: replaceImages, isPending: isReplacingImages } =
    useReplaceReviewImagesMutation();

  // 리뷰 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (reviewData) {
      setReviewText(reviewData.content);
      setSelectedTags(reviewData.tags || []);
      setAiConsentChecked(Boolean(reviewData.ai_consent));
    }
  }, [reviewData]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!reviewData) return;

    if (reviewText.length < 10) {
      alert(t('minLengthAlert'));
      return;
    }

    if (!aiConsentChecked) {
      alert(t('aiConsent.requiredAlert'));
      return;
    }

    try {
      await updateReview({
        reviewId,
        body: {
          content: reviewText,
          ai_consent: aiConsentChecked,
          tags: selectedTags,
        },
      });

      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((file) => formData.append('image_files', file));
        await replaceImages({ reviewId, body: formData });
      }

      showToast({ title: t('updateSuccess') });
      router.push(ROUTES.MYPAGE_REVIEWS);
    } catch (error: unknown) {
      open({
        type: 'confirm',
        title: t('updateFail'),
        description: String(error),
        primaryActionLabel: tCommon('button.confirm'),
      });
    }
  };

  const displayRecipient = reviewData?.company_name || reviewData?.company_code || '-';
  const displayShop = reviewData?.program_name ?? '-';
  const displaySchedule = reviewData?.visit_date ?? '-';
  const displayImage = reviewData?.primary_image_url || '/default.png';
  const formattedSchedule = useMemo(() => {
    if (!displaySchedule || displaySchedule === '-') return '-';
    const parsed = new Date(displaySchedule);
    if (Number.isNaN(parsed.getTime())) return displaySchedule;
    const dateParts = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    }).formatToParts(parsed);
    const getPart = (type: string) => dateParts.find((part) => part.type === type)?.value ?? '';
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const weekday = getPart('weekday');
    const timeText = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsed);
    return `${year}.${month}.${day} (${weekday}) ${timeText}`;
  }, [displaySchedule, locale]);

  const tagCategories = useMemo(
    () => [
      {
        title: tTags('tagCategories.transport'),
        tags: [
          { value: 'Near Subway', label: tTags('tags.nearSubway') },
          { value: 'Easy to find', label: tTags('tags.easyToFind') },
          { value: 'Easy by bus', label: tTags('tags.easyByBus') },
          { value: 'Offering Pick-up Service', label: tTags('tags.pickupService') },
          { value: 'Convenient parking', label: tTags('tags.convenientParking') },
        ],
      },
      {
        title: tTags('tagCategories.service'),
        tags: [
          { value: 'English Support', label: tTags('tags.englishSupport') },
          { value: 'Japanese Support', label: tTags('tags.japaneseSupport') },
          { value: 'Chinese Support', label: tTags('tags.chineseSupport') },
          { value: 'Friendly staff Highly skilled', label: tTags('tags.friendlySkilled') },
          { value: 'No hard sell', label: tTags('tags.noHardSell') },
          { value: 'Reasonable price', label: tTags('tags.reasonablePrice') },
          { value: 'Pricey but worth it', label: tTags('tags.priceyWorthIt') },
        ],
      },
      {
        title: tTags('tagCategories.space'),
        tags: [
          { value: 'Great atmosphere', label: tTags('tags.greatAtmosphere') },
          { value: 'Very clean', label: tTags('tags.veryClean') },
          { value: 'Traditional Korean Style', label: tTags('tags.traditionalKorean') },
        ],
      },
      {
        title: t('keywords.other'),
        tags: [{ value: 'Will visit again', label: tTags('tags.willVisitAgain') }],
      },
    ],
    [t, tTags]
  );

  return (
    <Layout isAppBarExist={false}>
      <AppBar
        onBackClick={router.back}
        leftButton={true}
        buttonType="dark"
        title={t('editTitle')}
      />
      <div css={pageWrapper}>
        <section css={programInfoCard}>
          <div css={programInfoRow}>
            <div css={programImageWrapper}>
              <Image
                src={displayImage}
                alt={displayShop}
                width={72}
                height={72}
                css={programImage}
              />
            </div>
            <div css={programInfoCol}>
              <Text typo="title_M" color="text_primary">
                {displayShop}
              </Text>
              <div css={programInfoMetaGroup}>
                <div css={programInfoMetaRow}>
                  <Text typo="body_S" color="text_tertiary">
                    {t('programInfo.visitedDate')}
                  </Text>
                  <Text typo="body_S" color="text_secondary">
                    {formattedSchedule}
                  </Text>
                </div>
                <div css={programInfoMetaRow}>
                  <Text typo="body_S" color="text_tertiary">
                    {t('programInfo.location')}
                  </Text>
                  <Text typo="body_S" color="text_secondary">
                    {displayRecipient}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div css={contentContainer}>
          {(isLoadingReview || isUpdating || isReplacingImages) && (
            <Loading
              title={
                isLoadingReview
                  ? t('loading')
                  : isUpdating || isReplacingImages
                    ? t('updating')
                    : ''
              }
            />
          )}

          <section css={keywordCard}>
            <div css={keywordHeaderGroup}>
              <div css={keywordTitleRow}>
                <Text typo="title_S" color="text_primary">
                  {t('keywords.title')}
                </Text>
                <span css={requiredMark}>*</span>
              </div>
              <Text typo="body_S" color="text_secondary">
                {t('keywords.subtitle')}
              </Text>
            </div>
            {tagCategories.map((category) => (
              <div key={category.title} css={keywordGroup}>
                <Text typo="body_M" color="text_primary">
                  {category.title}
                </Text>
                <div css={tagList}>
                  {category.tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        css={tagChip(isSelected)}
                        onClick={() => handleTagToggle(tag.value)}
                      >
                        <Text typo="button_XS" color={isSelected ? 'primary60' : 'text_secondary'}>
                          {tag.label}
                        </Text>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          <ReviewInputCard
            reviewText={reviewText}
            setReviewText={setReviewText}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />

          <section css={aiConsentCard}>
            <div css={aiConsentHeaderRow}>
              <Text typo="title_S" color="text_primary">
                {t('aiConsent.title')}
              </Text>
              <span css={requiredMark}>*</span>
            </div>
            <Text typo="body_S" color="text_secondary" css={aiConsentDescription}>
              {t('aiConsent.description')}
            </Text>
            <label css={aiConsentRow}>
              <input
                type="checkbox"
                checked={aiConsentChecked}
                onChange={(event) => setAiConsentChecked(event.target.checked)}
                css={aiConsentCheckbox}
              />
              <Text typo="body_S" color="text_secondary" css={aiConsentLabel}>
                {t('aiConsent.agreement')}
              </Text>
            </label>
          </section>
        </div>
        <div css={submitButtonContainer}>
          <RoundButton
            service="daengle"
            size="L"
            fullWidth
            onClick={handleSubmit}
            disabled={
              !reviewText ||
              selectedTags.length === 0 ||
              !aiConsentChecked ||
              isUpdating ||
              isReplacingImages ||
              isLoadingReview
            }
          >
            {isUpdating ? t('updatingButton') : t('updateButton')}
          </RoundButton>
        </div>
      </div>
    </Layout>
  );
}
