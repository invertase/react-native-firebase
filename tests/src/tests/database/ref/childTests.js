function childTests({ describe, it, context, firebase }) {
  describe('ref().child', () => {
    context('when passed a shallow path', () => {
      it('returns correct child ref', () => {
        // Setup

        const ref = firebase.native.database().ref('tests');

        // Test

        const childRef = ref.child('tests');

        // Assertion

        childRef.key.should.eql('tests');
      });
    });

    context('when passed a nested path', () => {
      it('returns correct child ref', () => {
        // Setup

        const ref = firebase.native.database().ref('tests');

        // Test

        const grandChildRef = ref.child('tests/number');

        // Assertion

        grandChildRef.key.should.eql('number');
      });
    });

    context('when passed a path that doesn\'t exist', () => {
      it('creates a reference, anyway', () => {
        // Setup

        const ref = firebase.native.database().ref('tests');

        // Test

        const grandChildRef = ref.child('doesnt/exist');

        // Assertion

        grandChildRef.key.should.eql('exist');
      });
    });

    context('when passed an invalid path', () => {
      it('creates a reference, anyway', () => {
        // Setup

        const ref = firebase.native.database().ref('tests');

        // Test

        const grandChildRef = ref.child('does$&nt/exist');

        // Assertion

        grandChildRef.key.should.eql('exist');
      });
    });
  });
}

export default childTests;
