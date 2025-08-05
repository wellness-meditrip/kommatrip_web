import { Text } from '@/components';
import { wrapper } from './index.styles';

interface Props {
  total: number;
}

export function ReviewSummary({ total }: Props) {
  return (
    <div css={wrapper}>
      <Text typo="body4">
        총{' '}
        <Text typo="body4" color="green200">
          {total}
        </Text>
        개
      </Text>
    </div>
  );
}
