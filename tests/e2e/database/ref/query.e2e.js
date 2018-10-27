const { CONTENTS, setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref() query', () => {
    it('orderByChild().equalTo()', async () => {
      const snapshot = await firebase
        .database()
        .ref('tests/query')
        .orderByChild('search')
        .equalTo('foo')
        .once('value');

      const val = snapshot.val();
      CONTENTS.QUERY[0].should.eql({ ...val[0] });
    });

    // TODO more query tests
  });
});
