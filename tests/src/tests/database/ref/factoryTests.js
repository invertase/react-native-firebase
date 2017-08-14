import DatabaseContents from '../../support/DatabaseContents';

function factoryTests({ describe, it, firebase }) {
  describe('ref()', () => {
    it('returns root reference when provided no path', () => {
      // Setup

      const ref = firebase.native.database().ref();

      // Test


      // Assertion

      (ref.key === null).should.be.true();
      (ref.parent === null).should.be.true();
    });

    it('returns reference to data at path', async () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types/number');

      // Test
      let valueAtRef;

      await ref.once('value', (snapshot) => {
        valueAtRef = snapshot.val();
      });

      // Assertion

      valueAtRef.should.eql(DatabaseContents.DEFAULT.number);
    });
  });
}

export default factoryTests;
