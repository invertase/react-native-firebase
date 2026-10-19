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
const DELETE_DEMO_APP_NAME = 'EXPO_APP_DELETE_DEMO';

/** Clones the default app options so a secondary app can be created on demand. */
function secondaryAppOptions() {
  const options = getApp().options;
  return {
    appId: options.appId,
    projectId: options.projectId,
    apiKey: options.apiKey,
    databaseURL: options.databaseURL,
    storageBucket: options.storageBucket,
    messagingSenderId: options.messagingSenderId,
  };
}

const FILE_PATH_KEYS = [
  'MAIN_BUNDLE',
  'CACHES_DIRECTORY',
  'TEMP_DIRECTORY',
  'DOCUMENT_DIRECTORY',
  'LIBRARY_DIRECTORY',
  'EXTERNAL_DIRECTORY',
  'EXTERNAL_STORAGE_DIRECTORY',
  'PICTURES_DIRECTORY',
  'MOVIES_DIRECTORY',
] as const;

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
      <View style={styles.warnBlock}>
        <AppButton
          title="initializeApp (secondary)"
          onPress={() =>
            run('initializeApp', async () => {
              const existing = getApps().find(app => app.name === SECONDARY_APP_NAME);
              if (existing) {
                return { name: existing.name, reused: true };
              }
              const secondary = await initializeApp(secondaryAppOptions(), {
                name: SECONDARY_APP_NAME,
                automaticDataCollectionEnabled: true,
              });
              return { name: secondary.name, reused: false };
            })
          }
        />
        <Text style={styles.warnText}>
          Warning: rejects unless the default app options include all of apiKey, appId, databaseURL,
          messagingSenderId, projectId and storageBucket.
        </Text>
      </View>
      <View style={styles.warnBlock}>
        <AppButton
          title="getApp (secondary)"
          onPress={() =>
            run('getApp(secondary)', () => {
              const app = getApp(SECONDARY_APP_NAME);
              return { name: app.name, projectId: app.options.projectId };
            })
          }
        />
        <Text style={styles.warnText}>
          Warning: throws unless the secondary app exists. Run initializeApp (secondary) first.
        </Text>
      </View>
      <View style={styles.warnBlock}>
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
        <Text style={styles.warnText}>
          Warning: throws unless the secondary app exists, including after it has been deleted.
        </Text>
      </View>
      <View style={styles.warnBlock}>
        <AppButton
          title="app.delete() (separate demo app)"
          onPress={() =>
            run('app.delete', async () => {
              const existing = getApps().find(app => app.name === DELETE_DEMO_APP_NAME);
              const demoApp =
                existing ??
                (await initializeApp(secondaryAppOptions(), {
                  name: DELETE_DEMO_APP_NAME,
                  automaticDataCollectionEnabled: true,
                }));
              await demoApp.delete();
              return { deleted: DELETE_DEMO_APP_NAME };
            })
          }
        />
        <Text style={styles.warnText}>
          Creates a separate secondary app named {DELETE_DEMO_APP_NAME} on demand, then deletes it
          with app.delete(). The default app and {SECONDARY_APP_NAME} are not touched.
        </Text>
      </View>
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
      <Text style={styles.hint}>
        setLogLevel sets the JavaScript logger level (only AI Logic writes to it) and the iOS native
        SDK level. It has no effect on Android native logs. onLog receives JavaScript logger
        messages only. Levels: debug, verbose, info, warn, error ('silent' throws).
      </Text>
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
        title="FilePath (all constants)"
        onPress={() =>
          run('FilePath', () => {
            const paths: Record<string, string | null> = {};
            for (const key of FILE_PATH_KEYS) {
              paths[key] = FilePath[key];
            }
            return paths;
          })
        }
      />
      <AppButton
        title="getUtils (appVersion / Test Lab / Play Services)"
        onPress={() =>
          run('getUtils', async () => {
            const utils = getUtils();
            const playServices = await utils.getPlayServicesStatus();
            return {
              appVersion: utils.appVersion ?? null,
              isRunningInTestLab: utils.isRunningInTestLab,
              playServicesAvailable: playServices.isAvailable,
            };
          })
        }
      />
      <AppButton
        title="getPlayServicesStatus"
        onPress={() => run('getPlayServicesStatus', () => getUtils().getPlayServicesStatus())}
      />
      <View style={styles.warnBlock}>
        <AppButton
          title="promptForPlayServices — Android dialog"
          variant="secondary"
          onPress={() => run('promptForPlayServices', () => getUtils().promptForPlayServices())}
        />
        <Text style={styles.warnText}>
          Warning: Android only. May show a Google Play services dialog. Resolves without effect on
          iOS.
        </Text>
      </View>
      <View style={styles.warnBlock}>
        <AppButton
          title="makePlayServicesAvailable — may reject"
          variant="secondary"
          onPress={() =>
            run('makePlayServicesAvailable', () => getUtils().makePlayServicesAvailable())
          }
        />
        <Text style={styles.warnText}>
          Warning: Android only. May show a dialog and can reject with a NativeFirebaseError whose
          code is utils/unknown. Read error.message to tell cases apart. Resolves without effect on
          iOS.
        </Text>
      </View>
      <View style={styles.warnBlock}>
        <AppButton
          title="resolutionForPlayServices — Android intent"
          variant="secondary"
          onPress={() =>
            run('resolutionForPlayServices', () => getUtils().resolutionForPlayServices())
          }
        />
        <Text style={styles.warnText}>
          Warning: Android only. May start a system resolution screen. Resolves without effect on
          iOS.
        </Text>
      </View>

      <Text style={styles.section}>Unsupported (throws)</Text>
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
          Warning: `registerVersion` is not supported by React Native Firebase and always throws on
          every platform.
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
