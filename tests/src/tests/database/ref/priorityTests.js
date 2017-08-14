import DatabaseContents from '../../support/DatabaseContents';

function setTests({ describe, it, firebase }) {
  describe('ref().priority', () => {
    it('setPriority() should correctly set a priority for all non-null values', async () => {
      await Promise.map(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
        // Setup

        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);

        // Test

        await ref.setPriority(1);

        // Assertion

        await ref.once('value').then((snapshot) => {
          if (snapshot.val() !== null) {
            snapshot.getPriority().should.eql(1);
          }
        });
      });
    });

    it('setWithPriority() should correctly set the priority', async () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types/number');

      // Test

      await ref.setWithPriority(DatabaseContents.DEFAULT.number, '2');

      // Assertion

      await ref.once('value').then((snapshot) => {
        snapshot.getPriority().should.eql('2');
      });
    });
  });
}

export default setTests;
