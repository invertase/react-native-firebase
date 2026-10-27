import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  EmailAuthProvider,
  getAuth,
  isSignInWithEmailLink,
  linkWithCredential,
  reauthenticateWithCredential,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from '@react-native-firebase/auth';

import { AppButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { TextField } from '../../src/TextField';
import { getExampleActionCodeSettings } from '../../src/authActionCodeSettings';
import { theme } from '../../src/theme';
import { useAuthRunner } from '../../src/useAuthRunner';
import { ensureAuthEmulator } from './authEmulator';

// Connect before any call runs; handlers also call this.
ensureAuthEmulator();

function requireUser() {
  const current = getAuth().currentUser;
  if (!current) {
    throw new Error('No user is signed in');
  }
  return current;
}

export default function EmailLinkScreen() {
  const { result, error, run } = useAuthRunner();
  const [email, setEmail] = useState('expo-email-link@example.com');
  const [link, setLink] = useState('');

  function requireLink() {
    if (!link) {
      throw new Error('Paste the sign-in link first (the emulator lists it in its oobCodes)');
    }
    return link;
  }

  return (
    <ScreenChrome title="auth / email link" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Auth emulator. The emulator does not send email: copy the sign-in link from
        the emulator log or its oobCodes endpoint and paste it below.
      </Text>
      <TextField
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        placeholder="Sign-in link"
        autoCapitalize="none"
        value={link}
        onChangeText={setLink}
      />

      <Text style={styles.section}>Sign in</Text>
      <AppButton
        title="sendSignInLinkToEmail"
        onPress={() =>
          run('sendSignInLinkToEmail', async () => {
            await sendSignInLinkToEmail(getAuth(), email, getExampleActionCodeSettings());
            return 'Sign-in link requested';
          })
        }
      />
      <AppButton
        title="isSignInWithEmailLink"
        onPress={() =>
          run('isSignInWithEmailLink', () => `${isSignInWithEmailLink(getAuth(), requireLink())}`)
        }
      />
      <AppButton
        title="signInWithEmailLink"
        onPress={() =>
          run('signInWithEmailLink', async () => {
            const userCredential = await signInWithEmailLink(getAuth(), email, requireLink());
            return `Signed in as ${userCredential.user.email ?? userCredential.user.uid}`;
          })
        }
      />

      <Text style={styles.section}>Signed-in user</Text>
      <AppButton
        title="EmailAuthProvider.credentialWithLink + linkWithCredential"
        onPress={() =>
          run('linkWithCredential', async () => {
            const credential = EmailAuthProvider.credentialWithLink(email, requireLink());
            const userCredential = await linkWithCredential(requireUser(), credential);
            return `Linked ${userCredential.user.email ?? userCredential.user.uid}`;
          })
        }
      />
      <AppButton
        title="EmailAuthProvider.credentialWithLink + reauthenticateWithCredential"
        onPress={() =>
          run('reauthenticateWithCredential', async () => {
            const credential = EmailAuthProvider.credentialWithLink(email, requireLink());
            await reauthenticateWithCredential(requireUser(), credential);
            return 'Re-authenticated with email link';
          })
        }
      />
      <Text style={styles.warn}>
        A link works once, so request a new link before each of the signed-in controls.
      </Text>
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: theme.subtleText,
    marginBottom: 8,
  },
  section: {
    color: theme.text,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  warn: {
    color: theme.subtleText,
    marginBottom: 4,
    fontStyle: 'italic',
  },
});
