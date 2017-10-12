import should from 'should';


function fieldValueTests({ describe, it, context, firebase }) {
  describe('FieldValue', () => {
    context('delete()', () => {
      it('should delete field', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc2')
          .update({
            title: firebase.native.firestore.FieldValue.delete(),
          })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc2').get();
            should.equal(doc.data().title, undefined);
          });
      });
    });

    context('serverTimestamp()', () => {
      it('should set timestamp', () => {
        return firebase.native.firestore()
          .doc('document-tests/doc2')
          .update({
            creationDate: firebase.native.firestore.FieldValue.serverTimestamp(),
          })
          .then(async () => {
            const doc = await firebase.native.firestore().doc('document-tests/doc2').get();
            doc.data().creationDate.should.be.instanceof(Date);
          });
      });
    });
  });
}

export default fieldValueTests;
