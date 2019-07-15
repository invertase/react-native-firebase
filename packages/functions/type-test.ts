import firebase from '@react-native-firebase/app';
import defaultExport, { firebase as firebaseFromModule } from '@react-native-firebase/functions';

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
console.log(defaultExport.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebaseFromModule.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.functions(firebase.app()).app.name);

// checks default export supports app arg
console.log(defaultExport(firebase.app()).app.name);
