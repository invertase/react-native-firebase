import { getApp } from '@react-native-firebase/app';
import { getML, SDK_VERSION, type FirebaseApp, type FirebaseML } from '.';

// modular API functions
const modularML1 = getML();
console.log(modularML1.app.name);

const modularML2 = getML(getApp());
console.log(modularML2.app.name);

// modular public types
const modularInstance: FirebaseML = getML();
const modularWithNamedApp: FirebaseML = getML(getApp());
console.log(modularInstance.app.name);
console.log(modularWithNamedApp.app.name);

const namedApp: FirebaseApp = getApp();
console.log(getML(namedApp).app.name);

// named SDK_VERSION export
const sdkVersion: string = SDK_VERSION;
console.log(sdkVersion);
