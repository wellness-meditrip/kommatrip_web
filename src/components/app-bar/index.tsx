import { AppBarBack, Logo } from '@/icons';
import { Text } from '../text';
import { contents, wrapper, wrapperWithBackground, center, backButton } from './index.styles';

interface Props {
  onBackClick?: () => void;
  showBackButton?: boolean;
  title?: string;
  logo?: boolean;
  backgroundColor?: string;
  isWhite?: boolean;
}

export function AppBar({ onBackClick, title, logo = false, showBackButton = false }: Props) {
  return (
    <header css={showBackButton ? wrapperWithBackground : wrapper}>
      <div css={contents}>
        {showBackButton && (
          <button onClick={onBackClick} css={backButton}>
            <AppBarBack width="24px" height="24px" />
          </button>
        )}
        <div css={center}>
          {logo && <Logo width="70px" height="30px" />}
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
