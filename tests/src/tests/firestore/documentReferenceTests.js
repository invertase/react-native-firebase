import should from 'should';

function collectionReferenceTests({ describe, it, context, firebase }) {
  describe('DocumentReference', () => {
    context('class', () => {
      it('should return instance methods', () => {
        return new Promise((resolve) => {
          const document = firebase.native.firestore().doc('document-tests/doc1');
          document.should.have.property('firestore');
          // TODO: Remaining checks

          resolve();
        });
      });
    });

    context('delete()', () => {
      it('should delete Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .delete()
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            should.equal(doc.exists, false);
          });
      });
    });

    context('set()', () => {
      it('should create Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc2')
          .set({ name: 'doc2' })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc2').get();
            doc.data().name.should.equal('doc2');
          });
      });
    });

    context('set()', () => {
      it('should merge Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .set({ merge: 'merge' }, { merge: true })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('doc1');
            doc.data().merge.should.equal('merge');
          });
      });
    });

    context('set()', () => {
      it('should overwrite Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .set({ name: 'overwritten' })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('overwritten');
          });
      });
    });

    context('update()', () => {
      it('should update Document', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc1')
          .set({ name: 'updated' })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc1').get();
            doc.data().name.should.equal('updated');
          });
      });
    });
  });
}

export default collectionReferenceTests;
