describe('iid()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.iid);
      app.iid().app.should.equal(app);
    });
  });

  describe('aMethod()', () => {

  });
});
