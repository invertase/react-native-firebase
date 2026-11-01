#!/usr/bin/env node
/**
 * Unit assert: mellifera-distributed-reduce records pieces, writes one report,
 * and exits non-zero for a non-zero piece, a missing or empty coverage
 * artifact, a missing piece, a shared session, or non-overlapping lifetimes.
 * Also checks the release token stays off stdout and the piece runner's
 * dry-run step order. Run: yarn tests:mellifera:assert-distributed-reduce
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const REDUCE = path.join(SCRIPT_DIR, 'mellifera-distributed-reduce.js');
const PIECE = path.join(SCRIPT_DIR, 'mellifera-distributed-piece.sh');
const TOKEN = 't-assert-secret';

function reduce(args, env) {
  return spawnSync(process.execPath, [REDUCE, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function piece(args, env) {
  return spawnSync('bash', [PIECE, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

/**
 * Fake SDK: emulator lists AVDs from a state file; managers log argv. `emulator -avd`
 * logs argv, records its pid, creates the userdata files (unless STUB_EMULATOR_STALL),
 * and keeps running with its argv like a booting emulator (ignoring SIGTERM when
 * STUB_EMULATOR_IGNORE_TERM is set).
 */
function stubSdk(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const avds = path.join(dir, 'avds');
  const log = path.join(dir, 'sdk.log');
  fs.writeFileSync(avds, 'Pixel_Other\n');
  const tool = (rel, body) => {
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `#!/usr/bin/env bash\n${body}\n`);
    fs.chmodSync(file, 0o755);
  };
  tool(
    'emulator/emulator',
    [
      `[[ "$1" == -list-avds ]] && { cat ${JSON.stringify(avds)}; exit 0; }`,
      '[[ "$1" == -avd ]] || exit 0',
      `echo "emulator $*" >> ${JSON.stringify(log)}`,
      'avd="$ANDROID_AVD_HOME/$2.avd"',
      'echo $$ > "$avd/prewarm.pid"',
      '[[ -n "${STUB_EMULATOR_IGNORE_TERM:-}" ]] && trap "" TERM',
      'if [[ -z "${STUB_EMULATOR_STALL:-}" ]]; then',
      '  sleep 0.2; : > "$avd/userdata-qemu.img"; : > "$avd/userdata-qemu.img.qcow2"',
      'else',
      '  : > "$avd/userdata-qemu.img"',
      'fi',
      'for _ in $(seq 3000); do sleep 0.1; done',
    ].join('\n'),
  );
  tool('cmdline-tools/latest/bin/sdkmanager', `echo "sdkmanager $*" >> ${JSON.stringify(log)}`);
  tool(
    'cmdline-tools/latest/bin/avdmanager',
    [
      `cat >/dev/null; echo "avdmanager $*" >> ${JSON.stringify(log)}`,
      'while [[ $# -gt 0 ]]; do [[ "$1" == -n ]] && name="$2"; shift; done',
      `echo "$name" >> ${JSON.stringify(avds)}`,
      'mkdir -p "$ANDROID_AVD_HOME/$name.avd"',
    ].join('\n'),
  );
  return { log };
}

function writeReserve(dir, name, grant) {
  const file = path.join(dir, `${name}.reserve.json`);
  fs.writeFileSync(file, JSON.stringify(grant));
  return file;
}

function grant(sessionId, extra) {
  return {
    sessionId,
    token: TOKEN,
    placement: 'slot',
    slot: 2,
    execution: { checkoutMode: 'remote' },
    env: {},
    ...extra,
  };
}

