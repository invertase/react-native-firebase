/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

// must import before all else

import React, { Component } from 'react';
import { AppRegistry, Text, View } from 'react-native';

import bridge from 'bridge/platform/react-native';
import firebase from 'react-native-firebase';

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
    bridge.setBridgeProperty('require', require);
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
