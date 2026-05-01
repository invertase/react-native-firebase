// Import from package sources so root `yarn tsc:compile` does not require `packages/ml/dist`.
import ml, {
  firebase,
  getML,
  SDK_VERSION,
  type FirebaseApp,
  type FirebaseML,
  type FirebaseMLTypes,
} from './lib/index';

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

// modular public types
const modularInstance: FirebaseML = getML();
const modularWithNamedApp: FirebaseML = getML(firebase.app());
console.log(modularInstance.app.name);
console.log(modularWithNamedApp.app.name);

const namedApp: FirebaseApp = firebase.app();
console.log(getML(namedApp).app.name);

// named SDK_VERSION export
const sdkVersion: string = SDK_VERSION;
console.log(sdkVersion);

// deprecated namespace types remain assignable from runtime values
const namespaceModule: FirebaseMLTypes.Module = firebase.ml();
const namespaceStatics: FirebaseMLTypes.Statics = firebase.ml;
console.log(namespaceModule.app.name);
console.log(namespaceStatics.SDK_VERSION);
