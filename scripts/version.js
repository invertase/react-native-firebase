const { sep } = require('path');
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const packages = JSON.parse(execSync('lerna ls --json').toString('utf-8'));

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
    /github\.com\/invertase\/react-native-firebase\/(tree\/master\/packages\/[a-z-]*\/)/gm,
    'github.com/invertase/react-native-firebase/',
  );
  writeFileSync(changelogPath, changelogContents);

  // ---------------------------
  //      Format Changelog
  // ---------------------------
  execSync(`prettier --write ${changelogPath}`);
});
