import { useMemo, useState } from 'react';
import { Linking, Platform, StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  checkForUpdate,
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  signOutTester,
} from '@react-native-firebase/app-distribution';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function AppDistributionScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appDistribution = useMemo(() => getAppDistribution(), []);

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
    <ScreenChrome title="app-distribution" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the App Distribution usage page. JavaScript alert
        helpers are iOS-only and reject on Android and other platforms. There is no emulator and no
        connect*Emulator helper; App Distribution is not in yarn tests:emulator:start-ci. Type-only
        AppDistribution and AppDistributionRelease stay off this screen.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getAppDistribution"
        onPress={() =>
          run('getAppDistribution', () => {
            const instance = getAppDistribution();
            const sameDefaultApp = getAppDistribution(getApp());
            return {
              appName: instance.app.name,
              sameAsMemo: instance === appDistribution,
              sameAsGetApp: sameDefaultApp === instance,
              platform: Platform.OS,
            };
          })
        }
      />

      <Text style={styles.section}>Tester sign-in</Text>
      <Text style={styles.warning}>
        WARNING: isTesterSignedIn, signInTester, and signOutTester reject on non-iOS with "App
        Distribution is not supported on the PLATFORM platform" (PLATFORM is Platform.OS).
        signInTester may also reject with native code tester-sign-in-error.
      </Text>
      <AppButton
        title="isTesterSignedIn"
        onPress={() =>
          run('isTesterSignedIn', async () => ({
            signedIn: await isTesterSignedIn(appDistribution),
          }))
        }
      />
      <AppButton
        title="signInTester"
        onPress={() =>
          run('signInTester', async () => {
            await signInTester(appDistribution);
            return { signedIn: await isTesterSignedIn(appDistribution) };
          })
        }
      />
      <AppButton
        title="signOutTester"
        onPress={() =>
          run('signOutTester', async () => {
            await signOutTester(appDistribution);
            return { signedIn: await isTesterSignedIn(appDistribution) };
          })
        }
      />

      <Text style={styles.section}>Updates</Text>
      <Text style={styles.warning}>
        WARNING: checkForUpdate rejects on non-iOS. On iOS, no available release rejects with code
        checkupdate-null; other native failures use check-update-error. Needs a real device and the
        App Testers API enabled.
      </Text>
      <AppButton
        title="checkForUpdate"
        onPress={() =>
          run('checkForUpdate', async () => {
            const release = await checkForUpdate(appDistribution);
            return {
              displayVersion: release.displayVersion,
              buildVersion: release.buildVersion,
              releaseNotes: release.releaseNotes,
              isExpired: release.isExpired,
              downloadURL: release.downloadURL,
            };
          })
        }
      />
      <AppButton
        title="checkForUpdate then open downloadURL"
        onPress={() =>
          run('checkForUpdate+open', async () => {
            const release = await checkForUpdate(appDistribution);
            if (!release.isExpired) {
              await Linking.openURL(release.downloadURL);
            }
            return {
              opened: !release.isExpired,
              displayVersion: release.displayVersion,
              buildVersion: release.buildVersion,
            };
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
