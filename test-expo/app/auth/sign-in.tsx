import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';

import { AppButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { TextField } from '../../src/TextField';
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
      <TextField
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <AppButton title="Sign in" onPress={handleSignIn} />
    </ScreenChrome>
  );
}
