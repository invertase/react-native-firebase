describe('_template_()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app._template_);
      app._template_().app.should.equal(app);
    });
  });

  describe('aMethod()', () => {

  });
});
