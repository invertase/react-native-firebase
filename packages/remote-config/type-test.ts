import firebase from '@react-native-firebase/app';
import * as config from '@react-native-firebase/remote-config';

console.log(config.default().app);

// checks module exists at root
console.log(firebase.remoteConfig().app.name);

// checks module exists at app level
console.log(firebase.app().remoteConfig().app.name);

// checks statics exist
console.log(firebase.remoteConfig.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(config.firebase.SDK_VERSION);

console.log(firebase.remoteConfig().lastFetchStatus);
console.log(firebase.remoteConfig().fetchTimeMillis);


const value = firebase.remoteConfig().getValue('example');

// checks methods exist on RemoteConfigValue
console.log(value.asBoolean());
console.log(value.asNumber());
console.log(value.asString());
console.log(value.getSource());


firebase
  .remoteConfig()
  .fetch()
  .then();
firebase
  .remoteConfig()
  .fetch(123)
  .then();
firebase.remoteConfig().getAll();
firebase.remoteConfig().reset().then;
firebase.remoteConfig().activate().then;
firebase.remoteConfig().fetchAndActivate().then;
firebase.remoteConfig().setConfigSettings({}).then;
firebase.remoteConfig().ensureInitialized().then;
firebase.remoteConfig().setDefaults({}).then;
