# Integrating Redux

Redux has become somewhat of a buzz word in the React community, and is generally used in most projects without thought. This Codorial
won't go into details on what it is as their own [documentation](https://redux.js.org/introduction/motivation) does a wonderful job at explaining
what it's for and why to use it.

_TLDR;_ Redux provides your app with a single "state" (data), which can be accessed by any component. You can subscribe to this data to cause
a component update whenever something changes, even if it's deeply nested.

Although the end product of this Codorial certainly doesn't require Redux to function, as your app grows in complexity Redux becomes more and
more important to manage your data.

## Installing Redux

Lets go ahead by installing the core Redux library and the React bindings:

```bash
npm install --save redux react-redux
```

Now within our projects `src` directory, create a `store.js` file. This file will contain all of our Redux logic, however you may want to break
this out into multiple directories as your projects grows in complexity.

```js
// src/store.js
import { createStore } from 'redux';

// Create a reducer with empty state (see below for explanation)
function reducer(state = {}, action) {
  return state;
}

export default createStore(reducer);
```

By default state is `null`, however we're setting it to an empty `object` (`state = {}`) so we can attempt to access
shallow nested properties even if they don't exist.

> You may want to consider installing the [redux-logger](https://github.com/evgenyrodionov/redux-logger) library to improve
> your Redux experience.

### Reducer

A reducer is a simple JavaScript function which takes two arguments: `state` & `action`. The idea of a reducer is to take "some data" from an `action`
and return new state.

* `state` is any sort of data, which cannot be altered (immutable). A reducer must return a new value each time. More on this later.
* `action` is an object containing a `type`, and any unreduced data. More on this later.

## Integrating Redux into the app

Our Redux store is now ready to be used. `react-redux` provides us with a `Provider` component which "provides" any children
with access to the store via [context](https://reactjs.org/docs/context.html). Luckily we don't need to worry about this too much as the library
takes care of the hard work!

Back within our original bootstrap file, we'll wrap the `App` component in the `Provider` component, so our business logic has access to Redux.

```jsx
// src/index.js

import React, { Component } from 'react';
import { Provider } from 'react-redux'; // Import the Provider component

import App from './App';
import store from './store';

function bootstrap() {
  // Init any external libraries here!

  return class extends Component {
    render() {
      return (
        <Provider store={store}>
          <App />
        </Provider>
      );
    }
  };
}

export default bootstrap;
```

Although noting will visually change, our app now has access to the power of Redux!
