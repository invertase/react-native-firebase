import { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from '@react-native-firebase/auth';

import { AppButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { TextField } from '../../src/TextField';
import { getAuthErrorMessage } from '../../src/authErrorMessage';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp() {
    setResult(null);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(getAuth(), email, password);
      setResult(`Created & signed in as ${credential.user.email}`);
    } catch (e) {
      setError(getAuthErrorMessage(e));
    }
  }

  return (
    <ScreenChrome title="auth / sign up" result={result} error={error}>
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
      <AppButton title="Create account" onPress={handleSignUp} />
    </ScreenChrome>
  );
}
