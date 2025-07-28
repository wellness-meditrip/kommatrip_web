import { ReactNode } from 'react';
import { Global, ThemeProvider, css } from '@emotion/react';
import theme from './theme';
import './normalize.css';

const defaultStyles = css`
  @font-face {
    font-family: Pretendard;
    src: url('../../fonts/Pretendard-SemiBold.woff2') format('woff2');

    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: Pretendard;
    src: url('../../fonts/Pretendard-Medium.woff2') format('woff2');

    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: Pretendard;
    src: url('../../fonts/Pretendard-Regular.woff2') format('woff2');

    font-weight: 400;
    font-style: normal;
  }

  :root {
    width: 100%;
    height: 100%;

    font-family:
      'Pretendard Variable',
      Pretendard,
      -apple-system,
      BlinkMacSystemFont,
      system-ui,
      Roboto,
      'Helvetica Neue',
      'Segoe UI',
      'Apple SD Gothic Neo',
      'Noto Sans KR',
      'Malgun Gothic',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      sans-serif;
  }

  * {
    box-sizing: border-box;
    scrollbar-width: none;
    -ms-overflow-style: none;

    font-family: inherit;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  *::before,
  *::after {
    box-sizing: border-box !important;
  }

  html,
  body {
    overscroll-behavior: none;

    margin: 0;
    padding: 0;
  }

  a {
    outline: none;

    color: inherit;
    text-decoration: none;

    cursor: pointer;
  }

  button {
    border: none;

    background: none;

    cursor: pointer;
    outline: none;
    padding-block: 0;
    padding-inline: 0;
  }

  textarea {
    border: none;
    resize: none;
    outline: none;
  }

  input {
    outline: none;

    border: none;

    background: none;
  }

  img {
    object-fit: cover;
  }
`;

interface Props {
  children: ReactNode;
}

export default function GlobalStyle({ children }: Props) {
  return (
    <>
      <Global styles={defaultStyles} />
      <ThemeProvider theme={{ ...theme }}>
        <>{children}</>
      </ThemeProvider>
    </>
  );
}
