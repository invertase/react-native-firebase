/* eslint-disable react/react-in-jsx-scope */
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getApp, SDK_VERSION } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getDatabase } from '@react-native-firebase/database';
import { getFunctions } from '@react-native-firebase/functions';
import { getStorage } from '@react-native-firebase/storage';
import { getCrashlytics, setAttribute } from '@react-native-firebase/crashlytics';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { getRemoteConfig } from '@react-native-firebase/remote-config';
import { getInstallations } from '@react-native-firebase/installations';
import { getPerformance } from '@react-native-firebase/perf';

const MODULES_TO_CHECK = [
  { name: 'App', check: () => getApp().name },
  { name: 'Auth', check: () => getAuth().app.name },
  { name: 'Firestore', check: () => getFirestore().app.name },
  { name: 'Database', check: () => getDatabase().app.name },
  { name: 'Functions', check: () => getFunctions().app.name },
  { name: 'Storage', check: () => getStorage().app.name },
  { name: 'Crashlytics', check: () => getCrashlytics().app.name },
  { name: 'Analytics', check: () => getAnalytics().app.name },
  { name: 'RemoteConfig', check: () => getRemoteConfig().app.name },
  { name: 'Installations', check: () => getInstallations().app.name },
  { name: 'Perf', check: () => getPerformance().app.name },
];

export function SPMVerificationComponent() {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const runVerification = async () => {
    setRunning(true);
    const moduleResults = [];

    const sdkVersion = SDK_VERSION;

    for (const mod of MODULES_TO_CHECK) {
      try {
        const result = mod.check();
        moduleResults.push({ name: mod.name, status: 'OK', detail: String(result) });
      } catch (e) {
        moduleResults.push({ name: mod.name, status: 'FAIL', detail: e.message });
      }
    }

    // Verify app options are populated (proves native initialization worked)
    try {
      const app = getApp();
      const opts = app.options;
      moduleResults.push({
        name: 'App Options',
        status: opts.appId ? 'OK' : 'FAIL',
        detail: opts.appId ? `appId: ${opts.appId.substring(0, 15)}...` : 'No appId',
      });
    } catch (e) {
      moduleResults.push({ name: 'App Options', status: 'FAIL', detail: e.message });
    }

    // Verify Crashlytics setAttribute (proves native bridge works)
    try {
      await setAttribute(getCrashlytics(), 'spm_test', 'true');
      moduleResults.push({ name: 'Crashlytics setAttribute', status: 'OK', detail: 'Set OK' });
    } catch (e) {
      moduleResults.push({ name: 'Crashlytics setAttribute', status: 'FAIL', detail: e.message });
    }

    // Verify Analytics logEvent (proves native bridge works)
    try {
      await logEvent(getAnalytics(), 'spm_verification_test', { timestamp: Date.now() });
      moduleResults.push({ name: 'Analytics logEvent', status: 'OK', detail: 'Logged OK' });
    } catch (e) {
      moduleResults.push({ name: 'Analytics logEvent', status: 'FAIL', detail: e.message });
    }

    const passed = moduleResults.filter(r => r.status === 'OK').length;
    const failed = moduleResults.filter(r => r.status === 'FAIL').length;

    setResults({ sdkVersion, modules: moduleResults, passed, failed });
    setRunning(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SPM Dependency Verification</Text>
      <Text style={styles.subtitle}>
        Verifies all Firebase native modules are loaded and functional.
      </Text>

      <Button
        title={running ? 'Running...' : 'Run SPM Verification'}
        onPress={runVerification}
        disabled={running}
      />

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sdkVersion}>Firebase SDK: {results.sdkVersion}</Text>
          <Text style={[styles.summary, results.failed > 0 ? styles.fail : styles.pass]}>
            {results.passed}/{results.passed + results.failed} modules OK
            {results.failed > 0 ? ` — ${results.failed} FAILED` : ' — All Passed'}
          </Text>

          {results.modules.map((mod, i) => (
            <View key={i} style={styles.row}>
              <Text style={mod.status === 'OK' ? styles.pass : styles.fail}>
                {mod.status === 'OK' ? '✅' : '❌'} {mod.name}
              </Text>
              <Text style={styles.detail}>{mod.detail}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 12 },
  resultsContainer: { marginTop: 12 },
  sdkVersion: { fontSize: 14, textAlign: 'center', marginBottom: 8, color: '#333' },
  summary: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  row: { paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  detail: { fontSize: 11, color: '#888', marginLeft: 28 },
  pass: { color: 'green' },
  fail: { color: 'red' },
});
