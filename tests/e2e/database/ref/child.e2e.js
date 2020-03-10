const { setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref().child', () => {
    describe('when passed a shallow path', () => {
      it('returns correct child ref', () => {
        const ref = firebase.database().ref('tests');
        const childRef = ref.child('tests');
        childRef.key.should.eql('tests');
      });
    });

    describe('when passed a nested path', () => {
      it('returns correct child ref', () => {
        const ref = firebase.database().ref('tests');
        const grandChildRef = ref.child('tests/number');
        grandChildRef.key.should.eql('number');
      });
    });

    describe("when passed a path that doesn't exist", () => {
      it('creates a reference, anyway', () => {
        const ref = firebase.database().ref('tests');
        const grandChildRef = ref.child('doesnt/exist');
        grandChildRef.key.should.eql('exist');
      });
    });

    describe('when passed an invalid path', () => {
      it('creates a reference, anyway', () => {
        const ref = firebase.database().ref('tests');
        const grandChildRef = ref.child('does$&nt/exist');
        grandChildRef.key.should.eql('exist');
      });
    });
  });
});
