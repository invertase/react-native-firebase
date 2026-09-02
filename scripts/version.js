const { sep } = require('path');
const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { exit } = require('process');

// Darwin macOS-pod path only. Drop when tests-macos RN ships fmt 12.1.0 upstream (today 0.78.3).
const TESTS_MACOS_FMT_FLOOR = '12.1.0';
const TESTS_MACOS_FMT_PODSPEC_CANDIDATES = [
  'tests-macos/node_modules/react-native/third-party-podspecs/fmt.podspec',
  'node_modules/react-native/third-party-podspecs/fmt.podspec',
];

const POD_LOCKFILE_PATHS = [
  'tests/ios/Podfile.lock',
  'tests/ios/testing.xcodeproj/project.pbxproj',
  'tests-macos/macos/Podfile.lock',
  'tests-macos/macos/io.invertase.testing.xcodeproj/project.pbxproj',
];

function parseFmtPodspecVersions(podspecContents) {
  const spec = podspecContents.match(/spec\.version[^\n]*?(\d+\.\d+\.\d+)/);
  const tag = podspecContents.match(/:tag[^\n]*?(\d+\.\d+\.\d+)/);
  return {
    specVersion: spec && spec[1],
    tag: tag && tag[1],
  };
}

function isSemverAtLeast(version, floor) {
  if (!version) {
    return false;
  }
  const actual = version.split('.').map(part => Number(part));
  const minimum = floor.split('.').map(part => Number(part));
  const length = Math.max(actual.length, minimum.length);
  for (let i = 0; i < length; i++) {
    const a = actual[i] || 0;
    const b = minimum[i] || 0;
    if (a > b) {
      return true;
    }
    if (a < b) {
      return false;
    }
  }
  return true;
}

function fmtPodspecMeetsFloor(podspecContents, floor = TESTS_MACOS_FMT_FLOOR) {
  const { specVersion, tag } = parseFmtPodspecVersions(podspecContents);
  return isSemverAtLeast(specVersion, floor) && isSemverAtLeast(tag, floor);
}

function resolveTestsMacosFmtPodspecPath(candidates = TESTS_MACOS_FMT_PODSPEC_CANDIDATES) {
  const scanned = [];
  for (const candidate of candidates) {
    scanned.push(candidate);
    if (existsSync(candidate)) {
      return { specPath: candidate, scanned };
    }
  }
  return { specPath: undefined, scanned };
}

function assertTestsMacosFmtAtLeastFloor() {
  // Darwin macOS-pod path only (tests-macos, then hoisted). Drop when tests-macos RN ships fmt 12.1.0 upstream (today 0.78.3).
  const { specPath, scanned } = resolveTestsMacosFmtPodspecPath();
  if (!specPath) {
    console.error(`fmt gate: missing fmt.podspec; scanned: ${scanned.join(', ')}`);
    exit(1);
  }
  const podspecContents = readFileSync(specPath, 'utf8');
  if (!fmtPodspecMeetsFloor(podspecContents)) {
    const { specVersion, tag } = parseFmtPodspecVersions(podspecContents);
    console.error(
      `fmt gate failed: need spec.version and :tag >= ${TESTS_MACOS_FMT_FLOOR} in ${specPath} (today RN 0.78.3). Found spec.version=${specVersion} :tag=${tag}`,
    );
    exit(1);
  }
}

if (process.argv.includes('--self-check-fmt-gate')) {
  const tooOld = '  spec.version = "11.0.2"\n  :tag => "11.0.2"\n';
  const ok = '  spec.version = "12.1.0"\n  :tag => "12.1.0"\n';
  if (fmtPodspecMeetsFloor(tooOld) || !fmtPodspecMeetsFloor(ok)) {
    console.error('fmt gate self-check failed: 11.0.2 must reject and 12.1.0 must accept');
    exit(1);
  }
  const missing = resolveTestsMacosFmtPodspecPath(['/nonexistent/fmt.podspec']);
  if (missing.specPath || missing.scanned.join(',') !== '/nonexistent/fmt.podspec') {
    console.error('fmt gate self-check failed: missing podspec must report the scanned path');
    exit(1);
  }
  console.log('fmt gate self-check: 11.0.2 rejects, 12.1.0 accepts');
  exit(0);
}

const packages = JSON.parse(execSync('npx lerna ls --json').toString('utf-8'));

const firebaseAppPackageName = '@react-native-firebase/app';
const lernaVersion = JSON.parse(readFileSync('lerna.json')).version;
console.log(`Found lerna version: ${lernaVersion}`);

