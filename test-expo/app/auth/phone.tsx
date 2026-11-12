import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  PhoneAuthProvider,
  PhoneAuthState,
  getAuth,
  linkWithCredential,
  reauthenticateWithCredential,
  signInWithCredential,
  signInWithPhoneNumber,
  updatePhoneNumber,
  verifyPhoneNumber,
  type ConfirmationResult,
} from '@react-native-firebase/auth';

import { AppButton } from '../../src/AppButton';
import { ScreenChrome } from '../../src/ScreenChrome';
import { TextField } from '../../src/TextField';
import { theme } from '../../src/theme';
import { useAuthRunner } from '../../src/useAuthRunner';
import { ensureAuthEmulator } from './authEmulator';

// Connect before any call runs; effects and handlers also call this.
ensureAuthEmulator();

function requireUser() {
  const current = getAuth().currentUser;
  if (!current) {
    throw new Error('No user is signed in');
  }
  return current;
}

/** Starts verifyPhoneNumber and resolves with the verificationId once the SMS is sent. */
function sendSmsCode(phoneNumber: string): Promise<string> {
  return new Promise((resolve, reject) => {
    verifyPhoneNumber(getAuth(), phoneNumber).on(
      'state_changed',
      snapshot => {
        if (snapshot.state === PhoneAuthState.CODE_SENT && snapshot.verificationId) {
          resolve(snapshot.verificationId);
        }
      },
      error => reject(error),
    );
  });
}

export default function PhoneScreen() {
  const { result, error, run } = useAuthRunner();
  const [phoneNumber, setPhoneNumber] = useState('+1 650-555-3434');
  const [code, setCode] = useState('123456');
  const [verificationId, setVerificationId] = useState('');
  const confirmation = useRef<ConfirmationResult | null>(null);

  function requireVerificationId() {
    if (!verificationId) {
      throw new Error('Run verifyPhoneNumber (state_changed) first to get a verificationId');
    }
    return verificationId;
  }

  return (
    <ScreenChrome title="auth / phone" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Auth emulator. The emulator does not send SMS: read the code from the
        emulator log or its verificationCodes endpoint, or use a test phone number from the Firebase
        Console.
      </Text>
      <TextField
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextField
        placeholder="SMS code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />
      <TextField
        placeholder="verificationId (filled by verifyPhoneNumber)"
        autoCapitalize="none"
        value={verificationId}
        onChangeText={setVerificationId}
      />

      <Text style={styles.section}>signInWithPhoneNumber</Text>
      <AppButton
        title="signInWithPhoneNumber (send SMS)"
        onPress={() =>
          run('signInWithPhoneNumber', async () => {
            confirmation.current = await signInWithPhoneNumber(getAuth(), phoneNumber);
            return 'SMS sent, enter the code and confirm';
          })
        }
      />
      <AppButton
        title="confirm(code)"
        onPress={() =>
          run('confirm', async () => {
            if (!confirmation.current) {
              throw new Error('Run signInWithPhoneNumber first');
            }
            const userCredential = await confirmation.current.confirm(code);
            return `Signed in as ${userCredential?.user.phoneNumber ?? userCredential?.user.uid}`;
          })
        }
      />

      <Text style={styles.section}>verifyPhoneNumber</Text>
      <Text style={styles.warn}>
        On Android, awaiting verifyPhoneNumber resolves only on auto-verification or timeout, so
        this control listens for CODE_SENT with state_changed instead.
      </Text>
      <AppButton
        title="verifyPhoneNumber (state_changed, CODE_SENT)"
        onPress={() =>
          run('verifyPhoneNumber', async () => {
            const id = await sendSmsCode(phoneNumber);
            setVerificationId(id);
            return `CODE_SENT, verificationId: ${id}`;
          })
        }
      />
      <AppButton
        title="PhoneAuthProvider.credential + signInWithCredential"
        onPress={() =>
          run('signInWithCredential', async () => {
            const credential = PhoneAuthProvider.credential(requireVerificationId(), code);
            const userCredential = await signInWithCredential(getAuth(), credential);
            return `Signed in as ${userCredential.user.phoneNumber ?? userCredential.user.uid}`;
          })
        }
      />

      <Text style={styles.section}>Signed-in user</Text>
      <AppButton
        title="linkWithCredential (phone)"
        onPress={() =>
          run('linkWithCredential', async () => {
            const credential = PhoneAuthProvider.credential(requireVerificationId(), code);
            const userCredential = await linkWithCredential(requireUser(), credential);
            return `Linked ${userCredential.user.phoneNumber}`;
          })
        }
      />
      <AppButton
        title="updatePhoneNumber"
        onPress={() =>
          run('updatePhoneNumber', async () => {
            const credential = PhoneAuthProvider.credential(requireVerificationId(), code);
            await updatePhoneNumber(requireUser(), credential);
            return `Phone number is now ${getAuth().currentUser?.phoneNumber}`;
          })
        }
      />
      <AppButton
        title="reauthenticateWithCredential (phone)"
        onPress={() =>
          run('reauthenticateWithCredential', async () => {
            const credential = PhoneAuthProvider.credential(requireVerificationId(), code);
            await reauthenticateWithCredential(requireUser(), credential);
            return 'Re-authenticated with phone credential';
          })
        }
      />
      <Text style={styles.warn}>
        Request a new SMS code (verifyPhoneNumber) before each of the three controls above.
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
