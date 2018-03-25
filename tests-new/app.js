/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

// must import before all else

import React, { Component } from 'react';
import { AppRegistry, Text, View } from 'react-native';

import bridge from './bridge/env/rn';
import firebase from './firebase';

require('sinon');
require('should-sinon');
require('should');

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };

    bridge.setBridgeProperty('root', this);
    bridge.setBridgeProperty('module', firebase);
  }

  render() {
    return (
      <View>
        <Text testID="messageText">{this.state.message}</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('testing', () => Root);
