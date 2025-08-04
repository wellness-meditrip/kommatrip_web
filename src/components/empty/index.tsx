import type { CSSObject } from '@emotion/react';
// import { EmptyLogo } from '@/icons/';
import { Text } from '@/components';
import { RoundButton } from '@/components/button';
import { wrapper } from './index.styles';

interface Props {
  title: string;
  actionLabel?: string;
  onActionButtonClick?: () => void;
  css?: CSSObject;
}

export function Empty({ title, actionLabel, onActionButtonClick, css }: Props) {
  return (
    <div css={[wrapper, css]}>
      {/* <EmptyLogo width={42} height={47} /> */}
      <Text tag="p" typo="subtitle3" color="gray400">
        {title}
      </Text>

      {actionLabel && (
        <RoundButton size="S" onClick={onActionButtonClick}>
          <Text typo="body4" color="white">
            {actionLabel}
          </Text>
        </RoundButton>
      )}
    </div>
  );
}
