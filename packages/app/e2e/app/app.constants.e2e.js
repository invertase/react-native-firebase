describe('App -> NativeModules -> Constants', () => {
  describe('.apps', () => {
    it('should be an array', () => {
      const { apps } = NativeModules.RNFBApp;

      apps.should.be.an.Array();
      // default + secondaryFromNative
      apps.length.should.equal(2);
    });

    it('array items contain name, options & state properties', () => {
      const { apps } = NativeModules.RNFBApp;

      apps.should.be.an.Array();
      apps.length.should.equal(2);

      for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        app.name.should.be.a.String();
        app.options.should.be.a.Object();
        app.state.should.be.a.Object();
      }
    });
  });
});
