function refTests({ fdescribe, it, firebase }) {
  fdescribe('ref().ref', () => {
    it('returns the reference', () => {
      // Setup
      const ref = firebase.native.database().ref();

      // Assertion
      ref.ref.should.eql(ref);
    });
  });
}

export default refTests;
