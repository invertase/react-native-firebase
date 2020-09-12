/* eslint-disable no-console */
/**
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
import { StyleSheet, View, Image, Text } from 'react-native';
import { AppleButton, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid'
import appleLogoWhite from './images/apple_logo_white.png';
import appleLogoBlack from './images/apple_logo_black.png';


export default RootComponent = () => {

  const doAppleLogin = async () => {
    // Generate secure, random values for state and nonce
    const rawNonce = uuid();
    const state = uuid();

    try {
      // Initialize the module
      appleAuthAndroid.configure({
        // The Service ID you registered with Apple
        clientId: "com.example.client-android",

        // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
        // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
        redirectUri: "https://example.com/auth/callback",

        // [OPTIONAL]
        // Scope.ALL (DEFAULT) = 'email name'
        // Scope.Email = 'email';
        // Scope.Name = 'name';
        scope: appleAuthAndroid.Scope.ALL,

        // [OPTIONAL]
        // ResponseType.ALL (DEFAULT) = 'code id_token';
        // ResponseType.CODE = 'code';
        // ResponseType.ID_TOKEN = 'id_token';
        responseType: appleAuthAndroid.ResponseType.ALL,

        // [OPTIONAL]
        // A String value used to associate a client session with an ID token and mitigate replay attacks.
        // This value will be SHA256 hashed by the library before being sent to Apple.
        // This is required if you intend to use Firebase to sign in with this credential.
        // Supply the response.id_token and rawNonce to Firebase OAuthProvider
        nonce: rawNonce,

        // [OPTIONAL]
        // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
        state,
      });

      const response = await appleAuthAndroid.signIn();
      if (response) {
        const code = response.code; // Present if selected ResponseType.ALL / ResponseType.CODE
        const id_token = response.id_token; // Present if selected ResponseType.ALL / ResponseType.ID_TOKEN
        const user = response.user; // Present when user first logs in using appleId
        const state = response.state; // A copy of the state value that was passed to the initial request.
        console.log("Got auth code", code);
        console.log("Got id_token", id_token);
        console.log("Got user", user);
        console.log("Got state", state);
      }
    } catch (error) {
      if (error && error.message) {
        switch (error.message) {
          case appleAuthAndroid.Error.NOT_CONFIGURED:
            console.log("appleAuthAndroid not configured yet.");
            break;
          case appleAuthAndroid.Error.SIGNIN_FAILED:
            console.log("Apple signin failed.");
            break;
          case appleAuthAndroid.Error.SIGNIN_CANCELLED:
            console.log("User cancelled Apple signin.");
            break;
          default:
            break;
        }
      }
    }
  };

  return (
    <View style={[styles.container, styles.horizontal]}>
      {appleAuthAndroid.isSupported && (
        <View>
          <Text style={styles.header}>Buttons</Text>

          <Text style={{ marginBottom: 8 }}>Continue Styles</Text>
          <AppleButton
            style={{ marginBottom: 10 }}
            cornerRadius={5}
            buttonStyle={AppleButton.Style.WHITE}
            buttonType={AppleButton.Type.CONTINUE}
            onPress={() => doAppleLogin()}
            leftView={(
              <Image
                style={{
                  alignSelf: 'center',
                  width: 14,
                  height: 14,
                  marginRight: 7,
                  resizeMode: 'contain',
                }}
                source={appleLogoBlack}
              />
            )}
          />
          <AppleButton
            style={{ marginBottom: 10 }}
            cornerRadius={0}
            buttonStyle={AppleButton.Style.WHITE_OUTLINE}
            buttonType={AppleButton.Type.CONTINUE}
            onPress={() => doAppleLogin()}
            leftView={(
              <Image
                style={{
                  alignSelf: 'center',
                  width: 14,
                  height: 14,
                  marginRight: 7,
                  resizeMode: 'contain',
                }}
                source={appleLogoBlack}
              />
            )}
          />
          <AppleButton
            style={{ marginBottom: 16 }}
            cornerRadius={30}
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.CONTINUE}
            onPress={() => doAppleLogin()}
            leftView={(
              <Image
                style={{
                  alignSelf: 'center',
                  width: 14,
                  height: 14,
                  marginRight: 7,
                  resizeMode: 'contain',
                }}
                source={appleLogoWhite}
              />
            )}
          />

          <Text style={{ marginBottom: 8 }}>Sign-in Styles</Text>
          <AppleButton
            style={{ marginBottom: 10 }}
            cornerRadius={5}
            buttonStyle={AppleButton.Style.WHITE}
            buttonType={AppleButton.Type.SIGN_IN}
            onPress={() => doAppleLogin()}
          />
          <AppleButton
            style={{ marginBottom: 10 }}
            cornerRadius={5}
            buttonStyle={AppleButton.Style.WHITE_OUTLINE}
            buttonType={AppleButton.Type.SIGN_IN}
            onPress={() => doAppleLogin()}
          />
          <AppleButton
            style={{ marginBottom: 10 }}
            cornerRadius={5}
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            onPress={() => doAppleLogin()}
          />
        </View>
      )}

      {!appleAuthAndroid.isSupported && (
        <Text>Sign In with Apple requires Android 4.4 (API 19) or higher.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
