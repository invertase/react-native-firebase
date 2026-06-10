/* eslint-disable react/react-in-jsx-scope */
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getPhoneNumberVerification,
  getVerificationSupportInfo,
  getVerifiedPhoneNumber,
  enableTestSession,
} from '@react-native-firebase/phone-number-verification';

export function PnvTestComponent() {
  const [status, setStatus] = useState('Ready');
  const [result, setResult] = useState(null);

  const pnv = getPhoneNumberVerification();

  const runTest = async (label, fn) => {
    setStatus(`Running: ${label}...`);
    setResult(null);
    try {
      const res = await fn();
      setStatus(`${label}: Success`);
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setStatus(`${label}: Error`);
      setResult(`${e.code || 'error'}: ${e.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Phone Number Verification</Text>
      <Text style={styles.status}>{status}</Text>

      <View style={styles.buttonRow}>
        <Button
          title="Check Support Info"
          onPress={() =>
            runTest('getVerificationSupportInfo', () => getVerificationSupportInfo(pnv))
          }
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Get Verified Phone Number"
          onPress={() =>
            runTest('getVerifiedPhoneNumber', () => getVerifiedPhoneNumber(pnv))
          }
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Enable Test Session (demo token)"
          onPress={() =>
            runTest('enableTestSession', () => enableTestSession(pnv, 'demo-test-token'))
          }
        />
      </View>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonRow: {
    marginBottom: 10,
  },
  resultBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
