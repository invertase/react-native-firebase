function keyTests({ describe, it, firebase }) {
  describe('ref().key', () => {
    it('returns null for root ref', () => {
      // Setup

      const ref = firebase.native.database().ref();

      // Test


      // Assertion

      (ref.key === null).should.be.true();
    });

    it('returns correct key for path', () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types/number');
      const arrayItemRef = firebase.native.database().ref('tests/types/array/1');

      // Assertion

      ref.key.should.eql('number');
      arrayItemRef.key.should.eql('1');
    });
  });
}

export default keyTests;
