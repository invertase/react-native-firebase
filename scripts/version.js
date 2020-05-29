const { sep } = require('path');
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const packages = JSON.parse(execSync('lerna ls --json').toString('utf-8'));

const firebaseAppPackageName = '@react-native-firebase/app';
const firebaseAppPackageVersion = packages.find(package => package.name == firebaseAppPackageName)
  .version;

packages.forEach(package => {
  if (package.name == firebaseAppPackageName) {
    return;
  }
  const { location } = package;

  // ---------------------------
  //    Fix Changelog Links
  // ---------------------------
  // Links to commits/PRs are broken on conventional-commits-changelog
  const changelogPath = `${location}${sep}/CHANGELOG.md`;
  let changelogContents = readFileSync(changelogPath).toString('utf-8');
  changelogContents = changelogContents.replace(
    /github\.com\/invertase\/react-native-firebase\/(tree\/master\/packages\/[a-z-]*\/)/gm,
    'github.com/invertase/react-native-firebase/',
  );
  writeFileSync(changelogPath, changelogContents);

  // ---------------------------
  //      Format Changelog
  // ---------------------------
  execSync(`prettier --write ${changelogPath}`);

  // ---------------------------
  //   Update Peer Dependencies
  // ---------------------------
  const packageJsonPath = `${location}${sep}/package.json`;
  const packageJsonContents = JSON.parse(readFileSync(packageJsonPath).toString('utf-8'));
  if (!packageJsonContents.peerDependencies) {
    return;
  }
  if (!packageJsonContents.peerDependencies[firebaseAppPackageName]) {
    return;
  }
  if (packageJsonContents.peerDependencies[firebaseAppPackageName] === firebaseAppPackageVersion) {
    return;
  }

  packageJsonContents.peerDependencies[firebaseAppPackageName] = firebaseAppPackageVersion;

  writeFileSync(packageJsonPath, JSON.stringify(packageJsonContents, null, 2) + '\n');

  execSync(`git add ${packageJsonPath}`);

  execSync(`git commit -m "build(${packageJsonContents.name.replace('@react-native-firebase/', '')}): update core peer dependency to v${firebaseAppPackageVersion} [publish]"`);

  console.log(
    `Updated '${firebaseAppPackageName}' peer dependency on package`,
    packageJsonContents.name,
    'to',
    packageJsonContents.peerDependencies[firebaseAppPackageName],
  );
});
