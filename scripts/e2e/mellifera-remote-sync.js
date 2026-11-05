#!/usr/bin/env node
/**
 * Rsync this checkout into a per-grant directory under the remote grant's
 * initial directory. The initial directory itself is never the destination.
 *
 * The remote directory is `mellifera-work/<name>`, relative to the remote
 * start directory. `<name>` is `--dest DIR` when given, else the `--session`
 * id, else the `sessionId` that `<cli> session show` reports for this
 * worktree. That last source must report `status` `live`; any other status
 * exits 1 before any exec. `--dest` must be relative, must not contain `.` or `..` segments,
 * and each segment uses only letters, digits, `.`, `_`, and `-`.
 *
 * Before anything is created, `<cli> exec ... -- sh -c '<probe>'` checks that
 * `rsync` is on the remote PATH. When it is not, this exits 1 naming the guest
 * requirement, with no remote directory created and no rsync started.
 *
 * The run's scratch directory is the sibling `DIR.scratch`, outside the
 * synced tree so a later sync's deletes and the tree's file watchers never
 * reach it. Both are created next with
 * `<cli> exec ... -- mkdir -p -- DIR DIR.scratch`, because the remote rsync
 * may be openrsync or older than `--mkpath`. Then `<cli> exec ... -w
 * DIR.scratch -- pwd -P` resolves the scratch directory's absolute path, which
 * goes to stderr and, with `--scratch-file FILE`, into FILE (one line). Then
 * `--rsh` is the resolved CLI plus `exec`, then any caller `--session`,
 * `--url`, and `--federation` in the order given, then `--rsh`. Both the
 * space-separated form and the equals form are forwarded. With none of those
 * flags the string is `<cli> exec --rsh`. rsync appends the host and the
 * remote command. This process does not read a grant URL, a federation id,
 * or a listen port, and it does not start its own remote shell.
 * The destination host is a fixed placeholder with no user or port.
 *
 * Mellifera session and reserve state never leaves this machine. The
 * gitignored state paths in STATE_PATHS go to rsync as `--exclude` ahead of
 * the merge filter, anchored at the checkout root and matching a directory,
 * file or symlink of that name, so a caller `--filter` cannot include them. A filter
 * file with a rule that could drop those excludes or read more rules (`!` or
 * `clear`, `merge` or `.`, `dir-merge` or `:`) exits 1 before anything runs.
 * Before any remote exec, a local `rsync --dry-run` with the same filters
 * lists what would be sent; when a listed path is a state path (any case), or
 * a listed file holds a token (a non-empty `sessionToken`,
 * `MELLIFERA_SESSION_TOKEN` or `MELLIFERA_TOKEN`, an `Authorization: Bearer`
 * value, or `token` beside `sessionId` in JSON, also after a UTF-8 BOM), this
 * exits 1 naming it, with nothing created or synced.
 *
 * On success the remote directory is the only stdout line, so callers can
 * run `yarn tests:mellifera:exec [--session ID] -w DIR -- <command>`.
 * Child stdout goes to stderr.
 *
 * usage: mellifera-remote-sync.js [--filter FILE] [--dest DIR] [--scratch-file FILE] [--session ID] [--url URL] [--federation ID]
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_FILTER = path.join(SCRIPT_DIR, 'mellifera-remote-sync.rsync-filter');
const PLACEHOLDER_HOST = 'placeholder';
const WORK_PARENT = 'mellifera-work';
const SCRATCH_SUFFIX = '.scratch';
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;
const USAGE =
  'usage: mellifera-remote-sync.js [--filter FILE] [--dest DIR] [--scratch-file FILE] [--session ID] [--url URL] [--federation ID]';
const FORWARDED_FLAGS = ['--session', '--url', '--federation'];
const RSYNC_MISSING = 'mellifera-remote-sync:rsync-missing';
const RSYNC_PROBE = `command -v rsync >/dev/null 2>&1 || { echo ${RSYNC_MISSING}; exit 1; }`;
const GUEST_REQUIREMENTS_DOC = 'okf-bundle/testing/running-e2e-distributed.md#guest-requirements';
// Keep in step with the Mellifera block in .gitignore and the default rsync filter.
const STATE_PATHS = [
  'tests/mellifera-distributed',
  'tests/mellifera-platform',
  'tests/mellifera.env.json',
  'tests/.mellifera-session.env',
];
// Anchored at the checkout root. The bare name also matches a file or a
// symlink at that path; a trailing `/` matches directories only.
const STATE_EXCLUDES = STATE_PATHS.flatMap(rel => [`/${rel}`, `/${rel}/`]);
const TOKEN_KEYS = ['sessionToken', 'MELLIFERA_SESSION_TOKEN', 'MELLIFERA_TOKEN'];
// A value in angle brackets, such as `<redacted>`, is a placeholder, and one
// starting with `$` is a shell reference; neither is a token.
const TOKEN_TEXT = [
  /^\s*(?:export\s+)?MELLIFERA_(?:SESSION_)?TOKEN\s*=\s*['"]?[^\s'"<$]/m,
  /"(?:sessionToken|MELLIFERA_SESSION_TOKEN|MELLIFERA_TOKEN)"\s*:\s*"[^"<$]/,
];
// A bearer value counts when it is one run of 20 or more token characters
// with no `...` elision, so doc examples such as `Bearer owner` do not.
const BEARER = /\bAuthorization:\s*Bearer\s+([A-Za-z0-9._~+/=-]{20,})(?=$|[\s'"])/gim;

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
  let scratchFile;
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
    if (arg === '--scratch-file' || arg.startsWith('--scratch-file=')) {
      const value = arg === '--scratch-file' ? args[i + 1] : arg.slice('--scratch-file='.length);
      if (value === undefined || value === '' || value.startsWith('-')) {
        fail('--scratch-file requires a value');
      }
      if (scratchFile !== undefined) {
        fail(USAGE);
      }
      scratchFile = path.resolve(value);
      if (arg === '--scratch-file') {
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
  return { filter, forwarded, dest, session, scratchFile };
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
  if (report.status !== 'live') {
    fail(`session ${id} is ${report.status || 'not live'}; reserve again`);
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

/** Fails unless the remote grant has `rsync` on PATH, the receiving end of the sync. */
function checkRemoteRsync(cli, forwarded, onSuccess) {
  const child = spawn(cli, ['exec', ...forwarded, '--', 'sh', '-c', RSYNC_PROBE], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  let out = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    out += chunk;
  });
  child.on('error', err => {
    fail(err.message);
  });
  child.on('close', (code, signal) => {
    if (out.split('\n').includes(RSYNC_MISSING)) {
      fail(
        'the remote grant has no rsync on PATH; the guest image for this kind must provide ' +
          `rsync (see ${GUEST_REQUIREMENTS_DOC}). Nothing was synced.`,
      );
    }
    if (signal || code !== 0) {
      process.stderr.write(`mellifera-remote-sync: remote rsync check exited ${signal || code}\n`);
      process.exit(signal || code == null ? 1 : code);
    }
    onSuccess();
  });
}

