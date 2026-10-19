const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// RNFB_PROBE_TEST_ROOT points the suite at a copy of .github/workflows/scripts
// (mutation checks run it against deliberately broken copies in /tmp). Unset
// in normal runs.
const repoRoot = process.env.RNFB_PROBE_TEST_ROOT || path.resolve(__dirname, '../../..');
const scriptsDir = path.join(repoRoot, '.github/workflows/scripts');
const helperPath = path.join(scriptsDir, 'lib/rn-bare-probe-assertions.sh');
const buildScriptPath = path.join(scriptsDir, 'test-rn-bare-ios-build.sh');

const FIRAPP_CLASS = '0000000000012340 S _OBJC_CLASS_$_FIRApp';
const FIRAPP_METACLASS = '0000000000012380 S _OBJC_METACLASS_$_FIRApp';
const SWIFT_LOOKALIKES = [
  '0000000000001000 T _$s6RNFBApp21RCTConvertFIRAppThing',
  '0000000000001010 S _OBJC_CLASS_$_RNFBFIRAppLifecycle',
  '0000000000001020 S _OBJC_CLASS_$_FIRAppDelegateProxy',
];
const UNRELATED = [
  '0000000000002000 T _RNFBAppModule',
  '0000000000002010 S _OBJC_CLASS_$_RNFBUtils',
];
const STATIC_FIRAPP = [...UNRELATED, FIRAPP_CLASS, FIRAPP_METACLASS];

const APP_EXECUTABLE = 'testrnbare.app/testrnbare';

// The fixture "binaries" contain the text a stub `nm` prints for them. The
// stub ignores flags and cats its last argument.
const NM_STUB = '#!/bin/bash\nfile="${@: -1}"\ncat "$file"\n';
const NM_FAILING_STUB = '#!/bin/bash\necho "nm: simulated failure" >&2\nexit 1\n';
// Fails only for fixtures containing NM_FAIL; otherwise behaves like NM_STUB.
const NM_SELECTIVE_STUB =
  '#!/bin/bash\nfile="${@: -1}"\nif grep -q NM_FAIL "$file"; then\n  echo "nm: simulated failure for $file" >&2\n  exit 1\nfi\ncat "$file"\n';
// The sweep asks `file -b` what a framework binary is. Fixtures are text, so
// the stub reports Mach-O unless the fixture carries a marker line.
const FILE_STUB = [
  '#!/bin/bash',
  'file="${@: -1}"',
  'if grep -q NOT_MACHO "$file"; then',
  '  echo "ASCII text"',
  'elif grep -q AR_ARCHIVE "$file"; then',
  '  echo "current ar archive random library"',
  'elif grep -q UNIVERSAL_MACHO "$file"; then',
  '  echo "Mach-O universal binary with 2 architectures: [x86_64:Mach-O 64-bit dynamically linked shared library x86_64] [arm64:Mach-O 64-bit dynamically linked shared library arm64]"',
  'else',
  '  echo "Mach-O 64-bit dynamically linked shared library arm64"',
  'fi',
  '',
].join('\n');
const NOT_MACHO = ['NOT_MACHO', 'plain resource file, not a binary'];
const AR_ARCHIVE = ['AR_ARCHIVE'];
const UNIVERSAL_MACHO = ['UNIVERSAL_MACHO'];
// plutil is absent from most hosts and real on macOS. The default stub fails
// so the CFBundleExecutable step is opt-in per test. The opt-in stub prints
// the plist fixture, which holds just the executable name.
const PLUTIL_FAILING_STUB = '#!/bin/bash\necho "plutil: simulated failure" >&2\nexit 1\n';
const PLUTIL_CAT_STUB = '#!/bin/bash\ncat "${@: -1}"\n';

