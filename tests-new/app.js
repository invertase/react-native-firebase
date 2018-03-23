/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import rnModule, { AppRegistry, Text, View } from 'react-native';

import testModule from './firebase';

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (global.__initializeEnvironment) {
      console.log('Initializing environment...');
      global.__initializeEnvironment({
        root: this,
        rnModule,
        testModule,
      });
    }
  }

  render() {
    return (
      <View>
        <Text>React Native Firebase Test App</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('testing', () => Root);
