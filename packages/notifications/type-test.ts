import firebase from '@react-native-firebase/app';
import defaultExport, {
  firebase as firebaseFromModule,
  AndroidColor,
} from '@react-native-firebase/notifications';

// checks module exists at root
console.log(firebase.notifications().app.name);

// checks module exists at app level
console.log(firebase.app().notifications().app.name);

// checks statics exist
console.log(firebase.notifications.SDK_VERSION);

// checks statics exist on defaultExport
console.log(defaultExport.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebaseFromModule.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.notifications(firebase.app()).app.name);

// checks default export supports app arg
console.log(defaultExport(firebase.app()).app.name);

console.log(firebase.notifications.AndroidColor.AQUA);
console.log(AndroidColor.AQUA);
