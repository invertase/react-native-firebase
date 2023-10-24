import firebase from '.';

// checks module exists at root
console.log(firebase.appDistribution().app.name);

// checks module exists at app level
console.log(firebase.app().appDistribution().app.name);

// checks statics exist
console.log(firebase.appDistribution.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.appDistribution(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase(firebase.app()).app.name);
