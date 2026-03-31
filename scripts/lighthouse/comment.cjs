const fs = require('node:fs');
const path = require('node:path');

const {
  LIGHTHOUSE_SCORE_THRESHOLDS,
  getNormalizedPath,
  getPageNameFromUrl,
} = require('./config.cjs');

const CATEGORY_LABELS = [
  ['performance', 'Performance'],
  ['accessibility', 'Accessibility'],
  ['best-practices', 'Best Practices'],
  ['seo', 'SEO'],
];

const METRIC_LABELS = [
  ['first-contentful-paint', 'First Contentful Paint'],
  ['largest-contentful-paint', 'Largest Contentful Paint'],
  ['speed-index', 'Speed Index'],
  ['total-blocking-time', 'Total Blocking Time'],
  ['cumulative-layout-shift', 'Cumulative Layout Shift'],
];

const MANIFEST_MARKER = '<!-- lighthouse-ci-report -->';

const formatScore = (value) => {
  if (typeof value !== 'number') return '-';
  return String(Math.round(value * 100));
};

const getScoreLabel = (score) => {
  if (typeof score !== 'number') return '-';

  const normalizedScore = Math.round(score * 100);

  if (normalizedScore >= LIGHTHOUSE_SCORE_THRESHOLDS.good) return '좋음';
  if (normalizedScore >= LIGHTHOUSE_SCORE_THRESHOLDS.warning) return '개선 필요';
  return '나쁨';
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const getManifestPath = (rootDir, device) =>
  path.join(rootDir, 'lhci_reports', device, 'manifest.json');

const readManifest = (rootDir, device) => {
  const manifestPath = getManifestPath(rootDir, device);
  if (!fs.existsSync(manifestPath)) return [];

  const manifest = readJson(manifestPath);

  if (Array.isArray(manifest)) return manifest;
  if (Array.isArray(manifest?.ciReports)) return manifest.ciReports;

  return [];
};

const buildScoreRows = (summary) =>
  CATEGORY_LABELS.map(([key, label]) => {
    const score = summary?.[key];
    return `| ${label} | ${formatScore(score)} | ${getScoreLabel(score)} |`;
  }).join('\n');

const buildMetricRows = (audits) =>
  METRIC_LABELS.map(([key, label]) => {
    const audit = audits?.[key];
    return `| ${label} | ${audit?.displayValue ?? '-'} |`;
  }).join('\n');

const buildReportBlock = (report, rootDir) => {
  const pageName = getPageNameFromUrl(report.url);
  const reportJsonPath = path.isAbsolute(report.jsonPath)
    ? report.jsonPath
    : path.join(rootDir, report.jsonPath);
  const reportJson = readJson(reportJsonPath);
  const pathname = getNormalizedPath(report.url);

  return [
    '<details>',
    `<summary>${pageName} (${pathname})</summary>`,
    '',
    '| Category | Score | 상태 |',
    '| --- | ---: | --- |',
    buildScoreRows(report.summary ?? {}),
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    buildMetricRows(reportJson.audits ?? {}),
    '',
    '</details>',
  ].join('\n');
};

const buildDeviceSection = (title, reports, rootDir) => {
  if (reports.length === 0) {
    return `### ${title}\n\n측정 결과가 없습니다.`;
  }

  const representativeReports = reports
    .filter((report) => report.isRepresentativeRun !== false)
    .sort((left, right) => getNormalizedPath(left.url).localeCompare(getNormalizedPath(right.url)));

  return [
    `### ${title}`,
    '',
    ...representativeReports.map((report) => buildReportBlock(report, rootDir)),
  ].join('\n\n');
};

const buildLighthouseComment = (rootDir = process.cwd()) => {
  const desktopReports = readManifest(rootDir, 'desktop');
  const mobileReports = readManifest(rootDir, 'mobile');

  if (desktopReports.length === 0 && mobileReports.length === 0) {
    return null;
  }

  const generatedAt = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date());

  return [
    MANIFEST_MARKER,
    '## Lighthouse 리포트',
    '',
    `> 점수 기준: 좋음 ${LIGHTHOUSE_SCORE_THRESHOLDS.good}-100 / 개선 필요 ${LIGHTHOUSE_SCORE_THRESHOLDS.warning}-${
      LIGHTHOUSE_SCORE_THRESHOLDS.good - 1
    } / 나쁨 0-${LIGHTHOUSE_SCORE_THRESHOLDS.warning - 1}`,
    `> 측정 시각: ${generatedAt} (KST)`,
    '',
    buildDeviceSection('Desktop', desktopReports, rootDir),
    '',
    buildDeviceSection('Mobile', mobileReports, rootDir),
  ].join('\n');
};

module.exports = {
  MANIFEST_MARKER,
  buildLighthouseComment,
};
