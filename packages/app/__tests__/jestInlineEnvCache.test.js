const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const slotLib = path.join(repoRoot, 'scripts/e2e/lib/e2e-slot-env.sh');
const resourceLib = path.join(repoRoot, 'scripts/e2e/lib/e2e-resource-env.sh');
const clearSlotEnv = path.join(repoRoot, 'scripts/e2e/clear-slot-env.sh');
const startPackager = path.join(repoRoot, 'scripts/e2e/start-packager.sh');
const rootPkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const detoxJestConfig = fs.readFileSync(path.join(repoRoot, 'tests/e2e/jest.config.js'), 'utf8');
const testsBabel = fs.readFileSync(path.join(repoRoot, 'tests/.babelrc'), 'utf8');
const macosBabel = fs.readFileSync(path.join(repoRoot, 'tests-macos/.babelrc'), 'utf8');

function cleanEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith('RNFB_') ||
      key.startsWith('JET_') ||
      key === 'RCT_METRO_PORT' ||
      key === 'ANDROID_SERIAL' ||
      key === 'AVD_NAME' ||
      key === 'ORG_GRADLE_PROJECT_reactNativeDevServerPort' ||
      key === 'SIMCTL_CHILD_RCT_METRO_PORT'
    ) {
      delete env[key];
    }
  }
  return env;
}

function bashSnippet(body, extraEnv = {}) {
  return execFileSync(
    'bash',
    [
      '-c',
      `set -euo pipefail
source ${JSON.stringify(slotLib)}
source ${JSON.stringify(resourceLib)}
${body}`,
    ],
    { encoding: 'utf8', cwd: repoRoot, env: { ...cleanEnv(), ...extraEnv } },
  );
}

describe('e2e_sanitize_serial_env leftover slot Metro', function () {
  it('without sanitize, leftover android slot-0 metro stays 12007 (negative)', function () {
    const out = bashSnippet(
      ['echo "metro=$(e2e_resolve_metro android)"', 'echo "rct=${RCT_METRO_PORT:-unset}"'].join(
        '\n',
      ),
      {
        RNFB_ANDROID_METRO_PORT: '12007',
        RCT_METRO_PORT: '12007',
        RNFB_METRO_PORT: '12007',
      },
    );
    expect(out).toMatch(/metro=12007/);
    expect(out).toMatch(/rct=12007/);
  });

  it('with sanitize and no slot, serial metro is 8081 (positive)', function () {
    const out = bashSnippet(
      [
        'e2e_sanitize_serial_env',
        'echo "metro=$(e2e_resolve_metro android)"',
        'echo "rct=${RCT_METRO_PORT:-unset}"',
        'echo "avd=$(e2e_resolve_android_avd)"',
        'echo "sim=$(e2e_resolve_ios_simulator)"',
        'echo "macos=${RNFB_MACOS_PRODUCT_NAME:-io.invertase.testing}"',
        'echo "jet=$(e2e_resolve_jet android)"',
        'echo "fs=$(e2e_resolve_emulator_port android firestore)"',
        'echo "console=${RNFB_ANDROID_CONSOLE_PORT:-unset}"',
        'echo "serial=${ANDROID_SERIAL:-unset}"',
      ].join('\n'),
      {
        RNFB_ANDROID_METRO_PORT: '12007',
        RCT_METRO_PORT: '12007',
        RNFB_METRO_PORT: '12007',
        RNFB_ANDROID_JET_PORT: '12010',
        JET_REMOTE_PORT: '12010',
        RNFB_ANDROID_EMULATOR_FIRESTORE_PORT: '12000',
        RNFB_ANDROID_AVD: 'TestingAVD-0',
        RNFB_IOS_SIMULATOR: 'RNFB E2E iOS slot-0',
        RNFB_MACOS_PRODUCT_NAME: 'io.invertase.testing.s0',
      },
    );
    expect(out).toMatch(/metro=8081/);
    expect(out).toMatch(/rct=unset/);
    expect(out).toMatch(/avd=TestingAVD/);
    expect(out).not.toMatch(/avd=TestingAVD-0/);
    expect(out).toMatch(/sim=iPhone 17/);
    expect(out).toMatch(/macos=io\.invertase\.testing$/m);
    expect(out).toMatch(/jet=8090/);
    expect(out).toMatch(/fs=8080/);
    expect(out).toMatch(/console=5554/);
    expect(out).toMatch(/serial=emulator-5554/);
  });

  it('without sanitize, leftover FreePortFinder console stays 16222 (negative)', function () {
    const out = bashSnippet(
      [
        'echo "console=${RNFB_ANDROID_CONSOLE_PORT:-unset}"',
        'echo "serial=${ANDROID_SERIAL:-unset}"',
      ].join('\n'),
      {
        RNFB_ANDROID_CONSOLE_PORT: '16222',
        ANDROID_SERIAL: 'emulator-16222',
      },
    );
    expect(out).toMatch(/console=16222/);
    expect(out).toMatch(/serial=emulator-16222/);
  });

  it('does not strip slotted env when RNFB_E2E_SLOT is set', function () {
    const out = bashSnippet(
      `
e2e_sanitize_serial_env
echo "metro=$(e2e_resolve_metro android)"
`,
      {
        RNFB_E2E_SLOT: '0',
        RNFB_E2E_HOST_SLOT: '0',
        RNFB_ANDROID_METRO_PORT: '12007',
        RCT_METRO_PORT: '12007',
      },
    );
    expect(out).toMatch(/metro=12007/);
  });

  it('does not rewrite slotted android console when RNFB_E2E_SLOT is set', function () {
    const out = bashSnippet(
      [
        'e2e_sanitize_serial_env',
        'echo "console=${RNFB_ANDROID_CONSOLE_PORT:-unset}"',
        'echo "serial=${ANDROID_SERIAL:-unset}"',
      ].join('\n'),
      {
        RNFB_E2E_SLOT: '0',
        RNFB_E2E_HOST_SLOT: '0',
        RNFB_ANDROID_CONSOLE_PORT: '5556',
        ANDROID_SERIAL: 'emulator-5556',
      },
    );
    expect(out).toMatch(/console=5556/);
    expect(out).toMatch(/serial=emulator-5556/);
    expect(out).not.toMatch(/console=5554/);
  });
});

