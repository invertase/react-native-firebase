#!/usr/bin/env node
/**
 * Every tests:mellifera:* script is a bare `node ./scripts/e2e/<file>.js` line
 * that loads only Node built-ins, so it runs in a checkout with no install.
 * CLI-word wrappers forward argv unchanged to MELLIFERA_CLI, or to
 * mellifera-cli on PATH when MELLIFERA_CLI is unset. No wrapper defaults to a
 * CLI copy inside this repo.
 * The closed-port check runs a real CLI (MELLIFERA_BUILT_CLI, else PATH) that
 * must report version 0.2.0 or later.
 * apply forwards to the reservation mapper and does not invoke the CLI.
 * reserve-apply runs reserve with argv unchanged, then passes the grant JSON
 * to the mapper.
 * remote-sync uses rsync --rsh "<cli> exec --rsh" when no session, url, or
 * federation flag is passed. Those caller flags are placed before --rsh in
 * caller order. The destination is mellifera-work/<name> on a remote
 * placeholder, created by exec mkdir, never the remote start directory.
 * Before that, an exec probe checks the remote PATH for rsync; without it the
 * sync fails naming the guest requirement and creates nothing remotely.
 * A smoke run syncs into a fake remote start directory that already holds
 * unrelated files, then runs exec -w on the printed directory.
 * Mellifera state paths are excluded ahead of any caller filter, a caller
 * filter that could undo that is refused, and a state path or a
 * session-token-shaped file in the outgoing set stops the sync before any
 * remote exec.
 * Run: yarn tests:mellifera:assert-cli-wrappers
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { isBuiltin } = require('module');
const { spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_FILTER = path.join(SCRIPT_DIR, 'mellifera-remote-sync.rsync-filter');
const PKG = require(path.join(REPO_ROOT, 'package.json'));
const IN_REPO_CLI_DIR = path.join(REPO_ROOT, 'scripts', 'mellifera');
const STATE_PATHS = [
  'tests/mellifera-distributed',
  'tests/mellifera-platform',
  'tests/mellifera.env.json',
  'tests/.mellifera-session.env',
];
const STATE_EXCLUDES = STATE_PATHS.flatMap(rel => [`/${rel}`, `/${rel}/`]);
const FIXTURE_TOKEN = 'tok-sync-guard-secret';
// 0.2.0 is the first CLI that reads MELLIFERA_SESSION_TOKEN, which the reducer's release needs.
const MIN_CLI_VERSION = [0, 2, 0];
const INSTALL_HINT =
  'install mellifera-cli 0.2.0 or later (Mellifera CLI README § Bootstrap from your global core, ' +
  'or § Pinned install from GitHub release) or set MELLIFERA_BUILT_CLI';

const CLI_WORDS = [
  ['tests:mellifera:status', ['status'], ['--json']],
  ['tests:mellifera:doctor', ['doctor'], ['--json']],
  ['tests:mellifera:register', ['register'], ['--slots', '1']],
  ['tests:mellifera:unregister', ['unregister'], ['--worker-id', 'desk-a']],
  ['tests:mellifera:donate', ['donate'], ['--retract', '--slots', '1']],
  ['tests:mellifera:reserve', ['reserve'], ['--kinds=slot', '--no-state', '--local-wait-ms', '0']],
  ['tests:mellifera:session:show', ['session', 'show'], ['--session-id', 'abc']],
  ['tests:mellifera:session:clear', ['session', 'clear'], ['--release']],
  ['tests:mellifera:exec', ['exec'], ['--', 'echo', 'marker']],
  ['tests:mellifera:release', ['release'], ['--session-id', 'abc']],
  ['tests:mellifera:extend', ['extend'], ['--global', '--ttl-ms', '5400000']],
  ['tests:mellifera:releases', ['releases'], ['--global', '--grant', 'abc']],
];

const ALLOWED = new Set([
  ...CLI_WORDS.map(row => row[0]),
  'tests:mellifera:apply',
  'tests:mellifera:reserve-apply',
  'tests:mellifera:remote-sync',
  'tests:mellifera:assert-cli-wrappers',
  'tests:mellifera:assert-apply-reservation',
  'tests:mellifera:reduce',
  'tests:mellifera:assert-distributed-reduce',
]);

function fail(message) {
  throw new Error(message);
}

function assertDeepEqual(label, actual, expected) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    fail(`${label}\n  actual:   ${a}\n  expected: ${b}`);
  }
}

function readJsonLines(file) {
  if (!fs.existsSync(file)) {
    return [];
  }
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function clearLog(file) {
  fs.writeFileSync(file, '');
}

function which(bin) {
  const found = spawnSync('which', [bin], { encoding: 'utf8' });
  if (found.status !== 0 || !found.stdout.trim()) {
    return '';
  }
  return found.stdout.trim();
}

function resolveBuiltCli() {
  const explicit = process.env.MELLIFERA_BUILT_CLI && process.env.MELLIFERA_BUILT_CLI.trim();
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      fail(`MELLIFERA_BUILT_CLI does not exist: ${explicit}`);
    }
    return explicit;
  }
  const found = which('mellifera-cli');
  if (found) {
    return found;
  }
  fail(`mellifera-cli is not on PATH; ${INSTALL_HINT}`);
}

function assertCliVersion(builtCli) {
  const ran = spawnSync(builtCli, ['--version'], { encoding: 'utf8', timeout: 30000 });
  const text = `${ran.stdout || ''}${ran.stderr || ''}`;
  const match = /\bversion=(\d+)\.(\d+)\.(\d+)/.exec(text);
  if (ran.status !== 0 || !match) {
    fail(`${builtCli} --version did not report version=X.Y.Z (exit ${ran.status})\n${text}`);
  }
  const actual = match.slice(1, 4).map(Number);
  for (let i = 0; i < MIN_CLI_VERSION.length; i++) {
    if (actual[i] > MIN_CLI_VERSION[i]) {
      return;
    }
    if (actual[i] < MIN_CLI_VERSION[i]) {
      fail(`${builtCli} is mellifera-cli ${actual.join('.')}; ${INSTALL_HINT}`);
    }
  }
}

function listenClosedPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve(port);
      });
    });
  });
}

function childEnv(base, extra) {
  const env = { ...base, ...extra };
  delete env.MELLIFERA_TOKEN;
  delete env.MELLIFERA_URL;
  delete env.MELLIFERA_GLOBAL;
  delete env.SSH_AUTH_SOCK;
  return env;
}

function runYarn(script, args, env) {
  // Yarn forwards a leading "--" as a script argument. Callers pass the argv
  // the wrapper should see, including an exec "--" separator when one is required.
  const result = spawnSync('yarn', [script, ...args], {
    cwd: REPO_ROOT,
    env,
    encoding: 'utf8',
    timeout: 120000,
  });
  return result;
}

function assertNoHttpOrConfig(relPath) {
  const text = fs.readFileSync(path.join(REPO_ROOT, relPath), 'utf8');
  const banned = [
    /fetch\s*\(/,
    /http\.request/,
    /https\.request/,
    /config\.jsonc/,
    /connectUrl/,
    /\bssh\b/,
  ];
  for (const pattern of banned) {
    if (pattern.test(text)) {
      fail(`${relPath} matches ${pattern}`);
    }
  }
}

function assertScriptSet() {
  const names = Object.keys(PKG.scripts).filter(name => name.startsWith('tests:mellifera:'));
  for (const name of names) {
    if (!ALLOWED.has(name)) {
      fail(`unexpected wrapper script ${name}`);
    }
    if (/acquire|desk:|remote-run|setup-/.test(name)) {
      fail(`forbidden wrapper name ${name}`);
    }
    if (/scripts\/mellifera\b/.test(PKG.scripts[name])) {
      fail(`${name} points at a CLI copy inside this repo: ${PKG.scripts[name]}`);
    }
  }
  if (fs.existsSync(IN_REPO_CLI_DIR)) {
    fail(`${path.relative(REPO_ROOT, IN_REPO_CLI_DIR)} exists; do not vendor the Mellifera CLI`);
  }
  for (const name of ALLOWED) {
    if (!PKG.scripts[name]) {
      fail(`missing package.json script ${name}`);
    }
  }
  const apply = PKG.scripts['tests:mellifera:apply'];
  if (!apply.includes('mellifera-apply-reservation.js') || apply.includes('mellifera-cli')) {
    fail(`apply must run the mapper only: ${apply}`);
  }
  const sync = PKG.scripts['tests:mellifera:remote-sync'];
  if (!sync.includes('mellifera-remote-sync.js') || /shim|rsh\.js/.test(sync)) {
    fail(`remote-sync script entry is not the rsync wrapper: ${sync}`);
  }
  const reduce = PKG.scripts['tests:mellifera:reduce'];
  if (!reduce.includes('mellifera-distributed-reduce.js') || reduce.includes('mellifera-cli')) {
    fail(`reduce must run the reducer only: ${reduce}`);
  }
}

/**
 * A checkout with no install runs a wrapper as its package.json value
 * (running-e2e.md#mellifera-no-install-controller), so each one must be a bare
 * `node ./scripts/e2e/<file>.js` line whose scripts load only Node built-ins
 * and other files in this directory.
 */
