import firebase from '@react-native-firebase/app';
import defaultExport, { firebase as firebaseFromModule } from '@react-native-firebase/in-app-messaging';

// checks module exists at root
console.log(firebase.inAppMessaging().app.name);
console.log(firebase.inAppMessaging().isMessagesDisplaySuppressed);

// checks module exists at app level
console.log(firebase.app().inAppMessaging().app.name);
console.log(firebase.app().inAppMessaging().isMessagesDisplaySuppressed);

// checks statics exist
console.log(firebase.inAppMessaging.SDK_VERSION);

// checks statics exist on defaultExport
console.log(defaultExport.SDK_VERSION);

// check module correctly exported
console.log(defaultExport().isMessagesDisplaySuppressed);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebaseFromModule.SDK_VERSION);

// checks multi-app support exists
// console.log(firebase.inAppMessaging(firebase.app()).app.name);

// checks default export supports app arg
// console.log(defaultExport(firebase.app()).app.name);