describe('yarn tests:e2e:clear-slot-env', function () {
  it('prints unset for leftover RNFB_E2E_SLOT and RCT_METRO_PORT', function () {
    const out = execFileSync('bash', [clearSlotEnv], {
      encoding: 'utf8',
      cwd: repoRoot,
    });
    expect(out).toMatch(/^unset RNFB_E2E_SLOT$/m);
    expect(out).toMatch(/^unset RCT_METRO_PORT$/m);
    expect(out).toMatch(/^unset RNFB_ANDROID_METRO_PORT$/m);
    expect(out).not.toMatch(/unset RNFB_E2E_DEBUG/);
    expect(rootPkg.scripts['tests:e2e:clear-slot-env']).toMatch(/clear-slot-env\.sh/);
  });
});

describe('e2e_assert_android_apk_metro_port', function () {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-apk-metro-'));
  const xmlPath = path.join(tmpDir, 'gradleResValues.xml');

  afterAll(function () {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writePort(port) {
    fs.writeFileSync(
      xmlPath,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <integer name="react_native_dev_server_port">${port}</integer>
</resources>
`,
    );
  }

  it('fails serial expected 8081 when APK is slot-baked 12007 (negative)', function () {
    writePort(12007);
    let status = 0;
    let err = '';
    try {
      bashSnippet('e2e_sanitize_serial_env\ne2e_assert_android_apk_metro_port', {
        RNFB_ANDROID_APK_METRO_RES: xmlPath,
      });
    } catch (e) {
      status = e.status;
      err = `${e.stdout || ''}${e.stderr || ''}${e.message || ''}`;
    }
    expect(status).not.toBe(0);
    expect(err).toMatch(/react_native_dev_server_port=12007/);
    expect(err).toMatch(/8081/);
  });

  it('passes serial expected 8081 when APK is 8081 (positive)', function () {
    writePort(8081);
    const out = bashSnippet('e2e_sanitize_serial_env\ne2e_assert_android_apk_metro_port', {
      RNFB_ANDROID_APK_METRO_RES: xmlPath,
    });
    expect(out).toMatch(/android APK Metro port 8081 matches active 8081/);
  });

  it('passes slotted expected 12007 when APK is 12007 (positive slot)', function () {
    writePort(12007);
    const out = bashSnippet('e2e_sanitize_serial_env\ne2e_assert_android_apk_metro_port', {
      RNFB_E2E_SLOT: '0',
      RNFB_ANDROID_METRO_PORT: '12007',
      RNFB_ANDROID_APK_METRO_RES: xmlPath,
    });
    expect(out).toMatch(/android APK Metro port 12007 matches active 12007/);
  });
});

describe('start-packager.sh serial sanitize', function () {
  const src = fs.readFileSync(startPackager, 'utf8');

  it('sanitizes serial env before reading RCT_METRO_PORT', function () {
    expect(src).toMatch(/e2e_sanitize_serial_env/);
    const sanitizeAt = src.indexOf('e2e_sanitize_serial_env');
    const portAt = src.indexOf('PORT="${RCT_METRO_PORT:-');
    expect(sanitizeAt).toBeGreaterThan(-1);
    expect(portAt).toBeGreaterThan(sanitizeAt);
  });
});

describe('Detox Jest transform cache (UNI-jest-env-cache)', function () {
  it('tests/.babelrc and tests-macos/.babelrc inline the same RNFB Metro ports', function () {
    expect(testsBabel).toMatch(/transform-inline-environment-variables/);
    expect(testsBabel).toMatch(/RNFB_ANDROID_METRO_PORT/);
    expect(macosBabel).toMatch(/transform-inline-environment-variables/);
    expect(macosBabel).toMatch(/RNFB_ANDROID_METRO_PORT/);
  });

  it('tests/e2e/jest.config.js disables Jest transform cache', function () {
    expect(detoxJestConfig).toMatch(/cache:\s*false/);
  });

  it('tests/e2e/jest.config.js forceExits so :test-cover cannot hang after FAIL', function () {
    expect(detoxJestConfig).toMatch(/forceExit:\s*true/);
  });

  it('jet fatal_disconnect hard-exits so Detox Jest cannot wait testTimeout after Jet death', function () {
    const jetCli = fs.readFileSync(
      path.join(repoRoot, 'tests/node_modules/jet/lib/commonjs/cli.js'),
      'utf8',
    );
    // Positive: grace-expired and immediate fatal paths must process.exit(1).
    expect(jetCli).toMatch(
      /fatal_disconnect code=\$\{code\} grace_expired_ms=\$\{graceMs\}[\s\S]{0,400}?process\.exit\(1\)/,
    );
    expect(jetCli).toMatch(
      /fatal_disconnect code=\$\{code\} reason=[\s\S]{0,300}?process\.exit\(1\)/,
    );
    // Negative: exitCode + cleanup without process.exit left Jet alive for 1h (Functions OOB).
    expect(jetCli).not.toMatch(
      /grace_expired_ms=\$\{graceMs\}`\);\s*console\.error\(`\[jet-ws\] RETRYABLE_DISCONNECT[\s\S]*?process\.exitCode = 1;\s*cleanup\(\);\s*\}, graceMs\)/,
    );
  });

  it('Apple :build scripts compile only (no nested pod:install)', function () {
    expect(rootPkg.scripts['tests:ios:build']).not.toMatch(/pod:install|pod install/);
    expect(rootPkg.scripts['tests:macos:build']).not.toMatch(/pod:install|pod install/);
    expect(rootPkg.scripts['tests:ios:pod:install']).toMatch(/pod install/);
    expect(rootPkg.scripts['tests:macos:pod:install']).toMatch(/pod install/);
  });

  it('babel-jest cache key ignores RNFB_ANDROID_METRO_PORT (stale :12007 poison)', function () {
    const babelJest = require('babel-jest');
    const createTransformer =
      babelJest.createTransformer || (babelJest.default && babelJest.default.createTransformer);
    expect(typeof createTransformer).toBe('function');

    const transformer = createTransformer({
      babelrc: false,
      configFile: false,
      presets: [],
      plugins: [
        [
          require.resolve('babel-plugin-transform-inline-environment-variables', {
            paths: [path.join(repoRoot, 'tests')],
          }),
          { include: ['RNFB_ANDROID_METRO_PORT'] },
        ],
      ],
    });

    const src = 'module.exports = process.env.RNFB_ANDROID_METRO_PORT;';
    const filename = path.join(os.tmpdir(), 'rnfb-inline-env-fixture.js');
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-jest-cache-'));
    const options = {
      config: {
        cwd: repoRoot,
        rootDir: repoRoot,
        cache: true,
        cacheDirectory: cacheDir,
        transform: [],
      },
      configString: '{"cache":true}',
      instrument: false,
      cacheFS: new Map(),
    };

    const original = process.env.RNFB_ANDROID_METRO_PORT;
    try {
      process.env.RNFB_ANDROID_METRO_PORT = '12007';
      const compiledSlot = transformer.process(src, filename, options).code;
      const keySlot = transformer.getCacheKey(src, filename, options);

      delete process.env.RNFB_ANDROID_METRO_PORT;
      const compiledSerial = transformer.process(src, filename, options).code;
      const keySerial = transformer.getCacheKey(src, filename, options);

      expect(compiledSlot).toMatch(/12007/);
      expect(compiledSerial).not.toMatch(/12007/);
      expect(keySlot).toEqual(keySerial);
    } finally {
      if (original === undefined) {
        delete process.env.RNFB_ANDROID_METRO_PORT;
      } else {
        process.env.RNFB_ANDROID_METRO_PORT = original;
      }
    }
  });
});
