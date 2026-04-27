import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import ai from '@react-native-firebase/ai';
import analytics from '@react-native-firebase/analytics';
import firebaseAppRoot, {getApp} from '@react-native-firebase/app';
import appCheck from '@react-native-firebase/app-check';
import appDistribution from '@react-native-firebase/app-distribution';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import installations from '@react-native-firebase/installations';
import messaging from '@react-native-firebase/messaging';
import ml from '@react-native-firebase/ml';
import perf from '@react-native-firebase/perf';
import remoteConfig from '@react-native-firebase/remote-config';
import storage from '@react-native-firebase/storage';

type ModuleCheck = {
  name: string;
  loaded: boolean;
};

const moduleChecks: ModuleCheck[] = [
  {name: 'app', loaded: typeof firebaseAppRoot.app === 'function'},
  {name: 'ai', loaded: typeof ai === 'function'},
  {name: 'analytics', loaded: typeof analytics === 'function'},
  {name: 'app-check', loaded: typeof appCheck === 'function'},
  {name: 'app-distribution', loaded: typeof appDistribution === 'function'},
  {name: 'auth', loaded: typeof auth === 'function'},
  {name: 'crashlytics', loaded: typeof crashlytics === 'function'},
  {name: 'database', loaded: typeof database === 'function'},
  {name: 'firestore', loaded: typeof firestore === 'function'},
  {name: 'functions', loaded: typeof functions === 'function'},
  {name: 'in-app-messaging', loaded: typeof inAppMessaging === 'function'},
  {name: 'installations', loaded: typeof installations === 'function'},
  {name: 'messaging', loaded: typeof messaging === 'function'},
  {name: 'ml', loaded: typeof ml === 'function'},
  {name: 'perf', loaded: typeof perf === 'function'},
  {name: 'remote-config', loaded: typeof remoteConfig === 'function'},
  {name: 'storage', loaded: typeof storage === 'function'},
];

function HarnessHomeScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardColor = isDarkMode ? '#111827' : '#ffffff';
  const primaryText = isDarkMode ? '#f8fafc' : '#0f172a';
  const secondaryText = isDarkMode ? '#cbd5e1' : '#475569';
  let appName = 'Unavailable';
  let projectId = 'Missing';
  let appId = 'Missing';
  let firebaseAppError: string | undefined;

  try {
    const firebaseApp = getApp();
    appName = firebaseApp.name;
    projectId = firebaseApp.options.projectId ?? 'Missing';
    appId = firebaseApp.options.appId ?? 'Missing';
  } catch (error) {
    firebaseAppError = error instanceof Error ? error.message : String(error);
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, {backgroundColor: cardColor}]}>
          <Text style={[styles.eyebrow, {color: secondaryText}]}>
            RNFB EXPO HARNESS
          </Text>
          <Text style={[styles.title, {color: primaryText}]}>
            Expo development-build smoke app
          </Text>
          <Text style={[styles.body, {color: secondaryText}]}>
            Run `yarn app:expo:sync` before `yarn app:ios:expo` or
            `yarn app:android:expo` after changing Firebase files or dependency
            overrides.
          </Text>
        </View>

        <View style={[styles.card, {backgroundColor: cardColor}]}>
          <Text style={[styles.sectionTitle, {color: primaryText}]}>
            Firebase app state
          </Text>
          <Text style={[styles.rowLabel, {color: secondaryText}]}>
            App name
          </Text>
          <Text style={[styles.rowValue, {color: primaryText}]}>{appName}</Text>
          <Text style={[styles.rowLabel, {color: secondaryText}]}>
            Project ID
          </Text>
          <Text style={[styles.rowValue, {color: primaryText}]}>
            {projectId}
          </Text>
          <Text style={[styles.rowLabel, {color: secondaryText}]}>App ID</Text>
          <Text style={[styles.rowValue, {color: primaryText}]}>{appId}</Text>
          {firebaseAppError ? (
            <>
              <Text style={[styles.rowLabel, {color: secondaryText}]}>
                Initialization error
              </Text>
              <Text style={[styles.errorText, {color: '#dc2626'}]}>
                {firebaseAppError}
              </Text>
            </>
          ) : null}
        </View>

        <View style={[styles.card, {backgroundColor: cardColor}]}>
          <Text style={[styles.sectionTitle, {color: primaryText}]}>
            Module imports
          </Text>
          <Text style={[styles.body, {color: secondaryText}]}>
            These checks confirm the Expo JavaScript layer resolves RNFB
            packages. Use the generated native projects to verify config plugin
            output and runtime behavior.
          </Text>
          {moduleChecks.map(moduleCheck => (
            <View key={moduleCheck.name} style={styles.moduleRow}>
              <Text style={[styles.moduleName, {color: primaryText}]}>
                {moduleCheck.name}
              </Text>
              <Text
                style={[
                  styles.moduleStatus,
                  {color: moduleCheck.loaded ? '#16a34a' : '#dc2626'},
                ]}>
                {moduleCheck.loaded ? 'ready' : 'missing'}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  rowValue: {
    fontSize: 16,
    marginTop: 2,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  moduleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  moduleName: {
    fontSize: 16,
  },
  moduleStatus: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default HarnessHomeScreen;
