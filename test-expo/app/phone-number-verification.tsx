import { useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import {
  PnvErrorCode,
  enableTestSession,
  exchangeCredentialResponseForPhoneNumber,
  getDigitalCredentialPayload,
  getVerificationSupportInfo,
  getVerifiedPhoneNumber,
} from '@react-native-firebase/phone-number-verification';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function PhoneNumberVerificationScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(errorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
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

  return (
    <ScreenChrome title="phone-number-verification" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the Phone Number Verification usage page. Android
        only. There is no emulator and no connect*Emulator helper; this product is not in yarn
        tests:emulator:start-ci. Platform.OS is {Platform.OS}.
      </Text>

      <Text style={styles.warning}>
        WARNING: every exported runtime function throws when Platform.OS is not android (message:
        Firebase Phone Number Verification is only supported on Android).
      </Text>

      <Text style={styles.section}>Support and errors</Text>
      <AppButton
        title="getVerificationSupportInfo"
        onPress={() => run('getVerificationSupportInfo', async () => getVerificationSupportInfo())}
      />
      <AppButton
        title="getVerificationSupportInfo(0)"
        onPress={() =>
          run('getVerificationSupportInfo(0)', async () => getVerificationSupportInfo(0))
        }
      />
      <AppButton
        title="PnvErrorCode"
        onPress={() =>
          run('PnvErrorCode', () => ({
            CARRIER_NOT_SUPPORTED: PnvErrorCode.CARRIER_NOT_SUPPORTED,
            ACTIVITY_CONTEXT_REQUIRED: PnvErrorCode.ACTIVITY_CONTEXT_REQUIRED,
          }))
        }
      />

      <Text style={styles.section}>Verification</Text>
      <Text style={styles.warning}>
        WARNING: getVerifiedPhoneNumber presents consent UI on Android and throws on non-Android.
      </Text>
      <AppButton
        title="getVerifiedPhoneNumber"
        onPress={() => run('getVerifiedPhoneNumber', async () => getVerifiedPhoneNumber())}
      />

      <Text style={styles.section}>Digital Credentials</Text>
      <Text style={styles.warning}>
        WARNING: getDigitalCredentialPayload and exchangeCredentialResponseForPhoneNumber need a
        real nonce or Credential Manager JWT on Android, and throw on non-Android.
      </Text>
      <AppButton
        title="getDigitalCredentialPayload"
        onPress={() =>
          run('getDigitalCredentialPayload', async () =>
            getDigitalCredentialPayload('test-expo-demo-nonce'),
          )
        }
      />
      <AppButton
        title="exchangeCredentialResponseForPhoneNumber"
        onPress={() =>
          run('exchangeCredentialResponseForPhoneNumber', async () =>
            exchangeCredentialResponseForPhoneNumber('invalid-demo-credential-response'),
          )
        }
      />

      <Text style={styles.section}>Test session</Text>
      <Text style={styles.warning}>
        WARNING: enableTestSession requires a Firebase console test token, must be called only once
        per app instance, and throws on non-Android.
      </Text>
      <AppButton
        title="enableTestSession"
        onPress={() =>
          run('enableTestSession', async () => {
            await enableTestSession('replace-with-console-test-token');
            return { enabled: true };
          })
        }
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.subtleText, fontSize: 13, lineHeight: 18 },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
