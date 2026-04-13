---
title: Cloud Firestore
description: Installation and getting started with Firestore.
icon: //firebase.google.com/static/images/products/icons/build_firestore.svg
next: /firestore/usage-with-flatlists
previous: /auth/multi-factor-auth
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the firestore module
yarn add @react-native-firebase/firestore

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/firestore/usage/installation/ios) and [Android](/firestore/usage/installation/android).

If you have started to receive a `app:mergeDexDebug` error after adding Cloud Firestore, please read the
[Enabling Multidex](/enabling-multidex) documentation for more information on how to resolve this error.

# What does it do

Firestore is a flexible, scalable NoSQL cloud database to store and sync data. It keeps your data in sync across client
apps through realtime listeners and offers offline support so you can build responsive apps that work regardless of network
latency or Internet connectivity.

<Youtube id="QcsAb2RR52c" />

# Usage

## Collections & Documents

Cloud Firestore stores data within "documents", which are contained within "collections", and documents can also contain
collections. For example, we could store a list of our users documents within a "Users" collection. The `collection` method
allows us to reference a collection within our code:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

const usersCollection = firestore().collection('Users');
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection } from '@react-native-firebase/firestore';

const db = getFirestore();
const usersCollection = collection(db, 'Users');
```

The `collection` method returns a [`CollectionReference`](/reference/firestore/collectionreference) class, which provides
properties and methods to query and fetch the data from Cloud Firestore. We can also directly reference a single document
on the collection by calling the `doc` method:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

// Get user document with an ID of ABC
const userDocument = firestore().collection('Users').doc('ABC');
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc } from '@react-native-firebase/firestore';

const db = getFirestore();
// Get user document with an ID of ABC
const userDocument = doc(db, 'Users', 'ABC');
```

The `doc` method returns a [`DocumentReference`](/reference/firestore/documentreference).

A document can contain different types of data, including scalar values (strings, booleans, numbers), arrays (lists) and
objects (maps) along with specific Cloud Firestore data such as [Timestamps](/reference/firestore/timestamp),
[GeoPoints](/reference/firestore/geopoint), [Blobs](/reference/firestore/blob) and more.

## Read Data

Cloud Firestore provides the ability to read the value of a collection or document. This can be read one-time, or provide
realtime updates when the data within a query changes.

### One-time read

To read a collection or document once, call the `get` method on a [`CollectionReference`](/reference/firestore/collectionreference)
or [`DocumentReference`](/reference/firestore/documentreference):

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

const users = await firestore().collection('Users').get();
const user = await firestore().collection('Users').doc('ABC').get();
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, doc, getDocs, getDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
const users = await getDocs(collection(db, 'Users'));
const user = await getDoc(doc(db, 'Users', 'ABC'));
```

### Realtime changes

To setup an active listener to react to any changes to the query, call the `onSnapshot` method with an event handler callback.
For example, to watch the entire "Users" collection for when any documents are changed (removed, added, modified):

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

function onResult(QuerySnapshot) {
  console.log('Got Users collection result.');
}

function onError(error) {
  console.error(error);
}

firestore().collection('Users').onSnapshot(onResult, onError);
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';

const db = getFirestore();
const usersCollection = collection(db, 'Users');

const unsubscribe = onSnapshot(usersCollection,
  (querySnapshot) => console.log('Got Users collection result.'),
  (error) => console.error(error)
);
```

The `onSnapshot` method also returns a function, allowing you to unsubscribe from events. This can be used within any
`useEffect` hooks to automatically unsubscribe when the hook needs to unsubscribe itself:

For React-Native-Firebase <= v21
```js
import React, { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';

function User({ userId }) {
  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .doc(userId)
      .onSnapshot(documentSnapshot => {
        console.log('User data: ', documentSnapshot.data());
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [userId]);
}
```

For React-Native-Firebase >= v22
```js
import React, { useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';

function User({ userId }) {
  useEffect(() => {
    const db = getFirestore();
    const userDocRef = doc(db, 'Users', userId);

    const subscriber = onSnapshot(userDocRef, (documentSnapshot) => {
      console.log('User data: ', documentSnapshot.data());
    });

    return () => subscriber();
  }, [userId]);
}
```

Realtime changes via the `onSnapshot` method can be applied to both collections and documents.

### Snapshots

