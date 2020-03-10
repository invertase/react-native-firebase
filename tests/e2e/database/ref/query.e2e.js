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

    it('orderByKey()', async () => {
      const snapshot = await firebase
        .database()
        .ref('tests/query')
        .orderByKey()
        .once('value');

      const val = snapshot.val();
      for (let i = 0; i < CONTENTS.QUERY.length; i += 1) {
        CONTENTS.QUERY[i].should.eql({ ...val[i] });
      }
    });

    it('orderByKey().limitToFirst()', async () => {
      const snapshot = await firebase
        .database()
        .ref('tests/query')
        .orderByKey()
        .limitToFirst(1)
        .once('value');

      const val = snapshot.val();
      CONTENTS.QUERY[0].should.eql({ ...val[0] });
    });
    it('orderByPriority()', async () => {
      const snapshot = await firebase
        .database()
        .ref('tests/query')
        .orderByPriority()
        .once('value');

      const val = snapshot.val();
      for (let i = 0; i < CONTENTS.QUERY.length; i += 1) {
        CONTENTS.QUERY[i].should.eql({ ...val[i] });
      }
    });
    // TODO more query tests
  });
});
