/* eslint-disable react/react-in-jsx-scope */
/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Button } from 'react-native';

import { useState } from 'react';

// import your components from your local-tests jsx file here...
import { CrashTestComponent } from './crash-test';
import { AITestComponent } from './ai/ai';
import { DatabaseOnChildMovedTest } from './database';
import { FirestoreOnSnapshotInSyncTest } from './firestore/onSnapshotInSync';
import { VertexAITestComponent } from './vertexai/vertexai';
import { AuthTOTPDemonstrator } from './auth/auth-totp-demonstrator';

const testComponents = {
  // List your imported components here...
  'Crashlytics Test Crash': CrashTestComponent,
  'AI Generation Example': AITestComponent,
  'Database onChildMoved Test': DatabaseOnChildMovedTest,
  'Firestore onSnapshotInSync Test': FirestoreOnSnapshotInSyncTest,
  'VertexAI Generation Example': VertexAITestComponent,
  'Auth TOTP Demonstrator': AuthTOTPDemonstrator,
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