function assertNodeOnlyWrappers(scripts = PKG.scripts, dir = SCRIPT_DIR) {
  const line = /^node \.\/scripts\/e2e\/([A-Za-z0-9._-]+\.js)(?: [A-Za-z0-9:._-]+)*$/;
  const specifier =
    /\brequire\s*\(\s*(['"`])([^'"`]+)\1\s*\)|\bfrom\s+(['"])([^'"]+)\3|\bimport\s*\(\s*(['"])([^'"]+)\5\s*\)/g;
  const seen = new Set();
  const visit = (file, from) => {
    if (seen.has(file)) {
      return;
    }
    seen.add(file);
    if (path.dirname(file) !== dir || !fs.existsSync(file)) {
      fail(`${from} loads ${path.basename(file)}, which is not a file in scripts/e2e`);
    }
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(specifier)) {
      const spec = match[2] || match[4] || match[6];
      if (spec.startsWith('./')) {
        const target = path.resolve(path.dirname(file), spec);
        visit(fs.existsSync(target) ? target : `${target}.js`, path.basename(file));
      } else if (!isBuiltin(spec)) {
        fail(`${path.basename(file)} loads ${spec}, which is not a Node built-in`);
      }
    }
  };
  for (const name of Object.keys(scripts).filter(n => n.startsWith('tests:mellifera:'))) {
    const match = line.exec(scripts[name]);
    if (!match) {
      fail(`${name} is not a bare node ./scripts/e2e/<file>.js line: ${scripts[name]}`);
    }
    visit(path.join(dir, match[1]), name);
  }
}

/** The check above refuses a yarn-only line, a package dependency, and a load from outside scripts/e2e. */
function assertNodeOnlyWrappersRefuse(home) {
  const dir = fs.mkdtempSync(path.join(home, 'node-only-'));
  const loads = {
    'ok.js': ['node:fs', './helper'],
    'helper.js': ['child_process'],
    'dep.js': ['./helper', 'semver'],
    'up.js': ['../lib/x'],
  };
  for (const [file, specs] of Object.entries(loads)) {
    const body = specs.map(spec => `require(${JSON.stringify(spec)});\n`).join('');
    fs.writeFileSync(path.join(dir, file), body);
  }
  fs.writeFileSync(path.join(dir, 'esm.js'), `import chalk from ${JSON.stringify('chalk')};\n`);
  assertNodeOnlyWrappers({ 'tests:mellifera:ok': 'node ./scripts/e2e/ok.js 1 exec' }, dir);
  const refused = [
    ['node ./scripts/e2e/dep.js', /dep\.js loads semver/],
    ['node ./scripts/e2e/esm.js', /esm\.js loads chalk/],
    ['node ./scripts/e2e/up.js', /up\.js loads \.\.\/lib\/x/],
    ['node ./scripts/e2e/missing.js', /missing\.js, which is not a file/],
    ['yarn node ./scripts/e2e/ok.js', /is not a bare node/],
    ['node ./scripts/e2e/ok.js && rm -rf x', /is not a bare node/],
    ['node --require x ./scripts/e2e/ok.js', /is not a bare node/],
  ];
  for (const [value, message] of refused) {
    let error = null;
    try {
      assertNodeOnlyWrappers({ 'tests:mellifera:x': value }, dir);
    } catch (e) {
      error = e;
    }
    if (!error || !message.test(error.message)) {
      fail(`node-only wrapper check did not refuse ${value}: ${error ? error.message : 'passed'}`);
    }
  }
}

function assertNoShimFile() {
  for (const name of fs.readdirSync(SCRIPT_DIR)) {
    if (
      /shim|rsh/i.test(name) &&
      name !== 'mellifera-remote-sync.js' &&
      name !== 'mellifera-remote-sync.rsync-filter'
    ) {
      fail(`unexpected remote-shell shim script: ${name}`);
    }
  }
}

function assertForwarding(env, stubLog) {
  for (const [script, words, user] of CLI_WORDS) {
    clearLog(stubLog);
    const result = runYarn(script, user, env);
    if (result.status !== 0) {
      fail(`${script} exited ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
    }
    const calls = readJsonLines(stubLog);
    if (calls.length !== 1) {
      fail(`${script} invoked the CLI ${calls.length} times: ${JSON.stringify(calls)}`);
    }
    assertDeepEqual(script, calls[0], [...words, ...user]);
    const flat = calls[0].join(' ');
    if (flat.includes('--wait') || flat.includes('900000') || flat.includes('15m')) {
      fail(`${script} added a deadline or --wait: ${flat}`);
    }
  }
}

function assertApplyDoesNotCallCli(env, stubLog, home) {
  clearLog(stubLog);
  const tmp = fs.mkdtempSync(path.join(home, 'apply-'));
  const envFile = path.join(tmp, 'session.env');
  const portsFile = path.join(tmp, 'ports.json');
  const grant = JSON.stringify({
    placement: 'slot',
    slot: 1,
    sessionId: 's-apply',
    token: 't-apply',
    env: {},
  });
  const result = runYarn('tests:mellifera:apply', [grant, envFile, portsFile], env);
  if (result.status !== 0) {
    fail(`apply exited ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  }
  const calls = readJsonLines(stubLog);
  if (calls.length !== 0) {
    fail(`apply invoked the CLI: ${JSON.stringify(calls)}`);
  }
  const ports = JSON.parse(fs.readFileSync(portsFile, 'utf8'));
  if (ports.slot !== 1 || ports.placement !== 'slot') {
    fail(`apply did not map the grant: ${JSON.stringify(ports)}`);
  }
  if (ports.env && Object.keys(ports.env).length > 0) {
    fail('apply wrote a non-empty reservation env');
  }
}

function snapshotFile(file) {
  if (!fs.existsSync(file)) {
    return null;
  }
  return fs.readFileSync(file);
}

function restoreFile(file, previous) {
  if (previous == null) {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { force: true });
    }
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, previous);
}

