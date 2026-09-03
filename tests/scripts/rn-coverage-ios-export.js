#!/usr/bin/env node
/**
 * iOS LCOV export via `rn-coverage ios export`, then merge XCTest unit LCOV
 * (`coverage/ios-unit/lcov.info`) so e2e export does not drop unit hits.
 * Keeps yarn script `tests:ios:test:process-coverage` stable for agent policy.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { mergeLcovFiles } = require('./ios-native-lcov');
const { runRnCoverage } = require('./resolve-rn-coverage');
const { reportJsCoverage } = require('./pull-native-coverage');

const repoRoot = path.resolve(__dirname, '../..');
const testsDir = path.join(repoRoot, 'tests');

function parseArgs(argv) {
  const options = {
    derivedData: path.join(testsDir, 'ios/build'),
    configuration: 'Debug',
    appName: 'testing',
    output: path.join(repoRoot, 'coverage/ios-native/lcov.info'),
    extra: [],
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
      console.log(`Usage: node tests/scripts/rn-coverage-ios-export.js [options]

Delegates to rn-coverage ios export, then merges coverage/ios-unit/lcov.info.

Options:
  --derived-data <path>   Detox/Xcode derived data (default: tests/ios/build)
  --configuration <name>  Xcode configuration (default: Debug)
  --app-name <name>       App product name (default: testing)
  --output <path>         lcov output path (default: coverage/ios-native/lcov.info)
`);
      process.exit(0);
    } else {
      options.extra.push(arg);
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const { status, signal } = runRnCoverage([
  'ios',
  'export',
  '--derived-data',
  options.derivedData,
  '--configuration',
  options.configuration,
  '--app-name',
  options.appName,
  '--output',
  options.output,
  ...options.extra,
]);

if (signal) {
  process.kill(process.pid, signal);
}

if (status === 0) {
  const unitLcov = path.join(repoRoot, 'coverage/ios-unit/lcov.info');
  if (fs.existsSync(unitLcov) && fs.existsSync(options.output)) {
    mergeLcovFiles(options.output, [options.output, unitLcov]);
    console.log(`[ios-native-coverage] Merged unit LCOV from ${unitLcov}`);
  }
  reportJsCoverage('ios');
}

process.exit(status == null ? 1 : status);
