import should from 'should';

function firestoreTests({ describe, it, context, firebase }) {
  describe('firestore()', () => {
    context('collection()', () => {
      it('should create CollectionReference with the right id', () => {
        return new Promise((resolve) => {
          const collectionRef = firebase.native.firestore().collection('collection1/doc1/collection2');
          should.equal(collectionRef.id, 'collection2');
          resolve();
        });
      });
    });

    context('doc()', () => {
      it('should create DocumentReference with correct path', () => {
        return new Promise((resolve) => {
          const docRef = firebase.native.firestore().doc('collection1/doc1/collection2/doc2');
          should.equal(docRef.path, 'collection1/doc1/collection2/doc2');
          resolve();
        });
      });
    });

    context('batch()', () => {
      it('should create / update / delete as expected', () => {
        const ayRef = firebase.native.firestore().collection('firestore-tests').doc('AY');
        const lRef = firebase.native.firestore().collection('firestore-tests').doc('LON');
        const nycRef = firebase.native.firestore().collection('firestore-tests').doc('NYC');
        const sfRef = firebase.native.firestore().collection('firestore-tests').doc('SF');

        return firebase.native.firestore()
            .batch()
            .set(ayRef, { name: 'Aylesbury' })
            .set(lRef, { name: 'London' })
            .set(nycRef, { name: 'New York City' })
            .set(sfRef, { name: 'San Francisco' })
            .update(nycRef, { population: 1000000 })
            .update(sfRef, 'name', 'San Fran')
            .set(lRef, { population: 3000000 }, { merge: true })
            .delete(ayRef)
            .commit()
            .then(async () => {
              const ayDoc = await ayRef.get();
              should.equal(ayDoc.exists, false);

              const lDoc = await lRef.get();
              lDoc.data().name.should.equal('London');
              lDoc.data().population.should.equal(3000000);

              const nycDoc = await nycRef.get();
              nycDoc.data().name.should.equal('New York City');
              nycDoc.data().population.should.equal(1000000);

              const sfDoc = await sfRef.get();
              sfDoc.data().name.should.equal('San Fran');
            });
      });
    });
  });
}

export default firestoreTests;
