---
title: Pagination
description: Pagination example using Cloud Firestore.
next: /functions/usage
previous: /firestore/usage-with-flatlists
---

Pagination using cloud firestore may be done in various ways but here's a basic way to do it using the firestore query features:
[`orderBy`, `limit`, `startAfter`]

# Setup state

First, create a list display component with 2 state items; `lastDocument` and `userData`:

```jsx
import React, {useState} from 'react';
import type {Node} from 'react';
import {Text, View, Button, Alert} from 'react-native';

import firestore from '@react-native-firebase/firestore';

const userCollection = firestore().collection('Users');

const App: () => Node = () => {
  const [lastDocument, setLastDocument] = useState();
  const [userData, setUserData] = useState([]);
};
```

# `LoadData` function

Next, make a function called `LoadData` that fetches data from `Users` collection, and call it when a `Button` is pressed.

If lastSanpshot is not assigned (meaning initial load), the function will fetch from the start.
After successful fetch from the collection, store the last snapshot data by `setLastSnapshot`.

```jsx
import React, {useState} from 'react';
import type {Node} from 'react';
import {Text, View, Button, Alert} from 'react-native';

import firestore from '@react-native-firebase/firestore';

const userCollection = firestore().collection('Users');

const App: () => Node = () => {
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [userData, setUserData] = useState([]);

  function LoadData() {
    console.log('LOAD');
    if (!lastSnapshot) {
      userCollection
        .orderBy('age') //sort the data
        .limit(3) //get limited amount of data
        .get()
        .then(querySnapshot => {
          setLastSnapshot(querySnapshot.docs[querySnapshot.docs.length - 1]); //set up last snapshot for pagination
          MakeUserData(querySnapshot.docs); //do what you need to do with the data
        });
    } else {
      userCollection
        .orderBy('age')
        .startAfter(lastSnapshot) //fetch data that is placed after the last snapshot that we fetched before.
        .limit(3)
        .get()
        .then(querySnapshot => {
          setLastSnapshot(querySnapshot.docs[querySnapshot.docs.length - 1]);
          MakeUserData(querySnapshot.docs);
        });
    }
  }

  return (
    <View>
      {userData}
      <Button
        onPress={() => {
          LoadData();
        }}
        title="Load Next"
      />
    </View>
  );
};
```

# `MakeUserData` function

This is just an example function. You may change this functino into things that you need.
In this specific example, it will replace the userData component with the new data fetched.

```js
function MakeUserData(docs) {
  let templist = []; //[...userData] <- use this instead of [] if you want to save the previous data.
  docs.forEach((doc, i) => {
    console.log(doc._data);
    let temp = (
      <View key={i} style={{margin: 10}}>
        <Text>{doc._data.name}</Text>
        <Text>{doc._data.age}</Text>
      </View>
    );
    templist.push(temp);
  });
  setUserData(templist); //replace with the new data
}
```

Now, everytime you click the button, you will load the data from the `Users` collection.
If the fetch succesfully completed, you will save the last snapshot and set the userdata component.
Based on the last snapshot, `LoadData` will fetch the data accordingly.

# Conclusion

Here's the full example code

```jsx
import React, {useState} from 'react';
import type {Node} from 'react';
import {Text, View, Button, Alert} from 'react-native';

import firestore from '@react-native-firebase/firestore';

const userCollection = firestore().collection('Users');

const App: () => Node = () => {
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [userData, setUserData] = useState([]);

  function LoadData() {
    console.log('LOAD');
    if (!lastSnapshot) {
      userCollection
        .orderBy('age')
        .limit(3)
        .get()
        .then(querySnapshot => {
          setLastSnapshot(querySnapshot.docs[querySnapshot.docs.length - 1]);
          MakeUserData(querySnapshot.docs);
        });
    } else {
      userCollection
        .orderBy('age')
        .startAfter(lastSnapshot)
        .limit(3)
        .get()
        .then(querySnapshot => {
          setLastSnapshot(querySnapshot.docs[querySnapshot.docs.length - 1]);
          MakeUserData(querySnapshot.docs);
        });
    }
  }

  function MakeUserData(docs) {
    let templist = [];
    docs.forEach((doc, i) => {
      console.log(doc._data);
      let temp = (
        <View key={i} style={{margin: 10}}>
          <Text>{doc._data.name}</Text>
          <Text>{doc._data.age}</Text>
        </View>
      );
      templist.push(temp);
    });
    setUserData(templist);
  }

  return (
    <View>
      {userData}
      <Button
        onPress={() => {
          LoadData();
        }}
        title="Load Next"
      />
    </View>
  );
};

export default App;
```
