#!/usr/bin/env node
/**
 * Unit assert: mellifera-distributed-reduce records pieces, writes one report,
 * and exits non-zero for a non-zero piece, a missing or empty coverage
 * artifact, a missing piece, a shared session, or non-overlapping lifetimes.
 * Also checks the release token reaches the CLI through MELLIFERA_SESSION_TOKEN
 * (not argv), overrides an inherited token, and stays off stdout, both with
 * MELLIFERA_CLI set and with mellifera-cli resolved from PATH, plus the
 * piece runner's dry-run step order and its free-disk check against a stubbed df.
 * A global grant (placement "pool", or no placement) names no slot index:
 * `field slot` and the piece runner refuse it rather than pick a slot or a
 * whole-host release; a global grant with placement "slot" reads its slot.
 * `extend` passes the token like release for a local-core grant, and exactly
 * `extend --global --session-id GRANT_ID --ttl-ms N` with no token for a global
 * grant, with a fake CLI that records argv and, when MELLIFERA_BUILT_CLI is set,
 * with the real CLI against a 127.0.0.1 global stub; `node-check` runs on stub
 * node and corepack binaries.
 * Run: yarn tests:mellifera:assert-distributed-reduce
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

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

/**
 * Fake host for the preflights: Darwin with 64 GiB RAM, JDK 21, Xcode, xcbeautify, a `yarn`
 * that only logs argv, and a `df -Pk` reporting STUB_DF_MB free on `/`, or
 * STUB_DF_AVD_MB on `/avd` for paths under STUB_DF_AVD_PREFIX.
 */
