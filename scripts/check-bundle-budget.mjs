import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const rootDir = process.cwd();
const nextDir = path.join(rootDir, '.next');
const manifestPath = path.join(nextDir, 'build-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Missing .next/build-manifest.json. Run `pnpm build` first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const BUDGETS = {
  sharedAppGzip: Number(process.env.BUNDLE_BUDGET_SHARED_APP_KB ?? 320) * 1024,
  homeFirstLoadGzip: Number(process.env.BUNDLE_BUDGET_HOME_FIRST_LOAD_KB ?? 470) * 1024,
  loginFirstLoadGzip: Number(process.env.BUNDLE_BUDGET_LOGIN_FIRST_LOAD_KB ?? 470) * 1024,
};

const gzipFileSize = (relativePath) =>
  zlib.gzipSync(fs.readFileSync(path.join(nextDir, relativePath))).length;

const getJsFiles = (route) => (manifest.pages[route] ?? []).filter((file) => file.endsWith('.js'));

const getUniqueFiles = (files) => [...new Set(files)];

const getTotalGzipSize = (files) =>
  getUniqueFiles(files).reduce((total, file) => total + gzipFileSize(file), 0);

const getFirstLoadSize = (route) => {
  const sharedAppFiles = getJsFiles('/_app');
  const routeFiles = getJsFiles(route);
  return getTotalGzipSize([...sharedAppFiles, ...routeFiles]);
};

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

const checks = [
  {
    label: 'shared app JS',
    actual: getTotalGzipSize(getJsFiles('/_app')),
    budget: BUDGETS.sharedAppGzip,
  },
  {
    label: 'home first load JS',
    actual: getFirstLoadSize('/'),
    budget: BUDGETS.homeFirstLoadGzip,
  },
  {
    label: 'login first load JS',
    actual: getFirstLoadSize('/login'),
    budget: BUDGETS.loginFirstLoadGzip,
  },
];

const failures = checks.filter((check) => check.actual > check.budget);

checks.forEach((check) => {
  console.log(`${check.label}: ${formatKiB(check.actual)} / budget ${formatKiB(check.budget)}`);
});

if (failures.length > 0) {
  console.error('\nBundle budget exceeded:');
  failures.forEach((failure) => {
    console.error(
      `- ${failure.label}: ${formatKiB(failure.actual)} > ${formatKiB(failure.budget)}`
    );
  });
  process.exit(1);
}

console.log('\nBundle budget check passed.');
