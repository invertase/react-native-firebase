import firebase from '.';

console.log(firebase.default().app);

// checks module exists at root
console.log(firebase.ml().app.name);

// checks module exists at app level
console.log(firebase.app().ml().app.name);

// checks statics exist
console.log(firebase.ml.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(firebase.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.ml(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase.ml(firebase.app('foo')).app.name);