function assertReserveApply(env, stubLog) {
  const outputs = [
    path.join(REPO_ROOT, 'tests', '.mellifera-session.env'),
    path.join(REPO_ROOT, 'tests', 'mellifera.env.json'),
    path.join(REPO_ROOT, 'tests', 'mellifera-platform', 'android.env'),
    path.join(REPO_ROOT, 'tests', 'mellifera-platform', 'ios.env'),
    path.join(REPO_ROOT, 'tests', 'mellifera-platform', 'macos.env'),
  ];
  const saved = outputs.map(file => [file, snapshotFile(file)]);
  clearLog(stubLog);
  const user = ['--kinds=slot', '--no-state', '--local-wait-ms', '0'];
  try {
    const result = runYarn('tests:mellifera:reserve-apply', user, env);
    if (result.status !== 0) {
      fail(
        `reserve-apply exited ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
      );
    }
    const calls = readJsonLines(stubLog);
    if (calls.length !== 1) {
      fail(`reserve-apply CLI calls: ${JSON.stringify(calls)}`);
    }
    assertDeepEqual('reserve-apply', calls[0], ['reserve', ...user]);
    const flat = calls[0].join(' ');
    if (
      /(^|\s)--wait(\s|$)/.test(flat) ||
      flat.includes('--timeout-ms') ||
      flat.includes('900000')
    ) {
      fail(`reserve-apply added a deadline or --wait: ${flat}`);
    }
    const ports = JSON.parse(fs.readFileSync(outputs[1], 'utf8'));
    if (ports.slot !== 1 || ports.placement !== 'slot') {
      fail(`reserve-apply mapper did not receive the grant: ${JSON.stringify(ports)}`);
    }
    if (!ports.env || Object.keys(ports.env).length !== 0) {
      fail('reserve-apply mapper did not keep reservation env empty');
    }
  } finally {
    for (const [file, previous] of saved) {
      restoreFile(file, previous);
    }
  }
}

function rsyncArgValue(argv, flag) {
  const index = argv.indexOf(flag);
  if (index < 0 || index + 1 >= argv.length) {
    fail(`rsync argv missing ${flag}: ${JSON.stringify(argv)}`);
  }
  return argv[index + 1];
}

function assertRsyncProbe(label, argv, forwarded) {
  const head = ['exec', ...forwarded, '--', 'sh', '-c'];
  assertDeepEqual(`${label} remote rsync probe`, argv.slice(0, head.length), head);
  if (argv.length !== head.length + 1 || !argv[head.length].includes('command -v rsync')) {
    fail(`${label} remote rsync probe is not one sh -c script: ${JSON.stringify(argv)}`);
  }
}

/** rsync runs that transfer; the local `--dry-run` listing of outgoing files is not one. */
function transferCalls(rsyncLog) {
  return readJsonLines(rsyncLog).filter(argv => !argv.includes('--dry-run'));
}

/** The Mellifera state excludes come before the merge filter, so a caller filter cannot re-include them. */
function assertStateExcludes(label, argv) {
  const filterAt = argv.indexOf('--filter');
  for (const pattern of STATE_EXCLUDES) {
    const at = argv.indexOf(`--exclude=${pattern}`);
    if (at < 0 || filterAt < 0 || at > filterAt) {
      fail(
        `${label} rsync argv lacks --exclude=${pattern} before --filter: ${JSON.stringify(argv)}`,
      );
    }
  }
}

function assertDefaultFilterListsState() {
  const lines = fs.readFileSync(DEFAULT_FILTER, 'utf8').split('\n');
  for (const pattern of STATE_EXCLUDES) {
    if (!lines.includes(`- ${pattern}`)) {
      fail(`default rsync filter does not exclude ${pattern}`);
    }
  }
  const ignored = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf8').split('\n');
  for (const rel of STATE_PATHS) {
    if (!ignored.includes(rel) && !ignored.includes(`${rel}/`)) {
      fail(`.gitignore does not list ${rel}; the sync excludes follow the gitignored state`);
    }
  }
}

/**
 * The excludes remote-sync passes are anchored at the checkout root and also
 * match a symlink at a state path, not only a directory. They come from a real
 * remote-sync listing argv and run with the real rsync on a tree where every
 * state path is a symlink. A nested `tests/` deeper in the tree is not a state
 * path and still syncs.
 */
function assertStateSymlinksExcluded(env, stubLog, rsyncLog, realRsync, home) {
  clearLog(stubLog);
  clearLog(rsyncLog);
  runYarn('tests:mellifera:remote-sync', ['--session', 'sess-symlink'], env);
  const listing = readJsonLines(rsyncLog).find(argv => argv.includes('--dry-run'));
  if (!listing) {
    fail('remote-sync ran no dry-run listing for the symlink check');
  }
  const excludes = listing.filter(arg => arg.startsWith('--exclude='));
  for (const arg of excludes) {
    if (!arg.startsWith('--exclude=/')) {
      fail(`state exclude is not anchored at the checkout root: ${arg}`);
    }
  }
  const src = fs.mkdtempSync(path.join(home, 'symlink-src-'));
  const dst = fs.mkdtempSync(path.join(home, 'symlink-dst-'));
  fs.mkdirSync(path.join(src, 'hidden'));
  fs.writeFileSync(path.join(src, 'hidden', 'state.env'), 'RNFB_E2E_SLOT=1\n');
  fs.mkdirSync(path.join(src, 'tests'));
  fs.writeFileSync(path.join(src, 'tests', 'keep.txt'), 'kept\n');
  for (const rel of STATE_PATHS) {
    fs.symlinkSync(path.join('..', 'hidden'), path.join(src, rel));
  }
  const nested = path.join(src, 'packages', 'x', 'tests', 'mellifera-platform');
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(path.join(nested, 'fixture.env'), 'nested\n');
  const ran = spawnSync(realRsync, ['-a', ...excludes, `${src}/`, `${dst}/`], {
    encoding: 'utf8',
  });
  if (ran.status !== 0) {
    fail(`symlink exclude rsync exited ${ran.status}\n${ran.stderr}`);
  }
  assertDeepEqual(
    'symlinked state paths remote tests entries',
    fs.readdirSync(path.join(dst, 'tests')),
    ['keep.txt'],
  );
  if (
    !fs.existsSync(path.join(dst, 'packages', 'x', 'tests', 'mellifera-platform', 'fixture.env'))
  ) {
    fail('a nested tests/mellifera-platform is not a state path and must still sync');
  }
}

function assertRemoteSync(env, stubLog, rsyncLog) {
  const pointerEnv = { ...env, STUB_SESSION_ID: 's-pointer' };

  function check(label, yarnArgs, filterPath, forwarded, remoteDir, options = {}) {
    clearLog(stubLog);
    clearLog(rsyncLog);
    const result = runYarn('tests:mellifera:remote-sync', yarnArgs, options.env || env);
    const allRsync = readJsonLines(rsyncLog);
    const rsyncCalls = transferCalls(rsyncLog);
    const stubCalls = readJsonLines(stubLog);
    if (allRsync.length !== 2 || !allRsync[0].includes('--dry-run')) {
      fail(`${label} did not list outgoing files before the transfer: ${JSON.stringify(allRsync)}`);
    }
    assertStateExcludes(`${label} listing`, allRsync[0]);
    if (rsyncCalls.length !== 1) {
      fail(
        `${label} rsync calls ${rsyncCalls.length} (exit ${result.status})\nstderr: ${result.stderr}`,
      );
    }
    if (result.status === 0 || result.stdout.trim() !== '') {
      fail(`${label} printed a directory without a completed sync: ${JSON.stringify(result)}`);
    }
    const argv = rsyncCalls[0];
    assertStateExcludes(label, argv);
    const destination = argv[argv.length - 1];
    if (destination !== `placeholder:${remoteDir}`) {
      fail(`${label} destination is not ${remoteDir} on the remote placeholder: ${destination}`);
    }
    if (destination === 'placeholder:.' || !remoteDir.startsWith('mellifera-work/')) {
      fail(`${label} destination is the remote start directory: ${destination}`);
    }
    if (!destination.includes(':') || destination.includes('@')) {
      fail(`${label} destination is local or has a user: ${destination}`);
    }
    const rsh = rsyncArgValue(argv, '--rsh');
    const expectedRsh = [env.MELLIFERA_CLI, 'exec', ...forwarded, '--rsh'].join(' ');
    if (rsh !== expectedRsh) {
      fail(`${label} --rsh is ${JSON.stringify(rsh)}`);
    }
    const rshAt = rsh.lastIndexOf(' --rsh');
    const beforeRsh = rshAt < 0 ? '' : rsh.slice(0, rshAt);
    for (const token of forwarded) {
      if (!beforeRsh.includes(token)) {
        fail(`${label} forwarded flag is not before --rsh: ${token} in ${JSON.stringify(rsh)}`);
      }
    }
    if (rsh.includes('-- ') || rsh.includes('scripts/e2e')) {
      fail(`${label} --rsh inserted a separator or a shim: ${rsh}`);
    }
    const filterArg = rsyncArgValue(argv, '--filter');
    if (!filterArg.includes(filterPath)) {
      fail(`${label} filter arg ${JSON.stringify(filterArg)} does not include ${filterPath}`);
    }
    if (filterPath !== DEFAULT_FILTER && filterArg.includes(DEFAULT_FILTER)) {
      fail(`${label} used the default filter and the caller filter`);
    }
    const expectedCalls = options.sessionShow ? 5 : 4;
    if (stubCalls.length !== expectedCalls) {
      fail(`${label} stub calls: ${JSON.stringify(stubCalls)}\nrsync stderr: ${result.stderr}`);
    }
    if (options.sessionShow) {
      assertDeepEqual(`${label} session show`, stubCalls[0], ['session', 'show']);
    }
    const scratchDir = `${remoteDir}.scratch`;
    const [probeArgv, mkdirArgv, pwdArgv, stubArgv] = stubCalls.slice(expectedCalls - 4);
    assertRsyncProbe(label, probeArgv, forwarded);
    assertDeepEqual(`${label} remote mkdir`, mkdirArgv, [
      'exec',
      ...forwarded,
      '--',
      'mkdir',
      '-p',
      '--',
      remoteDir,
      scratchDir,
    ]);
    assertDeepEqual(`${label} remote scratch path`, pwdArgv, [
      'exec',
      ...forwarded,
      '-w',
      scratchDir,
      '--',
      'pwd',
      '-P',
    ]);
    if (!`${result.stderr}`.includes(`mellifera-remote-sync: scratch /stub-home/${scratchDir}\n`)) {
      fail(`${label} did not report the scratch directory\nstderr: ${result.stderr}`);
    }
    if (options.scratchFile) {
      const recorded = fs.readFileSync(options.scratchFile, 'utf8');
      assertDeepEqual(`${label} scratch file`, recorded, `/stub-home/${scratchDir}\n`);
    }
    const stubHead = ['exec', ...forwarded, '--rsh', 'placeholder', 'rsync', '--server'];
    assertDeepEqual(`${label} stub prefix`, stubArgv.slice(0, stubHead.length), stubHead);
    if (stubArgv.includes('--')) {
      fail(`${label} stub argv inserted -- before the remote command: ${JSON.stringify(stubArgv)}`);
    }
    if (stubArgv[stubArgv.length - 1] !== remoteDir) {
      fail(`${label} rsync server path is not ${remoteDir}: ${JSON.stringify(stubArgv)}`);
    }
  }

  function expectFail(label, yarnArgs, options = {}) {
    clearLog(stubLog);
    clearLog(rsyncLog);
    const result = runYarn('tests:mellifera:remote-sync', yarnArgs, options.env || env);
    if (result.status === 0) {
      fail(`${label} exited 0\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
    }
    if (options.status !== undefined && result.status !== options.status) {
      fail(`${label} exited ${result.status}, expected ${options.status}`);
    }
    if (!`${result.stderr}`.includes('mellifera-remote-sync:')) {
      fail(
        `${label} did not fail in remote-sync (exit ${result.status})\nstderr: ${result.stderr}`,
      );
    }
    if (options.stderr && !`${result.stderr}`.includes(options.stderr)) {
      fail(`${label} stderr lacks ${JSON.stringify(options.stderr)}\nstderr: ${result.stderr}`);
    }
    if (result.stdout.trim() !== '') {
      fail(`${label} printed to stdout: ${result.stdout}`);
    }
    if (transferCalls(rsyncLog).length !== 0) {
      fail(`${label} spawned rsync`);
    }
    const execCalls = readJsonLines(stubLog).filter(call => call[0] === 'exec');
    if (execCalls.length !== (options.execCalls || 0)) {
      fail(`${label} exec calls: ${JSON.stringify(execCalls)}`);
    }
  }

  check('default filter', [], DEFAULT_FILTER, [], 'mellifera-work/s-pointer', {
    env: pointerEnv,
    sessionShow: true,
  });
  const custom = path.join(path.dirname(rsyncLog), 'caller.rsync-filter');
  fs.writeFileSync(
    custom,
    '# caller filter\n- *.tmp\n+ packages/\n+ packages/app/\n+ packages/app/package.json\n- *\n',
  );
  check('caller filter', ['--filter', custom], custom, [], 'mellifera-work/s-pointer', {
    env: pointerEnv,
    sessionShow: true,
  });
  const session = 'sess-wrap';
  const url = 'http://127.0.0.1:9';
  const federation = 'fed-wrap';
  const forwarded = ['--url', url, '--federation', federation, '--session', session];
  check(
    'caller session url federation',
    ['--url', url, '--filter', custom, '--federation', federation, '--session', session],
    custom,
    forwarded,
    `mellifera-work/${session}`,
  );
  const equalsForwarded = [`--session=${session}`, `--url=${url}`, `--federation=${federation}`];
  check(
    'equals session url federation',
    ['--filter', custom, ...equalsForwarded],
    custom,
    equalsForwarded,
    `mellifera-work/${session}`,
  );
  check(
    'caller dest',
    ['--dest', 'rnfb/run-1', '--session', session],
    DEFAULT_FILTER,
    ['--session', session],
    'mellifera-work/rnfb/run-1',
  );
  check('caller dest equals', ['--dest=run-2/'], DEFAULT_FILTER, [], 'mellifera-work/run-2', {
    env: pointerEnv,
  });
  const scratchFile = path.join(path.dirname(rsyncLog), 'run.scratch');
  check(
    'scratch file',
    ['--scratch-file', scratchFile, '--session', session],
    DEFAULT_FILTER,
    ['--session', session],
    `mellifera-work/${session}`,
    { scratchFile },
  );
  fs.rmSync(scratchFile, { force: true });
  check(
    'scratch file equals',
    [`--scratch-file=${scratchFile}`, '--dest', 'rnfb/run-3'],
    DEFAULT_FILTER,
    [],
    'mellifera-work/rnfb/run-3',
    { scratchFile },
  );
  expectFail('unknown arg', ['--kinds', 'slot']);
  expectFail('session missing', ['--session']);
  expectFail('url missing', ['--url']);
  expectFail('federation missing', ['--federation']);
  expectFail('session empty equals', ['--session=']);
  expectFail('url empty equals', ['--url=']);
  expectFail('federation empty equals', ['--federation=']);
  expectFail('dest missing', ['--dest']);
  expectFail('dest empty equals', ['--dest=']);
  expectFail('dest twice', ['--dest', 'a', '--dest', 'b']);
  expectFail('dest absolute', ['--dest', '/tmp/rnfb']);
  expectFail('dest home', ['--dest', '~/rnfb']);
  expectFail('dest parent', ['--dest', '../rnfb']);
  expectFail('dest escaping', ['--dest', 'a/../../rnfb']);
  expectFail('dest trailing parent', ['--dest=a/..']);
  expectFail('dest start directory', ['--dest', '.']);
  expectFail('dest unsafe characters', ['--dest', 'a b']);
  expectFail('session unsafe name', ['--session', 'a/b']);
  expectFail('session show without id', [], { env: { ...env, STUB_SESSION_ID: '' } });
  check('live session record', [], DEFAULT_FILTER, [], 'mellifera-work/s-pointer', {
    env: { ...pointerEnv, STUB_SESSION_STATUS: 'live' },
    sessionShow: true,
  });
  expectFail('expired session record', [], {
    env: { ...pointerEnv, STUB_SESSION_STATUS: 'expired' },
    status: 1,
    stderr: 'session s-pointer is expired; reserve again',
  });
  expectFail('remote rsync missing', ['--session', session], {
    env: { ...env, STUB_RSYNC_MISSING: '1' },
    status: 1,
    execCalls: 1,
    stderr:
      'the remote grant has no rsync on PATH; the guest image for this kind must provide rsync',
  });
  expectFail('remote rsync missing links the guest requirements', ['--session', session], {
    env: { ...env, STUB_RSYNC_MISSING: '1' },
    execCalls: 1,
    stderr: 'running-e2e-distributed.md#guest-requirements',
  });
  expectFail('remote rsync check fails', ['--session', session], {
    env: { ...env, STUB_RSYNC_PROBE_EXIT: '255' },
    status: 255,
    execCalls: 1,
    stderr: 'remote rsync check exited 255',
  });
  expectFail('remote mkdir fails', ['--session', session], {
    env: { ...env, STUB_MKDIR_EXIT: '7' },
    status: 7,
    execCalls: 2,
  });
  expectFail('scratch file missing', ['--scratch-file']);
  expectFail('scratch file empty equals', ['--scratch-file=']);
  expectFail('scratch file twice', ['--scratch-file', 'a', '--scratch-file', 'b']);
  expectFail(
    'scratch file directory missing',
    ['--session', session, '--scratch-file', path.join(path.dirname(rsyncLog), 'no-dir', 'f')],
    { status: 1, stderr: '--scratch-file directory does not exist' },
  );
  const readOnly = path.join(path.dirname(rsyncLog), 'read-only.scratch');
  fs.writeFileSync(readOnly, '');
  fs.chmodSync(readOnly, 0o444);
  expectFail('scratch file not writable', ['--session', session, '--scratch-file', readOnly], {
    status: 1,
    execCalls: 3,
    stderr: `cannot write --scratch-file ${readOnly}`,
  });
  fs.chmodSync(readOnly, 0o644);
  expectFail('remote scratch path fails', ['--session', session], {
    env: { ...env, STUB_PWD_EXIT: '5' },
    status: 5,
    execCalls: 3,
  });
  expectFail('remote scratch path relative', ['--session', session], {
    env: { ...env, STUB_PWD_OUT: `mellifera-work/${session}.scratch` },
    status: 1,
    execCalls: 3,
    stderr: 'remote scratch path is not one absolute path',
  });
  expectFail('remote scratch path wrong leaf', ['--session', session], {
    env: { ...env, STUB_PWD_OUT: '/stub-home' },
    status: 1,
    execCalls: 3,
  });
  expectFail('remote scratch path extra lines', ['--session', session], {
    env: { ...env, STUB_PWD_OUT: `motd\n/stub-home/mellifera-work/${session}.scratch` },
    status: 1,
    execCalls: 3,
  });
}

function assertRemoteSyncSmoke(env, stubLog, home) {
  const remote = fs.mkdtempSync(path.join(home, 'remote-start-'));
  fs.mkdirSync(path.join(remote, 'packages'));
  const donorFile = path.join(remote, 'packages', 'unrelated.txt');
  fs.writeFileSync(donorFile, 'unrelated remote file\n');
  const filter = path.join(home, 'smoke.rsync-filter');
  fs.writeFileSync(filter, '+ packages/\n+ packages/app/\n+ packages/app/package.json\n- *\n');
  const smokeEnv = { ...env, FAKE_REMOTE_ROOT: remote };
  const session = 'sess-smoke';
  const remoteDir = `mellifera-work/${session}`;
  const localPackage = fs.readFileSync(path.join(REPO_ROOT, 'packages/app/package.json'), 'utf8');

  const scratchFile = path.join(home, 'smoke.scratch');
  const noRsync = runYarn(
    'tests:mellifera:remote-sync',
    ['--session', session, '--filter', filter, '--scratch-file', scratchFile],
    { ...smokeEnv, STUB_REMOTE_PATH: path.join(home, 'no-such-bin') },
  );
  if (noRsync.status !== 1 || !noRsync.stderr.includes('the remote grant has no rsync on PATH')) {
    fail(`smoke without remote rsync (exit ${noRsync.status})\nstderr: ${noRsync.stderr}`);
  }
  if (noRsync.stdout !== '' || fs.existsSync(path.join(remote, 'mellifera-work'))) {
    fail('smoke without remote rsync printed a directory or created the remote work parent');
  }
  if (fs.existsSync(scratchFile)) {
    fail('smoke without remote rsync wrote the scratch file');
  }
  const scratchAbs = path.join(fs.realpathSync(remote), `${remoteDir}.scratch`);
  for (const pass of ['first', 'repeat']) {
    clearLog(stubLog);
    const sync = runYarn(
      'tests:mellifera:remote-sync',
      ['--session', session, '--filter', filter, '--scratch-file', scratchFile],
      smokeEnv,
    );
    if (sync.status !== 0) {
      fail(`smoke ${pass} sync exited ${sync.status}\nstderr: ${sync.stderr}`);
    }
    assertDeepEqual(`smoke ${pass} stdout`, sync.stdout.split('\n'), [remoteDir, '']);
    assertDeepEqual(
      `smoke ${pass} scratch file`,
      fs.readFileSync(scratchFile, 'utf8'),
      `${scratchAbs}\n`,
    );
    if (pass === 'first') {
      fs.writeFileSync(path.join(scratchAbs, 'rnfb-metro-8081.log'), 'run log\n');
    }
  }
  assertDeepEqual('smoke remote start entries', fs.readdirSync(remote).sort(), [
    'mellifera-work',
    'packages',
  ]);
  assertDeepEqual(
    'smoke work parent entries',
    fs.readdirSync(path.join(remote, 'mellifera-work')).sort(),
    [session, `${session}.scratch`],
  );
  if (!fs.existsSync(path.join(scratchAbs, 'rnfb-metro-8081.log'))) {
    fail('smoke repeat sync removed a file from the scratch directory');
  }
  if (fs.existsSync(path.join(remote, remoteDir, `${session}.scratch`))) {
    fail('smoke scratch directory is inside the synced tree');
  }
  const unrelated = fs.readdirSync(path.join(remote, 'packages'));
  assertDeepEqual('smoke unrelated packages entries', unrelated, ['unrelated.txt']);
  if (fs.readFileSync(donorFile, 'utf8') !== 'unrelated remote file\n') {
    fail('smoke sync changed an unrelated file in the remote start directory');
  }
  const synced = path.join(remote, remoteDir, 'packages/app/package.json');
  if (!fs.existsSync(synced) || fs.readFileSync(synced, 'utf8') !== localPackage) {
    fail(`smoke sync did not place packages/app/package.json under ${remoteDir}`);
  }

  clearLog(stubLog);
  const execArgs = ['--session', session, '-w', remoteDir, '--', 'cat'];
  execArgs.push('packages/app/package.json');
  const exec = runYarn('tests:mellifera:exec', execArgs, smokeEnv);
  if (exec.status !== 0 || exec.stdout !== localPackage) {
    fail(`smoke exec -w did not run in ${remoteDir} (exit ${exec.status})\n${exec.stderr}`);
  }
  assertDeepEqual('smoke exec argv', readJsonLines(stubLog), [['exec', ...execArgs]]);
}

/**
 * A token-shaped file that a caller filter would send stops the sync before any
 * remote exec, and the message names the file but never its contents.
 */
function assertSessionTokenGuard(env, stubLog, rsyncLog, home) {
  const tmpRoot = path.join(REPO_ROOT, '.tmp');
  const createdTmp = !fs.existsSync(tmpRoot);
  const rel = `.tmp/rnfb-sync-guard-${process.pid}`;
  const dir = path.join(REPO_ROOT, rel);
  const filter = path.join(home, 'guard.rsync-filter');
  fs.writeFileSync(filter, `+ .tmp/\n+ ${rel}/\n+ ${rel}/**\n- *\n`);
  const benign = {
    'redacted.reserve.json': JSON.stringify({ sessionId: 's-1', token: '<redacted>' }),
    'notes.md': 'The reducer passes MELLIFERA_SESSION_TOKEN in the child env.\n',
    'ports.json': JSON.stringify({ placement: 'slot', slot: 1, token: FIXTURE_TOKEN }),
    'bearer-docs.md':
      'Authorization: Bearer owner\nAuthorization: Bearer ya29.ElqKBGN2Ri_Uz...HnS_uNreA\n' +
      'curl -H "Authorization: Bearer $(gcloud auth print-access-token)"\n',
    'service-ref.sh': 'MELLIFERA_TOKEN="$SERVICE_KEY"\nMELLIFERA_SESSION_TOKEN = <token>\n',
  };
  const held = {
    'run/android.reserve.json': JSON.stringify(
      { sessionId: 's-2', token: FIXTURE_TOKEN, placement: 'pool' },
      null,
      2,
    ),
    'session.env': `MELLIFERA_SESSION_ID=s-3\nMELLIFERA_SESSION_TOKEN=${FIXTURE_TOKEN}\n`,
    'export.sh': `export MELLIFERA_SESSION_TOKEN='${FIXTURE_TOKEN}'\n`,
    'nested.json': JSON.stringify({ grants: [{ grant: { sessionToken: FIXTURE_TOKEN } }] }),
    'reserve.out': `wait 1\n{"sessionId":"s-4","token":"${FIXTURE_TOKEN}"}\n`,
    'bom.reserve.json': `\uFEFF${JSON.stringify({ sessionId: 's-5', token: FIXTURE_TOKEN })}`,
    'bom-line.out': `\uFEFF{"sessionId":"s-6","token":"${FIXTURE_TOKEN}"}\nwait 1\n`,
    'spaced.env': `MELLIFERA_SESSION_TOKEN = ${FIXTURE_TOKEN}\n`,
    'bearer.sh': `curl -H "Authorization: Bearer ${FIXTURE_TOKEN}"\n`,
    'service.env': `MELLIFERA_TOKEN=${FIXTURE_TOKEN}\n`,
    'service.json': JSON.stringify({ MELLIFERA_TOKEN: FIXTURE_TOKEN }),
  };
  const write = files => {
    for (const [name, body] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
      fs.writeFileSync(path.join(dir, name), body);
    }
  };
  const run = () => {
    clearLog(stubLog);
    clearLog(rsyncLog);
    return runYarn(
      'tests:mellifera:remote-sync',
      ['--session', 'sess-guard', '--filter', filter],
      env,
    );
  };
  try {
    write(benign);
    for (const [name, body] of Object.entries(held)) {
      write({ [name]: body });
      const refused = run();
      const text = `${refused.stdout}${refused.stderr}`;
      if (refused.status !== 1 || !refused.stderr.includes('refusing to sync')) {
        fail(`guard did not refuse ${name} (exit ${refused.status})\nstderr: ${refused.stderr}`);
      }
      if (!refused.stderr.includes(`${rel}/${name}`) || text.includes(FIXTURE_TOKEN)) {
        fail(`guard for ${name} must name the file and never print the token\n${text}`);
      }
      for (const benignName of Object.keys(benign)) {
        if (refused.stderr.includes(`${rel}/${benignName}`)) {
          fail(`guard flagged benign ${benignName}\nstderr: ${refused.stderr}`);
        }
      }
      if (readJsonLines(stubLog).length !== 0 || transferCalls(rsyncLog).length !== 0) {
        fail(`guard for ${name} ran a remote exec or a transfer`);
      }
      fs.rmSync(path.join(dir, name));
    }
    const allowed = run();
    if (allowed.stderr.includes('refusing to sync') || transferCalls(rsyncLog).length !== 1) {
      fail(`guard refused benign files (exit ${allowed.status})\nstderr: ${allowed.stderr}`);
    }
  } finally {
    fs.rmSync(createdTmp ? tmpRoot : dir, { recursive: true, force: true });
  }
}

/**
 * A caller filter that names every Mellifera state path still sends none of
 * them: the sync excludes win over the caller filter, so the token-shaped
 * fixtures neither trip the guard nor reach the remote tree.
 */
function assertStateNeverSynced(env, home) {
  const remote = fs.mkdtempSync(path.join(home, 'remote-state-'));
  const runRel = `tests/mellifera-distributed/assert-sync-${process.pid}`;
  const runDir = path.join(REPO_ROOT, runRel);
  const sessionEnv = path.join(REPO_ROOT, 'tests', '.mellifera-session.env');
  const ports = path.join(REPO_ROOT, 'tests', 'mellifera.env.json');
  const platformEnv = path.join(REPO_ROOT, 'tests', 'mellifera-platform', 'android.env');
  const saved = [sessionEnv, ports, platformEnv].map(file => [file, snapshotFile(file)]);
  const filter = path.join(home, 'state.rsync-filter');
  fs.writeFileSync(
    filter,
    [
      '+ tests/',
      '+ tests/package.json',
      '+ tests/mellifera-distributed/',
      '+ tests/mellifera-distributed/**',
      '+ tests/mellifera-platform/',
      '+ tests/mellifera-platform/**',
      '+ tests/mellifera.env.json',
      '+ tests/.mellifera-session.env',
      '- *',
      '',
    ].join('\n'),
  );
  try {
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'slot.reserve.json'),
      JSON.stringify({ sessionId: 's-state', token: FIXTURE_TOKEN, placement: 'pool' }),
    );
    fs.writeFileSync(sessionEnv, `MELLIFERA_SESSION_TOKEN=${FIXTURE_TOKEN}\n`);
    fs.writeFileSync(ports, JSON.stringify({ sessionId: 's-state', token: FIXTURE_TOKEN }));
    fs.mkdirSync(path.dirname(platformEnv), { recursive: true });
    fs.writeFileSync(platformEnv, `MELLIFERA_SESSION_TOKEN=${FIXTURE_TOKEN}\n`);
    const sync = runYarn(
      'tests:mellifera:remote-sync',
      ['--session', 'sess-state', '--filter', filter],
      { ...env, FAKE_REMOTE_ROOT: remote },
    );
    if (sync.status !== 0) {
      fail(`state sync exited ${sync.status}\nstderr: ${sync.stderr}`);
    }
    const tree = path.join(remote, 'mellifera-work', 'sess-state', 'tests');
    assertDeepEqual('state sync remote tests entries', fs.readdirSync(tree).sort(), [
      'package.json',
    ]);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
    for (const [file, previous] of saved) {
      restoreFile(file, previous);
    }
  }
}

