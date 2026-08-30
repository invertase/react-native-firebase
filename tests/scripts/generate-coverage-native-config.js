#!/usr/bin/env node
'use strict';

/**
 * Generate native/Gradle coverage config copies from
 * `tests/react-native-coverage.config.js` (single source of truth).
 *
 * Outputs (in place — no coverage source tree moves):
 *   - tests/ios/testing/RNFBTestingCoverageConfig.h
 *   - tests/android/coverage.properties
 */

const fs = require('fs');
const path = require('path');
const { loadCoverageConfig, testsDir } = require('./load-coverage-config');

const config = loadCoverageConfig();

const headerPath = path.join(testsDir, 'ios/testing/RNFBTestingCoverageConfig.h');
const propsPath = path.join(testsDir, 'android/coverage.properties');

const prefixes = config.ios.frameworkNamePrefixes;
const prefixesLiteral =
  prefixes.length === 0
    ? ''
    : prefixes.map(p => `"${p.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(', ');

const header = `/**
 * GENERATED FILE — do not edit by hand.
 * Source: tests/react-native-coverage.config.js
 * Regen:  node tests/scripts/generate-coverage-native-config.js
 *
 * In-place neutralization: native coverage knobs are config-driven
 * without relocating coverage source trees.
 * Note: RCT_EXPORT_MODULE() needs a bare identifier — keep
 * RNFBTestingCoverageModule.m export name equal to nativeModuleName.
 */
#pragma once

#define RNFB_COVERAGE_ENABLED ${config.enabled ? 1 : 0}
#define RNFB_COVERAGE_NATIVE_MODULE_NAME "${config.nativeModuleName.replace(/"/g, '\\"')}"
#define RNFB_COVERAGE_PROFILE_FILE_PATTERN "${config.ios.profileFilePattern.replace(/"/g, '\\"')}"
#define RNFB_COVERAGE_FRAMEWORK_PREFIX_COUNT ${prefixes.length}
static const char *const RNFB_COVERAGE_FRAMEWORK_PREFIXES[] = {${prefixesLiteral}};
`;

const props = `# GENERATED FILE — do not edit by hand.
# Source: tests/react-native-coverage.config.js
# Regen:  node tests/scripts/generate-coverage-native-config.js
coverage.enabled=${config.enabled ? 'true' : 'false'}
coverage.nativeModuleName=${config.nativeModuleName}
coverage.androidApplicationId=${config.app.androidApplicationId}
coverage.coverageFileName=${config.android.coverageFileName}
coverage.coverageRelativePath=${config.android.coverageRelativePath}
coverage.detoxStagingPath=${config.android.detoxStagingPath}
coverage.libraryProjectMatchers=${config.android.libraryProjectMatchers.join(',')}
coverage.jacocoPackageIncludes=${config.assert.jacocoPackageIncludes.join(',')}
`;

fs.writeFileSync(headerPath, header);
fs.writeFileSync(propsPath, props);
console.log(`[coverage-config] wrote ${path.relative(testsDir, headerPath)}`);
console.log(`[coverage-config] wrote ${path.relative(testsDir, propsPath)}`);