/** Build a run dir with three passing pieces; overrides change one piece. */
function scenario(root, name, overrides = {}) {
  const runDir = path.join(root, name);
  fs.mkdirSync(runDir, { recursive: true });
  const rel = p => path.relative(REPO_ROOT, p);
  for (const [i, p] of ['android', 'ios', 'macos'].entries()) {
    const o = overrides[p] || {};
    if (o.skip) {
      continue;
    }
    const cov = path.join(runDir, `${p}.cov`);
    if (!o.noCoverage) {
      fs.writeFileSync(cov, o.emptyCoverage ? '' : 'SF:x\nend_of_record\n');
    }
    const reserve = writeReserve(runDir, p, grant(o.session || `s-${name}-${p}`));
    const started = o.started !== undefined ? o.started : 100 + i;
    const ended = o.ended !== undefined ? o.ended : 200 + i;
    const times = o.noTimes ? [] : ['--started', String(started), '--ended', String(ended)];
    const r = reduce([
      'record',
      '--run-dir',
      rel(runDir),
      '--piece',
      p,
      '--reserve',
      reserve,
      '--exit',
      String(o.exit || 0),
      '--coverage',
      rel(cov),
      ...times,
    ]);
    assert.strictEqual(r.status, 0, `record ${name}/${p}: ${r.stderr}`);
  }
  return rel(runDir);
}

function expectReport(runDir, status, needle) {
  const r = reduce(['report', '--run-dir', runDir]);
  assert.strictEqual(r.status, status, `report ${runDir} exit ${r.status}: ${r.stdout}${r.stderr}`);
  const json = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, runDir, 'report.json'), 'utf8'));
  assert.strictEqual(json.ok, status === 0);
  assert.ok(fs.existsSync(path.join(REPO_ROOT, runDir, 'report.md')));
  if (needle) {
    assert.ok(
      json.problems.some(p => p.includes(needle)),
      `${runDir}: no problem matching ${needle}`,
    );
  }
  return json;
}

