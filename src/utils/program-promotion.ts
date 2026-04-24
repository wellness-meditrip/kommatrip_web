import type { ProgramPriceInfo } from '@/models/program';
import type { CurrencyCode } from './price';
import {
  getTheGateSpaPriceDisplay,
  resolveTheGateSpaOriginalPrice,
  type ProgramPriceDisplay,
} from './the-gate-spa-discount';

type CompanyLike =
  | {
      name?: string | null;
      company_code?: string | null;
    }
  | null
  | undefined;

export interface ProgramPromotionSummary {
  hasDiscount: boolean;
  priceDisplay: ProgramPriceDisplay;
  originalPrice?: number;
  finalPrice?: number;
  originalPriceText: string;
  finalPriceText: string;
  discountAmountText?: string;
}

interface ResolvedDiscountValues {
  originalPrice: number;
  finalPrice: number;
  rateText?: string;
}

const getCurrentPrice = (priceInfo: ProgramPriceInfo | undefined, currency: CurrencyCode) => {
  if (!priceInfo) return undefined;
  return currency === 'USD' ? priceInfo.usd : priceInfo.krw;
};

const getDiscountValues = ((priceInfo: ProgramPriceInfo | undefined, currency: CurrencyCode) => {
  const discountInfo = priceInfo?.discount_info;
  if (!discountInfo) return null;

  const originalPrice = currency === 'USD' ? discountInfo.original_usd : discountInfo.original_krw;
  const finalPrice = currency === 'USD' ? discountInfo.discounted_usd : discountInfo.discounted_krw;

  if (typeof originalPrice !== 'number' || typeof finalPrice !== 'number') {
    return null;
  }

  return {
    originalPrice,
    finalPrice,
    rateText: `${Math.round(discountInfo.rate * 100)}%`,
  };
}) satisfies (
  priceInfo: ProgramPriceInfo | undefined,
  currency: CurrencyCode
) => ResolvedDiscountValues | null;

const formatDiscountAmount = (
  originalPrice: number,
  finalPrice: number,
  currency: CurrencyCode,
  formatAmount: (price: number, currency: CurrencyCode) => string
) => {
  const rawDiscountAmount = originalPrice - finalPrice;
  const discountAmount =
    currency === 'USD'
      ? Number(Math.max(rawDiscountAmount, 0).toFixed(2))
      : Math.round(Math.max(rawDiscountAmount, 0));

  return `- ${formatAmount(discountAmount, currency)}`;
};

const resolveRateText = ({ originalPrice, finalPrice, rateText }: ResolvedDiscountValues) => {
  if (typeof rateText === 'string' && rateText.trim().length > 0) {
    return rateText;
  }

  if (originalPrice <= 0) return '';
  const rate = 1 - finalPrice / originalPrice;
  if (!Number.isFinite(rate) || rate <= 0) return '';
  return `${Math.round(rate * 100)}%`;
};

export const getProgramPromotionSummary = ({
  priceInfo,
  currency,
  formatAmount,
  fallbackText = '',
  company,
  useDiscountInfo = false,
  overrideDiscount,
}: {
  priceInfo?: ProgramPriceInfo;
  currency: CurrencyCode;
  formatAmount: (price: number, currency: CurrencyCode) => string;
  fallbackText?: string;
  company?: CompanyLike;
  useDiscountInfo?: boolean;
  overrideDiscount?: ResolvedDiscountValues | null;
}): ProgramPromotionSummary => {
  const resolvedDiscountValues =
    overrideDiscount ?? (useDiscountInfo ? getDiscountValues(priceInfo, currency) : null);
  if (resolvedDiscountValues) {
    const originalPriceText = formatAmount(resolvedDiscountValues.originalPrice, currency);
    const finalPriceText = formatAmount(resolvedDiscountValues.finalPrice, currency);

    return {
      hasDiscount: true,
      priceDisplay: {
        type: 'discount',
        discountRateText: resolveRateText(resolvedDiscountValues),
        originalPriceText,
        discountedPriceText: finalPriceText,
      },
      originalPrice: resolvedDiscountValues.originalPrice,
      finalPrice: resolvedDiscountValues.finalPrice,
      originalPriceText,
      finalPriceText,
      discountAmountText: formatDiscountAmount(
        resolvedDiscountValues.originalPrice,
        resolvedDiscountValues.finalPrice,
        currency,
        formatAmount
      ),
    };
  }

  const currentPrice = getCurrentPrice(priceInfo, currency);
  if (typeof currentPrice !== 'number') {
    return {
      hasDiscount: false,
      priceDisplay: {
        type: 'regular',
        priceText: fallbackText,
      },
      originalPriceText: fallbackText,
      finalPriceText: fallbackText,
    };
  }

  const legacyDiscountDisplay = getTheGateSpaPriceDisplay({
    company,
    discountedPrice: currentPrice,
    currency,
    formatAmount,
    fallbackText,
  });

  if (useDiscountInfo && legacyDiscountDisplay.type === 'discount') {
    const originalPrice = resolveTheGateSpaOriginalPrice({
      discountedPrice: currentPrice,
      currency,
    });

    if (typeof originalPrice === 'number') {
      return {
        hasDiscount: true,
        priceDisplay: legacyDiscountDisplay,
        originalPrice,
        finalPrice: currentPrice,
        originalPriceText: legacyDiscountDisplay.originalPriceText,
        finalPriceText: legacyDiscountDisplay.discountedPriceText,
        discountAmountText: formatDiscountAmount(
          originalPrice,
          currentPrice,
          currency,
          formatAmount
        ),
      };
    }
  }

  const priceText = formatAmount(currentPrice, currency);
  return {
    hasDiscount: false,
    priceDisplay: {
      type: 'regular',
      priceText,
    },
    originalPrice: currentPrice,
    finalPrice: currentPrice,
    originalPriceText: priceText,
    finalPriceText: priceText,
  };
};
