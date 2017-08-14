function parentTests({ describe, context, it, firebase }) {
  describe('ref().parent', () => {
    context('on the root ref', () => {
      it('returns null', () => {
        // Setup

        const ref = firebase.native.database().ref();

        // Test


        // Assertion

        (ref.parent === null).should.be.true();
      });
    });

    context('on a non-root ref', () => {
      it('returns correct parent', () => {
        // Setup

        const ref = firebase.native.database().ref('tests/types/number');
        const parentRef = firebase.native.database().ref('tests/types');

        // Assertion

        ref.parent.key.should.eql(parentRef.key);
      });
    });
  });
}

export default parentTests;
