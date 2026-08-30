#!/usr/bin/env node
/*
 * Merge LLVM profraw from Detox iOS e2e runs and export an lcov report for Codecov.
 * After e2e export, merge coverage/ios-unit/lcov.info when present so XCTest counts.
 *
 * See okf-bundle/testing/coverage-design.md for the full pipeline description.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { mergeLcovFiles, normalizeSourcePath } = require('./ios-native-lcov');
const {
  loadCoverageConfig,
  nameStartsWithAnyPrefix,
  resolveStrict,
} = require('./load-coverage-config');

const coverageConfig = loadCoverageConfig();
const repoRoot = path.resolve(__dirname, '../..');
const testsDir = path.join(repoRoot, 'tests');

function parseArgs(argv) {
  const options = {
    derivedData: path.join(testsDir, 'ios/build'),
    configuration: 'Debug',
    appName: coverageConfig.app.iosProductName,
    output: path.join(repoRoot, 'coverage/ios-native/lcov.info'),
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
  --output <path>         lcov output path (default: coverage/ios-native/lcov.info)
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

function runOrThrow(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : '';
    const stdout = error.stdout ? error.stdout.toString() : '';
    throw new Error(`${command} ${args.join(' ')} failed:\n${stderr || stdout || error.message}`);
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
    throw new Error(`${command} ${args.join(' ')} failed:\n${stderr || error.message}`);
  }
}

/**
 * Under SPM + dynamic frameworks, RNFB native code lives in RNFB*.framework
 * binaries — not the app executable. llvm-cov must receive those objects or
 * packages/<pkg>/ios sources never appear in LCOV (packagesHits=0).
 */
function collectCoverageObjects(
  productsDir,
  appName,
  frameworkNamePrefixes = coverageConfig.ios.frameworkNamePrefixes,
) {
  const objects = [];
  const seen = new Set();

  const addObject = candidate => {
    if (!candidate || seen.has(candidate) || !fs.existsSync(candidate)) {
      return;
    }
    seen.add(candidate);
    objects.push(candidate);
  };

  addObject(path.join(productsDir, `${appName}.app`, appName));

  const embeddedFrameworksDir = path.join(productsDir, `${appName}.app`, 'Frameworks');
  if (fs.existsSync(embeddedFrameworksDir)) {
    for (const entry of fs.readdirSync(embeddedFrameworksDir)) {
      if (
        !nameStartsWithAnyPrefix(entry.replace(/\.framework$/, ''), frameworkNamePrefixes) ||
        !entry.endsWith('.framework')
      ) {
        continue;
      }
      const frameworkName = entry.slice(0, -'.framework'.length);
      addObject(path.join(embeddedFrameworksDir, entry, frameworkName));
    }
  }

  // Fallback when frameworks were not copied into the app bundle yet.
  if (objects.length <= 1 && fs.existsSync(productsDir)) {
    for (const entry of fs.readdirSync(productsDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !nameStartsWithAnyPrefix(entry.name, frameworkNamePrefixes)) {
        continue;
      }
      const frameworkName = entry.name;
      addObject(path.join(productsDir, frameworkName, `${frameworkName}.framework`, frameworkName));
    }
  }

  return objects;
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
  if (!coverageConfig.enabled) {
    console.warn('[ios-native-coverage] disabled via tests/react-native-coverage.config.js');
    return;
  }
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

  const argv = process.argv.slice(2);
  const strict = resolveStrict(argv, coverageConfig);
  if (profrawFiles.length === 0) {
    const message = `[ios-native-coverage] No .profraw files under ${simulatorCoverageDir} or ${profileDataDir}.`;
    if (strict) {
      // eslint-disable-next-line no-console
      console.error(message);
      process.exit(2);
    }
    // Soft local: warn and exit 0 (match assert failEmpty soft contract).
    // eslint-disable-next-line no-console
    console.warn(`${message} (soft; continuing)`);
    process.exit(0);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[ios-native-coverage] Found ${profrawFiles.length} profraw file(s): ${profrawFiles.join(', ')}`,
  );

  if (!fs.existsSync(appBinary)) {
    throw new Error(`App binary not found at ${appBinary}`);
  }

  const coverageObjects = collectCoverageObjects(productsDir, options.appName);
  if (coverageObjects.length === 0) {
    throw new Error(`No coverage objects found under ${productsDir}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[ios-native-coverage] Using ${coverageObjects.length} object(s): ${coverageObjects.join(', ')}`,
  );

  fs.mkdirSync(path.dirname(options.output), { recursive: true });

  const profdataPath = path.join(path.dirname(options.output), 'profdata');
  runOrThrow('xcrun', ['llvm-profdata', 'merge', '-sparse', ...profrawFiles, '-o', profdataPath]);

  const rawLcovPath = path.join(path.dirname(options.output), 'lcov.raw');
  try {
    const exportArgs = ['llvm-cov', 'export', '-instr-profile', profdataPath];
    coverageObjects.forEach(objectPath => {
      exportArgs.push('-object', objectPath);
    });
    exportArgs.push('-format=lcov');
    runToFileOrThrow('xcrun', exportArgs, rawLcovPath);

    const { sourceFileCount, packagesHits } = await rewriteLcovFile(rawLcovPath, options.output);

    const unitLcov = path.join(repoRoot, 'coverage/ios-unit/lcov.info');
    if (fs.existsSync(unitLcov)) {
      mergeLcovFiles(options.output, [options.output, unitLcov]);
      // eslint-disable-next-line no-console
      console.log(`[ios-native-coverage] Merged unit LCOV from ${unitLcov}`);
    }

    // eslint-disable-next-line no-console
    console.log(
      `[ios-native-coverage] Wrote ${options.output} (${sourceFileCount} source file(s), ${packagesHits} under packages/)`,
    );

    // packagesHits=0 is the classic silent multi-image failure (app-only export).
    const {
      assertIosLcov,
      EXIT_OK,
      EXIT_STRICT_EMPTY,
    } = require('./assert-native-coverage-presence');
    const assertCode = assertIosLcov(options.output, strict);
    if (assertCode !== EXIT_OK) {
      process.exit(assertCode === EXIT_STRICT_EMPTY ? EXIT_STRICT_EMPTY : assertCode);
    }

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
