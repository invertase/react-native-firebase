/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

// must import before all else
import Bridge from './bridge/env/rn';

import React, { Component } from 'react';
import { AppRegistry, Text, View } from 'react-native';

import firebase from './firebase';

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    Bridge.provideRoot(this);
    Bridge.provideModule(firebase);
  }

  render() {
    return (
      <View>
        <Text testID="tap">React Native Firebase Test App</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('testing', () => Root);
