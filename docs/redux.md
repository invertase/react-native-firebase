# Usage with Redux

Although RNFirebase usage requires a React Native environment, it isn't tightly coupled which allows for full flexibility
when it comes to integrating with other modules such a [`react-redux`](https://github.com/reactjs/react-redux).

## React Redux Firebase

[`react-redux-firebase`](http://docs.react-redux-firebase.com/history/v2.0.0) provides simplified and standardized common redux/firebase logic.

To add `react-redux-firebase` to your project:
1. Run `npm i --save react-redux-firebase@canary` *we point to canary here to get current progress with v2.0.0*
1. Pass `react-native-firebase` instance into `reactReduxFirebase` when creating store:
  **reducers.js**
  ```js
  import { combineReducers } from 'redux'
  import { firebaseStateReducer } from 'react-redux-firebase'

  export const makeRootReducer = (asyncReducers) => {
    return combineReducers({
      // Add sync reducers here
      firebase: firebaseStateReducer,
      ...asyncReducers
    })
  }

  export default makeRootReducer

  // Useful for injecting reducers as part of async routes
  export const injectReducer = (store, { key, reducer }) => {
    store.asyncReducers[key] = reducer
    store.replaceReducer(makeRootReducer(store.asyncReducers))
  }
  ```

  **createStore.js**
  ```js
  import { applyMiddleware, compose, createStore } from 'redux';
  import { getFirebase, reactReduxFirebase } from 'react-redux-firebase';
  import RNFirebase from 'react-native-firebase';
  import makeRootReducer from './reducers';

  const reactNativeFirebaseConfig = {
    debug: true
  };
  // for more config options, visit http://docs.react-redux-firebase.com/history/v2.0.0/docs/api/compose.html
  const reduxFirebaseConfig = {
    userProfile: 'users', // save users profiles to 'users' collection
  };

  export default (initialState = {}) => {
    // initialize firebase
    const firebase = RNFirebase.initializeApp(reactNativeFirebaseConfig);

    const middleware = [
       // make getFirebase available in third argument of thunks
      thunk.withExtraArgument({ getFirebase }),
    ];

    const store = createStore(
      makeRootReducer(),
      initialState, // initial state
      compose(
       reactReduxFirebase(firebase, reduxConfig), // pass initialized react-native-firebase app instance
       applyMiddleware(...middleware)
      )
    )
  }
  ```
  **index.js**
  ```js
  import React from 'react';
  import { Provider } from 'react-redux';
  import createStore from './createStore';
  import Todos from './Todos';

  // Store Initialization
  const initialState = { firebase: {} };
  const store = createStore(initialState);

  export default const Main = () => (
    <Provider store={store}>
      <Todos />
    </Provider>
  );
  ```

1. Then in your components you can use `firebaseConnect` to gather data from Firebase and place it into redux:

  **Todos.js**
  ```js
  import { compose } from 'redux';
  import { View, Text, StyleSheet } from 'react-native'
  import { isLoaded, isEmpty } from 'react-redux-firebase';
  import MessageView from './MessageView';

  const testTodo = { text: 'Build Things', isComplete: false }

  const Todos = ({ todos, firebase }) => {
    if (!isLoaded(todos)) {
      return <MessageView message="Loading..." />
    }
    if (isEmpty(todos)) {
      return (
        <MessageView
          message="No Todos Found"
          onNewTouch={() => firebase.push('todos', testTodo)}
          showNew
        />
      )
    }
    return (
      <View>
        <Text>Todos</Text>
        {
          Object.keys(todos).map((key, id) => (
            <View key={key}>
              <Text>{todos[key].text}</Text>
              <Text>Complete: {todos[key].isComplete}</Text>
            </View>
          ))
        }
      </View>
    )
  };

  export default compose(
    firebaseConnect([
      { path: 'todos' } // create listener for firebase data -> redux
    ]),
    connect((state) => {
      todos: state.firebase.data.todos, // todos data from redux -> props.todos
    })
  )(Todos)
  ```
  Notice how `connect` is still used to get data out of `redux` since `firebaseConnect` only loads data **into** redux.

  **MessageView.js**
  ```js
  import { View, Text, StyleSheet } from 'react-native'

  const MessageView = ({ message, showNew = null, onNewTouch }) => (
    <View style={styles.container}>
      <Text>{message}</Text>
      {
        showNew &&
          <TouchableOpacity style={styles.button} onPress={onNewTouch}>
            <Text>Save</Text>
          </TouchableOpacity>
      }
    </View>
  );

  export default MessageView;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    button: {
      height: 100,
      marginTop: 10
    }
  });
  ```

For more details, please visit [`react-redux-firebase`'s react-native section](http://docs.react-redux-firebase.com/history/v2.0.0/docs/recipes/react-native.html#native-modules).

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
