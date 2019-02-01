const { CONTENTS, setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref().priority', () => {
    it('setPriority() should correctly set a priority for all non-null values', async () => {
      await Promise.all(
        Object.keys(CONTENTS.DEFAULT).map(async dataRef => {
          const ref = firebase.database().ref(`tests/types/${dataRef}`);

          await ref.setPriority(1);

          await ref.once('value').then(snapshot => {
            if (snapshot.val() !== null) {
              snapshot.getPriority().should.eql(1);
            }
          });
        })
      );
    });

    it('setWithPriority() should correctly set the priority', async () => {
      const ref = firebase.database().ref('tests/types/number');

      await ref.setWithPriority(CONTENTS.DEFAULT.number, '2');

      await ref.once('value').then(snapshot => {
        snapshot.getPriority().should.eql('2');
      });
    });
  });
});
