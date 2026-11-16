const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, '.github/workflows/scripts/check-duplicate-objc-classes.sh');

// Prints `<binary>.objc` as the -objc listing; exits with the code in
// `<binary>.exit` (after printing `<binary>.err` to stderr) when present.
const STUB_DYLD_INFO = `#!/bin/bash
bin="$2"
if [[ -f "$bin.exit" ]]; then
  cat "$bin.err" >&2 2>/dev/null || true
  exit "$(cat "$bin.exit")"
fi
cat "$bin.objc" 2>/dev/null || true
`;

function objc(binaryPath, interfaces) {
  const body = interfaces
    .map(line => `        ${line}\n          0x00001000  -[Stub method]\n        @end`)
    .join('\n');
  return `${binaryPath} [arm64]:\n    -objc:\n${body}\n`;
}

function framework(name, interfaces) {
  return { rel: `Frameworks/${name}.framework/${name}`, interfaces };
}

const RNFB_APP = framework('RNFBApp', [
  '@interface PodsDummy_RNFBApp : NSObject',
  '@interface RNFBAppModule : NSObject <NativeRNFBTurboAppSpec, RCTInvalidating>',
]);
const GOOGLE_UTILITIES = framework('GoogleUtilities_1A2B_PackageProduct', [
  '@interface GULNetwork : NSObject',
  '@interface GULAppEnvironmentUtil : NSObject',
]);
const MAIN = {
  rel: 'App',
  interfaces: ['@interface AppDelegate : EXAppDelegateWrapper', '@interface NSString(RNSUtility)'],
};

