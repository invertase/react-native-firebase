import React from 'react';
import { appleAuth, appleAuthAndroid, AppleButton} from '.';
import { View } from 'react-native';

/**
 * iOS
 */
async function onAppleButtonPress() {
  // sign in request
  const responseObject = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.IMPLICIT,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  //authorization state request
  const credentialState = await appleAuth.getCredentialStateForUser(responseObject.user);

  if (credentialState === appleAuth.State.AUTHORIZED) {
    // authorized
  } else if (credentialState === appleAuth.State.NOT_FOUND) {
    // not found
  } else if (credentialState === appleAuth.State.REVOKED) {
    // revoked
  } else if (credentialState === appleAuth.State.TRANSFERRED) {
    // transferred
  }

  // testing types
  console.log(responseObject.authorizationCode);
  console.log(responseObject.email);
  console.log(responseObject.fullName);
  console.log(responseObject.fullName?.familyName);
  console.log(responseObject.fullName?.givenName);
  console.log(responseObject.fullName?.middleName);
  console.log(responseObject.fullName?.namePrefix);
  console.log(responseObject.fullName?.nameSuffix);
  console.log(responseObject.fullName?.nickname);
  console.log(responseObject.identityToken);
  console.log(responseObject.nonce);
  console.log(responseObject.realUserStatus == appleAuth.UserStatus.LIKELY_REAL);
  console.log(responseObject.realUserStatus == appleAuth.UserStatus.UNKNOWN);
  console.log(responseObject.realUserStatus == appleAuth.UserStatus.UNSUPPORTED);
  console.log(responseObject.state);
  console.log(responseObject.user);
}

/**
 * Android
 */
async function onAppleButtonPressAndroid() {
  try {
    // configure request
    appleAuthAndroid.configure({
      clientId: 'Client id',
      redirectUri: 'https://example.com/auth/callback',
      responseType: appleAuthAndroid.ResponseType.ALL,
      scope: appleAuthAndroid.Scope.ALL,
      nonce: 'Random nonce value, will be SHA256 hashed before sending to Apple',
      state: 'State',
    });

    const response = await appleAuthAndroid.signIn();

    // testing types
    console.log(response.code);
    console.log(response.id_token);
    console.log(response.state);
    console.log(response.user?.name?.firstName);
    console.log(response.user?.name?.lastName);
    console.log(response.user?.email);
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
}

function App() {
  return (
    <View>
      <AppleButton
        cornerRadius={5}
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        onPress={() => onAppleButtonPress()}
      />
      {appleAuthAndroid.isSupported && (
        <AppleButton
          cornerRadius={5}
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.CONTINUE}
          onPress={() => onAppleButtonPressAndroid()}
          style={{
            width: 200,
          }}
          textStyle={{
            fontSize: 14,
          }}
          leftView={<View />}
        />
      )}
    </View>
  );
}

App();
