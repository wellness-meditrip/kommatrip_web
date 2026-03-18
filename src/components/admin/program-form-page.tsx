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
  AdminProgramFieldErrors,
  AdminProgramFormValues,
  AdminProgramImagesState,
  AdminProgramReadonlyMeta,
} from '@/models';
import { useGetAdminCompanyDetailQuery, useGetAdminProgramDetailQuery } from '@/queries';
import { QUERY_KEYS } from '@/queries/query-keys';
import { colors } from '@/styles';
import { decodeAdminPreviewText } from '@/utils/admin-company-form';
import { normalizeError } from '@/utils/error-handler';
import {
  ADMIN_PROGRAM_STATUS_OPTIONS,
  createEmptyAdminProgramFormValues,
  createEmptyAdminProgramImagesState,
  getFirstAdminProgramError,
  hasAdminProgramFormChanges,
  mapAdminProgramDetailToFormValues,
  validateAdminProgramForm,
} from '@/utils/admin-program-form';
import { postAdminProgram, putAdminProgram, putAdminProgramImages } from '@/apis';
import { useAdminRouteGuard } from '@/hooks/admin/use-admin-route-guard';

interface AdminProgramFormPageProps {
  mode: 'create' | 'edit';
  companyId: number;
  programId?: number;
  presentation?: 'page' | 'sheet';
  onClose?: () => void;
}

const PROGRAM_FORM_SECTIONS = [
  { id: 'meta', label: '메타 정보' },
  { id: 'basic', label: '기본 정보' },
  { id: 'overview', label: '설명 및 안내' },
  { id: 'process', label: '진행 단계' },
  { id: 'images', label: '이미지' },
] as const;

type ProgramFormSectionId = (typeof PROGRAM_FORM_SECTIONS)[number]['id'];

const getProgramSectionDomId = (id: ProgramFormSectionId) => `program-form-section-${id}`;

const formatDateTime = (value: string | null) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const parseProcessText = (value: string) =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

const serializeProcessText = (value: string[]) => value.join('\n');

const hasCreateFormInput = (
  values: AdminProgramFormValues,
  imageState: AdminProgramImagesState
) => {
  if (imageState.new_files.length > 0) return true;
  if (values.process.length > 0) return true;

  return Object.entries(values).some(([key, value]) => {
    if (key === 'process' || key === 'status') return false;
    return typeof value === 'string' && value.trim().length > 0;
  });
};

const getSaveSuccessMessage = (params: {
  mode: 'create' | 'edit';
  infoSaved: boolean;
  imageSaved: boolean;
}) => {
  if (params.mode === 'create') return '프로그램 등록이 완료되었습니다.';
  if (params.infoSaved && params.imageSaved) return '프로그램 수정이 완료되었습니다.';
  if (params.imageSaved) return '프로그램 이미지가 업데이트되었습니다.';
  return '프로그램 정보가 수정되었습니다.';
};