describe('check-duplicate-objc-classes.sh', function () {
  let workDir;
  let appDir;
  let stubPath;

  beforeEach(function () {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-dup-objc-'));
    appDir = path.join(workDir, 'App.app');
    fs.mkdirSync(path.join(appDir, 'Frameworks'), { recursive: true });
    stubPath = path.join(workDir, 'dyld_info');
    fs.writeFileSync(stubPath, STUB_DYLD_INFO, { mode: 0o755 });
  });

  afterEach(function () {
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  function addBinary({ rel, interfaces, exitCode, stderr, raw }) {
    const binaryPath = path.join(appDir, rel);
    fs.mkdirSync(path.dirname(binaryPath), { recursive: true });
    fs.writeFileSync(binaryPath, '');
    fs.writeFileSync(`${binaryPath}.objc`, raw ?? objc(binaryPath, interfaces || []));
    if (exitCode !== undefined) {
      fs.writeFileSync(`${binaryPath}.exit`, String(exitCode));
      fs.writeFileSync(`${binaryPath}.err`, stderr || '');
    }
  }

  function run(env = {}) {
    const result = spawnSync('bash', [scriptPath, appDir], {
      encoding: 'utf8',
      env: { ...process.env, RNFB_DYLD_INFO: stubPath, ...env },
    });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  }

  function addGreenGraph() {
    addBinary(MAIN);
    addBinary(RNFB_APP);
    addBinary(GOOGLE_UTILITIES);
  }

  it('passes a graph with no duplicate classes and reports the canary owner', function () {
    addGreenGraph();
    const { status, output } = run();
    expect(status).toBe(0);
    expect(output).toContain(
      'scanned 3 binaries in ' +
        appDir +
        ': 5 distinct classes (2 in RNFB* frameworks), 0 duplicated',
    );
    expect(output).toContain(
      'GULNetwork defined once, in Frameworks/GoogleUtilities_1A2B_PackageProduct.framework/GoogleUtilities_1A2B_PackageProduct',
    );
    expect(output).toContain('PASS: no Objective-C class is defined in more than one binary');
  });

  it('does not count categories, with or without a space, as class definitions', function () {
    addGreenGraph();
    addBinary(
      framework('ExpoFont', [
        '@interface UIFont(ExpoFont)',
        '@interface GULNetwork(Extra)',
        '@interface RNFBAppModule (Spaced)',
        '@interface _TtC8ExpoFont10FontLoader : NSObject',
      ]),
    );
    const { status, output } = run();
    expect(status).toBe(0);
    expect(output).toContain('6 distinct classes (2 in RNFB* frameworks), 0 duplicated');
  });

  it('scans app-root and Frameworks dylibs', function () {
    addGreenGraph();
    addBinary({ rel: 'libRoot.dylib', interfaces: ['@interface RootOnly : NSObject'] });
    addBinary({
      rel: 'Frameworks/libSwiftShim.dylib',
      interfaces: ['@interface GULNetwork : NSObject'],
    });
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain('scanned 5 binaries');
    expect(output).toContain(
      'ERROR: duplicate class GULNetwork: Frameworks/GoogleUtilities_1A2B_PackageProduct.framework/GoogleUtilities_1A2B_PackageProduct, Frameworks/libSwiftShim.dylib',
    );
  });

  it('fails on a single duplicated class and names every owner', function () {
    addGreenGraph();
    addBinary(
      framework('AppCheckCore_9F_PackageProduct', [
        '@interface GACAppCheck : NSObject',
        '@interface RNFBAppModule : NSObject',
      ]),
    );
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain(
      'ERROR: duplicate class RNFBAppModule: Frameworks/AppCheckCore_9F_PackageProduct.framework/AppCheckCore_9F_PackageProduct, Frameworks/RNFBApp.framework/RNFBApp',
    );
    expect(output).toContain('ERROR: 1 Objective-C class is defined in more than one binary');
  });

  it('fails on several duplicated classes and reports the count', function () {
    addGreenGraph();
    const shared = ['@interface GACAppCheck : NSObject', '@interface GACAppCheckToken : NSObject'];
    addBinary(framework('RNFBAppCheck', ['@interface RNFBAppCheckModule : NSObject', ...shared]));
    addBinary(framework('AppCheckCore_9F_PackageProduct', shared));
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain('ERROR: duplicate class GACAppCheck: ');
    expect(output).toContain('ERROR: duplicate class GACAppCheckToken: ');
    expect(output).toContain('ERROR: 2 Objective-C classes are defined in more than one binary');
  });

  it('fails when dyld_info is missing', function () {
    addGreenGraph();
    const missing = path.join(workDir, 'no-such-dyld_info');
    const { status, output } = run({ RNFB_DYLD_INFO: missing });
    expect(status).toBe(1);
    expect(output).toContain(`ERROR: ${missing} not found`);
  });

  it('fails when dyld_info exits non-zero', function () {
    addGreenGraph();
    addBinary({ ...RNFB_APP, exitCode: 2, stderr: 'cannot open file' });
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain(
      'ERROR: dyld_info could not read Frameworks/RNFBApp.framework/RNFBApp: cannot open file',
    );
  });

  it('fails when dyld_info prints a warning line', function () {
    addGreenGraph();
    const binaryPath = path.join(appDir, RNFB_APP.rel);
    addBinary({
      ...RNFB_APP,
      raw: `${objc(binaryPath, RNFB_APP.interfaces)}warning: chained fixups could not be parsed\n`,
    });
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain(
      'ERROR: dyld_info warned on Frameworks/RNFBApp.framework/RNFBApp: warning: chained fixups could not be parsed',
    );
  });

  it('ignores method names containing "warning:"', function () {
    addGreenGraph();
    const binaryPath = path.join(appDir, RNFB_APP.rel);
    addBinary({
      ...RNFB_APP,
      raw: `${objc(binaryPath, RNFB_APP.interfaces)}          0x00002000  -[RNFBAppModule log:warning:]\n`,
    });
    const { status } = run();
    expect(status).toBe(0);
  });

  it('fails when no RNFB* framework defines a class', function () {
    addBinary(MAIN);
    addBinary(GOOGLE_UTILITIES);
    addBinary(framework('RNFBApp', ['@interface NSObject(RNFBOnlyCategory)']));
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain('(0 in RNFB* frameworks)');
    expect(output).toContain('ERROR: found no classes overall or in any RNFB* framework');
  });

  it('fails when the GULNetwork canary is missing', function () {
    addBinary(MAIN);
    addBinary(RNFB_APP);
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain('ERROR: GoogleUtilities canary GULNetwork not found');
  });

  it('fails when a framework has no executable', function () {
    addGreenGraph();
    fs.mkdirSync(path.join(appDir, 'Frameworks/Empty.framework'));
    const { status, output } = run();
    expect(status).toBe(1);
    expect(output).toContain(
      'ERROR: expected Mach-O binary missing: Frameworks/Empty.framework/Empty',
    );
  });

  it('fails when the app bundle does not exist', function () {
    const missingApp = path.join(workDir, 'Missing.app');
    const result = spawnSync('bash', [scriptPath, missingApp], {
      encoding: 'utf8',
      env: { ...process.env, RNFB_DYLD_INFO: stubPath },
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain(`ERROR: app bundle not found: ${missingApp}`);
  });
});
