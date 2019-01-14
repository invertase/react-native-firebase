// TODO test exported native constants
describe('NativeModules.RNFBApp', () => {
  describe('.apps', () => {
    it('should be an array', () => {
      console.dir(NativeModules.RNFBApp.apps)
      return Promise.resolve();
    });
  });
});
