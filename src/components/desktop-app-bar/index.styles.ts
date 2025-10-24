import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  align-items: center;

  width: 100%;
  height: 76px;
  padding: 0 24px;

  background: linear-gradient(135deg, #2d3e36 0%, #476155 50%, #749a88 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
`;

export const languageWrapper = css`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  cursor: pointer;

  ul {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;

    min-width: 120px;
    margin: 0;
    padding: 8px 0;
    border-radius: 8px;

    background-color: ${theme.colors.white};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    list-style: none;

    li {
      padding: 8px 16px;

      color: ${theme.colors.text_primary};
      font-size: ${theme.typo.body_S};

      transition: background-color 0.2s ease;

      &:hover {
        background-color: ${theme.colors.bg_surface1};
      }

      a {
        color: inherit;
        text-decoration: none;
      }
    }
  }

  &:hover ul {
    display: block;
  }
`;

export const languageIcon = css`
  color: ${theme.colors.white};
  font-size: 16px;
`;

export const menuIcon = css`
  display: flex;
  flex-direction: column;
  gap: 3px;

  span {
    width: 18px;
    height: 2px;
    border-radius: 1px;

    background-color: ${theme.colors.white};

    transition: all 0.2s ease;
  }
`;
