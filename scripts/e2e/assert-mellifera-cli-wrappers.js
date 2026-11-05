#!/usr/bin/env node
/**
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
 * placeholder, created first by exec mkdir, never the remote start directory.
 * A smoke run syncs into a fake remote start directory that already holds
 * unrelated files, then runs exec -w on the printed directory.
 * Run: yarn tests:mellifera:assert-cli-wrappers
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_FILTER = path.join(SCRIPT_DIR, 'mellifera-remote-sync.rsync-filter');
const PKG = require(path.join(REPO_ROOT, 'package.json'));
const IN_REPO_CLI_DIR = path.join(REPO_ROOT, 'scripts', 'mellifera');
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

function assertRemoteSync(env, stubLog, rsyncLog) {
  const pointerEnv = { ...env, STUB_SESSION_ID: 's-pointer' };

  function check(label, yarnArgs, filterPath, forwarded, remoteDir, options = {}) {
    clearLog(stubLog);
    clearLog(rsyncLog);
    const result = runYarn('tests:mellifera:remote-sync', yarnArgs, options.env || env);
    const rsyncCalls = readJsonLines(rsyncLog);
    const stubCalls = readJsonLines(stubLog);
    if (rsyncCalls.length !== 1) {
      fail(
        `${label} rsync calls ${rsyncCalls.length} (exit ${result.status})\nstderr: ${result.stderr}`,
      );
    }
    if (result.status === 0 || result.stdout.trim() !== '') {
      fail(`${label} printed a directory without a completed sync: ${JSON.stringify(result)}`);
    }
    const argv = rsyncCalls[0];
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
    const expectedCalls = options.sessionShow ? 4 : 3;
    if (stubCalls.length !== expectedCalls) {
      fail(`${label} stub calls: ${JSON.stringify(stubCalls)}\nrsync stderr: ${result.stderr}`);
    }
    if (options.sessionShow) {
      assertDeepEqual(`${label} session show`, stubCalls[0], ['session', 'show']);
    }
    const scratchDir = `${remoteDir}.scratch`;
    const [mkdirArgv, pwdArgv, stubArgv] = stubCalls.slice(expectedCalls - 3);
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
    if (readJsonLines(rsyncLog).length !== 0) {
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
  fs.writeFileSync(custom, '# caller filter\n- *.tmp\n');
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
  expectFail('remote mkdir fails', ['--session', session], {
    env: { ...env, STUB_MKDIR_EXIT: '7' },
    status: 7,
    execCalls: 1,
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
    execCalls: 2,
    stderr: `cannot write --scratch-file ${readOnly}`,
  });
  fs.chmodSync(readOnly, 0o644);
  expectFail('remote scratch path fails', ['--session', session], {
    env: { ...env, STUB_PWD_EXIT: '5' },
    status: 5,
    execCalls: 2,
  });
  expectFail('remote scratch path relative', ['--session', session], {
    env: { ...env, STUB_PWD_OUT: `mellifera-work/${session}.scratch` },
    status: 1,
    execCalls: 2,
    stderr: 'remote scratch path is not one absolute path',
  });
  expectFail('remote scratch path wrong leaf', ['--session', session], {
    env: { ...env, STUB_PWD_OUT: '/stub-home' },
    status: 1,
    execCalls: 2,
  });
  expectFail('remote scratch path extra lines', ['--session', session], {
    env: { ...env, STUB_PWD_OUT: `motd\n/stub-home/mellifera-work/${session}.scratch` },
    status: 1,
    execCalls: 2,
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
  const ran = spawnSync(command[0], command.slice(1), { cwd, stdio: 'inherit' });
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
  process.exit(code == null ? 1 : code);
});
`,
    { mode: 0o755 },
  );
  return { fake, realRsync };
}

async function main() {
  assertScriptSet();
  assertNoShimFile();
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
    'OK mellifera CLI wrappers (MELLIFERA_CLI and PATH), reserve-apply, remote-sync, remote-sync smoke, CLI version floor, and closed-port reserve',
  );
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
