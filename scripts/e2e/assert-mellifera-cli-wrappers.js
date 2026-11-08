#!/usr/bin/env node
/**
 * Every tests:mellifera:* script is a bare `node ./scripts/e2e/<file>.js` line
 * that loads only Node built-ins, so it runs in a checkout with no install.
 * CLI-word wrappers forward argv unchanged to MELLIFERA_CLI, or to
 * mellifera-cli on PATH when MELLIFERA_CLI is unset. No wrapper defaults to a
 * CLI copy inside this repo.
 * The closed-port check runs a real CLI (MELLIFERA_BUILT_CLI, else PATH) that
 * must report version 0.3.0 or later.
 * apply forwards to the reservation mapper and does not invoke the CLI.
 * reserve-apply runs reserve with argv unchanged, then passes the grant JSON
 * to the mapper.
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
const PKG = require(path.join(REPO_ROOT, 'package.json'));
const IN_REPO_CLI_DIR = path.join(REPO_ROOT, 'scripts', 'mellifera');
// 0.3.0 is the first CLI that stores every global grant by id, so `exec --session ID`
// reaches a global grant after a later reserve moved the worktree pointer.
const MIN_CLI_VERSION = [0, 3, 0];
const INSTALL_HINT =
  'install mellifera-cli 0.3.0 or later (Mellifera CLI README § Bootstrap from your global core, ' +
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
    if (/shim|rsh/i.test(name)) {
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

async function main() {
  assertScriptSet();
  assertNodeOnlyWrappers();
  assertNoShimFile();
  for (const rel of [
    'scripts/e2e/mellifera-cli-forward.js',
    'scripts/e2e/mellifera-reserve-apply.js',
  ]) {
    assertNoHttpOrConfig(rel);
  }

  const builtCli = resolveBuiltCli();
  assertCliVersion(builtCli);

  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-mlf-wrap-'));
  assertNodeOnlyWrappersRefuse(home);
  fs.mkdirSync(path.join(home, '.mellifera'), { recursive: true });
  const canary = path.join(home, '.mellifera', 'config.jsonc');
  const canaryBody = 'CANARY-SECRET-DO-NOT-LEAK\n';
  fs.writeFileSync(canary, canaryBody, { mode: 0o600 });
  fs.mkdirSync(path.join(home, '.ssh'), { recursive: true });
  fs.writeFileSync(path.join(home, '.ssh', 'id_test'), 'not-a-key\n', { mode: 0o600 });

  const stub = writeStub(home);
  const stubLog = path.join(home, 'stub.log');
  fs.writeFileSync(stubLog, '');

  const env = childEnv(process.env, {
    HOME: home,
    MELLIFERA_CLI: stub,
    STUB_LOG: stubLog,
    PATH: process.env.PATH || '',
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
  await assertClosedPort(process.env, builtCli);

  if (fs.readFileSync(canary, 'utf8') !== canaryBody) {
    fail('wrapper run rewrote the private config canary');
  }
  const leaked = fs.readFileSync(stubLog, 'utf8').includes('CANARY-SECRET-DO-NOT-LEAK');
  if (leaked) {
    fail('CLI stub observed config canary material');
  }

  console.log(
    'OK mellifera CLI wrappers (MELLIFERA_CLI and PATH; bare node lines on Node built-ins only), reserve-apply, CLI version floor, and closed-port reserve',
  );
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
