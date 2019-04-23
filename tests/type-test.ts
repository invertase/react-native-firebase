import '@react-native-firebase/storage';
import '@react-native-firebase/perf';
import '@react-native-firebase/functions';

import { firebase } from '@react-native-firebase/analytics';

const foo = async () => {
  firebase.storage.TaskState.CANCELLED;
  firebase.storage.TaskEvent.STATE_CHANGED;
  firebase.perf().newHttpMetric('', 'GET');
  // firebase.functions.HttpsErrorCode.ABORTED;
};

foo();
