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

![Basic Navigation](assets/1-unauthenticated-nav.jpg =300x*)

## Styling the navigator

As you can see, `react-navigation` provides basic styling to mimic the feel of Android's [Material Design](https://material.io). The
library provides a simple, React like API to style and control your app.

> If you're using iOS, the functionality will remain the same however the basic styling will represent that of the iOS interface instead!

For this example we're going to add a title to our screen and liven up the colors - there's loads more you can do with `react-navigation` though,
just check out their in-depth [documentation](https://reactnavigation.org/docs/getting-started.html).

Lets go ahead and style the screen, using a class static `navigationOptions` object which lets `react-navigation` access our screen component:

```jsx
// src/screens/unauthenticated/Login.js
import React, { Component } from 'react';
import { View, Text } from 'react-native';

class Login extends Component {

  // Add our react-navigation static method:
  static navigationOptions = {
    title: 'Login',
    headerStyle: {
      backgroundColor: '#E6853E',
    },
    headerTintColor: '#fff',
  };

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

export default Login;
```

With this basic config you'll end up with an Android looking app with minimal configuration. Whats better is that `react-navigation` will also
take care of any back buttons and screen animations when navigating through the stack, pretty nifty.

![Styled Navigation](assets/1-unauthenticated-nav.jpg =300x*)

## Pushing to a new stack

Pushing a new screen onto the stack is a common practice on mobile apps, however requires a slightly different mindset if you're from a web development
background. The basics of a stack allow you to `push` and `pop` where screens effectively overlay each other. The user cannot change stack item
unless you give them the ability to (compared to a website where the user could manually enter a different URL). This allows for greater
control over what a user is able to push/pop to.

Each component we assign to our `StackNavigator` gets cloned by `react-navigation` with a prop called `navigation` which gives us full control over
all of the navigation functionality we'll need.

- To "push" to a new screen we call the `navigate` method with the screen name we defined as the object key within `StackNavigator`.
- To "pop", or go back to the previous screen on the stack we call the `goBack` method.

Lets add a simple button to push to the `Register` screen we defined:

```jsx
// src/screens/unauthenticated/Login.js
import React, { Component } from 'react';
import { View, Button } from 'react-native';

class Login extends Component {

  static navigationOptions = {
    title: 'Login',
    headerStyle: {
      backgroundColor: '#E6853E',
    },
    headerTintColor: '#fff',
  };

  // Call this method on the button press
  _register = () => {
    this.props.navigation.navigate('Register');
  };

  render() {
    return (
      <View>
        <Button
          onPress={this._register}
          title="Register Now!"
        />
      </View>
    );
  }
}

export default Login;
```

Go ahead and click the button, you'll be pushed to a new screen. By pressing the back arrow on the header, `react-navigation` will automatically
call the `goBack` method for us:

![Transition!](assets/3-unauthenticated-push-pop.gif =300x*)

> To style the `Register` page, simply add it's own `navigationOptions` static config!

