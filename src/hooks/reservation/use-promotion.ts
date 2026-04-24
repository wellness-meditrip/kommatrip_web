import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePostValidatePromotionMutation } from '@/queries/payment';
import { useToast, useErrorHandler } from '@/hooks';
import type { CurrencyCode } from '@/utils/price';

export interface VerifiedPromotion {
  code: string;
  currency: CurrencyCode;
  originalPrice: number;
  finalPrice: number;
}

type PromotionSelection = 'none' | 'verified';

export interface UsePromotionReturn {
  codeInput: string;
  verified: VerifiedPromotion | null;
  applied: VerifiedPromotion | null;
  selection: PromotionSelection;
  isValidationPending: boolean;
  handleCodeInputChange: (value: string) => void;
  handleValidateCode: (programId: number, currency: CurrencyCode) => Promise<void>;
  handleSelectNone: () => void;
  handleSelectVerified: () => void;
  handleApply: () => void;
  reset: () => void;
}

export const usePromotion = (): UsePromotionReturn => {
  const t = useTranslations('reservation');
  const { showToast } = useToast();
  const { showErrorToast } = useErrorHandler();
  const { mutateAsync: validatePromotion, isPending: isValidationPending } =
    usePostValidatePromotionMutation();

  const [codeInput, setCodeInput] = useState('');
  const [verified, setVerified] = useState<VerifiedPromotion | null>(null);
  const [applied, setApplied] = useState<VerifiedPromotion | null>(null);
  const [selection, setSelection] = useState<PromotionSelection>('none');

  const handleCodeInputChange = (value: string) => setCodeInput(value);

  const handleValidateCode = async (programId: number, currency: CurrencyCode) => {
    const code = codeInput.trim().toUpperCase();
    if (!code) {
      showToast({ title: t('payment.promotionCodeRequired'), icon: 'exclaim' });
      return;
    }
    try {
      const res = await validatePromotion({
        program_id: programId,
        promotion_code: code,
        currency,
      });
      const next: VerifiedPromotion = {
        code,
        currency: res.currency,
        originalPrice: res.original_price,
        finalPrice: res.final_price,
      };
      setCodeInput(code);
      setVerified(next);
      setSelection('verified');
      showToast({ title: t('payment.promotionCodeValidated'), icon: 'check' });
    } catch (error) {
      setVerified(null);
      showErrorToast(error, { overrideMessage: t('payment.promotionValidateFailed') });
    }
  };

  const handleSelectNone = () => {
    setSelection('none');
    setApplied(null);
  };

  const handleSelectVerified = () => {
    if (!verified) return;
    setSelection('verified');
  };

  const handleApply = () => {
    if (!verified) return;
    setSelection('verified');
    setApplied(verified);
    setCodeInput(verified.code);
    showToast({ title: t('payment.promotionCodeApplied'), icon: 'check' });
  };

  const reset = () => {
    setCodeInput('');
    setVerified(null);
    setApplied(null);
    setSelection('none');
  };

  return {
    codeInput,
    verified,
    applied,
    selection,
    isValidationPending,
    handleCodeInputChange,
    handleValidateCode,
    handleSelectNone,
    handleSelectVerified,
    handleApply,
    reset,
  };
};
