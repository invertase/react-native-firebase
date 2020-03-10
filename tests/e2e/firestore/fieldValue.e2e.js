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
          firebase.firestore.Timestamp
        );
      });
    });

    describe('increment()', () => {
      it('should increment a value', async () => {
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        should.equal(data().incrementValue, undefined);

        await testCollectionDoc(DOC_2_PATH).update({
          incrementValue: firebase.firestore.FieldValue.increment(69),
        });

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();

        dataAfterUpdate().incrementValue.should.equal(69);
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

      it('should adding references & objects', async () => {
        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        should.equal(data().elements, undefined);

        await testCollectionDoc(DOC_2_PATH).update({
          elements: firebase.firestore.FieldValue.arrayUnion(
            'element 1',
            firebase
              .firestore()
              .collection('bar')
              .doc('foo'),
            firebase
              .firestore()
              .collection('bar')
              .doc('baz'),
            { foo: 'bar', baz: [1, 2, 3], daz: { f: 'f' } }
          ),
        });

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();

        const { elements } = dataAfterUpdate();
        elements.length.should.equal(4);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (i === 0) element.should.equal('element 1');
          if (i === 1) {
            element.should.be.instanceOf(
              jet.require('src/modules/firestore/DocumentReference')
            );
            element.id.should.equal('foo');
          }
          if (i === 2) {
            element.should.be.instanceOf(
              jet.require('src/modules/firestore/DocumentReference')
            );
            element.id.should.equal('baz');
          }
          if (i === 3) {
            element.foo.should.equal('bar');
            element.baz[0].should.equal(1);
          }
        }
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

      it('should allow removing references & objects', async () => {
        await testCollectionDoc(DOC_2_PATH).set({
          elements: firebase.firestore.FieldValue.arrayUnion(
            'element 1',
            firebase
              .firestore()
              .collection('bar')
              .doc('foo'),
            firebase
              .firestore()
              .collection('bar')
              .doc('baz'),
            { foo: 'bar', baz: [1, 2, 3], daz: { f: 'f' } }
          ),
        });

        const { data } = await testCollectionDoc(DOC_2_PATH).get();
        const { elements } = data();
        elements.length.should.equal(4);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (i === 0) element.should.equal('element 1');
          if (i === 1) {
            element.should.be.instanceOf(
              jet.require('src/modules/firestore/DocumentReference')
            );
            element.id.should.equal('foo');
          }
          if (i === 2) {
            element.should.be.instanceOf(
              jet.require('src/modules/firestore/DocumentReference')
            );
            element.id.should.equal('baz');
          }
          if (i === 3) {
            element.foo.should.equal('bar');
            element.baz[0].should.equal(1);
          }
        }

        // now remove the last 2 items with arrayRemove
        await testCollectionDoc(DOC_2_PATH).update({
          elements: firebase.firestore.FieldValue.arrayRemove(
            firebase
              .firestore()
              .collection('bar')
              .doc('baz'),
            { foo: 'bar', baz: [1, 2, 3], daz: { f: 'f' } }
          ),
        });

        const { data: dataAfterUpdate } = await testCollectionDoc(
          DOC_2_PATH
        ).get();

        const { elements: elementsAfterUpdate } = dataAfterUpdate();
        elementsAfterUpdate.length.should.equal(2);

        for (let i = 0; i < elementsAfterUpdate.length; i++) {
          const element = elementsAfterUpdate[i];
          if (i === 0) element.should.equal('element 1');
          if (i === 1) {
            element.should.be.instanceOf(
              jet.require('src/modules/firestore/DocumentReference')
            );
            element.id.should.equal('foo');
          }
        }
      });
    });
  });
});
