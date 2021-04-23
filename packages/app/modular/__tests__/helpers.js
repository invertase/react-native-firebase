import FirebaseAppImpl from '../src/implementations/firebaseApp';
import { defaultAppName } from '../internal';

export function createFirebaseApp(name, config) {
  return new FirebaseAppImpl(name || defaultAppName, {}, config);
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
