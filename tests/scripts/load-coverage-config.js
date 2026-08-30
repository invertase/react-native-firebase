'use strict';

/**
 * Load / resolve RNFB test-app coverage config (package-aligned shape).
 * Neutral defaults contain no product names; RNFB values live in
 * `tests/react-native-coverage.config.js`.
 * App runtime (Metro) uses `tests/coverage-runtime-config.js` — keep
 * `nativeModuleName`/`enabled` in sync (no Node builtins in the runtime file).
 */

const fs = require('fs');
const path = require('path');

const testsDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(testsDir, '..');
const DEFAULT_CONFIG_PATH = path.join(testsDir, 'react-native-coverage.config.js');

/** @typedef {{ kind: 'after-marker', marker: string, includeMarker?: boolean } | { kind: 'regex', pattern: string, flags?: string, replacement: string }} SourcePathRewriteRule */

/**
 * @typedef {object} CoverageConfig
 * @property {boolean} enabled
 * @property {string} nativeModuleName
 * @property {{ androidApplicationId: string, iosBundleId: string, iosProductName: string }} app
 * @property {{ frameworkNamePrefixes: string[], profileFilePattern: string }} ios
 * @property {{
 *   libraryProjectMatchers: string[],
 *   detoxStagingPath: string,
 *   coverageRelativePath: string,
 *   coverageFileName: string,
 *   jacocoReportXml: string,
 * }} android
 * @property {SourcePathRewriteRule[]} sourcePathRewrite
 * @property {boolean} strict
 * @property {{
 *   lcovPathIncludes: string[],
 *   jacocoPackageIncludes: string[],
 *   defaultLcovPath: string,
 *   defaultJacocoXmlPath: string,
 * }} assert
 */

/** @type {CoverageConfig} */
const NEUTRAL_DEFAULTS = {
  enabled: true,
  nativeModuleName: 'Coverage',
  app: {
    androidApplicationId: 'com.example.coverage',
    iosBundleId: 'com.example.coverage',
    iosProductName: 'CoverageExample',
  },
  ios: {
    frameworkNamePrefixes: [],
    profileFilePattern: 'coverage-%m.profraw',
  },
  android: {
    libraryProjectMatchers: [],
    detoxStagingPath: '/data/local/tmp/coverage/coverage.ec',
    coverageRelativePath: 'files/coverage.ec',
    coverageFileName: 'coverage.ec',
    jacocoReportXml: 'android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml',
  },
  sourcePathRewrite: [],
  strict: true,
  assert: {
    lcovPathIncludes: ['packages/'],
    jacocoPackageIncludes: [],
    defaultLcovPath: 'coverage/ios/lcov.info',
    defaultJacocoXmlPath: 'android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml',
  },
};

/**
 * @param {Partial<CoverageConfig> & {
 *   app?: Partial<CoverageConfig['app']>,
 *   ios?: Partial<CoverageConfig['ios']>,
 *   android?: Partial<CoverageConfig['android']>,
 *   assert?: Partial<CoverageConfig['assert']>,
 * }} [input]
 * @returns {CoverageConfig}
 */
function resolveCoverageConfig(input = {}) {
  return {
    enabled: input.enabled ?? NEUTRAL_DEFAULTS.enabled,
    nativeModuleName: input.nativeModuleName ?? NEUTRAL_DEFAULTS.nativeModuleName,
    app: { ...NEUTRAL_DEFAULTS.app, ...input.app },
    ios: { ...NEUTRAL_DEFAULTS.ios, ...input.ios },
    android: { ...NEUTRAL_DEFAULTS.android, ...input.android },
    sourcePathRewrite: input.sourcePathRewrite ?? NEUTRAL_DEFAULTS.sourcePathRewrite,
    strict: input.strict ?? NEUTRAL_DEFAULTS.strict,
    assert: { ...NEUTRAL_DEFAULTS.assert, ...input.assert },
  };
}

/**
 * @param {string} [configPath]
 * @returns {CoverageConfig}
 */
function loadCoverageConfig(configPath = DEFAULT_CONFIG_PATH) {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    return resolveCoverageConfig();
  }
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const raw = require(resolved);
  return resolveCoverageConfig(raw);
}

/**
 * @param {string} sourcePath
 * @param {SourcePathRewriteRule[]} rules
 * @returns {string}
 */
function applySourcePathRewrite(sourcePath, rules) {
  let normalized = sourcePath.replace(/\\/g, '/');

  for (const rule of rules) {
    if (rule.kind === 'after-marker') {
      const idx = normalized.indexOf(rule.marker);
      if (idx < 0) {
        continue;
      }
      const includeMarker = rule.includeMarker !== false;
      if (includeMarker) {
        const marker = rule.marker.startsWith('/') ? rule.marker.slice(1) : rule.marker;
        // marker in path may be `/packages/`; returned path should start at `packages/`
        const from = rule.marker.startsWith('/') ? idx + 1 : idx;
        return normalized.slice(from).replace(/^\//, '') || marker;
      }
      return normalized.slice(idx + rule.marker.length).replace(/^\//, '');
    }

    if (rule.kind === 'regex') {
      const re = new RegExp(rule.pattern, rule.flags || '');
      if (re.test(normalized)) {
        return normalized.replace(re, rule.replacement);
      }
    }
  }

  return normalized.replace(/^\.\//, '');
}

/**
 * @param {string} name
 * @param {string[]} prefixes
 */
function nameStartsWithAnyPrefix(name, prefixes) {
  if (!prefixes || prefixes.length === 0) {
    return false;
  }
  return prefixes.some(prefix => name.startsWith(prefix));
}

/**
 * @param {string} haystack
 * @param {string[]} needles
 */
function includesAny(haystack, needles) {
  if (!needles || needles.length === 0) {
    return true;
  }
  const lower = haystack.toLowerCase();
  return needles.some(n => lower.includes(String(n).toLowerCase()));
}

/**
 * Resolve strict mode from argv / env / config default.
 * @param {string[]} argv
 * @param {CoverageConfig} config
 */
function resolveStrict(argv, config) {
  if (argv.includes('--no-strict')) {
    return false;
  }
  if (argv.includes('--strict')) {
    return true;
  }
  if (process.env.RNFB_COVERAGE_STRICT === '0') {
    return false;
  }
  if (process.env.RNFB_COVERAGE_STRICT === '1') {
    return true;
  }
  return config.strict;
}

/**
 * @param {string} relativePath
 */
function resolveRepoPath(relativePath) {
  return path.isAbsolute(relativePath) ? relativePath : path.join(repoRoot, relativePath);
}

module.exports = {
  NEUTRAL_DEFAULTS,
  DEFAULT_CONFIG_PATH,
  repoRoot,
  testsDir,
  resolveCoverageConfig,
  loadCoverageConfig,
  applySourcePathRewrite,
  nameStartsWithAnyPrefix,
  includesAny,
  resolveStrict,
  resolveRepoPath,
};
