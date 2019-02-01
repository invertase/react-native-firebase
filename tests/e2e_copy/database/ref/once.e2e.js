const { CONTENTS, setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref().once()', () => {
    it('returns a promise', () => {
      const ref = firebase.database().ref('tests/types/number');
      const returnValue = ref.once('value');
      returnValue.should.be.Promise();
    });

    it('resolves with the correct value', async () => {
      await Promise.all(
        Object.keys(CONTENTS.DEFAULT).map(dataRef => {
          const dataTypeValue = CONTENTS.DEFAULT[dataRef];
          const ref = firebase.database().ref(`tests/types/${dataRef}`);
          return ref.once('value').then(snapshot => {
            snapshot.val().should.eql(jet.contextify(dataTypeValue));
          });
        })
      );
    });

    it('is NOT called when the value is changed', async () => {
      const callback = sinon.spy();
      const ref = firebase.database().ref('tests/types/number');
      ref.once('value').then(callback);
      await ref.set(CONTENTS.NEW.number);
      callback.should.be.calledOnce();
    });

    it('errors if permission denied', async () => {
      const reference = firebase.database().ref('nope');

      try {
        await reference.once('value');
      } catch (error) {
        error.code.includes('database/permission-denied').should.be.true();
        return true;
      }

      throw new Error('No permission denied error');
    });
  });
});
