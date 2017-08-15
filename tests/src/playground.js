import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      bgColor: '#cb2600',
    };
  }

  clickMe = () => {
    if (this.state.bgColor === '#a8139f') {
      this.setState({ bgColor: '#cb2600' });
    } else {
      this.setState({ bgColor: '#a8139f' });
    }
  };

  render() {
    return (
      <View style={{ backgroundColor: this.state.bgColor }}>
        <Text style={{ color: '#fff' }}>Hello</Text>
        <Text style={{ color: '#22ff31' }}>World</Text>
        <Button title="Change to pink" onPress={this.clickMe} />
      </View>
    );
  }
}
