import should from 'should';

function collectionReferenceTests({ describe, it, context, firebase }) {
  describe('CollectionReference', () => {
    context('class', () => {
      it('should return instance methods', () => {
        return new Promise((resolve) => {
          const collection = firebase.native.firestore().collection('collection-tests');
          collection.should.have.property('firestore');
          // TODO: Remaining checks

          resolve();
        });
      });
    });

    context('add()', () => {
      it('should create Document', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .add({ first: 'Ada', last: 'Lovelace', born: 1815 })
          .then(async (docRef) => {
            const doc = await firebase.native.firestore().doc(docRef.path).get();
            doc.data().first.should.equal('Ada');
          });
      });
    });

    context('doc()', () => {
      it('should create DocumentReference with correct path', () => {
        return new Promise((resolve) => {
          const docRef = firebase.native.firestore().collection('collection-tests').doc('doc');
          should.equal(docRef.path, 'collection-tests/doc');
          resolve();
        });
      });
    });

    context('get()', () => {
      it('should retrieve a single document', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().baz, true);
            });
          });
      });
    });

    // Where
    context('where()', () => {
      it('correctly handles == boolean values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('baz', '==', true)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().baz, true);
            });
          });
      });

      it('correctly handles == string values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('foo', '==', 'bar')
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().foo, 'bar');
            });
          });
      });

      it('correctly handles == null values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('naz', '==', null)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().naz, null);
            });
          });
      });

      it('correctly handles >= number values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
          .where('daz', '>=', 123)
          .get()
          .then((querySnapshot) => {
            should.equal(querySnapshot.size, 1);
            querySnapshot.forEach((documentSnapshot) => {
              should.equal(documentSnapshot.data().daz, 123);
            });
          });
      });

      it('correctly handles <= float values', () => {
        return firebase.native.firestore()
          .collection('collection-tests')
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

export default collectionReferenceTests;
