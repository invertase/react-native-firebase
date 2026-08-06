#!/usr/bin/env node
/**
 * NewArch-AD-17.3 / NewArch-AD-22 — Regen every migrated package's codegen with
 * wipe-then-regen on the configured --outputPath, then NewArch-AD-21 ResultT patch.
 * Root `yarn codegen:verify` diffs generated trees afterward.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CLI_CONTEXT_DIR = path.join(REPO_ROOT, 'packages/app');
const RN_CLI = 'npx @react-native-community/cli';

const MIGRATED_PACKAGES = [
  'app',
  'firestore',
  'installations',
  'perf',
  'in-app-messaging',
  'messaging',
  'app-distribution',
  'ml',
  'app-check',
  'remote-config',
  'analytics',
  'crashlytics',
  'storage',
  'functions',
  'database',
  'auth',
  'phone-number-verification',
];

function parseCodegenCommand(script) {
  const match = script.match(/codegen (--platform \S+ --outputPath=\S+)/);
  if (!match) {
    throw new Error(`Cannot parse codegen command: ${script}`);
  }
  return match[1];
}

function toCliContextRelative(packageDir, outputPath) {
  const normalizedOutput = outputPath.replace(/^\.\//, '');
  const absoluteOutput = path.join(packageDir, normalizedOutput);
  return path.relative(CLI_CONTEXT_DIR, absoluteOutput);
}

function wipeOutputPath(absoluteOutput) {
  // NewArch-AD-22: delete the configured outputPath entirely before CLI codegen writes.
  fs.rmSync(absoluteOutput, { recursive: true, force: true });
}

for (const packageName of MIGRATED_PACKAGES) {
  const packageDir = path.join(REPO_ROOT, 'packages', packageName);
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  const packagePathFromApp = path.relative(CLI_CONTEXT_DIR, packageDir) || '.';

  for (const scriptName of ['android:codegen', 'ios:codegen']) {
    const script = packageJson.scripts?.[scriptName];
    if (!script) {
      throw new Error(`${packageName} is missing scripts.${scriptName}`);
    }

    const args = parseCodegenCommand(script);
    const outputMatch = args.match(/--outputPath=(\S+)/);
    if (!outputMatch) {
      throw new Error(`${packageName} ${scriptName} is missing --outputPath`);
    }

    const normalizedOutput = outputMatch[1].replace(/^\.\//, '');
    const absoluteOutput = path.join(packageDir, normalizedOutput);
    wipeOutputPath(absoluteOutput);

    const outputPathFromApp = toCliContextRelative(packageDir, outputMatch[1]);
    const rewrittenArgs = args.replace(
      /--outputPath=\S+/,
      `--outputPath=${outputPathFromApp}`,
    );
    const command = `${RN_CLI} codegen --path ${packagePathFromApp} ${rewrittenArgs}`;

    console.log(`[codegen:verify] ${packageName} (${scriptName}) wipe+regen → ${normalizedOutput}`);
    execSync(command, { stdio: 'inherit', cwd: CLI_CONTEXT_DIR });
  }
}

// NewArch-AD-21: 0.78 codegen omits ResultT; re-inject so RN 0.84+ consumers compile
// and this verify pass does not fail git diff after a clean regen.
console.log('[codegen:verify] patch-ios-codegen-resultt (NewArch-AD-21)');
execSync('node ./scripts/patch-ios-codegen-resultt.mjs', {
  stdio: 'inherit',
  cwd: REPO_ROOT,
});
