import React, { Component } from 'react';
import { View, Button, Text } from 'react-native';
import sinon from 'sinon';
import 'should-sinon';
import Promise from 'bluebird';

import firebase from './firebase';
import DatabaseContents from './tests/support/DatabaseContents';


export default class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      timeTaken: '',
    };
  }

  clickMe = () => {
    this.setState({ timeTaken: 'Running...' });
    let start = null;
    Promise.all([
      firebase.native.database().ref('tests/types').set(DatabaseContents.DEFAULT),
      firebase.native.database().ref('tests/priority').setWithPriority({
        foo: 'bar',
      }, 666),
      firebase.native.database().ref('tests/query').set(DatabaseContents.QUERY),
    ]).then(() => {
      start = Date.now();
      return Promise.each(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
        // Setup
        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);
        const currentDataValue = DatabaseContents.DEFAULT[dataRef];

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callbackA(snapshot.val());
            resolve();
          });
        });

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callbackB(snapshot.val());
            resolve();
          });
        });

        callbackA.should.be.calledWith(currentDataValue);
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(currentDataValue);
        callbackB.should.be.calledOnce();

        const newDataValue = DatabaseContents.NEW[dataRef];
        await ref.set(newDataValue);

        await new Promise((resolve) => {
          setTimeout(() => resolve(), 5);
        });

        callbackA.should.be.calledWith(newDataValue);
        callbackB.should.be.calledWith(newDataValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledTwice();

        // Tear down

        ref.off('value');
        return Promise.resolve();
      });
    }).then(() => {
      this.setState({ timeTaken: `Took ${Date.now() - start}` });
    }).catch(console.error);
  };

  render() {
    return (
      <View style={{ marginTop: 15, backgroundColor: '#000' }}>
        <Button title="Run Test" onPress={this.clickMe} />
        <Text style={{ color: '#fff' }}>{this.state.timeTaken || ''}</Text>
      </View>
    );
  }
}
