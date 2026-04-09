/* eslint-disable no-console */
import React, { useState } from 'react';
import { Button, View, Text, ScrollView } from 'react-native';
import { getFirestore, doc, collection, refEqual } from '@react-native-firebase/firestore';

export function DocumentReferenceTestComponent() {
  const [result, setResult] = useState<string>('');

  const runChecks = async (): Promise<void> => {
    const lines: string[] = [];
    try {
      const firestore = getFirestore();

      const doc1a = doc(firestore, 'a/b');
      const doc1b = doc(collection(firestore, 'a'), 'b');
      const doc2 = doc(firestore, 'a/c');

      const equalSameDoc = refEqual(doc1a, doc1b);
      if (equalSameDoc) {
        lines.push('✓ refEqual(doc1a, doc1b) is true');
      } else {
        lines.push('✗ refEqual(doc1a, doc1b) expected true, got false');
      }

      const equalDiffDoc = refEqual(doc1a, doc2);
      if (!equalDiffDoc) {
        lines.push('✓ refEqual(doc1a, doc2) is false');
      } else {
        lines.push('✗ refEqual(doc1a, doc2) expected false, got true');
      }

      const doc1c = collection(firestore, 'a').withConverter({
        toFirestore: (data: Record<string, unknown>) => data,
        fromFirestore: (snap: { data: () => Record<string, unknown> }) => snap.data(),
      });
      try {
        refEqual(doc1a, doc1c);
        lines.push("✗ refEqual(doc1a, doc1c) should have thrown, didn't");
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('expected a DocumentReference instance')) {
          lines.push('✓ refEqual(doc1a, doc1c) threw expected error');
        } else {
          lines.push(`✗ refEqual(doc1a, doc1c) threw but wrong message: ${msg}`);
        }
      }

      setResult(lines.join('\n'));
      console.log(lines.join('\n'));
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setResult(`Error: ${err}`);
      console.error(e);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      <View style={{ height: 90 }} />
      <Button title="Check refEqual (doc vs collection.doc)" onPress={runChecks} />
      {result ? (
        <ScrollView style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>{result}</Text>
        </ScrollView>
      ) : null}
    </View>
  );
}
