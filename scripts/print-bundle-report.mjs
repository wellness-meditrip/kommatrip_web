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

const toKiB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

const gzipFileSize = (relativePath) =>
  zlib.gzipSync(fs.readFileSync(path.join(nextDir, relativePath))).length;

const getJsFiles = (route) => (manifest.pages[route] ?? []).filter((file) => file.endsWith('.js'));

const getUniqueFiles = (files) => [...new Set(files)];

const getTotalGzipSize = (files) =>
  getUniqueFiles(files).reduce((total, file) => total + gzipFileSize(file), 0);

const sharedAppFiles = getJsFiles('/_app');

const routeEntries = Object.keys(manifest.pages)
  .filter((route) => !route.startsWith('/_') && !route.startsWith('/api/'))
  .map((route) => {
    const routeFiles = getJsFiles(route);
    const firstLoadFiles = getUniqueFiles([...sharedAppFiles, ...routeFiles]);

    return {
      route,
      firstLoadGzip: getTotalGzipSize(firstLoadFiles),
      routeOnlyGzip: getTotalGzipSize(routeFiles.filter((file) => !sharedAppFiles.includes(file))),
    };
  })
  .sort((left, right) => right.firstLoadGzip - left.firstLoadGzip);

const chunkEntries = Array.from(
  new Set(
    Object.values(manifest.pages)
      .flat()
      .filter((file) => file.endsWith('.js'))
  )
)
  .map((file) => ({
    file,
    gzip: gzipFileSize(file),
  }))
  .sort((left, right) => right.gzip - left.gzip)
  .slice(0, 10);

console.log('\nBundle Report');
console.log(`Shared app JS (gzip): ${toKiB(getTotalGzipSize(sharedAppFiles))}`);
console.log('\nTop routes by first load JS:');
routeEntries.slice(0, 10).forEach((entry) => {
  console.log(
    `- ${entry.route}: first load ${toKiB(entry.firstLoadGzip)}, route-only ${toKiB(entry.routeOnlyGzip)}`
  );
});

console.log('\nLargest emitted JS assets:');
chunkEntries.forEach((entry) => {
  console.log(`- ${entry.file}: ${toKiB(entry.gzip)}`);
});
