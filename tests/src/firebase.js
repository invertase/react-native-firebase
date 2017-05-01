import firebase from 'firebase';
import RNfirebase from './../../';

import DatabaseContents from './tests/support/DatabaseContents';

const config = {
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  authDomain: 'rnfirebase-b9ad4.firebaseapp.com',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
};

const instances = {
  web: firebase.initializeApp(config),
  native: RNfirebase.initializeApp({
    debug: __DEV__ ? '*' : false,
    errorOnMissingPlayServices: false,
    persistence: true,
  }),
};

instances.web.database().ref('tests/types').set(DatabaseContents.DEFAULT);

instances.web.database().ref('tests/priority').setWithPriority({
  foo: 'bar',
}, 666);


// instances.native.messaging().subscribeToTopic('fcm_test');

export default instances;
