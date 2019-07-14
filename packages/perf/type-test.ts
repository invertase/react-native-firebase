import firebase from '@react-native-firebase/app';
import { firebase as firebaseFromModule } from '@react-native-firebase/perf';

// checks module exists at root
console.log(firebase.perf().app.name);

// checks module exists at app level
console.log(firebase.app().perf().app.name);

// checks statics exist
console.log(firebase.perf.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebaseFromModule.SDK_VERSION);
