function rootTests({ describe, it, context, firebase }) {
  describe('ref().root', () => {
    context('when called on a non-root reference', () => {
      it('returns root ref', () => {
        // Setup
        const rootRef = firebase.native.database().ref();
        const nonRootRef = firebase.native.database().ref('tests/types/number');

        // Assertion
        nonRootRef.root.path.should.eql(rootRef.path);
      });
    });

    context('when called on the root reference', () => {
      it('returns root ref', () => {
        // Setup
        const rootRef = firebase.native.database().ref();

        // Assertion
        rootRef.root.path.should.eql(rootRef.path);
      });
    });
  });
}

export default rootTests;
