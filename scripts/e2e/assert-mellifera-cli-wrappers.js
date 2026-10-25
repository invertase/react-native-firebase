#!/usr/bin/env node
/**
 * CLI-word wrappers forward argv unchanged to MELLIFERA_CLI.
 * apply forwards to the reservation mapper and does not invoke the CLI.
 * reserve-apply runs reserve with argv unchanged, then passes the grant JSON
 * to the mapper.
 * remote-sync uses rsync --rsh "<cli> exec --rsh" and a remote placeholder
 * destination. Run: yarn tests:mellifera:assert-cli-wrappers
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

const CLI_WORDS = [
  ['tests:mellifera:status', ['status'], ['--json']],
  ['tests:mellifera:doctor', ['doctor'], ['--json']],
  ['tests:mellifera:register', ['register'], ['--slots', '1']],
  ['tests:mellifera:unregister', ['unregister'], ['--worker-id', 'desk-a']],
  ['tests:mellifera:donate', ['donate'], ['--retract', '--slots', '1']],
  [
    'tests:mellifera:reserve',
    ['reserve'],
    ['--kinds=desk-slot', '--no-state', '--local-wait-ms', '0'],
  ],
  ['tests:mellifera:session:show', ['session', 'show'], ['--session-id', 'abc']],
  ['tests:mellifera:session:clear', ['session', 'clear'], ['--release']],
  ['tests:mellifera:exec', ['exec'], ['--', 'echo', 'marker']],
  ['tests:mellifera:release', ['release'], ['--session-id', 'abc', '--token', 'secret']],
];

const ALLOWED = new Set([
  ...CLI_WORDS.map(row => row[0]),
  'tests:mellifera:apply',
  'tests:mellifera:reserve-apply',
  'tests:mellifera:remote-sync',
  'tests:mellifera:assert-cli-wrappers',
  'tests:mellifera:assert-apply-reservation',
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
  if (!found) {
    fail('built mellifera-cli is not on PATH; set PATH or MELLIFERA_BUILT_CLI');
  }
  return found;
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
  const user = ['--kinds=desk-slot', '--no-state', '--local-wait-ms', '0'];
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
  function check(label, yarnArgs, filterPath) {
    clearLog(stubLog);
    clearLog(rsyncLog);
    const result = runYarn('tests:mellifera:remote-sync', yarnArgs, env);
    const rsyncCalls = readJsonLines(rsyncLog);
    const stubCalls = readJsonLines(stubLog);
    if (rsyncCalls.length !== 1) {
      fail(
        `${label} rsync calls ${rsyncCalls.length} (exit ${result.status})\nstderr: ${result.stderr}`,
      );
    }
    const argv = rsyncCalls[0];
    const destination = argv[argv.length - 1];
    if (destination !== 'placeholder:.') {
      fail(`${label} destination is not the remote placeholder: ${destination}`);
    }
    if (!destination.includes(':') || destination.includes('@')) {
      fail(`${label} destination is local or has a user: ${destination}`);
    }
    const rsh = rsyncArgValue(argv, '--rsh');
    if (rsh !== `${env.MELLIFERA_CLI} exec --rsh`) {
      fail(`${label} --rsh is ${JSON.stringify(rsh)}`);
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
    if (stubCalls.length !== 1) {
      fail(`${label} stub calls: ${JSON.stringify(stubCalls)}\nrsync stderr: ${result.stderr}`);
    }
    const stubArgv = stubCalls[0];
    const prefix = stubArgv.slice(0, 5);
    assertDeepEqual(`${label} stub prefix`, prefix, [
      'exec',
      '--rsh',
      'placeholder',
      'rsync',
      '--server',
    ]);
    if (stubArgv.includes('--')) {
      fail(`${label} stub argv inserted -- before the remote command: ${JSON.stringify(stubArgv)}`);
    }
  }

  check('default filter', [], DEFAULT_FILTER);
  const custom = path.join(path.dirname(rsyncLog), 'caller.rsync-filter');
  fs.writeFileSync(custom, '# caller filter\n- *.tmp\n');
  check('caller filter', ['--filter', custom], custom);
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
    ['--no-config', '--url', `http://127.0.0.1:${port}`, '--kinds', 'desk-slot', '--no-state'],
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
const argv = process.argv.slice(2);
fs.appendFileSync(process.env.STUB_LOG, JSON.stringify(argv) + '\\n');
if (argv[0] === 'reserve') {
  process.stdout.write('{"placement":"slot","slot":1,"sessionId":"s-wrap","token":"t-wrap","env":{}}\\n');
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
  ]) {
    assertNoHttpOrConfig(rel);
  }

  const builtCli = resolveBuiltCli();
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
  assertApplyDoesNotCallCli(env, stubLog, home);
  assertReserveApply(env, stubLog);
  assertRemoteSync(env, stubLog, rsyncLog);
  await assertClosedPort(process.env, builtCli);

  if (fs.readFileSync(canary, 'utf8') !== canaryBody) {
    fail('wrapper run rewrote the private config canary');
  }
  const leaked = fs.readFileSync(stubLog, 'utf8').includes('CANARY-SECRET-DO-NOT-LEAK');
  if (leaked) {
    fail('CLI stub observed config canary material');
  }

  console.log('OK mellifera CLI wrappers, reserve-apply, remote-sync, and closed-port reserve');
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
