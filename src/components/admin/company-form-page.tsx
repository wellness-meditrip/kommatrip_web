import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/components/common';
import {
  adminAccentButton,
  adminConsolePalette,
  adminGhostButton,
  adminHeroActions,
  adminHeroDescription,
  adminHeroSection,
  adminHeroTitle,
  adminSectionTitle,
  adminSurfacePanel,
} from '@/components/admin/admin-console.styles';
import { FormSheet } from '@/components/admin/common/FormSheet';
import { Input } from '@/components/input';
import { Text } from '@/components/text';
import { ROUTES } from '@/constants';
import { useToast } from '@/hooks';
import type {
  AdminBusinessDay,
  AdminCompanyFieldErrors,
  AdminCompanyFormValues,
  AdminCompanyImagesState,
  AdminCompanyReadonlyMeta,
} from '@/models';
import { useGetAdminCompanyDetailQuery } from '@/queries';
import { QUERY_KEYS } from '@/queries/query-keys';
import { colors } from '@/styles';
import { normalizeError } from '@/utils/error-handler';
import {
  ADMIN_BUSINESS_DAY_OPTIONS,
  createEmptyAdminCompanyFormValues,
  createEmptyAdminCompanyImagesState,
  decodeAdminPreviewText,
  getFirstAdminCompanyError,
  hasAdminCompanyFormChanges,
  mapAdminCompanyDetailToFormValues,
  validateAdminCompanyForm,
} from '@/utils/admin-company-form';
import { postAdminCompany, putAdminCompany, putAdminCompanyImages } from '@/apis';
import { useAdminAccess } from '@/hooks/admin/use-admin-access';

interface AdminCompanyFormPageProps {
  mode: 'create' | 'edit';
  companyId?: number;
  presentation?: 'page' | 'sheet';
  onClose?: () => void;
}

const COMPANY_FORM_SECTIONS = [
  { id: 'meta', label: '메타 정보' },
  { id: 'basic', label: '기본 정보' },
  { id: 'overview', label: '소개 및 운영 정보' },
  { id: 'location', label: '위치 및 시간' },
  { id: 'tags', label: '태그 및 시설' },
  { id: 'links', label: '링크' },
  { id: 'images', label: '이미지' },
] as const;

type CompanyFormSectionId = (typeof COMPANY_FORM_SECTIONS)[number]['id'];

const getCompanySectionDomId = (id: CompanyFormSectionId) => `company-form-section-${id}`;

const parseKeywordList = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const formatDateTime = (value: string | null) => {
  if (!value) return '-';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate);
};

const hasCreateFormInput = (
  values: AdminCompanyFormValues,
  imageState: AdminCompanyImagesState
) => {
  if (imageState.new_files.length > 0) return true;
  if (values.is_exclusive) return true;
  if (values.business_days.length > 0 || values.tags.length > 0 || values.facilities.length > 0) {
    return true;
  }

  return Object.entries(values).some(([key, value]) => {
    if (
      key === 'is_exclusive' ||
      key === 'business_days' ||
      key === 'tags' ||
      key === 'facilities'
    ) {
      return false;
    }
    return typeof value === 'string' && value.trim().length > 0;
  });
};

const getSaveSuccessMessage = (params: {
  mode: 'create' | 'edit';
  infoSaved: boolean;
  imageSaved: boolean;
}) => {
  if (params.mode === 'create') return '업체 등록이 완료되었습니다.';
  if (params.infoSaved && params.imageSaved) return '업체 수정이 완료되었습니다.';
  if (params.imageSaved) return '업체 이미지가 업데이트되었습니다.';
  return '업체 정보가 수정되었습니다.';
};

