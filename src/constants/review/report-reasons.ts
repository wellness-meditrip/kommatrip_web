import type { ReportReviewReason } from '@/models';

export const REVIEW_REPORT_REASONS: ReadonlyArray<{
  value: ReportReviewReason;
  labelKey: string;
}> = [
  { value: 'commercial_promotional', labelKey: 'report.reasons.commercial' },
  { value: 'pornographic_harmful', labelKey: 'report.reasons.harmful' },
  { value: 'personal_attack_offensive', labelKey: 'report.reasons.offensive' },
  { value: 'personal_information_exposure', labelKey: 'report.reasons.privacy' },
  { value: 'other', labelKey: 'report.reasons.other' },
] as const;
