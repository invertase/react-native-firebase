# Usage

After creating a Firebase project and installing the library, we can use it in our project by importing the library in our JavaScript:

```javascript
import firebase from 'react-native-firebase';
```

As the default app is pre-initialized natively there is no need to call `initializeApp` for the default app instance. Just import and go:

```javascript
import firebase from 'react-native-firebase';

firebase.auth().signInAnonymously()
  .then((user) => {
    console.log(user.isAnonymous);
  });
```

### Configure Default App Instance

<!-- TODO document elsewhere and place a 'See X link' here-->

### Configuring RNFirebase

<!-- TODO document elsewhere and place a 'See X link' here-->

