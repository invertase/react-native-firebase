const { CONTENTS, setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref()', () => {
    it('returns root reference when provided no path', () => {
      const ref = firebase.database().ref();
      (ref.key === null).should.be.true();
      (ref.parent === null).should.be.true();
    });

    it('returns reference to data at path', async () => {
      const ref = firebase.database().ref('tests/types/number');

      let valueAtRef;
      await ref.once('value', snapshot => {
        valueAtRef = snapshot.val();
      });

      valueAtRef.should.eql(CONTENTS.DEFAULT.number);
    });
  });
});
