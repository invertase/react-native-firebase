describe('firestore()', () => {
  describe('Query', () => {
    describe('isEqual()', () => {
      it(`returns true if two Queries have the same .where and .orderBy calls`, () => {
        const ref1 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true)
          .where('baz', '!=', false)
          .orderBy('date', 'DESC');
        const ref2 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true)
          .where('baz', '!=', false)
          .orderBy('date', 'DESC');
        should.equal(ref1.isEqual(ref2), true);
      });

      it(`returns false if two Queries have different number of .where calls`, () => {
        const ref1 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true);
        const ref2 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true)
          .where('baz', '!=', false);
        should.equal(ref1.isEqual(ref2), false);
      });

      it(`returns false if two Queries have different .where calls`, () => {
        const ref1 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true);
        const ref2 = firebase
          .firestore()
          .collection('foo')
          .where('biz', '==', true);
        should.equal(ref1.isEqual(ref2), false);
      });

      it(`returns false if two Queries have different number of .orderBy calls`, () => {
        const ref1 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true)
          .orderBy('baz', 'DESC');
        const ref2 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true)
          .orderBy('baz', 'DESC')
          .orderBy('biz', 'ASC');
        should.equal(ref1.isEqual(ref2), false);
      });

      it(`returns false if two Queries have different .orderBy calls`, () => {
        const ref1 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true)
          .orderBy('baz', 'DESC');
        const ref2 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true)
          .orderBy('baz', 'ASC');
        should.equal(ref1.isEqual(ref2), false);
      });

      it(`throws if arg is not an instance of Query`, () => {
        const ref1 = firebase
          .firestore()
          .collection('foo')
          .where('bar', '==', true);
        const maybeRef2 = 'nope';
        try {
          ref1.isEqual(maybeRef2);
          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          error.message.should.containEql('expects an instance of Query');
          return Promise.resolve();
        }
      });
    });
  });
});
