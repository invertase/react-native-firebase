import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { View } from 'react-native';
import fb from './firebase';
const firebase = fb.native;
const Banner = firebase.admob.Banner;
const NativeExpress = firebase.admob.NativeExpress;

import CoreContainer from './containers/CoreContainer';
import setupStore from './store/setup';
import { setupSuites } from './tests/index';

global.Promise = require('bluebird');

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
        <View>
          <NativeExpress size="320x250" onAdLoaded={(props) => {
            console.log('ad', props)
          }} />
        </View>
      );

      // return <Banner style={{ width: 100, height: 100, backgroundColor: 'pink'}} />;
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
