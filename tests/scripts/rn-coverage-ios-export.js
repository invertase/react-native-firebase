#!/usr/bin/env node
/**
 * iOS LCOV export via portal-linked `rn-coverage ios export`.
 * Keeps yarn script `tests:ios:test:process-coverage` stable for agent policy.
 */
'use strict';

const path = require('path');
const { runRnCoverage } = require('./resolve-rn-coverage');

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

Delegates to portal-linked rn-coverage ios export.

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
process.exit(status == null ? 1 : status);
