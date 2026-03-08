import { useEffect, useMemo, useState } from 'react';
import { Portal, Dim, Text } from '@/components';
import { useTranslations } from 'next-intl';
import type { ReportReviewReason } from '@/models';
import { REVIEW_REPORT_REASONS } from '@/constants';
import {
  modalWrapper,
  closeButton,
  title as titleStyle,
  optionList,
  optionRow,
  radio,
  textarea,
  submitButton,
} from './index.styles';

interface ReasonOption<TReason extends string> {
  value: TReason;
  label: string;
}

interface ReasonModalProps<TReason extends string = ReportReviewReason> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  closeAriaLabel?: string;
  submitLabel?: string;
  reasons?: readonly ReasonOption<TReason>[];
  radioName?: string;
  showDetailField?: boolean;
  detailPlaceholder?: string;
  otherReasonValue?: TReason;
  onSubmit?: (payload: { reason: TReason; detail: string }) => void;
}

export function ReasonModal<TReason extends string = ReportReviewReason>({
  isOpen,
  onClose,
  title,
  closeAriaLabel,
  submitLabel,
  reasons,
  radioName = 'report-reason',
  showDetailField = true,
  detailPlaceholder,
  otherReasonValue,
  onSubmit,
}: ReasonModalProps<TReason>) {
  const t = useTranslations('review');
  const [selectedReason, setSelectedReason] = useState<TReason | ''>('');
  const [detail, setDetail] = useState('');

  const defaultReasons = useMemo(
    () =>
      REVIEW_REPORT_REASONS.map((item) => ({
        value: item.value,
        label: t(item.labelKey),
      })) as readonly ReasonOption<ReportReviewReason>[],
    [t]
  );
  const resolvedReasons = (reasons ?? defaultReasons) as readonly ReasonOption<TReason>[];
  const resolvedOtherReasonValue = (otherReasonValue ?? ('other' as TReason)) as TReason;

  useEffect(() => {
    if (!isOpen) return;
    setSelectedReason('');
    setDetail('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isOtherSelected = selectedReason === resolvedOtherReasonValue;
  const isSubmitDisabled =
    !selectedReason || (showDetailField && isOtherSelected && !detail.trim());

  const handleSubmit = () => {
    if (!selectedReason) return;
    if (showDetailField && isOtherSelected && !detail.trim()) return;
    onSubmit?.({ reason: selectedReason, detail: detail.trim() });
    onClose();
  };

  return (
    <Portal>
      <Dim fullScreen onClick={onClose} />
      <div css={modalWrapper} role="dialog" aria-modal="true">
        <button
          css={closeButton}
          aria-label={closeAriaLabel ?? t('report.close')}
          onClick={onClose}
        >
          X
        </button>
        <div css={titleStyle}>
          <Text typo="title_M" color="text_primary">
            {title ?? t('report.title')}
          </Text>
        </div>
        <div css={optionList}>
          {resolvedReasons.map((reason) => (
            <label key={reason.value} css={optionRow}>
              <input
                type="radio"
                name={radioName}
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={() => setSelectedReason(reason.value)}
                css={radio}
              />
              <Text typo="body_M" color="text_secondary">
                {reason.label}
              </Text>
            </label>
          ))}
        </div>
        {showDetailField && (
          <textarea
            css={textarea}
            placeholder={detailPlaceholder ?? t('report.placeholder')}
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
          />
        )}
        <button css={submitButton} onClick={handleSubmit} disabled={isSubmitDisabled}>
          <Text typo="button_M" color="white">
            {submitLabel ?? t('report.submit')}
          </Text>
        </button>
      </div>
    </Portal>
  );
}

// Backward compatibility for existing imports
export const ReportModal = ReasonModal;
