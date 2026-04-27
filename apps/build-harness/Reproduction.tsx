import React, {useState} from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Transaction,
} from '@react-native-firebase/firestore';

type ReproCase = {
  name: string;
  status: 'compile-time' | 'runtime';
  detail: string;
};

const reproCases: ReproCase[] = [
  {
    name: 'DocumentSnapshot generic',
    status: 'compile-time',
    detail:
      'Validate whether DocumentSnapshot<DocumentData> is accepted in type positions.',
  },
  {
    name: 'DocumentReference generic',
    status: 'compile-time',
    detail:
      'Validate whether Transaction.update accepts DocumentReference<DocumentData, DocumentData>.',
  },
];

export function checkDocumentSnapshot(
  _snapshot: DocumentSnapshot<DocumentData>,
): void {}

export const checkTransactionReferenceArg: Parameters<
  Transaction['update']
>[0] = null as unknown as DocumentReference<DocumentData, DocumentData>;

function Reproduction(): React.JSX.Element {
  const [runtimeStatus, setRuntimeStatus] = useState<
    'idle' | 'running' | 'success' | 'error'
  >('idle');
  const [runtimeOutput, setRuntimeOutput] = useState<string>(
    'Tap "Run Firestore probe" to exercise a runtime API call in the harness app.',
  );
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#0f172a' : '#f8fafc';
  const cardColor = isDarkMode ? '#111827' : '#ffffff';
  const primaryText = isDarkMode ? '#f8fafc' : '#0f172a';
  const secondaryText = isDarkMode ? '#cbd5e1' : '#475569';

  const runFirestoreProbe = async (): Promise<void> => {
    setRuntimeStatus('running');

    try {
      const instance = firestore();
      const reference = instance
        .collection('buildHarnessManualProbe')
        .doc('runtime');

      const output = {
        appName: instance.app.name,
        documentId: reference.id,
        documentPath: reference.path,
        parentPath: reference.parent.path,
      };

      setRuntimeOutput(JSON.stringify(output, null, 2));
      setRuntimeStatus('success');
    } catch (error) {
      setRuntimeOutput(error instanceof Error ? error.message : String(error));
      setRuntimeStatus('error');
    }
  };

  const clearRuntimeOutput = (): void => {
    setRuntimeStatus('idle');
    setRuntimeOutput(
      'Tap "Run Firestore probe" to exercise a runtime API call in the harness app.',
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, {backgroundColor: cardColor}]}>
          <Text style={[styles.eyebrow, {color: secondaryText}]}>
            MANUAL API SANDBOX
          </Text>
          <Text style={[styles.title, {color: primaryText}]}>
            Firestore validation screen
          </Text>
          <Text style={[styles.body, {color: secondaryText}]}>
            Use this screen for focused package validation in the harness app.
            Add buttons, listeners, and output panes here when you want to
            exercise a runtime API manually in bare or Expo.
          </Text>
        </View>

        <View style={[styles.card, {backgroundColor: cardColor}]}>
          <Text style={[styles.sectionTitle, {color: primaryText}]}>
            Runtime probe
          </Text>
          <Text style={[styles.body, {color: secondaryText}]}>
            This example runs a small Firestore API probe without requiring a
            write. Replace it with package-specific actions for the issue you
            want to investigate.
          </Text>
          <View style={styles.buttonGroup}>
            <Button
              title={
                runtimeStatus === 'running'
                  ? 'Running Firestore probe...'
                  : 'Run Firestore probe'
              }
              onPress={() => {
                void runFirestoreProbe();
              }}
              disabled={runtimeStatus === 'running'}
            />
            <Button title="Clear output" onPress={clearRuntimeOutput} />
          </View>
          <Text style={[styles.rowLabel, {color: secondaryText}]}>Status</Text>
          <Text
            style={[
              styles.rowValue,
              {
                color:
                  runtimeStatus === 'success'
                    ? '#16a34a'
                    : runtimeStatus === 'error'
                    ? '#dc2626'
                    : runtimeStatus === 'running'
                    ? '#ca8a04'
                    : primaryText,
              },
            ]}>
            {runtimeStatus}
          </Text>
          <Text style={[styles.rowLabel, {color: secondaryText}]}>Output</Text>
          <Text style={[styles.output, {color: primaryText}]}>
            {runtimeOutput}
          </Text>
        </View>

        <View style={[styles.card, {backgroundColor: cardColor}]}>
          <Text style={[styles.sectionTitle, {color: primaryText}]}>
            Type-surface checks
          </Text>
          <Text style={[styles.body, {color: secondaryText}]}>
            Keep compile-time probes here when the issue is about TypeScript
            declarations rather than runtime behavior. The real signal is still
            `yarn typecheck`.
          </Text>
          {reproCases.map(reproCase => (
            <View key={reproCase.name} style={styles.caseRow}>
              <View style={styles.caseText}>
                <Text style={[styles.caseName, {color: primaryText}]}>
                  {reproCase.name}
                </Text>
                <Text style={[styles.caseDetail, {color: secondaryText}]}>
                  {reproCase.detail}
                </Text>
              </View>
              <Text style={[styles.caseStatus, {color: '#ca8a04'}]}>
                {reproCase.status}
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
  buttonGroup: {
    gap: 12,
    marginTop: 12,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  rowValue: {
    fontSize: 16,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  output: {
    fontFamily: Platform.select({ios: 'Courier', default: 'monospace'}),
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  caseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  caseText: {
    flex: 1,
    gap: 4,
  },
  caseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  caseDetail: {
    fontSize: 14,
    lineHeight: 20,
  },
  caseStatus: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

// Keep this screen aligned with apps/build-harness-expo/Reproduction.tsx.
export default Reproduction;
