const {
  DOC_2,
  DOC_2_PATH,
  testCollectionDoc,
  resetTestCollectionDoc,
} = TestHelpers.firestore;

describe('firestore()', () => {
  describe('FieldValue', () => {
    beforeEach(async () => {
      await resetTestCollectionDoc(DOC_2_PATH, DOC_2);
    });

    describe('delete()', () => {
      it('should delete a field', async () => {
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        should.equal(data().title, DOC_2.title);

        await testCollectionDoc(DOC_2_PATH).update({
          title: firebase.firestore.FieldValue.delete(),
        });

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();

        should.equal(dataAfterUpdate().title, undefined);
      });
    });

    describe('serverTimestamp()', () => {
      it('should set timestamp', async () => {
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        should.equal(data().creationDate, undefined);

        await testCollectionDoc(DOC_2_PATH).update({
          creationDate: firebase.firestore.FieldValue.serverTimestamp(),
        });

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();

        dataAfterUpdate().creationDate.should.be.instanceof(
          jet.context.window.Date
        );
      });
    });
    describe('arrayUnion()', () => {
      it('should add new values to array field', async () => {
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        should.equal(data().elements, undefined);

        await testCollectionDoc(DOC_2_PATH).update({
          elements: firebase.firestore.FieldValue.arrayUnion('element 1'),
          elements2: firebase.firestore.FieldValue.arrayUnion('element 2'),
        });

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();

        dataAfterUpdate().elements.should.containDeep(['element 1']);
        dataAfterUpdate().elements2.should.containDeep(['element 2']);
      });
    });
    describe('arrayRemove()', () => {
      it('should remove value from array', async () => {
        await testCollectionDoc(DOC_2_PATH).set({
          elements: ['element 1', 'element 2'],
        });
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        data().elements.should.containDeep(['element 1', 'element 2']);

        await testCollectionDoc(DOC_2_PATH).update({
          elements: firebase.firestore.FieldValue.arrayRemove('element 2'),
        });

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();

        dataAfterUpdate().elements.should.not.containDeep(['element 2']);
      });
    });
  });
});
