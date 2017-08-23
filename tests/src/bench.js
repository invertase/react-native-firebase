import React, { Component } from 'react';
import { View, Button, Text, TextInput, Image } from 'react-native';

import fb from './firebase';
const firebase = fb.native;

if (firebase.auth().currentUser) firebase.auth().signOut();
const successImageUri = 'https://cdn.pixabay.com/photo/2015/06/09/16/12/icon-803718_1280.png';

export default class PhoneAuthTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      message: '',
      codeInput: '',
      phoneNumber: '+447',
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
            <Button
              title="Logout"
              color="#841584"
              onPress={() => {
                firebase.auth().signOut().then(() => {
                  this.setState({
                    user: null,
                    message: '',
                    codeInput: '',
                    phoneNumber: '+44',
                    confirmResult: null,
                  });
                });
              }}
            />
          </View>
        ) : null}
      </View>
    );
  }
}