function stubHost(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const log = path.join(dir, 'yarn.log');
  const tool = (name, body) => {
    const file = path.join(dir, name);
    fs.writeFileSync(file, `#!/usr/bin/env bash\n${body}\n`);
    fs.chmodSync(file, 0o755);
  };
  tool('uname', '[[ "$1" == -m ]] && echo arm64 || echo Darwin');
  tool('sysctl', 'echo 68719476736');
  tool('javac', 'echo "javac 21.0.4"');
  tool('java', 'echo \'openjdk version "21.0.4" 2024-07-16\' >&2');
  tool('xcodebuild', 'echo "Xcode 27.0"');
  tool('xcbeautify', 'cat');
  tool('yarn', `echo "yarn $*" >> ${JSON.stringify(log)}`);
  tool(
    'df',
    [
      'dir="${*: -1}" mb="$STUB_DF_MB" fs=/dev/disk1 mnt=/',
      'if [[ -n "${STUB_DF_AVD_PREFIX:-}" && "$dir" == "$STUB_DF_AVD_PREFIX"* ]]; then',
      '  mb="$STUB_DF_AVD_MB" fs=/dev/disk2 mnt=/avd',
      'fi',
      'echo "Filesystem 1024-blocks Used Available Capacity Mounted on"',
      'echo "$fs 999999999 0 $(( mb * 1024 + 512 )) 0% $mnt"',
    ].join('\n'),
  );
  return { log, path: `${dir}${path.delimiter}${process.env.PATH}` };
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
  let realCli = false;
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
    const poolGrant = { placement: 'pool', slot: 0, phase: 'pool-global', host: 'global' };
    for (const [name, extra] of [
      ['pool', poolGrant],
      ['slot-without-index', { placement: 'slot', slot: undefined }],
      ['slot-negative', { placement: 'slot', slot: -1 }],
      ['no-placement', { placement: undefined, slot: undefined }],
      ['no-placement-with-slot', { placement: undefined, slot: 2 }],
    ]) {
      const file = writeReserve(tmp, name, grant(`s-${name}`, extra));
      const slot = reduce(['field', '--reserve', file, '--field', 'slot']);
      assert.strictEqual(slot.status, 3, `${name}: field slot must refuse (${slot.stderr})`);
      assert.strictEqual(slot.stdout, '', `${name}: field slot must print no slot`);
      assert.ok(
        slot.stderr.includes('names no slot index') &&
          slot.stderr.includes('running-e2e-distributed.md#global-grant-placement'),
        `${name}: refusal must explain and link the doc: ${slot.stderr}`,
      );
      assert.ok(!(slot.stdout + slot.stderr).includes(TOKEN), `${name}: token printed`);
      const id = reduce(['field', '--reserve', file, '--field', 'sessionId']);
      assert.strictEqual(id.stdout, `s-${name}\n`, `${name}: sessionId still reads`);
    }
    const poolReserve = writeReserve(tmp, 'pool-placement', grant('s-pool', poolGrant));
    assert.strictEqual(
      reduce(['field', '--reserve', poolReserve, '--field', 'placement']).stdout,
      'pool\n',
    );
    const unplaced = writeReserve(tmp, 'unplaced', grant('s-unplaced', { placement: undefined }));
    assert.strictEqual(
      reduce(['field', '--reserve', unplaced, '--field', 'placement']).stdout,
      'pool\n',
      'a grant with no placement is placement pool',
    );
    const globalSlot = writeReserve(
      tmp,
      'global-slot',
      grant('g-slot', { placement: 'slot', slot: 1, phase: 'pool-global' }),
    );
    assert.strictEqual(
      reduce(['field', '--reserve', globalSlot, '--field', 'slot']).stdout,
      '1\n',
      'a global grant on a desk slot reads its slot index',
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
      `#!/usr/bin/env node\nrequire('fs').writeFileSync(${JSON.stringify(argvLog)}, JSON.stringify({ argv: process.argv.slice(2), token: process.env.MELLIFERA_SESSION_TOKEN }));\n`,
    );
    fs.chmodSync(fakeCli, 0o755);
    const rel = reduce(['release', '--reserve', slotReserve, '--url', 'u', '--federation', 'f'], {
      MELLIFERA_CLI: fakeCli,
      MELLIFERA_SESSION_TOKEN: 'inherited-token',
    });
    assert.strictEqual(rel.status, 0, rel.stderr);
    const released = JSON.parse(fs.readFileSync(argvLog, 'utf8'));
    assert.deepStrictEqual(released.argv, [
      'release',
      '--session-id',
      's-slot',
      '--url',
      'u',
      '--federation',
      'f',
    ]);
    assert.ok(
      !released.argv.some(a => a.includes(TOKEN)) && !released.argv.includes('--token'),
      'token on release argv',
    );
    assert.strictEqual(released.token, TOKEN, 'release env lacks the grant token');
    assert.ok(!rel.stdout.includes(TOKEN) && !rel.stderr.includes(TOKEN), 'token printed');

    fs.rmSync(argvLog, { force: true });
    const ext = reduce(
      [
        'extend',
        '--reserve',
        slotReserve,
        '--ttl-ms',
        '5400000',
        '--url',
        'u',
        '--federation',
        'f',
      ],
      { MELLIFERA_CLI: fakeCli, MELLIFERA_SESSION_TOKEN: 'inherited-token' },
    );
    assert.strictEqual(ext.status, 0, ext.stderr);
    const extended = JSON.parse(fs.readFileSync(argvLog, 'utf8'));
    assert.deepStrictEqual(extended.argv, [
      'extend',
      '--session-id',
      's-slot',
      '--ttl-ms',
      '5400000',
      '--url',
      'u',
      '--federation',
      'f',
    ]);
    assert.strictEqual(extended.token, TOKEN, 'extend env lacks the grant token');
    assert.ok(!ext.stdout.includes(TOKEN) && !ext.stderr.includes(TOKEN), 'extend printed token');
    fs.rmSync(argvLog, { force: true });
    assertGlobalExtend(tmp);
    realCli = assertGlobalExtendRealCli(tmp);
    for (const bad of [[], ['--ttl-ms', '0'], ['--ttl-ms', '90m']]) {
      const refused = reduce(['extend', '--reserve', slotReserve, ...bad], {
        MELLIFERA_CLI: fakeCli,
      });
      assert.strictEqual(refused.status, 2, `extend ${JSON.stringify(bad)} must exit 2`);
      assert.ok(!fs.existsSync(argvLog), `extend ${JSON.stringify(bad)} ran the CLI`);
    }
    const pathBin = path.join(tmp, 'path-bin');
    fs.mkdirSync(pathBin);
    fs.symlinkSync(fakeCli, path.join(pathBin, 'mellifera-cli'));
    const relPath = reduce(
      ['release', '--reserve', slotReserve, '--url', 'u', '--federation', 'f'],
      {
        MELLIFERA_CLI: undefined,
        MELLIFERA_SESSION_TOKEN: 'inherited-token',
        PATH: `${pathBin}${path.delimiter}${process.env.PATH}`,
      },
    );
    assert.strictEqual(relPath.status, 0, relPath.stderr);
    const releasedPath = JSON.parse(fs.readFileSync(argvLog, 'utf8'));
    assert.deepStrictEqual(releasedPath.argv, released.argv, 'PATH release argv');
    assert.strictEqual(releasedPath.token, TOKEN, 'PATH release env lacks the grant token');
    assert.ok(
      !relPath.stdout.includes(TOKEN) && !relPath.stderr.includes(TOKEN),
      'PATH release printed the token',
    );

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
      android.indexOf('check_memory') < android.indexOf('check_disk android') &&
        android.indexOf('check_disk android') < android.indexOf('ensure_testing_avd'),
      'android checks free disk after memory and before the AVD and the build',
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
    assert.ok(
      android.indexOf('yarn tests:android:build') < android.indexOf('stop_gradle_daemons') &&
        android.indexOf('stop_gradle_daemons') < android.indexOf('yarn tests:packager:jet'),
      'a whole guest stops the build daemons before Metro and the emulator',
    );
    assert.ok(
      !slotAndroid.stdout.includes('stop_gradle_daemons'),
      'a desk slot must not stop daemons other slots may share',
    );
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
      [['android', '--placement=pool', '--dry-run'], 'global grant without a slot index'],
      [['ios', '--placement=pool', '0', '--dry-run'], 'global grant with a guessed slot'],
    ]) {
      const refused = piece(args);
      assert.strictEqual(refused.status, 2, `${why} must exit 2`);
      assert.strictEqual(refused.stdout, '', `${why} must print no steps`);
      if (args.includes('--placement=pool')) {
        assert.ok(
          refused.stderr.includes('placement pool is a global grant') &&
            refused.stderr.includes('#global-grant-placement'),
          `${why} must say why and link the doc: ${refused.stderr}`,
        );
      }
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
    assert.ok(
      iosSteps.indexOf('check_java') < iosSteps.indexOf('check_disk ios') &&
        iosSteps.indexOf('check_disk ios') <
          iosSteps.indexOf('ensure_brew_utilities applesimutils xcbeautify'),
      'ios checks free disk before any install step',
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
    assert.ok(
      macos.indexOf('check_java') < macos.indexOf('check_disk macos') &&
        macos.indexOf('check_disk macos') < macos.indexOf('ensure_brew_utilities xcbeautify'),
      'macos checks free disk before any install step',
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

    const host = stubHost(path.join(tmp, 'host-bin'));
    const diskAvdHome = path.join(tmp, 'disk-avd');
    const diskAvd = path.join(diskAvdHome, 'TestingAVD.avd');
    fs.mkdirSync(diskAvdHome);
    const diskRun = (platform, env) => {
      fs.writeFileSync(host.log, '');
      const r = piece([platform, '--placement=host'], {
        PATH: host.path,
        ANDROID_HOME: path.join(tmp, 'no-sdk'),
        ANDROID_AVD_HOME: diskAvdHome,
        RNFB_E2E_MIN_FREE_DISK_MB: '',
        ...env,
      });
      const yarnCalls = fs.readFileSync(host.log, 'utf8').trim().split('\n');
      return { ...r, yarnCalls };
    };
    const diskFailed = (r, label) => {
      assert.strictEqual(r.status, 1, `${label}: exit ${r.status}: ${r.stderr}`);
      assert.deepStrictEqual(
        r.yarnCalls,
        ['yarn tests:e2e:release --devices --placement=host'],
        `${label}: nothing but the release runs after a failed disk check`,
      );
    };
    const passedDisk = (r, label) => {
      assert.ok(!r.stderr.includes('MB free'), `${label}: ${r.stderr}`);
      assert.match(r.stderr, /Android SDK not found/, `${label}: the piece went on to the AVD`);
    };

    const sameFsShort = diskRun('android', { STUB_DF_MB: String(30720 + 7372) });
    diskFailed(sameFsShort, 'android, one filesystem, 1 MB short');
    assert.ok(
      sameFsShort.stderr.includes(
        'mellifera-distributed-piece: 38092 MB free on / (checkout); the android piece needs 38093 MB: 30720 MB for install, build and devices (RNFB_E2E_MIN_FREE_DISK_MB) plus 7373 MB for the TestingAVD userdata image (1.2 x 6 GiB while it is missing)',
      ),
      sameFsShort.stderr,
    );
    passedDisk(
      diskRun('android', { STUB_DF_MB: String(30720 + 7373) }),
      'android, one filesystem, exactly enough',
    );

    fs.mkdirSync(diskAvd);
    fs.writeFileSync(path.join(diskAvd, 'userdata-qemu.img'), '');
    fs.writeFileSync(path.join(diskAvd, 'userdata-qemu.img.qcow2'), '');
    passedDisk(
      diskRun('android', { STUB_DF_MB: '30720' }),
      'android with userdata needs only the build space',
    );
    const userdataReady = diskRun('android', { STUB_DF_MB: '30719' });
    diskFailed(userdataReady, 'android with userdata, 1 MB short');
    assert.match(userdataReady.stderr, /needs 30720 MB: 30720 MB for install, build and devices/);
    assert.ok(!userdataReady.stderr.includes('userdata image'), userdataReady.stderr);
    fs.rmSync(diskAvd, { recursive: true });

    const avdFs = { STUB_DF_MB: '30720', STUB_DF_AVD_PREFIX: diskAvdHome };
    passedDisk(
      diskRun('android', { ...avdFs, STUB_DF_AVD_MB: '7373' }),
      'android, separate AVD filesystem, enough on each',
    );
    const avdShort = diskRun('android', { ...avdFs, STUB_DF_AVD_MB: '7372' });
    diskFailed(avdShort, 'android, separate AVD filesystem, AVD home short');
    assert.ok(
      avdShort.stderr.includes(
        'mellifera-distributed-piece: 7372 MB free on /avd (AVD home); the TestingAVD userdata image needs 7373 MB there (1.2 x 6 GiB while it is missing)',
      ),
      avdShort.stderr,
    );
    assert.ok(!avdShort.stderr.includes('(checkout)'), 'the checkout filesystem had enough');

    const macosShort = diskRun('macos', { STUB_DF_MB: '15359' });
    diskFailed(macosShort, 'macos, 1 MB short');
    assert.ok(
      macosShort.stderr.includes(
        'mellifera-distributed-piece: 15359 MB free on / (checkout); the macos piece needs 15360 MB: 15360 MB for install, build and devices (RNFB_E2E_MIN_FREE_DISK_MB)\n',
      ),
      macosShort.stderr,
    );
    const macosOverride = diskRun('macos', {
      STUB_DF_MB: '15359',
      RNFB_E2E_MIN_FREE_DISK_MB: '2048',
    });
    assert.ok(!macosOverride.stderr.includes('MB free'), macosOverride.stderr);
    assert.ok(
      macosOverride.yarnCalls.includes('yarn ruby:install'),
      'macos goes on to install when the override is met',
    );
    const badOverride = diskRun('macos', { STUB_DF_MB: '99999', RNFB_E2E_MIN_FREE_DISK_MB: '20G' });
    diskFailed(badOverride, 'non-numeric override');
    assert.match(
      badOverride.stderr,
      /RNFB_E2E_MIN_FREE_DISK_MB must be a whole number of MB, got 20G/,
    );

    assertLeftovers(tmp);
    assertGitBaseline(tmp);
    assertNodeCheck(tmp);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(
    `OK mellifera-distributed-reduce report, failure cases, release, extend (local and --global; real CLI ${realCli ? 'checked' : 'skipped: MELLIFERA_BUILT_CLI unset'}), piece dry-run, TestingAVD create-if-missing, free-disk check, spill leftovers, git baseline, and node check`,
  );
}

/**
 * `extend` on a global grant (phase "pool-global") runs exactly
 * `extend --global --session-id GRANT_ID --ttl-ms N`, with no session token in
 * the child env (even an inherited one) and no `--url` or `--federation`. It
 * succeeds only when the CLI answers from the global grant route (`grantId`
 * and `expiresAt`). An old CLI (no `extend --global`: with no session token it
 * prints usage and exits 1), a CLI that answers some other way, or a failing
 * CLI exits non-zero and says so. A local-core spill keeps the session route
 * with its local session id and token; its local core extends the global grant.
 */
function assertGlobalExtend(tmp) {
  const argvLog = path.join(tmp, 'global-argv.json');
  const fakeCli = path.join(tmp, 'fake-global-cli.js');
  fs.writeFileSync(
    fakeCli,
    `#!/usr/bin/env node
const argv = process.argv.slice(2);
const token = process.env.MELLIFERA_SESSION_TOKEN;
require('fs').writeFileSync(${JSON.stringify(argvLog)}, JSON.stringify({ argv, token }));
const id = argv[argv.indexOf('--session-id') + 1];
const mode = process.env.FAKE_CLI_MODE;
if (mode === 'old' && !token) {
  process.stdout.write('Usage:\\n  mellifera-cli extend [--session-id ID [--token T | --token-file PATH|-]] [--ttl-ms N]\\n');
  process.exit(1);
}
if (mode === 'old' || mode === 'session-route') {
  process.stdout.write(JSON.stringify({ sessionId: id, expiresAt: '2026-01-01T00:00:00Z' }) + '\\n');
  process.exit(0);
}
if (mode === 'no-expiry') {
  process.stdout.write(JSON.stringify({ grantId: id }) + '\\n');
  process.exit(0);
}
if (mode === 'fails') {
  process.stderr.write('[mellifera-cli] not-found: grant not found\\n');
  process.exit(4);
}
process.stdout.write(JSON.stringify({ grantId: id, expiresAt: '2026-01-01T00:00:00Z', capped: false }, null, 2) + '\\n');
`,
  );
  fs.chmodSync(fakeCli, 0o755);
  const globalGrant = {
    sessionId: 'g-global',
    token: TOKEN,
    placement: 'slot',
    slot: 1,
    phase: 'pool-global',
    execution: { workerId: 'pool', host: 'global', checkoutMode: 'remote' },
    federation: { grantId: 'g-global' },
    env: {},
  };
  const reserve = path.join(tmp, 'global.reserve.json');
  fs.writeFileSync(reserve, JSON.stringify(globalGrant));
  const extend = (file, mode) => {
    fs.rmSync(argvLog, { force: true });
    const r = reduce(
      ['extend', '--reserve', file, '--ttl-ms', '5400000', '--url', 'u', '--federation', 'f'],
      { MELLIFERA_CLI: fakeCli, MELLIFERA_SESSION_TOKEN: 'inherited-token', FAKE_CLI_MODE: mode },
    );
    const call = fs.existsSync(argvLog) ? JSON.parse(fs.readFileSync(argvLog, 'utf8')) : null;
    assert.ok(!(r.stdout + r.stderr).includes(TOKEN), `extend (${mode}) printed the token`);
    assert.ok(
      !call || !call.argv.some(a => a.includes(TOKEN)),
      `extend (${mode}) put the token on argv`,
    );
    return { ...r, call };
  };
  const GLOBAL_ARGV = ['extend', '--global', '--session-id', 'g-global', '--ttl-ms', '5400000'];

  const renewed = extend(reserve, 'global');
  assert.strictEqual(renewed.status, 0, `global extend: ${renewed.stderr}`);
  assert.deepStrictEqual(renewed.call.argv, GLOBAL_ARGV);
  assert.strictEqual(renewed.call.token, undefined, 'global extend must not pass a session token');
  assert.strictEqual(JSON.parse(renewed.stdout).grantId, 'g-global');

  const old = extend(reserve, 'old');
  assert.deepStrictEqual(old.call.argv, GLOBAL_ARGV);
  assert.strictEqual(old.status, 1, 'an old CLI must fail');
  assert.match(
    old.stderr,
    /printed usage for `extend --global --session-id g-global`, so global grant g-global was not renewed/,
  );
  assert.match(old.stderr, /Upgrade mellifera-cli to a release whose usage lists/);
  assert.strictEqual(old.stdout, '', 'the old CLI usage text is not printed as output');

  for (const mode of ['session-route', 'no-expiry']) {
    const wrong = extend(reserve, mode);
    assert.strictEqual(wrong.status, 1, `a CLI answering ${mode} must fail`);
    assert.match(wrong.stderr, /did not extend global grant g-global through the global grant/);
    assert.match(wrong.stderr, /Upgrade mellifera-cli/);
    assert.strictEqual(wrong.stdout, '', `the ${mode} answer is not printed as success`);
  }

  const failed = extend(reserve, 'fails');
  assert.strictEqual(failed.status, 4, 'a failing CLI keeps its exit status');
  assert.match(failed.stderr, /not-found: grant not found/);
  assert.match(failed.stderr, /exited 4; the grant was not renewed/);

  const split = path.join(tmp, 'global-split.reserve.json');
  fs.writeFileSync(split, JSON.stringify({ ...globalGrant, federation: { grantId: 'g-other' } }));
  const refused = extend(split, 'global');
  assert.strictEqual(refused.status, 2, 'a global reserve with two grant ids must be refused');
  assert.strictEqual(refused.call, null, 'the CLI ran for a global reserve with two grant ids');
  assert.match(refused.stderr, /federation\.grantId "g-other"; they must be the same grant id/);

  const spill = path.join(tmp, 'spill.reserve.json');
  fs.writeFileSync(
    spill,
    JSON.stringify({
      ...globalGrant,
      sessionId: 's-spill',
      phase: 'spill-existing',
      federation: { spillId: 'sp-1', grantId: 'g-donor' },
    }),
  );
  const local = extend(spill, 'session-route');
  assert.strictEqual(local.status, 0, `local spill extend: ${local.stderr}`);
  assert.deepStrictEqual(
    local.call.argv,
    ['extend', '--session-id', 's-spill', '--ttl-ms', '5400000', '--url', 'u', '--federation', 'f'],
    'a local-core spill extends its local session; its local core extends grant g-donor',
  );
  assert.strictEqual(local.call.token, TOKEN, 'local spill extend env lacks the grant token');
}

/**
 * With MELLIFERA_BUILT_CLI set, `extend` on a global grant runs the real CLI
 * against a 127.0.0.1 stand-in for the global's grant routes. The CLI must
 * POST `/v1/pool/grants/GRANT_ID/extend` with `{ttlMs}` and the API key, and
 * the reducer must accept its real answer. A grant the global no longer has
 * (404) exits non-zero. Returns false when MELLIFERA_BUILT_CLI is unset.
 */
function assertGlobalExtendRealCli(tmp) {
  const cli = process.env.MELLIFERA_BUILT_CLI;
  if (!cli) {
    return false;
  }
  const dir = path.join(tmp, 'real-cli');
  fs.mkdirSync(path.join(dir, 'config'), { recursive: true });
  const portFile = path.join(dir, 'port');
  const requestLog = path.join(dir, 'requests.jsonl');
  const server = path.join(dir, 'global-stub.js');
  fs.writeFileSync(
    server,
    `const fs = require('fs');
require('http')
  .createServer((req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      fs.appendFileSync(${JSON.stringify(requestLog)}, JSON.stringify({
        method: req.method, url: req.url, auth: req.headers.authorization || '', body,
      }) + '\\n');
      const live = req.method === 'POST' && req.url === '/v1/pool/grants/g-real/extend';
      res.writeHead(live ? 200 : 404, { 'content-type': 'application/json' });
      res.end(JSON.stringify(live
        ? { grantId: 'g-real', expiresAt: '2026-01-01T01:30:00.000Z', capped: false }
        : { error: 'not-found' }));
    });
  })
  .listen(0, '127.0.0.1', function () {
    fs.writeFileSync(${JSON.stringify(portFile)}, String(this.address().port));
  });
`,
  );
  const stub = spawn(process.execPath, [server], { stdio: 'ignore' });
  try {
    const deadline = Date.now() + 10_000;
    while (!fs.existsSync(portFile) && Date.now() < deadline) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
    assert.ok(fs.existsSync(portFile), 'global stub did not start');
    const env = {
      MELLIFERA_CLI: cli,
      MELLIFERA_CONFIG_DIR: path.join(dir, 'config'),
      MELLIFERA_GLOBAL_URL: `http://127.0.0.1:${fs.readFileSync(portFile, 'utf8')}`,
      MELLIFERA_GLOBAL_TOKEN: 'key-real-cli-assert',
      MELLIFERA_UPDATE_CHECK: 'off',
      MELLIFERA_SESSION_TOKEN: 'inherited-token',
    };
    const reserveFor = id => {
      const file = path.join(dir, `${id}.reserve.json`);
      fs.writeFileSync(
        file,
        JSON.stringify({
          sessionId: id,
          token: TOKEN,
          placement: 'pool',
          slot: 0,
          phase: 'pool-global',
          execution: { workerId: 'pool', host: 'global', checkoutMode: 'remote' },
          federation: { grantId: id },
          env: {},
        }),
      );
      return file;
    };

    const live = reduce(['extend', '--reserve', reserveFor('g-real'), '--ttl-ms', '5400000'], env);
    assert.strictEqual(live.status, 0, `real CLI global extend: ${live.stdout}${live.stderr}`);
    assert.deepStrictEqual(JSON.parse(live.stdout), {
      grantId: 'g-real',
      expiresAt: '2026-01-01T01:30:00.000Z',
      capped: false,
    });
    const requests = fs
      .readFileSync(requestLog, 'utf8')
      .trim()
      .split('\n')
      .map(line => JSON.parse(line));
    assert.deepStrictEqual(requests, [
      {
        method: 'POST',
        url: '/v1/pool/grants/g-real/extend',
        auth: 'Bearer key-real-cli-assert',
        body: JSON.stringify({ ttlMs: 5400000 }),
      },
    ]);
    assert.ok(!(live.stdout + live.stderr).includes(TOKEN), 'real CLI extend printed the token');

    const gone = reduce(['extend', '--reserve', reserveFor('g-gone'), '--ttl-ms', '5400000'], env);
    assert.notStrictEqual(gone.status, 0, 'real CLI extend of a grant the global lacks must fail');
    assert.match(gone.stderr, /exited \d+; the grant was not renewed/);
  } finally {
    stub.kill();
  }
  return true;
}

/**
 * `node-check` against stub `node` and `corepack` on a PATH that otherwise
 * holds only the system directories: it passes on node 24 or newer with
 * corepack, and names the gap and the guest requirements otherwise.
 */
function assertNodeCheck(tmp) {
  const systemPath = '/usr/bin:/bin:/usr/sbin:/sbin';
  const stubBin = (name, major, withCorepack) => {
    const dir = path.join(tmp, `node-${name}`);
    fs.mkdirSync(dir, { recursive: true });
    if (major !== null) {
      fs.writeFileSync(path.join(dir, 'node'), `#!/bin/sh\necho ${major}\n`);
      fs.chmodSync(path.join(dir, 'node'), 0o755);
    }
    if (withCorepack) {
      fs.writeFileSync(path.join(dir, 'corepack'), '#!/bin/sh\nexit 0\n');
      fs.chmodSync(path.join(dir, 'corepack'), 0o755);
    }
    return `${dir}:${systemPath}`;
  };
  const check = (pathValue, env = {}) => piece(['node-check'], { PATH: pathValue, ...env });

  const ok = check(stubBin('24', 24, true));
  assert.strictEqual(ok.status, 0, `node 24 with corepack: ${ok.stderr}`);
  assert.match(ok.stderr, /node 24 and corepack found/);
  assert.strictEqual(check(stubBin('25', 25, true)).status, 0, 'a newer node passes');

  const old = check(stubBin('22', 22, true));
  assert.strictEqual(old.status, 1, `node 22: ${old.stderr}`);
  assert.match(old.stderr, /node 22 found; node 24 or newer is required/);
  assert.match(old.stderr, /running-e2e-distributed\.md#guest-requirements/);

  const noCorepack = check(stubBin('24-no-corepack', 24, false));
  assert.strictEqual(noCorepack.status, 1, `no corepack: ${noCorepack.stderr}`);
  assert.match(noCorepack.stderr, /corepack is not on PATH beside node 24/);

  if (!systemPath.split(':').some(dir => fs.existsSync(path.join(dir, 'node')))) {
    const missing = check(stubBin('none', null, true));
    assert.strictEqual(missing.status, 1, `no node: ${missing.stderr}`);
    assert.match(missing.stderr, /node is not on PATH/);
  }

  const lowered = check(stubBin('22-override', 22, true), { RNFB_NODE_VERSION: '22' });
  assert.strictEqual(lowered.status, 0, `RNFB_NODE_VERSION=22: ${lowered.stderr}`);
  const bad = check(stubBin('24-bad-override', 24, true), { RNFB_NODE_VERSION: 'lts' });
  assert.strictEqual(bad.status, 1);
  assert.match(bad.stderr, /RNFB_NODE_VERSION must be a whole node major version, got lts/);
}

/**
 * `git-baseline` on a copy of the piece script in a fake synced tree with no
 * .git, as the default sync filter leaves it: `git diff` there is not a drift
 * check until the baseline is staged, then it passes on the synced files and
 * fails on a later change. It refuses a tree with no sibling scratch dir and a
 * tree inside another repository's work tree, creating no .git in either.
 */
function assertGitBaseline(tmp) {
  const gitDiff = cwd =>
    spawnSync('git', ['diff', '--exit-code', '--', 'packages/*/ios/generated/**'], {
      cwd,
      encoding: 'utf8',
    });
  const fakeTree = dir => {
    const generated = path.join(dir, 'packages', 'app', 'ios', 'generated', 'Spec.h');
    fs.mkdirSync(path.dirname(generated), { recursive: true });
    fs.writeFileSync(generated, '// synced\n');
    fs.mkdirSync(path.join(dir, 'scripts', 'e2e'), { recursive: true });
    fs.copyFileSync(PIECE, path.join(dir, 'scripts', 'e2e', 'mellifera-distributed-piece.sh'));
    return generated;
  };
  const baseline = dir =>
    spawnSync(
      'bash',
      [path.join(dir, 'scripts', 'e2e', 'mellifera-distributed-piece.sh'), 'git-baseline'],
      {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      },
    );

  const tree = path.join(tmp, 'baseline-work', 'b1');
  const generated = fakeTree(tree);
  assert.notStrictEqual(gitDiff(tree).status, 0, 'git diff outside a work tree is not a pass');
  const noScratch = baseline(tree);
  assert.strictEqual(noScratch.status, 2, `git-baseline without scratch: ${noScratch.stderr}`);
  assert.match(noScratch.stderr, /b1\.scratch is missing/);
  assert.ok(!fs.existsSync(path.join(tree, '.git')), 'no .git without the scratch dir');

  fs.mkdirSync(`${tree}.scratch`);
  const staged = baseline(tree);
  assert.strictEqual(staged.status, 0, `git-baseline: ${staged.stderr}`);
  assert.match(staged.stderr, /git baseline staged in /);
  assert.strictEqual(gitDiff(tree).status, 0, 'git diff passes on the synced files');
  fs.writeFileSync(generated, '// drift\n');
  const drift = gitDiff(tree);
  assert.strictEqual(drift.status, 1, `git diff reports drift: ${drift.stdout}${drift.stderr}`);
  assert.match(drift.stdout, /^\+\/\/ drift$/m);
  const restaged = baseline(tree);
  assert.strictEqual(restaged.status, 0, `git-baseline rerun: ${restaged.stderr}`);
  assert.strictEqual(gitDiff(tree).status, 0, 'a rerun restages the synced files');

  const outer = path.join(tmp, 'baseline-outer');
  fs.mkdirSync(outer, { recursive: true });
  assert.strictEqual(spawnSync('git', ['init', '-q'], { cwd: outer }).status, 0);
  const nested = path.join(outer, 'b2');
  fakeTree(nested);
  fs.mkdirSync(`${nested}.scratch`);
  const inside = baseline(nested);
  assert.strictEqual(inside.status, 2, `git-baseline inside a work tree: ${inside.stderr}`);
  assert.match(inside.stderr, /is inside the git work tree .*; refusing/);
  assert.ok(!fs.existsSync(path.join(nested, '.git')), 'no .git inside another work tree');
}

/**
 * `leftovers` on a copy of the piece script in a fake synced tree, run through
 * a symlink so its logical and physical roots differ: it finds processes whose
 * cwd is in the tree or the scratch dir, not ones that only name those paths
 * in argv, not a sibling session's, and never its own ancestor shell, even
 * with `--stop`. `--stop` KILLs only PIDs still listed after the TERM wait. It
 * exits 2, not 0, when it cannot list working directories.
 */
function assertLeftovers(tmp) {
  const work = path.join(tmp, 'mellifera-work');
  const tree = path.join(work, 's1');
  const scratch = `${tree}.scratch`;
  const sibling = path.join(work, 's10');
  const link = path.join(tmp, 'link-s1');
  fs.mkdirSync(path.join(tree, 'scripts', 'e2e'), { recursive: true });
  fs.mkdirSync(sibling, { recursive: true });
  fs.symlinkSync(tree, link);
  fs.copyFileSync(PIECE, path.join(tree, 'scripts', 'e2e', 'mellifera-distributed-piece.sh'));
  const copy = path.join(link, 'scripts', 'e2e', 'mellifera-distributed-piece.sh');
  const leftovers = (args, env) =>
    spawnSync('bash', [copy, 'leftovers', ...args], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
  // leftovers as the child of a shell whose cwd is the tree, like exec -w DIR;
  // the shell prints its pid, then the leftovers output, then rc=STATUS.
  const underTreeShell = (args, env) =>
    spawnSync(
      'sh',
      [
        '-c',
        'echo "shell=$$"; d=$1 s=$2; shift 2; cd "$d" && bash "$s" leftovers "$@"; ec=$?; echo "rc=$ec"; exit $ec',
        'sh',
        tree,
        copy,
        ...args,
      ],
      { encoding: 'utf8', env: { ...process.env, ...env } },
    );
  const idle = 'setTimeout(() => {}, 300000)';
  // Orphaned through sh so init reaps it; a stopped child of this process would
  // stay a zombie that still answers kill -0.
  const start = (args, cwd, script = idle) => {
    const r = spawnSync(
      'sh',
      [
        '-c',
        'cd "$1" && shift && { "$@" </dev/null >/dev/null 2>&1 & echo $!; }',
        'sh',
        cwd,
        process.execPath,
        '-e',
        script,
        ...args,
      ],
      { encoding: 'utf8' },
    );
    assert.strictEqual(r.status, 0, `start idle process: ${r.stderr}`);
    return Number(r.stdout.trim());
  };
  const alive = pid => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  const listedLines = out => out.split('\n').filter(line => line.includes('\t'));
  const listed = out =>
    listedLines(out)
      .map(line => Number(line.split('\t')[0]))
      .sort((a, b) => a - b);
  const shellPid = out => Number((/^shell=(\d+)$/m.exec(out) || [])[1]);
  // A process in the tree whose TERM handler runs ON_TERM; returns once the
  // handler is installed.
  const startOnTerm = (name, onTerm) => {
    const ready = path.join(tmp, `${name}.ready`);
    const script = `process.on('SIGTERM', () => { ${onTerm} }); require('fs').writeFileSync(${JSON.stringify(ready)}, ''); ${idle}`;
    const pid = start([], tree, script);
    for (let i = 0; i < 100 && !fs.existsSync(ready); i++) {
      spawnSync('sleep', ['0.05']);
    }
    assert.ok(fs.existsSync(ready), `${name} did not start`);
    return pid;
  };
  const pids = [];
  try {
    const noScratch = leftovers([]);
    assert.strictEqual(noScratch.status, 2, `no scratch dir: ${noScratch.stderr}`);
    assert.match(noScratch.stderr, /s1\.scratch is missing/);
    fs.mkdirSync(path.join(scratch, 'metro'), { recursive: true });

    const quiet = underTreeShell([]);
    assert.strictEqual(quiet.status, 0, `ancestor shell in DIR: ${quiet.stdout}${quiet.stderr}`);
    assert.deepStrictEqual(listedLines(quiet.stdout), [], 'the ancestor shell is not listed');

    const inTree = start([], tree);
    const inScratch = start([], path.join(scratch, 'metro'));
    const namesPaths = start([path.join(tree, 'log'), path.join(scratch, 'x.log'), tree], tmp);
    const other = start([], sibling);
    pids.push(inTree, inScratch, namesPaths, other);
    const ours = [inTree, inScratch].sort((a, b) => a - b);

    const found = leftovers([]);
    assert.strictEqual(found.status, 1, `leftovers found: ${found.stderr}`);
    assert.deepStrictEqual(listed(found.stdout), ours, found.stdout);

    const stopped = underTreeShell(['--stop'], { RNFB_SPILL_STOP_WAIT_S: '5' });
    assert.strictEqual(stopped.status, 0, `--stop: ${stopped.stdout}${stopped.stderr}`);
    assert.match(stopped.stdout, /^rc=0$/m, 'the ancestor shell survived --stop');
    assert.ok(!listed(stopped.stdout).includes(shellPid(stopped.stdout)), stopped.stdout);
    assert.match(stopped.stderr, /stopped 2 process\(es\)/);
    assert.ok(!alive(inTree) && !alive(inScratch), 'leftovers --stop stops our processes');
    assert.ok(alive(namesPaths), 'a process that only names the paths in argv is left alone');
    assert.ok(alive(other), 'leftovers --stop leaves a sibling session alone');

    const clear = leftovers([]);
    assert.strictEqual(clear.status, 0, `after --stop: ${clear.stdout}${clear.stderr}`);
    assert.strictEqual(clear.stdout, '');

    const mover = startOnTerm('mover', `process.chdir(${JSON.stringify(tmp)})`);
    pids.push(mover);
    const moved = underTreeShell(['--stop'], { RNFB_SPILL_STOP_WAIT_S: '1' });
    assert.strictEqual(
      moved.status,
      0,
      `--stop, cwd left the tree: ${moved.stdout}${moved.stderr}`,
    );
    assert.deepStrictEqual(listed(moved.stdout), [mover], moved.stdout);
    assert.ok(alive(mover), 'KILL skips a PID no longer listed in the tree after TERM');

    if (!fs.existsSync('/proc/self')) {
      const realLsof = spawnSync('sh', ['-c', 'command -v lsof || echo /usr/sbin/lsof'], {
        encoding: 'utf8',
      }).stdout.trim();
      const count = path.join(tmp, 'lsof-calls');
      const lsofOnce = path.join(tmp, 'lsof-once');
      fs.writeFileSync(
        lsofOnce,
        `#!/usr/bin/env bash\nn=$(cat ${JSON.stringify(count)} 2>/dev/null || echo 0)\necho $((n + 1)) > ${JSON.stringify(count)}\n[[ "$n" -eq 0 ]] || exit 1\nexec ${JSON.stringify(realLsof)} "$@"\n`,
      );
      fs.chmodSync(lsofOnce, 0o755);
      const stubborn = startOnTerm('stubborn', '');
      pids.push(stubborn);
      const recheck = underTreeShell(['--stop'], {
        RNFB_SPILL_STOP_WAIT_S: '1',
        RNFB_SPILL_LSOF: lsofOnce,
      });
      assert.strictEqual(recheck.status, 2, `recheck fails: ${recheck.stdout}${recheck.stderr}`);
      assert.match(recheck.stderr, /could not recheck before KILL; do not remove/);
      assert.ok(alive(stubborn), 'no KILL when the recheck before KILL fails');
      process.kill(stubborn, 'SIGKILL');

      const fakeLsof = (name, body) => {
        const file = path.join(tmp, name);
        fs.writeFileSync(file, `#!/usr/bin/env bash\n${body}\n`);
        fs.chmodSync(file, 0o755);
        return file;
      };
      for (const [label, lsof] of [
        ['missing lsof', path.join(tmp, 'no-such-lsof')],
        ['failing lsof', fakeLsof('lsof-fails', 'exit 1')],
        ['lsof without this shell', fakeLsof('lsof-empty', 'exit 0')],
      ]) {
        const r = leftovers([], { RNFB_SPILL_LSOF: lsof });
        assert.strictEqual(r.status, 2, `${label}: exit ${r.status}: ${r.stderr}`);
        assert.match(r.stderr, /could not check for processes; do not remove/, label);
        assert.strictEqual(r.stdout, '', label);
      }
    }

    const misplaced = piece(['android', '--placement=host', '--stop']);
    assert.strictEqual(misplaced.status, 2, '--stop is only for leftovers');
  } finally {
    for (const pid of pids) {
      if (alive(pid)) {
        process.kill(pid, 'SIGKILL');
      }
    }
  }
}

main();
