/**
 * RNFB dedicated-test-app coverage config (Pattern C).
 *
 * Shape mirrors `react-native-coverage` package config (INF-05A §8 / package
 * `src/config.ts`) so later migration can swap the implementation without
 * relocating coverage source trees. This file is the source of truth for
 * Node scripts; native/Gradle copies are generated via
 * `tests/scripts/generate-coverage-native-config.js`.
 *
 * @type {import('./scripts/load-coverage-config').CoverageConfigInput}
 */
module.exports = {
  /** Master enablement for native coverage plumbing in the test app. */
  enabled: true,
  nativeModuleName: 'RNFBTestingCoverage',
  app: {
    androidApplicationId: 'com.invertase.testing',
    iosBundleId: 'io.invertase.testing',
    iosProductName: 'testing',
  },
  ios: {
    frameworkNamePrefixes: ['RNFB'],
    /** LLVM_PROFILE_FILE pattern under Documents (supports %m). */
    profileFilePattern: 'coverage-%m.profraw',
  },
  android: {
    libraryProjectMatchers: ['react-native-firebase'],
    detoxStagingPath: '/data/local/tmp/detox/coverage.ec',
    coverageRelativePath: 'files/coverage.ec',
    /** Filename only under app filesDir (Emma/Jacoco dump). */
    coverageFileName: 'coverage.ec',
    jacocoReportXml: 'tests/android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml',
  },
  sourcePathRewrite: [
    { kind: 'after-marker', marker: '/packages/', includeMarker: true },
    {
      kind: 'regex',
      pattern: '^.*/@react-native-firebase/([^/]+)/(.+)$',
      replacement: 'packages/$1/$2',
    },
    { kind: 'after-marker', marker: '/tests/', includeMarker: true },
  ],
  strict: true,
  assert: {
    lcovPathIncludes: ['packages/'],
    jacocoPackageIncludes: ['invertase', 'reactnativefirebase'],
    defaultLcovPath: 'coverage/ios-native/lcov.info',
    defaultJacocoXmlPath:
      'tests/android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml',
  },
};
