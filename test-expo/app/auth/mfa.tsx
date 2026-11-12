import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  getAuth,
  getMultiFactorResolver,
  multiFactor,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';

import { AppButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { TextField } from '../../src/TextField';
import { theme } from '../../src/theme';
import { useAuthRunner } from '../../src/useAuthRunner';
import { ensureAuthEmulator } from './authEmulator';

// Connect before any call runs; handlers also call this.
ensureAuthEmulator();

type Resolver = ReturnType<typeof getMultiFactorResolver>;
type MultiFactorErrorArg = Parameters<typeof getMultiFactorResolver>[1];
type Secret = Awaited<ReturnType<typeof TotpMultiFactorGenerator.generateSecret>>;

function requireUser() {
  const current = getAuth().currentUser;
  if (!current) {
    throw new Error('No user is signed in');
  }
  return current;
}

export default function MfaScreen() {
  const { result, error, run } = useAuthRunner();
  const [email, setEmail] = useState('expo-mfa@example.com');
  const [password, setPassword] = useState('SuperSecretPassword!');
  const [phoneNumber, setPhoneNumber] = useState('+1 650-555-3434');
  const [code, setCode] = useState('123456');
  const [verificationId, setVerificationId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const resolver = useRef<Resolver | null>(null);
  const totpSecret = useRef<Secret | null>(null);

  function requireVerificationId() {
    if (!verificationId) {
      throw new Error('Request an SMS code first to get a verificationId');
    }
    return verificationId;
  }

  function requireResolver() {
    if (!resolver.current) {
      throw new Error('Run "Sign in (first factor)" first and let it ask for a second factor');
    }
    return resolver.current;
  }

  function requireSecret() {
    if (!totpSecret.current) {
      throw new Error('Run generateSecret first');
    }
    return totpSecret.current;
  }

  return (
    <ScreenChrome title="auth / multi-factor" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Auth emulator. Multi-factor auth needs a signed-in user with a verified
        email, so create that account on the main auth screen first.
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
      <TextField
        placeholder="Phone number (enrollment)"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextField
        placeholder="SMS or authenticator code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />

      <Text style={styles.section}>Sign in (first factor)</Text>
      <AppButton
        title="signInWithEmailAndPassword (captures the resolver)"
        onPress={() =>
          run('signInWithEmailAndPassword', async () => {
            resolver.current = null;
            try {
              await signInWithEmailAndPassword(getAuth(), email, password);
              return 'Signed in without a second factor';
            } catch (e) {
              if ((e as { code?: string }).code !== 'auth/multi-factor-auth-required') {
                throw e;
              }
              const next = getMultiFactorResolver(getAuth(), e as MultiFactorErrorArg);
              resolver.current = next;
              return `Second factor required: ${next.hints
                .map(hint => `${hint.factorId} (${hint.displayName ?? hint.uid})`)
                .join(', ')}`;
            }
          })
        }
      />

      <Text style={styles.section}>Phone factor</Text>
      <AppButton
        title="Enroll: send SMS (PhoneAuthProvider.verifyPhoneNumber)"
        onPress={() =>
          run('verifyPhoneNumber (enroll)', async () => {
            const session = await multiFactor(requireUser()).getSession();
            const id = await new PhoneAuthProvider(getAuth()).verifyPhoneNumber({
              phoneNumber,
              session,
            });
            setVerificationId(id);
            return `SMS sent, verificationId: ${id}`;
          })
        }
      />
      <AppButton
        title="Enroll: PhoneMultiFactorGenerator.assertion + enroll"
        onPress={() =>
          run('enroll (phone)', async () => {
            const credential = PhoneAuthProvider.credential(requireVerificationId(), code);
            const assertion = PhoneMultiFactorGenerator.assertion(credential);
            await multiFactor(requireUser()).enroll(assertion, 'Primary phone');
            return 'Phone factor enrolled';
          })
        }
      />
      <AppButton
        title="Sign in: send SMS to the first phone hint"
        onPress={() =>
          run('verifyPhoneNumber (sign in)', async () => {
            const activeResolver = requireResolver();
            const hint = activeResolver.hints.find(
              info => info.factorId === PhoneMultiFactorGenerator.FACTOR_ID,
            );
            if (!hint) {
              throw new Error('The user has no phone factor enrolled');
            }
            const id = await new PhoneAuthProvider(getAuth()).verifyPhoneNumber({
              multiFactorHint: hint,
              session: activeResolver.session,
            });
            setVerificationId(id);
            return `SMS sent, verificationId: ${id}`;
          })
        }
      />
      <AppButton
        title="Sign in: resolveSignIn (phone)"
        onPress={() =>
          run('resolveSignIn (phone)', async () => {
            const credential = PhoneAuthProvider.credential(requireVerificationId(), code);
            const assertion = PhoneMultiFactorGenerator.assertion(credential);
            await requireResolver().resolveSignIn(assertion);
            return 'Signed in with the phone factor';
          })
        }
      />

      <Text style={styles.section}>TOTP factor</Text>
      <AppButton
        title="Enroll: TotpMultiFactorGenerator.generateSecret"
        onPress={() =>
          run('generateSecret', async () => {
            const session = await multiFactor(requireUser()).getSession();
            const secret = await TotpMultiFactorGenerator.generateSecret(session, getAuth());
            totpSecret.current = secret;
            setSecretKey(secret.secretKey);
            return `Secret key: ${secret.secretKey}\nQR URL: ${secret.generateQrCodeUrl(
              getAuth().currentUser?.email ?? undefined,
              'test-expo',
            )}`;
          })
        }
      />
      <TextField
        placeholder="TOTP secret key (filled by generateSecret)"
        autoCapitalize="none"
        value={secretKey}
        editable={false}
      />
      <Text style={styles.warn}>
        openInOtpApp asks the device to open the otpauth URL in an authenticator app, so it needs
        one installed.
      </Text>
      <AppButton
        title="Enroll: TotpSecret.openInOtpApp"
        variant="secondary"
        onPress={() =>
          run('openInOtpApp', () => {
            const secret = requireSecret();
            const qrCodeUrl = secret.generateQrCodeUrl(
              getAuth().currentUser?.email ?? undefined,
              'test-expo',
            );
            secret.openInOtpApp(qrCodeUrl);
            return `Asked the device to open ${qrCodeUrl}`;
          })
        }
      />
      <AppButton
        title="Enroll: assertionForEnrollment + enroll"
        onPress={() =>
          run('enroll (totp)', async () => {
            const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
              requireSecret(),
              code,
            );
            await multiFactor(requireUser()).enroll(assertion, 'Authenticator app');
            return 'TOTP factor enrolled';
          })
        }
      />
      <AppButton
        title="Sign in: assertionForSignIn + resolveSignIn"
        onPress={() =>
          run('resolveSignIn (totp)', async () => {
            const activeResolver = requireResolver();
            const hint = activeResolver.hints.find(
              info => info.factorId === TotpMultiFactorGenerator.FACTOR_ID,
            );
            if (!hint) {
              throw new Error('The user has no TOTP factor enrolled');
            }
            const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code);
            await activeResolver.resolveSignIn(assertion);
            return 'Signed in with the TOTP factor';
          })
        }
      />

      <Text style={styles.section}>Enrolled factors</Text>
      <AppButton
        title="multiFactor(user).enrolledFactors"
        onPress={() =>
          run('enrolledFactors', () =>
            multiFactor(requireUser()).enrolledFactors.map(info => ({
              uid: info.uid,
              factorId: info.factorId,
              displayName: info.displayName,
            })),
          )
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
