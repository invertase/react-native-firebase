#!/usr/bin/env node
/**
 * Regenerates all TurboModule codegen artifacts via the mobile test-app toolchain
 * (tests/) and fails if git reports drift.
 *
 * NewArch-AD-20: do not resolve CLI/codegen from library package cwd.
 * NewArch-AD-21: ResultT inject retired once mobile pin is 0.84+ (0.86 emits ResultT).
 * NewArch-AD-22: wipe-then-regen lives in scripts/codegen-package.mjs.
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

console.log('[codegen:verify] regenerating via scripts/codegen-package.mjs --all');
execSync('node ./scripts/codegen-package.mjs --all', {
  stdio: 'inherit',
  cwd: REPO_ROOT,
});

console.log('[codegen:verify] checking git drift');
execSync(
  "git diff --exit-code -- 'packages/*/android/**/generated/**' 'packages/*/ios/generated/**'",
  { stdio: 'inherit', cwd: REPO_ROOT },
);
