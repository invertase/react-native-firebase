import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  FilePath,
  SDK_VERSION,
  deleteApp,
  getApp,
  getApps,
  getUtils,
  initializeApp,
  jsonGetAll,
  metaGetAll,
  onLog,
  preferencesClearAll,
  preferencesGetAll,
  preferencesSetBool,
  preferencesSetString,
  registerVersion,
  setLogLevel,
  setReactNativeAsyncStorage,
} from '@react-native-firebase/app';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

const SECONDARY_APP_NAME = 'EXPO_APP_SECONDARY';

/** Minimal Async Storage shape for setReactNativeAsyncStorage demos (in-memory). */
const memoryStore = new Map<string, string>();
const memoryAsyncStorage = {
  getItem: async (key: string) => (memoryStore.has(key) ? memoryStore.get(key)! : null),
  setItem: async (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStore.delete(key);
  },
};

export default function AppScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    setResult(null);
    setError(null);
    try {
      const value = await action();
      const text =
        value === undefined
          ? `${label}: ok`
          : typeof value === 'string'
            ? `${label}: ${value}`
            : `${label}: ${JSON.stringify(value)}`;
      setResult(text);
    } catch (e) {
      setError(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <ScreenChrome title="app" result={result} error={error}>
      <Text style={styles.hint}>
        Exercises modular `@react-native-firebase/app` APIs from the usage docs. Secondary app
        controls clone the default app options under the name {SECONDARY_APP_NAME}.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getApp (default)"
        onPress={() =>
          run('getApp', () => {
            const app = getApp();
            return {
              name: app.name,
              projectId: app.options.projectId,
              automaticDataCollectionEnabled: app.automaticDataCollectionEnabled,
            };
          })
        }
      />
      <AppButton
        title="getApps"
        onPress={() => run('getApps', () => getApps().map(app => app.name))}
      />
      <AppButton
        title="initializeApp (secondary)"
        onPress={() =>
          run('initializeApp', async () => {
            const existing = getApps().find(app => app.name === SECONDARY_APP_NAME);
            if (existing) {
              return { name: existing.name, reused: true };
            }
            const options = getApp().options;
            const secondary = await initializeApp(
              {
                appId: options.appId,
                projectId: options.projectId,
                apiKey: options.apiKey,
                databaseURL: options.databaseURL,
                storageBucket: options.storageBucket,
                messagingSenderId: options.messagingSenderId,
                clientId: options.clientId,
              },
              { name: SECONDARY_APP_NAME },
            );
            return { name: secondary.name, reused: false };
          })
        }
      />
      <AppButton
        title="getApp (secondary)"
        onPress={() =>
          run('getApp(secondary)', () => {
            const app = getApp(SECONDARY_APP_NAME);
            return { name: app.name, projectId: app.options.projectId };
          })
        }
      />
      <AppButton
        title="deleteApp (secondary)"
        onPress={() =>
          run('deleteApp', async () => {
            const app = getApp(SECONDARY_APP_NAME);
            await deleteApp(app);
            return { deleted: SECONDARY_APP_NAME };
          })
        }
      />
      <AppButton
        title="automaticDataCollectionEnabled = true"
        onPress={() =>
          run('automaticDataCollectionEnabled', () => {
            const app = getApp();
            app.automaticDataCollectionEnabled = true;
            return { automaticDataCollectionEnabled: app.automaticDataCollectionEnabled };
          })
        }
      />

      <Text style={styles.section}>Logging</Text>
      <AppButton
        title="setLogLevel (warn)"
        onPress={() => run('setLogLevel', () => setLogLevel('warn'))}
      />
      <AppButton
        title="onLog (install)"
        onPress={() =>
          run('onLog', () => {
            onLog(
              ({ level, message, type }) => {
                // Handler installed; messages appear in Metro / device logs when SDKs log.
                void level;
                void message;
                void type;
              },
              { level: 'warn' },
            );
            return 'handler installed';
          })
        }
      />
      <AppButton
        title="onLog (clear)"
        onPress={() =>
          run('onLog(null)', () => {
            onLog(null);
            return 'handler cleared';
          })
        }
      />

      <Text style={styles.section}>Async Storage</Text>
      <AppButton
        title="setReactNativeAsyncStorage"
        onPress={() =>
          run('setReactNativeAsyncStorage', () => {
            setReactNativeAsyncStorage(memoryAsyncStorage);
            return 'memory Async Storage installed';
          })
        }
      />

      <Text style={styles.section}>Native meta / preferences</Text>
      <AppButton title="metaGetAll" onPress={() => run('metaGetAll', () => metaGetAll())} />
      <AppButton title="jsonGetAll" onPress={() => run('jsonGetAll', () => jsonGetAll())} />
      <AppButton
        title="preferencesSetBool"
        onPress={() =>
          run('preferencesSetBool', () => preferencesSetBool('expo_app_demo_flag', true))
        }
      />
      <AppButton
        title="preferencesSetString"
        onPress={() =>
          run('preferencesSetString', () =>
            preferencesSetString('expo_app_demo_label', 'invertase'),
          )
        }
      />
      <AppButton
        title="preferencesGetAll"
        onPress={() => run('preferencesGetAll', () => preferencesGetAll())}
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="preferencesClearAll — clears RN Firebase prefs"
          variant="secondary"
          onPress={() => run('preferencesClearAll', () => preferencesClearAll())}
        />
        <Text style={styles.warnText}>
          Warning: clears all React Native Firebase native preferences for this app.
        </Text>
      </View>

      <Text style={styles.section}>Utils</Text>
      <AppButton
        title="FilePath.PICTURES_DIRECTORY"
        onPress={() => run('FilePath', () => FilePath.PICTURES_DIRECTORY)}
      />
      <AppButton
        title="getUtils (appVersion / Test Lab)"
        onPress={() =>
          run('getUtils', () => {
            const utils = getUtils();
            return {
              appVersion: utils.appVersion ?? null,
              isRunningInTestLab: utils.isRunningInTestLab,
              playServicesAvailable: utils.playServicesAvailability.isAvailable,
            };
          })
        }
      />

      <Text style={styles.section}>Web-only (throws)</Text>
      <View style={styles.warnBlock}>
        <AppButton
          title="registerVersion() — throws"
          variant="secondary"
          onPress={() =>
            run('registerVersion', () => {
              registerVersion('test-expo', '1.0.0');
            })
          }
        />
        <Text style={styles.warnText}>
          Warning: `registerVersion` always throws on React Native Firebase (web only).
        </Text>
      </View>
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
  warnBlock: { gap: 6 },
  warnText: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
