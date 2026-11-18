// Verifies that sdkVersions.ios.spmDeps in packages/app/package.json is compatible with the
// app-check and GoogleUtilities ranges firebase-ios-sdk's Package.swift declares at
// sdkVersions.ios.firebase. RNFB declares each with upToNextMajorVersion, so its range must
// overlap Firebase's or SPM resolution fails. Node builtins only.
//
// Usage:
//   node .github/workflows/scripts/check-ios-spm-deps.js [package.json] [Package.swift]
//     Without Package.swift, fetches it from GitHub at the sdkVersions.ios.firebase tag.
//     Exit 0 when every range overlaps, 1 when one does not or a value cannot be read.
//   node .github/workflows/scripts/check-ios-spm-deps.js --bounds <firebase version> [Package.swift]
//     Prints Firebase's lower bounds as JSON, fetching Package.swift when no path is given.

const fs = require('fs');
const https = require('https');
const path = require('path');
const { stripSwiftComments } = require('./check-ios-probe-sdk-pin.js');

const repoRoot = path.resolve(__dirname, '../../..');
const DEFAULT_PACKAGE_JSON = path.join(repoRoot, 'packages/app/package.json');

const SPM_DEPS = {
  appCheck: 'google/app-check',
  googleUtilities: 'google/GoogleUtilities',
};

const VERSION = /^\d+\.\d+\.\d+$/;
const FIREBASE_VERSION = /\blet\s+firebaseVersion\s*=\s*"([^"]*)"/;
const STRING_CONSTANT = /\blet\s+([A-Za-z_]\w*)\s*=\s*"([^"]*)"/g;
const PACKAGE_DECLARATION =
  /\.package\s*\(\s*(?:name\s*:\s*"[^"]*"\s*,\s*)?url\s*:\s*("[^"]*"|[A-Za-z_]\w*)\s*,\s*(?:"([^"]+)"\s*\.\.<\s*"([^"]+)"|from\s*:\s*"([^"]+)"|\.upToNextMajor\s*\(\s*from\s*:\s*"([^"]+)"\s*\))\s*\)/g;

function packageSwiftUrl(firebaseVersion) {
  return `https://raw.githubusercontent.com/firebase/firebase-ios-sdk/${firebaseVersion}/Package.swift`;
}

function repoPath(url) {
  return url
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
    .toLowerCase();
}

function parseVersion(version) {
  if (!VERSION.test(version)) {
    throw new Error(`"${version}" is not an x.y.z version.`);
  }
  return version.split('.').map(Number);
}

function compareVersions(a, b) {
  const [left, right] = [parseVersion(a), parseVersion(b)];
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) {
      return left[i] < right[i] ? -1 : 1;
    }
  }
  return 0;
}

function nextMajor(version) {
  return `${parseVersion(version)[0] + 1}.0.0`;
}

/**
 * Returns `{ appCheck, googleUtilities }` as `{ lower, upper }` (upper exclusive) from
 * firebase-ios-sdk's Package.swift. Resolves `let x = "<url>"` constants used as `url:`.
 * Throws unless each package has exactly one versioned declaration.
 */
