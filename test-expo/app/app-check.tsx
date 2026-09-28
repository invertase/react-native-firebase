import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  CustomProvider,
  ReactNativeFirebaseAppCheckProvider,
  getLimitedUseToken,
  getToken,
  initializeAppCheck,
  onTokenChanged,
  setTokenAutoRefreshEnabled,
  type AppCheck,
  type AppCheckTokenResult,
} from '@react-native-firebase/app-check';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

// initializeAppCheck must only be called once per app; module-level memoization
// so re-running this screen after the first press reuses the same instance
// instead of re-initializing on every press.
let appCheckInstance: AppCheck | undefined;

function getOrInitializeAppCheck(): AppCheck {
  if (!appCheckInstance) {
    appCheckInstance = initializeAppCheck(getApp(), {
      provider: {
        providerOptions: {
          android: { provider: 'debug' },
          apple: { provider: 'debug' },
        },
      },
      isTokenAutoRefreshEnabled: true,
    });
  }
  return appCheckInstance;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function AppCheckScreen() {
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
    <ScreenChrome title="app-check" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the App Check usage page. App Check is not in yarn
        tests:emulator:start-ci, and there is no connect*Emulator helper.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="ReactNativeFirebaseAppCheckProvider"
        onPress={() =>
          run('ReactNativeFirebaseAppCheckProvider', () => {
            const provider = new ReactNativeFirebaseAppCheckProvider();
            provider.configure({
              android: { provider: 'debug' },
              apple: { provider: 'debug' },
            });
            return {
              androidProvider: provider.providerOptions?.android?.provider,
              appleProvider: provider.providerOptions?.apple?.provider,
            };
          })
        }
      />
      <AppButton
        title="initializeAppCheck"
        onPress={() =>
          run('initializeAppCheck', () => {
            const instance = getOrInitializeAppCheck();
            return { appName: instance.app.name };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: CustomProvider is for other/web platforms only. On iOS and Android,
        initializeAppCheck requires providerOptions via ReactNativeFirebaseAppCheckProvider or an
        inline ReactNativeFirebaseAppCheckProviderConfig.
      </Text>
      <AppButton
        title="CustomProvider"
        onPress={() =>
          run('CustomProvider', () => {
            const provider = new CustomProvider({
              getToken: async () => ({
                token: 'test-expo-custom-provider-token',
                expireTimeMillis: Date.now() + 60 * 60 * 1000,
              }),
            });
            return { constructed: provider != null };
          })
        }
      />

      <Text style={styles.section}>Tokens</Text>
      <AppButton
        title="getToken"
        onPress={() =>
          run('getToken', async () => {
            const appCheck = getOrInitializeAppCheck();
            const tokenResult = await getToken(appCheck, true);
            return { tokenLength: tokenResult.token.length };
          })
        }
      />
      <AppButton
        title="getLimitedUseToken"
        onPress={() =>
          run('getLimitedUseToken', async () => {
            const appCheck = getOrInitializeAppCheck();
            const tokenResult = await getLimitedUseToken(appCheck);
            return { tokenLength: tokenResult.token.length };
          })
        }
      />

      <Text style={styles.section}>Auto-refresh</Text>
      <AppButton
        title="setTokenAutoRefreshEnabled(true)"
        onPress={() =>
          run('setTokenAutoRefreshEnabled', () => {
            const appCheck = getOrInitializeAppCheck();
            setTokenAutoRefreshEnabled(appCheck, true);
            return { isTokenAutoRefreshEnabled: true };
          })
        }
      />
      <AppButton
        title="setTokenAutoRefreshEnabled(false)"
        onPress={() =>
          run('setTokenAutoRefreshEnabled', () => {
            const appCheck = getOrInitializeAppCheck();
            setTokenAutoRefreshEnabled(appCheck, false);
            return { isTokenAutoRefreshEnabled: false };
          })
        }
      />

      <Text style={styles.section}>Listeners</Text>
      <Text style={styles.warning}>
        WARNING: onTokenChanged is a no-op on iOS (logs a warning). Prefer getToken when you need a
        fresh token on Apple platforms.
      </Text>
      <AppButton
        title="onTokenChanged (iOS no-op)"
        onPress={() =>
          run('onTokenChanged', () => {
            const appCheck = getOrInitializeAppCheck();
            let lastTokenLength = 0;
            const unsubscribe = onTokenChanged(appCheck, (tokenResult: AppCheckTokenResult) => {
              lastTokenLength = tokenResult.token.length;
            });
            unsubscribe();
            return { unsubscribed: true, lastTokenLength };
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
