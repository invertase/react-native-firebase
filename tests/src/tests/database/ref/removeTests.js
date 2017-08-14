import DatabaseContents from '../../support/DatabaseContents';

function removeTests({ describe, it, firebase }) {
  describe('ref().remove()', () => {
    it('returns a promise', () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types');

      // Test

      const returnValue = ref.remove({ number: DatabaseContents.DEFAULT.number });

      // Assertion

      returnValue.should.be.Promise();
    });

    it('sets value to null', async () => {
      await Promise.map(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
        // Setup

        const previousValue = DatabaseContents.DEFAULT[dataRef];
        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);

        await ref.once('value').then((snapshot) => {
          snapshot.val().should.eql(previousValue);
        });

        // Test

        await ref.remove();

        // Assertion

        await ref.once('value').then((snapshot) => {
          (snapshot.val() === null).should.be.true();
        });
      });
    });
  });
}

export default removeTests;
