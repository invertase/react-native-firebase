#!/usr/bin/env node
/*
 * Run in-package macOS XCTest projects under packages/<pkg>/ios/RNFB<Package>UnitTests
 * (one harness per package, e.g. RNFBAppUnitTests). Canonical yarn entry: yarn tests:ios:unit
 * See okf-bundle/testing/ios-architecture-decisions.md (IosTest-AD-1).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { mergeLcovFiles, rewriteLcovContent } = require('./ios-native-lcov');

const repoRoot = path.resolve(__dirname, '../..');

function walkFiles(dir, matcher, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (matcher(fullPath)) {
        results.push(fullPath);
      }
      walkFiles(fullPath, matcher, results);
    } else if (matcher(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function runOrThrow(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : '';
    const stdout = error.stdout ? error.stdout.toString() : '';
    throw new Error(`${command} ${args.join(' ')} failed:\n${stderr || stdout || error.message}`);
  }
}

function findUnitXcodeprojs() {
  const packagesDir = path.join(repoRoot, 'packages');
  const results = [];
  if (!fs.existsSync(packagesDir)) {
    return results;
  }
  for (const pkg of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!pkg.isDirectory()) {
      continue;
    }
    const iosDir = path.join(packagesDir, pkg.name, 'ios');
    if (!fs.existsSync(iosDir)) {
      continue;
    }
    for (const entry of fs.readdirSync(iosDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.endsWith('UnitTests')) {
        continue;
      }
      const projectPath = path.join(iosDir, entry.name, `${entry.name}.xcodeproj`);
      const pbxprojPath = path.join(projectPath, 'project.pbxproj');
      if (fs.existsSync(projectPath) && fs.existsSync(pbxprojPath)) {
        results.push(projectPath);
      }
    }
  }
  return results.sort();
}

function exportLcovForProject(projectPath) {
  const projectDir = path.dirname(projectPath);
  const scheme = path.basename(projectPath, '.xcodeproj');
  const derivedData = path.join(projectDir, 'build');
  const llvmProfileDir = path.join(derivedData, 'llvm-profile');
  fs.rmSync(llvmProfileDir, { recursive: true, force: true });
  fs.mkdirSync(llvmProfileDir, { recursive: true });

  // eslint-disable-next-line no-console
  console.log(`[ios-unit] xcodebuild test ${path.relative(repoRoot, projectPath)} scheme=${scheme}`);

  runOrThrow(
    'xcodebuild',
    [
      'test',
      '-project',
      projectPath,
      '-scheme',
      scheme,
      '-destination',
      'platform=macOS',
      '-derivedDataPath',
      derivedData,
      '-enableCodeCoverage',
      'YES',
      'CODE_SIGNING_ALLOWED=NO',
      'CODE_SIGNING_REQUIRED=NO',
    ],
    {
      stdio: ['ignore', 'inherit', 'inherit'],
      env: {
        ...process.env,
        LLVM_PROFILE_FILE: path.join(llvmProfileDir, '%p-%m.profraw'),
      },
    },
  );

  const productsDir = path.join(derivedData, 'Build/Products/Debug');
  const xctestBundles = walkFiles(productsDir, filePath => filePath.endsWith('.xctest'));
  if (xctestBundles.length === 0) {
    throw new Error(`No .xctest bundle under ${productsDir}`);
  }

  const coverageObjects = [];
  for (const bundle of xctestBundles) {
    const name = path.basename(bundle, '.xctest');
    const macosBinary = path.join(bundle, 'Contents/MacOS', name);
    if (fs.existsSync(macosBinary)) {
      coverageObjects.push(macosBinary);
    }
  }
  if (coverageObjects.length === 0) {
    throw new Error(`No XCTest binaries under ${productsDir}`);
  }

  const profrawFiles = [
    ...walkFiles(llvmProfileDir, filePath => filePath.endsWith('.profraw')),
    ...walkFiles(path.join(derivedData, 'Build/ProfileData'), filePath =>
      filePath.endsWith('.profraw'),
    ),
  ];

  const coverageDir = path.join(repoRoot, 'coverage/ios-unit');
  fs.mkdirSync(coverageDir, { recursive: true });
  const profdataPath = path.join(coverageDir, `${scheme}.profdata`);

  const existingProfdata = walkFiles(path.join(derivedData, 'Build/ProfileData'), filePath =>
    filePath.endsWith('.profdata'),
  );

  if (profrawFiles.length > 0) {
    runOrThrow('xcrun', ['llvm-profdata', 'merge', '-sparse', ...profrawFiles, '-o', profdataPath]);
  } else if (existingProfdata.length > 0) {
    runOrThrow('xcrun', [
      'llvm-profdata',
      'merge',
      '-sparse',
      ...existingProfdata,
      '-o',
      profdataPath,
    ]);
  } else {
    throw new Error(`No .profraw or .profdata for ${scheme} under ${derivedData}`);
  }

  const rawLcovPath = path.join(coverageDir, `${scheme}.lcov.raw`);
  const exportArgs = ['llvm-cov', 'export', '-instr-profile', profdataPath];
  coverageObjects.forEach(objectPath => {
    exportArgs.push('-object', objectPath);
  });
  exportArgs.push('-format=lcov');
  execFileSync('xcrun', exportArgs, {
    stdio: ['ignore', fs.openSync(rawLcovPath, 'w'), 'pipe'],
  });

  const rewritten = rewriteLcovContent(fs.readFileSync(rawLcovPath, 'utf8'));
  const perProjectLcov = path.join(coverageDir, `${scheme}.lcov.info`);
  fs.writeFileSync(perProjectLcov, rewritten);
  fs.rmSync(rawLcovPath, { force: true });
  return perProjectLcov;
}

function main() {
  const projects = findUnitXcodeprojs();
  if (projects.length === 0) {
    throw new Error(
      'No packages/*/ios/*UnitTests/*.xcodeproj found. Add an in-package XCTest project first.',
    );
  }

  const perProjectLcovs = projects.map(exportLcovForProject);
  const unitOutput = path.join(repoRoot, 'coverage/ios-unit/lcov.info');
  const nativeOutput = path.join(repoRoot, 'coverage/ios-native/lcov.info');
  mergeLcovFiles(unitOutput, perProjectLcovs);

  const nativeInputs = [nativeOutput, unitOutput].filter(
    (filePath, index, list) => list.indexOf(filePath) === index && fs.existsSync(filePath),
  );
  mergeLcovFiles(nativeOutput, nativeInputs);

  // eslint-disable-next-line no-console
  console.log(
    `[ios-unit] Wrote ${path.relative(repoRoot, unitOutput)} and merged into ${path.relative(
      repoRoot,
      nativeOutput,
    )} (${projects.length} project(s))`,
  );
}

main();
