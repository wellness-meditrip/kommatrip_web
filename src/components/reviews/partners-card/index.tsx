import { Text } from '@/components';
import { wrapper, plan, date } from './index.styles';

export function PartnersCard({
  partnerName,
  shopName,
  schedule,
}: {
  partnerName: string;
  shopName: string | null;
  schedule: string;
}) {
  return (
    <div css={wrapper}>
      <Text typo="subtitle1">{partnerName}</Text>
      <Text typo="body9" color="gray400">
        {shopName}
      </Text>
      <div css={plan}>
        <Text typo="body4" color="gray400">
          일정
        </Text>
        <div css={date}>
          <Text typo="body4">{schedule}</Text>
        </div>
      </div>
    </div>
  );
}
