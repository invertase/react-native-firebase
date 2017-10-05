# Usage with Redux

Although RNFirebase usage requires a React Native environment, it isn't tightly coupled which allows for full flexibility
when it comes to integrating with other modules such a [`react-redux`](https://github.com/reactjs/react-redux).

## Standalone Integration

Although the following example works for a basic redux setup, it may differ when integrating with other redux middleware.
Imagine a simple TODO app, with redux we're able to abstract the Firebase logic out of components which allows for greater
testability and maintainability.

?> We use [`redux-thunk`](https://github.com/gaearon/redux-thunk) to provide async actions.

### Action Creators

```js
// Actions
export const subscribe = () => {
  return (dispatch) => {
    firebase.database().ref('todos').on('value', (snapshot) => {
      const todos = [];

      snapshot.forEach((childSnapshot) => {
        todos.push({
          id: childSnapshot.key,
          ...(childSnapshot.val()),
        })
      })

      dispatch({
        type: 'TODO_UPDATE',
        todos,
      })
    })
  }
}

// Methods
export const addTodo = text => {
  firebase.database().ref('todos').push({
    text,
    visible: true,
  })
}

export const completeTodo = id => {
  firebase.database().ref(`todos/${id}`).update({
    visible: false,
  })
}

```

Instead of creating multiple actions which the reducers handle, we instead subscribe to the database ref and on any changes,
send a single action for the reducers to handle with the data which is constantly updating.

### Reducers

Our reducer now becomes really simple, as we're able to simply update the reducers state with whatever data has been returned
from our Firebase subscription.

```js
const todos = (state = {}, action) => {
  switch (action.type) {
    case 'TODO_UPDATE':
      return { ...action.todos };
  }

  return state;
}

export default todos;
```

### Component

We can now easily subscribe to the todos in redux state and get live updates when Firebase updates.

```js
import React from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';
import { subscribe, addTodo, completeTodo } from '../actions/TodoActions.js';
...

class Todos extends React.Component {

  componentDidMount() {
    this.props.dispatch(
      subscribe()
    );
  }

  onComplete = (id) => {
    this.props.dispatch(
      completeTodo(id)
    );
  };

  onAdd = (text) => {
    this.props.dispatch(
      addTodo(text)
    );
  };

  render() {
    return (
      <FlatList
        data={this.props.todos}
        ...
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    todos: state.todos,
  };
}

export default connect(mapStateToProps)(Todos);
```


## React Redux Firebase

[`react-redux-firebase`](http://docs.react-redux-firebase.com/history/v2.0.0) provides simplified and standardized common redux/firebase logic.

To add `react-redux-firebase` to your project:
1. Make sure you already have `redux`, `react-redux`, `redux-thunk` installed (if not, run `npm i --save redux react-redux redux-thunk`)
1. Run `npm i --save react-redux-firebase@canary` *we point to canary here to get current progress with v2.0.0*
1. Add `firebaseStateReducer` under `firebase` key within reducer:

  **reducers.js**
  ```js
  import { combineReducers } from 'redux';
  import { firebaseStateReducer } from 'react-redux-firebase';

  export const makeRootReducer = (asyncReducers) => {
    return combineReducers({
      // Add sync reducers here
      firebase: firebaseStateReducer,
      ...asyncReducers
    });
  };

  export default makeRootReducer;

  // *Optional* Useful for injecting reducers as part of async routes
  export const injectReducer = (store, { key, reducer }) => {
    store.asyncReducers[key] = reducer
    store.replaceReducer(makeRootReducer(store.asyncReducers))
  };
  ```
1. Pass `react-native-firebase` App instance into `reactReduxFirebase` when creating store:

  **createStore.js**
  ```js
  import { applyMiddleware, compose, createStore } from 'redux';
  import RNFirebase from 'react-native-firebase';
  import { getFirebase, reactReduxFirebase } from 'react-redux-firebase';
  import thunk from 'redux-thunk';
  import makeRootReducer from './reducers';

  const reactNativeFirebaseConfig = {
    debug: true
  };
  // for more config options, visit http://docs.react-redux-firebase.com/history/v2.0.0/docs/api/compose.html
  const reduxFirebaseConfig = {
    userProfile: 'users', // save users profiles to 'users' collection
  };

  export default (initialState = { firebase: {} }) => {
    // initialize firebase
    const firebase = RNFirebase.initializeApp(reactNativeFirebaseConfig);

    const store = createStore(
      makeRootReducer(),
      initialState,
      compose(
       reactReduxFirebase(firebase, reduxFirebaseConfig), // pass initialized react-native-firebase app instance
        // applyMiddleware(...middleware) // if using middleware
      )
    );
    return store;
  };
  ```

1. Wrap in `Provider` from `react-redux`:

  **index.js**
  ```js
  import React from 'react';
  import { Provider } from 'react-redux';
  import createStore from './createStore';
  import Home from './Home';

  // Store Initialization
  const initialState = { firebase: {} };
  let store = createStore(initialState);

  const Main = () => (
    <Provider store={store}>
      <Home />
    </Provider>
  );

  export default Main;
  ```

1. Then you can use the `firebaseConnect` HOC to wrap your components. It makes it easy to set listeners which gather data from Firebase and place it into redux:

  **Home.js**
  ```js
  import React from 'react';
  import { compose } from 'redux';
  import { connect } from 'react-redux';
  import { isLoaded, isEmpty, firebaseConnect } from 'react-redux-firebase';
  import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
  import NewTodo from './NewTodo';
  import Todos from './Todos';

  class Home extends React.Component {
    state = {
      text: null
    }

    completeTodo = (key, todo) => {
      return this.props.firebase.update(`todos/${key}`, { done: !todo.done })
    }

    addTodo = () => {
      const { text } = this.state;
      return this.props.firebase.push('todos', { text, completed: false });
    }

    render() {
      const { todos } = this.props;

      return (
        <View>
          <Text>Todos</Text>
          <NewTodo
            onNewTouch={this.addTodo}
            newValue={this.state.text}
            onInputChange={(v) => this.setState({text: v})}
          />
          {
            !isLoaded(todos)
              ? <ActivityIndicator size="large" style={{ marginTop: 100 }}/>
              : null
          }
          {
            isLoaded(todos) && !isEmpty(todos)
              ?
                <Todos
                  todos={todos}
                  onItemTouch={this.completeTodo}
                />
              :
                <View style={styles.container}>
                  <Text>No Todos Found</Text>
                </View>
          }
        </View>
      );
    }
  }

  export default compose(
    firebaseConnect([
       // create listener for firebase data -> redux
      { path: 'todos', queryParams: ['limitToLast=15'] }
    ]),
    connect((state) => ({
      // todos: state.firebase.data.todos, // todos data object from redux -> props.todos
      todos: state.firebase.ordered.todos, // todos ordered array from redux -> props.todos
    }))
  )(Home);
  ```

  **Todos.js**
  ```js
  import React from 'react'
  import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableHighlight
  } from 'react-native';

  const Todos = ({ todos, onItemTouch }) => (
    <FlatList
      data={todos.reverse()}
      renderItem={({ item: { key, value } }) => (
        <TouchableHighlight onPress={() => onItemTouch(key, value)}>
          <View>
            <Text>{value.text}</Text>
            <Text>Done: {value.done === true ? 'True' : 'False'}</Text>
          </View>
        </TouchableHighlight>
      )}
    />
  )

  export default Todos;
  ```
  Notice how `connect` is still used to get data out of `redux` since `firebaseConnect` only loads data **into** redux.

Full source with styling available [in the react-native-firebase example for react-redux-firebase](https://github.com/prescottprue/react-redux-firebase/tree/v2.0.0/examples/complete/react-native-firebase)

For more details, please visit [`react-redux-firebase`'s react-native section](http://docs.react-redux-firebase.com/history/v2.0.0/docs/recipes/react-native.html#native-modules).

#### Thunks
`react-redux-firebase` provides the `getFirebase` helper for easy access to Firebase helper methods. Using this feature is as easy as passing it in while creating your store:

  ```js
  const middleware = [
     // make getFirebase available in third argument of thunks
    thunk.withExtraArgument({ getFirebase }),
  ];

  const store = createStore(
    makeRootReducer(),
    initialState,
    compose(
     reactReduxFirebase(firebase, reduxFirebaseConfig),
     applyMiddleware(...middleware) // pass in middleware
    )
  );
  ```

