import DatabaseContents from '../../support/DatabaseContents';

function setTests({ describe, it, xit, firebase }) {
  describe('ref.set()', () => {
    it('returns a promise', async () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types/number');

      // Test

      const returnValue = ref.set(DatabaseContents.DEFAULT.number);

      // Assertion

      returnValue.should.be.Promise();

      await returnValue.then((value) => {
        (value === null).should.be.true();
      });
    });

    it('changes value', async () => {
      await Promise.map(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
        // Setup

        const previousValue = DatabaseContents.DEFAULT[dataRef];
        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);

        await ref.once('value').then((snapshot) => {
          snapshot.val().should.eql(previousValue);
        });

        const newValue = DatabaseContents.NEW[dataRef];

        // Test

        await ref.set(newValue);

        await ref.once('value').then((snapshot) => {
          // Assertion

          snapshot.val().should.eql(newValue);
        });
      });
    });

    it('can unset values', async () => {
      await Promise.map(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
        // Setup

        const previousValue = DatabaseContents.DEFAULT[dataRef];
        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);

        await ref.once('value').then((snapshot) => {
          snapshot.val().should.eql(previousValue);
        });

        // Test

        await ref.set(null);

        await ref.once('value').then((snapshot) => {
          // Assertion

          (snapshot.val() === null).should.be.true();
        });
      });
    });
  });
}

export default setTests;