/** Absolute remote path of `scratchDir` (relative to the grant's start directory). */
function resolveScratch(cli, forwarded, scratchDir, onSuccess) {
  const child = spawn(cli, ['exec', ...forwarded, '-w', scratchDir, '--', 'pwd', '-P'], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  let out = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    out += chunk;
  });
  child.on('error', err => {
    fail(err.message);
  });
  child.on('close', (code, signal) => {
    if (signal || code !== 0) {
      process.stderr.write(`mellifera-remote-sync: remote scratch path exited ${signal || code}\n`);
      process.exit(signal || code == null ? 1 : code);
    }
    const lines = out.split('\n').filter(Boolean);
    const leaf = path.posix.basename(scratchDir);
    if (lines.length !== 1 || !lines[0].startsWith('/') || path.posix.basename(lines[0]) !== leaf) {
      fail(
        `remote scratch path is not one absolute path ending in ${leaf}: ${JSON.stringify(out)}`,
      );
    }
    onSuccess(lines[0]);
  });
}

function filterArgs(filter) {
  return [...STATE_EXCLUDES.map(pattern => `--exclude=${pattern}`), '--filter', `merge ${filter}`];
}

/**
 * The rule word of one filter line: `clear`, `merge` or `dir-merge` (long or
 * short form, with or without modifiers), else null. rsync ignores blank lines
 * and lines starting with `#` or `;` in a merge file.
 */
function unsafeRule(line) {
  const text = line.trim();
  if (!text || text.startsWith('#') || text.startsWith(';')) {
    return null;
  }
  const word = text.split(/[\s_]/, 1)[0];
  if (word.startsWith('!') || /^clear(,|$)/i.test(word)) {
    return 'clear';
  }
  if (word.startsWith('.') || /^merge(,|$)/i.test(word)) {
    return 'merge';
  }
  if (word.startsWith(':') || /^dir-merge(,|$)/i.test(word)) {
    return 'dir-merge';
  }
  return null;
}

/**
 * Exits 1 when the filter file has a rule that could undo the state excludes:
 * a clear drops them, and a merge or dir-merge reads rules this check never sees.
 */
function refuseUnsafeFilter(filter) {
  let text;
  try {
    if (!fs.statSync(filter).isFile()) {
      fail(`filter file is not a regular file: ${filter}`);
    }
    text = fs.readFileSync(filter, 'utf8');
  } catch (err) {
    fail(`cannot read filter file ${filter}: ${err.message}`);
  }
  const found = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const rule = unsafeRule(line);
    if (rule) {
      found.push(`line ${i + 1} (${rule})`);
    }
  });
  if (found.length) {
    fail(
      `refusing filter ${filter}: ${found.join(', ')}. A clear, merge or dir-merge rule could ` +
        'undo the Mellifera state excludes; use only include and exclude rules. Nothing was run.',
    );
  }
}

