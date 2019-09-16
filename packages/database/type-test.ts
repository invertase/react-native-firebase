import firebase from '@react-native-firebase/app';
import * as database from '@react-native-firebase/database';

// checks module exists at root
console.log(firebase.database().app.name);
console.log(firebase.database().ref('foo/bar'));

// checks module exists at app level
console.log(firebase.app().database().app.name);

// check module accepts a string arg
console.log(firebase.app().database('some-string').app.name);

// checks statics exist
console.log(firebase.database.SDK_VERSION);

// checks statics exist on defaultExport
console.log(database.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(database.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.database(firebase.app()).app.name);

// checks default export supports app arg
console.log(database.firebase(firebase.app('foo')).app.name);

console.log(database.ServerValue.TIMESTAMP);

console.log(
  firebase
    .app()
    .database()
    .ref('foo/bar'),
);

firebase
  .database()
  .ref('foo')
  .push({
    foo: 'bar',
  });

firebase
  .database()
  .goOnline()
  .then();

const r = firebase.database().ref('foo');
r.child('foo')
  .update({ foo: 'bar' }, () => {})
  .then();

r.once('value').then(ds => {
  console.log(ds.exists());
  console.log(ds.forEach);
  console.log(ds.val());
  console.log(ds.hasChildren());
  console.log(ds.hasChild('foo'));
  console.log(ds.getPriority());
});
