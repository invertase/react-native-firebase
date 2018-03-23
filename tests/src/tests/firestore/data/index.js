import firebase from '../../../firebase';

export const COL_DOC_1 = {
  baz: true,
  daz: 123,
  foo: 'bar',
  gaz: 12.1234567,
  geopoint: new firebase.native.firestore.GeoPoint(0, 0),
  naz: null,
  object: {
    daz: 123,
  },
  timestamp: new Date(2017, 2, 10, 10, 0, 0),
};
export const DOC_1 = { name: 'doc1' };
export const DOC_2 = { name: 'doc2', title: 'Document 2' };

/* HELPER FUNCTIONS */
export async function cleanCollection(collection) {
  const collectionTestsDocs = await collection.get();
  const tasks = [];
  collectionTestsDocs.forEach(doc => tasks.push(doc.ref.delete()));
  await Promise.all(tasks);
}
