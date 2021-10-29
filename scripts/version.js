const { sep } = require('path');
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { exit } = require('process');

const packages = JSON.parse(execSync('npx lerna ls --json').toString('utf-8'));

const firebaseAppPackageName = '@react-native-firebase/app';
const lernaVersion = JSON.parse(readFileSync('lerna.json')).version;
console.log(`Found lerna version: ${lernaVersion}`);

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
  if (!packageJsonContents.version === lernaVersion) {
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
