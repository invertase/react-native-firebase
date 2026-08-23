const { shouldSkipAndroidSettleAndLoad } = require('../../../tests/e2e/androidReadyPolicy');
const fs = require('fs');
const path = require('path');

describe('androidReadyPolicy', function () {
  it('skips settle/load locally and runs it on CI (matches passing 1×3 skip)', function () {
    expect(shouldSkipAndroidSettleAndLoad(false)).toBe(true);
    expect(shouldSkipAndroidSettleAndLoad(undefined)).toBe(true);
    expect(shouldSkipAndroidSettleAndLoad(true)).toBe(false);
  });

  it('firebase.test.js still gates settle on the policy helper', function () {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../../tests/e2e/firebase.test.js'),
      'utf8',
    );
    expect(src).toMatch(/shouldSkipAndroidSettleAndLoad\(isCI\(\)\)/);
    expect(src).not.toMatch(/if \(!isCI\(\)\) \{/);
  });

  it('passes Detox Android detoxEnableSynchronization=0 (native equals "0", not "NO")', function () {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../../tests/e2e/firebase.test.js'),
      'utf8',
    );
    expect(src).toMatch(/detoxEnableSynchronization:\s*'0'/);
    expect(src).not.toMatch(/detoxEnableSynchronization:\s*'NO'/);
  });

  it('treats Fabric ReactContext-null as a retryable launch failure', function () {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../../tests/e2e/firebase.test.js'),
      'utf8',
    );
    expect(src).toMatch(/ReactContext is null/);
  });
});
