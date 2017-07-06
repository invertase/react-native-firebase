import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import firebase from './lib/firebase';

export default class App extends React.Component {
  render () {
    return (
      <View
        style={styles.container}
      >
        <Text>
          Successfully imported and running react-native-firebase.
        </Text>
        <Text>
          Running app: {firebase.apps}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
