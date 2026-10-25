#!/usr/bin/env node
/**
 * Rsync this checkout to the remote grant's initial directory.
 *
 * `--rsh` is the resolved CLI plus `exec --rsh`. rsync appends the host and
 * the remote command. This process does not read a grant URL or start its
 * own remote shell.
 * The destination host is a fixed placeholder with no user or port; the
 * remote side starts in `.`.
 *
 * usage: mellifera-remote-sync.js [--filter FILE]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_FILTER = path.join(SCRIPT_DIR, 'mellifera-remote-sync.rsync-filter');
const PLACEHOLDER_HOST = 'placeholder';

function resolveCli() {
  const fromEnv = process.env.MELLIFERA_CLI && process.env.MELLIFERA_CLI.trim();
  return fromEnv || 'mellifera-cli';
}

function fail(message) {
  console.error(`mellifera-remote-sync: ${message}`);
  process.exit(1);
}

/** Quote one token for rsync's --rsh splitter. No extra "--" is inserted. */
function quoteRshToken(token) {
  if (!/[\s'"\\]/.test(token)) {
    return token;
  }
  return `'${token.replace(/'/g, `'\\''`)}'`;
}

function parseFilter(argv) {
  const args = argv[0] === '--' ? argv.slice(1) : argv;
  if (!args.length) {
    return DEFAULT_FILTER;
  }
  if (args.length === 2 && args[0] === '--filter' && args[1] && !args[1].startsWith('-')) {
    return path.resolve(args[1]);
  }
  fail('usage: mellifera-remote-sync.js [--filter FILE]');
}

function main() {
  const filter = parseFilter(process.argv.slice(2));
  if (!fs.existsSync(filter)) {
    fail(`filter file not found: ${filter}`);
  }
  const rsh = `${quoteRshToken(resolveCli())} exec --rsh`;
  const child = spawn(
    'rsync',
    ['-a', '--rsh', rsh, '--filter', `merge ${filter}`, '.', `${PLACEHOLDER_HOST}:.`],
    { cwd: REPO_ROOT, stdio: 'inherit' },
  );
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
