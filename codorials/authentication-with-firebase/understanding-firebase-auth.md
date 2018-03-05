# Understanding Firebase Authentication

Before we dive into the logic of implementing authentication, it's first important to understand the Firebase API, and how it handles authentication
with the various options we have.

As we're also working in React, we'll cover how Firebase's asynchronous API fits in with Reacts lifecycle methods.
Luckily [react-native-firebase](https://rnfirebase.io) follows the Firebase web SDK API making this a breeze!

## Enabling authentication

We need to tell Firebase that we plan on using authentication and also enable a couple of the many login providers
which Firebase supports. Head over to the [Firebase console](https://console.firebase.google.com/u/0/) and select the project you're using.

Find the Authentication section and you'll be prompted with a number of options. To get started, we want to select the "SIGN-IN METHOD" tab.

You'll see we have a number of options here, however for the purposes of this Codorial we'll be using "Email/Password" and "Facebook" as our providers.
Go ahead and enable these:

![Enabled Providers](assets/auth-providers.jpg)

> If you don't have a Facebook app, simply enter dummy values. We'll cover this later on.

## Listening to the users authentication state

The Firebase API provides a simple yet powerful listener, which triggers when some event changes with the user.
This can be as obvious the user signing out or as subtle as the user validating their email address. Whatever the event, it triggers the same method: `onAuthStateChanged`.

```js
import firebase from 'react-native-firebase';

firebase.auth().onAuthStateChanged((user) => {
  console.log(user);
});
```

The callback for the `onAuthStateChanged` method returns a single parameter, commonly referred to as `user`.

The concept here is simple;

- the method is first called once Firebase responds, then any time user state changes thereafter.
- if a user is "signed in", our parameter will be a [`User`](https://firebase.google.com/docs/reference/js/firebase.User) `class`, containing all sorts of information we know about the user,
from their e-mail address to any social provider IDs they may have signed in through.
- if the user signed out, the parameter will be `null` value.

> The `user` class provides a `.toJSON()` method to serialize the users details if required.

### Handling authentication state when the app closes

A common question we get is how to handle the users authenticated state when the app closes/restarts so they don't have to keep logging in each
time they open the app. Luckily this is all handled through Firebase so you don't have to worry about a thing - they'll only be signed out if they
choose to, or the app is uninstalled.

## Creating a new account

Creating a new account on Firebase is very easy. Another method called `createUserAndRetrieveDataWithEmailAndPassword` is available which does exactly what it
says on the tin! This is an asynchronous promise which will throw an exception if something is wrong (such as email taken, or password too short).
Creating a user will also sign them in at the same time.

```js
import firebase from 'react-native-firebase';

firebase.auth().createUserAndRetrieveDataWithEmailAndPassword('jim.bob@gmail.com', 'supersecret!')
  .then((user) => {
    console.log('New User', user);
  })
  .catch((error) => {
    console.error('Woops, something went wrong!, error);
  });
```

What's great about this is we don't need to know about the user within the `.then`, as any `onAuthStateChanged` listener would get triggered with our new
users details - how awesome is that.

## Signing into an existing account

Unsurprisingly, Firebase offers a method called `signInAndRetrieveDataWithEmailAndPassword`, which follows the exact same flow as `createUserAndRetrieveDataWithEmailAndPassword`:

```js
import firebase from 'react-native-firebase';

firebase.auth().signInAndRetrieveDataWithEmailAndPassword('jim.bob@gmail.com', 'supersecret!')
  .then((user) => {
    console.log('Existing User', user);
  })
  .catch((error) => {
    console.error('Woops, something went wrong!', error);
  });
```

## Using with React

Firebase on it's own is super simple, however when using in a React environment there's some gotchas you need to be mindful of.

### Handling state changes

For any React component to update, a state or prop change needs to occur. As our Firebase auth methods are asynchronous we cannot rely on
the data being available on component mount. To solve this issue, we can make use of state:

```jsx
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from 'react-native-firebase';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      loading: false,
      user: null,
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          user: user.toJSON(), // serialize the user class
          loading: false,
        });
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  }

  render() {
    const { loading, user } = this.state;

    // Firebase hasn't responded yet
    if (loading) return null;

    // Firebase has responded, but no user exists
    if (!user) {
      return (
        <View>
          <Text>Not signed in</Text>
        </View>
      );
    }

    // Firebase has responded, and a user exists
    return (
      <View>
        <Text>User signed in! {user.email}</Text>
      </View>
    );
  }
}
```

### Subscribing/Un-subscribing from listeners

When subscribing to a new listener, such as `onAuthStateChanged`, a new reference to it is made in memory which has no knowledge of the
React environment. If a component within your app mounts and subscribes, the method will still trigger even if your component unmounted.
If this happens and you're updating state, you'll get a yellow box warning.

To get around this, Firebase returns an unsubscribe function to every subscriber method, which when calls removes the subscription from memory.
This can be easily implemented using React lifecycle methods and class properties:

```jsx
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import firebase from 'react-native-firebase';

class App extends React.Component {

  constructor() {
    super();
    this.unsubscribe = null; // Set a empty class method
    this.state = {
      loading: true,
      user: null,
    };
  }

  componentDidMount() {
    // Assign the class method to the unsubscriber response
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      // handle state changes
    });
  }

  componentWillUnmount() {
    // Call the unsubscriber if it has been set
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
```

## Further reading

The above examples just scratch the surface of whats available with Firebase auth. Firebase itself provides some in-depth documentation
on authentication and the many different implementation paths you can follow.
