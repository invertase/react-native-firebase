# App Navigation

React Navigation has gone through many cycles of navigation implementations and has been a pain point for developers for a good while.
A current "go to" navigation library is called [react-navigation](https://reactnavigation.org/). It's pure JavaScript implementation
which performs well and provides a solid foundation for navigation on both Android and iOS.

Authentication typically requires 3 screens; Login, Register & Forgot Password.

## Installation

Simply install the dependency via NPM, no native installation is needed:

```bash
npm install --save react-navigation
```

## Navigation Stacks

Navigation on an app typically works in stacks, where a user can navigate to a new screen (pushing a new screen onto the stack), or backwards (popping
a screen off the stack).

What's great about this concept is that we can create multiple instances of a stack, for example a stack for unauthenticated users and another for
authenticated ones.

To create a new stack, we import the `StackNavigator` from `react-navigation`. In it's basic form, the first item of the `StackNavigator` object
acts as our initial screen on the stack. Lets create a new directory and component for our unauthenticated state:

```js
// src/screens/unauthenticated/index.js

import { StackNavigator } from 'react-navigation';

import Login from './Login';
import Register from './Register';

export default StackNavigator({
  Login: {
    screen: Login,
  },
  Register: {
    screen: Register,
  }
});
```

In both the `Login` & `Register` files, create a basic React component (change Login to Register where appropriate):

```jsx
// src/screens/unauthenticated/Login.js
// src/screens/unauthenticated/Register.js

import React, { Component } from 'react';
import { View, Text } from 'react-native';

class Login extends Component {
  render() {
    return (
      <View>
        <Text>
          Login
        </Text>
      </View>
    );
  }
}
```

## Using the stack

StackNavigator returns a React component which can be rendered in our app. If we go back to our `src/App.js` component, we can now return
the stack:

```jsx
// src/App.js

import React, { Component } from 'react';

import UnauthenticatedStack from './screens/unauthenticated';

class App extends Component {

    render() {
      return <UnauthenticatedStack />;
    }

}

export default App;
```

Our `UnauthenticatedStack` component will now show the `Login` component as it's the first item in the `StackNavigator`. Reload your app and you
should have your `Login` component rendering!

TODO image

## Styling the navigator

As you can see, `react-navigation` provides a base view which is platform specific.

..

## Pushing a new stack

