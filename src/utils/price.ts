export type CurrencyCode = 'KRW' | 'USD';

interface PriceInfo {
  krw?: number | null;
  usd?: number | null;
}

interface ResolvePriceParams {
  currency: CurrencyCode;
  priceInfo?: PriceInfo | null;
}

export const resolvePrice = ({ currency, priceInfo }: ResolvePriceParams) => {
  const nextPrice = currency === 'USD' ? priceInfo?.usd : priceInfo?.krw;
  if (typeof nextPrice === 'number') return nextPrice;
  return undefined;
};