/**
 * Nothing can undo the state excludes. A caller filter with a clear (`!` or
 * `clear`), merge or dir-merge rule is refused before session show, any rsync
 * listing or any exec. rsync options as remote-sync arguments are refused the
 * same way. `.rsync-filter` files in the tree are never read. A listing that
 * still names a state path, in any case, stops the sync before any exec. The
 * state files hold no token, so only these checks keep them off the remote.
 */
function assertUnsafeFilterRefused(env, stubLog, rsyncLog, home) {
  const remote = fs.mkdtempSync(path.join(home, 'remote-unsafe-'));
  const runRel = `tests/mellifera-distributed/assert-unsafe-${process.pid}`;
  const runDir = path.join(REPO_ROOT, runRel);
  const sessionEnv = path.join(REPO_ROOT, 'tests', '.mellifera-session.env');
  const ports = path.join(REPO_ROOT, 'tests', 'mellifera.env.json');
  const platformEnv = path.join(REPO_ROOT, 'tests', 'mellifera-platform', 'android.env');
  const treeFilters = [
    path.join(REPO_ROOT, '.rsync-filter'),
    path.join(REPO_ROOT, 'tests', '.rsync-filter'),
  ];
  const saved = [sessionEnv, ports, platformEnv, ...treeFilters].map(file => [
    file,
    snapshotFile(file),
  ]);
  const unsafeEnv = { ...env, FAKE_REMOTE_ROOT: remote };
  const nested = path.join(home, 'nested.rsync-filter');
  fs.writeFileSync(nested, '!\n+ tests/***\n');
  const reinclude = [
    '+ tests/',
    '+ tests/mellifera-distributed/***',
    '+ tests/mellifera-platform/***',
    '+ tests/mellifera.env.json',
    '+ tests/.mellifera-session.env',
    '- *',
  ];
  const unsafe = [
    ['clear short', ['!', ...reinclude], 'line 1 (clear)'],
    ['clear long', ['clear', ...reinclude], 'line 1 (clear)'],
    ['clear after rules', ['# keep', '- *.tmp', '  !  ', ...reinclude], 'line 3 (clear)'],
    ['merge long', [`merge ${nested}`, ...reinclude], 'line 1 (merge)'],
    ['merge short', [`. ${nested}`, ...reinclude], 'line 1 (merge)'],
    ['merge modifiers', [`merge,+ ${nested}`, ...reinclude], 'line 1 (merge)'],
    ['dir-merge long', ['dir-merge .rsync-filter', ...reinclude], 'line 1 (dir-merge)'],
    ['dir-merge short', [': .rsync-filter', ...reinclude], 'line 1 (dir-merge)'],
    ['dir-merge modifiers', [':n- .rsync-filter', ...reinclude], 'line 1 (dir-merge)'],
  ];
  const run = (args, extraEnv = {}) => {
    clearLog(stubLog);
    clearLog(rsyncLog);
    return runYarn('tests:mellifera:remote-sync', args, { ...unsafeEnv, ...extraEnv });
  };
  const noRemoteWork = (label, result) => {
    if (result.status !== 1 || result.stdout !== '') {
      fail(`${label}: exit ${result.status}, stdout ${JSON.stringify(result.stdout)}`);
    }
    if (readJsonLines(stubLog).some(call => call[0] === 'exec')) {
      fail(`${label} ran a remote exec: ${JSON.stringify(readJsonLines(stubLog))}`);
    }
    if (transferCalls(rsyncLog).length !== 0) {
      fail(`${label} ran an rsync transfer`);
    }
  };
  try {
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(path.join(runDir, 'notes.txt'), 'run dir, no token\n');
    fs.writeFileSync(sessionEnv, 'MELLIFERA_SESSION_ID=s-unsafe\n');
    fs.writeFileSync(ports, JSON.stringify({ placement: 'slot', slot: 1 }));
    fs.mkdirSync(path.dirname(platformEnv), { recursive: true });
    fs.writeFileSync(platformEnv, 'RNFB_E2E_SLOT=1\n');

    for (const [label, lines, where] of unsafe) {
      const filter = path.join(home, `unsafe-${label.replace(/\W+/g, '-')}.rsync-filter`);
      fs.writeFileSync(filter, `${lines.join('\n')}\n`);
      const refused = run(['--session', 'sess-unsafe', '--filter', filter]);
      noRemoteWork(label, refused);
      if (!refused.stderr.includes(`refusing filter ${filter}: ${where}`)) {
        fail(`${label} must name the rule and line\nstderr: ${refused.stderr}`);
      }
      if (readJsonLines(stubLog).length !== 0 || readJsonLines(rsyncLog).length !== 0) {
        fail(`${label} ran the CLI or an rsync listing before refusing the filter`);
      }
    }

    for (const args of [
      ['--include=tests/mellifera.env.json'],
      ['--include', 'tests/mellifera.env.json'],
      ['--exclude-from', nested],
      ['--include-from', nested],
      ['--filter=+ tests/***'],
      ['-F'],
      ['--filter', DEFAULT_FILTER, '--filter', nested],
    ]) {
      const refused = run(['--session', 'sess-unsafe', ...args]);
      noRemoteWork(`argument ${args.join(' ')}`, refused);
      if (readJsonLines(stubLog).length !== 0 || readJsonLines(rsyncLog).length !== 0) {
        fail(`argument ${args.join(' ')} ran the CLI or rsync`);
      }
    }

    const safe = path.join(home, 'safe-unsafe.rsync-filter');
    fs.writeFileSync(
      safe,
      ['+ tests/', '+ tests/package.json', '+ tests/.rsync-filter', ...reinclude.slice(1)].join(
        '\n',
      ) + '\n',
    );
    for (const file of treeFilters) {
      fs.writeFileSync(file, `!\n${reinclude.join('\n')}\n`);
    }
    const inert = run(['--session', 'sess-unsafe', '--filter', safe]);
    if (inert.status !== 0) {
      fail(`sync with .rsync-filter files in the tree exited ${inert.status}\n${inert.stderr}`);
    }
    const tree = path.join(remote, 'mellifera-work', 'sess-unsafe', 'tests');
    assertDeepEqual('tree .rsync-filter remote tests entries', fs.readdirSync(tree).sort(), [
      '.rsync-filter',
      'package.json',
    ]);
    fs.rmSync(path.join(remote, 'mellifera-work'), { recursive: true, force: true });

    for (const listed of [
      `${runRel}/notes.txt`,
      'tests/mellifera-platform/',
      'tests/mellifera.env.json',
      'tests/.mellifera-session.env',
      'Tests/Mellifera-Platform/android.env',
      'tests/mellifera-distributed',
    ]) {
      const refused = run(['--session', 'sess-unsafe', '--filter', safe], {
        FAKE_RSYNC_LIST_EXTRA: listed,
      });
      noRemoteWork(`listed ${listed}`, refused);
      if (!refused.stderr.includes(`refusing to sync: ${listed} is Mellifera session state`)) {
        fail(`listed ${listed} must be refused as state\nstderr: ${refused.stderr}`);
      }
    }
    if (fs.existsSync(path.join(remote, 'mellifera-work'))) {
      fail('a refused sync created the remote work parent');
    }
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
    for (const [file, previous] of saved) {
      restoreFile(file, previous);
    }
  }
}

