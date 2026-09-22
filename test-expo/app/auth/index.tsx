import { useState } from 'react';
import { Text, View } from 'react-native';
import { getAuth, signInAnonymously, signOut } from '@react-native-firebase/auth';

import { AppButton, LinkButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { getAuthErrorMessage } from '../../src/authErrorMessage';
import { useAuthUser } from '../../src/useAuthUser';

export default function AuthScreen() {
  const { user, initializing } = useAuthUser();
  const [error, setError] = useState<string | null>(null);

  async function handleSignInAnonymously() {
    setError(null);
    try {
      await signInAnonymously(getAuth());
    } catch (e) {
      setError(getAuthErrorMessage(e));
    }
  }

  async function handleSignOut() {
    setError(null);
    try {
      await signOut(getAuth());
    } catch (e) {
      setError(getAuthErrorMessage(e));
    }
  }

  const result = initializing
    ? 'Loading auth state…'
    : user
      ? `Signed in as ${user.isAnonymous ? 'anonymous user' : user.email}, uid: ${user.uid}`
      : 'Not signed in';

  return (
    <ScreenChrome title="auth" result={result} error={error}>
      {!initializing && !user ? (
        <View style={{ gap: 12 }}>
          <LinkButton href="/auth/sign-in" title="Sign in with email" />
          <LinkButton href="/auth/sign-up" title="Create account with email" />
          <AppButton title="Sign in anonymously" onPress={handleSignInAnonymously} />
        </View>
      ) : null}
      {!initializing && user ? <AppButton title="Sign out" onPress={handleSignOut} /> : null}
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Auth calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
