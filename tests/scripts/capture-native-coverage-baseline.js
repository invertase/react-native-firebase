#!/usr/bin/env node
/**
 * Capture native / JS coverage baseline metrics after slotted `:test-cover` runs.
 *
 * Canonical usage (after Law path + process steps):
 *   yarn tests:coverage:capture-baseline --platform=ios --run=1 --slot=1
 *   yarn tests:coverage:capture-baseline --platform=android --run=1 --slot=1
 *   yarn tests:coverage:capture-baseline --platform=macos --run=1 --slot=1
 *   yarn tests:coverage:capture-baseline --finalize --threshold=1
 *
 * Writes:
 *   tests/coverage-artifacts/coverage-baseline.json  (commit-friendly summary)
 *   tests/coverage-artifacts/runs/<platform>-run<N>/ (raw snapshots; gitignored)
 *
 * See tests/coverage-artifacts/README.md and okf-bundle/testing/coverage-design.md.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const artifactsRoot = path.join(repoRoot, 'tests/coverage-artifacts');
const baselinePath = path.join(artifactsRoot, 'coverage-baseline.json');
const runsRoot = path.join(artifactsRoot, 'runs');

const DEFAULT_THRESHOLD_PCT = 1;

function parseArgs(argv) {
  const options = {
    platform: null,
    run: null,
    slot: process.env.RNFB_E2E_SLOT || process.env.RNFB_E2E_HOST_SLOT || '1',
    finalize: false,
    thresholdPct: DEFAULT_THRESHOLD_PCT,
    logPath: null,
    exitCode: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--finalize') {
      options.finalize = true;
    } else if (arg.startsWith('--platform=')) {
      options.platform = arg.slice('--platform='.length);
    } else if (arg === '--platform') {
      options.platform = argv[++i];
    } else if (arg.startsWith('--run=')) {
      options.run = Number(arg.slice('--run='.length));
    } else if (arg === '--run') {
      options.run = Number(argv[++i]);
    } else if (arg.startsWith('--slot=')) {
      options.slot = arg.slice('--slot='.length);
    } else if (arg === '--slot') {
      options.slot = argv[++i];
    } else if (arg.startsWith('--threshold=')) {
      options.thresholdPct = Number(arg.slice('--threshold='.length));
    } else if (arg === '--threshold') {
      options.thresholdPct = Number(argv[++i]);
    } else if (arg.startsWith('--log=')) {
      options.logPath = arg.slice('--log='.length);
    } else if (arg === '--log') {
      options.logPath = argv[++i];
    } else if (arg.startsWith('--exit-code=')) {
      options.exitCode = Number(arg.slice('--exit-code='.length));
    } else if (arg === '--exit-code') {
      options.exitCode = Number(argv[++i]);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  // eslint-disable-next-line no-console
  console.log(`Usage:
  yarn tests:coverage:capture-baseline --platform=<android|ios|macos> --run=<1|2> [--slot=N]
       [--log=<path>] [--exit-code=N]
  yarn tests:coverage:capture-baseline --finalize [--threshold=1]

Captures coverage metrics after a full Law :test-cover (+ process) cycle on one
slot. Run twice per platform, then --finalize to compare observed variance to T.

Android: run yarn tests:android:post-e2e-coverage before capture.
iOS:     run yarn tests:ios:test:process-coverage before capture.
macOS:   JS-only (NYC lcov); native N/A per coverage-design.md.
`);
}

function gitSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
  } catch (_) {
    return null;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadBaseline() {
  if (!fs.existsSync(baselinePath)) {
    return {
      schemaVersion: 1,
      provisionalThresholdPct: DEFAULT_THRESHOLD_PCT,
      capturedAt: null,
      gitSha: null,
      slot: null,
      runs: [],
      variance: null,
      recommendation: null,
    };
  }
  return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
}

function saveBaseline(baseline) {
  ensureDir(artifactsRoot);
  fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) {
    return false;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function parseLcovMetrics(lcovPath) {
  if (!fs.existsSync(lcovPath)) {
    return null;
  }

  const text = fs.readFileSync(lcovPath, 'utf8');
  let sourceFileCount = 0;
  let packagesHits = 0;
  let linesFound = 0;
  let linesHit = 0;

  for (const line of text.split('\n')) {
    if (line.startsWith('SF:')) {
      sourceFileCount += 1;
      const sf = line.slice(3).replace(/\\/g, '/');
      if (sf.includes('packages/') || sf.startsWith('packages/')) {
        packagesHits += 1;
      }
    } else if (line.startsWith('LF:')) {
      linesFound += Number(line.slice(3)) || 0;
    } else if (line.startsWith('LH:')) {
      linesHit += Number(line.slice(3)) || 0;
    }
  }

  return {
    sourceFileCount,
    packagesHits,
    linesFound,
    linesHit,
    lineCoveragePct: linesFound > 0 ? Number(((100 * linesHit) / linesFound).toFixed(4)) : null,
    path: path.relative(repoRoot, lcovPath),
  };
}

function countIosTrackedImages() {
  const productsDir = path.join(repoRoot, 'tests/ios/build/Build/Products/Debug-iphonesimulator');
  const appFrameworks = path.join(productsDir, 'testing.app/Frameworks');
  const names = new Set();

  if (fs.existsSync(appFrameworks)) {
    for (const entry of fs.readdirSync(appFrameworks)) {
      if (entry.startsWith('RNFB') && entry.endsWith('.framework')) {
        names.add(entry);
      }
    }
  }

  return {
    trackedImageCount: names.size,
    trackedImages: [...names].sort(),
  };
}

function parseJacocoPackagesMetrics(xmlPath) {
  if (!fs.existsSync(xmlPath)) {
    return null;
  }

  const xml = fs.readFileSync(xmlPath, 'utf8');
  let lineCovered = 0;
  let lineMissed = 0;
  let instructionCovered = 0;
  let instructionMissed = 0;

  // Report-level counters: last LINE / INSTRUCTION in the file (Jacoco report totals).
  const reportCounters = [
    ...xml.matchAll(/<counter type="(LINE|INSTRUCTION)" missed="(\d+)" covered="(\d+)"\/>/g),
  ];
  for (let i = reportCounters.length - 1; i >= 0; i -= 1) {
    const [, type, missed, covered] = reportCounters[i];
    if (type === 'LINE' && lineCovered === 0 && lineMissed === 0) {
      lineMissed = Number(missed);
      lineCovered = Number(covered);
    }
    if (type === 'INSTRUCTION' && instructionCovered === 0 && instructionMissed === 0) {
      instructionMissed = Number(missed);
      instructionCovered = Number(covered);
    }
    if (lineCovered + lineMissed > 0 && instructionCovered + instructionMissed > 0) {
      break;
    }
  }

  // Package subset: sum package-level rollup counters for invertase / RNFB packages.
  const packageBlocks = [...xml.matchAll(/<package name="([^"]+)"[^>]*>([\s\S]*?)<\/package>/g)];
  let packageCount = 0;
  let sourcefileCount = 0;
  let pkgLineCovered = 0;
  let pkgLineMissed = 0;
  let pkgInstructionCovered = 0;
  let pkgInstructionMissed = 0;

  for (const match of packageBlocks) {
    const name = match[1];
    const body = match[2];
    if (!/invertase|reactnativefirebase/i.test(name)) {
      continue;
    }
    packageCount += 1;
    sourcefileCount += (body.match(/<sourcefile /g) || []).length;

    // Package rollup counters are the final <counter> elements in the package element.
    const trailing = body.match(/((?:<counter type="[^"]+" missed="\d+" covered="\d+"\/>\s*)+)$/);
    if (!trailing) {
      continue;
    }
    for (const c of trailing[1].matchAll(
      /<counter type="(LINE|INSTRUCTION)" missed="(\d+)" covered="(\d+)"\/>/g,
    )) {
      if (c[1] === 'LINE') {
        pkgLineMissed += Number(c[2]);
        pkgLineCovered += Number(c[3]);
      } else if (c[1] === 'INSTRUCTION') {
        pkgInstructionMissed += Number(c[2]);
        pkgInstructionCovered += Number(c[3]);
      }
    }
  }

  const lineTotal = lineCovered + lineMissed;
  const insnTotal = instructionCovered + instructionMissed;
  const pkgLineTotal = pkgLineCovered + pkgLineMissed;
  const pkgInsnTotal = pkgInstructionCovered + pkgInstructionMissed;

  return {
    reportPath: path.relative(repoRoot, xmlPath),
    report: {
      lineCovered,
      lineMissed,
      lineCoveragePct: lineTotal > 0 ? Number(((100 * lineCovered) / lineTotal).toFixed(4)) : null,
      instructionCovered,
      instructionMissed,
      instructionCoveragePct:
        insnTotal > 0 ? Number(((100 * instructionCovered) / insnTotal).toFixed(4)) : null,
    },
    packages: {
      packageCount,
      sourcefileCount,
      lineCovered: pkgLineCovered,
      lineMissed: pkgLineMissed,
      lineCoveragePct:
        pkgLineTotal > 0 ? Number(((100 * pkgLineCovered) / pkgLineTotal).toFixed(4)) : null,
      instructionCovered: pkgInstructionCovered,
      instructionMissed: pkgInstructionMissed,
      instructionCoveragePct:
        pkgInsnTotal > 0 ? Number(((100 * pkgInstructionCovered) / pkgInsnTotal).toFixed(4)) : null,
    },
  };
}

function androidEcPresence() {
  const ecPath = path.join(
    repoRoot,
    'tests/android/app/build/output/coverage/emulator_coverage.ec',
  );
  // post-e2e deletes .ec after successful report — note presence before process, or
  // look for jacoco execution data under build.
  const altExec = [];
  const searchRoots = [
    path.join(repoRoot, 'tests/android/app/build'),
    path.join(repoRoot, 'packages'),
  ];
  const walkEc = (dir, depth = 0) => {
    if (depth > 6 || !fs.existsSync(dir)) {
      return;
    }
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && (entry.name.endsWith('.ec') || entry.name.endsWith('.exec'))) {
        altExec.push(path.relative(repoRoot, full));
      } else if (entry.isDirectory() && entry.name !== 'node_modules') {
        walkEc(full, depth + 1);
      }
    }
  };
  walkEc(searchRoots[0]);

  return {
    emulatorCoverageEcPresent: fs.existsSync(ecPath),
    emulatorCoverageEcPath: path.relative(repoRoot, ecPath),
    relatedExecutionDataFiles: altExec.slice(0, 40),
  };
}

function captureIos(runDir) {
  const lcovSrc = path.join(repoRoot, 'coverage/ios-native/lcov.info');
  const lcovDest = path.join(runDir, 'ios-native-lcov.info');
  copyIfExists(lcovSrc, lcovDest);
  const lcov = parseLcovMetrics(fs.existsSync(lcovDest) ? lcovDest : lcovSrc);
  const images = countIosTrackedImages();
  return {
    native: true,
    lcov,
    trackedImageCount: images.trackedImageCount,
    trackedImages: images.trackedImages,
    artifactPaths: {
      lcov: lcov ? lcov.path : null,
      snapshot: fs.existsSync(lcovDest) ? path.relative(repoRoot, lcovDest) : null,
    },
  };
}

function captureAndroid(runDir) {
  const xmlSrc = path.join(
    repoRoot,
    'tests/android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml',
  );
  const xmlDest = path.join(runDir, 'jacocoTestReport.xml');
  copyIfExists(xmlSrc, xmlDest);
  const jacoco = parseJacocoPackagesMetrics(fs.existsSync(xmlDest) ? xmlDest : xmlSrc);
  const ec = androidEcPresence();
  // Snapshot note: post-e2e may have deleted .ec — record that in metrics.
  return {
    native: true,
    jacoco,
    ec,
    artifactPaths: {
      jacocoXml: jacoco ? jacoco.reportPath : null,
      snapshot: fs.existsSync(xmlDest) ? path.relative(repoRoot, xmlDest) : null,
    },
  };
}

function captureMacos(runDir) {
  const lcovSrc = path.join(repoRoot, 'coverage/lcov.info');
  const lcovDest = path.join(runDir, 'js-lcov.info');
  copyIfExists(lcovSrc, lcovDest);
  const lcov = parseLcovMetrics(fs.existsSync(lcovDest) ? lcovDest : lcovSrc);
  return {
    native: false,
    nativeNote:
      'macOS e2e uses firebase-js-sdk only; no RNFB native coverage (coverage-design.md). Metrics are JS/NYC lcov from tests:macos:test-cover.',
    lcov,
    artifactPaths: {
      lcov: lcov ? lcov.path : null,
      snapshot: fs.existsSync(lcovDest) ? path.relative(repoRoot, lcovDest) : null,
    },
  };
}

function primaryMetric(platform, metrics) {
  if (platform === 'ios') {
    return {
      key: 'packagesHits',
      value: metrics.lcov ? metrics.lcov.packagesHits : null,
      secondary: {
        sourceFileCount: metrics.lcov ? metrics.lcov.sourceFileCount : null,
        trackedImageCount: metrics.trackedImageCount,
        linesHit: metrics.lcov ? metrics.lcov.linesHit : null,
        linesFound: metrics.lcov ? metrics.lcov.linesFound : null,
      },
    };
  }
  if (platform === 'android') {
    const pkg = metrics.jacoco && metrics.jacoco.packages;
    return {
      key: 'packages.lineCovered',
      value: pkg ? pkg.lineCovered : null,
      secondary: {
        packagesLineCoveragePct: pkg ? pkg.lineCoveragePct : null,
        packagesInstructionCovered: pkg ? pkg.instructionCovered : null,
        packagesInstructionCoveragePct: pkg ? pkg.instructionCoveragePct : null,
        reportLineCovered: metrics.jacoco ? metrics.jacoco.report.lineCovered : null,
        reportLineCoveragePct: metrics.jacoco ? metrics.jacoco.report.lineCoveragePct : null,
        packageCount: pkg ? pkg.packageCount : null,
        sourcefileCount: pkg ? pkg.sourcefileCount : null,
        ecPresentAtCapture: metrics.ec ? metrics.ec.emulatorCoverageEcPresent : null,
      },
    };
  }
  // macos JS
  return {
    key: 'packagesHits',
    value: metrics.lcov ? metrics.lcov.packagesHits : null,
    secondary: {
      sourceFileCount: metrics.lcov ? metrics.lcov.sourceFileCount : null,
      linesHit: metrics.lcov ? metrics.lcov.linesHit : null,
      linesFound: metrics.lcov ? metrics.lcov.linesFound : null,
      lineCoveragePct: metrics.lcov ? metrics.lcov.lineCoveragePct : null,
    },
  };
}

function recordRun(options) {
  const platform = options.platform;
  if (!['android', 'ios', 'macos'].includes(platform)) {
    throw new Error(`--platform must be android|ios|macos (got ${platform})`);
  }
  if (options.run !== 1 && options.run !== 2) {
    throw new Error(`--run must be 1 or 2 (got ${options.run})`);
  }

  const runDir = path.join(runsRoot, `${platform}-run${options.run}`);
  ensureDir(runDir);

  let metrics;
  if (platform === 'ios') {
    metrics = captureIos(runDir);
  } else if (platform === 'android') {
    metrics = captureAndroid(runDir);
  } else {
    metrics = captureMacos(runDir);
  }

  const primary = primaryMetric(platform, metrics);
  const localLogPath = options.logPath
    ? path.relative(repoRoot, path.resolve(options.logPath))
    : null;
  const entry = {
    platform,
    runIndex: options.run,
    slot: String(options.slot),
    timestamp: new Date().toISOString(),
    gitSha: gitSha(),
    exitCode: options.exitCode,
    logPath: localLogPath,
    primaryMetricKey: primary.key,
    primaryMetricValue: primary.value,
    secondaryMetrics: primary.secondary,
    metrics,
  };

  const metaPath = path.join(runDir, 'capture.json');
  fs.writeFileSync(metaPath, `${JSON.stringify(entry, null, 2)}\n`, 'utf8');

  // Committed summary omits local log paths (ephemeral report dirs / queue tokens).
  const baselineEntry = { ...entry, logPath: null };

  const baseline = loadBaseline();
  baseline.runs = (baseline.runs || []).filter(
    r => !(r.platform === platform && r.runIndex === options.run),
  );
  baseline.runs.push(baselineEntry);
  baseline.runs.sort((a, b) => {
    if (a.platform !== b.platform) {
      return a.platform.localeCompare(b.platform);
    }
    return a.runIndex - b.runIndex;
  });
  baseline.capturedAt = new Date().toISOString();
  baseline.gitSha = gitSha();
  baseline.slot = String(options.slot);
  baseline.provisionalThresholdPct = options.thresholdPct;
  saveBaseline(baseline);

  // eslint-disable-next-line no-console
  console.log(
    `[coverage-baseline] recorded ${platform} run ${options.run}: ${primary.key}=${primary.value}`,
  );
  // eslint-disable-next-line no-console
  console.log(`[coverage-baseline] wrote ${path.relative(repoRoot, baselinePath)}`);
  return entry;
}

function pctDelta(a, b) {
  if (a == null || b == null) {
    return null;
  }
  if (a === 0 && b === 0) {
    return 0;
  }
  const mid = (Math.abs(a) + Math.abs(b)) / 2;
  if (mid === 0) {
    return null;
  }
  return Number(((100 * Math.abs(a - b)) / mid).toFixed(4));
}

function finalize(options) {
  const baseline = loadBaseline();
  const threshold = options.thresholdPct;
  baseline.provisionalThresholdPct = threshold;

  const byPlatform = {};
  for (const run of baseline.runs || []) {
    byPlatform[run.platform] = byPlatform[run.platform] || [];
    byPlatform[run.platform].push(run);
  }

  const variance = {};
  const recommendations = [];

  for (const platform of ['android', 'ios', 'macos']) {
    const runs = (byPlatform[platform] || []).sort((a, b) => a.runIndex - b.runIndex);
    const run1 = runs.find(r => r.runIndex === 1);
    const run2 = runs.find(r => r.runIndex === 2);
    if (!run1 || !run2) {
      variance[platform] = {
        status: 'incomplete',
        message: `Need run 1 and run 2 (have ${runs.map(r => r.runIndex).join(',') || 'none'})`,
      };
      recommendations.push({
        platform,
        recommendation: 'incomplete',
        detail: 'Capture both runs before comparing to T.',
      });
      continue;
    }

    const v1 = run1.primaryMetricValue;
    const v2 = run2.primaryMetricValue;
    const observedPct = pctDelta(v1, v2);
    const withinT = observedPct == null ? null : observedPct <= threshold;
    const absDelta = v1 != null && v2 != null ? Math.abs(v1 - v2) : null;

    variance[platform] = {
      status: 'ok',
      primaryMetricKey: run1.primaryMetricKey,
      run1: v1,
      run2: v2,
      absoluteDelta: absDelta,
      observedVariancePct: observedPct,
      provisionalThresholdPct: threshold,
      withinThreshold: withinT,
      native: run1.metrics ? run1.metrics.native : null,
    };

    let recommendation;
    if (observedPct == null) {
      recommendation = 'inconclusive';
    } else if (withinT) {
      recommendation = `accept_T_${threshold}pct`;
    } else {
      recommendation = `raise_T_or_investigate_gt_${threshold}pct`;
    }
    recommendations.push({
      platform,
      recommendation,
      observedVariancePct: observedPct,
      detail:
        observedPct == null
          ? 'Missing primary metric on one or both runs.'
          : `Observed |Δ|%=${observedPct} vs T=${threshold}%.`,
    });
  }

  // macos is JS-only variance signal; still include in overall.
  const overallWithin = recommendations
    .filter(r => r.recommendation !== 'incomplete' && r.recommendation !== 'inconclusive')
    .every(r => r.recommendation.startsWith('accept_T_'));

  baseline.variance = variance;
  baseline.recommendation = {
    provisionalThresholdPct: threshold,
    perPlatform: recommendations,
    overall: recommendations.some(r => r.recommendation === 'incomplete')
      ? 'incomplete'
      : overallWithin
        ? `keep_provisional_T_${threshold}pct`
        : `revisit_T_${threshold}pct`,
    notes: [
      'T is provisional relative variance between two consecutive full :test-cover(+process) runs on the same slot.',
      'macOS has no RNFB native coverage; variance uses JS NYC packagesHits.',
      'Android primary metric is Jacoco packages/*.lineCovered for invertase packages.',
      'iOS primary metric is LCOV packagesHits (SF under packages/).',
    ],
  };
  baseline.capturedAt = new Date().toISOString();
  baseline.gitSha = gitSha();
  // Commit-bound summary: drop local log paths (may contain ephemeral report dirs).
  for (const run of baseline.runs || []) {
    run.logPath = null;
  }
  saveBaseline(baseline);

  // eslint-disable-next-line no-console
  console.log('[coverage-baseline] finalize:');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(baseline.recommendation, null, 2));
  // eslint-disable-next-line no-console
  console.log(`[coverage-baseline] wrote ${path.relative(repoRoot, baselinePath)}`);
  return baseline;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || (!options.finalize && !options.platform)) {
    printHelp();
    process.exit(options.help ? 0 : 1);
  }

  if (options.finalize) {
    finalize(options);
    return;
  }

  recordRun(options);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[coverage-baseline] ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  parseLcovMetrics,
  parseJacocoPackagesMetrics,
  recordRun,
  finalize,
  pctDelta,
};
