import { describe, expect, it } from '@jest/globals';

import { setAppPodfileDisableSPM } from '../src/ios/podfile';

const podfileFixture = `platform :ios, '15.0'

prepare_react_native_project!

target 'ReactNativeFirebaseDemo' do
end
`;

const legacyDisableSpmPodfile = `platform :ios, '15.0'

prepare_react_native_project!
# @generated begin @react-native-firebase/app-disableSPM - expo prebuild (DO NOT MODIFY)
$RNFirebaseDisableSPM = true
# @generated end @react-native-firebase/app-disableSPM
target 'ReactNativeFirebaseDemo' do
end
`;

describe('App Config Plugin iOS Podfile Tests', function () {
  it('throws when disableSPM is enabled (Firebase 13+ is SPM-only)', function () {
    expect(() => setAppPodfileDisableSPM(podfileFixture, true)).toThrow(
      /disableSPM is no longer supported/,
    );
  });

  it('strips a leftover generated DisableSPM flag when disableSPM is disabled', function () {
    const restored = setAppPodfileDisableSPM(legacyDisableSpmPodfile, false);
    expect(restored).not.toContain('$RNFirebaseDisableSPM = true');
    expect(restored).toContain("target 'ReactNativeFirebaseDemo'");
  });

  it('leaves the Podfile untouched when disableSPM was never enabled', function () {
    expect(setAppPodfileDisableSPM(podfileFixture, false)).toEqual(podfileFixture);
    expect(setAppPodfileDisableSPM(podfileFixture)).toEqual(podfileFixture);
  });
});
