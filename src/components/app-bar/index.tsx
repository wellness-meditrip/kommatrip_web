import { Logo, ChevronLeftWhite, Chevron, Share, ShareWhite } from '@/icons';
import { Text } from '../text';
import { contents, wrapper, center, backButton, rightButton } from './index.styles';

type ButtonType = 'styled' | 'white' | 'dark';
type BackgroundColor = 'none' | 'white' | 'green' | 'bg_surface1';
type RightButtonType = 'share' | 'shareWhite';

interface Props {
  onBackClick?: () => void;
  leftButton?: boolean;
  buttonType?: ButtonType;
  title?: string;
  logo?: boolean;
  backgroundColor?: BackgroundColor;
  rightButton?: boolean;
  rightButtonType?: RightButtonType;
  onRightButtonClick?: () => void;
}

export function AppBar({
  onBackClick,
  title,
  logo = false,
  leftButton = false,
  buttonType = 'styled',
  backgroundColor = 'none',
  rightButton = false,
  rightButtonType = 'share',
  onRightButtonClick,
}: Props) {
  const getBackgroundStyle = () => {
    switch (backgroundColor) {
      case 'white':
        return wrapper({ backgroundColor: 'white' });
      case 'green':
        return wrapper({ backgroundColor: 'green' });
      case 'bg_surface1':
        return wrapper({ backgroundColor: 'bg_surface1' });
      default:
        return wrapper({ backgroundColor: 'transparent' });
    }
  };

  const getButtonIcon = () => {
    switch (buttonType) {
      case 'white':
        return <ChevronLeftWhite width="24px" height="24px" />;
      case 'dark':
        return <Chevron width="24px" height="24px" />;
      case 'styled':
        return <ChevronLeftWhite width="24px" height="24px" />;
      default:
        return <Chevron width="24px" height="24px" />;
    }
  };

  const getRightButtonIcon = () => {
    switch (rightButtonType) {
      case 'shareWhite':
        return <ShareWhite width="24px" height="24px" />;
      default:
        return <Share width="24px" height="24px" />;
    }
  };

  return (
    <header css={getBackgroundStyle()}>
      <div css={contents}>
        {leftButton && (
          <button onClick={onBackClick} css={backButton({ buttonType })}>
            {getButtonIcon()}
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
        {rightButton && (
          <button onClick={onRightButtonClick} css={rightButton}>
            {getRightButtonIcon()}
          </button>
        )}
      </div>
    </header>
  );
}
