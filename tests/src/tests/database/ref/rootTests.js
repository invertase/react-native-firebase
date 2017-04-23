function rootTests({ describe, it, context, firebase }) {
  describe('ref().root', () => {
    context('when called on a non-root reference', () => {
      it('returns root ref', () => {
        // Setup

        const rootRef = firebase.native.database().ref();
        const nonRootRef = firebase.native.database().ref('tests/types/number');

        // Test


        // Assertion

        nonRootRef.root.should.eql(rootRef);
      });
    });

    context('when called on the root reference', () => {
      it('returns root ref', () => {
        // Setup

        const rootRef = firebase.native.database().ref();

        // Test


        // Assertion

        rootRef.root.should.eql(rootRef);
      });
    });
  });
}

export default rootTests;