export function AdminCompanyFormPage({
  mode,
  companyId,
  presentation = 'page',
  onClose,
}: AdminCompanyFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { canAccess } = useAdminAccess();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const detailQuery = useGetAdminCompanyDetailQuery(
    typeof companyId === 'number' ? companyId : null,
    mode === 'edit' && canAccess
  );

  const [values, setValues] = useState(createEmptyAdminCompanyFormValues);
  const [originalValues, setOriginalValues] = useState<AdminCompanyFormValues | null>(null);
  const [meta, setMeta] = useState<AdminCompanyReadonlyMeta | null>(null);
  const [imageState, setImageState] = useState(createEmptyAdminCompanyImagesState);
  const [errors, setErrors] = useState<AdminCompanyFieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<CompanyFormSectionId>('meta');
  const isSheetPresentation = presentation === 'sheet';

  const hydrateFromCompany = (
    nextCompany: Parameters<typeof mapAdminCompanyDetailToFormValues>[0]
  ) => {
    const mapped = mapAdminCompanyDetailToFormValues(nextCompany);
    setValues(mapped.formValues);
    setOriginalValues(mapped.formValues);
    setMeta(mapped.meta);
    setImageState(mapped.images);
    setErrors({});
  };

  useEffect(() => {
    if (mode !== 'edit') {
      setOriginalValues(createEmptyAdminCompanyFormValues());
      return;
    }

    if (!detailQuery.data?.company) return;
    hydrateFromCompany(detailQuery.data.company);
  }, [detailQuery.data?.company, mode]);

  const isLoadingInitialData =
    mode === 'edit' && canAccess && (detailQuery.isLoading || !originalValues);
  const textDirty =
    mode === 'edit'
      ? Boolean(originalValues && hasAdminCompanyFormChanges(values, originalValues))
      : hasCreateFormInput(values, imageState);
  const imageDirty = imageState.replace_mode && imageState.new_files.length > 0;
  const isDirty = textDirty || imageDirty;
  const availableSections = useMemo(
    () =>
      COMPANY_FORM_SECTIONS.filter((section) => {
        if (section.id === 'meta') {
          return Boolean(meta);
        }
        return true;
      }),
    [meta]
  );

  const newImagePreviews = useMemo(
    () =>
      imageState.new_files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [imageState.new_files]
  );

  useEffect(() => {
    return () => {
      for (const preview of newImagePreviews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [newImagePreviews]);

  useEffect(() => {
    if (!availableSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(availableSections[0]?.id ?? 'basic');
    }
  }, [activeSectionId, availableSections]);

  useEffect(() => {
    if (!isSheetPresentation) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top + 120;
      let nextActive = availableSections[0]?.id ?? 'basic';

      for (const section of availableSections) {
        const element = document.getElementById(getCompanySectionDomId(section.id));
        if (!element) continue;

        if (element.getBoundingClientRect().top <= containerTop) {
          nextActive = section.id;
        }
      }

      setActiveSectionId((prev) => (prev === nextActive ? prev : nextActive));
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [availableSections, isSheetPresentation]);

  const handleSectionNavClick = (sectionId: CompanyFormSectionId) => {
    const element = document.getElementById(getCompanySectionDomId(sectionId));
    const container = scrollContainerRef.current;
    if (!element || !container) return;

    setActiveSectionId(sectionId);
    const containerTop = container.getBoundingClientRect().top;
    const elementTop = element.getBoundingClientRect().top;
    const nextTop = container.scrollTop + (elementTop - containerTop) - 24;

    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior: 'smooth',
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    void router.push(ROUTES.ADMIN_COMPANIES);
  };

  const handleFieldChange = <K extends keyof AdminCompanyFormValues>(
    key: K,
    nextValue: AdminCompanyFormValues[K]
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: nextValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  const handleBusinessDayToggle = (day: AdminBusinessDay) => {
    setValues((prev) => {
      const hasDay = prev.business_days.includes(day);
      return {
        ...prev,
        business_days: hasDay
          ? prev.business_days.filter((entry) => entry !== day)
          : [...prev.business_days, day],
      };
    });

    setErrors((prev) => ({
      ...prev,
      business_days: undefined,
    }));
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    setImageState((prev) => ({
      ...prev,
      replace_mode: files.length > 0,
      new_files: files,
    }));

    setErrors((prev) => ({
      ...prev,
      images: undefined,
    }));
  };

  const resetImageReplacement = () => {
    setImageState((prev) => ({
      ...prev,
      replace_mode: false,
      new_files: [],
    }));
    setErrors((prev) => ({
      ...prev,
      images: undefined,
    }));
  };

  const refetchAndHydrate = async () => {
    if (mode !== 'edit' || typeof companyId !== 'number') return;
    const refreshed = await detailQuery.refetch();
    if (refreshed.data?.company) {
      hydrateFromCompany(refreshed.data.company);
    }
  };

  const handleSave = async () => {
    const nextErrors = validateAdminCompanyForm({
      mode,
      values,
      originalValues,
      imageState,
    });
    setErrors(nextErrors);

    const firstError = getFirstAdminCompanyError(nextErrors);
    if (firstError) {
      showToast({ title: firstError, icon: 'exclaim' });
      return;
    }

    if (!isDirty) {
      showToast({ title: '변경된 내용이 없습니다.', icon: 'exclaim' });
      return;
    }

    setIsSaving(true);

    try {
      if (mode === 'create') {
        const created = await postAdminCompany(values, imageState);
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_ADMIN_COMPANIES });
        showToast({ title: '업체 등록이 완료되었습니다.', icon: 'check' });

        if (created.companyId) {
          await router.replace(ROUTES.ADMIN_COMPANY_EDIT(created.companyId));
          return;
        }

        await router.replace(ROUTES.ADMIN_COMPANIES);
        return;
      }

      if (!originalValues || typeof companyId !== 'number') {
        throw new Error('업체 기본값이 준비되지 않았습니다.');
      }

      let infoSaved = false;
      let imageSaved = false;
      let imageError: unknown = null;

      if (textDirty) {
        const infoResponse = await putAdminCompany(companyId, values, originalValues);
        infoSaved = infoResponse.changedCount > 0;
      }

      if (imageDirty) {
        try {
          await putAdminCompanyImages(companyId, imageState.new_files);
          imageSaved = true;
        } catch (error) {
          imageError = error;
        }
      }

      if (imageError && infoSaved) {
        await Promise.all([
          refetchAndHydrate(),
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_ADMIN_COMPANIES }),
          queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.GET_ADMIN_COMPANY_DETAIL, companyId],
          }),
        ]);
        showToast({
          title: '기본 정보는 저장되었지만 이미지 교체에 실패했습니다.',
          icon: 'exclaim',
        });
        return;
      }

      if (imageError) throw imageError;

      await Promise.all([
        refetchAndHydrate(),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_ADMIN_COMPANIES }),
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_COMPANY_DETAIL, companyId],
        }),
      ]);

      showToast({
        title: getSaveSuccessMessage({ mode, infoSaved, imageSaved }),
        icon: 'check',
      });
    } catch (error) {
      const normalized = normalizeError(error);
      showToast({
        title: normalized.message || '업체 저장에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formSections = (
    <>
      {meta && (
        <section id={getCompanySectionDomId('meta')} css={cardSection}>
          <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
            업체 메타 정보
          </Text>
          <div css={metaGrid}>
            <MetaField label="업체 코드" value={meta.company_code} />
            <MetaField label="상태" value={meta.status} />
            <MetaField label="검증 여부" value={meta.is_verified ? 'Y' : 'N'} />
            <MetaField label="조회수" value={String(meta.views_count)} />
            <MetaField label="평점" value={meta.rating_average || '-'} />
            <MetaField label="생성일" value={formatDateTime(meta.created_at)} />
            <MetaField label="수정일" value={formatDateTime(meta.updated_at)} />
          </div>
        </section>
      )}

      <section id={getCompanySectionDomId('basic')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          기본 정보
        </Text>
        <div css={fieldGrid}>
          <Input
            tone="dark"
            label="업체명"
            value={values.name}
            onChange={(event) => handleFieldChange('name', event.target.value)}
            errorMessage={errors.name}
            required
          />
          <Input
            tone="dark"
            label="간편 주소"
            value={values.simpleplace}
            onChange={(event) => handleFieldChange('simpleplace', event.target.value)}
            errorMessage={errors.simpleplace}
            required
          />
          <Input
            tone="dark"
            label="주소"
            value={values.address}
            onChange={(event) => handleFieldChange('address', event.target.value)}
            errorMessage={errors.address}
            required
          />
          <Input
            tone="dark"
            label="전화번호"
            value={values.phone}
            onChange={(event) => handleFieldChange('phone', event.target.value)}
            errorMessage={errors.phone}
            required
          />
        </div>
        <label css={checkboxRow}>
          <input
            type="checkbox"
            checked={values.is_exclusive}
            onChange={(event) => handleFieldChange('is_exclusive', event.target.checked)}
          />
          <Text typo="body9" css={fieldHeadingText}>
            독점 업체 여부
          </Text>
        </label>
      </section>

      <section id={getCompanySectionDomId('overview')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          소개 및 운영 정보
        </Text>
        <TextAreaField
          label="소개"
          value={values.description}
          onChange={(event) => handleFieldChange('description', event.target.value)}
          errorMessage={errors.description}
          rows={5}
          showPreview
        />
        <TextAreaField
          label="예약 안내"
          value={values.booking_information}
          onChange={(event) => handleFieldChange('booking_information', event.target.value)}
          rows={4}
          showPreview
        />
        <TextAreaField
          label="환불 규정"
          value={values.refund_regulation}
          onChange={(event) => handleFieldChange('refund_regulation', event.target.value)}
          rows={4}
          showPreview
        />
        <TextAreaField
          label="배지"
          value={values.badge}
          onChange={(event) => handleFieldChange('badge', event.target.value)}
          errorMessage={errors.badge}
          rows={3}
          showPreview
        />
        <TextAreaField
          label="하이라이트"
          value={values.highlights}
          onChange={(event) => handleFieldChange('highlights', event.target.value)}
          rows={4}
          showPreview
        />
        <TextAreaField
          label="오시는 길"
          value={values.getting_here}
          onChange={(event) => handleFieldChange('getting_here', event.target.value)}
          rows={4}
          showPreview
        />
      </section>

      <section id={getCompanySectionDomId('location')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          위치 및 시간
        </Text>
        <div css={fieldGrid}>
          <Input
            tone="dark"
            label="위도"
            value={values.latitude}
            onChange={(event) => handleFieldChange('latitude', event.target.value)}
            errorMessage={errors.latitude}
          />
          <Input
            tone="dark"
            label="경도"
            value={values.longitude}
            onChange={(event) => handleFieldChange('longitude', event.target.value)}
            errorMessage={errors.longitude}
          />
          <Input
            tone="dark"
            type="time"
            label="평일 오픈"
            value={values.weekday_open_time}
            onChange={(event) => handleFieldChange('weekday_open_time', event.target.value)}
            errorMessage={errors.weekday_open_time}
          />
          <Input
            tone="dark"
            type="time"
            label="평일 마감"
            value={values.weekday_close_time}
            onChange={(event) => handleFieldChange('weekday_close_time', event.target.value)}
            errorMessage={errors.weekday_close_time}
          />
          <Input
            tone="dark"
            type="time"
            label="주말 오픈"
            value={values.weekend_open_time}
            onChange={(event) => handleFieldChange('weekend_open_time', event.target.value)}
            errorMessage={errors.weekend_open_time}
          />
          <Input
            tone="dark"
            type="time"
            label="주말 마감"
            value={values.weekend_close_time}
            onChange={(event) => handleFieldChange('weekend_close_time', event.target.value)}
            errorMessage={errors.weekend_close_time}
          />
        </div>
        <div css={fieldBlock}>
          <Text typo="subtitle3" css={sectionTitleText}>
            영업일
          </Text>
          <div css={dayToggleRow}>
            {ADMIN_BUSINESS_DAY_OPTIONS.map((day) => {
              const isSelected = values.business_days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  css={dayToggleButton(isSelected)}
                  onClick={() => handleBusinessDayToggle(day.value)}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          {errors.business_days && (
            <Text typo="body12" color="red200">
              {errors.business_days}
            </Text>
          )}
        </div>
      </section>

      <section id={getCompanySectionDomId('tags')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          태그 및 시설
        </Text>
        <ArrayFieldInput
          label="태그"
          value={values.tags}
          placeholder="예: lifting, wellness"
          onChange={(nextValue) => handleFieldChange('tags', nextValue)}
          errorMessage={errors.tags}
        />
        <ArrayFieldInput
          label="시설"
          value={values.facilities}
          placeholder="예: wifi, parking"
          onChange={(nextValue) => handleFieldChange('facilities', nextValue)}
          errorMessage={errors.facilities}
        />
      </section>

      <section id={getCompanySectionDomId('links')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          링크
        </Text>
        <div css={fieldGrid}>
          <Input
            tone="dark"
            label="웹사이트"
            value={values.website_url}
            onChange={(event) => handleFieldChange('website_url', event.target.value)}
            errorMessage={errors.website_url}
          />
          <Input
            tone="dark"
            label="인스타그램"
            value={values.instagram_url}
            onChange={(event) => handleFieldChange('instagram_url', event.target.value)}
            errorMessage={errors.instagram_url}
          />
          <Input
            tone="dark"
            label="WhatsApp"
            value={values.whats_app_url}
            onChange={(event) => handleFieldChange('whats_app_url', event.target.value)}
            errorMessage={errors.whats_app_url}
          />
          <Input
            tone="dark"
            label="카카오"
            value={values.kakao_url}
            onChange={(event) => handleFieldChange('kakao_url', event.target.value)}
            errorMessage={errors.kakao_url}
          />
        </div>
      </section>

      <section id={getCompanySectionDomId('images')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          이미지
        </Text>
        <Text typo="body10" css={helperText}>
          이미지는 전체 교체 방식입니다. 새 파일을 선택하면 기존 이미지 세트가 모두 교체됩니다.
        </Text>
        <div css={imageGroup}>
          <div css={imageColumn}>
            <Text typo="body4" css={fieldHeadingText}>
              기존 대표 이미지
            </Text>
            {imageState.existing_primary_image_url ? (
              <div css={imagePreview(imageState.existing_primary_image_url)} />
            ) : (
              <div css={imagePlaceholder}>없음</div>
            )}
          </div>
          <div css={imageColumn}>
            <Text typo="body4" css={fieldHeadingText}>
              기존 이미지 목록
            </Text>
            <div css={imageGallery}>
              {imageState.existing_image_urls.length > 0 ? (
                imageState.existing_image_urls.map((url) => <div key={url} css={imageThumb(url)} />)
              ) : (
                <div css={imagePlaceholder}>없음</div>
              )}
            </div>
          </div>
        </div>

        <div css={uploadControls}>
          <label css={uploadButton}>
            새 이미지 선택
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
              css={hiddenInput}
            />
          </label>
          {imageState.replace_mode && (
            <button type="button" css={secondaryButton} onClick={resetImageReplacement}>
              교체 취소
            </button>
          )}
        </div>

        {newImagePreviews.length > 0 && (
          <div css={fieldBlock}>
            <Text typo="body4" css={fieldHeadingText}>
              새 이미지 미리보기
            </Text>
            <div css={imageGallery}>
              {newImagePreviews.map((preview) => (
                <div key={preview.url} css={imageThumb(preview.url)} title={preview.name} />
              ))}
            </div>
          </div>
        )}

        {errors.images && (
          <Text typo="body12" color="red200">
            {errors.images}
          </Text>
        )}
      </section>
    </>
  );

  const sheetHeaderActions = (
    <div css={actionRow}>
      <button type="button" css={secondaryButton} onClick={handleClose}>
        목록으로
      </button>
      <button
        type="button"
        css={primaryButton}
        disabled={isSaving || !isDirty}
        onClick={handleSave}
      >
        {isSaving ? '저장 중...' : '저장'}
      </button>
    </div>
  );

  const sheetSideNav = (
    <>
      {availableSections.map((section) => (
        <button
          key={section.id}
          type="button"
          css={sheetSectionButton(activeSectionId === section.id)}
          onClick={() => handleSectionNavClick(section.id)}
        >
          {section.label}
        </button>
      ))}
    </>
  );

  if (mode === 'edit' && !canAccess && !detailQuery.isError) {
    if (isSheetPresentation) {
      return (
        <FormSheet
          open
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          title="업체 수정"
          description="기존 업체 정보를 기본값으로 불러와 변경분만 저장합니다."
          headerActions={
            <div css={actionRow}>
              <button type="button" css={secondaryButton} onClick={handleClose}>
                목록으로
              </button>
            </div>
          }
          width={1120}
        >
          <div css={sheetState}>
            <Loading title="관리자 인증을 확인하는 중입니다." fullHeight />
          </div>
        </FormSheet>
      );
    }

    return <Loading title="관리자 인증을 확인하는 중입니다." fullHeight />;
  }

  if (isLoadingInitialData) {
    if (isSheetPresentation) {
      return (
        <FormSheet
          open
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          title="업체 수정"
          description="기존 업체 정보를 기본값으로 불러와 변경분만 저장합니다."
          headerActions={
            <div css={actionRow}>
              <button type="button" css={secondaryButton} onClick={handleClose}>
                목록으로
              </button>
            </div>
          }
          width={1120}
        >
          <div css={sheetState}>
            <Loading title="업체 정보를 불러오는 중입니다." fullHeight />
          </div>
        </FormSheet>
      );
    }

    return <Loading title="업체 정보를 불러오는 중입니다." fullHeight />;
  }

  if (mode === 'edit' && detailQuery.isError) {
    const message = normalizeError(detailQuery.error).message || '업체 정보를 불러오지 못했습니다.';

    if (isSheetPresentation) {
      return (
        <FormSheet
          open
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          title="업체 수정"
          description="기존 업체 정보를 기본값으로 불러와 변경분만 저장합니다."
          headerActions={
            <div css={actionRow}>
              <button type="button" css={secondaryButton} onClick={handleClose}>
                목록으로
              </button>
            </div>
          }
          width={1120}
        >
          <div css={sheetState}>
            <section css={errorCard}>
              <Text tag="h1" typo="title1" css={heroTitleText}>
                업체 정보를 불러오지 못했습니다.
              </Text>
              <Text typo="body9" css={heroDescriptionText}>
                {message}
              </Text>
              <div css={actionRow}>
                <button type="button" css={secondaryButton} onClick={handleClose}>
                  목록으로
                </button>
                <button
                  type="button"
                  css={primaryButton}
                  onClick={() => void detailQuery.refetch()}
                >
                  다시 시도
                </button>
              </div>
            </section>
          </div>
        </FormSheet>
      );
    }

    return (
      <div css={pageWrapper}>
        <div css={pageInner}>
          <section css={errorCard}>
            <Text tag="h1" typo="title1" css={heroTitleText}>
              업체 정보를 불러오지 못했습니다.
            </Text>
            <Text typo="body9" css={heroDescriptionText}>
              {message}
            </Text>
            <div css={actionRow}>
              <button type="button" css={secondaryButton} onClick={handleClose}>
                목록으로
              </button>
              <button type="button" css={primaryButton} onClick={() => void detailQuery.refetch()}>
                다시 시도
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return isSheetPresentation ? (
    <FormSheet
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title="업체 수정"
      description="기존 업체 정보를 기본값으로 불러와 변경분만 저장합니다."
      headerActions={sheetHeaderActions}
      sideNav={sheetSideNav}
      width={1120}
    >
      <div ref={scrollContainerRef} css={sheetScrollArea}>
        <div css={sheetSections}>{formSections}</div>
      </div>
    </FormSheet>
  ) : (
    <div css={pageWrapper}>
      <div css={pageInner}>
        <header css={headerSection}>
          <div css={headerCopy}>
            <Text tag="h1" typo="title1" css={heroTitleText}>
              {mode === 'create' ? '업체 등록' : '업체 수정'}
            </Text>
            <Text typo="body9" css={heroDescriptionText}>
              {mode === 'create'
                ? '어드민에서 신규 업체 정보를 등록합니다.'
                : '기존 업체 정보를 기본값으로 불러와 변경분만 저장합니다.'}
            </Text>
          </div>
          <div css={actionRow}>
            <button type="button" css={secondaryButton} onClick={handleClose}>
              목록으로
            </button>
            <button
              type="button"
              css={primaryButton}
              disabled={isSaving || !isDirty}
              onClick={handleSave}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </header>

        {formSections}
      </div>

      <div css={stickyActionBar}>
        <div css={stickyActionInner}>
          <Text typo="body10" css={helperText}>
            {isDirty ? '변경 사항이 있습니다.' : '변경 사항이 없습니다.'}
          </Text>
          <div css={actionRow}>
            <button type="button" css={secondaryButton} onClick={handleClose}>
              취소
            </button>
            <button
              type="button"
              css={primaryButton}
              disabled={isSaving || !isDirty}
              onClick={handleSave}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  errorMessage,
  rows = 4,
  showPreview = false,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  errorMessage?: string;
  rows?: number;
  showPreview?: boolean;
}) {
  const previewText = decodeAdminPreviewText(value);

  return (
    <div css={fieldBlock}>
      <Text typo="subtitle3" css={sectionTitleText}>
        {label}
      </Text>
      <div css={textAreaPreviewLayout(showPreview)}>
        <div css={editorPanel}>
          <textarea
            css={textareaField(Boolean(errorMessage))}
            value={value}
            onChange={onChange}
            rows={rows}
          />
          {errorMessage && (
            <Text typo="body12" color="red200">
              {errorMessage}
            </Text>
          )}
        </div>
        {showPreview && (
          <div css={previewPanel}>
            <div css={previewHeader}>
              <Text typo="body6" css={previewTitleText}>
                프리뷰
              </Text>
              <Text typo="body12" css={helperText}>
                줄바꿈/탭/이스케이프 문자를 해석해서 표시합니다.
              </Text>
            </div>
            <div css={previewBody}>
              {previewText.trim().length > 0 ? (
                <Text typo="body9" css={fieldValueText}>
                  {previewText}
                </Text>
              ) : (
                <Text typo="body10" css={helperText}>
                  표시할 내용이 없습니다.
                </Text>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrayFieldInput({
  label,
  value,
  placeholder,
  onChange,
  errorMessage,
}: {
  label: string;
  value: string[];
  placeholder: string;
  onChange: (nextValue: string[]) => void;
  errorMessage?: string;
}) {
  return (
    <div css={fieldBlock}>
      <Input
        tone="dark"
        label={label}
        value={value.join(', ')}
        placeholder={placeholder}
        onChange={(event) => onChange(parseKeywordList(event.target.value))}
        errorMessage={errorMessage}
      />
      <div css={chipRow}>
        {value.map((item) => (
          <span key={item} css={chip}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div css={metaItem}>
      <Text typo="body10" css={metaLabelText}>
        {label}
      </Text>
      <Text typo="body4" css={metaValueText}>
        {value}
      </Text>
    </div>
  );
}

const pageWrapper = css`
  padding: 0 0 120px;
`;

const pageInner = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const headerSection = adminHeroSection;

const headerCopy = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const cardSection = css`
  ${adminSurfacePanel};
  gap: 16px;

  & input[type='checkbox'] {
    accent-color: #849b82;
  }

  & input:not([type='checkbox']):not([type='file'])::placeholder,
  & textarea::placeholder {
    color: ${adminConsolePalette.textDim};
  }

  & input:not([type='checkbox']):not([type='file']) {
    color: ${adminConsolePalette.textStrong};
    border-bottom: 1px solid ${adminConsolePalette.borderStrong} !important;
  }
`;

const errorCard = css([
  cardSection,
  css`
    margin-top: 40px;
  `,
]);

const actionRow = adminHeroActions;

const baseButton = css`
  border: none;
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const primaryButton = css`
  ${baseButton};
  ${adminAccentButton};
`;

const secondaryButton = css`
  ${baseButton};
  ${adminGhostButton};
`;

const fieldGrid = css`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const fieldBlock = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const textAreaPreviewLayout = (showPreview: boolean) => css`
  display: grid;
  gap: 16px;
  grid-template-columns: ${showPreview ? 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' : '1fr'};
  align-items: stretch;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const editorPanel = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100%;
`;

const textareaField = (hasError: boolean) => css`
  width: 100%;
  height: 100%;
  min-height: clamp(220px, 26vw, 340px);
  border-radius: 16px;
  border: 1px solid ${hasError ? colors.red200 : adminConsolePalette.borderStrong};
  background: rgba(255, 255, 255, 0.04);
  padding: 14px 16px;
  font-size: 14px;
  color: ${adminConsolePalette.textStrong};
  resize: vertical;
  outline: none;

  &:focus {
    border-color: rgba(132, 155, 130, 0.42);
  }
`;

const previewPanel = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(12, 20, 33, 0.9);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const previewHeader = css`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const previewBody = css`
  flex: 1;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const checkboxRow = css`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const dayToggleRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const dayToggleButton = (isSelected: boolean) => css`
  border: 1px solid ${isSelected ? 'rgba(132, 155, 130, 0.42)' : adminConsolePalette.borderStrong};
  border-radius: 999px;
  padding: 10px 14px;
  background: ${isSelected ? 'rgba(132, 155, 130, 0.18)' : 'rgba(255, 255, 255, 0.04)'};
  color: ${adminConsolePalette.textStrong};
  cursor: pointer;
`;

const chipRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const chip = css`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(132, 155, 130, 0.16);
  color: ${adminConsolePalette.accentText};
  font-size: 12px;
  font-weight: 600;
`;

const metaGrid = css`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const metaItem = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const imageGroup = css`
  display: grid;
  gap: 16px;
  grid-template-columns: 280px minmax(0, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const imageColumn = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const imagePreview = (url: string) => css`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  background: url(${JSON.stringify(url)}) center / cover no-repeat;
`;

const imageGallery = css`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
`;

const imageThumb = (url: string) => css`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  background: url(${JSON.stringify(url)}) center / cover no-repeat;
`;

const imagePlaceholder = css`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: ${adminConsolePalette.textSubtle};
  font-size: 13px;
`;

const uploadControls = css`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const uploadButton = css`
  ${baseButton};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(132, 155, 130, 0.16);
  color: ${adminConsolePalette.accentText};
`;

const hiddenInput = css`
  display: none;
`;

const stickyActionBar = css`
  position: sticky;
  bottom: 16px;
  margin-top: 24px;
`;

const stickyActionInner = css`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-radius: 20px;
  background: rgba(6, 12, 21, 0.84);
  border: 1px solid ${adminConsolePalette.borderSoft};
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 48px rgba(2, 6, 14, 0.24);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const heroTitleText = adminHeroTitle;

const heroDescriptionText = adminHeroDescription;

const sectionTitleText = adminSectionTitle;

const helperText = css`
  color: ${adminConsolePalette.textSubtle};
`;

const fieldHeadingText = css`
  color: ${adminConsolePalette.textStrong};
`;

const previewTitleText = css`
  color: ${adminConsolePalette.accentText};
`;

const fieldValueText = css`
  color: ${adminConsolePalette.textStrong};
`;

const metaLabelText = css`
  color: ${adminConsolePalette.textDim};
`;

const metaValueText = css`
  color: ${adminConsolePalette.textStrong};
`;

const sheetSectionButton = (isActive: boolean) => css`
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 46px;
  padding: 0 16px;
  border: 1px solid ${isActive ? 'rgba(142, 164, 190, 0.16)' : 'transparent'};
  border-radius: 14px;
  background: ${isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  color: ${isActive ? adminConsolePalette.textStrong : adminConsolePalette.textMuted};
  font-size: 14px;
  font-weight: ${isActive ? 700 : 500};
  text-align: left;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${adminConsolePalette.textStrong};
  }

  @media (max-width: 1024px) {
    width: auto;
    white-space: nowrap;
  }
`;

const sheetScrollArea = css`
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 24px 28px 32px;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const sheetSections = css`
  display: flex;
  flex-direction: column;
  gap: 20px;

  & > section {
    scroll-margin-top: 24px;
  }
`;

const sheetState = css`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
`;
