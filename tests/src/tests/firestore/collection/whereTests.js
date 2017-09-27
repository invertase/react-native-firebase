import should from 'should';

/**

Test document structure from fb console:

  baz: true
  daz: 123
  foo: "bar"
  gaz: 12.1234567
  naz: null

*/

function whereTests({ describe, it, context, firebase }) {
  describe('CollectionReference.where()', () => {
    context('correctly handles', () => {
      it('== boolean values', () => {
        return firebase.native.firestore()
          .collection('tests')
          .where('baz', '==', true)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().baz, true);
            });
          });
      });

      it('== string values', () => {
        return firebase.native.firestore()
          .collection('tests')
          .where('foo', '==', 'bar')
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().foo, 'bar');
            });
          });
      });

      it('== null values', () => {
        return firebase.native.firestore()
          .collection('tests')
          .where('naz', '==', null)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().naz, null);
            });
          });
      });

      it('>= number values', () => {
        return firebase.native.firestore()
          .collection('tests')
          .where('daz', '>=', 123)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().daz, 123);
            });
          });
      });

      it('<= float values', () => {
        return firebase.native.firestore()
          .collection('tests')
          .where('gaz', '<=', 12.1234666)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().gaz, 12.1234567);
            });
          });
      });
    });
  });
}

export default whereTests;
