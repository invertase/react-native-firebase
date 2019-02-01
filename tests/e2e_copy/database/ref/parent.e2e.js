describe('database()', () => {
  describe('ref().parent', () => {
    describe('on the root ref', () => {
      it('returns null', () => {
        const ref = firebase.database().ref();
        (ref.parent === null).should.be.true();
      });
    });

    describe('on a non-root ref', () => {
      it('returns correct parent', () => {
        const ref = firebase.database().ref('tests/types/number');
        const parentRef = firebase.database().ref('tests/types');

        ref.parent.key.should.eql(parentRef.key);
      });
    });
  });
});
