/**
 * RNFB dedicated-test-app coverage config (Pattern C).
 *
 * Dry-run: tests app consumes local `react-native-coverage` via Yarn
 * `portal:../../../react-native-coverage` (no npm registry). Host scripts
 * prefer package `rn-coverage` CLI / `react-native-coverage/node`. Flush uses
 * package TurboModule name `Coverage`. Dormant RNFBTesting*Coverage* sources
 * remain on disk until a later delete step — do not remove them here.
 *
 * @type {import('./scripts/load-coverage-config').CoverageConfigInput}
 */
module.exports = {
  /** Master enablement for native coverage plumbing in the test app. */
  enabled: true,
  /** Package TurboModule registry name (react-native-coverage). */
  nativeModuleName: 'Coverage',
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
