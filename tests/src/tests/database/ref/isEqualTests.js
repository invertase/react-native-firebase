function isEqualTests({ describe, before, it, firebase }) {
  describe('ref().isEqual()', () => {
    before(() => {
      this.ref = firebase.native.database().ref('tests/types');
    });

    it('returns true when the reference is for the same location', () => {
      // Setup

      const ref2 = firebase.native.database().ref('tests/types');

      // Assertion

      this.ref.isEqual(ref2).should.eql(true);
    });

    it('returns false when the reference is for a different location', () => {
      // Setup

      const ref2 = firebase.native.database().ref('tests/types/number');

      // Assertion

      this.ref.isEqual(ref2).should.eql(false);
    });

    it('returns false when the reference is null', () => {
      // Assertion

      this.ref.isEqual(null).should.eql(false);
    });

    it('returns false when the reference is not a Reference', () => {
      // Assertion

      this.ref.isEqual(1).should.eql(false);
    });
  });
}

export default isEqualTests;
