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

import React from 'react';
import { Button, Text, View } from 'react-native';

// import firebase, { utils } from '@react-native-firebase/app';
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  set,
  child,
  onChildMoved,
  connectDatabaseEmulator,
} from '@react-native-firebase/database';

export function DatabaseOnChildMovedTest() {
  // Defer connecting to the emulator until we display
  connectDatabaseEmulator(getDatabase(), '127.0.0.1', 9000);

  return (
    <View>
      <Text>text text text</Text>
      <Text>text text text</Text>
      <Button
        title="Run onChildMoved"
        onPress={async () => {
          const TEST_PATH = `tests/mytesty`;
          const dbRef = ref(getDatabase(), `${TEST_PATH}/childMoved`);
          const orderedRef = query(dbRef, orderByChild('nuggets'));
          console.log('11111');
          const initial = {
            alex: { nuggets: 60 },
            rob: { nuggets: 56 },
            vassili: { nuggets: 55.5 },
            tony: { nuggets: 52 },
            greg: { nuggets: 52 },
          };

          onChildMoved(
            orderedRef,
            $ => {
              console.log('onChildMoved', $.val());
            },
            { onlyOnce: true },
          );
          console.log('2222');
          await set(dbRef, initial);
          console.log('3333');
          let dbref2 = child(dbRef, 'greg/nuggets');
          console.log('dbref2', dbref2);
          await set(dbref2, 57);
          console.log('4444');
          await set(child(dbRef, 'rob/nuggets'), 61);
          console.log('5555');
        }}
      />
    </View>
  );
}
