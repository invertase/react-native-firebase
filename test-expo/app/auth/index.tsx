import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  SDK_VERSION,
  EmailAuthProvider,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  getAuth,
  getCustomAuthDomain,
  getIdToken,
  getIdTokenResult,
  linkWithCredential,
  onAuthStateChanged,
  onIdTokenChanged,
  parseActionCodeURL,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setLanguageCode,
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  unlink,
  updateEmail,
  updatePassword,
  updateProfile,
  useUserAccessGroup,
  validatePassword,
  verifyPasswordResetCode,
  type Unsubscribe,
} from '@react-native-firebase/auth';

import { AppButton, LinkButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { TextField } from '../../src/TextField';
import { getAuthErrorMessage } from '../../src/authErrorMessage';
import { theme } from '../../src/theme';
import { useAuthUser } from '../../src/useAuthUser';
import { AUTH_EMULATOR_PORT, ensureAuthEmulator, getAuthEmulatorHost } from './authEmulator';

// Connect before useAuthUser's onAuthStateChanged effect (effects run after mount).
ensureAuthEmulator();

export default function AuthScreen() {
  const { user, initializing } = useAuthUser();
  const [email, setEmail] = useState('expo-auth@example.com');
  const [password, setPassword] = useState('SuperSecretPassword!');
  const [displayName, setDisplayName] = useState('Expo Auth User');
  const [customToken, setCustomToken] = useState('');
  const [languageCode, setLanguageCodeInput] = useState('en');
  const [providerId, setProviderId] = useState('password');
  const [oobCode, setOobCode] = useState('');
  const [actionLink, setActionLink] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unsubscribers = useRef<Unsubscribe[]>([]);

  useEffect(() => {
    ensureAuthEmulator();
    return () => {
      for (const stop of unsubscribers.current) {
        stop();
      }
      unsubscribers.current = [];
    };
  }, []);

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(getAuthErrorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
      ensureAuthEmulator();
      const value = await action();
      showResult(
        typeof value === 'string'
          ? value
          : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`,
      );
    } catch (e) {
      showError(e);
    }
  }

  function requireUser() {
    const current = getAuth().currentUser;
    if (!current) {
      throw new Error('No user is signed in');
    }
    return current;
  }

  const authStatus = initializing
    ? 'Loading auth state…'
    : user
      ? `Signed in as ${user.isAnonymous ? 'anonymous user' : (user.email ?? user.uid)}, uid: ${user.uid}`
      : 'Not signed in';

  return (
    <ScreenChrome title="auth" result={result ?? authStatus} error={error}>
      <Text style={styles.hint}>
        Connects to the Auth emulator at {getAuthEmulatorHost()}:{AUTH_EMULATOR_PORT} (same host
        mapping as the e2e helpers; CI default port 9099). Controls mirror runtime APIs taught on
        the Auth usage docs page.
      </Text>

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
      <TextField placeholder="Display name" value={displayName} onChangeText={setDisplayName} />
      <TextField
        placeholder="Custom token (signInWithCustomToken)"
        autoCapitalize="none"
        value={customToken}
        onChangeText={setCustomToken}
      />
      <TextField
        placeholder="Language code (setLanguageCode)"
        autoCapitalize="none"
        value={languageCode}
        onChangeText={setLanguageCodeInput}
      />
      <TextField
        placeholder="Provider id (unlink)"
        autoCapitalize="none"
        value={providerId}
        onChangeText={setProviderId}
      />
      <TextField
        placeholder="oobCode (email action)"
        autoCapitalize="none"
        value={oobCode}
        onChangeText={setOobCode}
      />
      <TextField
        placeholder="Action link (parseActionCodeURL)"
        autoCapitalize="none"
        value={actionLink}
        onChangeText={setActionLink}
      />

      <Text style={styles.section}>Package / instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getAuth"
        onPress={() =>
          run('getAuth', () => {
            const auth = getAuth();
            return { appName: auth.app.name, currentUser: auth.currentUser?.uid ?? null };
          })
        }
      />
      <AppButton
        title="connectAuthEmulator (ensure)"
        onPress={() =>
          run('connectAuthEmulator', () => {
            ensureAuthEmulator();
            return `http://${getAuthEmulatorHost()}:${AUTH_EMULATOR_PORT}`;
          })
        }
      />

      <Text style={styles.section}>Listeners</Text>
      <AppButton
        title="onAuthStateChanged (subscribe once)"
        onPress={() =>
          run('onAuthStateChanged', () => {
            const stop = onAuthStateChanged(getAuth(), next => {
              showResult(`onAuthStateChanged → ${next?.uid ?? 'signed out'}`);
            });
            unsubscribers.current.push(stop);
            return 'subscribed (fires immediately + on changes)';
          })
        }
      />
      <AppButton
        title="onIdTokenChanged (subscribe once)"
        onPress={() =>
          run('onIdTokenChanged', () => {
            const stop = onIdTokenChanged(getAuth(), next => {
              showResult(`onIdTokenChanged → ${next?.uid ?? 'signed out'}`);
            });
            unsubscribers.current.push(stop);
            return 'subscribed';
          })
        }
      />

      <Text style={styles.section}>Sign-in</Text>
      <View style={{ gap: 12 }}>
        <LinkButton href="/auth/sign-in" title="Sign in with email (screen)" />
        <LinkButton href="/auth/sign-up" title="Create account with email (screen)" />
      </View>
      <AppButton
        title="signInAnonymously"
        onPress={() => run('signInAnonymously', () => signInAnonymously(getAuth()))}
      />
      <AppButton
        title="createUserWithEmailAndPassword"
        onPress={() =>
          run('createUserWithEmailAndPassword', () =>
            createUserWithEmailAndPassword(getAuth(), email, password),
          )
        }
      />
      <AppButton
        title="signInWithEmailAndPassword"
        onPress={() =>
          run('signInWithEmailAndPassword', () =>
            signInWithEmailAndPassword(getAuth(), email, password),
          )
        }
      />
      <AppButton
        title="signInWithCustomToken"
        onPress={() =>
          run('signInWithCustomToken', () => {
            if (!customToken) {
              throw new Error('Paste a custom token first');
            }
            return signInWithCustomToken(getAuth(), customToken);
          })
        }
      />
      <AppButton
        title="validatePassword"
        onPress={() => run('validatePassword', () => validatePassword(getAuth(), password))}
      />
      <AppButton
        title="linkWithCredential (email/password)"
        onPress={() =>
          run('linkWithCredential', () => {
            const credential = EmailAuthProvider.credential(email, password);
            return linkWithCredential(requireUser(), credential);
          })
        }
      />
      <AppButton title="signOut" onPress={() => run('signOut', () => signOut(getAuth()))} />

      <Text style={styles.section}>Manage user</Text>
      <AppButton
        title="updateProfile"
        onPress={() =>
          run('updateProfile', () => updateProfile(requireUser(), { displayName, photoURL: null }))
        }
      />
      <AppButton
        title="updateEmail"
        onPress={() => run('updateEmail', () => updateEmail(requireUser(), email))}
      />
      <AppButton
        title="sendEmailVerification"
        onPress={() => run('sendEmailVerification', () => sendEmailVerification(requireUser()))}
      />
      <AppButton
        title="updatePassword"
        onPress={() => run('updatePassword', () => updatePassword(requireUser(), password))}
      />
      <AppButton
        title="sendPasswordResetEmail"
        onPress={() =>
          run('sendPasswordResetEmail', () => sendPasswordResetEmail(getAuth(), email))
        }
      />
      <AppButton title="reload" onPress={() => run('reload', () => reload(requireUser()))} />
      <AppButton
        title="reauthenticateWithCredential"
        onPress={() =>
          run('reauthenticateWithCredential', () => {
            const credential = EmailAuthProvider.credential(email, password);
            return reauthenticateWithCredential(requireUser(), credential);
          })
        }
      />
      <AppButton
        title="unlink"
        onPress={() => run('unlink', () => unlink(requireUser(), providerId))}
      />
      <AppButton
        title="deleteUser (destructive)"
        onPress={() => run('deleteUser', () => deleteUser(requireUser()))}
      />
      <AppButton
        title="getIdToken"
        onPress={() => run('getIdToken', () => getIdToken(requireUser()))}
      />
      <AppButton
        title="getIdTokenResult"
        onPress={() =>
          run('getIdTokenResult', async () => {
            const tokenResult = await getIdTokenResult(requireUser());
            return {
              authTime: tokenResult.authTime,
              expirationTime: tokenResult.expirationTime,
              signInProvider: tokenResult.signInProvider,
            };
          })
        }
      />
      <AppButton
        title="getAdditionalUserInfo (after email sign-in)"
        onPress={() =>
          run('getAdditionalUserInfo', async () => {
            const credential = await signInWithEmailAndPassword(getAuth(), email, password);
            return getAdditionalUserInfo(credential);
          })
        }
      />

      <Text style={styles.section}>Email action codes</Text>
      <AppButton
        title="parseActionCodeURL"
        onPress={() =>
          run('parseActionCodeURL', () => {
            if (!actionLink) {
              throw new Error('Paste an action link first');
            }
            return parseActionCodeURL(actionLink);
          })
        }
      />
      <AppButton
        title="verifyPasswordResetCode"
        onPress={() =>
          run('verifyPasswordResetCode', () => {
            if (!oobCode) {
              throw new Error('Paste an oobCode first');
            }
            return verifyPasswordResetCode(getAuth(), oobCode);
          })
        }
      />
      <AppButton
        title="confirmPasswordReset"
        onPress={() =>
          run('confirmPasswordReset', () => {
            if (!oobCode) {
              throw new Error('Paste an oobCode first');
            }
            return confirmPasswordReset(getAuth(), oobCode, password);
          })
        }
      />
      <AppButton
        title="checkActionCode"
        onPress={() =>
          run('checkActionCode', () => {
            if (!oobCode) {
              throw new Error('Paste an oobCode first');
            }
            return checkActionCode(getAuth(), oobCode);
          })
        }
      />
      <AppButton
        title="applyActionCode"
        onPress={() =>
          run('applyActionCode', () => {
            if (!oobCode) {
              throw new Error('Paste an oobCode first');
            }
            return applyActionCode(getAuth(), oobCode);
          })
        }
      />

      <Text style={styles.section}>RN helpers</Text>
      <AppButton
        title="setLanguageCode"
        onPress={() => run('setLanguageCode', () => setLanguageCode(getAuth(), languageCode))}
      />
      <Text style={styles.warn}>
        getCustomAuthDomain can reject with auth/unsupported on Other/Web.
      </Text>
      <AppButton
        title="getCustomAuthDomain (may throw)"
        onPress={() => run('getCustomAuthDomain', () => getCustomAuthDomain(getAuth()))}
      />
      <Text style={styles.warn}>
        useUserAccessGroup is iOS only and can throw on other platforms.
      </Text>
      <AppButton
        title="useUserAccessGroup (may throw)"
        onPress={() =>
          run('useUserAccessGroup', () => useUserAccessGroup(getAuth(), 'group.com.example.shared'))
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
