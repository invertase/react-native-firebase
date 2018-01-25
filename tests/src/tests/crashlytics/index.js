import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import crashlyticsTests from './crashlyticsTests';

const suite = new TestSuite(
  'Crashlytics',
  'firebase.fabric.crashlytics()',
  firebase
);

// bootstrap tests
suite.addTests(crashlyticsTests);

export default suite;
