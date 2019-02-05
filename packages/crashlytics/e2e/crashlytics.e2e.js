describe('crashlytics()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.crashlytics);
      app.crashlytics().app.should.equal(app);
    });

    // removing as pending if module.options.hasMultiAppSupport = true
    xit('supports multiple apps', async () => {
      firebase.crashlytics().app.name.should.equal('[DEFAULT]');

      firebase
        .crashlytics(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .crashlytics()
        .app.name.should.equal('secondaryFromNative');
    });
  });

  describe('aMethod()', () => {
    // TODO
  });
});
