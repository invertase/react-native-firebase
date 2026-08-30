#!/usr/bin/env node
/**
 * Interim RNFB native-coverage presence / silent-fail guard.
 *
 * Mirrors react-native-coverage CLI assert semantics:
 *   exit 0 — expected artifacts present with non-empty package hits
 *   exit 1 — unexpected error / bad invocation
 *   exit 2 — strict empty-hit / missing artifact (CI guard)
 *
 * Prefer package `rn-coverage assert` once that CLI is wired into RNFB; until
 * then this script is the CI/local guard for sabotaged or empty native pipelines.
 *
 * Usage:
 *   node tests/scripts/assert-native-coverage-presence.js [--platform=ios|android|all]
 *       [--lcov <path>] [--jacoco-xml <path>] [--strict|--no-strict]
 *
 * Default: --platform=all --strict
 * Soft local: --no-strict or RNFB_COVERAGE_STRICT=0
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  loadCoverageConfig,
  resolveRepoPath,
  resolveStrict,
  includesAny,
} = require('./load-coverage-config');

const EXIT_OK = 0;
const EXIT_ERROR = 1;
const EXIT_STRICT_EMPTY = 2;

const coverageConfig = loadCoverageConfig();
const repoRoot = path.resolve(__dirname, '../..');

const DEFAULT_IOS_LCOV = resolveRepoPath(coverageConfig.assert.defaultLcovPath);
const DEFAULT_ANDROID_JACOCO = resolveRepoPath(coverageConfig.assert.defaultJacocoXmlPath);

function parseArgs(argv) {
  const options = {
    platform: 'all',
    lcov: DEFAULT_IOS_LCOV,
    jacocoXml: DEFAULT_ANDROID_JACOCO,
    strict: resolveStrict([], coverageConfig),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--no-strict') {
      options.strict = false;
    } else if (arg.startsWith('--platform=')) {
      options.platform = arg.slice('--platform='.length);
    } else if (arg === '--platform') {
      options.platform = argv[i + 1];
      i += 1;
    } else if (arg === '--lcov') {
      options.lcov = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--jacoco-xml') {
      options.jacocoXml = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node tests/scripts/assert-native-coverage-presence.js [options]

Options:
  --platform=ios|android|all   Platforms to assert (default: all)
  --lcov <path>                iOS native LCOV (default: coverage/ios-native/lcov.info)
  --jacoco-xml <path>          Android Jacoco XML (default: jacocoTestReport.xml)
  --strict                     Exit 2 on empty/missing (default; CI)
  --no-strict                  Warn and exit 0 on empty/missing (local soft)

Exit codes: 0 ok, 1 error, 2 strict empty/missing artifact.
`);
      process.exit(EXIT_OK);
    } else {
      console.error(`[coverage-assert] Unknown argument: ${arg}`);
      process.exit(EXIT_ERROR);
    }
  }

  if (!['ios', 'android', 'all'].includes(options.platform)) {
    console.error(`[coverage-assert] --platform must be ios|android|all (got ${options.platform})`);
    process.exit(EXIT_ERROR);
  }

  return options;
}

function failEmpty(strict, message) {
  if (strict) {
    console.error(`[coverage-assert] ${message}`);
    return EXIT_STRICT_EMPTY;
  }
  console.warn(`[coverage-assert] (soft) ${message}`);
  return EXIT_OK;
}

function assertIosLcov(lcovPath, strict) {
  if (!fs.existsSync(lcovPath)) {
    return failEmpty(strict, `iOS LCOV missing: ${path.relative(repoRoot, lcovPath)}`);
  }

  const stat = fs.statSync(lcovPath);
  if (stat.size === 0) {
    return failEmpty(strict, `iOS LCOV empty (0 bytes): ${path.relative(repoRoot, lcovPath)}`);
  }

  const text = fs.readFileSync(lcovPath, 'utf8');
  let sourceFileCount = 0;
  let packagesHits = 0;
  let linesHit = 0;

  for (const line of text.split('\n')) {
    if (line.startsWith('SF:')) {
      sourceFileCount += 1;
      const sf = line.slice(3).replace(/\\/g, '/');
      if (includesAny(sf, coverageConfig.assert.lcovPathIncludes)) {
        packagesHits += 1;
      }
    } else if (line.startsWith('LH:')) {
      linesHit += Number(line.slice(3)) || 0;
    }
  }

  if (packagesHits === 0) {
    return failEmpty(
      strict,
      `iOS LCOV has no configured path hits (sourceFiles=${sourceFileCount}, linesHit=${linesHit}): ${path.relative(repoRoot, lcovPath)}`,
    );
  }

  console.log(
    `[coverage-assert] iOS ok: packagesHits=${packagesHits} sourceFiles=${sourceFileCount} linesHit=${linesHit} (${path.relative(repoRoot, lcovPath)})`,
  );
  return EXIT_OK;
}

function assertAndroidJacoco(xmlPath, strict) {
  if (!fs.existsSync(xmlPath)) {
    return failEmpty(strict, `Android Jacoco XML missing: ${path.relative(repoRoot, xmlPath)}`);
  }

  const stat = fs.statSync(xmlPath);
  if (stat.size === 0) {
    return failEmpty(
      strict,
      `Android Jacoco XML empty (0 bytes): ${path.relative(repoRoot, xmlPath)}`,
    );
  }

  const xml = fs.readFileSync(xmlPath, 'utf8');
  const packageBlocks = [...xml.matchAll(/<package name="([^"]+)"[^>]*>([\s\S]*?)<\/package>/g)];

  let packageCount = 0;
  let lineCovered = 0;
  let lineMissed = 0;

  for (const match of packageBlocks) {
    const name = match[1];
    const body = match[2];
    if (!includesAny(name, coverageConfig.assert.jacocoPackageIncludes)) {
      continue;
    }
    packageCount += 1;

    const trailing = body.match(/((?:<counter type="[^"]+" missed="\d+" covered="\d+"\/>\s*)+)$/);
    if (!trailing) {
      continue;
    }
    for (const c of trailing[1].matchAll(
      /<counter type="(LINE|INSTRUCTION)" missed="(\d+)" covered="(\d+)"\/>/g,
    )) {
      if (c[1] === 'LINE') {
        lineMissed += Number(c[2]);
        lineCovered += Number(c[3]);
      }
    }
  }

  if (packageCount === 0 || lineCovered === 0) {
    return failEmpty(
      strict,
      `Android Jacoco has empty configured package hits (packages=${packageCount}, lineCovered=${lineCovered}, lineMissed=${lineMissed}): ${path.relative(repoRoot, xmlPath)}`,
    );
  }

  console.log(
    `[coverage-assert] Android ok: packages=${packageCount} lineCovered=${lineCovered} lineMissed=${lineMissed} (${path.relative(repoRoot, xmlPath)})`,
  );
  return EXIT_OK;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  let code = EXIT_OK;

  if (options.platform === 'ios' || options.platform === 'all') {
    const iosCode = assertIosLcov(options.lcov, options.strict);
    if (iosCode !== EXIT_OK) {
      code = iosCode;
    }
  }

  if (options.platform === 'android' || options.platform === 'all') {
    const androidCode = assertAndroidJacoco(options.jacocoXml, options.strict);
    // Prefer exit 2 over 0 when any platform fails strict; keep first non-ok.
    if (androidCode !== EXIT_OK && code === EXIT_OK) {
      code = androidCode;
    } else if (androidCode === EXIT_STRICT_EMPTY) {
      code = EXIT_STRICT_EMPTY;
    }
  }

  if (code === EXIT_OK) {
    console.log('[coverage-assert] ok');
  } else if (code === EXIT_STRICT_EMPTY) {
    console.error(
      '[coverage-assert] FAIL: empty or missing native coverage (exit 2). Sabotaged / silent pipeline.',
    );
  }

  process.exit(code);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[coverage-assert] ${error.message}`);
    process.exit(EXIT_ERROR);
  }
}

module.exports = {
  EXIT_OK,
  EXIT_ERROR,
  EXIT_STRICT_EMPTY,
  assertIosLcov,
  assertAndroidJacoco,
  DEFAULT_IOS_LCOV,
  DEFAULT_ANDROID_JACOCO,
};
