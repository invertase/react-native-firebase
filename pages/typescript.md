---
title: Typescript
description: Using Typescript with React Native Firebase
---

# Typescript

The React Native Firebase project comes with out of the box support for Typescript. The project provides
Ambient Declarations for each Firebase module, without having to install any additional dependencies.

## Example

To demonstrate Typescript usage in a practical example, the following assumes Typescript is already setup on your environment.
If you are looking to setup a new project or migrate an existing project to Typescript please check out this official [blog post](https://facebook.github.io/react-native/blog/2018/05/07/using-typescript-with-react-native).

The below example makes use of the <Anchor version="v6" group="admob" href="/">Authentication</Anchor> module, demonstrating
how to safely type code using the declarations the module provides.

Lets go ahead and create a new `App.tsx` component:

```jsx
import * as React from 'react';
import { Text } from 'react-native';
import auth from '@react-native-firebase/auth';

function App() {
  const user = auth().currentUser;

  return <Text>Welcome {user.email}</Text>;
}

export default App;
```

This code will produce a Typescript error: `Object is possibly null`. Accessing `currentUser` returns the
current <Anchor version="v6" group="auth" href="reference/user">`User`</Anchor> is the user is signed in or `null` if
they are signed out. This error prevents our code from compiling and for good reason - without checking the users authentication
status, accessing the `email` property on `User` will cause the app to crash!

To rectify our unsafe code, we can check the existence of the `user` before accessing it:

```jsx
function App() {
  const user = auth().currentUser;

  if (!user) {
    return <Text>Please login</Text>;
  }

  return <Text>Welcome {user.email}</Text>;
}
```

The Typescript error will remove allowing us to safely continue developing our app crash free.

It is also possible to access the module types directly, if you need to locally reference variables within your own codebase.
For example, we may need to store the `User` in local state. Without manually defining a type to local state, Typescript loses
the ability to safety check the code. We can easily access the types manually through the module, for example:

```jsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import auth, { Auth } from '@react-native-firebase/auth';

function App() {
  const [loading, setLoading] = useState < boolean > true;
  const [user, setUser] = (useState < Auth.User) | (null > null);

  useEffect(() => {
    auth().onAuthStateChanged(userState => {
      setUser(userState);

      if (loading) {
        setLoading(false);
      }
    });
  }, []);

  // ...
}

export default App;
```

We firstly initialize a local state variable called `user`, and manually provide a type definition of that state item
of `<Auth.User | null>`. As we are unaware of the users authentication state, we initialize state with a value of `null`
which is a valid type for this state.

The `onAuthStateChanged` listener triggers with a `User` or `null` parameter whenever the users authentication state changes. The
`@react-native-firebase/auth` module provides Typescript with these types automatically. As the returned types match
the local state type, we are able to set the state immediately without any type check errors.

Attempting to set `user` state to anything other than the `User` or `null` will throw a Typescript error.

## Definitions

The full set of Typescript definitions for each module can be found on the [invertase/react-native-firebase](https://github.com/invertase/react-native-firebase)
repository within each package.

For example, the auth module definitions are located at [`react-native-firebase/packages/auth/lib/index.d.ts`](https://github.com/invertase/react-native-firebase/blob/master/packages/auth/lib/index.d.ts).