function assertDefaultFilterSkipsGit(realRsync, home) {
  const src = fs.mkdtempSync(path.join(home, 'filter-src-'));
  const dst = fs.mkdtempSync(path.join(home, 'filter-dst-'));
  fs.writeFileSync(path.join(src, '.git'), 'gitdir: /local/only/.git/worktrees/x\n');
  fs.writeFileSync(path.join(src, 'keep.txt'), 'kept\n');
  fs.mkdirSync(path.join(src, 'nested', '.git'), { recursive: true });
  fs.writeFileSync(path.join(src, 'nested', '.git', 'HEAD'), 'ref: refs/heads/main\n');
  fs.mkdirSync(path.join(src, 'vendor', 'bundle', 'ruby'), { recursive: true });
  fs.writeFileSync(path.join(src, 'vendor', 'bundle', 'ruby', 'parser.bundle'), 'local build\n');
  fs.writeFileSync(path.join(src, 'vendor', 'keep.rb'), 'kept\n');
  fs.mkdirSync(path.join(src, 'nested', 'vendor', 'bundle'), { recursive: true });
  fs.writeFileSync(path.join(src, 'nested', 'vendor', 'bundle', 'gem.rb'), 'local build\n');
  const ran = spawnSync(
    realRsync,
    ['-a', '--filter', `merge ${DEFAULT_FILTER}`, `${src}/`, `${dst}/`],
    { encoding: 'utf8' },
  );
  if (ran.status !== 0) {
    fail(`default filter rsync exited ${ran.status}\n${ran.stderr}`);
  }
  assertDeepEqual('default filter top entries', fs.readdirSync(dst).sort(), [
    'keep.txt',
    'nested',
    'vendor',
  ]);
  assertDeepEqual('default filter nested entries', fs.readdirSync(path.join(dst, 'nested')), [
    'vendor',
  ]);
  assertDeepEqual(
    'default filter nested vendor entries',
    fs.readdirSync(path.join(dst, 'nested', 'vendor')),
    [],
  );
  assertDeepEqual('default filter vendor entries', fs.readdirSync(path.join(dst, 'vendor')), [
    'keep.rb',
  ]);
}

