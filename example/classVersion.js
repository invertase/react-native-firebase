/* eslint-disable no-console */
/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from 'react';
import { AppRegistry, StyleSheet, View, Text } from 'react-native';
import appleAuth, {
  AppleButton,
  AppleAuthError,
  AppleAuthRequestScope,
  AppleAuthRealUserStatus,
  AppleAuthCredentialState,
  AppleAuthRequestOperation,
} from '@invertase/react-native-apple-authentication';


class Tester extends React.Component {
  constructor() {
    super();
    this.authCredentialListener = null;
    this.user = null;
    this.state = {
      credentialStateForUser: -1,
    }
  }
  componentDidMount() {
    /**
     * subscribe to credential updates.This returns a function which can be used to remove the event listener
     * when the component unmounts.
     */
    this.authCredentialListener = appleAuth.onCredentialRevoked(async () => {
      console.warn('Credential Revoked');
      this.fetchAndUpdateCredentialState().catch(error =>
        this.setState({ credentialStateForUser: `Error: ${error.code}` }),
      );
    });

    this.fetchAndUpdateCredentialState()
      .then(res => this.setState({ credentialStateForUser: res }))
      .catch(error => this.setState({ credentialStateForUser: `Error: ${error.code}` }))
  }

  componentWillUnmount() {
    /**
     * cleans up event listener
     */
    this.authCredentialListener();
  }

  signIn = async () => {
    console.warn('Beginning Apple Authentication');

    // start a login request
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME,
        ],
      });

      console.log('appleAuthRequestResponse', appleAuthRequestResponse);

      const {
        user: newUser,
        email,
        nonce,
        identityToken,
        realUserStatus /* etc */,
      } = appleAuthRequestResponse;

      this.user = newUser;

      this.fetchAndUpdateCredentialState()
        .then(res => this.setState({ credentialStateForUser: res }))
        .catch(error =>
          this.setState({ credentialStateForUser: `Error: ${error.code}` }),
        );

      if (identityToken) {
        // e.g. sign in with Firebase Auth using `nonce` & `identityToken`
        console.log(nonce, identityToken);
      } else {
        // no token - failed sign-in?
      }

      if (realUserStatus === AppleAuthRealUserStatus.LIKELY_REAL) {
        console.log("I'm a real person!");
      }

      console.warn(`Apple Authentication Completed, ${this.user}, ${email}`);
    } catch (error) {
      if (error.code === AppleAuthError.CANCELED) {
        console.warn('User canceled Apple Sign in.');
      } else {
        console.error(error);
      }
    }
  };

  fetchAndUpdateCredentialState = async () => {
    if (this.user === null) {
      this.setState({ credentialStateForUser: 'N/A' });
    } else {
      const credentialState = await appleAuth.getCredentialStateForUser(this.user);
      if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
        this.setState({ credentialStateForUser: 'AUTHORIZED' });
      } else {
        this.setState({ credentialStateForUser: credentialState });
      }
    }
  }

  render() {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <Text style={styles.header}>Credential State</Text>
        <Text>{this.state.credentialStateForUser}</Text>
        <Text style={styles.header}>Buttons</Text>
        <Text>Continue Styles</Text>
        <AppleButton
          style={styles.appleButton}
          cornerRadius={5}
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.CONTINUE}
          onPress={() => this.signIn()}
        />
        <AppleButton
          style={styles.appleButton}
          cornerRadius={5}
          buttonStyle={AppleButton.Style.WHITE_OUTLINE}
          buttonType={AppleButton.Type.CONTINUE}
          onPress={() => this.signIn()}
        />
        <AppleButton
          style={styles.appleButton}
          cornerRadius={5}
          buttonStyle={AppleButton.Style.BLACK}
          buttonType={AppleButton.Type.CONTINUE}
          onPress={() => this.signIn()}
        />
        <Text>Sign-in Styles</Text>
        <AppleButton
          style={styles.appleButton}
          cornerRadius={5}
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          onPress={() => this.signIn()}
        />
        <AppleButton
          style={styles.appleButton}
          cornerRadius={5}
          buttonStyle={AppleButton.Style.WHITE_OUTLINE}
          buttonType={AppleButton.Type.SIGN_IN}
          onPress={() => this.signIn()}
        />
        <AppleButton
          style={styles.appleButton}
          cornerRadius={5}
          buttonStyle={AppleButton.Style.BLACK}
          buttonType={AppleButton.Type.SIGN_IN}
          onPress={() => this.signIn()}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  appleButton: {
    width: 200,
    height: 60,
    margin: 10,
  },
  header: {
    margin: 10,
    marginTop: 30,
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'pink',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

AppRegistry.registerComponent('testing', () => Tester);
