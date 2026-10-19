import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  AppleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  OIDCAuthProvider,
  TwitterAuthProvider,
  getAuth,
  linkWithPopup,
  linkWithRedirect,
  reauthenticateWithPopup,
  reauthenticateWithRedirect,
  revokeToken,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
} from '@react-native-firebase/auth';

import { AppButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { TextField } from '../../src/TextField';
import { theme } from '../../src/theme';
import { useAuthRunner } from '../../src/useAuthRunner';
import { ensureAuthEmulator } from './authEmulator';

// Connect before any call runs; handlers also call this.
ensureAuthEmulator();

type PopupProvider = Parameters<typeof signInWithPopup>[1];

// The Auth emulator accepts a JSON string in place of a provider token.
const FAKE_TOKEN = JSON.stringify({
  sub: 'expo-social-user',
  email: 'expo-social@example.com',
  email_verified: true,
});

function requireUser() {
  const current = getAuth().currentUser;
  if (!current) {
    throw new Error('No user is signed in');
  }
  return current;
}

function createMicrosoftProvider(): PopupProvider {
  const provider = new OAuthProvider('microsoft.com');
  provider.addScope('offline_access');
  // OAuthProvider satisfies AuthProvider at runtime.
  return provider as unknown as PopupProvider;
}

export default function SocialScreen() {
  const { result, error, run } = useAuthRunner();
  const [token, setToken] = useState(FAKE_TOKEN);
  const [secret, setSecret] = useState('token-secret');
  const [nonce, setNonce] = useState('nonce');
  const [oidcSuffix, setOidcSuffix] = useState('azure_test');
  const [authorizationCode, setAuthorizationCode] = useState('');

  return (
    <ScreenChrome title="auth / social" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Auth emulator. The emulator accepts a JSON string as a Google ID token;
        other providers may reject the same value. Obtaining real provider tokens is left to your
        app.
      </Text>
      <TextField
        placeholder="Token (ID token or access token)"
        autoCapitalize="none"
        value={token}
        onChangeText={setToken}
      />
      <TextField
        placeholder="Secret (Twitter auth token secret)"
        autoCapitalize="none"
        value={secret}
        onChangeText={setSecret}
      />
      <TextField
        placeholder="Nonce (Apple)"
        autoCapitalize="none"
        value={nonce}
        onChangeText={setNonce}
      />
      <TextField
        placeholder="OIDC provider suffix (oidc.<suffix>)"
        autoCapitalize="none"
        value={oidcSuffix}
        onChangeText={setOidcSuffix}
      />

      <Text style={styles.section}>Credential sign-in</Text>
      <AppButton
        title="GoogleAuthProvider.credential"
        onPress={() =>
          run('Google signInWithCredential', () =>
            signInWithCredential(getAuth(), GoogleAuthProvider.credential(token)),
          )
        }
      />
      <AppButton
        title="FacebookAuthProvider.credential"
        onPress={() =>
          run('Facebook signInWithCredential', () =>
            signInWithCredential(getAuth(), FacebookAuthProvider.credential(token)),
          )
        }
      />
      <AppButton
        title="GithubAuthProvider.credential"
        onPress={() =>
          run('GitHub signInWithCredential', () =>
            signInWithCredential(getAuth(), GithubAuthProvider.credential(token)),
          )
        }
      />
      <AppButton
        title="TwitterAuthProvider.credential"
        onPress={() =>
          run('Twitter signInWithCredential', () =>
            signInWithCredential(getAuth(), TwitterAuthProvider.credential(token, secret)),
          )
        }
      />
      <AppButton
        title="OAuthProvider('apple.com').credential"
        onPress={() =>
          run('Apple (OAuthProvider) signInWithCredential', () => {
            const provider = new OAuthProvider('apple.com');
            const credential = provider.credential({ idToken: token, rawNonce: nonce });
            return signInWithCredential(getAuth(), credential);
          })
        }
      />
      <Text style={styles.warn}>AppleAuthProvider is deprecated; prefer OAuthProvider.</Text>
      <AppButton
        title="AppleAuthProvider.credential (deprecated)"
        variant="secondary"
        onPress={() =>
          run('Apple signInWithCredential', () =>
            signInWithCredential(getAuth(), AppleAuthProvider.credential(token, nonce)),
          )
        }
      />
      <Text style={styles.warn}>
        revokeToken works on iOS only. On Android it resolves without revoking anything. Paste a
        real Sign in with Apple authorization code first.
      </Text>
      <TextField
        placeholder="Apple authorization code (revokeToken)"
        autoCapitalize="none"
        value={authorizationCode}
        onChangeText={setAuthorizationCode}
      />
      <AppButton
        title="revokeToken"
        variant="secondary"
        onPress={() =>
          run('revokeToken', async () => {
            if (!authorizationCode) {
              throw new Error('Paste an Apple authorization code first');
            }
            await revokeToken(getAuth(), authorizationCode);
            return 'revokeToken: ok';
          })
        }
      />

      <Text style={styles.section}>OpenID Connect</Text>
      <AppButton
        title="OAuthProvider('oidc.<suffix>').credential"
        onPress={() =>
          run('OIDC (OAuthProvider) signInWithCredential', () => {
            const provider = new OAuthProvider(`oidc.${oidcSuffix}`);
            const credential = provider.credential({ idToken: token });
            return signInWithCredential(getAuth(), credential);
          })
        }
      />
      <AppButton
        title="OIDCAuthProvider.credential"
        onPress={() =>
          run('OIDC signInWithCredential', () =>
            signInWithCredential(getAuth(), OIDCAuthProvider.credential(oidcSuffix, token)),
          )
        }
      />

      <Text style={styles.section}>Microsoft popup and redirect</Text>
      <Text style={styles.warn}>
        These controls start the native provider flow for microsoft.com. They need the provider
        enabled in a real Firebase project, so they are expected to fail against the Auth emulator.
      </Text>
      <AppButton
        title="signInWithPopup"
        variant="secondary"
        onPress={() =>
          run('signInWithPopup', () => signInWithPopup(getAuth(), createMicrosoftProvider()))
        }
      />
      <AppButton
        title="signInWithRedirect"
        variant="secondary"
        onPress={() =>
          run('signInWithRedirect', () => signInWithRedirect(getAuth(), createMicrosoftProvider()))
        }
      />
      <AppButton
        title="linkWithPopup"
        variant="secondary"
        onPress={() =>
          run('linkWithPopup', () => linkWithPopup(requireUser(), createMicrosoftProvider()))
        }
      />
      <AppButton
        title="linkWithRedirect"
        variant="secondary"
        onPress={() =>
          run('linkWithRedirect', () => linkWithRedirect(requireUser(), createMicrosoftProvider()))
        }
      />
      <AppButton
        title="reauthenticateWithPopup"
        variant="secondary"
        onPress={() =>
          run('reauthenticateWithPopup', () =>
            reauthenticateWithPopup(requireUser(), createMicrosoftProvider()),
          )
        }
      />
      <AppButton
        title="reauthenticateWithRedirect"
        variant="secondary"
        onPress={() =>
          run('reauthenticateWithRedirect', async () => {
            await reauthenticateWithRedirect(requireUser(), createMicrosoftProvider());
            return 'reauthenticateWithRedirect: ok';
          })
        }
      />
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
