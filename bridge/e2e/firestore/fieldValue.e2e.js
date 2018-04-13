const {
  DOC_2,
  DOC_2_PATH,
  testCollectionDoc,
  resetTestCollectionDoc,
} = TestHelpers.firestore;

describe('firestore()', () => {
  describe('FieldValue', () => {
    before(async () => {
      await resetTestCollectionDoc(DOC_2_PATH, DOC_2);
    });

    describe('delete()', () => {
      it('should delete a field', async () => {
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        should.equal(data().title, DOC_2.title);
        console.log('after 1st get');

        await testCollectionDoc(DOC_2_PATH).update({
          title: firebase.firestore.FieldValue.delete(),
        });
        console.log('after update');

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();
        console.log('after 2nd get');

        should.equal(dataAfterUpdate().title, undefined);
      });
    });

    describe('serverTimestamp()', () => {
      it('should set timestamp', async () => {
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        should.equal(data().creationDate, undefined);
        console.log('after 1st get');

        await testCollectionDoc(DOC_2_PATH).update({
          creationDate: firebase.firestore.FieldValue.serverTimestamp(),
        });
        console.log('after update');

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();
        console.log('after 2nd get');

        dataAfterUpdate().creationDate.should.be.instanceof(
          bridge.context.window.Date
        );
      });
    });
  });
});
