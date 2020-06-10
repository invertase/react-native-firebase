import React from 'react';
import appleAuth, {
  AppleButton,
  AppleAuthCredentialState,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthRealUserStatus,
} from '.';
import { View } from 'react-native';

async function onAppleButtonPress() {
  // sign in request
  const responseObject = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.IMPLICIT,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  });

  //authorization state request
  const credentialState = await appleAuth.getCredentialStateForUser(responseObject.user);

  if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
    // authorized
  } else if (credentialState === AppleAuthCredentialState.NOT_FOUND) {
    // not found
  } else if (credentialState === AppleAuthCredentialState.REVOKED) {
    // revoked
  } else if (credentialState === AppleAuthCredentialState.TRANSFERRED) {
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
  console.log(responseObject.realUserStatus == AppleAuthRealUserStatus.LIKELY_REAL);
  console.log(responseObject.realUserStatus == AppleAuthRealUserStatus.UNKNOWN);
  console.log(responseObject.realUserStatus == AppleAuthRealUserStatus.UNSUPPORTED);
  console.log(responseObject.state);
  console.log(responseObject.user);
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
    </View>
  );
}

App();
