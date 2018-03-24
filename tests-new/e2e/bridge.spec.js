const should = require('should');

describe('bridge', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should provide -> global.bridge', () => {
    should(bridge).not.be.undefined();
    return Promise.resolve();
  });

  it('should provide -> global.bridge.module', () => {
    should(bridge.module).not.be.undefined();
    return Promise.resolve();
  });

  it('should provide -> global.bridge.rn', () => {
    should(bridge.rn).not.be.undefined();
    should(bridge.rn.Platform.OS).be.a.String();
    should(bridge.rn.Platform.OS).equal(device.getPlatform());
    return Promise.resolve();
  });

  it('should provide -> global.reload and allow reloadReactNative usage', async () => {
    should(bridge.reload).be.a.Function();
    // and check it works without breaking anything
    await device.reloadReactNative();
    should(bridge.reload).be.a.Function();
    return Promise.resolve();
  });

  it('should allow detox to launchApp without breaking remote debug', async () => {
    await device.launchApp({ newInstance: true });
    should(bridge.module).not.be.undefined();
    should(bridge.reload).be.a.Function();
    should(bridge.rn).not.be.undefined();
    should(bridge.rn.Platform.OS).be.a.String();
    should(bridge.rn.Platform.OS).equal(device.getPlatform());
    return Promise.resolve();
  });
});
