/* eslint-disable no-console */
/* eslint-disable react/react-in-jsx-scope */
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

// Manual sample for verifying the "Sign in with Apple fullName" support added to
// @react-native-firebase/auth (OAuthProvider('apple.com').credential({ fullName })). See
// tests/local-tests/auth/README.md for one-time device/Xcode setup instructions.

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FirebaseAuthTypes,
  getAuth,
  OAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from '@react-native-firebase/auth';

import {
  isNativeAppleSignInAvailable,
  NativeAppleSignInResult,
  performAppleSignInRequest,
} from './nativeAppleSignIn';

const Button = (props: {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children: string;
}) => {
  return (
    <Pressable
      style={[styles.button, props.disabled && styles.buttonDisabled]}
      disabled={props.disabled || props.isLoading}
      onPress={props.onPress}
    >
      {props.isLoading && <ActivityIndicator color="#FFFFFF" />}
      {!props.isLoading && <Text style={styles.buttonText}>{props.children}</Text>}
    </Pressable>
  );
};

// Apple only returns non-empty `namePrefix`/`givenName`/etc. fields on the user's FIRST
// authorization for this app/bundle id. On every later sign-in `fullName` will be empty, which
// is expected and not a bug in this sample or in the PR under test.
function describeFullName(fullName: NativeAppleSignInResult['fullName']): string {
  const parts = [fullName.givenName, fullName.middleName, fullName.familyName].filter(Boolean);
  if (parts.length === 0 && !fullName.namePrefix && !fullName.nickname && !fullName.nameSuffix) {
    return '(empty — this is expected on any sign-in after the first)';
  }
  return JSON.stringify(fullName, null, 2);
}

export function AppleFullNameTestComponent() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [lastAppleResult, setLastAppleResult] = useState<NativeAppleSignInResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(getAuth(), setUser);
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      const appleResult = await performAppleSignInRequest();
      setLastAppleResult(appleResult);
      console.log('Apple native response:', JSON.stringify(appleResult, null, 2));

      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: appleResult.identityToken,
        rawNonce: appleResult.rawNonce,
        fullName: appleResult.fullName,
      });

      const userCredential = await signInWithCredential(getAuth(), credential);
      console.log(
        'Firebase user after Apple sign-in:',
        JSON.stringify(
          {
            displayName: userCredential.user.displayName,
            email: userCredential.user.email,
            isNewUser: userCredential.additionalUserInfo?.isNewUser,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      console.error('Apple sign-in failed:', e);
      setError((e as { message?: string }).message ?? String(e));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setLastAppleResult(null);
    setError(null);
    await signOut(getAuth());
  };

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Sign in with Apple (and the fullName it provides) is only supported on iOS.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Apple fullName Test</Text>

        {!isNativeAppleSignInAvailable() && (
          <Text style={styles.warning}>
            Sign in with Apple is not supported on this device/OS version (requires iOS 13+, see
            setup instructions).
          </Text>
        )}

        <Text style={styles.subtitle}>
          Signed in as: {user ? user.email || user.uid : 'nobody'}
        </Text>
        <Text style={styles.subtitle}>displayName: {user?.displayName ?? '(none)'}</Text>

        {error && <Text style={styles.warning}>{error}</Text>}

        <Button onPress={handleSignIn} isLoading={isSigningIn}>
          Sign in with Apple
        </Button>

        {user && (
          <Pressable style={styles.secondaryButton} onPress={handleSignOut}>
            <Text style={styles.secondaryButtonText}>Sign Out</Text>
          </Pressable>
        )}

        {lastAppleResult && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Raw response from Apple:</Text>
            <Text style={styles.resultText}>user: {lastAppleResult.user}</Text>
            <Text style={styles.resultText}>email: {lastAppleResult.email ?? '(none)'}</Text>
            <Text style={styles.resultText}>fullName: {describeFullName(lastAppleResult.fullName)}</Text>
          </View>
        )}

        <Text style={styles.hint}>
          Apple only shares fullName on the FIRST authorization for this app. To test again,
          either sign in with a different Apple ID/simulator, or on the device go to Settings →
          [your name] → Sign-In &amp; Security → Sign in with Apple → find this app → Stop Using
          Apple ID, then sign in again here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
  },
  warning: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  resultBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  resultText: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 2,
  },
});
