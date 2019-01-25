import firebase from 'react-native-firebase';
import analytics, { Analytics } from '@react-native-firebase/analytics';
import functions, {
  firebase as boopy,
  Functions,
  HttpsErrorCode,
} from '@react-native-firebase/functions';

firebase.app;
boopy.apps[0].options.projectId;
analytics.SDK_VERSION;
functions.SDK_VERSION;
const httpsCallable = firebase.functions(firebase.app()).httpsCallable('foo');
functions;

httpsCallable({ foo: 1 })
  .then(result => {
    result.data;
  })
  .catch((error: Functions.HttpsError) => {
    const foo = {} as Analytics.Module;
    error.details;
    foo.logEvent('shoopy', {});
    HttpsErrorCode.NOT_FOUND;
  });
