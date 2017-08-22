import React, { Component } from 'react';
import { View, Button, Text, TextInput, Image } from 'react-native';
import fb from './firebase';
const firebase = fb.native;

const successImageUri = 'https://cdn.pixabay.com/photo/2015/06/09/16/12/icon-803718_1280.png';

export default class PhoneAuthTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      message: '',
      codeInput: '',
      phoneNumber: '+447445255177',
      confirmResult: null,
    };
  }

  signIn = () => {
    const { phoneNumber } = this.state;
    this.setState({ message: 'Sending code ...' });
    firebase.auth()
      .signInWithPhoneNumber(phoneNumber)
      .onCodeSent(confirmResult => this.setState({ confirmResult, message: 'Code has been sent!' }))
      .then(user => this.setState({ user: user.toJSON() }))
      .catch(console.error);
  };

  confirmCode = () => {
    const { codeInput, confirmResult } = this.state;

    if (confirmResult && codeInput.length) {
      confirmResult.confirm(codeInput)
        .then(() => this.setState({ message: 'Code Confirmed!' }))
        .catch(error => this.setState({ message: `Code Confirm Error: ${error.message}` }));
    }
  };

  render() {
    const { message, user, codeInput, confirmResult, phoneNumber } = this.state;
    return (
      <View style={{ flex: 1 }}>
        {!user && !confirmResult ? (
          <View style={{ padding: 25 }}>
            <Text>Enter phone number:</Text>
            <TextInput
              autoFocus
              style={{ height: 40, marginTop: 15, marginBottom: 15 }}
              onChangeText={value => this.setState({ phoneNumber: value })}
              placeholder={'Phone number ... '}
              value={phoneNumber}
            />
            <Button title="Sign In" color="green" onPress={this.signIn} />
          </View>
        ) : null}
        {message.length ? (
          <Text style={{ padding: 5, backgroundColor: '#000', color: '#fff' }}>{message}</Text>) : null}
        {!user && confirmResult ? (
          <View style={{ marginTop: 25, padding: 25 }}>
            <Text>Enter verification code below:</Text>
            <TextInput
              autoFocus
              style={{ height: 40, marginTop: 15, marginBottom: 15 }}
              onChangeText={value => this.setState({ codeInput: value })}
              placeholder={'Code ... '}
              value={codeInput}
            />
            <Button title="Confirm Code" color="#841584" onPress={this.confirmCode} />
          </View>
        ) : null}
        { user ? (
          <View
            style={{
              padding: 15,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#77dd77',
              flex: 1,
            }}
          >
            <Image source={{ uri: successImageUri }} style={{ width: 100, height: 100, marginBottom: 25 }} />
            <Text style={{ fontSize: 25 }}>Signed In!</Text>
            <Text>{JSON.stringify(user)}</Text>
          </View>
        ) : null}
      </View>
    );
  }
}


// export default class HomeScreen extends Component {
//
//   constructor(props) {
//     super(props);
//     firebase.native.analytics();
//     this.state = {
//       timeTaken: '',
//     };
//   }
//
//   clickMe = () => {
//     this.setState({ timeTaken: 'Running...' });
//     let start = null;
//     Promise.all([
//       firebase.native.database().ref('tests/types').set(DatabaseContents.DEFAULT),
//       firebase.native.database().ref('tests/priority').setWithPriority({
//         foo: 'bar',
//       }, 666),
//       firebase.native.database().ref('tests/query').set(DatabaseContents.QUERY),
//     ]).then(() => {
//       start = Date.now();
//       return Promise.each(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
//         // Setup
//         const ref = firebase.native.database().ref(`tests/types/${dataRef}`);
//         const currentDataValue = DatabaseContents.DEFAULT[dataRef];
//
//         const callbackA = sinon.spy();
//         const callbackB = sinon.spy();
//
//         // Test
//
//         await new Promise((resolve) => {
//           ref.on('value', (snapshot) => {
//             callbackA(snapshot.val());
//             resolve();
//           });
//         });
//
//         await new Promise((resolve) => {
//           ref.on('value', (snapshot) => {
//             callbackB(snapshot.val());
//             resolve();
//           });
//         });
//
//         callbackA.should.be.calledWith(currentDataValue);
//         callbackA.should.be.calledOnce();
//
//         callbackB.should.be.calledWith(currentDataValue);
//         callbackB.should.be.calledOnce();
//
//         const newDataValue = DatabaseContents.NEW[dataRef];
//         await ref.set(newDataValue);
//
//         await new Promise((resolve) => {
//           setTimeout(() => resolve(), 5);
//         });
//
//         callbackA.should.be.calledWith(newDataValue);
//         callbackB.should.be.calledWith(newDataValue);
//
//         callbackA.should.be.calledTwice();
//         callbackB.should.be.calledTwice();
//
//         // Tear down
//
//         ref.off('value');
//         return Promise.resolve();
//       });
//     }).then(() => {
//       this.setState({ timeTaken: `Took ${Date.now() - start}` });
//     }).catch(console.error);
//   };
//
//   render() {
//     return (
//       <View style={{ marginTop: 15, backgroundColor: '#000' }}>
//         <Button title="Run Test" onPress={this.clickMe} />
//         <Text style={{ color: '#fff' }}>{this.state.timeTaken || ''}</Text>
//       </View>
//     );
//   }
// }
