describe('database()', () => {
  describe('ref().key', () => {
    it('returns null for root ref', () => {
      const ref = firebase.database().ref();
      (ref.key === null).should.be.true();
    });

    it('returns correct key for path', () => {
      const ref = firebase.database().ref('tests/types/number');
      const arrayItemRef = firebase.database().ref('tests/types/array/1');

      ref.key.should.eql('number');
      arrayItemRef.key.should.eql('1');
    });
  });
});