const syncTestAppVersions = packageJsonPath => {
  const packageJsonContents = JSON.parse(readFileSync(packageJsonPath).toString('utf-8'));

  packageJsonContents.version = lernaVersion;

  Object.keys(packageJsonContents.dependencies).forEach(dependencyName => {
    if (
      dependencyName.startsWith('@react-native-firebase/') &&
      dependencyName !== '@react-native-firebase/app-types'
    ) {
      packageJsonContents.dependencies[dependencyName] = lernaVersion;
    }
  });

  writeFileSync(packageJsonPath, JSON.stringify(packageJsonContents, null, 2) + '\n');
  console.log(`Synced RNFB workspace pins in ${packageJsonPath} to ${lernaVersion}`);
};

packages.forEach(package => {
  const { location } = package;

  // ---------------------------
  //    Fix Changelog Links
  // ---------------------------
  // Links to commits/PRs are broken on conventional-commits-changelog
  const changelogPath = `${location}${sep}/CHANGELOG.md`;
  console.log(`Fixing changelog links & formatting: ${changelogPath}`);

  let changelogContents = readFileSync(changelogPath).toString('utf-8');
  changelogContents = changelogContents.replace(
    /github\.com\/invertase\/react-native-firebase\/(tree\/main\/packages\/[a-z-]*\/)/gm,
    'github.com/invertase/react-native-firebase/',
  );
  writeFileSync(changelogPath, changelogContents);

  // ---------------------------
  //      Format Changelog
  // ---------------------------
  execSync(`npx prettier --write ${changelogPath}`);

  // ---------------------------
  //   Update Peer Dependencies
  // ---------------------------
  const packageJsonPath = `${location}${sep}/package.json`;
  const packageJsonContents = JSON.parse(readFileSync(packageJsonPath).toString('utf-8'));

  // Make sure that the app package has the correct version, it has been failing periodically
  if (packageJsonContents.version !== lernaVersion) {
    console.log(
      `app package version ${packageJsonContents.version} but should be ${lernaVersion}? Exiting.`,
    );
    exit(1);
  }
  // console.log(`Examining package ${package.name} for local peerDepencenies...`);

  if (!packageJsonContents.peerDependencies) {
    return;
  }

  packages.forEach(possiblePeerDependency => {
    // console.log(`  checking for cross-dependency on ${possiblePeerDependency.name}`);
    if (!packageJsonContents.peerDependencies[possiblePeerDependency.name]) {
      return;
    }
    if (packageJsonContents.peerDependencies[possiblePeerDependency.name] === lernaVersion) {
      return;
    }

    packageJsonContents.peerDependencies[possiblePeerDependency.name] = lernaVersion;

    writeFileSync(packageJsonPath, JSON.stringify(packageJsonContents, null, 2) + '\n');

    console.log(
      `Updated '${possiblePeerDependency.name}' peer dependency on package`,
      packageJsonContents.name,
      'to',
      packageJsonContents.peerDependencies[possiblePeerDependency.name],
    );
  });
});

syncTestAppVersions(`tests${sep}package.json`);
syncTestAppVersions(`tests-macos${sep}package.json`);
syncTestAppVersions(`test-expo${sep}package.json`);
syncTestAppVersions(`test-rn-bare${sep}package.json`);
// test-expo and test-rn-bare are Yarn workspaces but not lerna packages, so
// their package.json files are not auto-staged by `lerna version`. Stage all
// synced manifests explicitly (same pattern as POD_LOCKFILE_PATHS below) so
// publish does not leave a dirty tree. test-rn-bare is not in the Darwin
// `pod install` loop; its Podfile.lock is not checked in.
execSync(
  `git add -- tests${sep}package.json tests-macos${sep}package.json test-expo${sep}package.json test-rn-bare${sep}package.json`,
  { stdio: 'inherit' },
);

// Darwin-only: refresh CocoaPods lockfiles during `lerna version` so the release
// commit includes them. Publish CI is macos-26 so this path runs there; Linux
// (local or otherwise) skips it.
if (process.platform === 'darwin') {
  assertTestsMacosFmtAtLeastFloor();

  execSync('yarn tests:ios:pod:install', { stdio: 'inherit' });
  execSync('yarn tests:macos:pod:install', { stdio: 'inherit' });
  execSync(`git add -- ${POD_LOCKFILE_PATHS.join(' ')}`, { stdio: 'inherit' });

  // Second run verifies the staged lockfile/pbxproj update is idempotent and will not keep drifting after the release commit.
  execSync('yarn tests:ios:pod:install', { stdio: 'inherit' });
  execSync('yarn tests:macos:pod:install', { stdio: 'inherit' });
  execSync(`git diff --exit-code -- ${POD_LOCKFILE_PATHS.join(' ')}`, { stdio: 'inherit' });
}
