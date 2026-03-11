import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const MESSAGES_DIR = path.join(ROOT_DIR, 'messages');
const BASE_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'ko'];

const readJson = (filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(source);
};

const collectShape = (value, prefix = '', bucket = new Map()) => {
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  if (isObject) {
    if (prefix) bucket.set(prefix, 'object');
    for (const [key, child] of Object.entries(value)) {
      const next = prefix ? `${prefix}.${key}` : key;
      collectShape(child, next, bucket);
    }
    return bucket;
  }

  bucket.set(prefix, 'leaf');
  return bucket;
};

const fail = (message) => {
  console.error(`[i18n-check] ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(MESSAGES_DIR)) {
  fail(`messages directory not found: ${MESSAGES_DIR}`);
  process.exit(process.exitCode ?? 1);
}

for (const locale of SUPPORTED_LOCALES) {
  const localeDir = path.join(MESSAGES_DIR, locale);
  if (!fs.existsSync(localeDir)) {
    fail(`locale directory not found: messages/${locale}`);
  }
}

const baseDir = path.join(MESSAGES_DIR, BASE_LOCALE);
const baseNamespaces = fs
  .readdirSync(baseDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.replace(/\.json$/, ''))
  .sort();

if (baseNamespaces.length === 0) {
  fail(`no namespace json files found in messages/${BASE_LOCALE}`);
}

for (const locale of SUPPORTED_LOCALES) {
  const localeDir = path.join(MESSAGES_DIR, locale);
  const localeNamespaces = fs
    .readdirSync(localeDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();

  const missingNamespaces = baseNamespaces.filter((name) => !localeNamespaces.includes(name));
  const extraNamespaces = localeNamespaces.filter((name) => !baseNamespaces.includes(name));

  if (missingNamespaces.length > 0) {
    fail(`messages/${locale} missing namespace files: ${missingNamespaces.join(', ')}`);
  }
  if (extraNamespaces.length > 0) {
    fail(`messages/${locale} has extra namespace files: ${extraNamespaces.join(', ')}`);
  }

  for (const namespace of baseNamespaces) {
    const baseFile = path.join(MESSAGES_DIR, BASE_LOCALE, `${namespace}.json`);
    const localeFile = path.join(localeDir, `${namespace}.json`);
    if (!fs.existsSync(localeFile)) continue;

    const baseJson = readJson(baseFile);
    const localeJson = readJson(localeFile);

    const baseShape = collectShape(baseJson);
    const localeShape = collectShape(localeJson);

    const missingKeys = [];
    const typeMismatches = [];
    const extraKeys = [];

    for (const [key, baseType] of baseShape.entries()) {
      const localeType = localeShape.get(key);
      if (!localeType) {
        missingKeys.push(key);
        continue;
      }
      if (localeType !== baseType) {
        typeMismatches.push(`${key} (${baseType} -> ${localeType})`);
      }
    }

    for (const key of localeShape.keys()) {
      if (!baseShape.has(key)) {
        extraKeys.push(key);
      }
    }

    if (missingKeys.length > 0) {
      fail(`messages/${locale}/${namespace}.json missing keys:\n  - ${missingKeys.join('\n  - ')}`);
    }
    if (typeMismatches.length > 0) {
      fail(
        `messages/${locale}/${namespace}.json key type mismatches:\n  - ${typeMismatches.join('\n  - ')}`
      );
    }
    if (extraKeys.length > 0) {
      fail(`messages/${locale}/${namespace}.json has extra keys:\n  - ${extraKeys.join('\n  - ')}`);
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('[i18n-check] All locale namespaces and keys are in sync.');
