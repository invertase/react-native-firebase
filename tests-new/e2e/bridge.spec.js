// describe('Example', () => {
//   beforeEach(async () => {
//     await device.reloadReactNative();
//   });
//
//   it('should have welcome screen', async () => {
//     await expect(element(by.id('welcome'))).toBeVisible();
//   });
//
//   it('should show hello screen after tap', async () => {
//     await element(by.id('hello_button')).tap();
//     await expect(element(by.text('Hello!!!'))).toBeVisible();
//   });
//
//   it('should show world screen after tap', async () => {
//     await element(by.id('world_button')).tap();
//     await expect(element(by.text('World!!!'))).toBeVisible();
//   });
// });

describe('should work inside node', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should provide bridge global', () => {
    const firebase = bridge.module;


    return Promise.resolve();
  });

  it('should require 2', () => {
    const firebase = bridge.module;
    // const { Platform } = bridge.rnModule;
    // should.equal(firebase.auth.nativeModuleExists, true);
    return Promise.resolve();
  });

  it('should require 3', () => {
    const firebase = bridge.module;
    // const { Platform } = bridge.rnModule;
    // should.equal(firebase.auth.nativeModuleExists, true);
    return Promise.resolve();
  });

  it('should require 4', () => {
    const firebase = bridge.module;
    // const { Platform } = bridge.rnModule;
    // should.equal(firebase.auth.nativeModuleExists, true);
    return Promise.resolve();
  });

  it('should require 5', () => {
    const firebase = bridge.module;
    // const { Platform } = bridge.rnModule;
    // should.equal(firebase.auth.nativeModuleExists, true);
    return Promise.resolve();
  });
});
