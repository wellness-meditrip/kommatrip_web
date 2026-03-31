const LIGHTHOUSE_BASE_URL = 'http://127.0.0.1:3000';
const LIGHTHOUSE_START_SERVER_COMMAND = 'pnpm run serve:lhci';
const LIGHTHOUSE_LOCALE = process.env.LIGHTHOUSE_LOCALE?.trim() || 'en';
const LIGHTHOUSE_COMPANY_ID = process.env.LIGHTHOUSE_COMPANY_ID?.trim();
const LIGHTHOUSE_PROGRAM_ID = process.env.LIGHTHOUSE_PROGRAM_ID?.trim();

const LIGHTHOUSE_SCORE_THRESHOLDS = {
  good: 90,
  warning: 50,
};

const LIGHTHOUSE_BASE_PAGES = [
  { key: 'home', name: '홈', path: '/' },
  { key: 'company', name: '업체 목록', path: '/company' },
];

const LIGHTHOUSE_DETAIL_PAGES = [];

if (LIGHTHOUSE_COMPANY_ID) {
  LIGHTHOUSE_DETAIL_PAGES.push({
    key: 'company-detail',
    name: '업체 상세',
    path: `/${LIGHTHOUSE_LOCALE}/company/${LIGHTHOUSE_COMPANY_ID}?companyId=${LIGHTHOUSE_COMPANY_ID}`,
  });
}

if (LIGHTHOUSE_COMPANY_ID && LIGHTHOUSE_PROGRAM_ID) {
  LIGHTHOUSE_DETAIL_PAGES.push({
    key: 'program-detail',
    name: '프로그램 상세',
    path: `/${LIGHTHOUSE_LOCALE}/company/${LIGHTHOUSE_COMPANY_ID}/program/${LIGHTHOUSE_PROGRAM_ID}`,
  });
}

const LIGHTHOUSE_TARGET_PAGES = [...LIGHTHOUSE_BASE_PAGES, ...LIGHTHOUSE_DETAIL_PAGES];

const LIGHTHOUSE_TARGET_URLS = LIGHTHOUSE_TARGET_PAGES.map(
  (page) => `${LIGHTHOUSE_BASE_URL}${page.path}`
);

const getNormalizedPath = (urlOrPath) => {
  if (!urlOrPath) return '/';

  try {
    return new URL(urlOrPath, LIGHTHOUSE_BASE_URL).pathname || '/';
  } catch {
    return urlOrPath.split('?')[0]?.split('#')[0] || '/';
  }
};

const getPageNameFromUrl = (urlOrPath) => {
  const normalizedPath = getNormalizedPath(urlOrPath);
  return (
    LIGHTHOUSE_TARGET_PAGES.find((page) => getNormalizedPath(page.path) === normalizedPath)?.name ??
    normalizedPath
  );
};

module.exports = {
  LIGHTHOUSE_BASE_URL,
  LIGHTHOUSE_COMPANY_ID,
  LIGHTHOUSE_LOCALE,
  LIGHTHOUSE_PROGRAM_ID,
  LIGHTHOUSE_SCORE_THRESHOLDS,
  LIGHTHOUSE_START_SERVER_COMMAND,
  LIGHTHOUSE_TARGET_PAGES,
  LIGHTHOUSE_TARGET_URLS,
  getNormalizedPath,
  getPageNameFromUrl,
};
