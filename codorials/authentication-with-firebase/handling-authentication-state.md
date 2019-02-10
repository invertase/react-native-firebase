# Handling Authentication State

Now we've got a basic navigation stack in place along with Redux, we can combine the two together to handle the users authenticated state.

## Listen for authentication state changes

As mentioned in "Understanding Firebase Auth", we can listen for auth state changes via `onAuthStateChanged`. As our app will require authentication
to view the main content, we can conditionally render the 'unauthenticated' `StackNavigator` if the user is signed out in our `src/App.js`. Lets go
ahead and add the boilerplate code to get this in motion:

```jsx
// src/App.js

import React, { Component } from 'react';
import firebase from 'react-native-firebase';

import UnauthenticatedStack from './screens/unauthenticated';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    // Listen for user auth state changes
    firebase.auth().onAuthStateChanged(user => {
      this.setState({
        loading: false,
      });
    });
  }

  render() {
    // Render a blank screen whilst we wait for Firebase.
    // The listener generally trigger immediately so it will be too fast for the user to see
    if (this.state.loading) {
      return null;
    }

    return <UnauthenticatedStack />;
  }
}

export default App;
```

## Updating Redux with the user state

Rather than passing our `user` into component `state`, we're going to add it into into Redux instead. Firebase does provide direct access to the user
via `firebase.auth().currentUser`, however as our app complexity grows we may want to integrate parts of the users data (for example the `uid`) into
other parts of our Redux store. By storing the user in Redux, it is guaranteed that the user details will keep in-sync throughout our Redux store.

### Dispatching Actions

Another common Redux concept is called 'Dispatching Actions'. An action is an event with a unique name, which our reducer can listen out for and react
to the action. Every action requires a `type` property and can pass any additional data along which the reducer needs to handle the action. Lets go ahead
and create an `actions.js` file, where we'll define our first action:

```js
// src/actions.js

// define our action type as a exportable constant
export const USER_STATE_CHANGED = 'USER_STATE_CHANGED';

// define our action function
export function userStateChanged(user) {
  return {
    type: USER_STATE_CHANGED, // required
    user: user ? user.toJSON() : null, // the response from Firebase: if a user exists, pass the serialized data down, else send a null value.
  };
}
```

To dispatch this action we need to again make use of `react-redux`. As our `App.js` has been provided the Redux store via the `Provider`
component within `index.js`, we can use a [higher order component (HOC)](https://reactjs.org/docs/higher-order-components.html) called `connect` to provide the component with access to Redux:

```jsx
// src/App.js

import { connect } from 'react-redux';

...

export default connect()(App);
```

The `connect` HOC clones the given component with a function prop called `dispatch`. The `dispatch` function then takes an action, which when called 'dispatches'
it to Redux. Lets jump back into our `App.js` and dispatch our action when `onAuthStateChanged` is triggered:

```jsx
// src/App.js

// import our userStateChanged action
import { userStateChanged } from './actions';

...

    componentDidMount() {
      firebase.auth().onAuthStateChanged((user) => {

        // dispatch the imported action using the dispatch prop:
        this.props.dispatch(userStateChanged(user));

        this.setState({
          loading: false,
        });
      });
    }
```

> You may want to consider implementing [`mapDispatchToProps`](https://github.com/reactjs/react-redux/blob/master/docs/api.md) to keep the action
> usage reusable & cleaner.

Now every time `onAuthStateChanged` is triggered by Firebase, our Redux action will be dispatched regardless of whether a user is signed in our out!

### Reducing state

Back on step 'Integrating Redux' we setup a very basic Redux store. In order for us to latch onto the dispatched action we need to listen out
for the events being sent to the reducer. To do this we import the action type which we exported within `actions.js` and conditionally
return new state when that action is dispatched:

```jsx
// src/store.js

import { createStore } from 'redux';

// import the action type
import { USER_STATE_CHANGED } from './actions';

function reducer(state = {}, action) {
  // When USER_STATE_CHANGED is dispatched, update the store with new state
  if (action.type === USER_STATE_CHANGED) {
    return {
      user: action.user,
    };
  }

  return state;
}

export default createStore(reducer);
```

You may notice here that we return a brand new object rather than modifying the existing state. This is because Redux state is
[immutable](https://facebook.github.io/immutable-js/). In order for Redux to know whether state has actually changed, it needs to compare the
previous state with a new one.

> As your Redux state grows in complexity, it may be worth breaking your store out into multiple reducers. This can easily be achieved using
> [combineReducers](https://redux.js.org/api-reference/combinereducers) from the `redux` package.

### Subscribing to Redux state

Now our action is updating the store whenever it's dispatched, we can subscribe to specific parts of the data which we need in our React
components. The power of using `react-redux` is that it allows us to subscribe to data within our store and update the component whenever that
data changes - we do this via a function known as `mapStateToProps`. This function is passed as the first argument of our `connect` HOC and gets
given the current Redux state. It returns an object, which is cloned as props into our component. Here's how it works:

```js
function mapStateToProps(state) {
  return {
    isUserAuthenticated: !!state.user,
  };
}

export default connect(mapStateToProps)(App);
```

With this code, our `App` component will receive a prop called `isUserAuthenticated`, which in our case will be a `true` or `false` value based on
whether the `state.user` object exists or not. Every time Redux state changes, this logic is run. What's handy is that if the result of any
prop has changed, the component will be updated with the new data. If none of the props-to-be have changed, the component doesn't update.

> Keep in mind that if you return a complex `Array` or `object`, `react-redux` will only shallow compare them. Even if your state does not change
> the component will still be re-rendered with the same data which can cause performance issues in our app if not handled. Therefore it is wise
> to break components out to only subscribe to specific parts of primitive state (such as `strings`, `booleans` etc).

As our `App` component contains our routes, any change in the `isUserAuthenticated` value will cause the entire app to re-render - which in this case
is fine as we're conditionally changing navigation stacks. Lets implement that logic:

```jsx
// src/App.js

import React, { Component } from 'react';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';

import UnauthenticatedStack from './screens/unauthenticated';
import AuthenticatedStack from './screens/authenticated';
import { userStateChanged } from './actions';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.props.dispatch(userStateChanged(user));

      this.setState({
        loading: false,
      });
    });
  }

  render() {
    // Render a blank screen whilst we wait for Firebase.
    // The listener generally trigger immediately so it will be too fast for the user to see
    if (this.state.loading) {
      return null;
    }

    if (!this.props.isUserAuthenticated) {
      return <UnauthenticatedStack />;
    }

    return <AuthenticatedStack />;
  }
}

function mapStateToProps(state) {
  return {
    isUserAuthenticated: !!state.user,
  };
}

export default connect(mapStateToProps)(App);
```

As you can see in our `render` method, if the `isUserAuthenticated` value is `false`, we render our `UnauthenticatedStack`. If it's `true` we can
render a new stack, in this case called `AuthenticatedStack` which is waiting for you to setup!
