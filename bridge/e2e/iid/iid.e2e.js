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
});