async function assertClosedPort(baseEnv, builtCli) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-mlf-closed-'));
  const port = await listenClosedPort();
  const env = childEnv(baseEnv, {
    HOME: home,
    MELLIFERA_CLI: builtCli,
    PATH: baseEnv.PATH,
  });
  const reserve = runYarn(
    'tests:mellifera:reserve',
    ['--no-config', '--url', `http://127.0.0.1:${port}`, '--kinds', 'slot', '--no-state'],
    env,
  );
  const reserveText = `${reserve.stdout}\n${reserve.stderr}`;
  if (!reserveText.includes('local-core-unreachable')) {
    fail(
      `reserve on a closed port did not report local-core-unreachable (exit ${reserve.status})\n${reserveText}`,
    );
  }
  const apply = runYarn(
    'tests:mellifera:apply',
    ['--no-config', '--url', `http://127.0.0.1:${port}`],
    env,
  );
  const applyText = `${apply.stdout}\n${apply.stderr}`;
  if (applyText.includes('local-core-unreachable')) {
    fail(`apply reported local-core-unreachable:\n${applyText}`);
  }
  if (apply.status === 0) {
    fail('apply accepted closed-port CLI flags as a grant');
  }
}

function writeStub(dir) {
  const stub = path.join(dir, 'mellifera-cli-stub.js');
  fs.writeFileSync(
    stub,
    `#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const argv = process.argv.slice(2);
fs.appendFileSync(process.env.STUB_LOG, JSON.stringify(argv) + '\\n');
if (argv[0] === 'reserve') {
  process.stdout.write('{"placement":"slot","slot":1,"sessionId":"s-wrap","token":"t-wrap","env":{}}\\n');
}
if (argv[0] === 'session' && argv[1] === 'show' && process.env.STUB_SESSION_ID !== undefined) {
  const id = process.env.STUB_SESSION_ID;
  const status = id ? process.env.STUB_SESSION_STATUS || 'live' : 'missing';
  process.stdout.write(JSON.stringify(id ? { status, sessionId: id } : { status }) + '\\n');
  process.exit(status === 'live' ? 0 : 1);
}
const rsyncProbe = argv[0] === 'exec' && argv.includes('sh') && /command -v rsync/.test(argv[argv.length - 1]);
if (rsyncProbe && process.env.STUB_RSYNC_PROBE_EXIT) {
  process.exit(Number(process.env.STUB_RSYNC_PROBE_EXIT));
}
if (rsyncProbe && process.env.STUB_RSYNC_MISSING) {
  process.stdout.write('mellifera-remote-sync:rsync-missing\\n');
  process.exit(1);
}
if (argv[0] === 'exec' && argv.includes('mkdir') && process.env.STUB_MKDIR_EXIT) {
  process.exit(Number(process.env.STUB_MKDIR_EXIT));
}
const remote = process.env.FAKE_REMOTE_ROOT;
if (argv[0] === 'exec' && argv.includes('pwd') && !remote) {
  if (process.env.STUB_PWD_EXIT) process.exit(Number(process.env.STUB_PWD_EXIT));
  const w = argv.indexOf('-w');
  const out = process.env.STUB_PWD_OUT !== undefined ? process.env.STUB_PWD_OUT : '/stub-home/' + argv[w + 1];
  process.stdout.write(out + '\\n');
  process.exit(0);
}
if (argv[0] === 'exec' && remote) {
  // Fake remote: run the command with the fake start directory as cwd.
  const rshAt = argv.indexOf('--rsh');
  let cwd = remote;
  let command;
  if (rshAt >= 0) {
    command = argv.slice(rshAt + 2);
    if (command[0] === 'rsync') command[0] = process.env.REAL_RSYNC;
  } else {
    const sep = argv.indexOf('--');
    const flags = argv.slice(1, sep);
    const w = flags.indexOf('-w');
    if (w >= 0) cwd = path.resolve(remote, flags[w + 1]);
    command = argv.slice(sep + 1);
  }
  // STUB_REMOTE_PATH stands in for a guest whose PATH has no rsync.
  const remotePath = process.env.STUB_REMOTE_PATH;
  const env = remotePath ? { ...process.env, PATH: remotePath } : process.env;
  if (remotePath && command[0] === 'sh') command[0] = '/bin/sh';
  const ran = spawnSync(command[0], command.slice(1), { cwd, stdio: 'inherit', env });
  process.exit(ran.status == null ? 1 : ran.status);
}
process.exit(0);
`,
    { mode: 0o755 },
  );
  return stub;
}