function main() {
  fs.mkdirSync(path.join(REPO_ROOT, 'tests/mellifera-distributed'), { recursive: true });
  const root = fs.mkdtempSync(path.join(REPO_ROOT, 'tests/mellifera-distributed', 'assert-'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-reduce-'));
  try {
    const pass = expectReport(scenario(root, 'pass'), 0);
    assert.deepStrictEqual(
      pass.pieces.map(p => [p.piece, p.kind, p.exitCode, p.coveragePresent]),
      [
        ['android', 'linux-nested-virt-self-hosted', 0, true],
        ['ios', 'macos-self-hosted', 0, true],
        ['macos', 'macos-self-hosted', 0, true],
      ],
    );
    assert.strictEqual(pass.overlap, true);
    assert.ok(!JSON.stringify(pass).includes(TOKEN), 'token leaked into report');

    expectReport(scenario(root, 'ios-fail', { ios: { exit: 1 } }), 1, 'ios: exit 1');
    expectReport(
      scenario(root, 'macos-nocov', { macos: { noCoverage: true } }),
      1,
      'macos: coverage',
    );
    expectReport(
      scenario(root, 'android-empty', { android: { emptyCoverage: true } }),
      1,
      'android: coverage',
    );
    expectReport(scenario(root, 'missing', { macos: { skip: true } }), 1, 'macos: no piece record');
    expectReport(
      scenario(root, 'shared', { ios: { session: 'same' }, macos: { session: 'same' } }),
      1,
      'share one session',
    );
    expectReport(
      scenario(root, 'serial', {
        android: { started: 1, ended: 2 },
        ios: { started: 3, ended: 4 },
      }),
      1,
      'do not overlap',
    );

    expectReport(
      scenario(root, 'untimed', { ios: { noTimes: true } }),
      1,
      'ios: start or end time not recorded',
    );
    expectReport(
      scenario(root, 'backwards', { macos: { started: 300, ended: 300 } }),
      1,
      'macos: start 300 is not before end 300',
    );

    const secret = 'BROKEN-RESERVE-CONTENT-' + TOKEN;
    const bad = path.join(tmp, 'bad.reserve.json');
    fs.writeFileSync(bad, `{"sessionId": "${secret}"`);
    for (const args of [
      ['field', '--reserve', bad, '--field', 'sessionId'],
      ['release', '--reserve', bad],
    ]) {
      const r = reduce(args);
      assert.strictEqual(r.status, 2, `${args[0]} on malformed reserve`);
      assert.ok(
        !(r.stdout + r.stderr).includes('BROKEN-RESERVE'),
        'malformed reserve bytes printed',
      );
      assert.ok(!(r.stdout + r.stderr).includes(TOKEN), 'token printed');
      assert.ok(r.stderr.includes(bad), 'error must name the path');
    }

    const hostReserve = writeReserve(tmp, 'host', grant('s-host', { placement: 'host', slot: 0 }));
    const slotReserve = writeReserve(tmp, 'slot', grant('s-slot'));
    assert.strictEqual(reduce(['field', '--reserve', hostReserve, '--field', 'slot']).stdout, '\n');
    assert.strictEqual(
      reduce(['field', '--reserve', slotReserve, '--field', 'slot']).stdout,
      '2\n',
    );
    const tokenField = reduce(['field', '--reserve', slotReserve, '--field', 'token']);
    assert.strictEqual(tokenField.status, 2);
    assert.ok(!tokenField.stdout.includes(TOKEN) && !tokenField.stderr.includes(TOKEN));

    const macosNoCov = reduce([
      'record',
      '--run-dir',
      path.join(path.relative(REPO_ROOT, root), 'x'),
      '--piece',
      'macos',
      '--reserve',
      slotReserve,
      '--exit',
      '0',
    ]);
    assert.strictEqual(macosNoCov.status, 2, 'macos record without --coverage must fail');
    const outside = reduce(['report', '--run-dir', tmp]);
    assert.strictEqual(outside.status, 2, 'run dir outside the worktree must fail');

    const argvLog = path.join(tmp, 'argv.json');
    const fakeCli = path.join(tmp, 'fake-cli.js');
    fs.writeFileSync(
      fakeCli,
      `#!/usr/bin/env node\nrequire('fs').writeFileSync(${JSON.stringify(argvLog)}, JSON.stringify(process.argv.slice(2)));\n`,
    );
    fs.chmodSync(fakeCli, 0o755);
    const rel = reduce(['release', '--reserve', slotReserve, '--url', 'u', '--federation', 'f'], {
      MELLIFERA_CLI: fakeCli,
    });
    assert.strictEqual(rel.status, 0, rel.stderr);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(argvLog, 'utf8')), [
      'release',
      '--session-id',
      's-slot',
      '--token',
      TOKEN,
      '--url',
      'u',
      '--federation',
      'f',
    ]);
    assert.ok(!rel.stdout.includes(TOKEN) && !rel.stderr.includes(TOKEN), 'token printed');

    const ios = piece(['ios', '--placement=slot', '3', '--dry-run']);
    assert.strictEqual(ios.status, 0, ios.stderr);
    const iosSteps = ios.stdout.trim().split('\n');
    assert.strictEqual(iosSteps[0], 'eval export-slot-env ios 3');
    for (const s of [
      'yarn tests:ios:ruby',
      'yarn tests:ios:test-cover',
      'yarn tests:ios:test:process-coverage',
    ]) {
      assert.ok(iosSteps.includes(s), `ios dry-run lacks ${s}`);
    }
    assert.ok(
      iosSteps.indexOf('env SKIP_BUNDLING=1 RCT_NO_LAUNCH_PACKAGER=1 yarn tests:ios:build') <
        iosSteps.indexOf('yarn tests:e2e:check --platform=ios'),
    );
    assert.strictEqual(
      iosSteps[iosSteps.length - 1],
      'yarn tests:e2e:release --devices --placement=slot --slot=3',
    );
    const android = piece(['android', '--placement=host', '--dry-run']).stdout.trim().split('\n');
    assert.strictEqual(android[0], 'eval clear-slot-env');
    assert.ok(
      !android.some(s => s.includes('setup-android-avds')),
      'host placement must not clone AVDs',
    );
    assert.ok(android.includes('yarn tests:android:post-e2e-coverage'));
    assert.ok(android.includes('yarn tests:android:test-cover'), 'android runs test-cover');
    assert.ok(
      !android.some(s => s.includes('--headless')),
      '--headless is a no-op; do not pass it',
    );
    assert.ok(
      android.includes(
        'export RNFB_ANDROID_EMULATOR_BOOT_ARGS=-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim',
      ),
      'android must boot headless with CI emulator-options',
    );
    assert.ok(android.indexOf('check_kvm') < android.indexOf('ensure_testing_avd'));
    assert.ok(
      android.includes('check_java') &&
        android.indexOf('check_java') < android.indexOf('yarn tests:android:unit'),
      'android checks for a JDK before Gradle',
    );
    assert.ok(
      android.includes('check_memory') &&
        android.indexOf('check_memory') < android.indexOf('yarn tests:android:unit'),
      'android checks guest memory against the Gradle heap before Gradle',
    );
    assert.ok(
      android.indexOf('yarn tests:e2e:release --devices --placement=host') <
        android.indexOf('yarn tests:android:build'),
    );
    assert.strictEqual(
      android[android.length - 1],
      'yarn tests:e2e:release --devices --placement=host',
    );
    const slotAndroid = piece(['android', '--placement=slot', '2', '--dry-run']);
    assert.strictEqual(slotAndroid.status, 0, slotAndroid.stderr);
    const slotReleases = slotAndroid.stdout
      .trim()
      .split('\n')
      .filter(s => s.includes('tests:e2e:release'));
    assert.deepStrictEqual(slotReleases, [
      'yarn tests:e2e:release --devices --placement=slot --slot=2',
      'yarn tests:e2e:release --devices --placement=slot --slot=2',
    ]);
    for (const [args, why] of [
      [['android', '--dry-run'], 'missing --placement'],
      [['android', '--placement=slot', '--dry-run'], 'desk slot without SLOT'],
      [['android', '--placement=host', '1', '--dry-run'], 'host with SLOT'],
      [['android', '--placement=guest', '--dry-run'], 'unknown placement'],
    ]) {
      const refused = piece(args);
      assert.strictEqual(refused.status, 2, `${why} must exit 2`);
      assert.strictEqual(refused.stdout, '', `${why} must print no steps`);
    }
    const kept = piece(['android', '--placement=host', '--dry-run'], {
      RNFB_ANDROID_EMULATOR_BOOT_ARGS: '-gpu host',
    });
    assert.ok(
      kept.stdout.includes('keep RNFB_ANDROID_EMULATOR_BOOT_ARGS'),
      'caller boot args must win',
    );
    const detoxrc = fs.readFileSync(path.join(REPO_ROOT, 'tests/.detoxrc.js'), 'utf8');
    assert.ok(
      /SERIAL_ANDROID_AVD = 'TestingAVD'/.test(detoxrc) &&
        /^BASE_AVD="TestingAVD"$/m.test(fs.readFileSync(PIECE, 'utf8')),
      'ensure-avd must create the AVD Detox android.emu.debug uses',
    );
    for (const s of [
      'check_apple_toolchain ios',
      'ensure_brew_utilities applesimutils xcbeautify',
      'yarn ruby:install',
    ]) {
      assert.ok(iosSteps.includes(s), `ios dry-run lacks ${s}`);
    }
    assert.ok(
      iosSteps.indexOf('yarn ruby:install') < iosSteps.indexOf('yarn tests:ios:pod:install'),
    );
    assert.ok(
      iosSteps.includes('check_java') &&
        iosSteps.indexOf('check_java') < iosSteps.indexOf('yarn ruby:install'),
      'ios checks for a JDK before any build step',
    );
    const macos = piece(['macos', '--placement=slot', '0', '--dry-run']).stdout.trim().split('\n');
    assert.ok(
      macos.includes('yarn tests:macos:packager:jet') &&
        macos.includes('yarn tests:macos:test-cover'),
    );
    assert.ok(
      macos.includes('check_java') &&
        macos.indexOf('check_java') < macos.indexOf('yarn tests:macos:pod:install'),
      'macos checks for a JDK before any build step',
    );
    assert.strictEqual(piece(['tvos', '--dry-run']).status, 2);
    assert.ok(
      android.includes('ensure_testing_avd') &&
        android.indexOf('ensure_testing_avd') < android.indexOf('yarn tests:android:build'),
      'android must ensure TestingAVD before the build',
    );

    const sdk = path.join(tmp, 'sdk');
    const { log } = stubSdk(sdk);
    const avdHome = path.join(tmp, 'avd-home');
    const avdDir = path.join(avdHome, 'TestingAVD.avd');
    const userdata = path.join(avdDir, 'userdata-qemu.img');
    const avdEnv = { ANDROID_HOME: sdk, ANDROID_AVD_HOME: avdHome, RNFB_ANDROID_AVD_ABI: 'x86_64' };
    const prewarmLaunch =
      'emulator -avd TestingAVD -no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim -crash-report-mode never -port 5584';
    const assertPrewarmStopped = label => {
      const pid = Number(fs.readFileSync(path.join(avdDir, 'prewarm.pid'), 'utf8'));
      assert.throws(
        () => process.kill(pid, 0),
        { code: 'ESRCH' },
        `${label}: prewarm emulator stopped`,
      );
    };
    const created = piece(['ensure-avd'], avdEnv);
    assert.strictEqual(created.status, 0, created.stderr);
    assert.ok(fs.existsSync(userdata), 'a new TestingAVD gets its userdata before the build');
    assert.ok(fs.existsSync(`${userdata}.qcow2`));
    assertPrewarmStopped('create');
    const calls = fs.readFileSync(log, 'utf8').trim().split('\n');
    assert.ok(calls.includes(prewarmLaunch), calls.join('\n'));
    assert.ok(
      calls.includes(
        'sdkmanager --install system-images;android-36;google_apis;x86_64 emulator platform-tools',
      ),
      calls.join('\n'),
    );
    assert.ok(
      calls.includes(
        'avdmanager create avd --force -n TestingAVD --abi google_apis/x86_64 --package system-images;android-36;google_apis;x86_64',
      ),
      calls.join('\n'),
    );
    fs.writeFileSync(log, '');
    const again = piece(['ensure-avd', '--placement=host'], avdEnv);
    assert.strictEqual(again.status, 0, again.stderr);
    assert.strictEqual(
      fs.readFileSync(log, 'utf8'),
      '',
      'existing TestingAVD with userdata is neither recreated nor launched',
    );
    fs.rmSync(userdata);
    fs.rmSync(`${userdata}.qcow2`);
    const desk = piece(['ensure-avd'], avdEnv);
    assert.strictEqual(desk.status, 0, desk.stderr);
    assert.strictEqual(
      fs.readFileSync(log, 'utf8'),
      '',
      "a desk's existing TestingAVD is not launched",
    );
    const hostRun = piece(['ensure-avd', '--placement=host'], avdEnv);
    assert.strictEqual(hostRun.status, 0, hostRun.stderr);
    assert.ok(
      fs.existsSync(userdata),
      'a whole guest creates missing userdata on an existing TestingAVD',
    );
    assertPrewarmStopped('existing');
    fs.rmSync(`${userdata}.qcow2`);
    fs.writeFileSync(log, '');
    const partial = piece(['ensure-avd', '--placement=host'], avdEnv);
    assert.strictEqual(partial.status, 0, partial.stderr);
    assert.ok(
      fs.readFileSync(log, 'utf8').includes(prewarmLaunch),
      'a raw image without its overlay is partial and is created again',
    );
    assertPrewarmStopped('partial');
    fs.rmSync(userdata);
    fs.rmSync(`${userdata}.qcow2`);
    const stalled = piece(['ensure-avd', '--placement=host'], {
      ...avdEnv,
      STUB_EMULATOR_STALL: '1',
      STUB_EMULATOR_IGNORE_TERM: '1',
      RNFB_ANDROID_AVD_PREWARM_TIMEOUT_S: '2',
    });
    assert.strictEqual(stalled.status, 1, 'userdata that never appears must fail');
    assert.match(stalled.stderr, /userdata not created within 2s/);
    assertPrewarmStopped('stalled, ignoring SIGTERM');
    assert.ok(!fs.existsSync(userdata), 'a failed attempt leaves no partial userdata');
    const noSdk = piece(['ensure-avd'], { ANDROID_HOME: path.join(tmp, 'none') });
    assert.strictEqual(noSdk.status, 1, 'missing SDK tools must fail');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(
    'OK mellifera-distributed-reduce report, failure cases, release, piece dry-run, and TestingAVD create-if-missing',
  );
}

main();
