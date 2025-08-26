/* eslint-disable react/react-in-jsx-scope */
import { Button } from 'react-native';

import { useState } from 'react';

// import your components from your local-tests jsx file here...
import { CrashTestComponent } from './crash-test';
import { AITestComponent } from './ai/ai';
import { DatabaseOnChildMovedTest } from './database';
import { FirestoreOnSnapshotInSyncTest } from './firestore/onSnapshotInSync';
import { VertexAITestComponent } from './vertexai/vertexai';

const testComponents = {
  // List your imported components here...
  'Crashlytics Test Crash': CrashTestComponent,
  'AI Generation Example': AITestComponent,
  'Database onChildMoved Test': DatabaseOnChildMovedTest,
  'Firestore onSnapshotInSync Test': FirestoreOnSnapshotInSyncTest,
  'VertexAI Generation Example': VertexAITestComponent,
};

export function TestComponents() {
  const [currentTestTitle, setCurrentTestTitle] = useState(undefined);

  if (currentTestTitle) {
    const CurrentTest = testComponents[currentTestTitle];
    return (
      <>
        <Button title={`Hide ${currentTestTitle}`} onPress={() => setCurrentTestTitle(undefined)} />
        <CurrentTest />
      </>
    );
  }

  return Object.keys(testComponents).map((testTitle, index) => {
    return (
      <Button
        key={index}
        title={`Show ${testTitle}`}
        onPress={() => setCurrentTestTitle(testTitle)}
      />
    );
  });
}
