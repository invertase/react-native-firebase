describe('App -> NativeModules -> Constants', () => {
  describe('.apps', () => {
    it('should be an array', () => {
      const { apps } = NativeModules.RNFBAppModule;

      apps.should.be.an.Array();
      // secondaryFromNative + default
      apps.length.should.equal(2);
    });

    it('array items contain name, options & state properties', () => {
      const { apps } = NativeModules.RNFBAppModule;

      apps.should.be.an.Array();
      apps.length.should.equal(2);

      for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        app.appConfig.should.be.a.Object();
        app.appConfig.name.should.be.a.String();
        app.options.should.be.a.Object();
      }
    });
  });
});
