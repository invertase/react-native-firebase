import { Platform } from 'react-native';

import firebase from 'firebase';
import RNfirebase from './../firebase/firebase';

import DatabaseContents from './tests/support/DatabaseContents';

const config = {
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  authDomain: 'rnfirebase-b9ad4.firebaseapp.com',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
};

const android = {
  // firebase android sdk completely ignores client id
  clientId: '305229645282-j8ij0jev9ut24odmlk9i215pas808ugn.apps.googleusercontent.com',
  appId: '1:305229645282:android:efe37851d57e1d05',
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};


const ios = {
  clientId: '305229645282-22imndi01abc2p6esgtu1i1m9mqrd0ib.apps.googleusercontent.com',
  androidClientId: android.clientId,
  appId: '1:305229645282:ios:7b45748cb1117d2d',
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

const instances = {
  web: firebase.initializeApp(config),
  native: RNfirebase.app(),
  another: RNfirebase.initializeApp(Platform.OS === 'ios' ? ios : android, 'anotherApp'),
};

console.log('RNApps -->', RNfirebase.apps);

// natively initialized apps are already available at app run time,
// no need for ready checks
instances.native.auth().signInAnonymously().then((user) => {
  console.log('defaultApp user ->', user.toJSON());
});

// dynamically initialized apps need a ready check
instances.another.onReady().then((app) => {
  app.auth().signInAnonymously().then((user) => {
    console.log('anotherApp user ->', user.toJSON());
  });
});

instances.web.database().ref('tests/types').set(DatabaseContents.DEFAULT);

instances.web.database().ref('tests/priority').setWithPriority({
  foo: 'bar',
}, 666);

instances.web.database().ref('tests/query').set(DatabaseContents.QUERY);


// instances.native.messaging().subscribeToTopic('fcm_test');

export default instances;
