import { AsyncStorage } from 'react-native';
import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import reduxLogger from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';

import whitelist from './whitelist';
import reducers from '../reducers';

function setup(done) {
  const isDev = global.isDebuggingInChrome || __DEV__;

  const logger = reduxLogger({
    predicate: () => false,
    collapsed: true,
    duration: true,
  });

  // AsyncStorage.clear();

  // Setup redux middleware
  const middlewares = [autoRehydrate()];

  middlewares.push(applyMiddleware(...[thunk]));

  if (isDev) {
    // middlewares.push(applyMiddleware(...[logger]));
    middlewares.push(applyMiddleware(require('redux-immutable-state-invariant')()));
  }

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(reducers, {}, composeEnhancers(...middlewares));

  // Attach the store to the Chrome debug window
  if (global.isDebuggingInChrome) {
    window.store = store;
  }

  persistStore(store, { whitelist, storage: AsyncStorage }, () => done(store));
}

export default setup;