function parseFirebaseSpmRanges(packageSwiftSource) {
  const code = stripSwiftComments(packageSwiftSource);
  const constants = new Map();
  for (const [, name, value] of code.matchAll(STRING_CONSTANT)) {
    constants.set(name, (constants.get(name) ?? new Set()).add(value));
  }
  const trackedKey = url =>
    Object.keys(SPM_DEPS).find(key => repoPath(url) === SPM_DEPS[key].toLowerCase());
  const found = {};
  for (const match of code.matchAll(PACKAGE_DECLARATION)) {
    const urlToken = match[1];
    const urls = urlToken.startsWith('"')
      ? [urlToken.slice(1, -1)]
      : Array.from(constants.get(urlToken) ?? []);
    const keys = urls.map(trackedKey).filter(Boolean);
    if (keys.length === 0) {
      continue;
    }
    if (urls.length > 1) {
      throw new Error(`url constant ${urlToken} is defined with more than one value.`);
    }
    const lower = match[2] ?? match[4] ?? match[5];
    (found[keys[0]] ??= []).push({ lower, upper: match[3] ?? nextMajor(lower) });
  }
  const result = {};
  for (const [key, repo] of Object.entries(SPM_DEPS)) {
    const ranges = found[key] ?? [];
    if (ranges.length !== 1) {
      throw new Error(
        `Expected exactly one versioned .package(url: ".../${repo}.git", ...) declaration ` +
          `in firebase-ios-sdk Package.swift, found ${ranges.length}.`,
      );
    }
    result[key] = ranges[0];
  }
  return result;
}

/** Throws when Package.swift declares a `firebaseVersion` other than `expected`. */
function assertPackageSwiftVersion(packageSwiftSource, expected) {
  const declared = stripSwiftComments(packageSwiftSource).match(FIREBASE_VERSION)?.[1];
  if (declared !== undefined && declared !== expected) {
    throw new Error(`Package.swift is for firebase-ios-sdk ${declared}, expected ${expected}.`);
  }
}

/** Returns `{ appCheck, googleUtilities }` lower bounds from firebase-ios-sdk's Package.swift. */
function parseFirebaseSpmDeps(packageSwiftSource) {
  const ranges = parseFirebaseSpmRanges(packageSwiftSource);
  return Object.fromEntries(Object.entries(ranges).map(([key, range]) => [key, range.lower]));
}

/** Returns `{ firebase, spmDeps }` from package.json text; throws when a value is missing. */
function readIosSpmConfig(packageJsonSource) {
  const ios = JSON.parse(packageJsonSource)?.sdkVersions?.ios;
  const firebase = ios?.firebase;
  if (typeof firebase !== 'string' || firebase.trim() === '') {
    throw new Error('sdkVersions.ios.firebase is missing or not a string in package.json.');
  }
  const spmDeps = {};
  for (const key of Object.keys(SPM_DEPS)) {
    const version = ios?.spmDeps?.[key];
    if (typeof version !== 'string' || !VERSION.test(version)) {
      throw new Error(`sdkVersions.ios.spmDeps.${key} is missing or not x.y.z in package.json.`);
    }
    spmDeps[key] = version;
  }
  return { firebase, spmDeps };
}

function overlaps(rnfbLower, { lower, upper }) {
  return compareVersions(rnfbLower, upper) < 0 && compareVersions(lower, nextMajor(rnfbLower)) < 0;
}

/** Returns `{ ok, message }`; throws on parse failure. */
function checkSpmDeps({ packageJsonSource, packageSwiftSource }) {
  const { firebase, spmDeps } = readIosSpmConfig(packageJsonSource);
  assertPackageSwiftVersion(packageSwiftSource, firebase);
  const required = parseFirebaseSpmRanges(packageSwiftSource);
  const describe = key =>
    `${key} ${spmDeps[key]} ..< ${nextMajor(spmDeps[key])} ` +
    `(Firebase ${required[key].lower} ..< ${required[key].upper})`;
  const mismatches = Object.keys(SPM_DEPS).filter(key => !overlaps(spmDeps[key], required[key]));
  if (mismatches.length > 0) {
    return {
      ok: false,
      message:
        `iOS SPM dependency ranges do not overlap firebase-ios-sdk ${firebase}: ` +
        `${mismatches.map(describe).join('; ')}. ` +
        'Update sdkVersions.ios.spmDeps in packages/app/package.json.',
    };
  }
  return {
    ok: true,
    message:
      `iOS SPM dependencies OK for firebase-ios-sdk ${firebase}: ` +
      Object.keys(SPM_DEPS).map(describe).join(', '),
  };
}

