import { AppBarBack } from '@/icons';
import { Text } from '../text';
import { contents, wrapper, center } from './index.styles';

interface Props {
  onBackClick?: () => void;
  showBackButton?: boolean;
  title?: string;
  backgroundColor?: string;
  isWhite?: boolean;
}

export function AppBar({ onBackClick, title, showBackButton = false }: Props) {
  return (
    <header css={wrapper}>
      <div css={contents}>
        {showBackButton && (
          <button onClick={onBackClick}>
            <AppBarBack width="24px" height="24px" />
          </button>
        )}
        <div css={center}>
          {title && (
            <Text color="text_primary" typo="title_L">
              {title}
            </Text>
          )}
        </div>
      </div>
    </header>
  );
}
