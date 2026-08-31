#!/usr/bin/env node
/**
 * Resolve portal-linked react-native-coverage from the tests workspace.
 * Pattern C: package lives only under tests/, never product packages.
 */
'use strict';

const path = require('path');
const { createRequire } = require('module');
const { spawnSync } = require('child_process');

const testsPackageJson = path.resolve(__dirname, '../package.json');
const requireFromTests = createRequire(testsPackageJson);

function resolveRnCoverageRoot() {
  return path.dirname(requireFromTests.resolve('react-native-coverage/package.json'));
}

function resolveRnCoverageBin() {
  return path.join(resolveRnCoverageRoot(), 'bin/rn-coverage.js');
}

/**
 * Run package CLI from repo root with RNFB config.
 * @param {string[]} args CLI args after bin
 * @param {{ cwd?: string, configPath?: string }} [options]
 * @returns {{ status: number|null, signal: string|null }}
 */
function runRnCoverage(args, options = {}) {
  const repoRoot = path.resolve(__dirname, '../..');
  const cwd = options.cwd || repoRoot;
  const configPath =
    options.configPath || path.join(repoRoot, 'tests/react-native-coverage.config.js');
  const bin = resolveRnCoverageBin();
  const result = spawnSync(process.execPath, [bin, '-c', configPath, ...args], {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  return { status: result.status, signal: result.signal };
}

module.exports = {
  resolveRnCoverageRoot,
  resolveRnCoverageBin,
  runRnCoverage,
  testsPackageJson,
};
