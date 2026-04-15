import { describe, expect, it } from '@jest/globals';

import { setAnalyticsPodfileWithoutAdIdSupport } from '../src/ios/podfile';

const podfileFixture = `platform :ios, '15.0'

prepare_react_native_project!

target 'ReactNativeFirebaseDemo' do
end
`;

describe('Analytics Config Plugin iOS Tests', function () {
  it('adds the Podfile flag when withoutAdIdSupport is enabled', function () {
    const result = setAnalyticsPodfileWithoutAdIdSupport(podfileFixture, true);
    expect(result).toMatchSnapshot();
  });

  it('is idempotent when the Podfile flag is already present', function () {
    const onceModified = setAnalyticsPodfileWithoutAdIdSupport(podfileFixture, true);
    const twiceModified = setAnalyticsPodfileWithoutAdIdSupport(onceModified, true);

    expect(twiceModified).toEqual(onceModified);
  });

  it('removes the generated Podfile flag when withoutAdIdSupport is disabled', function () {
    const onceModified = setAnalyticsPodfileWithoutAdIdSupport(podfileFixture, true);
    const restored = setAnalyticsPodfileWithoutAdIdSupport(onceModified, false);

    expect(restored).toEqual(podfileFixture);
  });
});
