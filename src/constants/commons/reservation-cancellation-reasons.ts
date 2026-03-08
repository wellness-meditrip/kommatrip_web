export const RESERVATION_CANCELLATION_REASONS = [
  { key: 'personal_reasons', labelKey: 'cancelModal.reasons.personalReasons' },
  { key: 'update_booking_info', labelKey: 'cancelModal.reasons.updateBookingInfo' },
  { key: 'provider_issues', labelKey: 'cancelModal.reasons.providerIssues' },
  { key: 'better_price', labelKey: 'cancelModal.reasons.betterPrice' },
  { key: 'service_quality', labelKey: 'cancelModal.reasons.serviceQuality' },
  {
    key: 'unavoidable_circumstances',
    labelKey: 'cancelModal.reasons.unavoidableCircumstances',
  },
  { key: 'other', labelKey: 'cancelModal.reasons.other' },
] as const;

export type ReservationCancellationReasonKey =
  (typeof RESERVATION_CANCELLATION_REASONS)[number]['key'];
