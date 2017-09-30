# Usage

After creating a Firebase project and installing the library, you can then use it in your project by importing the library in your JavaScript code:

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

See [configure the default app instance](/core/config-default-app).

### Configuring RNFirebase

See [configure RNFirebase](/core/config-rnfirebase).

