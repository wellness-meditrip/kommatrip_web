import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Main />
        <div id="portal-container" />
        <NextScript />
      </body>
    </Html>
  );
}
