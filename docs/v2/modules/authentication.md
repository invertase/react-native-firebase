# Authentication

RNFirebase handles authentication for us out of the box, both with email/password-based authentication and through oauth providers (with a separate library to handle oauth providers, see [examples](#examples)).

> Authentication requires Google Play services to be installed on Android.

## Auth

### Properties

##### `authenticated: boolean` - Returns the current Firebase authentication state.
##### `currentUser: User | null` - Returns the currently signed-in user (or null). See the [User](/modules/authentication.md#user) class documentation for further usage.

### Methods

#### [`onAuthStateChanged(event: Function): Function`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onAuthStateChanged)

Listen for changes in the users auth state (logging in and out). This method returns a unsubscribe function to stop listening to events. Always ensure you unsubscribe from the listener when no longer needed to prevent updates to components no longer in use.

```javascript
class Example extends React.Component {

  constructor() {
    super();
    this.unsubscribe = null;
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

}
```

#### [`createUserWithEmailAndPassword(email: string, password: string): Promise`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#createUserWithEmailAndPassword)

We can create a user by calling the `createUserWithEmailAndPassword()` function.
The method accepts two parameters, an email and a password.

```javascript
firebase.auth().createUserWithEmailAndPassword('foo@bar.com', '123456')
  .then((user) => {
    console.log('user created', user)
  })
  .catch((err) => {
    console.error('An error occurred', err);
  });
```

#### [`signInWithEmailAndPassword(email: string, password: string): Promise`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithEmailAndPassword)

To sign a user in with their email and password, use the `signInWithEmailAndPassword()` function.
It accepts two parameters, the user's email and password:

```javascript
firebase.auth().signInWithEmailAndPassword('foo@bar.com', '123456')
  .then((user) => {
    console.log('User successfully logged in', user)
  })
  .catch((err) => {
    console.error('User signin error', err);
  });
```

#### [`signInAnonymously(): Promise`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInAnonymously)

Sign an anonymous user. If the user has already signed in, that user will be returned.

```javascript
firebase.auth().signInAnonymously()
  .then((user) => {
    console.log('Anonymous user successfully logged in', user)
  })
  .catch((err) => {
    console.error('Anonymous user signin error', err);
  });
```

#### [`signInWithCredential(credential: Object): Promise`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithCredential)

Sign in the user with a 3rd party credential provider. `credential` requires the following properties:

```javascript
{
  provider: string,
  token: string,
  secret: string
}
```

```javascript
const credential = {
  provider: 'facebook',
  token: '12345',
  secret: '6789',
};

firebase.auth().signInWithCredential(credential)
  .then((user) => {
    console.log('User successfully signed in', user)
  })
  .catch((err) => {
    console.error('User signin error', err);
  });
```

#### [`signInWithCustomToken(token: string): Promise`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithCustomToken)

Sign a user in with a self-signed [JWT](https://jwt.io) token.

To sign a user using a self-signed custom token, use the `signInWithCustomToken()` function. It accepts one parameter, the custom token:

```javascript
firebase.auth().signInWithCustomToken('12345')
  .then((user) => {
    console.log('User successfully logged in', user)
  })
  .catch((err) => {
    console.error('User signin error', err);
  });
```

#### [`sendPasswordResetEmail(email: string): Promise`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#sendPasswordResetEmail)

Sends a password reset email to the given email address. Unlike the web SDK, the email will contain a password reset link rather than a code.

```javascript
firebase.auth().sendPasswordResetEmail('foo@bar.com')
  .then(() => {
    console.log('Password reset email sent');
  })
  .catch((error) => {
    console.error('Unable send password reset email', error);
  });
```

#### [`signOut(): Promise`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#confirmPasswordReset)

Completes the password reset process, given a confirmation code and new password.

```javascript
firebase.auth().signOut()
  .then(() => {
    console.log('User signed out successfully');
  })
  .catch();
```

## User

User class returned from `firebase.auth().currentUser`.

### Properties

##### `displayName: string | null` - The user's display name (if available).
##### `email: string | null` - The user's email address (if available).
##### `emailVerified: boolean` - True if the user's email address has been verified.
##### `isAnonymous: boolean`
##### `photoURL: string | null` - The URL of the user's profile picture (if available).
##### `providerData: Object | null` - Additional provider-specific information about the user.
##### `providerId: string | null` - The authentication provider ID for the current user. For example, 'facebook.com', or 'google.com'.
##### `uid: string` - The user's unique ID.

### Methods

#### [`delete(): Promise`](https://firebase.google.com/docs/reference/js/firebase.User#delete)

Delete the current user.

```javascript
firebase.auth().currentUser
  .delete()
  .then()
  .catch();
```

#### [`getToken(): Promise`](https://firebase.google.com/docs/reference/js/firebase.User#getToken)

Returns the users authentication token.

```javascript
firebase.auth().currentUser
  .getToken()
  .then((token) => {})
  .catch();
```


#### [`reauthenticate(credential: Object): Promise`](https://firebase.google.com/docs/reference/js/firebase.User#reauthenticate)

Reauthenticate the current user with credentials:

```javascript
{
  provider: string,
  token: string,
  secret: string
}
```

```javascript
const credentials = {
  provider: 'facebook',
  token: '12345',
  secret: '6789',
};

firebase.auth().currentUser
  .reauthenticate(credentials)
  .then()
  .catch();
```

#### [`reload(): Promise`](https://firebase.google.com/docs/reference/js/firebase.User#reload)

Refreshes the current user.

```javascript
firebase.auth().currentUser
  .reload()
  .then((user) => {})
  .catch();
```

#### [`sendEmailVerification(): Promise`](https://firebase.google.com/docs/reference/js/firebase.User#sendEmailVerification)

Sends a verification email to a user. This will Promise reject is the user is anonymous.

```javascript
firebase.auth().currentUser
  .sendEmailVerification()
  .then()
  .catch();
```

#### [updateEmail(email: string)](https://firebase.google.com/docs/reference/js/firebase.User#updateEmail)

Updates the user's email address. See Firebase docs for more information on security & email validation. This will Promise reject is the user is anonymous.

```javascript
firebase.auth().currentUser
  .updateEmail('foo@bar.com')
  .then()
  .catch();
```

#### [updatePassword(password: string)](https://firebase.google.com/docs/reference/js/firebase.User#updatePassword)

Important: this is a security sensitive operation that requires the user to have recently signed in. If this requirement isn't met, ask the user to authenticate again and then call firebase.User#reauthenticate.  This will Promise reject is the user is anonymous.

```javascript
firebase.auth().currentUser
  .updatePassword('foobar1234')
  .then()
  .catch();
```

#### [updateProfile(profile: Object)](https://firebase.google.com/docs/reference/js/firebase.User#updateProfile)

Updates a user's profile data. Profile data should be an object of fields to update:

```javascript
{
  displayName: string,
  photoURL: string,
}
```

```javascript
firebase.auth().currentUser
  .updateProfile({
    displayName: 'Display Name'
  })
  .then()
  .catch();
```

## Examples

### Facebook authentication with react-native-fbsdk and signInWithCredential

```javascript
import { AccessToken, LoginManager } from 'react-native-fbsdk';

// ... somewhere in your login screen component
LoginManager
  .logInWithReadPermissions(['public_profile', 'email'])
  .then((result) => {
    if (result.isCancelled) {
      return Promise.resolve('cancelled');
    }
    console.log(`Login success with permissions: ${result.grantedPermissions.toString()}`);
    // get the access token
    return AccessToken.getCurrentAccessToken();
  })
  .then(data => {
    // create a new firebase credential with the token
    const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);

    // login with credential
    return firebase.auth().signInWithCredential(credential);
  })
  .then((currentUser) => {
    if (currentUser === 'cancelled') {
      console.log('Login cancelled');
    } else {
      // now signed in
      console.warn(JSON.stringify(currentUser.toJSON()));
    }
  })
  .catch((error) => {
    console.log(`Login fail with error: ${error}`);
  });
```
