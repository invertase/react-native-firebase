import firebase from '@react-native-firebase/app';
import defaultExport, { firebase as firebaseFromModule } from '@react-native-firebase/crashlytics';

// checks module exists at root
console.log(firebase.crashlytics().app.name);
console.log(firebase.crashlytics().isCrashlyticsCollectionEnabled);

// checks module exists at app level
console.log(firebase.app().crashlytics().app.name);
console.log(firebase.app().crashlytics().isCrashlyticsCollectionEnabled);

// checks statics exist
console.log(firebase.crashlytics.SDK_VERSION);

// checks statics exist on defaultExport
console.log(defaultExport.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebaseFromModule.SDK_VERSION);

// checks multi-app support exists
// console.log(firebase.crashlytics(firebase.app()).app.name);

// checks default export supports app arg
// console.log(defaultExport(firebase.app()).app.name);
