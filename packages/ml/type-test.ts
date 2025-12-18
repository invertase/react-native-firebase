import ml, { firebase, getML } from '.';

console.log(ml().app);

// checks module exists at root
console.log(firebase.ml().app.name);

// checks module exists at app level
console.log(firebase.app().ml().app.name);

// checks statics exist
console.log(firebase.ml.SDK_VERSION);

// checks statics exist on defaultExport
console.log(ml.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.ml(firebase.app()).app.name);

// checks default export supports app arg
console.log(ml(firebase.app()).app.name);

// checks Module instance APIs
const mlInstance = firebase.ml();
console.log(mlInstance.app.name);

// checks modular API functions
const modularML1 = getML();
console.log(modularML1.app.name);

const modularML2 = getML(firebase.app());
console.log(modularML2.app.name);
