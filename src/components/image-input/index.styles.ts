import { css } from '@emotion/react';
import { theme } from '@/styles';

export const wrapper = css`
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 8px;
  overflow: scroll hidden;

  padding: 4px 18px 0 0;
`;

export const uploadImageButton = css`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  width: 70px;
  height: 70px;
  border: 1px solid ${theme.colors.gray200};
  border-radius: 7px;

  cursor: pointer;

  input {
    display: none;
  }
`;

export const thumbnailImage = css`
  flex-shrink: 0;

  width: 70px;
  height: 70px;
  border-radius: 7px;

  background: ${theme.colors.gray100};
  object-fit: cover;
`;

export const imageWrapper = css`
  position: relative;

  width: 70px;
  height: 70px;
`;

export const deleteImageButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -4px;
  right: -4px;

  width: 16px;
  height: 16px;
  border-radius: 50%;

  background: ${theme.colors.black};

  div {
    width: 8px;
    height: 1px;
    border-radius: 1px;

    background: ${theme.colors.white};
  }
`;
