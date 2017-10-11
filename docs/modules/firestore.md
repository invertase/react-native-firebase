
# Firestore (Beta)

RNFirebase mimics the [Firestore Web SDK](https://firebase.google.com/docs/reference/js/firebase.firestore) by providing a bridge to the native Android and iOS Firestore SDK's.

All Firestore operations are accessed via `firebase.firestore()`. For detailed documentation of the supported methods demonstrated below please use the official firestore web sdk guides.

?> Please note that Persistence (offline support) is enabled by default with Firestore on iOS and Android.

## Add and Manage Data

### Collections

Read information about a collection example:
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .collection('posts')
  .get()
  .then(querySnapshot => {
    // Access all the documents in the collection
    const docs = querySnapshot.docs;
    // Access the list of document changes for the collection
    const changes = querySnapshot.docChanges;
    // Loop through the documents
    querySnapshot.forEach((doc) => {
      const value = doc.data();
    })
  })
```

Add to a collection example (generated ID):
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .collection('posts')
  .add({
    title: 'Amazing post',
  })
  .then(() => {
    // Document added to collection and ID generated
    // Will have path: `posts/{generatedId}`
  })
```

Add to a collection example (manual ID):
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .collection('posts')
  .doc('post1')
  .set({
    title: 'My awesome post',
    content: 'Some awesome content',
  })
  .then(() => {
    // Document added to collection with path: `posts/post1`
  })
```

### Documents

There are multiple ways to read a document.  The following are equivalent examples:
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .doc('posts/posts1')
  .get()
  .then((documentSnapshot) => {
    const value = documentSnapshot.data();
  });

firebase.firestore()
  .collection('posts')
  .doc('posts1')
  .get()
  .then((documentSnapshot) => {
    const value = documentSnapshot.data();
  });
```

Create a document example:
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .doc('posts/posts1')
  .set({
    title: 'My awesome post',
    content: 'Some awesome content',
  })
  .then(() => {
    // Document created
  });
```

Updating a document example:
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .doc('posts/posts1')
  .update({
    title: 'My awesome post',
  })
  .then(() => {
    // Document created
  });
```

Deleting a document example:
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .doc('posts/posts1')
  .delete()
  .then(() => {
    // Document deleted
  });
```

### Batching document updates

Writes, updates and deletes to documents can be batched and committed atomically as follows:

```javascript
import firebase from 'react-native-firebase';

const ayRef = firebase.firestore().doc('places/AY');
const lRef = firebase.firestore().doc('places/LON');
const nycRef = firebase.firestore().doc('places/NYC');
const sfRef = firebase.firestore().doc('places/SF');

firebase.firestore()
  .batch()
  .set(ayRef, { name: 'Aylesbury' })
  .set(lRef, { name: 'London' })
  .set(nycRef, { name: 'New York City' })
  .set(sfRef, { name: 'San Francisco' })
  .update(nycRef, { population: 1000000 })
  .update(sfRef, { name: 'San Fran' })
  .set(lRef, { population: 3000000 }, { merge: true })
  .delete(ayRef)
  .commit()
  .then(() => {
    // Would end up with three documents in the collection: London, New York City and San Francisco
  });
```

### Transactions

Coming soon

## Realtime Updates

### Collections

Listen to collection updates example:
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .collection('cities')
  .where('state', '==', 'CA')
  .onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      // DocumentSnapshot available
    })
  })
```

The snapshot handler will receive a new query snapshot every time the query results change (that is, when a document is added, removed, or modified).

### Documents

Listen to document updates example:
```javascript
import firebase from 'react-native-firebase';

firebase.firestore()
  .doc('posts/post1')
  .onSnapshot((documentSnapshot) => {
    // DocumentSnapshot available
  })
```

The snapshot handler will receive the current contents of the document, and any subsequent changes to the document.
