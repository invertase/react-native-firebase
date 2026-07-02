#!/usr/bin/env node
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

    const outputPathFromApp = toCliContextRelative(packageDir, outputMatch[1]);
    const rewrittenArgs = args.replace(
      /--outputPath=\S+/,
      `--outputPath=${outputPathFromApp}`,
    );
    const command = `${RN_CLI} codegen --path ${packagePathFromApp} ${rewrittenArgs}`;

    console.log(`[codegen:verify] ${packageName} (${scriptName})`);
    execSync(command, { stdio: 'inherit', cwd: CLI_CONTEXT_DIR });
  }
}
