describe('config()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.config);
      app.config().app.should.equal(app);
    });

    // removing as pending if module.options.hasMultiAppSupport = true
    xit('supports multiple apps', async () => {
      firebase.config().app.name.should.equal('[DEFAULT]');

      firebase
        .config(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .config()
        .app.name.should.equal('secondaryFromNative');
    });
  });

  describe('aMethod()', () => {
    // TODO
  });
});