Once a query has returned a result, Firestore returns either a [`QuerySnapshot`](/reference/firestore/querysnapshot) (for
collection queries) or a [`DocumentSnapshot`](/reference/firestore/documentsnapshot) (for document queries). These snapshots
provide the ability to view the data, view query metadata (such as whether the data was from local cache), whether the
document exists or not and more.

#### `QuerySnapshot`

A [`QuerySnapshot`](/reference/firestore/querysnapshot) returned from a collection query allows you to inspect the collection,
such as how many documents exist within it, access to the documents within the collection, any changes since the last query
and more.

To access the documents within a `QuerySnapshot`, call the `forEach` method:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .get()
  .then(querySnapshot => {
    console.log('Total users: ', querySnapshot.size);

    querySnapshot.forEach(documentSnapshot => {
      console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
    });
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';

const db = getFirestore();
getDocs(collection(db, 'Users')).then(querySnapshot => {
  console.log('Total users: ', querySnapshot.size);

  querySnapshot.forEach(documentSnapshot => {
    console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
  });
});
```

Each child document of a `QuerySnapshot` is a [`QueryDocumentSnapshot`](/reference/firestore/querydocumentsnapshot), which
allows you to access specific information about a document (see below).

#### `DocumentSnapshot`

A [`DocumentSnapshot`](/reference/firestore/documentsnapshot) is returned from a query to a specific document, or as part
of the documents returned via a [`QuerySnapshot`](/reference/firestore/querysnapshot). The snapshot provides the ability
to view a documents data, metadata and whether a document actually exists.

To view a documents data, call the `data` method on the snapshot:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .get()
  .then(documentSnapshot => {
    console.log('User exists: ', documentSnapshot.exists);

    if (documentSnapshot.exists) {
      console.log('User data: ', documentSnapshot.data());
    }
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
getDoc(doc(db, 'Users', 'ABC')).then(documentSnapshot => {
  console.log('User exists: ', documentSnapshot.exists());

  if (documentSnapshot.exists()) {
    console.log('User data: ', documentSnapshot.data());
  }
});
```

A snapshot also provides a helper function to easily access deeply nested data within a document. Call the `get` method
with a dot-notated path:

For React-Native-Firebase <= v21
```js
function getUserZipCode(documentSnapshot) {
  return documentSnapshot.get('info.address.zipcode');
}

firestore()
  .collection('Users')
  .doc('ABC')
  .get()
  .then(documentSnapshot => getUserZipCode(documentSnapshot))
  .then(zipCode => {
    console.log('Users zip code is: ', zipCode);
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

function getUserZipCode(documentSnapshot) {
  // In v22, you typically access data() or use get() on the snapshot
  return documentSnapshot.get('info.address.zipcode');
}

const db = getFirestore();
getDoc(doc(db, 'Users', 'ABC')).then(documentSnapshot => {
  const zipCode = getUserZipCode(documentSnapshot);
  console.log('Users zip code is: ', zipCode);
});
```

### Querying

Cloud Firestore offers advanced capabilities for querying collections.

#### Filtering

To filter documents within a collection, the `where` method can be chained onto a collection reference. Filtering supports
equality checks and "in" queries. For example, to filter users where their age is greater or equal than 18 years old:

For React-Native-Firebase <= v21
```js
firestore()
  .collection('Users')
  // Filter results
  .where('age', '>=', 18)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, where, getDocs } from '@react-native-firebase/firestore';

const db = getFirestore();
const q = query(collection(db, 'Users'), where('age', '>=', 18));

getDocs(q).then(querySnapshot => {
  /* ... */
});
```

Cloud Firestore also supports array membership queries. For example, to filter users who speak both English (en) or
French (fr), use the `in` filter:

For React-Native-Firebase <= v21
```js
firestore()
  .collection('Users')
  // Filter results
  .where('languages', 'in', ['en', 'fr'])
  .get()
  .then(querySnapshot => {
    /* ... */
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, where, getDocs } from '@react-native-firebase/firestore';

const db = getFirestore();
const q = query(collection(db, 'Users'), where('languages', 'in', ['en', 'fr']));

getDocs(q).then(querySnapshot => {
  /* ... */
});
```

To learn more about all of the querying capabilities Cloud Firestore has to offer, view the
[Firebase documentation](https://firebase.google.com/docs/firestore/query-data/queries).

It is now possible to use the `Filter` instance to make queries. They can be used with the existing query API.
For example, you could chain like so:

For React-Native-Firebase <= v21
```js
const snapshot = await firestore()
  .collection('Users')
  .where(Filter('user', '==', 'Tim'))
  .where('email', '==', 'tim@example.com')
  .get();
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, where, getDocs, Filter } from '@react-native-firebase/firestore';

const db = getFirestore();
const q = query(
  collection(db, 'Users'),
  where(Filter('user', '==', 'Tim')),
  where('email', '==', 'tim@example.com')
);
const snapshot = await getDocs(q);
```

You can use the `Filter.and()` static method to make logical AND queries:

For React-Native-Firebase <= v21
```js
const snapshot = await firestore()
  .collection('Users')
  .where(Filter.and(Filter('user', '==', 'Tim'), Filter('email', '==', 'tim@example.com')))
  .get();
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, where, getDocs, Filter } from '@react-native-firebase/firestore';

const db = getFirestore();
const snapshot = await getDocs(query(
  collection(db, 'Users'),
  where(
    Filter.and(
      Filter('user', '==', 'Tim'),
      Filter('email', '==', 'tim@example.com')
    )
  )
));
```

You can use the `Filter.or()` static method to make logical OR queries:

For React-Native-Firebase <= v21
```js
const snapshot = await firestore()
  .collection('Users')
  .where(
    Filter.or(
      Filter.and(Filter('user', '==', 'Tim'), Filter('email', '==', 'tim@example.com')),
      Filter.and(Filter('user', '==', 'Dave'), Filter('email', '==', 'dave@example.com')),
    ),
  )
  .get();
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, where, getDocs, Filter } from '@react-native-firebase/firestore';

const db = getFirestore();
const snapshot = await getDocs(query(
  collection(db, 'Users'),
  where(
    Filter.or(
      Filter.and(Filter('user', '==', 'Tim'), Filter('email', '==', 'tim@example.com')),
      Filter.and(Filter('user', '==', 'Dave'), Filter('email', '==', 'dave@example.com'))
    )
  )
));
```

For an understanding of what queries are possible, please consult the query limitation documentation on the official
[Firebase Firestore documentation](https://firebase.google.com/docs/firestore/query-data/queries#limits_on_or_queries).

#### Limiting

To limit the number of documents returned from a query, use the `limit` method on a collection reference:

For React-Native-Firebase <= v21
```js
firestore()
  .collection('Users')
  // Filter results
  .where('age', '>=', 18)
  // Limit results
  .limit(20)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, where, limit, getDocs } from '@react-native-firebase/firestore';

const db = getFirestore();
const q = query(collection(db, 'Users'), where('age', '>=', 18), limit(20));

getDocs(q).then(querySnapshot => {
  /* ... */
});
```

The above example both filters the users by age and limits the documents returned to 20.

#### Ordering

To order the documents by a specific value, use the `orderBy` method:

For React-Native-Firebase <= v21
```js
firestore()
  .collection('Users')
  // Order results
  .orderBy('age', 'desc')
  .get()
  .then(querySnapshot => {
    /* ... */
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, orderBy, getDocs } from '@react-native-firebase/firestore';

const db = getFirestore();
const q = query(collection(db, 'Users'), orderBy('age', 'desc'));

getDocs(q).then(querySnapshot => {
  /* ... */
});
```

The above example orders all user in the snapshot by age in descending order.

#### Start/End

To start and/or end the query at a specific point within the collection, you can pass either a value to the `startAt`,
`endAt`, `startAfter` or `endBefore` methods. You must specify an order to use pointers, for example:

For React-Native-Firebase <= v21
```js
firestore()
  .collection('Users')
  .orderBy('age', 'desc')
  .startAt(18)
  .endAt(30)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, query, orderBy, startAt, endAt, getDocs } from '@react-native-firebase/firestore';

const db = getFirestore();
const q = query(collection(db, 'Users'), orderBy('age', 'desc'), startAt(18), endAt(30));

getDocs(q).then(querySnapshot => {
  /* ... */
});
```

The above query orders the users by age in descending order, but only returns users whose age is between 18 and 30.

You can further specify a [`DocumentSnapshot`](/reference/firestore/documentsnapshot) instead of a specific value. For example:

For React-Native-Firebase <= v21
```js
const userDocumentSnapshot = await firestore().collection('Users').doc('DEF').get();

firestore()
  .collection('Users')
  .orderBy('age', 'desc')
  .startAt(userDocumentSnapshot)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, getDoc, getDocs, query, collection, orderBy, startAt } from '@react-native-firebase/firestore';

const db = getFirestore();
const userDocumentSnapshot = await getDoc(doc(db, 'Users', 'DEF'));

getDocs(query(
  collection(db, 'Users'),
  orderBy('age', 'desc'),
  startAt(userDocumentSnapshot)
))
.then(querySnapshot => {
  /* ... */
});
```

The above query orders the users by age in descending order, however only returns documents whose order starts at the user
with an ID of `DEF`.

#### Query Limitations

Cloud Firestore does not support the following types of queries:

- Queries with range filters on different fields, as described in the previous section.

## Writing Data

The [Firebase documentation](https://firebase.google.com/docs/firestore/manage-data/structure-data) provides great examples
on best practices on how to structure your data. We highly recommend reading the guide before building out your database.

For a more in-depth look at what is possible when writing data to Firestore please refer to this [documentation](https://firebase.google.com/docs/firestore/manage-data/add-data)

## Adding documents

To add a new document to a collection, use the `add` method on a [`CollectionReference`](/reference/firestore/collectionreference):

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .add({
    name: 'Ada Lovelace',
    age: 30,
  })
  .then(() => {
    console.log('User added!');
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, collection, addDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
addDoc(collection(db, 'Users'), {
  name: 'Ada Lovelace',
  age: 30,
}).then(() => {
  console.log('User added!');
});
```

The `add` method adds the new document to your collection with a random unique ID. If you'd like to specify your own ID,
call the `set` method on a [`DocumentReference`](/reference/firestore/documentreference) instead:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .set({
    name: 'Ada Lovelace',
    age: 30,
  })
  .then(() => {
    console.log('User added!');
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
setDoc(doc(db, 'Users', 'ABC'), {
  name: 'Ada Lovelace',
  age: 30,
}).then(() => {
  console.log('User added!');
});
```

### Updating documents

The `set` method exampled above replaces any existing data on a given [`DocumentReference`](/reference/firestore/documentreference).
if you'd like to update a document instead, use the `update` method:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .update({
    age: 31,
  })
  .then(() => {
    console.log('User updated!');
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
updateDoc(doc(db, 'Users', 'ABC'), {
  age: 31,
}).then(() => {
  console.log('User updated!');
});
```

The method also provides support for updating deeply nested values via dot-notation:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .update({
    'info.address.zipcode': 94040,
  })
  .then(() => {
    console.log('User updated!');
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
updateDoc(doc(db, 'Users', 'ABC'), {
  'info.address.zipcode': 94040,
}).then(() => {
  console.log('User updated!');
});
```

#### Field values

Cloud Firestore supports storing and manipulating values on your database, such as [Timestamps](/reference/firestore/timestamp),
[GeoPoints](/reference/firestore/geopoint), [Blobs](/reference/firestore/blob) and array management.

To store [`GeoPoint`](/reference/firestore/geopoint) values, provide the latitude and longitude to a new instance of the
class:

For React-Native-Firebase <= v21
```js
firestore()
  .doc('users/ABC')
  .update({
    'info.address.location': new firestore.GeoPoint(53.483959, -2.244644),
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc, GeoPoint } from '@react-native-firebase/firestore';

const db = getFirestore();
updateDoc(doc(db, 'users', 'ABC'), {
  'info.address.location': new GeoPoint(53.483959, -2.244644),
});
```

To store a [Blob](/reference/firestore/blob) (for example of a `Base64` image string), provide the string to the static
`fromBase64String` method on the class:

For React-Native-Firebase <= v21
```js
firestore()
  .doc('users/ABC')
  .update({
    'info.avatar': firestore.Blob.fromBase64String('data:image/png;base64,iVBOR...'),
  });
```


For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc, Bytes } from '@react-native-firebase/firestore';

const db = getFirestore();
const userDocRef = doc(db, 'users', 'ABC');

updateDoc(userDocRef, {
  'info.avatar': Bytes.fromBase64String('data:image/png;base64,iVBOR...'),
});
```

When storing timestamps, it is recommended you use the `serverTimestamp` static method on the [`FieldValue`](/reference/firestore/fieldvalue)
class. When written to the database, the Firebase servers will write a new timestamp based on their time, rather than the clients. This helps
resolve any data consistency issues with different client timezones:

For React-Native-Firebase <= v21
```js
firestore().doc('users/ABC').update({
  createdAt: firestore.FieldValue.serverTimestamp(),
});
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';

const db = getFirestore();
updateDoc(doc(db, 'users', 'ABC'), {
  createdAt: serverTimestamp(),
});
```

Cloud Firestore also allows for storing arrays. To help manage the values with an array (adding or removing) the API
exposes an `arrayUnion` and `arrayRemove` methods on the [`FieldValue`](/reference/firestore/fieldvalue) class.

To add a new value to an array (if value does not exist, will not add duplicate values):

For React-Native-Firebase <= v21
```js
firestore()
  .doc('users/ABC')
  .update({
    fcmTokens: firestore.FieldValue.arrayUnion('ABCDE123456'),
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc, arrayUnion } from '@react-native-firebase/firestore';

const db = getFirestore();
updateDoc(doc(db, 'users', 'ABC'), {
  fcmTokens: arrayUnion('ABCDE123456'),
});
```

To remove a value from the array (if the value exists):

For React-Native-Firebase <= v21
```js
firestore()
  .doc('users/ABC')
  .update({
    fcmTokens: firestore.FieldValue.arrayRemove('ABCDE123456'),
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc, arrayRemove } from '@react-native-firebase/firestore';

const db = getFirestore();
const userDocRef = doc(db, 'users', 'ABC');

await updateDoc(userDocRef, {
  fcmTokens: arrayRemove('ABCDE123456'),
});
```

## Removing data

You can delete documents within Cloud Firestore using the `delete` method on a [`DocumentReference`](/reference/firestore/documentreference):

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .delete()
  .then(() => {
    console.log('User deleted!');
  });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, deleteDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
deleteDoc(doc(db, 'Users', 'ABC')).then(() => {
  console.log('User deleted!');
});
```

At this time, you cannot delete an entire collection without use of a Firebase Admin SDK.

> If a document contains any sub-collections, these will not be deleted from database. You must delete
> any sub-collections yourself.

If you need to remove a specific property with a document, rather than the document itself, you can use the `delete`
method on the [`FieldValue`](/reference/firestore/fieldvalue) class:

For React-Native-Firebase <= v21
```js
firestore().collection('Users').doc('ABC').update({
  fcmTokens: firestore.FieldValue.delete(),
});
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, updateDoc, deleteField } from '@react-native-firebase/firestore';

const db = getFirestore();
const userDocRef = doc(db, 'Users', 'ABC');

await updateDoc(userDocRef, {
  fcmTokens: deleteField(),
});
```

## Transactions

Transactions are a way to always ensure a write occurs with the latest information available on the server. Transactions
never partially apply writes & all writes execute at the end of a successful transaction.

Transactions are useful when you want to update a field's value based on its current value, or the value of some other field.
If you simply want to write multiple documents without using the document's current state, a [batch write](#batch-write) would be more appropriate.

When using transactions, note that:

- Read operations must come before write operations.
- A function calling a transaction (transaction function) might run more than once if a concurrent edit affects a document that the transaction reads.
- Transaction functions should not directly modify application state (return a value from the `updateFunction`).
- Transactions will fail when the client is offline.

Imagine a scenario whereby an app has the ability to "Like" user posts. Whenever a user presses the "Like" button,
a "likes" value (number of likes) on a "Posts" collection document increments. Without transactions, we'd first need to read
the existing value and then increment that value in two separate operations.

On a high traffic application, the value on the server could already have changed by the time the operation sets a new value,
causing the actual number to not be consistent.

Transactions remove this issue by atomically updating the value on the server. If the value changes whilst the transaction
is executing, it will retry. This always ensures the value on the server is used rather than the client value.

To execute a new transaction, call the `runTransaction` method:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

function onPostLike(postId) {
  // Create a reference to the post
  const postReference = firestore().doc(`posts/${postId}`);

  return firestore().runTransaction(async transaction => {
    // Get post data first
    const postSnapshot = await transaction.get(postReference);

    if (!postSnapshot.exists) {
      throw 'Post does not exist!';
    }

    transaction.update(postReference, {
      likes: postSnapshot.data().likes + 1,
    });
  });
}

onPostLike('ABC')
  .then(() => console.log('Post likes incremented via a transaction'))
  .catch(error => console.error(error));
```

For React-Native-Firebase >= v22
```js
import { getFirestore, doc, runTransaction } from '@react-native-firebase/firestore';

function onPostLike(postId) {
  const db = getFirestore();
  const postReference = doc(db, 'posts', postId);

  return runTransaction(db, async (transaction) => {
    const postSnapshot = await transaction.get(postReference);

    if (!postSnapshot.exists()) {
      throw 'Post does not exist!';
    }

    transaction.update(postReference, {
      likes: postSnapshot.data().likes + 1,
    });
  });
}
```

## Batch write

If you do not need to read any documents in your operation set, you can execute multiple write operations as a single batch
that contains any combination of `set`, `update`, or `delete` operations. A batch of writes completes atomically and can
write to multiple documents.

First, create a new batch instance via the `batch` method, perform operations on the batch and finally commit it once ready.
The example below shows how to delete all documents in a collection in a single operation:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

async function massDeleteUsers() {
  // Get all users
  const usersQuerySnapshot = await firestore().collection('Users').get();

  // Create a new batch instance
  const batch = firestore().batch();

  usersQuerySnapshot.forEach(documentSnapshot => {
    batch.delete(documentSnapshot.ref);
  });

  return batch.commit();
}

massDeleteUsers().then(() => console.log('All users deleted in a single batch operation.'));
```

For React-Native-Firebase >= v22
```js
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch
} from '@react-native-firebase/firestore';

async function massDeleteUsers() {
  const db = getFirestore();

  // Get all users
  const usersQuerySnapshot = await getDocs(collection(db, 'Users'));

  // Create a new batch instance using writeBatch
  const batch = writeBatch(db);

  usersQuerySnapshot.forEach(documentSnapshot => {
    // documentSnapshot.ref is still a valid reference to pass to the batch
    batch.delete(documentSnapshot.ref);
  });

  return batch.commit();
}

massDeleteUsers().then(() => console.log('All users deleted in a single batch operation.'));
```

## Secure your data

It is important that you understand how to write rules in your Firebase console to ensure that your data is secure. Please
follow the Firebase Firestore documentation on [security](https://firebase.google.com/docs/firestore/security/get-started).

## Offline Capabilities

Firestore provides out of the box support for offline capabilities. When reading and writing data, Firestore uses a local
database which synchronizes automatically with the server. Firestore functionality continues when users are offline, and
automatically handles data migration to the server when they regain connectivity.

This functionality is enabled by default, however it can be disabled if you need it to be disabled (e.g. on apps containing
sensitive information). The `settings()` method must be called before any Firestore interaction is performed, otherwise it will only take effect on the next app launch:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

async function bootstrap() {
  await firestore().settings({
    persistence: false, // disable offline persistence
  });
}
```

For React-Native-Firebase >= v22
```js
import { getApp } from '@react-native-firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from '@react-native-firebase/firestore';

async function bootstrap() {
  const app = getApp(); // Get the default firebase app

  // Initialize firestore with specific settings
  await initializeFirestore(app, {
    persistence: false, // In v22, this disables the cache persistence
    // You can also set other settings here, like:
    // cacheSizeBytes: CACHE_SIZE_UNLIMITED
  });
}
```

## Data bundles

Cloud Firestore data bundles are static data files built by you from Cloud Firestore document and query snapshots,
and published by you on a CDN, hosting service or other solution. Once a bundle is loaded, a client app can query documents
from the local cache or the backend.

To load and query data bundles, use the `loadBundle` and `namedQuery` methods:

For React-Native-Firebase <= v21
```js
import firestore from '@react-native-firebase/firestore';

// load the bundle contents
const response = await fetch('https://api.example.com/bundles/latest-stories');
const bundle = await response.text();
await firestore().loadBundle(bundle);

// query the results from the cache
// note: omitting "source: cache" will query the Firestore backend
const query = firestore().namedQuery('latest-stories-query');
const snapshot = await query.get({ source: 'cache' });
```

For React-Native-Firebase >= v22
```js
import { getFirestore, loadBundle, namedQuery, getDocsFromCache } from '@react-native-firebase/firestore';

const db = getFirestore();

// load the bundle contents
const response = await fetch('https://api.example.com/bundles/latest-stories');
const bundle = await response.text();
// Pass the db instance as the first argument
await loadBundle(db, bundle);

// query the results from the cache
const q = await namedQuery(db, 'latest-stories-query');

// Use getDocsFromCache to explicitly pull from the loaded bundle
const snapshot = await getDocsFromCache(q);
```

You can build data bundles with the Admin SDK. For more information about building and serving data bundles, see Firebase Firestore main documentation on [Data bundles](https://firebase.google.com/docs/firestore/bundles) as well as their "[Bundle Solutions](https://firebase.google.com/docs/firestore/solutions/serve-bundles)" page
