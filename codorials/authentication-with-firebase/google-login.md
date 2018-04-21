# Google Login

Much like Facebook loginin, Firebase provides the ability to accept and sign in with a Google credential.

## Installing `react-native-google-signin`

To sign in with Google, we recommend using `react-native-google-signin`. This provides a native way of obtaining the users
Google accounts and their required `accessToken`.

```
npm install react-native-google-signin --save
react-native link react-native-google-signin
```

## Creating a credential

To generate a new credential for the user, simply call the asynchronous `signIn` method `react-native-google-signin` provides and create a new
credential from the `firebase.auth.GoogleAuthProvider`:

```js
import { GoogleSignin } from 'react-native-google-signin';

// Calling this function will open Google for login.
export const googleLogin = async () => {
  try {
    // Add any configuration settings here:
    await GoogleSignin.configure();

    const data = await GoogleSignin.signIn();

    // create a new firebase credential with the token
    const credential = firebase.auth.GoogleAuthProvider.credential(
      data.idToken,
      data.accessToken
    );

    // login with credential
    const currentUser = await firebase
      .auth()
      .signInAndRetrieveDataWithCredential(credential);
  } catch (e) {
    console.error(e);
  }
};
```

The flow here is exactly the same as the rest of our app; logging in with the newly created credential will trigger our `onAuthStateChanged` lister to fire with
the new user, logging us into the application.
