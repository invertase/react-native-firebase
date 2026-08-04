import { describe, expect, it } from '@jest/globals';

import { setAppPodfileDisableSPM } from '../src/ios/podfile';

const podfileFixture = `platform :ios, '15.0'

prepare_react_native_project!

target 'ReactNativeFirebaseDemo' do
end
`;

describe('App Config Plugin iOS Podfile Tests', function () {
  it('adds the Podfile flag when disableSPM is enabled', function () {
    const result = setAppPodfileDisableSPM(podfileFixture, true);
    expect(result).toContain('$RNFirebaseDisableSPM = true');
    expect(result).toMatchSnapshot();
  });

  it('places the flag before the target block', function () {
    const result = setAppPodfileDisableSPM(podfileFixture, true);
    expect(result.indexOf('$RNFirebaseDisableSPM = true')).toBeLessThan(
      result.indexOf("target 'ReactNativeFirebaseDemo'"),
    );
  });

  it('is idempotent when the Podfile flag is already present', function () {
    const onceModified = setAppPodfileDisableSPM(podfileFixture, true);
    const twiceModified = setAppPodfileDisableSPM(onceModified, true);

    expect(twiceModified).toEqual(onceModified);
  });

  it('removes the generated Podfile flag when disableSPM is disabled', function () {
    const onceModified = setAppPodfileDisableSPM(podfileFixture, true);
    const restored = setAppPodfileDisableSPM(onceModified, false);

    expect(restored).toEqual(podfileFixture);
  });

  it('leaves the Podfile untouched when disableSPM was never enabled', function () {
    expect(setAppPodfileDisableSPM(podfileFixture, false)).toEqual(podfileFixture);
    expect(setAppPodfileDisableSPM(podfileFixture)).toEqual(podfileFixture);
  });
});
