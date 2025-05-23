// import firebase from '@react-native-firebase/app';
import firebase, { FirebaseAuthTypes, onAuthStateChanged, signInWithPhoneNumber} from '.';

console.log(firebase.default().currentUser);

// checks module exists at root
console.log(firebase.auth().app.name);
console.log(firebase.auth().currentUser);

// checks module exists at app level
console.log(firebase.app().auth().app.name);
console.log(firebase.app().auth().currentUser);

// checks statics exist
console.log(firebase.auth.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firebase.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebase.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.auth(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase.auth(firebase.app('foo')).app.name);

// Statics
console.log(firebase.auth.EmailAuthProvider.PROVIDER_ID);
console.log(firebase.auth.PhoneAuthProvider.PROVIDER_ID);
console.log(firebase.auth.GoogleAuthProvider.PROVIDER_ID);
console.log(firebase.auth.GithubAuthProvider.PROVIDER_ID);
console.log(firebase.auth.TwitterAuthProvider.PROVIDER_ID);
console.log(firebase.auth.FacebookAuthProvider.PROVIDER_ID);
console.log(firebase.auth.PhoneAuthState.CODE_SENT);

firebase.auth().onAuthStateChanged((user: FirebaseAuthTypes.User) => {
  if (user) {
    console.log(user.email);
    console.log(user.displayName);
  }
});

const u = firebase.auth().currentUser;
console.log(u ? u.displayName : '');
console.log(u ? u.email : '');
console.log(u ? u.toJSON() : '');

firebase.auth().signInAnonymously().then();

firebase.auth().signInWithEmailAndPassword('', '').then();

// Verify Modular API
onAuthStateChanged(firebase.auth(), user => console.log(user));
signInWithPhoneNumber(firebase.auth(), '+1234567890');
