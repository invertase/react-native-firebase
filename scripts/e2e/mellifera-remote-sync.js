#!/usr/bin/env node
/**
 * Rsync this checkout into a per-grant directory under the remote grant's
 * initial directory. The initial directory itself is never the destination.
 *
 * The remote directory is `mellifera-work/<name>`, relative to the remote
 * start directory. `<name>` is `--dest DIR` when given, else the `--session`
 * id, else the `sessionId` that `<cli> session show` reports for this
 * worktree. `--dest` must be relative, must not contain `.` or `..` segments,
 * and each segment uses only letters, digits, `.`, `_`, and `-`.
 *
 * The directory is created first with `<cli> exec ... -- mkdir -p -- DIR`,
 * because the remote rsync may be openrsync or older than `--mkpath`. Then
 * `--rsh` is the resolved CLI plus `exec`, then any caller `--session`,
 * `--url`, and `--federation` in the order given, then `--rsh`. Both the
 * space-separated form and the equals form are forwarded. With none of those
 * flags the string is `<cli> exec --rsh`. rsync appends the host and the
 * remote command. This process does not read a grant URL, a federation id,
 * or a listen port, and it does not start its own remote shell.
 * The destination host is a fixed placeholder with no user or port.
 *
 * On success the remote directory is the only stdout line, so callers can
 * run `yarn tests:mellifera:exec [--session ID] -w DIR -- <command>`.
 * Child stdout goes to stderr.
 *
 * usage: mellifera-remote-sync.js [--filter FILE] [--dest DIR] [--session ID] [--url URL] [--federation ID]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_FILTER = path.join(SCRIPT_DIR, 'mellifera-remote-sync.rsync-filter');
const PLACEHOLDER_HOST = 'placeholder';
const WORK_PARENT = 'mellifera-work';
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;
const USAGE =
  'usage: mellifera-remote-sync.js [--filter FILE] [--dest DIR] [--session ID] [--url URL] [--federation ID]';
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
  let dest;
  let session;
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
    if (arg === '--dest' || arg.startsWith('--dest=')) {
      const value = arg === '--dest' ? args[i + 1] : arg.slice('--dest='.length);
      if (value === undefined || value === '' || value.startsWith('-')) {
        fail('--dest requires a value');
      }
      if (dest !== undefined) {
        fail(USAGE);
      }
      dest = value;
      if (arg === '--dest') {
        i += 1;
      }
      continue;
    }
    const equals = equalsFlag(arg);
    if (equals) {
      if (!equals.value.trim()) {
        fail(`${equals.flag} requires a value`);
      }
      if (equals.flag === '--session') {
        session = equals.value;
      }
      forwarded.push(arg);
      continue;
    }
    if (FORWARDED_FLAGS.includes(arg)) {
      const value = args[i + 1];
      if (value === undefined || value.startsWith('-')) {
        fail(`${arg} requires a value`);
      }
      if (arg === '--session') {
        session = value;
      }
      forwarded.push(arg, value);
      i += 1;
      continue;
    }
    fail(USAGE);
  }
  return { filter, forwarded, dest, session };
}

function checkDest(dest) {
  if (dest.startsWith('/') || dest.startsWith('~') || dest.includes('\\')) {
    fail(`--dest must be a relative path under ${WORK_PARENT}/: ${dest}`);
  }
  const segments = dest.split('/').filter(Boolean);
  if (!segments.length) {
    fail(`--dest must name a directory under ${WORK_PARENT}/: ${dest}`);
  }
  for (const segment of segments) {
    if (segment === '.' || segment === '..') {
      fail(`--dest must not contain "." or ".." segments: ${dest}`);
    }
    if (!SAFE_SEGMENT.test(segment)) {
      fail(`--dest segment has characters outside [A-Za-z0-9._-]: ${dest}`);
    }
  }
  return segments.join('/');
}

function checkSessionName(id, source) {
  if (!SAFE_SEGMENT.test(id) || id === '.' || id === '..') {
    fail(`${source} session id is not a safe directory name; pass --dest DIR`);
  }
  return id;
}

function sessionFromRecord() {
  const shown = spawnSync(resolveCli(), ['session', 'show'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  if (shown.error) {
    fail(shown.error.message);
  }
  let report;
  try {
    report = JSON.parse(shown.stdout);
  } catch {
    report = null;
  }
  const id = report && typeof report.sessionId === 'string' ? report.sessionId : '';
  if (!id) {
    fail('no worktree session id from session show; pass --session ID or --dest DIR');
  }
  return id;
}

function remoteDirFor(parsed) {
  if (parsed.dest !== undefined) {
    return `${WORK_PARENT}/${checkDest(parsed.dest)}`;
  }
  if (parsed.session !== undefined) {
    return `${WORK_PARENT}/${checkSessionName(parsed.session, '--session')}`;
  }
  return `${WORK_PARENT}/${checkSessionName(sessionFromRecord(), 'session show')}`;
}

function run(label, command, args, onSuccess) {
  const child = spawn(command, args, { cwd: REPO_ROOT, stdio: ['inherit', 2, 'inherit'] });
  child.on('error', err => {
    fail(err.message);
  });
  child.on('exit', (code, signal) => {
    if (signal || code !== 0) {
      console.error(`mellifera-remote-sync: ${label} exited ${signal || code}`);
      process.exit(signal || code == null ? 1 : code);
    }
    onSuccess();
  });
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(parsed.filter)) {
    fail(`filter file not found: ${parsed.filter}`);
  }
  const remoteDir = remoteDirFor(parsed);
  const cli = resolveCli();
  const rsh = [cli, 'exec', ...parsed.forwarded, '--rsh'].map(quoteRshToken).join(' ');
  const mkdirArgs = ['exec', ...parsed.forwarded, '--', 'mkdir', '-p', '--', remoteDir];
  run('remote mkdir', cli, mkdirArgs, () => {
    run(
      'rsync',
      'rsync',
      [
        '-a',
        '--rsh',
        rsh,
        '--filter',
        `merge ${parsed.filter}`,
        '.',
        `${PLACEHOLDER_HOST}:${remoteDir}`,
      ],
      () => {
        process.stdout.write(`${remoteDir}\n`);
        process.exit(0);
      },
    );
  });
}

main();
