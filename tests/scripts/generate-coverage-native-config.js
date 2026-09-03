#!/usr/bin/env node
'use strict';

/**
 * Generate Gradle coverage.properties from
 * `tests/react-native-coverage.config.js` (single source of truth).
 *
 * LLVM / TurboModule knobs live in react-native-coverage (CocoaPods helper +
 * CoverageConfig.h). This script only feeds RNFB's Jacoco library matchers.
 *
 * Output:
 *   - tests/android/coverage.properties
 */

const fs = require('fs');
const path = require('path');
const { loadCoverageConfig, testsDir } = require('./load-coverage-config');

const config = loadCoverageConfig();
const propsPath = path.join(testsDir, 'android/coverage.properties');

const props = `# GENERATED FILE — do not edit by hand.
# Source: tests/react-native-coverage.config.js
# Regen:  node tests/scripts/generate-coverage-native-config.js
coverage.enabled=${config.enabled ? 'true' : 'false'}
coverage.androidApplicationId=${config.app.androidApplicationId}
coverage.coverageFileName=${config.android.coverageFileName}
coverage.coverageRelativePath=${config.android.coverageRelativePath}
coverage.detoxStagingPath=${config.android.detoxStagingPath}
coverage.libraryProjectMatchers=${config.android.libraryProjectMatchers.join(',')}
coverage.jacocoPackageIncludes=${config.assert.jacocoPackageIncludes.join(',')}
`;

fs.writeFileSync(propsPath, props);
console.log(`[coverage-config] wrote ${path.relative(testsDir, propsPath)}`);
