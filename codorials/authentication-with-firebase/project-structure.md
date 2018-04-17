# Project Structure

Although it may seem trivial, having a good initial project structure ensures your code will be clean and reusable.
 The following step gives an opinionated guide to how this might look, which will work across both Android & iOS.

## Entry file

Every fresh React Native project a key file, an `index.js`, which currently renders a simple React component
with basic styling. Rather than keeping our business logic within this file, we're going to keep it contained in it's own
directory.

We'll achieve this by creating a `src` directory where our own code for the app will live. Create the directory with an `index.js` file, so your
project structure resembles the following:

```
 - node_modules/
 - android/
 - ios/
 - src/
 -- index.js
 - index.js
```

Now we can reference our bootstrap file in the `index.js` file, so both our platform share the same entry point:

```js
// index.js

import { AppRegistry } from 'react-native';
import bootstrap from './src';

AppRegistry.registerComponent('RNFirebaseStarter', () => bootstrap());
```

## Bootstrapping your project

You may have noticed before, but the `bootstrap` import is a function. This allows us to setup or initialize any external modules before our
React based application kick starts (such as [react-native-i18n](https://github.com/AlexanderZaytsev/react-native-i18n)).

Lets go ahead and setup our bootstrap file:

```js
// src/index.js

import React, { Component } from 'react';
import { View, Text } from 'react-native';

function bootstrap() {

  // Init any external libraries here!

  return class extends Component {

    render() {
      return (
        <View>
          <Text>
            Bootstrapped!
          </Text>
        </View>
      );
    }
  }
}

export default bootstrap;
```

Although this function simply returns a basic React component, later we'll be able to see the power of having a bootstrap file which
consumes our entire application.

Go ahead and boot up your app onto your emulator. You should simply be presented with a plain screen with the words "Bootstrapped!".

![Bootstrapped!](assets/app-bootstrapped.jpg =300x*)

Although a good starting point, we want to separate we'll our business logic out of the bootstrap file, keeping it purely for app
initialization purposes. This can simply be done by creating a basic React component called `App.js`, which will also live in the `src` directory;

```js
// src/App.js

import React, { Component } from 'react';
import { View, Text } from 'react-native';

class App extends Component {

    render() {
      return (
        <View>
          <Text>
            Bootstrapped!
          </Text>
        </View>
      );
    }

}

export default App;
```

Now we can reference this component within our bootstrap setup and return it from the bootstrap component:

```js
// src/index.js

import React, { Component } from 'react';
import App from './App';

function bootstrap() {

  // Init any external libraries here!

  return class extends Component {

    render() {
      return (
        <App />
      );
    }
  }
}

export default bootstrap;
```
