import FirebaseAppImpl from '../src/implementations/firebaseApp';
import { defaultAppName } from '../src/common';

export function createFirebaseApp(name) {
  return new FirebaseAppImpl(name || defaultAppName, {}, false);
}

export function createFirebaseOptions() {
  return {
    apiKey: 'apiKey',
    appId: 'appId',
    databaseURL: 'databaseURL',
    messagingSenderId: 'messagingSenderId',
    projectId: 'projectId',
  };
}
