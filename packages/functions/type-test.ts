import firebase from '@react-native-firebase/app';
import * as functions from '@react-native-firebase/functions';
// tslint:disable-next-line:no-duplicate-imports
import functionsExport from '@react-native-firebase/functions';

console.log(functionsExport().app);

// checks module exists at root
console.log(firebase.functions().app.name);

// checks module exists at app level
console.log(firebase.app().functions().app.name);

// app level module accepts string arg
console.log(firebase.app().functions('some-string').app.name);
console.log(
  firebase
    .app()
    .functions('some-string')
    .httpsCallable('foo'),
);

// checks statics exist
console.log(firebase.functions.SDK_VERSION);

// checks statics exist on defaultExport
console.log(functions.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.functions(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase.functions(firebase.app('foo')).app.name);

console.log(firebase.functions.HttpsErrorCode.ABORTED);

firebase
  .functions()
  .httpsCallable('foo')(123)
  .then(result => {
    console.log(result.data);
  })
  .catch(error => {
    console.log(error.code);
    console.log(error.details);
  });

firebase.functions().useFunctionsEmulator('123');
