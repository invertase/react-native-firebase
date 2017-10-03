import React, { Component } from 'react';
import { View, Button, Text, TextInput, Image, ActivityIndicator, Platform } from 'react-native';
import fb from './firebase';

const firebase = fb.native;

const imageUrl = 'https://www.shareicon.net/data/512x512/2016/07/19/798524_sms_512x512.png';

export default class PhoneAuth extends Component {
  static getDefaultState() {
    return {
      message: '',
      error: '',
      codeInput: '',
      phoneNumber: '+44',
      auto: Platform.OS === 'android',
      autoVerifyCountDown: 0,
      sent: false,
      started: false,
      user: null,
    };
  }

  constructor(props) {
    super(props);
    this.timeout = 20;
    this._autoVerifyInterval = null;
    this.state = PhoneAuth.getDefaultState();
  }

  _tick() {
    this.setState({
      autoVerifyCountDown: this.state.autoVerifyCountDown - 1,
    });
  }

  /**
   * Called when confirm code is pressed - we should have the code and verificationId now in state.
   */
  afterVerify = () => {
    const { codeInput, verificationId } = this.state;
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, codeInput);

    // TODO do something with credential for example:
    firebase.auth()
      .signInWithCredential(credential)
      .then((user) => {
        console.log('PHONE AUTH USER ->>>>>', user.toJSON());
        this.setState({ user: user.toJSON() });
      }).catch(console.error);
  };

  signIn = () => {
    const { phoneNumber } = this.state;
    this.setState({ message: 'Sending code ...', error: '', started: true, autoVerifyCountDown: this.timeout }, () => {
      firebase.auth()
        .verifyPhoneNumber(phoneNumber)
        .on('state_changed', (phoneAuthSnapshot) => {
          console.log(phoneAuthSnapshot);
          switch (phoneAuthSnapshot.state) {
            case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
              // update state with code sent and if android start a interval timer
              // for auto verify - to provide visual feedback
              this.setState({
                sent: true,
                message: 'Code Sent!',
                verificationId: phoneAuthSnapshot.verificationId,
                autoVerifyCountDown: this.timeout,
              }, () => {
                if (this.state.auto) {
                  this._autoVerifyInterval = setInterval(this._tick.bind(this), 1000);
                }
              });
              break;
            case firebase.auth.PhoneAuthState.ERROR: // or 'error'
              // restart the phone flow again on error
              clearInterval(this._autoVerifyInterval);
              this.setState({
                ...PhoneAuth.getDefaultState(),
                error: phoneAuthSnapshot.error.message,
              });
              break;

            // ---------------------
            // ANDROID ONLY EVENTS
            // ---------------------
            case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
              clearInterval(this._autoVerifyInterval);
              this.setState({
                sent: true,
                auto: false,
                verificationId: phoneAuthSnapshot.verificationId,
              });
              break;
            case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
              clearInterval(this._autoVerifyInterval);
              this.setState({
                sent: true,
                codeInput: phoneAuthSnapshot.code,
                verificationId: phoneAuthSnapshot.verificationId,
              });
              break;
            default:
            // will never get here - just for linting
          }
        });
    });
  };

  renderInputPhoneNumber() {
    const { phoneNumber } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <Text>Enter phone number:</Text>
        <TextInput
          autoFocus
          style={{ height: 40, marginTop: 15, marginBottom: 15 }}
          onChangeText={value => this.setState({ phoneNumber: value })}
          placeholder={'Phone number ... '}
          value={phoneNumber}
        />
        <Button title="Begin Verification" color="green" onPress={this.signIn} />
      </View>
    );
  }

  renderSendingCode() {
    const { phoneNumber } = this.state;

    return (
      <View style={{ paddingBottom: 15 }}>
        <Text
          style={{ paddingBottom: 25 }}
        >
          {`Sending verification code to '${phoneNumber}'.`}
        </Text>
        <ActivityIndicator animating style={{ padding: 50 }} size={'large'} />
      </View>
    );
  }

  renderAutoVerifyProgress() {
    const { autoVerifyCountDown, started, error, sent, phoneNumber } = this.state;
    if (!sent && started && !error.length) {
      return this.renderSendingCode();
    }
    return (
      <View style={{ padding: 0 }}>
        <Text
          style={{ paddingBottom: 25 }}
        >
          {`Verification code has been successfully sent to '${phoneNumber}'.`}
        </Text>
        <Text
          style={{ marginBottom: 25 }}
        >
          {`We'll now attempt to automatically verify the code for you. This will timeout in ${autoVerifyCountDown} seconds.`}
        </Text>
        <Button
          style={{ paddingTop: 25 }} title="I have a code already" color="green"
          onPress={() => this.setState({ auto: false })}
        />
      </View>
    );
  }

  renderError() {
    const { error } = this.state;

    return (
      <View style={{ padding: 10, borderRadius: 5, margin: 10, backgroundColor: 'rgb(255,0,0)' }}>
        <Text
          style={{ color: '#fff' }}
        >
          {error}
        </Text>
      </View>
    );
  }

  render() {
    const { started, error, codeInput, sent, auto, user } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: user ? 'rgb(0, 200, 0)' : '#fff' }}>
        <View
          style={{
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Image source={{ uri: imageUrl }} style={{ width: 128, height: 128, marginTop: 25, marginBottom: 15 }} />
          <Text style={{ fontSize: 25, marginBottom: 20 }}>Phone Auth Example</Text>
          {error && error.length ? this.renderError() : null}
          {!started && !sent ? this.renderInputPhoneNumber() : null}
          {started && auto && !codeInput.length ? this.renderAutoVerifyProgress() : null}
          {!user && started && sent && (codeInput.length || !auto) ? (
            <View style={{ marginTop: 15 }}>
              <Text>Enter verification code below:</Text>
              <TextInput
                autoFocus
                style={{ height: 40, marginTop: 15, marginBottom: 15 }}
                onChangeText={value => this.setState({ codeInput: value })}
                placeholder={'Code ... '}
                value={codeInput}
              />
              <Button title="Confirm Code" color="#841584" onPress={this.afterVerify} />
            </View>
          ) : null}
          {user ? (
            <View style={{ marginTop: 15 }}>
              <Text>{`Signed in with new user id: '${user.uid}'`}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}


/*
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
 */


// Example usage if handling here and not in optionalCompleteCb:
// const { verificationId, code } = phoneAuthSnapshot;
// const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);

// Do something with your new credential, e.g.:
// firebase.auth().signInWithCredential(credential);
// firebase.auth().linkWithCredential(credential);
// etc ...
