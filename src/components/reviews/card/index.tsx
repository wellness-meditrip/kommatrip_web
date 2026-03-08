import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Text } from '@/components';
import { DefaultProfile, ReviewFold, ReviewUnfold, Clock, Wallet, ChevronRight } from '@/icons';
import { ROUTES } from '@/constants';
import { useTranslations } from 'next-intl';
import {
  clampText,
  reviewerInfo,
  imageWrapper,
  contentWrapper,
  tagsWrapper,
  tagWrapper,
  wrapper,
  top,
  reviewContent,
  programCard,
  programImage,
  programInfo,
  programTitle,
  programMetaRow,
  programMeta,
  programArrow,
  menuButton,
  menuDots,
  menuDot,
  actionArea,
  reportButton,
} from './index.styles';
import dayjs from 'dayjs';

interface Props {
  reviewId: number;
  reviewerName: string;
  reviewerImageUrl: string | null;
  keywordReviewList: string[];
  content: string | null;
  imageUrlList: string[] | null;
  createdAt: string;
  programId?: number | null;
  companyId?: number | null;
  programName?: string | null;
  programPrice?: number | null;
  programDurationMinutes?: number | null;
  programImageUrl?: string | null;
  onCardClick?: () => void;
  onMenuClick?: (reviewId: number) => void;
  onReportClick?: (reviewId: number) => void;
}

export function Card({
  reviewId,
  keywordReviewList,
  reviewerName,
  reviewerImageUrl,
  content,
  imageUrlList,
  createdAt,
  programId,
  companyId,
  programName,
  programPrice,
  programDurationMinutes,
  programImageUrl,
  onCardClick,
  onMenuClick,
  onReportClick,
}: Props) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const router = useRouter();
  const t = useTranslations('review');

  const handleProgramClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!companyId) return;
    const pathname = ROUTES.COMPANY_PROGRAM(companyId);
    const query = programId ? { programId } : undefined;
    router.push({ pathname, query });
  };

  const formattedPrice =
    programPrice !== null && programPrice !== undefined
      ? `${new Intl.NumberFormat('en-US').format(programPrice)} KRW`
      : '';
  const formattedDuration = programDurationMinutes ? `${programDurationMinutes} mins` : '';

  return (
    <div css={wrapper} onClick={onCardClick}>
      <div css={top}>
        <div css={reviewerInfo}>
          {reviewerImageUrl ? (
            <Image src={reviewerImageUrl} alt={t('reviewerImageAlt')} width={50} height={50} />
          ) : (
            <DefaultProfile width={50} height={50} />
            // <Image src="/default.png" alt="기본 이미지" width={50} height={50} />
          )}
        </div>

        <div css={reviewContent}>
          <Text typo="button_M" color="text_primary">
            {reviewerName}
          </Text>
          <Text typo="body_S" color="text_secondary">
            {t('firstTimeVisitorMeta', { date: dayjs(createdAt).format('YY.MM.DD') })}
          </Text>
        </div>

        {(onMenuClick || onReportClick) && (
          <div css={actionArea}>
            {onReportClick && (
              <button
                css={reportButton}
                onClick={(event) => {
                  event.stopPropagation();
                  onReportClick(reviewId);
                }}
              >
                <Text typo="body_S" color="text_tertiary">
                  {t('report.action')}
                </Text>
              </button>
            )}
            {onMenuClick && (
              <button
                css={menuButton}
                aria-label={t('moreOptions')}
                onClick={(event) => {
                  event.stopPropagation();
                  onMenuClick(reviewId);
                }}
              >
                <span css={menuDots}>
                  <span css={menuDot} />
                  <span css={menuDot} />
                  <span css={menuDot} />
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {programName && (
        <div css={programCard} onClick={handleProgramClick}>
          <img src={programImageUrl || '/default.png'} alt="program" css={programImage} />
          <div css={programInfo}>
            <Text typo="title_S" color="text_primary" css={programTitle}>
              {programName}
            </Text>
            <div css={programMetaRow}>
              {formattedDuration && (
                <div css={programMeta}>
                  <Clock width={14} height={14} />
                  <Text typo="button_S" color="text_secondary">
                    {formattedDuration}
                  </Text>
                </div>
              )}
              {formattedPrice && (
                <div css={programMeta}>
                  <Wallet width={14} height={14} />
                  <Text typo="button_S" color="text_secondary">
                    {formattedPrice}
                  </Text>
                </div>
              )}
            </div>
          </div>
          <div css={programArrow}>
            <ChevronRight width={16} height={16} />
          </div>
        </div>
      )}

      {imageUrlList && !!imageUrlList?.length && (
        <div css={imageWrapper}>
          {imageUrlList?.map((url, index) => (
            <Image
              key={url}
              src={url}
              alt={t('reviewImageAlt', { index: index + 1 })}
              width={120}
              height={120}
            />
          ))}
        </div>
      )}

      {content && (
        <>
          <Text
            tag="p"
            typo="body_M"
            color="text_secondary"
            css={[contentWrapper, !isExpanded && clampText]}
          >
            {content}
          </Text>

          <button
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ReviewFold width="6px" /> : <ReviewUnfold width="6px" />}
          </button>
        </>
      )}
      <div css={tagsWrapper}>
        {keywordReviewList.length > 0 &&
          keywordReviewList.map((tag) => (
            <div key={tag} css={tagWrapper}>
              <Text typo="body_S" color="text_tertiary">
                {`${tag}`}
              </Text>
            </div>
          ))}
      </div>
    </div>
  );
}
