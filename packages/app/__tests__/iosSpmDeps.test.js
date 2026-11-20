const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, '.github/workflows/scripts/check-ios-spm-deps.js');
const updateScriptPath = path.join(repoRoot, 'scripts/update-firebase-sdk-versions.sh');
const realPackageJson = path.join(repoRoot, 'packages/app/package.json');
const scriptsDir = path.join(repoRoot, '.github/workflows/scripts');

const {
  assertPackageSwiftVersion,
  checkSpmDeps,
  fetchText,
  packageSwiftUrl,
  parseFirebaseSpmDeps,
  parseFirebaseSpmRanges,
  readIosSpmConfig,
} = require('../../../.github/workflows/scripts/check-ios-spm-deps.js');

const UTILITIES_URL = 'https://github.com/google/GoogleUtilities.git';
const APP_CHECK_URL = 'https://github.com/google/app-check.git';

function firebasePackageSwift({
  utilities = `    .package(\n      url: "${UTILITIES_URL}",\n      "8.1.4" ..< "9.0.0"\n    ),`,
  appCheck = '  return .package(url: appCheckURL, "12.0.0" ..< "13.0.0")',
} = {}) {
  return `// swift-tools-version:6.0
import PackageDescription

let package = Package(
  name: "Firebase",
  dependencies: [
    .package(
      url: "https://github.com/google/promises.git",
      "2.4.0" ..< "3.0.0"
    ),
${utilities}
    appCheckDependency(),
  ],
  targets: []
)

func appCheckDependency() -> Package.Dependency {
  let appCheckURL = "${APP_CHECK_URL}"

  if let localPath = Context.environment["FIREBASE_APP_CHECK_LOCAL_PATH"] {
    return .package(path: localPath)
  }

  if let branch = Context.environment["FIREBASE_APP_CHECK_BRANCH"] {
    return .package(url: appCheckURL, branch: branch)
  }

${appCheck}
}
`;
}

function packageJson({
  firebase = '13.1.1',
  spmDeps = { appCheck: '12.0.0', googleUtilities: '8.1.4' },
  extra = {},
} = {}) {
  return JSON.stringify(
    { name: 'app', sdkVersions: { ios: { firebase, spmDeps, iosTarget: '15.0' } }, ...extra },
    null,
    2,
  );
}