function fetchText(
  url,
  { attempts = 3, timeoutMs = 60000, maxRedirects = 3, retryDelayMs = 1000 } = {},
) {
  const deadlineAt = Date.now() + timeoutMs;
  const timeoutError = () => new Error(`GET ${url} timed out after ${timeoutMs}ms`);
  const once = () =>
    new Promise((resolve, reject) => {
      let settled = false;
      let req;
      const settle = (callback, value) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          callback(value);
        }
      };
      const fail = (error, retryable) => {
        if (!settled) {
          error.retryable ??= retryable;
          settle(reject, error);
        }
      };
      const timer = setTimeout(
        () => {
          fail(timeoutError(), false);
          req?.destroy();
        },
        Math.max(0, deadlineAt - Date.now()),
      );
      const get = (target, redirectsLeft) => {
        try {
          const current = https.get(target, res => {
            if (settled || current !== req) {
              res.resume();
              return;
            }
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              res.resume();
              if (redirectsLeft <= 0) {
                fail(new Error(`GET ${url} failed: too many redirects`), false);
                return;
              }
              let next;
              try {
                next = new URL(res.headers.location, target).toString();
              } catch (error) {
                fail(error, false);
                return;
              }
              get(next, redirectsLeft - 1);
              return;
            }
            if (res.statusCode !== 200) {
              res.resume();
              const retryable = res.statusCode === 429 || res.statusCode >= 500;
              fail(new Error(`GET ${url} failed: HTTP ${res.statusCode}`), retryable);
              return;
            }
            let body = '';
            res.setEncoding('utf8');
            res.on('data', chunk => {
              body += chunk;
            });
            res.on('end', () => settle(resolve, body));
            res.on('error', error => fail(error, true));
          });
          req = current;
          current.on('error', error => {
            if (current === req) {
              fail(error, true);
            }
          });
        } catch (error) {
          fail(error, false);
        }
      };
      get(url, maxRedirects);
    });
  const attempt = async remaining => {
    try {
      return await once();
    } catch (error) {
      const delay = retryDelayMs * (attempts - remaining + 1);
      if (remaining <= 1 || !error.retryable || Date.now() + delay >= deadlineAt) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return attempt(remaining - 1);
    }
  };
  return attempt(attempts);
}

async function readPackageSwift(firebaseVersion, packageSwiftPath) {
  return packageSwiftPath
    ? fs.readFileSync(packageSwiftPath, 'utf8')
    : fetchText(packageSwiftUrl(firebaseVersion));
}

async function main(argv) {
  try {
    if (argv[0] === '--bounds') {
      const [, firebaseVersion, packageSwiftPath] = argv;
      if (!firebaseVersion) {
        throw new Error('--bounds needs <firebase version> [Package.swift].');
      }
      const source = await readPackageSwift(firebaseVersion, packageSwiftPath);
      assertPackageSwiftVersion(source, firebaseVersion);
      console.log(JSON.stringify(parseFirebaseSpmDeps(source)));
      return 0;
    }
    const [packageJsonPath = DEFAULT_PACKAGE_JSON, packageSwiftPath] = argv;
    const packageJsonSource = fs.readFileSync(packageJsonPath, 'utf8');
    const packageSwiftSource = await readPackageSwift(
      readIosSpmConfig(packageJsonSource).firebase,
      packageSwiftPath,
    );
    const result = checkSpmDeps({ packageJsonSource, packageSwiftSource });
    (result.ok ? console.log : console.error)(result.message);
    return result.ok ? 0 : 1;
  } catch (error) {
    console.error(`iOS SPM dependency check failed: ${error.message}`);
    return 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(code => process.exit(code));
}

module.exports = {
  assertPackageSwiftVersion,
  checkSpmDeps,
  fetchText,
  packageSwiftUrl,
  parseFirebaseSpmDeps,
  parseFirebaseSpmRanges,
  readIosSpmConfig,
};
