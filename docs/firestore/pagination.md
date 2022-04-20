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
import React, { useState } from 'react';
import type { Node } from 'react';
import { Text, View, Button, Alert } from 'react-native';

import firestore from '@react-native-firebase/firestore';

const userCollection = firestore().collection('Users');

const App: () => Node = () => {
  const [lastDocument, setLastDocument] = useState();
  const [userData, setUserData] = useState([]);
};
```

# `LoadData` function

Next, make a function called `LoadData` that fetches data from `Users` collection, and call it when a `Button` is pressed.

If lastDocument is not assigned (meaning initial load), the function will fetch from the start.
After successful fetch from the collection, store the last snapshot data by `setLastDocument`.

```jsx
import React, { useState } from 'react';
import type { Node } from 'react';
import { Text, View, Button, Alert } from 'react-native';

import firestore from '@react-native-firebase/firestore';

const userCollection = firestore().collection('Users');

const App: () => Node = () => {
  const [lastDocument, setLastDocument] = useState();
  const [userData, setUserData] = useState([]);

  function LoadData() {
    console.log('LOAD');
    let query = userCollection.orderBy('age'); // sort the data
    if (lastDocument !== undefined) {
      query = query..startAfter(lastDocument); // fetch data following the last document accessed
    }
    query.limit(3) // limit to your page size, 3 is just an example
        .get()
        .then(querySnapshot => {
          setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
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

This is just an example function, alter it to process the data to meet your requirements.
In this specific example, it will replace the userData component with the new data fetched.

```js
function MakeUserData(docs) {
  let templist = []; //[...userData] <- use this instead of [] if you want to save the previous data.
  docs.forEach((doc, i) => {
    console.log(doc._data);
    let temp = (
      <View key={i} style={{ margin: 10 }}>
        <Text>{doc._data.name}</Text>
        <Text>{doc._data.age}</Text>
      </View>
    );
    templist.push(temp);
  });
  setUserData(templist); //replace with the new data
}
```

Now, every time the button is pressed, `Users` collection data will be fetched one page at a time.

# Conclusion

Here's the full example code

```jsx
import React, { useState } from 'react';
import type { Node } from 'react';
import { Text, View, Button, Alert } from 'react-native';

import firestore from '@react-native-firebase/firestore';

const userCollection = firestore().collection('Users');

const App: () => Node = () => {
  const [lastDocument, setLastDocument] = useState();
  const [userData, setUserData] = useState([]);

  function LoadData() {
    console.log('LOAD');
    let query = userCollection.orderBy('age'); // sort the data
    if (lastDocument !== undefined) {
      query = query..startAfter(lastDocument); // fetch data following the last document accessed
    }
    query.limit(3) // limit to your page size, 3 is just an example
        .get()
        .then(querySnapshot => {
          setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
          MakeUserData(querySnapshot.docs);
        });
    }
  }

  function MakeUserData(docs) {
    let templist = [];
    docs.forEach((doc, i) => {
      console.log(doc._data);
      let temp = (
        <View key={i} style={{ margin: 10 }}>
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
