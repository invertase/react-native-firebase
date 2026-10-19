const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, '.github/workflows/scripts/check-ios-probe-sdk-pin.js');
const realPackageJson = path.join(repoRoot, 'packages/app/package.json');
const realPackageSwift = path.join(repoRoot, 'packages/app/ios/RNFBFirebase/Package.swift');

const {
  checkProbeSdkPin,
  parseSwiftExactPin,
  readIosFirebaseVersion,
} = require('../../../.github/workflows/scripts/check-ios-probe-sdk-pin.js');

const FIREBASE_URL = 'https://github.com/firebase/firebase-ios-sdk.git';

function packageSwift(dependencies) {
  return `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
  name: "RNFBFirebase",
  dependencies: [
${dependencies}
  ],
  targets: []
)
`;
}

function packageJson(version) {
  return JSON.stringify({ sdkVersions: { ios: { firebase: version } } });
}

describe('check-ios-probe-sdk-pin', function () {
  describe('parseSwiftExactPin', function () {
    it('reads the exact version of the firebase-ios-sdk declaration', function () {
      const source = packageSwift(`    .package(url: "${FIREBASE_URL}", exact: "12.19.0"),`);
      expect(parseSwiftExactPin(source)).toBe('12.19.0');
    });

    it('accepts a url without the .git suffix', function () {
      const source = packageSwift(
        '    .package(url: "https://github.com/firebase/firebase-ios-sdk", exact: "1.2.3"),',
      );
      expect(parseSwiftExactPin(source)).toBe('1.2.3');
    });

    it('tolerates whitespace and newline variants', function () {
      const multiline = packageSwift(`    .package(
      url: "${FIREBASE_URL}",
      exact: "12.19.0"
    )`);
      const compact = packageSwift(`.package(url:"${FIREBASE_URL}",exact:"12.19.0")`);
      const spaced = packageSwift(
        `\t.package ( url : "${FIREBASE_URL}" ,\n\n  exact :\t"12.19.0" )`,
      );
      expect(parseSwiftExactPin(multiline)).toBe('12.19.0');
      expect(parseSwiftExactPin(compact)).toBe('12.19.0');
      expect(parseSwiftExactPin(spaced)).toBe('12.19.0');
    });

    it('throws when there is no firebase-ios-sdk declaration', function () {
      expect(() => parseSwiftExactPin(packageSwift(''))).toThrow(/found 0/);
    });

    it('throws when the firebase-ios-sdk dependency does not use exact:', function () {
      const source = packageSwift(`    .package(url: "${FIREBASE_URL}", from: "12.19.0"),`);
      expect(() => parseSwiftExactPin(source)).toThrow(/found 0/);
    });

    it('ignores exact: pins for other packages', function () {
      const source = packageSwift(
        '    .package(url: "https://github.com/example/other.git", exact: "9.9.9"),',
      );
      expect(() => parseSwiftExactPin(source)).toThrow(/found 0/);
    });

    it('throws when there are multiple firebase-ios-sdk declarations', function () {
      const source = packageSwift(
        [
          `    .package(url: "${FIREBASE_URL}", exact: "12.19.0"),`,
          `    .package(url: "${FIREBASE_URL}", exact: "12.18.0"),`,
        ].join('\n'),
      );
      expect(() => parseSwiftExactPin(source)).toThrow(/found 2/);
    });

    it('ignores line and block comments that mention a declaration', function () {
      const source = `// swift-tools-version: 5.9
// Exact pin: .package(url: "${FIREBASE_URL}", exact: "1.0.0")
/* old: .package(url: "${FIREBASE_URL}", exact: "2.0.0") */
/* outer /* nested: .package(url: "${FIREBASE_URL}", exact: "3.0.0") */ still comment */
${packageSwift(`    // .package(url: "${FIREBASE_URL}", exact: "4.0.0"),
    .package(url: "${FIREBASE_URL}", exact: "12.19.0"), // trailing exact: "5.0.0"`)}`;
      expect(parseSwiftExactPin(source)).toBe('12.19.0');
    });

    it('throws when only comments mention a declaration', function () {
      const source = packageSwift(`    // .package(url: "${FIREBASE_URL}", exact: "12.19.0"),`);
      expect(() => parseSwiftExactPin(source)).toThrow(/found 0/);
    });
  });

  describe('readIosFirebaseVersion', function () {
    it('reads sdkVersions.ios.firebase', function () {
      expect(readIosFirebaseVersion(packageJson('12.19.0'))).toBe('12.19.0');
    });

    it('throws when the field is missing or not a string', function () {
      expect(() => readIosFirebaseVersion('{}')).toThrow(/sdkVersions\.ios\.firebase/);
      expect(() => readIosFirebaseVersion(packageJson(''))).toThrow(/sdkVersions\.ios\.firebase/);
      expect(() => readIosFirebaseVersion(packageJson(12))).toThrow(/sdkVersions\.ios\.firebase/);
    });
  });

  describe('checkProbeSdkPin', function () {
    const swift = packageSwift(`    .package(url: "${FIREBASE_URL}", exact: "12.19.0"),`);

    it('passes when the versions match', function () {
      const result = checkProbeSdkPin({
        packageJsonSource: packageJson('12.19.0'),
        packageSwiftSource: swift,
      });
      expect(result).toEqual({ ok: true, message: expect.stringContaining('12.19.0') });
    });

    it('fails with both values when the versions differ', function () {
      const result = checkProbeSdkPin({
        packageJsonSource: packageJson('12.20.0'),
        packageSwiftSource: swift,
      });
      expect(result.ok).toBe(false);
      expect(result.message).toContain('12.19.0');
      expect(result.message).toContain('12.20.0');
    });

    it('throws when Package.swift has no usable declaration', function () {
      expect(() =>
        checkProbeSdkPin({
          packageJsonSource: packageJson('12.19.0'),
          packageSwiftSource: packageSwift(''),
        }),
      ).toThrow(/found 0/);
    });
  });

  describe('repo files', function () {
    it('Package.swift exact pin matches sdkVersions.ios.firebase', function () {
      const result = checkProbeSdkPin({
        packageJsonSource: fs.readFileSync(realPackageJson, 'utf8'),
        packageSwiftSource: fs.readFileSync(realPackageSwift, 'utf8'),
      });
      expect(result.message).toMatch(/OK/);
      expect(result.ok).toBe(true);
    });
  });

  describe('CLI', function () {
    let tmpDir;

    beforeEach(function () {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-probe-pin-'));
    });

    afterEach(function () {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runCli(version, swiftSource) {
      const jsonPath = path.join(tmpDir, 'package.json');
      const swiftPath = path.join(tmpDir, 'Package.swift');
      fs.writeFileSync(jsonPath, packageJson(version));
      fs.writeFileSync(swiftPath, swiftSource);
      return spawnSync(process.execPath, [scriptPath, jsonPath, swiftPath], { encoding: 'utf8' });
    }

    const swift = packageSwift(`    .package(url: "${FIREBASE_URL}", exact: "12.19.0"),`);

    it('exits 0 with a one-line OK message on match', function () {
      const result = runCli('12.19.0', swift);
      expect(result.status).toBe(0);
      expect(result.stdout.trim().split('\n')).toHaveLength(1);
      expect(result.stdout).toContain('12.19.0');
    });

    it('exits 1 printing both versions on mismatch', function () {
      const result = runCli('12.20.0', swift);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('12.19.0');
      expect(result.stderr).toContain('12.20.0');
    });

    it('exits 1 with a clear message when the declaration is missing', function () {
      const result = runCli('12.19.0', packageSwift(''));
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/exactly one .*declaration/);
    });

    it('exits 1 when an input file cannot be read', function () {
      const result = spawnSync(
        process.execPath,
        [scriptPath, path.join(tmpDir, 'missing.json'), realPackageSwift],
        { encoding: 'utf8' },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/check failed/);
    });
  });
});
