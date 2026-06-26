import { getApp } from '@react-native-firebase/app';
import {
  getInstallations,
  deleteInstallations,
  getId,
  getToken,
  onIdChange,
  SDK_VERSION,
  type IdChangeCallbackFn,
  type IdChangeUnsubscribeFn,
  type Installations,
} from '.';

const modularInstallations1 = getInstallations();
console.log(modularInstallations1.app.name);

const modularInstallations2 = getInstallations(getApp());
console.log(modularInstallations2.app.name);

const modularInstallations3 = getInstallations(getApp('foo'));
console.log(modularInstallations3.app.name);

const typedInstallations: Installations = modularInstallations1;
console.log(typedInstallations.app.name);

getId(modularInstallations1).then((id: string) => {
  console.log(id);
});

getToken(modularInstallations1).then((token: string) => {
  console.log(token);
});

getToken(modularInstallations1, true).then((token: string) => {
  console.log(token);
});

deleteInstallations(modularInstallations1).then(() => {
  console.log('Modular installation deleted');
});

try {
  const onInstallationsIdChange: IdChangeCallbackFn = id => {
    console.log(id);
  };
  const unsubscribe: IdChangeUnsubscribeFn = onIdChange(
    modularInstallations1,
    onInstallationsIdChange,
  );
  unsubscribe();
} catch (error) {
  console.log('Modular onIdChange not supported');
}

const sdkVersion: string = SDK_VERSION;
console.log(sdkVersion);
