import firebase from '.';

// TODO none of these seem to work, local issue?

// checks module exists at root
console.log(firebase.appCheck().app.name);

// checks module exists at app level
console.log(firebase.app().appCheck().app.name);

// checks statics exist
console.log(firebase.appCheck.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.appCheck(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase(firebase.app()).app.name);
