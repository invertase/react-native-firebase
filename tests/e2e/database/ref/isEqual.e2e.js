const { setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref().isEqual()', () => {
    before(() => {
      this.ref = firebase.database().ref('tests/types');
    });

    it('returns true when the reference is for the same location', () => {
      const ref = firebase.database().ref();
      ref.ref.should.eql(ref);

      const ref2 = firebase.database().ref('tests/types');
      this.ref.isEqual(ref2).should.eql(true);
    });

    it('returns false when the reference is for a different location', () => {
      const ref2 = firebase.database().ref('tests/types/number');
      this.ref.isEqual(ref2).should.eql(false);
    });

    it('returns false when the reference is null', () => {
      this.ref.isEqual(null).should.eql(false);
    });

    it('returns false when the reference is not a Reference', () => {
      this.ref.isEqual(1).should.eql(false);
    });
  });
});
