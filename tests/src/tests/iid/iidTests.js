import should from 'should';

function iidTests({ describe, it, firebase }) {
  describe('iid', () => {
    it('should delete the iid token', async () => {
      await firebase.native.iid().delete();
    });

    it('it should return iid token from get', async () => {
      const token = await firebase.native.iid().get();

      token.should.be.a.String();
    });

    it('should return an FCM token from getToken with arguments', async () => {
      await firebase.native.iid().delete();

      const otherSenderIdToken = await firebase.native
        .iid()
        .getToken('305229645282', '*');

      otherSenderIdToken.should.be.a.String();
    });

    it('should return nil from deleteToken', async () => {
      const token = await firebase.native
        .iid()
        .deleteToken('305229645282', '*');

      should.not.exist(token);
    });
  });
}

export default iidTests;