function writeFakeRsync(dir, realRsync) {
  const fake = path.join(dir, 'rsync');
  fs.writeFileSync(
    fake,
    `#!/usr/bin/env node
'use strict';
const fs = require('fs');
const { spawn } = require('child_process');
const argv = process.argv.slice(2);
fs.appendFileSync(process.env.RSYNC_ARGV_LOG, JSON.stringify(argv) + '\\n');
const child = spawn(process.env.REAL_RSYNC, argv, { stdio: 'inherit' });
child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  // FAKE_RSYNC_LIST_EXTRA: extra names a dry-run listing reports, one per line.
  if (code === 0 && argv.includes('--dry-run') && process.env.FAKE_RSYNC_LIST_EXTRA) {
    process.stdout.write(process.env.FAKE_RSYNC_LIST_EXTRA + '\\n');
  }
  process.exit(code == null ? 1 : code);
});
`,
    { mode: 0o755 },
  );
  return { fake, realRsync };
}

async function main() {
  assertScriptSet();
  assertNodeOnlyWrappers();
  assertNoShimFile();
  assertDefaultFilterListsState();
  for (const rel of [
    'scripts/e2e/mellifera-cli-forward.js',
    'scripts/e2e/mellifera-reserve-apply.js',
    'scripts/e2e/mellifera-remote-sync.js',
    'scripts/e2e/mellifera-distributed-reduce.js',
    'scripts/e2e/mellifera-distributed-piece.sh',
  ]) {
    assertNoHttpOrConfig(rel);
  }

  const builtCli = resolveBuiltCli();
  assertCliVersion(builtCli);
  const realRsync = which('rsync');
  if (!realRsync) {
    fail('rsync is not on PATH');
  }

  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-mlf-wrap-'));
  assertNodeOnlyWrappersRefuse(home);
  fs.mkdirSync(path.join(home, '.mellifera'), { recursive: true });
  const canary = path.join(home, '.mellifera', 'config.jsonc');
  const canaryBody = 'CANARY-SECRET-DO-NOT-LEAK\n';
  fs.writeFileSync(canary, canaryBody, { mode: 0o600 });
  fs.mkdirSync(path.join(home, '.ssh'), { recursive: true });
  fs.writeFileSync(path.join(home, '.ssh', 'id_test'), 'not-a-key\n', { mode: 0o600 });

  const stub = writeStub(home);
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin);
  writeFakeRsync(bin, realRsync);
  const stubLog = path.join(home, 'stub.log');
  const rsyncLog = path.join(home, 'rsync.log');
  fs.writeFileSync(stubLog, '');
  fs.writeFileSync(rsyncLog, '');

  const env = childEnv(process.env, {
    HOME: home,
    MELLIFERA_CLI: stub,
    STUB_LOG: stubLog,
    RSYNC_ARGV_LOG: rsyncLog,
    REAL_RSYNC: realRsync,
    PATH: `${bin}${path.delimiter}${process.env.PATH || ''}`,
  });

  assertForwarding(env, stubLog);
  const pathBin = path.join(home, 'path-bin');
  fs.mkdirSync(pathBin);
  fs.symlinkSync(stub, path.join(pathBin, 'mellifera-cli'));
  const pathEnv = { ...env, PATH: `${pathBin}${path.delimiter}${env.PATH}` };
  delete pathEnv.MELLIFERA_CLI;
  assertForwarding(pathEnv, stubLog);
  assertApplyDoesNotCallCli(env, stubLog, home);
  assertReserveApply(env, stubLog);
  assertRemoteSync(env, stubLog, rsyncLog);
  assertRemoteSyncSmoke(env, stubLog, home);
  assertSessionTokenGuard(env, stubLog, rsyncLog, home);
  assertStateNeverSynced(env, home);
  assertUnsafeFilterRefused(env, stubLog, rsyncLog, home);
  assertStateSymlinksExcluded(env, stubLog, rsyncLog, realRsync, home);
  assertDefaultFilterSkipsGit(realRsync, home);
  await assertClosedPort(process.env, builtCli);

  if (fs.readFileSync(canary, 'utf8') !== canaryBody) {
    fail('wrapper run rewrote the private config canary');
  }
  const leaked = fs.readFileSync(stubLog, 'utf8').includes('CANARY-SECRET-DO-NOT-LEAK');
  if (leaked) {
    fail('CLI stub observed config canary material');
  }

  console.log(
    'OK mellifera CLI wrappers (MELLIFERA_CLI and PATH; bare node lines on Node built-ins only), reserve-apply, remote-sync, remote-sync smoke, remote-sync anchored state excludes (symlinks too), unsafe filter refusal and token guard, CLI version floor, and closed-port reserve',
  );
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
