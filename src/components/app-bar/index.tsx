import { Logo, LogoDark, ChevronLeftWhite, Chevron, Share, ShareWhite } from '@/icons';
import { Text } from '../text';
import { contents, wrapper, center, leftButtonWrapper, rightButtonWrapper } from './index.styles';

type ButtonType = 'styled' | 'white' | 'dark';
type BackgroundColor = 'none' | 'white' | 'green' | 'bg_surface1';
type RightButtonType = 'share' | 'shareWhite';
type LogoType = 'light' | 'dark';

interface Props {
  onBackClick?: () => void;
  leftButton?: boolean;
  buttonType?: ButtonType;
  title?: string;
  logo?: LogoType;
  backgroundColor?: BackgroundColor;
  rightButton?: boolean;
  rightButtonType?: RightButtonType;
  onRightButtonClick?: () => void;
}

const BACKGROUND_COLOR_MAP: Record<
  BackgroundColor,
  'white' | 'green' | 'bg_surface1' | 'transparent'
> = {
  white: 'white',
  green: 'green',
  bg_surface1: 'bg_surface1',
  none: 'transparent',
} as const;

const BUTTON_ICON_MAP = {
  white: <ChevronLeftWhite width="24px" height="24px" />,
  styled: <ChevronLeftWhite width="24px" height="24px" />,
  dark: <Chevron width="24px" height="24px" />,
} as const;

const RIGHT_BUTTON_ICON_MAP = {
  shareWhite: <ShareWhite width="24px" height="24px" />,
  share: <Share width="24px" height="24px" />,
} as const;

const LOGO_MAP = {
  light: <Logo width="70px" height="30px" />,
  dark: <LogoDark width="70px" height="30px" />,
} as const;

export function AppBar({
  onBackClick,
  title,
  logo,
  leftButton = false,
  buttonType = 'styled',
  backgroundColor = 'none',
  rightButton = false,
  rightButtonType = 'share',
  onRightButtonClick,
}: Props) {
  return (
    <header css={wrapper({ backgroundColor: BACKGROUND_COLOR_MAP[backgroundColor] })}>
      <div css={contents}>
        {leftButton && (
          <button onClick={onBackClick} css={leftButtonWrapper({ buttonType })}>
            {BUTTON_ICON_MAP[buttonType]}
          </button>
        )}
        <div css={center}>
          {logo && LOGO_MAP[logo]}
          {title && (
            <Text color="text_primary" typo="title_L">
              {title}
            </Text>
          )}
        </div>
        {rightButton && (
          <button onClick={onRightButtonClick} css={rightButtonWrapper({ buttonType })}>
            {RIGHT_BUTTON_ICON_MAP[rightButtonType]}
          </button>
        )}
      </div>
    </header>
  );
}
