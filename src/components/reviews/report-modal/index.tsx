import { useEffect, useMemo, useState } from 'react';
import { Portal, Dim, Text } from '@/components';
import { useTranslations } from 'next-intl';
import type { ReportReviewReason } from '@/models';
import {
  modalWrapper,
  closeButton,
  title,
  optionList,
  optionRow,
  radio,
  textarea,
  submitButton,
} from './index.styles';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (payload: { reason: ReportReviewReason; detail: string }) => void;
}

export function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const t = useTranslations('review');
  const [selectedReason, setSelectedReason] = useState<ReportReviewReason | ''>('');
  const [detail, setDetail] = useState('');

  const reasons = useMemo(
    () =>
      [
        { value: 'commercial_promotional', label: t('report.reasons.commercial') },
        { value: 'pornographic_harmful', label: t('report.reasons.harmful') },
        { value: 'personal_attack_offensive', label: t('report.reasons.offensive') },
        { value: 'personal_information_exposure', label: t('report.reasons.privacy') },
        { value: 'other', label: t('report.reasons.other') },
      ] as const,
    [t]
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedReason('');
    setDetail('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isOtherSelected = selectedReason === 'other';
  const isSubmitDisabled = !selectedReason || (isOtherSelected && !detail.trim());

  const handleSubmit = () => {
    if (!selectedReason) return;
    if (isOtherSelected && !detail.trim()) return;
    onSubmit?.({ reason: selectedReason, detail: detail.trim() });
    onClose();
  };

  return (
    <Portal>
      <Dim fullScreen onClick={onClose} />
      <div css={modalWrapper} role="dialog" aria-modal="true">
        <button css={closeButton} aria-label={t('report.close')} onClick={onClose}>
          X
        </button>
        <div css={title}>
          <Text typo="title_M" color="text_primary">
            {t('report.title')}
          </Text>
        </div>
        <div css={optionList}>
          {reasons.map((reason) => (
            <label key={reason.value} css={optionRow}>
              <input
                type="radio"
                name="report-reason"
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
        <textarea
          css={textarea}
          placeholder={t('report.placeholder')}
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
        />
        <button css={submitButton} onClick={handleSubmit} disabled={isSubmitDisabled}>
          <Text typo="button_M" color="white">
            {t('report.submit')}
          </Text>
        </button>
      </div>
    </Portal>
  );
}
