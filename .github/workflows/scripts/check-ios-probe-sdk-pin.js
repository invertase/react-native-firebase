// Verifies that the exact firebase-ios-sdk pin in the dynamic Firebase probe package
// (packages/app/ios/RNFBFirebase/Package.swift) matches sdkVersions.ios.firebase in
// packages/app/package.json. Node builtins only so CI can run it before `yarn`.
//
// Usage: node .github/workflows/scripts/check-ios-probe-sdk-pin.js [package.json] [Package.swift]
// Exit 0 when the versions match, 1 on mismatch or when either value cannot be read.

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const DEFAULT_PACKAGE_JSON = path.join(repoRoot, 'packages/app/package.json');
const DEFAULT_PACKAGE_SWIFT = path.join(repoRoot, 'packages/app/ios/RNFBFirebase/Package.swift');

// `.package(url: "<...>/firebase-ios-sdk(.git)", exact: "<version>")`, whitespace and newlines
// tolerated. Other requirement kinds (from:, branch:, ...) intentionally do not match.
const FIREBASE_EXACT_PACKAGE =
  /\.package\s*\(\s*url\s*:\s*"[^"]*\/firebase-ios-sdk(?:\.git)?"\s*,\s*exact\s*:\s*"([^"]+)"\s*\)/g;

/**
 * Replaces Swift `//` and (nested) block comments with spaces so declarations are matched
 * against code only. String literals are skipped so `https://` is not treated as a comment.
 */
function stripSwiftComments(source) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const char = source[i];
    const next = source[i + 1];
    if (char === '"') {
      let j = i + 1;
      while (j < source.length && source[j] !== '"' && source[j] !== '\n') {
        j += source[j] === '\\' ? 2 : 1;
      }
      out += source.slice(i, j + 1);
      i = j + 1;
    } else if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') {
        i += 1;
      }
    } else if (char === '/' && next === '*') {
      let depth = 1;
      i += 2;
      while (i < source.length && depth > 0) {
        if (source[i] === '/' && source[i + 1] === '*') {
          depth += 1;
          i += 2;
        } else if (source[i] === '*' && source[i + 1] === '/') {
          depth -= 1;
          i += 2;
        } else {
          i += 1;
        }
      }
      out += ' ';
    } else {
      out += char;
      i += 1;
    }
  }
  return out;
}

/** Returns the `exact:` version of the single firebase-ios-sdk declaration; throws otherwise. */
function parseSwiftExactPin(packageSwiftSource) {
  const code = stripSwiftComments(packageSwiftSource);
  const versions = Array.from(code.matchAll(FIREBASE_EXACT_PACKAGE), match => match[1]);
  if (versions.length !== 1) {
    throw new Error(
      `Expected exactly one .package(url: ".../firebase-ios-sdk.git", exact: "...") ` +
        `declaration in Package.swift, found ${versions.length}.`,
    );
  }
  return versions[0];
}

/** Returns `sdkVersions.ios.firebase` from package.json text; throws when missing. */
function readIosFirebaseVersion(packageJsonSource) {
  const version = JSON.parse(packageJsonSource)?.sdkVersions?.ios?.firebase;
  if (typeof version !== 'string' || version.trim() === '') {
    throw new Error('sdkVersions.ios.firebase is missing or not a string in package.json.');
  }
  return version;
}

/** Returns `{ ok, message }`; throws on parse failure. */
function checkProbeSdkPin({ packageJsonSource, packageSwiftSource }) {
  const expected = readIosFirebaseVersion(packageJsonSource);
  const actual = parseSwiftExactPin(packageSwiftSource);
  if (expected !== actual) {
    return {
      ok: false,
      message:
        `iOS probe SDK pin mismatch: Package.swift exact: "${actual}" but ` +
        `packages/app/package.json sdkVersions.ios.firebase is "${expected}". ` +
        'Update packages/app/ios/RNFBFirebase/Package.swift to match.',
    };
  }
  return { ok: true, message: `iOS probe SDK pin OK: firebase-ios-sdk ${expected}` };
}

function main(argv) {
  const [packageJsonPath = DEFAULT_PACKAGE_JSON, packageSwiftPath = DEFAULT_PACKAGE_SWIFT] = argv;
  try {
    const result = checkProbeSdkPin({
      packageJsonSource: fs.readFileSync(packageJsonPath, 'utf8'),
      packageSwiftSource: fs.readFileSync(packageSwiftPath, 'utf8'),
    });
    (result.ok ? console.log : console.error)(result.message);
    return result.ok ? 0 : 1;
  } catch (error) {
    console.error(`iOS probe SDK pin check failed: ${error.message}`);
    return 1;
  }
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = {
  checkProbeSdkPin,
  parseSwiftExactPin,
  readIosFirebaseVersion,
  stripSwiftComments,
};