export function AdminProgramFormPage({
  mode,
  companyId,
  programId,
  presentation = 'page',
  onClose,
}: AdminProgramFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { canAccess, isReady } = useAdminRouteGuard();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isSheetPresentation = presentation === 'sheet';

  const companyDetailQuery = useGetAdminCompanyDetailQuery(companyId, canAccess);
  const programDetailQuery = useGetAdminProgramDetailQuery(
    typeof programId === 'number' ? programId : null,
    mode === 'edit' && canAccess
  );

  const companyCode = companyDetailQuery.data?.company?.company_code ?? '';
  const companyName = companyDetailQuery.data?.company?.name ?? '';

  const [values, setValues] = useState(createEmptyAdminProgramFormValues);
  const [originalValues, setOriginalValues] = useState<AdminProgramFormValues | null>(null);
  const [meta, setMeta] = useState<AdminProgramReadonlyMeta | null>(null);
  const [imageState, setImageState] = useState(createEmptyAdminProgramImagesState);
  const [errors, setErrors] = useState<AdminProgramFieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<ProgramFormSectionId>('meta');

  const hydrateFromProgram = (
    nextProgram: Parameters<typeof mapAdminProgramDetailToFormValues>[0]
  ) => {
    const mapped = mapAdminProgramDetailToFormValues(nextProgram);
    setValues(mapped.formValues);
    setOriginalValues(mapped.formValues);
    setMeta(mapped.meta);
    setImageState(mapped.images);
    setErrors({});
  };

  useEffect(() => {
    if (mode !== 'edit') {
      setOriginalValues(createEmptyAdminProgramFormValues());
      return;
    }

    if (!programDetailQuery.data?.program) return;
    hydrateFromProgram(programDetailQuery.data.program);
  }, [mode, programDetailQuery.data?.program]);

  const isLoadingInitialData =
    !isReady ||
    !canAccess ||
    companyDetailQuery.isLoading ||
    (mode === 'edit' && (programDetailQuery.isLoading || !originalValues));

  const textDirty =
    mode === 'edit'
      ? Boolean(originalValues && hasAdminProgramFormChanges(values, originalValues))
      : hasCreateFormInput(values, imageState);
  const imageDirty = imageState.replace_mode && imageState.new_files.length > 0;
  const isDirty = textDirty || imageDirty;

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
    if (!isSheetPresentation) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top + 120;
      let nextActive: ProgramFormSectionId = 'meta';

      for (const section of PROGRAM_FORM_SECTIONS) {
        const element = document.getElementById(getProgramSectionDomId(section.id));
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
  }, [isSheetPresentation]);

  const handleSectionNavClick = (sectionId: ProgramFormSectionId) => {
    const element = document.getElementById(getProgramSectionDomId(sectionId));
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

    void router.push(ROUTES.ADMIN_COMPANY_PROGRAMS(companyId));
  };

  const handleFieldChange = <K extends keyof AdminProgramFormValues>(
    key: K,
    nextValue: AdminProgramFormValues[K]
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
    if (mode !== 'edit' || typeof programId !== 'number') return;
    const refreshed = await programDetailQuery.refetch();
    if (refreshed.data?.program) {
      hydrateFromProgram(refreshed.data.program);
    }
  };

  const handleSave = async () => {
    const nextErrors = validateAdminProgramForm({
      mode,
      values,
      imageState,
    });
    setErrors(nextErrors);

    const firstError = getFirstAdminProgramError(nextErrors);
    if (firstError) {
      showToast({ title: firstError, icon: 'exclaim' });
      return;
    }

    if (!isDirty) {
      showToast({ title: '변경된 내용이 없습니다.', icon: 'exclaim' });
      return;
    }

    if (!companyCode) {
      showToast({ title: '업체 코드를 불러오지 못했습니다.', icon: 'exclaim' });
      return;
    }

    setIsSaving(true);

    try {
      if (mode === 'create') {
        const created = await postAdminProgram(values, {
          companyCode,
          imageState,
        });

        await queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAMS_BY_COMPANY, companyCode],
        });

        showToast({ title: '프로그램 등록이 완료되었습니다.', icon: 'check' });

        if (created.programId) {
          await router.replace(ROUTES.ADMIN_COMPANY_PROGRAM_EDIT(companyId, created.programId));
          return;
        }

        await router.replace(ROUTES.ADMIN_COMPANY_PROGRAMS(companyId));
        return;
      }

      if (!originalValues || typeof programId !== 'number') {
        throw new Error('프로그램 기본값이 준비되지 않았습니다.');
      }

      let infoSaved = false;
      let imageSaved = false;
      let imageError: unknown = null;

      if (textDirty) {
        const infoResponse = await putAdminProgram(programId, values, originalValues);
        infoSaved = infoResponse.changedCount > 0;
      }

      if (imageDirty) {
        try {
          await putAdminProgramImages(programId, imageState.new_files);
          imageSaved = true;
        } catch (error) {
          imageError = error;
        }
      }

      if (imageError && infoSaved) {
        await Promise.all([
          refetchAndHydrate(),
          queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAMS_BY_COMPANY, companyCode],
          }),
          queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAM_DETAIL, programId],
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
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAMS_BY_COMPANY, companyCode],
        }),
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_PROGRAM_DETAIL, programId],
        }),
      ]);

      showToast({
        title: getSaveSuccessMessage({ mode, infoSaved, imageSaved }),
        icon: 'check',
      });
    } catch (error) {
      const normalized = normalizeError(error);
      showToast({
        title: normalized.message || '프로그램 저장에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formSections = (
    <>
      <section id={getProgramSectionDomId('meta')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          메타 정보
        </Text>
        <div css={metaBanner}>
          <MetaBlock label="업체 코드" value={companyCode || '-'} />
          <MetaBlock label="업체명" value={companyName || '-'} />
          <MetaBlock label="모드" value={mode === 'create' ? '등록' : '수정'} />
        </div>

        {meta && (
          <div css={fieldBlock}>
            <Text typo="subtitle3" css={sectionTitleText}>
              프로그램 메타 정보
            </Text>
            <div css={metaGrid}>
              <MetaBlock label="프로그램 ID" value={String(meta.id)} />
              <MetaBlock label="상태" value={meta.status} />
              <MetaBlock label="활성 여부" value={meta.is_active ? 'Y' : 'N'} />
              <MetaBlock label="추천 여부" value={meta.is_featured ? 'Y' : 'N'} />
              <MetaBlock label="KRW 가격" value={meta.price_krw} />
              <MetaBlock label="USD 가격" value={meta.price_usd} />
              <MetaBlock label="조회수" value={String(meta.views_count)} />
              <MetaBlock label="예약수" value={String(meta.reservations_count)} />
              <MetaBlock label="생성일" value={formatDateTime(meta.created_at)} />
              <MetaBlock label="수정일" value={formatDateTime(meta.updated_at)} />
            </div>
          </div>
        )}
      </section>

      <section id={getProgramSectionDomId('basic')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          기본 정보
        </Text>
        <div css={fieldGrid}>
          <Input
            tone="dark"
            label="프로그램명"
            value={values.name}
            onChange={(event) => handleFieldChange('name', event.target.value)}
            errorMessage={errors.name}
            required
          />
          <Input
            tone="dark"
            label="가격 (KRW)"
            value={values.price}
            onChange={(event) => handleFieldChange('price', event.target.value)}
            errorMessage={errors.price}
            required
          />
          <Input
            tone="dark"
            label="소요시간(분)"
            value={values.duration_minutes}
            onChange={(event) => handleFieldChange('duration_minutes', event.target.value)}
            errorMessage={errors.duration_minutes}
          />
          {mode === 'edit' ? (
            <div css={fieldBlock}>
              <Text typo="subtitle3" css={sectionTitleText}>
                상태
              </Text>
              <select
                css={selectField}
                value={values.status}
                onChange={(event) =>
                  handleFieldChange(
                    'status',
                    event.target.value as AdminProgramFormValues['status']
                  )
                }
              >
                {ADMIN_PROGRAM_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div css={fieldBlock}>
              <Text typo="subtitle3" css={sectionTitleText}>
                상태
              </Text>
              <div css={readonlyField}>신규 등록 후 수정 화면에서 상태 변경 가능</div>
            </div>
          )}
        </div>
      </section>

      <section id={getProgramSectionDomId('overview')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          설명 및 안내
        </Text>
        <PreviewTextAreaField
          label="프로그램 설명"
          value={values.description}
          onChange={(event) => handleFieldChange('description', event.target.value)}
          errorMessage={errors.description}
          rows={7}
        />
        <PreviewTextAreaField
          label="안내사항"
          value={values.guidelines}
          onChange={(event) => handleFieldChange('guidelines', event.target.value)}
          rows={6}
        />
      </section>

      <section id={getProgramSectionDomId('process')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          진행 단계
        </Text>
        <PreviewTextAreaField
          label="프로세스"
          value={serializeProcessText(values.process)}
          onChange={(event) => handleFieldChange('process', parseProcessText(event.target.value))}
          errorMessage={errors.process}
          rows={8}
          previewTitle="단계 프리뷰"
          placeholder="한 줄에 한 단계씩 입력하세요."
        />
      </section>

      <section id={getProgramSectionDomId('images')} css={cardSection}>
        <Text tag="h2" typo="subtitle1" css={sectionTitleText}>
          이미지
        </Text>
        <Text typo="body10" css={helperText}>
          프로그램 이미지는 전체 교체 방식입니다. 생성 시 첫 번째 이미지가 대표 이미지가 됩니다.
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
      {PROGRAM_FORM_SECTIONS.map((section) => (
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

  if (isLoadingInitialData) {
    if (isSheetPresentation) {
      return (
        <FormSheet
          open
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          title={mode === 'create' ? '프로그램 등록' : '프로그램 수정'}
          description={companyName ? `${companyName} 프로그램 관리` : '프로그램 정보를 관리합니다.'}
          headerActions={
            <div css={actionRow}>
              <button type="button" css={secondaryButton} onClick={handleClose}>
                목록으로
              </button>
            </div>
          }
          width={1040}
        >
          <div css={sheetState}>
            <Loading title="프로그램 화면을 준비하는 중입니다." fullHeight />
          </div>
        </FormSheet>
      );
    }

    return <Loading title="프로그램 화면을 준비하는 중입니다." fullHeight />;
  }

  if (companyDetailQuery.isError) {
    if (isSheetPresentation) {
      return (
        <FormSheet
          open
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          title={mode === 'create' ? '프로그램 등록' : '프로그램 수정'}
          description={companyName ? `${companyName} 프로그램 관리` : '프로그램 정보를 관리합니다.'}
          headerActions={
            <div css={actionRow}>
              <button type="button" css={secondaryButton} onClick={handleClose}>
                목록으로
              </button>
            </div>
          }
          width={1040}
        >
          <div css={sheetState}>
            <ErrorPanel
              title="업체 정보를 불러오지 못했습니다."
              message={normalizeError(companyDetailQuery.error).message}
              onBack={handleClose}
              onRetry={() => void companyDetailQuery.refetch()}
            />
          </div>
        </FormSheet>
      );
    }

    return (
      <ErrorPanel
        title="업체 정보를 불러오지 못했습니다."
        message={normalizeError(companyDetailQuery.error).message}
        onBack={() => void router.push(ROUTES.ADMIN_COMPANIES)}
        onRetry={() => void companyDetailQuery.refetch()}
      />
    );
  }

  if (mode === 'edit' && programDetailQuery.isError) {
    if (isSheetPresentation) {
      return (
        <FormSheet
          open
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          title="프로그램 수정"
          description={companyName ? `${companyName} 프로그램 관리` : '프로그램 정보를 관리합니다.'}
          headerActions={
            <div css={actionRow}>
              <button type="button" css={secondaryButton} onClick={handleClose}>
                목록으로
              </button>
            </div>
          }
          width={1040}
        >
          <div css={sheetState}>
            <ErrorPanel
              title="프로그램 정보를 불러오지 못했습니다."
              message={normalizeError(programDetailQuery.error).message}
              onBack={handleClose}
              onRetry={() => void programDetailQuery.refetch()}
            />
          </div>
        </FormSheet>
      );
    }

    return (
      <ErrorPanel
        title="프로그램 정보를 불러오지 못했습니다."
        message={normalizeError(programDetailQuery.error).message}
        onBack={() => void router.push(ROUTES.ADMIN_COMPANY_PROGRAMS(companyId))}
        onRetry={() => void programDetailQuery.refetch()}
      />
    );
  }

  return isSheetPresentation ? (
    <FormSheet
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title={mode === 'create' ? '프로그램 등록' : '프로그램 수정'}
      description={companyName ? `${companyName} 프로그램 관리` : '프로그램 정보를 관리합니다.'}
      headerActions={sheetHeaderActions}
      sideNav={sheetSideNav}
      width={1040}
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
              {mode === 'create' ? '프로그램 등록' : '프로그램 수정'}
            </Text>
            <Text typo="body9" css={heroDescriptionText}>
              {companyName ? `${companyName} 프로그램 관리` : '프로그램 정보를 관리합니다.'}
            </Text>
          </div>
          <div css={actionRow}>
            <button
              type="button"
              css={secondaryButton}
              onClick={() => void router.push(ROUTES.ADMIN_COMPANY_EDIT(companyId))}
            >
              업체 수정
            </button>
            <button
              type="button"
              css={secondaryButton}
              onClick={() => void router.push(ROUTES.ADMIN_COMPANY_PROGRAMS(companyId))}
            >
              프로그램 목록
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
    </div>
  );
}

function PreviewTextAreaField({
  label,
  value,
  onChange,
  errorMessage,
  rows = 5,
  previewTitle = '프리뷰',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  errorMessage?: string;
  rows?: number;
  previewTitle?: string;
  placeholder?: string;
}) {
  const previewText = decodeAdminPreviewText(value);

  return (
    <div css={fieldBlock}>
      <Text typo="subtitle3" css={sectionTitleText}>
        {label}
      </Text>
      <div css={textAreaPreviewLayout}>
        <div css={editorPanel}>
          <textarea
            css={textareaField(Boolean(errorMessage))}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
          />
          {errorMessage && (
            <Text typo="body12" color="red200">
              {errorMessage}
            </Text>
          )}
        </div>
        <div css={previewPanel}>
          <div css={previewHeader}>
            <Text typo="body6" css={previewTitleText}>
              {previewTitle}
            </Text>
            <Text typo="body12" css={helperText}>
              줄바꿈/이스케이프 문자를 해석해서 표시합니다.
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
      </div>
    </div>
  );
}

function ErrorPanel({
  title,
  message,
  onBack,
  onRetry,
}: {
  title: string;
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div css={pageWrapper}>
      <div css={pageInner}>
        <section css={cardSection}>
          <Text tag="h1" typo="title1" css={heroTitleText}>
            {title}
          </Text>
          <Text typo="body9" css={heroDescriptionText}>
            {message}
          </Text>
          <div css={actionRow}>
            <button type="button" css={secondaryButton} onClick={onBack}>
              돌아가기
            </button>
            <button type="button" css={primaryButton} onClick={onRetry}>
              다시 시도
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
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

const actionRow = adminHeroActions;

const baseButton = css`
  border: none;
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
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

const cardSection = css`
  ${adminSurfacePanel};
  gap: 16px;

  & input:not([type='checkbox']):not([type='file'])::placeholder,
  & textarea::placeholder {
    color: ${adminConsolePalette.textDim};
  }
`;

const metaBanner = css`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const selectField = css`
  width: 100%;
  border-radius: 16px;
  border: 1px solid ${adminConsolePalette.borderStrong};
  background: rgba(255, 255, 255, 0.04);
  padding: 14px 16px;
  font-size: 14px;
  color: ${adminConsolePalette.textStrong};
`;

const readonlyField = css`
  width: 100%;
  border-radius: 16px;
  border: 1px solid ${adminConsolePalette.borderStrong};
  background: rgba(255, 255, 255, 0.04);
  padding: 14px 16px;
  font-size: 14px;
  color: ${adminConsolePalette.textSubtle};
`;

const textAreaPreviewLayout = css`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
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
  min-height: clamp(220px, 24vw, 360px);
  border-radius: 16px;
  border: 1px solid ${hasError ? colors.red200 : adminConsolePalette.borderStrong};
  background: rgba(255, 255, 255, 0.04);
  padding: 14px 16px;
  font-size: 14px;
  color: ${adminConsolePalette.textStrong};
  resize: vertical;
  outline: none;
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
