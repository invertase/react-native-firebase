# Usage with Redux

Although RNFirebase usage requires a React Native environment, it isn't tightly coupled which allows for full flexibility
when it comes to integrating with other modules such a [`react-redux`](https://github.com/reactjs/react-redux).

## React Redux Firebase

[`react-redux-firebase`](http://docs.react-redux-firebase.com/history/v2.0.0) provides simplified and standardized common redux/firebase logic.

To add `react-redux-firebase` to your project:
1. Run `npm i --save react-redux-firebase@canary` *we point to canary here to get current progress with v2.0.0*
1. Pass `react-native-firebase` instance into `reactReduxFirebase` when creating store:

  ```js
  import { applyMiddleware, compose, createStore } from 'redux';
  import { getFirebase } from 'react-redux-firebase'
  import RNFirebase from 'react-native-firebase';

  const reactNativeFirebaseConfig = {
    debug: true
  };

  const firebase = RNFirebase.initializeApp(reactNativeFirebaseConfig);

  // for more config options, visit http://docs.react-redux-firebase.com/history/v2.0.0/docs/api/compose.html
  const reduxFirebaseConfig = {
    userProfile: 'users', // save users profiles to 'users' collection
  }

  const middleware = [
    thunk.withExtraArgument({ getFirebase }),
    // place other middleware here
  ];

  const store = createStore(
    reducer,
    {}, // initial state
    compose(
     reactReduxFirebase(firebase, reduxConfig), // pass in react-native-firebase instance instead of config
     applyMiddleware(...middleware)
    )
  )
  ```
1. Then in your components you can use `firebaseConnect` to gather data from Firebase and place it into redux:

  ```js
  import { isLoaded } from 'react-redux-firebase'
  import { compose } from 'redux';
  const Todos = ({ todos }) => {
    if (!isLoaded(todos)) {
      return <div>Loading...</div>
    }
    if (isEmpty(todos)) {
      return <div>No Todos Found</div>
    }
    return (
      <div>
        Object.keys(todos).map((key, id) => (
          <div>
            {todos[key].text}
            Complete: {todos[key].isComplete}
          </div>
        ))
      </div>
    )
  }

  compose(
    firebaseConnect([
      { path: 'todos' }
    ]),
    connect(({ firebase: { data: { todos } } }) => {
      todos
    })
  )(Todos)
  ```

Notice how `connect` is still used to get data out of `redux` since `firebaseConnect` only loads data **into** redux.

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
