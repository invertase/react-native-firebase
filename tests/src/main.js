import React, { Component } from 'react';
import { Provider } from 'react-redux';
import CoreContainer from './containers/CoreContainer';
import setupStore from './store/setup';
import { setupSuites } from './tests/index';

global.Promise = require('bluebird');

console.ignoredYellowBox = ['Setting a timer for a long period of time, i.e. multiple minutes'];

type State = {
  loading: boolean,
  store: any,
};

function bootstrap() {
  // Remove logging on production
  if (!__DEV__) {
    console.log = () => {
    };
    console.warn = () => {
    };
    console.error = () => {
    };
    console.disableYellowBox = true;
  }

  class Root extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        store: null,
      };
    }

    state: State;

    componentDidMount() {
      setupStore((store) => {
        setupSuites(store);
        this.setState({
          store,
          loading: false,
        });
      });
    }

    render() {
      if (this.state.loading) {
        return null;
      }

      return (
        <Provider store={this.state.store}>
          <CoreContainer />
        </Provider>
      );
    }
  }

  return Root;
}

export default bootstrap();
