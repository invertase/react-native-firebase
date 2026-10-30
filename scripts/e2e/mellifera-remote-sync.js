#!/usr/bin/env node
/**
 * Rsync this checkout to the remote grant's initial directory.
 *
 * `--rsh` is the resolved CLI plus `exec`, then any caller `--session`,
 * `--url`, and `--federation` in the order given, then `--rsh`. Both the
 * space-separated form and the equals form are forwarded. With none of those
 * flags the string is `<cli> exec --rsh`. rsync appends the host and the
 * remote command. This process does not read a grant URL, a federation id,
 * or a listen port, and it does not start its own remote shell.
 * The destination host is a fixed placeholder with no user or port; the
 * remote side starts in `.`.
 *
 * usage: mellifera-remote-sync.js [--filter FILE] [--session ID] [--url URL] [--federation ID]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_FILTER = path.join(SCRIPT_DIR, 'mellifera-remote-sync.rsync-filter');
const PLACEHOLDER_HOST = 'placeholder';
const USAGE =
  'usage: mellifera-remote-sync.js [--filter FILE] [--session ID] [--url URL] [--federation ID]';
const FORWARDED_FLAGS = ['--session', '--url', '--federation'];

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

function equalsFlag(arg) {
  for (const flag of FORWARDED_FLAGS) {
    const prefix = `${flag}=`;
    if (arg.startsWith(prefix)) {
      return { flag, value: arg.slice(prefix.length) };
    }
  }
  return null;
}

function parseArgs(argv) {
  const args = argv[0] === '--' ? argv.slice(1) : argv;
  let filter = DEFAULT_FILTER;
  let sawFilter = false;
  const forwarded = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--filter') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        fail('--filter requires a value');
      }
      if (sawFilter) {
        fail(USAGE);
      }
      filter = path.resolve(value);
      sawFilter = true;
      i += 1;
      continue;
    }
    const equals = equalsFlag(arg);
    if (equals) {
      if (!equals.value.trim()) {
        fail(`${equals.flag} requires a value`);
      }
      forwarded.push(arg);
      continue;
    }
    if (FORWARDED_FLAGS.includes(arg)) {
      const value = args[i + 1];
      if (value === undefined || value.startsWith('-')) {
        fail(`${arg} requires a value`);
      }
      forwarded.push(arg, value);
      i += 1;
      continue;
    }
    fail(USAGE);
  }
  return { filter, forwarded };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(parsed.filter)) {
    fail(`filter file not found: ${parsed.filter}`);
  }
  const rsh = [resolveCli(), 'exec', ...parsed.forwarded, '--rsh'].map(quoteRshToken).join(' ');
  const child = spawn(
    'rsync',
    ['-a', '--rsh', rsh, '--filter', `merge ${parsed.filter}`, '.', `${PLACEHOLDER_HOST}:.`],
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
