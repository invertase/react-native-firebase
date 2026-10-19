import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  LastFetchStatus,
  SDK_VERSION,
  ValueSource,
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getAll,
  getBoolean,
  getNumber,
  getRemoteConfig,
  getString,
  getValue,
  isSupported,
  onConfigUpdate,
  reset,
  setCustomSignals,
  setDefaultsFromResource,
  setLogLevel,
  type CustomSignals,
} from '@react-native-firebase/remote-config';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function RemoteConfigScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remoteConfig = useMemo(() => getRemoteConfig(), []);

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
    <ScreenChrome title="remote-config" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the Remote Config usage page. There is no Remote
        Config emulator and no connect*Emulator helper.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getRemoteConfig"
        onPress={() =>
          run('getRemoteConfig', () => {
            const instance = getRemoteConfig();
            const sameDefaultApp = getRemoteConfig(getApp());
            return {
              appName: instance.app.name,
              sameAsMemo: instance === remoteConfig,
              sameAsGetApp: sameDefaultApp === instance,
              lastFetchStatus: instance.lastFetchStatus,
              fetchTimeMillis: instance.fetchTimeMillis,
            };
          })
        }
      />
      <AppButton
        title="isSupported"
        onPress={() => run('isSupported', async () => ({ supported: await isSupported() }))}
      />
      <AppButton
        title="ensureInitialized"
        onPress={() =>
          run('ensureInitialized', async () => {
            await ensureInitialized(remoteConfig);
            return { ready: true };
          })
        }
      />

      <Text style={styles.section}>Defaults and settings</Text>
      <AppButton
        title="defaultConfig"
        onPress={() =>
          run('defaultConfig', () => {
            remoteConfig.defaultConfig = {
              awesome_new_feature: 'disabled',
              welcome_message: 'Welcome',
              max_retries: 3,
            };
            return { keys: Object.keys(remoteConfig.defaultConfig) };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: setDefaultsFromResource loads an iOS .plist or Android XML resource by name. This
        screen uses remote_config_defaults, and a missing resource rejects.
      </Text>
      <AppButton
        title="setDefaultsFromResource"
        onPress={() =>
          run('setDefaultsFromResource', async () => {
            await setDefaultsFromResource(remoteConfig, 'remote_config_defaults');
            return { resourceName: 'remote_config_defaults' };
          })
        }
      />
      <AppButton
        title="settings"
        onPress={() =>
          run('settings', () => {
            remoteConfig.settings = {
              minimumFetchIntervalMillis: 300000,
              fetchTimeoutMillis: 60000,
            };
            return {
              minimumFetchIntervalMillis: remoteConfig.settings.minimumFetchIntervalMillis,
              fetchTimeoutMillis: remoteConfig.settings.fetchTimeoutMillis,
            };
          })
        }
      />

      <Text style={styles.section}>Fetch and activate</Text>
      <AppButton
        title="fetchConfig"
        onPress={() =>
          run('fetchConfig', async () => {
            await fetchConfig(remoteConfig);
            return {
              lastFetchStatus: remoteConfig.lastFetchStatus,
              fetchTimeMillis: remoteConfig.fetchTimeMillis,
            };
          })
        }
      />
      <AppButton
        title="activate"
        onPress={() =>
          run('activate', async () => {
            const activated = await activate(remoteConfig);
            return { activated };
          })
        }
      />
      <AppButton
        title="fetchAndActivate"
        onPress={() =>
          run('fetchAndActivate', async () => {
            const activated = await fetchAndActivate(remoteConfig);
            return {
              activated,
              lastFetchStatus: remoteConfig.lastFetchStatus,
              fetchTimeMillis: remoteConfig.fetchTimeMillis,
            };
          })
        }
      />
      <AppButton
        title="LastFetchStatus"
        onPress={() =>
          run('LastFetchStatus', () => ({
            SUCCESS: LastFetchStatus.SUCCESS,
            FAILURE: LastFetchStatus.FAILURE,
            THROTTLED: LastFetchStatus.THROTTLED,
            NO_FETCH_YET: LastFetchStatus.NO_FETCH_YET,
            current: remoteConfig.lastFetchStatus,
            matchesSuccess: remoteConfig.lastFetchStatus === LastFetchStatus.SUCCESS,
          }))
        }
      />

      <Text style={styles.section}>Read values</Text>
      <AppButton
        title="getValue"
        onPress={() =>
          run('getValue', () => {
            const value = getValue(remoteConfig, 'awesome_new_feature');
            return {
              asString: value.asString(),
              asNumber: value.asNumber(),
              asBoolean: value.asBoolean(),
              source: value.getSource(),
            };
          })
        }
      />
      <AppButton
        title="getString"
        onPress={() =>
          run('getString', () => ({
            value: getString(remoteConfig, 'awesome_new_feature'),
          }))
        }
      />
      <AppButton
        title="getNumber"
        onPress={() =>
          run('getNumber', () => ({
            value: getNumber(remoteConfig, 'max_retries'),
          }))
        }
      />
      <AppButton
        title="getBoolean"
        onPress={() =>
          run('getBoolean', () => ({
            value: getBoolean(remoteConfig, 'awesome_new_feature'),
          }))
        }
      />
      <AppButton
        title="getAll"
        onPress={() =>
          run('getAll', () => {
            const all = getAll(remoteConfig);
            return Object.fromEntries(
              Object.entries(all).map(([key, value]) => [
                key,
                { value: value.asString(), source: value.getSource() },
              ]),
            );
          })
        }
      />
      <AppButton
        title="ValueSource"
        onPress={() =>
          run('ValueSource', () => {
            const source = getValue(remoteConfig, 'awesome_new_feature').getSource();
            return {
              REMOTE: ValueSource.REMOTE,
              DEFAULT: ValueSource.DEFAULT,
              STATIC: ValueSource.STATIC,
              current: source,
            };
          })
        }
      />

      <Text style={styles.section}>Signals and listeners</Text>
      <Text style={styles.warning}>
        WARNING: setCustomSignals rejects when a value is not string, number, or null.
      </Text>
      <AppButton
        title="setCustomSignals"
        onPress={() =>
          run('setCustomSignals', async () => {
            await setCustomSignals(remoteConfig, {
              city: 'Tokyo',
              preferred_event_category: 'sports',
              loyalty_tier: 2,
            });
            return { set: true };
          })
        }
      />
      <AppButton
        title="setCustomSignals (invalid type rejects)"
        onPress={() =>
          run('setCustomSignals invalid', async () => {
            const invalidSignals = { bad: true } as unknown as CustomSignals;
            await setCustomSignals(remoteConfig, invalidSignals);
            return { set: true };
          })
        }
      />
      <AppButton
        title="onConfigUpdate"
        onPress={() =>
          run('onConfigUpdate', () => {
            let updatedKeyCount = 0;
            let sawError = false;
            let sawComplete = false;
            const unsubscribe = onConfigUpdate(remoteConfig, {
              next: update => {
                updatedKeyCount = update.getUpdatedKeys().size;
              },
              error: () => {
                sawError = true;
              },
              complete: () => {
                sawComplete = true;
              },
            });
            unsubscribe();
            return { unsubscribed: true, updatedKeyCount, sawError, sawComplete };
          })
        }
      />

      <Text style={styles.section}>Reset and logging</Text>
      <Text style={styles.warning}>
        WARNING: reset is Android-only. On iOS it resolves without clearing activated, fetched, or
        default configs.
      </Text>
      <AppButton
        title="reset (iOS no-op)"
        onPress={() =>
          run('reset', async () => {
            await reset(remoteConfig);
            return {
              lastFetchStatus: remoteConfig.lastFetchStatus,
              fetchTimeMillis: remoteConfig.fetchTimeMillis,
            };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: setLogLevel is a no-op on React Native Firebase (signature parity only).
      </Text>
      <AppButton
        title="setLogLevel (no-op)"
        onPress={() =>
          run('setLogLevel', () => {
            setLogLevel(remoteConfig, 'debug');
            return { logLevel: 'debug' };
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
