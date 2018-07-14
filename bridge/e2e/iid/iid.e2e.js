describe('iid()', () => {
  describe('get()', () => {
    it('returns instance id string', async () => {
      const iid = await firebase.iid().get();
      iid.should.be.a.String();
    });
  });

  describe('delete()', () => {
    it('deletes the current instance id', async () => {
      const iidBefore = await firebase.iid().get();
      iidBefore.should.be.a.String();
      await firebase.iid().delete();

      const iidAfter = await firebase.iid().get();
      iidAfter.should.be.a.String();
      iidBefore.should.not.equal(iidAfter);
    });
  });

  describe('getToken()', () => {
    it('should return an FCM token from getToken with arguments', async () => {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;

      await firebase.iid().delete();
      const token = await firebase.iid().getToken(authorizedEntity, '*');
      token.should.be.a.String();
    });

    it('should return an FCM token from getToken without arguments', async () => {
      await firebase.iid().delete();
      const token = await firebase.iid().getToken();
      token.should.be.a.String();
    });

    it('should return an FCM token from getToken with 1 argument', async () => {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;

      await firebase.iid().delete();
      const token = await firebase.iid().getToken(authorizedEntity);
      token.should.be.a.String();
    });
  });

  describe('deleteToken()', () => {
    it('should return nil from deleteToken with arguments', async () => {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;

      const token = await firebase.iid().deleteToken(authorizedEntity, '*');
      should.not.exist(token);
    });

    it('should return nil from deleteToken without arguments', async () => {
      const token = await firebase.iid().deleteToken();
      should.not.exist(token);
    });

    it('should return nil from deleteToken with 1 argument', async () => {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;

      const token = await firebase.iid().deleteToken(authorizedEntity);
      should.not.exist(token);
    });
  });
});