describe('check-ios-spm-deps', function () {
  describe('parseFirebaseSpmDeps', function () {
    it('reads the inline GoogleUtilities range and the app-check helper range', function () {
      expect(parseFirebaseSpmDeps(firebasePackageSwift())).toEqual({
        appCheck: '12.0.0',
        googleUtilities: '8.1.4',
      });
      expect(parseFirebaseSpmRanges(firebasePackageSwift())).toEqual({
        appCheck: { lower: '12.0.0', upper: '13.0.0' },
        googleUtilities: { lower: '8.1.4', upper: '9.0.0' },
      });
    });

    it('accepts from:, .upToNextMajor(from:), name: and urls without .git', function () {
      const source = firebasePackageSwift({
        utilities:
          '    .package(name: "GoogleUtilities", url: "https://github.com/google/GoogleUtilities", from: "8.2.0"),',
        appCheck: '  return .package(url: appCheckURL, .upToNextMajor(from: "12.3.0"))',
      });
      expect(parseFirebaseSpmRanges(source)).toEqual({
        appCheck: { lower: '12.3.0', upper: '13.0.0' },
        googleUtilities: { lower: '8.2.0', upper: '9.0.0' },
      });
    });

    it('accepts an inline app-check url', function () {
      const source = firebasePackageSwift({
        appCheck: `  return .package(url: "${APP_CHECK_URL}", "11.0.0" ..< "12.0.0")`,
      });
      expect(parseFirebaseSpmDeps(source).appCheck).toBe('11.0.0');
    });

    it('ignores branch: and path: declarations and commented-out ranges', function () {
      const source = firebasePackageSwift({
        utilities: `    // .package(url: "${UTILITIES_URL}", "7.0.0" ..< "8.0.0"),
    /* .package(url: "${UTILITIES_URL}", "6.0.0" ..< "7.0.0"), */
    .package(url: "${UTILITIES_URL}", "8.1.4" ..< "9.0.0"),`,
      });
      expect(parseFirebaseSpmDeps(source)).toEqual({
        appCheck: '12.0.0',
        googleUtilities: '8.1.4',
      });
    });

    it('does not match repositories whose name only ends with a tracked name', function () {
      const source = firebasePackageSwift({
        utilities: `    .package(url: "${UTILITIES_URL}", "8.1.4" ..< "9.0.0"),
    .package(url: "https://github.com/example/not-app-check.git", "1.0.0" ..< "2.0.0"),`,
      });
      expect(parseFirebaseSpmDeps(source).appCheck).toBe('12.0.0');
    });

    it('throws when a package has no versioned declaration', function () {
      expect(() => parseFirebaseSpmDeps(firebasePackageSwift({ utilities: '' }))).toThrow(
        /GoogleUtilities\.git.*found 0/,
      );
      expect(() => parseFirebaseSpmDeps(firebasePackageSwift({ appCheck: '' }))).toThrow(
        /app-check\.git.*found 0/,
      );
    });

    it('throws when the url constant is not defined', function () {
      const source = firebasePackageSwift().replace(/let appCheckURL = "[^"]*"/, '');
      expect(() => parseFirebaseSpmDeps(source)).toThrow(/app-check\.git.*found 0/);
    });

    it('throws when a url constant is defined with different values', function () {
      const source = `${firebasePackageSwift()}
func other() {
  let appCheckURL = "https://github.com/example/fork.git"
}
`;
      expect(() => parseFirebaseSpmDeps(source)).toThrow(/appCheckURL.*more than one value/);
    });

    it('accepts a url constant repeated with the same value', function () {
      const source = `${firebasePackageSwift()}
func other() {
  let appCheckURL = "${APP_CHECK_URL}"
}
`;
      expect(parseFirebaseSpmDeps(source).appCheck).toBe('12.0.0');
    });

    it('ignores a url constant with conflicting values for an untracked package', function () {
      const source = `${firebasePackageSwift()}
func a() -> Package.Dependency {
  let url = "https://github.com/example/one.git"
  return .package(url: url, "1.0.0" ..< "2.0.0")
}
func b() -> Package.Dependency {
  let url = "https://github.com/example/two.git"
  return .package(url: url, "1.0.0" ..< "2.0.0")
}
`;
      expect(parseFirebaseSpmDeps(source)).toEqual({
        appCheck: '12.0.0',
        googleUtilities: '8.1.4',
      });
    });

    it('throws when a package is declared more than once', function () {
      const source = firebasePackageSwift({
        utilities: `    .package(url: "${UTILITIES_URL}", "8.1.4" ..< "9.0.0"),
    .package(url: "${UTILITIES_URL}", "9.0.0" ..< "10.0.0"),`,
      });
      expect(() => parseFirebaseSpmDeps(source)).toThrow(/GoogleUtilities\.git.*found 2/);
    });
  });

  describe('assertPackageSwiftVersion', function () {
    const declared = version => `let firebaseVersion = "${version}"\n${firebasePackageSwift()}`;

    it('accepts a matching or absent firebaseVersion', function () {
      expect(() => assertPackageSwiftVersion(declared('13.1.1'), '13.1.1')).not.toThrow();
      expect(() => assertPackageSwiftVersion(firebasePackageSwift(), '13.1.1')).not.toThrow();
    });

    it('throws when Package.swift is for another version', function () {
      expect(() => assertPackageSwiftVersion(declared('13.1.1'), '13.2.0')).toThrow(
        /for firebase-ios-sdk 13\.1\.1, expected 13\.2\.0/,
      );
    });

    it('ignores a commented-out firebaseVersion', function () {
      const source = `// let firebaseVersion = "1.0.0"\n${firebasePackageSwift()}`;
      expect(() => assertPackageSwiftVersion(source, '13.1.1')).not.toThrow();
    });

    it('fails the check when Package.swift is for another version', function () {
      expect(() =>
        checkSpmDeps({ packageJsonSource: packageJson(), packageSwiftSource: declared('13.0.0') }),
      ).toThrow(/expected 13\.1\.1/);
    });
  });

  describe('readIosSpmConfig', function () {
    it('reads the Firebase version and spmDeps', function () {
      expect(readIosSpmConfig(packageJson())).toEqual({
        firebase: '13.1.1',
        spmDeps: { appCheck: '12.0.0', googleUtilities: '8.1.4' },
      });
    });

    it('throws when sdkVersions.ios.firebase is missing', function () {
      expect(() => readIosSpmConfig(packageJson({ firebase: '' }))).toThrow(
        /sdkVersions\.ios\.firebase/,
      );
    });

    it('throws when an spmDeps entry is missing or not x.y.z', function () {
      expect(() => readIosSpmConfig(packageJson({ spmDeps: { appCheck: '12.0.0' } }))).toThrow(
        /spmDeps\.googleUtilities/,
      );
      expect(() =>
        readIosSpmConfig(packageJson({ spmDeps: { appCheck: '12', googleUtilities: '8.1.4' } })),
      ).toThrow(/spmDeps\.appCheck/);
    });
  });

  describe('checkSpmDeps', function () {
    function check(spmDeps, swiftOptions) {
      return checkSpmDeps({
        packageJsonSource: packageJson({ spmDeps }),
        packageSwiftSource: firebasePackageSwift(swiftOptions),
      });
    }

    it('passes when the ranges overlap', function () {
      const result = check({ appCheck: '12.0.0', googleUtilities: '8.1.4' });
      expect(result.ok).toBe(true);
      expect(result.message).toContain('13.1.1');
      expect(result.message).toContain(
        'googleUtilities 8.1.4 ..< 9.0.0 (Firebase 8.1.4 ..< 9.0.0)',
      );
    });

    it('passes when a lower bound differs only within the major', function () {
      expect(check({ appCheck: '12.1.0', googleUtilities: '8.0.0' }).ok).toBe(true);
    });

    it('fails naming every package whose major differs', function () {
      const result = check({ appCheck: '11.2.0', googleUtilities: '9.0.0' });
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/appCheck 11\.2\.0 \.\.< 12\.0\.0 \(Firebase 12\.0\.0/);
      expect(result.message).toMatch(/googleUtilities 9\.0\.0 \.\.< 10\.0\.0 \(Firebase 8\.1\.4/);
    });

    it('fails on a single package mismatch', function () {
      const result = check({ appCheck: '12.0.0', googleUtilities: '7.13.0' });
      expect(result.ok).toBe(false);
      expect(result.message).not.toContain('appCheck');
    });

    it('fails when Firebase narrows the range below the RNFB lower bound', function () {
      const result = check(
        { appCheck: '12.4.0', googleUtilities: '8.1.4' },
        { appCheck: '  return .package(url: appCheckURL, "12.0.0" ..< "12.3.0")' },
      );
      expect(result.ok).toBe(false);
      expect(result.message).toContain('appCheck 12.4.0');
    });

    it('passes a later major inside a cross-major Firebase range', function () {
      const swift = {
        utilities: `    .package(url: "${UTILITIES_URL}", "8.1.4" ..< "10.0.0"),`,
      };
      expect(check({ appCheck: '12.0.0', googleUtilities: '9.0.0' }, swift).ok).toBe(true);
      expect(check({ appCheck: '12.0.0', googleUtilities: '10.0.0' }, swift).ok).toBe(false);
    });

    it('throws when a Firebase bound is not x.y.z', function () {
      expect(() =>
        check(
          { appCheck: '12.0.0', googleUtilities: '8.1.4' },
          { utilities: `    .package(url: "${UTILITIES_URL}", "8.1" ..< "9.0.0"),` },
        ),
      ).toThrow(/"8\.1" is not an x\.y\.z version/);
    });
  });

  describe('packageSwiftUrl', function () {
    it('points at the tagged firebase-ios-sdk Package.swift', function () {
      expect(packageSwiftUrl('13.1.1')).toBe(
        'https://raw.githubusercontent.com/firebase/firebase-ios-sdk/13.1.1/Package.swift',
      );
    });
  });

  describe('fetchText', function () {
    const https = require('https');
    const { EventEmitter } = require('events');

    function respond(statusCode, { body = '', location } = {}) {
      return callback => {
        const req = new EventEmitter();
        req.destroy = error => req.emit('error', error);
        process.nextTick(() => {
          const res = new EventEmitter();
          res.statusCode = statusCode;
          res.headers = location ? { location } : {};
          res.resume = () => {};
          res.setEncoding = () => {};
          callback(res);
          process.nextTick(() => {
            res.emit('data', body);
            res.emit('end');
          });
        });
        return req;
      };
    }

    function mockResponses(...responses) {
      const spy = jest.spyOn(https, 'get').mockImplementation(() => {
        throw new Error('unexpected https.get');
      });
      for (const response of responses) {
        spy.mockImplementationOnce((_url, callback) => response(callback));
      }
      return spy;
    }

    afterEach(function () {
      jest.restoreAllMocks();
    });

    it('retries 5xx and 429 responses', async function () {
      const spy = mockResponses(respond(503), respond(429), respond(200, { body: 'ok' }));
      await expect(fetchText('https://example.test/a', { retryDelayMs: 0 })).resolves.toBe('ok');
      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('does not retry a 404', async function () {
      const spy = mockResponses(respond(404), respond(200, { body: 'ok' }));
      await expect(fetchText('https://example.test/a', { retryDelayMs: 0 })).rejects.toThrow(
        /HTTP 404/,
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('follows redirects with a fresh budget per attempt', async function () {
      const spy = mockResponses(
        respond(302, { location: '/b' }),
        respond(502),
        respond(302, { location: 'https://example.test/c' }),
        respond(200, { body: 'ok' }),
      );
      await expect(
        fetchText('https://example.test/a', { maxRedirects: 1, retryDelayMs: 0 }),
      ).resolves.toBe('ok');
      expect(spy.mock.calls.map(call => call[0])).toEqual([
        'https://example.test/a',
        'https://example.test/b',
        'https://example.test/a',
        'https://example.test/c',
      ]);
    });

    it('fails after too many redirects', async function () {
      mockResponses(respond(302, { location: '/a' }), respond(302, { location: '/a' }));
      await expect(fetchText('https://example.test/a', { maxRedirects: 1 })).rejects.toThrow(
        /too many redirects/,
      );
    });

    it('gives up after the last attempt on request errors', async function () {
      const failing = () => {
        const req = new EventEmitter();
        process.nextTick(() => req.emit('error', new Error('ECONNRESET')));
        return req;
      };
      const spy = mockResponses(failing, failing);
      await expect(
        fetchText('https://example.test/a', { attempts: 2, retryDelayMs: 0 }),
      ).rejects.toThrow(/ECONNRESET/);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('times out a stalled request', async function () {
      mockResponses(() => {
        const req = new EventEmitter();
        req.destroy = error => req.emit('error', error);
        return req;
      });
      await expect(
        fetchText('https://example.test/a', { attempts: 1, timeoutMs: 20 }),
      ).rejects.toThrow(/timed out after 20ms/);
    });

    it('applies the timeout across all attempts', async function () {
      const stalled = () => {
        const req = new EventEmitter();
        req.destroy = () => {};
        return req;
      };
      const spy = mockResponses(respond(503), stalled, stalled);
      await expect(
        fetchText('https://example.test/a', { timeoutMs: 50, retryDelayMs: 0 }),
      ).rejects.toThrow(/timed out after 50ms/);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('rejects instead of throwing on a malformed redirect', async function () {
      mockResponses(respond(302, { location: 'http://[bad' }));
      await expect(fetchText('https://example.test/a', { retryDelayMs: 0 })).rejects.toThrow(
        /Invalid URL/,
      );
    });

    it('ignores errors from a request left behind by a redirect', async function () {
      let first;
      const spy = jest.spyOn(https, 'get').mockImplementation(() => {
        throw new Error('unexpected https.get');
      });
      spy.mockImplementationOnce((_url, callback) => {
        first = respond(302, { location: '/b' })(callback);
        return first;
      });
      spy.mockImplementationOnce((_url, callback) => {
        const req = respond(200, { body: 'ok' })(callback);
        process.nextTick(() => first.emit('error', new Error('stale socket')));
        return req;
      });
      await expect(fetchText('https://example.test/a', { retryDelayMs: 0 })).resolves.toBe('ok');
    });
  });

  describe('CLI', function () {
    let tmpDir;

    beforeEach(function () {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-spm-deps-'));
    });

    afterEach(function () {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function writeInputs(jsonSource, swiftSource) {
      const jsonPath = path.join(tmpDir, 'package.json');
      const swiftPath = path.join(tmpDir, 'Package.swift');
      fs.writeFileSync(jsonPath, jsonSource);
      fs.writeFileSync(swiftPath, swiftSource);
      return { jsonPath, swiftPath };
    }

    function run(args) {
      return spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8' });
    }

    it('exits 0 with a one-line OK message when the ranges overlap', function () {
      const { jsonPath, swiftPath } = writeInputs(packageJson(), firebasePackageSwift());
      const result = run([jsonPath, swiftPath]);
      expect(result.status).toBe(0);
      expect(result.stdout.trim().split('\n')).toHaveLength(1);
      expect(result.stdout).toContain('OK');
    });

    it('exits 1 when a range does not overlap', function () {
      const { jsonPath, swiftPath } = writeInputs(
        packageJson({ spmDeps: { appCheck: '11.0.0', googleUtilities: '8.1.4' } }),
        firebasePackageSwift(),
      );
      const result = run([jsonPath, swiftPath]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/do not overlap.*appCheck/);
    });

    it('exits 1 when Package.swift cannot be parsed', function () {
      const { jsonPath, swiftPath } = writeInputs(packageJson(), 'let package = Package()');
      const result = run([jsonPath, swiftPath]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/check failed: Expected exactly one/);
    });

    it('exits 1 when an input file cannot be read', function () {
      const result = run([path.join(tmpDir, 'missing.json'), path.join(tmpDir, 'missing.swift')]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/check failed/);
    });

    it('--bounds prints the Firebase lower bounds as JSON', function () {
      const { swiftPath } = writeInputs('{}', firebasePackageSwift());
      const result = run(['--bounds', '13.1.1', swiftPath]);
      expect(result.status).toBe(0);
      expect(JSON.parse(result.stdout)).toEqual({ appCheck: '12.0.0', googleUtilities: '8.1.4' });
    });

    it('--bounds exits 1 when Package.swift is for another version', function () {
      const { swiftPath } = writeInputs(
        '{}',
        `let firebaseVersion = "13.1.1"\n${firebasePackageSwift()}`,
      );
      const result = run(['--bounds', '13.2.0', swiftPath]);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/expected 13\.2\.0/);
    });

    it('--bounds exits 1 without a version or on a parse failure', function () {
      expect(run(['--bounds']).status).toBe(1);
      const { swiftPath } = writeInputs('{}', 'let package = Package()');
      const result = run(['--bounds', '13.1.1', swiftPath]);
      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
    });
  });

  describe('update-firebase-sdk-versions.sh --apply', function () {
    const VERSIONS = {
      'firebase-bom': '35.2.0',
      'firebase-appdistribution-api': '16.0.0-beta17',
      'firebase-appdistribution': '16.0.0-beta17',
      'firebase-appdistribution-gradle': '5.2.1',
      'firebase-crashlytics-gradle': '3.0.7',
      'perf-plugin': '2.0.2',
    };
    let tmpDir;
    let fakeRepo;

    function writeFile(relativePath, contents) {
      const target = path.join(fakeRepo, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents);
    }

    function writeSnapshot(dir, iosVersion, packageSwiftSource) {
      fs.mkdirSync(dir, { recursive: true });
      const rows = Object.entries(VERSIONS)
        .map(([artifact, version]) => `<td>com.google.firebase:${artifact}</td><td>${version}</td>`)
        .join('\n');
      fs.writeFileSync(
        path.join(dir, 'android.html'),
        `<table>\n${rows}\n<td>com.google.gms:google-services</td><td>4.4.4</td>\n</table>`,
      );
      fs.writeFileSync(path.join(dir, 'ios.html'), `<a name="${iosVersion}"></a>`);
      fs.writeFileSync(path.join(dir, 'js.html'), '<a name="13.3.0"></a>');
      if (packageSwiftSource !== undefined) {
        fs.writeFileSync(path.join(dir, 'Package.swift'), packageSwiftSource);
      }
    }

    beforeEach(function () {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-sdk-update-'));
      fakeRepo = path.join(tmpDir, 'repo');
      writeFile('scripts/update-firebase-sdk-versions.sh', fs.readFileSync(updateScriptPath));
      for (const file of ['check-ios-spm-deps.js', 'check-ios-probe-sdk-pin.js']) {
        writeFile(
          `.github/workflows/scripts/${file}`,
          fs.readFileSync(path.join(scriptsDir, file)),
        );
      }
      const appJson = JSON.parse(fs.readFileSync(realPackageJson, 'utf8'));
      appJson.sdkVersions.ios.firebase = '13.1.1';
      appJson.sdkVersions.ios.spmDeps = { appCheck: '11.0.0', googleUtilities: '7.0.0' };
      writeFile('packages/app/package.json', JSON.stringify(appJson, null, 2) + '\n');
      writeFile(
        'packages/app-distribution/android/build.gradle',
        "implementation 'com.google.firebase:firebase-appdistribution-api:16.0.0-beta17'\n",
      );
      for (const file of ['package.json', 'tests/package.json', 'tests-macos/package.json']) {
        writeFile(file, '{}\n');
      }
      fs.mkdirSync(path.join(tmpDir, 'bin'));
      fs.mkdirSync(path.join(tmpDir, 'tmp'));
      fs.writeFileSync(
        path.join(tmpDir, 'bin/curl'),
        [
          '#!/usr/bin/env bash',
          'url="${@: -1}"',
          'echo "$url" >>"$FAKE_CURL_LOG"',
          'case "$url" in',
          '  */release-notes/android) file=android.html ;;',
          '  */release-notes/ios) file=ios.html ;;',
          '  */release-notes/js) file=js.html ;;',
          '  */Package.swift)',
          '    file=Package.swift',
          '    if [[ -n "${FAKE_CURL_FAIL_FIRST:-}" && ! -f "$FAKE_CURL_LOG.failed" ]]; then',
          '      touch "$FAKE_CURL_LOG.failed"',
          '      exit 22',
          '    fi',
          '    ;;',
          '  *) exit 22 ;;',
          'esac',
          '[[ -f "$FAKE_CURL_DIR/$file" ]] || exit 22',
          'cat "$FAKE_CURL_DIR/$file"',
          '',
        ].join('\n'),
        { mode: 0o755 },
      );
      writeFile(
        'block-network.js',
        [
          "const blocked = () => { throw new Error('network blocked'); };",
          "for (const name of ['http', 'https']) {",
          '  const mod = require(name);',
          '  mod.get = blocked;',
          '  mod.request = blocked;',
          '}',
          'globalThis.fetch = blocked;',
          '',
        ].join('\n'),
      );
    });

    afterEach(function () {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runScript(args, extraEnv = {}) {
      return spawnSync(
        'bash',
        [path.join(fakeRepo, 'scripts/update-firebase-sdk-versions.sh'), ...args],
        {
          cwd: tmpDir,
          encoding: 'utf8',
          env: {
            ...process.env,
            TMPDIR: path.join(tmpDir, 'tmp'),
            PATH: `${path.join(tmpDir, 'bin')}${path.delimiter}${process.env.PATH}`,
            FAKE_CURL_DIR: path.join(tmpDir, 'remote'),
            FAKE_CURL_LOG: path.join(tmpDir, 'curl.log'),
            NODE_OPTIONS: `--require "${path.join(fakeRepo, 'block-network.js')}"`,
            ...extraEnv,
          },
        },
      );
    }

    function runApply(offlineArg) {
      return runScript(['--offline', offlineArg, '--apply']);
    }

    function leftoverTempFiles() {
      return fs.readdirSync(path.join(tmpDir, 'tmp')).filter(name => name.startsWith('rnfb-'));
    }

    function curlLog() {
      const logPath = path.join(tmpDir, 'curl.log');
      return fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').trim().split('\n') : [];
    }

    function appPackageJson() {
      return fs.readFileSync(path.join(fakeRepo, 'packages/app/package.json'), 'utf8');
    }

    it('writes Firebase lower bounds into spmDeps when the iOS SDK changes', function () {
      writeSnapshot(path.join(tmpDir, 'snap'), '13.2.0', firebasePackageSwift());
      const result = runApply('snap');
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/network blocked/);
      const ios = JSON.parse(appPackageJson()).sdkVersions.ios;
      expect(ios.firebase).toBe('13.2.0');
      expect(ios.spmDeps).toEqual({ appCheck: '12.0.0', googleUtilities: '8.1.4' });
    });

    it('fails before writing any file when the snapshot has no Package.swift', function () {
      writeSnapshot(path.join(tmpDir, 'snap'), '13.2.0');
      const before = appPackageJson();
      const result = runApply('snap');
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/missing .*\/snap\/Package\.swift \(iOS SDK changed\)/);
      expect(appPackageJson()).toBe(before);
    });

    it('fails before writing any file when Package.swift cannot be parsed', function () {
      writeSnapshot(path.join(tmpDir, 'snap'), '13.2.0', 'let package = Package()');
      const before = appPackageJson();
      const result = runApply('./snap');
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/Expected exactly one/);
      expect(result.stderr).toMatch(/no files were changed/);
      expect(appPackageJson()).toBe(before);
    });

    it('leaves spmDeps alone when the iOS SDK is unchanged', function () {
      writeSnapshot(path.join(tmpDir, 'snap'), '13.1.1');
      const result = runApply('snap');
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/network blocked/);
      expect(result.stderr).not.toMatch(/missing|reading SPM lower bounds/);
      const json = JSON.parse(appPackageJson());
      expect(json.dependencies.firebase).toBe('13.3.0');
      expect(json.sdkVersions.android.firebase).toBe('35.2.0');
      expect(json.sdkVersions.ios.spmDeps).toEqual({
        appCheck: '11.0.0',
        googleUtilities: '7.0.0',
      });
    });

    it('fails before writing any file when the offline Package.swift is for another tag', function () {
      writeSnapshot(
        path.join(tmpDir, 'snap'),
        '13.2.0',
        `let firebaseVersion = "13.1.1"\n${firebasePackageSwift()}`,
      );
      const before = appPackageJson();
      const result = runApply('snap');
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/expected 13\.2\.0/);
      expect(appPackageJson()).toBe(before);
    });

    it('fetches Package.swift at the new tag when run online', function () {
      writeSnapshot(path.join(tmpDir, 'remote'), '13.2.0', firebasePackageSwift());
      const result = runScript(['--apply']);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/network blocked/);
      expect(curlLog()).toContain(
        'https://raw.githubusercontent.com/firebase/firebase-ios-sdk/13.2.0/Package.swift',
      );
      expect(JSON.parse(appPackageJson()).sdkVersions.ios.spmDeps).toEqual({
        appCheck: '12.0.0',
        googleUtilities: '8.1.4',
      });
      expect(leftoverTempFiles()).toEqual([]);
    });

    it('fails before writing any file when the online fetch fails', function () {
      writeSnapshot(path.join(tmpDir, 'remote'), '13.2.0');
      const before = appPackageJson();
      const result = runScript(['--apply']);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(
        /failed to fetch .*13\.2\.0 Package\.swift; no files were changed/,
      );
      expect(appPackageJson()).toBe(before);
      expect(leftoverTempFiles()).toEqual([]);
    });

    it('--save-snapshot saves Package.swift for a later offline apply', function () {
      writeSnapshot(path.join(tmpDir, 'remote'), '13.2.0', firebasePackageSwift());
      const result = runScript(['--save-snapshot', 'snap']);
      expect(result.status).toBe(0);
      expect(fs.readFileSync(path.join(tmpDir, 'snap/Package.swift'), 'utf8')).toBe(
        firebasePackageSwift(),
      );
      expect(fs.existsSync(path.join(tmpDir, 'snap/Package.swift.partial'))).toBe(false);
    });

    it('--save-snapshot warns and drops a stale Package.swift when the fetch fails', function () {
      writeSnapshot(path.join(tmpDir, 'remote'), '13.2.0');
      writeSnapshot(path.join(tmpDir, 'snap'), '13.1.1', firebasePackageSwift());
      const result = runScript(['--save-snapshot', 'snap']);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('firebase_ios_sdk=13.2.0');
      expect(result.stderr).toMatch(/warning: failed to fetch .*13\.2\.0 Package\.swift/);
      expect(fs.existsSync(path.join(tmpDir, 'snap/Package.swift'))).toBe(false);
      expect(fs.existsSync(path.join(tmpDir, 'snap/Package.swift.partial'))).toBe(false);
    });

    it('--save-snapshot --apply stops before writing when the fetch fails', function () {
      writeSnapshot(path.join(tmpDir, 'remote'), '13.2.0');
      const before = appPackageJson();
      const result = runScript(['--save-snapshot', 'snap', '--apply']);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(
        /failed to fetch firebase-ios-sdk 13\.2\.0 Package\.swift; no files were changed/,
      );
      expect(appPackageJson()).toBe(before);
      expect(curlLog().filter(url => url.endsWith('/Package.swift'))).toEqual([
        'https://raw.githubusercontent.com/firebase/firebase-ios-sdk/13.2.0/Package.swift',
        'https://raw.githubusercontent.com/firebase/firebase-ios-sdk/13.2.0/Package.swift',
      ]);
      expect(leftoverTempFiles()).toEqual([]);
    });

    it('--save-snapshot --apply re-fetches and saves Package.swift after a failed snapshot fetch', function () {
      writeSnapshot(path.join(tmpDir, 'remote'), '13.2.0', firebasePackageSwift());
      const result = runScript(['--save-snapshot', 'snap', '--apply'], {
        FAKE_CURL_FAIL_FIRST: '1',
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/warning: failed to fetch/);
      expect(result.stderr).toMatch(/network blocked/);
      expect(JSON.parse(appPackageJson()).sdkVersions.ios.spmDeps).toEqual({
        appCheck: '12.0.0',
        googleUtilities: '8.1.4',
      });
      expect(fs.readFileSync(path.join(tmpDir, 'snap/Package.swift'), 'utf8')).toBe(
        firebasePackageSwift(),
      );
      expect(leftoverTempFiles()).toEqual([]);
    });

    it('--save-snapshot --apply does not need Package.swift when the iOS SDK is unchanged', function () {
      writeSnapshot(path.join(tmpDir, 'remote'), '13.1.1');
      const result = runScript(['--save-snapshot', 'snap', '--apply']);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/network blocked/);
      expect(result.stderr).not.toMatch(/reading SPM lower bounds/);
      expect(JSON.parse(appPackageJson()).dependencies.firebase).toBe('13.3.0');
    });
  });
});
