export const toAbsoluteUrl = (siteUrl: string, value?: string) => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (!siteUrl) return undefined;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

export const buildTitle = ({
  keyword,
  pageTitle,
  appName,
}: {
  keyword?: string;
  pageTitle: string;
  appName?: string;
}) => {
  const shouldAppendAppName = appName ? !pageTitle.includes(appName) : false;
  if (keyword) {
    if (appName && shouldAppendAppName) {
      return `${keyword} - ${pageTitle} | ${appName}`;
    }
    return `${keyword} - ${pageTitle}`;
  }
  return appName && shouldAppendAppName ? `${pageTitle} | ${appName}` : pageTitle;
};
