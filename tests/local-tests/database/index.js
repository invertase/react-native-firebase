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
