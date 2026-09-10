import { useState } from 'react';
import { Button, TextInput } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';

import { ScreenChrome } from '../../src/ScreenChrome';
import { getAuthErrorMessage } from '../../src/authErrorMessage';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setResult(null);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(getAuth(), email, password);
      setResult(`Signed in as ${credential.user.email}`);
    } catch (e) {
      setError(getAuthErrorMessage(e));
    }
  }

  return (
    <ScreenChrome title="auth / sign in" result={result} error={error}>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenChrome>
  );
}
