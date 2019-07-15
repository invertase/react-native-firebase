import firebase from '@react-native-firebase/app';
import defaultExport, { firebase as firebaseFromModule } from '@react-native-firebase/auth';

// checks module exists at root
console.log(firebase.auth().app.name);
console.log(firebase.auth().currentUser);

// checks module exists at app level
console.log(firebase.app().auth().app.name);
console.log(firebase.app().auth().currentUser);

// checks statics exist
console.log(firebase.auth.SDK_VERSION);

// checks statics exist on defaultExport
console.log(defaultExport.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebaseFromModule.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.auth(firebase.app()).app.name);

// checks default export supports app arg
console.log(defaultExport(firebase.app()).app.name);
