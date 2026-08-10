#!/usr/bin/env node
// Guards the root package.json's `resolutions` pin for react-native and its
// tightly-coupled siblings (@react-native/codegen, @types/react). These are
// forced repo-wide overrides: every workspace's own dependency edge for these
// three packages resolves to this exact value, regardless of what that
// workspace's own package.json requests (see okf-bundle/... for why apps/
// build-harness-expo cannot just bump these here — it must instead widen its
// own package.json's version and get tested via
// `scripts/dev-harness-versions.sh`, never by touching this pin).
//
// If this check fails, someone bumped the root pin directly (often to make an
// apps/ harness build), which silently forces every other workspace
// (packages/*, tests/, apps/build-harness) onto that version too. Revert the
// root package.json resolutions instead of bumping this check.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(REPO_ROOT, 'package.json');

const EXPECTED_PIN = {
  'react-native': '0.78.3',
  '@react-native/codegen': '0.78.3',
  '@types/react': '~19.0.0',
};

const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
const resolutions = packageJson.resolutions ?? {};

const mismatches = Object.entries(EXPECTED_PIN)
  .map(([key, expected]) => ({ key, expected, actual: resolutions[key] }))
  .filter(({ expected, actual }) => actual !== expected);

if (mismatches.length > 0) {
  console.error('[check-root-rn-pin] root package.json "resolutions" pin has drifted:\n');
  for (const { key, expected, actual } of mismatches) {
    console.error(`  "${key}": expected "${expected}", found ${JSON.stringify(actual)}`);
  }
  console.error(
    '\nThis pin keeps packages/*, tests/, and apps/build-harness on one consistent' +
      ' react-native/@types/react version. If an apps/ harness (e.g. build-harness-expo)' +
      ' needs a different version, declare it directly in that workspace\'s own' +
      ' package.json instead of bumping this root pin, and use' +
      ' `scripts/dev-harness-versions.sh on` for local testing (never commit the result).',
  );
  process.exit(1);
}

console.log('[check-root-rn-pin] root package.json resolutions pin unchanged, ok');
