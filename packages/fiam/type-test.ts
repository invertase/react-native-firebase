import firebase from '@react-native-firebase/app';
import defaultExport, { firebase as firebaseFromModule } from '@react-native-firebase/fiam';

// checks module exists at root
console.log(firebase.fiam().app.name);
console.log(firebase.fiam().isMessagesDisplaySuppressed);

// checks module exists at app level
console.log(firebase.app().fiam().app.name);
console.log(firebase.app().fiam().isMessagesDisplaySuppressed);

// checks statics exist
console.log(firebase.fiam.SDK_VERSION);

// checks statics exist on defaultExport
console.log(defaultExport.SDK_VERSION);

// check module correctly exported
console.log(defaultExport().isMessagesDisplaySuppressed);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebaseFromModule.SDK_VERSION);

// checks multi-app support exists
// console.log(firebase.fiam(firebase.app()).app.name);

// checks default export supports app arg
// console.log(defaultExport(firebase.app()).app.name);
