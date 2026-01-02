import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = ({ variant }: { variant: 'default' | 'transparent' }) => css`
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.appBar};

  width: 100%;
  height: 76px;
  padding: 0 24px;

  background: ${variant === 'transparent'
    ? 'transparent'
    : 'linear-gradient(135deg, #2d3e36 0%, #476155 50%, #749a88 100%)'};
  box-shadow: ${variant === 'transparent' ? 'none' : '0 2px 8px rgb(0 0 0 / 10%)'};
`;

export const logo = css`
  flex-shrink: 0;
`;

export const searchContainer = css`
  display: flex;
  flex: 1;
  justify-content: flex-start;
  gap: 12px;

  max-width: 600px;
  padding: 10px 0 0;
`;

export const menuWrapper = css`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
`;

export const menuList = css`
  display: flex;
  align-items: center;
  gap: 20px;
  list-style: none;

  li {
    padding: 0 0 2px;

    color: ${theme.colors.white};
    font-size: ${theme.typo.body_M};

    transition: border-bottom 0.2s ease;

    cursor: pointer;
    border-bottom: 2px solid transparent;

    &:hover {
      border-bottom: 2px solid ${theme.colors.white};
    }
  }
`;

export const logoutWrapper = css`
  display: flex;
  align-items: center;
  gap: 4px;

  color: ${theme.colors.white};
  font-size: ${theme.typo.body_M};

  transition: color 0.2s ease;

  cursor: pointer;

  &:hover {
    > div > div:first-of-type {
      opacity: 0;
    }

    > div > div:last-of-type {
      opacity: 1;
    }
  }
`;

export const iconWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 20px;
  height: 20px;
`;

const baseIcon = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;

  width: 20px;
  height: 20px;

  transition: opacity 0.2s ease;
`;

export const loginIcon = css`
  ${baseIcon};
  opacity: 1;
`;

export const loginFilledIcon = css`
  ${baseIcon};
  opacity: 0;
`;

export const languageWrapper = css`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  cursor: pointer;

  &:hover {
    > div > div > div:first-of-type {
      opacity: 0;
    }

    > div > div > div:last-of-type {
      opacity: 1;
    }
  }
`;

export const languageDropdown = css`
  display: block;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;

  min-width: 120px;
  margin: 0;
  padding: 8px 0;
  border-radius: 8px;

  background-color: ${theme.colors.white};
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
  list-style: none;
`;

export const languageItem = css`
  padding: 8px 16px;

  color: ${theme.colors.text_primary};
  font-size: ${theme.typo.body_S};

  transition: background-color 0.2s ease;

  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.bg_surface1};
  }
`;

export const languageItemActive = css`
  ${languageItem};
  background-color: ${theme.colors.bg_surface1};
  color: ${theme.colors.primary50};
  font-weight: 600;
`;

export const languageIcon = css`
  color: ${theme.colors.white};
  font-size: 16px;
`;

export const globeIcon = css`
  ${baseIcon};
  opacity: 1;
`;

export const globeFilledIcon = css`
  ${baseIcon};
  opacity: 0;
`;