describe('rn-bare probe single-copy FirebaseCore assertions', function () {
  let tmpDir;
  let productsDir;
  let binDir;

  function writeBinary(relPath, symbolLines) {
    const full = path.join(productsDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, symbolLines.length ? `${symbolLines.join('\n')}\n` : '');
    return full;
  }

  function writeStub(name, content) {
    fs.writeFileSync(path.join(binDir, name), content, { mode: 0o755 });
  }

  function writeNm(content) {
    writeStub('nm', content);
  }

  function writeFileStub(content) {
    writeStub('file', content);
  }

  // Probe-shaped products: RNFBFirebase defines FIRApp, RNFBApp and the app
  // executable do not, no standalone FirebaseCore.framework.
  function writeHealthyProducts() {
    writeBinary('RNFBFirebase.framework/RNFBFirebase', [
      ...UNRELATED,
      FIRAPP_CLASS,
      FIRAPP_METACLASS,
    ]);
    writeBinary('RNFBApp/RNFBApp.framework/RNFBApp', [...UNRELATED, ...SWIFT_LOOKALIKES]);
    writeBinary(APP_EXECUTABLE, [...UNRELATED, '0000000000003000 T _main']);
  }

  function runHelper(body, env = {}) {
    const script = `
set -euo pipefail
log() { echo "[log] $*"; }
fail() { echo "[fail] $*"; exit 1; }
source "${helperPath}"
${body}
`;
    return spawnSync('bash', ['-c', script], {
      encoding: 'utf8',
      env: { ...process.env, ...env, PATH: `${binDir}:${process.env.PATH}` },
    });
  }

  function runSingleCopy(flag = '1', { app = path.join(productsDir, APP_EXECUTABLE) } = {}) {
    const umbrella = path.join(productsDir, 'RNFBFirebase.framework/RNFBFirebase');
    const rnfbApp = path.join(productsDir, 'RNFBApp/RNFBApp.framework/RNFBApp');
    return runHelper(
      `rnfb_probe_assert_single_firebase_copy "${flag}" "${productsDir}" "${umbrella}" "${rnfbApp}"${
        app === null ? '' : ` "${app}"`
      }`,
    );
  }

  function runSweep(extra = '') {
    return runHelper(`rnfb_probe_assert_firapp_only_in_umbrella "${productsDir}" ${extra}`);
  }

  beforeEach(function () {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-probe-single-copy-'));
    productsDir = path.join(tmpDir, 'Build/Products/Release-iphonesimulator');
    binDir = path.join(tmpDir, 'bin');
    fs.mkdirSync(productsDir, { recursive: true });
    fs.mkdirSync(binDir, { recursive: true });
    writeNm(NM_STUB);
    writeFileStub(FILE_STUB);
    writeStub('plutil', PLUTIL_FAILING_STUB);
  });

  afterEach(function () {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('passes when RNFBFirebase defines FIRApp, RNFBApp does not, and no FirebaseCore.framework exists', function () {
    writeHealthyProducts();
    const result = runSingleCopy();
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('nm: no _OBJC_CLASS_$_FIRApp in RNFBApp.framework');
    expect(result.stdout).toContain('nm: RNFBFirebase.framework defines FIRApp');
    expect(result.stdout).toContain('S _OBJC_CLASS_$_FIRApp');
    expect(result.stdout).toContain('no standalone FirebaseCore framework');
    expect(result.status).toBe(0);
  });

  it('does not treat Swift or ObjC names that merely contain FIRApp as the class', function () {
    writeHealthyProducts();
    // RNFBFirebase with only look-alikes must still fail the "defines" check.
    writeBinary('RNFBFirebase.framework/RNFBFirebase', [...UNRELATED, ...SWIFT_LOOKALIKES]);
    const result = runSingleCopy();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('no _OBJC_CLASS_$_FIRApp defined in RNFBFirebase.framework');
  });

  describe('RNFBApp.framework', function () {
    it('fails when RNFBApp defines the FIRApp class', function () {
      writeHealthyProducts();
      writeBinary('RNFBApp/RNFBApp.framework/RNFBApp', [...UNRELATED, FIRAPP_CLASS]);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('RNFBApp still defines FIRApp class symbols');
      expect(result.stdout).toContain('_OBJC_CLASS_$_FIRApp');
      expect(result.stdout).toContain('FIRApp defined inside RNFBApp.framework');
      expect(result.stdout).toContain('RNFBApp/RNFBApp.framework/RNFBApp');
    });

    it('fails when RNFBApp defines only the FIRApp metaclass', function () {
      writeHealthyProducts();
      writeBinary('RNFBApp/RNFBApp.framework/RNFBApp', [...UNRELATED, FIRAPP_METACLASS]);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('FIRApp defined inside RNFBApp.framework');
    });

    it('fails when nm cannot read RNFBApp', function () {
      writeHealthyProducts();
      writeNm(NM_FAILING_STUB);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('nm failed while reading RNFBApp.framework');
      expect(result.stdout).toContain('could not validate RNFBApp.framework symbols with nm');
    });

    it('fails when nm returns no symbols for RNFBApp', function () {
      writeHealthyProducts();
      writeBinary('RNFBApp/RNFBApp.framework/RNFBApp', []);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(
        'nm returned no global defined symbols for RNFBApp.framework',
      );
    });
  });

  describe('RNFBFirebase.framework', function () {
    it('fails when RNFBFirebase does not define the FIRApp class', function () {
      writeHealthyProducts();
      writeBinary('RNFBFirebase.framework/RNFBFirebase', UNRELATED);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('no _OBJC_CLASS_$_FIRApp defined in RNFBFirebase.framework');
      expect(result.stdout).toContain('RNFBFirebase.framework/RNFBFirebase');
      expect(result.stdout).toContain('single-copy claim does not hold');
    });

    it('fails when only the FIRApp metaclass is defined', function () {
      writeHealthyProducts();
      writeBinary('RNFBFirebase.framework/RNFBFirebase', [...UNRELATED, FIRAPP_METACLASS]);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('no _OBJC_CLASS_$_FIRApp defined in RNFBFirebase.framework');
    });

    it('fails when nm returns no symbols for RNFBFirebase', function () {
      writeHealthyProducts();
      writeBinary('RNFBFirebase.framework/RNFBFirebase', []);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(
        'nm returned no global defined symbols for RNFBFirebase.framework',
      );
    });

    it('accepts fat-binary nm output with per-arch headers', function () {
      writeHealthyProducts();
      writeBinary('RNFBFirebase.framework/RNFBFirebase', [
        '/path/RNFBFirebase (for architecture arm64):',
        FIRAPP_CLASS,
        '/path/RNFBFirebase (for architecture x86_64):',
        FIRAPP_CLASS,
      ]);
      expect(runSingleCopy().status).toBe(0);
    });
  });

  describe('standalone FirebaseCore.framework', function () {
    it('fails when FirebaseCore.framework sits in the products dir', function () {
      writeHealthyProducts();
      const standalone = path.join(productsDir, 'FirebaseCore.framework');
      writeBinary('FirebaseCore.framework/FirebaseCore', [FIRAPP_CLASS]);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('standalone FirebaseCore framework found');
      expect(result.stdout).toContain(standalone);
      expect(result.stdout).toContain('standalone FirebaseCore framework exists under');
    });

    it('fails when FirebaseCore.framework is embedded under the app bundle', function () {
      writeHealthyProducts();
      const embedded = path.join(productsDir, 'testrnbare.app/Frameworks/FirebaseCore.framework');
      writeBinary('testrnbare.app/Frameworks/FirebaseCore.framework/FirebaseCore', [FIRAPP_CLASS]);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(embedded);
    });

    it('fails on the shipped-path SPM package-product framework name', function () {
      writeHealthyProducts();
      const packageProduct = path.join(
        productsDir,
        'PackageFrameworks/FirebaseCore_-5C7B465D19C2E54A_PackageProduct.framework',
      );
      writeBinary(
        'PackageFrameworks/FirebaseCore_-5C7B465D19C2E54A_PackageProduct.framework/FirebaseCore_-5C7B465D19C2E54A_PackageProduct',
        [FIRAPP_CLASS],
      );
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(packageProduct);
      expect(result.stdout).toContain('standalone FirebaseCore framework exists under');
    });

    it('ignores similarly named frameworks that do not match the standalone FirebaseCore patterns', function () {
      writeHealthyProducts();
      writeBinary('FirebaseCoreExtension.framework/FirebaseCoreExtension', UNRELATED);
      writeBinary('RNFBFirebaseCore.framework/RNFBFirebaseCore', UNRELATED);
      // A well-formed SPM package-product framework for a different product.
      // Its main binary is named like its directory, so the sweep scans it;
      // only the standalone-FirebaseCore name pattern is under test here.
      writeBinary(
        'FirebaseCoreInternal_-5C7B465D19C2E54A_PackageProduct.framework/FirebaseCoreInternal_-5C7B465D19C2E54A_PackageProduct',
        UNRELATED,
      );
      const standalone = runHelper(`rnfb_probe_assert_no_standalone_firebasecore "${productsDir}"`);
      expect(standalone.status).toBe(0);
      expect(standalone.stdout).toContain('no standalone FirebaseCore framework');
      expect(runSingleCopy().status).toBe(0);
    });

    it('fails clearly when the products dir does not exist', function () {
      const result = runHelper(
        `rnfb_probe_assert_no_standalone_firebasecore "${path.join(tmpDir, 'missing')}"`,
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('products dir was not found');
    });
  });

  describe('nm sweep over framework binaries', function () {
    it('passes when only RNFBFirebase defines FIRApp and logs one line per binary', function () {
      writeHealthyProducts();
      const installations = writeBinary(
        'FirebaseInstallations_-5C7B465D19C2E54A_PackageProduct.framework/FirebaseInstallations_-5C7B465D19C2E54A_PackageProduct',
        UNRELATED,
      );
      const umbrella = path.join(productsDir, 'RNFBFirebase.framework/RNFBFirebase');
      const rnfbApp = path.join(productsDir, 'RNFBApp/RNFBApp.framework/RNFBApp');
      const app = path.join(productsDir, APP_EXECUTABLE);
      const result = runSingleCopy();
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        'nm sweep: 3 framework directories, scanned 3 framework binaries (0 non-Mach-O skipped) plus 1 app executable(s)',
      );
      expect(result.stdout).toContain(
        `[log] nm sweep: ${umbrella}: defines FIRApp (allowed, RNFBFirebase.framework)`,
      );
      expect(result.stdout).toContain(`[log] nm sweep: ${rnfbApp}: no FIRApp\n`);
      expect(result.stdout).toContain(`[log] nm sweep: ${installations}: no FIRApp\n`);
      expect(result.stdout).toContain(`[log] nm sweep: ${app}: no FIRApp (app executable)\n`);
    });

    it('scans RNFBFirebase copies in PackageFrameworks and the app bundle without flagging them', function () {
      writeHealthyProducts();
      writeBinary('PackageFrameworks/RNFBFirebase.framework/RNFBFirebase', STATIC_FIRAPP);
      writeBinary('testrnbare.app/Frameworks/RNFBFirebase.framework/RNFBFirebase', STATIC_FIRAPP);
      const result = runSingleCopy();
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('PackageFrameworks/RNFBFirebase.framework/RNFBFirebase');
      expect(result.stdout).toContain(
        'testrnbare.app/Frameworks/RNFBFirebase.framework/RNFBFirebase',
      );
    });

    it('fails and names a second framework that statically defines FIRApp', function () {
      writeHealthyProducts();
      const installations = writeBinary(
        'PackageFrameworks/FirebaseInstallations_-5C7B465D19C2E54A_PackageProduct.framework/FirebaseInstallations_-5C7B465D19C2E54A_PackageProduct',
        STATIC_FIRAPP,
      );
      const other = writeBinary('Other.framework/Other', STATIC_FIRAPP);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('defined outside RNFBFirebase.framework');
      expect(result.stdout).toContain(installations);
      expect(result.stdout).toContain(other);
      expect(result.stdout).not.toMatch(
        /Offending binaries:.*RNFBFirebase\.framework\/RNFBFirebase( |$)/,
      );
    });

    it('fails when only the FIRApp metaclass is defined in another framework', function () {
      writeHealthyProducts();
      const other = writeBinary('Other.framework/Other', [...UNRELATED, FIRAPP_METACLASS]);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(other);
    });

    it('fails on a defining binary in the app-embedded copy of a non-RNFBFirebase framework', function () {
      writeHealthyProducts();
      // The PackageFrameworks copy is clean; only the embedded copy defines FIRApp.
      writeBinary('PackageFrameworks/Other.framework/Other', UNRELATED);
      const embedded = writeBinary(
        'testrnbare.app/Frameworks/Other.framework/Other',
        STATIC_FIRAPP,
      );
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(embedded);
      expect(result.stdout).not.toContain('PackageFrameworks/Other.framework/Other: defines');
    });

    it('fails when a non-RNFBFirebase framework copy sits next to a RNFBFirebase copy', function () {
      writeHealthyProducts();
      writeBinary('testrnbare.app/Frameworks/RNFBFirebase.framework/RNFBFirebase', STATIC_FIRAPP);
      const duplicate = writeBinary(
        'testrnbare.app/Frameworks/RNFBApp.framework/RNFBApp',
        STATIC_FIRAPP,
      );
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(duplicate);
    });

    it('logs and skips a non-Mach-O file named like its framework', function () {
      writeHealthyProducts();
      const resource = writeBinary('Resources.framework/Resources', NOT_MACHO);
      // Not the main binary: never identified or scanned.
      writeBinary('Other.framework/Other', UNRELATED);
      writeBinary('Other.framework/Info.plist', [...NOT_MACHO, ...STATIC_FIRAPP]);
      writeBinary('Other.framework/_CodeSignature/CodeResources', [...NOT_MACHO, ...STATIC_FIRAPP]);
      const result = runSingleCopy();
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`nm sweep: ${resource}: skipped, not Mach-O or archive`);
      expect(result.stdout).toContain(
        'nm sweep: 4 framework directories, scanned 3 framework binaries (1 non-Mach-O skipped)',
      );
    });

    it('reports a clear failure when nm errors on a Mach-O framework binary', function () {
      writeHealthyProducts();
      writeNm(NM_SELECTIVE_STUB);
      const broken = writeBinary('Other.framework/Other', ['NM_FAIL']);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('nm failed while reading framework binary');
      expect(result.stdout).toContain('nm: simulated failure');
      expect(result.stdout).toContain(
        `could not validate framework binary ${broken} symbols with nm`,
      );
    });

    it('accepts a Mach-O framework binary with no global defined symbols', function () {
      writeHealthyProducts();
      writeBinary('Empty.framework/Empty', []);
      expect(runSingleCopy().status).toBe(0);
    });

    it('fails when file cannot identify a framework binary', function () {
      writeHealthyProducts();
      writeFileStub('#!/bin/bash\necho "file: simulated failure" >&2\nexit 1\n');
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('could not identify framework binary type');
    });

    it('refuses to pass when the products dir has no Mach-O framework binaries', function () {
      const result = runSweep();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('found no Mach-O framework binaries');
    });

    it('fails clearly when the products dir does not exist', function () {
      const result = runHelper(
        `rnfb_probe_assert_firapp_only_in_umbrella "${path.join(tmpDir, 'missing')}"`,
      );
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('products dir was not found');
    });

    describe('binary formats', function () {
      it('fails on a static archive framework binary that defines FIRApp', function () {
        writeHealthyProducts();
        const archive = writeBinary('Static.framework/Static', [...AR_ARCHIVE, ...STATIC_FIRAPP]);
        const result = runSingleCopy();
        expect(result.status).toBe(1);
        expect(result.stdout).toContain(`nm sweep: ${archive}: defines FIRApp (NOT allowed)`);
        expect(result.stdout).toContain('defined outside RNFBFirebase.framework');
      });

      it('scans and passes a clean static archive framework binary', function () {
        writeHealthyProducts();
        const archive = writeBinary('Static.framework/Static', [...AR_ARCHIVE, ...UNRELATED]);
        const result = runSingleCopy();
        expect(result.status).toBe(0);
        expect(result.stdout).toContain(`nm sweep: ${archive}: no FIRApp`);
        expect(result.stdout).toContain('scanned 3 framework binaries');
      });

      it('fails on a universal Mach-O framework binary that defines FIRApp', function () {
        writeHealthyProducts();
        const fat = writeBinary('Fat.framework/Fat', [
          ...UNIVERSAL_MACHO,
          '/path/Fat (for architecture arm64):',
          FIRAPP_CLASS,
          '/path/Fat (for architecture x86_64):',
          FIRAPP_CLASS,
        ]);
        const result = runSingleCopy();
        expect(result.status).toBe(1);
        expect(result.stdout).toContain(`nm sweep: ${fat}: defines FIRApp (NOT allowed)`);
      });

      it('scans and passes a clean universal Mach-O framework binary', function () {
        writeHealthyProducts();
        const fat = writeBinary('Fat.framework/Fat', [
          ...UNIVERSAL_MACHO,
          '/path/Fat (for architecture arm64):',
          ...UNRELATED,
          '/path/Fat (for architecture x86_64):',
          ...UNRELATED,
        ]);
        const result = runSingleCopy();
        expect(result.status).toBe(0);
        expect(result.stdout).toContain(`nm sweep: ${fat}: no FIRApp`);
      });
    });

    describe('framework main binary resolution', function () {
      function writeVersionsLayout(symbolLines) {
        const real = writeBinary('Versioned.framework/Versions/A/Versioned', symbolLines);
        const fwDir = path.join(productsDir, 'Versioned.framework');
        fs.symlinkSync('A', path.join(fwDir, 'Versions/Current'));
        fs.symlinkSync('Versions/Current/Versioned', path.join(fwDir, 'Versioned'));
        return { real, link: path.join(fwDir, 'Versioned') };
      }

      it('resolves the macOS Versions/A symlink layout and fails when it defines FIRApp', function () {
        writeHealthyProducts();
        const { link } = writeVersionsLayout(STATIC_FIRAPP);
        const result = runSingleCopy();
        expect(result.status).toBe(1);
        expect(result.stdout).toContain(`nm sweep: ${link}: defines FIRApp (NOT allowed)`);
      });

      it('resolves the macOS Versions/A symlink layout and passes when clean', function () {
        writeHealthyProducts();
        const { link } = writeVersionsLayout(UNRELATED);
        const result = runSingleCopy();
        expect(result.status).toBe(0);
        expect(result.stdout).toContain(`nm sweep: ${link}: no FIRApp`);
        expect(result.stdout).toContain('3 framework directories, scanned 3 framework binaries');
      });

      it('resolves a binary named by CFBundleExecutable and fails when it defines FIRApp', function () {
        writeHealthyProducts();
        writeStub('plutil', PLUTIL_CAT_STUB);
        const exec = writeBinary('Renamed.framework/RealExec', STATIC_FIRAPP);
        writeBinary('Renamed.framework/Info.plist', ['RealExec']);
        const result = runSingleCopy();
        expect(result.status).toBe(1);
        expect(result.stdout).toContain(`nm sweep: ${exec}: defines FIRApp (NOT allowed)`);
      });

      it('resolves a binary named by CFBundleExecutable and passes when clean', function () {
        writeHealthyProducts();
        writeStub('plutil', PLUTIL_CAT_STUB);
        const exec = writeBinary('Renamed.framework/RealExec', UNRELATED);
        writeBinary('Renamed.framework/Info.plist', ['RealExec']);
        const result = runSingleCopy();
        expect(result.status).toBe(0);
        expect(result.stdout).toContain(`nm sweep: ${exec}: no FIRApp`);
      });

      it('falls back to the only Mach-O in the directory when CFBundleExecutable is unavailable', function () {
        writeHealthyProducts();
        const payload = writeBinary('Odd.framework/Payload', STATIC_FIRAPP);
        writeBinary('Odd.framework/Info.plist', NOT_MACHO);
        writeBinary('Odd.framework/_CodeSignature/CodeResources', UNRELATED);
        const result = runSingleCopy();
        expect(result.status).toBe(1);
        expect(result.stdout).toContain(`nm sweep: ${payload}: defines FIRApp (NOT allowed)`);
      });

      it('fails naming the directory when several Mach-O files could be the main binary', function () {
        writeHealthyProducts();
        writeBinary('Ambiguous.framework/First', UNRELATED);
        writeBinary('Ambiguous.framework/Second', UNRELATED);
        const result = runSingleCopy();
        expect(result.status).toBe(1);
        expect(result.stdout).toContain('could not resolve the main binary of');
        expect(result.stdout).toContain('Ambiguous.framework');
        expect(result.stdout).toContain('2 Mach-O candidates');
      });

      it('fails naming the directory when a framework has no binary at all', function () {
        writeHealthyProducts();
        writeBinary('Hollow.framework/Info.plist', NOT_MACHO);
        const result = runSingleCopy();
        expect(result.status).toBe(1);
        expect(result.stdout).toContain('could not resolve the main binary of');
        expect(result.stdout).toContain('Hollow.framework');
        expect(result.stdout).toContain('0 Mach-O candidates');
      });
    });

    describe('.dSYM exclusion', function () {
      it('ignores a framework directory inside a .dSYM bundle', function () {
        writeHealthyProducts();
        // Matches `-type d -name '*.framework'` and defines FIRApp; only the
        // `-not -path '*.dSYM/*'` exclusion keeps it out of the sweep.
        writeBinary('Foo.dSYM/Contents/Resources/Other.framework/Other', STATIC_FIRAPP);
        const result = runSingleCopy();
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('nm sweep: 2 framework directories, scanned 2');
        expect(result.stdout).not.toContain('Other.framework');
      });

      it('does not count a dSYM DWARF file as a main-binary candidate inside a framework', function () {
        writeHealthyProducts();
        // Odd.framework has no Odd binary; Payload is the only real binary.
        // The DWARF file under Foo.dSYM is Mach-O to `file` and would make the
        // directory ambiguous without the exclusion in the resolver's find.
        const payload = writeBinary('Odd.framework/Payload', UNRELATED);
        writeBinary('Odd.framework/Contents/Foo.dSYM/Contents/Resources/DWARF/Foo', UNRELATED);
        const result = runSingleCopy();
        expect(result.status).toBe(0);
        expect(result.stdout).toContain(`nm sweep: ${payload}: no FIRApp`);
        expect(result.stdout).not.toContain('DWARF');
      });
    });
  });

  describe('app executable', function () {
    it('fails when the app executable defines the FIRApp class', function () {
      writeHealthyProducts();
      const app = writeBinary(APP_EXECUTABLE, STATIC_FIRAPP);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(
        `nm sweep: ${app}: defines FIRApp (NOT allowed, app executable)`,
      );
      expect(result.stdout).toContain('defined outside RNFBFirebase.framework');
      expect(result.stdout).toContain(`Offending binaries: ${app}`);
    });

    it('fails when the app executable defines only the FIRApp metaclass', function () {
      writeHealthyProducts();
      const app = writeBinary(APP_EXECUTABLE, [...UNRELATED, FIRAPP_METACLASS]);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(app);
    });

    it('fails when the RNFBFirebase binary is copied over the app executable', function () {
      writeHealthyProducts();
      const app = writeBinary(
        APP_EXECUTABLE,
        fs
          .readFileSync(path.join(productsDir, 'RNFBFirebase.framework/RNFBFirebase'), 'utf8')
          .split('\n')
          .filter(Boolean),
      );
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(`Offending binaries: ${app}`);
    });

    it('passes and logs the scan when the app executable is clean', function () {
      writeHealthyProducts();
      const app = path.join(productsDir, APP_EXECUTABLE);
      const result = runSingleCopy();
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`nm sweep: ${app}: no FIRApp (app executable)`);
      expect(result.stdout).toContain('plus 1 app executable(s)');
    });

    it('is not fooled by an app executable that only has Swift look-alikes', function () {
      writeHealthyProducts();
      writeBinary(APP_EXECUTABLE, [...UNRELATED, ...SWIFT_LOOKALIKES]);
      expect(runSingleCopy().status).toBe(0);
    });

    it('fails when the app executable is not a Mach-O', function () {
      writeHealthyProducts();
      const app = writeBinary(APP_EXECUTABLE, NOT_MACHO);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(`app executable is not a Mach-O (${app})`);
    });

    it('fails when nm cannot read the app executable', function () {
      writeHealthyProducts();
      writeNm(NM_SELECTIVE_STUB);
      writeBinary(APP_EXECUTABLE, ['NM_FAIL']);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('could not validate app executable');
    });

    it('fails when nm returns no symbols for the app executable', function () {
      writeHealthyProducts();
      writeBinary(APP_EXECUTABLE, []);
      const result = runSingleCopy();
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('nm returned no global defined symbols for app executable');
    });

    it('fails when the app executable does not exist', function () {
      writeHealthyProducts();
      const missing = path.join(productsDir, 'testrnbare.app/missing');
      const result = runSingleCopy('1', { app: missing });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(`app executable was not found: ${missing}`);
    });

    it('fails when the single-copy check is called without an app executable', function () {
      writeHealthyProducts();
      const result = runSingleCopy('1', { app: null });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('called without the app executable path');
    });

    it('also accepts several app executables through the sweep and flags each defining one', function () {
      writeHealthyProducts();
      const first = writeBinary('testrnbare.app/testrnbare', UNRELATED);
      const second = writeBinary('Second.app/Second', STATIC_FIRAPP);
      const result = runSweep(`"${first}" "${second}"`);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(`Offending binaries: ${second}`);
      expect(result.stdout).not.toContain(`${first}: defines`);
    });
  });

  describe('probe flag off', function () {
    it('skips every check, including a standalone FirebaseCore.framework, FIRApp in RNFBApp, other frameworks and the app executable', function () {
      // Shipped-path shape: FirebaseCore is its own framework and the umbrella
      // has no FIRApp. Probe mode would fail these assertions.
      writeBinary('RNFBFirebase.framework/RNFBFirebase', UNRELATED);
      writeBinary('RNFBApp/RNFBApp.framework/RNFBApp', [FIRAPP_CLASS]);
      writeBinary('FirebaseCore.framework/FirebaseCore', [FIRAPP_CLASS]);
      writeBinary('Other.framework/Other', STATIC_FIRAPP);
      writeBinary(APP_EXECUTABLE, STATIC_FIRAPP);
      expect(runSingleCopy('1').status).toBe(1);

      const result = runSingleCopy('0');
      expect(result.status).toBe(0);
      expect(result.stdout).toBe('');
    });

    it('treats an empty flag as off', function () {
      writeBinary('FirebaseCore.framework/FirebaseCore', [FIRAPP_CLASS]);
      expect(runSingleCopy('').status).toBe(0);
    });

    it('does not need the app executable argument', function () {
      expect(runSingleCopy('0', { app: null }).status).toBe(0);
    });
  });

  // Behavior-level wiring: run the REAL build script end to end in a hermetic
  // skeleton checkout. pod install, xcodebuild, ruby, bundle, otool, nm and
  // file are stubs on PATH; the script, the sourced helper and the helper's
  // calls from assert_dynamic_firebase_probe_graph are the real files. A
  // dropped or dead-branch `source`, a removed, commented-out, mis-guarded or
  // wrong-argument call all change the exit code or output of these runs.
  describe('build script wiring (real script, stubbed tools)', function () {
    let skeleton;
    let fixtureProducts;

    function writeFixture(relPath, symbolLines) {
      const full = path.join(fixtureProducts, relPath);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, `${symbolLines.join('\n')}\n`);
      return full;
    }

    function writeProbeProducts() {
      writeFixture('RNFBFirebase.framework/RNFBFirebase', [...UNRELATED, FIRAPP_CLASS]);
      writeFixture('RNFBApp.framework/RNFBApp', [...UNRELATED, ...SWIFT_LOOKALIKES]);
      writeFixture(APP_EXECUTABLE, [...UNRELATED, '0000000000003000 T _main']);
    }

    function copyFile(from, to) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }

    function runBuildScript({ flag, env: extraEnv = {} }) {
      const stubs = {
        // `bundle exec pod install` logs what the script greps for; any other
        // bundle/ruby invocation (xcodeproj order graph, swiftc check) is a
        // no-op that drains its heredoc.
        bundle: [
          '#!/bin/bash',
          'if [ "$1" = exec ] && [ "$2" = pod ]; then',
          '  echo "Building from source: false"',
          '  if [ "${RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE:-0}" = 1 ]; then',
          '    echo "Using local RNFBFirebase SPM probe"',
          '  else',
          '    echo "Using SPM for Firebase dependency resolution (products: FirebaseCore)"',
          '  fi',
          '  exit 0',
          'fi',
          'cat >/dev/null',
          'exit 0',
          '',
        ].join('\n'),
        ruby: '#!/bin/bash\ncat >/dev/null\nexit 0\n',
        xcbeautify: '#!/bin/bash\ncat\n',
        xcodebuild: [
          '#!/bin/bash',
          'dd=""',
          'while [ $# -gt 0 ]; do',
          '  if [ "$1" = -derivedDataPath ]; then dd="$2"; fi',
          '  shift',
          'done',
          'mkdir -p "$dd/Build/Products/Release-iphonesimulator"',
          'cp -R "$RNFB_TEST_FIXTURE_PRODUCTS/." "$dd/Build/Products/Release-iphonesimulator/"',
          'echo "** BUILD SUCCEEDED **"',
          '',
        ].join('\n'),
        otool: [
          '#!/bin/bash',
          'echo "${@: -1}:"',
          'if [ -z "${RNFB_TEST_OTOOL_NO_LINK:-}" ]; then',
          '  printf "\\t@rpath/RNFBFirebase.framework/RNFBFirebase (compatibility version 1.0.0)\\n"',
          'fi',
          '',
        ].join('\n'),
        nm: NM_STUB,
        file: FILE_STUB,
      };
      Object.keys(stubs).forEach(name => writeStub(name, stubs[name]));

      const env = {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH}`,
        RNFB_TEST_FIXTURE_PRODUCTS: fixtureProducts,
        RNFB_TEST_RN_BARE_DERIVED_DATA: path.join(skeleton, 'derived-data'),
        RNFB_TEST_RN_BARE_POD_LOG: path.join(skeleton, 'pod.log'),
        RNFB_TEST_RN_BARE_XCODEBUILD_LOG: path.join(skeleton, 'xcodebuild.log'),
        ...extraEnv,
      };
      delete env.RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE;
      if (flag) {
        env.RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE = '1';
      }
      return spawnSync(
        'bash',
        [path.join(skeleton, '.github/workflows/scripts/test-rn-bare-ios-build.sh')],
        { encoding: 'utf8', env, cwd: skeleton },
      );
    }

    beforeEach(function () {
      skeleton = path.join(tmpDir, 'skeleton');
      fixtureProducts = path.join(tmpDir, 'fixture-products');
      fs.mkdirSync(fixtureProducts, { recursive: true });
      copyFile(
        buildScriptPath,
        path.join(skeleton, '.github/workflows/scripts/test-rn-bare-ios-build.sh'),
      );
      copyFile(
        helperPath,
        path.join(skeleton, '.github/workflows/scripts/lib/rn-bare-probe-assertions.sh'),
      );
      const ios = path.join(skeleton, 'test-rn-bare/ios');
      fs.mkdirSync(path.join(ios, 'testrnbare.xcworkspace'), { recursive: true });
      fs.mkdirSync(path.join(ios, 'testrnbare.xcodeproj'), { recursive: true });
      fs.mkdirSync(path.join(ios, 'Pods/Pods.xcodeproj'), { recursive: true });
      fs.writeFileSync(path.join(ios, 'Podfile'), 'use_frameworks! :linkage => :dynamic\n');
      fs.writeFileSync(path.join(ios, 'Podfile.lock'), 'PODS:\n  - React-Core-prebuilt (0.86.0)\n');
      fs.writeFileSync(
        path.join(ios, 'testrnbare.xcodeproj/project.pbxproj'),
        'productName = RNFBFirebase;\npackageProductDependencies = (\n);\n',
      );
      fs.writeFileSync(path.join(ios, 'Pods/Pods.xcodeproj/project.pbxproj'), '');
    });

    it('passes the probe build with healthy products and scans the app executable', function () {
      writeProbeProducts();
      const result = runBuildScript({ flag: true });
      expect(result.stdout).toContain('PASS: probe links App');
      expect(result.stdout).toContain('--- dynamic probe single-copy FirebaseCore checks ---');
      expect(result.stdout).toMatch(
        /nm sweep: \S+\/testrnbare\.app\/testrnbare: no FIRApp \(app executable\)/,
      );
      expect(result.status).toBe(0);
    });

    it('fails the probe build when the app executable defines FIRApp', function () {
      writeProbeProducts();
      writeFixture(APP_EXECUTABLE, STATIC_FIRAPP);
      const result = runBuildScript({ flag: true });
      expect(result.status).toBe(1);
      expect(result.stdout).toMatch(/Offending binaries: \S+\/testrnbare\.app\/testrnbare/);
    });

    it('fails the probe build when RNFBApp defines FIRApp', function () {
      writeProbeProducts();
      writeFixture('RNFBApp.framework/RNFBApp', [...UNRELATED, FIRAPP_CLASS]);
      const result = runBuildScript({ flag: true });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('FIRApp defined inside RNFBApp.framework');
    });

    it('fails the probe build when another framework defines FIRApp', function () {
      writeProbeProducts();
      writeFixture('Other.framework/Other', STATIC_FIRAPP);
      const result = runBuildScript({ flag: true });
      expect(result.status).toBe(1);
      expect(result.stdout).toMatch(/Offending binaries: \S+\/Other\.framework\/Other/);
    });

    it('fails the probe build when a standalone FirebaseCore framework ships', function () {
      writeProbeProducts();
      writeFixture('FirebaseCore.framework/FirebaseCore', UNRELATED);
      const result = runBuildScript({ flag: true });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('standalone FirebaseCore framework exists under');
    });

    it('keeps the otool -L link assertions in the probe graph function', function () {
      writeProbeProducts();
      const result = runBuildScript({ flag: true, env: { RNFB_TEST_OTOOL_NO_LINK: '1' } });
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('app binary does not link RNFBFirebase');
    });

    it('does not run any single-copy check when the probe flag is off', function () {
      // Shipped-path shape: no RNFBFirebase facade, FIRApp in RNFBApp, a
      // standalone FirebaseCore framework, FIRApp in the app executable.
      // Every probe assertion would fail on this.
      writeFixture('RNFBApp.framework/RNFBApp', [FIRAPP_CLASS]);
      writeFixture('FirebaseCore.framework/FirebaseCore', [FIRAPP_CLASS]);
      writeFixture(APP_EXECUTABLE, STATIC_FIRAPP);
      const result = runBuildScript({ flag: false });
      expect(result.stdout).toContain('PASS: vanilla RN CLI documented path compiles');
      expect(result.stdout).not.toContain('single-copy FirebaseCore checks');
      expect(result.stdout).not.toContain('nm sweep');
      expect(result.status).toBe(0);
    });

    it('is valid bash', function () {
      expect(spawnSync('bash', ['-n', buildScriptPath]).status).toBe(0);
      expect(spawnSync('bash', ['-n', helperPath]).status).toBe(0);
    });
  });

  // Real nm and file on real Mach-O: guards symbol prefix / output-format drift
  // that the stubbed tools cannot see. macOS with clang only. The skip is
  // deliberate: the stubbed tests above cover the logic on every host, and
  // only a darwin host has the real nm output format and a Mach-O compiler.
  const hasClang =
    process.platform === 'darwin' && spawnSync('xcrun', ['--find', 'clang']).status === 0;
  (hasClang ? describe : describe.skip)('real nm on compiled binaries', function () {
    function objcSource(className, withMain) {
      return `#import <Foundation/Foundation.h>\n@interface ${className} : NSObject\n@end\n@implementation ${className}\n@end\n${
        withMain ? 'int main(void) { return 0; }\n' : ''
      }`;
    }

    function clang(args, relPath) {
      const out = path.join(productsDir, relPath);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const result = spawnSync('xcrun', ['clang', '-fobjc-arc', ...args, '-o', out], {
        encoding: 'utf8',
      });
      if (result.status !== 0) {
        throw new Error(`clang failed: ${result.stderr}`);
      }
      return out;
    }

    function writeSource(className, withMain) {
      const src = path.join(tmpDir, `${className}${withMain ? 'Main' : ''}.m`);
      fs.writeFileSync(src, objcSource(className, withMain));
      return src;
    }

    function compileDylib(relPath, className) {
      return clang(
        ['-dynamiclib', '-framework', 'Foundation', writeSource(className, false)],
        relPath,
      );
    }

    function compileExecutable(relPath, className) {
      return clang(['-framework', 'Foundation', writeSource(className, true)], relPath);
    }

    function compileStaticArchive(relPath, className) {
      const obj = path.join(tmpDir, `${className}.o`);
      const compiled = spawnSync(
        'xcrun',
        ['clang', '-fobjc-arc', '-c', writeSource(className, false), '-o', obj],
        { encoding: 'utf8' },
      );
      if (compiled.status !== 0) {
        throw new Error(`clang -c failed: ${compiled.stderr}`);
      }
      const out = path.join(productsDir, relPath);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const archived = spawnSync('xcrun', ['libtool', '-static', '-o', out, obj], {
        encoding: 'utf8',
      });
      if (archived.status !== 0) {
        throw new Error(`libtool failed: ${archived.stderr}`);
      }
      return out;
    }

    function runReal(umbrella, app, exe) {
      return runHelper(
        `rnfb_probe_assert_single_firebase_copy 1 "${productsDir}" "${umbrella}" "${app}" "${exe}"`,
      );
    }

    // These tests need the real tools, not the stubs.
    beforeEach(function () {
      ['nm', 'file', 'plutil'].forEach(name => fs.rmSync(path.join(binDir, name), { force: true }));
    });

    function healthy() {
      return {
        umbrella: compileDylib('RNFBFirebase.framework/RNFBFirebase', 'FIRApp'),
        app: compileDylib('RNFBApp/RNFBApp.framework/RNFBApp', 'RNFBAppLookalike'),
        exe: compileExecutable(APP_EXECUTABLE, 'AppLookalike'),
      };
    }

    it('sees FIRApp defined in the umbrella and absent from RNFBApp and the app executable', function () {
      const { umbrella, app, exe } = healthy();
      const result = runReal(umbrella, app, exe);
      expect(result.stdout).toContain('_OBJC_CLASS_$_FIRApp');
      expect(result.stdout).toContain(`nm sweep: ${exe}: no FIRApp (app executable)`);
      expect(result.status).toBe(0);
    });

    it('fails when real nm shows FIRApp inside RNFBApp', function () {
      const umbrella = compileDylib('RNFBFirebase.framework/RNFBFirebase', 'FIRApp');
      const app = compileDylib('RNFBApp/RNFBApp.framework/RNFBApp', 'FIRApp');
      const exe = compileExecutable(APP_EXECUTABLE, 'AppLookalike');
      const result = runReal(umbrella, app, exe);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('FIRApp defined inside RNFBApp.framework');
    });

    it('fails when the real app executable defines FIRApp', function () {
      const umbrella = compileDylib('RNFBFirebase.framework/RNFBFirebase', 'FIRApp');
      const app = compileDylib('RNFBApp/RNFBApp.framework/RNFBApp', 'RNFBAppLookalike');
      const exe = compileExecutable(APP_EXECUTABLE, 'FIRApp');
      const result = runReal(umbrella, app, exe);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(`Offending binaries: ${exe}`);
    });

    it('sees FIRApp defined only in the umbrella across every framework binary', function () {
      const { umbrella, app, exe } = healthy();
      compileDylib('testrnbare.app/Frameworks/RNFBFirebase.framework/RNFBFirebase', 'FIRApp');
      compileDylib('PackageFrameworks/Other.framework/Other', 'OtherLookalike');
      // A text file named like its framework is logged and skipped, not an nm failure.
      writeBinary('Resources.framework/Resources', ['plain text']);
      const result = runReal(umbrella, app, exe);
      expect(result.stdout).toContain(
        'nm sweep: 5 framework directories, scanned 4 framework binaries (1 non-Mach-O skipped) plus 1 app executable(s)',
      );
      expect(result.status).toBe(0);
    });

    it('fails when real nm shows a second dylib defining FIRApp', function () {
      const { umbrella, app, exe } = healthy();
      const second = compileDylib('testrnbare.app/Frameworks/Other.framework/Other', 'FIRApp');
      const result = runReal(umbrella, app, exe);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('defined outside RNFBFirebase.framework');
      expect(result.stdout).toContain(second);
    });

    it('fails when a real libtool static archive framework binary defines FIRApp', function () {
      const { umbrella, app, exe } = healthy();
      const archive = compileStaticArchive('Static.framework/Static', 'FIRApp');
      const result = runReal(umbrella, app, exe);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain(`nm sweep: ${archive}: defines FIRApp (NOT allowed)`);
    });

    it('passes a real libtool static archive framework binary without FIRApp', function () {
      const { umbrella, app, exe } = healthy();
      const archive = compileStaticArchive('Static.framework/Static', 'StaticLookalike');
      const result = runReal(umbrella, app, exe);
      expect(result.stdout).toContain(`nm sweep: ${archive}: no FIRApp`);
      expect(result.status).toBe(0);
    });
  });
});
