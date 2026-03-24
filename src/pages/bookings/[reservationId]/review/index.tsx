import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useErrorHandler } from '@/hooks';
import { useAuthState } from '@/hooks/auth/use-auth-state';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  pageWrapper,
  contentContainer,
  loadingContainer,
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
import { usePostClinicReviewMutation } from '@/queries';
import { Loading } from '@/components/common';
import { ROUTES } from '@/constants';
import { useCurrentLocale } from '@/i18n/navigation';
import { useAuthStore } from '@/store/auth';
import { useGetReservationDetailQuery } from '@/queries/reservation';
import { getPrivateI18nServerSideProps } from '@/i18n/page-props';
import { normalizeReservationStatus } from '@/utils/reservation-policy';

const getRouteParam = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? value[0] : value;
};

export default function BookingReviewCreatePage() {
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [aiConsentChecked, setAiConsentChecked] = useState(false);

  const router = useRouter();
  const t = useTranslations('review');
  const tTags = useTranslations('review-list');
  const { showToast } = useToast();
  const { showErrorDialog } = useErrorHandler();
  const { mutate, isPending } = usePostClinicReviewMutation();
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : 'en-US';
  const accessToken = useAuthStore((state) => state.accessToken);
  const { isLoading: isAuthLoading } = useAuthState();
  const hasRedirectedRef = useRef(false);

  const parsedReservationId = useMemo(() => {
    const reservationId = getRouteParam(router.query.reservationId);
    const parsed = Number(reservationId);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [router.query.reservationId]);
  const isValidReservationId = Number.isInteger(parsedReservationId) && parsedReservationId > 0;
  const shouldFetchReservationDetail =
    router.isReady && isValidReservationId && !isAuthLoading && Boolean(accessToken);

  const {
    data: reservationDetailResponse,
    error: reservationDetailError,
    isLoading: isReservationDetailLoading,
  } = useGetReservationDetailQuery(parsedReservationId, shouldFetchReservationDetail);

  const reservationDetail = reservationDetailResponse
    ? 'reservation' in reservationDetailResponse
      ? reservationDetailResponse.reservation
      : reservationDetailResponse
    : undefined;
  const resolvedProgramId = reservationDetail?.program_id ?? reservationDetail?.program_info?.id;
  const fallbackBookingPath = isValidReservationId
    ? ROUTES.BOOKINGS_DETAIL(parsedReservationId)
    : ROUTES.BOOKINGS;

  const displayRecipient = reservationDetail?.company_address ?? '-';
  const displayShop = reservationDetail?.program_info?.name ?? '-';
  const displaySchedule = reservationDetail?.visit_date ?? '-';
  const programImageFromApi =
    reservationDetail?.program_info?.primary_image_url ||
    reservationDetail?.program_info?.image_urls?.[0];
  const displayImage = programImageFromApi || '/default.png';

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

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const redirectToBookingPage = useCallback(
    (message?: string) => {
      if (hasRedirectedRef.current) return;
      hasRedirectedRef.current = true;

      if (message) {
        showToast({ title: message, icon: 'exclaim' });
      }

      void router.replace(`/${currentLocale}${fallbackBookingPath}`);
    },
    [currentLocale, fallbackBookingPath, router, showToast]
  );

  const validateForm = () => {
    if (!reviewText || selectedTags.length === 0) {
      alert(t('missingFields'));
      return false;
    }

    if (reviewText.length < 10) {
      alert(t('minLengthAlert'));
      return false;
    }

    if (!isValidReservationId || !resolvedProgramId) {
      alert(t('missingReservation'));
      return false;
    }

    if (!aiConsentChecked) {
      alert(t('aiConsent.requiredAlert'));
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (!router.isReady || isAuthLoading) return;

    if (!isValidReservationId) {
      redirectToBookingPage(t('missingReservation'));
      return;
    }

    if (!accessToken) {
      redirectToBookingPage(t('missingReservation'));
      return;
    }

    if (isReservationDetailLoading) return;

    if (reservationDetailError || !reservationDetail) {
      redirectToBookingPage(t('missingReservation'));
      return;
    }

    if (normalizeReservationStatus(reservationDetail.status) !== 'completed') {
      redirectToBookingPage(t('completedReservationOnly'));
    }
  }, [
    accessToken,
    isAuthLoading,
    isReservationDetailLoading,
    isValidReservationId,
    redirectToBookingPage,
    reservationDetail,
    reservationDetailError,
    router.isReady,
    t,
  ]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const body = new FormData();
      body.append('reservation_id', String(parsedReservationId));
      body.append('program_id', String(resolvedProgramId));
      body.append('ai_consent', String(aiConsentChecked));
      body.append('content', reviewText);
      if (selectedTags.length > 0) {
        body.append('tags', selectedTags.join(','));
      }
      selectedImages.slice(0, 5).forEach((file) => {
        body.append('image_files', file);
      });

      mutate(body, {
        onSuccess: (response) => {
          const successMessage =
            response && typeof response === 'object' && 'message' in response
              ? String(response.message)
              : t('createSuccess');
          showToast({ title: successMessage });
          router.push(`/${currentLocale}`);
        },
        onError: (error: unknown) => {
          showErrorDialog(error, {
            title: t('createFail'),
            fallbackMessage: t('unknownError'),
            primaryActionLabel: t('confirm'),
          });
        },
      });
    } catch {
      // 요청 실패 시 여기서 처리됨
    }
  };

  return (
    <Layout isAppBarExist={false} title={t('createTitle')}>
      <AppBar
        onBackClick={router.back}
        leftButton={true}
        buttonType="dark"
        title={t('createTitle')}
      />
      <div css={pageWrapper}>
        {!router.isReady || isAuthLoading || isReservationDetailLoading || isPending ? (
          <div css={loadingContainer}>
            <Loading title={isPending ? t('creating') : t('loading')} fullHeight={true} />
          </div>
        ) : (
          <>
            <div css={contentContainer}>
              <section css={programInfoCard}>
                <div css={programInfoRow}>
                  <div css={programImageWrapper}>
                    <Image src={displayImage} alt={displayShop} fill css={programImage} />
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
                            <Text
                              typo="button_XS"
                              color={isSelected ? 'primary60' : 'text_secondary'}
                            >
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
                disabled={!reviewText || selectedTags.length === 0 || !aiConsentChecked}
              >
                {t('createButton')}
              </RoundButton>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps = getPrivateI18nServerSideProps([
  'review',
  'review-form',
  'review-list',
]);
