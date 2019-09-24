import firebase from '@react-native-firebase/app';
import * as iid from '@react-native-firebase/iid';

// checks module exists at root
console.log(firebase.iid().app.name);

// checks module exists at app level
console.log(firebase.app().iid().app.name);

// checks statics exist
console.log(firebase.iid.SDK_VERSION);

// checks statics exist on defaultExport
console.log(iid.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.iid(firebase.app()).app.name);
firebase
  .iid()
  .get()
  .then(str => str.length);
firebase
  .iid()
  .getToken('foo', 'bar')
  .then(str => str.length);
