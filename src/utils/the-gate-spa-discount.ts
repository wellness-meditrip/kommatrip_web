import type { CurrencyCode } from './price';

const THE_GATE_SPA_IDENTIFIERS = ['더게이트스파', 'thegatespa'];
const THE_GATE_SPA_DISCOUNT_RATE_TEXT = '30%';
const THE_GATE_SPA_DISCOUNT_MULTIPLIER = 0.7;

const normalizeIdentifier = (value?: string | null) =>
  (value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '');

export const isTheGateSpaCompany = (
  company?: {
    name?: string | null;
    company_code?: string | null;
  } | null
) => {
  if (!company) return false;

  return [company.name, company.company_code].some((value) => {
    const normalizedValue = normalizeIdentifier(value);
    return THE_GATE_SPA_IDENTIFIERS.some((identifier) => normalizedValue.includes(identifier));
  });
};

export const resolveTheGateSpaOriginalPrice = ({
  discountedPrice,
  currency,
}: {
  discountedPrice: number;
  currency: CurrencyCode;
}) => {
  if (!Number.isFinite(discountedPrice)) return undefined;

  const originalPrice = discountedPrice / THE_GATE_SPA_DISCOUNT_MULTIPLIER;
  if (currency === 'KRW') return Math.round(originalPrice);
  return Number(originalPrice.toFixed(2));
};

export type ProgramPriceDisplay =
  | {
      type: 'regular';
      priceText: string;
    }
  | {
      type: 'discount';
      discountRateText: string;
      originalPriceText: string;
      discountedPriceText: string;
    };

export const getTheGateSpaPriceDisplay = ({
  company,
  discountedPrice,
  currency,
  formatAmount,
  fallbackText = '',
}: {
  company?: {
    name?: string | null;
    company_code?: string | null;
  } | null;
  discountedPrice?: number;
  currency: CurrencyCode;
  formatAmount: (price: number, currency: CurrencyCode) => string;
  fallbackText?: string;
}): ProgramPriceDisplay => {
  if (typeof discountedPrice !== 'number') {
    return {
      type: 'regular',
      priceText: fallbackText,
    };
  }

  const priceText = formatAmount(discountedPrice, currency);
  if (!isTheGateSpaCompany(company)) {
    return {
      type: 'regular',
      priceText,
    };
  }

  const originalPrice = resolveTheGateSpaOriginalPrice({
    discountedPrice,
    currency,
  });

  if (typeof originalPrice !== 'number') {
    return {
      type: 'regular',
      priceText,
    };
  }

  return {
    type: 'discount',
    discountRateText: THE_GATE_SPA_DISCOUNT_RATE_TEXT,
    originalPriceText: formatAmount(originalPrice, currency),
    discountedPriceText: priceText,
  };
};
