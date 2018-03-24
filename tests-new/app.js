/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

require('sinon');
require('should-sinon');
require('should');

// must import before all else
import Bridge from './bridge/env/rn';

import React, { Component } from 'react';
import { AppRegistry, Text, View } from 'react-native';

import firebase from './firebase';

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: 'React Native Firebase Test App',
    };
    Bridge.provideRoot(this);
    Bridge.provideModule(firebase);
  }

  render() {
    return (
      <View>
        <Text testID="tap">{this.state.message}</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('testing', () => Root);
