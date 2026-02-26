/**
 * Entry point for the type comparison script.
 *
 * Usage (from repo root):
 *   yarn compare:types
 *
 * Requires the RN Firebase packages to be built first:
 *   yarn build:all:build
 *
 * Exit codes:
 *   0 — all differences are documented in the package config files
 *   1 — undocumented differences found (or a required file is missing)
 */

import fs from 'fs';
import { packages } from './registry';
import { parseSingleFile, parseModularFiles } from './parse';
import { compare } from './compare';
import { printReport } from './report';
import type { ComparisonResult } from './types';

function checkFilesExist(paths: string[], context: string): void {
  for (const p of paths) {
    if (!fs.existsSync(p)) {
      console.error(`\n❌ Required file not found: ${p}`);
      console.error(`   Context: ${context}`);
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  const results: ComparisonResult[] = [];

  for (const pkg of packages) {
    checkFilesExist(
      [pkg.firebaseSdkTypesPath],
      `firebase-js-sdk snapshot for "${pkg.name}"`,
    );
    checkFilesExist(
      pkg.rnFirebaseModularFiles,
      `RN Firebase built types for "${pkg.name}" — run \`yarn build:all:build\` first`,
    );

    const sdkExports = parseSingleFile(pkg.firebaseSdkTypesPath);
    const rnExports = parseModularFiles(
      pkg.rnFirebaseModularFiles,
      pkg.rnFirebaseSupportFiles,
    );

    results.push(compare(pkg.name, sdkExports, rnExports, pkg.config));
  }

  const hasFailures = printReport(results);
  process.exit(hasFailures ? 1 : 0);
}

main().catch(err => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});
