import { useState } from 'react';
import { Link } from 'expo-router';
import { Button, Text } from 'react-native';
import { getAuth, signInAnonymously, signOut } from '@react-native-firebase/auth';

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
        <>
          <Link href="/auth/sign-in">
            <Text>Sign in with email</Text>
          </Link>
          <Link href="/auth/sign-up">
            <Text>Create account with email</Text>
          </Link>
          <Button title="Sign in anonymously" onPress={handleSignInAnonymously} />
        </>
      ) : null}
      {!initializing && user ? <Button title="Sign out" onPress={handleSignOut} /> : null}
      <Text>
        {'PROJECT_ID=test-expo-fixture-fake is a placeholder; real Auth calls will fail.'}
      </Text>
    </ScreenChrome>
  );
}
