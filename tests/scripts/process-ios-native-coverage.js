#!/usr/bin/env node
/*
 * Merge LLVM profraw from Detox iOS e2e runs and export an lcov report for Codecov.
 *
 * See okf-bundle/testing/coverage-design.md for the full pipeline description.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const repoRoot = path.resolve(__dirname, '../..');
const testsDir = path.join(repoRoot, 'tests');

function parseArgs(argv) {
  const options = {
    derivedData: path.join(testsDir, 'ios/build'),
    configuration: 'Debug',
    appName: 'testing',
    output: path.join(repoRoot, 'coverage/ios-native.lcov.info'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--derived-data') {
      options.derivedData = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--configuration') {
      options.configuration = argv[i + 1];
      i += 1;
    } else if (arg === '--app-name') {
      options.appName = argv[i + 1];
      i += 1;
    } else if (arg === '--output') {
      options.output = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      // eslint-disable-next-line no-console
      console.log(`Usage: node tests/scripts/process-ios-native-coverage.js [options]

Options:
  --derived-data <path>   Detox/Xcode derived data (default: tests/ios/build)
  --configuration <name>  Xcode configuration (default: Debug)
  --app-name <name>       App product name (default: testing)
  --output <path>         lcov output path (default: coverage/ios-native.lcov.info)
`);
      process.exit(0);
    }
  }

  return options;
}

function walkFiles(dir, matcher, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, matcher, results);
    } else if (matcher(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function normalizeSourcePath(sourcePath) {
  const normalized = sourcePath.replace(/\\/g, '/');

  const packagesIdx = normalized.indexOf('/packages/');
  if (packagesIdx >= 0) {
    return normalized.slice(packagesIdx + 1);
  }

  const rnfbMatch = normalized.match(/@react-native-firebase\/([^/]+)\/(.+)$/);
  if (rnfbMatch) {
    return `packages/${rnfbMatch[1]}/${rnfbMatch[2]}`;
  }

  const testsIdx = normalized.indexOf('/tests/');
  if (testsIdx >= 0) {
    return normalized.slice(testsIdx + 1);
  }

  return normalized.replace(/^\.\//, '');
}

function runOrThrow(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : '';
    const stdout = error.stdout ? error.stdout.toString() : '';
    throw new Error(
      `${command} ${args.join(' ')} failed:\n${stderr || stdout || error.message}`,
    );
  }
}

function runToFileOrThrow(command, args, outputPath) {
  let stderr = '';
  try {
    execFileSync(command, args, {
      stdio: ['ignore', fs.openSync(outputPath, 'w'), 'pipe'],
    });
  } catch (error) {
    stderr = error.stderr ? error.stderr.toString() : '';
    throw new Error(
      `${command} ${args.join(' ')} failed:\n${stderr || error.message}`,
    );
  }
}

async function rewriteLcovFile(inputPath, outputPath) {
  const input = fs.createReadStream(inputPath, { encoding: 'utf8' });
  const output = fs.createWriteStream(outputPath, { encoding: 'utf8' });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });

  let sourceFileCount = 0;
  let packagesHits = 0;

  for await (const line of lines) {
    if (line.startsWith('SF:')) {
      sourceFileCount += 1;
      const normalizedPath = normalizeSourcePath(line.slice(3));
      if (normalizedPath.startsWith('packages/')) {
        packagesHits += 1;
      }
      output.write(`SF:${normalizedPath}\n`);
    } else {
      output.write(`${line}\n`);
    }
  }

  await new Promise((resolve, reject) => {
    output.end(() => resolve());
    output.on('error', reject);
  });

  return { sourceFileCount, packagesHits };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const productsDir = path.join(
    options.derivedData,
    'Build/Products',
    `${options.configuration}-iphonesimulator`,
  );
  const appBinary = path.join(productsDir, `${options.appName}.app`, options.appName);
  const profileDataDir = path.join(options.derivedData, 'Build/ProfileData');
  const simulatorCoverageDir = path.join(options.derivedData, 'output/coverage');

  const profrawFiles = [
    ...walkFiles(simulatorCoverageDir, filePath => filePath.endsWith('.profraw')),
    ...walkFiles(profileDataDir, filePath => filePath.endsWith('.profraw')),
  ];

  if (profrawFiles.length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[ios-native-coverage] No .profraw files under ${simulatorCoverageDir} or ${profileDataDir}.`,
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[ios-native-coverage] Found ${profrawFiles.length} profraw file(s): ${profrawFiles.join(', ')}`,
  );

  if (!fs.existsSync(appBinary)) {
    throw new Error(`App binary not found at ${appBinary}`);
  }

  fs.mkdirSync(path.dirname(options.output), { recursive: true });

  const profdataPath = path.join(path.dirname(options.output), 'ios-native.profdata');
  runOrThrow('xcrun', [
    'llvm-profdata',
    'merge',
    '-sparse',
    ...profrawFiles,
    '-o',
    profdataPath,
  ]);

  const rawLcovPath = path.join(path.dirname(options.output), 'ios-native.lcov.raw');
  try {
    runToFileOrThrow('xcrun', [
      'llvm-cov',
      'export',
      '-instr-profile',
      profdataPath,
      '-object',
      appBinary,
      '-format=lcov',
    ], rawLcovPath);

    const { sourceFileCount, packagesHits } = await rewriteLcovFile(rawLcovPath, options.output);

    // eslint-disable-next-line no-console
    console.log(
      `[ios-native-coverage] Wrote ${options.output} (${sourceFileCount} source file(s), ${packagesHits} under packages/)`,
    );

    profrawFiles.forEach(profrawPath => {
      fs.rmSync(profrawPath, { force: true });
      // eslint-disable-next-line no-console
      console.log(`[ios-native-coverage] Removed processed profraw: ${profrawPath}`);
    });
  } finally {
    fs.rmSync(rawLcovPath, { force: true });
  }
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error(`[ios-native-coverage] ${error.message}`);
  process.exit(1);
});
