#!/usr/bin/env node
/**
 * Forward argv to mellifera-cli. The leading integer is the count of CLI words
 * baked into the package.json script. Every argument after those words is
 * forwarded unchanged. This process does not read config or call HTTP.
 *
 * usage: mellifera-cli-forward.js <word-count> <word...> [user args...]
 */
'use strict';

const { spawn } = require('child_process');

function resolveCli() {
  const fromEnv = process.env.MELLIFERA_CLI && process.env.MELLIFERA_CLI.trim();
  return fromEnv || 'mellifera-cli';
}

function fail(message) {
  console.error(`mellifera-cli-forward: ${message}`);
  process.exit(1);
}

function main() {
  const argv = process.argv.slice(2);
  const count = Number(argv[0]);
  if (!argv.length || String(count) !== argv[0] || !Number.isInteger(count) || count < 1) {
    fail('usage: mellifera-cli-forward.js <word-count> <word...> [args...]');
  }
  if (argv.length < 1 + count) {
    fail(`expected ${count} CLI word(s)`);
  }
  const words = argv.slice(1, 1 + count);
  const user = argv.slice(1 + count);
  const child = spawn(resolveCli(), [...words, ...user], { stdio: 'inherit' });
  child.on('error', err => {
    fail(err.message);
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(1);
    }
    process.exit(code == null ? 1 : code);
  });
}

main();