function isStatePath(rel) {
  const name = rel.replace(/\/+$/, '').toLowerCase();
  return STATE_PATHS.some(state => name === state || name.startsWith(`${state}/`));
}

function isTokenValue(value) {
  return typeof value === 'string' && value !== '' && !/^<[^>]*>$/.test(value);
}

function tokenShaped(value) {
  if (Array.isArray(value)) {
    return value.some(tokenShaped);
  }
  if (!value || typeof value !== 'object') {
    return false;
  }
  if (TOKEN_KEYS.some(key => isTokenValue(value[key]))) {
    return true;
  }
  if (typeof value.sessionId === 'string' && isTokenValue(value.token)) {
    return true;
  }
  return Object.values(value).some(tokenShaped);
}

function parsesToToken(text) {
  try {
    return tokenShaped(JSON.parse(text));
  } catch {
    return false;
  }
}

function holdsBearer(text) {
  return [...text.matchAll(BEARER)].some(match => !match[1].includes('...'));
}

function holdsSessionToken(raw) {
  const text = raw.replace(/^\uFEFF/, '');
  if (TOKEN_TEXT.some(pattern => pattern.test(text)) || holdsBearer(text)) {
    return true;
  }
  if (/^\s*[[{]/.test(text) && parsesToToken(text)) {
    return true;
  }
  return text
    .split('\n')
    .map(line => line.replace(/^\uFEFF/, ''))
    .some(line => /^\s*\{/.test(line) && parsesToToken(line));
}

/** Files a sync with these filters would send, from a local dry run into an empty directory. */
function listOutgoing(filter) {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-remote-sync-list-'));
  try {
    const listed = spawnSync(
      'rsync',
      ['-a', '--dry-run', '--out-format=%n', ...filterArgs(filter), '.', `${empty}/`],
      { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
    );
    if (listed.error) {
      fail(`local rsync listing failed: ${listed.error.message}`);
    }
    if (listed.status !== 0) {
      process.stderr.write(listed.stderr || '');
      fail(`local rsync listing exited ${listed.status}; nothing was synced`);
    }
    return listed.stdout.split('\n').filter(Boolean);
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
}

/**
 * Exits 1 before any remote exec when an outgoing path is Mellifera state or
 * an outgoing file holds a session token.
 */
function refuseSessionTokens(filter) {
  const outgoing = listOutgoing(filter);
  const state = outgoing.filter(isStatePath);
  if (state.length) {
    fail(
      `refusing to sync: ${state.join(', ')} is Mellifera session state and must not reach the ` +
        'remote host. Nothing was synced.',
    );
  }
  const held = outgoing.filter(rel => {
    if (rel.endsWith('/')) {
      return false;
    }
    const abs = path.join(REPO_ROOT, rel);
    let stat;
    try {
      stat = fs.lstatSync(abs);
    } catch {
      return false;
    }
    return stat.isFile() && holdsSessionToken(fs.readFileSync(abs, 'utf8'));
  });
  if (held.length) {
    fail(
      `refusing to sync: ${held.join(', ')} would carry a Mellifera session token to the remote ` +
        'host. Move it out of this checkout or exclude it with --filter. Nothing was synced.',
    );
  }
}

function sync(rsh, filter, remoteDir) {
  run(
    'rsync',
    'rsync',
    ['-a', '--rsh', rsh, ...filterArgs(filter), '.', `${PLACEHOLDER_HOST}:${remoteDir}`],
    () => {
      process.stdout.write(`${remoteDir}\n`);
      process.exit(0);
    },
  );
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(parsed.filter)) {
    fail(`filter file not found: ${parsed.filter}`);
  }
  refuseUnsafeFilter(parsed.filter);
  if (parsed.scratchFile !== undefined) {
    const parent = path.dirname(parsed.scratchFile);
    if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) {
      fail(`--scratch-file directory does not exist: ${parent}`);
    }
  }
  const remoteDir = remoteDirFor(parsed);
  refuseSessionTokens(parsed.filter);
  const scratchDir = `${remoteDir}${SCRATCH_SUFFIX}`;
  const cli = resolveCli();
  const rsh = [cli, 'exec', ...parsed.forwarded, '--rsh'].map(quoteRshToken).join(' ');
  const mkdirArgs = ['exec', ...parsed.forwarded, '--', 'mkdir', '-p', '--', remoteDir, scratchDir];
  checkRemoteRsync(cli, parsed.forwarded, () =>
    run('remote mkdir', cli, mkdirArgs, () =>
      resolveScratch(cli, parsed.forwarded, scratchDir, scratchPath => {
        process.stderr.write(`mellifera-remote-sync: scratch ${scratchPath}\n`);
        if (parsed.scratchFile !== undefined) {
          try {
            fs.writeFileSync(parsed.scratchFile, `${scratchPath}\n`);
          } catch (err) {
            fail(`cannot write --scratch-file ${parsed.scratchFile}: ${err.message}`);
          }
        }
        sync(rsh, parsed.filter, remoteDir);
      }),
    ),
  );
}

main();
