describe('perf()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.perf);
      app.perf().app.should.equal(app);
    });
  });

  describe('aMethod()', () => {

  });
});
